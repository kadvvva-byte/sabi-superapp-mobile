import {
  getSabiApiBaseUrlDebugCandidates,
  requireSabiApiBaseUrl,
  resolveSabiApiBaseUrl as resolveNetworkSabiApiBaseUrl,
} from "../network/sabiApiBaseUrl";

const DEFAULT_API_PORT = "4001";

export function getExpoHostApiBaseUrl(port = DEFAULT_API_PORT): string | null {
  return resolveNetworkSabiApiBaseUrl(undefined, { defaultPort: port });
}

export function getSabiApiBaseUrlCandidates(
  sessionBaseUrl?: string | null,
  options?: { port?: string | number | null },
): string[] {
  return getSabiApiBaseUrlDebugCandidates(sessionBaseUrl, {
    defaultPort: options?.port ?? DEFAULT_API_PORT,
  });
}

export function resolveSabiApiBaseUrl(
  sessionBaseUrl?: string | null,
  options?: { port?: string | number | null },
): string {
  return requireSabiApiBaseUrl(sessionBaseUrl, {
    defaultPort: options?.port ?? DEFAULT_API_PORT,
  });
}
