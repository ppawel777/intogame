-- Миграция для отложенной очистки чата через сутки после завершения игры

-- 1. Добавляем поле для хранения времени изменения статуса (если его нет)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' 
        AND column_name = 'status_changed_at'
    ) THEN
        ALTER TABLE games ADD COLUMN status_changed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. Удаляем старый триггер и функцию
DROP TRIGGER IF EXISTS trigger_cleanup_game_chat ON games;
DROP FUNCTION IF EXISTS cleanup_game_chat_on_status_change();

-- 3. Создаем новую функцию - сохраняет время изменения статуса вместо немедленного удаления
CREATE OR REPLACE FUNCTION set_status_changed_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Если статус изменился на "Завершена" или "Отменена"
    IF NEW.game_status IN ('Завершена', 'Отменена') 
       AND (OLD.game_status IS NULL OR OLD.game_status NOT IN ('Завершена', 'Отменена')) THEN
        NEW.status_changed_at = NOW();
        RAISE NOTICE 'Game % status changed to %, cleanup scheduled for %', NEW.id, NEW.game_status, NOW() + INTERVAL '24 hours';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Создаем триггер на изменение статуса
CREATE TRIGGER trigger_set_status_changed_at
BEFORE UPDATE OF game_status ON games
FOR EACH ROW
WHEN (NEW.game_status IN ('Завершена', 'Отменена'))
EXECUTE FUNCTION set_status_changed_at();

-- 5. Создаем функцию для очистки старых сообщений (вызывается по расписанию или вручную)
CREATE OR REPLACE FUNCTION cleanup_old_game_chats()
RETURNS TABLE (game_id BIGINT, deleted_count INTEGER) AS $$
DECLARE
    rec RECORD;
    deleted INTEGER;
BEGIN
    -- Находим игры со статусом "Завершена" или "Отменена", 
    -- у которых прошло больше 24 часов с момента изменения статуса
    FOR rec IN 
        SELECT id 
        FROM games 
        WHERE game_status IN ('Завершена', 'Отменена')
        AND status_changed_at IS NOT NULL
        AND status_changed_at < NOW() - INTERVAL '24 hours'
    LOOP
        -- Удаляем сообщения для этой игры
        DELETE FROM game_chat_messages 
        WHERE game_chat_messages.game_id = rec.id;
        
        GET DIAGNOSTICS deleted = ROW_COUNT;
        
        IF deleted > 0 THEN
            RAISE NOTICE 'Deleted % messages for game %', deleted, rec.id;
            game_id := rec.id;
            deleted_count := deleted;
            RETURN NEXT;
        END IF;
        
        -- Обнуляем status_changed_at, чтобы не проверять эту игру снова
        UPDATE games 
        SET status_changed_at = NULL 
        WHERE id = rec.id;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- 6. Создаем функцию-обертку для pg_cron (без параметров)
CREATE OR REPLACE FUNCTION cleanup_old_game_chats_cron()
RETURNS void AS $$
BEGIN
    PERFORM cleanup_old_game_chats();
END;
$$ LANGUAGE plpgsql;

-- 7. Настройка pg_cron (опционально, если доступно)
-- Раскомментируйте и выполните вручную, если pg_cron установлен:

-- SELECT cron.schedule(
--     'cleanup-game-chats',        -- название задачи
--     '0 */6 * * *',               -- каждые 6 часов
--     'SELECT cleanup_old_game_chats_cron();'
-- );

-- Альтернатива без pg_cron: вызывайте функцию вручную или через API
-- SELECT * FROM cleanup_old_game_chats();

-- Комментарии:
-- 1. При изменении статуса на "Завершена" или "Отменена" сохраняется время в status_changed_at
-- 2. Функция cleanup_old_game_chats() удаляет сообщения для игр, у которых прошло > 24 часов
-- 3. Можно вызывать вручную: SELECT * FROM cleanup_old_game_chats();
-- 4. Или настроить pg_cron для автоматического запуска каждые 6 часов
-- 5. Если pg_cron недоступен, можно вызывать функцию через API (Node.js cron job)

