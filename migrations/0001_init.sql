-- DEAL WEBSITE MVP — CLOUDFLARE D1 / SQLITE SCHEMA
-- =========================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------
-- 1. MERCHANTS
-- Stores each source website or marketplace.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS merchants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,

  base_url TEXT,
  logo_url TEXT,
  country_code TEXT DEFAULT 'MA',
  currency_code TEXT NOT NULL DEFAULT 'MAD',

  affiliate_program TEXT,
  affiliate_network TEXT,

  is_active INTEGER NOT NULL DEFAULT 1,
  crawl_enabled INTEGER NOT NULL DEFAULT 1,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------
-- 2. CATEGORIES
-- Supports one level of nesting.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,

  parent_id INTEGER REFERENCES categories(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_categories_parent
ON categories(parent_id);

CREATE INDEX IF NOT EXISTS idx_categories_slug
ON categories(slug);

-- ---------------------------------------------------------
-- 3. BRANDS
-- Optional, but useful for filters and search.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,

  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------
-- 4. PRODUCTS
-- Canonical product identity.
-- One product may have multiple offers.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  external_key TEXT NOT NULL UNIQUE,

  title TEXT NOT NULL,
  normalized_title TEXT,

  brand_id INTEGER REFERENCES brands(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  category_id INTEGER REFERENCES categories(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  image_url TEXT,
  description TEXT,

  rating REAL,
  reviews_count INTEGER,

  is_active INTEGER NOT NULL DEFAULT 1,

  search_synced_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_category
ON products(category_id);

CREATE INDEX IF NOT EXISTS idx_products_brand
ON products(brand_id);

CREATE INDEX IF NOT EXISTS idx_products_title
