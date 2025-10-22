FROM node:18-bullseye-slim

# Install system dependencies (for sharp and general builds) and ensure OpenSSL 1.1 compatibility
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    curl \
    bash \
    libvips-dev \
    ca-certificates \
    openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Configure npm robust network retries and install deps with retries
RUN npm config set fund false \
  && npm config set update-notifier false \
  && npm config set fetch-retries 5 \
  && npm config set fetch-retry-factor 2 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-timeout 600000 \
  && set -eux; for i in 1 2 3; do \
    npm ci --no-audit --no-fund && break; \
    echo "npm ci failed (attempt $i), retrying..."; \
    sleep $((i*5)); \
  done

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3001

# Start development server
CMD ["npm", "run", "dev"]