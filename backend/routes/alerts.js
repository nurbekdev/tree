/*
 * Alert Management Routes
 */

const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// GET /api/v1/alerts - List alerts
router.get('/', async (req, res) => {
  try {
    const { tree_id, acknowledged, limit = 100 } = req.query;
    
    // Build query with JOIN to get username of user who acknowledged
    let query = `
      SELECT 
        a.*,
        u.username as ack_by_username
      FROM alerts a
      LEFT JOIN users u ON a.ack_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (tree_id) {
      paramCount++;
      query += ` AND a.tree_id = $${paramCount}`;
      params.push(parseInt(tree_id));
    }

    if (acknowledged !== undefined) {
      paramCount++;
      query += ` AND a.acknowledged = $${paramCount}`;
      params.push(acknowledged === 'true');
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramCount + 1}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/alerts/:id/acknowledge - Acknowledge alert
router.post('/:id/acknowledge', async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE alerts 
       SET acknowledged = true, ack_by = $1, ack_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [userId, alertId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Get username for the acknowledged alert
    const alertWithUser = await pool.query(
      `SELECT 
        a.*,
        u.username as ack_by_username
       FROM alerts a
       LEFT JOIN users u ON a.ack_by = u.id
       WHERE a.id = $1`,
      [alertId]
    );

    // Emit acknowledgment via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('alert_acknowledged', {
        id: alertId,
        acknowledged: true
      });
    }

    res.json(alertWithUser.rows[0]);
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

