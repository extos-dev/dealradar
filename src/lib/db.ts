import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'gadgetpulse.db');
export const db = new Database(DB_PATH);

// Enable WAL mode and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      brand TEXT,
      category TEXT NOT NULL,            -- power_charging | smart_home | audio | desk_workspace
      gtin TEXT,                         -- UPC/EAN
      image_url TEXT,
      specs TEXT,                        -- JSON string
      verdict_text TEXT,                 -- editor-written
      pros TEXT,                         -- JSON array of strings
      cons TEXT,                         -- JSON array of strings
      best_for TEXT,
      avoid_if TEXT,
      tested INTEGER DEFAULT 0,          -- 1 if hands-on tested, 0 otherwise
      editor_rating INTEGER,             -- 1-5
      tested_disclosure TEXT,            -- 'purchased' | 'loaner: [brand]' | 'discounted'
      author_name TEXT,                  -- editorial attribution
      author_bio TEXT,
      status TEXT DEFAULT 'draft',       -- draft | approved | published | archived
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
      merchant TEXT NOT NULL,            -- amazon | walmart | bestbuy | ebay
      merchant_sku TEXT NOT NULL,        -- ASIN, item id
      affiliate_url TEXT NOT NULL,
      current_price REAL,
      lowest_used_price REAL,            -- for Amazon comparison format compliance
      in_stock INTEGER DEFAULT 1,
      rating REAL,
      review_count INTEGER,
      price_checked_at TEXT,
      UNIQUE (merchant, merchant_sku)
    );

    CREATE TABLE IF NOT EXISTS price_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      offer_id TEXT REFERENCES offers(id) ON DELETE CASCADE,
      price REAL NOT NULL,
      captured_at TEXT NOT NULL,
      source TEXT NOT NULL               -- backfill | api | manual
    );

    CREATE INDEX IF NOT EXISTS idx_price_points_offer_date ON price_points (offer_id, captured_at DESC);

    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      intro TEXT,
      published INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS collection_items (
      collection_id TEXT REFERENCES collections(id) ON DELETE CASCADE,
      product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
      position INTEGER,
      editor_note TEXT,
      PRIMARY KEY (collection_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      confirmation_token TEXT,
      confirmed_at TEXT,
      unsubscribed_at TEXT,
      signup_source TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      subscriber_id TEXT REFERENCES subscribers(id) ON DELETE CASCADE,
      product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
      target_price REAL NOT NULL,
      last_notified_at TEXT,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT,
      offer_id TEXT,
      merchant TEXT,
      src TEXT,
      campaign TEXT,
      variant TEXT,
      page TEXT,
      session_hash TEXT,
      is_bot INTEGER DEFAULT 0,
      clicked_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Automatically initialize schema on module load
initSchema();
