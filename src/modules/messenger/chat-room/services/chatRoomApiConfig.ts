import { resolveSabiApiBaseUrl } from "../../../../shared/api/apiBaseUrl";

function trimSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getChatApiBaseUrl() {
  return trimSlash(resolveSabiApiBaseUrl(undefined, { port: "4001" }));
}

export function buildChatApiUrl(path: string) {
  const base = getChatApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
