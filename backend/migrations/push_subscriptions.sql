-- Миграция для поддержки PWA push-уведомлений

-- Таблица для хранения push-подписок пользователей
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint) -- Один пользователь может иметь несколько устройств
);

-- Индекс для быстрого поиска подписок пользователя
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS trigger_update_push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER trigger_update_push_subscriptions_updated_at
BEFORE UPDATE ON push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- Комментарии для документации
COMMENT ON TABLE push_subscriptions IS 'Хранит push-подписки пользователей для PWA уведомлений';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'URL endpoint для отправки push-уведомлений';
COMMENT ON COLUMN push_subscriptions.p256dh IS 'Публичный ключ для шифрования (P256DH)';
COMMENT ON COLUMN push_subscriptions.auth IS 'Секретный ключ для аутентификации (Auth)';

