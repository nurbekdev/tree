# Domen Backend Connection Fix

## ⚠️ Muammo

Frontend'da "Server'ga ulanib bo'lmadi. Backend ishlamayapti." xatolik.
Backend eski IP manzilga murojaat qilmoqda: `http://64.225.20.211/api/v1/settings`

## 🔧 Qilingan O'zgarishlar

### 1. Docker Compose - Domain URL

`backend/docker-compose.prod.yml`:
- `NEXT_PUBLIC_API_URL: https://nextree.app` (eski: `http://64.225.20.211`)

### 2. Frontend API Client

`frontend/lib/api.js` va `frontend/lib/socket.js`:
- Client-side: `window.location.origin` ishlatiladi (domen yoki IP)
- Server-side: `https://nextree.app` default

### 3. Nginx Configuration

`scripts/fix-nginx.sh`:
- `server_name nextree.app www.nextree.app 64.225.20.211 _;`
- Domen va IP ikkalasi ham qo'llab-quvvatlanadi

## 🔍 Server'da Tekshirish

### 1. Nginx Config Yangilash

```bash
cd /var/www/tree-monitor/tree
bash scripts/fix-nginx.sh
```

### 2. Nginx Test va Reload

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Backend Container Restart

```bash
cd /var/www/tree-monitor/tree/backend
docker compose -f docker-compose.prod.yml restart frontend
```

### 4. Test

```bash
# Backend health check
curl http://localhost/api/v1/stats

# Domen orqali
curl https://nextree.app/api/v1/stats
```

## ✅ Kutilayotgan Natija

- **Eski:** `http://64.225.20.211/api/v1/settings` → 404
- **Yangi:** `https://nextree.app/api/v1/settings` → 200 OK

## 📝 Eslatmalar

1. **Frontend API** - `window.location.origin` ishlatiladi (domen yoki IP)
2. **Nginx Proxy** - `/api/*` → `http://127.0.0.1:3000`
3. **ESP8266** - Hali ham IP ishlatadi (DNS resolution yo'q)
4. **Domen** - `https://nextree.app` frontend uchun
