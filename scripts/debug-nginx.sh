#!/bin/bash

# Debug Nginx and Frontend Connection
# Bu script Nginx va Frontend o'rtasidagi ulanishni tekshiradi

set -e

echo "=========================================="
echo "Debugging Nginx and Frontend Connection"
echo "=========================================="
echo ""

# 1. Check frontend container
echo "1. Frontend Container Status:"
echo "-------------------"
cd /var/www/tree-monitor/tree/backend
docker compose -f docker-compose.prod.yml ps frontend
echo ""

# 2. Test frontend directly
echo "2. Testing Frontend Directly (localhost:3001):"
echo "-------------------"
echo -n "  GET /: "
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/ || echo "FAILED")
echo "HTTP $FRONTEND_RESPONSE"

if [ "$FRONTEND_RESPONSE" != "FAILED" ]; then
    echo "  Full response headers:"
    curl -I http://127.0.0.1:3001/ 2>&1 | head -10
else
    echo "  ✗ Frontend is not responding!"
fi
echo ""

# 3. Test backend directly
echo "3. Testing Backend Directly (localhost:3000):"
echo "-------------------"
echo -n "  GET /: "
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ || echo "FAILED")
echo "HTTP $BACKEND_RESPONSE"

if [ "$BACKEND_RESPONSE" != "FAILED" ]; then
    echo "  Full response:"
    curl -s http://127.0.0.1:3000/ | head -1
fi
echo ""

# 4. Test through Nginx
echo "4. Testing Through Nginx (external IP):"
echo "-------------------"
PUBLIC_IP=$(curl -s ifconfig.me || echo "64.225.20.211")
echo "  Testing http://$PUBLIC_IP/:"
NGINX_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://$PUBLIC_IP/ || echo "FAILED")
echo "  HTTP $NGINX_RESPONSE"

if [ "$NGINX_RESPONSE" != "FAILED" ]; then
    echo "  Full response headers:"
    curl -I http://$PUBLIC_IP/ 2>&1 | head -15
    
    echo "  Response body (first 100 chars):"
    curl -s http://$PUBLIC_IP/ | head -c 100
    echo ""
fi
echo ""

# 5. Check Nginx configuration
echo "5. Nginx Configuration Check:"
echo "-------------------"
echo "  Active site:"
ls -la /etc/nginx/sites-enabled/ | grep tree-monitor || echo "  ✗ Site not enabled!"

echo "  Location / block:"
grep -A 5 "location / {" /etc/nginx/sites-available/tree-monitor | head -10
echo ""

# 6. Check Nginx error logs
echo "6. Recent Nginx Errors:"
echo "-------------------"
tail -20 /var/log/nginx/error.log 2>/dev/null | grep -i error || echo "  No recent errors"
echo ""

# 7. Check frontend logs
echo "7. Frontend Container Logs (last 20 lines):"
echo "-------------------"
docker compose -f docker-compose.prod.yml logs frontend --tail=20 2>&1 | tail -20
echo ""

# 8. Test specific routes
echo "8. Testing Specific Routes:"
echo "-------------------"
echo -n "  /login: "
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/login
echo ""
echo -n "  /dashboard: "
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/dashboard
echo ""
echo ""

echo "=========================================="
echo "Debug Complete"
echo "=========================================="
echo ""
echo "If frontend responds but Nginx doesn't, check:"
echo "  1. Nginx site is enabled"
echo "  2. Location / block proxy_pass is correct"
echo "  3. No other location blocks are matching first"

