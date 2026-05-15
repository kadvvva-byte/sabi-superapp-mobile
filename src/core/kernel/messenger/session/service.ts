import { MessengerKernelError } from "../core/errors";
import type {
  MessengerKernelFetch,
  MessengerKernelResolvedSessionSnapshot,
  MessengerKernelSessionConfig,
  MessengerKernelSessionSnapshot,
} from "./types";

let runtimeConfig: MessengerKernelSessionConfig | null = null;
let cachedSessionSnapshot: MessengerKernelResolvedSessionSnapshot | null = null;

function resolveFetchImplementation(
  customFetch?: MessengerKernelFetch,
): MessengerKernelFetch {
  if (customFetch) {
    return customFetch;
  }

  if (typeof fetch === "function") {
    return fetch.bind(globalThis) as MessengerKernelFetch;
  }

  throw new MessengerKernelError({
    code: "MESSENGER_KERNEL_NOT_CONFIGURED",
    message: "Messenger kernel fetch implementation is missing",
  });
}

function normalizeRequiredString(
  value: string | null | undefined,
  fieldName: "apiBaseUrl" | "currentUserId" | "accessToken",
): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new MessengerKernelError({
      code: "MESSENGER_KERNEL_NOT_CONFIGURED",
      message: `Messenger kernel session returned empty ${fieldName}`,
    });
  }

  return normalized;
}

function normalizeRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeHeaders(value: unknown): Record<string, string> | null {
  const record = normalizeRecord(value);
  if (!record) return null;

  return Object.fromEntries(
    Object.entries(record).map(([key, entry]) => [key, String(entry)]),
  );
}

function normalizeSessionSnapshot(
  snapshot: MessengerKernelSessionSnapshot | null | undefined,
): MessengerKernelResolvedSessionSnapshot {
  const apiBaseUrl = normalizeRequiredString(snapshot?.apiBaseUrl, "apiBaseUrl");
  const currentUserId = normalizeRequiredString(
    snapshot?.currentUserId,
    "currentUserId",
  );
  const accessToken = normalizeRequiredString(snapshot?.accessToken, "accessToken");

  const socketUrl =
    typeof snapshot?.socketUrl === "string" && snapshot.socketUrl.trim()
      ? snapshot.socketUrl.trim().replace(/\/+$/, "")
      : runtimeConfig?.socketUrl ?? apiBaseUrl;

  const socketPath =
    typeof snapshot?.socketPath === "string" && snapshot.socketPath.trim()
      ? snapshot.socketPath.trim()
      : runtimeConfig?.socketPath ?? "/socket.io";

  return {
    ...snapshot,
    apiBaseUrl: apiBaseUrl.replace(/\/+$/, ""),
    accessToken,
    currentUserId,
    socketUrl,
    socketPath,
    authScheme: snapshot?.authScheme ?? runtimeConfig?.authScheme ?? "Bearer",
    query: normalizeRecord(snapshot?.query) ?? runtimeConfig?.query ?? null,
    headers: normalizeHeaders(snapshot?.headers) ?? runtimeConfig?.headers ?? null,
  };
}

export function configureMessengerKernelSession(
  config: MessengerKernelSessionConfig,
) {
  runtimeConfig = config;
  cachedSessionSnapshot = null;
}

export function resetMessengerKernelSession() {
  runtimeConfig = null;
  cachedSessionSnapshot = null;
}

export function assertMessengerKernelSessionConfigured(): MessengerKernelSessionConfig {
  if (!runtimeConfig) {
    throw new MessengerKernelError({
      code: "MESSENGER_KERNEL_NOT_CONFIGURED",
      message: "Messenger kernel session is not configured",
    });
  }

  return runtimeConfig;
}

export function getMessengerKernelSession(): MessengerKernelResolvedSessionSnapshot {
  if (cachedSessionSnapshot) {
    return cachedSessionSnapshot;
  }

  throw new MessengerKernelError({
    code: "MESSENGER_KERNEL_NOT_CONFIGURED",
    message: "Messenger kernel session is not resolved yet",
  });
}

export async function resolveMessengerKernelSession(): Promise<MessengerKernelResolvedSessionSnapshot> {
  const config = assertMessengerKernelSessionConfigured();
  const snapshot = await config.resolveSession();
  const normalized = normalizeSessionSnapshot(snapshot);
  cachedSessionSnapshot = normalized;

  return normalized;
}

export async function getMessengerKernelSessionSnapshot(): Promise<MessengerKernelResolvedSessionSnapshot> {
  return resolveMessengerKernelSession();
}

export async function requireMessengerKernelSessionSnapshot(): Promise<MessengerKernelResolvedSessionSnapshot> {
  return resolveMessengerKernelSession();
}

export function getMessengerKernelFetch(): MessengerKernelFetch {
  const config = assertMessengerKernelSessionConfigured();
  return resolveFetchImplementation(config.fetchImpl);
}
