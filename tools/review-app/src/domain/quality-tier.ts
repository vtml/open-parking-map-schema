import { reviewerRoles, type Verification } from "./verification";

export const reviewRoles = reviewerRoles;

export interface TierClaim {
  allowed: boolean;
  reason: string;
}

export interface TierExplanation {
  declaredTier: number;
  ownerVerified: boolean;
  claimAllowed: boolean;
  summary: string;
}

export function ownerVerified(verifications: Verification[], datasetVersion: string): boolean {
  return verifications.some(
    (record) => record.role === "owner" && record.status === "confirmed" && record.datasetVersion === datasetVersion,
  );
}

export function tierClaimAllowed(tier: number, verifications: Verification[], datasetVersion: string): TierClaim {
  if (tier < 2) {
    return { allowed: true, reason: "Tier 0 and tier 1 do not require an owner confirmation." };
  }
  if (!ownerVerified(verifications, datasetVersion)) {
    return {
      allowed: false,
      reason: `Tier ${tier} requires an owner verification with status confirmed for dataset version ${datasetVersion}. An owner confirmation does not raise the tier by itself.`,
    };
  }
  return {
    allowed: true,
    reason: `Tier ${tier} is allowed because the owner confirmed dataset version ${datasetVersion}.`,
  };
}

export function explainTier(tier: number, verifications: Verification[], datasetVersion: string): TierExplanation {
  const verified = ownerVerified(verifications, datasetVersion);
  const claim = tierClaimAllowed(tier, verifications, datasetVersion);
  const summary = verified
    ? `The declared tier is ${tier}. The owner has confirmed this dataset version. That confirmation does not raise the numeric tier.`
    : `The declared tier is ${tier}. ${claim.reason}`;
  return { declaredTier: tier, ownerVerified: verified, claimAllowed: claim.allowed, summary };
}

export function centrelineRequired(facilityTier: number, featureVerifications: Verification[], datasetVersion: string): boolean {
  return facilityTier >= 2 || ownerVerified(featureVerifications, datasetVersion);
}
