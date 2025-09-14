npm run install:all           # Установить всё сразу
npm run dev                   # Запустить оба сервера

docker compose up --build     # Запуск через Docker Compose в корне проекта

Другие команды docker:
 - docker compose down
 - docker compose logs backend
 - docker ps



После запуска:
   * Frontend: https://localhost:5173
   * Backend: http://localhost:3000/api/health
