import express from 'express';
import { pool } from '../models/database.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/leaderboard/:routeId - Get leaderboard for a route
router.get('/:routeId', optionalAuth, async (req, res) => {
  try {
    const { routeId } = req.params;
    const { timeframe = 'all' } = req.query; // 'all', 'week', 'month'

    let timeFilter = '';
    if (timeframe === 'week') {
      timeFilter = "AND us.started_at >= NOW() - INTERVAL '7 days'";
    } else if (timeframe === 'month') {
      timeFilter = "AND us.started_at >= NOW() - INTERVAL '30 days'";
    }

    const query = `
      SELECT 
        u.id as user_id,
        u.username,
        us.total_points,
        us.total_time,
        us.is_completed,
        us.completed_at,
        COUNT(up.id) as stops_completed,
        ROW_NUMBER() OVER (
          ORDER BY 
            us.is_completed DESC, 
            us.total_points DESC, 
            us.total_time ASC NULLS LAST,
            us.started_at ASC
        ) as rank
      FROM users u
      JOIN user_sessions us ON u.id = us.user_id
      LEFT JOIN user_progress up ON u.id = up.user_id AND us.route_id = up.route_id
      WHERE us.route_id = $1 ${timeFilter}
      GROUP BY u.id, u.username, us.total_points, us.total_time, us.is_completed, us.completed_at, us.started_at
      ORDER BY 
        us.is_completed DESC, 
        us.total_points DESC, 
        us.total_time ASC NULLS LAST,
        us.started_at ASC
      LIMIT 100
    `;

    const result = await pool.query(query, [routeId]);

    // Format the results
    const leaderboard = result.rows.map(row => ({
      rank: parseInt(row.rank),
      userId: row.user_id,
      username: row.username,
      totalPoints: row.total_points || 0,
      totalTime: row.total_time,
      isCompleted: row.is_completed,
      completedAt: row.completed_at,
      stopsCompleted: parseInt(row.stops_completed),
      formattedTime: row.total_time ? formatTime(row.total_time) : null
    }));

    // If user is authenticated, find their position
    let userPosition = null;
    if (req.user) {
      const userEntry = leaderboard.find(entry => entry.userId === req.user.id);
      userPosition = userEntry ? userEntry.rank : null;
    }

    res.json({
      leaderboard,
      userPosition,
      timeframe,
      totalEntries: leaderboard.length
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/leaderboard/:routeId/stats - Get route statistics
router.get('/:routeId/stats', async (req, res) => {
  try {
    const { routeId } = req.params;

    const statsQuery = `
      SELECT 
        COUNT(DISTINCT us.user_id) as total_players,
        COUNT(CASE WHEN us.is_completed THEN 1 END) as completed_players,
        AVG(us.total_time) FILTER (WHERE us.is_completed) as avg_completion_time,
        MIN(us.total_time) FILTER (WHERE us.is_completed) as best_time,
        MAX(us.total_points) as highest_score,
        AVG(us.total_points) as average_score
      FROM user_sessions us
      WHERE us.route_id = $1
    `;

    const result = await pool.query(statsQuery, [routeId]);
    const stats = result.rows[0];

    // Get popular stops (most completed)
    const popularStopsQuery = `
      SELECT 
        s.id,
        s.name,
        COUNT(up.id) as completion_count
      FROM stops s
      LEFT JOIN user_progress up ON s.id = up.stop_id
      WHERE s.route_id = $1
      GROUP BY s.id, s.name
      ORDER BY completion_count DESC
      LIMIT 5
    `;

    const popularStopsResult = await pool.query(popularStopsQuery, [routeId]);

    res.json({
      totalPlayers: parseInt(stats.total_players) || 0,
      completedPlayers: parseInt(stats.completed_players) || 0,
      completionRate: stats.total_players > 0 
        ? ((stats.completed_players / stats.total_players) * 100).toFixed(1)
        : 0,
      avgCompletionTime: stats.avg_completion_time ? formatTime(stats.avg_completion_time) : null,
      bestTime: stats.best_time ? formatTime(stats.best_time) : null,
      highestScore: parseInt(stats.highest_score) || 0,
      averageScore: Math.round(parseFloat(stats.average_score)) || 0,
      popularStops: popularStopsResult.rows
    });
  } catch (error) {
    console.error('Error fetching route stats:', error);
    res.status(500).json({ error: 'Failed to fetch route statistics' });
  }
});

// Helper function to format time in seconds to readable format
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

export default router;