import { useSyncExternalStore } from "react";

import { profileKernelFacade } from "../../core/kernel/profile";
import type { ProfileUser } from "./types";

export type ProfileAccentKey = "emerald" | "teal" | "blue" | "purple" | "gold";

export type ProfileState = {
  user: ProfileUser;
  accentKey: ProfileAccentKey;
  channelHandle: string;
  updatedAt: string;
};

function splitFullName(fullName: string) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

function mapAccountToProfileUser(account: any): ProfileUser {
  const firstName = String(account?.firstName || "").trim();
  const lastName = String(account?.lastName || "").trim();
  const fullName = String(account?.fullName || [firstName, lastName].filter(Boolean).join(" ").trim() || "Sabi User");
  const usernameValue = String(account?.username || "").trim().replace(/^@+/, "");
  const username = usernameValue ? `@${usernameValue}` : "@sabi";
  const avatarLetter = String(account?.avatarLetter || fullName.charAt(0).toUpperCase() || "S");
  return {
    avatarLetter,
    avatarUri: account?.avatarUri ?? null,
    fullName,
    username,
    phone: String(account?.phone || "").trim(),
    email: String(account?.email || "").trim(),
    birthDate: String(account?.birthday || account?.birthDate || "").trim(),
    gender: String(account?.gender || "").trim(),
    country: String(account?.country || "").trim(),
    countryCode: String(account?.countryCode || "").trim(),
    region: String(account?.region || "").trim(),
    city: String(account?.city || "").trim(),
    street: String(account?.street || "").trim(),
    building: String(account?.building || "").trim(),
    apartment: String(account?.apartment || "").trim(),
    language: String(account?.languageCode || account?.language || "").trim(),
    bio: String(account?.bio || "").trim(),
    sabiId: String(account?.sabiDisplayId || account?.userId || "").trim(),
    verificationStatus: account?.verificationStatus === "verified" ? "verified" : "unverified",
    joinedDate: String(account?.createdAt || "").trim(),
    statusMode: String(account?.statusMode || "").trim() || "public",
  } as ProfileUser;
}

function buildState(): ProfileState {
  const account = profileKernelFacade.selectors.account();
  const channel = profileKernelFacade.selectors.channelPreview();
  return {
    user: mapAccountToProfileUser(account),
    accentKey: "blue",
    channelHandle: String(channel?.username || "").trim(),
    updatedAt: String(account?.updatedAt || new Date().toISOString()),
  };
}

export const profileStore = {
  getState(): ProfileState {
    return buildState();
  },

  subscribe(listener: () => void) {
    return profileKernelFacade.subscribe(() => listener());
  },

  setState(_nextState: ProfileState) {
    // profile state is kernel-owned now
  },

  async updateUser(patch: Partial<ProfileUser>) {
    const currentUser = profileStore.getState().user;
    const nextFullName = typeof patch.fullName === "string" ? patch.fullName : currentUser.fullName;
    const split = splitFullName(nextFullName);

    await profileKernelFacade.updateProfile({
      firstName: split.firstName,
      lastName: split.lastName,
      username: typeof patch.username === "string" ? patch.username.replace(/^@+/, "") : String(currentUser.username || "").replace(/^@+/, ""),
      phone: typeof patch.phone === "string" ? patch.phone : currentUser.phone,
      email: typeof patch.email === "string" ? patch.email : currentUser.email,
      birthday: typeof patch.birthDate === "string" ? patch.birthDate : currentUser.birthDate,
      bio: typeof patch.bio === "string" ? patch.bio : currentUser.bio,
      country: typeof patch.country === "string" ? patch.country : currentUser.country,
      countryCode: typeof patch.countryCode === "string" ? patch.countryCode : currentUser.countryCode,
      region: typeof patch.region === "string" ? patch.region : currentUser.region,
      city: typeof patch.city === "string" ? patch.city : currentUser.city,
      street: typeof patch.street === "string" ? patch.street : currentUser.street,
      building: typeof patch.building === "string" ? patch.building : currentUser.building,
      apartment: typeof patch.apartment === "string" ? patch.apartment : currentUser.apartment,
      avatarUri: patch.avatarUri === undefined ? currentUser.avatarUri : patch.avatarUri,
      avatarLetter: typeof patch.avatarLetter === "string" ? patch.avatarLetter : currentUser.avatarLetter,
      verificationStatus: patch.verificationStatus === "verified" ? "verified" : currentUser.verificationStatus,
      languageCode: typeof patch.language === "string" ? patch.language : currentUser.language,
      updatedAt: new Date().toISOString(),
    } as any);
  },

  async updateProfile(payload: { user?: Partial<ProfileUser>; accentKey?: ProfileAccentKey; channelHandle?: string; }) {
    if (payload.user) {
      await this.updateUser(payload.user);
    }
  },

  async reset() {
    await profileKernelFacade.refresh();
  },
};

export function useProfileStore<T>(selector: (state: ProfileState) => T): T {
  return useSyncExternalStore(
    profileStore.subscribe,
    () => selector(profileStore.getState()),
    () => selector(profileStore.getState()),
  );
}
