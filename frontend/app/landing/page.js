'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/components/Logo'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { 
  FaTree, 
  FaThermometerHalf, 
  FaTint, 
  FaFire, 
  FaExclamationTriangle,
  FaWifi,
  FaDatabase,
  FaMobileAlt,
  FaChartLine,
  FaBell,
  FaCode,
  FaServer,
  FaMicrochip,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaRocket,
  FaLightbulb,
  FaCog,
  FaCheckCircle,
  FaArrowRight,
  FaLeaf,
  FaShieldAlt,
  FaCloud,
  FaBrain,
  FaRobot,
  FaDocker,
  FaNetworkWired,
  FaBars,
  FaTimes
} from 'react-icons/fa'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false)
    const element = document.querySelector(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Logo className="h-8 w-8" />
              <span className="text-xl font-bold text-green-600">O'rmon agentligi</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a 
                href="#muammo" 
                className="text-gray-700 hover:text-green-600 transition"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick('#muammo')
                }}
              >
                Muammo
              </a>
              <a 
                href="#yechim" 
                className="text-gray-700 hover:text-green-600 transition"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick('#yechim')
                }}
              >
                Yechim
              </a>
              <a 
                href="#jamoa" 
                className="text-gray-700 hover:text-green-600 transition"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick('#jamoa')
                }}
              >
                Jamoa
              </a>
              <a 
                href="#yol-xaritasi" 
                className="text-gray-700 hover:text-green-600 transition"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick('#yol-xaritasi')
                }}
              >
                Yo'l xaritasi
              </a>
              <Link 
                href="/login" 
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Kirish
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 active:scale-95"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <FaTimes className="text-2xl text-green-600" />
              ) : (
                <FaBars className="text-2xl" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            mobileMenuOpen 
              ? 'max-h-96 opacity-100 mt-2' 
              : 'max-h-0 opacity-0 mt-0'
          }`}>
            <div className="bg-white rounded-xl shadow-2xl border-2 border-green-100 overflow-hidden backdrop-blur-sm">
              <div className="py-2 space-y-1">
                <a
                  href="#muammo"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavClick('#muammo')
                  }}
                  className="flex items-center px-6 py-4 text-gray-800 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 active:bg-red-50 transition-all duration-200 font-semibold border-l-4 border-transparent hover:border-red-500 group"
                >
                  <FaExclamationTriangle className="mr-3 text-red-500 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:translate-x-1 transition-transform">Muammo</span>
                </a>
                <a
                  href="#yechim"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavClick('#yechim')
                  }}
                  className="flex items-center px-6 py-4 text-gray-800 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700 active:bg-green-50 transition-all duration-200 font-semibold border-l-4 border-transparent hover:border-green-600 group"
                >
                  <FaCheckCircle className="mr-3 text-green-600 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:translate-x-1 transition-transform">Yechim</span>
                </a>
                <a
                  href="#jamoa"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavClick('#jamoa')
                  }}
                  className="flex items-center px-6 py-4 text-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 active:bg-blue-50 transition-all duration-200 font-semibold border-l-4 border-transparent hover:border-blue-600 group"
                >
                  <FaCode className="mr-3 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:translate-x-1 transition-transform">Jamoa</span>
                </a>
                <a
                  href="#yol-xaritasi"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavClick('#yol-xaritasi')
                  }}
                  className="flex items-center px-6 py-4 text-gray-800 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:text-purple-700 active:bg-purple-50 transition-all duration-200 font-semibold border-l-4 border-transparent hover:border-purple-600 group"
                >
                  <FaRocket className="mr-3 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:translate-x-1 transition-transform">Yo'l xaritasi</span>
                </a>
              </div>
              <div className="px-4 pt-3 pb-4 border-t-2 border-gray-100 bg-gradient-to-r from-green-50 via-green-100 to-green-50">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3.5 rounded-xl hover:from-green-700 hover:to-green-800 active:scale-95 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform"
                >
                  <span>Kirish</span>
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-green-600">Aqlli daraxt</span> monitoring tizimi
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
              Real-vaqtda daraxtlarni kuzatish, xavfsizlikni ta'minlash va o'rmon resurslarini himoya qilish
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/login"
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition shadow-lg hover:shadow-xl"
              >
                Demo ko'rish
              </Link>
              <a 
                href="#yechim"
                className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-green-600 hover:bg-green-50 transition"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('#yechim')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Batafsil ma'lumot
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600">Kuzatuv</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">Real-vaqt</div>
              <div className="text-gray-600">Ma'lumotlar</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-600">Xavfsizlik</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">AI</div>
              <div className="text-gray-600">Tahlil</div>
            </div>
          </div>
        </div>
      </section>

      {/* Muammo → Yechim Section */}
      <section id="muammo" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Muammo <span className="text-green-600">→</span> Yechim
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              O'rmon xavfsizligi va monitoring muammolariga innovatsion yechim
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Muammo */}
            <div className="bg-red-50 p-8 rounded-2xl border-2 border-red-200">
              <div className="flex items-center mb-6">
                <div className="bg-red-500 p-3 rounded-lg mr-4">
                  <FaExclamationTriangle className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-red-700">Muammo</h3>
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                  <span>Daraxtlarni kesish va qonuniy bo'lmagan daraxt kesish holatlari</span>
                </li>
                <li className="flex items-start">
                  <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                  <span>O'rmon yong'inlarini erta aniqlash qiyinligi</span>
                </li>
                <li className="flex items-start">
                  <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                  <span>Real-vaqtda monitoring tizimlarining yo'qligi</span>
                </li>
                <li className="flex items-start">
                  <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                  <span>Atrof-muhit sharoitlarini kuzatishning qiyinligi</span>
                </li>
                <li className="flex items-start">
                  <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                  <span>Ma'lumotlarni to'plash va tahlil qilishning samarasizligi</span>
                </li>
              </ul>
            </div>

            {/* Yechim */}
            <div className="bg-green-50 p-8 rounded-2xl border-2 border-green-200">
              <div className="flex items-center mb-6">
                <div className="bg-green-500 p-3 rounded-lg mr-4">
                  <FaCheckCircle className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-green-700">Yechim</h3>
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <span>IoT asosidagi real-vaqtda monitoring tizimi</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <span>MPU6050 sensor orqali daraxt kesishni aniqlash</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <span>MQ-2 sensor bilan yong'in erta aniqlash</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <span>Harorat va namlikni kuzatish (DHT11)</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <span>Web dashboard va mobil ilova orqali boshqarish</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <span>AI asosidagi tahlil va bashorat</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="yechim" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tizim imkoniyatlari
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Keng qamrovli monitoring va boshqaruv yechimi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FaThermometerHalf />,
                title: 'Harorat monitoringi',
                desc: 'Real-vaqtda harorat o\'lchash va tarixiy ma\'lumotlar'
              },
              {
                icon: <FaTint />,
                title: 'Namlik kuzatuv',
                desc: 'Atrof-muhit namligini doimiy kuzatish'
              },
              {
                icon: <FaFire />,
                title: 'Yong\'in aniqlash',
                desc: 'MQ-2 sensor orqali yong\'in erta aniqlash'
              },
              {
                icon: <FaExclamationTriangle />,
                title: 'Daraxt kesish aniqlash',
                desc: 'MPU6050 sensor bilan daraxt kesishni aniqlash'
              },
              {
                icon: <FaChartLine />,
                title: 'Telemetriya grafiklari',
                desc: 'Barcha sensor ma\'lumotlarini vizual ko\'rinishda'
              },
              {
                icon: <FaBell />,
                title: 'Xabarnomalar',
                desc: 'Xavfli holatlar uchun darhol xabarnomalar'
              },
              {
                icon: <FaMobileAlt />,
                title: 'Mobil qo\'llab-quvvatlash',
                desc: 'Barcha qurilmalarda ishlaydigan responsive dizayn'
              },
              {
                icon: <FaWifi />,
                title: 'Wireless aloqa',
                desc: 'nRF24L01 va Wi-Fi orqali ma\'lumot uzatish'
              },
              {
                icon: <FaDatabase />,
                title: 'Ma\'lumotlar bazasi',
                desc: 'PostgreSQL bilan ishonchli ma\'lumotlar saqlash'
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-green-600 text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Telemetriya Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Telemetriya monitoringi
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real-vaqtda sensor ma'lumotlarini vizual ko'rinishda kuzatish
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            {/* Demo Data - Simulated telemetry */}
            {(() => {
              // Generate demo data for last 24 hours
              const demoData = []
              const now = new Date()
              for (let i = 23; i >= 0; i--) {
                const time = new Date(now.getTime() - i * 60 * 60 * 1000)
                demoData.push({
                  timestamp: time.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
                  harorat: 20 + Math.sin(i / 4) * 5 + Math.random() * 3,
                  namlik: 45 + Math.cos(i / 3) * 10 + Math.random() * 5,
                  tutun: 100 + Math.random() * 50
                })
              }
              return (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={demoData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSmoke" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="timestamp" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      yAxisId="left" 
                      label={{ value: 'Harorat (°C) / Namlik (%)', angle: -90, position: 'insideLeft' }}
                      stroke="#3b82f6"
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      label={{ value: 'Tutun (ppm)', angle: 90, position: 'insideRight' }}
                      stroke="#f59e0b"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        const units = {
                          harorat: '°C',
                          namlik: '%',
                          tutun: 'ppm'
                        }
                        return [`${value.toFixed(1)} ${units[name] || ''}`, name]
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={(value) => {
                        const labels = {
                          harorat: 'Harorat',
                          namlik: 'Namlik',
                          tutun: 'Tutun'
                        }
                        return labels[value] || value
                      }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="harorat"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorTemp)"
                      name="harorat"
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="namlik"
                      stroke="#22c55e"
                      fillOpacity={1}
                      fill="url(#colorHumidity)"
                      name="namlik"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="tutun"
                      stroke="#f59e0b"
                      fillOpacity={1}
                      fill="url(#colorSmoke)"
                      name="tutun"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )
            })()}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FaThermometerHalf className="text-blue-600 text-2xl mr-3" />
                    <h4 className="font-semibold text-gray-700">Harorat</h4>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">24°C</span>
                </div>
                <p className="text-sm text-gray-600">O'rtacha: 22-26°C</p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FaTint className="text-green-600 text-2xl mr-3" />
                    <h4 className="font-semibold text-gray-700">Namlik</h4>
                  </div>
                  <span className="text-2xl font-bold text-green-600">48%</span>
                </div>
                <p className="text-sm text-gray-600">O'rtacha: 45-55%</p>
              </div>
              <div className="bg-amber-50 p-6 rounded-xl border-2 border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FaFire className="text-amber-600 text-2xl mr-3" />
                    <h4 className="font-semibold text-gray-700">Tutun</h4>
                  </div>
                  <span className="text-2xl font-bold text-amber-600">125 ppm</span>
                </div>
                <p className="text-sm text-gray-600">Xavfsiz daraja</p>
              </div>
            </div>

            {/* Info Text */}
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-700 text-center">
                <FaChartLine className="inline mr-2 text-green-600" />
                Yuqoridagi grafik demo ma'lumotlarni ko'rsatadi. Real tizimda barcha daraxtlar uchun real-vaqtda ma'lumotlar kuzatiladi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Jamoa Section */}
      <section id="jamoa" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Bizning jamoa
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tajribali mutaxassislar va innovatsion yondashuv
            </p>
          </div>

          {/* Team Members */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: 'Nurbek Po\'latov',
                role: 'Loyiha muallif va tizim ishlab chiqaruvchisi',
                description: 'Full Stack Development, tizim arxitekturasi va loyiha boshqaruvi',
                skills: ['Full Stack', 'System Architecture', 'Project Management', 'React/Next.js'],
                image: '/nurbek.JPG',
                links: {
                  github: '#',
                  linkedin: '#',
                  twitter: '#'
                }
              },
              {
                name: 'Qamariddin Ilyasov',
                role: 'Hardware Engineer',
                description: 'Elektron platalar tuzish, firmware yozish va sensor integratsiyasi',
                skills: ['Hardware Design', 'PCB Assembly', 'Firmware', 'Sensor Integration'],
                image: '/qamariddin.jpg',
                links: {
                  github: '#',
                  linkedin: '#',
                  twitter: '#'
                }
              },
              {
                name: 'Ahliddin Najmiddinov',
                role: 'Backend & AI Developer',
                description: 'Backend infrastruktura, API dizayn va sun\'iy intellekt integratsiyasi',
                skills: ['Backend Development', 'API Design', 'AI Integration', 'PostgreSQL'],
                image: '/ahliddin.jpg',
                links: {
                  github: '#',
                  linkedin: '#',
                  twitter: '#'
                }
              },
              {
                name: 'Salohiddinov Bekzod',
                role: 'DevOps Engineer',
                description: 'CI/CD pipeline, Docker containerization, server deployment va monitoring',
                skills: ['Docker', 'CI/CD', 'Nginx', 'Linux', 'Monitoring'],
                image: null,
                icon: <FaDocker className="text-4xl" />,
                links: {
                  github: '#',
                  linkedin: '#',
                  twitter: '#'
                }
              },
              {
                name: 'Javohir Toshqurg\'onov',
                role: 'AI/ML Specialist',
                description: 'Machine Learning algoritmlari, daraxt ma\'lumotlari tahlili va bashorat modellari',
                skills: ['Machine Learning', 'Data Analysis', 'Predictive Models', 'Pattern Recognition'],
                image: null,
                icon: <FaBrain className="text-4xl" />,
                links: {
                  github: '#',
                  linkedin: '#',
                  twitter: '#'
                }
              }
            ].map((member, idx) => (
              <div 
                key={idx}
                className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="text-center mb-6">
                  {member.image ? (
                    <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-green-500 shadow-lg">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white shadow-lg">
                      {member.icon}
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-green-600 font-semibold mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.description}</p>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Ko'nikmalar:</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill, skillIdx) => (
                      <span 
                        key={skillIdx}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <a href={member.links.github} className="text-gray-600 hover:text-green-600 transition">
                    <FaGithub className="text-2xl" />
                  </a>
                  <a href={member.links.linkedin} className="text-gray-600 hover:text-green-600 transition">
                    <FaLinkedin className="text-2xl" />
                  </a>
                  <a href={member.links.twitter} className="text-gray-600 hover:text-green-600 transition">
                    <FaTwitter className="text-2xl" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Tech Stack */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 rounded-2xl text-white">
            <h3 className="text-2xl font-bold mb-6 text-center">Texnologiyalar staki</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { name: 'Frontend', techs: ['React', 'Next.js', 'Tailwind CSS', 'Three.js'] },
                { name: 'Backend', techs: ['Node.js', 'Express', 'PostgreSQL', 'Socket.IO'] },
                { name: 'Hardware', techs: ['ESP8266', 'Arduino', 'nRF24L01', 'Sensors'] },
                { name: 'DevOps', techs: ['Docker', 'GitHub Actions', 'Nginx', 'Linux'] }
              ].map((stack, idx) => (
                <div key={idx} className="bg-white/10 p-4 rounded-lg">
                  <h4 className="font-bold mb-3">{stack.name}</h4>
                  <ul className="space-y-2">
                    {stack.techs.map((tech, techIdx) => (
                      <li key={techIdx} className="flex items-center">
                        <FaCheckCircle className="mr-2 text-green-200" />
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Our Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nima uchun bizning jamoa bu muammoni hal qila oladi?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Bizning afzalliklarimiz va yondashuvimiz
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FaCode />,
                title: 'Keng tajriba',
                desc: 'Full stack development, IoT va cloud computing sohasida yillik tajriba'
              },
              {
                icon: <FaMicrochip />,
                title: 'Hardware bilimi',
                desc: 'ESP8266, sensorlar va wireless aloqa protokollarida chuqur bilim'
              },
              {
                icon: <FaServer />,
                title: 'Scalable arxitektura',
                desc: 'Kengaytiriladigan va ishonchli tizim arxitekturasi'
              },
              {
                icon: <FaShieldAlt />,
                title: 'Xavfsizlik',
                desc: 'JWT autentifikatsiya, API kalitlar va xavfsiz ma\'lumotlar uzatish'
              },
              {
                icon: <FaCloud />,
                title: 'Cloud-ready',
                desc: 'Docker va CI/CD orqali tez va samarali deployment'
              },
              {
                icon: <FaBrain />,
                title: 'AI integratsiya',
                desc: 'Ma\'lumotlarni tahlil qilish va bashorat qilish uchun AI yondashuvlari'
              }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="text-green-600 text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="yol-xaritasi" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Yo'l xaritasi
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Loyihaning rivojlanish bosqichlari
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-green-200"></div>

            <div className="space-y-12">
              {[
                {
                  phase: 'Idea',
                  status: 'completed',
                  icon: <FaLightbulb />,
                  desc: 'O\'rmon monitoring muammosini aniqlash va yechim konseptini ishlab chiqish',
                  features: ['Muammo tahlili', 'Yechim konsepti', 'Texnik talablar']
                },
                {
                  phase: 'Prototype',
                  status: 'completed',
                  icon: <FaCog />,
                  desc: 'Asosiy funksionallikni ishlab chiqish va sinovdan o\'tkazish',
                  features: ['Hardware prototip', 'Basic firmware', 'Simple dashboard']
                },
                {
                  phase: 'MVP',
                  status: 'completed',
                  icon: <FaRocket />,
                  desc: 'Minimal viable product - asosiy funksiyalar bilan ishlaydigan tizim',
                  features: ['3 Transmitter', 'Base station', 'Web dashboard', 'Real-time monitoring']
                },
                {
                  phase: 'Launched',
                  status: 'active',
                  icon: <FaCheckCircle />,
                  desc: 'Production-ready tizim - to\'liq funksionallik va deployment',
                  features: ['Production deployment', 'CI/CD pipeline', '3D visualization', 'Public sharing']
                }
              ].map((stage, idx) => (
                <div 
                  key={idx}
                  className={`relative flex flex-col md:flex-row items-center ${
                    idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`w-full md:w-5/12 ${idx % 2 === 0 ? 'md:pr-8' : 'md:pl-8 md:ml-auto'}`}>
                    <div className={`bg-white p-6 rounded-xl shadow-lg border-2 ${
                      stage.status === 'completed' ? 'border-green-500' : 
                      stage.status === 'active' ? 'border-green-600' : 'border-gray-300'
                    }`}>
                      <div className="flex items-center mb-4">
                        <div className={`p-3 rounded-lg mr-4 ${
                          stage.status === 'completed' ? 'bg-green-500' : 
                          stage.status === 'active' ? 'bg-green-600' : 'bg-gray-300'
                        } text-white text-2xl`}>
                          {stage.icon}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{stage.phase}</h3>
                          {stage.status === 'active' && (
                            <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">Joriy</span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{stage.desc}</p>
                      <ul className="space-y-2">
                        {stage.features.map((feature, featureIdx) => (
                          <li key={featureIdx} className="flex items-center text-sm text-gray-700">
                            <FaCheckCircle className={`mr-2 ${
                              stage.status === 'completed' || stage.status === 'active' 
                                ? 'text-green-500' : 'text-gray-400'
                            }`} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Timeline Dot */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white rounded-full border-4 border-green-500 items-center justify-center z-10">
                    {stage.status === 'completed' && <FaCheckCircle className="text-green-500" />}
                    {stage.status === 'active' && <FaRocket className="text-green-600" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Plan Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Yechimni amalga oshirish rejasi
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Bosqichlar, texnologiyalar va AI vositalari
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: '1. Hardware Development',
                techs: ['ESP8266', 'nRF24L01', 'DHT11', 'MQ-2', 'MPU6050'],
                ai: ['Sensor calibration algorithms', 'Noise filtering'],
                desc: 'IoT qurilmalarini yig\'ish va firmware yozish'
              },
              {
                step: '2. Backend Infrastructure',
                techs: ['Node.js', 'Express', 'PostgreSQL', 'Socket.IO', 'JWT'],
                ai: ['Data validation', 'Anomaly detection'],
                desc: 'RESTful API, WebSocket server va ma\'lumotlar bazasini yaratish'
              },
              {
                step: '3. Frontend Development',
                techs: ['React', 'Next.js', 'Tailwind CSS', 'Three.js', 'Recharts'],
                ai: ['Data visualization', '3D rendering optimization'],
                desc: 'Responsive web dashboard va 3D vizualizatsiya'
              },
              {
                step: '4. AI Integration',
                techs: ['Machine Learning', 'Pattern Recognition', 'Time Series Analysis'],
                ai: ['Predictive analytics', 'Anomaly detection', 'Alert optimization'],
                desc: 'Ma\'lumotlarni tahlil qilish va bashorat qilish'
              },
              {
                step: '5. Deployment & DevOps',
                techs: ['Docker', 'GitHub Actions', 'Nginx', 'Linux'],
                ai: ['Automated testing', 'Performance monitoring'],
                desc: 'CI/CD pipeline va production deployment'
              }
            ].map((phase, idx) => (
              <div 
                key={idx}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start mb-6">
                  <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mr-4 flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{phase.step}</h3>
                    <p className="text-gray-600 mb-4">{phase.desc}</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                          <FaCode className="mr-2 text-green-600" />
                          Texnologiyalar:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {phase.techs.map((tech, techIdx) => (
                            <span 
                              key={techIdx}
                              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                          <FaBrain className="mr-2 text-purple-600" />
                          AI vositalari:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {phase.ai.map((ai, aiIdx) => (
                            <span 
                              key={aiIdx}
                              className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                            >
                              {ai}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            O'rmonlarni himoya qilishda bizga qo'shiling
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Demo versiyani ko'rib chiqing yoki biz bilan bog'laning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login"
              className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Demo ko'rish
            </Link>
            <a 
              href="mailto:info@ormon-agentligi.uz"
              className="bg-green-800 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-900 transition border-2 border-white"
            >
              Bog'lanish
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Logo className="h-8 w-8" />
                <span className="text-xl font-bold">O'rmon agentligi</span>
              </div>
              <p className="text-gray-400">
                Aqlli daraxt monitoring tizimi
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Havolalar</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#muammo" className="hover:text-white transition">Muammo</a></li>
                <li><a href="#yechim" className="hover:text-white transition">Yechim</a></li>
                <li><a href="#jamoa" className="hover:text-white transition">Jamoa</a></li>
                <li><a href="#yol-xaritasi" className="hover:text-white transition">Yo'l xaritasi</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Texnologiyalar</h4>
              <ul className="space-y-2 text-gray-400">
                <li>React & Next.js</li>
                <li>Node.js & Express</li>
                <li>IoT & ESP8266</li>
                <li>PostgreSQL</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ijtimoiy tarmoqlar</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <FaGithub className="text-2xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <FaLinkedin className="text-2xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <FaTwitter className="text-2xl" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 O'rmon agentligi. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

