/// <reference path="../types/yookassa.d.ts" />
import express from 'express';
import YooKassa from 'yookassa';
import { supabaseAdmin } from '../lib/supabase';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
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
  try {
    const { shopId, secretKey, frontendUrl } = getConfig();
    
    if (!shopId || !secretKey) {
      console.error('[create-payment] Не настроены учетные данные YooKassa');
      return res.status(500).json({ error: 'Сервис оплаты временно недоступен' });
    }

    const {
      amount,
      description = 'Оплата участия в игре',
      returnUrl,
      metadata = {},
    } = req.body || {};

    // === Проверка суммы ===
    if (!amount || Number.isNaN(Number(amount))) {
      console.warn('[create-payment] Передана некорректная сумма:', { amount });
      return res.status(400).json({ error: 'Указана некорректная сумма' });
    }

    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    const value = numericAmount.toFixed(2);

    // === Формирование URL для возврата ===
    const confirmationReturnUrl = typeof returnUrl === 'string' && returnUrl.trim().length > 0
      ? returnUrl.trim()
      : `${frontendUrl}/#/games/reserved`;

    // === Создание платежа через YooKassa ===
    let payment;
    try {
      payment = await getClient().createPayment(
        {
          amount: {
            value,
            currency: 'RUB',
          },
          capture: true,
          description,
          confirmation: {
            type: 'redirect',
            return_url: confirmationReturnUrl,
          },
          metadata,
        },
        randomUUID()
      );
    } catch (err: any) {
      console.error(
        '[create-payment] Ошибка при создании платежа в YooKassa:',
        err?.response?.data || err.message || err
      );
      return res.status(502).json({
        error: 'Не удалось создать платёж',
        детали: err?.response?.data || err.message || 'Неизвестная ошибка'
      });
    }

    const confirmationUrl = payment?.confirmation?.confirmation_url;

    if (!confirmationUrl) {
      console.error('[create-payment] Не получен URL подтверждения от YooKassa:', payment);
      return res.status(502).json({ error: 'Не удалось получить ссылку для оплаты' });
    }

    // === Привязка payment_id к голосованию (если есть метаданные) ===
    try {
      if (metadata?.userId && metadata?.gameId) {
        const userId = String(metadata.userId);
        const gameId = String(metadata.gameId);

        console.log('[create-payment] Поиск голоса для привязки платежа:', { userId, gameId });

        // Проверяем существование записи
        const { data: existingVoteData, error: fetchError } = await supabaseAdmin
          .from('votes')
          .select('*')
          .eq('user_id', userId)
          .eq('game_id', gameId);

        if (fetchError) {
          console.error('[create-payment] Ошибка при поиске голоса в базе данных:', fetchError);
          return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }

        if (!existingVoteData || existingVoteData.length === 0) {
          console.warn('[create-payment] Голос не найден:', { userId, gameId });
          return res.status(404).json({ error: 'Запись для оплаты не найдена' });
        }

        // Обновляем только если статус pending
        const { error: updateError, data: updatedData } = await supabaseAdmin
          .from('votes')
          .update({ payment_id: payment.id })
          .eq('user_id', userId)
          .eq('game_id', gameId)
          .eq('status', 'pending')
          .select('*');

        if (updateError) {
          console.error('[create-payment] Ошибка обновления голоса в базе данных:', updateError);
          return res.status(500).json({ error: 'Ошибка обновления записи в БД' });
        }

        if (!updatedData || updatedData.length === 0) {
          console.warn('[create-payment] Не удалось обновить запись — возможно, статус не "pending":', { userId, gameId });
          return res.status(400).json({ error: 'Невозможно обновить запись: статус не позволяет' });
        }
      }
    } catch (e: any) {
      console.error('[create-payment] Исключение при обновлении голоса:', e.message || e);
      return res.status(500).json({ error: 'Ошибка при привязке платежа к записи' });
    }

    // === Успешный ответ клиенту ===
    return res.status(200).json({
      paymentId: payment.id,
      status: payment.status,
      paid: payment.paid,
      confirmationUrl,
      confirmation_url: confirmationUrl,
    });

  } catch (error: any) {
    console.error('[create-payment] Внутренняя ошибка сервера:', error);
    return res.status(500).json({
      error: 'Внутренняя ошибка сервера при создании платежа',
      детали: error.message || 'Неизвестная ошибка'
    });
  }
});

