import { getProfileKernelState, subscribeProfileKernelStore } from "./core/store";
import {
  selectProfileKernelAccount,
  selectProfileKernelAutoDelete,
  selectProfileKernelAvatarUri,
  selectProfileKernelBlockedList,
  selectProfileKernelBotProfiles,
  selectProfileKernelChannelProfiles,
  selectProfileKernelGroupProfiles,
  selectProfileKernelBotPreview,
  selectProfileKernelChannelPreview,
  selectProfileKernelCompleteDraft,
  selectProfileKernelCounts,
  selectProfileKernelCoverUri,
  selectProfileKernelDevices,
  selectProfileKernelEmailChange,
  selectProfileKernelGiftsCount,
  selectProfileKernelGroupPreview,
  selectProfileKernelIsReady,
  selectProfileKernelLanguageCode,
  selectProfileKernelLastError,
  selectProfileKernelLikesCount,
  selectProfileKernelLinks,
  selectProfileKernelPhoneChange,
  selectProfileKernelPhotos,
  selectProfileKernelPreferences,
  selectProfileKernelPrivacyDetailConfig,
  selectProfileKernelPrivacyDetailConfigs,
  selectProfileKernelPrivacySecurityRows,
  selectProfileKernelPrivacyVisibilityRows,
  selectProfileKernelPublicProfile,
  selectProfileKernelQr,
  selectProfileKernelReactionCounts,
  selectProfileKernelRuntimeStatus,
  selectProfileKernelSecurity,
  selectProfileKernelSession,
  selectProfileKernelShortVideos,
  selectProfileKernelTrustedList,
  selectProfileKernelVoiceNotes,
} from "./core/selectors";
import { createProfileKernelRuntime } from "./runtime/service";
import type { ProfileKernelRuntimeConfig } from "./runtime/types";
import { configureProfileKernelSession, resetProfileKernelSession, resolveProfileKernelSession } from "./session/service";
import type { ProfileKernelSessionConfig, ProfileKernelSessionSnapshot } from "./session/types";

const runtime = createProfileKernelRuntime();
let booted = false;
let bootedSessionKey: string | null = null;

async function bindProfileSession() {
  const session = await resolveProfileKernelSession();
  runtime.bindSession(session);
  return session;
}

function getProfileSessionKey(session: ProfileKernelSessionSnapshot) {
  return [
    session.apiBaseUrl ?? "",
    session.accessToken ?? "",
    session.currentUserId ?? "",
    session.phone ?? "",
    session.email ?? "",
    session.locale ?? "",
  ].join("|");
}

export async function bootProfileKernel() {
  const session = await resolveProfileKernelSession();
  const nextSessionKey = getProfileSessionKey(session);

  if (booted && bootedSessionKey === nextSessionKey) {
    return profileKernelFacade;
  }

  runtime.bindSession(session);
  await runtime.hydrate();
  booted = true;
  bootedSessionKey = nextSessionKey;
  return profileKernelFacade;
}

export async function shutdownProfileKernel() {
  booted = false;
  bootedSessionKey = null;
  return getProfileKernelState();
}

export function configureProfileRuntime(config: ProfileKernelRuntimeConfig) {
  runtime.configure(config);
}

export function configureProfileSession(config: ProfileKernelSessionConfig) {
  configureProfileKernelSession(config);
}

export function resetProfileKernelFacade() {
  booted = false;
  bootedSessionKey = null;
  resetProfileKernelSession();
}

