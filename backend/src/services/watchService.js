import { pool } from '../db/postgres.js';
import { AppError } from '../utils/AppError.js';
import {
  CREATE_WATCH_SQL,
  DELETE_WATCH_SQL,
  GET_WATCH_BY_ID_SQL,
  LIST_WATCHES_SQL,
  UPDATE_WATCH_SQL,
} from '../queries/watchQueries.js';

const assertValidId = (id) => {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError('id must be a positive integer.', 400);
  }
  return parsed;
};

export const listWatches = async () => {
  const result = await pool.query(LIST_WATCHES_SQL);
  return result.rows;
};

export const getWatchById = async (id) => {
  const watchId = assertValidId(id);
  const result = await pool.query(GET_WATCH_BY_ID_SQL, [watchId]);

  if (result.rowCount === 0) {
    throw new AppError('Watch not found.', 404);
  }

  return result.rows[0];
};

export const createWatch = async (payload) => {
  const values = [
    payload.user_id,
    payload.type,
    payload.origin,
    payload.destination,
    payload.departure_date,
    payload.target_price,
    payload.alert_enabled,
  ];

  const result = await pool.query(CREATE_WATCH_SQL, values);
  return result.rows[0];
};

export const updateWatch = async (id, payload) => {
  const watchId = assertValidId(id);
  const entries = Object.entries(payload);

  const setClauses = entries.map(([field], index) => `${field} = $${index + 1}`);
  const values = entries.map(([, value]) => value);
  const sql = UPDATE_WATCH_SQL(setClauses.join(', '));

  const result = await pool.query(sql, [...values, watchId]);

  if (result.rowCount === 0) {
    throw new AppError('Watch not found.', 404);
  }

  return result.rows[0];
};

export const deleteWatch = async (id) => {
  const watchId = assertValidId(id);
  const result = await pool.query(DELETE_WATCH_SQL, [watchId]);

  if (result.rowCount === 0) {
    throw new AppError('Watch not found.', 404);
  }
};
