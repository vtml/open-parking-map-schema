import type { ValidationIssue } from "./validation-rules";

export interface SchemaFinding {
  instancePath: string;
  message: string;
}

type Obj = Record<string, unknown>;

function isObj(value: unknown): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const labels: Record<string, string> = {
  bays: "Bay",
  zones: "Zone",
  access_points: "Entrance or exit",
  gates: "Gate",
  drive_edges: "Drive edge",
  pedestrian_portals: "Portal",
  destinations: "Destination",
  handover_zones: "Drop-off zone",
  lifts: "Lift",
  stair_cores: "Stair core",
  accessible_paths: "Path",
  site: "Site",
  facilities: "Facility",
};

export function explainSchemaFinding(raw: unknown, finding: SchemaFinding): ValidationIssue {
  const parts = finding.instancePath.split("/").filter(Boolean);
  let featureId: string | undefined;
  let noun = "This value";
  if (isObj(raw) && parts.length >= 1) {
    const collection = raw[parts[0]];
    noun = labels[parts[0]] ?? parts[0].replaceAll("_", " ");
    if (Array.isArray(collection)) {
      const index = Number(parts[1]);
      const item = collection[index];
      if (isObj(item) && typeof item.id === "string") featureId = item.id;
    } else if (isObj(collection) && typeof collection.id === "string") {
      featureId = collection.id;
    }
  }
  const field = parts.at(-1);
  const who = featureId ? `${noun} ${featureId}` : noun;
  const detail = field && field !== parts[0] ? `${field.replaceAll("_", " ")}` : "value";
  return {
    featureId,
    path: finding.instancePath || "/",
    message: `${who} has a ${detail} problem: ${finding.message}.`,
  };
}
