# CLAUDE.md — Build handoff for Experience Graph V1

Read `ARCHITECTURE.md` (v0.2) first. It is the spec. This file pins the decisions the spec leaves open, so you never have to guess. When the two conflict, ARCHITECTURE.md wins on *what*, this file wins on *how*.

## What we are building (one line)

A destination-agnostic experiences layer (Phuket data first) that AI agents query via MCP for decision-complete activity recommendations, monetized through session-tagged Viator affiliate links. V1 is anonymous, single-rail, deterministic serving path.

## Pinned stack — do not relitigate

- **Language:** TypeScript everywhere. Node 22, `strict: true`, ESM.
- **Monorepo:** pnpm workspaces.
- **DB:** Postgres 16 + PostGIS, via Docker Compose locally. **ORM:** Drizzle (migrations in-repo).
- **API/MCP:** official `@modelcontextprotocol/sdk`, streamable HTTP transport, behind Fastify. One server exposes MCP tools *and* a mirror REST API.
- **Shared contracts:** Zod schemas in `packages/contracts` are the single source of truth for tool inputs/outputs. MCP tool schemas and REST validation are both generated from them.
- **Static site (M7):** Astro, fully static output, content pulled from Postgres at build time.
- **Enrichment LLM (M3):** Anthropic API, model `claude-sonnet-4-6`, batch jobs, structured outputs validated by Zod. Retry-with-repair on validation failure, max 2 retries, then flag row for human review.
- **Weather + marine (M4):** Open-Meteo forecast + marine APIs. **No key needed.**
- **Travel-time matrix (M4):** OpenRouteService (free key) durations, multiplied by time-bucket factors from `destinations/phuket.yaml` (e.g. evening 1.4 on west-coast routes). `basis: "matrix"` always in V1. Google Routes is a deferred upgrade (trigger: hotel-level routing).
- **Tests:** Vitest. The M5 persona fixtures are the core test suite.
- **Deploy:** Docker Compose (api + postgres) on a small VPS behind Caddy; Astro output served static by Caddy. Dan provides the box and DNS.

## Repo layout

```
/destinations/phuket.yaml        # zones, env_variables, season, query_seeds, time-bucket factors
/ontology/attributes.v1.yaml     # attribute keys, types, risk classes
/fixtures/viator-sample.json     # 50 realistic Phuket products for mock mode
/fixtures/personas/*.json        # 25 benchmark personas (also ranker test fixtures)
/packages/contracts              # Zod schemas: search request/response, context snapshot
/packages/graph                  # Drizzle schema + migrations + seed (zones, destination)
/packages/connectors/viator      # rails-in: sync, booking_url; MOCK mode built in
/packages/enrich                 # M3 pipeline: extract → corroborate → risk gate → diff
/packages/context                # M4: weather, marine, travel matrix, season
/packages/rank                   # M5: pure function; MUST NOT import rails/router/connectors
/packages/router                 # M8: rails[] → booking_url
/packages/telemetry              # M10: event log writer + harness scripts + dashboard.md generator
/apps/mcp                        # M6: Fastify + MCP server + REST mirror
/apps/site                       # M7: Astro
```

## Mock mode — the most important build rule

`MOCK_VIATOR=1` makes the Viator connector serve `/fixtures/viator-sample.json`. **The entire system — sync, enrichment, context, ranker, MCP, site build, telemetry — must run end-to-end in mock mode with zero external credentials except Anthropic (enrichment) and Open-Meteo (keyless).** Viator affiliate approval is the long pole and outside our control; nothing waits for it. When `VIATOR_API_KEY` lands, the real connector activates and fixture products are reconciled to real product IDs via `provider_mapping`.

## Environment manifest

| Var | Used by | Provided by | Blocking? |
|---|---|---|---|
| `DATABASE_URL` | all | docker-compose default | no |
| `ANTHROPIC_API_KEY` | enrich | Dan | Day 3 |
| `ORS_API_KEY` | context | Dan (free signup) | Day 4 |
| `VIATOR_API_KEY` | connectors/viator | Dan (pending approval) | no — mock mode |
| `SITE_ORIGIN` (domain) | site, mcp | Dan | Day 6 deploy only |
| — Open-Meteo | context | nobody (keyless) | no |

