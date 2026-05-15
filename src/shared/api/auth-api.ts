import { getSabiApiBaseUrlCandidates, resolveSabiApiBaseUrl } from "./apiBaseUrl";

const DEFAULT_AUTH_API_BASE_URL = resolveSabiApiBaseUrl(undefined, { port: "4001" });

const REQUEST_OTP_ENDPOINT_CANDIDATES = [
  "/auth/request-otp",
  "/api/auth/request-otp",
  "/api/v2/auth/request-otp",
  "/auth/otp/request",
  "/api/auth/otp/request",
  "/api/v2/auth/otp/request",
  "/request-otp",
] as const;

const VERIFY_ENDPOINT_CANDIDATES = [
  "/auth/verify",
  "/api/auth/verify",
  "/api/v2/auth/verify",
  "/auth/otp/verify",
  "/api/auth/otp/verify",
  "/api/v2/auth/otp/verify",
  "/verify",
] as const;

const LOGOUT_ENDPOINT_CANDIDATES = [
  "/auth/logout",
  "/api/auth/logout",
  "/api/v2/auth/logout",
  "/logout",
] as const;

const DELETE_ACCOUNT_ENDPOINT_CANDIDATES = [
  "/auth/account",
  "/api/auth/account",
  "/api/v2/auth/account",
  "/auth/delete-account",
  "/api/auth/delete-account",
  "/api/v2/auth/delete-account",
  "/delete-account",
] as const;

type RequestOtpRequest = {
  phone: string;
  apiBaseUrl?: string | null;
};

export type RequestOtpResponse = {
  apiBaseUrl: string;
  phone: string;
  expiresAt?: string;
  otpCode?: string;
};

type VerifyOtpRequest = {
  phone: string;
  code: string;
  apiBaseUrl?: string | null;
};

type VerifyOtpProfile = {
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
};

export type VerifyOtpSession = {
  apiBaseUrl: string;
  accessToken: string;
  refreshToken?: string | null;
  currentUserId: string;
  profileCompleted: boolean;
  profile: VerifyOtpProfile;
};

export type AuthenticatedApiSession = {
  apiBaseUrl?: string | null;
  accessToken: string;
};

export type LogoutResponse = {
  ok: true;
  userId?: string;
};

export type DeleteAccountResponse = {
  ok: true;
  userId?: string;
};

function normalizeBaseUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  return withProtocol.replace(/:4000(?=\/|$)/, ":4001").replace(/\/+$/, "");
}

function pushUniqueBaseUrl(target: string[], value: unknown) {
  const normalized = normalizeBaseUrl(value);
  if (normalized && !target.includes(normalized)) {
    target.push(normalized);
  }
}

export function getAuthApiBaseUrlCandidates(sessionBaseUrl?: string | null): string[] {
  const candidates: string[] = [];
  const explicitAuthBaseUrl = process.env.EXPO_PUBLIC_AUTH_API_BASE_URL?.trim();
  const explicitApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  const authPort =
    process.env.EXPO_PUBLIC_AUTH_API_PORT?.trim() ||
    process.env.EXPO_PUBLIC_API_PORT?.trim() ||
    "4001";

  pushUniqueBaseUrl(candidates, explicitAuthBaseUrl);
  pushUniqueBaseUrl(candidates, sessionBaseUrl);
  pushUniqueBaseUrl(candidates, explicitApiBaseUrl);

  for (const candidate of getSabiApiBaseUrlCandidates(undefined, { port: authPort })) {
    pushUniqueBaseUrl(candidates, candidate);
  }

  pushUniqueBaseUrl(candidates, DEFAULT_AUTH_API_BASE_URL);

  return candidates;
}
export function getAuthApiBaseUrl() {
  return getAuthApiBaseUrlCandidates()[0] ?? DEFAULT_AUTH_API_BASE_URL;
}

function resolveApiBaseUrl(value?: string | null) {
  return normalizeBaseUrl(value) || getAuthApiBaseUrl();
}

