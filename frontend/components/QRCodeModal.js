'use client'

import { useState, useEffect } from 'react'
import { FiX, FiDownload, FiCopy } from 'react-icons/fi'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'

const translations = {
  shareTree: "Daraxtni ulashish",
  qrCode: "QR Kod",
  downloadQR: "QR kodni yuklab olish",
  copyLink: "Linkni nusxa olish",
  linkCopied: "Link nusxa olindi!",
  close: "Yopish",
  downloadFirmware: "Hardware kodlarini yuklab olish",
  baseStation: "Base Station",
  transmitter: "Transmitter",
  firmwareInfo: "Hardware kodlari",
}

export default function QRCodeModal({ tree, shareUrl, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setLoading(true)
        
        // Create canvas for QR code
        const canvas = document.createElement('canvas')
        const size = 400 // QR code size
        
        // Generate QR code
        await QRCode.toCanvas(canvas, shareUrl, {
          width: size,
          margin: 2,
          color: {
            dark: '#111827', // Dark mode compatible
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'H' // High error correction for logo
        })

        const ctx = canvas.getContext('2d')
        
        // Load logo image
        const logo = new Image()
        logo.crossOrigin = 'anonymous'
        
        logo.onload = () => {
          // Calculate logo size (20% of QR code size)
          const logoSize = size * 0.2
          const logoX = (size - logoSize) / 2
          const logoY = (size - logoSize) / 2
          
          // Draw white background circle for logo
          ctx.fillStyle = '#FFFFFF'
          ctx.beginPath()
          ctx.arc(size / 2, size / 2, logoSize / 2 + 10, 0, 2 * Math.PI)
          ctx.fill()
          
          // Draw logo
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
          
          // Convert to data URL
          const dataUrl = canvas.toDataURL('image/png')
          setQrDataUrl(dataUrl)
          setLoading(false)
        }
        
        logo.onerror = () => {
          // If logo fails to load, use QR code without logo
          const dataUrl = canvas.toDataURL('image/png')
          setQrDataUrl(dataUrl)
          setLoading(false)
        }
        
        // Try to load logo from public folder
        // Use absolute URL to avoid CORS issues
        const logoUrl = typeof window !== 'undefined' 
          ? `${window.location.origin}/LOGO.png`
          : '/LOGO.png'
        logo.src = logoUrl
      } catch (error) {
        console.error('Error generating QR code:', error)
        toast.error('QR kod yaratishda xatolik')
        setLoading(false)
      }
    }

    if (shareUrl) {
      generateQRCode()
    }
  }, [shareUrl])

  const handleDownload = () => {
    if (!qrDataUrl) return

    try {
      const link = document.createElement('a')
      link.download = `daraxt-${tree.tree_id}-qr-code.png`
      link.href = qrDataUrl
      link.click()
      toast.success('QR kod yuklab olindi!')
    } catch (error) {
      console.error('Error downloading QR code:', error)
      toast.error('QR kodni yuklab olishda xatolik')
    }
  }

  const handleCopyLink = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success(translations.linkCopied)
      }).catch(() => {
        // Fallback
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
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
      })
    }
  }

  const downloadFirmware = async (type) => {
    try {
      const response = await fetch(`/api/firmware/${type}?tree_id=${tree.tree_id}`)
      if (!response.ok) {
        throw new Error('Firmware yuklashda xatolik')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = type === 'base_station' ? 'base_station.ino' : `transmitter_tree_${tree.tree_id}.ino`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success(`${type === 'base_station' ? 'Base Station' : 'Transmitter'} firmware yuklandi`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Firmware yuklashda xatolik')
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {translations.shareTree}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Tree Info */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Daraxt ID</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            #{tree.tree_id}
          </p>
          {tree.species && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tree.species}</p>
          )}
        </div>

        {/* QR Code */}
        <div className="mb-6 flex justify-center">
          {loading ? (
            <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 dark:border-gray-600 border-t-green-600 dark:border-t-green-500"></div>
            </div>
          ) : qrDataUrl ? (
            <div className="relative">
              <img 
                src={qrDataUrl} 
                alt="QR Code" 
                className="w-64 h-64 rounded-lg border-4 border-gray-200 dark:border-gray-700 shadow-lg"
              />
            </div>
          ) : (
            <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">QR kod yaratilmadi</p>
            </div>
          )}
        </div>

        {/* Share URL */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Havola</p>
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 text-sm text-gray-900 dark:text-gray-100 bg-transparent border-none outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title={translations.copyLink}
            >
              <FiCopy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hardware Firmware Download Section */}
        <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <FiDownload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            {translations.firmwareInfo}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Daraxt monitoring uchun kerakli hardware kodlarini yuklab oling.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => downloadFirmware('base_station')}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
              title="Base Station Firmware"
            >
              <FiDownload className="w-4 h-4" />
              <span>{translations.baseStation}</span>
            </button>
            
            <button
              onClick={() => downloadFirmware('transmitter')}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-xs font-medium"
              title={`Transmitter Firmware (ID: ${tree.tree_id})`}
            >
              <FiDownload className="w-4 h-4" />
              <span>{translations.transmitter}</span>
            </button>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
            💡 Transmitter firmware'da TREE_ID avtomatik o'rnatiladi
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={!qrDataUrl || loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload className="w-5 h-5" />
            {translations.downloadQR}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors"
          >
            {translations.close}
          </button>
        </div>
      </div>
    </div>
  )
}

