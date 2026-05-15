import {
  patchPrivateChatPrivacy,
  setPrivateChatBlocked,
  setPrivateChatDeleted,
  setPrivateChatDisappearingTimer,
  setPrivateChatHiddenFromMain,
} from "../private/privateChatRuntime";

import {
  AiToolAvailability,
  CallAvailabilityState,
  ChatActionState,
  ChatBackgroundPreset,
  ChatMeta,
  ChatNotificationSettings,
  ChatPrivacySafetySettings,
  DisappearingTimerKey,
  HiddenChatState,
  MessageItem,
  MuteDurationKey,
  PresenceSnapshot,
  PublicGiftItem,
  PublicMediaItem,
  RoomCapabilities,
  RoomSettingsState,
  RoomType,
} from "./types";

const CURRENT_USER_ID = "self-sabi-user";

function nowIso() {
  return new Date().toISOString();
}

function dateOffsetIso(params: { days?: number; hours?: number; minutes?: number }) {
  const date = new Date();
  if (params.days) date.setDate(date.getDate() + params.days);
  if (params.hours) date.setHours(date.getHours() + params.hours);
  if (params.minutes) date.setMinutes(date.getMinutes() + params.minutes);
  return date.toISOString();
}

function cloneRoomSettingsState(state: RoomSettingsState): RoomSettingsState {
  return JSON.parse(JSON.stringify(state)) as RoomSettingsState;
}

function buildCapabilities(
  roomType: RoomType,
  overrides?: Partial<RoomCapabilities>
): RoomCapabilities {
  const baseByType: Record<RoomType, RoomCapabilities> = {
    direct: {
      canSendText: true,
      canSendMedia: true,
      canCall: true,
      canGift: true,
      canShareLocation: true,
      canOpenBusinessActions: false,
      isReadOnly: false,
      showMembers: false,
      showPresence: true,
      showSubscriberCount: false,
      canSearchMessages: true,
      canOpenSharedMedia: true,
      canMuteNotifications: true,
      canBlockPeer: true,
      canHideChat: true,
      canUseAiTools: true,
      canPinChat: true,
      canArchiveChat: true,
    },
    group: {
      canSendText: true,
      canSendMedia: true,
      canCall: true,
      canGift: true,
      canShareLocation: true,
      canOpenBusinessActions: false,
      isReadOnly: false,
      showMembers: true,
      showPresence: false,
      showSubscriberCount: false,
      canSearchMessages: true,
      canOpenSharedMedia: true,
      canMuteNotifications: true,
      canBlockPeer: false,
      canHideChat: true,
      canUseAiTools: true,
      canPinChat: true,
      canArchiveChat: true,
    },
    channel: {
      canSendText: false,
      canSendMedia: false,
      canCall: false,
      canGift: true,
      canShareLocation: false,
      canOpenBusinessActions: false,
      isReadOnly: true,
      showMembers: false,
      showPresence: false,
      showSubscriberCount: true,
      canSearchMessages: true,
      canOpenSharedMedia: true,
      canMuteNotifications: true,
      canBlockPeer: false,
      canHideChat: true,
      canUseAiTools: true,
      canPinChat: true,
      canArchiveChat: true,
    },
    business: {
      canSendText: true,
      canSendMedia: true,
      canCall: true,
      canGift: true,
      canShareLocation: true,
      canOpenBusinessActions: true,
      isReadOnly: false,
      showMembers: false,
      showPresence: true,
      showSubscriberCount: false,
      canSearchMessages: true,
      canOpenSharedMedia: true,
      canMuteNotifications: true,
      canBlockPeer: true,
      canHideChat: true,
      canUseAiTools: true,
      canPinChat: true,
      canArchiveChat: true,
    },
    bot: {
      canSendText: true,
      canSendMedia: true,
      canCall: false,
      canGift: false,
      canShareLocation: true,
      canOpenBusinessActions: false,
      isReadOnly: false,
      showMembers: false,
      showPresence: false,
      showSubscriberCount: false,
      canSearchMessages: true,
      canOpenSharedMedia: true,
      canMuteNotifications: true,
      canBlockPeer: true,
      canHideChat: true,
      canUseAiTools: true,
      canPinChat: true,
      canArchiveChat: true,
    },
  };

  return {
    ...baseByType[roomType],
    ...overrides,
  };
}

function resolvePresenceState(
  online: boolean,
  lastSeenAt?: string | null
): PresenceSnapshot["state"] {
  if (online) return "online";
  if (!lastSeenAt) return "offline";

  const seen = new Date(lastSeenAt);
  if (Number.isNaN(seen.getTime())) return "offline";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const seenDay = new Date(seen.getFullYear(), seen.getMonth(), seen.getDate()).getTime();
  const diffDays = Math.round((today - seenDay) / 86400000);

  if (diffDays <= 0) return "last_seen_today";
  if (diffDays === 1) return "last_seen_yesterday";
  return "last_seen_date";
}

