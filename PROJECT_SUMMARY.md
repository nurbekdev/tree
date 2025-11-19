# Project Summary

## Overview

This is a complete smart agricultural tree-monitoring system with:
- **3 Transmitter devices** (ESP8266 + sensors) that send data via nRF24L01
- **1 Base station** (ESP8266) that receives data and forwards to backend
- **Backend API** (Node.js + Express + PostgreSQL) with REST endpoints and WebSocket
- **Web App** (React/Next.js) with Uzbek language UI for monitoring and management

## Key Features

✅ Real-time sensor monitoring (temperature, humidity, smoke, tilt/cut detection)
✅ Alert system with immediate notifications
✅ Web dashboard with telemetry charts
✅ Editable tree metadata
✅ Real-time WebSocket updates
✅ Authentication system
✅ Responsive mobile-friendly UI

## Project Structure

```
ootree/
├── firmware/
│   ├── transmitter/          # Transmitter firmware (ESP8266)
│   │   └── transmitter.ino
│   ├── base_station/         # Base station firmware (ESP8266)
│   │   └── base_station.ino
│   └── README.md            # Firmware documentation
├── backend/                 # Node.js + Express + PostgreSQL
│   ├── routes/              # API routes
│   ├── middleware/          # Auth and validation
│   ├── scripts/             # Database migrations
│   ├── server.js            # Main server file
│   ├── docker-compose.yml   # Docker setup
│   └── package.json
├── frontend/                # React/Next.js Web App
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── lib/                # API and Socket clients
│   ├── locales/            # Uzbek translations
│   └── package.json
├── docs/                    # Documentation
│   ├── wiring.md           # Wiring diagrams
│   ├── INSTALLATION.md      # Setup instructions
│   ├── API.md              # API documentation
│   └── troubleshooting.md  # Troubleshooting guide
├── tests/                   # Test scripts
│   ├── simulate_transmitter.js
│   └── test_alert.js
└── README.md               # Main documentation
```

## Quick Start Commands

### Backend
```bash
cd backend
cp env.example .env
# Edit .env
docker compose up -d
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Access at http://localhost:3001
```

### Firmware
1. Install Arduino libraries (see firmware/README.md)
2. Configure TREE_ID in transmitter.ino
3. Configure Wi-Fi and API in base_station.ino
4. Upload to ESP8266

## Default Credentials

- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Change in production!**

## Testing

```bash
# Simulate transmitters
cd tests
npm install
API_KEY=your-key node simulate_transmitter.js

# Test alerts
API_KEY=your-key node test_alert.js
```

## Important Notes

1. **nRF24L01 Payload Limit:** 32 bytes. JSON payloads are kept compact to fit.
2. **Library Compatibility:** RF24 library may need ESP8266-compatible version.
3. **Power Supply:** Ensure stable 3.3V for nRF24L01 modules.
4. **Wi-Fi Range:** Base station must be within Wi-Fi range.
5. **API Key:** Must match between base station firmware and backend .env.

## Next Steps

1. ✅ Hardware assembly (see docs/wiring.md)
2. ✅ Flash firmware to ESP8266 devices
3. ✅ Configure Wi-Fi and backend URL
4. ✅ Start backend and frontend
5. ✅ Test with simulation scripts
6. ✅ Deploy to production (change default password!)

## Support

See documentation in `docs/` directory:
- `wiring.md` - Hardware connections
- `INSTALLATION.md` - Detailed setup
- `API.md` - API reference
- `troubleshooting.md` - Common issues

