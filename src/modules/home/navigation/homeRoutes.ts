import { router } from "expo-router";

type HomeRouteParams = Record<string, string | number | boolean | null | undefined>;

function cleanParams(params?: HomeRouteParams) {
  if (!params) return undefined;

  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    result[key] = String(value);
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Home is mounted through the root gate `/`.
 * Do not navigate to `/home`: expo-router does not have a stable route named `home`
 * in the current app tree, and direct navigation causes PUSH/REPLACE warnings.
 */
export function openSabiHome(params?: HomeRouteParams) {
  const normalizedParams = cleanParams(params);

  requestAnimationFrame(() => {
    try {
      const dismissAll = (router as unknown as { dismissAll?: () => void }).dismissAll;
      if (typeof dismissAll === "function") {
        dismissAll();
      }
    } catch {
      // Navigation stack may not be ready during first bootstrap. Root replace below is enough.
    }

    router.replace({
      pathname: "/",
      params: normalizedParams,
    });
  });
}

export function normalizeHomeRoute(path?: string | null) {
  const value = String(path || "").trim();
  if (!value || value === "/home" || value === "home") return "/";
  return value.startsWith("/") ? value : `/${value}`;
}

// Backward-compatible alias for HOME-100.2/HOME-100.3 imports.
export const normalizeSabiHomeRoute = normalizeHomeRoute;
