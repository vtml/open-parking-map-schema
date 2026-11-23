import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const schemaDir = join(dirname(fileURLToPath(import.meta.url)), "../../../../schema");

export function readSchemaDocuments(): unknown[] {
  return readdirSync(schemaDir)
    .filter((name) => name.endsWith(".schema.json"))
    .sort()
    .map((name) => JSON.parse(readFileSync(join(schemaDir, name), "utf8")) as unknown);
}
