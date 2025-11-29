'use client'

import { useState, useEffect, useCallback } from 'react'
import { treesAPI, alertsAPI } from '@/lib/api'
import { getSocket } from '@/lib/socket'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { format, subDays } from 'date-fns'
import dynamic from 'next/dynamic'

// Dynamically import Leaflet map to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">Xarita yuklanmoqda...</div>
})

// Dynamically import 3D Tree visualization to avoid SSR issues
const Tree3D = dynamic(() => import('./Tree3D'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gradient-to-b from-sky-100 to-blue-50 rounded-lg flex items-center justify-center text-gray-500">3D model yuklanmoqda...</div>
})

const translations = {
  title: "Daraxt ma'lumotlari",
  treeId: "Daraxt ID",
  species: "Turi",
  plantedYear: "Ekilgan yil",
  notes: "Eslatmalar",
  latitude: "Kenglik",
  longitude: "Uzunlik",
  ownerContact: "Egasi aloqa",
  telemetry: "Telemetriya",
  temperature: "Harorat",
  humidity: "Namlik",
  smoke: "Tutun",
  currentStatus: "Joriy holat",
  realTime: "Real vaqt",
  celsius: "°C",
  percent: "%",
  ppm: "PPM",
  save: "Saqlash",
  cancel: "Bekor qilish",
  close: "Yopish",
  history: "Tarix",
  last24Hours: "Oxirgi 24 soat",
  last7Days: "Oxirgi 7 kun",
  last30Days: "Oxirgi 30 kun",
  metadata: "Ma'lumotlar",
  edit: "Tahrirlash",
  alerts: "Ogohlantirishlar",
  alertDetails: "Ogohlantirish tafsilotlari",
  alertType: "Turi",
  alertLevel: "Daraja",
  alertMessage: "Xabar",
  alertTime: "Vaqt",
  alertReason: "Sabab",
  noAlerts: "Ogohlantirishlar yo'q",
  offline: "Offline",
  offlineMessage: "Daraxt hozirda offline. Ma'lumotlar kelmayapti.",
  lastSeen: "Oxirgi ko'rilgan",
  activeAlerts: "Faol ogohlantirishlar",
  acknowledgedAlerts: "Tasdiqlangan ogohlantirishlar",
  acknowledged: "Tasdiqlangan",
  acknowledgedAt: "Tasdiqlangan vaqti",
  smokeAlert: "Tutun aniqlandi",
  cutAlert: "Kesilish xavfi",
  tiltAlert: "Og'ish aniqlandi",
  smokeReason: "MQ-2 sensori yuqori tutun darajasini aniqlandi. Bu yong'in xavfi yoki havo ifloslanishini ko'rsatishi mumkin.",
  cutReason: "MPU6050 akselerometr to'satdan harakat o'zgarishini aniqlandi. Bu daraxtning kesilishi yoki qulashi xavfini ko'rsatishi mumkin.",
  tiltReason: "MPU6050 sensori daraxtning og'ishini aniqlandi. Bu daraxtning noto'g'ri o'sishi yoki shikastlanishini ko'rsatishi mumkin.",
}