// POST /api/yookassa/webhook — прописывается в настройках ЮKassa
router.post('/yookassa/webhook', async (req, res) => {
  try {
    // Проверка авторизации через Basic Auth, если указаны логин и пароль
    const webhookLogin = process.env.YOOKASSA_WEBHOOK_LOGIN;
    const webhookPassword = process.env.YOOKASSA_WEBHOOK_PASSWORD;

    if (webhookLogin && webhookPassword) {
      const authHeader = req.headers['authorization'] as string | undefined;
      const expectedAuth = 'Basic ' + Buffer.from(`${webhookLogin}:${webhookPassword}`).toString('base64');

      if (!authHeader || authHeader !== expectedAuth) {
        console.warn('[webhook] Ошибка авторизации: неверные учетные данные');
        return res.status(401).json({ error: 'Неавторизованный доступ' });
      }
    }

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
      console.error('[webhook] YooKassa не настроена: отсутствуют shop_id или секретный ключ');
      return res.status(500).json({ error: 'Сервис оплаты временно недоступен' });
    }

    const event = (req.body?.event || req.body?.notification_type) as string | undefined;
    const payment = req.body?.object || req.body?.payment || req.body;
    const paymentId = payment?.id as string | undefined;
    const metadata = payment?.metadata || {};

    // Если нет ID платежа — просто подтверждаем приём
    if (!paymentId) {
      console.log('[webhook] Платёж не содержит ID, пропускаем:', req.body);
      return res.status(200).json({ received: true });
    }

    // Обработка успешного платежа
    if (
      event === 'payment.succeeded' ||
      payment?.status === 'succeeded' ||
      payment?.paid === true
    ) {
      const updatePayload = {
        status: 'confirmed',
        payment_verified: true,
        paid_at: new Date().toISOString(),
        payment_id: paymentId,
      };

      // Сначала пробуем обновить по payment_id
      const { error: byPaymentError, data: byPaymentData } = await supabaseAdmin
        .from('votes')
        .update(updatePayload)
        .eq('payment_id', paymentId)
        .eq('status', 'pending')
        .select('*');

      if (byPaymentError) {
        console.error('[webhook succeeded] Ошибка обновления голоса по payment_id:', byPaymentError);
      }

      // Если не нашли по payment_id, но есть metadata — пробуем по user_id и game_id
      if (!byPaymentData?.length && metadata?.userId && metadata?.gameId) {
        const userId = String(metadata.userId);
        const gameId = String(metadata.gameId);

        const { error: byUserGameError, data: byUserGameData } = await supabaseAdmin
          .from('votes')
          .update(updatePayload)
          .eq('user_id', userId)
          .eq('game_id', gameId)
          .in('status', ['pending', 'confirmed'])
          .select('*');

        if (byUserGameError) {
          console.error('[webhook succeeded] Ошибка обновления голоса по user_id и game_id:', byUserGameError);
        }

        if (!byUserGameData?.length) {
          console.warn('[webhook succeeded] Не удалось обновить ни одну запись голосования:', {
            paymentId,
            metadata,
          });
        }
      }
    }

    // Обработка отменённого платежа
    if (event === 'payment.canceled' || payment?.status === 'canceled') {
      const updatePayload = {
        status: 'failed',
        payment_verified: false,
        payment_id: paymentId,
      };

      // Обновляем по payment_id
      const { error: byPaymentError, data: byPaymentData } = await supabaseAdmin
        .from('votes')
        .update(updatePayload)
        .eq('payment_id', paymentId)
        .in('status', ['pending'])
        .select('*');

      if (byPaymentError) {
        console.error('[webhook canceled] Ошибка обновления голоса по payment_id:', byPaymentError);
      }

      // Если не нашли - пробуем по user_id и game_id
      if (!byPaymentData?.length && metadata?.userId && metadata?.gameId) {
        const userId = String(metadata.userId);
        const gameId = String(metadata.gameId);

        const { error: byUserGameError, data: byUserGameData } = await supabaseAdmin
          .from('votes')
          .update(updatePayload)
          .eq('user_id', userId)
          .eq('game_id', gameId)
          .in('status', ['pending'])
          .select('*');

        if (byUserGameError) {
          console.error('[webhook canceled] Ошибка обновления голоса по user_id и game_id:', byUserGameError);
        }

        if (!byUserGameData?.length) {
          console.warn('[webhook canceled] Не удалось обновить ни одну запись голосования:', {
            paymentId,
            metadata,
          });
        }
      }
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('[webhook] Внутренняя ошибка сервера при обработке вебхука:', error);
    // Всегда возвращаем 200, чтобы ЮKassa не повторяла запрос
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
  try {
    const { paymentId, amount } = req.body || {};

    const normalizedPaymentId: string | undefined =
      typeof paymentId === 'string'
        ? paymentId.trim()
        : (paymentId && typeof paymentId === 'object' && typeof (paymentId as any).payment_id === 'string')
          ? (paymentId as any).payment_id.trim()
          : undefined;

    if (!normalizedPaymentId) {
      console.warn('[refund-payment] Не указан paymentId или он имеет неверный формат');
      return res.status(400).json({ error: 'Требуется идентификатор платежа' });
    }

    // Получаем платёж из YooKassa API
    let payment;
    try {
      payment = await getClient().getPayment(normalizedPaymentId);
    } catch (err: any) {
      console.error(
        '[refund-payment] Не удалось получить платёж из YooKassa:',
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
      console.warn(`[refund-payment] Платёж не подлежит возврату: статус=${status}, оплачен=${paid}`);
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
      console.warn('[refund-payment] Нет средств для возврата:', { refundableMax });
      return res.status(400).json({ error: 'Нет средств для возврата' });
    }

    // Проверка запрашиваемой суммы
    let valueToRefund = refundableMax;

    if (amount !== undefined && amount !== null && amount !== '') {
      const requestedStr = typeof amount === 'string' ? amount.trim() : String(amount);
      if (!requestedStr) {
        console.warn('[refund-payment] Передана пустая или некорректная строка суммы:', { amount });
        return res.status(400).json({ error: 'Неверный формат суммы' });
      }

      const requested = parseAmountValue(requestedStr);
      if (!Number.isFinite(requested) || requested <= 0) {
        console.warn('[refund-payment] Сумма возврата должна быть положительным числом:', { requested });
        return res.status(400).json({ error: 'Сумма должна быть положительным числом' });
      }

      if (requested > refundableMax) {
        console.warn('[refund-payment] Запрошенная сумма превышает допустимую:', {
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

    console.log('[refund-payment] Отправка запроса на возврат:', {
      payment_id: normalizedPaymentId,
      сумма: formattedAmount,
      idempotencyKey,
    });

    
    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
      console.error('[refund-payment] Не настроены учетные данные YooKassa');
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
      console.error('[refund-payment] Ошибка от YooKassa при создании возврата:', errorData);
      return res.status(response.status).json({
        error: 'Не удалось выполнить возврат средств',
        детали: errorData,
        статус: response.status,
      });
    }

    const refund = await response.json();
    console.log('[refund-payment] Возврат успешно создан:', refund);

    // Обновление статуса голосования в Supabase (если есть метаданные)
    try {
      const metadata = payment.metadata || {};
      const userIdStr = metadata.userId;
      const gameIdStr = metadata.gameId;

      if (userIdStr && gameIdStr) {
        const userId = Number(userIdStr);
        const gameId = Number(gameIdStr);

        if (!isNaN(userId) && !isNaN(gameId)) {
          const { error } = await supabaseAdmin
            .from('votes')
            .update({
              status: 'cancelled',
              payment_verified: false,
            })
            .eq('user_id', String(userId))
            .eq('game_id', String(gameId))
            .eq('status', 'confirmed');

          if (error) {
            console.error('[refund-payment] Ошибка обновления голоса в базе данных:', error);
          } else {
            console.log(`[refund-payment] Голос обновлён: user_id=${userId}, game_id=${gameId}`);
          }
        } else {
          console.warn('[refund-payment] Некорректный userId или gameId после преобразования:', { userIdStr, gameIdStr });
        }
      } else {
        console.log('[refund-payment] В платеже отсутствуют userId или gameId в метаданных');
      }
    } catch (e) {
      console.warn('[refund-payment] Произошла ошибка при обновлении голоса:', e);
    }

    return res.status(200).json({
      success: true,
      возврат: refund,
    });

  } catch (error: any) {
    console.error('[refund-payment] Внутренняя ошибка сервера:', error);
    return res.status(500).json({
      error: 'Внутренняя ошибка сервера при выполнении возврата',
      детали: error.message || 'Неизвестная ошибка'
    });
  }
});

export default router;
