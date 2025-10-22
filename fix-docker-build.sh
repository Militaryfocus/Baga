#!/bin/bash

echo "🔧 Fixing Docker build issues with Alpine package fetching..."

# Function to clean up Docker build cache
clean_docker_cache() {
    echo "🧹 Cleaning Docker build cache..."
    docker builder prune -f
    docker system prune -f
}

# Function to build with retry logic
build_with_retry() {
    local service=$1
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "🔄 Attempt $attempt/$max_attempts: Building $service..."
        
        if docker-compose -f docker-compose.robust.yml build $service; then
            echo "✅ Successfully built $service"
            return 0
        else
            echo "❌ Failed to build $service (attempt $attempt/$max_attempts)"
            if [ $attempt -lt $max_attempts ]; then
                echo "⏳ Waiting 10 seconds before retry..."
                sleep 10
                clean_docker_cache
            fi
            attempt=$((attempt + 1))
        fi
    done
    
    echo "❌ Failed to build $service after $max_attempts attempts"
    return 1
}

# Main execution
echo "🚀 Starting Docker build fix process..."

# Clean Docker cache first
clean_docker_cache

# Try building with the robust configuration
echo "📦 Building with robust Docker configuration..."

if build_with_retry "backend" && build_with_retry "frontend"; then
    echo "✅ All services built successfully!"
    echo "🎉 You can now run: docker-compose -f docker-compose.robust.yml up"
else
    echo "❌ Build failed. Trying alternative approach..."
    
    # Try building with simple Dockerfiles
    echo "📦 Trying with simple Docker configuration..."
    if docker-compose -f docker-compose.simple.yml build; then
        echo "✅ Simple build successful!"
        echo "🎉 You can now run: docker-compose -f docker-compose.simple.yml up"
    else
        echo "❌ All build attempts failed. Please check your network connection and try again."
        exit 1
    fi
fi

echo "🏁 Docker build fix process completed!"