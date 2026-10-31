> **Redline — spec v1.0 → v1.1 (P0/P1 fixes merged as tracked changes).** `<ins>…</ins>` = inserted text, `~~…~~` = deleted original text, `[^n]` = review comment (finding ID + primary source in the footnotes at the end). Scope: C-1…C-7, S-1, S-2 only; P2 not applied.

---

# MVP Spec: Tech Gadget Deal and Price-Drop Site [^1]

*Version 1. Trimmed from the full affiliate-marketplace spec. Written for a coding agent plus one human editor.* <ins>*Version 1.1 (2026-10-31, tracked draft): merges the P0 and P1 fixes from the SEO and affiliate-compliance gap review (findings C-1 to C-7 and S-1 to S-2) as tracked changes; every change carries a comment with its finding ID and primary source.*</ins> [^2]

## 1. Goal

Launch a US-only site that helps shoppers decide whether a tech gadget is worth buying right now, using tracked price history and short verdicts, and that captures emails through price-drop alerts.

In 90 days the MVP must prove three things: people click through to merchants, people subscribe to alerts, and earnings per click is high enough to justify building automation.

Working name: TBD (placeholder: GadgetPulse). Domain: TBD.

## 2. Positioning and niche

**Promise:** 'Is this gadget a good price right now? We track the price so you do not have to guess.'

**Niche:** tech gadgets, price band $15 to $150, US shoppers, English only.

**Four launch categories (no others):**

1\. Power and charging (power banks, GaN chargers, cables, wireless chargers)

2\. Smart home (plugs, bulbs, sensors, cameras, hubs)

3\. Audio (earbuds, headphones, speakers)

4\. Desk and workspace (webcams, hubs, keyboards, mice, lighting, stands)

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

| **Merchant**         | **Role**  | **Notes**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|----------------------|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Amazon Associates    | Primary   | Use the product-advertising API ~~(PA-API or its current successor; verify which is active)~~<ins>the Creators API - the successor to PA-API 5.0, which Amazon has deprecated; confirm current access requirements</ins> for product data. Verify current terms on price display, caching, and API access requirements before building. [^3] |
| Walmart (via Impact) | Secondary | Product and price data via its affiliate API.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Best Buy             | Secondary | Has a public product API and affiliate program (verify program network and terms).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| eBay Partner Network | Optional  | Useful for refurbished and open-box deals.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

**Price history source:** a paid price-history service for Amazon (for example Keepa; verify its terms for commercial use) plus your own captured price points from each merchant API going forward.

**Hard rules for data:**

- Never scrape merchants if their terms forbid it.

- Never display a price older than the merchant's allowed freshness window (verify; for Amazon it has historically been about 24 hours). If a price is stale, show 'Check current price' instead of a number.

- Never use a merchant-stated 'list price' or 'was price' to claim a discount. Only our own tracked history counts.

**Cold-start plan (important):** there is no price history on day one, so no product can show a verdict yet.

1\. Backfill history from the price-history service when a product is added.

2\. Until a product has enough history, it shows 'Tracking started, verdict coming soon' and is excluded from /deals.

3\. The homepage launches with curated collections and hands-on picks, not a deals feed.

## 5. Site map

```text
/ Home

/deals Verified price drops (only products with a verdict)

/products/[slug] Product detail

/best/[collection-slug] Collection (SEO pages)

/alerts/confirm Double opt-in confirmation

/alerts/unsubscribe One-click unsubscribe

/guides/how-we-judge-deals

/about /disclosure /privacy /terms

/go/[merchant]/[slug] Affiliate redirect (not indexed)

/admin Protected editor interface
```text

### Home

Hero with the promise and an email signup, 'Verified price drops' (top 8 from /deals, hidden if fewer than 4 qualify), four category tiles, 'Hands-on picks' (products flagged tested), a short 'How we judge deals' block.

### Product detail (the key page)

Order of blocks:

1\. Breadcrumb, title, image, rating and review count (from merchant data, labeled with source)

2\. **Verdict badge and one-line reason** (see section 7)

3. Current price per merchant with 'Checked [time]' and 'Check price at [merchant]' buttons (rel='sponsored nofollow', routed through /go/) <ins>Amazon's required pricing/availability disclaimer appears adjacent to this block (see section 13).</ins> [^4]

4\. Price history chart (90 days, with 90-day median and low marked)

5\. Alert form: 'Email me if this drops below $X' (prefilled with the 90-day low)

