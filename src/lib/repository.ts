import { db } from './db';
import { calculateVerdict, VerdictResult } from './verdict';

export interface ProductRecord {
  id: string;
  slug: string;
  title: string;
  brand: string | null;
  category: string;
  gtin: string | null;
  image_url: string | null;
  specs: string | null;
  verdict_text: string | null;
  pros: string | null;
  cons: string | null;
  best_for: string | null;
  avoid_if: string | null;
  tested: number;
  editor_rating: number | null;
  tested_disclosure: string | null;
  author_name: string | null;
  author_bio: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface OfferRecord {
  id: string;
  product_id: string;
  merchant: string;
  merchant_sku: string;
  affiliate_url: string;
  current_price: number | null;
  lowest_used_price: number | null;
  in_stock: number;
  rating: number | null;
  review_count: number | null;
  price_checked_at: string | null;
}

export interface PricePointRecord {
  id: number;
  offer_id: string;
  price: number;
  captured_at: string;
  source: string;
}

export interface CollectionRecord {
  id: string;
  slug: string;
  title: string;
  intro: string | null;
  published: number;
  updated_at: string;
}

export interface ProductWithDetails extends ProductRecord {
  offers: OfferRecord[];
  pricePoints: PricePointRecord[];
  verdictResult?: VerdictResult;
}

export const ProductRepository = {
  getPublishedProducts(): ProductWithDetails[] {
    const products = db
      .prepare("SELECT * FROM products WHERE status = 'published' ORDER BY editor_rating DESC, created_at DESC")
      .all() as ProductRecord[];

    return products.map((prod) => this.hydrateProduct(prod));
  },

  getBySlug(slug: string): ProductWithDetails | null {
    const prod = db
      .prepare('SELECT * FROM products WHERE slug = ?')
      .get(slug) as ProductRecord | undefined;

    if (!prod) return null;
    return this.hydrateProduct(prod);
  },

  hydrateProduct(prod: ProductRecord): ProductWithDetails {
    const offers = db
      .prepare('SELECT * FROM offers WHERE product_id = ?')
      .all(prod.id) as OfferRecord[];

    const offerIds = offers.map((o) => o.id);
    let pricePoints: PricePointRecord[] = [];
    if (offerIds.length > 0) {
      const placeholders = offerIds.map(() => '?').join(',');
      pricePoints = db
        .prepare(`SELECT * FROM price_points WHERE offer_id IN (${placeholders}) ORDER BY captured_at ASC`)
        .all(...offerIds) as PricePointRecord[];
    }

    // Determine primary offer (best in-stock offer)
    const inStockOffers = offers.filter((o) => o.in_stock === 1 && o.current_price != null);
    const primaryOffer = inStockOffers.length > 0
      ? [...inStockOffers].sort((a, b) => (a.current_price ?? 999999) - (b.current_price ?? 999999))[0]
      : offers[0];

    const verdictResult = primaryOffer
      ? calculateVerdict({
          currentPrice: primaryOffer.current_price,
          priceCheckedAt: primaryOffer.price_checked_at,
          pricePoints: pricePoints.filter((p) => p.offer_id === primaryOffer.id),
        })
      : undefined;

    return {
      ...prod,
      offers,
      pricePoints,
      verdictResult,
    };
  },

  getDeals(): ProductWithDetails[] {
    const all = this.getPublishedProducts();
    // Only 'great_price' and 'good_price' appear in /deals
    return all.filter(
      (p) => p.verdictResult && (p.verdictResult.verdict === 'great_price' || p.verdictResult.verdict === 'good_price')
    );
  },

  getCollections(): CollectionRecord[] {
    return db.prepare("SELECT * FROM collections WHERE published = 1 ORDER BY updated_at DESC").all() as CollectionRecord[];
  },

  getCollectionBySlug(slug: string): (CollectionRecord & { products: (ProductWithDetails & { editor_note?: string })[] }) | null {
    const coll = db.prepare("SELECT * FROM collections WHERE slug = ? AND published = 1").get(slug) as CollectionRecord | undefined;
    if (!coll) return null;

    const items = db
      .prepare(`
        SELECT ci.editor_note, ci.position, p.*
        FROM collection_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.collection_id = ? AND p.status = 'published'
        ORDER BY ci.position ASC
      `)
      .all(coll.id) as any[];

    const products = items.map((item) => {
      const hydrated = this.hydrateProduct(item);
      return {
        ...hydrated,
        editor_note: item.editor_note,
      };
    });

    return {
      ...coll,
      products,
    };
  },
};
