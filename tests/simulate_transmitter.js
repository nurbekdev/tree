/*
 * Simulate Transmitter - Test Script
 * Sends fake telemetry data to backend API
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const API_KEY = process.env.API_KEY || 'your-secret-api-key-here';

const TREE_IDS = [1, 2, 3];
const INTERVAL_MS = 30000; // 30 seconds

// Simulate sensor readings
function generateSensorData(treeId) {
  const baseTemp = 20 + Math.random() * 10; // 20-30°C
  const baseHumidity = 40 + Math.random() * 30; // 40-70%
  const baseMQ2 = 50 + Math.random() * 100; // 50-150 (normal)
  
  // Occasionally trigger alerts
  const alertChance = Math.random();
  let mq2 = baseMQ2;
  let mpuCutDetected = false;
  let status = 'ok';
  
  if (alertChance < 0.1) {
    // 10% chance of smoke alert
    mq2 = 400 + Math.random() * 200; // 400-600 (alert)
    status = 'alert';
  } else if (alertChance < 0.15) {
    // 5% chance of cut detection
    mpuCutDetected = true;
    status = 'alert';
  }
  
  return {
    tree_id: treeId,
    timestamp: Math.floor(Date.now() / 1000),
    temp_c: parseFloat(baseTemp.toFixed(2)),
    humidity_pct: parseFloat(baseHumidity.toFixed(2)),
    mq2: Math.floor(mq2),
    mpu_accel_x: parseFloat((Math.random() * 0.2 - 0.1).toFixed(6)),
    mpu_accel_y: parseFloat((Math.random() * 0.2 - 0.1).toFixed(6)),
    mpu_accel_z: parseFloat((0.98 + Math.random() * 0.04).toFixed(6)),
    mpu_gyro_x: parseFloat((Math.random() * 0.5 - 0.25).toFixed(6)),
    mpu_gyro_y: parseFloat((Math.random() * 0.5 - 0.25).toFixed(6)),
    mpu_gyro_z: parseFloat((Math.random() * 0.5 - 0.25).toFixed(6)),
    mpu_tilt: false,
    mpu_cut_detected: mpuCutDetected,
    status: status,
  };
}

async function sendTelemetry(treeId) {
  try {
    const data = generateSensorData(treeId);
    
    const response = await axios.post(
      `${API_URL}/api/v1/telemetry`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
      }
    );
    
    console.log(`[Tree ${treeId}] Telemetry sent:`, {
      temp: data.temp_c,
      humidity: data.humidity_pct,
      mq2: data.mq2,
      status: data.status,
    });
    
    return response.data;
  } catch (error) {
    console.error(`[Tree ${treeId}] Error:`, error.response?.data || error.message);
  }
}

// Send initial telemetry for all trees
console.log('Starting transmitter simulation...');
console.log(`API URL: ${API_URL}`);
console.log(`Interval: ${INTERVAL_MS / 1000} seconds\n`);

TREE_IDS.forEach((treeId) => {
  sendTelemetry(treeId);
});

// Set up periodic sending
const intervals = TREE_IDS.map((treeId) => {
  return setInterval(() => {
    sendTelemetry(treeId);
  }, INTERVAL_MS);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nStopping simulation...');
  intervals.forEach((interval) => clearInterval(interval));
  process.exit(0);
});

console.log('Simulation running. Press Ctrl+C to stop.');

