# MVP Spec: Tech Gadget Deal and Price-Drop Site

*Version 1. Trimmed from the full affiliate-marketplace spec. Written for a coding agent plus one human editor.*

## 1. Goal

Launch a US-only site that helps shoppers decide whether a tech gadget is worth buying right now, using tracked price history and short verdicts, and that captures emails through price-drop alerts.

In 90 days the MVP must prove three things: people click through to merchants, people subscribe to alerts, and earnings per click is high enough to justify building automation.

Working name: TBD (placeholder: GadgetPulse). Domain: TBD.

## 2. Positioning and niche

**Promise:** 'Is this gadget a good price right now? We track the price so you do not have to guess.'

**Niche:** tech gadgets, price band $15 to $150, US shoppers, English only.

**Four launch categories (no others):**

1. Power and charging (power banks, GaN chargers, cables, wireless chargers)
2. Smart home (plugs, bulbs, sensors, cameras, hubs)
3. Audio (earbuds, headphones, speakers)
4. Desk and workspace (webcams, hubs, keyboards, mice, lighting, stands)

**Why this niche:** high search volume for 'best X under $Y', prices change often (so alerts have value), products are easy to demo on video, and ratings plus spec data are more reliable than in novelty categories.

## 3. Scope

### In scope

- Product pages with price history chart and price verdict
- Deals page listing only products with a verified verdict
- Collection pages ('best power banks under $50')
- Price-drop alerts and a daily/weekly digest by email
- Internal /go/ redirects with click logging
- Admin screen for manual product approval and editorial text
- Disclosure, privacy, terms, about, and a 'How we judge deals' page

### Out of scope for MVP (do not build)

- Temu and AliExpress
- Dropshipping, checkout, user accounts, reviews or comments
- Social auto-posting and video generation
- Product scoring engine, trend scraping, Meta Ad Library, Google Trends ingestion
- Multi-country support, localization, currency conversion
- Microservices, Redis, queues, search engine, mobile app
- Display ads (add later on guide pages only)

## 4. Merchants and data sources

| Merchant | Role | Notes |
|---|---|---|
| Amazon Associates | Primary | Use the product-advertising API (PA-API or its current successor; verify which is active) for product data. Verify current terms on price display, caching, and API access requirements before building. |
| Walmart (via Impact) | Secondary | Product and price data via its affiliate API. |
| Best Buy | Secondary | Has a public product API and affiliate program (verify program network and terms). |
| eBay Partner Network | Optional | Useful for refurbished and open-box deals. |

**Price history source:** a paid price-history service for Amazon (for example Keepa; verify its terms for commercial use) plus your own captured price points from each merchant API going forward.

**Hard rules for data:**

- Never scrape merchants if their terms forbid it.
- Never display a price older than the merchant's allowed freshness window (verify; for Amazon it has historically been about 24 hours). If a price is stale, show 'Check current price' instead of a number.
- Never use a merchant-stated 'list price' or 'was price' to claim a discount. Only our own tracked history counts.

**Cold-start plan (important):** there is no price history on day one, so no product can show a verdict yet.

1. Backfill history from the price-history service when a product is added.
2. Until a product has enough history, it shows 'Tracking started, verdict coming soon' and is excluded from /deals.
3. The homepage launches with curated collections and hands-on picks, not a deals feed.

## 5. Site map

```text
/                         Home
/deals                    Verified price drops (only products with a verdict)
/products/[slug]          Product detail
/best/[collection-slug]   Collection (SEO pages)
/alerts/confirm           Double opt-in confirmation
/alerts/unsubscribe       One-click unsubscribe
/guides/how-we-judge-deals
/about  /disclosure  /privacy  /terms
/go/[merchant]/[slug]     Affiliate redirect (not indexed)
/admin                    Protected editor interface
```

### Home

Hero with the promise and an email signup, 'Verified price drops' (top 8 from /deals, hidden if fewer than 4 qualify), four category tiles, 'Hands-on picks' (products flagged tested), a short 'How we judge deals' block.

### Product detail (the key page)

Order of blocks:

