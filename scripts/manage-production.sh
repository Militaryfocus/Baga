#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Функция для вывода с временной меткой
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Проверка root прав
if [ "$EUID" -ne 0 ]; then
    log "${RED}Этот скрипт должен быть запущен с правами root${NC}"
    exit 1
fi

# Создание необходимых директорий
create_directories() {
    log "${YELLOW}Создание необходимых директорий...${NC}"
    mkdir -p backups/{postgres,redis}
    mkdir -p logs/{nginx,backend}
    mkdir -p uploads
    mkdir -p certbot/{conf,www}
    mkdir -p nginx/{ssl,conf.d}
    chmod -R 755 uploads logs
}

# Проверка и создание .env файла
setup_env() {
    log "${YELLOW}Настройка переменных окружения...${NC}"
    if [ ! -f .env ]; then
        if [ -f .env.prod.example ]; then
            cp .env.prod.example .env
            log "${GREEN}Создан .env файл из примера${NC}"
        else
            log "${RED}Файл .env.prod.example не найден!${NC}"
            exit 1
        fi
    fi
}

# Создание бэкапа базы данных
backup_database() {
    log "${YELLOW}Создание бэкапа базы данных...${NC}"
    BACKUP_FILE="backups/postgres/backup_$(date +'%Y%m%d_%H%M%S').sql"
    docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U ml_user mobile_legends_community > "$BACKUP_FILE"
    if [ $? -eq 0 ]; then
        log "${GREEN}Бэкап создан: $BACKUP_FILE${NC}"
    else
        log "${RED}Ошибка создания бэкапа!${NC}"
    fi
}

# Обновление приложения
update_app() {
    log "${YELLOW}Обновление приложения...${NC}"

    # Создание бэкапа перед обновлением
    backup_database

    # Получение последних изменений
    git pull origin main

    # Пересборка и перезапуск контейнеров
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d

    # Применение миграций
    log "${YELLOW}Применение миграций...${NC}"
    docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

    log "${GREEN}Обновление завершено${NC}"
}

# Настройка SSL с помощью Certbot
setup_ssl() {
    log "${YELLOW}Настройка SSL сертификатов...${NC}"
    read -p "Введите домен (например, example.com): " domain
    read -p "Введите email для уведомлений: " email

    docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
        --webroot --webroot-path /var/www/certbot \
        --email "$email" \
        --agree-tos \
        --no-eff-email \
        -d "$domain" \
        -d "www.$domain"

    if [ $? -eq 0 ]; then
        log "${GREEN}SSL сертификаты успешно получены${NC}"
    else
        log "${RED}Ошибка получения SSL сертификатов${NC}"
    fi
}

# Мониторинг состояния
check_status() {
    log "${YELLOW}Проверка состояния системы...${NC}"
    
    # Проверка статуса контейнеров
    docker-compose -f docker-compose.prod.yml ps

    # Проверка использования ресурсов
    docker stats --no-stream

    # Проверка логов на ошибки
    log "${YELLOW}Последние ошибки в логах:${NC}"
    docker-compose -f docker-compose.prod.yml logs --tail=100 2>&1 | grep -i "error\|exception\|fatal"
}

# Меню
show_menu() {
    echo -e "\n${YELLOW}=== Управление Production Окружением ===${NC}"
    echo "1. Первичная настройка (создание директорий и .env)"
    echo "2. Запуск приложения"
    echo "3. Остановка приложения"
    echo "4. Обновление приложения"
    echo "5. Создание бэкапа базы данных"
    echo "6. Настройка SSL сертификатов"
    echo "7. Просмотр статуса и логов"
    echo "8. Выход"
    echo -n "Выберите действие (1-8): "
}

# Основной цикл
while true; do
    show_menu
    read choice

    case $choice in
        1)
            create_directories
            setup_env
            ;;
        2)
            docker-compose -f docker-compose.prod.yml up -d
            ;;
        3)
            docker-compose -f docker-compose.prod.yml down
            ;;
        4)
            update_app
            ;;
        5)
            backup_database
            ;;
        6)
            setup_ssl
            ;;
        7)
            check_status
            ;;
        8)
            log "${GREEN}Выход из программы${NC}"
            exit 0
            ;;
        *)
            log "${RED}Неверный выбор${NC}"
            ;;
    esac
done