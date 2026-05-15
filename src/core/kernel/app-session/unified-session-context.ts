import {
  getAuthSessionState,
  isAuthenticatedSessionReady,
} from "../auth/session.store";
import { profileKernelFacade } from "../profile";

export type UnifiedKernelSessionContext = {
  isAuthenticated: boolean;
  apiBaseUrl: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  currentUserId: string | null;
  phoneNumber: string | null;
  profileUserId: string | null;
  username: string | null;
  displayName: string | null;
  profileCompleted: boolean;
};

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function getUnifiedKernelSessionContext(): UnifiedKernelSessionContext {
  const auth = getAuthSessionState();
  const account = profileKernelFacade.getState().account;
  const firstName = normalizeString(account?.firstName);
  const lastName = normalizeString(account?.lastName);
  const fullName =
    normalizeString(account?.fullName) ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    null;

  return {
    isAuthenticated: isAuthenticatedSessionReady(),
    apiBaseUrl: normalizeString(auth.apiBaseUrl),
    accessToken: normalizeString(auth.accessToken),
    refreshToken: normalizeString(auth.refreshToken),
    currentUserId: normalizeString(auth.currentUserId),
    phoneNumber: normalizeString(auth.phoneNumber),
    profileUserId: normalizeString(account?.userId),
    username: normalizeString(account?.username),
    displayName: fullName,
    profileCompleted: Boolean(account?.profileCompleted),
  };
}

export function getAiKernelUserContext() {
  const context = getUnifiedKernelSessionContext();

  return {
    userId: context.currentUserId,
    isAuthenticated: context.isAuthenticated,
    profileCompleted: context.profileCompleted,
    // Free AI chat/text translation may use this context.
    // Voice control, voice replies, call translation and premium modes must still check entitlement/provider availability.
    advancedAiRequiresPremium: true,
  } as const;
}

export function getAdminKernelAuditContext() {
  const context = getUnifiedKernelSessionContext();

  return {
    actorUserId: context.currentUserId,
    profileUserId: context.profileUserId,
    isAuthenticated: context.isAuthenticated,
    source: "mobile_kernel_session",
    // Admin receives risk/audit signals only. AI must not decide guilt.
    requiresHumanReviewForRiskSignals: true,
  } as const;
}
