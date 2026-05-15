export type MessengerKernelRuntimeStatus =
  | "idle"
  | "binding_session"
  | "ready"
  | "error";

export type MessengerRuntimeStatus = MessengerKernelRuntimeStatus;

export type MessengerKernelCollectionStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error";

export type MessengerKernelRealtimeStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

export type MessengerRealtimeStatus = MessengerKernelRealtimeStatus;

export type MessengerKernelAuthScheme = "Bearer" | "bearer" | "raw" | string;

export type MessengerKernelSessionSnapshot = {
  apiBaseUrl: string | null;
  accessToken: string | null;
  currentUserId: string | null;
  socketUrl?: string | null;
  socketPath?: string | null;
  authScheme?: MessengerKernelAuthScheme | null;
  query?: Record<string, unknown> | null;
  headers?: Record<string, string> | null;
  boundAt?: string | null;
  [key: string]: any;
};

export type MessengerKernelResolvedSessionSnapshot = MessengerKernelSessionSnapshot & {
  apiBaseUrl: string;
  accessToken: string;
  currentUserId: string;
};

export type MessengerKernelSessionBinding = MessengerKernelSessionSnapshot & {
  apiBaseUrl: string;
  accessToken: string;
  currentUserId: string;
  boundAt: string;
};

export type MessengerKernelBaseRecord = {
  id: string;
  [key: string]: any;
};

export type MessengerKernelRoomType =
  | "direct"
  | "private"
  | "group"
  | "channel"
  | "bot"
  | string;

