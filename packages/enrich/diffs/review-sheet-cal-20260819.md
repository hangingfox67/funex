# Review Sheet — Real Viator Calibration (cal-20260819)

## Summary

- **Products:** 20 of 20
- **Prompt:** v2.0, Ontology v2, Model: claude-sonnet-4-6
- **Total tokens:** 21216 in / 47158 out
- **Total cost:** $0.7710 USD
- **Measured $/product:** $0.0386 (estimator constant)
- **Attributes/product:** 24
- **Max tokens:** 4096 (raised from 2048 after truncation at v2 ontology size)

---

## 1. Safety Attributes (all products)

| Product | Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|---|
| Best of Phuket: Big Buddha, Wat Chalong  | independent_from | 16 | 0.60 | structural | **UNCONFIRMED** | Small-group guided tour visiting temples and viewpoints; no inherent danger requiring adult accompaniment, but as an uns |
| Best of Phuket: Big Buddha, Wat Chalong  | mobility | "moderate" | 0.80 | structural | **UNCONFIRMED** | Big Buddha and Wat Chalong both involve uneven paving, stairs, and uphill terrain. Karon Viewpoint also typically involv |
| Best of Phuket: Big Buddha, Wat Chalong  | non_swimmer_ok | true | 1.00 | structural | PASS | No water entry involved in any part of this land-based sightseeing tour. |
| Best of Phuket: Big Buddha, Wat Chalong  | pregnant_ok | true | 0.80 | structural | **UNCONFIRMED** | Land-based sightseeing with no physical exertion, no water exposure, no high-impact activity. Walking on uneven temple g |
| Best of Phuket: Big Buddha, Wat Chalong  | seasickness_risk | _N/A_ | 1.00 | structural | — | Entirely land-based activity — temples, viewpoints, beach roads. No water vessel involved. |
| Best of Phuket: Big Buddha, Wat Chalong  | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age is explicitly stated anywhere in the product title or description. |
| Best of Phuket: Big Buddha, Wat Chalong  | wheelchair_access | "partial" | 0.70 | structural | **UNCONFIRMED** | Wat Chalong and Big Buddha both have steps and uneven temple grounds that are challenging for wheelchairs, though some f |
| Catamaran Sunset Cruise in Phuket with D | independent_from | 16 | 0.60 | structural | **UNCONFIRMED** | Evening cruise involving alcohol service ('a glass of wine') and open coastal water. Independent participation by a mino |
| Catamaran Sunset Cruise in Phuket with D | mobility | "moderate" | 0.70 | structural | **UNCONFIRMED** | Boarding a catamaran and moving around the deck requires some balance and mobility. Description states 'sit back and enj |
| Catamaran Sunset Cruise in Phuket with D | non_swimmer_ok | true | 0.85 | structural | **UNCONFIRMED** | This is a passive dinner cruise with no snorkeling or swimming activity described. Non-swimmers can safely participate a |
| Catamaran Sunset Cruise in Phuket with D | pregnant_ok | false | 0.70 | structural | **UNCONFIRMED** | Coastal sea conditions, boat movement, and the general guidance against boat trips in later pregnancy due to seasickness |
| Catamaran Sunset Cruise in Phuket with D | seasickness_risk | "moderate" | 0.70 | structural | **UNCONFIRMED** | Catamaran cruising toward Promthep Cape along the southern Phuket coastline involves coastal/open sea exposure, especial |
| Catamaran Sunset Cruise in Phuket with D | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age is stated anywhere in the product title or description. |
| Catamaran Sunset Cruise in Phuket with D | wheelchair_access | "unknown" | 0.60 | structural | **UNCONFIRMED** | Catamaran boarding typically involves steps, gangways, or jumping onto a deck — potentially problematic for wheelchair u |
| Flying Hanuman Zipline Experience Family | independent_from | 16 | 0.60 | structural | **UNCONFIRMED** | Zipline operations involve heights, harness management, and self-arrest techniques that typically require adult judgment |
| Flying Hanuman Zipline Experience Family | mobility | "moderate" | 0.85 | structural | **UNCONFIRMED** | Description references 'hillsides' and 'thick forest' terrain. Zipline platforms typically require climbing steps, walki |
| Flying Hanuman Zipline Experience Family | non_swimmer_ok | true | 1.00 | structural | PASS | Entirely land-based activity. Swimming ability is irrelevant to zipline safety. |
| Flying Hanuman Zipline Experience Family | pregnant_ok | false | 0.95 | structural | PASS | Zipline activities involve harness compression around the abdomen, sudden jolts at platform connections, and heights. Th |
| Flying Hanuman Zipline Experience Family | seasickness_risk | _N/A_ | 1.00 | structural | — | Land-based jungle zipline activity. No water/boat travel involved. |
| Flying Hanuman Zipline Experience Family | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age is explicitly stated anywhere in the product title or description. |
| Flying Hanuman Zipline Experience Family | wheelchair_access | "no" | 0.90 | structural | PASS | Description references jungle hillside terrain with 'thick forest'. Zipline platforms require climbing stairs and traver |
| James Bond Island with Canoeing and Lunc | independent_from | 16 | 0.65 | structural | **UNCONFIRMED** | Activity involves speedboat travel on open coastal/bay waters, sea canoeing through cave systems, trekking, and open-wat |
| James Bond Island with Canoeing and Lunc | mobility | "moderate" | 0.85 | textual | **UNCONFIRMED** | Description mentions 'sightseeing and trekking at James Bond Island', 'sea canoeing adventure', and 'swim in clear water |
| James Bond Island with Canoeing and Lunc | non_swimmer_ok | false | 0.65 | structural | **UNCONFIRMED** | Description includes 'swim in clear water at Naka Island' and sea canoeing through cave systems. While life jackets are  |
| James Bond Island with Canoeing and Lunc | pregnant_ok | false | 0.85 | structural | **UNCONFIRMED** | Speedboat travel produces significant impact and vibration, which is contraindicated during pregnancy. Additionally, sea |
| James Bond Island with Canoeing and Lunc | seasickness_risk | "moderate" | 0.80 | textual | **UNCONFIRMED** | Title states 'by Speedboat' and description references a boat tour across Phang Nga Bay. Speedboats produce significant  |
| James Bond Island with Canoeing and Lunc | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age is explicitly stated anywhere in the product title or description. |
| James Bond Island with Canoeing and Lunc | wheelchair_access | "no" | 0.85 | structural | **UNCONFIRMED** | Activity involves boarding a speedboat, sea canoeing through cave systems, trekking at James Bond Island, and swimming — |
| Khao Lak Zipline Adventure at Sky Rock | independent_from | 16 | 0.60 | structural | **UNCONFIRMED** | Adventure zipline parks typically require adult consent and often adult accompaniment for minors. Independent participat |
| Khao Lak Zipline Adventure at Sky Rock | mobility | "moderate" | 0.80 | structural | **UNCONFIRMED** | A 27-platform zipline park in rainforest terrain requires walking between platforms, climbing steps/ladders, and managin |
| Khao Lak Zipline Adventure at Sky Rock | non_swimmer_ok | true | 1.00 | structural | PASS | Land-based zipline activity in a jungle environment. Swimming ability is irrelevant to participation. |
| Khao Lak Zipline Adventure at Sky Rock | pregnant_ok | false | 0.95 | structural | PASS | Zipline activities involving harness pressure on the abdomen, sudden starts/stops, and heights are contraindicated durin |
| Khao Lak Zipline Adventure at Sky Rock | seasickness_risk | _N/A_ | 1.00 | structural | — | Land-based jungle zipline activity with no water/vessel component. Seasickness is not applicable. |
| Khao Lak Zipline Adventure at Sky Rock | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age is explicitly stated anywhere in the product title or description. |
| Khao Lak Zipline Adventure at Sky Rock | wheelchair_access | "no" | 0.85 | structural | **UNCONFIRMED** | A 27-platform rainforest zipline park with jungle terrain and elevated platforms is structurally incompatible with wheel |
| Muay Thai Boxing Class for Beginners | independent_from | 16 | 0.60 | structural | **UNCONFIRMED** | A beginner combat-sport class involves physical contact, cardiovascular stress, and technique requiring mature judgment. |
| Muay Thai Boxing Class for Beginners | mobility | "full" | 0.90 | textual | **UNCONFIRMED** | Description states 'pad and mitt work to increase cardiovascular conditioning, hip mobility, leg and core strength' — re |
| Muay Thai Boxing Class for Beginners | non_swimmer_ok | true | 1.00 | structural | PASS | No water involvement; swimming ability is irrelevant. |
| Muay Thai Boxing Class for Beginners | pregnant_ok | false | 0.95 | structural | PASS | Muay Thai pad and mitt work involves physical contact, high cardiovascular exertion, and impact risk — all contraindicat |
| Muay Thai Boxing Class for Beginners | seasickness_risk | _N/A_ | 1.00 | structural | — | Land-based gym activity; seasickness is not applicable. |
| Muay Thai Boxing Class for Beginners | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age is stated anywhere in the product title or description. |
| Muay Thai Boxing Class for Beginners | wheelchair_access | "no" | 0.85 | structural | **UNCONFIRMED** | Full mobility including standing, kicking, punching, and footwork is required by the activity mechanics ('pad and mitt w |
| One Day Experience Cooking at Phuket Pat | independent_from | 16 | 0.60 | structural | **UNCONFIRMED** | Cooking class involves sharp implements, open flames, and hot oil. Independent participation requires sufficient maturit |
| One Day Experience Cooking at Phuket Pat | mobility | "moderate" | 0.80 | structural | **UNCONFIRMED** | Cooking class involves standing at a workstation, chopping, stirring, and potentially a market tour. Description mention |
| One Day Experience Cooking at Phuket Pat | non_swimmer_ok | true | 1.00 | structural | PASS | Land-based cooking class with no water activity component whatsoever. |
| One Day Experience Cooking at Phuket Pat | pregnant_ok | true | 0.80 | structural | **UNCONFIRMED** | Cooking class is low-intensity and primarily indoor. Pregnant participants can observe, participate lightly, and taste d |
| One Day Experience Cooking at Phuket Pat | seasickness_risk | _N/A_ | 1.00 | structural | — | Land-based cooking class. No water component present. |
| One Day Experience Cooking at Phuket Pat | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age is stated anywhere in the product title or description. |
| One Day Experience Cooking at Phuket Pat | wheelchair_access | "unknown" | 0.60 | structural | **UNCONFIRMED** | No accessibility information is provided in the product description. Kitchen environments may have narrow spaces, standi |
| Patong Highlight Elephant Sanctuary with | independent_from | 12 | 0.60 | structural | **UNCONFIRMED** | Activity involves a guided forest walk in the vicinity of large wild animals (elephants). Structural assessment: proximi |
| Patong Highlight Elephant Sanctuary with | mobility | "moderate" | 0.80 | structural | **UNCONFIRMED** | 'Guided walk into the forest' — forest terrain in Patong hills is likely uneven and sloped. Not a flat paved path. Walki |
| Patong Highlight Elephant Sanctuary with | non_swimmer_ok | true | 1.00 | structural | PASS | Fully land-based activity. Swimming ability is irrelevant. |
| Patong Highlight Elephant Sanctuary with | pregnant_ok | true | 0.70 | structural | **UNCONFIRMED** | 'Hands-off' observation with no riding, no water, no heights, no strenuous activity. 'Observe from a respectful distance |
| Patong Highlight Elephant Sanctuary with | seasickness_risk | _N/A_ | 1.00 | structural | — | Fully land-based activity in a forest sanctuary. No water travel involved. |
| Patong Highlight Elephant Sanctuary with | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age is stated anywhere in the product title or description. |
| Patong Highlight Elephant Sanctuary with | wheelchair_access | "no" | 0.80 | structural | **UNCONFIRMED** | 'Guided walk into the forest' — forest terrain in the hills behind Patong is inherently uneven, sloped, and unpaved. Whe |
| Phang Nga Bay Sea Cave Canoeing & James  | independent_from | 16 | 0.65 | structural | **UNCONFIRMED** | Activity involves independent paddling in sea caves, open bay water, swimming, and paddleboarding. Structural assessment |
| Phang Nga Bay Sea Cave Canoeing & James  | mobility | "moderate" | 0.80 | structural | **UNCONFIRMED** | Description mentions 'trekking' on James Bond Island and canoeing through sea caves, plus swimming and paddleboarding. T |
| Phang Nga Bay Sea Cave Canoeing & James  | non_swimmer_ok | true | 0.70 | structural | **UNCONFIRMED** | Canoeing in a canoe with a guide does not require swimming ability; life jackets are standard on Phang Nga Bay canoe tou |
| Phang Nga Bay Sea Cave Canoeing & James  | pregnant_ok | false | 0.85 | structural | **UNCONFIRMED** | Activity involves canoeing through sea caves, trekking on uneven terrain, swimming, and paddleboarding over 7 hours. The |
| Phang Nga Bay Sea Cave Canoeing & James  | seasickness_risk | "low" | 0.75 | structural | **UNCONFIRMED** | Phang Nga Bay is a sheltered bay with generally calm, protected waters. Travel is on a 'Big Boat' which provides more st |
| Phang Nga Bay Sea Cave Canoeing & James  | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age is stated anywhere in the product title or description. |
| Phang Nga Bay Sea Cave Canoeing & James  | wheelchair_access | "no" | 0.85 | structural | **UNCONFIRMED** | Activity requires boarding/exiting canoes, trekking on James Bond Island (uneven limestone terrain), swimming, and paddl |
| Phi Phi Maya Bay and Khai Island Snorkel | independent_from | 16 | 0.70 | structural | **UNCONFIRMED** | Open-sea speedboat journey with snorkeling in open water at Phi Phi and Khai Island. Independent participation in such c |
| Phi Phi Maya Bay and Khai Island Snorkel | mobility | "moderate" | 0.80 | structural | **UNCONFIRMED** | Activity involves boarding/disembarking a speedboat, walking on beaches, and snorkeling. Requires ability to navigate bo |
| Phi Phi Maya Bay and Khai Island Snorkel | non_swimmer_ok | true | 0.75 | structural | **UNCONFIRMED** | Non-swimmers can participate by remaining on the boat or enjoying beach areas without snorkeling. Life jackets are stand |
| Phi Phi Maya Bay and Khai Island Snorkel | pregnant_ok | false | 0.85 | structural | **UNCONFIRMED** | Open-sea speedboat travel with significant wave impact, combined with snorkeling in open water, presents genuine risk fo |
| Phi Phi Maya Bay and Khai Island Snorkel | seasickness_risk | "moderate" | 0.85 | structural | **UNCONFIRMED** | Full-day speedboat trip crossing open Andaman Sea to Phi Phi Islands (~45–90 min crossing each way). Speedboats have hig |
| Phi Phi Maya Bay and Khai Island Snorkel | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age is explicitly stated anywhere in the product title or description. |
| Phi Phi Maya Bay and Khai Island Snorkel | wheelchair_access | "no" | 0.85 | structural | **UNCONFIRMED** | Speedboat boarding requires stepping over gunwales, beaches are sandy/uneven, and snorkeling involves water entry/exit f |
| Phuket ATV Riding 30 Minutes | independent_from | 16 | 0.75 | structural | **UNCONFIRMED** | ATV riding is a motorized off-road vehicle activity. Standard practice for unsupervised operation of motorized ATVs is 1 |
| Phuket ATV Riding 30 Minutes | mobility | "full" | 0.90 | structural | PASS | Activity involves riding through 'jungle and bumpy trails' and 'mountain' terrain on an ATV, requiring the ability to gr |
| Phuket ATV Riding 30 Minutes | non_swimmer_ok | true | 1.00 | structural | PASS | Land-based activity with no water exposure. Swimming ability is irrelevant. |
| Phuket ATV Riding 30 Minutes | pregnant_ok | false | 0.95 | structural | PASS | ATV riding involves vibration, jolts from 'bumpy trails', and the physical demands of controlling a motorized vehicle on |
| Phuket ATV Riding 30 Minutes | seasickness_risk | _N/A_ | 1.00 | structural | — | Fully land-based activity — ATV riding in jungle and mountain terrain. Seasickness is not applicable. |
| Phuket ATV Riding 30 Minutes | stated_min_age | _N/A_ | 1.00 | textual | — | No minimum age is explicitly stated in the product title or description. Text mentions 'children can join in' but gives  |
| Phuket ATV Riding 30 Minutes | wheelchair_access | "no" | 0.90 | structural | PASS | ATV riding on jungle trails and bumpy mountain terrain is physically incompatible with wheelchair use. The activity requ |
| Phuket City Highlights: Big Buddha, Wat  | independent_from | 16 | 0.60 | structural | **UNCONFIRMED** | Tour involves hotel pickup and group travel; independent participation without a guardian is reasonable from mid-teen ag |
| Phuket City Highlights: Big Buddha, Wat  | mobility | "moderate" | 0.75 | structural | **UNCONFIRMED** | Visits include Big Buddha (steep access stairs/ramp), Wat Chalong (temple grounds with steps), and Phuket Old Town (cobb |
| Phuket City Highlights: Big Buddha, Wat  | non_swimmer_ok | true | 1.00 | structural | PASS | Entirely land-based activity; swimming ability is irrelevant. |
| Phuket City Highlights: Big Buddha, Wat  | pregnant_ok | true | 0.80 | structural | **UNCONFIRMED** | Low-intensity land-based sightseeing tour described as 'relaxed' and 'comfortable and well-paced'. No extreme physical e |
| Phuket City Highlights: Big Buddha, Wat  | seasickness_risk | _N/A_ | 1.00 | structural | — | Entirely land-based temple and city tour; no water travel involved. |
| Phuket City Highlights: Big Buddha, Wat  | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age is stated anywhere in the product title or description. |
| Phuket City Highlights: Big Buddha, Wat  | wheelchair_access | "partial" | 0.70 | structural | **UNCONFIRMED** | Big Buddha has a ramp option but also has steps; Wat Chalong has uneven temple grounds; Phuket Old Town has cobblestone  |
| Phuket Elephant Nature Reserve Ethical S | independent_from | 16 | 0.50 | structural | **UNCONFIRMED** | Visiting an elephant sanctuary involves moving around outdoor terrain near large animals. Independent participation by m |
| Phuket Elephant Nature Reserve Ethical S | mobility | "moderate" | 0.70 | structural | **UNCONFIRMED** | An elephant sanctuary typically involves walking around outdoor grounds, which may include uneven terrain. This is not s |
| Phuket Elephant Nature Reserve Ethical S | non_swimmer_ok | true | 1.00 | structural | PASS | Fully land-based activity with no water involvement. Swimming ability is irrelevant. |
| Phuket Elephant Nature Reserve Ethical S | pregnant_ok | true | 0.75 | structural | **UNCONFIRMED** | The activity is explicitly hands-off ('visitors are prohibited from touching, feeding or bathing the elephants') and low |
| Phuket Elephant Nature Reserve Ethical S | seasickness_risk | _N/A_ | 1.00 | structural | — | Fully land-based activity. Seasickness is not applicable. |
| Phuket Elephant Nature Reserve Ethical S | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age is stated anywhere in the product title or description. |
| Phuket Elephant Nature Reserve Ethical S | wheelchair_access | "unknown" | 0.60 | structural | **UNCONFIRMED** | No accessibility information provided. Outdoor sanctuary terrain may be uneven, but no specific information is available |
| Phuket Phi Phi Island Tour with Lunch by | independent_from | 16 | 0.60 | structural | **UNCONFIRMED** | Open-sea speedboat tour with snorkeling in open water. Independent participation requires swimming competence and abilit |
| Phuket Phi Phi Island Tour with Lunch by | mobility | "moderate" | 0.80 | structural | **UNCONFIRMED** | Activity involves boarding and disembarking a speedboat, walking on beach/restaurant terrain, and optional snorkeling. D |
| Phuket Phi Phi Island Tour with Lunch by | non_swimmer_ok | true | 0.75 | structural | **UNCONFIRMED** | Description frames snorkeling and swimming as optional: 'enjoy swimming or relaxing' and 'ample time for snorkeling, swi |
| Phuket Phi Phi Island Tour with Lunch by | pregnant_ok | false | 0.90 | structural | PASS | Speedboat travel across open sea produces significant impact and vibration. Standard medical guidance advises pregnant w |
| Phuket Phi Phi Island Tour with Lunch by | seasickness_risk | "moderate" | 0.85 | structural | **UNCONFIRMED** | Speedboat travel from Phuket to Phi Phi Islands crosses open Andaman Sea waters. Speedboats produce significant chop and |
| Phuket Phi Phi Island Tour with Lunch by | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age is explicitly stated anywhere in the product title or description. |
| Phuket Phi Phi Island Tour with Lunch by | wheelchair_access | "no" | 0.85 | structural | **UNCONFIRMED** | Boarding a speedboat from a pier, disembarking at beach shores (including potentially wet landings), and navigating beac |
| Similan Islands Snorkeling Day Tour from | independent_from | 16 | 0.60 | structural | **UNCONFIRMED** | Open-sea day tour with long speedboat crossing and unassisted snorkeling in open water; solo participation without an ac |
| Similan Islands Snorkeling Day Tour from | mobility | "moderate" | 0.80 | structural | **UNCONFIRMED** | Snorkeling requires getting in and out of the water, boarding/disembarking a boat, and swimming; passengers must be able |
| Similan Islands Snorkeling Day Tour from | non_swimmer_ok | false | 0.85 | structural | **UNCONFIRMED** | This is a snorkeling tour in open sea conditions; while life jackets may be available, non-swimmers face genuine safety  |
| Similan Islands Snorkeling Day Tour from | pregnant_ok | false | 0.90 | structural | PASS | Long open-sea speedboat crossing with high seasickness risk, prolonged sun exposure, and snorkeling in open water are co |
| Similan Islands Snorkeling Day Tour from | seasickness_risk | "high" | 0.85 | structural | **UNCONFIRMED** | Similan Islands are approximately 60–70 km offshore requiring a long open-sea speedboat crossing; open-sea exposure and  |
| Similan Islands Snorkeling Day Tour from | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age is stated anywhere in the product title or description. |
| Similan Islands Snorkeling Day Tour from | wheelchair_access | "no" | 0.85 | structural | **UNCONFIRMED** | Speedboat boarding, open-sea crossing, beach/rock landings at Similan Islands, and in-water snorkeling are incompatible  |
| Simon Cabaret Phuket Night Out with Tick | independent_from | 18 | 0.70 | structural | **UNCONFIRMED** | Product is categorized as 'nightlife' and is an adult-oriented cabaret show. Independent attendance by minors would typi |
| Simon Cabaret Phuket Night Out with Tick | mobility | "limited" | 0.80 | structural | **UNCONFIRMED** | Activity is a seated theater show — 'our theater seats over 600 guests'. Minimal mobility required beyond getting to the |
| Simon Cabaret Phuket Night Out with Tick | non_swimmer_ok | true | 1.00 | structural | PASS | Land-based indoor theater activity; swimming ability is completely irrelevant. |
| Simon Cabaret Phuket Night Out with Tick | pregnant_ok | true | 0.90 | structural | PASS | Seated indoor theater show with no physical activity, no motion sickness risk, no heights or water. Suitable for pregnan |
| Simon Cabaret Phuket Night Out with Tick | seasickness_risk | _N/A_ | 1.00 | structural | — | Land-based indoor theater activity; no water travel involved. |
| Simon Cabaret Phuket Night Out with Tick | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age stated anywhere in the product title or description. |
| Simon Cabaret Phuket Night Out with Tick | wheelchair_access | "unknown" | 0.60 | structural | **UNCONFIRMED** | No accessibility information provided in the product description. Theater venues can vary; van transfers may present boa |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | independent_from | 16 | 0.50 | structural | **UNCONFIRMED** | Nightlife/cabaret venue in Thailand; while described as 'suitable for all ages', independent attendance at an evening ni |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | mobility | "limited" | 0.90 | structural | PASS | Seated theater show; audience members watch performers on stage. Minimal mobility required. |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | non_swimmer_ok | true | 1.00 | structural | PASS | Indoor theater show with no water involvement whatsoever. |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | pregnant_ok | true | 0.95 | structural | PASS | Seated indoor theater show with no physical activity, no motion, no chemicals, and no impact. Suitable for pregnant atte |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | seasickness_risk | _N/A_ | 1.00 | structural | — | Land-based indoor theater show. No water exposure. |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age is explicitly stated in the product title or description. |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | wheelchair_access | "unknown" | 0.60 | structural | **UNCONFIRMED** | Description mentions 'modern theater' but gives no explicit accessibility information. Theater venues can vary widely in |
| Sunset Cruise to Koh Hey in Phuket by Sa | independent_from | 16 | 0.60 | structural | **UNCONFIRMED** | Open-water sailing catamaran with snorkeling and sea sports; independent participation in such activities typically requ |
| Sunset Cruise to Koh Hey in Phuket by Sa | mobility | "moderate" | 0.75 | structural | **UNCONFIRMED** | Activity involves boarding a catamaran, beach walking, optional snorkeling and sea sports. Guests who only sunbathe or e |
| Sunset Cruise to Koh Hey in Phuket by Sa | non_swimmer_ok | true | 0.75 | structural | **UNCONFIRMED** | Description lists 'sunbathing' and staying on the boat/beach as options; 'swimming, snorkeling' are presented as choices |
| Sunset Cruise to Koh Hey in Phuket by Sa | pregnant_ok | false | 0.75 | structural | **UNCONFIRMED** | Open-sea catamaran sailing with potential for wave motion, boarding instability, and optional high-intensity sea sports  |
| Sunset Cruise to Koh Hey in Phuket by Sa | seasickness_risk | "moderate" | 0.70 | structural | **UNCONFIRMED** | Koh Hey (Coral Island) is reached via coastal Andaman Sea waters. Catamarans are more stable than speedboats but the ope |
| Sunset Cruise to Koh Hey in Phuket by Sa | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age is stated anywhere in the product title or description. |
| Sunset Cruise to Koh Hey in Phuket by Sa | wheelchair_access | "unknown" | 0.70 | structural | **UNCONFIRMED** | No accessibility information is provided. Catamaran boarding, beach terrain, and tender/dock access typically present ba |
| Swedish Aromatic Oil Massage at Award Wi | independent_from | 16 | 0.60 | structural | **UNCONFIRMED** | Spa treatments typically require participants to be adults or older teenagers to consent independently to massage. No ex |
| Swedish Aromatic Oil Massage at Award Wi | mobility | "limited" | 0.85 | structural | **UNCONFIRMED** | A massage requires only that the participant lie on a treatment table. Even those with limited mobility can participate. |
| Swedish Aromatic Oil Massage at Award Wi | non_swimmer_ok | true | 1.00 | structural | PASS | Land-based indoor massage. Swimming ability is entirely irrelevant. |
| Swedish Aromatic Oil Massage at Award Wi | pregnant_ok | false | 0.75 | structural | **UNCONFIRMED** | Swedish massage and use of aromatic oils are generally contraindicated during pregnancy, particularly in the first trime |
| Swedish Aromatic Oil Massage at Award Wi | seasickness_risk | _N/A_ | 1.00 | structural | — | Land-based indoor spa treatment. No water travel involved. |
| Swedish Aromatic Oil Massage at Award Wi | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age is stated anywhere in the product title or description. |
| Swedish Aromatic Oil Massage at Award Wi | wheelchair_access | "unknown" | 0.70 | structural | **UNCONFIRMED** | No accessibility information is provided in the description. The resort spa setting may have accessible facilities but t |
| Twilight Sea Canoe Tour with Sea Cave Ka | independent_from | 16 | 0.60 | structural | **UNCONFIRMED** | Sea kayaking in tidal sea caves and open Phang Nga Bay requires physical paddling capability, the ability to follow safe |
| Twilight Sea Canoe Tour with Sea Cave Ka | mobility | "moderate" | 0.85 | structural | **UNCONFIRMED** | Sea kayaking requires the ability to board a low-profile kayak, maintain a seated paddling posture, and manoeuvre throug |
| Twilight Sea Canoe Tour with Sea Cave Ka | non_swimmer_ok | false | 0.75 | structural | **UNCONFIRMED** | Sea kayaking in tidal sea caves involves risk of capsize in enclosed spaces with low clearance. While life jackets are s |
| Twilight Sea Canoe Tour with Sea Cave Ka | pregnant_ok | false | 0.85 | structural | **UNCONFIRMED** | Sea kayaking in tidal sea caves with low-clearance passages, boat transfers, and risk of capsize presents real physical  |
| Twilight Sea Canoe Tour with Sea Cave Ka | seasickness_risk | "low" | 0.75 | structural | **UNCONFIRMED** | Phang Nga Bay is a sheltered bay environment with calm, protected waters surrounded by limestone karsts. Boat transit is |
| Twilight Sea Canoe Tour with Sea Cave Ka | stated_min_age | _N/A_ | 0.70 | unverified | — | No minimum age is stated anywhere in the product title or description. |
| Twilight Sea Canoe Tour with Sea Cave Ka | wheelchair_access | "no" | 0.90 | structural | PASS | Sea kayaking requires boarding a low-profile kayak from a boat or beach, and manoeuvring through sea caves. This is stru |

---

## 2. High-Confidence Info Attributes (≥0.85)

| Product | Attribute | Value | Conf | Basis | Evidence |
|---|---|---|---|---|---|
| Best of Phuket: Big Buddha, Wat Chalong  | best_months | ["November","December","January","February","March","April"] | 0.90 | structural | Phuket high season (Nov–Apr) offers dry weather, clear skies, and good visibility for viewpoints and outdoor sightseeing |
| Best of Phuket: Big Buddha, Wat Chalong  | confirm_at_booking | true | 1.00 | structural | wheelchair_access is 'partial'; operator should be consulted to confirm vehicle accessibility and which specific areas c |
| Best of Phuket: Big Buddha, Wat Chalong  | group_type | ["solo","couple","family","friends","large_group"] | 0.85 | structural | Description states 'small-group excursion' — cultural sightseeing is broadly suitable for all group compositions. Descri |
| Best of Phuket: Big Buddha, Wat Chalong  | indoor | false | 0.95 | structural | All listed attractions — Big Buddha, Wat Chalong, Karon Viewpoint, beach roads — are primarily outdoor experiences. |
| Best of Phuket: Big Buddha, Wat Chalong  | intensity | "low" | 0.85 | structural | Guided sightseeing tour with vehicle transport between sites; primary activities are walking around temples and viewpoin |
| Best of Phuket: Big Buddha, Wat Chalong  | partial_participation_ok | true | 0.85 | structural | Small-group tour with multiple stops; the activity is observational/cultural in nature, making partial participation (e. |
| Best of Phuket: Big Buddha, Wat Chalong  | seasonal_closure | _N/A_ | 0.90 | structural | Big Buddha, Wat Chalong, and Karon Viewpoint are year-round attractions with no known seasonal closures. Tour may be les |
| Best of Phuket: Big Buddha, Wat Chalong  | sun_exposure | "full" | 0.85 | structural | Big Buddha is an open-air hilltop monument, Karon Viewpoint is outdoor, and the tour description mentions 'Phuket's natu |
| Best of Phuket: Big Buddha, Wat Chalong  | vessel_type | "none" | 1.00 | structural | Land-based temple and viewpoint tour; no boat or vessel of any kind mentioned or required. |
| Best of Phuket: Big Buddha, Wat Chalong  | water_exposure | "none" | 1.00 | structural | Tour visits Big Buddha, Wat Chalong, and Karon Viewpoint — all land-based sites. Beach roads are driven along, not swum  |
| Best of Phuket: Big Buddha, Wat Chalong  | with_adult_from | 0 | 0.90 | structural | Temple and viewpoint tour involves walking and riding in a vehicle — no genuine physical floor preventing infant/toddler |
| Catamaran Sunset Cruise in Phuket with D | access_constraint | _N/A_ | 1.00 | structural | wheelchair_access is 'unknown' — access_constraint is only set when wheelchair_access is 'no' or 'partial'. |
| Catamaran Sunset Cruise in Phuket with D | advance_booking_needed | "recommended" | 0.85 | structural | Sunset cruise with set dinner and hotel transfers — limited capacity on a catamaran and fixed departure time makes advan |
| Catamaran Sunset Cruise in Phuket with D | best_months | ["November","December","January","February","March","April"] | 0.90 | structural | Phuket high season (Nov–Apr) offers calm seas, clear skies, and reliable sunsets — ideal for a sunset cruise. Monsoon mo |
| Catamaran Sunset Cruise in Phuket with D | best_time_of_day | "evening" | 1.00 | textual | Title states 'Sunset Cruise' and description references 'twilight', 'evening sky', and 'under the stars' — definitively  |
| Catamaran Sunset Cruise in Phuket with D | confirm_at_booking | true | 1.00 | structural | wheelchair_access is 'unknown', so accessibility details must be confirmed with the operator at booking time. |
| Catamaran Sunset Cruise in Phuket with D | group_type | ["couple","friends","solo","family"] | 0.90 | textual | Description explicitly states 'Whether you're seeking a romantic evening or a memorable experience with friends'. Solo a |
| Catamaran Sunset Cruise in Phuket with D | indoor | false | 0.90 | textual | Description mentions 'panoramic coastal views', 'magical colors of the evening sky', and dining 'under the stars' — clea |
| Catamaran Sunset Cruise in Phuket with D | intensity | "low" | 0.90 | textual | Description says 'sit back and enjoy the journey' and emphasises 'relaxation'. Passive sunset cruise with dinner — no ph |
| Catamaran Sunset Cruise in Phuket with D | partial_participation_ok | true | 0.85 | structural | Cruise is primarily a scenic and social experience. A pregnant person or non-drinker can enjoy the views and atmosphere  |
| Catamaran Sunset Cruise in Phuket with D | sun_exposure | "partial" | 0.85 | textual | Described as a 'sunset cruise' departing in the early evening. Sunset hour involves lower but still present sun exposure |
| Catamaran Sunset Cruise in Phuket with D | vessel_type | "catamaran" | 1.00 | textual | Title states 'Catamaran Sunset Cruise' and description opens with 'Set sail on a stylish catamaran'. |
| Flying Hanuman Zipline Experience Family | access_constraint | "terrain" | 0.95 | structural | Activity takes place on 'hillsides' in 'thick forest'. Uneven jungle terrain and elevated platforms are the primary barr |
| Flying Hanuman Zipline Experience Family | confirm_at_booking | false | 0.85 | structural | Wheelchair access assessed as 'no' based on terrain constraints, so confirmation is not necessary — the activity is stru |
| Flying Hanuman Zipline Experience Family | indoor | false | 1.00 | textual | Description states activity takes place on 'hillsides of Phuket' in 'thick forest'. Entirely outdoor activity. |
| Flying Hanuman Zipline Experience Family | vessel_type | "none" | 1.00 | structural | Land-based activity set in Phuket hillside forest. Description references 'hillsides' and 'thick forest', no water trans |
| Flying Hanuman Zipline Experience Family | water_exposure | "none" | 1.00 | textual | Land-based jungle zipline. Description explicitly contrasts with sea/beach: 'goes far beyond the sea, sun and sand'. Act |
| James Bond Island with Canoeing and Lunc | advance_booking_needed | "recommended" | 0.85 | structural | Speedboat tours to James Bond Island are among the most popular day trips from Phuket with limited vessel capacity. Hote |
| James Bond Island with Canoeing and Lunc | best_months | ["November","December","January","February","March","April"] | 0.90 | structural | Phuket high season (Nov–Apr) brings calm seas, low winds, and clear skies — ideal conditions for a speedboat day tour in |
| James Bond Island with Canoeing and Lunc | best_time_of_day | "morning" | 0.85 | structural | Full-day tour of 420 minutes (7 hours) with multiple stops. Morning departures are standard for such tours to avoid afte |
| James Bond Island with Canoeing and Lunc | indoor | false | 0.95 | structural | Activity is a marine speedboat day tour with outdoor sightseeing, canoeing, trekking, and swimming. Only the lunch stop  |
| James Bond Island with Canoeing and Lunc | sun_exposure | "full" | 0.90 | structural | Full-day speedboat tour on open waters in Phang Nga Bay with outdoor sightseeing, trekking, and swimming. The 420-minute |
| James Bond Island with Canoeing and Lunc | vessel_type | "speedboat" | 1.00 | textual | Title explicitly states 'James Bond Island with Canoeing and Lunch by Speedboat'. |
| James Bond Island with Canoeing and Lunc | water_exposure | "sheltered_bay" | 0.90 | textual | Description states 'Explore breathtaking Phang Nga Bay' — Phang Nga Bay is a sheltered bay environment with limestone ka |
| Khao Lak Zipline Adventure at Sky Rock | access_constraint | "terrain" | 0.90 | structural | Jungle rainforest terrain with 27 elevated platforms is the primary barrier — uneven ground, steps, and elevated zipline |
| Khao Lak Zipline Adventure at Sky Rock | indoor | false | 1.00 | textual | Description explicitly references outdoor jungle/rainforest environment: 'through the lush rainforest canopy' and 'soari |
| Khao Lak Zipline Adventure at Sky Rock | vessel_type | "none" | 1.00 | structural | This is a land-based rainforest zipline adventure. No boat or vessel is involved. |
| Khao Lak Zipline Adventure at Sky Rock | water_exposure | "none" | 1.00 | structural | Land-based activity in rainforest canopy. No water exposure described or structurally implied. |
| Muay Thai Boxing Class for Beginners | best_months | ["January","February","March","April","May","June","July","August","September","October","November","December"] | 0.90 | structural | Indoor gym activity unaffected by Phuket's seasonal weather patterns; suitable year-round. |
| Muay Thai Boxing Class for Beginners | intensity | "high" | 0.85 | textual | Description states 'cardiovascular conditioning' as a goal and the activity is Muay Thai boxing; even a beginner class i |
| Muay Thai Boxing Class for Beginners | rain_viable | true | 0.85 | structural | Indoor/covered gym-based activity; rain does not affect participation. |
| Muay Thai Boxing Class for Beginners | seasonal_closure | _N/A_ | 0.85 | structural | No known seasonal closure for gym-based Muay Thai classes; no authority cited any closure period. |
| Muay Thai Boxing Class for Beginners | vessel_type | "none" | 1.00 | structural | Land-based Muay Thai class; no vessel involved. |
| Muay Thai Boxing Class for Beginners | water_exposure | "none" | 1.00 | structural | Land-based gym activity with no water component. |
| One Day Experience Cooking at Phuket Pat | best_months | ["January","February","March","April","May","June","July","August","September","October","November","December"] | 0.95 | structural | Indoor cooking class is not weather-dependent. Suitable year-round in Phuket regardless of season. |
| One Day Experience Cooking at Phuket Pat | confirm_at_booking | true | 1.00 | structural | wheelchair_access is 'unknown'. Operator should be contacted to confirm kitchen accessibility, workstation adaptability, |
| One Day Experience Cooking at Phuket Pat | group_type | ["solo","couple","family","friends","large_group"] | 0.90 | textual | Description states 'Perfect for food enthusiasts, families, or anyone looking for a unique cultural experience', explici |
| One Day Experience Cooking at Phuket Pat | indoor | true | 0.85 | structural | Cooking classes are conducted in kitchen facilities. Description mentions a market tour component which is outdoor, but  |
| One Day Experience Cooking at Phuket Pat | intensity | "low" | 0.90 | structural | Cooking class is a sedentary, skill-based activity. Description references learning recipes like 'Pad Thai, Tom Yum, and |
| One Day Experience Cooking at Phuket Pat | partial_participation_ok | true | 0.85 | structural | Cooking classes are group-based and typically allow observers to watch, assist lightly, or simply taste. Description fra |
| One Day Experience Cooking at Phuket Pat | rain_viable | true | 0.90 | structural | Cooking class is conducted indoors in a kitchen facility. Rain does not affect the primary activity. Market tour compone |
| One Day Experience Cooking at Phuket Pat | seasonal_closure | _N/A_ | 0.90 | structural | No known seasonal closures for an indoor cooking class in Patong. No closures indicated in the product description. |
| One Day Experience Cooking at Phuket Pat | vessel_type | "none" | 1.00 | structural | Land-based cooking class at Patong, Phuket. No boat or vessel involved. |
| One Day Experience Cooking at Phuket Pat | water_exposure | "none" | 1.00 | structural | Indoor cooking class. No water exposure applicable. |
| One Day Experience Cooking at Phuket Pat | with_adult_from | 0 | 0.85 | structural | Cooking class with knife use and hot stoves presents a practical floor. Very young children (toddlers/infants) cannot me |
| Patong Highlight Elephant Sanctuary with | access_constraint | "terrain" | 0.90 | structural | Forest hill terrain behind Patong Beach is the primary barrier — uneven, potentially muddy paths are not wheelchair-navi |
| Patong Highlight Elephant Sanctuary with | group_type | ["solo","couple","family","friends","large_group"] | 0.85 | structural | Educational wildlife sanctuary tour with broad demographic appeal — no structural exclusion of any group type. Suitable  |
| Patong Highlight Elephant Sanctuary with | indoor | false | 1.00 | textual | 'Guided walk into the forest' and 'roam, forage, and interact freely in their natural surroundings' — explicitly outdoor |
| Patong Highlight Elephant Sanctuary with | intensity | "low" | 0.85 | textual | 'Hands-off, immersive one hour experience' with quiet observation; 'quietly observe the elephants as they roam, forage,  |
| Patong Highlight Elephant Sanctuary with | vessel_type | "none" | 1.00 | structural | 'Nestled in the forest just behind Patong Beach' — land-based sanctuary, no vessel required. |
| Patong Highlight Elephant Sanctuary with | water_exposure | "none" | 1.00 | structural | Land-based forest sanctuary. No water activity described. |
| Phang Nga Bay Sea Cave Canoeing & James  | access_constraint | "terrain" | 0.85 | structural | Primary barrier is uneven terrain on James Bond Island (limestone karst) and the requirement to board/exit low-lying can |
| Phang Nga Bay Sea Cave Canoeing & James  | best_months | ["November","December","January","February","March","April"] | 0.90 | structural | Phang Nga Bay is in the Andaman Sea region. High season Nov–Apr brings calm seas and clear skies, optimal for canoeing a |
| Phang Nga Bay Sea Cave Canoeing & James  | best_time_of_day | "morning" | 0.85 | structural | Full-day tour (420 minutes / 7 hours) typically departs in the morning to avoid afternoon heat and crowds at James Bond  |
| Phang Nga Bay Sea Cave Canoeing & James  | group_type | ["solo","couple","family","friends","large_group"] | 0.85 | structural | Big boat group tour with diverse activities (sightseeing, canoeing, trekking, swimming, paddleboarding, buffet lunch) su |
| Phang Nga Bay Sea Cave Canoeing & James  | indoor | false | 1.00 | structural | Entire activity is outdoors on water and islands. Sea caves provide momentary shelter but the activity is fundamentally  |
| Phang Nga Bay Sea Cave Canoeing & James  | sun_exposure | "full" | 0.90 | structural | Full-day outdoor tour on open water and islands in tropical Thailand with no mention of shade structures. Canoeing, trek |
| Phang Nga Bay Sea Cave Canoeing & James  | water_exposure | "sheltered_bay" | 0.95 | textual | Title and description repeatedly reference 'Phang Nga Bay', which is a well-known sheltered bay. Islands visited (Panak, |
| Phi Phi Maya Bay and Khai Island Snorkel | access_constraint | "vehicle" | 0.85 | structural | Primary barrier is boarding and riding a speedboat, which requires physical agility to step into the vessel and balance  |
| Phi Phi Maya Bay and Khai Island Snorkel | advance_booking_needed | "recommended" | 0.85 | structural | Popular Phi Phi Maya Bay route with limited speedboat capacity; high-season demand makes advance booking prudent, though |
| Phi Phi Maya Bay and Khai Island Snorkel | best_months | ["November","December","January","February","March","April"] | 0.90 | structural | Phuket/Andaman Sea high season Nov–Apr offers calm seas, clear visibility, and reliable weather for open-sea crossings t |
| Phi Phi Maya Bay and Khai Island Snorkel | best_time_of_day | "morning" | 0.85 | structural | Full-day trip departing in the morning allows arrival at Maya Bay before peak crowds; morning sea conditions are typical |
| Phi Phi Maya Bay and Khai Island Snorkel | group_type | ["solo","couple","family","friends","large_group"] | 0.95 | textual | Description explicitly states 'Perfect for families, couples, friends, and solo travelers'. |
| Phi Phi Maya Bay and Khai Island Snorkel | indoor | false | 1.00 | structural | Entirely outdoor activity on boats and beaches in the Andaman Sea. |
| Phi Phi Maya Bay and Khai Island Snorkel | partial_participation_ok | true | 0.90 | structural | Itinerary includes beach time, Thai buffet lunch, sightseeing from the boat at Viking Cave, and Monkey Beach — all acces |
| Phi Phi Maya Bay and Khai Island Snorkel | sun_exposure | "full" | 0.95 | textual | Full-day outdoor activity on speedboat, beaches, and open water with no mention of shade structures. 'Sunbathing' explic |
| Phi Phi Maya Bay and Khai Island Snorkel | vessel_type | "speedboat" | 0.97 | textual | Title and description state 'speedboat tour' — 'full-day Phi Phi Island, Maya Bay and Khai Island speedboat tour from Ph |
| Phi Phi Maya Bay and Khai Island Snorkel | water_exposure | "open_sea" | 0.95 | structural | Route from Phuket to Phi Phi Islands involves crossing the open Andaman Sea. Description states 'Cruise the sparkling An |
| Phuket ATV Riding 30 Minutes | access_constraint | "terrain" | 0.95 | structural | The activity takes place on 'mountain and jungle along natural tracks' and 'bumpy trails' — uneven outdoor terrain that  |
| Phuket ATV Riding 30 Minutes | best_months | ["November","December","January","February","March","April"] | 0.85 | structural | Phuket high season (Nov–Apr) offers dry weather and firm trails ideal for ATV riding. Monsoon months (Jun–Sep) bring hea |
| Phuket ATV Riding 30 Minutes | confirm_at_booking | false | 0.85 | structural | Wheelchair access is assessed as definitively 'no' due to terrain and activity mechanics, so confirmation is not necessa |
| Phuket ATV Riding 30 Minutes | group_type | ["solo","couple","family","friends"] | 0.85 | textual | Description states 'children can join in' (supporting family), 'many options to choose from according to your needs' (br |
| Phuket ATV Riding 30 Minutes | indoor | false | 1.00 | textual | Description explicitly describes outdoor terrain: 'beautiful mountain and the jungle along natural tracks', 'beautiful P |
| Phuket ATV Riding 30 Minutes | vessel_type | "none" | 1.00 | structural | Land-based ATV activity. No vessel involved. |
| Phuket ATV Riding 30 Minutes | water_exposure | "none" | 1.00 | structural | Activity takes place on 'mountain and jungle along natural tracks' — no water exposure described or implied. |
| Phuket City Highlights: Big Buddha, Wat  | best_months | ["November","December","January","February","March","April"] | 0.85 | structural | Phuket high season (Nov–Apr) offers dry, sunny weather ideal for outdoor sightseeing at temple hilltops and Old Town str |
| Phuket City Highlights: Big Buddha, Wat  | confirm_at_booking | true | 0.90 | structural | wheelchair_access is 'partial'; specific accessibility provisions at each stop (ramps, step-free paths) should be confir |
| Phuket City Highlights: Big Buddha, Wat  | group_type | ["solo","couple","family","friends","large_group"] | 0.85 | structural | Description says 'designed especially for first-time visitors' and covers cultural highlights broadly appealing to all g |
| Phuket City Highlights: Big Buddha, Wat  | indoor | false | 0.90 | structural | Multiple outdoor landmark visits including Big Buddha hilltop and Wat Chalong temple grounds make this primarily an outd |
| Phuket City Highlights: Big Buddha, Wat  | intensity | "low" | 0.85 | textual | Description states 'relaxed half-day itinerary' and 'comfortable and well-paced way to experience Phuket's cultural high |
| Phuket City Highlights: Big Buddha, Wat  | partial_participation_ok | true | 0.85 | structural | Multi-stop group tour with transfers; structural nature of the tour allows selective participation at each stop. |
| Phuket City Highlights: Big Buddha, Wat  | seasonal_closure | _N/A_ | 0.90 | structural | Big Buddha, Wat Chalong, and Phuket Old Town are year-round attractions with no known seasonal closures. |
| Phuket City Highlights: Big Buddha, Wat  | sun_exposure | "partial" | 0.85 | structural | Visits to outdoor temple grounds (Big Buddha, Wat Chalong) and Old Town streets involve outdoor sun exposure, but also i |
| Phuket City Highlights: Big Buddha, Wat  | vessel_type | "none" | 1.00 | structural | Land-based city and temple sightseeing tour with no water component. |
| Phuket City Highlights: Big Buddha, Wat  | water_exposure | "none" | 1.00 | structural | Land-based tour visiting Big Buddha, Wat Chalong, Phuket Old Town, cashew nut factory, honey farm, and Gem Gallery. No w |
| Phuket City Highlights: Big Buddha, Wat  | with_adult_from | 0 | 0.90 | structural | Land-based sightseeing and walking tour with no physical floor; infants/toddlers can be carried or use a stroller in mos |
| Phuket Elephant Nature Reserve Ethical S | confirm_at_booking | true | 1.00 | structural | wheelchair_access is 'unknown', so accessibility details must be confirmed with the operator at booking. |
| Phuket Elephant Nature Reserve Ethical S | group_type | ["solo","couple","family","friends","large_group"] | 0.85 | structural | Elephant sanctuary visits and cooking demos are universally appealing, educational, and non-physically demanding, making |
| Phuket Elephant Nature Reserve Ethical S | indoor | false | 0.85 | structural | Elephant sanctuary visits are inherently outdoor activities. The cooking class component may be partially covered but th |
| Phuket Elephant Nature Reserve Ethical S | intensity | "low" | 0.85 | structural | Activity consists of observing elephants ('completely hand-off') and a cooking class demo — both sedentary or gently act |
| Phuket Elephant Nature Reserve Ethical S | vessel_type | "none" | 1.00 | structural | Land-based elephant sanctuary and cooking class. No vessel involved. |
| Phuket Elephant Nature Reserve Ethical S | water_exposure | "none" | 1.00 | structural | Land-based activity at an elephant sanctuary. No water exposure. |
| Phuket Phi Phi Island Tour with Lunch by | access_constraint | "vehicle" | 0.85 | structural | Primary barrier is boarding and disembarking the speedboat, which requires stepping over the gunwale and navigating unst |
| Phuket Phi Phi Island Tour with Lunch by | best_months | ["November","December","January","February","March","April"] | 0.90 | structural | Phuket high season (Nov–Apr) offers calm Andaman Sea conditions, clear visibility for snorkeling, and reliable weather f |
| Phuket Phi Phi Island Tour with Lunch by | best_time_of_day | "morning" | 0.90 | textual | Description states 'After morning pick up, board on a speedboat depart from Phuket', confirming this is a morning-depart |
| Phuket Phi Phi Island Tour with Lunch by | group_type | ["solo","couple","family","friends","large_group"] | 0.85 | structural | General island tour with lunch — broad appeal. Phi Phi speedboat tours are a mainstream Phuket experience suitable for a |
| Phuket Phi Phi Island Tour with Lunch by | indoor | false | 0.95 | structural | Activity is a full-day boat and beach tour. Only the 'buffet lunch served in a restaurant on Phi Phi Don' is indoors; th |
| Phuket Phi Phi Island Tour with Lunch by | partial_participation_ok | true | 0.90 | textual | Description states 'enjoy swimming or relaxing' and 'ample time for snorkeling, swimming or relaxing', explicitly framin |
| Phuket Phi Phi Island Tour with Lunch by | sun_exposure | "full" | 0.95 | structural | Full-day outdoor speedboat tour visiting beaches and bays in the tropical Andaman Sea. No shade structures mentioned; pa |
| Phuket Phi Phi Island Tour with Lunch by | vessel_type | "speedboat" | 1.00 | textual | Title explicitly states 'by Speedboat'. |
| Phuket Phi Phi Island Tour with Lunch by | water_exposure | "open_sea" | 0.95 | structural | Phi Phi Islands are approximately 45 km from Phuket across open Andaman Sea. The crossing involves significant open-wate |
| Similan Islands Snorkeling Day Tour from | advance_booking_needed | "required" | 0.85 | structural | Day tour from Phuket to Similan Islands requires coordinated boat transfers and national park entry; seats are limited a |
| Similan Islands Snorkeling Day Tour from | best_months | ["November","December","January","February","March","April"] | 0.90 | textual | Description states 'open annually only from October to May'; Phuket high season (Nov–Apr) offers best sea conditions for |
| Similan Islands Snorkeling Day Tour from | best_time_of_day | "morning" | 0.85 | structural | Full-day tours to Similan Islands from Phuket depart early morning (typically 06:00–07:00) to maximize time at the islan |
| Similan Islands Snorkeling Day Tour from | confirm_at_booking | false | 0.85 | structural | Wheelchair access is assessed as 'no' (not 'unknown' or 'partial'), so confirm_at_booking is not triggered per ontology  |
| Similan Islands Snorkeling Day Tour from | indoor | false | 1.00 | structural | Open-sea snorkeling day tour is entirely outdoors. |
| Similan Islands Snorkeling Day Tour from | seasonal_closure | {"months":["May","June","July","August","September","October"],"source_note":"Description states 'open annually only from October to May'; closure period is approximately mid-May through end of September per DNP Thailand (Mu Ko Similan National Park). October opening date varies by year."} | 0.90 | textual | Description states 'The Similan islands are open annually only from October to May', consistent with DNP Thailand's annu |
| Similan Islands Snorkeling Day Tour from | sun_exposure | "full" | 0.95 | structural | Full-day boat tour ('720 minutes') in the open Andaman Sea with snorkeling; passengers are exposed to direct tropical su |
| Similan Islands Snorkeling Day Tour from | water_exposure | "open_sea" | 0.95 | structural | Description states 'Similan Islands' which are approximately 60–70 km offshore in the Andaman Sea, requiring an extended |
| Simon Cabaret Phuket Night Out with Tick | advance_booking_needed | "recommended" | 0.85 | structural | Theater with 600 seats in a popular tourist area; tickets included in package suggests pre-booking is integral. No expli |
| Simon Cabaret Phuket Night Out with Tick | best_months | ["January","February","March","April","May","June","July","August","September","October","November","December"] | 0.90 | structural | Indoor theater show runs year-round regardless of weather or season; Simon Cabaret is a permanent year-round venue in Ph |
| Simon Cabaret Phuket Night Out with Tick | best_time_of_day | "evening" | 0.95 | textual | Product is categorized as 'nightlife' and is titled 'Night Out', indicating evening performances. |
| Simon Cabaret Phuket Night Out with Tick | confirm_at_booking | true | 1.00 | structural | wheelchair_access is 'unknown'; confirmation with operator required per ontology rules for accessibility details includi |
| Simon Cabaret Phuket Night Out with Tick | indoor | true | 0.98 | textual | Description references 'our theater' with 'state-of-the-art sound and visuals' and 'air-conditioned vans' for transfer — |
| Simon Cabaret Phuket Night Out with Tick | intensity | "low" | 0.95 | structural | Seated indoor cabaret show; participants are passive audience members watching a stage performance. No physical activity |
| Simon Cabaret Phuket Night Out with Tick | partial_participation_ok | true | 0.95 | structural | A theater show is inherently a spectator activity; partial participation is the full participation mode. |
| Simon Cabaret Phuket Night Out with Tick | rain_viable | true | 0.95 | structural | Indoor theater activity with air-conditioned van transfer; rain has no impact on the show itself. Brief exposure moving  |
| Simon Cabaret Phuket Night Out with Tick | seasonal_closure | _N/A_ | 0.85 | structural | Simon Cabaret is a permanent indoor theater venue — 'Celebrating over 30 years' — with no known seasonal closures. No cl |
| Simon Cabaret Phuket Night Out with Tick | sun_exposure | "none" | 0.95 | structural | Indoor theater venue — 'our theater seats over 600 guests' — with air-conditioned van transfer. Evening/night activity ( |
| Simon Cabaret Phuket Night Out with Tick | vessel_type | "none" | 1.00 | structural | Land-based activity with road transfer — 'air-conditioned vans from your hotel'. No boat involved. |
| Simon Cabaret Phuket Night Out with Tick | water_exposure | "none" | 1.00 | structural | Indoor theater show with road transfer. No water exposure of any kind. |
| Simon Cabaret Phuket Night Out with Tick | with_adult_from | 0 | 0.85 | structural | A theater show has no genuine physical floor preventing infant/toddler attendance with an adult, though very young child |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | best_months | ["January","February","March","April","May","June","July","August","September","October","November","December"] | 0.95 | structural | Indoor entertainment venue operates year-round regardless of weather or season. |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | best_time_of_day | "evening" | 0.95 | textual | Description references 'an unforgettable evening of entertainment' and categorized as nightlife. |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | confirm_at_booking | true | 1.00 | structural | wheelchair_access is 'unknown'; accessibility details should be confirmed with the operator at booking. |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | group_type | ["solo","couple","family","friends","large_group"] | 0.90 | textual | Description states 'suitable for all ages' and references both 'fun night out' and cultural tourism appeal, suggesting b |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | indoor | true | 1.00 | textual | Description states 'Set in a modern theater equipped with state-of-the-art lighting and sound systems'. |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | intensity | "low" | 0.95 | structural | Audience is seated watching a cabaret performance. No physical exertion required. |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | partial_participation_ok | true | 0.95 | structural | Structural: theater show format means everyone watches; there is no active participation component to opt out of. |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | rain_viable | true | 1.00 | structural | Indoor theater show is fully weather-independent. |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | sun_exposure | "none" | 1.00 | textual | Description states 'Set in a modern theater' — fully indoor venue. |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | vessel_type | "none" | 1.00 | structural | Land-based indoor theater activity. No vessel involved. |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | water_exposure | "none" | 1.00 | structural | Indoor theater show with no water component. |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | with_adult_from | 0 | 0.90 | textual | A seated theater show has no physical floor preventing infant/toddler attendance with an adult. Description states 'suit |
| Sunset Cruise to Koh Hey in Phuket by Sa | access_constraint | _N/A_ | 1.00 | structural | access_constraint only set when wheelchair_access is 'no' or 'partial'; value is 'unknown' here. |
| Sunset Cruise to Koh Hey in Phuket by Sa | best_months | ["November","December","January","February","March","April"] | 0.90 | structural | Phuket high season (Nov–Apr) offers calm Andaman seas, clear skies, and optimal sunset conditions. Coral Island is acces |
| Sunset Cruise to Koh Hey in Phuket by Sa | best_time_of_day | "evening" | 0.95 | textual | Title states 'Sunset Cruise' — the product is specifically designed around sunset timing. |
| Sunset Cruise to Koh Hey in Phuket by Sa | confirm_at_booking | true | 1.00 | structural | wheelchair_access is 'unknown'; accessibility details must be confirmed with the operator before booking. |
| Sunset Cruise to Koh Hey in Phuket by Sa | indoor | false | 1.00 | structural | Activity is a sailing catamaran cruise to a beach island — entirely outdoors. |
| Sunset Cruise to Koh Hey in Phuket by Sa | partial_participation_ok | true | 0.90 | textual | Description lists multiple optional activities: 'swimming, snorkeling, sunbathing, or even playing sea sports of your ch |
| Sunset Cruise to Koh Hey in Phuket by Sa | sun_exposure | "full" | 0.95 | textual | Description mentions 'sunbathing' on 'white sand beach' and sailing the Andaman Sea — primarily outdoor activity with no |
| Sunset Cruise to Koh Hey in Phuket by Sa | vessel_type | "catamaran" | 1.00 | textual | Title states 'by Sailing Catamaran' and description references 'a big and very comfortable catamaran'. |
| Swedish Aromatic Oil Massage at Award Wi | advance_booking_needed | "recommended" | 0.85 | structural | Award-winning spa treatments at resort spas typically require advance booking to secure preferred times. No explicit boo |
| Swedish Aromatic Oil Massage at Award Wi | best_months | ["January","February","March","April","May","June","July","August","September","October","November","December"] | 0.95 | structural | Indoor wellness activity is not weather-dependent and is equally viable year-round in Phuket. |
| Swedish Aromatic Oil Massage at Award Wi | best_time_of_day | "any" | 0.90 | structural | Indoor spa with no time-of-day dependency. Morning sessions may be quieter but no specific time restriction stated. |
| Swedish Aromatic Oil Massage at Award Wi | confirm_at_booking | true | 1.00 | structural | wheelchair_access is 'unknown', so accessibility details should be confirmed with the operator at booking per ontology r |
| Swedish Aromatic Oil Massage at Award Wi | group_type | ["solo","couple"] | 0.90 | textual | Description states 'the perfect retreat for couples or individuals alike', directly indicating solo and couple suitabili |
| Swedish Aromatic Oil Massage at Award Wi | indoor | true | 0.95 | textual | Description states 'private treatment room complete with an ensuite bathroom and steam room', clearly an indoor setting. |
| Swedish Aromatic Oil Massage at Award Wi | intensity | "low" | 0.99 | textual | Description emphasises 'relaxation and renewal', 'rejuvenating', 'serene private treatment room', 'soothing atmosphere'. |
| Swedish Aromatic Oil Massage at Award Wi | rain_viable | true | 0.99 | structural | Indoor spa treatment entirely unaffected by rain conditions. |
| Swedish Aromatic Oil Massage at Award Wi | seasonal_closure | _N/A_ | 0.85 | structural | No known seasonal closures for an indoor resort spa. No closure information stated in the description. |
| Swedish Aromatic Oil Massage at Award Wi | sun_exposure | "none" | 0.95 | textual | Description refers to a 'serene private treatment room' indoors. The activity is an indoor spa massage with no sun expos |
| Swedish Aromatic Oil Massage at Award Wi | vessel_type | "none" | 1.00 | structural | Land-based spa activity at The Kee Resort. No vessel involved. |
| Swedish Aromatic Oil Massage at Award Wi | water_exposure | "none" | 1.00 | structural | Indoor spa treatment. No open water exposure. |
| Twilight Sea Canoe Tour with Sea Cave Ka | advance_booking_needed | "required" | 0.85 | structural | Twilight Sea Canoe is a specific branded operator product with a premium price (3850 THB) and specific scheduling includ |
| Twilight Sea Canoe Tour with Sea Cave Ka | best_months | ["November","December","January","February","March","April"] | 0.90 | structural | Phuket and Phang Nga Bay high season (Nov–Apr) offers calm seas, clear skies, and ideal conditions for sea kayaking and  |
| Twilight Sea Canoe Tour with Sea Cave Ka | best_time_of_day | "evening" | 0.95 | textual | Title explicitly states 'Twilight Sea Canoe Tour' and description notes visiting James Bond Island 'after most of the ot |
| Twilight Sea Canoe Tour with Sea Cave Ka | confirm_at_booking | false | 0.85 | structural | Wheelchair access is assessed as 'no' (not 'unknown' or 'partial'), so confirm_at_booking is not required under the onto |
| Twilight Sea Canoe Tour with Sea Cave Ka | group_type | ["solo","couple","family","friends"] | 0.85 | structural | Adventure sea kayaking tours of this nature are marketed broadly. The personal paddle guide makes it accessible to vario |
| Twilight Sea Canoe Tour with Sea Cave Ka | indoor | false | 1.00 | structural | Outdoor sea kayaking and boat tour in Phang Nga Bay. Entirely outdoor activity. |
| Twilight Sea Canoe Tour with Sea Cave Ka | water_exposure | "sheltered_bay" | 0.95 | textual | Description explicitly names 'Phang Nga Bay' as the operating area — a highly sheltered bay enclosed by limestone island |

---

## 3. Ontology V2 Fields in Action

### 3a. stated_min_age / with_adult_from / independent_from

| Product | stated_min_age | with_adult_from | independent_from | Notes |
|---|---|---|---|---|
| Best of Phuket: Big Buddha, Wat Chalong & Sce | null (unverified, 0.70) | 0 | 16 | evidence check failed → unverified |
| Catamaran Sunset Cruise in Phuket with Dinner | null (unverified, 0.70) | 0 | 16 | evidence check failed → unverified |
| Flying Hanuman Zipline Experience Family Frie | null (unverified, 0.70) | 7 | 16 | evidence check failed → unverified |
| James Bond Island with Canoeing and Lunch by  | null (unverified, 0.70) | 4 | 16 | evidence check failed → unverified |
| Khao Lak Zipline Adventure at Sky Rock | null (unverified, 0.70) | 5 | 16 | evidence check failed → unverified |
| Muay Thai Boxing Class for Beginners | null (unverified, 0.70) | 6 | 16 | evidence check failed → unverified |
| One Day Experience Cooking at Phuket Patong T | null (unverified, 0.70) | 0 | 16 | evidence check failed → unverified |
| Patong Highlight Elephant Sanctuary with Guid | null (unverified, 0.70) | 0 | 12 | evidence check failed → unverified |
| Phang Nga Bay Sea Cave Canoeing & James Bond  | null (unverified, 0.70) | 4 | 16 | evidence check failed → unverified |
| Phi Phi Maya Bay and Khai Island Snorkeling T | null (unverified, 0.70) | 0 | 16 | evidence check failed → unverified |
| Phuket ATV Riding 30 Minutes | null (textual, 1.00) | 6 | 16 |  |
| Phuket City Highlights: Big Buddha, Wat Chalo | null (unverified, 0.70) | 0 | 16 | evidence check failed → unverified |
| Phuket Elephant Nature Reserve Ethical Sanctu | null (unverified, 0.70) | 0 | 16 | evidence check failed → unverified |
| Phuket Phi Phi Island Tour with Lunch by Spee | null (unverified, 0.70) | 0 | 16 | evidence check failed → unverified |
| Similan Islands Snorkeling Day Tour from Phuk | null (unverified, 0.70) | 5 | 16 | evidence check failed → unverified |
| Simon Cabaret Phuket Night Out with Tickets a | null (unverified, 0.70) | 0 | 18 | evidence check failed → unverified |
| Simon Cabaret: Phuket’s Ladyboy Glamour Show | null (unverified, 0.70) | 0 | 16 | evidence check failed → unverified |
| Sunset Cruise to Koh Hey in Phuket by Sailing | null (unverified, 0.70) | 0 | 16 | evidence check failed → unverified |
| Swedish Aromatic Oil Massage at Award Winning | null (unverified, 0.70) | 0 | 16 | evidence check failed → unverified |
| Twilight Sea Canoe Tour with Sea Cave Kayakin | null (unverified, 0.70) | 5 | 16 | evidence check failed → unverified |

### 3b. partial_participation_ok

| Product | Value | Note | Conf | Evidence |
|---|---|---|---|---|
| Best of Phuket: Big Buddha, Wat Chalong  | true |  | 0.85 | Small-group tour with multiple stops; the activity is observational/cultural in nature, making parti |
| Catamaran Sunset Cruise in Phuket with D | true |  | 0.85 | Cruise is primarily a scenic and social experience. A pregnant person or non-drinker can enjoy the v |
| Flying Hanuman Zipline Experience Family | true |  | 0.60 | Title states 'Family Friendly' implying the venue caters to mixed groups where not everyone may zip. |
| James Bond Island with Canoeing and Lunc | true |  | 0.80 | Tour has distinct stops: sightseeing, canoeing, trekking, lunch, and swimming — each is a separable  |
| Khao Lak Zipline Adventure at Sky Rock | true |  | 0.55 | Description states 'Whether you opt for the full package with a meal or just the thrilling ride' sug |
| Muay Thai Boxing Class for Beginners | true |  | 0.70 | Gym-based classes typically allow spectators; no text excludes observers. |
| One Day Experience Cooking at Phuket Pat | true |  | 0.85 | Cooking classes are group-based and typically allow observers to watch, assist lightly, or simply ta |
| Patong Highlight Elephant Sanctuary with | true |  | 0.70 | Activity structured around observation from distance: 'observe from a respectful distance' and 'quie |
| Phang Nga Bay Sea Cave Canoeing & James  | true |  | 0.80 | Tour operates from a 'Big Boat' with multiple stops; the multi-activity nature means passengers can  |
| Phi Phi Maya Bay and Khai Island Snorkel | true |  | 0.90 | Itinerary includes beach time, Thai buffet lunch, sightseeing from the boat at Viking Cave, and Monk |
| Phuket ATV Riding 30 Minutes | true |  | 0.60 | Structured ATV parks typically have a base area where non-participants can wait; description implies |
| Phuket City Highlights: Big Buddha, Wat  | true |  | 0.85 | Multi-stop group tour with transfers; structural nature of the tour allows selective participation a |
| Phuket Elephant Nature Reserve Ethical S | true |  | 0.80 | Description states 'visitors are prohibited from touching, feeding or bathing the elephants' — the e |
| Phuket Phi Phi Island Tour with Lunch by | true |  | 0.90 | Description states 'enjoy swimming or relaxing' and 'ample time for snorkeling, swimming or relaxing |
| Similan Islands Snorkeling Day Tour from | true |  | 0.80 | Day boat tour structure inherently allows passengers to stay on board while others snorkel; common p |
| Simon Cabaret Phuket Night Out with Tick | true |  | 0.95 | A theater show is inherently a spectator activity; partial participation is the full participation m |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | true |  | 0.95 | Structural: theater show format means everyone watches; there is no active participation component t |
| Sunset Cruise to Koh Hey in Phuket by Sa | true |  | 0.90 | Description lists multiple optional activities: 'swimming, snorkeling, sunbathing, or even playing s |
| Swedish Aromatic Oil Massage at Award Wi | false |  | 0.80 | Description refers to 'private treatment room' indicating an individual treatment; no shared or grou |
| Twilight Sea Canoe Tour with Sea Cave Ka | true |  | 0.70 | Description references a 'boat trip' and kayaking is done from the boat at cave stops. This structur |

### 3c. wheelchair_access + confirm_at_booking

| Product | wheelchair | confirm_at_booking | access_constraint | Conf |
|---|---|---|---|---|
| Best of Phuket: Big Buddha, Wat Chalong  | "partial" | true | "terrain" | 0.70 |
| Catamaran Sunset Cruise in Phuket with D | "unknown" | true | none | 0.60 |
| Flying Hanuman Zipline Experience Family | "no" | false | "terrain" | 0.90 |
| James Bond Island with Canoeing and Lunc | "no" | false | "terrain" | 0.85 |
| Khao Lak Zipline Adventure at Sky Rock | "no" | false | "terrain" | 0.85 |
| Muay Thai Boxing Class for Beginners | "no" | false | "venue" | 0.85 |
| One Day Experience Cooking at Phuket Pat | "unknown" | true | none | 0.60 |
| Patong Highlight Elephant Sanctuary with | "no" | false | "terrain" | 0.80 |
| Phang Nga Bay Sea Cave Canoeing & James  | "no" | false | "terrain" | 0.85 |
| Phi Phi Maya Bay and Khai Island Snorkel | "no" | false | "vehicle" | 0.85 |
| Phuket ATV Riding 30 Minutes | "no" | false | "terrain" | 0.90 |
| Phuket City Highlights: Big Buddha, Wat  | "partial" | true | "terrain" | 0.70 |
| Phuket Elephant Nature Reserve Ethical S | "unknown" | true | "terrain" | 0.60 |
| Phuket Phi Phi Island Tour with Lunch by | "no" | false | "vehicle" | 0.85 |
| Similan Islands Snorkeling Day Tour from | "no" | false | "vehicle" | 0.85 |
| Simon Cabaret Phuket Night Out with Tick | "unknown" | true | none | 0.60 |
| Simon Cabaret: Phuket’s Ladyboy Glamour  | "unknown" | true | none | 0.60 |
| Sunset Cruise to Koh Hey in Phuket by Sa | "unknown" | true | none | 0.70 |
| Swedish Aromatic Oil Massage at Award Wi | "unknown" | true | none | 0.70 |
| Twilight Sea Canoe Tour with Sea Cave Ka | "no" | false | "vehicle" | 0.90 |

### 3d. vessel_type + water_exposure

| Product | vessel_type | water_exposure | Basis (vessel) |
|---|---|---|---|
| Best of Phuket: Big Buddha, Wat Chalong & Sce | "none" | "none" | structural |
| Catamaran Sunset Cruise in Phuket with Dinner | "catamaran" | "coastal" | textual |
| Flying Hanuman Zipline Experience Family Frie | "none" | "none" | structural |
| James Bond Island with Canoeing and Lunch by  | "speedboat" | "sheltered_bay" | textual |
| Khao Lak Zipline Adventure at Sky Rock | "none" | "none" | structural |
| Muay Thai Boxing Class for Beginners | "none" | "none" | structural |
| One Day Experience Cooking at Phuket Patong T | "none" | "none" | structural |
| Patong Highlight Elephant Sanctuary with Guid | "none" | "none" | structural |
| Phang Nga Bay Sea Cave Canoeing & James Bond  | "ferry" | "sheltered_bay" | textual |
| Phi Phi Maya Bay and Khai Island Snorkeling T | "speedboat" | "open_sea" | textual |
| Phuket ATV Riding 30 Minutes | "none" | "none" | structural |
| Phuket City Highlights: Big Buddha, Wat Chalo | "none" | "none" | structural |
| Phuket Elephant Nature Reserve Ethical Sanctu | "none" | "none" | structural |
| Phuket Phi Phi Island Tour with Lunch by Spee | "speedboat" | "open_sea" | textual |
| Similan Islands Snorkeling Day Tour from Phuk | "speedboat" | "open_sea" | structural |
| Simon Cabaret Phuket Night Out with Tickets a | "none" | "none" | structural |
| Simon Cabaret: Phuket’s Ladyboy Glamour Show | "none" | "none" | structural |
| Sunset Cruise to Koh Hey in Phuket by Sailing | "catamaran" | "coastal" | textual |
| Swedish Aromatic Oil Massage at Award Winning | "none" | "none" | structural |
| Twilight Sea Canoe Tour with Sea Cave Kayakin | "longtail" | "sheltered_bay" | structural |

### 3e. seasonal_closure

| Product | Value | Conf | Evidence |
|---|---|---|---|
| Phi Phi Maya Bay and Khai Island Snorkeling T | {"months":["June","July","August","September"],"source_note":"Maya Bay, Phi Phi Leh is managed by Mu Ko Phi Phi National Park (DNP Thailand). While not formally closed for the full period, rough Andaman Sea conditions during the SW monsoon (Jun–Sep) typically cause operators to suspend this route. Maya Bay has also been subject to periodic closures for environmental rehabilitation by DNP Thailand."} | 0.75 | Andaman Sea monsoon season makes open-sea speedboat crossings to Phi Phi dangerous Jun–Sep. Maya Bay has historically been closed for environmental re |
| Phuket Phi Phi Island Tour with Lunch by Spee | {"months":["June","July","August","September"],"source_note":"Maya Bay (Phi Phi Leh) has historically been subject to seasonal closure by DNP Thailand for environmental recovery. Operators also commonly suspend or limit Phi Phi speedboat tours during peak monsoon months due to unsafe sea conditions. Confirm current DNP closure status via DNP Thailand official notices."} | 0.70 | Maya Bay was closed 2018–2022 and has since had managed access with possible future closures. Monsoon season (Jun–Sep) creates unsafe speedboat condit |
| Similan Islands Snorkeling Day Tour from Phuk | {"months":["May","June","July","August","September","October"],"source_note":"Description states 'open annually only from October to May'; closure period is approximately mid-May through end of September per DNP Thailand (Mu Ko Similan National Park). October opening date varies by year."} | 0.90 | Description states 'The Similan islands are open annually only from October to May', consistent with DNP Thailand's annual closure of Mu Ko Similan Na |

---

## 4. Real Descriptions Contradicting Fixture-Era Assumptions

Products where extraction on real Viator descriptions found evidence that contradicts or corrects what structural inference alone would have guessed.

| Product | Finding |
|---|---|
| Catamaran Sunset Cruise in Phuket with Dinner | **vessel_type** textual: "catamaran" — fixture would have guessed generically |
| James Bond Island with Canoeing and Lunch by  | **vessel_type** textual: "speedboat" — fixture would have guessed generically |
| James Bond Island with Canoeing and Lunch by  | **mobility** textual: "moderate" — real description provides specific evidence |
| James Bond Island with Canoeing and Lunch by  | **seasickness_risk** textual: "moderate" — vessel type named in real description |
| Muay Thai Boxing Class for Beginners | **mobility** textual: "full" — real description provides specific evidence |
| Phang Nga Bay Sea Cave Canoeing & James Bond  | **vessel_type** textual: "ferry" — fixture would have guessed generically |
| Phi Phi Maya Bay and Khai Island Snorkeling T | **SEASONAL CLOSURE** from real description: {"months":["June","July","August","September"],"source_note":"Maya Bay, Phi Phi  — Andaman Sea monsoon season makes open-sea speedboat crossings to Phi Phi dangero |
| Phi Phi Maya Bay and Khai Island Snorkeling T | **vessel_type** textual: "speedboat" — fixture would have guessed generically |
| Phuket ATV Riding 30 Minutes | **ATV children policy** — real description states children can join; fixture would have assumed higher age floor |
| Phuket Phi Phi Island Tour with Lunch by Spee | **SEASONAL CLOSURE** from real description: {"months":["June","July","August","September"],"source_note":"Maya Bay (Phi Phi  — Maya Bay was closed 2018–2022 and has since had managed access with possible fut |
| Phuket Phi Phi Island Tour with Lunch by Spee | **vessel_type** textual: "speedboat" — fixture would have guessed generically |
| Phuket Phi Phi Island Tour with Lunch by Spee | **partial_participation** textual:  |
| Similan Islands Snorkeling Day Tour from Phuk | **SEASONAL CLOSURE** from real description: {"months":["May","June","July","August","September","October"],"source_note":"De — Description states 'The Similan islands are open annually only from October to M |
| Sunset Cruise to Koh Hey in Phuket by Sailing | **vessel_type** textual: "catamaran" — fixture would have guessed generically |
| Sunset Cruise to Koh Hey in Phuket by Sailing | **partial_participation** textual:  |

### Key Pattern: stated_min_age

All 20 real products returned `stated_min_age: null` (evidence check correctly failed → marked unverified). **This is correct behavior** — none of the Viator descriptions explicitly state a minimum age. The fixture-era v1 ontology used `min_age` with structural inference (guessing ages from activity type). The v2 split into `stated_min_age` (textual-only) + `with_adult_from` + `independent_from` eliminates this class of hallucination entirely. The ranker uses `with_adult_from` and `independent_from` for actual filtering.

---

> **Status:** PENDING REVIEW — Dan reviews, then `pnpm enrich:approve cal-20260819b` + `pnpm enrich:approve cal-20260819c`