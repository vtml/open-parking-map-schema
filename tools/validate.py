#!/usr/bin/env python3
"""Validate OPMS schemas and example files.

Usage:
    python tools/validate.py            # validate schemas + all examples
    python tools/validate.py FILE.json  # validate one file (schema chosen by name, see EXAMPLE_SCHEMAS)

Checks performed
  1. Every schema/*.schema.json is a valid JSON Schema (draft 2020-12).
  2. Every example validates against its schema (with format checking).
  3. Referential integrity inside datasets and contribution bundles (ids that
     must exist), and across files (jurisdictions, contributors, policies).

Requires: pip install jsonschema referencing rfc3339-validator rfc3987
Licence: Apache-2.0
"""
import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

ROOT = Path(__file__).resolve().parent.parent
SCHEMA_DIR = ROOT / "schema"
EXAMPLE_DIR = ROOT / "examples"

# example file -> schema file
EXAMPLE_SCHEMAS = {
    "simple-carpark-dataset.json": "dataset.schema.json",
    "merriwa-park-dataset.json": "dataset.schema.json",
    "street-segment-dataset.json": "dataset.schema.json",
    "crowdsourced-contribution-bundle.json": "contribution-bundle.schema.json",
    "change-set-example.json": "change-set.schema.json",
    "optional-dynamic-feed.json": "dynamic-feed.schema.json",
    "registry-example.json": "registry.schema.json",
    "passenger-needs-example.json": "passenger-needs.schema.json",
    "review-example.json": "review.schema.json",
}


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def build_registry():
    resources = []
    schemas = {}
    for p in sorted(SCHEMA_DIR.glob("*.schema.json")):
        doc = load(p)
        schemas[p.name] = doc
        resources.append((doc["$id"], Resource.from_contents(doc, default_specification=DRAFT202012)))
    return Registry().with_resources(resources), schemas


def schema_errors(registry, schemas):
    errs = []
    for name, doc in schemas.items():
        try:
            Draft202012Validator.check_schema(doc)
        except Exception as e:  # noqa: BLE001
            errs.append(f"{name}: invalid schema: {e}")
    return errs


def validate_doc(registry, schemas, schema_name, doc):
    v = Draft202012Validator(schemas[schema_name], registry=registry, format_checker=FormatChecker())
    return [f"{'/'.join(str(x) for x in e.absolute_path) or '<root>'}: {e.message}" for e in sorted(v.iter_errors(doc), key=lambda e: list(e.absolute_path))]


def ids(doc, key):
    return {x["id"] for x in doc.get(key, [])}


def check(errs, cond, msg):
    if not cond:
        errs.append(msg)


