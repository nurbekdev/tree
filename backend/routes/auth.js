/*
 * Authentication Routes
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const router = express.Router();

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, username, password_hash, role FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get IP address and user agent
    const ipAddress = req.ip || 
                     req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.connection.remoteAddress ||
                     req.socket.remoteAddress ||
                     'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Create session record
    try {
      await pool.query(
        `INSERT INTO user_sessions (user_id, ip_address, user_agent, login_time, last_activity, is_active)
         VALUES ($1, $2, $3, NOW(), NOW(), true)`,
        [user.id, ipAddress, userAgent]
      );
    } catch (sessionError) {
      // Log error but don't fail login if session table doesn't exist
      console.warn('Failed to create session record:', sessionError.message);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

