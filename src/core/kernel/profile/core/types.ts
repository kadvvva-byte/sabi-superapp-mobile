import type { PrivacyDetailConfig } from "../../../../modules/profile/data/privacy";
import type { ProfileKernelSessionSnapshot } from "../session/types";

export type ProfileKernelRuntimeStatus =
  | "idle"
  | "booting"
  | "ready"
  | "refreshing"
  | "error";

export type ProfileVerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

export type ProfileMediaKind = "photo" | "video";
export type ProfilePhotoFilterKey = "none" | "warm" | "cool" | "mono" | "dream" | "neon";

export type ProfilePhotoEditState = {
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  filter: ProfilePhotoFilterKey;
};

export type ProfileMediaItem = {
  id: string;
  uri: string;
  type: ProfileMediaKind;
  createdAt: number;
  durationMs?: number | null;
  thumbnailUri?: string | null;
  width?: number | null;
  height?: number | null;
  edit?: ProfilePhotoEditState | null;
};

export type ProfileLinkItem = {
  id: string;
  url: string;
  label: string;
  createdAt: number;
};

export type ProfileVoiceNoteItem = {
  id: string;
  uri: string;
  durationMs: number;
  createdAt: number;
};

export type UnifiedAccountProfileSnapshot = {
  userId: string;
  sabiDisplayId: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  fullName: string;
  bio: string;
  subtitle: string;
  birthday: string;
  avatarUri: string | null;
  coverUri: string | null;
  avatarLetter: string;
  verificationStatus: ProfileVerificationStatus;
  profileCompleted: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  raw: Record<string, unknown> | null;
};

export type PublicProfileDraft = {
  publicName: string;
  publicUsername: string;
  publicBio: string;
  publicSubtitle: string;
};

export type GroupProfilePreview = {
  created: boolean;
  groupId: string;
  groupName: string;
  username: string;
  isPublic: boolean;
  isPublished: boolean;
  ownerUserId: string;
  linkedPublicationId: string;
  linkedChatId: string;
};

export type ChannelProfilePreview = {
  created: boolean;
  channelId: string;
  channelName: string;
  username: string;
  isPublic: boolean;
  isPublished: boolean;
  ownerUserId: string;
  linkedPublicationId: string;
  linkedChatId: string;
};

export type BotProfilePreview = {
  created: boolean;
  botId: string;
  botName: string;
  username: string;
  botKind: string;
  isPublic: boolean;
  isPublished: boolean;
  ownerUserId: string;
  linkedChatId: string;
};

export type ProfileCompleteDraft = {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  userId: string;
};

export type ProfileKernelQrState = {
  profileCode: string;
  allowProfileQrScan: boolean;
  allowQrShare: boolean;
};

export type ProfileKernelSecurityState = {
  biometricEnabled: boolean;
  appPinEnabled: boolean;
  twoFactorEnabled: boolean;
  trustedDeviceAlerts: boolean;
  suspiciousLoginAlerts: boolean;
  sensitiveActionConfirmation: boolean;
  faceIdForPhoneChange: boolean;
  faceIdForEmailChange: boolean;
  fallbackPinEnabled: boolean;
};

export type ProfileKernelEmailChangeState = {
  currentEmail: string;
  requiresCurrentEmailVerification: boolean;
  requiresNewEmailVerification: boolean;
};

export type ProfileKernelPhoneChangeState = {
  currentPhone: string;
  requiresOldPhoneVerification: boolean;
  requiresNewPhoneVerification: boolean;
};

export type ProfilePersonRule = {
  id: string;
  name: string;
  username: string;
  note?: string;
};

export type ProfileKernelPreferencesState = {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  previewEnabled: boolean;
  compactMode: boolean;
  smartInsightsEnabled: boolean;
};

export type ProfileKernelAutoDeletePreset = "off" | "24_hours" | "7_days" | "30_days" | "90_days";

export type ProfileKernelAutoDeleteState = {
  selectedPreset: ProfileKernelAutoDeletePreset;
  applyToNewChats: boolean;
  applyToGroups: boolean;
  applyToChannels: boolean;
};

export type ProfileKernelDeviceSession = {
  id: string;
  title: string;
  platform: string;
  location?: string;
  lastSeen?: string;
  trusted?: boolean;
  web?: boolean;
};

