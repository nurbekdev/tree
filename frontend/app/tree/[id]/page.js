'use client'

// Force dynamic rendering for this route (no static generation)
export const dynamic = 'force-dynamic'
export const dynamicParams = true

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format, subDays } from 'date-fns'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { FiDownload, FiTrash2 } from 'react-icons/fi'
import { treesAPI } from '@/lib/api'
import Logo from '@/components/Logo'
import TreeAgeScore from '@/components/TreeAgeScore'
import AIInsightsPanel from '@/components/AIInsightsPanel'
import HealthspanBreakdown from '@/components/HealthspanBreakdown'
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

// Dynamically import 3D Tree visualization to avoid SSR issues
const Tree3D = dynamic(() => import('@/components/Tree3D'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gradient-to-b from-sky-100 to-blue-50 rounded-lg flex items-center justify-center text-gray-500">3D model yuklanmoqda...</div>
})

// Dynamically import Leaflet map to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">Xarita yuklanmoqda...</div>
})

const translations = {
  title: "Daraxt ma'lumotlari",
  treeId: "Daraxt ID",
  species: "Turi",
  plantedYear: "Ekilgan yil",
  notes: "Eslatmalar",
  latitude: "Kenglik",
  longitude: "Uzunlik",
  temperature: "Harorat",
  humidity: "Namlik",
  smoke: "Tutun",
  currentStatus: "Joriy holat",
  statusOk: "Yaxshi",
  statusAlert: "Ogohlantirish",
  statusOffline: "Offline",
  lastSeen: "Oxirgi ko'rilgan",
  loading: "Yuklanmoqda...",
  error: "Xatolik",
  notFound: "Daraxt topilmadi",
  historicalData: "Tarixiy ma'lumot",
  online: "Onlayn",
  offline: "Offline",
  telemetry: "Telemetriya",
  last24Hours: "Oxirgi 24 soat",
  last7Days: "Oxirgi 7 kun",
  last30Days: "Oxirgi 30 kun",
  noData: "Ma'lumot yo'q",
}

