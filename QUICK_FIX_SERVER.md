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

```bash
# Barcha container'larni ko'rish
docker ps -a

# Loglarni ko'rish
cd /var/www/tree-monitor/tree/backend
docker compose -f docker-compose.prod.yml logs

# Nginx konfiguratsiyasini tekshirish
nginx -t

# Nginx'ni qayta yuklash
systemctl reload nginx
```

