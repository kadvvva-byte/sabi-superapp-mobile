import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  clearAuthenticatedSession as clearAuthenticatedSessionState,
  getAuthSessionState,
  markAuthenticatedAuthSession,
  markAuthSessionHydrated,
  setAuthSessionHydrating,
  type AuthSessionState,
} from "./auth-session.store";

export const AUTH_SESSION_STORAGE_KEY = "sabi.auth.session";
export const AUTH_SESSION_STORAGE_FALLBACK_KEYS = [
  AUTH_SESSION_STORAGE_KEY,
  "superapp.auth.session",
  "superapp.auth.session.v1",
  "auth.session",
] as const;

export type PersistedAuthSessionPayload = {
  apiBaseUrl: string;
  accessToken: string;
  refreshToken?: string | null;
  currentUserId: string;
  phoneNumber?: string | null;
  persistedAt?: string | null;
};

export type ClearAuthenticatedSessionOptions = {
  markHydrated?: boolean;
  error?: string | null;
};

function nowIso(): string {
  return new Date().toISOString();
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeNullableString(value: unknown): string | null {
  return isNonEmptyString(value) ? value.trim() : null;
}

function isLoopbackHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "[::1]"
  );
}

function normalizeApiBaseUrl(
  value: unknown,
  options?: { rejectLoopback?: boolean },
): string | null {
  if (!isNonEmptyString(value)) {
    return null;
  }

  const normalized = value.trim().replace(/\/+$/, "");
  if (!normalized) {
    return null;
  }

  try {
    const parsed = new URL(normalized);

    if (options?.rejectLoopback && isLoopbackHost(parsed.hostname)) {
      return null;
    }

    if (parsed.port === "4000") {
      parsed.port = "4001";
    }

    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(
      /\/+$/,
      "",
    );
  } catch {
    if (options?.rejectLoopback) {
      const lowered = normalized.toLowerCase();
      if (
        lowered.includes("://localhost") ||
        lowered.includes("://127.0.0.1") ||
        lowered.includes("://[::1]") ||
        lowered.includes("://::1")
      ) {
        return null;
      }
    }

    return normalized.replace(/:4000(?=\/|$)/, ":4001");
  }
}

function sanitizePersistedAuthSession(
  value: unknown,
): PersistedAuthSessionPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;

  const apiBaseUrl = normalizeApiBaseUrl(source.apiBaseUrl, {
    rejectLoopback: true,
  });
  const accessToken = normalizeNullableString(source.accessToken);
  const currentUserId = normalizeNullableString(source.currentUserId);

  if (!apiBaseUrl || !accessToken || !currentUserId) {
    return null;
  }

  return {
    apiBaseUrl,
    accessToken,
    refreshToken: normalizeNullableString(source.refreshToken),
    currentUserId,
    phoneNumber: normalizeNullableString(source.phoneNumber),
    persistedAt: normalizeNullableString(source.persistedAt),
  };
}

function toPersistedPayloadFromState(
  state: AuthSessionState,
): PersistedAuthSessionPayload | null {
  if (
    state.status !== "authenticated" ||
    !state.apiBaseUrl ||
    !state.accessToken ||
    !state.currentUserId
  ) {
    return null;
  }

  const apiBaseUrl = normalizeApiBaseUrl(state.apiBaseUrl, {
    rejectLoopback: true,
  });

  if (!apiBaseUrl) {
    return null;
  }

  return {
    apiBaseUrl,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    currentUserId: state.currentUserId,
    phoneNumber: state.phoneNumber,
    persistedAt: nowIso(),
  };
}

async function removeAllPersistedAuthSessionKeys(): Promise<void> {
  await AsyncStorage.multiRemove([...AUTH_SESSION_STORAGE_FALLBACK_KEYS]);
}

async function readPersistedAuthSessionPayload(): Promise<PersistedAuthSessionPayload | null> {
  for (const key of AUTH_SESSION_STORAGE_FALLBACK_KEYS) {
    const raw = await AsyncStorage.getItem(key);

    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw);
      const sanitized = sanitizePersistedAuthSession(parsed);

      if (!sanitized) {
        await AsyncStorage.removeItem(key);
        continue;
      }

      return sanitized;
    } catch {
      await AsyncStorage.removeItem(key);
    }
  }

  return null;
}

async function writePersistedAuthSessionPayload(
  payload: PersistedAuthSessionPayload,
): Promise<void> {
  const apiBaseUrl = normalizeApiBaseUrl(payload.apiBaseUrl, {
    rejectLoopback: true,
  });

  if (!apiBaseUrl) {
    throw new Error(
      "Auth session apiBaseUrl is invalid or points to localhost. Use LAN/server IP instead of loopback host.",
    );
  }

  await AsyncStorage.setItem(
    AUTH_SESSION_STORAGE_KEY,
    JSON.stringify({
      ...payload,
      apiBaseUrl,
      persistedAt: payload.persistedAt ?? nowIso(),
    }),
  );
}

