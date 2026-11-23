# Human-centred design lens for OPMS

Status: v0.2 draft, 2026-11-23. Text under CC BY 4.0. All example data is fictional.

OPMS is not only a map problem. If cars start dropping people off, parking themselves and returning, the people who gain most are those for whom parking is hardest today, and those who lose most are people whom the system forgets. This document sets out how OPMS tries to put people first, and where it cannot.

## 1. Principles

1. **Co-design with people with lived experience.** Involve disabled people, older people, carers, parents, transport providers and emergency services from the start, and keep involving them (ISO 9241-210 asks for user involvement throughout the life cycle). Pay people for their time. Publish what changed because of their input.
2. **Accessibility by default.** The accessibility fields (accessible bays, step-free paths, lifts, handover zones, wayfinding, safety) are part of the core model, not an add-on. WCAG-style principles (perceivable, operable, understandable, robust) apply to every app and page built on OPMS data, including this repository's documentation.
3. **Dignity and independence.** The system should make independent travel easier without labelling people or requiring them to disclose conditions. Planning uses needs ("step-free door to door"), not diagnoses.
4. **Inclusive of non-AV users.** The same data should help people who drive themselves, are driven by someone else, use taxis, community transport or buses, or walk. Hence `PublicationTerms.non_av_use_allowed` and open formats.
5. **Privacy.** Passenger needs stay on the device with revocable consent; only minimal derived requirements may leave. No plates, VINs, faces or trajectories in maps.
6. **Equity across suburbs and regions.** Coverage targets include suburban and regional places and the facilities used by essential services (clinics, community centres, public transport interchanges), not only premium shopping centres. `Site.locality_class` and `equity_gap` campaigns exist to measure and steer this.
7. **Evidence over assumption.** An accessibility attribute is a claim with an audit record (`audit.method`, `last_audited`), a source and a confidence. An absent field means unknown, never accessible.
8. **Do no harm.** A wrong "step-free" flag strands a person. Safety-critical accessibility features (lifts out of service, steep ramps, heavy doors) default to the cautious reading, and corrections must be easy and fast.

## 2. Frameworks and laws to design against (verified 2026-11-23; confirm before relying on them)

