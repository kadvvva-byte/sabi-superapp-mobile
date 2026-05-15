import { useEffect, useState } from "react";

import {
  getAuthSessionState,
  getAuthenticatedAuthSession,
  subscribeAuthSessionState,
} from "../../../core/kernel/auth/session.store";
import { profileKernelFacade } from "../../../core/kernel/profile";

export type SabiQrVerifiedActorIdentity = {
  isAuthenticated: boolean;
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  username: string | null;
  sabiDisplayId: string | null;
  avatarUri: string | null;
  verificationStatus: string | null;
  profileCompleted: boolean;
  source: "verified_auth_profile";
};

export type SabiQrActorIdentity = SabiQrVerifiedActorIdentity;

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeUsername(value: unknown): string | null {
  const username = normalizeString(value);
  return username ? username.replace(/^@+/, "") : null;
}

function buildDisplayName(firstName: string | null, lastName: string | null, fallback: unknown): string | null {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return fullName || normalizeString(fallback);
}

function readActorIdentity(): SabiQrVerifiedActorIdentity {
  const auth = getAuthSessionState();
  const authUserId = auth.status === "authenticated" ? normalizeString(auth.currentUserId) : null;
  const account = profileKernelFacade.getState().account;
  const accountUserId = normalizeString(account?.userId);
  const profileMatchesAuth = Boolean(authUserId && accountUserId && accountUserId === authUserId);
  const firstName = profileMatchesAuth ? normalizeString(account?.firstName) : null;
  const lastName = profileMatchesAuth ? normalizeString(account?.lastName) : null;
  const username = profileMatchesAuth ? normalizeUsername(account?.username) : null;
  const displayName = profileMatchesAuth
    ? buildDisplayName(firstName, lastName, account?.fullName)
    : null;

  return {
    isAuthenticated: Boolean(authUserId),
    userId: authUserId,
    firstName,
    lastName,
    displayName,
    username,
    sabiDisplayId: profileMatchesAuth ? normalizeString(account?.sabiDisplayId) : null,
    avatarUri: profileMatchesAuth ? normalizeString(account?.avatarUri) : null,
    verificationStatus: profileMatchesAuth ? normalizeString(account?.verificationStatus) : null,
    profileCompleted: profileMatchesAuth ? Boolean(account?.profileCompleted) : false,
    source: "verified_auth_profile",
  };
}

export function getSabiQrActorIdentity(): SabiQrVerifiedActorIdentity {
  return readActorIdentity();
}

export function getSabiQrActorUserId(): string | null {
  return getAuthenticatedAuthSession()?.currentUserId ?? null;
}

export function requireSabiQrActorIdentity(): SabiQrVerifiedActorIdentity & { userId: string } {
  const identity = readActorIdentity();

  if (!identity.userId) {
    throw new Error("qr.mobile.error.authRequired");
  }

  return {
    ...identity,
    userId: identity.userId,
  };
}

export function requireSabiQrActorUserId(): string {
  return requireSabiQrActorIdentity().userId;
}

export function toSabiQrVerifiedIdentityPayload(identity: SabiQrVerifiedActorIdentity & { userId: string }) {
  return {
    userId: identity.userId,
    firstName: identity.firstName,
    lastName: identity.lastName,
    displayName: identity.displayName,
    username: identity.username,
    sabiDisplayId: identity.sabiDisplayId,
    verificationStatus: identity.verificationStatus,
    profileCompleted: identity.profileCompleted,
    source: identity.source,
  };
}

export function useSabiQrActorIdentity(): SabiQrActorIdentity {
  const [identity, setIdentity] = useState<SabiQrActorIdentity>(() => readActorIdentity());

  useEffect(() => {
    const update = () => {
      setIdentity(readActorIdentity());
    };

    const unsubscribeAuth = subscribeAuthSessionState(update);
    const unsubscribeProfile = profileKernelFacade.subscribe(update);

    update();

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);

  return identity;
}
