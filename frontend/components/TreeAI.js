'use client'

import { useState, useEffect } from 'react'
import { treesAPI } from '@/lib/api'
import { format } from 'date-fns'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

const translations = {
  title: "AI Daraxt Tahlili",
  subtitle: "Sun'iy intellekt asosida tahlil va tavsiyalar",
  loading: "Tahlil qilinmoqda...",
  error: "Ma'lumotlarni yuklashda xatolik",
  demo: "",
  
  // Health Score
  healthScore: "Daraxt salomatligi",
  healthScoreDesc: "Barcha daraxtlarning o'rtacha salomatlik ko'rsatkichi",
  excellent: "A'lo",
  good: "Yaxshi",
  fair: "O'rtacha",
  poor: "Yomon",
  
  // Risk Analysis
  riskAnalysis: "Xavf tahlili",
  riskLevel: "Xavf darajasi",
  lowRisk: "Past",
  mediumRisk: "O'rtacha",
  highRisk: "Yuqori",
  riskFactors: "Xavf omillari",
  
  // Recommendations
  recommendations: "AI Tavsiyalari",
  noRecommendations: "Hozircha tavsiyalar yo'q",
  
  // Trends
  trends: "Tendentsiya tahlili",
  improving: "Yaxshilanmoqda",
  stable: "Barqaror",
  declining: "Yomonlashmoqda",
  
  // Insights
  insights: "AI Tahlili",
  weatherImpact: "Ob-havo ta'siri",
  sensorStatus: "Sensor holati",
}

