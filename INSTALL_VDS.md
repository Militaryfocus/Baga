# Руководство по установке на VDS

Полное руководство по установке Mobile Legends Fan Community на VDS (Virtual Dedicated Server).

## 📋 Требования к серверу

### Минимальные требования:
- **ОС**: Ubuntu 20.04 LTS или новее / Debian 11 или новее
- **RAM**: 2 GB (рекомендуется 4 GB)
- **CPU**: 2 ядра (рекомендуется 4 ядра)
- **Диск**: 20 GB свободного места
- **Порты**: 80, 443 (открыты для входящих подключений)

### Рекомендуемые требования:
- **RAM**: 4 GB или больше
- **CPU**: 4 ядра или больше
- **Диск**: 50 GB SSD

## 🚀 Установка

### Шаг 1: Подключение к серверу

```bash
ssh root@your-server-ip
```

### Шаг 2: Обновление системы

```bash
# Обновление списка пакетов
apt update

# Обновление установленных пакетов
apt upgrade -y

# Установка базовых утилит
apt install -y curl wget git nano htop
```

### Шаг 3: Установка Docker

```bash
# Удаление старых версий Docker (если есть)
apt remove -y docker docker-engine docker.io containerd runc

# Установка зависимостей
apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Добавление официального GPG ключа Docker
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Добавление репозитория Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker Engine
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Проверка установки
docker --version
docker compose version

# Добавление текущего пользователя в группу docker (опционально)
usermod -aG docker $USER
```

### Шаг 4: Клонирование проекта

```bash
# Переход в директорию для проектов
cd /opt

# Клонирование репозитория
git clone <your-repository-url> mobile-legends-community
cd mobile-legends-community

# Установка прав доступа
chmod +x debug-setup.sh test-setup.sh
```

### Шаг 5: Настройка переменных окружения

```bash
# Копирование примера конфигурации
cp .env.prod.example .env

# Редактирование конфигурации
nano .env
```

**ВАЖНО**: Обязательно измените следующие параметры:

```env
# Замените на ваш домен
CORS_ORIGIN=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
VITE_WS_URL=wss://yourdomain.com

# Установите надежные пароли
POSTGRES_PASSWORD=your-very-strong-password-here
JWT_SECRET=your-very-long-random-secret-key-at-least-32-chars
SESSION_SECRET=another-very-long-random-secret-key

# Настройте email (опционально)
SMTP_HOST=smtp.your-provider.com
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-email-password
```

### Шаг 6: Настройка SSL сертификатов (для HTTPS)

#### Вариант A: Let's Encrypt (Рекомендуется)

```bash
# Установка Certbot
apt install -y certbot

# Получение сертификата
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Копирование сертификатов
mkdir -p nginx/ssl
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/

# Настройка автообновления
echo "0 0 1 * * certbot renew --quiet && cp /etc/letsencrypt/live/yourdomain.com/*.pem /opt/mobile-legends-community/nginx/ssl/ && docker restart ml_community_nginx_prod" | crontab -
```

#### Вариант B: Самоподписанный сертификат (Только для тестирования)

```bash
# Создание самоподписанного сертификата
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/C=RU/ST=Moscow/L=Moscow/O=MobileLegends/CN=yourdomain.com"
```

### Шаг 7: Запуск приложения

```bash
# Сборка и запуск контейнеров в production режиме
docker compose -f docker-compose.prod.yml up -d --build

# Просмотр логов
docker compose -f docker-compose.prod.yml logs -f

# Проверка статуса контейнеров
docker compose -f docker-compose.prod.yml ps
```

### Шаг 8: Инициализация базы данных

```bash
# Применение миграций
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Заполнение начальными данными
docker compose -f docker-compose.prod.yml exec backend npx prisma db seed
```

### Шаг 9: Проверка работоспособности

```bash
# Проверка API
curl http://localhost:3001/api/health

# Проверка через nginx
curl http://localhost/api/health

# Проверка всех сервисов
docker compose -f docker-compose.prod.yml ps
```

## 🔧 Управление приложением

### Остановка сервисов

```bash
docker compose -f docker-compose.prod.yml down
```

### Перезапуск сервисов

```bash
docker compose -f docker-compose.prod.yml restart
```

### Просмотр логов

```bash
# Все сервисы
docker compose -f docker-compose.prod.yml logs -f

# Конкретный сервис
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f postgres
docker compose -f docker-compose.prod.yml logs -f nginx
```

### Обновление приложения

#### Автоматическое обновление (рекомендуется):
```bash
cd /opt/mobile-legends-community
sudo ./update-vds.sh
```

