import { createAjvValidator } from "./ajv-schema-validator";
import type { SchemaValidatorPort } from "../application/ports";

const modules = import.meta.glob("../../../../schema/*.schema.json", { eager: true, import: "default" });

export function browserSchemaValidator(): SchemaValidatorPort {
  return createAjvValidator(Object.values(modules));
}
