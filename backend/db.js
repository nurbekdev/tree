/*
 * Database connection and utilities
 */

const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'tree_monitor',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

let initialized = false;

async function init() {
  if (initialized) return;
  
  // Test connection
  try {
    await pool.query('SELECT NOW()');
    initialized = true;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

async function seedDefaultUser() {
  try {
    // Check if admin user exists
    const result = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    
    if (result.rows.length === 0) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
        ['admin', hashedPassword, 'admin']
      );
      console.log('Default admin user created (username: admin, password: admin123)');
      console.log('⚠️  WARNING: Change default password in production!');
    }
  } catch (error) {
    console.error('Error seeding default user:', error);
  }
}

module.exports = {
  pool,
  init,
  seedDefaultUser
};

