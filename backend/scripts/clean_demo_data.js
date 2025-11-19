/*
 * Clean Demo Data Script
 * Removes all demo/test data from database
 * WARNING: This will delete all telemetry and alerts!
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'tree_monitor',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function cleanDemoData() {
  try {
    console.log('Cleaning demo data...');

    // Delete all telemetry data
    const telemetryResult = await pool.query('DELETE FROM telemetry');
    console.log(`✓ Deleted ${telemetryResult.rowCount} telemetry records`);

    // Delete all alerts
    const alertsResult = await pool.query('DELETE FROM alerts');
    console.log(`✓ Deleted ${alertsResult.rowCount} alert records`);

    // Reset tree statuses
    await pool.query(`
      UPDATE trees 
      SET last_status = 'ok',
          last_seen_at = NULL,
          updated_at = NOW()
    `);
    console.log('✓ Reset all tree statuses');

    // Clear demo metadata (optional - comment out if you want to keep tree info)
    await pool.query(`
      UPDATE trees 
      SET species = NULL,
          planted_year = NULL,
          notes = NULL,
          latitude = NULL,
          longitude = NULL,
          owner_contact = NULL
      WHERE notes LIKE '%Demo%' OR notes LIKE '%demo%'
    `);
    console.log('✓ Cleared demo metadata from trees');

    console.log('\n✓ Demo data cleaned successfully!');
    console.log('Database is now ready for real sensor data.');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning demo data:', error);
    process.exit(1);
  }
}

cleanDemoData();