## Acceptance criteria (build in this order)

- **A1 (Day 1):** migrations apply clean; `phuket.yaml` parsed; zones seeded with PostGIS geometry; `ontology/attributes.v1.yaml` loads.
- **A2 (Day 2):** mock sync produces 50 `experience` rows, each with exactly **one** synthetic `offer` and a `provider_mapping`; router emits a session-tagged URL per experience; every API call writes a session-ID'd event row.
- **A3 (Day 3):** enrichment over the 20-product calibration set outputs attributes with `confidence`, `evidence[]`, `risk_class`; safety-class attributes without ≥2 sources serve as `"unconfirmed"`; publish step emits a human-readable diff file and applies nothing until approved (`pnpm enrich:approve <batch>`).
- **A4 (Day 4):** `context("phuket","kata","2026-08-20")` returns forecast + sea state + matrix transfer times, each with `basis` and `as_of`; matrix covers zones × meeting points × 3 buckets; remaining 30 products backfilled through the calibrated pipeline.
- **A5 (Day 5):** ranker passes all persona fixtures; p95 latency < 50ms on 50 products; matrix-basis tolerance widening verified by a fixture; **lint rule proves `packages/rank` imports nothing from router/connectors** (`no-restricted-imports`, CI-enforced).
- **A6 (Day 5):** MCP server passes MCP Inspector; `search_experiences` returns the exact contract shape from `packages/contracts` including `refine` hints and booking URLs; anonymous, no auth anywhere.
- **A7 (Day 6):** Astro builds hub + 50 experience pages + 25 persona pages; server-rendered HTML (no client-JS-gated content); robots.txt allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot; sitemap.xml; every page has answer-first block + at least one comparison table.
- **A8 (Day 7):** `pnpm harness:run` executes the 25 personas against the local MCP, logs results, and emits `dashboard.md` (invocation rate, result CTR from event log, citation columns left as manual-entry placeholders for Dan's cross-assistant runs).

## Hard rules

1. Directive 8 is code, not culture: rank package blind to rails — lint-enforced, CI fails otherwise.
2. Never store source review text. Attributes only: value + confidence + evidence pointer + risk class.
3. No LLM calls in the serving path. Enrichment batch jobs only.
4. No auth, no second rail, no scraping, no multi-destination code paths. `phuket.yaml` is the only place "phuket" appears outside fixtures.
5. Serving responses stay under ~2k tokens for 8 candidates. If a field doesn't help the agent decide or book, it doesn't ship.
6. Every outbound booking URL carries the session ID.

## Personas (fixtures + benchmark + test suite, one artifact)

Generate 25 into `/fixtures/personas/`, covering the facet grid: party shapes (toddlers / teens / seniors / couple / solo), staying zones (Kata, Bang Tao, Patong, Panwa, Old Town), conditions (rain tomorrow, rough sea, budget cap, half-day, tonight, mobility-limited, non-swimmer, "did X yesterday"). Ten seeds to expand from:

1. Family, kids 9 + 15, Kata, rain after 3pm, high energy
2. Couple 60s, Bang Tao, limited walking, calm day
3. Solo 28, Patong, adrenaline, budget 2,500 THB
4. Family, toddler + grandmother, Panwa, non-swimmers
5. Teens did kayaking yesterday, want different today
6. Honeymoon couple, sunset, sea state rough — what instead?
7. Half-day only, flight at 21:00, near airport end of island
8. Four adults, cooking + culture, no boats
9. Family of 5, budget 12,000 THB total, one day left
10. Rainy full day, two teens, "nothing touristy"

## Ask Dan before deciding

- Final domain / brand string (affects `SITE_ORIGIN`, page titles, MCP server name).
- Copy tone for persona pages (he has a strong opinion; draft one page, get approval, then batch).
- Which 3–4 "weird" products go in the Day-3 calibration set.
- Anything requiring a paid signup or a legal/entity decision: stop and ask.

## Out of scope — do not build even if idle

OAuth/profiles, GYG or marketplace connectors, LLM re-ranker, supplier/LINE features, ChatGPT app submission assets (Dan handles submission manually after A6), Gemini/Grok anything, payment code of any kind.
