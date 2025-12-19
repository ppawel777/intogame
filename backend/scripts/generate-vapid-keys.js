#!/usr/bin/env node

/**
 * Скрипт для генерации VAPID ключей для Web Push уведомлений
 * 
 * Использование:
 *   node scripts/generate-vapid-keys.js
 * 
 * Или через npx:
 *   npx web-push generate-vapid-keys
 */

const webpush = require('web-push');

console.log('Генерация VAPID ключей для Web Push уведомлений...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID ключи сгенерированы!\n');
console.log('Добавь эти значения в .env файл:\n');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:your-email@example.com\n`);
console.log('⚠️  ВАЖНО: VAPID_PRIVATE_KEY должен храниться в секрете!');
console.log('⚠️  Не коммить эти ключи в git!');

