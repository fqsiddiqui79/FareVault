import { AppError } from '../utils/AppError.js';
import { watchService } from '../services/watchService.js';

const allowedTypes = new Set(['flight', 'hotel', 'package']);

const validateCreate = (body) => {
  if (!body.userId) throw new AppError('userId is required', 400);
  if (!body.type || !allowedTypes.has(body.type)) {
    throw new AppError('type must be one of: flight, hotel, package', 400);
  }
};

export const watchController = {
  async list(_req, res) {
    const data = await watchService.listWatches();
    res.status(200).json({ success: true, data });
  },

  async getById(req, res) {
    const data = await watchService.getWatchById(req.params.id);
    if (!data) throw new AppError('Watch not found', 404);
    res.status(200).json({ success: true, data });
  },

  async create(req, res) {
    validateCreate(req.body);
    const data = await watchService.createWatch(req.body);
    res.status(201).json({ success: true, data });
  },

  async update(req, res) {
    if (req.body.type && !allowedTypes.has(req.body.type)) {
      throw new AppError('type must be one of: flight, hotel, package', 400);
    }

    const data = await watchService.updateWatch(req.params.id, req.body);
    if (!data) throw new AppError('Watch not found', 404);
    res.status(200).json({ success: true, data });
  },

  async remove(req, res) {
    const deleted = await watchService.deleteWatch(req.params.id);
    if (!deleted) throw new AppError('Watch not found', 404);
    res.status(204).send();
  },
};
