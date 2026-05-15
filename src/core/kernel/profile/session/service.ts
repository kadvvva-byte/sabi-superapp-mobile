import type {
  ProfileKernelSessionConfig,
  ProfileKernelSessionSnapshot,
} from "./types";

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeRecord(value: unknown) {
  if (!value || typeof value !== "object") return {} as Record<string, string>;

  const entries = Object.entries(value as Record<string, unknown>)
    .map(([key, rawValue]) => [key, normalizeString(rawValue)])
    .filter((entry): entry is [string, string] => Boolean(entry[0] && entry[1]));

  return Object.fromEntries(entries);
}

function normalizeSnapshot(
  value?: Partial<ProfileKernelSessionSnapshot> | null,
): ProfileKernelSessionSnapshot {
  return {
    apiBaseUrl: normalizeString(value?.apiBaseUrl),
    accessToken: normalizeString(value?.accessToken),
    currentUserId: normalizeString(value?.currentUserId),
    phone: normalizeString(value?.phone),
    email: normalizeString(value?.email),
    locale: normalizeString(value?.locale),
    timezone: normalizeString(value?.timezone),
    headers: normalizeRecord(value?.headers),
    query: normalizeRecord(value?.query),
  };
}

let sessionConfig: ProfileKernelSessionConfig | null = null;

export function configureProfileKernelSession(config: ProfileKernelSessionConfig) {
  sessionConfig = {
    ...config,
    headers: normalizeRecord(config.headers),
    query: normalizeRecord(config.query),
  };
}

export function resetProfileKernelSession() {
  sessionConfig = null;
}

export async function resolveProfileKernelSession(): Promise<ProfileKernelSessionSnapshot> {
  const base = normalizeSnapshot(sessionConfig);
  const resolver = sessionConfig?.resolveSession;

  if (!resolver) {
    return base;
  }

  const resolved = normalizeSnapshot(await resolver());
  const mergeResolved = sessionConfig?.mergeResolved !== false;

  if (!mergeResolved) {
    return resolved;
  }

  return {
    apiBaseUrl: resolved.apiBaseUrl ?? base.apiBaseUrl,
    accessToken: resolved.accessToken ?? base.accessToken,
    currentUserId: resolved.currentUserId ?? base.currentUserId,
    phone: resolved.phone ?? base.phone,
    email: resolved.email ?? base.email,
    locale: resolved.locale ?? base.locale,
    timezone: resolved.timezone ?? base.timezone,
    headers: {
      ...base.headers,
      ...resolved.headers,
    },
    query: {
      ...base.query,
      ...resolved.query,
    },
  };
}
