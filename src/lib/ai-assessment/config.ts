export const AI_REVIEW_PROMPT_VERSION = "assessment-review-v1";
export const AI_REVIEW_TIMEOUT_MS = 90_000;
export function aiReviewConfig() {
  const model = process.env.OPENAI_ASSESSMENT_MODEL?.trim() ?? "";
  return {
    enabled:
      process.env.AI_ASSESSMENT_REVIEW_ENABLED === "true" &&
      Boolean(process.env.OPENAI_API_KEY) &&
      Boolean(model),
    model,
  };
}

export class AiReviewError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}
