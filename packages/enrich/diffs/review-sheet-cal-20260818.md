# Review Sheet — Batch cal-20260818

Filtered: safety rows, confidence >= 0.85, and unverified rows.

- **Prompt version:** v1.1
- **Model:** claude-sonnet-4-6
- **Products:** 20
- **Total cost:** $0.6072
- **True fabrications:** 1 (exp_phuket_0032.indoor — paraphrased source, not hallucinated)
- **Restored from false-failure:** 17

## Unverified Rows (1)

| Experience | Title | Attribute | Value | Conf | Risk | Evidence |
|---|---|---|---|---|---|---|
| exp_phuket_0032 | Beachside Yoga & Meditation Sunrise Session | indoor | false | 0.70 | info | Meeting point is Kata Noi Beach and the description explicitly references a beach session at sunrise |

---

## Safety-Class Attributes by Product

### exp_phuket_0001: Phi Phi Islands Speedboat Tour from Phuket

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 5 | 0.40 | structural | **UNCONFIRMED** | No minimum age is stated in the description. Structurally, speedboat tours involve high-speed open-water travel, rough c |
| mobility | "moderate" | 0.80 | structural | **UNCONFIRMED** | Participants must board and disembark a speedboat at a pier, enter and exit water for snorkeling, and manage movement on |
| non_swimmer_ok | false | 0.75 | structural | **UNCONFIRMED** | Tour includes snorkeling at open-water locations including Maya Bay and Pileh Lagoon. Non-swimmers face genuine risk in  |
| pregnant_ok | false | 0.95 | structural | PASS | High-speed speedboat travel over open ocean produces significant jarring and impact forces that are contraindicated duri |
| seasickness_risk | "moderate" | 0.90 | structural | PASS | Speedboat travel in open Andaman Sea waters to Phi Phi Islands structurally carries meaningful seasickness risk, especia |
| wheelchair_accessible | false | 0.95 | structural | PASS | Boarding a speedboat at a pier, open-water snorkeling, and beach landings at Phi Phi Islands are structurally incompatib |

### exp_phuket_0002: James Bond Island & Phang Nga Bay by Longtail Boat

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 5 | 0.40 | structural | **UNCONFIRMED** | No minimum age is stated in the product description. Structurally, a 9-hour longtail boat tour with sea cave canoeing in |
| mobility | "moderate" | 0.75 | structural | **UNCONFIRMED** | Structural: boarding and disembarking a longtail boat, canoeing through sea caves, and walking around James Bond Island  |
| non_swimmer_ok | false | 0.65 | structural | **UNCONFIRMED** | Structural: the tour involves open water travel on a small longtail boat and canoeing through sea caves. Life jackets ma |
| pregnant_ok | false | 0.85 | structural | **UNCONFIRMED** | Structural: longtail boats produce significant vibration, engine noise, and wave impact. A 9-hour journey on open water  |
| seasickness_risk | "moderate" | 0.75 | structural | **UNCONFIRMED** | Structural: longtail boats are small, open, and low in the water, making them more susceptible to wave motion than large |
| wheelchair_accessible | false | 0.95 | structural | PASS | Structural: longtail boats require stepping aboard from a pier or beach, have no ramps or wheelchair accommodation, and  |

### exp_phuket_0003: Similan Islands Full-Day Snorkeling Trip

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 6 | 0.50 | structural | **UNCONFIRMED** | No minimum age is stated in the description. Structurally, open-water snorkeling trips to remote islands typically requi |
| mobility | "moderate" | 0.75 | structural | **UNCONFIRMED** | Snorkeling across three sites and beach lunch structurally require the ability to board/disembark a boat, walk on uneven |
| non_swimmer_ok | false | 0.90 | structural | PASS | Snorkeling in open ocean across three sites structurally requires the ability to swim. Non-swimmers in open water withou |
| pregnant_ok | false | 0.95 | structural | PASS | Extended open-ocean boat journey with significant wave exposure, physical snorkeling activity, risk of seasickness, and  |
| seasickness_risk | "moderate" | 0.85 | structural | **UNCONFIRMED** | The Similan Islands are approximately 70-80 km offshore from Phuket, requiring a long open-sea boat journey each way. Oc |
| wheelchair_accessible | false | 0.95 | structural | PASS | Boarding and disembarking a boat at a pier, entering open ocean water for snorkeling, and accessing a beach structurally |