1. Breadcrumb, title, image, rating and review count (from merchant data, labeled with source)
2. **Verdict badge and one-line reason** (see section 7)
3. Current price per merchant with 'Checked [time]' and 'Check price at [merchant]' buttons (rel='sponsored nofollow', routed through /go/)
4. Price history chart (90 days, with 90-day median and low marked)
5. Alert form: 'Email me if this drops below $X' (prefilled with the 90-day low)
6. Editor verdict: best for, avoid if, 3 pros, 3 cons, 2 to 4 short paragraphs
7. Tested badge if hands-on (with our own photos or video), otherwise the label 'Price-tracked pick'
8. Specs table, 3 alternatives, short FAQ
9. Disclosure line near every outbound button

## 6. Data model

PostgreSQL. Keep it small.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL,            -- one of the four launch categories
  gtin TEXT,                         -- UPC/EAN when available, used for matching
  image_url TEXT,
  specs JSONB,
  verdict_text TEXT,                 -- editor-written
  pros TEXT[], cons TEXT[],
  best_for TEXT, avoid_if TEXT,
  tested BOOLEAN DEFAULT false,      -- true only if hands-on tested
  editor_rating SMALLINT,            -- 1-5, human judgment, never commission-based
  status TEXT DEFAULT 'draft',       -- draft | approved | published | archived
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  merchant TEXT NOT NULL,            -- amazon | walmart | bestbuy | ebay
  merchant_sku TEXT NOT NULL,        -- ASIN, item id, etc.
  affiliate_url TEXT NOT NULL,
  current_price NUMERIC,
  in_stock BOOLEAN,
  rating NUMERIC, review_count INTEGER,
  price_checked_at TIMESTAMPTZ,
  UNIQUE (merchant, merchant_sku)
);

CREATE TABLE price_points (
  id BIGSERIAL PRIMARY KEY,
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL               -- backfill | api | manual
);
CREATE INDEX ON price_points (offer_id, captured_at DESC);

CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  intro TEXT,
  published BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE collection_items (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  position INTEGER,
  editor_note TEXT,
  PRIMARY KEY (collection_id, product_id)
);

CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  signup_source TEXT,                -- page or campaign
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  target_price NUMERIC NOT NULL,
  last_notified_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true
);

