import { Router } from 'express';
import { watchController } from '../controllers/watchController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const watchRouter = Router();

watchRouter.get('/watches', asyncHandler(watchController.list));
watchRouter.get('/watches/:id', asyncHandler(watchController.getById));
watchRouter.post('/watches', asyncHandler(watchController.create));
watchRouter.patch('/watches/:id', asyncHandler(watchController.update));
watchRouter.delete('/watches/:id', asyncHandler(watchController.remove));

export { watchRouter };
