#!/usr/bin/env bash
set -euo pipefail

# Deploy Mobile Legends Fan Community to a Debian/Ubuntu VDS
# Usage:
#   scripts/deploy.sh --domain yourdomain.com [--no-ssl]
#
# This script will:
# - Ensure Docker and Docker Compose plugin are installed
# - Create .env.prod from example if missing and set domain-based values
# - Generate a self-signed SSL cert if none provided (unless --no-ssl)
# - Replace placeholder domain in nginx/nginx.prod.conf
# - Build and start services with docker compose (prod)
# - Run Prisma migrations and seed data

DOMAIN=""
USE_SSL=true

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain)
      DOMAIN="$2"; shift 2;;
    --no-ssl)
      USE_SSL=false; shift;;
    *)
      echo "Unknown argument: $1" >&2; exit 1;;
  esac
done

if [[ -z "${DOMAIN}" ]]; then
  echo "Error: --domain is required" >&2
  echo "Example: scripts/deploy.sh --domain example.com" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "${ROOT_DIR}"

echo "[1/7] Checking Docker installation..."
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Installing (requires sudo)..."
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    install -d -m 0755 /etc/apt/keyrings || sudo install -d -m 0755 /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \ 
https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") \ 
$(. /etc/os-release; echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker "$USER" || true
  else
    echo "Unsupported OS for auto-install. Please install Docker manually." >&2
    exit 1
  fi
fi

echo "[2/7] Checking Docker Compose plugin..."
if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin not found. Attempting to install via apt..."
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update -y
    sudo apt-get install -y docker-compose-plugin
  else
    echo "Please install Docker Compose plugin manually." >&2
    exit 1
  fi
fi

COMPOSE_BIN="docker compose"

echo "[3/7] Preparing environment file (.env.prod)..."
if [[ ! -f .env.prod ]]; then
  if [[ -f .env.prod.example ]]; then
    cp .env.prod.example .env.prod
  else
    # Fallback minimal .env.prod
    cat > .env.prod <<EOF
POSTGRES_DB=mobile_legends_community_prod
POSTGRES_USER=ml_user_prod
POSTGRES_PASSWORD=$(openssl rand -hex 16 2>/dev/null || echo change-me)
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo change-me-very-strong)
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://${DOMAIN}
VITE_API_URL=https://${DOMAIN}/api
VITE_WS_URL=wss://${DOMAIN}
EOF
  fi
fi

# Ensure domain-dependent values are set/updated
sed -i "s#^CORS_ORIGIN=.*#CORS_ORIGIN=https://${DOMAIN}#" .env.prod || true
sed -i "s#^VITE_API_URL=.*#VITE_API_URL=https://${DOMAIN}/api#" .env.prod || true
sed -i "s#^VITE_WS_URL=.*#VITE_WS_URL=wss://${DOMAIN}#" .env.prod || true

echo "[4/7] Configuring Nginx domain..."
if grep -q "yourdomain.com" nginx/nginx.prod.conf; then
  sed -i "s#https://yourdomain.com#https://${DOMAIN}#g" nginx/nginx.prod.conf
fi

echo "[5/7] SSL setup (${USE_SSL})..."
mkdir -p nginx/ssl
if ${USE_SSL}; then
  if [[ ! -f nginx/ssl/cert.pem || ! -f nginx/ssl/key.pem ]]; then
    echo "Generating self-signed certificate for ${DOMAIN}..."
    if ! command -v openssl >/dev/null 2>&1; then
      if command -v apt-get >/dev/null 2>&1; then
        sudo apt-get update -y && sudo apt-get install -y openssl
      fi
    fi
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem \
      -subj "/CN=${DOMAIN}/O=Self-Signed/C=US"
  fi
else
  echo "Skipping SSL generation as requested."
fi

echo "[6/7] Building and starting services (production)..."
${COMPOSE_BIN} --env-file .env.prod -f docker-compose.prod.yml up -d --build

echo "[7/7] Running database migrations and seed..."
${COMPOSE_BIN} --env-file .env.prod -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy
${COMPOSE_BIN} --env-file .env.prod -f docker-compose.prod.yml exec -T backend npx prisma db seed

echo "Deployment completed."
echo "Frontend: https://${DOMAIN}"
echo "Backend:  https://${DOMAIN}/api"
echo "Docs:     https://${DOMAIN}/api-docs"
