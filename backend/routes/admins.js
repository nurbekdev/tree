/*
 * Admin Management Routes
 * CRUD operations for admin users
 */

const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Test route to verify admin routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Admin routes are working!', user: req.user });
});

// GET /api/v1/admins - Get all admins
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, role, created_at, updated_at 
       FROM users 
       WHERE role = 'admin'
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/admins/:id - Get admin by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, username, role, created_at, updated_at 
       FROM users 
       WHERE id = $1 AND role = 'admin'`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/admins - Create new admin
router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if username already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, role) 
       VALUES ($1, $2, 'admin') 
       RETURNING id, username, role, created_at, updated_at`,
      [username, passwordHash]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating admin:', error);
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    if (error.code === '23514') { // Check constraint violation
      return res.status(400).json({ error: 'Invalid data provided' });
    }
    
    // Generic error message
    const errorMessage = error.message || 'Internal server error';
    res.status(500).json({ error: errorMessage });
  }
});

// PUT /api/v1/admins/:id - Update admin
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    // Check if admin exists
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND role = $2',
      [id, 'admin']
    );

    if (existingAdmin.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (username) {
      // Check if new username already exists (excluding current user)
      const usernameCheck = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, id]
      );

      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      updates.push(`username = $${paramCount++}`);
      values.push(username);
    }

    if (password) {
      // Validate password strength
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramCount++}`);
      values.push(passwordHash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add updated_at
    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE users 
       SET ${updates.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING id, username, role, created_at, updated_at`,
      values
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/v1/admins/:id - Delete admin
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Check if admin exists
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND role = $2',
      [id, 'admin']
    );

    if (existingAdmin.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Delete admin
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/admins/sessions - Get all user sessions
router.get('/sessions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        s.id,
        s.user_id,
        u.username,
        s.ip_address,
        s.user_agent,
        s.login_time,
        s.last_activity,
        s.is_active
       FROM user_sessions s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.login_time DESC
       LIMIT 100`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    
    // If table doesn't exist, return empty array
    if (error.code === '42P01') {
      return res.json([]);
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

