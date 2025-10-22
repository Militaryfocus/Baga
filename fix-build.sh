#!/bin/bash
# Docker Build Fix Script
# This script helps resolve common Docker build issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================================"
echo "Docker Build Fix Script"
echo "================================================"
echo ""

echo -e "${GREEN}[1/5] Cleaning Docker cache...${NC}"
docker builder prune -f
docker system prune -f

echo -e "${GREEN}[2/5] Stopping all containers...${NC}"
docker compose -f docker-compose.prod.yml down -v 2>/dev/null || true

echo -e "${GREEN}[3/5] Removing old images...${NC}"
docker rmi $(docker images | grep ml_community | awk '{print $3}') 2>/dev/null || true

echo -e "${GREEN}[4/5] Setting up build environment...${NC}"
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
export BUILDKIT_PROGRESS=plain

echo -e "${GREEN}[5/5] Building with fresh cache...${NC}"
docker compose -f docker-compose.prod.yml build --no-cache --progress=plain

echo ""
echo -e "${GREEN}Build completed successfully!${NC}"
echo ""
echo "To start the application, run:"
echo "  docker compose -f docker-compose.prod.yml up -d"
echo ""
