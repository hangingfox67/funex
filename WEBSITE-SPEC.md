# Website Upgrade — Build Spec v1

Companion to ARCHITECTURE.md and CLAUDE.md. Same repo, same Postgres, same ranker. Read `/mnt/skills/public/frontend-design/SKILL.md` before building UI, and run its two-pass design process against the brief in §7.

**One line:** turn thailandfunexperiences.com from a landing page into the second channel — a chat-first concierge behind a login wall that captures the traveller profile, serves the same deterministic recommendations the MCP serves, and converts visitors into plugin users, bookings, and an owned email list.

---

## 0. Prime directives for this build

1. **The ranker stays deterministic.** No LLM between request and results, on either channel. On the web, models do exactly two jobs: parse free text into structured params, and voice the already-ranked results. Nothing else.
2. **Identity is one account across surfaces.** The web login IS the V1.1 OAuth identity layer. A user who later connects the ChatGPT plugin resolves to the same user record and the same profile.
3. **Every anonymous session is claimable.** Existing session IDs merge into the profile on signup — the design has been carrying this since A2.
4. **Destination-agnostic.** Every page, email, and prompt template reads `destinations/<name>.yaml`. Phuket is data.
5. **Cheap by construction.** Token spend per account is capped and metered before it's spent, not audited after.
6. **Nothing ships that requires an API we don't have.** No auto-posting to Instagram/Facebook, no programmatic Google reviews. Share intents only (§5).

---

## 1. Positioning (drives copy everywhere)

Two channels, two different jobs:

- **Plugin/connector context:** the user is already talking to an assistant. No education needed. Voice: *your concierge, in the chat you already use.*
- **Website:** must make the gap between generic advice and fitted advice visible in one screen. Never argue that ChatGPT is wrong — demonstrate specificity it can't have: today's swell, transfer minutes from their hotel, minimum age, what they did yesterday. Confident-and-vague versus checkable.

Headline candidates (Dan picks; do not invent a fourth without asking):
- Every family is different. Most travel advice isn't.
- Tailored to your crew, today's weather, and where you're staying.
- The right thing to do tomorrow — for your exact family.

Copy rules: plain verbs, sentence case, no exclamation marks, no "unlock/seamless/effortless", no em-dash-heavy marketing rhythm. State facts the product actually produces.

---

## 2. The hero: two doors, both live

The hero IS the chat window — a live, working input with three tappable example prompts, not a screenshot. Below it, two clearly ranked options:

**Option 1 (preferred, visually primary)**
"Use it inside ChatGPT — one click, no app to download."
- When `CHATGPT_APP_URL` env var is set: primary button links straight to the directory listing.
- While unset (pre-approval): button becomes "Notify me when it lands" → email capture → stored as `launch_waitlist`. Never render a disabled button.

**Option 2 (secondary, equally functional)**
"Or start here — plan your trip on this page."
- Scrolls/focuses the chat input.

Example prompts (tappable, prefill the input):
- "We're in Kata with kids 9 and 15, high energy, what should we do tomorrow?"
- "Six of us, one gets seasick — calm snorkelling somewhere?"
- "One free afternoon near Bang Tao, under 1,500 baht"

---

## 3. Flow: prompt → wall → profile → answer

1. Visitor types or taps a prompt. **No wall yet** — the input is free.
2. On submit: parse the message into structured params (cheap model, structured output, parse-only, never generates prose).
3. **Wall appears, pre-filled from the parse.** "We got this from what you wrote — fill the gaps and we'll plan it." Google OAuth (Sign in with Google) + short form. Pre-filling is the point: it reduces perceived work and demonstrates comprehension before they've paid anything.
4. Form fields (one screen, mobile-first): party members (role + age, names optional), staying area or hotel, trip dates / length of stay, fitness or mobility level, interests, email (from Google), optional constraints (budget, non-swimmer, pregnancy, motion comfort).
   - Names and any comfort/mobility fields are optional and stored as structured flags only — never free-text health language, per the existing privacy-shape rule.
5. Submit → account created → anonymous sessions claimed → original prompt processed → results.
6. Every subsequent visit is pre-seeded: the chat opens with what it already knows ("Back in Kata until Sunday — want ideas for tomorrow?"). This is the "already knows you" demo, and it only works because of step 5.

---

## 4. Chat mechanics and cost control

**Turn pipeline:** parse (cheap model) → ranker (TypeScript, free) → voice (cheap model, given only the ranked portfolio + context block).

