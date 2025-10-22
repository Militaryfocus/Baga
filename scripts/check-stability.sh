#!/bin/bash

echo "🔍 Проверка стабильности системы..."

# Проверка свободного места
echo "📊 Проверка дискового пространства..."
df -h / | awk 'NR==2 {print $5}' | cut -d'%' -f1 | {
  read usage
  if [ "$usage" -gt 85 ]; then
    echo "⚠️ Предупреждение: Диск заполнен на $usage%"
  else
    echo "✅ Дисковое пространство в норме ($usage%)"
  fi
}

# Проверка Docker
echo "🐳 Проверка Docker..."
if ! docker info >/dev/null 2>&1; then
  echo "❌ Docker не запущен!"
  exit 1
fi
echo "✅ Docker работает"

# Проверка контейнеров
echo "🔍 Проверка состояния контейнеров..."
containers=("ml_community_postgres" "ml_community_redis" "ml_community_backend" "ml_community_frontend" "ml_community_nginx")

for container in "${containers[@]}"; do
  status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null)
  health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null)
  
  if [ "$status" = "running" ]; then
    if [ "$health" = "healthy" ] || [ "$health" = "" ]; then
      echo "✅ $container: работает $health"
    else
      echo "⚠️ $container: $health"
    fi
  else
    echo "❌ $container: не запущен"
  fi
done

# Проверка сетевых портов
echo "🌐 Проверка портов..."
ports=(3000 3001 5432 6379 80 443)

for port in "${ports[@]}"; do
  if nc -z localhost "$port" 2>/dev/null; then
    echo "✅ Порт $port: открыт"
  else
    echo "❌ Порт $port: закрыт"
  fi
done

# Проверка логов на ошибки
echo "📝 Проверка логов на ошибки..."
docker-compose logs --tail=100 2>&1 | grep -i "error\|exception\|fatal" > /tmp/error_logs

if [ -s /tmp/error_logs ]; then
  echo "⚠️ Найдены ошибки в логах:"
  cat /tmp/error_logs
else
  echo "✅ Критических ошибок в логах не найдено"
fi

# Проверка производительности
echo "📊 Проверка использования ресурсов..."
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo "✨ Проверка завершена!"