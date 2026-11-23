# OPMS data dictionary

Generated from `schema/` by `tools/build_data_dictionary.py`. Do not edit by hand.

This is a **v0.3 draft for discussion**. It is not a published standard and no organisation has endorsed it. Examples are fictional. Validation rules are unchanged by these descriptions.

Fields are grouped in the same order as [SPEC.md](SPEC.md). A type that links to another object is a `$ref` or a nested object.

## 3. Layers and profiles

[SPEC.md section](SPEC.md#3-layers-and-profiles)

### OPMS dataset (consolidated map)

<a id="opms-dataset-consolidated-map"></a>

Root of a consolidated OPMS map for one site. Raw contributions are separate (contribution-bundle).

Schema: [`schema/dataset.schema.json`](schema/dataset.schema.json). [SPEC section](SPEC.md#3-layers-and-profiles).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `_note` | string | optional | — | Free-text note. Used to label fictional example data. Not a map fact. | `"Fictional dataset."` |
| `opms_version` | string | required | — | Schema version. 0.2.x remains valid. 0.3 adds located geometry and verification. | — |
| `dataset_version` | [Version](#version) | required | — | Dataset or change-set version label, e.g. 2026-11-23.1. | — |
| `profile` | [Profile](#profile) | required | — | Cumulative dataset profile. static-core is the default and requires no live data. | — |
| `site` | `site.schema.json` | required | — | Root of a consolidated OPMS map for one site. Raw contributions are separate (contribution-bundle). | — |
| `frames` | array of `frame.schema.json` | required | — | Local frames. | — |
| `facilities` | array of `facility.schema.json` | optional | — | Complexes. | — |
| `zones` | array of `zone.schema.json` | optional | — | Zones. | — |
| `bays` | array of `bay.schema.json` | optional | — | Bays. | — |
| `drive_nodes` | array of `drive-node.schema.json` | optional | — | Drive graph nodes. | — |
| `drive_edges` | array of `drive-edge.schema.json` | optional | — | Drive graph edges. | — |
| `access_points` | array of `access-point.schema.json` | optional | — | Entries and exits. | — |
| `gates` | array of `gate.schema.json` | optional | — | Gates. | — |
| `inter_facility_links` | array of `inter-facility-link.schema.json` | optional | — | Links between complexes. | — |
| `anchor_features` | array of `anchor-feature.schema.json` | optional | — | Alignment anchors. | — |
| `pillar_grids` | array of `pillar-grid.schema.json` | optional | — | Pillar grids. | — |
| `pillars` | array of `pillar.schema.json` | optional | — | Pillars. | — |
| `localization_aids` | array of `localization-aid.schema.json` | optional | — | Fiducials and beacons. | — |
| `destinations` | array of `destination.schema.json` | optional | — | [static-rules] Destinations. | — |
| `pedestrian_portals` | array of `pedestrian-portal.schema.json` | optional | — | [static-rules] Portals. | — |
| `destination_access` | array of `destination-access.schema.json` | optional | — | [static-rules] Destination links. | — |
| `handover_zones` | array of `handover-zone.schema.json` | optional | — | [static-rules] Handover zones. | — |
| `curb_segments` | array of `curb-segment.schema.json` | optional | — | [static-rules] Kerb segments. | — |
| `rules` | array of `rule.schema.json` | optional | — | [static-rules] Rules. | — |
| `rates` | array of `rate.schema.json` | optional | — | [static-rules] Tariffs. | — |
| `certifications` | array of `certification.schema.json` | optional | — | Certifications. | — |
| `lifts` | array of `lift.schema.json` | optional | — | Lifts used on accessible routes. | — |
| `stair_cores` | array of `stair-core.schema.json` | optional | — | Stair cores. Footprint plus the levels they connect. | — |
| `wayfinding_aids` | array of `wayfinding-aid.schema.json` | optional | — | Signs, colours and landmarks people use. | — |
| `safety_features` | array of `safety-feature.schema.json` | optional | — | Lighting, help points and CCTV presence flags. | — |
| `accessible_paths` | array of `accessible-path.schema.json` | optional | — | [static-rules] Step-free routes from bays or drop-offs to portals and destinations. | — |
| `publication` | [PublicationTerms](#publicationterms) | optional | — | How openly the dataset is published so councils, disability organisations and non-AV apps can use it. | — |
| `dynamic` | `dynamic-feed.schema.json` | optional | — | [dynamic profile] Optional live layer. | — |
| `services` | object | optional | — | [services profile] Reservations, sessions and missions. Not yet schematised in v0.2. | — |


## 4. Conventions

[SPEC.md section](SPEC.md#4-conventions)

### Id

<a id="id"></a>

Stable, dotted, lower-case, never reused.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#4-conventions).

### Version

<a id="version"></a>

Dataset or change-set version label, e.g. 2026-11-23.1.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#4-conventions).

### DateTime

<a id="datetime"></a>

RFC 3339 / ISO 8601 with offset.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#4-conventions).

### TimeWindow

<a id="timewindow"></a>

Local-time window in the site's IANA timezone.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#4-conventions).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `days` | array of enum | required | one of: mo, tu, we, th, fr, sa, su, ph | Days the window applies, in the site's timezone. mo Monday, tu Tuesday, we Wednesday, th Thursday, fr Friday, sa Saturday, su Sunday, ph a public holiday in the site's jurisdiction. | `["mo", "tu", "we", "th", "fr"]` |
| `start` | string | required | HH:MM | Local start time, HH:MM, from 00:00 to 23:59. The site's IANA timezone applies. | `"09:00"` |
| `end` | string | required | HH:MM | Local end time, HH:MM. 24:00 means the end of the local day. | `"17:30"` |

### VehicleLimits

<a id="vehiclelimits"></a>

Physical limits. The lowest value along a route wins.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#4-conventions).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `max_height_m` | number | optional | m | Highest vehicle that may pass, in metres. A missing value means the limit is unknown, so an oversize vehicle must not assume it can pass. | `2.1` |
| `max_width_m` | number | optional | m | Widest vehicle that may pass, in metres. | `2.5` |
| `max_length_m` | number | optional | m | Longest vehicle that may pass, in metres. | `5.5` |
| `max_mass_kg` | number | optional | kg | Heaviest vehicle that may pass, in kilograms. | `3500` |
| `vehicle_classes` | array of enum | optional | one of: car, motorcycle, van, light_truck, bus | Vehicle classes allowed. car, motorcycle, van, light_truck, bus. An empty or missing list does not grant access. | `["car", "van"]` |

### ExternalRefs

<a id="externalrefs"></a>

Links to other standards' identifiers instead of copying their geometry.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#4-conventions).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `lanelet2_ids` | array of integer | optional | — | Lanelet2 primitive identifiers this feature corresponds to. Geometry stays in the other map. | `[1204, 1205]` |
| `opendrive` | [object](#externalrefs-opendrive) | optional | — | OpenDRIVE identifiers for the same feature. OPMS does not copy the OpenDRIVE geometry. | — |
| `osm` | array of string | optional | — | OpenStreetMap elements, each node/<id>, way/<id> or relation/<id>. | `["way/123456789"]` |
| `indoorgml_cell` | string | optional | — | IndoorGML cell identifier for this space. | `"cell-level-1-a"` |
| `nds_live_id` | string | optional | — | NDS.Live feature identifier. | `"nds-live-example-1"` |
| `cds_zone_id` | string | optional | — | Curb Data Specification zone identifier. | `"cds-zone-example"` |
| `apds_id` | string | optional | — | APDS identifier when a single id is enough. Prefer the place, subplace, identified-area or space fields when the level is known. | `"apds-example"` |
| `apds_place_id` | string | optional | — | APDS Place id (Place > SubplaceElement > IdentifiedArea > Space hierarchy is reused, not duplicated). | — |
| `apds_subplace_id` | string | optional | — | APDS SubplaceElement id. The APDS hierarchy is referenced, not copied. | `"subplace-example"` |
| `apds_identified_area_id` | string | optional | — | APDS IdentifiedArea id. | `"area-example"` |
| `apds_space_id` | string | optional | — | APDS Space id, typically one bay. | `"space-example"` |
| `maze_id` | string | optional | — | Reserved: identifier in a MAZE facility map (interoperability is an open question). | — |
| `iso5206_id` | string | optional | — | Identifier in an ISO/TS 5206-1 core data model instance. | — |

#### ExternalRefs.opendrive

<a id="externalrefs-opendrive"></a>

OpenDRIVE identifiers for the same feature. OPMS does not copy the OpenDRIVE geometry.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#4-conventions).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `road` | string | optional | — | OpenDRIVE road id. | `"42"` |
| `lane` | integer | optional | — | OpenDRIVE lane id on that road. Sign follows OpenDRIVE (left positive, right negative in the road direction). | `-1` |
| `object` | string | optional | — | OpenDRIVE object id, when the feature is an object rather than a lane. | `"parking-1"` |

### Provenance

<a id="provenance"></a>

Where a fact came from and when it was last confirmed.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#4-conventions).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `source` | enum | required | one of: survey, operator, authority, vehicle_crowd, sensor, import, consolidation | Who produced the fact. survey: a deliberate survey. operator: the car-park operator. authority: a public authority. vehicle_crowd: many vehicles. sensor: a fixed sensor. import: copied from another dataset. consolidation: the repository's merged result. | `"survey"` |
| `observed_at` | [DateTime](#datetime) | required | — | RFC 3339 / ISO 8601 with offset. | — |
| `confidence` | number | optional | — | Producer's confidence, from 0 (none) to 1 (certain). This is not the evidence agreement score. | `0.8` |
| `contribution_ids` | array of [Id](#id) | optional | — | Contributions that support this record (crowdsourced features). | — |
| `change_set_id` | [Id](#id) | optional | — | Change set that last touched this record. | — |

### Lifecycle

<a id="lifecycle"></a>

Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#4-conventions).

Allowed values: `active`, `superseded`, `retired`.

### Profile

<a id="profile"></a>

Cumulative dataset profile. static-core is the default and requires no live data.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#4-conventions).

Allowed values: `static-core`, `static-rules`, `dynamic`, `services`.


## 4.1 Located geometry and verification

[SPEC.md section](SPEC.md#41-located-geometry-and-verification-v03)

### LocalPoint

<a id="localpoint"></a>

[x, y, z] metres in the facility frame (x east, y north, z up).

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#41-located-geometry-and-verification-v03).

### LocalPolygon

<a id="localpolygon"></a>

Corners in the facility frame, counter-clockwise. At least four points. The ring need not repeat the first point. z is the elevation of the level.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#41-located-geometry-and-verification-v03).

### Geometry

<a id="geometry"></a>

Geometry in a local frame. Coordinates are LocalPoints.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#41-located-geometry-and-verification-v03).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `type` | enum | required | one of: Point, LineString, Polygon | Geometry kind in the facility frame. Point: one position. LineString: an ordered path. Polygon: a counter-clockwise ring. The ring need not repeat the first point. | `"Polygon"` |
| `coordinates` | array of [LocalPoint](#localpoint) | required | — | Positions as LocalPoint values, metres in the facility frame (x east, y north, z up). | `[[0, 0, 0], [10, 0, 0], [10, 8, 0], [0, 8, 0]]` |
| `sigma_m` | number | optional | m | 1-sigma horizontal position uncertainty. | — |

### Verification

<a id="verification"></a>

One check of a feature against the real place. Stores the review, not the evidence file. No personal data.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#41-located-geometry-and-verification-v03).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `role` | enum | required | one of: owner, operator, authority, crowd | Reviewer role. An organisation role, not a person's name. | — |
| `status` | enum | required | one of: confirmed, incorrect, missing, not-checked | confirmed: matches the place. incorrect: the record is wrong. missing: not there on the ground. not-checked: explicitly skipped. | — |
| `note` | string | optional | — | Short note. No names, plates or diagnoses. | — |
| `evidence_ref` | string | optional | — | Pointer to evidence kept outside the map (audit id or URL). Not the evidence itself. | — |
| `reviewed_at` | [DateTime](#datetime) | required | — | When the review was made. | — |
| `dataset_version` | [Version](#version) | required | — | Dataset version the reviewer looked at. | — |

### Review

<a id="review"></a>

Standalone sign-off of one dataset version. Not part of the map. A future review tool writes this document; v0.3 only defines its shape.

Schema: [`schema/review.schema.json`](schema/review.schema.json). [SPEC section](SPEC.md#41-located-geometry-and-verification-v03).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `_note` | string | optional | — | Free-text note. Used to label fictional example data. Not a review result. | `"Fictional review."` |
| `opms_version` | string | required | — | Schema version. | — |
| `id` | [Id](#id) | required | — | Review id. | — |
| `dataset_id` | [Id](#id) | required | — | Site id of the dataset reviewed. | — |
| `dataset_version` | [Version](#version) | required | — | Dataset version reviewed. | — |
| `reviewer_role` | enum | required | one of: owner, operator, authority, crowd | Role of the reviewing organisation. | — |
| `reviewer_ref` | string | optional | — | Organisation label. Not a person's name. | — |
| `reviewed_at` | [DateTime](#datetime) | required | — | When the sign-off was made. | — |
| `sign_off` | [object](#review-sign-off) | optional | — | Overall result. Partial means some entries are not confirmed. | — |
| `entries` | array of [object](#review-entries) | required | — | Per-feature results. feature_id is the id in the dataset. | — |

#### Review.sign_off

<a id="review-sign-off"></a>

Overall result. Partial means some entries are not confirmed.

Schema: [`schema/review.schema.json`](schema/review.schema.json). [SPEC section](SPEC.md#41-located-geometry-and-verification-v03).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `status` | enum | required | one of: accepted, rejected, partial | Overall sign-off. | — |
| `note` | string | optional | — | Short note. No personal data. | — |

#### Review.entries item

<a id="review-entries"></a>

Schema: [`schema/review.schema.json`](schema/review.schema.json). [SPEC section](SPEC.md#41-located-geometry-and-verification-v03).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `feature_id` | [Id](#id) | required | — | Feature reviewed. | — |
| `role` | enum | required | one of: owner, operator, authority, crowd | Reviewer role for this entry. | — |
| `status` | enum | required | one of: confirmed, incorrect, missing, not-checked | Result for this feature. | — |
| `note` | string | optional | — | Short note on this feature. No names, plates or diagnoses. | `"Threshold matches the painted line."` |
| `evidence_ref` | string | optional | — | Pointer to external evidence. | — |
| `reviewed_at` | [DateTime](#datetime) | required | — | RFC 3339 / ISO 8601 with offset. | — |
| `dataset_version` | [Version](#version) | required | — | Dataset or change-set version label, e.g. 2026-11-23.1. | — |


## 5. Static entities

[SPEC.md section](SPEC.md#5-static-entities)

### Site

<a id="site"></a>

A precinct containing facilities, destinations and handover zones.

Schema: [`schema/site.schema.json`](schema/site.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Site id. | — |
| `name` | string | required | — | Display name. | — |
| `kind` | enum | required | one of: shopping_centre, airport, hospital, campus, residential, office, event_venue, street_precinct | Precinct type. | — |
| `timezone` | string | required | — | IANA timezone; all time windows are local to it. | — |
| `ticket_scope` | enum | optional | one of: facility, site | Whether one ticket works across complexes by default. | — |
| `facility_ids` | array of [Id](#id) | required | — | Complexes in the precinct. | — |
| `jurisdiction_id` | [Id](#id) | optional | — | Jurisdiction whose repository and rules govern this site. | — |
| `locality_class` | enum | optional | one of: metro_premium, metro_suburban, regional, rural | Used to measure equity of coverage across suburbs and regions, not only premium sites. | — |
| `boundary` | [object](#site-boundary) | optional | — | Precinct outline in one facility frame. Not tied to a level. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

#### Site.boundary

<a id="site-boundary"></a>

Precinct outline in one facility frame. Not tied to a level.

Schema: [`schema/site.schema.json`](schema/site.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `frame_id` | [Id](#id) | required | — | Frame the polygon uses. | — |
| `polygon` | [LocalPolygon](#localpolygon) | required | — | Site boundary. | — |

### Frame

<a id="frame"></a>

Local Cartesian facility frame anchored to WGS84.

Schema: [`schema/frame.schema.json`](schema/frame.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Frame id. | — |
| `origin_wgs84` | [object](#frame-origin-wgs84) | required | — | Frame origin on WGS84. | — |
| `x_axis_bearing_deg` | number | required | degrees | Bearing of the local x axis, clockwise from true north. | — |
| `anchor_accuracy_m` | number | optional | m | 1-sigma accuracy of the anchoring. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

#### Frame.origin_wgs84

<a id="frame-origin-wgs84"></a>

Frame origin on WGS84.

Schema: [`schema/frame.schema.json`](schema/frame.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `lat` | number | required | degrees | Latitude of the frame origin, WGS84 degrees, from -90 to 90. | `-37.81` |
| `lon` | number | required | degrees | Longitude of the frame origin, WGS84 degrees, from -180 to 180. | `144.97` |
| `h_ellipsoid_m` | number | required | m | Ellipsoidal height of the frame origin, WGS84, in metres. | `28.4` |

### Facility

<a id="facility"></a>

A parking complex.

Schema: [`schema/facility.schema.json`](schema/facility.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Facility id. | — |
| `site_id` | [Id](#id) | required | — | Parent site. | — |
| `name` | string | optional | — | Display name. | — |
| `type` | enum | required | one of: surface_lot, multi_storey, underground, rooftop, mechanical_stacker, robotic, private_garage, driveway, on_street_block | Facility type. | — |
| `frame_id` | [Id](#id) | required | — | Local frame used by all geometry in the facility. | — |
| `levels` | array of `level.schema.json` | required | — | Levels ordered by ordinal. | — |
| `gnss` | enum | optional | one of: good, degraded, none | Worst GNSS quality across levels. | — |
| `capacity` | integer | optional | — | Total bays. | — |
| `operating_hours` | array of [TimeWindow](#timewindow) | optional | — | When vehicles may enter. | — |
| `exit_hours` | array of [TimeWindow](#timewindow) | optional | — | When vehicles may leave, if different. | — |
| `rate_id` | [Id](#id) | optional | — | Default tariff (static-rules profile). | — |
| `jurisdiction_id` | [Id](#id) | optional | — | Jurisdiction; overrides the site's if set. | — |
| `approval` | [ApprovalStatus](#approvalstatus) | optional | — | Facility owner or operator consent for mapping and use. | — |
| `quality_tier` | [QualityTier](#qualitytier) | optional | — | Declared quality for a facility or feature. Cars map their ODD to a minimum tier. Tier 2 and tier 3 are owner-verified or higher: the facility must include a verification with role owner, status confirmed, and dataset_version equal to the dataset version. The verification does not raise the tier by itself. It is required before those tiers may be declared. Drive edges and accessible paths on an owner-verified facility must carry a centreline. | — |
| `licence` | [LicenceTerms](#licenceterms) | optional | — | Usage terms for a dataset, feature or contribution. | — |
| `release_restrictions` | array of enum | optional | one of: no_public_release, authority_only, tier_gated, licensed_unit_only | Release restrictions. | — |
| `avp` | [object](#facility-avp) | optional | — | Optional AVP service description (services profile; advisory otherwise). | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

#### Facility.avp

<a id="facility-avp"></a>

Optional AVP service description (services profile; advisory otherwise).

Schema: [`schema/facility.schema.json`](schema/facility.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `iso23374_type` | enum | required | one of: 1, 2, 3 | ISO 23374 automated valet parking system type: 1, 2 or 3. OPMS stores the type number and does not redefine those types. The vehicle-to-facility protocol is out of scope. | `1` |
| `handover_zone_ids` | array of [Id](#id) | optional | — | Handover zones. | — |
| `capabilities` | array of enum | optional | one of: bay_assignment, remote_gate_open, infra_perception, occupancy_feed, reservation, remote_assist | Capabilities. | — |
| `endpoint` | string | optional | URI | URI of the facility's AVP service endpoint, if one is published. | `"https://example.org/avp"` |

### Level

<a id="level"></a>

A floor of a facility.

Schema: [`schema/level.schema.json`](schema/level.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Level id. | — |
| `ordinal` | integer | required | — | 0 = ground; negative below ground. Ordering only. | — |
| `label` | string | required | — | As signed: G, L1, B2, Roof. | — |
| `elevation_m` | number | required | m | Floor height in the facility frame. | — |
| `clearance_m` | number | optional | m | Lowest headroom. | — |
| `open_air` | boolean | optional | — | Rooftop or surface. | — |
| `gnss` | enum | optional | one of: good, degraded, none | GNSS quality on this level. | — |
| `entry_anchor_ids` | array of [Id](#id) | optional | — | AnchorFeatures that tie this level's local geometry back to a GNSS-visible reference. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### Zone

<a id="zone"></a>

A painted area of bays.

Schema: [`schema/zone.schema.json`](schema/zone.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Zone id. | — |
| `level_id` | [Id](#id) | required | — | Parent level. | — |
| `name` | string | required | — | Signed name, e.g. Blue C. | — |
| `bay_types` | array of [Id](#id) | optional | — | Optional hint of dominant bay classes (free ids such as ev, accessible). | — |
| `polygon` | [LocalPolygon](#localpolygon) | optional | — | Painted area in the facility frame. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### Bay

<a id="bay"></a>

A single parking space.

Schema: [`schema/bay.schema.json`](schema/bay.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Bay id. | — |
| `zone_id` | [Id](#id) | required | — | Parent zone. | — |
| `polygon` | array of [LocalPoint](#localpoint) | required | — | Four corners, counter-clockwise, in the facility frame. | — |
| `orientation` | enum | required | one of: parallel, angle, perpendicular, stacker_platform, robot_pallet | Bay orientation. | — |
| `angle_deg` | number | optional | degrees | Angle for angle parking; 90 for perpendicular. | — |
| `approach_edge` | integer | optional | — | Polygon edge the vehicle enters through. | — |
| `bay_types` | array of enum | required | one of: general, accessible, ambulant, carer, ev, family, pregnancy, motorcycle, compact, reserved, tenant, permit, loading, rideshare, taxi, community_transport, ndis_transport, patient_transport, coach, courier, oversize_van, emergency_services, valet, staff | Bay classes. | — |
| `ev` | [object](#bay-ev) | optional | — | EV charging details. | — |
| `painted_label` | string | optional | — | Text on the ground. | — |
| `rule_ids` | array of [Id](#id) | optional | — | Eligibility and time limits (static-rules profile). | — |
| `accessibility` | [BayAccessibility](#bayaccessibility) | optional | — | Accessible-bay attributes. Dimensions are as built; standard_ref says what the facility was designed or audited against. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

#### Bay.ev

<a id="bay-ev"></a>

EV charging details.

Schema: [`schema/bay.schema.json`](schema/bay.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `connector` | enum | optional | one of: ccs2, type2, chademo, nacs | Charging connector. ccs2: Combined Charging System Type 2. type2: IEC Type 2 AC. chademo: CHAdeMO DC. nacs: North American Charging Standard. | `"ccs2"` |
| `power_kw` | number | optional | kW | Rated charging power, in kilowatts. | `150` |
| `charger_id` | string | optional | — | Operator's identifier for this charger. Not a vehicle identifier. | `"charger-12"` |

### DriveNode

<a id="drivenode"></a>

A node of the directed drivable graph.

Schema: [`schema/drive-node.schema.json`](schema/drive-node.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Node id. | — |
| `level_id` | [Id](#id) | required | — | Level (or the id of the facility for external nodes). | — |
| `position` | [LocalPoint](#localpoint) | required | — | [x, y, z] metres in the facility frame (x east, y north, z up). | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### DriveEdge

<a id="driveedge"></a>

A directed drivable segment: aisle, ramp, level transition or internal road.

Schema: [`schema/drive-edge.schema.json`](schema/drive-edge.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Edge id. | — |
| `from_node` | [Id](#id) | required | — | Start node. | — |
| `to_node` | [Id](#id) | required | — | End node. Two-way aisles are two edges. | — |
| `kind` | enum | required | one of: aisle, ramp, level_transition, access_lane, internal_road, inter_facility, lift, turntable | Edge kind. | — |
| `level_id` | [Id](#id) | optional | — | Level the edge lies on (start level for ramps). | — |
| `centreline` | array of [LocalPoint](#localpoint) | optional | — | Polyline in the facility frame. Optional at quality tier 0 and 1. Required, with at least two points, when the edge is owner-verified or its facility tier is 2 or 3. | — |
| `width_m` | number | optional | m | Drivable width. | — |
| `speed_limit_kmh` | number | optional | — | Signed speed limit. | — |
| `limits` | [VehicleLimits](#vehiclelimits) | optional | — | Physical limits. The lowest value along a route wins. | — |
| `ramp` | [object](#driveedge-ramp) | optional | — | Ramp geometry. | — |
| `turn_restrictions` | array of [object](#driveedge-turn-restrictions) | optional | — | Banned next edges. | — |
| `bay_ids` | array of [Id](#id) | optional | — | Bays reachable from this edge. | — |
| `shared_with_pedestrians` | boolean | optional | — | Pedestrian priority area. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

#### DriveEdge.ramp

<a id="driveedge-ramp"></a>

Ramp geometry.

Schema: [`schema/drive-edge.schema.json`](schema/drive-edge.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `form` | enum | optional | one of: straight, helical, split_level, spiral_double | Ramp shape. straight, helical, split_level (short ramps between split floors), or spiral_double (two helices). | `"straight"` |
| `gradient_pct` | number | optional | percent | Longitudinal gradient of the ramp, in percent. Positive uphill in the edge's forward direction. | `12` |
| `inner_radius_m` | number | optional | m | Inside radius of a curved ramp, in metres. | `8` |

#### DriveEdge.turn_restrictions item

<a id="driveedge-turn-restrictions"></a>

Schema: [`schema/drive-edge.schema.json`](schema/drive-edge.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `banned_next_edge` | [Id](#id) | required | — | Stable, dotted, lower-case, never reused. | — |
| `when` | array of [TimeWindow](#timewindow) | optional | — | When. | — |

### AccessPoint

<a id="accesspoint"></a>

A vehicle entry, exit or both, tied to a public road.

Schema: [`schema/access-point.schema.json`](schema/access-point.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Access point id. | — |
| `facility_id` | [Id](#id) | required | — | Complex it serves. | — |
| `role` | enum | required | one of: entry, exit, both | Direction of use. | — |
| `position` | [LocalPoint](#localpoint) | optional | — | [x, y, z] metres in the facility frame (x east, y north, z up). | — |
| `road_link` | [object](#accesspoint-road-link) | required | — | Public road it connects to. | — |
| `movements_in` | array of enum | conditional | one of: left_in, right_in, straight_in | Allowed entry movements. | — |
| `movements_out` | array of enum | conditional | one of: left_out, right_out, straight_out | Allowed exit movements. | — |
| `served_level_ids` | array of [Id](#id) | optional | — | Levels reachable without leaving. | — |
| `served_zone_ids` | array of [Id](#id) | optional | — | Zones reachable without leaving. | — |
| `hours` | array of [TimeWindow](#timewindow) | optional | — | Opening hours. | — |
| `limits` | [VehicleLimits](#vehiclelimits) | optional | — | Physical limits. The lowest value along a route wins. | — |
| `credentials` | array of enum | optional | one of: ticket, lpr, app, tap_card, rfid, permit, intercom, none | Accepted credentials. | — |
| `gate_ids` | array of [Id](#id) | optional | — | One per lane. | — |
| `queue_capacity_veh` | integer | optional | — | Stacking space before blocking the road. | — |
| `emergency_access` | [object](#accesspoint-emergency-access) | optional | — | Emergency vehicle access. | — |
| `level_id` | [Id](#id) | optional | — | Level the threshold sits on. | — |
| `threshold` | array of [LocalPoint](#localpoint) | optional | — | Gate line or threshold segment in the facility frame, at least two points. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

#### AccessPoint.road_link

<a id="accesspoint-road-link"></a>

Public road it connects to.

Schema: [`schema/access-point.schema.json`](schema/access-point.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `road_name` | string | required | — | Name of the public road this access joins, as it is signed. | `"Wattle Street"` |
| `intersection_id` | [Id](#id) | optional | — | Stable, dotted, lower-case, never reused. | — |
| `approach_bearing_deg` | number | optional | degrees | Compass bearing of the vehicle approach, degrees clockwise from true north. | `90` |
| `signalised` | boolean | optional | — | True when the junction with the public road has traffic signals. | `false` |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |

#### AccessPoint.emergency_access

<a id="accesspoint-emergency-access"></a>

Emergency vehicle access.

Schema: [`schema/access-point.schema.json`](schema/access-point.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `fire_brigade_access` | boolean | optional | — | True when fire appliances can use this access. | `true` |
| `ambulance_clearance_m` | number | optional | m | Clearance kept for an ambulance, in metres. | `3.5` |
| `emergency_override` | boolean | optional | — | True when an emergency vehicle can override a gate or barrier here. | `true` |

### Gate

<a id="gate"></a>

Boom gate, roller door, bollard, barrier or open lane.

Schema: [`schema/gate.schema.json`](schema/gate.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Gate id. | — |
| `host_id` | [Id](#id) | required | — | AccessPoint or InterFacilityLink the gate belongs to. | — |
| `kind` | enum | required | one of: boom_gate, roller_door, bollard, open_lane, turnstile, barrier | Gate kind. | — |
| `direction` | enum | optional | one of: in, out, both | Lane direction. | — |
| `actuation` | array of enum | optional | one of: ticket, lpr, app, tap_card, remote_open, intercom, manual, none | How it opens. | — |
| `limits` | [VehicleLimits](#vehiclelimits) | optional | — | Physical limits. The lowest value along a route wins. | — |
| `level_id` | [Id](#id) | optional | — | Level the gate or barrier sits on. | — |
| `position` | [LocalPoint](#localpoint) | optional | — | A point on the gate, if a segment is not given. | — |
| `threshold` | array of [LocalPoint](#localpoint) | optional | — | Gate line or threshold segment in the facility frame, at least two points. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### InterFacilityLink

<a id="interfacilitylink"></a>

A tunnel, bridge, ramp or internal road between two facilities.

Schema: [`schema/inter-facility-link.schema.json`](schema/inter-facility-link.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Link id. | — |
| `from` | [Id](#id) | required | — | DriveNode in the first facility. | — |
| `to` | [Id](#id) | required | — | DriveNode in the second facility. | — |
| `kind` | enum | required | one of: tunnel, bridge, internal_ramp, internal_road, public_road | Link kind. | — |
| `direction` | enum | required | one of: one_way_forward, one_way_reverse, two_way | Direction. | — |
| `ticket_transfer` | [object](#interfacilitylink-ticket-transfer) | required | — | Whether a ticket or session carries across. | — |
| `limits` | [VehicleLimits](#vehiclelimits) | optional | — | Physical limits. The lowest value along a route wins. | — |
| `hours` | array of [TimeWindow](#timewindow) | optional | — | Hours. | — |
| `level_id` | [Id](#id) | optional | — | Level at the start of the link, when a single level applies. End levels remain on the nodes. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

#### InterFacilityLink.ticket_transfer

<a id="interfacilitylink-ticket-transfer"></a>

Whether a ticket or session carries across.

Schema: [`schema/inter-facility-link.schema.json`](schema/inter-facility-link.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `allowed` | boolean | required | — | True when a ticket or parking session remains valid after the vehicle uses this link. | `true` |
| `conditions` | string | optional | — | Conditions for carrying the ticket or session across, in plain language. | `"Same operator, within 15 minutes."` |
| `gate_id` | [Id](#id) | optional | — | Stable, dotted, lower-case, never reused. | — |

### LocalizationAid

<a id="localizationaid"></a>

Fiducial, beacon or landmark for GNSS-denied localisation.

Schema: [`schema/localization-aid.schema.json`](schema/localization-aid.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Aid id. | — |
| `level_id` | [Id](#id) | required | — | Level. | — |
| `kind` | enum | required | one of: apriltag, aruco, ble_beacon, uwb_anchor, pillar_label, painted_marker, surveyed_landmark | Aid kind. | — |
| `code` | string | optional | — | Tag ID, beacon UUID/major/minor or label text. | — |
| `pose` | [object](#localizationaid-pose) | required | — | Where the aid is, and which way it faces, in the facility frame. | — |
| `accuracy_m` | number | optional | m | 1-sigma accuracy. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

#### LocalizationAid.pose

<a id="localizationaid-pose"></a>

Where the aid is, and which way it faces, in the facility frame.

Schema: [`schema/localization-aid.schema.json`](schema/localization-aid.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `position` | [LocalPoint](#localpoint) | required | — | [x, y, z] metres in the facility frame (x east, y north, z up). | — |
| `yaw_deg` | number | optional | degrees | Heading of the aid, degrees clockwise from the frame's north (+y) axis. | `180` |

### AnchorFeature

<a id="anchorfeature"></a>

A distinctive feature used to align contributions and tie levels to the global frame.

Schema: [`schema/anchor-feature.schema.json`](schema/anchor-feature.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Anchor id. | — |
| `level_id` | [Id](#id) | required | — | Level. | — |
| `kind` | enum | required | one of: ramp_head, gate_line, pillar_corner, level_transition, wall_corner, surveyed_target, lift_door | Anchor kind. | — |
| `anchor_class` | enum | required | one of: surveyed, crowd_derived | How the anchor position was obtained. | — |
| `position` | [LocalPoint](#localpoint) | required | — | [x, y, z] metres in the facility frame (x east, y north, z up). | — |
| `accuracy_m` | number | optional | m | 1-sigma accuracy. | — |
| `gnss_visible` | boolean | optional | — | Anchor is reachable by GNSS (for example at a ramp mouth). | — |
| `localization_aid_id` | [Id](#id) | optional | — | Optional fiducial co-located with the anchor. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### PillarGrid

<a id="pillargrid"></a>

A regular pillar grid, useful as a strong alignment constraint.

Schema: [`schema/pillar-grid.schema.json`](schema/pillar-grid.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Grid id. | — |
| `level_id` | [Id](#id) | required | — | Level. | — |
| `origin` | [LocalPoint](#localpoint) | required | — | [x, y, z] metres in the facility frame (x east, y north, z up). | — |
| `spacing_x_m` | number | required | m | Column spacing along grid x. | — |
| `spacing_y_m` | number | required | m | Row spacing along grid y. | — |
| `bearing_deg` | number | optional | degrees | Grid x axis bearing in the facility frame. | — |
| `x_labels` | array of string | optional | — | Painted column labels. | — |
| `y_labels` | array of string | optional | — | Painted row labels. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### Pillar

<a id="pillar"></a>

A structural pillar: obstacle and alignment landmark.

Schema: [`schema/pillar.schema.json`](schema/pillar.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Pillar id. | — |
| `level_id` | [Id](#id) | required | — | Level. | — |
| `grid_id` | [Id](#id) | optional | — | Parent grid, if regular. | — |
| `grid_ref` | [object](#pillar-grid-ref) | optional | — | Column and row of this pillar in its pillar grid. Integers, origin chosen by the grid. | — |
| `position` | [LocalPoint](#localpoint) | required | — | [x, y, z] metres in the facility frame (x east, y north, z up). | — |
| `shape` | enum | required | one of: rect, round | Shape. | — |
| `width_m` | number | optional | m | Width or diameter. | — |
| `depth_m` | number | optional | m | Depth for rectangular pillars. | — |
| `painted_label` | string | optional | — | Label on the pillar. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

#### Pillar.grid_ref

<a id="pillar-grid-ref"></a>

Column and row of this pillar in its pillar grid. Integers, origin chosen by the grid.

Schema: [`schema/pillar.schema.json`](schema/pillar.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `col` | integer | required | — | Column index in the pillar grid. | `3` |
| `row` | integer | required | — | Row index in the pillar grid. | `2` |

### Lift

<a id="lift"></a>

A lift on an accessible route.

Schema: [`schema/lift.schema.json`](schema/lift.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Lift id. | — |
| `level_ids` | array of [Id](#id) | required | — | Levels served. | — |
| `kind` | enum | required | one of: passenger, goods, platform | Kind. | — |
| `car_width_m` | number | optional | m | Car width. | — |
| `car_depth_m` | number | optional | m | Car depth. | — |
| `door_width_m` | number | optional | m | Clear door width. | — |
| `audible_announcements` | boolean | optional | — | Floor announcements. | — |
| `braille_buttons` | boolean | optional | — | Braille or tactile buttons. | — |
| `hours` | array of [TimeWindow](#timewindow) | optional | — | Operating hours. | — |
| `status_feed_uri` | string | optional | URI | OPTIONAL live status feed; not required. | — |
| `footprint` | [LocalPolygon](#localpolygon) | optional | — | Shaft footprint in the facility frame. The same outline applies on each served level. z is the lowest served level. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### StairCore

<a id="staircore"></a>

A stair or stair core. Footprint is in the facility frame. level_ids are the levels it connects.

Schema: [`schema/stair-core.schema.json`](schema/stair-core.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Stair-core id. | — |
| `level_ids` | array of [Id](#id) | required | — | Levels served. | — |
| `kind` | enum | optional | one of: stairs, stair_core | Kind. | — |
| `footprint` | [LocalPolygon](#localpolygon) | required | — | Footprint in the facility frame. z is the lowest served level. | — |
| `step_free` | boolean | optional | — | False for a stair. A stair is not an accessible route. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### WayfindingAid

<a id="wayfindingaid"></a>

Signs, level colours and landmarks people use to find their car and the way out.

Schema: [`schema/wayfinding-aid.schema.json`](schema/wayfinding-aid.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Aid id. | — |
| `level_id` | [Id](#id) | required | — | Level. | — |
| `kind` | enum | required | one of: sign, level_colour, level_name, zone_colour, landmark, floor_marking, audio_beacon, tactile_map | Kind. | — |
| `label` | string | optional | — | As signed. | — |
| `colour` | string | optional | — | Colour name used by the facility, e.g. Orange. | — |
| `description` | string | optional | — | Plain-language description people actually use, e.g. next to the red lift. | — |
| `position` | [LocalPoint](#localpoint) | optional | — | [x, y, z] metres in the facility frame (x east, y north, z up). | — |
| `audible` | boolean | optional | — | Audio cue. | — |
| `braille` | boolean | optional | — | Braille. | — |
| `tactile` | boolean | optional | — | Tactile. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### SafetyFeature

<a id="safetyfeature"></a>

Personal-security and safety features.

Schema: [`schema/safety-feature.schema.json`](schema/safety-feature.schema.json). [SPEC section](SPEC.md#5-static-entities).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Feature id. | — |
| `level_id` | [Id](#id) | required | — | Level. | — |
| `kind` | enum | required | one of: help_point, cctv, lighting_zone, duress_button, staffed_booth, emergency_exit, fire_lane, security_patrol | Kind. | — |
| `position` | [LocalPoint](#localpoint) | optional | — | [x, y, z] metres in the facility frame (x east, y north, z up). | — |
| `lighting_level` | enum | optional | one of: poor, adequate, good | Lighting quality. | — |
| `cctv_present` | boolean | optional | — | Flag only. No camera feeds or footage are described by OPMS. | — |
| `staffed_hours` | array of [TimeWindow](#timewindow) | optional | — | Staffed hours. | — |
| `contact_ref` | string | optional | — | How to reach help (organisation role or number reference). | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |


## 6. Site semantics

[SPEC.md section](SPEC.md#6-site-semantics-profile-static-rules)

### PedestrianPortal

<a id="pedestrianportal"></a>

A door, lift lobby or stair a person walks through.

Schema: [`schema/pedestrian-portal.schema.json`](schema/pedestrian-portal.schema.json). [SPEC section](SPEC.md#6-site-semantics-profile-static-rules).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Portal id. | — |
| `kind` | enum | required | one of: mall_door, lift_lobby, stairs, escalator, bridge, terminal_door, ward_entrance | Portal kind. | — |
| `level_label` | string | optional | — | Display text only, as signed on the pedestrian side. Not a reference. The level is level_id. | — |
| `position` | [LocalPoint](#localpoint) | optional | — | [x, y, z] metres in the facility frame (x east, y north, z up). | — |
| `step_free` | boolean | optional | — | Step-free. | — |
| `hours` | array of [TimeWindow](#timewindow) | optional | — | Hours. | — |
| `level_id` | [Id](#id) | required | — | Parking level this door, lobby or stair opens onto. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### Destination

<a id="destination"></a>

Where passengers are going.

Schema: [`schema/destination.schema.json`](schema/destination.schema.json). [SPEC section](SPEC.md#6-site-semantics-profile-static-rules).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Destination id. | — |
| `kind` | enum | required | one of: store, cinema, food_court, supermarket, mall_door, lift_lobby, terminal, hospital_entrance, emergency_dept, residence | Destination kind. | — |
| `name` | string | required | — | Display name. | — |
| `level_label` | string | optional | — | Display text only, as signed. Not a reference. The level is level_id. | — |
| `portal_ids` | array of [Id](#id) | required | — | Doors people use to reach it. | — |
| `hours` | array of [TimeWindow](#timewindow) | optional | — | Opening hours. | — |
| `level_id` | [Id](#id) | required | — | Parking level that serves this destination. | — |
| `position` | [LocalPoint](#localpoint) | optional | — | A point for the destination in the facility frame. | — |
| `polygon` | [LocalPolygon](#localpolygon) | optional | — | Optional footprint of the destination. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### DestinationAccess

<a id="destinationaccess"></a>

Link between a destination and where a car can leave the passenger or park.

Schema: [`schema/destination-access.schema.json`](schema/destination-access.schema.json). [SPEC section](SPEC.md#6-site-semantics-profile-static-rules).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `destination_id` | [Id](#id) | required | — | Destination. | — |
| `via` | enum | required | one of: handover_zone, zone, portal | What target_id refers to. | — |
| `target_id` | [Id](#id) | required | — | Zone, handover zone or portal. | — |
| `walk_time_s` | number | required | s | Typical walking time. | — |
| `walk_distance_m` | number | optional | m | Walking distance. | — |
| `step_free` | boolean | optional | — | Step-free. | — |
| `covered` | boolean | optional | — | Covered from weather. | — |
| `accessible_path_id` | [Id](#id) | optional | — | AccessiblePath describing the step-free route, if one exists. | — |
| `assistance_available` | boolean | optional | — | Staff or an assistance point can help at the handover. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### HandoverZone

<a id="handoverzone"></a>

Drop-off, pick-up, valet, ride-share or taxi zone.

Schema: [`schema/handover-zone.schema.json`](schema/handover-zone.schema.json). [SPEC section](SPEC.md#6-site-semantics-profile-static-rules).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Zone id. | — |
| `kind` | enum | required | one of: drop_off, pick_up, both, valet, rideshare, taxi, loading | Kind. | — |
| `location_id` | [Id](#id) | required | — | Level id for in-facility zones or CurbSegment id for kerbside zones. | — |
| `capacity_veh` | integer | optional | — | Vehicles that can stand at once. | — |
| `max_dwell_s` | integer | optional | s | Allowed standing time. | — |
| `iso23374_handover` | boolean | optional | — | Valid ISO 23374 AVP handover area. | — |
| `rule_ids` | array of [Id](#id) | optional | — | Rules. | — |
| `accessibility` | [HandoverAccessibility](#handoveraccessibility) | optional | — | Accessibility of a drop-off or pick-up zone. | — |
| `level_id` | [Id](#id) | optional | — | Level of an in-facility drop-off, handover or pick-up zone. Omit for a kerbside zone whose location_id is a curb segment. | — |
| `polygon` | [LocalPolygon](#localpolygon) | optional | — | Standing area in the facility frame. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### CurbSegment

<a id="curbsegment"></a>

A length of kerb along a public road, linearly referenced.

Schema: [`schema/curb-segment.schema.json`](schema/curb-segment.schema.json). [SPEC section](SPEC.md#6-site-semantics-profile-static-rules).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Segment id. | — |
| `road_ref` | [object](#curbsegment-road-ref) | required | — | Public road this kerb segment belongs to. | — |
| `side` | enum | required | one of: left, right | Side relative to road digitisation. | — |
| `linear_ref` | [object](#curbsegment-linear-ref) | required | — | Where along the road the segment runs, measured in metres from an agreed origin. | — |
| `orientation` | enum | optional | one of: parallel, angle, perpendicular | Bay orientation. | — |
| `marked_bays` | integer | optional | — | Count of marked bays. | — |
| `rule_ids` | array of [Id](#id) | required | — | Regulations along the segment (CDS-style). | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

#### CurbSegment.road_ref

<a id="curbsegment-road-ref"></a>

Public road this kerb segment belongs to.

Schema: [`schema/curb-segment.schema.json`](schema/curb-segment.schema.json). [SPEC section](SPEC.md#6-site-semantics-profile-static-rules).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `name` | string | required | — | Road name as signed. | `"Station Road"` |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |

#### CurbSegment.linear_ref

<a id="curbsegment-linear-ref"></a>

Where along the road the segment runs, measured in metres from an agreed origin.

Schema: [`schema/curb-segment.schema.json`](schema/curb-segment.schema.json). [SPEC section](SPEC.md#6-site-semantics-profile-static-rules).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `from_m` | number | required | m | Start of the segment along the road, in metres. | `0` |
| `to_m` | number | required | m | End of the segment along the road, in metres. Greater than from_m when the segment has length. | `40` |

### Rule

<a id="rule"></a>

Time-conditioned permission or ban (CDS-style regulation).

Schema: [`schema/rule.schema.json`](schema/rule.schema.json). [SPEC section](SPEC.md#6-site-semantics-profile-static-rules).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Rule id. | — |
| `applies_to` | array of [Id](#id) | required | — | Bays, zones, curb segments, access points, edges, handover zones. | — |
| `activity` | enum | required | one of: park, stop, load, pick_up_drop_off, no_parking, no_stopping, clearway | Permitted or banned activity. | — |
| `when` | array of [TimeWindow](#timewindow) | optional | — | Time windows. | — |
| `max_stay_min` | integer | optional | min | Maximum stay, 2P = 120. | — |
| `user_classes` | array of enum | optional | one of: any, permit_area, disability_permit, motorcycle, loading_vehicle, taxi, tenant, ev_charging, family, community_transport, ndis_transport, patient_transport, courier, emergency, carer | Eligible users. | — |
| `payment` | [object](#rule-payment) | optional | — | Whether and how a driver pays to use the space this rule covers. | — |
| `sign` | [object](#rule-sign) | optional | — | Sign as shown (Melbourne style). | — |
| `priority` | integer | optional | — | Higher wins when windows overlap. | — |
| `authority` | string | optional | — | Council, road authority or operator. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

#### Rule.payment

<a id="rule-payment"></a>

Whether and how a driver pays to use the space this rule covers.

Schema: [`schema/rule.schema.json`](schema/rule.schema.json). [SPEC section](SPEC.md#6-site-semantics-profile-static-rules).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `required` | boolean | optional | — | True when payment is required. | `true` |
| `rate_id` | [Id](#id) | optional | — | Stable, dotted, lower-case, never reused. | — |
| `methods` | array of string | optional | — | Payment methods the operator accepts, as short labels such as ticket, app or meter. | `["ticket", "app"]` |

#### Rule.sign

<a id="rule-sign"></a>

Sign as shown (Melbourne style).

Schema: [`schema/rule.schema.json`](schema/rule.schema.json). [SPEC section](SPEC.md#6-site-semantics-profile-static-rules).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `text` | string | optional | — | Words on the sign, as shown. | `"1P 9AM-5PM"` |
| `symbol` | enum | optional | one of: P, no_parking_P, no_stopping_S, clearway, loading_zone, disabled, permit, meter, ticket | Sign symbol. P parking, no_parking_P, no_stopping_S, clearway, loading_zone, disabled, permit, meter, or ticket. | `"P"` |

### Rate

<a id="rate"></a>

Tariff (APDS-style).

Schema: [`schema/rate.schema.json`](schema/rate.schema.json). [SPEC section](SPEC.md#6-site-semantics-profile-static-rules).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Rate id. | — |
| `currency` | string | required | — | ISO 4217 code. | — |
| `periods` | array of [object](#rate-periods) | required | — | Tariff steps; price is a decimal string. | — |
| `daily_cap` | string | optional | — | Decimal amount. | — |
| `grace_min` | integer | optional | min | Free leaving time. | — |
| `validation` | array of [object](#rate-validation) | optional | — | Validation schemes. | — |
| `dynamic` | boolean | optional | — | Prices may change via a dynamic feed. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

#### Rate.periods item

<a id="rate-periods"></a>

Schema: [`schema/rate.schema.json`](schema/rate.schema.json). [SPEC section](SPEC.md#6-site-semantics-profile-static-rules).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `up_to_min` | integer | required | min | This price applies until this many minutes of the stay. The next step, if any, covers longer stays. | `60` |
| `price` | string | required | — | Price for this step as a decimal string in the rate's currency. No currency symbol. | `"4.50"` |

#### Rate.validation item

<a id="rate-validation"></a>

Schema: [`schema/rate.schema.json`](schema/rate.schema.json). [SPEC section](SPEC.md#6-site-semantics-profile-static-rules).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `description` | string | optional | — | What the validation offers, in plain language. | `"Cinema ticket: first hour free."` |
| `free_min` | integer | optional | min | Minutes that are free when this validation applies. | `60` |

### AccessiblePath

<a id="accessiblepath"></a>

A step-free route from a bay or drop-off to a door or destination.

Schema: [`schema/accessible-path.schema.json`](schema/accessible-path.schema.json). [SPEC section](SPEC.md#6-site-semantics-profile-static-rules).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Path id. | — |
| `from_id` | [Id](#id) | required | — | Bay, zone or handover zone. | — |
| `to_id` | [Id](#id) | required | — | Pedestrian portal, destination or handover zone. | — |
| `step_free` | boolean | required | — | No steps or kerbs on the route. | — |
| `distance_m` | number | required | m | Route length. | — |
| `walk_time_s` | number | optional | s | Typical time for a slow or wheelchair pace. | — |
| `max_gradient_pct` | number | optional | percent | Steepest gradient on the route. | — |
| `min_width_m` | number | optional | m | Narrowest clear width. | — |
| `surface` | enum | optional | one of: smooth, textured, loose, mixed | Surface. | — |
| `tactile_indicators` | boolean | optional | — | Tactile ground surface indicators on the route. | — |
| `lighting` | enum | optional | one of: none, partial, good | Lighting. | — |
| `sheltered` | enum | optional | one of: none, partial, full | Weather cover. | — |
| `rest_points` | integer | optional | — | Places to rest. | — |
| `seating_points` | integer | optional | — | Seats along the route. | — |
| `lift_ids` | array of [Id](#id) | optional | — | Lifts used. | — |
| `crossings` | integer | optional | — | Vehicle aisle or road crossings. | — |
| `hazards` | array of enum | optional | one of: speed_hump, vehicle_crossing, steep_ramp, narrow_door, heavy_door, loose_surface, blocked_often | Known hazards. | — |
| `low_stimulation_rating` | enum | optional | one of: unknown, quiet, moderate, busy | Typical noise and crowding. | — |
| `wayfinding_ids` | array of [Id](#id) | optional | — | Wayfinding aids along the route. | — |
| `hours` | array of [TimeWindow](#timewindow) | optional | — | When the route is usable (e.g. lift hours). | — |
| `standard_ref` | string | optional | — | e.g. AS 1428.1:2021 (verify the edition in force). | — |
| `level_id` | [Id](#id) | optional | — | Level the path starts on, when it stays on one level. | — |
| `centreline` | array of [LocalPoint](#localpoint) | optional | — | Walked line in the facility frame. Optional at quality tier 0 and 1. Required, with at least two points, when the path is owner-verified or its facility tier is 2 or 3. | — |
| `verifications` | array of [Verification](#verification) | optional | — | Reviews of this feature against the real place. Absent means not checked. A later review tool writes these; the schema only stores them. | — |
| `provenance` | [Provenance](#provenance) | optional | — | Where a fact came from and when it was last confirmed. | — |
| `evidence` | [Evidence](#evidence) | optional | — | Per-feature multi-source evidence kept by the consolidating repository. | — |
| `lifecycle` | [Lifecycle](#lifecycle) | optional | — | Feature lifecycle. Retired features are announced by a tombstone in a ChangeSet. | — |
| `supersedes` | array of [Id](#id) | optional | — | IDs of earlier features this one replaces (for tombstoning and diffs). | — |
| `valid_from` | [DateTime](#datetime) | optional | — | Start of validity, for planned changes. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | End of validity. | — |
| `external_refs` | [ExternalRefs](#externalrefs) | optional | — | Links to other standards' identifiers instead of copying their geometry. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |


## 7. Crowdsourcing model

[SPEC.md section](SPEC.md#7-crowdsourcing-model)

### Evidence

<a id="evidence"></a>

Per-feature multi-source evidence kept by the consolidating repository.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `n_observations` | integer | required | — | How many observations support the current consensus. | `4` |
| `n_distinct_contributors` | integer | optional | — | How many different contributor organisations those observations came from. | `2` |
| `n_distinct_vehicles` | integer | optional | — | How many distinct vehicle pseudonyms those observations came from. Not a count of VINs. | `3` |
| `first_seen` | [DateTime](#datetime) | optional | — | RFC 3339 / ISO 8601 with offset. | — |
| `last_seen` | [DateTime](#datetime) | optional | — | RFC 3339 / ISO 8601 with offset. | — |
| `agreement_score` | number | optional | — | Weighted share of observations consistent with the consensus. | — |
| `positional_sigma_m` | number | optional | m | Estimated positional spread of the observations, one standard deviation, in metres. | `0.4` |
| `status` | enum | required | one of: candidate, provisional, verified, disputed, retired | Evidence state. candidate: seen but not yet reviewed. provisional: usable with caution. verified: accepted by the repository. disputed: observations disagree. retired: no longer current. | `"provisional"` |

### Contributor

<a id="contributor"></a>

An organisation submitting contributions. Never an individual vehicle or person.

Schema: [`schema/contributor.schema.json`](schema/contributor.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Contributor id. | — |
| `org_type` | enum | required | one of: oem, survey_firm, authority, operator, research | Organisation type. | — |
| `name` | string | required | — | Organisation name. | — |
| `licence_ref` | [object](#contributor-licence-ref) | optional | — | Licence or qualification, e.g. a national surveying qualification. | — |
| `jurisdiction_ids` | array of [Id](#id) | required | — | Jurisdictions the contributor may submit to. | — |
| `trust_tier` | integer | required | — | 0 unverified, 1 registered, 2 audited, 3 licensed or authority. | — |
| `public_key_ref` | string | optional | — | Reference to the key used to sign submissions. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

#### Contributor.licence_ref

<a id="contributor-licence-ref"></a>

Licence or qualification, e.g. a national surveying qualification.

Schema: [`schema/contributor.schema.json`](schema/contributor.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `scheme` | string | required | — | Name of the licence or qualification scheme, for example a national surveying qualification. | `"example-survey-licence"` |
| `number` | string | required | — | Licence or qualification number. Not a person's name. | `"EX-1000"` |
| `valid_to` | [DateTime](#datetime) | optional | — | RFC 3339 / ISO 8601 with offset. | — |

### Campaign

<a id="campaign"></a>

A request (SENSORIS-style) for a survey of a named facility.

Schema: [`schema/campaign.schema.json`](schema/campaign.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Campaign id. | — |
| `requested_by` | [Id](#id) | required | — | Contributor or repository. | — |
| `target` | [object](#campaign-target) | required | — | What to survey. | — |
| `features_requested` | array of string | required | — | Feature types wanted, e.g. level, ramp, bay, gate. | — |
| `quality_target_tier` | integer | optional | — | Target tier. | — |
| `window` | [object](#campaign-window) | optional | — | When the survey is wanted. start and end are RFC 3339 instants with an offset. | — |
| `priority` | integer | optional | — | 1 low to 5 high. | — |
| `reason` | enum | required | one of: new_facility, stale, conflict, closure, quality_upgrade, equity_gap, accessibility_audit | Why. | — |
| `status` | enum | required | one of: open, active, complete, cancelled | Status. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

#### Campaign.target

<a id="campaign-target"></a>

What to survey.

Schema: [`schema/campaign.schema.json`](schema/campaign.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `facility_id` | [Id](#id) | optional | — | Stable, dotted, lower-case, never reused. | — |
| `site_id` | [Id](#id) | optional | — | Stable, dotted, lower-case, never reused. | — |
| `bbox_wgs84` | array of number | optional | degrees | Survey bounding box in WGS84 degrees: [minimum longitude, minimum latitude, maximum longitude, maximum latitude]. | `[144.96, -37.82, 144.98, -37.8]` |

#### Campaign.window

<a id="campaign-window"></a>

When the survey is wanted. start and end are RFC 3339 instants with an offset.

Schema: [`schema/campaign.schema.json`](schema/campaign.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `start` | [DateTime](#datetime) | optional | — | RFC 3339 / ISO 8601 with offset. | — |
| `end` | [DateTime](#datetime) | optional | — | RFC 3339 / ISO 8601 with offset. | — |

### Contribution

<a id="contribution"></a>

A batch of static-feature observations from one contributor, kept separate from the consolidated map.

Schema: [`schema/contribution.schema.json`](schema/contribution.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Contribution id. | — |
| `contributor_id` | [Id](#id) | required | — | Organisation that collected the data. | — |
| `submitted_via_contributor_id` | [Id](#id) | optional | — | Licensed unit or gateway that received it, if routed. | — |
| `campaign_id` | [Id](#id) | optional | — | Campaign it responds to, if any. | — |
| `jurisdiction_id` | [Id](#id) | optional | — | Jurisdiction it was routed under. | — |
| `repository_id` | [Id](#id) | optional | — | Receiving repository. | — |
| `submitted_at` | [DateTime](#datetime) | required | — | RFC 3339 / ISO 8601 with offset. | — |
| `trace_window` | [object](#contribution-trace-window) | required | — | Time span of the vehicle trace that produced this contribution. start and end are RFC 3339 instants. | — |
| `facility_hint` | [object](#contribution-facility-hint) | optional | — | Where the trace was collected. | — |
| `sensor_profile` | [object](#contribution-sensor-profile) | optional | — | Declared sensing capability. | — |
| `pseudonym` | [object](#contribution-pseudonym) | required | — | Rotating tokens. No VIN or plate. | — |
| `redaction_attestation` | [object](#contribution-redaction-attestation) | required | — | Contributor's signed statement of what was removed. | — |
| `payload_ref` | [object](#contribution-payload-ref) | optional | — | Optional bulk payload (e.g. a SENSORIS message set) held separately. | — |
| `licence` | [LicenceTerms](#licenceterms) | optional | — | Usage terms for a dataset, feature or contribution. | — |
| `status` | enum | required | one of: received, rejected, accepted | Processing status. | — |
| `rejection_reason` | string | optional | — | Reason when rejected. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

#### Contribution.trace_window

<a id="contribution-trace-window"></a>

Time span of the vehicle trace that produced this contribution. start and end are RFC 3339 instants.

Schema: [`schema/contribution.schema.json`](schema/contribution.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `start` | [DateTime](#datetime) | required | — | RFC 3339 / ISO 8601 with offset. | — |
| `end` | [DateTime](#datetime) | required | — | RFC 3339 / ISO 8601 with offset. | — |

#### Contribution.facility_hint

<a id="contribution-facility-hint"></a>

Where the trace was collected.

Schema: [`schema/contribution.schema.json`](schema/contribution.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `facility_id` | [Id](#id) | optional | — | Stable, dotted, lower-case, never reused. | — |
| `site_id` | [Id](#id) | optional | — | Stable, dotted, lower-case, never reused. | — |
| `bbox_wgs84` | array of number | optional | degrees | Approximate WGS84 box where the trace was collected: [minimum longitude, minimum latitude, maximum longitude, maximum latitude], in degrees. | `[144.96, -37.82, 144.97, -37.81]` |

#### Contribution.sensor_profile

<a id="contribution-sensor-profile"></a>

Declared sensing capability.

Schema: [`schema/contribution.schema.json`](schema/contribution.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `sensors` | array of enum | optional | one of: camera, lidar, radar, ultrasonic, imu, wheel_odometry, gnss | Sensors used. camera, lidar, radar, ultrasonic, imu, wheel_odometry, gnss. | `["lidar", "imu", "wheel_odometry"]` |
| `calibration_class` | enum | optional | one of: uncalibrated, factory, fleet_calibrated, survey_grade | How well the sensors are calibrated. uncalibrated, factory, fleet_calibrated, or survey_grade. | `"factory"` |
| `odometry_drift_m_per_100m` | number | optional | m per 100 m | Claimed wheel-odometry drift, in metres per 100 metres travelled. | `0.5` |

#### Contribution.pseudonym

<a id="contribution-pseudonym"></a>

Rotating tokens. No VIN or plate.

Schema: [`schema/contribution.schema.json`](schema/contribution.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `vehicle_token` | string | required | — | Rotating vehicle token, at least 16 characters. Not a VIN, plate or other direct identifier. | `"0123456789abcdef"` |
| `session_token` | string | required | — | Rotating session token, at least 16 characters. Not a person's name. | `"fedcba9876543210"` |
| `pseudonym_epoch` | string | required | — | Rotation period label, e.g. 2026-11. | — |
| `k_anonymity_group` | integer | optional | — | Smallest group size the publisher claims this pseudonym shares. 1 means no k-anonymity claim. | `5` |

#### Contribution.redaction_attestation

<a id="contribution-redaction-attestation"></a>

Contributor's signed statement of what was removed.

Schema: [`schema/contribution.schema.json`](schema/contribution.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `policy_id` | [Id](#id) | required | — | Stable, dotted, lower-case, never reused. | — |
| `performed_on_board` | boolean | required | — | True when the redaction ran on the vehicle before upload. | `true` |
| `imagery_included` | boolean | required | — | True when the payload still contains imagery. | `false` |
| `trajectories_included` | boolean | required | — | True when the payload still contains trajectories. | `true` |
| `trim_start_m` | number | optional | m | Metres trimmed from the start of the trace so the journey origin is not kept. | `50` |
| `trim_end_m` | number | optional | m | Metres trimmed from the end of the trace so the journey destination is not kept. | `50` |
| `time_jitter_applied` | boolean | optional | — | True when timestamps were jittered to reduce re-identification. | `true` |
| `attested_at` | [DateTime](#datetime) | required | — | RFC 3339 / ISO 8601 with offset. | — |
| `signature_ref` | string | optional | — | Reference to the attestation signature. Not the signature bytes themselves. | `"sig-example-1"` |

#### Contribution.payload_ref

<a id="contribution-payload-ref"></a>

Optional bulk payload (e.g. a SENSORIS message set) held separately.

Schema: [`schema/contribution.schema.json`](schema/contribution.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `uri` | string | required | URI | URI of a bulk payload held outside this record, for example a SENSORIS message set. | `"https://example.org/payloads/example.bin"` |
| `sha256` | string | required | — | Lower-case hex SHA-256 of that payload, 64 digits. | `"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"` |
| `media_type` | string | optional | — | Media type of the payload. | `"application/octet-stream"` |

### OPMS contribution bundle

<a id="opms-contribution-bundle"></a>

A contribution with its feature observations and alignment records, as submitted to a repository.

Schema: [`schema/contribution-bundle.schema.json`](schema/contribution-bundle.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `_note` | string | optional | — | Free-text note. Used to label fictional example data. Not a map fact. | `"Fictional contribution bundle."` |
| `opms_version` | string | required | — | Schema version. 0.2.x remains valid. 0.3 adds located geometry and verification. | — |
| `contribution` | `contribution.schema.json` | required | — | A contribution with its feature observations and alignment records, as submitted to a repository. | — |
| `feature_observations` | array of `feature-observation.schema.json` | required | — | Observations. | — |
| `alignment_records` | array of `alignment-record.schema.json` | optional | — | Alignment records. | — |
| `anchor_observations` | array of `anchor-feature.schema.json` | optional | — | Anchors proposed by the contributor. | — |

### FeatureObservation

<a id="featureobservation"></a>

One observed feature in one contribution. Raw observations never appear in the published map.

Schema: [`schema/feature-observation.schema.json`](schema/feature-observation.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Observation id. | — |
| `contribution_id` | [Id](#id) | required | — | Parent contribution. | — |
| `target_feature_id` | — | optional | — | Existing feature this observes, or null for a candidate new feature. | — |
| `feature_type` | enum | required | one of: level, zone, bay, drive_node, drive_edge, ramp, pillar, access_point, gate, anchor_feature, pedestrian_portal, sign, localization_aid, height_limit, lift, kerb_ramp, wayfinding_aid, safety_feature, other | Observed feature type. | — |
| `geometry_local` | [Geometry](#geometry) | required | — | Geometry in a local frame. Coordinates are LocalPoints. | — |
| `frame_id` | [Id](#id) | required | — | Frame the geometry is expressed in (before alignment). | — |
| `attributes` | object | optional | — | Type-specific attributes, e.g. orientation, width_m, painted_label. | — |
| `observed_at` | [DateTime](#datetime) | required | — | RFC 3339 / ISO 8601 with offset. | — |
| `confidence` | number | required | — | 0-1. | — |
| `evidence_ref` | string | optional | — | Opaque reference to supporting evidence held under the redaction policy. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### AlignmentRecord

<a id="alignmentrecord"></a>

How a contribution was aligned into the facility frame in GNSS-denied areas.

Schema: [`schema/alignment-record.schema.json`](schema/alignment-record.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Record id. | — |
| `contribution_id` | [Id](#id) | required | — | Contribution. | — |
| `frame_id` | [Id](#id) | required | — | Target facility frame. | — |
| `level_id` | [Id](#id) | optional | — | Level aligned. | — |
| `method` | enum | required | one of: pose_graph, landmark_match, loop_closure, gnss_at_anchor | Alignment method. | — |
| `anchor_ids` | array of [Id](#id) | required | — | AnchorFeatures used. | — |
| `residual_rmse_m` | number | required | m | RMS residual after alignment. | — |
| `loop_closures` | integer | optional | — | Loop closures found. | — |
| `drift_m_per_100m` | number | optional | — | Estimated residual drift. | — |
| `solved_at` | [DateTime](#datetime) | required | — | RFC 3339 / ISO 8601 with offset. | — |
| `status` | enum | optional | one of: ok, poor, failed | Outcome. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### ConflictCase

<a id="conflictcase"></a>

A recorded disagreement between observations and how it was resolved.

Schema: [`schema/conflict-case.schema.json`](schema/conflict-case.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Case id. | — |
| `feature_id` | [Id](#id) | required | — | Feature in dispute. | — |
| `competing_observation_ids` | array of [Id](#id) | required | — | Observations in conflict. | — |
| `resolution_policy_id` | [Id](#id) | optional | — | Policy applied. | — |
| `rule_applied` | string | optional | — | Short name of the rule used. | — |
| `resolved_by` | enum | optional | one of: algorithm, operator, authority, auditor | Resolver. | — |
| `outcome` | enum | required | one of: open, accepted_observation, merged, retained_existing, rejected_all, escalated | Outcome. | — |
| `opened_at` | [DateTime](#datetime) | required | — | RFC 3339 / ISO 8601 with offset. | — |
| `resolved_at` | [DateTime](#datetime) | optional | — | RFC 3339 / ISO 8601 with offset. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### ResolutionPolicy

<a id="resolutionpolicy"></a>

How a repository promotes, merges and retires crowdsourced features.

Schema: [`schema/resolution-policy.schema.json`](schema/resolution-policy.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Policy id. | — |
| `jurisdiction_id` | [Id](#id) | optional | — | Jurisdiction. | — |
| `min_contributors` | integer | required | — | Distinct contributors needed to verify a feature. | — |
| `min_observations` | integer | required | — | Observations needed to leave candidate status. | — |
| `min_agreement` | number | required | — | Agreement score needed. | — |
| `max_position_spread_m` | number | optional | m | Observations further than this from the consensus disagree. | — |
| `override_roles` | array of enum | optional | one of: operator, authority, auditor | Roles that may override consensus. | — |
| `human_review_feature_types` | array of string | optional | — | Feature types that always need human or operator review, e.g. gate, height_limit. | — |
| `auto_retire_after_days` | integer | optional | — | Retire a feature not seen for this long. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### ChangeSet

<a id="changeset"></a>

A diff between two dataset versions; the unit of the change feed.

Schema: [`schema/change-set.schema.json`](schema/change-set.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Change set id. | — |
| `site_id` | [Id](#id) | required | — | Site. | — |
| `from_version` | [Version](#version) | required | — | Dataset or change-set version label, e.g. 2026-11-23.1. | — |
| `to_version` | [Version](#version) | required | — | Dataset or change-set version label, e.g. 2026-11-23.1. | — |
| `created_at` | [DateTime](#datetime) | required | — | RFC 3339 / ISO 8601 with offset. | — |
| `reason_codes` | array of enum | required | one of: new_survey, re_survey, operator_update, conflict_resolved, retirement, correction | Why the change was made. | — |
| `added` | array of [Id](#id) | optional | — | Feature ids added. | — |
| `modified` | array of [Id](#id) | optional | — | Feature ids modified. | — |
| `removed` | array of [object](#changeset-removed) | optional | — | Tombstones for removed features. | — |
| `contribution_ids` | array of [Id](#id) | optional | — | Contributions that drove the change. | — |
| `approved_by` | string | optional | — | Operator, authority or algorithm version that approved it. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

#### ChangeSet.removed item

<a id="changeset-removed"></a>

Tombstone.

Schema: [`schema/change-set.schema.json`](schema/change-set.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `feature_id` | [Id](#id) | required | — | Stable, dotted, lower-case, never reused. | — |
| `feature_type` | string | required | — | Kind of feature that was removed, such as bay or drive_edge. | `"bay"` |
| `removed_at` | [DateTime](#datetime) | required | — | RFC 3339 / ISO 8601 with offset. | — |
| `reason` | string | required | — | Why the feature was removed from the map. | `"demolished"` |
| `superseded_by` | [Id](#id) | optional | — | Stable, dotted, lower-case, never reused. | — |

### QualityTier

<a id="qualitytier"></a>

Declared quality for a facility or feature. Cars map their ODD to a minimum tier. Tier 2 and tier 3 are owner-verified or higher: the facility must include a verification with role owner, status confirmed, and dataset_version equal to the dataset version. The verification does not raise the tier by itself. It is required before those tiers may be declared. Drive edges and accessible paths on an owner-verified facility must carry a centreline.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `tier` | integer | required | — | 0 indicative, 1 ADAS-grade, 2 supervised self-park, 3 driverless. | — |
| `accuracy_class` | enum | optional | one of: indicative, adas, supervised_self_park, driverless | Intended use, matching the tier. indicative: display and planning. adas: driver-supervised assistance. supervised_self_park: supervised self-parking. driverless: driverless operation. Numeric accuracy targets in the spec are proposals, not regulator requirements. | `"supervised_self_park"` |
| `completeness_pct` | number | optional | percent | Share of expected features present, from 0 to 100 percent. | `95` |
| `last_audit` | [DateTime](#datetime) | optional | — | RFC 3339 / ISO 8601 with offset. | — |
| `certification_ids` | array of [Id](#id) | optional | — | Certification records that support this tier. | `["example.cert.1"]` |

### Certification

<a id="certification"></a>

Certification supporting a quality tier for driverless use.

Schema: [`schema/certification.schema.json`](schema/certification.schema.json). [SPEC section](SPEC.md#7-crowdsourcing-model).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Certification id. | — |
| `subject_id` | [Id](#id) | required | — | Facility, feature set or contributor certified. | — |
| `body` | string | required | — | Certifying body. | — |
| `scheme` | string | required | — | Scheme name. | — |
| `tier` | integer | required | — | Quality tier granted. | — |
| `issued_at` | [DateTime](#datetime) | required | — | RFC 3339 / ISO 8601 with offset. | — |
| `valid_to` | [DateTime](#datetime) | optional | — | RFC 3339 / ISO 8601 with offset. | — |
| `evidence_ref` | string | optional | — | Reference to the audit report. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |


## 8. Governance

[SPEC.md section](SPEC.md#8-governance-jurisdiction-routing-licence-consent-privacy)

### Jurisdiction

<a id="jurisdiction"></a>

Rules for where contributions go, who may handle them and where they are stored.

Schema: [`schema/jurisdiction.schema.json`](schema/jurisdiction.schema.json). [SPEC section](SPEC.md#8-governance-jurisdiction-routing-licence-consent-privacy).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Jurisdiction id. | — |
| `name` | string | required | — | Name. | — |
| `country` | string | required | — | ISO 3166-1 alpha-2. | — |
| `repository_id` | [Id](#id) | required | — | Default repository. | — |
| `routing_mode` | enum | required | one of: direct_to_repository, via_licensed_unit, authority_only | How contributions reach the repository. via_licensed_unit is the China-style mode. | — |
| `licensed_unit_ids` | array of [Id](#id) | optional | — | Contributors (survey_firm) licensed to receive raw data in via_licensed_unit mode. | — |
| `accepted_contributor_types` | array of enum | optional | one of: oem, survey_firm, authority, operator, research | Who may submit directly. | — |
| `raw_data_access` | enum | optional | one of: repository_only, licensed_unit_only, contributor_retains | Who may touch raw contributions. | — |
| `residency` | enum | required | one of: unrestricted, in_country_only, cross_border_with_approval | Data residency. | — |
| `approval_regime` | enum | required | one of: none, operator_consent, authority_approval, licensed_unit_only, map_review | Approvals needed before data is used. | — |
| `redaction_policy_id` | [Id](#id) | optional | — | Default redaction policy. | — |
| `resolution_policy_id` | [Id](#id) | optional | — | Default conflict resolution policy. | — |
| `legal_basis` | array of string | optional | — | Free-text citations, e.g. a notice number. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### Repository

<a id="repository"></a>

Central repository (or licensed-unit gateway) for a jurisdiction.

Schema: [`schema/repository.schema.json`](schema/repository.schema.json). [SPEC section](SPEC.md#8-governance-jurisdiction-routing-licence-consent-privacy).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Repository id. | — |
| `operator` | string | required | — | Operating organisation. | — |
| `jurisdiction_id` | [Id](#id) | required | — | Jurisdiction. | — |
| `role` | enum | required | one of: repository, licensed_unit_gateway, consortium | Role. | — |
| `endpoint` | string | required | URI | URI where this repository accepts contributions or serves datasets. | `"https://example.org/opms"` |
| `storage_region` | string | required | — | Where data is stored, e.g. AU or CN. | — |
| `signing_key_refs` | array of string | optional | — | Keys used to sign datasets and change sets. | — |
| `default_licence` | [LicenceTerms](#licenceterms) | optional | — | Usage terms for a dataset, feature or contribution. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### OPMS registry

<a id="opms-registry"></a>

Jurisdictions, repositories, contributors and policies. Published by repositories or authorities, separate from site datasets.

Schema: [`schema/registry.schema.json`](schema/registry.schema.json). [SPEC section](SPEC.md#8-governance-jurisdiction-routing-licence-consent-privacy).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `_note` | string | optional | — | Free-text note. Used to label fictional example data. Not a registry fact. | `"Fictional registry."` |
| `opms_version` | string | required | — | Schema version. 0.2.x remains valid. 0.3 adds located geometry and verification. | — |
| `jurisdictions` | array of `jurisdiction.schema.json` | required | — | Jurisdictions. | — |
| `repositories` | array of `repository.schema.json` | required | — | Repositories. | — |
| `contributors` | array of `contributor.schema.json` | optional | — | Contributors. | — |
| `resolution_policies` | array of `resolution-policy.schema.json` | optional | — | Policies. | — |
| `redaction_policies` | array of `redaction-policy.schema.json` | optional | — | Policies. | — |
| `campaigns` | array of `campaign.schema.json` | optional | — | Open campaigns. | — |

### LicenceTerms

<a id="licenceterms"></a>

Usage terms for a dataset, feature or contribution.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#8-governance-jurisdiction-routing-licence-consent-privacy).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `spdx_id` | string | optional | — | SPDX identifier, e.g. CC-BY-4.0. | — |
| `custom_terms_uri` | string | optional | URI | URI of custom licence terms, used when there is no SPDX identifier. One of spdx_id or this URI is required. | `"https://example.org/licences/opms-example"` |
| `commercial_use` | boolean | optional | — | True when the terms allow commercial use. | `true` |
| `attribution_required` | boolean | optional | — | True when users must attribute the source. | `true` |
| `redistribution` | enum | optional | one of: allowed, restricted, prohibited | Whether the data may be passed on. allowed: yes. restricted: only under extra conditions in the terms. prohibited: no. | `"allowed"` |
| `derivative_works` | enum | optional | one of: allowed, restricted, prohibited | Whether modified copies are allowed. allowed, restricted, or prohibited. | `"allowed"` |
| `ai_training_use` | enum | optional | one of: allowed, restricted, prohibited, unspecified | Whether the data may be used to train models. allowed, restricted, prohibited, or unspecified when the terms are silent. | `"unspecified"` |
| `retention_days` | integer | optional | — | How many days a recipient may keep a copy. 0 means no retained copy. | `365` |
| `sublicensable` | boolean | optional | — | True when a recipient may grant the same rights to someone else. | `false` |
| `sublicence_chain` | array of [Id](#id) | optional | — | Contributor or repository ids that show how the licence was passed on. | `["example.contributor"]` |

### ApprovalStatus

<a id="approvalstatus"></a>

Facility owner or operator consent for mapping and use.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#8-governance-jurisdiction-routing-licence-consent-privacy).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `owner_consent` | enum | required | one of: unknown, granted, denied, conditional | Operator or owner consent. unknown: not asked. granted: given. denied: refused. conditional: given only for the listed scope. | `"granted"` |
| `granted_by` | string | optional | — | Organisation that granted or refused consent. An organisation label, not a person's name. | `"Example Parking Co"` |
| `scope` | array of enum | optional | one of: geometry_only, publish, driverless_use, commercial_use | What consent covers. geometry_only: the map geometry. publish: publishing it. driverless_use: driverless operation. commercial_use: commercial use. | `["publish", "geometry_only"]` |
| `valid_to` | [DateTime](#datetime) | optional | — | RFC 3339 / ISO 8601 with offset. | — |
| `signage` | boolean | optional | — | Mapping or AVP signage is posted on site. | — |
| `dispute_contact` | string | optional | — | Public contact for corrections or takedown (organisation role or URL). | — |

### RedactionPolicy

<a id="redactionpolicy"></a>

Privacy redaction requirements for contributions.

Schema: [`schema/redaction-policy.schema.json`](schema/redaction-policy.schema.json). [SPEC section](SPEC.md#8-governance-jurisdiction-routing-licence-consent-privacy).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Policy id. | — |
| `jurisdiction_id` | [Id](#id) | optional | — | Jurisdiction it applies to. | — |
| `imagery` | enum | required | one of: none, redacted_only, raw_to_licensed_unit_only | Imagery allowed in contributions. | — |
| `blur_faces` | boolean | optional | — | Faces blurred. | — |
| `blur_plates` | boolean | optional | — | Plates blurred. | — |
| `on_board_required` | boolean | required | — | Redaction must happen on the vehicle. | — |
| `trajectories` | enum | required | one of: none, derived_geometry_only | Whether raw vehicle trajectories may be uploaded. | — |
| `trim_start_m` | number | optional | m | Trim this much of the start of each trace. | — |
| `trim_end_m` | number | optional | m | Trim this much of the end of each trace. | — |
| `time_jitter_s` | number | optional | s | Random time offset applied. | — |
| `location_jitter_m` | number | optional | m | Random offset for coarse locations. | — |
| `min_contributors_before_release` | integer | optional | — | Minimum distinct contributors before a feature is published. | — |
| `retention_days` | integer | optional | — | Retention of raw contributions. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |


## 9. Dynamic layer and services

[SPEC.md section](SPEC.md#9-dynamic-layer-and-services-optional)

### OccupancyUpdate

<a id="occupancyupdate"></a>

OPTIONAL live state. Not part of the static-core profile.

Schema: [`schema/occupancy-update.schema.json`](schema/occupancy-update.schema.json). [SPEC section](SPEC.md#9-dynamic-layer-and-services-optional).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `target_id` | [Id](#id) | required | — | Bay, zone, level or facility. | — |
| `state` | enum | optional | one of: free, occupied, reserved, blocked, unknown | Bay-level state. | — |
| `free` | integer | optional | — | Free count. | — |
| `total` | integer | optional | — | Total count. | — |
| `observed_at` | [DateTime](#datetime) | required | — | RFC 3339 / ISO 8601 with offset. | — |
| `ttl_s` | integer | required | s | Treat as unknown after this many seconds. | — |
| `source` | enum | required | one of: bay_sensor, camera, gate_count, vehicle, operator | Source. | — |
| `confidence` | number | optional | — | 0-1. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

### Closure

<a id="closure"></a>

OPTIONAL temporary change. Not part of the static-core profile.

Schema: [`schema/closure.schema.json`](schema/closure.schema.json). [SPEC section](SPEC.md#9-dynamic-layer-and-services-optional).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `id` | [Id](#id) | required | — | Closure id. | — |
| `target_ids` | array of [Id](#id) | required | — | Edges, levels, access points, links. | — |
| `effect` | enum | required | one of: closed, restricted, reversed_direction, reduced_clearance, event_only | Effect. | — |
| `reason` | enum | required | one of: event, maintenance, flooding, incident, security | Reason. | — |
| `window` | [object](#closure-window) | required | — | When the closure applies. start is required. Omit end when the finish time is not yet known. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

#### Closure.window

<a id="closure-window"></a>

When the closure applies. start is required. Omit end when the finish time is not yet known.

Schema: [`schema/closure.schema.json`](schema/closure.schema.json). [SPEC section](SPEC.md#9-dynamic-layer-and-services-optional).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `start` | [DateTime](#datetime) | required | — | RFC 3339 / ISO 8601 with offset. | — |
| `end` | [DateTime](#datetime) | optional | — | RFC 3339 / ISO 8601 with offset. | — |

### DynamicFeed

<a id="dynamicfeed"></a>

OPTIONAL dynamic layer feed (stream or document).

Schema: [`schema/dynamic-feed.schema.json`](schema/dynamic-feed.schema.json). [SPEC section](SPEC.md#9-dynamic-layer-and-services-optional).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `site_id` | [Id](#id) | required | — | Site. | — |
| `as_of` | [DateTime](#datetime) | required | — | RFC 3339 / ISO 8601 with offset. | — |
| `occupancy` | array of `occupancy-update.schema.json` | optional | — | Occupancy updates. | — |
| `closures` | array of `closure.schema.json` | optional | — | Closures. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |


## 12. Human-centred design and accessibility

[SPEC.md section](SPEC.md#12-human-centred-design-and-accessibility)

### BayAccessibility

<a id="bayaccessibility"></a>

Accessible-bay attributes. Dimensions are as built; standard_ref says what the facility was designed or audited against.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#12-human-centred-design-and-accessibility).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `standard_ref` | string | optional | — | e.g. AS 2890.6:2022 (verify the edition in force). | — |
| `bay_width_m` | number | optional | m | As-built width of the bay, in metres. | `3.2` |
| `bay_length_m` | number | optional | m | As-built length of the bay, in metres. | `5.4` |
| `shared_zone` | [object](#bayaccessibility-shared-zone) | optional | — | Marked shared area beside or behind the bay, used for unloading a wheelchair or ramp. | — |
| `kerb_ramp` | boolean | optional | — | True when a kerb ramp serves this bay. | `true` |
| `surface` | [object](#bayaccessibility-surface) | optional | — | Walking surface of the bay and its shared zone. | — |
| `gradient_pct` | number | optional | percent | Maximum gradient across the bay and shared zone. | — |
| `headroom_m` | number | optional | m | Minimum headroom over the bay and its approach. | — |
| `high_roof_van_ok` | boolean | optional | — | Headroom and approach suit high-roof wheelchair vans. | — |
| `loading` | [object](#bayaccessibility-loading) | optional | — | Clear space for ramps and lifts. | — |
| `distance_to_accessible_entrance_m` | number | optional | m | Walking distance from the bay to the nearest accessible entrance, in metres. | `25` |
| `rest_point_on_path` | boolean | optional | — | True when there is a place to rest on the path from this bay to the entrance. | `true` |
| `permit_scheme` | enum | optional | one of: none, adps, organisation, any_accessible | adps = Australian Disability Parking Scheme permit. | — |
| `bollard` | boolean | optional | — | Bollard in the shared zone to keep it clear. | — |
| `audit` | [object](#bayaccessibility-audit) | optional | — | How and when the accessible-bay attributes were last checked. | — |

#### BayAccessibility.shared_zone

<a id="bayaccessibility-shared-zone"></a>

Marked shared area beside or behind the bay, used for unloading a wheelchair or ramp.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#12-human-centred-design-and-accessibility).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `side` | enum | optional | one of: none, left, right, both | Which side of the bay the shared zone is on, as the driver looks out of the bay. none, left, right, or both. | `"left"` |
| `width_m` | number | optional | m | Width of the shared zone, in metres. | `2.4` |
| `length_m` | number | optional | m | Length of the shared zone along the bay, in metres. | `5.4` |
| `rear_length_m` | number | optional | m | Extra shared length behind the bay, in metres. | `1.0` |
| `shared_between_bays` | boolean | optional | — | True when neighbouring accessible bays share one zone. | `true` |

#### BayAccessibility.surface

<a id="bayaccessibility-surface"></a>

Walking surface of the bay and its shared zone.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#12-human-centred-design-and-accessibility).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `material` | enum | optional | one of: asphalt, concrete, pavers, gravel, other | Surface material. asphalt, concrete, pavers, gravel, or other. | `"concrete"` |
| `slip_resistant` | boolean | optional | — | True when the surface is treated or finished to resist slipping when wet. | `true` |

#### BayAccessibility.loading

<a id="bayaccessibility-loading"></a>

Clear space for ramps and lifts.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#12-human-centred-design-and-accessibility).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `rear_ramp_clearance_m` | number | optional | m | Clear length behind the vehicle for a rear ramp, in metres. | `2.4` |
| `side_lift_clearance_m` | number | optional | m | Clear width beside the vehicle for a side lift, in metres. | `1.5` |

#### BayAccessibility.audit

<a id="bayaccessibility-audit"></a>

How and when the accessible-bay attributes were last checked.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#12-human-centred-design-and-accessibility).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `last_audited` | [DateTime](#datetime) | optional | — | RFC 3339 / ISO 8601 with offset. | — |
| `method` | enum | optional | one of: survey, self_report, crowd | How the audit was done. survey: measured on site. self_report: the operator's own report. crowd: reported by contributors. | `"survey"` |

### HandoverAccessibility

<a id="handoveraccessibility"></a>

Accessibility of a drop-off or pick-up zone.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#12-human-centred-design-and-accessibility).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `kerbside_transfer_space_m` | number | optional | m | Clear width beside the vehicle for a wheelchair transfer or ramp. | — |
| `kerb_ramp` | boolean | optional | — | True when a kerb ramp is at the drop-off or pick-up. | `true` |
| `step_free_to_destination` | boolean | optional | — | True when a person can reach the destination from here without steps. | `true` |
| `sheltered` | boolean | optional | — | True when people waiting are under cover. | `true` |
| `seating` | boolean | optional | — | True when there is seating for people waiting. | `false` |
| `assistance_point` | boolean | optional | — | True when staff or a call point can help a passenger here. | `true` |
| `tactile_marking` | boolean | optional | — | True when tactile paving or another tactile mark is present. | `true` |
| `lighting` | enum | optional | one of: none, partial, good | Lighting where people wait. none, partial, or good. | `"good"` |
| `wait_time_allowance_s` | integer | optional | s | Extra standing time allowed when a passenger needs assistance. | — |

### PublicationTerms

<a id="publicationterms"></a>

How openly the dataset is published so councils, disability organisations and non-AV apps can use it.

Schema: [`schema/common.schema.json`](schema/common.schema.json). [SPEC section](SPEC.md#12-human-centred-design-and-accessibility).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `public_url` | string | optional | URI | Public web page for this dataset. | `"https://example.org/data/opms"` |
| `api_endpoint` | string | optional | URI | HTTP endpoint that serves the dataset. | `"https://example.org/api/opms"` |
| `formats` | array of enum | optional | one of: json, geojson, opendrive, lanelet2, indoorgml, apds | Formats offered. json, geojson, opendrive, lanelet2, indoorgml, or apds. | `["json"]` |
| `bulk_download` | boolean | optional | — | True when the whole dataset can be downloaded in one file. | `true` |
| `non_av_use_allowed` | boolean | optional | — | Usable by people driving themselves or being driven, not only by automated vehicles. | — |
| `accessible_documentation` | boolean | optional | — | True when the documentation of this dataset meets an accessibility target such as WCAG 2.2. | `true` |
| `update_frequency` | enum | optional | one of: realtime, daily, weekly, monthly, on_change | How often the published copy changes. realtime, daily, weekly, monthly, or on_change. | `"on_change"` |
| `accessibility_contact` | string | optional | — | Contact for accessibility questions. An organisation mailbox or role, not a private person's name. | `"access@example.org"` |

### PassengerNeeds

<a id="passengerneeds"></a>

On-device passenger needs profile for a Banish-style mission. Never part of a map dataset.

Schema: [`schema/passenger-needs.schema.json`](schema/passenger-needs.schema.json). [SPEC section](SPEC.md#12-human-centred-design-and-accessibility).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `storage` | — | required | — | Needs are stored and processed on the device only. | — |
| `mobility_aid` | array of enum | optional | one of: none, manual_wheelchair, power_wheelchair, scooter, walking_frame, cane, pram | Aids travelling with the passenger. | — |
| `step_free_door_to_door` | boolean | optional | — | Needs step-free door-to-door drop-off and pick-up. | — |
| `assistance_animal` | boolean | optional | — | Travels with an assistance animal. | — |
| `extra_time_factor` | number | optional | — | Multiplier on walking and standing time. | — |
| `low_stimulation_route` | boolean | optional | — | Prefers quiet, uncrowded routes. | — |
| `wants_assistance_at_handover` | boolean | optional | — | Wants help at drop-off or pick-up. | — |
| `carer_travelling` | boolean | optional | — | A carer travels with the passenger. | — |
| `sensory_support` | array of enum | optional | one of: audible_guidance, large_text, visual_alerts, tactile_cues | Interface support needed. | — |
| `consent` | [object](#passengerneeds-consent) | required | — | Passenger's consent. Revocable at any time. | — |
| `derived_requirements` | `handover-requirements.schema.json` | optional | — | The only part that may leave the device, and only if consent.scope allows it. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |

#### PassengerNeeds.consent

<a id="passengerneeds-consent"></a>

Passenger's consent. Revocable at any time.

Schema: [`schema/passenger-needs.schema.json`](schema/passenger-needs.schema.json). [SPEC section](SPEC.md#12-human-centred-design-and-accessibility).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `scope` | enum | required | one of: on_device_only, derived_requirements_only | What may leave the device. on_device_only: nothing is shared. derived_requirements_only: only the derived handover requirements, not the underlying needs. | `"derived_requirements_only"` |
| `granted_at` | [DateTime](#datetime) | required | — | RFC 3339 / ISO 8601 with offset. | — |
| `expires_at` | [DateTime](#datetime) | optional | — | RFC 3339 / ISO 8601 with offset. | — |

### HandoverRequirements

<a id="handoverrequirements"></a>

Minimum derived requirements that MAY be sent to a facility or planner with consent. Contains no identity, diagnosis or condition.

Schema: [`schema/handover-requirements.schema.json`](schema/handover-requirements.schema.json). [SPEC section](SPEC.md#12-human-centred-design-and-accessibility).

| Name | Type | Required | Units / format | Description | Example |
|---|---|---|---|---|---|
| `need_step_free` | boolean | optional | — | Step-free handover and path needed. | — |
| `min_kerbside_transfer_space_m` | number | optional | m | Clear space needed beside the vehicle. | — |
| `extended_dwell_factor` | number | optional | — | Multiplier on standing time. | — |
| `need_shelter` | boolean | optional | — | Shelter wanted. | — |
| `need_assistance_point` | boolean | optional | — | Assistance point wanted. | — |
| `low_stimulation` | boolean | optional | — | Quiet route preferred. | — |
| `_note` | string | optional | — | Free-text note; used to label fictional example data. | — |


## Licence

Specification text, including this dictionary: [CC BY 4.0](LICENSE-CC-BY-4.0). Schemas and the generator: [Apache-2.0](LICENSE-APACHE-2.0).
