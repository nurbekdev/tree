/*
 * Smart Tree Monitoring System - Backend API Server
 * Node.js + Express + PostgreSQL + Socket.IO
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const db = require('./db');
const authRoutes = require('./routes/auth');
const treeRoutes = require('./routes/trees');
const telemetryRoutes = require('./routes/telemetry');
const alertRoutes = require('./routes/alerts');
const adminRoutes = require('./routes/admins');
const statsRoutes = require('./routes/stats');
const settingsRoutes = require('./routes/settings');
const { authenticateToken } = require('./middleware/auth');
const { validateApiKey } = require('./middleware/apiKey');

const app = express();
const server = http.createServer(app);

// CORS configuration - allow all origins for development, or specific origin for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://172.20.10.3:3001',
      'http://172.20.10.3:3000',
      'http://64.225.20.211',
      'http://209.38.61.156'
    ].filter(Boolean);
    
    // Also allow if origin matches server's own domain
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log for debugging
      console.log('CORS: Origin not in allowed list:', origin, 'Allowed:', allowedOrigins);
      // In production, be more permissive - allow same-origin requests
      if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('64.225.20.211') || origin.includes('209.38.61.156'))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
};

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        console.log('Socket.IO: Allowing request with no origin');
        return callback(null, true);
      }
      
      console.log('Socket.IO: Checking origin:', origin);
      
      // In development, allow all origins
      if (process.env.NODE_ENV !== 'production') {
        console.log('Socket.IO: Development mode - allowing all origins');
        return callback(null, true);
      }
      
      // In production, check against allowed origins
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://172.20.10.3:3001',
        'http://172.20.10.3:3000',
        'http://64.225.20.211',
        'http://209.38.61.156'
      ].filter(Boolean);
      
      if (allowedOrigins.includes(origin)) {
        console.log('Socket.IO: Origin allowed:', origin);
        callback(null, true);
      } else {
        console.warn('Socket.IO: Origin not allowed:', origin, 'Allowed origins:', allowedOrigins);
        // In production, be more permissive - allow same-origin requests
        if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('64.225.20.211') || origin.includes('209.38.61.156'))) {
          console.log('Socket.IO: Allowing origin based on domain match:', origin);
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
    // Allow all headers
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors(corsOptions));
// Increase body size limit to 10MB for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/v1/auth', authRoutes);

// Public tree view endpoint (no authentication required)
app.get('/api/v1/public/trees/:id', async (req, res) => {
  try {
    const { pool } = require('./db');
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

    // Get latest telemetry
    const latestTelemetryResult = await pool.query(
      `SELECT * FROM telemetry 
       WHERE tree_id = $1 
       ORDER BY timestamp DESC 
       LIMIT 1`,
      [tree.tree_id]
    );

    // Get telemetry history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const telemetryResult = await pool.query(
      `SELECT * FROM telemetry 
       WHERE tree_id = $1 AND timestamp >= $2
       ORDER BY timestamp DESC 
       LIMIT $3 OFFSET $4`,
      [tree.tree_id, thirtyDaysAgo, limit, offset]
    );

    // Get alerts (last 30 days)
    const alertsResult = await pool.query(
      `SELECT * FROM alerts 
       WHERE tree_id = $1 AND created_at >= $2
       ORDER BY created_at DESC 
       LIMIT 50`,
      [tree.tree_id, thirtyDaysAgo]
    );

    // Check if tree is online (last_seen_at within 30 seconds)
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
    const lastSeenAt = tree.last_seen_at ? new Date(tree.last_seen_at) : null;
    const isOnline = lastSeenAt && lastSeenAt > thirtySecondsAgo;

    res.json({
      ...tree,
      isOnline,
      last_telemetry: latestTelemetryResult.rows[0] || null,
      telemetry: telemetryResult.rows,
      alerts: alertsResult.rows
    });
  } catch (error) {
    console.error('Error fetching public tree details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected routes (require authentication)
app.use('/api/v1/trees', authenticateToken, treeRoutes);
app.use('/api/v1/alerts', authenticateToken, alertRoutes);

// Admin routes (require admin role - middleware is inside the route files)
console.log('Registering admin routes...');
app.use('/api/v1/admins', adminRoutes);
console.log('Registering stats routes...');
app.use('/api/v1/stats', statsRoutes);
console.log('Registering settings routes...');
app.use('/api/v1/settings', settingsRoutes);

// Telemetry endpoint (requires API key, not JWT)
app.use('/api/v1/telemetry', validateApiKey, telemetryRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Initialize database and start server
async function start() {
  try {
    await db.init();
    console.log('Database connected');
    
    // Seed default admin user if not exists
    await db.seedDefaultUser();
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Key required for /api/v1/telemetry: ${process.env.API_KEY}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

module.exports = { app, io };

