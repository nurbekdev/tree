#!/bin/bash

# Server Status Check Script
# Bu script server holatini tekshiradi va muammolarni aniqlaydi

set -e

echo "=========================================="
echo "Server Status Check"
echo "=========================================="
echo ""

# 1. Check Docker containers
echo "1. Docker Containers:"
echo "-------------------"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep tree-monitor || echo "No tree-monitor containers found"
echo ""

# 2. Check if services are responding
echo "2. Service Health Checks:"
echo "-------------------"
echo -n "Backend (localhost:3000): "
if curl -s http://127.0.0.1:3000/health > /dev/null; then
    echo "✓ OK"
    curl -s http://127.0.0.1:3000/health | head -1
else
    echo "✗ NOT RESPONDING"
fi

echo -n "Frontend (localhost:3001): "
if curl -s http://127.0.0.1:3001 > /dev/null; then
    echo "✓ OK"
    curl -s -I http://127.0.0.1:3001 | head -1
else
    echo "✗ NOT RESPONDING"
fi
echo ""

# 3. Check Nginx status
echo "3. Nginx Status:"
echo "-------------------"
systemctl status nginx --no-pager -l | head -5
echo ""

# 4. Check Nginx configuration
echo "4. Nginx Configuration:"
echo "-------------------"
if [ -f /etc/nginx/sites-available/tree-monitor ]; then
    echo "✓ Config file exists: /etc/nginx/sites-available/tree-monitor"
else
    echo "✗ Config file NOT FOUND"
fi

if [ -L /etc/nginx/sites-enabled/tree-monitor ]; then
    echo "✓ Site is enabled: /etc/nginx/sites-enabled/tree-monitor"
else
    echo "✗ Site is NOT ENABLED"
    echo "  Run: ln -s /etc/nginx/sites-available/tree-monitor /etc/nginx/sites-enabled/"
fi

# Check if default site is still enabled
if [ -L /etc/nginx/sites-enabled/default ]; then
    echo "⚠️  WARNING: Default site is still enabled (should be disabled)"
fi
echo ""

# 5. Test Nginx config
echo "5. Nginx Configuration Test:"
echo "-------------------"
nginx -t 2>&1
echo ""

# 6. Check Nginx error logs
echo "6. Recent Nginx Error Logs:"
echo "-------------------"
tail -20 /var/log/nginx/error.log 2>/dev/null || echo "No error logs found"
echo ""

# 7. Check Nginx access logs
echo "7. Recent Nginx Access Logs:"
echo "-------------------"
tail -10 /var/log/nginx/access.log 2>/dev/null || echo "No access logs found"
echo ""

# 8. Check port bindings
echo "8. Port Bindings:"
echo "-------------------"
echo "Port 80 (HTTP):"
lsof -i :80 | head -3 || echo "  No process on port 80"
echo ""
echo "Port 3000 (Backend):"
lsof -i :3000 | head -3 || echo "  No process on port 3000"
echo ""
echo "Port 3001 (Frontend):"
lsof -i :3001 | head -3 || echo "  No process on port 3001"
echo ""

# 9. Test external access
echo "9. External Access Test:"
echo "-------------------"
PUBLIC_IP=$(curl -s ifconfig.me || echo "unknown")
echo "Public IP: $PUBLIC_IP"
echo -n "Health endpoint: "
curl -s -o /dev/null -w "%{http_code}" http://$PUBLIC_IP/health || echo "FAILED"
echo ""
echo -n "Root endpoint: "
curl -s -o /dev/null -w "%{http_code}" http://$PUBLIC_IP/ || echo "FAILED"
echo ""

echo "=========================================="
echo "Check Complete"
echo "=========================================="

