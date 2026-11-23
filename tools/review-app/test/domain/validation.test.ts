import { describe, expect, it } from "vitest";
import { validateDataset } from "../../src/domain/validation-rules";
import simple from "../../../../examples/simple-carpark-dataset.json";
import merriwa from "../../../../examples/merriwa-park-dataset.json";

describe("dataset cross-reference rules", () => {
  it("accepts the bundled v0.3 examples", () => {
    expect(validateDataset(simple)).toEqual([]);
    expect(validateDataset(merriwa)).toEqual([]);
  });

  it("explains a bay that names a missing zone, and points at that bay", () => {
    const dataset = structuredClone(simple) as Record<string, unknown>;
    const bays = dataset.bays as Array<Record<string, unknown>>;
    bays[0].zone_id = "missing.zone";
    const issues = validateDataset(dataset);
    const issue = issues.find((item) => item.featureId === bays[0].id);
    expect(issue).toBeDefined();
    expect(issue?.message).toMatch(/zone/i);
    expect(issue?.message).toMatch(/does not exist/i);
  });

  it("explains a portal whose level id is not a level", () => {
    const dataset = structuredClone(simple) as Record<string, unknown>;
    const portals = dataset.pedestrian_portals as Array<Record<string, unknown>>;
    portals[0].level_id = "not-a-level";
    const issues = validateDataset(dataset);
    expect(issues.some((item) => item.featureId === portals[0].id && /level/i.test(item.message))).toBe(true);
  });

  it("requires a centreline on a tier 2 facility edge and not on tier 1", () => {
    const tier1 = structuredClone(simple) as { drive_edges: Array<Record<string, unknown>> };
    delete tier1.drive_edges[0].centreline;
    expect(validateDataset(tier1).some((item) => /centreline/i.test(item.message))).toBe(false);

    const tier2 = structuredClone(simple) as {
      dataset_version: string;
      facilities: Array<Record<string, unknown>>;
      drive_edges: Array<Record<string, unknown>>;
    };
    tier2.facilities[0].quality_tier = { tier: 2, accuracy_class: "supervised_self_park" };
    tier2.facilities[0].verifications = [
      {
        role: "owner",
        status: "confirmed",
        reviewed_at: "2026-11-20T10:00:00+11:00",
        dataset_version: tier2.dataset_version,
      },
    ];
    delete tier2.drive_edges[0].centreline;
    const issues = validateDataset(tier2);
    expect(issues.some((item) => item.featureId === tier2.drive_edges[0].id && /centreline/i.test(item.message))).toBe(true);
  });
});
