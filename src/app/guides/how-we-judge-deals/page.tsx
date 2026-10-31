import React from 'react';
import { SiteHeader, SiteFooter } from '@/components/LayoutComponents';

export const metadata = {
  title: 'How We Judge Deals & Price Verdicts | GadgetPulse',
};

export default function HowWeJudgePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10 text-zinc-800">
        <h1 className="text-3xl font-extrabold text-zinc-950 mb-4">
          How We Judge Deals: Mathematical Price Verdicts
        </h1>
        <p className="text-sm text-zinc-600 mb-8 leading-relaxed">
          Most deal sites display whatever manufacturer MSRP discount the retailer advertises. We think shoppers deserve real data. Here is exactly how our automated verdict engine works.
        </p>

        <div className="space-y-6 text-sm leading-relaxed">
          <section className="bg-white p-6 rounded-xl border border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-950 mb-2">1. The 90-Day Trailing Median Baseline</h2>
            <p className="text-zinc-600">
              We capture merchant prices daily. Instead of using the mean average (which is easily distorted by a single flash sale or inflated list price), we calculate the <strong>median price over the trailing 90 days</strong>.
            </p>
          </section>

          <section className="bg-white p-6 rounded-xl border border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-950 mb-2">2. Minimum Data Requirements (Cold-Start Protection)</h2>
            <p className="text-zinc-600">
              To avoid publishing speculative conclusions, we refuse to issue a verdict on newly tracked products until we have collected at least <strong>30 days of continuous price history</strong> and at least <strong>14 verified price data points</strong>. Until that threshold is met, the item shows <em>"Tracking started, verdict coming soon"</em> and is excluded from the Deals feed.
            </p>
          </section>

          <section className="bg-white p-6 rounded-xl border border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-950 mb-2">3. The Verdict Tiers</h2>
            <ul className="space-y-2 mt-2 text-zinc-700">
              <li><strong>Great Price:</strong> The current price is at least 15% below its 90-day median AND within 5% of its 90-day low.</li>
              <li><strong>Good Price:</strong> Current price is 5% to 15% below its 90-day median.</li>
              <li><strong>Typical Price:</strong> Current price is within ±5% of the 90-day median.</li>
              <li><strong>Above Typical:</strong> Price is more than 5% above the 90-day median. We show this transparently on product pages and never promote it.</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-xl border border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-950 mb-2">4. Inflate-Then-Discount Defense</h2>
            <p className="text-zinc-600">
              Retailers sometimes raise prices for 30 days prior to major shopping events like Prime Day or Black Friday. If our system detects that the median in the last 30 days spiked over 15% higher than the prior 60-day baseline, we automatically cap the verdict at "Good Price" and append an editorial caveat note.
            </p>
          </section>

          <section className="bg-white p-6 rounded-xl border border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-950 mb-2">5. Commission-Blind Standards</h2>
            <p className="text-zinc-600">
              Affiliate commission rates are strictly excluded from our ranking algorithms and verdict calculations. When you click through our links, we may earn a commission, but our mathematics remain independent.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
