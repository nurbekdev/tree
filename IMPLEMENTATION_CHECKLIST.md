# Implementation Checklist

Use this checklist to verify your implementation is complete and working.

## Hardware Setup

- [ ] Base station ESP8266 assembled with nRF24L01 and 3 LEDs
- [ ] 3 Transmitter ESP8266 devices assembled with:
  - [ ] nRF24L01 module
  - [ ] DHT11 sensor
  - [ ] MQ-2 sensor
  - [ ] MPU6050 sensor
- [ ] All wiring verified (see docs/wiring.md)
- [ ] Power supplies connected and stable

## Firmware

- [ ] Arduino IDE configured with ESP8266 board support
- [ ] Required libraries installed:
  - [ ] RF24 (ESP8266-compatible)
  - [ ] DHT sensor library
  - [ ] MPU6050 library
  - [ ] ArduinoJson
- [ ] Transmitter firmware configured:
  - [ ] TREE_ID set (1, 2, or 3 for each)
  - [ ] Thresholds adjusted
  - [ ] Uploaded to all 3 transmitters
- [ ] Base station firmware configured:
  - [ ] Wi-Fi SSID and password set
  - [ ] Backend URL configured
  - [ ] API_KEY matches backend
  - [ ] Uploaded to base station
- [ ] Serial Monitor shows initialization messages
- [ ] Transmitters sending data (check Serial Monitor)
- [ ] Base station receiving data (check Serial Monitor)

## Backend

- [ ] PostgreSQL database running (via Docker or manual)
- [ ] Backend .env file configured:
  - [ ] Database credentials
  - [ ] API_KEY set
  - [ ] JWT_SECRET set
- [ ] Database migrations run successfully
- [ ] Backend server running
- [ ] Health endpoint responds: `curl http://localhost:3000/health`
- [ ] Default admin user created (admin/admin123)

## Frontend

- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend running on http://localhost:3001
- [ ] Can login with admin/admin123
- [ ] Dashboard displays 3 trees
- [ ] Tree cards show status indicators
- [ ] Clicking tree opens modal with details
- [ ] Telemetry charts display data
- [ ] Can edit tree metadata
- [ ] All UI text in Uzbek

## Testing

- [ ] Test script simulates transmitters successfully
- [ ] Backend receives telemetry data
- [ ] Frontend displays real-time updates
- [ ] Alert test script triggers alerts
- [ ] Alerts appear in frontend
- [ ] Alert acknowledgment works
- [ ] WebSocket real-time updates working

## Integration Testing

- [ ] Transmitter → Base Station: Data received via nRF24L01
- [ ] Base Station → Backend: HTTP POST successful
- [ ] Backend → Database: Data stored correctly
- [ ] Backend → Frontend: WebSocket events received
- [ ] Frontend → Backend: API calls work (login, update, acknowledge)

## Alert System

- [ ] Smoke alert triggers when MQ-2 threshold exceeded
- [ ] Cut detection alert triggers on MPU6050 abrupt change
- [ ] Tilt detection alert triggers on MPU6050 tilt
- [ ] Alerts appear in frontend immediately
- [ ] Base station LEDs indicate alert status
- [ ] Alert acknowledgment works

## Production Readiness

- [ ] Default password changed
- [ ] API_KEY changed from default
- [ ] JWT_SECRET changed from default
- [ ] HTTPS configured (if deploying)
- [ ] Database backups configured
- [ ] Monitoring/logging set up
- [ ] Error handling verified

## Documentation

- [ ] README.md reviewed
- [ ] Wiring diagrams understood
- [ ] Installation guide followed
- [ ] API documentation reviewed
- [ ] Troubleshooting guide available

## Optional Enhancements

- [ ] OTA updates implemented
- [ ] Deep sleep mode for transmitters
- [ ] Email notifications configured
- [ ] Base station AP + captive portal
- [ ] Additional sensors added
- [ ] Mobile app developed

---

## Quick Verification Commands

```bash
# Backend health
curl http://localhost:3000/health

# Test telemetry
cd tests
API_KEY=your-key node simulate_transmitter.js

# Test alerts
API_KEY=your-key node test_alert.js

# Check database
docker compose exec postgres psql -U postgres -d tree_monitor -c "SELECT COUNT(*) FROM trees;"
```

## Common Issues

If something doesn't work, check:
1. Serial Monitor for firmware errors
2. Backend logs: `docker compose logs backend`
3. Browser console for frontend errors
4. Network connectivity (Wi-Fi, IP addresses)
5. API key matching between base station and backend

See `docs/troubleshooting.md` for detailed solutions.