#### Ручное обновление:
```bash
# Получение последних изменений
cd /opt/mobile-legends-community
git pull origin main

# Пересборка и перезапуск
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build

# Применение миграций (если есть)
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### Резервное копирование базы данных

```bash
# Создание резервной копии
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U ml_user_prod mobile_legends_community_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из резервной копии
docker compose -f docker-compose.prod.yml exec -T postgres psql -U ml_user_prod mobile_legends_community_prod < backup_20240101_120000.sql
```

## 🔒 Безопасность

### Настройка файрвола (UFW)

```bash
# Установка UFW
apt install -y ufw

# Базовая настройка
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https

# Включение файрвола
ufw enable

# Проверка статуса
ufw status
```

### Настройка Fail2Ban (защита от брутфорса)

```bash
# Установка Fail2Ban
apt install -y fail2ban

# Создание конфигурации
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
EOF

# Перезапуск Fail2Ban
systemctl restart fail2ban
systemctl enable fail2ban
```

### Регулярные обновления

```bash
# Создание cron задачи для автоматических обновлений
cat > /etc/cron.weekly/system-update << 'EOF'
#!/bin/bash
apt update
apt upgrade -y
apt autoremove -y
EOF

chmod +x /etc/cron.weekly/system-update
```

## 🐛 Решение проблем

### Контейнеры не запускаются

```bash
# Проверка логов
docker compose -f docker-compose.prod.yml logs

# Проверка использования ресурсов
docker stats

# Полная очистка и перезапуск
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build --force-recreate
```

### Проблемы с базой данных

```bash
# Подключение к базе данных
docker compose -f docker-compose.prod.yml exec postgres psql -U ml_user_prod mobile_legends_community_prod

# Сброс миграций (ВНИМАНИЕ: удалит все данные!)
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate reset --force
```

### Проблемы с портами

```bash
# Проверка занятых портов
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Освобождение порта (если занят другим процессом)
kill -9 $(lsof -t -i:80)
```

### Недостаточно места на диске

```bash
# Очистка старых образов Docker
docker system prune -a --volumes

# Проверка использования диска
df -h
du -sh /var/lib/docker/*
```

## 📊 Мониторинг

### Проверка работоспособности

```bash
# Health check скрипт
cat > /opt/mobile-legends-community/health-check.sh << 'EOF'
#!/bin/bash
HEALTH_URL="http://localhost/api/health"
if curl -f -s $HEALTH_URL > /dev/null; then
  echo "✓ Application is healthy"
  exit 0
else
  echo "✗ Application is down"
  exit 1
fi
EOF

chmod +x /opt/mobile-legends-community/health-check.sh

# Добавление в cron для проверки каждые 5 минут
echo "*/5 * * * * /opt/mobile-legends-community/health-check.sh || docker compose -f /opt/mobile-legends-community/docker-compose.prod.yml restart" | crontab -
```

### Просмотр использования ресурсов

```bash
# Docker статистика
docker stats

# Системные ресурсы
htop
```

## 🌐 Настройка домена

### Настройка DNS записей

В панели управления доменом создайте следующие A записи:

```
Type  Name  Value           TTL
A     @     your-server-ip  300
A     www   your-server-ip  300
```

### Проверка DNS

```bash
# Проверка A записи
dig yourdomain.com +short

# Проверка с конкретным DNS сервером
dig @8.8.8.8 yourdomain.com +short
```

## 📝 Полезные команды

```bash
# Проверка версий
docker --version
docker compose version
node --version

# Просмотр всех контейнеров
docker ps -a

# Просмотр логов контейнера
docker logs ml_community_backend_prod -f

# Вход в контейнер
docker exec -it ml_community_backend_prod sh

# Просмотр использования томов
docker volume ls
docker volume inspect mobile-legends-community_postgres_data_prod

# Очистка всех остановленных контейнеров
docker container prune

# Полная очистка системы Docker
docker system prune -a --volumes
```

## 🎯 После установки

1. **Смените пароль root на сервере**:
   ```bash
   passwd root
   ```

2. **Создайте нового пользователя для работы**:
   ```bash
   adduser mluser
   usermod -aG sudo mluser
   usermod -aG docker mluser
   ```

3. **Настройте SSH ключи** вместо паролей

4. **Проверьте работу приложения** по адресу https://yourdomain.com

5. **Настройте регулярные резервные копии**

6. **Настройте мониторинг** (например, UptimeRobot, Zabbix)

## 📞 Поддержка

Если у вас возникли проблемы:

1. Проверьте логи: `docker compose -f docker-compose.prod.yml logs -f`
2. Проверьте статус контейнеров: `docker compose -f docker-compose.prod.yml ps`
3. Проверьте раздел "Решение проблем" выше
4. Создайте Issue в репозитории проекта

---

**Создано с ❤️ для сообщества Mobile Legends**
