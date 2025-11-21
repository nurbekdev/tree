#!/bin/bash

# Deployment Script
# This script is run on the server to deploy the application

set -e

APP_DIR="/var/www/tree-monitor/tree"
cd $APP_DIR

echo "=========================================="
echo "Deploying Tree Monitoring System"
echo "=========================================="

# Pull latest changes
echo "Pulling latest changes from Git..."
git pull origin main || git pull origin master

# Navigate to backend
cd backend

# Stop existing containers
echo "Stopping existing containers..."
docker compose -f docker-compose.prod.yml down || true

# Remove old containers
echo "Removing old containers..."
docker compose -f docker-compose.prod.yml rm -f || true

# Check for processes using ports 3000 and 3001
echo "Checking for processes using ports 3000 and 3001..."
lsof -ti:3000 | xargs -r kill -9 2>/dev/null || echo "No process found on port 3000"
lsof -ti:3001 | xargs -r kill -9 2>/dev/null || echo "No process found on port 3001"

echo "Waiting for ports to be released..."
sleep 3

# Clean up Docker resources
echo "Cleaning up Docker resources..."
docker system prune -f || true

# Build and start containers
echo "Building and starting containers..."
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Check health
echo "Checking service health..."
docker compose -f docker-compose.prod.yml ps

# Show logs
echo "Recent logs:"
docker compose -f docker-compose.prod.yml logs --tail=50

# Fix Nginx configuration
echo ""
echo "Configuring Nginx..."
if [ -f ../scripts/fix-nginx.sh ]; then
    chmod +x ../scripts/fix-nginx.sh
    ../scripts/fix-nginx.sh
else
    echo "⚠️  Nginx fix script topilmadi, qo'lda sozlash kerak"
fi

# Wait a bit more for services to be fully ready
echo "Waiting for services to be fully ready..."
sleep 5

# Test services
echo ""
echo "Testing services..."
if curl -s http://127.0.0.1:3000/health > /dev/null; then
    echo "✓ Backend is responding"
else
    echo "⚠️  Backend not responding yet"
fi

if curl -s http://127.0.0.1:3001 > /dev/null; then
    echo "✓ Frontend is responding"
else
    echo "⚠️  Frontend not responding yet"
fi

echo ""
echo "=========================================="
echo "Deployment complete!"
echo "=========================================="
echo ""
echo "Services are running. Check status with:"
echo "  docker compose -f docker-compose.prod.yml ps"
echo ""
echo "View logs with:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "If you see 'Not Found' error, run:"
echo "  cd /var/www/tree-monitor/tree && ./scripts/fix-nginx.sh"
echo ""

