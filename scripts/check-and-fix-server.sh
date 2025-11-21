#!/bin/bash

# Server Status Check va Fix Script
# Bu script server holatini tekshiradi va muammolarni tuzatadi

set -e

echo "=========================================="
echo "Server Status Check va Fix"
echo "=========================================="
echo ""

# 1. Docker container'larni tekshirish
echo "1. Docker container'larni tekshirish..."
cd /var/www/tree-monitor/backend

echo "Container status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "Ishlayotgan container'lar:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep tree-monitor || echo "Hech qanday tree-monitor container topilmadi!"

echo ""

# 2. Port'larni tekshirish
echo "2. Port'larni tekshirish..."
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "✓ Port 3000 (backend) ishlayapti"
    lsof -ti:3000 | xargs ps -p
else
    echo "❌ Port 3000 (backend) ishlamayapti!"
fi

if lsof -ti:3001 > /dev/null 2>&1; then
    echo "✓ Port 3001 (frontend) ishlayapti"
    lsof -ti:3001 | xargs ps -p
else
    echo "❌ Port 3001 (frontend) ishlamayapti!"
fi

echo ""

# 3. Container loglarini ko'rish
echo "3. Container loglarini ko'rish (oxirgi 10 qator)..."
echo ""
echo "--- Backend logs ---"
docker compose -f docker-compose.prod.yml logs --tail=10 backend 2>/dev/null || echo "Backend loglar topilmadi"
echo ""
echo "--- Frontend logs ---"
docker compose -f docker-compose.prod.yml logs --tail=10 frontend 2>/dev/null || echo "Frontend loglar topilmadi"
echo ""

# 4. Localhost'da servislarni test qilish
echo "4. Localhost'da servislarni test qilish..."
if curl -s http://127.0.0.1:3000/health > /dev/null 2>&1; then
    echo "✓ Backend (port 3000) javob beradi"
    curl -s http://127.0.0.1:3000/health | head -1
else
    echo "❌ Backend (port 3000) javob bermayapti!"
fi

if curl -s http://127.0.0.1:3001 > /dev/null 2>&1; then
    echo "✓ Frontend (port 3001) javob beradi"
else
    echo "❌ Frontend (port 3001) javob bermayapti!"
fi

echo ""

# 5. Nginx holatini tekshirish
echo "5. Nginx holatini tekshirish..."
if systemctl is-active --quiet nginx; then
    echo "✓ Nginx ishlayapti"
else
    echo "❌ Nginx ishlamayapti!"
    echo "Nginx'ni ishga tushirish..."
    systemctl start nginx
fi

echo ""

# 6. Nginx konfiguratsiyasini tekshirish
echo "6. Nginx konfiguratsiyasini tekshirish..."
if [ -f /etc/nginx/sites-available/tree-monitor ]; then
    echo "✓ Nginx config fayli mavjud: /etc/nginx/sites-available/tree-monitor"
    
    # Symlink tekshirish
    if [ -L /etc/nginx/sites-enabled/tree-monitor ]; then
        echo "✓ Nginx config symlink mavjud"
    else
        echo "❌ Nginx config symlink yo'q! Yaratilmoqda..."
        ln -sf /etc/nginx/sites-available/tree-monitor /etc/nginx/sites-enabled/tree-monitor
        echo "✓ Symlink yaratildi"
    fi
    
    # Default config'ni o'chirish (agar mavjud bo'lsa)
    if [ -L /etc/nginx/sites-enabled/default ]; then
        echo "⚠️  Default nginx config mavjud, o'chirilmoqda..."
        rm /etc/nginx/sites-enabled/default
    fi
else
    echo "❌ Nginx config fayli topilmadi! Yaratilmoqda..."
    /var/www/tree-monitor/scripts/fix-nginx.sh
fi

echo ""

# 7. Nginx konfiguratsiyasini test qilish
echo "7. Nginx konfiguratsiyasini test qilish..."
if nginx -t 2>&1; then
    echo "✓ Nginx konfiguratsiyasi to'g'ri"
    echo "Nginx'ni reload qilish..."
    systemctl reload nginx
    echo "✓ Nginx reload qilindi"
else
    echo "❌ Nginx konfiguratsiyasida xatolar bor!"
    echo "Fix script'ni ishga tushirish..."
    /var/www/tree-monitor/scripts/fix-nginx.sh
fi

echo ""

# 8. Container'larni qayta ishga tushirish (agar kerak bo'lsa)
echo "8. Container'larni tekshirish va qayta ishga tushirish..."
cd /var/www/tree-monitor/backend

# Backend tekshirish
if ! docker ps | grep -q tree-monitor-api-prod; then
    echo "⚠️  Backend container ishlamayapti, qayta ishga tushirilmoqda..."
    docker compose -f docker-compose.prod.yml up -d backend
    sleep 5
fi

# Frontend tekshirish
if ! docker ps | grep -q tree-monitor-frontend-prod; then
    echo "⚠️  Frontend container ishlamayapti, qayta ishga tushirilmoqda..."
    docker compose -f docker-compose.prod.yml up -d frontend
    sleep 5
fi

echo ""

# 9. Yakuniy tekshirish
echo "9. Yakuniy tekshirish..."
echo ""
echo "Container status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "Port holati:"
netstat -tlnp 2>/dev/null | grep -E ':(3000|3001|80)' || ss -tlnp | grep -E ':(3000|3001|80)'

echo ""
echo "Nginx status:"
systemctl status nginx --no-pager -l | head -5

echo ""
echo "=========================================="
echo "Tekshirish yakunlandi!"
echo "=========================================="
echo ""
echo "Test qilish:"
echo "  curl http://127.0.0.1:3000/health  # Backend"
echo "  curl http://127.0.0.1:3001         # Frontend"
echo "  curl http://localhost/             # Nginx orqali"
echo ""
echo "Agar hali ham muammo bo'lsa, loglarni ko'ring:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
echo "  tail -f /var/log/nginx/error.log"
echo ""