export type ProfileKernelDevicesState = {
  sessionTimeout: string;
  sessions: ProfileKernelDeviceSession[];
};

export type ProfileKernelPrivacyRow = {
  key: string;
  title: string;
  description: string;
  route?: string;
  badge?: string;
};


export type ProfileKernelEntityRecord = Record<string, unknown>;

export type ProfileKernelEntityCollectionState<T extends ProfileKernelEntityRecord = ProfileKernelEntityRecord> = {
  items: T[];
  selectedId: string | null;
};

export type ProfileKernelEntityCounts = {
  likesCount: number;
  giftsCount: number;
  mediaCount: number;
  photoCount: number;
  shortVideoCount: number;
  linksCount: number;
  voiceCount: number;
  reactionCount: number;
};

export type ProfileKernelState = {
  privacyDetailConfigs: PrivacyDetailConfig[];
  runtimeStatus: ProfileKernelRuntimeStatus;
  isReady: boolean;
  lastError: string | null;
  session: ProfileKernelSessionSnapshot;
  account: UnifiedAccountProfileSnapshot;
  publicProfile: PublicProfileDraft;
  completeDraft: ProfileCompleteDraft;
  avatarUri: string | null;
  coverUri: string | null;
  photos: ProfileMediaItem[];
  shortVideos: ProfileMediaItem[];
  links: ProfileLinkItem[];
  reactionCounts: Record<string, number>;
  voiceNotes: ProfileVoiceNoteItem[];
  likesCount: number;
  giftsCount: number;
  groupPreview: GroupProfilePreview;
  channelPreview: ChannelProfilePreview;
  botPreview: BotProfilePreview;
  groupProfiles: ProfileKernelEntityCollectionState;
  channelProfiles: ProfileKernelEntityCollectionState;
  botProfiles: ProfileKernelEntityCollectionState;
  qr: ProfileKernelQrState;
  security: ProfileKernelSecurityState;
  emailChange: ProfileKernelEmailChangeState;
  phoneChange: ProfileKernelPhoneChangeState;
  trustedList: ProfilePersonRule[];
  blockedList: ProfilePersonRule[];
  preferences: ProfileKernelPreferencesState;
  languageCode: string;
  devices: ProfileKernelDevicesState;
  autoDelete: ProfileKernelAutoDeleteState;
  privacySecurityRows: ProfileKernelPrivacyRow[];
  privacyVisibilityRows: ProfileKernelPrivacyRow[];
};

export type ProfileKernelStoreListener = (state: ProfileKernelState) => void;

export const EMPTY_PROFILE_KERNEL_SESSION: ProfileKernelSessionSnapshot = {
  apiBaseUrl: null,
  accessToken: null,
  currentUserId: null,
  phone: null,
  email: null,
  locale: null,
  timezone: null,
  headers: {},
  query: {},
};

export const EMPTY_UNIFIED_ACCOUNT_PROFILE: UnifiedAccountProfileSnapshot = {
  userId: "",
  sabiDisplayId: "",
  phone: "",
  email: "",
  firstName: "",
  lastName: "",
  username: "",
  fullName: "",
  bio: "",
  subtitle: "",
  birthday: "",
  avatarUri: null,
  coverUri: null,
  avatarLetter: "",
  verificationStatus: "unverified",
  profileCompleted: false,
  createdAt: null,
  updatedAt: null,
  raw: null,
};

export const EMPTY_PUBLIC_PROFILE_DRAFT: PublicProfileDraft = {
  publicName: "",
  publicUsername: "",
  publicBio: "",
  publicSubtitle: "",
};

export const EMPTY_PROFILE_COMPLETE_DRAFT: ProfileCompleteDraft = {
  firstName: "",
  lastName: "",
  username: "",
  phone: "",
  userId: "",
};

export const EMPTY_GROUP_PROFILE_PREVIEW: GroupProfilePreview = {
  created: false,
  groupId: "",
  groupName: "",
  username: "",
  isPublic: false,
  isPublished: false,
  ownerUserId: "",
  linkedPublicationId: "",
  linkedChatId: "",
};

