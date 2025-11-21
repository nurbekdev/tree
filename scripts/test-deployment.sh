#!/bin/bash

# Deployment Test Script
# Bu script deployment'ni to'liq tekshiradi

echo "=========================================="
echo "Deployment Test"
echo "=========================================="

echo ""
echo "1. Docker Containers:"
echo "----------------------------------------"
docker ps | grep tree-monitor || echo "No containers found"

echo ""
echo "2. Frontend Container:"
echo "----------------------------------------"
if docker ps | grep -q tree-monitor-frontend-prod; then
    echo "✓ Frontend container is running"
    echo "Frontend logs (last 10 lines):"
    docker logs tree-monitor-frontend-prod --tail=10
else
    echo "✗ Frontend container is NOT running"
fi

echo ""
echo "3. Backend Container:"
echo "----------------------------------------"
if docker ps | grep -q tree-monitor-api-prod; then
    echo "✓ Backend container is running"
    echo "Backend logs (last 10 lines):"
    docker logs tree-monitor-api-prod --tail=10
else
    echo "✗ Backend container is NOT running"
fi

echo ""
echo "4. Database Container:"
echo "----------------------------------------"
if docker ps | grep -q tree-monitor-db-prod; then
    echo "✓ Database container is running"
else
    echo "✗ Database container is NOT running"
fi

echo ""
echo "5. Port Check:"
echo "----------------------------------------"
echo "Port 3000 (backend):"
lsof -i:3000 || echo "Port 3000 is free"
echo ""
echo "Port 3001 (frontend):"
lsof -i:3001 || echo "Port 3001 is free"

echo ""
echo "6. Local Connection Test:"
echo "----------------------------------------"
echo "Testing frontend (127.0.0.1:3001):"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://127.0.0.1:3001 || echo "✗ Frontend not accessible"
echo ""
echo "Testing backend (127.0.0.1:3000):"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://127.0.0.1:3000/health || echo "✗ Backend not accessible"

echo ""
echo "7. Nginx Status:"
echo "----------------------------------------"
systemctl status nginx --no-pager -l | head -10

echo ""
echo "8. Nginx Configuration Test:"
echo "----------------------------------------"
if nginx -t 2>&1; then
    echo "✓ Nginx configuration is valid"
else
    echo "✗ Nginx configuration has errors"
fi

echo ""
echo "9. Nginx Access Logs (last 5 lines):"
echo "----------------------------------------"
tail -5 /var/log/nginx/access.log 2>/dev/null || echo "No access logs"

echo ""
echo "10. Nginx Error Logs (last 5 lines):"
echo "----------------------------------------"
tail -5 /var/log/nginx/error.log 2>/dev/null || echo "No error logs"

echo ""
echo "=========================================="
echo "Test Complete"
echo "=========================================="
echo ""
echo "External URLs:"
echo "  Frontend: http://64.225.20.211"
echo "  API: http://64.225.20.211/api"
echo "  Health: http://64.225.20.211/health"
echo ""

