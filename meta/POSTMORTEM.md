# Postmortem — Funex V1 Build (2026-08-19 → 2026-08-21)

## Right

### Evidence hierarchy over LLM confidence
Built extraction → dan-rules → viator_structured → operator_terms → human correction, each with explicit precedence. The LLM's structural guesses got overridden 448 times by local knowledge, and viator_structured gave us 1,886 products with supplier-declared flags for free. A single-source-of-truth approach would have shipped hallucinated safety values.
- `944474f` evidence hierarchy
- `8e9afc5` revised evidence design (verbatim storage)

### Directive 9 (Viator-tomorrow test)
Saved us from building features Viator could ship by adding a column. Every piece of served data passes through transformation (extraction → validation → gating), corroboration (multi-source evidence), composition (context × attributes → ranked portfolio), or context (weather × swell × transfer × season) that a single provider can't replicate.
- `bab6926` directive 9

### Portfolio not top-k
Default 4 diverse candidates with venue dedup + activity-type diversity + category spread. The monoculture problem (10 ziplines) would have been the first user complaint. Conversational loop (seen/exclude) proved in fixtures.
- `8456cc3` portfolio response

### Spend gate + ops discipline
$5 threshold prevented runaway batch costs. Calibration constant tracked. Every batch submission printed estimated cost before Dan approved. Total enrichment spend: ~$15 for 352 products.
- `e8cd4d6` ops discipline
- `a9aac77` batch scripts

### Fixture-driven development
25→29 personas as unit tests caught real bugs: jet ski non_swimmer_ok flip, swell scoring on moderate seas, transport in activity results, 480-min rain overlap. The forced-weather fixtures (injected context, no real API dependency) made rain logic testable.

## Missed

### Proximity from day 1
The founder booked a 60-min class 60 min away (session s_1883b72f). Transfer-to-duration ratio should have been a scoring signal from A5, not a post-launch fix. Meeting points aren't populated (V1 gap), so all transfer estimates use zone medians.
- `81b84b5` proximity fix (ratio-based)

### Category quality
Categories came from Viator's taxonomy via keyword matching — 194/352 were wrong (waterpark=cooking_class, ATV combo=temple_tour). Load-bearing field was unaudited until after A6. Should have been a reclassification pass at sync time.
- `2574f9f` category audit

### Booking URL format
Viator canonical URLs require title slug + destination prefix. Our constructor used bare product codes → 404s on real clicks. Caught on day 1 of live usage, not in testing.
- `15620fd` canonical URL fix

### Unsupported destination crash
destination="krabi" threw ENOENT instead of declining gracefully. Any well-formed request should return HTTP 200. Caught by ChatGPT submission testing.
- `91b9afa` + `28358d8` graceful decline

## Premature

### 13-zone geography
Went from 7 → 13 zones (adding khao_lak, ko_yao, natai, etc.) before meeting points were populated. The ranker can't actually distinguish "near Khao Lak" from "near Patong" for individual products — everything uses zone-center medians. The zones are correct for context (weather/swell), but the transfer-time benefit needs product-level geocoding to deliver value.

### Dan-rules as a scaling mechanism
8 rule groups work for Dan's personal knowledge. They won't scale to 50 destinations without a rule-authoring UI and conflict visualization. The precedence engine is good; the content authoring is manual YAML editing.

### Activity tags for combo detection
Extracted from titles via regex. Works for "ATV + Zipline + Temple" but misses subtler combos. Real combo detection needs the product description or LLM classification. Adequate for V1.