export default function PublicTreePage() {
  const params = useParams()
  const router = useRouter()
  const treeId = params?.id
  const [tree, setTree] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('7d')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!treeId) return

    const loadTree = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get API URL - use relative URL (Nginx proxies /api/* to backend)
        const apiUrl = typeof window !== 'undefined' 
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || 'https://nextree.app'
        
        const response = await fetch(`${apiUrl}/api/v1/public/trees/${treeId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError(translations.notFound)
          } else {
            setError(translations.error)
          }
          return
        }
        
        const data = await response.json()
        setTree(data)
      } catch (err) {
        console.error('Error loading tree:', err)
        setError(translations.error)
      } finally {
        setLoading(false)
      }
    }

    loadTree()
  }, [treeId])

  // Filter telemetry by time range - must be called before early returns
  const filteredTelemetry = useMemo(() => {
    if (!tree || !tree.telemetry || tree.telemetry.length === 0) return []
    
    const now = new Date()
    let cutoffDate
    
    switch (timeRange) {
      case '24h':
        cutoffDate = subDays(now, 1)
        break
      case '7d':
        cutoffDate = subDays(now, 7)
        break
      case '30d':
        cutoffDate = subDays(now, 30)
        break
      default:
        cutoffDate = subDays(now, 7)
    }
    
    return tree.telemetry
      .filter(t => {
        try {
          const timestamp = new Date(t.timestamp)
          return timestamp >= cutoffDate && timestamp <= now
        } catch {
          return false
        }
      })
      .map(t => ({
        ...t,
        timestamp: format(new Date(t.timestamp), 'dd.MM HH:mm'),
        timestampRaw: t.timestamp
      }))
      .reverse() // Show oldest to newest
  }, [tree?.telemetry, timeRange])

  // Calculate statistics - must be called before early returns
  const stats = useMemo(() => {
    if (filteredTelemetry.length === 0) {
      return {
        temp: { avg: null, min: null, max: null },
        humidity: { avg: null, min: null, max: null },
        mq2: { avg: null, min: null, max: null }
      }
    }
    
    const temps = filteredTelemetry
      .map(t => t.temp_c)
      .filter(v => v != null && v !== 0 && !isNaN(v))
      .map(v => Number(v))
    const humidities = filteredTelemetry
      .map(t => t.humidity_pct)
      .filter(v => v != null && v !== 0 && !isNaN(v))
      .map(v => Number(v))
    const mq2s = filteredTelemetry
      .map(t => t.mq2)
      .filter(v => v != null && !isNaN(v))
      .map(v => Number(v))
    
    return {
      temp: {
        avg: temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : null,
        min: temps.length > 0 ? Math.min(...temps) : null,
        max: temps.length > 0 ? Math.max(...temps) : null
      },
      humidity: {
        avg: humidities.length > 0 ? humidities.reduce((a, b) => a + b, 0) / humidities.length : null,
        min: humidities.length > 0 ? Math.min(...humidities) : null,
        max: humidities.length > 0 ? Math.max(...humidities) : null
      },
      mq2: {
        avg: mq2s.length > 0 ? mq2s.reduce((a, b) => a + b, 0) / mq2s.length : null,
        min: mq2s.length > 0 ? Math.min(...mq2s) : null,
        max: mq2s.length > 0 ? Math.max(...mq2s) : null
      }
    }
  }, [filteredTelemetry])

  // Early returns - must be after hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🌳</div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">{translations.loading}</p>
        </div>
      </div>
    )
  }

  if (error || !tree) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">{error || translations.notFound}</p>
        </div>
      </div>
    )
  }

  const now = new Date()
  const isOffline = !tree.isOnline
  const lastSeenDate = tree.last_seen_at ? new Date(tree.last_seen_at) : null
  const thirtyDaysAgo = subDays(now, 30)
  
  // Get latest MPU6050 data from telemetry history
  const getLatestMPU6050Data = () => {
    if (tree.telemetry && tree.telemetry.length > 0) {
      const recentTelemetry = tree.telemetry.filter(t => new Date(t.timestamp) >= thirtyDaysAgo)
      
      const latestMpuData = recentTelemetry.find(t => 
        t.mpu_accel_x !== undefined || t.mpu_accel_y !== undefined || t.mpu_accel_z !== undefined ||
        t.mpu_gyro_x !== undefined || t.mpu_gyro_y !== undefined || t.mpu_gyro_z !== undefined ||
        t.mpu_tilt !== undefined || t.mpu_cut_detected !== undefined
      )
      
      if (latestMpuData) {
        return {
          mpu_accel_x: latestMpuData.mpu_accel_x || 0,
          mpu_accel_y: latestMpuData.mpu_accel_y || 0,
          mpu_accel_z: latestMpuData.mpu_accel_z !== undefined ? latestMpuData.mpu_accel_z : -1,
          mpu_gyro_x: latestMpuData.mpu_gyro_x || 0,
          mpu_gyro_y: latestMpuData.mpu_gyro_y || 0,
          mpu_gyro_z: latestMpuData.mpu_gyro_z || 0,
          mpu_tilt: latestMpuData.mpu_tilt || false,
          mpu_cut_detected: latestMpuData.mpu_cut_detected || false,
          timestamp: latestMpuData.timestamp
        }
      }
    }
    return null
  }

  const mpuData = getLatestMPU6050Data()
  const lastTelemetry = tree.last_telemetry || (tree.telemetry && tree.telemetry.length > 0 ? tree.telemetry[0] : null)

  const downloadFirmware = async (type) => {
    try {
      const response = await fetch(`/api/firmware/${type}?tree_id=${tree.tree_id}`)
      if (!response.ok) {
        throw new Error('Firmware yuklashda xatolik')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = type === 'base_station' ? 'base_station.ino' : `transmitter_tree_${tree.tree_id}.ino`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success(`${type === 'base_station' ? 'Base Station' : 'Transmitter'} firmware yuklandi`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Firmware yuklashda xatolik')
    }
  }

  const handleDeleteTree = async () => {
    if (!confirm(`Daraxt ID ${tree.tree_id} ni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.`)) {
      return
    }

    setDeleting(true)
    try {
      await treesAPI.delete(tree.id || tree.tree_id)
      toast.success('Daraxt muvaffaqiyatli o\'chirildi')
      router.push('/dashboard')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error.response?.data?.error || 'Daraxtni o\'chirishda xatolik')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Logo />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{translations.title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{translations.treeId}: {tree.tree_id}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
                isOffline 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' 
                  : 'bg-green-200 dark:bg-green-900/30 text-green-800 dark:text-green-300'
              }`}>
                {isOffline ? translations.offline : translations.online}
              </div>
              
              {/* Firmware Download Buttons */}
              <button
                onClick={() => downloadFirmware('base_station')}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium shadow-sm"
                title="Base Station Firmware"
              >
                <FiDownload className="w-4 h-4" />
                <span>Base Station</span>
              </button>
              
              <button
                onClick={() => downloadFirmware('transmitter')}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-xs sm:text-sm font-medium shadow-sm"
                title={`Transmitter Firmware (ID: ${tree.tree_id})`}
              >
                <FiDownload className="w-4 h-4" />
                <span>Transmitter</span>
              </button>
              
              {/* Delete Button */}
              <button
                onClick={handleDeleteTree}
                disabled={deleting}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                title="Daraxtni o'chirish"
              >
                <FiTrash2 className="w-4 h-4" />
                <span>{deleting ? 'O\'chirilmoqda...' : 'O\'chirish'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Top Row - 3D Tree and Current Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Tree Info */}
          <div className="space-y-6">
            {/* Tree Age & Health Score - Hero Section */}
            <TreeAgeScore 
              tree={tree}
              lastTelemetry={lastTelemetry}
              telemetryHistory={tree.telemetry || []}
            />

            {/* Tree Image */}
            {tree.image_url && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
                <img 
                  src={tree.image_url} 
                  alt={`Daraxt ${tree.tree_id}`}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}

            {/* Firmware Download Section */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg shadow-sm p-4 sm:p-6 border-2 border-blue-200 dark:border-blue-800 transition-colors">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FiDownload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Hardware Firmware Kodlari
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Daraxt monitoring uchun kerakli firmware kodlarini yuklab oling. Transmitter firmware'da TREE_ID avtomatik o'rnatiladi.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => downloadFirmware('base_station')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
                  title="Base Station Firmware"
                >
                  <FiDownload className="w-5 h-5" />
                  <span>Base Station</span>
                </button>
                
                <button
                  onClick={() => downloadFirmware('transmitter')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-md hover:shadow-lg"
                  title={`Transmitter Firmware (ID: ${tree.tree_id})`}
                >
                  <FiDownload className="w-5 h-5" />
                  <span>Transmitter (ID: {tree.tree_id})</span>
                </button>
              </div>
              <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  💡 <strong>Base Station</strong> - bitta marta yuklab oling (barcha daraxtlar uchun bir xil)<br/>
                  💡 <strong>Transmitter</strong> - har bir daraxt uchun alohida yuklab oling (TREE_ID avtomatik o'rnatiladi)
                </p>
              </div>
            </div>

            {/* Tree Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 transition-colors">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{translations.title}</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{translations.treeId}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{tree.tree_id}</p>
                </div>
                {tree.species && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{translations.species}</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{tree.species}</p>
                  </div>
                )}
                {tree.planted_year && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{translations.plantedYear}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{tree.planted_year}</p>
                  </div>
                )}
                {tree.notes && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{translations.notes}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{tree.notes}</p>
                  </div>
                )}
                {tree.latitude && tree.longitude && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{translations.latitude}</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{tree.latitude}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{translations.longitude}</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{tree.longitude}</p>
                    </div>
                  </>
                )}
                {lastSeenDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{translations.lastSeen}</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {format(lastSeenDate, 'dd.MM.yyyy HH:mm')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Current Telemetry */}
            {lastTelemetry && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{translations.currentStatus}</h2>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 text-center border border-blue-200 dark:border-blue-700">
                    <div className="text-2xl sm:text-3xl mb-2">🌡️</div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{translations.temperature}</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {lastTelemetry.temp_c != null ? `${Number(lastTelemetry.temp_c).toFixed(1)}°C` : '-'}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4 text-center border border-green-200 dark:border-green-700">
                    <div className="text-2xl sm:text-3xl mb-2">💧</div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{translations.humidity}</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {lastTelemetry.humidity_pct != null ? `${Number(lastTelemetry.humidity_pct).toFixed(1)}%` : '-'}
                    </p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 sm:p-4 text-center border border-orange-200 dark:border-orange-700">
                    <div className="text-2xl sm:text-3xl mb-2">💨</div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{translations.smoke}</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {lastTelemetry.mq2 != null ? `${lastTelemetry.mq2} PPM` : '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - 3D Tree */}
          <div className="space-y-6">
            {/* Healthspan Breakdown */}
            <HealthspanBreakdown
              tree={tree}
              lastTelemetry={lastTelemetry}
              telemetryHistory={tree.telemetry || []}
            />

            {/* AI Insights Panel */}
            <AIInsightsPanel
              tree={tree}
              lastTelemetry={lastTelemetry}
              telemetryHistory={tree.telemetry || []}
            />

            {/* 3D Tree Visualization */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 transition-colors">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">3D Daraxt ko'rinishi</h2>
              {isOffline && mpuData && (
                <div className="mb-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-2">
                  📊 {translations.historicalData}
                </div>
              )}
              <div className="h-[400px] sm:h-[500px] rounded-lg overflow-hidden bg-gradient-to-b from-sky-100 to-blue-50 dark:from-gray-700 dark:to-gray-800 border border-blue-200 dark:border-blue-700">
                <Tree3D
                  treeId={tree.tree_id}
                  isOnline={!isOffline}
                  accelX={lastTelemetry?.mpu_accel_x || mpuData?.mpu_accel_x || 0}
                  accelY={lastTelemetry?.mpu_accel_y || mpuData?.mpu_accel_y || 0}
                  accelZ={lastTelemetry?.mpu_accel_z !== undefined ? lastTelemetry.mpu_accel_z : (mpuData?.mpu_accel_z !== undefined ? mpuData.mpu_accel_z : -1)}
                  gyroX={lastTelemetry?.mpu_gyro_x || mpuData?.mpu_gyro_x || 0}
                  gyroY={lastTelemetry?.mpu_gyro_y || mpuData?.mpu_gyro_y || 0}
                  gyroZ={lastTelemetry?.mpu_gyro_z || mpuData?.mpu_gyro_z || 0}
                  isTilt={lastTelemetry?.mpu_tilt || mpuData?.mpu_tilt || false}
                  isCut={lastTelemetry?.mpu_cut_detected || mpuData?.mpu_cut_detected || false}
                />
              </div>
            </div>
          </div>
          </div>

          {/* Telemetry Charts Section - Full Width */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">{translations.telemetry}</h2>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 font-semibold focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none shadow-sm transition-colors"
              >
                <option value="24h">{translations.last24Hours}</option>
                <option value="7d">{translations.last7Days}</option>
                <option value="30d">{translations.last30Days}</option>
              </select>
            </div>

            {filteredTelemetry.length > 0 ? (
              <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Temperature Stats */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-blue-700">🌡️ {translations.temperature}</span>
                    </div>
                    <div className="space-y-1">
                      {stats.temp.avg !== null ? (
                        <>
                          <p className="text-2xl font-bold text-blue-900">{stats.temp.avg.toFixed(1)}°C</p>
                          <div className="flex justify-between text-xs text-blue-700">
                            <span>Min: {stats.temp.min.toFixed(1)}°C</span>
                            <span>Max: {stats.temp.max.toFixed(1)}°C</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-blue-600">{translations.noData}</p>
                      )}
                    </div>
                  </div>

                  {/* Humidity Stats */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border-2 border-green-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-green-700">💧 {translations.humidity}</span>
                    </div>
                    <div className="space-y-1">
                      {stats.humidity.avg !== null ? (
                        <>
                          <p className="text-2xl font-bold text-green-900">{stats.humidity.avg.toFixed(1)}%</p>
                          <div className="flex justify-between text-xs text-green-700">
                            <span>Min: {stats.humidity.min.toFixed(1)}%</span>
                            <span>Max: {stats.humidity.max.toFixed(1)}%</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-green-600">{translations.noData}</p>
                      )}
                    </div>
                  </div>

                  {/* MQ2 Stats */}
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border-2 border-yellow-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-yellow-700">💨 {translations.smoke}</span>
                    </div>
                    <div className="space-y-1">
                      {stats.mq2.avg !== null ? (
                        <>
                          <p className="text-2xl font-bold text-yellow-900">{stats.mq2.avg.toFixed(0)} PPM</p>
                          <div className="flex justify-between text-xs text-yellow-700">
                            <span>Min: {stats.mq2.min.toFixed(0)} PPM</span>
                            <span>Max: {stats.mq2.max.toFixed(0)} PPM</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-yellow-600">{translations.noData}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Chart */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={filteredTelemetry} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMQ2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ffc658" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-600" />
                      <XAxis 
                        dataKey="timestamp" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 10, fill: 'currentColor' }}
                        className="text-gray-600 dark:text-gray-400"
                        stroke="currentColor"
                      />
                      <YAxis yAxisId="left" stroke="#8884d8" className="dark:stroke-blue-400" />
                      <YAxis yAxisId="right" orientation="right" stroke="#ffc658" className="dark:stroke-yellow-400" />
                      <Tooltip 
                        contentStyle={(props) => {
                          const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
                          return {
                            backgroundColor: isDark ? '#1f2937' : 'white',
                            border: isDark ? '2px solid #4b5563' : '2px solid #ccc',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            color: isDark ? '#f3f4f6' : '#333'
                          }
                        }}
                        formatter={(value, name) => {
                          const numValue = value !== null && value !== undefined ? Number(value) : null
                          
                          if (name === `${translations.temperature} (°C)`) {
                            return numValue !== null && !isNaN(numValue) ? [`${numValue.toFixed(1)}°C`, name] : ['-°C', name]
                          }
                          if (name === `${translations.humidity} (%)`) {
                            return numValue !== null && !isNaN(numValue) ? [`${numValue.toFixed(1)}%`, name] : ['-%', name]
                          }
                          if (name === `${translations.smoke} (PPM)`) {
                            return numValue !== null && !isNaN(numValue) ? [`${numValue.toFixed(0)} PPM`, name] : ['- PPM', name]
                          }
                          return [value, name]
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                        className="text-gray-700 dark:text-gray-300"
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="temp_c"
                        stroke="#8884d8"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorTemp)"
                        name={`${translations.temperature} (°C)`}
                        dot={{ r: 4, fill: '#8884d8' }}
                        activeDot={{ r: 6 }}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="humidity_pct"
                        stroke="#82ca9d"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorHumidity)"
                        name={`${translations.humidity} (%)`}
                        dot={{ r: 4, fill: '#82ca9d' }}
                        activeDot={{ r: 6 }}
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="mq2"
                        stroke="#ffc658"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorMQ2)"
                        name={`${translations.smoke} (PPM)`}
                        dot={{ r: 4, fill: '#ffc658' }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 transition-colors">
                <p className="text-gray-500 dark:text-gray-400 text-center text-lg">{translations.noData}</p>
              </div>
            )}
          </div>

          {/* Map Section */}
          {tree.latitude && tree.longitude && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Joylashuv</h2>
              <div className="h-64 rounded-lg overflow-hidden">
                <MapComponent
                  trees={[{
                    id: tree.id,
                    tree_id: tree.tree_id,
                    latitude: parseFloat(tree.latitude),
                    longitude: parseFloat(tree.longitude),
                    species: tree.species,
                    last_status: tree.last_status,
                    last_seen_at: tree.last_seen_at,
                    last_telemetry: lastTelemetry
                  }]}
                  center={[parseFloat(tree.latitude), parseFloat(tree.longitude)]}
                  zoom={15}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

