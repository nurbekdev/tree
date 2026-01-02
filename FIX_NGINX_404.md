# Nginx 404 Not Found Fix

## ⚠️ Muammo

`http://64.225.20.211/` ga murojaat qilganda 404 Not Found xatolik:
```
404 Not Found
nginx/1.26.0 (Ubuntu)
```

## 🔧 Tezkor Yechim

Server'da quyidagi command'larni bajaring:

```bash
# 1. Nginx config yangilash
cd /var/www/tree-monitor/tree
bash scripts/fix-nginx.sh

# Yoki force fix
bash scripts/force-fix-nginx.sh
```

## 🔍 Muammo Sabablari

1. **Default Nginx site** - Default site hali ham enabled bo'lishi mumkin
2. **Server block yo'q** - IP manzil uchun server block yo'q
3. **Site enabled emas** - tree-monitor site enabled emas

## ✅ To'liq Tuzatish

### 1. Nginx Config Tekshirish

```bash
# Nginx config faylini ko'rish
sudo cat /etc/nginx/sites-available/tree-monitor

# Enabled sites
ls -la /etc/nginx/sites-enabled/
```

### 2. Default Site O'chirish

```bash
# Default site o'chirish
sudo rm -f /etc/nginx/sites-enabled/default

# Yoki
sudo unlink /etc/nginx/sites-enabled/default
```

### 3. Tree-Monitor Site Enable Qilish

```bash
# Site enable qilish
sudo ln -sf /etc/nginx/sites-available/tree-monitor /etc/nginx/sites-enabled/tree-monitor

# Tekshirish
ls -la /etc/nginx/sites-enabled/tree-monitor
```

### 4. Nginx Test va Reload

```bash
# Config test
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Yoki restart
sudo systemctl restart nginx
```

### 5. Container Status

```bash
# Container'lar ishlayotganini tekshiring
cd /var/www/tree-monitor/tree/backend
docker compose -f docker-compose.prod.yml ps

# Agar ishlamayotgan bo'lsa:
docker compose -f docker-compose.prod.yml up -d
```

## 🚨 Agar Hali Ham 404 Bo'lsa

### 1. Nginx Config To'liq Yangilash

```bash
cd /var/www/tree-monitor/tree
bash scripts/force-fix-nginx.sh
```

### 2. Nginx Logs Tekshirish

```bash
# Error log
sudo tail -f /var/log/nginx/error.log

# Access log
sudo tail -f /var/log/nginx/access.log
```

### 3. Container Logs

```bash
# Frontend logs
docker compose -f docker-compose.prod.yml logs frontend --tail=50

# Backend logs
docker compose -f docker-compose.prod.yml logs backend --tail=50
```

## ✅ Tekshirish

```bash
# IP manzil orqali test
curl -I http://64.225.20.211/

# Kutilgan natija:
# HTTP/1.1 307 Temporary Redirect
# Location: /login

# API test
curl http://64.225.20.211/api/v1/stats

# Health check
curl http://64.225.20.211/health
```

## 📝 Eslatmalar

1. **Default site** - O'chirilishi kerak
2. **Server block** - IP manzil qo'shilishi kerak
3. **Site enabled** - Symlink yaratilishi kerak
4. **Container'lar** - Ishga tushirilishi kerak
