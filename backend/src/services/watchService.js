import { pool } from '../db/postgres.js';
import { AppError } from '../utils/AppError.js';

const WATCH_COLUMNS = `
  id,
  user_id,
  type,
  origin,
  destination,
  departure_date,
  target_price,
  alert_enabled,
  created_at
`;

const WATCH_TYPES = new Set(['flight', 'hotel', 'package']);

const parseId = (id) => {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError('id must be a positive integer.', 400);
  }
  return parsed;
};

const requireObject = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new AppError('Request body must be a valid JSON object.', 400);
  }
};

const requireString = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(`${field} must be a non-empty string.`, 400);
  }
  return value.trim();
};

const parsePositiveNumber = (value, field) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new AppError(`${field} must be a positive number.`, 400);
  }
  return numeric;
};

const parseBoolean = (value, field) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new AppError(`${field} must be a boolean.`, 400);
};

const parseDateString = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    throw new AppError('departure_date must be in YYYY-MM-DD format.', 400);
  }

  const date = value.trim();
  const parsed = new Date(`${date}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new AppError('departure_date is not a valid calendar date.', 400);
  }

  return date;
};

const validateCreatePayload = (payload) => {
  requireObject(payload);

  const userId = Number(payload.user_id);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError('user_id must be a positive integer.', 400);
  }

  const type = requireString(payload.type, 'type');
  if (!WATCH_TYPES.has(type)) {
    throw new AppError('type must be one of: flight, hotel, package.', 400);
  }

  return {
    user_id: userId,
    type,
    origin: requireString(payload.origin, 'origin'),
    destination: requireString(payload.destination, 'destination'),
    departure_date: parseDateString(payload.departure_date),
    target_price: parsePositiveNumber(payload.target_price, 'target_price'),
    alert_enabled: parseBoolean(payload.alert_enabled, 'alert_enabled'),
  };
};

const validateUpdatePayload = (payload) => {
  requireObject(payload);
  const normalized = {};

  if (payload.user_id !== undefined) {
    const userId = Number(payload.user_id);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new AppError('user_id must be a positive integer.', 400);
    }
    normalized.user_id = userId;
  }

  if (payload.type !== undefined) {
    const type = requireString(payload.type, 'type');
    if (!WATCH_TYPES.has(type)) {
      throw new AppError('type must be one of: flight, hotel, package.', 400);
    }
    normalized.type = type;
  }

  if (payload.origin !== undefined) normalized.origin = requireString(payload.origin, 'origin');
  if (payload.destination !== undefined) normalized.destination = requireString(payload.destination, 'destination');
  if (payload.departure_date !== undefined) normalized.departure_date = parseDateString(payload.departure_date);
  if (payload.target_price !== undefined) normalized.target_price = parsePositiveNumber(payload.target_price, 'target_price');
  if (payload.alert_enabled !== undefined) normalized.alert_enabled = parseBoolean(payload.alert_enabled, 'alert_enabled');

  if (Object.keys(normalized).length === 0) {
    throw new AppError('At least one valid field must be provided for update.', 400);
  }

  return normalized;
};

export const listWatches = async () => {
  const result = await pool.query(`SELECT ${WATCH_COLUMNS} FROM watches ORDER BY created_at DESC`);
  return result.rows;
};

export const getWatchById = async (id) => {
  const watchId = parseId(id);
  const result = await pool.query(`SELECT ${WATCH_COLUMNS} FROM watches WHERE id = $1`, [watchId]);
  if (result.rowCount === 0) throw new AppError('Watch not found.', 404);
  return result.rows[0];
};

export const createWatch = async (payload) => {
  const data = validateCreatePayload(payload);
  const values = [data.user_id, data.type, data.origin, data.destination, data.departure_date, data.target_price, data.alert_enabled];
  const result = await pool.query(
    `INSERT INTO watches (user_id, type, origin, destination, departure_date, target_price, alert_enabled)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${WATCH_COLUMNS}`,
    values,
  );

  return result.rows[0];
};

export const updateWatch = async (id, payload) => {
  const watchId = parseId(id);
  const data = validateUpdatePayload(payload);
  const entries = Object.entries(data);
  const setSql = entries.map(([field], idx) => `${field} = $${idx + 1}`).join(', ');
  const values = entries.map(([, v]) => v);

  const result = await pool.query(
    `UPDATE watches SET ${setSql} WHERE id = $${entries.length + 1} RETURNING ${WATCH_COLUMNS}`,
    [...values, watchId],
  );

  if (result.rowCount === 0) throw new AppError('Watch not found.', 404);
  return result.rows[0];
};

export const deleteWatch = async (id) => {
  const watchId = parseId(id);
  const result = await pool.query('DELETE FROM watches WHERE id = $1 RETURNING id', [watchId]);
  if (result.rowCount === 0) throw new AppError('Watch not found.', 404);
};
