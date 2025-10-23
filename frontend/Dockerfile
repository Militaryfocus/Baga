FROM node:18-alpine

WORKDIR /app

# Configure Alpine repositories for better reliability
RUN echo "https://dl-cdn.alpinelinux.org/alpine/v$(cat /etc/alpine-release | cut -d. -f1,2)/main" > /etc/apk/repositories && \
    echo "https://dl-cdn.alpinelinux.org/alpine/v$(cat /etc/alpine-release | cut -d. -f1,2)/community" >> /etc/apk/repositories && \
    echo "https://mirror.yandex.ru/mirrors/alpine/v$(cat /etc/alpine-release | cut -d. -f1,2)/main" >> /etc/apk/repositories && \
    echo "https://mirror.yandex.ru/mirrors/alpine/v$(cat /etc/alpine-release | cut -d. -f1,2)/community" >> /etc/apk/repositories && \
    apk update --no-cache || (sleep 10 && apk update --no-cache) || (sleep 30 && apk update --no-cache) || exit 1

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with retry logic
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]