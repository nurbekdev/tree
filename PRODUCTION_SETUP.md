# Production Setup Guide

## Real Device Configuration

### 1. Database'ni tozalash

Demo ma'lumotlarni o'chirish:

```bash
cd backend
npm run clean-demo
```

Bu buyruq:
- Barcha telemetry ma'lumotlarini o'chiradi
- Barcha alert'larni o'chiradi
- Barcha daraxt statuslarini reset qiladi
- Demo metadata'ni tozalaydi

### 2. Base Station Configuration

**firmware/base_station/base_station.ino** faylida:

1. **Wi-Fi sozlamalari**:
   ```cpp
   const char* WIFI_SSID = "YOUR_WIFI_SSID";
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
   ```

2. **Backend URL** (hozirgi IP: `192.168.43.112`):
   ```cpp
   const char* BACKEND_URL = "http://192.168.43.112:3000";
   ```
   
   **Muhim**: IP address o'zgarganda, firmware'ni qayta yuklash kerak!

3. **API_KEY** (backend .env bilan bir xil):
   ```cpp
   const char* API_KEY = "26a826cbadeb499a604e69cbb34c3d6b84edb23e2bacc282732db8f576255af0";
   ```

### 3. Transmitter Configuration

**firmware/transmitter/transmitter.ino** faylida:

1. **Tree ID** (har bir transmitter uchun):
   ```cpp
   #define TREE_ID 1  // 1, 2, yoki 3
   ```

2. **Sampling interval** (hozirgi: 15 soniya):
   ```cpp
   #define SAMPLE_INTERVAL_MS 15000  // Real-time uchun
   ```

### 4. IP Address'ni topish

Agar IP o'zgarsa:

**Mac/Linux**:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows**:
```cmd
ipconfig
```

Keyin `base_station.ino` faylida `BACKEND_URL` ni yangilang.

### 5. Backend ishga tushirish

```bash
cd backend
docker compose up -d
```

yoki

```bash
npm run dev
```

### 6. Frontend ishga tushirish

```bash
cd frontend
npm run dev
```

## Real-time Monitoring Settings

- **Transmitter interval**: 15 soniya (real vaqt uchun optimal)
- **Backend timeout**: 2 soniya
- **Connection timeout**: 1 soniya
- **nRF24L01 retry**: 3 marta

## Sensor Testing

### Test DHT11 and MQ-2 Sensors

1. **Upload test script**:
   - Open `firmware/transmitter/test_sensors.ino` in Arduino IDE
   - Upload to ESP8266
   - Open Serial Monitor (115200 baud)

2. **Check readings**:
   - DHT11 should show temperature (0-50°C) and humidity (20-90%)
   - MQ-2 should show raw values (0-1023, normal: 50-300)
   - Readings update every 2 seconds

3. **If sensors don't work**:
   - Check wiring connections
   - Verify power supply (3.3V or 5V)
   - Check Serial Monitor for error messages

### Test Real-time Data

1. Upload `transmitter.ino` to ESP8266
2. Open Serial Monitor - you should see:
   ```
   Sensors: Temp=25.3°C, Humidity=45.2%, MQ2=120 PPM
   Packet sent: {...}
   ```
3. Check dashboard - data should appear within 15 seconds

## Troubleshooting

### Base station backend'ga ulanmayapti:
1. IP address'ni tekshiring
2. Backend ishlayotganligini tekshiring
3. Firewall port 3000'ni ochiqligini tekshiring
4. Wi-Fi ulanishini tekshiring

### Ma'lumotlar kelmayapti:
1. Transmitter'lar ishlayotganligini tekshiring
2. nRF24L01 ulanishini tekshiring
3. Base station Serial Monitor'ni kuzating
4. Backend log'larni tekshiring

## Production Checklist

- [ ] Database demo ma'lumotlar tozalandi
- [ ] Base station Wi-Fi sozlandi
- [ ] Base station IP address to'g'ri
- [ ] API_KEY backend bilan mos
- [ ] Transmitter'lar Tree ID bilan sozlandi
- [ ] Backend ishlayapti
- [ ] Frontend ishlayapti
- [ ] Real sensor ma'lumotlari kelmoqda

