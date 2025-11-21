'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminsAPI, statsAPI, settingsAPI, treesAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const translations = {
  title: 'Admin Boshqaruvi',
  addAdmin: 'Yangi Admin Qo\'shish',
  username: 'Foydalanuvchi nomi',
  password: 'Parol',
  confirmPassword: 'Parolni tasdiqlash',
  create: 'Yaratish',
  update: 'Yangilash',
  cancel: 'Bekor qilish',
  delete: 'O\'chirish',
  edit: 'Tahrirlash',
  actions: 'Amallar',
  createdAt: 'Yaratilgan',
  noAdmins: 'Adminlar mavjud emas',
  deleteConfirm: 'Bu adminni o\'chirishni xohlaysizmi?',
  passwordMismatch: 'Parollar mos kelmaydi',
  passwordTooShort: 'Parol kamida 6 ta belgi bo\'lishi kerak',
  usernameRequired: 'Foydalanuvchi nomi kiritilishi shart',
  passwordRequired: 'Parol kiritilishi shart',
  adminCreated: 'Admin muvaffaqiyatli yaratildi',
  adminUpdated: 'Admin muvaffaqiyatli yangilandi',
  adminDeleted: 'Admin muvaffaqiyatli o\'chirildi',
  error: 'Xatolik yuz berdi',
  cannotDeleteSelf: 'O\'zingizni o\'chira olmaysiz',
  statistics: 'Statistikalar',
  totalAdmins: 'Jami Adminlar',
  totalUsers: 'Jami Foydalanuvchilar',
  totalTrees: 'Jami Daraxtlar',
  onlineTrees: 'Onlayn Daraxtlar',
  totalTelemetry: 'Jami Telemetriya',
  recentTelemetry: 'So\'nggi 24 soat',
  totalAlerts: 'Jami Ogohlantirishlar',
  unacknowledgedAlerts: 'Tasdiqlanmagan',
  adminsList: 'Adminlar Ro\'yxati',
  settings: 'Tizim Sozlamalari',
  ppmThreshold: 'PPM (Tutun) Ogohlantirish Chegarasi',
  ppmThresholdDesc: 'Tutun miqdori qancha PPM dan oshib ketganda ogohlantirish yuboriladi',
  save: 'Saqlash',
  settingUpdated: 'Sozlama muvaffaqiyatli yangilandi',
  esp8266Config: 'ESP8266 Konfiguratsiyasi',
  backendUrl: 'Backend URL',
  apiKey: 'API Key',
  telemetryEndpoint: 'Telemetriya Endpoint',
  copyToClipboard: 'Nusxalash',
  copied: 'Nusxalandi!',
  activeSensors: 'Faol Senslar',
  userSessions: 'Foydalanuvchi Sessiyalari',
  treeId: 'Daraxt ID',
  sensorStatus: 'Sensor Holati',
  online: 'Onlayn',
  offline: 'Offline',
  lastSeen: 'Oxirgi marta ko\'rilgan',
  temperature: 'Harorat',
  humidity: 'Namlik',
  smoke: 'Tutun (MQ-2)',
  motion: 'Harakat (MPU6050)',
  noActiveSensors: 'Faol senslar mavjud emas',
  loading: 'Yuklanmoqda...',
  username: 'Foydalanuvchi',
  ipAddress: 'IP Manzil',
  loginTime: 'Login vaqti',
  lastActivity: 'Oxirgi faollik',
  deviceInfo: 'Qurilma ma\'lumoti',
  noSessions: 'Sessiyalar mavjud emas',
  sessionsTableNotExists: 'User sessions jadvali mavjud emas. Migration ishga tushiring.',
  sessionsError: 'Sessiyalarni yuklashda xatolik',
  refreshSessions: 'Yangilash',
}

