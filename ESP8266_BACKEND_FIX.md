# ESP8266 Backend Connection Fix

## ⚠️ Muammo

Domen ulanganidan keyin:
- `http://64.225.20.211:3000/health` - **ERR_CONNECTION_REFUSED**
- `http://64.225.20.211/` - **404 Not Found** (nginx)

ESP8266 qurilmalari backend'ga ulanib bo'lmayapti.

## 🔍 Sabab

1. **Backend port 3000 ochiq emas** - Docker container ishlamayapti yoki port mapping noto'g'ri
2. **Nginx faqat domen uchun sozlangan** - IP manzil uchun server block yo'q
3. **ESP8266 qurilmalari IP manzil orqali ulanadi** - Domen nomlarni ishlatmaydi

## 🔧 Yechim

### Variant 1: Avtomatik Fix Script (Tavsiya etiladi)

Server'da quyidagi buyruqlarni bajaring:

```bash
cd /var/www/tree-monitor
chmod +x scripts/fix-esp8266-backend.sh
sudo ./scripts/fix-esp8266-backend.sh
```

Bu script:
1. Backend container'ni tekshiradi va ishga tushiradi
2. Port 3000 ochikligini tekshiradi
3. Backend health endpoint'ni test qiladi
4. Nginx konfiguratsiyasini yangilaydi (IP manzil uchun)
5. Nginx'ni reload qiladi

### Variant 2: Qo'lda Fix

#### 1. Backend Container'ni Tekshirish va Ishga Tushirish

```bash
cd /var/www/tree-monitor/backend

# Container status
docker ps -a | grep backend

# Agar ishlamayotgan bo'lsa:
docker compose -f docker-compose.prod.yml up -d backend

# Loglarni kuzatish
docker logs -f tree-monitor-api-prod
```

#### 2. Port 3000 Ochikligini Tekshirish

```bash
# Port 3000 ochikligini tekshirish
sudo netstat -tuln | grep 3000

# Kutilgan natija:
# tcp  0  0 0.0.0.0:3000  0.0.0.0:*  LISTEN
```

Agar port ochiq bo'lmasa, `docker-compose.prod.yml` faylini tekshiring:

```yaml
ports:
  - "0.0.0.0:3000:3000"  # Tashqi tarmoqdan ochiq
```

Keyin container'ni qayta ishga tushiring:

```bash
docker compose -f docker-compose.prod.yml restart backend
```

#### 3. Backend Health Check

```bash
# Localhost'dan
curl http://localhost:3000/health

# Tashqi IP'dan
curl http://64.225.20.211:3000/health
```

Kutilgan javob:
```json
{"status":"ok","timestamp":"2024-..."}
```

#### 4. Nginx Konfiguratsiyasini Yangilash

`/etc/nginx/sites-available/tree-monitor` faylini oching:

```bash
sudo nano /etc/nginx/sites-available/tree-monitor
```

IP manzil uchun server block qo'shing (domen block'dan oldin):

```nginx
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

# Domain-based server block (nextree.app)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name nextree.app www.nextree.app;
    
    # ... existing domain configuration ...
}
```

#### 5. Nginx'ni Test Qilish va Reload Qilish

```bash
# Konfiguratsiyani test qilish
sudo nginx -t

# Agar test muvaffaqiyatli bo'lsa:
sudo systemctl reload nginx
```

## 🔍 Tekshirish

### 1. Backend Port 3000

```bash
# Port ochikligini tekshirish
sudo netstat -tuln | grep 3000

# Health check
curl http://64.225.20.211:3000/health
```

### 2. Nginx IP Access

```bash
# Frontend (IP orqali)
curl http://64.225.20.211/

# API (IP orqali)
curl http://64.225.20.211/api/v1/health
```

### 3. ESP8266 Serial Monitor

Serial Monitor'da quyidagilarni kuzating:

```
=== Sending to Backend ===
URL: http://64.225.20.211:3000/api/v1/telemetry
✓ HTTP Response Code: 201
✓ Successfully sent to backend
```

## 📋 Checklist

- [ ] Backend container ishlayapti (`docker ps | grep backend`)
- [ ] Port 3000 ochiq (`netstat -tuln | grep 3000`)
- [ ] Backend health check ishlayapti (`curl http://64.225.20.211:3000/health`)
- [ ] Nginx IP-based server block qo'shilgan
- [ ] Nginx konfiguratsiyasi to'g'ri (`nginx -t`)
- [ ] Nginx reload qilingan
- [ ] Frontend IP orqali ishlayapti (`curl http://64.225.20.211/`)
- [ ] ESP8266 firmware yangilangan (`http://64.225.20.211:3000`)

## 🐛 Muammolarni Hal Qilish

### Backend Container Ishlamayapti

```bash
# Container'ni qayta ishga tushirish
cd /var/www/tree-monitor/backend
docker compose -f docker-compose.prod.yml restart backend

# Loglarni ko'rish
docker logs tree-monitor-api-prod
```

### Port 3000 Ochik Emas

```bash
# Docker compose port mapping'ni tekshirish
cat backend/docker-compose.prod.yml | grep ports

# Agar 127.0.0.1:3000:3000 bo'lsa, 0.0.0.0:3000:3000 ga o'zgartiring
# Keyin container'ni qayta ishga tushiring
docker compose -f docker-compose.prod.yml restart backend
```

### Nginx 404 Error

```bash
# Nginx konfiguratsiyasini tekshirish
sudo nginx -t

# Server block'larni ko'rish
sudo nginx -T | grep -A 20 "server_name"

# Nginx'ni reload qilish
sudo systemctl reload nginx
```

## ✅ Keyingi Qadamlar

1. **Backend'ni qayta ishga tushirish**
2. **Nginx konfiguratsiyasini yangilash**
3. **ESP8266 firmware'ni yangilash** (`http://64.225.20.211:3000`)
4. **Serial Monitor'da tekshirish**
