import { pool } from '../db/postgres.js';

const baseColumns = `
  id,
  user_id,
  type,
  origin,
  destination,
  travel_date,
  hotel_name,
  hotel_city,
  alert_enabled,
  alert_threshold_pct,
  created_at
`;

export const watchService = {
  async listWatches() {
    const { rows } = await pool.query(`SELECT ${baseColumns} FROM watches ORDER BY created_at DESC`);
    return rows;
  },

  async getWatchById(id) {
    const { rows } = await pool.query(`SELECT ${baseColumns} FROM watches WHERE id = $1 LIMIT 1`, [id]);
    return rows[0] ?? null;
  },

  async createWatch(payload) {
    const {
      userId,
      type,
      origin = null,
      destination = null,
      travelDate = null,
      hotelName = null,
      hotelCity = null,
      alertEnabled = true,
      alertThresholdPct = 5,
    } = payload;

    const { rows } = await pool.query(
      `INSERT INTO watches (
        user_id, type, origin, destination, travel_date, hotel_name, hotel_city, alert_enabled, alert_threshold_pct
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING ${baseColumns}`,
      [userId, type, origin, destination, travelDate, hotelName, hotelCity, alertEnabled, alertThresholdPct],
    );

    return rows[0];
  },

  async updateWatch(id, payload) {
    const existing = await this.getWatchById(id);
    if (!existing) return null;

    const next = {
      type: payload.type ?? existing.type,
      origin: payload.origin ?? existing.origin,
      destination: payload.destination ?? existing.destination,
      travel_date: payload.travelDate ?? existing.travel_date,
      hotel_name: payload.hotelName ?? existing.hotel_name,
      hotel_city: payload.hotelCity ?? existing.hotel_city,
      alert_enabled: payload.alertEnabled ?? existing.alert_enabled,
      alert_threshold_pct: payload.alertThresholdPct ?? existing.alert_threshold_pct,
    };

    const { rows } = await pool.query(
      `UPDATE watches
       SET type = $2,
           origin = $3,
           destination = $4,
           travel_date = $5,
           hotel_name = $6,
           hotel_city = $7,
           alert_enabled = $8,
           alert_threshold_pct = $9
       WHERE id = $1
       RETURNING ${baseColumns}`,
      [id, next.type, next.origin, next.destination, next.travel_date, next.hotel_name, next.hotel_city, next.alert_enabled, next.alert_threshold_pct],
    );

    return rows[0];
  },

  async deleteWatch(id) {
    const { rowCount } = await pool.query('DELETE FROM watches WHERE id = $1', [id]);
    return rowCount > 0;
  },
};