export default function AdminPage() {
  const [admins, setAdmins] = useState([])
  const [stats, setStats] = useState(null)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [ppmThreshold, setPpmThreshold] = useState(400)
  const [ppmThresholdInput, setPpmThresholdInput] = useState('400') // String for input (allows clearing)
  const [esp8266Config, setEsp8266Config] = useState(null)
  const [trees, setTrees] = useState([])
  const [userSessions, setUserSessions] = useState([])
  const [sessionsError, setSessionsError] = useState(null)
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [copiedField, setCopiedField] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.role !== 'admin') {
      toast.error('Admin huquqi talab qilinadi')
      router.push('/dashboard')
      return
    }

    loadAdmins()
    loadStats()
    loadSettings()
    loadESP8266Config()
    loadTrees()
    loadUserSessions()
  }, [router])

  const loadAdmins = async () => {
    try {
      const data = await adminsAPI.getAll()
      setAdmins(data)
    } catch (error) {
      console.error('Error loading admins:', error)
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        toast.error('Autentifikatsiya talab qilinadi')
        router.push('/login')
        return
      }
      
      if (error.response?.status === 403) {
        toast.error('Admin huquqi talab qilinadi')
        router.push('/dashboard')
        return
      }
      
      if (error.response?.status === 404) {
        toast.error('Server topilmadi. Iltimos, backend serverni qayta ishga tushiring.')
        return
      }
      
      // Show specific error message from backend if available
      const errorMessage = error.response?.data?.error || error.message || translations.error
      toast.error(errorMessage)
    }
  }

  const loadStats = async () => {
    try {
      const data = await statsAPI.getAll()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        toast.error('Autentifikatsiya talab qilinadi')
        router.push('/login')
        return
      }
      
      if (error.response?.status === 403) {
        // Don't show error for stats, just log it
        console.warn('Admin access required for stats')
        return
      }
      
      if (error.response?.status === 404) {
        // Stats endpoint not found - server might not be restarted
        console.warn('Stats endpoint not found - server might need restart')
        return
      }
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const data = await settingsAPI.getAll()
      setSettings(data)
      if (data.ppm_threshold) {
        const thresholdValue = parseInt(data.ppm_threshold.value) || 400
        setPpmThreshold(thresholdValue)
        setPpmThresholdInput(String(thresholdValue))
      } else {
        // Default value if not set
        setPpmThreshold(400)
        setPpmThresholdInput('400')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        console.warn('Settings endpoint not found - server might need restart or migration')
        // Use default value
        setPpmThreshold(400)
        setPpmThresholdInput('400')
      } else if (error.response?.status === 401) {
        toast.error('Autentifikatsiya talab qilinadi')
        router.push('/login')
      } else if (error.response?.status === 403) {
        console.warn('Admin access required for settings')
      }
    }
  }

  const handleSavePpmThreshold = async () => {
    // Validate input
    if (ppmThresholdInput === '' || ppmThresholdInput.trim() === '') {
      toast.error('PPM threshold kiritilishi shart')
      return
    }
    
    const thresholdValue = parseInt(ppmThresholdInput)
    
    if (isNaN(thresholdValue)) {
      toast.error('PPM threshold raqam bo\'lishi kerak')
      return
    }
    
    if (thresholdValue < 0 || thresholdValue > 10000) {
      toast.error('PPM threshold 0 dan 10000 gacha bo\'lishi kerak')
      return
    }

    try {
      await settingsAPI.update('ppm_threshold', thresholdValue)
      toast.success(translations.settingUpdated)
      setPpmThreshold(thresholdValue) // Update number value
      await loadSettings()
    } catch (error) {
      console.error('Error updating PPM threshold:', error)
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        toast.error('Settings endpoint topilmadi. Iltimos, backend serverni qayta ishga tushiring va migration ishga tushiring.')
      } else if (error.response?.status === 401) {
        toast.error('Autentifikatsiya talab qilinadi')
        router.push('/login')
      } else if (error.response?.status === 403) {
        toast.error('Admin huquqi talab qilinadi')
      } else {
        const errorMessage = error.response?.data?.error || error.message || translations.error
        toast.error(errorMessage)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.username.trim()) {
      toast.error(translations.usernameRequired)
      return
    }

    if (editingAdmin) {
      // Update admin (password optional)
      if (formData.password && formData.password.length < 6) {
        toast.error(translations.passwordTooShort)
        return
      }

      if (formData.password && formData.password !== formData.confirmPassword) {
        toast.error(translations.passwordMismatch)
        return
      }
    } else {
      // Create admin (password required)
      if (!formData.password) {
        toast.error(translations.passwordRequired)
        return
      }

      if (formData.password.length < 6) {
        toast.error(translations.passwordTooShort)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error(translations.passwordMismatch)
        return
      }
    }

    try {
      if (editingAdmin) {
        // Update admin
        const updateData = { username: formData.username }
        if (formData.password) {
          updateData.password = formData.password
        }
        await adminsAPI.update(editingAdmin.id, updateData)
        toast.success(translations.adminUpdated)
      } else {
        // Create admin
        await adminsAPI.create({
          username: formData.username,
          password: formData.password,
        })
        toast.success(translations.adminCreated)
      }

      setShowModal(false)
      resetForm()
      await loadAdmins()
      await loadStats() // Reload stats after creating/updating admin
    } catch (error) {
      console.error('Error saving admin:', error)
      const errorMessage = error.response?.data?.error || translations.error
      toast.error(errorMessage)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(translations.deleteConfirm)) {
      return
    }

    try {
      await adminsAPI.delete(id)
      toast.success(translations.adminDeleted)
      loadAdmins()
      loadStats() // Reload stats after deleting admin
    } catch (error) {
      console.error('Error deleting admin:', error)
      const errorMessage = error.response?.data?.error || translations.error
      toast.error(errorMessage)
    }
  }

  const handleEdit = (admin) => {
    setEditingAdmin(admin)
    setFormData({
      username: admin.username,
      password: '',
      confirmPassword: '',
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
    })
    setEditingAdmin(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

  const loadESP8266Config = async () => {
    try {
      const data = await settingsAPI.getESP8266Config()
      setEsp8266Config(data)
    } catch (error) {
      console.error('Error loading ESP8266 config:', error)
      // Set default config if API fails
      setEsp8266Config({
        backend_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        api_key: 'Not available',
        api_key_preview: 'Not available',
        telemetry_endpoint: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/telemetry`,
        header_name: 'X-API-Key'
      })
    }
  }

  const loadTrees = async () => {
    try {
      const data = await treesAPI.getAll()
      setTrees(data)
    } catch (error) {
      console.error('Error loading trees:', error)
    }
  }

  const copyToClipboard = async (text, fieldName) => {
    if (!text || text === 'Not available' || text === 'Not set') {
      toast.error('Nusxalash uchun ma\'lumot mavjud emas')
      return
    }

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        setCopiedField(fieldName)
        toast.success(translations.copied)
        setTimeout(() => setCopiedField(null), 2000)
        return
      }

      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        const successful = document.execCommand('copy')
        if (successful) {
          setCopiedField(fieldName)
          toast.success(translations.copied)
          setTimeout(() => setCopiedField(null), 2000)
        } else {
          throw new Error('execCommand failed')
        }
      } catch (err) {
        console.error('Fallback copy failed:', err)
        // Last resort: show text in prompt
        prompt('Ma\'lumotni nusxalash uchun quyidagi matnni tanlang va Ctrl+C bosing:', text)
        toast.error('Avtomatik nusxalash ishlamadi. Matn tanlandi.')
      } finally {
        document.body.removeChild(textArea)
      }
    } catch (error) {
      console.error('Failed to copy:', error)
      // Show text in prompt as last resort
      prompt('Ma\'lumotni nusxalash uchun quyidagi matnni tanlang va Ctrl+C bosing:', text)
      toast.error('Nusxalashda xatolik. Matn tanlandi.')
    }
  }

  const loadUserSessions = async (showLoading = true) => {
    if (showLoading) {
      setSessionsLoading(true)
    }
    setSessionsError(null)
    
    try {
      const data = await adminsAPI.getSessions()
      if (Array.isArray(data)) {
        setUserSessions(data)
        setSessionsError(null)
      } else {
        setUserSessions([])
        setSessionsError(null)
      }
    } catch (error) {
      console.error('Error loading user sessions:', error)
      
      // Check if it's a 404 or table doesn't exist
      if (error.response?.status === 404) {
        setSessionsError(translations.sessionsTableNotExists)
        setUserSessions([])
      } else if (error.response?.status === 500) {
        // Server error - might be table doesn't exist
        const errorMessage = error.response?.data?.error || error.message
        if (errorMessage?.includes('does not exist') || errorMessage?.includes('42P01')) {
          setSessionsError(translations.sessionsTableNotExists)
        } else {
          setSessionsError(translations.sessionsError)
        }
        setUserSessions([])
      } else {
        // Other errors
        setSessionsError(translations.sessionsError)
        setUserSessions([])
      }
    } finally {
      if (showLoading) {
        setSessionsLoading(false)
      }
    }
  }

  const getSensorStatus = (tree) => {
    const now = new Date()
    const lastSeen = tree.last_seen_at ? new Date(tree.last_seen_at) : null
    const isOnline = lastSeen && (now - lastSeen) < 30000 // 30 seconds
    
    return {
      isOnline,
      lastSeen,
      hasTelemetry: !!tree.last_telemetry,
      temp: tree.last_telemetry?.temp_c,
      humidity: tree.last_telemetry?.humidity_pct,
      mq2: tree.last_telemetry?.mq2,
      status: tree.last_status || 'unknown'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-2">Yuklanmoqda...</div>
          <div className="text-sm text-gray-500">Ma'lumotlar yuklanmoqda</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 text-lg"
            >
              ← Orqaga
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{translations.title}</h1>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            {translations.addAdmin}
          </button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{translations.statistics}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                <div className="text-sm text-gray-600 mb-1">{translations.totalAdmins}</div>
                <div className="text-2xl font-bold text-gray-900">{stats.admins}</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                <div className="text-sm text-gray-600 mb-1">{translations.totalTrees}</div>
                <div className="text-2xl font-bold text-gray-900">{stats.trees}</div>
                <div className="text-xs text-green-600 mt-1">{stats.onlineTrees} onlayn</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
                <div className="text-sm text-gray-600 mb-1">{translations.totalTelemetry}</div>
                <div className="text-2xl font-bold text-gray-900">{stats.telemetry.toLocaleString()}</div>
                <div className="text-xs text-purple-600 mt-1">{stats.recentTelemetry} (24h)</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
                <div className="text-sm text-gray-600 mb-1">{translations.totalAlerts}</div>
                <div className="text-2xl font-bold text-gray-900">{stats.alerts}</div>
                <div className="text-xs text-red-600 mt-1">{stats.unacknowledgedAlerts} tasdiqlanmagan</div>
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            {translations.settings}
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translations.ppmThreshold}
              </label>
              <p className="text-xs text-gray-500 mb-3">{translations.ppmThresholdDesc}</p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={ppmThresholdInput}
                  onChange={(e) => {
                    const value = e.target.value
                    // Allow empty string, numbers, and backspace/delete
                    if (value === '' || /^\d+$/.test(value)) {
                      setPpmThresholdInput(value)
                    }
                  }}
                  onBlur={(e) => {
                    // If empty on blur, restore current value
                    if (e.target.value === '' || e.target.value.trim() === '') {
                      setPpmThresholdInput(String(ppmThreshold))
                    } else {
                      // Validate and update
                      const numValue = parseInt(e.target.value)
                      if (!isNaN(numValue) && numValue >= 0 && numValue <= 10000) {
                        setPpmThresholdInput(String(numValue))
                      } else {
                        // Invalid, restore current value
                        setPpmThresholdInput(String(ppmThreshold))
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    // Allow: backspace, delete, tab, escape, enter, and numbers
                    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                      (e.keyCode === 65 && e.ctrlKey === true) ||
                      (e.keyCode === 67 && e.ctrlKey === true) ||
                      (e.keyCode === 86 && e.ctrlKey === true) ||
                      (e.keyCode === 88 && e.ctrlKey === true) ||
                      // Allow: home, end, left, right
                      (e.keyCode >= 35 && e.keyCode <= 39)) {
                      return
                    }
                    // Ensure that it is a number and stop the keypress
                    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                      e.preventDefault()
                    }
                  }}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="400"
                />
                <span className="text-gray-600">PPM</span>
                <button
                  onClick={handleSavePpmThreshold}
                  disabled={ppmThresholdInput === '' || ppmThresholdInput.trim() === '' || isNaN(parseInt(ppmThresholdInput)) || parseInt(ppmThresholdInput) < 0 || parseInt(ppmThresholdInput) > 10000}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {translations.save}
                </button>
              </div>
              {settings?.ppm_threshold && (
                <p className="text-xs text-gray-500 mt-2">
                  Joriy qiymat: {settings.ppm_threshold.value} PPM
                  {settings.ppm_threshold.updated_at && (
                    <span className="ml-2">
                      (Yangilangan: {format(new Date(settings.ppm_threshold.updated_at), 'dd.MM.yyyy HH:mm')})
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ESP8266 Configuration */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📡</span>
            {translations.esp8266Config}
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            {esp8266Config ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {translations.backendUrl}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={esp8266Config.backend_url}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(esp8266Config.backend_url, 'backend_url')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      {copiedField === 'backend_url' ? '✓' : '📋'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {translations.apiKey}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={esp8266Config.api_key_preview || esp8266Config.api_key || 'Not available'}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(esp8266Config.api_key, 'api_key')}
                      disabled={!esp8266Config.api_key || esp8266Config.api_key === 'Not available'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {copiedField === 'api_key' ? '✓' : '📋'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Header nomi: {esp8266Config.header_name || 'X-API-Key'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {translations.telemetryEndpoint}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={esp8266Config.telemetry_endpoint}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(esp8266Config.telemetry_endpoint, 'telemetry_endpoint')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      {copiedField === 'telemetry_endpoint' ? '✓' : '📋'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                {translations.loading}
              </div>
            )}
          </div>
        </div>

        {/* User Sessions */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">👥</span>
              {translations.userSessions}
            </h2>
            <button
              onClick={() => loadUserSessions(true)}
              disabled={sessionsLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sessionsLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  {translations.loading}
                </>
              ) : (
                <>
                  <span>🔄</span>
                  {translations.refreshSessions}
                </>
              )}
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {sessionsError ? (
              <div className="p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-600 text-xl">⚠️</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800 mb-1">
                        {sessionsError}
                      </p>
                      <p className="text-xs text-yellow-700">
                        Migration ishga tushirish uchun: <code className="bg-yellow-100 px-2 py-1 rounded">npm run migrate</code>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : sessionsLoading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin text-2xl mb-2">⏳</div>
                {translations.loading}
              </div>
            ) : userSessions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">👥</div>
                <p className="text-sm">{translations.noSessions}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Login qilingan foydalanuvchilar sessiyalari shu yerda ko'rinadi
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.username}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.ipAddress}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.deviceInfo}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.loginTime}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.lastActivity}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {session.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {session.ip_address || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {session.user_agent ? (
                            <span className="text-xs" title={session.user_agent}>
                              {session.user_agent.length > 50 
                                ? `${session.user_agent.substring(0, 50)}...` 
                                : session.user_agent}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.login_time 
                            ? format(new Date(session.login_time), 'dd.MM.yyyy HH:mm:ss')
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.last_activity 
                            ? format(new Date(session.last_activity), 'dd.MM.yyyy HH:mm:ss')
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Active Sensors */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔌</span>
            {translations.activeSensors}
          </h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {trees.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {translations.noActiveSensors}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.treeId}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.sensorStatus}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.temperature}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.humidity}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.smoke}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.motion}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.lastSeen}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trees.map((tree) => {
                      const sensorStatus = getSensorStatus(tree)
                      return (
                        <tr key={tree.id || tree.tree_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {tree.tree_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              sensorStatus.isOnline 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {sensorStatus.isOnline ? translations.online : translations.offline}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sensorStatus.temp !== null && sensorStatus.temp !== undefined 
                              ? `${sensorStatus.temp.toFixed(1)}°C` 
                              : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sensorStatus.humidity !== null && sensorStatus.humidity !== undefined 
                              ? `${sensorStatus.humidity.toFixed(1)}%` 
                              : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sensorStatus.mq2 !== null && sensorStatus.mq2 !== undefined 
                              ? `${sensorStatus.mq2.toFixed(0)} PPM` 
                              : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sensorStatus.status === 'cut_detected' ? '⚠️' : sensorStatus.status === 'normal' ? '✓' : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sensorStatus.lastSeen 
                              ? format(new Date(sensorStatus.lastSeen), 'dd.MM.yyyy HH:mm:ss')
                              : '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Admins List */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{translations.adminsList}</h2>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {translations.username}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {translations.createdAt}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {translations.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    {translations.noAdmins}
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {admin.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {admin.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(admin.created_at), 'dd.MM.yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {translations.edit}
                        </button>
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {translations.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {editingAdmin ? 'Adminni Tahrirlash' : translations.addAdmin}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translations.username}
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translations.password}
                  {editingAdmin && <span className="text-gray-500 text-xs ml-2">(ixtiyoriy)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingAdmin}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              {(!editingAdmin || formData.password) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {translations.confirmPassword}
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required={!editingAdmin || formData.password}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  {editingAdmin ? translations.update : translations.create}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  {translations.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