function buildPresenceSnapshot(params: {
  online?: boolean;
  lastSeenAt?: string | null;
  isRealtime?: boolean;
}): PresenceSnapshot {
  const online = Boolean(params.online);
  const lastSeenAt = online ? params.lastSeenAt ?? nowIso() : params.lastSeenAt ?? null;

  return {
    state: resolvePresenceState(online, lastSeenAt),
    online,
    lastSeenAt,
    isRealtime: params.isRealtime ?? true,
  };
}

function buildDefaultNotificationSettings(
  overrides?: Partial<ChatNotificationSettings>
): ChatNotificationSettings {
  return {
    muted: false,
    muteDurationKey: "forever",
    muteUntil: null,
    soundEnabled: true,
    vibrationEnabled: true,
    previewEnabled: true,
    badgeEnabled: true,
    mentionNotificationsEnabled: true,
    callNotificationsEnabled: true,
    ...overrides,
  };
}

function buildDefaultPrivacySafetySettings(
  roomType: RoomType,
  overrides?: Partial<ChatPrivacySafetySettings>
): ChatPrivacySafetySettings {
  return {
    disappearingTimer: "off",
    disappearingEnabled: false,
    contentProtectionEnabled: roomType !== "channel",
    screenshotAlertEnabled: false,
    allowForwarding: true,
    allowMediaSave: true,
    safetyMode: "standard",
    canReport: true,
    canClearHistory: true,
    ...overrides,
  };
}

function buildDefaultBlockState(overrides?: Partial<RoomSettingsState["block"]>): RoomSettingsState["block"] {
  return {
    isBlocked: false,
    blockedAt: null,
    blockedByUserId: null,
    ...overrides,
  };
}

function buildDefaultHiddenChatState(overrides?: Partial<HiddenChatState>): HiddenChatState {
  return {
    isHidden: false,
    hiddenAt: null,
    lockMode: "pin",
    requireUnlockOnOpen: true,
    ...overrides,
  };
}

function buildDefaultChatActionState(overrides?: Partial<ChatActionState>): ChatActionState {
  return {
    isPinned: false,
    pinnedAt: null,
    isArchived: false,
    archivedAt: null,
    canClearChat: true,
    canExportChat: true,
    ...overrides,
  };
}

function buildDefaultCallAvailabilityState(
  capabilities: RoomCapabilities,
  overrides?: Partial<CallAvailabilityState>
): CallAvailabilityState {
  return {
    canAudioCall: Boolean(capabilities.canCall),
    canVideoCall: Boolean(capabilities.canCall),
    hasOngoingAudioCall: false,
    hasOngoingVideoCall: false,
    ...overrides,
  };
}

function buildDefaultAiToolAvailability(
  enabled = true,
  overrides?: Partial<AiToolAvailability>
): AiToolAvailability {
  return {
    enabled,
    canRewrite: enabled,
    canTranslate: enabled,
    canSummarize: enabled,
    canSuggestReply: enabled,
    ...overrides,
  };
}

function buildDefaultRoomSettingsState(
  capabilities: RoomCapabilities,
  roomType: RoomType,
  overrides?: Partial<RoomSettingsState>
): RoomSettingsState {
  const quickActions = {
    isAddedToList: overrides?.quickActions?.isAddedToList ?? overrides?.addedToList ?? false,
    isSavedToSystemContacts:
      overrides?.quickActions?.isSavedToSystemContacts ?? overrides?.contactSaved ?? false,
    hasHomeShortcut:
      overrides?.quickActions?.hasHomeShortcut ?? overrides?.homeShortcutAdded ?? false,
  };

  return {
    notifications: buildDefaultNotificationSettings(overrides?.notifications),
    privacy: buildDefaultPrivacySafetySettings(roomType, overrides?.privacy),
    block: buildDefaultBlockState(overrides?.block),
    hiddenChat: buildDefaultHiddenChatState(overrides?.hiddenChat),
    chatActions: buildDefaultChatActionState(overrides?.chatActions),
    calls: buildDefaultCallAvailabilityState(capabilities, overrides?.calls),
    ai: buildDefaultAiToolAvailability(capabilities.canUseAiTools !== false, overrides?.ai),
    quickActions,
    management: {
      lastReportedAt: overrides?.management?.lastReportedAt ?? null,
      lastExportedAt: overrides?.management?.lastExportedAt ?? null,
      homeIconRequestedAt: overrides?.management?.homeIconRequestedAt ?? null,
    },
    addedToList: quickActions.isAddedToList,
    homeShortcutAdded: quickActions.hasHomeShortcut,
    contactSaved: quickActions.isSavedToSystemContacts,
  };
}

