import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'scapear_bern',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Database initialization
export async function initDatabase() {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    
    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Create database tables
async function createTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Routes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS routes (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        estimated_duration VARCHAR(100),
        distance VARCHAR(100),
        difficulty VARCHAR(100),
        total_points INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Stops table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stops (
        id VARCHAR(255) PRIMARY KEY,
        route_id VARCHAR(255) REFERENCES routes(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        radius INTEGER DEFAULT 30,
        puzzle_type VARCHAR(255) NOT NULL,
        puzzle_data JSONB NOT NULL,
        reward_data JSONB NOT NULL,
        stop_order INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // User progress table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        route_id VARCHAR(255) REFERENCES routes(id),
        stop_id VARCHAR(255) REFERENCES stops(id),
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completion_time INTEGER, -- seconds
        points_earned INTEGER DEFAULT 0,
        puzzle_data JSONB,
        UNIQUE(user_id, route_id, stop_id)
      )
    `);
    
    // User route sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        route_id VARCHAR(255) REFERENCES routes(id),
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        total_time INTEGER, -- seconds
        total_points INTEGER DEFAULT 0,
        is_completed BOOLEAN DEFAULT false
      )
    `);
    
    // Leaderboard view
    await client.query(`
      CREATE OR REPLACE VIEW leaderboard_view AS
      SELECT 
        u.id as user_id,
        u.username,
        us.route_id,
        us.total_points,
        us.total_time,
        us.is_completed,
        us.completed_at,
        COUNT(up.id) as stops_completed,
        RANK() OVER (PARTITION BY us.route_id ORDER BY us.total_points DESC, us.total_time ASC) as rank
      FROM users u
      JOIN user_sessions us ON u.id = us.user_id
      LEFT JOIN user_progress up ON u.id = up.user_id AND us.route_id = up.route_id
      GROUP BY u.id, u.username, us.route_id, us.total_points, us.total_time, us.is_completed, us.completed_at
    `);
    
    await client.query('COMMIT');
    console.log('✅ Database tables created/verified successfully');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

export { pool };