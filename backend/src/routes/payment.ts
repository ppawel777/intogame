/// <reference path="../types/yookassa.d.ts" />
import express from 'express';
import YooKassa from 'yookassa';
import { supabaseAdmin } from '../lib/supabase';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { CANCELLATION_REASONS } from './utils/payment_utils';
import { createLogger } from './utils/logger';

dotenv.config();

const router = express.Router();

const getPricePerPlayer = (gamePrice?: number | null, playersMin?: number | null) => {
  if (!gamePrice || !playersMin || playersMin <= 0) return null;
  return Math.ceil(gamePrice / playersMin);
};

const getConfig = () => {
  const shopId = process.env.YOOKASSA_SHOP_ID || '';
  const secretKey = process.env.YOOKASSA_SECRET_KEY || '';
  const frontendUrl = process.env.FRONTEND_URL || 'https://localhost:5173';
  return { shopId, secretKey, frontendUrl };
};

const getClient = () => {
  const { shopId, secretKey } = getConfig();
  return new YooKassa({ shopId, secretKey });
};

// POST /api/create-payment
router.post('/create-payment', async (req, res) => {
  const logger = createLogger('create-payment');
  try {
    const { shopId, secretKey, frontendUrl } = getConfig();

    if (!shopId || !secretKey) {
      logger.error('Не настроены учетные данные YooKassa');
      return res.status(500).json({ error: 'Сервис оплаты временно недоступен' });
    }

    const {
      amount,
      description = 'Оплата участия в игре',
      returnUrl,
      metadata = {},
    } = req.body || {};

    // Проверка суммы
    if (!amount || Number.isNaN(Number(amount))) {
      logger.warn('Передана некорректная сумма:', { amount });
      return res.status(400).json({ error: 'Указана некорректная сумма' });
    }

    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    const value = numericAmount.toFixed(2);

    // URL возврата
    const confirmationReturnUrl =
      typeof returnUrl === 'string' && returnUrl.trim().length > 0
        ? returnUrl.trim()
        : `${frontendUrl}/games/reserved`;

    // Поиск голосования (если есть metadata)
    let voteId: string | null = null;
    let quantity: number = 1;
    let gameId: string | null = null;
    let userId: string | null = null;

    if (metadata?.userId && metadata?.gameId) {
      userId = String(metadata.userId);
      gameId = String(metadata.gameId);

      const { data: voteData, error } = await supabaseAdmin
        .from('votes')
        .select('id, quantity, game_id, user_id')
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .eq('status', 'pending')
        .maybeSingle();

      if (error) {
        return res.status(500).json({ error: 'Ошибка при поиске голоса' });
      }

      if (!voteData) {
        logger.warn('Голос не найден или не в статусе pending:', { userId, gameId });
        return res.status(404).json({
          error: 'Запись для оплаты не найдена',
          details: 'Срок бронирования истёк. Пожалуйста, запишитесь на игру снова.',
        });
      }

      voteId = String(voteData.id)
      quantity = voteData.quantity || 1;
      gameId = voteData.game_id;
      userId = voteData.user_id;
    }

    if (!voteId) {
      return res.status(400).json({ error: 'Не удалось определить запись для оплаты' });
    }

    // Получаем цену игры и рассчитываем взнос
    const { data: game, error: gameError } = await supabaseAdmin
      .from('games')
      .select('game_price, players_min')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      logger.error('Не удалось получить данные игры:', gameError);
      return res.status(500).json({ error: 'Не удалось получить данные игры' });
    }

    const pricePerPlayer = getPricePerPlayer(game.game_price, game.players_min);
    if (!pricePerPlayer) {
      logger.error('Не удалось вычислить цену за игрока', { game_price: game.game_price, players_min: game.players_min });
      return res.status(500).json({ error: 'Не удалось определить стоимость участия' });
    }

    const expectedAmount = pricePerPlayer * quantity;

    // Проверка соответствия суммы
    const tolerance = 0.01;
    if (Math.abs(numericAmount - expectedAmount) > tolerance) {
      logger.warn('Сумма не соответствует расчёту:', {
        received: numericAmount,
        expected: expectedAmount,
        pricePerPlayer,
        quantity,
      });
      return res.status(400).json({
        error: 'Неверная сумма платежа',
        details: `Ожидалось ${expectedAmount} ₽ за ${quantity} мест (${pricePerPlayer} ₽/место).`,
      });
    }

    // Получаем email пользователя из БД
    let userEmail: string | null = null;
    if (userId) {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('id', userId)
        .maybeSingle();

      if (userError) {
        logger.error('Ошибка получения email пользователя:', userError);
      } else if (userData?.email) {
        userEmail = userData.email;
      }
    }

    if (!userEmail) {
      logger.warn('Email пользователя не найден:', { userId });
      return res.status(400).json({ error: 'Не удалось получить email пользователя' });
    }

    // Создание платежа в YooKassa
    let yookassaPayment;
    try {
      yookassaPayment = await getClient().createPayment(
        {
          amount: { value, currency: 'RUB' },
          capture: true,
          description,
          confirmation: { type: 'redirect', return_url: confirmationReturnUrl },
          receipt: {
            customer: {
              email: userEmail,
            },
            items: [
              {
                description: description || 'Оплата участия в игре',
                quantity: String(quantity),
                amount: {
                  value,
                  currency: 'RUB',
                },
                vat_code: '1',
                payment_mode: 'full_payment',
                payment_subject: 'service',
              },
            ],
          },
          metadata: {
            ...metadata,
            vote_id: voteId,
          },
        },
        randomUUID()
      );
    } catch (err: any) {
      logger.error('Ошибка создания платежа в YooKassa:', err?.response?.data || err.message);
      return res.status(502).json({
        error: 'Не удалось создать платёж',
        детали: err?.response?.data || err.message,
      });
    }

    const confirmationUrl = yookassaPayment?.confirmation?.confirmation_url;
    if (!confirmationUrl) {
      return res.status(502).json({ error: 'Не удалось получить ссылку для оплаты' });
    }

    // Сохраняем платёж в таблицу payments
    if (voteId) {
    const { error: paymentInsertError } = await supabaseAdmin.from('payments').insert({
      id: yookassaPayment.id,
      vote_id: voteId,
      amount: numericAmount,
      currency: 'RUB',
      status: yookassaPayment.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (paymentInsertError) {
      logger.error('Ошибка сохранения платежа в БД:', paymentInsertError);
    }
  }
    return res.status(200).json({
      paymentId: yookassaPayment.id,
      status: yookassaPayment.status,
      paid: yookassaPayment.paid,
      confirmationUrl,
      quantity,
      pricePerPlayer,
    });

  } catch (error: any) {
    logger.error('Внутренняя ошибка', error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// POST /api/yookassa/webhook — прописывается в настройках ЮKassa
router.post('/yookassa/webhook', async (req, res) => {
  const logger = createLogger('webhook');
  try {
    const webhookLogin = process.env.YOOKASSA_WEBHOOK_LOGIN;
    const webhookPassword = process.env.YOOKASSA_WEBHOOK_PASSWORD;

    if (webhookLogin && webhookPassword) {
      const authHeader = req.headers['authorization'] as string | undefined;
      const expectedAuth = 'Basic ' + Buffer.from(`${webhookLogin}:${webhookPassword}`).toString('base64');

      if (!authHeader || authHeader !== expectedAuth) {
        return res.status(401).json({ error: 'Неавторизованный доступ' });
      }
    }

    const payment = req.body?.object || req.body?.payment || req.body;
    const paymentId = payment?.id as string | undefined;

    if (!paymentId) {
      return res.status(200).json({ received: true });
    }

    // Извлекаем данные платежа
    const status = payment.status;
    const amountValue = parseFloat(payment.amount?.value || '0');
    const currency = payment.amount?.currency || 'RUB';
    const metadata = payment?.metadata || {};
    const voteIdFromMeta = metadata.vote_id;

    // Определяем vote_id
    let voteId: string | null = null;

    if (voteIdFromMeta) {
      voteId = String(voteIdFromMeta);
    } else {
      const { data: existingPayment } = await supabaseAdmin
        .from('payments')
        .select('vote_id')
        .eq('id', paymentId)
        .maybeSingle();

      if (existingPayment?.vote_id) {
        voteId = String(existingPayment.vote_id);
      }
    }

    // Извлечение payment_method и card_last4
    const pm = payment.payment_method;
    let paymentMethodType: string | null = null;
    let cardLast4: string | null = null;

    if (pm) {
      paymentMethodType = pm.type;

      // Если это карта — извлекаем последние 4 цифры
      if (pm.type === 'card' && pm.card?.number_masked) {
        const last4Match = pm.card.number_masked.match(/\d{4}$/);
        if (last4Match) {
          cardLast4 = last4Match[0];
        }
      }
      else if (pm.type === 'apple_pay' || pm.type === 'google_pay') {
        cardLast4 = null;
      }
    }

    // Обработка события
    if (status === 'succeeded') {
      const { error } = await supabaseAdmin.from('payments').upsert(
        {
          id: paymentId,
          vote_id: voteId,
          amount: amountValue,
          currency,
          status: 'succeeded',
          payment_method: paymentMethodType,
          card_last4: cardLast4,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (error) {
        logger.error('Ошибка обновления payments (succeeded):', error);
      }
    }

    if (status === 'canceled') {
      const reasonCode = payment.cancellation_details?.reason || 'unknown';
      const userMessage =
        CANCELLATION_REASONS[reasonCode as keyof typeof CANCELLATION_REASONS] || CANCELLATION_REASONS.unknown;

      const { error } = await supabaseAdmin.from('payments').upsert(
        {
          id: paymentId,
          vote_id: voteId,
          amount: amountValue,
          currency,
          status: 'canceled',
          payment_method: paymentMethodType,
          card_last4: cardLast4,
          canceled_at: new Date().toISOString(),
          cancellation_reason_code: reasonCode,
          cancellation_reason_message: userMessage,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (error) {
        logger.error('Ошибка обновления payments (canceled):', error);
      }
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    logger.error('Внутренняя ошибка:', error);
    return res.status(200).json({ received: true });
  }
});

// Вспомогательная функция для парсинга суммы
const parseAmountValue = (val: string | number | undefined): number => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  return NaN;
};

// POST /api/refund-payment
router.post('/refund-payment', async (req, res) => {
  const logger = createLogger('refund-payment');
  try {
    const { paymentId, amount } = req.body || {};

    const normalizedPaymentId: string | undefined =
      typeof paymentId === 'string'
        ? paymentId.trim()
        : (paymentId && typeof paymentId === 'object' && typeof (paymentId as any).payment_id === 'string')
          ? (paymentId as any).payment_id.trim()
          : undefined;

    if (!normalizedPaymentId) {
      logger.error('Не указан paymentId или он имеет неверный формат');
      return res.status(400).json({ error: 'Требуется идентификатор платежа' });
    }

    // Получаем платёж из YooKassa
    let yookassaPayment;
    try {
      yookassaPayment = await getClient().getPayment(normalizedPaymentId);
    } catch (err: any) {
      logger.error('Ошибка получения платежа из YooKassa:', err?.response?.data || err.message);
      return res.status(404).json({
        error: 'Платёж не найден',
        детали: err?.response?.data || 'Ошибка соединения с платёжной системой',
      });
    }

    const { paid, status } = yookassaPayment;

    if (!paid || status !== 'succeeded') {
      logger.warn(`Платёж не подлежит возврату: статус=${status}, оплачен=${paid}`);
      return res.status(400).json({
        error: 'Данный платёж нельзя вернуть',
        детали: `Текущий статус: ${status}, оплачен: ${paid}`,
      });
    }

    // Проверка доступной суммы для возврата
    // Если refundable_amount отсутствует, используем amount.value
    const refundableStr = yookassaPayment.refundable_amount?.value || yookassaPayment.amount?.value;
    const refundableNumeric = parseAmountValue(refundableStr);
    const refundableMax = Number.isFinite(refundableNumeric) ? refundableNumeric : 0;

    if (refundableMax <= 0) {
      logger.warn('Нет средств для возврата:', { 
        refundableMax, 
        paymentId: normalizedPaymentId,
        status,
        paid,
        refundable_amount: yookassaPayment.refundable_amount,
        amount: yookassaPayment.amount
      });
      return res.status(400).json({ 
        error: 'Нет средств для возврата',
        details: 'Платеж уже был возвращен или недоступен для возврата'
      });
    }

    // Определяем сумму возврата
    let valueToRefund = refundableMax;

    if (amount !== undefined && amount !== null && amount !== '') {
      const requested = parseAmountValue(amount);
      if (!Number.isFinite(requested) || requested <= 0) {
        return res.status(400).json({ error: 'Сумма должна быть положительным числом' });
      }
      if (requested > refundableMax) {
        return res.status(400).json({
          error: 'Запрошенная сумма превышает доступную для возврата',
          максимальная_сумма: refundableMax,
          запрошено: requested,
        });
      }
      valueToRefund = requested;
    }

    const formattedAmount = valueToRefund.toFixed(2);
    const idempotencyKey = randomUUID();

    // Получаем vote_id из платежа в БД или из metadata
    let voteId: string | null = null;
    const metadata = yookassaPayment.metadata || {};
    if (metadata.vote_id) {
      voteId = String(metadata.vote_id);
    } else {
      const { data: paymentData } = await supabaseAdmin
        .from('payments')
        .select('vote_id')
        .eq('id', normalizedPaymentId)
        .maybeSingle();
      if (paymentData?.vote_id) {
        voteId = String(paymentData.vote_id);
      }
    }

    // Получаем данные для receipt
    let userEmail: string | null = null;
    let quantity = 1;
    let descriptionText = yookassaPayment.description || 'Возврат оплаты участия в игре';

    if (voteId) {
      const { data: voteData } = await supabaseAdmin
        .from('votes')
        .select('user_id, quantity, game_id')
        .eq('id', voteId)
        .maybeSingle();

      if (voteData) {
        quantity = voteData.quantity || 1;
        const userId = voteData.user_id;

        // Получаем email пользователя
        if (userId) {
          const { data: userData } = await supabaseAdmin
            .from('users')
            .select('email')
            .eq('id', userId)
            .maybeSingle();
          if (userData?.email) {
            userEmail = userData.email;
          }
        }

        // Получаем описание игры для receipt
        if (voteData.game_id) {
          const { data: gameData } = await supabaseAdmin
            .from('games')
            .select('id')
            .eq('id', voteData.game_id)
            .maybeSingle();
          if (gameData) {
            descriptionText = `Возврат оплаты участия в игре #${voteData.game_id}`;
          }
        }
      }
    }

    if (!userEmail) {
      logger.warn('Email пользователя не найден для возврата:', { paymentId: normalizedPaymentId, voteId });
      return res.status(400).json({ error: 'Не удалось получить email пользователя для возврата' });
    }

    logger.log('Создание возврата:', { paymentId: normalizedPaymentId, amount: formattedAmount });

    const { shopId, secretKey } = getConfig();
    if (!shopId || !secretKey) {
      return res.status(500).json({ error: 'Сервис оплаты временно недоступен' });
    }

    const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64');

    const response = await fetch('https://api.yookassa.ru/v3/refunds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotencyKey,
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        payment_id: normalizedPaymentId,
        amount: { value: formattedAmount, currency: 'RUB' },
        receipt: {
          customer: {
            email: userEmail,
          },
          items: [
            {
              description: descriptionText,
              quantity: String(quantity),
              amount: {
                value: formattedAmount,
                currency: 'RUB',
              },
              vat_code: '1',
              payment_mode: 'full_payment',
              payment_subject: 'service',
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Не удалось расшифровать ответ' }));
      logger.error('Ошибка от YooKassa при возврате:', errorData);
      return res.status(response.status).json({
        error: 'Не удалось выполнить возврат',
        детали: errorData,
      });
    }

    const refund = await response.json();

    // Обновляем запись в payments
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        refunded_amount: parseFloat(refund.amount.value),
        refunded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'canceled',
      })
      .eq('id', normalizedPaymentId);

    if (updateError) {
      logger.error('Ошибка обновления payments после возврата:', updateError);
    }

    // Триггер в БД сам обновит votes.status

    return res.status(200).json({
      success: true,
      возврат: refund,
    });

  } catch (error: any) {
    logger.error('Ошибка при возврате:', error);
    return res.status(500).json({
      error: 'Внутренняя ошибка сервера',
      детали: error.message,
    });
  }
});

// POST /api/refund-game-completion - массовый возврат при завершении/отмене игры
router.post('/refund-game-completion', async (req, res) => {
  const logger = createLogger('refund-game-completion');
  try {
    const { gameId, gameStatus } = req.body || {};

    if (!gameId) {
      return res.status(400).json({ error: 'Требуется gameId' });
    }

    if (!gameStatus || !['Завершена', 'Отменена'].includes(gameStatus)) {
      return res.status(400).json({ error: 'Недопустимый статус игры' });
    }

    // Получаем данные игры
    const { data: game, error: gameError } = await supabaseAdmin
      .from('games')
      .select('game_price, players_limit, players_min')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      logger.error('Не удалось получить данные игры:', gameError);
      return res.status(404).json({ error: 'Игра не найдена' });
    }

    const { game_price, players_limit, players_min } = game;

    // Получаем все votes со статусом 'confirmed' для этой игры
    const { data: confirmedVotes, error: votesError } = await supabaseAdmin
      .from('votes')
      .select('id, user_id, quantity')
      .eq('game_id', gameId)
      .eq('status', 'confirmed');

    if (votesError) {
      logger.error('Ошибка получения голосов:', votesError);
      return res.status(500).json({ error: 'Не удалось получить список участников' });
    }

    if (!confirmedVotes || confirmedVotes.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Нет подтвержденных участников для возврата',
        refunds: [],
      });
    }

    // Получаем payment_id для каждого vote
    const voteIds = confirmedVotes.map(v => v.id);
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select('id, vote_id, amount, status')
      .in('vote_id', voteIds)
      .eq('status', 'succeeded');

    if (paymentsError) {
      logger.error('Ошибка получения платежей:', paymentsError);
      return res.status(500).json({ error: 'Не удалось получить список платежей' });
    }

    if (!payments || payments.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Нет успешных платежей для возврата',
        refunds: [],
      });
    }

    // Рассчитываем сумму возврата для каждого
    const confirmedCount = confirmedVotes.reduce((sum, v) => sum + (v.quantity || 1), 0);
    
    let refundResults: any[] = [];
    let totalRefunded = 0;
    let failedRefunds: any[] = [];

    const { shopId, secretKey } = getConfig();
    if (!shopId || !secretKey) {
      return res.status(500).json({ error: 'Сервис оплаты временно недоступен' });
    }

    const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64');

    // Определяем логику возврата
    const isFullRefund = gameStatus === 'Отменена' || confirmedCount < (players_min || 0);

    logger.log(`Обработка возвратов для игры #${gameId}`, {
      gameStatus,
      confirmedCount,
      players_min,
      isFullRefund,
      paymentsCount: payments.length,
    });

    // Обрабатываем каждый платеж
    for (const payment of payments) {
      try {
        const vote = confirmedVotes.find(v => v.id === payment.vote_id);
        if (!vote) continue;

        const paidAmount = payment.amount;
        let refundAmount = 0;

        if (isFullRefund) {
          // Полный возврат
          refundAmount = paidAmount;
        } else {
          // Частичный возврат (игра завершена успешно)
          const pricePerPlayerPaid = Math.ceil((game_price || 0) / (players_min || 1));
          const actualPricePerPlayer = (game_price || 0) / confirmedCount;
          const quantity = vote.quantity || 1;
          
          const shouldHavePaid = actualPricePerPlayer * quantity;
          const actuallyPaid = pricePerPlayerPaid * quantity;
          
          refundAmount = Math.max(0, actuallyPaid - shouldHavePaid);
        }

        // Округляем до 2 знаков
        refundAmount = Math.round(refundAmount * 100) / 100;

        // Если сумма возврата слишком мала, пропускаем
        if (refundAmount < 0.01) {
          logger.log(`Возврат для платежа ${payment.id} пропущен (сумма < 0.01)`, {
            paidAmount,
            refundAmount,
          });
          continue;
        }

        // Проверяем доступность средств для возврата
        let yookassaPayment;
        try {
          yookassaPayment = await getClient().getPayment(payment.id);
        } catch (err: any) {
          logger.error(`Не удалось получить платеж ${payment.id}:`, err?.response?.data || err.message);
          failedRefunds.push({
            paymentId: payment.id,
            userId: vote.user_id,
            error: 'Платёж не найден в YooKassa',
          });
          continue;
        }

        const refundableStr = yookassaPayment.refundable_amount?.value || yookassaPayment.amount?.value;
        const refundableMax = parseAmountValue(refundableStr);

        if (refundableMax <= 0) {
          logger.warn(`Нет средств для возврата по платежу ${payment.id}`);
          failedRefunds.push({
            paymentId: payment.id,
            userId: vote.user_id,
            error: 'Нет средств для возврата',
          });
          continue;
        }

        // Корректируем сумму возврата если превышает доступную
        const actualRefundAmount = Math.min(refundAmount, refundableMax);
        const formattedAmount = actualRefundAmount.toFixed(2);
        const idempotencyKey = randomUUID();

        // Получаем email пользователя для receipt
        let userEmail: string | null = null;
        if (vote.user_id) {
          const { data: userData } = await supabaseAdmin
            .from('users')
            .select('email')
            .eq('id', vote.user_id)
            .maybeSingle();
          if (userData?.email) {
            userEmail = userData.email;
          }
        }

        if (!userEmail) {
          logger.warn(`Email пользователя не найден для возврата платежа ${payment.id}:`, { userId: vote.user_id });
          failedRefunds.push({
            paymentId: payment.id,
            userId: vote.user_id,
            error: 'Email пользователя не найден',
          });
          continue;
        }

        const quantity = vote.quantity || 1;
        const descriptionText = `Возврат оплаты участия в игре #${gameId}`;

        logger.log(`Создание возврата для платежа ${payment.id}:`, {
          userId: vote.user_id,
          paidAmount,
          refundAmount: actualRefundAmount,
          isFullRefund,
        });

        // Выполняем возврат
        const response = await fetch('https://api.yookassa.ru/v3/refunds', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotence-Key': idempotencyKey,
            'Authorization': `Basic ${auth}`,
          },
          body: JSON.stringify({
            payment_id: payment.id,
            amount: { value: formattedAmount, currency: 'RUB' },
            receipt: {
              customer: {
                email: userEmail,
              },
              items: [
                {
                  description: descriptionText,
                  quantity: String(quantity),
                  amount: {
                    value: formattedAmount,
                    currency: 'RUB',
                  },
                  vat_code: '1',
                  payment_mode: 'full_payment',
                  payment_subject: 'service',
                },
              ],
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Не удалось расшифровать ответ' }));
          logger.error(`Ошибка от YooKassa при возврате ${payment.id}:`, errorData);
          failedRefunds.push({
            paymentId: payment.id,
            userId: vote.user_id,
            error: errorData.description || 'Ошибка YooKassa',
          });
          continue;
        }

        const refund = await response.json();

        // Обновляем запись в payments
        await supabaseAdmin
          .from('payments')
          .update({
            refunded_amount: parseFloat(refund.amount.value),
            refunded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: isFullRefund ? 'canceled' : 'succeeded',
          })
          .eq('id', payment.id);

        // Обновляем статус vote если полный возврат
        if (isFullRefund) {
          await supabaseAdmin
            .from('votes')
            .update({ status: 'cancelled' })
            .eq('id', payment.vote_id);
        }

        refundResults.push({
          paymentId: payment.id,
          userId: vote.user_id,
          refundAmount: actualRefundAmount,
          refundId: refund.id,
          success: true,
        });

        totalRefunded += actualRefundAmount;

      } catch (error: any) {
        logger.error(`Ошибка обработки платежа ${payment.id}:`, error);
        failedRefunds.push({
          paymentId: payment.id,
          error: error.message || 'Неизвестная ошибка',
        });
      }
    }

    const summary = {
      success: true,
      gameId,
      gameStatus,
      isFullRefund,
      totalParticipants: confirmedVotes.length,
      totalPayments: payments.length,
      successfulRefunds: refundResults.length,
      failedRefunds: failedRefunds.length,
      totalRefunded,
      refunds: refundResults,
      failed: failedRefunds,
    };

    logger.log('Завершена обработка возвратов:', summary);

    return res.status(200).json(summary);

  } catch (error: any) {
    logger.error('Ошибка при массовом возврате:', error);
    return res.status(500).json({
      error: 'Внутренняя ошибка сервера',
      детали: error.message,
    });
  }
});

export default router;
