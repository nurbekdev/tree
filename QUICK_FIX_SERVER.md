# 🔧 Tezkor Tuzatish - Server "Not Found" Muammosi

## Muammo
GitHub Actions muvaffaqiyatli ishladi (yashil galochka), lekin serverda IP ga kirganda "Not Found" xatosi chiqyapti.

## Sabab
Loyiha `/var/www/tree-monitor/tree/` da, lekin deployment scriptlar eski path'ni ishlatgan.

## Tezkor Yechim

### 1. Server'ga ulanish
```bash
ssh root@209.38.61.156
```

### 2. To'g'ri directory'ga o'tish va deploy qilish
```bash
cd /var/www/tree-monitor/tree

# Git'dan yangi o'zgarishlarni olish
git pull origin main

# Deploy script'ni ishga tushirish
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 3. Agar deploy script ishlamasa, qo'lda:

```bash
cd /var/www/tree-monitor/tree/backend

# Container'larni to'xtatish
docker compose -f docker-compose.prod.yml down

# Port'larni tozalash
lsof -ti:3000 | xargs -r kill -9 2>/dev/null || true
lsof -ti:3001 | xargs -r kill -9 2>/dev/null || true
sleep 3

# Container'larni qayta build qilish va ishga tushirish
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# Nginx'ni tuzatish
cd ..
chmod +x scripts/fix-nginx.sh
./scripts/fix-nginx.sh
```

### 4. Tekshirish

```bash
# Container'lar ishlayaptimi?
docker ps | grep tree-monitor

# Backend javob beryaptimi?
curl http://127.0.0.1:3000/health

# Frontend javob beryaptimi?
curl http://127.0.0.1:3001

# Nginx ishlayaptimi?
systemctl status nginx

# Nginx loglarini ko'rish
tail -f /var/log/nginx/error.log
```

## GitHub Actions Secret'ni yangilash

Agar keyingi deploy'lar to'g'ri ishlashi uchun:

1. GitHub repository'ga kiring
2. **Settings** → **Secrets and variables** → **Actions**
3. **SERVER_PATH** secret'ni toping
4. Qiymatni yangilang: `/var/www/tree-monitor/tree`
5. **Update** tugmasini bosing

## Keyingi Deploy

Endi GitHub'ga push qilsangiz, avtomatik to'g'ri path'dan deploy bo'ladi!

## Agar hali ham ishlamasa

### 1. Server holatini tekshirish

```bash
cd /var/www/tree-monitor/tree
chmod +x scripts/check-server.sh
./scripts/check-server.sh
```

### 2. Nginx site'ni enable qilish

```bash
# Site enable qilinganligini tekshirish
ls -la /etc/nginx/sites-enabled/ | grep tree-monitor

# Agar yo'q bo'lsa:
ln -sf /etc/nginx/sites-available/tree-monitor /etc/nginx/sites-enabled/tree-monitor

# Default site'ni o'chirish
rm -f /etc/nginx/sites-enabled/default

# Nginx'ni qayta yuklash
nginx -t && systemctl reload nginx
```

### 3. Frontend container'ni tekshirish

```bash
cd /var/www/tree-monitor/tree/backend

# Frontend container loglarini ko'rish
docker compose -f docker-compose.prod.yml logs frontend --tail=50

# Frontend container'ni qayta ishga tushirish
docker compose -f docker-compose.prod.yml restart frontend

# To'g'ridan-to'g'ri test qilish
curl -v http://127.0.0.1:3001
```

### 4. Nginx error loglarini ko'rish

```bash
# Real-time error loglar
tail -f /var/log/nginx/error.log

# Yoki oxirgi 50 qatorni ko'rish
tail -50 /var/log/nginx/error.log
```

### 5. To'liq qayta tuzatish

```bash
cd /var/www/tree-monitor/tree

# 1. Nginx'ni to'liq qayta sozlash
./scripts/fix-nginx.sh

# 2. Container'larni qayta ishga tushirish
cd backend
docker compose -f docker-compose.prod.yml restart

# 3. Tekshirish
sleep 10
curl http://127.0.0.1:3000/health
curl http://127.0.0.1:3001
curl http://64.225.20.211/
```

### 6. Agar hali ham "Not Found" bo'lsa

Bu Next.js routing muammosi bo'lishi mumkin. Quyidagilarni tekshiring:

```bash
# Frontend container'ga kirish
docker exec -it tree-monitor-frontend-prod sh

# Container ichida:
# Port 3001'da ishlayaptimi?
netstat -tuln | grep 3001

# Yoki
ps aux | grep node
```

Agar frontend container ichida Next.js ishlamayotgan bo'lsa:

```bash
cd /var/www/tree-monitor/tree/backend

# Frontend'ni qayta build qilish
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

