import { useMemo } from "react";

import { profileKernelFacade } from "../../../core/kernel/profile";
import { ensureProfileKernelBoot, useProfileKernelState } from "../../../core/kernel/profile/bindings";

export type ProfilePhotoFilterKey = "none" | "warm" | "cool" | "mono" | "emerald";

export type ProfilePhotoEditState = {
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  filter: ProfilePhotoFilterKey;
};

export type ProfilePhotoItem = {
  id: string;
  uri: string;
  title: string;
  createdAt: string;
  edit: ProfilePhotoEditState;
};

export type ProfileVideoItem = {
  id: string;
  uri: string;
  title: string;
  createdAt: string;
  durationMs?: number;
};

export type ProfileLinkItem = {
  id: string;
  url: string;
  label: string;
  createdAt: string;
};

export type ProfileVoiceItem = {
  id: string;
  uri: string;
  title: string;
  createdAt: string;
  durationMs: number;
};

export type ProfileRuntimeState = {
  avatarUri: string | null;
  photos: ProfilePhotoItem[];
  shortVideos: ProfileVideoItem[];
  links: ProfileLinkItem[];
  voiceNotes: ProfileVoiceItem[];
  likesCount: number;
  reactionCounts: Record<string, number>;
};

function mapFilterFromKernel(value?: string | null): ProfilePhotoFilterKey {
  switch (String(value || "").trim()) {
    case "warm":
    case "cool":
    case "mono":
      return value as ProfilePhotoFilterKey;
    case "dream":
    case "neon":
    case "emerald":
      return "emerald";
    default:
      return "none";
  }
}

function mapFilterToKernel(value?: ProfilePhotoFilterKey) {
  switch (value) {
    case "warm":
    case "cool":
    case "mono":
      return value;
    case "emerald":
      return "dream" as const;
    default:
      return "none" as const;
  }
}

function mapPhoto(item: any): ProfilePhotoItem {
  return {
    id: String(item?.id || ""),
    uri: String(item?.uri || ""),
    title: String(item?.title || item?.label || "Photo"),
    createdAt: new Date(Number(item?.createdAt || Date.now())).toISOString(),
    edit: {
      rotation: Number(item?.edit?.rotation || 0),
      flipX: Boolean(item?.edit?.flipX),
      flipY: Boolean(item?.edit?.flipY),
      filter: mapFilterFromKernel(item?.edit?.filter),
    },
  };
}

function mapVideo(item: any): ProfileVideoItem {
  return {
    id: String(item?.id || ""),
    uri: String(item?.uri || ""),
    title: String(item?.title || item?.label || "Short video"),
    createdAt: new Date(Number(item?.createdAt || Date.now())).toISOString(),
    durationMs: item?.durationMs == null ? undefined : Number(item.durationMs),
  };
}

function mapLink(item: any): ProfileLinkItem {
  return {
    id: String(item?.id || ""),
    url: String(item?.url || ""),
    label: String(item?.label || "Link"),
    createdAt: new Date(Number(item?.createdAt || Date.now())).toISOString(),
  };
}

function mapVoice(item: any): ProfileVoiceItem {
  return {
    id: String(item?.id || ""),
    uri: String(item?.uri || ""),
    title: String(item?.title || "Voice note"),
    createdAt: new Date(Number(item?.createdAt || Date.now())).toISOString(),
    durationMs: Math.max(0, Number(item?.durationMs || 0)),
  };
}

export function subscribeProfileRuntime(listener: () => void) {
  return profileKernelFacade.subscribe(() => listener());
}

export async function ensureProfileRuntimeLoaded() {
  await ensureProfileKernelBoot();
}

export function useProfileRuntime(): ProfileRuntimeState {
  const state = useProfileKernelState();

  return useMemo(
    () => ({
      avatarUri: state.avatarUri ?? state.account.avatarUri ?? null,
      photos: state.photos.map(mapPhoto),
      shortVideos: state.shortVideos.map(mapVideo),
      links: state.links.map(mapLink),
      voiceNotes: state.voiceNotes.map(mapVoice),
      likesCount: state.likesCount,
      reactionCounts: { ...state.reactionCounts },
    }),
    [state],
  );
}

function nextTitle(prefix: string) {
  return `${prefix}`;
}

