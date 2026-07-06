import { Linking } from "react-native";
import { router } from "expo-router";

import type {
  SabiQrFunctionCode,
  SabiQrFunctionDefinition,
  SabiQrTokenRecord,
} from "../contracts/universalQr.contracts";
import type { SabiQrScanClassification } from "./qrScanClassifier";

export type SabiQrActionRouteResult =
  | "profile_opened"
  | "messenger_contact_opened"
  | "phone_contact_opened"
  | "external_url_opened";

type QrRouteHref = { pathname: string; params?: Record<string, string | undefined> };

type ResolvedQrIdentity = {
  userId: string;
  chatId: string;
  displayName: string;
  username: string;
  phone: string;
  avatarUrl: string;
  coverUrl: string;
  subtitle: string;
  verified: boolean;
  aliases: string[];
};

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : String(value ?? "").trim();
}

function cleanUsername(value: unknown): string {
  return normalizeString(value).replace(/^@+/, "");
}

function compactStrings(items: Array<unknown>): string[] {
  return Array.from(new Set(items.map(normalizeString).filter(Boolean)));
}

function routeReplace(href: QrRouteHref) {
  (router.replace as unknown as (nextHref: QrRouteHref) => void)(href);
}

function metadataString(
  token: Pick<SabiQrTokenRecord, "metadata"> | null | undefined,
  keys: string[],
): string {
  const metadata = token?.metadata;
  if (!metadata || typeof metadata !== "object") return "";
  const record = metadata as Record<string, unknown>;
  for (const key of keys) {
    const value = normalizeString(record[key]);
    if (value) return value;
  }
  return "";
}

function identityFromToken(token: SabiQrTokenRecord): ResolvedQrIdentity {
  const verified = token.verifiedIdentity;
  const firstLast = [verified?.firstName, verified?.lastName]
    .map(normalizeString)
    .filter(Boolean)
    .join(" ");
  const userId =
    normalizeString(verified?.userId) ||
    metadataString(token, ["userId", "profileId", "targetUserId", "peerUserId"]) ||
    normalizeString(token.actorUserId);
  const username =
    cleanUsername(verified?.username) ||
    cleanUsername(metadataString(token, ["username", "publicUsername", "handle"]));
  const displayName =
    normalizeString(verified?.displayName) ||
    metadataString(token, ["displayName", "publicName", "name", "fullName", "title"]) ||
    firstLast ||
    (username ? `@${username}` : "") ||
    userId;
  const phone = metadataString(token, ["phone", "phoneNumber", "phoneMasked"]);
  const avatarUrl = metadataString(token, ["avatarUrl", "avatarUri", "photoUrl", "photoUri"]);
  const coverUrl = metadataString(token, ["coverUrl", "coverUri"]);
  const subtitle =
    metadataString(token, ["subtitle", "publicSubtitle", "bio", "publicBio"]) ||
    (username ? `@${username}` : "");
  const chatId = metadataString(token, ["chatId", "roomId"]) || userId;
  const aliases = compactStrings([
    userId,
    chatId,
    token.actorUserId,
    verified?.sabiDisplayId,
    username,
    phone,
  ]);

  return {
    userId,
    chatId,
    displayName,
    username,
    phone,
    avatarUrl,
    coverUrl,
    subtitle,
    verified: Boolean(verified?.verificationStatus || verified?.profileCompleted || verified),
    aliases,
  };
}

