/*
 * Settings Routes
 * Manage system settings (PPM threshold, etc.)
 */

const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/v1/settings - Get all settings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT key, value, description, updated_at FROM settings ORDER BY key'
    );

    // Convert to key-value object
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = {
        value: row.value,
        description: row.description,
        updated_at: row.updated_at
      };
    });

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/settings/esp8266/config - Get ESP8266 configuration (Backend URL and API Key)
// This must come before /:key route to avoid matching "esp8266" as a key
router.get('/esp8266/config', async (req, res) => {
  try {
    // Get backend URL from environment or construct from request
    const backendUrl = process.env.BACKEND_URL || 
                      process.env.API_URL || 
                      `${req.protocol}://${req.get('host')}`;
    
    // Get API key from environment (only first 10 chars for display, full key for copy)
    const apiKey = process.env.API_KEY || '';
    
    res.json({
      backend_url: backendUrl,
      api_key: apiKey,
      api_key_preview: apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : 'Not set',
      telemetry_endpoint: `${backendUrl}/api/v1/telemetry`,
      header_name: 'X-API-Key'
    });
  } catch (error) {
    console.error('Error fetching ESP8266 config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/settings/:key - Get specific setting
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;

    const result = await pool.query(
      'SELECT key, value, description, updated_at FROM settings WHERE key = $1',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/v1/settings/:key - Update setting
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const userId = req.user.id;

    if (value === undefined || value === null) {
      return res.status(400).json({ error: 'Value is required' });
    }

    // Validate PPM threshold
    if (key === 'ppm_threshold') {
      const ppmValue = parseInt(value);
      if (isNaN(ppmValue) || ppmValue < 0 || ppmValue > 10000) {
        return res.status(400).json({ error: 'PPM threshold must be between 0 and 10000' });
      }
    }

    // Check if setting exists
    const existing = await pool.query(
      'SELECT id FROM settings WHERE key = $1',
      [key]
    );

    let result;
    if (existing.rows.length === 0) {
      // Create new setting
      result = await pool.query(
        `INSERT INTO settings (key, value, updated_by, updated_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING key, value, description, updated_at`,
        [key, String(value), userId]
      );
    } else {
      // Update existing setting
      result = await pool.query(
        `UPDATE settings 
         SET value = $1, updated_by = $2, updated_at = NOW()
         WHERE key = $3
         RETURNING key, value, description, updated_at`,
        [String(value), userId, key]
      );
    }

    if (result.rows.length === 0) {
      return res.status(500).json({ error: 'Failed to update setting' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating setting:', error);
    
    // Handle database errors
    if (error.code === '42P01') { // Table does not exist
      return res.status(500).json({ 
        error: 'Settings table does not exist. Please run migration: node scripts/migrate.js' 
      });
    }
    
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;

