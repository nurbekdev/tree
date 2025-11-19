#!/bin/bash

# Server Setup Script for Tree Monitoring System
# Run this script on your DigitalOcean server (Ubuntu 24.10)

set -e

echo "=========================================="
echo "Tree Monitoring System - Server Setup"
echo "=========================================="

# Update system
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required packages
echo "Installing required packages..."
apt-get install -y \
    git \
    curl \
    docker.io \
    docker-compose \
    nginx \
    certbot \
    python3-certbot-nginx

# Start and enable Docker
echo "Starting Docker service..."
systemctl start docker
systemctl enable docker

# Add current user to docker group (if not root)
if [ "$USER" != "root" ]; then
    usermod -aG docker $USER
fi

# Create application directory
APP_DIR="/var/www/tree-monitor"
echo "Creating application directory: $APP_DIR"
mkdir -p $APP_DIR
cd $APP_DIR

# Clone repository (if not already cloned)
if [ ! -d ".git" ]; then
    echo "Please clone your repository manually:"
    echo "  cd $APP_DIR"
    echo "  git clone <your-repo-url> ."
    echo ""
    echo "Or if you want to clone now, enter your repo URL:"
    read -p "Repository URL (or press Enter to skip): " REPO_URL
    if [ ! -z "$REPO_URL" ]; then
        git clone $REPO_URL .
    fi
fi

# Create .env file for backend
echo "Creating backend .env file..."
cd backend
if [ ! -f ".env" ]; then
    cp env.example .env
    echo ""
    echo "=========================================="
    echo "IMPORTANT: Edit backend/.env file!"
    echo "=========================================="
    echo "Set the following values:"
    echo "  - DB_PASSWORD: (strong password)"
    echo "  - API_KEY: (strong random key)"
    echo "  - JWT_SECRET: (strong random key)"
    echo ""
    echo "You can generate random keys with:"
    echo "  openssl rand -hex 32"
    echo ""
    read -p "Press Enter to continue after editing .env..."
fi

# Create production docker-compose file if it doesn't exist
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "Creating docker-compose.prod.yml..."
    cat > docker-compose.prod.yml << 'DOCKER_COMPOSE_EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: tree-monitor-db-prod
    environment:
      POSTGRES_DB: ${DB_NAME:-tree_monitor}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - tree-monitor-network

  backend:
    build: .
    container_name: tree-monitor-api-prod
    env_file:
      - .env
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME:-tree_monitor}
      DB_USER: ${DB_USER:-postgres}
      DB_PASSWORD: ${DB_PASSWORD}
      PORT: 3000
    ports:
      - "127.0.0.1:3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - .:/app
      - /app/node_modules
    command: sh -c "npm install && node scripts/migrate.js && node server.js"
    restart: unless-stopped
    networks:
      - tree-monitor-network

  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: http://64.225.20.211/api
    container_name: tree-monitor-frontend-prod
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: http://64.225.20.211/api
    ports:
      - "127.0.0.1:3001:3001"
    restart: unless-stopped
    networks:
      - tree-monitor-network

volumes:
  postgres_data:

networks:
  tree-monitor-network:
    driver: bridge
DOCKER_COMPOSE_EOF
fi

# Setup Nginx reverse proxy
echo "Setting up Nginx reverse proxy..."
cat > /etc/nginx/sites-available/tree-monitor << 'NGINX_EOF'
server {
    listen 80;
    server_name _;  # Replace with your domain name

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Next.js static files
    location /_next/static {
        proxy_pass http://127.0.0.1:3001;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF

# Enable site
ln -sf /etc/nginx/sites-available/tree-monitor /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

echo ""
echo "=========================================="
echo "Server setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your configuration"
echo "2. Start the application:"
echo "   cd $APP_DIR/backend"
echo "   docker compose -f docker-compose.prod.yml up -d"
echo "3. Check logs:"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo "4. Setup SSL (optional):"
echo "   certbot --nginx -d your-domain.com"
echo ""
echo "Your API will be available at:"
echo "  http://$(curl -s ifconfig.me)/api"
echo ""

