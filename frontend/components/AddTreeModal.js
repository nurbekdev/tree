'use client'

import { useState } from 'react'
import { treesAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

// Dynamically import Leaflet map to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">Xarita yuklanmoqda...</div>
})

const translations = {
  title: "Yangi daraxt qo'shish",
  treeId: "Daraxt ID",
  species: "Turi",
  plantedYear: "Ekilgan yil",
  notes: "Eslatmalar",
  latitude: "Kenglik",
  longitude: "Uzunlik",
  ownerContact: "Egasi aloqa",
  save: "Saqlash",
  cancel: "Bekor qilish",
  close: "Yopish",
  required: "Majburiy maydon",
}

export default function AddTreeModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    tree_id: '',
    species: '',
    planted_year: '',
    notes: '',
    latitude: '',
    longitude: '',
    owner_contact: '',
  })
  const [loading, setLoading] = useState(false)
  const [mapPosition, setMapPosition] = useState([41.3111, 69.2797]) // Tashkent default

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.tree_id || formData.tree_id < 1 || formData.tree_id > 3) {
      toast.error('Daraxt ID 1, 2 yoki 3 bo\'lishi kerak')
      return
    }

    setLoading(true)
    try {
      await treesAPI.create(formData)
      toast.success('Daraxt muvaffaqiyatli qo\'shildi')
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Daraxt qo\'shishda xatolik'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e) => {
    // Close modal if clicking on backdrop (not on modal content)
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {translations.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              type="button"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translations.treeId} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="3"
                value={formData.tree_id}
                onChange={(e) =>
                  setFormData({ ...formData, tree_id: parseInt(e.target.value) || '' })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                placeholder="1, 2 yoki 3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translations.species}
              </label>
              <input
                type="text"
                value={formData.species}
                onChange={(e) =>
                  setFormData({ ...formData, species: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                placeholder="Masalan: Olma, Nok, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translations.plantedYear}
              </label>
              <input
                type="number"
                value={formData.planted_year}
                onChange={(e) =>
                  setFormData({ ...formData, planted_year: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                placeholder="Masalan: 2020"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translations.notes}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                placeholder="Qo'shimcha ma'lumotlar..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 {translations.latitude} / {translations.longitude}
              </label>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => {
                      const lat = e.target.value
                      setFormData({ ...formData, latitude: lat })
                      if (lat && formData.longitude) {
                        setMapPosition([parseFloat(lat), parseFloat(formData.longitude)])
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                    placeholder="41.31110000"
                  />
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => {
                      const lng = e.target.value
                      setFormData({ ...formData, longitude: lng })
                      if (formData.latitude && lng) {
                        setMapPosition([parseFloat(formData.latitude), parseFloat(lng)])
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                    placeholder="69.27970000"
                  />
                </div>
                {/* Map for selecting location */}
                <div className="h-64 rounded-lg overflow-hidden border-2 border-gray-300">
                  <MapComponent
                    position={mapPosition}
                    onPositionChange={(lat, lng) => {
                      setFormData({ 
                        ...formData, 
                        latitude: lat.toFixed(8), 
                        longitude: lng.toFixed(8) 
                      })
                      setMapPosition([lat, lng])
                    }}
                    editable={true}
                    treeId={parseInt(formData.tree_id) || 1}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  💡 Xaritada belgini siljitib yoki xaritaga bosib, joylashuvni tanlang
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translations.ownerContact}
              </label>
              <input
                type="text"
                value={formData.owner_contact}
                onChange={(e) =>
                  setFormData({ ...formData, owner_contact: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                placeholder="+998901234567"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Saqlanmoqda...' : translations.save}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium"
              >
                {translations.cancel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

