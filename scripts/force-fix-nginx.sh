#!/bin/bash

# Force Fix Nginx Configuration
# Bu script Nginx konfiguratsiyasini to'g'ridan-to'g'ri yangilaydi

set -e

echo "=========================================="
echo "Force Fixing Nginx Configuration"
echo "=========================================="
echo ""

# Backup existing config
if [ -f /etc/nginx/sites-available/tree-monitor ]; then
    cp /etc/nginx/sites-available/tree-monitor /etc/nginx/sites-available/tree-monitor.backup.$(date +%Y%m%d_%H%M%S)
    echo "✓ Backup created"
fi

# Create new Nginx config with CORRECT proxy_pass
cat > /etc/nginx/sites-available/tree-monitor << 'NGINX_EOF'
server {
    listen 80;
    server_name _;

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

    # Frontend (Next.js) - MUST BE LAST and MUST HAVE TRAILING SLASH
    location / {
        # CRITICAL: Trailing slash is required for Next.js routing!
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
NGINX_EOF

# Enable site if not already enabled
if [ ! -L /etc/nginx/sites-enabled/tree-monitor ]; then
    echo "Enabling Nginx site..."
    ln -sf /etc/nginx/sites-available/tree-monitor /etc/nginx/sites-enabled/tree-monitor
    echo "✓ Site enabled"
fi

# Disable default site
if [ -L /etc/nginx/sites-enabled/default ]; then
    echo "Disabling default site..."
    rm -f /etc/nginx/sites-enabled/default
    echo "✓ Default site disabled"
fi

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
    echo "Nginx configuration updated!"
    echo "=========================================="
    echo ""
    echo "CRITICAL: proxy_pass now has trailing slash: http://127.0.0.1:3001/"
    echo ""
    echo "Test your application:"
    echo "  curl -I http://64.225.20.211/"
    echo "  Expected: HTTP/1.1 307 Temporary Redirect → /login"
    echo ""
else
    echo "❌ Nginx configuration has errors!"
    echo "Please check the configuration manually"
    exit 1
fi

