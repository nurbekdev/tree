'use client'

import { useMemo } from 'react'
import { calculateTreeHealthspan, getHealthspanStatusColors } from '@/lib/treeHealthspanAI'

export default function TreeAgeScore({ tree, lastTelemetry, telemetryHistory = [] }) {
  const healthspanData = useMemo(() => {
    return calculateTreeHealthspan(tree, lastTelemetry, telemetryHistory)
  }, [tree, lastTelemetry, telemetryHistory])

  if (!healthspanData.biologicalAge) {
    return (
      <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">{healthspanData.statusLabel || 'Ma\'lumot yetarli emas'}</p>
      </div>
    )
  }

  const colors = getHealthspanStatusColors(healthspanData.status)
  
  // Animation classes based on status
  const animationClass = 
    healthspanData.status === 'stressed' ? 'animate-pulse-glow-red' :
    healthspanData.status === 'thriving' ? 'animate-pulse-glow-green animate-breathe' :
    'animate-pulse-glow-yellow'

  const ringAnimationClass = 
    healthspanData.status === 'stressed' ? 'animate-rotate-ring' :
    healthspanData.status === 'thriving' ? 'animate-rotate-ring' : ''

  // Format biological age display
  const biologicalAgeDisplay = healthspanData.biologicalAge.toFixed(1)
  const chronologicalAgeDisplay = healthspanData.chronologicalAge.toFixed(1)
  const ageDifference = healthspanData.ageDifference

  return (
    <div className={`relative ${colors.bg} ${colors.border} border-2 rounded-xl p-4 sm:p-6 transition-all`}>
      {/* Rotating ring for stressed/thriving status */}
      {(healthspanData.status === 'stressed' || healthspanData.status === 'thriving') && (
        <div className={`absolute inset-0 rounded-xl ${ringAnimationClass}`}>
          <div className={`absolute inset-0 rounded-xl border-2 ${colors.border} opacity-30`}></div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10">
        {/* Status label - Compact */}
        <div className="text-center mb-3">
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
            {healthspanData.statusLabel}
          </span>
        </div>

        {/* Biological Age - Compact WHOOP-style Display (Dashboard-style) */}
        <div className="text-center mb-4">
          <div className={`relative inline-flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full ${animationClass} overflow-hidden`}>
            {/* WHOOP-style gradient background - NO starry pattern to keep numbers clear */}
            <div className={`absolute inset-0 rounded-full ${
              healthspanData.status === 'stressed' 
                ? 'bg-gradient-to-br from-red-600 via-red-500 to-orange-500' 
                : healthspanData.status === 'thriving'
                ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500'
                : 'bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-400'
            }`}></div>
            
            {/* Subtle animated ring for stressed/thriving */}
            {(healthspanData.status === 'stressed' || healthspanData.status === 'thriving') && (
              <div className={`absolute inset-0 rounded-full border-2 ${
                healthspanData.status === 'stressed' 
                  ? 'border-red-300/50' 
                  : 'border-emerald-300/50'
              } ${ringAnimationClass} opacity-60`}></div>
            )}
            
            {/* Main content - High contrast for readability */}
            <div className="relative z-20 text-center">
              <span className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg block leading-none">
                {biologicalAgeDisplay}
              </span>
              <span className="text-[10px] sm:text-xs text-white/95 drop-shadow-md block mt-0.5 font-semibold">
                Biologik
              </span>
            </div>
            
            {/* Subtle glow effect - behind content */}
            <div className={`absolute inset-0 rounded-full ${
              healthspanData.status === 'stressed' 
                ? 'bg-red-400/30' 
                : healthspanData.status === 'thriving'
                ? 'bg-emerald-400/30'
                : 'bg-amber-400/30'
            } blur-xl opacity-50 -z-10`}></div>
          </div>
          
          {/* Secondary info below circle */}
          <div className="mt-2 space-y-0.5">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {chronologicalAgeDisplay} yil (daraxt yoshi)
            </p>
            {Math.abs(ageDifference) > 0.1 && (
              <p className={`text-xs font-semibold ${
                ageDifference > 0 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {ageDifference > 0 ? '+' : ''}{ageDifference.toFixed(1)} yil farq
              </p>
            )}
          </div>
        </div>

        {/* Quick adjustment summary - Compact */}
        {healthspanData.totalMonthsAdjustment !== 0 && (
          <div className="mt-2 text-center">
            <p className={`text-xs font-medium ${colors.text}`}>
              {healthspanData.totalMonthsAdjustment > 0 ? '+' : ''}
              {Math.abs(healthspanData.totalMonthsAdjustment)} oy 
              {healthspanData.totalMonthsAdjustment > 0 ? ' qo\'shildi' : ' ayirildi'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

