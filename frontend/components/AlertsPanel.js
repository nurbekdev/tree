'use client'

import { useState } from 'react'
import { alertsAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const translations = {
  title: "Ogohlantirishlar",
  acknowledge: "Tasdiqlash",
  noAlerts: "Ogohlantirishlar yo'q",
  type: "Turi",
  message: "Xabar",
  createdAt: "Yaratilgan vaqt",
  smoke: "Tutun",
  cut: "Kesilgan",
  tilt: "Og'ish",
  tree: "Daraxt",
  high: "Yuqori",
  medium: "O'rtacha",
  low: "Past",
  acknowledged: "Tasdiqlangan",
  acknowledgedBy: "Tasdiqlangan:",
  acknowledgedAt: "Tasdiqlangan vaqt:",
  unacknowledged: "Tasdiqlanmagan",
  reason: "Sabab:",
  showMore: "Ko'proq ko'rish",
  showLess: "Kamroq ko'rsatish",
  collapse: "Yig'ish",
  expand: "Kengaytirish",
}

export default function AlertsPanel({ alerts, onAcknowledge }) {
  const [showAllUnacknowledged, setShowAllUnacknowledged] = useState(false)
  const [showAllAcknowledged, setShowAllAcknowledged] = useState(false)
  const [collapsedAcknowledged, setCollapsedAcknowledged] = useState(true)
  const handleAcknowledge = async (alertId) => {
    try {
      await alertsAPI.acknowledge(alertId)
      toast.success('Ogohlantirish tasdiqlandi')
      onAcknowledge()
    } catch (error) {
      toast.error('Tasdiqlashda xatolik')
    }
  }

  // Separate acknowledged and unacknowledged alerts
  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged)
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged)
  
  // Limit displayed alerts
  const MAX_UNACKNOWLEDGED = 5
  const MAX_ACKNOWLEDGED = 3
  const displayedUnacknowledged = showAllUnacknowledged 
    ? unacknowledgedAlerts 
    : unacknowledgedAlerts.slice(0, MAX_UNACKNOWLEDGED)
  const displayedAcknowledged = showAllAcknowledged || !collapsedAcknowledged
    ? acknowledgedAlerts 
    : acknowledgedAlerts.slice(0, MAX_ACKNOWLEDGED)

  // Get alert reason/description based on type
  const getAlertReason = (alert) => {
    const reasons = {
      smoke: "MQ-2 tutun sensori yuqori tutun miqdorini aniqlandi. Bu yong'in xavfini ko'rsatishi mumkin.",
      cut: "MPU6050 akselerometr to'satdan harakat o'zgarishini aniqlandi. Bu daraxtning kesilishi yoki qulashi xavfini ko'rsatishi mumkin.",
      tilt: "MPU6050 giroskop daraxtning og'ilishini aniqlandi. Bu daraxtning qulashi xavfini ko'rsatishi mumkin.",
    }
    return reasons[alert.type] || "Sensor ma'lumotlari asosida aniqlandi."
  }

  const getTypeLabel = (type) => {
    const labels = {
      smoke: translations.smoke,
      cut: translations.cut,
      tilt: translations.tilt,
    }
    return labels[type] || type
  }

  const getTypeIcon = (type) => {
    const icons = {
      smoke: '🔥',
      cut: '🪓',
      tilt: '⚠️',
    }
    return icons[type] || '⚠️'
  }

  const getLevelColor = (level) => {
    const colors = {
      high: 'from-red-500 to-red-600',
      medium: 'from-yellow-500 to-yellow-600',
      low: 'from-blue-500 to-blue-600',
    }
    return colors[level] || 'from-gray-500 to-gray-600'
  }

  const getLevelLabel = (level) => {
    const labels = {
      high: translations.high,
      medium: translations.medium,
      low: translations.low,
    }
    return labels[level] || level
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sticky top-0 bg-white/95 backdrop-blur-sm py-2 z-10">
        <span className="text-2xl sm:text-3xl">⚠️</span>
        {translations.title}
        {unacknowledgedAlerts.length > 0 && (
          <span className="ml-auto px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
            {unacknowledgedAlerts.length}
          </span>
        )}
      </h2>

      {alerts.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-4">✅</div>
          <p className="text-gray-500 text-base sm:text-lg font-medium">{translations.noAlerts}</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">Barcha ogohlantirishlar hal qilingan</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Unacknowledged Alerts Section */}
          {unacknowledgedAlerts.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <span className="text-xl sm:text-2xl">⚠️</span>
                {translations.unacknowledged}
                <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {unacknowledgedAlerts.length}
                </span>
              </h3>
              <div className="space-y-3 sm:space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {/* Show smoke alerts first (priority) */}
                {displayedUnacknowledged
                  .filter(alert => alert.type === 'smoke')
                  .map((alert) => (
              <div
                key={alert.id}
                className="border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 transform transition-all duration-200 hover:scale-[1.01] hover:shadow-lg bg-gradient-to-br from-red-50 via-orange-50 to-red-50 border-red-400 relative overflow-hidden animate-pulse"
                style={{ animationDuration: '2s' }}
              >
                {/* Fire effect overlay for smoke alerts */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-5xl opacity-20 animate-bounce" style={{ animationDuration: '1s' }}>
                    🔥
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-4xl opacity-15 animate-pulse">
                    🔥
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl sm:text-4xl p-1.5 sm:p-2 rounded-lg bg-red-200 animate-pulse flex-shrink-0">
                        🔥
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <h3 className="font-bold text-base sm:text-lg text-red-900">
                            {translations.tree} #{alert.tree_id}
                          </h3>
                          <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg animate-pulse whitespace-nowrap">
                            🔥 YONG'IN!
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-red-700 mb-1">
                          {getTypeLabel(alert.type)}
                        </p>
                        <p className="text-xs sm:text-sm text-red-800 leading-relaxed font-medium mb-1.5 sm:mb-2 line-clamp-2">
                          {alert.message}
                        </p>
                        <div className="mt-1.5 sm:mt-2 p-1.5 sm:p-2 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-xs font-semibold text-red-700 mb-0.5">{translations.reason}</p>
                          <p className="text-xs text-red-600 leading-relaxed line-clamp-2">
                            {getAlertReason(alert)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 sm:pt-3 border-t border-red-300">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-xs text-red-600">🕐</span>
                      <p className="text-xs font-medium text-red-700">
                        {format(new Date(alert.created_at), 'dd.MM.yyyy HH:mm')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-xs sm:text-sm font-medium rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      ✓ {translations.acknowledge}
                    </button>
                  </div>
                </div>
              </div>
            ))}
                
                {/* Show other unacknowledged alerts */}
                {displayedUnacknowledged
                  .filter(alert => alert.type !== 'smoke')
                  .map((alert) => (
              <div
                key={alert.id}
                className={`border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 transform transition-all duration-200 hover:scale-[1.01] hover:shadow-lg ${
                  alert.type === 'cut'
                    ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
                    : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                }`}
              >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className={`text-2xl sm:text-3xl p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                    alert.type === 'smoke' ? 'bg-red-200' : alert.type === 'cut' ? 'bg-gray-200' : 'bg-yellow-200'
                  }`}>
                    {getTypeIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <h3 className="font-bold text-sm sm:text-base text-gray-900">
                        {translations.tree} #{alert.tree_id}
                      </h3>
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getLevelColor(alert.level)} text-white shadow-sm whitespace-nowrap`}>
                        {getLevelLabel(alert.level)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      {getTypeLabel(alert.type)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-1.5 sm:mb-2 line-clamp-2">
                      {alert.message}
                    </p>
                    <div className="mt-1.5 sm:mt-2 p-1.5 sm:p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-0.5">{translations.reason}</p>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                        {getAlertReason(alert)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 sm:pt-3 border-t border-gray-200">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xs text-gray-500">🕐</span>
                  <p className="text-xs font-medium text-gray-600">
                    {format(new Date(alert.created_at), 'dd.MM.yyyy HH:mm')}
                  </p>
                </div>
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-xs sm:text-sm font-medium rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  ✓ {translations.acknowledge}
                </button>
              </div>
            </div>
          ))}
              </div>
              
              {/* Show More/Less button for unacknowledged alerts */}
              {unacknowledgedAlerts.length > MAX_UNACKNOWLEDGED && (
                <button
                  onClick={() => setShowAllUnacknowledged(!showAllUnacknowledged)}
                  className="w-full mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  {showAllUnacknowledged ? `↑ ${translations.showLess}` : `↓ ${translations.showMore} (${unacknowledgedAlerts.length - MAX_UNACKNOWLEDGED} ta)`}
                </button>
              )}
            </div>
          )}

          {/* Acknowledged Alerts Section */}
          {acknowledgedAlerts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">✓</span>
                  {translations.acknowledged}
                  <span className="px-2 py-0.5 bg-gray-500 text-white text-xs font-bold rounded-full">
                    {acknowledgedAlerts.length}
                  </span>
                </h3>
                <button
                  onClick={() => setCollapsedAcknowledged(!collapsedAcknowledged)}
                  className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                >
                  {collapsedAcknowledged ? translations.expand : translations.collapse}
                </button>
              </div>
              <div className={`space-y-3 sm:space-y-4 ${collapsedAcknowledged ? 'max-h-[400px] overflow-y-auto' : ''} pr-2`}>
                {displayedAcknowledged.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 transform transition-all duration-200 hover:scale-[1.01] ${
                      alert.type === 'smoke'
                        ? 'bg-gradient-to-br from-red-50/50 to-orange-50/50 border-red-200'
                        : alert.type === 'cut'
                        ? 'bg-gradient-to-br from-gray-50/50 to-gray-100/50 border-gray-200'
                        : 'bg-gradient-to-br from-yellow-50/50 to-orange-50/50 border-yellow-200'
                    } opacity-75`}
                  >
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className={`text-2xl sm:text-3xl p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                          alert.type === 'smoke' ? 'bg-red-100' : alert.type === 'cut' ? 'bg-gray-100' : 'bg-yellow-100'
                        }`}>
                          {getTypeIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <h3 className="font-bold text-sm sm:text-base text-gray-700">
                              {translations.tree} #{alert.tree_id}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-200 to-green-300 text-green-800 whitespace-nowrap">
                              ✓ {translations.acknowledged}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                            {getTypeLabel(alert.type)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-1.5 sm:mb-2 line-clamp-2">
                            {alert.message}
                          </p>
                          <div className="mt-1.5 sm:mt-2 p-1.5 sm:p-2 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-0.5">{translations.reason}</p>
                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                              {getAlertReason(alert)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 pt-2 sm:pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs text-gray-500">🕐</span>
                        <p className="text-xs font-medium text-gray-600">
                          {format(new Date(alert.created_at), 'dd.MM.yyyy HH:mm')}
                        </p>
                      </div>
                      {alert.ack_at && (
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-xs text-green-600">✓</span>
                          <p className="text-xs font-medium text-green-700">
                            {translations.acknowledgedBy} {alert.ack_by_username || 'Noma\'lum'} • {format(new Date(alert.ack_at), 'dd.MM.yyyy HH:mm')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Show More/Less button for acknowledged alerts */}
              {acknowledgedAlerts.length > MAX_ACKNOWLEDGED && !collapsedAcknowledged && (
                <button
                  onClick={() => setShowAllAcknowledged(!showAllAcknowledged)}
                  className="w-full mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  {showAllAcknowledged ? `↑ ${translations.showLess}` : `↓ ${translations.showMore} (${acknowledgedAlerts.length - MAX_ACKNOWLEDGED} ta)`}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

