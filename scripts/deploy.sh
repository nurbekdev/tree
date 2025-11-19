#!/bin/bash

# Deployment Script
# This script is run on the server to deploy the application

set -e

APP_DIR="/var/www/tree-monitor"
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

