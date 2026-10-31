import { describe, it, expect, beforeEach } from 'vitest';
import { seedDatabase } from './seed';
import { ProductRepository } from './repository';

describe('Database Seeding & Product Repository', () => {
  beforeEach(() => {
    seedDatabase();
  });

  it('populates products, offers, and price points', () => {
    const products = ProductRepository.getPublishedProducts();
    expect(products.length).toBeGreaterThanOrEqual(5);

    const anker = products.find((p) => p.slug === 'anker-prime-20000mah-power-bank');
    expect(anker).toBeDefined();
    expect(anker?.tested).toBe(1);
    expect(anker?.tested_disclosure).toBe('purchased');
    expect(anker?.offers.length).toBeGreaterThanOrEqual(1);
    expect(anker?.pricePoints.length).toBeGreaterThanOrEqual(30);
    expect(anker?.verdictResult?.verdict).toBe('great_price');
  });

  it('returns only great_price and good_price on deals feed', () => {
    const deals = ProductRepository.getDeals();
    expect(deals.length).toBeGreaterThanOrEqual(1);
    for (const deal of deals) {
      expect(['great_price', 'good_price']).toContain(deal.verdictResult?.verdict);
    }
  });

  it('correctly handles cold-start product with unknown verdict', () => {
    const coldStartProduct = ProductRepository.getBySlug('anker-solix-c300-dc-power-station');
    expect(coldStartProduct).toBeDefined();
    expect(coldStartProduct?.verdictResult?.verdict).toBe('unknown');
    expect(coldStartProduct?.verdictResult?.reason).toContain('Tracking started, verdict coming soon');

    // Cold-start product must not appear in deals feed
    const deals = ProductRepository.getDeals();
    expect(deals.some((d) => d.slug === 'anker-solix-c300-dc-power-station')).toBe(false);
  });

  it('fetches collections with hydrated products and editor notes', () => {
    const collections = ProductRepository.getCollections();
    expect(collections.length).toBeGreaterThanOrEqual(2);

    const col = ProductRepository.getCollectionBySlug('best-power-banks-under-100');
    expect(col).toBeDefined();
    expect(col?.products.length).toBeGreaterThanOrEqual(1);
    expect(col?.products[0].editor_note).toBeDefined();
  });
});
