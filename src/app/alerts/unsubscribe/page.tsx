import React from 'react';
import { SiteHeader, SiteFooter } from '@/components/LayoutComponents';
import { db } from '@/lib/db';
import { CheckCircle2 } from 'lucide-react';


interface UnsubscribePageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const { email } = await searchParams;

  if (email) {
    db.prepare('UPDATE subscribers SET unsubscribed_at = CURRENT_TIMESTAMP WHERE email = ?').run(email);
    db.prepare(`
      UPDATE alerts SET active = 0
      WHERE subscriber_id IN (SELECT id FROM subscribers WHERE email = ?)
    `).run(email);
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-zinc-950 mb-2">Unsubscribed Successfully</h1>
          <p className="text-sm text-zinc-600 leading-relaxed mb-6">
            {email
              ? `You (${email}) have been removed from all price drop alerts and weekly deal digests.`
              : 'You have been unsubscribed from all alerts and communications.'}
          </p>
          <a
            href="/"
            className="px-6 py-2.5 bg-zinc-800 text-white font-bold text-xs rounded-lg hover:bg-zinc-900 transition-colors inline-block"
          >
            Back to GadgetPulse
          </a>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
