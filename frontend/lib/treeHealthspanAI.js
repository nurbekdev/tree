/**
 * Explainable Tree Healthspan (Biological Age) Calculation System
 * 
 * Calculates biological age based on chronological age and environmental impacts.
 * Provides transparent, explainable adjustments for agricultural scientists.
 */

/**
 * Calculate Chronological Age from planting year
 */
export function getChronologicalAge(plantingYear) {
  if (!plantingYear) return null
  
  const currentYear = new Date().getFullYear()
  const planting = parseInt(plantingYear)
  
  if (isNaN(planting) || planting > currentYear) return null
  
  return currentYear - planting
}

/**
 * Calculate Biological Age (Healthspan) with explainable adjustments
 * @param {Object} tree - Tree object with planting_year
 * @param {Object} lastTelemetry - Latest telemetry reading
 * @param {Array} telemetryHistory - Historical telemetry data (last 30 days)
 * @returns {Object} - { chronologicalAge, biologicalAge, adjustments, status, insights }
 */
export function calculateTreeHealthspan(tree, lastTelemetry, telemetryHistory = []) {
  // Get chronological age
  const chronologicalAge = getChronologicalAge(tree.planted_year)
  
  if (chronologicalAge === null) {
    return {
      chronologicalAge: null,
      biologicalAge: null,
      adjustments: [],
      status: 'unknown',
      statusLabel: 'Ma\'lumot yo\'q',
      confidence: 0,
      insights: ['Ekilgan yil ma\'lumotlari yo\'q']
    }
  }

  // If no telemetry history, return chronological age as biological age (no adjustments)
  if (!telemetryHistory || telemetryHistory.length === 0) {
    return {
      chronologicalAge,
      biologicalAge: chronologicalAge,
      biologicalAgeMonths: 0,
      totalMonthsAdjustment: 0,
      adjustments: [],
      status: 'neutral',
      statusLabel: 'Tahlil qilish uchun ma\'lumot yetarli emas',
      confidence: 0.3,
      insights: ['Sensor ma\'lumotlari yetarli emas'],
      ageDifference: 0
    }
  }

  const adjustments = []
  let totalMonthsAdjustment = 0
  let confidence = 0.5

  // Filter valid telemetry data
  const validTelemetry = telemetryHistory.filter(t => 
    t.timestamp && 
    (t.temp_c != null || t.humidity_pct != null || t.mq2 != null)
  )

  if (validTelemetry.length < 7) {
    return {
      chronologicalAge,
      biologicalAge: chronologicalAge,
      biologicalAgeMonths: 0,
      totalMonthsAdjustment: 0,
      adjustments: [],
      status: 'neutral',
      statusLabel: 'Ma\'lumot yetarli emas',
      confidence: 0.3,
      insights: ['Kamida 7 kunlik ma\'lumot kerak'],
      ageDifference: 0
    }
  }

  // 1. TEMPERATURE IMPACT ANALYSIS
  const temps = validTelemetry
    .filter(t => t.temp_c != null && t.temp_c > 0)
    .map(t => Number(t.temp_c))
  
  if (temps.length >= 7) {
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length
    const maxTemp = Math.max(...temps)
    const minTemp = Math.min(...temps)
    const tempRange = maxTemp - minTemp
    
    // Optimal temperature range for trees: 15-25°C
    // High stress: >30°C average or >35°C peak
    // Low stress: <5°C average or <0°C peak
    
    if (avgTemp > 30 || maxTemp > 35) {
      const months = avgTemp > 35 ? 6 : (avgTemp > 32 ? 4 : 2)
      adjustments.push({
        factor: 'temperature',
        type: 'stress',
        months: months,
        description: `Yuqori harorat stressi (o'rtacha: ${avgTemp.toFixed(1)}°C, maksimal: ${maxTemp.toFixed(1)}°C)`,
        impact: `+${months} oy qo'shildi`
      })
      totalMonthsAdjustment += months
      confidence += 0.15
    } else if (avgTemp < 5 || minTemp < 0) {
      const months = minTemp < -5 ? 4 : 2
      adjustments.push({
        factor: 'temperature',
        type: 'stress',
        months: months,
        description: `Past harorat stressi (o'rtacha: ${avgTemp.toFixed(1)}°C, minimal: ${minTemp.toFixed(1)}°C)`,
        impact: `+${months} oy qo'shildi`
      })
      totalMonthsAdjustment += months
      confidence += 0.15
    } else if (avgTemp >= 15 && avgTemp <= 25 && tempRange < 10) {
      // Optimal and stable
      adjustments.push({
        factor: 'temperature',
        type: 'optimal',
        months: -2,
        description: `Optimal va barqaror harorat (o'rtacha: ${avgTemp.toFixed(1)}°C)`,
        impact: `-2 oy ayirildi`
      })
      totalMonthsAdjustment -= 2
      confidence += 0.1
    }
  }

  // 2. HUMIDITY IMPACT ANALYSIS
  const humidities = validTelemetry
    .filter(t => t.humidity_pct != null && t.humidity_pct > 0)
    .map(t => Number(t.humidity_pct))
  
  if (humidities.length >= 7) {
    const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length
    const minHumidity = Math.min(...humidities)
    const humidityVariance = humidities.reduce((sum, h) => sum + Math.pow(h - avgHumidity, 2), 0) / humidities.length
    const stdDev = Math.sqrt(humidityVariance)
    
    // Optimal humidity: 40-70%
    // Low humidity stress: <30% average
    // High variance = unstable = stress
    
    if (avgHumidity < 30 || minHumidity < 20) {
      const months = minHumidity < 15 ? 4 : 3
      adjustments.push({
        factor: 'humidity',
        type: 'stress',
        months: months,
        description: `Past namlik stressi (o'rtacha: ${avgHumidity.toFixed(1)}%, minimal: ${minHumidity.toFixed(1)}%)`,
        impact: `+${months} oy qo'shildi`
      })
      totalMonthsAdjustment += months
      confidence += 0.15
    } else if (avgHumidity >= 40 && avgHumidity <= 70 && stdDev < 10) {
      // Optimal and stable
      adjustments.push({
        factor: 'humidity',
        type: 'optimal',
        months: -3,
        description: `Optimal namlik darajasi (o'rtacha: ${avgHumidity.toFixed(1)}%)`,
        impact: `-3 oy ayirildi`
      })
      totalMonthsAdjustment -= 3
      confidence += 0.1
    } else if (stdDev > 20) {
      // High variance = unstable
      adjustments.push({
        factor: 'humidity',
        type: 'stress',
        months: 2,
        description: `O'zgaruvchan namlik (o'zgarish: ${stdDev.toFixed(1)}%)`,
        impact: `+2 oy qo'shildi`
      })
      totalMonthsAdjustment += 2
      confidence += 0.1
    }
  }

  // 3. SMOKE (POLLUTION) IMPACT ANALYSIS
  const smokeReadings = validTelemetry
    .filter(t => t.mq2 != null)
    .map(t => Number(t.mq2))
  
  if (smokeReadings.length >= 7) {
    const avgSmoke = smokeReadings.reduce((a, b) => a + b, 0) / smokeReadings.length
    const maxSmoke = Math.max(...smokeReadings)
    const highSmokeEvents = smokeReadings.filter(s => s > 300).length
    const smokeEventRate = highSmokeEvents / smokeReadings.length
    
    // High smoke = pollution/fire stress
    // Threshold: >300 PPM is concerning
    // >400 PPM is critical
    
    if (maxSmoke > 400 || smokeEventRate > 0.2) {
      const months = maxSmoke > 500 ? 12 : (maxSmoke > 400 ? 8 : 6)
      adjustments.push({
        factor: 'smoke',
        type: 'stress',
        months: months,
        description: `Yuqori tutun darajasi (maksimal: ${maxSmoke} PPM, ${Math.round(smokeEventRate * 100)}% yuqori daraja)`,
        impact: `+${months} oy qo'shildi`
      })
      totalMonthsAdjustment += months
      confidence += 0.15
    } else if (avgSmoke < 150 && maxSmoke < 250) {
      // Clean air
      adjustments.push({
        factor: 'smoke',
        type: 'optimal',
        months: -4,
        description: `Toza havo (o'rtacha: ${avgSmoke.toFixed(0)} PPM)`,
        impact: `-4 oy ayirildi`
      })
      totalMonthsAdjustment -= 4
      confidence += 0.1
    }
  }

  // 4. MOTION (MPU6050) IMPACT ANALYSIS
  const motionEvents = validTelemetry.filter(t => 
    t.mpu_tilt === true || 
    t.mpu_cut_detected === true ||
    (t.mpu_accel_x != null && Math.abs(t.mpu_accel_x) > 2) ||
    (t.mpu_gyro_x != null && Math.abs(t.mpu_gyro_x) > 5)
  ).length
  
  const motionEventRate = motionEvents / validTelemetry.length
  
  if (motionEventRate > 0.15) {
    // Frequent abnormal movement = damage/stress
    const months = motionEventRate > 0.3 ? 6 : 4
    adjustments.push({
      factor: 'motion',
      type: 'stress',
      months: months,
      description: `Ko'p anormal harakat (${Math.round(motionEventRate * 100)}% voqealar)`,
      impact: `+${months} oy qo'shildi`
    })
    totalMonthsAdjustment += months
    confidence += 0.1
  } else if (motionEventRate < 0.05) {
    // Stable movement = healthy
    adjustments.push({
      factor: 'motion',
      type: 'optimal',
      months: -2,
      description: `Barqaror harakat (${Math.round(motionEventRate * 100)}% voqealar)`,
      impact: `-2 oy ayirildi`
    })
    totalMonthsAdjustment -= 2
    confidence += 0.1
  }

  // 5. ONLINE/OFFLINE PATTERN
  const isOffline = !tree.last_seen_at || 
    (new Date(tree.last_seen_at) < new Date(Date.now() - 30 * 1000))
  
  if (isOffline) {
    // Offline = can't monitor = slight negative impact
    adjustments.push({
      factor: 'connectivity',
      type: 'stress',
      months: 1,
      description: 'Qurilma offline (monitoring yo\'q)',
      impact: '+1 oy qo\'shildi'
    })
    totalMonthsAdjustment += 1
  }

  // Calculate biological age
  const biologicalAgeYears = chronologicalAge + (totalMonthsAdjustment / 12)
  const biologicalAgeMonths = totalMonthsAdjustment % 12

  // Determine status based on comparison
  const ageDifference = biologicalAgeYears - chronologicalAge
  let status, statusLabel
  
  if (ageDifference > 0.5) {
    // Biological age significantly older
    status = 'stressed'
    statusLabel = 'Stress ostida'
  } else if (ageDifference < -0.5) {
    // Biological age significantly younger
    status = 'thriving'
    statusLabel = 'Yaxshi rivojlanmoqda'
  } else {
    // Close to chronological age
    status = 'normal'
    statusLabel = 'Normal holat'
  }

  // Generate insights
  const insights = []
  if (adjustments.length > 0) {
    const stressCount = adjustments.filter(a => a.type === 'stress').length
    const optimalCount = adjustments.filter(a => a.type === 'optimal').length
    
    if (stressCount > optimalCount) {
      insights.push(`${stressCount} ta stress omili aniqlandi`)
    } else if (optimalCount > stressCount) {
      insights.push(`${optimalCount} ta optimal sharoit aniqlandi`)
    }
  }

  confidence = Math.min(1, confidence)

  return {
    chronologicalAge: Math.round(chronologicalAge * 10) / 10,
    biologicalAge: Math.round(biologicalAgeYears * 10) / 10,
    biologicalAgeMonths: Math.round(biologicalAgeMonths),
    totalMonthsAdjustment: Math.round(totalMonthsAdjustment),
    adjustments,
    status,
    statusLabel,
    confidence: Math.round(confidence * 100),
    insights: insights.length > 0 ? insights : ['Tahlil yakunlandi'],
    ageDifference: Math.round(ageDifference * 10) / 10
  }
}

/**
 * Get color scheme for healthspan status
 */
export function getHealthspanStatusColors(status) {
  switch (status) {
    case 'thriving':
      return {
        primary: 'green',
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-700',
        text: 'text-green-700 dark:text-green-400',
        glow: 'shadow-green-500/50',
        ring: 'ring-green-500/30',
        badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      }
    case 'normal':
      return {
        primary: 'yellow',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-700',
        text: 'text-yellow-700 dark:text-yellow-400',
        glow: 'shadow-yellow-500/50',
        ring: 'ring-yellow-500/30',
        badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      }
    case 'stressed':
      return {
        primary: 'red',
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-700',
        text: 'text-red-700 dark:text-red-400',
        glow: 'shadow-red-500/50',
        ring: 'ring-red-500/30',
        badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      }
    default:
      return {
        primary: 'gray',
        bg: 'bg-gray-50 dark:bg-gray-700/50',
        border: 'border-gray-200 dark:border-gray-600',
        text: 'text-gray-700 dark:text-gray-400',
        glow: 'shadow-gray-500/50',
        ring: 'ring-gray-500/30',
        badge: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
      }
  }
}

