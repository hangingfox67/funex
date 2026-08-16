# Experience Graph for Agents — Architecture v0.1

**One line:** A structured experiences layer that lets an AI agent answer *"what should we do here, today, for this exact party"* in one cheap call — Phuket first, destination-agnostic always.

**The value proposition to the agent:** replace [web search → fetch pages → read → extract → guess] (tens of thousands of tokens, seconds of latency, unreliable) with one typed call returning ~1–2k tokens of decision-complete, evidence-backed data.

---

## 0. Prime directives

These are the rules that keep V1 simple and V2 possible. Every module below obeys them.

1. **Destination is data, not code.** Everything reads `destinations/<name>.yaml`. Phuket is the first file, never a special case.
2. **Provider-agnostic graph.** Experiences live under our own IDs. Viator, GYG, Bókun, Rezdy are *mappings* attached to an experience, never the primary key.
3. **Derive, then discard.** Enrichment stores extracted facts in our schema and words, with source pointer, confidence score, and risk class. Source text is never stored or republished.
4. **One call, decision-complete.** The serving path is deterministic — no LLM between request and response. We return ingredients + a suggested dish (raw attributes + fit tiers + reason codes). The agent does the charm.
5. **Log everything, claimably.** Every anonymous interaction hangs off a session ID that a future authenticated profile can absorb.
6. **Compute is labor, so meter it.** Every pipeline records token + API spend per destination. Destination P&L = spend vs. affiliate revenue.
7. **Ungated doors first.** The web/GEO surface ships before and independently of any reviewed app directory.

---

## 1. System diagram

```
                        AGENTS
        ChatGPT app · Claude connector · REST
                          │
                          ▼
              ┌─────────────────────────┐
              │  M6  AGENT INTERFACE    │  MCP + REST, 2-tier auth
              └───────────┬─────────────┘
                          │
              ┌───────────▼─────────────┐
              │  M5  RANKER             │  filters → tiers → reasons
              └──┬─────────┬─────────┬──┘
                 │         │         │
        ┌────────▼──┐ ┌────▼─────┐ ┌─▼──────────────┐
        │ M9 MEMORY │ │ M1 GRAPH │ │ M4 LIVE CONTEXT│
        │ (V1: logs)│ │          │ │ weather·marine │
        └───────────┘ └────▲─────┘ │ travel·season  │
                           │       └────────────────┘
              ┌────────────┴────────────┐
              │  M3  ENRICHMENT         │  extract·corroborate·gate
              └────────────▲────────────┘
                           │
              ┌────────────┴────────────┐
              │  M2  RAILS-IN           │  Viator (V1) · GYG · Bókun · Rezdy
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │  M8  RAIL ROUTER        │  best booking link per session
              └─────────────────────────┘

   M7 RETRIEVAL SURFACE (GEO site)  ← reads M1+M4, the ungated door
   M10 TELEMETRY & AGENT-SEO LAB    ← reads everything, drives iteration
   M11 EXPANSION ORCHESTRATOR       ← V2: "launch destination" pipeline
   M12 SUPPLIER MODULE              ← V2.x: LINE flash-inventory
```

---

## 2. Modules

### M1 — Experience Graph (core store)

The canonical database. Postgres + PostGIS, one instance.

**Entities:**
- `destination` — slug, name, currency, timezone, config ref
- `zone` — Kata, Bang Tao, Panwa… (geometry, kind: beach/town/airport)
- `vendor` — name, channel_manager (nullable), contact, health
- `experience` — own ID (`exp_…`), vendor_id, title, category, meeting_points[], duration, base_price
- `attribute` — (experience_id, key, value, confidence 0–1, evidence[] source pointers, risk_class, updated_at)
- `provider_mapping` — (experience_id, provider, provider_product_id)
- `rail` — (experience_id, provider, payout_model, rate, priority, health)

**Attribute ontology (versioned file, not hardcoded):** age_fit, mobility, intensity, seasickness_risk, sun_exposure, indoor, rain_viable, best_months, best_time_of_day, crowding_by_season, group_type, min_age, non_swimmer_ok, advance_booking_needed…
Risk classes: `info` (best_months) vs `safety` (non_swimmer_ok, mobility) — safety attrs require ≥2 independent sources or serve as `"unconfirmed"`.

**V1:** 50–200 Phuket experiences. **V2:** identical schema, more rows, more destination files.

### M2 — Rails-In Connectors (ingestion)

Every provider implements one interface:

