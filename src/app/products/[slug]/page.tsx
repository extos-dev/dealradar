import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ProductRepository } from '@/lib/repository';
import { SiteHeader, SiteFooter, AffiliateDisclosureBanner, AmazonPricingDisclaimer } from '@/components/LayoutComponents';
import { PriceChart } from '@/components/PriceChart';
import { AlertForm } from '@/components/AlertForm';
import { ProductCard } from '@/components/ProductCard';
import { ShieldCheck, Tag, Clock, ArrowRight, ExternalLink, HelpCircle } from 'lucide-react';


interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = ProductRepository.getBySlug(slug);
  if (!product) return { title: 'Product Not Found | GadgetPulse' };

  return {
    title: `${product.title} - Price History & Verdict | GadgetPulse`,
    description: product.verdictResult?.reason || `Tracked 90-day price history and verdict for ${product.title}.`,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = ProductRepository.getBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryOffer = product.offers.find((o) => o.merchant === 'amazon') || product.offers[0];
  const verdict = product.verdictResult;
  const specsObj = product.specs ? JSON.parse(product.specs) : {};
  const prosList = product.pros ? JSON.parse(product.pros) : [];
  const consList = product.cons ? JSON.parse(product.cons) : [];

  // Fetch 3 alternatives in same category
  const allInCat = ProductRepository.getPublishedProducts().filter(
    (p) => p.category === product.category && p.slug !== product.slug
  );
  const alternatives = allInCat.slice(0, 3);

  // Compliant JSON-LD structured data (Product + Offer only if within freshness window)
  const isFresh = verdict && !verdict.isStale && primaryOffer?.current_price;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.image_url,
    description: product.verdict_text,
    sku: primaryOffer?.merchant_sku,
    ...(product.gtin ? { gtin: product.gtin } : {}),
    ...(isFresh
      ? {
          offers: {
            '@type': 'Offer',
            price: primaryOffer.current_price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            priceValidUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          },
        }
      : {}),
    ...(product.editor_rating && product.author_name
      ? {
          review: {
            '@type': 'Review',
            author: {
              '@type': 'Person',
              name: product.author_name,
            },
            reviewBody: product.verdict_text,
            reviewRating: {
              '@type': 'Rating',
              ratingValue: product.editor_rating,
              bestRating: 5,
            },
          },
        }
      : {}),
  };

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        <AffiliateDisclosureBanner />

        {/* 1. Breadcrumbs */}
        <nav className="text-xs text-zinc-500 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="capitalize">{product.category.replace('_', ' ')}</span>
          <span>/</span>
          <span className="text-zinc-800 font-medium truncate">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Product Image */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="max-h-80 w-auto object-contain rounded-lg"
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-zinc-400">
                No image available
              </div>
            )}
            {/* Merchant rating & review count */}
            {primaryOffer?.rating && (
              <div className="mt-4 text-xs text-zinc-500 flex items-center gap-1.5">
                <span>★ {primaryOffer.rating.toFixed(1)}</span>
                <span>({primaryOffer.review_count?.toLocaleString()} reviews on {primaryOffer.merchant})</span>
              </div>
            )}
          </div>

          {/* Pricing & Verdict Block */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.tested === 1 ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Hands-On Tested
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                  Price-Tracked Pick
                </span>
              )}
              {product.tested === 1 && product.tested_disclosure && (
                <span className="text-xs text-zinc-500 italic">
                  Unit source: {product.tested_disclosure}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mb-4 leading-snug">
              {product.title}
            </h1>

            {/* Block 2: Verdict Badge and Reason */}
            <div className="p-4 rounded-xl border mb-6 bg-zinc-50 border-zinc-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Calculated Price Verdict:
                </span>
                {verdict?.verdict === 'great_price' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    GREAT PRICE
                  </span>
                )}
                {verdict?.verdict === 'good_price' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-300">
                    GOOD PRICE
                  </span>
                )}
                {verdict?.verdict === 'typical' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-200 text-zinc-800">
                    TYPICAL PRICE
                  </span>
                )}
                {verdict?.verdict === 'above_typical' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                    ABOVE TYPICAL PRICE
                  </span>
                )}
                {verdict?.verdict === 'unknown' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    VERDICT COMING SOON
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-800 font-medium leading-relaxed">
                {verdict?.reason}
              </p>
            </div>

            {/* Block 3: Current price per merchant with check time */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
              <h3 className="text-xs font-bold uppercase text-zinc-500 mb-3">
                Live Merchant Offers
              </h3>
              <div className="space-y-3">
                {product.offers.map((offer) => {
                  const checkDate = offer.price_checked_at
                    ? new Date(offer.price_checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'recently';

                  return (
                    <div
                      key={offer.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200"
                    >
                      <div>
                        <div className="text-xs font-bold uppercase text-zinc-900 flex items-center gap-2">
                          {offer.merchant === 'amazon' ? 'Amazon.com' : offer.merchant}
                          {offer.in_stock ? (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">In Stock</span>
                          ) : (
                            <span className="text-[10px] text-zinc-500 bg-zinc-200 px-1.5 py-0.5 rounded">Out of Stock</span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> Checked at {checkDate}
                        </div>
                        {/* Amazon Lowest Used Price Display (Comparison Format rule C-2) */}
                        {offer.merchant === 'amazon' && offer.lowest_used_price && (
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            Lowest used on Amazon: <strong>${offer.lowest_used_price.toFixed(2)}</strong>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xl font-black text-zinc-950">
                          {offer.current_price != null ? `$${offer.current_price.toFixed(2)}` : 'Check Site'}
                        </span>
                        <a
                          href={`/go/${offer.merchant}/${product.slug}?src=product_page`}
                          rel="sponsored nofollow"
                          target="_blank"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                        >
                          Check Price <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Required Amazon pricing & availability disclaimer */}
              <AmazonPricingDisclaimer />
            </div>
          </div>
        </div>

        {/* Block 4: 90-Day Price Chart */}
        <div className="mb-8">
          <PriceChart
            pricePoints={product.pricePoints}
            median={verdict?.median90 ?? null}
            low={verdict?.low90 ?? null}
            currentPrice={primaryOffer?.current_price ?? null}
          />
        </div>

        {/* Block 5: Alert Form */}
        <div className="mb-10">
          <AlertForm
            productId={product.id}
            suggestedTargetPrice={verdict?.low90}
            productTitle={product.title}
          />
        </div>

        {/* Block 6: Editor Verdict & Attribution */}
        <section className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 mb-10">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-950">Editor's Verdict</h2>
              {product.author_name && (
                <p className="text-xs text-zinc-500 mt-1">
                  By <strong>{product.author_name}</strong> — {product.author_bio}
                </p>
              )}
            </div>
            {product.editor_rating && (
              <div className="text-right">
                <div className="text-xs text-zinc-500">Editor Score</div>
                <div className="text-lg font-black text-emerald-700">{product.editor_rating} / 5</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase text-emerald-900 mb-1">Best For:</h3>
              <p className="text-xs text-emerald-950 leading-relaxed">{product.best_for}</p>
            </div>
            <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase text-rose-900 mb-1">Avoid If:</h3>
              <p className="text-xs text-rose-950 leading-relaxed">{product.avoid_if}</p>
            </div>
          </div>

          <p className="text-sm text-zinc-700 leading-relaxed mb-6 font-medium">
            {product.verdict_text}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-700 mb-3">
                Key Advantages (Pros)
              </h4>
              <ul className="space-y-2 text-xs text-zinc-700">
                {prosList.map((pro: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-rose-700 mb-3">
                Trade-offs & Limitations (Cons)
              </h4>
              <ul className="space-y-2 text-xs text-zinc-700">
                {consList.map((con: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">✗</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Block 8: Specs Table & Short FAQ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <h3 className="font-bold text-base text-zinc-950 mb-4">Technical Specifications</h3>
            <div className="divide-y divide-zinc-100 text-xs">
              {Object.entries(specsObj).map(([key, val]: any) => (
                <div key={key} className="py-2.5 flex justify-between gap-4">
                  <span className="text-zinc-500 font-medium">{key}</span>
                  <span className="text-zinc-900 font-semibold text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <h3 className="font-bold text-base text-zinc-950 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-zinc-900 mb-1">How often is the price updated?</h4>
                <p className="text-zinc-600 leading-relaxed">
                  We refresh merchant pricing multiple times daily. If a merchant price has not been checked within 24 hours, the price is hidden behind a "Check current price" link.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 mb-1">Does GadgetPulse take kickbacks for verdicts?</h4>
                <p className="text-zinc-600 leading-relaxed">
                  Never. Our verdicts are purely mathematical functions comparing current offer prices against the 90-day tracked median. Commission rates have zero weight in our calculations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Disclosure repeated (not collapsed) above the alternatives block */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 mb-4">
          <strong>Affiliate Note:</strong> Looking at alternative options below? When you buy through any merchant link on this page, we may earn an affiliate commission.
        </div>

        {/* Block 8 Continued: Alternatives */}
        {alternatives.length > 0 && (
          <section className="mb-12">
            <h3 className="text-lg font-bold text-zinc-950 mb-4">
              Similar Alternatives in {product.category.replace('_', ' ')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {alternatives.map((alt) => (
                <ProductCard key={alt.id} product={alt} showVerdictReason={false} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
