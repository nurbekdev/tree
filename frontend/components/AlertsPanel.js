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
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          {translations.title}
        </h2>
        {unacknowledgedAlerts.length > 0 && (
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full">
            {unacknowledgedAlerts.length}
          </span>
        )}
      </div>
      <div className="p-4 sm:p-6">

      {alerts.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl sm:text-2xl">✅</span>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{translations.noAlerts}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Barcha ogohlantirishlar hal qilingan</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {/* Unacknowledged Alerts Section */}
          {unacknowledgedAlerts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  {translations.unacknowledged}
                </h3>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                  {unacknowledgedAlerts.length}
                </span>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {/* Show smoke alerts first (priority) */}
                {displayedUnacknowledged
                  .filter(alert => alert.type === 'smoke')
                  .map((alert) => (
              <div
                key={alert.id}
                className="border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 relative overflow-hidden transition-colors"
              >
                <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg sm:text-xl">🔥</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {translations.tree} #{alert.tree_id}
                      </h3>
                      <span className="px-1.5 sm:px-2 py-0.5 bg-red-600 dark:bg-red-700 text-white text-xs font-semibold rounded">
                        YONG'IN
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                      {alert.message}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-red-200 dark:border-red-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(alert.created_at), 'dd.MM.yyyy HH:mm')}
                  </p>
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 rounded-lg transition-colors"
                  >
                    {translations.acknowledge}
                  </button>
                </div>
              </div>
            ))}
                
                {/* Show other unacknowledged alerts */}
                {displayedUnacknowledged
                  .filter(alert => alert.type !== 'smoke')
                  .map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-3 sm:p-4 transition-colors ${
                  alert.type === 'cut'
                    ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}
              >
                <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    alert.type === 'cut' 
                      ? 'bg-gray-100 dark:bg-gray-600' 
                      : 'bg-yellow-100 dark:bg-yellow-900/40'
                  }`}>
                    <span className="text-lg sm:text-xl">{getTypeIcon(alert.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {translations.tree} #{alert.tree_id}
                      </h3>
                      <span className={`px-1.5 sm:px-2 py-0.5 text-xs font-semibold rounded ${
                        alert.level === 'high' 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        alert.level === 'medium' 
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}>
                        {getLevelLabel(alert.level)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{getTypeLabel(alert.type)}</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                      {alert.message}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(alert.created_at), 'dd.MM.yyyy HH:mm')}
                  </p>
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 rounded-lg transition-colors"
                  >
                    {translations.acknowledge}
                  </button>
                </div>
              </div>
          ))}
              </div>
              
              {/* Show More/Less button for unacknowledged alerts */}
              {unacknowledgedAlerts.length > MAX_UNACKNOWLEDGED && (
                <button
                  onClick={() => setShowAllUnacknowledged(!showAllUnacknowledged)}
                  className="w-full mt-3 px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {showAllUnacknowledged ? `↑ ${translations.showLess}` : `↓ ${translations.showMore} (${unacknowledgedAlerts.length - MAX_UNACKNOWLEDGED} ta)`}
                </button>
              )}
            </div>
          )}

          {/* Acknowledged Alerts Section - Optimized with max-height to prevent pushing content down */}
          {acknowledgedAlerts.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {translations.acknowledged}
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full">
                    {acknowledgedAlerts.length}
                  </span>
                </h3>
                <button
                  onClick={() => setCollapsedAcknowledged(!collapsedAcknowledged)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {collapsedAcknowledged ? translations.expand : translations.collapse}
                </button>
              </div>
              {!collapsedAcknowledged && (
                <div className="space-y-2 sm:space-y-3 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-1">
                  {displayedAcknowledged.map((alert) => (
                    <div
                      key={alert.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start gap-2 sm:gap-3 mb-2">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-lg sm:text-xl">{getTypeIcon(alert.type)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                              {translations.tree} #{alert.tree_id}
                            </h3>
                            <span className="px-1.5 sm:px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded">
                              ✓ {translations.acknowledged}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {format(new Date(alert.created_at), 'dd.MM.yyyy HH:mm')}
                        </p>
                        {alert.ack_at && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ✓ {alert.ack_by_username || 'Noma\'lum'} • {format(new Date(alert.ack_at), 'dd.MM.yyyy HH:mm')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  )
}