function buildHandle(name?: string, fallback = "sabiuser") {
  const normalized = String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/gi, "_")
    .replace(/^_+|_+$/g, "");

  return `@${normalized || fallback}`;
}

function avatarLetterFromName(value?: string) {
  const raw = String(value ?? "").trim();
  return (raw.slice(0, 1) || "S").toUpperCase();
}

function resolveMuteUntil(durationKey: MuteDurationKey): string | null {
  switch (durationKey) {
    case "1_hour":
      return dateOffsetIso({ hours: 1 });
    case "8_hours":
      return dateOffsetIso({ hours: 8 });
    case "24_hours":
      return dateOffsetIso({ hours: 24 });
    case "7_days":
      return dateOffsetIso({ days: 7 });
    case "forever":
    default:
      return null;
  }
}

const EMPTY_PROFILE_CONTENT = {
  publicPhotos: [] as PublicMediaItem[],
  publicVideos: [] as PublicMediaItem[],
  archivePublications: [] as PublicMediaItem[],
  publicGifts: [] as PublicGiftItem[],
  likesCount: 0,
};

const CHAT_PROFILE_CONTENT: Record<
  string,
  {
    publicPhotos: PublicMediaItem[];
    publicVideos: PublicMediaItem[];
    archivePublications: PublicMediaItem[];
    publicGifts: PublicGiftItem[];
    likesCount: number;
  }
> = {
  "1": { ...EMPTY_PROFILE_CONTENT, likesCount: 42 },
  "2": { ...EMPTY_PROFILE_CONTENT, likesCount: 18 },
  "3": { ...EMPTY_PROFILE_CONTENT, likesCount: 73 },
  "4": { ...EMPTY_PROFILE_CONTENT, likesCount: 54 },
  "5": { ...EMPTY_PROFILE_CONTENT, likesCount: 21 },
  "6": { ...EMPTY_PROFILE_CONTENT, likesCount: 9 },
  "sabi-info": { ...EMPTY_PROFILE_CONTENT, likesCount: 1200 },
  "assistant-bot": { ...EMPTY_PROFILE_CONTENT, likesCount: 88 },
};