export const profileKernelFacade = {
  subscribe(listener: Parameters<typeof subscribeProfileKernelStore>[0]) {
    return subscribeProfileKernelStore(listener);
  },
  getState() {
    return getProfileKernelState();
  },
  async boot() {
    return bootProfileKernel();
  },
  async shutdown() {
    return shutdownProfileKernel();
  },
  async refresh() {
    await bindProfileSession();
    return runtime.refresh();
  },
  async updateProfile(payload: Parameters<typeof runtime.updateProfile>[0]) { return runtime.updateProfile(payload); },
  async updatePublicProfile(payload: Parameters<typeof runtime.updatePublicProfile>[0]) { return runtime.updatePublicProfile(payload); },
  async updateDraft(payload: Parameters<typeof runtime.updateDraft>[0]) { return runtime.updateDraft(payload); },
  async clearDraft() { return runtime.clearDraft(); },
  async setAvatar(uri: string | null) { return runtime.setAvatar(uri); },
  async setCover(uri: string | null) { return runtime.setCover(uri); },
  async addPhoto(item: Parameters<typeof runtime.addPhoto>[0]) { return runtime.addPhoto(item); },
  async updatePhotoEdit(photoId: string, edit: Parameters<typeof runtime.updatePhotoEdit>[1]) { return runtime.updatePhotoEdit(photoId, edit); },
  async removePhoto(photoId: string) { return runtime.removePhoto(photoId); },
  async addShortVideo(item: Parameters<typeof runtime.addShortVideo>[0]) { return runtime.addShortVideo(item); },
  async removeShortVideo(videoId: string) { return runtime.removeShortVideo(videoId); },
  async addLink(url: string, label?: string) { return runtime.addLink(url, label); },
  async removeLink(linkId: string) { return runtime.removeLink(linkId); },
  async addReaction(emoji: string, amount = 1) { return runtime.addReaction(emoji, amount); },
  async setReactionCount(emoji: string, value: number) { return runtime.setReactionCount(emoji, value); },
  async addVoiceNote(note: Parameters<typeof runtime.addVoiceNote>[0]) { return runtime.addVoiceNote(note); },
  async removeVoiceNote(noteId: string) { return runtime.removeVoiceNote(noteId); },
  async setLikesCount(value: number) { return runtime.setLikesCount(value); },
  async setGiftsCount(value: number) { return runtime.setGiftsCount(value); },
  async saveGroupPreview(payload: Parameters<typeof runtime.saveGroupPreview>[0]) { return runtime.saveGroupPreview(payload); },
  async saveChannelPreview(payload: Parameters<typeof runtime.saveChannelPreview>[0]) { return runtime.saveChannelPreview(payload); },
  async saveBotPreview(payload: Parameters<typeof runtime.saveBotPreview>[0]) { return runtime.saveBotPreview(payload); },
  async saveGroupProfiles(payload: Parameters<typeof runtime.saveGroupProfiles>[0]) { return runtime.saveGroupProfiles(payload); },
  async saveChannelProfiles(payload: Parameters<typeof runtime.saveChannelProfiles>[0]) { return runtime.saveChannelProfiles(payload); },
  async saveBotProfiles(payload: Parameters<typeof runtime.saveBotProfiles>[0]) { return runtime.saveBotProfiles(payload); },
  async updateQr(payload: Parameters<typeof runtime.updateQr>[0]) { return runtime.updateQr(payload); },
  async updateSecurity(payload: Parameters<typeof runtime.updateSecurity>[0]) { return runtime.updateSecurity(payload); },
  async updateEmailChange(payload: Parameters<typeof runtime.updateEmailChange>[0]) { return runtime.updateEmailChange(payload); },
  async updatePhoneChange(payload: Parameters<typeof runtime.updatePhoneChange>[0]) { return runtime.updatePhoneChange(payload); },
  async setTrustedList(payload: Parameters<typeof runtime.setTrustedList>[0]) { return runtime.setTrustedList(payload); },
  async setBlockedList(payload: Parameters<typeof runtime.setBlockedList>[0]) { return runtime.setBlockedList(payload); },
  async moveTrustedToBlocked(personId: string) { return runtime.moveTrustedToBlocked(personId); },
  async restoreBlockedToTrusted(personId: string) { return runtime.restoreBlockedToTrusted(personId); },
  async removeBlockedPerson(personId: string) { return runtime.removeBlockedPerson(personId); },
  async updatePreferences(payload: Parameters<typeof runtime.updatePreferences>[0]) { return runtime.updatePreferences(payload); },
  async updateLanguageCode(code: string) { return runtime.updateLanguageCode(code); },
  async setDevices(payload: Parameters<typeof runtime.setDevices>[0]) { return runtime.setDevices(payload); },
  async revokeDeviceSession(id: string) { return runtime.revokeDeviceSession(id); },
  async endAllOtherSessions() { return runtime.endAllOtherSessions(); },
  async updateSessionTimeout(value: string) { return runtime.updateSessionTimeout(value); },
  async updateAutoDelete(payload: Parameters<typeof runtime.updateAutoDelete>[0]) { return runtime.updateAutoDelete(payload); },
  async signOut() { return runtime.signOut(); },
  async deleteAccount() { return runtime.deleteAccount(); },
  selectors: {
    runtimeStatus: () => selectProfileKernelRuntimeStatus(getProfileKernelState()),
    isReady: () => selectProfileKernelIsReady(getProfileKernelState()),
    lastError: () => selectProfileKernelLastError(getProfileKernelState()),
    session: () => selectProfileKernelSession(getProfileKernelState()),
    account: () => selectProfileKernelAccount(getProfileKernelState()),
    publicProfile: () => selectProfileKernelPublicProfile(getProfileKernelState()),
    completeDraft: () => selectProfileKernelCompleteDraft(getProfileKernelState()),
    avatarUri: () => selectProfileKernelAvatarUri(getProfileKernelState()),
    coverUri: () => selectProfileKernelCoverUri(getProfileKernelState()),
    photos: () => selectProfileKernelPhotos(getProfileKernelState()),
    shortVideos: () => selectProfileKernelShortVideos(getProfileKernelState()),
    links: () => selectProfileKernelLinks(getProfileKernelState()),
    reactionCounts: () => selectProfileKernelReactionCounts(getProfileKernelState()),
    voiceNotes: () => selectProfileKernelVoiceNotes(getProfileKernelState()),
    likesCount: () => selectProfileKernelLikesCount(getProfileKernelState()),
    giftsCount: () => selectProfileKernelGiftsCount(getProfileKernelState()),
    groupPreview: () => selectProfileKernelGroupPreview(getProfileKernelState()),
    channelPreview: () => selectProfileKernelChannelPreview(getProfileKernelState()),
    botPreview: () => selectProfileKernelBotPreview(getProfileKernelState()),
    groupProfiles: () => selectProfileKernelGroupProfiles(getProfileKernelState()),
    channelProfiles: () => selectProfileKernelChannelProfiles(getProfileKernelState()),
    botProfiles: () => selectProfileKernelBotProfiles(getProfileKernelState()),
    qr: () => selectProfileKernelQr(getProfileKernelState()),
    security: () => selectProfileKernelSecurity(getProfileKernelState()),
    emailChange: () => selectProfileKernelEmailChange(getProfileKernelState()),
    phoneChange: () => selectProfileKernelPhoneChange(getProfileKernelState()),
    trustedList: () => selectProfileKernelTrustedList(getProfileKernelState()),
    blockedList: () => selectProfileKernelBlockedList(getProfileKernelState()),
    preferences: () => selectProfileKernelPreferences(getProfileKernelState()),
    languageCode: () => selectProfileKernelLanguageCode(getProfileKernelState()),
    devices: () => selectProfileKernelDevices(getProfileKernelState()),
    autoDelete: () => selectProfileKernelAutoDelete(getProfileKernelState()),
    privacySecurityRows: () => selectProfileKernelPrivacySecurityRows(getProfileKernelState()),
    privacyVisibilityRows: () => selectProfileKernelPrivacyVisibilityRows(getProfileKernelState()),
    privacyDetailConfigs: () => selectProfileKernelPrivacyDetailConfigs(getProfileKernelState()),
    privacyDetailConfig: (slug?: string | string[] | null) => selectProfileKernelPrivacyDetailConfig(getProfileKernelState(), slug),
    counts: () => selectProfileKernelCounts(getProfileKernelState()),
  },
};
