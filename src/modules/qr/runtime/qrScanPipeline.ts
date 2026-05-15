import type {
  SabiQrExecuteResponse,
  SabiQrExecutionPolicy,
  SabiQrFunctionCode,
  SabiQrFunctionDefinition,
  SabiQrRail,
  SabiQrSurface,
  SabiQrTokenRecord,
} from "../contracts/universalQr.contracts";
import {
  requireSabiQrActorIdentity,
  toSabiQrVerifiedIdentityPayload,
} from "./qrIdentityBinding";
import { createSabiQrIdempotencyKey } from "./qrExecutionGuards";
import { createSabiQrExecutionContext } from "./qrExecutionMapping";

export const SABI_QR_SCAN_PIPELINE_VERSION = "QR-100.10" as const;

export type SabiQrStrictPayload = {
  rawValue: string;
  token: SabiQrTokenRecord;
  definition: SabiQrFunctionDefinition;
};

export type SabiQrStrictExecuteParams = {
  rawValue: string;
  idempotencyKey: string;
  functionCode: SabiQrFunctionCode;
  surface: SabiQrSurface;
  rail: SabiQrRail;
  executionPolicy: SabiQrExecutionPolicy;
  executorUserId: string;
  metadata: Record<string, string | number | boolean | null | undefined>;
};

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function decodeRouteParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeSabiQrRawValue(value: string | string[] | null | undefined): string {
  const first = Array.isArray(value) ? value[0] : value;
  const normalized = normalizeText(first);
  return normalized ? decodeRouteParam(normalized).trim() : "";
}

export function assertSabiQrRawValue(value: string | string[] | null | undefined): string {
  const rawValue = normalizeSabiQrRawValue(value);

  if (!rawValue) {
    throw new Error("qr.mobile.confirm.emptyPayload");
  }

  if (rawValue.length > 4096) {
    throw new Error("qr.mobile.error.invalidQr");
  }

  const lower = rawValue.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:text/html")) {
    throw new Error("qr.mobile.error.invalidQr");
  }

  return rawValue;
}

function assertSameString(
  left: string | null | undefined,
  right: string | null | undefined,
  errorKey = "qr.mobile.error.invalidQr",
) {
  if (!left || !right || left !== right) {
    throw new Error(errorKey);
  }
}

function assertTokenNotExpired(token: SabiQrTokenRecord) {
  if (token.trustState === "expired") {
    throw new Error("qr.mobile.error.expiredOrMissing");
  }

  if (token.trustState === "rejected" || token.trustState === "client_preview_unsigned") {
    throw new Error("qr.mobile.error.invalidQr");
  }

  const expiresAt = Date.parse(token.expiresAt);
  if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
    throw new Error("qr.mobile.error.expiredOrMissing");
  }
}

export function assertSabiQrStrictPayload(input: {
  rawValue: string | string[] | null | undefined;
  token?: SabiQrTokenRecord | null;
  definition?: SabiQrFunctionDefinition | null;
}): SabiQrStrictPayload {
  const rawValue = assertSabiQrRawValue(input.rawValue);
  const token = input.token;
  const definition = input.definition;

  if (!token || !definition) {
    throw new Error("qr.mobile.confirm.validateFailed");
  }

  if (token.version !== "QR-100") {
    throw new Error("qr.mobile.error.invalidQr");
  }

  assertSameString(token.functionCode, definition.code);
  assertSameString(token.surface, definition.surface);
  assertSameString(token.rail, definition.rail);
  assertSameString(token.executionPolicy, definition.executionPolicy);
  assertSameString(token.actorUserId, token.verifiedIdentity?.userId ?? token.actorUserId, "qr.mobile.error.identityMismatch");

  if (!token.actorUserId) {
    throw new Error("qr.mobile.error.invalidQr");
  }

  if (token.verifiedIdentity?.userId && token.verifiedIdentity.userId !== token.actorUserId) {
    throw new Error("qr.mobile.error.identityMismatch");
  }

  assertTokenNotExpired(token);

  return { rawValue, token, definition };
}

export function buildSabiQrStrictExecuteParams(payload: SabiQrStrictPayload): SabiQrStrictExecuteParams {
  const executor = requireSabiQrActorIdentity();
  const verifiedExecutor = toSabiQrVerifiedIdentityPayload(executor);
  const executionContext = createSabiQrExecutionContext(payload.definition, payload.token);

  return {
    rawValue: payload.token.shortValue || payload.token.qrValue || payload.rawValue,
    idempotencyKey: createSabiQrIdempotencyKey(`${payload.token.functionCode}_${executor.userId}`),
    functionCode: payload.token.functionCode,
    surface: payload.token.surface,
    rail: payload.token.rail,
    executionPolicy: payload.token.executionPolicy,
    executorUserId: executor.userId,
    metadata: {
      ...executionContext,
      qrScanPipelineVersion: SABI_QR_SCAN_PIPELINE_VERSION,
      strictPayloadValidation: true,
      manualIdentityInputAllowed: false,
      identitySource: "auth_session_and_verified_profile",
      executorUserId: executor.userId,
      executorFirstName: verifiedExecutor.firstName,
      executorLastName: verifiedExecutor.lastName,
      executorDisplayName: verifiedExecutor.displayName,
      executorUsername: verifiedExecutor.username,
      executorSabiDisplayId: verifiedExecutor.sabiDisplayId,
      executorVerificationStatus: verifiedExecutor.verificationStatus,
      tokenActorUserId: payload.token.actorUserId,
      tokenId: payload.token.tokenId,
      tokenTrustState: payload.token.trustState,
      tokenSignaturePreview: payload.token.signaturePreview,
      tokenOwnerIdentitySource: payload.token.verifiedIdentity?.source ?? "server_token",
      amount: payload.token.amount ?? null,
      currency: payload.token.currency ?? null,
      reference: payload.token.reference ?? null,
      counterpartyId: payload.token.counterpartyId ?? null,
      organizationId: payload.token.organizationId ?? null,
    },
  };
}

export function normalizeSabiQrStrictExecuteFailure(error: unknown): SabiQrExecuteResponse {
  const message = error instanceof Error && error.message.startsWith("qr.mobile.")
    ? error.message
    : "qr.mobile.confirm.executeFailed";

  return {
    ok: false,
    status: message === "qr.mobile.error.authRequired" ? "failed" : "failed",
    reason: message,
  };
}
