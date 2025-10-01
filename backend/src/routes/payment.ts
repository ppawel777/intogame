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
        : `${frontendUrl}/#/games/reserved`;

    // Поиск голосования (если есть metadata)
    let voteId: string | null = null;
    if (metadata?.userId && metadata?.gameId) {
      const userId = String(metadata.userId);
      const gameId = String(metadata.gameId);

      const { data: voteData, error } = await supabaseAdmin
        .from('votes')
        .select('id')
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .eq('status', 'pending')
        .maybeSingle();

      if (error) {
        return res.status(500).json({ error: 'Ошибка при поиске голоса' });
      }

      if (!voteData) {
        logger.warn('Голос не найден или уже не pending:', { userId, gameId });
        return res.status(404).json({ 
          error: 'Запись для оплаты не найдена', 
          details: 'Срок бронирования истёк. Пожалуйста, запишитесь на игру снова.' 
        });
      }

      voteId = String(voteData.id);
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
          metadata: {
            ...metadata,
            vote_id: voteId,
          },
        },
        randomUUID()
      );
    } catch (err: any) {
      logger.error('Ошибка создания платежа:', err?.response?.data || err.message);
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
        logger.error('Ошибка сохранения платежа в БД:', paymentInsertError,voteId);
      }
    }

    return res.status(200).json({
      paymentId: yookassaPayment.id,
      status: yookassaPayment.status,
      paid: yookassaPayment.paid,
      confirmationUrl,
    });

  } catch (error: any) {
    logger.error('Внутренняя ошибка:', error);
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

// POST /api/refund-payment { paymentId, amount }
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

    // Получаем платёж из YooKassa API
    let payment;
    try {
      payment = await getClient().getPayment(normalizedPaymentId);
    } catch (err: any) {
      logger.error(
        'Не удалось получить платёж из YooKassa:',
        err?.response?.data || err.message || err
      );
      return res.status(404).json({
        error: 'Платёж не найден',
        details: err?.response?.data ? JSON.stringify(err.response.data) : 'Ошибка соединения с платёжной системой'
      });
    }

    const paid = payment.paid;
    const status = payment.status;

    if (!paid || status !== 'succeeded') {
      logger.warn(`Платёж не подлежит возврату: статус=${status}, оплачен=${paid}`);
      return res.status(400).json({
        error: 'Данный платёж нельзя вернуть',
        details: `Текущий статус: ${status}, оплачен: ${paid}`
      });
    }

    // Определяем сумму, доступную для возврата
    const rawRefundable = payment.refundable_amount?.value;
    const rawTotal = payment.amount.value;

    const refundableNumeric = parseAmountValue(rawRefundable);
    const totalNumeric = parseAmountValue(rawTotal);

    const refundableMax = Number.isFinite(refundableNumeric) ? refundableNumeric : totalNumeric;

    if (!Number.isFinite(refundableMax) || refundableMax <= 0) {
      logger.warn('Нет средств для возврата:', { refundableMax });
      return res.status(400).json({ error: 'Нет средств для возврата' });
    }

    // Проверка запрашиваемой суммы
    let valueToRefund = refundableMax;

    if (amount !== undefined && amount !== null && amount !== '') {
      const requestedStr = typeof amount === 'string' ? amount.trim() : String(amount);
      if (!requestedStr) {
        logger.warn('Передана пустая или некорректная строка суммы:', { amount });
        return res.status(400).json({ error: 'Неверный формат суммы' });
      }

      const requested = parseAmountValue(requestedStr);
      if (!Number.isFinite(requested) || requested <= 0) {
        logger.warn('Сумма возврата должна быть положительным числом:', { requested });
        return res.status(400).json({ error: 'Сумма должна быть положительным числом' });
      }

      if (requested > refundableMax) {
        logger.warn('Запрошенная сумма превышает допустимую:', {
          requested,
          refundableMax,
        });
        return res.status(400).json({
          error: 'Запрошенная сумма превышает доступную для возврата',
          максимальная_сумма: refundableMax,
          запрошено: requested
        });
      }

      valueToRefund = requested;
    }

    // Форматируем сумму как строку с двумя знаками после запятой
    const formattedAmount = valueToRefund.toFixed(2);

    // Подготовка данных для запроса
    const payload = {
      payment_id: normalizedPaymentId,
      amount: {
        value: formattedAmount,
        currency: 'RUB' as const,
      },
    };

    const idempotencyKey = randomUUID();

    logger.log('Отправка запроса на возврат:', {
      payment_id: normalizedPaymentId,
      сумма: formattedAmount,
      idempotencyKey,
    });

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
      logger.error('Не настроены учетные данные YooKassa');
      return res.status(500).json({ error: 'Сервис оплаты временно недоступен' });
    }

    const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64');

    // Вызов YooKassa API напрямую
    const response = await fetch('https://api.yookassa.ru/v3/refunds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotencyKey,
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Не удалось расшифровать ошибку ответа' }));
      logger.error('Ошибка от YooKassa при создании возврата:', errorData);
      return res.status(response.status).json({
        error: 'Не удалось выполнить возврат средств',
        детали: errorData,
        статус: response.status,
      });
    }

    const refund = await response.json();
    logger.log('Возврат успешно создан:', refund);

    // Обновляем таблицу payments
    try {
      const refundAmount = parseFloat(refund.amount.value);
      const { error: paymentUpdateError } = await supabaseAdmin
        .from('payments')
        .update({
          refunded_amount: refundAmount,
          refunded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'canceled'
        })
        .eq('id', normalizedPaymentId);

      if (paymentUpdateError) {
        logger.error('Ошибка обновления записи в таблице payments:', paymentUpdateError);
      }
    } catch (updateError) {
      logger.error('Ошибка при обновлении payments:', updateError);
    }

    // Обновление статуса голосования в Supabase (если есть метаданные)
    // try {
    //   const metadata = payment.metadata || {};
    //   const userIdStr = metadata.userId;
    //   const gameIdStr = metadata.gameId;

    //   if (userIdStr && gameIdStr) {
    //     const userId = Number(userIdStr);
    //     const gameId = Number(gameIdStr);

    //     if (!isNaN(userId) && !isNaN(gameId)) {
    //       const { error } = await supabaseAdmin
    //         .from('votes')
    //         .update({
    //           status: 'cancelled',
    //         })
    //         .eq('user_id', String(userId))
    //         .eq('game_id', String(gameId))
    //         .eq('status', 'confirmed');

    //       if (error) {
    //         console.error('[refund-payment] Ошибка обновления голоса в базе данных:', error);
    //       } else {
    //         console.log(`[refund-payment] Голос обновлён: user_id=${userId}, game_id=${gameId}`);
    //       }
    //     } else {
    //       console.warn('[refund-payment] Некорректный userId или gameId после преобразования:', { userIdStr, gameIdStr });
    //     }
    //   } else {
    //     console.log('[refund-payment] В платеже отсутствуют userId или gameId в метаданных');
    //   }
    // } catch (e) {
    //   console.warn('[refund-payment] Произошла ошибка при обновлении голоса:', e);
    // }

    return res.status(200).json({
      success: true,
      возврат: refund,
    });

  } catch (error: any) {
    logger.error('Внутренняя ошибка сервера:', error);
    return res.status(500).json({
      error: 'Внутренняя ошибка сервера при выполнении возврата',
      детали: error.message || 'Неизвестная ошибка'
    });
  }
});

export default router;
