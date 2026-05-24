import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { healthRouter } from './routes/healthRoutes.js';
import { watchRouter } from './routes/watchRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(env.apiPrefix, healthRouter);
app.use(env.apiPrefix, watchRouter);

app.use(notFound);
app.use(errorHandler);

export { app };
