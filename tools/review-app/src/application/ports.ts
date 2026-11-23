export interface SchemaFinding {
  instancePath: string;
  message: string;
}

export interface SchemaValidatorPort {
  validateDataset(raw: unknown): SchemaFinding[];
  validateReview(raw: unknown): SchemaFinding[];
}

export interface ClockPort {
  now(): string;
}

export interface StoragePort {
  load(key: string): string | null;
  save(key: string, value: string): void;
}

export interface ReadableFile {
  name: string;
  text(): Promise<string>;
}