function buildAuthApiUrl(endpoint: string, baseUrl?: string | null) {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${resolveApiBaseUrl(baseUrl)}${normalizedEndpoint}`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readNestedString(source: Record<string, unknown>, path: string[]) {
  let current: unknown = source;

  for (const key of path) {
    if (!isObject(current) || !(key in current)) {
      return "";
    }

    current = current[key];
  }

  return asString(current);
}

function readPayload(json: unknown): Record<string, unknown> {
  if (!isObject(json)) {
    return {};
  }

  if (isObject(json.data)) {
    return json.data;
  }

  return json;
}

function extractAccessToken(payload: Record<string, unknown>) {
  return (
    asString(payload.accessToken) ||
    asString(payload.token) ||
    readNestedString(payload, ["session", "accessToken"]) ||
    readNestedString(payload, ["access", "token"])
  );
}

function extractRefreshToken(payload: Record<string, unknown>) {
  return (
    asString(payload.refreshToken) ||
    readNestedString(payload, ["session", "refreshToken"]) ||
    readNestedString(payload, ["refresh", "token"])
  );
}

function extractUserId(payload: Record<string, unknown>) {
  return (
    asString(payload.userId) ||
    asString(payload.currentUserId) ||
    readNestedString(payload, ["user", "id"]) ||
    readNestedString(payload, ["profile", "userId"])
  );
}

function extractProfileCompleted(payload: Record<string, unknown>) {
  if (typeof payload.profileCompleted === "boolean") {
    return payload.profileCompleted;
  }

  if (
    isObject(payload.profile) &&
    typeof payload.profile.profileCompleted === "boolean"
  ) {
    return payload.profile.profileCompleted;
  }

  return false;
}

function extractProfile(payload: Record<string, unknown>): VerifyOtpProfile {
  const profileSource = isObject(payload.profile) ? payload.profile : payload;

  return {
    firstName: asString(profileSource.firstName) || undefined,
    lastName: asString(profileSource.lastName) || undefined,
    username: asString(profileSource.username) || undefined,
    phone: asString(profileSource.phone) || undefined,
  };
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function postJsonRequest(
  endpoint: string,
  body: Record<string, unknown>,
  apiBaseUrl?: string | null,
): Promise<Response> {
  return fetch(buildAuthApiUrl(endpoint, apiBaseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function sendAuthorizedRequest(params: {
  apiBaseUrl?: string | null;
  accessToken: string;
  endpoint: string;
  method: "POST" | "DELETE";
}): Promise<Response> {
  const accessToken = params.accessToken.trim();

  if (!accessToken) {
    throw new Error("Access token is required.");
  }

  return fetch(buildAuthApiUrl(params.endpoint, params.apiBaseUrl), {
    method: params.method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

async function callAuthorizedEndpoint(
  method: "POST" | "DELETE",
  endpoints: readonly string[],
  session: AuthenticatedApiSession,
): Promise<Record<string, unknown>> {
  const errors: string[] = [];

  for (const endpoint of endpoints) {
    try {
      const response = await sendAuthorizedRequest({
        apiBaseUrl: session.apiBaseUrl,
        accessToken: session.accessToken,
        endpoint,
        method,
      });

      if (response.status === 404) {
        errors.push(`${endpoint}: endpoint not found`);
        continue;
      }

      const json = await parseJsonSafe(response);

      if (!response.ok) {
        const payload = readPayload(json);
        const message =
          asString(payload.message) ||
          asString(payload.error) ||
          `${method} request failed with status ${response.status}.`;

        errors.push(`${endpoint}: ${message}`);
        continue;
      }

      return readPayload(json);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Unknown ${method.toLowerCase()} request error.`;

      errors.push(`${endpoint}: ${message}`);
    }
  }

  throw new Error(
    `Authorized request failed at ${resolveApiBaseUrl(
      session.apiBaseUrl,
    )}. ${errors.join(" | ")}`,
  );
}

