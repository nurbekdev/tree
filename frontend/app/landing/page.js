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
  const [visibleSections, setVisibleSections] = useState(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Mark component as mounted to avoid hydration mismatch
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only run on client side after mount
    if (!mounted || typeof window === 'undefined') return

    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mounted])

  // Intersection Observer for scroll animations
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    try {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target) {
            entry.target.classList.add('is-visible')
            if (entry.target.id) {
              setVisibleSections((prev) => new Set([...prev, entry.target.id]))
            }
          }
        })
      }, observerOptions)

      // Use setTimeout to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        try {
          const sections = document.querySelectorAll('.fade-in-section')
          sections.forEach((section) => {
            if (section && observer) {
              observer.observe(section)
            }
          })
        } catch (error) {
          console.warn('Error observing sections:', error)
        }
      }, 300)

      return () => {
        clearTimeout(timeoutId)
        try {
          const sections = document.querySelectorAll('.fade-in-section')
          sections.forEach((section) => {
            if (section && observer) {
              observer.unobserve(section)
            }
          })
          if (observer) {
            observer.disconnect()
          }
        } catch (error) {
          console.warn('Error cleaning up observer:', error)
        }
      }
    } catch (error) {
      console.warn('Intersection Observer not supported:', error)
    }
  }, [])

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false)
    if (typeof window !== 'undefined') {
      const element = document.querySelector(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        mounted && scrolled ? 'bg-white shadow-lg' : 'bg-white md:bg-transparent'
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
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-green-50 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 fade-in-section" id="hero-content">
            <div className="inline-block mb-6">
              <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg animate-scale-in">
                ✨ Innovatsion yechim
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-slide-in-up">
              <span className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 bg-clip-text text-transparent animate-pulse">
                Aqlli daraxt
              </span>
              <br />
              <span className="text-gray-800">monitoring tizimi</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              Real-vaqtda daraxtlarni kuzatish, xavfsizlikni ta'minlash va o'rmon resurslarini himoya qilish
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
              <Link 
                href="/login"
                className="group bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center"
              >
                <span>Demo ko'rish</span>
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#yechim"
                className="group bg-white text-green-600 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-green-600 hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('#yechim')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Batafsil ma'lumot
              </a>
            </div>
          </div>

          {/* Enhanced Stats with Progress */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { value: '24/7', label: 'Kuzatuv', icon: <FaBell />, progress: 100, color: 'green' },
              { value: 'Real-vaqt', label: 'Ma\'lumotlar', icon: <FaChartLine />, progress: 100, color: 'blue' },
              { value: '100%', label: 'Xavfsizlik', icon: <FaShieldAlt />, progress: 100, color: 'green' },
              { value: 'AI', label: 'Tahlil', icon: <FaBrain />, progress: 100, color: 'purple' }
            ].map((stat, idx) => (
              <div 
                key={idx}
                className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-green-200 fade-in-section"
                id={`stat-${idx}`}
                style={{ animationDelay: `${0.6 + idx * 0.1}s` }}
              >
                <div className={`text-4xl mb-3 text-${stat.color}-600 flex justify-center`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 mb-3">{stat.label}</div>
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 h-full rounded-full progress-animate`}
                    style={{ width: `${stat.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Muammo → Yechim Section */}
      <section id="muammo" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in-section" id="muammo-header">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 animate-slide-in-up">
              Muammo <span className="text-green-600 animate-pulse">→</span> Yechim
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              O'rmon xavfsizligi va monitoring muammolariga innovatsion yechim
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Muammo */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl border-2 border-red-300 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 fade-in-section" id="muammo-card">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl mr-4 shadow-lg transform hover:rotate-12 transition-transform">
                  <FaExclamationTriangle className="text-white text-3xl animate-pulse" />
                </div>
                <h3 className="text-3xl font-bold text-red-700">Muammo</h3>
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
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border-2 border-green-300 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 fade-in-section" id="yechim-card">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl mr-4 shadow-lg transform hover:rotate-12 transition-transform">
                  <FaCheckCircle className="text-white text-3xl animate-pulse" />
                </div>
                <h3 className="text-3xl font-bold text-green-700">Yechim</h3>
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

          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8">
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
                <ResponsiveContainer width="100%" height={300} className="sm:h-[350px] md:h-[400px]">
                  <AreaChart data={demoData} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
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
                      height={60}
                      tick={{ fontSize: 10 }}
                      stroke="#6b7280"
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      yAxisId="left" 
                      label={{ value: 'Harorat/Namlik', angle: -90, position: 'insideLeft', style: { fontSize: '10px' } }}
                      stroke="#3b82f6"
                      tick={{ fontSize: 10 }}
                      width={50}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      label={{ value: 'Tutun', angle: 90, position: 'insideRight', style: { fontSize: '10px' } }}
                      stroke="#f59e0b"
                      tick={{ fontSize: 10 }}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
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
                      wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
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
                      strokeWidth={2}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="namlik"
                      stroke="#22c55e"
                      fillOpacity={1}
                      fill="url(#colorHumidity)"
                      name="namlik"
                      strokeWidth={2}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="tutun"
                      stroke="#f59e0b"
                      fillOpacity={1}
                      fill="url(#colorSmoke)"
                      name="tutun"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )
            })()}

            {/* Stats Cards - Mobile Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
              <div className="bg-blue-50 p-4 md:p-6 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FaThermometerHalf className="text-blue-600 text-xl md:text-2xl mr-2 md:mr-3" />
                    <h4 className="font-semibold text-gray-700 text-sm md:text-base">Harorat</h4>
                  </div>
                  <span className="text-xl md:text-2xl font-bold text-blue-600">24°C</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600">O'rtacha: 22-26°C</p>
              </div>
              <div className="bg-green-50 p-4 md:p-6 rounded-xl border-2 border-green-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FaTint className="text-green-600 text-xl md:text-2xl mr-2 md:mr-3" />
                    <h4 className="font-semibold text-gray-700 text-sm md:text-base">Namlik</h4>
                  </div>
                  <span className="text-xl md:text-2xl font-bold text-green-600">48%</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600">O'rtacha: 45-55%</p>
              </div>
              <div className="bg-amber-50 p-4 md:p-6 rounded-xl border-2 border-amber-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FaFire className="text-amber-600 text-xl md:text-2xl mr-2 md:mr-3" />
                    <h4 className="font-semibold text-gray-700 text-sm md:text-base">Tutun</h4>
                  </div>
                  <span className="text-xl md:text-2xl font-bold text-amber-600">125 ppm</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600">Xavfsiz daraja</p>
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

          {/* Team Members - Enhanced */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
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
                className="bg-gradient-to-br from-green-50 via-white to-green-50 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-green-300 group fade-in-section"
                id={`team-member-${idx}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="text-center mb-6">
                  {member.image ? (
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-green-500 shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      {member.icon}
                    </div>
                  )}
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition">{member.name}</h3>
                  <p className="text-green-600 font-semibold mb-2 text-sm md:text-base">{member.role}</p>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{member.description}</p>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FaCode className="mr-2 text-green-500" />
                    Ko'nikmalar:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill, skillIdx) => (
                      <span 
                        key={skillIdx}
                        className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium hover:bg-green-200 hover:scale-105 transition-all duration-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center space-x-4 pt-4 border-t border-green-200">
                  <a href={member.links.github} className="text-gray-600 hover:text-green-600 hover:scale-125 transition-all duration-200 transform">
                    <FaGithub className="text-xl md:text-2xl" />
                  </a>
                  <a href={member.links.linkedin} className="text-gray-600 hover:text-green-600 hover:scale-125 transition-all duration-200 transform">
                    <FaLinkedin className="text-xl md:text-2xl" />
                  </a>
                  <a href={member.links.twitter} className="text-gray-600 hover:text-green-600 hover:scale-125 transition-all duration-200 transform">
                    <FaTwitter className="text-xl md:text-2xl" />
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
      <section id="yol-xaritasi" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-green-50 to-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 fade-in-section" id="roadmap-header">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 animate-slide-in-up">
              Yo'l xaritasi
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-6 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              Loyihaning rivojlanish bosqichlari va muvaffaqiyatlar
            </p>
            
            {/* Progress Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 h-full rounded-full transition-all duration-1000"
                  style={{ width: '100%' }}
                >
                  <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>Idea</span>
                <span>Prototype</span>
                <span>MVP</span>
                <span className="font-bold text-green-600">Launched ✓</span>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Enhanced Timeline Line with Gradient and Animation */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-2 bg-gradient-to-b from-green-300 via-green-500 to-green-700 shadow-2xl rounded-full">
              <div className="absolute inset-0 bg-gradient-to-b from-green-400 via-green-500 to-green-600 rounded-full shimmer"></div>
            </div>
            
            {/* Enhanced Progress Indicators on Timeline - Fixed z-index */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full z-0">
              {[
                { progress: 0, status: 'completed', colorClass: 'yellow', borderClass: 'border-yellow-500', bgClass: 'from-yellow-400 to-yellow-600', glowClass: 'bg-yellow-200', ringClass: 'border-yellow-400', badgeClass: 'bg-yellow-500' },
                { progress: 33, status: 'completed', colorClass: 'blue', borderClass: 'border-blue-500', bgClass: 'from-blue-400 to-blue-600', glowClass: 'bg-blue-200', ringClass: 'border-blue-400', badgeClass: 'bg-blue-500' },
                { progress: 66, status: 'completed', colorClass: 'purple', borderClass: 'border-purple-500', bgClass: 'from-purple-400 to-purple-600', glowClass: 'bg-purple-200', ringClass: 'border-purple-400', badgeClass: 'bg-purple-500' },
                { progress: 100, status: 'active', colorClass: 'green', borderClass: 'border-green-500', bgClass: 'from-green-400 to-green-600', glowClass: 'bg-green-200', ringClass: 'border-green-400', badgeClass: 'bg-green-500' }
              ].map((marker, idx) => (
                <div
                  key={idx}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-0"
                  style={{ top: `${marker.progress}%` }}
                >
                  {/* Outer Glow */}
                  <div className={`absolute inset-0 w-20 h-20 ${marker.glowClass} rounded-full opacity-30 blur-xl animate-pulse -z-10`}></div>
                  
                  {/* Main Circle */}
                  <div className={`relative w-20 h-20 bg-white rounded-full border-4 ${marker.borderClass} shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 z-0`}>
                    {/* Inner Gradient Circle */}
                    <div className={`w-14 h-14 bg-gradient-to-br ${marker.bgClass} rounded-full flex items-center justify-center text-white text-2xl shadow-inner`}>
                      {marker.status === 'completed' ? (
                        <FaCheckCircle className="animate-scale-in" />
                      ) : marker.status === 'active' ? (
                        <FaRocket className="animate-bounce" />
                      ) : null}
                    </div>
                    
                    {/* Pulse Rings */}
                    {marker.status === 'active' && (
                      <>
                        <div className={`absolute inset-0 border-4 ${marker.ringClass} rounded-full animate-ping opacity-75 -z-10`}></div>
                        <div className={`absolute inset-0 border-4 ${marker.ringClass} rounded-full animate-ping opacity-50 -z-10`} style={{ animationDelay: '0.5s' }}></div>
                      </>
                    )}
                    
                    {/* Completed Checkmark Ring */}
                    {marker.status === 'completed' && idx < 3 && (
                      <div className={`absolute -inset-2 border-2 ${marker.ringClass} rounded-full animate-pulse opacity-50 -z-10`}></div>
                    )}
                  </div>
                  
                  {/* Progress Number Badge - moved to avoid overlap */}
                  <div className={`absolute -bottom-10 left-1/2 transform -translate-x-1/2 ${marker.badgeClass} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap z-0`}>
                    {marker.progress === 0 ? 'Start' : marker.progress === 100 ? 'Current' : `${marker.progress}%`}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-16 md:space-y-20">
              {[
                {
                  phase: 'Idea',
                  status: 'completed',
                  icon: <FaLightbulb />,
                  desc: 'O\'rmon monitoring muammosini aniqlash va yechim konseptini ishlab chiqish',
                  features: ['Muammo tahlili', 'Yechim konsepti', 'Texnik talablar', 'Loyiha rejasi'],
                  date: '2024 Q1',
                  progress: 100,
                  color: 'from-yellow-400 to-yellow-600',
                  bgColor: 'bg-yellow-50',
                  borderColor: 'border-yellow-400',
                  iconColor: 'yellow'
                },
                {
                  phase: 'Prototype',
                  status: 'completed',
                  icon: <FaCog />,
                  desc: 'Asosiy funksionallikni ishlab chiqish va sinovdan o\'tkazish',
                  features: ['Hardware prototip', 'Basic firmware', 'Simple dashboard', 'Sensor integratsiyasi'],
                  date: '2024 Q2',
                  progress: 100,
                  color: 'from-blue-400 to-blue-600',
                  bgColor: 'bg-blue-50',
                  borderColor: 'border-blue-400',
                  iconColor: 'blue'
                },
                {
                  phase: 'MVP',
                  status: 'completed',
                  icon: <FaRocket />,
                  desc: 'Minimal viable product - asosiy funksiyalar bilan ishlaydigan tizim',
                  features: ['3 Transmitter', 'Base station', 'Web dashboard', 'Real-time monitoring', 'Alert tizimi'],
                  date: '2024 Q3',
                  progress: 100,
                  color: 'from-purple-400 to-purple-600',
                  bgColor: 'bg-purple-50',
                  borderColor: 'border-purple-400',
                  iconColor: 'purple'
                },
                {
                  phase: 'Launched',
                  status: 'active',
                  icon: <FaCheckCircle />,
                  desc: 'Production-ready tizim - to\'liq funksionallik va deployment',
                  features: ['Production deployment', 'CI/CD pipeline', '3D visualization', 'Public sharing', 'Mobile responsive'],
                  date: '2024 Q4',
                  progress: 100,
                  color: 'from-green-400 to-green-600',
                  bgColor: 'bg-green-50',
                  borderColor: 'border-green-500',
                  iconColor: 'green'
                }
              ].map((stage, idx) => (
                <div 
                  key={idx}
                  className="relative fade-in-section z-10"
                  id={`roadmap-stage-${idx}`}
                >
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Left Side - Even Index */}
                    <div className={`w-full md:w-5/12 ${idx % 2 === 0 ? 'md:order-1' : 'md:order-2'} ${idx % 2 === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right'} relative z-20`}>
                      <div className={`relative ${stage.bgColor} p-8 rounded-2xl shadow-xl border-2 ${stage.borderColor} transform hover:scale-105 hover:shadow-2xl transition-all duration-300 overflow-hidden group z-20`}>
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 shimmer"></div>
                        </div>
                        
                        {/* Status Badge with Animation */}
                        <div className="absolute -top-4 -right-4 z-10">
                          {stage.status === 'completed' ? (
                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-xl flex items-center transform hover:scale-110 transition-transform animate-scale-in">
                              <FaCheckCircle className="mr-2 text-lg" />
                              Tugallandi
                            </div>
                          ) : stage.status === 'active' ? (
                            <div className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-xl flex items-center animate-pulse transform hover:scale-110 transition-transform">
                              <FaRocket className="mr-2 text-lg animate-bounce" />
                              Joriy
                            </div>
                          ) : null}
                        </div>

                        {/* Phase Header */}
                        <div className="flex items-center mb-6 relative z-10">
                          <div className={`bg-gradient-to-br ${stage.color} p-5 rounded-xl mr-4 text-white text-3xl shadow-xl transform group-hover:rotate-6 transition-transform duration-300`}>
                            {stage.icon}
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stage.phase}</h3>
                            <p className="text-sm text-gray-500 font-semibold">{stage.date}</p>
                          </div>
                        </div>

                        {/* Animated Progress Bar */}
                        <div className="mb-6 relative z-10">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-700">Progress</span>
                            <span className="text-sm font-bold text-green-600">{stage.progress}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                            <div 
                              className={`bg-gradient-to-r ${stage.color} h-full rounded-full progress-animate shadow-md relative overflow-hidden`}
                              style={{ width: `${stage.progress}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                              <div className="absolute inset-0 shimmer opacity-50"></div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 mb-6 text-lg leading-relaxed relative z-10">{stage.desc}</p>

                        {/* Features with Animation */}
                        <div className="space-y-3 relative z-10">
                          <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                            <FaCheckCircle className="mr-2 text-green-500 animate-pulse" />
                            Amalga oshirilgan:
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {stage.features.map((feature, featureIdx) => (
                              <div 
                                key={featureIdx} 
                                className="flex items-center bg-white/70 px-3 py-2.5 rounded-lg border-2 border-gray-200 hover:border-green-400 hover:bg-white hover:shadow-md transition-all duration-300 transform hover:scale-105 group"
                                style={{ animationDelay: `${featureIdx * 0.1}s` }}
                              >
                                <FaCheckCircle className={`mr-2 flex-shrink-0 ${
                                  stage.status === 'completed' || stage.status === 'active' 
                                    ? 'text-green-500 group-hover:scale-125 transition-transform' : 'text-gray-400'
                                }`} />
                                <span className="text-sm text-gray-700 font-medium">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Center Timeline Dot - Desktop - Lower z-index */}
                    <div className={`hidden md:flex absolute left-1/2 transform -translate-x-1/2 z-0`}>
                      <div className={`w-24 h-24 ${stage.bgColor} rounded-full border-4 ${stage.borderColor} items-center justify-center shadow-2xl flex transform hover:scale-110 transition-all duration-300 z-0`}>
                        <div className={`bg-gradient-to-br ${stage.color} w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl shadow-inner relative`}>
                          {stage.status === 'completed' && <FaCheckCircle className="animate-scale-in" />}
                          {stage.status === 'active' && <FaRocket className="animate-bounce" />}
                          {stage.status === 'pending' && <FaCog className="animate-spin" />}
                        </div>
                        {/* Multiple Pulse Rings for Active */}
                        {stage.status === 'active' && (
                          <>
                            <div className={`absolute inset-0 border-4 ${stage.borderColor.replace('border-', 'border-').replace('-500', '-400')} rounded-full animate-ping opacity-75`}></div>
                            <div className={`absolute inset-0 border-4 ${stage.borderColor.replace('border-', 'border-').replace('-500', '-300')} rounded-full animate-ping opacity-50`} style={{ animationDelay: '0.3s' }}></div>
                            <div className={`absolute inset-0 border-4 ${stage.borderColor.replace('border-', 'border-').replace('-500', '-200')} rounded-full animate-ping opacity-25`} style={{ animationDelay: '0.6s' }}></div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right Side - Odd Index */}
                    <div className={`w-full md:w-5/12 ${idx % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                      {/* Empty space for alignment */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats with Progress */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Tugallangan bosqichlar', value: '3/4', icon: <FaCheckCircle />, colorClass: 'text-green-600', progressClass: 'from-green-500 to-green-600', progress: 75 },
              { label: 'Joriy bosqich', value: 'Launched', icon: <FaRocket />, colorClass: 'text-green-600', progressClass: 'from-green-500 to-green-600', progress: 100 },
              { label: 'Progress', value: '100%', icon: <FaChartLine />, colorClass: 'text-blue-600', progressClass: 'from-blue-500 to-blue-600', progress: 100 },
              { label: 'Status', value: 'Active', icon: <FaLeaf />, colorClass: 'text-green-600', progressClass: 'from-green-500 to-green-600', progress: 100 }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-100 text-center hover:border-green-300 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 fade-in-section"
                id={`summary-stat-${idx}`}
                style={{ animationDelay: `${0.8 + idx * 0.1}s` }}
              >
                <div className={`text-4xl mb-4 ${stat.colorClass} flex justify-center transform hover:scale-125 transition-transform`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600 mb-3">{stat.label}</div>
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`bg-gradient-to-r ${stat.progressClass} h-full rounded-full progress-animate`}
                    style={{ width: `${stat.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
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
                techs: ['ESP8266', 'nRF24L01', 'DHT11', 'MQ-2', 'MPU6050', 'Arduino IDE', 'C++'],
                ai: [
                  'Sensor calibration algorithms (kalibratsiya algoritmlari)',
                  'Noise filtering (shovqin filtrlash)',
                  'Signal processing (signal qayta ishlash)',
                  'Adaptive threshold detection (moslashuvchan threshold aniqlash)'
                ],
                desc: 'IoT qurilmalarini yig\'ish, firmware yozish va sensor integratsiyasi. Real-vaqtda ma\'lumotlarni to\'plash va qayta ishlash.',
                details: 'ESP8266 mikrokontrollerlarida sensor ma\'lumotlarini to\'plash, nRF24L01 orqali wireless aloqa, MPU6050 bilan daraxt holatini aniqlash.'
              },
              {
                step: '2. Backend Infrastructure',
                techs: ['Node.js', 'Express.js', 'PostgreSQL', 'Socket.IO', 'JWT', 'RESTful API', 'WebSocket'],
                ai: [
                  'Data validation algorithms (ma\'lumotlar tekshirish)',
                  'Anomaly detection (g\'ayritabiiy holatlarni aniqlash)',
                  'Real-time data processing (real-vaqtda ma\'lumot qayta ishlash)',
                  'Pattern recognition (naqshlarni tan olish)'
                ],
                desc: 'RESTful API, WebSocket server, ma\'lumotlar bazasi va real-vaqtda ma\'lumotlar uzatish tizimini yaratish.',
                details: 'PostgreSQL bilan ma\'lumotlarni saqlash, Socket.IO orqali real-vaqtda yangilanishlar, JWT bilan xavfsiz autentifikatsiya.'
              },
              {
                step: '3. Frontend Development',
                techs: ['React', 'Next.js', 'Tailwind CSS', 'Three.js', 'Recharts', 'TypeScript', 'Responsive Design'],
                ai: [
                  'Data visualization algorithms (ma\'lumotlarni vizualizatsiya)',
                  '3D rendering optimization (3D render optimizatsiyasi)',
                  'Interactive chart generation (interaktiv grafiklar)',
                  'Real-time UI updates (real-vaqtda UI yangilanishlar)'
                ],
                desc: 'Responsive web dashboard, 3D vizualizatsiya va real-vaqtda ma\'lumotlarni ko\'rsatish.',
                details: 'Next.js bilan SSR, Three.js orqali 3D daraxt modellari, Recharts bilan telemetriya grafiklari, Tailwind CSS bilan zamonaviy dizayn.'
              },
              {
                step: '4. AI & Machine Learning Integration',
                techs: ['Python', 'TensorFlow', 'Scikit-learn', 'Time Series Analysis', 'Pattern Recognition', 'Predictive Models'],
                ai: [
                  'Predictive analytics (bashorat tahlili) - daraxt holatini bashorat qilish',
                  'Anomaly detection algorithms (g\'ayritabiiy holatlarni aniqlash) - yong\'in va kesishni erta aniqlash',
                  'Alert optimization (xabarnomalarni optimallashtirish) - aqlli xabarnoma tizimi',
                  'Time series forecasting (vaqt seriyalari bashorati) - harorat va namlik tendentsiyalarini bashorat qilish',
                  'Pattern recognition (naqshlarni tan olish) - sensor ma\'lumotlaridagi naqshlarni aniqlash',
                  'Data clustering (ma\'lumotlar klasterlash) - daraxtlarni guruhlash'
                ],
                desc: 'Ma\'lumotlarni tahlil qilish, bashorat modellari yaratish va aqlli xabarnoma tizimini ishlab chiqish.',
                details: 'Machine Learning modellari orqali daraxt holatini bashorat qilish, anomaliyalarni aniqlash va xavfli holatlarni erta ogohlantirish.'
              },
              {
                step: '5. Deployment & DevOps',
                techs: ['Docker', 'GitHub Actions', 'Nginx', 'Linux', 'CI/CD', 'Monitoring', 'SSL/TLS'],
                ai: [
                  'Automated testing (avtomatik testlar) - unit va integration testlar',
                  'Performance monitoring (samaradorlik monitoringi) - tizim ishlashini kuzatish',
                  'Error detection (xatoliklarni aniqlash) - avtomatik xatolik aniqlash',
                  'Load balancing optimization (yuk balanslash optimizatsiyasi)'
                ],
                desc: 'CI/CD pipeline, Docker containerization, production deployment va monitoring tizimini sozlash.',
                details: 'GitHub Actions orqali avtomatik deployment, Docker bilan containerization, Nginx bilan reverse proxy va SSL sertifikatlari.'
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
                    <p className="text-gray-600 mb-3">{phase.desc}</p>
                    {phase.details && (
                      <p className="text-sm text-gray-500 mb-4 italic">{phase.details}</p>
                    )}
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                          <FaCode className="mr-2 text-green-600 text-lg" />
                          Texnologiyalar:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {phase.techs.map((tech, techIdx) => (
                            <span 
                              key={techIdx}
                              className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-blue-200 transition"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                          <FaBrain className="mr-2 text-purple-600 text-lg" />
                          AI vositalari va yechimlar:
                        </h4>
                        <div className="space-y-2">
                          {phase.ai.map((ai, aiIdx) => (
                            <div 
                              key={aiIdx}
                              className="bg-purple-50 border-l-4 border-purple-500 px-3 py-2 rounded-r-lg hover:bg-purple-100 transition"
                            >
                              <p className="text-sm text-purple-800 font-medium">{ai}</p>
                            </div>
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

