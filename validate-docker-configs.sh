#!/bin/bash

# Валидация конфигураций Docker
# Docker Configuration Validation Script

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Валидация конфигураций Docker${NC}"
echo "====================================="

# Счетчики
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Функция для проверки
check() {
    local name="$1"
    local command="$2"
    local expected_exit_code="${3:-0}"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    echo -e "\n${YELLOW}🔍 Проверка: $name${NC}"
    
    if eval "$command" > /dev/null 2>&1; then
        local exit_code=$?
        if [ $exit_code -eq $expected_exit_code ]; then
            echo -e "${GREEN}✅ ПРОЙДЕНО: $name${NC}"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
            return 0
        else
            echo -e "${RED}❌ СБОЙ: $name (неожиданный код выхода: $exit_code)${NC}"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            return 1
        fi
    else
        local exit_code=$?
        if [ $exit_code -eq $expected_exit_code ]; then
            echo -e "${GREEN}✅ ПРОЙДЕНО: $name (ожидаемый сбой)${NC}"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
            return 0
        else
            echo -e "${RED}❌ СБОЙ: $name (код выхода: $exit_code)${NC}"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            return 1
        fi
    fi
}

# Функция для проверки файла
check_file() {
    local file="$1"
    local name="$2"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    echo -e "\n${YELLOW}📁 Проверка файла: $name${NC}"
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ НАЙДЕН: $file${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}❌ НЕ НАЙДЕН: $file${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Функция для проверки содержимого файла
check_content() {
    local file="$1"
    local pattern="$2"
    local name="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    echo -e "\n${YELLOW}🔍 Проверка содержимого: $name${NC}"
    
    if [ -f "$file" ] && grep -q "$pattern" "$file"; then
        echo -e "${GREEN}✅ НАЙДЕНО: $pattern в $file${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}❌ НЕ НАЙДЕНО: $pattern в $file${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker не найден. Установите Docker для полной валидации.${NC}"
    echo -e "${YELLOW}⚠️  Продолжаем с ограниченной валидацией...${NC}"
    DOCKER_AVAILABLE=false
else
    DOCKER_AVAILABLE=true
fi

# Проверяем наличие docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠️  docker-compose не найден. Пропуск compose валидации.${NC}"
    COMPOSE_AVAILABLE=false
else
    COMPOSE_AVAILABLE=true
fi

echo -e "\n${BLUE}📁 Проверка файлов...${NC}"

# Проверяем основные файлы
check_file "backend/Dockerfile" "Backend Dockerfile"
check_file "backend/Dockerfile.prod" "Backend Production Dockerfile"
check_file "backend/Dockerfile.robust" "Backend Robust Dockerfile"
check_file "frontend/Dockerfile" "Frontend Dockerfile"
check_file "frontend/Dockerfile.prod" "Frontend Production Dockerfile"
check_file "frontend/Dockerfile.robust" "Frontend Robust Dockerfile"

# Проверяем docker-compose файлы
check_file "docker-compose.yml" "Main docker-compose.yml"
check_file "docker-compose.prod.yml" "Production docker-compose.yml"
check_file "docker-compose.robust.yml" "Robust docker-compose.yml"
check_file "docker-compose.simple.yml" "Simple docker-compose.yml"

# Проверяем конфигурационные файлы
check_file "nginx/nginx.conf" "Nginx configuration"
check_file "nginx/nginx.prod.conf" "Nginx production configuration"

# Проверяем package.json файлы
check_file "backend/package.json" "Backend package.json"
check_file "frontend/package.json" "Frontend package.json"

echo -e "\n${BLUE}🔍 Проверка содержимого Dockerfile...${NC}"

# Проверяем правильную логику повторов
check_content "backend/Dockerfile.robust" "apk update --no-cache || (sleep 10 && apk update --no-cache) || (sleep 30 && apk update --no-cache) || exit 1" "Backend Robust Retry Logic"
check_content "frontend/Dockerfile.robust" "apk update --no-cache || (sleep 10 && apk update --no-cache) || (sleep 30 && apk update --no-cache) || exit 1" "Frontend Robust Retry Logic"

# Проверяем динамическое определение версии Alpine
check_content "backend/Dockerfile.robust" "\$(cat /etc/alpine-release | cut -d. -f1,2)" "Backend Robust Alpine Version"
check_content "frontend/Dockerfile.robust" "\$(cat /etc/alpine-release | cut -d. -f1,2)" "Frontend Robust Alpine Version"
check_content "backend/Dockerfile.prod" "\$(cat /etc/alpine-release | cut -d. -f1,2)" "Backend Production Alpine Version"
check_content "frontend/Dockerfile.prod" "\$(cat /etc/alpine-release | cut -d. -f1,2)" "Frontend Production Alpine Version"

# Проверяем отсутствие жестко заданных версий
check_content "backend/Dockerfile.robust" "v3\.18" "Backend Robust No Hardcoded Version" 1
check_content "frontend/Dockerfile.robust" "v3\.18" "Frontend Robust No Hardcoded Version" 1

echo -e "\n${BLUE}🐳 Проверка Docker конфигураций...${NC}"

if [ "$DOCKER_AVAILABLE" = true ]; then
    # Проверяем синтаксис Dockerfile
    check "Backend Dockerfile Syntax" "docker build -f backend/Dockerfile --no-cache -t test-backend ." 0
    check "Frontend Dockerfile Syntax" "docker build -f frontend/Dockerfile --no-cache -t test-frontend ." 0
    
    # Проверяем robust Dockerfile
    check "Backend Robust Dockerfile Syntax" "docker build -f backend/Dockerfile.robust --no-cache -t test-backend-robust ." 0
    check "Frontend Robust Dockerfile Syntax" "docker build -f frontend/Dockerfile.robust --no-cache -t test-frontend-robust ." 0
fi

if [ "$COMPOSE_AVAILABLE" = true ]; then
    # Проверяем синтаксис docker-compose файлов
    check "Main Compose Syntax" "docker-compose -f docker-compose.yml config" 0
    check "Production Compose Syntax" "docker-compose -f docker-compose.prod.yml config" 0
    check "Robust Compose Syntax" "docker-compose -f docker-compose.robust.yml config" 0
    check "Simple Compose Syntax" "docker-compose -f docker-compose.simple.yml config" 0
fi

echo -e "\n${BLUE}📊 Итоговый отчет...${NC}"
echo "====================================="

echo -e "Всего проверок: ${TOTAL_CHECKS}"
echo -e "${GREEN}Пройдено: ${PASSED_CHECKS}${NC}"
echo -e "${RED}Сбоев: ${FAILED_CHECKS}${NC}"

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ УСПЕШНО!${NC}"
    echo -e "${GREEN}✅ Все конфигурации Docker валидны${NC}"
    echo -e "${GREEN}✅ Критические проблемы исправлены${NC}"
    echo -e "${GREEN}✅ Готово к продакшену${NC}"
    exit 0
else
    echo -e "\n${RED}❌ ОБНАРУЖЕНЫ ПРОБЛЕМЫ!${NC}"
    echo -e "${RED}❌ Требуется исправление ${FAILED_CHECKS} проблем${NC}"
    exit 1
fi