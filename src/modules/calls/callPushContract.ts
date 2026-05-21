export type SabiIncomingCallPushPayload = {
  sabiType: "incoming_call";
  type: "incoming_call";
  callId: string;
  kind: "audio" | "video";
  fromUserId: string;
  toUserId: string;
  callerName: string;
  callerAvatarUrl?: string;
  chatId?: string;
  roomId?: string;
  routePath: "/calls/audio" | "/calls/video";
  routeParams?: Record<string, string>;
  priority: "high";
  ttlSeconds: number;
  collapseKey: string;
};

export function buildSabiIncomingCallPushPayload(input: {
  callId: string;
  kind: "audio" | "video";
  fromUserId: string;
  toUserId: string;
  callerName: string;
  callerAvatarUrl?: string;
  chatId?: string;
  roomId?: string;
  routeParams?: Record<string, string>;
}): SabiIncomingCallPushPayload {
  const routePath = input.kind === "video" ? "/calls/video" : "/calls/audio";
  return {
    sabiType: "incoming_call",
    type: "incoming_call",
    callId: input.callId,
    kind: input.kind,
    fromUserId: input.fromUserId,
    toUserId: input.toUserId,
    callerName: input.callerName,
    callerAvatarUrl: input.callerAvatarUrl,
    chatId: input.chatId,
    roomId: input.roomId || input.chatId,
    routePath,
    routeParams: input.routeParams,
    priority: "high",
    ttlSeconds: 30,
    collapseKey: `sabi-call:${input.callId}`,
  };
}
