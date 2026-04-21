// Simple in-memory data store. No real database needed — this is a
// reference app for demonstrating Sentry instrumentation, not a
// production application.

export interface Item {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

const now = Date.now();
const HOUR = 3600000;
const DAY = 86400000;

const items: Item[] = [
  {
    id: 'item_8x2k9f',
    name: 'Q2 vendor payment — Globex Corp',
    description: 'Engineering services retainer, quarterly invoice #INV-2026-0847',
    status: 'completed',
    createdAt: new Date(now - 2 * HOUR).toISOString(),
  },
  {
    id: 'item_7m1p3q',
    name: 'Payroll batch #247',
    description: 'Monthly payroll — 142 employees, March 2026',
    status: 'processing',
    createdAt: new Date(now - 18 * 60000).toISOString(),
  },
  {
    id: 'item_6n4w8r',
    name: 'Office lease deposit — London',
    description: 'Expansion office lease deposit, HSBC London branch',
    status: 'completed',
    createdAt: new Date(now - 1 * DAY).toISOString(),
  },
  {
    id: 'item_5k9j2m',
    name: 'Vendor refund — CloudStack Inc',
    description: 'Over-billed infrastructure charges, ticket #CS-4419',
    status: 'pending',
    createdAt: new Date(now - 2 * DAY).toISOString(),
  },
  {
    id: 'item_4p7h1n',
    name: 'SaaS renewal — Datadog',
    description: 'Annual enterprise plan renewal',
    status: 'completed',
    createdAt: new Date(now - 3 * DAY).toISOString(),
  },
  {
    id: 'item_3r6t5v',
    name: 'Conference sponsorship — SentryConf',
    description: 'Gold tier sponsorship package, May 2026',
    status: 'completed',
    createdAt: new Date(now - 5 * DAY).toISOString(),
  },
];

export function getAllItems(): Item[] {
  return [...items];
}

export function getItemById(id: string): Item | undefined {
  return items.find(item => item.id === id);
}

export function createItem(data: { name: string; description: string }): Item {
  const item: Item = {
    id: `item_${Math.random().toString(36).slice(2, 8)}`,
    name: data.name,
    description: data.description,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  items.push(item);
  return item;
}

export function updateItemStatus(id: string, status: Item['status']): Item | undefined {
  const item = items.find(i => i.id === id);
  if (item) {
    item.status = status;
  }
  return item;
}
