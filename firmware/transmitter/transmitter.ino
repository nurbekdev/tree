
/*
 * Smart Tree Monitoring System - Transmitter Firmware
 * ESP8266 + nRF24L01 + DHT22 + MQ-2 + MPU6050
 * 
 * Sends sensor data to base station via nRF24L01
 * Triggers immediate alert on threshold breach
 */

#include <ESP8266WiFi.h>
#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>
#include <DHT.h>
#include <Wire.h>
// MPU6050 - Using Adafruit MPU6050 library or Wire-based implementation
// If using Adafruit library: #include <Adafruit_MPU6050.h>
// For now, we'll use a simple Wire-based implementation

// ==================== CONFIGURATION ====================
#define TREE_ID 1  // Change to 1, 2, or 3 for each transmitter

// nRF24L01 Pin Configuration
#define CE_PIN D4
#define CSN_PIN D8

// Sensor Pin Configuration
#define DHT_PIN D3
#define DHT_TYPE DHT22
#define MQ2_PIN A0

// MPU6050 I2C Pins (default SCL=D1, SDA=D2 for ESP8266)

// Timing Configuration
#define SAMPLE_INTERVAL_MS 5000   // 5 seconds for real-time monitoring (critical for fire detection)
#define MQ2_ALERT_INTERVAL_MS 2000  // Send MQ2 alerts every 2 seconds if threshold exceeded
#define NRF_RETRY_DELAY_MS 50    // Reduced retry delay
#define MAX_RETRIES 3             // Reduced retries for faster failure
#define DHT_READ_DELAY_MS 2000    // DHT22 needs 2s between readings (minimum required)
#define DHT_MAX_RETRIES 1         // Only 1 retry for DHT22 (non-critical, don't block MQ2)

// Thresholds
#define MQ2_ALERT_THRESHOLD 400  // Adjust based on calibration
#define MPU_TILT_THRESHOLD 0.5   // Acceleration threshold for tilt
#define MPU_CUT_THRESHOLD 2.0    // Abrupt change threshold for cut detection

// nRF24L01 Configuration
const uint64_t BASE_PIPE = 0xF0F0F0F0E1LL;  // Base station address
const uint8_t CHANNEL = 76;  // RF channel (0-125)

// ==================== GLOBAL OBJECTS ====================
RF24 radio(CE_PIN, CSN_PIN);
DHT dht(DHT_PIN, DHT_TYPE);
// MPU6050 - Simple Wire-based implementation
const uint8_t MPU6050_ADDR = 0x68;

