import jwt from 'jsonwebtoken';
import { pool } from '../models/database.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Verify user still exists
    try {
      const result = await pool.query(
        'SELECT id, username, email FROM users WHERE id = $1',
        [user.userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'User not found' });
      }
      
      req.user = result.rows[0];
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  });
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return next();
    }

    try {
      const result = await pool.query(
        'SELECT id, username, email FROM users WHERE id = $1',
        [user.userId]
      );
      
      if (result.rows.length > 0) {
        req.user = result.rows[0];
      }
      
      next();
    } catch (error) {
      console.error('Optional auth error:', error);
      next();
    }
  });
}