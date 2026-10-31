import { describe, it, expect } from 'vitest';
import { db, initSchema } from './db';

describe('Database initialization', () => {
  it('creates tables successfully and connects', () => {
    initSchema();
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const tableNames = tables.map((t: any) => t.name);
    expect(tableNames).toContain('products');
    expect(tableNames).toContain('offers');
    expect(tableNames).toContain('price_points');
    expect(tableNames).toContain('collections');
    expect(tableNames).toContain('alerts');
  });
});
