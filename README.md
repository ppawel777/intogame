**Настройка переменных окружения:**

1. **Frontend (.env файл в папке frontend/):**
`
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3000
`

2. **Backend (.env файл в папке backend/):**
`
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
YOOKASSA_WEBHOOK_LOGIN=your_webhook_login
YOOKASSA_WEBHOOK_PASSWORD=your_webhook_password
FRONTEND_URL=https://localhost:5173
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
`


**Локальная разработка:**

`npm run install:all` # Установить всё сразу
`npm run dev` # Запустить оба сервера

`docker compose up --build` # Запуск через Docker Compose в корне проекта


Другие команды docker:
- docker compose down
- docker compose logs backend
- docker ps

После запуска:
	Frontend: https://localhost:5173
	Backend: http://localhost:3000/api/health
  

**Запуск на сервере:**

1. Собираем front и копируем в каталог /var/www/intogame.ru/html

`cd ~/frontend-deploy/frontend/`
`git pull`
`npm install`
# Убедитесь, что создан .env файл с переменными VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY
`npm run build`
`sudo cp -r build/* /var/www/intogame.ru/html/`
`sudo systemctl restart nginx`

2. Собираем backend

`cd ~/frontend-deploy/`
`git pull`
`sudo cp -r backend/* /var/www/intogame.ru/backend/`
`cd /var/www/intogame.ru/backend/`
`npm run build`
`sudo systemctl restart nginx`
`pm2 start npm --name "backend" -- start`     # Запуск
`pm2 restart backend`      # Перезапуск
  
Полезные команды:
- pm2 restart backend
- pm2 logs backend
- pm2 list
- pm2 monit
- pm2 restart backend
- pm2 stop backend
- pm2 delete backend
- pm2 startup # Настроить автозапуск
- pm2 save # Сохранить текущие процессы