/*
 * ═══════════════════════════════════════════════════════════════════════════
 *  39290 HARBIY QISM RAQA — Qurol javoni (20 slot) + Zummer
 *  Arduino Mega 2560
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * LOYIHA: Har bir javon slotida tugma (sensor). Qurol qo'yilganda tugma
 * bosiladi (LOW). PC dastur bilan Serial orqali aloqa: slot holatlari
 * yuboriladi, ogohlantirish uchun zummer boshqariladi.
 *
 * ULASH:
 * ─────
 * • Tugmalar (20 ta): D22 .. D41
 *   - Bir oyoq GND, ikkinchi oyoq pin (INPUT_PULLUP)
 *   - Bosilganda LOW, bosilmaganda HIGH
 *   - LOW = slotda qurol bor (1), HIGH = bo'sh (0)
 * • Zummer: D12 (aktiv HIGH; piezo yoki aktiv buzzer)
 * • Status LED (ixtiyoriy): D13 — ishlaganda miltillaydi
 *
 * SERIAL PROTOKOL (115200 baud, 8N1):
 * ───────────────────────────────────
 * Arduino → PC (har 100 ms yoki o'zgarishda):
 *   BUTTONS:b1,b2,...,b20\n
 *   b=1 slotda qurol bor (tugma bosilgan), b=0 bo'sh
 *
 * PC → Arduino (buyruq, \n bilan tugaydi):
 *   BUZZ:1\n  — zummer yoqish (ogohlantirish)
 *   BUZZ:0\n  — zummer o'chirish
 *   PING\n    — javob: PONG\n (ulanish tekshiruvi)
 *
 * Litsenziya: loyiha uchun.
 */

#define NUM_SLOTS       20
#define BUTTON_FIRST    2   // D22 .. D41
#define BUZZER_PIN      12
#define LED_PIN         13   // ixtiyoriy status LED
#define BAUDRATE        115200
#define SEND_INTERVAL_MS  100
#define BUZZER_ALARM_MS   500
#define DEBOUNCE_MS      20  // tugma debounce

// Pin ro'yxati
const uint8_t buttonPins[NUM_SLOTS] = {
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
  22, 23, 25, 27, 29, 31, 33, 35, 37, 39
};

uint8_t lastState[NUM_SLOTS];   // oxirgi qabul qilingan holat (HIGH/LOW)
uint8_t stableState[NUM_SLOTS]; // debounce dan keyin barqaror holat
unsigned long lastDebounce[NUM_SLOTS];
bool buzzerOn = false;
unsigned long buzzEnd = 0;
unsigned long lastSend = 0;
unsigned long lastLedToggle = 0;
bool ledOn = false;

void setup() {
  Serial.begin(BAUDRATE);
  // Arduino Mega USB Serial — while(!Serial) ni comment qiling, chunki
  // Serial Monitor ochilmasa ham ishlashi kerak
  #if defined(ARDUINO_AVR_MEGA2560) && 0
  while (!Serial) { ; }
  #endif

  for (int i = 0; i < NUM_SLOTS; i++) {
    pinMode(buttonPins[i], INPUT_PULLUP);
    lastState[i] = HIGH;
    stableState[i] = HIGH;
    lastDebounce[i] = 0;
  }
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  sendButtonStates();
}

void processCommand(String cmd) {
  cmd.trim();
  if (cmd.startsWith("BUZZ:")) {
    int v = cmd.substring(5).toInt();
    buzzerOn = (v != 0);
    if (buzzerOn) buzzEnd = millis() + BUZZER_ALARM_MS;
    return;
  }
  if (cmd == "PING") {
    Serial.println("PONG");
    return;
  }
}

void sendButtonStates() {
  Serial.print("BUTTONS:");
  for (int i = 0; i < NUM_SLOTS; i++) {
    // stableState: LOW = bosilgan = slotda qurol bor => 1
    Serial.print(stableState[i] == LOW ? 1 : 0);
    if (i < NUM_SLOTS - 1) Serial.print(",");
  }
  Serial.println();
}

void loop() {
  unsigned long now = millis();

  // ─── Serial orqali PC dan buyruq ───
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    processCommand(cmd);
  }

  // ─── Zummer: vaqt tugasa o'chirish ───
  if (buzzerOn && now >= buzzEnd) {
    buzzerOn = false;
    digitalWrite(BUZZER_PIN, LOW);
  } else if (buzzerOn) {
    digitalWrite(BUZZER_PIN, HIGH);
  }

  // ─── Status LED (taxminan 1 Hz) ───
  if (now - lastLedToggle >= 500) {
    lastLedToggle = now;
    ledOn = !ledOn;
    digitalWrite(LED_PIN, ledOn ? HIGH : LOW);
  }

  // ─── Tugmalarni o'qish (debounce bilan) ───
  bool changed = false;
  for (int i = 0; i < NUM_SLOTS; i++) {
    uint8_t st = digitalRead(buttonPins[i]);
    if (st != lastState[i]) {
      lastState[i] = st;
      lastDebounce[i] = now;
    }
    if (now - lastDebounce[i] >= DEBOUNCE_MS) {
      if (st != stableState[i]) {
        stableState[i] = st;
        changed = true;
      }
    }
  }

  // ─── Periodic yoki o'zgarishda PC ga yuborish ───
  if (changed || (now - lastSend >= SEND_INTERVAL_MS)) {
    lastSend = now;
    sendButtonStates();
  }
}