export const EMPTY_CHANNEL_PROFILE_PREVIEW: ChannelProfilePreview = {
  created: false,
  channelId: "",
  channelName: "",
  username: "",
  isPublic: false,
  isPublished: false,
  ownerUserId: "",
  linkedPublicationId: "",
  linkedChatId: "",
};

export const EMPTY_BOT_PROFILE_PREVIEW: BotProfilePreview = {
  created: false,
  botId: "",
  botName: "",
  username: "",
  botKind: "",
  isPublic: false,
  isPublished: false,
  ownerUserId: "",
  linkedChatId: "",
};

export const EMPTY_PROFILE_ENTITY_COLLECTION: ProfileKernelEntityCollectionState = {
  items: [],
  selectedId: null,
};

export const EMPTY_PROFILE_QR_STATE: ProfileKernelQrState = {
  profileCode: "",
  allowProfileQrScan: true,
  allowQrShare: true,
};

export const EMPTY_PROFILE_SECURITY_STATE: ProfileKernelSecurityState = {
  biometricEnabled: false,
  appPinEnabled: false,
  twoFactorEnabled: false,
  trustedDeviceAlerts: true,
  suspiciousLoginAlerts: true,
  sensitiveActionConfirmation: true,
  faceIdForPhoneChange: false,
  faceIdForEmailChange: false,
  fallbackPinEnabled: false,
};

export const EMPTY_PROFILE_EMAIL_CHANGE_STATE: ProfileKernelEmailChangeState = {
  currentEmail: "",
  requiresCurrentEmailVerification: true,
  requiresNewEmailVerification: true,
};

export const EMPTY_PROFILE_PHONE_CHANGE_STATE: ProfileKernelPhoneChangeState = {
  currentPhone: "",
  requiresOldPhoneVerification: true,
  requiresNewPhoneVerification: true,
};

export const EMPTY_PROFILE_PREFERENCES_STATE: ProfileKernelPreferencesState = {
  hapticsEnabled: true,
  soundEnabled: true,
  previewEnabled: true,
  compactMode: false,
  smartInsightsEnabled: true,
};

export const EMPTY_PROFILE_DEVICES_STATE: ProfileKernelDevicesState = {
  sessionTimeout: "1 year",
  sessions: [],
};

export const EMPTY_PROFILE_AUTO_DELETE_STATE: ProfileKernelAutoDeleteState = {
  selectedPreset: "30_days",
  applyToNewChats: true,
  applyToGroups: false,
  applyToChannels: false,
};

export const DEFAULT_PROFILE_KERNEL_STATE: ProfileKernelState = {
  runtimeStatus: "idle",
  isReady: false,
  lastError: null,
  session: EMPTY_PROFILE_KERNEL_SESSION,
  account: EMPTY_UNIFIED_ACCOUNT_PROFILE,
  publicProfile: EMPTY_PUBLIC_PROFILE_DRAFT,
  completeDraft: EMPTY_PROFILE_COMPLETE_DRAFT,
  avatarUri: null,
  coverUri: null,
  photos: [],
  shortVideos: [],
  links: [],
  reactionCounts: {},
  voiceNotes: [],
  likesCount: 0,
  giftsCount: 0,
  groupPreview: EMPTY_GROUP_PROFILE_PREVIEW,
  channelPreview: EMPTY_CHANNEL_PROFILE_PREVIEW,
  botPreview: EMPTY_BOT_PROFILE_PREVIEW,
  groupProfiles: EMPTY_PROFILE_ENTITY_COLLECTION,
  channelProfiles: EMPTY_PROFILE_ENTITY_COLLECTION,
  botProfiles: EMPTY_PROFILE_ENTITY_COLLECTION,
  qr: EMPTY_PROFILE_QR_STATE,
  security: EMPTY_PROFILE_SECURITY_STATE,
  emailChange: EMPTY_PROFILE_EMAIL_CHANGE_STATE,
  phoneChange: EMPTY_PROFILE_PHONE_CHANGE_STATE,
  trustedList: [],
  blockedList: [],
  preferences: EMPTY_PROFILE_PREFERENCES_STATE,
  languageCode: "en",
  devices: EMPTY_PROFILE_DEVICES_STATE,
  autoDelete: EMPTY_PROFILE_AUTO_DELETE_STATE,
  privacySecurityRows: [],
  privacyVisibilityRows: [],
  privacyDetailConfigs: [],
};