- Use the cheapest capable model tier for both calls. Measure and record the real per-turn cost as a constant in the repo, same discipline as the enrichment constant.
- Rough target: parse ≈ 500 in / 100 out, voice ≈ 1,500 in / 400 out → order of half a cent per turn. Verify with real numbers before launch.
- **Caps:** per-account weekly turn cap (default 40, env var), per-account daily cap, global daily spend ceiling that degrades gracefully to the form-only planner rather than erroring.
- **Scope lock at the parser, not the generator.** If the parse returns non-travel intent, out-of-destination, or nonsense, return a canned response with zero generation calls. This is the main abuse defence: off-topic input costs nothing.
- **Abuse controls:** Google OAuth required before any model call, Cloudflare Turnstile on signup, per-IP signup limit, per-account rate limit, and an admin kill switch.

---

## 5. Results, itineraries, sharing

- Results render as the same four-candidate portfolio: fit tier, reason codes in plain language, price, duration, transfer time from their zone, weather and sea context with `basis`/`as_of`, booking link via the existing `/r/` redirect (attribution preserved).
- **Save to trip:** candidates can be added to a saved trip, which becomes a public itinerary page at a slug (`/trip/<id>`), owner-editable, no personal data beyond a first name unless they opt in.
- **Share intents only** (no publishing APIs exist for what we'd want): WhatsApp, Facebook, X, and copy-link buttons with pre-filled text; a downloadable trip recap image generated from the itinerary. Post-trip email includes a one-tap link to the operator's Google review page — a link, never an incentive.
- Itinerary pages are indexable and internally linked from the relevant destination pages: they are the shareable artifact that earns links without any outreach.

---

## 6. Lifecycle email (owned channel)

Templates read the destination yaml and the profile. All transactional-plus-opt-in, unsubscribe in every send.

- **Welcome:** their first recommendations, plus the plugin CTA (or waitlist confirmation).
- **Nudge (no booking after 48h):** one weather-aware message — "Thursday looks dry and the sea drops to 0.6m; the sea-cave trip fits your crew."
- **Pre-arrival / in-destination:** if trip dates are known, one message the day before arrival.
- **Post-activity:** ask how it went (feeds review evidence), share-your-itinerary link, operator review intent link.
- **Launch day:** the entire `launch_waitlist` gets the plugin link the hour it's approved.

---

## 7. Design brief

Subject: fitted travel advice for families and small groups in Thailand, where the differentiator is live physical reality — sea state, rain windows, transfer times, age floors.

- The recurring visual motif should be **conditions data** (swell, rain window, minutes from your hotel, age fit) treated as a first-class design element, not a caption. That's the product's signature and nobody else's page has it.
- Hero is the live chat, per the skill's guidance to open with the most characteristic thing.
- Palette should come from Andaman water and shell, not generic SaaS teal; keep any warm accent for warnings and sea-risk states where it carries meaning.
- Explicitly avoid: cream + terracotta AI-design tell, identical rounded cards with the same soft shadow, ALL-CAPS eyebrow labels, arrows appended to button text, gradient decoration.
- Mobile-first: most traffic is a phone in a hotel room. Quality floor: keyboard focus visible, reduced motion respected, accessible contrast.

Run the skill's plan → self-review → build → critique process, and show Dan the design plan (palette, type, layout wireframe) before writing UI code.

---

## 8. Acceptance criteria (build order)

- **W1 — Identity:** Google OAuth, `user` table, profile schema shared with the MCP's planned auth path, anonymous session claiming on signup. Test: a pre-signup session's searches and clicks appear on the user's record afterwards.
- **W2 — Onboarding:** parse-prefilled form, profile persisted, structured constraints only, no free-text health storage. Test: a prompt mentioning ages and hotel arrives with those fields already filled.
- **W3 — Chat:** parse → ranker → voice pipeline, scope lock with zero-cost refusals, caps and kill switch enforced, per-turn cost measured and recorded. Test: an off-topic message makes no generation call.
- **W4 — Results UI:** portfolio cards with reasons, conditions, transfer times, booking links through `/r/`. Test: a click from the web appears in the event log tagged `channel: web`.
- **W5 — Trips and sharing:** saved trips, public itinerary pages, share intents, recap image.
- **W6 — Email:** welcome, nudge, pre-arrival, post-activity, waitlist blast. Test: nudge fires only when no booking event exists.
- **W7 — Plugin CTA:** `CHATGPT_APP_URL` env var drives the primary button; waitlist fallback when unset; QR code generated for print/property use.
- **W8 — Instrumentation:** admin panel gains a web funnel — visits → chat starts → signups → searches → clicks → bookings — side by side with the agent channel, plus token spend per account and per day.

---

## 9. Out of scope (do not build)

Automated posting to Instagram, Facebook, or Google on a user's behalf (no such API for reviews; publishing APIs don't permit it). Open-ended general-purpose chat. Any LLM call inside the MCP serving path. Payment handling of any kind — bookings complete on Viator. A mobile app.
