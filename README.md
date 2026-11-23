# OPMS: Open Parking Map Schema (v0.3 draft)

A vendor-neutral data model for cars that **drop you off, park themselves and come back**, and for the **crowdsourced surveying** that keeps those parking maps accurate.

> Status: **v0.3 draft for discussion.** Not published, not endorsed by any vehicle maker, authority or standards body. All example data (Merriwa Park Shopping Centre, Wattle Reserve Office, roads, organisations, prices, coordinates) is **fictional**. v0.3 locates physical features and can record a review of them. It does not include a review tool.

**Project site:** <https://vtml.github.io/open-parking-map-schema/> (static pages in `docs/`).

**Check my car park:** <https://vtml.github.io/open-parking-map-schema/review/> (client-side review tool in `tools/review-app/`, built into `docs/review/`).

## Why

Standards for parking are fragmented. ISO 23374 covers automated valet parking systems, ASAM OpenDRIVE and Lanelet2 describe lanes and parking spaces, APDS covers facility data, the Curb Data Specification covers kerb rules, and OpenStreetMap has parking tags. Nothing joins them into a description of a whole **precinct** (a mall with several car parks, each with several entries and exits), of **level-by-level indoor topology**, or of **how many vehicle makers can survey car parks together** and send the results to the repository that the local jurisdiction requires.

OPMS is a glue layer. It links to Lanelet2, OpenDRIVE, OSM, CDS, APDS and IndoorGML by ID instead of copying them, and adds what is missing.

## Scope

