import { Given, When, Then, Before } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import simple from "../../../../examples/simple-carpark-dataset.json";
import { createAjvValidator } from "../../src/adapters/ajv-schema-validator";
import { readSchemaDocuments } from "../../src/adapters/schema-documents";
import {
  alignControlPoints,
  explainFacilityTier,
  exportReview,
  loadDataset,
  recordVerification,
  type LoadResult,
} from "../../src/application/review-session";
import type { DatasetModel } from "../../src/domain/dataset";

const schemas = createAjvValidator(readSchemaDocuments());
const clock = { now: () => "2026-11-23T12:00:00+11:00" };

let loaded: LoadResult;
let dataset: DatasetModel;
let brokenBayId = "";
let review: Record<string, unknown> | undefined;
let aligned: ReturnType<typeof alignControlPoints> | undefined;

Before(() => {
  review = undefined;
  aligned = undefined;
});

Given("a valid Wattle Reserve dataset", () => {
  loaded = loadDataset(simple, schemas);
  assert.equal(loaded.issues.length, 0);
  assert.ok(loaded.dataset);
  dataset = loaded.dataset;
});

Given("a Wattle Reserve dataset whose first bay names a missing zone", () => {
  const copy = structuredClone(simple) as { bays: Array<{ id: string; zone_id: string }> };
  brokenBayId = copy.bays[0].id;
  copy.bays[0].zone_id = "missing.zone";
  loaded = loadDataset(copy, schemas);
  assert.ok(loaded.dataset);
  dataset = loaded.dataset;
});

When("the owner confirms entrance {string}", (id: string) => {
  dataset = recordVerification(dataset, id, { role: "owner", status: "confirmed", note: "Threshold matches the gate." }, clock);
});

When("the operator marks accessible bay {string} incorrect with note {string} and evidence {string}", (id: string, note: string, evidence: string) => {
  dataset = recordVerification(dataset, id, { role: "operator", status: "incorrect", note, evidenceRef: evidence }, clock);
});

When("the owner exports a review as {string}", (organisation: string) => {
  review = exportReview(dataset, { role: "owner", organisation }, clock) as Record<string, unknown>;
});

When("the facility tier is raised to {int} without an owner confirmation", (tier: number) => {
  dataset = {
    ...dataset,
    facilities: dataset.facilities.map((facility, index) => index === 0 ? { ...facility, tier, verifications: [] } : facility),
  };
});

When("the owner aligns image point {int},{int} to map point {int},{int} and image point {int},{int} to map point {int},{int}", (
  ix: number, iy: number, mx: number, my: number, ix2: number, iy2: number, mx2: number, my2: number,
) => {
  aligned = alignControlPoints([
    { image: [ix, iy], map: [mx, my] },
    { image: [ix2, iy2], map: [mx2, my2] },
  ]);
});

Then("entrance {string} is confirmed", (id: string) => {
  const feature = dataset.features.find((item) => item.id === id);
  assert.equal(feature?.verifications.at(-1)?.status, "confirmed");
  assert.equal(feature?.verifications.at(-1)?.role, "owner");
});

Then("bay {string} is incorrect with that note and evidence", (id: string) => {
  const feature = dataset.features.find((item) => item.id === id);
  assert.equal(feature?.accessible, true);
  assert.equal(feature?.verifications.at(-1)?.status, "incorrect");
  assert.equal(feature?.verifications.at(-1)?.note, "Shared zone is blocked");
  assert.equal(feature?.verifications.at(-1)?.evidenceRef, "photo:fictional-bay-13");
});

Then("a plain-English error points at that bay and mentions the zone", () => {
  const issue = loaded.issues.find((item) => item.featureId === brokenBayId);
  assert.ok(issue, "expected an issue for the bay");
  assert.match(issue.message, /zone/i);
  assert.match(issue.message, /does not exist/i);
});

Then("the review names dataset {string} and entrance {string} as confirmed", (siteId: string, featureId: string) => {
  assert.ok(review);
  assert.equal(review.dataset_id, siteId);
  const entries = review.entries as Array<{ feature_id: string; status: string }>;
  assert.ok(entries.some((entry) => entry.feature_id === featureId && entry.status === "confirmed"));
});

Then("the review document satisfies the review schema", () => {
  const findings = schemas.validateReview(review);
  assert.deepEqual(findings, []);
});

Then("the tier claim is refused", () => {
  const explained = explainFacilityTier(dataset.facilities[0], dataset.datasetVersion);
  assert.equal(explained.claimAllowed, false);
  assert.match(explained.summary, /owner/i);
});

Then("image point {int},{int} lands on map point {int},{int}", (ix: number, iy: number, mx: number, my: number) => {
  assert.ok(aligned);
  const point = aligned.apply([ix, iy]);
  assert.ok(Math.abs(point[0] - mx) < 1e-6);
  assert.ok(Math.abs(point[1] - my) < 1e-6);
});
