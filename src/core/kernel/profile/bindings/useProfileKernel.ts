import { useEffect, useMemo, useState } from "react";

import { profileKernelFacade } from "../facade";
import type { ProfileKernelState } from "../core/types";

let profileKernelBootPromise: Promise<ProfileKernelState> | null = null;

export async function ensureProfileKernelBoot() {
  if (!profileKernelBootPromise) {
    profileKernelBootPromise = profileKernelFacade
      .boot()
      .catch(() => undefined)
      .then(() => profileKernelFacade.getState())
      .finally(() => {
        profileKernelBootPromise = null;
      });
  }

  return profileKernelBootPromise;
}

export function useProfileKernelState() {
  const [state, setState] = useState<ProfileKernelState>(profileKernelFacade.getState());

  useEffect(() => {
    let active = true;
    const unsubscribe = profileKernelFacade.subscribe((next) => {
      if (!active) return;
      setState((current) => (current === next ? current : next));
    });

    void ensureProfileKernelBoot().then((next) => {
      if (!active) return;
      setState((current) => (current === next ? current : next));
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return state;
}

export function useProfileKernel() {
  const state = useProfileKernelState();

  return useMemo(() => {
    const counts = profileKernelFacade.selectors.counts();
    return {
      state,
      facade: profileKernelFacade,
      refresh: () => profileKernelFacade.refresh(),
      account: state.account,
      publicProfile: state.publicProfile,
      completeDraft: state.completeDraft,
      avatarUri: state.avatarUri,
      coverUri: state.coverUri,
      photos: state.photos,
      shortVideos: state.shortVideos,
      links: state.links,
      reactionCounts: state.reactionCounts,
      voiceNotes: state.voiceNotes,
      likesCount: state.likesCount,
      giftsCount: state.giftsCount,
      groupPreview: state.groupPreview,
      channelPreview: state.channelPreview,
      botPreview: state.botPreview,
      qr: state.qr,
      security: state.security,
      emailChange: state.emailChange,
      phoneChange: state.phoneChange,
      trustedList: state.trustedList,
      blockedList: state.blockedList,
      preferences: state.preferences,
      languageCode: state.languageCode,
      devices: state.devices,
      autoDelete: state.autoDelete,
      privacySecurityRows: state.privacySecurityRows,
      privacyVisibilityRows: state.privacyVisibilityRows,
      privacyDetailConfigs: state.privacyDetailConfigs,
      counts,
      isReady: state.isReady,
      runtimeStatus: state.runtimeStatus,
      lastError: state.lastError,
    };
  }, [state]);
}
