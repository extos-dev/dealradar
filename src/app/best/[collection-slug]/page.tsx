import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ProductRepository } from '@/lib/repository';
import { SiteHeader, SiteFooter, AffiliateDisclosureBanner } from '@/components/LayoutComponents';
import { ProductCard } from '@/components/ProductCard';


interface CollectionPageProps {
  params: Promise<{ 'collection-slug': string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const collection = ProductRepository.getCollectionBySlug(resolvedParams['collection-slug']);
  if (!collection) return { title: 'Collection Not Found | GadgetPulse' };

  return {
    title: `${collection.title} | GadgetPulse`,
    description: collection.intro || 'Curated gadget recommendations and verified price drops.',
  };
}

export default async function CollectionDetailPage({ params }: CollectionPageProps) {
  const resolvedParams = await params;
  const collection = ProductRepository.getCollectionBySlug(resolvedParams['collection-slug']);

  if (!collection) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <AffiliateDisclosureBanner />

        <div className="max-w-3xl mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mb-3">
            {collection.title}
          </h1>
          <p className="text-zinc-600 text-sm leading-relaxed mb-4">
            {collection.intro}
          </p>
          <div className="text-[11px] text-zinc-500 bg-zinc-100 p-2.5 rounded-lg border border-zinc-200">
            <strong>How We Selected These:</strong> Every pick in this guide is vetted against our 90-day tracked price history and Hands-On lab testing standards. Products are ordered by editor rating and mathematical price verdict. Merchant commission rates are strictly excluded from ranking.
          </div>
        </div>

        <div className="space-y-8">
          {collection.products.map((product, idx) => (
            <div key={product.id} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-xs font-semibold text-zinc-500 uppercase">
                  Editor's Recommendation
                </span>
              </div>
              {product.editor_note && (
                <div className="bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 p-3 rounded-lg mb-4">
                  <strong>Why it made the cut:</strong> {product.editor_note}
                </div>
              )}
              <div className="max-w-md">
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
