import { AppError } from '../utils/AppError.js';
import { watchService } from '../services/watchService.js';

const allowedTypes = new Set(['flight', 'hotel', 'package']);

const assertValidType = (type) => {
  if (!type || !allowedTypes.has(type)) {
    throw new AppError('type must be one of: flight, hotel, package', 400);
  }
};

const parseWatchId = (value) => {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('watch id must be a positive integer', 400);
  }

  return id;
};

const validateCreate = (body) => {
  if (!body?.userId) {
    throw new AppError('userId is required', 400);
  }

  assertValidType(body.type);
};

export const watchController = {
  async list(_req, res) {
    const data = await watchService.listWatches();
    res.status(200).json({ success: true, data });
  },

  async getById(req, res) {
    const watchId = parseWatchId(req.params.id);
    const data = await watchService.getWatchById(watchId);

    if (!data) {
      throw new AppError('Watch not found', 404);
    }

    res.status(200).json({ success: true, data });
  },

  async create(req, res) {
    validateCreate(req.body);

    const data = await watchService.createWatch(req.body);
    res.status(201).json({ success: true, data });
  },

  async update(req, res) {
    const watchId = parseWatchId(req.params.id);

    if (req.body?.type) {
      assertValidType(req.body.type);
    }

    const data = await watchService.updateWatch(watchId, req.body);
    if (!data) {
      throw new AppError('Watch not found', 404);
    }

    res.status(200).json({ success: true, data });
  },

  async remove(req, res) {
    const watchId = parseWatchId(req.params.id);
    const deleted = await watchService.deleteWatch(watchId);

    if (!deleted) {
      throw new AppError('Watch not found', 404);
    }

    res.status(204).send();
  },
};
