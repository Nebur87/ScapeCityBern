import express from 'express';
import { pool } from '../models/database.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/routes - Get all available routes
router.get('/', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.*,
        COUNT(s.id) as total_stops
      FROM routes r
      LEFT JOIN stops s ON r.id = s.route_id
      WHERE r.is_active = true
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// GET /api/routes/:id - Get route details with stops
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get route details
    const routeResult = await pool.query(
      'SELECT * FROM routes WHERE id = $1 AND is_active = true',
      [id]
    );

    if (routeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // Get stops for this route
    const stopsResult = await pool.query(`
      SELECT 
        id,
        name,
        description,
        latitude,
        longitude,
        radius,
        puzzle_type,
        puzzle_data,
        reward_data,
        stop_order
      FROM stops 
      WHERE route_id = $1 
      ORDER BY stop_order ASC
    `, [id]);

    const route = {
      ...routeResult.rows[0],
      stops: stopsResult.rows.map(stop => ({
        ...stop,
        coordinates: {
          lat: parseFloat(stop.latitude),
          lng: parseFloat(stop.longitude)
        },
        puzzle: stop.puzzle_data,
        reward: stop.reward_data
      }))
    };

    // If user is authenticated, get their progress
    if (req.user) {
      const progressResult = await pool.query(`
        SELECT stop_id, completed_at, points_earned
        FROM user_progress 
        WHERE user_id = $1 AND route_id = $2
      `, [req.user.id, id]);

      const completedStops = progressResult.rows.map(p => p.stop_id);
      route.userProgress = {
        completedStops,
        totalCompleted: completedStops.length
      };
    }

    res.json(route);
  } catch (error) {
    console.error('Error fetching route details:', error);
    res.status(500).json({ error: 'Failed to fetch route details' });
  }
});

export default router;