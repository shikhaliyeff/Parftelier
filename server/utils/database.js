const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to run queries
const query = (text, params) => pool.query(text, params);

// Helper function to get a single row
const getOne = async (text, params) => {
  const result = await pool.query(text, params);
  return result.rows[0] || null;
};

// Helper function to get multiple rows
const getMany = async (text, params) => {
  const result = await pool.query(text, params);
  return result.rows;
};

// Helper function to insert and return the inserted row
const insert = async (text, params) => {
  const result = await pool.query(text, params);
  return result.rows[0];
};

// Helper function to update and return the updated row
const update = async (text, params) => {
  const result = await pool.query(text, params);
  return result.rows[0];
};

// Helper function to delete and return the deleted row
const remove = async (text, params) => {
  const result = await pool.query(text, params);
  return result.rows[0];
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  getOne,
  getMany,
  insert,
  update,
  remove,
  transaction
};
