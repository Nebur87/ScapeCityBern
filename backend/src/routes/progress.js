import express from 'express';
import { pool } from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateGeofenceWithTolerance } from '../utils/geolocation.js';

const router = express.Router();

// GET /api/progress/:userId/:routeId - Get user progress for a route
router.get('/:userId/:routeId', authenticateToken, async (req, res) => {
  try {
    const { userId, routeId } = req.params;

    // Check if user can access this data (own data or admin)
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get user session for this route
    const sessionResult = await pool.query(`
      SELECT * FROM user_sessions 
      WHERE user_id = $1 AND route_id = $2
      ORDER BY started_at DESC
      LIMIT 1
    `, [userId, routeId]);

    // Get completed stops
    const progressResult = await pool.query(`
      SELECT 
        up.*,
        s.name as stop_name,
        s.stop_order
      FROM user_progress up
      JOIN stops s ON up.stop_id = s.id
      WHERE up.user_id = $1 AND up.route_id = $2
      ORDER BY s.stop_order ASC
    `, [userId, routeId]);

    const session = sessionResult.rows[0] || null;
    const completedStops = progressResult.rows;

    res.json({
      session,
      completedStops,
      totalCompleted: completedStops.length,
      totalPoints: completedStops.reduce((sum, stop) => sum + (stop.points_earned || 0), 0)
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// POST /api/progress/:userId/start - Start a new route session
router.post('/:userId/start', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { routeId } = req.body;

    // Check if user can start this session
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if route exists
    const routeResult = await pool.query(
      'SELECT * FROM routes WHERE id = $1 AND is_active = true',
      [routeId]
    );

    if (routeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // Check if user already has an active session
    const existingSession = await pool.query(`
      SELECT * FROM user_sessions 
      WHERE user_id = $1 AND route_id = $2 AND is_completed = false
    `, [userId, routeId]);

    if (existingSession.rows.length > 0) {
      return res.json({
        message: 'Session already exists',
        session: existingSession.rows[0]
      });
    }

    // Create new session
    const sessionResult = await pool.query(`
      INSERT INTO user_sessions (user_id, route_id)
      VALUES ($1, $2)
      RETURNING *
    `, [userId, routeId]);

    res.status(201).json({
      message: 'Route session started',
      session: sessionResult.rows[0]
    });
  } catch (error) {
    console.error('Error starting route:', error);
    res.status(500).json({ error: 'Failed to start route' });
  }
});

// POST /api/progress/:userId/complete - Complete a stop
router.post('/:userId/complete', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { routeId, stopId, userLocation, puzzleData } = req.body;

    // Check if user can complete this stop
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate input
    if (!routeId || !stopId || !userLocation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get stop details
    const stopResult = await pool.query(
      'SELECT * FROM stops WHERE id = $1 AND route_id = $2',
      [stopId, routeId]
    );

    if (stopResult.rows.length === 0) {
      return res.status(404).json({ error: 'Stop not found' });
    }

    const stop = stopResult.rows[0];

    // Validate geofence
    const isWithinGeofence = validateGeofenceWithTolerance(
      userLocation.latitude,
      userLocation.longitude,
      parseFloat(stop.latitude),
      parseFloat(stop.longitude),
      stop.radius
    );

    if (!isWithinGeofence) {
      return res.status(400).json({ 
        error: 'Not within geofence', 
        message: `You must be within ${stop.radius}m of ${stop.name}` 
      });
    }

    // Check if already completed
    const existingProgress = await pool.query(
      'SELECT * FROM user_progress WHERE user_id = $1 AND route_id = $2 AND stop_id = $3',
      [userId, routeId, stopId]
    );

    if (existingProgress.rows.length > 0) {
      return res.status(409).json({ error: 'Stop already completed' });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Record progress
      const progressResult = await client.query(`
        INSERT INTO user_progress (user_id, route_id, stop_id, points_earned, puzzle_data)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [userId, routeId, stopId, stop.reward_data.points || 0, puzzleData]);

      // Update session
      await client.query(`
        UPDATE user_sessions 
        SET 
          total_points = total_points + $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2 AND route_id = $3
      `, [stop.reward_data.points || 0, userId, routeId]);

      // Check if route is completed
      const totalStopsResult = await client.query(
        'SELECT COUNT(*) as total FROM stops WHERE route_id = $1',
        [routeId]
      );
      
      const completedStopsResult = await client.query(
        'SELECT COUNT(*) as completed FROM user_progress WHERE user_id = $1 AND route_id = $2',
        [userId, routeId]
      );

      const totalStops = parseInt(totalStopsResult.rows[0].total);
      const completedStops = parseInt(completedStopsResult.rows[0].completed);

      if (completedStops === totalStops) {
        // Mark session as completed
        await client.query(`
          UPDATE user_sessions 
          SET 
            is_completed = true,
            completed_at = CURRENT_TIMESTAMP,
            total_time = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at))
          WHERE user_id = $1 AND route_id = $2
        `, [userId, routeId]);
      }

      await client.query('COMMIT');

      res.json({
        message: 'Stop completed successfully',
        progress: progressResult.rows[0],
        reward: stop.reward_data,
        routeCompleted: completedStops === totalStops
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error completing stop:', error);
    res.status(500).json({ error: 'Failed to complete stop' });
  }
});

export default router;