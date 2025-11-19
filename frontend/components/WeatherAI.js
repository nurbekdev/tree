'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{translations.title}</h3>
        </div>
        <p className="text-gray-600">{translations.loading}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{translations.title}</h3>
          <p className="text-sm text-gray-600">{translations.subtitle}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSelectedDays(7)}
          className={`px-3 py-1 text-sm rounded ${
            selectedDays === 7
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {translations.days7}
        </button>
        <button
          onClick={() => setSelectedDays(10)}
          className={`px-3 py-1 text-sm rounded ${
            selectedDays === 10
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {translations.days10}
        </button>
        <button
          onClick={() => setSelectedDays(30)}
          className={`px-3 py-1 text-sm rounded ${
            selectedDays === 30
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {translations.days30}
        </button>
      </div>

      {forecast && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {forecast.map((day, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    {format(day.date, 'dd.MM.yyyy')} ({format(day.date, 'EEE')})
                  </p>
                  <p className="text-sm text-gray-600">{day.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{day.avgTemp}°C</p>
                  <p className="text-xs text-gray-500">
                    {day.minTemp}° / {day.maxTemp}°
                  </p>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-gray-600">
                <span>{translations.humidity}: {day.humidity}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