def dataset_refs(d):
    """Referential integrity inside one dataset."""
    errs = []
    site = d["site"]
    frames = ids(d, "frames")
    facilities = ids(d, "facilities")
    levels = {lv["id"] for f in d.get("facilities", []) for lv in f["levels"]}
    zones, bays = ids(d, "zones"), ids(d, "bays")
    nodes, edges = ids(d, "drive_nodes"), ids(d, "drive_edges")
    aps, gates, links = ids(d, "access_points"), ids(d, "gates"), ids(d, "inter_facility_links")
    anchors, grids = ids(d, "anchor_features"), ids(d, "pillar_grids")
    portals, dests = ids(d, "pedestrian_portals"), ids(d, "destinations")
    hz, curbs, rules, rates = ids(d, "handover_zones"), ids(d, "curb_segments"), ids(d, "rules"), ids(d, "rates")
    certs = ids(d, "certifications")
    everything = (facilities | levels | zones | bays | nodes | edges | aps | gates | links | hz | curbs)

    for fid in site["facility_ids"]:
        check(errs, fid in facilities, f"site.facility_ids: unknown facility {fid}")
    for f in d.get("facilities", []):
        check(errs, f["site_id"] == site["id"], f"facility {f['id']}: site_id != site.id")
        check(errs, f["frame_id"] in frames, f"facility {f['id']}: unknown frame {f['frame_id']}")
        check(errs, f["id"] in site["facility_ids"], f"facility {f['id']} not listed in site.facility_ids")
        if "rate_id" in f:
            check(errs, f["rate_id"] in rates, f"facility {f['id']}: unknown rate {f['rate_id']}")
        for c in f.get("quality_tier", {}).get("certification_ids", []):
            check(errs, c in certs, f"facility {f['id']}: unknown certification {c}")
        for lv in f["levels"]:
            for a in lv.get("entry_anchor_ids", []):
                check(errs, a in anchors, f"level {lv['id']}: unknown anchor {a}")
        for z in f.get("avp", {}).get("handover_zone_ids", []):
            check(errs, z in hz, f"facility {f['id']}: unknown handover zone {z}")
    for z in d.get("zones", []):
        check(errs, z["level_id"] in levels, f"zone {z['id']}: unknown level {z['level_id']}")
    for b in d.get("bays", []):
        check(errs, b["zone_id"] in zones, f"bay {b['id']}: unknown zone {b['zone_id']}")
        for r in b.get("rule_ids", []):
            check(errs, r in rules, f"bay {b['id']}: unknown rule {r}")
    for n in d.get("drive_nodes", []):
        check(errs, n["level_id"] in levels, f"node {n['id']}: unknown level {n['level_id']}")
    for e in d.get("drive_edges", []):
        check(errs, e["from_node"] in nodes and e["to_node"] in nodes, f"edge {e['id']}: unknown node")
        for t in e.get("turn_restrictions", []):
            check(errs, t["banned_next_edge"] in edges, f"edge {e['id']}: unknown banned edge")
    for a in d.get("access_points", []):
        check(errs, a["facility_id"] in facilities, f"access point {a['id']}: unknown facility")
        for lv in a.get("served_level_ids", []):
            check(errs, lv in levels, f"access point {a['id']}: unknown level {lv}")
        for g in a.get("gate_ids", []):
            check(errs, g in gates, f"access point {a['id']}: unknown gate {g}")
    for g in d.get("gates", []):
        check(errs, g["host_id"] in (aps | links), f"gate {g['id']}: unknown host {g['host_id']}")
    for l in d.get("inter_facility_links", []):
        check(errs, l["from"] in nodes and l["to"] in nodes, f"link {l['id']}: unknown node")
        g = l["ticket_transfer"].get("gate_id")
        if g:
            check(errs, g in gates, f"link {l['id']}: unknown gate {g}")
    for a in d.get("anchor_features", []):
        check(errs, a["level_id"] in levels, f"anchor {a['id']}: unknown level")
    for g in d.get("pillar_grids", []):
        check(errs, g["level_id"] in levels, f"pillar grid {g['id']}: unknown level")
    for p in d.get("pillars", []):
        check(errs, p["level_id"] in levels, f"pillar {p['id']}: unknown level")
        if "grid_id" in p:
            check(errs, p["grid_id"] in grids, f"pillar {p['id']}: unknown grid")
    for x in d.get("destinations", []):
        for p in x["portal_ids"]:
            check(errs, p in portals, f"destination {x['id']}: unknown portal {p}")
    targets = {"handover_zone": hz, "zone": zones, "portal": portals}
    for x in d.get("destination_access", []):
        check(errs, x["destination_id"] in dests, f"destination_access: unknown destination {x['destination_id']}")
        check(errs, x["target_id"] in targets[x["via"]], f"destination_access: unknown {x['via']} {x['target_id']}")
    for h in d.get("handover_zones", []):
        check(errs, h["location_id"] in (levels | curbs), f"handover zone {h['id']}: unknown location {h['location_id']}")
        for r in h.get("rule_ids", []):
            check(errs, r in rules, f"handover zone {h['id']}: unknown rule {r}")
    for c in d.get("curb_segments", []):
        for r in c["rule_ids"]:
            check(errs, r in rules, f"curb segment {c['id']}: unknown rule {r}")
    for r in d.get("rules", []):
        for t in r["applies_to"]:
            check(errs, t in everything, f"rule {r['id']}: applies_to unknown id {t}")
        rid = r.get("payment", {}).get("rate_id")
        if rid:
            check(errs, rid in rates, f"rule {r['id']}: unknown rate {rid}")
    lifts_, wf, paths = ids(d, "lifts"), ids(d, "wayfinding_aids"), ids(d, "accessible_paths")
    for x in d.get("lifts", []):
        for lv in x["level_ids"]:
            check(errs, lv in levels, f"lift {x['id']}: unknown level {lv}")
    for x in d.get("wayfinding_aids", []) + d.get("safety_features", []):
        check(errs, x["level_id"] in levels, f"{x['id']}: unknown level {x['level_id']}")
    for x in d.get("accessible_paths", []):
        check(errs, x["from_id"] in (bays | zones | hz), f"path {x['id']}: unknown from_id {x['from_id']}")
        check(errs, x["to_id"] in (portals | dests | hz), f"path {x['id']}: unknown to_id {x['to_id']}")
        for l in x.get("lift_ids", []):
            check(errs, l in lifts_, f"path {x['id']}: unknown lift {l}")
        for w in x.get("wayfinding_ids", []):
            check(errs, w in wf, f"path {x['id']}: unknown wayfinding aid {w}")
    for x in d.get("destination_access", []):
        if "accessible_path_id" in x:
            check(errs, x["accessible_path_id"] in paths, f"destination_access: unknown accessible path {x['accessible_path_id']}")
    # every accessible bay should be a valid ADPS-style bay with a shared zone when accessibility data is present
    for b in d.get("bays", []):
        acc = b.get("accessibility")
        if acc and "accessible" in b["bay_types"]:
            check(errs, "shared_zone" in acc, f"bay {b['id']}: accessible bay with accessibility data should declare shared_zone")
    for portal in d.get("pedestrian_portals", []):
        check(errs, portal.get("level_id") in levels, f"portal {portal['id']}: level_id is required and must be a level")
    for dest in d.get("destinations", []):
        check(errs, dest.get("level_id") in levels, f"destination {dest['id']}: level_id is required and must be a level")
    errs.extend(conformance_03(d, levels))
    return errs


