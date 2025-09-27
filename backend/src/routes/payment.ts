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
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return { shopId, secretKey, frontendUrl };
};

const getClient = () => {
  const { shopId, secretKey } = getConfig();
  return new YooKassa({ shopId, secretKey });
};

// POST /api/create-payment
// Body: { amount: number | string, description?: string, returnUrl?: string, metadata?: Record<string, any> }
router.post('/create-payment', async (req, res) => {
  try {
    const { shopId, secretKey, frontendUrl } = getConfig();
    if (!shopId || !secretKey) {
      return res.status(500).json({ error: 'YooKassa credentials are not configured on the server' });
    }

    const {
      amount,
      description = 'Оплата заказа',
      returnUrl,
      metadata = {},
    } = req.body || {};

    if (!amount || Number.isNaN(Number(amount))) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const value = (typeof amount === 'string' ? parseFloat(amount) : Number(amount))
      .toFixed(2);

    const confirmationReturnUrl = typeof returnUrl === 'string' && returnUrl.length > 0
      ? returnUrl
      : `${frontendUrl}/payment-result`;

    const payment = await getClient().createPayment({
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
    }, randomUUID());

    const confirmationUrl = payment?.confirmation?.confirmation_url;

    if (!confirmationUrl) {
      return res.status(502).json({ error: 'Failed to get confirmation URL from YooKassa', payment });
    }

    // Привязываем payment_id к записи голоса (если есть)
    try {
      if (metadata?.userId && metadata?.gameId) {
        const userId = Number(metadata.userId);
        const gameId = Number(metadata.gameId);
        console.log('[create-payment] Looking for vote:', { userId, gameId, metadata });
        
        // Сначала проверим, есть ли запись
        const { data: existingVote } = await supabaseAdmin
          .from('votes')
          .select('*')
          .eq('user_id', userId)
          .eq('game_id', gameId);
        console.log('[create-payment] Existing vote:', existingVote);
        
        const { error, data } = await supabaseAdmin
          .from('votes')
          .update({ payment_id: payment.id })
          .eq('user_id', userId)
          .eq('game_id', gameId)
          .in('status', ['pending', 'confirmed'])
          .select('*');
        console.log('[create-payment] Update result:', { error, data });
        if (error) console.error('[create-payment] supabase update error:', error);
        if (!data?.length) console.warn('[create-payment] no votes row matched to set payment_id', { metadata });
      }
    } catch (e) {
      console.warn('[create-payment] Failed to update votes with payment_id', e);
    }

    return res.status(200).json({
      paymentId: payment.id,
      status: payment.status,
      paid: payment.paid,
      confirmationUrl,
      // Алиас для фронтов, ожидающих snake_case
      confirmation_url: confirmationUrl,
    });
  } catch (error: any) {
    console.error('[create-payment] Error:', error?.response?.data || error);
    return res.status(500).json({ error: 'Failed to create payment', details: error?.response?.data || error?.message || String(error) });
  }
});

// GET /api/payment-status/:paymentId
router.get('/payment-status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    if (!paymentId) {
      return res.status(400).json({ error: 'paymentId is required' });
    }
    const payment = await getClient().getPayment(paymentId);
    return res.status(200).json({
      paymentId: payment.id,
      status: payment.status,
      paid: payment.paid,
    });
  } catch (error: any) {
    console.error('[payment-status] Error:', error?.response?.data || error);
    return res.status(500).json({ error: 'Failed to get payment status', details: error?.response?.data || error?.message || String(error) });
  }
});

