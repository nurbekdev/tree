# ESP8266 Backend URL Sozlash - Muhim Qo'llanma

## ⚠️ Muhim Eslatma

ESP8266 qurilmalari **faqat HTTP ishlatadi** (HTTPS emas) va **domen nomlarini ishlatmaydi**. 

### Nima uchun?

1. **ESP8266 HTTPClient kutubxonasi** faqat HTTP'ni qo'llab-quvvatlaydi
2. **HTTPS uchun** `WiFiClientSecure` kerak, lekin bu murakkab va SSL sertifikat kerak
3. **Domen nomlarini resolve qilish** ESP8266'da ishonchli emas
4. **To'g'ridan-to'g'ri IP manzil** ishlatish eng ishonchli usul

## 🔧 To'g'ri Sozlash

### Production Server

`firmware/base_station/base_station.ino` faylida:

```cpp
const char* BACKEND_URL = "http://64.225.20.211:3000";  // Server IP (HTTP, not HTTPS!)
```

**Muhim:**
- ✅ `http://` (HTTPS emas!)
- ✅ IP manzil (domen nom emas!)
- ✅ Port 3000

### Local Development

Agar local development qilsangiz:

```cpp
const char* BACKEND_URL = "http://192.168.x.x:3000";  // Your local IP
```

## 🔒 Backend Port Sozlash

### Docker Compose

`backend/docker-compose.prod.yml` faylida:

```yaml
ports:
  - "0.0.0.0:3000:3000"  # Tashqi tarmoqdan ochiq (ESP8266 uchun)
```

**Muhim:** Port 3000 tashqi tarmoqda ochiq bo'lishi kerak, chunki ESP8266 qurilmalari to'g'ridan-to'g'ri backend'ga ulanadi.

## 🔍 Tekshirish

### 1. Backend Port Ochikligini Tekshirish

Server'da:

```bash
# Port 3000 ochikligini tekshirish
sudo netstat -tuln | grep 3000

# Natija quyidagicha bo'lishi kerak:
# tcp  0  0 0.0.0.0:3000  0.0.0.0:*  LISTEN
```

### 2. ESP8266 Serial Monitor

Serial Monitor'da quyidagilarni kuzating:

```
=== Sending to Backend ===
URL: http://64.225.20.211:3000/api/v1/telemetry
✓ HTTP Response Code: 201
✓ Successfully sent to backend
```

Agar xatolik bo'lsa:

```
❌ HTTP request failed: connection refused
```

Bu backend port 3000'ga ulanib bo'lmayotganini anglatadi.

### 3. Backend Health Check

Server'da yoki boshqa kompyuterdan:

```bash
curl http://64.225.20.211:3000/health
```

## 🐛 Muammolarni Hal Qilish

### Ma'lumotlar kelmayapti

1. **Backend ishlayotganini tekshiring:**
   ```bash
   docker ps | grep backend
   docker logs tree-monitor-api-prod
   ```

2. **Port 3000 ochikligini tekshiring:**
   ```bash
   sudo netstat -tuln | grep 3000
   ```

3. **Firewall tekshiring:**
   ```bash
   sudo ufw status
   # Port 3000 ochiq bo'lishi kerak
   ```

4. **Serial Monitor'da xatoliklarni ko'ring:**
   - Wi-Fi ulanmaganmi?
   - Backend URL to'g'rimi?
   - API_KEY to'g'rimi?

### Connection Refused

- Backend ishlamayapti
- Port 3000 bloklangan
- Firewall port'ni bloklagan

**Yechim:**
```bash
# Backend'ni qayta ishga tushirish
cd backend
docker compose -f docker-compose.prod.yml restart backend

# Port ochikligini tekshirish
sudo netstat -tuln | grep 3000
```

### Timeout

- Wi-Fi tarmog'i sekin
- Backend javob bermayapti
- Network muammosi

**Yechim:**
- Wi-Fi signal kuchini tekshiring
- Backend loglarini ko'ring
- Network connectivity'ni tekshiring

## 📋 Checklist

- [ ] `BACKEND_URL` to'g'ri sozlangan (`http://64.225.20.211:3000`)
- [ ] HTTP ishlatilmoqda (HTTPS emas!)
- [ ] IP manzil ishlatilmoqda (domen nom emas!)
- [ ] Port 3000 tashqi tarmoqda ochiq
- [ ] Backend ishlayapti
- [ ] Firewall port 3000'ni bloklamagan
- [ ] ESP8266 Wi-Fi'ga ulanadi
- [ ] Serial Monitor'da backend'ga ulanish ko'rinadi

## ⚠️ Xavfsizlik

Port 3000 tashqi tarmoqda ochiq bo'lishi xavfsizlik muammosi bo'lishi mumkin. Quyidagilarni ko'rib chiqing:

1. **Firewall orqali cheklash:** Faqat ESP8266 IP manzillariga ruxsat bering
2. **API Key:** API_KEY to'g'ri sozlanganini tekshiring
3. **Muntazam monitoring:** Backend loglarini muntazam tekshiring

## 🔄 Keyingi Qadamlar

1. **Backend'ni qayta ishga tushirish:**
   ```bash
   cd backend
   docker compose -f docker-compose.prod.yml down
   docker compose -f docker-compose.prod.yml up -d
   ```

2. **Port 3000 ochikligini tekshirish:**
   ```bash
   sudo netstat -tuln | grep 3000
   ```

3. **ESP8266 firmware'ni yangilash:**
   - `base_station.ino` faylida `BACKEND_URL` ni tekshiring
   - Firmware'ni ESP8266'ga yuklang

4. **Serial Monitor'da tekshirish:**
   - Backend'ga ulanishni kuzating
   - Xatoliklarni yozib oling
