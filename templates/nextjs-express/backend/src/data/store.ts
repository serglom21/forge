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

const items: Item[] = [
  { id: 'item_1', name: 'Sample Item 1', description: 'A pre-seeded item for demo purposes', status: 'completed', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'item_2', name: 'Sample Item 2', description: 'Another pre-seeded item', status: 'completed', createdAt: new Date(Date.now() - 43200000).toISOString() },
  { id: 'item_3', name: 'Sample Item 3', description: 'A pending item', status: 'pending', createdAt: new Date().toISOString() },
];

export function getAllItems(): Item[] {
  return [...items];
}

export function getItemById(id: string): Item | undefined {
  return items.find(item => item.id === id);
}

export function createItem(data: { name: string; description: string }): Item {
  const item: Item = {
    id: `item_${Date.now()}`,
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
