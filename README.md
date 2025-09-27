**Заполняем .env**
  

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

`cd /home/intogame/frontent-delpoy/frontend/`
`git pull`
`npm run build`
`sudo cp -r build/* /var/www/intogame.ru/html/`
`sudo systemctl restart nginx`

2. Собираем backend

`cd /home/intogame/frontent-delpoy/`
`git pull`
`sudo cp -r backend/* /var/www/intogame.ru/backend/`
`sudo systemctl restart nginx
`pm2 start npm --name "backend" -- start`     # Зап
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