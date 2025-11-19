# Troubleshooting Guide

## Firmware Issues

### Transmitter Not Sending Data

1. **Check Serial Monitor:**
   - Open Arduino IDE Serial Monitor (115200 baud)
   - Look for initialization messages
   - Check for error messages

2. **Verify nRF24L01 Connection:**
   - Ensure all pins are correctly connected
   - Check power supply (3.3V, not 5V!)
   - Verify CE and CSN pins

3. **Check Sensor Connections:**
   - DHT11: Verify DATA pin and pull-up resistor
   - MQ-2: Allow 20-30 seconds warm-up time
   - MPU6050: Check I2C connections (SCL/SDA)

4. **Verify TREE_ID:**
   - Ensure TREE_ID is set correctly (1, 2, or 3)
   - Each transmitter must have unique ID

### Base Station Not Receiving Data

1. **Check Wi-Fi Connection:**
   - Verify SSID and password in code
   - Check Serial Monitor for connection status
   - Ensure Wi-Fi signal strength is adequate

2. **Verify nRF24L01:**
   - Check that base is listening (not transmitting)
   - Verify pipe addresses match transmitters
   - Check channel number matches

3. **Check Backend Connection:**
   - Verify BACKEND_URL is correct
   - Check API_KEY matches backend
   - Test backend health endpoint: `GET /health`

4. **LED Status:**
   - LEDs should indicate tree status
   - Green/ON = OK, Red/Blinking = Alert
   - No LED = No data received

## Backend Issues

### Database Connection Errors

1. **Check PostgreSQL:**
   ```bash
   docker compose ps
   docker compose logs postgres
   ```

2. **Verify Environment Variables:**
   - Check `.env` file exists
   - Verify DB credentials match docker compose.yml

3. **Run Migration:**
   ```bash
   cd backend
   npm run migrate
   ```

### API Not Receiving Telemetry

1. **Check API Key:**
   - Verify `X-API-Key` header matches backend `.env`
   - Check base station firmware has correct API_KEY

2. **Test Endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/telemetry \
     -H "Content-Type: application/json" \
     -H "X-API-Key: your-secret-api-key-here" \
     -d '{"tree_id":1,"timestamp":1699999999,"temp_c":25.0,"humidity_pct":60.0,"mq2":100,"status":"ok"}'
   ```

3. **Check Logs:**
   ```bash
   docker compose logs backend
   ```

### Authentication Issues

1. **Default Credentials:**
   - Username: `admin`
   - Password: `admin123`
   - ⚠️ Change in production!

2. **JWT Token:**
   - Check token in browser localStorage
   - Verify JWT_SECRET in backend `.env`

## Frontend Issues

### Cannot Login

1. **Check Backend:**
   - Verify backend is running
   - Check API URL in `next.config.js`
   - Test login endpoint directly

2. **Browser Console:**
   - Open DevTools (F12)
   - Check for CORS errors
   - Verify network requests

### Real-time Updates Not Working

1. **Check Socket.IO:**
   - Verify Socket.IO connection in browser console
   - Check backend Socket.IO logs
   - Ensure CORS is configured correctly

2. **Verify Token:**
   - Check if token is valid
   - Re-login if token expired

### Charts Not Displaying

1. **Check Data:**
   - Verify telemetry data exists in database
   - Check time range filter
   - Ensure data format is correct

2. **Browser Console:**
   - Check for JavaScript errors
   - Verify Recharts library loaded

## Network Issues

### Base Station Cannot Reach Backend

1. **Check IP Address:**
   - Verify backend IP is correct
   - Use `ifconfig` or `ipconfig` to find IP
   - Ensure base station and backend on same network

2. **Firewall:**
   - Check if port 3000 is open
   - Verify firewall rules

3. **Test Connection:**
   - Use base station Serial Monitor
   - Check HTTP response codes
   - Verify backend health endpoint

## Common Solutions

### Reset Everything

1. **Backend:**
   ```bash
   cd backend
   docker compose down -v
   docker compose up -d
   npm run migrate
   ```

2. **Frontend:**
   ```bash
   cd frontend
   rm -rf .next
   npm run dev
   ```

3. **Firmware:**
   - Re-upload firmware to ESP8266
   - Check all connections
   - Verify configuration constants

### Debug Mode

Enable verbose logging:
- **Firmware:** Serial Monitor at 115200 baud
- **Backend:** Check console logs
- **Frontend:** Browser DevTools console

### Still Having Issues?

1. Check all wiring connections
2. Verify power supply stability
3. Test components individually
4. Review error messages in Serial Monitor/Logs
5. Ensure all libraries are installed correctly

