# Gap Review: SEO & Affiliate Compliance
## MVP Spec — Tech Gadget Deal and Price-Drop Site (tech-gadget-deal-site-mvp-spec.md)

*Prepared 2026-10-31. Every gap cites the spec by line number (L##) and every rule cites a source fetched during this review. Severity: **Blocker** = would violate a binding program rule or spam policy if built as written; **High** = likely compliance or ranking exposure; **Medium/Low** = quality or robustness gap.*

---

## Executive summary

The spec is unusually compliance-aware for an MVP (freshness gates, median-based verdicts, commission-blind ranking, rel="sponsored", double opt-in). The gaps that remain are mostly **Amazon-mandated display wording and data-retention limits**, **FTC disclosure rules outside the web page (video, email)**, and **Google policies the spec never names** (thin affiliation, dead FAQ rich results, review-markup boundaries).

| Severity | Count |
|---|---|
| Blocker / High | 8 |
| Medium | 6 |
| Low | 2 |

---

## Part A — Affiliate-compliance gaps

### C-1. Missing Amazon-mandated pricing disclaimers and the "CERTAIN CONTENT" notice — **Blocker**
- **Spec refs:** §5 product page block 3 (L98 — "Current price per merchant with 'Checked [time]'"), §13 (L289–290 — generic affiliate disclosure and Amazon identification statement only).
- **Rule (fetched):** Amazon's Associates Program Policies require, **adjacent to displayed pricing/availability** (or via hyperlink/pop-up), the exact wording: *"Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on [relevant Amazon Site(s), as applicable] at the time of purchase will apply to the purchase of this product."* — required whenever you call PA-API/Creators API or refresh less frequently than hourly. Separately, any application displaying Amazon text content must show in plain view: *"CERTAIN CONTENT THAT APPEARS [ON THIS SITE] COMES FROM AMAZON. THIS CONTENT IS PROVIDED AS IS AND IS SUBJECT TO CHANGE OR REMOVAL AT ANY TIME."* [Amazon Associates Program Policies](https://affiliate-program.amazon.com/help/operating/policies)
- **Gap:** The spec's disclosure checklist (L289–290, L104) covers the FTC disclosure and the Associates identification statement, but neither Amazon pricing disclaimer appears anywhere in the spec. A page with a price, "Checked 2:14 PM," and only a generic disclosure is out of compliance.
- **Fix:** Add both exact strings to §13 and to the product-page template: pricing disclaimer adjacent to the per-merchant price block (one instance per page, hyperlinked, is the common pattern — verify acceptability); "CERTAIN CONTENT…" notice in the site footer or near the price block.

### C-2. Multi-merchant price display triggers Amazon's "comparison format" rule — **Blocker**
- **Spec refs:** §5 block 3 (L98 — prices "per merchant"), §4 table (L53–57 — Amazon primary + Walmart/Best Buy/eBay), §7 (L207–221 — verdict text compares current price to history).
- **Rule (fetched):** If you display Amazon prices "in any comparison format (including through the use of any price-comparison tool or engine) together with prices for the same or similar products offered through any web site or other means other than an Amazon Site, you must display both the lowest new price and, if we provide it to you, the lowest used price at which the Product is available on the Amazon Site." [Amazon Associates Program Policies](https://affiliate-program.amazon.com/help/operating/policies)
- **Gap:** The product page shows Amazon next to Walmart/Best Buy prices — a comparison format — but the spec never requires Amazon's lowest **used** price or defines "lowest new" sourcing. The 90-day chart + verdict engine could also be read as a "price-comparison tool."
- **Fix:** M0 action: get a written read on whether the per-merchant price block and the history chart fall under the comparison-format rule; if yes, extend `offers` (L136–140) to store Amazon lowest-new and lowest-used and render them in block 3.

### C-3. Data retention: `price_points` history, image caching, and the PA-API → Creators API transition — **High**
- **Spec refs:** `products.image_url` (L118), `offers.current_price` / `price_checked_at` (L136–140), append-only `price_points` (L143–150), images "via the merchant's allowed image URLs" (L280), Keepa backfill (L59).
- **Rule (fetched):** Amazon permits caching **non-image** Product Advertising Content for **up to 24 hours**, then it must be immediately refreshed; images may **not** be stored or cached — only a *link* to the image, also for up to 24 hours; ASINs may be stored indefinitely. [Amazon Associates Program Policies](https://affiliate-program.amazon.com/help/operating/policies). Separately, Amazon's docs state PA-API 5.0 is deprecated and being replaced by the **Creators API**. [Amazon PA-API docs](https://webservices.amazon.com/paapi5/documentation/)
- **Gap:** The spec's own design — persisting every PA-API price point forever as the raw material for verdicts, and hot-linking `image_url` — sits in tension with the 24-hour cache limit and no-image-storage rule. The spec flags "PA-API or its current successor" (L54) but doesn't record that the successor (Creators API) is already announced. The verdict function depends entirely on data whose long-term storage status is unverified.
- **Fix:** Add to M0 (L299–304): (a) written clarification or counsel opinion on retaining PA-API price points as historical analytics — with fallback = buy full history from Keepa (L59) and treat our API captures as a nice-to-have; (b) image pipeline = re-resolve Amazon image links every ≤24h, never persist the bytes; (c) target the Creators API, not PA-API 5.

### C-4. Borrowed or free test products = undisclosed "insider reviews" — **High**
- **Spec refs:** §8 (L232 — `tested` flag true only if "we actually used the product"), §11 (L267 — "buy or borrow around 10 hero products"), §16 (L360 — "buy or borrow"), §8 (L227 — merchant-rating override).
- **Rule (fetched):** The FTC's rule on consumer reviews and testimonials (16 CFR Part 465) treats fake or false reviews — including those not based on genuine experience and undisclosed incentivized ones — as deceptive practices, and the final rule explicitly covers AI-generated fake reviewers. [FTC press release](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials), [16 CFR Part 465](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-D/part-465). Google's review-snippet guidance likewise bars "fake or undisclosed incentivized reviews." [Google review snippet docs](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
- **Gap:** The spec's `tested` flag records *that* testing happened, but nothing in §8 or §13 requires disclosing *how* — if a product was loaned, discounted, or returned after review, that material connection must be disclosed on the page. (The FTC's Endorsement Guides require disclosure of material connections generally. [FTC Endorsement Guides FAQ](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking))
- **Fix:** Extend the §8 checklist (L232) and the product-page template (L102) with a `tested_disclosure` field: "We purchased this" / "Loaner unit from [brand]" — published next to the Tested badge. Add "products not purchased at retail are disclosed" as a checkbox.

### C-5. No disclosure spec for video and social — **High**
- **Spec refs:** §11 (L253–269 — three video formats, captions, link-in-bio strategy); §13 (L289–295 — site-page disclosure only).
- **Rule (fetched):** The FTC's Endorsement Guides state that in "any communication using an interactive electronic medium, such as social media," the disclosure should be **unavoidable**; for video endorsements the FTC recommends **audio and visual** disclosure; platform disclosure tools alone are not assumed sufficient; each social post needs its own disclosure. [FTC Endorsement Guides FAQ](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking)
- **Gap:** The agent drafts hooks, captions, and scripts (L257), but no requirement anywhere says videos must contain a spoken + on-screen affiliate disclosure before the price/verdict claim, or that captions carry "#ad"/affiliate language per post. Videos start at 3–4/week (L344) from day one, so this gap ships immediately.
- **Fix:** Add to §11: every video script includes (a) verbal disclosure in the first seconds, (b) persistent on-screen text, (c) caption-level #ad + affiliate statement; each caption discloses individually; link-in-bio page repeats the disclosure. Add "disclosure present in script, overlay, and caption" to the human approval step (L255).

### C-6. Email channel: disclosure inside emails and Amazon's email-specific constraints — **Medium**
- **Spec refs:** §9 (L237–243 — alerts/digest; links to our own pages, not Amazon), §10 (L250 — one tracking ID per channel including `email`).
- **Rule (fetched):** Amazon permits Special Links in email **only if the communication is solicited (opted-in)**, and prohibits Amazon Marks in email entirely. [Amazon Associates Program Policies](https://affiliate-program.amazon.com/help/operating/policies). The FTC position: the material-connection disclosure travels with the endorsement — including in email. [FTC Endorsement Guides FAQ](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking)
- **Gap:** The spec's own-site-link design (L243) is the right architecture, but two things are unstated: (a) alert/digest emails still need an FTC disclosure line ("we earn commissions when you buy through links on our site"); (b) the spec must pin down that **no** Amazon link or Amazon branding ever appears in email — because if the digest ever shows a merchant price with a direct link, the opt-in-only condition binds. Double opt-in (L240) satisfies "solicited," but only if enforced before the first digest.
- **Fix:** Add email footer disclosure to the §9 email templates; add a §13 bullet: "No Amazon Special Links or Marks in email; email links point to our site only."

### C-7. "Clear and conspicuous" is left undefined on the page — **Medium**
- **Spec refs:** §5 block 9 (L104 — "Disclosure line near every outbound button"), §13 (L289).
- **Rule (fetched):** The FTC requires the disclosure to be clear and conspicuous — close to the endorsement/link, hard to miss, not buried in a footer, accordion, or below the fold; a general "this site contains affiliate links" page elsewhere is not sufficient. [FTC Endorsement Guides FAQ](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking)
- **Gap:** "Near every outbound button" is a good instinct but unenforceable as written — an editor can tick it with a 9px gray line under the fold on /deals, where many buttons appear with no disclosure visible on load.
- **Fix:** Make the disclosure spec concrete: page-level disclosure above the first outbound button on /deals, /best/*, and the homepage; per-product disclosure adjacent to block 3 (L98); minimum font-size/contrast; disclosure repeated (not collapsed) above the alternatives block.

---

## Part B — SEO gaps

### S-1. "Thin affiliation" is a named Google spam policy the spec never mentions — **High**
- **Spec refs:** §15 (L339 — 60+ published products by day 90), §11 (L253–257 — agent drafts, human edits), §2 (L21–24 — four narrow categories).
- **Rule (fetched):** Google's spam policies include **scaled content abuse** (many pages generated mainly to manipulate rankings) and, separately, **thin affiliation** — pages that provide little added value for users, common among affiliate sites that repeat manufacturer copy. [Google Search Essentials — spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- **Gap:** 60 template pages in four narrow categories, most without original media (only ~10 are tested, L339), with agent-drafted pros/cons and specs from merchant data, is exactly the profile Google's policies and product-reviews guidance target. The spec's own instinct — original footage is "the main SEO and trust asset" (L267) — isn't reflected in a launch-volume decision.
- **Fix:** Re-frame M4 (L326–329): depth over breadth — e.g., 30–40 pages with genuinely differentiated content (unique chart data is already a differentiator — surface it in the copy), no page published where verdict/verdict-reason duplicates the merchant description; each product page must contain at least one element a merchant page lacks (verdict reason, history insight, alternatives note). Add a pre-launch "uniqueness pass" to the §8 checklist.

### S-2. Review/rating structured-data boundaries need one explicit policy — **High**
- **Spec refs:** §5 block 1 (L96 — merchant "rating and review count"), §6 (L124 — `editor_rating` 1–5), §12 (L285 — "do not mark up ratings we do not own").
- **Rule (fetched):** Google: "Don't aggregate reviews or ratings from other websites"; marked-up review content must be visible on the page; reviews require a valid named `author`; no fake or undisclosed incentivized reviews. [Google review snippet docs](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
- **Gap:** L285 is right as far as it goes, but the spec leaves two edge cases open: (a) can `editor_rating` (L124) be marked up? — only if it is presented on-page as a named author's review, which the spec doesn't currently display; (b) can merchant ratings be marked up as AggregateRating? — no, per the no-aggregation rule. Implementers will improvise.
- **Fix:** Add a structured-data policy paragraph to §12: Product + Offer + BreadcrumbList only; Review markup only for editorial verdicts attributed to a named editor with visible review text on the page; never AggregateRating from merchant data; accept zero review stars in SERPs at launch. (S-8 adds the author byline that makes Review markup possible later.)

### S-3. FAQ rich results are gone — don't build for them — **Medium**
- **Spec refs:** §5 block 8 (L103 — "short FAQ"), §12 (L285 — structured data "where eligible").
- **Rule (fetched):** Google restricted FAQ rich results to well-known government and health sites in August 2023. [Google Search Central blog](https://developers.google.com/search/blog/2023/08/howto-faq-changes) Industry reporting records FAQ rich results being fully retired in May 2026 (secondary sources; primary confirmation unverified).
- **Gap:** Small, but worth one line so the coding agent doesn't add FAQPage markup expecting stars — and so the FAQ block is written for users/internal-linking, not snippets.
- **Fix:** One sentence in §12: "No FAQPage markup; FAQ content is for users only."

### S-4. Offer schema must obey the same freshness rule as the page — **Medium**
- **Spec refs:** §12 (L285 — Product + Offer markup), §6 (L136–140 — `current_price`, `price_checked_at`), §4 (L64 — stale prices show "Check current price").
- **Rule (fetched):** Product/Offer rich results require accurate price data; structured data must reflect what the user sees. [Google product structured data docs](https://developers.google.com/search/docs/appearance/structured-data/product), [Amazon Associates Program Policies](https://affiliate-program.amazon.com/help/operating/policies) (price display only from served link or PA-API/Creators data within cache limits)
- **Gap:** If markup emits a price while the page correctly hides a stale price ("Check current price"), the page and its structured data disagree — a policy mismatch and a bad rich result.
- **Fix:** Spec the template rule: emit `offers.price` in markup only when `price_checked_at` is within the freshness window; otherwise omit the Offer node or mark availability accordingly.

### S-5. Collection pages are the SEO strategy but have no SEO spec — **Medium**
- **Spec refs:** §2 (L26 — the niche rationale is "high search volume for 'best X under $Y'"), §5 (L79 — `/best/[collection-slug]`), §6 (L152–159 — collections table has only title/intro), §15 (L342 — 8 collections).
- **Rule (fetched):** Rank-worthy programmatic pages need differentiation from boilerplate; scaled content abuse targets pages generated for rankings rather than users. [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- **Gap:** The traffic thesis rests entirely on these pages, yet the spec never defines title/H1 patterns, intro uniqueness, internal linking (category hubs ↔ product pages ↔ related collections), or sitemap/lastmod behavior (`updated_at` exists at L159 but unused for SEO).
- **Fix:** Add a collection SEO block to §12: title pattern "Best [category] under $[X]: [date] verdicts", ≥150-word unique intro per collection, hub-linked breadcrumbs, sitemap lastmod from `updated_at`, and a "how we picked" methodology note.

### S-6. Original-media coverage is concentrated in 10 of 60 pages — make the chart do more work — **Medium**
- **Spec refs:** §11 (L267 — 10 hero products get original footage), §5 block 4 (L99 — 90-day chart), §4 (L64 — freshness rules).
- **Rule (fetched):** Product-review ranking guidance rewards evidence of genuine expertise; thin affiliate pages with recycled media are a policy target. [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- **Gap:** Non-tested pages (50 of 60) will rely on merchant-supplied imagery — allowed by Amazon only under the 24-hour link rule (see C-3) — and otherwise carry little original media.
- **Fix:** Treat the price chart + verdict-reason text as the required original element on every page (unique data visualization with descriptive alt text); add alt-text requirements to §12; consider one original photo per page even on non-tested picks (own studio shots of packaging don't imply testing — but label carefully per C-4).

### S-7. Index hygiene details unstated — **Low**
- **Spec refs:** §5 (L84 — /go/ robots exclusion), §12 (L285 — sitemap.xml).
- **Gap:** Unstated: `/admin` (L85) should be `noindex` and robots-disallowed (password protection is not an SEO control); drafts/archived products (L125) must be excluded from the sitemap; archived products need 410/301 handling, not soft-404s.
- **Fix:** Three bullets in §12.

### S-8. No named author/editor anywhere — E-E-A-T and Review-schema prerequisite — **Low**
- **Spec refs:** §5 (L101–102 — editor verdict without attribution), §5 (L82 — About page), §13 (L295 — human approval).
- **Rule (fetched):** Review-snippet markup requires a named author; Google's product-review guidance rewards demonstrable expertise. [Google review snippet docs](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
- **Gap:** The human-in-the-loop is central to the spec but invisible to users and to Google.
- **Fix:** Add editor byline + short bio on verdicts (also unblocks S-2 later); About page names the person who approves products.

---

## Part C — What the spec already gets right (verified, no action)

- rel="sponsored nofollow" on outbound buttons, /go/ excluded via robots.txt + `X-Robots-Tag: noindex`, bot filtering, no raw IPs (L98, L247–251) — matches [Google's outbound-link guidance](https://developers.google.com/search/docs/essentials/spam-policies).
- Stale-price fallback "Check current price" and a stated ~24h freshness window (L64, L318) — aligns with Amazon's cache limits [Amazon policies](https://affiliate-program.amazon.com/help/operating/policies).
- Median-based honest verdicts, `above_typical` shown but never promoted, inflate-then-discount cap (L207–221) — strong anti-deception design under the FTC's misleading-claims standard.
- Commission-blind ranking rule (L235, L369) — directly supports the FTC "commissions don't influence our verdicts" claim.
- No fake scarcity, fake reviews, countdown timers; no unsupported performance claims (L291–292) — consistent with [16 CFR Part 465](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-D/part-465).
- Double opt-in, one-click unsubscribe, physical address (L240) — CAN-SPAM covered; the exact Amazon identification statement is pinned to "current wording" (L290) — verified: ["As an Amazon Associate I earn from qualifying purchases."](https://affiliate-program.amazon.com/help/node/topic/GHQNZAU6669EZS98)
- Cookieless analytics preference (L251) and human approval before publish (L295).

---

## Part D — Prioritized fix list

| Priority | Items | Where to change the spec |
|---|---|---|
| **P0 — before M0/M1 (contract + template)** | C-1 pricing disclaimers + CERTAIN CONTENT notice; C-2 comparison-format verification (lowest new/used); C-3 data-retention & Creators-API clarifications | §4 (L53–64), §13 (L289–295), M0 (L299–304), §12 (L280) |
| **P0 — before first video (week 1)** | C-5 video/social disclosure in scripts, overlays, captions | §11 (L253–269) |
| **P1 — before launch (M4)** | C-4 tested-disclosure field; C-6 email disclosure + no-Amazon-in-email rule; C-7 concrete disclosure placement; S-1 depth-over-breadth launch framing; S-2 structured-data policy | §8 (L224–233), §9 (L237–243), §5 (L90–104), §15 (L339), §12 (L285) |
| **P2 — quality pass** | S-3 no FAQPage markup; S-4 offer-schema freshness; S-5 collection SEO spec; S-6 chart-as-original-content + alt text; S-7 index hygiene; S-8 author bylines | §5 (L103), §12 (L285), §6 (L152–159) |

---

## Sources

1. [Amazon Associates Program Policies](https://affiliate-program.amazon.com/help/operating/policies) — price display conditions, comparison-format rule, date/time stamp, pricing disclaimer, "CERTAIN CONTENT" notice, 24-hour cache/image rules, email/offline restrictions, misleading-claims prohibition. (Crawled in full this review.)
2. [Amazon Associates identification statement](https://affiliate-program.amazon.com/help/node/topic/GHQNZAU6669EZS98) — exact required wording.
3. [Amazon PA-API 5 documentation — deprecation notice / Creators API](https://webservices.amazon.com/paapi5/documentation/).
4. [Google Search Essentials — Spam policies](https://developers.google.com/search/docs/essentials/spam-policies) — scaled content abuse, thin affiliation, sneaky redirects. (Crawled in full this review.)
5. [Google Review Snippet structured data](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) — no aggregation from other sites, author requirement, on-page visibility, authenticity. (Crawled in full this review.)
6. [Google Product structured data](https://developers.google.com/search/docs/appearance/structured-data/product).
7. [Google Search Central blog — Changes to HowTo and FAQ rich results](https://developers.google.com/search/blog/2023/08/howto-faq-changes).
8. [FTC Endorsement Guides: What People Are Asking](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking) — clear & conspicuous, unavoidable in interactive media, audio+visual video disclosure, per-post social disclosure.
9. [FTC press release — final rule banning fake reviews and testimonials](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials).
10. [16 CFR Part 465 — Rule on the Use of Consumer Reviews and Testimonials](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-D/part-465).

*Note: the May 2026 full retirement of FAQ rich results is reported by industry sources only; the August 2023 restriction (source 7) is the primary-sourced fact used here.*
