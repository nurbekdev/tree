# ESP8266 Nginx Orqali Ulanish

## ✅ To'g'ri Sozlash

ESP8266 qurilmalari **Nginx orqali** backend'ga ulanadi (port 80), to'g'ridan-to'g'ri backend'ga emas (port 3000).

### Backend URL

`firmware/base_station/base_station.ino` faylida:

```cpp
const char* BACKEND_URL = "http://64.225.20.211";  // Port 80 orqali (Nginx)
```

**Muhim:**
- ✅ `http://` (HTTPS emas!)
- ✅ IP manzil (domen nom emas!)
- ✅ Port yo'q (default port 80)

### Nginx Konfiguratsiyasi

Nginx `/api/*` so'rovlarini backend'ga proxy qiladi:

```nginx
server {
    listen 80;
    server_name 64.225.20.211 _;

    # Backend API - ESP8266 qurilmalari uchun
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
}
```

### ESP8266 So'rov Yo'li

ESP8266 quyidagicha so'rov yuboradi:

```
POST http://64.225.20.211/api/v1/telemetry
```

Nginx bu so'rovni backend'ga yo'naltiradi:

```
POST http://127.0.0.1:3000/api/v1/telemetry
```

## 🔍 Tekshirish

### 1. ESP8266 Serial Monitor

Serial Monitor'da quyidagilarni kuzating:

```
=== Sending to Backend ===
URL: http://64.225.20.211/api/v1/telemetry
✓ HTTP Response Code: 201
✓ Successfully sent to backend
```

### 2. Nginx Loglar

```bash
# Nginx access loglar
sudo tail -f /var/log/nginx/access.log | grep api

# Nginx error loglar
sudo tail -f /var/log/nginx/error.log
```

### 3. Backend Loglar

```bash
# Backend loglar
docker logs -f tree-monitor-api-prod | grep telemetry
```

## 📋 Checklist

- [ ] `BACKEND_URL` to'g'ri sozlangan (`http://64.225.20.211`)
- [ ] Port yo'q (default port 80)
- [ ] Nginx `/api/*` location block mavjud
- [ ] Nginx backend'ga proxy qiladi (`http://127.0.0.1:3000`)
- [ ] Backend container ishlayapti
- [ ] ESP8266 firmware yangilangan
- [ ] Serial Monitor'da backend'ga ulanish ko'rinadi

## ⚠️ Eslatmalar

1. **ESP8266 qurilmalari Nginx orqali ulanadi** (port 80)
2. **Backend port 3000 faqat localhost'da ochiq** (Nginx orqali)
3. **ESP8266 IP manzil ishlatadi** (domen nom emas)
4. **HTTP ishlatiladi** (HTTPS emas)

## 🐛 Muammolarni Hal Qilish

### ESP8266 ulanmayapti

1. **Nginx ishlayotganini tekshiring:**
   ```bash
   sudo systemctl status nginx
   ```

2. **Nginx konfiguratsiyasini tekshiring:**
   ```bash
   sudo nginx -t
   ```

3. **Backend container ishlayotganini tekshiring:**
   ```bash
   docker ps | grep backend
   ```

### 404 Error

- Nginx `/api/*` location block yo'q
- Backend container ishlamayapti
- Nginx konfiguratsiyasi noto'g'ri

**Yechim:**
```bash
# Nginx konfiguratsiyasini tekshirish
sudo nginx -t

# Nginx'ni reload qilish
sudo systemctl reload nginx
```