async function enrichIdentityFromPublicProfile(
  identity: ResolvedQrIdentity,
): Promise<ResolvedQrIdentity> {
  const lookup = compactStrings([
    identity.userId,
    identity.chatId,
    identity.username,
    identity.phone,
  ])[0];
  if (!lookup) return identity;

  try {
    const [{ fetchUserPublicProfileSurface }, { getAuthSessionState }] =
      await Promise.all([
        import("../../../shared/api/user-profile-api"),
        import("../../../core/kernel/auth/session.store"),
      ]);
    const auth = getAuthSessionState();
    const profile = await fetchUserPublicProfileSurface(lookup, {
      apiBaseUrl: auth.apiBaseUrl,
      accessToken: auth.accessToken,
      currentUserId: auth.currentUserId,
      timeoutMs: 18000,
    });

    const next: ResolvedQrIdentity = {
      userId: normalizeString(profile.userId) || identity.userId,
      chatId: normalizeString(profile.chatId) || identity.chatId || identity.userId,
      displayName:
        normalizeString(profile.displayName) ||
        normalizeString(profile.publicName) ||
        identity.displayName,
      username: cleanUsername(profile.username) || cleanUsername(profile.publicUsername) || identity.username,
      phone: normalizeString(profile.phone) || identity.phone,
      avatarUrl: normalizeString(profile.avatarUri) || identity.avatarUrl,
      coverUrl: normalizeString(profile.coverUri) || identity.coverUrl,
      subtitle:
        normalizeString(profile.publicSubtitle) ||
        normalizeString(profile.subtitle) ||
        normalizeString(profile.publicBio) ||
        normalizeString(profile.bio) ||
        identity.subtitle,
      verified: identity.verified,
      aliases: compactStrings([
        ...identity.aliases,
        profile.userId,
        profile.chatId,
        profile.username,
        profile.publicUsername,
        profile.phone,
        ...(Array.isArray(profile.aliases) ? profile.aliases : []),
      ]),
    };

    try {
      const { savePublicProfile } = await import(
        "../../messenger/public/publicProfileRuntime"
      );
      savePublicProfile(next.chatId || next.userId || lookup, profile, next.aliases);
    } catch {
      // Public profile cache must never block QR navigation.
    }

    return next;
  } catch {
    return identity;
  }
}

function profileRouteParams(identity: ResolvedQrIdentity): Record<string, string> {
  const chatId = identity.chatId || identity.userId;
  const peerId = identity.userId || identity.chatId;
  const params: Record<string, string> = {
    id: chatId,
    chatId,
    roomId: chatId,
    roomType: "direct",
    name: identity.displayName || peerId || "Sabi",
    verified: identity.verified ? "1" : "0",
  };

  if (peerId) {
    params.userId = peerId;
    params.peerId = peerId;
    params.peerUserId = peerId;
    params.partnerId = peerId;
    params.targetUserId = peerId;
  }
  if (identity.username) {
    params.handle = identity.username;
    params.username = identity.username;
    params.peerUsername = identity.username;
  }
  if (identity.phone) {
    params.phone = identity.phone;
    params.peerPhone = identity.phone;
  }
  if (identity.avatarUrl) {
    params.avatarUrl = identity.avatarUrl;
    params.photoUrl = identity.avatarUrl;
  }
  if (identity.coverUrl) params.coverUrl = identity.coverUrl;
  if (identity.subtitle) params.subtitle = identity.subtitle;

  return params;
}

async function openProfileInfo(identity: ResolvedQrIdentity) {
  const hydrated = await enrichIdentityFromPublicProfile(identity);
  routeReplace({ pathname: "/chat-partner-info", params: profileRouteParams(hydrated) });
}

async function openMessengerAndSaveContact(identity: ResolvedQrIdentity) {
  const hydrated = await enrichIdentityFromPublicProfile(identity);
  const [{ getAuthSessionState }, contactsRuntime, roomNavigation] = await Promise.all([
    import("../../../core/kernel/auth/session.store"),
    import("../../messenger/contacts/messengerContactsRuntime"),
    import("../../messenger/navigation/messengerRoomNavigation"),
  ]);
  const auth = getAuthSessionState();
  const currentUserId = normalizeString(auth.currentUserId);
  const peerUserId = hydrated.userId || hydrated.chatId || hydrated.phone || hydrated.username;
  const fallbackChatId = hydrated.chatId || peerUserId;
  const chatId = contactsRuntime.buildDirectMessengerChatId({
    currentUserId,
    peerUserId,
    fallback: fallbackChatId,
  });
  const saved = await contactsRuntime.upsertCustomMessengerContact({
    id: peerUserId ? `sabi-${peerUserId}` : undefined,
    chatId,
    name: hydrated.displayName || hydrated.phone || hydrated.username || "Sabi Contact",
    phone: hydrated.phone || undefined,
    username: hydrated.username || undefined,
    verified: hydrated.verified,
    official: false,
    avatarUrl: hydrated.avatarUrl || undefined,
    roomType: "direct",
    source: "sabi",
    currentUserId: currentUserId || undefined,
    peerUserId: hydrated.userId || undefined,
  });

  await roomNavigation.openMessengerRoom({
    id: saved.chatId,
    chatId: saved.chatId,
    roomId: saved.chatId,
    name: saved.name,
    roomType: "direct",
    verified: saved.verified ? "1" : "0",
    avatarLetter: saved.avatarLetter,
    avatarUrl: saved.avatarUrl || hydrated.avatarUrl || undefined,
    photoUrl: saved.avatarUrl || hydrated.avatarUrl || undefined,
    currentUserId: currentUserId || undefined,
    peerUserId: hydrated.userId || saved.peerUserId || peerUserId || undefined,
    peerId: hydrated.userId || saved.peerUserId || peerUserId || undefined,
    targetUserId: hydrated.userId || saved.peerUserId || peerUserId || undefined,
    phone: saved.phone || hydrated.phone || undefined,
    peerPhone: saved.phone || hydrated.phone || undefined,
    username: saved.username || hydrated.username || undefined,
    peerUsername: saved.username || hydrated.username || undefined,
    markRead: true,
  });
}

