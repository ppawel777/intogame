# Настройка PWA с Push-уведомлениями

## Описание

Реализована поддержка PWA (Progressive Web App) с push-уведомлениями для мобильных и десктопных устройств.

## Шаг 1: Настройка Supabase

### 1.1. Применить SQL миграцию

Выполни в Supabase SQL Editor:

```bash
backend/migrations/push_subscriptions.sql
```

Это создаст таблицу `push_subscriptions` для хранения подписок пользователей.

### 1.2. Проверка

Убедись, что таблица создана:

```sql
SELECT * FROM push_subscriptions LIMIT 1;
```

## Шаг 2: Настройка Backend

### 2.1. Установка зависимостей

```bash
cd backend
npm install
```

Это установит `web-push` для работы с push-уведомлениями.

### 2.2. Генерация VAPID ключей

VAPID (Voluntary Application Server Identification) ключи нужны для идентификации сервера при отправке push-уведомлений.

**Вариант 1: Через скрипт (рекомендуется)**

```bash
node scripts/generate-vapid-keys.js
```

**Вариант 2: Через npx**

```bash
npx web-push generate-vapid-keys
```

Скопируй сгенерированные ключи.

### 2.3. Настройка переменных окружения

Добавь в `.env` файл:

```env
# VAPID keys для Web Push уведомлений
VAPID_PUBLIC_KEY=твой_публичный_ключ
VAPID_PRIVATE_KEY=твой_приватный_ключ
VAPID_SUBJECT=mailto:your-email@example.com
```

⚠️ **ВАЖНО**: 
- `VAPID_PRIVATE_KEY` должен храниться в секрете!
- Не коммить эти ключи в git!
- Используй разные ключи для dev и production

### 2.4. Проверка работы

Запусти сервер:

```bash
npm run dev
```

Проверь endpoint:

```bash
curl http://localhost:3000/api/push/vapid-public-key
```

Должен вернуться публичный ключ.

## API Endpoints

### POST /api/push/subscribe

Регистрация push-подписки пользователя.

**Request:**
```json
{
  "userId": 123,
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "subscription": { ... }
}
```

### DELETE /api/push/unsubscribe

Удаление push-подписки.

**Request:**
```json
{
  "userId": 123,
  "endpoint": "https://fcm.googleapis.com/..."
}
```

### POST /api/push/send

Отправка push-уведомления пользователю или группе пользователей.

**Request:**
```json
{
  "userIds": [123, 456],
  "title": "Новая игра!",
  "body": "Создана новая игра на завтра",
  "icon": "/icon-192x192.png",
  "badge": "/icon-192x192.png",
  "url": "/games/123",
  "data": {
    "gameId": 123
  }
}
```

**Response:**
```json
{
  "success": true,
  "sent": 2,
  "failed": 0,
  "total": 2
}
```

### GET /api/push/vapid-public-key

Получение публичного VAPID ключа для клиента.

**Response:**
```json
{
  "publicKey": "..."
}
```

## Интеграция с приложением

### Примеры использования

**Отправка уведомления о новой игре:**

```typescript
// В коде создания игры
await fetch('/api/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userIds: [/* список пользователей */],
    title: 'Новая игра!',
    body: `Создана игра на ${gameDate}`,
    url: `/games/${gameId}`,
    data: { gameId }
  })
});
```

**Отправка напоминания о предстоящей игре:**

```typescript
// В cron job или scheduled task
await fetch('/api/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userIds: [/* участники игры */],
    title: 'Напоминание об игре',
    body: `Игра начнётся через 1 час!`,
    url: `/games/${gameId}`,
    data: { gameId }
  })
});
```

## Безопасность

1. **VAPID Private Key** - храни в секрете, не коммить в git
2. **Аутентификация** - добавь проверку авторизации в роуты (если нужно)
3. **Валидация** - все входные данные валидируются
4. **Очистка** - недействительные подписки автоматически удаляются

## Troubleshooting

### Ошибка "VAPID keys не настроены"

- Проверь, что переменные окружения установлены
- Перезапусти сервер после изменения .env

### Уведомления не приходят

1. Проверь, что подписка сохранена в БД
2. Проверь логи сервера на ошибки
3. Убедись, что VAPID keys правильные
4. Проверь, что браузер поддерживает push-уведомления

### Подписка недействительна (410)

- Подписка автоматически удаляется из БД
- Пользователю нужно заново подписаться

## Следующие шаги

1. Настройка фронтенда (Service Worker, регистрация подписки)
2. Добавление UI для управления уведомлениями
3. Интеграция с событиями приложения (новые игры, изменения статуса и т.д.)