6\. Editor verdict: best for, avoid if, 3 pros, 3 cons, 2 to 4 short paragraphs

7. Tested badge if hands-on (with our own photos or video), otherwise the label 'Price-tracked pick' <ins>plus a source note next to the badge when the unit was loaned, discounted, or returned (see section 8).</ins> [^5]

8\. Specs table, 3 alternatives, short FAQ

9. Disclosure ~~line near every outbound button~~<ins>Disclosure adjacent to the price block and above the first outbound button on /deals, /best/\*, and the home page; repeated (not collapsed) above the alternatives block; readable font size and contrast (see section 13).</ins> [^6]

## 6. Data model

```sql
PostgreSQL. Keep it small.

sql
CREATE TABLE products (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

slug TEXT UNIQUE NOT NULL,

title TEXT NOT NULL,

brand TEXT,

category TEXT NOT NULL, -- one of the four launch categories

gtin TEXT, -- UPC/EAN when available, used for matching

image_url TEXT,

specs JSONB,

verdict_text TEXT, -- editor-written

pros TEXT[], cons TEXT[],

best_for TEXT, avoid_if TEXT,

tested BOOLEAN DEFAULT false, -- true only if hands-on tested

editor_rating SMALLINT, -- 1-5, human judgment, never commission-based

 <ins>tested_disclosure TEXT, -- 'purchased' | 'loaner: [brand]' | 'discounted'; shown next to the Tested badge (see section 8)</ins> [^7]

status TEXT DEFAULT 'draft', -- draft | approved | published | archived

created_at TIMESTAMPTZ DEFAULT now(),

updated_at TIMESTAMPTZ DEFAULT now()

);


sql
CREATE TABLE offers (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

product_id UUID REFERENCES products(id) ON DELETE CASCADE,

merchant TEXT NOT NULL, -- amazon | walmart | bestbuy | ebay

merchant_sku TEXT NOT NULL, -- ASIN, item id, etc.

affiliate_url TEXT NOT NULL,

current_price NUMERIC,

in_stock BOOLEAN,

rating NUMERIC, review_count INTEGER,

price_checked_at TIMESTAMPTZ,

UNIQUE (merchant, merchant_sku)

);


sql
CREATE TABLE price_points (

id BIGSERIAL PRIMARY KEY,

offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,

price NUMERIC NOT NULL,

captured_at TIMESTAMPTZ NOT NULL,

source TEXT NOT NULL -- backfill | api | manual

);


CREATE INDEX ON price_points (offer_id, captured_at DESC);

sql
CREATE TABLE collections (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

slug TEXT UNIQUE NOT NULL,

title TEXT NOT NULL,

intro TEXT,

published BOOLEAN DEFAULT false,

updated_at TIMESTAMPTZ DEFAULT now()

);


sql
CREATE TABLE collection_items (

collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,

product_id UUID REFERENCES products(id) ON DELETE CASCADE,

position INTEGER,

editor_note TEXT,

PRIMARY KEY (collection_id, product_id)

);


sql
CREATE TABLE subscribers (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

email TEXT UNIQUE NOT NULL,

confirmed_at TIMESTAMPTZ,

unsubscribed_at TIMESTAMPTZ,

signup_source TEXT, -- page or campaign

created_at TIMESTAMPTZ DEFAULT now()

);


sql
CREATE TABLE alerts (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,

product_id UUID REFERENCES products(id) ON DELETE CASCADE,

target_price NUMERIC NOT NULL,

last_notified_at TIMESTAMPTZ,

active BOOLEAN DEFAULT true

);


sql
CREATE TABLE clicks (

id BIGSERIAL PRIMARY KEY,

product_id UUID, offer_id UUID,

merchant TEXT,

src TEXT, campaign TEXT, variant TEXT, -- from query params

page TEXT, -- page the click came from

session_hash TEXT, -- salted hash, no raw IP stored

is_bot BOOLEAN DEFAULT false,

clicked_at TIMESTAMPTZ DEFAULT now()

);
```sql

## 7. Price verdict logic

Verdicts are computed per product from the best in-stock offer. The agent must implement this as a pure function with unit tests.

**Inputs:** price points for the last 90 days, current price, price freshness.

