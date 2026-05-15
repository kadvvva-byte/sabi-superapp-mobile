import { getAuthenticatedAuthSession, getAuthSessionState } from "../../../core/kernel/auth/session.store";
import { getSabiApiBaseUrlCandidates } from "../../../shared/api/apiBaseUrl";
import type {
  SabiQrExecuteResponse,
  SabiQrExecutionPolicy,
  SabiQrFunctionCode,
  SabiQrProviderRegistryItem,
  SabiQrRail,
  SabiQrResolveResponse,
  SabiQrSurface,
  SabiQrTokenRecord,
  SabiQrTokenRequest,
  SabiQrValidateResponse,
} from "../contracts/universalQr.contracts";
import {
  getSabiQrExecuteReasonForStatus,
  normalizeSabiQrExecuteFailure,
  normalizeSabiQrExecuteStatus,
} from "../runtime/qrExecutionMapping";
import type { SabiQrAdminRiskSignal, SabiQrModuleStatusRecord } from "../runtime/qrModuleIntegration";

function getBaseUrlCandidates(): string[] {
  const auth = getAuthSessionState();
  return getSabiApiBaseUrlCandidates(auth.apiBaseUrl);
}

async function fetchQrApi(path: string, init?: RequestInit): Promise<Response> {
  const candidates = getBaseUrlCandidates();
  let lastError: unknown = null;

  for (const baseUrl of candidates) {
    try {
      return await fetch(`${baseUrl}${path}`, init);
    } catch (error) {
      lastError = error;
    }
  }

  const error = new Error("qr.mobile.error.createFailed");
  (error as Error & { details?: unknown }).details = lastError;
  throw error;
}

function getAuthHeaders(): Record<string, string> {
  const authenticated = getAuthenticatedAuthSession();
  const session = getAuthSessionState();
  const accessToken = authenticated?.accessToken ?? session.accessToken;
  const currentUserId = authenticated?.currentUserId ?? session.currentUserId;
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (currentUserId) {
    headers["x-user-id"] = currentUserId;
  }

  return headers;
}

function getRawApiCode(data: unknown, fallback: string): string {
  if (typeof data === "string" && data.trim()) return data.trim();
  if (!data || typeof data !== "object") return fallback;

  const record = data as Record<string, unknown>;
  const candidates = [
    record.error,
    record.code,
    record.reason,
    record.message,
    record.status,
    record.type,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }

  return fallback;
}

function mapQrApiError(rawCode: string, status: number): string {
  const normalized = rawCode.trim();
  const map: Record<string, string> = {
    qr_auth_required: "qr.mobile.error.authRequired",
    actor_user_id_required: "qr.mobile.error.authRequired",
    qr_signing_secret_not_configured: "qr.mobile.error.signingNotConfigured",
    signing_secret_not_configured: "qr.mobile.error.signingNotConfigured",
    amount_required: "qr.mobile.error.amountRequired",
    qr_amount_required: "qr.mobile.error.amountRequired",
    currency_required: "qr.mobile.error.currencyRequired",
    qr_currency_required: "qr.mobile.error.currencyRequired",
    reference_required: "qr.mobile.error.referenceRequired",
    counterparty_required: "qr.mobile.error.counterpartyRequired",
    unknown_qr_function: "qr.mobile.error.createFailed",
    invalid_qr_value: "qr.mobile.error.invalidQr",
    qr_token_not_found_or_expired_runtime: "qr.mobile.error.expiredOrMissing",
    qr_token_not_found_or_expired: "qr.mobile.error.expiredOrMissing",
    qr_provider_not_configured: "qr.mobile.result.providerNotConfigured.description",
    provider_not_configured: "qr.mobile.result.providerNotConfigured.description",
    qr_executor_not_configured: "qr.mobile.result.executorNotConfigured.description",
    executor_not_configured: "qr.mobile.result.executorNotConfigured.description",
    qr_route_not_supported: "qr.mobile.result.executorNotConfigured.description",
    qr_restricted: "qr.mobile.result.restricted.description",
    restricted: "qr.mobile.result.restricted.description",
    pending_review: "qr.mobile.result.pendingReview.description",
    review_required: "qr.mobile.result.pendingReview.description",
  };

  if (normalized.startsWith("qr.mobile.")) return normalized;
  return map[normalized] ?? (status === 401 ? "qr.mobile.error.authRequired" : "qr.mobile.error.generic");
}

