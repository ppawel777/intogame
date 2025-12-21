#!/usr/bin/env node

/**
 * Скрипт диагностики push-уведомлений
 * Использование: node scripts/diagnose-push.js <user_id>
 */

const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const userId = process.argv[2];

if (!userId) {
  console.error('Использование: node scripts/diagnose-push.js <user_id>');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Ошибка: SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY должны быть установлены в .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || 'mailto:admin@intogame.ru';

if (!publicKey || !privateKey) {
  console.error('Ошибка: VAPID_PUBLIC_KEY и VAPID_PRIVATE_KEY должны быть установлены в .env');
  process.exit(1);
}

webpush.setVapidDetails(subject, publicKey, privateKey);

async function diagnose() {
  console.log('🔍 Диагностика push-уведомлений для пользователя:', userId);
  console.log('');

  // 1. Проверка подписок
  console.log('1️⃣ Проверка подписок в БД...');
  const { data: subscriptions, error: subError } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId);

  if (subError) {
    console.error('❌ Ошибка получения подписок:', subError);
    return;
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log('⚠️  Подписок не найдено');
    return;
  }

  console.log(`✅ Найдено подписок: ${subscriptions.length}`);
  console.log('');

  // 2. Проверка каждой подписки
  for (const sub of subscriptions) {
    console.log(`📱 Подписка ID: ${sub.id}`);
    console.log(`   Endpoint: ${sub.endpoint.substring(0, 50)}...`);
    console.log(`   Создана: ${sub.created_at}`);
    console.log('');

    // 3. Определение платформы по endpoint
    let platform = 'Unknown';
    if (sub.endpoint.includes('fcm.googleapis.com')) {
      platform = 'Android/Chrome (FCM)';
    } else if (sub.endpoint.includes('wns2-')) {
      platform = 'Windows (WNS)';
    } else if (sub.endpoint.includes('updates.push.services.mozilla.com')) {
      platform = 'Firefox';
    } else if (sub.endpoint.includes('safari')) {
      platform = 'Safari/iOS';
    }

    console.log(`   Платформа: ${platform}`);

    // 4. Попытка отправки тестового уведомления
    console.log('   Тестовая отправка...');
    try {
      const payload = JSON.stringify({
        title: 'Тест диагностики',
        body: 'Если видишь это, push работает!',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: { test: true },
        url: '/',
      });

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

      console.log('   ✅ Уведомление успешно отправлено');
    } catch (error) {
      console.log(`   ❌ Ошибка отправки: ${error.message}`);
      
      if (error.statusCode) {
        console.log(`   Код ошибки: ${error.statusCode}`);
        
        if (error.statusCode === 410) {
          console.log('   ⚠️  Подписка недействительна (410) - нужно удалить из БД');
        } else if (error.statusCode === 400) {
          console.log('   ⚠️  Неверный запрос (400) - проверь VAPID ключи');
        } else if (error.statusCode === 401) {
          console.log('   ⚠️  Неавторизован (401) - проверь VAPID ключи');
        } else if (error.statusCode === 413) {
          console.log('   ⚠️  Payload слишком большой (413)');
        }
      }

      if (error.body) {
        console.log(`   Детали ошибки: ${error.body}`);
      }
    }
    console.log('');
  }

  console.log('✅ Диагностика завершена');
}

diagnose().catch(console.error);

