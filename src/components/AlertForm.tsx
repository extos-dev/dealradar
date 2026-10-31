'use client';

import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertCircle } from 'lucide-react';

interface AlertFormProps {
  productId: string;
  suggestedTargetPrice?: number | null;
  productTitle: string;
}

export function AlertForm({ productId, suggestedTargetPrice, productTitle }: AlertFormProps) {
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState(
    suggestedTargetPrice ? suggestedTargetPrice.toFixed(2) : ''
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          productId,
          targetPrice: parseFloat(targetPrice),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to set alert');
      }

      setStatus('success');
      setMessage(data.message || 'Price drop alert configured! Check your inbox to confirm double opt-in.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 my-6">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="w-5 h-5 text-emerald-700" />
        <h4 className="font-bold text-zinc-900 text-sm">
          Never Overpay: Set Price-Drop Alert
        </h4>
      </div>
      <p className="text-xs text-zinc-600 mb-4">
        We check merchant prices throughout the day. We'll email you the moment {productTitle} drops to or below your target.
      </p>

      {status === 'success' ? (
        <div className="bg-white border border-emerald-300 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-700 leading-relaxed">
            <p className="font-semibold text-zinc-900 mb-1">Check your email to confirm</p>
            {message}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Your Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Notify me if price drops below ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="Target Price"
                className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Saving Alert...' : 'Create Price Alert'}
            </button>
            <span className="text-[10px] text-zinc-500">
              Double opt-in • 1-click unsubscribe • No spam
            </span>
          </div>
        </form>
      )}
    </div>
  );
}
