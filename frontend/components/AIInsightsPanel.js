'use client'

import { useMemo } from 'react'
import { calculateTreeHealthspan, getHealthspanStatusColors } from '@/lib/treeHealthspanAI'
import { FiTrendingUp, FiTrendingDown, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'

export default function AIInsightsPanel({ tree, lastTelemetry, telemetryHistory = [] }) {
  const healthspanData = useMemo(() => {
    return calculateTreeHealthspan(tree, lastTelemetry, telemetryHistory)
  }, [tree, lastTelemetry, telemetryHistory])

  if (!healthspanData.biologicalAge) {
    return null
  }

  const colors = getHealthspanStatusColors(healthspanData.status)

  // Recommendations based on status
  const getRecommendations = () => {
    switch (healthspanData.status) {
      case 'thriving':
        return [
          { icon: FiCheckCircle, text: 'Daraxt yaxshi rivojlanmoqda', color: 'text-green-600 dark:text-green-400' },
          { icon: FiTrendingUp, text: 'Optimal sharoitlar saqlansin', color: 'text-green-600 dark:text-green-400' }
        ]
      case 'normal':
        return [
          { icon: FiCheckCircle, text: 'Daraxt normal holatda', color: 'text-yellow-600 dark:text-yellow-400' },
          { icon: FiTrendingUp, text: 'Monitoring davom etsin', color: 'text-yellow-600 dark:text-yellow-400' }
        ]
      case 'stressed':
        return [
          { icon: FiAlertCircle, text: 'SHOSHAYOTIR E\'TIBOR KERAK!', color: 'text-red-600 dark:text-red-400' },
          { icon: FiTrendingDown, text: 'Atrof-muhit omillarini yaxshilash kerak', color: 'text-red-600 dark:text-red-400' },
          { icon: FiAlertCircle, text: 'Mutaxassislar bilan bog\'laning', color: 'text-red-600 dark:text-red-400' }
        ]
      default:
        return []
    }
  }

  const recommendations = getRecommendations()

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border ${colors.border} shadow-sm transition-colors`}>
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span className="text-lg sm:text-xl">🤖</span>
          AI Tahlil va Tavsiyalar
        </h3>
      </div>
      <div className="p-4 sm:p-5">
        {/* Healthspan Summary */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">Biologik yoshi:</span>
            <span className={`text-lg font-bold ${colors.text}`}>
              {healthspanData.biologicalAge.toFixed(1)} yil
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">Daraxt yoshi:</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {healthspanData.chronologicalAge.toFixed(1)} yil
            </span>
          </div>
          {Math.abs(healthspanData.ageDifference) > 0.1 && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <span className={`text-xs font-semibold ${
                healthspanData.ageDifference > 0 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {healthspanData.ageDifference > 0 ? '+' : ''}{healthspanData.ageDifference.toFixed(1)} yil farq
                {' '}({healthspanData.totalMonthsAdjustment > 0 ? '+' : ''}{healthspanData.totalMonthsAdjustment} oy)
              </span>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Tavsiyalar:</h4>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => {
                const Icon = rec.icon
                return (
                  <li key={index} className={`text-xs sm:text-sm ${rec.color} flex items-start gap-2`}>
                    <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{rec.text}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Confidence Score */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">Ishonchlilik:</span>
            <span className={`text-sm font-semibold ${colors.text}`}>
              {healthspanData.confidence}%
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${colors.bg.replace('bg-', 'bg-').replace('/20', '')} rounded-full transition-all`}
              style={{ width: `${healthspanData.confidence}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}

