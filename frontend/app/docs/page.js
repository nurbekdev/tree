'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  FaBook, 
  FaCode, 
  FaCog, 
  FaPlug, 
  FaExclamationTriangle,
  FaLock,
  FaMicrochip,
  FaServer,
  FaChevronRight,
  FaHome,
  FaBars,
  FaTimes
} from 'react-icons/fa'
import Logo from '@/components/Logo'

const docs = [
  {
    id: 'installation',
    title: 'O\'rnatish Qo\'llanmasi',
    icon: FaCog,
    description: 'Loyihani o\'rnatish va sozlash bo\'yicha batafsil qo\'llanma',
    sections: [
      { title: 'Talablar', id: 'prerequisites' },
      { title: 'Backend O\'rnatish', id: 'backend' },
      { title: 'Frontend O\'rnatish', id: 'frontend' },
      { title: 'Firmware O\'rnatish', id: 'firmware' },
      { title: 'Hardware Yig\'ish', id: 'hardware' },
      { title: 'Test Qilish', id: 'testing' },
      { title: 'Production Deployment', id: 'deployment' }
    ]
  },
  {
    id: 'api',
    title: 'API Dokumentatsiyasi',
    icon: FaCode,
    description: 'Backend API endpoint\'lari va foydalanish misollari',
    sections: [
      { title: 'Authentication', id: 'auth' },
      { title: 'Telemetry', id: 'telemetry' },
      { title: 'Trees', id: 'trees' },
      { title: 'Stats', id: 'stats' },
      { title: 'Alerts', id: 'alerts' },
      { title: 'Settings', id: 'settings' }
    ]
  },
  {
    id: 'wiring',
    title: 'Hardware Yig\'ish',
    icon: FaPlug,
    description: 'ESP8266, sensor va modullarni ulash diagrammalari',
    sections: [
      { title: 'Base Station', id: 'base-station' },
      { title: 'Transmitter', id: 'transmitter' },
      { title: 'Sensorlar', id: 'sensors' },
      { title: 'nRF24L01', id: 'nrf24' }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Muammolarni Hal Qilish',
    icon: FaExclamationTriangle,
    description: 'Keng tarqalgan muammolar va ularning yechimlari',
    sections: [
      { title: 'Firmware Muammolari', id: 'firmware-issues' },
      { title: 'Backend Muammolari', id: 'backend-issues' },
      { title: 'Frontend Muammolari', id: 'frontend-issues' },
      { title: 'Hardware Muammolari', id: 'hardware-issues' }
    ]
  },
  {
    id: 'https-setup',
    title: 'HTTPS Sozlash',
    icon: FaLock,
    description: 'SSL certificate olish va HTTPS sozlash',
    sections: [
      { title: 'Certbot O\'rnatish', id: 'certbot' },
      { title: 'SSL Certificate', id: 'ssl' },
      { title: 'Nginx Config', id: 'nginx' },
      { title: 'Auto-Renewal', id: 'renewal' }
    ]
  },
  {
    id: 'esp8266-backend',
    title: 'ESP8266 Backend URL',
    icon: FaMicrochip,
    description: 'ESP8266 qurilmalar uchun backend URL sozlash',
    sections: [
      { title: 'IP vs Domain', id: 'ip-domain' },
      { title: 'HTTP vs HTTPS', id: 'http-https' },
      { title: 'Konfiguratsiya', id: 'config' }
    ]
  }
]

export default function DocsPage() {
  const [activeDoc, setActiveDoc] = useState('installation')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const currentDoc = docs.find(d => d.id === activeDoc)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <Logo />
              <span className="text-xl font-bold text-green-700">Dala Qo'riqchisi</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="hidden md:flex items-center space-x-2 px-4 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors"
              >
                <FaHome />
                <span>Dashboard</span>
              </Link>
              
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-green-700"
              >
                {sidebarOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 flex-shrink-0`}>
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 border border-green-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <FaBook className="text-green-600" />
                <span>Dokumentatsiya</span>
              </h2>
              
              <nav className="space-y-2">
                {docs.map((doc) => {
                  const Icon = doc.icon
                  return (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setActiveDoc(doc.id)
                        setMobileMenuOpen(false)
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${
                        activeDoc === doc.id
                          ? 'bg-green-100 text-green-700 font-semibold shadow-sm'
                          : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                      }`}
                    >
                      <Icon className="text-lg" />
                      <span className="flex-1">{doc.title}</span>
                      {activeDoc === doc.id && (
                        <FaChevronRight className="text-sm" />
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-green-100">
              {/* Doc Header */}
              {currentDoc && (
                <>
                  <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <currentDoc.icon className="text-2xl text-green-700" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {currentDoc.title}
                      </h1>
                      <p className="text-gray-600 mt-1">{currentDoc.description}</p>
                    </div>
                  </div>

                  {/* Doc Sections Navigation */}
                  <div className="mb-8 pb-6 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                      Bo'limlar
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentDoc.sections.map((section) => (
                        <a
                          key={section.id}
                          href={`#${section.id}`}
                          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 rounded-lg transition-colors"
                        >
                          {section.title}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Doc Content */}
                  <div className="prose prose-lg max-w-none">
                    <DocContent docId={activeDoc} />
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function DocContent({ docId }) {
  switch (docId) {
    case 'installation':
      return <InstallationDoc />
    case 'api':
      return <APIDoc />
    case 'wiring':
      return <WiringDoc />
    case 'troubleshooting':
      return <TroubleshootingDoc />
    case 'https-setup':
      return <HTTPSDoc />
    case 'esp8266-backend':
      return <ESP8266BackendDoc />
    default:
      return <InstallationDoc />
  }
}

function InstallationDoc() {
  return (
    <div className="space-y-8">
      <section id="prerequisites">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Talablar</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Node.js 18+ va npm</li>
          <li>Docker va Docker Compose</li>
          <li>Arduino IDE va ESP8266 board support</li>
          <li>PostgreSQL (yoki Docker ishlatish)</li>
        </ul>
      </section>

      <section id="backend">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Backend O'rnatish</h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-2">Docker orqali (Tavsiya etiladi)</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
{`cd backend
cp .env.example .env
# .env faylini sozlang
docker compose up -d`}
          </pre>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Qo'lda o'rnatish</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
{`cd backend
npm install
cp .env.example .env
# .env faylini sozlang
npm run migrate
npm start`}
          </pre>
        </div>
        <p className="text-gray-600 mt-4">
          Backend <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000</code> da ishga tushadi
        </p>
      </section>

      <section id="frontend">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Frontend O'rnatish</h2>
        <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto mb-4">
{`cd frontend
npm install
npm run dev`}
        </pre>
        <p className="text-gray-600 mb-2">
          Frontend <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3001</code> da ishga tushadi
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <p className="font-semibold text-yellow-800 mb-1">Default Login:</p>
          <ul className="text-yellow-700 space-y-1">
            <li>Username: <code className="bg-yellow-100 px-2 py-1 rounded">admin</code></li>
            <li>Password: <code className="bg-yellow-100 px-2 py-1 rounded">admin123</code></li>
          </ul>
          <p className="text-yellow-700 text-sm mt-2">⚠️ Production'da default parolni o'zgartiring!</p>
        </div>
      </section>

      <section id="firmware">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Firmware O'rnatish</h2>
        <h3 className="text-xl font-semibold mb-3">Arduino Library'larni O'rnatish</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
          <li>Arduino IDE'ni oching</li>
          <li><strong>Sketch → Include Library → Manage Libraries</strong> ga kiring</li>
          <li>Quyidagi library'larni o'rnating:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>ESP8266WiFi (odatda o'rnatilgan)</li>
              <li>RF24 (TMRh20) - ESP8266-compatible versiya kerak</li>
              <li>DHT sensor library (Adafruit)</li>
              <li>MPU6050 (Electronic Cats)</li>
              <li>ArduinoJson (Benoit Blanchon)</li>
            </ul>
          </li>
        </ol>

        <h3 className="text-xl font-semibold mb-3">Transmitter Firmware</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
          <li><code className="bg-gray-100 px-2 py-1 rounded">firmware/transmitter/transmitter.ino</code> ni oching</li>
          <li>Sozlang:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li><code>TREE_ID</code>: Har bir transmitter uchun 1, 2, yoki 3</li>
              <li><code>SAMPLE_INTERVAL_MS</code>: Default 30000 (30 soniya)</li>
              <li><code>MQ2_ALERT_THRESHOLD</code>: Kalibratsiya asosida sozlang</li>
            </ul>
          </li>
          <li>Board: <strong>Tools → Board → NodeMCU 1.0 (ESP-12E Module)</strong></li>
          <li>Upload qiling</li>
        </ol>

        <h3 className="text-xl font-semibold mb-3">Base Station Firmware</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li><code className="bg-gray-100 px-2 py-1 rounded">firmware/base_station/base_station.ino</code> ni oching</li>
          <li>Sozlang:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li><code>WIFI_SSID</code>: Wi-Fi tarmoq nomi</li>
              <li><code>WIFI_PASSWORD</code>: Wi-Fi paroli</li>
              <li><code>BACKEND_URL</code>: Backend API URL (masalan: <code>http://192.168.1.100:3000</code>)</li>
              <li><code>API_KEY</code>: Backend <code>.env</code> dagi API_KEY bilan mos kelishi kerak</li>
            </ul>
          </li>
          <li>Upload qiling</li>
        </ol>
      </section>

      <section id="hardware">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Hardware Yig'ish</h2>
        <p className="text-gray-700 mb-4">
          Batafsil ma'lumot uchun <a href="#wiring" className="text-green-600 hover:underline">Hardware Yig'ish</a> bo'limiga qarang.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Tezkor Checklist</h3>
          <div className="space-y-2 text-blue-800">
            <p><strong>Base Station:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>nRF24L01 ulangan (CE→D4, CSN→D8)</li>
              <li>3 ta LED ulangan (D1, D2, D3) rezistorlar bilan</li>
              <li>Quvvat manbai ulangan</li>
            </ul>
            <p className="mt-3"><strong>Transmitter (×3):</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>nRF24L01 ulangan</li>
              <li>DHT11 ulangan (DATA→D3)</li>
              <li>MQ-2 ulangan (A0→A0)</li>
              <li>MPU6050 ulangan (SCL→D1, SDA→D2)</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="testing">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Qilish</h2>
        <h3 className="text-xl font-semibold mb-3">Backend Test</h3>
        <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto mb-4">
{`curl http://localhost:3000/health`}
        </pre>

        <h3 className="text-xl font-semibold mb-3">Frontend Test</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li><code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3001</code> ni oching</li>
          <li><code>admin</code> / <code>admin123</code> bilan login qiling</li>
          <li>Dashboard'da 3 ta daraxt ko'rinishini tekshiring</li>
        </ol>
      </section>

      <section id="deployment">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Production Deployment</h2>
        <h3 className="text-xl font-semibold mb-3">Docker orqali (Tavsiya)</h3>
        <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
{`cd backend
docker compose -f docker-compose.prod.yml up -d`}
        </pre>
        <p className="text-gray-600 mt-4">
          Batafsil ma'lumot uchun <a href="#https-setup" className="text-green-600 hover:underline">HTTPS Sozlash</a> bo'limiga qarang.
        </p>
      </section>
    </div>
  )
}

function APIDoc() {
  return (
    <div className="space-y-8">
      <section id="auth">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-2">Login</h3>
          <p className="text-sm text-gray-600 mb-2"><strong>POST</strong> <code>/api/v1/auth/login</code></p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto mb-2">
{`{
  "username": "admin",
  "password": "admin123"
}`}
          </pre>
          <p className="text-sm text-gray-600 mt-2">Response:</p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
{`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}`}
          </pre>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>JWT Token ishlatish:</strong> <code>Authorization: Bearer &lt;token&gt;</code> header'da yuborish kerak
          </p>
        </div>
      </section>

      <section id="telemetry">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Telemetry</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Telemetry Yuborish</h3>
          <p className="text-sm text-gray-600 mb-2"><strong>POST</strong> <code>/api/v1/telemetry</code></p>
          <p className="text-sm text-gray-600 mb-2">Authentication: API Key (X-API-Key header)</p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto mb-2">
{`Headers:
Content-Type: application/json
X-API-Key: your-secret-api-key-here

Body:
{
  "tree_id": 1,
  "temperature": 25.5,
  "humidity": 60.2,
  "smoke_level": 120,
  "is_cut": false,
  "tilt_angle": 0.5
}`}
          </pre>
        </div>
      </section>

      <section id="trees">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Trees</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2"><strong>GET</strong> <code>/api/v1/trees</code></p>
            <p className="text-sm text-gray-700">Barcha daraxtlarni olish (JWT token kerak)</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2"><strong>GET</strong> <code>/api/v1/trees/:id</code></p>
            <p className="text-sm text-gray-700">Bitta daraxt ma'lumotlarini olish</p>
          </div>
        </div>
      </section>

      <section id="stats">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Stats</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2"><strong>GET</strong> <code>/api/v1/stats</code></p>
          <p className="text-sm text-gray-700">Umumiy statistika (JWT token kerak)</p>
        </div>
      </section>

      <section id="alerts">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Alerts</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2"><strong>GET</strong> <code>/api/v1/alerts</code></p>
          <p className="text-sm text-gray-700">Barcha ogohlantirishlarni olish (JWT token kerak)</p>
        </div>
      </section>

      <section id="settings">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2"><strong>GET</strong> <code>/api/v1/settings/esp8266/config</code></p>
          <p className="text-sm text-gray-700">ESP8266 uchun konfiguratsiya (API Key kerak emas)</p>
        </div>
      </section>
    </div>
  )
}

function WiringDoc() {
  return (
    <div className="space-y-8">
      <section id="base-station">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Base Station (ESP8266)</h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3">nRF24L01 Module</h3>
          <div className="bg-white rounded p-4 font-mono text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>nRF24L01</div>
              <div>ESP8266</div>
              <div className="border-t pt-2">VCC</div>
              <div className="border-t pt-2">3.3V</div>
              <div>GND</div>
              <div>GND</div>
              <div>CE</div>
              <div>D4</div>
              <div>CSN</div>
              <div>D8</div>
              <div>SCK</div>
              <div>D5</div>
              <div>MOSI</div>
              <div>D7</div>
              <div>MISO</div>
              <div>D6</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">LEDs (Status Indicators)</h3>
          <div className="bg-white rounded p-4 font-mono text-sm">
            <p>LED 1 (Tree 1) → D1 (220Ω rezistor orqali GND ga)</p>
            <p>LED 2 (Tree 2) → D2 (220Ω rezistor orqali GND ga)</p>
            <p>LED 3 (Tree 3) → D3 (220Ω rezistor orqali GND ga)</p>
          </div>
          <p className="text-sm text-gray-600 mt-2">⚠️ LED'lar uchun 220Ω rezistor ishlatish tavsiya etiladi</p>
        </div>
      </section>

      <section id="transmitter">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Transmitter (ESP8266) - 3 ta bir xil</h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3">nRF24L01 Module</h3>
          <p className="text-sm text-gray-700">Base Station bilan bir xil ulanish</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3">DHT11 Sensor</h3>
          <div className="bg-white rounded p-4 font-mono text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>DHT11</div>
              <div>ESP8266</div>
              <div className="border-t pt-2">VCC</div>
              <div className="border-t pt-2">3.3V</div>
              <div>GND</div>
              <div>GND</div>
              <div>DATA</div>
              <div>D3</div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">⚠️ DATA va VCC orasiga 10kΩ pull-up rezistor qo'shing</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3">MQ-2 Sensor</h3>
          <div className="bg-white rounded p-4 font-mono text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>MQ-2</div>
              <div>ESP8266</div>
              <div className="border-t pt-2">VCC</div>
              <div className="border-t pt-2">5V</div>
              <div>GND</div>
              <div>GND</div>
              <div>A0</div>
              <div>A0</div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">⚠️ 20-30 soniya isitish vaqti kerak</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">MPU6050 Sensor</h3>
          <div className="bg-white rounded p-4 font-mono text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>MPU6050</div>
              <div>ESP8266</div>
              <div className="border-t pt-2">VCC</div>
              <div className="border-t pt-2">3.3V</div>
              <div>GND</div>
              <div>GND</div>
              <div>SCL</div>
              <div>D1</div>
              <div>SDA</div>
              <div>D2</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function TroubleshootingDoc() {
  return (
    <div className="space-y-8">
      <section id="firmware-issues">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Firmware Muammolari</h2>
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Transmitter Ma'lumot Yubormayapti</h3>
            <ul className="list-disc list-inside space-y-1 text-yellow-800">
              <li>Serial Monitor'ni tekshiring (115200 baud)</li>
              <li>nRF24L01 ulanishini tekshiring</li>
              <li>Sensor ulanishlarini tekshiring</li>
              <li>TREE_ID to'g'ri sozlanganligini tekshiring</li>
            </ul>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Base Station Ma'lumot Olmayapti</h3>
            <ul className="list-disc list-inside space-y-1 text-yellow-800">
              <li>Wi-Fi ulanishini tekshiring</li>
              <li>nRF24L01 pipe address'larini tekshiring</li>
              <li>Backend URL va API Key'ni tekshiring</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="backend-issues">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Backend Muammolari</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 mb-2">Database Connection Error</h3>
          <ul className="list-disc list-inside space-y-1 text-red-800">
            <li>PostgreSQL ishlayotganini tekshiring</li>
            <li>.env fayldagi database sozlamalarini tekshiring</li>
            <li>Migration'larni qayta ishga tushiring: <code>npm run migrate</code></li>
          </ul>
        </div>
      </section>

      <section id="frontend-issues">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Frontend Muammolari</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Backend'ga Ulanish Muammosi</h3>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li>NEXT_PUBLIC_API_URL to'g'ri sozlanganligini tekshiring</li>
            <li>Backend ishlayotganini tekshiring: <code>curl http://localhost:3000/health</code></li>
            <li>CORS sozlamalarini tekshiring</li>
          </ul>
        </div>
      </section>

      <section id="hardware-issues">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Hardware Muammolari</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Sensor O'qishlar Noto'g'ri</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>DHT11: Wiring va pull-up rezistorni tekshiring</li>
            <li>MQ-2: 20-30 soniya isitish vaqtini kutib turing</li>
            <li>MPU6050: I2C ulanishlarini tekshiring</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

function HTTPSDoc() {
  return (
    <div className="space-y-8">
      <section id="certbot">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Certbot O'rnatish</h2>
        <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto mb-4">
{`cd /var/www/tree-monitor/tree
sudo bash scripts/setup-https.sh`}
        </pre>
        <p className="text-gray-700 mb-4">
          Bu script Certbot va Nginx plugin'ni o'rnatadi, SSL certificate oladi va auto-renewal sozlaydi.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Muhim:</strong> DNS to'g'ri sozlanishi kerak va port 80 internetdan ochiq bo'lishi kerak.
          </p>
        </div>
      </section>

      <section id="ssl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">SSL Certificate</h2>
        <p className="text-gray-700 mb-4">
          Let's Encrypt orqali bepul SSL certificate olish:
        </p>
        <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
{`sudo certbot --nginx -d nextree.app -d www.nextree.app`}
        </pre>
      </section>

      <section id="nginx">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Nginx Config</h2>
        <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto mb-4">
{`sudo bash scripts/fix-domain-nginx.sh`}
        </pre>
        <p className="text-gray-700">
          Bu script SSL certificate bor-yo'qligini tekshiradi va HTTPS server block qo'shadi.
        </p>
      </section>

      <section id="renewal">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Auto-Renewal</h2>
        <p className="text-gray-700 mb-4">
          Certbot avtomatik renewal qiladi. Test qilish:
        </p>
        <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
{`sudo certbot renew --dry-run`}
        </pre>
      </section>
    </div>
  )
}

function ESP8266BackendDoc() {
  return (
    <div className="space-y-8">
      <section id="ip-domain">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">IP vs Domain</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="font-semibold text-red-900 mb-2">⚠️ Muhim Eslatma</p>
          <p className="text-red-800">
            ESP8266 qurilmalar DNS resolution qila olmaydi! Shuning uchun IP manzil ishlatish kerak.
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Komponent</th>
                <th className="text-left p-2">URL Format</th>
                <th className="text-left p-2">Sabab</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2 font-semibold">Frontend (Browser)</td>
                <td className="p-2"><code>https://nextree.app</code></td>
                <td className="p-2">DNS resolution bor, HTTPS qo'llab-quvvatlanadi</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold">ESP8266 (Hardware)</td>
                <td className="p-2"><code>http://64.225.20.211</code></td>
                <td className="p-2">DNS yo'q, faqat IP, HTTP</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="http-https">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">HTTP vs HTTPS</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">ESP8266 uchun:</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>✅ <code>http://64.225.20.211</code> - TO'G'RI</li>
            <li>❌ <code>https://nextree.app</code> - ISHLAYDI (DNS yo'q)</li>
          </ul>
          <h3 className="font-semibold mb-2 mt-4">Frontend uchun:</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>✅ <code>https://nextree.app</code> - TO'G'RI</li>
            <li>✅ <code>http://64.225.20.211</code> - HAM ISHLAYDI</li>
          </ul>
        </div>
      </section>

      <section id="config">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Konfiguratsiya</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">base_station.ino</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
{`// ESP8266 uchun IP manzil ishlatish kerak (domen emas!)
const char* BACKEND_URL = "http://64.225.20.211";  // ✅ TO'G'RI
// const char* BACKEND_URL = "https://nextree.app";  // ❌ ISHLAYDI`}
          </pre>
        </div>
      </section>
    </div>
  )
}
