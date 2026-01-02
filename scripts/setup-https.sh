#!/bin/bash

# HTTPS Setup Script for Tree Monitor
# Bu script SSL certificate olish va HTTPS sozlash uchun

set -e

DOMAIN="nextree.app"
WWW_DOMAIN="www.nextree.app"

# Email for Let's Encrypt (can be set via environment variable)
EMAIL="${CERTBOT_EMAIL:-admin@nextree.app}"

echo "=========================================="
echo "Setting up HTTPS for $DOMAIN"
echo "=========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (sudo)"
    exit 1
fi

# Update package list
echo "Updating package list..."
apt-get update -qq

# Install Certbot and Nginx plugin
echo "Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
    echo "✓ Certbot installed"
else
    echo "✓ Certbot already installed"
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "Starting Nginx..."
    systemctl start nginx
    systemctl enable nginx
fi

# Ensure port 80 and 443 are open
echo "Checking firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo "✓ Firewall rules updated"
fi

# Test Nginx configuration before getting certificate
echo "Testing Nginx configuration..."
if ! nginx -t; then
    echo "❌ Nginx configuration has errors. Please fix first."
    exit 1
fi

# Reload Nginx to ensure it's running with current config
echo "Reloading Nginx..."
systemctl reload nginx

# Check if certificate already exists
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "⚠️  Certificate already exists for $DOMAIN"
    read -p "Do you want to renew it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Renewing certificate..."
        certbot renew --nginx
        echo "✓ Certificate renewed"
    else
        echo "Skipping certificate generation"
    fi
else
    # Get SSL certificate
    echo "Obtaining SSL certificate for $DOMAIN and $WWW_DOMAIN..."
    echo "⚠️  Make sure DNS is pointing to this server!"
    echo "⚠️  Make sure port 80 is accessible from internet!"
    echo ""
    
    # Run certbot with nginx plugin
    certbot --nginx \
        -d "$DOMAIN" \
        -d "$WWW_DOMAIN" \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        --redirect \
        --expand
    
    if [ $? -eq 0 ]; then
        echo "✓ SSL certificate obtained successfully"
    else
        echo "❌ Failed to obtain SSL certificate"
        echo "Common issues:"
        echo "  1. DNS not pointing to this server"
        echo "  2. Port 80 blocked by firewall"
        echo "  3. Nginx not running"
        exit 1
    fi
fi

# Test certificate renewal
echo "Testing certificate auto-renewal..."
certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo "✓ Auto-renewal test successful"
else
    echo "⚠️  Auto-renewal test failed (may need manual setup)"
fi

# Reload Nginx
echo "Reloading Nginx with SSL configuration..."
systemctl reload nginx

echo ""
echo "=========================================="
echo "HTTPS setup complete!"
echo "=========================================="
echo ""
echo "✅ Your site is now available at:"
echo "   https://$DOMAIN"
echo "   https://$WWW_DOMAIN"
echo ""
echo "✅ HTTP will automatically redirect to HTTPS"
echo ""
echo "📋 Certificate location:"
echo "   /etc/letsencrypt/live/$DOMAIN/"
echo ""
echo "🔄 Auto-renewal:"
echo "   Certbot will automatically renew certificates"
echo "   Check renewal: sudo certbot renew --dry-run"
echo ""