```
sync_catalog(destination) → products
quote(exp_id, date, pax) → price/availability   (where the rail supports it)
booking_url(exp_id, session_id) → tracked link
payout_model → affiliate | marketplace_managed | reseller_collects
```

**V1:** `ViatorAffiliateConnector` only — catalog + licensed content (descriptions, reviews, photos) in; tagged deep links out. **V2:** GYG affiliate, Bókun, Rezdy implement the same interface. Adding a rail is a mapper, never a refactor.

### M3 — Enrichment Pipeline (compute labor #1)

Batch stages, each checkpointed:

```
normalize → extract (LLM, fixed ontology, per-source) →
corroborate (consensus across sources) →
risk gate (safety attrs need corroboration) →
publish diff
```

- Output is always: `key, value, confidence, evidence[], risk_class`. Never source prose.
- **V1:** publish diffs are human-approved (a review file per batch — minutes, not hours; this is calibration, not curation). Sources: Viator API content + vendor websites + Google Places API signals (derive-then-discard).
- **V2:** auto-publish above learned confidence thresholds; QA attack agent generates hostile personas ("6yo + grandmother + rain after 3pm, staying Kata") and files defects; ontology proposals (new attribute types a destination reveals) go through the same diff gate.

### M4 — Live Context Services

`context(destination, zone|hotel, date) → snapshot`

- **weather** — forecast API, cached per zone/day
- **marine** — sea state (declared per destination in its yaml under `env_variables:`; Phuket declares `marine`, a ski town would declare `snow`)
- **travel_time** — precomputed matrix: zone × meeting_point × time-bucket (morning / midday / evening), refreshed weekly; hotel names geocoded to nearest zone, on-demand exact routing only when a hotel is given
- **season** — holiday/high-season calendar per destination

**V1:** one weather API, one weekly routing batch, a static holiday list. Boring and cached.

### M5 — Ranker

Pure deterministic function: `(graph, context, request) → candidates`.

1. **Hard filters:** age floor, mobility, rain-viability if forecast bad, budget cap, max transfer time.
2. **Tier scoring:** `excellent / good / fair` — no fake percentages.
3. **Reason codes:** machine-stable (`active_teen_fit`, `rain_safe`, `similar_to_past_activity`, `sea_state_risk`) so agents can relay and we can measure which reasons convert.
4. **Assemble rows:** raw attribute values + tier + reasons + transfer_min + weather flag + price + booking_url (from M8).

Persona fixtures from M3's QA personas double as the ranker's unit tests. **No LLM in this path** — fast, cheap, testable; an optional LLM re-ranker is a V2 experiment, off by default.

### M6 — Agent Interface (rails-out)

One remote MCP server (streamable HTTP). Same server backs the ChatGPT app (plus component metadata), the Claude connector, and a plain REST API.

**Tools:**
- `search_experiences` — the flagship. Anonymous.
- `get_experience` — full detail for one ID. Anonymous.
- `save_party` / `get_profile_context` — **V1.1**, OAuth-gated.

**Request schema (the slots that win invocation):**
```json
{
  "destination": "phuket",
  "date": "2026-08-15",
  "staying": {"zone": "kata"} ,          // or {"hotel": "Kata Rocks"}
  "party": [{"age": 44}, {"age": 41}, {"age": 15, "interests": ["adventure"]}, {"age": 9}],
  "constraints": {"budget_thb": 12000, "max_transfer_min": 45, "rain_flexible": false},
  "past_activities": ["kayaking", "cooking class"],
  "energy": "high"
}
```

**Response contract (decision-complete, one call):**
```json
{
  "candidates": [
    {"exp_id": "exp_0042", "title": "Indoor climbing", "fit": "excellent",
     "reasons": ["active_teen_fit", "rain_safe", "new_vs_past"],
     "attributes": {"min_age": 5, "intensity": "high", "indoor": true},
     "price_thb": 3600, "transfer_min": 18, "weather_ok": true,
     "booking_url": "https://…?sid=s_8841"}
  ],
  "context": {"forecast": "rain_after_15", "sea_state": "rough"},
  "refine": {"missing": [], "note": "party fully specified"}
}
```

Every response carries the session-tagged booking link and, when slots are missing, an honest `refine` hint (generic results first, always).

### M7 — Retrieval Surface (GEO door)

Static site generator reading M1 + M4:
- destination hub → zone × audience × condition pages (built from the fan-out grid) → per-experience pages
- answer-first blocks, comparison tables, question-form H2s, verifiable specifics from the attribute layer
- freshness cron: weather-aware and "best this month" pages regenerate on live data
- SSR/static, AI crawlers explicitly allowed, sitemap, consistent entity ↔ Phuket linkage

