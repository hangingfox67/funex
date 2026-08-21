# Operating Manual — Lessons from Funex V1

Dated: 2026-08-21. Distilled from CLAUDE.md ops sections + build experience.

## Build discipline

### No babysitting
Anything expected >5 min runs as (a) a server-side Batch API job, or (b) a detached local process (nohup/systemd-run, memory-capped) writing progress to a log. Submit, print how to check, END TURN. Sleep/tail polling loops are forbidden.

### Heartbeat files
Every long job writes a heartbeat (items done, tokens, cost) to a status file. Status commands read files, never watch processes.

### Spend gate
Before ANY batch submission, print estimated cost (items × measured $/item). Estimated cost > $5 requires explicit approval in that conversation. The measured calibration cost (from the first successful batch) is the estimator constant.

### Collection is free
Collection is read-only — auto-collect completed batches and proceed to the next non-spending step without waiting for a signal. Only SUBMISSION is spend-gated.

### Truncation policy
Batch outputs hitting max_tokens are detected (parse failure on otherwise valid JSON), auto-retried once at 2× tokens, and the working ceiling becomes the new default. Never store truncated extractions.

### Evidence cap
Prompt instructs ≤200 chars per evidence field. Reduces output tokens ~30% without losing signal.

## Enrichment pipeline

### Batch flow
1. `pnpm enrich:submit` — prepares prompts, passes spend gate, submits to Batch API
2. `pnpm enrich:status` — reads batch state, no polling
3. `pnpm enrich:collect` — idempotent, re-runnable, writes diff + calibration cost
4. `pnpm enrich:approve` — applies evidence hierarchy, pre-write validation, Dan-rules

### Pre-write validation
All attribute rows collected into pendingWrites[] before any DB contact. validateRow() checks NOT NULL constraints. If validation fails: full field report printed, zero rows written, batch not marked approved.

### Confidence policies
- Verbatim declared (provider.*): 1.0
- Derived (formula): min of input confidences
- *_note companions: inherit parent attribute's confidence
- Extraction: LLM value, fallback 0.5 if missing

## Deployment

### Memory caps
All Node processes: `--max-old-space-size=512`. Systemd unit: `MemoryMax=768M`. Docker compose: `restart: unless-stopped`.

### Node version
`.nvmrc` at repo root. Hard engine check (`check-node.ts`) as first import in all runner scripts. Refuses to run on <22 with actionable error message.

### Service management
systemd unit: `funex-mcp.service`. Restart on failure, 5s delay. Memory-capped. NVM-aware ExecStart.

### Caddy reverse proxy
MCP/API/redirect/admin routes → localhost:3000. Static site handles everything else. Admin additionally blocked at Caddy for defense in depth.

## Monitoring

### Event funnel
session → search → click → booking. All session-tagged. Dashboard: `pnpm ops:dashboard`.

### Link health
Nightly HEAD-check of booking URLs. 404/410 → rail.health='dead', drops from serving. 403 = bot protection (alive). `pnpm ops:link-health`.

### Demand tracking
- demand.unenriched: basic-tier products served (enrichment gap)
- demand.suppressed: safety-filtered unenriched products (worse gap)
- demand.out_of_scope: query intent doesn't match catalog (market data)
- demand.unsupported_destination: destination expansion trigger

Suppressed demand gets 3× weight in the weekly enrichment proposal ranking.

## Things that broke in production

1. **Booking URLs 404'd** — Viator requires canonical slug URLs, not bare product codes. Fix: title-to-slug generator + d349 prefix.
2. **Redirect 500 on logging failure** — FK violation when session didn't exist. Fix: redirect first (never block user), log best-effort after.
3. **Unsupported destination crash** — ENOENT on missing yaml. Fix: early return with graceful decline.
4. **60-min class 60-min away** — Transfer time wasn't a scoring signal. Fix: ratio-based penalty, always on.
5. **Category misclassification** — Viator taxonomy unaudited, waterpark=cooking_class. Fix: deterministic reclassification pass.
