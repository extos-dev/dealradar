export type Verdict = 'great_price' | 'good_price' | 'typical' | 'above_typical' | 'unknown';

export interface PricePoint {
  price: number;
  captured_at: string | Date;
}

export interface VerdictInput {
  currentPrice: number | null | undefined;
  priceCheckedAt: string | Date | null | undefined;
  pricePoints: PricePoint[];
  now?: Date;
  freshnessHoursWindow?: number; // default 24h
}

export interface VerdictResult {
  verdict: Verdict;
  median90: number | null;
  low90: number | null;
  reason: string;
  isStale: boolean;
  historyDays: number;
  dataPointCount: number;
  hasInflationWarning?: boolean;
}

export function computeMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
}

export function calculateVerdict(input: VerdictInput): VerdictResult {
  const now = input.now ? new Date(input.now) : new Date();
  const freshnessWindowHours = input.freshnessHoursWindow ?? 24;

  // Check freshness
  if (!input.currentPrice || !input.priceCheckedAt) {
    return {
      verdict: 'unknown',
      median90: null,
      low90: null,
      reason: 'No current price or check time available',
      isStale: true,
      historyDays: 0,
      dataPointCount: 0,
    };
  }

  const checkedAt = new Date(input.priceCheckedAt);
  const hoursSinceCheck = (now.getTime() - checkedAt.getTime()) / (1000 * 60 * 60);
  const isStale = hoursSinceCheck > freshnessWindowHours;

  if (isStale) {
    return {
      verdict: 'unknown',
      median90: null,
      low90: null,
      reason: 'Price is older than the 24-hour freshness window',
      isStale: true,
      historyDays: 0,
      dataPointCount: 0,
    };
  }

  // Filter price points within the last 90 days
  const cutoff90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const cutoff30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const pointsLast90 = input.pricePoints.filter((p) => new Date(p.captured_at) >= cutoff90);

  if (pointsLast90.length === 0) {
    return {
      verdict: 'unknown',
      median90: null,
      low90: null,
      reason: 'Tracking started, verdict coming soon',
      isStale: false,
      historyDays: 0,
      dataPointCount: 0,
    };
  }

  // Calculate history days span
  const timestamps = pointsLast90.map((p) => new Date(p.captured_at).getTime());
  const minTime = Math.min(...timestamps);
  const historyDays = Math.max(1, Math.round((now.getTime() - minTime) / (1000 * 60 * 60 * 24)));

  // Minimum data rule: at least 30 days of history AND at least 14 price points in the last 90 days
  if (historyDays < 30 || pointsLast90.length < 14) {
    return {
      verdict: 'unknown',
      median90: null,
      low90: null,
      reason: `Tracking started, verdict coming soon (needs at least 30 days and 14 points, currently ${historyDays} days and ${pointsLast90.length} points)`,
      isStale: false,
      historyDays,
      dataPointCount: pointsLast90.length,
    };
  }

  const prices90 = pointsLast90.map((p) => p.price);
  const median90 = computeMedian(prices90);
  const low90 = Math.min(...prices90);
  const currentPrice = input.currentPrice;

  // Check 30-day median spike vs prior 60-day median (inflate-then-discount pattern)
  const pointsPrior60 = pointsLast90.filter((p) => new Date(p.captured_at) < cutoff30);
  const pointsLast30 = pointsLast90.filter((p) => new Date(p.captured_at) >= cutoff30);

  let hasInflationWarning = false;
  if (pointsPrior60.length >= 7 && pointsLast30.length >= 7) {
    const medianPrior60 = computeMedian(pointsPrior60.map((p) => p.price));
    const medianLast30 = computeMedian(pointsLast30.map((p) => p.price));
    // If the median itself rose sharply (> 15% increase), flag it
    if (medianPrior60 > 0 && (medianLast30 - medianPrior60) / medianPrior60 > 0.15) {
      hasInflationWarning = true;
    }
  }

  const diffFromMedianPct = ((currentPrice - median90) / median90) * 100;
  const pctBelowMedian = -diffFromMedianPct;
  const diffFromLowPct = ((currentPrice - low90) / low90) * 100;

  let verdict: Verdict = 'typical';
  let reason = '';

  // Rule 1: great_price -> Current price is at least 15% below 90-day median AND within 5% of 90-day low
  if (pctBelowMedian >= 15 && diffFromLowPct <= 5) {
    verdict = 'great_price';
  } else if (pctBelowMedian >= 5) {
    // Rule 2: good_price -> Current price is 5% to 15% below the 90-day median (or failed great_price low threshold)
    verdict = 'good_price';
  } else if (Math.abs(diffFromMedianPct) <= 5) {
    // Rule 3: typical -> Within 5% of the 90-day median
    verdict = 'typical';
  } else {
    // Rule 4: above_typical -> More than 5% above the 90-day median
    verdict = 'above_typical';
  }

  // If inflate-then-discount detected, cap verdict at good_price and append note
  if (hasInflationWarning && verdict === 'great_price') {
    verdict = 'good_price';
  }

  // Format reason string
  const formattedCur = `$${currentPrice.toFixed(2)}`;
  const formattedMed = `$${median90.toFixed(2)}`;
  const formattedLow = `$${low90.toFixed(2)}`;

  if (pctBelowMedian >= 0) {
    const pctVal = Math.round(pctBelowMedian);
    const lowDiffVal = Math.abs(Math.round(diffFromLowPct));
    const lowComparison = diffFromLowPct <= 0 ? 'matching its 90-day low' : `${lowDiffVal}% above its 90-day low of ${formattedLow}`;
    reason = `${formattedCur} is ${pctVal}% below its 90-day median of ${formattedMed} and ${lowComparison}`;
  } else {
    const pctVal = Math.round(diffFromMedianPct);
    reason = `${formattedCur} is ${pctVal}% above its 90-day median of ${formattedMed}`;
  }

  if (hasInflationWarning) {
    reason += ' (Note: recent 30-day median spiked above historical baseline; capped at Good Price)';
  }

  return {
    verdict,
    median90,
    low90,
    reason,
    isStale: false,
    historyDays,
    dataPointCount: pointsLast90.length,
    hasInflationWarning,
  };
}
