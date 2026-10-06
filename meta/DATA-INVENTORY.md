# Data Inventory — Thailand Fun Experiences

Last updated: 2026-09-30. Every input field, stored field, log, cookie, outbound call, and response field.

## 1. MCP Tool Inputs (ChatGPT sends these)

### search_experiences

| Field | Type | Example | Purpose | Stored? | Retention |
|---|---|---|---|---|---|
| destination | string | "phuket" | Route to catalog | Zone name only in event log | 12 months |
| date | string (ISO date) | "2026-09-30" | Weather/season lookup | In event log | 12 months |
| staying | string (zone enum) | "kata" | Transfer time, context | Zone slug in event log | 12 months |
| party[].role | enum | "adult" | Age-floor filtering | Party SIZE only in event log (not roles) | 12 months |
| party[].age | number | 9 | Bookability check | NOT stored (in-memory only) | — |
| constraints.non_swimmer | boolean | true | Exclude water activities | NOT stored. safety_filter_applied: bool only | — |
| constraints.pregnant | boolean | true | Exclude unsafe activities | NOT stored | — |
| constraints.mobility | enum | "limited" | Filter by mobility floor | NOT stored | — |
| constraints.motion_comfort | enum | "low" | Filter seasickness risk | NOT stored | — |
| energy | enum | "high" | Match activity intensity | NOT stored | — |
| time_slot | enum | "morning" | Rain-slot matching | NOT stored | — |
| budget_thb | number | 2000 | Price filter | NOT stored | — |
| max_duration_minutes | number | 240 | Duration filter | NOT stored | — |
| return_by | string | "13:00" | Deadline filter | NOT stored | — |
| max_results | number | 4 | Portfolio size | NOT stored | — |
| exclude.categories | string[] | ["adventure"] | Follow-up refinement | NOT stored | — |
| exclude.activity_tags | string[] | ["zipline"] | Component exclusion | NOT stored | — |
| exclude.exp_ids | string[] | ["exp_123"] | Dedup across turns | NOT stored | — |
| seen | string[] | ["exp_123"] | Fresh results | NOT stored | — |

### get_experience

| Field | Type | Example | Purpose | Stored? |
|---|---|---|---|---|
| experience_id | string | "exp_27613P9" | Lookup | experience_id in event log |

## 2. MCP Tool Outputs (ChatGPT receives these)

### search_experiences response

| Field | Contains personal data? | Purpose |
|---|---|---|
| candidates[].experience_id | No — catalog ID | Needed by get_experience |
| candidates[].title | No — activity name | Display |
| candidates[].category | No — activity type | Display |
| candidates[].duration_minutes | No | Display |
| candidates[].price_per_person_thb | No — catalog price | Display |
| candidates[].price_note | No — fixed text | Clarification |
| candidates[].fit | No — excellent/good/fair | Ranking tier |
| candidates[].reasons | No — reason codes | Why this activity fits |
| candidates[].book_now_url | No — opaque token URL | Booking redirect |
| candidates[].booking_note | No — fixed text | CTA prompt |
| candidates[].mobility_note | No — activity description | Accessibility info |
| candidates[].transfer | No — estimated minutes + note | Travel context from staying zone |
| candidates[].duration_note | No — fixed text | Clarifies when duration is ticket validity |
| candidates[].booking_constraints | No — operator rules | Booking requirements |
| candidates[].alternatives | No — related activities | Venue variants |
| attributes[] (get_experience) | No — activity safety/suitability data | Detailed attribute list for one activity |
| conditions.weather | No — forecast text | Environmental context |
| conditions.sea | No — sea state text | Marine context |
| conditions.season | No — "low"/"high" | Season label |
| resultQuality | No — enum | Response quality signal |
| catalog.total / catalog.enriched | No — counts | Coverage info |
| refine.totalMatches / canNarrowBy | No — hints | UI guidance |

**Not in response:** session IDs, timestamps, user identifiers, constraint echoes, individual ages, internal stats.

## 3. Stored Data (Postgres)

