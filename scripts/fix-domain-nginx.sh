#!/bin/bash

# Domain Nginx Fix Script with HTTPS Support
# Bu script domen uchun Nginx config'ni to'liq tuzatadi (HTTP va HTTPS)

set -e

echo "=========================================="
echo "Fixing Domain Nginx Configuration"
echo "=========================================="

# Backup existing config
if [ -f /etc/nginx/sites-available/tree-monitor ]; then
    cp /etc/nginx/sites-available/tree-monitor /etc/nginx/sites-available/tree-monitor.backup.$(date +%Y%m%d_%H%M%S)
    echo "✓ Backup created"
fi

# Remove all other Nginx configs that might interfere
echo "Checking for conflicting Nginx configs..."
if [ -f /etc/nginx/sites-available/default ]; then
    echo "Disabling default site..."
    rm -f /etc/nginx/sites-enabled/default
    echo "✓ Default site disabled"
fi

# Remove any other configs
for config in /etc/nginx/sites-enabled/*; do
    if [ -L "$config" ] && [ "$(readlink "$config")" != "/etc/nginx/sites-available/tree-monitor" ]; then
        echo "Removing conflicting config: $config"
        rm -f "$config"
    fi
done

# Check if SSL certificate exists
SSL_CERT_EXISTS=false
if [ -f "/etc/letsencrypt/live/nextree.app/fullchain.pem" ]; then
    SSL_CERT_EXISTS=true
    echo "✓ SSL certificate found, configuring HTTPS..."
else
    echo "⚠️  SSL certificate not found, HTTP only configuration..."
    echo "   Run 'bash scripts/setup-https.sh' to enable HTTPS"
fi

# Create HTTP server block
HTTP_BLOCK=$(cat << 'HTTP_EOF'
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
HTTP_EOF
)

# Create HTTPS server block
HTTPS_BLOCK=$(cat << 'HTTPS_EOF'
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/nextree.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nextree.app/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

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
        proxy_set_header X-Forwarded-Proto https;
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
        proxy_set_header X-Forwarded-Proto https;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
    }

    # Next.js static files and assets (must come before /)
    location /_next/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
    
    # Next.js webpack HMR (if needed)
    location /_next/webpack-hmr {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Forwarded-Proto https;
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
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass $http_upgrade;
        
        # Allow redirects from Next.js
        proxy_redirect http://127.0.0.1:3001/ /;
        proxy_redirect http://localhost:3001/ /;
        proxy_redirect http://$host:3001/ /;
        proxy_redirect https://$host:3001/ /;
        
        # Next.js specific settings
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port 443;
        
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
HTTPS_EOF
)

# Create Nginx config file
cat > /etc/nginx/sites-available/tree-monitor << NGINX_CONFIG_EOF
# ESP8266 IP access - HTTP only (no redirect to HTTPS)
# ESP8266 devices cannot use HTTPS or domain names
server {
    listen 80;
    listen [::]:80;
    server_name 64.225.20.211 _;

$HTTP_BLOCK
}

# Domain HTTP server - redirects to HTTPS if SSL exists
server {
    listen 80;
    listen [::]:80;
    server_name nextree.app www.nextree.app;

$(if [ "$SSL_CERT_EXISTS" = true ]; then
    echo "    # Redirect to HTTPS"
    echo "    return 301 https://\$host\$request_uri;"
else
    echo "$HTTP_BLOCK"
fi)
}

$(if [ "$SSL_CERT_EXISTS" = true ]; then
cat << HTTPS_SERVER_EOF
# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name nextree.app www.nextree.app;

$HTTPS_BLOCK
}
HTTPS_SERVER_EOF
fi)
NGINX_CONFIG_EOF

# Enable site
if [ ! -L /etc/nginx/sites-enabled/tree-monitor ]; then
    echo "Enabling Nginx site..."
    ln -sf /etc/nginx/sites-available/tree-monitor /etc/nginx/sites-enabled/tree-monitor
    echo "✓ Site enabled"
fi

# Ensure only tree-monitor is enabled
echo "Checking enabled sites..."
ls -la /etc/nginx/sites-enabled/

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
    if [ "$SSL_CERT_EXISTS" = true ]; then
        echo "✅ HTTPS is enabled!"
        echo ""
        echo "Test your application:"
        echo "  HTTPS (Domain): https://nextree.app"
        echo "  HTTPS (WWW): https://www.nextree.app"
        echo "  HTTP (IP): http://64.225.20.211 (for ESP8266)"
        echo "  API: https://nextree.app/api/v1/stats"
        echo "  Health: https://nextree.app/health"
        echo ""
        echo "⚠️  HTTP requests will redirect to HTTPS"
        echo "   ESP8266 uchun IP manzil ishlatiladi: http://64.225.20.211"
    else
        echo "Test your application:"
        echo "  HTTP (IP): http://64.225.20.211"
        echo "  HTTP (Domain): http://nextree.app"
        echo "  HTTP (WWW): http://www.nextree.app"
        echo "  API: http://nextree.app/api/v1/stats"
        echo "  Health: http://nextree.app/health"
        echo ""
        echo "⚠️  HTTPS hozircha ishlamaydi."
        echo "   HTTPS uchun SSL certificate olish:"
        echo "   cd /var/www/tree-monitor/tree"
        echo "   sudo bash scripts/setup-https.sh"
        echo ""
    fi
    echo "DNS tekshirish:"
    echo "  nslookup nextree.app"
    echo "  nslookup www.nextree.app"
    echo "  Kutilgan: 64.225.20.211"
    echo ""
else
    echo "❌ Nginx configuration has errors!"
    echo "Please check the configuration manually"
    exit 1
fi
