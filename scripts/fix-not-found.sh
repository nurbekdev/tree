#!/bin/bash

# Fix "Not Found" Error Script
# Bu script "Not Found" muammosini hal qiladi

set -e

echo "=========================================="
echo "Fixing 'Not Found' Error"
echo "=========================================="
echo ""

# 1. Check current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "Project directory: $PROJECT_DIR"
echo ""

# 2. Ensure Nginx site is enabled
echo "1. Ensuring Nginx site is enabled..."
if [ ! -L /etc/nginx/sites-enabled/tree-monitor ]; then
    echo "  Enabling Nginx site..."
    ln -sf /etc/nginx/sites-available/tree-monitor /etc/nginx/sites-enabled/tree-monitor
    echo "  ✓ Site enabled"
else
    echo "  ✓ Site already enabled"
fi

# Disable default site
if [ -L /etc/nginx/sites-enabled/default ]; then
    echo "  Disabling default site..."
    rm -f /etc/nginx/sites-enabled/default
    echo "  ✓ Default site disabled"
fi
echo ""

# 3. Fix Nginx configuration
echo "2. Updating Nginx configuration..."
if [ -f "$SCRIPT_DIR/fix-nginx.sh" ]; then
    chmod +x "$SCRIPT_DIR/fix-nginx.sh"
    "$SCRIPT_DIR/fix-nginx.sh"
else
    echo "  ⚠️  fix-nginx.sh not found"
fi
echo ""

# 4. Check and restart containers
echo "3. Checking containers..."
cd backend

# Check if containers are running
if ! docker compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "  Starting containers..."
    docker compose -f docker-compose.prod.yml up -d
    echo "  Waiting for containers to start..."
    sleep 15
else
    echo "  ✓ Containers are running"
    echo "  Restarting containers to ensure fresh state..."
    docker compose -f docker-compose.prod.yml restart
    sleep 10
fi
echo ""

# 5. Test services
echo "4. Testing services..."
echo -n "  Backend (localhost:3000): "
if curl -s http://127.0.0.1:3000/health > /dev/null; then
    echo "✓ OK"
else
    echo "✗ FAILED"
    echo "  Backend logs:"
    docker compose -f docker-compose.prod.yml logs backend --tail=20
fi

echo -n "  Frontend (localhost:3001): "
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001 || echo "000")
if [ "$FRONTEND_RESPONSE" = "200" ] || [ "$FRONTEND_RESPONSE" = "404" ]; then
    echo "✓ Responding (HTTP $FRONTEND_RESPONSE)"
else
    echo "✗ NOT RESPONDING (HTTP $FRONTEND_RESPONSE)"
    echo "  Frontend logs:"
    docker compose -f docker-compose.prod.yml logs frontend --tail=30
fi
echo ""

# 6. Check Nginx
echo "5. Checking Nginx..."
if systemctl is-active --quiet nginx; then
    echo "  ✓ Nginx is running"
    echo "  Reloading Nginx..."
    systemctl reload nginx
    echo "  ✓ Nginx reloaded"
else
    echo "  ✗ Nginx is not running"
    echo "  Starting Nginx..."
    systemctl start nginx
fi
echo ""

# 7. Final test
echo "6. Final external test..."
PUBLIC_IP=$(curl -s ifconfig.me || echo "64.225.20.211")
echo "  Testing http://$PUBLIC_IP/"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$PUBLIC_IP/ || echo "000")
echo "  HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✓ SUCCESS! Site is accessible"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "  ⚠️  Still getting 404 - This might be a Next.js routing issue"
    echo ""
    echo "  Try accessing specific routes:"
    echo "    - http://$PUBLIC_IP/login"
    echo "    - http://$PUBLIC_IP/dashboard"
    echo "    - http://$PUBLIC_IP/admin"
    echo ""
    echo "  If those work, the root route (/) might need to redirect"
else
    echo "  ✗ FAILED - HTTP $HTTP_CODE"
    echo ""
    echo "  Check Nginx error logs:"
    echo "    tail -50 /var/log/nginx/error.log"
fi
echo ""

# 8. Show diagnostic info
echo "7. Diagnostic Information:"
echo "-------------------"
echo "Container status:"
docker compose -f docker-compose.prod.yml ps
echo ""
echo "Recent Nginx errors:"
tail -10 /var/log/nginx/error.log 2>/dev/null | grep -i error || echo "  No recent errors"
echo ""

echo "=========================================="
echo "Fix Complete"
echo "=========================================="
echo ""
echo "If still having issues, run:"
echo "  ./scripts/check-server.sh"
echo ""

