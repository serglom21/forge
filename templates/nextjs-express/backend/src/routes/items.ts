import { Router } from 'express';
import * as Sentry from '@sentry/node';
import { getAllItems, getItemById, createItem, updateItemStatus } from '../data/store.js';
import { simulateLatency, simulateExternalCall, simulateDbWrite } from '../simulate.js';

const router = Router();

// ─────────────────────────────────────────────────────────────
// GET /api/items — List all items
// ─────────────────────────────────────────────────────────────
router.get('/items', async (_req, res) => {
  const items = getAllItems();
  res.json(items);
});

// ─────────────────────────────────────────────────────────────
// GET /api/items/:id — Get a single item
// ─────────────────────────────────────────────────────────────
router.get('/items/:id', async (req, res) => {
  const item = getItemById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(item);
});

// ─────────────────────────────────────────────────────────────
// POST /api/items — Create a new item
//
// This is the main handler the generator instruments. It
// demonstrates a multi-step backend pipeline:
//   1. Validate input
//   2. Call an external service (auto-captured by SDK)
//   3. Persist to database (auto-captured by SDK)
//   4. Return result
//
// The FORGE markers below are where the generator injects
// Sentry instrumentation code derived from the selected patterns.
// ─────────────────────────────────────────────────────────────
router.post('/items', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'name and description are required' });
    }

    // FORGE:PARENT_SPAN

    // Step 1: Validate input
    await simulateLatency(10, 50);
    const isValid = name.length > 0 && description.length > 0;

    if (!isValid) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    // Step 2: External service call
    // SENTRY: The SDK's httpIntegration auto-captures this fetch as
    // an http.client span. No manual wrapping needed.
    // FORGE:SDK_ENHANCED_ATTRS:before_fetch
    const externalResult = await simulateExternalCall('authorize');

    // Step 3: Persist to database
    // SENTRY: The SDK auto-captures supported DB driver calls as
    // db.query spans. No manual wrapping needed.
    // FORGE:SDK_ENHANCED_ATTRS:before_query
    await simulateDbWrite({ name, description });

    // Step 4: Create the item
    const item = createItem({ name, description });
    updateItemStatus(item.id, 'completed');

    return res.status(201).json(item);
  } catch (error) {
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