**Minimum data to issue any verdict:** at least 30 days of history AND at least 14 price points in the last 90 days AND current price checked within the freshness window. Otherwise the verdict is \`unknown\`.

| **Verdict**       | **Rule**                                                                              |
|-------------------|---------------------------------------------------------------------------------------|
| \`great_price\`   | Current price is at least 15% below the 90-day median AND within 5% of the 90-day low |
| \`good_price\`    | Current price is 5% to 15% below the 90-day median                                    |
| \`typical\`       | Within 5% of the 90-day median                                                        |
| \`above_typical\` | More than 5% above the 90-day median (never promoted, shown honestly on the page)     |
| \`unknown\`       | Not enough data or stale price                                                        |

**Rules:**

- Only \`great_price\` and \`good_price\` appear in /deals and in alert emails.

- Use the 90-day median, not the average, so one-off spikes do not distort it.

- Show the reason in plain English ('$24.99 is 22% below its 90-day median of $32.00 and 3% above its 90-day low').

- If the median itself rose sharply in the last 30 days compared with the prior 60 (possible inflate-then-discount pattern), cap the verdict at \`good_price\` and add a note.

## 8. Product approval and editorial standards

A product moves from \`draft\` to \`published\` only when an editor ticks all of these in /admin:

- [ ] t least one valid offer with a working affiliate link

- [ ] erchant rating at least 4.0 with at least 200 reviews (editor can override with a written reason)

- [ ] hips to US addresses and is in stock

- [ ] itle is accurate and not misleading

- [ ] erdict text, pros, cons, best-for, avoid-if written (an AI draft is allowed; a human must edit and approve)

- [ ] o health, safety, or performance claims we cannot support (power-bank capacity, battery life, and charging speeds must match the manufacturer's spec or our own test)

- [ ] tested\` is true only if we actually used the product; otherwise label it 'Price-tracked pick'

- [ ] <ins>[ ] tested_disclosure set and shown next to the Tested badge whenever the unit was not bought at retail (loaner, discount, or return)</ins> [^8]

- [ ] isclosure present

- [ ] <ins>[ ] Uniqueness pass: the page contains at least one element a merchant page lacks (verdict reason, price-history insight, or alternatives note)</ins> [^9]

**Ranking rule:** collections and category pages are ordered by \`editor_rating\`, then verdict, then price. Commission rate is never an input to ranking or to the verdict. This is what makes the line 'commissions do not affect which products we recommend' true.

## 9. Alerts and email

- Provider: Resend or Buttondown (pick one).

- Double opt-in. Every email has a one-click unsubscribe and a physical mailing address in the footer (CAN-SPAM).

- <ins>Every alert and digest email carries an affiliate disclosure line in the footer (for example: 'We earn commissions when you buy through links on our site.').</ins> [^10]

- **Price-drop alert:** a background job checks active alerts after each price refresh and sends one email when the target price is met. Cooldown: one email per alert per 7 days.

- **Digest:** weekly at launch (daily once there are enough qualifying deals). Max 5 items, only \`great_price\` or \`good_price\`.

- **Important:** emails link to our own product pages, not directly to Amazon. Each product page then carries the affiliate buttons. This keeps the email channel compliant with Amazon's rules on where affiliate links may appear (verify current terms). <ins>No Amazon Special Links or Amazon marks appear anywhere in email; every email link points to our site only.</ins> [^11]

## 10. Click tracking and attribution

- Outbound buttons link to \`/go/[merchant]/[product-slug]?src=...&campaign=...&variant=...\`.

- The handler logs a row in \`clicks\`, filters obvious bots (known user agents, no-JS prefetch, duplicate hits within 2 seconds), then responds with a 302 to the affiliate URL.

- \`/go/\` is excluded in robots.txt and responds with \`X-Robots-Tag: noindex\`.

- **Amazon tracking IDs:** create one per channel (for example \`site-organic\`, \`tiktok\`, \`youtube\`, \`instagram\`, \`email\`) so reports show earnings per channel. The redirect picks the ID from \`src\`. Amazon limits how many tracking IDs an account can have, so use channels, not individual videos, and track videos by \`campaign\` in our own \`clicks\` table.

- No raw IP storage. Cookie banner only if non-essential cookies or third-party trackers are used; prefer a cookieless analytics tool (Plausible).

## 11. Content and social workflow (manual, agent-assisted)

No auto-posting in the MVP. The agent produces drafts; the human approves and posts. <ins>Approval includes checking that the disclosure is present in the script, the on-screen overlay, and the caption.</ins> [^12]

**Per product, the agent generates:** product-page draft, 3 short-video hooks, one caption per platform, and a short script for a 20 to 35 second vertical video.

<ins>**Disclosure (required in every video and post):** a verbal affiliate disclosure in the first seconds plus persistent on-screen text; each caption carries its own disclosure (for example '#ad' plus an affiliate statement); platform disclosure tools are used in addition to, not instead of, this text; the link-in-bio page repeats the disclosure (see section 13).</ins> [^13]

**Video formats (start with three):**

1\. 'Is this a good price?' (shows the price chart and verdict)

2\. 'Tested' hands-on demo (for the hero products)

3\. 'Under $X' roundups linking to a collection page

**Link strategy:** link in bio points to the relevant collection or product page on our site (never directly to a merchant). Each video gets a \`campaign\` ID in the link.

**Hands-on testing:** buy or borrow around 10 hero products across the four categories in the first 60 days. Film original footage and photos. This is what separates the site from AI-generated aggregator pages and is the main SEO and trust asset.

**Start with one video platform** (TikTok or YouTube Shorts, owner's choice) and post to a second only after the first has a repeatable format.

## 12. Tech stack

| **Layer** | **Choice**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| App       | Next.js (App Router) + TypeScript + Tailwind                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| DB        | PostgreSQL (Neon or Supabase) with Drizzle ORM                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Jobs      | One scheduled worker (Vercel Cron or a single Node process): price refresh, alert checks, digest send                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Email     | Resend or Buttondown                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Analytics | Plausible plus the internal \`clicks\` table                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Hosting   | Vercel for the app; images via the merchant's allowed image URLs or our own uploads for tested products<ins>; Amazon product images are re-resolved from Amazon at least every 24 hours and image bytes are never stored (see section 4)</ins> [^14] |
| Admin     | Simple password-protected /admin route in the same app                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

**Architecture rule:** one repo, one deployable app, one worker. No microservices, queues, Redis, or search engine until traffic proves they are needed.

**SEO basics:** server-rendered pages, unique title and meta description per page, Product + Offer + BreadcrumbList structured data where eligible (do not mark up ratings we do not own), sitemap.xml, last-updated date on every product and collection page. <ins>Structured-data policy: Review markup only for editorial verdicts attributed to a named editor with the review text visible on the page; never AggregateRating from merchant ratings or review counts.</ins> [^15]

## 13. Compliance

- ~~Affiliate disclosure near every outbound button and in the footer, in plain language.~~<ins>Affiliate disclosure adjacent to the price block and to every outbound-button group, above the first outbound button on listing pages, and in the footer; plain language, readable size, never collapsed behind an accordion or below the fold.</ins> [^16]

- Amazon Associates identification statement wherever Amazon links appear (use the exact current wording from the Associates operating agreement).

- <ins>Amazon pricing/availability disclaimer adjacent to every displayed price, exact wording: 'Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on [relevant Amazon Site(s), as applicable] at the time of purchase will apply to the purchase of this product.'</ins> [^17]

- <ins>'CERTAIN CONTENT THAT APPEARS [ON THIS SITE] COMES FROM AMAZON. THIS CONTENT IS PROVIDED AS IS AND IS SUBJECT TO CHANGE OR REMOVAL AT ANY TIME.' shown in plain view wherever Amazon content is displayed.</ins> [^18]

- No discount claims that our tracked history does not support; no fake scarcity, fake reviews, or countdown timers.

- No health or exaggerated performance claims.

- Respect each merchant program's rules on price display, coupons, and link placement. Re-check these terms before launch and each quarter.

- <ins>No Amazon Special Links or Amazon marks in email; email links point to our site only (see section 9).</ins> [^19]

- Privacy policy, terms, contact details, and unsubscribe handling in place before any email is collected.

- Human approval before any product is published.

## 14. Build plan with acceptance criteria

### M0: Accounts and data access (before coding the pipeline)

- Amazon Associates account approved and API access confirmed (or documented workaround)

- Price-history service account and a test pull for 5 ASINs

- Walmart and Best Buy affiliate and API access confirmed

- <ins>Written clarification (Amazon or counsel) on whether the per-merchant price block and the price-history chart fall under Amazon's 'comparison format' rule; if yes, extend the offers table to store Amazon's lowest new and lowest used prices.</ins> [^20]

- <ins>Written clarification on retaining PA-API/Creators API price points as historical analytics; if long-term retention is not permitted, buy full history from the price-history service instead. Confirm the Creators API migration path.</ins> [^21]

- **Done when:** the team can fetch current price, rating, and 90 days of history for 5 test products from at least two sources, within each source's terms.

### M1: Core site

- Database, migrations, seed script, admin product editor with approval checklist

- Product page, collection page, home, static pages

- /go/ redirect with click logging

- **Done when:** an editor can add a product, approve it, and see it published with a working tracked outbound link; a click appears in \`clicks\`.

### M2: Price tracking and verdicts

- Scheduled price refresh, backfill on product add, price chart

- Verdict function with unit tests covering every row in section 7 and the cold-start cases

- /deals page showing only \`great_price\` and \`good_price\`

- **Done when:** unit tests pass, a product with insufficient data shows \`unknown\` and is absent from /deals, and stale prices display 'Check current price'.

### M3: Alerts and email

- Signup form, double opt-in, unsubscribe, alert creation, alert job, weekly digest

- **Done when:** a test subscriber confirms, sets a target price, receives exactly one email when a price crosses it, and can unsubscribe in one click.

### M4: Launch readiness

- ~~60 published products~~<ins>40 to 60 published products - depth over breadth: every page carries at least one element a merchant page lacks (verdict reason, price-history insight, or alternatives note)</ins> across the four categories (at least 10 tested), 8 collections, 'How we judge deals' page [^22]

- Sitemap, structured data, Plausible, legal pages, disclosure checks

- **Done when:** every published product passes the approval checklist and a manual link audit finds no broken or untracked outbound links.

**Fast path if you need to launch around Black Friday:** do M0, M1, and M3 first, launch with curated collections and email capture, and let M2 follow as history accumulates.

## 15. 90-day success thresholds

These are starting targets. Adjust them after the first four weeks of real data, but write the final numbers down before launch so the decision is not made after the fact.

| **Metric**                                      | **Starting target**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|-------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Published products                              | ~~60+~~<ins>40 to 60, depth over breadth</ins> (10+ tested) [^23] |
| Confirmed email subscribers                     | 500+                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Outbound clicks as share of product-page visits | 25%+                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Earnings per click (blended)                    | $0.05+                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Revenue per 1,000 video views                   | $0.50+                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Videos posted                                   | 3 to 4 per week                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

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

1\. Build only what is in section 3 'In scope'. If something seems missing, write a note and ask rather than adding it.

2\. Implement milestones in order and stop at each 'Done when' check to report results.

3\. Treat merchant terms as hard constraints. If a data approach looks like it might violate them, flag it and propose an alternative instead of proceeding.

4\. Write unit tests for the verdict function, redirect handler, and alert job before wiring them to the UI.

5\. Never let commission rate influence ranking, verdicts, or labels.

6\. Never display a discount or 'was' price that is not derived from our tracked history.

7\. Keep the app a single deployable plus one worker; no new infrastructure without approval.


[^1]: **[Finding C-1]** Tracked-changes revision of spec v1.0. Insertions show as underlined text and deletions as struck-through text (Word: Review > Tracking > All Markup). All changes authored by 'SEO & Compliance Review', dated 2026-10-31. Scope: P0 and P1 findings only (C-1 to C-7, S-1, S-2) from the SEO & affiliate-compliance gap review; P2 findings (S-3 to S-8) are intentionally not applied. Every change carries a comment citing the finding ID and its primary source.

[^2]: **[Finding Note]** Revision record: the version line now marks this as the tracked P0/P1 revision of the gap review dated 2026-10-31.

[^3]: **[Finding C-3]** C-3 (High) - Amazon states PA-API 5.0 is deprecated and replaced by the Creators API; the spec must target it. Source: https://webservices.amazon.com/paapi5/documentation/ (Amazon PA-API deprecation / Creators API, fetched 2026-10-31)

[^4]: **[Finding C-1]** C-1 (Blocker) - Amazon requires its exact pricing/availability disclaimer adjacent to displayed prices when data comes from PA-API/Creators API or is refreshed less than hourly. Source: https://affiliate-program.amazon.com/help/operating/policies (Amazon Associates Program Policies, fetched 2026-10-31)

[^5]: **[Finding C-4]** C-4 (High) - FTC Endorsement Guides require disclosure of material connections (loaner/discount units); 16 CFR Part 465 bars reviews not based on genuine experience. Sources: https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking (FTC Endorsement Guides FAQ, fetched 2026-10-31) ; https://www.ecfr.gov/current/title-16/chapter-I/subchapter-D/part-465 (16 CFR Part 465, fetched 2026-10-31)

[^6]: **[Finding C-7]** C-7 (Medium) - FTC: disclosures must be clear and conspicuous - close to the endorsement, not buried in a footer, accordion, or below the fold. Source: https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking (FTC Endorsement Guides FAQ, fetched 2026-10-31)

[^7]: **[Finding C-4]** C-4 (High) - New products column carrying the disclosure shown next to the Tested badge.

[^8]: **[Finding C-4]** C-4 (High) - Approval checklist now requires the testing material-connection disclosure.

[^9]: **[Finding S-1]** S-1 (High) - Google's spam policies ('thin affiliation', 'scaled content abuse') target template pages with no added value. Source: https://developers.google.com/search/docs/essentials/spam-policies (Google spam policies, fetched 2026-10-31)

[^10]: **[Finding C-6]** C-6 (Medium) - The FTC disclosure travels with the endorsement, including email. Source: https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking (FTC Endorsement Guides FAQ, fetched 2026-10-31)

[^11]: **[Finding C-6]** C-6 (Medium) - Amazon permits Special Links in email only in solicited (opted-in) messages and prohibits Amazon marks in email. Source: https://affiliate-program.amazon.com/help/operating/policies (Amazon Associates Program Policies, fetched 2026-10-31)

[^12]: **[Finding C-5]** C-5 (High) - FTC: in interactive media the disclosure should be unavoidable; for video, audio + visual; platform tools alone are not sufficient. Source: https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking (FTC Endorsement Guides FAQ, fetched 2026-10-31)

[^13]: **[Finding C-5]** C-5 (High) - Video and caption disclosure requirements per the FTC Endorsement Guides. Source: https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking (FTC Endorsement Guides FAQ, fetched 2026-10-31)

[^14]: **[Finding C-3]** C-3 (High) - Amazon cache rules: non-image content max 24 hours; images may never be stored - only a link, refreshed within 24 hours. Source: https://affiliate-program.amazon.com/help/operating/policies (Amazon Associates Program Policies, fetched 2026-10-31)

[^15]: **[Finding S-2]** S-2 (High) - Google: do not aggregate reviews or ratings from other websites; review markup requires a named author and on-page visibility. Source: https://developers.google.com/search/docs/appearance/structured-data/review-snippet (Google review-snippet docs, fetched 2026-10-31)

[^16]: **[Finding C-7]** C-7 (Medium) - Makes the FTC clear-and-conspicuous requirement concrete (placement, size, no collapsing). Source: https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking (FTC Endorsement Guides FAQ, fetched 2026-10-31)

[^17]: **[Finding C-1]** C-1 (Blocker) - Exact wording required by the Amazon Associates Program Policies, adjacent to the price display. Source: https://affiliate-program.amazon.com/help/operating/policies (Amazon Associates Program Policies, fetched 2026-10-31)

[^18]: **[Finding C-1]** C-1 (Blocker) - Required notice wherever Amazon content is displayed. Source: https://affiliate-program.amazon.com/help/operating/policies (Amazon Associates Program Policies, fetched 2026-10-31)

[^19]: **[Finding C-6]** C-6 (Medium) - Reinforces the email-channel rule at the compliance level. Source: https://affiliate-program.amazon.com/help/operating/policies (Amazon Associates Program Policies, fetched 2026-10-31)

[^20]: **[Finding C-2]** C-2 (Blocker) - M0 verification task for the comparison-format rule. Source: https://affiliate-program.amazon.com/help/operating/policies (Amazon Associates Program Policies, fetched 2026-10-31)

[^21]: **[Finding C-3]** C-3 (High) - M0 verification task for price-point retention; fallback is the paid price-history service (section 4). Sources: https://affiliate-program.amazon.com/help/operating/policies (Amazon Associates Program Policies, fetched 2026-10-31) ; https://webservices.amazon.com/paapi5/documentation/ (Amazon PA-API deprecation / Creators API, fetched 2026-10-31)

[^22]: **[Finding S-1]** S-1 (High) - Launch-volume framing: depth over breadth against Google's thin-affiliation and scaled-content policies. Source: https://developers.google.com/search/docs/essentials/spam-policies (Google spam policies, fetched 2026-10-31)

[^23]: **[Finding S-1]** S-1 (High) - Threshold aligned with the depth-over-breadth framing in M4. Source: https://developers.google.com/search/docs/essentials/spam-policies (Google spam policies, fetched 2026-10-31)
