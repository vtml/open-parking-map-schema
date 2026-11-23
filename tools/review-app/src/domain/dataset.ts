import type { Verification } from "./verification";
import { explainTier, type TierExplanation } from "./quality-tier";

export interface ShapeModel {
  featureId: string;
  kind: "bay" | "threshold" | "centreline" | "ramp" | "gate" | "lift" | "stair" | "portal" | "zone" | "destination" | "handover" | "boundary";
  points: number[][];
  label: string;
  bayType?: string;
}

export interface FeatureModel {
  id: string;
  type: string;
  facilityId?: string;
  levelIds: string[];
  label: string;
  accessible: boolean;
  shapes: ShapeModel[];
  verifications: Verification[];
}

export interface FacilityModel {
  id: string;
  name: string;
  tier: number;
  verifications: Verification[];
  tierExplanation: TierExplanation;
}

export interface LevelModel {
  id: string;
  label: string;
  facilityId: string;
  facilityName: string;
  openAir: boolean;
}

export interface Progress {
  confirmed: number;
  incorrect: number;
  missing: number;
  unchecked: number;
  total: number;
}

export interface DatasetModel {
  siteId: string;
  siteName: string;
  datasetVersion: string;
  opmsVersion: string;
  frameOrigin?: { lat: number; lon: number };
  facilities: FacilityModel[];
  levels: LevelModel[];
  features: FeatureModel[];
  progress: Progress;
  reviewLog: Array<{ featureId: string; verification: Verification }>;
}

type Obj = Record<string, unknown>;

function isObj(value: unknown): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function arr(value: unknown): Obj[] {
  return Array.isArray(value) ? value.filter(isObj) : [];
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function points(value: unknown): number[][] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is number[] => Array.isArray(item) && item.every((n) => typeof n === "number"));
}

function verifications(value: unknown): Verification[] {
  return arr(value).map((record) => ({
    role: text(record.role) as Verification["role"],
    status: text(record.status) as Verification["status"],
    reviewedAt: text(record.reviewed_at),
    datasetVersion: text(record.dataset_version),
    note: text(record.note) || undefined,
    evidenceRef: text(record.evidence_ref) || undefined,
  }));
}

export function progressOf(features: FeatureModel[]): Progress {
  const counts = { confirmed: 0, incorrect: 0, missing: 0, unchecked: 0, total: features.length };
  for (const feature of features) {
    const latest = feature.verifications.at(-1);
    if (!latest) counts.unchecked += 1;
    else if (latest.status === "confirmed") counts.confirmed += 1;
    else if (latest.status === "incorrect") counts.incorrect += 1;
    else if (latest.status === "missing") counts.missing += 1;
    else counts.unchecked += 1;
  }
  return counts;
}