export async function setProfileAvatar(uri: string | null) {
  await ensureProfileKernelBoot();
  return profileKernelFacade.setAvatar(uri);
}

export async function addProfilePhoto(uri: string, title?: string) {
  await ensureProfileKernelBoot();
  const created = Date.now();
  const item = {
    id: `photo-${created}-${Math.random().toString(36).slice(2, 8)}`,
    uri,
    title: title?.trim() || nextTitle("Photo"),
    createdAt: created,
    edit: { rotation: 0, flipX: false, flipY: false, filter: "none" as const },
  };
  await profileKernelFacade.addPhoto(item as any);
  return mapPhoto(item);
}

export async function updateProfilePhotoEdit(id: string, patch: Partial<ProfilePhotoEditState>) {
  await ensureProfileKernelBoot();
  const state = profileKernelFacade.getState();
  const current = state.photos.find((item: any) => item.id === id);
  if (!current) return;
  await profileKernelFacade.updatePhotoEdit(id, {
    rotation: typeof patch.rotation === "number" ? patch.rotation : Number(current.edit?.rotation || 0),
    flipX: typeof patch.flipX === "boolean" ? patch.flipX : Boolean(current.edit?.flipX),
    flipY: typeof patch.flipY === "boolean" ? patch.flipY : Boolean(current.edit?.flipY),
    filter: mapFilterToKernel(patch.filter ?? mapFilterFromKernel(current.edit?.filter)),
  } as any);
}

export async function removeProfilePhoto(id: string) {
  await ensureProfileKernelBoot();
  return profileKernelFacade.removePhoto(id);
}

export async function addShortVideo(uri: string, durationMs?: number, title?: string) {
  await ensureProfileKernelBoot();
  const created = Date.now();
  const item = {
    id: `video-${created}-${Math.random().toString(36).slice(2, 8)}`,
    uri,
    title: title?.trim() || nextTitle("Short video"),
    durationMs: durationMs == null ? null : Math.max(0, Math.floor(durationMs)),
    createdAt: created,
  };
  await profileKernelFacade.addShortVideo(item as any);
  return mapVideo(item);
}

export async function removeShortVideo(id: string) {
  await ensureProfileKernelBoot();
  return profileKernelFacade.removeShortVideo(id);
}

export async function addProfileLink(url: string, label?: string) {
  await ensureProfileKernelBoot();
  await profileKernelFacade.addLink(url, label);
  const current = profileKernelFacade.getState().links[0];
  return current ? mapLink(current) : null;
}

export async function removeProfileLink(id: string) {
  await ensureProfileKernelBoot();
  return profileKernelFacade.removeLink(id);
}

export async function addVoiceNote(uri: string, durationMs: number, title?: string) {
  await ensureProfileKernelBoot();
  const created = Date.now();
  const item = {
    id: `voice-${created}-${Math.random().toString(36).slice(2, 8)}`,
    uri,
    title: title?.trim() || nextTitle("Voice note"),
    durationMs: Math.max(0, Math.floor(durationMs)),
    createdAt: created,
  };
  await profileKernelFacade.addVoiceNote(item as any);
  return mapVoice(item);
}

export async function removeVoiceNote(id: string) {
  await ensureProfileKernelBoot();
  return profileKernelFacade.removeVoiceNote(id);
}

export async function incrementLikes(step = 1) {
  await ensureProfileKernelBoot();
  const current = profileKernelFacade.getState().likesCount;
  return profileKernelFacade.setLikesCount(current + step);
}

export async function addReaction(emoji: string, step = 1) {
  await ensureProfileKernelBoot();
  const current = profileKernelFacade.getState().reactionCounts[emoji] ?? 0;
  return profileKernelFacade.setReactionCount(emoji, current + step);
}

export function getReactionTotal(state: ProfileRuntimeState) {
  return Object.values(state.reactionCounts).reduce((sum, value) => sum + value, 0);
}

export function getMediaTotal(state: ProfileRuntimeState) {
  return state.photos.length + state.shortVideos.length;
}

export function getVoiceCount(state: ProfileRuntimeState) {
  return state.voiceNotes.length;
}

export function getLinksCount(state: ProfileRuntimeState) {
  return state.links.length;
}