export default function TreeModal({ tree, onClose, onAlertAcknowledge }) {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    species: tree.species || '',
    planted_year: tree.planted_year || '',
    notes: tree.notes || '',
    latitude: tree.latitude || '',
    longitude: tree.longitude || '',
    owner_contact: tree.owner_contact || '',
    image_url: tree.image_url || '',
  })
  const [imagePreview, setImagePreview] = useState(tree.image_url || null)
  const [timeRange, setTimeRange] = useState('24h')
  const [treeData, setTreeData] = useState(tree)
  const [currentTelemetry, setCurrentTelemetry] = useState(null) // Real-time current values
  
  // Use treeData state instead of tree prop to allow updates
  // Always use treeData if available, otherwise fall back to tree prop
  const currentTree = treeData || tree
  
  // Update currentTree reference when treeData changes
  useEffect(() => {
    if (treeData) {
      // treeData updated, component will re-render
    }
  }, [treeData])
  
  const [mapPosition, setMapPosition] = useState(() => {
    const lat = parseFloat(currentTree.latitude)
    const lng = parseFloat(currentTree.longitude)
    return (lat && lng) ? [lat, lng] : [41.3111, 69.2797]
  })

  // Update map position when tree data changes
  useEffect(() => {
    const lat = parseFloat(currentTree.latitude)
    const lng = parseFloat(currentTree.longitude)
    if (lat && lng) {
      setMapPosition([lat, lng])
    }
  }, [currentTree.latitude, currentTree.longitude])
  
  // Check if tree is offline (no data in last 30 seconds)
  // If data is 5-10 seconds old, still show it (grace period)
  // After 30 seconds, mark as offline
  const getLastSeenDate = () => {
    if (!currentTree.last_seen_at) return null
    try {
      const date = new Date(currentTree.last_seen_at)
      // If timestamp is invalid (1970 or earlier), treat as null
      if (date.getTime() < new Date('2000-01-01').getTime()) {
        return null
      }
      return date
    } catch (e) {
      return null
    }
  }
  
  const now = new Date()
  const lastSeenDate = getLastSeenDate()
  const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000)
  const tenSecondsAgo = new Date(now.getTime() - 10 * 1000)
  
  // Tree is offline if:
  // 1. No last_seen_at timestamp, OR
  // 2. Last seen was more than 30 seconds ago
  const isOffline = !lastSeenDate || (lastSeenDate < thirtySecondsAgo)
  
  // Only show telemetry if tree is online
  const shouldShowTelemetry = !isOffline && currentTelemetry

  const loadTreeData = useCallback(async () => {
    try {
      const treeId = currentTree.id || currentTree.tree_id
      const updatedTree = await treesAPI.getById(treeId)
      
      // Only update treeData (for charts), NOT currentTelemetry
      // currentTelemetry is updated via Socket.IO real-time events
      setTreeData(updatedTree)
      
      console.log('loadTreeData: Updated treeData (for charts), NOT currentTelemetry') // Debug log
      
      // DO NOT update currentTelemetry here - it's managed by Socket.IO
      // This prevents overwriting real-time updates with stale database data
    } catch (error) {
      console.error('Error loading tree data:', error)
    }
  }, [currentTree.id, currentTree.tree_id])

  // Set initial current telemetry from latest data ONLY when modal first opens
  // BUT: Don't override if we have real-time Socket.IO data (currentTelemetry is already set)
  // This effect runs when treeData is first loaded, but won't overwrite Socket.IO updates
  useEffect(() => {
    // Only set initial telemetry if:
    // 1. currentTelemetry is null/undefined (first load or reset)
    // 2. treeData has telemetry data
    // This prevents overwriting real-time Socket.IO updates
    if (!currentTelemetry && treeData && treeData.telemetry && treeData.telemetry.length > 0) {
      const latest = treeData.telemetry[0]
      const initialTelemetry = {
        temp_c: (latest.temp_c === null || latest.temp_c === undefined || latest.temp_c === 0) ? null : latest.temp_c,
        humidity_pct: (latest.humidity_pct === null || latest.humidity_pct === undefined || latest.humidity_pct === 0) ? null : latest.humidity_pct,
        mq2: latest.mq2 || 0,
        status: latest.status,
        timestamp: latest.timestamp,
        // MPU6050 data for 3D visualization
        mpu_accel_x: latest.mpu_accel_x || 0,
        mpu_accel_y: latest.mpu_accel_y || 0,
        mpu_accel_z: latest.mpu_accel_z !== undefined ? latest.mpu_accel_z : -1,
        mpu_gyro_x: latest.mpu_gyro_x || 0,
        mpu_gyro_y: latest.mpu_gyro_y || 0,
        mpu_gyro_z: latest.mpu_gyro_z || 0,
        mpu_tilt: latest.mpu_tilt || false,
        mpu_cut_detected: latest.mpu_cut_detected || false
      }
      console.log('Setting initial currentTelemetry from treeData (first load only):', initialTelemetry) // Debug log
      setCurrentTelemetry(initialTelemetry)
    } else if (currentTelemetry) {
      console.log('Skipping initial telemetry - currentTelemetry already set (real-time data active)') // Debug log
    }
  }, [treeData?.telemetry?.length]) // Only run when telemetry array length changes (first load)

  // Listen for real-time telemetry updates
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handleTelemetry = (data) => {
      console.log('TreeModal handleTelemetry called with data:', data) // Debug log
      console.log('Current tree_id:', currentTree.tree_id) // Debug log
      console.log('Current treeData:', treeData) // Debug log
      
      // Use treeData.tree_id if available, otherwise use currentTree.tree_id
      const currentTreeId = (treeData && treeData.tree_id) || currentTree.tree_id
      
      if (data.tree_id === currentTreeId) {
        console.log('TreeModal received telemetry for current tree:', data) // Debug log
        
        // Check if tree is online (timestamp within 5 minutes)
        const now = new Date()
        let timestamp
        if (data.timestamp) {
          // Parse timestamp - could be ISO string or Unix timestamp
          if (typeof data.timestamp === 'string') {
            timestamp = new Date(data.timestamp)
          } else if (typeof data.timestamp === 'number') {
            // If timestamp is too small (< 1000000), it's likely millis()/1000 from ESP8266 boot time
            // In that case, use current server time instead
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
        const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000)
        const isOnline = timestamp > thirtySecondsAgo
        
        console.log('Is online:', isOnline, 'Timestamp:', timestamp.toISOString(), 'Original timestamp:', data.timestamp) // Debug log
        
        if (isOnline) {
          // Convert 0 to null for temp_c and humidity_pct (sensor failure indicator)
          const newTelemetry = {
            temp_c: (data.temp_c === null || data.temp_c === undefined || data.temp_c === 0) ? null : data.temp_c,
            humidity_pct: (data.humidity_pct === null || data.humidity_pct === undefined || data.humidity_pct === 0) ? null : data.humidity_pct,
            mq2: data.mq2 || 0,
            status: data.status,
            timestamp: timestamp.toISOString(),  // ISO string
            // MPU6050 data for 3D visualization
            mpu_accel_x: data.mpu_accel_x || 0,
            mpu_accel_y: data.mpu_accel_y || 0,
            mpu_accel_z: data.mpu_accel_z !== undefined ? data.mpu_accel_z : -1, // Default to -1 (pointing down)
            mpu_gyro_x: data.mpu_gyro_x || 0,
            mpu_gyro_y: data.mpu_gyro_y || 0,
            mpu_gyro_z: data.mpu_gyro_z || 0,
            mpu_tilt: data.mpu_tilt || false,
            mpu_cut_detected: data.mpu_cut_detected || false
          }
          console.log('Setting currentTelemetry to:', newTelemetry) // Debug log
          console.log('Previous currentTelemetry:', currentTelemetry) // Debug log
          
          // Force state update with new object reference to trigger re-render
          setCurrentTelemetry({ ...newTelemetry })
          
          // Update treeData to refresh charts with new telemetry data
          // Add new telemetry to the beginning of the array (most recent first)
          setTreeData(prev => {
            if (!prev || !prev.telemetry) {
              return {
                ...prev,
                last_seen_at: timestamp.toISOString(),
                telemetry: [{
                  temp_c: newTelemetry.temp_c,
                  humidity_pct: newTelemetry.humidity_pct,
                  mq2: newTelemetry.mq2,
                  status: newTelemetry.status,
                  timestamp: newTelemetry.timestamp
                }]
              }
            }
            
            // Check if this telemetry already exists (avoid duplicates)
            const existingIndex = prev.telemetry.findIndex(t => {
              try {
                const tTime = new Date(t.timestamp).getTime()
                const newTime = timestamp.getTime()
                // Consider same if within 1 second
                return Math.abs(tTime - newTime) < 1000
              } catch (e) {
                return false
              }
            })
            
            let updatedTelemetry
            if (existingIndex >= 0) {
              // Update existing telemetry
              updatedTelemetry = [...prev.telemetry]
              updatedTelemetry[existingIndex] = {
                ...updatedTelemetry[existingIndex],
                temp_c: newTelemetry.temp_c,
                humidity_pct: newTelemetry.humidity_pct,
                mq2: newTelemetry.mq2,
                status: newTelemetry.status,
                timestamp: newTelemetry.timestamp
              }
            } else {
              // Add new telemetry at the beginning
              updatedTelemetry = [{
                temp_c: newTelemetry.temp_c,
                humidity_pct: newTelemetry.humidity_pct,
                mq2: newTelemetry.mq2,
                status: newTelemetry.status,
                timestamp: newTelemetry.timestamp
              }, ...prev.telemetry]
              
              // Keep only last 1000 records to prevent memory issues
              if (updatedTelemetry.length > 1000) {
                updatedTelemetry = updatedTelemetry.slice(0, 1000)
              }
            }
            
            return {
              ...prev,
              last_seen_at: timestamp.toISOString(),
              telemetry: updatedTelemetry
            }
          })
          
          console.log('State updated - component should re-render') // Debug log
        } else {
          // Tree went offline, clear telemetry
          console.log('Tree went offline, clearing telemetry') // Debug log
          setCurrentTelemetry(null)
        }
        
        // Don't call loadTreeData() here - it will overwrite real-time updates
        // Only refresh charts periodically, not on every telemetry update
      } else {
        console.log('Telemetry data is for different tree, ignoring') // Debug log
      }
    }

    socket.on('telemetry', handleTelemetry)

    return () => {
      socket.off('telemetry', handleTelemetry)
    }
  }, [currentTree.tree_id, treeData]) // Include treeData to get latest tree_id

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Faqat rasm fayllari qabul qilinadi')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Rasm hajmi 5MB dan katta bo\'lmasligi kerak')
        return
      }

      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setFormData({ ...formData, image_url: base64String })
        setImagePreview(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: '' })
    setImagePreview(null)
  }

  const handleSave = async () => {
    try {
      // Always compress image to reduce size
      let dataToSave = { ...formData }
      if (dataToSave.image_url) {
        // Compress image by reducing size and quality
        const img = new Image()
        img.src = dataToSave.image_url
        await new Promise((resolve, reject) => {
          img.onerror = () => reject(new Error('Rasm yuklashda xatolik'))
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const maxWidth = 600
            const maxHeight = 600
            let width = img.width
            let height = img.height
            
            // Calculate new dimensions maintaining aspect ratio
            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width
                width = maxWidth
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height
                height = maxHeight
              }
            }
            
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)
            // Use lower quality (0.5) for better compression
            dataToSave.image_url = canvas.toDataURL('image/jpeg', 0.5)
            console.log('Image compressed:', {
              original: dataToSave.image_url.length,
              compressed: dataToSave.image_url.length,
              size: `${width}x${height}`
            })
            resolve()
          }
        })
      }
      
      await treesAPI.update(currentTree.id || currentTree.tree_id, dataToSave)
      toast.success('Ma\'lumotlar saqlandi')
      setEditing(false)
      // Update treeData with new image
      const updatedTree = await treesAPI.getById(currentTree.id || currentTree.tree_id)
      setTreeData(updatedTree)
      onClose()
    } catch (error) {
      console.error('Save error:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Saqlashda xatolik'
      toast.error(errorMsg)
    }
  }

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await alertsAPI.acknowledge(alertId)
      toast.success('Ogohlantirish tasdiqlandi')
      // Reload tree data to get updated alerts
      const updatedTree = await treesAPI.getById(currentTree.id || currentTree.tree_id)
      setTreeData(updatedTree)
      if (onAlertAcknowledge) {
        onAlertAcknowledge()
      }
    } catch (error) {
      toast.error('Tasdiqlashda xatolik')
    }
  }

  const handleExportExcel = async () => {
    try {
      // Get full telemetry data for export
      const treeId = currentTree.id || currentTree.tree_id
      const treeDataForExport = await treesAPI.getById(treeId)
      
      if (!treeDataForExport.telemetry || treeDataForExport.telemetry.length === 0) {
        toast.error('Export qilish uchun ma\'lumot yo\'q')
        return
      }

      // Filter telemetry based on selected time range
      const now = new Date()
      let filteredData = treeDataForExport.telemetry.filter((t) => {
        const date = new Date(t.timestamp)
        if (timeRange === '24h') {
          return date >= subDays(now, 1)
        } else if (timeRange === '7d') {
          return date >= subDays(now, 7)
        } else {
          return date >= subDays(now, 30)
        }
      })

      if (filteredData.length === 0) {
        toast.error('Tanlangan davr uchun ma\'lumot topilmadi')
        return
      }

      // Sort by timestamp (newest first)
      filteredData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

      // Prepare data for Excel
      const excelData = filteredData.map((t, index) => ({
        '№': index + 1,
        'Sana va Vaqt': format(new Date(t.timestamp), 'dd.MM.yyyy HH:mm:ss'),
        'Harorat (°C)': t.temp_c != null ? Number(t.temp_c).toFixed(2) : '-',
        'Namlik (%)': t.humidity_pct != null ? Number(t.humidity_pct).toFixed(2) : '-',
        'Tutun (PPM)': t.mq2 != null ? Number(t.mq2) : '-',
        'Holat': t.status === 'alert' ? 'Ogohlantirish' : 'Yaxshi',
        'MPU Tilt': t.mpu_tilt ? 'Ha' : 'Yo\'q',
        'MPU Cut': t.mpu_cut_detected ? 'Ha' : 'Yo\'q',
      }))

      // Create workbook
      const wb = XLSX.utils.book_new()
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData)

      // Set column widths
      ws['!cols'] = [
        { wch: 5 },   // №
        { wch: 20 },  // Sana va Vaqt
        { wch: 12 },  // Harorat
        { wch: 12 },  // Namlik
        { wch: 12 },  // Tutun
        { wch: 15 },  // Holat
        { wch: 12 },  // MPU Tilt
        { wch: 12 },  // MPU Cut
      ]

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Telemetriya')

      // Generate filename
      const timeRangeLabel = timeRange === '24h' ? '24_soat' : timeRange === '7d' ? '7_kun' : '30_kun'
      const filename = `Daraxt_${currentTree.tree_id}_${timeRangeLabel}_${format(new Date(), 'dd-MM-yyyy')}.xlsx`

      // Export to Excel
      XLSX.writeFile(wb, filename)
      
      toast.success(`Excel fayl yuklab olindi: ${filename}`)
    } catch (error) {
      console.error('Excel export error:', error)
      toast.error('Excel export qilishda xatolik')
    }
  }

  // Filter and format telemetry data
  const filteredTelemetry = currentTree.telemetry
    ? currentTree.telemetry
        .filter((t) => {
          const date = new Date(t.timestamp)
          const now = new Date()
          if (timeRange === '24h') {
            return date >= subDays(now, 1)
          } else if (timeRange === '7d') {
            return date >= subDays(now, 7)
          } else {
            return date >= subDays(now, 30)
          }
        })
        .map((t) => ({
          ...t,
          timestamp: format(new Date(t.timestamp), 'dd.MM HH:mm'),
          timestampFull: new Date(t.timestamp),
        }))
        .reverse()
    : []

  // Calculate statistics for filtered telemetry
  const calculateStats = (data, key) => {
    const values = data
      .map(t => t[key])
      .filter(v => v !== null && v !== undefined && !isNaN(v))
      .map(v => Number(v))
    
    if (values.length === 0) return { avg: null, min: null, max: null, trend: null }
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    // Calculate trend (comparing first half vs second half)
    let trend = null
    if (values.length >= 4) {
      const firstHalf = values.slice(0, Math.floor(values.length / 2))
      const secondHalf = values.slice(Math.floor(values.length / 2))
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
      const diff = ((secondAvg - firstAvg) / firstAvg) * 100
      if (Math.abs(diff) < 2) {
        trend = 'stable'
      } else {
        trend = diff > 0 ? 'up' : 'down'
      }
    }
    
    return { avg, min, max, trend }
  }

  const tempStats = calculateStats(filteredTelemetry, 'temp_c')
  const humidityStats = calculateStats(filteredTelemetry, 'humidity_pct')
  const mq2Stats = calculateStats(filteredTelemetry, 'mq2')

  // Get all alerts for this tree (both active and acknowledged)
  const allAlerts = currentTree.alerts || []
  const activeAlerts = allAlerts.filter(a => !a.acknowledged)
  const acknowledgedAlerts = allAlerts.filter(a => a.acknowledged)

  // Get latest MPU6050 data from last 30 days for offline trees
  const getLatestMPU6050Data = () => {
    // If tree is online and has current telemetry, use it
    if (!isOffline && currentTelemetry) {
      return {
        accelX: currentTelemetry.mpu_accel_x || 0,
        accelY: currentTelemetry.mpu_accel_y || 0,
        accelZ: currentTelemetry.mpu_accel_z !== undefined ? currentTelemetry.mpu_accel_z : -1,
        gyroX: currentTelemetry.mpu_gyro_x || 0,
        gyroY: currentTelemetry.mpu_gyro_y || 0,
        gyroZ: currentTelemetry.mpu_gyro_z || 0,
        isCut: currentTelemetry.mpu_cut_detected || false,
        isTilt: currentTelemetry.mpu_tilt || false,
      }
    }
    
    // If offline, search in last 30 days of telemetry data
    if (isOffline && currentTree.telemetry && currentTree.telemetry.length > 0) {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      // Find the most recent telemetry with MPU6050 data
      const telemetryWithMPU = currentTree.telemetry
        .filter(t => {
          const date = new Date(t.timestamp)
          return date >= thirtyDaysAgo && (
            (t.mpu_accel_x !== null && t.mpu_accel_x !== undefined) ||
            (t.mpu_accel_y !== null && t.mpu_accel_y !== undefined) ||
            (t.mpu_accel_z !== null && t.mpu_accel_z !== undefined) ||
            (t.mpu_gyro_x !== null && t.mpu_gyro_x !== undefined) ||
            (t.mpu_gyro_y !== null && t.mpu_gyro_y !== undefined) ||
            (t.mpu_gyro_z !== null && t.mpu_gyro_z !== undefined)
          )
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
      
      if (telemetryWithMPU) {
        return {
          accelX: telemetryWithMPU.mpu_accel_x || 0,
          accelY: telemetryWithMPU.mpu_accel_y || 0,
          accelZ: telemetryWithMPU.mpu_accel_z !== undefined ? telemetryWithMPU.mpu_accel_z : -1,
          gyroX: telemetryWithMPU.mpu_gyro_x || 0,
          gyroY: telemetryWithMPU.mpu_gyro_y || 0,
          gyroZ: telemetryWithMPU.mpu_gyro_z || 0,
          isCut: telemetryWithMPU.mpu_cut_detected || false,
          isTilt: telemetryWithMPU.mpu_tilt || false,
        }
      }
    }
    
    // Default values if no data found
    return {
      accelX: 0,
      accelY: 0,
      accelZ: -1,
      gyroX: 0,
      gyroY: 0,
      gyroZ: 0,
      isCut: false,
      isTilt: false,
    }
  }

  const mpu6050Data = getLatestMPU6050Data()

  // Refresh tree data when tree prop changes
  useEffect(() => {
    setTreeData(tree)
    // Reset currentTelemetry when tree changes (new tree selected)
    setCurrentTelemetry(null)
    // Load fresh data when modal opens
    loadTreeData()
  }, [tree, loadTreeData])

  // Auto-refresh telemetry data every 30 seconds (only for charts, NOT for currentTelemetry)
  // Real-time updates come from Socket.IO, so we don't need to refresh currentTelemetry
  // loadTreeData() will NOT update currentTelemetry - it only updates treeData for charts
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refresh: Loading treeData for charts (NOT updating currentTelemetry)') // Debug log
      // Only refresh treeData for charts, but don't overwrite currentTelemetry
      loadTreeData()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [loadTreeData])

  const handleBackdropClick = (e) => {
    // Close modal if clicking on backdrop (not on modal content)
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-3">
            {currentTree.image_url ? (
              <img 
                src={currentTree.image_url} 
                alt={`Daraxt ${currentTree.tree_id}`}
                className="w-12 h-12 rounded-lg object-cover border-2 border-white/30"
              />
            ) : (
              <span className="text-4xl animate-bounce" style={{ animationDuration: '2s' }}>🌳</span>
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">
                {translations.title}
              </h2>
              <p className="text-green-100 text-sm mt-1">
                {translations.treeId} #{currentTree.tree_id}
                {currentTree.species && ` • ${currentTree.species}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full transition-colors"
            title="Yopish"
          >
            ×
          </button>
        </div>

        {/* Content - Grid Layout */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Metadata (Sticky on large screens) */}
            <div className="lg:col-span-1 lg:sticky lg:top-6 lg:self-start space-y-6">
              {/* Current Real-time Status - Compact */}
              {isOffline ? (
                <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-400 border-dashed rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⚫</span>
                    <h3 className="text-lg font-bold text-gray-800">{translations.offline}</h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{translations.offlineMessage}</p>
                  {lastSeenDate && (
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold">{translations.lastSeen}:</span>{' '}
                      {format(lastSeenDate, 'dd.MM.yyyy HH:mm')}
                    </p>
                  )}
                </div>
              ) : shouldShowTelemetry ? (
                <div className="p-4 bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 border-2 border-green-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      {translations.currentStatus}
                    </h3>
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-semibold animate-pulse">
                      {translations.realTime}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-white p-3 rounded-lg border-2 border-blue-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700 uppercase">{translations.temperature}</span>
                        <span className="text-xl">🌡️</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {currentTelemetry.temp_c != null ? Number(currentTelemetry.temp_c).toFixed(1) : '-'}
                        <span className="text-sm text-gray-500 ml-1">{translations.celsius}</span>
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border-2 border-green-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700 uppercase">{translations.humidity}</span>
                        <span className="text-xl">💧</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {currentTelemetry.humidity_pct != null ? Number(currentTelemetry.humidity_pct).toFixed(1) : '-'}
                        <span className="text-sm text-gray-500 ml-1">{translations.percent}</span>
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg border-2 shadow-sm ${
                      (currentTelemetry.mq2 != null && Number(currentTelemetry.mq2) > 400)
                        ? 'bg-red-50 border-red-300' 
                        : 'bg-white border-yellow-100'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700 uppercase">{translations.smoke}</span>
                        <span className="text-xl">{(currentTelemetry.mq2 != null && Number(currentTelemetry.mq2) > 400) ? '🔥' : '💨'}</span>
                      </div>
                      <p className={`text-2xl font-bold ${
                        (currentTelemetry.mq2 != null && Number(currentTelemetry.mq2) > 400) ? 'text-red-700' : 'text-gray-900'
                      }`}>
                        {currentTelemetry.mq2 != null ? Number(currentTelemetry.mq2) : '-'}
                        <span className="text-sm text-gray-500 ml-1">{translations.ppm}</span>
                      </p>
                      {(currentTelemetry.mq2 != null && Number(currentTelemetry.mq2) > 400) && (
                        <p className="text-xs text-red-600 mt-1 font-bold">⚠️ Yuqori!</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : !isOffline ? (
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 border-dashed rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⏳</span>
                    <h3 className="text-sm font-bold text-yellow-800">Ma'lumotlar kutilmoqda...</h3>
                  </div>
                  <p className="text-xs text-yellow-700">Qurilma ulanib, ma'lumot yuborishni kutmoqda</p>
                </div>
              ) : null}

              {/* 3D Tree Visualization - Show always (online or offline with historical data) */}
                <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                    <span className="text-lg">🌳</span>
                    3D Daraxt Ko'rinishi
                  {isOffline && (
                    <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      📊 Tarixiy ma'lumot
                    </span>
                  )}
                  </h3>
                  <Tree3D
                  accelX={mpu6050Data.accelX}
                  accelY={mpu6050Data.accelY}
                  accelZ={mpu6050Data.accelZ}
                  gyroX={mpu6050Data.gyroX}
                  gyroY={mpu6050Data.gyroY}
                  gyroZ={mpu6050Data.gyroZ}
                  isCut={mpu6050Data.isCut}
                  isTilt={mpu6050Data.isTilt}
                />
                {isOffline && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {mpu6050Data.accelX !== 0 || mpu6050Data.accelY !== 0 || mpu6050Data.accelZ !== -1
                      ? "Oxirgi 30 kunlik ma'lumotlardan MPU6050 ko'rsatilmoqda"
                      : "MPU6050 ma'lumotlari topilmadi"}
                  </p>
                )}
                {!isOffline && !currentTelemetry && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      MPU6050 ma'lumotlari kutilmoqda...
                    </p>
                  )}
                </div>

              {/* Metadata Section */}
              <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    {translations.metadata}
                  </h3>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      ✏️ {translations.edit}
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      {translations.species}
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.species}
                        onChange={(e) =>
                          setFormData({ ...formData, species: e.target.value })
                        }
                        className="w-full px-2 py-1.5 text-sm border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-gray-900 font-semibold text-sm">{formData.species || <span className="text-gray-400">-</span>}</p>
                    )}
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      {translations.plantedYear}
                    </label>
                    {editing ? (
                      <input
                        type="number"
                        value={formData.planted_year}
                        onChange={(e) =>
                          setFormData({ ...formData, planted_year: e.target.value })
                        }
                        className="w-full px-2 py-1.5 text-sm border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-gray-900 font-semibold text-sm">{formData.planted_year || <span className="text-gray-400">-</span>}</p>
                    )}
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      {translations.notes}
                    </label>
                    {editing ? (
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        className="w-full px-2 py-1.5 text-sm border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
                        rows="2"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium text-sm">{formData.notes || <span className="text-gray-400">-</span>}</p>
                    )}
                  </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    📍 {translations.latitude} / {translations.longitude}
                  </label>
                  {editing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="any"
                          value={formData.latitude}
                          onChange={(e) => {
                            const lat = e.target.value
                            setFormData({ ...formData, latitude: lat })
                            if (lat && formData.longitude) {
                              setMapPosition([parseFloat(lat), parseFloat(formData.longitude)])
                            }
                          }}
                          className="px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
                          placeholder="Kenglik"
                        />
                        <input
                          type="number"
                          step="any"
                          value={formData.longitude}
                          onChange={(e) => {
                            const lng = e.target.value
                            setFormData({ ...formData, longitude: lng })
                            if (formData.latitude && lng) {
                              setMapPosition([parseFloat(formData.latitude), parseFloat(lng)])
                            }
                          }}
                          className="px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
                          placeholder="Uzunlik"
                        />
                      </div>
                      {/* Map for selecting location */}
                      <div className="h-64 rounded-lg overflow-hidden border-2 border-gray-300">
                        <MapComponent
                          position={mapPosition}
                          onPositionChange={(lat, lng) => {
                            setFormData({ 
                              ...formData, 
                              latitude: lat.toFixed(8), 
                              longitude: lng.toFixed(8) 
                            })
                            setMapPosition([lat, lng])
                          }}
                          editable={true}
                          treeId={currentTree.tree_id}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        💡 Xaritada belgini siljitib, joylashuvni tanlang
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-gray-900 font-semibold">
                        {formData.latitude && formData.longitude
                          ? `${Number(formData.latitude).toFixed(8)}, ${Number(formData.longitude).toFixed(8)}`
                          : <span className="text-gray-400">-</span>}
                      </p>
                      {/* Map for displaying location */}
                      {formData.latitude && formData.longitude && (
                        <div className="h-64 rounded-lg overflow-hidden border-2 border-gray-300">
                          <MapComponent
                            position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]}
                            editable={false}
                            treeId={currentTree.tree_id}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Daraxt rasmi
                  </label>
                  {editing ? (
                    <div>
                      {imagePreview ? (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors"
                            title="Rasmni o'chirish"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload-edit"
                          />
                          <label
                            htmlFor="image-upload-edit"
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            <span className="text-4xl">📷</span>
                            <span className="text-sm text-gray-600">Rasm yuklash uchun bosing</span>
                            <span className="text-xs text-gray-500">JPG, PNG (maks. 5MB)</span>
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {formData.image_url ? (
                        <img 
                          src={formData.image_url} 
                          alt={`Daraxt ${currentTree.tree_id}`}
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">Rasm yuklanmagan</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {editing && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-sm hover:shadow-md transition-all"
                    >
                      ✓ {translations.save}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold shadow-sm hover:shadow-md transition-all"
                    >
                      ✕ {translations.cancel}
                    </button>
                  </div>
                )}
              </div>
            </div>

            </div>

            {/* Right Column - Charts and Alerts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Alerts Section */}
              {(activeAlerts.length > 0 || acknowledgedAlerts.length > 0) && (
                <div>
                {/* Active Alerts */}
                {activeAlerts.length > 0 && (
                  <div className="mb-4 p-5 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold mb-4 text-red-900 flex items-center gap-2">
                      <span className="text-xl">🚨</span>
                      {translations.activeAlerts}
                    </h3>
                    <div className="space-y-3">
                      {activeAlerts.map((alert) => (
                        <div key={alert.id} className="bg-white p-4 rounded-xl border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                                  {alert.type === 'smoke' ? translations.smokeAlert : 
                                   alert.type === 'cut' ? translations.cutAlert : 
                                   translations.tiltAlert}
                                </span>
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                  alert.level === 'high' ? 'bg-red-200 text-red-900' : 'bg-yellow-200 text-yellow-900'
                                }`}>
                                  {alert.level === 'high' ? 'Yuqori' : 'O\'rtacha'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mb-2">
                                {format(new Date(alert.created_at), 'dd.MM.yyyy HH:mm')}
                              </p>
                            </div>
                            <button
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-sm hover:shadow-md transition-all"
                            >
                              ✓ Tasdiqlash
                            </button>
                          </div>
                          <p className="text-sm text-gray-800 font-semibold mb-3">{alert.message}</p>
                          <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <strong className="text-gray-900">{translations.alertReason}:</strong>{' '}
                            {alert.type === 'smoke' ? translations.smokeReason :
                             alert.type === 'cut' ? translations.cutReason :
                             translations.tiltReason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Acknowledged Alerts */}
                {acknowledgedAlerts.length > 0 && (
                  <div className="p-5 bg-gray-50 border-2 border-gray-200 rounded-xl">
                    <h3 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
                      <span className="text-xl">✓</span>
                      {translations.acknowledgedAlerts}
                    </h3>
                    <div className="space-y-3">
                      {acknowledgedAlerts.map((alert) => (
                        <div key={alert.id} className="bg-white p-4 rounded-xl border-2 border-gray-300 opacity-80">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                                  {alert.type === 'smoke' ? translations.smokeAlert : 
                                   alert.type === 'cut' ? translations.cutAlert : 
                                   translations.tiltAlert}
                                </span>
                                <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">
                                  ✓ {translations.acknowledged}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mb-2">
                                {format(new Date(alert.created_at), 'dd.MM.yyyy HH:mm')}
                                {alert.ack_at && ` • Tasdiqlangan: ${format(new Date(alert.ack_at), 'dd.MM.yyyy HH:mm')}`}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 font-semibold mb-3">{alert.message}</p>
                          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <strong className="text-gray-900">{translations.alertReason}:</strong>{' '}
                            {alert.type === 'smoke' ? translations.smokeReason :
                             alert.type === 'cut' ? translations.cutReason :
                             translations.tiltReason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

              {/* Telemetry Charts */}
              <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  {translations.telemetry}
                </h3>
                <div className="flex gap-3 items-center">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white font-semibold focus:border-blue-500 focus:outline-none shadow-sm"
                  >
                    <option value="24h">{translations.last24Hours}</option>
                    <option value="7d">{translations.last7Days}</option>
                    <option value="30d">{translations.last30Days}</option>
                  </select>
                  <button
                    onClick={handleExportExcel}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                    title="Excel'ga export qilish"
                  >
                    📥 Export
                  </button>
                </div>
              </div>

              {filteredTelemetry.length > 0 ? (
                <div className="space-y-6">
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Temperature Stats */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-blue-700">🌡️ Harorat</span>
                        {tempStats.trend && (
                          <span className={`text-xs font-bold ${
                            tempStats.trend === 'up' ? 'text-red-600' : 
                            tempStats.trend === 'down' ? 'text-blue-600' : 
                            'text-gray-600'
                          }`}>
                            {tempStats.trend === 'up' ? '📈' : tempStats.trend === 'down' ? '📉' : '➡️'}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {tempStats.avg !== null ? (
                          <>
                            <p className="text-2xl font-bold text-blue-900">{tempStats.avg.toFixed(1)}°C</p>
                            <div className="flex justify-between text-xs text-blue-700">
                              <span>Min: {tempStats.min.toFixed(1)}°C</span>
                              <span>Max: {tempStats.max.toFixed(1)}°C</span>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-blue-600">Ma'lumot yo'q</p>
                        )}
                      </div>
                    </div>

                    {/* Humidity Stats */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border-2 border-green-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-green-700">💧 Namlik</span>
                        {humidityStats.trend && (
                          <span className={`text-xs font-bold ${
                            humidityStats.trend === 'up' ? 'text-green-600' : 
                            humidityStats.trend === 'down' ? 'text-yellow-600' : 
                            'text-gray-600'
                          }`}>
                            {humidityStats.trend === 'up' ? '📈' : humidityStats.trend === 'down' ? '📉' : '➡️'}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {humidityStats.avg !== null ? (
                          <>
                            <p className="text-2xl font-bold text-green-900">{humidityStats.avg.toFixed(1)}%</p>
                            <div className="flex justify-between text-xs text-green-700">
                              <span>Min: {humidityStats.min.toFixed(1)}%</span>
                              <span>Max: {humidityStats.max.toFixed(1)}%</span>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-green-600">Ma'lumot yo'q</p>
                        )}
                      </div>
                    </div>

                    {/* MQ2 Stats */}
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border-2 border-yellow-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-yellow-700">💨 Tutun</span>
                        {mq2Stats.trend && (
                          <span className={`text-xs font-bold ${
                            mq2Stats.trend === 'up' ? 'text-red-600' : 
                            mq2Stats.trend === 'down' ? 'text-green-600' : 
                            'text-gray-600'
                          }`}>
                            {mq2Stats.trend === 'up' ? '📈' : mq2Stats.trend === 'down' ? '📉' : '➡️'}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {mq2Stats.avg !== null ? (
                          <>
                            <p className="text-2xl font-bold text-yellow-900">{mq2Stats.avg.toFixed(0)} PPM</p>
                            <div className="flex justify-between text-xs text-yellow-700">
                              <span>Min: {mq2Stats.min.toFixed(0)} PPM</span>
                              <span>Max: {mq2Stats.max.toFixed(0)} PPM</span>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-yellow-600">Ma'lumot yo'q</p>
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
                            // Convert value to number if it's not already
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

                  {/* Info Footer */}
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border-2 border-blue-200">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl animate-pulse">📊</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            <span className="font-bold text-blue-600">{filteredTelemetry.length}</span> ta ma'lumot
                          </p>
                          <p className="text-xs text-gray-600">Real vaqtda yangilanadi</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔄</span>
                        <div>
                          <p className="text-xs text-gray-600">Oxirgi yangilanish:</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {currentTelemetry?.timestamp 
                              ? format(new Date(currentTelemetry.timestamp), 'HH:mm:ss')
                              : 'Kutilmoqda...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 text-center text-lg">
                    {translations.noData || "Ma'lumot yo'q"}
                  </p>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

