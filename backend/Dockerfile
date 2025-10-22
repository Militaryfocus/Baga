FROM node:18-alpine

# Install system dependencies (for sharp and general builds)
RUN apk add --no-cache \
  libc6-compat \
  python3 \
  make \
  g++ \
  vips-dev \
  bash \
  curl
WORKDIR /app

# Configure Alpine repositories for better reliability
RUN echo "https://dl-cdn.alpinelinux.org/alpine/v$(cat /etc/alpine-release | cut -d. -f1,2)/main" > /etc/apk/repositories && \
    echo "https://dl-cdn.alpinelinux.org/alpine/v$(cat /etc/alpine-release | cut -d. -f1,2)/community" >> /etc/apk/repositories && \
    echo "https://mirror.yandex.ru/mirrors/alpine/v$(cat /etc/alpine-release | cut -d. -f1,2)/main" >> /etc/apk/repositories && \
    echo "https://mirror.yandex.ru/mirrors/alpine/v$(cat /etc/alpine-release | cut -d. -f1,2)/community" >> /etc/apk/repositories && \
    apk update --no-cache || (sleep 10 && apk update --no-cache) || (sleep 30 && apk update --no-cache) || exit 1

# Copy package files
COPY package.json package-lock.json* ./

# Configure npm robust network retries and install deps with retries
RUN npm config set fund false \
  && npm config set update-notifier false \
  && npm config set fetch-retries 5 \
  && npm config set fetch-retry-factor 2 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-timeout 600000 \
  && set -eux; for i in 1 2 3 4 5; do \
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