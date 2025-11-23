/*
 * JWT Authentication Middleware
 */

const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('Auth: No token provided for', req.method, req.path);
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('Auth: JWT_SECRET is not set in environment variables!');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Auth: Token verification failed for', req.method, req.path, '- Error:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };

