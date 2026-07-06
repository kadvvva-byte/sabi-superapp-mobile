import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

export type SabiApiBaseUrlOptions = {
  defaultPort?: string | number | null;
  rejectLoopback?: boolean;
};

const DEFAULT_API_PORT = "4001";
const SABI_DEFAULT_LAN_API_BASE_URL = "";
const SABI_PRODUCTION_API_BASE_URL = "https://sabi-superapp-api-7srquvexva-ew.a.run.app";
const KNOWN_INVALID_NATIVE_BUNDLE_HOSTS = new Set([
  "index.android.bundle",
  "assets.android.bundle",
  "main.jsbundle",
]);
const KNOWN_DEV_PACKAGER_PORTS = new Set(["8081", "8082", "19000", "19001", "19002", "19006"]);
const KNOWN_OLD_API_PORTS = new Set(["3000", "4000", "5000"]);

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizePort(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    const port = Math.floor(value);
    return port > 0 ? String(port) : null;
  }

  const raw = normalizeString(value);
  if (!raw) return null;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;

  const port = Math.floor(parsed);
  return port > 0 ? String(port) : null;
}

function defaultApiPort(options?: SabiApiBaseUrlOptions): string {
  return normalizePort(options?.defaultPort) ?? normalizePort(process.env.EXPO_PUBLIC_API_PORT) ?? DEFAULT_API_PORT;
}

function isLoopbackHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "[::1]" ||
    host === "0.0.0.0" ||
    isInvalidNativeBundleHost(host)
  );
}

function isInvalidNativeBundleHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  return KNOWN_INVALID_NATIVE_BUNDLE_HOSTS.has(host);
}

function isLanHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  return (
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
    host.endsWith(".local")
  );
}

function isLanOrDevHost(hostname: string): boolean {
  return isLoopbackHost(hostname) || isLanHost(hostname);
}

function readConstantsRecord(): Record<string, unknown> {
  return (Constants ?? {}) as unknown as Record<string, unknown>;
}

function readNestedString(source: unknown, path: string[]): string | null {
  let current: unknown = source;

  for (const key of path) {
    if (!current || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[key];
  }

  return normalizeString(current);
}

function readNativeScriptUrl(): string | null {
  const sourceCode = (NativeModules as Record<string, unknown>)?.SourceCode as
    | { scriptURL?: unknown; getConstants?: () => { scriptURL?: unknown } }
    | undefined;

  return normalizeString(sourceCode?.scriptURL) ?? normalizeString(sourceCode?.getConstants?.()?.scriptURL);
}

function hostFromHostUri(value: unknown): string | null {
  const raw = normalizeString(value);
  if (!raw) return null;

  const candidate = raw.includes("://") ? raw : `http://${raw}`;

  try {
    const parsed = new URL(candidate);
    return normalizeString(parsed.hostname);
  } catch {
    const withoutProtocol = raw.replace(/^[a-z]+:\/\//i, "");
    const withoutPath = withoutProtocol.split("/")[0] ?? "";
    const withoutAuth = withoutPath.includes("@") ? withoutPath.split("@").pop() ?? "" : withoutPath;
    const host = withoutAuth.startsWith("[")
      ? withoutAuth.slice(1, Math.max(1, withoutAuth.indexOf("]")))
      : withoutAuth.split(":")[0];

    return normalizeString(host);
  }
}

function getExpoDevHost(): string | null {
  const constants = readConstantsRecord();
  const candidates = [
    readNativeScriptUrl(),
    readNestedString(constants, ["expoConfig", "hostUri"]),
    readNestedString(constants, ["manifest", "debuggerHost"]),
    readNestedString(constants, ["manifest", "hostUri"]),
    readNestedString(constants, ["manifest", "bundleUrl"]),
    readNestedString(constants, ["manifest2", "extra", "expoClient", "hostUri"]),
    readNestedString(constants, ["manifest2", "extra", "expoGo", "debuggerHost"]),
    readNestedString(constants, ["expoGoConfig", "debuggerHost"]),
    normalizeString(process.env.EXPO_PUBLIC_PACKAGER_HOST),
  ];

  for (const candidate of candidates) {
    const host = hostFromHostUri(candidate);
    if (host && !isLoopbackHost(host) && !isInvalidNativeBundleHost(host)) return host;
  }

  return null;
}

function explicitEnvApiBaseUrl(): string | null {
  return (
    normalizeString(process.env.EXPO_PUBLIC_API_BASE_URL) ??
    normalizeString(process.env.EXPO_PUBLIC_AUTH_API_BASE_URL) ??
    normalizeString(process.env.EXPO_PUBLIC_QR_API_BASE_URL) ??
    normalizeString(process.env.EXPO_PUBLIC_SOCKET_BASE_URL)
  );
}

function explicitExpoExtraApiBaseUrl(): string | null {
  const constants = readConstantsRecord();
  return (
    readNestedString(constants, ["expoConfig", "extra", "apiBaseUrl"]) ??
    readNestedString(constants, ["expoConfig", "extra", "authApiBaseUrl"]) ??
    readNestedString(constants, ["expoConfig", "extra", "qrApiBaseUrl"]) ??
    readNestedString(constants, ["expoConfig", "extra", "socketBaseUrl"]) ??
    readNestedString(constants, ["manifest", "extra", "apiBaseUrl"]) ??
    readNestedString(constants, ["manifest", "extra", "authApiBaseUrl"]) ??
    readNestedString(constants, ["manifest", "extra", "qrApiBaseUrl"]) ??
    readNestedString(constants, ["manifest", "extra", "socketBaseUrl"])
  );
}

function explicitAndroidEmulatorApiBaseUrl(): string | null {
  return normalizeString(process.env.EXPO_PUBLIC_ANDROID_EMULATOR_API_BASE_URL);
}

function shouldRejectLoopback(options?: SabiApiBaseUrlOptions): boolean {
  if (Platform.OS === "web") return false;
  if (process.env.EXPO_PUBLIC_ALLOW_NATIVE_LOOPBACK === "1") return false;
  return options?.rejectLoopback !== false;
}

function replacementHostForLoopback(): string | null {
  const expoHost = getExpoDevHost();
  if (expoHost) return expoHost;
  return null;
}

function normalizeUrlCandidate(value: string, options?: SabiApiBaseUrlOptions): string | null {
  const port = defaultApiPort(options);

  try {
    const parsed = new URL(value.includes("://") ? value : `http://${value}`);
    const hostname = normalizeString(parsed.hostname);
    if (!hostname) return null;

    if (isInvalidNativeBundleHost(hostname)) return null;

    const loopbackReplacement = isLoopbackHost(hostname) ? replacementHostForLoopback() : null;
    const nextHostname = loopbackReplacement ?? hostname;

    if (isLoopbackHost(nextHostname) && shouldRejectLoopback(options)) {
      return null;
    }

    const parsedPort = normalizePort(parsed.port) ?? "";
    const devLikeHost = isLanOrDevHost(nextHostname);
    const shouldUseDefaultPort =
      devLikeHost && (!parsedPort || KNOWN_DEV_PACKAGER_PORTS.has(parsedPort) || KNOWN_OLD_API_PORTS.has(parsedPort));
    const nextPort = shouldUseDefaultPort ? port : parsedPort;
    const pathname = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname.replace(/\/+$/, "") : "";

    return `${parsed.protocol}//${nextHostname}${nextPort ? `:${nextPort}` : ""}${pathname}`.replace(/\/+$/, "");
  } catch {
    const host = hostFromHostUri(value);
    if (!host) return null;

    if (isInvalidNativeBundleHost(host)) return null;

    const loopbackReplacement = isLoopbackHost(host) ? replacementHostForLoopback() : null;
    const nextHost = loopbackReplacement ?? host;

    if (isLoopbackHost(nextHost) && shouldRejectLoopback(options)) {
      return null;
    }

    return `http://${nextHost}:${port}`;
  }
}

function pushUnique(target: string[], value: unknown, options?: SabiApiBaseUrlOptions) {
  const raw = normalizeString(value);
  if (!raw) return;

  const normalized = normalizeUrlCandidate(raw, options);
  if (normalized && !target.includes(normalized)) {
    target.push(normalized);
  }
}

export function getSabiApiBaseUrlDebugCandidates(value?: unknown, options?: SabiApiBaseUrlOptions): string[] {
  const port = defaultApiPort(options);
  const candidates: string[] = [];

  const expoDevHost = getExpoDevHost();

  pushUnique(candidates, value, options);
  pushUnique(candidates, explicitEnvApiBaseUrl(), options);
  pushUnique(candidates, expoDevHost ? `http://${expoDevHost}:${port}` : null, options);
  pushUnique(candidates, explicitExpoExtraApiBaseUrl(), options);
  pushUnique(candidates, explicitAndroidEmulatorApiBaseUrl(), options);
  pushUnique(candidates, SABI_DEFAULT_LAN_API_BASE_URL, options);

  if (Platform.OS !== "web") {
    pushUnique(candidates, SABI_PRODUCTION_API_BASE_URL, options);
  }

  if (Platform.OS === "web") {
    pushUnique(candidates, `http://localhost:${port}`, { ...options, rejectLoopback: false });
  }

  return candidates;
}

export function resolveSabiApiBaseUrl(value?: unknown, options?: SabiApiBaseUrlOptions): string | null {
  return getSabiApiBaseUrlDebugCandidates(value, options)[0] ?? null;
}

export function requireSabiApiBaseUrl(value?: unknown, options?: SabiApiBaseUrlOptions): string {
  const resolved = resolveSabiApiBaseUrl(value, options);
  if (!resolved) {
    throw new Error("Sabi API base URL is unavailable. Set EXPO_PUBLIC_API_BASE_URL or app.json extra.apiBaseUrl to your backend URL.");
  }

  return resolved;
}

