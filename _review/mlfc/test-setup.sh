#!/bin/bash

echo "🚀 Testing Mobile Legends Community Setup..."

# Остановить все контейнеры
echo "📦 Stopping existing containers..."
docker-compose -f docker-compose.simple.yml down

# Очистить Docker
echo "🧹 Cleaning Docker..."
docker system prune -f

# Создать необходимые директории
echo "📁 Creating directories..."
mkdir -p uploads
mkdir -p nginx/ssl

# Запустить только базу данных и Redis
echo "🗄️ Starting database and Redis..."
docker-compose -f docker-compose.simple.yml up -d postgres redis

# Ждать готовности базы данных
echo "⏳ Waiting for database to be ready..."
sleep 10

# Запустить backend
echo "🔧 Starting backend..."
docker-compose -f docker-compose.simple.yml up -d backend

# Ждать готовности backend
echo "⏳ Waiting for backend to be ready..."
sleep 15

# Запустить frontend
echo "🎨 Starting frontend..."
docker-compose -f docker-compose.simple.yml up -d frontend

# Проверить статус
echo "📊 Checking container status..."
docker-compose -f docker-compose.simple.yml ps

# Проверить логи
echo "📋 Recent logs:"
docker-compose -f docker-compose.simple.yml logs --tail=10

echo "✅ Setup complete!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001/api"
echo "📚 API Docs: http://localhost:3001/api-docs"