// ==================== STATE VARIABLES ====================
unsigned long lastSampleTime = 0;
unsigned long lastMQ2AlertTime = 0;  // Track last MQ2 alert send time
unsigned long lastDHTRead = 0;  // Track last DHT22 read time
bool alertState = false;
float lastAccel[3] = {0, 0, 0};
unsigned long lastPacketTime = 0;

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=== Tree Monitor Transmitter ===");
  Serial.print("Tree ID: ");
  Serial.println(TREE_ID);
  
  // Initialize nRF24L01
  if (!radio.begin()) {
    Serial.println("ERROR: nRF24L01 initialization failed!");
    Serial.println("Check wiring: CE->D4, CSN->D8, MOSI->D7, MISO->D6, SCK->D5");
    while(1) delay(1000);
  }
  
  // Verify chip is connected
  if (!radio.isChipConnected()) {
    Serial.println("ERROR: nRF24L01 chip not detected!");
    while(1) delay(1000);
  }
  
  radio.setChannel(CHANNEL);
  radio.setPALevel(RF24_PA_MAX);
  radio.setDataRate(RF24_250KBPS);
  radio.setRetries(15, 15);  // 15 retries, 15ms delay (more aggressive)
  radio.setAutoAck(true);  // Enable auto-ACK for reliability
  radio.enableDynamicPayloads();  // Enable dynamic payload size
  radio.setPayloadSize(32);  // Set max payload size
  radio.setCRCLength(RF24_CRC_16);  // Enable 16-bit CRC for error detection
  radio.openWritingPipe(BASE_PIPE);
  radio.stopListening();
  
  // Small delay to ensure radio is ready
  delay(10);
  
  // Print detailed radio configuration
  Serial.println("nRF24L01 Configuration:");
  Serial.print("  Channel: ");
  Serial.println(CHANNEL);
  Serial.print("  PA Level: MAX");
  Serial.println();
  Serial.print("  Data Rate: 250KBPS");
  Serial.println();
  Serial.print("  Auto ACK: Enabled");
  Serial.println();
  Serial.print("  Retries: 15 (15ms delay)");
  Serial.println();
  Serial.print("  Dynamic Payloads: Enabled");
  Serial.println();
  Serial.print("  Payload Size: 32 bytes");
  Serial.println();
  Serial.print("  Base Pipe: 0x");
  Serial.println((unsigned long)BASE_PIPE, HEX);
  
  // Test radio connection
  if (radio.isChipConnected()) {
    Serial.println("✓ nRF24L01 chip connected");
  } else {
    Serial.println("✗ ERROR: nRF24L01 chip NOT connected!");
    Serial.println("Check wiring: CE->D4, CSN->D8, MOSI->D7, MISO->D6, SCK->D5");
    Serial.println("Also check power supply (3.3V, not 5V!)");
  }
  
  // Verify radio is in TX mode
  if (radio.isPVariant()) {
    Serial.println("✓ nRF24L01+ variant detected");
  } else {
    Serial.println("⚠ nRF24L01 (non-plus) variant - may have limitations");
  }
  
  // Print radio details for debugging (optional - can be commented out)
  // radio.printDetails();
  
  // Initialize DHT22
  pinMode(DHT_PIN, INPUT_PULLUP);  // Enable internal pull-up resistor (critical for DHT22!)
  dht.begin();
  Serial.println("DHT22 initialized. Waiting 2 seconds for stabilization...");
  delay(2000);  // Wait for DHT22 to stabilize (minimum 2 seconds required)
  
  // Test DHT22 reading (try multiple times for reliability)
  float testTemp = NAN;
  float testHumidity = NAN;
  Serial.println("Testing DHT22 sensor...");
  
  for (int i = 0; i < 5; i++) {
    testTemp = dht.readTemperature();
    testHumidity = dht.readHumidity();
    
    // Check if readings are valid
    if (!isnan(testTemp) && !isnan(testHumidity) && 
        testTemp >= -40 && testTemp <= 80 && 
        testHumidity >= 0 && testHumidity <= 100) {
      Serial.print("✓ DHT22 test OK (attempt ");
      Serial.print(i + 1);
      Serial.print("): Temp=");
      Serial.print(testTemp, 1);
      Serial.print("°C, Humidity=");
      Serial.print(testHumidity, 1);
      Serial.println("%");
      break;  // Got valid reading
    } else {
      Serial.print("⚠ DHT22 test attempt ");
      Serial.print(i + 1);
      Serial.println(" failed, retrying...");
      delay(500);  // Wait before retry
    }
  }
  
  if (isnan(testTemp) || isnan(testHumidity)) {
    Serial.println("❌ WARNING: DHT22 initial test failed after 5 attempts!");
    Serial.println("Check wiring: DHT22 data pin -> D3, VCC -> 3.3V, GND -> GND");
    Serial.println("Also ensure a 4.7k-10k pull-up resistor between data pin and VCC");
    Serial.println("DHT22 requires stable power supply and proper wiring");
  }
  
  // Initialize MPU6050
  Wire.begin();
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(0x6B); // PWR_MGMT_1 register
  Wire.write(0);    // Wake up MPU6050
  if (Wire.endTransmission() == 0) {
    Serial.println("MPU6050 initialized");
  } else {
    Serial.println("WARNING: MPU6050 initialization failed!");
  }
  
  // Initialize MQ-2
  pinMode(MQ2_PIN, INPUT);
  Serial.println("MQ-2 initialized");
  
  Serial.println("Setup complete. Starting monitoring...\n");
  lastSampleTime = millis();
  lastDHTRead = millis() - DHT_READ_DELAY_MS;  // Allow immediate first DHT22 read
}

