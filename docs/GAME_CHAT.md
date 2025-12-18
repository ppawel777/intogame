# Функционал чата игры

## Описание

Реализован функционал чата для общения участников игры. Чат позволяет организатору и участникам обсуждать организационные моменты перед игрой.

## Особенности

- ✅ Realtime обновления сообщений (через Supabase Realtime)
- ✅ Автоматическая очистка сообщений после завершения или отмены игры
- ✅ Выделение сообщений организатора зеленым цветом
- ✅ Отображение аватаров пользователей
- ✅ Адаптивный дизайн (мобильные и десктоп устройства)
- ✅ Row Level Security (RLS) для безопасного доступа к данным

## Установка и настройка

### 1. Применение миграции БД

Выполните SQL скрипт в Supabase SQL Editor:

```bash
backend/migrations/game_chat.sql
```

Или скопируйте и выполните содержимое файла в Supabase Dashboard → SQL Editor.

### 2. Включение Realtime в Supabase

1. Перейдите в Supabase Dashboard → Database → Replication
2. Найдите таблицу `game_chat_messages`
3. Включите Realtime для таблицы (переключатель "Enable Realtime")

### 3. Проверка установки

После применения миграции должны быть созданы:

- Таблица `game_chat_messages`
- View `view_game_chat_messages`
- Индексы для производительности
- RLS политики
- Триггер для автоматической очистки сообщений

## Структура БД

### Таблица `game_chat_messages`

| Поле       | Тип                      | Описание                          |
|------------|--------------------------|-----------------------------------|
| id         | BIGSERIAL                | Primary key                       |
| game_id    | BIGINT                   | ID игры (FK to games)             |
| user_id    | UUID                     | ID пользователя (FK to auth.users)|
| message    | TEXT                     | Текст сообщения                   |
| created_at | TIMESTAMP WITH TIME ZONE | Время создания                    |

### View `view_game_chat_messages`

Объединяет данные из `game_chat_messages`, `profiles` и `games`:

- Все поля из `game_chat_messages`
- `user_name` - логин пользователя
- `avatar_url` - URL аватара
- `is_creator` - флаг организатора игры

## API функции

Все функции находятся в `frontend/src/api/gameChat.ts`:

### `fetchGameChatMessages(gameId: number)`

Получить все сообщения для игры.

```typescript
const messages = await fetchGameChatMessages(gameId)
```

### `sendGameChatMessage(gameId: number, message: string)`

Отправить сообщение в чат.

```typescript
await sendGameChatMessage(gameId, 'Привет всем!')
```

### `subscribeToGameChat(gameId: number, callback: Function)`

Подписаться на новые сообщения (realtime).

```typescript
const subscription = subscribeToGameChat(gameId, (newMessage) => {
   console.log('Новое сообщение:', newMessage)
})
```

### `unsubscribeFromGameChat(subscription)`

Отписаться от обновлений.

```typescript
await unsubscribeFromGameChat(subscription)
```

## Использование компонента

### DrawerChat

Компонент находится в:
`frontend/src/pages/Games/GamesDetails/components/GamerListBlock/PlayersList/DrawerChat.tsx`

Пример использования:

```tsx
import { DrawerChat } from './DrawerChat'

const [chatOpen, setChatOpen] = useState(false)

<DrawerChat 
   open={chatOpen} 
   onClose={() => setChatOpen(false)} 
   gameId={gameId} 
/>
```

## Безопасность (RLS)

### Чтение сообщений

Могут только:
- Участники игры (есть запись в `game_users`)
- Создатель игры

### Отправка сообщений

Могут только:
- Авторизованные пользователи
- Которые являются участниками или создателем игры

## Автоматическая очистка

Сообщения **автоматически удаляются** при изменении статуса игры на:
- "Завершена"
- "Отменена"

Это происходит через триггер `trigger_cleanup_game_chat`.

## Тестирование

### Проверка работы чата:

1. Войдите в игру как участник
2. Нажмите кнопку "Чат с игроками"
3. Отправьте сообщение
4. Откройте игру в другой вкладке (под другим пользователем)
5. Убедитесь, что сообщение отображается в реальном времени

### Проверка очистки:

1. Создайте несколько сообщений в чате игры
2. Измените статус игры на "Завершена"
3. Проверьте, что сообщения удалены:

```sql
SELECT * FROM game_chat_messages WHERE game_id = <game_id>;
```

Должно вернуть пустой результат.

## Возможные улучшения

- [ ] Редактирование сообщений
- [ ] Удаление своих сообщений
- [ ] Отметка о прочтении
- [ ] Уведомления о новых сообщениях
- [ ] Прикрепление файлов/изображений
- [ ] Эмодзи и стикеры
- [ ] Ответы на сообщения (reply)
- [ ] Поиск по сообщениям

## Troubleshooting

### Сообщения не отправляются

1. Проверьте, что пользователь авторизован
2. Проверьте RLS политики в Supabase
3. Проверьте консоль браузера на наличие ошибок

### Realtime не работает

1. Убедитесь, что Realtime включен для таблицы `game_chat_messages`
2. Проверьте настройки Supabase проекта
3. Проверьте лимиты Realtime в тарифном плане

### Сообщения не удаляются автоматически

1. Проверьте, что триггер создан: `\df cleanup_game_chat_on_status_change`
2. Проверьте логи в Supabase Dashboard → Logs
3. Убедитесь, что статус игры изменяется корректно

