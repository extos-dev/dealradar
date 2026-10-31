import React from 'react';
import { SiteHeader, SiteFooter } from '@/components/LayoutComponents';
import { db } from '@/lib/db';
import { CheckCircle2, AlertTriangle } from 'lucide-react';


interface ConfirmPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ConfirmAlertPage({ searchParams }: ConfirmPageProps) {
  const { token } = await searchParams;

  let confirmed = false;
  let message = 'Invalid or expired confirmation link.';

  if (token) {
    const subscriber = db.prepare('SELECT id, email, confirmed_at FROM subscribers WHERE confirmation_token = ?').get(token) as any;
    if (subscriber) {
      if (!subscriber.confirmed_at) {
        db.prepare('UPDATE subscribers SET confirmed_at = CURRENT_TIMESTAMP WHERE id = ?').run(subscriber.id);
      }
      confirmed = true;
      message = `Your email (${subscriber.email}) is confirmed! Your price-drop alerts are now active.`;
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
          {confirmed ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-zinc-950 mb-2">Subscription Confirmed</h1>
              <p className="text-sm text-zinc-600 leading-relaxed mb-6">{message}</p>
              <a
                href="/deals"
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition-colors inline-block"
              >
                Browse Today's Deals
              </a>
            </>
          ) : (
            <>
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-zinc-950 mb-2">Confirmation Issue</h1>
              <p className="text-sm text-zinc-600 leading-relaxed mb-6">{message}</p>
              <a
                href="/"
                className="px-6 py-2.5 bg-zinc-800 text-white font-bold text-xs rounded-lg hover:bg-zinc-900 transition-colors inline-block"
              >
                Return to Home
              </a>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
