/* OPMS explorer. Draws example datasets and explains fields from the schema descriptions.
   Licence: Apache-2.0 */
(function () {
  var SVGNS = "http://www.w3.org/2000/svg";
  var schemas = {};
  var simple = null;
  var complex = null;
  var model = null;
  var currentLevel = "";
  var selectedId = "";
  var records = new Map();

  var levelSelect = document.getElementById("level");
  var mapSvg = document.getElementById("map");
  var legend = document.getElementById("legend");
  var mapText = document.getElementById("map-text");
  var undrawn = document.getElementById("undrawn");
  var tree = document.getElementById("tree");
  var live = document.getElementById("live");
  var loadError = document.getElementById("load-error");

  function el(name, attrs, parent) {
    var node = document.createElementNS(SVGNS, name);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (attrs[key] != null) node.setAttribute(key, String(attrs[key]));
      });
    }
    if (parent) parent.appendChild(node);
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function fetchJson(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error(url + " returned " + res.status);
      return res.json();
    });
  }

  function resolveRef(ref, file) {
    if (!ref) return null;
    var target = file;
    var path = ref;
    var hash = ref.indexOf("#");
    if (hash >= 0) {
      if (hash > 0) target = ref.slice(0, hash);
      path = ref.slice(hash + 1);
    }
    var node = schemas[target];
    if (!node || !path) return node || null;
    path.split("/").forEach(function (part) {
      if (!part || !node) return;
      node = node[part];
    });
    return node || null;
  }

  function deref(prop, file) {
    if (!prop) return null;
    if (!prop.$ref) return prop;
    var resolved = resolveRef(prop.$ref, file) || {};
    var copy = {};
    Object.keys(resolved).forEach(function (key) { copy[key] = resolved[key]; });
    if (prop.description) copy.description = prop.description;
    return copy;
  }

  function schemaOf(file) {
    return schemas[file] || { title: file, properties: {} };
  }

  function byId(list) {
    var map = {};
    (list || []).forEach(function (item) {
      if (item && item.id) map[item.id] = item;
    });
    return map;
  }

  function levelsOf(data) {
    var out = [];
    (data.facilities || []).forEach(function (facility) {
      (facility.levels || []).forEach(function (level) {
        out.push({ level: level, facility: facility });
      });
    });
    return out;
  }

  function prepare(data) {
    var zones = byId(data.zones);
    var nodes = byId(data.drive_nodes);
    var access = byId(data.access_points);
    var links = byId(data.inter_facility_links);
    var levelInfo = levelsOf(data);
    var levelById = {};
    levelInfo.forEach(function (item) { levelById[item.level.id] = item; });

    function zoneLevel(id) {
      return zones[id] && zones[id].level_id;
    }

    function pointOf(obj) {
      if (!obj) return null;
      if (Array.isArray(obj.position)) return obj.position;
      if (obj.pose && Array.isArray(obj.pose.position)) return obj.pose.position;
      if (Array.isArray(obj.polygon) && obj.polygon.length) {
        var sx = 0;
        var sy = 0;
        obj.polygon.forEach(function (p) { sx += p[0]; sy += p[1]; });
        return [sx / obj.polygon.length, sy / obj.polygon.length, obj.polygon[0][2] || 0];
      }
      return null;
    }

    var lookup = {};
    function remember(obj) { if (obj && obj.id) lookup[obj.id] = obj; }
    ["bays", "drive_nodes", "drive_edges", "access_points", "gates", "anchor_features", "pillars", "localization_aids", "pedestrian_portals", "destinations", "handover_zones", "zones", "wayfinding_aids", "safety_features", "lifts", "accessible_paths", "rules", "rates"].forEach(function (key) {
      (data[key] || []).forEach(remember);
    });
    (data.facilities || []).forEach(function (facility) {
      remember(facility);
      (facility.levels || []).forEach(remember);
    });
    if (data.site) remember(data.site);

    function levelsFor(kind, obj) {
      if (kind === "bay") {
        var lv = zoneLevel(obj.zone_id);
        return lv ? [lv] : ["*"];
      }
      if (kind === "edge" || kind === "link") {
        var found = {};
        if (obj.level_id) found[obj.level_id] = true;
        var a = nodes[obj.from_node || obj.from];
        var b = nodes[obj.to_node || obj.to];
        if (a && a.level_id) found[a.level_id] = true;
        if (b && b.level_id) found[b.level_id] = true;
        var keys = Object.keys(found);
        return keys.length ? keys : ["*"];
      }
      if (kind === "access") return (obj.served_level_ids && obj.served_level_ids.length) ? obj.served_level_ids.slice() : ["*"];
      if (kind === "gate") {
        var host = access[obj.host_id] || links[obj.host_id];
        var fromHost = host ? levelsFor(access[obj.host_id] ? "access" : "link", host) : [];
        if (obj.level_id) return fromHost.concat([obj.level_id]).filter(function (id, i, all) { return all.indexOf(id) === i; });
        return fromHost.length ? fromHost : ["*"];
      }
      if (kind === "handover") {
        if (obj.level_id) return [obj.level_id];
        return levelById[obj.location_id] ? [obj.location_id] : [];
      }
      if (kind === "portal" || kind === "destination") {
        if (obj.level_id) return [obj.level_id];
        return levelInfo.filter(function (item) { return item.level.label === obj.level_label; }).map(function (item) { return item.level.id; });
      }
      if (kind === "path") {
        var from = lookup[obj.from_id];
        if (from && from.zone_id && zoneLevel(from.zone_id)) return [zoneLevel(from.zone_id)];
        return ["*"];
      }
      if (obj && obj.level_id) return [obj.level_id];
      return ["*"];
    }

    function locate(id) {
      return pointOf(lookup[id]);
    }

    return {
      data: data,
      zones: zones,
      nodes: nodes,
      access: access,
      links: links,
      levelInfo: levelInfo,
      levelById: levelById,
      lookup: lookup,
      levelsFor: levelsFor,
      locate: locate,
      pointOf: pointOf
    };
  }

  function onLevel(record) {
    return record.levels.indexOf("*") >= 0 || record.levels.indexOf(currentLevel) >= 0;
  }

  function addRecord(rec) {
    records.set(rec.id, rec);
    return rec;
  }

  function bayMark(types) {
    types = types || [];
    if (types.indexOf("accessible") >= 0) return { letter: "A", cls: "bay-accessible", name: "accessible" };
    if (types.indexOf("ev") >= 0) return { letter: "EV", cls: "bay-ev", name: "EV" };
    if (types.indexOf("family") >= 0) return { letter: "F", cls: "bay-family", name: "family" };
    if (types.indexOf("taxi") >= 0) return { letter: "T", cls: "bay-taxi", name: "taxi" };
    if (types.indexOf("courier") >= 0 || types.indexOf("loading") >= 0) return { letter: "C", cls: "bay-courier", name: "courier or loading" };
    if (types.some(function (t) { return t.indexOf("transport") >= 0 || t === "emergency_services"; })) return { letter: "P", cls: "bay-transport", name: "transport" };
    if (types.indexOf("general") >= 0 || types.length === 0) return { letter: "G", cls: "bay-general", name: "general" };
    return { letter: "?", cls: "bay-other", name: types.join(", ") };
  }

  function indexDataset(prepared) {
    records = new Map();
    var data = prepared.data;
    var out = [];

    function push(rec) {
      out.push(addRecord(rec));
    }

    push({
      id: "dataset",
      group: "Dataset",
      label: "Dataset",
      summary: "The whole example file.",
      obj: data,
      schemaFile: "dataset.schema.json",
      levels: ["*"],
      drawable: false
    });
    if (data.site) {
      var boundary = data.site.boundary && data.site.boundary.polygon;
      push({
        id: data.site.id,
        group: "Site",
        label: data.site.name || data.site.id,
        summary: boundary
          ? "Site " + data.site.id + ". The outline is site.boundary."
          : "Site " + data.site.id + ". No boundary polygon, so the dashed box is only the extent of recorded coordinates.",
        obj: data.site,
        schemaFile: "site.schema.json",
        levels: ["*"],
        drawable: true,
        shape: boundary ? "boundary" : "extent",
        points: boundary || null
      });
    }
    (data.frames || []).forEach(function (frame) {
      push({
        id: frame.id,
        group: "Frames",
        label: frame.id,
        summary: "Frame " + frame.id + ". Anchors local metres to a fictional WGS84 origin. It is not a point on the lot.",
        obj: frame,
        schemaFile: "frame.schema.json",
        levels: ["*"],
        drawable: false
      });
    });
    (data.facilities || []).forEach(function (facility) {
      push({
        id: facility.id,
        group: "Facilities",
        label: facility.name || facility.id,
        summary: "Facility " + facility.id + " (" + facility.type + ").",
        obj: facility,
        schemaFile: "facility.schema.json",
        levels: (facility.levels || []).map(function (level) { return level.id; }),
        drawable: true,
        shape: "label"
      });
      (facility.levels || []).forEach(function (level) {
        push({
          id: level.id,
          group: "Levels",
          parent: facility.id,
          label: "Level " + level.label,
          summary: "Level " + level.label + " of " + facility.id + ". v0.2 does not give a level an outline.",
          obj: level,
          schemaFile: "level.schema.json",
          levels: [level.id],
          drawable: false
        });
      });
      ["quality_tier", "approval", "licence", "provenance", "evidence", "avp", "external_refs"].forEach(function (key) {
        if (!facility[key]) return;
        var prop = schemaOf("facility.schema.json").properties[key];
        push({
          id: facility.id + "#" + key,
          group: "Facilities",
          parent: facility.id,
          label: key,
          summary: facility.id + " " + key,
          obj: facility[key],
          schemaNode: deref(prop, "facility.schema.json"),
          schemaFile: "facility.schema.json",
          levels: ["*"],
          drawable: false
        });
      });
    });
    (data.zones || []).forEach(function (zone) {
      push({
        id: zone.id,
        group: "Zones",
        label: zone.name || zone.id,
        summary: "Zone " + zone.id + (zone.polygon ? "." : ". No polygon, so it is not drawn."),
        obj: zone,
        schemaFile: "zone.schema.json",
        levels: prepared.levelsFor("zone", zone),
        drawable: !!(zone.polygon && zone.polygon.length >= 4),
        shape: "zone",
        points: zone.polygon,
        cls: "zone-outline"
      });
    });
    (data.bays || []).forEach(function (bay) {
      var mark = bayMark(bay.bay_types);
      push({
        id: bay.id,
        group: "Bays",
        parent: bay.zone_id,
        label: (bay.painted_label || bay.id) + " (" + (bay.bay_types || []).join(", ") + ")",
        summary: "Bay " + bay.id + ", types " + (bay.bay_types || []).join(", ") + ".",
        obj: bay,
        schemaFile: "bay.schema.json",
        levels: prepared.levelsFor("bay", bay),
        drawable: true,
        shape: "polygon",
        points: bay.polygon,
        cls: mark.cls,
        letter: mark.letter
      });
    });
    (data.drive_nodes || []).forEach(function (node) {
      push({
        id: node.id,
        group: "Drive graph",
        label: node.id,
        summary: "Drive node " + node.id + ".",
        obj: node,
        schemaFile: "drive-node.schema.json",
        levels: prepared.levelsFor("node", node),
        drawable: !!node.position,
        shape: "point",
        at: node.position,
        kind: "node"
      });
    });
    (data.drive_edges || []).forEach(function (edge) {
      var line = edge.centreline;
      var derived = false;
      if (!line && prepared.nodes[edge.from_node] && prepared.nodes[edge.to_node]) {
        line = [prepared.nodes[edge.from_node].position, prepared.nodes[edge.to_node].position];
        derived = true;
      }
      push({
        id: edge.id,
        group: "Drive graph",
        label: edge.kind + " " + edge.id,
        summary: "Drive edge " + edge.id + " (" + edge.kind + "). " + (edge.centreline ? "Centreline is in the file." : "No centreline, so the line joins the recorded end nodes."),
        obj: edge,
        schemaFile: "drive-edge.schema.json",
        levels: prepared.levelsFor("edge", edge),
        drawable: !!line,
        shape: "line",
        line: line,
        kind: edge.kind,
        derived: derived
      });
    });
    (data.inter_facility_links || []).forEach(function (link) {
      var a = prepared.nodes[link.from];
      var b = prepared.nodes[link.to];
      var line = (a && b) ? [a.position, b.position] : null;
      push({
        id: link.id,
        group: "Links",
        label: link.id,
        summary: "Inter-facility link " + link.id + ". " + (line ? "Drawn between its recorded end nodes." : "End nodes have no position."),
        obj: link,
        schemaFile: "inter-facility-link.schema.json",
        levels: prepared.levelsFor("link", link),
        drawable: !!line,
        shape: "line",
        line: line,
        kind: "link"
      });
    });
    (data.access_points || []).forEach(function (ap) {
      push({
        id: ap.id,
        group: "Access",
        label: ap.role + " " + ap.id,
        summary: "Access point " + ap.id + ", role " + ap.role + (ap.position ? "." : ". No position in the file, so it is not drawn."),
        obj: ap,
        schemaFile: "access-point.schema.json",
        levels: prepared.levelsFor("access", ap),
        drawable: !!(ap.position || (ap.threshold && ap.threshold.length >= 2)),
        shape: "access",
        at: ap.position,
        line: ap.threshold,
        role: ap.role
      });
    });
    (data.gates || []).forEach(function (gate) {
      var host = prepared.access[gate.host_id];
      var at = gate.position || (host && host.position);
      var line = gate.threshold;
      var derived = "";
      if (!at && !line && prepared.links[gate.host_id]) {
        var link = prepared.links[gate.host_id];
        var a = prepared.nodes[link.from];
        var b = prepared.nodes[link.to];
        if (a && b) {
          at = [(a.position[0] + b.position[0]) / 2, (a.position[1] + b.position[1]) / 2, a.position[2] || 0];
          derived = " Placed at the midpoint of the link it belongs to, because the gate has no coordinates.";
        }
      } else if (!line && at && host && host.position && !gate.position) {
        derived = " Placed beside its access point, because the gate has no coordinates.";
      }
      push({
        id: gate.id,
        group: "Access",
        parent: gate.host_id,
        label: gate.kind + " " + gate.id,
        summary: "Gate " + gate.id + " (" + gate.kind + ")." + (line ? " Threshold is in the file." : (at ? derived : " No coordinates, so it is not drawn.")),
        obj: gate,
        schemaFile: "gate.schema.json",
        levels: prepared.levelsFor("gate", gate),
        drawable: !!(at || (line && line.length >= 2)),
        shape: "gate",
        at: at,
        line: line,
        beside: !!(host && host.position && !line && !gate.position)
      });
    });
    (data.anchor_features || []).forEach(function (anchor) {
      push({
        id: anchor.id,
        group: "Anchors",
        label: anchor.kind + " " + anchor.id,
        summary: "Anchor " + anchor.id + " (" + anchor.kind + ", " + anchor.anchor_class + ").",
        obj: anchor,
        schemaFile: "anchor-feature.schema.json",
        levels: prepared.levelsFor("anchor", anchor),
        drawable: !!anchor.position,
        shape: "anchor",
        at: anchor.position
      });
    });
    (data.pillars || []).forEach(function (pillar) {
      push({
        id: pillar.id,
        group: "Pillars",
        label: pillar.painted_label || pillar.id,
        summary: "Pillar " + pillar.id + ".",
        obj: pillar,
        schemaFile: "pillar.schema.json",
        levels: prepared.levelsFor("pillar", pillar),
        drawable: !!pillar.position,
        shape: "point",
        at: pillar.position,
        kind: "pillar"
      });
    });
    (data.localization_aids || []).forEach(function (aid) {
      var at = aid.pose && aid.pose.position;
      push({
        id: aid.id,
        group: "Aids",
        label: aid.kind + " " + aid.id,
        summary: "Localisation aid " + aid.id + " (" + aid.kind + ").",
        obj: aid,
        schemaFile: "localization-aid.schema.json",
        levels: prepared.levelsFor("aid", aid),
        drawable: !!at,
        shape: "point",
        at: at,
        kind: "aid"
      });
    });
    (data.pedestrian_portals || []).forEach(function (portal) {
      push({
        id: portal.id,
        group: "People",
        label: portal.kind + " " + portal.id,
        summary: "Pedestrian portal " + portal.id + " (" + portal.kind + ")." + (portal.position ? "" : " No position, so it is not drawn."),
        obj: portal,
        schemaFile: "pedestrian-portal.schema.json",
        levels: prepared.levelsFor("portal", portal),
        drawable: !!portal.position,
        shape: "portal",
        at: portal.position
      });
    });
    (data.destinations || []).forEach(function (dest) {
      push({
        id: dest.id,
        group: "People",
        label: dest.name || dest.id,
        summary: "Destination " + (dest.name || dest.id) + (dest.position || dest.polygon ? "." : ". No coordinates, so it is not drawn."),
        obj: dest,
        schemaFile: "destination.schema.json",
        levels: prepared.levelsFor("destination", dest),
        drawable: !!(dest.position || (dest.polygon && dest.polygon.length >= 4)),
        shape: dest.polygon ? "polygon" : "point",
        points: dest.polygon,
        at: dest.position,
        cls: "destination",
        letter: "To",
        kind: "destination"
      });
    });
    (data.handover_zones || []).forEach(function (zone) {
      push({
        id: zone.id,
        group: "People",
        label: "Drop-off " + zone.id,
        summary: "Handover zone " + zone.id + " (" + zone.kind + ")." + (zone.polygon ? "" : " No polygon, so it is not drawn."),
        obj: zone,
        schemaFile: "handover-zone.schema.json",
        levels: prepared.levelsFor("handover", zone),
        drawable: !!(zone.polygon && zone.polygon.length >= 4),
        shape: "handover",
        points: zone.polygon,
        cls: "handover",
        letter: "Drop"
      });
    });
    (data.accessible_paths || []).forEach(function (path) {
      var a = prepared.locate(path.from_id);
      var b = prepared.locate(path.to_id);
      push({
        id: path.id,
        group: "People",
        label: path.id,
        summary: "Accessible path " + path.id + ". " + (path.centreline ? "Centreline is in the file." : ((a && b) ? "No centreline, so the dashed line joins the recorded ends." : "No coordinates, so it is not drawn.")),
        obj: path,
        schemaFile: "accessible-path.schema.json",
        levels: prepared.levelsFor("path", path),
        drawable: !!(path.centreline || (a && b)),
        shape: "line",
        line: path.centreline || ((a && b) ? [a, b] : null),
        kind: "path",
        derived: !path.centreline
      });
    });
    (data.wayfinding_aids || []).forEach(function (aid) {
      push({
        id: aid.id,
        group: "People",
        label: aid.label || aid.id,
        summary: "Wayfinding aid " + aid.id + " (" + aid.kind + ")." + (aid.position ? "" : " No position, so it is not drawn."),
        obj: aid,
        schemaFile: "wayfinding-aid.schema.json",
        levels: prepared.levelsFor("wayfinding", aid),
        drawable: !!aid.position,
        shape: "point",
        at: aid.position,
        kind: "sign"
      });
    });
    (data.safety_features || []).forEach(function (feature) {
      push({
        id: feature.id,
        group: "People",
        label: feature.kind + " " + feature.id,
        summary: "Safety feature " + feature.id + " (" + feature.kind + ")." + (feature.position ? "" : " No position, so it is not drawn."),
        obj: feature,
        schemaFile: "safety-feature.schema.json",
        levels: prepared.levelsFor("safety", feature),
        drawable: !!feature.position,
        shape: "point",
        at: feature.position,
        kind: "safety"
      });
    });
    (data.lifts || []).forEach(function (lift) {
      push({
        id: lift.id,
        group: "People",
        label: "Lift " + lift.id,
        summary: "Lift " + lift.id + (lift.footprint ? "." : ". No footprint, so it is not drawn."),
        obj: lift,
        schemaFile: "lift.schema.json",
        levels: lift.level_ids && lift.level_ids.length ? lift.level_ids.slice() : ["*"],
        drawable: !!(lift.footprint && lift.footprint.length >= 4),
        shape: "lift",
        points: lift.footprint,
        cls: "lift",
        letter: "Lift"
      });
    });
    (data.stair_cores || []).forEach(function (stair) {
      push({
        id: stair.id,
        group: "People",
        label: "Stairs " + stair.id,
        summary: "Stair core " + stair.id + ".",
        obj: stair,
        schemaFile: "stair-core.schema.json",
        levels: stair.level_ids && stair.level_ids.length ? stair.level_ids.slice() : ["*"],
        drawable: !!(stair.footprint && stair.footprint.length >= 4),
        shape: "stair",
        points: stair.footprint,
        cls: "stair",
        letter: "Stair"
      });
    });
    (data.rules || []).forEach(function (rule) {
      push({
        id: rule.id,
        group: "Rules",
        label: rule.activity + " " + rule.id,
        summary: "Rule " + rule.id + " (" + rule.activity + "). Rules are not geometry.",
        obj: rule,
        schemaFile: "rule.schema.json",
        levels: ["*"],
        drawable: false
      });
    });
    (data.rates || []).forEach(function (rate) {
      push({
        id: rate.id,
        group: "Rates",
        label: rate.id,
        summary: "Rate " + rate.id + ".",
        obj: rate,
        schemaFile: "rate.schema.json",
        levels: ["*"],
        drawable: false
      });
    });
    if (data.publication) {
      push({
        id: "publication",
        group: "Publication",
        label: "Publication terms",
        summary: "How the dataset says it may be published.",
        obj: data.publication,
        schemaNode: deref({ $ref: "common.schema.json#/$defs/PublicationTerms" }, "dataset.schema.json"),
        schemaFile: "dataset.schema.json",
        levels: ["*"],
        drawable: false
      });
    }
    (data.destination_access || []).forEach(function (item, index) {
      push({
        id: "destination-access-" + index,
        group: "People",
        label: "Walk to " + item.destination_id,
        summary: "Destination access from " + item.target_id + " to " + item.destination_id + ". No line of its own.",
        obj: item,
        schemaFile: "destination-access.schema.json",
        levels: ["*"],
        drawable: false
      });
    });
    return out;
  }

  function defaultLevel(prepared) {
    var counts = {};
    (prepared.data.bays || []).forEach(function (bay) {
      var zone = prepared.zones[bay.zone_id];
      if (!zone) return;
      counts[zone.level_id] = (counts[zone.level_id] || 0) + 1;
    });
    var best = "";
    var bestN = -1;
    Object.keys(counts).forEach(function (id) {
      if (counts[id] > bestN) { best = id; bestN = counts[id]; }
    });
    if (best) return best;
    return prepared.levelInfo[0] ? prepared.levelInfo[0].level.id : "";
  }

  function fillLevels() {
    clear(levelSelect);
    model.levelInfo.forEach(function (item) {
      var option = document.createElement("option");
      option.value = item.level.id;
      option.textContent = item.facility.name + " · " + item.level.label + " (" + item.level.id + ")";
      levelSelect.appendChild(option);
    });
    levelSelect.value = currentLevel;
  }

  function projectFactory(points) {
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    points.forEach(function (p) {
      minX = Math.min(minX, p[0]);
      minY = Math.min(minY, p[1]);
      maxX = Math.max(maxX, p[0]);
      maxY = Math.max(maxY, p[1]);
    });
    if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 10; maxY = 10; }
    var pad = Math.max(2, (maxX - minX + maxY - minY) * 0.04);
    minX -= pad; minY -= pad; maxX += pad; maxY += pad;
    var width = Math.max(maxX - minX, 1);
    var height = Math.max(maxY - minY, 1);
    return {
      minX: minX, minY: minY, maxX: maxX, maxY: maxY, width: width, height: height,
      span: Math.max(width, height),
      xy: function (x, y) { return [x - minX, maxY - y]; }
    };
  }

  function collectPoints(visible) {
    var pts = [];
    visible.forEach(function (rec) {
      (rec.points || []).forEach(function (p) { pts.push(p); });
      (rec.line || []).forEach(function (p) { pts.push(p); });
      if (rec.at) pts.push(rec.at);
    });
    return pts;
  }

  function hit(parent, rec) {
    parent.setAttribute("data-select", rec.id);
    parent.setAttribute("role", "button");
    parent.setAttribute("tabindex", "0");
    parent.setAttribute("class", "feature");
    parent.setAttribute("aria-label", rec.summary);
    parent.setAttribute("aria-pressed", selectedId === rec.id ? "true" : "false");
  }

  function drawMap() {
    clear(mapSvg);
    clear(legend);
    clear(mapText);
    var visible = [];
    var hidden = [];
    records.forEach(function (rec) {
      if (!onLevel(rec)) return;
      if (rec.drawable) visible.push(rec);
      else hidden.push(rec);
    });
    var content = visible.filter(function (rec) { return rec.shape !== "extent" && rec.shape !== "label" && rec.shape !== "boundary"; });
    var geomPts = collectPoints(content);
    var boundaryPts = collectPoints(visible.filter(function (rec) { return rec.shape === "boundary"; }));
    if (boundaryPts.length && geomPts.length) {
      var spanC = projectFactory(geomPts).span;
      var spanB = projectFactory(boundaryPts).span;
      if (spanB < spanC * 3) geomPts = geomPts.concat(boundaryPts);
    } else if (!geomPts.length) {
      geomPts = boundaryPts;
    }
    var geom = projectFactory(geomPts);
    mapSvg.setAttribute("viewBox", "0 0 " + geom.width + " " + geom.height);
    var stroke = geom.span / 160;
    var font = geom.span / 42;

    function polygonOf(rec, parent) {
      var pts = rec.points.map(function (p) { var s = geom.xy(p[0], p[1]); return s[0] + "," + s[1]; }).join(" ");
      el("polygon", { points: pts, class: rec.cls || "", fill: rec.cls ? null : "none", stroke: "currentColor", "stroke-width": stroke * (rec.shape === "zone" || rec.shape === "boundary" ? 1.1 : 0.7), "stroke-dasharray": (rec.shape === "zone" || rec.shape === "boundary") ? String(stroke * 2) + " " + String(stroke * 1.4) : null }, parent);
      if (rec.letter) {
        var c = rec.points.reduce(function (acc, p) { return [acc[0] + p[0], acc[1] + p[1]]; }, [0, 0]);
        var s = geom.xy(c[0] / rec.points.length, c[1] / rec.points.length);
        var text = el("text", {
          x: s[0], y: s[1], "text-anchor": "middle", "dominant-baseline": "middle",
          "font-size": Math.min(font, geom.span / 28), "pointer-events": "none", class: "bay-label"
        }, parent);
        text.textContent = rec.letter;
      }
    }

    visible.filter(function (rec) { return rec.shape === "boundary" && rec.points; }).forEach(function (rec) {
      var g = el("g", {}, mapSvg);
      hit(g, rec);
      polygonOf(rec, g);
    });

    var extent = visible.filter(function (rec) { return rec.shape === "extent"; })[0];
    if (extent && geomPts.length) {
      var g = el("g", {}, mapSvg);
      hit(g, extent);
      el("rect", {
        x: geom.xy(geom.minX, geom.maxY)[0],
        y: geom.xy(geom.minX, geom.maxY)[1],
        width: geom.width,
        height: geom.height,
        fill: "none",
        stroke: "currentColor",
        "stroke-dasharray": String(stroke * 3) + " " + String(stroke * 2),
        "stroke-width": stroke
      }, g);
    }

    function lineEl(parent, pts, attrs) {
      var d = pts.map(function (p) { var s = geom.xy(p[0], p[1]); return s[0] + "," + s[1]; }).join(" ");
      attrs.points = d;
      attrs.fill = "none";
      attrs.stroke = attrs.stroke || "currentColor";
      attrs["stroke-width"] = attrs["stroke-width"] || stroke * 2;
      attrs["stroke-linecap"] = "round";
      attrs["stroke-linejoin"] = "round";
      return el("polyline", attrs, parent);
    }

    ["zone", "handover", "lift", "stair"].forEach(function (shape) {
      visible.filter(function (rec) { return rec.shape === shape && rec.points; }).forEach(function (rec) {
        var g = el("g", {}, mapSvg);
        hit(g, rec);
        polygonOf(rec, g);
      });
    });

    visible.filter(function (rec) { return rec.shape === "line"; }).forEach(function (rec) {
      var g = el("g", {}, mapSvg);
      hit(g, rec);
      var dash = (rec.kind === "ramp" || rec.kind === "path" || rec.kind === "link") ? String(stroke * 2) + " " + String(stroke * 1.4) : null;
      lineEl(g, rec.line, { "stroke-dasharray": dash, "stroke-width": rec.kind === "path" ? stroke * 1.3 : stroke * 2.2 });
    });

    visible.filter(function (rec) { return rec.shape === "polygon" && rec.points; }).forEach(function (rec) {
      var g = el("g", {}, mapSvg);
      hit(g, rec);
      polygonOf(rec, g);
    });

    visible.filter(function (rec) { return rec.shape === "point" || rec.shape === "anchor" || rec.shape === "portal" || rec.shape === "access" || rec.shape === "gate"; }).forEach(function (rec) {
      var g = el("g", {}, mapSvg);
      hit(g, rec);
      if (rec.line && rec.line.length >= 2) {
        lineEl(g, rec.line, { "stroke-width": stroke * 2.4 });
      }
      var at = rec.at;
      if (!at && rec.line && rec.line.length) {
        var mid = rec.line[Math.floor(rec.line.length / 2)];
        at = mid;
      }
      if (!at) return;
      if (rec.shape === "gate" && rec.beside) at = [rec.at[0] + geom.span * 0.03, rec.at[1], rec.at[2] || 0];
      var s = geom.xy(at[0], at[1]);
      var r = geom.span * 0.018;
      if (rec.shape === "anchor") {
        el("line", { x1: s[0] - r, y1: s[1], x2: s[0] + r, y2: s[1], stroke: "currentColor", "stroke-width": stroke }, g);
        el("line", { x1: s[0], y1: s[1] - r, x2: s[0], y2: s[1] + r, stroke: "currentColor", "stroke-width": stroke }, g);
      } else if (rec.shape === "portal") {
        el("rect", { x: s[0] - r, y: s[1] - r, width: r * 2, height: r * 2, fill: "none", stroke: "currentColor", "stroke-width": stroke }, g);
      } else if (rec.shape === "gate") {
        el("rect", { x: s[0] - r * 1.2, y: s[1] - r * 0.35, width: r * 2.4, height: r * 0.7, fill: "currentColor" }, g);
      } else if (rec.shape === "access") {
        el("circle", { cx: s[0], cy: s[1], r: r, fill: "none", stroke: "currentColor", "stroke-width": stroke * 1.4 }, g);
        var label = rec.role === "entry" ? "In" : rec.role === "exit" ? "Out" : "Both";
        var text = el("text", { x: s[0], y: s[1] + r * 2.1, "text-anchor": "middle", "font-size": font * 0.85, "pointer-events": "none" }, g);
        text.textContent = label;
      } else {
        el("circle", { cx: s[0], cy: s[1], r: r * 0.55, fill: "currentColor" }, g);
      }
    });

    visible.filter(function (rec) { return rec.shape === "label"; }).forEach(function (rec) {
      var levelIds = {};
      (rec.obj.levels || []).forEach(function (level) {
        if (level.id === currentLevel) levelIds[level.id] = true;
      });
      var pts = [];
      records.forEach(function (other) {
        if (!onLevel(other) || other.id === rec.id) return;
        var zone = other.obj && other.obj.zone_id && model.zones[other.obj.zone_id];
        var belongs = (other.obj && other.obj.facility_id === rec.id) ||
          (other.obj && other.obj.level_id && levelIds[other.obj.level_id]) ||
          (zone && levelIds[zone.level_id]);
        if (!belongs) return;
        (other.points || []).forEach(function (p) { pts.push(p); });
        (other.line || []).forEach(function (p) { pts.push(p); });
        if (other.at) pts.push(other.at);
      });
      if (!pts.length) return;
      var sx = 0;
      var north = -Infinity;
      pts.forEach(function (p) { sx += p[0]; north = Math.max(north, p[1]); });
      var s = geom.xy(sx / pts.length, north);
      var g = el("g", {}, mapSvg);
      hit(g, rec);
      var text = el("text", { x: s[0], y: Math.max(font, s[1] - font * 0.4), "text-anchor": "middle", "font-size": font, "font-weight": "700" }, g);
      text.textContent = rec.obj.name || rec.id;
    });

    var seen = {};
    function legendItem(swatch, text) {
      if (seen[text]) return;
      seen[text] = true;
      var li = document.createElement("li");
      if (swatch) {
        var mark = document.createElement("span");
        mark.className = "swatch " + swatch;
        mark.setAttribute("aria-hidden", "true");
        li.appendChild(mark);
      }
      li.appendChild(document.createTextNode(text));
      legend.appendChild(li);
    }
    if (extent) legendItem("", "Dashed box: extent of recorded coordinates");
    visible.forEach(function (rec) {
      if (rec.shape === "boundary") legendItem("", "Dashed outline: site boundary");
      if (rec.shape === "zone") legendItem("", "Dashed outline: zone");
      if (rec.shape === "handover") legendItem("", "Drop: drop-off, handover or pick-up zone");
      if (rec.shape === "lift") legendItem("", "Lift footprint");
      if (rec.shape === "stair") legendItem("", "Stair core");
      if (rec.shape === "polygon" && rec.obj && rec.obj.bay_types) legendItem("", rec.letter + " " + bayMark(rec.obj.bay_types).name);
      if (rec.kind === "aisle" || rec.kind === "access_lane") legendItem("", "Solid line: aisle or access lane");
      if (rec.kind === "ramp") legendItem("", "Dashed line: ramp");
      if (rec.kind === "link") legendItem("", "Dashed line: link between car parks");
      if (rec.kind === "path") legendItem("", "Dashed line: accessible or pedestrian path");
      if (rec.shape === "access") legendItem("", "Circle and segment: entrance, exit, or both");
      if (rec.shape === "gate") legendItem("", "Gate or barrier threshold");
      if (rec.shape === "anchor") legendItem("", "Cross: anchor");
      if (rec.shape === "portal") legendItem("", "Square: pedestrian portal");
    });

    visible.forEach(function (rec) {
      if (rec.shape === "extent" || rec.shape === "label") return;
      var li = document.createElement("li");
      var button = document.createElement("button");
      button.type = "button";
      button.className = "tree-row";
      button.setAttribute("data-select", rec.id);
      button.textContent = rec.summary;
      li.appendChild(button);
      mapText.appendChild(li);
    });

    var spatial = { People: 1, Access: 1, Anchors: 1, Pillars: 1, Aids: 1, Zones: 1, Links: 1, "Drive graph": 1 };
    var skipped = hidden.filter(function (rec) {
      return spatial[rec.group] && rec.id.indexOf("#") < 0;
    });
    if (!visible.length) {
      undrawn.textContent = "This level has no coordinates to draw.";
    } else if (skipped.length) {
      undrawn.textContent = "On this level, but not drawn, because the file stores no position, polygon or centreline: " + skipped.map(function (rec) { return rec.label; }).join(", ") + ".";
    } else {
      undrawn.textContent = "";
    }
    applyHighlight();
  }

  function renderFields(container, obj, schemaNode, file, depth) {
    if (!obj || typeof obj !== "object" || depth > 4) return;
    var props = (schemaNode && schemaNode.properties) || {};
    var dl = document.createElement("dl");
    container.appendChild(dl);
    Object.keys(obj).forEach(function (key) {
      var prop = props[key];
      var child = prop ? deref(prop, file) : null;
      var desc = (prop && prop.description) || (child && child.description) || "";
      if (!desc && key.indexOf("x_") === 0) desc = "Extension property. The schema allows keys that start with x_ and does not describe each one.";
      if (!desc && !prop) desc = "This key is not listed in the schema properties.";
      if (!desc) desc = "The schema does not describe this field.";
      var dt = document.createElement("dt");
      var code = document.createElement("code");
      code.textContent = key;
      dt.appendChild(code);
      var dd = document.createElement("dd");
      dd.textContent = desc;
      dl.appendChild(dt);
      dl.appendChild(dd);
      var value = obj[key];
      if (child && child.properties && value && typeof value === "object" && !Array.isArray(value)) {
        renderFields(dd, value, child, file, depth + 1);
      } else if (child && child.items && Array.isArray(value)) {
        var itemSchema = deref(child.items, file);
        if (itemSchema && itemSchema.properties) {
          value.forEach(function (item, index) {
            if (!item || typeof item !== "object" || Array.isArray(item)) return;
            var heading = document.createElement("p");
            heading.textContent = "Item " + (index + 1) + (item.id ? " (" + item.id + ")" : "");
            dd.appendChild(heading);
            renderFields(dd, item, itemSchema, file, depth + 1);
          });
        }
      }
    });
  }

  function show(rec) {
    var intro = document.getElementById("detail-intro");
    var json = document.getElementById("detail-json");
    var fields = document.getElementById("detail-fields");
    var schema = rec.schemaNode || schemaOf(rec.schemaFile);
    var title = (schema && schema.title) || rec.schemaFile;
    intro.textContent = title + ". " + (schema && schema.description ? schema.description + " " : "") + rec.summary;
    json.textContent = JSON.stringify(rec.obj, null, 2);
    clear(fields);
    if (rec.shape === "extent") {
      var note = document.createElement("p");
      note.textContent = "The dashed rectangle is the bounding box of coordinates on this level. It is not a field in the site object.";
      fields.appendChild(note);
    }
    if (rec.derived) {
      var derived = document.createElement("p");
      derived.textContent = rec.summary;
      fields.appendChild(derived);
    }
    renderFields(fields, rec.obj, schema, rec.schemaFile, 0);
    live.textContent = "Selected " + rec.label + ".";
  }

  function applyHighlight() {
    document.querySelectorAll("[data-select]").forEach(function (node) {
      var on = node.getAttribute("data-select") === selectedId;
      node.classList.toggle("is-selected", on);
      if (node.tagName === "BUTTON") node.setAttribute("aria-current", on ? "true" : "false");
      else if (node.getAttribute("role") === "button") node.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function expandTo(button) {
    var node = button.parentElement;
    while (node && node !== tree) {
      if (node.tagName === "UL" && node.hidden) {
        node.hidden = false;
        var owner = node.parentElement && node.parentElement.querySelector(":scope > .tree-row");
        if (owner) owner.setAttribute("aria-expanded", "true");
      }
      node = node.parentElement;
    }
  }

  function select(id, options) {
    options = options || {};
    var rec = records.get(id);
    if (!rec) return;
    selectedId = id;
    if (!options.keepLevel && rec.levels.indexOf("*") < 0 && rec.levels.indexOf(currentLevel) < 0 && rec.levels[0]) {
      currentLevel = rec.levels[0];
      levelSelect.value = currentLevel;
      drawMap();
    }
    show(rec);
    applyHighlight();
    var button = tree.querySelector('.tree-row[data-select="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
    if (button) {
      expandTo(button);
      if (!options.quiet) button.scrollIntoView({ block: "nearest" });
    }
  }

  function row(label, id, depth, hasChildren) {
    var li = document.createElement("li");
    var button = document.createElement("button");
    button.type = "button";
    button.className = "tree-row";
    button.style.paddingLeft = (0.55 + depth * 0.85) + "rem";
    button.textContent = label;
    if (id) button.setAttribute("data-select", id);
    if (hasChildren) button.setAttribute("aria-expanded", depth < 1 ? "true" : "false");
    li.appendChild(button);
    return li;
  }

  function childrenOf(items, depth) {
    var ul = document.createElement("ul");
    ul.hidden = depth >= 1;
    items.forEach(function (item) { ul.appendChild(item); });
    return ul;
  }

  function buildTree() {
    clear(tree);
    var groups = [];
    function group(name) {
      var found = groups.filter(function (g) { return g.name === name; })[0];
      if (!found) {
        found = { name: name, items: [] };
        groups.push(found);
      }
      return found;
    }
    var childMap = {};
    records.forEach(function (rec) {
      if (rec.parent) {
        if (!childMap[rec.parent]) childMap[rec.parent] = [];
        childMap[rec.parent].push(rec);
        return;
      }
      group(rec.group).items.push(rec);
    });
    groups.forEach(function (g) {
      var li = row(g.name, "", 0, true);
      var ul = childrenOf(g.items.map(function (rec) {
        var kids = childMap[rec.id] || [];
        var item = row(rec.label, rec.id, 1, kids.length > 0);
        if (kids.length) {
          item.appendChild(childrenOf(kids.map(function (kid) {
            return row(kid.label, kid.id, 2, false);
          }), 2));
        }
        return item;
      }), 0);
      li.appendChild(ul);
      tree.appendChild(li);
    });
  }

  function setAll(open) {
    tree.querySelectorAll(".tree-row[aria-expanded]").forEach(function (button) {
      var ul = button.parentElement.querySelector(":scope > ul");
      if (!ul) return;
      ul.hidden = !open;
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function renderEr() {
    var edges = [];
    var seen = {};
    Object.keys(schemas).forEach(function (file) {
      var stack = [schemas[file]];
      while (stack.length) {
        var node = stack.pop();
        if (!node || typeof node !== "object") continue;
        if (typeof node.$ref === "string") {
          var match = /^([a-z0-9-]+\.schema\.json)/.exec(node.$ref);
          if (match && match[1] !== file && match[1] !== "common.schema.json") {
            var key = file + "->" + match[1];
            if (!seen[key]) { seen[key] = true; edges.push([file, match[1]]); }
          }
        }
        Object.keys(node).forEach(function (key) {
          if (key === "$ref") return;
          var value = node[key];
          if (value && typeof value === "object") stack.push(value);
        });
      }
    });
    var list = document.getElementById("er-list");
    clear(list);
    edges.forEach(function (edge) {
      var li = document.createElement("li");
      var from = schemas[edge[0]];
      var to = schemas[edge[1]];
      li.textContent = (from && from.title ? from.title : edge[0]) + " references " + (to && to.title ? to.title : edge[1]) + " (" + edge[0] + " → " + edge[1] + "). " + ((to && to.description) || "");
      list.appendChild(li);
    });

    var col = { "dataset.schema.json": 0 };
    edges.forEach(function (edge) {
      if (edge[0] === "dataset.schema.json") col[edge[1]] = 1;
    });
    edges.forEach(function (edge) {
      if (col[edge[0]] == null) col[edge[0]] = 2;
      if (col[edge[1]] == null) col[edge[1]] = Math.min((col[edge[0]] || 1) + 1, 3);
    });
    var columns = [[], [], [], []];
    Object.keys(col).forEach(function (file) {
      if (!schemas[file]) return;
      var c = Math.min(col[file], 3);
      columns[c].push(file);
    });
    columns.forEach(function (files) { files.sort(); });
    var rowH = 28;
    var colW = 230;
    var height = Math.max.apply(null, columns.map(function (files) { return files.length; })) * rowH + 20;
    var svg = document.getElementById("er");
    clear(svg);
    svg.setAttribute("viewBox", "0 0 " + (colW * 4) + " " + Math.max(height, 40));
    svg.setAttribute("width", String(colW * 4));
    svg.setAttribute("height", String(Math.max(height, 40)));
    var pos = {};
    columns.forEach(function (files, c) {
      files.forEach(function (file, i) {
        pos[file] = [c * colW + 8, 16 + i * rowH];
      });
    });
    edges.forEach(function (edge) {
      if (!pos[edge[0]] || !pos[edge[1]]) return;
      el("line", {
        x1: pos[edge[0]][0] + 150, y1: pos[edge[0]][1] + 8,
        x2: pos[edge[1]][0], y2: pos[edge[1]][1] + 8,
        stroke: "currentColor", "stroke-width": 1
      }, svg);
    });
    Object.keys(pos).forEach(function (file) {
      var title = (schemas[file] && schemas[file].title) || file;
      el("rect", { x: pos[file][0], y: pos[file][1], width: 150, height: 20, rx: 4, fill: "none", stroke: "currentColor" }, svg);
      var text = el("text", { x: pos[file][0] + 6, y: pos[file][1] + 14 }, svg);
      text.textContent = title;
    });
  }

  function useExample(name) {
    var data = name === "complex" ? complex : simple;
    model = prepare(data);
    indexDataset(model);
    currentLevel = defaultLevel(model);
    fillLevels();
    buildTree();
    selectedId = "";
    document.getElementById("detail-intro").textContent = "Select a shape or a row in the tree.";
    document.getElementById("detail-json").textContent = "";
    clear(document.getElementById("detail-fields"));
    drawMap();
    document.getElementById("map-title").textContent = (data.site && data.site.name ? data.site.name : "Example") + ", level " + currentLevel;
  }

  document.querySelectorAll('input[name="example"]').forEach(function (input) {
    input.addEventListener("change", function () {
      if (input.checked) useExample(input.value);
    });
  });
  levelSelect.addEventListener("change", function () {
    currentLevel = levelSelect.value;
    var info = model.levelById[currentLevel];
    document.getElementById("map-title").textContent = (info ? info.facility.name + " " + info.level.label : currentLevel);
    drawMap();
  });
  mapSvg.addEventListener("click", function (event) {
    var target = event.target.closest("[data-select]");
    if (target) select(target.getAttribute("data-select"));
  });
  mapSvg.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    var target = event.target.closest && event.target.closest("[data-select]");
    if (!target) return;
    event.preventDefault();
    select(target.getAttribute("data-select"));
  });
  document.querySelector(".controls").addEventListener("submit", function (event) {
    event.preventDefault();
  });
  document.body.addEventListener("click", function (event) {
    var button = event.target.closest("button.tree-row");
    if (!button) return;
    var id = button.getAttribute("data-select");
    if (!id) {
      var ul = button.parentElement.querySelector(":scope > ul");
      var open = button.getAttribute("aria-expanded") !== "true";
      if (ul) ul.hidden = !open;
      button.setAttribute("aria-expanded", open ? "true" : "false");
      return;
    }
    select(id, { quiet: true });
  });
  document.getElementById("tree-expand").addEventListener("click", function () { setAll(true); });
  document.getElementById("tree-collapse").addEventListener("click", function () { setAll(false); });

  Promise.all([
    fetchJson("data/examples/simple-carpark-dataset.json"),
    fetchJson("data/examples/merriwa-park-dataset.json"),
    fetchJson("data/schemas.json")
  ]).then(function (loaded) {
    simple = loaded[0];
    complex = loaded[1];
    schemas = loaded[2];
    renderEr();
    useExample("simple");
  }).catch(function (err) {
    loadError.hidden = false;
    loadError.textContent = "Could not load the example data. " + err.message;
    console.error(err);
  });
})();