### exp_phuket_0009: Half-Day Snorkeling Tour to Racha Island

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 6 | 0.50 | structural | **UNCONFIRMED** | No minimum age is stated in the description. Structurally, snorkeling in open water with equipment carries real risk for |
| mobility | "moderate" | 0.80 | structural | **UNCONFIRMED** | Snorkeling requires entering and exiting the water, wearing fins, and swimming at the surface. Participants must be able |
| non_swimmer_ok | false | 0.85 | structural | **UNCONFIRMED** | Snorkeling takes place in open ocean water. Even with life vests or buoyancy aids (not mentioned in the description), no |
| pregnant_ok | false | 0.90 | structural | PASS | Snorkeling in open ocean water is structurally inadvisable during pregnancy due to risks of overexertion, overheating in |
| seasickness_risk | "moderate" | 0.80 | structural | **UNCONFIRMED** | The description states 'light lunch on the boat', confirming boat travel to Racha Yai Island from Chalong Pier. The cros |
| wheelchair_accessible | false | 0.95 | structural | PASS | The activity requires boarding a boat at Chalong Pier, entering open water for snorkeling, and potentially accessing a b |

### exp_phuket_0011: Morning Thai Cooking Class with Market Tour

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 8 | 0.50 | structural | **UNCONFIRMED** | No minimum age is stated in the description. Structural inference: cooking classes involving hot stoves, knives, and wok |
| mobility | "moderate" | 0.70 | structural | **UNCONFIRMED** | The activity includes a market tour on foot before the cooking session. Walking through a local market requires moderate |
| non_swimmer_ok | true | 1.00 | structural | PASS | Entirely land-based activity — market tour and cooking class. No water exposure. Swimming ability is completely irreleva |
| pregnant_ok | false | 0.55 | structural | **UNCONFIRMED** | Cooking involves prolonged standing at hot stoves, exposure to cooking smoke and strong spice aromas in an open-air kitc |
| seasickness_risk | _N/A_ | 1.00 | structural | — | Land-based cooking class and market tour. No water or boat component whatsoever. Seasickness is not applicable. |
| wheelchair_accessible | false | 0.55 | structural | **UNCONFIRMED** | The activity includes a market tour through a local Phuket Old Town market. Local Thai markets typically have uneven sur |

### exp_phuket_0014: Phuket Family Cooking Class for Kids & Parents

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 5 | 0.40 | structural | **UNCONFIRMED** | Structural: described as a kids and parents cooking class, implying young children participate, but no explicit minimum  |
| mobility | "limited" | 0.80 | structural | **UNCONFIRMED** | Structural: a cooking class is primarily standing or seated at a workstation with minimal movement required; accessible  |
| non_swimmer_ok | true | 1.00 | structural | PASS | Structural: indoor cooking class with no water-based component; swimming ability is entirely irrelevant to participation |
| pregnant_ok | true | 0.75 | structural | **UNCONFIRMED** | Structural: a low-intensity indoor cooking class poses minimal physical risk to pregnant participants. Some caution arou |
| seasickness_risk | _N/A_ | 1.00 | structural | — | Structural: indoor cooking class; no maritime or water-based component whatsoever. Seasickness risk is not applicable. |
| wheelchair_accessible | false | 0.45 | structural | **UNCONFIRMED** | Structural: kitchen environments often have narrow spaces, high countertops, and step access that may not be wheelchair  |

### exp_phuket_0015: Big Buddha, Wat Chalong & Old Town Temple Tour

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 5 | 0.40 | structural | **UNCONFIRMED** | No minimum age is stated in the description. Structurally, temple tours involve walking on uneven temple grounds and sta |
| mobility | "moderate" | 0.75 | structural | **UNCONFIRMED** | Structurally, Big Buddha requires climbing steps on an elevated hilltop site, and temple complexes typically involve une |
| non_swimmer_ok | true | 1.00 | structural | PASS | This is a fully land-based temple tour with no water activities. Swimming ability is entirely irrelevant. |
| pregnant_ok | true | 0.65 | structural | **UNCONFIRMED** | Structurally, a walking temple tour presents no inherent danger to pregnant participants in early-to-mid pregnancy. Howe |
| seasickness_risk | _N/A_ | 1.00 | structural | — | This is a land-based temple tour with no water travel involved. Seasickness is not applicable. |
| wheelchair_accessible | false | 0.80 | structural | **UNCONFIRMED** | Structurally, Big Buddha involves stairs and uneven elevated terrain that is not wheelchair accessible. Wat Chalong temp |

