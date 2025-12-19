# Domain Sozlash - nextree.app

## ✅ Bajarilgan O'zgarishlar

### Frontend
- ✅ `app/layout.js` - Site URL: `https://nextree.app`
- ✅ `lib/api.js` - Relative URL ishlatadi (Nginx proxy uchun)
- ✅ `lib/socket.js` - Relative URL ishlatadi (Nginx proxy uchun)
- ✅ `app/sitemap.js` - Domain yangilandi
- ✅ `public/robots.txt` - Sitemap URL yangilandi
- ✅ `app/tree/[id]/page.js` - Relative URL ishlatadi
- ✅ `app/admin/page.js` - Relative URL ishlatadi
- ✅ `next.config.js` - Default domain yangilandi

### Backend
- ✅ `server.js` - CORS sozlamalari: `nextree.app` qo'shildi

## 🔧 API URL Sozlash

**Muhim:** API URL'lar endi **relative** ishlatiladi. Bu Nginx proxy tufayli ishlaydi:

- Frontend: `https://nextree.app`
- API so'rovlar: `https://nextree.app/api/v1/...`
- Nginx `/api/*` ni backend'ga proxy qiladi

### Nima uchun relative URL?

1. **Nginx Proxy:** Nginx `/api/*` so'rovlarini backend'ga yo'naltiradi
2. **CORS muammosi yo'q:** Barcha so'rovlar bir xil domendan keladi
3. **HTTPS:** SSL sertifikat Nginx'da, barcha so'rovlar HTTPS orqali
4. **Oddiy sozlash:** Environment variable'lar kerak emas

## 📋 Production Deployment

### 1. Environment Variables

Frontend uchun `.env.production` fayl yaratish (ixtiyoriy):

```bash
cd frontend
cp .env.production.example .env.production
```

`.env.production` faylida:
```env
NEXT_PUBLIC_SITE_URL=https://nextree.app
```

**Eslatma:** `NEXT_PUBLIC_API_URL` kerak emas, chunki relative URL ishlatiladi.

### 2. Nginx Konfiguratsiyasi

Nginx konfiguratsiyasida quyidagilar bo'lishi kerak:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name nextree.app www.nextree.app;
    
    # SSL redirect (Let's Encrypt uchun)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name nextree.app www.nextree.app;
    
    # SSL sertifikatlar
    ssl_certificate /etc/letsencrypt/live/nextree.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nextree.app/privkey.pem;
    
    # Backend API
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
    
    # WebSocket support
    location /socket.io {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3001;
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
```

### 3. SSL Sertifikat (Let's Encrypt)

```bash
sudo certbot --nginx -d nextree.app -d www.nextree.app
```

### 4. Backend Environment Variables

Backend `.env` faylida (ixtiyoriy):

```env
FRONTEND_URL=https://nextree.app
NODE_ENV=production
```

## 🔍 Tekshirish

### 1. API So'rovlar

Brauzer console'da:
```javascript
fetch('/api/v1/health')
  .then(r => r.json())
  .then(console.log)
```

### 2. Network Tab

Network tab'da so'rovlar quyidagicha ko'rinishi kerak:
- ✅ `https://nextree.app/api/v1/auth/login` (relative URL)
- ❌ `http://64.225.20.211/api/v1/auth/login` (eski, noto'g'ri)

### 3. CORS Tekshirish

Backend loglarida CORS xatoliklari bo'lmasligi kerak.

## ⚠️ Muammolarni Hal Qilish

### Network Error

Agar network error bo'lsa:

1. **Nginx tekshirish:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

2. **Backend ishlayotganini tekshirish:**
   ```bash
   curl http://127.0.0.1:3000/health
   ```

3. **Frontend ishlayotganini tekshirish:**
   ```bash
   curl http://127.0.0.1:3001
   ```

4. **CORS tekshirish:**
   - Backend loglarida CORS xatoliklari bo'lmasligi kerak
   - Browser console'da CORS xatoliklari bo'lmasligi kerak

### API 404 Error

Agar API 404 qaytarsa:

1. Nginx konfiguratsiyasini tekshiring
2. `/api` location block to'g'ri sozlanganini tekshiring
3. Backend port 3000'da ishlayotganini tekshiring

### SSL Muammolari

Agar SSL ishlamasa:

1. Certbot sertifikatlarini tekshiring
2. Nginx SSL sozlamalarini tekshiring
3. Firewall port 443'ni ochganini tekshiring

## 📝 Eslatmalar

1. **Relative URL:** Barcha API so'rovlar endi relative URL ishlatadi
2. **Nginx Proxy:** `/api/*` va `/socket.io/*` Nginx orqali backend'ga yo'naltiriladi
3. **HTTPS:** Barcha so'rovlar HTTPS orqali bo'lishi kerak
4. **CORS:** Backend'da `nextree.app` allowed origins'ga qo'shildi

## ✅ Tekshirish Ro'yxati

- [ ] Nginx konfiguratsiyasi yangilandi
- [ ] SSL sertifikat o'rnatildi
- [ ] Backend ishlayapti (port 3000)
- [ ] Frontend ishlayapti (port 3001)
- [ ] API so'rovlar ishlayapti (`/api/v1/health`)
- [ ] WebSocket ishlayapti (`/socket.io`)
- [ ] Login ishlayapti
- [ ] CORS xatoliklari yo'q
- [ ] Network error yo'q
