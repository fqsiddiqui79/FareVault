export const WATCH_COLUMNS = `
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

export const LIST_WATCHES_SQL = `
  SELECT ${WATCH_COLUMNS}
  FROM watches
  ORDER BY created_at DESC
`;

export const GET_WATCH_BY_ID_SQL = `
  SELECT ${WATCH_COLUMNS}
  FROM watches
  WHERE id = $1
`;

export const CREATE_WATCH_SQL = `
  INSERT INTO watches (
    user_id,
    type,
    origin,
    destination,
    departure_date,
    target_price,
    alert_enabled
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING ${WATCH_COLUMNS}
`;

export const UPDATE_WATCH_SQL = (fieldsSql) => `
  UPDATE watches
  SET ${fieldsSql}
  WHERE id = $${fieldsSql.split(',').length + 1}
  RETURNING ${WATCH_COLUMNS}
`;

export const DELETE_WATCH_SQL = `
  DELETE FROM watches
  WHERE id = $1
  RETURNING id
`;