// ==================== MAIN LOOP ====================
void loop() {
  unsigned long currentTime = millis();
  
  // Check if it's time to sample or if we need to send alert immediately
  bool shouldSample = (currentTime - lastSampleTime >= SAMPLE_INTERVAL_MS);
  bool shouldSendAlert = false;
  
  // CRITICAL: Read MQ2 first (fire detection - highest priority!)
  int mq2Value = analogRead(MQ2_PIN);
  
  // Read DHT22 sensor (simple and reliable approach - based on working code)
  // DHT22 is more accurate than DHT11 (0.1°C and 0.1% precision)
  static float lastValidTemp = NAN;
  static float lastValidHumidity = NAN;
  float temp = NAN;
  float humidity = NAN;
  
  // Only read DHT22 if enough time has passed (2 seconds minimum for DHT22)
  if (currentTime - lastDHTRead >= DHT_READ_DELAY_MS) {
    // Read DHT22 sensor directly (exactly like working code)
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    lastDHTRead = currentTime;
    
    // Check if readings are valid (exactly like working code)
    if (isnan(h) || isnan(t)) {
      // If NaN, readings are invalid - use last valid values
      temp = lastValidTemp;
      humidity = lastValidHumidity;
    } else {
      // Validate temperature - DHT22 range: -40°C to 80°C
      if (t < -40 || t > 80) {
        // Out of range - use last valid value
        temp = lastValidTemp;
      } else {
        temp = t;
        lastValidTemp = temp;  // Store valid reading
      }
      
      // Validate humidity - DHT22 range: 0-100%
      if (h < 0 || h > 100) {
        // Out of range - use last valid value
        humidity = lastValidHumidity;
      } else {
        humidity = h;
        lastValidHumidity = humidity;  // Store valid reading
      }
    }
  } else {
    // Use last valid readings if available (within 2 second window)
    if (!isnan(lastValidTemp)) {
      temp = lastValidTemp;
    }
    if (!isnan(lastValidHumidity)) {
      humidity = lastValidHumidity;
    }
  }
  
  // Read MPU6050
  float accelX = 0, accelY = 0, accelZ = 0;
  float gyroX = 0, gyroY = 0, gyroZ = 0;
  bool mpuOk = readMPU6050(&accelX, &accelY, &accelZ, &gyroX, &gyroY, &gyroZ);
  
  // Detect alert conditions (MQ2 is CRITICAL for fire detection!)
  bool smokeAlert = (mq2Value > MQ2_ALERT_THRESHOLD);
  bool tiltDetected = false;
  bool cutDetected = false;
  
  if (mpuOk) {
    // Calculate tilt (deviation from vertical)
    float accelMagnitude = sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ);
    
    // Check for tilt (if not close to 1g vertical)
    if (abs(accelMagnitude - 9.8) > MPU_TILT_THRESHOLD) {
      tiltDetected = true;
    }
    
    // Check for abrupt cut (sudden change in acceleration)
    if (lastPacketTime > 0) {
      float accelChange = sqrt(
        pow(accelX - lastAccel[0], 2) +
        pow(accelY - lastAccel[1], 2) +
        pow(accelZ - lastAccel[2], 2)
      );
      
      if (accelChange > MPU_CUT_THRESHOLD) {
        cutDetected = true;
      }
    }
    
    // Store current acceleration for next comparison
    lastAccel[0] = accelX;
    lastAccel[1] = accelY;
    lastAccel[2] = accelZ;
  }
  
  // Determine if alert should be sent immediately
  bool currentAlertState = (smokeAlert || cutDetected);
  
  // CRITICAL: If MQ2 alert, send immediately (don't wait for sample interval)
  bool shouldSendMQ2Alert = smokeAlert && (currentTime - lastMQ2AlertTime >= MQ2_ALERT_INTERVAL_MS);
  
  // Debug: Print sensor readings to Serial Monitor (only for regular samples, not MQ2 alerts)
  if (shouldSample && !shouldSendMQ2Alert) {
    Serial.print("Sensors: Temp=");
    if (isnan(temp)) {
      Serial.print("NULL");
    } else {
      Serial.print(temp, 1);
    }
    Serial.print("°C, Humidity=");
    if (isnan(humidity)) {
      Serial.print("NULL");
    } else {
      Serial.print(humidity, 1);
    }
    Serial.print("%, MQ2=");
    Serial.print(mq2Value);
    Serial.print(" PPM");
    Serial.print(" (DHT last read: ");
    Serial.print((currentTime - lastDHTRead) / 1000);
    Serial.println("s ago)");
  }
  
  // Always print MQ2 alerts
  if (smokeAlert && shouldSendMQ2Alert) {
    Serial.print("🔥🔥🔥 FIRE DETECTED! MQ2=");
    Serial.print(mq2Value);
    Serial.println(" PPM - Sending alert immediately!");
  }
  
  if (currentAlertState && !alertState) {
    // New alert condition
    shouldSendAlert = true;
    alertState = true;
  } else if (!currentAlertState && alertState) {
    // Alert cleared
    alertState = false;
  }
  
  // Send data if:
  // 1. It's time for regular sample, OR
  // 2. Alert occurred, OR
  // 3. MQ2 alert (fire detection - highest priority!)
  if (shouldSample || shouldSendAlert || shouldSendMQ2Alert) {
    // Build JSON payload
    String payload = buildPayload(
      temp, humidity, mq2Value,
      mpuOk ? accelX : 0, mpuOk ? accelY : 0, mpuOk ? accelZ : 0,
      mpuOk ? gyroX : 0, mpuOk ? gyroY : 0, mpuOk ? gyroZ : 0,
      tiltDetected, cutDetected,
      currentAlertState
    );
    
    // Send via nRF24L01 with retry logic
    bool sent = sendPacket(payload);
    
    if (sent) {
      if (shouldSendMQ2Alert) {
        Serial.print("🔥 FIRE ALERT sent: ");
        lastMQ2AlertTime = currentTime;
      } else {
        Serial.print("Packet sent: ");
      }
      Serial.println(payload);
      lastPacketTime = currentTime;
    } else {
      if (shouldSendMQ2Alert) {
        Serial.println("⚠️ CRITICAL: Failed to send FIRE ALERT!");
      } else {
        Serial.println("ERROR: Failed to send packet after retries");
      }
    }
    
    // Only update lastSampleTime for regular samples (not MQ2 alerts)
    if (shouldSample) {
      lastSampleTime = currentTime;
    }
  }
  
  delay(10);  // Minimal delay for fastest loop (critical for fire detection)
}

