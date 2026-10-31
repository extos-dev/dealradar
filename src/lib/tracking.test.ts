import { describe, it, expect } from 'vitest';
import { isBotTraffic, generateSessionHash, buildAffiliateRedirect } from './tracking';

describe('Tracking and Redirect logic', () => {
  it('detects common search and scraper bots', () => {
    expect(isBotTraffic({ userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' })).toBe(true);
    expect(isBotTraffic({ userAgent: 'facebookexternalhit/1.1' })).toBe(true);
    expect(isBotTraffic({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' })).toBe(false);
  });

  it('detects prefetch headers as bot/prefetch traffic', () => {
    expect(isBotTraffic({ userAgent: 'Mozilla/5.0 Chrome', hasJavaScriptPrefetchHeader: true })).toBe(true);
  });

  it('generates salted session hash without storing raw IP', () => {
    const hash1 = generateSessionHash('192.168.1.1', 'Mozilla/5.0');
    const hash2 = generateSessionHash('192.168.1.1', 'Mozilla/5.0');
    const hash3 = generateSessionHash('192.168.1.2', 'Mozilla/5.0');

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash1).not.toContain('192.168.1.1');
  });

  it('maps Amazon tracking tag based on channel source', () => {
    const amazonUrl = 'https://www.amazon.com/dp/B09XYZ?tag=old-tag';

    const tiktokRedirect = buildAffiliateRedirect({
      merchant: 'amazon',
      productSlug: 'anker-charger',
      src: 'tiktok',
    }, amazonUrl);
    expect(tiktokRedirect).toContain('tag=gadget-tiktok-20');

    const ytRedirect = buildAffiliateRedirect({
      merchant: 'amazon',
      productSlug: 'anker-charger',
      src: 'youtube',
    }, amazonUrl);
    expect(ytRedirect).toContain('tag=gadget-yt-20');

    const emailRedirect = buildAffiliateRedirect({
      merchant: 'amazon',
      productSlug: 'anker-charger',
      src: 'email',
    }, amazonUrl);
    expect(emailRedirect).toContain('tag=gadget-email-20');
  });
});
