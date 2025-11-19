/*
 * Sensor Test Script for ESP8266
 * Tests DHT11 and MQ-2 sensors independently
 * Upload this to ESP8266 to verify sensors are working
 */

#include <DHT.h>

// Sensor Pin Configuration
#define DHT_PIN D3
#define DHT_TYPE DHT11
#define MQ2_PIN A0

// Timing
#define READ_INTERVAL_MS 2000  // Read every 2 seconds

// Thresholds
#define MQ2_ALERT_THRESHOLD 400

// ==================== GLOBAL OBJECTS ====================
DHT dht(DHT_PIN, DHT_TYPE);

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n========================================");
  Serial.println("   Sensor Test - DHT11 & MQ-2");
  Serial.println("========================================\n");
  
  // Initialize DHT11
  dht.begin();
  Serial.println("DHT11 initialized");
  
  // Initialize MQ-2
  pinMode(MQ2_PIN, INPUT);
  Serial.println("MQ-2 initialized");
  
  Serial.println("\nStarting sensor readings...\n");
  Serial.println("Time\t\tTemp(°C)\tHumidity(%)\tMQ-2(Raw)\tMQ-2(Status)");
  Serial.println("----------------------------------------------------------------");
}

// ==================== MAIN LOOP ====================
void loop() {
  unsigned long currentTime = millis();
  static unsigned long lastReadTime = 0;
  
  if (currentTime - lastReadTime >= READ_INTERVAL_MS) {
    lastReadTime = currentTime;
    
    // Read DHT11
    float temp = dht.readTemperature();
    float humidity = dht.readHumidity();
    
    // Check if DHT11 reading is valid
    bool dhtValid = !isnan(temp) && !isnan(humidity);
    
    // Read MQ-2
    int mq2Value = analogRead(MQ2_PIN);
    bool mq2Alert = (mq2Value > MQ2_ALERT_THRESHOLD);
    
    // Print timestamp
    Serial.print(millis() / 1000);
    Serial.print("s\t\t");
    
    // Print DHT11 data
    if (dhtValid) {
      Serial.print(temp, 1);
      Serial.print("\t\t");
      Serial.print(humidity, 1);
      Serial.print("\t\t");
    } else {
      Serial.print("ERROR\t\tERROR\t\t");
    }
    
    // Print MQ-2 data
    Serial.print(mq2Value);
    Serial.print("\t\t");
    
    if (mq2Alert) {
      Serial.print("ALERT!");
    } else {
      Serial.print("OK");
    }
    
    Serial.println();
    
    // Additional diagnostics
    if (!dhtValid) {
      Serial.println("  ⚠️  DHT11 reading failed! Check wiring:");
      Serial.println("     - VCC -> 3.3V");
      Serial.println("     - GND -> GND");
      Serial.println("     - DATA -> D3");
      Serial.println();
    }
    
    if (mq2Value == 0 || mq2Value == 1023) {
      Serial.println("  ⚠️  MQ-2 reading suspicious! Check wiring:");
      Serial.println("     - VCC -> 5V (or 3.3V)");
      Serial.println("     - GND -> GND");
      Serial.println("     - A0 -> A0");
      Serial.println();
    }
  }
  
  delay(100);
}

