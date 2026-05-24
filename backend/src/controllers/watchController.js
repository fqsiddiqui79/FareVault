import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createWatch,
  deleteWatch,
  getWatchById,
  listWatches,
  updateWatch,
} from '../services/watchService.js';
import { validateWatchPayload } from '../validators/watchValidator.js';

export const getWatchesController = asyncHandler(async (_req, res) => {
  const watches = await listWatches();
  res.status(200).json({ success: true, data: watches });
});

export const getWatchByIdController = asyncHandler(async (req, res) => {
  const watch = await getWatchById(req.params.id);
  res.status(200).json({ success: true, data: watch });
});

export const createWatchController = asyncHandler(async (req, res) => {
  const payload = validateWatchPayload(req.body);
  const watch = await createWatch(payload);

  res.status(201).json({ success: true, data: watch });
});

export const updateWatchController = asyncHandler(async (req, res) => {
  const payload = validateWatchPayload(req.body, { partial: true });
  const watch = await updateWatch(req.params.id, payload);

  res.status(200).json({ success: true, data: watch });
});

export const deleteWatchController = asyncHandler(async (req, res) => {
  await deleteWatch(req.params.id);
  res.status(204).send();
});
