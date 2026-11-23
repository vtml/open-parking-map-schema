import { describe, expect, it } from "vitest";
import { indexDataset } from "../../src/domain/dataset";
import { validateDataset } from "../../src/domain/validation-rules";

describe("indexing and extra reference errors", () => {
  it("indexes lifts, stairs, gates and destination polygons", () => {
    const model = indexDataset({
      opms_version: "0.3.0",
      dataset_version: "1",
      site: { id: "s", name: "Site" },
      facilities: [{ id: "f", name: "Lot", frame_id: "fr", site_id: "s", levels: [{ id: "g", label: "Roof", open_air: true }], quality_tier: { tier: 1 } }],
      frames: [{ id: "fr", origin_wgs84: { lat: 1, lon: 2, h_ellipsoid_m: 0 } }],
      gates: [{ id: "g1", level_id: "g", kind: "barrier", position: [1, 2, 0] }],
      lifts: [{ id: "lift-a", kind: "passenger", car_width_m: 1.2, level_ids: ["g"], footprint: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]] }],
      stair_cores: [{ id: "stair-a", kind: "stair_core", level_ids: ["g"], footprint: [[2, 0, 0], [3, 0, 0], [3, 1, 0], [2, 1, 0]] }],
      destinations: [{ id: "door", name: "Door", level_id: "g", portal_ids: [], polygon: [[0, 0, 0], [2, 0, 0], [2, 2, 0], [0, 2, 0]] }],
    });
    expect(model?.frameOrigin).toEqual({ lat: 1, lon: 2 });
    expect(model?.features.map((feature) => feature.type).sort()).toEqual(["destination", "gate", "lift", "stair_core"]);
    expect(model?.levels[0].openAir).toBe(true);
  });

  it("reports several missing references in plain English", () => {
    const issues = validateDataset({
      opms_version: "0.3.0",
      dataset_version: "1",
      site: { id: "s", name: "Site", facility_ids: ["missing-facility"] },
      facilities: [{ id: "f", site_id: "other", frame_id: "missing-frame", levels: [{ id: "g", label: "G", entry_anchor_ids: ["missing-anchor"] }], quality_tier: { tier: 2 }, avp: { handover_zone_ids: ["missing-hz"] } }],
      bays: [{ id: "b1", zone_id: "missing-zone", bay_types: ["accessible"], accessibility: {}, rule_ids: ["missing-rule"] }],
      drive_edges: [{ id: "e1", from_node: "missing-node", to_node: "missing-node", level_id: "g", kind: "aisle" }],
      access_points: [{ id: "ap", facility_id: "missing-facility", served_level_ids: ["missing-level"], gate_ids: ["missing-gate"] }],
      gates: [{ id: "gate", host_id: "missing-host" }],
      rules: [{ id: "r1", applies_to: ["missing-target"], payment: { rate_id: "missing-rate" } }],
    });
    expect(issues.length).toBeGreaterThan(8);
    expect(issues.some((item) => item.featureId === "b1" && /zone/i.test(item.message))).toBe(true);
    expect(issues.some((item) => /tier 2/i.test(item.message))).toBe(true);
  });
});
