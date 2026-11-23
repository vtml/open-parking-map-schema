import { describe, expect, it } from "vitest";
import { explainTier, tierClaimAllowed } from "../../src/domain/quality-tier";
import type { Verification } from "../../src/domain/verification";

const version = "2026-11-23.2";

function ownerConfirmed(): Verification {
  return {
    role: "owner",
    status: "confirmed",
    reviewedAt: "2026-11-20T10:00:00+11:00",
    datasetVersion: version,
  };
}

describe("quality tier policy", () => {
  it("allows tier 0 and tier 1 without an owner confirmation", () => {
    expect(tierClaimAllowed(1, [], version).allowed).toBe(true);
    expect(tierClaimAllowed(0, [], version).allowed).toBe(true);
  });

  it("refuses tier 2 when the owner has not confirmed this dataset version", () => {
    const result = tierClaimAllowed(2, [], version);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/owner/i);
    expect(result.reason).toMatch(/confirmed/i);
  });

  it("refuses tier 3 when the confirmation is for a different dataset version", () => {
    const stale = { ...ownerConfirmed(), datasetVersion: "2026-01-01.1" };
    expect(tierClaimAllowed(3, [stale], version).allowed).toBe(false);
  });

  it("allows tier 2 and tier 3 when the owner confirmed this dataset version", () => {
    expect(tierClaimAllowed(2, [ownerConfirmed()], version).allowed).toBe(true);
    expect(tierClaimAllowed(3, [ownerConfirmed()], version).allowed).toBe(true);
  });

  it("does not treat an owner confirmation as raising the numeric tier", () => {
    const explained = explainTier(1, [ownerConfirmed()], version);
    expect(explained.declaredTier).toBe(1);
    expect(explained.ownerVerified).toBe(true);
    expect(explained.summary).toMatch(/does not raise/i);
  });
});
