#!/bin/bash

# Fix IP Address HTTP Access for ESP8266
# Bu script IP manzil uchun HTTP server block qo'shadi (ESP8266 uchun)

set -e

echo "=========================================="
echo "Fixing IP Address HTTP Access"
echo "=========================================="

NGINX_CONFIG="/etc/nginx/sites-available/tree-monitor"

# Backup existing config
if [ -f "$NGINX_CONFIG" ]; then
    cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✓ Backup created"
fi

# Check if IP-based HTTP server block already exists
if grep -q "server_name 64.225.20.211 _" "$NGINX_CONFIG" && grep -q "# ESP8266 IP access" "$NGINX_CONFIG"; then
    echo "✓ IP-based HTTP server block already exists"
else
    echo "Adding IP-based HTTP server block for ESP8266..."
    
    # Create IP-based HTTP server block
    IP_SERVER_BLOCK=$(cat << 'IP_BLOCK'
# ESP8266 IP access - HTTP only (no redirect to HTTPS)
# ESP8266 devices cannot use HTTPS or domain names
server {
    listen 80;
    listen [::]:80;
    server_name 64.225.20.211 _;

    # Increase body size for file uploads
    client_max_body_size 10M;

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    # Next.js static files and assets (must come before /)
    location /_next/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
    
    # Next.js webpack HMR (if needed)
    location /_next/webpack-hmr {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Frontend (Next.js) - must be last location block
    location / {
        # CRITICAL: Use trailing slash in proxy_pass to preserve path
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Allow redirects from Next.js
        proxy_redirect http://127.0.0.1:3001/ /;
        proxy_redirect http://localhost:3001/ /;
        proxy_redirect http://$host:3001/ /;
        
        # Next.js specific settings
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Important for Next.js routing
        proxy_set_header Accept-Encoding "";
        proxy_buffering off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Handle Next.js properly
        proxy_intercept_errors off;
        
        # Retry on connection errors
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
        proxy_next_upstream_tries 2;
    }
}

IP_BLOCK
)

    # Check if config file exists
    if [ ! -f "$NGINX_CONFIG" ]; then
        echo "❌ Nginx config file not found: $NGINX_CONFIG"
        exit 1
    fi

    # Check if IP block already exists (but without comment)
    if grep -q "server_name 64.225.20.211 _" "$NGINX_CONFIG"; then
        echo "⚠️  IP server block exists but may need update"
        # Remove old IP block if it exists
        sed -i '/# ESP8266 IP access/,/^}$/d' "$NGINX_CONFIG" 2>/dev/null || true
    fi

    # Prepend IP block to config (before domain HTTP redirect)
    echo "$IP_SERVER_BLOCK" | cat - "$NGINX_CONFIG" > /tmp/nginx_merged.conf
    mv /tmp/nginx_merged.conf "$NGINX_CONFIG"
    
    echo "✓ IP-based HTTP server block added"
fi

# Ensure domain HTTP server only redirects domains (not IP)
echo "Updating domain HTTP server to only redirect domains..."
sed -i 's/server_name nextree.app www.nextree.app 64.225.20.211 _;/server_name nextree.app www.nextree.app;/g' "$NGINX_CONFIG" || true

# Test Nginx configuration
echo "Testing Nginx configuration..."
if nginx -t; then
    echo "✓ Nginx configuration is valid"
    
    # Reload Nginx
    echo "Reloading Nginx..."
    systemctl reload nginx
    echo "✓ Nginx reloaded successfully"
    
    echo ""
    echo "=========================================="
    echo "IP HTTP access fixed!"
    echo "=========================================="
    echo ""
    echo "✅ Test endpoints:"
    echo "   HTTP (IP): http://64.225.20.211"
    echo "   API (IP):  http://64.225.20.211/api/v1/stats"
    echo "   Health:    http://64.225.20.211/health"
    echo ""
    echo "✅ Domain endpoints (HTTPS):"
    echo "   HTTPS:     https://nextree.app"
    echo "   HTTPS:     https://www.nextree.app"
    echo ""
    echo "✅ HTTP domains redirect to HTTPS"
    echo "✅ IP address serves HTTP (for ESP8266)"
    echo ""
else
    echo "❌ Nginx configuration has errors!"
    echo "Restoring backup..."
    if ls "${NGINX_CONFIG}.backup."* 1> /dev/null 2>&1; then
        mv "${NGINX_CONFIG}.backup."* "$NGINX_CONFIG" 2>/dev/null || true
    fi
    exit 1
fi
