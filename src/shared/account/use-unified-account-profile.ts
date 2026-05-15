import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";

import { useAuthSession } from "../../core/kernel/auth/use-auth-session";
import { appStorage } from "../storage/app-storage";
import {
  getUnifiedAccountProfile,
  getUnifiedProfileDraft,
  type UnifiedAccountProfile,
} from "./unified-account-profile";

type UnifiedRouteTarget = "/" | "/profile/complete";

type UnifiedRouteDecision = {
  target: UnifiedRouteTarget;
  params?: Record<string, string>;
  profile: UnifiedAccountProfile | null;
};

type LegacyUnifiedAccountProfile = {
  phone: string;
  firstName: string;
  lastName: string;
  username: string;
  userId: string;
  sabiDisplayId?: string;
  fullName?: string;
  profileCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type LocalUnifiedProfileDraft = {
  phone?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  userId?: string;
  sabiDisplayId?: string;
  profileCompleted?: boolean;
};

const LEGACY_UNIFIED_ACCOUNT_STORAGE_KEY = "sabi_unified_account_profile_v1";

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function buildSabiDisplayId(input: {
  sabiDisplayId?: string;
  username?: string;
  userId?: string;
}) {
  const direct = asString(input.sabiDisplayId).trim();
  if (direct) return direct;

  const username = asString(input.username).trim();
  if (username) return username;

  const userId = asString(input.userId).trim();
  if (userId) return userId;

  return "";
}

function isLegacyUnifiedAccountProfile(
  value: unknown,
): value is LegacyUnifiedAccountProfile {
  if (!isObject(value)) return false;

  return (
    typeof value.phone === "string" &&
    typeof value.firstName === "string" &&
    typeof value.lastName === "string" &&
    typeof value.username === "string" &&
    typeof value.userId === "string" &&
    typeof value.profileCompleted === "boolean"
  );
}

function isLocalUnifiedProfileDraft(
  value: unknown,
): value is LocalUnifiedProfileDraft {
  if (!isObject(value)) return false;

  return (
    typeof value.phone === "string" ||
    typeof value.firstName === "string" ||
    typeof value.lastName === "string" ||
    typeof value.username === "string" ||
    typeof value.userId === "string" ||
    typeof value.sabiDisplayId === "string"
  );
}

function toUnifiedAccountProfile(
  legacy: LegacyUnifiedAccountProfile,
): UnifiedAccountProfile {
  const now = new Date().toISOString();

  return {
    phone: legacy.phone,
    firstName: legacy.firstName,
    lastName: legacy.lastName,
    username: legacy.username,
    userId: legacy.userId,
    sabiDisplayId: buildSabiDisplayId({
      sabiDisplayId: legacy.sabiDisplayId,
      username: legacy.username,
      userId: legacy.userId,
    }),
    fullName: asString(legacy.fullName).trim() || [legacy.firstName, legacy.lastName].filter(Boolean).join(" ").trim() || legacy.username,
    profileCompleted: Boolean(legacy.profileCompleted),
    createdAt: legacy.createdAt ?? now,
    updatedAt: legacy.updatedAt ?? legacy.createdAt ?? now,
  };
}

async function getLegacyUnifiedAccountProfile(): Promise<UnifiedAccountProfile | null> {
  const raw = await appStorage.getString(LEGACY_UNIFIED_ACCOUNT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!isLegacyUnifiedAccountProfile(parsed)) {
      return null;
    }

    return toUnifiedAccountProfile(parsed);
  } catch {
    return null;
  }
}

function buildHomeParams(profile: UnifiedAccountProfile): Record<string, string> {
  return {
    phone: profile.phone,
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: profile.username,
    userId: profile.userId,
    sabiDisplayId: profile.sabiDisplayId,
    fullName: profile.fullName,
    profileCompleted: profile.profileCompleted ? "true" : "false",
  };
}

function buildCompleteParams(input: {
  userId: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  sabiDisplayId?: string;
}): Record<string, string> {
  return {
    phone: asString(input.phone),
    firstName: asString(input.firstName),
    lastName: asString(input.lastName),
    username: asString(input.username),
    userId: asString(input.userId),
    sabiDisplayId: buildSabiDisplayId({
      sabiDisplayId: input.sabiDisplayId,
      username: input.username,
      userId: input.userId,
    }),
  };
}