### event table
| Column | Example | Purpose | Retention |
|---|---|---|---|
| session_id | s_abc123-... | Group related events | 12 months, then aggregate counts only |
| type | "search", "click" | Event classification | 12 months |
| payload.destination | "phuket" | Analytics | 12 months |
| payload.zone | "kata" | Analytics | 12 months |
| payload.date | "2026-09-30" | Analytics | 12 months |
| payload.partySize | 3 | Analytics | 12 months |
| payload.safety_filter_applied | true | Analytics flag | 12 months |
| payload.candidateCount | 4 | Analytics | 12 months |
| payload.experienceId (click) | "exp_123" | Click tracking | 12 months |
| payload.provider (click) | "viator" | Attribution | 12 months |

**Not stored in events:** individual ages, constraint values (pregnant/mobility/etc), party roles, free text, IP addresses.

### session table
| Column | Purpose | Retention |
|---|---|---|
| id | Random UUID (s_...) | 12 months |
| destination_slug | Route | 12 months |
| user_id | Link to web account (nullable) | Until user deletes account |
| channel | "agent" or "web" | 12 months |

### booking_token table
| Column | Purpose | Retention |
|---|---|---|
| token | Opaque random (12 bytes base64url) | 12 months |
| session_id | Internal attribution | 12 months |
| experience_id | Resolve redirect | 12 months |

### funex_user table (web accounts only)
| Column | Example | Purpose | Retention |
|---|---|---|---|
| id | u_abc123-... | Account ID | Until deleted or 24 months inactive |
| email | user@gmail.com | Account identity (from Google) | Until deleted |
| name | "Dan" | Display (from Google) | Until deleted |
| google_id | "12345" | OAuth identity link | Until deleted |
| profile.party | [{role:"adult",age:38}] | Personalization | Until deleted |
| profile.staying | "kata" | Personalization | Until deleted |
| profile.tripDates | {from,to} | Personalization | Until deleted |
| profile.interests | ["snorkeling"] | Personalization | Until deleted |
| profile.budgetThb | 5000 | Personalization | Until deleted |

**Not stored in profiles:** pregnancy, mobility, motion_comfort, non_swimmer, Google profile picture.

### Viator conversion import (manual CSV)
| CSV Column | Stored as | Purpose |
|---|---|---|
| date | payload.bookingDate | Commission tracking |
| product_code | payload.productCode | Attribution |
| campaign (=session_id) | event.session_id | Join to our events |
| commission | payload.commission | Revenue |
| currency | payload.currency | Revenue |
| booking_ref | payload.bookingRef | Dedup |

## 4. Cookies

| Cookie | Scope | Purpose | HttpOnly | Secure | Expiry |
|---|---|---|---|---|---|
| funex_session | Path=/ | Web account login | Yes | Yes | 30 days |
| funex_admin | Path=/admin | Admin panel auth | Yes | Yes | 7 days |

**No tracking cookies.** No analytics cookies. No third-party cookies set by our server.

## 5. External API Calls

| Service | What we send | Contains user data? | Purpose |
|---|---|---|---|
| Open-Meteo (api.open-meteo.com) | Latitude, longitude, date | No — zone coordinates only | Weather forecast |
| Open-Meteo Marine (marine-api.open-meteo.com) | Latitude, longitude, date | No — zone coordinates only | Sea state forecast |
| OpenRouteService (api.openrouteservice.org) | Zone coordinates array | No — 13 fixed zone centers | Travel time matrix |
| Viator API (api.viator.com) | Product codes | No — catalog IDs only | Product metadata |
| Anthropic Batch API | Product descriptions | No — catalog content only | Enrichment extraction |
| Google OAuth (accounts.google.com) | Redirect URI | User's Google sign-in | Web account auth |
| Google UserInfo (googleapis.com) | OAuth access token | Returns: email, name, Google ID | Web account creation |

**No user data sent to:** Open-Meteo, ORS/HeiGIT, Viator, Anthropic. These receive only zone coordinates, product codes, or catalog content.

## 6. Server/Application Logs

| Log | Contents | Retention |
|---|---|---|
| journald (systemd) | Request URLs, status codes, timestamps | 14 days (configured) |
| Caddy access log | IP, URL, status, user-agent | 14 days (Caddy default) |
| Fastify request log | Request method, URL, response time | 14 days (journald) |

**IPs are never stored in Postgres.** Log-level IPs rotate with journald/Caddy retention.

## 7. Analytics Scripts

**None.** No Google Analytics, no tracking pixels, no third-party scripts. The conditions strip on the homepage fetches from our own API only.

## 8. Backups

Database backups: none configured (Docker volume only). If configured, same retention policy applies to backup contents.
