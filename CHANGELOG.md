# Changelog

All notable changes. Versions below 1.0 may include breaking changes.

## 0.2.0 (draft, 2026-11-23)

Added for multi-OEM crowdsourced surveying of static parking layout:

- **Profiles:** `static-core` (default), `static-rules`, `dynamic`, `services`; enforced in `dataset.schema.json`. Live occupancy and closures are optional and out of core.
- **Contribution records** kept separate from the consolidated map: `Contribution`, `FeatureObservation`, `Contributor`, `Campaign`, and a `contribution-bundle` root.
- **Pseudonymous identity:** rotating `vehicle_token` / `session_token` with `pseudonym_epoch`; contributors are organisations only.
- **Evidence block** (`n_observations`, distinct contributors and vehicles, `agreement_score`, `positional_sigma_m`, `status`) on every feature; `lifecycle`, `supersedes`.
- **Conflict handling:** `ConflictCase`, `ResolutionPolicy`.
- **Change detection:** `ChangeSet` with tombstones; informative change-feed API sketch.
- **GNSS-denied alignment:** `AlignmentRecord`, `AnchorFeature`, `PillarGrid`, `Pillar`, `Level.entry_anchor_ids`.
- **Quality:** `QualityTier` (tiers 0 to 3) and `Certification`.
- **Governance:** `Jurisdiction`, `Repository` (including `via_licensed_unit` routing and residency), `LicenceTerms`, `RedactionPolicy`, `ApprovalStatus`, `release_restrictions`; `registry` root.
- **Human-centred design:** `HUMAN_CENTRED_DESIGN.md`; `BayAccessibility`, `AccessiblePath`, `Lift`, `HandoverAccessibility`, `WayfindingAid`, `SafetyFeature`, `PassengerNeeds` (on-device) and `HandoverRequirements`, `PublicationTerms`, `Site.locality_class`; new bay classes (ambulant, carer, pregnancy, taxi, community_transport, ndis_transport, patient_transport, coach, courier, oversize_van, emergency_services); `emergency_access` on access points.
- **Related work:** APDS Place hierarchy reused by reference (`apds_*_id`), `iso5206_id`, `maze_id` (reserved); positioning relative to EAVP, ISO/TS 5206-1, China plan 20243535-T-466, Jiang et al. 2024 and the Autoware Lanelet2 parking extension.
- **Examples:** fictional Merriwa Park mall (three complexes, seven access points), a street segment, a crowdsourced contribution, a change set, an optional dynamic feed and an illustrative AU/CN registry.
- **Tooling:** `tools/validate.py` (schema validity, example validity, reference integrity, profile negative tests).

Changed: root `dataset` now requires `profile`; `Facility` gained `jurisdiction_id`, `approval`, `quality_tier`, `licence`; `Provenance.source` gained `consolidation`.

Not yet done: JSON Schemas for the `services` layer (reservations, sessions, payments, missions, fallback policies, remote assist); mappings to ISO/TS 22726-1, NDS.Live and OpenDRIVE 1.9.

## 0.1.0 (draft, 2026-11-23)

First draft of the entity model (site, facility, level, bay, access points, links, destinations, rules, live occupancy, lifecycle), published only as a private Page. Superseded by 0.2.0.
