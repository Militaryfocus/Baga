# Руководство по устранению проблем сборки

## Проблема: Зависание при установке пакетов Alpine

### Симптомы:
```
=> [backend runner 2/10] RUN apk add ...  46.1s
=> => # fetch https://dl-cdn.alpinelinux.org/alpine/...
```

Сборка Docker зависает на этапе установки пакетов Alpine Linux.

### Решение:

#### Вариант 1: Используйте скрипт исправления (Рекомендуется)

```bash
sudo ./fix-build.sh
```

Этот скрипт:
- Очистит кэш Docker
- Удалит старые образы
- Пересоберет всё с чистого листа

#### Вариант 2: Ручное исправление

```bash
# 1. Остановите все контейнеры
docker compose -f docker-compose.prod.yml down -v

# 2. Очистите кэш Docker
docker builder prune -f
docker system prune -f

# 3. Включите BuildKit для лучшей производительности
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# 4. Пересоберите образы
docker compose -f docker-compose.prod.yml build --no-cache

# 5. Запустите контейнеры
docker compose -f docker-compose.prod.yml up -d
```

#### Вариант 3: Изменение зеркал Alpine (если проблемы с сетью)

Если у вас проблемы с доступом к репозиториям Alpine, попробуйте использовать зеркала:

Отредактируйте `/workspace/backend/Dockerfile.prod` и `/workspace/frontend/Dockerfile.prod`:

```dockerfile
# Замените репозитории на зеркала вашей страны
RUN echo "http://mirrors.aliyun.com/alpine/v3.18/main" > /etc/apk/repositories && \
    echo "http://mirrors.aliyun.com/alpine/v3.18/community" >> /etc/apk/repositories
```

Альтернативные зеркала:
- Россия: `http://mirror.yandex.ru/mirrors/alpine/v3.18/main`
- Европа: `http://dl-cdn.alpinelinux.org/alpine/v3.18/main`
- Азия: `http://mirrors.aliyun.com/alpine/v3.18/main`

## Проблема: Таймаут при установке npm пакетов

### Симптомы:
```
npm ERR! network timeout
```

### Решение:

```bash
# Увеличьте таймауты npm (уже настроено в Dockerfile)
# Если проблема сохраняется, проверьте подключение к npm registry:

curl -I https://registry.npmjs.org/

# Попробуйте использовать зеркало npm (для России/СНГ):
# В Dockerfile добавьте перед npm install:
RUN npm config set registry https://registry.npmmirror.com/
```

## Проблема: Недостаточно места на диске

### Симптомы:
```
no space left on device
```

### Решение:

```bash
# Проверьте использование диска
df -h

# Очистите старые образы и контейнеры Docker
docker system prune -a --volumes

# Удалите неиспользуемые образы
docker image prune -a

# Проверьте размер Docker данных
du -sh /var/lib/docker/
```

## Проблема: Ошибки сети при сборке

### Симптомы:
- Timeout errors
- Connection refused
- Network unreachable

### Решение:

```bash
# 1. Проверьте подключение к интернету
ping -c 4 google.com

# 2. Проверьте DNS
cat /etc/resolv.conf

# 3. Попробуйте использовать Google DNS
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf

# 4. Перезапустите Docker
sudo systemctl restart docker

# 5. Проверьте настройки Docker daemon
cat /etc/docker/daemon.json
```

Добавьте DNS в Docker daemon (`/etc/docker/daemon.json`):

```json
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}
```

Затем перезапустите Docker:
```bash
sudo systemctl restart docker
```

## Проблема: BuildKit ошибки

### Симптомы:
```
failed to solve with frontend dockerfile.v0
```

### Решение:

```bash
# Отключите BuildKit и попробуйте классический билдер
export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0

docker compose -f docker-compose.prod.yml build
```

## Проблема: Ошибки при применении миграций Prisma

### Симптомы:
```
Migration failed
Can't reach database server
```

### Решение:

```bash
# 1. Проверьте, что база данных запущена
docker compose -f docker-compose.prod.yml ps

# 2. Проверьте логи базы данных
docker compose -f docker-compose.prod.yml logs postgres

# 3. Подождите, пока база данных станет готовой
sleep 30

# 4. Повторите миграцию
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# 5. Если не помогает, сбросьте базу (ВНИМАНИЕ: удалит все данные!)
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d
```

## Быстрая диагностика

Запустите следующие команды для быстрой диагностики:

```bash
#!/bin/bash

echo "=== Docker версия ==="
docker --version
docker compose version

echo -e "\n=== Использование диска ==="
df -h

echo -e "\n=== Docker статистика ==="
docker system df

echo -e "\n=== Статус контейнеров ==="
docker compose -f docker-compose.prod.yml ps

echo -e "\n=== Сетевое подключение ==="
ping -c 2 google.com
ping -c 2 registry.npmjs.org
ping -c 2 dl-cdn.alpinelinux.org

echo -e "\n=== Доступные ресурсы ==="
free -h
nproc
```

## Полная переустановка (крайняя мера)

Если ничего не помогает:

```bash
# 1. Остановите и удалите всё
docker compose -f docker-compose.prod.yml down -v
docker system prune -a --volumes -f

# 2. Удалите все данные Docker
sudo systemctl stop docker
sudo rm -rf /var/lib/docker
sudo systemctl start docker

# 3. Запустите установку заново
sudo ./install-vds.sh
```

## Получение помощи

Если проблема не решена:

1. Соберите логи:
```bash
docker compose -f docker-compose.prod.yml logs > docker-logs.txt
docker system info > docker-info.txt
```

2. Создайте Issue в репозитории со следующей информацией:
   - ОС и версия
   - Версия Docker
   - Полный лог ошибки
   - Результаты команд диагностики

## Профилактика

Чтобы избежать проблем в будущем:

1. **Регулярно обновляйте Docker:**
   ```bash
   sudo apt update
   sudo apt upgrade docker-ce docker-ce-cli containerd.io
   ```

2. **Мониторьте использование диска:**
   ```bash
   df -h
   docker system df
   ```

3. **Регулярно очищайте неиспользуемые ресурсы:**
   ```bash
   # Добавьте в cron для еженедельной очистки
   echo "0 0 * * 0 docker system prune -f" | crontab -
   ```

4. **Используйте быстрые зеркала репозиториев** для вашего региона

5. **Настройте Docker daemon** с оптимальными параметрами

## Дополнительные ресурсы

- [Официальная документация Docker](https://docs.docker.com/)
- [Troubleshooting Docker](https://docs.docker.com/config/daemon/)
- [Docker BuildKit](https://docs.docker.com/build/buildkit/)
- [Alpine Linux Wiki](https://wiki.alpinelinux.org/)
