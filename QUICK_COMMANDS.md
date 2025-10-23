# Быстрые команды

## 🐳 Docker команды

### Основные команды
```bash
# Запуск в режиме разработки
docker-compose up -d

# Запуск в production режиме
docker-compose -f docker-compose.prod.yml up -d

# Пересборка и запуск
docker-compose up -d --build

# Остановка контейнеров
docker-compose down

# Просмотр логов
docker-compose logs -f
```

### Работа с конкретными сервисами
```bash
# Перезапуск одного сервиса
docker-compose restart frontend
docker-compose restart backend

# Просмотр логов конкретного сервиса
docker-compose logs -f frontend
docker-compose logs -f backend

# Пересборка конкретного сервиса
docker-compose up -d --build frontend
docker-compose up -d --build backend
```

### Мониторинг
```bash
# Просмотр статуса контейнеров
docker-compose ps

# Проверка здоровья контейнеров
curl http://localhost:3001/api/health    # Backend
curl http://localhost:3002/health        # Frontend
curl http://localhost:6379               # Redis
pg_isready -h localhost -p 5432         # PostgreSQL

# Просмотр использования ресурсов
docker stats
```

## 🗄️ База данных

### Миграции Prisma
```bash
# Создание миграции
cd backend && npx prisma migrate dev --name имя_миграции

# Применение миграций
cd backend && npx prisma migrate deploy

# Сброс базы данных
cd backend && npx prisma migrate reset
```

### Работа с данными
```bash
# Заполнение тестовыми данными
cd backend && npx prisma db seed

# Просмотр базы через Prisma Studio
cd backend && npx prisma studio

# Создание бэкапа
docker-compose exec postgres pg_dump -U ml_user mobile_legends_community > backup.sql

# Восстановление из бэкапа
cat backup.sql | docker-compose exec -T postgres psql -U ml_user mobile_legends_community
```

## 📦 NPM команды

### Backend
```bash
# Установка зависимостей
cd backend && npm install

# Запуск в режиме разработки
cd backend && npm run dev

# Сборка проекта
cd backend && npm run build

# Запуск тестов
cd backend && npm test

# Проверка кода
cd backend && npm run lint
```

### Frontend
```bash
# Установка зависимостей
cd frontend && npm install

# Запуск в режиме разработки
cd frontend && npm run dev

# Сборка проекта
cd frontend && npm run build

# Запуск тестов
cd frontend && npm test

# Проверка кода
cd frontend && npm run lint
```

## 🔄 Обновление проекта

### Обновление на VDS
```bash
# Скачать последние изменения
cd /opt/mobile-legends
git pull origin main

# Пересборка и перезапуск
docker-compose -f docker-compose.prod.yml up -d --build
```

### Обновление локально
```bash
# Скачать изменения
git pull origin main

# Пересборка
docker-compose up -d --build
```

## 🔒 SSL сертификаты

```bash
# Получение SSL сертификата
sudo certbot --nginx -d your-domain.com

# Обновление сертификатов
sudo certbot renew
```

## 🧹 Очистка

```bash
# Очистка неиспользуемых контейнеров
docker container prune

# Очистка неиспользуемых образов
docker image prune

# Очистка неиспользуемых томов
docker volume prune

# Полная очистка
docker system prune -a
```

## 🔍 Отладка

### Просмотр логов
```bash
# Все логи
docker-compose logs -f

# Логи с временными метками
docker-compose logs -f -t

# Последние 100 строк
docker-compose logs -f --tail=100
```

### Подключение к контейнерам
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# PostgreSQL
docker-compose exec postgres psql -U ml_user mobile_legends_community

# Redis
docker-compose exec redis redis-cli
```

### Проверка сети
```bash
# Просмотр сетей Docker
docker network ls

# Информация о конкретной сети
docker network inspect baga_ml_network

# Проверка портов
netstat -tulpn | grep LISTEN
```