| Framework | What it is | Relevance | Notes and uncertainty |
|---|---|---|---|
| ISO 9241-210:2019, human-centred design for interactive systems | International Standard, last reviewed and confirmed 2025 (https://www.iso.org/standard/77520.html) | Process: understand users and context, involve users, iterate, evaluate | A process standard; it does not set parking or map requirements |
| WCAG 2.2 | W3C Recommendation (https://www.w3.org/TR/WCAG22/) | Four principles; testable criteria for apps and web pages built on OPMS data | W3C notes that meeting WCAG does not address every user need |
| Disability Discrimination Act 1992 (Cth) | Australian law | Underpins the Transport Standards and Premises Standards | I did not review its text; consult legal advice |
| Disability Standards for Accessible Public Transport 2002 | Made under the DDA; amended with effect from 13 October 2026 (https://www.infrastructure.gov.au/infrastructure-transport-vehicles/transport-accessibility/reform-disability-standards-accessible-public-transport-2002-transport-standards) | Applies to operators and providers of public transport; check the instrument for the modes covered | I have not verified whether or how it applies to automated vehicles, rideshare, car parks or community transport. Do not assume it does |
| AS 2890.6:2022, off-street parking for people with disabilities | Australian Standard published 11 November 2022; supersedes AS/NZS 2890.6:2009 (https://store.standards.org.au/reader/as-2890-6-2022?preview=1) | Source for accessible bay, shared area, headroom, bollard and distance concepts used in `BayAccessibility` | Consultants report it is not referenced by the NCC; dimensions quoted in OPMS examples are illustrative, taken from secondary summaries. Check the edition on the approved plans |
| AS 1428.1:2021 (access and mobility, general requirements, new building work); AS/NZS 1428.4.1:2009 (tactile ground surface indicators); AS 1428.4.2 and AS 1428.5 (wayfinding signs; communication for people who are deaf or hearing impaired) | Australian Standards listed in the AS 1428 series (https://store.standards.org.au/reader/as-1428-1-2021?preview=1) | Concepts for accessible paths, tactile indicators, wayfinding signs | The NCC and the Premises Standards (Disability (Access to Premises: Buildings) Standards) call these up for new building work; applicability to existing car parks varies |
| Australian Disability Parking Scheme (ADPS) | National permit and minimum concessions, managed by the states and territories (https://www.health.gov.au/our-work/australian-disability-parking-scheme) | `permit_scheme: adps` on bays and rules | Eligibility in the scheme rests on walking restriction or legal blindness (as stated by Queensland), so it does not cover every access need (for example cognitive or sensory needs without a mobility restriction). OPMS must not treat a permit as the only valid reason to need an accessible route |

## 3. Personas and journeys

These are composite, fictional personas used to test the schema. They are not research findings. A real programme should replace them with co-designed ones.

| Persona | Journey highlights | OPMS data that matters | Risk if the data is missing |
|---|---|---|---|
| **Wheelchair user with a carer** (power chair, high-roof van) | Wants door-to-door step-free drop-off, then the car parks itself and returns | `HandoverZone.accessibility` (kerbside transfer space, kerb ramp, sheltered), `AccessiblePath`, `Lift`, `BayAccessibility.high_roof_van_ok`, `headroom_m` | Dropped at a kerb with no ramp; van cannot enter a garage; stuck at a lift that is out of service |
| **Older driver with limited walking** (ambulant) | Hates circling; needs short walks, seating, good lighting, no steep ramps | `distance_to_accessible_entrance_m`, `rest_points`, `seating_points`, `max_gradient_pct`, `lighting`, `ambulant` bays | Long walks, falls, giving up car use |
| **Parent with pram and toddler** | Needs space to open doors and load, safe route away from moving cars | `family` bays, wider bays, `crossings`, `shared_with_pedestrians`, `help_point` | Child safety risk in aisles; pram cannot reach lift |
| **Community transport driver** (NDIS, patient transport) | Several pick-ups per run, needs ramp or hoist space, short waits, legal places to stand | `community_transport`, `ndis_transport`, `patient_transport` bays; rear ramp and side lift clearance; `wait_time_allowance_s`; `HandoverZone.kind` | Stops on the road, fines, rushed transfers |
| **Courier or delivery driver** | Quick, legal loading close to doors | `courier` and `loading` bays, `max_dwell_s`, curb `Rule`s | Double parking, blocked aisles |
| **Tradie with a large van** | Needs height and width limits before committing | `VehicleLimits`, `Level.clearance_m`, `oversize_van` bays | Wedged under a height bar |
| **Blind or low-vision passenger** | Needs audible and tactile guidance, predictable routes | `tactile_indicators`, `WayfindingAid` (audible, tactile), `assistance_point`, `Lift.audible_announcements`, `braille_buttons` | Disorientation, unsafe vehicle crossings |
| **Autistic or neurodivergent passenger** | Prefers quiet, uncrowded, predictable routes and plenty of time | `low_stimulation_rating`, `extra_time_factor` (on device), `HandoverRequirements.low_stimulation`, clear level colours | Overload, panic, missed appointments |
| **Deaf or hard-of-hearing passenger** | Cannot use voice-only intercoms; needs visual alerts | `Gate.actuation` (not intercom-only), `sensory_support: visual_alerts`, `help_point` | Stuck at a gate with no way to get help |
| **Pregnant person or someone recovering from injury** | Short-term need for close, step-free access | `pregnancy` bays, `accessible_path`, `distance_to_accessible_entrance_m` | Long walks late in pregnancy |
| **Emergency crew** | Needs unobstructed access and known clearances | `emergency_access`, `fire_lane` SafetyFeatures, `emergency_services` bays | Delays reaching a patient |

## 4. Community problems OPMS can help with

| Problem | How OPMS helps | Limits |
|---|---|---|
| Cruising for parking adds traffic and emissions | A static map lets a car go straight to the right zone and entry; accurate access-point and exit data reduces circling at the mouth of a site. A CAICV document cites parking search as a large share of congestion in China's central cities (https://mgr-api.china-icv.cn/profile/upload/2025/03/06/4b153461-7ac9-49ed-879e-297b4eb60b3e.pdf); I have not verified figures for Australia | Static data helps less than live availability for choosing between facilities; OPMS does not require live data |
| Land used for parking | Cars that drop people at the door can use tighter, remote or shared spaces, if authorities and operators choose to redesign | OPMS describes places; it does not change planning rules |
| People who cannot drive or struggle with parking | Door-to-door drop-off and pick-up with accessible handover and routes supports independence | Depends on the car, the law and the provider; no guarantee |
| Pedestrian safety in car parks | `shared_with_pedestrians`, speed limits, crossings, lighting and help-point data inform planning and routing | Does not replace physical design |
| Kerbside space for transport providers | Bays and rules for taxis, rideshare, community and patient transport; CDS-style rules | Rules must come from authorities |
| Regional and suburban equity | `locality_class`, `equity_gap` campaigns and a non-premium coverage target | Needs funding and local partners |
| Emergency access | Fire lanes, clearances and `emergency_access` on access points | Must be verified by emergency services |

## 5. Schema map

| Need | Schema |
|---|---|
| Accessible bay attributes | `Bay.accessibility`, `common#/$defs/BayAccessibility` |
| Step-free routes, lifts, tactile indicators, lighting, shelter, seating | `accessible-path.schema.json`, `lift.schema.json` |
| Drop-off and pick-up zone accessibility | `HandoverZone.accessibility`, `common#/$defs/HandoverAccessibility` |
| Passenger needs (private) and minimal derived requirements | `passenger-needs.schema.json`, `handover-requirements.schema.json` |
| Provider bays | `Bay.bay_types` values (taxi, community_transport, ndis_transport, patient_transport, coach, courier, oversize_van, emergency_services) and `Rule.user_classes` |
| Family, pram, pregnancy, ambulant, carer bays | `Bay.bay_types` |
| Wayfinding | `wayfinding-aid.schema.json` |
| Personal security | `safety-feature.schema.json` |
| Open access to data | `PublicationTerms` on `dataset` |
| Equity | `Site.locality_class`, `Campaign.reason` |

## 6. Privacy of needs

- `PassengerNeeds` is processed on the device only (`storage: on_device`). It never appears in a map dataset, contribution or change set.
- Consent is explicit, scoped and revocable. `derived_requirements_only` allows sending the minimal `HandoverRequirements` object; `on_device_only` sends nothing.
- No diagnosis, condition name or identity appears in either object; the schemas reject extra properties.
- Facilities and planners should treat `HandoverRequirements` as ephemeral: use for the trip, do not retain.

## 7. Co-design and evaluation

1. Recruit a paid advisory group with lived experience across disability types, older people, parents and carers, transport providers and emergency services.
2. Test personas and schema fields against real car parks with the operator's consent, using walk-throughs led by people who use those places.
3. Publish accessibility audits as `audit` records; allow users to report errors; correct fast.
4. Track: share of facilities with accessible bay data and a recent audit; share of verified step-free paths; coverage by `locality_class`; time to correct a reported error; share of datasets open to non-AV use.

## 8. Limits

- OPMS can carry information about accessibility; it cannot make a place accessible or guarantee a vehicle's behaviour.
- The numbers in examples are illustrative and not compliance advice.
- Legal applicability of the frameworks above to automated vehicles and car parks needs legal advice.
- The personas are composites, not research.
