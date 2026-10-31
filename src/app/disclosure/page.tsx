import React from 'react';
import { SiteHeader, SiteFooter } from '@/components/LayoutComponents';

export const metadata = { title: 'Affiliate Disclosure | GadgetPulse' };

export default function DisclosurePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10 text-zinc-800 leading-relaxed space-y-6">
        <h1 className="text-3xl font-extrabold text-zinc-950">Affiliate Disclosure & Transparency Statement</h1>
        <p className="text-sm text-zinc-600">Last updated: October 2026</p>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-zinc-900">FTC Compliance Statement</h2>
          <p className="text-sm text-zinc-700">
            In accordance with Federal Trade Commission (FTC) guidelines (16 CFR Part 255 & Part 465), please assume that links on GadgetPulse are affiliate links. If you click on these links and visit a merchant website to make a purchase, we may receive a sales commission from the merchant at zero additional cost to you.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-zinc-900">Amazon Associates Program</h2>
          <p className="text-sm text-zinc-700">
            GadgetPulse is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
          </p>
          <div className="bg-zinc-100 p-4 rounded-lg font-mono text-xs text-zinc-700">
            "As an Amazon Associate I earn from qualifying purchases."
          </div>
          <p className="text-xs text-zinc-600">
            CERTAIN CONTENT THAT APPEARS ON THIS SITE COMES FROM AMAZON. THIS CONTENT IS PROVIDED AS IS AND IS SUBJECT TO CHANGE OR REMOVAL AT ANY TIME.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-zinc-900">Editorial Independence</h2>
          <p className="text-sm text-zinc-700">
            Our editorial staff conducts hands-on testing and programmatic tracking. Merchant commission rates never dictate which products we test, how products are ranked, or whether a deal qualifies as a Great Price.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
