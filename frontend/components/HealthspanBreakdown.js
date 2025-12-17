'use client'

import { useMemo } from 'react'
import { calculateTreeHealthspan, getHealthspanStatusColors } from '@/lib/treeHealthspanAI'
import { FiTrendingUp, FiTrendingDown, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'

export default function HealthspanBreakdown({ tree, lastTelemetry, telemetryHistory = [] }) {
  const healthspanData = useMemo(() => {
    return calculateTreeHealthspan(tree, lastTelemetry, telemetryHistory)
  }, [tree, lastTelemetry, telemetryHistory])

  if (!healthspanData.biologicalAge || !healthspanData.adjustments || healthspanData.adjustments.length === 0) {
    return null
  }

  const colors = getHealthspanStatusColors(healthspanData.status)

  // Separate stress and optimal adjustments
  const stressAdjustments = healthspanData.adjustments.filter(a => a.type === 'stress')
  const optimalAdjustments = healthspanData.adjustments.filter(a => a.type === 'optimal')

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border ${colors.border} shadow-sm transition-colors`}>
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span className="text-lg sm:text-xl">📊</span>
          Atrof-muhit Ta'siri Tahlili
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Biologik yoshni hisoblashda qo'llanilgan o'zgarishlar
        </p>
      </div>
      
      <div className="p-4 sm:p-5 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
            <div className="flex items-center gap-2 mb-1">
              <FiTrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-xs font-semibold text-red-700 dark:text-red-400">Stress omillari</span>
            </div>
            <p className="text-lg font-bold text-red-700 dark:text-red-400">
              +{stressAdjustments.reduce((sum, a) => sum + a.months, 0)} oy
            </p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-2 mb-1">
              <FiTrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-400">Optimal sharoit</span>
            </div>
            <p className="text-lg font-bold text-green-700 dark:text-green-400">
              {optimalAdjustments.reduce((sum, a) => sum + a.months, 0)} oy
            </p>
          </div>
        </div>

        {/* Detailed Adjustments */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Batafsil tahlil:</h4>
          <div className="space-y-2">
            {healthspanData.adjustments.map((adjustment, index) => {
              const isStress = adjustment.type === 'stress'
              const Icon = isStress ? FiAlertCircle : FiCheckCircle
              
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    isStress
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                      : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Icon 
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        isStress 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-semibold ${
                          isStress 
                            ? 'text-red-700 dark:text-red-400' 
                            : 'text-green-700 dark:text-green-400'
                        }`}>
                          {adjustment.impact}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {adjustment.factor}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {adjustment.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Formula Explanation */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">Hisoblash formulasi:</p>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <p className="text-xs text-gray-700 dark:text-gray-300 font-mono">
              Biologik Yoshi = Daraxt Yoshi ({healthspanData.chronologicalAge} yil)
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300 font-mono mt-1">
              {healthspanData.totalMonthsAdjustment > 0 ? '+' : ''}
              {healthspanData.totalMonthsAdjustment !== 0 ? `${(healthspanData.totalMonthsAdjustment / 12).toFixed(2)} yil` : '0 yil'} 
              {' '}({healthspanData.totalMonthsAdjustment > 0 ? '+' : ''}{healthspanData.totalMonthsAdjustment} oy)
            </p>
            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-2">
              = {healthspanData.biologicalAge.toFixed(1)} yil
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