// POST /api/yookassa/webhook — опционально, если настроите уведомления ЮKassa
router.post('/yookassa/webhook', async (req, res) => {
  try {
    const webhookLogin = process.env.YOOKASSA_WEBHOOK_LOGIN;
    const webhookPassword = process.env.YOOKASSA_WEBHOOK_PASSWORD;
    if (webhookLogin && webhookPassword) {
      const header = req.headers['authorization'] as string | undefined;
      const expected = 'Basic ' + Buffer.from(`${webhookLogin}:${webhookPassword}`).toString('base64');
      if (!header || header !== expected) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const event = (req.body && (req.body.event || req.body.notification_type)) as string | undefined;
    const payment = req.body?.object || req.body?.payment || req.body;
    const paymentId: string | undefined = payment?.id;
    const metadata = payment?.metadata || {};

    if (!paymentId) return res.status(200).json({ received: true });

    if (event === 'payment.succeeded' || payment?.status === 'succeeded' || payment?.paid === true) {
      // Сначала обновляем по payment_id (надёжнее), затем fallback по user/game
      const updatePayload = {
        status: 'confirmed' as const,
        payment_verified: true,
        paid_at: new Date().toISOString(),
        payment_id: paymentId,
      };
      let { error, data } = await supabaseAdmin
        .from('votes')
        .update(updatePayload)
        .eq('payment_id', paymentId)
        .in('status', ['pending', 'confirmed'])
        .select('*');
      if (error) console.error('[webhook succeeded] supabase update by payment_id error:', error);
      if (!data?.length && metadata?.userId && metadata?.gameId) {
        const userId = Number(metadata.userId);
        const gameId = Number(metadata.gameId);
        if (!isNaN(userId) && !isNaN(gameId)) {
          const res2 = await supabaseAdmin
            .from('votes')
            .update(updatePayload)
            .eq('user_id', userId)
            .eq('game_id', gameId)
            .in('status', ['pending', 'confirmed'])
            .select('*');
          if (res2.error) console.error('[webhook succeeded] supabase update by user/game error:', res2.error);
          if (!res2.data?.length) console.warn('[webhook succeeded] no votes updated', { paymentId, metadata });
        }
      }
    }

    if (event === 'payment.canceled' || payment?.status === 'canceled') {
      const updatePayload = {
        status: 'failed' as const,
        payment_verified: false,
        payment_id: paymentId,
      };
      let { error, data } = await supabaseAdmin
        .from('votes')
        .update(updatePayload)
        .eq('payment_id', paymentId)
        .in('status', ['pending'])
        .select('*');
      if (error) console.error('[webhook canceled] supabase update by payment_id error:', error);
      if (!data?.length && metadata?.userId && metadata?.gameId) {
        const userId = Number(metadata.userId);
        const gameId = Number(metadata.gameId);
        if (!isNaN(userId) && !isNaN(gameId)) {
          const res2 = await supabaseAdmin
            .from('votes')
            .update(updatePayload)
            .eq('user_id', userId)
            .eq('game_id', gameId)
            .in('status', ['pending'])
            .select('*');
          if (res2.error) console.error('[webhook canceled] supabase update by user/game error:', res2.error);
          if (!res2.data?.length) console.warn('[webhook canceled] no votes updated', { paymentId, metadata });
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[webhook] error', error);
    return res.status(200).json({ received: true });
  }
});

// POST /api/verify-payment { paymentId }
router.post('/verify-payment', async (req, res) => {
  try {
    const { paymentId } = req.body || {};
    if (!paymentId) return res.status(400).json({ error: 'paymentId required' });

    const payment = await getClient().getPayment(paymentId);
    const metadata = payment?.metadata || {};

    if (payment?.status === 'succeeded' || payment?.paid === true) {
      const updatePayload = {
        status: 'confirmed' as const,
        payment_verified: true,
        paid_at: new Date().toISOString(),
        payment_id: paymentId,
      };
      let { error, data } = await supabaseAdmin
        .from('votes')
        .update(updatePayload)
        .eq('payment_id', paymentId)
        .in('status', ['pending', 'confirmed'])
        .select('*');
      if (error) console.error('[verify succeeded] supabase update by payment_id error:', error);
      if (!data?.length && metadata?.userId && metadata?.gameId) {
        const userId = Number(metadata.userId);
        const gameId = Number(metadata.gameId);
        if (!isNaN(userId) && !isNaN(gameId)) {
          const res2 = await supabaseAdmin
            .from('votes')
            .update(updatePayload)
            .eq('user_id', userId)
            .eq('game_id', gameId)
            .in('status', ['pending', 'confirmed'])
            .select('*');
          if (res2.error) console.error('[verify succeeded] supabase update by user/game error:', res2.error);
          if (!res2.data?.length) console.warn('[verify succeeded] no votes updated', { paymentId, metadata });
        }
      }
    } else if (payment?.status === 'canceled') {
      const updatePayload = {
        status: 'failed' as const,
        payment_verified: false,
        payment_id: paymentId,
      };
      let { error, data } = await supabaseAdmin
        .from('votes')
        .update(updatePayload)
        .eq('payment_id', paymentId)
        .in('status', ['pending'])
        .select('*');
      if (error) console.error('[verify canceled] supabase update by payment_id error:', error);
      if (!data?.length && metadata?.userId && metadata?.gameId) {
        const userId = Number(metadata.userId);
        const gameId = Number(metadata.gameId);
        if (!isNaN(userId) && !isNaN(gameId)) {
          const res2 = await supabaseAdmin
            .from('votes')
            .update(updatePayload)
            .eq('user_id', userId)
            .eq('game_id', gameId)
            .in('status', ['pending'])
            .select('*');
          if (res2.error) console.error('[verify canceled] supabase update by user/game error:', res2.error);
          if (!res2.data?.length) console.warn('[verify canceled] no votes updated', { paymentId, metadata });
        }
      }
    }

    return res.status(200).json({ status: payment?.status || 'unknown' });
  } catch (error: any) {
    console.error('[verify-payment] Error:', error?.response?.data || error);
    return res.status(500).json({ error: 'Failed to verify payment', details: error?.message || String(error) });
  }
});

// POST /api/refund-payment { paymentId, amount }
router.post('/refund-payment', async (req, res) => {
  try {
    const { paymentId, amount } = req.body || {};
    if (!paymentId) return res.status(400).json({ error: 'paymentId required' });

    const refund = await (getClient() as any).createRefund({
      payment_id: paymentId,
      amount: amount
        ? { value: (typeof amount === 'string' ? parseFloat(amount) : Number(amount)).toFixed(2), currency: 'RUB' }
        : undefined,
    }, randomUUID());

    // Попробуем обновить статус в votes (если есть метаданные на платеже)
    try {
      const payment = await getClient().getPayment(paymentId);
      const metadata = (payment as any)?.metadata || {};
      if (metadata?.userId && metadata?.gameId) {
        const userId = Number(metadata.userId);
        const gameId = Number(metadata.gameId);
        if (!isNaN(userId) && !isNaN(gameId)) {
          await supabaseAdmin
            .from('votes')
            .update({
              status: 'failed',
              payment_verified: false,
            })
            .eq('user_id', userId)
            .eq('game_id', gameId)
            .in('status', ['pending', 'confirmed']);
        }
      }
    } catch (e) {
      console.warn('[refund-payment] Could not update votes after refund', e);
    }

    return res.status(200).json({ refund });
  } catch (error: any) {
    console.error('[refund-payment] Error:', error?.response?.data || error);
    return res.status(500).json({ error: 'Failed to refund payment', details: error?.response?.data || error?.message || String(error) });
  }
});

export default router;


