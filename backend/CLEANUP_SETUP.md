# Настройка отложенной очистки чата

## Описание

Сообщения чата удаляются **через 24 часа** после того, как игра переходит в статус "Завершена" или "Отменена".

## Установка

### Шаг 1: Применить SQL миграцию

Выполни в Supabase SQL Editor:

```bash
backend/migrations/game_chat_delayed_cleanup.sql
```

Это создаст:
- Поле `status_changed_at` в таблице `games`
- Функцию `cleanup_old_game_chats()` для очистки
- Триггер для сохранения времени изменения статуса

### Шаг 2: Выбрать способ автоматической очистки

#### Вариант A: pg_cron (если доступен в Supabase)

Проверь, доступен ли pg_cron:

```sql
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

Если да, настрой расписание:

```sql
SELECT cron.schedule(
    'cleanup-game-chats',
    '0 */6 * * *',  -- каждые 6 часов
    'SELECT cleanup_old_game_chats_cron();'
);
```

Для удаления задачи:

```sql
SELECT cron.unschedule('cleanup-game-chats');
```

#### Вариант B: Node.js cron (если pg_cron недоступен)

1. Установи зависимость:

```bash
cd backend
npm install node-cron
```

2. Добавь в `backend/src/index.ts`:

```typescript
import cron from 'node-cron'
import { supabaseAdmin } from './lib/supabase'

// Запуск очистки каждые 6 часов
cron.schedule('0 */6 * * *', async () => {
   console.log('[Cron] Running game chat cleanup...')
   try {
      const { data, error } = await supabaseAdmin.rpc('cleanup_old_game_chats')
      if (error) {
         console.error('[Cron] Cleanup error:', error)
      } else {
         const totalDeleted = (data || []).reduce((sum: number, item: any) => sum + (item.deleted_count || 0), 0)
         console.log(`[Cron] Cleaned up ${totalDeleted} messages from ${(data || []).length} games`)
      }
   } catch (err) {
      console.error('[Cron] Unexpected error:', err)
   }
})
```

3. Подключи роут для ручного вызова (опционально):

```typescript
// В backend/src/index.ts
import cleanupRoutes from './routes/cleanup'
app.use('/api/cleanup', cleanupRoutes)
```

#### Вариант C: Внешний cron (самый надежный)

Настрой внешний cron job на сервере:

```bash
# Отредактируй crontab
crontab -e

# Добавь строку (каждые 6 часов)
0 */6 * * * curl -X POST http://localhost:3000/api/cleanup/game-chats
```

### Шаг 3: Ручной вызов (для тестирования)

В SQL Editor:

```sql
SELECT * FROM cleanup_old_game_chats();
```

Через API:

```bash
curl -X POST http://localhost:3000/api/cleanup/game-chats
```

## Как это работает

1. Когда статус игры меняется на "Завершена" или "Отменена":
   - Триггер сохраняет текущее время в `games.status_changed_at`

2. Функция `cleanup_old_game_chats()`:
   - Находит игры, у которых `status_changed_at < NOW() - 24 часа`
   - Удаляет сообщения чата для этих игр
   - Обнуляет `status_changed_at`, чтобы не проверять снова

3. Cron job (или ручной вызов) запускает функцию очистки

## Проверка работы

### 1. Проверить, что триггер установлен:

```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_set_status_changed_at';
```

### 2. Проверить игры с запланированной очисткой:

```sql
SELECT id, game_status, status_changed_at, 
       status_changed_at + INTERVAL '24 hours' as cleanup_scheduled_for
FROM games 
WHERE status_changed_at IS NOT NULL;
```

### 3. Тестирование:

```sql
-- Измени статус игры
UPDATE games SET game_status = 'Завершена' WHERE id = 1;

-- Проверь, что status_changed_at установлен
SELECT id, game_status, status_changed_at FROM games WHERE id = 1;

-- Для теста можно сделать временной сдвиг (установить время в прошлом)
UPDATE games SET status_changed_at = NOW() - INTERVAL '25 hours' WHERE id = 1;

-- Запусти очистку вручную
SELECT * FROM cleanup_old_game_chats();

-- Проверь, что сообщения удалены
SELECT * FROM game_chat_messages WHERE game_id = 1;
```

## Откат изменений (если нужно вернуть старое поведение)

```sql
-- Удаляем новые функции и триггеры
DROP TRIGGER IF EXISTS trigger_set_status_changed_at ON games;
DROP FUNCTION IF EXISTS set_status_changed_at();
DROP FUNCTION IF EXISTS cleanup_old_game_chats();
DROP FUNCTION IF EXISTS cleanup_old_game_chats_cron();

-- Удаляем поле (опционально)
ALTER TABLE games DROP COLUMN IF EXISTS status_changed_at;

-- Восстанавливаем старый триггер (из game_chat.sql)
-- (скопируй код из предыдущей миграции)
```

## Рекомендации

- **Для production**: Используй pg_cron (если доступен) или внешний cron
- **Для разработки**: Используй Node.js cron или ручной вызов
- **Частота запуска**: Каждые 4-6 часов достаточно
- **Мониторинг**: Проверяй логи функции (RAISE NOTICE в SQL)

