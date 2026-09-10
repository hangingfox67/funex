# Thailand Fun Experiences — MCP Server

An agent-facing experiences layer for Phuket that lets AI assistants (ChatGPT, Claude, etc.) answer *"what should we do here, today, for this exact party"* in one tool call — with safety-gated attributes, live weather/sea context, and affiliate booking links.

**Live:** [thailandfunexperiences.com](https://thailandfunexperiences.com) · MCP endpoint: `https://thailandfunexperiences.com/mcp`

## What it does

- **1,891 real Viator experiences** synced, 352 enriched with 24 safety/suitability attributes each
- **Portfolio ranking** — returns 4 diverse candidates (not top-k), with venue dedup, activity-type diversity, and category spread
- **Live context** — weather forecasts (slot-aware rain buckets), sea state (swell direction × zone exposure), travel matrix (ORS-routed, 13 zones), season
- **Safety gating** — age floors, mobility (enjoy-the-core semantics), pregnancy, non-swimmer, motion comfort, all with multi-source evidence hierarchy
- **Affiliate booking** — every result includes a tracked booking link (`book_now_url`) with live availability

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full spec.

```
Agents (ChatGPT / Claude / REST)
        │
        ▼
  M6 MCP Server (Fastify + streamable HTTP)
        │
  M5 Ranker (pure function, no DB/API calls)
   ├── M1 Experience Graph (Postgres + PostGIS)
   ├── M4 Context (Open-Meteo weather/marine, ORS matrix)
   └── M3 Enrichment (Claude Sonnet, Batch API)
        │
  M8 Router → Viator affiliate links
  M10 Telemetry → session/click/booking events
```

## Tools

### `search_experiences`

Search Phuket activities for a travel party. Returns a portfolio of ~4 diverse recommendations.

```json
{
  "date": "2026-09-10",
  "staying": "kata",
  "party": [{"role": "adult", "age": 38}, {"role": "child", "age": 9}],
  "constraints": {"motion_comfort": "low"},
  "energy": "high",
  "time_slot": "morning",
  "max_results": 4
}
```

Response includes: candidates with attributes, booking links, reason codes, weather context, sea state, catalog breadth stats, and refine hints.

### `get_experience`

Get full details for a specific experience by ID.

```json
{"experience_id": "exp_27613P9"}
```

## Stack

- **Runtime:** Node 22, TypeScript (strict), ESM
- **Monorepo:** pnpm workspaces
- **DB:** Postgres 16 + PostGIS, Drizzle ORM
- **MCP:** `@modelcontextprotocol/sdk` streamable HTTP transport behind Fastify
- **Enrichment:** Anthropic Batch API (Claude Sonnet 4), structured extraction with evidence validation
- **Weather/Marine:** Open-Meteo (no key)
- **Travel matrix:** OpenRouteService (one batched matrix call for all 13 zones)
- **Deploy:** systemd + Caddy reverse proxy on VPS

## Evidence hierarchy

```
1. human_correction    — Dan's per-attribute overrides
2. operator_terms      — verified T&C from specific operators
3. viator_structured   — supplier-declared flags (stored verbatim)
4. dan-rules           — category/venue-level local knowledge (8 rule groups)
5. derived             — formula-computed (seasickness = vessel × water_exposure)
6. extraction          — LLM structural/textual inference (base)
```

## Key design decisions

- **Portfolio, not top-k** — 4 diverse candidates from distinct venues/activity types
- **Structured constraints, not free text** — no health language in any field (privacy by design)
- **Transfer penalty always on** — transfer/duration ratio ≥1 = severe penalty
- **Graceful decline for unsupported destinations** — never throws, logs demand
- **Directive 9 (Viator-tomorrow test)** — every served feature must add transformation, corroboration, composition, or context a single provider can't replicate

## Built with

Built solo in ~1 week with [Claude Code](https://claude.ai/code) (Claude Opus). See [meta/POSTMORTEM.md](meta/POSTMORTEM.md) for the build retrospective.

## License

[MIT](LICENSE)
