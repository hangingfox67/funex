# Testing Log — Append Only

Entry format:
```
## P<n> — <query one-liner> — <date>
session | invoked | slots-filled | our-link | click
finding: <paragraph>
action: <none|applied|queued>
```

Rule: finding-derived fixes reference their log entry in the commit message.

---

## P-solo-budget — solo backpacker, 500 THB, Patong — 2026-08-21
session: s_fd90ef92 | invoked: yes | slots-filled: 3/4 | our-link: yes | click: yes
finding: Model invoked search_experiences correctly with budget constraint. Results returned and links surfaced. User clicked through to Viator — booking made (session s_1883b72f). However, founder booked a 60-min class that was 60 min away. The ranked results included products far from staying zone (e.g. Splash Jungle Water Park in Mai Khao, ~45min from Patong) without penalizing the transfer burden. A 500 THB activity requiring a 400 THB taxi each way isn't a budget pick. A 60-min class 60 min away isn't a good recommendation regardless of budget. Transfer-to-duration ratio must be a universal scoring signal, not just a budget concern.
action: applied — transfer_penalty always on (ratio-based), budget transfer cost estimate, proximity tiebreak (this commit)

## P-massage-nearme — "massage near me right now" — 2026-08-21
session: (none) | invoked: no | slots-filled: 0/4 | our-link: n/a | click: n/a
finding: Query intent is immediacy/walk-in — "near me right now" implies same-day, current location, no advance booking. Our catalog is date-booked tourist activities with advance reservation. Model correctly fell back to web search. This is out-of-scope by design — our value is transformation/composition/context, not real-time availability of walk-in services. However, we should explicitly signal out-of-scope so the model hands off cleanly instead of returning marginally-relevant spa products that happen to match keywords.
action: applied — out_of_scope result_quality + demand.out_of_scope event (this commit)

