import { describe, it, expect } from 'vitest';
import { calculateVerdict, computeMedian, PricePoint } from './verdict';

describe('Verdict pure logic', () => {
  const baseDate = new Date('2026-10-31T12:00:00Z');

  // Helper to generate N daily points with specified price
  function generateDailyPoints(days: number, priceGenerator: (dayOffset: number) => number): PricePoint[] {
    const points: PricePoint[] = [];
    for (let i = days; i >= 1; i--) {
      const pointDate = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
      points.push({
        price: priceGenerator(i),
        captured_at: pointDate.toISOString(),
      });
    }
    return points;
  }

  it('computes median correctly for odd and even list of numbers', () => {
    expect(computeMedian([10, 20, 30])).toBe(20);
    expect(computeMedian([10, 20, 30, 40])).toBe(25);
    expect(computeMedian([])).toBe(0);
  });

  it('returns unknown if price is stale (>24h)', () => {
    const points = generateDailyPoints(40, () => 50);
    const result = calculateVerdict({
      currentPrice: 35,
      priceCheckedAt: new Date(baseDate.getTime() - 25 * 60 * 60 * 1000), // 25 hours ago
      pricePoints: points,
      now: baseDate,
    });

    expect(result.verdict).toBe('unknown');
    expect(result.isStale).toBe(true);
    expect(result.reason).toContain('older than the 24-hour freshness window');
  });

  it('returns unknown for cold-start (less than 30 days of history)', () => {
    const points = generateDailyPoints(20, () => 50); // only 20 days
    const result = calculateVerdict({
      currentPrice: 35,
      priceCheckedAt: baseDate,
      pricePoints: points,
      now: baseDate,
    });

    expect(result.verdict).toBe('unknown');
    expect(result.reason).toContain('Tracking started, verdict coming soon');
  });

  it('returns unknown for cold-start (less than 14 points)', () => {
    // 35 days span, but only 10 points
    const points: PricePoint[] = [];
    for (let i = 35; i >= 1; i -= 4) {
      points.push({
        price: 50,
        captured_at: new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    const result = calculateVerdict({
      currentPrice: 35,
      priceCheckedAt: baseDate,
      pricePoints: points,
      now: baseDate,
    });

    expect(result.verdict).toBe('unknown');
    expect(result.reason).toContain('Tracking started, verdict coming soon');
  });

  it('returns great_price when >= 15% below median and within 5% of 90-day low', () => {
    // Median ~ 100, low = 80
    const points = generateDailyPoints(60, (d) => (d === 5 ? 80 : 100));
    const result = calculateVerdict({
      currentPrice: 82, // 18% below median (100) and 2.5% above low (80)
      priceCheckedAt: baseDate,
      pricePoints: points,
      now: baseDate,
    });

    expect(result.verdict).toBe('great_price');
    expect(result.reason).toContain('$82.00 is 18% below its 90-day median of $100.00');
  });

  it('returns good_price when 5% to 15% below median', () => {
    const points = generateDailyPoints(60, () => 100);
    const result = calculateVerdict({
      currentPrice: 90, // 10% below median
      priceCheckedAt: baseDate,
      pricePoints: points,
      now: baseDate,
    });

    expect(result.verdict).toBe('good_price');
    expect(result.reason).toContain('$90.00 is 10% below its 90-day median of $100.00');
  });

  it('returns good_price when >=15% below median but more than 5% above 90-day low', () => {
    // Median = 100, low = 60. Current price = 80 (20% below median, but 33% above low 60)
    const points = generateDailyPoints(60, (d) => (d === 10 ? 60 : 100));
    const result = calculateVerdict({
      currentPrice: 80,
      priceCheckedAt: baseDate,
      pricePoints: points,
      now: baseDate,
    });

    expect(result.verdict).toBe('good_price');
  });

  it('returns typical when within 5% of median', () => {
    const points = generateDailyPoints(60, () => 100);
    const result = calculateVerdict({
      currentPrice: 98, // 2% below median
      priceCheckedAt: baseDate,
      pricePoints: points,
      now: baseDate,
    });

    expect(result.verdict).toBe('typical');
  });

  it('returns above_typical when more than 5% above median', () => {
    const points = generateDailyPoints(60, () => 100);
    const result = calculateVerdict({
      currentPrice: 115, // 15% above median
      priceCheckedAt: baseDate,
      pricePoints: points,
      now: baseDate,
    });

    expect(result.verdict).toBe('above_typical');
    expect(result.reason).toContain('$115.00 is 15% above its 90-day median of $100.00');
  });

  it('caps at good_price and adds inflation warning if 30-day median spiked sharply', () => {
    // Prior 60 days: price = 60. Last 30 days: price = 100.
    // Overall median is higher, but 30-day median increased sharply.
    const points: PricePoint[] = [];
    for (let i = 80; i >= 1; i--) {
      const price = i > 30 ? 60 : 100;
      points.push({
        price,
        captured_at: new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Current price is $75 (which would normally look like a huge discount from $100)
    const result = calculateVerdict({
      currentPrice: 75,
      priceCheckedAt: baseDate,
      pricePoints: points,
      now: baseDate,
    });

    expect(result.hasInflationWarning).toBe(true);
    expect(result.verdict).not.toBe('great_price');
    expect(result.reason).toContain('recent 30-day median spiked');
  });
});
