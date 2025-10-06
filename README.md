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
`sudo cp -r build/* /var/www/intogame.ru/html/`
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
- docker logs frontend-dev-backend-1 --follow/tail -100