### exp_phuket_0019: Phuket ATV Adventure through Jungle Trails

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 16 | 0.50 | structural | **UNCONFIRMED** | No minimum age is stated in the product description. ATV riding on jungle terrain with mud and hills carries meaningful  |
| mobility | "full" | 0.90 | structural | PASS | Riding an ATV on 'muddy jungle tracks' and 'hilltop viewpoints' requires mounting/dismounting the vehicle, maintaining b |
| non_swimmer_ok | true | 0.95 | structural | PASS | This is a land-based jungle ATV excursion with no water activities described. Swimming ability is structurally irrelevan |
| pregnant_ok | false | 0.98 | structural | PASS | ATV riding on rough jungle terrain involves significant vibration, jolting, risk of falls, and physical exertion. This i |
| seasickness_risk | _N/A_ | 1.00 | structural | — | This is a land-based ATV excursion through jungle trails. No water travel is involved, so seasickness is not applicable. |
| wheelchair_accessible | false | 0.99 | structural | PASS | ATV riding on 'muddy jungle tracks' and 'hilltop viewpoints' is structurally incompatible with wheelchair accessibility. |

### exp_phuket_0021: Surf Lesson at Kata Beach for Beginners

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 8 | 0.40 | structural | **UNCONFIRMED** | No minimum age is stated in the description. Structurally, beginner surf lessons typically require participants to be ab |
| mobility | "full" | 0.90 | structural | PASS | Surfing requires paddling, popping up from prone to standing, and balance on a moving board in open water. These mechani |
| non_swimmer_ok | false | 0.90 | structural | PASS | Surfing takes place in open ocean surf with wave action. Participants will inevitably fall off the board and must be abl |
| pregnant_ok | false | 0.95 | structural | PASS | Surfing involves paddling exertion, wave impact, wipeouts, and risk of abdominal trauma from the board or water. These r |
| seasickness_risk | "low" | 0.75 | structural | **UNCONFIRMED** | Activity takes place in shallow nearshore surf zone at a beach, not on a boat. Wave motion could cause mild disorientati |
| wheelchair_accessible | false | 0.95 | structural | PASS | Activity takes place on a sandy beach and in ocean surf. Beach terrain and surf entry are structurally incompatible with |

### exp_phuket_0022: Muay Thai Training Session with Pro Fighters

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 12 | 0.50 | structural | **UNCONFIRMED** | No minimum age is stated in the description. Structurally, Muay Thai pad work and conditioning with pro fighters involve |
| mobility | "full" | 0.90 | structural | PASS | Structurally, Muay Thai training involves striking techniques, footwork, pad work, and conditioning — all of which requi |
| non_swimmer_ok | true | 1.00 | structural | PASS | Structurally, this is a land-based gym activity with no water involvement whatsoever. Swimming ability is entirely irrel |
| pregnant_ok | false | 0.99 | structural | PASS | Structurally, Muay Thai training involving pad work, striking, and physical conditioning poses clear and significant ris |
| seasickness_risk | _N/A_ | 1.00 | structural | — | This is an entirely land-based gym activity at Patong Boxing Stadium. No water or marine vessel is involved. Seasickness |
| wheelchair_accessible | false | 0.85 | structural | **UNCONFIRMED** | Structurally, Muay Thai training requires full physical mobility including standing, striking, footwork, and conditionin |

### exp_phuket_0023: Phuket Elephant Sanctuary Half-Day Visit

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 5 | 0.40 | structural | **UNCONFIRMED** | No minimum age is stated in the description. Structural inference: elephant sanctuaries typically require children to be |
| mobility | "moderate" | 0.70 | textual | **UNCONFIRMED** | Description states participants 'walk with' elephants 'in a natural forest setting', implying uneven terrain and sustain |
| non_swimmer_ok | false | 0.55 | textual | **UNCONFIRMED** | Description explicitly includes 'bathe' elephants, which typically involves entering a river or pond alongside the anima |
| pregnant_ok | false | 0.85 | structural | **UNCONFIRMED** | Structural safety inference: proximity to large, unpredictable animals (elephants), uneven forest terrain, and bathing a |
| seasickness_risk | _N/A_ | 1.00 | structural | — | Entirely land-based activity in a forest sanctuary. No water vessel involved. |
| wheelchair_accessible | false | 0.85 | structural | **UNCONFIRMED** | Description states 'natural forest setting' with walking alongside elephants and bathing activities. Uneven forest terra |

