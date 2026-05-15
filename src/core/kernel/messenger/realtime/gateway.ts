import {
  connectMessengerRealtime,
  disconnectMessengerRealtime,
  reconnectMessengerRealtime,
  sendMessengerRealtimeClientEvent,
  subscribeMessengerRealtimeService,
  getMessengerRealtimeDiagnosticsSnapshot,
  runMessengerRealtimeTwoDeviceCheck,
} from "./service";
import type {
  MessengerRealtimeClientEventInput,
  MessengerRealtimeDiagnosticsSnapshot,
  MessengerRealtimeServiceEvent,
  MessengerRealtimeServiceListener,
  MessengerRealtimeTwoDeviceCheckInput,
  MessengerRealtimeTwoDeviceCheckResult,
} from "./types";

export type MessengerRealtimeGatewayConfig = {
  autoConnect?: boolean;
};

export type MessengerRealtimeGateway = {
  connect(): Promise<void>;
  disconnect(): void;
  reconnect(): Promise<void>;
  send(event: string | MessengerRealtimeClientEventInput, payload?: Record<string, unknown> | null): boolean;
  on(listener: MessengerRealtimeServiceListener): () => void;
  diagnostics(): MessengerRealtimeDiagnosticsSnapshot;
  runTwoDeviceCheck(input?: MessengerRealtimeTwoDeviceCheckInput): MessengerRealtimeTwoDeviceCheckResult;
};

function normalizeClientEvent(
  event: string | MessengerRealtimeClientEventInput,
  payload?: Record<string, unknown> | null,
): MessengerRealtimeClientEventInput {
  if (typeof event === "string") {
    return { eventName: event, payload: payload ?? {} };
  }

  return event;
}

export function createMessengerRealtimeGateway(
  _config: MessengerRealtimeGatewayConfig = {},
): MessengerRealtimeGateway {
  return {
    connect: connectMessengerRealtime,
    disconnect: disconnectMessengerRealtime,
    reconnect: reconnectMessengerRealtime,
    send(event, payload) {
      return sendMessengerRealtimeClientEvent(normalizeClientEvent(event, payload));
    },
    on(listener) {
      return subscribeMessengerRealtimeService(listener);
    },
    diagnostics() {
      return getMessengerRealtimeDiagnosticsSnapshot();
    },
    runTwoDeviceCheck(input) {
      return runMessengerRealtimeTwoDeviceCheck(input);
    },
  };
}

export {
  connectMessengerRealtime,
  disconnectMessengerRealtime,
  reconnectMessengerRealtime,
  sendMessengerRealtimeClientEvent,
  subscribeMessengerRealtimeService,
  getMessengerRealtimeDiagnosticsSnapshot,
  runMessengerRealtimeTwoDeviceCheck,
};

export type {
  MessengerRealtimeClientEventInput,
  MessengerRealtimeDiagnosticsSnapshot,
  MessengerRealtimeServiceEvent,
  MessengerRealtimeServiceListener,
  MessengerRealtimeTwoDeviceCheckInput,
  MessengerRealtimeTwoDeviceCheckResult,
};