def owner_confirmed(obj, version):
    for record in obj.get("verifications") or []:
        if record.get("role") == "owner" and record.get("status") == "confirmed" and record.get("dataset_version") == version:
            return True
    return False


def conformance_03(d, levels):
    """Located geometry and owner verification. Applies only to opms_version 0.3."""
    if not str(d.get("opms_version", "")).startswith("0.3"):
        return []
    errs = []
    version = d.get("dataset_version")
    frames = ids(d, "frames")
    facility_of = {}
    for facility in d.get("facilities", []):
        for level in facility["levels"]:
            facility_of[level["id"]] = facility
    if d.get("facilities"):
        boundary = (d.get("site") or {}).get("boundary")
        check(errs, bool(boundary and len(boundary.get("polygon") or []) >= 4), "site.boundary polygon is required on a 0.3 dataset with facilities")
        if boundary:
            check(errs, boundary.get("frame_id") in frames, "site.boundary.frame_id is not a frame in this dataset")
    for zone in d.get("zones", []):
        check(errs, len(zone.get("polygon") or []) >= 4, f"zone {zone['id']}: polygon is required in 0.3")
    for access in d.get("access_points", []):
        check(errs, access.get("level_id") in levels, f"access point {access['id']}: level_id is required and must be a level")
        check(errs, isinstance(access.get("position"), list) and len(access["position"]) == 3, f"access point {access['id']}: position is required in 0.3")
        check(errs, isinstance(access.get("threshold"), list) and len(access["threshold"]) >= 2, f"access point {access['id']}: threshold segment is required in 0.3")
    for gate in d.get("gates", []):
        check(errs, gate.get("level_id") in levels, f"gate {gate['id']}: level_id is required and must be a level")
        has_line = isinstance(gate.get("threshold"), list) and len(gate["threshold"]) >= 2
        has_point = isinstance(gate.get("position"), list) and len(gate["position"]) == 3
        check(errs, has_line or has_point, f"gate {gate['id']}: position or threshold is required in 0.3")
    for lift in d.get("lifts", []):
        check(errs, len(lift.get("footprint") or []) >= 4, f"lift {lift['id']}: footprint is required in 0.3")
    for stair in d.get("stair_cores", []):
        check(errs, len(stair.get("footprint") or []) >= 4, f"stair core {stair['id']}: footprint is required in 0.3")
        for level_id in stair.get("level_ids", []):
            check(errs, level_id in levels, f"stair core {stair['id']}: unknown level {level_id}")
    for portal in d.get("pedestrian_portals", []):
        check(errs, isinstance(portal.get("position"), list) and len(portal["position"]) == 3, f"portal {portal['id']}: position is required in 0.3")
    for dest in d.get("destinations", []):
        has_point = isinstance(dest.get("position"), list) and len(dest["position"]) == 3
        has_poly = len(dest.get("polygon") or []) >= 4
        check(errs, has_point or has_poly, f"destination {dest['id']}: position or polygon is required in 0.3")
    level_ids = levels
    for zone in d.get("handover_zones", []):
        check(errs, len(zone.get("polygon") or []) >= 4, f"handover zone {zone['id']}: polygon is required in 0.3")
        if zone.get("location_id") in level_ids:
            check(errs, zone.get("level_id") in level_ids, f"handover zone {zone['id']}: in-facility zone needs level_id")
        elif zone.get("level_id"):
            check(errs, zone["level_id"] in level_ids, f"handover zone {zone['id']}: unknown level {zone['level_id']}")
    for facility in d.get("facilities", []):
        tier = facility.get("quality_tier", {}).get("tier", 0)
        if tier >= 2:
            check(
                errs,
                owner_confirmed(facility, version),
                f"facility {facility['id']}: tier {tier} requires an owner verification with status confirmed for dataset_version {version}",
            )

    def needs_centreline(feature, facility):
        if owner_confirmed(feature, version):
            return True
        return bool(facility) and facility.get("quality_tier", {}).get("tier", 0) >= 2

    for edge in d.get("drive_edges", []):
        facility = facility_of.get(edge.get("level_id"))
        if needs_centreline(edge, facility):
            check(errs, isinstance(edge.get("centreline"), list) and len(edge["centreline"]) >= 2, f"edge {edge['id']}: centreline is required when owner-verified or facility tier is 2 or 3")
    for walk in d.get("accessible_paths", []):
        facility = facility_of.get(walk.get("level_id"))
        if needs_centreline(walk, facility):
            check(errs, isinstance(walk.get("centreline"), list) and len(walk["centreline"]) >= 2, f"path {walk['id']}: centreline is required when owner-verified or facility tier is 2 or 3")
    return errs


