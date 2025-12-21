#### Настройка переменных окружения

Создаем файл .env и по примеру env.example заполняем.

1. **Frontend (.env файл в папке frontend/):**
`cd frontend`
`cp env.example .env`

2. **Backend (.env файл в папке backend/):**
`cd backend`
`cp env.example .env`


#### Локальная разработка

`npm run install:all` # Установить всё сразу
`docker compose --profile development up --build -d` # Запуск через Docker Compose (frontend и backend)
  
После запуска:
Frontend: https://localhost:5173
Backend: http://localhost:3000/api/health

#### Запуск на сервере

1. **Собираем front**
`cd ~/frontend-deploy/frontend/`
`git pull`
`npm install`

_Убедитесь, что создан .env файл_

`npm run build`
`sudo cp -r build/* /var/www/example.ru/html/`
`sudo systemctl restart nginx`

2. **Собираем backend**
`cd ~/frontend-deploy/`
`git pull`

_Убедитесь, что создан /backend/.env файл_

`docker compose up --build -d` # Запуск через Docker Compose (только backend)
  

**Другие команды docker:**
- docker compose --profile development down
- docker compose --profile development logs backend / frontend
- docker ps
- docker logs -n 100 frontend-deploy-backend-1
- docker logs -f -n 100 frontend-deploy-backend-1

#### Развертывание PWA на продакшене

Приложение поддерживает PWA (Progressive Web App) с push-уведомлениями. Для корректной работы требуется HTTPS.

##### Подготовка бекенда для PWA

1. **Генерация VAPID ключей для push-уведомлений:**

```bash
cd ~/frontend-deploy/backend
node scripts/generate-vapid-keys.js
```

Скопируй сгенерированные ключи.

2. **Добавь в `backend/.env`:**

```env
# VAPID keys для Web Push уведомлений
VAPID_PUBLIC_KEY=твой_публичный_ключ
VAPID_PRIVATE_KEY=твой_приватный_ключ
VAPID_SUBJECT=mailto:admin@example.ru

# URL фронтенда для CORS
FRONTEND_URL=https://example.ru
```

3. **Примени SQL миграцию в Supabase:**

Выполни в Supabase SQL Editor файл `backend/migrations/push_subscriptions.sql` для создания таблицы `push_subscriptions`.

4. **Перезапусти бекенд:**

```bash
cd ~/frontend-deploy
docker compose up --build -d
```

Проверь работу:
```bash
curl https://example.ru/api/push/vapid-public-key
```

##### Подготовка фронтенда для PWA

1. **Убедись, что в `frontend/.env` указан правильный URL:**

```env
VITE_API_BASE_URL=https://example.ru
```

2. **Проверь наличие иконок в `frontend/public/`:**

- `icon-192x192.png` (192x192px)
- `icon-512x512.png` (512x512px)
- `favicon.ico`
- `push-handlers.js`

3. **Собери фронтенд:**

```bash
cd ~/frontend-deploy/frontend/
git pull
npm install
NODE_ENV=production npm run build
```

После сборки проверь, что в `build/` есть:
- `manifest.webmanifest`
- `sw.js` (Service Worker)
- `push-handlers.js`
- Иконки

##### Настройка Nginx для PWA

Важно: Service Worker и манифест не должны кэшироваться.

Добавь в конфигурацию Nginx (`/etc/nginx/sites-available/example.ru`):

```nginx
# Service Worker и манифест - БЕЗ кэширования
location ~* (sw\.js|manifest\.webmanifest|push-handlers\.js)$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}

# Статические файлы - с кэшированием
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

После обновления конфигурации:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

##### Проверка PWA

1. **Проверь файлы:**

```bash
curl https://example.ru/manifest.webmanifest
curl https://example.ru/sw.js
curl https://example.ru/push-handlers.js
```

2. **В браузере:**

- Открой https://example.ru
- DevTools → Application → Manifest (проверь манифест)
- DevTools → Application → Service Workers (проверь регистрацию SW)

3. **Тест push-уведомлений:**

- Войди в профиль и включи push-уведомления
- Отправь тестовое уведомление:

```bash
curl -X POST https://example.ru/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": [твой_user_id],
    "title": "Тест PWA",
    "body": "Проверка работы push-уведомлений",
    "url": "/profile"
  }'
```

##### Важные замечания

- **HTTPS обязателен** - Service Worker работает только по HTTPS (кроме localhost)
- **MIME типы** - Nginx должен правильно отдавать `.js` и `.webmanifest`
- **Кэширование** - Service Worker и манифест не должны кэшироваться
- **CORS** - Бекенд должен разрешать запросы с `https://example.ru`
- **VAPID ключи** - Используй разные ключи для dev и production

##### Troubleshooting

Если PWA не работает:
- Проверь HTTPS (должно быть `https://`, не `http://`)
- Проверь консоль браузера на ошибки
- Проверь логи Nginx: `sudo tail -f /var/log/nginx/example.ru.error.log`

Если push-уведомления не работают:
- Проверь VAPID ключи в `.env` бекенда
- Проверь, что подписка сохранена в БД
- Проверь логи бекенда: `docker logs -f frontend-deploy-backend-1`

Подробная документация:
- Frontend: `frontend/PWA_SETUP.md`
- Backend: `backend/PWA_SETUP.md`
- Тестирование: `frontend/PWA_TESTING.md`