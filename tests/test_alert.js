/*
 * Test Alert Conditions
 * Sends alert telemetry to backend
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const API_KEY = process.env.API_KEY || 'your-secret-api-key-here';

async function sendAlert(treeId, alertType) {
  const baseData = {
    tree_id: treeId,
    timestamp: Math.floor(Date.now() / 1000),
    temp_c: 25.0,
    humidity_pct: 60.0,
    mpu_accel_x: 0.01,
    mpu_accel_y: 0.02,
    mpu_accel_z: 0.98,
    mpu_gyro_x: 0.1,
    mpu_gyro_y: 0.2,
    mpu_gyro_z: 0.0,
    mpu_tilt: false,
    mpu_cut_detected: false,
    status: 'ok',
  };

  if (alertType === 'smoke') {
    baseData.mq2 = 500; // High smoke reading
    baseData.status = 'alert';
  } else if (alertType === 'cut') {
    baseData.mpu_cut_detected = true;
    baseData.status = 'alert';
  } else if (alertType === 'tilt') {
    baseData.mpu_tilt = true;
    baseData.status = 'alert';
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/v1/telemetry`,
      baseData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
      }
    );

    console.log(`✓ Alert sent: Tree ${treeId} - ${alertType}`);
    return response.data;
  } catch (error) {
    console.error(`✗ Error sending alert:`, error.response?.data || error.message);
  }
}

// Test all alert types
async function runTests() {
  console.log('Testing alert conditions...\n');

  // Test smoke alert
  await sendAlert(1, 'smoke');
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test cut detection
  await sendAlert(2, 'cut');
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test tilt detection
  await sendAlert(3, 'tilt');
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('\nAll tests completed!');
}

runTests();