export async function persistAuthenticatedSessionToStorage(
  payload?: PersistedAuthSessionPayload | null,
): Promise<AuthSessionState> {
  const normalizedPayload =
    payload ?? toPersistedPayloadFromState(getAuthSessionState());

  if (!normalizedPayload) {
    return clearAuthenticatedSessionFromStorage({
      markHydrated: true,
      error: null,
    });
  }

  const apiBaseUrl = normalizeApiBaseUrl(normalizedPayload.apiBaseUrl, {
    rejectLoopback: true,
  });

  if (!apiBaseUrl) {
    await removeAllPersistedAuthSessionKeys();

    return clearAuthenticatedSessionState({
      markHydrated: true,
      error:
        "Auth session apiBaseUrl points to localhost. Re-login with a LAN/server API address.",
    });
  }

  const state = markAuthenticatedAuthSession({
    apiBaseUrl,
    accessToken: normalizedPayload.accessToken,
    refreshToken: normalizedPayload.refreshToken ?? null,
    currentUserId: normalizedPayload.currentUserId,
    phoneNumber: normalizedPayload.phoneNumber ?? null,
    restoredAt: normalizedPayload.persistedAt ?? nowIso(),
  });

  await writePersistedAuthSessionPayload({
    ...normalizedPayload,
    apiBaseUrl,
    persistedAt: normalizedPayload.persistedAt ?? nowIso(),
  });

  return state;
}

export async function clearAuthenticatedSessionFromStorage(
  options?: ClearAuthenticatedSessionOptions,
): Promise<AuthSessionState> {
  await removeAllPersistedAuthSessionKeys();

  return clearAuthenticatedSessionState({
    markHydrated: options?.markHydrated ?? true,
    error: options?.error ?? null,
  });
}

export async function restoreAuthenticatedSessionFromStorage(): Promise<AuthSessionState> {
  setAuthSessionHydrating(true);

  try {
    const persisted = await readPersistedAuthSessionPayload();

    if (!persisted) {
      return clearAuthenticatedSessionState({
        markHydrated: true,
        error: null,
      });
    }

    const state = markAuthenticatedAuthSession({
      apiBaseUrl: persisted.apiBaseUrl,
      accessToken: persisted.accessToken,
      refreshToken: persisted.refreshToken ?? null,
      currentUserId: persisted.currentUserId,
      phoneNumber: persisted.phoneNumber ?? null,
      restoredAt: persisted.persistedAt ?? nowIso(),
    });

    await writePersistedAuthSessionPayload({
      ...persisted,
      persistedAt: persisted.persistedAt ?? nowIso(),
    });

    markAuthSessionHydrated();
    return state;
  } catch (error) {
    await removeAllPersistedAuthSessionKeys();

    return clearAuthenticatedSessionState({
      markHydrated: true,
      error:
        error instanceof Error
          ? error.message
          : "Failed to restore auth session.",
    });
  }
}

export async function setAuthenticatedSessionAndPersist(payload: {
  apiBaseUrl: string;
  accessToken: string;
  refreshToken?: string | null;
  currentUserId: string;
  phoneNumber?: string | null;
  restoredAt?: string | null;
}): Promise<AuthSessionState> {
  const apiBaseUrl = normalizeApiBaseUrl(payload.apiBaseUrl, {
    rejectLoopback: true,
  });

  if (!apiBaseUrl) {
    await removeAllPersistedAuthSessionKeys();

    throw new Error(
      "Auth session apiBaseUrl points to localhost. Use LAN/server IP instead of loopback host.",
    );
  }

  const state = markAuthenticatedAuthSession({
    apiBaseUrl,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken ?? null,
    currentUserId: payload.currentUserId,
    phoneNumber: payload.phoneNumber ?? null,
    restoredAt: payload.restoredAt ?? nowIso(),
  });

  await writePersistedAuthSessionPayload({
    apiBaseUrl: state.apiBaseUrl!,
    accessToken: state.accessToken!,
    refreshToken: state.refreshToken,
    currentUserId: state.currentUserId!,
    phoneNumber: state.phoneNumber,
    persistedAt: nowIso(),
  });

  return state;
}

/**
 * Compatibility aliases.
 * Только auth, без messenger session управления.
 */
export const hydrateAuthSessionFromStorage =
  restoreAuthenticatedSessionFromStorage;
export const restoreAuthSessionFromStorage =
  restoreAuthenticatedSessionFromStorage;

export const persistAuthSessionToStorage =
  persistAuthenticatedSessionToStorage;
export const saveAuthenticatedSessionToStorage =
  persistAuthenticatedSessionToStorage;
export const storeAuthenticatedSessionToStorage =
  persistAuthenticatedSessionToStorage;

export const clearAuthSessionFromStorage =
  clearAuthenticatedSessionFromStorage;
export const removeAuthenticatedSessionFromStorage =
  clearAuthenticatedSessionFromStorage;
export const deleteAuthenticatedSessionFromStorage =
  clearAuthenticatedSessionFromStorage;

/**
 * Additional legacy names still used by current app screens.
 */
export const resetAuthenticatedSession =
  clearAuthenticatedSessionFromStorage;

export const applyAuthenticatedSession =
  setAuthenticatedSessionAndPersist;