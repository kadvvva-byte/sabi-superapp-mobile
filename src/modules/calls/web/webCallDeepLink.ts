export function buildSabiWebCallUrl(payload: Record<string, unknown>, action: "open" | "accept" | "decline" = "open") {
  const kindText = [payload.kind, payload.callType, payload.type].map((value) => String(value || "")).join(" ").toLowerCase();
  const kind = kindText.includes("video") ? "video" : "audio";
  const params = new URLSearchParams({
    callId: String(payload.callId || payload.id || Date.now()),
    kind,
    incoming: action === "decline" ? "0" : "1",
    incomingCall: action === "decline" ? "0" : "1",
    autoAccept: action === "accept" ? "1" : "0",
    notificationAction: action,
    action: action === "accept" ? "accept" : action === "decline" ? "decline" : "incoming",
    fromUserId: String(payload.fromUserId || payload.callerId || payload.peerId || ""),
    toUserId: String(payload.toUserId || payload.targetUserId || payload.receiverUserId || ""),
    callerName: String(payload.callerName || payload.fromName || payload.name || "Sabi"),
  });
  return `/calls/${kind}?${params.toString()}`;
}