export async function requestOtpCode(
  request: RequestOtpRequest,
): Promise<RequestOtpResponse> {
  const phone = request.phone.trim();

  if (!phone) {
    throw new Error("Phone number is required.");
  }

  const errors: string[] = [];
  const baseUrls = getAuthApiBaseUrlCandidates(request.apiBaseUrl);

  for (const apiBaseUrl of baseUrls) {
    for (const endpoint of REQUEST_OTP_ENDPOINT_CANDIDATES) {
      try {
        const response = await postJsonRequest(endpoint, { phone }, apiBaseUrl);

        if (response.status === 404) {
          errors.push(`${apiBaseUrl}${endpoint}: endpoint not found`);
          continue;
        }

        const json = await parseJsonSafe(response);

        if (!response.ok) {
          const payload = readPayload(json);
          const message =
            asString(payload.message) ||
            asString(payload.error) ||
            `OTP request failed with status ${response.status}.`;

          errors.push(`${apiBaseUrl}${endpoint}: ${message}`);
          continue;
        }

        const payload = readPayload(json);

        return {
          apiBaseUrl,
          phone: asString(payload.phone) || phone,
          expiresAt: asString(payload.expiresAt) || undefined,
          otpCode: asString(payload.otpCode) || undefined,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown OTP request error.";
        errors.push(`${apiBaseUrl}${endpoint}: ${message}`);
      }
    }
  }

  throw new Error(
    `Server unreachable or request-otp endpoint not working. Tried ${baseUrls.join(
      ", ",
    )}. ${errors.join(" | ")}`,
  );
}

export async function verifyOtpCode(
  request: VerifyOtpRequest,
): Promise<VerifyOtpSession> {
  const phone = request.phone.trim();
  const code = request.code.trim();

  if (!phone) {
    throw new Error("Phone number is required.");
  }

  if (!code) {
    throw new Error("Verification code is required.");
  }

  const errors: string[] = [];
  const baseUrls = getAuthApiBaseUrlCandidates(request.apiBaseUrl);

  for (const apiBaseUrl of baseUrls) {
    for (const endpoint of VERIFY_ENDPOINT_CANDIDATES) {
      try {
        const response = await postJsonRequest(
          endpoint,
          {
            phone,
            code,
          },
          apiBaseUrl,
        );

        if (response.status === 404) {
          errors.push(`${apiBaseUrl}${endpoint}: endpoint not found`);
          continue;
        }

        const json = await parseJsonSafe(response);

        if (!response.ok) {
          const payload = readPayload(json);
          const message =
            asString(payload.message) ||
            asString(payload.error) ||
            `Verify request failed with status ${response.status}.`;

          errors.push(`${apiBaseUrl}${endpoint}: ${message}`);
          continue;
        }

        const payload = readPayload(json);
        const accessToken = extractAccessToken(payload);
        const refreshToken = extractRefreshToken(payload);
        const currentUserId = extractUserId(payload);

        if (!accessToken || !currentUserId) {
          errors.push(`${apiBaseUrl}${endpoint}: response does not contain accessToken/userId.`);
          continue;
        }

        return {
          apiBaseUrl,
          accessToken,
          refreshToken: refreshToken || null,
          currentUserId,
          profileCompleted: extractProfileCompleted(payload),
          profile: extractProfile(payload),
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown verify request error.";
        errors.push(`${apiBaseUrl}${endpoint}: ${message}`);
      }
    }
  }

  throw new Error(
    `Server unreachable or verify endpoint not working. Tried ${baseUrls.join(
      ", ",
    )}. ${errors.join(" | ")}`,
  );
}

export async function logoutAuthenticatedSession(
  session: AuthenticatedApiSession,
): Promise<LogoutResponse> {
  const payload = await callAuthorizedEndpoint(
    "POST",
    LOGOUT_ENDPOINT_CANDIDATES,
    session,
  );

  return {
    ok: true,
    userId: extractUserId(payload) || undefined,
  };
}

export async function deleteAuthenticatedAccount(
  session: AuthenticatedApiSession,
): Promise<DeleteAccountResponse> {
  const payload = await callAuthorizedEndpoint(
    "DELETE",
    DELETE_ACCOUNT_ENDPOINT_CANDIDATES,
    session,
  );

  return {
    ok: true,
    userId: extractUserId(payload) || undefined,
  };
}

