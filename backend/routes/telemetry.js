/*
 * Telemetry Routes (receives data from base station)
 */

const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// POST /api/v1/telemetry
router.post('/', async (req, res) => {
  try {
    const {
      tree_id,
      timestamp,
      temp_c,
      humidity_pct,
      mq2,
      mpu_accel_x,
      mpu_accel_y,
      mpu_accel_z,
      mpu_gyro_x,
      mpu_gyro_y,
      mpu_gyro_z,
      mpu_tilt,
      mpu_cut_detected,
      status
    } = req.body;

    // Validate required fields
    if (!tree_id || tree_id < 1 || tree_id > 3) {
      return res.status(400).json({ error: 'Invalid tree_id (must be 1-3)' });
    }

    // Handle timestamp - use current time if not provided or invalid
    // If timestamp is too small (< 1000000), it's likely millis()/1000 from ESP8266 boot time
    // In that case, use current server time instead
    let telemetryTimestamp
    if (timestamp && typeof timestamp === 'number' && timestamp > 1000000) {
      // Valid Unix timestamp (after year 2001)
      telemetryTimestamp = new Date(timestamp * 1000)
    } else if (timestamp && typeof timestamp === 'string') {
      // Try parsing as ISO string or Date
      telemetryTimestamp = new Date(timestamp)
    } else {
      // Use current server time
      telemetryTimestamp = new Date()
    }
    
    // Handle null values properly - allow null for temp_c and humidity_pct
    // Convert null/undefined/0 to actual null for database (0 might be sent when sensor fails)
    // Also check if value is 0.0 which might indicate a failed sensor reading
    let tempValue = null
    if (temp_c !== null && temp_c !== undefined) {
      const parsed = parseFloat(temp_c)
      // If parsed value is 0.0, treat as null (sensor failure indicator)
      // Only accept non-zero values as valid
      if (!isNaN(parsed) && parsed !== 0) {
        tempValue = parsed
      }
    }
    
    let humidityValue = null
    if (humidity_pct !== null && humidity_pct !== undefined) {
      const parsed = parseFloat(humidity_pct)
      // If parsed value is 0.0, treat as null (sensor failure indicator)
      // Only accept non-zero values as valid
      if (!isNaN(parsed) && parsed !== 0) {
        humidityValue = parsed
      }
    }
    
    // Get PPM threshold from settings FIRST (before determining status)
    let ppmThreshold = 400; // Default threshold
    try {
      const settingsResult = await pool.query(
        "SELECT value FROM settings WHERE key = 'ppm_threshold'"
      );
      if (settingsResult.rows.length > 0) {
        ppmThreshold = parseInt(settingsResult.rows[0].value) || 400;
      }
      console.log(`📊 PPM Threshold from settings: ${ppmThreshold} PPM`);
    } catch (error) {
      console.warn('Error fetching PPM threshold from settings, using default:', error);
    }

    // Parse mq2 value (ensure it's a number)
    const mq2Value = mq2 ? parseInt(mq2) : 0;
    console.log(`💨 MQ2 value received: ${mq2} (parsed: ${mq2Value}), Threshold: ${ppmThreshold} PPM`);

    // Determine alert status based on sensors (CRITICAL: Check PPM threshold regardless of incoming status)
    let finalStatus = status || 'ok';
    let alertType = null;
    let alertMessage = null;

    // Check PPM threshold FIRST (highest priority - fire detection)
    if (mq2Value > ppmThreshold) {
      console.log(`🔥 FIRE ALERT TRIGGERED! MQ2: ${mq2Value} PPM > Threshold: ${ppmThreshold} PPM`);
      finalStatus = 'alert';
      alertType = 'smoke';
      alertMessage = `🔥 YONG'IN XAVFI! Tutun aniqlandi (MQ-2: ${mq2Value} PPM) - Chegara: ${ppmThreshold} PPM`;
    } else if (mpu_cut_detected) {
      finalStatus = 'alert';
      alertType = 'cut';
      alertMessage = 'Daraxt kesilgan (MPU6050)';
    } else if (mpu_tilt) {
      finalStatus = 'alert';
      alertType = 'tilt';
      alertMessage = 'Daraxt og\'ilgan (MPU6050)';
    }
    
    // Store telemetry data with finalStatus
    const telemetryResult = await pool.query(
      `INSERT INTO telemetry (
        tree_id, timestamp, temp_c, humidity_pct, mq2,
        mpu_accel_x, mpu_accel_y, mpu_accel_z,
        mpu_gyro_x, mpu_gyro_y, mpu_gyro_z,
        mpu_tilt, mpu_cut_detected, status, raw_payload
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id`,
      [
        tree_id,
        telemetryTimestamp,
        tempValue,  // Can be null
        humidityValue,  // Can be null
        mq2Value || 0,
        mpu_accel_x || 0,
        mpu_accel_y || 0,
        mpu_accel_z || 0,
        mpu_gyro_x || 0,
        mpu_gyro_y || 0,
        mpu_gyro_z || 0,
        mpu_tilt || false,
        mpu_cut_detected || false,
        finalStatus, // Use finalStatus (includes PPM threshold check)
        JSON.stringify(req.body)
      ]
    );

    // Update tree status with final status (including PPM threshold check)
    await pool.query(
      `UPDATE trees 
       SET last_seen_at = NOW(), last_status = $1, updated_at = NOW()
       WHERE tree_id = $2`,
      [finalStatus, tree_id]
    );

    // Create alert if threshold exceeded or other alerts detected
    if (alertType && alertMessage) {
      // Check if similar UNACKNOWLEDGED alert already exists (within last 10 minutes) to avoid spam
      // For smoke alerts, check more frequently (5 minutes) as they're critical
      // IMPORTANT: Only check for unacknowledged alerts - if alert was acknowledged, create new one
      const spamIntervalMinutes = alertType === 'smoke' ? 5 : 10
      
      const recentAlertCheck = await pool.query(
        `SELECT id, created_at, acknowledged FROM alerts 
         WHERE tree_id = $1 AND type = $2 AND acknowledged = false 
         AND created_at > NOW() - INTERVAL '${spamIntervalMinutes} minutes'
         ORDER BY created_at DESC LIMIT 1`,
        [tree_id, alertType]
      );
      
      console.log(`🔍 Checking for recent alerts: Found ${recentAlertCheck.rows.length} unacknowledged ${alertType} alerts for tree ${tree_id} within last ${spamIntervalMinutes} minutes`);

      // Only create new alert if no recent unacknowledged alert exists
      if (recentAlertCheck.rows.length === 0) {
        console.log(`📢 Creating new alert: ${alertType} for tree ${tree_id} - ${alertMessage}`);
        const alertResult = await pool.query(
          `INSERT INTO alerts (tree_id, type, level, message, created_at)
           VALUES ($1, $2, 'high', $3, NOW())
           RETURNING id`,
          [tree_id, alertType, alertMessage]
        );

        console.log(`✅ Alert created with ID: ${alertResult.rows[0].id}`);

        // Emit real-time alert via Socket.IO
        const io = req.app.get('io');
        if (io) {
          const alertData = {
            id: alertResult.rows[0].id,
            tree_id,
            type: alertType,
            level: 'high',
            message: alertMessage,
            created_at: new Date()
          };
          console.log(`📡 Emitting alert via Socket.IO:`, alertData);
          io.emit('alert', alertData);
        } else {
          console.warn('⚠️ Socket.IO not available - cannot emit alert');
        }
      } else {
        console.log(`⏭️ Skipping alert creation - recent unacknowledged alert exists (within ${spamIntervalMinutes} minutes)`);
      }
    }

    // Emit real-time telemetry update (preserve null values)
    // Convert 0 to null for temp_c and humidity_pct (sensor failure indicator)
    const io = req.app.get('io');
    if (io) {
      const telemetryData = {
        tree_id,
        timestamp: telemetryTimestamp.toISOString(),  // Convert to ISO string for frontend
        temp_c: (tempValue === null || tempValue === 0) ? null : tempValue,  // Can be null
        humidity_pct: (humidityValue === null || humidityValue === 0) ? null : humidityValue,  // Can be null
        mq2: mq2Value || 0,
        status: finalStatus, // Use finalStatus (includes PPM threshold check)
        ppm_threshold: ppmThreshold // Include threshold in telemetry data for frontend
      };
      console.log('Emitting telemetry via Socket.IO:', telemetryData); // Debug log
      io.emit('telemetry', telemetryData);
    } else {
      console.warn('Socket.IO not available - cannot emit real-time update');
    }

    res.status(201).json({
      success: true,
      telemetry_id: telemetryResult.rows[0].id
    });
  } catch (error) {
    console.error('Telemetry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

