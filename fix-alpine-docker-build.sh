#!/bin/bash

# Alpine Linux Docker Build Fix Script
# This script provides multiple fallback options for Docker builds when Alpine Linux packages fail

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to clean up Docker resources
cleanup_docker() {
    print_status "Cleaning up Docker resources..."
    docker system prune -f || true
    docker builder prune -f || true
}

# Function to test Docker build
test_build() {
    local dockerfile=$1
    local context=$2
    local service_name=$3
    
    print_status "Testing build with $dockerfile..."
    if docker build -f "$dockerfile" -t "test-$service_name" "$context" > /dev/null 2>&1; then
        print_success "Build successful with $dockerfile"
        return 0
    else
        print_error "Build failed with $dockerfile"
        return 1
    fi
}

# Function to try different build strategies
try_build_strategies() {
    local service=$1
    local context="./$service"
    
    print_status "Trying different build strategies for $service..."
    
    # Strategy 1: Try robust Alpine build
    if test_build "$context/Dockerfile.robust" "$context" "$service"; then
        print_success "Robust Alpine build successful for $service"
        return 0
    fi
    
    # Strategy 2: Try simple Alpine build
    if test_build "$context/Dockerfile" "$context" "$service"; then
        print_success "Standard Alpine build successful for $service"
        return 0
    fi
    
    # Strategy 3: Try simple Debian build
    if test_build "$context/Dockerfile.simple" "$context" "$service"; then
        print_success "Simple Debian build successful for $service"
        return 0
    fi
    
    print_error "All build strategies failed for $service"
    return 1
}

# Function to run docker-compose with different configurations
run_compose() {
    local config_file=$1
    local description=$2
    
    print_status "Trying $description..."
    if docker-compose -f "$config_file" up -d --build; then
        print_success "$description successful"
        return 0
    else
        print_error "$description failed"
        return 1
    fi
}

# Main execution
main() {
    print_status "Starting Alpine Linux Docker Build Fix Script"
    print_status "=============================================="
    
    # Clean up existing containers and images
    print_status "Cleaning up existing Docker resources..."
    docker-compose down --remove-orphans 2>/dev/null || true
    cleanup_docker
    
    # Test individual builds
    print_status "Testing individual service builds..."
    
    if try_build_strategies "frontend"; then
        print_success "Frontend build test passed"
    else
        print_error "Frontend build test failed"
    fi
    
    if try_build_strategies "backend"; then
        print_success "Backend build test passed"
    else
        print_error "Backend build test failed"
    fi
    
    # Try different docker-compose configurations
    print_status "Trying different docker-compose configurations..."
    
    # Strategy 1: Try robust configuration
    if run_compose "docker-compose.robust.yml" "Robust Alpine configuration"; then
        print_success "Robust configuration successful"
        docker-compose -f docker-compose.robust.yml down
    fi
    
    # Strategy 2: Try simple Alpine configuration
    if run_compose "docker-compose.simple.yml" "Simple Alpine configuration"; then
        print_success "Simple Alpine configuration successful"
        docker-compose -f docker-compose.simple.yml down
    fi
    
    # Strategy 3: Try production configuration
    if run_compose "docker-compose.prod.yml" "Production Alpine configuration"; then
        print_success "Production configuration successful"
        docker-compose -f docker-compose.prod.yml down
    fi
    
    # Strategy 4: Try simple production configuration
    if run_compose "docker-compose.simple.prod.yml" "Simple Production Debian configuration"; then
        print_success "Simple Production configuration successful"
        docker-compose -f docker-compose.simple.prod.yml down
    fi
    
    print_status "Build fix script completed"
    print_status "Available configurations:"
    echo "  - docker-compose.robust.yml (Enhanced Alpine with retry logic)"
    echo "  - docker-compose.simple.yml (Simple Alpine fallback)"
    echo "  - docker-compose.prod.yml (Production Alpine)"
    echo "  - docker-compose.simple.prod.yml (Production Debian fallback)"
    echo ""
    print_status "To use a specific configuration:"
    echo "  docker-compose -f <config-file> up -d --build"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Run main function
main "$@"