import { getAuthSessionState } from "../../core/kernel/auth/session.store";
import { getSabiApiBaseUrlCandidates } from "../../shared/api/apiBaseUrl";

export type SabiCallIceServer = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

const SABI_CALL_STUN_FALLBACK: SabiCallIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
];

const ICE_CONFIG_ENDPOINTS = [
  "/api/v2/calls/ice-servers",
  "/api/calls/ice-servers",
  "/api/v2/webrtc/ice-servers",
];

let cachedIceServers: SabiCallIceServer[] | null = null;
let cachedIceServersAt = 0;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeUrls(value: unknown): string | string[] | null {
  if (typeof value === "string") {
    const url = value.trim();
    if (url.startsWith("stun:") || url.startsWith("turn:") || url.startsWith("turns:")) return url;
    return null;
  }

  if (Array.isArray(value)) {
    const urls = value
      .map((item) => readText(item))
      .filter((url) => url.startsWith("stun:") || url.startsWith("turn:") || url.startsWith("turns:"));

    return urls.length ? urls : null;
  }

  return null;
}

function normalizeIceServer(value: unknown): SabiCallIceServer | null {
  if (!isRecord(value)) return null;

  const urls = normalizeUrls(value.urls);
  if (!urls) return null;

  const server: SabiCallIceServer = { urls };

  const username = readText(value.username);
  const credential = readText(value.credential);

  if (username) server.username = username;
  if (credential) server.credential = credential;

  return server;
}

function extractIceServers(payload: unknown): SabiCallIceServer[] {
  const root = isRecord(payload) ? payload : {};
  const data = isRecord(root.data) ? root.data : {};
  const config = isRecord(root.config) ? root.config : {};
  const rtcConfig = isRecord(root.rtcConfig) ? root.rtcConfig : {};

  const candidates = [
    root.iceServers,
    data.iceServers,
    config.iceServers,
    rtcConfig.iceServers,
  ];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;

    const servers = candidate
      .map(normalizeIceServer)
      .filter((server): server is SabiCallIceServer => Boolean(server));

    if (servers.length) return servers;
  }

  return [];
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response | null> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  try {
    const timeout = new Promise<null>((resolve) => {
      timer = setTimeout(() => resolve(null), timeoutMs);
    });

    return await Promise.race([
      fetch(url, init),
      timeout,
    ]);
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function resolveSabiCallIceServers(): Promise<SabiCallIceServer[]> {
  const now = Date.now();

  if (cachedIceServers && now - cachedIceServersAt < 60000) {
    return cachedIceServers;
  }

  const session = getAuthSessionState();
  const baseUrls = getSabiApiBaseUrlCandidates(session.apiBaseUrl);

  if (!baseUrls.length) {
    cachedIceServers = SABI_CALL_STUN_FALLBACK;
    cachedIceServersAt = now;
    return cachedIceServers;
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (session.accessToken) {
    headers.Authorization = "Bearer " + session.accessToken;
  }

  if (session.currentUserId) {
    headers["X-User-Id"] = session.currentUserId;
    headers["X-User-ID"] = session.currentUserId;
  }

  for (const baseUrl of baseUrls) {
    const normalizedBase = String(baseUrl || "").replace(/\/+$/, "");
    if (!normalizedBase) continue;

    for (const endpoint of ICE_CONFIG_ENDPOINTS) {
      const response = await fetchWithTimeout(
        normalizedBase + endpoint,
        {
          method: "GET",
          headers,
        },
        450,
      );

      if (!response || !response.ok) continue;

      try {
        const payload = await response.json();
        const servers = extractIceServers(payload);

        if (servers.length) {
          cachedIceServers = servers;
          cachedIceServersAt = now;
          return servers;
        }
      } catch {}
    }
  }

  cachedIceServers = SABI_CALL_STUN_FALLBACK;
  cachedIceServersAt = now;
  return cachedIceServers;
}

export function summarizeSabiCallIceServersForDebug(servers: SabiCallIceServer[]): string {
  return servers
    .flatMap((server) => Array.isArray(server.urls) ? server.urls : [server.urls])
    .map((url) => {
      if (url.startsWith("turns:")) return "turns";
      if (url.startsWith("turn:")) return "turn";
      if (url.startsWith("stun:")) return "stun";
      return "unknown";
    })
    .join(",");
}
