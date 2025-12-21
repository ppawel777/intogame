import express from 'express';
import webpush from 'web-push';
import { supabaseAdmin } from '../lib/supabase';
import { createLogger } from './utils/logger';

const router = express.Router();
const logger = createLogger('push');

// Инициализация VAPID ключей
const initVapid = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@intogame.ru';

  if (!publicKey || !privateKey) {
    logger.warn('VAPID keys не настроены. Push-уведомления будут недоступны.');
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
};

const isVapidConfigured = initVapid();

/**
 * POST /api/push/subscribe
 * Регистрация push-подписки пользователя
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { userId, subscription } = req.body;

    if (!userId || !subscription) {
      return res.status(400).json({ error: 'userId и subscription обязательны' });
    }

    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return res.status(400).json({ error: 'Неверный формат subscription' });
    }

    // Проверяем существование пользователя
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Сохраняем или обновляем подписку
    const { data, error } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert(
        {
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        {
          onConflict: 'user_id,endpoint',
        }
      )
      .select()
      .single();

    if (error) {
      logger.error('Ошибка сохранения подписки:', error);
      return res.status(500).json({ error: 'Не удалось сохранить подписку' });
    }

    logger.log(`Подписка сохранена для пользователя ${userId}`);
    res.json({ success: true, subscription: data });
  } catch (error: any) {
    logger.error('Ошибка регистрации подписки:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

/**
 * DELETE /api/push/unsubscribe
 * Удаление push-подписки пользователя
 */
router.delete('/unsubscribe', async (req, res) => {
  try {
    const { userId, endpoint } = req.body;

    if (!userId || !endpoint) {
      return res.status(400).json({ error: 'userId и endpoint обязательны' });
    }

    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', endpoint);

    if (error) {
      logger.error('Ошибка удаления подписки:', error);
      return res.status(500).json({ error: 'Не удалось удалить подписку' });
    }

    logger.log(`Подписка удалена для пользователя ${userId}`);
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Ошибка удаления подписки:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

/**
 * POST /api/push/send
 * Отправка push-уведомления пользователю или группе пользователей
 */
router.post('/send', async (req, res) => {
  try {
    if (!isVapidConfigured) {
      return res.status(503).json({ error: 'Push-уведомления не настроены (VAPID keys отсутствуют)' });
    }

    const { userIds, title, body, icon, badge, data, url } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds должен быть непустым массивом' });
    }

    if (!title || !body) {
      return res.status(400).json({ error: 'title и body обязательны' });
    }

    // Получаем все подписки для указанных пользователей
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds);

    if (subError) {
      logger.error('Ошибка получения подписок:', subError);
      return res.status(500).json({ error: 'Не удалось получить подписки' });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.json({ success: true, sent: 0, message: 'Нет активных подписок' });
    }

    // Формируем payload для уведомления
    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icon-192x192.png',
      badge: badge || '/icon-192x192.png',
      data: {
        ...(data || {}),
        url: url || '/',
      },
      url: url || '/',
    });

    // Отправляем уведомления
    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        );
        return { success: true, userId: sub.user_id };
      } catch (error: any) {
        // Если подписка недействительна (410), удаляем её
        if (error.statusCode === 410) {
          logger.warn(`Подписка недействительна, удаляем: ${sub.id}`);
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
        } else {
          logger.error(`Ошибка отправки уведомления пользователю ${sub.user_id}:`, error);
        }
        return { success: false, userId: sub.user_id, error: error.message };
      }
    });

    const results = await Promise.allSettled(sendPromises);
    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    logger.log(`Отправлено уведомлений: ${successful} успешно, ${failed} ошибок`);

    res.json({
      success: true,
      sent: successful,
      failed,
      total: subscriptions.length,
    });
  } catch (error: any) {
    logger.error('Ошибка отправки push-уведомлений:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

/**
 * GET /api/push/vapid-public-key
 * Получение публичного VAPID ключа для клиента
 */
router.get('/vapid-public-key', (_, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(503).json({ error: 'VAPID keys не настроены' });
  }
  res.json({ publicKey });
});

export default router;

