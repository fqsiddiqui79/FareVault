import { AppError } from '../utils/AppError.js';

const WATCH_TYPES = new Set(['flight', 'hotel', 'package']);

const toBoolean = (value, fieldName) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new AppError(`Invalid ${fieldName}. Must be a boolean value.`, 400);
};

const normalizeString = (value, fieldName, { required = true } = {}) => {
  if (value === undefined || value === null) {
    if (required) {
      throw new AppError(`${fieldName} is required.`, 400);
    }

    return undefined;
  }

  if (typeof value !== 'string') {
    throw new AppError(`${fieldName} must be a string.`, 400);
  }

  const trimmed = value.trim();

  if (required && !trimmed) {
    throw new AppError(`${fieldName} cannot be empty.`, 400);
  }

  if (!required && !trimmed) {
    return undefined;
  }

  return trimmed;
};

const normalizeTargetPrice = (value, { required = true } = {}) => {
  if (value === undefined || value === null) {
    if (required) {
      throw new AppError('target_price is required.', 400);
    }

    return undefined;
  }

  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new AppError('target_price must be a positive number.', 400);
  }

  return numeric;
};

const normalizeDate = (value, { required = true } = {}) => {
  if (value === undefined || value === null) {
    if (required) {
      throw new AppError('departure_date is required.', 400);
    }

    return undefined;
  }

  if (typeof value !== 'string') {
    throw new AppError('departure_date must be a string in YYYY-MM-DD format.', 400);
  }

  const trimmed = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new AppError('departure_date must be in YYYY-MM-DD format.', 400);
  }

  const parsed = new Date(`${trimmed}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== trimmed) {
    throw new AppError('departure_date is not a valid calendar date.', 400);
  }

  return trimmed;
};

export const validateWatchPayload = (payload, { partial = false } = {}) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new AppError('Request body must be a valid JSON object.', 400);
  }

  const normalized = {};

  if (!partial || payload.user_id !== undefined) {
    const userId = Number(payload.user_id);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new AppError('user_id must be a positive integer.', 400);
    }
    normalized.user_id = userId;
  }

  if (!partial || payload.type !== undefined) {
    const watchType = normalizeString(payload.type, 'type', { required: !partial || payload.type !== undefined });
    if (watchType && !WATCH_TYPES.has(watchType)) {
      throw new AppError('type must be one of: flight, hotel, package.', 400);
    }
    if (watchType) {
      normalized.type = watchType;
    }
  }

  if (!partial || payload.origin !== undefined) {
    const origin = normalizeString(payload.origin, 'origin', { required: !partial || payload.origin !== undefined });
    if (origin !== undefined) {
      normalized.origin = origin;
    }
  }

  if (!partial || payload.destination !== undefined) {
    const destination = normalizeString(payload.destination, 'destination', { required: !partial || payload.destination !== undefined });
    if (destination !== undefined) {
      normalized.destination = destination;
    }
  }

  if (!partial || payload.departure_date !== undefined) {
    const departureDate = normalizeDate(payload.departure_date, { required: !partial || payload.departure_date !== undefined });
    if (departureDate !== undefined) {
      normalized.departure_date = departureDate;
    }
  }

  if (!partial || payload.target_price !== undefined) {
    const targetPrice = normalizeTargetPrice(payload.target_price, { required: !partial || payload.target_price !== undefined });
    if (targetPrice !== undefined) {
      normalized.target_price = targetPrice;
    }
  }

  if (!partial || payload.alert_enabled !== undefined) {
    normalized.alert_enabled = toBoolean(payload.alert_enabled, 'alert_enabled');
  }

  if (partial && Object.keys(normalized).length === 0) {
    throw new AppError('At least one valid field must be provided for update.', 400);
  }

  return normalized;
};
