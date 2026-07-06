export type Stream109HViewerSessionReconnectPlan = {
  readonly version: "STREAM-109H";
  readonly title: string;
  readonly scope: readonly string[];
  readonly realLocalActions: readonly string[];
  readonly integrationContracts: readonly string[];
  readonly forbidden: readonly string[];
  readonly nextStep: "STREAM-109I";
};

export const stream109hViewerSessionReconnectPlan: Stream109HViewerSessionReconnectPlan = {
  version: "STREAM-109H",
  title: "Viewer/session stability + reconnect local contract",
  scope: [
    "Stream mobile room runtime only",
    "Viewer session records for host/viewer/co-host/moderator participants",
    "Local heartbeat, background, reconnect, reconnected, and disconnected state",
    "Realtime event queue union through typed local viewer session events",
  ],
  realLocalActions: [
    "sync viewer sessions from the active local room participants",
    "select the active viewer/co-host session",
    "mark local heartbeat",
    "mark backgrounded local state",
    "mark heartbeat missing local state",
    "request local reconnect attempt",
    "mark reconnected locally after local heartbeat returns",
    "mark disconnected locally",
    "queue typed viewer session events into the local realtime event queue",
    "request provider session sync as blocked until real backend/provider/Admin contracts exist",
  ],
  integrationContracts: [
    "backend viewer session contract required",
    "realtime session provider required",
    "durable viewer session store required",
    "Admin audit sink required",
  ],
  forbidden: [
    "no fake reconnect success",
    "no fake viewer count",
    "no fake provider session",
    "no fake realtime provider ACK",
    "no fake on-air",
    "no payments, gifts, Wallet, monetization, server/foundation changes",
  ],
  nextStep: "STREAM-109I",
};