export default function TreeAI() {
  const [trees, setTrees] = useState([])
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const treesData = await treesAPI.getAll()
      setTrees(treesData)
      
      // Generate AI analysis
      const aiAnalysis = generateAIAnalysis(treesData)
      setAnalysis(aiAnalysis)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAIAnalysis = (treesData) => {
    if (!treesData || treesData.length === 0) {
      return null
    }

    // Calculate health scores
    const healthScores = treesData.map(tree => {
      const telemetry = tree.last_telemetry
      if (!telemetry) return null

      let score = 100
      const issues = []

      // Temperature check (optimal: 15-30°C)
      if (telemetry.temp_c) {
        const temp = Number(telemetry.temp_c)
        if (temp < 5 || temp > 40) {
          score -= 20
          issues.push(`Harorat noto'g'ri: ${temp.toFixed(1)}°C`)
        } else if (temp < 10 || temp > 35) {
          score -= 10
          issues.push(`Harorat chegarada: ${temp.toFixed(1)}°C`)
        }
      }

      // Humidity check (optimal: 40-70%)
      if (telemetry.humidity_pct) {
        const humidity = Number(telemetry.humidity_pct)
        if (humidity < 20 || humidity > 90) {
          score -= 15
          issues.push(`Namlik noto'g'ri: ${humidity.toFixed(1)}%`)
        } else if (humidity < 30 || humidity > 80) {
          score -= 8
        }
      }

      // Smoke check
      if (telemetry.mq2) {
        const smoke = Number(telemetry.mq2)
        if (smoke > 400) {
          score -= 30
          issues.push(`Yuqori tutun darajasi: ${smoke} PPM`)
        } else if (smoke > 200) {
          score -= 10
        }
      }

      // Alert check
      if (tree.last_status === 'alert') {
        score -= 25
        issues.push('Faol ogohlantirishlar mavjud')
      }

      return {
        tree_id: tree.tree_id,
        score: Math.max(0, score),
        issues,
        status: tree.last_status
      }
    }).filter(Boolean)

    const avgScore = healthScores.reduce((sum, h) => sum + h.score, 0) / healthScores.length

    // Risk analysis
    const highRiskTrees = healthScores.filter(h => h.score < 50).length
    const mediumRiskTrees = healthScores.filter(h => h.score >= 50 && h.score < 70).length
    const lowRiskTrees = healthScores.filter(h => h.score >= 70).length

    let riskLevel = 'low'
    if (highRiskTrees > 0) riskLevel = 'high'
    else if (mediumRiskTrees > 0) riskLevel = 'medium'

    // Generate recommendations
    const recommendations = []
    
    if (highRiskTrees > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Jiddiy e\'tibor kerak',
        message: `${highRiskTrees} ta daraxt jiddiy muammoga duch kelmoqda. Darhol tekshirish tavsiya etiladi.`
      })
    }

    const smokeIssues = healthScores.filter(h => 
      h.issues.some(i => i.includes('tutun'))
    ).length
    if (smokeIssues > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Tutun aniqlandi',
        message: `${smokeIssues} ta daraxtda yuqori tutun darajasi. Yong'in xavfini tekshiring.`
      })
    }

    const tempIssues = healthScores.filter(h => 
      h.issues.some(i => i.includes('Harorat'))
    ).length
    if (tempIssues > 0) {
      recommendations.push({
        priority: 'medium',
        title: 'Harorat monitoring',
        message: `${tempIssues} ta daraxt uchun harorat chegarada. Suv berish yoki soya yaratish tavsiya etiladi.`
      })
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'low',
        title: 'Barcha daraxtlar yaxshi holatda',
        message: 'Hozircha qo\'shimcha chora-tadbirlar kerak emas. Muntazam monitoringni davom eting.'
      })
    }

    // Trend analysis
    const trend = avgScore >= 80 ? 'improving' : avgScore >= 60 ? 'stable' : 'declining'

    return {
      avgHealthScore: Math.round(avgScore),
      healthScores,
      riskLevel,
      riskCounts: {
        high: highRiskTrees,
        medium: mediumRiskTrees,
        low: lowRiskTrees
      },
      recommendations,
      trend,
      totalTrees: treesData.length,
      timestamp: new Date()
    }
  }

  const getHealthLabel = (score) => {
    if (score >= 80) return translations.excellent
    if (score >= 60) return translations.good
    if (score >= 40) return translations.fair
    return translations.poor
  }

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getRiskColor = (level) => {
    if (level === 'high') return 'text-red-600 bg-red-100'
    if (level === 'medium') return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getRiskLabel = (level) => {
    if (level === 'high') return translations.highRisk
    if (level === 'medium') return translations.mediumRisk
    return translations.lowRisk
  }

  if (loading && !analysis) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">{translations.title}</h3>
        </div>
        <p className="text-sm text-gray-600">{translations.loading}</p>
      </div>
    )
  }

  if (!analysis) {
    return null
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-lg sm:text-xl">🤖</span>
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
        <div className="space-y-4 sm:space-y-6">

          {/* Health Score */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900">{translations.healthScore}</h4>
              <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold ${getHealthColor(analysis.avgHealthScore)}`}>
                {analysis.avgHealthScore}%
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2">{translations.healthScoreDesc}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    analysis.avgHealthScore >= 80 ? 'bg-green-500' :
                    analysis.avgHealthScore >= 60 ? 'bg-blue-500' :
                    analysis.avgHealthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${analysis.avgHealthScore}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600 whitespace-nowrap">{getHealthLabel(analysis.avgHealthScore)}</span>
            </div>
          </div>

          {/* Risk Analysis */}
          <div className="p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">{translations.riskAnalysis}</h4>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="text-center p-2 sm:p-3 bg-white rounded border">
                <p className="text-xl sm:text-2xl font-bold text-red-600">{analysis.riskCounts.high}</p>
                <p className="text-xs text-gray-600">{translations.highRisk}</p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-white rounded border">
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{analysis.riskCounts.medium}</p>
                <p className="text-xs text-gray-600">{translations.mediumRisk}</p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-white rounded border">
                <p className="text-xl sm:text-2xl font-bold text-green-600">{analysis.riskCounts.low}</p>
                <p className="text-xs text-gray-600">{translations.lowRisk}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600">{translations.riskLevel}:</span>
              <span className={`px-2 py-0.5 sm:py-1 rounded text-xs font-semibold ${getRiskColor(analysis.riskLevel)}`}>
                {getRiskLabel(analysis.riskLevel)}
              </span>
            </div>
          </div>

          {/* Recommendations - Limit to 3 */}
          {analysis.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">{translations.recommendations}</h4>
              <div className="space-y-2 sm:space-y-3 max-h-48 overflow-y-auto">
                {analysis.recommendations.slice(0, 3).map((rec, index) => (
                  <div
                    key={index}
                    className={`p-2 sm:p-3 rounded-lg border ${
                      rec.priority === 'high'
                        ? 'bg-red-50 border-red-200'
                        : rec.priority === 'medium'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg sm:text-xl flex-shrink-0">
                        {rec.priority === 'high' ? '🚨' : rec.priority === 'medium' ? '⚠️' : '💡'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-xs sm:text-sm mb-0.5 sm:mb-1">{rec.title}</p>
                        <p className="text-xs text-gray-700 line-clamp-2">{rec.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trend Analysis */}
          <div className="p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">{translations.trends}</h4>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl flex-shrink-0">
                {analysis.trend === 'improving' ? '📈' : analysis.trend === 'stable' ? '➡️' : '📉'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900">
                  {analysis.trend === 'improving' ? translations.improving :
                   analysis.trend === 'stable' ? translations.stable :
                   translations.declining}
                </p>
                <p className="text-xs text-gray-600">
                  {analysis.totalTrees} ta daraxt
                </p>
              </div>
            </div>
          </div>

          {analysis.timestamp && (
            <p className="text-xs text-gray-500 mt-2 sm:mt-4 text-center">
              {format(analysis.timestamp, 'dd.MM.yyyy HH:mm')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