async function getBestAvailableProfile(): Promise<UnifiedAccountProfile | null> {
  const liveProfile = await getUnifiedAccountProfile();

  if (liveProfile?.profileCompleted && liveProfile.userId) {
    return liveProfile;
  }

  const legacyProfile = await getLegacyUnifiedAccountProfile();

  if (legacyProfile?.profileCompleted && legacyProfile.userId) {
    return legacyProfile;
  }

  return null;
}

export async function resolveUnifiedAccountRoute(): Promise<UnifiedRouteDecision> {
  const profile = await getBestAvailableProfile();

  if (profile?.profileCompleted && profile.userId) {
    return {
      target: "/",
      params: buildHomeParams(profile),
      profile,
    };
  }

  const draft = await getUnifiedProfileDraft();
  const legacyDraftCandidate = draft as unknown;

  if (
    isLocalUnifiedProfileDraft(legacyDraftCandidate) &&
    legacyDraftCandidate.userId?.trim()
  ) {
    return {
      target: "/profile/complete",
      params: buildCompleteParams({
        userId: legacyDraftCandidate.userId,
        phone: legacyDraftCandidate.phone,
        firstName: legacyDraftCandidate.firstName,
        lastName: legacyDraftCandidate.lastName,
        username: legacyDraftCandidate.username,
        sabiDisplayId: legacyDraftCandidate.sabiDisplayId,
      }),
      profile: null,
    };
  }

  return {
    target: "/",
    profile: null,
  };
}

export function useUnifiedAccountProfile() {
  const auth = useAuthSession();
  const [profile, setProfile] = useState<UnifiedAccountProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!auth.isHydrated || auth.isHydrating) {
      setLoading(true);
      return null;
    }

    try {
      setLoading(true);

      const next = await getBestAvailableProfile();
      setProfile(next);
      return next;
    } finally {
      setLoading(false);
    }
  }, [auth.isHydrated, auth.isHydrating]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    profile,
    loading,
    reload,
    hasProfile: Boolean(profile?.profileCompleted && profile?.userId),
    userId: profile?.userId ?? auth.currentUserId ?? null,
    authReady: auth.isHydrated && !auth.isHydrating,
    isAuthenticated: auth.status === "authenticated",
  };
}

type UseRequireUnifiedAccountOptions = {
  allowIncompleteProfile?: boolean;
  enabled?: boolean;
};

export function useRequireUnifiedAccount(
  options: UseRequireUnifiedAccountOptions = {},
) {
  const { allowIncompleteProfile = false, enabled = true } = options;
  const auth = useAuthSession();

  const [profile, setProfile] = useState<UnifiedAccountProfile | null>(null);
  const [loading, setLoading] = useState(enabled);

  const reload = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return null;
    }

    if (!auth.isHydrated || auth.isHydrating) {
      setLoading(true);
      return null;
    }

    try {
      setLoading(true);

      const nextProfile = await getBestAvailableProfile();

      if (nextProfile?.profileCompleted && nextProfile.userId) {
        setProfile(nextProfile);
        return nextProfile;
      }

      const draft = await getUnifiedProfileDraft();
      const usableDraft: LocalUnifiedProfileDraft | null = isLocalUnifiedProfileDraft(
        draft as unknown,
      )
        ? (draft as LocalUnifiedProfileDraft)
        : null;

      if (allowIncompleteProfile) {
        setProfile(null);
        return null;
      }

      if (usableDraft?.userId?.trim()) {
        router.replace({
          pathname: "/profile/complete",
          params: buildCompleteParams({
            userId: usableDraft.userId,
            phone: usableDraft.phone,
            firstName: usableDraft.firstName,
            lastName: usableDraft.lastName,
            username: usableDraft.username,
            sabiDisplayId: usableDraft.sabiDisplayId,
          }),
        });

        setProfile(null);
        return null;
      }

      router.replace("/");
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [allowIncompleteProfile, auth.isHydrated, auth.isHydrating, enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    profile,
    loading,
    reload,
    userId: profile?.userId ?? auth.currentUserId ?? null,
    hasProfile: Boolean(profile?.profileCompleted && profile?.userId),
    authReady: auth.isHydrated && !auth.isHydrating,
    isAuthenticated: auth.status === "authenticated",
  };
}