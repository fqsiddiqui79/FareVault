import { Router } from 'express';
import {
  createWatchController,
  deleteWatchController,
  getWatchByIdController,
  getWatchesController,
  updateWatchController,
} from '../controllers/watchController.js';

const watchRouter = Router();

watchRouter.get('/watches', getWatchesController);
watchRouter.get('/watches/:id', getWatchByIdController);
watchRouter.post('/watches', createWatchController);
watchRouter.patch('/watches/:id', updateWatchController);
watchRouter.delete('/watches/:id', deleteWatchController);

export { watchRouter };
