/*
 * Smart Tree Monitoring System - Base Station Firmware
 * ESP8266 + nRF24L01
 * 
 * Receives data from transmitters and forwards to backend API
 * Controls LEDs to indicate tree status
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>
#include <ArduinoJson.h>

// ==================== CONFIGURATION ====================
// Wi-Fi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Backend API Configuration
// NOTE: Use your computer's local IP address (not localhost!)
// Find your IP: On Mac/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
//                On Windows: ipconfig (look for IPv4 Address)
// IMPORTANT: Update this IP when your network changes!
const char* BACKEND_URL = "http://192.168.3.130:3000";
const char* API_KEY = "26a826cbadeb499a604e69cbb34c3d6b84edb23e2bacc282732db8f576255af0";  // Must match backend .env file

// nRF24L01 Pin Configuration
#define CE_PIN D4
#define CSN_PIN D8

// LED Pin Configuration (one per tree)
#define LED_TREE1 D1
#define LED_TREE2 D2
#define LED_TREE3 D3

// nRF24L01 Configuration
// All transmitters use the same pipe address
const uint64_t BASE_PIPE = 0xF0F0F0F0E1LL;  // Same as transmitter
const uint8_t CHANNEL = 76;

// Timing Configuration
#define LED_BLINK_INTERVAL_MS 500
#define BACKEND_RETRY_DELAY_MS 1000
#define MAX_BUFFER_SIZE 10

// ==================== GLOBAL OBJECTS ====================
RF24 radio(CE_PIN, CSN_PIN);
WiFiClient wifiClient;

// ==================== STATE VARIABLES ====================
struct TreeState {
  bool hasData;
  unsigned long lastSeen;
  String lastStatus;  // "ok" or "alert"
  unsigned long lastLedUpdate;
  bool ledState;
};

TreeState treeStates[3] = {
  {false, 0, "ok", 0, false},
  {false, 0, "ok", 0, false},
  {false, 0, "ok", 0, false}
};

// Message buffer for backend failures
struct BufferedMessage {
  String payload;
  unsigned long timestamp;
};

BufferedMessage messageBuffer[MAX_BUFFER_SIZE];
int bufferHead = 0;
int bufferTail = 0;
int bufferCount = 0;

// ==================== FUNCTION DECLARATIONS ====================
// Forward declarations to avoid compilation errors
int extractTreeId(String payload);
void processPacket(String rawPayload, int treeIndex);
String buildBackendPayload(DynamicJsonDocument& doc, int treeId, float temp, float humidity, int mq2, String status,
                            float mpu_accel_x, float mpu_accel_y, float mpu_accel_z,
                            float mpu_gyro_x, float mpu_gyro_y, float mpu_gyro_z,
                            bool mpu_tilt, bool mpu_cut_detected);
uint8_t calculateCRC8(String data);
bool sendToBackend(String payload);
void bufferMessage(String payload);
void processMessageBuffer();
void printTreeStatus();
void updateLEDs();

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=== Tree Monitor Base Station ===");
  
  // Initialize LEDs
  pinMode(LED_TREE1, OUTPUT);
  pinMode(LED_TREE2, OUTPUT);
  pinMode(LED_TREE3, OUTPUT);
  digitalWrite(LED_TREE1, LOW);
  digitalWrite(LED_TREE2, LOW);
  digitalWrite(LED_TREE3, LOW);
  
  // Initialize nRF24L01
  if (!radio.begin()) {
    Serial.println("ERROR: nRF24L01 initialization failed!");
    while(1) delay(1000);
  }
  
  // Verify chip is connected
  if (!radio.isChipConnected()) {
    Serial.println("ERROR: nRF24L01 chip not detected!");
    Serial.println("Check wiring: CE->D4, CSN->D8, MOSI->D7, MISO->D6, SCK->D5");
    while(1) delay(1000);
  }
  
  // Configure nRF24L01 - MUST match transmitter settings exactly!
  radio.setChannel(CHANNEL);
  radio.setPALevel(RF24_PA_MAX);  // Must match transmitter
  radio.setDataRate(RF24_250KBPS);  // Must match transmitter
  radio.setAutoAck(true);  // Enable auto-ACK for reliability
  radio.setRetries(15, 15);  // Must match transmitter (15 retries, 15ms delay)
  radio.enableDynamicPayloads();  // Enable dynamic payload size
  radio.setPayloadSize(32);  // Set max payload size (must match transmitter)
  radio.setCRCLength(RF24_CRC_16);  // Enable 16-bit CRC for error detection (must match transmitter)
  
  // Open reading pipe (all transmitters use same pipe)
  // Pipe 0 is used for writing (ACK), pipe 1 is used for reading
  radio.openReadingPipe(1, BASE_PIPE);
  
  // Also open pipe 0 for ACK payloads (optional, but helps with reliability)
  radio.openReadingPipe(0, BASE_PIPE);
  
  radio.startListening();
  
  // Small delay to ensure radio is ready
  delay(10);
  
  // Print detailed radio configuration for debugging
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
  Serial.println("nRF24L01 initialized and listening");
  Serial.print("Channel: ");
  Serial.println(CHANNEL);
  Serial.print("Base Pipe: 0x");
  Serial.println((unsigned long)BASE_PIPE, HEX);
  Serial.print("Listening on pipes: 0, 1");
  Serial.println();
  Serial.println("Ready to receive packets...");
  
  // Connect to Wi-Fi
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  
  int wifiTimeout = 0;
  while (WiFi.status() != WL_CONNECTED && wifiTimeout < 30) {
    delay(500);
    Serial.print(".");
    wifiTimeout++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWi-Fi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nERROR: Wi-Fi connection failed!");
  }
  
  Serial.println("Setup complete.\n");
  Serial.println("=== Waiting for transmitter connections ===");
  Serial.println("Tree IDs: 1, 2, 3");
  Serial.println("Status will be shown when data is received.\n");
}

// ==================== MAIN LOOP ====================
void loop() {
  // Radio should always be in listening mode (set in setup)
  // Note: RF24 library doesn't have isListening() method on ESP8266
  // We ensure it's listening by calling startListening() in setup
  
  // Check for incoming nRF24L01 packets
  if (radio.available()) {
    // Get which pipe received the data (for debugging)
    uint8_t pipe;
    if (radio.available(&pipe)) {
      Serial.print("✓ Data available on pipe ");
      Serial.println(pipe);
    }
    
    char buffer[32] = {0};
    uint8_t bytesRead = radio.getDynamicPayloadSize();
    if (bytesRead == 0) {
      bytesRead = 32;  // Fallback if dynamic payload not available
      Serial.println("⚠ WARNING: Dynamic payload size not available, using 32 bytes");
    }
    
    Serial.print("Reading ");
    Serial.print(bytesRead);
    Serial.println(" bytes from radio...");
    
    radio.read(buffer, min(bytesRead, (uint8_t)32));
    
    // Parse tree_id from packet to determine tree index
    String payload = String(buffer);
    payload.trim();  // Remove any trailing nulls/whitespace
    
    Serial.print("✓ Received raw packet (");
    Serial.print(payload.length());
    Serial.print(" bytes): ");
    Serial.println(payload);
    
    // Extract tree_id using improved function
    int treeId = extractTreeId(payload);
    
    Serial.print("Extracted tree_id: ");
    Serial.println(treeId);
    
    if (treeId >= 1 && treeId <= 3) {
      int treeIndex = treeId - 1;  // Convert to 0-based index
      processPacket(payload, treeIndex);
    } else {
      Serial.print("ERROR: Invalid tree_id extracted: ");
      Serial.println(treeId);
      Serial.print("Payload: ");
      Serial.println(payload);
      Serial.println("Trying manual extraction...");
      
      // Try manual extraction as fallback - new format first: t2
      int tPos = payload.indexOf("{t");
      if (tPos != -1) {
        tPos += 2;  // Skip "{t"
        int tEnd = payload.indexOf('T', tPos);
        if (tEnd == -1) tEnd = payload.indexOf('H', tPos);
        if (tEnd == -1) tEnd = payload.indexOf('M', tPos);
        if (tEnd == -1) tEnd = payload.indexOf('P', tPos);
        if (tEnd == -1) tEnd = payload.indexOf('A', tPos);
        if (tEnd == -1) tEnd = payload.indexOf('C', tPos);
        if (tEnd == -1) tEnd = payload.indexOf('}', tPos);
        if (tEnd > tPos) {
          String treeIdStr = payload.substring(tPos, tEnd);
          treeId = treeIdStr.toInt();
          Serial.print("Manual extraction result (new format): ");
          Serial.println(treeId);
        }
      } else {
        // Try old format: t:2
        tPos = payload.indexOf("t:");
        if (tPos != -1) {
          int tEnd = payload.indexOf(',', tPos);
          if (tEnd == -1) tEnd = payload.indexOf('}', tPos);
          if (tEnd > tPos) {
            String treeIdStr = payload.substring(tPos + 2, tEnd);
            treeId = treeIdStr.toInt();
            Serial.print("Manual extraction result (old format): ");
            Serial.println(treeId);
          }
        }
      }
      
      if (treeId >= 1 && treeId <= 3) {
        int treeIndex = treeId - 1;
        processPacket(payload, treeIndex);
      }
    }
  }
  
  // Update LEDs
  updateLEDs();
  
  // Try to send buffered messages to backend
  processMessageBuffer();
  
  // Print status every 30 seconds
  static unsigned long lastStatusPrint = 0;
  unsigned long currentTime = millis();
  if (currentTime - lastStatusPrint > 30000) {  // Every 30 seconds
    printTreeStatus();
    lastStatusPrint = currentTime;
  }
  
  delay(5);  // Reduced delay for faster processing
}

// ==================== HELPER FUNCTIONS ====================
int extractTreeId(String payload) {
  // Extract tree_id from compact JSON format
  // Try new ultra-compact format first (without colon): tID
  int startIdx = payload.indexOf("{t");
  if (startIdx != -1) {
    startIdx += 2;  // Length of "{t"
    // Find end - next field (T, H, M, P, A, C) or }
    int endIdx = payload.indexOf('T', startIdx);
    if (endIdx == -1) endIdx = payload.indexOf('H', startIdx);
    if (endIdx == -1) endIdx = payload.indexOf('M', startIdx);
    if (endIdx == -1) endIdx = payload.indexOf('P', startIdx);
    if (endIdx == -1) endIdx = payload.indexOf('A', startIdx);
    if (endIdx == -1) endIdx = payload.indexOf('C', startIdx);
    if (endIdx == -1) endIdx = payload.indexOf('}', startIdx);
    
    if (endIdx > startIdx) {
      String treeIdStr = payload.substring(startIdx, endIdx);
      treeIdStr.trim();
      int treeId = treeIdStr.toInt();
      if (treeId > 0 && treeId <= 3) {
        return treeId;
      }
    }
  }
  
  // Try old compact format (with colon): t:ID
  startIdx = payload.indexOf("t:");
  if (startIdx != -1) {
    startIdx += 2;  // Length of "t:"
    int endIdx = payload.indexOf(',', startIdx);
    if (endIdx == -1) endIdx = payload.indexOf('}', startIdx);
    
    if (endIdx > startIdx) {
      String treeIdStr = payload.substring(startIdx, endIdx);
      treeIdStr.trim();
      int treeId = treeIdStr.toInt();
      if (treeId > 0) {
        return treeId;
      }
    }
  }
  
  // Try standard format with quotes: "t":ID
  startIdx = payload.indexOf("\"t\":");
  if (startIdx != -1) {
    startIdx += 4;  // Length of "\"t\":":
    int endIdx = payload.indexOf(',', startIdx);
    if (endIdx == -1) endIdx = payload.indexOf('}', startIdx);
    
    if (endIdx > startIdx) {
      String treeIdStr = payload.substring(startIdx, endIdx);
      treeIdStr.trim();
      int treeId = treeIdStr.toInt();
      if (treeId > 0) {
        return treeId;
      }
    }
  }
  
  // Fallback to old format: "tree_id":ID
  startIdx = payload.indexOf("\"tree_id\":");
  if (startIdx != -1) {
    startIdx += 10;  // Length of "tree_id":
    int endIdx = payload.indexOf(',', startIdx);
    if (endIdx == -1) endIdx = payload.indexOf('}', startIdx);
    
    if (endIdx > startIdx) {
      String treeIdStr = payload.substring(startIdx, endIdx);
      treeIdStr.trim();
      int treeId = treeIdStr.toInt();
      if (treeId > 0) {
        return treeId;
      }
    }
  }
  
  return -1;  // Not found
}

// ==================== PACKET PROCESSING ====================
void processPacket(String rawPayload, int treeIndex) {
  Serial.print("Received from Tree ");
  Serial.print(treeIndex + 1);
  Serial.print(": ");
  Serial.println(rawPayload);
  
  // Parse JSON payload (compact format without quotes)
  // Try to parse as-is first, if fails, add quotes for standard JSON parser
  DynamicJsonDocument doc(256);
  DeserializationError error = deserializeJson(doc, rawPayload);
  
  // If parsing fails, try adding quotes (for compatibility)
  if (error && rawPayload.indexOf('"') == -1) {
    // Compact format without quotes - try manual parsing or add quotes
    String quotedPayload = rawPayload;
    quotedPayload.replace("{t:", "{\"t\":");
    quotedPayload.replace(",T:", ",\"T\":");
    quotedPayload.replace(",H:", ",\"H\":");
    quotedPayload.replace(",M:", ",\"M\":");
    quotedPayload.replace(",A:", ",\"A\":");
    quotedPayload.replace(",C:", ",\"C\":");
    error = deserializeJson(doc, quotedPayload);
  }
  
  if (error) {
    Serial.print("JSON parse error: ");
    Serial.println(error.c_str());
    Serial.print("Raw payload: ");
    Serial.println(rawPayload);
    Serial.print("Payload length: ");
    Serial.println(rawPayload.length());
    Serial.println("Attempting manual parsing...");
    // Continue with manual parsing below
  }
  
  // Validate CRC (try both "C" and "crc" formats, and compact format without quotes)
  uint8_t receivedCRC = 0;
  String jsonWithoutCRC = "";
  
  // Try new ultra-compact format first: CAB (no comma, no colon, 2 hex chars)
  int crcPos = rawPayload.lastIndexOf("C");
  if (crcPos > 0 && crcPos + 2 < rawPayload.length()) {
    // Check if it's at the end (before }) and has 2 hex chars
    if (rawPayload.charAt(crcPos + 1) != ':' && rawPayload.charAt(crcPos - 1) != ',') {
      // New format: CAB (2 hex chars directly after C, no comma/colon)
      int crcEnd = rawPayload.indexOf('}', crcPos);
      if (crcEnd > crcPos && crcEnd >= crcPos + 3) {
        String crcStr = rawPayload.substring(crcPos + 1, crcEnd);
        if (crcStr.length() >= 2) {
          receivedCRC = strtol(crcStr.c_str(), NULL, 16);  // Parse as hex
          jsonWithoutCRC = rawPayload.substring(0, crcPos);
        }
      }
    } else if (rawPayload.charAt(crcPos + 1) == ':') {
      // Old format with colon: ,C:AB or C:AB
      int crcEnd = rawPayload.indexOf('}', crcPos);
      if (crcEnd > crcPos) {
        String crcStr = rawPayload.substring(crcPos + 2, crcEnd);
        receivedCRC = strtol(crcStr.c_str(), NULL, 16);  // Parse as hex
        jsonWithoutCRC = rawPayload.substring(0, crcPos);
      }
    } else if (rawPayload.charAt(crcPos - 1) == ',') {
      // Old format with comma: ,CAB
      int crcEnd = rawPayload.indexOf('}', crcPos);
      if (crcEnd > crcPos && crcEnd >= crcPos + 3) {
        String crcStr = rawPayload.substring(crcPos + 1, crcEnd);
        receivedCRC = strtol(crcStr.c_str(), NULL, 16);  // Parse as hex
        jsonWithoutCRC = rawPayload.substring(0, crcPos - 1);  // Remove comma too
      }
    }
  }
  
  // Try old format with comma and colon: ,C:AB (if not found above)
  if (crcPos <= 0 || jsonWithoutCRC.length() == 0) {
    crcPos = rawPayload.lastIndexOf(",C:");
    if (crcPos > 0) {
      int crcEnd = rawPayload.indexOf('}', crcPos);
      if (crcEnd > crcPos) {
        String crcStr = rawPayload.substring(crcPos + 3, crcEnd);
        receivedCRC = strtol(crcStr.c_str(), NULL, 16);  // Try hex first
        if (receivedCRC == 0 && crcStr.length() > 0 && crcStr.charAt(0) != '0') {
          receivedCRC = crcStr.toInt();  // Fallback to decimal
        }
        jsonWithoutCRC = rawPayload.substring(0, crcPos);
      }
    }
  }
  
  // Try standard format with quotes: "C":123
  if (crcPos <= 0 && doc.containsKey("C")) {
    receivedCRC = doc["C"];
    crcPos = rawPayload.lastIndexOf(",\"C\"");
    if (crcPos > 0) {
      jsonWithoutCRC = rawPayload.substring(0, crcPos);
    } else {
      crcPos = rawPayload.lastIndexOf(",C:");
      if (crcPos > 0) {
        jsonWithoutCRC = rawPayload.substring(0, crcPos);
      }
    }
  }
  
  // Try old format: "crc":123
  if (crcPos <= 0 && doc.containsKey("crc")) {
    receivedCRC = doc["crc"];
    crcPos = rawPayload.lastIndexOf(",\"crc\"");
    if (crcPos > 0) {
      jsonWithoutCRC = rawPayload.substring(0, crcPos);
    }
  }
  
  if (crcPos <= 0 || jsonWithoutCRC.length() == 0) {
    Serial.println("ERROR: CRC field not found!");
    return;
  }
  
  uint8_t calculatedCRC = calculateCRC8(jsonWithoutCRC);
  
  if (receivedCRC != calculatedCRC) {
    Serial.print("ERROR: CRC mismatch! Received: ");
    Serial.print(receivedCRC);
    Serial.print(", Calculated: ");
    Serial.println(calculatedCRC);
    Serial.print("JSON without CRC: ");
    Serial.println(jsonWithoutCRC);
    return;
  }
  
  Serial.println("CRC validated successfully");
  
  // Extract data (support both compact and full formats)
  // Use extractTreeId function which handles all formats
  int treeId = extractTreeId(rawPayload);
  
  // If extractTreeId failed, try manual parsing
  if (treeId < 1 || treeId > 3) {
    Serial.println("extractTreeId failed, trying manual parsing...");
    
    // Try parsing from JSON doc first
    if (doc.containsKey("t")) {
      treeId = doc["t"].as<int>();
    } else if (doc.containsKey("tree_id")) {
      treeId = doc["tree_id"].as<int>();
    } else {
      // Manual parsing for compact format (without quotes)
      // Try new format first: t2 (no colon)
      int tPos = rawPayload.indexOf("{t");
      if (tPos != -1) {
        tPos += 2;  // Skip "{t"
        int tEnd = rawPayload.indexOf('T', tPos);
        if (tEnd == -1) tEnd = rawPayload.indexOf('H', tPos);
        if (tEnd == -1) tEnd = rawPayload.indexOf('M', tPos);
        if (tEnd == -1) tEnd = rawPayload.indexOf('P', tPos);
        if (tEnd == -1) tEnd = rawPayload.indexOf('A', tPos);
        if (tEnd == -1) tEnd = rawPayload.indexOf('C', tPos);
        if (tEnd == -1) tEnd = rawPayload.indexOf('}', tPos);
        if (tEnd > tPos) {
          String treeIdStr = rawPayload.substring(tPos, tEnd);
          treeIdStr.trim();
          treeId = treeIdStr.toInt();
          Serial.print("Manual parsing result (new format): ");
          Serial.println(treeId);
        }
      } else {
        // Try old format: t:2
        tPos = rawPayload.indexOf("t:");
        if (tPos != -1) {
          int tEnd = rawPayload.indexOf(',', tPos);
          if (tEnd == -1) tEnd = rawPayload.indexOf('}', tPos);
          if (tEnd > tPos) {
            String treeIdStr = rawPayload.substring(tPos + 2, tEnd);
            treeIdStr.trim();
            treeId = treeIdStr.toInt();
            Serial.print("Manual parsing result (old format): ");
            Serial.println(treeId);
          }
        }
      }
    }
  }
  
  if (treeId < 1 || treeId > 3) {
    Serial.print("ERROR: Invalid tree_id extracted: ");
    Serial.println(treeId);
    Serial.print("Raw payload: ");
    Serial.println(rawPayload);
    return;
  }
  
  Serial.print("Final tree_id: ");
  Serial.println(treeId);
  
  // Extract temperature (supports null indicator "n" and float values)
  float temp = NAN;  // Use NAN for null/missing values
  
  // ALWAYS use manual parsing first for compact format (more reliable)
  // Support both formats: T:23 (old) and T23 (new ultra-compact)
  int tPos = rawPayload.indexOf("T:");
  if (tPos == -1) tPos = rawPayload.indexOf("T");  // Try new format without colon
  if (tPos != -1) {
    int startOffset = (rawPayload.charAt(tPos + 1) == ':') ? 2 : 1;  // Skip T: or T
    int tEnd = rawPayload.indexOf(',', tPos + startOffset);
    if (tEnd == -1) {
      // Try finding next field (H, M, P, A, C) or end
      tEnd = rawPayload.indexOf('H', tPos + startOffset);
      if (tEnd == -1) tEnd = rawPayload.indexOf('M', tPos + startOffset);
      if (tEnd == -1) tEnd = rawPayload.indexOf('P', tPos + startOffset);
      if (tEnd == -1) tEnd = rawPayload.indexOf('A', tPos + startOffset);
      if (tEnd == -1) tEnd = rawPayload.indexOf('C', tPos + startOffset);
      if (tEnd == -1) tEnd = rawPayload.indexOf('}', tPos);
    }
    if (tEnd > tPos) {
      String tempStr = rawPayload.substring(tPos + startOffset, tEnd);
      tempStr.trim();  // Remove whitespace
      Serial.print("DEBUG: Extracted tempStr from rawPayload: '");
      Serial.print(tempStr);
      Serial.println("'");
      
      if (tempStr == "n" || tempStr.length() == 0) {
        temp = NAN;
        Serial.println("DEBUG: Manual parse - temp is NULL (n)");
      } else {
        float parsedTemp = tempStr.toFloat();
        // Check if parsing resulted in 0.0 but string wasn't "0" or "0.0"
        // This catches cases where toFloat() returns 0.0 for invalid input
        if (parsedTemp == 0.0 && tempStr != "0" && tempStr != "0.0" && tempStr != "0.00") {
          // Invalid float, treat as NAN
          temp = NAN;
          Serial.print("DEBUG: Manual parse - temp string '");
          Serial.print(tempStr);
          Serial.println("' parsed to 0.0 but is invalid, treating as NULL");
        } else {
          temp = parsedTemp;
          Serial.print("DEBUG: Manual parse - temp = ");
          Serial.println(temp);
        }
      }
    }
  } else if (doc.containsKey("T")) {
    // Fallback to JSON parsing if manual parsing didn't find T:
    // Check if it's a null indicator
    if (doc["T"].is<const char*>() && String(doc["T"].as<const char*>()) == "n") {
      temp = NAN;
      Serial.println("DEBUG: JSON parse - temp is NULL (n)");
    } else {
      temp = doc["T"].as<float>();  // Compact format: float with 1 decimal
      Serial.print("DEBUG: JSON parse - temp = ");
      Serial.println(temp);
    }
  } else if (doc.containsKey("temp_c")) {
    temp = doc["temp_c"].as<float>();  // Old format: float
    Serial.print("DEBUG: JSON parse (old format) - temp = ");
    Serial.println(temp);
  }
  
  // Extract humidity (supports null indicator "n" and float values)
  float humidity = NAN;  // Use NAN for null/missing values
  
  // ALWAYS use manual parsing first for compact format (more reliable)
  // Support both formats: H:44 (old) and H44 (new ultra-compact)
  int hPos = rawPayload.indexOf("H:");
  if (hPos == -1) hPos = rawPayload.indexOf("H");  // Try new format without colon
  if (hPos != -1) {
    int startOffset = (rawPayload.charAt(hPos + 1) == ':') ? 2 : 1;  // Skip H: or H
    int hEnd = rawPayload.indexOf(',', hPos + startOffset);
    if (hEnd == -1) {
      // Try finding next field (M, P, A, C) or end
      hEnd = rawPayload.indexOf('M', hPos + startOffset);
      if (hEnd == -1) hEnd = rawPayload.indexOf('P', hPos + startOffset);
      if (hEnd == -1) hEnd = rawPayload.indexOf('A', hPos + startOffset);
      if (hEnd == -1) hEnd = rawPayload.indexOf('C', hPos + startOffset);
      if (hEnd == -1) hEnd = rawPayload.indexOf('}', hPos);
    }
    if (hEnd > hPos) {
      String humStr = rawPayload.substring(hPos + startOffset, hEnd);
      humStr.trim();  // Remove whitespace
      Serial.print("DEBUG: Extracted humStr from rawPayload: '");
      Serial.print(humStr);
      Serial.println("'");
      
      if (humStr == "n" || humStr.length() == 0) {
        humidity = NAN;
        Serial.println("DEBUG: Manual parse - humidity is NULL (n)");
      } else {
        float parsedHumidity = humStr.toFloat();
        // Check if parsing resulted in 0.0 but string wasn't "0" or "0.0"
        // This catches cases where toFloat() returns 0.0 for invalid input
        if (parsedHumidity == 0.0 && humStr != "0" && humStr != "0.0" && humStr != "0.00") {
          // Invalid float, treat as NAN
          humidity = NAN;
          Serial.print("DEBUG: Manual parse - humidity string '");
          Serial.print(humStr);
          Serial.println("' parsed to 0.0 but is invalid, treating as NULL");
        } else {
          humidity = parsedHumidity;
          Serial.print("DEBUG: Manual parse - humidity = ");
          Serial.println(humidity);
        }
      }
    }
  } else if (doc.containsKey("H")) {
    // Fallback to JSON parsing if manual parsing didn't find H:
    // Check if it's a null indicator
    if (doc["H"].is<const char*>() && String(doc["H"].as<const char*>()) == "n") {
      humidity = NAN;
      Serial.println("DEBUG: JSON parse - humidity is NULL (n)");
    } else {
      humidity = doc["H"].as<float>();  // Compact format: float with 1 decimal
      Serial.print("DEBUG: JSON parse - humidity = ");
      Serial.println(humidity);
    }
  } else if (doc.containsKey("humidity_pct")) {
    humidity = doc["humidity_pct"].as<float>();  // Old format: float
    Serial.print("DEBUG: JSON parse (old format) - humidity = ");
    Serial.println(humidity);
  }
  
  // Extract MQ2 value - support both formats: M:51 (old) and M51 (new)
  int mq2 = 0;
  if (doc.containsKey("M")) {
    mq2 = doc["M"].as<int>();
  } else if (doc.containsKey("mq2")) {
    mq2 = doc["mq2"].as<int>();
  } else {
    // Manual parsing for compact format
    int mPos = rawPayload.indexOf("M:");
    if (mPos == -1) mPos = rawPayload.indexOf("M");  // Try new format
    if (mPos != -1) {
      int startOffset = (rawPayload.charAt(mPos + 1) == ':') ? 2 : 1;
      int mEnd = rawPayload.indexOf(',', mPos + startOffset);
      if (mEnd == -1) {
        mEnd = rawPayload.indexOf('P', mPos + startOffset);
        if (mEnd == -1) mEnd = rawPayload.indexOf('A', mPos + startOffset);
        if (mEnd == -1) mEnd = rawPayload.indexOf('C', mPos + startOffset);
        if (mEnd == -1) mEnd = rawPayload.indexOf('}', mPos);
      }
      if (mEnd > mPos) {
        mq2 = rawPayload.substring(mPos + startOffset, mEnd).toInt();
      }
    }
  }
  
  // Extract alert flag - support both formats: A:0 (old) and A0 (new)
  bool alertFlag = false;
  if (doc.containsKey("A")) {
    alertFlag = (doc["A"].as<int>() == 1);
  } else {
    // Try parsing manually for compact format
    int aPos = rawPayload.indexOf("A:");
    if (aPos == -1) aPos = rawPayload.indexOf("A");  // Try new format
    if (aPos != -1) {
      int startOffset = (rawPayload.charAt(aPos + 1) == ':') ? 2 : 1;
      int aEnd = rawPayload.indexOf(',', aPos + startOffset);
      if (aEnd == -1) {
        aEnd = rawPayload.indexOf('C', aPos + startOffset);
        if (aEnd == -1) aEnd = rawPayload.indexOf('}', aPos);
      }
      if (aEnd > aPos && aEnd > aPos + startOffset) {
        String aStr = rawPayload.substring(aPos + startOffset, aEnd);
        alertFlag = (aStr.toInt() == 1);
      } else if (aEnd == aPos + startOffset + 1) {
        // Single digit directly after A
        alertFlag = (rawPayload.charAt(aPos + startOffset) == '1');
      }
    }
  }
  
  String status = alertFlag ? "alert" : "ok";
  
  // If old format, use status field
  if (doc.containsKey("status")) {
    status = doc["status"].as<String>();
  }
  
  Serial.print("Extracted: treeId=");
  Serial.print(treeId);
  Serial.print(", temp=");
  if (isnan(temp)) {
    Serial.print("NULL");
  } else {
    Serial.print(temp, 1);
  }
  Serial.print(", humidity=");
  if (isnan(humidity)) {
    Serial.print("NULL");
  } else {
    Serial.print(humidity, 1);
  }
  Serial.print(", mq2=");
  Serial.print(mq2);
  Serial.print(", status=");
  Serial.println(status);
  
  // Extract MPU6050 data from raw payload (new ultra-compact format: P646400)
  // Format: P + 4 hex chars (ax,ay) + 2 flags (tilt,cut) = 7 chars total
  float mpu_accel_x = 0, mpu_accel_y = 0, mpu_accel_z = 0;
  float mpu_gyro_x = 0, mpu_gyro_y = 0, mpu_gyro_z = 0;
  bool mpu_tilt = false, mpu_cut_detected = false;
  
  // Find P field in raw payload (new format: P646400, no colon, no comma)
  int pPos = rawPayload.indexOf("P");
  if (pPos != -1) {
    // Check if it's the new ultra-compact format (P + 4 hex + 2 flags = 6 chars after P)
    // Format: P646400 (P + 4 hex chars + 2 flags)
    int pStart = pPos + 1;  // Skip 'P'
    int pEnd = rawPayload.indexOf('A', pPos);  // Find next field (A for alert)
    if (pEnd == -1) pEnd = rawPayload.indexOf('C', pPos);  // Or C for CRC
    if (pEnd == -1) pEnd = rawPayload.indexOf('}', pPos);  // Or end
    
    if (pEnd > pStart && pEnd >= pStart + 6) {
      String pData = rawPayload.substring(pStart, pEnd);
      Serial.print("DEBUG: Found P field: '");
      Serial.print(pData);
      Serial.println("'");
      
      // Check if it's the new format (6 chars: 4 hex + 2 flags)
      if (pData.length() >= 6) {
        // Parse 4 hex chars for accel X and Y
        String axHex = pData.substring(0, 2);
        String ayHex = pData.substring(2, 4);
        
        int ax_scaled = strtol(axHex.c_str(), NULL, 16);
        int ay_scaled = strtol(ayHex.c_str(), NULL, 16);
        
        // Convert back: (scaled - 100) / 10.0
        mpu_accel_x = (ax_scaled - 100) / 10.0;
        mpu_accel_y = (ay_scaled - 100) / 10.0;
        
        // Calculate accelZ from magnitude (assuming 1g magnitude when vertical)
        float currentMagnitudeSq = mpu_accel_x * mpu_accel_x + mpu_accel_y * mpu_accel_y;
        if (currentMagnitudeSq < 1.0) {
          mpu_accel_z = -sqrt(1.0 - currentMagnitudeSq);  // Assume Z is negative (down)
        } else {
          mpu_accel_z = 0;  // Fallback
        }
        
        // Parse flags (positions 4 and 5)
        if (pData.length() >= 5) {
          mpu_tilt = (pData.charAt(4) == '1');
        }
        if (pData.length() >= 6) {
          mpu_cut_detected = (pData.charAt(5) == '1');
        }
        
        Serial.print("DEBUG: Parsed MPU - accelX=");
        Serial.print(mpu_accel_x, 2);
        Serial.print(", accelY=");
        Serial.print(mpu_accel_y, 2);
        Serial.print(", accelZ=");
        Serial.print(mpu_accel_z, 2);
        Serial.print(", tilt=");
        Serial.print(mpu_tilt);
        Serial.print(", cut=");
        Serial.println(mpu_cut_detected);
      }
    } else {
      Serial.println("DEBUG: P field found but format incorrect or too short");
    }
  } else {
    Serial.println("DEBUG: P field not found in payload");
  }
  
  // Update tree state
  bool isNewConnection = !treeStates[treeIndex].hasData;
  treeStates[treeIndex].hasData = true;
  treeStates[treeIndex].lastSeen = millis();
  treeStates[treeIndex].lastStatus = status;
  
  // Print connection status
  if (isNewConnection) {
    Serial.println("========================================");
    Serial.print("✓ Tree ID ");
    Serial.print(treeId);
    Serial.println(" CONNECTED!");
    Serial.println("========================================");
  }
  
  // Print current status for all trees
  printTreeStatus();
  
  // Build full telemetry payload for backend
  // Pass extracted values including MPU6050 data to buildBackendPayload
  String backendPayload = buildBackendPayload(doc, treeId, temp, humidity, mq2, status,
                                              mpu_accel_x, mpu_accel_y, mpu_accel_z,
                                              mpu_gyro_x, mpu_gyro_y, mpu_gyro_z,
                                              mpu_tilt, mpu_cut_detected);
  
  Serial.print("Backend payload: ");
  Serial.println(backendPayload);
  
  // Forward to backend
  if (!sendToBackend(backendPayload)) {
    // Buffer message if backend unavailable
    bufferMessage(backendPayload);
    Serial.println("Message buffered (backend unavailable)");
  } else {
    Serial.println("Message sent to backend successfully");
  }
}

String buildBackendPayload(DynamicJsonDocument& doc, int treeId, float temp, float humidity, int mq2, String status,
                            float mpu_accel_x, float mpu_accel_y, float mpu_accel_z,
                            float mpu_gyro_x, float mpu_gyro_y, float mpu_gyro_z,
                            bool mpu_tilt, bool mpu_cut_detected) {
  // Create a complete JSON payload for backend
  // All values are already extracted and passed as parameters
  
  // Get timestamp (use current Unix timestamp)
  // ESP8266 doesn't have RTC, so we use millis() offset from boot time
  // For production, should sync with NTP server, but for now use millis()
  static unsigned long bootTime = 0;
  if (bootTime == 0) {
    // Approximate boot time (will be set on first call)
    // In production, sync with NTP: configTime(0, 0, "pool.ntp.org");
    bootTime = millis() / 1000;
  }
  unsigned long currentSeconds = (millis() / 1000);
  unsigned long timestamp = doc.containsKey("ts") ? doc["ts"].as<unsigned long>() : currentSeconds;
  
  // Debug: Print timestamp info
  Serial.print("Timestamp: ");
  Serial.print(timestamp);
  Serial.print(" (currentSeconds: ");
  Serial.print(currentSeconds);
  Serial.println(")");
  
  String payload = "{";
  payload += "\"tree_id\":" + String(treeId) + ",";
  payload += "\"timestamp\":" + String(timestamp) + ",";
  
  // Handle null values (NAN) - send null JSON value
  // Debug: Check if temp/humidity are NAN
  Serial.print("DEBUG buildBackendPayload: temp=");
  Serial.print(temp);
  Serial.print(" (isnan=");
  Serial.print(isnan(temp));
  Serial.print("), humidity=");
  Serial.print(humidity);
  Serial.print(" (isnan=");
  Serial.print(isnan(humidity));
  Serial.println(")");
  
  if (isnan(temp)) {
    payload += "\"temp_c\":null,";
    Serial.println("DEBUG: Sending temp_c as null (NAN)");
  } else {
    payload += "\"temp_c\":" + String(temp, 1) + ",";  // 1 decimal precision
    Serial.print("DEBUG: Sending temp_c=");
    Serial.println(temp, 1);
  }
  
  if (isnan(humidity)) {
    payload += "\"humidity_pct\":null,";
    Serial.println("DEBUG: Sending humidity_pct as null");
  } else {
    payload += "\"humidity_pct\":" + String(humidity, 1) + ",";  // 1 decimal precision
    Serial.print("DEBUG: Sending humidity_pct=");
    Serial.println(humidity, 1);
  }
  
  payload += "\"mq2\":" + String(mq2) + ",";
  
  // MPU6050 data - use values passed as parameters (already parsed in processPacket)
  // No need to parse again, just use the parameters directly
  
  // Add MPU data to backend payload
  payload += "\"mpu_accel_x\":" + String(mpu_accel_x, 2) + ",";
  payload += "\"mpu_accel_y\":" + String(mpu_accel_y, 2) + ",";
  payload += "\"mpu_accel_z\":" + String(mpu_accel_z, 2) + ",";
  payload += "\"mpu_gyro_x\":" + String(mpu_gyro_x, 2) + ",";
  payload += "\"mpu_gyro_y\":" + String(mpu_gyro_y, 2) + ",";
  payload += "\"mpu_gyro_z\":" + String(mpu_gyro_z, 2) + ",";
  payload += "\"mpu_tilt\":" + String(mpu_tilt ? "true" : "false") + ",";
  payload += "\"mpu_cut_detected\":" + String(mpu_cut_detected ? "true" : "false") + ",";
  
  payload += "\"status\":\"" + status + "\"";
  payload += "}";
  
  return payload;
}

uint8_t calculateCRC8(String data) {
  // Simple CRC8 calculation (matches transmitter)
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

// ==================== BACKEND COMMUNICATION ====================
bool sendToBackend(String payload) {
  // Check Wi-Fi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Wi-Fi not connected, cannot send to backend");
    Serial.print("Wi-Fi status: ");
    Serial.println(WiFi.status());
    return false;
  }
  
  Serial.print("✓ Wi-Fi connected, IP: ");
  Serial.println(WiFi.localIP());
  
  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/v1/telemetry";
  
  Serial.println("\n=== Sending to Backend ===");
  Serial.print("URL: ");
  Serial.println(url);
  Serial.print("API Key: ");
  Serial.println(API_KEY);
  Serial.print("Payload: ");
  Serial.println(payload);
  
  // Configure WiFiClient for better reliability
  wifiClient.setTimeout(5000);  // 5 second timeout
  wifiClient.setNoDelay(true);  // Disable Nagle algorithm for faster response
  
  http.begin(wifiClient, url);
  http.setTimeout(5000);  // 5 second timeout for reliable connection
  http.setReuse(true);  // Reuse connection for better performance
  
  // Add headers
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", API_KEY);
  
  Serial.println("Headers added:");
  Serial.println("  Content-Type: application/json");
  Serial.print("  X-API-Key: ");
  Serial.println(API_KEY);
  
  // Send POST request
  int httpCode = http.POST(payload);
  
  if (httpCode > 0) {
    String response = http.getString();
    Serial.print("✓ HTTP Response Code: ");
    Serial.println(httpCode);
    Serial.print("Response Body: ");
    Serial.println(response);
    
    if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
      Serial.println("✓ Successfully sent to backend");
      http.end();
      return true;
    } else {
      Serial.print("⚠ Backend returned error code: ");
      Serial.println(httpCode);
      Serial.print("Response: ");
      Serial.println(response);
    }
  } else {
    Serial.print("❌ HTTP request failed: ");
    Serial.println(http.errorToString(httpCode));
    Serial.print("Error code: ");
    Serial.println(httpCode);
    
    // Additional diagnostics
    Serial.print("Wi-Fi status: ");
    Serial.println(WiFi.status());
    Serial.print("Wi-Fi RSSI: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  }
  
  http.end();
  return false;
}

void bufferMessage(String payload) {
  if (bufferCount >= MAX_BUFFER_SIZE) {
    Serial.println("WARNING: Message buffer full, dropping oldest message");
    bufferHead = (bufferHead + 1) % MAX_BUFFER_SIZE;
    bufferCount--;
  }
  
  messageBuffer[bufferTail].payload = payload;
  messageBuffer[bufferTail].timestamp = millis();
  bufferTail = (bufferTail + 1) % MAX_BUFFER_SIZE;
  bufferCount++;
  
  Serial.println("Message buffered (backend unavailable)");
}

void processMessageBuffer() {
  if (bufferCount == 0) return;
  
  // Try to send oldest message
  if (sendToBackend(messageBuffer[bufferHead].payload)) {
    // Success, remove from buffer
    bufferHead = (bufferHead + 1) % MAX_BUFFER_SIZE;
    bufferCount--;
    Serial.println("Buffered message sent successfully");
  }
}

// ==================== STATUS DISPLAY ====================
void printTreeStatus() {
  unsigned long currentTime = millis();
  Serial.println("\n--- Tree Connection Status ---");
  
  for (int i = 0; i < 3; i++) {
    int treeId = i + 1;
    Serial.print("Tree ID ");
    Serial.print(treeId);
    Serial.print(": ");
    
    if (!treeStates[i].hasData) {
      Serial.println("❌ NOT CONNECTED");
    } else {
      unsigned long timeSinceLastSeen = currentTime - treeStates[i].lastSeen;
      
      if (timeSinceLastSeen > 300000) {  // 5 minutes
        Serial.print("⚠️  OFFLINE (last seen ");
        Serial.print(timeSinceLastSeen / 1000);
        Serial.println(" seconds ago)");
      } else {
        Serial.print("✓ CONNECTED - Status: ");
        Serial.print(treeStates[i].lastStatus);
        Serial.print(" (last update ");
        Serial.print(timeSinceLastSeen / 1000);
        Serial.println(" seconds ago)");
      }
    }
  }
  Serial.println("-------------------------------\n");
}

// ==================== LED CONTROL ====================
void updateLEDs() {
  unsigned long currentTime = millis();
  int ledPins[3] = {LED_TREE1, LED_TREE2, LED_TREE3};
  
  for (int i = 0; i < 3; i++) {
    if (!treeStates[i].hasData) {
      // No data received yet - LED off
      digitalWrite(ledPins[i], LOW);
      continue;
    }
    
    // Check if data is stale (no update in last 5 minutes)
    if (currentTime - treeStates[i].lastSeen > 300000) {
      // Stale data - blink slowly
      if (currentTime - treeStates[i].lastLedUpdate > 2000) {
        treeStates[i].ledState = !treeStates[i].ledState;
        treeStates[i].lastLedUpdate = currentTime;
      }
      digitalWrite(ledPins[i], treeStates[i].ledState ? HIGH : LOW);
      continue;
    }
    
    // Update LED based on status
    if (treeStates[i].lastStatus == "alert") {
      // Alert - blink rapidly (red simulation)
      if (currentTime - treeStates[i].lastLedUpdate > LED_BLINK_INTERVAL_MS) {
        treeStates[i].ledState = !treeStates[i].ledState;
        treeStates[i].lastLedUpdate = currentTime;
      }
      digitalWrite(ledPins[i], treeStates[i].ledState ? HIGH : LOW);
    } else {
      // OK - solid on (green simulation)
      digitalWrite(ledPins[i], HIGH);
    }
  }
}

