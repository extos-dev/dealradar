import React from 'react';
import { SiteHeader, SiteFooter } from '@/components/LayoutComponents';

export const metadata = { title: 'About Our Team | GadgetPulse' };

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10 text-zinc-800 leading-relaxed space-y-6">
        <h1 className="text-3xl font-extrabold text-zinc-950">About GadgetPulse</h1>
        <p className="text-sm text-zinc-700">
          GadgetPulse is a tech gadget price tracking and review publication founded in 2026. Our core objective is simple: eliminate deceptive "sales" by offering shoppers complete transparency into 90-day price trends across power accessories, smart home gear, audio, and desk setups.
        </p>

        <h2 className="text-xl font-bold text-zinc-950 mt-6">Our Editorial Team</h2>
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-zinc-200">
            <h3 className="font-bold text-base text-zinc-900">Alex Rivera</h3>
            <p className="text-xs text-emerald-700 font-semibold mb-2">Editor-in-Chief & Mobile Hardware Lead</p>
            <p className="text-xs text-zinc-600">
              Former battery testing engineer with 8 years of hardware benchmarking experience. Alex personally inspects USB-C protocols, GaN thermals, and power-bank capacities.
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-zinc-200">
            <h3 className="font-bold text-base text-zinc-900">Jordan Lee</h3>
            <p className="text-xs text-emerald-700 font-semibold mb-2">Smart Home & Workspace Editor</p>
            <p className="text-xs text-zinc-600">
              Specialist in Matter over Thread smart home protocols and ergonomic desktop accessories. Oversees our hands-on desk test setup in San Francisco.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
