import React from 'react';
import Link from 'next/link';

export function AffiliateDisclosureBanner() {
  return (
    <div className="bg-amber-50/90 border border-amber-200 text-amber-900 text-xs px-4 py-2.5 rounded-md my-4">
      <p className="font-medium">
        <strong>Transparency & Affiliate Disclosure:</strong> We independently test and track tech gadget prices. When you purchase through links on our site, we may earn an affiliate commission at no extra cost to you. We never accept payment to influence recommendations or verdict calculations.
      </p>
    </div>
  );
}

export function AmazonPricingDisclaimer() {
  return (
    <div className="text-[11px] leading-relaxed text-zinc-500 mt-2 bg-zinc-50 p-2.5 rounded border border-zinc-200">
      <p>
        Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on [relevant Amazon Site(s), as applicable] at the time of purchase will apply to the purchase of this product.
      </p>
      <p className="mt-1 font-mono text-[10px] text-zinc-400">
        CERTAIN CONTENT THAT APPEARS ON THIS SITE COMES FROM AMAZON. THIS CONTENT IS PROVIDED AS IS AND IS SUBJECT TO CHANGE OR REMOVAL AT ANY TIME.
      </p>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tight text-zinc-950">
              Gadget<span className="text-emerald-600">Pulse</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-zinc-600">
            <Link href="/deals" className="hover:text-zinc-950 transition-colors">
              Verified Deals
            </Link>
            <Link href="/best/best-power-banks-under-100" className="hover:text-zinc-950 transition-colors">
              Power Banks
            </Link>
            <Link href="/best/best-desk-accessories-under-150" className="hover:text-zinc-950 transition-colors">
              Desk Setup
            </Link>
            <Link href="/guides/how-we-judge-deals" className="hover:text-zinc-950 transition-colors">
              How We Judge
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/deals"
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            Price Drops
          </Link>
          <Link
            href="/admin"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 px-2 py-1"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 mt-16 py-12 text-zinc-600 text-xs">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-zinc-900 mb-2">GadgetPulse</h4>
            <p className="text-zinc-500 leading-relaxed">
              Is this gadget a good price right now? We track verified 90-day price history so you never have to guess.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900 mb-2">Navigation</h4>
            <ul className="space-y-1.5">
              <li><Link href="/" className="hover:underline">Home</Link></li>
              <li><Link href="/deals" className="hover:underline">Verified Deals</Link></li>
              <li><Link href="/guides/how-we-judge-deals" className="hover:underline">Verdict Methodology</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900 mb-2">Compliance & Policies</h4>
            <ul className="space-y-1.5">
              <li><Link href="/disclosure" className="hover:underline">Affiliate Disclosure</Link></li>
              <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
              <li><Link href="/about" className="hover:underline">About Our Team</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900 mb-2">Notice & Mailing</h4>
            <p className="text-zinc-500 leading-relaxed">
              GadgetPulse Media LLC<br />
              100 Montgomery St, Suite 1400<br />
              San Francisco, CA 94104<br />
              contact@gadgetpulse.example.com
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-200 pt-6 space-y-3">
          <p className="leading-relaxed">
            <strong>Amazon Associates Statement:</strong> As an Amazon Associate I earn from qualifying purchases.
          </p>
          <p className="leading-relaxed">
            CERTAIN CONTENT THAT APPEARS ON THIS SITE COMES FROM AMAZON. THIS CONTENT IS PROVIDED AS IS AND IS SUBJECT TO CHANGE OR REMOVAL AT ANY TIME.
          </p>
          <p className="text-zinc-400">
            &copy; 2026 GadgetPulse. All rights reserved. Prices verified against tracked 90-day median pricing.
          </p>
        </div>
      </div>
    </footer>
  );
}
