export type RateLimitScope =
  | "login_ip"
  | "login_email_failures"
  | "password_reset_request_ip"
  | "password_reset_request_email"
  | "password_reset_confirm_ip"
  | "password_reset_confirm_token"
  | "activation_ip"
  | "activation_token"
  | "snapshot_create_ip"
  | "snapshot_continue_ip"
  | "snapshot_continue_lead";

export type RateLimitPolicy = {
  scope: RateLimitScope;
  /** Max allowed increments within the window (inclusive). */
  limit: number;
  windowMs: number;
  /**
   * What increments the counter.
   * - attempts: every call
   * - failures: only failed auth outcomes (login email bucket)
   */
  counts: "attempts" | "failures";
};

const MINUTES = 60_000;
const HOURS = 60 * MINUTES;

/**
 * Initial thresholds from SS-SEC-004 discovery (staging starting values).
 * Tune via env overrides where documented; defaults match the approved plan.
 */
export const AUTH_RATE_LIMIT_POLICIES: Record<RateLimitScope, RateLimitPolicy> = {
  login_ip: {
    scope: "login_ip",
    limit: 20,
    windowMs: 15 * MINUTES,
    counts: "attempts",
  },
  login_email_failures: {
    scope: "login_email_failures",
    limit: 5,
    windowMs: 15 * MINUTES,
    // Atomic admit-before-verify; cleared on successful login (see clearLoginEmailFailures).
    counts: "failures",
  },
  password_reset_request_ip: {
    scope: "password_reset_request_ip",
    limit: 10,
    windowMs: 1 * HOURS,
    counts: "attempts",
  },
  password_reset_request_email: {
    scope: "password_reset_request_email",
    limit: 3,
    windowMs: 1 * HOURS,
    counts: "attempts",
  },
  password_reset_confirm_ip: {
    scope: "password_reset_confirm_ip",
    limit: 5,
    windowMs: 15 * MINUTES,
    counts: "attempts",
  },
  password_reset_confirm_token: {
    scope: "password_reset_confirm_token",
    limit: 5,
    windowMs: 15 * MINUTES,
    counts: "attempts",
  },
  activation_ip: {
    scope: "activation_ip",
    limit: 5,
    windowMs: 15 * MINUTES,
    counts: "attempts",
  },
  activation_token: {
    scope: "activation_token",
    limit: 5,
    windowMs: 15 * MINUTES,
    counts: "attempts",
  },
  snapshot_create_ip: {
    scope: "snapshot_create_ip",
    limit: 10,
    windowMs: 15 * MINUTES,
    counts: "attempts",
  },
  snapshot_continue_ip: {
    scope: "snapshot_continue_ip",
    limit: 5,
    windowMs: 15 * MINUTES,
    counts: "attempts",
  },
  snapshot_continue_lead: {
    scope: "snapshot_continue_lead",
    limit: 3,
    windowMs: 1 * HOURS,
    counts: "attempts",
  },
};

export type RateLimitFailMode = "open" | "closed";

export const AUTH_RATE_LIMIT_FAIL_MODE: Record<
  | "login"
  | "password_reset_request"
  | "password_reset_confirm"
  | "activation"
  | "snapshot_continue"
  | "snapshot_create",
  RateLimitFailMode
> = {
  login: "open",
  password_reset_request: "closed",
  password_reset_confirm: "open",
  activation: "open",
  snapshot_continue: "closed",
  snapshot_create: "closed",
};