**V1:** ~60–80 generated Phuket pages on a static host. **V2:** the generator is already destination-agnostic; new yaml → new site section.

### M8 — Rail Router

Reads `rail[]` per experience, picks by `priority × payout × health`, emits the tracked link. Fallback-to-affiliate doubles as automated enforcement (a misbehaving direct vendor gets routed back to the 25% channel).

**V1:** one-armed — Viator only — but the router exists so V1.5 is config, not code.

### M9 — Identity & Memory

- **V1:** session table only. Every call gets `sid`; all events reference it; sessions are claimable.
- **V1.1:** OAuth 2.1 authorization server (hosted IdP is fine), traveler profile: party shapes, preference graph stored exactly like M3 attributes (`trait, person, score, evidence[], updated_at`), booking-claim events.
- Context responder returns only the decision-relevant slice per request — never the whole profile.

### M10 — Telemetry & Agent-SEO Lab (compute labor #2)

The point of the project. Two halves:
- **Event log:** every query, params, result set, click, session — one append-only table.
- **Benchmark harness:** 25 standard persona prompts × ChatGPT / Claude / Gemini, run weekly; record citation of our pages, invocation of our tools, result CTR; import Viator affiliate reports for conversion ground truth. Output: one dashboard (citation rate, invocation rate, click-out rate, bookings) + a loser queue of pages/tools to rewrite via rules in M7/M6.

**V1:** harness is semi-manual (you run the prompts, a script logs the results). **V2:** agents run it.

### M11 — Expansion Orchestrator (V2; V1 ships only the file format)

`destinations/<name>.yaml`:
```yaml
name: phuket
country: th
zones: [kata, karon, patong, bang_tao, panwa, old_town, airport]
env_variables: [weather, marine]
season_sources: [th_holidays]
query_seeds: [families, teenagers, rain, seniors, half-day, tonight, cheap, luxury]
shell:
  brand: "Thailand Activities"
  app_scope: country
```

The V2 pipeline: analyze destination → ingest rails → enrich → QA attack → generate pages → package shell (app metadata, tests, landing copy) → **economics gate** (projected visibility yield vs. metered spend) → human clicks submit. In V1 the orchestrator's only job is that every other module already reads this file.

### M12 — Supplier Module (V2.x, reserved)

Vendor table already exists in M1. Later: LINE-bot flash inventory ("reply: SAT, 3 seats, −30%") writing time-boxed rate overrides into M8. Interface reserved, zero V1 code.

---

## 3. V1 → V2 in one table

| Module | V1 (this build) | V2 (token spend) |
|---|---|---|
| M1 Graph | Phuket rows, full schema | more yaml files, same schema |
| M2 Rails-in | Viator affiliate | + GYG, Bókun, Rezdy mappers |
| M3 Enrichment | LLM extract, human-approved diffs | auto-publish + QA attack agent |
| M4 Context | weather + weekly travel matrix | per-destination env discovery |
| M5 Ranker | deterministic, fixtures | + optional LLM re-ranker trial |
| M6 Interface | anonymous MCP + ChatGPT app | + OAuth tools, more surfaces |
| M7 GEO site | ~70 Phuket pages | generator per destination |
| M8 Router | one-armed | multi-rail + enforcement flips |
| M9 Memory | session log | traveler profiles, claims |
| M10 Lab | manual harness, dashboard | agentized benchmarks |
| M11 Expansion | yaml format only | full launch pipeline + cost gate |
| M12 Supplier | — | LINE flash inventory |

---

## 4. V1 build order (one week)

- **Day 1** — M1 schema, `phuket.yaml`, Viator affiliate application, repo scaffold
- **Day 2** — M2 Viator sync (Phuket subset), M8 one-armed router, session IDs
- **Day 3** — M3 extraction over 50 experiences, review + publish first attribute diff
- **Day 4** — M4 weather + travel-time matrix (zones × meeting points × 3 time buckets)
- **Day 5** — M5 ranker + persona fixtures; M6 MCP server live, anonymous
- **Day 6** — M7 generate + deploy pages; submit ChatGPT app; add Claude connector by URL
- **Day 7** — M10 first benchmark run → baseline dashboard. Everything after this is iteration against that dashboard.

## 5. What V1 deliberately does NOT contain

No auth. No second rail. No LLM in the serving path. No supplier features. No scraping. No multi-destination code paths (only the yaml that proves there could be). Every one of these has a slot waiting; none of them earns tokens until the dashboard says agents can find and prefer us.
