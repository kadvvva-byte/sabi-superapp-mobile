import type { ProfileKernelState } from "./types";

export const selectProfileKernelRuntimeStatus = (state: ProfileKernelState) => state.runtimeStatus;
export const selectProfileKernelIsReady = (state: ProfileKernelState) => state.isReady;
export const selectProfileKernelLastError = (state: ProfileKernelState) => state.lastError;
export const selectProfileKernelSession = (state: ProfileKernelState) => state.session;
export const selectProfileKernelAccount = (state: ProfileKernelState) => state.account;
export const selectProfileKernelPublicProfile = (state: ProfileKernelState) => state.publicProfile;
export const selectProfileKernelCompleteDraft = (state: ProfileKernelState) => state.completeDraft;
export const selectProfileKernelAvatarUri = (state: ProfileKernelState) => state.avatarUri;
export const selectProfileKernelCoverUri = (state: ProfileKernelState) => state.coverUri;
export const selectProfileKernelPhotos = (state: ProfileKernelState) => state.photos;
export const selectProfileKernelShortVideos = (state: ProfileKernelState) => state.shortVideos;
export const selectProfileKernelLinks = (state: ProfileKernelState) => state.links;
export const selectProfileKernelReactionCounts = (state: ProfileKernelState) => state.reactionCounts;
export const selectProfileKernelVoiceNotes = (state: ProfileKernelState) => state.voiceNotes;
export const selectProfileKernelLikesCount = (state: ProfileKernelState) => state.likesCount;
export const selectProfileKernelGiftsCount = (state: ProfileKernelState) => state.giftsCount;
export const selectProfileKernelGroupPreview = (state: ProfileKernelState) => state.groupPreview;
export const selectProfileKernelChannelPreview = (state: ProfileKernelState) => state.channelPreview;
export const selectProfileKernelBotPreview = (state: ProfileKernelState) => state.botPreview;
export const selectProfileKernelGroupProfiles = (state: ProfileKernelState) => state.groupProfiles;
export const selectProfileKernelChannelProfiles = (state: ProfileKernelState) => state.channelProfiles;
export const selectProfileKernelBotProfiles = (state: ProfileKernelState) => state.botProfiles;
export const selectProfileKernelQr = (state: ProfileKernelState) => state.qr;
export const selectProfileKernelSecurity = (state: ProfileKernelState) => state.security;
export const selectProfileKernelEmailChange = (state: ProfileKernelState) => state.emailChange;
export const selectProfileKernelPhoneChange = (state: ProfileKernelState) => state.phoneChange;
export const selectProfileKernelTrustedList = (state: ProfileKernelState) => state.trustedList;
export const selectProfileKernelBlockedList = (state: ProfileKernelState) => state.blockedList;
export const selectProfileKernelPreferences = (state: ProfileKernelState) => state.preferences;
export const selectProfileKernelLanguageCode = (state: ProfileKernelState) => state.languageCode;
export const selectProfileKernelDevices = (state: ProfileKernelState) => state.devices;
export const selectProfileKernelAutoDelete = (state: ProfileKernelState) => state.autoDelete;
export const selectProfileKernelPrivacySecurityRows = (state: ProfileKernelState) => state.privacySecurityRows;
export const selectProfileKernelPrivacyVisibilityRows = (state: ProfileKernelState) => state.privacyVisibilityRows;
export const selectProfileKernelPrivacyDetailConfigs = (state: ProfileKernelState) => state.privacyDetailConfigs;
export function selectProfileKernelPrivacyDetailConfig(state: ProfileKernelState, slug?: string | string[] | null) {
  const normalized = Array.isArray(slug) ? String(slug[0] || "").trim() : String(slug || "").trim();
  if (!normalized) return null;
  return state.privacyDetailConfigs.find((item) => String(item.slug || "").trim() === normalized) ?? null;
}

export function selectProfileKernelCounts(state: ProfileKernelState) {
  const photoCount = state.photos.length;
  const shortVideoCount = state.shortVideos.length;
  const linksCount = state.links.length;
  const voiceCount = state.voiceNotes.length;
  const reactionCount = Object.values(state.reactionCounts).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  return {
    likesCount: state.likesCount,
    giftsCount: state.giftsCount,
    mediaCount: photoCount + shortVideoCount + linksCount + voiceCount,
    photoCount,
    shortVideoCount,
    linksCount,
    voiceCount,
    reactionCount,
  };
}