export const CHAT_META: Record<string, ChatMeta> = {
  "1": {
    chatId: "1",
    userId: CURRENT_USER_ID,
    selfId: CURRENT_USER_ID,
    peerId: "user-ali",
    partnerId: "user-ali",
    name: "Ali",
    username: "ali",
    phone: "+998 90 111 22 33",
    birthday: "14 Aug",
    subtitle: "online now",
    roomType: "direct",
    infoPanelKind: "direct",
    online: true,
    avatarLetter: "A",
    capabilities: buildCapabilities("direct"),
    presence: buildPresenceSnapshot({ online: true }),
    settingsState: buildDefaultRoomSettingsState(buildCapabilities("direct"), "direct"),
  },
  "2": {
    chatId: "2",
    userId: CURRENT_USER_ID,
    selfId: CURRENT_USER_ID,
    peerId: "support-sabi",
    partnerId: "support-sabi",
    name: "Sabi Support",
    username: "sabi_support",
    phone: "+998 78 000 00 00",
    subtitle: "official support",
    roomType: "business",
    infoPanelKind: "business",
    verified: true,
    official: true,
    businessLabel: "Support",
    avatarLetter: "S",
    capabilities: buildCapabilities("business"),
    presence: buildPresenceSnapshot({ online: true }),
    settingsState: buildDefaultRoomSettingsState(buildCapabilities("business"), "business"),
  },
  "3": {
    chatId: "3",
    userId: CURRENT_USER_ID,
    selfId: CURRENT_USER_ID,
    peerId: "group-family",
    partnerId: "group-family",
    name: "Family Group",
    subtitle: "6 members",
    roomType: "group",
    infoPanelKind: "group",
    memberCount: 6,
    avatarLetter: "F",
    capabilities: buildCapabilities("group"),
    presence: buildPresenceSnapshot({ online: false, lastSeenAt: dateOffsetIso({ hours: -2 }) }),
    settingsState: buildDefaultRoomSettingsState(buildCapabilities("group"), "group"),
  },
  "4": {
    chatId: "4",
    userId: CURRENT_USER_ID,
    selfId: CURRENT_USER_ID,
    peerId: "group-design-team",
    partnerId: "group-design-team",
    name: "Design Team",
    subtitle: "team workspace",
    roomType: "group",
    infoPanelKind: "group",
    memberCount: 12,
    avatarLetter: "D",
    roleLabel: "Admin",
    capabilities: buildCapabilities("group"),
    presence: buildPresenceSnapshot({ online: false, lastSeenAt: dateOffsetIso({ days: -1, hours: -1 }) }),
    settingsState: buildDefaultRoomSettingsState(buildCapabilities("group"), "group"),
  },
  "5": {
    chatId: "5",
    userId: CURRENT_USER_ID,
    selfId: CURRENT_USER_ID,
    peerId: "business-desk",
    partnerId: "business-desk",
    name: "Business Desk",
    username: "business_desk",
    subtitle: "business assistant entry",
    roomType: "business",
    infoPanelKind: "business",
    verified: true,
    businessLabel: "Desk",
    avatarLetter: "B",
    capabilities: buildCapabilities("business", { canOpenBusinessActions: true }),
    presence: buildPresenceSnapshot({ online: false, lastSeenAt: dateOffsetIso({ minutes: -35 }) }),
    settingsState: buildDefaultRoomSettingsState(
      buildCapabilities("business", { canOpenBusinessActions: true }),
      "business"
    ),
  },
  "6": {
    chatId: "6",
    userId: CURRENT_USER_ID,
    selfId: CURRENT_USER_ID,
    peerId: "user-murod",
    partnerId: "user-murod",
    name: "Murod",
    username: "murod",
    phone: "+998 91 777 00 77",
    birthday: "03 Jan",
    subtitle: "last seen recently",
    roomType: "direct",
    infoPanelKind: "direct",
    avatarLetter: "M",
    capabilities: buildCapabilities("direct", { showPresence: true }),
    presence: buildPresenceSnapshot({ online: false, lastSeenAt: dateOffsetIso({ minutes: -12 }) }),
    settingsState: buildDefaultRoomSettingsState(
      buildCapabilities("direct", { showPresence: true }),
      "direct"
    ),
  },
  "sabi-info": {
    chatId: "sabi-info",
    userId: CURRENT_USER_ID,
    selfId: CURRENT_USER_ID,
    peerId: "channel-sabi-info",
    partnerId: "channel-sabi-info",
    name: "Sabi info",
    username: "sabi_info",
    subtitle: "official channel",
    roomType: "channel",
    infoPanelKind: "channel",
    official: true,
    verified: true,
    readOnly: true,
    subscriberCount: 12840,
    avatarLetter: "S",
    capabilities: buildCapabilities("channel"),
    presence: buildPresenceSnapshot({ online: false, lastSeenAt: dateOffsetIso({ days: -2 }) }),
    settingsState: buildDefaultRoomSettingsState(buildCapabilities("channel"), "channel"),
  },
  "assistant-bot": {
    chatId: "assistant-bot",
    userId: CURRENT_USER_ID,
    selfId: CURRENT_USER_ID,
    peerId: "assistant-bot",
    partnerId: "assistant-bot",
    name: "Sabi Assistant",
    username: "sabi_assistant",
    subtitle: "bot helper",
    roomType: "bot",
    infoPanelKind: "bot",
    verified: true,
    botLabel: "AI bot",
    avatarLetter: "A",
    capabilities: buildCapabilities("bot"),
    presence: buildPresenceSnapshot({ online: true }),
    settingsState: buildDefaultRoomSettingsState(buildCapabilities("bot"), "bot"),
  },
};

const CHAT_MESSAGES: Record<string, MessageItem[]> = {
  "1": [
    { id: "1", date: "Today", text: "Салом", time: "09:28", mine: false },
    { id: "2", text: "Салом, ишлар қалай?", time: "09:29", mine: true, status: "read" },
    { id: "3", text: "Кечқурун гаплашамизми?", time: "09:34", mine: false },
    { id: "4", text: "Ҳа, мен 7:30 дан кейин бўшман", time: "09:36", mine: true, status: "read" },
    { id: "5", text: "Зўр, мен ёзаман", time: "09:42", mine: false },
  ],
  "2": [
    { id: "1", date: "Today", text: "Ваш аккаунт успешно подтверждён.", time: "08:10", mine: false },
    { id: "2", text: "Спасибо. Всё активировано?", time: "08:12", mine: true, status: "read" },
    { id: "3", text: "Да, доступ уже открыт.", time: "08:15", mine: false },
  ],
  "3": [
    { id: "1", date: "Yesterday", text: "Кто заберёт торт?", time: "19:22", mine: false },
    { id: "2", text: "Я смогу", time: "19:25", mine: true, status: "delivered" },
    { id: "3", text: "Фото и видео уже отправлены в чат", time: "19:31", mine: false },
  ],
  "4": [
    { id: "1", date: "Yesterday", text: "Обновили карточки и тёмные поверхности.", time: "21:08", mine: false },
    { id: "2", text: "Вижу. Надо добавить ещё больше воздуха", time: "21:14", mine: true, status: "read" },
    { id: "3", text: "Да, и немного изюминки в кнопках", time: "21:16", mine: false },
  ],
  "5": [
    { id: "1", date: "Mon", text: "Новая заявка от клиента уже в очереди.", time: "11:04", mine: false },
    { id: "2", text: "Принял. Позже подключим assistant layer.", time: "11:12", mine: true, status: "sent" },
  ],
  "6": [{ id: "1", date: "Mon", text: "Я перезвоню после встречи.", time: "15:20", mine: false }],
  "sabi-info": [
    { id: "1", date: "Today", text: "Official Sabi Messenger updates and announcements.", time: "10:02", mine: false },
    { id: "2", date: "Today", text: "Global language and realtime improvements are rolling out.", time: "10:12", mine: false },
  ],
  "assistant-bot": [{ id: "1", date: "Today", text: "Hello. I can help inside Messenger flows.", time: "09:10", mine: false }],
};

export const CHAT_BACKGROUND_PRESETS: ChatBackgroundPreset[] = [
  {
    id: "emerald_luxe",
    title: "Emerald Luxe",
    subtitle: "богатый jade-premium",
    screenGradient: ["#03120F", "#071A15", "#0A251F", "#0E3029"],
    topGlow: "rgba(72, 255, 204, 0.18)",
    sideGlow: "rgba(40, 173, 134, 0.12)",
    leftMidGlow: "rgba(34, 168, 122, 0.14)",
    bottomGlow: "rgba(17, 95, 72, 0.18)",
    cardGradient: ["rgba(18,38,33,0.98)", "rgba(8,19,17,0.96)"],
    mineBubbleGradient: ["#8DFFDE", "#43E1B3", "#1AB48A"],
    mineBubbleText: "#072019",
    otherBubbleGradient: ["rgba(36,72,61,0.96)", "rgba(18,40,34,0.94)"],
    otherBubbleStroke: "rgba(171,255,228,0.18)",
    composerGradient: ["rgba(18,44,38,0.98)", "rgba(10,27,23,0.96)"],
    inputSurface: "rgba(255,255,255,0.055)",
    inputStroke: "rgba(146,255,216,0.12)",
    previewGradient: ["#1A463C", "#226A59", "#2EA989"],
    accent: "#89FFDE",
    accentSoft: "rgba(137,255,222,0.16)",
    actionGradient: ["#8BFFDF", "#4DE3B6", "#17BE91"],
    actionIconColor: "#08231B",
  },
  {
    id: "obsidian_mint",
    title: "Obsidian Mint",
    subtitle: "глубокий black + mint",
    screenGradient: ["#020807", "#07100F", "#0B1616", "#111F1F"],
    topGlow: "rgba(103, 255, 222, 0.12)",
    sideGlow: "rgba(53, 164, 137, 0.08)",
    bottomGlow: "rgba(34, 110, 96, 0.12)",
    cardGradient: ["rgba(17,24,24,0.98)", "rgba(7,11,11,0.97)"],
    mineBubbleGradient: ["#A5FFE7", "#62E5BF", "#2FB28C"],
    mineBubbleText: "#082019",
    otherBubbleGradient: ["rgba(40,52,53,0.96)", "rgba(19,27,28,0.96)"],
    otherBubbleStroke: "rgba(158,255,223,0.16)",
    composerGradient: ["rgba(20,28,28,0.98)", "rgba(9,14,14,0.97)"],
    inputSurface: "rgba(255,255,255,0.05)",
    inputStroke: "rgba(118,238,206,0.12)",
    previewGradient: ["#263334", "#355456", "#5EA795"],
    accent: "#92FFE0",
    accentSoft: "rgba(146,255,224,0.15)",
    actionGradient: ["#9CFFE3", "#65E6BF", "#30B58E"],
    actionIconColor: "#091E18",
  },
  {
    id: "amber_velvet",
    title: "Amber Velvet",
    subtitle: "теплый luxury sunset",
    screenGradient: ["#130B06", "#22140B", "#311D0D", "#462812"],
    topGlow: "rgba(255, 190, 92, 0.18)",
    sideGlow: "rgba(232, 139, 53, 0.10)",
    bottomGlow: "rgba(160, 83, 31, 0.16)",
    cardGradient: ["rgba(53,31,18,0.98)", "rgba(23,14,8,0.96)"],
    mineBubbleGradient: ["#FFD083", "#F0A552", "#C76D2D"],
    mineBubbleText: "#2B1608",
    otherBubbleGradient: ["rgba(92,61,40,0.92)", "rgba(43,28,18,0.96)"],
    otherBubbleStroke: "rgba(255,210,147,0.12)",
    composerGradient: ["rgba(54,33,19,0.98)", "rgba(29,18,10,0.96)"],
    inputSurface: "rgba(255,255,255,0.05)",
    inputStroke: "rgba(255,198,124,0.14)",
    previewGradient: ["#68411E", "#AD6D32", "#DB9A4E"],
    accent: "#FFD08A",
    accentSoft: "rgba(255,208,138,0.16)",
    actionGradient: ["#FFD38B", "#F0A653", "#C96F2D"],
    actionIconColor: "#301708",
  },
  {
    id: "graphite_mint",
    title: "Graphite Mint",
    subtitle: "neutral modern business",
    screenGradient: ["#060809", "#0B1113", "#12191C", "#182226"],
    topGlow: "rgba(120, 227, 193, 0.14)",
    sideGlow: "rgba(85, 153, 131, 0.08)",
    bottomGlow: "rgba(50, 102, 92, 0.12)",
    cardGradient: ["rgba(24,31,34,0.98)", "rgba(12,17,19,0.97)"],
    mineBubbleGradient: ["#9FF0CF", "#5CC6A0", "#2D8A6B"],
    mineBubbleText: "#0A231C",
    otherBubbleGradient: ["rgba(53,63,68,0.94)", "rgba(22,28,31,0.98)"],
    otherBubbleStroke: "rgba(164,238,211,0.10)",
    composerGradient: ["rgba(27,35,38,0.98)", "rgba(12,17,19,0.97)"],
    inputSurface: "rgba(255,255,255,0.05)",
    inputStroke: "rgba(140,255,215,0.11)",
    previewGradient: ["#2D3C40", "#50716E", "#7AD0B3"],
    accent: "#9EF4D1",
    accentSoft: "rgba(158,244,209,0.15)",
    actionGradient: ["#A3F5D4", "#60CAA4", "#318D6E"],
    actionIconColor: "#0B241D",
  },
];