CREATE TABLE clicks (
  id BIGSERIAL PRIMARY KEY,
  product_id UUID, offer_id UUID,
  merchant TEXT,
  src TEXT, campaign TEXT, variant TEXT,   -- from query params
  page TEXT,                                -- page the click came from
  session_hash TEXT,                        -- salted hash, no raw IP stored
  is_bot BOOLEAN DEFAULT false,
  clicked_at TIMESTAMPTZ DEFAULT now()
);
```

## 7. Price verdict logic

Verdicts are computed per product from the best in-stock offer. The agent must implement this as a pure function with unit tests.

**Inputs:** price points for the last 90 days, current price, price freshness.

**Minimum data to issue any verdict:** at least 30 days of history AND at least 14 price points in the last 90 days AND current price checked within the freshness window. Otherwise the verdict is `unknown`.

| Verdict | Rule |
|---|---|
| `great_price` | Current price is at least 15% below the 90-day median AND within 5% of the 90-day low |
| `good_price` | Current price is 5% to 15% below the 90-day median |
| `typical` | Within 5% of the 90-day median |
| `above_typical` | More than 5% above the 90-day median (never promoted, shown honestly on the page) |
| `unknown` | Not enough data or stale price |

**Rules:**

- Only `great_price` and `good_price` appear in /deals and in alert emails.
- Use the 90-day median, not the average, so one-off spikes do not distort it.
- Show the reason in plain English ('$24.99 is 22% below its 90-day median of $32.00 and 3% above its 90-day low').
- If the median itself rose sharply in the last 30 days compared with the prior 60 (possible inflate-then-discount pattern), cap the verdict at `good_price` and add a note.

## 8. Product approval and editorial standards

A product moves from `draft` to `published` only when an editor ticks all of these in /admin:

- [ ] At least one valid offer with a working affiliate link
- [ ] Merchant rating at least 4.0 with at least 200 reviews (editor can override with a written reason)
- [ ] Ships to US addresses and is in stock
- [ ] Title is accurate and not misleading
- [ ] Verdict text, pros, cons, best-for, avoid-if written (an AI draft is allowed; a human must edit and approve)
- [ ] No health, safety, or performance claims we cannot support (power-bank capacity, battery life, and charging speeds must match the manufacturer's spec or our own test)
- [ ] `tested` is true only if we actually used the product; otherwise label it 'Price-tracked pick'
- [ ] Disclosure present

**Ranking rule:** collections and category pages are ordered by `editor_rating`, then verdict, then price. Commission rate is never an input to ranking or to the verdict. This is what makes the line 'commissions do not affect which products we recommend' true.

## 9. Alerts and email

- Provider: Resend or Buttondown (pick one).
- Double opt-in. Every email has a one-click unsubscribe and a physical mailing address in the footer (CAN-SPAM).
- **Price-drop alert:** a background job checks active alerts after each price refresh and sends one email when the target price is met. Cooldown: one email per alert per 7 days.
- **Digest:** weekly at launch (daily once there are enough qualifying deals). Max 5 items, only `great_price` or `good_price`.
- **Important:** emails link to our own product pages, not directly to Amazon. Each product page then carries the affiliate buttons. This keeps the email channel compliant with Amazon's rules on where affiliate links may appear (verify current terms).

## 10. Click tracking and attribution

- Outbound buttons link to `/go/[merchant]/[product-slug]?src=...&campaign=...&variant=...`.
- The handler logs a row in `clicks`, filters obvious bots (known user agents, no-JS prefetch, duplicate hits within 2 seconds), then responds with a 302 to the affiliate URL.
- `/go/` is excluded in robots.txt and responds with `X-Robots-Tag: noindex`.
- **Amazon tracking IDs:** create one per channel (for example `site-organic`, `tiktok`, `youtube`, `instagram`, `email`) so reports show earnings per channel. The redirect picks the ID from `src`. Amazon limits how many tracking IDs an account can have, so use channels, not individual videos, and track videos by `campaign` in our own `clicks` table.
- No raw IP storage. Cookie banner only if non-essential cookies or third-party trackers are used; prefer a cookieless analytics tool (Plausible).

## 11. Content and social workflow (manual, agent-assisted)

No auto-posting in the MVP. The agent produces drafts; the human approves and posts.

**Per product, the agent generates:** product-page draft, 3 short-video hooks, one caption per platform, and a short script for a 20 to 35 second vertical video.

**Video formats (start with three):**

1. 'Is this a good price?' (shows the price chart and verdict)
2. 'Tested' hands-on demo (for the hero products)
3. 'Under $X' roundups linking to a collection page

**Link strategy:** link in bio points to the relevant collection or product page on our site (never directly to a merchant). Each video gets a `campaign` ID in the link.

**Hands-on testing:** buy or borrow around 10 hero products across the four categories in the first 60 days. Film original footage and photos. This is what separates the site from AI-generated aggregator pages and is the main SEO and trust asset.

**Start with one video platform** (TikTok or YouTube Shorts, owner's choice) and post to a second only after the first has a repeatable format.

## 12. Tech stack

| Layer | Choice |
|---|---|
| App | Next.js (App Router) + TypeScript + Tailwind |
| DB | PostgreSQL (Neon or Supabase) with Drizzle ORM |
| Jobs | One scheduled worker (Vercel Cron or a single Node process): price refresh, alert checks, digest send |
| Email | Resend or Buttondown |
| Analytics | Plausible plus the internal `clicks` table |
| Hosting | Vercel for the app; images via the merchant's allowed image URLs or our own uploads for tested products |
| Admin | Simple password-protected /admin route in the same app |

**Architecture rule:** one repo, one deployable app, one worker. No microservices, queues, Redis, or search engine until traffic proves they are needed.

**SEO basics:** server-rendered pages, unique title and meta description per page, Product + Offer + BreadcrumbList structured data where eligible (do not mark up ratings we do not own), sitemap.xml, last-updated date on every product and collection page.

## 13. Compliance

- Affiliate disclosure near every outbound button and in the footer, in plain language.
- Amazon Associates identification statement wherever Amazon links appear (use the exact current wording from the Associates operating agreement).
- No discount claims that our tracked history does not support; no fake scarcity, fake reviews, or countdown timers.
- No health or exaggerated performance claims.
- Respect each merchant program's rules on price display, coupons, and link placement. Re-check these terms before launch and each quarter.
- Privacy policy, terms, contact details, and unsubscribe handling in place before any email is collected.
- Human approval before any product is published.

## 14. Build plan with acceptance criteria

### M0: Accounts and data access (before coding the pipeline)

- Amazon Associates account approved and API access confirmed (or documented workaround)
- Price-history service account and a test pull for 5 ASINs
- Walmart and Best Buy affiliate and API access confirmed
- **Done when:** the team can fetch current price, rating, and 90 days of history for 5 test products from at least two sources, within each source's terms.

### M1: Core site

- Database, migrations, seed script, admin product editor with approval checklist
- Product page, collection page, home, static pages
- /go/ redirect with click logging
- **Done when:** an editor can add a product, approve it, and see it published with a working tracked outbound link; a click appears in `clicks`.

### M2: Price tracking and verdicts

- Scheduled price refresh, backfill on product add, price chart
- Verdict function with unit tests covering every row in section 7 and the cold-start cases
- /deals page showing only `great_price` and `good_price`
- **Done when:** unit tests pass, a product with insufficient data shows `unknown` and is absent from /deals, and stale prices display 'Check current price'.

### M3: Alerts and email

- Signup form, double opt-in, unsubscribe, alert creation, alert job, weekly digest
- **Done when:** a test subscriber confirms, sets a target price, receives exactly one email when a price crosses it, and can unsubscribe in one click.

### M4: Launch readiness

- 60 published products across the four categories (at least 10 tested), 8 collections, 'How we judge deals' page
- Sitemap, structured data, Plausible, legal pages, disclosure checks
- **Done when:** every published product passes the approval checklist and a manual link audit finds no broken or untracked outbound links.

**Fast path if you need to launch around Black Friday:** do M0, M1, and M3 first, launch with curated collections and email capture, and let M2 follow as history accumulates.

## 15. 90-day success thresholds

These are starting targets. Adjust them after the first four weeks of real data, but write the final numbers down before launch so the decision is not made after the fact.

| Metric | Starting target |
|---|---|
| Published products | 60+ (10+ tested) |
| Confirmed email subscribers | 500+ |
| Outbound clicks as share of product-page visits | 25%+ |
| Earnings per click (blended) | $0.05+ |
| Revenue per 1,000 video views | $0.50+ |
| Videos posted | 3 to 4 per week |

**Decision gate at day 90:**

- If email growth and earnings per click meet targets, invest in automation (ingestion, scoring, content drafts).
- If traffic is fine but earnings per click is low, change merchants or categories toward higher-priced items before building anything.
- If traffic is the problem, change the video format or platform before touching the site.
- If nothing moves after two format changes, stop or pivot rather than expanding scope.

## 16. Open items for the owner

- Brand name and domain
- Amazon Associates approval status and tracking-ID plan
- Price-history service choice and budget
- Which video platform to start with
- Who writes and approves editorial text (the human-in-the-loop)
- Whether to buy test products or borrow them
- Verification of all merchant API and program terms noted above

## 17. Rules for the building agent

1. Build only what is in section 3 'In scope'. If something seems missing, write a note and ask rather than adding it.
2. Implement milestones in order and stop at each 'Done when' check to report results.
3. Treat merchant terms as hard constraints. If a data approach looks like it might violate them, flag it and propose an alternative instead of proceeding.
4. Write unit tests for the verdict function, redirect handler, and alert job before wiring them to the UI.
5. Never let commission rate influence ranking, verdicts, or labels.
6. Never display a discount or 'was' price that is not derived from our tracked history.
7. Keep the app a single deployable plus one worker; no new infrastructure without approval.
