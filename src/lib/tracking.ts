import crypto from 'crypto';

export interface BotCheckInput {
  userAgent?: string | null;
  hasJavaScriptPrefetchHeader?: boolean;
}

export function isBotTraffic(input: BotCheckInput): boolean {
  const ua = (input.userAgent || '').toLowerCase();
  if (!ua) return true;

  if (input.hasJavaScriptPrefetchHeader) {
    return true;
  }

  const botPatterns = [
    'bot',
    'crawl',
    'spider',
    'slurp',
    'googlebot',
    'bingbot',
    'yandex',
    'duckduckbot',
    'baiduspider',
    'facebot',
    'facebookexternalhit',
    'twitterbot',
    'applebot',
    'semrush',
    'ahrefsbot',
    'petalbot',
  ];

  return botPatterns.some((pattern) => ua.includes(pattern));
}

export function generateSessionHash(ip?: string | null, userAgent?: string | null): string {
  const salt = 'gadgetpulse_compliance_salt_2026';
  const raw = `${ip || 'unknown'}:${userAgent || 'unknown'}:${salt}`;
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

export interface OutboundRedirectParams {
  merchant: string;
  productSlug: string;
  src?: string;
  campaign?: string;
  variant?: string;
}

export function buildAffiliateRedirect(params: OutboundRedirectParams, baseAffiliateUrl: string): string {
  // If Amazon, map tracking ID channel based on src
  // Amazon tracking IDs: site-organic, tiktok, youtube, instagram, email
  try {
    const url = new URL(baseAffiliateUrl);
    if (params.merchant.toLowerCase() === 'amazon') {
      const allowedChannels: Record<string, string> = {
        organic: 'site-organic-20',
        tiktok: 'gadget-tiktok-20',
        youtube: 'gadget-yt-20',
        instagram: 'gadget-ig-20',
        email: 'gadget-email-20',
      };
      const channel = params.src?.toLowerCase() || 'organic';
      const tag = allowedChannels[channel] || 'site-organic-20';
      url.searchParams.set('tag', tag);
    }
    return url.toString();
  } catch {
    return baseAffiliateUrl;
  }
}
