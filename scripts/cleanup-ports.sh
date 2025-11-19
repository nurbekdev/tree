#!/bin/bash

# Port Cleanup Script
# Bu script port'larni bo'shatish uchun ishlatiladi

echo "=========================================="
echo "Port Cleanup Script"
echo "=========================================="

# Check for processes on port 3000
echo "Checking port 3000..."
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "Found processes on port 3000:"
    lsof -ti:3000 | xargs ps -p
    echo "Killing processes on port 3000..."
    lsof -ti:3000 | xargs kill -9
    echo "✓ Port 3000 cleaned"
else
    echo "✓ Port 3000 is free"
fi

# Check for processes on port 3001
echo "Checking port 3001..."
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "Found processes on port 3001:"
    lsof -ti:3001 | xargs ps -p
    echo "Killing processes on port 3001..."
    lsof -ti:3001 | xargs kill -9
    echo "✓ Port 3001 cleaned"
else
    echo "✓ Port 3001 is free"
fi

# Stop and remove containers
echo "Stopping Docker containers..."
cd /var/www/tree-monitor/backend 2>/dev/null || cd backend
docker compose -f docker-compose.prod.yml down || true
docker compose -f docker-compose.prod.yml rm -f || true

echo ""
echo "=========================================="
echo "Cleanup complete!"
echo "=========================================="

