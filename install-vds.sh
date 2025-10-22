#!/bin/bash
# Mobile Legends Fan Community - VDS Installation Script
# This script automates the installation process on a fresh VDS

set -e  # Exit on error

echo "================================================"
echo "Mobile Legends Fan Community - VDS Installer"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo -e "${RED}Please run as root (use sudo)${NC}"
   exit 1
fi

echo -e "${GREEN}[1/8] Updating system packages...${NC}"
# Check internet connectivity
if ! ping -c 1 google.com &> /dev/null; then
    echo -e "${RED}No internet connection detected. Please check your network.${NC}"
    exit 1
fi

apt update && apt upgrade -y
apt install -y curl wget git nano htop ca-certificates gnupg lsb-release

echo -e "${GREEN}[2/8] Installing Docker...${NC}"
# Check if Docker is already installed
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker is already installed. Skipping installation...${NC}"
    docker --version
    docker compose version
else
    # Remove old versions
    apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
fi

# Skip Docker installation if already installed
if ! command -v docker &> /dev/null; then

# Add Docker's official GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Verify installation
    docker --version
    docker compose version
fi

echo -e "${GREEN}[3/8] Setting up project directory...${NC}"
INSTALL_DIR="/opt/mobile-legends-community"

if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}Directory already exists. Backing up...${NC}"
    mv "$INSTALL_DIR" "${INSTALL_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
fi

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo -e "${GREEN}[4/8] Cloning repository...${NC}"
read -p "Enter repository URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo -e "${RED}Repository URL is required${NC}"
    exit 1
fi

git clone "$REPO_URL" .

echo -e "${GREEN}[5/8] Setting up environment configuration...${NC}"
if [ ! -f .env ]; then
    cp .env.prod.example .env
    
    # Generate random secrets
    JWT_SECRET=$(openssl rand -base64 48)
    SESSION_SECRET=$(openssl rand -base64 48)
    DB_PASSWORD=$(openssl rand -base64 24)
    
    # Replace placeholders
    sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$DB_PASSWORD|g" .env
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env
    sed -i "s|SESSION_SECRET=.*|SESSION_SECRET=$SESSION_SECRET|g" .env
    
    echo -e "${YELLOW}Please edit .env file and set your domain and other settings:${NC}"
    echo -e "  nano .env"
    echo ""
    read -p "Press Enter after you've edited the .env file..."
fi

echo -e "${GREEN}[6/8] Setting up SSL certificates...${NC}"
mkdir -p nginx/ssl

read -p "Do you want to set up Let's Encrypt SSL? (y/n): " SETUP_SSL

if [ "$SETUP_SSL" = "y" ]; then
    apt install -y certbot
    read -p "Enter your domain name (e.g., example.com): " DOMAIN
    
    if [ ! -z "$DOMAIN" ]; then
        echo -e "${YELLOW}Obtaining SSL certificate...${NC}"
        certbot certonly --standalone -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email || {
            echo -e "${YELLOW}Failed to obtain certificate. Using self-signed certificate...${NC}"
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
              -keyout nginx/ssl/privkey.pem \
              -out nginx/ssl/fullchain.pem \
              -subj "/C=RU/ST=Moscow/L=Moscow/O=MobileLegends/CN=$DOMAIN"
        }
        
        if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
            cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" nginx/ssl/
            cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" nginx/ssl/
            
            # Setup auto-renewal
            echo "0 0 1 * * certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/*.pem $INSTALL_DIR/nginx/ssl/ && docker restart ml_community_nginx_prod" | crontab -
        fi
    fi
else
    echo -e "${YELLOW}Creating self-signed certificate...${NC}"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout nginx/ssl/privkey.pem \
      -out nginx/ssl/fullchain.pem \
      -subj "/C=RU/ST=Moscow/L=Moscow/O=MobileLegends/CN=localhost"
fi

echo -e "${GREEN}[7/8] Starting Docker containers...${NC}"
# Enable BuildKit for better build performance and caching
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Build with progress output and retry on failure
docker compose -f docker-compose.prod.yml build --progress=plain || {
    echo -e "${YELLOW}Build failed, retrying with no cache...${NC}"
    docker compose -f docker-compose.prod.yml build --no-cache --progress=plain
}

# Start the containers
docker compose -f docker-compose.prod.yml up -d

echo -e "${GREEN}[8/8] Initializing database...${NC}"
echo "Waiting for services to be healthy..."
sleep 30

docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy || {
    echo -e "${YELLOW}Migration failed, trying again in 10 seconds...${NC}"
    sleep 10
    docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy
}

docker compose -f docker-compose.prod.yml exec -T backend npx prisma db seed || {
    echo -e "${YELLOW}Seeding failed, but installation can continue${NC}"
}

echo -e "${GREEN}[9/8] Setting up firewall...${NC}"
apt install -y ufw
ufw --force enable
ufw allow ssh
ufw allow http
ufw allow https

echo ""
echo "================================================"
echo -e "${GREEN}Installation completed successfully!${NC}"
echo "================================================"
echo ""
echo "Application is running at:"
echo "  - HTTP:  http://$(curl -s ifconfig.me)"
echo "  - HTTPS: https://$(curl -s ifconfig.me)"
echo ""
echo "Test user credentials:"
echo "  - Admin: admin@mobilelegends.com / admin123"
echo "  - User:  test@mobilelegends.com / admin123"
echo ""
echo "Useful commands:"
echo "  - View logs:    docker compose -f docker-compose.prod.yml logs -f"
echo "  - Stop:         docker compose -f docker-compose.prod.yml down"
echo "  - Restart:      docker compose -f docker-compose.prod.yml restart"
echo "  - Status:       docker compose -f docker-compose.prod.yml ps"
echo ""
echo "Configuration file: $INSTALL_DIR/.env"
echo ""
echo -e "${YELLOW}IMPORTANT: Please change default passwords and configure your domain!${NC}"
echo ""
