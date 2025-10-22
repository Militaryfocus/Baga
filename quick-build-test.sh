#!/bin/bash

# Quick Build Test Script
# Tests all Docker configurations quickly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to test a single configuration
test_config() {
    local config_file=$1
    local description=$2
    
    print_status "Testing $description..."
    
    if docker-compose -f "$config_file" build --no-cache > /dev/null 2>&1; then
        print_success "$description - BUILD SUCCESS"
        return 0
    else
        print_error "$description - BUILD FAILED"
        return 1
    fi
}

# Main execution
main() {
    print_status "Quick Build Test - Testing all configurations"
    print_status "============================================="
    
    # Clean up first
    docker-compose down --remove-orphans 2>/dev/null || true
    docker system prune -f > /dev/null 2>&1 || true
    
    local success_count=0
    local total_count=0
    
    # Test configurations
    configs=(
        "docker-compose.robust.yml:Robust Alpine Configuration"
        "docker-compose.simple.yml:Simple Alpine Configuration"
        "docker-compose.prod.yml:Production Alpine Configuration"
        "docker-compose.simple.prod.yml:Simple Production Debian Configuration"
    )
    
    for config in "${configs[@]}"; do
        IFS=':' read -r file desc <<< "$config"
        total_count=$((total_count + 1))
        
        if test_config "$file" "$desc"; then
            success_count=$((success_count + 1))
        fi
        
        # Clean up after each test
        docker-compose -f "$file" down --remove-orphans 2>/dev/null || true
    done
    
    print_status "============================================="
    print_status "Test Results: $success_count/$total_count configurations successful"
    
    if [ $success_count -eq $total_count ]; then
        print_success "All configurations are working!"
    elif [ $success_count -gt 0 ]; then
        print_status "Some configurations are working. Use the working ones."
    else
        print_error "No configurations are working. Check Docker setup."
    fi
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Run main function
main "$@"