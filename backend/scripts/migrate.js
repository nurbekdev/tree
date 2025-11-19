/*
 * Database Migration Script
 * Creates all required tables
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

async function migrate() {
  try {
    console.log('Starting database migration...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ users table created');

    // Create trees table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trees (
        id SERIAL PRIMARY KEY,
        tree_id INTEGER UNIQUE NOT NULL CHECK (tree_id >= 1 AND tree_id <= 3),
        species VARCHAR(100),
        planted_year INTEGER,
        notes TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        owner_contact VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_seen_at TIMESTAMP,
        last_status VARCHAR(20) DEFAULT 'ok'
      )
    `);
    console.log('✓ trees table created');

    // Create telemetry table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS telemetry (
        id SERIAL PRIMARY KEY,
        tree_id INTEGER NOT NULL REFERENCES trees(tree_id),
        timestamp TIMESTAMP NOT NULL,
        temp_c DECIMAL(5, 2),
        humidity_pct DECIMAL(5, 2),
        mq2 INTEGER,
        mpu_accel_x DECIMAL(10, 6),
        mpu_accel_y DECIMAL(10, 6),
        mpu_accel_z DECIMAL(10, 6),
        mpu_gyro_x DECIMAL(10, 6),
        mpu_gyro_y DECIMAL(10, 6),
        mpu_gyro_z DECIMAL(10, 6),
        mpu_tilt BOOLEAN DEFAULT false,
        mpu_cut_detected BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'ok',
        raw_payload JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ telemetry table created');

    // Create alerts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        tree_id INTEGER NOT NULL REFERENCES trees(tree_id),
        type VARCHAR(50) NOT NULL,
        level VARCHAR(20) DEFAULT 'medium',
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        acknowledged BOOLEAN DEFAULT false,
        ack_by INTEGER REFERENCES users(id),
        ack_at TIMESTAMP
      )
    `);
    console.log('✓ alerts table created');

    // Create settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT NOW(),
        updated_by INTEGER REFERENCES users(id)
      )
    `);
    console.log('✓ settings table created');

    // Seed default settings
    await pool.query(`
      INSERT INTO settings (key, value, description)
      VALUES 
        ('ppm_threshold', '400', 'PPM (tutun) ogohlantirish chegarasi')
      ON CONFLICT (key) DO NOTHING
    `);
    console.log('✓ default settings seeded');

    // Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_telemetry_tree_id ON telemetry(tree_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry(timestamp DESC)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_alerts_tree_id ON alerts(tree_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC)');
    console.log('✓ indexes created');

    // Seed default trees (if not exist)
    for (let i = 1; i <= 3; i++) {
      await pool.query(
        `INSERT INTO trees (tree_id, species, notes) 
         VALUES ($1, 'Unknown', 'Tree ${i}')
         ON CONFLICT (tree_id) DO NOTHING`,
        [i]
      );
    }
    console.log('✓ default trees seeded');

    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();