export function indexDataset(raw: unknown): DatasetModel | null {
  if (!isObj(raw) || !isObj(raw.site)) return null;
  const site = raw.site;
  const datasetVersion = text(raw.dataset_version);
  const facilities = arr(raw.facilities);
  const zones = arr(raw.zones);
  const zoneLevel = new Map(zones.map((zone) => [text(zone.id), text(zone.level_id)]));
  const levelFacility = new Map<string, { id: string; name: string }>();
  const levels: LevelModel[] = [];
  const facilityModels: FacilityModel[] = facilities.map((facility) => {
    const tierObj = isObj(facility.quality_tier) ? facility.quality_tier : {};
    const tier = typeof tierObj.tier === "number" ? tierObj.tier : 0;
    const facilityVerifications = verifications(facility.verifications);
    for (const level of arr(facility.levels)) {
      const id = text(level.id);
      levelFacility.set(id, { id: text(facility.id), name: text(facility.name) || text(facility.id) });
      levels.push({
        id,
        label: text(level.label) || id,
        facilityId: text(facility.id),
        facilityName: text(facility.name) || text(facility.id),
        openAir: level.open_air === true || text(level.label).toLowerCase() === "roof",
      });
    }
    return {
      id: text(facility.id),
      name: text(facility.name) || text(facility.id),
      tier,
      verifications: facilityVerifications,
      tierExplanation: explainTier(tier, facilityVerifications, datasetVersion),
    };
  });
  const features: FeatureModel[] = [];
  const push = (feature: FeatureModel) => {
    if (feature.id) features.push(feature);
  };
  const facilityFor = (levelId: string | undefined) => (levelId ? levelFacility.get(levelId)?.id : undefined);

  for (const bay of arr(raw.bays)) {
    const levelId = zoneLevel.get(text(bay.zone_id));
    const types = Array.isArray(bay.bay_types) ? bay.bay_types.filter((item): item is string => typeof item === "string") : [];
    push({
      id: text(bay.id),
      type: "bay",
      facilityId: facilityFor(levelId),
      levelIds: levelId ? [levelId] : [],
      label: text(bay.painted_label) || text(bay.id),
      accessible: types.includes("accessible"),
      shapes: [{ featureId: text(bay.id), kind: "bay", points: points(bay.polygon), label: types[0] ?? "bay", bayType: types[0] }],
      verifications: verifications(bay.verifications),
    });
  }
  for (const edge of arr(raw.drive_edges)) {
    const levelId = text(edge.level_id);
    const line = points(edge.centreline);
    push({
      id: text(edge.id),
      type: "drive_edge",
      facilityId: facilityFor(levelId),
      levelIds: levelId ? [levelId] : [],
      label: text(edge.kind) || "edge",
      accessible: false,
      shapes: line.length ? [{ featureId: text(edge.id), kind: text(edge.kind) === "ramp" ? "ramp" : "centreline", points: line, label: text(edge.kind) }] : [],
      verifications: verifications(edge.verifications),
    });
  }
  for (const point of arr(raw.access_points)) {
    const levelsFor = [text(point.level_id), ...(Array.isArray(point.served_level_ids) ? point.served_level_ids.filter((item): item is string => typeof item === "string") : [])].filter(Boolean);
    const shapes: ShapeModel[] = [];
    const line = points(point.threshold);
    if (line.length) shapes.push({ featureId: text(point.id), kind: "threshold", points: line, label: text(point.role) });
    push({
      id: text(point.id),
      type: "access_point",
      facilityId: text(point.facility_id),
      levelIds: [...new Set(levelsFor)],
      label: `${text(point.role) || "access"} ${text(point.id)}`,
      accessible: false,
      shapes,
      verifications: verifications(point.verifications),
    });
  }
  for (const gate of arr(raw.gates)) {
    const line = points(gate.threshold);
    const geometry = line.length ? line : Array.isArray(gate.position) ? [gate.position as number[]] : [];
    const shapes: ShapeModel[] = geometry.length
      ? [{ featureId: text(gate.id), kind: "gate", points: geometry, label: text(gate.kind) }]
      : [];
    push({
      id: text(gate.id),
      type: "gate",
      facilityId: facilityFor(text(gate.level_id)),
      levelIds: text(gate.level_id) ? [text(gate.level_id)] : [],
      label: `${text(gate.kind) || "gate"} ${text(gate.id)}`,
      accessible: false,
      shapes,
      verifications: verifications(gate.verifications),
    });
  }
  for (const item of [...arr(raw.lifts), ...arr(raw.stair_cores)]) {
    const levelIds = Array.isArray(item.level_ids) ? item.level_ids.filter((id): id is string => typeof id === "string") : [];
    const kind = item.footprint && text(item.kind) !== "stairs" && text(item.kind) !== "stair_core" ? "lift" : text(item.kind) === "passenger" || item.car_width_m ? "lift" : "stair";
    const type = kind === "lift" ? "lift" : "stair_core";
    push({
      id: text(item.id),
      type,
      facilityId: facilityFor(levelIds[0]),
      levelIds,
      label: text(item.id),
      accessible: type === "lift",
      shapes: [{ featureId: text(item.id), kind: type === "lift" ? "lift" : "stair", points: points(item.footprint), label: type }],
      verifications: verifications(item.verifications),
    });
  }
  for (const portal of arr(raw.pedestrian_portals)) {
    const levelId = text(portal.level_id);
    push({
      id: text(portal.id),
      type: "pedestrian_portal",
      facilityId: facilityFor(levelId),
      levelIds: levelId ? [levelId] : [],
      label: text(portal.kind) || text(portal.id),
      accessible: portal.step_free === true,
      shapes: Array.isArray(portal.position) ? [{ featureId: text(portal.id), kind: "portal", points: [portal.position as number[]], label: "portal" }] : [],
      verifications: verifications(portal.verifications),
    });
  }
  for (const zone of zones) {
    const levelId = text(zone.level_id);
    push({
      id: text(zone.id),
      type: "zone",
      facilityId: facilityFor(levelId),
      levelIds: levelId ? [levelId] : [],
      label: text(zone.name) || text(zone.id),
      accessible: false,
      shapes: [{ featureId: text(zone.id), kind: "zone", points: points(zone.polygon), label: "zone" }],
      verifications: verifications(zone.verifications),
    });
  }
  for (const zone of arr(raw.handover_zones)) {
    const levelId = text(zone.level_id);
    push({
      id: text(zone.id),
      type: "handover_zone",
      facilityId: facilityFor(levelId),
      levelIds: levelId ? [levelId] : [],
      label: text(zone.kind) || text(zone.id),
      accessible: true,
      shapes: [{ featureId: text(zone.id), kind: "handover", points: points(zone.polygon), label: "drop-off" }],
      verifications: verifications(zone.verifications),
    });
  }
  for (const dest of arr(raw.destinations)) {
    const levelId = text(dest.level_id);
    const polygon = points(dest.polygon);
    const shapes: ShapeModel[] = polygon.length
      ? [{ featureId: text(dest.id), kind: "destination", points: polygon, label: text(dest.name) }]
      : Array.isArray(dest.position)
        ? [{ featureId: text(dest.id), kind: "destination", points: [dest.position as number[]], label: text(dest.name) }]
        : [];
    push({
      id: text(dest.id),
      type: "destination",
      facilityId: facilityFor(levelId),
      levelIds: levelId ? [levelId] : [],
      label: text(dest.name) || text(dest.id),
      accessible: false,
      shapes,
      verifications: verifications(dest.verifications),
    });
  }
  for (const walk of arr(raw.accessible_paths)) {
    const levelId = text(walk.level_id);
    push({
      id: text(walk.id),
      type: "accessible_path",
      facilityId: facilityFor(levelId),
      levelIds: levelId ? [levelId] : [],
      label: text(walk.id),
      accessible: true,
      shapes: [{ featureId: text(walk.id), kind: "centreline", points: points(walk.centreline), label: "path" }],
      verifications: verifications(walk.verifications),
    });
  }
  const origin = arr(raw.frames)[0];
  const originWgs = origin && isObj(origin.origin_wgs84) ? origin.origin_wgs84 : undefined;
  return {
    siteId: text(site.id),
    siteName: text(site.name) || text(site.id),
    datasetVersion,
    opmsVersion: text(raw.opms_version),
    frameOrigin: originWgs && typeof originWgs.lat === "number" && typeof originWgs.lon === "number" ? { lat: originWgs.lat, lon: originWgs.lon } : undefined,
    facilities: facilityModels,
    levels,
    features,
    progress: progressOf(features),
    reviewLog: [],
  };
}