def review_refs(review, datasets):
    errs = []
    by_site = {d["site"]["id"]: d for d in datasets.values()}
    dataset = by_site.get(review.get("dataset_id"))
    check(errs, dataset is not None, f"review {review.get('id')}: dataset_id {review.get('dataset_id')} is not a site in the loaded datasets")
    if not dataset:
        return errs
    check(errs, review.get("dataset_version") == dataset.get("dataset_version"), f"review {review.get('id')}: dataset_version does not match the dataset")
    known = {dataset["site"]["id"]}
    for key in (
        "frames", "facilities", "zones", "bays", "drive_nodes", "drive_edges", "access_points", "gates",
        "inter_facility_links", "anchor_features", "pillar_grids", "pillars", "localization_aids",
        "pedestrian_portals", "destinations", "handover_zones", "curb_segments", "rules", "rates",
        "certifications", "lifts", "stair_cores", "wayfinding_aids", "safety_features", "accessible_paths",
    ):
        known |= ids(dataset, key)
    for facility in dataset.get("facilities", []):
        for level in facility.get("levels", []):
            known.add(level["id"])
    for entry in review.get("entries", []):
        check(errs, entry.get("feature_id") in known, f"review {review.get('id')}: unknown feature {entry.get('feature_id')}")
        check(errs, entry.get("dataset_version") == dataset.get("dataset_version"), f"review entry {entry.get('feature_id')}: dataset_version does not match the dataset")
    return errs


def bundle_refs(b):
    errs = []
    cid = b["contribution"]["id"]
    obs_ids = set()
    for o in b["feature_observations"]:
        check(errs, o["contribution_id"] == cid, f"observation {o['id']}: contribution_id mismatch")
        obs_ids.add(o["id"])
    for a in b.get("alignment_records", []):
        check(errs, a["contribution_id"] == cid, f"alignment {a['id']}: contribution_id mismatch")
    return errs


