import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { testDbConnection } from './db/postgres.js';

const startServer = async () => {
  try {
    await testDbConnection();

    app.listen(env.port, () => {
      logger.info(`FareVault backend listening on port ${env.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
