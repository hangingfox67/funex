# Platform Lessons — Funex V1

Dated: 2026-08-21. What we learned about building for AI agent consumption.

## The serving contract matters more than the data

The shape of the response determines whether the model uses your data well. Key decisions:

### Portfolio, not top-k
Returning 4 diverse candidates (best + alternative category + wildcard + value) produced better conversations than returning 10 ranked results. Agents need a portfolio to present options; a ranked list becomes "here are 10 ziplines."

### Explicit quality signals
`resultQuality: enriched | mixed | basic_only | out_of_scope | unsupported_destination` lets the model calibrate its confidence honestly. Without this, models either oversell (presenting unenriched products as if they had safety data) or undersell (caveating everything).

### Booking links need a reason
`book_now_url` + `booking_note: "Bookable now via this link — live availability"` surfaces links at higher rates than a bare URL field. The description is an instruction to the model.

### Price clarity prevents web searches
`price_per_person_thb` + `price_note: "per person in THB, confirmed at checkout"` eliminates the ambiguity that sends models searching for "the real price." Ambiguity is why they leave.

## Tool descriptions are instructions

The tool description is the most important piece of copy in the system. It tells the model:
- When to invoke (party + destination + date)
- What inputs improve results (energy, time_slot, budget)
- The conversational loop ("return few, refine on reaction")
- Honest coverage ("~350 enriched, ~1550 basic")
- To include booking links ("When presenting options, include the booking link")

Treat it as a system prompt for a specific capability.

## Graceful decline > silent failure

A well-formed request must never throw. Three patterns:
1. **Unsupported destination**: 200 + `unsupported_destination` + supported list + demand log
2. **Out of scope intent**: 200 + `out_of_scope` + reason + demand log
3. **No matches**: 200 + `basic_only` or empty candidates + refine hints

Each logged decline is market data, not failure.

## Evidence hierarchy > confidence scores

A single confidence number is meaningless without knowing the source. The hierarchy (human > operator T&C > supplier-declared > local knowledge > derived > LLM extraction) determines which value wins. Textual-basis LLM claims that conflict with declared supplier data get flagged, never silently resolved.

## Provider vocabulary is evidence, not schema

Store all provider fields verbatim under namespaced keys (viator.flags, viator.physical_level). Cross-vocabulary influence only via explicit directional rules with documented rationale. PHYSICAL_EASY doesn't mean mobility=limited — exertion ≠ capability floor. The mapping rules are the IP, not the data.

## The proximity principle

Transfer time / activity duration ratio is a universal quality signal:
- ratio ≥ 2: the recommendation is absurd
- ratio ≥ 1: the recommendation is bad
- ratio ≥ 0.5: marginal

This applies regardless of other fit signals. A perfect activity match 2 hours away is not a recommendation, it's a logistics burden.

## Demand signals are the product roadmap

Every empty result is a signal:
- `demand.unsupported_destination: krabi` → expansion trigger
- `demand.suppressed: 47 products` → enrichment priority
- `demand.out_of_scope: walk-in/near-me` → adjacent product opportunity
- `demand.unenriched: exp_123` → this specific product was wanted but couldn't be safety-checked

Weight: suppressed > unenriched > out_of_scope > unsupported.

## What we'd change for V2

1. **Product-level geocoding** from day 1 (not zone medians)
2. **Category classification** as an enrichment step (not sync-time heuristic)
3. **Hourly availability** for same-day queries (walk-in/near-me market)
4. **Multi-rail** from the start (direct operator links alongside affiliate)
5. **Rule authoring UI** instead of YAML editing
6. **Session continuity** across tool calls (currently each search creates a new session)
