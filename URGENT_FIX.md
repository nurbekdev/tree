# 🚨 URGENT FIX - Root Route 404

## Muammo
- Nginx frontend'ga emas, balki backend'ga so'rov yubormoqda
- 404 javob `Content-Type: application/json` - bu backend'dan kelayotgan javob

## Tezkor Yechim

### Server'da quyidagi buyruqlarni bajaring:

```bash
cd /var/www/tree-monitor/tree

# 1. Frontend container'ni tekshirish
cd backend
docker compose -f docker-compose.prod.yml ps frontend
docker compose -f docker-compose.prod.yml logs frontend --tail=30

# 2. Frontend'ga to'g'ridan-to'g'ri so'rov yuborish
curl -v http://127.0.0.1:3001/

# 3. Agar frontend ishlamasa, qayta ishga tushirish
docker compose -f docker-compose.prod.yml restart frontend
sleep 10

# 4. Nginx konfiguratsiyasini yangilash
cd ..
./scripts/fix-nginx.sh

# 5. Debug script'ni ishga tushirish
./scripts/debug-nginx.sh
```

## Muhim O'zgarish

Nginx konfiguratsiyasida `proxy_pass` ga trailing slash qo'shildi:
- **Eski**: `proxy_pass http://127.0.0.1:3001;`
- **Yangi**: `proxy_pass http://127.0.0.1:3001/;`

Bu Next.js routing uchun muhim!

## Tekshirish

```bash
# Frontend to'g'ridan-to'g'ri
curl -I http://127.0.0.1:3001/
# Kutilayotgan: HTTP/1.1 307 Temporary Redirect → /login

# Nginx orqali
curl -I http://64.225.20.211/
# Kutilayotgan: HTTP/1.1 307 Temporary Redirect → /login
```

## Agar hali ham 404 bo'lsa

1. Frontend container loglarini tekshiring:
```bash
docker compose -f docker-compose.prod.yml logs frontend --tail=50
```

2. Frontend container'ni qayta build qiling:
```bash
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

3. Nginx error loglarini tekshiring:
```bash
tail -50 /var/log/nginx/error.log
```

