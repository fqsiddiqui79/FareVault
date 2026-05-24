import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;

  if (statusCode >= 500) {
    logger.error(err);
  } else {
    logger.warn(err.message);
  }

  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  if (err.details) {
    response.details = err.details;
  }

  if (env.nodeEnv !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
