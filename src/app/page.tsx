import React from 'react';
import Link from 'next/link';
import { SiteHeader, SiteFooter, AffiliateDisclosureBanner } from '@/components/LayoutComponents';
import { ProductCard } from '@/components/ProductCard';
import { ProductRepository } from '@/lib/repository';
import { seedDatabase } from '@/lib/seed';
import { Zap, ShieldCheck, TrendingDown, ArrowRight } from 'lucide-react';


export default function HomePage() {
  // Ensure database has seed content
  seedDatabase();

  const allProducts = ProductRepository.getPublishedProducts();
  const verifiedDeals = ProductRepository.getDeals();
  const handsOnPicks = allProducts.filter((p) => p.tested === 1);
  const collections = ProductRepository.getCollections();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* FTC Disclosure visible above the first outbound action */}
        <AffiliateDisclosureBanner />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl p-8 sm:p-12 mb-12 shadow-sm">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-4">
              <TrendingDown className="w-3.5 h-3.5" /> 90-Day Real Price Tracking
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4">
              Is this tech gadget a good price right now?
            </h1>
            <p className="text-zinc-300 text-base sm:text-lg mb-6 leading-relaxed">
              We track daily merchant prices so you do not have to guess. Honest price verdicts calculated against verified 90-day median pricing.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/deals"
                className="px-6 py-3 rounded-lg font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors flex items-center gap-2"
              >
                Browse Today's Verified Drops <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/guides/how-we-judge-deals"
                className="px-5 py-3 rounded-lg font-semibold text-sm bg-zinc-700/60 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 transition-colors"
              >
                How We Judge Deals
              </Link>
            </div>
          </div>
        </section>

        {/* Four Launch Categories */}
        <section className="mb-12">
          <h2 className="text-xl font-black text-zinc-900 mb-4">Explore by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center hover:border-emerald-500 transition-colors">
              <div className="text-2xl mb-1">⚡</div>
              <h3 className="font-bold text-sm text-zinc-900">Power & Charging</h3>
              <p className="text-[11px] text-zinc-500 mt-1">Power banks, GaN adapters, cables</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center hover:border-emerald-500 transition-colors">
              <div className="text-2xl mb-1">🏠</div>
              <h3 className="font-bold text-sm text-zinc-900">Smart Home</h3>
              <p className="text-[11px] text-zinc-500 mt-1">Matter sensors, smart plugs, hubs</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center hover:border-emerald-500 transition-colors">
              <div className="text-2xl mb-1">🎧</div>
              <h3 className="font-bold text-sm text-zinc-900">Audio</h3>
              <p className="text-[11px] text-zinc-500 mt-1">ANC headphones, earbuds, speakers</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center hover:border-emerald-500 transition-colors">
              <div className="text-2xl mb-1">🖥️</div>
              <h3 className="font-bold text-sm text-zinc-900">Desk & Workspace</h3>
              <p className="text-[11px] text-zinc-500 mt-1">Ergonomic mice, docks, webcams</p>
            </div>
          </div>
        </section>

        {/* Verified Price Drops (Only products with Great Price or Good Price) */}
        {verifiedDeals.length >= 2 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-emerald-600" />
                  Verified Price Drops
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Only items verified at least 5% to 30%+ below their 90-day median price.
                </p>
              </div>
              <Link
                href="/deals"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                View all ({verifiedDeals.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {verifiedDeals.slice(0, 3).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Hands-On Tested Picks */}
        {handsOnPicks.length > 0 && (
          <section className="mb-12">
            <div className="mb-5">
              <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Hands-On Tested Picks
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Evaluated in-studio. Never recommended based on merchant commissions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {handsOnPicks.slice(0, 3).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Curated Buyer Guides / Collections */}
        {collections.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-black text-zinc-900 mb-4">Curated Price Guides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {collections.map((col) => (
                <Link
                  key={col.id}
                  href={`/best/${col.slug}`}
                  className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-emerald-500 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 mb-2">{col.title}</h3>
                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">{col.intro}</p>
                  </div>
                  <div className="mt-4 text-xs font-bold text-emerald-600 flex items-center gap-1">
                    Explore Guide <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Short "How We Judge Deals" block */}
        <section className="bg-zinc-100 rounded-xl p-6 border border-zinc-200">
          <h3 className="font-bold text-zinc-900 text-sm mb-2">Our Anti-Deception Promise</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Retailers frequently raise prices before holidays only to declare a "50% off discount" against an inflated baseline. At GadgetPulse, we compute every verdict using our independent 90-day median tracker. If the median itself spiked recently, we cap the rating. Our recommendations and rankings are 100% commission-blind.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
