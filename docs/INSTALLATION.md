# Installation Guide

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Arduino IDE with ESP8266 board support
- PostgreSQL (or use Docker)

## Step 1: Backend Setup

### Using Docker (Recommended)

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
docker compose up -d
```

This will:
- Start PostgreSQL database
- Run database migrations
- Start the backend API server

### Manual Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials

# Start PostgreSQL (or use existing)
# Then run migrations:
npm run migrate

# Start server:
npm start
```

Backend will be available at `http://localhost:3000`

## Step 2: Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:3001`

**Default Login:**
- Username: `admin`
- Password: `admin123`

⚠️ **Change default password in production!**

## Step 3: Firmware Setup

### Install Arduino Libraries

1. Open Arduino IDE
2. Go to **Sketch → Include Library → Manage Libraries**
3. Install the following:
   - **ESP8266WiFi** (usually included)
   - **RF24** (by TMRh20) - Note: May need ESP8266-compatible version
   - **DHT sensor library** (by Adafruit)
   - **MPU6050** (by Electronic Cats or similar)
   - **ArduinoJson** (by Benoit Blanchon)

### Transmitter Firmware

1. Open `firmware/transmitter/transmitter.ino`
2. Configure:
   - `TREE_ID`: Set to 1, 2, or 3 for each transmitter
   - `SAMPLE_INTERVAL_MS`: Default 30000 (30 seconds)
   - `MQ2_ALERT_THRESHOLD`: Adjust based on calibration
   - `MPU_TILT_THRESHOLD`: Adjust sensitivity
   - `MPU_CUT_THRESHOLD`: Adjust cut detection sensitivity
3. Select board: **Tools → Board → NodeMCU 1.0 (ESP-12E Module)**
4. Select port: **Tools → Port → [Your ESP8266 port]**
5. Upload: **Sketch → Upload**

### Base Station Firmware

1. Open `firmware/base_station/base_station.ino`
2. Configure:
   - `WIFI_SSID`: Your Wi-Fi network name
   - `WIFI_PASSWORD`: Your Wi-Fi password
   - `BACKEND_URL`: Backend API URL (e.g., `http://192.168.1.100:3000`)
   - `API_KEY`: Must match backend `.env` API_KEY
3. Select board and port (same as transmitter)
4. Upload firmware

## Step 4: Hardware Assembly

See `docs/wiring.md` for detailed wiring diagrams.

### Quick Checklist

**Base Station:**
- [ ] nRF24L01 connected (CE→D4, CSN→D8, SCK→D5, MOSI→D7, MISO→D6)
- [ ] 3 LEDs connected (D1, D2, D3) with resistors
- [ ] Power supply connected

**Transmitter (×3):**
- [ ] nRF24L01 connected (same pins as base)
- [ ] DHT11 connected (DATA→D3)
- [ ] MQ-2 connected (A0→A0)
- [ ] MPU6050 connected (SCL→D1, SDA→D2)
- [ ] Power supply connected

## Step 5: Testing

### Test Backend

```bash
# Health check
curl http://localhost:3000/health

# Test telemetry endpoint (use test script)
cd tests
npm install
API_KEY=your-secret-api-key-here node simulate_transmitter.js
```

### Test Frontend

1. Open `http://localhost:3001`
2. Login with `admin` / `admin123`
3. Verify dashboard shows 3 trees
4. Click on a tree to see details

### Test Alert Conditions

```bash
cd tests
API_KEY=your-secret-api-key-here node test_alert.js
```

This will send test alerts to verify the system works.

## Step 6: Production Deployment

### Backend (PM2)

```bash
cd backend
npm install --production
pm2 start server.js --name tree-monitor-api
pm2 save
```

### Frontend (Build)

```bash
cd frontend
npm run build
npm start
```

Or use Docker:

```bash
# Build and run
docker compose -f docker-compose.prod.yml up -d
```

## Configuration

### Environment Variables

**Backend (.env):**
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `PORT`: Backend port (default: 3000)
- `API_KEY`: Shared key for base station authentication
- `JWT_SECRET`: Secret for JWT tokens

**Frontend:**
- `NEXT_PUBLIC_API_URL`: Backend API URL

### Firmware Constants

Edit constants in firmware files:
- Transmitter: `TREE_ID`, thresholds, intervals
- Base: Wi-Fi credentials, backend URL, API key

## Troubleshooting

See `docs/troubleshooting.md` for common issues and solutions.

## Next Steps

1. Change default admin password
2. Configure alert thresholds per tree
3. Set up email notifications (optional)
4. Deploy to production server
5. Monitor system health

