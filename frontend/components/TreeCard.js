'use client'

import { useState, useMemo, useEffect } from 'react'
import { format } from 'date-fns'
import { FiShare2, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import QRCodeModal from './QRCodeModal'
import { calculateTreeHealthspan, getHealthspanStatusColors } from '@/lib/treeHealthspanAI'
import { treesAPI } from '@/lib/api'

const translations = {
  treeId: "Daraxt ID",
  statusOk: "Yaxshi",
  statusAlert: "Ogohlantirish",
  statusOffline: "Offline",
  lastSeen: "Oxirgi ko'rilgan",
  viewDetails: "Batafsil",
  noData: "Ma'lumot yo'q",
  offline: "Offline",
  share: "Ulashish",
  linkCopied: "Link nusxa olindi!",
}

export default function TreeCard({ tree, onClick, onDelete, ppmThreshold = 400 }) {
  const [treeWithHistory, setTreeWithHistory] = useState(tree)
  
  // Load telemetry history if not present (for accurate healthspan calculation)
  useEffect(() => {
    // Only fetch if telemetry history is missing
    if (!tree.telemetry || !Array.isArray(tree.telemetry) || tree.telemetry.length === 0) {
      const loadTelemetryHistory = async () => {
        try {
          const treeId = tree.id || tree.tree_id
          const fullTreeData = await treesAPI.getById(treeId)
          if (fullTreeData && fullTreeData.telemetry && fullTreeData.telemetry.length > 0) {
            setTreeWithHistory(fullTreeData)
          }
        } catch (error) {
          console.warn('Failed to load telemetry history for tree card:', error)
          // Keep original tree data if fetch fails
        }
      }
      loadTelemetryHistory()
    } else {
      setTreeWithHistory(tree)
    }
  }, [tree.id, tree.tree_id, tree.telemetry])
  const [showQRModal, setShowQRModal] = useState(false)
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/tree/${tree.tree_id}`

  const handleShare = (e) => {
    e.stopPropagation() // Prevent triggering the card click
    setShowQRModal(true)
  }
  
  const fallbackCopyToClipboard = (text) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      toast.success(translations.linkCopied)
    } catch (err) {
      toast.error('Link nusxa olishda xatolik')
    }
    document.body.removeChild(textArea)
  }
  // Check if tree is offline (no data in last 30 seconds)
  // If data is 5-10 seconds old, still show it (grace period)
  // After 30 seconds, mark as offline
  const now = new Date()
  const lastSeenDate = tree.last_seen_at ? (() => {
    try {
      const date = new Date(tree.last_seen_at)
      // Validate timestamp - if it's invalid (1970 or earlier), return null
      if (date.getTime() < new Date('2000-01-01').getTime()) {
        return null
      }
      return date
    } catch (e) {
      return null
    }
  })() : null
  
  const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000)
  const tenSecondsAgo = new Date(now.getTime() - 10 * 1000)
  
  // Tree is offline if:
  // 1. No last_seen_at timestamp, OR
  // 2. Last seen was more than 30 seconds ago
  const isOffline = !lastSeenDate || (lastSeenDate < thirtySecondsAgo)
  
  // Show telemetry if:
  // 1. Has telemetry data, AND
  // 2. Either:
  //    - Tree is online (within 30 seconds), OR
  //    - Tree is within grace period (5-10 seconds) - show old data
  // This allows showing previous data for 5-10 seconds even if new data hasn't arrived yet
  // After 30 seconds, tree is marked offline and telemetry is hidden
  const shouldShowTelemetry = tree.last_telemetry && (
    !isOffline || (lastSeenDate && lastSeenDate > tenSecondsAgo)
  )
  
  // Check if PPM exceeds threshold
  const mq2Value = tree.last_telemetry?.mq2 ? Number(tree.last_telemetry.mq2) : 0
  const isPpmAlert = !isOffline && mq2Value > ppmThreshold
  const isAlert = (tree.last_status === 'alert' || isPpmAlert) && !isOffline
  
  // Status color: green (ok) -> yellow/orange (fire warning) -> red (critical)
  const statusColor = isOffline 
    ? 'bg-gray-400' 
    : isPpmAlert 
    ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500' 
    : isAlert 
    ? 'bg-red-500' 
    : 'bg-green-500'
    
  const statusText = isOffline 
    ? translations.statusOffline 
    : isPpmAlert 
    ? '🔥 YONG\'IN XAVFI!' 
    : isAlert 
    ? translations.statusAlert 
    : translations.statusOk

  // Calculate Tree Healthspan (Biological Age)
  // Use treeWithHistory which may have loaded telemetry history
  const healthspanData = useMemo(() => {
    const currentTree = treeWithHistory || tree
    const lastTelemetry = currentTree.last_telemetry
    const telemetryHistory = currentTree.telemetry || []
    
    // Use full calculation if we have telemetry history
    if (telemetryHistory.length > 0) {
      return calculateTreeHealthspan(currentTree, lastTelemetry, telemetryHistory)
    }
    
    // If no telemetry history, return chronological age only (no adjustments)
    const chronologicalAge = currentTree.planted_year 
      ? new Date().getFullYear() - parseInt(currentTree.planted_year)
      : null
    
    if (chronologicalAge === null) {
      return {
        chronologicalAge: null,
        biologicalAge: null,
        status: 'unknown',
        statusLabel: 'Ma\'lumot yo\'q'
      }
    }
    
    // Return chronological age as biological age (no adjustments possible without history)
    return {
      chronologicalAge,
      biologicalAge: chronologicalAge,
      biologicalAgeMonths: 0,
      totalMonthsAdjustment: 0,
      adjustments: [],
      status: 'neutral',
      statusLabel: 'Ma\'lumot yetarli emas',
      confidence: 0.3,
      ageDifference: 0
    }
  }, [treeWithHistory, tree, tree.planted_year, tree.last_telemetry, tree.telemetry])

  const ageColors = healthspanData.biologicalAge ? getHealthspanStatusColors(healthspanData.status) : null
  const ageAnimationClass = healthspanData.biologicalAge ? (
    healthspanData.status === 'stressed' ? 'animate-pulse-glow-red' :
    healthspanData.status === 'thriving' ? 'animate-pulse-glow-green animate-breathe' :
    'animate-pulse-glow-yellow'
  ) : ''
  
  const ringAnimationClass = healthspanData.biologicalAge ? (
    healthspanData.status === 'stressed' ? 'animate-rotate-ring' :
    healthspanData.status === 'thriving' ? 'animate-rotate-ring' : ''
  ) : ''

  // Get health status colors for card border/background
  const healthColors = healthspanData.biologicalAge && healthspanData.chronologicalAge 
    ? getHealthspanStatusColors(healthspanData.status)
    : null

  // Determine card styling based on healthspan status and alerts
  const getCardStyling = () => {
    if (isPpmAlert) {
      return 'border-orange-400 dark:border-orange-500 bg-orange-50/60 dark:bg-orange-900/30 shadow-orange-200/50 dark:shadow-orange-900/50'
    }
    if (isAlert) {
      return 'border-red-400 dark:border-red-500 bg-red-50/60 dark:bg-red-900/30 shadow-red-200/50 dark:shadow-red-900/50'
    }
    if (isOffline) {
      return 'border-gray-200 dark:border-gray-700'
    }
    // Use healthspan colors if available
    if (healthColors && healthspanData.status === 'stressed') {
      return 'border-red-300 dark:border-red-600 bg-red-50/40 dark:bg-red-900/20 shadow-red-100/30 dark:shadow-red-900/30'
    }
    if (healthColors && healthspanData.status === 'thriving') {
      return 'border-emerald-300 dark:border-emerald-600 bg-emerald-50/40 dark:bg-emerald-900/20 shadow-emerald-100/30 dark:shadow-emerald-900/30'
    }
    if (healthColors && healthspanData.status === 'neutral') {
      return 'border-amber-300 dark:border-amber-600 bg-amber-50/40 dark:bg-amber-900/20 shadow-amber-100/30 dark:shadow-amber-900/30'
    }
    return 'border-gray-200 dark:border-gray-700'
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md dark:hover:shadow-lg relative overflow-hidden ${getCardStyling()}`}
      onClick={onClick}
    >
      {/* Fire effect overlay when PPM exceeds threshold */}
      {isPpmAlert && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-red-500/20 via-orange-400/10 to-transparent animate-pulse"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-6xl opacity-30 animate-bounce" style={{ animationDuration: '1s' }}>
            🔥
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-4xl opacity-20 animate-pulse">
            🔥
          </div>
        </div>
      )}
      
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {tree.image_url ? (
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border flex-shrink-0 ${
                isOffline 
                  ? 'border-gray-200 dark:border-gray-600' 
                  : isPpmAlert 
                  ? 'border-orange-300 dark:border-orange-600' 
                  : isAlert 
                  ? 'border-red-200 dark:border-red-700' 
                  : 'border-green-200 dark:border-green-700'
              }`}>
                <img 
                  src={tree.image_url} 
                  alt={`Daraxt ${tree.tree_id}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = `<span class="text-lg sm:text-xl flex items-center justify-center w-full h-full">${isPpmAlert ? '🔥' : '🌳'}</span>`
                  }}
                />
              </div>
            ) : (
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isOffline 
                  ? 'bg-gray-100 dark:bg-gray-700' 
                  : isPpmAlert 
                  ? 'bg-orange-100 dark:bg-orange-900/30' 
                  : isAlert 
                  ? 'bg-red-100 dark:bg-red-900/30' 
                  : 'bg-green-100 dark:bg-green-900/30'
              }`}>
                <span className="text-lg sm:text-xl">
                  {isPpmAlert ? '🔥' : '🌳'}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {translations.treeId} {tree.tree_id}
              </h3>
              {tree.species && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{tree.species}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={handleShare}
              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title={translations.share}
            >
              <FiShare2 className="w-4 h-4" />
            </button>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Daraxt ID ${tree.tree_id} ni o'chirishni tasdiqlaysizmi?`)) {
                    onDelete()
                  }
                }}
                className="p-1.5 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Daraxtni o'chirish"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
            <div 
              className={`w-2 h-2 rounded-full ${
                isOffline 
                  ? 'bg-gray-400 dark:bg-gray-500' 
                  : isPpmAlert 
                  ? 'bg-red-500 dark:bg-red-400 animate-pulse' 
                  : isAlert 
                  ? 'bg-red-500 dark:bg-red-400' 
                  : 'bg-green-500 dark:bg-green-400'
              }`} 
              title={statusText}
            ></div>
          </div>
        </div>

        {/* Tree Biological Age - WHOOP-style Display */}
        {healthspanData.biologicalAge && healthspanData.chronologicalAge && (
          <div className="mb-3 sm:mb-4 text-center">
            <div className={`relative inline-flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full ${ageAnimationClass} overflow-hidden`}>
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
                  {healthspanData.biologicalAge.toFixed(1)}
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
                {healthspanData.chronologicalAge.toFixed(1)} yil (daraxt yoshi)
              </p>
              {Math.abs(healthspanData.ageDifference || 0) > 0.1 && (
                <p className={`text-xs font-semibold ${
                  healthspanData.ageDifference > 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {healthspanData.ageDifference > 0 ? '+' : ''}{healthspanData.ageDifference.toFixed(1)} yil farq
                </p>
              )}
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="mb-3 sm:mb-4">
          <span
            className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-xs font-medium ${
              isOffline
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                : isPpmAlert
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : isAlert
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            }`}
          >
            {statusText}
          </span>
        </div>

        {/* Telemetry Data - Compact for Data Density */}
        {isOffline ? (
          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">{translations.offline}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {tree.last_seen_at 
                ? format(new Date(tree.last_seen_at), 'dd.MM.yyyy HH:mm')
                : 'Ma\'lumot yo\'q'}
            </p>
          </div>
        ) : shouldShowTelemetry ? (
          <div className="mb-3 sm:mb-4 grid grid-cols-3 gap-1.5 sm:gap-2">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Harorat</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                {tree.last_telemetry?.temp_c != null ? `${Number(tree.last_telemetry.temp_c).toFixed(1)}°C` : '-'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Namlik</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                {tree.last_telemetry?.humidity_pct != null ? `${Number(tree.last_telemetry.humidity_pct).toFixed(1)}%` : '-'}
              </p>
            </div>
            <div className={`rounded-lg p-2 sm:p-3 text-center ${
              isPpmAlert 
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                : 'bg-gray-50 dark:bg-gray-700/50'
            }`}>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Tutun</p>
              <p className={`text-xs sm:text-sm font-semibold ${
                isPpmAlert 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-900 dark:text-gray-100'
              }`}>
                {tree.last_telemetry?.mq2 != null ? `${tree.last_telemetry.mq2}` : '-'}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 text-center">
            <p className="text-xs text-yellow-700 dark:text-yellow-400">Ma'lumotlar kutilmoqda...</p>
          </div>
        )}

        {/* Footer - Compact */}
        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">{translations.lastSeen}</p>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5 truncate">
              {tree.last_seen_at
                ? format(new Date(tree.last_seen_at), 'dd.MM.yyyy HH:mm')
                : translations.noData}
            </p>
          </div>
          <button className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors ml-2 flex-shrink-0">
            {translations.viewDetails} →
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <QRCodeModal
          tree={tree}
          shareUrl={shareUrl}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  )
}

