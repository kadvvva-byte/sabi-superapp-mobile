import type {
  MessengerKernelMessageRecord,
  MessengerKernelPresenceEntry,
  MessengerKernelRealtimeStatus,
  MessengerKernelSessionSnapshot,
  MessengerKernelTypingEntry,
  MessengerRealtimeConnectionEvent,
  MessengerRealtimeCustomEvent,
  MessengerRealtimeIncomingEvent,
  MessengerRealtimePresenceEvent,
  MessengerRealtimeServiceEvent,
  MessengerRealtimeStatus,
  MessengerRealtimeTypingEvent,
} from "../core/types";

export type {
  MessengerKernelPresenceEntry,
  MessengerKernelTypingEntry,
  MessengerRealtimeConnectionEvent,
  MessengerRealtimeCustomEvent,
  MessengerRealtimeIncomingEvent,
  MessengerRealtimePresenceEvent,
  MessengerRealtimeServiceEvent,
  MessengerRealtimeStatus,
  MessengerRealtimeTypingEvent,
};

export type MessengerRealtimeGatewayStatus = MessengerKernelRealtimeStatus | string;

export type MessengerRealtimeMessageAckPayload = {
  chatId?: string | null;
  roomId?: string | null;
  messageId?: string | null;
  clientMessageId?: string | null;
  status?: "sent" | "delivered" | "read" | string;
  at?: string | null;
  [key: string]: any;
};

export type MessengerRealtimeTypingPayload = {
  chatId?: string | null;
  roomId?: string | null;
  userId?: string | null;
  isTyping?: boolean;
  entry?: MessengerKernelTypingEntry;
  userIds?: string[];
  at?: string | null;
  [key: string]: any;
};

export type MessengerRealtimeClientEventInput = {
  eventName: string;
  type?: string;
  payload?: unknown;
  data?: unknown;
  chatId?: string | null;
  roomId?: string | null;
  [key: string]: any;
};

export type MessengerRealtimeTransportPayload = MessengerRealtimeClientEventInput;

export type MessengerRealtimeSocketConfig = {
  socketUrl?: string | null;
  apiBaseUrl?: string | null;
  socketPath?: string | null;
  accessToken?: string | null;
  currentUserId?: string | null;
  authScheme?: string | null;
  query?: Record<string, unknown> | null;
  headers?: Record<string, string> | null;
  [key: string]: any;
};

export type MessengerRealtimeGatewayConfig = MessengerRealtimeSocketConfig;

export type MessengerRealtimeGatewayState = {
  status: MessengerRealtimeGatewayStatus;
  connected?: boolean;
  isConnected?: boolean;
  isConnecting?: boolean;
  connectedAt?: string | null;
  disconnectedAt?: string | null;
  lastMessageAt?: string | null;
  errorMessage?: string | null;
  wsUrl?: string | null;
  socketUrl?: string | null;
  currentUserId?: string | null;
  [key: string]: any;
};

export type MessengerRealtimeConnectionSnapshot = MessengerRealtimeGatewayState & {
  session?: MessengerKernelSessionSnapshot | null;
};

export type MessengerRealtimeGatewayEvent =
  | MessengerRealtimeIncomingEvent
  | {
      type: "state" | "open" | "close" | "error" | string;
      eventName?: string;
      status?: MessengerRealtimeGatewayStatus;
      payload?: unknown;
      data?: unknown;
      at?: string | null;
      error?: unknown;
      [key: string]: any;
    };

export type MessengerRealtimeGatewayListener = (
  event: MessengerRealtimeGatewayEvent,
) => void;

export type MessengerRealtimeServiceListener = (
  event: MessengerRealtimeServiceEvent,
) => void;

export type MessengerRealtimeEnvelope = {
  id?: string | null;
  name?: string;
  eventName?: string;
  type?: string;
  payload?: any;
  data?: unknown;
  occurredAt?: string | null;
  at?: string | null;
  roomId?: string | null;
  chatId?: string | null;
  userId?: string | null;
  [key: string]: any;
};

export type MessengerRealtimeJournalEntry = {
  id: string;
  type?: string;
  eventName: string;
  payload?: unknown;
  at: string;
  direction: "in" | "out" | "local" | "state";
  status?: MessengerRealtimeGatewayStatus;
  error?: string | null;
  [key: string]: any;
};

export type MessengerRealtimeDiagnosticsSnapshot = {
  status?: MessengerRealtimeGatewayStatus;
  connection?: MessengerRealtimeConnectionSnapshot;
  journal?: MessengerRealtimeJournalEntry[];
  lastEventAt?: string | null;
  lastError?: string | null;
  [key: string]: any;
};

export type MessengerRealtimeTwoDeviceCheckInput = {
  chatId?: string | null;
  currentUserId?: string | null;
  peerUserId?: string | null;
  timeoutMs?: number;
  [key: string]: any;
};

export type MessengerRealtimeTwoDeviceCheckResult = {
  ok?: boolean;
  ready?: boolean;
  status?: MessengerRealtimeGatewayStatus;
  message?: string | null;
  events?: MessengerRealtimeJournalEntry[];
  [key: string]: any;
};

export type MessengerRealtimeMessagePayload = MessengerKernelMessageRecord & {
  [key: string]: any;
};
