#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Функция для вывода сообщений
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка прав root
if [[ $EUID -ne 0 ]]; then
   error "Этот скрипт должен быть запущен с правами root"
   exit 1
fi

# Проверка наличия домена
read -p "Введите ваш домен (например, example.com): " DOMAIN
if [[ -z "$DOMAIN" ]]; then
    error "Домен не указан"
    exit 1
fi

# Проверка занятых портов
check_ports() {
    local ports=(80 443 3000 3001 5432 6379)
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
            error "Порт $port уже используется"
            exit 1
        fi
    done
}

# Обновление системы
update_system() {
    log "Обновление системы..."
    apt update && apt upgrade -y
    apt install -y \
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
}

# Установка Docker
install_docker() {
    log "Установка Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    systemctl enable docker
    systemctl start docker
    
    log "Установка Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
}

# Настройка firewall
setup_firewall() {
    log "Настройка firewall..."
    ufw allow ssh
    ufw allow http
    ufw allow https
    ufw allow 3000
    ufw allow 3001
    ufw --force enable
}

# Установка проекта
install_project() {
    log "Установка проекта..."
    mkdir -p /opt/mobile-legends
    chown -R $USER:$USER /opt/mobile-legends
    git clone https://github.com/Militaryfocus/Baga.git /opt/mobile-legends
    cd /opt/mobile-legends
}

# Настройка переменных окружения
setup_env() {
    log "Настройка .env файла..."
    
    # Генерация случайных паролей
    DB_PASSWORD=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 64)
    
    cat > /opt/mobile-legends/.env << EOF
NODE_ENV=production
DOMAIN=$DOMAIN

POSTGRES_DB=mobile_legends_community
POSTGRES_USER=ml_user
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_MAX_CONNECTIONS=100

REDIS_URL=redis://redis:6379
REDIS_MAX_MEMORY=512mb

JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

API_URL=https://$DOMAIN/api
CORS_ORIGIN=https://$DOMAIN

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

LOG_LEVEL=info

WS_URL=wss://$DOMAIN
EOF
}

# Настройка SSL
setup_ssl() {
    log "Установка Certbot и получение SSL сертификата..."
    apt install -y certbot python3-certbot-nginx
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    systemctl enable certbot.timer
    systemctl start certbot.timer
}

# Запуск приложения
start_app() {
    log "Запуск приложения..."
    cd /opt/mobile-legends
    docker-compose -f docker-compose.prod.yml up -d --build
    
    log "Применение миграций..."
    sleep 10 # Ждем пока поднимется база данных
    docker-compose exec -T backend npx prisma migrate deploy
    
    log "Заполнение начальными данными..."
    docker-compose exec -T backend npx prisma db seed
}

# Настройка бэкапов
setup_backups() {
    log "Настройка системы бэкапов..."
    mkdir -p /opt/backups
    chown -R $USER:$USER /opt/backups
    
    cat > /opt/backups/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
cd /opt/mobile-legends
docker-compose exec -T postgres pg_dump -U ml_user mobile_legends_community > "$BACKUP_DIR/db_$DATE.sql"
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" uploads/
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +7 -delete
EOF
    
    chmod +x /opt/backups/backup.sh
    (crontab -l 2>/dev/null; echo "0 3 * * * /opt/backups/backup.sh") | crontab -
}

# Основной процесс установки
main() {
    log "Начало установки..."
    
    check_ports
    update_system
    install_docker
    setup_firewall
    install_project
    setup_env
    setup_ssl
    start_app
    setup_backups
    
    log "Установка завершена!"
    log "Проверьте работу сайта: https://$DOMAIN"
    log "Проверьте работу API: https://$DOMAIN/api/health"
    
    # Сохраняем пароли
    echo "Сохраните эти данные в надежном месте:"
    echo "Database Password: $DB_PASSWORD"
    echo "JWT Secret: $JWT_SECRET"
}

main