async function readResponsePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json") ? response.json() : response.text();
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetchQrApi(path, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  const data = await readResponsePayload(response);

  if (!response.ok) {
    const rawCode = getRawApiCode(data, `qr_http_${response.status}`);
    const message = mapQrApiError(rawCode, response.status);

    const error = new Error(message);
    (error as Error & { details?: unknown; rawCode?: string; status?: number }).details = data;
    (error as Error & { rawCode?: string }).rawCode = rawCode;
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return data as T;
}

function pickRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function pickString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeExecuteResponse(data: unknown): SabiQrExecuteResponse {
  const outer = pickRecord(data);
  const nested = pickRecord(outer.data);
  const source = nested.status || nested.transactionId || nested.qrOperationId ? nested : outer;
  const status = normalizeSabiQrExecuteStatus(source.status ?? outer.status);
  const transactionId = pickString(source, "transactionId") ?? pickString(source, "txId");
  const attendanceRecordId = pickString(source, "attendanceRecordId");
  const reviewId = pickString(source, "reviewId");
  const reason = pickString(source, "reason") ?? pickString(source, "message");

  // QR-100.10 hard rule: never promote a failed/unknown response to success from
  // transactionId, attendanceRecordId, reviewId, or a generic ok flag alone.
  // Success is allowed only when the backend/provider explicitly returns a success status.
  const ok = status === "success";

  return {
    ok,
    status,
    transactionId,
    attendanceRecordId,
    reviewId,
    reason: reason ?? (status === "success" ? undefined : getSabiQrExecuteReasonForStatus(status)),
  };
}

export async function createSabiQrToken(request: SabiQrTokenRequest): Promise<SabiQrTokenRecord> {
  const response = await requestJson<{ token: SabiQrTokenRecord }>("/api/v2/qr/tokens", {
    method: "POST",
    body: JSON.stringify(request),
  });

  return response.token;
}

export async function fetchSabiQrHistory(): Promise<SabiQrTokenRecord[]> {
  const response = await requestJson<{ tokens: SabiQrTokenRecord[] }>("/api/v2/qr/history", {
    method: "GET",
  });

  return response.tokens;
}

export async function resolveSabiQr(rawValue: string): Promise<SabiQrResolveResponse> {
  return requestJson<SabiQrResolveResponse>("/api/v2/qr/resolve", {
    method: "POST",
    body: JSON.stringify({ rawValue }),
  });
}

export async function validateSabiQr(rawValue: string): Promise<SabiQrValidateResponse> {
  return requestJson<SabiQrValidateResponse>("/api/v2/qr/validate", {
    method: "POST",
    body: JSON.stringify({ rawValue }),
  });
}

export async function executeSabiQr(params: {
  rawValue: string;
  idempotencyKey?: string;
  functionCode?: SabiQrFunctionCode;
  surface?: SabiQrSurface;
  rail?: SabiQrRail;
  executionPolicy?: SabiQrExecutionPolicy;
  executorUserId?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}): Promise<SabiQrExecuteResponse> {
  try {
    const session = getAuthSessionState();
    const executorUserId = params.executorUserId ?? session.currentUserId ?? undefined;
    const response = await fetchQrApi("/api/v2/qr/execute", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...(params.idempotencyKey ? { "Idempotency-Key": params.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        ...params,
        executorUserId,
        actorUserId: executorUserId,
        metadata: {
          ...(params.metadata ?? {}),
          executorUserId,
          authSessionUserId: session.currentUserId,
          authSessionBound: Boolean(session.currentUserId),
          manualIdentityInputAllowed: false,
        },
      }),
    });

    const data = await readResponsePayload(response);

    if (!response.ok) {
      const rawCode = getRawApiCode(data, `qr_http_${response.status}`);
      return normalizeSabiQrExecuteFailure(rawCode, response.status, params.functionCode);
    }

    return normalizeExecuteResponse(data);
  } catch (err) {
    const maybeError = err as Error & { rawCode?: string; status?: number };
    return normalizeSabiQrExecuteFailure(
      maybeError.rawCode || maybeError.message || "qr_executor_not_configured",
      maybeError.status,
      params.functionCode,
    );
  }
}


export async function fetchSabiQrProviderRegistry(): Promise<SabiQrProviderRegistryItem[]> {
  const response = await requestJson<{ providers: SabiQrProviderRegistryItem[] }>(
    "/api/v2/qr/admin/provider-registry",
    { method: "GET" },
  );

  return response.providers;
}


function buildQuery(params: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const text = query.toString();
  return text ? `?${text}` : "";
}

export async function fetchSabiQrModuleStatus(params: {
  functionCode?: SabiQrFunctionCode;
  tokenId?: string;
  transactionId?: string;
  attendanceRecordId?: string;
  reviewId?: string;
}): Promise<SabiQrModuleStatusRecord | null> {
  const response = await requestJson<{
    record?: SabiQrModuleStatusRecord | null;
    status?: SabiQrModuleStatusRecord | null;
  }>(`/api/v2/qr/status${buildQuery({
    functionCode: params.functionCode,
    tokenId: params.tokenId,
    transactionId: params.transactionId,
    attendanceRecordId: params.attendanceRecordId,
    reviewId: params.reviewId,
  })}`, {
    method: "GET",
  });

  return response.record ?? response.status ?? null;
}

export async function fetchSabiQrModuleHistory(params?: {
  functionCode?: SabiQrFunctionCode;
  surface?: SabiQrSurface;
  rail?: SabiQrRail;
  limit?: string;
}): Promise<SabiQrModuleStatusRecord[]> {
  const response = await requestJson<{
    records?: SabiQrModuleStatusRecord[];
    history?: SabiQrModuleStatusRecord[];
  }>(`/api/v2/qr/module-history${buildQuery({
    functionCode: params?.functionCode,
    surface: params?.surface,
    rail: params?.rail,
    limit: params?.limit,
  })}`, {
    method: "GET",
  });

  return response.records ?? response.history ?? [];
}

export async function submitSabiQrAdminRiskSignal(signal: SabiQrAdminRiskSignal): Promise<{
  accepted: boolean;
  reviewId?: string;
}> {
  if (!signal.shouldReport) {
    return { accepted: false };
  }

  return requestJson<{ accepted: boolean; reviewId?: string }>("/api/v2/qr/admin/risk-signals", {
    method: "POST",
    body: JSON.stringify(signal),
  });
}
