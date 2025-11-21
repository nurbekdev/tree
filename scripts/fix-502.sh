#!/bin/bash

# Fix 502 Bad Gateway Error
# Bu script 502 xatosini hal qiladi

set -e

echo "=========================================="
echo "Fixing 502 Bad Gateway Error"
echo "=========================================="
echo ""

cd /var/www/tree-monitor/tree/backend

# 1. Check backend container
echo "1. Checking Backend Container:"
echo "-------------------"
if docker compose -f docker-compose.prod.yml ps backend | grep -q "Up"; then
    echo "✓ Backend container is running"
else
    echo "✗ Backend container is not running"
    echo "Starting backend..."
    docker compose -f docker-compose.prod.yml up -d backend
    sleep 5
fi
echo ""

# 2. Check if backend is responding
echo "2. Testing Backend Directly:"
echo "-------------------"
if curl -s http://127.0.0.1:3000/health > /dev/null; then
    echo "✓ Backend is responding on localhost:3000"
else
    echo "✗ Backend is NOT responding"
    echo "Restarting backend..."
    docker compose -f docker-compose.prod.yml restart backend
    echo "Waiting for backend to start..."
    sleep 10
    
    # Retry
    if curl -s http://127.0.0.1:3000/health > /dev/null; then
        echo "✓ Backend is now responding"
    else
        echo "✗ Backend still not responding"
        echo "Backend logs:"
        docker compose -f docker-compose.prod.yml logs backend --tail=30
        exit 1
    fi
fi
echo ""

# 3. Check Nginx configuration
echo "3. Checking Nginx Configuration:"
echo "-------------------"
if grep -q "location /api" /etc/nginx/sites-available/tree-monitor; then
    echo "✓ /api location block exists"
    echo "Configuration:"
    grep -A 5 "location /api" /etc/nginx/sites-available/tree-monitor | head -6
else
    echo "✗ /api location block not found!"
    echo "Fixing Nginx configuration..."
    cd /var/www/tree-monitor/tree
    ./scripts/fix-nginx.sh
fi
echo ""

# 4. Test through Nginx
echo "4. Testing Through Nginx:"
echo "-------------------"
PUBLIC_IP=$(curl -s ifconfig.me || echo "64.225.20.211")
echo -n "  http://$PUBLIC_IP/api/v1/auth/login: "

# Test login endpoint
TEST_RESPONSE=$(curl -s -X POST http://$PUBLIC_IP/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -o /dev/null -w "%{http_code}")

if [ "$TEST_RESPONSE" = "200" ]; then
    echo "✓ OK (HTTP 200)"
elif [ "$TEST_RESPONSE" = "502" ]; then
    echo "✗ Still getting 502"
    echo ""
    echo "Trying to fix..."
    echo "Reloading Nginx..."
    systemctl reload nginx
    sleep 2
    
    # Retry
    TEST_RESPONSE2=$(curl -s -X POST http://$PUBLIC_IP/api/v1/auth/login \
      -H "Content-Type: application/json" \
      -d '{"username":"admin","password":"admin123"}' \
      -o /dev/null -w "%{http_code}")
    
    if [ "$TEST_RESPONSE2" = "200" ]; then
        echo "✓ Fixed! Now working (HTTP 200)"
    else
        echo "✗ Still not working (HTTP $TEST_RESPONSE2)"
        echo ""
        echo "Check Nginx error logs:"
        tail -20 /var/log/nginx/error.log | grep -i "502\|upstream\|connect"
    fi
else
    echo "⚠️  HTTP $TEST_RESPONSE"
fi
echo ""

# 5. Show backend logs if still failing
if [ "$TEST_RESPONSE" = "502" ] || [ "$TEST_RESPONSE2" = "502" ]; then
    echo "5. Backend Logs (last 20 lines):"
    echo "-------------------"
    docker compose -f docker-compose.prod.yml logs backend --tail=20
    echo ""
fi

echo "=========================================="
echo "Fix Complete"
echo "=========================================="
echo ""
echo "If still getting 502:"
echo "  1. Check backend logs: docker compose -f docker-compose.prod.yml logs backend"
echo "  2. Check Nginx error logs: tail -50 /var/log/nginx/error.log"
echo "  3. Restart both: docker compose -f docker-compose.prod.yml restart && systemctl restart nginx"
echo ""

