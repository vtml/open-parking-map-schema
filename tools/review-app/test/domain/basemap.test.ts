import { describe, expect, it } from "vitest";
import { basemapOffered, osmTileUrl } from "../../src/domain/basemap";

describe("optional basemap", () => {
  it("is offered only for open-air levels and builds an OSM tile URL", () => {
    expect(basemapOffered(false)).toBe(false);
    expect(basemapOffered(true)).toBe(true);
    expect(osmTileUrl(-37.85, 145.05, 16)).toMatch(/^https:\/\/tile\.openstreetmap\.org\/16\/\d+\/\d+\.png$/);
  });
});
