import { app } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/db';
import { logger } from './utils/logger';

const PORT = env.PORT || 5000;

async function bootstrap() {
  await connectDatabase();

  const server = app.listen(PORT, () => {
    logger.info(`Enterprise Monthly Budget Tracker API running on http://localhost:${PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });

  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      logger.info('HTTP server and database connections closed. Process terminating.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap().catch((err) => {
    logger.error('Failed to bootstrap server', err);
    process.exit(1);
  });
}
