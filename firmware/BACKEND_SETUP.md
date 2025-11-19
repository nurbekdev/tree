# Base Station Backend Configuration

## BACKEND_URL ni to'g'rilash

ESP8266 `localhost` yoki `127.0.0.1` ni tushunmaydi. Sizning kompyuteringizning **local IP address**ini ishlatishingiz kerak.

### IP Address'ni topish:

#### Mac/Linux:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

yoki

```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

#### Windows:
```cmd
ipconfig
```
"IPv4 Address" ni qidiring (masalan: `192.168.1.105`)

### Misol:

Agar sizning IP address'ingiz `192.168.1.105` bo'lsa:

```cpp
const char* BACKEND_URL = "http://192.168.1.105:3000";
```

## API_KEY ni to'g'rilash

`API_KEY` backend'dagi `.env` faylidagi `API_KEY` bilan bir xil bo'lishi kerak.

Hozirgi key:
```
26a826cbadeb499a604e69cbb34c3d6b84edb23e2bacc282732db8f576255af0
```

## Muhim eslatmalar:

1. **ESP8266 va kompyuter bir xil Wi-Fi tarmog'ida bo'lishi kerak**
2. **Backend ishlayotgan bo'lishi kerak** (`npm run dev` yoki `docker compose up`)
3. **Firewall backend port'ini (3000) bloklamasligi kerak**
4. IP address o'zgarganda, firmware'ni qayta yuklash kerak

## Test qilish:

1. Backend'ni ishga tushiring: `cd backend && npm run dev`
2. Base station'ni Wi-Fi'ga ulang
3. Serial Monitor'da backend'ga ulanishni kuzating
4. Agar xatolik bo'lsa, IP address'ni tekshiring