export type MessengerKernelRoomRecord = MessengerKernelBaseRecord & {
  chatId: string;
  roomId?: string | null;
  roomType?: MessengerKernelRoomType | null;
  type?: MessengerKernelRoomType | null;
  title?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  messageIds?: string[] | null;
  participantIds?: string[] | null;
  lastMessageId?: string | null;
  unreadCount?: number | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type MessengerKernelMessageRecord = MessengerKernelBaseRecord & {
  chatId?: string | null;
  roomId?: string | null;
  clientId?: string | null;
  clientMessageId?: string | null;
  senderUserId?: string | null;
  receiverUserId?: string | null;
  text?: string | null;
  body?: string | null;
  content?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type MessengerKernelParticipantRecord = MessengerKernelBaseRecord & {
  chatId?: string | null;
  roomId?: string | null;
  userId?: string | null;
  role?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type MessengerKernelCallRecord = MessengerKernelBaseRecord & {
  chatId?: string | null;
  roomId?: string | null;
  callerUserId?: string | null;
  receiverUserId?: string | null;
  status?: string | null;
};

export type MessengerKernelPresenceEntry = {
  userId: string;
  status?: "online" | "offline" | "away" | "busy" | string;
  isOnline?: boolean;
  lastSeenAt?: string | null;
  updatedAt?: string | null;
  [key: string]: any;
};

export type MessengerKernelTypingEntry = {
  chatId: string;
  roomId?: string | null;
  userId: string;
  isTyping: boolean;
  startedAt?: string | null;
  updatedAt?: string | null;
  expiresAt?: string | null;
  [key: string]: any;
};

export type MessengerKernelAnimatedPayload = {
  id?: string | null;
  type?: string | null;
  name?: string | null;
  url?: string | null;
  assetUrl?: string | null;
  price?: number | null;
  currency?: string | null;
  [key: string]: any;
};

export type MessengerRealtimeConnectionEvent = {
  type: "connection";
  status: MessengerRealtimeStatus | string;
  at?: string | null;
  eventName?: string;
  payload?: any;
  error?: unknown;
  [key: string]: any;
};

export type MessengerRealtimeCustomEvent = {
  type: "custom";
  eventName: string;
  payload: any;
  at?: string | null;
  status?: MessengerRealtimeStatus | string;
  error?: unknown;
  [key: string]: any;
};

export type MessengerRealtimePresenceEvent = {
  type: "presence";
  eventName?: string;
  payload: MessengerKernelPresenceEntry;
  at?: string | null;
  status?: MessengerRealtimeStatus | string;
  error?: unknown;
  [key: string]: any;
};

export type MessengerRealtimeTypingEvent = {
  type: "typing";
  eventName?: string;
  payload: {
    chatId: string;
    entry: MessengerKernelTypingEntry;
    userIds?: string[];
    [key: string]: any;
  };
  at?: string | null;
  status?: MessengerRealtimeStatus | string;
  error?: unknown;
  [key: string]: any;
};

export type MessengerRealtimeMessageEvent = {
  type: "message" | "message_ack" | string;
  eventName?: string;
  payload?: any;
  at?: string | null;
  status?: MessengerRealtimeStatus | string;
  error?: unknown;
  [key: string]: any;
};

export type MessengerRealtimeIncomingEvent =
  | MessengerRealtimeConnectionEvent
  | MessengerRealtimeCustomEvent
  | MessengerRealtimePresenceEvent
  | MessengerRealtimeTypingEvent
  | MessengerRealtimeMessageEvent;

export type MessengerRealtimeServiceEvent = MessengerRealtimeIncomingEvent;

export type MessengerKernelCollectionState<
  TRecord extends MessengerKernelBaseRecord,
> = {
  ids: string[];
  records: Record<string, TRecord>;
  status: MessengerKernelCollectionStatus;
  error: string | null;
  lastSyncedAt: string | null;
};

export type MessengerKernelRealtimeState = {
  status: MessengerKernelRealtimeStatus;
  error: string | null;
  lastEventAt: string | null;
  lastConnectedAt: string | null;
};

export type MessengerKernelCallsState =
  MessengerKernelCollectionState<MessengerKernelCallRecord> & {
    activeCallId: string | null;
    incomingCallId: string | null;
  };

export type MessengerKernelState = {
  runtimeStatus: MessengerKernelRuntimeStatus;
  realtimeStatus: MessengerKernelRealtimeStatus;
  currentUserId: string | null;
  apiBaseUrl: string | null;
  accessToken: string | null;
  socketUrl: string | null;
  socketPath: string | null;
  authScheme?: MessengerKernelAuthScheme | null;
  query?: Record<string, unknown> | null;
  headers?: Record<string, string> | null;

  initialized?: boolean;
  error?: string | null;
  updatedAt?: string | null;
  session?: MessengerKernelSessionSnapshot | MessengerKernelSessionBinding | null;

  rooms?: MessengerKernelCollectionState<MessengerKernelRoomRecord>;
  messages?: MessengerKernelCollectionState<MessengerKernelMessageRecord>;
  participants?: MessengerKernelCollectionState<MessengerKernelParticipantRecord>;
  calls?: MessengerKernelCallsState;
  realtime?: MessengerKernelRealtimeState;

  roomsById: Record<string, MessengerKernelRoomRecord>;
  messagesById: Record<string, MessengerKernelMessageRecord>;
  participantsById: Record<string, MessengerKernelParticipantRecord>;
  callsById?: Record<string, MessengerKernelCallRecord>;

  roomMessageIds: Record<string, string[]>;
  roomParticipantIds: Record<string, string[]>;
  presenceByUserId: Record<string, MessengerKernelPresenceEntry>;
  typingByChatId: Record<string, MessengerKernelTypingEntry[]>;
  [key: string]: any;
};

type MessengerKernelKnownEventMap = {
  change: MessengerKernelState;
  state: MessengerKernelState;
  state_changed: MessengerKernelState;
  realtimeEvent: MessengerRealtimeServiceEvent;
  realtime_event: MessengerRealtimeServiceEvent;
  realtimeStatus: MessengerRealtimeStatus;
  realtime_status_changed: MessengerRealtimeStatus;
  connection: MessengerRealtimeConnectionEvent;
  custom: MessengerRealtimeCustomEvent;
  presence: MessengerKernelPresenceEntry;
  typing: MessengerKernelTypingEntry;
  roomSnapshot: any;
  room_snapshot: any;
  room_changed: any;
  messages_changed: any;
  participants_changed: any;
  presence_changed: MessengerKernelPresenceEntry;
  typing_changed: MessengerKernelTypingEntry;
  error: any;
};

export type MessengerKernelEventMap = Record<string, any> & MessengerKernelKnownEventMap;
export type MessengerKernelEventName = string;

export type MessengerKernelEventHandler<
  TEventName extends string = string,
> = (event: TEventName extends keyof MessengerKernelKnownEventMap ? MessengerKernelKnownEventMap[TEventName] : any) => void;

export type MessengerKernelEventListener<
  TEventName extends string = string,
> = MessengerKernelEventHandler<TEventName>;

export type MessengerKernelStoreListener = (
  state?: MessengerKernelState,
) => void;

export type MessengerKernelStateUpdater =
  | MessengerKernelState
  | ((prev: MessengerKernelState) => MessengerKernelState);

export type MessengerKernelCollectionKey =
  | "rooms"
  | "messages"
  | "participants"
  | "calls";
