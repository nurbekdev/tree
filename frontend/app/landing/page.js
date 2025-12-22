'use client'

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic'
export const dynamicParams = true

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

      // Use requestAnimationFrame for better performance
      const rafId = requestAnimationFrame(() => {
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
      })

      return () => {
        cancelAnimationFrame(rafId)
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
              <span className="text-xl font-bold text-green-600">Dala Qo'riqchisi</span>
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
                href="#hardware" 
                className="text-gray-700 hover:text-green-600 transition"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick('#hardware')
                }}
              >
                Hardware
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
                  href="#hardware"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavClick('#hardware')
                  }}
                  className="flex items-center px-6 py-4 text-gray-800 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 active:bg-orange-50 transition-all duration-200 font-semibold border-l-4 border-transparent hover:border-orange-600 group"
                >
                  <FaMicrochip className="mr-3 text-orange-600 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:translate-x-1 transition-transform">Hardware</span>
                </a>
                <a
                  href="#healthspan"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavClick('#healthspan')
                  }}
                  className="flex items-center px-6 py-4 text-gray-800 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-700 active:bg-emerald-50 transition-all duration-200 font-semibold border-l-4 border-transparent hover:border-emerald-600 group"
                >
                  <FaBrain className="mr-3 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:translate-x-1 transition-transform">Healthspan</span>
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

      {/* Hardware Section */}
      <section id="hardware" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 fade-in-section" id="hardware-header">
            <div className="inline-block mb-6">
              <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg animate-scale-in">
                🔧 Hardware
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-slide-in-up">
              <span className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 bg-clip-text text-transparent">
                Hardware qurilmalari
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              Professional IoT qurilmalari va sensorlar tizimi - daraxtlarni real-vaqtda kuzatish va himoya qilish uchun
            </p>
          </div>

          {/* Hardware Image - Large and Professional */}
          <div className="relative fade-in-section" id="hardware-image" style={{ animationDelay: '0.4s' }}>
            <div className="bg-gradient-to-br from-white via-green-50 to-white rounded-3xl shadow-2xl p-6 md:p-10 lg:p-14 overflow-hidden border-4 border-green-300 hover:border-green-500 transition-all duration-500 transform hover:scale-[1.015] hover:shadow-3xl group">
              {/* Decorative Corner Elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-br-full opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-400/20 to-transparent rounded-tl-full opacity-50 group-hover:opacity-75 transition-opacity"></div>
              
              {/* Image Container with Enhanced Professional Styling */}
              <div className="relative w-full aspect-[21/9] md:aspect-[16/6] lg:aspect-[21/8] rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 shadow-2xl border-4 border-green-100 group-hover:border-green-300 transition-all duration-500">
                {/* Inner Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-200/10 via-transparent to-blue-200/10 pointer-events-none z-10"></div>
                
                <Image
                  src="/hardware.jpg"
                  alt="Hardware qurilmalari - IoT sensorlar va elektron platalar"
                  width={1920}
                  height={1080}
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                  priority
                  quality={100}
                />
                
                {/* Enhanced Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/5 pointer-events-none z-10"></div>
                
                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none z-10"></div>
                
                {/* Logo Watermark - Top Left Corner */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-white/85 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-md border border-green-200/40 group-hover:bg-white/95 transition-all duration-300">
                  <Logo size={20} className="flex-shrink-0" />
                  <span className="text-xs font-semibold text-green-600 whitespace-nowrap">Dala Qo'riqchisi</span>
                </div>
              </div>
              
              {/* Hardware Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {[
                  {
                    icon: <FaMicrochip />,
                    title: 'ESP8266 Mikrokontroller',
                    desc: 'Wi-Fi ulanishi va kuchli ishlov berish qobiliyati',
                    color: 'from-blue-500 to-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-300'
                  },
                  {
                    icon: <FaNetworkWired />,
                    title: 'nRF24L01 Modul',
                    desc: 'Wireless ma\'lumot uzatish uchun radio modul',
                    color: 'from-purple-500 to-purple-600',
                    bgColor: 'bg-purple-50',
                    borderColor: 'border-purple-300'
                  },
                  {
                    icon: <FaThermometerHalf />,
                    title: 'Sensorlar',
                    desc: 'DHT11, MQ-2, MPU6050 - harorat, tutun va harakat sensori',
                    color: 'from-green-500 to-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-300'
                  }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className={`${item.bgColor} p-6 rounded-xl border-2 ${item.borderColor} hover:shadow-xl transition-all duration-300 transform hover:scale-105 group`}
                  >
                    <div className={`bg-gradient-to-br ${item.color} w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl mb-4 shadow-lg transform group-hover:rotate-6 transition-transform`}>
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Technical Specifications */}
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FaCode className="mr-2 text-green-600" />
                  Texnik xususiyatlar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800">Kuchlanish:</span>
                      <span className="text-gray-600 ml-2">3.3V - 5V</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800">Aloqa:</span>
                      <span className="text-gray-600 ml-2">Wi-Fi, nRF24L01</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800">Sensorlar:</span>
                      <span className="text-gray-600 ml-2">DHT11, MQ-2, MPU6050</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800">Ishlash masofasi:</span>
                      <span className="text-gray-600 ml-2">100m+ (nRF24L01)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Hardware Info */}
          <div className="mt-12 grid md:grid-cols-2 gap-8 fade-in-section" id="hardware-info" style={{ animationDelay: '0.6s' }}>
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-gray-100 hover:border-green-300 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl mr-4 text-white text-2xl shadow-lg">
                  <FaCog />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Qanday ishlaydi?</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Har bir daraxtga o'rnatilgan transmitter qurilmalari sensorlar orqali ma'lumotlarni to'playdi va nRF24L01 modul orqali base stationga uzatadi. Base station esa Wi-Fi orqali ma'lumotlarni cloud serverga yuboradi.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Real-vaqtda ma'lumot to'plash</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Wireless ma'lumot uzatish</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Keng masofada ishlash</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-gray-100 hover:border-green-300 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl mr-4 text-white text-2xl shadow-lg">
                  <FaShieldAlt />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Xavfsizlik va ishonchlilik</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Hardware qurilmalari qiyin iqlim sharoitlarida ham ishlash uchun mo'ljallangan. Barcha qurilmalar suv va changdan himoyalangan, uzun muddatli ishlash uchun optimallashtirilgan.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Iqlim sharoitlariga chidamli</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Uzoq muddatli ishlash</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Avtomatik qayta ulanish</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Biological Healthspan™ Section */}
      <section id="healthspan" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-emerald-50 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 fade-in-section" id="healthspan-header">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-6">
              <FaBrain className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold">AI-Powered Innovation</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Biological Healthspan<sup className="text-2xl">™</sup>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Daraxtlarning biologik sog'liq holatini aniq va tushunarli ko'rsatadigan sun'iy intellekt tizimi
            </p>
          </div>

          {/* What is Healthspan? */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-emerald-200 hover:shadow-xl transition-all duration-300 fade-in-section">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-xl mr-4 shadow-lg">
                  <FaLeaf className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Nima bu Healthspan?</h3>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Biological Healthspan</strong> — bu daraxtning biologik yoshi va sog'liq holatini ko'rsatadigan ko'rsatkich.
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <FaCheckCircle className="text-emerald-500 mt-1 mr-3 flex-shrink-0" />
                  <span>Ekilgan yil asosida hisoblanadi (real yosh)</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-emerald-500 mt-1 mr-3 flex-shrink-0" />
                  <span>Atrof-muhit sharoitlari tahlil qilinadi</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-emerald-500 mt-1 mr-3 flex-shrink-0" />
                  <span>Stress yoki optimal sharoitlar biologik yoshga ta'sir qiladi</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-emerald-500 mt-1 mr-3 flex-shrink-0" />
                  <span>Har bir daraxt uchun aniq va tushunarli natija</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-2xl shadow-lg border-2 border-emerald-200 hover:shadow-xl transition-all duration-300 fade-in-section">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl mr-4 shadow-lg">
                  <FaCog className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Qanday ishlaydi?</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-emerald-100 rounded-full p-2 mr-4 flex-shrink-0">
                    <span className="text-emerald-700 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Daraxt ekiladi</p>
                    <p className="text-gray-700 text-sm">Real yosh hisoblanadi (hozirgi yil - ekilgan yil)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-emerald-100 rounded-full p-2 mr-4 flex-shrink-0">
                    <span className="text-emerald-700 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Sensorlar kuzatadi</p>
                    <p className="text-gray-700 text-sm">Harorat, namlik, tutun va harakat doimiy kuzatiladi</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-emerald-100 rounded-full p-2 mr-4 flex-shrink-0">
                    <span className="text-emerald-700 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">AI tahlil qiladi</p>
                    <p className="text-gray-700 text-sm">Sun'iy intellekt stress yoki optimal sharoitlarni aniqlaydi</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-emerald-100 rounded-full p-2 mr-4 flex-shrink-0">
                    <span className="text-emerald-700 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Biologik yosh ko'rsatiladi</p>
                    <p className="text-gray-700 text-sm">Aniq va tushunarli natija — yashil, sariq yoki qizil holat</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Example Story */}
          <div className="bg-gradient-to-br from-blue-50 to-emerald-50 p-8 md:p-12 rounded-2xl shadow-xl border-2 border-emerald-200 mb-16 fade-in-section">
            <div className="text-center mb-8">
              <FaLightbulb className="text-5xl text-emerald-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Misol: Qanday ishlaydi?</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-red-600">7.0</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Stressed Tree</p>
                    <p className="text-sm text-gray-600">Ekilgan: 2020</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Daraxt 2020-yilda ekilgan — real yoshi <strong>5 yil</strong>. 
                  Lekin yuqori harorat va tutun stressi tufayli biologik yoshi <strong>7 yil</strong>ga teng. 
                  Bu daraxt stress ostida ekanligini ko'rsatadi.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-red-600 font-semibold">+2 yil qo'shildi</p>
                  <p className="text-xs text-gray-600 mt-1">• Yuqori harorat stressi</p>
                  <p className="text-xs text-gray-600">• Tutun ta'siri</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-emerald-500">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-emerald-600">4.0</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Thriving Tree</p>
                    <p className="text-sm text-gray-600">Ekilgan: 2020</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Xuddi shu yilda ekilgan daraxt, lekin optimal sharoitlarda o'smoqda. 
                  Real yoshi <strong>5 yil</strong>, biologik yoshi esa <strong>4 yil</strong>. 
                  Bu daraxt sog'lom va yaxshi o'sayotganini ko'rsatadi.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-emerald-600 font-semibold">-1 yil ayirildi</p>
                  <p className="text-xs text-gray-600 mt-1">• Optimal harorat</p>
                  <p className="text-xs text-gray-600">• Yaxshi namlik balansi</p>
                  <p className="text-xs text-gray-600">• Toza havo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Representation */}
          <div className="mb-16 fade-in-section">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">Vizual ko'rsatkichlar</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-emerald-300 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse-glow-green">
                  <span className="text-3xl font-bold text-white">4.2</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Sog'lom</h4>
                <p className="text-sm text-gray-600">Yashil rang — optimal sharoitlar</p>
                <p className="text-xs text-emerald-600 mt-2 font-semibold">Biologik yosh &lt; real yosh</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-amber-300 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse-glow-yellow">
                  <span className="text-3xl font-bold text-white">5.0</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">O'rtacha</h4>
                <p className="text-sm text-gray-600">Sariq rang — normal holat</p>
                <p className="text-xs text-amber-600 mt-2 font-semibold">Biologik yosh ≈ real yosh</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-red-300 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse-glow-red">
                  <span className="text-3xl font-bold text-white">7.8</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Xavfli</h4>
                <p className="text-sm text-gray-600">Qizil rang — stress holati</p>
                <p className="text-xs text-red-600 mt-2 font-semibold">Biologik yosh &gt; real yosh</p>
              </div>
            </div>
          </div>

          {/* Explainability & Trust */}
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border-2 border-emerald-200 mb-16 fade-in-section">
            <div className="text-center mb-8">
              <FaShieldAlt className="text-5xl text-emerald-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Shaffoflik va ishonchlilik</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Har bir biologik yosh hisob-kitobi aniq sabablar bilan ko'rsatiladi. 
                Hech qanday "qora quti" qarorlar yo'q — hamma narsa ochiq va tushunarli.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 p-6 rounded-xl border-l-4 border-red-500">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <FaExclamationTriangle className="text-red-500 mr-2" />
                  Stress omillari
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-600 font-semibold mr-2">+2 oy</span>
                    <span>Yuqori harorat stressi tufayli</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 font-semibold mr-2">+6 oy</span>
                    <span>Tutun ta'siri (yong'in yoki ifloslanish)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 font-semibold mr-2">+3 oy</span>
                    <span>Past namlik davri</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 font-semibold mr-2">+4 oy</span>
                    <span>Abnormal harakat (kesish yoki shikastlanish)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-50 p-6 rounded-xl border-l-4 border-emerald-500">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <FaCheckCircle className="text-emerald-500 mr-2" />
                  Optimal sharoitlar
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-emerald-600 font-semibold mr-2">-2 oy</span>
                    <span>Optimal harorat sharoitlari</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 font-semibold mr-2">-3 oy</span>
                    <span>Yaxshi namlik balansi</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 font-semibold mr-2">-4 oy</span>
                    <span>Toza havo (past tutun)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 font-semibold mr-2">-2 oy</span>
                    <span>Barqaror o'sish sharoitlari</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mb-16 fade-in-section">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">Foydalar</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <FaExclamationTriangle />,
                  title: 'Xavfli daraxtlarni aniqlash',
                  desc: 'Stress ostidagi daraxtlarni darhol ko\'ring va ularga e\'tibor bering'
                },
                {
                  icon: <FaChartLine />,
                  title: 'Tekshiruv vaqtini qisqartirish',
                  desc: 'Qaysi daraxtlarga ehtiyoj borligini oldindan biling'
                },
                {
                  icon: <FaCog />,
                  title: 'Samarali texnik xizmat',
                  desc: 'Resurslarni eng zarur joylarga yo\'naltiring'
                },
                {
                  icon: <FaDatabase />,
                  title: 'Ma\'lumotlarga asoslangan qarorlar',
                  desc: 'His-hisoblar emas, aniq ma\'lumotlar asosida qaror qiling'
                },
                {
                  icon: <FaBell />,
                  title: 'Erta xavf aniqlash',
                  desc: 'Atrof-muhit tahdidlarini erta aniqlang va oldini oling'
                },
                {
                  icon: <FaLeaf />,
                  title: 'O\'rmon va bog\' boshqaruvi',
                  desc: 'Yashil maydonlarni samarali boshqaring va kuzatib boring'
                }
              ].map((benefit, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-lg border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-xl transition-all duration-300">
                  <div className="text-emerald-600 text-3xl mb-4">{benefit.icon}</div>
                  <h4 className="font-bold text-gray-900 mb-2">{benefit.title}</h4>
                  <p className="text-gray-600 text-sm">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Section (High-level) */}
          <div className="bg-gradient-to-br from-gray-50 to-emerald-50 p-8 md:p-12 rounded-2xl shadow-xl border-2 border-emerald-200 fade-in-section">
            <div className="text-center mb-8">
              <FaMicrochip className="text-5xl text-emerald-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Texnologiya</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Qiyin texnik tafsilotlar emas — oddiy va ishonchli yechim
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: <FaNetworkWired />,
                  title: 'IoT Sensorlar',
                  desc: 'Har bir daraxtga o\'rnatilgan sensorlar'
                },
                {
                  icon: <FaWifi />,
                  title: 'Real-vaqtda uzatish',
                  desc: 'Ma\'lumotlar darhol cloud\'ga uzatiladi'
                },
                {
                  icon: <FaBrain />,
                  title: 'AI tahlil',
                  desc: 'Sun\'iy intellekt biologik yoshni hisoblaydi'
                },
                {
                  icon: <FaCloud />,
                  title: 'Cloud Dashboard',
                  desc: 'Har qanday qurilmadan kirish mumkin'
                }
              ].map((tech, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-md text-center">
                  <div className="text-emerald-600 text-4xl mb-4">{tech.icon}</div>
                  <h4 className="font-bold text-gray-900 mb-2">{tech.title}</h4>
                  <p className="text-gray-600 text-sm">{tech.desc}</p>
                </div>
              ))}
            </div>
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

      {/* Roadmap Section - Redesigned */}
      <section id="yol-xaritasi" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 relative overflow-hidden">
        {/* Enhanced Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-gradient-to-br from-green-200/30 to-green-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float"></div>
          <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-blue-200/30 to-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '3s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 fade-in-section" id="roadmap-header">
            <div className="inline-block mb-6">
              <span className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white px-8 py-3 rounded-full text-sm font-bold shadow-2xl animate-scale-in">
                🚀 Rivojlanish Yo'l Xaritasi
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-slide-in-up">
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Loyiha Tarixi
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              Har bir bosqich - muvaffaqiyatga olib boradigan qadam
            </p>
            
            {/* Enhanced Progress Bar with Milestones */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full h-4 overflow-hidden shadow-inner border-2 border-gray-300">
                <div 
                  className="bg-gradient-to-r from-yellow-400 via-blue-500 via-purple-500 to-green-500 h-full rounded-full transition-all duration-2000 relative overflow-hidden"
                  style={{ width: '100%' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  <div className="absolute inset-0 shimmer opacity-50"></div>
                </div>
              </div>
              <div className="flex justify-between mt-4 text-sm font-semibold">
                <span className="text-yellow-600">Idea</span>
                <span className="text-blue-600">Prototype</span>
                <span className="text-purple-600">MVP</span>
                <span className="text-green-600 font-bold text-base">Launched ✓</span>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Modern Vertical Timeline Line with Enhanced Design - Lower z-index */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-yellow-300 via-blue-400 via-purple-400 to-green-500 shadow-2xl rounded-full z-[1]">
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-400 via-blue-500 via-purple-500 to-green-600 rounded-full shimmer opacity-80"></div>
            </div>
            
            {/* Simplified Progress Indicators - Proper spacing to avoid overlap */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full z-[2] pointer-events-none">
              {[
                { progress: 5, status: 'completed', colorClass: 'yellow', borderClass: 'border-yellow-500', bgClass: 'from-yellow-400 to-yellow-600' },
                { progress: 35, status: 'completed', colorClass: 'blue', borderClass: 'border-blue-500', bgClass: 'from-blue-400 to-blue-600' },
                { progress: 65, status: 'completed', colorClass: 'purple', borderClass: 'border-purple-500', bgClass: 'from-purple-400 to-purple-600' },
                { progress: 95, status: 'active', colorClass: 'green', borderClass: 'border-green-500', bgClass: 'from-green-400 to-green-600' }
              ].map((marker, idx) => (
                <div
                  key={idx}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ top: `${marker.progress}%` }}
                >
                  {/* Simplified Main Circle - No overlapping effects */}
                  <div className={`relative w-14 h-14 bg-white rounded-full border-2 ${marker.borderClass} shadow-lg flex items-center justify-center`}>
                    <div className={`w-10 h-10 bg-gradient-to-br ${marker.bgClass} rounded-full flex items-center justify-center text-white text-base shadow-inner`}>
                      {marker.status === 'completed' ? (
                        <FaCheckCircle className="text-sm" />
                      ) : marker.status === 'active' ? (
                        <FaRocket className="text-sm" />
                      ) : null}
                    </div>
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
                  desc: 'Dala monitoring muammosini aniqlash va yechim konseptini ishlab chiqish',
                  features: ['Muammo tahlili', 'Yechim konsepti', 'Texnik talablar', 'Loyiha rejasi'],
                  date: '2024 Yanvar - Mart',
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
                  date: '2024 Aprel - Iyun',
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
                  date: '2024 Iyul - Sentabr',
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
                  features: ['Production deployment', 'CI/CD pipeline', '3D visualization', 'Public sharing', 'Mobile responsive', 'Hardware optimizatsiya'],
                  date: '2024 Oktabr - 2025 Yanvar',
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
                  <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    {/* Left Side - Even Index */}
                    <div className={`w-full md:w-5/12 ${idx % 2 === 0 ? 'md:order-1' : 'md:order-2'} relative z-30`}>
                      <div className={`relative ${stage.bgColor} p-8 md:p-10 rounded-3xl shadow-2xl border-4 ${stage.borderColor} transform hover:scale-[1.01] hover:shadow-3xl transition-all duration-300 overflow-hidden group z-30 backdrop-blur-sm`}>
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 shimmer"></div>
                        </div>
                        
                        {/* Status Badge with Animation - Improved spacing and sizing */}
                        <div className="absolute -top-2 -right-2 z-10">
                          {stage.status === 'completed' ? (
                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-full text-sm md:text-base font-bold shadow-xl flex items-center gap-2.5 min-w-fit">
                              <FaCheckCircle className="text-base md:text-lg flex-shrink-0" />
                              <span className="whitespace-nowrap">Tugallandi</span>
                            </div>
                          ) : stage.status === 'active' ? (
                            <div className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white px-5 py-2.5 rounded-full text-sm md:text-base font-bold shadow-xl flex items-center gap-2.5 min-w-fit animate-pulse">
                              <FaRocket className="text-base md:text-lg flex-shrink-0" />
                              <span className="whitespace-nowrap">Joriy</span>
                            </div>
                          ) : null}
                        </div>

                        {/* Phase Header - Enhanced */}
                        <div className="flex items-center mb-8 relative z-10">
                          <div className={`bg-gradient-to-br ${stage.color} p-6 rounded-2xl mr-5 text-white text-4xl shadow-2xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                            <div className="relative z-10">{stage.icon}</div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{stage.phase}</h3>
                            <div className="flex items-center">
                              <span className="text-base md:text-lg text-gray-600 font-semibold bg-white/70 px-4 py-1.5 rounded-full border-2 border-gray-200">{stage.date}</span>
                            </div>
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
                    
                    {/* Simplified Center Timeline Dot - Desktop - Proper positioning */}
                    <div className={`hidden md:flex absolute left-1/2 transform -translate-x-1/2 z-[3] pointer-events-none`} style={{ top: `${idx === 0 ? '5%' : idx === 1 ? '35%' : idx === 2 ? '65%' : '95%'}` }}>
                      <div className={`w-14 h-14 ${stage.bgColor} rounded-full border-2 ${stage.borderColor} items-center justify-center shadow-lg flex relative`}>
                        <div className={`bg-gradient-to-br ${stage.color} w-10 h-10 rounded-full flex items-center justify-center text-white text-base shadow-inner`}>
                          {stage.status === 'completed' && <FaCheckCircle className="text-sm" />}
                          {stage.status === 'active' && <FaRocket className="text-sm" />}
                          {stage.status === 'pending' && <FaCog className="text-sm" />}
                        </div>
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
            Dalalarni himoya qilishda bizga qo'shiling
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
              href="mailto:info@dala-qoriqchisi.uz"
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
                <span className="text-xl font-bold">Dala Qo'riqchisi</span>
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
                <li><a href="#hardware" className="hover:text-white transition">Hardware</a></li>
                <li><a href="#healthspan" className="hover:text-white transition">Healthspan</a></li>
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
            <p>&copy; 2025 Dala Qo'riqchisi. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

