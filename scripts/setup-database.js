const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const createTables = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Perfumes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS perfumes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(255) NOT NULL,
        year INTEGER,
        concentration VARCHAR(100),
        family VARCHAR(255),
        gender VARCHAR(50),
        perfumer VARCHAR(255),
        description TEXT,
        longevity VARCHAR(100),
        sillage VARCHAR(100),
        price_range VARCHAR(100),
        image_url VARCHAR(500),
        fragrantica_id VARCHAR(100) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Notes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(50) NOT NULL CHECK (category IN ('top', 'middle', 'base')),
        family VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Perfume notes junction table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS perfume_notes (
        id SERIAL PRIMARY KEY,
        perfume_id INTEGER REFERENCES perfumes(id) ON DELETE CASCADE,
        note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
        intensity DECIMAL(3,2) DEFAULT 1.0,
        UNIQUE(perfume_id, note_id)
      );
    `);

    // User profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        fragrance_dna JSONB,
        preferred_families JSONB,
        preferred_notes JSONB,
        contexts JSONB,
        performance_preferences JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Saved perfumes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_perfumes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        perfume_id INTEGER REFERENCES perfumes(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        notes TEXT,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, perfume_id)
      );
    `);

    // Recommendation history table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recommendation_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        session_id VARCHAR(255),
        recommendations JSONB,
        feedback JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_perfumes_brand ON perfumes(brand);
      CREATE INDEX IF NOT EXISTS idx_perfumes_family ON perfumes(family);
      CREATE INDEX IF NOT EXISTS idx_perfumes_gender ON perfumes(gender);
      CREATE INDEX IF NOT EXISTS idx_perfume_notes_perfume_id ON perfume_notes(perfume_id);
      CREATE INDEX IF NOT EXISTS idx_perfume_notes_note_id ON perfume_notes(note_id);
      CREATE INDEX IF NOT EXISTS idx_saved_perfumes_user_id ON saved_perfumes(user_id);
      CREATE INDEX IF NOT EXISTS idx_recommendation_history_user_id ON recommendation_history(user_id);
    `);

    console.log('✅ Database tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
    throw error;
  }
};

const createDatabase = async () => {
  try {
    // Connect to default postgres database to create our database
    const defaultPool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: 'postgres',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    await defaultPool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' created successfully!`);
    await defaultPool.end();
  } catch (error) {
    if (error.code === '42P04') {
      console.log(`✅ Database '${process.env.DB_NAME}' already exists!`);
    } else {
      console.error('❌ Error creating database:', error);
      throw error;
    }
  }
};

const setupDatabase = async () => {
  try {
    console.log('🚀 Setting up database...');
    await createDatabase();
    await createTables();
    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('💥 Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
