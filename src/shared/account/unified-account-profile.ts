import {
  getAuthSessionState,
  isAuthenticatedSessionReady,
} from "../../core/kernel/auth/session.store";
import { profileKernelFacade } from "../../core/kernel/profile";
import {
  fetchUserProfileById,
  saveUserProfileToApi,
  type UserProfileApiSnapshot,
} from "../api/user-profile-api";
import { ensureProfileKernelBoot } from "../../core/kernel/profile/bindings";
import {
  buildSuggestedUnifiedUsername,
  buildUnifiedUserId,
  createUnifiedUserIdSeed,
  normalizeProfileName,
  normalizeUnifiedUsername,
  slugifyProfilePart,
} from "./unified-account-helpers";

export const UNIFIED_ACCOUNT_STORAGE_KEY = "sabi_unified_account_profile_cache_v2";
export const PROFILE_DRAFT_STORAGE_KEY = "sabi_profile_complete_draft_v1";

export type UnifiedAccountProfile = {
  phone: string;
  firstName: string;
  lastName: string;
  username: string;
  userId: string;
  sabiDisplayId: string;
  fullName: string;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SaveUnifiedAccountProfileInput = {
  phone?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  userId?: string;
};

type UnifiedProfileDraft = {
  phone?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  userId?: string;
  profileCompleted?: boolean;
};

function asSafeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function extractFirstLetter(value?: string | null) {
  const normalized = normalizeProfileName(asSafeString(value));
  const match = normalized.match(/\p{L}/u);
  return match ? match[0].toUpperCase() : "";
}

function extractSecondUsernameLetter(value?: string | null) {
  const normalized = normalizeProfileName(asSafeString(value)).replace(/^@+/, "");
  const letters = normalized.match(/\p{L}/gu) ?? [];
  return letters[1] ? letters[1].toUpperCase() : "";
}

function buildStableTenDigits(source: string) {
  const normalized = source.trim();
  if (!normalized) return "0000000000";
  let hash = 0;
  for (const symbol of normalized) {
    const codePoint = symbol.codePointAt(0) ?? 0;
    hash = (hash * 131 + codePoint) % 10000000000;
  }
  return Math.floor(hash).toString().padStart(10, "0");
}

export function buildSabiDisplayId(params: { firstName?: string | null; lastName?: string | null; username?: string | null; userId: string; }) {
  const firstInitial = extractFirstLetter(params.firstName) || extractFirstLetter(params.username) || "S";
  const secondInitial = extractFirstLetter(params.lastName) || extractSecondUsernameLetter(params.username) || "B";
  return `${firstInitial}${secondInitial}${buildStableTenDigits(params.userId)}`;
}

export {
  normalizeProfileName,
  slugifyProfilePart,
  normalizeUnifiedUsername,
  buildSuggestedUnifiedUsername,
  createUnifiedUserIdSeed,
  buildUnifiedUserId,
};

function getCurrentAuthenticatedUserId() {
  if (!isAuthenticatedSessionReady()) return null;
  return getAuthSessionState().currentUserId;
}

function getAuthenticatedProfileApiSession() {
  const state = getAuthSessionState();

  if (!isAuthenticatedSessionReady() || state.status !== "authenticated") {
    return null;
  }

  return {
    apiBaseUrl: state.apiBaseUrl,
    accessToken: state.accessToken,
    currentUserId: state.currentUserId,
  };
}

function normalizeAccountText(value: unknown) {
  return asSafeString(value).trim();
}

function isGenericDisplayName(value: unknown) {
  const normalized = normalizeAccountText(value).toLowerCase();
  return !normalized || normalized === "sabi user" || normalized === "sabi" || normalized === "user";
}

function splitDisplayName(value: unknown) {
  const normalized = normalizeProfileName(normalizeAccountText(value));
  const parts = normalized.split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ").trim(),
  };
}

