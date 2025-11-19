# 🚀 Frontend'ni Tezkor Ishga Tushirish

## 1. Server'da Docker Compose orqali

Frontend avtomatik backend bilan birga ishga tushadi:

```bash
cd /var/www/tree-monitor/backend
docker compose -f docker-compose.prod.yml up -d
```

## 2. Tekshirish

```bash
# Barcha container'lar ishlayaptimi?
docker compose -f docker-compose.prod.yml ps

# Frontend loglar
docker logs tree-monitor-frontend-prod -f
```

## 3. Kirish

- **Frontend**: http://64.225.20.211
- **API**: http://64.225.20.211/api

## 4. Qayta Build (Agar Kerak)

```bash
cd /var/www/tree-monitor/backend
docker compose -f docker-compose.prod.yml build frontend --no-cache
docker compose -f docker-compose.prod.yml up -d frontend
```

## 5. Troubleshooting

```bash
# Frontend container'ni qayta ishga tushirish
docker compose -f docker-compose.prod.yml restart frontend

# Nginx'ni qayta yuklash
systemctl reload nginx
```

Batafsil: `FRONTEND_DEPLOYMENT.md`

