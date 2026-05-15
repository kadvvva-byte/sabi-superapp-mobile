export type DeliveryStatus = "sent" | "delivered" | "read";

export type MessageKind =
  | "text"
  | "image"
  | "video"
  | "video_message"
  | "link"
  | "audio"
  | "voice"
  | "document"
  | "contact"
  | "location"
  | "sticker"
  | "premium_sticker"
  | "animated_reaction"
  | "animated_emoji"
  | "gift"
  | "system";

export type RoomType = "direct" | "group" | "channel" | "business" | "bot";

export type ChatInfoPanelKind =
  | "direct"
  | "group"
  | "channel"
  | "business"
  | "bot";

export type RoomSettingsToolId =
  | "add_contact"
  | "add_to_list"
  | "mute"
  | "disappearing"
  | "theme"
  | "ai"
  | "editor"
  | "report"
  | "block"
  | "clear_chat"
  | "hide_conversation"
  | "export_chat"
  | "add_to_home";

export type RoomSettingsSectionId =
  | "main"
  | "more"
  | "appearance"
  | "moderation";

export type PresenceState =
  | "online"
  | "offline"
  | "last_seen_today"
  | "last_seen_yesterday"
  | "last_seen_date";

export type MuteDurationKey =
  | "off"
  | "1_hour"
  | "8_hours"
  | "24_hours"
  | "7_days"
  | "forever";

export type DisappearingTimerKey =
  | "off"
  | "30_seconds"
  | "1_minute"
  | "5_minutes"
  | "1_hour"
  | "1_day"
  | "7_days";

export type HiddenChatLockMode =
  | "none"
  | "pin"
  | "biometric"
  | "pin_or_biometric";

export type SafetyMode = "standard" | "strict";
export type CallActionType = "audio" | "video";

export type SharedMediaTab =
  | "photos"
  | "videos"
  | "files"
  | "links"
  | "docs"
  | "voice";

export type SearchScope =
  | "messages"
  | "media"
  | "links"
  | "files"
  | "members"
  | "all";

export type MessageReplyRef = {
  id: string;
  text: string;
  mine?: boolean;
  senderLabel: string;
};

export type AnimatedMessagePayload = {
  id: string;
  emoji: string;
  title: string;
  subtitle?: string;
  durationMs?: number;
  kind: "reaction" | "emoji" | "gift";
  premium?: boolean;
};

export type LinkPreviewPayload = {
  url: string;
  title?: string;
  subtitle?: string;
  domain?: string;
  imageUri?: string;
};

export type DocumentPayload = {
  fileName: string;
  uri?: string;
  mimeType?: string;
  extension?: string;
  fileSizeLabel?: string;
};

export type ContactPayload = {
  name: string;
  phone?: string;
  username?: string;
  avatarUrl?: string;
};

export type LocationPayload = {
  label?: string;
  address?: string;
  latitude: number;
  longitude: number;
  mapPreviewUri?: string;
};

export type PublicMediaItem = {
  id: string;
  uri: string;
  kind: "photo" | "video";
  views?: number;
  duration?: string;
  liked?: boolean;
};

export type PublicGiftItem = {
  id: string;
  title?: string;
  emoji?: string;
  imageUri?: string;
};

export type SharedMediaItem = {
  id: string;
  kind: SharedMediaTab;
  title?: string;
  subtitle?: string;
  uri?: string;
  thumbUri?: string;
  dateLabel?: string;
  sizeLabel?: string;
  durationLabel?: string;
  linkUrl?: string;
};

export type MessageItem = {
  id: string;
  text: string;
  time: string;
  mine: boolean;
  date?: string;
  status?: DeliveryStatus;
  kind?: MessageKind;
  previewTitle?: string;
  previewSubtitle?: string;
  fileLabel?: string;
  fileSizeLabel?: string;
  mimeType?: string | null;
  reaction?: string;
  replyTo?: MessageReplyRef;
  edited?: boolean;
  localUri?: string;
  remoteUri?: string;
  thumbnailUri?: string;
  durationLabel?: string;
  durationMs?: number;
  animatedPayload?: AnimatedMessagePayload;
  linkPreview?: LinkPreviewPayload;
  documentPayload?: DocumentPayload;
  contactPayload?: ContactPayload;
  locationPayload?: LocationPayload;
  voiceWaveform?: number[];
  stickerId?: string;
  forwardedFromMessageId?: string | null;
  forwardedFromChatId?: string | null;
  forwardedFromUserId?: string | null;
  forwardedFromLabel?: string | null;
  originalMessageId?: string | null;
  deletedAt?: string | null;
  senderUserId?: string;
  receiverUserId?: string;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string | null;
  isPinned?: boolean;
  isDeleted?: boolean;
};

export type PresenceSnapshot = {
  state: PresenceState;
  online: boolean;
  lastSeenAt?: string | null;
  label?: string;
  isRealtime: boolean;
};

