# Установка на VDS

Это подробное руководство по установке Mobile Legends Fan Community на VDS.

## 🖥️ Системные требования

### Минимальные:
- **CPU**: 2 ядра
- **RAM**: 2 GB
- **Диск**: 20 GB SSD
- **ОС**: Ubuntu 20.04/22.04/24.04
- **Сеть**: 100 Mbps

### Рекомендуемые:
- **CPU**: 4 ядра
- **RAM**: 4 GB
- **Диск**: 40 GB SSD
- **ОС**: Ubuntu 24.04
- **Сеть**: 1 Gbps

### Дополнительно:
- Доменное имя (для SSL)
- Открытые порты: 80, 443, 3000, 3001
- Белый IP адрес

## 📋 Пошаговая установка

### 1. Подготовка системы

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка базовых пакетов
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common \
    git \
    nginx \
    ufw \
    ntp \
    htop \
    fail2ban

# Настройка временной зоны
sudo timedatectl set-timezone Europe/Moscow

# Настройка firewall
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 3000
sudo ufw allow 3001
sudo ufw enable

# Настройка fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. Установка Docker

```bash
# Удаление старых версий
sudo apt remove docker docker-engine docker.io containerd runc

# Установка Docker через скрипт
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Включение и запуск Docker
sudo systemctl enable docker
sudo systemctl start docker

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Установка проекта

```bash
# Создание рабочей директории
sudo mkdir -p /opt/mobile-legends
sudo chown -R $USER:$USER /opt/mobile-legends

# Клонирование репозитория
git clone https://github.com/Militaryfocus/Baga.git /opt/mobile-legends
cd /opt/mobile-legends

# Настройка окружения
cp .env.example .env
```

### 4. Настройка переменных окружения

Отредактируйте файл `.env`:
```env
# Основные настройки
NODE_ENV=production
DOMAIN=your-domain.com

# PostgreSQL
POSTGRES_DB=mobile_legends_community
POSTGRES_USER=ml_user
POSTGRES_PASSWORD=your-secure-password
POSTGRES_MAX_CONNECTIONS=100

# Redis
REDIS_URL=redis://redis:6379
REDIS_MAX_MEMORY=512mb

# JWT
JWT_SECRET=your-very-secure-jwt-secret
JWT_EXPIRES_IN=7d

# API и CORS
API_URL=https://your-domain.com/api
CORS_ORIGIN=https://your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# WebSocket
WS_URL=wss://your-domain.com
```

### 5. Настройка Nginx

```bash
# Создание SSL директории
sudo mkdir -p /opt/mobile-legends/nginx/ssl
sudo chown -R $USER:$USER /opt/mobile-legends/nginx/ssl

# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение SSL сертификата
sudo certbot --nginx -d your-domain.com

# Настройка автоматического обновления сертификатов
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 6. Запуск приложения

```bash
# Переход в директорию проекта
cd /opt/mobile-legends

# Запуск в production режиме
docker-compose -f docker-compose.prod.yml up -d --build

# Проверка статуса
docker-compose ps
```

### 7. Инициализация базы данных

```bash
# Применение миграций
docker-compose exec backend npx prisma migrate deploy

# Заполнение начальными данными
docker-compose exec backend npx prisma db seed
```

### 8. Проверка работоспособности

```bash
# Проверка API
curl https://your-domain.com/api/health

# Проверка Frontend
curl -I https://your-domain.com

# Проверка WebSocket
curl -I wss://your-domain.com
```

### 9. Настройка мониторинга

```bash
# Проверка логов
docker-compose logs -f

# Мониторинг ресурсов
docker stats

# Проверка состояния сервисов
docker-compose ps
```

### 10. Настройка резервного копирования

```bash
# Создание директории для бэкапов
sudo mkdir -p /opt/backups
sudo chown -R $USER:$USER /opt/backups

# Создание скрипта бэкапа
cat > /opt/backups/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Бэкап базы данных
docker-compose exec -T postgres pg_dump -U ml_user mobile_legends_community > "$BACKUP_DIR/db_$DATE.sql"

# Бэкап загруженных файлов
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" /opt/mobile-legends/uploads/

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +7 -delete
EOF

# Делаем скрипт исполняемым
chmod +x /opt/backups/backup.sh

# Добавление в cron (каждый день в 3:00)
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/backups/backup.sh") | crontab -
```

## 🔍 Проверка установки

### 1. Проверка контейнеров
```bash
docker-compose ps
```
Все контейнеры должны быть в статусе "Up" и "healthy".

### 2. Проверка сервисов
```bash
# Frontend
curl -I http://your-domain.com

# Backend API
curl http://your-domain.com/api/health

# WebSocket
curl -I ws://your-domain.com
```

### 3. Проверка логов
```bash
# Все логи
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f frontend
docker-compose logs -f backend
```

## 🔄 Обновление

### Автоматическое обновление
```bash
sudo ./update-vds.sh
```

### Ручное обновление
```bash
cd /opt/mobile-legends
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

## ❗ Устранение неполадок

### 1. Контейнеры не запускаются
```bash
# Проверка логов
docker-compose logs -f

# Проверка дискового пространства
df -h

# Проверка памяти
free -m
```

### 2. Проблемы с базой данных
```bash
# Проверка состояния PostgreSQL
docker-compose exec postgres pg_isready

# Проверка подключения к Redis
docker-compose exec redis redis-cli ping
```

### 3. Сетевые проблемы
```bash
# Проверка открытых портов
netstat -tulpn | grep LISTEN

# Проверка сетей Docker
docker network ls
docker network inspect baga_ml_network
```

### 4. Проблемы с SSL
```bash
# Проверка сертификата
sudo certbot certificates

# Обновление сертификата
sudo certbot renew --dry-run
```

## 📝 Заметки по безопасности

1. Регулярно обновляйте систему:
```bash
sudo apt update && sudo apt upgrade -y
```

2. Проверяйте логи на подозрительную активность:
```bash
sudo tail -f /var/log/auth.log
```

3. Мониторинг fail2ban:
```bash
sudo fail2ban-client status
```

4. Проверка открытых портов:
```bash
sudo nmap -sT -O localhost
```

5. Проверка прав доступа:
```bash
ls -la /opt/mobile-legends
```