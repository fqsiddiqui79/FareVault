import pg from 'pg';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const { Pool } = pg;

const ssl = env.pgSslMode === 'require' ? { rejectUnauthorized: false } : undefined;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl,
});

export const testDbConnection = async () => {
  const client = await pool.connect();

  try {
    await client.query('SELECT 1');
    logger.info('PostgreSQL connected successfully');
  } finally {
    client.release();
  }
};
