/**
 * AI-Powered Tree Age & Health Estimation System
 * 
 * Analyzes sensor data patterns to estimate tree biological age
 * and classify health status.
 */

/**
 * Calculate Tree Age Score based on sensor data patterns
 * @param {Object} tree - Tree object with telemetry data
 * @param {Object} lastTelemetry - Latest telemetry reading
 * @param {Array} telemetryHistory - Historical telemetry data (last 30 days)
 * @returns {Object} - { ageScore, status, confidence, insights }
 */
export function calculateTreeAgeScore(tree, lastTelemetry, telemetryHistory = []) {
  if (!lastTelemetry && (!telemetryHistory || telemetryHistory.length === 0)) {
    return {
      ageScore: null,
      status: 'unknown',
      confidence: 0,
      insights: ['Ma\'lumot yetarli emas']
    }
  }

  const insights = []
  let score = 50 // Base score (neutral)
  let confidence = 0.5

  // 1. Temperature Stability Analysis
  // Young trees: More stable temperature patterns
  // Old trees: More variable, less adaptive
  if (telemetryHistory.length > 0) {
    const temps = telemetryHistory
      .filter(t => t.temp_c != null && t.temp_c > 0)
      .map(t => Number(t.temp_c))
    
    if (temps.length > 10) {
      const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length
      const variance = temps.reduce((sum, temp) => sum + Math.pow(temp - avgTemp, 2), 0) / temps.length
      const stdDev = Math.sqrt(variance)
      
      // Low variance = more stable = younger/healthier
      if (stdDev < 2) {
        score += 15
        insights.push('Harorat barqaror (yaxshi belgi)')
      } else if (stdDev > 5) {
        score -= 20
        insights.push('Harorat o\'zgaruvchan (qari daraxt belgisi)')
      }
      confidence += 0.1
    }
  }

  // 2. Humidity Pattern Analysis
  // Healthy trees: Better moisture retention
  if (telemetryHistory.length > 0) {
    const humidities = telemetryHistory
      .filter(t => t.humidity_pct != null && t.humidity_pct > 0)
      .map(t => Number(t.humidity_pct))
    
    if (humidities.length > 10) {
      const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length
      
      // Optimal humidity range for trees: 40-70%
      if (avgHumidity >= 40 && avgHumidity <= 70) {
        score += 10
        insights.push('Namlik darajasi optimal')
      } else if (avgHumidity < 30) {
        score -= 15
        insights.push('Namlik past (stress belgisi)')
      }
      confidence += 0.1
    }
  }

  // 3. Motion Stability (MPU6050 Analysis)
  // Young trees: More flexible, less rigid
  // Old trees: More brittle, less movement
  if (telemetryHistory.length > 0) {
    const hasMotionData = telemetryHistory.some(t => 
      t.mpu_accel_x != null || t.mpu_gyro_x != null
    )
    
    if (hasMotionData) {
      const motionEvents = telemetryHistory.filter(t => 
        t.mpu_tilt === true || t.mpu_cut_detected === true
      ).length
      
      // Too many motion events = stress or damage
      const motionRate = motionEvents / telemetryHistory.length
      
      if (motionRate < 0.05) {
        score += 10
        insights.push('Harakat barqaror (sog\'lom)')
      } else if (motionRate > 0.2) {
        score -= 25
        insights.push('Ko\'p harakat (shikastlanish belgisi)')
      }
      confidence += 0.1
    }
  }

  // 4. Smoke Events Analysis
  // Frequent smoke = environmental stress = aging factor
  if (telemetryHistory.length > 0) {
    const smokeEvents = telemetryHistory.filter(t => 
      t.mq2 != null && Number(t.mq2) > 300
    ).length
    
    const smokeRate = smokeEvents / telemetryHistory.length
    
    if (smokeRate > 0.1) {
      score -= 15
      insights.push('Tutun ko\'p (atrof-muhit stressi)')
    } else if (smokeRate < 0.02) {
      score += 5
      insights.push('Havo sifati yaxshi')
    }
    confidence += 0.05
  }

  // 5. Online/Offline Pattern
  // Consistent data = healthy system = healthier tree
  const isOffline = !tree.last_seen_at || 
    (new Date(tree.last_seen_at) < new Date(Date.now() - 30 * 1000))
  
  if (isOffline) {
    score -= 5
    insights.push('Qurilma offline (ma\'lumot yo\'q)')
  } else {
    score += 5
  }

  // 6. Alert History
  // More alerts = more problems = older/stressed tree
  if (tree.alerts && Array.isArray(tree.alerts)) {
    const recentAlerts = tree.alerts.filter(a => 
      !a.acknowledged && 
      new Date(a.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length
    
    if (recentAlerts === 0) {
      score += 10
      insights.push('Ogohlantirishlar yo\'q (yaxshi belgi)')
    } else if (recentAlerts > 5) {
      score -= 20
      insights.push(`${recentAlerts} ta ogohlantirish (e\'tibor kerak)`)
    }
    confidence += 0.1
  }

  // Normalize score to 0-100 range
  score = Math.max(0, Math.min(100, score))
  confidence = Math.min(1, confidence)

  // Classify status based on score
  let status, statusLabel
  if (score >= 70) {
    status = 'healthy'
    statusLabel = 'Yosh / Sog\'lom'
  } else if (score >= 40) {
    status = 'aging'
    statusLabel = 'O\'rtacha yosh'
  } else {
    status = 'critical'
    statusLabel = 'Qari / Xavfli'
  }

  return {
    ageScore: Math.round(score),
    status,
    statusLabel,
    confidence: Math.round(confidence * 100),
    insights: insights.length > 0 ? insights : ['Ma\'lumot tahlil qilindi']
  }
}

/**
 * Get color scheme for tree status
 */
export function getTreeStatusColors(status) {
  switch (status) {
    case 'healthy':
      return {
        primary: 'green',
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-700',
        text: 'text-green-700 dark:text-green-400',
        glow: 'shadow-green-500/50',
        ring: 'ring-green-500/30'
      }
    case 'aging':
      return {
        primary: 'yellow',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-700',
        text: 'text-yellow-700 dark:text-yellow-400',
        glow: 'shadow-yellow-500/50',
        ring: 'ring-yellow-500/30'
      }
    case 'critical':
      return {
        primary: 'red',
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-700',
        text: 'text-red-700 dark:text-red-400',
        glow: 'shadow-red-500/50',
        ring: 'ring-red-500/30'
      }
    default:
      return {
        primary: 'gray',
        bg: 'bg-gray-50 dark:bg-gray-700/50',
        border: 'border-gray-200 dark:border-gray-600',
        text: 'text-gray-700 dark:text-gray-400',
        glow: 'shadow-gray-500/50',
        ring: 'ring-gray-500/30'
      }
  }
}

