# Frontend Deployment Guide

## Frontend'ni Server'da Ishga Tushirish

### 1. Environment Variables Sozlash

Frontend uchun `.env.production` fayl yaratilgan. Agar o'zgartirish kerak bo'lsa:

```bash
cd /var/www/tree-monitor/frontend
nano .env.production
```

Quyidagilarni sozlang:
```env
NEXT_PUBLIC_API_URL=http://64.225.20.211/api
```

### 2. Docker Compose orqali Ishga Tushirish

Backend bilan birga frontend ham avtomatik ishga tushadi:

```bash
cd /var/www/tree-monitor/backend
docker compose -f docker-compose.prod.yml up -d
```

Bu quyidagilarni ishga tushiradi:
- PostgreSQL database
- Backend API (port 3000)
- Frontend (port 3001)

### 3. Nginx Konfiguratsiyasi

Nginx avtomatik sozlangan va quyidagilarni proxy qiladi:
- `/api/*` → Backend (port 3000)
- `/socket.io/*` → Backend WebSocket
- `/` → Frontend (port 3001)

### 4. Frontend'ni Alohida Build Qilish (Agar Kerak Bo'lsa)

Agar frontend'ni alohida build qilish kerak bo'lsa:

```bash
cd /var/www/tree-monitor/frontend

# Build
npm install
npm run build

# Start (development)
npm start
```

### 5. Frontend Container'ni Tekshirish

```bash
# Container status
docker ps | grep frontend

# Logs
docker logs tree-monitor-frontend-prod -f

# Container ichiga kirish
docker exec -it tree-monitor-frontend-prod sh
```

### 6. Frontend'ni Qayta Build Qilish

Agar frontend kodida o'zgarishlar bo'lsa:

```bash
cd /var/www/tree-monitor/backend
docker compose -f docker-compose.prod.yml build frontend --no-cache
docker compose -f docker-compose.prod.yml up -d frontend
```

### 7. Frontend'ga Kirish

Deploy qilingandan keyin:

- **Frontend**: `http://64.225.20.211`
- **API**: `http://64.225.20.211/api`
- **Health Check**: `http://64.225.20.211/health`

### 8. Troubleshooting

#### Frontend ishlamayapti

```bash
# Loglarni tekshirish
docker logs tree-monitor-frontend-prod

# Container status
docker ps -a | grep frontend

# Qayta ishga tushirish
docker compose -f docker-compose.prod.yml restart frontend
```

#### Build xatoliklari

```bash
# Build loglarni ko'rish
docker compose -f docker-compose.prod.yml build frontend --no-cache

# Node modules'ni tozalash
cd /var/www/tree-monitor/frontend
rm -rf node_modules .next
npm install
```

#### Nginx xatoliklari

```bash
# Nginx konfiguratsiyasini tekshirish
nginx -t

# Nginx'ni qayta yuklash
systemctl reload nginx

# Nginx loglarini ko'rish
tail -f /var/log/nginx/error.log
```

### 9. Production Optimizatsiyalar

Frontend production mode'da quyidagilar bilan ishlaydi:
- ✅ Standalone build (minimal Docker image)
- ✅ Static file caching
- ✅ Production optimizations
- ✅ Security headers

### 10. SSL Sozlash (HTTPS)

Agar SSL kerak bo'lsa:

```bash
certbot --nginx -d yourdomain.com
```

Bu avtomatik:
- SSL sertifikat olish
- Nginx konfiguratsiyasini yangilash
- Auto-renewal sozlash

## GitHub Actions orqali Avtomatik Deploy

Har safar `main` branch'ga push qilganda, frontend ham avtomatik rebuild va restart bo'ladi.

## Frontend Environment Variables

Production'da quyidagi o'zgaruvchilar ishlatiladi:

- `NEXT_PUBLIC_API_URL`: Backend API URL (build time'da sozlanadi)
- `NODE_ENV`: `production`

**Muhim**: `NEXT_PUBLIC_*` prefiksli o'zgaruvchilar client-side'da ham mavjud bo'ladi!

