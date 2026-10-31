import React from 'react';
import { SiteHeader, SiteFooter } from '@/components/LayoutComponents';
import { ProductRepository } from '@/lib/repository';
import { db } from '@/lib/db';
import { ShieldCheck, CheckSquare, PlusCircle } from 'lucide-react';

export default function AdminPage() {
  const products = ProductRepository.getPublishedProducts();
  const draftProducts = db.prepare("SELECT * FROM products WHERE status = 'draft'").all() as any[];

  return (
    <>
      <SiteHeader />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Admin & Editorial Desk
            </span>
            <h1 className="text-2xl font-black text-zinc-950 mt-1">
              Editorial Approval & Compliance Console
            </h1>
          </div>
          <div className="text-xs text-zinc-500">
            Protected internal route • <code>noindex</code>
          </div>
        </div>

        {/* Section 8 Compliance Checklist Reference */}
        <section className="bg-white border border-zinc-200 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-base font-bold text-zinc-900 mb-3 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-600" />
            Mandatory §8 & Gap-Review Approval Checklist
          </h2>
          <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
            Before moving a product from <code>draft</code> to <code>published</code>, every editor must certify the following 10 standards:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-700">
            <div className="flex items-start gap-2 bg-zinc-50 p-2.5 rounded border border-zinc-100">
              <span className="text-emerald-600 font-bold">1.</span>
              <span>At least one valid offer with a working, tagged affiliate link.</span>
            </div>
            <div className="flex items-start gap-2 bg-zinc-50 p-2.5 rounded border border-zinc-100">
              <span className="text-emerald-600 font-bold">2.</span>
              <span>Merchant rating ≥ 4.0 with at least 200 reviews (or written reason).</span>
            </div>
            <div className="flex items-start gap-2 bg-zinc-50 p-2.5 rounded border border-zinc-100">
              <span className="text-emerald-600 font-bold">3.</span>
              <span>Ships to US addresses and confirmed in-stock.</span>
            </div>
            <div className="flex items-start gap-2 bg-zinc-50 p-2.5 rounded border border-zinc-100">
              <span className="text-emerald-600 font-bold">4.</span>
              <span>Title is accurate, uninflated, and not misleading.</span>
            </div>
            <div className="flex items-start gap-2 bg-zinc-50 p-2.5 rounded border border-zinc-100">
              <span className="text-emerald-600 font-bold">5.</span>
              <span>Verdict text, pros, cons, best-for, and avoid-if human edited and approved.</span>
            </div>
            <div className="flex items-start gap-2 bg-zinc-50 p-2.5 rounded border border-zinc-100">
              <span className="text-emerald-600 font-bold">6.</span>
              <span>No unsupported health, safety, or battery performance claims.</span>
            </div>
            <div className="flex items-start gap-2 bg-zinc-50 p-2.5 rounded border border-zinc-100">
              <span className="text-emerald-600 font-bold">7.</span>
              <span><code>tested</code> flag is true only if hands-on tested; otherwise "Price-tracked pick".</span>
            </div>
            <div className="flex items-start gap-2 bg-zinc-50 p-2.5 rounded border border-zinc-100">
              <span className="text-emerald-600 font-bold">8.</span>
              <span><strong>tested_disclosure</strong> set and shown next to Tested badge if not bought at retail (loaner, discount, return).</span>
            </div>
            <div className="flex items-start gap-2 bg-zinc-50 p-2.5 rounded border border-zinc-100">
              <span className="text-emerald-600 font-bold">9.</span>
              <span>Affiliate disclosure line visible near outbound links.</span>
            </div>
            <div className="flex items-start gap-2 bg-zinc-50 p-2.5 rounded border border-zinc-100">
              <span className="text-emerald-600 font-bold">10.</span>
              <span><strong>Uniqueness pass:</strong> Page contains at least one element merchant page lacks (verdict reason, history insight, alternatives).</span>
            </div>
          </div>
        </section>

        {/* Published Products Table */}
        <section className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-zinc-900 mb-4">
            Published Products ({products.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Tested / Source</th>
                  <th className="py-2.5 px-3">Editor Rating</th>
                  <th className="py-2.5 px-3">Verdict</th>
                  <th className="py-2.5 px-3">Author</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/70">
                    <td className="py-3 px-3 font-medium text-zinc-900">
                      {p.title}
                    </td>
                    <td className="py-3 px-3 capitalize">
                      {p.category.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3">
                      {p.tested === 1 ? (
                        <span className="text-indigo-700 font-bold">
                          Tested ({p.tested_disclosure || 'retail'})
                        </span>
                      ) : (
                        <span className="text-zinc-500">Tracked</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold text-zinc-900">
                      {p.editor_rating} / 5
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] bg-zinc-100 px-2 py-0.5 rounded">
                        {p.verdictResult?.verdict || 'unknown'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-600">
                      {p.author_name || 'Staff'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <a
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="text-emerald-700 font-semibold hover:underline"
                      >
                        View Page
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
