# Skeleton Architecture — Vertical-Agnostic Experience Graph

Thailand stripped. Slots marked with `[VERTICAL]`.

## Modules

```
/destinations/[VERTICAL].yaml       # zones, env_variables, season, time-bucket factors
/ontology/attributes.v1.yaml        # attribute keys, types, risk classes — [VERTICAL]-specific
/fixtures/[VERTICAL]-sample.json    # mock catalog for development
/fixtures/personas/*.json           # benchmark personas — [VERTICAL]-specific scenarios
/packages/contracts                 # Zod schemas: search request/response, context snapshot
/packages/graph                     # Drizzle schema + migrations + seed
/packages/connectors/[PROVIDER]     # rails-in: sync, booking_url; MOCK mode
/packages/enrich                    # LLM pipeline: extract → validate → approve
/packages/context                   # weather, [ENV_SERVICES], travel matrix, season
/packages/rank                      # pure function; MUST NOT import rails/router
/packages/router                    # rails[] → booking_url + click redirect
/packages/telemetry                 # event log + dashboard
/apps/mcp                           # MCP server + REST mirror + admin dashboard
/apps/site                          # static site (Astro)
```

## Slot definitions

### `[VERTICAL]` — The domain
Examples: phuket-activities, bali-villas, lisbon-restaurants, ski-resorts.
What changes: ontology attributes, extraction prompt, Dan-rules content, personas, category enum.
What doesn't change: pipeline, ranker logic, MCP server, evidence hierarchy, portfolio assembly.

### `[PROVIDER]` — The supply rail
Examples: Viator, GetYourGuide, Booking.com, direct operators.
Interface: `syncCatalog(destination) → Product[]`, `bookingUrl(productId, sessionId) → string`.
Each provider is a connector package implementing `RailConnector`.

### `[ENV_SERVICES]` — Context APIs
Examples: Open-Meteo (weather/marine), snow reports, tide tables, restaurant wait times.
Each destination YAML declares `env_variables: [weather, marine, snow, ...]`.
Context module loads service adapters by variable name.

## Evidence hierarchy (universal)

```
1. human_correction   — per-attribute manual override
2. operator_terms     — verified T&C from specific operators
3. [PROVIDER]_structured — supplier-declared flags (verbatim stored)
4. dan-rules          — category/venue-level local knowledge
5. derived            — formula-computed (e.g. seasickness = vessel × exposure)
6. extraction         — LLM structural/textual inference
```

Rule: higher sources override lower for structural-basis attributes.
Textual-basis conflicts flagged for human review, never auto-resolved.
Provider vocabulary stored verbatim under `[provider].*` namespaced keys.

## Portfolio assembly (universal)

Default 4 candidates (max 8):
1. best_overall
2. alternative_category (different category + different activity token)
3. wildcard (different activity type from slots 1-2)
4. value pick (≤50% of slot 1 price) or additional diversity

Venue dedup: one slot per venue, variants as alternatives[].
Proximity tiebreak: same score → nearest wins.
Transfer penalty: ratio-based (transfer/duration), always on.

## Ops discipline (universal)

- No agent babysitting. >5min jobs → Batch API or detached process.
- Spend gate: estimated cost printed before submission. >$5 requires explicit approval.
- Truncation: auto-retry at 2× tokens on max_tokens hit.
- Evidence cap: 200 chars per evidence string in prompt.
- Pre-write validation: batch fails fast with field report, never mid-transaction.
- Nightly link health check. Dead rails drop from serving.

## Serving path invariants

- No LLM in the serving path. Enrichment is batch-only.
- Fixtures never served (ID-prefix guard at query + router layers).
- Unenriched products served as basic tier, excluded when safety filters active.
- result_quality signal: enriched / mixed / basic_only / out_of_scope / unsupported_destination.
- demand events: unenriched (served), suppressed (safety-excluded), out_of_scope, unsupported_destination.
