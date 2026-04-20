// SENTRY: instrument.ts MUST be the first import. It initializes Sentry
// and patches Node.js modules for auto-instrumentation. Moving this
// import below express will break automatic HTTP/DB span capture.
import './instrument.js';

import express from 'express';
import cors from 'cors';
import * as Sentry from '@sentry/node';
import healthRouter from './routes/health.js';
import itemsRouter from './routes/items.js';

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api', healthRouter);
app.use('/api', itemsRouter);

// SENTRY: setupExpressErrorHandler MUST come after all routes but
// before any other error-handling middleware. It captures unhandled
// errors and attaches them to the active Sentry transaction.
Sentry.setupExpressErrorHandler(app);

// Generic error handler (after Sentry's)
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`backend listening on :${PORT}`);
});
