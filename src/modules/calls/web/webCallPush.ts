export type SabiWebPushPayload = Record<string, unknown>;

type Handler = (
  payload: SabiWebPushPayload,
  action: "incoming" | "open" | "accept" | "decline" | "foreground" | "notification_open",
) => void;

let registered = false;
const handlers = new Set<Handler>();

export async function registerSabiWebCallServiceWorker(path = "/sabi-call-service-worker.js") {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  if (registered) return navigator.serviceWorker.ready;
  registered = true;
  await navigator.serviceWorker.register(path);
  navigator.serviceWorker.addEventListener("message", (event) => {
    const type = String(event.data?.type || "");
    const payload = (event.data?.payload || {}) as SabiWebPushPayload;
    if (type === "sabi_call_incoming") handlers.forEach((handler) => handler(payload, "incoming"));
    if (type === "sabi_call_open") handlers.forEach((handler) => handler(payload, event.data?.action === "accept" ? "accept" : "open"));
    if (type === "sabi_call_decline") handlers.forEach((handler) => handler(payload, "decline"));
    if (type === "sabi_notification_foreground") handlers.forEach((handler) => handler(payload, "foreground"));
    if (type === "sabi_notification_open") handlers.forEach((handler) => handler(payload, "notification_open"));
  });
  return navigator.serviceWorker.ready;
}

export function subscribeSabiWebCallPush(handler: Handler) {
  handlers.add(handler);
  return () => handlers.delete(handler);
}
