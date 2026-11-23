import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import type { SchemaValidatorPort } from "../application/ports";
import type { AnySchema, ErrorObject } from "ajv";

type SchemaDoc = { $id?: string };

function findings(errors: ErrorObject[] | null | undefined): { instancePath: string; message: string }[] {
  return (errors ?? []).map((error) => ({
    instancePath: error.instancePath,
    message: error.message ?? "is not valid",
  }));
}

export function createAjvValidator(documents: unknown[]): SchemaValidatorPort {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  for (const document of documents) {
    const schema = document as SchemaDoc;
    if (schema.$id) ajv.addSchema(document as AnySchema);
  }
  const dataset = ajv.getSchema("https://opms.example.org/schema/0.3/dataset.schema.json");
  const review = ajv.getSchema("https://opms.example.org/schema/0.3/review.schema.json");
  if (!dataset || !review) throw new Error("OPMS dataset or review schema was not loaded.");
  return {
    validateDataset(raw) {
      dataset(raw);
      return findings(dataset.errors);
    },
    validateReview(raw) {
      review(raw);
      return findings(review.errors);
    },
  };
}
