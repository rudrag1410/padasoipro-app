import { API_PREFIX } from '@padosipro/shared';
import { createApp } from './app';
import { loadConfig } from './config/env';
import { createContainer } from './container';
import { openDatabase } from './db/database';
import { seedCatalogue } from './db/seed/seed-catalogue';
import { createLogger } from './logger';

const config = loadConfig();
const logger = createLogger(config.NODE_ENV);

const db = openDatabase(config.DATABASE_PATH);
const seeded = seedCatalogue(db);
logger.info(`Catalogue ready: ${seeded.categories} categories, ${seeded.tasks} tasks`);

const container = createContainer(config, db, logger);
const app = createApp(container, logger);

const server = app.listen(config.PORT, '0.0.0.0', () => {
  logger.info(`PadosiPro API listening on http://localhost:${config.PORT}${API_PREFIX} (mail: ${config.MAIL_DRIVER})`);
});

function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