const CHAT_BACKGROUND_DEFAULTS: Record<string, string> = {
  "1": "emerald_luxe",
  "2": "obsidian_mint",
  "3": "amber_velvet",
  "4": "graphite_mint",
  "5": "amber_velvet",
  "6": "emerald_luxe",
  "sabi-info": "obsidian_mint",
  "assistant-bot": "graphite_mint",
};

const ROOM_BACKGROUND_SELECTIONS: Record<string, string> = {};
const ROOM_SETTINGS_STATE_SELECTIONS: Record<string, RoomSettingsState> = {};

function inferRoomType(chatId: string, fallbackName?: string): RoomType {
  const source = `${chatId} ${fallbackName ?? ""}`.toLowerCase();
  if (source.includes("channel") || source.includes("news") || source.includes("info")) return "channel";
  if (source.includes("business") || source.includes("desk") || source.includes("support")) return "business";
  if (source.includes("group") || source.includes("team")) return "group";
  if (source.includes("bot") || source.includes("assistant")) return "bot";
  return "direct";
}

function buildFallbackMeta(chatId: string, fallbackName?: string): ChatMeta {
  const roomType = inferRoomType(chatId, fallbackName);
  const capabilities = buildCapabilities(roomType);

  return {
    chatId,
    userId: CURRENT_USER_ID,
    selfId: CURRENT_USER_ID,
    peerId: `peer-${chatId}`,
    partnerId: `peer-${chatId}`,
    name: fallbackName ?? "Chat",
    username: buildHandle(fallbackName ?? "chat", "chat"),
    phone: "",
    subtitle:
      roomType === "channel"
        ? "channel"
        : roomType === "group"
          ? "group conversation"
          : roomType === "business"
            ? "business conversation"
            : "messenger conversation",
    roomType,
    infoPanelKind:
      roomType === "channel"
        ? "channel"
        : roomType === "group"
          ? "group"
          : roomType === "business"
            ? "business"
            : roomType === "bot"
              ? "bot"
              : "direct",
    avatarLetter: avatarLetterFromName(fallbackName ?? "C"),
    capabilities,
    presence: buildPresenceSnapshot({ online: false, lastSeenAt: dateOffsetIso({ minutes: -15 }) }),
    settingsState: buildDefaultRoomSettingsState(capabilities, roomType),
  };
}

