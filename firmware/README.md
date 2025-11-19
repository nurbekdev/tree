# Firmware Documentation

## Required Libraries

Install these libraries in Arduino IDE via **Sketch → Include Library → Manage Libraries**:

1. **RF24** by TMRh20
   - Note: For ESP8266, you may need a modified version
   - Alternative: Search for "RF24 ESP8266" compatible versions
   - GitHub: https://github.com/nRF24/RF24

2. **DHT sensor library** by Adafruit
   - Also install **Adafruit Unified Sensor** (dependency)

3. **MPU6050** library
   - Options:
     - **MPU6050** by Electronic Cats
     - **MPU6050_light** by rfetick
   - Both work well with ESP8266

4. **ArduinoJson** by Benoit Blanchon
   - Version 6.x recommended

## Board Configuration

1. **Install ESP8266 Board Support:**
   - File → Preferences
   - Additional Board Manager URLs: `http://arduino.esp8266.com/stable/package_esp8266com_index.json`
   - Tools → Board → Boards Manager
   - Search "ESP8266" and install

2. **Select Board:**
   - Tools → Board → NodeMCU 1.0 (ESP-12E Module)
   - Or: WeMos D1 R2 & mini

3. **Port:**
   - Tools → Port → Select your ESP8266 port

## Upload Settings

- **Upload Speed:** 115200 (or 921600 for faster uploads)
- **CPU Frequency:** 80 MHz
- **Flash Size:** 4MB (FS:2MB OTA:~1019KB)
- **Debug Level:** None (or Core for debugging)

## Troubleshooting

### nRF24L01 Not Working on ESP8266

The standard RF24 library may have issues with ESP8266. Solutions:

1. **Use ESP8266-Compatible Version:**
   - Search for "RF24 ESP8266" in Library Manager
   - Or manually install: https://github.com/nRF24/RF24/tree/master/examples/ESP8266

2. **Check SPI Pins:**
   - ESP8266 uses different default SPI pins
   - Verify pin assignments in code match your board

3. **Power Supply:**
   - nRF24L01 requires stable 3.3V
   - Add 10µF capacitor near VCC pin
   - Use separate 3.3V regulator if needed

### DHT11 Reading Errors

1. **Add Pull-up Resistor:**
   - 10kΩ between DATA and VCC
   - Some modules have built-in pull-up

2. **Timing:**
   - Wait 2 seconds between readings
   - DHT11 needs time to stabilize

3. **Wiring:**
   - Verify DATA pin connection
   - Check for loose connections

### MPU6050 Not Detected

1. **I2C Address:**
   - Default: 0x68
   - Some modules use 0x69
   - Check library initialization

2. **Wiring:**
   - SCL → D1
   - SDA → D2
   - Verify I2C connections

3. **Power:**
   - Ensure 3.3V power supply
   - Check for voltage drops

## Configuration

### Transmitter

Edit these constants in `transmitter.ino`:

```cpp
#define TREE_ID 1  // Change for each transmitter (1, 2, or 3)
#define SAMPLE_INTERVAL_MS 30000  // Sampling interval
#define MQ2_ALERT_THRESHOLD 400  // Smoke alert threshold
#define MPU_TILT_THRESHOLD 0.5  // Tilt detection sensitivity
#define MPU_CUT_THRESHOLD 2.0  // Cut detection sensitivity
```

### Base Station

Edit these constants in `base_station.ino`:

```cpp
const char* WIFI_SSID = "YourWiFiName";
const char* WIFI_PASSWORD = "YourWiFiPassword";
const char* BACKEND_URL = "http://192.168.1.100:3000";
const char* API_KEY = "your-secret-api-key-here";
```

## Testing

1. **Serial Monitor:**
   - Open Serial Monitor (115200 baud)
   - Check for initialization messages
   - Monitor data transmission

2. **Verify nRF24L01:**
   - Base station should show "Received from Tree X"
   - Transmitter should show "Packet sent"

3. **Check Backend:**
   - Verify HTTP POST requests in Serial Monitor
   - Check backend logs for received telemetry

## Power Consumption

### Continuous Mode (Default)
- Transmitter: ~80-150mA
- Base Station: ~100-200mA (with Wi-Fi)

### Deep Sleep Mode (Optional)
- Transmitter: ~10-20µA (sleep) + ~80mA (active)
- Can extend battery life significantly
- Note: Real-time alerts may be delayed

## OTA Updates (Optional)

To enable OTA updates:

1. Install **ArduinoOTA** library
2. Add OTA code to setup() and loop()
3. Upload initial firmware via USB
4. Future updates can be done wirelessly

See ESP8266 OTA examples for implementation.

