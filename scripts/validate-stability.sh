#!/usr/bin/env bash
set -euo pipefail

echo '== Validate docker-compose.prod.yml =='
[ -f docker-compose.prod.yml ] || { echo 'missing docker-compose.prod.yml'; exit 1; }

echo '== Build images (no-cache) =='
docker compose -f docker-compose.prod.yml build --no-cache

echo '== Up services =='
docker compose -f docker-compose.prod.yml up -d

echo '== Wait for backend health =='
for i in {1..30}; do
  if docker compose -f docker-compose.prod.yml exec -T backend wget -q -T 3 -O - http://localhost:3001/api/health >/dev/null 2>&1; then
    echo 'backend healthy'; break
  fi
  sleep 2
done

echo '== Run prisma migrations =='
docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

echo '== Seed database =='
docker compose -f docker-compose.prod.yml exec -T backend npx prisma db seed

echo '== Verify frontend =='
docker compose -f docker-compose.prod.yml exec -T nginx wget -q -T 3 -O - http://localhost/health >/dev/null

echo 'All good'
