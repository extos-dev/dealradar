import React from 'react';
import { SiteHeader, SiteFooter } from '@/components/LayoutComponents';

export const metadata = { title: 'Terms of Service | GadgetPulse' };

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10 text-zinc-800 leading-relaxed space-y-6">
        <h1 className="text-3xl font-extrabold text-zinc-950">Terms of Service</h1>
        <p className="text-sm text-zinc-600">Last updated: October 2026</p>

        <section className="space-y-3 text-sm">
          <h2 className="text-lg font-bold text-zinc-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using GadgetPulse, you agree to comply with these terms.
          </p>
        </section>

        <section className="space-y-3 text-sm">
          <h2 className="text-lg font-bold text-zinc-900">2. Pricing & Availability Disclaimer</h2>
          <p>
            Merchant prices and availability fluctuate continuously. The price displayed at the merchant's checkout at the time of purchase is the final price applicable to your transaction. GadgetPulse does not sell products directly and does not guarantee pricing accuracy beyond our stated 24-hour verification window.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