def cross_refs(datasets, bundles, registry_doc):
    errs = []
    jur = ids(registry_doc, "jurisdictions")
    repos = ids(registry_doc, "repositories")
    contribs = ids(registry_doc, "contributors")
    red = ids(registry_doc, "redaction_policies")
    res = ids(registry_doc, "resolution_policies")
    camps = ids(registry_doc, "campaigns")
    for j in registry_doc["jurisdictions"]:
        check(errs, j["repository_id"] in repos, f"jurisdiction {j['id']}: unknown repository")
        for u in j.get("licensed_unit_ids", []):
            check(errs, u in contribs, f"jurisdiction {j['id']}: unknown licensed unit {u}")
        if j["routing_mode"] == "via_licensed_unit":
            check(errs, bool(j.get("licensed_unit_ids")), f"jurisdiction {j['id']}: via_licensed_unit needs licensed_unit_ids")
        if "redaction_policy_id" in j:
            check(errs, j["redaction_policy_id"] in red, f"jurisdiction {j['id']}: unknown redaction policy")
        if "resolution_policy_id" in j:
            check(errs, j["resolution_policy_id"] in res, f"jurisdiction {j['id']}: unknown resolution policy")
    for r in registry_doc["repositories"]:
        check(errs, r["jurisdiction_id"] in jur, f"repository {r['id']}: unknown jurisdiction")
    for c in registry_doc.get("contributors", []):
        for j in c["jurisdiction_ids"]:
            check(errs, j in jur, f"contributor {c['id']}: unknown jurisdiction {j}")
    for name, d in datasets.items():
        check(errs, d["site"].get("jurisdiction_id") in jur, f"{name}: site.jurisdiction_id not in registry")
    for name, b in bundles.items():
        c = b["contribution"]
        check(errs, c["contributor_id"] in contribs, f"{name}: unknown contributor {c['contributor_id']}")
        check(errs, c.get("jurisdiction_id") in jur, f"{name}: unknown jurisdiction")
        check(errs, c.get("repository_id") in repos, f"{name}: unknown repository")
        check(errs, c["redaction_attestation"]["policy_id"] in red, f"{name}: unknown redaction policy")
        if "campaign_id" in c:
            check(errs, c["campaign_id"] in camps, f"{name}: unknown campaign")
        jd = next(j for j in registry_doc["jurisdictions"] if j["id"] == c.get("jurisdiction_id"))
        if jd["routing_mode"] == "via_licensed_unit":
            check(errs, c.get("submitted_via_contributor_id") in jd.get("licensed_unit_ids", []), f"{name}: jurisdiction requires submission via a licensed unit")
        pol = next(p for p in registry_doc["redaction_policies"] if p["id"] == c["redaction_attestation"]["policy_id"])
        att = c["redaction_attestation"]
        if pol["on_board_required"]:
            check(errs, att["performed_on_board"], f"{name}: policy requires on-board redaction")
        if pol["trajectories"] == "none":
            check(errs, not att["trajectories_included"], f"{name}: policy forbids trajectories")
        if pol["imagery"] == "none":
            check(errs, not att["imagery_included"], f"{name}: policy forbids imagery")
    return errs


