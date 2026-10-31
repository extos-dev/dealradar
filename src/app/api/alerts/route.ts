import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, productId, targetPrice } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (!productId || typeof targetPrice !== 'number' || targetPrice <= 0) {
      return NextResponse.json({ error: 'Valid product and target price are required' }, { status: 400 });
    }

    // Upsert subscriber
    let subscriber = db.prepare('SELECT id, confirmed_at FROM subscribers WHERE email = ?').get(email) as any;
    let subscriberId = subscriber?.id;
    let isConfirmed = !!subscriber?.confirmed_at;

    if (!subscriber) {
      subscriberId = crypto.randomUUID();
      const token = crypto.randomBytes(24).toString('hex');
      db.prepare(`
        INSERT INTO subscribers (id, email, confirmation_token, signup_source, created_at)
        VALUES (?, ?, ?, 'price_alert_modal', CURRENT_TIMESTAMP)
      `).run(subscriberId, email, token);
    }

    // Insert alert
    const alertId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO alerts (id, subscriber_id, product_id, target_price, active)
      VALUES (?, ?, ?, ?, 1)
    `).run(alertId, subscriberId, productId, targetPrice);

    return NextResponse.json({
      success: true,
      isConfirmed,
      message: isConfirmed
        ? 'Alert active! You are already confirmed.'
        : 'Please click the verification link sent to your email to activate price drop notifications.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
