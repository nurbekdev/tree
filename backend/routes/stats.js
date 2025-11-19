/*
 * Statistics Routes
 * Get system statistics for admin dashboard
 */

const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/v1/stats - Get system statistics
router.get('/', async (req, res) => {
  try {
    // Get total admins
    const adminsResult = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
    );
    const totalAdmins = parseInt(adminsResult.rows[0].count);

    // Get total users
    const usersResult = await pool.query(
      'SELECT COUNT(*) as count FROM users'
    );
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Get total trees
    const treesResult = await pool.query(
      'SELECT COUNT(*) as count FROM trees'
    );
    const totalTrees = parseInt(treesResult.rows[0].count);

    // Get total telemetry records
    const telemetryResult = await pool.query(
      'SELECT COUNT(*) as count FROM telemetry'
    );
    const totalTelemetry = parseInt(telemetryResult.rows[0].count);

    // Get unacknowledged alerts count
    const alertsResult = await pool.query(
      "SELECT COUNT(*) as count FROM alerts WHERE acknowledged = false"
    );
    const unacknowledgedAlerts = parseInt(alertsResult.rows[0].count);

    // Get total alerts
    const totalAlertsResult = await pool.query(
      'SELECT COUNT(*) as count FROM alerts'
    );
    const totalAlerts = parseInt(totalAlertsResult.rows[0].count);

    // Get online trees (last_seen_at within last 5 minutes)
    const onlineTreesResult = await pool.query(
      `SELECT COUNT(*) as count FROM trees 
       WHERE last_seen_at IS NOT NULL 
       AND last_seen_at > NOW() - INTERVAL '5 minutes'`
    );
    const onlineTrees = parseInt(onlineTreesResult.rows[0].count);

    // Get recent telemetry (last 24 hours)
    const recentTelemetryResult = await pool.query(
      `SELECT COUNT(*) as count FROM telemetry 
       WHERE timestamp > NOW() - INTERVAL '24 hours'`
    );
    const recentTelemetry = parseInt(recentTelemetryResult.rows[0].count);

    res.json({
      admins: totalAdmins,
      users: totalUsers,
      trees: totalTrees,
      onlineTrees,
      telemetry: totalTelemetry,
      recentTelemetry,
      alerts: totalAlerts,
      unacknowledgedAlerts
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

