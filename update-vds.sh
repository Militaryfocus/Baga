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

# Проверка наличия директории проекта
if [[ ! -d "/opt/mobile-legends" ]]; then
    error "Директория проекта не найдена"
    exit 1
fi

# Создание бэкапа перед обновлением
backup() {
    log "Создание бэкапа..."
    BACKUP_DIR="/opt/backups"
    DATE=$(date +%Y%m%d_%H%M%S)
    
    mkdir -p $BACKUP_DIR
    cd /opt/mobile-legends
    
    docker-compose exec -T postgres pg_dump -U ml_user mobile_legends_community > "$BACKUP_DIR/db_before_update_$DATE.sql"
    tar -czf "$BACKUP_DIR/uploads_before_update_$DATE.tar.gz" uploads/
    
    log "Бэкап создан в $BACKUP_DIR"
}

# Обновление кода
update_code() {
    log "Обновление кода..."
    cd /opt/mobile-legends
    
    # Сохраняем текущую версию
    CURRENT_COMMIT=$(git rev-parse HEAD)
    
    # Получаем изменения
    git fetch origin main
    
    # Проверяем наличие изменений
    if git diff --quiet main origin/main; then
        log "Обновлений нет"
        return 0
    fi
    
    # Сохраняем локальные изменения
    if git diff --quiet; then
        git stash
        LOCAL_CHANGES=true
    fi
    
    # Обновляем код
    if git merge origin/main; then
        log "Код успешно обновлен"
        
        # Восстанавливаем локальные изменения
        if [[ $LOCAL_CHANGES ]]; then
            git stash pop
        fi
    else
        error "Ошибка при обновлении кода"
        git reset --hard $CURRENT_COMMIT
        if [[ $LOCAL_CHANGES ]]; then
            git stash pop
        fi
        exit 1
    fi
}

# Обновление приложения
update_app() {
    log "Обновление приложения..."
    cd /opt/mobile-legends
    
    # Остановка контейнеров
    docker-compose -f docker-compose.prod.yml down
    
    # Пересборка и запуск
    if docker-compose -f docker-compose.prod.yml up -d --build; then
        log "Контейнеры успешно обновлены"
    else
        error "Ошибка при обновлении контейнеров"
        exit 1
    fi
}

# Обновление базы данных
update_database() {
    log "Обновление базы данных..."
    cd /opt/mobile-legends
    
    # Ждем готовности базы данных
    sleep 10
    
    # Применение миграций
    if docker-compose exec -T backend npx prisma migrate deploy; then
        log "Миграции успешно применены"
    else
        error "Ошибка при применении миграций"
        exit 1
    fi
}

# Проверка работоспособности
check_health() {
    log "Проверка работоспособности..."
    
    # Получаем домен из .env
    DOMAIN=$(grep DOMAIN .env | cut -d '=' -f2)
    
    # Проверка API
    if curl -s -f -o /dev/null "https://$DOMAIN/api/health"; then
        log "API работает"
    else
        error "API не отвечает"
        exit 1
    fi
    
    # Проверка Frontend
    if curl -s -f -o /dev/null "https://$DOMAIN"; then
        log "Frontend работает"
    else
        error "Frontend не отвечает"
        exit 1
    fi
}

# Очистка
cleanup() {
    log "Очистка..."
    
    # Удаление неиспользуемых образов
    docker image prune -f
    
    # Удаление старых бэкапов (старше 7 дней)
    find /opt/backups -name "db_before_update_*.sql" -mtime +7 -delete
    find /opt/backups -name "uploads_before_update_*.tar.gz" -mtime +7 -delete
}

# Основной процесс обновления
main() {
    log "Начало процесса обновления..."
    
    backup
    update_code
    update_app
    update_database
    check_health
    cleanup
    
    log "Обновление успешно завершено!"
}

main