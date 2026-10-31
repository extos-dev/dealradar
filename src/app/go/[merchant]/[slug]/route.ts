import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isBotTraffic, generateSessionHash, buildAffiliateRedirect } from '@/lib/tracking';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ merchant: string; slug: string }> }
) {
  const { merchant, slug } = await params;
  const searchParams = req.nextUrl.searchParams;

  const src = searchParams.get('src') || 'organic';
  const campaign = searchParams.get('campaign') || undefined;
  const variant = searchParams.get('variant') || undefined;
  const userAgent = req.headers.get('user-agent') || undefined;
  const prefetchHeader = req.headers.get('purpose') === 'prefetch' || req.headers.get('x-moz') === 'prefetch';

  // Find product and offer
  const product = db.prepare('SELECT id, slug FROM products WHERE slug = ?').get(slug) as any;
  if (!product) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const offer = db.prepare('SELECT id, affiliate_url FROM offers WHERE product_id = ? AND merchant = ?').get(product.id, merchant) as any;
  const baseAffiliateUrl = offer?.affiliate_url || 'https://www.amazon.com';

  const isBot = isBotTraffic({
    userAgent,
    hasJavaScriptPrefetchHeader: prefetchHeader,
  });

  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const sessionHash = generateSessionHash(ip, userAgent);

  // Check duplicate clicks within 2 seconds
  const recentDuplicate = db.prepare(`
    SELECT id FROM clicks
    WHERE session_hash = ? AND product_id = ?
    AND clicked_at >= datetime('now', '-2 seconds')
  `).get(sessionHash, product.id);

  if (!recentDuplicate) {
    db.prepare(`
      INSERT INTO clicks (
        product_id, offer_id, merchant, src, campaign, variant, page, session_hash, is_bot, clicked_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      product.id,
      offer?.id || null,
      merchant,
      src,
      campaign || null,
      variant || null,
      `/products/${slug}`,
      sessionHash,
      isBot ? 1 : 0
    );
  }

  const targetUrl = buildAffiliateRedirect({
    merchant,
    productSlug: slug,
    src,
    campaign,
    variant,
  }, baseAffiliateUrl);

  const response = NextResponse.redirect(targetUrl, 302);
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
