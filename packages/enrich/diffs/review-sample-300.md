# Review Sample — backfill-300-20260820

## Summary

- **Products:** 300
- **Total cost:** $12.76 vs $11.57 estimate
- **Calibration cost:** $0.0425/item
- **Tokens:** 326346 in / 785317 out

---
## 1. Safety Attributes Passing Gate (structural >=0.9)

These are auto-confirmed. Wrong ones are the biggest risk.

| Product | Attribute | Value | Conf | Evidence |
|---|---|---|---|---|
| ️ Phuket Private Instagram Tour: All-Inc | non_swimmer_ok | true | 1.00 | Entirely land-based tour. Swimming ability is irrelevant. |
| 2 Day and 1 Night Similan Scuba Trip wit | mobility | "full" | 0.95 | The core activity is scuba diving — entering and exiting water from a vessel, swimming underwater, c |
| 2 Day and 1 Night Similan Scuba Trip wit | seasickness_risk | "high" | 0.90 | The Similan Islands are accessed via open-sea crossing from Phuket (approximately 60–80 km). The pas |
| 2 Day and 1 Night Similan Scuba Trip wit | non_swimmer_ok | false | 0.98 | The core activity is scuba diving in open ocean. While beginner/discover scuba participants need not |
| 2 Day and 1 Night Similan Scuba Trip wit | wheelchair_access | "no" | 0.92 | Scuba diving on a liveaboard vessel in open ocean requires boarding a boat, navigating vessel decks, |
| 2 Day and 1 Night Similan Scuba Trip wit | pregnant_ok | false | 0.99 | Scuba diving is contraindicated during pregnancy due to decompression risk, pressure changes, and ph |
| 2 Day Private Muay Thai Class with Accom | non_swimmer_ok | true | 1.00 | Land-based activity with no water elements that would require swimming ability. Ice baths and herbal |
| 2 Day Private Muay Thai Class with Accom | wheelchair_access | "no" | 0.90 | Muay Thai training requires full-body mobility including standing, kicking, and striking. Even perip |
| 2 Day Private Muay Thai Class with Accom | pregnant_ok | false | 0.99 | Muay Thai training involves striking, physical contact, high-intensity cardiovascular exertion, and  |
| 2 Day Rescue Diver Course | non_swimmer_ok | false | 1.00 | A scuba rescue diver course inherently requires strong swimming ability. PADI Rescue Diver requires  |
| 2 Day Rescue Diver Course | wheelchair_access | "no" | 0.90 | The physical requirements of a PADI Rescue Diver course — entering/exiting water, performing rescue  |
| 2 Day Rescue Diver Course | pregnant_ok | false | 1.00 | Scuba diving during pregnancy is contraindicated by PADI and medical consensus due to decompression  |
| 2 Days 1 Night Surin Islands Snorkeling  | pregnant_ok | false | 0.90 | Open-sea crossing on a speedboat (significant wave impact), snorkeling in open water, and overnight  |
| 2 Days Khao Sok trip with Overnight at C | wheelchair_access | "no" | 0.92 | The activity involves jungle trekking on uneven terrain, longtail boat boarding, cave exploration, b |
| 2D1N Similan Islands Snorkeling Liveaboa | wheelchair_access | "no" | 0.90 | Liveaboard vessel boarding, movement on a rocking deck, snorkel-site water entries, beach landings,  |
| 2D1N Similan Islands Snorkeling Liveaboa | pregnant_ok | false | 0.90 | Open-sea liveaboard crossing (70–80 km offshore), sustained vessel motion over two days, snorkeling  |
| 3 Day Phuket to Khao Sok National Park T | wheelchair_access | "no" | 0.90 | Activity involves jungle trekking on uneven forest terrain, cave exploration, and boat boarding on l |
| 3-Day EFR and Rescue Package | mobility | "full" | 0.95 | The course includes open-water rescue scenarios, rescue swimming, CPR practice, and AED use. Partici |
| 3-Day EFR and Rescue Package | non_swimmer_ok | false | 1.00 | PADI Rescue Diver requires prior certification (Adventure Diver or equivalent) which itself requires |
| 3-Day EFR and Rescue Package | wheelchair_access | "no" | 0.90 | The course requires swimming, open-water diving, rescue swimming, and performing CPR on the ground o |
| 3-Day EFR and Rescue Package | pregnant_ok | false | 1.00 | Scuba diving is contraindicated during pregnancy due to decompression risk to the fetus. PADI guidel |
| 3-Day PADI Open Water Diver Course | mobility | "full" | 0.95 | Scuba diving requires swimming competency, donning heavy equipment, entering and exiting water, and  |
| 3-Day PADI Open Water Diver Course | non_swimmer_ok | false | 1.00 | PADI Open Water Diver certification requires proof of swimming ability (200m unaided swim or 300m wi |
| 3-Day PADI Open Water Diver Course | wheelchair_access | "no" | 0.90 | Scuba diving requires swimming, donning heavy equipment, and water entry/exit — activities that are  |
| 3-Day PADI Open Water Diver Course | pregnant_ok | false | 1.00 | Scuba diving is contraindicated during pregnancy by all major diving medical authorities (DAN, PADI, |
| 3-Hour Private Treatment and Massage Spa | mobility | "limited" | 0.90 | Spa massage and treatment packages are entirely sedentary/reclined experiences. A wheelchair user or |
| 3-Hour Private Treatment and Massage Spa | non_swimmer_ok | true | 1.00 | Land-based spa activity; swimming ability is completely irrelevant. |
| 4 Days Yoga and Wellness Retreat with Da | non_swimmer_ok | true | 0.95 | No water-based activity is described. The retreat is land-based at a hilltop resort. Swimming abilit |
| 5 Hours Private Reiki Class with License | mobility | "limited" | 0.90 | Reiki is a seated/lying-down healing practice conducted at a dedicated center. No walking, climbing, |
| 5 Hours Private Reiki Class with License | non_swimmer_ok | true | 1.00 | No water involvement whatsoever. Swimming ability is irrelevant. |
| A Couple’s Journey in a Thai Temple – Pr | non_swimmer_ok | true | 1.00 | Fully land-based temple tour. Swimming ability is irrelevant. |
| All Inclusive Zipline and Local Floating | seasickness_risk | "none" | 0.90 | Activity is primarily land-based (zipline, farm visit). Kayaking is in a mangrove forest — sheltered |
| All Inclusive Zipline and Local Floating | wheelchair_access | "no" | 0.90 | Zipline requires climbing launch platforms and physical harnessing; mangrove kayaking requires trans |
| All Inclusive Zipline and Local Floating | pregnant_ok | false | 0.95 | Zipline is contraindicated during pregnancy due to harness pressure on the abdomen, impact forces, a |
| Amazing Tarzan Adventure in Phuket | mobility | "full" | 0.95 | Description references 'conquer the jungles' and 'see the tops of the trees', and title says 'Tarzan |
| Amazing Tarzan Adventure in Phuket | non_swimmer_ok | true | 0.95 | Land-based jungle activity with no water component — swimming ability is irrelevant. |
| Amazing Tarzan Adventure in Phuket | wheelchair_access | "no" | 0.95 | Jungle canopy/Tarzan adventure requires climbing, swinging, and traversing elevated rope courses. Wh |
| Amazing Tarzan Adventure in Phuket | pregnant_ok | false | 0.95 | Tarzan/jungle canopy adventure involves physical exertion, harness use, swinging, and heights — all  |
| Arrival Private Transfers from Phuket Ai | mobility | "limited" | 0.90 | Activity is a seated vehicle transfer. Description states 'guests are only permitted to ride in the  |
| Arrival Private Transfers from Phuket Ai | non_swimmer_ok | true | 1.00 | Land-based road transfer — swimming ability is entirely irrelevant. |
| Arrival Private Transfers from Phuket Ai | pregnant_ok | true | 0.95 | Seated private car transfer poses no physical risk to pregnant passengers. Description emphasises co |
| ATV Bike 1 hr + ziplines 30 platforms wi | non_swimmer_ok | true | 1.00 | Fully land-based activity. Swimming ability is irrelevant. |
| ATV Bike 1 hr + ziplines 30 platforms wi | pregnant_ok | false | 0.98 | ATV riding involves vibration, jolting, and physical control demands. Ziplines involve harness press |
| Bamboo Rafting and Eco Delight Story PRI | wheelchair_access | "no" | 0.90 | Activity traverses 'virgin Rainforest, Mangroves, Beach forest, Swamp Forest and Savanna' with bambo |
| Blue Elephant Phuket Thai Cooking Master | non_swimmer_ok | true | 1.00 | Land-based activity with no water involvement whatsoever. |
| Blue Elephant Thai Cooking Class with Ad | non_swimmer_ok | true | 1.00 | Land-based cooking class with no water activities. Swimming ability is irrelevant. |
| Blue Elephant Thai Cooking Class with Ma | non_swimmer_ok | true | 1.00 | Land-based cooking class and market tour — swimming ability is entirely irrelevant. |
| Carnival Magic Night Experience | non_swimmer_ok | true | 1.00 | Land-based entertainment event. Swimming ability is completely irrelevant. |
| Country Side Cycling and treking to the  | non_swimmer_ok | true | 0.95 | Activity is cycling and jungle trekking to a waterfall — no swimming or water immersion is described |
| Country Side Cycling and treking to the  | wheelchair_access | "no" | 0.97 | Activity requires cycling and jungle trekking on natural terrain including a waterfall trail inside  |
| Country Side Cycling and treking to the  | pregnant_ok | false | 0.90 | 6-hour cycling and jungle trekking on uneven terrain involves physical exertion, fall risk, and roug |
| Couples Spa Retreat in Phuket | mobility | "limited" | 0.90 | All treatments — body scrub, body wrap, aromatherapy oil massage, facial, floral foot bath — are per |
| Couples Spa Retreat in Phuket | non_swimmer_ok | true | 1.00 | Land-based indoor spa; swimming ability is entirely irrelevant. |
| Day in the Islands from Phuket by John G | pregnant_ok | false | 0.90 | Sea kayaking involves physical exertion, potential capsize risk, and the need to maneuver into/out o |
| Departure Private Transfers from Phuket  | mobility | "limited" | 0.90 | Seated vehicle transfer throughout; description notes driver assists with luggage and opens/closes d |
| Departure Private Transfers from Phuket  | non_swimmer_ok | true | 1.00 | Land-based road transfer; swimming ability is completely irrelevant. |
| Departure Private Transfers from Phuket  | pregnant_ok | true | 0.95 | Seated private car transfer poses no exertion or impact risk; suitable for pregnant passengers. Desc |
| Elephant Sanctuary Small Group Tour in P | non_swimmer_ok | true | 1.00 | Entirely land-based activity. Swimming ability is irrelevant. |
| Exclusive Dinner at Banana Beach Koh Hey | non_swimmer_ok | true | 0.90 | The activity is a beach dinner — there is no swimming component mentioned. Non-swimmers can fully pa |
| Explore Khao Sok: Jungle Safari in Thail | wheelchair_access | "no" | 0.95 | Jungle trekking on rainforest terrain and canoeing are incompatible with wheelchair use. Description |
| Explore Khao Sok: Jungle Safari in Thail | pregnant_ok | false | 0.90 | Jungle trekking on uneven terrain, canoeing, and a long 11-hour transfer day are not recommended for |
| Family Walking Private Tour of Phuket: H | non_swimmer_ok | true | 1.00 | Land-based walking tour with no water involvement. Swimming ability is irrelevant. |
| Fast Track Phuket Airport | pregnant_ok | true | 0.95 | Airport escort/assistance service involves no physical risk, exertion, or environmental hazard. A VI |
| Flying Hanuman 42 platforms with ATV Adv | non_swimmer_ok | true | 1.00 | No water activities present. Swimming ability is entirely irrelevant to ATV riding and zipline. |
| Flying Hanuman 42 platforms with ATV Adv | wheelchair_access | "no" | 0.95 | ATV riding requires mounting and operating an off-road vehicle on uneven terrain. Zipline requires w |
| Flying Hanuman 42 platforms with ATV Adv | pregnant_ok | false | 0.98 | ATV riding involves vibration, jolting on uneven terrain, and physical exertion. Zipline involves ha |
| Flying Hanuman Zipline | non_swimmer_ok | true | 1.00 | Entirely land-based activity; swimming ability is irrelevant. |
| Flying Hanuman Zipline | pregnant_ok | false | 0.98 | Zipline, abseiling, and treetop adventure with harness use, heights, physical exertion, and potentia |
| Flying Hanuman Ziplines 42 platforms wit | non_swimmer_ok | true | 1.00 | Land-based activity with no water components. Swimming ability is irrelevant. |
| Flying Hanuman Ziplines 42 platforms wit | pregnant_ok | false | 0.98 | Zipline, abseiling, and sky bridge activities involve harness compression on the abdomen, heights, p |
| Flying Hanuman Ziplining Experience in P | non_swimmer_ok | true | 1.00 | Entirely land-based activity. Swimming ability is irrelevant. |
| Flying Hanuman Ziplining Experience in P | wheelchair_access | "no" | 0.95 | Jungle terrain with 'wilderness walk' over uneven natural ground, zipline platforms, and harness-bas |
| Flying Hanuman Ziplining Experience in P | pregnant_ok | false | 0.97 | High-wire ziplining with harness pressure across the abdomen, adrenaline-inducing heights, physical  |
| Full Day Private Shore Tour in Phuket fr | non_swimmer_ok | true | 0.95 | Land-based sightseeing tour. No swimming or water entry required. Beach visit at Nai Harn is observa |
| Full-Day Phuket Elephant Sanctuary Tour  | non_swimmer_ok | true | 1.00 | Fully land-based activity. Swimming ability is irrelevant. |
| Full-Day Private Phi Phi Islands Speedbo | pregnant_ok | false | 0.90 | Speedboat travel over open Andaman Sea produces significant impact, jolting, and motion. This is gen |
| Golf Day adventure in PHANG-NGA Thailand | non_swimmer_ok | true | 1.00 | Land-based golf activity. Swimming ability is irrelevant. |
| Golf Day Adventure in Phuket | non_swimmer_ok | true | 1.00 | Land-based activity; swimming ability is irrelevant. |
| Golf package 21 Days South Thailand Pass | mobility | "full" | 0.90 | Playing 11 rounds of golf over 21 days requires sustained walking over uneven terrain (fairways, hil |
| Golf Package 3 Days Blue Canyon Country  | non_swimmer_ok | true | 1.00 | Land-based activity; swimming ability is irrelevant. |
| Golf package 3 Days Katathong Golf Resor | non_swimmer_ok | true | 1.00 | Land-based golf activity. Swimming ability is irrelevant. |
| GOLF PACKAGE 3 DAYS Loch Palm and Red Mo | mobility | "full" | 0.90 | Golf over 3 days on outdoor courses requires sustained walking across uneven terrain (fairways, roug |
| GOLF PACKAGE 3 DAYS Loch Palm and Red Mo | non_swimmer_ok | true | 1.00 | Land-based golf activity. Swimming ability is irrelevant. |
| Golf Package 3 Days Mission Hills and Sp | non_swimmer_ok | true | 1.00 | Land-based golf activity; swimming ability is irrelevant. |
| Golf Package 5 Days in South Thailand | non_swimmer_ok | true | 1.00 | Golf is a purely land-based activity; swimming ability is irrelevant. |
| GOLF PACKAGE 7 DAYS South Thailand | non_swimmer_ok | true | 1.00 | No water activity involved; swimming ability is irrelevant. |
| Golf package 7 days South Thailand Explo | non_swimmer_ok | true | 1.00 | Land-based golf activity; swimming ability is irrelevant. |
| Guided FH1 Zipline Adventure at Hanuman  | non_swimmer_ok | true | 1.00 | No water immersion or aquatic elements present in this land-based activity. |
| Guided FH1 Zipline Adventure at Hanuman  | pregnant_ok | false | 0.97 | Harness-based zipline and abseiling are contraindicated during pregnancy due to compression harness  |
| Guided Phuket Cultural Sightseeing Tour  | non_swimmer_ok | true | 1.00 | Entirely land-based cultural sightseeing tour. No water activities described. |
| Half day 6 island Adventure Phuket Jetsk | mobility | "full" | 0.95 | Riding a jetski requires the ability to mount/dismount the vessel, maintain a seated or crouching po |
| Half day 6 island Adventure Phuket Jetsk | wheelchair_access | "no" | 0.95 | Mounting and riding a jetski requires the ability to stand, straddle, and balance on a personal wate |
| Half day 6 island Adventure Phuket Jetsk | pregnant_ok | false | 0.98 | Jetski riding involves high-impact wave strikes, sudden acceleration, and physical exertion. These a |
| Hanuman World 32 platforms + Skywalk+ Ro | non_swimmer_ok | true | 1.00 | Land-based activity with no water involvement. Swimming ability is irrelevant. |
| Hanuman World 32 platforms + Skywalk+ Ro | wheelchair_access | "no" | 0.95 | Activity involves '3 Spiral stairways', ziplines, abseiling, sky bridges, and a wilderness walk — no |
| Hanuman World 32 platforms + Skywalk+ Ro | pregnant_ok | false | 0.95 | Ziplining, abseiling, and treetop adventure courses are contraindicated during pregnancy due to harn |
| Honeymoon with Phuket Best photography S | non_swimmer_ok | true | 1.00 | Land-based photography tour; swimming is not required or involved. |
| James Bond and Phi Phi Islands Private B | pregnant_ok | false | 0.90 | High-speed speedboat travel over open sea to Phi Phi Islands involves significant wave impact and vi |
| James Bond Island Escape – Longtail Boat | non_swimmer_ok | true | 0.90 | Tour is a sightseeing boat trip with no swimming or snorkeling activities mentioned. Passengers rema |
| Jet Ski 7 Island Yona Beach Club Party 3 | mobility | "full" | 0.90 | Jet ski operation ('Jet Ski explore 7 Island') requires physical strength and balance. The package a |
| Jet Ski 7 Island Yona Beach Club Party 3 | wheelchair_access | "no" | 0.90 | Jet ski operation requires mounting and controlling a personal watercraft in open water — physically |
| Jet Ski 7 Island Yona Beach Club Party 3 | pregnant_ok | false | 0.95 | Jet ski riding involves high-speed water travel with significant impact forces, vibration, and fall  |
| John Gray’s Private Hong by Starlight To | wheelchair_access | "no" | 0.90 | Sea kayaking through tidal cave systems with low ceilings requires the ability to transfer into a ka |
| Khao Sok National Park Jungle Safari Ful | wheelchair_access | "no" | 0.95 | Jungle trekking on unpaved rainforest terrain, canoeing, and a waterfall trek are fundamentally inco |
| Khao Sok National Park Jungle Safari Ful | pregnant_ok | false | 0.90 | Jungle trekking over uneven terrain, canoeing with capsize risk, and an 11-hour day in a remote nati |
| Khao Sok National Park Safari Full Day T | wheelchair_access | "no" | 0.90 | Jungle trekking on rainforest terrain and canoeing are fundamentally incompatible with wheelchair us |
| Liveaboard Snorkeling Similan 2 Days 1 N | wheelchair_access | "no" | 0.90 | Liveaboard vessel boarding, speedboat transfer, water entry for snorkeling, and beach access on unin |
| Liveaboard Snorkeling Similan 2 Days 1 N | pregnant_ok | false | 0.95 | Open-sea liveaboard snorkeling involves high seasickness risk, physical water entry, speedboat cross |
| Longtail Boat 3 Different Islands Koh Ho | wheelchair_access | "no" | 0.90 | Longtail boat boarding requires stepping over the hull in shallow surf or from a pier with no gangwa |
| Luxury Chauffeured Van Charter - Phuket | mobility | "limited" | 0.90 | The core experience is seated transport in a van with door-to-door service. A wheelchair user or per |
| Luxury Chauffeured Van Charter - Phuket | non_swimmer_ok | true | 1.00 | Land-based transport activity; swimming ability is entirely irrelevant. |
| Luxury Chauffeured Van Charter - Phuket | pregnant_ok | true | 0.95 | Seated, climate-controlled van transport with no physical exertion, vibration, impact, or risk facto |
| My Phuket Private Sightseeing Tour | non_swimmer_ok | true | 1.00 | Land-based sightseeing tour. Swimming ability is irrelevant. |
| Nature Camp for Young Children in Cherng | non_swimmer_ok | true | 1.00 | No water activities involved. Land-based camp with farm animals, baking, yoga, and gardening. |
| Open water scuba certifiication course w | mobility | "full" | 0.95 | Open Water scuba certification involves swimming, donning heavy equipment, entering the water, and c |
| Open water scuba certifiication course w | non_swimmer_ok | false | 1.00 | Scuba certification universally requires swimming competency. Open Water courses require a swim test |
| Open water scuba certifiication course w | wheelchair_access | "no" | 0.95 | Open Water scuba certification requires beach entry, carrying heavy equipment, swimming, and underwa |
| Open water scuba certifiication course w | pregnant_ok | false | 1.00 | Scuba diving is contraindicated during pregnancy due to decompression sickness risk to the fetus, pr |
| Oppan Southern Style - Foot Fantasy at S | non_swimmer_ok | true | 1.00 | No water activity involved. Swimming ability is entirely irrelevant. |
| Oppan Southern Style - Foot Fantasy at S | pregnant_ok | true | 0.92 | Seated indoor dinner and cultural performance. No physical exertion, no jarring movements, no water, |
| PADI Advanced Open Water Course (5 Dives | mobility | "full" | 0.95 | PADI Advanced Open Water involves 5 open-water scuba dives including navigation, buoyancy control, a |
| PADI Advanced Open Water Course (5 Dives | non_swimmer_ok | false | 1.00 | PADI Advanced Open Water requires prior Open Water certification, which itself requires demonstrated |
| PADI Advanced Open Water Course (5 Dives | wheelchair_access | "no" | 0.95 | Scuba diving requires boarding dive boats, wearing heavy equipment, entering water (often giant stri |
| PADI Advanced Open Water Course (5 Dives | pregnant_ok | false | 1.00 | Scuba diving is contraindicated during pregnancy per PADI, DAN (Divers Alert Network), and standard  |
| PADI Dive Divemaster | non_swimmer_ok | false | 1.00 | PADI Divemaster is a professional scuba diving certification. Strong swimming ability is a mandatory |
| PADI Dive Divemaster | wheelchair_access | "no" | 0.95 | PADI Divemaster requires full physical mobility including swimming, diving, waterskills exercises, b |
| PADI Dive Divemaster | pregnant_ok | false | 1.00 | Scuba diving is contraindicated during pregnancy due to decompression risks, physical exertion, and  |
| PADI Open Water course (5 Dives.3 Days) | mobility | "full" | 0.95 | PADI Open Water course involves confined water pool/shallow dives and open water boat dives. Student |
| PADI Open Water course (5 Dives.3 Days) | non_swimmer_ok | false | 1.00 | PADI Open Water certification requires a swim test (200m unaided or 300m with mask/fins/snorkel) as  |
| PADI Open Water course (5 Dives.3 Days) | wheelchair_access | "no" | 0.95 | Scuba diving certification requires physical swimming ability, boat boarding, and water entry/exit.  |
| PADI Open Water course (5 Dives.3 Days) | pregnant_ok | false | 1.00 | Scuba diving is contraindicated during pregnancy per all major diving medical authorities (DAN, PADI |
| Phi Phi & Krabi Private Day Tour by VIP  | pregnant_ok | false | 0.90 | Speedboat travel on open sea involves significant vibration, jolting, and impact forces that are con |
| Phi Phi Maya Excusive Yona Floating Part | pregnant_ok | false | 0.90 | The package involves a speedboat crossing to open sea ('cursing Maya Bay'), a floating beach club wi |
| Phi Phi Sunrise Premium Tour | pregnant_ok | false | 0.90 | Speedboat travel in open sea involves significant vibration, impact, and pitch which is contraindica |
| Phuket & Phang Nga Bay Skylines | non_swimmer_ok | true | 0.95 | Aerial flight tour — no water entry or swimming involved. Non-swimmers face no relevant risk. |
| Phuket Adventure Full Day Tour: ATV Ride | non_swimmer_ok | true | 1.00 | No water-based activity components. Swimming ability is irrelevant for ATV, zipline, and sightseeing |
| Phuket Adventure Full Day Tour: ATV Ride | wheelchair_access | "no" | 0.90 | ATV riding and zipline are physically incompatible with wheelchair use. Temple grounds (Wat Chalong) |
| Phuket Adventure Full Day Tour: ATV Ride | pregnant_ok | false | 0.95 | Description states 'Jack up the adrenaline with an ATV ride and zipline adventure in nature'. ATV ri |
| Phuket Airport (HKT) / Phuket Hotel to K | non_swimmer_ok | true | 1.00 | Land-based road transfer. Swimming ability is entirely irrelevant. |
| Phuket Airport (HKT) / Phuket Hotel to K | pregnant_ok | true | 0.90 | Seated road transfer poses no specific risk to pregnant passengers beyond normal road travel. Long j |
| Phuket Airport to Koh Lanta any hotel Pr | non_swimmer_ok | true | 1.00 | Land-based vehicle transfer — swimming ability is completely irrelevant. |
| Phuket Airport to Koh Lanta any hotel Pr | pregnant_ok | true | 0.90 | Seated air-conditioned private vehicle transfer poses no specific risk to pregnant passengers. Long  |
| Phuket airport to Krabi Private transfer | non_swimmer_ok | true | 1.00 | Land-based transfer; swimming ability is entirely irrelevant. |
| Phuket airport to Krabi Private transfer | pregnant_ok | true | 0.90 | Seated road transfer poses no specific risk to pregnant passengers beyond standard road travel. Jour |
| Phuket Airport to Krabi Private Transfer | non_swimmer_ok | true | 1.00 | Land-based transfer — swimming ability is irrelevant. |
| Phuket Airport to Krabi Private Transfer | pregnant_ok | true | 0.90 | Seated road transfer poses no meaningful risk to pregnant passengers beyond general road travel cons |
| Phuket Airport Transfers : Phuket Airpor | mobility | "limited" | 0.90 | Core experience is seated transport in a van. Passengers sit in the back seat for the entire journey |
| Phuket Airport Transfers : Phuket Airpor | non_swimmer_ok | true | 1.00 | Land-based transfer — swimming ability is completely irrelevant. |
| Phuket Airport Transfers : Phuket Airpor | pregnant_ok | true | 0.95 | Seated van transfer with no physical exertion, no jarring activity, and no water exposure. Suitable  |
| Phuket Airport Transfers : Phuket City t | non_swimmer_ok | true | 1.00 | No water involvement; swimming ability irrelevant for a road transfer. |
| Phuket Airport Transfers : Phuket City t | pregnant_ok | true | 0.95 | Seated van transfer with no physical exertion, sudden movements, or safety risks specific to pregnan |
| Phuket any hotel to Koh lanta Private tr | non_swimmer_ok | true | 1.00 | Road transfer — swimming ability is entirely irrelevant. |
| Phuket Authentic Thai Cooking Class with | non_swimmer_ok | true | 1.00 | No water activity involved. Swimming ability is irrelevant. |
| Phuket Beach Plane Spotting and Monkey C | non_swimmer_ok | true | 0.95 | No swimming or water entry activity described. Beach visits are for photography and plane spotting o |
| Phuket Best Sightseeing with Photogenic  | non_swimmer_ok | true | 1.00 | Fully land-based walking photography tour. Swimming ability is irrelevant. |
| Phuket Best Sightseeing with Photographe | non_swimmer_ok | true | 1.00 | No water involvement — swimming ability is irrelevant. |
| Phuket Best Sightseeing with Photographe | non_swimmer_ok | true | 1.00 | No water component; swimming ability is irrelevant. |
| Phuket Blue Horizon Jet Ski Excursion | mobility | "full" | 0.95 | Operating a jet ski requires sustained physical exertion — gripping handlebars, balancing, absorbing |
| Phuket Blue Horizon Jet Ski Excursion | wheelchair_access | "no" | 0.95 | Jet ski operation requires standing/straddling a moving watercraft on open sea. This is physically i |
| Phuket Blue Horizon Jet Ski Excursion | pregnant_ok | false | 0.95 | Jet skiing on open sea involves high-impact vibration, sudden acceleration, wave impacts, and risk o |
| PHUKET City Tour 8 Hours by TAXI: Car Wi | non_swimmer_ok | true | 1.00 | Entirely land-based activity. Swimming ability is irrelevant. |
| Phuket city tour Heritage and Culture Sh | non_swimmer_ok | true | 1.00 | Land-based city tour with no water activities — swimming ability is entirely irrelevant. |
| Phuket city tour Heritage and Culture Sh | pregnant_ok | true | 0.90 | Gentle walking city tour with no physical risk, no water exposure, no extreme activity. Dining and s |
| Phuket Countryside and Heritage Tour | non_swimmer_ok | true | 1.00 | No water activity is involved. Swimming ability is irrelevant for this land-based cultural tour. |
| Phuket Cruise Port Shore Excursion – Pri | non_swimmer_ok | true | 1.00 | Land-based sightseeing tour; no swimming or water entry involved. |
| Phuket Discovery Day: Temples Market Vie | non_swimmer_ok | true | 1.00 | Fully land-based activity. Swimming ability is irrelevant. |
| Phuket Enchanting Cabaret Night Experien | non_swimmer_ok | true | 1.00 | No water activity involved. Swimming ability is entirely irrelevant. |
| Phuket Enchanting Cabaret Night Experien | pregnant_ok | true | 0.90 | Activity involves seated dinner and a cabaret show with a short optional walk. No physical risk fact |
| Phuket Faith and Flavor Cultural Shore E | non_swimmer_ok | true | 1.00 | No water activity involved. Swimming ability is irrelevant. |
| Phuket Giant Water Lilies & Temple Priva | non_swimmer_ok | true | 1.00 | Land-based temple and garden tour; no swimming or water entry involved. |
| Phuket Half Day Tour | non_swimmer_ok | true | 1.00 | Fully land-based activity. Swimming ability is irrelevant. |
| Phuket Hanuman World Zipline Adventure | non_swimmer_ok | true | 1.00 | Land-based activity with no water exposure. Swimming ability is irrelevant. |
| Phuket Hanuman World Zipline Adventure | wheelchair_access | "no" | 0.95 | Zipline platforms, sky bridges, abseil points, and jungle roller coaster require climbing, standing, |
| Phuket Hanuman World Zipline Adventure | pregnant_ok | false | 0.97 | High-speed ziplines, abseil points, jungle roller coaster, and sky bridges involve harness compressi |
| Phuket Helicopter Scenic Flight: Route 1 | non_swimmer_ok | true | 1.00 | Aerial helicopter flight — no water entry or water proximity risk for passengers. Swimming ability i |
| Phuket Heritage & Countryside Tour: Temp | non_swimmer_ok | true | 1.00 | Entirely land-based activity. Swimming ability is irrelevant. |
| Phuket Highlights Tour: Old Town Wat Cha | non_swimmer_ok | true | 1.00 | Entirely land-based activity. Swimming ability is irrelevant. |
| Phuket Highlights Tour: Old Town Wat Cha | non_swimmer_ok | true | 1.00 | Entirely land-based tour; swimming ability is irrelevant. |
| Phuket Jet Ski 7 Islands and Elephant Ca | mobility | "full" | 0.90 | Jet ski riding is the core headline activity requiring the participant to mount, balance, and contro |
| Phuket Jet Ski 7 Islands and Elephant Ca | wheelchair_access | "no" | 0.95 | Jet ski riding requires mounting a personal watercraft from the water or a dock, physical balance an |
| Phuket Jet Ski 7 Islands and Elephant Ca | pregnant_ok | false | 0.95 | Jet skiing involves high-impact wave collisions, sudden acceleration, and physical exertion. These a |
| Phuket Jet Ski Adventure Yamaha 1200VC 6 | mobility | "full" | 0.95 | Jet skiing requires the ability to mount/dismount a watercraft in open water, maintain balance at sp |
| Phuket Jet Ski Adventure Yamaha 1200VC 6 | wheelchair_access | "no" | 0.95 | Jet skiing requires mounting and dismounting a personal watercraft in open water, gripping handlebar |
| Phuket Jet Ski Adventure Yamaha 1200VC 6 | pregnant_ok | false | 0.98 | High-speed jet skiing on open sea involves repeated wave impact, vibration, jolting, and fall risk — |
| Phuket Jet Ski Island Hopping Tour by Ex | mobility | "full" | 0.95 | Riding a jet ski requires the operator to straddle the vessel, grip handlebars, absorb wave impact t |
| Phuket Jet Ski Island Hopping Tour by Ex | non_swimmer_ok | false | 0.90 | Jet ski riding in open sea between islands carries inherent capsize and fall risk. The description m |
| Phuket Jet Ski Island Hopping Tour by Ex | wheelchair_access | "no" | 0.95 | Jet ski riding requires mounting a watercraft, straddling it, and controlling it at speed. This is p |
| Phuket Jet Ski Island Hopping Tour by Ex | pregnant_ok | false | 0.98 | Jet ski riding involves high-impact wave jolts, speed, potential falls into open water, and sustaine |
| Phuket Jet Ski Island Tour 2 Hours of Th | mobility | "full" | 0.90 | Operating a jet ski requires sustained physical engagement — gripping the handlebars, balancing at s |
| Phuket Jet Ski Island Tour 2 Hours of Th | wheelchair_access | "no" | 0.95 | Jet ski operation requires mounting a personal watercraft, balance at speed, and dismounting at five |
| Phuket Jet Ski Island Tour 2 Hours of Th | pregnant_ok | false | 0.95 | Jet skiing involves high-impact vibration, sudden jolts, potential falls into open water, and sustai |
| Phuket Landmark Air Journey — Big Buddha | non_swimmer_ok | true | 0.95 | Aerial sightseeing flight involves no water contact. Swimming ability is irrelevant to participation |
| Phuket Nightlife Thrills in Bangla Road  | non_swimmer_ok | true | 1.00 | Land-based nightlife activity. Swimming ability is completely irrelevant. |
| Phuket Panorama: Private, Peaks, Prayers | non_swimmer_ok | true | 1.00 | No water activities of any kind are involved in this land-based tour. |
| Phuket Photography Tours | non_swimmer_ok | true | 1.00 | No water involvement; swimming ability is irrelevant to a street photography walking tour. |
| Phuket Private Adventure Quest: Khao Phr | non_swimmer_ok | true | 0.95 | Land-based jungle trek with no swimming or water crossing mentioned. Waterfall is referenced as a sc |
| Phuket Private Adventure Quest: Khao Phr | pregnant_ok | false | 0.95 | Description: 'challenging terrains', 'test of determination', 6-hour high-intensity jungle trek. Sus |
| Phuket Private City Tour – Shore Excursi | non_swimmer_ok | true | 1.00 | Land-based sightseeing tour. Beach visits are observational; no swimming activity described. |
| Phuket Private Full Day City Tour & Hot  | non_swimmer_ok | true | 1.00 | No swimming or open water activity. Hot springs are soaking pools, not open water. Non-swimmers face |
| Phuket Private Local Guide Customized Si | non_swimmer_ok | true | 1.00 | Land-based sightseeing tour with no swimming or water activities involved. |
| Phuket Rum Distillery Cocktail Workshop  | non_swimmer_ok | true | 1.00 | Entirely land-based activity. Swimming ability is irrelevant. |
| Phuket to Phang Nga 4 Island Jet Ski Tou | mobility | "full" | 0.90 | Riding a jet ski requires core strength, balance, grip, and the ability to mount/dismount from a wat |
| Phuket to Phang Nga 4 Island Jet Ski Tou | wheelchair_access | "no" | 0.95 | Jet ski riding requires straddling a motorised watercraft, mounting from water or a dock, and mainta |
| Phuket to Phang Nga 4 Island Jet Ski Tou | pregnant_ok | false | 0.95 | Jet skiing involves high-impact jarring motion, speed, potential falls into water, and vibration — a |
| Phuket Walking Private Tour with Big Bud | non_swimmer_ok | true | 1.00 | Entirely land-based walking tour; swimming ability is irrelevant. |
| Phuket: PADI Open Water Course 3 Days wi | mobility | "full" | 0.95 | PADI Open Water scuba diving requires sustained swimming, donning/doffing equipment, and underwater  |
| Phuket: PADI Open Water Course 3 Days wi | non_swimmer_ok | false | 1.00 | PADI Open Water certification requires swimming ability — candidates must complete a 200m swim and 1 |
| Phuket: PADI Open Water Course 3 Days wi | wheelchair_access | "no" | 0.90 | PADI Open Water diving requires full mobility for swimming, donning heavy equipment, boat boarding,  |
| Phuket: PADI Open Water Course 3 Days wi | pregnant_ok | false | 1.00 | Scuba diving is contraindicated during pregnancy due to decompression risks to the foetus. PADI and  |
| Phuket: Paragliding Adventure by TSA Tha | wheelchair_access | "no" | 0.90 | Structural: Paramotor requires a running takeoff and physical harness positioning that is incompatib |
| Phuket: Paragliding Adventure by TSA Tha | pregnant_ok | false | 0.95 | Structural: Paramotor involves a running takeoff, harness pressure on the abdomen, wind forces, and  |
| Phuket’s Sacred Wonders: Half-Day Privat | non_swimmer_ok | true | 1.00 | Land-based temple tour; swimming ability is entirely irrelevant. |
| Phuket’s Treasures: Half-Day Private Exp | non_swimmer_ok | true | 0.95 | Land-based sightseeing tour. Even if a beach is visited, swimming is not a stated component of the a |
| Premium PADI Open Water Course (6 Dives  | mobility | "full" | 0.95 | A PADI Open Water certification course involves carrying scuba equipment, swimming, and diving in op |
| Premium PADI Open Water Course (6 Dives  | non_swimmer_ok | false | 1.00 | PADI Open Water certification requires swimming competency as a prerequisite. Non-swimmers cannot sa |
| Premium PADI Open Water Course (6 Dives  | wheelchair_access | "no" | 0.95 | Scuba diving certification requires swimming, carrying heavy equipment, boat boarding, and water ent |
| Premium PADI Open Water Course (6 Dives  | pregnant_ok | false | 1.00 | Scuba diving is contraindicated during pregnancy due to decompression risks to the fetus. PADI expli |
| Private & All-Inclusive Phuket Zip-line  | non_swimmer_ok | true | 0.97 | No water component in this activity. Swimming ability is irrelevant to zip-lining, abseiling, sky br |
| Private & All-Inclusive Phuket Zip-line  | wheelchair_access | "no" | 0.97 | Zip-lining, abseiling, sky bridge walking, and a jungle rollercoaster on uneven jungle terrain at he |
| Private & All-Inclusive Phuket Zip-line  | pregnant_ok | false | 0.99 | Zip-lining, abseiling, and a jungle rollercoaster involve significant physical impact, harness press |
| Private Airport Arrival Transfer : Airpo | mobility | "limited" | 0.95 | The core activity is sitting in a vehicle from airport to hotel. A wheelchair user or mobility-limit |
| Private Airport Arrival Transfer : Airpo | non_swimmer_ok | true | 1.00 | Land-based transfer — swimming ability is completely irrelevant. |
| Private Airport Arrival Transfer : Airpo | pregnant_ok | true | 0.90 | A seated vehicle transfer poses no meaningful risk to pregnant passengers. No physical exertion, imp |
| Private Airport Arrival Transfer : Airpo | mobility | "limited" | 0.90 | Activity is a seated vehicle transfer; core experience is entirely seated in a private car/van with  |
| Private Airport Arrival Transfer : Airpo | non_swimmer_ok | true | 1.00 | Land-based vehicle transfer; swimming ability is entirely irrelevant. |
| Private Airport Arrival Transfer : Airpo | pregnant_ok | true | 0.90 | Seated road transfer poses no inherent risk to pregnant passengers beyond normal road travel. Descri |
| Private Bamboo Rafting Full-Day Adventur | seasickness_risk | "none" | 0.90 | The activity is river-based bamboo rafting on a calm inland river ('Glide gently down a clear river' |
| Private Bamboo Rafting Full-Day Adventur | wheelchair_access | "no" | 0.90 | Jungle trekking to a waterfall, bamboo river rafting, and temple exploration (Monkey Cave) involve t |
| Private Phi Phi and Bamboo Islands Snork | pregnant_ok | false | 0.90 | High-speed speedboat travel over open sea produces significant vibration and impact forces on rough  |
| Private Phi Phi and Khai Islands Snorkel | pregnant_ok | false | 0.90 | Speedboat travel on open sea involves significant jarring motion, high speed, and impact from waves  |
| Private Phuket Airport Transfer to Hotel | non_swimmer_ok | true | 1.00 | Land-based transfer; swimming ability is entirely irrelevant. |
| Private Phuket Airport Transfer to Hotel | pregnant_ok | true | 0.95 | A seated road transfer in an air-conditioned vehicle poses no specific risk to pregnant passengers.  |
| Private Phuket City Tour ( Best Seller) | non_swimmer_ok | true | 1.00 | Entirely land-based activity; swimming ability irrelevant. |
| Private Phuket City Tour with Licensed G | non_swimmer_ok | true | 1.00 | No water entry involved. Beach visits are scenic/viewpoint stops only. |
| Private Romantic Dinner Experience on th | non_swimmer_ok | true | 1.00 | Seated beachside dining with no water entry or swimming component whatsoever. |
| Private Shuttle Phuket Airport From or T | non_swimmer_ok | true | 1.00 | Land-based road transfer; swimming ability is entirely irrelevant. |
| Private Shuttle Phuket Airport From or T | pregnant_ok | true | 0.90 | A seated private car transfer involves no physical exertion, jolting, or risk factors contraindicate |
| Private Sightseeing & Photographer Tour | non_swimmer_ok | true | 1.00 | Entirely land-based activity; swimming ability is irrelevant. |
| Private Sky Sightseeing Tour in Phuket B | non_swimmer_ok | true | 0.95 | Activity is entirely airborne. Swimming ability is irrelevant to safety in this context. No water im |
| Private Sky Sightseeing Tour in Phuket B | pregnant_ok | false | 0.90 | Ultralight aircraft experience involves vibration, potential turbulence, open-air exposure at altitu |
| Private Speed Boat Charter to Monkey Bea | pregnant_ok | false | 0.90 | Speedboat travel over open sea involves significant wave impact and jarring motion, which is contrai |
| Private sunset Cruise by Catamaran Yacht | non_swimmer_ok | true | 0.90 | Activity is a dinner cruise — no swimming or water entry is described. Guests remain on the vessel t |
| Private Tour - Best of Phuket City in A  | non_swimmer_ok | true | 1.00 | Land-based sightseeing tour. No swimming or water activity component. Beach visit is for sightseeing |
| Private Tour Phi Phi Early Bird Premium  | pregnant_ok | false | 0.90 | High-speed open-sea speedboat travel generates significant impact and vibration, which is contraindi |
| Private Tour: Phuket Highlights by Van a | non_swimmer_ok | true | 1.00 | Entirely land-based sightseeing tour. Swimming is not involved. |
| Private Tour: Phuket Highlights by Van a | pregnant_ok | true | 0.90 | Van-based sightseeing tour with no physical exertion, no water activity, no heights (beyond viewpoin |
| Private Tour: Phuket Old Town and Rang H | non_swimmer_ok | true | 1.00 | Entirely land-based sightseeing tour. Swimming ability is irrelevant. |
| Private Transfer from Phuket to Khao Lak | mobility | "limited" | 0.90 | Private air-conditioned vehicle transfer — entirely seated, door-to-door service. Description mentio |
| Private Transfer from Phuket to Khao Lak | non_swimmer_ok | true | 1.00 | Land-based transfer; swimming ability entirely irrelevant. |
| Private Transfer from Phuket to Khao Lak | pregnant_ok | true | 0.95 | Seated road transfer with no physical exertion, no water activity, no vibration-intensive off-road e |
| Private Vacation Photoshoot with Photogr | non_swimmer_ok | true | 1.00 | No water involvement. Swimming ability is entirely irrelevant to a land-based photoshoot. |
| Private Vacation Photoshoot with Photogr | pregnant_ok | true | 0.95 | A relaxed outdoor photoshoot poses no physical risk to pregnant participants. The description emphas |
| Private VIP Speed Boat to Phi Phi & Bamb | pregnant_ok | false | 0.90 | Open-sea speedboat travel with significant wave impact and jarring motion is contraindicated for pre |
| Private Walking Food Tour In Phuket | non_swimmer_ok | true | 1.00 | Land-based activity. Swimming ability is irrelevant. |
| Ride & Raft: Phuket’s Ultimate ATV & Whi | wheelchair_access | "no" | 0.97 | ATV riding, whitewater rafting, jungle walk on uneven forest terrain, and waterfall swim are all phy |
| Ride & Raft: Phuket’s Ultimate ATV & Whi | pregnant_ok | false | 0.99 | ATV riding involves vibration and impact over rough terrain; whitewater rafting involves physical ex |
| Scenic Phuket Guided Motorbike Adventure | non_swimmer_ok | true | 0.95 | Land-based motorbike tour with visits to beaches and markets. No water entry or swimming activity de |
| Scenic Phuket Guided Motorbike Adventure | wheelchair_access | "no" | 0.95 | Motorbike riding inherently requires the ability to mount, balance on, and dismount a two-wheeled ve |
| Scenic Phuket Guided Motorbike Adventure | pregnant_ok | false | 0.95 | Motorbike riding involves vibration, balance demands, risk of sudden braking or accidents, and expos |
| Scuba Liveaboard 2 Days 1 Night Dive Tri | mobility | "full" | 0.95 | Scuba diving is the headline activity requiring entry and exit from water, swimming, managing heavy  |
| Scuba Liveaboard 2 Days 1 Night Dive Tri | non_swimmer_ok | false | 0.98 | Scuba diving certification requires demonstrated swimming ability. The activity involves 4 dive site |
| Scuba Liveaboard 2 Days 1 Night Dive Tri | wheelchair_access | "no" | 0.90 | Scuba diving liveaboard requires navigating boat decks, dive platforms, water entry/exit, beach terr |
| Scuba Liveaboard 2 Days 1 Night Dive Tri | pregnant_ok | false | 0.99 | Scuba diving is contraindicated during pregnancy due to decompression sickness risk to the fetus. Al |
| Sightseeing with Photogenic session | non_swimmer_ok | true | 1.00 | Entirely land-based activity; swimming ability is irrelevant. |
| South Thailand: See it All in 12 Days, 1 | wheelchair_access | "no" | 0.90 | The itinerary includes rock climbing, cave kayaking, jungle hiking, waterfall swimming, elephant bat |
| South Thailand: See it All in 12 Days, 1 | pregnant_ok | false | 0.95 | The tour includes rock climbing, cave kayaking, elephant bathing, snorkeling, waterfall swimming, ju |
| Spa Package Andaman Sunshine Package and | non_swimmer_ok | true | 1.00 | Fully land-based spa activity. Swimming ability is irrelevant. |
| SSI | Padi Open Water Course in Phuket | mobility | "full" | 0.95 | Open Water scuba certification involves confined water pool/pool-like sessions and open ocean dives  |
| SSI | Padi Open Water Course in Phuket | non_swimmer_ok | false | 0.99 | PADI Open Water Diver certification requires demonstrated swimming ability (200m swim or 300m with m |
| SSI | Padi Open Water Course in Phuket | pregnant_ok | false | 0.99 | Scuba diving is contraindicated during pregnancy due to risks of decompression sickness to the foetu |
| Surin Islands 3 Days 2 Nights Trip from  | pregnant_ok | false | 0.90 | Multi-day open-ocean crossing, snorkeling in open water, remote location with limited medical access |
| Thai Cooking Class And Wat Chalong Templ | non_swimmer_ok | true | 1.00 | No water activity involved. Swimming ability is entirely irrelevant to a cooking class and temple to |
| Thai Private Cooking Class at Amphoe Tha | non_swimmer_ok | true | 1.00 | Land-based cooking class. Swimming ability is entirely irrelevant. |
| Thai Wedding & Beach Vow Ceremony (Phuke | non_swimmer_ok | true | 1.00 | No water entry involved in a temple blessing and beach vow ceremony. |
| Thailand Private Luxury Airport Transfer | mobility | "limited" | 0.90 | Private airport transfer is a seated vehicle ride. Core experience requires no walking beyond boardi |
| Thailand Private Luxury Airport Transfer | non_swimmer_ok | true | 1.00 | Land-based vehicle transfer — swimming ability is entirely irrelevant. |
| Thailand Private Luxury Airport Transfer | pregnant_ok | true | 0.95 | Seated private vehicle transfer poses no specific risk to pregnant passengers. No physical exertion, |
| VIP Private Boat to Phi Phi Island: Snor | pregnant_ok | false | 0.90 | High-speed speedboat travel over open Andaman Sea produces significant impact and vibration, which i |
| VIP table at BOA House Music Club | non_swimmer_ok | true | 1.00 | Land-based nightclub. Swimming ability is irrelevant. |
| Wonderfull Sunrise Samed Nangshe & Phang | non_swimmer_ok | true | 0.90 | Land-based hiking and sightseeing tour with no described swimming or water entry component. |
| Wonderfull Sunrise Samed Nangshe & Phang | wheelchair_access | "no" | 0.90 | Hiking to the Samet Nangshe viewpoint is the core activity. The trail involves uneven terrain and el |

Total: 281 auto-confirmed safety attributes.

---
## 2. Dan-Rule Matches and Conflicts

**448 rule matches**, 48 conflicts.

### Conflicts (Dan-rule overrides extraction)

| Product | Attr | Extracted | Dan-Rule | Note |
|---|---|---|---|---|
| 2 Days 1 Night Surin Islands Snorkeling  | non_swimmer_ok | false | true | Life jackets provided on all Phuket boat tours; snorkeling/swimming always optio |
| 2D1N Similan Islands Snorkeling Liveaboa | non_swimmer_ok | false | true | Life jackets provided on all Phuket boat tours; snorkeling/swimming always optio |
| 2D1N Similan Islands Snorkeling Liveaboa | with_adult_from | 5 | 0 | Thai boat tours routinely take babies with life vests |
| 3-Hour Private Treatment and Massage Spa | pregnant_ok | false | true | Soft oil massage safe; must inform therapist. Deep Thai stretching contraindicat |
| Couples Spa Retreat in Phuket | pregnant_ok | false | true | Soft oil massage safe; must inform therapist. Deep Thai stretching contraindicat |
| Day in the Islands from Phuket by John G | non_swimmer_ok | false | true | Life jackets provided on all Phuket boat tours; snorkeling/swimming always optio |
| Day in the Islands from Phuket by John G | with_adult_from | 5 | 0 | Thai boat tours routinely take babies with life vests |
| Explore Five Islands Koh Hong and Phang  | seasickness_risk | "moderate" | "low" | Sheltered bay, minimal swell except rare northerlies |
| Golf package 3 Days Katathong Golf Resor | mobility | "moderate" | "limited" | Seated/lying throughout — wheelchair transfer to treatment room is the only barr |
| Golf package 3 Days Katathong Golf Resor | pregnant_ok | false | true | Soft oil massage safe; must inform therapist. Deep Thai stretching contraindicat |
| Golf Package 3 Days Mission Hills and Sp | mobility | "moderate" | "limited" | Seated/lying throughout — wheelchair transfer to treatment room is the only barr |
| Golf Package 3 Days Mission Hills and Sp | pregnant_ok | false | true | Soft oil massage safe; must inform therapist. Deep Thai stretching contraindicat |
| Half day 6 island Adventure Phuket Jetsk | non_swimmer_ok | false | true | Life jackets provided on all Phuket boat tours; snorkeling/swimming always optio |
| Half day 6 island Adventure Phuket Jetsk | with_adult_from | 8 | 0 | Thai boat tours routinely take babies with life vests |
| Hype Yacht : VIP tour Krabi Islands & Ph | water_exposure | "open_sea" | "sheltered_bay" | Phang Nga is sheltered bay — only exposed to rare northerly swell |
| Hype Yacht : VIP tour Krabi Islands & Ph | seasickness_risk | "moderate" | "low" | Sheltered bay, minimal swell except rare northerlies |
| Jet Ski 7 Island Yona Beach Club Party 3 | non_swimmer_ok | false | true | Life jackets provided on all Phuket boat tours; snorkeling/swimming always optio |
| Jet Ski 7 Island Yona Beach Club Party 3 | with_adult_from | 8 | 0 | Thai boat tours routinely take babies with life vests |
| Khai Island Private Boat Tour | non_swimmer_ok | false | true | Life jackets provided on all Phuket boat tours; snorkeling/swimming always optio |
| Koh Rok and Koh Ha Private Boat Tour | non_swimmer_ok | false | true | Life jackets provided on all Phuket boat tours; snorkeling/swimming always optio |
| Liveaboard Snorkeling Similan 2 Days 1 N | non_swimmer_ok | false | true | Life jackets provided on all Phuket boat tours; snorkeling/swimming always optio |
| Liveaboard Snorkeling Similan 2 Days 1 N | with_adult_from | 5 | 0 | Thai boat tours routinely take babies with life vests |
| New Power catamaran for Phang Nga and Ph | water_exposure | "open_sea" | "sheltered_bay" | Phang Nga is sheltered bay — only exposed to rare northerly swell |
| New Power catamaran for Phang Nga and Ph | seasickness_risk | "moderate" | "low" | Sheltered bay, minimal swell except rare northerlies |
| Phang Nga Bay Private Speedboat Full-Day | seasickness_risk | "moderate" | "low" | Sheltered bay, minimal swell except rare northerlies |
| Phang Nga Bay Sunset Premium Tour by Spe | seasickness_risk | "moderate" | "low" | Sheltered bay, minimal swell except rare northerlies |
| Phuket & Phang Nga Bay Skylines | water_exposure | "none" | "sheltered_bay" | Phang Nga is sheltered bay — only exposed to rare northerly swell |
| Phuket Coral Island Private Snorkeling A | non_swimmer_ok | false | true | Life jackets provided on all Phuket boat tours; snorkeling/swimming always optio |
| Phuket Jet Ski 7 Islands and Elephant Ca | non_swimmer_ok | false | true | Life jackets provided on all Phuket boat tours; snorkeling/swimming always optio |
| Phuket Jet Ski 7 Islands and Elephant Ca | with_adult_from | 6 | 0 | Thai boat tours routinely take babies with life vests |
| Phuket Jet Ski 7 Islands and Elephant Ca | non_swimmer_ok | false | true | No deep water involvement at ethical sanctuaries |
| Phuket Jet Ski Adventure Yamaha 1200VC 6 | non_swimmer_ok | false | true | Life jackets provided on all Phuket boat tours; snorkeling/swimming always optio |
| Phuket Jet Ski Adventure Yamaha 1200VC 6 | with_adult_from | 8 | 0 | Thai boat tours routinely take babies with life vests |
| Phuket Jet Ski Island Hopping Tour by Ex | non_swimmer_ok | false | true | Life jackets provided on all Phuket boat tours; snorkeling/swimming always optio |
| Phuket Jet Ski Island Hopping Tour by Ex | with_adult_from | 10 | 0 | Thai boat tours routinely take babies with life vests |
| Phuket Jet Ski Island Tour 2 Hours of Th | non_swimmer_ok | false | true | Life jackets provided on all Phuket boat tours; snorkeling/swimming always optio |
| Phuket Landmark Air Journey — Big Buddha | with_adult_from | 2 | 0 | Temples welcome all ages |
| Phuket to Phang Nga 4 Island Jet Ski Tou | non_swimmer_ok | false | true | Life jackets provided on all Phuket boat tours; snorkeling/swimming always optio |
| Phuket to Phang Nga 4 Island Jet Ski Tou | with_adult_from | 6 | 0 | Thai boat tours routinely take babies with life vests |
| Phuket to Phang Nga 4 Island Jet Ski Tou | seasickness_risk | "moderate" | "low" | Sheltered bay, minimal swell except rare northerlies |
| Private Phi Phi and Bamboo Islands Snork | non_swimmer_ok | false | true | Life jackets provided on all Phuket boat tours; snorkeling/swimming always optio |
| Private Sky Sightseeing Tour in Phuket B | with_adult_from | 5 | 0 | Temples welcome all ages |
| Private Tour Phi Phi Early Bird Premium  | non_swimmer_ok | false | true | Life jackets provided on all Phuket boat tours; snorkeling/swimming always optio |
| Private Tour to Phi Phi Sunrise Premium  | non_swimmer_ok | false | true | Life jackets provided on all Phuket boat tours; snorkeling/swimming always optio |
| Private VIP Speed Boat to Phang Nga Bay | seasickness_risk | "moderate" | "low" | Sheltered bay, minimal swell except rare northerlies |
| Spa Package Andaman Sunshine Package and | pregnant_ok | false | true | Soft oil massage safe; must inform therapist. Deep Thai stretching contraindicat |
| Surin Islands 3 Days 2 Nights Trip from  | non_swimmer_ok | false | true | Life jackets provided on all Phuket boat tours; snorkeling/swimming always optio |
| Wonderfull Sunrise Samed Nangshe & Phang | water_exposure | "none" | "sheltered_bay" | Phang Nga is sheltered bay — only exposed to rare northerly swell |

Agreements: 400 (extraction aligned with Dan-rules).

---
## 3. Evidence Failures (non-null values marked unverified)

**16 attributes** marked unverified.

### best_time_of_day (4)

| Product | Value | Conf | Evidence |
|---|---|---|---|
| Phuket Coral Island Private Snorkeling A | "morning" | 0.70 | Pickup at 8:00 AM with arrival at snorkel site by 9:30 AM. Morning departure aligns with calmer seas |
| Phuket Enchanting Cabaret Night Experien | "evening" | 0.70 | Schedule explicitly starts at 4:00 PM and runs through 9:45 PM, centred on an evening cabaret show a |
| Private Charter Thirty Eight | "morning" | 0.70 | Description offers both morning and afternoon options. Morning departure avoids peak heat and aftern |
| Private Speed Boat Charter to Monkey Bea | "morning" | 0.70 | Description states departure around 08:00–09:00, which is the standard early morning departure to ma |

### group_type (3)

| Product | Value | Conf | Evidence |
|---|---|---|---|
| Blue Elephant Phuket Thai Cooking Master | ["solo","couple","family","friends","large_group"] | 0.70 | Description explicitly states 'perfect for families, couples, groups, or solo travelers.' |
| Phi Phi & Bamboo Island Private Speedboa | ["solo","couple","family","friends"] | 0.70 | Description explicitly states 'Ideal for families, couples, or solo adventurers.' Private tour forma |
| Private Speed Boat to Phi Phi Island & K | ["solo","couple","family","friends"] | 0.70 | 'Maximum 8 persons per group - Fully Private, No other join guests on the boat' — the private format |

### indoor (3)

| Product | Value | Conf | Evidence |
|---|---|---|---|
| Hype Yacht : VIP Tour Phi Phi Island & M | false | 0.70 | Open-sea yacht tour with sunbathing, swimming, and snorkeling. Inherently an outdoor activity. |
| Khai Island Private Speedboat Tour | false | 0.70 | Outdoor boat and beach activity visiting three island destinations. No indoor component mentioned. |
| Wonderfull Sunrise Samed Nangshe & Phang | false | 0.70 | Description explicitly references hiking, sunrise viewing, eco nature, and eating local breakfast in |

### vessel_type (2)

| Product | Value | Conf | Evidence |
|---|---|---|---|
| 2 Days Khao Sok trip with Overnight at C | "longtail" | 0.70 | Description explicitly states 'Cruise by longtail boat.' |
| The Elite Similan Islands Yacht Experien | "catamaran" | 0.70 | Description explicitly states 'aboard the elegant Emily Princess Catamaran'. |

### partial_participation_ok (2)

| Product | Value | Conf | Evidence |
|---|---|---|---|
| Exclusive Private Speedboat Adventure Ph | true | 0.70 | Description states guests can 'bask in the sun... or relax on the beach' and the tour visits scenic  |
| Wonderfull Sunrise Samed Nangshe & Phang | false | 0.70 | Hiking is explicitly described as the means to reach the viewpoint; no alternative participation mod |

### intensity (1)

| Product | Value | Conf | Evidence |
|---|---|---|---|
| Orion Charter 3 Engine Private Guided To | "low" | 0.70 | Description emphasizes 'luxury,' 'relaxation,' 'comfort,' and 'personalized service.' The activity i |

### crowding_by_season (1)

| Product | Value | Conf | Evidence |
|---|---|---|---|
| Private Charter Speedboat Phang Nga and  | {"high":"moderate","shoulder":"quiet","low":"empty"} | 0.65 | Private charter means the boat itself won't be crowded, but James Bond Island and Koh Panyee are pop |

---
## 4. Same-Venue Consistency Flags

**41 inconsistencies.**

| Venue | Attr | Values |
|---|---|---|
| coral island private | wheelchair_access | 133093P20="no", 110534P1095="unknown", 110534P290="unknown" |
| coral island private | seasickness_risk | 133093P20="low", 110534P1095="low", 110534P290="moderate" |
| full day private | wheelchair_access | 215192P179="no", 5568998P3="unknown", 320728P2288="no" |
| full day private | pregnant_ok | 215192P179=false, 5568998P3=false, 320728P2288=true |
| golf day adventure | wheelchair_access | 5636312P27="unknown", 5636312P7="no" |
| golf package days | mobility | 5636312P13="moderate", 5636312P15="full", 5636312P18="full", 5636312P26="moderate", 5636312P24="full", 5636312P25="moder |
| golf package days | wheelchair_access | 5636312P13="unknown", 5636312P15="no", 5636312P18="no", 5636312P26="unknown", 5636312P24="no", 5636312P25="no", 5636312P |
| hype yacht vip | wheelchair_access | 72851P9="unknown", 72851P5="no" |
| james bond island | seasickness_risk | 230808P56="moderate", 273038P95="low", 103612P266="low", 133093P2="low" |
| james bond and | seasickness_risk | 215192P136="low", 110534P251="moderate", 215192P135="moderate" |
| khai island private | non_swimmer_ok | 133093P4=false, 215192P133=true |
| khai island private | seasickness_risk | 133093P4="low", 215192P133="moderate" |
| khao sok national | mobility | 473636P1="moderate", 150859P60="full", 102252P77="full" |
| khao sok national | non_swimmer_ok | 473636P1=true, 150859P60=false, 102252P77=false |
| phang nga bay | non_swimmer_ok | 133093P22=false, 85890P10=true, 252217P9=true |
| phang nga bay | seasickness_risk | 133093P22="low", 85890P10="moderate", 252217P9="moderate" |
| phuket phang nga | mobility | 371907P10="limited", 5670520P2="full" |
| phuket phang nga | wheelchair_access | 371907P10="unknown", 5670520P2="no" |
| phuket phang nga | non_swimmer_ok | 371907P10=true, 5670520P2=false |
| phuket phang nga | seasickness_risk | 371907P10="low", 5670520P2="moderate" |
| phuket banana beach | seasickness_risk | 110534P1094="moderate", 5567066P342="low" |
| phuket best sightseeing | wheelchair_access | 192374P51="no", 192374P36="no", 191101P36="partial" |
| phuket city tour | mobility | 224270P24="limited", 110534P1103="moderate" |
| phuket city tour | wheelchair_access | 224270P24="unknown", 110534P1103="partial" |
| phuket giant water | pregnant_ok | 350808P1881=true, 227572P41=false |
| phuket highlights tour | wheelchair_access | 20961P50="unknown", 184434P62="no" |
| phuket private boat | wheelchair_access | 5637117P3="no", 5637117P4="unknown" |
| premium longtail boat | seasickness_risk | 215192P150="moderate", 215192P149="low" |
| private boat tour | wheelchair_access | 133093P6="unknown", 133093P19="no" |
| private james bond | wheelchair_access | 252217P12="no", 44720P28="partial", 44720P32="no", 404093P3="no", 44720P17="no" |
| private james bond | pregnant_ok | 252217P12=false, 44720P28=true, 44720P32=false, 404093P3=false, 44720P17=false |
| private james bond | seasickness_risk | 252217P12="low", 44720P28="low", 44720P32="low", 404093P3="moderate", 44720P17="low" |
| private phang nga | wheelchair_access | 45382P433="no", 423026P2="unknown", 190981P35="no" |
| private phang nga | non_swimmer_ok | 45382P433=false, 423026P2=false, 190981P35=true |
| private phi phi | non_swimmer_ok | 27424P29=true, 404093P1=true, 415911P3=true, 44720P19=false, 44720P14=true, 26842P110=true, 404093P2=true, 210158P52=tru |
| private phuket city | wheelchair_access | 213852P55="unknown", 160694P11="partial" |
| private speed boat | seasickness_risk | 110534P788="moderate", 210158P53="moderate", 192374P61="moderate", 210158P54="moderate", 26842P131="high", 10074P14="mod |
| private tour phi | mobility | 350808P1875="moderate", 26842P107="full", 210158P6="full" |
| private tour phi | non_swimmer_ok | 350808P1875=true, 26842P107=false, 210158P6=false |
| private tour phi | seasickness_risk | 350808P1875="moderate", 26842P107="high", 210158P6="moderate" |
| private tour james | seasickness_risk | 350808P1964="moderate", 33893P12="low" |

---
## 5. Random 20-Product Spot Check

### exp_23230P3: SSI | Padi Open Water Course in Phuket

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 15 | 0.75 | structural | PADI Open Water participants aged 10–14 receive a Junior Open Water certificatio |
| mobility | "full" | 0.95 | structural | Open Water scuba certification involves confined water pool/pool-like sessions a |
| non_swimmer_ok | false | 0.99 | structural | PADI Open Water Diver certification requires demonstrated swimming ability (200m |
| pregnant_ok | false | 0.99 | structural | Scuba diving is contraindicated during pregnancy due to risks of decompression s |
| seasickness_risk | "moderate" | 0.75 | structural | PADI Open Water certification requires ocean dives typically conducted from a bo |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age is stated anywhere in the product title or description. |
| wheelchair_access | "no" | 0.85 | structural | Scuba diving certification requires entry into and exit from water, boat boardin |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "terrain" | 0.80 | structural |
| advance_booking_needed | "required" | 0.90 | structural |
| age_fit | {"min":12,"max":60} | 0.65 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.90 | structural |
| best_time_of_day | "morning" | 0.80 | structural |
| confirm_at_booking | false | 0.75 | structural |
| crowding_by_season | {"high":"busy","shoulder":"moderate","low":"quiet"} | 0.70 | structural |
| group_type | ["solo","couple","friends"] | 0.80 | structural |
| indoor | false | 0.90 | structural |
| intensity | "moderate" | 0.80 | structural |
| mobility_note | "Course requires swimming ability, donning and doffing scuba gear, entering and exiting water, and controlling body position underwater. Participants must be capable of sustained aquatic exertion. Some adaptive diving programmes exist but are not referenced here." | 0.90 | structural |
| partial_participation_ok | false | 0.85 | structural |
| rain_viable | true | 0.75 | structural |
| seasonal_closure | _N/A_ | 0.80 | structural |
| sun_exposure | "full" | 0.85 | structural |
| vessel_type | "speedboat" | 0.65 | structural |
| water_exposure | "coastal" | 0.70 | structural |
| with_adult_from | 10 | 0.80 | structural |

### exp_27424P3: Full-Day Private Phi Phi Islands Speedboat Charter

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 16 | 0.60 | structural | Speedboat travel to open-water destinations with snorkeling in the Andaman Sea c |
| mobility | "moderate" | 0.75 | structural | Core activity involves boarding and riding a speedboat and visiting island beach |
| non_swimmer_ok | true | 0.75 | structural | Non-swimmers can participate by remaining on the boat during snorkel stops or st |
| pregnant_ok | false | 0.90 | structural | Speedboat travel over open Andaman Sea produces significant impact, jolting, and |
| seasickness_risk | "moderate" | 0.85 | structural | A speedboat crossing to Phi Phi Islands involves open Andaman Sea waters. Speedb |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age is stated anywhere in the product title or description. |
| wheelchair_access | "no" | 0.85 | structural | Speedboat boarding from a pier and beach landings at Phi Phi island stops (Bambo |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "vehicle" | 0.80 | structural |
| advance_booking_needed | "required" | 0.95 | structural |
| age_fit | "8-70" | 0.60 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.90 | structural |
| best_time_of_day | "morning" | 0.80 | structural |
| confirm_at_booking | false | 0.80 | structural |
| crowding_by_season | {"high":"moderate","shoulder":"quiet","low":"empty"} | 0.65 | structural |
| group_type | ["solo","couple","family","friends","large_group"] | 0.85 | textual |
| indoor | false | 1.00 | structural |
| intensity | "low" | 0.75 | textual |
| mobility_note | "Boarding a speedboat and moving around beach landing areas requires moderate mobility. Snorkeling is optional — guests can remain on the boat or sit on the beach. Sustained walking or athletic effort is not required for core enjoyment." | 0.75 | structural |
| partial_participation_ok | true | 0.90 | structural |
| rain_viable | false | 0.80 | structural |
| seasonal_closure | _N/A_ | 0.70 | structural |
| sun_exposure | "full" | 0.90 | structural |
| vessel_type | "speedboat" | 1.00 | textual |
| water_exposure | "open_sea" | 0.90 | textual |
| with_adult_from | 0 | 0.80 | structural |

### exp_8642P60: Elephant Sanctuary Small Group Tour in Phuket

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 16 | 0.50 | structural | Walking through forested terrain alongside large rescued elephants carries inher |
| mobility | "moderate" | 0.85 | structural | Description states 'taking a guided walk through the forest alongside them' — fo |
| non_swimmer_ok | true | 1.00 | structural | Entirely land-based activity. Swimming ability is irrelevant. |
| pregnant_ok | false | 0.75 | structural | Walking through forest terrain in close proximity to large, unpredictable elepha |
| seasickness_risk | _N/A_ | 1.00 | structural | Land-based activity at a forest elephant sanctuary. No water vessel involved. |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age is stated anywhere in the product title or description. |
| wheelchair_access | "no" | 0.80 | structural | The activity requires 'a guided walk through the forest' on natural terrain. For |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "terrain" | 0.90 | structural |
| advance_booking_needed | "required" | 0.85 | structural |
| age_fit | {"min":6,"max":80} | 0.65 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.85 | structural |
| best_time_of_day | "morning" | 0.75 | structural |
| confirm_at_booking | false | 0.70 | structural |
| crowding_by_season | {"high":"busy","shoulder":"moderate","low":"quiet"} | 0.70 | structural |
| group_type | ["solo","couple","family","friends","large_group"] | 0.80 | textual |
| indoor | false | 0.90 | structural |
| intensity | "low" | 0.80 | structural |
| mobility_note | "A guided forest walk alongside elephants is a core component and requires walking on uneven natural terrain. The cooking class and elephant observation may be accessible with limited mobility, but the forest walk portion is not easily skippable. Wheelchair users or those with severe walking limitations should confirm with the operator." | 0.80 | structural |
| partial_participation_ok | true | 0.70 | structural |
| rain_viable | true | 0.65 | structural |
| seasonal_closure | _N/A_ | 0.70 | structural |
| sun_exposure | "full" | 0.75 | structural |
| vessel_type | "none" | 1.00 | structural |
| water_exposure | "none" | 1.00 | structural |
| with_adult_from | 0 | 0.75 | structural |

### exp_11909P6: New Power catamaran for Phang Nga and Phi Phi island excursions

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 16 | 0.60 | structural | Open-water boat charter visiting Phang Nga and Phi Phi involves sea crossings, b |
| mobility | "moderate" | 0.75 | structural | The product highlights 'comfortable seating', 'shady cockpit/saloon area' and 's |
| non_swimmer_ok | true | 0.80 | structural | This is a leisure cruise charter with no mandatory swimming activity described.  |
| pregnant_ok | false | 0.70 | structural | Open-sea crossings to Phi Phi at 15 knots on a catamaran involve wave motion and |
| seasickness_risk | "moderate" | 0.75 | structural | Title states 'Phang Nga and Phi Phi island excursions'. Phang Nga is sheltered b |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age stated anywhere in the product title or description. |
| wheelchair_access | "unknown" | 0.60 | structural | No accessibility information is provided. Catamaran boarding typically involves  |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "vehicle" | 0.70 | structural |
| advance_booking_needed | "required" | 0.90 | structural |
| age_fit | {"min":5,"max":70} | 0.65 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.90 | structural |
| best_time_of_day | "morning" | 0.75 | structural |
| confirm_at_booking | true | 1.00 | structural |
| crowding_by_season | {"high":"busy","shoulder":"moderate","low":"quiet"} | 0.70 | structural |
| group_type | ["solo","couple","family","friends","large_group"] | 0.85 | textual |
| indoor | false | 1.00 | structural |
| intensity | "low" | 0.85 | structural |
| mobility_note | "Boarding the catamaran from a dock or tender requires stepping over a gunwale and some balance on a moving deck. Once aboard, guests can remain seated in the cockpit/saloon or sunbathing area for the full trip. No athletic activity is required for core enjoyment." | 0.80 | structural |
| partial_participation_ok | true | 0.90 | structural |
| rain_viable | false | 0.70 | structural |
| seasonal_closure | _N/A_ | 0.60 | structural |
| sun_exposure | "partial" | 0.90 | textual |
| vessel_type | "catamaran" | 1.00 | textual |
| water_exposure | "open_sea" | 0.85 | structural |
| with_adult_from | 0 | 0.80 | structural |

### exp_72851P5: Hype Yacht : VIP Tour Phi Phi Island & Maya Bay from Phuket

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 16 | 0.60 | structural | Open-sea yacht tour to Phi Phi with snorkeling in open water. Structural norm fo |
| mobility | "moderate" | 0.75 | structural | Core enjoyment is cruising on a yacht with 'gourmet lunch brought to your table' |
| non_swimmer_ok | true | 0.85 | structural | Swimming and snorkeling are presented as optional activities alongside dining an |
| pregnant_ok | false | 0.75 | structural | Open-sea crossing to Phi Phi on a yacht involves significant motion and swell ex |
| seasickness_risk | "moderate" | 0.75 | structural | Phuket to Phi Phi Island crossing is open Andaman Sea — typically 1.5–2 hour cro |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age stated anywhere in the product title or description. |
| wheelchair_access | "no" | 0.80 | structural | Boarding a yacht from a pier or tender involves steps, narrow passages, and move |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "vehicle" | 0.85 | structural |
| advance_booking_needed | "required" | 0.90 | structural |
| age_fit | {"min":8,"max":70} | 0.65 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.90 | structural |
| best_time_of_day | "morning" | 0.80 | structural |
| confirm_at_booking | false | 0.75 | structural |
| crowding_by_season | {"high":"busy","shoulder":"moderate","low":"quiet"} | 0.70 | structural |
| group_type | ["solo","couple","family","friends"] | 0.85 | textual |
| indoor | false | 0.70 | unverified |
| intensity | "low" | 0.80 | textual |
| mobility_note | "Core enjoyment (dining, scenic cruising, sunset watching) is sedentary and accessible to those who cannot swim or snorkel. Boarding the yacht and moving on deck requires some balance and stepping — not suitable for wheelchair users without assistance. Snorkeling is optional." | 0.75 | structural |
| partial_participation_ok | true | 0.90 | textual |
| rain_viable | false | 0.75 | structural |
| seasonal_closure | {"months":["May","June","July","August","September","October"],"source_note":"Maya Bay, Phi Phi Leh is subject to seasonal closures and restricted access managed by Krabi National Park / DNP Thailand. Additionally, rough Andaman Sea conditions during monsoon season (Jun–Sep) typically lead operators to suspend open-sea yacht tours. Confirm with operator for specific closure dates."} | 0.70 | structural |
| sun_exposure | "full" | 0.90 | textual |
| vessel_type | "yacht" | 1.00 | textual |
| water_exposure | "open_sea" | 0.95 | textual |
| with_adult_from | 0 | 0.80 | structural |

### exp_27424P9: Private Speedboat Maiton, Racha, and Coral Islands Tour from Phuket

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 16 | 0.60 | structural | Private speedboat travel on open coastal waters plus optional activities like pa |
| mobility | "moderate" | 0.80 | structural | Core experience involves beach walking, boarding/disembarking a speedboat, and i |
| non_swimmer_ok | true | 0.80 | structural | Snorkeling is optional; beach activities, dolphin watching, and boat riding are  |
| pregnant_ok | false | 0.85 | structural | Speedboat travel on coastal/open water produces significant vibration and impact |
| seasickness_risk | "moderate" | 0.80 | structural | Speedboat travel to Racha Noi involves coastal and open-sea crossings. Speedboat |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age is stated anywhere in the product title or description. |
| wheelchair_access | "no" | 0.85 | structural | Boarding and disembarking a speedboat, navigating sandy beaches, and island terr |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "vehicle" | 0.85 | structural |
| advance_booking_needed | "required" | 0.90 | structural |
| age_fit | {"min":6,"max":60} | 0.70 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.90 | structural |
| best_time_of_day | "morning" | 0.85 | structural |
| confirm_at_booking | false | 0.80 | structural |
| crowding_by_season | {"high":"busy","shoulder":"moderate","low":"quiet"} | 0.75 | structural |
| group_type | ["solo","couple","family","friends","large_group"] | 0.85 | structural |
| indoor | false | 1.00 | structural |
| intensity | "moderate" | 0.75 | structural |
| mobility_note | "Boarding and disembarking a speedboat and walking on sandy/uneven beach terrain is required for the core experience. Snorkeling, parasailing, canoeing, and banana boat are optional. Those with limited mobility can sit on the boat and enjoy island scenery but will struggle with beach terrain and vessel boarding." | 0.00 | structural |
| partial_participation_ok | true | 0.90 | structural |
| rain_viable | false | 0.75 | structural |
| seasonal_closure | _N/A_ | 0.70 | structural |
| sun_exposure | "full" | 0.95 | structural |
| vessel_type | "speedboat" | 1.00 | textual |
| water_exposure | "coastal" | 0.80 | structural |
| with_adult_from | 0 | 0.80 | structural |

### exp_72851P9: Hype Yacht : VIP tour Krabi Islands & Phang Nga Bay from Phuket

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 16 | 0.60 | structural | Yacht tour involving open-water swimming and boat travel. Standard independent p |
| mobility | "moderate" | 0.75 | structural | Core experience includes sitting on yacht, enjoying lunch and cocktails, and wat |
| non_swimmer_ok | true | 0.85 | structural | Swimming is presented as an activity option ('swim in the lagoon') rather than m |
| pregnant_ok | false | 0.75 | structural | Open-water yacht tour with potential for rough seas, 8-hour duration, and alcoho |
| seasickness_risk | "moderate" | 0.75 | structural | Route covers Krabi islands and Phang Nga Bay from Phuket — open coastal and some |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age stated anywhere in the product title or description. |
| wheelchair_access | "unknown" | 0.60 | structural | No accessibility information provided. Yacht boarding typically involves steps a |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | _N/A_ | 1.00 | structural |
| advance_booking_needed | "required" | 0.90 | structural |
| age_fit | {"min":8,"max":70} | 0.65 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.90 | structural |
| best_time_of_day | "morning" | 0.85 | structural |
| confirm_at_booking | true | 1.00 | structural |
| crowding_by_season | {"high":"moderate","shoulder":"quiet","low":"empty"} | 0.70 | structural |
| group_type | ["solo","couple","friends","large_group"] | 0.75 | structural |
| indoor | false | 1.00 | structural |
| intensity | "low" | 0.75 | structural |
| mobility_note | "Core enjoyment (deck seating, gourmet lunch, cocktails, scenic views) is accessible with moderate mobility. Boarding and disembarking the yacht involves steps and potentially uneven gangway surfaces. Swimming in the lagoon and beach exploration require full mobility. Guests who cannot swim or walk on uneven terrain can still enjoy the yacht experience." | 0.75 | structural |
| partial_participation_ok | true | 0.90 | structural |
| rain_viable | false | 0.75 | structural |
| seasonal_closure | _N/A_ | 0.65 | structural |
| sun_exposure | "full" | 0.90 | structural |
| vessel_type | "yacht" | 1.00 | textual |
| water_exposure | "open_sea" | 0.80 | structural |
| with_adult_from | 0 | 0.80 | structural |

### exp_85890P4: Luxury Private Speed Boat Charter - Phi Phi Sunrise

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 16 | 0.60 | structural | Speedboat travel to open-water destination (Phi Phi Islands) involves genuine se |
| mobility | "moderate" | 0.75 | structural | Speedboat boarding and island stops (Phi Phi, Bamboo Island) involve stepping on |
| non_swimmer_ok | true | 0.80 | structural | Private charter with professional crew — non-swimmers can remain on board during |
| pregnant_ok | false | 0.85 | structural | Speedboat travel across open sea involves significant vessel motion, vibration,  |
| seasickness_risk | "moderate" | 0.80 | structural | Title states 'Speed Boat' — speedboats traveling to Phi Phi Islands cross open A |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age is stated anywhere in the product title or description. |
| wheelchair_access | "no" | 0.80 | structural | Speedboat boarding from a pier or beach requires stepping over gunwales and bala |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "vehicle" | 0.85 | structural |
| advance_booking_needed | "required" | 0.95 | structural |
| age_fit | {"min":8,"max":70} | 0.60 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.90 | structural |
| best_time_of_day | "morning" | 0.95 | textual |
| confirm_at_booking | false | 0.75 | structural |
| crowding_by_season | {"high":"moderate","shoulder":"quiet","low":"quiet"} | 0.70 | structural |
| group_type | ["solo","couple","family","friends","large_group"] | 0.85 | textual |
| indoor | false | 0.95 | structural |
| intensity | "low" | 0.70 | structural |
| mobility_note | "Boarding and disembarking a speedboat requires stepping up/down and balancing on a moving vessel. Island stops may involve pier or beach landings on uneven surfaces. The core experience (seated cruising, swimming from the boat, lunch at the pool club) is accessible to those with moderate mobility, but wheelchair users or those unable to navigate boat boarding would face significant barriers." | 0.75 | structural |
| partial_participation_ok | true | 0.90 | structural |
| rain_viable | false | 0.75 | structural |
| seasonal_closure | {"months":["August","September"],"source_note":"Description states: 'During the months of August, September, the Phi Phi National Park closes Maya Bay to tourists to allow some annual rejuvenation to the ecosystem. The stunning Bamboo Island is visited instead during these months.' — operator-disclosed Maya Bay closure per Phi Phi National Park authority; Bamboo Island substituted."} | 0.95 | textual |
| sun_exposure | "full" | 0.85 | structural |
| vessel_type | "speedboat" | 1.00 | textual |
| water_exposure | "open_sea" | 0.95 | structural |
| with_adult_from | 0 | 0.80 | structural |

### exp_10074P14: Private Speed Boat to Phi Phi Island from Phuket

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 16 | 0.60 | structural | Speedboat tour with open-sea crossings, island hopping, and potential snorkeling |
| mobility | "moderate" | 0.80 | structural | Speedboat boarding/disembarking, beach landings at Phi Phi and Khai Island, and  |
| non_swimmer_ok | true | 0.80 | structural | The core activity is a boat tour with beach and island visits. Non-swimmers can  |
| pregnant_ok | false | 0.85 | structural | Speedboat travel on open sea involves significant wave impact, jarring, and boun |
| seasickness_risk | "moderate" | 0.85 | structural | Phi Phi Island is an open-sea crossing from Phuket (approximately 45 km). Speedb |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age is stated anywhere in the product title or description. |
| wheelchair_access | "no" | 0.85 | structural | Boarding a speedboat requires stepping over the hull, climbing in/out of a rocki |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "vehicle" | 0.90 | structural |
| advance_booking_needed | "required" | 0.90 | structural |
| age_fit | {"min":6,"max":65} | 0.60 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.95 | structural |
| best_time_of_day | "morning" | 0.90 | textual |
| confirm_at_booking | false | 0.80 | structural |
| crowding_by_season | {"high":"busy","shoulder":"moderate","low":"quiet"} | 0.80 | structural |
| group_type | ["solo","couple","family","friends","large_group"] | 0.85 | textual |
| indoor | false | 1.00 | structural |
| intensity | "low" | 0.75 | structural |
| mobility_note | "Boarding and disembarking a speedboat requires stepping over the hull and managing movement on a rocking vessel. Beach landings at Phi Phi Don and Khai Island involve walking on sand and potentially uneven paths. A passenger with very limited mobility could remain on the boat at stops but would miss most of the experience." | 0.80 | structural |
| partial_participation_ok | true | 0.85 | structural |
| rain_viable | false | 0.75 | structural |
| seasonal_closure | {"months":["June","July","August","September"],"source_note":"Maya Bay, Ko Phi Phi Leh is managed by Krabi National Park (DNP Thailand). While not formally closed year-round, rough seas during southwest monsoon (Jun–Sep) frequently make speedboat access impossible or unsafe. Maya Bay was also subject to periodic closures for environmental recovery per DNP Thailand."} | 0.70 | structural |
| sun_exposure | "full" | 0.90 | structural |
| vessel_type | "speedboat" | 1.00 | textual |
| water_exposure | "open_sea" | 0.95 | structural |
| with_adult_from | 0 | 0.80 | structural |

### exp_54510P21: Country Side Cycling and treking to the waterfall (Private tour )

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 16 | 0.65 | structural | Cycling on roads and jungle trekking to a waterfall involves navigation, physica |
| mobility | "full" | 0.95 | textual | Description states 'cycling and local country side sightseeing and jungle trekki |
| non_swimmer_ok | true | 0.95 | structural | Activity is cycling and jungle trekking to a waterfall — no swimming or water im |
| pregnant_ok | false | 0.90 | structural | 6-hour cycling and jungle trekking on uneven terrain involves physical exertion, |
| seasickness_risk | _N/A_ | 1.00 | structural | Fully land-based activity — cycling and trekking. No water vessel involved. |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age is stated anywhere in the product title or description. |
| wheelchair_access | "no" | 0.97 | structural | Activity requires cycling and jungle trekking on natural terrain including a wat |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "terrain" | 0.99 | structural |
| advance_booking_needed | "required" | 0.90 | structural |
| age_fit | {"min":8,"max":65} | 0.65 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.85 | structural |
| best_time_of_day | "morning" | 0.85 | structural |
| confirm_at_booking | false | 0.90 | structural |
| crowding_by_season | {"high":"quiet","shoulder":"empty","low":"empty"} | 0.70 | textual |
| group_type | ["solo","couple","family","friends"] | 0.85 | textual |
| indoor | false | 1.00 | textual |
| intensity | "moderate" | 0.75 | textual |
| mobility_note | "The core experience requires cycling on rural roads and trekking on jungle/natural terrain to reach a waterfall. Despite the operator's 'Easy' descriptor, uneven jungle terrain and sustained cycling over 6 hours demands full mobility. No seated or flat-surface alternative is described." | 0.90 | textual |
| partial_participation_ok | false | 0.70 | structural |
| rain_viable | false | 0.75 | structural |
| seasonal_closure | {"months":[],"source_note":"Thai Muang National Park does not have a documented blanket seasonal closure unlike Similan/Surin Marine Parks. However, trails may be temporarily closed during heavy monsoon. Confirm with operator May–October."} | 0.60 | structural |
| sun_exposure | "full" | 0.80 | structural |
| vessel_type | "none" | 1.00 | structural |
| water_exposure | "none" | 1.00 | structural |
| with_adult_from | 5 | 0.70 | structural |

### exp_191011P5: Flying Hanuman Zipline

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 16 | 0.60 | structural | Zipline and treetop adventure with heights, abseiling, and physical exertion. St |
| mobility | "full" | 0.98 | textual | Description includes '28 platforms, 2 abseil points, 2 sky bridges, 3 spiral sta |
| non_swimmer_ok | true | 1.00 | structural | Entirely land-based activity; swimming ability is irrelevant. |
| pregnant_ok | false | 0.98 | structural | Zipline, abseiling, and treetop adventure with harness use, heights, physical ex |
| seasickness_risk | _N/A_ | 1.00 | structural | Land-based zipline activity; no water vessel involved. |
| stated_min_age | 4 | 0.95 | textual | Description states 'Children under 4 year are not recommended.' |
| wheelchair_access | "no" | 0.98 | textual | Activity requires traversing '28 platforms, 2 abseil points, 2 sky bridges, 3 sp |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "terrain" | 0.98 | structural |
| advance_booking_needed | "required" | 0.90 | structural |
| age_fit | {"min":6,"max":60} | 0.65 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.85 | structural |
| best_time_of_day | "morning" | 0.80 | structural |
| confirm_at_booking | false | 0.95 | structural |
| crowding_by_season | {"high":"busy","shoulder":"moderate","low":"quiet"} | 0.65 | structural |
| group_type | ["solo","couple","friends","family","large_group"] | 0.80 | structural |
| indoor | false | 1.00 | textual |
| intensity | "high" | 0.90 | structural |
| mobility_note | "Core activity requires climbing spiral staircases, walking across sky bridges, abseiling, and a 20-minute wilderness walk. Full mobility and physical fitness are required. No seated or partial-participation alternative exists for the zipline experience itself." | 0.95 | textual |
| partial_participation_ok | false | 0.80 | structural |
| rain_viable | false | 0.75 | structural |
| seasonal_closure | _N/A_ | 0.60 | structural |
| sun_exposure | "partial" | 0.80 | structural |
| vessel_type | "none" | 1.00 | structural |
| water_exposure | "none" | 1.00 | structural |
| with_adult_from | 4 | 0.85 | textual |

### exp_318310P2: Phuket Private Longtail Boat with Special Jacuzzi to Banana Beach

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 16 | 0.60 | structural | Open-sea snorkeling and swimming on a private boat charter involves water safety |
| mobility | "moderate" | 0.75 | structural | Core experience includes 'relaxing in the onboard jacuzzi' and 'free time to unw |
| non_swimmer_ok | true | 0.80 | structural | Snorkeling and swimming are optional activities. Guests can 'relax in the onboar |
| pregnant_ok | false | 0.75 | structural | Longtail boats produce significant vibration, wave impact, and jolting motion —  |
| seasickness_risk | "moderate" | 0.70 | structural | Longtail boats are small, low-to-water craft with minimal stabilization. Route c |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age is stated anywhere in the product title or description. |
| wheelchair_access | "no" | 0.85 | structural | Longtail boats require stepping over a high gunwale and boarding from a pier or  |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "vehicle" | 0.85 | structural |
| advance_booking_needed | "required" | 0.95 | structural |
| age_fit | {"min":6,"max":70} | 0.65 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.90 | structural |
| best_time_of_day | "morning" | 0.75 | textual |
| confirm_at_booking | false | 0.80 | structural |
| crowding_by_season | {"high":"moderate","shoulder":"quiet","low":"empty"} | 0.70 | structural |
| group_type | ["solo","couple","family","friends"] | 0.90 | textual |
| indoor | false | 1.00 | structural |
| intensity | "low" | 0.75 | textual |
| mobility_note | "Boarding and disembarking a longtail boat requires stepping over the gunwale and onto potentially uneven surfaces; beach walking on sand is required at Banana Beach. Core enjoyment (jacuzzi, boat cruise, beach relaxation) does not require sustained athletic effort. Snorkeling and swimming are optional." | 0.80 | structural |
| partial_participation_ok | true | 0.95 | textual |
| rain_viable | false | 0.75 | structural |
| seasonal_closure | _N/A_ | 0.70 | structural |
| sun_exposure | "full" | 0.90 | structural |
| vessel_type | "longtail" | 1.00 | textual |
| water_exposure | "coastal" | 0.80 | structural |
| with_adult_from | 0 | 0.80 | structural |

### exp_423026P2: Private Phang Nga Bay Tour with Planktons Swim

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 16 | 0.60 | structural | The activity involves swimming in open water at night (bioluminescent plankton), |
| mobility | "moderate" | 0.70 | structural | The core experience is a boat tour of Phang Nga Bay (sightseeing), which can be  |
| non_swimmer_ok | false | 0.75 | structural | Title states 'Planktons Swim' indicating open-water swimming is the headline act |
| pregnant_ok | false | 0.85 | structural | Open-water swimming (the headline 'Planktons Swim' activity) is contraindicated  |
| seasickness_risk | "low" | 0.65 | structural | Phang Nga Bay is a sheltered bay environment with generally calm waters, reducin |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age is stated anywhere in the title or description. |
| wheelchair_access | "unknown" | 0.70 | structural | No accessibility information is provided in the description. Boat boarding and o |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "vehicle" | 0.70 | structural |
| advance_booking_needed | "required" | 0.85 | structural |
| age_fit | {"min":8,"max":70} | 0.55 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.85 | structural |
| best_time_of_day | "evening" | 0.75 | structural |
| confirm_at_booking | true | 1.00 | structural |
| crowding_by_season | {"high":"moderate","shoulder":"quiet","low":"quiet"} | 0.60 | structural |
| group_type | ["solo","couple","family","friends"] | 0.85 | textual |
| indoor | false | 1.00 | structural |
| intensity | "moderate" | 0.70 | structural |
| mobility_note | "Core sightseeing of Phang Nga Bay can be enjoyed seated on the boat. The plankton swim requires ability to enter and swim in open water, which demands full mobility. Guests unable to swim can still participate in the boat tour portion." | 0.75 | structural |
| partial_participation_ok | true | 0.80 | structural |
| rain_viable | false | 0.60 | structural |
| seasonal_closure | _N/A_ | 0.60 | structural |
| sun_exposure | "full" | 0.75 | structural |
| vessel_type | "longtail" | 0.45 | structural |
| water_exposure | "sheltered_bay" | 0.90 | textual |
| with_adult_from | 0 | 0.70 | structural |

### exp_54510P22: Wonderfull Sunrise Samed Nangshe & Phang Nga bay Private tour

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 16 | 0.55 | structural | Early morning hiking tour requiring pre-dawn travel and physical exertion; indep |
| mobility | "full" | 0.85 | textual | Description states 'this tour will be hiking to drink a coffee with the beautifu |
| non_swimmer_ok | true | 0.90 | structural | Land-based hiking and sightseeing tour with no described swimming or water entry |
| pregnant_ok | false | 0.80 | structural | Early morning hiking on uneven terrain before dawn to a hilltop viewpoint is not |
| seasickness_risk | _N/A_ | 0.85 | structural | Tour is primarily land-based (hiking to viewpoint, local breakfast); Phang Nga b |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age stated anywhere in the product title or description. |
| wheelchair_access | "no" | 0.90 | structural | Hiking to the Samet Nangshe viewpoint is the core activity. The trail involves u |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "terrain" | 0.95 | structural |
| advance_booking_needed | "required" | 0.90 | structural |
| age_fit | {"min":8,"max":75} | 0.60 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.90 | structural |
| best_time_of_day | "morning" | 1.00 | textual |
| confirm_at_booking | false | 0.85 | structural |
| crowding_by_season | {"high":"moderate","shoulder":"quiet","low":"empty"} | 0.65 | textual |
| group_type | ["solo","couple","family","friends"] | 0.80 | textual |
| indoor | false | 0.70 | unverified |
| intensity | "moderate" | 0.75 | structural |
| mobility_note | "The headline attraction requires hiking to the Samet Nangshe viewpoint at pre-dawn hours on uneven terrain. There is no indication of a seated or vehicle-based alternative to reach the viewpoint. Full mobility is required for core enjoyment." | 0.85 | textual |
| partial_participation_ok | false | 0.70 | unverified |
| rain_viable | false | 0.75 | structural |
| seasonal_closure | _N/A_ | 0.70 | structural |
| sun_exposure | "full" | 0.85 | structural |
| vessel_type | "none" | 0.70 | structural |
| water_exposure | "none" | 0.70 | structural |
| with_adult_from | 5 | 0.65 | structural |

### exp_220751P3: Open water scuba certifiication course with beach dives

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 15 | 0.70 | structural | Standard Open Water certification for adults (without junior designation requiri |
| mobility | "full" | 0.95 | structural | Open Water scuba certification involves swimming, donning heavy equipment, enter |
| non_swimmer_ok | false | 1.00 | structural | Scuba certification universally requires swimming competency. Open Water courses |
| pregnant_ok | false | 1.00 | structural | Scuba diving is contraindicated during pregnancy due to decompression sickness r |
| seasickness_risk | "low" | 0.70 | textual | Description states 'beach dives' in the title, indicating shore/beach entry rath |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age is stated anywhere in the title or description. |
| wheelchair_access | "no" | 0.95 | structural | Open Water scuba certification requires beach entry, carrying heavy equipment, s |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "terrain" | 0.95 | structural |
| advance_booking_needed | "required" | 0.90 | structural |
| age_fit | {"min":15,"max":60} | 0.65 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.90 | structural |
| best_time_of_day | "morning" | 0.80 | structural |
| confirm_at_booking | false | 0.90 | structural |
| crowding_by_season | {"high":"moderate","shoulder":"quiet","low":"quiet"} | 0.60 | structural |
| group_type | ["solo","couple","friends"] | 0.80 | structural |
| indoor | false | 0.85 | textual |
| intensity | "moderate" | 0.80 | structural |
| mobility_note | "Participants must be able to swim, carry scuba equipment (BCD, tank, regulator), enter and exit the water from a beach, and perform underwater skills including mask clearing and regulator recovery. No partial participation is feasible for the core certification." | 0.90 | structural |
| partial_participation_ok | false | 0.90 | structural |
| rain_viable | true | 0.75 | structural |
| seasonal_closure | _N/A_ | 0.70 | structural |
| sun_exposure | "full" | 0.85 | structural |
| vessel_type | "none" | 0.75 | textual |
| water_exposure | "coastal" | 0.70 | structural |
| with_adult_from | 10 | 0.75 | structural |

### exp_133093P1: Phi Phi Island Private Boat Tour

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 16 | 0.60 | structural | Open-sea boat tour with snorkeling in open water around Phi Phi Islands. Indepen |
| mobility | "moderate" | 0.75 | structural | The core experience includes boat travel, sightseeing at Maya Bay, Monkey Beach, |
| non_swimmer_ok | true | 0.75 | structural | Structural: While snorkeling is offered ('Jump in the crystal clear waters'), th |
| pregnant_ok | false | 0.85 | structural | Structural: Open-sea speedboat crossings involve significant motion, impact from |
| seasickness_risk | "moderate" | 0.80 | structural | Structural: Phi Phi Islands are accessed via open sea crossing from Phuket (~1.5 |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age is stated anywhere in the product title or description. |
| wheelchair_access | "no" | 0.80 | structural | Structural: Boarding a private speedboat from a pier, open-sea crossings, beach  |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "vehicle" | 0.80 | structural |
| advance_booking_needed | "required" | 0.85 | structural |
| age_fit | {"min":6,"max":70} | 0.60 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.90 | structural |
| best_time_of_day | "morning" | 0.80 | structural |
| confirm_at_booking | false | 0.70 | structural |
| crowding_by_season | {"high":"busy","shoulder":"moderate","low":"quiet"} | 0.70 | structural |
| group_type | ["solo","couple","family","friends"] | 0.90 | structural |
| indoor | false | 1.00 | structural |
| intensity | "moderate" | 0.75 | structural |
| mobility_note | "Core scenic enjoyment (watching monkeys, viewing Viking Cave, cruising to Maya Bay) can be done from the boat with moderate mobility. Shore landings at beaches may involve stepping off a boat onto sand or rocks. Snorkeling requires swimming ability but is optional. Full mobility needed only for active snorkeling." | 0.70 | structural |
| partial_participation_ok | true | 0.90 | structural |
| rain_viable | false | 0.75 | structural |
| seasonal_closure | {"months":[],"source_note":"Maya Bay at Phi Phi Leh reopened in January 2022 after rehabilitation closure. No current seasonal closure applies to Phi Phi Islands boat tours, though individual operators may suspend during peak monsoon (Jul–Sep) for safety. Note: Maya Bay has visitor caps and periodic management closures — confirm current status with operator."} | 0.65 | structural |
| sun_exposure | "full" | 0.90 | structural |
| vessel_type | "speedboat" | 0.70 | structural |
| water_exposure | "open_sea" | 0.95 | structural |
| with_adult_from | 0 | 0.70 | structural |

### exp_105183P3: Bamboo Rafting and Eco Delight Story PRIVATE 4 persons - From Phuket

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 16 | 0.55 | structural | Bamboo rafting on a river with jungle/swamp terrain requires physical balance an |
| mobility | "moderate" | 0.75 | structural | Description mentions traversing 'virgin Rainforest, Mangroves, Beach forest, Swa |
| non_swimmer_ok | false | 0.60 | structural | Bamboo rafting on a river carries inherent risk of falling into water. Without l |
| pregnant_ok | false | 0.80 | structural | Bamboo rafting on a river involves balance risk and potential falls into water.  |
| seasickness_risk | "low" | 0.80 | structural | Activity involves river rafting ('sailing along the river with thai traditional  |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age stated anywhere in the product title or description. |
| wheelchair_access | "no" | 0.90 | structural | Activity traverses 'virgin Rainforest, Mangroves, Beach forest, Swamp Forest and |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "terrain" | 0.95 | structural |
| advance_booking_needed | "required" | 0.90 | structural |
| age_fit | {"min":7,"max":70} | 0.60 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.80 | structural |
| best_time_of_day | "morning" | 0.75 | structural |
| confirm_at_booking | false | 0.85 | structural |
| crowding_by_season | {"high":"quiet","shoulder":"quiet","low":"empty"} | 0.60 | structural |
| group_type | ["family","friends","couple"] | 0.80 | textual |
| indoor | false | 0.95 | textual |
| intensity | "moderate" | 0.75 | structural |
| mobility_note | "Walking through varied natural terrain (rainforest, mangrove, swamp forest, savanna) and boarding a bamboo raft on a river require moderate mobility and balance. Temple visit likely involves some steps. Core experience cannot be enjoyed from a seated/stationary position." | 0.75 | structural |
| partial_participation_ok | true | 0.65 | structural |
| rain_viable | false | 0.65 | structural |
| seasonal_closure | _N/A_ | 0.50 | structural |
| sun_exposure | "partial" | 0.80 | structural |
| vessel_type | "none" | 0.85 | structural |
| water_exposure | "sheltered_bay" | 0.50 | structural |
| with_adult_from | 5 | 0.60 | structural |

### exp_133093P2: James Bond Island Private Boat Tour

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 16 | 0.60 | structural | Private boat tour involving canoe paddling through mangroves, exploring lagoons, |
| mobility | "moderate" | 0.75 | structural | Core experience includes 'Canoe through the Mangroves, explore the hidden lagoon |
| non_swimmer_ok | true | 0.75 | structural | Boat tour with canoeing in sheltered bay — no swimming is described as mandatory |
| pregnant_ok | false | 0.70 | structural | Speedboat travel in open water, canoe paddling, and boarding/disembarking vessel |
| seasickness_risk | "low" | 0.75 | structural | Phang Nga Bay is a sheltered bay environment protected by limestone karsts, gene |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age is stated anywhere in the product title or description. |
| wheelchair_access | "no" | 0.75 | structural | Activity involves boarding a private boat, transferring into canoes, and explori |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "vehicle" | 0.70 | structural |
| advance_booking_needed | "required" | 0.90 | structural |
| age_fit | {"min":5,"max":70} | 0.70 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.85 | structural |
| best_time_of_day | "morning" | 0.80 | structural |
| confirm_at_booking | false | 0.70 | structural |
| crowding_by_season | {"high":"busy","shoulder":"moderate","low":"quiet"} | 0.75 | structural |
| group_type | ["solo","couple","family","friends","large_group"] | 0.85 | structural |
| indoor | false | 1.00 | structural |
| intensity | "low" | 0.75 | structural |
| mobility_note | "Canoeing through mangroves and exploring James Bond Island require ability to board/exit a canoe and walk on uneven rocky/sandy terrain. Guests with limited mobility can remain on the main boat and enjoy the bay scenery but will miss the canoe and island exploration segments." | 0.00 | structural |
| partial_participation_ok | true | 0.85 | structural |
| rain_viable | true | 0.65 | structural |
| seasonal_closure | _N/A_ | 0.70 | structural |
| sun_exposure | "full" | 0.80 | structural |
| vessel_type | "speedboat" | 0.55 | structural |
| water_exposure | "sheltered_bay" | 0.90 | textual |
| with_adult_from | 0 | 0.75 | structural |

### exp_404093P1: Private Phi Phi 5 Star Islands Full Day Tour

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 16 | 0.60 | structural | Speedboat open-sea tour with snorkeling in open water. Independent participation |
| mobility | "moderate" | 0.75 | structural | Core enjoyment includes boat-based sightseeing of Maya Bay, Viking Cave, Pileh L |
| non_swimmer_ok | true | 0.70 | structural | Non-swimmers can participate in the boat-based sightseeing, lunch, and beach por |
| pregnant_ok | false | 0.85 | structural | Speedboat travel across open Andaman Sea involves significant impact and vibrati |
| seasickness_risk | "moderate" | 0.85 | structural | Phi Phi Islands are approximately 45 km from Phuket across open Andaman Sea. Spe |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age stated anywhere in the product title or description. |
| wheelchair_access | "no" | 0.85 | structural | Speedboat boarding from piers or beach, open-sea crossings, beach landings at mu |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "vehicle" | 0.85 | structural |
| advance_booking_needed | "required" | 0.90 | structural |
| age_fit | {"min":6,"max":70} | 0.60 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.90 | structural |
| best_time_of_day | "morning" | 0.85 | structural |
| confirm_at_booking | false | 0.80 | structural |
| crowding_by_season | {"high":"busy","shoulder":"moderate","low":"quiet"} | 0.75 | structural |
| group_type | ["solo","couple","family","friends","large_group"] | 0.90 | textual |
| indoor | false | 1.00 | structural |
| intensity | "moderate" | 0.80 | structural |
| mobility_note | "Guests can enjoy most sightseeing (Maya Bay, Viking Cave, Pileh Lagoon views, Monkey Bay) from the boat. Snorkeling and beach landings require the ability to board/disembark a speedboat in open water and walk on uneven beach terrain. A guest who cannot swim or walk far can still enjoy the scenic cruise and lunch portions." | 0.75 | structural |
| partial_participation_ok | true | 0.85 | structural |
| rain_viable | false | 0.75 | structural |
| seasonal_closure | _N/A_ | 0.70 | structural |
| sun_exposure | "full" | 0.90 | structural |
| vessel_type | "speedboat" | 0.90 | textual |
| water_exposure | "open_sea" | 0.95 | structural |
| with_adult_from | 0 | 0.70 | structural |

### exp_30633P16: 2 Day Rescue Diver Course

| Attr | Value | Conf | Basis | Evidence |
|---|---|---|---|---|
| independent_from | 15 | 0.65 | structural | PADI Rescue Diver is typically taught to participants 12+ but independent certif |
| mobility | "full" | 0.95 | textual | Description states 'rescue exercises', 'rescuing panicked divers', 'rescuing unr |
| non_swimmer_ok | false | 1.00 | structural | A scuba rescue diver course inherently requires strong swimming ability. PADI Re |
| pregnant_ok | false | 1.00 | structural | Scuba diving during pregnancy is contraindicated by PADI and medical consensus d |
| seasickness_risk | "low" | 0.60 | structural | Rescue Diver courses typically include open water dives from a boat. However, th |
| stated_min_age | _N/A_ | 0.70 | unverified | No minimum age is stated anywhere in the product title or description. |
| wheelchair_access | "no" | 0.90 | structural | The physical requirements of a PADI Rescue Diver course — entering/exiting water |

| Attr | Value | Conf | Basis |
|---|---|---|---|
| access_constraint | "terrain" | 0.85 | structural |
| advance_booking_needed | "required" | 0.90 | structural |
| age_fit | {"min":15,"max":60} | 0.60 | structural |
| best_months | ["November","December","January","February","March","April"] | 0.85 | structural |
| best_time_of_day | "morning" | 0.70 | structural |
| confirm_at_booking | false | 0.80 | structural |
| crowding_by_season | {"high":"moderate","shoulder":"quiet","low":"quiet"} | 0.55 | structural |
| group_type | ["solo","couple","friends"] | 0.75 | structural |
| indoor | false | 0.85 | structural |
| intensity | "high" | 0.90 | structural |
| mobility_note | "Participants must be able to perform sustained in-water physical rescue tasks including towing and lifting unresponsive divers, swimming with equipment, and performing emergency management procedures. Not suitable for anyone with limited mobility." | 0.95 | textual |
| partial_participation_ok | false | 0.90 | structural |
| rain_viable | true | 0.70 | structural |
| seasonal_closure | _N/A_ | 0.70 | structural |
| sun_exposure | "partial" | 0.75 | structural |
| vessel_type | "speedboat" | 0.55 | structural |
| water_exposure | "coastal" | 0.60 | structural |
| with_adult_from | 12 | 0.75 | structural |

---
> **Status:** PENDING REVIEW