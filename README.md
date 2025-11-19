# Smart Agricultural Tree-Monitoring System

Complete implementation of a tree monitoring system with ESP8266 transmitters, base station, RESTful backend, and responsive Web App.

## Project Structure

```
ootree/
├── firmware/
│   ├── transmitter/          # Transmitter firmware (ESP8266)
│   └── base_station/         # Base station firmware (ESP8266)
├── backend/                  # Node.js + Express + PostgreSQL API
├── frontend/                 # React/Next.js Web App (Uzbek UI)
├── docs/                     # Documentation and wiring diagrams
└── tests/                    # Test scripts and emulators
```

## Production Setup

**Muhim**: Real qurilmalar uchun tayyorlash:

1. **Database'ni tozalash** (demo ma'lumotlarni o'chirish):
   ```bash
   cd backend
   npm run clean-demo
   ```

2. **Base Station sozlash**:
   - `firmware/base_station/base_station.ino` faylida Wi-Fi va IP address'ni yangilang
   - Hozirgi IP: `192.168.43.112` (o'zgarganda yangilang!)

3. **Transmitter sozlash**:
   - Har bir transmitter uchun `TREE_ID` ni o'rnating (1, 2, yoki 3)
   - Sampling interval: 15 soniya (real vaqt uchun)

Batafsil: [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)

## Hardware Requirements

### Base Station (ESP8266)
- MCU: ESP8266 (NodeMCU/WeMos)
- nRF24L01 module
- 3 LEDs (for tree status indicators)

### Transmitter (ESP8266) - 3 units
- MCU: ESP8266
- nRF24L01 module
- DHT11 sensor (temperature + humidity)
- MQ-2 sensor (smoke/air quality)
- MPU6050 (tilt/cut detection)

## Quick Start

### 1. Firmware Setup

#### Transmitter Firmware
1. Open `firmware/transmitter/transmitter.ino` in Arduino IDE
2. Install required libraries:
   - ESP8266WiFi
   - RF24 (modified for ESP8266)
   - DHT sensor library
   - MPU6050 library
3. Configure `TREE_ID` (1, 2, or 3) in the code
4. Upload to ESP8266

#### Base Station Firmware
1. Open `firmware/base_station/base_station.ino` in Arduino IDE
2. Configure Wi-Fi credentials and backend URL
3. Upload to ESP8266

### 2. Backend Setup

**Using Docker (Recommended):**
```bash
cd backend
cp env.example .env
# Edit .env with your configuration
docker compose up -d
```

**Manual Setup:**
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your database credentials
# Start PostgreSQL, then:
npm run migrate
npm start
```

Backend will be available at `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Access the web app at `http://localhost:3001`

**Default Login:**
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT:** Change the default password in production!

## Wiring Diagrams

See `docs/wiring.md` for detailed wiring diagrams.

## Configuration

### Transmitter Configuration
Edit constants in `firmware/transmitter/transmitter.ino`:
- `TREE_ID`: 1, 2, or 3
- `SAMPLE_INTERVAL_MS`: Default 15000 (15 seconds for real-time)
- `MQ2_ALERT_THRESHOLD`: Smoke detection threshold
- `MPU_TILT_THRESHOLD`: Tilt detection threshold

### Base Station Configuration
Edit constants in `firmware/base_station/base_station.ino`:
- `WIFI_SSID`: Your Wi-Fi network name
- `WIFI_PASSWORD`: Your Wi-Fi password
- `BACKEND_URL`: Backend API URL (e.g., `http://192.168.1.100:3000`)
- `API_KEY`: Shared API key for authentication

### Backend Configuration
Edit `backend/.env`:
- Database credentials
- JWT secret
- API key (must match base station)

## Testing

### Test DHT11 and MQ-2 Sensors

**Sensor Test Script:**
1. Open `firmware/transmitter/test_sensors.ino` in Arduino IDE
2. Upload to ESP8266
3. Open Serial Monitor (115200 baud)
4. You should see readings every 2 seconds:
   ```
   Time        Temp(°C)    Humidity(%)  MQ-2(Raw)  MQ-2(Status)
   ----------------------------------------------------------------
   2s          25.3        45.2         120        OK
   4s          25.4        45.3         125        OK
   ```

**Expected Values:**
- DHT11 Temperature: 0-50°C (room temp ~20-30°C)
- DHT11 Humidity: 20-90%
- MQ-2: 0-1023 (normal: 50-300, alert: >400)

**Troubleshooting:**
- If DHT11 shows "ERROR": Check wiring (VCC, GND, DATA)
- If MQ-2 shows 0 or 1023: Check wiring (VCC, GND, A0)

### Simulate Transmitters
```bash
cd tests
node simulate_transmitter.js
```

### Test Alert Conditions
1. Trigger smoke: Set MQ-2 threshold low or use test script
2. Trigger cut: Simulate MPU6050 abrupt movement

## Deployment

### Production Backend
```bash
cd backend
pm2 start npm --name "tree-monitor-api" -- start
```

### Production Frontend
```bash
cd frontend
npm run build
npm start
```

Or use Docker:
```bash
docker compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

See `docs/troubleshooting.md` for common issues and solutions.

## License

MIT