def main(argv):
    registry, schemas = build_registry()
    failures = 0
    errs = schema_errors(registry, schemas)
    print(f"schemas: {len(schemas)} files, {len(errs)} problems")
    for e in errs:
        print("  FAIL", e)
    failures += len(errs)

    files = {}
    if len(argv) > 1:
        for a in argv[1:]:
            p = Path(a)
            files[p.name] = p
    else:
        for name in EXAMPLE_SCHEMAS:
            files[name] = EXAMPLE_DIR / name

    docs = {}
    for name, path in files.items():
        schema_name = EXAMPLE_SCHEMAS.get(name)
        if not schema_name:
            print(f"  SKIP {name}: no schema mapping")
            continue
        doc = load(path)
        docs[name] = (schema_name, doc)
        es = validate_doc(registry, schemas, schema_name, doc)
        extra = []
        if schema_name == "dataset.schema.json":
            extra = dataset_refs(doc)
        elif schema_name == "contribution-bundle.schema.json":
            extra = bundle_refs(doc)
        problems = es + extra
        print(f"{name}: {'OK' if not problems else str(len(problems)) + ' problems'} (schema {schema_name})")
        for e in problems:
            print("  FAIL", e)
        failures += len(problems)

    # cross-file checks need the registry example and at least one other file
    reg = docs.get("registry-example.json")
    if reg:
        datasets = {n: d for n, (s, d) in docs.items() if s == "dataset.schema.json"}
        bundles = {n: d for n, (s, d) in docs.items() if s == "contribution-bundle.schema.json"}
        es = cross_refs(datasets, bundles, reg[1])
        print(f"cross-file references: {'OK' if not es else str(len(es)) + ' problems'}")
        for e in es:
            print("  FAIL", e)
        failures += len(es)

    review = docs.get("review-example.json")
    if review:
        datasets = {n: d for n, (s, d) in docs.items() if s == "dataset.schema.json"}
        es = review_refs(review[1], datasets)
        print(f"review references: {'OK' if not es else str(len(es)) + ' problems'}")
        for e in es:
            print("  FAIL", e)
        failures += len(es)

    # negative tests: the profile rules must actually bite
    if len(argv) == 1:
        neg = 0
        base = load(EXAMPLE_DIR / "merriwa-park-dataset.json")
        t = json.loads(json.dumps(base)); t["profile"] = "static-core"
        neg += 0 if validate_doc(registry, schemas, "dataset.schema.json", t) else 1
        t = json.loads(json.dumps(base)); t["dynamic"] = load(EXAMPLE_DIR / "optional-dynamic-feed.json")
        neg += 0 if validate_doc(registry, schemas, "dataset.schema.json", t) else 1
        t["profile"] = "dynamic"
        neg += 1 if validate_doc(registry, schemas, "dataset.schema.json", t) else 0
        t = json.loads(json.dumps(base)); del t["access_points"][0]["movements_in"]
        neg += 0 if validate_doc(registry, schemas, "dataset.schema.json", t) else 1
        pn = load(EXAMPLE_DIR / "passenger-needs-example.json")
        t = json.loads(json.dumps(pn)); t["storage"] = "cloud"
        neg += 0 if validate_doc(registry, schemas, "passenger-needs.schema.json", t) else 1
        t = json.loads(json.dumps(pn)); t["derived_requirements"]["diagnosis"] = "x"
        neg += 0 if validate_doc(registry, schemas, "passenger-needs.schema.json", t) else 1

        simple = load(EXAMPLE_DIR / "simple-carpark-dataset.json")
        t = json.loads(json.dumps(simple)); del t["pedestrian_portals"][0]["level_id"]
        neg += 0 if validate_doc(registry, schemas, "dataset.schema.json", t) else 1
        t = json.loads(json.dumps(simple)); t["pedestrian_portals"][0]["level_id"] = "missing.level"
        neg += 0 if dataset_refs(t) else 1
        t = json.loads(json.dumps(simple)); del t["access_points"][0]["threshold"]
        neg += 0 if dataset_refs(t) else 1
        t = json.loads(json.dumps(simple))
        t["facilities"][0]["quality_tier"] = {"tier": 2, "accuracy_class": "supervised_self_park"}
        neg += 0 if any("owner verification" in e for e in dataset_refs(t)) else 1
        confirmed = {"role": "owner", "status": "confirmed", "reviewed_at": "2026-11-20T10:00:00+11:00", "dataset_version": simple["dataset_version"]}
        t = json.loads(json.dumps(simple))
        t["facilities"][0]["quality_tier"] = {"tier": 2, "accuracy_class": "supervised_self_park"}
        t["facilities"][0]["verifications"] = [confirmed]
        t["drive_edges"][0].pop("centreline", None)
        neg += 0 if any("centreline is required" in e for e in dataset_refs(t)) else 1
        t = json.loads(json.dumps(simple))
        t["drive_edges"][0].pop("centreline", None)
        neg += 1 if any("centreline is required" in e for e in dataset_refs(t)) else 0
        t = json.loads(json.dumps(simple))
        t["drive_edges"][0].pop("centreline", None)
        t["drive_edges"][0]["verifications"] = [confirmed]
        neg += 0 if any("centreline is required" in e for e in dataset_refs(t)) else 1
        reviewed = load(EXAMPLE_DIR / "review-example.json")
        t = json.loads(json.dumps(reviewed)); t["entries"][0]["feature_id"] = "missing.feature"
        neg += 0 if review_refs(t, {"simple-carpark-dataset.json": simple}) else 1
        print(f"negative tests (profile and role rules reject bad data): {'OK' if neg == 0 else str(neg) + ' did not behave'}")
        failures += neg

    print("RESULT:", "PASS" if failures == 0 else f"FAIL ({failures} problems)")
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