function mapApiProfileToUnified(profile: UserProfileApiSnapshot, currentAccount?: any): UnifiedAccountProfile {
  const now = new Date().toISOString();
  const localFirstName = normalizeProfileName(normalizeAccountText(currentAccount?.firstName));
  const localLastName = normalizeProfileName(normalizeAccountText(currentAccount?.lastName));
  const localUsername = normalizeUnifiedUsername(normalizeAccountText(currentAccount?.username));
  const localPhone = normalizeAccountText(currentAccount?.phone);
  const localFullName = normalizeProfileName(normalizeAccountText(currentAccount?.fullName));
  const apiDisplayName = normalizeProfileName(normalizeAccountText(profile.displayName));
  const displayNameParts = splitDisplayName(apiDisplayName);

  const firstName =
    normalizeProfileName(profile.firstName) ||
    localFirstName ||
    displayNameParts.firstName;
  const lastName =
    normalizeProfileName(profile.lastName) ||
    localLastName ||
    displayNameParts.lastName;
  const username = normalizeUnifiedUsername(profile.username) || localUsername;
  const phone = normalizeAccountText(profile.phone) || localPhone;
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    (!isGenericDisplayName(apiDisplayName) ? apiDisplayName : "") ||
    (!isGenericDisplayName(localFullName) ? localFullName : "") ||
    username ||
    phone;

  return {
    phone,
    firstName,
    lastName,
    username,
    userId: profile.userId,
    sabiDisplayId: buildSabiDisplayId({
      firstName,
      lastName,
      username,
      userId: profile.userId,
    }),
    fullName,
    profileCompleted: Boolean(profile.profileCompleted || (firstName && lastName && username) || currentAccount?.profileCompleted),
    createdAt: profile.createdAt || normalizeAccountText(currentAccount?.createdAt) || now,
    updatedAt: profile.updatedAt || now,
  };
}

