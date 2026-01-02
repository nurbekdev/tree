# ESP8266 Backend URL Qo'llanmasi

## ⚠️ Muhim Eslatma

**ESP8266 qurilmalar DNS resolution qila olmaydi!**

Shuning uchun:
- ❌ **Domen ishlatib bo'lmaydi:** `https://nextree.app` - ISHLAYDI
- ✅ **IP manzil ishlatish kerak:** `http://64.225.20.211` - TO'G'RI

## 🔧 To'g'ri Konfiguratsiya

### base_station.ino

```cpp
// ESP8266 uchun IP manzil ishlatish kerak (domen emas!)
const char* BACKEND_URL = "http://64.225.20.211";  // ✅ TO'G'RI
// const char* BACKEND_URL = "https://nextree.app";  // ❌ ISHLAYDI (DNS yo'q)
```

### Nima Sabab?

1. **ESP8266 DNS yo'q** - Domain name'ni IP'ga aylantira olmaydi
2. **HTTP ishlatish kerak** - HTTPS ham ishlamaydi (SSL certificate muammosi)
3. **IP manzil** - To'g'ridan-to'g'ri IP manzil ishlatish kerak

## 📊 Frontend vs ESP8266

| Komponent | URL Format | Sabab |
|-----------|------------|-------|
| **Frontend (Browser)** | `https://nextree.app` | DNS resolution bor, HTTPS qo'llab-quvvatlanadi |
| **ESP8266 (Hardware)** | `http://64.225.20.211` | DNS yo'q, faqat IP, HTTP |

## ✅ Hozirgi Konfiguratsiya

### base_station.ino

```cpp
const char* BACKEND_URL = "http://64.225.20.211";  // ✅ TO'G'RI
```

Bu to'g'ri, chunki:
- ✅ IP manzil (DNS kerak emas)
- ✅ HTTP (HTTPS kerak emas)
- ✅ Port 80 (Nginx orqali)
- ✅ Nginx `/api/*` ni backend'ga proxy qiladi

## 🔍 Nginx Configuration

Nginx config'da IP manzil ham qo'llab-quvvatlanadi:

```nginx
server {
    listen 80;
    server_name nextree.app www.nextree.app 64.225.20.211 _;
    
    location /api {
        proxy_pass http://127.0.0.1:3000;
        # ...
    }
}
```

Bu degani:
- `https://nextree.app/api/v1/telemetry` ✅ (Frontend)
- `http://64.225.20.211/api/v1/telemetry` ✅ (ESP8266)

## 🚀 Dynamic Configuration (Ixtiyoriy)

Agar backend URL'ni dynamic qilish kerak bo'lsa, admin panel orqali olish mumkin:

```cpp
// Admin panel: /admin → ESP8266 Konfiguratsiyasi
// Backend URL: http://64.225.20.211
// API Key: 26a826cbadeb499a604e69cbb34c3d6b84edb23e2bacc282732db8f576255af0
```

Lekin asosiy BACKEND_URL hali ham IP bo'lishi kerak.

## 📝 Xulosa

**ESP8266 uchun:**
- ✅ `http://64.225.20.211` - TO'G'RI
- ❌ `https://nextree.app` - ISHLAYDI

**Frontend uchun:**
- ✅ `https://nextree.app` - TO'G'RI
- ✅ `http://64.225.20.211` - HAM ISHLAYDI

## 🔗 Qo'shimcha Ma'lumot

- [ESP8266 WiFiClient Documentation](https://arduino-esp8266.readthedocs.io/en/latest/esp8266wifi/client-examples.html)
- [ESP8266 HTTP Client](https://github.com/esp8266/Arduino/tree/master/libraries/ESP8266HTTPClient)