// ==================== HELPER FUNCTIONS ====================
bool readMPU6050(float* accelX, float* accelY, float* accelZ, 
                 float* gyroX, float* gyroY, float* gyroZ) {
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(0x3B); // Start reading from ACCEL_XOUT_H register
  if (Wire.endTransmission() != 0) {
    return false;
  }
  
  Wire.requestFrom((uint8_t)MPU6050_ADDR, (uint8_t)14, (uint8_t)true); // Read 14 bytes
  
  if (Wire.available() < 14) {
    return false;
  }
  
  // Read accelerometer data (2 bytes each, big-endian)
  int16_t accelX_raw = (Wire.read() << 8) | Wire.read();
  int16_t accelY_raw = (Wire.read() << 8) | Wire.read();
  int16_t accelZ_raw = (Wire.read() << 8) | Wire.read();
  Wire.read(); // Skip temperature
  Wire.read();
  // Read gyroscope data
  int16_t gyroX_raw = (Wire.read() << 8) | Wire.read();
  int16_t gyroY_raw = (Wire.read() << 8) | Wire.read();
  int16_t gyroZ_raw = (Wire.read() << 8) | Wire.read();
  
  // Convert to g and deg/s (assuming ±2g range and ±250deg/s range)
  *accelX = accelX_raw / 16384.0;
  *accelY = accelY_raw / 16384.0;
  *accelZ = accelZ_raw / 16384.0;
  *gyroX = gyroX_raw / 131.0;
  *gyroY = gyroY_raw / 131.0;
  *gyroZ = gyroZ_raw / 131.0;
  
  return true;
}

String buildPayload(float temp, float humidity, int mq2Value,
                   float accelX, float accelY, float accelZ,
                   float gyroX, float gyroY, float gyroZ,
                   bool tilt, bool cut, bool alert) {
  // Build ultra-compact JSON payload (must fit in 32 bytes for nRF24L01)
  // Format: {t:1,T:25,H:50,M:120,A:0,C:123} - without quotes, integer values (no decimals)
  // Removed timestamp and decimals to save space - backend will add timestamp
  
  // Build compact JSON without quotes (saves ~14 bytes)
  String json = "{";
  json += "t:" + String(TREE_ID) + ",";  // tree_id -> t (2-3 bytes)
  
  // Temperature as integer (or null indicator) - saves 2 bytes vs decimal
  if (isnan(temp) || isinf(temp)) {
    json += "T:n,";  // null indicator for temperature
  } else {
    // Clamp and convert to integer (round to nearest)
    if (temp < -40) temp = -40;
    if (temp > 80) temp = 80;
    int tempInt = (int)(temp + 0.5);  // Round to nearest integer
    json += "T:" + String(tempInt) + ",";  // temp_c -> T (3-5 bytes as integer)
  }
  
  // Humidity as integer (or null indicator) - saves 2 bytes vs decimal
  if (isnan(humidity) || isinf(humidity)) {
    json += "H:n,";  // null indicator for humidity
  } else {
    // Clamp and convert to integer (round to nearest)
    if (humidity < 0) humidity = 0;
    if (humidity > 100) humidity = 100;
    int humidityInt = (int)(humidity + 0.5);  // Round to nearest integer
    json += "H:" + String(humidityInt) + ",";  // humidity_pct -> H (3-5 bytes as integer)
  }
  
  json += "M:" + String(mq2Value) + ",";  // mq2 -> M (3-5 bytes)
  json += "A:" + String(alert ? 1 : 0);  // alert status -> A (2 bytes)
  
  // Calculate CRC8 (simpler than CRC16, saves 2-3 bytes)
  uint8_t crc = calculateCRC8(json);
  json += ",C:" + String(crc);  // crc -> C (3-5 bytes)
  json += "}";
  
  // Debug: Print payload size
  Serial.print("Payload size: ");
  Serial.print(json.length());
  Serial.print(" bytes: ");
  Serial.println(json);
  
  // Verify payload size
  if (json.length() > 32) {
    Serial.print("ERROR: Payload too large! ");
    Serial.print(json.length());
    Serial.println(" bytes");
    Serial.print("Payload: ");
    Serial.println(json);
  }
  
  return json;
}

