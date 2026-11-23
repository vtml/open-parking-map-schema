import { indexDataset, progressOf, type DatasetModel, type FacilityModel, type LevelModel } from "../domain/dataset";
import type { ShapeModel } from "../domain/dataset";
import { explainSchemaFinding } from "../domain/schema-errors";
import { explainTier, type TierExplanation } from "../domain/quality-tier";
import { alignOverlay, type Affine, type ControlPoint } from "../domain/transform";
import { validateDataset, type ValidationIssue } from "../domain/validation-rules";
import type { Verification, VerificationStatus, ReviewerRole } from "../domain/verification";
import type { ClockPort, SchemaValidatorPort } from "./ports";

export type { SchemaValidatorPort };

export interface LoadResult {
  dataset: DatasetModel | null;
  issues: ValidationIssue[];
}

export interface LevelView {
  level: LevelModel | undefined;
  shapes: ShapeModel[];
  textAlternative: string[];
}

export interface VerificationInput {
  role: ReviewerRole;
  status: VerificationStatus;
  note?: string;
  evidenceRef?: string;
}

export interface ReviewerIdentity {
  role: ReviewerRole;
  organisation: string;
}

export function loadDataset(raw: unknown, schemas: SchemaValidatorPort): LoadResult {
  const schemaIssues = schemas.validateDataset(raw).map((finding) => explainSchemaFinding(raw, finding));
  const crossIssues = validateDataset(raw);
  const issues = [...schemaIssues, ...crossIssues];
  return { dataset: indexDataset(raw), issues };
}

export function recordVerification(dataset: DatasetModel, featureId: string, input: VerificationInput, clock: ClockPort): DatasetModel {
  const verification: Verification = {
    role: input.role,
    status: input.status,
    note: input.note,
    evidenceRef: input.evidenceRef,
    reviewedAt: clock.now(),
    datasetVersion: dataset.datasetVersion,
  };
  const features = dataset.features.map((feature) => {
    if (feature.id !== featureId) return feature;
    const withoutRole = feature.verifications.filter((item) => item.role !== input.role);
    return { ...feature, verifications: [...withoutRole, verification] };
  });
  const reviewLog = [...dataset.reviewLog.filter((item) => !(item.featureId === featureId && item.verification.role === input.role)), { featureId, verification }];
  return { ...dataset, features, reviewLog, progress: progressOf(features) };
}

export function exportReview(dataset: DatasetModel, reviewer: ReviewerIdentity, clock: ClockPort): unknown {
  const entries = dataset.reviewLog.map((item) => ({
    feature_id: item.featureId,
    role: item.verification.role,
    status: item.verification.status,
    ...(item.verification.note ? { note: item.verification.note } : {}),
    ...(item.verification.evidenceRef ? { evidence_ref: item.verification.evidenceRef } : {}),
    reviewed_at: item.verification.reviewedAt,
    dataset_version: item.verification.datasetVersion,
  }));
  const confirmed = dataset.progress.confirmed;
  const incorrect = dataset.progress.incorrect;
  const status = incorrect > 0 ? "rejected" : confirmed === dataset.progress.total && dataset.progress.total > 0 ? "accepted" : "partial";
  const stamp = clock.now().toLowerCase().replace(/[^a-z0-9]+/g, "");
  return {
    _note: "Review exported by Check my car park. Example places remain fictional. This is not an endorsement.",
    opms_version: "0.3.0",
    id: `review.${dataset.siteId}.${stamp}`,
    dataset_id: dataset.siteId,
    dataset_version: dataset.datasetVersion,
    reviewer_role: reviewer.role,
    reviewer_ref: reviewer.organisation,
    reviewed_at: clock.now(),
    sign_off: {
      status,
      note: "Organisation label only. Do not put a person's name here.",
    },
    entries,
  };
}

export function importReview(dataset: DatasetModel, review: unknown, schemas: SchemaValidatorPort): { dataset: DatasetModel; issues: ValidationIssue[] } {
  const schemaIssues = schemas.validateReview(review).map((finding) => ({
    path: finding.instancePath || "/",
    message: `The review file has a problem: ${finding.message}.`,
  }));
  if (!review || typeof review !== "object") {
    return { dataset, issues: [...schemaIssues, { path: "/", message: "This file is not a review document." }] };
  }
  const body = review as Record<string, unknown>;
  const issues = [...schemaIssues];
  if (body.dataset_id !== dataset.siteId) issues.push({ path: "/dataset_id", message: `This review is for dataset ${String(body.dataset_id)}, not ${dataset.siteId}.` });
  if (body.dataset_version !== dataset.datasetVersion) issues.push({ path: "/dataset_version", message: "This review is for a different dataset version." });
  if (issues.length) return { dataset, issues };
  const entries = Array.isArray(body.entries) ? body.entries : [];
  let next = dataset;
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Record<string, unknown>;
    next = recordVerification(next, String(item.feature_id), {
      role: item.role as VerificationInput["role"],
      status: item.status as VerificationInput["status"],
      note: typeof item.note === "string" ? item.note : undefined,
      evidenceRef: typeof item.evidence_ref === "string" ? item.evidence_ref : undefined,
    }, { now: () => String(item.reviewed_at) });
  }
  return { dataset: next, issues: [] };
}

export function explainFacilityTier(facility: FacilityModel, datasetVersion: string): TierExplanation {
  return explainTier(facility.tier, facility.verifications, datasetVersion);
}

export function alignControlPoints(points: ControlPoint[]): Affine {
  return alignOverlay(points);
}

export function levelView(dataset: DatasetModel, levelId: string): LevelView {
  const level = dataset.levels.find((item) => item.id === levelId);
  const shapes = dataset.features
    .filter((feature) => feature.levelIds.includes(levelId))
    .flatMap((feature) => feature.shapes);
  const textAlternative = shapes.map((shape) => `${shape.kind} ${shape.featureId}: ${shape.label}`);
  return { level, shapes, textAlternative };
}

export type { Affine, ControlPoint };
