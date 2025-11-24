'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { format, subDays } from 'date-fns'
import dynamic from 'next/dynamic'
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
  const treeId = params?.id
  const [tree, setTree] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    if (!treeId) return

    const loadTree = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get API URL
        const apiUrl = typeof window !== 'undefined' 
          ? (process.env.NEXT_PUBLIC_API_URL || window.location.origin)
          : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        
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
          <p className="text-gray-600 text-lg">{translations.loading}</p>
        </div>
      </div>
    )
  }

  if (error || !tree) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-600 text-lg">{error || translations.notFound}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-green-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{translations.title}</h1>
                <p className="text-sm text-gray-600">{translations.treeId}: {tree.tree_id}</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isOffline 
                ? 'bg-gray-200 text-gray-700' 
                : 'bg-green-200 text-green-800'
            }`}>
              {isOffline ? translations.offline : translations.online}
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
            {/* Tree Image */}
            {tree.image_url && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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

            {/* Tree Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{translations.title}</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">{translations.treeId}</p>
                  <p className="text-lg font-semibold text-gray-900">{tree.tree_id}</p>
                </div>
                {tree.species && (
                  <div>
                    <p className="text-sm text-gray-600">{translations.species}</p>
                    <p className="text-lg font-semibold text-gray-900">{tree.species}</p>
                  </div>
                )}
                {tree.planted_year && (
                  <div>
                    <p className="text-sm text-gray-600">{translations.plantedYear}</p>
                    <p className="text-lg font-semibold text-gray-900">{tree.planted_year}</p>
                  </div>
                )}
                {tree.notes && (
                  <div>
                    <p className="text-sm text-gray-600">{translations.notes}</p>
                    <p className="text-lg font-semibold text-gray-900">{tree.notes}</p>
                  </div>
                )}
                {tree.latitude && tree.longitude && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">{translations.latitude}</p>
                      <p className="text-lg font-semibold text-gray-900">{tree.latitude}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{translations.longitude}</p>
                      <p className="text-lg font-semibold text-gray-900">{tree.longitude}</p>
                    </div>
                  </>
                )}
                {lastSeenDate && (
                  <div>
                    <p className="text-sm text-gray-600">{translations.lastSeen}</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {format(lastSeenDate, 'dd.MM.yyyy HH:mm')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Current Telemetry */}
            {lastTelemetry && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{translations.currentStatus}</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">🌡️</div>
                    <p className="text-sm text-gray-600 mb-1">{translations.temperature}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {lastTelemetry.temp_c != null ? `${Number(lastTelemetry.temp_c).toFixed(1)}°C` : '-'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">💧</div>
                    <p className="text-sm text-gray-600 mb-1">{translations.humidity}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {lastTelemetry.humidity_pct != null ? `${Number(lastTelemetry.humidity_pct).toFixed(1)}%` : '-'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">💨</div>
                    <p className="text-sm text-gray-600 mb-1">{translations.smoke}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {lastTelemetry.mq2 != null ? `${lastTelemetry.mq2} PPM` : '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - 3D Tree */}
          <div className="space-y-6">
            {/* 3D Tree Visualization */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">3D Daraxt ko'rinishi</h2>
              {isOffline && mpuData && (
                <div className="mb-2 text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                  📊 {translations.historicalData}
                </div>
              )}
              <div className="h-[500px] rounded-lg overflow-hidden bg-gradient-to-b from-sky-100 to-blue-50 border-2 border-blue-200">
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
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{translations.telemetry}</h2>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white font-semibold focus:border-blue-500 focus:outline-none shadow-sm"
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
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis 
                        dataKey="timestamp" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 10 }}
                        stroke="#666"
                      />
                      <YAxis yAxisId="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#ffc658" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '2px solid #ccc',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
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
              <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 text-center text-lg">{translations.noData}</p>
              </div>
            )}
          </div>

          {/* Map Section */}
          {tree.latitude && tree.longitude && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Joylashuv</h2>
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

