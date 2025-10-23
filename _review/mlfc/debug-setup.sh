#!/bin/bash

echo "🔍 Debugging Mobile Legends Community Setup..."

# Остановить все контейнеры
echo "📦 Stopping all containers..."
docker-compose -f docker-compose.minimal.yml down 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true

# Очистить Docker
echo "🧹 Cleaning Docker..."
docker system prune -f

# Проверить файлы
echo "📁 Checking project structure..."
ls -la backend/
ls -la frontend/
ls -la backend/package.json
ls -la frontend/package.json

# Проверить Dockerfile
echo "🐳 Checking Dockerfiles..."
cat backend/Dockerfile.simple
echo "---"
cat frontend/Dockerfile.simple

# Запустить только базу данных
echo "🗄️ Starting database..."
docker-compose -f docker-compose.minimal.yml up -d postgres redis

# Ждать готовности
echo "⏳ Waiting for database..."
sleep 10

# Проверить базу данных
echo "🔍 Checking database..."
docker-compose -f docker-compose.minimal.yml exec postgres psql -U ml_user -d mobile_legends_community -c "SELECT 1;" 2>/dev/null || echo "Database not ready yet"

# Запустить backend
echo "🔧 Starting backend..."
docker-compose -f docker-compose.minimal.yml up --build -d backend

# Ждать и проверить логи
echo "⏳ Waiting for backend..."
sleep 15

echo "📋 Backend logs:"
docker-compose -f docker-compose.minimal.yml logs backend

echo "📊 Container status:"
docker-compose -f docker-compose.minimal.yml ps

echo "✅ Debug complete!"