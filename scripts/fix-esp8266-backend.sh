#!/bin/bash

# Fix ESP8266 Backend Connection
# This script fixes backend port 3000 and Nginx configuration for ESP8266 devices

set -e

echo "=========================================="
echo "ESP8266 Backend Connection Fix"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

APP_DIR="/var/www/tree-monitor"
NGINX_CONFIG="/etc/nginx/sites-available/tree-monitor"

echo "1. Checking backend container status..."
cd "$APP_DIR/backend" || exit 1

if ! docker ps | grep -q "tree-monitor-api-prod"; then
    echo -e "${YELLOW}Backend container is not running. Starting...${NC}"
    docker compose -f docker-compose.prod.yml up -d backend
    sleep 5
else
    echo -e "${GREEN}Backend container is running${NC}"
fi

echo ""
echo "2. Checking port 3000..."
if netstat -tuln | grep -q ":3000 "; then
    echo -e "${GREEN}Port 3000 is open${NC}"
else
    echo -e "${RED}Port 3000 is not open!${NC}"
    echo "Checking docker-compose.prod.yml..."
    
    # Check if port mapping is correct
    if grep -q '"0.0.0.0:3000:3000"' "$APP_DIR/backend/docker-compose.prod.yml"; then
        echo -e "${GREEN}Port mapping is correct in docker-compose.prod.yml${NC}"
        echo "Restarting backend container..."
        docker compose -f docker-compose.prod.yml restart backend
        sleep 5
    else
        echo -e "${RED}Port mapping is incorrect!${NC}"
        echo "Please update docker-compose.prod.yml to use: 0.0.0.0:3000:3000"
        exit 1
    fi
fi

echo ""
echo "3. Testing backend health endpoint..."
if curl -s -f http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}Backend is responding on localhost:3000${NC}"
else
    echo -e "${RED}Backend is not responding on localhost:3000${NC}"
    echo "Checking backend logs..."
    docker logs --tail 50 tree-monitor-api-prod
    exit 1
fi

echo ""
echo "4. Testing backend from external IP..."
PUBLIC_IP=$(curl -s ifconfig.me || echo "64.225.20.211")
if curl -s -f --max-time 5 "http://${PUBLIC_IP}:3000/health" > /dev/null; then
    echo -e "${GREEN}Backend is accessible from external IP: ${PUBLIC_IP}:3000${NC}"
else
    echo -e "${YELLOW}Backend is not accessible from external IP (this might be firewall)${NC}"
    echo "Checking firewall..."
    if command -v ufw > /dev/null; then
        echo "UFW status:"
        ufw status | grep 3000 || echo "Port 3000 not in UFW rules"
    fi
fi

echo ""
echo "5. Updating Nginx configuration for IP access..."
if [ ! -f "$NGINX_CONFIG" ]; then
    echo -e "${RED}Nginx config not found: $NGINX_CONFIG${NC}"
    exit 1
fi

# Backup current config
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

# Check if IP-based server block exists
if grep -q "server_name 64.225.20.211\|server_name _" "$NGINX_CONFIG"; then
    echo -e "${GREEN}IP-based server block already exists${NC}"
else
    echo -e "${YELLOW}Adding IP-based server block...${NC}"
    
    # Add IP-based server block at the beginning
    cat > /tmp/nginx_ip_block.conf << 'NGINX_IP_BLOCK'
# ESP8266 devices access via IP address
server {
    listen 80;
    server_name 64.225.20.211 _;

    # Backend API - direct access for ESP8266
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
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_IP_BLOCK

    # Prepend IP block to config
    cat /tmp/nginx_ip_block.conf "$NGINX_CONFIG" > /tmp/nginx_merged.conf
    mv /tmp/nginx_merged.conf "$NGINX_CONFIG"
    rm /tmp/nginx_ip_block.conf
fi

echo ""
echo "6. Testing Nginx configuration..."
if nginx -t; then
    echo -e "${GREEN}Nginx configuration is valid${NC}"
    echo "Reloading Nginx..."
    systemctl reload nginx
else
    echo -e "${RED}Nginx configuration has errors!${NC}"
    echo "Restoring backup..."
    mv "${NGINX_CONFIG}.backup."* "$NGINX_CONFIG" 2>/dev/null || true
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Fix Complete!${NC}"
echo "=========================================="
echo ""
echo "Test endpoints:"
echo "  Backend (localhost): curl http://localhost:3000/health"
echo "  Backend (external):  curl http://${PUBLIC_IP}:3000/health"
echo "  Frontend (IP):       curl http://${PUBLIC_IP}/"
echo "  API (IP):            curl http://${PUBLIC_IP}/api/v1/health"
echo ""
echo "ESP8266 Configuration:"
echo "  BACKEND_URL: http://${PUBLIC_IP}:3000"
echo ""