export type RoomCapabilities = {
  canSendText: boolean;
  canSendMedia: boolean;
  canCall: boolean;
  canGift: boolean;
  canShareLocation: boolean;
  canOpenBusinessActions: boolean;
  isReadOnly: boolean;
  showMembers: boolean;
  showPresence: boolean;
  showSubscriberCount: boolean;
  canSearchMessages?: boolean;
  canOpenSharedMedia?: boolean;
  canMuteNotifications?: boolean;
  canBlockPeer?: boolean;
  canHideChat?: boolean;
  canUseAiTools?: boolean;
  canPinChat?: boolean;
  canArchiveChat?: boolean;
};

export type ChatNotificationSettings = {
  muted: boolean;
  muteDurationKey: MuteDurationKey;
  muteUntil?: string | null;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  previewEnabled: boolean;
  badgeEnabled: boolean;
  mentionNotificationsEnabled: boolean;
  callNotificationsEnabled: boolean;
};

export type ChatPrivacySafetySettings = {
  disappearingTimer: DisappearingTimerKey;
  disappearingEnabled: boolean;
  contentProtectionEnabled: boolean;
  screenshotAlertEnabled: boolean;
  allowForwarding: boolean;
  allowMediaSave: boolean;
  safetyMode: SafetyMode;
  canReport: boolean;
  canClearHistory: boolean;
};

export type ChatBlockState = {
  isBlocked: boolean;
  blockedAt?: string | null;
  blockedByUserId?: string | null;
};

export type HiddenChatState = {
  isHidden: boolean;
  hiddenAt?: string | null;
  lockMode: HiddenChatLockMode;
  requireUnlockOnOpen: boolean;
};

export type ChatActionState = {
  isPinned: boolean;
  pinnedAt?: string | null;
  isArchived: boolean;
  archivedAt?: string | null;
  canClearChat: boolean;
  canExportChat: boolean;
};

export type CallAvailabilityState = {
  canAudioCall: boolean;
  canVideoCall: boolean;
  hasOngoingAudioCall?: boolean;
  hasOngoingVideoCall?: boolean;
};

export type AiToolAvailability = {
  enabled: boolean;
  canRewrite: boolean;
  canTranslate: boolean;
  canSummarize: boolean;
  canSuggestReply: boolean;
};

export type ChatQuickActionState = {
  isAddedToList: boolean;
  isSavedToSystemContacts: boolean;
  hasHomeShortcut: boolean;
};

export type ChatManagementState = {
  lastReportedAt?: string | null;
  lastExportedAt?: string | null;
  homeIconRequestedAt?: string | null;
};

export type RoomSettingsState = {
  notifications: ChatNotificationSettings;
  privacy: ChatPrivacySafetySettings;
  block: ChatBlockState;
  hiddenChat: HiddenChatState;
  chatActions: ChatActionState;
  calls: CallAvailabilityState;
  ai: AiToolAvailability;
  quickActions: ChatQuickActionState;
  management: ChatManagementState;
  addedToList?: boolean;
  homeShortcutAdded?: boolean;
  contactSaved?: boolean;
};

export type ChatMeta = {
  name: string;
  subtitle: string;
  roomType: RoomType;
  infoPanelKind: ChatInfoPanelKind;
  capabilities: RoomCapabilities;
  online?: boolean;
  verified?: boolean;
  official?: boolean;
  readOnly?: boolean;
  avatarLetter?: string;
  avatarUrl?: string;
  photoUrl?: string;
  roleLabel?: string;
  memberCount?: number;
  subscriberCount?: number;
  businessLabel?: string;
  botLabel?: string;
  chatId?: string;
  userId?: string;
  selfId?: string;
  peerId?: string;
  partnerId?: string;
  username?: string;
  phone?: string;
  birthday?: string;
  presence?: PresenceSnapshot;
  settingsState?: RoomSettingsState;
};

export type ChatPartnerInfoRouteParams = {
  id?: string;
  chatId?: string;
  name?: string;
  handle?: string;
  avatarLetter?: string;
  avatarUrl?: string;
  photoUrl?: string;
  verified?: string;
  status?: string;
  phone?: string;
  birthday?: string;
  userId?: string;
  selfId?: string;
  peerId?: string;
  partnerId?: string;
  targetUserId?: string;
  publicPhotos?: string | string[];
  publicVideos?: string | string[];
  archivePublications?: string | string[];
  publicGifts?: string | string[];
  likesCount?: string | string[];
};

export type ChatCallRouteParams = {
  id?: string;
  name?: string;
  avatarLetter?: string;
  verified?: string;
  status?: string;
};

export type ChatBackgroundPreset = {
  id: string;
  title: string;
  subtitle: string;
  screenGradient: [string, string, string, string];
  topGlow: string;
  sideGlow: string;
  leftMidGlow?: string;
  bottomGlow: string;
  cardGradient: [string, string];
  mineBubbleGradient: [string, string, string];
  mineBubbleText: string;
  otherBubbleGradient: [string, string];
  otherBubbleStroke: string;
  composerGradient: [string, string];
  inputSurface: string;
  inputStroke: string;
  previewGradient: [string, string, string];
  accent: string;
  accentSoft: string;
  actionGradient: [string, string, string];
  actionIconColor: string;
};