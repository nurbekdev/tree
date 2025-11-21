'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

const translations = {
  title: "AI Ob-havo Tahlili",
  subtitle: "Toshkent shahri uchun",
  loading: "Yuklanmoqda...",
  error: "Ma'lumotlarni yuklashda xatolik",
  demo: "",
  forecast: "Bashorat",
  days7: "7 kunlik",
  days10: "10 kunlik",
  days30: "30 kunlik",
  temperature: "Harorat",
  humidity: "Namlik",
  description: "Tavsif",
  date: "Sana",
  min: "Min",
  max: "Max",
  avg: "O'rtacha",
}

export default function WeatherAI() {
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDays, setSelectedDays] = useState(7)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    loadWeatherForecast()
  }, [selectedDays])

  const loadWeatherForecast = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // OpenWeatherMap API (free tier)
      // Note: In production, use your own API key
      const API_KEY = 'demo_key' // Replace with actual key
      const city = 'Tashkent'
      const lat = 41.2995
      const lon = 69.2401
      
      // For demo, we'll generate mock data
      // In production, use: https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric
      
      const mockForecast = generateMockForecast(selectedDays)
      setForecast(mockForecast)
    } catch (err) {
      console.error('Weather forecast error:', err)
      setError(translations.error)
      // Generate mock data on error
      setForecast(generateMockForecast(selectedDays))
    } finally {
      setLoading(false)
    }
  }

  const generateMockForecast = (days) => {
    const forecast = []
    const now = new Date()
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() + i)
      
      // Realistic Tashkent weather patterns
      const baseTemp = 15 + Math.sin(i * 0.2) * 10 // Seasonal variation
      const minTemp = baseTemp - 5 + Math.random() * 3
      const maxTemp = baseTemp + 5 + Math.random() * 3
      const avgTemp = (minTemp + maxTemp) / 2
      const humidity = 40 + Math.random() * 30
      
      const conditions = [
        'Ochiq osmon',
        'Yarim bulutli',
        'Bulutli',
        'Yomg\'ir',
        'Yengil yomg\'ir'
      ]
      const description = conditions[Math.floor(Math.random() * conditions.length)]
      
      forecast.push({
        date,
        minTemp: Math.round(minTemp),
        maxTemp: Math.round(maxTemp),
        avgTemp: Math.round(avgTemp),
        humidity: Math.round(humidity),
        description
      })
    }
    
    return forecast
  }

  if (loading && !forecast) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">{translations.title}</h3>
        </div>
        <p className="text-sm text-gray-600">{translations.loading}</p>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-lg sm:text-xl">🌤️</span>
            {translations.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">{translations.subtitle}</p>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title={collapsed ? "Kengaytirish" : "Yig'ish"}
        >
          {collapsed ? <FiChevronDown className="w-5 h-5" /> : <FiChevronUp className="w-5 h-5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-4">

          {error && (
            <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded text-xs sm:text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            <button
              onClick={() => setSelectedDays(7)}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${
                selectedDays === 7
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {translations.days7}
            </button>
            <button
              onClick={() => setSelectedDays(10)}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${
                selectedDays === 10
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {translations.days10}
            </button>
            <button
              onClick={() => setSelectedDays(30)}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${
                selectedDays === 30
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {translations.days30}
            </button>
          </div>

          {forecast && (
            <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto pr-1">
              {forecast.slice(0, selectedDays === 7 ? 7 : selectedDays === 10 ? 10 : 15).map((day, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-2 sm:p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs sm:text-sm text-gray-900">
                        {format(day.date, 'dd.MM')} ({format(day.date, 'EEE')})
                      </p>
                      <p className="text-xs text-gray-600">{day.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base sm:text-lg font-bold text-gray-900">{day.avgTemp}°C</p>
                      <p className="text-xs text-gray-500">
                        {day.minTemp}°/{day.maxTemp}°
                      </p>
                    </div>
                  </div>
                  <div className="mt-1.5 text-xs text-gray-600">
                    <span>{translations.humidity}: {day.humidity}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

