'use client'

import { format } from 'date-fns'
import { FiShare2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

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

export default function TreeCard({ tree, onClick, ppmThreshold = 400 }) {
  const handleShare = (e) => {
    e.stopPropagation() // Prevent triggering the card click
    
    const shareUrl = `${window.location.origin}/tree/${tree.tree_id}`
    
    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success(translations.linkCopied)
      }).catch(() => {
        // Fallback for older browsers
        fallbackCopyToClipboard(shareUrl)
      })
    } else {
      // Fallback for older browsers
      fallbackCopyToClipboard(shareUrl)
    }
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

  return (
    <div
      className={`tree-card rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl relative overflow-hidden ${
        isOffline 
          ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200' 
          : isPpmAlert 
          ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-2 border-orange-400' 
          : isAlert 
          ? 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200' 
          : 'bg-gradient-to-br from-white to-green-50 border-2 border-green-200'
      }`}
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
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          {tree.image_url ? (
            <div className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${
              isOffline 
                ? 'border-gray-300' 
                : isPpmAlert 
                ? 'border-orange-400 animate-pulse' 
                : isAlert 
                ? 'border-red-300' 
                : 'border-green-300'
            }`}>
              <img 
                src={tree.image_url} 
                alt={`Daraxt ${tree.tree_id}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = `<span class="text-2xl flex items-center justify-center w-full h-full ${isPpmAlert ? 'animate-bounce' : ''}" style="animation-duration: ${isPpmAlert ? '0.5s' : '2s'}">${isPpmAlert ? '🔥' : '🌳'}</span>`
                }}
              />
            </div>
          ) : (
            <div className={`p-2 rounded-lg transition-all duration-300 flex-shrink-0 ${
              isOffline 
                ? 'bg-gray-200' 
                : isPpmAlert 
                ? 'bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200 animate-pulse' 
                : isAlert 
                ? 'bg-red-200' 
                : 'bg-green-200'
            }`}>
              <span className={`text-2xl ${isPpmAlert ? 'animate-bounce' : 'animate-bounce'}`} style={{ animationDuration: isPpmAlert ? '0.5s' : '2s' }}>
                {isPpmAlert ? '🔥' : '🌳'}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {translations.treeId} {tree.tree_id}
            </h3>
            {tree.species && (
              <p className="text-xs text-gray-600 mt-0.5">{tree.species}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOffline && (
            <span className="text-xs text-gray-600 font-medium bg-gray-200 px-2 py-1 rounded-full">⚫ {translations.offline}</span>
          )}
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center justify-center"
            title={translations.share}
          >
            <FiShare2 className="w-4 h-4" />
          </button>
          <div 
            className={`w-3 h-3 rounded-full ${statusColor} ${
              isOffline ? '' : (isPpmAlert ? 'animate-pulse' : isAlert ? 'animate-pulse' : 'animate-pulse')
            } ${isPpmAlert ? 'shadow-lg shadow-orange-500/50' : ''}`} 
            title={statusText}
            style={isPpmAlert ? { 
              boxShadow: '0 0 10px rgba(255, 69, 0, 0.8), 0 0 20px rgba(255, 69, 0, 0.6)',
              animation: 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            } : {}}
          ></div>
        </div>
      </div>

      {/* Quick Status Info */}
      {isOffline ? (
        <div className="mb-4 p-4 bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 rounded-xl text-center">
          <div className="text-4xl mb-2">⚫</div>
          <p className="text-sm text-gray-700 font-semibold mb-1">{translations.offline}</p>
          <p className="text-xs text-gray-600">
            {tree.last_seen_at 
              ? `Oxirgi marta: ${format(new Date(tree.last_seen_at), 'dd.MM.yyyy HH:mm')}`
              : 'Ma\'lumot hech qachon kelmagan'}
          </p>
        </div>
      ) : shouldShowTelemetry ? (
        <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border border-green-200">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/80 rounded-lg p-3 shadow-sm">
              <div className="text-2xl mb-1">🌡️</div>
              <p className="text-xs text-gray-600 mb-1">Harorat</p>
              <p className="font-bold text-lg text-gray-900">
                {tree.last_telemetry?.temp_c != null ? `${Number(tree.last_telemetry.temp_c).toFixed(1)}°C` : '-'}
              </p>
            </div>
            <div className="bg-white/80 rounded-lg p-3 shadow-sm">
              <div className="text-2xl mb-1">💧</div>
              <p className="text-xs text-gray-600 mb-1">Namlik</p>
              <p className="font-bold text-lg text-gray-900">
                {tree.last_telemetry?.humidity_pct != null ? `${Number(tree.last_telemetry.humidity_pct).toFixed(1)}%` : '-'}
              </p>
            </div>
            <div className={`bg-white/80 rounded-lg p-3 shadow-sm transition-all duration-300 ${
              isPpmAlert ? 'border-2 border-orange-400 bg-gradient-to-br from-yellow-50 to-orange-50 animate-pulse' : ''
            }`}>
              <div className={`text-2xl mb-1 ${isPpmAlert ? 'animate-bounce' : ''}`} style={{ animationDuration: isPpmAlert ? '0.5s' : '2s' }}>
                {isPpmAlert ? '🔥' : '💨'}
              </div>
              <p className="text-xs text-gray-600 mb-1">Tutun</p>
              <p className={`font-bold text-lg transition-colors ${
                isPpmAlert 
                  ? 'text-red-600 animate-pulse' 
                  : mq2Value > 400 
                  ? 'text-red-600' 
                  : 'text-gray-900'
              }`}>
                {tree.last_telemetry?.mq2 != null ? `${tree.last_telemetry.mq2} PPM` : '-'}
              </p>
              {isPpmAlert && (
                <p className="text-xs text-red-600 font-semibold mt-1 animate-pulse">
                  ⚠️ Chegara: {ppmThreshold} PPM
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-dashed border-yellow-300 rounded-xl text-center">
          <div className="text-4xl mb-2 animate-pulse">⏳</div>
          <p className="text-sm text-yellow-700 font-semibold mb-1">Ma'lumotlar kutilmoqda...</p>
          <p className="text-xs text-yellow-600">Qurilma ulanib, ma'lumot yuborishni kutmoqda</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500 mb-1">{translations.lastSeen}</p>
          <p className="text-xs font-medium text-gray-700">
            {tree.last_seen_at
              ? format(new Date(tree.last_seen_at), 'dd.MM.yyyy HH:mm')
              : translations.noData}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all duration-300 ${
              isOffline
                ? 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700'
                : isPpmAlert
                ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white animate-pulse'
                : isAlert
                ? 'bg-gradient-to-r from-red-200 to-red-300 text-red-800'
                : 'bg-gradient-to-r from-green-200 to-green-300 text-green-800'
            }`}
            style={isPpmAlert ? { 
              boxShadow: '0 0 10px rgba(255, 69, 0, 0.6), 0 0 20px rgba(255, 69, 0, 0.4)'
            } : {}}
          >
            {statusText}
          </span>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
            {translations.viewDetails}
            <span className="text-lg">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}

