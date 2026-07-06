/* eslint-disable import/export */
export * from "./facade";
export * from "./core";

export {
  assertMessengerKernelSessionConfigured,
  configureMessengerKernelSession,
  getMessengerKernelFetch,
  getMessengerKernelSession,
  getMessengerKernelSessionSnapshot,
  requireMessengerKernelSessionSnapshot,
  resetMessengerKernelSession,
  resolveMessengerKernelSession,
} from "./session/service";

export type {
  MessengerKernelFetch,
  MessengerKernelResolvedSessionSnapshot,
  MessengerKernelSessionConfig,
  MessengerKernelSessionResolver,
  MessengerKernelSessionSnapshot,
} from "./session/types";

export * from "./realtime/service";
export type {
  MessengerRealtimeClientEventInput,
  MessengerRealtimeConnectionSnapshot,
  MessengerRealtimeDiagnosticsSnapshot,
  MessengerRealtimeGatewayConfig,
  MessengerRealtimeGatewayEvent,
  MessengerRealtimeGatewayListener,
  MessengerRealtimeGatewayState,
  MessengerRealtimeGatewayStatus,
  MessengerRealtimeIncomingEvent,
  MessengerRealtimeJournalEntry,
  MessengerRealtimeMessageAckPayload,
  MessengerRealtimeMessagePayload,
  MessengerRealtimeServiceEvent,
  MessengerRealtimeServiceListener,
  MessengerRealtimeSocketConfig,
  MessengerRealtimeTransportPayload,
  MessengerRealtimeTwoDeviceCheckInput,
  MessengerRealtimeTwoDeviceCheckResult,
  MessengerRealtimeTypingPayload,
} from "./realtime/types";
export type {
  MessengerKernelPresenceEntry,
  MessengerKernelTypingEntry,
  MessengerRealtimeStatus,
} from "./core/types";
