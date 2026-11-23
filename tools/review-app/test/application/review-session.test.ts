import { describe, expect, it } from "vitest";
import simple from "../../../../examples/simple-carpark-dataset.json";
import {
  alignControlPoints,
  exportReview,
  importReview,
  levelView,
  explainFacilityTier,
  loadDataset,
  recordVerification,
  type SchemaValidatorPort,
} from "../../src/application/review-session";

const clock = { now: () => "2026-11-23T12:00:00+11:00" };

function passingSchemas(): SchemaValidatorPort {
  return { validateDataset: () => [], validateReview: () => [] };
}

describe("review session", () => {
  it("loads a valid dataset and reports no issues", () => {
    const loaded = loadDataset(simple, passingSchemas());
    expect(loaded.issues).toEqual([]);
    expect(loaded.dataset?.siteName).toMatch(/Wattle Reserve/i);
    expect(loaded.dataset?.features.some((feature) => feature.id === "wr.ap1")).toBe(true);
  });

  it("turns a schema error into plain English linked to the feature", () => {
    const schemas: SchemaValidatorPort = {
      validateDataset: () => [{ instancePath: "/bays/0/polygon", message: "must NOT have fewer than 4 items" }],
      validateReview: () => [],
    };
    const loaded = loadDataset(simple, schemas);
    const bayId = (simple.bays[0] as { id: string }).id;
    const issue = loaded.issues.find((item) => item.featureId === bayId);
    expect(issue?.message).toMatch(/polygon/i);
    expect(issue?.message).toMatch(/bay/i);
  });

  it("records an owner confirmation on an entrance", () => {
    const loaded = loadDataset(simple, passingSchemas());
    const next = recordVerification(loaded.dataset!, "wr.ap1", {
      role: "owner",
      status: "confirmed",
      note: "Threshold matches the gate line.",
    }, clock);
    const entrance = next.features.find((feature) => feature.id === "wr.ap1");
    expect(entrance?.verifications.at(-1)?.status).toBe("confirmed");
    expect(next.progress.confirmed).toBe(1);
  });

  it("marks an accessible bay incorrect with a note and evidence reference", () => {
    const loaded = loadDataset(simple, passingSchemas());
    const next = recordVerification(loaded.dataset!, "wr.g.b13", {
      role: "operator",
      status: "incorrect",
      note: "The shared zone is blocked.",
      evidenceRef: "photo:fictional-bay-13",
    }, clock);
    const bay = next.features.find((feature) => feature.id === "wr.g.b13");
    expect(bay?.accessible).toBe(true);
    expect(bay?.verifications.at(-1)).toMatchObject({
      status: "incorrect",
      note: "The shared zone is blocked.",
      evidenceRef: "photo:fictional-bay-13",
    });
  });

  it("exports a review document for the dataset version", () => {
    const loaded = loadDataset(simple, passingSchemas());
    const next = recordVerification(loaded.dataset!, "wr.ap1", { role: "owner", status: "confirmed" }, clock);
    const review = exportReview(next, { role: "owner", organisation: "Fictional Reserve Office" }, clock) as {
      opms_version: string;
      dataset_id: string;
      dataset_version: string;
      reviewer_role: string;
      reviewer_ref: string;
      reviewed_at: string;
      entries: Array<{ feature_id: string; status: string; dataset_version: string }>;
    };
    expect(review.opms_version).toBe("0.3.0");
    expect(review.dataset_id).toBe("wr");
    expect(review.dataset_version).toBe(next.datasetVersion);
    expect(review.reviewer_role).toBe("owner");
    expect(review.reviewer_ref).toBe("Fictional Reserve Office");
    expect(review.reviewed_at).toBe(clock.now());
    expect(review.entries).toEqual([
      expect.objectContaining({ feature_id: "wr.ap1", status: "confirmed", dataset_version: next.datasetVersion }),
    ]);
  });

  it("imports a previous review and restores the entrance status", () => {
    const loaded = loadDataset(simple, passingSchemas());
    const imported = importReview(loaded.dataset!, {
      opms_version: "0.3.0",
      id: "wr.review.previous",
      dataset_id: "wr",
      dataset_version: loaded.dataset!.datasetVersion,
      reviewer_role: "owner",
      reviewer_ref: "Fictional Reserve Office",
      reviewed_at: "2026-11-22T09:00:00+11:00",
      entries: [{
        feature_id: "wr.ap1",
        role: "owner",
        status: "confirmed",
        reviewed_at: "2026-11-22T09:00:00+11:00",
        dataset_version: loaded.dataset!.datasetVersion,
        note: "Checked on site.",
      }],
    }, passingSchemas());
    expect(imported.issues).toEqual([]);
    expect(imported.dataset.features.find((feature) => feature.id === "wr.ap1")?.verifications[0]?.note).toBe("Checked on site.");
  });

  it("refuses a tier 2 claim without owner confirmation in the tier explanation", () => {
    const loaded = loadDataset(simple, passingSchemas());
    const facility = { ...loaded.dataset!.facilities[0], tier: 2, verifications: [] };
    const explained = explainFacilityTier(facility, loaded.dataset!.datasetVersion);
    expect(explained.claimAllowed).toBe(false);
    expect(explained.summary).toMatch(/owner/i);
  });

  it("aligns an overlay from two control points", () => {
    const aligned = alignControlPoints([
      { image: [0, 0], map: [5, 5] },
      { image: [10, 0], map: [15, 5] },
    ]);
    const point = aligned.apply([10, 0]);
    expect(point[0]).toBeCloseTo(15, 5);
    expect(point[1]).toBeCloseTo(5, 5);
  });

  it("builds a level view that includes bays and the entrance threshold", () => {
    const loaded = loadDataset(simple, passingSchemas());
    const view = levelView(loaded.dataset!, "wr.g");
    expect(view.shapes.some((shape) => shape.featureId === "wr.g.b13" && shape.kind === "bay")).toBe(true);
    expect(view.shapes.some((shape) => shape.featureId === "wr.ap1" && shape.kind === "threshold")).toBe(true);
    expect(view.textAlternative.length).toBeGreaterThan(0);
  });
});