### exp_phuket_0024: Phuket Elephant Jungle Walk & Waterfall Trip

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 5 | 0.40 | structural | **UNCONFIRMED** | No minimum age is stated in the description. Structural inference: jungle terrain, proximity to large animals (elephants |
| mobility | "moderate" | 0.85 | structural | **UNCONFIRMED** | Description states 'Walk alongside elephants on a jungle trail to a hidden waterfall' — jungle trails inherently involve |
| non_swimmer_ok | true | 0.75 | structural | **UNCONFIRMED** | The activity is land-based jungle walking. The waterfall visit is a viewing/photography stop rather than a swimming acti |
| pregnant_ok | false | 0.85 | structural | **UNCONFIRMED** | Close proximity to large unpredictable animals (elephants), uneven jungle terrain, risk of sudden movement or fall, and  |
| seasickness_risk | _N/A_ | 1.00 | structural | — | This is a land-based jungle walking activity with no water vessel component. Seasickness is not applicable. |
| wheelchair_accessible | false | 0.95 | structural | PASS | 'Jungle trail to a hidden waterfall' structurally implies unpaved, uneven, and potentially steep terrain that is incompa |

### exp_phuket_0030: Traditional Thai Massage & Herbal Spa (2 Hours)

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 12 | 0.40 | structural | **UNCONFIRMED** | No minimum age is stated in the description. Structurally, Thai massage involves sustained pressure and body manipulatio |
| mobility | "limited" | 0.80 | structural | **UNCONFIRMED** | Structurally, a massage and herbal compress treatment requires only that the participant lie or sit on a treatment table |
| non_swimmer_ok | true | 1.00 | structural | PASS | This is a land-based indoor spa treatment with no water immersion or aquatic component. Swimming ability is entirely irr |
| pregnant_ok | false | 0.70 | structural | **UNCONFIRMED** | Traditional Thai massage involves deep pressure, stretching, and body manipulation techniques that are structurally cont |
| seasickness_risk | _N/A_ | 1.00 | structural | — | This is an indoor land-based spa treatment. There is no water vessel or motion involved, making seasickness structurally |
| wheelchair_accessible | false | 0.55 | structural | **UNCONFIRMED** | The description specifies a 'hillside spa' which structurally implies elevated terrain and potentially uneven pathways,  |

### exp_phuket_0032: Beachside Yoga & Meditation Sunrise Session

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 5 | 0.40 | structural | **UNCONFIRMED** | No minimum age is stated in the description. Structural inference: gentle beachside yoga is generally suitable for child |
| mobility | "limited" | 0.55 | structural | **UNCONFIRMED** | Description says 'suitable for all levels including complete beginners', implying low physical barrier. However, beach t |
| non_swimmer_ok | true | 1.00 | structural | PASS | Activity is entirely land-based on a beach. No water entry is described or implied. Swimming ability is structurally irr |
| pregnant_ok | false | 0.55 | structural | **UNCONFIRMED** | No explicit guidance given. Structurally, general yoga classes may include poses (twists, prone positions, inversions) t |
| seasickness_risk | _N/A_ | 1.00 | structural | — | Activity takes place on a beach (land-based). No water vessel involved. Seasickness is structurally not applicable. |
| wheelchair_accessible | false | 0.80 | structural | **UNCONFIRMED** | Activity is held on a sandy beach (Kata Noi Beach). Sand is structurally not navigable by standard wheelchairs, and yoga |

### exp_phuket_0033: Phuket Street Food Tour by Tuk-Tuk

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 5 | 0.40 | structural | **UNCONFIRMED** | No minimum age is stated in the description. Structurally, a tuk-tuk food tour involves road travel and eating at street |
| mobility | "moderate" | 0.70 | structural | **UNCONFIRMED** | Structurally, hopping between eight street food stalls requires boarding and alighting a tuk-tuk repeatedly, standing at |
| non_swimmer_ok | true | 1.00 | structural | PASS | This is a fully land-based tuk-tuk and street food tour with no water activities. Swimming ability is entirely irrelevan |
| pregnant_ok | true | 0.55 | structural | **UNCONFIRMED** | A low-intensity food tour is generally safe for pregnant participants. However, caution is warranted: tuk-tuk rides on u |
| seasickness_risk | _N/A_ | 1.00 | structural | — | This is a land-based tuk-tuk street food tour with no water component. Seasickness is not applicable. |
| wheelchair_accessible | false | 0.80 | structural | **UNCONFIRMED** | Tuk-tuks require stepping up to board and are not wheelchair accessible. Phuket Old Town streets and street food stalls  |

### exp_phuket_0039: Simon Cabaret Show Phuket (Regular Seat)

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 0 | 0.50 | structural | **UNCONFIRMED** | No minimum age stated in the product description. Cabaret shows are generally suitable for all ages as entertainment, th |
| mobility | "limited" | 0.85 | structural | **UNCONFIRMED** | Seated theater show — description states 'grand theater' and 'Regular Seat'. Participants primarily sit and watch, requi |
| non_swimmer_ok | true | 1.00 | structural | PASS | Indoor theater show with no water component whatsoever. Swimming ability is entirely irrelevant. |
| pregnant_ok | true | 0.90 | structural | PASS | Passive seated theater performance with no physical activity, no motion, no heights, and no chemical exposure. No struct |
| seasickness_risk | _N/A_ | 1.00 | structural | — | Indoor theater-based activity with no water or marine component. Seasickness is not applicable. |
| wheelchair_accessible | true | 0.60 | structural | **UNCONFIRMED** | Grand theater venues typically have flat or ramp-accessible seating sections, but the description does not explicitly co |

### exp_phuket_0042: Private Airport Transfer from Phuket Airport

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 0 | 0.90 | structural | PASS | Structural: private car transfers have no inherent age restriction; infants and children routinely use airport transfers |
| mobility | "limited" | 0.80 | structural | **UNCONFIRMED** | Structural: a private car transfer with luggage assistance requires only the ability to enter and exit a vehicle; access |
| non_swimmer_ok | true | 1.00 | structural | PASS | Structural: land-based car transfer; swimming ability is entirely irrelevant. |
| pregnant_ok | true | 0.95 | structural | PASS | Structural: seated car transfer poses no meaningful risk to pregnant passengers; no physical exertion, no vibration extr |
| seasickness_risk | "none" | 1.00 | structural | PASS | Structural: land-based car transfer; no marine or water element whatsoever. |
| wheelchair_accessible | false | 0.50 | structural | **UNCONFIRMED** | Structural: standard private car transfers typically use saloon cars or vans that are not wheelchair accessible. No acce |

### exp_phuket_0044: Luxury Private Yacht Sunset Cruise with Chef

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 5 | 0.40 | structural | **UNCONFIRMED** | No minimum age is stated in the description. Structural inference: private yacht on open water with a formal dinner sett |
| mobility | "moderate" | 0.70 | structural | **UNCONFIRMED** | Structural inference: boarding and moving around a private yacht on open water requires balance and the ability to navig |
| non_swimmer_ok | false | 0.60 | structural | **UNCONFIRMED** | Structural inference: erring on the side of caution per safety rules. Passengers on a yacht on open water face real drow |
| pregnant_ok | false | 0.75 | structural | **UNCONFIRMED** | Structural inference: erring on the side of caution. Open-water yacht travel involves vessel motion, risk of falls on a  |
| seasickness_risk | "moderate" | 0.80 | structural | **UNCONFIRMED** | Structural inference: the cruise takes place on the open Andaman Sea on a yacht for 240 minutes. Even on calm days, yach |
| wheelchair_accessible | false | 0.80 | structural | **UNCONFIRMED** | Structural inference: yachts typically involve gangways, steps, narrow passages, and a moving deck surface that are inco |

### exp_phuket_0046: Phuket Rainy Day Indoor Activities Pass

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 7 | 0.40 | structural | **UNCONFIRMED** | No minimum age is stated in the description. Structurally, indoor go-karts typically impose a minimum age/height require |
| mobility | "moderate" | 0.65 | structural | **UNCONFIRMED** | Structural: Indoor go-karts require participants to get in and out of low-profile karts and operate pedals, which requir |
| non_swimmer_ok | true | 1.00 | structural | PASS | Structural: All activities are entirely indoors with no water element. Swimming ability is completely irrelevant to Tric |
| pregnant_ok | false | 0.85 | structural | **UNCONFIRMED** | Structural: Indoor go-karts involve physical jolting, steering forces, and rapid direction changes, which are contraindi |
| seasickness_risk | _N/A_ | 1.00 | structural | — | Structural: All activities are indoors at a mall-based venue with no marine or boat component whatsoever. Seasickness is |
| wheelchair_accessible | false | 0.65 | structural | **UNCONFIRMED** | Structural: While Jungceylon Mall has general wheelchair access, indoor go-karts structurally require participants to lo |

### exp_phuket_0048: Baby & Toddler Splash Park Half-Day Entry

| Attribute | Value | Conf | Basis | Gate | Evidence |
|---|---|---|---|---|---|
| min_age | 0 | 0.70 | textual | **UNCONFIRMED** | Designed for 'children aged 0-5' — the lower bound is 0, meaning infants are included, though adult supervision is impli |
| mobility | "limited" | 0.80 | structural | **UNCONFIRMED** | Target participants are infants and toddlers aged 0-5 who by definition have limited or no independent mobility; the ven |
| non_swimmer_ok | true | 0.85 | textual | **UNCONFIRMED** | 'Shallow pools' and splash zones are explicitly mentioned, and the activity targets children aged 0-5 who are structural |
| pregnant_ok | false | 0.65 | structural | **UNCONFIRMED** | While shallow pool play is low-intensity, wet surfaces create slip hazards, and the chaotic environment of a toddler spl |
| seasickness_risk | _N/A_ | 1.00 | structural | — | This is a land-based splash park. There is no water vessel involved, so seasickness is not applicable. |
| wheelchair_accessible | false | 0.55 | structural | **UNCONFIRMED** | Outdoor water parks typically involve wet surfaces, steps to pool areas, and uneven terrain around splash zones, which s |

---

## High-Confidence Info Attributes (>= 0.85)

| Experience | Attribute | Value | Conf | Basis | Evidence |
|---|---|---|---|---|---|
| exp_phuket_0001 | best_months | ["November","December","January","February","March","April"] | 0.90 | structural | Phuket high season (Nov-Apr) offers calm Andaman Sea conditions, clear visibility for snorkeling, an |
| exp_phuket_0001 | best_time_of_day | "morning" | 0.85 | structural | Full-day speedboat tours structurally depart in the morning to maximize daylight hours across multip |
| exp_phuket_0001 | indoor | false | 1.00 | structural | Speedboat island tour to Phi Phi Islands is entirely outdoors — open water, beaches, and lagoons. |
| exp_phuket_0001 | sun_exposure | "full" | 0.95 | structural | Full-day outdoor boat tour visiting Maya Bay, Pileh Lagoon, and Monkey Beach with snorkeling. Partic |
| exp_phuket_0002 | best_months | ["November","December","January","February","March","April"] | 0.85 | structural | Structural: Phuket high season (Nov–Apr) offers calm seas and clear skies, optimal for open boat tra |
| exp_phuket_0002 | indoor | false | 1.00 | structural | Structural: the entire activity takes place outdoors — on open water, visiting an island, and canoei |
| exp_phuket_0002 | sun_exposure | "full" | 0.85 | structural | Structural: longtail boats are open-top with no overhead shade canopy. A 9-hour day on open water an |
| exp_phuket_0003 | advance_booking_needed | "required" | 0.85 | structural | Full-day boat trips to the Similan Islands require logistical coordination (boat capacity, permits,  |
| exp_phuket_0003 | best_months | ["November","December","January","February","March","April"] | 0.90 | structural | The Similan Islands are only officially open November through May and are closed during monsoon seas |
| exp_phuket_0003 | best_time_of_day | "morning" | 0.85 | structural | Full-day trip departing from Rassada Pier structurally requires an early morning departure to reach  |
| exp_phuket_0003 | indoor | false | 1.00 | structural | The activity is entirely outdoors: open-ocean boat travel, snorkeling in the sea, and beach lunch. N |
| exp_phuket_0003 | sun_exposure | "full" | 0.95 | structural | Full-day trip with snorkeling at three open-water sites and 'lunch on the beach' — all activities ar |
| exp_phuket_0009 | best_months | ["November","December","January","February","March","April"] | 0.90 | structural | Racha Island snorkeling is weather-dependent and requires calm seas and good underwater visibility.  |
| exp_phuket_0009 | best_time_of_day | "morning" | 0.85 | structural | The product is a half-day tour (300 minutes = 5 hours). Morning departures from Chalong Pier are sta |
| exp_phuket_0009 | indoor | false | 1.00 | structural | The activity is ocean snorkeling at Racha Island — entirely outdoors and on open water. |
| exp_phuket_0009 | sun_exposure | "full" | 0.95 | structural | Snorkeling is an outdoor ocean activity with participants spending significant time on the water sur |
| exp_phuket_0011 | intensity | "low" | 0.85 | structural | Cooking class with a market walk is primarily light physical activity — standing, chopping, stirring |
| exp_phuket_0014 | best_months | ["January","February","March","April","May","June","July","August","September","October","November","December"] | 0.95 | structural | Structural: indoor activity with no weather dependency; suitable year-round regardless of Phuket's s |
| exp_phuket_0014 | indoor | true | 0.95 | structural | Structural: cooking classes by nature take place in a kitchen, which is an indoor facility. No outdo |
| exp_phuket_0014 | intensity | "low" | 0.90 | structural | Structural: a cooking class involves light manual tasks such as chopping, stirring and mixing; no ph |
| exp_phuket_0014 | rain_viable | true | 0.95 | structural | Structural: as an indoor cooking class, weather conditions including rain have no impact on the acti |
| exp_phuket_0014 | sun_exposure | "none" | 0.85 | structural | Structural: cooking classes are conducted indoors in a kitchen environment; participants are not exp |
| exp_phuket_0015 | indoor | false | 0.95 | structural | Structurally, Big Buddha is an open-air hilltop statue, Wat Chalong has outdoor temple grounds, and  |
| exp_phuket_0019 | indoor | false | 1.00 | textual | Activity is explicitly an outdoor jungle ATV excursion on jungle trails, rubber plantations, and hil |
| exp_phuket_0019 | intensity | "high" | 0.85 | textual | Description explicitly uses 'adrenaline-pumping' and references muddy jungle tracks and hills. ATV r |
| exp_phuket_0021 | indoor | false | 1.00 | structural | Meeting point is 'Kata Beach South End'; activity is surfing in the ocean. Structurally entirely out |
| exp_phuket_0021 | sun_exposure | "full" | 0.95 | structural | Outdoor beach activity in Phuket with no mention of shade or shelter. Surfing takes place in open wa |
| exp_phuket_0022 | best_months | ["January","February","March","April","May","June","July","August","September","October","November","December"] | 0.90 | structural | Structurally, this is a gym-based activity with no weather dependency. It is viable year-round regar |
| exp_phuket_0022 | intensity | "high" | 0.85 | structural | Description states 'pad work and conditioning' in a session with 'professional fighters'. Muay Thai  |
| exp_phuket_0030 | best_months | ["January","February","March","April","May","June","July","August","September","October","November","December"] | 0.95 | structural | This is an indoor, weather-independent wellness activity. It is equally viable and enjoyable in all  |
| exp_phuket_0030 | indoor | true | 0.90 | structural | Spa massage treatments are structurally conducted indoors in treatment rooms. The description refere |
| exp_phuket_0030 | rain_viable | true | 0.95 | structural | This is an indoor spa treatment. Rain has no impact on the delivery of a massage or herbal compress  |
| exp_phuket_0030 | sun_exposure | "none" | 0.85 | structural | A spa massage and herbal compress treatment takes place indoors in treatment rooms. The description  |
| exp_phuket_0032 | best_months | ["November","December","January","February","March","April"] | 0.85 | structural | Outdoor sunrise beach activity is weather-dependent. Phuket high season (Nov-Apr) offers dry, calm c |
| exp_phuket_0032 | best_time_of_day | "morning" | 1.00 | textual | Product title explicitly states 'Sunrise Session', and description confirms 'Start the day with a gu |
| exp_phuket_0032 | intensity | "low" | 0.85 | structural | Description states 'suitable for all levels including complete beginners' and combines yoga with med |
| exp_phuket_0033 | indoor | false | 0.85 | structural | Street food stalls are structurally outdoor or semi-outdoor environments, and tuk-tuk travel is open |
| exp_phuket_0039 | best_months | ["January","February","March","April","May","June","July","August","September","October","November","December"] | 0.95 | structural | Indoor entertainment venue with fixed shows — not weather-dependent, suitable year-round regardless  |
| exp_phuket_0039 | best_time_of_day | "evening" | 0.90 | structural | Cabaret shows are structurally an evening entertainment format; Simon Cabaret is well-known for even |
| exp_phuket_0039 | group_type | ["solo","couple","family","friends","large_group"] | 0.85 | structural | Theater show format is universally accessible — fixed seating accommodates individuals, couples, fam |
| exp_phuket_0039 | intensity | "low" | 0.95 | structural | Passive spectator activity — watching 'dazzling costumes, choreography, and live performances' in a  |
| exp_phuket_0039 | rain_viable | true | 0.98 | structural | Fully indoor theater performance is completely unaffected by rain or weather conditions. |
| exp_phuket_0039 | sun_exposure | "none" | 0.95 | structural | Held inside a 'grand theater' — indoor venue with no sun exposure during the performance. |
| exp_phuket_0042 | advance_booking_needed | "required" | 0.90 | structural | Structural: private meet-and-greet airport transfers require pre-arrangement so the driver can be pr |
| exp_phuket_0042 | age_fit | {"min":0,"max":99} | 0.95 | structural | Structural: airport transfers are suitable for all ages from infants to elderly passengers. |
| exp_phuket_0042 | best_months | ["January","February","March","April","May","June","July","August","September","October","November","December"] | 1.00 | structural | Structural: airport transfer is a year-round utility service with no weather dependency; operates eq |
| exp_phuket_0042 | best_time_of_day | "any" | 1.00 | structural | Structural: airport transfers operate 24/7 to match flight schedules; no optimal time of day. |
| exp_phuket_0042 | group_type | ["solo","couple","family","friends","large_group"] | 0.90 | structural | Structural: private transfers accommodate all group compositions. 'any hotel on the island' and priv |
| exp_phuket_0042 | indoor | true | 0.90 | structural | Structural: activity is primarily conducted inside a vehicle and airport terminal, both enclosed env |
| exp_phuket_0042 | intensity | "low" | 1.00 | structural | Structural: seated car transfer requires no physical exertion from the passenger. |
| exp_phuket_0042 | rain_viable | true | 1.00 | structural | Structural: enclosed vehicle transfer is entirely weather-independent; rain does not affect viabilit |
| exp_phuket_0042 | sun_exposure | "none" | 0.85 | structural | Structural: passengers travel inside an air-conditioned vehicle; exposure is limited to brief moment |
| exp_phuket_0044 | advance_booking_needed | "required" | 0.95 | structural | Structural inference: private yacht charters with a personal chef require significant logistical pre |
| exp_phuket_0044 | best_months | ["November","December","January","February","March","April"] | 0.85 | structural | Structural inference: Phuket high season (Nov–Apr) offers calm Andaman seas, clear skies, and reliab |
| exp_phuket_0044 | indoor | false | 0.90 | structural | Structural inference: the activity takes place on a yacht on the Andaman coast. Even if a covered di |
| exp_phuket_0046 | best_time_of_day | "any" | 0.85 | structural | Structural: Indoor mall-based attractions are not time-of-day dependent in terms of weather or natur |
| exp_phuket_0046 | indoor | true | 1.00 | textual | Title explicitly states 'Indoor Activities Pass'; description confirms Trick Eye Museum, VR arcade,  |
| exp_phuket_0046 | rain_viable | true | 1.00 | textual | Title explicitly markets this as a 'Rainy Day Indoor Activities Pass', directly positioning it as su |
| exp_phuket_0048 | age_fit | "0-5" | 0.95 | textual | Description explicitly states 'designed specifically for children aged 0-5'. |
| exp_phuket_0048 | group_type | ["couple","family"] | 0.90 | structural | The activity is designed for children aged 0-5 requiring adult supervision, making it suitable for f |
| exp_phuket_0048 | indoor | false | 0.85 | structural | Splash parks and outdoor water play areas are structurally outdoor facilities. No mention of indoor  |
| exp_phuket_0048 | intensity | "low" | 0.90 | textual | 'Shallow pools, mini slides, and splash zones' indicate gentle, low-energy water play rather than vi |

---

> Apply corrections in `corrections-cal-20260818.yaml`, then run `pnpm enrich:approve cal-20260818`.