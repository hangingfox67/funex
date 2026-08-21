# Build Queue — Post-Submission

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
