export type VideoCallParticipantRole = "CALLER" | "CALLEE" | "PARTICIPANT";

export type VideoCallParticipant = {
  userId: string;
  name: string;
  avatarLetter: string;
  avatarUrl?: string;
  role: VideoCallParticipantRole;
  isSelf?: boolean;
  micEnabled?: boolean;
  cameraEnabled?: boolean;
  speaking?: boolean;
};

export type MessengerCallParticipantInput = {
  id?: string | null;
  userId?: string | null;
  participantUserId?: string | null;
  memberUserId?: string | null;
  peerId?: string | null;
  role?: string | null;
  displayName?: string | null;
  name?: string | null;
  title?: string | null;
  avatarUri?: string | null;
  avatarUrl?: string | null;
  photoUrl?: string | null;
  isSelf?: boolean | null;
  micEnabled?: boolean | null;
  cameraEnabled?: boolean | null;
};

export type MessengerFallbackCallPeer = {
  userId?: string | null;
  name?: string | null;
  avatarLetter?: string | null;
  avatarUrl?: string | null;
  role?: VideoCallParticipantRole;
};

export type BuildMessengerCallParticipantsArgs = {
  participants?: MessengerCallParticipantInput[] | null;
  currentUserId?: string | null;
  currentUserName?: string | null;
  currentUserAvatarLetter?: string | null;
  currentUserAvatarUrl?: string | null;
  fallbackPeer?: MessengerFallbackCallPeer | null;
};

function text(value?: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function resolveCallAvatarLetter(name?: string | null, fallback?: string | null): string {
  const source = text(fallback) || text(name) || "S";
  const match = source.match(/[A-Za-z\u0410-\u042F\u0430-\u044F\u0401\u04510-9]/u);
  return String(match?.[0] || source[0] || "S").toUpperCase();
}

function participantUserId(item: MessengerCallParticipantInput): string {
  return text(item.userId) || text(item.participantUserId) || text(item.memberUserId) || text(item.peerId) || text(item.id);
}

function participantName(item: MessengerCallParticipantInput): string {
  return text(item.displayName) || text(item.name) || text(item.title);
}

function participantAvatar(item: MessengerCallParticipantInput): string | undefined {
  return text(item.avatarUri) || text(item.avatarUrl) || text(item.photoUrl) || undefined;
}

function role(value?: string | null, isSelf = false): VideoCallParticipantRole {
  const normalized = text(value).toUpperCase();
  if (normalized === "CALLER" || normalized === "OWNER") return "CALLER";
  if (normalized === "CALLEE") return "CALLEE";
  return isSelf ? "CALLER" : "PARTICIPANT";
}

function unique(items: VideoCallParticipant[]): VideoCallParticipant[] {
  const seen = new Set<string>();
  const result: VideoCallParticipant[] = [];

  for (const item of items) {
    if (!item.userId || seen.has(item.userId)) continue;
    seen.add(item.userId);
    result.push(item);
  }

  return result;
}

export function buildMessengerCallParticipants(args: BuildMessengerCallParticipantsArgs): VideoCallParticipant[] {
  const currentUserId = text(args.currentUserId);
  const result: VideoCallParticipant[] = [];

  for (const item of args.participants ?? []) {
    const userId = participantUserId(item);
    if (!userId) continue;

    const isSelf = Boolean(item.isSelf) || Boolean(currentUserId && userId === currentUserId);
    const name = participantName(item) || (isSelf ? "You" : userId);

    result.push({
      userId,
      name,
      avatarLetter: resolveCallAvatarLetter(name),
      avatarUrl: participantAvatar(item),
      role: role(item.role, isSelf),
      isSelf,
      micEnabled: item.micEnabled !== false,
      cameraEnabled: item.cameraEnabled !== false,
      speaking: false,
    });
  }

  if (currentUserId && !result.some((item) => item.userId === currentUserId)) {
    const name = text(args.currentUserName) || "You";
    result.unshift({
      userId: currentUserId,
      name,
      avatarLetter: resolveCallAvatarLetter(name, args.currentUserAvatarLetter),
      avatarUrl: text(args.currentUserAvatarUrl) || undefined,
      role: "CALLER",
      isSelf: true,
      micEnabled: true,
      cameraEnabled: true,
      speaking: false,
    });
  }

  const fallbackUserId = text(args.fallbackPeer?.userId);

  if (fallbackUserId && !result.some((item) => item.userId === fallbackUserId)) {
    const name = text(args.fallbackPeer?.name) || fallbackUserId;
    result.push({
      userId: fallbackUserId,
      name,
      avatarLetter: resolveCallAvatarLetter(name, args.fallbackPeer?.avatarLetter),
      avatarUrl: text(args.fallbackPeer?.avatarUrl) || undefined,
      role: args.fallbackPeer?.role ?? "CALLEE",
      isSelf: false,
      micEnabled: true,
      cameraEnabled: true,
      speaking: false,
    });
  }

  return unique(result);
}

export function encodeMessengerCallParticipants(participants: VideoCallParticipant[]): string {
  try {
    return JSON.stringify(unique(participants));
  } catch {
    return "[]";
  }
}

export function countMessengerCallParticipants(participants: VideoCallParticipant[]): number {
  return unique(participants).length;
}