function classificationIdentity(classification: SabiQrScanClassification): ResolvedQrIdentity | null {
  const rawTarget = normalizeString(classification.routeParam || classification.displayValue);
  if (!rawTarget || rawTarget === "—") return null;
  const username = rawTarget.startsWith("@") ? cleanUsername(rawTarget) : "";
  const phone = /^\+?\d{7,15}$/.test(rawTarget) ? rawTarget : "";
  const userId = !username && !phone ? rawTarget : "";
  const displayName = username ? `@${username}` : phone || userId;

  return {
    userId,
    chatId: userId || phone || username,
    displayName,
    username,
    phone,
    avatarUrl: "",
    coverUrl: "",
    subtitle: username ? `@${username}` : phone,
    verified: false,
    aliases: compactStrings([userId, username, phone]),
  };
}

function isIdentityFunction(code?: SabiQrFunctionCode | null) {
  return code === "profile_identity" || code === "messenger_profile";
}

function isProfileSurface(surface?: string | null) {
  return surface === "profile" || surface === "verification";
}

function isMessengerSurface(surface?: string | null) {
  return surface === "messenger";
}

export async function tryOpenClassifiedSabiQrAction(
  classification: SabiQrScanClassification,
  rawValue: string,
): Promise<SabiQrActionRouteResult | null> {
  if (!classification.ok || classification.status !== "success") return null;

  if (classification.kind === "phone_number") {
    const phone = normalizeString(classification.routeParam || classification.displayValue);
    if (!phone) return null;
    await openMessengerAndSaveContact({
      userId: "",
      chatId: phone,
      displayName: phone,
      username: "",
      phone,
      avatarUrl: "",
      coverUrl: "",
      subtitle: phone,
      verified: false,
      aliases: [phone],
    });
    return "phone_contact_opened";
  }

  if (classification.kind === "external_url") {
    const canOpen = await Linking.canOpenURL(rawValue);
    if (!canOpen) return null;
    await Linking.openURL(rawValue);
    return "external_url_opened";
  }

  if (
    classification.kind !== "sabi_app_link" ||
    (!isIdentityFunction(classification.functionCode) &&
      !isProfileSurface(classification.surface) &&
      !isMessengerSurface(classification.surface))
  ) {
    return null;
  }

  const identity = classificationIdentity(classification);
  if (!identity) return null;

  if (
    classification.functionCode === "messenger_profile" ||
    isMessengerSurface(classification.surface)
  ) {
    await openMessengerAndSaveContact(identity);
    return "messenger_contact_opened";
  }

  await openProfileInfo(identity);
  return "profile_opened";
}

export async function tryOpenResolvedSabiQrAction(params: {
  token: SabiQrTokenRecord;
  definition: SabiQrFunctionDefinition;
}): Promise<SabiQrActionRouteResult | null> {
  const { token, definition } = params;
  if (definition.executionPolicy !== "identity_open_only") return null;

  const identity = identityFromToken(token);
  if (!identity.userId && !identity.chatId && !identity.phone && !identity.username) {
    return null;
  }

  if (definition.code === "messenger_profile" || definition.surface === "messenger") {
    await openMessengerAndSaveContact(identity);
    return "messenger_contact_opened";
  }

  await openProfileInfo(identity);
  return "profile_opened";
}