- Street kerbs, surface lots, multi-storey, underground (no GNSS), rooftop, mechanical and robotic parking, private garages, driveways.
- Sites with many complexes: access points tied to public roads (entry, exit or both, turn restrictions, hours, limits, gates, credentials, which levels they serve), links between complexes (with ticket-transfer rules), destinations (stores, cinema, food court, mall doors) mapped to the nearest drop-off or zone.
- Static layout only: levels, ramps, aisles, bays, pillars, entries and exits, gates.
- Crowdsourcing records: contributors, contributions, feature observations, evidence, conflict cases, change sets with tombstones, alignment (anchors, pillar grids), quality tiers and certification, campaigns.
- Human-centred design: accessible bays and paths, lifts, handover accessibility, wayfinding, safety features, on-device passenger needs, open publication terms.
- Governance: jurisdiction and repository routing (including a licensed-unit mode modelled on China's MNR Notice 自然资发〔2024〕139号), licence terms, operator consent, privacy redaction.

**Live space availability is not required.** Occupancy and closures exist only as an optional extension.

## Human-centred design

OPMS is not only a "cool tech" problem. It is meant to support people with diverse needs: wheelchair users, people with vision, hearing, cognitive or neurodivergent needs, ambulant mobility limits, older people, children and families with prams, carers, pregnant people, and transport providers (taxis, rideshare, community and NDIS transport, patient transport, coaches), couriers, tradies with large vans and emergency services. See `HUMAN_CENTRED_DESIGN.md` for principles (co-design with lived experience, accessibility by default, dignity and independence, inclusion of non-AV users, privacy, equity across suburbs and regions), real frameworks to design against (ISO 9241-210, WCAG 2.2, the Disability Discrimination Act 1992 and its Transport Standards, AS 2890.6, AS 1428, the Australian Disability Parking Scheme, each with uncertainty flagged), personas and journeys, community problems, and the schema additions (accessible bays and paths, lifts, handover accessibility, wayfinding, safety features, on-device passenger needs, open publication terms).

## Related work and how OPMS fits

OPMS is meant to be a **complementary open profile**, not a rival to existing work. The closest efforts are:

- **EAVP (Enhancing Automated Valet Parking)**, an ERTICO innovation platform (started 2022; ERTICO lists 10 partners). ERTICO describes three pillars: standardised parking data through APDS, connected parking with traffic circulation planning, and indoor guidance. It describes shared facility maps in **Valeo's MAZE format**, opened to EAVP and the European Parking Association, with a target of 3,000+ mapped facilities and a Salzburg proof of concept planned for late 2026. Sources: https://eavp.eu/ and https://www.ertico.com/what-we-do/platforms-mobility-spaces/eavp and https://www.ertico.com/eavp-at-intertraffic-amsterdam-standardising-connected-parking-services-for-next-generation-cities
- **APDS (Alliance for Parking Data Standards).** APDS 4.1 defines a place hierarchy: Campus (optional), Place, SubplaceElement, IdentifiedArea and (optionally) Space. ERTICO reports that APDS v5 has been finalised; the public API specification I could verify is 4.1. OPMS does **not** build a parallel hierarchy: it links to APDS records through `external_refs.apds_place_id`, `apds_subplace_id`, `apds_identified_area_id` and `apds_space_id`. A proposed mapping (to be validated with APDS): `Site` is an APDS Campus or Place; `Facility` is a Place; `Level` and `Zone` are SubplaceElements or IdentifiedAreas; `Bay` is a Space. Source: https://allianceforparkingdatastandards.org/wp-content/uploads/2026/03/APDS-Information-Model-v4.1-final.pdf
- **ISO/TS 5206-1:2023 (Parking, Part 1: Core data model).** Published technical specification covering on-street and off-street parking concepts for business-to-business exchange and end-user services. OPMS links by `external_refs.iso5206_id`. Source: https://www.iso.org/standard/80997.html
- **China's draft national standard plan 20243535-T-466, 《停车场高精导航地图数据模型与表达》** (parking-lot HD navigation map data model and expression), led by TC230 under the Ministry of Natural Resources; the plan page lists it as out for comment. It covers roads, lanes, road facilities, parking facilities and index points, including parking spaces, areas, floors, pillars and gates. OPMS entities overlap conceptually; a formal mapping is future work. Sources: https://std.samr.gov.cn/gb/search/gbDetailed?id=2ACFE99EA9AFFAE1E06397BE0A0AD0BA and https://std.samr.gov.cn/gb/search/gbDetailed?id=20CD58A3021FAB0AE06397BE0A0AD72B
- **Jiang et al. (2024), "Dynamic indoor mapping for AVP: Crowdsourcing mapping without prior maps", IET Intelligent Transport Systems**, https://doi.org/10.1049/itr2.12578. Research on crowdsourced mapping methods. OPMS does not specify a mapping algorithm; it provides the data envelope (contributions, evidence, alignment records) around such methods.
- **Autoware / Lanelet2 parking extension.** Autoware's `lanelet2_extension` represents a parking lot as an Area with `subtype=parking_lot` and a stall as a LineString with `subtype=parking_space`; Autoware.Auto's AVP demo uses Areas with `subtype=parking_spot` and `parking_access` plus `ref_lanelet` tags. OPMS links by `external_refs.lanelet2_ids`. Sources: https://docs.ros.org/en/ros2_packages/rolling/api/autoware_lanelet2_extension/generated/program_listing_file_include_autoware_lanelet2_extension_utility_query.hpp.html and https://autowarefoundation.gitlab.io/autoware.auto/AutowareAuto/lanelet2-map-for-autoware-auto.html

**What OPMS adds (its distinct contribution):**

1. An **open multi-OEM contribution and merge layer**: contributions, observations, evidence, conflict handling and change sets that work no matter which maker collected the data.
2. A **static-only core profile**: nothing requires live availability.
3. **Quality tiers for driverless use**, with certification and operator consent.
4. **Jurisdiction routing outside Europe**, including Australia and a licensed-unit mode for countries that require it.
5. A **human-centred design lens**: accessibility, wayfinding, personal safety and open data as first-class parts of the model.

**Open questions on fit:** how to interoperate with MAZE (whether and how its specification is available to non-members is not known to me); which APDS v5 classes OPMS should reference once the specification is public; how OPMS maps to the Chinese draft model; whether OPMS should become an APDS extension or stay a separate profile that references it.

## Layers and profiles

| Layer | Contents | Profile |
|---|---|---|
| Static geometry and topology | frames, facilities, levels, zones, bays, drive graph, access points, gates, links, anchors, pillars | `static-core` (default) |
| Site semantics and rules | destinations, portals, handover zones, kerb segments, rules, rates | `static-rules` |
| Dynamic state (optional) | occupancy, closures | `dynamic` |
| Services (optional) | reservations, sessions, missions | `services` (not yet schematised) |

Profiles are cumulative and enforced by `schema/dataset.schema.json`. A consumer must work with `static-core` alone.

## Repository layout

```
README.md  SPEC.md  HUMAN_CENTRED_DESIGN.md  CONTRIBUTING.md  CHANGELOG.md
LICENSE  LICENSE-CC-BY-4.0  LICENSE-APACHE-2.0  NOTICE
docs/       project site and explorer (GitHub Pages, plain HTML)
schema/     JSON Schema (draft 2020-12): one file per object, plus dataset, contribution bundle and registry roots
examples/   fictional examples that validate against the schemas
tools/      validate.py
```

## Quick start

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install jsonschema referencing rfc3339-validator rfc3987
python tools/validate.py
```

The script checks that every schema is valid, every example validates, references between records resolve, and that profile rules reject bad data.

## Licences

- Specification text and documentation (`README.md`, `SPEC.md`, `HUMAN_CENTRED_DESIGN.md`, `CONTRIBUTING.md`, `CHANGELOG.md`): **CC BY 4.0** (`LICENSE-CC-BY-4.0`).
- JSON Schemas, examples and code (`schema/`, `examples/`, `tools/`): **Apache-2.0** (`LICENSE-APACHE-2.0`).
- See `LICENSE` for the summary. The `$id` URLs in the schemas (`opms.example.org`) are placeholders until a permanent home exists.

## How to contribute

Open an issue or a pull request; see `CONTRIBUTING.md`. Useful contributions: review of the entity model, mappings to ISO/TS 22726-1, NDS.Live, OpenDRIVE and IndoorGML, jurisdiction profiles written with local legal advice, real-world checks against actual car parks (with the operator's consent), and schemas for the services layer.

## Status and limits

- v0.3 is a draft; breaking changes are expected before 1.0. See `CHANGELOG.md` for what changed since 0.2, including the `$id` move and required `level_id` on portals and destinations.
- The `services` profile is reserved, not specified.
- Quality-tier numbers and consensus weights are proposals.
- Jurisdiction examples are illustrations, not legal advice.
- Nothing here claims knowledge of any manufacturer's internal systems, and no company has endorsed this work.
