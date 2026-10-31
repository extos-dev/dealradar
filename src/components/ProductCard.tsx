import React from 'react';
import Link from 'next/link';
import { ProductWithDetails } from '@/lib/repository';
import { Tag, ShieldCheck, Clock, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: ProductWithDetails;
  showVerdictReason?: boolean;
}

export function ProductCard({ product, showVerdictReason = true }: ProductCardProps) {
  const primaryOffer = product.offers.find((o) => o.merchant === 'amazon') || product.offers[0];
  const verdict = product.verdictResult;

  const verdictBadge = () => {
    switch (verdict?.verdict) {
      case 'great_price':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Great Price
          </span>
        );
      case 'good_price':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            Good Price
          </span>
        );
      case 'typical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-300">
            Typical Price
          </span>
        );
      case 'above_typical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            Above Typical Price
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Verdict Coming Soon
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="relative aspect-[4/3] bg-zinc-100 border-b border-zinc-100 overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400">
              No photo available
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {verdictBadge()}
            {product.tested === 1 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-900 border border-indigo-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Tested
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                Price-Tracked Pick
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">
            {product.brand || product.category.replace('_', ' ')}
          </div>
          <h3 className="font-bold text-zinc-900 text-base line-clamp-2 hover:text-emerald-700 transition-colors">
            <Link href={`/products/${product.slug}`}>{product.title}</Link>
          </h3>

          <div className="mt-3 flex items-baseline gap-2">
            {primaryOffer && primaryOffer.current_price != null ? (
              <>
                <span className="text-2xl font-black text-zinc-950">
                  ${primaryOffer.current_price.toFixed(2)}
                </span>
                {verdict?.median90 && (
                  <span className="text-xs text-zinc-500 line-through">
                    ${verdict.median90.toFixed(2)} median
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm font-semibold text-zinc-600">Check current price</span>
            )}
          </div>

          {showVerdictReason && verdict?.reason && (
            <p className="mt-2 text-xs text-zinc-600 bg-zinc-50 p-2 rounded border border-zinc-100 leading-relaxed">
              {verdict.reason}
            </p>
          )}

          {product.tested === 1 && product.tested_disclosure && (
            <div className="mt-2 text-[11px] text-zinc-500 italic">
              Unit: {product.tested_disclosure}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 pt-0 border-t border-zinc-100 mt-2">
        <div className="flex items-center justify-between gap-2 pt-3">
          <Link
            href={`/products/${product.slug}`}
            className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 underline underline-offset-4"
          >
            Read Analysis
          </Link>
          {primaryOffer && (
            <a
              href={`/go/${primaryOffer.merchant}/${product.slug}?src=organic`}
              rel="sponsored nofollow"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              Check at {primaryOffer.merchant === 'amazon' ? 'Amazon' : primaryOffer.merchant}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
