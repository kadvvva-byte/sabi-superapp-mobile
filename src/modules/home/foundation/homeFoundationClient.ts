import { resolveSabiApiBaseUrl } from "../../../shared/api/apiBaseUrl";
import { buildLocalSabiHomeFoundationManifest } from "./homeFoundationRegistry";
import type { SabiHomeFoundationManifest, SabiHomeFoundationState } from "./homeFoundation.types";

function getApiBaseUrl() {
  return resolveSabiApiBaseUrl(undefined, { port: "4001" }).replace(/\/+$/, "");
}

function isManifest(value: unknown): value is SabiHomeFoundationManifest {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { ok?: unknown }).ok === true &&
    ["HOME-100.17"].includes(String((value as { version?: unknown }).version)) &&
    Array.isArray((value as { widgets?: unknown }).widgets)
  );
}

export async function fetchSabiHomeFoundationManifest(): Promise<SabiHomeFoundationState> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v2/programs/home/foundation`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`home_foundation_http_${response.status}`);
    }

    const payload: unknown = await response.json();

    if (!isManifest(payload)) {
      throw new Error("home_foundation_invalid_payload");
    }

    return { manifest: payload, source: "backend" };
  } catch {
    return {
      manifest: buildLocalSabiHomeFoundationManifest(),
      source: "local_fallback",
    };
  }
}
