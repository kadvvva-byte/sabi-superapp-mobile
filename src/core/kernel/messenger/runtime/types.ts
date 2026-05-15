import type {
  MessengerKernelAnimatedPayload,
  MessengerKernelMessageRecord,
  MessengerKernelParticipantRecord,
  MessengerKernelRoomRecord,
  MessengerKernelSessionSnapshot,
} from "../core/types";

export type MessengerKernelRoomGraph = {
  room?: MessengerKernelRoomRecord | null;
  messages?: MessengerKernelMessageRecord[] | null;
  participants?: MessengerKernelParticipantRecord[] | null;
};

export type MessengerKernelHydrateRoomGraphInput = {
  chatId: string;
  currentUserId?: string | null;
  messageLimit?: number | null;
  participantLimit?: number | null;
};

export type MessengerKernelSendMessageInput = {
  chatId: string;
  userId?: string | null;
  peerUserId?: string | null;
  peerId?: string | null;
  partnerId?: string | null;
  targetUserId?: string | null;
  peerPhone?: string | null;
  phone?: string | null;
  peerUsername?: string | null;
  username?: string | null;
  handle?: string | null;
  type?: string | null;
  content?: string | null;
  text?: string | null;
  replyToMessageId?: string | null;
  forwardedFromMessageId?: string | null;
  forwardedFromChatId?: string | null;
  forwardedFromUserId?: string | null;
  forwardedFromLabel?: string | null;
  originalMessageId?: string | null;
  previewTitle?: string | null;
  previewSubtitle?: string | null;
  fileLabel?: string | null;
  mimeType?: string | null;
  mediaUri?: string | null;
  durationMs?: number | null;
  durationLabel?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  animatedPayload?: MessengerKernelAnimatedPayload | null;
  [key: string]: unknown;
};

export type MessengerKernelUpdateMessageInput = {
  id?: string | null;
  messageId?: string | null;
  chatId?: string | null;
  userId?: string | null;
  content?: string | null;
  text?: string | null;
  editedAt?: string | null;
  forwardedFromMessageId?: string | null;
  forwardedFromChatId?: string | null;
  forwardedFromUserId?: string | null;
  forwardedFromLabel?: string | null;
  originalMessageId?: string | null;
  previewTitle?: string | null;
  previewSubtitle?: string | null;
  fileLabel?: string | null;
  [key: string]: unknown;
};

export type MessengerKernelDeleteMessageInput = {
  id?: string | null;
  messageId?: string | null;
  chatId?: string | null;
  scope?: "me" | "all" | "everyone" | null;
  deleteForMe?: boolean | null;
  forMe?: boolean | null;
  [key: string]: unknown;
};

export type MessengerKernelUploadMediaInput = {
  chatId: string;
  userId?: string | null;
  uri: string;
  name: string;
  mimeType: string;
  replyToMessageId?: string | null;
  type?: string | null;
  [key: string]: unknown;
};

export type MessengerKernelUploadMediaResult = {
  mediaUri?: string | null;
  url?: string | null;
  fileUrl?: string | null;
  attachmentUrl?: string | null;
  assetUrl?: string | null;
  downloadUrl?: string | null;
  [key: string]: unknown;
};

export type MessengerKernelRuntimeContext = {
  session: MessengerKernelSessionSnapshot;
};

export type MessengerKernelRuntimeConfig = {
  hydrateRoomGraph?: (
    input: MessengerKernelHydrateRoomGraphInput,
    context: MessengerKernelRuntimeContext,
  ) => Promise<MessengerKernelRoomGraph | null | undefined> | MessengerKernelRoomGraph | null | undefined;
  sendMessage?: (
    input: MessengerKernelSendMessageInput,
    context: MessengerKernelRuntimeContext,
  ) => Promise<unknown> | unknown;
  updateMessage?: (
    input: MessengerKernelUpdateMessageInput,
    context: MessengerKernelRuntimeContext,
  ) => Promise<unknown> | unknown;
  deleteMessage?: (
    input: MessengerKernelDeleteMessageInput,
    context: MessengerKernelRuntimeContext,
  ) => Promise<unknown> | unknown;
  markMessageRead?: (
    messageId: string,
    context: MessengerKernelRuntimeContext,
  ) => Promise<unknown> | unknown;
  uploadMedia?: (
    input: MessengerKernelUploadMediaInput,
    context: MessengerKernelRuntimeContext,
  ) => Promise<MessengerKernelUploadMediaResult | unknown> | MessengerKernelUploadMediaResult | unknown;
};