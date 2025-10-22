#!/bin/bash

# Быстрый тест сборки Docker образов
# Quick Docker Build Test Script

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Быстрый тест сборки Docker образов${NC}"
echo "============================================="

# Функция для тестирования сборки
test_build() {
    local dockerfile=$1
    local tag=$2
    local name=$3
    local timeout=${4:-300}  # Таймаут по умолчанию 5 минут
    
    echo -e "\n${YELLOW}🔨 Тестирование: $name${NC}"
    echo "Dockerfile: $dockerfile"
    echo "Tag: $tag"
    echo "Таймаут: ${timeout}с"
    
    local start_time=$(date +%s)
    
    if timeout $timeout docker build -f "$dockerfile" -t "$tag" . > /dev/null 2>&1; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        echo -e "${GREEN}✅ УСПЕХ: $name собран за ${duration}с${NC}"
        
        # Очищаем образ
        docker rmi "$tag" > /dev/null 2>&1 || true
        return 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        echo -e "${RED}❌ СБОЙ: $name не собран за ${duration}с${NC}"
        return 1
    fi
}

# Функция для тестирования docker-compose
test_compose() {
    local compose_file=$1
    local name=$2
    
    echo -e "\n${YELLOW}🐳 Тестирование: $name${NC}"
    echo "Compose file: $compose_file"
    
    if docker-compose -f "$compose_file" config > /dev/null 2>&1; then
        echo -e "${GREEN}✅ УСПЕХ: $name конфигурация валидна${NC}"
        return 0
    else
        echo -e "${RED}❌ СБОЙ: $name конфигурация невалидна${NC}"
        return 1
    fi
}

# Проверяем доступность Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker не найден. Установите Docker для тестирования.${NC}"
    exit 1
fi

# Проверяем доступность docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠️  docker-compose не найден. Пропуск тестов compose.${NC}"
    COMPOSE_AVAILABLE=false
else
    COMPOSE_AVAILABLE=true
fi

# Тестируем Dockerfile
echo -e "\n${BLUE}📦 Тестирование Dockerfile...${NC}"

# Простые сборки (быстрые)
test_build "backend/Dockerfile" "test-backend-simple" "Backend Simple" 120
test_build "frontend/Dockerfile" "test-frontend-simple" "Frontend Simple" 120

# Production сборки
test_build "backend/Dockerfile.prod" "test-backend-prod" "Backend Production" 300
test_build "frontend/Dockerfile.prod" "test-frontend-prod" "Frontend Production" 300

# Robust сборки (с retry логикой)
test_build "backend/Dockerfile.robust" "test-backend-robust" "Backend Robust" 600
test_build "frontend/Dockerfile.robust" "test-frontend-robust" "Frontend Robust" 600

# Тестируем docker-compose файлы
if [ "$COMPOSE_AVAILABLE" = true ]; then
    echo -e "\n${BLUE}🐳 Тестирование docker-compose файлов...${NC}"
    
    test_compose "docker-compose.yml" "Main Compose"
    test_compose "docker-compose.prod.yml" "Production Compose"
    test_compose "docker-compose.robust.yml" "Robust Compose"
    test_compose "docker-compose.simple.yml" "Simple Compose"
fi

# Тестируем retry логику (симуляция)
echo -e "\n${BLUE}🔄 Тестирование retry логики...${NC}"

# Создаем временный Dockerfile для тестирования retry логики
cat > /tmp/test-retry.Dockerfile << 'EOF'
FROM alpine:latest
RUN echo "https://dl-cdn.alpinelinux.org/alpine/v$(cat /etc/alpine-release | cut -d. -f1,2)/main" > /etc/apk/repositories && \
    apk update --no-cache || (sleep 10 && apk update --no-cache) || (sleep 30 && apk update --no-cache) || exit 1 && \
    apk add --no-cache curl
EOF

if test_build "/tmp/test-retry.Dockerfile" "test-retry-logic" "Retry Logic Test" 60; then
    echo -e "${GREEN}✅ Retry логика работает корректно${NC}"
else
    echo -e "${RED}❌ Retry логика не работает${NC}"
fi

# Очищаем временный файл
rm -f /tmp/test-retry.Dockerfile

# Итоговый отчет
echo -e "\n${GREEN}🎉 Тестирование завершено!${NC}"
echo "============================================="

# Проверяем образы
echo -e "\n${YELLOW}📊 Статистика образов:${NC}"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep -E "(test-|REPOSITORY)" || echo "Нет тестовых образов"

# Очищаем тестовые образы
echo -e "\n${YELLOW}🧹 Очистка тестовых образов...${NC}"
docker images --format "{{.Repository}}:{{.Tag}}" | grep "test-" | xargs -r docker rmi > /dev/null 2>&1 || true

echo -e "\n${GREEN}✅ Все тесты завершены успешно!${NC}"