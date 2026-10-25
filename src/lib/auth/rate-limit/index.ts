export {
  AUTH_RATE_LIMIT_FAIL_MODE,
  AUTH_RATE_LIMIT_POLICIES,
  type RateLimitFailMode,
  type RateLimitScope,
} from "./config";
export {
  clearRateLimitBucket,
  consumeRateLimit,
  getRateLimitCount,
  pruneExpiredRateLimitBuckets,
  type ConsumeRateLimitResult,
} from "./limiter";
export {
  firstForwardedIp,
  hashRateLimitIdentifier,
  normalizeEmailIdentifier,
  resolveClientIp,
} from "./keys";
export {
  RATE_LIMITED_CODE,
  RATE_LIMITED_MESSAGE,
  TEMPORARILY_UNAVAILABLE_MESSAGE,
  temporarilyUnavailableResponse,
  tooManyRequestsResponse,
} from "./responses";

import { AUTH_RATE_LIMIT_FAIL_MODE } from "./config";
import {
  clearRateLimitBucket,
  consumeRateLimit,
  type ConsumeRateLimitResult,
} from "./limiter";
import { normalizeEmailIdentifier, resolveClientIp } from "./keys";

/**
 * Login: IP attempt consume + atomic email admission (UPSERT increment).
 * Successful logins must call {@link clearLoginEmailFailures} so legitimate
 * users are not permanently throttled.
 */
export async function enforceLoginRateLimits(input: {
  request: Request;
  email: string;
}): Promise<ConsumeRateLimitResult> {
  const ip = resolveClientIp(input.request);
  const email = normalizeEmailIdentifier(input.email);

  const ipResult = await consumeRateLimit({
    scope: "login_ip",
    identifier: ip,
    failMode: AUTH_RATE_LIMIT_FAIL_MODE.login,
  });
  if (!ipResult.allowed) return ipResult;

  return consumeRateLimit({
    scope: "login_email_failures",
    identifier: email,
    failMode: AUTH_RATE_LIMIT_FAIL_MODE.login,
  });
}

/** Clears the email admission bucket after a successful credentials login. */
export async function clearLoginEmailFailures(email: string): Promise<void> {
  await clearRateLimitBucket("login_email_failures", normalizeEmailIdentifier(email));
}

export async function enforcePasswordResetRequestLimits(input: {
  request: Request;
  email: string;
}): Promise<ConsumeRateLimitResult> {
  const ip = resolveClientIp(input.request);
  const email = normalizeEmailIdentifier(input.email);

  const ipResult = await consumeRateLimit({
    scope: "password_reset_request_ip",
    identifier: ip,
    failMode: AUTH_RATE_LIMIT_FAIL_MODE.password_reset_request,
  });
  if (!ipResult.allowed) return ipResult;

  return consumeRateLimit({
    scope: "password_reset_request_email",
    identifier: email,
    failMode: AUTH_RATE_LIMIT_FAIL_MODE.password_reset_request,
  });
}

export async function enforcePasswordResetConfirmLimits(input: {
  request: Request;
  token: string;
}): Promise<ConsumeRateLimitResult> {
  const ip = resolveClientIp(input.request);

  const ipResult = await consumeRateLimit({
    scope: "password_reset_confirm_ip",
    identifier: ip,
    failMode: AUTH_RATE_LIMIT_FAIL_MODE.password_reset_confirm,
  });
  if (!ipResult.allowed) return ipResult;

  return consumeRateLimit({
    scope: "password_reset_confirm_token",
    identifier: input.token,
    failMode: AUTH_RATE_LIMIT_FAIL_MODE.password_reset_confirm,
  });
}

export async function enforceActivationLimits(input: {
  request: Request;
  token: string;
}): Promise<ConsumeRateLimitResult> {
  const ip = resolveClientIp(input.request);

  const ipResult = await consumeRateLimit({
    scope: "activation_ip",
    identifier: ip,
    failMode: AUTH_RATE_LIMIT_FAIL_MODE.activation,
  });
  if (!ipResult.allowed) return ipResult;

  return consumeRateLimit({
    scope: "activation_token",
    identifier: input.token,
    failMode: AUTH_RATE_LIMIT_FAIL_MODE.activation,
  });
}

export async function enforceSnapshotCreateLimits(request: Request): Promise<ConsumeRateLimitResult> {
  return consumeRateLimit({
    scope: "snapshot_create_ip",
    identifier: resolveClientIp(request),
    failMode: AUTH_RATE_LIMIT_FAIL_MODE.snapshot_create,
  });
}

export async function enforceSnapshotContinueLimits(input: {
  request: Request;
  leadId: string;
}): Promise<ConsumeRateLimitResult> {
  const ipResult = await consumeRateLimit({
    scope: "snapshot_continue_ip",
    identifier: resolveClientIp(input.request),
    failMode: AUTH_RATE_LIMIT_FAIL_MODE.snapshot_continue,
  });
  if (!ipResult.allowed) return ipResult;

  return consumeRateLimit({
    scope: "snapshot_continue_lead",
    identifier: input.leadId,
    failMode: AUTH_RATE_LIMIT_FAIL_MODE.snapshot_continue,
  });
}