function normalizeRoomSettingsState(state: RoomSettingsState): RoomSettingsState {
  const quickActions = {
    isAddedToList: state.quickActions?.isAddedToList ?? Boolean(state.addedToList),
    isSavedToSystemContacts:
      state.quickActions?.isSavedToSystemContacts ?? Boolean(state.contactSaved),
    hasHomeShortcut:
      state.quickActions?.hasHomeShortcut ?? Boolean(state.homeShortcutAdded),
  };

  return {
    ...state,
    quickActions,
    management: {
      lastReportedAt: state.management?.lastReportedAt ?? null,
      lastExportedAt: state.management?.lastExportedAt ?? null,
      homeIconRequestedAt: state.management?.homeIconRequestedAt ?? null,
    },
    addedToList: quickActions.isAddedToList,
    homeShortcutAdded: quickActions.hasHomeShortcut,
    contactSaved: quickActions.isSavedToSystemContacts,
  };
}

export function setChatPinned(chatId: string, isPinned: boolean) {
  return updateRoomSettingsState(chatId, (current) => ({
    ...current,
    chatActions: {
      ...current.chatActions,
      isPinned,
      pinnedAt: isPinned ? nowIso() : null,
    },
  }));
}

export function setChatArchived(chatId: string, isArchived: boolean) {
  return updateRoomSettingsState(chatId, (current) => ({
    ...current,
    chatActions: {
      ...current.chatActions,
      isArchived,
      archivedAt: isArchived ? nowIso() : null,
    },
  }));
}

export function getChatMeta(chatId: string, fallbackName?: string): ChatMeta {
  const base = CHAT_META[chatId] ?? buildFallbackMeta(chatId, fallbackName);
  const settingsState =
    ROOM_SETTINGS_STATE_SELECTIONS[chatId] ??
    base.settingsState ??
    buildDefaultRoomSettingsState(base.capabilities, base.roomType);

  const presence =
    base.presence ??
    buildPresenceSnapshot({ online: base.online, lastSeenAt: null });

  return {
    ...base,
    settingsState: normalizeRoomSettingsState(cloneRoomSettingsState(settingsState)),
    presence,
    online: presence.online,
  };
}

export function getChatPhone(chatId: string, fallbackName?: string): string {
  return String(getChatMeta(chatId, fallbackName).phone ?? "").trim();
}

export function getInitialMessages(chatId: string): MessageItem[] {
  const list = CHAT_MESSAGES[chatId] ?? [
    {
      id: "fallback-1",
      date: "Today",
      text: "Conversation will appear here.",
      time: "09:00",
      mine: false,
    },
  ];
  return list.map((item) => ({ ...item }));
}

export function clearChatMessages(chatId: string) {
  CHAT_MESSAGES[chatId] = [];
}

export function buildChatExportText(chatId: string, fallbackName?: string): string {
  const meta = getChatMeta(chatId, fallbackName);
  const messages = getInitialMessages(chatId);
  return [
    meta.name,
    "",
    ...messages.map((item) => `[${item.time}] ${item.mine ? "You" : meta.name}: ${item.text}`),
  ].join("\n");
}

export function getStoredBackgroundId(chatId: string): string {
  return ROOM_BACKGROUND_SELECTIONS[chatId] ?? CHAT_BACKGROUND_DEFAULTS[chatId] ?? "emerald_luxe";
}

export function setStoredBackgroundId(chatId: string, presetId: string) {
  ROOM_BACKGROUND_SELECTIONS[chatId] = presetId;
}

export function getRoomSettingsState(chatId: string, fallbackName?: string): RoomSettingsState {
  const meta = getChatMeta(chatId, fallbackName);
  return normalizeRoomSettingsState(
    cloneRoomSettingsState(
      ROOM_SETTINGS_STATE_SELECTIONS[chatId] ?? meta.settingsState!
    )
  );
}

export function setRoomSettingsState(chatId: string, nextState: RoomSettingsState) {
  const normalized = normalizeRoomSettingsState(cloneRoomSettingsState(nextState));
  ROOM_SETTINGS_STATE_SELECTIONS[chatId] = normalized;

  if (CHAT_META[chatId]) {
    CHAT_META[chatId] = {
      ...CHAT_META[chatId],
      settingsState: normalizeRoomSettingsState(cloneRoomSettingsState(normalized)),
    };
  }
}

export function updateRoomSettingsState(
  chatId: string,
  updater: (current: RoomSettingsState) => RoomSettingsState,
  fallbackName?: string
): RoomSettingsState {
  const current = getRoomSettingsState(chatId, fallbackName);
  const next = updater(current);
  setRoomSettingsState(chatId, next);
  return next;
}

export function setChatMuted(
  chatId: string,
  muted: boolean,
  durationKey: MuteDurationKey = "forever"
) {
  return updateRoomSettingsState(chatId, (current) => ({
    ...current,
    notifications: {
      ...current.notifications,
      muted,
      muteDurationKey: muted ? durationKey : "off",
      muteUntil: muted ? resolveMuteUntil(durationKey) : null,
    },
  }));
}

