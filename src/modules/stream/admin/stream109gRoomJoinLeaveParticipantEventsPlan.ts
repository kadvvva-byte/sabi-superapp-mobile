export type Stream109GRoomJoinLeaveParticipantEventsPlan = {
  readonly version: "STREAM-109G";
  readonly title: string;
  readonly scope: readonly string[];
  readonly realLocalActions: readonly string[];
  readonly integrationContracts: readonly string[];
  readonly forbidden: readonly string[];
  readonly nextStep: "STREAM-109H";
};

export const stream109gRoomJoinLeaveParticipantEventsPlan: Stream109GRoomJoinLeaveParticipantEventsPlan = {
  version: "STREAM-109G",
  title: "Room join/leave participant event hardening",
  scope: [
    "Stream mobile room runtime only",
    "Participant presence records for host/viewer/co-host/moderator",
    "Local join/leave/rejoin/kick evidence",
    "Realtime event queue union through local participant events",
  ],
  realLocalActions: [
    "sync participant presence records from the active local room",
    "mark selected participant present locally",
    "mark selected participant left locally",
    "mark selected participant rejoined locally",
    "mark selected participant kicked locally",
    "queue typed participant presence events into the local realtime event queue",
    "request provider sync as blocked until real backend/provider/Admin contracts exist",
  ],
  integrationContracts: [
    "backend presence contract required",
    "realtime presence provider required",
    "durable presence store required",
    "Admin audit sink required",
  ],
  forbidden: [
    "no fake participant presence",
    "no fake join delivery",
    "no fake leave delivery",
    "no fake realtime provider ACK",
    "no fake on-air",
    "no payments, gifts, Wallet, monetization, server/foundation changes",
  ],
  nextStep: "STREAM-109H",
};
