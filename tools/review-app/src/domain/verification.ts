export const reviewerRoles = ["owner", "operator", "authority", "crowd"] as const;
export type ReviewerRole = (typeof reviewerRoles)[number];

export const verificationStatuses = ["confirmed", "incorrect", "missing", "not-checked"] as const;
export type VerificationStatus = (typeof verificationStatuses)[number];

export interface Verification {
  role: ReviewerRole;
  status: VerificationStatus;
  note?: string;
  evidenceRef?: string;
  reviewedAt: string;
  datasetVersion: string;
}

export function isReviewerRole(value: string): value is ReviewerRole {
  return (reviewerRoles as readonly string[]).includes(value);
}

export function isVerificationStatus(value: string): value is VerificationStatus {
  return (verificationStatuses as readonly string[]).includes(value);
}
