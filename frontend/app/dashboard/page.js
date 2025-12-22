'use client'

// Note: 'use client' components are automatically dynamic

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
import TreeAI from '@/components/TreeAI'
import ThemeToggle from '@/components/ThemeToggle'

const translations = {
  agency: "O'rmon va yashil hududlarni ko'paytirish, cho'llanishga qarshi kurashish agentligining Daraxt monitoring tizimi",
  title: "Dala Qo'riqchisi",
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
      console.log('Dashboard: No token found, redirecting to login')
      router.push('/login')
      return
    }

    // Validate token format (basic check)
    if (token.length < 10) {
      console.warn('Dashboard: Token seems invalid, clearing and redirecting')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
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
        const errorMsg = error.response.data?.error || error.response.statusText || 'Noma\'lum xatolik'
        toast.error(`Ma'lumotlarni yuklashda xatolik: ${error.response.status} - ${errorMsg}`)
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

  const handleDeleteTree = async (tree) => {
    if (!confirm(`Daraxt ID ${tree.tree_id} ni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.`)) {
      return
    }

    try {
      await treesAPI.delete(tree.id || tree.tree_id)
      toast.success('Daraxt muvaffaqiyatli o\'chirildi')
      // Reload trees
      loadTrees()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error.response?.data?.error || 'Daraxtni o\'chirishda xatolik')
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-300 dark:border-gray-600 border-t-green-600 dark:border-t-green-500 mb-4"></div>
          <div className="text-base font-medium text-gray-900 dark:text-gray-100">{translations.loading || 'Yuklanmoqda...'}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Ma'lumotlar yuklanmoqda...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Modern Header with Dark Mode */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex-shrink-0">
                <Logo size={40} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {translations.title}
                </h1>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ThemeToggle />
              {user && (
                <div className="hidden md:flex items-center gap-3 pr-3 border-r border-gray-200 dark:border-gray-700">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</div>
                  </div>
                </div>
              )}
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Admin"
                >
                  <FiSettings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Chiqish"
              >
                <FiLogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{translations.logout}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Overview - Data-Dense KPI Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {/* Total Trees */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-md dark:hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">{translations.totalTrees}</p>
                  <p className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalTrees}</p>
                  <div className="mt-2 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center ml-3 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-lg lg:text-2xl">🌳</span>
                </div>
              </div>
            </div>

            {/* Online Trees */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-md dark:hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">{translations.onlineTrees}</p>
                  <p className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.onlineTrees}</p>
                  <div className="mt-2 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all" 
                      style={{ width: stats.totalTrees > 0 ? `${(stats.onlineTrees / stats.totalTrees) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center ml-3 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Offline Trees */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-md dark:hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">{translations.offlineTrees}</p>
                  <p className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.offlineTrees}</p>
                  <div className="mt-2 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-400 dark:bg-gray-600 rounded-full transition-all" 
                      style={{ width: stats.totalTrees > 0 ? `${(stats.offlineTrees / stats.totalTrees) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center ml-3 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className={`bg-white dark:bg-gray-800 rounded-lg border p-4 lg:p-6 hover:shadow-md dark:hover:shadow-lg transition-all group ${
              stats.unacknowledgedAlerts > 0 
                ? 'border-red-200 dark:border-red-800' 
                : 'border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">{translations.unacknowledgedAlerts}</p>
                  <p className={`text-xl lg:text-2xl font-semibold ${
                    stats.unacknowledgedAlerts > 0 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {stats.unacknowledgedAlerts}
                  </p>
                  <div className="mt-2 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        stats.unacknowledgedAlerts > 0 ? 'bg-red-500' : 'bg-yellow-400'
                      }`}
                      style={{ width: stats.totalAlerts > 0 ? `${(stats.unacknowledgedAlerts / stats.totalAlerts) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center ml-3 flex-shrink-0 group-hover:scale-110 transition-transform ${
                  stats.unacknowledgedAlerts > 0 
                    ? 'bg-red-50 dark:bg-red-900/20' 
                    : 'bg-yellow-50 dark:bg-yellow-900/20'
                }`}>
                  <span className="text-base lg:text-xl">⚠️</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trees Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              {/* Section Header */}
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">{translations.trees}</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-emerald-400 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-lg transition-colors shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <FiPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">{translations.addTree}</span>
                  <span className="sm:hidden">Qo'shish</span>
                </button>
              </div>

              {/* Trees Grid - Optimized for Data Density */}
              <div className="p-4 sm:p-6">
                {trees.length === 0 ? (
                  <div className="text-center py-12 sm:py-16">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl sm:text-3xl">🌳</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{translations.noData}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Birinchi daraxtni qo'shing</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-400 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-lg transition-colors shadow-sm hover:shadow-md"
                    >
                      <FiPlus className="w-4 h-4" />
                      {translations.addTree}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {trees.map((tree) => (
                      <TreeCard
                        key={tree.id || tree.tree_id}
                        tree={tree}
                        onClick={() => handleTreeClick(tree)}
                        onDelete={() => handleDeleteTree(tree)}
                        ppmThreshold={ppmThreshold}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              <AlertsPanel alerts={alerts} onAcknowledge={loadAlerts} />
              
              {/* AI Analysis */}
              <div className="space-y-6">
                <TreeAI />
              </div>
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

