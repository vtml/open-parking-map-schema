import { centrelineRequired } from "./quality-tier";
import type { Verification } from "./verification";

export interface ValidationIssue {
  message: string;
  featureId?: string;
  path: string;
}

type Obj = Record<string, unknown>;

function isObj(value: unknown): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asArr(value: unknown): Obj[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isObj);
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function idOf(value: Obj): string {
  return text(value.id);
}

function idSet(list: Obj[]): Set<string> {
  return new Set(list.map(idOf).filter(Boolean));
}

function issue(featureId: string | undefined, path: string, message: string): ValidationIssue {
  return { featureId, path, message };
}

function verificationsOf(value: Obj): Verification[] {
  return asArr(value.verifications).map((record) => ({
    role: text(record.role) as Verification["role"],
    status: text(record.status) as Verification["status"],
    reviewedAt: text(record.reviewed_at),
    datasetVersion: text(record.dataset_version),
    note: text(record.note) || undefined,
    evidenceRef: text(record.evidence_ref) || undefined,
  }));
}

function pointOk(value: unknown): boolean {
  return Array.isArray(value) && value.length === 3 && value.every((item) => typeof item === "number");
}

function lineOk(value: unknown, min: number): boolean {
  return Array.isArray(value) && value.length >= min;
}

export function validateDataset(raw: unknown): ValidationIssue[] {
  if (!isObj(raw) || !isObj(raw.site)) {
    return [issue(undefined, "/", "This file is not an OPMS dataset. It needs a site object.")];
  }
  const site = raw.site;
  const siteId = idOf(site);
  const version = text(raw.dataset_version);
  const isV03 = text(raw.opms_version).startsWith("0.3");
  const facilities = asArr(raw.facilities);
  const frames = asArr(raw.frames);
  const zones = asArr(raw.zones);
  const bays = asArr(raw.bays);
  const nodes = asArr(raw.drive_nodes);
  const edges = asArr(raw.drive_edges);
  const access = asArr(raw.access_points);
  const gates = asArr(raw.gates);
  const links = asArr(raw.inter_facility_links);
  const anchors = asArr(raw.anchor_features);
  const grids = asArr(raw.pillar_grids);
  const pillars = asArr(raw.pillars);
  const portals = asArr(raw.pedestrian_portals);
  const destinations = asArr(raw.destinations);
  const handovers = asArr(raw.handover_zones);
  const curbs = asArr(raw.curb_segments);
  const rules = asArr(raw.rules);
  const rates = asArr(raw.rates);
  const certs = asArr(raw.certifications);
  const lifts = asArr(raw.lifts);
  const stairs = asArr(raw.stair_cores);
  const aids = asArr(raw.wayfinding_aids);
  const safety = asArr(raw.safety_features);
  const paths = asArr(raw.accessible_paths);
  const levels: Obj[] = facilities.flatMap((facility) => asArr(facility.levels));

  const frameIds = idSet(frames);
  const facilityIds = idSet(facilities);
  const levelIds = idSet(levels);
  const zoneIds = idSet(zones);
  const nodeIds = idSet(nodes);
  const edgeIds = idSet(edges);
  const gateIds = idSet(gates);
  const linkIds = idSet(links);
  const anchorIds = idSet(anchors);
  const gridIds = idSet(grids);
  const portalIds = idSet(portals);
  const destIds = idSet(destinations);
  const handoverIds = idSet(handovers);
  const curbIds = idSet(curbs);
  const ruleIds = idSet(rules);
  const rateIds = idSet(rates);
  const certIds = idSet(certs);
  const liftIds = idSet(lifts);
  const aidIds = idSet(aids);
  const pathIds = idSet(paths);
  const bayIds = idSet(bays);
  const knownTargets = new Set<string>([...facilityIds, ...levelIds, ...zoneIds, ...bayIds, ...nodeIds, ...edgeIds, ...gateIds, ...linkIds, ...handoverIds, ...curbIds]);
  const accessIds = idSet(access);
  const facilityOfLevel = new Map<string, Obj>();
  for (const facility of facilities) {
    for (const level of asArr(facility.levels)) facilityOfLevel.set(idOf(level), facility);
  }

  const issues: ValidationIssue[] = [];
  const add = (featureId: string | undefined, path: string, message: string) => issues.push(issue(featureId, path, message));

  for (const facilityId of asArrIds(site.facility_ids)) {
    if (!facilityIds.has(facilityId)) add(siteId, "/site/facility_ids", `Site ${siteId} lists facility ${facilityId}, which does not exist.`);
  }
  for (const facility of facilities) {
    const id = idOf(facility);
    if (text(facility.site_id) !== siteId) add(id, `/facilities/${id}/site_id`, `Facility ${id} says it belongs to site ${text(facility.site_id)}, which is not this site.`);
    if (!frameIds.has(text(facility.frame_id))) add(id, `/facilities/${id}/frame_id`, `Facility ${id} names frame ${text(facility.frame_id)}, which does not exist.`);
    if (!asArrIds(site.facility_ids).includes(id)) add(id, `/facilities/${id}`, `Facility ${id} is not listed on the site.`);
    if (facility.rate_id && !rateIds.has(text(facility.rate_id))) add(id, `/facilities/${id}/rate_id`, `Facility ${id} names rate ${text(facility.rate_id)}, which does not exist.`);
    const tierObj = isObj(facility.quality_tier) ? facility.quality_tier : {};
    for (const certId of asArrIds(tierObj.certification_ids)) {
      if (!certIds.has(certId)) add(id, `/facilities/${id}/quality_tier`, `Facility ${id} names certification ${certId}, which does not exist.`);
    }
    for (const level of asArr(facility.levels)) {
      for (const anchorId of asArrIds(level.entry_anchor_ids)) {
        if (!anchorIds.has(anchorId)) add(idOf(level), `/levels/${idOf(level)}`, `Level ${idOf(level)} names anchor ${anchorId}, which does not exist.`);
      }
    }
    const avp = isObj(facility.avp) ? facility.avp : {};
    for (const zoneId of asArrIds(avp.handover_zone_ids)) {
      if (!handoverIds.has(zoneId)) add(id, `/facilities/${id}/avp`, `Facility ${id} names handover zone ${zoneId}, which does not exist.`);
    }
  }
  for (const zone of zones) {
    if (!levelIds.has(text(zone.level_id))) add(idOf(zone), `/zones/${idOf(zone)}`, `Zone ${idOf(zone)} names level ${text(zone.level_id)}, which does not exist.`);
  }
  for (const bay of bays) {
    if (!zoneIds.has(text(bay.zone_id))) add(idOf(bay), `/bays/${idOf(bay)}/zone_id`, `Bay ${idOf(bay)} names zone ${text(bay.zone_id)}, which does not exist in this dataset.`);
    for (const ruleId of asArrIds(bay.rule_ids)) {
      if (!ruleIds.has(ruleId)) add(idOf(bay), `/bays/${idOf(bay)}/rule_ids`, `Bay ${idOf(bay)} names rule ${ruleId}, which does not exist.`);
    }
    const accessInfo = isObj(bay.accessibility) ? bay.accessibility : undefined;
    if (accessInfo && asArrIds(bay.bay_types).includes("accessible") && !isObj(accessInfo.shared_zone)) {
      add(idOf(bay), `/bays/${idOf(bay)}/accessibility`, `Accessible bay ${idOf(bay)} has accessibility data but no shared zone.`);
    }
  }
  for (const node of nodes) {
    if (!levelIds.has(text(node.level_id))) add(idOf(node), `/drive_nodes/${idOf(node)}`, `Drive node ${idOf(node)} names level ${text(node.level_id)}, which does not exist.`);
  }
  for (const edge of edges) {
    if (!nodeIds.has(text(edge.from_node)) || !nodeIds.has(text(edge.to_node))) {
      add(idOf(edge), `/drive_edges/${idOf(edge)}`, `Drive edge ${idOf(edge)} names a node that does not exist.`);
    }
    for (const turn of asArr(edge.turn_restrictions)) {
      if (!edgeIds.has(text(turn.banned_next_edge))) add(idOf(edge), `/drive_edges/${idOf(edge)}/turn_restrictions`, `Drive edge ${idOf(edge)} bans edge ${text(turn.banned_next_edge)}, which does not exist.`);
    }
  }
  for (const point of access) {
    if (!facilityIds.has(text(point.facility_id))) add(idOf(point), `/access_points/${idOf(point)}`, `Access point ${idOf(point)} names facility ${text(point.facility_id)}, which does not exist.`);
    for (const levelId of asArrIds(point.served_level_ids)) {
      if (!levelIds.has(levelId)) add(idOf(point), `/access_points/${idOf(point)}`, `Access point ${idOf(point)} names level ${levelId}, which does not exist.`);
    }
    for (const gateId of asArrIds(point.gate_ids)) {
      if (!gateIds.has(gateId)) add(idOf(point), `/access_points/${idOf(point)}`, `Access point ${idOf(point)} names gate ${gateId}, which does not exist.`);
    }
  }
  for (const gate of gates) {
    if (!accessIds.has(text(gate.host_id)) && !linkIds.has(text(gate.host_id))) {
      add(idOf(gate), `/gates/${idOf(gate)}`, `Gate ${idOf(gate)} names host ${text(gate.host_id)}, which does not exist.`);
    }
  }
  for (const link of links) {
    if (!nodeIds.has(text(link.from)) || !nodeIds.has(text(link.to))) add(idOf(link), `/inter_facility_links/${idOf(link)}`, `Link ${idOf(link)} names a node that does not exist.`);
    const ticket = isObj(link.ticket_transfer) ? link.ticket_transfer : {};
    if (ticket.gate_id && !gateIds.has(text(ticket.gate_id))) add(idOf(link), `/inter_facility_links/${idOf(link)}`, `Link ${idOf(link)} names gate ${text(ticket.gate_id)}, which does not exist.`);
  }
  for (const anchor of anchors) {
    if (!levelIds.has(text(anchor.level_id))) add(idOf(anchor), `/anchor_features/${idOf(anchor)}`, `Anchor ${idOf(anchor)} names level ${text(anchor.level_id)}, which does not exist.`);
  }
  for (const grid of grids) {
    if (!levelIds.has(text(grid.level_id))) add(idOf(grid), `/pillar_grids/${idOf(grid)}`, `Pillar grid ${idOf(grid)} names level ${text(grid.level_id)}, which does not exist.`);
  }
  for (const pillar of pillars) {
    if (!levelIds.has(text(pillar.level_id))) add(idOf(pillar), `/pillars/${idOf(pillar)}`, `Pillar ${idOf(pillar)} names level ${text(pillar.level_id)}, which does not exist.`);
    if (pillar.grid_id && !gridIds.has(text(pillar.grid_id))) add(idOf(pillar), `/pillars/${idOf(pillar)}`, `Pillar ${idOf(pillar)} names grid ${text(pillar.grid_id)}, which does not exist.`);
  }
  for (const dest of destinations) {
    for (const portalId of asArrIds(dest.portal_ids)) {
      if (!portalIds.has(portalId)) add(idOf(dest), `/destinations/${idOf(dest)}`, `Destination ${idOf(dest)} names portal ${portalId}, which does not exist.`);
    }
    if (!levelIds.has(text(dest.level_id))) add(idOf(dest), `/destinations/${idOf(dest)}/level_id`, `Destination ${idOf(dest)} names level ${text(dest.level_id) || "(missing)"}, which does not exist.`);
  }
  const viaTargets: Record<string, Set<string>> = { handover_zone: handoverIds, zone: zoneIds, portal: portalIds };
  for (const link of asArr(raw.destination_access)) {
    if (!destIds.has(text(link.destination_id))) add(undefined, "/destination_access", `A destination link names destination ${text(link.destination_id)}, which does not exist.`);
    const via = text(link.via);
    if (viaTargets[via] && !viaTargets[via].has(text(link.target_id))) {
      add(text(link.destination_id), "/destination_access", `A walk to ${text(link.destination_id)} names ${via} ${text(link.target_id)}, which does not exist.`);
    }
  }
  for (const zone of handovers) {
    if (!levelIds.has(text(zone.location_id)) && !curbIds.has(text(zone.location_id))) {
      add(idOf(zone), `/handover_zones/${idOf(zone)}`, `Handover zone ${idOf(zone)} names location ${text(zone.location_id)}, which does not exist.`);
    }
    for (const ruleId of asArrIds(zone.rule_ids)) {
      if (!ruleIds.has(ruleId)) add(idOf(zone), `/handover_zones/${idOf(zone)}`, `Handover zone ${idOf(zone)} names rule ${ruleId}, which does not exist.`);
    }
  }
  for (const curb of curbs) {
    for (const ruleId of asArrIds(curb.rule_ids)) {
      if (!ruleIds.has(ruleId)) add(idOf(curb), `/curb_segments/${idOf(curb)}`, `Kerb segment ${idOf(curb)} names rule ${ruleId}, which does not exist.`);
    }
  }
  for (const rule of rules) {
    for (const target of asArrIds(rule.applies_to)) {
      if (!knownTargets.has(target)) add(idOf(rule), `/rules/${idOf(rule)}`, `Rule ${idOf(rule)} applies to ${target}, which does not exist.`);
    }
    const payment = isObj(rule.payment) ? rule.payment : {};
    if (payment.rate_id && !rateIds.has(text(payment.rate_id))) add(idOf(rule), `/rules/${idOf(rule)}`, `Rule ${idOf(rule)} names rate ${text(payment.rate_id)}, which does not exist.`);
  }
  for (const lift of lifts) {
    for (const levelId of asArrIds(lift.level_ids)) {
      if (!levelIds.has(levelId)) add(idOf(lift), `/lifts/${idOf(lift)}`, `Lift ${idOf(lift)} names level ${levelId}, which does not exist.`);
    }
  }
  for (const item of [...aids, ...safety]) {
    if (!levelIds.has(text(item.level_id))) add(idOf(item), `/${idOf(item)}`, `${idOf(item)} names level ${text(item.level_id)}, which does not exist.`);
  }
  for (const walk of paths) {
    const from = text(walk.from_id);
    const to = text(walk.to_id);
    if (!bayIds.has(from) && !zoneIds.has(from) && !handoverIds.has(from)) add(idOf(walk), `/accessible_paths/${idOf(walk)}`, `Path ${idOf(walk)} starts at ${from}, which does not exist.`);
    if (!portalIds.has(to) && !destIds.has(to) && !handoverIds.has(to)) add(idOf(walk), `/accessible_paths/${idOf(walk)}`, `Path ${idOf(walk)} ends at ${to}, which does not exist.`);
    for (const liftId of asArrIds(walk.lift_ids)) {
      if (!liftIds.has(liftId)) add(idOf(walk), `/accessible_paths/${idOf(walk)}`, `Path ${idOf(walk)} names lift ${liftId}, which does not exist.`);
    }
    for (const aidId of asArrIds(walk.wayfinding_ids)) {
      if (!aidIds.has(aidId)) add(idOf(walk), `/accessible_paths/${idOf(walk)}`, `Path ${idOf(walk)} names wayfinding aid ${aidId}, which does not exist.`);
    }
  }
  for (const link of asArr(raw.destination_access)) {
    if (link.accessible_path_id && !pathIds.has(text(link.accessible_path_id))) {
      add(text(link.destination_id), "/destination_access", `A walk to ${text(link.destination_id)} names path ${text(link.accessible_path_id)}, which does not exist.`);
    }
  }
  for (const portal of portals) {
    if (!levelIds.has(text(portal.level_id))) add(idOf(portal), `/pedestrian_portals/${idOf(portal)}/level_id`, `Portal ${idOf(portal)} names level ${text(portal.level_id) || "(missing)"}, which does not exist.`);
  }

  if (isV03) issues.push(...geometryV03({
    site, siteId, version, facilities, frames: frameIds, zones, access, gates, lifts, stairs, portals, destinations, handovers, edges, paths, levelIds, facilityOfLevel,
  }));
  return issues;
}

function asArrIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function geometryV03(input: {
  site: Obj;
  siteId: string;
  version: string;
  facilities: Obj[];
  frames: Set<string>;
  zones: Obj[];
  access: Obj[];
  gates: Obj[];
  lifts: Obj[];
  stairs: Obj[];
  portals: Obj[];
  destinations: Obj[];
  handovers: Obj[];
  edges: Obj[];
  paths: Obj[];
  levelIds: Set<string>;
  facilityOfLevel: Map<string, Obj>;
}): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const add = (featureId: string | undefined, path: string, message: string) => issues.push(issue(featureId, path, message));
  if (input.facilities.length) {
    const boundary = isObj(input.site.boundary) ? input.site.boundary : undefined;
    if (!boundary || !lineOk(boundary.polygon, 4)) add(input.siteId, "/site/boundary", "A v0.3 dataset with facilities needs a site boundary polygon.");
    else if (!input.frames.has(text(boundary.frame_id))) add(input.siteId, "/site/boundary/frame_id", `Site boundary names frame ${text(boundary.frame_id)}, which does not exist.`);
  }
  for (const zone of input.zones) {
    if (!lineOk(zone.polygon, 4)) add(idOf(zone), `/zones/${idOf(zone)}/polygon`, `Zone ${idOf(zone)} needs a polygon in a v0.3 dataset.`);
  }
  for (const point of input.access) {
    if (!input.levelIds.has(text(point.level_id))) add(idOf(point), `/access_points/${idOf(point)}/level_id`, `Access point ${idOf(point)} needs a level id that exists.`);
    if (!pointOk(point.position)) add(idOf(point), `/access_points/${idOf(point)}/position`, `Access point ${idOf(point)} needs a position in the facility frame.`);
    if (!lineOk(point.threshold, 2)) add(idOf(point), `/access_points/${idOf(point)}/threshold`, `Access point ${idOf(point)} needs a threshold segment.`);
  }
  for (const gate of input.gates) {
    if (!input.levelIds.has(text(gate.level_id))) add(idOf(gate), `/gates/${idOf(gate)}/level_id`, `Gate ${idOf(gate)} needs a level id that exists.`);
    if (!lineOk(gate.threshold, 2) && !pointOk(gate.position)) add(idOf(gate), `/gates/${idOf(gate)}`, `Gate ${idOf(gate)} needs a position or a threshold segment.`);
  }
  for (const lift of input.lifts) {
    if (!lineOk(lift.footprint, 4)) add(idOf(lift), `/lifts/${idOf(lift)}/footprint`, `Lift ${idOf(lift)} needs a footprint polygon.`);
  }
  for (const stair of input.stairs) {
    if (!lineOk(stair.footprint, 4)) add(idOf(stair), `/stair_cores/${idOf(stair)}/footprint`, `Stair core ${idOf(stair)} needs a footprint polygon.`);
    for (const levelId of asArrIds(stair.level_ids)) {
      if (!input.levelIds.has(levelId)) add(idOf(stair), `/stair_cores/${idOf(stair)}`, `Stair core ${idOf(stair)} names level ${levelId}, which does not exist.`);
    }
  }
  for (const portal of input.portals) {
    if (!pointOk(portal.position)) add(idOf(portal), `/pedestrian_portals/${idOf(portal)}/position`, `Portal ${idOf(portal)} needs a position.`);
  }
  for (const dest of input.destinations) {
    if (!pointOk(dest.position) && !lineOk(dest.polygon, 4)) add(idOf(dest), `/destinations/${idOf(dest)}`, `Destination ${idOf(dest)} needs a position or a polygon.`);
  }
  for (const zone of input.handovers) {
    if (!lineOk(zone.polygon, 4)) add(idOf(zone), `/handover_zones/${idOf(zone)}/polygon`, `Handover zone ${idOf(zone)} needs a polygon.`);
    if (input.levelIds.has(text(zone.location_id)) && !input.levelIds.has(text(zone.level_id))) {
      add(idOf(zone), `/handover_zones/${idOf(zone)}/level_id`, `Handover zone ${idOf(zone)} is inside a facility and needs a level id.`);
    }
  }
  for (const facility of input.facilities) {
    const tierObj = isObj(facility.quality_tier) ? facility.quality_tier : {};
    const tier = typeof tierObj.tier === "number" ? tierObj.tier : 0;
    if (tier >= 2) {
      const records = verificationsOf(facility);
      const allowed = records.some((record) => record.role === "owner" && record.status === "confirmed" && record.datasetVersion === input.version);
      if (!allowed) add(idOf(facility), `/facilities/${idOf(facility)}/quality_tier`, `Facility ${idOf(facility)} declares tier ${tier}, which needs an owner verification with status confirmed for dataset version ${input.version}.`);
    }
  }
  for (const edge of input.edges) {
    const facility = input.facilityOfLevel.get(text(edge.level_id));
    const tier = facility && isObj(facility.quality_tier) && typeof facility.quality_tier.tier === "number" ? facility.quality_tier.tier : 0;
    if (centrelineRequired(tier, verificationsOf(edge), input.version) && !lineOk(edge.centreline, 2)) {
      add(idOf(edge), `/drive_edges/${idOf(edge)}/centreline`, `Drive edge ${idOf(edge)} needs a centreline because it is owner-verified or its facility tier is 2 or 3.`);
    }
  }
  for (const walk of input.paths) {
    const facility = input.facilityOfLevel.get(text(walk.level_id));
    const tier = facility && isObj(facility.quality_tier) && typeof facility.quality_tier.tier === "number" ? facility.quality_tier.tier : 0;
    if (centrelineRequired(tier, verificationsOf(walk), input.version) && !lineOk(walk.centreline, 2)) {
      add(idOf(walk), `/accessible_paths/${idOf(walk)}/centreline`, `Path ${idOf(walk)} needs a centreline because it is owner-verified or its facility tier is 2 or 3.`);
    }
  }
  return issues;
}
