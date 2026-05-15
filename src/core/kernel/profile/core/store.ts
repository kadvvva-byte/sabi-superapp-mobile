import type { ProfileKernelSessionSnapshot } from "../session/types";
import type { PrivacyDetailConfig } from "../../../../modules/profile/data/privacy";
import {
  DEFAULT_PROFILE_KERNEL_STATE,
  EMPTY_BOT_PROFILE_PREVIEW,
  EMPTY_CHANNEL_PROFILE_PREVIEW,
  EMPTY_GROUP_PROFILE_PREVIEW,
  EMPTY_PROFILE_COMPLETE_DRAFT,
  EMPTY_PROFILE_ENTITY_COLLECTION,
  EMPTY_PROFILE_EMAIL_CHANGE_STATE,
  EMPTY_PROFILE_PHONE_CHANGE_STATE,
  EMPTY_PROFILE_AUTO_DELETE_STATE,
  EMPTY_PROFILE_DEVICES_STATE,
  EMPTY_PROFILE_PREFERENCES_STATE,
  EMPTY_PROFILE_QR_STATE,
  EMPTY_PUBLIC_PROFILE_DRAFT,
  type BotProfilePreview,
  type ChannelProfilePreview,
  type GroupProfilePreview,
  type ProfileCompleteDraft,
  type ProfileKernelEntityCollectionState,
  type ProfileKernelAutoDeleteState,
  type ProfileKernelDevicesState,
  type ProfileKernelEmailChangeState,
  type ProfileKernelPhoneChangeState,
  type ProfileKernelPreferencesState,
  type ProfileKernelQrState,
  type ProfileKernelSecurityState,
  type ProfileKernelRuntimeStatus,
  type ProfileKernelState,
  type ProfileKernelStoreListener,
  type ProfileLinkItem,
  type ProfileMediaItem,
  type ProfileVoiceNoteItem,
  type ProfilePersonRule,
  type ProfileKernelPrivacyRow,
  type PublicProfileDraft,
  type UnifiedAccountProfileSnapshot,
} from "./types";

let state: ProfileKernelState = { ...DEFAULT_PROFILE_KERNEL_STATE };
const listeners = new Set<ProfileKernelStoreListener>();

function areStringRecordsEqual(
  left: Record<string, string> | null | undefined,
  right: Record<string, string> | null | undefined,
) {
  const leftEntries = Object.entries(left ?? {}).sort(([a], [b]) => a.localeCompare(b));
  const rightEntries = Object.entries(right ?? {}).sort(([a], [b]) => a.localeCompare(b));

  if (leftEntries.length !== rightEntries.length) return false;

  return leftEntries.every(([key, value], index) => {
    const [rightKey, rightValue] = rightEntries[index] ?? [];
    return key === rightKey && value === rightValue;
  });
}

function areProfileSessionsEqual(
  left: ProfileKernelSessionSnapshot,
  right: ProfileKernelSessionSnapshot,
) {
  return (
    left.apiBaseUrl === right.apiBaseUrl &&
    left.accessToken === right.accessToken &&
    left.currentUserId === right.currentUserId &&
    left.phone === right.phone &&
    left.email === right.email &&
    left.locale === right.locale &&
    left.timezone === right.timezone &&
    areStringRecordsEqual(left.headers, right.headers) &&
    areStringRecordsEqual(left.query, right.query)
  );
}

function areTopLevelStateFieldsEqual(
  left: ProfileKernelState,
  right: ProfileKernelState,
) {
  const leftKeys = Object.keys(left) as Array<keyof ProfileKernelState>;
  const rightKeys = Object.keys(right) as Array<keyof ProfileKernelState>;

  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every((key) => Object.is(left[key], right[key]));
}

function emitChange() {
  const snapshot = state;
  Array.from(listeners).forEach((listener) => listener(snapshot));
}

function replaceState(nextState: ProfileKernelState) {
  if (nextState === state || areTopLevelStateFieldsEqual(state, nextState)) {
    return state;
  }

  state = nextState;
  emitChange();
  return state;
}

export function getProfileKernelState(): ProfileKernelState {
  return state;
}

export function subscribeProfileKernelStore(listener: ProfileKernelStoreListener) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

export function resetProfileKernelStore() {
  return replaceState({ ...DEFAULT_PROFILE_KERNEL_STATE });
}

export function setProfileKernelState(updater: Partial<ProfileKernelState> | ((current: ProfileKernelState) => ProfileKernelState)) {
  const nextState = typeof updater === "function" ? updater(state) : ({ ...state, ...updater } as ProfileKernelState);
  return replaceState(nextState);
}

export function bindProfileKernelSession(session: ProfileKernelSessionSnapshot) {
  return setProfileKernelState((current) => {
    if (areProfileSessionsEqual(current.session, session)) {
      return current;
    }

    return { ...current, session };
  });
}

export function setProfileKernelRuntimeStatus(status: ProfileKernelRuntimeStatus) {
  return setProfileKernelState((current) => ({ ...current, runtimeStatus: status, isReady: status === "ready" ? true : current.isReady }));
}