function toKernelAccount(profile: UnifiedAccountProfile, apiProfile?: UserProfileApiSnapshot, currentAccount?: any) {
  const fullName =
    normalizeProfileName(profile.fullName) ||
    [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() ||
    normalizeProfileName(normalizeAccountText(apiProfile?.displayName)) ||
    normalizeProfileName(normalizeAccountText(currentAccount?.fullName));

  return {
    userId: profile.userId,
    phone: profile.phone || normalizeAccountText(currentAccount?.phone),
    firstName: profile.firstName || normalizeProfileName(normalizeAccountText(currentAccount?.firstName)),
    lastName: profile.lastName || normalizeProfileName(normalizeAccountText(currentAccount?.lastName)),
    username: profile.username || normalizeUnifiedUsername(normalizeAccountText(currentAccount?.username)),
    fullName,
    sabiDisplayId: profile.sabiDisplayId || normalizeAccountText(currentAccount?.sabiDisplayId),
    avatarUri: apiProfile?.avatarUri || currentAccount?.avatarUri || null,
    bio: apiProfile?.bio ?? currentAccount?.bio ?? "",
    profileCompleted: profile.profileCompleted || Boolean(currentAccount?.profileCompleted),
    createdAt: profile.createdAt || normalizeAccountText(currentAccount?.createdAt),
    updatedAt: profile.updatedAt || normalizeAccountText(currentAccount?.updatedAt),
  };
}


function mapAccountToUnified(account: any): UnifiedAccountProfile | null {
  const userId = String(account?.userId || "").trim();
  if (!userId) return null;
  const createdAt = String(account?.createdAt || new Date().toISOString());
  const updatedAt = String(account?.updatedAt || createdAt);
  const firstName = normalizeProfileName(String(account?.firstName || ""));
  const lastName = normalizeProfileName(String(account?.lastName || ""));
  const username = normalizeUnifiedUsername(String(account?.username || "").trim());
  const fullName =
    normalizeProfileName(String(account?.fullName || "")) ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    username;

  return {
    phone: String(account?.phone || "").trim(),
    firstName,
    lastName,
    username,
    userId,
    sabiDisplayId: String(account?.sabiDisplayId || buildSabiDisplayId({
      firstName,
      lastName,
      username,
      userId,
    })).trim(),
    fullName,
    profileCompleted: Boolean(account?.profileCompleted),
    createdAt,
    updatedAt,
  };
}

export async function getUnifiedAccountProfile(): Promise<UnifiedAccountProfile | null> {
  await ensureProfileKernelBoot();
  const authenticatedUserId = getCurrentAuthenticatedUserId();

  if (!authenticatedUserId) {
    return null;
  }

  try {
    const apiProfile = await fetchUserProfileById(
      authenticatedUserId,
      getAuthenticatedProfileApiSession(),
    );
    const currentAccount = profileKernelFacade.selectors.account();
    const unified = mapApiProfileToUnified(apiProfile, currentAccount);

    await profileKernelFacade.updateProfile(toKernelAccount(unified, apiProfile, currentAccount) as any);

    return unified;
  } catch (error) {
    console.warn(
      "[unified-account-profile] backend profile fetch failed",
      error instanceof Error ? error.message : error,
    );
  }

  const account = profileKernelFacade.selectors.account();
  if (account.userId && account.userId !== authenticatedUserId) {
    await profileKernelFacade.refresh();
  }

  const local = mapAccountToUnified(profileKernelFacade.selectors.account());
  return local?.userId === authenticatedUserId ? local : null;
}

export async function hasUnifiedAccountProfile(): Promise<boolean> {
  const profile = await getUnifiedAccountProfile();
  return Boolean(profile?.profileCompleted && profile.userId);
}

export async function getUnifiedUserId(): Promise<string | null> {
  return getCurrentAuthenticatedUserId();
}

export async function getUnifiedUsername(): Promise<string | null> {
  const profile = await getUnifiedAccountProfile();
  return profile?.username || null;
}

export async function getUnifiedDisplaySabiId(): Promise<string | null> {
  const profile = await getUnifiedAccountProfile();
  return profile?.sabiDisplayId || null;
}

export async function saveUnifiedAccountProfile(input: SaveUnifiedAccountProfileInput): Promise<UnifiedAccountProfile> {
  await ensureProfileKernelBoot();
  const authenticatedUserId = getCurrentAuthenticatedUserId();
  if (!authenticatedUserId) {
    throw new Error("Authenticated user id is required to save unified account profile.");
  }
  if (input.userId && input.userId.trim() && input.userId.trim() !== authenticatedUserId) {
    throw new Error("Unified account profile userId must match the authenticated session userId.");
  }

  const current = profileKernelFacade.selectors.account();
  const firstName = normalizeProfileName(asSafeString(input.firstName || current.firstName));
  const lastName = normalizeProfileName(asSafeString(input.lastName || current.lastName));
  const username = normalizeUnifiedUsername(asSafeString(input.username || current.username));
  const phone = asSafeString(input.phone || current.phone).trim();

  const apiProfile = await saveUserProfileToApi(
    {
      userId: authenticatedUserId,
      phone,
      firstName,
      lastName,
      username,
      avatarUri: current.avatarUri,
      bio: current.bio,
      isPublicProfile: true,
    },
    getAuthenticatedProfileApiSession(),
  );

  const unified = mapApiProfileToUnified(apiProfile, current);

  await profileKernelFacade.updateProfile(toKernelAccount(unified, apiProfile, current) as any);
  await profileKernelFacade.updatePublicProfile({
    publicName: apiProfile.displayName,
    publicUsername: apiProfile.username,
    publicBio: apiProfile.bio || "",
    publicSubtitle: unified.sabiDisplayId,
  });
  await profileKernelFacade.clearDraft();

  return unified;
}

export async function updateUnifiedAccountNames(input: { firstName?: string; lastName?: string; username?: string; }): Promise<UnifiedAccountProfile | null> {
  const existing = await getUnifiedAccountProfile();
  if (!existing) return null;
  return saveUnifiedAccountProfile({
    phone: existing.phone,
    firstName: typeof input.firstName === "string" ? input.firstName : existing.firstName,
    lastName: typeof input.lastName === "string" ? input.lastName : existing.lastName,
    username: typeof input.username === "string" ? input.username : existing.username,
    userId: existing.userId,
  });
}

export async function saveUnifiedProfileDraft(input: UnifiedProfileDraft): Promise<UnifiedProfileDraft> {
  await ensureProfileKernelBoot();
  const userId = input.userId?.trim() || getCurrentAuthenticatedUserId() || "";
  const draft: UnifiedProfileDraft = {
    phone: asSafeString(input.phone).trim(),
    firstName: normalizeProfileName(asSafeString(input.firstName)),
    lastName: normalizeProfileName(asSafeString(input.lastName)),
    username: normalizeUnifiedUsername(asSafeString(input.username)),
    userId: userId || undefined,
    profileCompleted: false,
  };
  await profileKernelFacade.updateDraft(draft as any);
  return draft;
}

export async function getUnifiedProfileDraft(): Promise<UnifiedProfileDraft | null> {
  await ensureProfileKernelBoot();
  const draft = profileKernelFacade.selectors.completeDraft();
  const userId = String(draft.userId || "").trim();
  if (!userId && !draft.firstName && !draft.lastName && !draft.username && !draft.phone) return null;
  return {
    phone: draft.phone,
    firstName: draft.firstName,
    lastName: draft.lastName,
    username: draft.username,
    userId: userId || undefined,
    profileCompleted: false,
  };
}
