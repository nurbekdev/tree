'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { treesAPI, alertsAPI, settingsAPI } from '@/lib/api'
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket'
import toast from 'react-hot-toast'
import { FiSettings, FiLogOut, FiPlus } from 'react-icons/fi'
import TreeCard from '@/components/TreeCard'
import TreeModal from '@/components/TreeModal'
import AlertsPanel from '@/components/AlertsPanel'
import AddTreeModal from '@/components/AddTreeModal'
import Logo from '@/components/Logo'
import WeatherAI from '@/components/WeatherAI'
import TreeAI from '@/components/TreeAI'

const translations = {
  agency: "O'rmon va yashil hududlarni ko'paytirish, cho'llanishga qarshi kurashish agentligining Daraxt monitoring tizimi",
  title: "O'rmon agentligi",
  trees: "Daraxtlar",
  alerts: "Ogohlantirishlar",
  logout: "Chiqish",
  noData: "Ma'lumot yo'q",
  addTree: "Daraxt qo'shish",
  loading: "Yuklanmoqda...",
  statistics: "Statistikalar",
  totalTrees: "Jami Daraxtlar",
  onlineTrees: "Onlayn Daraxtlar",
  offlineTrees: "Offline Daraxtlar",
  totalAlerts: "Jami Ogohlantirishlar",
  unacknowledgedAlerts: "Tasdiqlanmagan",
  welcome: "Xush kelibsiz",
}

