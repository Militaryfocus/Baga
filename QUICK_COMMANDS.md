# Быстрые команды для управления проектом

## 🚀 Установка

### Автоматическая установка на VDS
```bash
sudo ./install-vds.sh
```

### Запуск для разработки
```bash
# Первый запуск
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker-compose up --build
```

### Запуск для production
```bash
cp .env.prod.example .env
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🔄 Обновление

### Автоматическое обновление (рекомендуется)
```bash
sudo ./update-vds.sh
```

### Ручное обновление
```bash
# Остановить контейнеры
docker-compose -f docker-compose.prod.yml down

# Получить изменения
git pull

# Пересобрать и запустить
docker-compose -f docker-compose.prod.yml up -d --build

# Применить миграции
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### Быстрое обновление без остановки (zero-downtime)
```bash
git pull
docker-compose -f docker-compose.prod.yml up -d --build --no-deps backend frontend
```

---

## 🛠 Управление контейнерами

### Запуск
```bash
# Development
docker-compose up

# Production (фоновый режим)
docker-compose -f docker-compose.prod.yml up -d
```

### Остановка
```bash
# Development
docker-compose down

# Production
docker-compose -f docker-compose.prod.yml down

# С удалением volumes (ВНИМАНИЕ: удалит данные!)
docker-compose down -v
```

### Перезапуск
```bash
# Все сервисы
docker-compose restart

# Конкретный сервис
docker-compose restart backend
docker-compose restart frontend
```

### Пересборка
```bash
# Пересобрать все
docker-compose build --no-cache

# Пересобрать конкретный сервис
docker-compose build --no-cache backend
```

---

## 📊 Мониторинг и логи

### Просмотр статуса
```bash
docker-compose ps
```

### Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f nginx

# Последние 100 строк
docker-compose logs --tail=100 backend
```

### Использование ресурсов
```bash
docker stats
```

### Вход в контейнер
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# PostgreSQL
docker-compose exec postgres psql -U ml_user mobile_legends_community

# Production
docker exec -it ml_community_backend_prod sh
```

---

## 🗄 База данных

### Миграции
```bash
# Создать миграцию
docker-compose exec backend npx prisma migrate dev --name migration_name

# Применить миграции (production)
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Сбросить базу (ВНИМАНИЕ: удалит все данные!)
docker-compose exec backend npx prisma migrate reset --force
```

### Seed данные
```bash
# Заполнить базу начальными данными
docker-compose exec backend npx prisma db seed
```

### Резервное копирование
```bash
# Создать backup
docker-compose exec postgres pg_dump -U ml_user mobile_legends_community > backup_$(date +%Y%m%d_%H%M%S).sql

# Production
docker exec ml_community_postgres_prod pg_dump -U ml_user_prod mobile_legends_community_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановить из backup
docker-compose exec -T postgres psql -U ml_user mobile_legends_community < backup.sql
```

### Prisma Studio (GUI для базы данных)
```bash
docker-compose exec backend npx prisma studio
# Откроется на http://localhost:5555
```

---

## 🧹 Очистка

### Очистка Docker
```bash
# Удалить остановленные контейнеры
docker container prune

# Удалить неиспользуемые образы
docker image prune -a

# Удалить неиспользуемые volumes
docker volume prune

# Полная очистка (ВНИМАНИЕ!)
docker system prune -a --volumes
```

### Очистка проекта
```bash
# Удалить node_modules
rm -rf backend/node_modules frontend/node_modules node_modules

# Удалить build артефакты
rm -rf backend/dist frontend/dist
```

---

## 🔍 Отладка и тестирование

### Health check
```bash
# Через nginx
curl http://localhost/api/health

# Напрямую
curl http://localhost:3001/api/health

# Production
curl https://yourdomain.com/api/health
```

### Проверка портов
```bash
# Проверить какие порты слушаются
netstat -tlnp | grep -E ':(80|443|3000|3001|5432|6379)'

# Или с помощью ss
ss -tlnp | grep -E ':(80|443|3000|3001|5432|6379)'
```

### Проверка SSL сертификатов
```bash
# Проверить SSL сертификат
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Проверить дату истечения
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 🔐 Безопасность

### Смена паролей
```bash
# 1. Обновите .env файл с новыми паролями
nano .env

# 2. Пересоздайте контейнеры
docker-compose down -v
docker-compose up -d
```

### Обновление SSL сертификатов (Let's Encrypt)
```bash
# Обновить вручную
certbot renew

# Скопировать в проект
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/

# Перезапустить nginx
docker-compose restart nginx
```

---

## 📈 Производительность

### Просмотр размера volumes
```bash
docker system df -v
```

### Просмотр размера образов
```bash
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

### Оптимизация образов
```bash
# Пересборка с --no-cache
docker-compose build --no-cache --pull
```

---

## 🆘 Решение проблем

### Проблемы при сборке (зависание на Alpine packages)
```bash
# Быстрое исправление
sudo ./fix-build.sh

# Или вручную:
docker builder prune -f
docker system prune -f
export DOCKER_BUILDKIT=1
docker-compose -f docker-compose.prod.yml build --no-cache

# Подробная информация
cat BUILD_TROUBLESHOOTING.md
```

### Контейнеры не запускаются
```bash
# Просмотреть логи
docker-compose logs

# Проверить конфигурацию
docker-compose config

# Полная пересборка
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Проблемы с портами
```bash
# Найти процесс на порту
lsof -i :80
lsof -i :3001

# Убить процесс
kill -9 $(lsof -t -i:80)
```

### База данных не отвечает
```bash
# Перезапустить postgres
docker-compose restart postgres

# Проверить логи
docker-compose logs postgres

# Проверить подключение
docker-compose exec postgres pg_isready -U ml_user
```

### Недостаточно места
```bash
# Проверить использование диска
df -h

# Очистить Docker
docker system prune -a --volumes

# Очистить логи
truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

---

## 📦 Разработка

### Установка зависимостей
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Запуск в dev режиме (без Docker)
```bash
# Backend (требует запущенные postgres и redis)
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### Линтинг и форматирование
```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
npm run format
```

---

## 🔑 Тестовые пользователи

После выполнения `prisma db seed`:

- **Admin**: admin@mobilelegends.com / admin123
- **User**: test@mobilelegends.com / admin123

---

## 📞 Полезные ссылки

- Frontend (dev): http://localhost:3000
- Backend API (dev): http://localhost:3001/api
- API Docs: http://localhost:3001/api-docs
- Prisma Studio: http://localhost:5555
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## 💡 Советы

1. **Используйте алиасы** для часто используемых команд:
```bash
alias dc='docker-compose'
alias dcp='docker-compose -f docker-compose.prod.yml'
alias dcl='docker-compose logs -f'
alias dps='docker-compose ps'
```

2. **Создайте backup скрипт** в cron:
```bash
# Каждый день в 3:00
0 3 * * * /opt/mobile-legends-community/backup.sh
```

3. **Мониторинг логов в реальном времени**:
```bash
docker-compose logs -f | grep -i error
```

4. **Быстрая проверка всех сервисов**:
```bash
docker-compose ps && curl -s http://localhost/api/health | jq
```

---

**Создано с ❤️ для сообщества Mobile Legends**