export function setProfileKernelReady(value: boolean) { return setProfileKernelState((current) => ({ ...current, isReady: value })); }
export function setProfileKernelLastError(message: string | null) { return setProfileKernelState((current) => ({ ...current, lastError: message, runtimeStatus: message ? "error" : current.runtimeStatus })); }
export function setProfileKernelAccount(account: UnifiedAccountProfileSnapshot) {
  return setProfileKernelState((current) => {
    const previousUserId = String(current.account?.userId ?? "").trim();
    const nextUserId = String(account.userId ?? "").trim();
    const sameUser = !previousUserId || !nextUserId || previousUserId === nextUserId;

    return {
      ...current,
      account,
      avatarUri: sameUser ? current.avatarUri ?? account.avatarUri ?? null : account.avatarUri ?? null,
      coverUri: sameUser ? current.coverUri ?? account.coverUri ?? null : account.coverUri ?? null,
    };
  });
}
export function setProfileKernelPublicProfile(publicProfile: PublicProfileDraft) { return setProfileKernelState((current) => ({ ...current, publicProfile })); }
export function setProfileKernelCompleteDraft(completeDraft: ProfileCompleteDraft) { return setProfileKernelState((current) => ({ ...current, completeDraft })); }
export function clearProfileKernelCompleteDraft() { return setProfileKernelCompleteDraft({ ...EMPTY_PROFILE_COMPLETE_DRAFT }); }
export function setProfileKernelAvatar(uri: string | null) { return setProfileKernelState((current) => ({ ...current, avatarUri: uri })); }
export function setProfileKernelCover(uri: string | null) { return setProfileKernelState((current) => ({ ...current, coverUri: uri })); }
export function setProfileKernelPhotos(photos: ProfileMediaItem[]) { return setProfileKernelState((current) => ({ ...current, photos: [...photos].sort((a,b)=>b.createdAt-a.createdAt) })); }
export function addProfileKernelPhoto(photo: ProfileMediaItem) { return setProfileKernelState((current) => ({ ...current, photos: [photo, ...current.photos.filter((item)=>item.id!==photo.id)].sort((a,b)=>b.createdAt-a.createdAt) })); }
export function removeProfileKernelPhoto(photoId: string) { return setProfileKernelState((current) => ({ ...current, photos: current.photos.filter((item)=>item.id!==photoId) })); }
export function updateProfileKernelPhoto(photo: ProfileMediaItem) { return addProfileKernelPhoto(photo); }
export function setProfileKernelShortVideos(shortVideos: ProfileMediaItem[]) { return setProfileKernelState((current) => ({ ...current, shortVideos: [...shortVideos].sort((a,b)=>b.createdAt-a.createdAt) })); }
export function addProfileKernelShortVideo(video: ProfileMediaItem) { return setProfileKernelState((current) => ({ ...current, shortVideos: [video, ...current.shortVideos.filter((item)=>item.id!==video.id)].sort((a,b)=>b.createdAt-a.createdAt) })); }
export function removeProfileKernelShortVideo(videoId: string) { return setProfileKernelState((current) => ({ ...current, shortVideos: current.shortVideos.filter((item)=>item.id!==videoId) })); }
export function setProfileKernelLinks(links: ProfileLinkItem[]) { return setProfileKernelState((current) => ({ ...current, links: [...links].sort((a,b)=>b.createdAt-a.createdAt) })); }
export function addProfileKernelLink(link: ProfileLinkItem) { return setProfileKernelState((current) => ({ ...current, links: [link, ...current.links.filter((item)=>item.id!==link.id)].sort((a,b)=>b.createdAt-a.createdAt) })); }
export function removeProfileKernelLink(linkId: string) { return setProfileKernelState((current) => ({ ...current, links: current.links.filter((item)=>item.id!==linkId) })); }
export function setProfileKernelReactionCounts(reactionCounts: Record<string, number>) { return setProfileKernelState((current) => ({ ...current, reactionCounts })); }
export function incrementProfileKernelReaction(emoji: string, amount = 1) { return setProfileKernelState((current) => ({ ...current, reactionCounts: { ...current.reactionCounts, [emoji]: Math.max(0, (current.reactionCounts[emoji] || 0) + amount) } })); }
export function setProfileKernelVoiceNotes(voiceNotes: ProfileVoiceNoteItem[]) { return setProfileKernelState((current) => ({ ...current, voiceNotes: [...voiceNotes].sort((a,b)=>b.createdAt-a.createdAt) })); }
export function addProfileKernelVoiceNote(note: ProfileVoiceNoteItem) { return setProfileKernelState((current) => ({ ...current, voiceNotes: [note, ...current.voiceNotes.filter((item)=>item.id!==note.id)].sort((a,b)=>b.createdAt-a.createdAt) })); }
export function removeProfileKernelVoiceNote(noteId: string) { return setProfileKernelState((current) => ({ ...current, voiceNotes: current.voiceNotes.filter((item)=>item.id!==noteId) })); }
export function setProfileKernelLikesCount(value: number) { return setProfileKernelState((current) => ({ ...current, likesCount: Math.max(0, Number(value)||0) })); }
export function setProfileKernelGiftsCount(value: number) { return setProfileKernelState((current) => ({ ...current, giftsCount: Math.max(0, Number(value)||0) })); }
export function setProfileKernelGroupPreview(groupPreview: GroupProfilePreview) { return setProfileKernelState((current) => ({ ...current, groupPreview })); }
export function clearProfileKernelGroupPreview() { return setProfileKernelGroupPreview({ ...EMPTY_GROUP_PROFILE_PREVIEW }); }
export function setProfileKernelChannelPreview(channelPreview: ChannelProfilePreview) { return setProfileKernelState((current) => ({ ...current, channelPreview })); }
export function clearProfileKernelChannelPreview() { return setProfileKernelChannelPreview({ ...EMPTY_CHANNEL_PROFILE_PREVIEW }); }
export function setProfileKernelBotPreview(botPreview: BotProfilePreview) { return setProfileKernelState((current) => ({ ...current, botPreview })); }
export function clearProfileKernelBotPreview() { return setProfileKernelBotPreview({ ...EMPTY_BOT_PROFILE_PREVIEW }); }
export function setProfileKernelGroupProfiles(groupProfiles: ProfileKernelEntityCollectionState) { return setProfileKernelState((current) => ({ ...current, groupProfiles })); }
export function clearProfileKernelGroupProfiles() { return setProfileKernelGroupProfiles({ ...EMPTY_PROFILE_ENTITY_COLLECTION }); }
export function setProfileKernelChannelProfiles(channelProfiles: ProfileKernelEntityCollectionState) { return setProfileKernelState((current) => ({ ...current, channelProfiles })); }
export function clearProfileKernelChannelProfiles() { return setProfileKernelChannelProfiles({ ...EMPTY_PROFILE_ENTITY_COLLECTION }); }
export function setProfileKernelBotProfiles(botProfiles: ProfileKernelEntityCollectionState) { return setProfileKernelState((current) => ({ ...current, botProfiles })); }
export function clearProfileKernelBotProfiles() { return setProfileKernelBotProfiles({ ...EMPTY_PROFILE_ENTITY_COLLECTION }); }
export function setProfileKernelQr(qr: ProfileKernelQrState) { return setProfileKernelState((current) => ({ ...current, qr })); }
export function clearProfileKernelQr() { return setProfileKernelQr({ ...EMPTY_PROFILE_QR_STATE }); }
export function setProfileKernelSecurity(security: ProfileKernelSecurityState) { return setProfileKernelState((current) => ({ ...current, security })); }
export function setProfileKernelEmailChange(emailChange: ProfileKernelEmailChangeState) { return setProfileKernelState((current) => ({ ...current, emailChange })); }
export function setProfileKernelPhoneChange(phoneChange: ProfileKernelPhoneChangeState) { return setProfileKernelState((current) => ({ ...current, phoneChange })); }
export function setProfileKernelTrustedList(trustedList: ProfilePersonRule[]) { return setProfileKernelState((current) => ({ ...current, trustedList })); }
export function setProfileKernelBlockedList(blockedList: ProfilePersonRule[]) { return setProfileKernelState((current) => ({ ...current, blockedList })); }
export function setProfileKernelPreferences(preferences: ProfileKernelPreferencesState) { return setProfileKernelState((current) => ({ ...current, preferences })); }
export function clearProfileKernelPreferences() { return setProfileKernelPreferences({ ...EMPTY_PROFILE_PREFERENCES_STATE }); }
export function setProfileKernelLanguageCode(languageCode: string) { return setProfileKernelState((current) => ({ ...current, languageCode })); }
export function setProfileKernelDevices(devices: ProfileKernelDevicesState) { return setProfileKernelState((current) => ({ ...current, devices })); }
export function clearProfileKernelDevices() { return setProfileKernelDevices({ ...EMPTY_PROFILE_DEVICES_STATE }); }
export function setProfileKernelAutoDelete(autoDelete: ProfileKernelAutoDeleteState) { return setProfileKernelState((current) => ({ ...current, autoDelete })); }
export function clearProfileKernelAutoDelete() { return setProfileKernelAutoDelete({ ...EMPTY_PROFILE_AUTO_DELETE_STATE }); }
export function setProfileKernelPrivacyRows(payload: { privacySecurityRows?: ProfileKernelPrivacyRow[]; privacyVisibilityRows?: ProfileKernelPrivacyRow[]; }) { return setProfileKernelState((current) => ({ ...current, privacySecurityRows: payload.privacySecurityRows ?? current.privacySecurityRows, privacyVisibilityRows: payload.privacyVisibilityRows ?? current.privacyVisibilityRows })); }
export function setProfileKernelPrivacyDetailConfigs(privacyDetailConfigs: PrivacyDetailConfig[]) { return setProfileKernelState((current) => ({ ...current, privacyDetailConfigs })); }
export function hydrateProfileKernelState(snapshot: Partial<ProfileKernelState>) { return setProfileKernelState((current) => ({ ...current, ...snapshot })); }
