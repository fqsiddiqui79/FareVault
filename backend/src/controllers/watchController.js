import {
  createWatch,
  deleteWatch,
  getWatchById,
  listWatches,
  updateWatch,
} from '../services/watchService.js';

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getWatchesController = asyncHandler(async (_req, res) => {
  const watches = await listWatches();
  res.status(200).json({ success: true, data: watches });
});

export const getWatchByIdController = asyncHandler(async (req, res) => {
  const watch = await getWatchById(req.params.id);
  res.status(200).json({ success: true, data: watch });
});

export const createWatchController = asyncHandler(async (req, res) => {
  const watch = await createWatch(req.body);
  res.status(201).json({ success: true, data: watch });
});

export const updateWatchController = asyncHandler(async (req, res) => {
  const watch = await updateWatch(req.params.id, req.body);
  res.status(200).json({ success: true, data: watch });
});

export const deleteWatchController = asyncHandler(async (req, res) => {
  await deleteWatch(req.params.id);
  res.status(204).send();
});
