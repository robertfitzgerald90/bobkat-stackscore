export type FulfillmentOutcome =
  | "already_fulfilled"
  | "fulfilled"
  | "manual_review"
  | "ignored";

export type FulfillmentResult = {
  outcome: FulfillmentOutcome;
  purchaseId?: string;
  requiresActivation?: boolean;
  activationToken?: string;
  assessmentId?: string;
  reason?: string;
};
