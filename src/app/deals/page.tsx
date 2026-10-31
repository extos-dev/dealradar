import React from 'react';
import { SiteHeader, SiteFooter, AffiliateDisclosureBanner } from '@/components/LayoutComponents';
import { ProductCard } from '@/components/ProductCard';
import { ProductRepository } from '@/lib/repository';
import { TrendingDown } from 'lucide-react';
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'Verified Tech Gadget Price Drops | GadgetPulse',
  description: 'Only tech gadgets currently at verified Great Price or Good Price based on tracked 90-day median pricing.',
};

export default function DealsPage() {
  const deals = ProductRepository.getDeals();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <AffiliateDisclosureBanner />

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <TrendingDown className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
              Verified Price Drops
            </h1>
          </div>
          <p className="text-sm text-zinc-600 max-w-2xl leading-relaxed">
            Every product on this page has passed our strict mathematical price verdict criteria: the current price is verified at least 5% to 30%+ below its 90-day median. No manufacturer list prices, no fake countdowns.
          </p>
        </div>

        {deals.length === 0 ? (
          <div className="bg-white border border-dashed border-zinc-300 rounded-xl p-12 text-center text-zinc-500">
            <p className="font-semibold text-base text-zinc-800 mb-1">No verified deals right now</p>
            <p className="text-xs">
              We only show verified drops. When merchant prices drop below their 90-day medians, they will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {deals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
