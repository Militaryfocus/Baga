#!/bin/bash

# Docker Configuration Validation Script
# Validates all Dockerfile and docker-compose configurations

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to validate Dockerfile syntax
validate_dockerfile() {
    local dockerfile=$1
    local service=$2
    
    if [ ! -f "$dockerfile" ]; then
        print_error "Dockerfile not found: $dockerfile"
        return 1
    fi
    
    print_status "Validating $dockerfile..."
    
    # Check for common Dockerfile issues
    local issues=0
    
    # Check for FROM statement
    if ! grep -q "^FROM " "$dockerfile"; then
        print_error "Missing FROM statement in $dockerfile"
        issues=$((issues + 1))
    fi
    
    # Check for WORKDIR statement
    if ! grep -q "^WORKDIR " "$dockerfile"; then
        print_warning "Missing WORKDIR statement in $dockerfile"
    fi
    
    # Check for proper RUN command formatting
    if grep -q "RUN.*&&.*&&" "$dockerfile"; then
        print_warning "Long RUN command detected in $dockerfile - consider breaking into multiple lines"
    fi
    
    # Check for Alpine-specific issues
    if grep -q "FROM.*alpine" "$dockerfile"; then
        if ! grep -q "apk update" "$dockerfile"; then
            print_warning "Alpine image detected but no apk update found in $dockerfile"
        fi
    fi
    
    if [ $issues -eq 0 ]; then
        print_success "$dockerfile validation passed"
        return 0
    else
        print_error "$dockerfile validation failed with $issues issues"
        return 1
    fi
}

# Function to validate docker-compose file
validate_compose() {
    local compose_file=$1
    
    if [ ! -f "$compose_file" ]; then
        print_error "Docker-compose file not found: $compose_file"
        return 1
    fi
    
    print_status "Validating $compose_file..."
    
    # Check for version
    if ! grep -q "^version:" "$compose_file"; then
        print_error "Missing version in $compose_file"
        return 1
    fi
    
    # Check for services
    if ! grep -q "^services:" "$compose_file"; then
        print_error "Missing services section in $compose_file"
        return 1
    fi
    
    # Check for required services
    local required_services=("postgres" "redis" "backend" "frontend")
    for service in "${required_services[@]}"; do
        if ! grep -q "^  $service:" "$compose_file"; then
            print_warning "Missing $service in $compose_file"
        fi
    done
    
    print_success "$compose_file validation passed"
    return 0
}

# Main validation function
main() {
    print_status "Docker Configuration Validation"
    print_status "================================="
    
    local total_files=0
    local passed_files=0
    
    # Validate Dockerfiles
    print_status "Validating Dockerfiles..."
    
    dockerfiles=(
        "frontend/Dockerfile"
        "frontend/Dockerfile.prod"
        "frontend/Dockerfile.robust"
        "frontend/Dockerfile.simple"
        "backend/Dockerfile"
        "backend/Dockerfile.prod"
        "backend/Dockerfile.robust"
        "backend/Dockerfile.simple"
        "backend/Dockerfile.simple.prod"
    )
    
    for dockerfile in "${dockerfiles[@]}"; do
        total_files=$((total_files + 1))
        if validate_dockerfile "$dockerfile" "service"; then
            passed_files=$((passed_files + 1))
        fi
    done
    
    # Validate docker-compose files
    print_status "Validating docker-compose files..."
    
    compose_files=(
        "docker-compose.yml"
        "docker-compose.prod.yml"
        "docker-compose.robust.yml"
        "docker-compose.simple.yml"
        "docker-compose.simple.prod.yml"
    )
    
    for compose_file in "${compose_files[@]}"; do
        total_files=$((total_files + 1))
        if validate_compose "$compose_file"; then
            passed_files=$((passed_files + 1))
        fi
    done
    
    # Summary
    print_status "================================="
    print_status "Validation Results: $passed_files/$total_files files passed"
    
    if [ $passed_files -eq $total_files ]; then
        print_success "All configurations are valid!"
    elif [ $passed_files -gt $((total_files / 2)) ]; then
        print_warning "Most configurations are valid. Review warnings above."
    else
        print_error "Many configurations have issues. Please review and fix."
    fi
    
    # Show available configurations
    print_status ""
    print_status "Available Docker configurations:"
    echo "  Development:"
    echo "    - docker-compose.robust.yml (Enhanced Alpine with retry logic)"
    echo "    - docker-compose.simple.yml (Simple Alpine fallback)"
    echo "  Production:"
    echo "    - docker-compose.prod.yml (Production Alpine)"
    echo "    - docker-compose.simple.prod.yml (Production Debian fallback)"
    echo ""
    print_status "To test builds (when Docker is available):"
    echo "  ./quick-build-test.sh"
    echo "  ./fix-alpine-docker-build.sh"
}

# Run main function
main "$@"