export function setChatBlocked(chatId: string, isBlocked: boolean) {
  void setPrivateChatBlocked(chatId, isBlocked, isBlocked ? CURRENT_USER_ID : null).catch(() => undefined);

  return updateRoomSettingsState(chatId, (current) => ({
    ...current,
    notifications: {
      ...current.notifications,
      muted: isBlocked ? true : current.notifications.muted,
    },
    block: {
      ...current.block,
      isBlocked,
      blockedAt: isBlocked ? nowIso() : null,
      blockedByUserId: isBlocked ? CURRENT_USER_ID : null,
    },
  }));
}

export function setChatAddedToList(chatId: string, enabled: boolean) {
  void setPrivateChatDeleted(chatId, false).catch(() => undefined);
  void setPrivateChatHiddenFromMain(chatId, !enabled, {
    requireUnlockOnOpen: !enabled,
  }).catch(() => undefined);

  return updateRoomSettingsState(chatId, (current) => ({
    ...current,
    quickActions: {
      ...current.quickActions,
      isAddedToList: enabled,
    },
    addedToList: enabled,
  }));
}

export function setChatSavedToSystemContacts(chatId: string, enabled: boolean) {
  return updateRoomSettingsState(chatId, (current) => ({
    ...current,
    quickActions: {
      ...current.quickActions,
      isSavedToSystemContacts: enabled,
    },
    contactSaved: enabled,
  }));
}

export function setChatDisappearingEnabled(chatId: string, enabled: boolean) {
  return updateRoomSettingsState(chatId, (current) => {
    const disappearingTimer = enabled
      ? current.privacy.disappearingTimer === "off"
        ? "1_day"
        : current.privacy.disappearingTimer
      : "off";

    void setPrivateChatDisappearingTimer(chatId, disappearingTimer).catch(() => undefined);

    return {
      ...current,
      privacy: {
        ...current.privacy,
        disappearingEnabled: enabled,
        disappearingTimer,
      },
    };
  });
}

export function setChatDisappearingTimer(chatId: string, timer: DisappearingTimerKey) {
  void setPrivateChatDisappearingTimer(chatId, timer).catch(() => undefined);

  return updateRoomSettingsState(chatId, (current) => ({
    ...current,
    privacy: {
      ...current.privacy,
      disappearingTimer: timer,
      disappearingEnabled: timer !== "off",
    },
  }));
}

export function markChatReported(chatId: string) {
  const reportedAt = nowIso();
  void patchPrivateChatPrivacy(chatId, { lastReportedAt: reportedAt, safetyMode: "strict" }).catch(() => undefined);

  return updateRoomSettingsState(chatId, (current) => ({
    ...current,
    privacy: {
      ...current.privacy,
      safetyMode: "strict",
    },
    management: {
      ...current.management,
      lastReportedAt: reportedAt,
    },
  }));
}

export function reportChat(chatId: string) {
  return markChatReported(chatId);
}

export function markChatExported(chatId: string) {
  return updateRoomSettingsState(chatId, (current) => ({
    ...current,
    management: {
      ...current.management,
      lastExportedAt: nowIso(),
    },
  }));
}

export function markHomeShortcutPinned(chatId: string) {
  return updateRoomSettingsState(chatId, (current) => ({
    ...current,
    quickActions: {
      ...current.quickActions,
      hasHomeShortcut: true,
    },
    homeShortcutAdded: true,
    management: {
      ...current.management,
      homeIconRequestedAt: nowIso(),
    },
  }));
}

export function markChatHomeIconRequested(chatId: string) {
  return markHomeShortcutPinned(chatId);
}

export function getChatPartnerInfoRouteParams(chatId: string, fallbackName?: string) {
  const meta = getChatMeta(chatId, fallbackName);
  const content = CHAT_PROFILE_CONTENT[chatId] ?? EMPTY_PROFILE_CONTENT;
  return {
    id: chatId,
    chatId,
    name: meta.name,
    handle: buildHandle(meta.username || meta.name, "sabiuser"),
    avatarLetter: meta.avatarLetter || avatarLetterFromName(meta.name),
    verified: meta.verified ? "1" : "0",
    status: meta.subtitle,
    phone: meta.phone,
    birthday: meta.birthday,
    userId: meta.userId,
    selfId: meta.selfId,
    peerId: meta.peerId,
    partnerId: meta.partnerId,
    targetUserId: meta.peerId,
    publicPhotos: JSON.stringify(content.publicPhotos),
    publicVideos: JSON.stringify(content.publicVideos),
    archivePublications: JSON.stringify(content.archivePublications),
    publicGifts: JSON.stringify(content.publicGifts),
    likesCount: String(content.likesCount),
  };
}