export default function DashboardPage() {
  const [trees, setTrees] = useState([])
  const [alerts, setAlerts] = useState([])
  const [selectedTree, setSelectedTree] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [ppmThreshold, setPpmThreshold] = useState(400) // Default threshold
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Get user info
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    setUser(userData)

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('✅ Browser notifications enabled')
        }
      })
    }

    // Connect Socket.IO
    const socket = connectSocket(token)

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected successfully')
    })
    
    socket.on('disconnect', () => {
      console.warn('⚠️ Socket.IO disconnected')
    })
    
    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error)
    })

    socket.on('alert', (alert) => {
      console.log('🔔 Dashboard received alert:', alert) // Debug log
      
      // Show toast notification
      const isSmokeAlert = alert.type === 'smoke'
      toast.error(
        isSmokeAlert 
          ? `🔥 YONG'IN XAVFI! Daraxt ${alert.tree_id} - ${alert.message}`
          : `Yangi ogohlantirish: Daraxt ${alert.tree_id} - ${alert.message}`,
        {
          duration: isSmokeAlert ? 10000 : 5000, // Smoke alerts show longer
          icon: isSmokeAlert ? '🔥' : '⚠️',
          style: isSmokeAlert ? {
            background: '#ef4444',
            color: 'white',
            fontWeight: 'bold',
          } : {},
        }
      )

      // Show browser notification (if permission granted)
      if ('Notification' in window && Notification.permission === 'granted') {
        const notificationTitle = isSmokeAlert 
          ? `🔥 YONG'IN XAVFI! Daraxt ${alert.tree_id}`
          : `Ogohlantirish: Daraxt ${alert.tree_id}`
        
        const notification = new Notification(notificationTitle, {
          body: alert.message,
          icon: '/22.png', // Use your logo
          badge: '/22.png',
          tag: `alert-${alert.tree_id}-${alert.type}`, // Prevent duplicate notifications
          requireInteraction: isSmokeAlert, // Smoke alerts require user interaction
          vibrate: isSmokeAlert ? [200, 100, 200] : [200], // Vibration pattern for smoke alerts
          sound: isSmokeAlert ? true : false, // Sound for smoke alerts (if supported)
        })

        // Auto-close notification after 10 seconds (or 30 seconds for smoke)
        setTimeout(() => {
          notification.close()
        }, isSmokeAlert ? 30000 : 10000)

        // Handle notification click
        notification.onclick = () => {
          window.focus()
          notification.close()
        }
      }

      // Add new alert to state immediately (optimistic update)
      setAlerts((prevAlerts) => {
        // Check if alert already exists (avoid duplicates)
        const exists = prevAlerts.find(a => a.id === alert.id)
        if (exists) {
          return prevAlerts
        }
        // Add new alert at the beginning
        return [alert, ...prevAlerts]
      })
      
      // Also reload alerts to ensure consistency
      loadAlerts()
      // Don't reload trees - Socket.IO will update them in real-time
      // loadTrees() would overwrite real-time updates
    })

    socket.on('telemetry', (data) => {
      // Update tree status and telemetry in real-time
      console.log('🔵 Dashboard received telemetry:', data) // Debug log
      
      // Update PPM threshold if provided in telemetry data
      if (data.ppm_threshold) {
        setPpmThreshold(data.ppm_threshold)
      }
      
      // Parse timestamp - could be ISO string or Unix timestamp
      const now = new Date()
      let timestamp
      if (data.timestamp) {
        if (typeof data.timestamp === 'string') {
          timestamp = new Date(data.timestamp)
        } else if (typeof data.timestamp === 'number') {
          // If timestamp is too small (< 1000000), it's likely millis()/1000 from ESP8266 boot time
          if (data.timestamp > 1000000) {
            timestamp = new Date(data.timestamp * 1000)
          } else {
            timestamp = now // Use current time if timestamp is invalid
          }
        } else {
          timestamp = now
        }
      } else {
        timestamp = now
      }
      
      // Validate timestamp - if it's invalid (1970 or earlier), use current time
      if (timestamp.getTime() < new Date('2000-01-01').getTime()) {
        console.warn('Invalid timestamp detected, using current time:', data.timestamp)
        timestamp = now
      }
      
      // Check if tree is online (timestamp within 30 seconds)
      // 5-10 seconds grace period: show old data even if new data hasn't arrived
      // After 30 seconds, mark as offline
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000)
      const isOnline = timestamp > thirtySecondsAgo
      
      console.log('🟢 Tree', data.tree_id, 'is online:', isOnline, 'Timestamp:', timestamp.toISOString()) // Debug log
      console.log('📊 Telemetry data:', { temp_c: data.temp_c, humidity_pct: data.humidity_pct, mq2: data.mq2, status: data.status }) // Debug log
      
      setTrees((prev) => {
        console.log('📝 Previous trees state:', prev.map(t => ({ 
          tree_id: t.tree_id, 
          last_telemetry: t.last_telemetry,
          last_seen_at: t.last_seen_at 
        }))) // Debug log
        
        const updated = prev.map((tree) => {
          if (tree.tree_id === data.tree_id) {
            // Always update last_seen_at when we receive data
            const updatedTree = {
              ...tree,
              last_status: data.status,
              last_seen_at: timestamp.toISOString(), // Store as ISO string
            }
            
            // ALWAYS update telemetry when we receive new data (if online)
            // This ensures real-time updates are shown immediately
            if (isOnline) {
              const newTelemetry = {
                // Convert 0 to null for temp_c and humidity_pct (sensor failure indicator)
                temp_c: (data.temp_c === null || data.temp_c === undefined || data.temp_c === 0) ? null : data.temp_c,
                humidity_pct: (data.humidity_pct === null || data.humidity_pct === undefined || data.humidity_pct === 0) ? null : data.humidity_pct,
                mq2: data.mq2 || 0,
                status: data.status,
                timestamp: timestamp.toISOString()
              }
              console.log('✅ Updating telemetry for tree', data.tree_id, ':', newTelemetry) // Debug log
              updatedTree.last_telemetry = newTelemetry
            } else {
              // Offline (30+ seconds) - check if we should keep previous telemetry
              const lastSeenDate = tree.last_seen_at ? new Date(tree.last_seen_at) : null
              const tenSecondsAgo = new Date(now.getTime() - 10 * 1000)
              
              // Keep previous telemetry if last_seen_at was within 10 seconds
              if (lastSeenDate && lastSeenDate > tenSecondsAgo && tree.last_telemetry) {
                // Keep previous telemetry for display (5-10 second grace period)
                console.log('⏳ Keeping previous telemetry (grace period) for tree', data.tree_id) // Debug log
                updatedTree.last_telemetry = tree.last_telemetry
              } else {
                // Clear telemetry after 10 seconds
                console.log('❌ Clearing telemetry (offline) for tree', data.tree_id) // Debug log
                updatedTree.last_telemetry = null
              }
            }
            
            return updatedTree
          }
          return tree
        })
        
        const updatedTree = updated.find(t => t.tree_id === data.tree_id)
        console.log('🔄 Updated trees state for tree', data.tree_id, ':', { 
          last_telemetry: updatedTree?.last_telemetry,
          last_seen_at: updatedTree?.last_seen_at 
        }) // Debug log
        
        return updated
      })
    })

    loadData()
    loadPpmThreshold()

    return () => {
      disconnectSocket()
    }
  }, [router])

  const loadPpmThreshold = async () => {
    try {
      const settings = await settingsAPI.getAll()
      if (settings.ppm_threshold) {
        setPpmThreshold(parseInt(settings.ppm_threshold.value) || 400)
      }
    } catch (error) {
      console.warn('Error loading PPM threshold, using default:', error)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      // Load all alerts (both acknowledged and unacknowledged) - limit increased to show more
      const [treesData, alertsData] = await Promise.all([
        treesAPI.getAll(),
        alertsAPI.getAll({ limit: 50 }), // Load all alerts (acknowledged and unacknowledged)
      ])
      
      // For initial load, merge with existing state to preserve Socket.IO real-time updates
      setTrees((prevTrees) => {
        // If this is the first load (prevTrees is empty), just use the data
        if (!prevTrees || prevTrees.length === 0) {
          return treesData
        }
        
        // Otherwise, merge with existing state to preserve Socket.IO real-time updates
        const now = new Date()
        const fiveSecondsAgo = new Date(now.getTime() - 5 * 1000) // 5 seconds threshold
        
        return treesData.map((newTree) => {
          // Find existing tree in previous state
          const existingTree = prevTrees.find(t => t.tree_id === newTree.tree_id)
          
          // If tree exists and was updated via Socket.IO recently (within 5 seconds),
          // keep the Socket.IO data instead of overwriting with database data
          if (existingTree && existingTree.last_seen_at) {
            try {
              const lastSeenDate = new Date(existingTree.last_seen_at)
              // If last_seen_at is very recent (within 5 seconds), it's likely from Socket.IO
              // Keep the Socket.IO data (existingTree) instead of database data (newTree)
              if (lastSeenDate > fiveSecondsAgo) {
                console.log('🔄 loadData: Keeping Socket.IO data for tree', newTree.tree_id, '- not overwriting with database data')
                return existingTree
              }
            } catch (e) {
              // Invalid date, use new data
            }
          }
          
          // Use new data from database (tree was not updated recently via Socket.IO)
          return newTree
        })
      })
      
      setAlerts(alertsData)
    } catch (error) {
      console.error('Error loading data:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      })
      
      // Show more detailed error message
      if (error.response) {
        toast.error(`Ma'lumotlarni yuklashda xatolik: ${error.response.status} - ${error.response.statusText || error.response.data?.error || 'Noma'lum xatolik'}`)
      } else if (error.request) {
        toast.error('Server\'ga ulanib bo\'lmadi. Backend ishlamayapti.')
      } else {
        toast.error(`Ma'lumotlarni yuklashda xatolik: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadTrees = async () => {
    try {
      const data = await treesAPI.getAll()
      
      // Merge with existing state to preserve Socket.IO real-time updates
      // Only update trees that haven't been updated via Socket.IO recently
      setTrees((prevTrees) => {
        const now = new Date()
        const fiveSecondsAgo = new Date(now.getTime() - 5 * 1000) // 5 seconds threshold
        
        return data.map((newTree) => {
          // Find existing tree in previous state
          const existingTree = prevTrees.find(t => t.tree_id === newTree.tree_id)
          
          // If tree exists and was updated via Socket.IO recently (within 5 seconds),
          // keep the Socket.IO data instead of overwriting with database data
          if (existingTree && existingTree.last_seen_at) {
            try {
              const lastSeenDate = new Date(existingTree.last_seen_at)
              // If last_seen_at is very recent (within 5 seconds), it's likely from Socket.IO
              // Keep the Socket.IO data (existingTree) instead of database data (newTree)
              if (lastSeenDate > fiveSecondsAgo) {
                console.log('🔄 Keeping Socket.IO data for tree', newTree.tree_id, '- not overwriting with database data')
                return existingTree
              }
            } catch (e) {
              // Invalid date, use new data
            }
          }
          
          // Use new data from database (tree was not updated recently via Socket.IO)
          return newTree
        })
      })
    } catch (error) {
      console.error('Error loading trees:', error)
    }
  }

  const loadAlerts = async () => {
    try {
      const data = await alertsAPI.getAll({ acknowledged: 'false', limit: 10 })
      setAlerts(data)
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    disconnectSocket()
    router.push('/login')
  }

  const handleTreeClick = async (tree) => {
    try {
      const treeData = await treesAPI.getById(tree.id || tree.tree_id)
      setSelectedTree(treeData)
      // Reload alerts to get latest status
      loadAlerts()
    } catch (error) {
      toast.error('Daraxt ma\'lumotlarini yuklashda xatolik')
    }
  }

  const handleCloseModal = () => {
    setSelectedTree(null)
    loadTrees()
    loadAlerts() // Reload alerts when modal closes
  }

  // Calculate statistics
  const stats = {
    totalTrees: trees.length,
    onlineTrees: trees.filter(tree => {
      if (!tree.last_seen_at) return false
      try {
        const lastSeen = new Date(tree.last_seen_at)
        const thirtySecondsAgo = new Date(Date.now() - 30 * 1000)
        return lastSeen > thirtySecondsAgo
      } catch {
        return false
      }
    }).length,
    offlineTrees: trees.filter(tree => {
      if (!tree.last_seen_at) return true
      try {
        const lastSeen = new Date(tree.last_seen_at)
        const thirtySecondsAgo = new Date(Date.now() - 30 * 1000)
        return lastSeen <= thirtySecondsAgo
      } catch {
        return true
      }
    }).length,
    totalAlerts: alerts.length,
    unacknowledgedAlerts: alerts.filter(a => !a.acknowledged).length,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">{translations.loading || 'Yuklanmoqda...'}</div>
          <div className="text-sm text-gray-500 mt-2">Ma'lumotlar yuklanmoqda...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-4">
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md flex-shrink-0">
                <Logo size={32} className="sm:w-10 sm:h-10" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent leading-tight truncate">
                  {translations.title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 line-clamp-2 hidden sm:block">{translations.agency}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              {user && (
                <div className="text-right hidden md:block">
                  <div className="text-sm font-medium text-gray-900">{translations.welcome}, {user.username}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                </div>
              )}
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 sm:gap-2"
                  title="Admin"
                >
                  <FiSettings className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 sm:gap-2"
                title="Chiqish"
              >
                <FiLogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{translations.logout}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Statistics Cards */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <span className="text-xl sm:text-2xl lg:text-3xl">📊</span>
            {translations.statistics}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            {/* Total Trees */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl">🌳</div>
                <div className="text-2xl font-bold">{stats.totalTrees}</div>
              </div>
              <div className="text-sm font-medium opacity-90">{translations.totalTrees}</div>
            </div>

            {/* Online Trees */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl">🟢</div>
                <div className="text-2xl font-bold">{stats.onlineTrees}</div>
              </div>
              <div className="text-sm font-medium opacity-90">{translations.onlineTrees}</div>
            </div>

            {/* Offline Trees */}
            <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl">⚫</div>
                <div className="text-2xl font-bold">{stats.offlineTrees}</div>
              </div>
              <div className="text-sm font-medium opacity-90">{translations.offlineTrees}</div>
            </div>

            {/* Alerts */}
            <div className={`bg-gradient-to-br ${stats.unacknowledgedAlerts > 0 ? 'from-red-500 to-red-600' : 'from-yellow-500 to-yellow-600'} rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl">⚠️</div>
                <div className="text-2xl font-bold">{stats.unacknowledgedAlerts}</div>
              </div>
              <div className="text-sm font-medium opacity-90">{translations.unacknowledgedAlerts}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Trees */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl lg:text-3xl">🌲</span>
                  {translations.trees}
                </h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-2 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-base"
                >
                  <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{translations.addTree}</span>
                  <span className="sm:hidden">Qo'shish</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trees.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <div className="text-6xl mb-4">🌳</div>
                    <p className="text-gray-500 text-lg">{translations.noData}</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      + {translations.addTree}
                    </button>
                  </div>
                ) : (
                trees.map((tree) => (
                  <TreeCard
                    key={tree.id || tree.tree_id}
                    tree={tree}
                    onClick={() => handleTreeClick(tree)}
                    ppmThreshold={ppmThreshold}
                  />
                ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Alerts and AI */}
          <div className="lg:sticky lg:top-4 lg:self-start space-y-4 sm:space-y-6 max-h-[calc(100vh-2rem)] overflow-y-auto pr-2">
            <AlertsPanel alerts={alerts} onAcknowledge={loadAlerts} />
            
            {/* AI Analysis */}
            <div className="space-y-4 sm:space-y-6">
              <TreeAI />
              <WeatherAI />
            </div>
          </div>
        </div>
      </main>

      {selectedTree && (
        <TreeModal 
          tree={selectedTree} 
          onClose={handleCloseModal}
          onAlertAcknowledge={loadAlerts}
        />
      )}

      {showAddModal && (
        <AddTreeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            loadTrees()
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}

