import React from 'react';
import { SiteHeader, SiteFooter } from '@/components/LayoutComponents';

export const metadata = { title: 'Privacy Policy | GadgetPulse' };

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10 text-zinc-800 leading-relaxed space-y-6">
        <h1 className="text-3xl font-extrabold text-zinc-950">Privacy Policy</h1>
        <p className="text-sm text-zinc-600">Last updated: October 2026</p>

        <section className="space-y-3 text-sm">
          <h2 className="text-lg font-bold text-zinc-900">1. Data Minimization & Cookieless Tracking</h2>
          <p>
            GadgetPulse respects your digital privacy. We do not use third-party behavioral advertising cookies. Our click attribution system uses cryptographic salted hashes and does not persist raw visitor IP addresses.
          </p>
        </section>

        <section className="space-y-3 text-sm">
          <h2 className="text-lg font-bold text-zinc-900">2. Email Subscriptions & Alerts</h2>
          <p>
            When you subscribe to price drop notifications or our weekly deal digest, we collect your email address purely to dispatch the requested notifications. We enforce double opt-in confirmation and include a one-click unsubscribe link in every communication. We never sell or rent subscriber lists.
          </p>
        </section>

        <section className="space-y-3 text-sm">
          <h2 className="text-lg font-bold text-zinc-900">3. Merchant Links</h2>
          <p>
            When you click on an outbound button to an affiliate merchant (such as Amazon, Walmart, or Best Buy), you will be directed to that merchant's external website, which operates under its own privacy policies.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
