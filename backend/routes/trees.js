/*
 * Tree Management Routes
 */

const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// GET /api/v1/trees - List all trees with latest status
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        t.id, t.tree_id, t.species, t.planted_year, t.notes, 
        t.latitude, t.longitude, t.image_url, t.created_at, t.updated_at,
        t.last_seen_at, t.last_status,
        jsonb_build_object(
          'temp_c', tel.temp_c,
          'humidity_pct', tel.humidity_pct,
          'mq2', tel.mq2,
          'status', tel.status,
          'timestamp', tel.timestamp,
          'mpu_accel_x', tel.mpu_accel_x,
          'mpu_accel_y', tel.mpu_accel_y,
          'mpu_accel_z', tel.mpu_accel_z,
          'mpu_gyro_x', tel.mpu_gyro_x,
          'mpu_gyro_y', tel.mpu_gyro_y,
          'mpu_gyro_z', tel.mpu_gyro_z,
          'mpu_tilt', tel.mpu_tilt,
          'mpu_cut_detected', tel.mpu_cut_detected
        ) as last_telemetry
       FROM trees t
       LEFT JOIN LATERAL (
         SELECT temp_c, humidity_pct, mq2, status, timestamp,
                mpu_accel_x, mpu_accel_y, mpu_accel_z,
                mpu_gyro_x, mpu_gyro_y, mpu_gyro_z,
                mpu_tilt, mpu_cut_detected
         FROM telemetry
         WHERE telemetry.tree_id = t.tree_id
         ORDER BY timestamp DESC
         LIMIT 1
       ) tel ON true
       ORDER BY t.tree_id`
    );

    // Parse JSONB field and check if tree is online (last_seen_at within 30 seconds)
    // If data is 5-10 seconds old, still show it (grace period)
    const now = new Date()
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000)
    const tenSecondsAgo = new Date(now.getTime() - 10 * 1000)
    
    const trees = result.rows.map(row => {
      const lastSeenAt = row.last_seen_at ? new Date(row.last_seen_at) : null
      const isOnline = lastSeenAt && lastSeenAt > thirtySecondsAgo
      
      // Include telemetry if:
      // 1. Tree is online (within 30 seconds), OR
      // 2. Last seen was within 10 seconds (grace period for display)
      const shouldShowTelemetry = (isOnline || (lastSeenAt && lastSeenAt > tenSecondsAgo)) && 
                                   row.last_telemetry && 
                                   Object.keys(row.last_telemetry).length > 0
      
      const last_telemetry = shouldShowTelemetry ? row.last_telemetry : null
      
      return {
        ...row,
        last_telemetry
      }
    });

    res.json(trees);
  } catch (error) {
    console.error('Error fetching trees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/trees/:id - Get tree details with history
router.get('/:id', async (req, res) => {
  try {
    const treeId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    // Get tree details
    const treeResult = await pool.query(
      `SELECT * FROM trees WHERE id = $1 OR tree_id = $1`,
      [treeId]
    );

    if (treeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tree not found' });
    }

    const tree = treeResult.rows[0];

    // Get telemetry history
    const telemetryResult = await pool.query(
      `SELECT * FROM telemetry 
       WHERE tree_id = $1 
       ORDER BY timestamp DESC 
       LIMIT $2 OFFSET $3`,
      [tree.tree_id, limit, offset]
    );

    // Get alerts
    const alertsResult = await pool.query(
      `SELECT * FROM alerts 
       WHERE tree_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [tree.tree_id]
    );

    res.json({
      ...tree,
      telemetry: telemetryResult.rows,
      alerts: alertsResult.rows
    });
  } catch (error) {
    console.error('Error fetching tree details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/trees - Create new tree
router.post('/', async (req, res) => {
  try {
    const {
      tree_id,
      species,
      planted_year,
      notes,
      latitude,
      longitude,
      owner_contact,
      image_url
    } = req.body;

    if (!tree_id || tree_id < 1 || tree_id > 3) {
      return res.status(400).json({ error: 'tree_id must be 1, 2, or 3' });
    }

    // Check if tree_id already exists
    const checkResult = await pool.query(
      'SELECT id FROM trees WHERE tree_id = $1',
      [tree_id]
    );

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Tree with this ID already exists' });
    }

    // Create new tree
    const result = await pool.query(
      `INSERT INTO trees (
        tree_id, species, planted_year, notes, 
        latitude, longitude, owner_contact, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [tree_id, species, planted_year, notes, latitude, longitude, owner_contact, image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating tree:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/v1/trees/:id - Update tree metadata
router.put('/:id', async (req, res) => {
  try {
    const treeId = parseInt(req.params.id);
    const {
      species,
      planted_year,
      notes,
      latitude,
      longitude,
      owner_contact,
      image_url
    } = req.body;

    // Check if tree exists
    const checkResult = await pool.query(
      'SELECT id FROM trees WHERE id = $1 OR tree_id = $1',
      [treeId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tree not found' });
    }

    // Update tree
    const updateResult = await pool.query(
      `UPDATE trees 
       SET species = COALESCE($1, species),
           planted_year = COALESCE($2, planted_year),
           notes = COALESCE($3, notes),
           latitude = COALESCE($4, latitude),
           longitude = COALESCE($5, longitude),
           owner_contact = COALESCE($6, owner_contact),
           image_url = COALESCE($7, image_url),
           updated_at = NOW()
       WHERE id = $8 OR tree_id = $8
       RETURNING *`,
      [species, planted_year, notes, latitude, longitude, owner_contact, image_url, treeId]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Error updating tree:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

