# Alpine Linux Docker Build Fix

## Problem
The Docker build is failing with Alpine Linux package index fetching errors:
```
=> [frontend runner 3/5] RUN echo "https://dl-cdn.alpinelinux.org/alpine
=> => # fetch https://dl-cdn.alpinelinux.org/alpine
=> => # /v3.18/main/x86_64/APKINDEX.tar.gz
```

## Root Cause
This error occurs when Docker tries to fetch Alpine Linux packages during the build process, but the default Alpine repositories are slow or unreachable from your network location.

## Solutions Applied

### 1. Updated Production Dockerfiles
- **Files Modified**: `frontend/Dockerfile.prod`, `backend/Dockerfile.prod`
- **Changes**: Added multiple Alpine mirrors and retry logic
- **Mirrors Added**:
  - Primary: `https://dl-cdn.alpinelinux.org/alpine/v3.18/`
  - Backup: `https://mirror.yandex.ru/mirrors/alpine/v3.18/`
  - Additional: `https://mirror1.alpinelinux.org/alpine/v3.18/`

### 2. Created Robust Dockerfiles
- **Files Created**: `frontend/Dockerfile.robust`, `backend/Dockerfile.robust`
- **Features**:
  - Multiple Alpine mirrors
  - Retry logic for `apk update`
  - Better error handling
  - Optimized layer caching

### 3. Updated Main Dockerfiles
- **Files Modified**: `frontend/Dockerfile`, `backend/Dockerfile`
- **Changes**: Added Alpine repository configuration and npm retry settings

### 4. Created Alternative Docker Compose Files
- **Files Created**: 
  - `docker-compose.robust.yml` - Uses robust Dockerfiles
  - `docker-compose.simple.yml` - Uses simple Dockerfiles (no Alpine package fetching)

## How to Use

### Option 1: Use Robust Configuration (Recommended)
```bash
# Build and run with robust configuration
docker-compose -f docker-compose.robust.yml up --build
```

### Option 2: Use Simple Configuration (Fallback)
```bash
# Build and run with simple configuration (no Alpine package fetching)
docker-compose -f docker-compose.simple.yml up --build
```

### Option 3: Use Original Configuration with Fixes
```bash
# Build and run with updated original configuration
docker-compose up --build
```

## Manual Fix Commands

If you're still experiencing issues, try these commands:

### 1. Clean Docker Cache
```bash
docker builder prune -f
docker system prune -f
```

### 2. Build with No Cache
```bash
docker-compose build --no-cache
```

### 3. Build Individual Services
```bash
# Build backend only
docker-compose build backend

# Build frontend only
docker-compose build frontend
```

## Alternative Approaches

### 1. Use Different Base Images
If Alpine continues to cause issues, you can modify the Dockerfiles to use different base images:

```dockerfile
# Instead of node:18-alpine, use:
FROM node:18-slim
# or
FROM node:18-bullseye
```

### 2. Use Pre-built Images
Instead of building from source, you can use pre-built images:

```yaml
# In docker-compose.yml
services:
  frontend:
    image: nginx:alpine  # Use pre-built image
    # Remove build section
```

### 3. Use BuildKit
Enable Docker BuildKit for better caching and parallel builds:

```bash
export DOCKER_BUILDKIT=1
docker-compose up --build
```

## Network-Specific Solutions

### For Corporate Networks
If you're behind a corporate firewall, you may need to configure Docker to use a proxy:

```bash
# Create or edit ~/.docker/config.json
{
  "proxies": {
    "default": {
      "httpProxy": "http://proxy.company.com:8080",
      "httpsProxy": "http://proxy.company.com:8080",
      "noProxy": "localhost,127.0.0.1"
    }
  }
}
```

### For Slow Networks
Add timeout configurations to your Docker daemon:

```bash
# Edit /etc/docker/daemon.json
{
  "max-concurrent-downloads": 1,
  "max-concurrent-uploads": 1
}
```

## Verification

After applying the fix, verify the build works:

```bash
# Test the build
docker-compose -f docker-compose.robust.yml build

# Check if containers start
docker-compose -f docker-compose.robust.yml up -d

# Check logs
docker-compose -f docker-compose.robust.yml logs
```

## Troubleshooting

### If Build Still Fails
1. Check your internet connection
2. Try using a VPN
3. Use the simple configuration (no Alpine packages)
4. Check Docker daemon logs: `journalctl -u docker.service`

### If Containers Don't Start
1. Check port conflicts: `netstat -tulpn | grep :3000`
2. Check Docker logs: `docker logs <container_name>`
3. Verify environment variables are set correctly

## Files Modified/Created

### Modified Files
- `frontend/Dockerfile.prod` - Added multiple Alpine mirrors
- `backend/Dockerfile.prod` - Added multiple Alpine mirrors  
- `frontend/Dockerfile` - Added Alpine repo config and npm retry
- `backend/Dockerfile` - Added Alpine repo config and npm retry

### New Files
- `frontend/Dockerfile.robust` - Robust version with retry logic
- `backend/Dockerfile.robust` - Robust version with retry logic
- `docker-compose.robust.yml` - Uses robust Dockerfiles
- `docker-compose.simple.yml` - Uses simple Dockerfiles
- `fix-docker-build.sh` - Automated build script
- `ALPINE_DOCKER_FIX.md` - This documentation

The Alpine package fetching issue should now be resolved with multiple fallback options available.