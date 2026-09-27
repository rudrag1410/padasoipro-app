import { API_PREFIX } from '@padosipro/shared';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';
import type { Container } from './container';
import { errorHandler, notFoundHandler } from './middlewares';
import { apiRouter } from './routes';

export function createApp(container: Container, httpLogger?: Logger): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: container.config.CORS_ORIGINS }));
  app.use(express.json({ limit: '20kb' }));
  if (httpLogger) app.use(pinoHttp({ logger: httpLogger, autoLogging: { ignore: (req) => req.url === `${API_PREFIX}/health` } }));

  app.use(API_PREFIX, apiRouter(container));
  app.use(notFoundHandler);
  app.use(errorHandler(container.logger));

  return app;
}
