import type {
  BotProfilePreview,
  ChannelProfilePreview,
  GroupProfilePreview,
  ProfileCompleteDraft,
  ProfileKernelAutoDeleteState,
  ProfileKernelDevicesState,
  ProfileKernelEmailChangeState,
  ProfileKernelPhoneChangeState,
  ProfileKernelPreferencesState,
  ProfileKernelPrivacyRow,
  ProfileKernelQrState,
  ProfileKernelSecurityState,
  ProfileLinkItem,
  ProfileMediaItem,
  ProfilePersonRule,
  ProfileVoiceNoteItem,
  PublicProfileDraft,
  UnifiedAccountProfileSnapshot,
} from "../core/types";
import type { PrivacyDetailConfig } from "../../../../modules/profile/data/privacy";

export type ProfileKernelStorageAdapter = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  multiRemove?(keys: string[]): Promise<void>;
};

export type ProfileKernelRuntimeExternalSnapshot = Partial<{
  account: Partial<UnifiedAccountProfileSnapshot> | null;
  publicProfile: Partial<PublicProfileDraft> | null;
  completeDraft: Partial<ProfileCompleteDraft> | null;
  avatarUri: string | null;
  coverUri: string | null;
  photos: ProfileMediaItem[];
  shortVideos: ProfileMediaItem[];
  links: ProfileLinkItem[];
  reactionCounts: Record<string, number>;
  voiceNotes: ProfileVoiceNoteItem[];
  likesCount: number;
  giftsCount: number;
  groupPreview: Partial<GroupProfilePreview> | null;
  channelPreview: Partial<ChannelProfilePreview> | null;
  botPreview: Partial<BotProfilePreview> | null;
  groupProfiles: { items: Record<string, unknown>[]; selectedId: string | null } | null;
  channelProfiles: { items: Record<string, unknown>[]; selectedId: string | null } | null;
  botProfiles: { items: Record<string, unknown>[]; selectedId: string | null } | null;
  qr: Partial<ProfileKernelQrState> | null;
  security: Partial<ProfileKernelSecurityState> | null;
  emailChange: Partial<ProfileKernelEmailChangeState> | null;
  phoneChange: Partial<ProfileKernelPhoneChangeState> | null;
  trustedList: ProfilePersonRule[];
  blockedList: ProfilePersonRule[];
  preferences: Partial<ProfileKernelPreferencesState> | null;
  languageCode: string | null;
  devices: Partial<ProfileKernelDevicesState> | null;
  autoDelete: Partial<ProfileKernelAutoDeleteState> | null;
  privacySecurityRows: ProfileKernelPrivacyRow[];
  privacyVisibilityRows: ProfileKernelPrivacyRow[];
  privacyDetailConfigs: PrivacyDetailConfig[];
}>;

export type ProfileKernelRuntimeConfig = {
  storage?: ProfileKernelStorageAdapter;
  loadExternalSnapshot?: () =>
    | ProfileKernelRuntimeExternalSnapshot
    | null
    | undefined
    | Promise<ProfileKernelRuntimeExternalSnapshot | null | undefined>;
  saveExternalSnapshot?: (snapshot: ProfileKernelRuntimeExternalSnapshot) =>
    | Promise<void>
    | void;
  onSignOut?: () => Promise<void> | void;
  onDeleteAccount?: () => Promise<void> | void;
};
