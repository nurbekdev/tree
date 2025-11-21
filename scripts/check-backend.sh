#!/bin/bash

# Check Backend Status
# Bu script backend holatini tekshiradi

set -e

echo "=========================================="
echo "Checking Backend Status"
echo "=========================================="
echo ""

cd /var/www/tree-monitor/tree/backend

# 1. Check container status
echo "1. Container Status:"
echo "-------------------"
docker compose -f docker-compose.prod.yml ps backend
echo ""

# 2. Check if backend is responding
echo "2. Backend Health Check:"
echo "-------------------"
echo -n "  localhost:3000/health: "
if curl -s http://127.0.0.1:3000/health > /dev/null; then
    echo "✓ OK"
    curl -s http://127.0.0.1:3000/health | head -1
else
    echo "✗ NOT RESPONDING"
fi
echo ""

# 3. Check login endpoint directly
echo "3. Login Endpoint Test:"
echo "-------------------"
LOGIN_RESPONSE=$(curl -s -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo "✓ Login endpoint working"
else
    echo "✗ Login endpoint failed"
    echo "Response: $LOGIN_RESPONSE"
fi
echo ""

# 4. Check through Nginx
echo "4. Backend Through Nginx:"
echo "-------------------"
PUBLIC_IP=$(curl -s ifconfig.me || echo "64.225.20.211")
echo -n "  http://$PUBLIC_IP/api/v1/auth/login: "
NGINX_RESPONSE=$(curl -s -X POST http://$PUBLIC_IP/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -o /dev/null -w "%{http_code}")

if [ "$NGINX_RESPONSE" = "200" ]; then
    echo "✓ OK (HTTP 200)"
elif [ "$NGINX_RESPONSE" = "502" ]; then
    echo "✗ Bad Gateway (HTTP 502)"
    echo "  This means Nginx can't reach backend"
else
    echo "⚠️  HTTP $NGINX_RESPONSE"
fi
echo ""

# 5. Check backend logs
echo "5. Recent Backend Logs:"
echo "-------------------"
docker compose -f docker-compose.prod.yml logs backend --tail=20 | tail -20
echo ""

# 6. Check port binding
echo "6. Port Binding:"
echo "-------------------"
echo "Port 3000:"
lsof -i :3000 | head -3 || echo "  No process on port 3000"
echo ""

# 7. Check Nginx error logs
echo "7. Nginx Error Logs (502 related):"
echo "-------------------"
tail -20 /var/log/nginx/error.log 2>/dev/null | grep -i "502\|bad gateway\|upstream" || echo "  No recent 502 errors"
echo ""

echo "=========================================="
echo "Check Complete"
echo "=========================================="
echo ""
echo "Quick Fix Commands:"
echo "  1. Restart backend:"
echo "     cd /var/www/tree-monitor/tree/backend"
echo "     docker compose -f docker-compose.prod.yml restart backend"
echo ""
echo "  2. Check backend logs:"
echo "     docker compose -f docker-compose.prod.yml logs backend --tail=50"
echo ""
echo "  3. Test backend directly:"
echo "     curl http://127.0.0.1:3000/health"
echo ""
echo "  4. Check Nginx /api location:"
echo "     grep -A 10 'location /api' /etc/nginx/sites-available/tree-monitor"
echo ""

