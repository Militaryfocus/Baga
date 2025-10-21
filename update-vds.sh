#!/bin/bash
# Mobile Legends Fan Community - VDS Update Script
# This script updates the application on VDS

set -e  # Exit on error

echo "================================================"
echo "Mobile Legends Fan Community - Update Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}Current directory: $SCRIPT_DIR${NC}"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
   echo -e "${YELLOW}Note: Running without root. Some operations may require sudo.${NC}"
   echo ""
fi

# Function to check if docker compose is available
check_docker_compose() {
    if command -v docker &> /dev/null && docker compose version &> /dev/null; then
        echo "docker compose"
    elif command -v docker-compose &> /dev/null; then
        echo "docker-compose"
    else
        echo -e "${RED}Error: Docker Compose not found${NC}"
        exit 1
    fi
}

DOCKER_COMPOSE=$(check_docker_compose)
echo -e "${GREEN}Using: $DOCKER_COMPOSE${NC}"
echo ""

# Detect which compose file to use
COMPOSE_FILE="docker-compose.yml"
if [ -f "docker-compose.prod.yml" ]; then
    read -p "Use production config? (y/n, default: y): " USE_PROD
    USE_PROD=${USE_PROD:-y}
    if [ "$USE_PROD" = "y" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
    fi
fi

echo -e "${BLUE}Using compose file: $COMPOSE_FILE${NC}"
echo ""

# Step 1: Backup database
echo -e "${GREEN}[1/7] Creating database backup...${NC}"
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"

if [ "$COMPOSE_FILE" = "docker-compose.prod.yml" ]; then
    DB_CONTAINER="ml_community_postgres_prod"
    DB_USER="ml_user_prod"
    DB_NAME="mobile_legends_community_prod"
else
    DB_CONTAINER="ml_community_postgres"
    DB_USER="ml_user"
    DB_NAME="mobile_legends_community"
fi

if docker ps | grep -q "$DB_CONTAINER"; then
    docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null || {
        echo -e "${YELLOW}Warning: Could not create backup. Continuing...${NC}"
    }
    if [ -f "$BACKUP_FILE" ]; then
        echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
    fi
else
    echo -e "${YELLOW}Database container not running, skipping backup${NC}"
fi
echo ""

# Step 2: Stash local changes (if any)
echo -e "${GREEN}[2/7] Checking for local changes...${NC}"
if git status --porcelain | grep -q .; then
    echo -e "${YELLOW}Local changes detected. Stashing...${NC}"
    git stash save "Auto-stash before update $(date +%Y%m%d_%H%M%S)"
fi
echo ""

# Step 3: Pull latest changes
echo -e "${GREEN}[3/7] Pulling latest changes from git...${NC}"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${BLUE}Current branch: $CURRENT_BRANCH${NC}"

git fetch origin
git pull origin "$CURRENT_BRANCH" || {
    echo -e "${RED}Error: Failed to pull changes${NC}"
    exit 1
}
echo ""

# Step 4: Update environment variables (if needed)
echo -e "${GREEN}[4/7] Checking environment configuration...${NC}"
if [ -f ".env.example" ] && [ -f ".env" ]; then
    # Check if there are new variables in .env.example
    NEW_VARS=$(comm -13 <(grep -v '^#' .env | cut -d= -f1 | sort) <(grep -v '^#' .env.example | cut -d= -f1 | sort) | wc -l)
    if [ "$NEW_VARS" -gt 0 ]; then
        echo -e "${YELLOW}⚠ Warning: Found $NEW_VARS new environment variables in .env.example${NC}"
        echo -e "${YELLOW}Please review and update your .env file${NC}"
        read -p "Press Enter to continue or Ctrl+C to abort..."
    else
        echo -e "${GREEN}✓ Environment configuration up to date${NC}"
    fi
else
    echo -e "${YELLOW}No .env file found${NC}"
fi
echo ""

# Step 5: Stop containers
echo -e "${GREEN}[5/7] Stopping containers...${NC}"
$DOCKER_COMPOSE -f "$COMPOSE_FILE" down || {
    echo -e "${YELLOW}Warning: Some containers may not have stopped cleanly${NC}"
}
echo ""

# Step 6: Rebuild and start containers
echo -e "${GREEN}[6/7] Building and starting containers...${NC}"
$DOCKER_COMPOSE -f "$COMPOSE_FILE" up -d --build || {
    echo -e "${RED}Error: Failed to start containers${NC}"
    echo -e "${YELLOW}Attempting to restore from backup...${NC}"
    
    # Try to restore database from backup
    if [ -f "$BACKUP_FILE" ]; then
        $DOCKER_COMPOSE -f "$COMPOSE_FILE" up -d postgres
        sleep 10
        docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" "$DB_NAME" < "$BACKUP_FILE"
    fi
    exit 1
}
echo ""

# Wait for services to be ready
echo -e "${BLUE}Waiting for services to be ready...${NC}"
sleep 15

# Step 7: Run database migrations
echo -e "${GREEN}[7/7] Running database migrations...${NC}"
if [ "$COMPOSE_FILE" = "docker-compose.prod.yml" ]; then
    BACKEND_CONTAINER="ml_community_backend_prod"
else
    BACKEND_CONTAINER="ml_community_backend"
fi

# Wait for backend to be ready
for i in {1..30}; do
    if docker ps | grep -q "$BACKEND_CONTAINER"; then
        if docker exec "$BACKEND_CONTAINER" npx prisma migrate deploy 2>/dev/null; then
            echo -e "${GREEN}✓ Migrations applied successfully${NC}"
            break
        fi
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}Warning: Could not apply migrations. Please run manually:${NC}"
        echo -e "${YELLOW}  $DOCKER_COMPOSE -f $COMPOSE_FILE exec backend npx prisma migrate deploy${NC}"
    fi
    sleep 2
done
echo ""

# Check container status
echo -e "${GREEN}Checking container status...${NC}"
$DOCKER_COMPOSE -f "$COMPOSE_FILE" ps
echo ""

# Health check
echo -e "${GREEN}Running health check...${NC}"
sleep 5
if curl -f -s http://localhost/api/health > /dev/null 2>&1 || curl -f -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Application is healthy${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Health check failed. Check logs:${NC}"
    echo -e "${YELLOW}  $DOCKER_COMPOSE -f $COMPOSE_FILE logs -f${NC}"
fi
echo ""

# Show logs
read -p "Show logs? (y/n, default: n): " SHOW_LOGS
SHOW_LOGS=${SHOW_LOGS:-n}
if [ "$SHOW_LOGS" = "y" ]; then
    $DOCKER_COMPOSE -f "$COMPOSE_FILE" logs -f
fi

echo ""
echo "================================================"
echo -e "${GREEN}✓ Update completed successfully!${NC}"
echo "================================================"
echo ""
echo "Useful commands:"
echo "  - View logs:    $DOCKER_COMPOSE -f $COMPOSE_FILE logs -f"
echo "  - Stop:         $DOCKER_COMPOSE -f $COMPOSE_FILE down"
echo "  - Restart:      $DOCKER_COMPOSE -f $COMPOSE_FILE restart"
echo "  - Status:       $DOCKER_COMPOSE -f $COMPOSE_FILE ps"
echo ""
echo "Backup location: $BACKUP_FILE"
echo ""
echo -e "${BLUE}Application is running at:${NC}"
echo "  - Frontend: http://localhost or http://localhost:3000"
echo "  - Backend:  http://localhost/api or http://localhost:3001/api"
echo ""
