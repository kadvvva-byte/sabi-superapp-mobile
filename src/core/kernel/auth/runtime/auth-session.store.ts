import { resolveSabiApiBaseUrl } from "../../../../shared/network/sabiApiBaseUrl";

export type AuthSessionStatus =
  | "idle"
  | "restoring"
  | "authenticated"
  | "anonymous"
  | "error";

export type AuthSessionState = {
  status: AuthSessionStatus;
  isReady: boolean;
  isHydrated: boolean;
  isHydrating: boolean;
  apiBaseUrl: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  currentUserId: string | null;
  phoneNumber: string | null;
  error: string | null;
  restoredAt: string | null;
  updatedAt: string;
};

export type AuthSessionStoreListener = (state: AuthSessionState) => void;

type ClearAuthenticatedSessionOptions = {
  markHydrated?: boolean;
  error?: string | null;
};

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeApiBaseUrl(value: string | null | undefined): string | null {
  return resolveSabiApiBaseUrl(value);
}

function normalizeNullableString(
  value: string | null | undefined,
): string | null {
  if (typeof value !== "string") {
    return value ?? null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function createInitialAuthSessionState(): AuthSessionState {
  return {
    status: "idle",
    isReady: false,
    isHydrated: false,
    isHydrating: false,
    apiBaseUrl: null,
    accessToken: null,
    refreshToken: null,
    currentUserId: null,
    phoneNumber: null,
    error: null,
    restoredAt: null,
    updatedAt: nowIso(),
  };
}

function sanitizeAuthSessionState(state: AuthSessionState): AuthSessionState {
  const apiBaseUrl = normalizeApiBaseUrl(state.apiBaseUrl);
  const accessToken = normalizeNullableString(state.accessToken);
  const refreshToken = normalizeNullableString(state.refreshToken);
  const currentUserId = normalizeNullableString(state.currentUserId);
  const phoneNumber = normalizeNullableString(state.phoneNumber);
  const error = normalizeNullableString(state.error);

  const hasAuthenticatedPayload = Boolean(
    apiBaseUrl && accessToken && currentUserId,
  );

  let status = state.status;
  let isReady = Boolean(state.isReady);
  let isHydrated = Boolean(state.isHydrated);
  const isHydrating = Boolean(state.isHydrating);

  if (isHydrating) {
    isReady = false;
  }

  if (status === "authenticated" && !hasAuthenticatedPayload) {
    status = isHydrated ? "anonymous" : "idle";
  }

  if (!hasAuthenticatedPayload && (status === "idle" || status === "anonymous")) {
    return {
      ...state,
      status,
      isReady,
      isHydrated,
      isHydrating,
      apiBaseUrl,
      accessToken: null,
      refreshToken,
      currentUserId: null,
      phoneNumber,
      error,
      updatedAt: nowIso(),
    };
  }

  if (!hasAuthenticatedPayload && status === "error") {
    return {
      ...state,
      status,
      isReady,
      isHydrated,
      isHydrating,
      apiBaseUrl: null,
      accessToken: null,
      refreshToken: null,
      currentUserId: null,
      phoneNumber,
      error,
      updatedAt: nowIso(),
    };
  }

  return {
    ...state,
    status,
    isReady,
    isHydrated,
    isHydrating,
    apiBaseUrl,
    accessToken,
    refreshToken,
    currentUserId,
    phoneNumber,
    error,
    updatedAt: nowIso(),
  };
}

let authSessionState: AuthSessionState = createInitialAuthSessionState();
const listeners = new Set<AuthSessionStoreListener>();

function notifyAuthSessionStore() {
  for (const listener of listeners) {
    listener(authSessionState);
  }
}

function applyAuthSessionState(nextState: AuthSessionState): AuthSessionState {
  authSessionState = sanitizeAuthSessionState(nextState);
  notifyAuthSessionStore();
  return authSessionState;
}

export function getAuthSessionState(): AuthSessionState {
  return authSessionState;
}

export function setAuthSessionState(nextState: AuthSessionState): AuthSessionState {
  return applyAuthSessionState(nextState);
}

export function patchAuthSessionState(
  patch:
    | Partial<AuthSessionState>
    | ((prevState: AuthSessionState) => Partial<AuthSessionState>),
): AuthSessionState {
  const partialPatch =
    typeof patch === "function" ? patch(authSessionState) : patch;

  return applyAuthSessionState({
    ...authSessionState,
    ...partialPatch,
  });
}

export function resetAuthSessionState(): AuthSessionState {
  return applyAuthSessionState(createInitialAuthSessionState());
}

export function subscribeAuthSessionState(
  listener: AuthSessionStoreListener,
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function isAuthSessionReady(): boolean {
  return authSessionState.isReady;
}

export function isAuthenticatedSessionReady(): boolean {
  return (
    authSessionState.isReady &&
    authSessionState.isHydrated &&
    !authSessionState.isHydrating &&
    authSessionState.status === "authenticated" &&
    Boolean(
      authSessionState.apiBaseUrl &&
        authSessionState.accessToken &&
        authSessionState.currentUserId,
    )
  );
}

export function getAuthenticatedAuthSession():
  | {
      apiBaseUrl: string;
      accessToken: string;
      refreshToken: string | null;
      currentUserId: string;
      phoneNumber: string | null;
    }
  | null {
  if (!isAuthenticatedSessionReady()) {
    return null;
  }

  return {
    apiBaseUrl: authSessionState.apiBaseUrl as string,
    accessToken: authSessionState.accessToken as string,
    refreshToken: authSessionState.refreshToken,
    currentUserId: authSessionState.currentUserId as string,
    phoneNumber: authSessionState.phoneNumber,
  };
}

export function markAuthSessionRestoring(): AuthSessionState {
  return patchAuthSessionState({
    status: "restoring",
    isReady: false,
    isHydrated: false,
    isHydrating: true,
    error: null,
  });
}

export function markAuthSessionHydrated(): AuthSessionState {
  return patchAuthSessionState((prev) => ({
    isHydrated: true,
    isHydrating: false,
    isReady: prev.status !== "restoring",
    status:
      prev.status === "restoring"
        ? prev.apiBaseUrl && prev.accessToken && prev.currentUserId
          ? "authenticated"
          : "anonymous"
        : prev.status,
  }));
}

export function markAuthenticatedAuthSession(payload: {
  apiBaseUrl: string;
  accessToken: string;
  refreshToken?: string | null;
  currentUserId: string;
  phoneNumber?: string | null;
  restoredAt?: string | null;
}): AuthSessionState {
  const restoredAt = normalizeNullableString(payload.restoredAt) ?? nowIso();

  return setAuthSessionState({
    status: "authenticated",
    isReady: true,
    isHydrated: true,
    isHydrating: false,
    apiBaseUrl: payload.apiBaseUrl,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken ?? null,
    currentUserId: payload.currentUserId,
    phoneNumber: payload.phoneNumber ?? null,
    error: null,
    restoredAt,
    updatedAt: nowIso(),
  });
}

export function markAnonymousAuthSession(
  next?: Partial<Pick<AuthSessionState, "error" | "restoredAt">>,
): AuthSessionState {
  return setAuthSessionState({
    status: "anonymous",
    isReady: true,
    isHydrated: true,
    isHydrating: false,
    apiBaseUrl: null,
    accessToken: null,
    refreshToken: null,
    currentUserId: null,
    phoneNumber: null,
    error: next?.error ?? null,
    restoredAt: next?.restoredAt ?? nowIso(),
    updatedAt: nowIso(),
  });
}

export function markErroredAuthSession(error: string): AuthSessionState {
  return setAuthSessionState({
    ...authSessionState,
    status: "error",
    isReady: true,
    isHydrated: true,
    isHydrating: false,
    apiBaseUrl: null,
    accessToken: null,
    refreshToken: null,
    currentUserId: null,
    error,
    updatedAt: nowIso(),
  });
}

/**
 * Auth-only compatibility exports.
 * Здесь нет никакого messenger session управления.
 */

export function setAuthSessionHydrating(
  isHydrating: boolean = true,
): AuthSessionState {
  if (isHydrating) {
    return patchAuthSessionState({
      status: "restoring",
      isReady: false,
      isHydrating: true,
      isHydrated: false,
      error: null,
    });
  }

  return markAuthSessionHydrated();
}

export function setAuthenticatedAuthSession(payload: {
  apiBaseUrl: string;
  accessToken: string;
  refreshToken?: string | null;
  currentUserId: string;
  phoneNumber?: string | null;
  restoredAt?: string | null;
}): AuthSessionState {
  return markAuthenticatedAuthSession(payload);
}

export function setAuthenticatedSession(payload: {
  apiBaseUrl: string;
  accessToken: string;
  refreshToken?: string | null;
  currentUserId: string;
  phoneNumber?: string | null;
  restoredAt?: string | null;
}): AuthSessionState {
  return markAuthenticatedAuthSession(payload);
}

export function setAnonymousAuthSession(
  next?: Partial<Pick<AuthSessionState, "error" | "restoredAt">>,
): AuthSessionState {
  return markAnonymousAuthSession(next);
}

export function setAnonymousSession(
  next?: Partial<Pick<AuthSessionState, "error" | "restoredAt">>,
): AuthSessionState {
  return markAnonymousAuthSession(next);
}

export function setErroredAuthSession(error: string): AuthSessionState {
  return markErroredAuthSession(error);
}

export function clearAuthSession(
  options?: ClearAuthenticatedSessionOptions,
): AuthSessionState {
  return clearAuthenticatedSession(options);
}

export function clearAuthenticatedSession(
  options?: ClearAuthenticatedSessionOptions,
): AuthSessionState {
  const nextHydrated = options?.markHydrated ?? true;

  return setAuthSessionState({
    status: "anonymous",
    isReady: nextHydrated,
    isHydrated: nextHydrated,
    isHydrating: false,
    apiBaseUrl: null,
    accessToken: null,
    refreshToken: null,
    currentUserId: null,
    phoneNumber: null,
    error: options?.error ?? null,
    restoredAt: nowIso(),
    updatedAt: nowIso(),
  });
}