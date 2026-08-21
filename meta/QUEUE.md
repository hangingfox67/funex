# Build Queue — Post-Submission

## Non-blocking (this week, priority order)

### Duration audit
Flag enriched products with duration <60min in implausible categories (boat_tour, diving, wildlife, temple_tour — these are never sub-1h). Re-extract flagged products via Batch API. Duration now feeds the transfer-to-duration ratio — errors distort ranking. A 30-min duration on a full-day island tour makes the transfer ratio look acceptable when it isn't.

### refine.ask: has_own_transport
Add `has_own_transport` as a split axis in refine hints. When transfer penalties differentiate the candidate pool and the query hasn't specified transport mode, the refine block should include: `"ask": ["Do you have your own transport? Results near you if not."]`. Fixture: the s_1883b72f session where a far product won because transfer wasn't penalized — had the model asked, the user might have said "no car" and gotten local-only results.

### Session-per-response: confirmed intentional
One session ID per search_experiences call. This is correct and stays:
- Attribution: one sid per conversation turn maps to exactly one search → N clicks → M bookings
- Viator campaign param = our sid → conversion joins cleanly
- Multi-turn conversations: each turn gets a new session; the `seen`/`exclude` params link turns semantically without needing a persistent session
- If we later add profile-level tracking (V2 auth), sessions absorb into profiles via the `claimedBy` field on the sessions table — already in the schema

---

## A7-GEO: Static Site (Astro)

### Spec (from ARCHITECTURE M7)
- Hub page + 50 experience pages + 25 persona pages
- Server-rendered HTML (no client-JS-gated content)
- robots.txt: allow GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot
- sitemap.xml
- Every page: answer-first block + at least one comparison table

### Addition: "Personalize this in ChatGPT" block
- Per page: CTA block linking to app directory (env-configured URL: `CHATGPT_APP_URL`)
- Graceful fallback: "Coming soon — personalized recommendations launching shortly" until approval
- Copy tone: "Tell ChatGPT about your group and get recommendations fitted to your party, dates, and budget"

### Page structure

**Hub page** (`/`):
- Answer-first: "X activities in Phuket, rated for safety and suitability"
- Category grid with counts
- Live weather + sea state block (cached, rebuilt hourly)
- "Personalize this in ChatGPT" CTA

**Experience pages** (`/experience/:id`):
- Answer-first: title, category, price, duration, key safety attributes
- Attribute table (safety first, then info)
- Booking link via our redirect (`/r/web-{pageview-id}/:expId`)
- Comparison table: "Similar activities" (same category, different venue)
- "Personalize this in ChatGPT" CTA

**Persona pages** (`/for/:persona-slug`):
- Answer-first: "Best activities for [persona description]"
- Portfolio of 4 recommendations (pre-ranked at build time using persona request)
- Each with booking link, reason codes, mobility note
- Comparison table: all 4 side by side
- "Personalize this in ChatGPT" CTA

### Monetization
- Pages monetize independently via redirect booking links
- Session source: `web-{pageview-id}` vs `s_{uuid}` (agent)
- Admin panel: page-source column on click events separates web vs agent funnel

### Admin panel update
- Click events gain `source: "web" | "agent"` field
- Funnel page: separate web/agent CTR cards
- Per-product table: web clicks vs agent clicks columns

### Build order
1. Astro project setup in `apps/site/`
2. Data layer: build-time Postgres queries for experiences + attributes
3. Hub page with category grid + weather
4. Experience page template + 50 pages
5. Persona page template + 25 pages (uses rank() at build time)
6. robots.txt + sitemap.xml
7. "Personalize in ChatGPT" CTA component (env-aware)
8. Deploy to /var/www/funex via Caddy static serving
9. Admin panel: source column on click events

### Env vars needed
- `CHATGPT_APP_URL` — app directory link (empty = "coming soon" fallback)
- `SITE_ORIGIN` — canonical URL for sitemap/OG tags
