# Wiring Diagrams

## Base Station (ESP8266)

### nRF24L01 Module
```
nRF24L01    ->    ESP8266
VCC         ->    3.3V
GND         ->    GND
CE          ->    D4
CSN         ->    D8
SCK         ->    D5
MOSI        ->    D7
MISO        ->    D6
```

### LEDs (Status Indicators)
```
LED 1 (Tree 1)    ->    D1 (via 220Ω resistor to GND)
LED 2 (Tree 2)    ->    D2 (via 220Ω resistor to GND)
LED 3 (Tree 3)    ->    D3 (via 220Ω resistor to GND)
```

**Note:** Use current-limiting resistors (220Ω recommended) for LEDs.

---

## Transmitter (ESP8266) - 3 identical units

### nRF24L01 Module
```
nRF24L01    ->    ESP8266
VCC         ->    3.3V
GND         ->    GND
CE          ->    D4
CSN         ->    D8
SCK         ->    D5
MOSI        ->    D7
MISO        ->    D6
```

### DHT11 Sensor
```
DHT11       ->    ESP8266
VCC         ->    3.3V
GND         ->    GND
DATA        ->    D3
```

**Note:** Add a 10kΩ pull-up resistor between DATA and VCC.

### MQ-2 Sensor
```
MQ-2        ->    ESP8266
VCC         ->    5V (or 3.3V if module supports)
GND         ->    GND
A0          ->    A0 (analog input)
```

### MPU6050 Sensor
```
MPU6050     ->    ESP8266
VCC         ->    3.3V
GND         ->    GND
SCL         ->    D1
SDA         ->    D2
```

**Note:** MPU6050 uses I2C protocol. ESP8266 has built-in I2C support on D1 (SCL) and D2 (SDA).

---

## Power Supply

- **Base Station:** Can be powered via USB or external 5V supply
- **Transmitters:** Can be powered via USB, battery pack, or solar panel with battery backup

**Important:** Ensure stable power supply. Use capacitors (100µF) near power pins if experiencing instability.

---

## Pin Summary

### Base Station
- D1: LED Tree 1
- D2: LED Tree 2
- D3: LED Tree 3
- D4: nRF24L01 CE
- D5: nRF24L01 SCK
- D6: nRF24L01 MISO
- D7: nRF24L01 MOSI
- D8: nRF24L01 CSN

### Transmitter
- D1: MPU6050 SCL
- D2: MPU6050 SDA
- D3: DHT11 DATA
- D4: nRF24L01 CE
- D5: nRF24L01 SCK
- D6: nRF24L01 MISO
- D7: nRF24L01 MOSI
- D8: nRF24L01 CSN
- A0: MQ-2 A0

---

## Troubleshooting

1. **nRF24L01 not working:**
   - Check 3.3V power supply (not 5V!)
   - Verify SPI connections
   - Ensure CE and CSN are correctly connected

2. **DHT11 reading errors:**
   - Add pull-up resistor (10kΩ)
   - Check wiring (DATA pin)
   - Allow 2 seconds between readings

3. **MPU6050 not detected:**
   - Verify I2C connections (SCL/SDA)
   - Check if module is powered (3.3V)
   - Some modules may need address selection

4. **MQ-2 always reading high:**
   - Allow warm-up time (20-30 seconds)
   - Calibrate threshold in code
   - Check if sensor is in clean air for baseline

