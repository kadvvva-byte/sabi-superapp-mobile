import { Audio, ResizeMode, Video } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  CheckCheck,
  ChevronDown,
  Copy,
  Download,
  Edit3,
  FileText,
  Forward,
  Gift,
  Heart,
  Images,
  Link2,
  Lock,
  LucideIcon,
  MapPin,
  Mic,
  MoreHorizontal,
  Pause,
  PhoneCall,
  Play,
  Reply,
  Search,
  Send,
  Sparkles,
  StickyNote,
  Trash2,
  User,
  Video as VideoIcon,
  X
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  Alert,
  Easing,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  Animated as RNAnimated,
  ScrollView,
  Share,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputContentSizeChangeEventData,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { getAuthSessionState } from "../../../core/kernel/auth/session.store";
import { useI18n } from "../../../shared/i18n";
import { resolveCurrentSabiChatLocation, watchSabiChatLiveLocation } from "./services/chatRoomLocation";

import {
  getMessengerThemePalette,
  getMessengerThemeState,
  hydrateMessengerThemeState,
  type MessengerThemePalette,
  type MessengerThemeState,
} from "../theme/messengerThemeRuntime";

import {
  clearMessengerKernelRoomMessagesForMe,
  deleteMessengerKernelMessage,
  deleteMessengerKernelMessageForMe,
  emitMessengerKernelMessageDelivered,
  emitMessengerKernelMessageRead,
  getMessengerKernelRoomMessages,
  getMessengerKernelRoomParticipants,
  hydrateMessengerKernelRoomGraph,
  ensureMessengerKernelRoomSnapshot,
  markMessengerKernelMessageRead,
  sendMessengerKernelMessage,
  setMessengerKernelRoomBlocked,
  subscribeMessengerKernelRoom,
  updateMessengerKernelMessage,
  uploadMessengerKernelMedia,
} from "../../../core/kernel/messenger";
import {
  selectMessengerPresenceByUserId,
  selectMessengerRealtimeStatus,
  selectMessengerTypingByChatId,
} from "../../../core/kernel/messenger/core/selectors";
import { getMessengerKernelState, subscribeMessengerKernelStore } from "../../../core/kernel/messenger/core/store";
import {
  emitMessengerKernelRoomPresenceHandshake,
  emitMessengerKernelTyping,
} from "../../../core/kernel/messenger/facade";
import { getGiftById } from "../gifts/giftAssetMap";
import {
  hydrateGroupPublicProfile,
  hydrateGroupPublicProfileStorage,
  subscribeGroupPublicProfiles,
} from "../groups/groupPublicProfileRuntime";
import {
  canInviteToGroup,
  getGroupInviteLink,
} from "../groups/groupModerationRuntime";
import { ensureMessengerDirectRoom, fetchMessengerUsers } from "../contacts/messengerContactsApi";
import { registerPersistedChatRoom,
  hydratePersistedChatClearAt,
  clearPersistedChatMessagesForUser,
  hidePersistedChatMessagesForUser,
  hydratePersistedChatHiddenMessageIds,
  persistClearedChatHiddenMessageIds
} from "./services/chatRoomRealtime";
import { listCustomMessengerContacts, upsertCustomMessengerContact } from "../contacts/messengerContactsRuntime";
import { openMessengerRoom } from "../navigation/messengerRoomNavigation";
import {
  hydratePublicProfile,
  hydratePublicProfileByAnyIdentifier,
  hydratePublicProfileStorage,
  savePublicProfile,
  subscribePublicProfiles,
} from "../public/publicProfileRuntime";
import { fetchUserPublicProfileSurface } from "../../../shared/api/user-profile-api";
import { ChatRoomSettingsMenu } from "./ChatRoomSettingsMenu";
import {
  getChatMeta,
  getChatPhone,
  getRoomSettingsState,
  markChatReported,
  markHomeShortcutPinned,
  setChatAddedToList,
  setChatBlocked,
  setChatDisappearingEnabled,
  setChatMuted,
  setChatSavedToSystemContacts,
} from "./data";
import {
  AnimatedEmojiItem,
  AnimatedEmojiSheet,
} from "./overlays/AnimatedEmojiSheet";
import AnimatedGiftSheet, {
  AnimatedGiftSelectionPayload,
} from "./overlays/AnimatedGiftSheet";
import { AnimatedHubAction, AnimatedHubSheet } from "./overlays/AnimatedHubSheet";
import {
  AnimatedPlaybackOverlay,
  AnimatedPlaybackPayload,
} from "./overlays/AnimatedPlaybackOverlay";
import {
  AnimatedReactionItem,
  AnimatedReactionSheet,
} from "./overlays/AnimatedReactionSheet";
import { AttachmentActionId, AttachmentSheet } from "./overlays/AttachmentSheet";
import { ContactQuickSheet, type ContactOption } from "./overlays/ContactQuickSheet";
import { DocumentQuickSheet } from "./overlays/DocumentQuickSheet";
import DefaultLinkActionSheet, { LinkActionSheet as NamedLinkActionSheet } from "./overlays/LinkActionSheet";
import DefaultLocationQuickSheet, { LocationQuickSheet as NamedLocationQuickSheet } from "./overlays/LocationQuickSheet";
import DefaultMessageOverflowMenu, { MessageOverflowMenu as NamedMessageOverflowMenu, OverflowAction } from "./overlays/MessageOverflowMenu";
import DefaultMessageTopActionBar, { MessageTopActionBar as NamedMessageTopActionBar } from "./overlays/MessageTopActionBar";
import DefaultReactionPickerPopover, { ReactionPickerPopover as NamedReactionPickerPopover } from "./overlays/ReactionPickerPopover";
import DefaultSaveMediaSheet, { SaveMediaSheet as NamedSaveMediaSheet } from "./overlays/SaveMediaSheet";
import { StickerReactionSheet } from "./overlays/StickerReactionSheet";
import { getPremiumAnimatedPreviewSource } from "./premiumAnimatedAssetMap";
import {
  saveChatPartnerToSystemContacts,
  shareChatExport,
} from "./roomSettingsDeviceApi";
import {
  ChatBackgroundPreset,
  ChatMeta,
  MessageItem,
  MessageReplyRef,
  RoomSettingsToolId,
} from "./types";
import {
  openDocumentUniversal,
  openLocationUniversal,
  saveAttachmentToPhone,
  saveAttachmentToSabiGallery,
} from "./utils/attachmentOpen";
import {
  pickGalleryAsset,
  listPhoneContacts,
  pickPhoneContact,
  pickPhoneDocument,
  pickUserLocation,
  startVoiceRecording,
  stopVoiceRecording,
  VoiceMessageResult,
} from "./utils/deviceAccess";
import { getVideoEffectPreset } from "./videoEffects";
import { VideoCaptureResult, VideoMessageCaptureScreen } from "./VideoMessageCaptureScreen";
import { UniversalVideoPlayer } from "./UniversalVideoPlayer";
import { resolveSabiApiBaseUrl } from "../../../shared/network/sabiApiBaseUrl";
import { translateMessengerInlineMessage } from "../../ai/services/aiMessengerInlineTranslation";
import {
  AI_TRANSLATION_TARGET_LANGUAGES,
  getTranslationLanguageLabel,
  type AiTranslationLanguageCode,
} from "../../ai/translation/aiTranslationLanguages";

const ReactionPickerPopover = NamedReactionPickerPopover ?? DefaultReactionPickerPopover;
const MessageTopActionBar = NamedMessageTopActionBar ?? DefaultMessageTopActionBar;
const MessageOverflowMenu = NamedMessageOverflowMenu ?? DefaultMessageOverflowMenu;
const LinkActionSheet = NamedLinkActionSheet ?? DefaultLinkActionSheet;
const SaveMediaSheet = NamedSaveMediaSheet ?? DefaultSaveMediaSheet;
const LocationQuickSheet = NamedLocationQuickSheet ?? DefaultLocationQuickSheet;

const SABI_REACTION_CONTROL_PREFIX = "__SABI_REACTION_V1__:";
const SABI_ANIMATED_CONTROL_PREFIX = "__SABI_ANIMATED_V1__:";

type SabiReactionControlPayload = {
  messageId?: string | null;
  reaction?: string | null;
  emoji?: string | null;
  updatedAt?: string | null;
};

type SabiAnimatedControlPayload = Omit<RealtimeAnimatedPayload, "id" | "emoji" | "title" | "kind" | "subtitle"> & {
  id: string;
  emoji: string;
  title: string;
  subtitle?: string;
  kind: "reaction" | "emoji" | "gift";
  controlKind?: "reaction" | "emoji" | "gift";
};

function safeJsonParseRecord(value: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function encodeSabiControlMessage(prefix: string, payload: Record<string, unknown>) {
  return `${prefix}${JSON.stringify(payload)}`;
}

function parseSabiReactionControl(value?: string | null): SabiReactionControlPayload | null {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw.startsWith(SABI_REACTION_CONTROL_PREFIX)) return null;

  const parsed = safeJsonParseRecord(raw.slice(SABI_REACTION_CONTROL_PREFIX.length));
  if (!parsed) return null;

  const messageId = typeof parsed.messageId === "string" ? parsed.messageId.trim() : "";
  const reaction =
    typeof parsed.reaction === "string" && parsed.reaction.trim()
      ? parsed.reaction.trim()
      : typeof parsed.emoji === "string" && parsed.emoji.trim()
        ? parsed.emoji.trim()
        : "";

  if (!messageId || !reaction) return null;

  return {
    messageId,
    reaction,
    emoji: reaction,
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
  };
}

function parseSabiAnimatedControl(value?: string | null): SabiAnimatedControlPayload | null {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw.startsWith(SABI_ANIMATED_CONTROL_PREFIX)) return null;

  const parsed = safeJsonParseRecord(raw.slice(SABI_ANIMATED_CONTROL_PREFIX.length));
  if (!parsed) return null;

  const id = typeof parsed.id === "string" && parsed.id.trim() ? parsed.id.trim() : `animated_${Date.now()}`;
  const emoji = typeof parsed.emoji === "string" && parsed.emoji.trim() ? parsed.emoji.trim() : "✨";
  const title = typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim() : "Animated";
  const subtitle =
    typeof parsed.subtitle === "string" && parsed.subtitle.trim() ? parsed.subtitle.trim() : title;
  const kind: "reaction" | "emoji" | "gift" =
    parsed.kind === "gift" || parsed.controlKind === "gift"
      ? "gift"
      : parsed.kind === "emoji" || parsed.controlKind === "emoji"
        ? "emoji"
        : "reaction";
  const durationMs = typeof parsed.durationMs === "number" && Number.isFinite(parsed.durationMs)
    ? parsed.durationMs
    : undefined;

  return {
    id,
    emoji,
    title,
    subtitle,
    durationMs,
    kind,
    controlKind: kind,
    premium: parsed.premium === true,
  };
}

function isSabiHiddenControlMessage(value?: string | null) {
  const raw = typeof value === "string" ? value.trim() : "";
  return raw.startsWith(SABI_REACTION_CONTROL_PREFIX);
}

type RealtimeMessageType =
  | "TEXT"
  | "VOICE"
  | "IMAGE"
  | "VIDEO"
  | "DOCUMENT"
  | "CONTACT"
  | "LOCATION"
  | "GIFT"
  | "ANIMATED_REACTION"
  | "ANIMATED_EMOJI";

type RealtimeAnimatedPayload = {
  id?: string;
  emoji?: string;
  title?: string;
  subtitle?: string;
  durationMs?: number;
  kind?: "reaction" | "emoji" | "gift";
  premium?: boolean;
};

type RealtimeIncomingMessage = {
  id: string;
  clientId?: string | null;
  chatId: string;
  userId: string;
  type: RealtimeMessageType;
  content?: string | null;
  createdAt: string;
  deliveredAt?: string | null;
  readAt?: string | null;
  editedAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  isDeleted?: boolean | null;
  forwardedFromMessageId?: string | null;
  forwardedFromChatId?: string | null;
  forwardedFromUserId?: string | null;
  forwardedFromLabel?: string | null;
  originalMessageId?: string | null;
  replyToMessageId?: string | null;
  previewTitle?: string | null;
  previewSubtitle?: string | null;
  fileLabel?: string | null;
  mimeType?: string | null;
  mediaUri?: string | null;
  remoteUri?: string | null;
  thumbnailUri?: string | null;
  fileSizeLabel?: string | null;
  fileName?: string | null;
  durationMs?: number | null;
  durationLabel?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  animatedPayload?: RealtimeAnimatedPayload | null;
};

type BrandMessengerIconKey =
  | "messenger_audio_call"
  | "messenger_video_call"
  | "messenger_search"
  | "messenger_attachment"
  | "messenger_gallery"
  | "messenger_document"
  | "messenger_contact"
  | "messenger_location"
  | "messenger_voice_message"
  | "messenger_video_message"
  | "messenger_stickers"
  | "messenger_reactions"
  | "messenger_gifts"
  | "messenger_reply"
  | "messenger_forward"
  | "messenger_edit_message"
  | "messenger_delete_message"
  | "messenger_copy"
  | "messenger_save_media"
  | "messenger_link_open"
  | "messenger_partner_profile";

type BrandIconTone = "default" | "active" | "premium" | "danger" | "muted";

const BRAND_ICON_COLORS = {
  default: "#58D5C9",
  active: "#77E28C",
  premium: "#FFCC66",
  danger: "#FF6B76",
  muted: "#A8C3D7",
} as const;

const BRAND_ICON_MAP: Record<BrandMessengerIconKey, LucideIcon> = {
  messenger_audio_call: PhoneCall,
  messenger_video_call: VideoIcon,
  messenger_search: Search,
  messenger_attachment: FileText,
  messenger_gallery: Images,
  messenger_document: FileText,
  messenger_contact: User,
  messenger_location: MapPin,
  messenger_voice_message: Mic,
  messenger_video_message: VideoIcon,
  messenger_stickers: StickyNote,
  messenger_reactions: Heart,
  messenger_gifts: Gift,
  messenger_reply: Reply,
  messenger_forward: Forward,
  messenger_edit_message: Edit3,
  messenger_delete_message: Trash2,
  messenger_copy: Copy,
  messenger_save_media: Images,
  messenger_link_open: Link2,
  messenger_partner_profile: User,
};

function MessengerBrandIcon({
  icon,
  tone = "default",
  size = 18,
  color,
}: {
  icon: BrandMessengerIconKey;
  tone?: BrandIconTone;
  size?: number;
  color?: string;
}) {
  const IconComponent = BRAND_ICON_MAP[icon];
  return <IconComponent size={size} strokeWidth={2.3} color={color ?? BRAND_ICON_COLORS[tone]} />;
}


function GlassCircleActionButton({
  onPress,
  colors,
  children,
  animated = false,
  style,
}: {
  onPress: () => void;
  colors: [string, string] | [string, string, string];
  children: React.ReactNode;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const pulse = useRef(new RNAnimated.Value(0.92)).current;
  const shimmer = useRef(new RNAnimated.Value(0)).current;
  const pressScale = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    if (!animated) return;

    const pulseLoop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulse, {
          toValue: 1.12,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        RNAnimated.timing(pulse, {
          toValue: 0.92,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const shimmerLoop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(shimmer, {
          toValue: 1,
          duration: 2100,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        RNAnimated.timing(shimmer, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    pulseLoop.start();
    shimmerLoop.start();

    return () => {
      pulseLoop.stop();
      shimmerLoop.stop();
    };
  }, [animated, pulse, shimmer]);

  const onPressIn = () => {
    RNAnimated.spring(pressScale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 32,
      bounciness: 5,
    }).start();
  };

  const onPressOut = () => {
    RNAnimated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 28,
      bounciness: 6,
    }).start();
  };

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-26, 26],
  });

  const pulseOpacity = pulse.interpolate({
    inputRange: [0.92, 1.12],
    outputRange: [0.12, 0.03],
  });

  return (
    <RNAnimated.View
      style={[
        styles.glassActionButtonOuter,
        style,
        {
          transform: [{ scale: pressScale }],
        },
      ]}
    >
      {animated ? (
        <RNAnimated.View
          pointerEvents="none"
          style={[
            styles.glassActionButtonPulse,
            {
              opacity: pulseOpacity,
              transform: [{ scale: pulse }],
            },
          ]}
        />
      ) : null}

      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.glassActionPressable}>
        <LinearGradient colors={colors} style={styles.glassActionButton}>
          <View style={styles.glassActionButtonEdge} />
          <View style={styles.glassActionGloss} />
          {animated ? (
            <RNAnimated.View
              pointerEvents="none"
              style={[
                styles.glassActionShimmer,
                {
                  transform: [{ translateX: shimmerTranslate }, { rotate: "18deg" }],
                },
              ]}
            />
          ) : null}
          {children}
        </LinearGradient>
      </Pressable>
    </RNAnimated.View>
  );
}

function ComposerStickerButtonIcon() {
  return (
    <View style={styles.stickerButtonIconWrap}>
      <View style={styles.stickerButtonBody}>
        <View style={styles.stickerFoldCorner} />
        <View style={styles.stickerEyeRow}>
          <View style={styles.stickerEyeDot} />
          <View style={styles.stickerEyeDot} />
        </View>
        <View style={styles.stickerSmile} />
      </View>
    </View>
  );
}

function resolveAvatarLetter(meta: Pick<ChatMeta, "avatarLetter" | "name">) {
  const raw = String(meta.avatarLetter || meta.name || "").trim();
  const normalized = raw.replace(/^\+/, "");
  const match = normalized.match(/[A-Za-z\u0410-\u042F\u0430-\u044F\u0401\u04510-9]/);
  return String(match?.[0] || raw[0] || "S").toUpperCase();
}

function normalizeContactPhone(value?: string | null) {
  const digits = String(value ?? "").replace(/[^\d+]/g, "").trim();
  return digits || "";
}

function normalizeMessengerUsername(value?: string | null) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";
  return normalized.startsWith("@") ? normalized : `@${normalized}`;
}

function extractMessengerResponseChatId(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const source = value as Record<string, unknown>;
  const data = source.data && typeof source.data === "object" ? (source.data as Record<string, unknown>) : null;
  const message = source.message && typeof source.message === "object" ? (source.message as Record<string, unknown>) : null;
  const dataMessage = data?.message && typeof data.message === "object" ? (data.message as Record<string, unknown>) : null;

  const candidates = [
    source.chatId,
    source.roomId,
    message?.chatId,
    message?.roomId,
    data?.chatId,
    data?.roomId,
    dataMessage?.chatId,
    dataMessage?.roomId,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "";
}

function buildPartnerHandle(name?: string | null, fallback = "sabiuser") {
  const normalized = String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/gi, "_")
    .replace(/^_+|_+$/g, "");
  return `@${normalized || fallback}`;
}

function parseSharedPublicMediaItems(value?: string | null) {
  if (!value) {
    return [] as Array<{
      id?: string;
      uri?: string;
      kind?: "photo" | "video";
      thumbnailUri?: string;
      mediaUri?: string;
      mimeType?: string;
      views?: number;
      duration?: string;
      liked?: boolean;
    }>;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseSharedPublicGiftItems(value?: string | null) {
  if (!value) {
    return [] as Array<{
      id?: string;
      title?: string;
      emoji?: string;
      imageUri?: string;
    }>;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}


function hasMeaningfulDirectPublicProfile(
  snapshot:
    | {
        avatarUri?: string | null;
        publicationPhotos?: Array<{ uri?: string | null }> | null;
        publicationVideos?: Array<{ uri?: string | null }> | null;
        publicGifts?: Array<{
          title?: string | null;
          emoji?: string | null;
          imageUri?: string | null;
        }> | null;
        likesCount?: number | null;
        publicGiftsCount?: number | null;
      }
    | null
    | undefined,
) {
  if (!snapshot) return false;

  const avatarUri = String(snapshot.avatarUri ?? "").trim();
  const photos = Array.isArray(snapshot.publicationPhotos)
    ? snapshot.publicationPhotos.filter((item) => String(item?.uri ?? "").trim().length > 0)
    : [];
  const videos = Array.isArray(snapshot.publicationVideos)
    ? snapshot.publicationVideos.filter((item) => String(item?.uri ?? "").trim().length > 0)
    : [];
  const gifts = Array.isArray(snapshot.publicGifts)
    ? snapshot.publicGifts.filter(
        (item) =>
          String(item?.title ?? "").trim().length > 0 ||
          String(item?.emoji ?? "").trim().length > 0 ||
          String(item?.imageUri ?? "").trim().length > 0,
      )
    : [];
  const likesCount =
    typeof snapshot.likesCount === "number" && Number.isFinite(snapshot.likesCount)
      ? snapshot.likesCount
      : 0;
  const publicGiftsCount =
    typeof snapshot.publicGiftsCount === "number" && Number.isFinite(snapshot.publicGiftsCount)
      ? snapshot.publicGiftsCount
      : 0;

  return Boolean(
    avatarUri ||
      photos.length ||
      videos.length ||
      gifts.length ||
      likesCount > 0 ||
      publicGiftsCount > 0,
  );
}

function pickDirectPublicProfileSnapshot<
  T extends {
    avatarUri?: string | null;
    publicationPhotos?: Array<{ uri?: string | null }> | null;
    publicationVideos?: Array<{ uri?: string | null }> | null;
    publicGifts?: Array<{
      title?: string | null;
      emoji?: string | null;
      imageUri?: string | null;
    }> | null;
    likesCount?: number | null;
    publicGiftsCount?: number | null;
  },
>(...candidates: Array<T | null | undefined>) {
  for (const candidate of candidates) {
    if (hasMeaningfulDirectPublicProfile(candidate)) {
      return candidate as T;
    }
  }

  return null;
}

function safeFormatLocaleDate(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions,
  fallback: string,
) {
  try {
    return new Intl.DateTimeFormat(locale || undefined, options).format(date);
  } catch {
    return fallback;
  }
}

function isRouteStatusOnlineText(value?: string | null) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  return normalized === "online" || normalized === "onlayn" || normalized === "в сети" || normalized === "онлайн";
}

function formatLastSeenText(
  value: string | null | undefined,
  locale: string,
  labels: {
    offline: string;
    lastSeenToday: string;
    lastSeenYesterday: string;
    lastSeenDate: string;
  },
) {
  if (!value) return labels.offline;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return labels.offline;

  const now = new Date();
  const timeFallback = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  const timeText = safeFormatLocaleDate(
    date,
    locale,
    { hour: "2-digit", minute: "2-digit" },
    timeFallback,
  );

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMessageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDiff = Math.round((startOfToday - startOfMessageDay) / 86400000);

  if (dayDiff == 0) {
    return labels.lastSeenToday.replace("{{time}}", timeText);
  }

  if (dayDiff == 1) {
    return labels.lastSeenYesterday.replace("{{time}}", timeText);
  }

  const dateFallback = `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
  const dateText = safeFormatLocaleDate(
    date,
    locale,
    { day: "2-digit", month: "long" },
    dateFallback,
  );

  return labels.lastSeenDate
    .replace("{{date}}", dateText)
    .replace("{{time}}", timeText);
}


type TopActionKey = "reply" | "edit" | "copy" | "translate" | "forward" | "delete" | "more";
type ComposerPanel = null | "media";
type RoomSettingsActionId = Exclude<RoomSettingsToolId, "theme" | "more"> | "ai" | "group_add_member" | "group_invite" | "group_share"
  | "channel_add_to_chats"
  | "channel_share"
  | "channel_recommend"
  | "channel_open_bot";
type ReactionAnchor = { x: number; y: number; width: number; height: number };

type InlineMessageTranslationState = {
  status: "loading" | "success" | "error";
  text?: string;
  sourceLanguage?: string | null;
  targetLanguage?: string | null;
  error?: string;
};

const MESSENGER_INLINE_TRANSLATION_PRIORITY_LANGUAGES = [
  "ru",
  "uz",
  "en",
  "zh",
  "ar",
  "tr",
  "de",
  "fr",
  "es",
  "ko",
  "ja",
  "hi",
  "fa",
  "kk",
  "ky",
  "tg",
] as const;

function normalizeMessengerInlineTranslationLanguage(value?: string | null): AiTranslationLanguageCode {
  const normalized = String(value || "").trim().replace(/_/g, "-");
  const base = normalized.split("-")[0];

  if (AI_TRANSLATION_TARGET_LANGUAGES.some((item) => item.code === normalized)) return normalized;
  if (AI_TRANSLATION_TARGET_LANGUAGES.some((item) => item.code === base)) return base;
  return "ru";
}

function getMessengerInlineTranslationLanguageOptions(appLanguage: string) {
  const priority = MESSENGER_INLINE_TRANSLATION_PRIORITY_LANGUAGES
    .map((code) => AI_TRANSLATION_TARGET_LANGUAGES.find((item) => item.code === code))
    .filter((item): item is (typeof AI_TRANSLATION_TARGET_LANGUAGES)[number] => Boolean(item));

  const rest = AI_TRANSLATION_TARGET_LANGUAGES.filter(
    (item) => !MESSENGER_INLINE_TRANSLATION_PRIORITY_LANGUAGES.includes(item.code as any),
  );

  return [...priority, ...rest].map((item) => ({
    code: item.code,
    title: getTranslationLanguageLabel(item.code, appLanguage),
    subtitle: item.englishName,
    flag: item.flag,
  }));
}

function normalizeMessengerTranslationErrorForUi(error: unknown, fallback: string, providerUnavailable: string): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const value = raw.trim();

  if (!value) return fallback;

  const lower = value.toLowerCase();

  if (
    lower.includes("ai_provider_gateway_unavailable") ||
    lower.includes("provider_gateway_unavailable") ||
    lower.includes("provider_not_configured") ||
    lower.includes("gateway") ||
    lower.includes("502") ||
    lower.includes("503")
  ) {
    return providerUnavailable;
  }

  if (lower.includes("premium")) {
    return "AI Premium required for this translation.";
  }

  if (lower.includes("auth")) {
    return "Sign in again to use AI translation.";
  }

  if (/^[a-z][a-z0-9_:-]+$/i.test(value)) return fallback;

  return value;
}

type SimpleLocation = {
  title: string;
  subtitle: string;
  latitude?: number;
  longitude?: number;
  mapLabel?: string;
};


type RoomType = "direct" | "group" | "channel" | "business";

type RoomCapabilities = {
  canSendText: boolean;
  canSendMedia: boolean;
  canSendLocation: boolean;
  canGift: boolean;
  canCall: boolean;
  canVideoCall: boolean;
  showPresence: boolean;
  showMembers: boolean;
  showBusinessTools: boolean;
  showChannelTools: boolean;
  isReadOnly: boolean;
};

type BotRoomKind = "assistant" | "service" | "business";

function normalizeBotRoomKind(input?: string | null): BotRoomKind {
  const value = String(input ?? "").trim().toLowerCase();
  if (value === "service") return "service";
  if (value === "business") return "business";
  return "assistant";
}

function resolveBotRoomType(kind: BotRoomKind): RoomType {
  return kind === "business" ? "business" : "direct";
}

function buildBotSubtitle(args: {
  kind: BotRoomKind;
  handle?: string | null;
  assistantLabel: string;
  serviceLabel: string;
  businessLabel: string;
}) {
  const base =
    args.kind === "business"
      ? args.businessLabel
      : args.kind === "service"
        ? args.serviceLabel
        : args.assistantLabel;

  const handle = String(args.handle ?? "").trim();
  return handle ? `${base} · ${handle}` : base;
}


function readSabiChannelRouteBoolean(value: unknown): boolean | null {
  const raw = String(value ?? "").trim().toLowerCase();

  if (["1", "true", "yes", "y", "owner", "admin", "allowed", "enabled"].includes(raw)) {
    return true;
  }

  if (["0", "false", "no", "n", "subscriber", "readonly", "blocked", "disabled"].includes(raw)) {
    return false;
  }

  return null;
}

function normalizeSabiChannelRouteRole(value: unknown): "" | "owner" | "admin" | "subscriber" | "viewer" {
  const raw = String(value ?? "").trim().toLowerCase();

  if (raw === "owner" || raw === "creator") return "owner";
  if (raw === "admin" || raw === "moderator") return "admin";
  if (raw === "subscriber" || raw === "member") return "subscriber";
  if (raw === "viewer" || raw === "guest") return "viewer";

  return "";
}

function sameSabiChannelUserId(a: unknown, b: unknown): boolean {
  const left = String(a ?? "").trim();
  const right = String(b ?? "").trim();

  return Boolean(left && right && left === right);
}

function canSabiChannelActorPostFromRoute(params: Record<string, unknown>): boolean {
  const role = normalizeSabiChannelRouteRole(params.channelRole || params.channelAccess);
  if (role === "owner" || role === "admin") return true;

  if (readSabiChannelRouteBoolean(params.isChannelOwner) === true) return true;
  if (readSabiChannelRouteBoolean(params.isChannelAdmin) === true) return true;
  if (readSabiChannelRouteBoolean(params.canSendMessages) === true) return true;
  if (readSabiChannelRouteBoolean(params.canSendText) === true) return true;
  if (readSabiChannelRouteBoolean(params.canSendMedia) === true) return true;

  const currentUserId = String(params.currentUserId || params.selfId || params.userId || "").trim();
  const ownerUserId = String(params.channelOwnerUserId || params.ownerUserId || "").trim();

  return sameSabiChannelUserId(currentUserId, ownerUserId);
}

// SABI_CHANNEL_CHATROOM_OWNER_ADMIN_COMPOSER
const SABI_CHANNEL_PROFILE_STORAGE_KEY_FOR_CHAT_ROOM = "sabi.profile.channel.settings.v1";

function readSabiChannelChatBoolean(value: unknown): boolean | null {
  const raw = String(value ?? "").trim().toLowerCase();

  if (["1", "true", "yes", "y", "owner", "admin", "allowed", "enabled"].includes(raw)) return true;
  if (["0", "false", "no", "n", "subscriber", "viewer", "readonly", "blocked", "disabled"].includes(raw)) return false;

  return null;
}

function normalizeSabiChannelChatRole(value: unknown): "" | "owner" | "admin" | "subscriber" | "viewer" {
  const raw = String(value ?? "").trim().toLowerCase();

  if (raw === "owner" || raw === "creator") return "owner";
  if (raw === "admin" || raw === "moderator") return "admin";
  if (raw === "subscriber" || raw === "member") return "subscriber";
  if (raw === "viewer" || raw === "guest") return "viewer";

  return "";
}

function cleanSabiChannelChatKey(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
}

function collectSabiChannelChatKeys(values: unknown[]): string[] {
  const keys = new Set<string>();

  values.forEach((value) => {
    const clean = cleanSabiChannelChatKey(value);
    if (!clean) return;

    keys.add(clean);

    if (clean.startsWith("channel:")) {
      const withoutPrefix = clean.replace(/^channel:/, "");
      if (withoutPrefix) keys.add(withoutPrefix);
    } else {
      keys.add(`channel:${clean}`);
    }
  });

  return Array.from(keys);
}

function pickSabiChannelChatItems(payload: unknown): Record<string, unknown>[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];

  const record = payload as Record<string, unknown>;
  const channels = Array.isArray(record.channels) ? record.channels : [];
  const items = Array.isArray(record.items) ? record.items : [];

  return [...channels, ...items].filter(
    (item): item is Record<string, unknown> =>
      Boolean(item && typeof item === "object" && !Array.isArray(item)),
  );
}

function isSabiChannelChatOwnerOrAdmin(record: Record<string, unknown>, currentUserId: string): boolean {
  const role = normalizeSabiChannelChatRole(record.channelRole || record.channelAccess || record.role);

  if (role === "owner" || role === "admin") return true;
  if (readSabiChannelChatBoolean(record.isChannelOwner) === true) return true;
  if (readSabiChannelChatBoolean(record.isChannelAdmin) === true) return true;
  if (readSabiChannelChatBoolean(record.created) === true) return true;
  if (readSabiChannelChatBoolean(record.isCreated) === true) return true;

  const actor = cleanSabiChannelChatKey(currentUserId);
  if (!actor) return false;

  const ownerIds = collectSabiChannelChatKeys([
    record.ownerUserId,
    record.channelOwnerUserId,
    record.createdBy,
    record.creatorUserId,
    record.userId,
  ]);

  if (ownerIds.includes(actor)) return true;

  const rawAdminIds = record.adminIds;
  const adminIds = Array.isArray(rawAdminIds)
    ? rawAdminIds
    : typeof rawAdminIds === "string" && rawAdminIds.trim()
      ? (() => {
          try {
            const parsed = JSON.parse(rawAdminIds);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];

  return collectSabiChannelChatKeys(adminIds).includes(actor);
}

function doesSabiChannelChatRecordMatchRoute(record: Record<string, unknown>, routeKeys: string[]): boolean {
  const recordKeys = collectSabiChannelChatKeys([
    record.id,
    record.chatId,
    record.roomId,
    record.channelId,
    record.linkedChatId,
    record.linkedPublicationId,
    record.username,
    record.handle,
    record.channelName,
    record.name,
    record.title,
    record.inviteLink,
  ]);

  return routeKeys.some((key) => recordKeys.includes(key));
}

function canSabiChannelChatPostFromRoute(params: Record<string, unknown>): boolean {
  const role = normalizeSabiChannelChatRole(params.channelRole || params.channelAccess);

  if (role === "owner" || role === "admin") return true;
  if (readSabiChannelChatBoolean(params.isChannelOwner) === true) return true;
  if (readSabiChannelChatBoolean(params.isChannelAdmin) === true) return true;
  if (readSabiChannelChatBoolean(params.canSendMessages) === true) return true;
  if (readSabiChannelChatBoolean(params.canSendText) === true) return true;
  if (readSabiChannelChatBoolean(params.canSendMedia) === true) return true;

  const actor = cleanSabiChannelChatKey(params.currentUserId || params.selfId || params.userId);
  const owner = cleanSabiChannelChatKey(params.channelOwnerUserId || params.ownerUserId);

  return Boolean(actor && owner && actor === owner);
}

async function canSabiLocalChannelChatComposerPost(args: {
  chatId: string;
  routeChatId: string;
  routeHandle: string;
  routeName: string;
  currentUserId: string;
}): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(SABI_CHANNEL_PROFILE_STORAGE_KEY_FOR_CHAT_ROOM);
    if (!raw) return false;

    const parsed = JSON.parse(raw);
    const routeKeys = collectSabiChannelChatKeys([
      args.chatId,
      args.routeChatId,
      args.routeHandle,
      args.routeName,
      args.chatId ? `channel:${args.chatId}` : "",
      args.routeChatId ? `channel:${args.routeChatId}` : "",
    ]);

    if (!routeKeys.length) return false;

    return pickSabiChannelChatItems(parsed).some(
      (item) =>
        doesSabiChannelChatRecordMatchRoute(item, routeKeys) &&
        isSabiChannelChatOwnerOrAdmin(item, args.currentUserId),
    );
  } catch {
    return false;
  }
}


// SABI_CHANNEL_MENU_LOCAL_BOT_LOOKUP
const SABI_CHANNEL_MENU_PROFILE_STORAGE_KEY = "sabi.profile.channel.settings.v1";

function cleanSabiChannelMenuKey(value: unknown): string {
  return String(value ?? "").trim().replace(/^@+/, "").toLowerCase();
}

function collectSabiChannelMenuKeys(values: unknown[]): string[] {
  const result = new Set<string>();

  values.forEach((value) => {
    const clean = cleanSabiChannelMenuKey(value);
    if (!clean) return;

    result.add(clean);

    if (clean.startsWith("channel:")) {
      const withoutPrefix = clean.replace(/^channel:/, "");
      if (withoutPrefix) result.add(withoutPrefix);
    } else {
      result.add(`channel:${clean}`);
    }
  });

  return Array.from(result);
}

function pickSabiChannelMenuItems(payload: unknown): Record<string, unknown>[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];

  const record = payload as Record<string, unknown>;
  const channels = Array.isArray(record.channels) ? record.channels : [];
  const items = Array.isArray(record.items) ? record.items : [];

  return [...channels, ...items].filter(
    (item): item is Record<string, unknown> =>
      Boolean(item && typeof item === "object" && !Array.isArray(item)),
  );
}

function doesSabiChannelMenuRecordMatchRoute(record: Record<string, unknown>, routeKeys: string[]) {
  const recordKeys = collectSabiChannelMenuKeys([
    record.id,
    record.chatId,
    record.roomId,
    record.channelId,
    record.linkedChatId,
    record.linkedPublicationId,
    record.username,
    record.handle,
    record.channelName,
    record.name,
    record.title,
    record.inviteLink,
  ]);

  return routeKeys.some((key) => recordKeys.includes(key));
}

async function findSabiChannelLinkedBotFromLocalProfile(args: {
  chatId: string;
  routeChatId: string;
  routeHandle: string;
  routeName: string;
}): Promise<{ id: string; handle: string } | null> {
  try {
    const raw = await AsyncStorage.getItem(SABI_CHANNEL_MENU_PROFILE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const routeKeys = collectSabiChannelMenuKeys([
      args.chatId,
      args.routeChatId,
      args.routeHandle,
      args.routeName,
      args.chatId ? `channel:${args.chatId}` : "",
      args.routeChatId ? `channel:${args.routeChatId}` : "",
    ]);

    if (!routeKeys.length) return null;

    const matched = pickSabiChannelMenuItems(parsed).find((item) =>
      doesSabiChannelMenuRecordMatchRoute(item, routeKeys),
    );

    if (!matched) return null;

    const id = String(
      matched.linkedBotId ||
        matched.channelBotId ||
        matched.connectedBotId ||
        matched.botId ||
        "",
    ).trim();

    if (!id) return null;

    const handle = String(
      matched.linkedBotHandle ||
        matched.channelBotHandle ||
        matched.connectedBotHandle ||
        matched.botHandle ||
        "",
    ).trim();

    return { id, handle };
  } catch {
    return null;
  }
}

function normalizeRouteRoomType(input?: string | null): RoomType | null {
  const value = String(input ?? "").trim().toLowerCase();
  if (value === "direct" || value === "group" || value === "channel" || value === "business") {
    return value;
  }
  return null;
}

function inferRoomType(
  chatId: string,
  meta: ChatMeta,
  explicitType?: string | null,
): RoomType {
  const normalizedExplicit = normalizeRouteRoomType(explicitType);
  if (normalizedExplicit) return normalizedExplicit;

  const id = chatId.toLowerCase();
  const name = meta.name.toLowerCase();
  const subtitle = meta.subtitle.toLowerCase();

  if (
    id === "sabi-info" ||
    name.includes("channel") ||
    name.includes("sabi info") ||
    subtitle.includes("official channel") ||
    subtitle.includes("channel")
  ) {
    return "channel";
  }

  if (
    name.includes("group") ||
    subtitle.includes("members") ||
    subtitle.includes("workspace")
  ) {
    return "group";
  }

  if (
    name.includes("business") ||
    subtitle.includes("business")
  ) {
    return "business";
  }

  return "direct";
}

function getRoomCapabilities(roomType: RoomType): RoomCapabilities {
  switch (roomType) {
    case "group":
      return {
        canSendText: true,
        canSendMedia: true,
        canSendLocation: true,
        canGift: true,
        canCall: false,
        canVideoCall: false,
        showPresence: false,
        showMembers: true,
        showBusinessTools: false,
        showChannelTools: false,
        isReadOnly: false,
      };
    case "channel":
      return {
        canSendText: false,
        canSendMedia: false,
        canSendLocation: false,
        canGift: false,
        canCall: false,
        canVideoCall: false,
        showPresence: false,
        showMembers: true,
        showBusinessTools: false,
        showChannelTools: true,
        isReadOnly: true,
      };
    case "business":
      return {
        canSendText: true,
        canSendMedia: true,
        canSendLocation: true,
        canGift: true,
        canCall: true,
        canVideoCall: false,
        showPresence: false,
        showMembers: false,
        showBusinessTools: true,
        showChannelTools: false,
        isReadOnly: false,
      };
    default:
      return {
        canSendText: true,
        canSendMedia: true,
        canSendLocation: true,
        canGift: true,
        canCall: true,
        canVideoCall: true,
        showPresence: true,
        showMembers: false,
        showBusinessTools: false,
        showChannelTools: false,
        isReadOnly: false,
      };
  }
}

const TEXT_MAIN = "#F6FFF9";
const TEXT_SECONDARY = "rgba(232,255,246,0.74)";
const TEXT_MUTED = "rgba(232,255,246,0.56)";
const OUTGOING_TEXT = "#071711";
const OUTGOING_META = "rgba(7,23,17,0.72)";

const MIN_INPUT_HEIGHT = 20;
const MAX_INPUT_HEIGHT = 72;
const COMPOSER_BASE_HEIGHT = 70;

const CHAT_ROOM_FALLBACKS = {
  encrypted: "Encrypted chat",
  you: "You",
  typing: "yozmoqda…",
  online: "onlayn",
  offline: "oflayn",
  connecting: "ulanmoqda…",
  reconnecting: "qayta ulanmoqda…",
  lastSeenToday: "bugun {{time}} da ko‘rilgan",
  lastSeenYesterday: "kecha {{time}} da ko‘rilgan",
  lastSeenDate: "{{date}} {{time}} da ko‘rilgan",
  conversationPlaceholder: "Conversation will appear here.",
  today: "Today",
  yesterday: "Yesterday",
  directRoom: "Direct chat",
  groupRoom: "Group",
  channelRoom: "Channel",
  businessRoom: "Business chat",
  messagePlaceholder: "Write a message",
  voiceRecordingTitle: "Recording voice message",
  voiceRecordingSubtitle: "Hold to record",
  voiceReadySubtitle: "Voice message is ready",
  voiceTitle: "Voice message",
  voicePlayError: "Unable to play voice message.",
  voiceRateError: "Unable to change playback speed.",
  messageTitle: "Message",
  messageContextMissing: "Message context is missing.",
  messageSendError: "Unable to send message.",
  translateAction: "Translate",
  translatingInline: "Translating…",
  translatedInline: "Translation",
  translationFailed: "Translation unavailable",
  translationEmpty: "This message cannot be translated.",
  translationLanguageTitle: "Translate to",
  translationLanguageSubtitle: "Choose language for this message.",
  translationProviderUnavailable: "AI translation provider is unavailable on the server.",
  photoTitle: "Photo",
  photoPreviewSubtitle: "Tap to preview",
  photoPreviewUnavailable: "Photo preview is unavailable.",
  photoCaptured: "Photo attached",
  photoSaveNotice: "Photo saved",
  photoSaveError: "Unable to save photo.",
  videoTitle: "Video message",
  videoCaptured: "Video attached",
  videoSaveNotice: "Video saved",
  videoSaveError: "Unable to save video.",
  videoCloseHint: "Tap close to return",
  locationTitle: "Location",
  sharedLocation: "Shared location",
  locationAttached: "Location attached",
  locationOpenNotice: "Opening location",
  locationOpenError: "Unable to open location.",
  locationSendError: "Unable to send location.",
  locationCoordsMissing: "Location coordinates are missing.",
  documentTitle: "Document",
  documentAttached: "Document attached",
  documentPreviewUnavailable: "Document preview is unavailable.",
  documentOpenNotice: "Opening document",
  documentOpening: "Hujjat ochilmoqda…",
  documentOpenError: "Unable to open document.",
  documentAccessError: "Unable to access document.",
  galleryTitle: "Gallery",
  galleryAccessError: "Unable to access gallery.",
  documentsTitle: "Documents",
  contactsTitle: "Contacts",
  contactTitle: "Contact",
  contactCard: "Contact card",
  contactAttached: "Contact attached",
  contactReady: "Contact is ready",
  contactOpenNotice: "Opening contact",
  contactOpenError: "Unable to open contact.",
  contactsAccessError: "Unable to access contacts.",
  cancel: "Bekor qilish",
  contactChooseSource: "Choose contact source",
  phoneContactsTitle: "Phone contacts",
  phoneContactsSubtitle: "Pick from device contacts",
  sabiContactsTitle: "Sabi contacts",
  sabiContactsSubtitle: "Pick from Sabi Messenger contacts",
  openContactInPhone: "Save to phone contacts",
  openContactInMessenger: "Open in Sabi Messenger",
  addContactTitle: "Kontakt qo‘shish",
  addContactSubtitle: "Kontakt ma’lumotlarini kiriting",
  addContactName: "Ism",
  addContactPhone: "Telefon",
  addContactUsername: "Foydalanuvchi nomi",
  addContactNamePlaceholder: "Ism kiriting",
  addContactPhonePlaceholder: "Telefon kiriting",
  addContactUsernamePlaceholder: "Foydalanuvchi nomini kiriting",
  addContactSave: "Kontaktni saqlash",
  contactNameRequired: "Ism kiritish kerak",
  contactSavedInMessenger: "Kontakt Sabi Messenger kontaktlariga saqlandi",
  contactSavedInContacts: "Kontakt saqlandi",
  selectionDelete: "Delete selected",
  selectionForward: "Forward selected",
  catalogSoon: "",
  pollSoon: "",
  eventSoon: "",
  imageNormal: "Normal",
  editedLabel: "edited",
  mapLabel: "Map",
  save: "Saqlash",
  link: "Open link",
  replyAction: "Reply",
  deleteMe: "Delete for me",
  deleteAllAction: "Delete for everyone",
  mediaCaptureFailed: "Unable to capture media.",
  voiceReadyInline: "Voice ready",
  locationAccessError: "Unable to access location.",
  videoMessageText: "Video message",
  tapSend: "Tap send",
  diamondsUnit: "diamonds",
  editingTitle: "Editing",
  editingSubtitle: "Update your message",
  replyingTitle: "Replying",
  editPlaceholder: "Edit message",
  replyPlaceholder: "Write a reply",
  readOnlyTitle: "Read only",
  readOnlySubtitle: "You cannot send messages here.",
  mediaLabel: "Media",
  aiTitle: "AI",
  aiMessage: "AI tools",
  mediaTitle: "Media",
  mediaMessage: "Media tools",
  searchTitle: "Search",
  searchMessage: "Search in chat",
  muteTitle: "Mute",
  muteMessage: "Chat notifications",
  privacyTitle: "Privacy",
  privacyMessage: "Privacy settings",
  roomThemeUpdated: "Chat theme updated",
  recordingVoice: "Ovoz yozilmoqda…",
  voiceReady: "Voice ready",
  voiceReadyToSend: "Voice message is ready to send",
  voiceSent: "Voice message sent",
  voicePlayback: "Playing voice message",
  voiceStartError: "Unable to start voice recording.",
  voiceFinishError: "Unable to finish voice recording.",
  voiceUploadError: "Unable to upload voice message.",
  messageEdited: "Message edited",
  messageSent: "Message sent",
  giftSent: "Gift sent",
  animatedReactionSent: "Animated reaction sent",
  animatedEmojiSent: "Animated emoji sent",
  stickerAdded: "Sticker added",
  selectedForForwardPrefix: "Selected for forward",
  chooseMessagesForward: "Choose messages to forward",
  deletedPrefix: "Deleted",
  deletedForAll: "Deleted for everyone",
  deletedForMe: "Deleted for me",
  copiedText: "Copied",
  addedToComposer: "Added to composer",
  saveMediaReady: "Ready to save",
  openLinkReady: "Ready to open",
  openingWalletFiat: "Opening Sabi Wallet",
  openingCoinWallet: "Opening Coin Wallet",
  openingDocument: "Opening document",
  openingContact: "Opening contact",
  channelInfoAction: "Channel info",
  groupInfoAction: "Group info",
  businessInfoAction: "Business info",
  membersCount: "members",
  subscribersCount: "subscribers",
  infoAction: "Info",
  mutedEnabled: "Chat muted",
  mutedDisabled: "Chat unmuted",
  searchFocused: "Search focused",
  aiReady: "AI ready",
  mediaSaved: "Media saved",
  mediaSavedToSabi: "Sabi App ichida saqlandi",
  mediaSavedToPhone: "Telefonga saqlandi",
  saveMediaChooseTitle: "Qaerga saqlash?",
  saveToSabiApp: "Sabi App",
  saveToPhone: "Telefon",
  contactSavedToDevice: "Kontakt telefonga saqlandi",
  contactPermissionDenied: "Contacts permission denied",
  contactUnavailable: "Contact unavailable",
  addedToList: "Added to list",
  removedFromList: "Removed from list",
  disappearingEnabled: "Disappearing messages enabled",
  disappearingDisabled: "Disappearing messages disabled",
  reportSent: "Report sent",
  chatCleared: "Chat cleared",
  conversationHidden: "Yozishma yashirildi",
  chatExported: "Chat exported",
  homeShortcutPinned: "Shortcut pinned",
  homeShortcutUnsupported: "Home shortcut is not supported",
  blockActionDone: "Chat blocked",
  unblockActionDone: "Chat unblocked",
  fileBadgeGeneric: "FILE",
  infoUsernameFallback: "sabiuser",
};

const SAVED_LOCATION_COORDS: Record<string, { latitude: number; longitude: number }> = {
  office: { latitude: 41.3111, longitude: 69.2797 },
  airport: { latitude: 41.2579, longitude: 69.2812 },
  coffee: { latitude: 41.2995, longitude: 69.2401 },
  home: { latitude: 41.3042, longitude: 69.2348 },
  "main office": { latitude: 41.3111, longitude: 69.2797 },
  "tashkent airport": { latitude: 41.2579, longitude: 69.2812 },
  "coffee point": { latitude: 41.2995, longitude: 69.2401 },
  home_title: { latitude: 41.3042, longitude: 69.2348 },
};

function formatNow() {
  const now = new Date();
  const hh = `${now.getHours()}`.padStart(2, "0");
  const mm = `${now.getMinutes()}`.padStart(2, "0");
  return `${hh}:${mm}`;
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function areStringListsEqual(a: readonly string[], b: readonly string[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return false;
  }

  return true;
}

function getMessengerPresenceSnapshot(userId?: string | null) {
  const normalizedUserId = String(userId ?? "").trim();
  if (!normalizedUserId) return null;

  return selectMessengerPresenceByUserId(
    getMessengerKernelState(),
    normalizedUserId,
  );
}

type ChatRoomTypingSnapshot = {
  chatId: string;
  userIds: readonly string[];
  updatedAt: null;
};

const EMPTY_CHAT_ROOM_TYPING_SNAPSHOT: ChatRoomTypingSnapshot = Object.freeze({
  chatId: "",
  userIds: [],
  updatedAt: null,
});

const chatRoomTypingSnapshotCache = new Map<string, ChatRoomTypingSnapshot>();

function getMessengerTypingSnapshot(chatId?: string | null): ChatRoomTypingSnapshot {
  const normalizedChatId = String(chatId ?? "").trim();
  if (!normalizedChatId) {
    return EMPTY_CHAT_ROOM_TYPING_SNAPSHOT;
  }

  const selected = selectMessengerTypingByChatId(
    getMessengerKernelState(),
    normalizedChatId,
  );
  const nextUserIds = selected.userIds;
  const cached = chatRoomTypingSnapshotCache.get(normalizedChatId);

  if (cached && areStringListsEqual(cached.userIds, nextUserIds)) {
    return cached;
  }

  const nextSnapshot: ChatRoomTypingSnapshot = {
    chatId: normalizedChatId,
    userIds: [...nextUserIds],
    updatedAt: null,
  };
  chatRoomTypingSnapshotCache.set(normalizedChatId, nextSnapshot);
  return nextSnapshot;
}

function getMessengerRealtimeStatusSnapshot() {
  return selectMessengerRealtimeStatus(getMessengerKernelState());
}

function useChatRoomMessengerPresence(userId?: string | null) {
  return useSyncExternalStore(
    subscribeMessengerKernelStore,
    () => getMessengerPresenceSnapshot(userId),
    () => getMessengerPresenceSnapshot(userId),
  );
}

function useChatRoomMessengerTyping(chatId?: string | null) {
  return useSyncExternalStore(
    subscribeMessengerKernelStore,
    () => getMessengerTypingSnapshot(chatId),
    () => getMessengerTypingSnapshot(chatId),
  );
}

function useChatRoomMessengerRealtimeStatus() {
  return useSyncExternalStore(
    subscribeMessengerKernelStore,
    getMessengerRealtimeStatusSnapshot,
    getMessengerRealtimeStatusSnapshot,
  );
}

function readAuthRuntimeUserId() {
  try {
    const snapshot = (getAuthSessionState?.() ?? null) as Record<string, any> | null;
    const session = snapshot?.session ?? snapshot?.state?.session ?? null;
    const user = snapshot?.user ?? session?.user ?? snapshot?.profile ?? null;

    const candidates = [
      snapshot?.currentUserId,
      snapshot?.userId,
      snapshot?.authUserId,
      snapshot?.accountUserId,
      session?.currentUserId,
      session?.userId,
      session?.accountUserId,
      user?.id,
      user?.userId,
      user?.profileId,
      snapshot?.account?.id,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string") {
        const normalized = candidate.trim();
        if (normalized) return normalized;
      }
    }
  } catch {}

  return "";
}

function formatBackendTime(value?: string | Date | null) {
  if (!value) return formatNow();

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return formatNow();

  const hh = `${date.getHours()}`.padStart(2, "0");
  const mm = `${date.getMinutes()}`.padStart(2, "0");
  return `${hh}:${mm}`;
}

function getMessageCreatedAtMs(value?: string | null) {
  if (!value) return Number.NaN;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function buildVisibleMessageOrderSignature(items: MessageItem[]) {
  return items
    .map((item) => `${item.id}:${item.createdAt ?? ""}`)
    .join("|");
}

function getStatusIcon(status?: MessageItem["status"]) {
  switch (status) {
    case "read":
      return "double-active";
    case "delivered":
      return "double";
    default:
      return "single";
  }
}

function shortenReplyText(value: string) {
  return value.length > 72 ? `${value.slice(0, 72)}…` : value;
}

function buildReplyRef(
  message: MessageItem,
  otherName: string,
  selfLabel = "",
): MessageReplyRef {
  return {
    id: message.id,
    text: shortenReplyText(message.text),
    mine: message.mine,
    senderLabel: message.mine ? selfLabel : otherName,
  };
}

const CHAT_THEME_FALLBACK_PRESET: ChatBackgroundPreset = {
  id: "messenger-theme-fallback",
  title: "Messenger Theme",
  subtitle: "unified messenger theme",
  screenGradient: ["#03110E", "#061714", "#0A211B", "#0D2821"],
  topGlow: "rgba(80,165,255,0.12)",
  sideGlow: "rgba(140,105,255,0.14)",
  leftMidGlow: "rgba(30,215,165,0.10)",
  bottomGlow: "rgba(72,136,255,0.12)",
  cardGradient: ["rgba(12,39,32,0.90)", "rgba(9,29,24,0.82)"],
  mineBubbleGradient: ["#1ED7A5", "#7BF3D0", "#D7FFF1"],
  mineBubbleText: "#06110D",
  otherBubbleGradient: ["rgba(12,39,32,0.90)", "rgba(9,29,24,0.82)"],
  otherBubbleStroke: "rgba(255,255,255,0.10)",
  composerGradient: ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"],
  inputSurface: "rgba(12,39,32,0.90)",
  inputStroke: "rgba(255,255,255,0.10)",
  previewGradient: ["#1ED7A5", "#7BF3D0", "#D7FFF1"],
  accent: "#1ED7A5",
  accentSoft: "#D7FFF1",
  actionGradient: ["#1ED7A5", "#7BF3D0", "#D7FFF1"],
  actionIconColor: "#06110D",
};

function normalizePreset(input?: Partial<ChatBackgroundPreset> | null): ChatBackgroundPreset {
  const fallback = CHAT_THEME_FALLBACK_PRESET;

  const array4 = (value: unknown, alt: [string, string, string, string]) =>
    Array.isArray(value) && value.length >= 4
      ? [String(value[0]), String(value[1]), String(value[2]), String(value[3])] as [
          string,
          string,
          string,
          string,
        ]
      : alt;

  const array3 = (value: unknown, alt: [string, string, string]) =>
    Array.isArray(value) && value.length >= 3
      ? [String(value[0]), String(value[1]), String(value[2])] as [string, string, string]
      : alt;

  const array2 = (value: unknown, alt: [string, string]) =>
    Array.isArray(value) && value.length >= 2
      ? [String(value[0]), String(value[1])] as [string, string]
      : alt;

  return {
    id: input?.id ?? fallback.id,
    title: input?.title ?? fallback.title,
    subtitle: input?.subtitle ?? fallback.subtitle,
    screenGradient: array4((input as any)?.screenGradient, fallback.screenGradient),
    topGlow: (input as any)?.topGlow ?? fallback.topGlow,
    sideGlow: (input as any)?.sideGlow ?? fallback.sideGlow,
    leftMidGlow: (input as any)?.leftMidGlow ?? fallback.leftMidGlow,
    bottomGlow: (input as any)?.bottomGlow ?? fallback.bottomGlow,
    cardGradient: array2((input as any)?.cardGradient, fallback.cardGradient),
    mineBubbleGradient: array3(
      (input as any)?.mineBubbleGradient,
      fallback.mineBubbleGradient,
    ),
    mineBubbleText: (input as any)?.mineBubbleText ?? fallback.mineBubbleText,
    otherBubbleGradient: array2(
      (input as any)?.otherBubbleGradient,
      fallback.otherBubbleGradient,
    ),
    otherBubbleStroke:
      (input as any)?.otherBubbleStroke ?? fallback.otherBubbleStroke,
    composerGradient: array2(
      (input as any)?.composerGradient,
      fallback.composerGradient,
    ),
    inputSurface: (input as any)?.inputSurface ?? fallback.inputSurface,
    inputStroke: (input as any)?.inputStroke ?? fallback.inputStroke,
    previewGradient: array3((input as any)?.previewGradient, fallback.previewGradient),
    accent: (input as any)?.accent ?? fallback.accent,
    accentSoft: (input as any)?.accentSoft ?? fallback.accentSoft,
    actionGradient: array3(
      (input as any)?.actionGradient,
      fallback.actionGradient,
    ),
    actionIconColor:
      (input as any)?.actionIconColor ?? fallback.actionIconColor,
  };
}


function withOpacity(color: string | undefined, alphaHex: string, fallback: string) {
  if (typeof color === "string" && /^#([0-9a-fA-F]{6})$/.test(color)) {
    return `${color}${alphaHex}`;
  }
  return fallback;
}

function palette2(value: unknown, fallback: [string, string]): [string, string] {
  if (Array.isArray(value) && value.length >= 2) {
    return [
      typeof value[0] === "string" ? value[0] : fallback[0],
      typeof value[1] === "string" ? value[1] : fallback[1],
    ];
  }
  return fallback;
}

function palette3(value: unknown, fallback: [string, string, string]): [string, string, string] {
  if (Array.isArray(value) && value.length >= 3) {
    return [
      typeof value[0] === "string" ? value[0] : fallback[0],
      typeof value[1] === "string" ? value[1] : fallback[1],
      typeof value[2] === "string" ? value[2] : fallback[2],
    ];
  }
  return fallback;
}

function palette4(value: unknown, fallback: [string, string, string, string]): [string, string, string, string] {
  if (Array.isArray(value) && value.length >= 4) {
    return [
      typeof value[0] === "string" ? value[0] : fallback[0],
      typeof value[1] === "string" ? value[1] : fallback[1],
      typeof value[2] === "string" ? value[2] : fallback[2],
      typeof value[3] === "string" ? value[3] : fallback[3],
    ];
  }
  return fallback;
}

function buildPresetFromMessengerTheme(
  themeState: MessengerThemeState,
  palette: MessengerThemePalette,
): ChatBackgroundPreset {
  const anyPalette = palette as MessengerThemePalette & {
    id?: string;
    title?: string;
    mood?: string;
    background?: [string, string, string, string];
    surface?: [string, string];
    surfaceRaised?: [string, string];
    accentAlt?: string;
    card?: [string, string];
    cardSoft?: [string, string];
  };

  const hasWallpaper = Boolean(themeState.wallpaperUri);
  const accent = typeof palette.accent === "string" ? palette.accent : "#1ED7A5";
  const accentSoft = typeof palette.accentSoft === "string" ? palette.accentSoft : "#D7FFF1";
  const accentAlt =
    typeof anyPalette.accentAlt === "string" && anyPalette.accentAlt
      ? anyPalette.accentAlt
      : accentSoft;
  const background = palette4(anyPalette.background, ["#03110E", "#061714", "#0A211B", "#0D2821"]);
  const surface = hasWallpaper
    ? (["rgba(10,15,24,0.42)", "rgba(10,15,24,0.26)"] as [string, string])
    : palette2(anyPalette.surface ?? anyPalette.card, ["rgba(12,39,32,0.90)", "rgba(9,29,24,0.82)"]);
  const raised = hasWallpaper
    ? (["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"] as [string, string])
    : palette2(anyPalette.surfaceRaised ?? anyPalette.cardSoft, ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]);
  const bubble = palette3([accent, accentAlt, accentSoft], [accent, accentAlt, accentSoft]);

  return normalizePreset({
    id: anyPalette.id ?? themeState.themeId,
    title: anyPalette.title ?? "Messenger Theme",
    subtitle: anyPalette.mood ?? "unified messenger theme",
    screenGradient: background,
    topGlow: withOpacity(accent, "20", "rgba(80,165,255,0.12)"),
    sideGlow: withOpacity(accentAlt, "18", "rgba(140,105,255,0.14)"),
    leftMidGlow: withOpacity(accent, "14", "rgba(30,215,165,0.10)"),
    bottomGlow: withOpacity(accentAlt, "16", "rgba(72,136,255,0.12)"),
    cardGradient: surface,
    mineBubbleGradient: bubble,
    mineBubbleText: "#06110D",
    otherBubbleGradient: surface,
    otherBubbleStroke: "rgba(255,255,255,0.10)",
    composerGradient: raised,
    inputSurface: hasWallpaper ? "rgba(10,15,24,0.42)" : surface[0],
    inputStroke: hasWallpaper ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.10)",
    previewGradient: bubble,
    accent,
    accentSoft,
    actionGradient: bubble,
    actionIconColor: "#06110D",
  });
}

const pressedViewStyle = (pressed: boolean): StyleProp<ViewStyle> =>
  pressed ? styles.pressView : undefined;

function formatAudioClock(durationMs: number) {
  const safe = Math.max(0, Math.floor(durationMs / 1000));
  const mm = `${Math.floor(safe / 60)}`.padStart(2, "0");
  const ss = `${safe % 60}`.padStart(2, "0");
  return `${mm}:${ss}`;
}

function formatVideoDuration(durationMs?: number | null) {
  return formatAudioClock(durationMs ?? 0);
}

const AUDIO_WAVEFORM_BARS = [
  7, 12, 9, 15, 11, 18, 13, 21, 10, 17, 12, 20,
  14, 23, 11, 18, 9, 16, 13, 22, 12, 19, 10, 17,
  14, 24, 12, 20, 9, 16, 13, 21, 11, 18, 10, 15,
] as const;

function mapRealtimeMessageToItem(
  message: RealtimeIncomingMessage,
  currentUserId: string,
  labels?: {
    locationTitle?: string;
    sharedLocation?: string;
    documentTitle?: string;
    contactTitle?: string;
    photoTitle?: string;
    videoTitle?: string;
    voiceTitle?: string;
  },
): MessageItem | null {
  const type = String(message.type ?? "TEXT").toUpperCase() as RealtimeMessageType;
  const mine = message.userId === currentUserId;
  const time = formatBackendTime(message.createdAt);
  const status: MessageItem["status"] = message.readAt
    ? "read"
    : message.deliveredAt
      ? "delivered"
      : "sent";

  const lifecycle = {
    edited: Boolean(message.editedAt ?? message.updatedAt),
    isDeleted: Boolean(message.deletedAt ?? message.isDeleted),
    forwardedFromMessageId: message.forwardedFromMessageId ?? message.originalMessageId ?? undefined,
    forwardedFromChatId: message.forwardedFromChatId ?? undefined,
    forwardedFromUserId: message.forwardedFromUserId ?? undefined,
    forwardedFromLabel: message.forwardedFromLabel ?? undefined,
    originalMessageId: message.originalMessageId ?? message.forwardedFromMessageId ?? undefined,
    deletedAt: message.deletedAt ?? undefined,
    senderUserId: message.userId || undefined,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt ?? message.editedAt ?? undefined,
  };

  if (type === "TEXT") {
    const animatedControl = parseSabiAnimatedControl(message.content);
    if (animatedControl) {
      return {
        id: message.id,
        text: "",
        time,
        mine,
        status,
        ...lifecycle,
        kind:
          animatedControl.kind === "gift"
            ? "gift"
            : animatedControl.kind === "emoji"
              ? "animated_emoji"
              : "animated_reaction",
        animatedPayload: {
          id: animatedControl.id,
          emoji: animatedControl.emoji,
          title: animatedControl.title,
          subtitle: animatedControl.subtitle,
          durationMs: animatedControl.durationMs,
          kind: animatedControl.kind,
          premium: animatedControl.premium,
        },
      };
    }

    if (isSabiHiddenControlMessage(message.content)) {
      return null;
    }

    return {
      id: message.id,
      text: message.content ?? "",
      time,
      mine,
      status,
      ...lifecycle,
    };
  }

  if (type === "LOCATION") {
    const title = message.previewTitle?.trim() || message.content?.trim() || labels?.locationTitle || "";
    const subtitle =
      typeof message.latitude === "number" && typeof message.longitude === "number"
        ? `${message.latitude.toFixed(5)}, ${message.longitude.toFixed(5)}`
        : message.previewSubtitle?.trim() || labels?.sharedLocation || "";

    return {
      id: message.id,
      text: `рџ“Ќ ${title}`,
      time,
      mine,
      status,
      ...lifecycle,
      kind: "location" as any,
      previewTitle: title,
      previewSubtitle: subtitle,
      fileLabel: message.fileLabel ?? labels?.locationTitle ?? "",
      localUri:
        typeof message.latitude === "number" && typeof message.longitude === "number"
          ? buildLocationMapUrl({
              latitude: message.latitude,
              longitude: message.longitude,
              title,
            })
          : message.mediaUri ?? message.remoteUri ?? undefined,
      remoteUri: message.remoteUri ?? message.mediaUri ?? undefined,
      thumbnailUri: message.thumbnailUri ?? undefined,
      locationPayload:
        typeof message.latitude === "number" && typeof message.longitude === "number"
          ? {
              label: title,
              address: subtitle,
              latitude: message.latitude,
              longitude: message.longitude,
              mapPreviewUri: message.mediaUri ?? message.remoteUri ?? undefined,
            }
          : undefined,
    };
  }

  if (type === "VOICE") {
    return {
      id: message.id,
      text: message.content || "",
      time,
      mine,
      status,
      ...lifecycle,
      kind: "audio",
      previewTitle: message.previewTitle ?? labels?.voiceTitle ?? "",
      previewSubtitle: message.previewSubtitle ?? "",
      fileLabel: message.durationLabel ?? message.fileLabel ?? undefined,
      localUri: message.mediaUri ?? message.remoteUri ?? undefined,
      remoteUri: message.remoteUri ?? message.mediaUri ?? undefined,
      durationMs: message.durationMs ?? undefined,
      durationLabel: message.durationLabel ?? undefined,
    };
  }

  if (type === "IMAGE") {
    return {
      id: message.id,
      text: message.content || "",
      time,
      mine,
      status,
      ...lifecycle,
      kind: "image",
      previewTitle: message.previewTitle ?? labels?.photoTitle ?? "",
      previewSubtitle: message.previewSubtitle ?? undefined,
      localUri: message.mediaUri ?? message.remoteUri ?? undefined,
      remoteUri: message.remoteUri ?? message.mediaUri ?? undefined,
      thumbnailUri: message.thumbnailUri ?? undefined,
      mimeType: message.mimeType ?? undefined,
    };
  }

  if (type === "VIDEO") {
    return {
      id: message.id,
      text: message.content || labels?.videoTitle || "",
      time,
      mine,
      status,
      ...lifecycle,
      kind: "video",
      previewTitle: message.previewTitle ?? labels?.videoTitle ?? "",
      previewSubtitle: message.previewSubtitle ?? undefined,
      fileLabel: message.durationLabel ?? message.fileLabel ?? undefined,
      durationLabel: message.durationLabel ?? undefined,
      durationMs: message.durationMs ?? undefined,
      localUri: message.mediaUri ?? message.remoteUri ?? undefined,
      remoteUri: message.remoteUri ?? message.mediaUri ?? undefined,
      thumbnailUri: message.thumbnailUri ?? undefined,
      mimeType: message.mimeType ?? undefined,
    };
  }

  if (type === "DOCUMENT") {
    return {
      id: message.id,
      text: message.content || `рџ“„ ${message.previewTitle || labels?.documentTitle || "Document"}`,
      time,
      mine,
      status,
      ...lifecycle,
      kind: "document" as any,
      previewTitle: message.previewTitle ?? labels?.documentTitle ?? "",
      previewSubtitle: message.previewSubtitle ?? undefined,
      fileLabel: message.fileLabel ?? undefined,
      fileSizeLabel: message.fileSizeLabel ?? undefined,
      localUri: message.mediaUri ?? message.remoteUri ?? undefined,
      remoteUri: message.remoteUri ?? message.mediaUri ?? undefined,
      durationLabel: message.durationLabel ?? undefined,
      documentPayload: {
        fileName: message.fileName ?? message.previewTitle ?? labels?.documentTitle ?? "Document",
        uri: message.mediaUri ?? message.remoteUri ?? undefined,
        mimeType: message.mimeType ?? undefined,
        fileSizeLabel: message.fileSizeLabel ?? message.previewSubtitle ?? undefined,
      },
    };
  }

  if (type === "CONTACT") {
    const encodedContact = parseContactCardUri(message.mediaUri ?? message.remoteUri);
    const contactName =
      normalizeString(encodedContact.name) ??
      normalizeString(message.previewTitle) ??
      labels?.contactTitle ??
      "Contact";
    const contactPhone =
      normalizeContactPhone(encodedContact.phone) ||
      normalizeContactPhone(message.previewSubtitle) ||
      undefined;
    const contactUsername = normalizeContactUsername(encodedContact.username || "") || undefined;
    const encodedUri = message.mediaUri ?? message.remoteUri ?? buildContactCardUri({
      name: contactName,
      phone: contactPhone,
      username: contactUsername,
      source: "unknown",
    });

    return {
      id: message.id,
      text: message.content || `рџ‘¤ ${contactName}`,
      time,
      mine,
      status,
      ...lifecycle,
      kind: "contact" as any,
      previewTitle: contactName,
      previewSubtitle: contactPhone || contactUsername || (message.previewSubtitle ?? undefined),
      fileLabel: message.fileLabel ?? (encodedContact.source === "sabi" ? "Sabi Messenger" : undefined),
      localUri: encodedUri,
      remoteUri: encodedUri,
      contactPayload: {
        name: contactName,
        phone: contactPhone,
        username: contactUsername,
        avatarUrl: encodedContact.avatarUrl,
      },
    };
  }

  if (type === "GIFT" || type === "ANIMATED_REACTION" || type === "ANIMATED_EMOJI") {
    const rawAnimatedPayload = message.animatedPayload;
    const resolvedAnimatedEmoji =
      typeof rawAnimatedPayload?.emoji === "string" && rawAnimatedPayload.emoji.trim()
        ? rawAnimatedPayload.emoji
        : null;
    const resolvedAnimatedTitle: string =
      (typeof rawAnimatedPayload?.title === "string" && rawAnimatedPayload.title.trim()
        ? rawAnimatedPayload.title.trim()
        : typeof message.previewTitle === "string" && message.previewTitle.trim()
          ? message.previewTitle.trim()
          : type === "GIFT"
            ? "Gift"
            : type === "ANIMATED_REACTION"
              ? "Animated reaction"
              : "Animated emoji") || "Animated";
    const resolvedAnimatedSubtitle: string =
      (typeof rawAnimatedPayload?.subtitle === "string" && rawAnimatedPayload.subtitle.trim()
        ? rawAnimatedPayload.subtitle.trim()
        : typeof message.previewSubtitle === "string" && message.previewSubtitle.trim()
          ? message.previewSubtitle.trim()
          : resolvedAnimatedTitle) || resolvedAnimatedTitle;
    const resolvedAnimatedKind: "reaction" | "emoji" | "gift" =
      rawAnimatedPayload?.kind === "reaction" ||
      rawAnimatedPayload?.kind === "emoji" ||
      rawAnimatedPayload?.kind === "gift"
        ? rawAnimatedPayload.kind
        : type === "GIFT"
          ? "gift"
          : type === "ANIMATED_REACTION"
            ? "reaction"
            : "emoji";

    const animatedPayload =
      rawAnimatedPayload?.id && resolvedAnimatedEmoji
        ? {
            id: rawAnimatedPayload.id,
            emoji: resolvedAnimatedEmoji,
            title: resolvedAnimatedTitle,
            subtitle: resolvedAnimatedSubtitle,
            durationMs: rawAnimatedPayload.durationMs,
            kind: resolvedAnimatedKind,
            premium: rawAnimatedPayload.premium,
          }
        : undefined;

    return {
      id: message.id,
      text: message.content || "",
      time,
      mine,
      status,
      ...lifecycle,
      kind:
        type === "GIFT"
          ? "gift"
          : type === "ANIMATED_REACTION"
            ? "animated_reaction"
            : "animated_emoji",
      animatedPayload,
    };
  }

  return null;
}


type KernelRoomMessageLike = Record<string, unknown>;
type KernelRoomParticipantLike = Record<string, unknown>;

function normalizeRealtimeMessageTypeLike(value: unknown): RealtimeMessageType {
  const normalized = String(value ?? "").trim().toUpperCase();

  switch (normalized) {
    case "AUDIO":
      return "VOICE";
    case "FILE":
      return "DOCUMENT";
    case "VOICE":
    case "IMAGE":
    case "VIDEO":
    case "DOCUMENT":
    case "CONTACT":
    case "LOCATION":
    case "GIFT":
    case "ANIMATED_REACTION":
    case "ANIMATED_EMOJI":
      return normalized;
    default:
      return "TEXT";
  }
}

function inferRealtimeMessageType(args: {
  rawType?: unknown;
  messageType?: unknown;
  kind?: unknown;
  mediaType?: unknown;
  mimeType?: unknown;
  mediaUri?: unknown;
  fileName?: unknown;
  content?: unknown;
}): RealtimeMessageType {
  const direct = normalizeRealtimeMessageTypeLike(args.rawType ?? args.messageType ?? args.kind ?? args.mediaType);
  if (direct !== "TEXT") return direct;

  const joined = [args.mediaType, args.mimeType, args.mediaUri, args.fileName, args.content]
    .map((item) => String(item ?? "").trim().toLowerCase())
    .filter(Boolean)
    .join(" ");

  if (!joined) return "TEXT";

  if (/\b(image|photo|jpeg|jpg|png|webp|heic|gif|bmp|tiff|svg)\b/.test(joined) || joined.includes("image/")) {
    return "IMAGE";
  }

  if (/\b(video|mp4|mov|m4v|webm|mkv|avi|3gp|3g2|mpeg|mpg|wmv|flv|ogv|m3u8)\b/.test(joined) || joined.includes("video/")) {
    return "VIDEO";
  }

  if (/\b(voice|audio|m4a|aac|mp3|wav|ogg|oga|caf|amr)\b/.test(joined) || joined.includes("audio/")) {
    return "VOICE";
  }

  if (/\b(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip|rar|7z|file|document)\b/.test(joined)) {
    return "DOCUMENT";
  }

  return "TEXT";
}

function normalizeFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function extractKernelAnimatedPayload(value: unknown): RealtimeAnimatedPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Record<string, unknown>;
  const premium =
    typeof source.premium === "boolean"
      ? source.premium
      : typeof source.isPremium === "boolean"
        ? source.isPremium
        : undefined;

  const kindRaw = String(source.kind ?? source.type ?? "").trim().toLowerCase();
  const kind =
    kindRaw === "reaction" || kindRaw === "emoji" || kindRaw === "gift"
      ? (kindRaw as "reaction" | "emoji" | "gift")
      : undefined;

  return {
    id: normalizeString(source.id) ?? undefined,
    emoji: normalizeString(source.emoji) ?? undefined,
    title: normalizeString(source.title) ?? normalizeString(source.label) ?? undefined,
    subtitle: normalizeString(source.subtitle) ?? undefined,
    durationMs: normalizeFiniteNumber(source.durationMs) ?? undefined,
    kind,
    premium,
  };
}

function normalizeKernelRoomMessage(
  value: unknown,
  fallbackChatId: string,
): RealtimeIncomingMessage | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as KernelRoomMessageLike;
  const id = normalizeString(source.id);
  if (!id) {
    return null;
  }

  const sourceMeta = source.meta && typeof source.meta === "object" ? (source.meta as Record<string, unknown>) : {};
  const sourceAttachment = source.attachment && typeof source.attachment === "object" ? (source.attachment as Record<string, unknown>) : {};
  const sourceFile = source.file && typeof source.file === "object" ? (source.file as Record<string, unknown>) : {};
  const sourceMediaType =
    normalizeString(source.mediaType) ??
    normalizeString(source.messageType) ??
    normalizeString(source.kind) ??
    normalizeString(source.type) ??
    normalizeString(sourceAttachment.mediaType) ??
    normalizeString(sourceFile.mediaType) ??
    normalizeString(sourceMeta.mediaType);

  const mediaUri = [
    source.mediaUri,
    source.remoteUri,
    source.mediaUrl,
    source.uri,
    source.url,
    source.fileUrl,
    source.attachmentUrl,
    source.assetUrl,
    source.downloadUrl,
    source.uploadedUri,
    source.cdnUrl,
    sourceAttachment.mediaUri,
    sourceAttachment.url,
    sourceAttachment.fileUrl,
    sourceAttachment.downloadUrl,
    sourceFile.mediaUri,
    sourceFile.url,
    sourceFile.fileUrl,
    sourceFile.downloadUrl,
    sourceMeta.mediaUri,
    sourceMeta.url,
  ]
    .map((item) => normalizeString(item))
    .find(Boolean) ?? null;

  return {
    id,
    clientId: normalizeString(source.clientId),
    chatId:
      normalizeString(source.chatId) ??
      normalizeString(source.roomId) ??
      fallbackChatId,
    userId:
      normalizeString(source.userId) ??
      normalizeString(source.senderId) ??
      normalizeString(source.authorId) ??
      normalizeString(source.fromUserId) ??
      "",
    type: inferRealtimeMessageType({
      rawType: source.type,
      messageType: source.messageType,
      kind: source.kind,
      mediaType: sourceMediaType,
      mimeType:
        normalizeString(source.mimeType) ??
        normalizeString(source.contentType) ??
        normalizeString(sourceAttachment.mimeType) ??
        normalizeString(sourceFile.mimeType),
      mediaUri,
      fileName:
        normalizeString(source.fileName) ??
        normalizeString(source.name) ??
        normalizeString(sourceAttachment.fileName) ??
        normalizeString(sourceFile.fileName),
      content:
        normalizeString(source.content) ??
        normalizeString(source.text) ??
        normalizeString(source.body),
    }),
    content:
      normalizeString(source.content) ??
      normalizeString(source.text) ??
      normalizeString(source.body),
    createdAt:
      normalizeString(source.createdAt) ??
      normalizeString(source.sentAt) ??
      normalizeString(source.occurredAt) ??
      new Date().toISOString(),
    deliveredAt:
      normalizeString(source.deliveredAt) ?? normalizeString(source.receivedAt),
    readAt:
      normalizeString(source.readAt) ?? normalizeString(source.seenAt),
    editedAt:
      normalizeString(source.editedAt) ??
      normalizeString(source.updatedAt),
    updatedAt:
      normalizeString(source.updatedAt) ??
      normalizeString(source.editedAt),
    deletedAt: normalizeString(source.deletedAt),
    isDeleted:
      typeof source.isDeleted === "boolean"
        ? source.isDeleted
        : typeof source.deletedForEveryone === "boolean"
          ? source.deletedForEveryone
          : null,
    forwardedFromMessageId:
      normalizeString(source.forwardedFromMessageId) ??
      normalizeString(source.originalMessageId),
    forwardedFromChatId: normalizeString(source.forwardedFromChatId),
    forwardedFromUserId: normalizeString(source.forwardedFromUserId),
    forwardedFromLabel: normalizeString(source.forwardedFromLabel),
    originalMessageId:
      normalizeString(source.originalMessageId) ??
      normalizeString(source.forwardedFromMessageId),
    replyToMessageId:
      normalizeString(source.replyToMessageId) ??
      normalizeString(source.replyMessageId),
    previewTitle:
      normalizeString(source.previewTitle) ??
      normalizeString(source.title) ??
      normalizeString(source.contactName) ??
      normalizeString(source.fileName),
    previewSubtitle:
      normalizeString(source.previewSubtitle) ??
      normalizeString(source.subtitle) ??
      normalizeString(source.contactPhone) ??
      normalizeString(source.meta),
    fileLabel:
      normalizeString(source.fileLabel) ??
      normalizeString(source.label) ??
      normalizeString(source.badgeLabel),
    mimeType:
      normalizeString(source.mimeType) ??
      normalizeString(source.contentType) ??
      normalizeString(sourceAttachment.mimeType) ??
      normalizeString(sourceFile.mimeType),
    mediaUri,
    remoteUri: mediaUri,
    thumbnailUri:
      normalizeString(source.thumbnailUri) ??
      normalizeString(source.thumbUri) ??
      normalizeString(source.thumbnailUrl) ??
      normalizeString(sourceAttachment.thumbnailUri) ??
      normalizeString(sourceAttachment.thumbnailUrl),
    fileSizeLabel:
      normalizeString(source.fileSizeLabel) ??
      normalizeString(source.sizeLabel) ??
      normalizeString(sourceAttachment.fileSizeLabel) ??
      normalizeString(sourceFile.fileSizeLabel),
    fileName:
      normalizeString(source.fileName) ??
      normalizeString(source.name) ??
      normalizeString(sourceAttachment.fileName) ??
      normalizeString(sourceFile.fileName),
    durationMs: normalizeFiniteNumber(source.durationMs),
    durationLabel: normalizeString(source.durationLabel),
    latitude: normalizeFiniteNumber(source.latitude),
    longitude: normalizeFiniteNumber(source.longitude),
    animatedPayload:
      extractKernelAnimatedPayload(source.animatedPayload) ??
      extractKernelAnimatedPayload(source.meta && typeof source.meta === "object" ? (source.meta as Record<string, unknown>).animatedPayload : null),
  };
}

function resolveKernelParticipantUserId(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as KernelRoomParticipantLike;
  return (
    normalizeString(source.userId) ??
    normalizeString(source.participantUserId) ??
    normalizeString(source.memberUserId) ??
    normalizeString(source.peerId) ??
    null
  );
}

function resolveSavedLocationCoords(item: { id?: string; title: string }) {
  const idKey = (item.id || "").toLowerCase();
  const titleKey = item.title.toLowerCase();
  return (
    SAVED_LOCATION_COORDS[idKey] ||
    SAVED_LOCATION_COORDS[titleKey] ||
    null
  );
}

function buildLocationOpenMapUrl(args: {
  latitude: number;
  longitude: number;
  title?: string | null;
}) {
  const label = args.title?.trim()
    ? `${args.latitude},${args.longitude} (${args.title.trim()})`
    : `${args.latitude},${args.longitude}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`;
}

function buildLocationMapUrl(args: {
  latitude: number;
  longitude: number;
  title?: string | null;
}) {
  const center = `${args.latitude},${args.longitude}`;
  const marker = `${args.latitude},${args.longitude},red-pushpin`;
  const googleStaticKey =
    typeof process !== "undefined"
      ? process.env.EXPO_PUBLIC_GOOGLE_STATIC_MAPS_KEY
      : undefined;

  if (googleStaticKey) {
    return (
      `https://maps.googleapis.com/maps/api/staticmap` +
      `?center=${encodeURIComponent(center)}` +
      `&zoom=15` +
      `&size=1200x720` +
      `&scale=2` +
      `&maptype=roadmap` +
      `&markers=${encodeURIComponent(`color:0x10B981|${center}`)}` +
      `&key=${encodeURIComponent(googleStaticKey)}`
    );
  }

  return (
    `https://staticmap.openstreetmap.de/staticmap.php` +
    `?center=${encodeURIComponent(center)}` +
    `&zoom=15` +
    `&size=1200x720` +
    `&markers=${encodeURIComponent(marker)}`
  );
}

function extractCoordinatesFromText(value?: string | null) {
  if (!value) return null;
  const match = value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}


type ContactCardSource = "phone" | "sabi" | "unknown";

type ContactCardData = {
  name: string;
  phone?: string;
  username?: string;
  userId?: string;
  chatId?: string;
  avatarUrl?: string;
  source?: ContactCardSource;
};

function normalizeContactUsername(value?: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return raw.startsWith("@") ? raw : `@${raw}`;
}

function encodeContactCardComponent(value?: string | null) {
  return encodeURIComponent(String(value ?? "").trim());
}

function decodeContactCardComponent(value?: string | null) {
  try {
    return decodeURIComponent(String(value ?? ""));
  } catch {
    return String(value ?? "");
  }
}

function buildContactCardUri(card: ContactCardData) {
  const entries: Array<[string, string | undefined]> = [
    ["name", card.name],
    ["phone", card.phone],
    ["username", card.username],
    ["userId", card.userId],
    ["chatId", card.chatId],
    ["avatarUrl", card.avatarUrl],
    ["source", card.source || "unknown"],
  ];

  const query = entries
    .map(([key, value]) => {
      const normalized = String(value ?? "").trim();
      return normalized ? `${key}=${encodeContactCardComponent(normalized)}` : "";
    })
    .filter(Boolean)
    .join("&");

  return `sabi-contact://card${query ? `?${query}` : ""}`;
}

function parseContactCardUri(uri?: string | null): Partial<ContactCardData> {
  const raw = String(uri ?? "").trim();
  if (!raw.startsWith("sabi-contact://card")) return {};

  const query = raw.includes("?") ? raw.slice(raw.indexOf("?") + 1) : "";
  const result: Record<string, string> = {};
  query.split("&").forEach((part) => {
    const [key, ...rest] = part.split("=");
    if (!key) return;
    result[key] = decodeContactCardComponent(rest.join("="));
  });

  const sourceRaw = String(result.source || "").toLowerCase();
  const source: ContactCardSource = sourceRaw === "phone" || sourceRaw === "sabi" ? sourceRaw : "unknown";

  return {
    name: result.name,
    phone: result.phone,
    username: result.username,
    userId: result.userId,
    chatId: result.chatId,
    avatarUrl: result.avatarUrl,
    source,
  };
}

function resolveContactCardFromMessage(message: MessageItem, fallbackName: string): ContactCardData {
  const encoded = parseContactCardUri(message.remoteUri || message.localUri);
  const payload = message.contactPayload || null;
  const name =
    normalizeString(encoded.name) ||
    normalizeString(payload?.name) ||
    normalizeString(message.previewTitle) ||
    fallbackName ||
    "Contact";
  const phone =
    normalizeContactPhone(encoded.phone) ||
    normalizeContactPhone(payload?.phone) ||
    normalizeContactPhone(message.previewSubtitle) ||
    undefined;
  const username =
    normalizeContactUsername(encoded.username || payload?.username || "") || undefined;

  return {
    name,
    phone,
    username,
    userId: normalizeString(encoded.userId) || undefined,
    chatId: normalizeString(encoded.chatId) || undefined,
    avatarUrl: normalizeString(encoded.avatarUrl || payload?.avatarUrl || "") || undefined,
    source: encoded.source || "unknown",
  };
}

function dedupeContactOptions(items: ContactOption[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = String(item.userId || item.chatId || item.username || item.phone || item.id || item.name)
      .trim()
      .toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildContactDialUrl(value?: string | null) {
  const cleaned = String(value ?? "").replace(/[^\d+]/g, "");
  if (!cleaned) return null;
  return `tel:${cleaned}`;
}

function getMessengerMediaApiBaseUrl() {
  const auth = getAuthSessionState();
  return (
    resolveSabiApiBaseUrl(auth.apiBaseUrl) ??
    resolveSabiApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL)
  );
}

function normalizeMessengerMediaUri(uri?: string | null) {
  const raw = normalizeString(uri);
  if (!raw) return null;

  if (/^(file|content|asset|assets-library|ph|data):/i.test(raw)) return raw;

  const apiBase = getMessengerMediaApiBaseUrl();

  const localhostMatch = raw.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)$/i);
  if (localhostMatch && apiBase && !/^(https?:\/\/)?(localhost|127\.0\.0\.1)(:|\/|$)/i.test(apiBase)) {
    return apiBase + (localhostMatch[3] || "");
  }

  if (/^https?:\/\//i.test(raw)) return raw;

  if (!apiBase) return raw;

  if (/^\/?uploads\//i.test(raw)) {
    const filename = encodeURIComponent(raw.replace(/^\/?uploads\//i, "").split("/").pop() || "");
    return filename ? apiBase + "/api/v2/media/files/" + filename : apiBase + "/" + raw.replace(/^\/+/, "");
  }

  return apiBase + (raw.startsWith("/") ? raw : "/" + raw);
}

function resolveMessageAttachmentUri(message?: Pick<MessageItem, "localUri" | "remoteUri" | "documentPayload" | "locationPayload" | "linkPreview"> | null) {
  if (!message) return null;
  return (
    normalizeMessengerMediaUri(message.localUri) ??
    normalizeMessengerMediaUri(message.remoteUri) ??
    normalizeMessengerMediaUri(message.documentPayload?.uri) ??
    normalizeMessengerMediaUri(message.locationPayload?.mapPreviewUri) ??
    normalizeMessengerMediaUri(message.linkPreview?.url) ??
    null
  );
}

function resolveMessageVideoPlaybackUri(
  message?: Pick<MessageItem, "remoteUri" | "localUri" | "documentPayload" | "linkPreview"> | null,
) {
  if (!message) return null;

  // Video playback must prefer the backend/public URL. A stale local file:// URI
  // can still exist after upload and renders as a black in-chat player on Android.
  return (
    normalizeMessengerMediaUri(message.remoteUri) ??
    normalizeMessengerMediaUri(message.documentPayload?.uri) ??
    normalizeMessengerMediaUri(message.localUri) ??
    normalizeMessengerMediaUri(message.linkPreview?.url) ??
    null
  );
}

function resolveVideoOverrideExtension(uri?: string | null, mimeType?: string | null) {
  const normalizedMime = normalizeString(mimeType)?.toLowerCase() ?? "";
  const cleanUri = String(uri || "").split("?")[0].split("#")[0].toLowerCase();
  const extension = cleanUri.match(/\.([a-z0-9]{1,12})$/)?.[1] ?? "";

  if (normalizedMime.includes("quicktime") || extension === "mov") return "mov";
  if (normalizedMime.includes("webm") || extension === "webm") return "webm";
  if (normalizedMime.includes("x-m4v") || extension === "m4v") return "m4v";
  if (normalizedMime.includes("matroska") || extension === "mkv") return "mkv";
  if (normalizedMime.includes("msvideo") || normalizedMime.includes("avi") || extension === "avi") return "avi";
  if (normalizedMime.includes("3gpp2") || extension === "3g2") return "3g2";
  if (normalizedMime.includes("3gpp") || extension === "3gp") return "3gp";
  if (normalizedMime.includes("mpeg") || extension === "mpeg" || extension === "mpg") return extension || "mpeg";
  if (normalizedMime.includes("wmv") || extension === "wmv") return "wmv";
  if (normalizedMime.includes("flv") || extension === "flv") return "flv";
  if (normalizedMime.includes("ogg") || extension === "ogv" || extension === "ogm") return extension || "ogv";
  if (extension === "m3u8" || normalizedMime.includes("mpegurl")) return "m3u8";
  return extension || "mp4";
}

function buildVideoPlaybackSource(uri: string, mimeType?: string | null) {
  const normalizedUri = normalizeMessengerMediaUri(uri) || uri;
  return {
    uri: normalizedUri,
    headers: /^(file|content|asset|assets-library|ph|data):/i.test(normalizedUri)
      ? undefined
      : {
          Accept: "video/mp4,video/quicktime,video/webm,video/3gpp,video/*;q=0.9,*/*;q=0.8",
        },
    overrideFileExtensionAndroid: resolveVideoOverrideExtension(normalizedUri, mimeType),
  } as any;
}

function resolveMessageOpenUri(message?: MessageItem | null) {
  if (!message) return null;

  if (message.kind === "location") {
    const coords =
      message.locationPayload &&
      typeof message.locationPayload.latitude === "number" &&
      typeof message.locationPayload.longitude === "number"
        ? { latitude: message.locationPayload.latitude, longitude: message.locationPayload.longitude }
        : extractCoordinatesFromText(message.previewSubtitle);

    if (coords) {
      return buildLocationOpenMapUrl({
        latitude: coords.latitude,
        longitude: coords.longitude,
        title: message.previewTitle,
      });
    }
  }

  return resolveMessageAttachmentUri(message);
}

function isRemoteTransportUri(value?: string | null) {
  const uri = String(value ?? "").trim();
  if (!uri) return false;
  return /^(https?:\/\/|data:|blob:https?:\/\/)/i.test(uri);
}

function extractUploadedTransportMediaUri(value: unknown): string | null {
  const collect = (input: unknown): string | null => {
    if (typeof input === "string") {
      return isRemoteTransportUri(input) ? input : null;
    }

    if (!input || typeof input !== "object") return null;

    const source = input as Record<string, unknown>;
    const directKeys = [
      "mediaUri",
      "url",
      "fileUrl",
      "attachmentUrl",
      "assetUrl",
      "uploadedUri",
      "downloadUrl",
      "cdnUrl",
      "uri",
    ];

    for (const key of directKeys) {
      const candidate = source[key];
      if (typeof candidate === "string" && isRemoteTransportUri(candidate)) {
        return candidate;
      }
    }

    const nestedKeys = ["data", "message", "asset", "attachment", "file", "result"];
    for (const key of nestedKeys) {
      const nested = source[key];
      const resolved = collect(nested);
      if (resolved) return resolved;
    }

    return null;
  };

  return collect(value);
}

function getFileExtensionFromUri(value?: string | null) {
  const uri = String(value ?? "").split("?")[0].trim();
  if (!uri) return "";
  const match = uri.match(/\.([A-Za-z0-9]+)$/);
  return match?.[1]?.toLowerCase() ?? "";
}

function getMimeTypeExtension(value?: string | null) {
  const mime = String(value ?? "").trim().toLowerCase();
  if (!mime) return "";
  if (mime.includes("quicktime")) return "mov";
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("webm")) return "webm";
  if (mime.includes("matroska")) return "mkv";
  if (mime.includes("msvideo") || mime.includes("avi")) return "avi";
  if (mime.includes("3gpp2")) return "3g2";
  if (mime.includes("3gpp")) return "3gp";
  if (mime.includes("mpeg")) return "mpeg";
  if (mime.includes("wmv")) return "wmv";
  if (mime.includes("flv")) return "flv";
  if (mime.includes("ogg")) return "ogv";
  if (mime.includes("mpegurl")) return "m3u8";
  return mime.split("/").pop() ?? "";
}

function buildVideoUploadAssetName(args: {
  localUri?: string | null;
  mimeType?: string | null;
  previewTitle?: string | null;
}) {
  const preferred = String(args.previewTitle ?? "").trim();
  if (preferred) {
    const existingExt = getFileExtensionFromUri(preferred);
    if (existingExt) return preferred;
    const mimeExt = getMimeTypeExtension(args.mimeType);
    return mimeExt ? `${preferred}.${mimeExt}` : preferred;
  }

  const uriExt = getFileExtensionFromUri(args.localUri);
  const mimeExt = getMimeTypeExtension(args.mimeType);
  const ext = uriExt || mimeExt || "mp4";
  return `video-${Date.now()}.${ext}`;
}

function isVideoMimeOrName(args: {
  mimeType?: string | null;
  name?: string | null;
  uri?: string | null;
  label?: string | null;
}) {
  const joined = [args.mimeType, args.name, args.uri, args.label]
    .map((item) => String(item ?? "").trim().toLowerCase())
    .filter(Boolean)
    .join(" ");

  if (!joined) return false;
  return (
    joined.includes("video/") ||
    /\b(mp4|mov|m4v|webm|mkv|avi|3gp|3g2|mpeg|mpg|wmv|flv|ogv|ogm|m3u8|video)\b/i.test(joined)
  );
}

function normalizeVideoMimeTypeFromName(args: {
  mimeType?: string | null;
  name?: string | null;
  uri?: string | null;
}) {
  const mime = String(args.mimeType ?? "").trim();
  if (mime && mime !== "application/octet-stream") return mime;

  const ext = getFileExtensionFromUri(args.name) || getFileExtensionFromUri(args.uri);
  switch (ext) {
    case "mov":
      return "video/quicktime";
    case "m4v":
      return "video/x-m4v";
    case "webm":
      return "video/webm";
    case "mkv":
      return "video/x-matroska";
    case "avi":
      return "video/x-msvideo";
    case "3gp":
      return "video/3gpp";
    case "3g2":
      return "video/3gpp2";
    case "mpeg":
    case "mpg":
      return "video/mpeg";
    case "wmv":
      return "video/x-ms-wmv";
    case "flv":
      return "video/x-flv";
    case "ogv":
    case "ogm":
      return "video/ogg";
    case "m3u8":
      return "application/vnd.apple.mpegurl";
    case "mp4":
    default:
      return "video/mp4";
  }
}

function getAttachmentMetaKindLabel(value?: string | null, fileBadgeGeneric = "") {
  const source = String(value ?? "").toUpperCase();
  if (!source) return fileBadgeGeneric;
  if (source.includes("PDF")) return "PDF";
  if (source.includes("DOCX")) return "DOCX";
  if (source.includes("DOC")) return "DOC";
  if (source.includes("XLSX")) return "XLSX";
  if (source.includes("XLS")) return "XLS";
  if (source.includes("ZIP")) return "ZIP";
  if (source.includes("PNG")) return "PNG";
  if (source.includes("JPG") || source.includes("JPEG")) return "JPG";
  if (source.includes("MP4")) return "MP4";
  if (source.includes("VIDEO")) return "VIDEO";
  if (source.includes("IMAGE")) return "IMAGE";
  return source.split("·")[0].trim() || fileBadgeGeneric;
}

function getFileExtensionLabel(name?: string | null) {
  const raw = String(name ?? "");
  const dot = raw.lastIndexOf(".");
  if (dot === -1) return "";
  return raw.slice(dot + 1).toUpperCase();
}

function getDocumentBadgeLabel(message: MessageItem, fileBadgeGeneric = "") {
  return (
    getFileExtensionLabel(message.previewTitle) ||
    getAttachmentMetaKindLabel(message.previewSubtitle || message.fileLabel, fileBadgeGeneric) ||
    fileBadgeGeneric
  );
}

function isLocationPreviewMessage(message: MessageItem) {
  return Boolean(
    message.previewTitle &&
      (message.text?.startsWith("рџ“Ќ") ||
        message.previewTitle.toLowerCase().includes("location") ||
        /-?\d+\.\d+,\s*-?\d+\.\d+/.test(message.previewSubtitle ?? ""))
  );
}

function isContactPreviewMessage(message: MessageItem) {
  return Boolean(
    message.previewTitle &&
      (message.text?.startsWith("рџ‘¤") ||
        String(message.fileLabel ?? "").toLowerCase().includes("contact") ||
        /^\+?\d/.test((message.previewSubtitle ?? "").replace(/\s+/g, "")))
  );
}

function isDocumentPreviewMessage(message: MessageItem) {
  return Boolean(
    message.previewTitle &&
      !isLocationPreviewMessage(message) &&
      !isContactPreviewMessage(message) &&
      (message.text?.startsWith("рџ“„") ||
        !!message.fileLabel ||
        /\b(pdf|doc|docx|zip|xls|xlsx|txt|ppt|pptx|rar|image|video)\b/i.test(
          `${message.previewSubtitle ?? ""} ${message.previewTitle ?? ""}`,
        ))
  );
}
function isFullscreenVideoFileMessage(message: MessageItem, videoMessageTitle?: string | null) {
  const playbackUri = resolveMessageVideoPlaybackUri(message);
  if (!playbackUri) return false;

  const previewTitle = normalizeString(message.previewTitle)?.toLowerCase() ?? "";
  const genericVideoTitle = normalizeString(videoMessageTitle)?.toLowerCase() ?? "";
  const textValue = normalizeString(message.text)?.toLowerCase() ?? "";
  const mediaText = [message.mimeType, message.fileLabel, message.previewSubtitle, message.previewTitle, playbackUri]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const looksLikeVideoFile =
    /video\//i.test(String(message.mimeType ?? "")) ||
    /\.(mp4|mov|m4v|webm|mkv|avi|3gp|3g2|mpg|mpeg|mpe|mts|m2ts|ts|flv|wmv|asf|ogv|ogm|vob|m3u8)(\?|#|$)/i.test(playbackUri) ||
    /\b(mp4|mov|m4v|webm|mkv|avi|3gp|3g2|mpg|mpeg|mpe|mts|m2ts|ts|flv|wmv|asf|ogv|ogm|vob|m3u8|video)\b/i.test(mediaText);

  if (message.kind === "document") return looksLikeVideoFile;
  if (message.kind !== "video") return false;

  // Video messages recorded from the Media quick action keep the compact in-chat
  // bubble player. Regular gallery/camera video files have a real file title and
  // should open in the full-screen in-chat file player.
  if (genericVideoTitle && previewTitle && previewTitle === genericVideoTitle) return false;
  if (previewTitle === "video message" || textValue === "video message") return false;

  return Boolean(looksLikeVideoFile || previewTitle || message.fileLabel || message.durationLabel || message.previewSubtitle);
}
function getContactInitials(name?: string | null) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "C";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

type MessageBubbleLabels = {
  contactCard: string;
  editedLabel: string;
  mapLabel: string;
  fileBadgeGeneric: string;
  translatingInline: string;
  translatedInline: string;
  translationFailed: string;
};

function MessageBubble({
  message,
  mine,
  accent,
  preset,
  selected,
  selectedForSelection,
  activeAudioMessageId,
  audioIsPlaying,
  audioPositionMs,
  audioDurationMs,
  audioRate,
  onAudioPlayPause,
  onAudioSeek,
  onAudioRateChange,
  activeVideoMessageId,
  videoIsPlaying,
  onVideoToggle,
  onVideoStatus,
  labels,
  inlineTranslation,
}: {
  message: MessageItem;
  mine: boolean;
  accent: string;
  preset: ChatBackgroundPreset;
  selected: boolean;
  selectedForSelection: boolean;
  activeAudioMessageId: string | null;
  audioIsPlaying: boolean;
  audioPositionMs: number;
  audioDurationMs: number;
  audioRate: number;
  onAudioPlayPause: (message: MessageItem) => void;
  onAudioSeek: (message: MessageItem, ratio: number) => void;
  onAudioRateChange: (message: MessageItem, rate: number) => void;
  activeVideoMessageId: string | null;
  videoIsPlaying: boolean;
  onVideoToggle: (message: MessageItem) => void;
  onVideoStatus: (messageId: string, status: any) => void;
  labels: MessageBubbleLabels;
  inlineTranslation?: InlineMessageTranslationState | null;
}) {
  const textColor = mine ? OUTGOING_TEXT : TEXT_MAIN;
  const metaColor = mine ? OUTGOING_META : "rgba(246,255,249,0.82)";
  const statusIcon = getStatusIcon(message.status);
  const visibleMessageText = message.text;
  const messageMediaUri = resolveMessageAttachmentUri(message);

  const isPlayableAudio = message.kind === "audio" && !!messageMediaUri;
  const isPlayableVideo = message.kind === "video" && !!messageMediaUri;
  const isPlayableImage = message.kind === "image" && !!messageMediaUri;
  const isAnimatedReaction = message.kind === "animated_reaction";
  const isAnimatedEmoji = message.kind === "animated_emoji";
  const isGift = message.kind === "gift";
  const isPremiumSticker = isAnimatedReaction || isAnimatedEmoji;
  const isAnimatedCard = isPremiumSticker || isGift;
  const isLocationPreview = isLocationPreviewMessage(message);
  const isContactPreview = isContactPreviewMessage(message);
  const isDocumentPreview = isDocumentPreviewMessage(message);
  const hideBodyText =
    isPlayableAudio ||
    isPlayableVideo ||
    isPlayableImage ||
    isAnimatedCard ||
    isLocationPreview ||
    isContactPreview ||
    isDocumentPreview;

  const isActiveAudio = isPlayableAudio && activeAudioMessageId === message.id;
  const isActiveVideo = isPlayableVideo && activeVideoMessageId === message.id;
  const playbackDuration = isActiveAudio ? audioDurationMs : message.durationMs ?? 0;
  const playbackPosition = isActiveAudio ? audioPositionMs : 0;
  const audioProgress =
    playbackDuration > 0
      ? Math.max(0, Math.min(1, playbackPosition / playbackDuration))
      : 0;
  const [audioBarWidth, setAudioBarWidth] = useState(0);

  const giftAsset = isGift ? getGiftById(message.animatedPayload?.id ?? message.id) : null;
  const premiumAnimatedSource =
    !isGift && message.animatedPayload?.id
      ? getPremiumAnimatedPreviewSource(message.animatedPayload.id)
      : null;
  const animatedEmoji = message.animatedPayload?.emoji ?? giftAsset?.fallbackEmoji ?? "✨";
  const animatedImageSource = isGift ? giftAsset?.icon : premiumAnimatedSource ?? undefined;

  return (
    <LinearGradient
      colors={
        isPremiumSticker
          ? ["rgba(0,0,0,0)", "rgba(0,0,0,0)"]
          : mine
            ? preset.mineBubbleGradient
            : preset.otherBubbleGradient
      }
      style={[
        styles.messageBubble,
        mine ? styles.messageBubbleMine : styles.messageBubbleOther,
        isPremiumSticker
          ? styles.messageBubbleSticker
          : !mine
            ? { borderColor: preset.otherBubbleStroke }
            : { borderColor: `${accent}30` },
        selected && !isPremiumSticker ? { borderColor: `${accent}44` } : undefined,
        selectedForSelection
          ? isPremiumSticker
            ? styles.messageBubbleStickerSelected
            : { borderColor: accent, borderWidth: 1.5 }
          : undefined,
      ]}
    >
      {message.replyTo ? (
        <View
          style={[
            styles.replyPreview,
            {
              borderColor: mine ? "rgba(7,23,17,0.16)" : `${accent}24`,
              backgroundColor: mine
                ? "rgba(255,255,255,0.24)"
                : "rgba(255,255,255,0.05)",
            },
          ]}
        >
          <Text
            style={[
              styles.replySender,
              { color: mine ? OUTGOING_TEXT : accent },
            ]}
            numberOfLines={1}
          >
            {message.replyTo.senderLabel}
          </Text>
          <Text
            style={[
              styles.replyText,
              { color: mine ? OUTGOING_META : TEXT_SECONDARY },
            ]}
            numberOfLines={2}
          >
            {message.replyTo.text}
          </Text>
        </View>
      ) : null}

      {isAnimatedCard ? (
        isGift ? (
          <View
            style={[
              styles.animatedBubbleCard,
              {
                backgroundColor: mine
                  ? "rgba(255,255,255,0.20)"
                  : "rgba(255,255,255,0.05)",
                borderColor: mine ? "rgba(7,23,17,0.12)" : `${accent}18`,
              },
            ]}
          >
            <View
              style={[
                styles.animatedBubbleInner,
                {
                  backgroundColor: mine
                    ? "rgba(255,255,255,0.16)"
                    : `${accent}12`,
                  borderColor: mine ? "rgba(7,23,17,0.10)" : `${accent}18`,
                },
              ]}
            >
              {animatedImageSource ? (
                <Image
                  source={animatedImageSource}
                  style={styles.animatedBubbleImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.animatedBubbleEmoji}>{animatedEmoji}</Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.sentPremiumStickerWrap}>
            {animatedImageSource ? (
              <Image
                source={animatedImageSource}
                style={styles.sentPremiumStickerImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.sentPremiumStickerEmoji}>{animatedEmoji}</Text>
            )}
          </View>
        )
      ) : null}

      {isPlayableImage ? (
        <View
          style={[
            styles.imageMessageCard,
            {
              borderColor: mine ? "rgba(7,23,17,0.14)" : `${accent}18`,
              backgroundColor: mine
                ? "rgba(255,255,255,0.16)"
                : "rgba(255,255,255,0.04)",
            },
          ]}
        >
          <Image
            source={{ uri: messageMediaUri! }}
            style={styles.imageMessagePreview}
            resizeMode="cover"
          />

          <LinearGradient
            colors={["rgba(4,11,10,0.02)", "rgba(4,11,10,0.28)"]}
            style={styles.imageMessageShade}
          />

          {message.previewSubtitle ? (
            <View
              style={[
                styles.imageEffectBadge,
                {
                  backgroundColor: mine ? "rgba(7,23,17,0.22)" : "rgba(4,11,10,0.46)",
                  borderColor: mine ? "rgba(7,23,17,0.16)" : "rgba(255,255,255,0.10)",
                },
              ]}
            >
              <Sparkles size={11} strokeWidth={2.3} color={mine ? OUTGOING_TEXT : TEXT_MAIN} />
              <Text
                style={[
                  styles.imageEffectBadgeText,
                  { color: mine ? OUTGOING_TEXT : TEXT_MAIN },
                ]}
                numberOfLines={1}
              >
                {message.previewSubtitle}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

            {!isPlayableImage &&
      !isPlayableAudio &&
      !isPlayableVideo &&
      !isAnimatedCard &&
      isDocumentPreview &&
      message.previewTitle ? (
        <LinearGradient
          colors={
            mine
              ? ["rgba(255,255,255,0.18)", "rgba(255,255,255,0.10)"]
              : ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.03)"]
          }
          style={[
            styles.documentCard,
            { borderColor: mine ? "rgba(7,23,17,0.12)" : `${accent}18` },
          ]}
        >
          <View
            style={[
              styles.documentHero,
              {
                backgroundColor: mine ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)",
                borderColor: mine ? "rgba(7,23,17,0.10)" : `${accent}14`,
              },
            ]}
          >
            <View
              style={[
                styles.documentPreviewSheet,
                { backgroundColor: mine ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.94)" },
              ]}
            >
              <View style={styles.documentPreviewHeaderRow}>
                <View style={styles.documentPreviewDot} />
                <View style={styles.documentPreviewDotMuted} />
                <View style={styles.documentPreviewDotMuted} />
              </View>
              <View style={styles.documentPreviewLineLong} />
              <View style={styles.documentPreviewLineShort} />
              <View style={styles.documentPreviewLineMid} />
              <View style={styles.documentPreviewLineLong} />
            </View>

            <View
              style={[
                styles.documentBadge,
                {
                  backgroundColor: mine ? "rgba(255,255,255,0.22)" : `${accent}14`,
                  borderColor: mine ? "rgba(7,23,17,0.12)" : `${accent}18`,
                },
              ]}
            >
              <Text style={[styles.documentBadgeText, { color: mine ? OUTGOING_TEXT : accent }]}>
                {getDocumentBadgeLabel(message, labels.fileBadgeGeneric)}
              </Text>
            </View>
          </View>

          <View style={styles.documentFooter}>
            <Text style={[styles.documentName, { color: textColor }]} numberOfLines={1}>
              {message.previewTitle}
            </Text>
            <Text style={[styles.documentMeta, { color: metaColor }]} numberOfLines={1}>
              {(message.previewSubtitle || "").replace(/\s*·\s*/g, " • ")}
            </Text>
          </View>
        </LinearGradient>
      ) : null}

      {!isPlayableImage &&
      !isPlayableAudio &&
      !isPlayableVideo &&
      !isAnimatedCard &&
      isLocationPreview &&
      message.previewTitle ? (
        <LinearGradient
          colors={
            mine
              ? ["rgba(255,255,255,0.18)", "rgba(255,255,255,0.10)"]
              : ["rgba(88,245,196,0.12)", "rgba(255,255,255,0.04)"]
          }
          style={[
            styles.locationCard,
            { borderColor: mine ? "rgba(7,23,17,0.12)" : `${accent}18` },
          ]}
        >
          <View
            style={[
              styles.locationMapPreview,
              {
                backgroundColor: mine ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.05)",
                borderColor: mine ? "rgba(7,23,17,0.10)" : `${accent}16`,
              },
            ]}
          >
            {messageMediaUri ? (
              <Image
                source={{ uri: messageMediaUri }}
                style={styles.locationMapImage}
                resizeMode="cover"
              />
            ) : (
              <>
                <View style={styles.locationMapGlowLeft} />
                <View style={styles.locationMapGlowRight} />
                <View style={styles.locationRoadHorizontalA} />
                <View style={styles.locationRoadHorizontalB} />
                <View style={styles.locationRoadVerticalA} />
                <View style={styles.locationRoadVerticalB} />
                <View style={styles.locationGridVertical} />
                <View style={styles.locationGridHorizontal} />
                <View style={styles.locationPinHalo} />
                <View style={[styles.locationPinDot, { backgroundColor: mine ? OUTGOING_TEXT : accent }]} />
                <View style={[styles.locationPinCore, { backgroundColor: mine ? "#FFFFFF" : accent }]} />
              </>
            )}

            <LinearGradient
              colors={["rgba(4,11,10,0.02)", "rgba(4,11,10,0.42)"]}
              style={styles.locationMapShade}
            />

            <View
              style={[
                styles.locationMapBadge,
                {
                  backgroundColor: mine ? "rgba(7,23,17,0.22)" : "rgba(4,11,10,0.46)",
                  borderColor: mine ? "rgba(7,23,17,0.16)" : "rgba(255,255,255,0.10)",
                },
              ]}
            >
              <MessengerBrandIcon
                icon="messenger_location"
                tone="default"
                size={11}
                color={mine ? "#FFFFFF" : TEXT_MAIN}
              />
              <Text
                style={[
                  styles.locationMapBadgeText,
                  { color: mine ? "#FFFFFF" : TEXT_MAIN },
                ]}
              >
                Google Maps
              </Text>
            </View>
          </View>

          <View style={styles.locationInfoRow}>
            <View style={styles.locationInfo}>
              <Text style={[styles.locationTitle, { color: textColor }]} numberOfLines={1}>
                {message.previewTitle}
              </Text>
              <Text style={[styles.locationMeta, { color: metaColor }]} numberOfLines={2}>
                {message.previewSubtitle}
              </Text>
            </View>

            <View
              style={[
                styles.locationBadge,
                {
                  backgroundColor: mine ? "rgba(255,255,255,0.22)" : `${accent}14`,
                  borderColor: mine ? "rgba(7,23,17,0.12)" : `${accent}18`,
                },
              ]}
            >
              <MessengerBrandIcon icon="messenger_location" tone="default" size={12} color={mine ? OUTGOING_TEXT : accent} />
              <Text style={[styles.locationBadgeText, { color: mine ? OUTGOING_TEXT : accent }]}>{labels.mapLabel}</Text>
            </View>
          </View>
        </LinearGradient>
      ) : null}

      {!isPlayableImage &&
      !isPlayableAudio &&
      !isPlayableVideo &&
      !isAnimatedCard &&
      isContactPreview &&
      message.previewTitle ? (
        <LinearGradient
          colors={
            mine
              ? ["rgba(255,255,255,0.18)", "rgba(255,255,255,0.10)"]
              : ["rgba(110,193,255,0.12)", "rgba(255,255,255,0.04)"]
          }
          style={[
            styles.contactCard,
            { borderColor: mine ? "rgba(7,23,17,0.12)" : `${accent}18` },
          ]}
        >
          <View
            style={[
              styles.contactAvatar,
              {
                backgroundColor: mine ? "rgba(7,23,17,0.12)" : `${accent}12`,
                borderColor: mine ? "rgba(7,23,17,0.10)" : `${accent}18`,
              },
            ]}
          >
            <Text style={[styles.contactAvatarText, { color: mine ? OUTGOING_TEXT : accent }]}>
              {getContactInitials(message.previewTitle)}
            </Text>
          </View>

          <View style={styles.contactInfo}>
            <Text style={[styles.contactName, { color: textColor }]} numberOfLines={1}>
              {message.previewTitle}
            </Text>
            <Text style={[styles.contactPhone, { color: metaColor }]} numberOfLines={1}>
              {message.previewSubtitle}
            </Text>
            <Text style={[styles.contactRole, { color: metaColor }]} numberOfLines={1}>
              {message.fileLabel || labels.contactCard}
            </Text>
          </View>
        </LinearGradient>
      ) : null}

      {!isPlayableImage &&
      !isPlayableAudio &&
      !isPlayableVideo &&
      !isAnimatedCard &&
      !isDocumentPreview &&
      !isLocationPreview &&
      !isContactPreview &&
      message.previewTitle ? (
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: mine
                ? "rgba(255,255,255,0.24)"
                : "rgba(255,255,255,0.05)",
              borderColor: mine ? "rgba(7,23,17,0.14)" : `${accent}18`,
            },
          ]}
        >
          <View
            style={[
              styles.previewIconWrap,
              {
                backgroundColor: mine
                  ? "rgba(255,255,255,0.24)"
                  : `${accent}12`,
                borderColor: mine ? "rgba(7,23,17,0.14)" : `${accent}18`,
              },
            ]}
          >
            <MessengerBrandIcon icon="messenger_document" tone="default" size={16} color={mine ? OUTGOING_TEXT : accent} />
          </View>

          <View style={styles.previewTextWrap}>
            <Text
              style={[styles.previewTitle, { color: textColor }]}
              numberOfLines={1}
            >
              {message.previewTitle}
            </Text>
            {message.previewSubtitle ? (
              <Text
                style={[styles.previewSubtitle, { color: metaColor }]}
                numberOfLines={2}
              >
                {message.previewSubtitle}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

{isPlayableVideo ? (
        <View style={styles.videoMessagePressable}>
          <View
            style={[
              styles.videoMessageCard,
              {
                borderColor: mine ? "rgba(7,23,17,0.14)" : `${accent}18`,
                backgroundColor: mine ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.04)",
              },
            ]}
          >
            <View style={styles.videoMessageFrame}>
              <Video
                source={buildVideoPlaybackSource(messageMediaUri!, message.mimeType)}
                style={styles.videoMessagePreview}
                resizeMode={ResizeMode.COVER}
                shouldPlay={false}
                isLooping={false}
                isMuted
                useNativeControls={false}
                onPlaybackStatusUpdate={(status) => onVideoStatus(message.id, status)}
              />
              <LinearGradient
                colors={
                  isActiveVideo && videoIsPlaying
                    ? ["rgba(4,11,10,0.01)", "rgba(4,11,10,0.16)"]
                    : ["rgba(4,11,10,0.02)", "rgba(4,11,10,0.42)"]
                }
                style={styles.videoMessageOverlay}
              />
              <View style={styles.videoMessageTopRow}>
                {message.previewSubtitle ? (
                  <View
                    style={[
                      styles.videoEffectChip,
                      {
                        backgroundColor: mine ? "rgba(7,23,17,0.22)" : "rgba(4,11,10,0.46)",
                        borderColor: mine ? "rgba(7,23,17,0.16)" : "rgba(255,255,255,0.10)",
                      },
                    ]}
                  >
                    <Sparkles size={11} strokeWidth={2.3} color={mine ? OUTGOING_TEXT : TEXT_MAIN} />
                    <Text
                      style={[
                        styles.videoEffectChipText,
                        { color: mine ? OUTGOING_TEXT : TEXT_MAIN },
                      ]}
                      numberOfLines={1}
                    >
                      {message.previewSubtitle}
                    </Text>
                  </View>
                ) : (
                  <View />
                )}

                <View
                  style={[
                    styles.videoPlayBadge,
                    {
                      backgroundColor: mine ? "rgba(255,255,255,0.24)" : "rgba(4,11,10,0.46)",
                      borderColor: mine ? "rgba(7,23,17,0.14)" : "rgba(255,255,255,0.10)",
                    },
                  ]}
                >
                  <Play size={18} strokeWidth={2.3} color={mine ? OUTGOING_TEXT : TEXT_MAIN} />
                </View>
              </View>

              <View style={styles.videoMessageBottomRow}>
                <View
                  style={[
                    styles.videoDurationPill,
                    {
                      backgroundColor: mine ? "rgba(7,23,17,0.22)" : "rgba(4,11,10,0.50)",
                      borderColor: mine ? "rgba(7,23,17,0.16)" : "rgba(255,255,255,0.10)",
                    },
                  ]}
                >
                  <VideoIcon size={11} strokeWidth={2.3} color={mine ? OUTGOING_TEXT : TEXT_MAIN} />
                  <Text
                    style={[
                      styles.videoDurationText,
                      { color: mine ? OUTGOING_TEXT : TEXT_MAIN },
                    ]}
                  >
                    {message.durationLabel || message.fileLabel || "00:00"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      ) : null}

      {isPlayableAudio ? (
        <View
          style={[
            styles.audioCard,
            {
              borderColor: mine ? "rgba(7,23,17,0.14)" : `${accent}18`,
              backgroundColor: mine ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.04)",
            },
          ]}
        >
          <Pressable
            onPress={() => onAudioPlayPause(message)}
            style={({ pressed }) => [styles.audioPlayButtonWrap, pressed ? styles.pressView : undefined]}
          >
            <LinearGradient
              colors={mine ? ["rgba(255,255,255,0.40)", "rgba(255,255,255,0.18)"] : [preset.actionGradient[0], preset.actionGradient[2]]}
              style={styles.audioPlayButton}
            >
              {isActiveAudio && audioIsPlaying ? (
                <Pause size={14} strokeWidth={2.3} color={mine ? OUTGOING_TEXT : preset.actionIconColor} />
              ) : (
                <Play size={14} strokeWidth={2.3} color={mine ? OUTGOING_TEXT : preset.actionIconColor} />
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.audioBody}>
            <Pressable
              onLayout={(event) => setAudioBarWidth(event.nativeEvent.layout.width)}
              onPress={(event) => {
                if (!audioBarWidth) return;
                const ratio = event.nativeEvent.locationX / audioBarWidth;
                onAudioSeek(message, ratio);
              }}
              style={styles.audioTimeline}
            >
              <View style={styles.audioWaveRow}>
                {AUDIO_WAVEFORM_BARS.map((height, index) => (
                  <View
                    key={`${message.id}-${index}`}
                    style={[
                      styles.audioWaveBar,
                      {
                        height,
                        opacity: audioProgress >= index / Math.max(1, AUDIO_WAVEFORM_BARS.length - 1) ? 1 : 0.28,
                        marginRight: index === AUDIO_WAVEFORM_BARS.length - 1 ? 0 : 3,
                        backgroundColor: mine ? "rgba(7,23,17,0.72)" : accent,
                      },
                    ]}
                  />
                ))}
              </View>
              <View
                style={[
                  styles.audioProgressTrack,
                  { backgroundColor: mine ? "rgba(7,23,17,0.14)" : "rgba(255,255,255,0.12)" },
                ]}
              >
                <View
                  style={[
                    styles.audioProgressFill,
                    { width: `${audioProgress * 100}%`, backgroundColor: mine ? "rgba(7,23,17,0.72)" : accent },
                  ]}
                />
              </View>
            </Pressable>

            <View style={styles.audioMetaRow}>
              <Text style={[styles.audioTimeLabel, { color: metaColor }]}>
                {`${formatAudioClock(playbackPosition)} / ${formatAudioClock(playbackDuration || message.durationMs || 0)}`}
              </Text>

              <View style={styles.audioRates}>
                {[1, 2, 3].map((rate) => {
                  const active = isActiveAudio && audioRate === rate;
                  return (
                    <Pressable
                      key={`${message.id}-rate-${rate}`}
                      onPress={() => onAudioRateChange(message, rate)}
                      style={styles.audioRateWrap}
                    >
                      <View
                        style={[
                          styles.audioRatePill,
                          active
                            ? {
                                backgroundColor: mine ? "rgba(7,23,17,0.16)" : `${accent}18`,
                                borderColor: mine ? "rgba(7,23,17,0.22)" : `${accent}30`,
                              }
                            : undefined,
                        ]}
                      >
                        <Text
                          style={[
                            styles.audioRateText,
                            { color: active ? (mine ? OUTGOING_TEXT : TEXT_MAIN) : metaColor },
                          ]}
                        >
                          {rate}x
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.messageContentStretch}>
        {!hideBodyText && visibleMessageText ? (
          <Text
            style={[styles.messageTextStretch, { color: textColor }]}
          >
            {visibleMessageText}
          </Text>
        ) : null}

        {inlineTranslation ? (
          <View
            style={[
              styles.inlineTranslationCard,
              {
                backgroundColor: mine ? "rgba(7,23,17,0.10)" : "rgba(255,255,255,0.06)",
                borderColor: mine ? "rgba(7,23,17,0.14)" : `${accent}22`,
              },
            ]}
          >
            <View style={styles.inlineTranslationHeader}>
              <Sparkles size={11} strokeWidth={2.3} color={mine ? OUTGOING_TEXT : accent} />
              <Text style={[styles.inlineTranslationLabel, { color: mine ? OUTGOING_META : accent }]}>
                {inlineTranslation.status === "loading"
                  ? labels.translatingInline
                  : inlineTranslation.status === "error"
                    ? labels.translationFailed
                    : labels.translatedInline}
              </Text>
            </View>
            <Text
              style={[styles.inlineTranslationText, { color: inlineTranslation.status === "error" ? metaColor : textColor }]}
            >
              {inlineTranslation.status === "loading"
                ? labels.translatingInline
                : inlineTranslation.status === "error"
                  ? inlineTranslation.error || labels.translationFailed
                  : inlineTranslation.text}
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.messageMetaStretch,
            mine ? styles.messageMetaMine : styles.messageMetaOther,
          ]}
        >
          {message.edited ? (
            <Text style={[styles.messageEdited, { color: metaColor }]}>
              {labels.editedLabel}
            </Text>
          ) : null}

          <Text style={[styles.messageTime, { color: metaColor }]}>
            {message.time}
          </Text>

          {mine ? (
            statusIcon === "single" ? (
              <Check size={14} strokeWidth={2.6} color={OUTGOING_TEXT} style={styles.statusIcon} />
            ) : (
              <CheckCheck
                size={14}
                strokeWidth={2.4}
                color={statusIcon === "double-active" ? OUTGOING_TEXT : OUTGOING_META}
                style={styles.statusIcon}
              />
            )
          ) : null}
        </View>
      </View>
    </LinearGradient>
  );
}


function ChatRoomContent() {
  const insets = useSafeAreaInsets();

  // CHAT_ROOM_CONTACT_KEYBOARD_FIX
  const [chatRoomContactKeyboardHeight, setChatRoomContactKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (event) => {
      const height = Math.max(0, Math.floor(event.endCoordinates?.height || 0));
      setChatRoomContactKeyboardHeight(height);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setChatRoomContactKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const chatRoomContactBackdropLiftStyle = useMemo(
    () => ({
      justifyContent: "flex-end" as const,
      paddingBottom: Math.max(insets.bottom + 8, 16),
    }),
    [insets.bottom],
  );

  const chatRoomContactScrollPadding = useMemo(
    () => ({
      paddingBottom: chatRoomContactKeyboardHeight > 0 ? 110 : 24,
    }),
    [chatRoomContactKeyboardHeight],
  );

  const params = useLocalSearchParams<{
    id?: string;
    chatId?: string;
    userId?: string;
    selfId?: string;
    currentUserId?: string;
    peerId?: string;
    peerUserId?: string;
    partnerId?: string;
    contactId?: string;
    targetUserId?: string;
    name?: string;
    roomType?: string;
    handle?: string;
    phone?: string;
    verified?: string;
    status?: string;
    subtitle?: string;
    avatarUrl?: string;
    photoUrl?: string;
    coverUrl?: string;
    publicPhotos?: string;
    publicVideos?: string;
    publicGifts?: string;
    likesCount?: string;
    publicGiftsCount?: string;
    presenceOnline?: string;
    lastSeenAt?: string;
    isBot?: string;
    botId?: string;
    botHandle?: string;
    botKind?: string;
    isBotOwnedByMe?: string;
    hiddenFromMain?: string;
    forceVisibleInMain?: string;
    connectedBotHandle?: string;
    connectedBotId?: string;
    linkedBotHandle?: string;
    linkedBotId?: string;
    channelBotHandle?: string;
    channelBotId?: string;
    channelInviteLink?: string;
    inviteLink?: string;
    channelRole?: string;
    channelAccess?: string;
    ownerUserId?: string;
    channelOwnerUserId?: string;
    isChannelOwner?: string;
    isChannelAdmin?: string;
    canSendMessages?: string;
    canSendText?: string;
    canSendMedia?: string;
    onlyAdminsCanPost?: string;
  }>();

  const chatId = typeof params.id === "string" ? params.id : "1";
  const routeChatId =
    typeof params.chatId === "string" && params.chatId.trim().length
      ? params.chatId.trim()
      : chatId;
  const routeUserId =
    typeof params.currentUserId === "string" && params.currentUserId.trim().length
      ? params.currentUserId.trim()
      : typeof params.selfId === "string" && params.selfId.trim().length
        ? params.selfId.trim()
        : typeof params.userId === "string" && params.userId.trim().length
          ? params.userId.trim()
          : "";
  const routePeerId =
    typeof params.peerId === "string" && params.peerId.trim().length
      ? params.peerId.trim()
      : typeof params.peerUserId === "string" && params.peerUserId.trim().length
        ? params.peerUserId.trim()
        : typeof params.partnerId === "string" && params.partnerId.trim().length
          ? params.partnerId.trim()
          : typeof params.contactId === "string" && params.contactId.trim().length
            ? params.contactId.trim()
            : typeof params.targetUserId === "string" && params.targetUserId.trim().length
              ? params.targetUserId.trim()
              : "";
  const routeHandle =
    typeof params.handle === "string" && params.handle.trim().length
      ? params.handle.trim()
      : "";
  const routePhone =
    typeof params.phone === "string" && params.phone.trim().length
      ? normalizeContactPhone(params.phone)
      : "";
  const routeStatusText =
    typeof params.status === "string" && params.status.trim().length
      ? params.status.trim()
      : "";
  const routeSubtitleText =
    typeof params.subtitle === "string" && params.subtitle.trim().length
      ? params.subtitle.trim()
      : "";
  const routePresenceOnline =
    typeof params.presenceOnline === "string"
      ? ["1", "true", "yes", "online"].includes(params.presenceOnline.trim().toLowerCase())
      : undefined;
  const routeLastSeenAt =
    typeof params.lastSeenAt === "string" && params.lastSeenAt.trim().length
      ? params.lastSeenAt.trim()
      : "";
  const routeHiddenFromMain =
    typeof params.hiddenFromMain === "string" &&
    ["1", "true", "yes", "hidden"].includes(params.hiddenFromMain.trim().toLowerCase());
  const routeForceVisibleInMain =
    typeof params.forceVisibleInMain === "string"
      ? ["1", "true", "yes", "visible"].includes(params.forceVisibleInMain.trim().toLowerCase())
      : !routeHiddenFromMain;
  const isBotRoom =
    typeof params.isBot === "string" && ["1", "true", "yes", "bot"].includes(params.isBot.trim().toLowerCase());
  const routeBotId =
    typeof params.botId === "string" && params.botId.trim().length ? params.botId.trim() : routeChatId;
  const routeBotHandle =
    typeof params.botHandle === "string" && params.botHandle.trim().length ? params.botHandle.trim() : "";
  const routeBotKind = normalizeBotRoomKind(
    typeof params.botKind === "string" ? params.botKind : undefined,
  );
  const isBotOwnedByMe =
    typeof params.isBotOwnedByMe === "string" && ["1", "true", "yes"].includes(params.isBotOwnedByMe.trim().toLowerCase());
  const routeChannelBotId =
    typeof params.channelBotId === "string" && params.channelBotId.trim().length
      ? params.channelBotId.trim()
      : typeof params.linkedBotId === "string" && params.linkedBotId.trim().length
        ? params.linkedBotId.trim()
        : typeof params.connectedBotId === "string" && params.connectedBotId.trim().length
          ? params.connectedBotId.trim()
          : typeof params.botId === "string" && params.botId.trim().length && params.botId.trim() !== routeChatId
            ? params.botId.trim()
            : "";
  const routeChannelBotHandle =
    typeof params.channelBotHandle === "string" && params.channelBotHandle.trim().length
      ? params.channelBotHandle.trim()
      : typeof params.linkedBotHandle === "string" && params.linkedBotHandle.trim().length
        ? params.linkedBotHandle.trim()
        : typeof params.connectedBotHandle === "string" && params.connectedBotHandle.trim().length
          ? params.connectedBotHandle.trim()
          : "";
  const meta = getChatMeta(
    chatId,
    typeof params.name === "string" ? params.name : undefined,
  );
  const routeName =
    typeof params.name === "string" && params.name.trim().length
      ? params.name.trim()
      : meta.name;

const { language, t } = useI18n();

const TRANSLATION_ALIASES: Record<string, string[]> = {
  "messenger.chat.you": ["chatRoom.you", "common.you"],
  "messenger.chat.typing": ["chatRoom.typing", "messenger.typing"],
  "messenger.chat.online": ["chatRoom.online", "common.online", "messenger.online"],
  "messenger.chat.offline": ["chatRoom.offline", "common.offline", "messenger.offline"],
  "messenger.chat.connecting": ["chatRoom.connecting"],
  "messenger.chat.reconnecting": ["chatRoom.reconnecting"],
  "messenger.chat.lastSeenToday": ["chatRoom.lastSeenToday"],
  "messenger.chat.lastSeenYesterday": ["chatRoom.lastSeenYesterday"],
  "messenger.chat.lastSeenDate": ["chatRoom.lastSeenDate"],
  "messenger.chat.conversationPlaceholder": ["chatRoom.conversationPlaceholder"],
  "messenger.chat.today": ["common.today", "chatRoom.today"],
  "messenger.chat.yesterday": ["common.yesterday", "chatRoom.yesterday"],
  "messenger.chat.directRoom": ["chatRoom.directRoom"],
  "messenger.chat.groupRoom": ["chatRoom.groupRoom"],
  "messenger.chat.channelRoom": ["chatRoom.channelRoom"],
  "messenger.chat.businessRoom": ["chatRoom.businessRoom"],
  "messenger.chat.encrypted": ["chatRoom.encrypted", "messenger.encrypted"],
  "messenger.chat.messagePlaceholder": ["chatRoom.messagePlaceholder", "messenger.typeMessage"],
  "messenger.chat.messageTitle": ["chatRoom.messageTitle", "messenger.message", "common.message"],
  "messenger.chat.replyAction": ["chatRoom.replyAction", "messenger.reply", "common.reply"],
  "messenger.chat.replyPlaceholder": ["chatRoom.replyPlaceholder"],
  "messenger.chat.selectionDelete": ["chatRoom.selectionDelete", "common.delete"],
  "messenger.chat.selectionForward": ["chatRoom.selectionForward", "messenger.forward", "common.forward"],
  "messenger.chat.deleteMe": ["messenger.deleteForMe", "common.delete"],
  "messenger.chat.deleteAllAction": ["messenger.deleteForEveryone", "common.delete"],
  "messenger.chat.save": ["common.save"],
  "messenger.chat.searchTitle": ["chatRoom.searchTitle", "messenger.search", "common.search"],
  "messenger.chat.searchMessage": ["chatRoom.searchMessage"],
  "messenger.chat.muteTitle": ["chatRoom.muteTitle", "messenger.muteChat"],
  "messenger.chat.muteMessage": ["chatRoom.muteMessage"],
  "messenger.chat.locationTitle": ["chatRoom.locationTitle", "messenger.location"],
  "messenger.chat.sharedLocation": ["chatRoom.sharedLocation"],
  "messenger.chat.contactTitle": ["chatRoom.contactTitle", "messenger.contact"],
  "messenger.chat.contactsTitle": ["chatRoom.contactsTitle", "messenger.contact"],
  "messenger.chat.documentTitle": ["chatRoom.documentTitle", "messenger.document"],
  "messenger.chat.documentsTitle": ["chatRoom.documentsTitle", "messenger.document"],
  "messenger.chat.galleryTitle": ["chatRoom.galleryTitle", "messenger.photo", "messenger.media"],
  "messenger.chat.photoTitle": ["chatRoom.photoTitle", "messenger.photo"],
  "messenger.chat.videoTitle": ["chatRoom.videoTitle", "messenger.videoMessage"],
  "messenger.chat.voiceTitle": ["chatRoom.voiceTitle", "messenger.voiceMessage"],
  "messenger.chat.copiedText": ["success.copied", "common.copied"],
  "messenger.chat.link": ["chatRoom.link", "common.open"],
  "messenger.chat.infoAction": ["chatRoom.infoAction", "common.info"],
  "messenger.chat.editingTitle": ["chatRoom.editingTitle"],
  "messenger.chat.editingSubtitle": ["chatRoom.editingSubtitle"],
  "messenger.chat.replyingTitle": ["chatRoom.replyingTitle"],
  "messenger.chat.editPlaceholder": ["chatRoom.editPlaceholder"],
  "messenger.chat.readOnlyTitle": ["chatRoom.readOnlyTitle"],
  "messenger.chat.readOnlySubtitle": ["chatRoom.readOnlySubtitle"],
  "messenger.chat.mediaLabel": ["chatRoom.mediaLabel", "messenger.media"],
  "messenger.chat.mediaTitle": ["chatRoom.mediaTitle", "messenger.media"],
  "messenger.chat.privacyTitle": ["chatRoom.privacyTitle", "common.privacy"],
  "messenger.chat.privacyMessage": ["chatRoom.privacyMessage"],
  "messenger.chat.roomThemeUpdated": ["chatRoom.roomThemeUpdated", "success.saved"],
  "messenger.chat.recordingVoice": ["chatRoom.recordingVoice"],
  "messenger.chat.voiceReady": ["chatRoom.voiceReady", "success.saved"],
  "messenger.chat.voiceReadyToSend": ["chatRoom.voiceReadyToSend"],
  "messenger.chat.voiceSent": ["chatRoom.voiceSent", "success.sent"],
  "messenger.chat.voicePlayback": ["chatRoom.voicePlayback"],
  "messenger.chat.voiceRecordingTitle": ["chatRoom.voiceRecordingTitle"],
  "messenger.chat.voiceRecordingSubtitle": ["chatRoom.voiceRecordingSubtitle"],
  "messenger.chat.voiceReadySubtitle": ["chatRoom.voiceReadySubtitle"],
  "messenger.chat.voiceStartError": ["chatRoom.voiceStartError", "errors.permissionRequired"],
  "messenger.chat.voiceFinishError": ["chatRoom.voiceFinishError", "errors.messageFailed"],
  "messenger.chat.voiceUploadError": ["chatRoom.voiceUploadError", "errors.messageFailed"],
  "messenger.chat.voicePlayError": ["chatRoom.voicePlayError"],
  "messenger.chat.voiceRateError": ["chatRoom.voiceRateError"],
  "messenger.chat.messageContextMissing": ["chatRoom.messageContextMissing"],
  "messenger.chat.messageEdited": ["chatRoom.messageEdited", "success.saved"],
  "messenger.chat.messageSent": ["chatRoom.messageSent", "success.sent"],
  "messenger.chat.messageSendError": ["chatRoom.messageSendError", "errors.messageFailed"],
  "messenger.chat.photoPreviewSubtitle": ["chatRoom.photoPreviewSubtitle"],
  "messenger.chat.photoPreviewUnavailable": ["chatRoom.photoPreviewUnavailable"],
  "messenger.chat.photoCaptured": ["chatRoom.photoCaptured", "success.saved"],
  "messenger.chat.photoSaveNotice": ["chatRoom.photoSaveNotice", "common.save"],
  "messenger.chat.photoSaveError": ["chatRoom.photoSaveError"],
  "messenger.chat.videoCaptured": ["chatRoom.videoCaptured", "success.saved"],
  "messenger.chat.videoSaveNotice": ["chatRoom.videoSaveNotice", "common.save"],
  "messenger.chat.videoSaveError": ["chatRoom.videoSaveError"],
  "messenger.chat.videoCloseHint": ["chatRoom.videoCloseHint"],
  "messenger.chat.locationAttached": ["chatRoom.locationAttached", "success.saved"],
  "messenger.chat.locationOpenNotice": ["chatRoom.locationOpenNotice", "common.open"],
  "messenger.chat.locationOpenError": ["chatRoom.locationOpenError"],
  "messenger.chat.locationSendError": ["chatRoom.locationSendError"],
  "messenger.chat.locationCoordsMissing": ["chatRoom.locationCoordsMissing"],
  "messenger.chat.documentAttached": ["chatRoom.documentAttached", "success.saved"],
  "messenger.chat.documentPreviewUnavailable": ["chatRoom.documentPreviewUnavailable"],
  "messenger.chat.documentOpenNotice": ["chatRoom.documentOpenNotice", "common.open"],
  "messenger.chat.documentOpening": ["chatRoom.documentOpening", "common.open"],
  "messenger.chat.documentOpenError": ["chatRoom.documentOpenError"],
  "messenger.chat.documentAccessError": ["chatRoom.documentAccessError"],
  "messenger.chat.galleryAccessError": ["chatRoom.galleryAccessError"],
  "messenger.chat.contactCard": ["chatRoom.contactCard"],
  "messenger.chat.contactAttached": ["chatRoom.contactAttached", "success.saved"],
  "messenger.chat.contactReady": ["chatRoom.contactReady"],
  "messenger.chat.contactOpenNotice": ["chatRoom.contactOpenNotice", "common.open"],
  "messenger.chat.contactOpenError": ["chatRoom.contactOpenError"],
  "messenger.chat.contactsAccessError": ["chatRoom.contactsAccessError"],
  "messenger.chat.giftSent": ["chatRoom.giftSent", "success.sent"],
  "messenger.chat.animatedReactionSent": ["chatRoom.animatedReactionSent", "success.sent"],
  "messenger.chat.animatedEmojiSent": ["chatRoom.animatedEmojiSent", "success.sent"],
  "messenger.chat.stickerAdded": ["chatRoom.stickerAdded", "success.saved"],
  "messenger.chat.selectedForForwardPrefix": ["chatRoom.selectedForForwardPrefix"],
  "messenger.chat.chooseMessagesForward": ["chatRoom.chooseMessagesForward"],
  "messenger.chat.deletedPrefix": ["chatRoom.deletedPrefix", "common.delete"],
  "messenger.chat.deletedForAll": ["chatRoom.deletedForAll", "success.saved"],
  "messenger.chat.deletedForMe": ["chatRoom.deletedForMe", "success.saved"],
  "messenger.chat.addedToComposer": ["chatRoom.addedToComposer", "success.saved"],
  "messenger.chat.saveMediaReady": ["chatRoom.saveMediaReady", "common.save"],
  "messenger.chat.openLinkReady": ["chatRoom.openLinkReady", "common.open"],
  "messenger.chat.openingWalletFiat": ["chatRoom.openingWalletFiat"],
  "messenger.chat.openingCoinWallet": ["chatRoom.openingCoinWallet"],
  "messenger.chat.catalogSoon": ["chatRoom.catalogSoon"],
  "messenger.chat.pollSoon": ["chatRoom.pollSoon"],
  "messenger.chat.eventSoon": ["chatRoom.eventSoon"],
  "messenger.chat.openingDocument": ["chatRoom.openingDocument", "common.open"],
  "messenger.chat.openingContact": ["chatRoom.openingContact", "common.open"],
  "messenger.chat.normal": ["chatRoom.imageNormal"],
  "messenger.chat.editedLabel": ["chatRoom.editedLabel"],
  "messenger.chat.mapLabel": ["chatRoom.mapLabel"],
  "messenger.chat.mediaCaptureFailed": ["chatRoom.mediaCaptureFailed"],
  "messenger.chat.voiceReadyInline": ["chatRoom.voiceReadyInline"],
  "messenger.chat.locationAccessError": ["chatRoom.locationAccessError"],
  "messenger.chat.videoMessageText": ["chatRoom.videoMessageText"],
  "messenger.chat.tapSend": ["chatRoom.tapSend"],
  "messenger.chat.diamondsUnit": ["chatRoom.diamondsUnit"],
  "messenger.chat.channelInfoAction": ["chatRoom.channelInfoAction"],
  "messenger.chat.groupInfoAction": ["chatRoom.groupInfoAction"],
  "messenger.chat.businessInfoAction": ["chatRoom.businessInfoAction"],
  "messenger.chat.membersCount": ["chatRoom.membersCount"],
  "messenger.chat.subscribersCount": ["chatRoom.subscribersCount"],
  "messenger.chat.mutedEnabled": ["chatRoom.mutedEnabled"],
  "messenger.chat.mutedDisabled": ["chatRoom.mutedDisabled"],
  "messenger.chat.searchFocused": ["chatRoom.searchFocused"],
  "messenger.chat.aiTitle": ["chatRoom.aiTitle"],
  "messenger.chat.aiMessage": ["chatRoom.aiMessage"],
  "messenger.chat.aiReady": ["chatRoom.aiReady"],
  "messenger.chat.mediaSaved": ["chatRoom.mediaSaved", "success.saved"],
  "messenger.chat.contactSavedToDevice": ["chatRoom.contactSavedToDevice"],
  "messenger.chat.contactPermissionDenied": ["chatRoom.contactPermissionDenied"],
  "messenger.chat.contactUnavailable": ["chatRoom.contactUnavailable"],
  "messenger.chat.addedToList": ["chatRoom.addedToList"],
  "messenger.chat.removedFromList": ["chatRoom.removedFromList"],
  "messenger.chat.disappearingEnabled": ["chatRoom.disappearingEnabled"],
  "messenger.chat.disappearingDisabled": ["chatRoom.disappearingDisabled"],
  "messenger.chat.reportSent": ["chatRoom.reportSent"],
  "messenger.chat.chatCleared": ["chatRoom.chatCleared"],
  "messenger.chat.conversationHidden": ["chatRoom.conversationHidden"],
  "messenger.chat.chatExported": ["chatRoom.chatExported"],
  "messenger.chat.homeShortcutPinned": ["chatRoom.homeShortcutPinned"],
  "messenger.chat.homeShortcutUnsupported": ["chatRoom.homeShortcutUnsupported"],
  "messenger.chat.blockActionDone": ["chatRoom.blockActionDone"],
  "messenger.chat.unblockActionDone": ["chatRoom.unblockActionDone"],
};

const tx = useCallback(
  (key: string, fallback: string) => {
    const candidates = [...(TRANSLATION_ALIASES[key] ?? []), key];

    for (const candidate of candidates) {
      const translated = t(candidate);
      if (typeof translated === "string" && translated.trim() && translated !== candidate) {
        return translated;
      }
    }

    return fallback;
  },
  [t],
);

const roomType = useMemo(
  () =>
    isBotRoom
      ? resolveBotRoomType(routeBotKind)
      : inferRoomType(
          chatId,
          meta,
          typeof params.roomType === "string" ? params.roomType : undefined,
        ),
  [chatId, isBotRoom, meta, params.roomType, routeBotKind],
);

const [sabiLocalChannelChatCanPost, setSabiLocalChannelChatCanPost] = useState(false);

const sabiRouteChannelChatCanPost = useMemo(
  () =>
    roomType === "channel"
      ? canSabiChannelChatPostFromRoute(params as Record<string, unknown>)
      : false,
  [
    roomType,
    params.channelRole,
    params.channelAccess,
    params.isChannelOwner,
    params.isChannelAdmin,
    params.canSendMessages,
    params.canSendText,
    params.canSendMedia,
    params.ownerUserId,
    params.channelOwnerUserId,
    params.currentUserId,
    params.selfId,
    params.userId,
  ],
);

useEffect(() => {
  if (roomType !== "channel") {
    setSabiLocalChannelChatCanPost(false);
    return;
  }

  if (sabiRouteChannelChatCanPost) {
    setSabiLocalChannelChatCanPost(true);
    return;
  }

  let cancelled = false;

  void canSabiLocalChannelChatComposerPost({
    chatId,
    routeChatId,
    routeHandle,
    routeName,
    currentUserId: routeUserId,
  }).then((canPost) => {
    if (!cancelled) setSabiLocalChannelChatCanPost(canPost);
  });

  return () => {
    cancelled = true;
  };
}, [chatId, roomType, routeChatId, routeHandle, routeName, routeUserId, sabiRouteChannelChatCanPost]);

const channelActorCanPost =
  roomType === "channel" && (sabiRouteChannelChatCanPost || sabiLocalChannelChatCanPost);

const roomCapabilities = useMemo(() => {
  const base = getRoomCapabilities(roomType);

  if (roomType === "channel" && channelActorCanPost) {
    return {
      ...base,
      canSendText: true,
      canSendMedia: true,
      canSendLocation: true,
      canGift: false,
      canCall: false,
      canVideoCall: false,
      showPresence: false,
      showMembers: true,
      showBusinessTools: false,
      showChannelTools: true,
      isReadOnly: false,
    };
  }

  if (!isBotRoom) return base;

  return {
    ...base,
    canCall: false,
    canVideoCall: false,
    showPresence: false,
    showMembers: false,
    showBusinessTools: routeBotKind === "business",
    showChannelTools: false,
    isReadOnly: false,
  };
}, [channelActorCanPost, isBotRoom, roomType, routeBotKind]);

const routeAvatarUrl =
  typeof params.avatarUrl === "string" && params.avatarUrl.trim().length
    ? params.avatarUrl.trim()
    : typeof params.photoUrl === "string" && params.photoUrl.trim().length
      ? params.photoUrl.trim()
      : "";

const [activePeerId, setActivePeerId] = useState<string>(routePeerId);
const [publicProfileRevision, setPublicProfileRevision] = useState(0);
const lastPublicProfileFetchKeyRef = useRef("");

const groupSharedProfile = useMemo(
  () => (roomType === "group" && routeChatId ? hydrateGroupPublicProfile(routeChatId) : null),
  [publicProfileRevision, roomType, routeChatId],
);

const sharedPublicProfile = useMemo(
  () => (routeChatId ? hydratePublicProfile(routeChatId) : null),
  [publicProfileRevision, routeChatId],
);

useEffect(() => {
  let mounted = true;

  void Promise.all([hydratePublicProfileStorage(), hydrateGroupPublicProfileStorage()]).then(() => {
    if (mounted) setPublicProfileRevision((value) => value + 1);
  });

  const unsubscribe = subscribePublicProfiles(() => {
    setPublicProfileRevision((value) => value + 1);
  });
  const unsubscribeGroupPublicProfiles = subscribeGroupPublicProfiles(() => {
    setPublicProfileRevision((value) => value + 1);
  });

  return () => {
    mounted = false;
    unsubscribe();
    unsubscribeGroupPublicProfiles();
  };
}, []);

const peerPublicProfile = useMemo(
  () =>
    roomType === "direct"
      ? hydratePublicProfileByAnyIdentifier([
          activePeerId,
          routePeerId,
          routeChatId,
          routePhone,
          routeHandle,
          routeName,
        ])
      : null,
  [activePeerId, publicProfileRevision, roomType, routeChatId, routeName, routePeerId, routePhone, routeHandle],
);

const resolvedDirectPublicProfile = useMemo(
  () =>
    roomType === "direct"
      ? pickDirectPublicProfileSnapshot(peerPublicProfile, sharedPublicProfile)
      : null,
  [peerPublicProfile, roomType, sharedPublicProfile],
);

const directPublicPhotoAvatarUri =
  roomType === "direct" && Array.isArray(resolvedDirectPublicProfile?.publicationPhotos)
    ? String(
        resolvedDirectPublicProfile.publicationPhotos
          .map((item) => String(item?.thumbnailUri || item?.uri || item?.mediaUri || "").trim())
          .find(Boolean) || "",
      ).trim()
    : "";

const sharedPublicPhotoAvatarUri =
  roomType === "direct" && Array.isArray(sharedPublicProfile?.publicationPhotos)
    ? String(
        sharedPublicProfile.publicationPhotos
          .map((item) => String(item?.thumbnailUri || item?.uri || item?.mediaUri || "").trim())
          .find(Boolean) || "",
      ).trim()
    : "";
const directProfileAvatarUri =
  roomType === "direct"
    ? String(resolvedDirectPublicProfile?.avatarUri || resolvedDirectPublicProfile?.coverUri || "").trim()
    : "";

const headerAvatarUri = String(
  roomType === "direct"
    ? directProfileAvatarUri || directPublicPhotoAvatarUri || sharedPublicPhotoAvatarUri || routeAvatarUrl
    : routeAvatarUrl,
).trim();


const routePublicPhotosParam =
  typeof params.publicPhotos === "string"
    ? params.publicPhotos
    : Array.isArray(params.publicPhotos)
      ? params.publicPhotos[0]
      : undefined;

const routePublicVideosParam =
  typeof params.publicVideos === "string"
    ? params.publicVideos
    : Array.isArray(params.publicVideos)
      ? params.publicVideos[0]
      : undefined;

const routePublicGiftsParam =
  typeof params.publicGifts === "string"
    ? params.publicGifts
    : Array.isArray(params.publicGifts)
      ? params.publicGifts[0]
      : undefined;

const routeLikesCountParam =
  typeof params.likesCount === "string"
    ? params.likesCount
    : Array.isArray(params.likesCount)
      ? params.likesCount[0]
      : undefined;

const routePublicGiftsCountParam =
  typeof params.publicGiftsCount === "string"
    ? params.publicGiftsCount
    : Array.isArray(params.publicGiftsCount)
      ? params.publicGiftsCount[0]
      : undefined;

const infoPublicPhotosParam =
  roomType === "group"
    ? (() => {
        const source =
          Array.isArray(groupSharedProfile?.publicationPhotos) && groupSharedProfile.publicationPhotos.length
            ? groupSharedProfile.publicationPhotos
            : parseSharedPublicMediaItems(routePublicPhotosParam);
        const normalized = source
          .map((item) => ({
            id: item.id,
            uri: item.uri || item.mediaUri || item.thumbnailUri || "",
            thumbnailUri: item.thumbnailUri,
            mediaUri: item.mediaUri || item.uri,
            mimeType: item.mimeType,
            kind: "photo" as const,
            views: typeof item.views === "number" ? item.views : 0,
            duration: item.duration,
            liked: Boolean(item.liked),
          }))
          .filter((item) => String(item.uri || item.mediaUri || item.thumbnailUri || "").trim());
        return normalized.length ? JSON.stringify(normalized) : routePublicPhotosParam;
      })()
    : Array.isArray(resolvedDirectPublicProfile?.publicationPhotos) &&
        resolvedDirectPublicProfile.publicationPhotos.length
      ? JSON.stringify(
          resolvedDirectPublicProfile.publicationPhotos.map((item) => ({
            id: item.id,
            uri: item.uri,
            thumbnailUri: item.thumbnailUri,
            mediaUri: item.mediaUri,
            mimeType: item.mimeType,
            kind: "photo" as const,
            views: typeof item.views === "number" ? item.views : 0,
            duration: item.duration,
            liked: Boolean(item.liked),
          })),
        )
      : routePublicPhotosParam;

const infoPublicVideosParam =
  roomType === "group"
    ? (() => {
        const source =
          Array.isArray(groupSharedProfile?.publicationVideos) && groupSharedProfile.publicationVideos.length
            ? groupSharedProfile.publicationVideos
            : parseSharedPublicMediaItems(routePublicVideosParam);
        const normalized = source
          .map((item) => ({
            id: item.id,
            uri: item.uri || item.thumbnailUri || item.mediaUri || "",
            thumbnailUri: item.thumbnailUri,
            mediaUri: item.mediaUri || item.uri,
            mimeType: item.mimeType,
            kind: "video" as const,
            views: typeof item.views === "number" ? item.views : 0,
            duration: item.duration,
            liked: Boolean(item.liked),
          }))
          .filter((item) => String(item.uri || item.mediaUri || item.thumbnailUri || "").trim());
        return normalized.length ? JSON.stringify(normalized) : routePublicVideosParam;
      })()
    : Array.isArray(resolvedDirectPublicProfile?.publicationVideos) &&
        resolvedDirectPublicProfile.publicationVideos.length
      ? JSON.stringify(
          resolvedDirectPublicProfile.publicationVideos.map((item) => ({
            id: item.id,
            uri: item.uri,
            thumbnailUri: item.thumbnailUri,
            mediaUri: item.mediaUri,
            mimeType: item.mimeType,
            kind: "video" as const,
            views: typeof item.views === "number" ? item.views : 0,
            duration: item.duration,
            liked: Boolean(item.liked),
          })),
        )
      : routePublicVideosParam;

const infoPublicGiftsParam =
  Array.isArray(resolvedDirectPublicProfile?.publicGifts) && resolvedDirectPublicProfile.publicGifts.length
    ? JSON.stringify(
        resolvedDirectPublicProfile.publicGifts.map((item) => ({
          id: item.id,
          title: item.title,
          emoji: item.emoji,
          imageUri: item.imageUri,
        })),
      )
    : routePublicGiftsParam;

const infoLikesCountParam =
  roomType === "group"
    ? String(typeof groupSharedProfile?.likesCount === "number" ? groupSharedProfile.likesCount : 0)
    : typeof resolvedDirectPublicProfile?.likesCount === "number"
      ? String(resolvedDirectPublicProfile.likesCount)
      : routeLikesCountParam;

const infoPublicGiftsCountParam =
  roomType === "group"
    ? String(
        typeof groupSharedProfile?.publicGiftsCount === "number"
          ? groupSharedProfile.publicGiftsCount
          : 0,
      )
    : typeof resolvedDirectPublicProfile?.publicGiftsCount === "number"
      ? String(resolvedDirectPublicProfile.publicGiftsCount)
      : routePublicGiftsCountParam;

const texts = useMemo(
  () => ({
    you: tx("messenger.chat.you", CHAT_ROOM_FALLBACKS.you),
    typing: tx("messenger.chat.typing", CHAT_ROOM_FALLBACKS.typing),
    online: tx("messenger.chat.online", CHAT_ROOM_FALLBACKS.online),
    offline: tx("messenger.chat.offline", CHAT_ROOM_FALLBACKS.offline),
    connecting: tx("messenger.chat.connecting", CHAT_ROOM_FALLBACKS.connecting),
    reconnecting: tx("messenger.chat.reconnecting", CHAT_ROOM_FALLBACKS.reconnecting),
    lastSeenToday: tx("messenger.chat.lastSeenToday", CHAT_ROOM_FALLBACKS.lastSeenToday),
    lastSeenYesterday: tx("messenger.chat.lastSeenYesterday", CHAT_ROOM_FALLBACKS.lastSeenYesterday),
    lastSeenDate: tx("messenger.chat.lastSeenDate", CHAT_ROOM_FALLBACKS.lastSeenDate),
    conversationPlaceholder: tx("messenger.chat.conversationPlaceholder", CHAT_ROOM_FALLBACKS.conversationPlaceholder),
    today: tx("messenger.chat.today", CHAT_ROOM_FALLBACKS.today),
    yesterday: tx("messenger.chat.yesterday", CHAT_ROOM_FALLBACKS.yesterday),
    directRoom: tx("messenger.chat.directRoom", CHAT_ROOM_FALLBACKS.directRoom),
    groupRoom: tx("messenger.chat.groupRoom", CHAT_ROOM_FALLBACKS.groupRoom),
    channelRoom: tx("messenger.chat.channelRoom", CHAT_ROOM_FALLBACKS.channelRoom),
    businessRoom: tx("messenger.chat.businessRoom", CHAT_ROOM_FALLBACKS.businessRoom),
    botAssistantRoom: tx("common.ai", "Assistant bot"),
    botServiceRoom: tx("common.service", "Service bot"),
    botBusinessRoom: tx("common.business", "Business bot"),
    encrypted: tx("messenger.chat.encrypted", CHAT_ROOM_FALLBACKS.encrypted),
    editingTitle: tx("messenger.chat.editingTitle", CHAT_ROOM_FALLBACKS.editingTitle),
    editingSubtitle: tx("messenger.chat.editingSubtitle", CHAT_ROOM_FALLBACKS.editingSubtitle),
    replyingTitle: tx("messenger.chat.replyingTitle", CHAT_ROOM_FALLBACKS.replyingTitle),
    editPlaceholder: tx("messenger.chat.editPlaceholder", CHAT_ROOM_FALLBACKS.editPlaceholder),
    replyPlaceholder: tx("messenger.chat.replyPlaceholder", CHAT_ROOM_FALLBACKS.replyPlaceholder),
    messagePlaceholder: tx("messenger.chat.messagePlaceholder", CHAT_ROOM_FALLBACKS.messagePlaceholder),
    readOnlyTitle: tx("messenger.chat.readOnlyTitle", CHAT_ROOM_FALLBACKS.readOnlyTitle),
    readOnlySubtitle: tx("messenger.chat.readOnlySubtitle", CHAT_ROOM_FALLBACKS.readOnlySubtitle),
    mediaLabel: tx("messenger.chat.mediaLabel", CHAT_ROOM_FALLBACKS.mediaLabel),
    aiTitle: tx("messenger.chat.aiTitle", CHAT_ROOM_FALLBACKS.aiTitle),
    aiMessage: tx("messenger.chat.aiMessage", CHAT_ROOM_FALLBACKS.aiMessage),
    mediaTitle: tx("messenger.chat.mediaTitle", CHAT_ROOM_FALLBACKS.mediaTitle),
    mediaMessage: tx("messenger.chat.mediaMessage", CHAT_ROOM_FALLBACKS.mediaMessage),
    searchTitle: tx("messenger.chat.searchTitle", CHAT_ROOM_FALLBACKS.searchTitle),
    searchMessage: tx("messenger.chat.searchMessage", CHAT_ROOM_FALLBACKS.searchMessage),
    muteTitle: tx("messenger.chat.muteTitle", CHAT_ROOM_FALLBACKS.muteTitle),
    muteMessage: tx("messenger.chat.muteMessage", CHAT_ROOM_FALLBACKS.muteMessage),
    privacyTitle: tx("messenger.chat.privacyTitle", CHAT_ROOM_FALLBACKS.privacyTitle),
    privacyMessage: tx("messenger.chat.privacyMessage", CHAT_ROOM_FALLBACKS.privacyMessage),
    roomThemeUpdated: tx("messenger.chat.roomThemeUpdated", CHAT_ROOM_FALLBACKS.roomThemeUpdated),
    recordingVoice: tx("messenger.chat.recordingVoice", CHAT_ROOM_FALLBACKS.recordingVoice),
    voiceReady: tx("messenger.chat.voiceReady", CHAT_ROOM_FALLBACKS.voiceReady),
    voiceReadyToSend: tx("messenger.chat.voiceReadyToSend", CHAT_ROOM_FALLBACKS.voiceReadyToSend),
    voiceSent: tx("messenger.chat.voiceSent", CHAT_ROOM_FALLBACKS.voiceSent),
    voicePlayback: tx("messenger.chat.voicePlayback", CHAT_ROOM_FALLBACKS.voicePlayback),
    voiceRecordingTitle: tx("messenger.chat.voiceRecordingTitle", CHAT_ROOM_FALLBACKS.voiceRecordingTitle),
    voiceRecordingSubtitle: tx("messenger.chat.voiceRecordingSubtitle", CHAT_ROOM_FALLBACKS.voiceRecordingSubtitle),
    voiceReadySubtitle: tx("messenger.chat.voiceReadySubtitle", CHAT_ROOM_FALLBACKS.voiceReadySubtitle),
    voiceTitle: tx("messenger.chat.voiceTitle", CHAT_ROOM_FALLBACKS.voiceTitle),
    voiceStartError: tx("messenger.chat.voiceStartError", CHAT_ROOM_FALLBACKS.voiceStartError),
    voiceFinishError: tx("messenger.chat.voiceFinishError", CHAT_ROOM_FALLBACKS.voiceFinishError),
    voiceUploadError: tx("messenger.chat.voiceUploadError", CHAT_ROOM_FALLBACKS.voiceUploadError),
    voicePlayError: tx("messenger.chat.voicePlayError", CHAT_ROOM_FALLBACKS.voicePlayError),
    voiceRateError: tx("messenger.chat.voiceRateError", CHAT_ROOM_FALLBACKS.voiceRateError),
    messageTitle: tx("messenger.chat.messageTitle", CHAT_ROOM_FALLBACKS.messageTitle),
    messageContextMissing: tx("messenger.chat.messageContextMissing", CHAT_ROOM_FALLBACKS.messageContextMissing),
    messageEdited: tx("messenger.chat.messageEdited", CHAT_ROOM_FALLBACKS.messageEdited),
    messageSent: tx("messenger.chat.messageSent", CHAT_ROOM_FALLBACKS.messageSent),
    messageSendError: tx("messenger.chat.messageSendError", CHAT_ROOM_FALLBACKS.messageSendError),
    translateAction: tx("messenger.chat.translateAction", CHAT_ROOM_FALLBACKS.translateAction),
    translatingInline: tx("messenger.chat.translatingInline", CHAT_ROOM_FALLBACKS.translatingInline),
    translatedInline: tx("messenger.chat.translatedInline", CHAT_ROOM_FALLBACKS.translatedInline),
    translationFailed: tx("messenger.chat.translationFailed", CHAT_ROOM_FALLBACKS.translationFailed),
    translationEmpty: tx("messenger.chat.translationEmpty", CHAT_ROOM_FALLBACKS.translationEmpty),
    translationLanguageTitle: tx("messenger.chat.translationLanguageTitle", CHAT_ROOM_FALLBACKS.translationLanguageTitle),
    translationLanguageSubtitle: tx("messenger.chat.translationLanguageSubtitle", CHAT_ROOM_FALLBACKS.translationLanguageSubtitle),
    translationProviderUnavailable: tx("messenger.chat.translationProviderUnavailable", CHAT_ROOM_FALLBACKS.translationProviderUnavailable),
    photoTitle: tx("messenger.chat.photoTitle", CHAT_ROOM_FALLBACKS.photoTitle),
    photoPreviewSubtitle: tx("messenger.chat.photoPreviewSubtitle", CHAT_ROOM_FALLBACKS.photoPreviewSubtitle),
    photoPreviewUnavailable: tx("messenger.chat.photoPreviewUnavailable", CHAT_ROOM_FALLBACKS.photoPreviewUnavailable),
    photoCaptured: tx("messenger.chat.photoCaptured", CHAT_ROOM_FALLBACKS.photoCaptured),
    photoSaveNotice: tx("messenger.chat.photoSaveNotice", CHAT_ROOM_FALLBACKS.photoSaveNotice),
    photoSaveError: tx("messenger.chat.photoSaveError", CHAT_ROOM_FALLBACKS.photoSaveError),
    videoTitle: tx("messenger.chat.videoTitle", CHAT_ROOM_FALLBACKS.videoTitle),
    videoCaptured: tx("messenger.chat.videoCaptured", CHAT_ROOM_FALLBACKS.videoCaptured),
    videoSaveNotice: tx("messenger.chat.videoSaveNotice", CHAT_ROOM_FALLBACKS.videoSaveNotice),
    videoSaveError: tx("messenger.chat.videoSaveError", CHAT_ROOM_FALLBACKS.videoSaveError),
    videoCloseHint: tx("messenger.chat.videoCloseHint", CHAT_ROOM_FALLBACKS.videoCloseHint),
    locationTitle: tx("messenger.chat.locationTitle", CHAT_ROOM_FALLBACKS.locationTitle),
    sharedLocation: tx("messenger.chat.sharedLocation", CHAT_ROOM_FALLBACKS.sharedLocation),
    locationAttached: tx("messenger.chat.locationAttached", CHAT_ROOM_FALLBACKS.locationAttached),
    locationOpenNotice: tx("messenger.chat.locationOpenNotice", CHAT_ROOM_FALLBACKS.locationOpenNotice),
    locationOpenError: tx("messenger.chat.locationOpenError", CHAT_ROOM_FALLBACKS.locationOpenError),
    locationSendError: tx("messenger.chat.locationSendError", CHAT_ROOM_FALLBACKS.locationSendError),
    locationCoordsMissing: tx("messenger.chat.locationCoordsMissing", CHAT_ROOM_FALLBACKS.locationCoordsMissing),
    documentTitle: tx("messenger.chat.documentTitle", CHAT_ROOM_FALLBACKS.documentTitle),
    documentAttached: tx("messenger.chat.documentAttached", CHAT_ROOM_FALLBACKS.documentAttached),
    documentPreviewUnavailable: tx("messenger.chat.documentPreviewUnavailable", CHAT_ROOM_FALLBACKS.documentPreviewUnavailable),
    documentOpenNotice: tx("messenger.chat.documentOpenNotice", CHAT_ROOM_FALLBACKS.documentOpenNotice),
    documentOpening: tx("messenger.chat.documentOpening", CHAT_ROOM_FALLBACKS.documentOpening),
    documentOpenError: tx("messenger.chat.documentOpenError", CHAT_ROOM_FALLBACKS.documentOpenError),
    documentAccessError: tx("messenger.chat.documentAccessError", CHAT_ROOM_FALLBACKS.documentAccessError),
    galleryTitle: tx("messenger.chat.galleryTitle", CHAT_ROOM_FALLBACKS.galleryTitle),
    galleryAccessError: tx("messenger.chat.galleryAccessError", CHAT_ROOM_FALLBACKS.galleryAccessError),
    documentsTitle: tx("messenger.chat.documentsTitle", CHAT_ROOM_FALLBACKS.documentsTitle),
    contactsTitle: tx("messenger.chat.contactsTitle", CHAT_ROOM_FALLBACKS.contactsTitle),
    contactTitle: tx("messenger.chat.contactTitle", CHAT_ROOM_FALLBACKS.contactTitle),
    contactCard: tx("messenger.chat.contactCard", CHAT_ROOM_FALLBACKS.contactCard),
    contactAttached: tx("messenger.chat.contactAttached", CHAT_ROOM_FALLBACKS.contactAttached),
    contactReady: tx("messenger.chat.contactReady", CHAT_ROOM_FALLBACKS.contactReady),
    contactOpenNotice: tx("messenger.chat.contactOpenNotice", CHAT_ROOM_FALLBACKS.contactOpenNotice),
    contactOpenError: tx("messenger.chat.contactOpenError", CHAT_ROOM_FALLBACKS.contactOpenError),
    contactsAccessError: tx("messenger.chat.contactsAccessError", CHAT_ROOM_FALLBACKS.contactsAccessError),
    cancel: tx("common.cancel", CHAT_ROOM_FALLBACKS.cancel),
    contactChooseSource: tx("messenger.chat.contactChooseSource", CHAT_ROOM_FALLBACKS.contactChooseSource),
    phoneContactsTitle: tx("messenger.chat.phoneContactsTitle", CHAT_ROOM_FALLBACKS.phoneContactsTitle),
    phoneContactsSubtitle: tx("messenger.chat.phoneContactsSubtitle", CHAT_ROOM_FALLBACKS.phoneContactsSubtitle),
    sabiContactsTitle: tx("messenger.chat.sabiContactsTitle", CHAT_ROOM_FALLBACKS.sabiContactsTitle),
    sabiContactsSubtitle: tx("messenger.chat.sabiContactsSubtitle", CHAT_ROOM_FALLBACKS.sabiContactsSubtitle),
    openContactInPhone: tx("messenger.chat.openContactInPhone", CHAT_ROOM_FALLBACKS.openContactInPhone),
    openContactInMessenger: tx("messenger.chat.openContactInMessenger", CHAT_ROOM_FALLBACKS.openContactInMessenger),
    addContactTitle: tx("messenger.chat.addContactTitle", CHAT_ROOM_FALLBACKS.addContactTitle),
    addContactSubtitle: tx("messenger.chat.addContactSubtitle", CHAT_ROOM_FALLBACKS.addContactSubtitle),
    addContactName: tx("messenger.chat.addContactName", CHAT_ROOM_FALLBACKS.addContactName),
    addContactPhone: tx("messenger.chat.addContactPhone", CHAT_ROOM_FALLBACKS.addContactPhone),
    addContactUsername: tx("messenger.chat.addContactUsername", CHAT_ROOM_FALLBACKS.addContactUsername),
    addContactNamePlaceholder: tx("messenger.chat.addContactNamePlaceholder", CHAT_ROOM_FALLBACKS.addContactNamePlaceholder),
    addContactPhonePlaceholder: tx("messenger.chat.addContactPhonePlaceholder", CHAT_ROOM_FALLBACKS.addContactPhonePlaceholder),
    addContactUsernamePlaceholder: tx("messenger.chat.addContactUsernamePlaceholder", CHAT_ROOM_FALLBACKS.addContactUsernamePlaceholder),
    addContactSave: tx("messenger.chat.addContactSave", CHAT_ROOM_FALLBACKS.addContactSave),
    contactNameRequired: tx("messenger.chat.contactNameRequired", CHAT_ROOM_FALLBACKS.contactNameRequired),
    contactSavedInMessenger: tx("messenger.chat.contactSavedInMessenger", CHAT_ROOM_FALLBACKS.contactSavedInMessenger),
    contactSavedInContacts: tx("messenger.chat.contactSavedInContacts", CHAT_ROOM_FALLBACKS.contactSavedInContacts),
    giftSent: tx("messenger.chat.giftSent", CHAT_ROOM_FALLBACKS.giftSent),
    animatedReactionSent: tx("messenger.chat.animatedReactionSent", CHAT_ROOM_FALLBACKS.animatedReactionSent),
    animatedEmojiSent: tx("messenger.chat.animatedEmojiSent", CHAT_ROOM_FALLBACKS.animatedEmojiSent),
    stickerAdded: tx("messenger.chat.stickerAdded", CHAT_ROOM_FALLBACKS.stickerAdded),
    selectionDelete: tx("messenger.chat.selectionDelete", CHAT_ROOM_FALLBACKS.selectionDelete),
    selectionForward: tx("messenger.chat.selectionForward", CHAT_ROOM_FALLBACKS.selectionForward),
    selectedForForwardPrefix: tx("messenger.chat.selectedForForwardPrefix", CHAT_ROOM_FALLBACKS.selectedForForwardPrefix),
    chooseMessagesForward: tx("messenger.chat.chooseMessagesForward", CHAT_ROOM_FALLBACKS.chooseMessagesForward),
    deletedPrefix: tx("messenger.chat.deletedPrefix", CHAT_ROOM_FALLBACKS.deletedPrefix),
    deletedForAll: tx("messenger.chat.deletedForAll", CHAT_ROOM_FALLBACKS.deletedForAll),
    deletedForMe: tx("messenger.chat.deletedForMe", CHAT_ROOM_FALLBACKS.deletedForMe),
    copiedText: tx("messenger.chat.copiedText", CHAT_ROOM_FALLBACKS.copiedText),
    addedToComposer: tx("messenger.chat.addedToComposer", CHAT_ROOM_FALLBACKS.addedToComposer),
    saveMediaReady: tx("messenger.chat.saveMediaReady", CHAT_ROOM_FALLBACKS.saveMediaReady),
    openLinkReady: tx("messenger.chat.openLinkReady", CHAT_ROOM_FALLBACKS.openLinkReady),
    openingWalletFiat: tx("messenger.chat.openingWalletFiat", CHAT_ROOM_FALLBACKS.openingWalletFiat),
    openingCoinWallet: tx("messenger.chat.openingCoinWallet", CHAT_ROOM_FALLBACKS.openingCoinWallet),
    catalogSoon: tx("messenger.chat.catalogSoon", CHAT_ROOM_FALLBACKS.catalogSoon),
    pollSoon: tx("messenger.chat.pollSoon", CHAT_ROOM_FALLBACKS.pollSoon),
    eventSoon: tx("messenger.chat.eventSoon", CHAT_ROOM_FALLBACKS.eventSoon),
    openingDocument: tx("messenger.chat.openingDocument", CHAT_ROOM_FALLBACKS.openingDocument),
    openingContact: tx("messenger.chat.openingContact", CHAT_ROOM_FALLBACKS.openingContact),
    imageNormal: tx("messenger.chat.normal", CHAT_ROOM_FALLBACKS.imageNormal),
    editedLabel: tx("messenger.chat.editedLabel", CHAT_ROOM_FALLBACKS.editedLabel),
    mapLabel: tx("messenger.chat.mapLabel", CHAT_ROOM_FALLBACKS.mapLabel),
    save: tx("messenger.chat.save", CHAT_ROOM_FALLBACKS.save),
    link: tx("messenger.chat.link", CHAT_ROOM_FALLBACKS.link),
    replyAction: tx("messenger.chat.replyAction", CHAT_ROOM_FALLBACKS.replyAction),
    deleteMe: tx("messenger.chat.deleteMe", CHAT_ROOM_FALLBACKS.deleteMe),
    deleteAllAction: tx("messenger.chat.deleteAllAction", CHAT_ROOM_FALLBACKS.deleteAllAction),
    mediaCaptureFailed: tx("messenger.chat.mediaCaptureFailed", CHAT_ROOM_FALLBACKS.mediaCaptureFailed),
    voiceReadyInline: tx("messenger.chat.voiceReadyInline", CHAT_ROOM_FALLBACKS.voiceReadyInline),
    locationAccessError: tx("messenger.chat.locationAccessError", CHAT_ROOM_FALLBACKS.locationAccessError),
    videoMessageText: tx("messenger.chat.videoMessageText", CHAT_ROOM_FALLBACKS.videoMessageText),
    tapSend: tx("messenger.chat.tapSend", CHAT_ROOM_FALLBACKS.tapSend),
    diamondsUnit: tx("messenger.chat.diamondsUnit", CHAT_ROOM_FALLBACKS.diamondsUnit),
    infoUsernameFallback: CHAT_ROOM_FALLBACKS.infoUsernameFallback,
    channelInfoAction: tx("messenger.chat.channelInfoAction", CHAT_ROOM_FALLBACKS.channelInfoAction),
    groupInfoAction: tx("messenger.chat.groupInfoAction", CHAT_ROOM_FALLBACKS.groupInfoAction),
    businessInfoAction: tx("messenger.chat.businessInfoAction", CHAT_ROOM_FALLBACKS.businessInfoAction),
    membersCount: tx("messenger.chat.membersCount", CHAT_ROOM_FALLBACKS.membersCount),
    subscribersCount: tx("messenger.chat.subscribersCount", CHAT_ROOM_FALLBACKS.subscribersCount),
    infoAction: tx("messenger.chat.infoAction", CHAT_ROOM_FALLBACKS.infoAction),
    mutedEnabled: tx("messenger.chat.mutedEnabled", CHAT_ROOM_FALLBACKS.mutedEnabled),
    mutedDisabled: tx("messenger.chat.mutedDisabled", CHAT_ROOM_FALLBACKS.mutedDisabled),
    searchFocused: tx("messenger.chat.searchFocused", CHAT_ROOM_FALLBACKS.searchFocused),
    aiReady: tx("messenger.chat.aiReady", CHAT_ROOM_FALLBACKS.aiReady),
    mediaSaved: tx("messenger.chat.mediaSaved", CHAT_ROOM_FALLBACKS.mediaSaved),
    mediaSavedToSabi: tx("messenger.chat.mediaSavedToSabi", CHAT_ROOM_FALLBACKS.mediaSavedToSabi),
    mediaSavedToPhone: tx("messenger.chat.mediaSavedToPhone", CHAT_ROOM_FALLBACKS.mediaSavedToPhone),
    saveMediaChooseTitle: tx("messenger.chat.saveMediaChooseTitle", CHAT_ROOM_FALLBACKS.saveMediaChooseTitle),
    saveToSabiApp: tx("messenger.chat.saveToSabiApp", CHAT_ROOM_FALLBACKS.saveToSabiApp),
    saveToPhone: tx("messenger.chat.saveToPhone", CHAT_ROOM_FALLBACKS.saveToPhone),
    contactSavedToDevice: tx("messenger.chat.contactSavedToDevice", CHAT_ROOM_FALLBACKS.contactSavedToDevice),
    contactPermissionDenied: tx("messenger.chat.contactPermissionDenied", CHAT_ROOM_FALLBACKS.contactPermissionDenied),
    contactUnavailable: tx("messenger.chat.contactUnavailable", CHAT_ROOM_FALLBACKS.contactUnavailable),
    addedToList: tx("messenger.chat.addedToList", CHAT_ROOM_FALLBACKS.addedToList),
    removedFromList: tx("messenger.chat.removedFromList", CHAT_ROOM_FALLBACKS.removedFromList),
    disappearingEnabled: tx("messenger.chat.disappearingEnabled", CHAT_ROOM_FALLBACKS.disappearingEnabled),
    disappearingDisabled: tx("messenger.chat.disappearingDisabled", CHAT_ROOM_FALLBACKS.disappearingDisabled),
    reportSent: tx("messenger.chat.reportSent", CHAT_ROOM_FALLBACKS.reportSent),
    chatCleared: tx("messenger.chat.chatCleared", CHAT_ROOM_FALLBACKS.chatCleared),
    conversationHidden: tx("messenger.chat.conversationHidden", CHAT_ROOM_FALLBACKS.conversationHidden),
    chatExported: tx("messenger.chat.chatExported", CHAT_ROOM_FALLBACKS.chatExported),
    homeShortcutPinned: tx("messenger.chat.homeShortcutPinned", CHAT_ROOM_FALLBACKS.homeShortcutPinned),
    homeShortcutUnsupported: tx("messenger.chat.homeShortcutUnsupported", CHAT_ROOM_FALLBACKS.homeShortcutUnsupported),
    groupAddMember: tx("sabiMessengerGroupMenu.groupAddMember", t("common.add")),
    groupInviteReady: tx("sabiMessengerGroupMenu.groupInviteReady", t("common.open")),
    groupInviteMissing: tx("sabiMessengerGroupMenu.groupInviteMissing", ""),
    groupShareReady: tx("sabiMessengerGroupMenu.groupShareReady", ""),
    channelAddedToChats: tx("sabiMessengerChannelMenu.channelAddedToChats", tx("messenger.chat.addedToList", "")),
    channelInviteMissing: tx("sabiMessengerChannelMenu.channelInviteMissing", tx("sabiMessengerGroupMenu.groupInviteMissing", "")),
    channelShareReady: tx("sabiMessengerChannelMenu.channelShareReady", tx("sabiMessengerGroupMenu.groupShareReady", "")),
    channelBotMissing: tx("sabiMessengerChannelMenu.channelBotMissing", ""),
    blockActionDone: tx("messenger.chat.blockActionDone", CHAT_ROOM_FALLBACKS.blockActionDone),
    unblockActionDone: tx("messenger.chat.unblockActionDone", CHAT_ROOM_FALLBACKS.unblockActionDone),
    fileBadgeGeneric: tx("messenger.chat.fileBadgeGeneric", CHAT_ROOM_FALLBACKS.fileBadgeGeneric),
  }),
  [tx],
);

const [roomSnapshotVersion, setRoomSnapshotVersion] = useState(0);
  const [draft, setDraft] = useState("");
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);
  const [localReactionByMessageId, setLocalReactionByMessageId] = useState<Record<string, string>>({});
  const [inlineTranslationsByMessageId, setInlineTranslationsByMessageId] = useState<Record<string, InlineMessageTranslationState>>({});
  const [translationLanguagePickerMessage, setTranslationLanguagePickerMessage] = useState<MessageItem | null>(null);
  const [preferredTranslationTargetLanguage, setPreferredTranslationTargetLanguage] = useState<AiTranslationLanguageCode>(() => normalizeMessengerInlineTranslationLanguage(language));
  const [topActionMode, setTopActionMode] = useState<"mine" | "other" | null>(null);
  const [reactionVisible, setReactionVisible] = useState(false);
  const [reactionAnchor, setReactionAnchor] = useState<ReactionAnchor | null>(null);
  const [overflowVisible, setOverflowVisible] = useState(false);
  const [stickerSheetVisible, setStickerSheetVisible] = useState(false);
  const [stickerTarget, setStickerTarget] = useState<"message" | "composer">("message");
  const [animatedHubVisible, setAnimatedHubVisible] = useState(false);
  const [animatedReactionVisible, setAnimatedReactionVisible] = useState(false);
  const [animatedEmojiVisible, setAnimatedEmojiVisible] = useState(false);
  const [animatedGiftVisible, setAnimatedGiftVisible] = useState(false);
  const [animatedPlaybackVisible, setAnimatedPlaybackVisible] = useState(false);
  const [animatedPlaybackPayload, setAnimatedPlaybackPayload] =
    useState<AnimatedPlaybackPayload | null>(null);
  const [activeInlineVideoId, setActiveInlineVideoId] = useState<string | null>(null);
  const [inlineVideoPlaying, setInlineVideoPlaying] = useState(false);
  const [centerVideoMessage, setCenterVideoMessage] = useState<MessageItem | null>(null);
  const [centerVideoPlaying, setCenterVideoPlaying] = useState(false);
  const [centerVideoLoadError, setCenterVideoLoadError] = useState<string | null>(null);
  const [fullscreenVideoMessage, setFullscreenVideoMessage] = useState<MessageItem | null>(null);
  const [fullscreenVideoPlaying, setFullscreenVideoPlaying] = useState(false);
  const [fullscreenVideoLoadError, setFullscreenVideoLoadError] = useState<string | null>(null);
  const [imagePreviewUri, setImagePreviewUri] = useState<string | null>(null);
  const [imagePreviewTitle, setImagePreviewTitle] = useState(texts.photoTitle);
  const [imagePreviewSubtitle, setImagePreviewSubtitle] = useState(texts.photoPreviewSubtitle);
  const [photoCaptureVisible, setPhotoCaptureVisible] = useState(false);
  const [videoCaptureVisible, setVideoCaptureVisible] = useState(false);
  const [videoCaptureSessionKey, setVideoCaptureSessionKey] = useState(0);
  const [linkSheetVisible, setLinkSheetVisible] = useState(false);
  const [saveSheetVisible, setSaveSheetVisible] = useState(false);
  const [attachmentSheetVisible, setAttachmentSheetVisible] = useState(false);
  const [documentSheetVisible, setDocumentSheetVisible] = useState(false);
  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [contactSheetVisible, setContactSheetVisible] = useState(false);
  const [contactSheetMode, setContactSheetMode] = useState<"source" | "phone" | "sabi">("source");
  const [contactSheetOptions, setContactSheetOptions] = useState<ContactOption[]>([]);
  const [contactSheetLoading, setContactSheetLoading] = useState(false);
  const [composerPanel, setComposerPanel] = useState<ComposerPanel>(null);
  const [selectionMode, setSelectionMode] = useState<"delete" | "forward" | null>(null);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [forwardSources, setForwardSources] = useState<MessageItem[]>([]);
  const [replyTarget, setReplyTarget] = useState<MessageItem | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [messengerThemeState, setMessengerThemeState] = useState<MessengerThemeState>(() => getMessengerThemeState());
  const [notice, setNotice] = useState<string | null>(null);
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [bubbleLayouts, setBubbleLayouts] = useState<Record<string, ReactionAnchor>>({});
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [pendingVoiceMessage, setPendingVoiceMessage] = useState<VoiceMessageResult | null>(null);
  const [isSendingPendingVoice, setIsSendingPendingVoice] = useState(false);
  const [audioPlayingMessageId, setAudioPlayingMessageId] = useState<string | null>(null);
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const [audioPositionMs, setAudioPositionMs] = useState(0);
  const [audioDurationMs, setAudioDurationMs] = useState(0);
  const [audioRate, setAudioRate] = useState(1);
  const [inputFocused, setInputFocused] = useState(false);
  const [roomMuted, setRoomMuted] = useState(() => getRoomSettingsState(chatId, meta.name).notifications.muted);
  const [settingsVersion, setSettingsVersion] = useState(0);
  const [addContactVisible, setAddContactVisible] = useState(false);
  const [addContactSaving, setAddContactSaving] = useState(false);
  const [addContactName, setAddContactName] = useState("");
  const [addContactPhone, setAddContactPhone] = useState("");
  const [addContactUsername, setAddContactUsername] = useState("");

  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const lastVisibleMessageSignatureRef = useRef<string | null>(null);
  const lastLatestMessageIdRef = useRef<string | null>(null);
  const shouldAutoScrollOnContentSizeRef = useRef(false);
  const initialScrollToLatestDoneRef = useRef(false);
  const initialScrollToLatestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserNearLatestRef = useRef(true);
  const scrollMetricsRef = useRef({ contentHeight: 0, layoutHeight: 0, offsetY: 0 });
  const bubbleRefs = useRef<Record<string, any>>({});
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const isStartingVoiceRef = useRef(false);
  const isStoppingVoiceRef = useRef(false);
  const typingStartedRef = useRef(false);
  const deliveredMessageIdsRef = useRef<Set<string>>(new Set());
  const readMessageIdsRef = useRef<Set<string>>(new Set());
  const roomGraphSignatureRef = useRef<string>("");
  const roomSnapshotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const callButtonPulse = useRef(new RNAnimated.Value(0)).current;
  const videoButtonPulse = useRef(new RNAnimated.Value(0)).current;
  const sendButtonPulse = useRef(new RNAnimated.Value(0)).current;

  const messengerThemePalette = useMemo<MessengerThemePalette>(
    () => getMessengerThemePalette(messengerThemeState.themeId),
    [messengerThemeState.themeId],
  );

  const backgroundPreset = useMemo(
    () => buildPresetFromMessengerTheme(messengerThemeState, messengerThemePalette),
    [messengerThemePalette, messengerThemeState],
  );

  const roomSettingsState = useMemo(
    () => getRoomSettingsState(chatId, meta.name),
    [chatId, meta.name, settingsVersion]
  );

  useEffect(() => {
    setRoomMuted(roomSettingsState.notifications.muted);
  }, [roomSettingsState.notifications.muted]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void hydrateMessengerThemeState().then((next) => {
        if (active) {
          setMessengerThemeState(next);
        }
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const effectiveKeyboardHeight =
    keyboardHeight > 0
      ? Platform.OS === "ios"
        ? Math.max(0, keyboardHeight - insets.bottom)
        : keyboardHeight
      : 0;

  const composerBottom = effectiveKeyboardHeight > 0 ? effectiveKeyboardHeight + 6 : 2;
  const composerFieldHeight =
    draft.trim().length > 0 || inputHeight > MIN_INPUT_HEIGHT
      ? Math.max(36, inputHeight + 8)
      : 34;
  const composerFieldPaddingVertical = inputHeight > MIN_INPUT_HEIGHT ? 3 : 0;
  const listBottomPadding =
    COMPOSER_BASE_HEIGHT + composerBottom + (composerPanel ? 56 : 16);

  const [resolvedDirectChatId, setResolvedDirectChatId] = useState<string | null>(null);

  const [authRuntimeUserId, setAuthRuntimeUserId] = useState(() => readAuthRuntimeUserId());

  useEffect(() => {
    const nextUserId = readAuthRuntimeUserId();
    if (!nextUserId) return;

    setAuthRuntimeUserId((current) =>
      current === nextUserId ? current : nextUserId,
    );
  }, [routeUserId]);

  useFocusEffect(
    useCallback(() => {
      const nextUserId = readAuthRuntimeUserId();
      if (!nextUserId) return;

      setAuthRuntimeUserId((current) =>
        current === nextUserId ? current : nextUserId,
      );
    }, []),
  );

  const transportUserId = authRuntimeUserId || routeUserId || "";
  const transportChatId = resolvedDirectChatId || routeChatId;

  const groupInviteLink = useMemo(
    () => (roomType === "group" ? getGroupInviteLink(routeChatId || chatId) : ""),
    [chatId, roomType, routeChatId, publicProfileRevision],
  );

  const channelInviteLink = useMemo(
    () =>
      roomType === "channel"
        ? String(
            params.channelInviteLink ||
              params.inviteLink ||
              "",
          ).trim()
        : "",
    [params.channelInviteLink, params.inviteLink, roomType],
  );

  const channelShareLink = useMemo(() => {
    if (roomType !== "channel") return "";
    if (channelInviteLink) return channelInviteLink;

    const id = routeChatId || chatId;
    return id ? `sabi://channel/${encodeURIComponent(id)}` : "";
  }, [channelInviteLink, chatId, roomType, routeChatId]);

  const [sabiChannelLinkedBot, setSabiChannelLinkedBot] = useState<{ id: string; handle: string } | null>(null);

  useEffect(() => {
    if (roomType !== "channel") {
      setSabiChannelLinkedBot(null);
      return;
    }

    let cancelled = false;

    void findSabiChannelLinkedBotFromLocalProfile({
      chatId,
      routeChatId,
      routeHandle,
      routeName,
    }).then((bot) => {
      if (!cancelled) setSabiChannelLinkedBot(bot);
    });

    return () => {
      cancelled = true;
    };
  }, [chatId, roomType, routeChatId, routeHandle, routeName, settingsVersion]);

  const channelLinkedBotId = routeChannelBotId || sabiChannelLinkedBot?.id || "";
  const channelLinkedBotHandle = routeChannelBotHandle || sabiChannelLinkedBot?.handle || "";

  const canCurrentUserInviteToGroup = useMemo(
    () =>
      roomType === "group"
        ? canInviteToGroup(routeChatId || chatId, transportUserId || routeUserId)
        : false,
    [chatId, roomType, routeChatId, routeUserId, transportUserId, settingsVersion],
  );

  useEffect(() => {
    initialScrollToLatestDoneRef.current = false;
    shouldAutoScrollOnContentSizeRef.current = false;
    if (initialScrollToLatestTimerRef.current) {
      clearTimeout(initialScrollToLatestTimerRef.current);
      initialScrollToLatestTimerRef.current = null;
    }
  }, [transportChatId]);

  useEffect(() => {
    if (roomType !== "direct") return;

    const identifiers = [
      activePeerId,
      routePeerId,
      routeChatId,
      routePhone,
      routeHandle,
    ]
      .map((value) => String(value || "").trim())
      .filter(Boolean);

    const uniqueIdentifiers = Array.from(new Set(identifiers));
    if (!uniqueIdentifiers.length) return;

    const fetchKey = `${transportUserId}|${uniqueIdentifiers.join("|")}`;
    if (lastPublicProfileFetchKeyRef.current === fetchKey) return;
    lastPublicProfileFetchKeyRef.current = fetchKey;

    let active = true;

    void (async () => {
      const auth = getAuthSessionState();

      for (const identifier of uniqueIdentifiers) {
        try {
          const surface = await fetchUserPublicProfileSurface(identifier, {
            apiBaseUrl: auth.apiBaseUrl,
            accessToken: auth.accessToken,
            currentUserId: auth.currentUserId || transportUserId,
            timeoutMs: 18000,
          });

          if (!active) return;

          const aliases = Array.from(
            new Set([
              identifier,
              surface.chatId,
              surface.userId,
              surface.username,
              surface.publicUsername,
              surface.phone,
              ...((surface.aliases || []) as string[]),
            ].map((value) => String(value || "").trim()).filter(Boolean)),
          );

          const key = surface.chatId || surface.userId || identifier;
          savePublicProfile(key, surface as any, aliases);
          aliases.forEach((alias) => {
            if (alias && alias !== key) {
              savePublicProfile(alias, surface as any, aliases);
            }
          });

          if (surface.userId) {
            setActivePeerId((current) => (current && current.trim() ? current : String(surface.userId || "")));
          }
          setPublicProfileRevision((value) => value + 1);
          return;
        } catch {
          // Try the next identifier. Public profile must never block chat rendering.
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [activePeerId, roomType, routeChatId, routeHandle, routePeerId, routePhone, transportUserId]);
  const realtimeEnabled = Boolean(transportChatId && transportUserId);
  const connectionState = useChatRoomMessengerRealtimeStatus();
  const connectionIsConnecting =
    connectionState === "idle" || connectionState === "disconnected";

  useEffect(() => {
    let active = true;

    if (roomType !== "direct" || !routeChatId || !transportUserId) {
      setResolvedDirectChatId(null);
      return () => {
        active = false;
      };
    }

    const peerPhone = routePhone || "";
    const peerUsername = normalizeMessengerUsername(routeHandle || "");
    const rawPeerUserId = activePeerId || routePeerId || "";
    const peerUserId = rawPeerUserId || (!peerPhone && !peerUsername ? routeChatId : "");

    if (!peerUserId && !peerPhone && !peerUsername) {
      setResolvedDirectChatId(null);
      return () => {
        active = false;
      };
    }

    void ensureMessengerDirectRoom({
      currentUserId: transportUserId,
      peerUserId: peerUserId || null,
      displayName: meta.name,
      username: peerUsername || null,
      phone: peerPhone || null,
      avatarUrl: headerAvatarUri || null,
    })
      .then((room) => {
        if (!active) return;
        const nextChatId = typeof room?.chatId === "string" && room.chatId.trim()
          ? room.chatId.trim()
          : null;
        setResolvedDirectChatId((current) => (current === nextChatId ? current : nextChatId));
        if (room?.peerUserId) {
          setActivePeerId((current) => (current && current.trim() ? current : room.peerUserId || ""));
        }
      })
      .catch(() => {
        if (active) setResolvedDirectChatId(null);
      });

    return () => {
      active = false;
    };
  }, [
    activePeerId,
    headerAvatarUri,
    meta.name,
    roomType,
    routeChatId,
    routeHandle,
    routePeerId,
    routePhone,
    transportUserId,
  ]);

  useEffect(() => {
    if (!transportChatId || !meta.name) return;

    const roomSnapshot = {
      chatId: transportChatId,
      name: meta.name,
      subtitle: routeSubtitleText || routeHandle || routePhone || undefined,
      roomType,
      verified: Boolean(meta.verified),
      avatarLetter: resolveAvatarLetter(meta),
      phone: routePhone || undefined,
      username: normalizeMessengerUsername(routeHandle) || undefined,
      currentUserId: transportUserId || routeUserId || undefined,
      peerUserId: activePeerId || routePeerId || undefined,
      avatarUrl: headerAvatarUri || undefined,
      photoUrl: headerAvatarUri || undefined,
      hiddenFromMain: routeHiddenFromMain,
      deleted: false,
      forceVisibleInMain: routeForceVisibleInMain,
    };

    void registerPersistedChatRoom(roomSnapshot).catch(() => undefined);
    void ensureMessengerKernelRoomSnapshot(roomSnapshot).catch(() => undefined);
  }, [
    activePeerId,
    headerAvatarUri,
    meta.avatarLetter,
    meta.name,
    meta.verified,
    roomType,
    routeHandle,
    routeHiddenFromMain,
    routePeerId,
    routePhone,
    routeForceVisibleInMain,
    routeSubtitleText,
    routeUserId,
    transportChatId,
    transportUserId,
  ]);

  const matchesPeer = useCallback(
    (userId?: string | null) => {
      const value = String(userId ?? "").trim();
      if (!value || value === transportUserId) return false;
      if (roomType !== "direct") return true;
      return true;
    },
    [roomType, transportUserId],
  );

  const rememberPeer = useCallback(
    (userId?: string | null) => {
      const value = String(userId ?? "").trim();
      if (!value || value === transportUserId) return;
      setActivePeerId((current) => (current === value ? current : value));
    },
    [transportUserId],
  );

  useEffect(() => {
    if (!routePeerId) return;
    setActivePeerId((current) => (current && current.trim().length ? current : routePeerId));
  }, [routePeerId]);

  useEffect(() => {
    if (!transportChatId || !transportUserId) {
      return;
    }

    let active = true;
    roomGraphSignatureRef.current = "";

    const buildRoomGraphSignature = () => {
      const roomMessages = getMessengerKernelRoomMessages(transportChatId);
      const roomParticipants = getMessengerKernelRoomParticipants(transportChatId);
      const messageSignature = roomMessages
        .map((item: any) =>
          [
            item?.id,
            item?.chatId ?? item?.roomId,
            item?.updatedAt ?? item?.editedAt ?? item?.readAt ?? item?.deliveredAt ?? item?.deletedAt ?? item?.createdAt,
          ]
            .filter(Boolean)
            .join(":"),
        )
        .join("|");
      const participantSignature = roomParticipants
        .map((item: any) =>
          [
            item?.id,
            item?.userId ?? item?.participantUserId,
            item?.updatedAt ?? item?.state ?? item?.role,
          ]
            .filter(Boolean)
            .join(":"),
        )
        .join("|");

      return `${transportChatId}::m:${roomMessages.length}:${messageSignature}::p:${roomParticipants.length}:${participantSignature}`;
    };

    const bump = (force = false) => {
      if (!active) return;
      const nextSignature = buildRoomGraphSignature();
      if (!force && roomGraphSignatureRef.current === nextSignature) return;
      roomGraphSignatureRef.current = nextSignature;

      if (roomSnapshotTimerRef.current) return;
      roomSnapshotTimerRef.current = setTimeout(() => {
        roomSnapshotTimerRef.current = null;
        if (!active) return;
        setRoomSnapshotVersion((current) => current + 1);
      }, 0);
    };

    void hydrateMessengerKernelRoomGraph(transportChatId, {
      currentUserId: transportUserId || null,
      messageLimit: 150,
      participantLimit: 60,
    })
      .then(() => {
        bump(true);
      })
      .catch(() => undefined);

    const unsubscribe = subscribeMessengerKernelRoom(
      transportChatId,
      {
        onSnapshot: () => {
          bump();
        },
      },
      {
        currentUserId: transportUserId || null,
      },
    );

    return () => {
      active = false;
      if (roomSnapshotTimerRef.current) {
        clearTimeout(roomSnapshotTimerRef.current);
        roomSnapshotTimerRef.current = null;
      }
      unsubscribe?.();
    };
  }, [transportChatId, transportUserId]);

  const [chatClearAtMs, setChatClearAtMs] = useState(0);

  useEffect(() => {
    let active = true;

    if (!transportChatId) {
      setChatClearAtMs(0);
      return () => {
        active = false;
      };
    }

    void hydratePersistedChatClearAt(transportChatId, transportUserId).then((value) => {
      if (active) setChatClearAtMs(Number(value) || 0);
    });

    return () => {
      active = false;
    };
  }, [transportChatId, transportUserId]);

  const [chatClearedMessageIds, setChatClearedMessageIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    if (!transportChatId) {
      setChatClearedMessageIds([]);
      return () => { active = false; };
    }

    void hydratePersistedChatHiddenMessageIds(transportChatId, transportUserId).then((ids) => {
      if (active) setChatClearedMessageIds(ids);
    });

    return () => { active = false; };
  }, [transportChatId, transportUserId]);

  const chatClearedMessageIdsSet = useMemo(
    () => new Set(chatClearedMessageIds.map((item) => String(item || '').trim()).filter(Boolean)),
    [chatClearedMessageIds],
  );

  const kernelRoomMessages = useMemo(
    () => (transportChatId ? getMessengerKernelRoomMessages(transportChatId) : []),
    [transportChatId, roomSnapshotVersion],
  );

  const kernelRoomParticipants = useMemo(
    () => (transportChatId ? getMessengerKernelRoomParticipants(transportChatId) : []),
    [transportChatId, roomSnapshotVersion],
  );

  const messages = useMemo(() => {
    const normalizedMessages = kernelRoomMessages
      .map((item) => normalizeKernelRoomMessage(item, transportChatId))
      .filter((item): item is RealtimeIncomingMessage => Boolean(item))
      .filter((item) => !item.deletedAt && !item.isDeleted)
      .filter((item) => !chatClearedMessageIdsSet.has(String(item.id || "")))
      .filter((item) => {
        if (!chatClearAtMs) return true;
        return getMessageCreatedAtMs(item.createdAt) > chatClearAtMs;
      });

    const reactionByMessageId = new Map<string, string>();
    for (const rawMessage of normalizedMessages) {
      const reactionControl = parseSabiReactionControl(rawMessage.content);
      if (reactionControl?.messageId && reactionControl.reaction) {
        reactionByMessageId.set(reactionControl.messageId, reactionControl.reaction);
      }
    }

    const visibleSourceMessages = normalizedMessages
      .map((raw, sourceIndex) => ({ raw, sourceIndex }))
      .filter(({ raw }) => !isSabiHiddenControlMessage(raw.content));

    const stableVisibleMessages = [...visibleSourceMessages].sort((left, right) => {
      const leftCreatedAt = getMessageCreatedAtMs(left.raw.createdAt);
      const rightCreatedAt = getMessageCreatedAtMs(right.raw.createdAt);

      if (Number.isFinite(leftCreatedAt) && Number.isFinite(rightCreatedAt)) {
        if (leftCreatedAt !== rightCreatedAt) {
          return leftCreatedAt - rightCreatedAt;
        }
      } else if (Number.isFinite(leftCreatedAt)) {
        return -1;
      } else if (Number.isFinite(rightCreatedAt)) {
        return 1;
      }

      return left.sourceIndex - right.sourceIndex;
    });

    const mappedPairs = stableVisibleMessages
      .map(({ raw }) => ({
        raw,
        item: mapRealtimeMessageToItem(raw, transportUserId, {
          locationTitle: texts.locationTitle,
          sharedLocation: texts.sharedLocation,
          documentTitle: texts.documentTitle,
          contactTitle: texts.contactTitle,
          photoTitle: texts.photoTitle,
          videoTitle: texts.videoTitle,
          voiceTitle: texts.voiceTitle,
        }),
      }))
      .filter((pair): pair is { raw: RealtimeIncomingMessage; item: MessageItem } => Boolean(pair.item));

    const mappedMessages = mappedPairs.map((pair) => pair.item);
    const byId = new Map(mappedMessages.map((item) => [item.id, item]));

    return mappedPairs.map(({ item, raw }) => {
      const replyToMessageId = raw?.replyToMessageId ?? null;
      const replySource = replyToMessageId ? byId.get(replyToMessageId) : null;
      const reaction = localReactionByMessageId[item.id] ?? reactionByMessageId.get(item.id) ?? item.reaction;
      const baseItem = reaction ? { ...item, reaction } : item;

      return replySource
        ? {
            ...baseItem,
            replyTo: buildReplyRef(replySource, meta.name, texts.you),
          }
        : baseItem;
    });
  }, [
    kernelRoomMessages,
    localReactionByMessageId,
    meta.name,
    texts.contactTitle,
    texts.documentTitle,
    texts.locationTitle,
    texts.photoTitle,
    texts.sharedLocation,
    texts.videoTitle,
    texts.voiceTitle,
    texts.you,
    transportChatId,
    transportUserId,
  ]);

  const visibleMessageSignature = useMemo(
    () => buildVisibleMessageOrderSignature(messages),
    [messages],
  );

  useEffect(() => {
    if (!transportUserId) return;

    for (const participant of kernelRoomParticipants) {
      const participantUserId = resolveKernelParticipantUserId(participant);
      if (participantUserId && participantUserId !== transportUserId) {
        rememberPeer(participantUserId);
        return;
      }
    }

    for (const entry of kernelRoomMessages) {
      const normalizedMessage = normalizeKernelRoomMessage(entry, transportChatId);
      if (normalizedMessage?.userId && normalizedMessage.userId !== transportUserId) {
        rememberPeer(normalizedMessage.userId);
        return;
      }
    }

  }, [
    kernelRoomMessages,
    kernelRoomParticipants,
    rememberPeer,
    transportChatId,
    transportUserId,
  ]);

  const presencePeerId = useMemo(() => {
    const candidatePool = [
      activePeerId,
      routePeerId,
      ...kernelRoomParticipants.map((participant) => resolveKernelParticipantUserId(participant)),
      ...kernelRoomMessages.map((entry) => normalizeKernelRoomMessage(entry, transportChatId)?.userId ?? ""),
    ]
      .map((value) => String(value ?? "").trim())
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index)
      .filter((value) => value !== transportUserId);

    if (!candidatePool.length) {
      return "";
    }

    return candidatePool[0] ?? "";
  }, [
    activePeerId,
    routePeerId,
    kernelRoomParticipants,
    kernelRoomMessages,
    transportChatId,
    transportUserId,
  ]);

  useEffect(() => {
    if (!transportChatId || !transportUserId || isBotRoom || !roomCapabilities.showPresence) {
      return undefined;
    }

    const emitPresenceHandshake = () => {
      emitMessengerKernelRoomPresenceHandshake({
        chatId: transportChatId,
        userId: transportUserId,
        peerUserId: presencePeerId || routePeerId || activePeerId || null,
      });
    };

    emitPresenceHandshake();

    const heartbeat = setInterval(emitPresenceHandshake, 25000);

    return () => {
      clearInterval(heartbeat);
    };
  }, [
    activePeerId,
    isBotRoom,
    presencePeerId,
    roomCapabilities.showPresence,
    routePeerId,
    transportChatId,
    transportUserId,
  ]);

  const peerPresenceEntry = useChatRoomMessengerPresence(presencePeerId);
  const typingState = useChatRoomMessengerTyping(transportChatId);
  const peerTyping = useMemo(
    () => (typingState?.userIds ?? []).some((userId: string) => matchesPeer(userId)),
    [matchesPeer, typingState?.userIds],
  );
  const isPeerOnline =
    peerPresenceEntry?.status === "online"
      ? true
      : peerPresenceEntry?.status === "offline"
        ? false
        : routePresenceOnline ?? false;
  const peerLastSeenAt = peerPresenceEntry?.lastSeenAt ?? routeLastSeenAt ?? null;

  const directPresenceSubtitle = useMemo(() => {
    if (peerTyping) return texts.typing;
    if (isPeerOnline) return texts.online;
    if (peerLastSeenAt) {
      return formatLastSeenText(peerLastSeenAt, language, {
        offline: texts.offline,
        lastSeenToday: texts.lastSeenToday,
        lastSeenYesterday: texts.lastSeenYesterday,
        lastSeenDate: texts.lastSeenDate,
      });
    }
    if (routeStatusText && !isRouteStatusOnlineText(routeStatusText)) return routeStatusText;
    if (connectionState === "reconnecting") return texts.reconnecting;
    if (connectionIsConnecting) return texts.connecting;
    return texts.offline;
  }, [connectionIsConnecting, connectionState, isPeerOnline, language, peerLastSeenAt, peerTyping, routeStatusText, texts.connecting, texts.lastSeenDate, texts.lastSeenToday, texts.lastSeenYesterday, texts.offline, texts.online, texts.reconnecting, texts.typing]);

  const botHeaderSubtitle = isBotRoom
    ? buildBotSubtitle({
        kind: routeBotKind,
        handle: routeBotHandle,
        assistantLabel: texts.botAssistantRoom,
        serviceLabel: texts.botServiceRoom,
        businessLabel: texts.botBusinessRoom,
      })
    : "";

  const headerSubtitleText = isBotRoom
    ? botHeaderSubtitle
    : roomCapabilities.showPresence
      ? directPresenceSubtitle
      : roomType === "channel"
        ? routeSubtitleText || meta.subtitle || texts.channelRoom
        : roomType === "group"
          ? routeSubtitleText || meta.subtitle || texts.groupRoom
          : roomType === "business"
            ? routeSubtitleText || meta.subtitle || texts.businessRoom
            : routeSubtitleText || meta.subtitle || texts.directRoom;

  const presenceDotColor =
    roomCapabilities.showPresence && !isBotRoom
      ? isPeerOnline
        ? backgroundPreset.accent
        : "rgba(232,255,246,0.34)"
      : backgroundPreset.accent;

  const renderRoomInfoIcon = (size = 18, color = "#F1FFF9") => {
    if (roomType === "group") {
      return <MessengerBrandIcon icon="messenger_contact" tone="default" size={size} color={color} />;
    }
    if (roomType === "channel") {
      return <MessengerBrandIcon icon="messenger_partner_profile" tone="default" size={size} color={color} />;
    }
    if (roomType === "business") {
      return <BriefcaseBusiness size={size} strokeWidth={2.3} color={color} />;
    }
    return <MessengerBrandIcon icon="messenger_video_call" tone="default" size={size} color={color} />;
  };

  const directPublicProfileSeed = useMemo(
    () => ({
      avatarUri: headerAvatarUri || "",
      publicationPhotos:
        Array.isArray(resolvedDirectPublicProfile?.publicationPhotos) &&
        resolvedDirectPublicProfile.publicationPhotos.length
          ? resolvedDirectPublicProfile.publicationPhotos.map((item) => ({
              id: item.id,
              uri: item.uri,
              thumbnailUri: item.thumbnailUri,
              mediaUri: item.mediaUri,
              mimeType: item.mimeType,
              kind: "photo" as const,
              views: typeof item.views === "number" ? item.views : 0,
              duration: item.duration,
              liked: Boolean(item.liked),
            }))
          : parseSharedPublicMediaItems(routePublicPhotosParam)
              .map((item, index) => ({
                id:
                  typeof item?.id === "string" && item.id.trim()
                    ? item.id
                    : `photo_${index}_${Date.now()}`,
                uri: typeof item?.uri === "string" ? item.uri : "",
                kind: "photo" as const,
                views: typeof item?.views === "number" ? item.views : 0,
                duration: typeof item?.duration === "string" ? item.duration : undefined,
                liked: typeof item?.liked === "boolean" ? item.liked : false,
              }))
              .filter((item) => item.uri),
      publicationVideos:
        Array.isArray(resolvedDirectPublicProfile?.publicationVideos) &&
        resolvedDirectPublicProfile.publicationVideos.length
          ? resolvedDirectPublicProfile.publicationVideos.map((item) => ({
              id: item.id,
              uri: item.uri,
              thumbnailUri: item.thumbnailUri,
              mediaUri: item.mediaUri,
              mimeType: item.mimeType,
              kind: "video" as const,
              views: typeof item.views === "number" ? item.views : 0,
              duration: item.duration,
              liked: Boolean(item.liked),
            }))
          : parseSharedPublicMediaItems(routePublicVideosParam)
              .map((item, index) => ({
                id:
                  typeof item?.id === "string" && item.id.trim()
                    ? item.id
                    : `video_${index}_${Date.now()}`,
                uri: typeof item?.uri === "string" ? item.uri : "",
                kind: "video" as const,
                views: typeof item?.views === "number" ? item.views : 0,
                duration: typeof item?.duration === "string" ? item.duration : undefined,
                liked: typeof item?.liked === "boolean" ? item.liked : false,
              }))
              .filter((item) => item.uri),
      publicGifts:
        Array.isArray(resolvedDirectPublicProfile?.publicGifts) && resolvedDirectPublicProfile.publicGifts.length
          ? resolvedDirectPublicProfile.publicGifts.map((item) => ({
              id: item.id,
              title: item.title,
              emoji: item.emoji,
              imageUri: item.imageUri,
            }))
          : parseSharedPublicGiftItems(routePublicGiftsParam)
              .map((item, index) => ({
                id:
                  typeof item?.id === "string" && item.id.trim()
                    ? item.id
                    : `gift_${index}_${Date.now()}`,
                title: typeof item?.title === "string" ? item.title : undefined,
                emoji: typeof item?.emoji === "string" ? item.emoji : undefined,
                imageUri: typeof item?.imageUri === "string" ? item.imageUri : undefined,
              }))
              .filter((item) => item.title || item.emoji || item.imageUri),
      likesCount:
        typeof resolvedDirectPublicProfile?.likesCount === "number"
          ? resolvedDirectPublicProfile.likesCount
          : Number.isFinite(Number(routeLikesCountParam))
            ? Number(routeLikesCountParam)
            : 0,
      publicGiftsCount:
        typeof resolvedDirectPublicProfile?.publicGiftsCount === "number"
          ? resolvedDirectPublicProfile.publicGiftsCount
          : Number.isFinite(Number(routePublicGiftsCountParam))
            ? Number(routePublicGiftsCountParam)
            : 0,
    }),
    [
      headerAvatarUri,
      resolvedDirectPublicProfile,
      routeLikesCountParam,
      routePublicGiftsCountParam,
      routePublicGiftsParam,
      routePublicPhotosParam,
      routePublicVideosParam,
    ],
  );

  const openChatPartnerInfo = (extraParams?: Record<string, string | undefined>) => {
    const fallbackHandle = buildPartnerHandle(meta.name, texts.infoUsernameFallback);
    const profileHandle = routeBotHandle || routeHandle || fallbackHandle;
    const partnerPhone = routePhone || normalizeContactPhone(getChatPhone(chatId, meta.name));
    const resolvedPartnerId = presencePeerId || undefined;
    const publicProfileKey = resolvedPartnerId || routeChatId;

    if (
      roomType !== "group" &&
      publicProfileKey &&
      hasMeaningfulDirectPublicProfile(directPublicProfileSeed)
    ) {
      savePublicProfile(publicProfileKey, directPublicProfileSeed);

      if (routeChatId && routeChatId !== publicProfileKey) {
        savePublicProfile(routeChatId, directPublicProfileSeed);
      }
    }

    router.push({
      pathname: "/chat-partner-info",
      params: {
        ...(extraParams || {}),
        id: chatId,
        chatId: routeChatId,
        userId: transportUserId || undefined,
        selfId: transportUserId || undefined,
        peerId: resolvedPartnerId,
        partnerId: resolvedPartnerId,
        targetUserId: resolvedPartnerId,
        roomType,
        name: meta.name,
        handle: profileHandle,
        phone: partnerPhone || undefined,
        subtitle: headerSubtitleText,
        avatarLetter: resolveAvatarLetter(meta),
        avatarUrl: headerAvatarUri || undefined,
        photoUrl: headerAvatarUri || undefined,
        publicPhotos: infoPublicPhotosParam,
        publicVideos: infoPublicVideosParam,
        publicGifts: infoPublicGiftsParam,
        likesCount: infoLikesCountParam,
        publicGiftsCount: infoPublicGiftsCountParam,
        verified: meta.verified ? "1" : "0",
        status: headerSubtitleText,
        presenceOnline: isPeerOnline ? "1" : "0",
        lastSeenAt: peerLastSeenAt || undefined,
        isBot: isBotRoom ? "1" : "0",
        botId: routeBotId,
        botHandle: profileHandle,
        botKind: routeBotKind,
      },
    });
  };

  const callButtonAnimatedStyle = {
    transform: [
      {
        scale: callButtonPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.035],
        }),
      },
    ],
    shadowOpacity: callButtonPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.14, 0.24],
    }),
  } as const;

  const videoButtonAnimatedStyle = {
    transform: [
      {
        scale: videoButtonPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.042],
        }),
      },
    ],
    shadowOpacity: videoButtonPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.16, 0.28],
    }),
  } as const;

  const sendButtonAnimatedStyle = {
    transform: [
      {
        scale: sendButtonPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.045],
        }),
      },
    ],
    shadowOpacity: sendButtonPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.18, 0.32],
    }),
  } as const;

  useEffect(() => {
    if (!imagePreviewUri) {
      setImagePreviewTitle(texts.photoTitle);
      setImagePreviewSubtitle(texts.photoPreviewSubtitle);
    }
  }, [
    texts.photoTitle,
    texts.photoPreviewSubtitle,
    imagePreviewUri,
  ]);

  const centerVideoUri = centerVideoMessage ? resolveMessageVideoPlaybackUri(centerVideoMessage) : null;
  const centerVideoTitle =
    centerVideoMessage?.previewTitle || centerVideoMessage?.text || texts.videoTitle;
  const centerVideoDuration =
    centerVideoMessage?.durationLabel || centerVideoMessage?.fileLabel || "00:00";

  const fullscreenVideoUri = fullscreenVideoMessage
    ? resolveMessageVideoPlaybackUri(fullscreenVideoMessage)
    : null;
  const fullscreenVideoTitle =
    fullscreenVideoMessage?.previewTitle || fullscreenVideoMessage?.fileLabel || texts.videoTitle;
  const fullscreenVideoMeta =
    fullscreenVideoMessage?.durationLabel || fullscreenVideoMessage?.fileLabel || fullscreenVideoMessage?.previewSubtitle || "";

const directCallPeerId = activePeerId || routePeerId || presencePeerId || undefined;
const directCallPhone = routePhone || normalizeContactPhone(getChatPhone(chatId, meta.name)) || undefined;
const directCallHandle = routeBotHandle || routeHandle || buildPartnerHandle(meta.name, texts.infoUsernameFallback);

const directVideoCallRouteParams = {
  id: chatId,
  chatId: routeChatId,
  userId: transportUserId || undefined,
  selfId: transportUserId || undefined,
  peerId: directCallPeerId,
  peerUserId: directCallPeerId,
  partnerId: directCallPeerId,
  targetUserId: directCallPeerId,
  roomType,
  kind: "video",
  type: "video",
  callKind: "video",
  callType: "video",
  name: meta.name,
  handle: directCallHandle,
  phone: directCallPhone,
  avatarLetter: resolveAvatarLetter(meta),
  avatarUrl: headerAvatarUri || undefined,
  photoUrl: headerAvatarUri || undefined,
  verified: meta.verified ? "1" : "0",
  status: isPeerOnline ? texts.online : headerSubtitleText,
  subtitle: headerSubtitleText,
};

const secondaryHeaderAction = () => {
  if (roomType === "direct" && roomCapabilities.canVideoCall) {
    router.push({
      pathname: "/calls/video" as any,
      params: directVideoCallRouteParams,
    });
    return;
  }

  openChatPartnerInfo();
};


  const updateNearLatestFromMetrics = useCallback(() => {
    const metrics = scrollMetricsRef.current;
    const remaining = metrics.contentHeight - (metrics.offsetY + metrics.layoutHeight);
    isUserNearLatestRef.current = remaining <= 140;
    return isUserNearLatestRef.current;
  }, []);

  const scrollToLatest = useCallback((_animated = true) => {
    // Hard-lock reader position. ChatRoom must never jump to the latest message from
    // media layout, quick reactions, keyboard events, or room hydration.
  }, []);

  const requestScrollToLatest = useCallback((_animated = true) => {
    shouldAutoScrollOnContentSizeRef.current = false;
  }, []);

  const scrollToLatestIfFollowing = useCallback((_animated = true) => {
    shouldAutoScrollOnContentSizeRef.current = false;
    updateNearLatestFromMetrics();
  }, [updateNearLatestFromMetrics]);

  const handleMessagesScroll = useCallback((event: any) => {
    const layoutHeight = Number(event?.nativeEvent?.layoutMeasurement?.height ?? 0);
    const contentHeight = Number(event?.nativeEvent?.contentSize?.height ?? 0);
    const offsetY = Number(event?.nativeEvent?.contentOffset?.y ?? 0);

    scrollMetricsRef.current = { contentHeight, layoutHeight, offsetY };
    const remaining = contentHeight - (offsetY + layoutHeight);
    isUserNearLatestRef.current = remaining <= 140;
  }, []);

  useEffect(() => {
    const buildSoftLoop = (value: RNAnimated.Value, delay = 0, peak = 1) =>
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.delay(delay),
          RNAnimated.timing(value, {
            toValue: peak,
            duration: 1350,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          RNAnimated.timing(value, {
            toValue: 0,
            duration: 1350,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );

    const callLoop = buildSoftLoop(callButtonPulse, 0, 1);
    const videoLoop = buildSoftLoop(videoButtonPulse, 220, 1);
    const sendLoop = buildSoftLoop(sendButtonPulse, 120, 1);

    callLoop.start();
    videoLoop.start();
    sendLoop.start();

    return () => {
      callLoop.stop();
      videoLoop.stop();
      sendLoop.stop();
    };
  }, [callButtonPulse, videoButtonPulse, sendButtonPulse]);

  useEffect(() => {
    const onShow = (event: any) => {
      const height = event?.endCoordinates?.height ?? 0;
      setKeyboardHeight(height);
      // Do not auto-scroll on keyboard open. Keep reader position stable.
    };

    const onHide = () => {
      setKeyboardHeight(0);
      setInputHeight(MIN_INPUT_HEIGHT);
      setComposerPanel(null);
      // Do not auto-scroll on keyboard close. Keep reader position stable.
    };

    const showSub =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillShow", onShow)
        : Keyboard.addListener("keyboardDidShow", onShow);

    const hideSub =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillHide", onHide)
        : Keyboard.addListener("keyboardDidHide", onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
      if (roomSnapshotTimerRef.current) {
        clearTimeout(roomSnapshotTimerRef.current);
        roomSnapshotTimerRef.current = null;
      }
      if (initialScrollToLatestTimerRef.current) {
        clearTimeout(initialScrollToLatestTimerRef.current);
        initialScrollToLatestTimerRef.current = null;
      }
      if (soundRef.current) {
        void soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (typingStartedRef.current && realtimeEnabled) {
        emitMessengerKernelTyping({ chatId: transportChatId, isTyping: false, userId: transportUserId });
      }
      typingStartedRef.current = false;
      setInlineVideoPlaying(false);
      setActiveInlineVideoId(null);
      if (soundRef.current) {
        void soundRef.current.stopAsync().catch(() => {});
        void soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      if (recordingRef.current) {
        void recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
    };
  }, [realtimeEnabled, transportChatId, transportUserId]);

  useEffect(() => {
    const previousSignature = lastVisibleMessageSignatureRef.current;
    const latestMessage = messages[messages.length - 1] ?? null;
    const previousLatestMessageId = lastLatestMessageIdRef.current;
    const latestMessageId = latestMessage?.id ?? null;

    lastVisibleMessageSignatureRef.current = visibleMessageSignature;
    lastLatestMessageIdRef.current = latestMessageId;

    if (previousSignature === null) {
      // Initial room load must not jump to the end. The user must be able to read history.
      return;
    }

    if (previousSignature !== visibleMessageSignature && latestMessageId !== previousLatestMessageId) {
      // Do not auto-scroll from media load/reaction/new incoming messages. This keeps chat reading stable.
      return;
    }
  }, [messages, visibleMessageSignature]);



  useEffect(() => {
    if (!realtimeEnabled) return;

    messages.forEach((item) => {
      if (item.mine || !item.id) return;

      if (!deliveredMessageIdsRef.current.has(item.id)) {
        deliveredMessageIdsRef.current.add(item.id);
        try {
          emitMessengerKernelMessageDelivered({
            messageId: item.id,
            userId: transportUserId,
            at: new Date().toISOString(),
          });
        } catch {}
      }

      if (!readMessageIdsRef.current.has(item.id)) {
        readMessageIdsRef.current.add(item.id);
        try {
          emitMessengerKernelMessageRead({
            messageId: item.id,
            userId: transportUserId,
            at: new Date().toISOString(),
          });
        } catch {}
        void markMessengerKernelMessageRead(item.id).catch(() => {});
      }
    });
  }, [messages, realtimeEnabled, transportChatId, transportUserId]);

  useEffect(() => {
    if (!realtimeEnabled) return;

    const shouldType = inputFocused && draft.trim().length > 0 && !pendingVoiceMessage;

    if (shouldType && !typingStartedRef.current) {
      emitMessengerKernelTyping({ chatId: transportChatId, isTyping: true, userId: transportUserId });
      typingStartedRef.current = true;
      return;
    }

    if (!shouldType && typingStartedRef.current) {
      emitMessengerKernelTyping({ chatId: transportChatId, isTyping: false, userId: transportUserId });
      typingStartedRef.current = false;
    }
  }, [realtimeEnabled, draft, inputFocused, pendingVoiceMessage, transportChatId, transportUserId]);

  const showNotice = (value: string) => {
    setNotice(value);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), 1700);
  };

  const resetComposer = () => {
    setInputHeight(MIN_INPUT_HEIGHT);
    setComposerPanel(null);
    setForwardSources([]);
    inputRef.current?.blur();
    Keyboard.dismiss();
  };
  const uploadKernelMediaAsset = useCallback(
    async (params: {
      uri: string;
      name: string;
      mimeType: string;
      replyToMessageId?: string | null;
      type: "VOICE" | "VIDEO" | "IMAGE" | "DOCUMENT";
    }) => {
      return uploadMessengerKernelMedia({
        chatId: transportChatId,
        userId: transportUserId,
        uri: params.uri,
        name: params.name,
        mimeType: params.mimeType,
        replyToMessageId: params.replyToMessageId ?? null,
        type: params.type,
      });
    },
    [transportChatId, transportUserId],
  );


  const sendKernelMessage = async (payload: {
    type: RealtimeMessageType;
    text: string;
    notice?: string;
    replySource?: MessageItem | null;
    previewTitle?: string;
    previewSubtitle?: string;
    fileLabel?: string;
    localUri?: string;
    mimeType?: string | null;
    durationMs?: number;
    durationLabel?: string;
    animatedPayload?: MessageItem["animatedPayload"];
    latitude?: number;
    longitude?: number;
    kind?: MessageItem["kind"];
    peerUserId?: string | null;
    peerPhone?: string | null;
    peerUsername?: string | null;
    transportMediaUriOverride?: string | null;
    forwardedFromMessageId?: string | null;
    forwardedFromChatId?: string | null;
    forwardedFromUserId?: string | null;
    forwardedFromLabel?: string | null;
  }) => {
    const replySource = Object.prototype.hasOwnProperty.call(payload, "replySource")
      ? payload.replySource ?? null
      : replyTarget;

    if (!realtimeEnabled || !transportChatId || !transportUserId) {
      throw new Error(
        connectionIsConnecting || connectionState === "reconnecting"
          ? texts.connecting
          : texts.messageSendError,
      );
    }

    const peerPhoneForSend = payload.peerPhone ?? (routePhone || null);
    const peerUsernameForSend = payload.peerUsername ?? (normalizeMessengerUsername(routeHandle) || null);
    const peerUserIdForSend =
      payload.peerUserId ??
      routePeerId ??
      activePeerId ??
      presencePeerId ??
      (roomType === "direct" && !peerPhoneForSend && !peerUsernameForSend ? routeChatId : null);

    const sendPayload = {
      chatId: transportChatId,
      userId: transportUserId,
      peerUserId: peerUserIdForSend,
      peerPhone: peerPhoneForSend,
      peerUsername: peerUsernameForSend,
      type: payload.type as any,
      content: payload.text,
      replyToMessageId: replySource?.id ?? null,
      previewTitle: payload.previewTitle ?? null,
      previewSubtitle: payload.previewSubtitle ?? null,
      fileLabel: payload.fileLabel ?? null,
      mimeType: payload.mimeType ?? null,
      mediaUri: payload.transportMediaUriOverride ?? payload.localUri ?? null,
      durationMs: payload.durationMs ?? null,
      durationLabel: payload.durationLabel ?? null,
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
      animatedPayload: payload.animatedPayload ?? null,
      forwardedFromMessageId: payload.forwardedFromMessageId ?? null,
      forwardedFromChatId: payload.forwardedFromChatId ?? null,
      forwardedFromUserId: payload.forwardedFromUserId ?? null,
      forwardedFromLabel: payload.forwardedFromLabel ?? null,
      originalMessageId: payload.forwardedFromMessageId ?? null,
    };

    let response: unknown;
    try {
      response = await sendMessengerKernelMessage(sendPayload);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || "");
      const shouldResolveDirectRoom =
        roomType === "direct" &&
        /message_chat_not_found|message_sender_not_chat_member/i.test(message) &&
        Boolean(peerUserIdForSend || peerPhoneForSend || peerUsernameForSend);

      if (!shouldResolveDirectRoom) {
        throw error;
      }

      const ensuredRoom = await ensureMessengerDirectRoom({
        currentUserId: transportUserId,
        peerUserId: peerUserIdForSend || null,
        displayName: meta.name,
        username: peerUsernameForSend || null,
        phone: peerPhoneForSend || null,
        avatarUrl: headerAvatarUri || null,
      });

      const ensuredChatId = typeof ensuredRoom?.chatId === "string" && ensuredRoom.chatId.trim()
        ? ensuredRoom.chatId.trim()
        : null;

      if (!ensuredChatId) {
        throw error;
      }

      setResolvedDirectChatId((current) => (current === ensuredChatId ? current : ensuredChatId));
      if (ensuredRoom?.peerUserId) {
        setActivePeerId((current) => (current && current.trim() ? current : ensuredRoom.peerUserId || ""));
      }

      response = await sendMessengerKernelMessage({
        ...sendPayload,
        chatId: ensuredChatId,
        peerUserId: ensuredRoom?.peerUserId || peerUserIdForSend,
      });
    }

    const responseChatId = extractMessengerResponseChatId(response);
    const hydrateChatId = responseChatId || transportChatId;

    const persistedPeerUserId = peerUserIdForSend;

    if (responseChatId && responseChatId !== transportChatId) {
      setResolvedDirectChatId(responseChatId);
    }

    const sentRoomSnapshot = {
      chatId: hydrateChatId,
      name: meta.name,
      subtitle: routeSubtitleText || routeHandle || routePhone || undefined,
      roomType,
      verified: Boolean(meta.verified),
      avatarLetter: resolveAvatarLetter(meta),
      phone: routePhone || undefined,
      username: normalizeMessengerUsername(routeHandle) || undefined,
      currentUserId: transportUserId,
      peerUserId: persistedPeerUserId || undefined,
      avatarUrl: headerAvatarUri || undefined,
      photoUrl: headerAvatarUri || undefined,
      hiddenFromMain: routeHiddenFromMain,
      deleted: false,
      forceVisibleInMain: routeForceVisibleInMain,
    };

    await Promise.all([
      registerPersistedChatRoom(sentRoomSnapshot).catch(() => undefined),
      ensureMessengerKernelRoomSnapshot(sentRoomSnapshot).catch(() => undefined),
    ]);

    if (transportChatId && transportChatId !== hydrateChatId) {
      const localRoomSnapshot = {
        ...sentRoomSnapshot,
        chatId: transportChatId,
      };
      await Promise.all([
        registerPersistedChatRoom(localRoomSnapshot).catch(() => undefined),
        ensureMessengerKernelRoomSnapshot(localRoomSnapshot).catch(() => undefined),
      ]);
    }

    await hydrateMessengerKernelRoomGraph(hydrateChatId, {
      currentUserId: transportUserId,
      messageLimit: 150,
      participantLimit: 60,
    }).catch(() => undefined);

    setReplyTarget(null);
    // Sending must not force the whole room to jump while media layout is still changing.

    if (payload.notice) showNotice(payload.notice);
    return response;
  };


  const openContactSourceSheet = () => {
    setContactSheetMode("source");
    setContactSheetOptions([]);
    setContactSheetLoading(false);
    setContactSheetVisible(true);
  };

  const loadPhoneContactOptions = async () => {
    setContactSheetMode("phone");
    setContactSheetLoading(true);
    try {
      const items = await listPhoneContacts(250);
      setContactSheetOptions(
        dedupeContactOptions(
          items.map((item, index) => ({
            id: item.id || `phone-contact-${index}-${item.phone || item.name}`,
            name: item.name,
            phone: item.phone,
            role: item.role || texts.phoneContactsTitle,
            source: "phone" as const,
          })),
        ),
      );
    } catch (error) {
      Alert.alert(texts.contactsTitle, error instanceof Error ? error.message : texts.contactsAccessError);
      setContactSheetOptions([]);
    } finally {
      setContactSheetLoading(false);
    }
  };

  const loadSabiContactOptions = async () => {
    setContactSheetMode("sabi");
    setContactSheetLoading(true);
    try {
      const items = await listCustomMessengerContacts(transportUserId || routeUserId || undefined);
      setContactSheetOptions(
        dedupeContactOptions(
          items.map((item) => ({
            id: item.id,
            chatId: item.chatId,
            name: item.name,
            phone: item.phone || "",
            username: item.username,
            role: item.username || item.phone || texts.sabiContactsTitle,
            source: "sabi" as const,
          })),
        ),
      );
    } catch (error) {
      Alert.alert(texts.contactsTitle, error instanceof Error ? error.message : texts.contactsAccessError);
      setContactSheetOptions([]);
    } finally {
      setContactSheetLoading(false);
    }
  };

  const sendContactCard = async (item: ContactOption) => {
    const name = String(item.name || texts.contactTitle).trim() || texts.contactTitle;
    const phone = normalizeContactPhone(item.phone) || undefined;
    const username = normalizeContactUsername(item.username || "") || undefined;
    const source = item.source === "sabi" ? "sabi" : "phone";

    await sendKernelMessage({
      type: "CONTACT",
      kind: "contact" as any,
      text: `рџ‘¤ ${name}`,
      notice: texts.contactAttached,
      previewTitle: name,
      previewSubtitle: phone || username || "",
      fileLabel: source === "sabi" ? "Sabi Messenger" : item.role || texts.contactCard,
      localUri: buildContactCardUri({
        name,
        phone,
        username,
        userId: item.userId,
        chatId: item.chatId || item.id,
        avatarUrl: item.avatarUrl,
        source,
      }),
    });
  };

  const closeTransient = () => {
    setReactionVisible(false);
    setReactionAnchor(null);
    setTopActionMode(null);
    setOverflowVisible(false);
    setStickerSheetVisible(false);
    setAnimatedHubVisible(false);
    setAnimatedReactionVisible(false);
    setAnimatedEmojiVisible(false);
    setAnimatedGiftVisible(false);
    setAnimatedPlaybackVisible(false);
    setAnimatedPlaybackPayload(null);
    setLinkSheetVisible(false);
    setSaveSheetVisible(false);
  };

  const closeSelection = () => {
    closeTransient();
    setSelectedMessage(null);
    setSelectionMode(null);
    setSelectedMessageIds([]);
  };

  const registerBubbleLayout = (messageId: string, layout: ReactionAnchor) => {
    setBubbleLayouts((current) => ({ ...current, [messageId]: layout }));
  };

  const registerBubbleRef = (messageId: string, node: any) => {
    if (node) {
      bubbleRefs.current[messageId] = node;
      return;
    }
    delete bubbleRefs.current[messageId];
  };

  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessageIds((current) =>
      current.includes(messageId)
        ? current.filter((id) => id !== messageId)
        : [...current, messageId],
    );
  };

  const openReactionWithAnchor = (message: MessageItem, anchor: ReactionAnchor) => {
    setSelectedMessage(message);
    setTopActionMode(null);
    setOverflowVisible(false);
    setStickerSheetVisible(false);
    setReactionAnchor(anchor);
    setReactionVisible(true);
  };

  const resolveFallbackAnchor = (messageId: string, nativeEvent: any): ReactionAnchor => {
    const layout = bubbleLayouts[messageId];
    const width = layout?.width ?? 180;
    const height = layout?.height ?? 72;
    const x =
      typeof nativeEvent.pageX === "number" && typeof nativeEvent.locationX === "number"
        ? nativeEvent.pageX - nativeEvent.locationX
        : layout?.x ?? 0;
    const yRaw =
      typeof nativeEvent.pageY === "number" && typeof nativeEvent.locationY === "number"
        ? nativeEvent.pageY - nativeEvent.locationY
        : layout?.y ?? 0;

    return {
      x,
      y: Math.max(insets.top + 4, yRaw - insets.top),
      width,
      height,
    };
  };

  const isAnimatedMessage = (message: MessageItem) =>
    message.kind === "animated_reaction" ||
    message.kind === "animated_emoji" ||
    message.kind === "gift";

  const replayAnimatedMessage = (message: MessageItem) => {
    if (!message.animatedPayload) return;
    setAnimatedHubVisible(false);
    setAnimatedReactionVisible(false);
    setAnimatedEmojiVisible(false);
    setAnimatedGiftVisible(false);
    setAnimatedPlaybackPayload(message.animatedPayload);
    setAnimatedPlaybackVisible(true);
  };

  // Animated reactions, animated emoji, anime stickers and gifts must never autoplay
  // when a chat is opened or refreshed. Playback starts only from an explicit tap
  // on the message bubble, through replayAnimatedMessage(message).

  const stopActiveAudioPlayback = useCallback(async () => {
    if (!soundRef.current) {
      setAudioIsPlaying(false);
      setAudioPlayingMessageId(null);
      setAudioPositionMs(0);
      setAudioDurationMs(0);
      setAudioRate(1);
      return;
    }

    try {
      await soundRef.current.stopAsync();
    } catch {}

    try {
      await soundRef.current.unloadAsync();
    } catch {}

    soundRef.current = null;
    setAudioIsPlaying(false);
    setAudioPlayingMessageId(null);
    setAudioPositionMs(0);
    setAudioDurationMs(0);
    setAudioRate(1);
  }, []);

  const stopInlineVideoPlayback = useCallback(() => {
    setInlineVideoPlaying(false);
    setActiveInlineVideoId(null);
    setCenterVideoPlaying(false);
    setCenterVideoMessage(null);
    setCenterVideoLoadError(null);
  }, []);

  const stopTransientMediaPlayback = useCallback(async () => {
    stopInlineVideoPlayback();
    await stopActiveAudioPlayback();
  }, [stopActiveAudioPlayback, stopInlineVideoPlayback]);

  const resolveAudioUploadMeta = useCallback((uri: string) => {
    const cleanUri = String(uri || '').split('?')[0];
    const parts = cleanUri.split('.');
    const rawExt = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    const ext = rawExt || 'm4a';

    switch (ext) {
      case "caf":
        return { name: `voice-${Date.now()}.caf`, mimeType: "audio/x-caf" };
      case "aac":
        return { name: `voice-${Date.now()}.aac`, mimeType: "audio/aac" };
      case "mp3":
        return { name: `voice-${Date.now()}.mp3`, mimeType: "audio/mpeg" };
      case "wav":
        return { name: `voice-${Date.now()}.wav`, mimeType: "audio/wav" };
      case "3gp":
      case "3gpp":
        return { name: `voice-${Date.now()}.3gp`, mimeType: "audio/3gpp" };
      case "amr":
        return { name: `voice-${Date.now()}.amr`, mimeType: "audio/amr" };
      case "mp4":
      case "m4a":
      default:
        return { name: `voice-${Date.now()}.${ext || "m4a"}`, mimeType: "audio/mp4" };
    }
  }, []);


  const toggleInlineVideoPlayback = useCallback(
    async (message: MessageItem) => {
      const videoUri = resolveMessageVideoPlaybackUri(message);
      if (!videoUri) return;

      await stopActiveAudioPlayback();
      setCenterVideoLoadError(null);
      setActiveInlineVideoId(message.id);
      setInlineVideoPlaying(false);
      setCenterVideoMessage(message);
      setCenterVideoPlaying(true);
    },
    [stopActiveAudioPlayback],
  );

  const openFullscreenVideoFile = useCallback(
    async (message: MessageItem) => {
      const videoUri = resolveMessageVideoPlaybackUri(message);
      if (!videoUri) return;

      await stopActiveAudioPlayback();
      setCenterVideoPlaying(false);
      setCenterVideoMessage(null);
      setCenterVideoLoadError(null);
      setActiveInlineVideoId(null);
      setInlineVideoPlaying(false);
      setFullscreenVideoLoadError(null);
      setFullscreenVideoMessage(message);
      setFullscreenVideoPlaying(true);
    },
    [stopActiveAudioPlayback],
  );

  const closeFullscreenVideoFile = useCallback(() => {
    setFullscreenVideoPlaying(false);
    setFullscreenVideoMessage(null);
    setFullscreenVideoLoadError(null);
  }, []);

  const handleInlineVideoStatus = useCallback(
    (messageId: string, status: any) => {
      if (messageId !== activeInlineVideoId) return;

      if (!status?.isLoaded) {
        if (status?.error) {
          setInlineVideoPlaying(false);
          setActiveInlineVideoId(null);
        }
        return;
      }

      if (status.didJustFinish) {
        setInlineVideoPlaying(false);
        setActiveInlineVideoId(null);
      }
    },
    [activeInlineVideoId],
  );

  const openImagePreview = async (message: MessageItem) => {
    const imageUri = resolveMessageAttachmentUri(message);
    if (!imageUri) {
      showNotice(texts.photoPreviewUnavailable);
      return;
    }
    await stopTransientMediaPlayback();
    setImagePreviewTitle(message.previewTitle ?? texts.photoTitle);
    setImagePreviewSubtitle(message.previewSubtitle || texts.photoPreviewSubtitle);
    setImagePreviewUri(imageUri);
  };

  const playVoiceMessage = async (message: MessageItem) => {
    const audioUri = resolveMessageAttachmentUri(message);
    if (!audioUri) return;

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
      );

      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          void sound.unloadAsync();
          if (soundRef.current === sound) soundRef.current = null;
        }
      });

      showNotice(texts.voicePlayback);
    } catch (error) {
      Alert.alert(
        texts.voiceTitle,
        error instanceof Error ? error.message : texts.voicePlayError,
      );
    }
  };

  const openDocumentPreview = async (message: MessageItem) => {
    const documentUri = resolveMessageOpenUri(message);
    if (!documentUri) {
      showNotice(texts.documentPreviewUnavailable);
      return;
    }

    try {
      await openDocumentUniversal({
        uri: documentUri,
        mimeType: (message as any).mimeType,
        name: message.previewTitle || message.fileLabel || texts.documentTitle,
      });
      showNotice(texts.documentOpenNotice);
    } catch (error) {
      Alert.alert(
        texts.documentTitle,
        error instanceof Error ? error.message : texts.documentOpenError,
      );
    }
  };

  const openLocationPreview = async (message: MessageItem) => {
    const coords = extractCoordinatesFromText(message.previewSubtitle);
    const locationUrl =
      coords?.latitude != null && coords?.longitude != null
        ? buildLocationOpenMapUrl({
            latitude: coords.latitude,
            longitude: coords.longitude,
            title: message.previewTitle,
          })
        : resolveMessageOpenUri(message) || undefined;

    try {
      await openLocationUniversal({
        url: locationUrl,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        title: message.previewTitle,
      });
      showNotice(texts.locationOpenNotice);
    } catch (error) {
      Alert.alert(
        texts.locationTitle,
        error instanceof Error ? error.message : texts.locationOpenError,
      );
    }
  };

  const saveContactCardToPhone = async (card: ContactCardData) => {
    await saveChatPartnerToSystemContacts({
      name: card.name,
      phone: card.phone,
      username: (card.username || "").replace(/^@/, ""),
      company: "Sabi Messenger",
    });
    showNotice(texts.contactSavedToDevice);
  };

  const openContactCardInMessenger = async (card: ContactCardData) => {
    const query = card.userId || card.username || card.phone || card.name;
    const foundUsers = query
      ? await fetchMessengerUsers({
          query,
          currentUserId: transportUserId || undefined,
          limit: 1,
        }).catch(() => [])
      : [];
    const found = foundUsers[0] ?? null;

    if (found?.userId && transportUserId) {
      await openMessengerRoom({
        roomType: "direct",
        currentUserId: transportUserId,
        peerUserId: found.userId,
        name: found.displayName || card.name,
        username: found.username || card.username || undefined,
        handle: found.username || card.username || undefined,
        phone: found.phone || card.phone || undefined,
        avatarUrl: found.avatarUrl || card.avatarUrl || undefined,
        photoUrl: found.avatarUrl || card.avatarUrl || undefined,
        verified: found.verified,
        markRead: false,
      });
      showNotice(texts.contactOpenNotice);
      return;
    }

    const saved = await upsertCustomMessengerContact({
      id: card.userId || card.chatId || card.username || card.phone || undefined,
      chatId: card.chatId || undefined,
      name: card.name,
      phone: card.phone,
      username: card.username,
      avatarLetter: getContactInitials(card.name).slice(0, 1),
      roomType: "direct",
      source: "custom",
      currentUserId: transportUserId || routeUserId || undefined,
      peerUserId: card.userId || undefined,
    });

    showNotice(texts.contactSavedInMessenger);
    await openMessengerRoom({
      chatId: saved.chatId,
      id: saved.chatId,
      roomType: saved.roomType,
      name: saved.name,
      phone: saved.phone,
      username: saved.username,
      handle: saved.username,
      currentUserId: transportUserId || undefined,
      avatarLetter: saved.avatarLetter,
      markRead: false,
    });
  };

  const openContactPreview = async (message: MessageItem) => {
    const card = resolveContactCardFromMessage(message, meta.name || texts.contactTitle);

    Alert.alert(texts.contactCard, card.name, [
      {
        text: texts.openContactInPhone,
        onPress: () => {
          void saveContactCardToPhone(card).catch((error) => {
            Alert.alert(texts.contactsTitle, error instanceof Error ? error.message : texts.contactOpenError);
          });
        },
      },
      {
        text: texts.openContactInMessenger,
        onPress: () => {
          void openContactCardInMessenger(card).catch((error) => {
            Alert.alert(texts.contactsTitle, error instanceof Error ? error.message : texts.contactOpenError);
          });
        },
      },
      { text: texts.cancel, style: "cancel" },
    ]);
  };

  const openQuickReactionTap = (message: MessageItem, event: any) => {
    if (selectionMode) {
      toggleMessageSelection(message.id);
      return;
    }

    if (message.kind === "image" && resolveMessageAttachmentUri(message)) {
      void openImagePreview(message);
      return;
    }

    if (message.kind === "audio" && resolveMessageAttachmentUri(message)) {
      void playPauseAudioMessage(message);
      return;
    }

    if (isFullscreenVideoFileMessage(message, texts.videoTitle)) {
      void openFullscreenVideoFile(message);
      return;
    }

    if (message.kind === "video" && resolveMessageVideoPlaybackUri(message)) {
      void toggleInlineVideoPlayback(message);
      return;
    }

    if (isDocumentPreviewMessage(message)) {
      void openDocumentPreview(message);
      return;
    }

    if (isLocationPreviewMessage(message)) {
      void openLocationPreview(message);
      return;
    }

    if (isContactPreviewMessage(message)) {
      void openContactPreview(message);
      return;
    }

    if (isAnimatedMessage(message)) {
      replayAnimatedMessage(message);
      return;
    }

    const nativeEvent = event?.nativeEvent ?? {};
    const fallbackAnchor = resolveFallbackAnchor(message.id, nativeEvent);
    const bubbleRef = bubbleRefs.current[message.id];

    if (bubbleRef && typeof bubbleRef.measureInWindow === "function") {
      bubbleRef.measureInWindow((x: number, y: number, width: number, height: number) => {
        if (width > 0 && height > 0) {
          openReactionWithAnchor(message, {
            x,
            y: Math.max(insets.top + 4, y - insets.top),
            width,
            height,
          });
          return;
        }

        openReactionWithAnchor(message, fallbackAnchor);
      });
      return;
    }

    openReactionWithAnchor(message, fallbackAnchor);
  };

  const openMessageActionsLongPress = (message: MessageItem) => {
    if (selectionMode) {
      toggleMessageSelection(message.id);
      return;
    }

    setSelectedMessage(message);
    setReactionVisible(false);
    setReactionAnchor(null);
    setOverflowVisible(false);
    setStickerSheetVisible(false);
    setTopActionMode(message.mine ? "mine" : "other");
  };

  const startSelectionMode = (mode: "delete" | "forward") => {
    if (!selectedMessage) return;
    setSelectionMode(mode);
    setSelectedMessageIds((current) => (current.length ? current : [selectedMessage.id]));
    closeTransient();
  };

  const cancelSelectionMode = () => {
    setSelectionMode(null);
    setSelectedMessageIds([]);
  };

  const resetComposerAfterLocalMessageRemoval = (removedIds: string[]) => {
    if (editingMessageId && removedIds.includes(editingMessageId)) {
      setEditingMessageId(null);
      setDraft("");
      resetComposer();
    }

    if (replyTarget?.id && removedIds.includes(replyTarget.id)) {
      setReplyTarget(null);
    }
  };

  const deleteMessagesForMe = async (ids: string[]) => {
    const normalizedIds = Array.from(
      new Set(ids.map((id) => String(id || "").trim()).filter(Boolean)),
    );

    if (!normalizedIds.length) return [];

    const nextHiddenIds = transportChatId
      ? await hidePersistedChatMessagesForUser(transportChatId, transportUserId, normalizedIds)
      : normalizedIds;

    if (transportChatId) {
      await Promise.all(
        normalizedIds.map((id) =>
          deleteMessengerKernelMessageForMe({
            id,
            messageId: id,
            chatId: transportChatId,
            scope: "me",
          }),
        ),
      );
    }

    setChatClearedMessageIds(nextHiddenIds);
    resetComposerAfterLocalMessageRemoval(normalizedIds);
    return normalizedIds;
  };

  const deleteMessagesForEveryone = async (ids: string[]) => {
    const normalizedIds = Array.from(
      new Set(ids.map((id) => String(id || "").trim()).filter(Boolean)),
    );

    if (!normalizedIds.length) return [];

    await Promise.all(
      normalizedIds.map((id) =>
        deleteMessengerKernelMessage({
          id,
          messageId: id,
          chatId: transportChatId,
          scope: "everyone",
        }),
      ),
    );

    if (transportChatId) {
      const nextHiddenIds = await hidePersistedChatMessagesForUser(
        transportChatId,
        transportUserId,
        normalizedIds,
      );
      setChatClearedMessageIds(nextHiddenIds);
    }

    resetComposerAfterLocalMessageRemoval(normalizedIds);
    return normalizedIds;
  };

  const applyDeleteSelection = async () => {
    if (!selectedMessageIds.length) return;

    try {
      const ids = await deleteMessagesForMe(selectedMessageIds);
      showNotice(`${texts.deletedPrefix}: ${ids.length}`);
      cancelSelectionMode();
      setSelectedMessage(null);
    } catch (error) {
      Alert.alert(
        texts.messageTitle,
        error instanceof Error ? error.message : texts.messageSendError,
      );
    }
  };

  const applyForwardSelection = () => {
    if (!selectedMessageIds.length) return;
    const selectedItems = messages.filter((item) => selectedMessageIds.includes(item.id));
    const payload = selectedItems.map((item) => item.text).join("\n");
    setForwardSources(selectedItems);
    setDraft(payload);
    setInputHeight(Math.max(MIN_INPUT_HEIGHT, Math.min(56, MAX_INPUT_HEIGHT)));
    requestAnimationFrame(() => inputRef.current?.focus());
    showNotice(`${texts.selectedForForwardPrefix}: ${selectedMessageIds.length}`);
    cancelSelectionMode();
    setSelectedMessage(null);
  };

  const handleReply = () => {
    if (!selectedMessage) return;
    setReplyTarget(selectedMessage);
    setEditingMessageId(null);
    closeSelection();
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleEdit = () => {
    if (!selectedMessage) return;
    setDraft(selectedMessage.text);
    setEditingMessageId(selectedMessage.id);
    setReplyTarget(null);
    closeSelection();
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleDelete = async (scope: "me" | "all") => {
    if (selectionMode) {
      await applyDeleteSelection();
      return;
    }

    if (!selectedMessage) return;

    const messageId = selectedMessage.id;

    try {
      if (scope === "all") {
        await deleteMessagesForEveryone([messageId]);
      } else {
        await deleteMessagesForMe([messageId]);
      }

      closeSelection();
      showNotice(scope === "all" ? texts.deletedForAll : texts.deletedForMe);
    } catch (error) {
      Alert.alert(
        texts.messageTitle,
        error instanceof Error ? error.message : texts.messageSendError,
      );
    }
  };

  const handleForward = () => {
    if (selectionMode) {
      applyForwardSelection();
      return;
    }
    startSelectionMode("forward");
    showNotice(texts.chooseMessagesForward);
  };

  const handleCopy = async () => {
    if (!selectedMessage) return;

    const text = selectedMessage.text;
    let copied = false;

    try {
      const maybeNavigator = globalThis as unknown as {
        navigator?: { clipboard?: { writeText?: (value: string) => Promise<void> } };
      };
      const writeText = maybeNavigator.navigator?.clipboard?.writeText;
      if (writeText) {
        await writeText(text);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) {
      setDraft(text);
      requestAnimationFrame(() => inputRef.current?.focus());
    }

    closeSelection();
    showNotice(copied ? texts.copiedText : texts.addedToComposer);
  };

  const translationLanguageOptions = useMemo(
    () => getMessengerInlineTranslationLanguageOptions(language),
    [language],
  );

  const runTranslateMessage = useCallback(async (target: MessageItem, targetLanguage: AiTranslationLanguageCode) => {
    const text = String(target?.text ?? "").trim();

    if (!target || !text) {
      setTranslationLanguagePickerMessage(null);
      showNotice(texts.translationEmpty);
      return;
    }

    const messageId = target.id;
    const normalizedTargetLanguage = normalizeMessengerInlineTranslationLanguage(targetLanguage);
    setPreferredTranslationTargetLanguage(normalizedTargetLanguage);
    setTranslationLanguagePickerMessage(null);
    setInlineTranslationsByMessageId((current) => ({
      ...current,
      [messageId]: {
        status: "loading",
        targetLanguage: normalizedTargetLanguage,
      },
    }));

    try {
      const result = await translateMessengerInlineMessage({
        text,
        sourceLanguage: "auto",
        targetLanguage: normalizedTargetLanguage,
        chatId: transportChatId || routeChatId,
        messageId,
        userId: transportUserId || routeUserId,
      });

      setInlineTranslationsByMessageId((current) => ({
        ...current,
        [messageId]: {
          status: "success",
          text: result.translatedText,
          sourceLanguage: result.sourceLanguage,
          targetLanguage: result.targetLanguage || normalizedTargetLanguage,
        },
      }));
    } catch (error) {
      const errorText = normalizeMessengerTranslationErrorForUi(
        error,
        texts.translationFailed,
        texts.translationProviderUnavailable,
      );
      setInlineTranslationsByMessageId((current) => ({
        ...current,
        [messageId]: {
          status: "error",
          error: errorText,
          targetLanguage: normalizedTargetLanguage,
        },
      }));
      showNotice(errorText);
    }
  }, [
    routeChatId,
    routeUserId,
    showNotice,
    texts.translationEmpty,
    texts.translationFailed,
    texts.translationProviderUnavailable,
    transportChatId,
    transportUserId,
  ]);

  const handleTranslateSelectedMessage = useCallback(() => {
    const target = selectedMessage;
    const text = String(target?.text ?? "").trim();

    if (!target || !text) {
      closeSelection();
      showNotice(texts.translationEmpty);
      return;
    }

    setTranslationLanguagePickerMessage(target);
    closeSelection();
  }, [
    closeSelection,
    selectedMessage,
    showNotice,
    texts.translationEmpty,
  ]);

  const sendHiddenReactionControl = (message: MessageItem, reaction: string) => {
    const normalizedReaction = String(reaction || "").trim();
    if (!message?.id || !normalizedReaction) return;

    setLocalReactionByMessageId((current) => ({
      ...current,
      [message.id]: normalizedReaction,
    }));

    void sendKernelMessage({
      type: "TEXT",
      kind: "text" as any,
      text: encodeSabiControlMessage(SABI_REACTION_CONTROL_PREFIX, {
        messageId: message.id,
        reaction: normalizedReaction,
        updatedAt: new Date().toISOString(),
      }),
      replySource: null,
    }).catch(() => undefined);
  };

  const handleReact = (emoji: string) => {
    const target = selectedMessage;
    if (target) {
      sendHiddenReactionControl(target, emoji);
    }
    closeSelection();
  };

  const handleStickerReaction = (emoji: string) => {
    if (stickerTarget === "composer") {
      setDraft((current) => {
        if (!current.trim()) return `${emoji} `;
        return /[\s\n]$/.test(current) ? `${current}${emoji} ` : `${current} ${emoji} `;
      });
      setStickerSheetVisible(false);
      requestAnimationFrame(() => inputRef.current?.focus());
      showNotice(texts.stickerAdded);
      return;
    }

    if (selectedMessage) {
      sendHiddenReactionControl(selectedMessage, emoji);
      showNotice(texts.animatedReactionSent);
    }

    closeSelection();
  };

  const handleInputSizeChange = (
    event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
  ) => {
    const next = Math.max(
      MIN_INPUT_HEIGHT,
      Math.min(MAX_INPUT_HEIGHT, Math.ceil(event.nativeEvent.contentSize.height)),
    );
    setInputHeight(next);
  };

  const startVoiceHoldRecording = async () => {
    if (!roomCapabilities.canSendMedia || isSendingPendingVoice) {
      if (!roomCapabilities.canSendMedia) showNotice(texts.readOnlySubtitle);
      return;
    }

    if (
      isVoiceRecording ||
      recordingRef.current ||
      isStartingVoiceRef.current ||
      isStoppingVoiceRef.current
    ) {
      return;
    }

    isStartingVoiceRef.current = true;

    try {
      await stopTransientMediaPlayback();
      const recording = await startVoiceRecording();
      recordingRef.current = recording;
      setPendingVoiceMessage(null);
      setIsVoiceRecording(true);
      showNotice(texts.recordingVoice);
    } catch (error) {
      Alert.alert(
        texts.voiceTitle,
        error instanceof Error ? error.message : texts.voiceStartError,
      );
    } finally {
      isStartingVoiceRef.current = false;
    }
  };

  const stopVoiceHoldRecording = async () => {
    if (!recordingRef.current || isStoppingVoiceRef.current) return;

    isStoppingVoiceRef.current = true;
    const recording = recordingRef.current;
    recordingRef.current = null;

    try {
      const recorded = await stopVoiceRecording(recording);
      setIsVoiceRecording(false);

      if (!recorded) return;

      setPendingVoiceMessage(recorded);
      showNotice(texts.voiceReadyToSend);
    } catch (error) {
      setIsVoiceRecording(false);
      Alert.alert(
        texts.voiceTitle,
        error instanceof Error ? error.message : texts.voiceFinishError,
      );
    } finally {
      isStoppingVoiceRef.current = false;
    }
  };

  const sendPendingVoice = async () => {
    if (!pendingVoiceMessage || isSendingPendingVoice) return;
    if (!roomCapabilities.canSendMedia) {
      showNotice(texts.readOnlySubtitle);
      return;
    }

    const voiceMessage = pendingVoiceMessage;
    const currentReply = replyTarget;
    const uploadMeta = resolveAudioUploadMeta(voiceMessage.uri);

    setIsSendingPendingVoice(true);

    try {
      await stopInlineVideoPlayback();

      let uploadedTransportUri: string | null = null;

      if (realtimeEnabled) {
        const uploadResult = await uploadKernelMediaAsset({
          uri: voiceMessage.uri,
          name: uploadMeta.name,
          mimeType: uploadMeta.mimeType,
          replyToMessageId: currentReply?.id ?? null,
          type: "VOICE",
        });

        uploadedTransportUri = extractUploadedTransportMediaUri(uploadResult);

        if (!uploadedTransportUri) {
          throw new Error(texts.voiceUploadError || texts.messageSendError || "Voice upload failed");
        }
      }

      await sendKernelMessage({
        type: "VOICE",
        kind: voiceMessage.kind,
        text: voiceMessage.messageText,
        notice: texts.voiceSent,
        replySource: currentReply,
        previewTitle: voiceMessage.title,
        previewSubtitle: voiceMessage.subtitle,
        fileLabel: voiceMessage.durationLabel,
        localUri: voiceMessage.uri,
        mimeType: uploadMeta.mimeType,
        transportMediaUriOverride: uploadedTransportUri,
        durationMs: voiceMessage.durationMs,
        durationLabel: voiceMessage.durationLabel,
      });

      setPendingVoiceMessage(null);
    } catch (error) {
      setPendingVoiceMessage(voiceMessage);
      Alert.alert(
        texts.voiceTitle,
        error instanceof Error ? error.message : texts.voiceUploadError,
      );
    } finally {
      setIsSendingPendingVoice(false);
    }
  };

  const playPauseAudioMessage = async (message: MessageItem) => {
    const audioUri = resolveMessageAttachmentUri(message);
    if (!audioUri) return;

    try {
      await stopInlineVideoPlayback();

      if (soundRef.current && audioPlayingMessageId === message.id) {
        const status = await soundRef.current.getStatusAsync();
        if (!status.isLoaded) {
          await stopActiveAudioPlayback();
          return;
        }

        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
          setAudioIsPlaying(false);
          return;
        }

        await soundRef.current.playAsync();
        setAudioIsPlaying(true);
        return;
      }

      await stopActiveAudioPlayback();

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true, progressUpdateIntervalMillis: 120 },
      );

      soundRef.current = sound;
      setAudioPlayingMessageId(message.id);
      setAudioPositionMs(0);
      setAudioDurationMs(message.durationMs ?? 0);
      setAudioIsPlaying(true);
      setAudioRate(1);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          if ((status as any).error) {
            setAudioIsPlaying(false);
            setAudioPlayingMessageId(null);
          }
          return;
        }

        setAudioPositionMs(status.positionMillis ?? 0);
        setAudioDurationMs(status.durationMillis ?? message.durationMs ?? 0);
        setAudioIsPlaying(status.isPlaying);

        if (status.didJustFinish) {
          void stopActiveAudioPlayback();
        }
      });
    } catch (error) {
      Alert.alert(
        texts.voiceTitle,
        error instanceof Error ? error.message : texts.voicePlayError,
      );
    }
  };

  const seekAudioMessage = async (message: MessageItem, ratio: number) => {
    if (!soundRef.current || audioPlayingMessageId !== message.id || audioDurationMs <= 0) return;
    const nextPosition = Math.max(0, Math.min(audioDurationMs, Math.floor(audioDurationMs * ratio)));
    await soundRef.current.setPositionAsync(nextPosition);
  };

  const changeAudioRate = async (message: MessageItem, rate: number) => {
    if (!soundRef.current || audioPlayingMessageId !== message.id) return;
    try {
      await soundRef.current.setRateAsync(rate, true);
      setAudioRate(rate);
    } catch (error) {
      Alert.alert(
        texts.voiceTitle,
        error instanceof Error ? error.message : texts.voiceRateError,
      );
    }
  };

  const handleSend = async () => {
    if (!roomCapabilities.canSendText && !pendingVoiceMessage) {
      showNotice(texts.readOnlySubtitle);
      return;
    }

    if (pendingVoiceMessage) {
      void sendPendingVoice();
      return;
    }

    const value = draft.trim();
    if (!value) return;

    if (editingMessageId) {
      const targetMessageId = editingMessageId;
      const currentEditingMessage =
        messages.find((item) => item.id === targetMessageId) ?? selectedMessage ?? null;

      try {
        await updateMessengerKernelMessage({
          id: targetMessageId,
          messageId: targetMessageId,
          chatId: transportChatId,
          userId: transportUserId,
          content: value,
          text: value,
          previewTitle: currentEditingMessage?.previewTitle ?? null,
          previewSubtitle: currentEditingMessage?.previewSubtitle ?? null,
          fileLabel: currentEditingMessage?.fileLabel ?? null,
        } as any);

        await hydrateMessengerKernelRoomGraph(transportChatId, {
          currentUserId: transportUserId,
          messageLimit: 150,
          participantLimit: 60,
        }).catch(() => undefined);

        setEditingMessageId(null);
        setDraft("");
        resetComposer();
        showNotice(texts.messageEdited);
      } catch (error) {
        Alert.alert(
          texts.messageTitle,
          error instanceof Error ? error.message : texts.messageSendError,
        );
      }
      return;
    }

    const currentReply = replyTarget;
    const currentForwardSources = forwardSources;
    const primaryForward = currentForwardSources[0] ?? null;
    setDraft("");
    resetComposer();

    try {
      await sendKernelMessage({
        type: "TEXT",
        text: value,
        notice: texts.messageSent,
        replySource: currentReply,
        forwardedFromMessageId: primaryForward?.forwardedFromMessageId ?? primaryForward?.id ?? null,
        forwardedFromChatId: primaryForward?.forwardedFromChatId ?? (primaryForward ? transportChatId : null),
        forwardedFromUserId: primaryForward?.senderUserId ?? null,
        forwardedFromLabel: primaryForward ? meta.name : null,
      });
      setForwardSources([]);
    } catch (error) {
      setDraft(value);
      setReplyTarget(currentReply);
      setForwardSources(currentForwardSources);
      Alert.alert(
        texts.messageTitle,
        error instanceof Error ? error.message : texts.messageSendError,
      );
    }
  };

  const cancelComposerMode = () => {
    setReplyTarget(null);
    setEditingMessageId(null);
    setDraft("");
    resetComposer();
  };

  const handlePhotoCaptureResult = (result: VideoCaptureResult) => {
    const effect = getVideoEffectPreset(result.effectId);
    const currentReply = replyTarget;
    const imageMimeType = "image/jpeg";

    setPhotoCaptureVisible(false);
    setComposerPanel(null);

    void (async () => {
      try {
        let uploadedTransportUri: string | null = null;

        if (realtimeEnabled) {
          const uploadResult = await uploadKernelMediaAsset({
            uri: result.uri,
            name: `photo-${Date.now()}.${getFileExtensionFromUri(result.uri) || getMimeTypeExtension(imageMimeType) || "jpg"}`,
            mimeType: imageMimeType,
            replyToMessageId: currentReply?.id ?? null,
            type: "IMAGE",
          });

          uploadedTransportUri = extractUploadedTransportMediaUri(uploadResult);

          if (!uploadedTransportUri) {
            throw new Error(texts.messageSendError || "Photo upload failed");
          }
        }

        await sendKernelMessage({
          type: "IMAGE",
          kind: "image",
          text: "",
          notice: texts.photoCaptured,
          replySource: currentReply,
          previewTitle: texts.photoTitle,
          previewSubtitle:
            result.effectId === "normal"
              ? texts.imageNormal
              : `${effect.title} · ${result.effectIntensity}%`,
          localUri: result.uri,
          mimeType: imageMimeType,
          transportMediaUriOverride: uploadedTransportUri,
        });
      } catch (error) {
        Alert.alert(
          texts.photoTitle,
          error instanceof Error ? error.message : texts.messageSendError,
        );
      }
    })();
  };

  const handleVideoCaptureResult = (result: VideoCaptureResult) => {
    const effect = getVideoEffectPreset(result.effectId);
    const durationLabel = formatVideoDuration(result.durationMs);
    const currentReply = replyTarget;
    const videoMessageText = String(texts.videoMessageText ?? "").trim() || "Video message";
    const videoMessageTitle = String(texts.videoTitle ?? "").trim() || "Video message";
    const extension = String(result.uri || "")
      .split("?")[0]
      .trim()
      .match(/\.([A-Za-z0-9]+)$/)?.[1]?.toLowerCase() ?? "";
    const videoMimeType = result.mimeType || (
      extension === "mov"
        ? "video/quicktime"
        : extension === "m4v"
          ? "video/x-m4v"
          : extension === "webm"
            ? "video/webm"
            : extension === "mkv"
              ? "video/x-matroska"
              : extension === "avi"
                ? "video/x-msvideo"
                : extension === "3gp"
                  ? "video/3gpp"
                  : extension === "3g2"
                    ? "video/3gpp2"
                    : extension === "mpeg" || extension === "mpg"
                      ? "video/mpeg"
                      : extension === "wmv"
                        ? "video/x-ms-wmv"
                        : extension === "flv"
                          ? "video/x-flv"
                          : extension === "ogv" || extension === "ogm"
                            ? "video/ogg"
                            : "video/mp4");

    setVideoCaptureVisible(false);
    setComposerPanel(null);

    void (async () => {
      try {
        let uploadedTransportUri: string | null = null;

        if (realtimeEnabled) {
          const uploadResult = await uploadKernelMediaAsset({
            uri: result.uri,
            name: result.fileName || buildVideoUploadAssetName({
              localUri: result.uri,
              mimeType: videoMimeType,
              previewTitle: videoMessageTitle,
            }),
            mimeType: videoMimeType,
            replyToMessageId: currentReply?.id ?? null,
            type: "VIDEO",
          });

          uploadedTransportUri = extractUploadedTransportMediaUri(uploadResult);

          if (!uploadedTransportUri) {
            throw new Error(texts.messageSendError || "Video upload failed");
          }
        }

        await sendKernelMessage({
          type: "VIDEO",
          kind: "video",
          text: videoMessageText,
          notice: texts.videoCaptured,
          replySource: currentReply,
          previewTitle: videoMessageTitle,
          previewSubtitle:
            result.effectId === "normal"
              ? texts.imageNormal
              : `${effect.title} · ${result.effectIntensity}%`,
          fileLabel: durationLabel,
          durationLabel,
          durationMs: result.durationMs ?? undefined,
          localUri: result.uri,
          mimeType: videoMimeType,
          transportMediaUriOverride: uploadedTransportUri,
        });
      } catch (error) {
        Alert.alert(
          texts.videoTitle,
          error instanceof Error ? error.message : texts.messageSendError,
        );
      }
    })();
  };

  const sendPickedChatMediaAsset = async (
    picked: Awaited<ReturnType<typeof pickGalleryAsset>>,
    fallbackNotice?: string,
  ) => {
    if (!picked) return;

    const currentReply = replyTarget;
    const uploadType =
      picked.kind === "image"
        ? "IMAGE"
        : picked.kind === "video"
          ? "VIDEO"
          : "DOCUMENT";
    const fallbackMimeType =
      uploadType === "IMAGE"
        ? "image/jpeg"
        : uploadType === "VIDEO"
          ? "video/mp4"
          : "application/octet-stream";
    const resolvedMimeType = String(picked.mimeType || fallbackMimeType);
    const fallbackExtension =
      getFileExtensionFromUri(picked.uri) ||
      getMimeTypeExtension(resolvedMimeType) ||
      (uploadType === "DOCUMENT" ? "bin" : uploadType === "VIDEO" ? "mp4" : "jpg");
    const uploadName =
      String(picked.fileName || picked.title || "").trim() ||
      `${picked.kind}-${Date.now()}.${fallbackExtension}`;

    let uploadedTransportUri: string | null = null;

    if (realtimeEnabled) {
      const uploadResult = await uploadKernelMediaAsset({
        uri: picked.uri,
        name: uploadName,
        mimeType: resolvedMimeType,
        replyToMessageId: currentReply?.id ?? null,
        type: uploadType,
      });

      uploadedTransportUri = extractUploadedTransportMediaUri(uploadResult);

      if (!uploadedTransportUri) {
        throw new Error(texts.messageSendError || "Media upload failed");
      }
    }

    await sendKernelMessage({
      type: uploadType as RealtimeMessageType,
      kind: picked.kind as any,
      text: picked.kind === "video" ? picked.fileName || picked.title || texts.videoTitle : "",
      notice: fallbackNotice || picked.notice,
      replySource: currentReply,
      previewTitle: picked.fileName || picked.title || uploadName,
      previewSubtitle: picked.subtitle,
      fileLabel: picked.durationLabel || undefined,
      localUri: picked.uri,
      durationMs: picked.durationMs ?? undefined,
      durationLabel: picked.durationLabel,
      mimeType: resolvedMimeType,
      transportMediaUriOverride: uploadedTransportUri,
    });
  };

  const sendPickedDeviceDocumentOrVideo = async (file: {
    name: string;
    uri: string;
    mimeType?: string | null;
    meta?: string | null;
    kindLabel?: string | null;
  }) => {
    const currentReply = replyTarget;
    const fileName = String(file.name || "").trim() || `file-${Date.now()}`;
    const rawMimeType = String(file.mimeType || "application/octet-stream");
    const videoFile = isVideoMimeOrName({
      mimeType: rawMimeType,
      name: fileName,
      uri: file.uri,
      label: `${file.kindLabel ?? ""} ${file.meta ?? ""}`,
    });
    const resolvedMimeType = videoFile
      ? normalizeVideoMimeTypeFromName({ mimeType: rawMimeType, name: fileName, uri: file.uri })
      : rawMimeType;
    const uploadType = videoFile ? "VIDEO" : "DOCUMENT";
    const uploadName = videoFile
      ? buildVideoUploadAssetName({
          localUri: file.uri,
          mimeType: resolvedMimeType,
          previewTitle: fileName,
        })
      : fileName || `document-${Date.now()}.${getFileExtensionFromUri(file.uri) || getMimeTypeExtension(resolvedMimeType) || "bin"}`;

    let uploadedTransportUri: string | null = null;

    if (realtimeEnabled) {
      const uploadResult = await uploadKernelMediaAsset({
        uri: file.uri,
        name: uploadName,
        mimeType: resolvedMimeType,
        replyToMessageId: currentReply?.id ?? null,
        type: uploadType,
      });

      uploadedTransportUri = extractUploadedTransportMediaUri(uploadResult);

      if (!uploadedTransportUri) {
        throw new Error(texts.messageSendError || "Media upload failed");
      }
    }

    if (videoFile) {
      await sendKernelMessage({
        type: "VIDEO",
        kind: "video",
        text: fileName || texts.videoTitle,
        notice: texts.videoCaptured || texts.documentAttached,
        replySource: currentReply,
        previewTitle: fileName || texts.videoTitle,
        previewSubtitle: file.meta ?? undefined,
        fileLabel: file.kindLabel || getAttachmentMetaKindLabel(file.meta),
        localUri: file.uri,
        mimeType: resolvedMimeType,
        transportMediaUriOverride: uploadedTransportUri,
      });
      return;
    }

    await sendKernelMessage({
      type: "DOCUMENT",
      kind: "document" as any,
      text: `рџ“„ ${fileName}`,
      notice: texts.documentAttached,
      replySource: currentReply,
      previewTitle: fileName,
      previewSubtitle: file.meta ?? undefined,
      fileLabel: file.kindLabel || getAttachmentMetaKindLabel(file.meta),
      localUri: file.uri,
      mimeType: resolvedMimeType,
      transportMediaUriOverride: uploadedTransportUri,
    });
  };



  const liveLocationSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const liveLocationLastSentAtRef = useRef(0);
  const liveLocationStartedAtRef = useRef<string | null>(null);
  const liveLocationExpiresAtRef = useRef(0);
  const [isLiveLocationActive, setIsLiveLocationActive] = useState(false);

  const stopLiveLocation = () => {
    liveLocationSubscriptionRef.current?.remove();
    liveLocationSubscriptionRef.current = null;
    liveLocationLastSentAtRef.current = 0;
    liveLocationStartedAtRef.current = null;
    liveLocationExpiresAtRef.current = 0;
    setIsLiveLocationActive(false);
  };

  useEffect(() => {
    return () => {
      liveLocationSubscriptionRef.current?.remove();
      liveLocationSubscriptionRef.current = null;
    };
  }, []);

  const sendLiveLocationSnapshot = async (resolvedLocation: any) => {
    const startedAt = liveLocationStartedAtRef.current || new Date().toISOString();
    const expiresAt = liveLocationExpiresAtRef.current
      ? new Date(liveLocationExpiresAtRef.current).toISOString()
      : undefined;

    await sendKernelMessage({
      type: "TEXT",
      kind: "location",
      text: resolvedLocation.text,
      notice: texts.messageSent,
      replySource: null,
      previewTitle: resolvedLocation.previewTitle,
      previewSubtitle: resolvedLocation.previewSubtitle,
      locationPayload: {
        ...resolvedLocation.payload,
        live: true,
        liveStartedAt: startedAt,
        liveUpdatedAt: new Date().toISOString(),
        liveExpiresAt: expiresAt,
      },
    } as any);
  };

  const toggleLiveLocation = async () => {
    if (isLiveLocationActive) {
      stopLiveLocation();
      showNotice(texts.messageSent);
      return;
    }

    if (roomCapabilities.canSendLocation === false) {
      showNotice(texts.readOnlySubtitle);
      return;
    }

    try {
      await stopTransientMediaPlayback();
      Keyboard.dismiss();
      setComposerPanel(null);

      const startedAt = new Date().toISOString();
      liveLocationStartedAtRef.current = startedAt;
      liveLocationExpiresAtRef.current = Date.now() + 60 * 60 * 1000;

      const firstLocation = await resolveCurrentSabiChatLocation();
      await sendLiveLocationSnapshot(firstLocation);
      liveLocationLastSentAtRef.current = Date.now();

      const subscription = await watchSabiChatLiveLocation((resolvedLocation) => {
        const now = Date.now();

        if (liveLocationExpiresAtRef.current && now >= liveLocationExpiresAtRef.current) {
          stopLiveLocation();
          return;
        }

        if (now - liveLocationLastSentAtRef.current < 60000) return;

        liveLocationLastSentAtRef.current = now;
        void sendLiveLocationSnapshot(resolvedLocation).catch(() => undefined);
      });

      liveLocationSubscriptionRef.current = subscription;
      setIsLiveLocationActive(true);
      showNotice(texts.messageSent);
    } catch (error) {
      stopLiveLocation();
      Alert.alert(
        texts.messageTitle,
        error instanceof Error ? error.message : texts.mediaCaptureFailed,
      );
    }
  };
  const sendCurrentLocation = async () => {
    if (roomCapabilities.canSendLocation === false) {
      showNotice(texts.readOnlySubtitle);
      return;
    }

    const currentReply = replyTarget;

    try {
      await stopTransientMediaPlayback();
      Keyboard.dismiss();
      setComposerPanel(null);

      const resolvedLocation = await resolveCurrentSabiChatLocation();

      await sendKernelMessage({
        type: "TEXT",
        kind: "location",
        text: resolvedLocation.text,
        notice: texts.messageSent,
        replySource: currentReply,
        previewTitle: resolvedLocation.previewTitle,
        previewSubtitle: resolvedLocation.previewSubtitle,
        locationPayload: resolvedLocation.payload,
      } as any);
    } catch (error) {
      Alert.alert(
        texts.messageTitle,
        error instanceof Error ? error.message : texts.mediaCaptureFailed,
      );
    }
  };
  const sendQuickMedia = async (mode: "audio" | "video") => {
    if (!roomCapabilities.canSendMedia) {
      showNotice(texts.readOnlySubtitle);
      return;
    }

    try {
      if (mode === "audio") {
        await stopTransientMediaPlayback();
        Keyboard.dismiss();
        setComposerPanel("media");
        return;
      }

      await stopTransientMediaPlayback();
      Keyboard.dismiss();
      setComposerPanel(null);
      setPhotoCaptureVisible(false);
      setVideoCaptureVisible(false);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVideoCaptureSessionKey((current) => current + 1);
          setVideoCaptureVisible(true);
        });
      });
    } catch (error) {
      Alert.alert(
        mode === "audio" ? texts.voiceTitle : texts.videoTitle,
        error instanceof Error ? error.message : texts.mediaCaptureFailed,
      );
    }
  };

  const openAnimatedHub = () => {
    if (!roomCapabilities.canGift) {
      showNotice(texts.readOnlySubtitle);
      return;
    }

    setComposerPanel(null);
    Keyboard.dismiss();
    setAnimatedReactionVisible(false);
    setAnimatedEmojiVisible(false);
    setAnimatedGiftVisible(false);
    setAnimatedHubVisible(true);
  };

  const openGift3DPremiumDirect = () => {
    if (!roomCapabilities.canGift) {
      showNotice(texts.readOnlySubtitle);
      return;
    }

    setComposerPanel(null);
    Keyboard.dismiss();
    setAnimatedHubVisible(false);
    setAnimatedReactionVisible(false);
    setAnimatedEmojiVisible(false);
    setAnimatedGiftVisible(true);
  };

  const handleAnimatedHubSelect = (action: AnimatedHubAction) => {
    setAnimatedHubVisible(false);

    if (action === "reaction") {
      setAnimatedReactionVisible(true);
      return;
    }

    setAnimatedEmojiVisible(true);
  };

  const handleAnimatedReactionSelect = (item: AnimatedReactionItem) => {
    const emoji = typeof item.emoji === "string" ? item.emoji.trim() : "";
    if (!emoji) {
      return;
    }

    const title = String(item.label ?? "Animated reaction").trim() || "Animated reaction";
    const subtitle = String(item.subtitle ?? title).trim() || title;

    setAnimatedReactionVisible(false);
    setAnimatedPlaybackPayload({
      id: item.id,
      emoji,
      title,
      subtitle,
      durationMs: item.durationMs,
      kind: "reaction",
      premium: item.premium,
    });
    setAnimatedPlaybackVisible(true);

    const animatedPayload = {
      id: item.id,
      emoji,
      title,
      subtitle,
      durationMs: item.durationMs,
      kind: "reaction" as const,
      premium: item.premium,
    };

    void sendKernelMessage({
      type: "TEXT",
      kind: "animated_reaction",
      text: encodeSabiControlMessage(SABI_ANIMATED_CONTROL_PREFIX, animatedPayload),
      notice: texts.animatedReactionSent,
      replySource: null,
    });
  };

  const handleAnimatedEmojiSelect = (item: AnimatedEmojiItem) => {
    const emoji = typeof item.emoji === "string" ? item.emoji.trim() : "";
    if (!emoji) {
      return;
    }

    const title = String(item.label ?? "Animated emoji").trim() || "Animated emoji";
    const subtitle = title;

    setAnimatedEmojiVisible(false);
    setAnimatedPlaybackPayload({
      id: item.id,
      emoji,
      title,
      subtitle,
      durationMs: item.durationMs,
      kind: "emoji",
      premium: item.premium,
    });
    setAnimatedPlaybackVisible(true);

    const animatedPayload = {
      id: item.id,
      emoji,
      title,
      subtitle,
      durationMs: item.durationMs,
      kind: "emoji" as const,
      premium: item.premium,
    };

    void sendKernelMessage({
      type: "TEXT",
      kind: "animated_emoji",
      text: encodeSabiControlMessage(SABI_ANIMATED_CONTROL_PREFIX, animatedPayload),
      notice: texts.animatedEmojiSent,
      replySource: null,
    });
  };

  const handleAnimatedGiftSelect = (payload: AnimatedGiftSelectionPayload) => {
    const { item, quantity, totalDiamonds } = payload;
    const emoji =
      typeof item.emoji === "string" && item.emoji.trim()
        ? item.emoji
        : "рџЋЃ";

    setAnimatedGiftVisible(false);
    setAnimatedPlaybackPayload({
      id: item.id,
      emoji,
      title: item.label,
      subtitle: `x${quantity} · ${totalDiamonds.toLocaleString()} ${texts.diamondsUnit}`,
      durationMs: item.durationMs,
      kind: "gift",
      premium: item.premium,
    });
    setAnimatedPlaybackVisible(true);

    const animatedPayload = {
      id: item.id,
      emoji,
      title: item.label,
      subtitle: `x${quantity} · ${totalDiamonds.toLocaleString()} ${texts.diamondsUnit}`,
      durationMs: item.durationMs,
      kind: "gift" as const,
      premium: item.premium,
    };

    void sendKernelMessage({
      type: "TEXT",
      kind: "gift",
      text: encodeSabiControlMessage(SABI_ANIMATED_CONTROL_PREFIX, animatedPayload),
      notice: texts.giftSent,
      replySource: null,
    });
  };

  const handleAnimatedPlaybackClose = () => {
    setAnimatedPlaybackVisible(false);
    setAnimatedPlaybackPayload(null);
  };

  const openMediaComposer = () => {
    if (!roomCapabilities.canSendMedia) {
      showNotice(texts.readOnlySubtitle);
      return;
    }

    requestAnimationFrame(() => inputRef.current?.focus());
    setComposerPanel((current) => (current === "media" ? null : "media"));
  };

  const resolveAddContactDraft = useCallback(() => {
    const name = String(meta.name || routeName || "").trim();
    const phone = routePhone || normalizeContactPhone(getChatPhone(chatId, meta.name));
    const username = normalizeMessengerUsername(routeHandle || "");

    return {
      name,
      phone,
      username,
    };
  }, [chatId, meta.name, routeHandle, routeName, routePhone]);

  const openAddContactForm = useCallback(() => {
    if (roomType !== "direct" || isBotRoom) {
      showNotice(texts.contactUnavailable);
      return;
    }

    const draftContact = resolveAddContactDraft();
    setSettingsVisible(false);
    setAddContactName(draftContact.name);
    setAddContactPhone(draftContact.phone);
    setAddContactUsername(draftContact.username);
    setAddContactSaving(false);
    setAddContactVisible(true);
  }, [isBotRoom, resolveAddContactDraft, roomType, texts.contactUnavailable]);

  const closeAddContactForm = useCallback(() => {
    if (addContactSaving) return;
    setAddContactVisible(false);
  }, [addContactSaving]);

  const saveAddContactFromChatRoom = useCallback(async () => {
    if (addContactSaving) return;

    if (roomType !== "direct" || isBotRoom) {
      setAddContactVisible(false);
      showNotice(texts.contactUnavailable);
      return;
    }

    const contactName = String(addContactName || "").trim();
    const phone = normalizeContactPhone(addContactPhone);
    const username = normalizeMessengerUsername(addContactUsername || "");
    const resolvedChatId = transportChatId || routeChatId || chatId;
    const resolvedPeerUserId = presencePeerId || routePeerId || activePeerId || undefined;

    if (!contactName) {
      Alert.alert(texts.addContactTitle, texts.contactNameRequired);
      return;
    }

    if (!phone && !username && !resolvedChatId && !resolvedPeerUserId) {
      Alert.alert(texts.addContactTitle, texts.contactUnavailable);
      return;
    }

    try {
      setAddContactSaving(true);

      const saved = await upsertCustomMessengerContact({
        id: resolvedPeerUserId || resolvedChatId || undefined,
        chatId: resolvedChatId || undefined,
        name: contactName,
        phone: phone || undefined,
        username: username || undefined,
        verified: Boolean(meta.verified),
        official: false,
        avatarLetter: resolveAvatarLetter({
          avatarLetter: meta.avatarLetter,
          name: contactName,
        }),
        avatarUrl: headerAvatarUri || undefined,
        roomType: "direct",
        source: "custom",
        currentUserId: transportUserId || routeUserId || undefined,
        peerUserId: resolvedPeerUserId,
      });

      await registerPersistedChatRoom({
        chatId: saved.chatId,
        name: saved.name,
        subtitle: saved.phone || saved.username || headerSubtitleText || texts.contactTitle,
        roomType: saved.roomType,
        verified: Boolean(saved.verified),
        avatarLetter: saved.avatarLetter,
        phone: saved.phone || undefined,
        username: saved.username || undefined,
        currentUserId: saved.currentUserId || transportUserId || routeUserId || undefined,
        peerUserId: saved.peerUserId || resolvedPeerUserId || undefined,
        avatarUrl: saved.avatarUrl || headerAvatarUri || undefined,
        photoUrl: saved.avatarUrl || headerAvatarUri || undefined,
        hiddenFromMain: false,
        deleted: false,
        forceVisibleInMain: true,
      });

      const savedContactSettingKeys = Array.from(
        new Set([chatId, resolvedChatId, saved.chatId].map((item) => String(item || "").trim()).filter(Boolean)),
      );
      savedContactSettingKeys.forEach((key) => setChatSavedToSystemContacts(key, true));

      setSettingsVersion((current) => current + 1);
      setAddContactVisible(false);
      showNotice(texts.contactSavedInContacts || texts.contactSavedInMessenger);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      Alert.alert(texts.addContactTitle, message || texts.contactUnavailable);
    } finally {
      setAddContactSaving(false);
    }
  }, [
    activePeerId,
    addContactName,
    addContactPhone,
    addContactSaving,
    addContactUsername,
    chatId,
    headerAvatarUri,
    headerSubtitleText,
    isBotRoom,
    meta.avatarLetter,
    meta.verified,
    presencePeerId,
    roomType,
    routeChatId,
    routePeerId,
    routeUserId,
    texts.addContactTitle,
    texts.contactNameRequired,
    texts.contactSavedInContacts,
    texts.contactSavedInMessenger,
    texts.contactTitle,
    texts.contactUnavailable,
    transportChatId,
    transportUserId,
  ]);

  const openTool = async (toolId: RoomSettingsActionId) => {
    setSettingsVisible(false);

    if (toolId === "ai") {
      router.push("/profile/ai" as never);
      showNotice(texts.aiReady || texts.aiTitle);
      return;
    }

    if (toolId === "editor") {
      openChatPartnerInfo();
      return;
    }

    if (toolId === "channel_add_to_chats") {
      const targetChatId = transportChatId || routeChatId || chatId;
      const roomSnapshot = {
        chatId: targetChatId,
        roomId: targetChatId,
        id: targetChatId,
        name: meta.name,
        title: meta.name,
        subtitle: routeSubtitleText || routeHandle || channelShareLink || undefined,
        roomType: "channel",
        type: "channel",
        verified: Boolean(meta.verified),
        avatarLetter: resolveAvatarLetter(meta),
        avatarUrl: headerAvatarUri || undefined,
        photoUrl: headerAvatarUri || undefined,
        currentUserId: transportUserId || routeUserId || undefined,
        username: routeHandle || undefined,
        handle: routeHandle || undefined,
        inviteLink: channelShareLink || undefined,
        channelInviteLink: channelShareLink || undefined,
        channelBotId: channelLinkedBotId || undefined,
        channelBotHandle: channelLinkedBotHandle || undefined,
        linkedBotId: channelLinkedBotId || undefined,
        linkedBotHandle: channelLinkedBotHandle || undefined,
        hiddenFromMain: false,
        deleted: false,
        forceVisibleInMain: true,
        membershipStatus: "subscriber",
        channelAccess: channelActorCanPost ? "owner" : "subscriber",
        canSendMessages: channelActorCanPost ? "1" : "0",
        canSendText: channelActorCanPost ? "1" : "0",
        canSendMedia: channelActorCanPost ? "1" : "0",
        updatedAt: new Date().toISOString(),
      };

      setChatAddedToList(targetChatId, true);
      await registerPersistedChatRoom(roomSnapshot as any);
      await ensureMessengerKernelRoomSnapshot(roomSnapshot as any);
      setSettingsVersion((current) => current + 1);
      showNotice(texts.channelAddedToChats || texts.addedToList);
      return;
    }

    if (toolId === "channel_share" || toolId === "channel_recommend") {
      if (!channelShareLink) {
        showNotice(texts.channelInviteMissing);
        return;
      }

      try {
        await Share.share({ message: [meta.name, channelShareLink].filter(Boolean).join("\n") });
        showNotice(texts.channelShareReady);
      } catch {
        Alert.alert(meta.name || "Sabi", channelShareLink);
      }
      return;
    }

    if (toolId === "channel_open_bot") {
      if (!channelLinkedBotId) {
        showNotice(texts.channelBotMissing);
        return;
      }

      await openMessengerRoom({
        chatId: channelLinkedBotId,
        roomId: channelLinkedBotId,
        id: channelLinkedBotId,
        name: channelLinkedBotHandle || channelLinkedBotId,
        title: channelLinkedBotHandle || channelLinkedBotId,
        roomType: "bot",
        type: "bot",
        isBot: "1",
        botId: channelLinkedBotId,
        botHandle: channelLinkedBotHandle || undefined,
        peerUserId: channelLinkedBotId,
        currentUserId: transportUserId || routeUserId || undefined,
        markRead: true,
      } as any);
      return;
    }

    if (toolId === "group_add_member") {
      openChatPartnerInfo({
        openGroupSettings: "1",
        openGroupMembers: "1",
      });
      return;
    }

    if (toolId === "group_invite") {
      const link = getGroupInviteLink(routeChatId || chatId) || groupInviteLink;
      if (!link) {
        showNotice(texts.groupInviteMissing);
        return;
      }

      Alert.alert(texts.groupInviteReady, link);
      return;
    }

    if (toolId === "group_share") {
      const link = getGroupInviteLink(routeChatId || chatId) || groupInviteLink;
      if (!link) {
        showNotice(texts.groupInviteMissing);
        return;
      }

      try {
        await Share.share({ message: [meta.name, link].filter(Boolean).join("\n") });
        showNotice(texts.groupShareReady);
      } catch {
        Alert.alert(texts.groupInviteReady, link);
      }
      return;
    }

    if (toolId === "add_contact") {
      openAddContactForm();
      return;
    }

    if (toolId === "add_to_list") {
      const next = !Boolean(roomSettingsState.addedToList);
      setChatAddedToList(chatId, next);
      setSettingsVersion((current) => current + 1);
      showNotice(next ? texts.addedToList : texts.removedFromList);
      return;
    }

    if (toolId === "mute") {
      const next = !roomSettingsState.notifications.muted;
      setChatMuted(chatId, next);
      setRoomMuted(next);
      setSettingsVersion((current) => current + 1);
      showNotice(next ? texts.mutedEnabled : texts.mutedDisabled);
      return;
    }

    if (toolId === "disappearing") {
      const next = !roomSettingsState.privacy.disappearingEnabled;
      setChatDisappearingEnabled(chatId, next);
      setSettingsVersion((current) => current + 1);
      showNotice(next ? texts.disappearingEnabled : texts.disappearingDisabled);
      return;
    }

    if (toolId === "report") {
      markChatReported(chatId);
      setSettingsVersion((current) => current + 1);
      router.push({
        pathname: "/chat-report" as any,
        params: {
          chatId,
          chatName: meta.name,
          roomType,
          reporterUserId: transportUserId || undefined,
          targetUserId: presencePeerId || undefined,
        },
      } as any);
      return;
    }

    if (toolId === "block") {
      const next = !roomSettingsState.block.isBlocked;
      setChatBlocked(chatId, next);
      void setMessengerKernelRoomBlocked(chatId, next, next ? transportUserId || null : null).catch(() => undefined);
      setSettingsVersion((current) => current + 1);
      showNotice(next ? texts.blockActionDone : texts.unblockActionDone);
      return;
    }

    if (toolId === "hide_conversation" || toolId === "clear_chat") {
      const clearAt = await clearPersistedChatMessagesForUser(
        transportChatId,
        transportUserId,
        Date.now(),
      );
      const messageIds = kernelRoomMessages
        .map((item) => String(item.id || item.messageId || "").trim())
        .filter(Boolean);

      const hiddenIds = messageIds.length
        ? await persistClearedChatHiddenMessageIds(transportChatId, transportUserId, messageIds)
        : await hydratePersistedChatHiddenMessageIds(transportChatId, transportUserId);

      clearMessengerKernelRoomMessagesForMe(transportChatId);
      setChatClearAtMs(clearAt);
      setChatClearedMessageIds(hiddenIds);
      setSelectedMessage(null);
      setSelectedMessageIds([]);
      setReplyTarget(null);
      setEditingMessageId(null);
      setDraft("");
      resetComposer();
      showNotice(toolId === "hide_conversation" ? texts.conversationHidden : texts.chatCleared);
      return;
    }

    if (toolId === "export_chat") {
      try {
        await shareChatExport({
          fileName: `${meta.name || "chat-export"}.txt`,
          mimeType: "text/plain",
          content: messages
            .map((item) => {
              const sender = item.mine ? texts.you : meta.name;
              return `[${item.time}] ${sender}: ${item.text}`;
            })
            .join("\n"),
        });
        showNotice(texts.chatExported);
      } catch (error) {
        Alert.alert(
          texts.messageTitle,
          error instanceof Error ? error.message : texts.chatExported,
        );
      }
      return;
    }

    if (toolId === "add_to_home") {
      try {
        markHomeShortcutPinned(chatId);
        setSettingsVersion((current) => current + 1);
        showNotice(texts.homeShortcutPinned);
      } catch {
        showNotice(texts.homeShortcutUnsupported);
      }
      return;
    }
  };

  const handleAttachmentSelect = async (id: AttachmentActionId) => {
    setAttachmentSheetVisible(false);

    if (!roomCapabilities.canSendMedia && id !== "fiat" && id !== "coin") {
      showNotice(texts.readOnlySubtitle);
      return;
    }

    if (id === "camera") {
      try {
        await stopTransientMediaPlayback();
        Keyboard.dismiss();
        setComposerPanel(null);
        setVideoCaptureVisible(false);
        setPhotoCaptureVisible(false);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setPhotoCaptureVisible(true);
          });
        });
      } catch (error) {
        Alert.alert(texts.photoTitle, error instanceof Error ? error.message : texts.mediaCaptureFailed);
      }
      return;
    }

    if (id === "gallery") {
      try {
        await stopTransientMediaPlayback();
        Keyboard.dismiss();
        const picked = await pickGalleryAsset();
        await sendPickedChatMediaAsset(picked);
      } catch (error) {
        Alert.alert(texts.galleryTitle, error instanceof Error ? error.message : texts.galleryAccessError);
      }
      return;
    }

    if (id === "document") {
      await stopTransientMediaPlayback();
      setDocumentSheetVisible(true);
      return;
    }

    if (id === "location") {
      await stopTransientMediaPlayback();
      setLocationSheetVisible(true);
      return;
    }

    if (id === "contact") {
      await stopTransientMediaPlayback();
      openContactSourceSheet();
      return;
    }

    if (id === "fiat") {
      router.push({
        pathname: "/wallet/chat-payments",
        params: {
          source: "sabi_wallet",
          method: "id",
          entry: "messenger",
        },
      });
      showNotice(texts.openingWalletFiat);
      return;
    }

    if (id === "coin") {
      router.push("/wallet/coin");
      showNotice(texts.openingCoinWallet);
      return;
    }

    if (id === "catalog" || id === "poll" || id === "event") {
      return;
    }

    const noticeMap: Record<string, string> = {
      camera: "",
      gallery: "",
      document: "",
      location: "",
      contact: "",
    };

    if (noticeMap[id]) showNotice(noticeMap[id]);
  };

  const overflowActions: OverflowAction[] = selectedMessage
    ? [
        ...(selectedMessage.kind === "image" || selectedMessage.kind === "video"
          ? [{ id: "save", label: texts.save, icon: "download-outline" as const }]
          : []),
        ...(selectedMessage.kind === "link"
          ? [{ id: "link", label: texts.link, icon: "link-outline" as const }]
          : []),
        ...(!selectedMessage.mine
          ? [{ id: "reply", label: texts.replyAction, icon: "arrow-undo-outline" as const }]
          : []),
        ...(String(selectedMessage.text ?? "").trim()
          ? [{ id: "translate", label: texts.translateAction, icon: "language-outline" as const }]
          : []),
        { id: "delete_me", label: texts.deleteMe, icon: "trash-outline" as const, danger: true },
        ...(selectedMessage.mine
          ? [{ id: "delete_all", label: texts.deleteAllAction, icon: "trash-outline" as const, danger: true }]
          : []),
      ]
    : [];

  const handleTopBarAction = (key: TopActionKey) => {
    if (key === "reply") return handleReply();
    if (key === "edit") return handleEdit();
    if (key === "copy") return void handleCopy();
    if (key === "translate") return void handleTranslateSelectedMessage();
    if (key === "forward") return handleForward();
    if (key === "delete") return startSelectionMode("delete");
    if (key === "more") return setOverflowVisible(true);
  };



  const getSelectedLinkUrl = () => {
    const raw =
      selectedMessage?.linkPreview?.url?.trim() ||
      selectedMessage?.text?.trim() ||
      resolveMessageOpenUri(selectedMessage) ||
      "";
    if (/^https?:\/\//i.test(raw)) return raw;
    if (/^[\w.-]+\.[A-Za-z]{2,}(\/.*)?$/i.test(raw)) return `https://${raw}`;
    return "";
  };

  const handleOpenSelectedLink = async () => {
    const url = getSelectedLinkUrl();
    if (!url) return;
    await Linking.openURL(url);
    showNotice(texts.link);
  };

  const handleSaveSelectedMedia = async (target: "sabi" | "phone") => {
    const message = selectedMessage;
    if (!message) return;
    const mediaUri = resolveMessageAttachmentUri(message);
    if (!mediaUri) return;

    const kind = message.kind === "video" ? "video" : message.kind === "image" ? "image" : "media";
    const payload = {
      uri: mediaUri,
      name: message.previewTitle || message.fileLabel || message.text || texts.mediaSaved,
      kind,
      mimeType: (message as any).mimeType,
    };

    if (target === "sabi" && (kind === "image" || kind === "video")) {
      await saveAttachmentToSabiGallery(payload);
      showNotice(texts.mediaSavedToSabi);
      return;
    }

    await saveAttachmentToPhone(payload);
    showNotice(texts.mediaSavedToPhone);
  };

  const handleSavePreviewImage = async (target: "sabi" | "phone") => {
    if (!imagePreviewUri) return;

    const payload = {
      uri: imagePreviewUri,
      name: imagePreviewTitle || texts.photoTitle,
      kind: "image",
      mimeType: "image/*",
    };

    if (target === "sabi") {
      await saveAttachmentToSabiGallery(payload);
      showNotice(texts.mediaSavedToSabi);
      return;
    }

    await saveAttachmentToPhone(payload);
    showNotice(texts.mediaSavedToPhone);
  };

  const openPreviewImageSaveChoice = () => {
    if (!imagePreviewUri) return;
    Alert.alert(texts.saveMediaChooseTitle, imagePreviewTitle || texts.photoTitle, [
      {
        text: texts.saveToSabiApp,
        onPress: () => {
          void handleSavePreviewImage("sabi").catch((error) => {
            Alert.alert(texts.photoTitle, error instanceof Error ? error.message : texts.photoSaveError);
          });
        },
      },
      {
        text: texts.saveToPhone,
        onPress: () => {
          void handleSavePreviewImage("phone").catch((error) => {
            Alert.alert(texts.photoTitle, error instanceof Error ? error.message : texts.photoSaveError);
          });
        },
      },
      { text: texts.cancel, style: "cancel" },
    ]);
  };

  const handleOverflowSelect = (id: string) => {
    if (id === "save") {
      setOverflowVisible(false);
      setSaveSheetVisible(true);
      return;
    }
    if (id === "link") {
      setOverflowVisible(false);
      setLinkSheetVisible(true);
      return;
    }
    if (id === "reply") return handleReply();
    if (id === "translate") return void handleTranslateSelectedMessage();
    if (id === "delete_me") return handleDelete("me");
    if (id === "delete_all") return handleDelete("all");
    closeSelection();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <LinearGradient
        colors={backgroundPreset.screenGradient}
        start={{ x: 0.04, y: 0.02 }}
        end={{ x: 0.96, y: 1 }}
        style={styles.background}
      >
        {messengerThemeState.wallpaperUri ? (
          <ImageBackground
            source={{ uri: messengerThemeState.wallpaperUri }}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
          />
        ) : null}

        {!messengerThemeState.wallpaperUri ? (
          <>
            <View style={[styles.topGlow, { backgroundColor: backgroundPreset.topGlow }]} />
            <View style={[styles.sideGlow, { backgroundColor: backgroundPreset.sideGlow }]} />
            <View
              style={[
                styles.leftGlow,
                { backgroundColor: backgroundPreset.leftMidGlow ?? `${backgroundPreset.accent}16` },
              ]}
            />
            <View style={[styles.bottomGlow, { backgroundColor: backgroundPreset.bottomGlow }]} />
          </>
        ) : null}

        {notice ? (
          <View style={styles.noticeFloatWrap} pointerEvents="none">
            <LinearGradient
              colors={backgroundPreset.cardGradient}
              style={[styles.noticeFloat, { borderColor: `${backgroundPreset.accent}20` }]}
            >
              <BadgeCheck size={14} strokeWidth={2.3} color={backgroundPreset.accent} />
              <Text style={styles.noticeFloatText}>{notice}</Text>
            </LinearGradient>
          </View>
        ) : null}

        <View style={styles.headerWrap}>
          <View style={styles.header}>
            <GlassCircleActionButton
              onPress={() => router.back()}
              colors={backgroundPreset.cardGradient}
              style={styles.headerGlassButton}
            >
              <ArrowLeft size={20} strokeWidth={2.3} color="#F6FFF9" />
            </GlassCircleActionButton>

            <Pressable onPress={() => openChatPartnerInfo()} style={styles.headerCenterPressable}>
              {({ pressed }) => (
                <View style={[styles.headerCenter, pressed ? styles.pressView : undefined]}>
                  <View style={styles.avatar}>
                    {headerAvatarUri ? (
                      <Image source={{ uri: headerAvatarUri }} style={styles.avatarImage} />
                    ) : (
                      <LinearGradient colors={backgroundPreset.previewGradient} style={styles.avatarFallback}>
                        <Text style={styles.avatarText}>
                          {resolveAvatarLetter(meta)}
                        </Text>
                      </LinearGradient>
                    )}
                  </View>

                  <View style={styles.headerTitleWrap}>
                    <View style={styles.headerNameRow}>
                      <Text style={styles.headerTitle} numberOfLines={1}>{meta.name}</Text>
                      {meta.verified ? (
                        <BadgeCheck
                          size={15}
                          strokeWidth={2.2}
                          color={backgroundPreset.accent}
                          style={styles.verifiedIcon}
                        />
                      ) : null}
                    </View>

                    <View style={styles.headerSubRow}>
                      {roomCapabilities.showPresence ? (
                        <View
                          style={[styles.onlineDot, { backgroundColor: presenceDotColor }]}
                        />
                      ) : null}
                      <Text style={styles.headerSubtitle} numberOfLines={1}>{headerSubtitleText}</Text>
                    </View>
                  </View>
                </View>
              )}
            </Pressable>

            <View style={styles.headerActions}>
              {roomCapabilities.canCall ? (
                <GlassCircleActionButton
                  onPress={() =>
                    router.push({
                      pathname: "/calls/audio" as any,
                      params: {
                        id: chatId,
                        chatId: routeChatId,
                        userId: transportUserId || undefined,
                        selfId: transportUserId || undefined,
                        peerId: directCallPeerId,
                        peerUserId: directCallPeerId,
                        partnerId: directCallPeerId,
                        targetUserId: directCallPeerId,
                        roomType,
                        kind: "audio",
                        type: "audio",
                        callKind: "audio",
                        callType: "audio",
                        name: meta.name,
                        handle: directCallHandle,
                        phone: directCallPhone,
                        avatarLetter: resolveAvatarLetter(meta),
                        avatarUrl: headerAvatarUri || undefined,
                        photoUrl: headerAvatarUri || undefined,
                        verified: meta.verified ? "1" : "0",
                        status: isPeerOnline ? texts.online : headerSubtitleText,
                        subtitle: headerSubtitleText,
                      },
                    })
                  }
                  colors={backgroundPreset.actionGradient}
                  animated
                  style={styles.headerGlassButton}
                >
                  <MessengerBrandIcon
                    icon="messenger_audio_call"
                    tone="active"
                    size={18}
                    color={backgroundPreset.actionIconColor}
                  />
                </GlassCircleActionButton>
              ) : null}

              <GlassCircleActionButton
                onPress={secondaryHeaderAction}
                colors={backgroundPreset.actionGradient}
                animated
                style={styles.headerGlassButton}
              >
                {renderRoomInfoIcon(18, "#F8FFF9")}
              </GlassCircleActionButton>

              <GlassCircleActionButton
                onPress={() => setSettingsVisible(true)}
                colors={backgroundPreset.cardGradient}
                style={styles.headerGlassButton}
              >
                <MoreHorizontal size={18} strokeWidth={2.3} color="#F6FFF9" />
              </GlassCircleActionButton>
            </View>
          </View>
        </View>

        <View style={styles.messagesWrap}>
          <ScrollView keyboardDismissMode="on-drag"
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.messagesContent, { paddingBottom: listBottomPadding }]}
            onScroll={handleMessagesScroll}
            onScrollBeginDrag={() => {
              shouldAutoScrollOnContentSizeRef.current = false;
            }}
            scrollEventThrottle={80}
            onContentSizeChange={(contentWidth, contentHeight) => {
              scrollMetricsRef.current = {
                ...scrollMetricsRef.current,
                contentHeight: Number(contentHeight ?? 0),
              };

              const hasMessages = messages.length > 0;
              const hasContent = Number(contentHeight ?? 0) > 0;
              if (!initialScrollToLatestDoneRef.current && hasMessages && hasContent) {
                initialScrollToLatestDoneRef.current = true;
                shouldAutoScrollOnContentSizeRef.current = false;

                const runInitialScroll = () => {
                  scrollRef.current?.scrollToEnd({ animated: false });
                  updateNearLatestFromMetrics();
                };

                requestAnimationFrame(runInitialScroll);
                if (initialScrollToLatestTimerRef.current) {
                  clearTimeout(initialScrollToLatestTimerRef.current);
                }
                initialScrollToLatestTimerRef.current = setTimeout(() => {
                  initialScrollToLatestTimerRef.current = null;
                  runInitialScroll();
                }, 180);
                return;
              }

              if (!shouldAutoScrollOnContentSizeRef.current) {
                updateNearLatestFromMetrics();
                return;
              }

              shouldAutoScrollOnContentSizeRef.current = false;
              updateNearLatestFromMetrics();
            }}
          >
            <View style={styles.noticeWrap}>
              <LinearGradient
                colors={backgroundPreset.cardGradient}
                style={[styles.noticeCard, { borderColor: `${backgroundPreset.accent}18` }]}
              >
                <Lock size={14} strokeWidth={2.3} color={backgroundPreset.accent} />
                <Text style={styles.noticeText}>{texts.encrypted}</Text>
              </LinearGradient>
            </View>

            {messages.map((message) => {
              const mine = message.mine;
              const displayDate = message.date;

              return (
                <View key={message.id}>
                  {displayDate ? (
                    <View style={styles.dateWrap}>
                      <View style={styles.datePill}>
                        <Text style={styles.dateText}>{displayDate}</Text>
                      </View>
                    </View>
                  ) : null}

                  <View
                    style={[
                      styles.messageRow,
                      mine ? styles.messageRowMine : styles.messageRowOther,
                    ]}
                  >
                    <Pressable
                      ref={(node) => registerBubbleRef(message.id, node)}
                      delayLongPress={220}
                      onPress={(event) => openQuickReactionTap(message, event)}
                      onLongPress={() => openMessageActionsLongPress(message)}
                      onLayout={(event) =>
                        registerBubbleLayout(message.id, event.nativeEvent.layout)
                      }
                      style={({ pressed }) => pressedViewStyle(pressed)}
                    >
                      <MessageBubble
                        message={message}
                        mine={mine}
                        accent={backgroundPreset.accent}
                        preset={backgroundPreset}
                        selected={selectedMessage?.id === message.id}
                        selectedForSelection={selectedMessageIds.includes(message.id)}
                        activeAudioMessageId={audioPlayingMessageId}
                        audioIsPlaying={audioIsPlaying}
                        audioPositionMs={audioPositionMs}
                        audioDurationMs={audioDurationMs}
                        audioRate={audioRate}
                        onAudioPlayPause={playPauseAudioMessage}
                        onAudioSeek={seekAudioMessage}
                        onAudioRateChange={changeAudioRate}
                        activeVideoMessageId={activeInlineVideoId}
                        videoIsPlaying={inlineVideoPlaying}
                        onVideoToggle={toggleInlineVideoPlayback}
                        onVideoStatus={handleInlineVideoStatus}
                        labels={{
                          contactCard: texts.contactCard,
                          editedLabel: texts.editedLabel,
                          mapLabel: texts.mapLabel,
                          fileBadgeGeneric: texts.fileBadgeGeneric,
                          translatingInline: texts.translatingInline,
                          translatedInline: texts.translatedInline,
                          translationFailed: texts.translationFailed,
                        }}
                        inlineTranslation={inlineTranslationsByMessageId[message.id] ?? null}
                      />
                    </Pressable>

                    {message.reaction ? (
                      <View
                        style={[
                          styles.reactionPill,
                          mine ? styles.reactionPillMine : styles.reactionPillOther,
                        ]}
                      >
                        <Text style={styles.reactionPillText}>{message.reaction}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={[styles.composerLayer, { bottom: composerBottom }]}> 
          {replyTarget || editingMessageId ? (
            <LinearGradient
              colors={backgroundPreset.cardGradient}
              style={[styles.composerModeCard, { borderColor: `${backgroundPreset.accent}18` }]}
            >
              <View
                style={[styles.composerModeLine, { backgroundColor: backgroundPreset.accent }]}
              />
              <View style={styles.composerModeTextWrap}>
                <Text style={styles.composerModeTitle}>
                  {editingMessageId ? texts.editingTitle : texts.replyingTitle}
                </Text>
                <Text style={styles.composerModeSubtitle} numberOfLines={1}>
                  {editingMessageId
                    ? texts.editingSubtitle
                    : replyTarget
                      ? `${replyTarget.mine ? texts.you : meta.name}: ${replyTarget.text}`
                      : ""}
                </Text>
              </View>

              <Pressable style={styles.composerModeClose} onPress={cancelComposerMode}>
                {({ pressed }) => (
                  <View style={[styles.composerModeCloseInner, pressedViewStyle(pressed)]}>
                    <X size={16} strokeWidth={2.3} color={TEXT_MAIN} />
                  </View>
                )}
              </Pressable>
            </LinearGradient>
          ) : null}

          {composerPanel === "media" ? (
            <View style={styles.panelWrap}>
              <LinearGradient
                colors={backgroundPreset.cardGradient}
                style={[styles.panelCard, styles.mediaPanelCard, { borderColor: `${backgroundPreset.accent}20` }]}
              >
                <Pressable
                  onPressIn={startVoiceHoldRecording}
                  onPressOut={stopVoiceHoldRecording}
                  delayLongPress={0}
                  style={styles.mediaToolWrap}
                >
                  {({ pressed }) => (
                    <LinearGradient
                      colors={
                        isVoiceRecording
                          ? ["rgba(158,72,82,0.98)", "rgba(72,30,36,0.92)"]
                          : backgroundPreset.actionGradient
                      }
                      style={[styles.mediaToolButton, styles.mediaToolRaised, pressedViewStyle(pressed)]}
                    >
                      <View style={styles.mediaToolGloss} />
                      <MessengerBrandIcon icon="messenger_voice_message" tone={isVoiceRecording ? "danger" : "active"} size={18} color={isVoiceRecording ? "#FFF4F4" : "#062019"} />
                      {isVoiceRecording ? <View style={styles.mediaLiveDot} /> : null}
                    </LinearGradient>
                  )}
                </Pressable>

                <Pressable onPress={() => sendQuickMedia("video")} style={styles.mediaToolWrap}>
                  {({ pressed }) => (
                    <LinearGradient
                      colors={backgroundPreset.actionGradient}
                      style={[styles.mediaToolButton, styles.mediaToolRaised, pressedViewStyle(pressed)]}
                    >
                      <View style={styles.mediaToolGloss} />
                      <MessengerBrandIcon
                        icon="messenger_video_message"
                        tone="active"
                        size={18}
                        color="#062019"
                      />
                    </LinearGradient>
                  )}
                </Pressable>

                <Pressable onPress={() => void sendCurrentLocation()} onLongPress={() => void toggleLiveLocation()} delayLongPress={450} style={styles.mediaToolWrap}>
                  {({ pressed }) => (
                    <LinearGradient
                      colors={backgroundPreset.actionGradient}
                      style={[styles.mediaToolButton, styles.mediaToolRaised, pressedViewStyle(pressed)]}
                    >
                      <View style={styles.mediaToolGloss} />
                      <MapPin size={18} strokeWidth={2.6} color="#062019" />
                      {isLiveLocationActive ? <View style={styles.mediaLiveDot} /> : null}
                    </LinearGradient>
                  )}
                </Pressable>
                <Pressable onPress={openAnimatedHub} style={styles.mediaToolWrap}>
                  {({ pressed }) => (
                    <LinearGradient
                      colors={backgroundPreset.actionGradient}
                      style={[styles.mediaToolButton, styles.mediaToolRaised, pressedViewStyle(pressed)]}
                    >
                      <View style={styles.mediaToolGloss} />
                      <MessengerBrandIcon
                        icon="messenger_reactions"
                        tone="active"
                        size={18}
                        color="#062019"
                      />
                    </LinearGradient>
                  )}
                </Pressable>

                <Pressable onPress={openGift3DPremiumDirect} style={styles.mediaToolWrap}>
                  {({ pressed }) => (
                    <LinearGradient
                      colors={["rgba(255,222,129,0.98)", "rgba(211,168,83,0.92)"]}
                      style={[styles.mediaToolButton, styles.mediaToolRaised, pressedViewStyle(pressed)]}
                    >
                      <View style={styles.mediaToolGloss} />
                      <MessengerBrandIcon
                        icon="messenger_gifts"
                        tone="premium"
                        size={18}
                        color="#201205"
                      />
                      <View style={styles.mediaDiamondBadge}>
                        <Sparkles size={9} strokeWidth={2.5} color="#FFF9EA" />
                      </View>
                    </LinearGradient>
                  )}
                </Pressable>

                <Pressable onPress={() => setComposerPanel(null)} style={styles.mediaCloseWrap}>
                  {({ pressed }) => (
                    <LinearGradient
                      colors={backgroundPreset.cardGradient}
                      style={[styles.mediaCloseButton, styles.mediaToolRaised, pressedViewStyle(pressed)]}
                    >
                      <View style={styles.mediaToolGloss} />
                      <ChevronDown size={18} strokeWidth={2.3} color="#F7FFFC" />
                    </LinearGradient>
                  )}
                </Pressable>
              </LinearGradient>

              {isVoiceRecording || pendingVoiceMessage ? (
                <LinearGradient
                  colors={backgroundPreset.cardGradient}
                  style={[styles.inlineVoiceStatusCard, { borderColor: isVoiceRecording ? "rgba(255,140,140,0.28)" : `${backgroundPreset.accent}18` }]}
                >
                  <View style={[styles.inlineVoiceStatusLine, { backgroundColor: isVoiceRecording ? "#FF8C8C" : backgroundPreset.accent }]} />
                  <View style={styles.inlineVoiceStatusTextWrap}>
                    <Text style={styles.inlineVoiceStatusTitle}>
                      {isVoiceRecording
                        ? texts.voiceRecordingTitle
                        : isSendingPendingVoice
                          ? texts.voiceSent
                          : texts.voiceReadyInline}
                    </Text>
                    <Text style={styles.inlineVoiceStatusSubtitle} numberOfLines={1}>
                      {isVoiceRecording
                        ? texts.voiceRecordingSubtitle
                        : pendingVoiceMessage
                          ? `${pendingVoiceMessage.durationLabel} · ${isSendingPendingVoice ? texts.voiceSent : texts.tapSend}`
                          : ""}
                    </Text>
                  </View>

                  <Pressable
                    disabled={isSendingPendingVoice}
                    onPress={() => {
                      if (isSendingPendingVoice) return;
                      setPendingVoiceMessage(null);
                      recordingRef.current = null;
                      setIsVoiceRecording(false);
                    }}
                    style={styles.inlineVoiceStatusCloseWrap}
                  >
                    {({ pressed }) => (
                      <View style={[styles.inlineVoiceStatusClose, pressedViewStyle(pressed)]}>
                        <X size={14} strokeWidth={2.3} color={TEXT_MAIN} />
                      </View>
                    )}
                  </Pressable>
                </LinearGradient>
              ) : null}
            </View>
          ) : null}

{roomCapabilities.isReadOnly || roomSettingsState.block.isBlocked ? (
  <LinearGradient
    colors={backgroundPreset.composerGradient}
    style={[styles.composerBar, styles.readOnlyComposerBar]}
  >
    <View style={styles.readOnlyComposerIconWrap}>
      <Lock size={16} strokeWidth={2.3} color={TEXT_MAIN} />
    </View>

    <View style={styles.readOnlyComposerTextWrap}>
      <Text style={styles.readOnlyComposerTitle}>{texts.readOnlyTitle}</Text>
      <Text style={styles.readOnlyComposerSubtitle} numberOfLines={2}>
        {texts.readOnlySubtitle}
      </Text>
    </View>

    <Pressable onPress={() => openChatPartnerInfo()} style={styles.readOnlyComposerActionWrap}>
      {({ pressed }) => (
        <LinearGradient
          colors={backgroundPreset.actionGradient}
          style={[styles.readOnlyComposerAction, pressedViewStyle(pressed)]}
        >
          <View style={styles.buttonGloss} />
          {renderRoomInfoIcon(16, "#F1FFF9")}
        </LinearGradient>
      )}
    </Pressable>
  </LinearGradient>
) : (
  <LinearGradient colors={backgroundPreset.composerGradient} style={styles.composerBar}>
    <Pressable onPress={() => setAttachmentSheetVisible(true)} style={styles.attachButtonWrap}>
      {({ pressed }) => (
        <LinearGradient
          colors={backgroundPreset.actionGradient}
          style={[styles.attachButton, pressedViewStyle(pressed)]}
        >
          <View style={styles.buttonGloss} />
          <MessengerBrandIcon icon="messenger_attachment" tone="default" size={20} color={TEXT_MAIN} />
        </LinearGradient>
      )}
    </Pressable>

    <View
      style={[
        styles.inputWrap,
        {
          minHeight: composerFieldHeight,
          backgroundColor: backgroundPreset.inputSurface,
          borderColor: backgroundPreset.inputStroke,
          paddingVertical: composerFieldPaddingVertical,
        },
      ]}
    >
      <TextInput
        ref={inputRef}
        value={draft}
        onChangeText={setDraft}
        onContentSizeChange={handleInputSizeChange}
        onFocus={() => {
          setInputFocused(true);
          // Keep current scroll position on input focus.
        }}
        onBlur={() => {
          setInputFocused(false);
          // Do not auto-scroll on keyboard close. Keep reader position stable.
        }}
        placeholder={
          editingMessageId
            ? texts.editPlaceholder
            : replyTarget
              ? texts.replyPlaceholder
              : texts.messagePlaceholder
        }
        placeholderTextColor="rgba(232,255,246,0.42)"
        multiline
        scrollEnabled={inputHeight >= MAX_INPUT_HEIGHT}
        textAlignVertical="top"
        style={[styles.input, { height: inputHeight }]}
      />
    </View>

    <Pressable
      onPress={() => {
        setComposerPanel(null);
        setStickerTarget("composer");
        setStickerSheetVisible(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      }}
      style={styles.smallToolWrap}
    >
      {({ pressed }) => (
        <LinearGradient
          colors={backgroundPreset.actionGradient}
          style={[styles.smallToolButton, pressedViewStyle(pressed)]}
        >
          <View style={styles.buttonGloss} />
          <ComposerStickerButtonIcon />
        </LinearGradient>
      )}
    </Pressable>

    <RNAnimated.View
      style={[styles.sendButtonAnimatedWrap, styles.sendButtonGlowBase, sendButtonAnimatedStyle]}
    >
      <Pressable
        disabled={isSendingPendingVoice}
        onPress={draft.trim() || pendingVoiceMessage ? () => void handleSend() : openMediaComposer}
        style={styles.sendButtonWrap}
      >
        {({ pressed }) => (
          <LinearGradient
            colors={backgroundPreset.actionGradient}
            style={[styles.sendButton, pressedViewStyle(pressed), isSendingPendingVoice ? styles.sendButtonDisabled : undefined]}
          >
            <View style={styles.buttonGloss} />
            {draft.trim() || pendingVoiceMessage ? (
              <Send size={18} strokeWidth={2.3} color="#F1FFF9" />
            ) : (
              <MessengerBrandIcon icon="messenger_gallery" tone="default" size={18} color="#F1FFF9" />
            )}
            {!draft.trim() && !pendingVoiceMessage ? (
              <Text style={styles.aiButtonLabel}>{texts.mediaLabel}</Text>
            ) : null}
          </LinearGradient>
        )}
      </Pressable>
    </RNAnimated.View>
  </LinearGradient>
) }
        </View>

        <AttachmentSheet
          visible={attachmentSheetVisible}
          accent={backgroundPreset.accent}
          accentSoft={backgroundPreset.accentSoft}
          onClose={() => setAttachmentSheetVisible(false)}
          onSelect={handleAttachmentSelect}
        />

        <DocumentQuickSheet
          visible={documentSheetVisible}
          accent={backgroundPreset.accent}
          onClose={() => setDocumentSheetVisible(false)}
          onPickDevice={async () => {
            setDocumentSheetVisible(false);
            try {
              const file = await pickPhoneDocument();
              if (!file) return;
              await sendPickedDeviceDocumentOrVideo(file);
            } catch (error) {
              Alert.alert(texts.documentsTitle, error instanceof Error ? error.message : texts.documentAccessError);
            }
          }}
          onSelect={(file) => {
            setDocumentSheetVisible(false);
            void (async () => {
              try {
                await sendPickedDeviceDocumentOrVideo({
                  name: String(file.name || "").trim() || `file-${Date.now()}`,
                  uri: String((file as any).uri || ""),
                  mimeType: (file as any).mimeType ?? null,
                  meta: file.meta,
                  kindLabel: (file as any).kindLabel ?? null,
                });
              } catch (error) {
                Alert.alert(texts.documentsTitle, error instanceof Error ? error.message : texts.documentAccessError);
              }
            })();
          }}
        />

        <LocationQuickSheet
          visible={locationSheetVisible}
          accent={backgroundPreset.accent}
          onClose={() => setLocationSheetVisible(false)}
          onUseCurrentLocation={async () => {
            setLocationSheetVisible(false);
            try {
              const item = (await pickUserLocation()) as SimpleLocation | null;
              if (!item) return;

              const hasCoords =
                typeof item.latitude === "number" && typeof item.longitude === "number";

              const latitude = hasCoords ? item.latitude : undefined;
              const longitude = hasCoords ? item.longitude : undefined;

              const subtitle =
                typeof latitude === "number" && typeof longitude === "number"
                  ? `${item.subtitle} • ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
                  : item.subtitle;

              await sendKernelMessage({
                type: "LOCATION",
                kind: "location" as any,
                text: `рџ“Ќ ${item.title}`,
                notice: texts.locationAttached,
                previewTitle: item.title,
                previewSubtitle: subtitle,
                fileLabel: item.mapLabel || texts.locationTitle,
                localUri:
                  typeof latitude === "number" && typeof longitude === "number"
                    ? buildLocationMapUrl({
                        latitude,
                        longitude,
                        title: item.title,
                      })
                    : undefined,
                latitude,
                longitude,
              });
            } catch (error) {
              Alert.alert(texts.locationTitle, error instanceof Error ? error.message : texts.locationAccessError);
            }
          }}
          onSelect={async (item: any) => {
            setLocationSheetVisible(false);
            try {
              const coords =
                resolveSavedLocationCoords(item) ||
                (typeof item.latitude === "number" && typeof item.longitude === "number"
                  ? { latitude: item.latitude, longitude: item.longitude }
                  : null);

              if (!coords) {
                Alert.alert(texts.locationTitle, texts.locationCoordsMissing);
                return;
              }

              const subtitle = `${item.subtitle} • ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;

              await sendKernelMessage({
                type: "LOCATION",
                kind: "location" as any,
                text: `рџ“Ќ ${item.title}`,
                notice: texts.locationAttached,
                previewTitle: item.title,
                previewSubtitle: subtitle,
                fileLabel: item.mapLabel || texts.locationTitle,
                localUri: buildLocationMapUrl({
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  title: item.title,
                }),
                latitude: coords.latitude,
                longitude: coords.longitude,
              });
            } catch (error) {
              Alert.alert(texts.locationTitle, error instanceof Error ? error.message : texts.locationSendError);
            }
          }}
        />

        <ContactQuickSheet
          visible={contactSheetVisible}
          accent={backgroundPreset.accent}
          title={
            contactSheetMode === "phone"
              ? texts.phoneContactsTitle
              : contactSheetMode === "sabi"
                ? texts.sabiContactsTitle
                : texts.contactTitle
          }
          subtitle={
            contactSheetMode === "phone"
              ? texts.phoneContactsSubtitle
              : contactSheetMode === "sabi"
                ? texts.sabiContactsSubtitle
                : texts.contactChooseSource
          }
          pickDeviceLabel={texts.phoneContactsTitle}
          pickDeviceSubtitle={texts.phoneContactsSubtitle}
          pickSabiLabel={texts.sabiContactsTitle}
          pickSabiSubtitle={texts.sabiContactsSubtitle}
          sectionLabel={
            contactSheetMode === "phone"
              ? texts.phoneContactsTitle
              : contactSheetMode === "sabi"
                ? texts.sabiContactsTitle
                : texts.contactsTitle
          }
          emptyLabel={contactSheetMode === "source" ? texts.contactChooseSource : texts.contactsAccessError}
          contacts={contactSheetOptions}
          loading={contactSheetLoading}
          onClose={() => setContactSheetVisible(false)}
          onPickDevice={() => {
            void loadPhoneContactOptions();
          }}
          onPickSabi={() => {
            void loadSabiContactOptions();
          }}
          onSelect={(item) => {
            setContactSheetVisible(false);
            void sendContactCard(item).catch((error) => {
              Alert.alert(texts.contactsTitle, error instanceof Error ? error.message : texts.contactsAccessError);
            });
          }}
        />

        <Modal statusBarTranslucent
          visible={addContactVisible}
          transparent
          animationType="fade"
          onRequestClose={closeAddContactForm}
        >
          <KeyboardAvoidingView
            style={styles.addContactOverlay}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          
            keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}>
<View style={[styles.addContactSheetWrap, chatRoomContactBackdropLiftStyle]}>
              <LinearGradient
                colors={backgroundPreset.cardGradient}
                style={[styles.addContactSheet, { borderColor: `${backgroundPreset.accent}24` }]}
              >
                <View style={[styles.addContactAccentLine, { backgroundColor: backgroundPreset.accent }]} />
                <View style={styles.addContactHeaderRow}>
                  <View style={styles.addContactHeaderText}>
                    <Text style={styles.addContactTitle}>{texts.addContactTitle}</Text>
                    <Text style={styles.addContactSubtitle}>{texts.addContactSubtitle}</Text>
                  </View>
                  <Pressable
                    onPress={closeAddContactForm}
                    disabled={addContactSaving}
                    style={styles.addContactCloseButton}
                  >
                    {({ pressed }) => (
                      <View style={[styles.addContactIconButton, pressedViewStyle(pressed)]}>
                        <X size={16} strokeWidth={2.3} color={TEXT_MAIN} />
                      </View>
                    )}
                  </Pressable>
                </View>

                <View style={styles.addContactFields}>
                  <View style={styles.addContactFieldBlock}>
                    <Text style={styles.addContactLabel}>{texts.addContactName}</Text>
                    <TextInput
                      value={addContactName}
                      onChangeText={setAddContactName}
                      placeholder={texts.addContactNamePlaceholder}
                      placeholderTextColor={TEXT_MUTED}
                      style={styles.addContactInput}
                      autoCapitalize="words"
                      autoCorrect={false}
                      editable={!addContactSaving}
                    />
                  </View>

                  <View style={styles.addContactFieldBlock}>
                    <Text style={styles.addContactLabel}>{texts.addContactPhone}</Text>
                    <TextInput
                      value={addContactPhone}
                      onChangeText={setAddContactPhone}
                      placeholder={texts.addContactPhonePlaceholder}
                      placeholderTextColor={TEXT_MUTED}
                      style={styles.addContactInput}
                      keyboardType="phone-pad"
                      autoCorrect={false}
                      editable={!addContactSaving}
                    />
                  </View>

                  <View style={styles.addContactFieldBlock}>
                    <Text style={styles.addContactLabel}>{texts.addContactUsername}</Text>
                    <TextInput
                      value={addContactUsername}
                      onChangeText={setAddContactUsername}
                      placeholder={texts.addContactUsernamePlaceholder}
                      placeholderTextColor={TEXT_MUTED}
                      style={styles.addContactInput}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!addContactSaving}
                    />
                  </View>
                </View>

                <View style={styles.addContactActionsRow}>
                  <Pressable
                    onPress={closeAddContactForm}
                    disabled={addContactSaving}
                    style={styles.addContactActionWrap}
                  >
                    {({ pressed }) => (
                      <LinearGradient
                        colors={backgroundPreset.cardGradient}
                        style={[
                          styles.addContactSecondaryButton,
                          { borderColor: `${backgroundPreset.accent}18` },
                          pressedViewStyle(pressed),
                        ]}
                      >
                        <Text style={styles.addContactSecondaryText}>{texts.cancel}</Text>
                      </LinearGradient>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() => void saveAddContactFromChatRoom()}
                    disabled={addContactSaving}
                    style={styles.addContactActionWrap}
                  >
                    {({ pressed }) => (
                      <LinearGradient
                        colors={backgroundPreset.actionGradient}
                        style={[styles.addContactPrimaryButton, pressedViewStyle(pressed)]}
                      >
                        <Text style={styles.addContactPrimaryText}>
                          {addContactSaving ? `${texts.addContactSave}...` : texts.addContactSave}
                        </Text>
                      </LinearGradient>
                    )}
                  </Pressable>
                </View>
              </LinearGradient>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <ChatRoomSettingsMenu
          visible={settingsVisible}
          accent={backgroundPreset.accent}
          selectedPreset={backgroundPreset}
          menuState={{
            roomType,
            canInviteToGroup: canCurrentUserInviteToGroup,
            inviteLink: groupInviteLink,
            canAddContact:
              roomType === "direct" &&
              !isBotRoom &&
              Boolean(
                meta.name ||
                  routeName ||
                  routePhone ||
                  normalizeContactPhone(getChatPhone(chatId, meta.name)) ||
                  presencePeerId ||
                  routePeerId ||
                  activePeerId ||
                  routeChatId ||
                  transportChatId,
              ),
            isAddedToList: Boolean(roomSettingsState.addedToList),
            isMuted: roomSettingsState.notifications.muted,
            isDisappearingEnabled: roomSettingsState.privacy.disappearingEnabled,
            isBlocked: roomSettingsState.block.isBlocked,
            hasSystemContact: roomSettingsState.contactSaved === true,
            isBot: isBotRoom,
            botId: routeBotId,
            botHandle: routeBotHandle,
            isBotOwnedByMe,
          }}
          onClose={() => setSettingsVisible(false)}
          onOpenTheme={() => {
            setSettingsVisible(false);
            router.push("/messenger-theme" as never);
          }}
          onSelect={openTool}
        />

        <ReactionPickerPopover
          visible={reactionVisible && !selectionMode}
          anchor={reactionAnchor}
          accent={backgroundPreset.accent}
          accentSoft={backgroundPreset.accentSoft}
          onSelect={handleReact}
          onReply={handleReply}
          onMore={() => {
            setReactionVisible(false);
            setReactionAnchor(null);
            setStickerTarget("message");
            setStickerSheetVisible(true);
          }}
          onDismiss={() => {
            setReactionVisible(false);
            setReactionAnchor(null);
          }}
        />

        {selectionMode ? (
          <View style={styles.selectionBarWrap} pointerEvents="box-none">
            <LinearGradient
              colors={["rgba(24,45,39,0.96)", "rgba(9,21,18,0.94)"]}
              style={[styles.selectionBar, { borderColor: `${backgroundPreset.accent}20` }]}
            >
              <View style={styles.selectionCountWrap}>
                <Text style={styles.selectionCount}>{selectedMessageIds.length}</Text>
                <Text style={styles.selectionLabel}>
                  {selectionMode === "delete" ? texts.selectionDelete : texts.selectionForward}
                </Text>
              </View>

              <View style={styles.selectionActions}>
                {selectionMode === "forward" ? (
                  <Pressable onPress={applyForwardSelection} style={styles.selectionActionButton}>
                    {({ pressed }) => (
                      <LinearGradient
                        colors={["rgba(66,108,96,0.88)", "rgba(18,34,30,0.82)"]}
                        style={[styles.selectionActionFill, pressedViewStyle(pressed)]}
                      >
                        <MessengerBrandIcon icon="messenger_forward" tone="default" size={16} color={TEXT_MAIN} />
                      </LinearGradient>
                    )}
                  </Pressable>
                ) : null}

                <Pressable onPress={applyDeleteSelection} style={styles.selectionActionButton}>
                  {({ pressed }) => (
                    <LinearGradient
                      colors={["rgba(112,70,70,0.92)", "rgba(54,27,27,0.86)"]}
                      style={[styles.selectionActionFill, pressedViewStyle(pressed)]}
                    >
                      <MessengerBrandIcon icon="messenger_delete_message" tone="danger" size={16} color="#FFF1F1" />
                    </LinearGradient>
                  )}
                </Pressable>

                <Pressable onPress={cancelSelectionMode} style={styles.selectionActionButton}>
                  {({ pressed }) => (
                    <LinearGradient
                      colors={["rgba(66,108,96,0.88)", "rgba(18,34,30,0.82)"]}
                      style={[styles.selectionActionFill, pressedViewStyle(pressed)]}
                    >
                      <X size={16} strokeWidth={2.3} color={TEXT_MAIN} />
                    </LinearGradient>
                  )}
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        ) : null}

        <Modal
          visible={Boolean(translationLanguagePickerMessage)}
          transparent
          animationType="fade"
          onRequestClose={() => setTranslationLanguagePickerMessage(null)}
        >
          <View style={styles.translationLanguageOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setTranslationLanguagePickerMessage(null)}
            />
            <View style={[styles.translationLanguageSheet, { borderColor: `${backgroundPreset.accent}22` }]}>
              <LinearGradient
                colors={["rgba(24,45,39,0.98)", "rgba(7,18,16,0.98)"]}
                style={styles.translationLanguageGradient}
              >
                <View style={styles.translationLanguageHeader}>
                  <View style={styles.translationLanguageTitleWrap}>
                    <Text style={styles.translationLanguageTitle}>{texts.translationLanguageTitle}</Text>
                    <Text style={styles.translationLanguageSubtitle}>{texts.translationLanguageSubtitle}</Text>
                  </View>
                  <Pressable
                    onPress={() => setTranslationLanguagePickerMessage(null)}
                    style={styles.translationLanguageClose}
                  >
                    <X size={16} strokeWidth={2.4} color={TEXT_MAIN} />
                  </Pressable>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.translationLanguageList}
                >
                  {translationLanguageOptions.map((item) => {
                    const active = preferredTranslationTargetLanguage === item.code;
                    return (
                      <Pressable
                        key={item.code}
                        onPress={() => {
                          const target = translationLanguagePickerMessage;
                          if (target) {
                            void runTranslateMessage(target, item.code);
                          }
                        }}
                        style={({ pressed }) => [
                          styles.translationLanguageItem,
                          {
                            borderColor: active ? backgroundPreset.accent : "rgba(255,255,255,0.08)",
                            backgroundColor: active ? `${backgroundPreset.accent}18` : "rgba(255,255,255,0.045)",
                          },
                          pressed ? styles.pressed : undefined,
                        ]}
                      >
                        <Text style={[styles.translationLanguageFlag, { color: backgroundPreset.accent }]}>{item.flag}</Text>
                        <View style={styles.translationLanguageItemText}>
                          <Text style={styles.translationLanguageItemTitle}>{item.title}</Text>
                          <Text style={styles.translationLanguageItemSubtitle}>{item.subtitle}</Text>
                        </View>
                        {active ? <Check size={17} strokeWidth={2.5} color={backgroundPreset.accent} /> : null}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </LinearGradient>
            </View>
          </View>
        </Modal>

        <MessageTopActionBar
          visible={!!topActionMode && !selectionMode}
          mode={topActionMode}
          accent={backgroundPreset.accent}
          onAction={handleTopBarAction}
          onClose={closeSelection}
        />

        <MessageOverflowMenu
          visible={overflowVisible}
          accent={backgroundPreset.accent}
          actions={overflowActions}
          onClose={() => setOverflowVisible(false)}
          onSelect={handleOverflowSelect}
        />

        <StickerReactionSheet
          visible={stickerSheetVisible}
          accent={backgroundPreset.accent}
          accentSoft={backgroundPreset.accentSoft}
          onClose={() => setStickerSheetVisible(false)}
          onSelect={handleStickerReaction}
        />

        <AnimatedHubSheet
          visible={animatedHubVisible}
          accent={backgroundPreset.accent}
          accentSoft={backgroundPreset.accentSoft}
          onClose={() => setAnimatedHubVisible(false)}
          onSelect={handleAnimatedHubSelect}
        />

        <AnimatedReactionSheet
          visible={animatedReactionVisible}
          accent={backgroundPreset.accent}
          accentSoft={backgroundPreset.accentSoft}
          onClose={() => setAnimatedReactionVisible(false)}
          onSelect={handleAnimatedReactionSelect}
        />

        <AnimatedEmojiSheet
          visible={animatedEmojiVisible}
          accent={backgroundPreset.accent}
          accentSoft={backgroundPreset.accentSoft}
          onClose={() => setAnimatedEmojiVisible(false)}
          onSelect={handleAnimatedEmojiSelect}
        />

        <AnimatedGiftSheet
          visible={animatedGiftVisible}
          accent={backgroundPreset.accent}
          accentSoft={backgroundPreset.accentSoft}
          onClose={() => setAnimatedGiftVisible(false)}
          onSelect={handleAnimatedGiftSelect}
          onOpenWallet={() => router.push("/wallet/coin")}
        />

        <AnimatedPlaybackOverlay
          visible={animatedPlaybackVisible}
          accent={backgroundPreset.accent}
          payload={animatedPlaybackPayload}
          onClose={handleAnimatedPlaybackClose}
        />

        {photoCaptureVisible ? (
          <VideoMessageCaptureScreen
            visible={photoCaptureVisible}
            accent={backgroundPreset.accent}
            usageMode="photo"
            onClose={() => setPhotoCaptureVisible(false)}
            onCapture={handlePhotoCaptureResult}
          />
        ) : null}

        {videoCaptureVisible ? (
          <VideoMessageCaptureScreen
            key={`video-capture-${videoCaptureSessionKey}`}
            visible={videoCaptureVisible}
            accent={backgroundPreset.accent}
            usageMode="video_message"
            onClose={() => setVideoCaptureVisible(false)}
            onCapture={handleVideoCaptureResult}
          />
        ) : null}

        <LinkActionSheet
          visible={linkSheetVisible}
          accent={backgroundPreset.accent}
          url={getSelectedLinkUrl()}
          onClose={() => setLinkSheetVisible(false)}
          onCopy={() => {
            setLinkSheetVisible(false);
            void handleCopy();
          }}
          onOpen={async () => {
            try {
              await handleOpenSelectedLink();
            } finally {
              setLinkSheetVisible(false);
            }
          }}
          onShare={() => {
            setLinkSheetVisible(false);
            handleForward();
          }}
        />

        <Modal
          visible={!!imagePreviewUri}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setImagePreviewUri(null);
            setImagePreviewSubtitle(texts.photoPreviewSubtitle);
          }}
        >
          <View style={styles.imagePreviewScreen}>
            {imagePreviewUri ? (
              <Image
                source={{ uri: imagePreviewUri }}
                style={styles.imagePreviewFullscreenImage}
                resizeMode="contain"
              />
            ) : null}

            <LinearGradient
              colors={["rgba(2,8,7,0.86)", "rgba(2,8,7,0.18)"]}
              style={styles.imagePreviewTopShade}
            />

            <View style={styles.imagePreviewHeader}>
              <View style={styles.imagePreviewHeaderTextWrap}>
                <Text style={styles.imagePreviewHeaderTitle}>{imagePreviewTitle}</Text>
                <Text style={styles.imagePreviewHeaderSubtitle}>{imagePreviewSubtitle}</Text>
              </View>

              <View style={styles.imagePreviewHeaderActions}>
                <Pressable
                  onPress={openPreviewImageSaveChoice}
                  style={styles.videoModalClose}
                >
                  {({ pressed }) => (
                    <View style={[styles.videoModalCloseInner, pressedViewStyle(pressed)]}>
                      <Download size={16} strokeWidth={2.3} color={TEXT_MAIN} />
                    </View>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => {
                    setImagePreviewUri(null);
                    setImagePreviewSubtitle(texts.photoPreviewSubtitle);
                  }}
                  style={styles.videoModalClose}
                >
                  {({ pressed }) => (
                    <View style={[styles.videoModalCloseInner, pressedViewStyle(pressed)]}>
                      <X size={16} strokeWidth={2.3} color={TEXT_MAIN} />
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {centerVideoUri ? (
          <View style={styles.centerVideoOverlay} pointerEvents="box-none">
            <Pressable
              style={styles.centerVideoBackdrop}
              onPress={() => {
                setCenterVideoPlaying(false);
                setCenterVideoMessage(null);
                setCenterVideoLoadError(null);
                setActiveInlineVideoId(null);
              }}
            />

            <View style={styles.centerVideoCardWrap} pointerEvents="box-none">
              <LinearGradient
                colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.06)"]}
                style={[styles.centerVideoCard, { borderColor: `${backgroundPreset.accent}28` }]}
              >
                <View style={styles.centerVideoHeader}>
                  <View style={styles.centerVideoHeaderText}>
                    <Text style={styles.centerVideoTitle} numberOfLines={1}>{centerVideoTitle}</Text>
                    <Text style={styles.centerVideoMeta} numberOfLines={1}>{centerVideoDuration}</Text>
                  </View>

                  <Pressable
                    onPress={() => {
                      setCenterVideoPlaying(false);
                      setCenterVideoMessage(null);
                      setCenterVideoLoadError(null);
                      setActiveInlineVideoId(null);
                    }}
                    style={styles.centerVideoClose}
                  >
                    {({ pressed }) => (
                      <View style={[styles.centerVideoCloseInner, pressedViewStyle(pressed)]}>
                        <X size={17} strokeWidth={2.4} color={TEXT_MAIN} />
                      </View>
                    )}
                  </Pressable>
                </View>

                <View style={styles.centerVideoPlayerWrap}>
                  {centerVideoUri ? (
                    <UniversalVideoPlayer
                      key={`center-video-${centerVideoMessage?.id ?? "unknown"}-${centerVideoLoadError ?? "ready"}`}
                      uri={centerVideoUri}
                      mimeType={centerVideoMessage?.mimeType}
                      style={styles.centerVideoPlayer}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay={centerVideoPlaying && !centerVideoLoadError}
                      isMuted={false}
                      useNativeControls={false}
                      progressUpdateIntervalMillis={250}
                      onReady={() => setCenterVideoLoadError(null)}
                      onLoadError={(errorKey) => {
                        setCenterVideoPlaying(false);
                        setCenterVideoLoadError(errorKey);
                      }}
                      onFinished={() => setCenterVideoPlaying(false)}
                    />
                  ) : null}

                  <Pressable
                    style={styles.centerVideoTouchLayer}
                    onPress={() => {
                      if (centerVideoLoadError) {
                        setCenterVideoLoadError(null);
                        setCenterVideoPlaying(true);
                        return;
                      }
                      setCenterVideoPlaying((current) => !current);
                    }}
                  >
                    {!centerVideoPlaying || centerVideoLoadError ? (
                      <View style={styles.centerVideoPlayOverlay}>
                        <View style={[styles.centerVideoPlayButton, { borderColor: `${backgroundPreset.accent}28` }]}>
                          <Play size={28} strokeWidth={2.4} color={TEXT_MAIN} />
                        </View>
                        {centerVideoLoadError ? (
                          <Text style={styles.centerVideoErrorText} numberOfLines={2}>
                            {texts.videoTitle}
                          </Text>
                        ) : null}
                      </View>
                    ) : null}
                  </Pressable>
                </View>
              </LinearGradient>
            </View>
          </View>
        ) : null}

        {fullscreenVideoUri ? (
          <View style={styles.fullscreenVideoOverlay}>
            <View style={styles.fullscreenVideoTopBar}>
              <View style={styles.fullscreenVideoTitleWrap}>
                <Text style={styles.fullscreenVideoTitle} numberOfLines={1}>{fullscreenVideoTitle}</Text>
                {fullscreenVideoMeta ? (
                  <Text style={styles.fullscreenVideoMeta} numberOfLines={1}>{fullscreenVideoMeta}</Text>
                ) : null}
              </View>

              <Pressable onPress={closeFullscreenVideoFile} style={styles.fullscreenVideoClose}>
                {({ pressed }) => (
                  <View style={[styles.fullscreenVideoCloseInner, pressedViewStyle(pressed)]}>
                    <X size={18} strokeWidth={2.4} color={TEXT_MAIN} />
                  </View>
                )}
              </Pressable>
            </View>

            <View style={styles.fullscreenVideoBody}>
              {fullscreenVideoUri ? (
                <UniversalVideoPlayer
                  key={`fullscreen-video-${fullscreenVideoMessage?.id ?? "unknown"}-${fullscreenVideoLoadError ?? "ready"}`}
                  uri={fullscreenVideoUri}
                  mimeType={fullscreenVideoMessage?.mimeType}
                  style={styles.fullscreenVideoPlayer}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={fullscreenVideoPlaying && !fullscreenVideoLoadError}
                  isMuted={false}
                  useNativeControls={false}
                  progressUpdateIntervalMillis={250}
                  onReady={() => setFullscreenVideoLoadError(null)}
                  onLoadError={(errorKey) => {
                    setFullscreenVideoPlaying(false);
                    setFullscreenVideoLoadError(errorKey);
                  }}
                  onFinished={() => setFullscreenVideoPlaying(false)}
                />
              ) : null}

              <Pressable
                style={styles.fullscreenVideoTouchLayer}
                onPress={() => {
                  if (fullscreenVideoLoadError) {
                    setFullscreenVideoLoadError(null);
                    setFullscreenVideoPlaying(true);
                    return;
                  }
                  setFullscreenVideoPlaying((current) => !current);
                }}
              >
                {!fullscreenVideoPlaying || fullscreenVideoLoadError ? (
                  <View style={styles.fullscreenVideoPlayOverlay}>
                    <View style={[styles.fullscreenVideoPlayButton, { borderColor: `${backgroundPreset.accent}30` }]}> 
                      <Play size={34} strokeWidth={2.4} color={TEXT_MAIN} />
                    </View>
                    {fullscreenVideoLoadError ? (
                      <Text style={styles.fullscreenVideoErrorText} numberOfLines={2}>
                        {texts.videoTitle}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </Pressable>
            </View>

            <View style={styles.fullscreenVideoBottomBar}>
              <Pressable
                onPress={() => setFullscreenVideoPlaying((current) => !current)}
                style={styles.fullscreenVideoRoundButton}
              >
                {({ pressed }) => (
                  <View style={[styles.fullscreenVideoRoundButtonInner, pressedViewStyle(pressed)]}>
                    {fullscreenVideoPlaying ? (
                      <Pause size={20} strokeWidth={2.4} color={TEXT_MAIN} />
                    ) : (
                      <Play size={20} strokeWidth={2.4} color={TEXT_MAIN} />
                    )}
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        ) : null}

        <SaveMediaSheet
          visible={saveSheetVisible}
          accent={backgroundPreset.accent}
          kind={
            selectedMessage?.kind === "video"
              ? "video"
              : selectedMessage?.kind === "image"
                ? "image"
                : "media"
          }
          onClose={() => setSaveSheetVisible(false)}
          onSaveToSabi={
            selectedMessage?.kind === "image" || selectedMessage?.kind === "video"
              ? async () => {
                  try {
                    await handleSaveSelectedMedia("sabi");
                  } catch (error) {
                    Alert.alert(texts.messageTitle, error instanceof Error ? error.message : texts.mediaCaptureFailed);
                  } finally {
                    setSaveSheetVisible(false);
                    closeSelection();
                  }
                }
              : undefined
          }
          onSaveToPhone={async () => {
            try {
              await handleSaveSelectedMedia("phone");
            } catch (error) {
              Alert.alert(texts.messageTitle, error instanceof Error ? error.message : texts.mediaCaptureFailed);
            } finally {
              setSaveSheetVisible(false);
              closeSelection();
            }
          }}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

export default function ChatRoomScreen() {
  return <ChatRoomContent />;
}

const styles = StyleSheet.create<any>({
  safeArea: {
    flex: 1,
    backgroundColor: "#03110E",
  },
  background: {
    flex: 1,
  },
  topGlow: {
    position: "absolute",
    top: -90,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 220,
  },
  sideGlow: {
    position: "absolute",
    top: 220,
    left: -90,
    width: 230,
    height: 230,
    borderRadius: 230,
  },
  leftGlow: {
    position: "absolute",
    top: 120,
    left: -24,
    width: 190,
    height: 250,
    borderRadius: 190,
    opacity: 0.55,
  },
  bottomGlow: {
    position: "absolute",
    bottom: 110,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 250,
  },
  noticeFloatWrap: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    zIndex: 50,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  noticeFloat: {
    minHeight: 36,
    borderRadius: 999,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  noticeFloatText: {
    color: TEXT_MAIN,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 8,
  },
  headerWrap: {
    paddingHorizontal: 10,
    paddingTop: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerGlassButton: {
    marginRight: 0,
  },
  headerCenterPressable: {
    flex: 1,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    minWidth: 0,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#F7FFFC",
    fontSize: 15,
    fontWeight: "900",
  },
  headerTitleWrap: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
    paddingRight: 2,
  },
  headerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  headerTitle: {
    flexShrink: 1,
    color: TEXT_MAIN,
    fontSize: 16,
    fontWeight: "900",
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  headerSubRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    marginRight: 5,
  },
  headerSubtitle: {
    flexShrink: 1,
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  glassActionButtonOuter: {
    width: 42,
    height: 42,
    borderRadius: 21,
    position: "relative",
    marginLeft: 6,
  },
  glassActionButtonPulse: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 29,
    backgroundColor: "rgba(222,255,248,0.9)",
  },
  glassActionPressable: {
    flex: 1,
  },
  glassActionButton: {
    flex: 1,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.26,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 11,
  },
  glassActionButtonEdge: {
    position: "absolute",
    inset: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  glassActionGloss: {
    position: "absolute",
    top: 3,
    left: 5,
    right: 5,
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  glassActionShimmer: {
    position: "absolute",
    top: -8,
    bottom: -8,
    width: 18,
    backgroundColor: "rgba(255,255,255,0.28)",
    opacity: 0.22,
    borderRadius: 20,
  },
  buttonGloss: {
    position: "absolute",
    top: -3,
    left: 5,
    right: 5,
    height: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  messagesWrap: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  messagesContent: {
    paddingTop: 0,
  },
  noticeWrap: {
    alignItems: "center",
    marginBottom: 12,
  },
  noticeCard: {
    minHeight: 34,
    borderRadius: 13,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  noticeText: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 8,
  },
  dateWrap: {
    alignItems: "center",
    marginBottom: 10,
    marginTop: 2,
  },
  datePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(16,26,23,0.42)",
    borderWidth: 1,
    borderColor: "rgba(170,255,224,0.18)",
  },
  dateText: {
    color: "rgba(233,255,244,0.58)",
    fontSize: 11,
    fontWeight: "800",
  },
  messageRow: {
    marginBottom: 6,
  },
  messageRowMine: {
    alignItems: "flex-end",
  },
  messageRowOther: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "89%",
    minWidth: 0,
    alignSelf: "flex-start",
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingTop: 9,
    paddingBottom: 7,
    overflow: "hidden",
    borderWidth: 1,
  },
  messageBubbleMine: {
    borderTopRightRadius: 7,
  },
  messageBubbleOther: {
    borderTopLeftRadius: 7,
  },
  messageBubbleSticker: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    borderWidth: 0,
    overflow: "visible",
    backgroundColor: "transparent",
  },
  messageBubbleStickerSelected: {
    borderWidth: 1.5,
    borderColor: "rgba(116,235,196,0.34)",
    borderRadius: 26,
  },
  replyPreview: {
    width: "100%",
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 7,
    marginBottom: 6,
  },
  replySender: {
    fontSize: 10,
    fontWeight: "900",
  },
  replyText: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
  },
  previewCard: {
    width: "100%",
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  previewIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  previewTextWrap: {
    flex: 1,
    marginLeft: 8,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: "800",
  },
  previewSubtitle: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
  },
  giftPreviewCard: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 6,
    overflow: "hidden",
  },
  giftPreviewTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  giftPreviewIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  giftPreviewIconImage: {
    width: 30,
    height: 30,
  },
  giftPreviewEmoji: {
    fontSize: 24,
  },
  giftPreviewHeaderText: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },
  giftPreviewTitle: {
    fontSize: 12,
    fontWeight: "900",
  },
  giftPreviewSubtitle: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
  },
  giftPreviewMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 6,
  },
  giftMetaPill: {
    minHeight: 24,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  giftMetaPillText: {
    marginLeft: 5,
    fontSize: 10,
    fontWeight: "800",
  },
  translationLanguageOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 80,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.42)",
  },
  translationLanguageSheet: {
    marginHorizontal: 12,
    marginBottom: 14,
    maxHeight: "72%",
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
  },
  translationLanguageGradient: {
    padding: 16,
  },
  translationLanguageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  translationLanguageTitleWrap: {
    flex: 1,
  },
  translationLanguageTitle: {
    color: TEXT_MAIN,
    fontSize: 18,
    fontWeight: "900",
  },
  translationLanguageSubtitle: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 4,
  },
  translationLanguageClose: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  translationLanguageList: {
    gap: 8,
    paddingBottom: 4,
  },
  translationLanguageItem: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  translationLanguageFlag: {
    width: 34,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  translationLanguageItemText: {
    flex: 1,
    minWidth: 0,
  },
  translationLanguageItemTitle: {
    color: TEXT_MAIN,
    fontSize: 14,
    fontWeight: "900",
  },
  translationLanguageItemSubtitle: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  messageContentStretch: {
    alignSelf: "flex-start",
    minWidth: 0,
    maxWidth: "100%",
    flexShrink: 1,
  },
  messageTextStretch: {
    alignSelf: "flex-start",
    minWidth: 0,
    maxWidth: "100%",
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },
  inlineTranslationCard: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: "100%",
  },
  inlineTranslationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  inlineTranslationLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  inlineTranslationText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  messageMetaStretch: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  messageMetaMine: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },
  messageMetaOther: {
    alignSelf: "flex-start",
    justifyContent: "flex-start",
  },
  messageEdited: {
    fontSize: 9,
    fontWeight: "700",
    marginRight: 6,
  },
  messageTime: {
    fontSize: 9,
    fontWeight: "700",
  },
  statusIcon: {
    marginLeft: 3,
  },
  reactionPill: {
    marginTop: 4,
    minWidth: 30,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,12,11,0.82)",
    borderWidth: 1,
    borderColor: "rgba(170,255,224,0.18)",
  },
  reactionPillMine: {
    marginRight: 8,
  },
  reactionPillOther: {
    marginLeft: 8,
  },
  reactionPillText: {
    fontSize: 12,
  },
  composerLayer: {
    position: "absolute",
    left: 10,
    right: 10,
  },
  composerModeCard: {
    minHeight: 48,
    borderRadius: 16,
    marginBottom: 5,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  composerModeLine: {
    width: 4,
    height: 24,
    borderRadius: 999,
    marginRight: 8,
  },
  composerModeTextWrap: {
    flex: 1,
  },
  composerModeTitle: {
    color: TEXT_MAIN,
    fontSize: 11,
    fontWeight: "900",
  },
  composerModeSubtitle: {
    marginTop: 2,
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: "600",
  },
  composerModeClose: {
    width: 28,
    height: 28,
    borderRadius: 11,
    overflow: "hidden",
  },
  composerModeCloseInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(50,83,74,0.74)",
  },
  panelWrap: {
    marginBottom: 6,
  },
  panelCard: {
    minHeight: 40,
    borderRadius: 16,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  toolWrap: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 13,
    overflow: "hidden",
  },
  toolPill: {
    minHeight: 34,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 8,
  },
  toolPillText: {
    color: "#F6FFF9",
    fontSize: 10,
    fontWeight: "900",
  },
  closeMiniWrap: {
    width: 36,
    marginLeft: 4,
    borderRadius: 13,
    overflow: "hidden",
  },
  closeMini: {
    minHeight: 32,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  composerBar: {
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 5,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

readOnlyComposerBar: {
  minHeight: 60,
  paddingHorizontal: 10,
  justifyContent: "space-between",
},
readOnlyComposerIconWrap: {
  width: 38,
  height: 38,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.10)",
},
readOnlyComposerTextWrap: {
  flex: 1,
  marginLeft: 10,
  marginRight: 10,
},
readOnlyComposerTitle: {
  color: TEXT_MAIN,
  fontSize: 13,
  fontWeight: "900",
},
readOnlyComposerSubtitle: {
  marginTop: 2,
  color: TEXT_SECONDARY,
  fontSize: 11,
  lineHeight: 15,
  fontWeight: "700",
},
readOnlyComposerActionWrap: {
  width: 38,
  height: 38,
  borderRadius: 14,
  overflow: "hidden",
},
readOnlyComposerAction: {
  flex: 1,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "rgba(170,255,224,0.18)",
},
  attachButtonWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    overflow: "hidden",
    alignSelf: "center",
  },
  attachButton: {
    flex: 1,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(170,255,224,0.18)",
  },
  inputWrap: {
    flex: 1,
    flexGrow: 1,
    minWidth: 0,
    minHeight: 34,
    borderRadius: 13,
    marginHorizontal: 5,
    paddingHorizontal: 10,
    paddingVertical: 0,
    justifyContent: "center",
    borderWidth: 1,
  },
  input: {
    width: "100%",
    minWidth: 0,
    color: TEXT_MAIN,
    fontSize: 14,
    lineHeight: 18,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    includeFontPadding: false,
  },
  smallToolWrap: {
    width: 32,
    height: 32,
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
    marginLeft: 4,
  },
  smallToolButton: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stickerButtonIconWrap: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  stickerButtonBody: {
    width: 15,
    height: 15,
    borderRadius: 5,
    borderWidth: 1.7,
    borderColor: "#F1FFF9",
    backgroundColor: "rgba(241,255,249,0.10)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  stickerFoldCorner: {
    position: "absolute",
    top: 1,
    right: 1,
    width: 5,
    height: 5,
    borderTopWidth: 1.4,
    borderRightWidth: 1.4,
    borderColor: "#F1FFF9",
    backgroundColor: "rgba(241,255,249,0.16)",
    transform: [{ rotate: "45deg" }],
  },
  stickerEyeRow: {
    width: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 1,
  },
  stickerEyeDot: {
    width: 2,
    height: 2,
    borderRadius: 999,
    backgroundColor: "#F1FFF9",
  },
  stickerSmile: {
    width: 7,
    height: 4,
    marginTop: 2,
    borderBottomWidth: 1.4,
    borderColor: "#F1FFF9",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  sendButtonAnimatedWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignSelf: "center",
  },
  sendButtonGlowBase: {
    shadowColor: "#89E0C4",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 14,
    elevation: 0,
  },
  sendButtonWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    overflow: "hidden",
    alignSelf: "center",
    marginLeft: 6,
  },
  sendButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  sendButtonDisabled: {
    opacity: 0.58,
  },
  aiButtonLabel: {
    position: "absolute",
    bottom: 4,
    color: "#071711",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  audioCard: {
    width: 248,
    minHeight: 48,
    marginTop: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  audioPlayButtonWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    overflow: "hidden",
  },
  audioPlayButton: {
    flex: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  audioBody: {
    flex: 1,
    minWidth: 188,
    marginLeft: 8,
  },
  audioTimeline: {
    minHeight: 20,
    justifyContent: "center",
  },
  audioWaveRow: {
    height: 22,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  audioWaveBar: {
    width: 1.2,
    marginRight: 2,
    borderRadius: 999,
  },
  audioProgressTrack: {
    marginTop: 2,
    height: 1.5,
    borderRadius: 999,
    overflow: "hidden",
  },
  audioProgressFill: {
    height: 1.5,
    borderRadius: 999,
  },
  audioMetaRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  audioTimeLabel: {
    fontSize: 7.5,
    fontWeight: "900",
  },
  audioRates: {
    flexDirection: "row",
    alignItems: "center",
  },
  audioRateWrap: {
    marginLeft: 2,
  },
  audioRatePill: {
    minWidth: 22,
    height: 16,
    borderRadius: 999,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  audioRateText: {
    fontSize: 7,
    fontWeight: "900",
  },
  audioMessageMeta: {
    marginTop: 6,
  },
  previewActionBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: 11,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  videoModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(3,12,10,0.88)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  videoModalCard: {
    width: "100%",
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "rgba(10,24,21,0.98)",
    borderWidth: 1,
    borderColor: "rgba(170,255,224,0.16)",
  },
  videoModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  videoModalTitleWrap: {
    flex: 1,
  },
  videoModalActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  videoModalTitle: {
    color: TEXT_MAIN,
    fontSize: 13,
    fontWeight: "900",
  },
  videoModalSubtitle: {
    marginTop: 2,
    color: TEXT_SECONDARY,
    fontSize: 10,
    fontWeight: "700",
  },
  videoModalClose: {
    width: 32,
    height: 32,
    borderRadius: 12,
    overflow: "hidden",
  },
  videoModalCloseInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  videoPlayer: {
    width: "100%",
    aspectRatio: 9 / 16,
    backgroundColor: "#000000",
  },
  centerVideoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.34)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    zIndex: 80,
    elevation: 80,
  },
  centerVideoBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  centerVideoCardWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 82,
    elevation: 82,
  },
  centerVideoCard: {
    width: "82%",
    maxWidth: 320,
    borderRadius: 26,
    borderWidth: 1,
    padding: 10,
    overflow: "hidden",
    backgroundColor: "rgba(7,18,20,0.58)",
  },
  centerVideoHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  centerVideoHeaderText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  centerVideoTitle: {
    color: TEXT_MAIN,
    fontSize: 13,
    fontWeight: "900",
  },
  centerVideoMeta: {
    color: TEXT_SECONDARY,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
  },
  centerVideoClose: {
    width: 34,
    height: 34,
    borderRadius: 13,
    overflow: "hidden",
  },
  centerVideoCloseInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  centerVideoPlayerWrap: {
    width: "100%",
    aspectRatio: 9 / 12.5,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#030706",
    position: "relative",
  },
  centerVideoPlayer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#030706",
  },
  centerVideoTouchLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  centerVideoPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.10)",
  },
  centerVideoPlayButton: {
    width: 64,
    height: 64,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(4,11,10,0.52)",
  },
  centerVideoErrorText: {
    marginTop: 10,
    maxWidth: 220,
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  fullscreenVideoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.96)",
    zIndex: 120,
    elevation: 120,
  },
  fullscreenVideoTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 124,
    elevation: 124,
    minHeight: 76,
    paddingTop: Platform.OS === "android" ? 18 : 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(3,8,8,0.48)",
  },
  fullscreenVideoTitleWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  fullscreenVideoTitle: {
    color: TEXT_MAIN,
    fontSize: 15,
    fontWeight: "900",
  },
  fullscreenVideoMeta: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },
  fullscreenVideoClose: {
    width: 42,
    height: 42,
    borderRadius: 16,
    overflow: "hidden",
  },
  fullscreenVideoCloseInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  fullscreenVideoBody: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 70,
    paddingBottom: 84,
  },
  fullscreenVideoPlayer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000000",
  },
  fullscreenVideoTouchLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreenVideoPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  fullscreenVideoPlayButton: {
    width: 78,
    height: 78,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(4,11,10,0.62)",
  },
  fullscreenVideoErrorText: {
    marginTop: 12,
    maxWidth: 260,
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  fullscreenVideoBottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 124,
    elevation: 124,
    minHeight: 78,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === "android" ? 16 : 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(3,8,8,0.42)",
  },
  fullscreenVideoRoundButton: {
    width: 52,
    height: 52,
    borderRadius: 19,
    overflow: "hidden",
  },
  fullscreenVideoRoundButtonInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  videoMessagePressable: {
    alignSelf: "flex-start",
    borderRadius: 16,
  },
  videoMessageCard: {
    marginTop: 2,
    borderRadius: 20,
    borderWidth: 1,
    padding: 0,
    overflow: "hidden",
  },
  videoMessageFrame: {
    width: 214,
    height: 244,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(6,18,16,0.38)",
  },
  videoMessagePreview: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    backgroundColor: "#061210",
  },
  videoMessageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  videoMessageTopRow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  videoEffectChip: {
    maxWidth: 138,
    minHeight: 26,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  videoEffectChipText: {
    marginLeft: 5,
    fontSize: 10,
    fontWeight: "900",
  },
  videoPlayBadge: {
    width: 42,
    height: 42,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  videoMessageBottomRow: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  videoDurationPill: {
    minHeight: 24,
    borderRadius: 999,
    paddingHorizontal: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  videoDurationText: {
    marginLeft: 5,
    fontSize: 10,
    fontWeight: "900",
  },
  selectionBarWrap: {
    position: "absolute",
    top: 76,
    left: 12,
    right: 12,
    zIndex: 80,
  },
  selectionBar: {
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  selectionCountWrap: {
    flex: 1,
  },
  selectionCount: {
    color: TEXT_MAIN,
    fontSize: 18,
    fontWeight: "900",
  },
  selectionLabel: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: "700",
  },
  selectionActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectionActionButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    overflow: "hidden",
    marginLeft: 6,
  },
  selectionActionFill: {
    flex: 1,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineVoiceStatusCard: {
    marginTop: 6,
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  inlineVoiceStatusLine: {
    width: 3,
    height: 22,
    borderRadius: 999,
    marginRight: 8,
  },
  inlineVoiceStatusTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  inlineVoiceStatusTitle: {
    color: TEXT_MAIN,
    fontSize: 11,
    fontWeight: "900",
  },
  inlineVoiceStatusSubtitle: {
    marginTop: 2,
    color: TEXT_SECONDARY,
    fontSize: 10,
    fontWeight: "700",
  },
  inlineVoiceStatusCloseWrap: {
    width: 26,
    height: 26,
    borderRadius: 10,
    overflow: "hidden",
    marginLeft: 8,
  },
  inlineVoiceStatusClose: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  toolPillIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    marginRight: 7,
  },
  toolPillTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  toolPillSubtext: {
    marginTop: 1,
    color: "rgba(232,255,246,0.58)",
    fontSize: 8,
    fontWeight: "700",
  },
  toolPillSubtextRecording: {
    color: "#FFE3E3",
  },
  toolPillTextActiveDark: {
    color: "#071711",
  },
  toolPillSubtextActiveDark: {
    color: "rgba(7,23,17,0.72)",
  },
  toolLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    marginLeft: 6,
    backgroundColor: "#FFD4D4",
  },

  mediaPanelCard: {
    minHeight: 54,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 18,
  },
  mediaToolWrap: {
    width: 48,
    height: 48,
    marginHorizontal: 3,
    borderRadius: 16,
    overflow: "visible",
  },
  mediaToolButton: {
    flex: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  mediaToolRaised: {
    shadowColor: "#8BE2C7",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.26,
    shadowRadius: 10,
    elevation: 6,
  },
  mediaToolGloss: {
    position: "absolute",
    top: 3,
    left: 7,
    right: 7,
    height: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.24)",
  },
  mediaLiveDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#FFE3E3",
  },
  mediaDiamondBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 15,
    height: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(7,23,17,0.28)",
  },
  mediaCloseWrap: {
    width: 42,
    height: 48,
    marginLeft: 4,
    borderRadius: 16,
    overflow: "visible",
  },
  mediaCloseButton: {
    flex: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },

  animatedBubbleCard: {
    width: 164,
    minHeight: 148,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  animatedBubbleInner: {
    width: 108,
    height: 108,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  animatedBubbleImage: {
    width: 84,
    height: 84,
  },
  animatedBubbleEmoji: {
    fontSize: 56,
  },
  sentPremiumStickerWrap: {
    width: 236,
    height: 236,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    alignSelf: "center",
  },
  sentPremiumStickerImage: {
    width: 224,
    height: 224,
  },
  sentPremiumStickerEmoji: {
    fontSize: 148,
    lineHeight: 156,
  },
  imageMessageCard: {
    width: 214,
    height: 214,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 6,
    backgroundColor: "rgba(6,18,16,0.38)",
  },
  imageMessagePreview: {
    width: "100%",
    height: "100%",
  },
  imageMessageShade: {
    ...StyleSheet.absoluteFillObject,
  },
  imageEffectBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    alignSelf: "flex-start",
    maxWidth: 152,
    minHeight: 26,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  imageEffectBadgeText: {
    marginLeft: 5,
    fontSize: 10,
    fontWeight: "900",
  },

  documentCard: {
    width: 276,
    minHeight: 188,
    marginBottom: 6,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
  },
  documentHero: {
    height: 118,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  documentPreviewSheet: {
    width: "78%",
    height: "76%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  documentPreviewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  documentPreviewDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: "rgba(87,211,168,0.92)",
    marginRight: 5,
  },
  documentPreviewDotMuted: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: "rgba(7,23,17,0.18)",
    marginRight: 5,
  },
  documentPreviewLineLong: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(7,23,17,0.10)",
    marginBottom: 8,
  },
  documentPreviewLineMid: {
    width: "78%",
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(7,23,17,0.10)",
    marginBottom: 8,
  },
  documentPreviewLineShort: {
    width: "52%",
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(7,23,17,0.10)",
    marginBottom: 8,
  },
  documentFooter: {
    minWidth: 0,
  },
  documentThumb: {
    display: "none",
    width: 0,
    height: 0,
  },
  documentPage: {
    width: 24,
    height: 30,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  documentFold: {
    position: "absolute",
    top: 14,
    right: 15,
    width: 10,
    height: 10,
    backgroundColor: "rgba(16,28,25,0.18)",
    borderTopRightRadius: 4,
    transform: [{ rotate: "45deg" }],
  },
  documentInfo: {
    display: "none",
  },
  documentName: {
    fontSize: 18,
    fontWeight: "900",
  },
  documentMeta: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "700",
  },
  documentBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    minWidth: 52,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  documentBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  locationCard: {
    width: 276,
    minHeight: 198,
    marginBottom: 6,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
  },
  locationMapPreview: {
    height: 112,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
  },
  locationMapImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  locationMapShade: {
    ...StyleSheet.absoluteFillObject,
  },
  locationMapBadge: {
    position: "absolute",
    left: 10,
    top: 10,
    minHeight: 24,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  locationMapBadgeText: {
    marginLeft: 5,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  locationMapGlowLeft: {
    position: "absolute",
    left: -28,
    top: 18,
    width: 120,
    height: 120,
    borderRadius: 120,
    backgroundColor: "rgba(87,211,168,0.10)",
  },
  locationMapGlowRight: {
    position: "absolute",
    right: -24,
    bottom: -20,
    width: 110,
    height: 110,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  locationRoadHorizontalA: {
    position: "absolute",
    left: -10,
    right: 52,
    top: 34,
    height: 18,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    transform: [{ rotate: "-6deg" }],
  },
  locationRoadHorizontalB: {
    position: "absolute",
    left: 48,
    right: -8,
    bottom: 26,
    height: 18,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    transform: [{ rotate: "8deg" }],
  },
  locationRoadVerticalA: {
    position: "absolute",
    top: -8,
    bottom: 18,
    left: 96,
    width: 18,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    transform: [{ rotate: "10deg" }],
  },
  locationRoadVerticalB: {
    position: "absolute",
    top: 16,
    bottom: -10,
    right: 72,
    width: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    transform: [{ rotate: "-12deg" }],
  },
  locationGridVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  locationGridHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  locationPinHalo: {
    position: "absolute",
    top: "41%",
    left: "45%",
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  locationPinDot: {
    position: "absolute",
    top: "44%",
    left: "47.5%",
    width: 18,
    height: 18,
    borderRadius: 10,
  },
  locationPinCore: {
    position: "absolute",
    top: "46.3%",
    left: "49.3%",
    width: 8,
    height: 8,
    borderRadius: 8,
  },
  locationInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationInfo: {
    flex: 1,
    minWidth: 0,
  },
  locationBadge: {
    minWidth: 58,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  locationBadgeText: {
    marginLeft: 5,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  locationMeta: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  contactCard: {
    width: 272,
    minHeight: 116,
    marginBottom: 6,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  contactAvatar: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contactAvatarText: {
    fontSize: 20,
    fontWeight: "900",
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "900",
  },
  contactPhone: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "800",
  },
  contactRole: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
  },
  addContactOverlay: {
    flex: 1,
    backgroundColor: "rgba(1,6,6,0.62)",
    justifyContent: "flex-end",
  },
  addContactSheetWrap: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  addContactSheet: {
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    overflow: "hidden",
  },
  addContactAccentLine: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 0,
    height: 3,
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
  },
  addContactHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addContactHeaderText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  addContactTitle: {
    color: TEXT_MAIN,
    fontSize: 21,
    fontWeight: "900",
  },
  addContactSubtitle: {
    color: TEXT_SECONDARY,
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  addContactCloseButton: {
    width: 38,
    height: 38,
  },
  addContactIconButton: {
    flex: 1,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  addContactFields: {
    marginTop: 16,
  },
  addContactFieldBlock: {
    marginBottom: 12,
  },
  addContactLabel: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 7,
  },
  addContactInput: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.06)",
    color: TEXT_MAIN,
    paddingHorizontal: 13,
    fontSize: 15,
    fontWeight: "700",
  },
  addContactActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },
  addContactActionWrap: {
    flex: 1,
  },
  addContactSecondaryButton: {
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addContactPrimaryButton: {
    minHeight: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  addContactSecondaryText: {
    color: TEXT_MAIN,
    fontSize: 14,
    fontWeight: "900",
  },
  addContactPrimaryText: {
    color: OUTGOING_TEXT,
    fontSize: 14,
    fontWeight: "900",
  },
  imagePreviewModalBody: {
    width: "100%",
    height: 440,
    maxHeight: 520,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#04110E",
  },
  imagePreviewModalImage: {
    width: "100%",
    height: "100%",
  },
  imagePreviewScreen: {
    flex: 1,
    backgroundColor: "#010606",
    justifyContent: "center",
  },
  imagePreviewFullscreenImage: {
    width: "100%",
    height: "100%",
  },
  imagePreviewTopShade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 116,
  },
  imagePreviewHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  imagePreviewHeaderTextWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  imagePreviewHeaderTitle: {
    color: TEXT_MAIN,
    fontSize: 14,
    fontWeight: "900",
  },
  imagePreviewHeaderSubtitle: {
    marginTop: 2,
    color: TEXT_SECONDARY,
    fontSize: 10,
    fontWeight: "700",
  },
  imagePreviewHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  pressView: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  pressText: {
    opacity: 0.9,
  },
});







