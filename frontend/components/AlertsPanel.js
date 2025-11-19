'use client'

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
}

export default function AlertsPanel({ alerts, onAcknowledge }) {
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
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="text-3xl">⚠️</span>
        {translations.title}
      </h2>

      {alerts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-gray-500 text-lg font-medium">{translations.noAlerts}</p>
          <p className="text-sm text-gray-400 mt-2">Barcha ogohlantirishlar hal qilingan</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Unacknowledged Alerts Section */}
          {unacknowledgedAlerts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                {translations.unacknowledged}
              </h3>
              <div className="space-y-4">
                {/* Show smoke alerts first (priority) */}
                {unacknowledgedAlerts
                  .filter(alert => alert.type === 'smoke')
                  .map((alert) => (
              <div
                key={alert.id}
                className="border-2 rounded-xl p-5 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br from-red-50 via-orange-50 to-red-50 border-red-400 relative overflow-hidden animate-pulse"
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
                      <div className="text-5xl p-2 rounded-lg bg-red-200 animate-pulse">
                        🔥
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-xl text-red-900">
                            {translations.tree} #{alert.tree_id}
                          </h3>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg animate-pulse">
                            🔥 YONG'IN XAVFI!
                          </span>
                        </div>
                        <p className="text-sm font-bold text-red-700 mb-1">
                          {getTypeLabel(alert.type)}
                        </p>
                        <p className="text-sm text-red-800 leading-relaxed font-medium mb-2">
                          {alert.message}
                        </p>
                        <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-xs font-semibold text-red-700 mb-1">{translations.reason}</p>
                          <p className="text-xs text-red-600 leading-relaxed">
                            {getAlertReason(alert)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-red-300">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600">🕐</span>
                      <p className="text-xs font-medium text-red-700">
                        {format(new Date(alert.created_at), 'dd.MM.yyyy HH:mm:ss')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      ✓ {translations.acknowledge}
                    </button>
                  </div>
                </div>
              </div>
            ))}
                
                {/* Show other unacknowledged alerts */}
                {unacknowledgedAlerts
                  .filter(alert => alert.type !== 'smoke')
                  .map((alert) => (
              <div
                key={alert.id}
                className={`border-2 rounded-xl p-5 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                  alert.type === 'cut'
                    ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
                    : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                }`}
              >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`text-4xl p-2 rounded-lg ${
                    alert.type === 'smoke' ? 'bg-red-200' : alert.type === 'cut' ? 'bg-gray-200' : 'bg-yellow-200'
                  }`}>
                    {getTypeIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg text-gray-900">
                        {translations.tree} #{alert.tree_id}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getLevelColor(alert.level)} text-white shadow-sm`}>
                        {getLevelLabel(alert.level)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {getTypeLabel(alert.type)}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed mb-2">
                      {alert.message}
                    </p>
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-1">{translations.reason}</p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {getAlertReason(alert)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">🕐</span>
                  <p className="text-xs font-medium text-gray-600">
                    {format(new Date(alert.created_at), 'dd.MM.yyyy HH:mm')}
                  </p>
                </div>
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  ✓ {translations.acknowledge}
                </button>
              </div>
            </div>
          ))}
              </div>
            </div>
          )}

          {/* Acknowledged Alerts Section */}
          {acknowledgedAlerts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">✓</span>
                {translations.acknowledged}
              </h3>
              <div className="space-y-4">
                {acknowledgedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border-2 rounded-xl p-5 transform transition-all duration-200 hover:scale-[1.01] ${
                      alert.type === 'smoke'
                        ? 'bg-gradient-to-br from-red-50/50 to-orange-50/50 border-red-200'
                        : alert.type === 'cut'
                        ? 'bg-gradient-to-br from-gray-50/50 to-gray-100/50 border-gray-200'
                        : 'bg-gradient-to-br from-yellow-50/50 to-orange-50/50 border-yellow-200'
                    } opacity-75`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`text-3xl p-2 rounded-lg ${
                          alert.type === 'smoke' ? 'bg-red-100' : alert.type === 'cut' ? 'bg-gray-100' : 'bg-yellow-100'
                        }`}>
                          {getTypeIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg text-gray-700">
                              {translations.tree} #{alert.tree_id}
                            </h3>
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-200 to-green-300 text-green-800">
                              ✓ {translations.acknowledged}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            {getTypeLabel(alert.type)}
                          </p>
                          <p className="text-sm text-gray-600 leading-relaxed mb-2">
                            {alert.message}
                          </p>
                          <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-1">{translations.reason}</p>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {getAlertReason(alert)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">🕐</span>
                          <p className="text-xs font-medium text-gray-600">
                            {format(new Date(alert.created_at), 'dd.MM.yyyy HH:mm')}
                          </p>
                        </div>
                        {alert.ack_at && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-600">✓</span>
                            <p className="text-xs font-medium text-green-700">
                              {translations.acknowledgedBy} {alert.ack_by_username || 'Noma\'lum'}
                            </p>
                          </div>
                        )}
                        {alert.ack_at && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-600">🕐</span>
                            <p className="text-xs font-medium text-green-700">
                              {format(new Date(alert.ack_at), 'dd.MM.yyyy HH:mm')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