uint8_t calculateCRC8(String data) {
  // Simple CRC8 calculation (saves space vs CRC16)
  uint8_t crc = 0;
  for (size_t i = 0; i < data.length(); i++) {
    crc ^= (uint8_t)data[i];
    for (int j = 0; j < 8; j++) {
      if (crc & 0x80) {
        crc = (crc << 1) ^ 0x07;
      } else {
        crc <<= 1;
      }
    }
  }
  return crc;
}

bool sendPacket(String payload) {
  // nRF24L01 has 32-byte payload limit
  // Check payload size
  if (payload.length() > 31) {
    Serial.print("ERROR: Payload too large (");
    Serial.print(payload.length());
    Serial.println(" bytes), cannot send!");
    Serial.print("Payload: ");
    Serial.println(payload);
    return false;  // Don't send truncated packets
  }
  
  char buffer[32];
  size_t len = payload.length();
  payload.toCharArray(buffer, 32);
  
  Serial.print("Sending packet (");
  Serial.print(len);
  Serial.print(" bytes): ");
  Serial.println(buffer);
  
  // Check radio status
  if (!radio.isChipConnected()) {
    Serial.println("ERROR: nRF24L01 not connected!");
    return false;
  }
  
  // Ensure radio is in TX mode (not listening)
  radio.stopListening();
  delay(1);  // Give radio time to switch to TX mode (1ms delay)
  
  // Verify radio is ready
  if (!radio.isChipConnected()) {
    Serial.println("ERROR: nRF24L01 not connected during send!");
    return false;
  }
  
  // Print debug info before sending
  Serial.print("Attempting to send to pipe 0x");
  Serial.print((unsigned long)BASE_PIPE, HEX);
  Serial.print(" on channel ");
  Serial.print(CHANNEL);
  Serial.println("...");
  
  // Try sending with optimized retries
  for (int attempt = 0; attempt < MAX_RETRIES; attempt++) {
    // Write packet (blocking call, waits for ACK if auto-ack enabled)
    bool result = radio.write(buffer, len);
    
    if (result) {
      // Success - write() returns true if packet was sent and ACK received
      if (attempt > 0) {
        Serial.print("✓ Packet sent successfully after ");
        Serial.print(attempt + 1);
        Serial.println(" attempts");
      }
      return true;
    } else {
      // Check radio status first
      if (!radio.isChipConnected()) {
        Serial.println("✗ Radio disconnected!");
        return false;
      }
      
      // Only print detailed error on last attempt
      if (attempt == MAX_RETRIES - 1) {
        Serial.print("✗ Retry ");
        Serial.print(attempt + 1);
        Serial.print("/");
        Serial.print(MAX_RETRIES);
        Serial.println(" failed");
      }
      
      // Wait before retry (shorter delay for speed)
      if (attempt < MAX_RETRIES - 1) {
        delay(NRF_RETRY_DELAY_MS);
      }
    }
  }
  
  Serial.println("ERROR: Failed to send packet after all retries");
  Serial.print("Radio status - Connected: ");
  Serial.print(radio.isChipConnected() ? "YES" : "NO");
  Serial.print(", Available: ");
  Serial.println(radio.available() ? "YES" : "NO");
  return false;
}

