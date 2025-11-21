#!/bin/bash

# Check Nginx Configuration
# Bu script Nginx konfiguratsiyasini to'liq tekshiradi

set -e

echo "=========================================="
echo "Checking Nginx Configuration"
echo "=========================================="
echo ""

# 1. Check all location blocks
echo "1. All Location Blocks (in order):"
echo "-------------------"
grep -n "location" /etc/nginx/sites-available/tree-monitor
echo ""

# 2. Check root location block specifically
echo "2. Root Location Block (/):"
echo "-------------------"
sed -n '/location \/ {/,/^    }/p' /etc/nginx/sites-available/tree-monitor
echo ""

# 3. Check if there are multiple server blocks
echo "3. Server Blocks:"
echo "-------------------"
grep -n "server {" /etc/nginx/sites-available/tree-monitor
echo ""

# 4. Check enabled sites
echo "4. Enabled Sites:"
echo "-------------------"
ls -la /etc/nginx/sites-enabled/
echo ""

# 5. Check default site
echo "5. Default Site Status:"
echo "-------------------"
if [ -L /etc/nginx/sites-enabled/default ]; then
    echo "⚠️  WARNING: Default site is still enabled!"
    echo "Content:"
    head -20 /etc/nginx/sites-enabled/default
else
    echo "✓ Default site is disabled"
fi
echo ""

# 6. Test Nginx configuration
echo "6. Nginx Configuration Test:"
echo "-------------------"
nginx -T 2>&1 | grep -A 50 "server_name _" | head -60
echo ""

# 7. Check active configuration
echo "7. Active Configuration (location /):"
echo "-------------------"
nginx -T 2>&1 | grep -A 20 "location / {" | head -25
echo ""

echo "=========================================="
echo "Check Complete"
echo "=========================================="

