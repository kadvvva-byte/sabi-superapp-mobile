import { ResizeMode, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  BadgeCheck,
  Bot,
  BriefcaseBusiness,
  ChevronRight,
  Eye,
  Gift,
  Hash,
  Heart,
  Image as ImageIcon,
  Link2,
  Lock,
  MessageCircleMore,
  PhoneCall,
  Play,
  Settings2,
  ShieldCheck,
  Store,
  Trash2,
  Truck,
  UserRoundPlus,
  Users,
  Video as VideoIcon,
  X
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAuthSessionState } from "../../../core/kernel/auth/session.store";
import {
  fetchUserPublicProfileSurface,
  isLocalOnlyUserProfileMediaUri,
  resolveUserProfileMediaUrl,
} from "../../../shared/api/user-profile-api";
import { useI18n } from "../../../shared/i18n";
import { useRealtimeChannel } from "../../../shared/realtime/use-realtime-channel";
import { appStorage } from "../../../shared/storage/app-storage";
import {
  buildMessengerCallParticipants,
  countMessengerCallParticipants,
  encodeMessengerCallParticipants,
} from "../../calls/callParticipants";
import {
  addGroupBlacklistEntry,
  approveGroupJoinRequest,
  canInviteToGroup,
  getGroupInviteLink,
  getGroupModerationState,
  hydrateGroupModerationRuntime,
  inviteGroupMember,
  listGroupMembers,
  regenerateGroupInviteLink,
  rejectGroupJoinRequest,
  removeGroupBlacklistEntry,
  removeGroupMember,
  resolveGroupRole,
  isGroupOwner as runtimeIsGroupOwner,
  setGroupRole,
  updateGroupModerationRules,
  type GroupMemberRecord,
} from "../groups/groupModerationRuntime";
import { hydrateGroupPublicProfile } from "../groups/groupPublicProfileRuntime";
import {
  getPrivateChatProfile,
  markPrivateChatRead,
  markPrivateChatUnread,
  setPrivateChatDeleted,
  setPrivateChatHiddenFromMain,
  setPrivateChatMuted,
  setPrivateChatPinned,
  upsertPrivateChatProfile,
} from "../private/privateChatRuntime";
import { hydratePublicProfile, hydratePublicProfileStorage, savePublicProfile, subscribePublicProfiles } from "../public/publicProfileRuntime";
import {
  getMessengerThemePalette,
  getMessengerThemeState,
  hydrateMessengerThemeState,
  type MessengerThemePalette,
  type MessengerThemeState,
} from "../theme/messengerThemeRuntime";
import {
  hydratePersistedChatPresence,
  registerPersistedChatRoom,
} from "./services/chatRoomRealtime";

type TabKey = "publications" | "gifts" | "archive";
type MediaKind = "photo" | "video";
type RoomType = "direct" | "group" | "channel" | "business";
type GroupRole = "owner" | "admin" | "member";

type PublicMediaItem = {
  id: string;
  uri: string;
  kind: MediaKind;
  thumbnailUri?: string;
  mediaUri?: string;
  mimeType?: string;
  views?: number;
  duration?: string;
  liked?: boolean;
};

type PublicGiftItem = {
  id: string;
  title?: string;
  emoji?: string;
  imageUri?: string;
};

type RouteParams = {
  id?: string;
  chatId?: string;
  name?: string;
  handle?: string;
  avatarLetter?: string;
  avatarUrl?: string;
  photoUrl?: string;
  verified?: string;
  status?: string;
  subtitle?: string;
  presenceOnline?: string;
  lastSeenAt?: string;
  phone?: string;
  birthday?: string;
  userId?: string;
  selfId?: string;
  peerId?: string;
  partnerId?: string;
  targetUserId?: string;
  roomType?: string;
  isBot?: string;
  botId?: string;
  botHandle?: string;
  botKind?: string;
  isBotOwnedByMe?: string;
  isGroupOwner?: string;
  groupRole?: string;
  isChannelOwner?: string;
  channelRole?: string;
  membersCount?: string;
  subscribersCount?: string;
  premiumActive?: string;
  premiumTier?: string;
  premiumStyleId?: string;
  premiumAccent?: string;
  publicPhotos?: string | string[];
  publicVideos?: string | string[];
  archivePublications?: string | string[];
  publicGifts?: string | string[];
  likesCount?: string | string[];
  publicGiftsCount?: string | string[];
};

type GlassIconProps = {
  size?: number;
  strokeWidth?: number;
  color?: string;
};

type GlassActionButtonProps = {
  icon: React.ComponentType<GlassIconProps>;
  onPress: () => void;
  colors: [string, string] | [string, string, string];
  iconColor: string;
  animated?: boolean;
  style?: object;
  iconSize?: number;
};

type PartnerTheme = {
  background: [string, string, string, string];
  card: [string, string];
  raised: [string, string];
  accent: string;
  accentSoft: string;
  accentAlt: string;
  textMain: string;
  textSecondary: string;
  wallpaperUri: string;
};


type ChatPartnerInfoTextKey =
  | "you"
  | "online"
  | "offline"
  | "lastSeenToday"
  | "lastSeenYesterday"
  | "lastSeenDate"
  | "mobile"
  | "username"
  | "birthday"
  | "publications"
  | "gifts"
  | "archive"
  | "allStories"
  | "likes"
  | "giftsPublic"
  | "emptyPublications"
  | "emptyGifts"
  | "emptyArchive"
  | "fullscreenHint"
  | "unknownUser"
  | "chat"
  | "group"
  | "channel"
  | "business"
  | "bot"
  | "info"
  | "settings"
  | "premium"
  | "premiumStyle"
  | "members"
  | "groupMembers"
  | "noGroupMembers"
  | "memberInvited"
  | "memberRemoved"
  | "promoteAdmin"
  | "demoteMember"
  | "ownerRole"
  | "adminRole"
  | "memberRole"
  | "pendingJoinRequests"
  | "noPendingJoinRequests"
  | "approve"
  | "reject"
  | "joinRequestApproved"
  | "joinRequestRejected"
  | "inviteRegenerated"
  | "subscribers"
  | "roomType"
  | "openChat"
  | "openChatSubtitle"
  | "notifications"
  | "notificationsSubtitle"
  | "pin"
  | "unpin"
  | "privateList"
  | "mainList"
  | "markRead"
  | "markUnread"
  | "media"
  | "mediaSubtitle"
  | "addMembers"
  | "addMembersSubtitle"
  | "admins"
  | "adminsSubtitle"
  | "subscribersSubtitle"
  | "delete"
  | "deleteSubtitle"
  | "close"
  | "saved"
  | "on"
  | "off"
  | "adminOnlyMessaging"
  | "adminOnlyMedia"
  | "adminOnlyInvites"
  | "approveJoinRequests"
  | "autoDeleteAds"
  | "autoDeletePromoLeaflets"
  | "autoDeleteLinks"
  | "autoBanRepeatedSpam"
  | "blacklist"
  | "blacklistSubtitle"
  | "inviteLink"
  | "regenerateLink"
  | "sendInvite"
  | "ownerTools"
  | "ownerToolsSubtitle"
  | "enterUserId"
  | "add"
  | "remove"
  | "botAssistant"
  | "botService"
  | "botBusiness"
  | "botSubtitle"
  | "publicBanner"
  | "settingsOnlyOwner"
  | "groupSettings"
  | "channelSettings"
  | "botSettings"
  | "publishingAdminsOnly"
  | "approveSubscribers"
  | "channelReactions"
  | "channelComments"
  | "visibleInDiscovery"
  | "openOwnerPanel"
  | "ownerPanelSubtitle"
  | "botPublicVisible"
  | "botInlineEnabled"
  | "botAutoReplyEnabled"
  | "botMarketplaceLinked"
  | "botDeliveryLinked"
  | "botBusinessRoutingEnabled"
  | "businessRoutingNote"
  | "deleteGroup"
  | "deleteChannel"
  | "deleteBot";

const CHAT_PARTNER_INFO_EN_DEFAULTS: Record<ChatPartnerInfoTextKey, string> = {
  you: "You",
  online: "Online",
  offline: "Offline",
  lastSeenToday: "last seen today at {{time}}",
  lastSeenYesterday: "last seen yesterday at {{time}}",
  lastSeenDate: "last seen on {{date}} at {{time}}",
  mobile: "Телефон",
  username: "Имя пользователя",
  birthday: "Birthday",
  publications: "Publications",
  gifts: "Gifts",
  archive: "Archive",
  allStories: "Public stories",
  likes: "Likes",
  giftsPublic: "Gifts",
  emptyPublications: "No public posts yet",
  emptyGifts: "No public gifts yet",
  emptyArchive: "Archive is empty",
  fullscreenHint: "Tap video to open. Tap photo three times for fullscreen.",
  unknownUser: "User",
  chat: "Chat",
  group: "Group",
  channel: "Channel",
  business: "Business",
  bot: "Bot",
  info: "Info",
  settings: "Settings",
  premium: "Premium",
  premiumStyle: "Premium style",
  members: "members",
  groupMembers: "Group members",
  noGroupMembers: "No members added yet",
  memberInvited: "Invitation saved",
  memberRemoved: "Member removed",
  promoteAdmin: "Make admin",
  demoteMember: "Make member",
  ownerRole: "Owner",
  adminRole: "Admin",
  memberRole: "Member",
  pendingJoinRequests: "Join requests",
  noPendingJoinRequests: "No pending requests",
  approve: "Approve",
  reject: "Reject",
  joinRequestApproved: "Request approved",
  joinRequestRejected: "Request rejected",
  inviteRegenerated: "Invite link updated",
  subscribers: "subscribers",
  roomType: "Room type",
  openChat: "Open chat",
  openChatSubtitle: "Return to the room and continue messaging.",
  notifications: "Notifications",
  notificationsSubtitle: "Enable or mute push and in-app alerts for this room.",
  pin: "Pin",
  unpin: "Unpin",
  privateList: "Move to private",
  mainList: "Return to main list",
  markRead: "Mark as read",
  markUnread: "Mark as unread",
  media: "Media",
  mediaSubtitle: "Public photos, videos and files.",
  addMembers: "Add members",
  addMembersSubtitle: "Invite new members to the group.",
  admins: "Admins",
  adminsSubtitle: "Roles and moderation access.",
  subscribersSubtitle: "Audience and channel reach.",
  delete: "Delete",
  deleteSubtitle: "Remove this room from the current messenger list.",
  close: "Close",
  saved: "Saved",
  on: "On",
  off: "Off",
  adminOnlyMessaging: "Only admins can write",
  adminOnlyMedia: "Only admins can send media",
  adminOnlyInvites: "Only admins can invite",
  approveJoinRequests: "Approve join requests",
  autoDeleteAds: "Auto delete ads",
  autoDeletePromoLeaflets: "Auto delete promo leaflets",
  autoDeleteLinks: "Auto delete suspicious links",
  autoBanRepeatedSpam: "Auto ban repeated spam",
  blacklist: "Blacklist",
  blacklistSubtitle: "Blocked users cannot write or return until removed.",
  inviteLink: "Invite link",
  regenerateLink: "Regenerate invite link",
  sendInvite: "Send invitation",
  ownerTools: "Owner tools",
  ownerToolsSubtitle: "Only the group owner can change moderation and posting rules.",
  enterUserId: "Enter username or user ID",
  add: "Add",
  remove: "Remove",
  botAssistant: "Assistant bot",
  botService: "Service bot",
  botBusiness: "Business bot",
  botSubtitle: "Automation, assistant and business functions.",
  publicBanner: "Public profile",
  settingsOnlyOwner: "These functions are shown only in settings for the owner.",
  groupSettings: "Group settings",
  channelSettings: "Channel settings",
  botSettings: "Bot settings",
  publishingAdminsOnly: "Only owners and admins can publish",
  approveSubscribers: "Approve subscriber requests",
  channelReactions: "Allow reactions on channel posts",
  channelComments: "Allow comments under posts",
  visibleInDiscovery: "Show in public discovery",
  openOwnerPanel: "Open owner panel",
  ownerPanelSubtitle: "Separate management space for the owner.",
  botPublicVisible: "Show bot in public search",
  botInlineEnabled: "Enable inline mode",
  botAutoReplyEnabled: "Enable auto replies",
  botMarketplaceLinked: "Connect bot to marketplace",
  botDeliveryLinked: "Connect bot to delivery",
  botBusinessRoutingEnabled: "Use business routing for payments",
  businessRoutingNote: "Business bot income should follow the business routing path.",
  deleteGroup: "Delete group",
  deleteChannel: "Delete channel",
  deleteBot: "Delete bot",
};

const CHAT_PARTNER_INFO_RU_FALLBACKS: Partial<Record<ChatPartnerInfoTextKey, string>> = {
  you: "Вы",
  online: "В сети",
  offline: "Не в сети",
  lastSeenToday: "был(-а) сегодня в {{time}}",
  lastSeenYesterday: "был(-а) вчера в {{time}}",
  lastSeenDate: "был(-а) {{date}} в {{time}}",
  mobile: "Телефон",
  username: "Имя пользователя",
  birthday: "Дата рождения",
  publications: "Публикации",
  gifts: "Подарки",
  archive: "Архив",
  allStories: "Публичные публикации",
  likes: "Лайки",
  giftsPublic: "Подарки",
  emptyPublications: "Пока нет публичных публикаций",
  emptyGifts: "Пока нет публичных подарков",
  emptyArchive: "Архив пуст",
  fullscreenHint: "Нажмите на видео, чтобы открыть. Нажмите на фото, чтобы открыть на весь экран.",
  unknownUser: "Пользователь",
  chat: "Чат",
  group: "Группа",
  channel: "Канал",
  business: "Бизнес",
  bot: "Бот",
  info: "Инфо",
  settings: "Настройки",
  premium: "Премиум",
  premiumStyle: "Премиум стиль",
  members: "участников",
  groupMembers: "Участники группы",
  noGroupMembers: "Участники пока не добавлены",
  memberInvited: "Приглашение сохранено",
  memberRemoved: "Участник удалён",
  promoteAdmin: "Сделать админом",
  demoteMember: "Сделать участником",
  ownerRole: "Владелец",
  adminRole: "Админ",
  memberRole: "Участник",
  pendingJoinRequests: "Заявки на вступление",
  noPendingJoinRequests: "Нет ожидающих заявок",
  approve: "Принять",
  reject: "Отклонить",
  joinRequestApproved: "Заявка принята",
  joinRequestRejected: "Заявка отклонена",
  inviteRegenerated: "Ссылка обновлена",
  subscribers: "подписчиков",
  roomType: "Тип комнаты",
  openChat: "Открыть чат",
  openChatSubtitle: "Вернуться в комнату и продолжить переписку.",
  notifications: "Уведомления",
  notificationsSubtitle: "Включить или отключить push и внутренние уведомления для этой комнаты.",
  pin: "Закрепить",
  unpin: "Открепить",
  privateList: "Переместить в приватные",
  mainList: "Вернуть в основной список",
  markRead: "Отметить прочитанным",
  markUnread: "Отметить непрочитанным",
  media: "Медиа",
  mediaSubtitle: "Публичные фото, видео и файлы.",
  addMembers: "Добавить участников",
  addMembersSubtitle: "Пригласить новых участников в группу.",
  admins: "Админы",
  adminsSubtitle: "Роли и доступ к модерации.",
  subscribersSubtitle: "Аудитория и охват канала.",
  delete: "Удалить",
  deleteSubtitle: "Убрать эту комнату из текущего списка мессенджера.",
  close: "Закрыть",
  saved: "Сохранено",
  on: "Вкл",
  off: "Выкл",
  adminOnlyMessaging: "Писать могут только админы",
  adminOnlyMedia: "Медиа могут отправлять только админы",
  adminOnlyInvites: "Приглашать могут только админы",
  approveJoinRequests: "Подтверждать заявки на вступление",
  autoDeleteAds: "Автоудаление рекламы",
  autoDeletePromoLeaflets: "Автоудаление промо-рассылок",
  autoDeleteLinks: "Автоудаление подозрительных ссылок",
  autoBanRepeatedSpam: "Автобан за повторный спам",
  blacklist: "Чёрный список",
  blacklistSubtitle: "Заблокированные пользователи не могут писать и возвращаться, пока их не удалят из списка.",
  inviteLink: "Ссылка-приглашение",
  regenerateLink: "Пересоздать ссылку",
  sendInvite: "Отправить приглашение",
  ownerTools: "Инструменты владельца",
  ownerToolsSubtitle: "Только владелец группы может менять правила модерации и публикации.",
  enterUserId: "Введите username или user ID",
  add: "Добавить",
  remove: "Убрать",
  botAssistant: "AI бот",
  botService: "Сервисный бот",
  botBusiness: "Бизнес бот",
  botSubtitle: "Автоматизация, ассистент и бизнес-функции.",
  publicBanner: "Публичный профиль",
  settingsOnlyOwner: "Эти функции показываются в настройках только владельцу.",
  groupSettings: "Настройки группы",
  channelSettings: "Настройки канала",
  botSettings: "Настройки бота",
  publishingAdminsOnly: "Публиковать могут только владелец и админы",
  approveSubscribers: "Подтверждать заявки подписчиков",
  channelReactions: "Разрешить реакции на посты канала",
  channelComments: "Разрешить комментарии под постами",
  visibleInDiscovery: "Показывать в публичном поиске",
  openOwnerPanel: "Открыть панель владельца",
  ownerPanelSubtitle: "Отдельное пространство управления для владельца.",
  botPublicVisible: "Показывать бота в публичном поиске",
  botInlineEnabled: "Включить inline режим",
  botAutoReplyEnabled: "Включить автоответы",
  botMarketplaceLinked: "Подключить бота к маркетплейсу",
  botDeliveryLinked: "Подключить бота к доставке",
  botBusinessRoutingEnabled: "Использовать бизнес-маршрут для платежей",
  businessRoutingNote: "Доход бизнес-бота должен идти по бизнес-маршруту.",
  deleteGroup: "Удалить группу",
  deleteChannel: "Удалить канал",
  deleteBot: "Удалить бота",
};

const CHAT_PARTNER_INFO_UZ_FALLBACKS: Partial<Record<ChatPartnerInfoTextKey, string>> = {
  you: "Siz",
  online: "Onlayn",
  offline: "Oflayn",
  lastSeenToday: "oxirgi marta bugun {{time}} da ko'rilgan",
  lastSeenYesterday: "oxirgi marta kecha {{time}} da ko'rilgan",
  lastSeenDate: "oxirgi marta {{date}} kuni {{time}} da ko'rilgan",
  mobile: "Telefon",
  username: "Имя пользователя",
  birthday: "Tug'ilgan sana",
  publications: "Publikatsiyalar",
  gifts: "Sovg'alar",
  archive: "Arxiv",
  allStories: "Ochiq postlar",
  likes: "Layklar",
  giftsPublic: "Sovg'alar",
  emptyPublications: "Hali ochiq postlar yo'q",
  emptyGifts: "Hali ochiq sovg'alar yo'q",
  emptyArchive: "Arxiv bo'sh",
  fullscreenHint: "Videoni ochish uchun bosing. Suratni to'liq ekranda ochish uchun bosing.",
  unknownUser: "Foydalanuvchi",
  chat: "Chat",
  group: "Guruh",
  channel: "Kanal",
  business: "Biznes",
  bot: "Bot",
  info: "Info",
  settings: "Sozlamalar",
  premium: "Premium",
  premiumStyle: "Premium uslub",
  members: "a'zo",
  groupMembers: "Guruh a'zolari",
  noGroupMembers: "Hali a'zolar qo'shilmagan",
  memberInvited: "Taklif saqlandi",
  memberRemoved: "A'zo olib tashlandi",
  promoteAdmin: "Admin qilish",
  demoteMember: "A'zo qilish",
  ownerRole: "Egasi",
  adminRole: "Admin",
  memberRole: "A'zo",
  pendingJoinRequests: "Qo'shilish so'rovlari",
  noPendingJoinRequests: "Kutilayotgan so'rovlar yo'q",
  approve: "Tasdiqlash",
  reject: "Rad etish",
  joinRequestApproved: "So'rov tasdiqlandi",
  joinRequestRejected: "So'rov rad etildi",
  inviteRegenerated: "Taklif havolasi yangilandi",
  subscribers: "obunachi",
  roomType: "Xona turi",
  openChat: "Chatni ochish",
  openChatSubtitle: "Xonaga qaytib, yozishni davom ettiring.",
  notifications: "Bildirishnomalar",
  notificationsSubtitle: "Bu xona uchun push va ichki bildirishnomalarni yoqing yoki o'chiring.",
  pin: "Pin qilish",
  unpin: "Pinni olib tashlash",
  privateList: "Shaxsiy ro'yxatga o'tkazish",
  mainList: "Asosiy ro'yxatga qaytarish",
  markRead: "O'qilgan deb belgilash",
  markUnread: "O'qilmagan deb belgilash",
  media: "Media",
  mediaSubtitle: "Ochiq foto, video va fayllar.",
  addMembers: "A'zolarni qo'shish",
  addMembersSubtitle: "Guruhga yangi a'zolarni taklif qilish.",
  admins: "Adminlar",
  adminsSubtitle: "Rollar va moderatsiya huquqlari.",
  subscribersSubtitle: "Auditoriya va kanal qamrovi.",
  delete: "O'chirish",
  deleteSubtitle: "Bu xonani joriy messenjer ro'yxatidan olib tashlash.",
  close: "Yopish",
  saved: "Saqlandi",
  on: "Yoqilgan",
  off: "O'chirilgan",
  groupSettings: "Guruh sozlamalari",
  channelSettings: "Kanal sozlamalari",
  botSettings: "Bot sozlamalari",
};

function localizeChatPartnerInfoTexts<T extends Record<string, string>>(input: T, language: string): T {
  const normalized = normalizeLocaleCode(language);
  const localeMap = normalized.startsWith("ru")
    ? CHAT_PARTNER_INFO_RU_FALLBACKS
    : normalized.startsWith("uz")
      ? CHAT_PARTNER_INFO_UZ_FALLBACKS
      : null;

  if (!localeMap) return input;

  const output: Record<string, string> = { ...input };

  (Object.keys(CHAT_PARTNER_INFO_EN_DEFAULTS) as ChatPartnerInfoTextKey[]).forEach((key) => {
    const currentValue = output[key];
    const localizedValue = localeMap[key];

    if (
      currentValue === CHAT_PARTNER_INFO_EN_DEFAULTS[key] &&
      typeof localizedValue === "string" &&
      localizedValue.trim()
    ) {
      output[key] = localizedValue;
    }
  });

  return output as T;
}

const TEXT = "#F5FBFF";
const TEXT_SOFT = "rgba(245,251,255,0.78)";
const MUTED = "#A8C3D7";
const GLASS_BORDER = "rgba(255,255,255,0.10)";
const GOLD = "#FFCC66";
const PURPLE = "#B588FF";
const DANGER = "#FF88CA";

function withAlpha(color: string, alpha: number) {
  const safeAlpha = Math.max(0, Math.min(1, alpha));
  const value = String(color || "").trim();

  if (value.startsWith("#")) {
    let hex = value.slice(1);

    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .slice(0, 3)
        .split("")
        .map((char) => char + char)
        .join("");
    } else if (hex.length === 8) {
      hex = hex.slice(0, 6);
    }

    if (hex.length === 6) {
      const r = Number.parseInt(hex.slice(0, 2), 16);
      const g = Number.parseInt(hex.slice(2, 4), 16);
      const b = Number.parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
    }
  }

  const rgbMatch = value.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/i);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${safeAlpha})`;
  }

  const rgbaMatch = value.match(
    /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\s*\)$/i,
  );
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${safeAlpha})`;
  }

  return value;
}

function normalizeLocaleCode(input?: string | null) {
  return String(input ?? "")
    .trim()
    .replace(/_/g, "-")
    .toLowerCase();
}

function resolvePresenceUserId(input?: string | null) {
  const direct = String(input ?? "").trim();
  if (direct) return direct;

  const globalRecord = globalThis as Record<string, unknown>;
  const globalCandidates = [
    globalRecord.__SABI_USER_ID__,
    globalRecord.__SABI_CURRENT_USER_ID__,
    globalRecord.__SABI_AUTH_USER_ID__,
    globalRecord.__SABI_SESSION_USER_ID__,
  ];

  for (const candidate of globalCandidates) {
    const value = String(candidate ?? "").trim();
    if (value) return value;
  }

  try {
    const webStorage = (globalThis as { localStorage?: Storage }).localStorage;
    if (webStorage) {
      const storageKeys = [
        "sabi_user_id",
        "SABI_USER_ID",
        "currentUserId",
        "userId",
      ];

      for (const key of storageKeys) {
        const value = String(webStorage.getItem(key) ?? "").trim();
        if (value) return value;
      }
    }
  } catch {
    // localStorage is not available on native branches
  }

  return "";
}

function toPair(value: unknown, fallback: [string, string]): [string, string] {
  if (Array.isArray(value) && value.length >= 2) {
    return [
      typeof value[0] === "string" ? value[0] : fallback[0],
      typeof value[1] === "string" ? value[1] : fallback[1],
    ];
  }
  return fallback;
}

function toQuad(
  value: unknown,
  fallback: [string, string, string, string],
): [string, string, string, string] {
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

function buildPartnerTheme(
  state: MessengerThemeState,
  palette: MessengerThemePalette,
  premiumAccent?: string,
): PartnerTheme {
  const anyPalette = palette as MessengerThemePalette & {
    background?: [string, string, string, string];
    surface?: [string, string];
    surfaceRaised?: [string, string];
    card?: [string, string];
    cardSoft?: [string, string];
    accentAlt?: string;
  };

  const hasWallpaper = Boolean(state.wallpaperUri);
  const accent =
    typeof premiumAccent === "string" && premiumAccent.trim()
      ? premiumAccent.trim()
      : typeof palette.accent === "string"
        ? palette.accent
        : "#1ED7A5";
  const accentSoft = typeof palette.accentSoft === "string" ? palette.accentSoft : "#D7FFF1";
  const accentAlt =
    typeof anyPalette.accentAlt === "string" && anyPalette.accentAlt
      ? anyPalette.accentAlt
      : accentSoft;

  return {
    background: toQuad(anyPalette.background, ["#03110E", "#061714", "#0A211B", "#0D2821"]),
    card: hasWallpaper
      ? ["rgba(10,15,24,0.42)", "rgba(10,15,24,0.26)"]
      : toPair(anyPalette.surface ?? anyPalette.card, [
          "rgba(12,39,32,0.90)",
          "rgba(9,29,24,0.82)",
        ]),
    raised: hasWallpaper
      ? ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]
      : toPair(anyPalette.surfaceRaised ?? anyPalette.cardSoft, [
          "rgba(255,255,255,0.08)",
          "rgba(255,255,255,0.03)",
        ]),
    accent,
    accentSoft,
    accentAlt,
    textMain: typeof palette.textMain === "string" ? palette.textMain : TEXT,
    textSecondary: typeof palette.textSecondary === "string" ? palette.textSecondary : TEXT_SOFT,
    wallpaperUri: typeof state.wallpaperUri === "string" ? state.wallpaperUri : "",
  };
}

function resolveAvatarLetter(letter?: string | null, name?: string | null) {
  const raw = String(letter || name || "")
    .trim()
    .replace(/^\+/, "");
  const hit = raw.match(/[A-Za-zА-Яа-яЁё0-9]/);
  return String(hit?.[0] || raw[0] || "S").toUpperCase();
}

function buildHandle(name?: string | null, fallback = "sabiuser") {
  const normalized = String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/gi, "_")
    .replace(/^_+|_+$/g, "");
  return `@${normalized || fallback}`;
}

function parseJsonArray<T>(value?: string | string[]): T[] {
  if (Array.isArray(value)) {
    const first = value[0];
    if (!first) return [];
    try {
      const parsed = JSON.parse(first);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}


type PublicProfileLike = {
  avatarUri?: string;
  coverUri?: string;
  publicationPhotos?: unknown;
  publicationVideos?: unknown;
  publicGifts?: unknown;
  publicationGifts?: unknown;
  gifts?: unknown;
  likesCount?: number;
  publicGiftsCount?: number;
  updatedAt?: number;
};

function formatMediaDuration(ms?: number | null) {
  const safe = Math.max(0, Math.floor((ms ?? 0) / 1000));
  const minutes = `${Math.floor(safe / 60)}`.padStart(2, "0");
  const seconds = `${safe % 60}`.padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function normalizePublicProfileMediaUri(value?: string | null) {
  const uri = String(value ?? "").trim();
  if (!uri || isLocalOnlyUserProfileMediaUri(uri)) return "";
  return resolveUserProfileMediaUrl(uri, getAuthSessionState());
}

function normalizePublicMediaList(value: unknown): PublicMediaItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      const raw = (item ?? {}) as Partial<PublicMediaItem> & { thumbnailUri?: string; mediaUri?: string; mimeType?: string; durationMs?: number };
      const kind = raw.kind === "video" ? "video" : "photo";
      const mediaUri = normalizePublicProfileMediaUri(raw.mediaUri) || normalizePublicProfileMediaUri(raw.uri);
      const thumbnailUri = normalizePublicProfileMediaUri(raw.thumbnailUri);
      const uri = kind === "video"
        ? thumbnailUri || mediaUri
        : normalizePublicProfileMediaUri(raw.uri) || mediaUri || thumbnailUri;
      const openUri = mediaUri || uri || thumbnailUri;
      if (!uri && !openUri) return null;

      return {
        id: String(raw.id ?? `media-${index}`),
        uri: uri || openUri,
        kind,
        thumbnailUri: thumbnailUri || undefined,
        mediaUri: openUri || undefined,
        mimeType: typeof raw.mimeType === "string" ? raw.mimeType : undefined,
        views: typeof raw.views === "number" ? raw.views : 0,
        duration: typeof raw.duration === "string" ? raw.duration : typeof raw.durationMs === "number" ? formatMediaDuration(raw.durationMs) : undefined,
        liked: typeof raw.liked === "boolean" ? raw.liked : undefined,
      } as PublicMediaItem;
    })
    .filter((item): item is PublicMediaItem => Boolean(item));
}

function resolveMediaPreviewUri(item: PublicMediaItem) {
  if (item.kind === "photo") {
    return String(item.uri || item.mediaUri || item.thumbnailUri || "").trim();
  }
  return String(item.thumbnailUri || "").trim();
}

function resolveMediaOpenUri(item: PublicMediaItem) {
  return String(item.mediaUri || item.uri || item.thumbnailUri || "").trim();
}

function countLikedPublicMedia(photos: PublicMediaItem[], videos: PublicMediaItem[]) {
  return [...photos, ...videos].filter((media) => Boolean(media?.liked)).length;
}

function goBackOrMessenger() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace("/private-chats" as never);
}

function isSamePublicProfileIdentity(
  aliases: string[],
  values: Array<string | null | undefined>,
) {
  const normalizedAliases = new Set(
    aliases.map((value) => String(value || "").trim().replace(/^@+/, "").toLowerCase()).filter(Boolean),
  );
  return values.some((value) => {
    const normalized = String(value || "").trim().replace(/^@+/, "").toLowerCase();
    return Boolean(normalized && normalizedAliases.has(normalized));
  });
}

function isRenderableMediaUri(value?: string | null) {
  const uri = String(value ?? "").trim();
  if (!uri) return false;
  return /^(https?:|data:|file:|content:|asset:|blob:)/i.test(uri);
}

function PublicMediaPreview({ item }: { item: PublicMediaItem }) {
  const [failed, setFailed] = useState(false);
  const previewUri = resolveMediaPreviewUri(item);
  const openUri = resolveMediaOpenUri(item);
  const hasPreview = isRenderableMediaUri(previewUri);
  const hasOpenUri = isRenderableMediaUri(openUri);

  if (!failed && item.kind === "video" && hasPreview && previewUri !== openUri) {
    return (
      <Image
        source={{ uri: previewUri }}
        style={styles.storyImage}
        resizeMode="cover"
        onError={() => setFailed(true)}
      />
    );
  }

  if (!failed && item.kind !== "video" && hasPreview) {
    return (
      <Image
        source={{ uri: previewUri }}
        style={styles.storyImage}
        resizeMode="cover"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <LinearGradient
      colors={["rgba(59,210,255,0.28)", "rgba(137,88,255,0.22)", "rgba(0,0,0,0.46)"]}
      style={[styles.storyImage, styles.mediaFallbackPreview]}
    >
      {item.kind === "video" ? (
        <Play size={24} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2.4} />
      ) : (
        <ImageIcon size={24} color="#FFFFFF" strokeWidth={2.4} />
      )}
    </LinearGradient>
  );
}

function normalizePublicGiftList(value: unknown): PublicGiftItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      const raw = (item ?? {}) as Partial<PublicGiftItem>;
      const emoji = typeof raw.emoji === "string" ? raw.emoji : undefined;
      const imageUri = typeof raw.imageUri === "string" ? raw.imageUri.trim() : "";
      const title = typeof raw.title === "string" ? raw.title : "";

      if (!emoji && !imageUri) return null;

      return {
        id: String(raw.id ?? `gift-${index}`),
        title,
        emoji,
        imageUri: imageUri || undefined,
      } as PublicGiftItem;
    })
    .filter((item): item is PublicGiftItem => Boolean(item));
}

function readPublicProfileText(profile: unknown, keys: string[]): string {
  if (!profile || typeof profile !== "object") return "";
  const source = profile as Record<string, unknown>;

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function hasMeaningfulPublicProfile(snapshot: unknown) {
  if (!snapshot || typeof snapshot !== "object") return false;

  const profile = snapshot as PublicProfileLike;
  const avatarUri = String(profile.avatarUri ?? "").trim();
  const coverUri = String(profile.coverUri ?? "").trim();
  const photos = normalizePublicMediaList(profile.publicationPhotos);
  const videos = normalizePublicMediaList(profile.publicationVideos);
  const gifts = [
    ...normalizePublicGiftList(profile.publicGifts),
    ...normalizePublicGiftList(profile.publicationGifts),
    ...normalizePublicGiftList(profile.gifts),
  ];

  return Boolean(
    avatarUri ||
      coverUri ||
      photos.length ||
      videos.length ||
      gifts.length ||
      (typeof profile.likesCount === "number" && Number.isFinite(profile.likesCount) && profile.likesCount > 0) ||
      (typeof profile.publicGiftsCount === "number" && Number.isFinite(profile.publicGiftsCount) && profile.publicGiftsCount > 0) ||
      (typeof profile.updatedAt === "number" && Number.isFinite(profile.updatedAt) && profile.updatedAt > 0),
  );
}

function pickMeaningfulProfile<T>(...candidates: Array<T | null | undefined>) {
  for (const candidate of candidates) {
    if (hasMeaningfulPublicProfile(candidate)) {
      return candidate as T;
    }
  }
  return null;
}

function parsePresenceParam(value?: string | null) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return null;

  if (["1", "true", "yes", "online", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "offline", "off"].includes(normalized)) return false;

  return null;
}

function parseOnlineStatusText(value?: string | null) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (!normalized) return null;

  const onlineStates = new Set([
    "online",
    "onlayn",
    "в сети",
    "онлайн",
  ]);

  const offlineStates = new Set([
    "offline",
    "oflayn",
    "не в сети",
    "оффлайн",
  ]);

  if (onlineStates.has(normalized)) return true;
  if (offlineStates.has(normalized)) return false;

  return null;
}

function formatCount(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  if (value >= 1000) {
    const compact = value / 1000;
    return compact % 1 === 0 ? `${compact.toFixed(0)}K` : `${compact.toFixed(1)}K`;
  }
  return String(value);
}

function formatLastSeen(
  value: string | null,
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
  const timeText = new Intl.DateTimeFormat(locale || undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startToday - startDate) / 86400000);

  if (diffDays <= 0) return labels.lastSeenToday.replace("{{time}}", timeText);
  if (diffDays === 1) return labels.lastSeenYesterday.replace("{{time}}", timeText);

  const dateText = new Intl.DateTimeFormat(locale || undefined, {
    day: "2-digit",
    month: "short",
  }).format(date);

  return labels.lastSeenDate.replace("{{date}}", dateText).replace("{{time}}", timeText);
}

function parseIntParam(value?: string | string[] | null, fallback = 0) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeRoomType(value?: string | null): RoomType {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "group" || raw === "channel" || raw === "business") return raw;
  return "direct";
}

function roomTypeIcon(roomType: RoomType, isBot: boolean) {
  if (isBot) return Bot;
  if (roomType === "group") return Users;
  if (roomType === "channel") return Hash;
  if (roomType === "business") return BriefcaseBusiness;
  return MessageCircleMore;
}

function roomTypeLabel(roomType: RoomType, texts: Record<string, string>, isBot: boolean) {
  if (isBot) return texts.bot;
  if (roomType === "group") return texts.group;
  if (roomType === "channel") return texts.channel;
  if (roomType === "business") return texts.business;
  return texts.chat;
}


function isOpaqueProfileIdentifier(value: string | null | undefined): boolean {
  const normalized = String(value ?? "").trim();
  if (!normalized) return false;

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)) {
    return true;
  }

  if (/^(chat|room|private|direct|user|peer|contact)[:_-]/i.test(normalized)) {
    return true;
  }

  if (/^[a-z0-9_-]{18,}$/i.test(normalized) && !normalized.includes("@") && !normalized.startsWith("+")) {
    return true;
  }

  return false;
}

function isVisiblePhoneValue(value: string | null | undefined): boolean {
  const normalized = String(value ?? "").trim();
  if (!normalized) return false;
  return /^\+?\d[\d\s().-]{5,}$/.test(normalized);
}

function readProfilePhone(profile: PrivateChatProfileSnapshot | null) {
  if (!profile || typeof profile !== "object") return "";
  const record = profile as Record<string, unknown>;
  const candidates = [
    record.phone,
    record.partnerPhone,
    record.peerPhone,
    record.contactPhone,
    record.mobile,
    record.msisdn,
    record.publicPhone,
    record.profilePhone,
    record.subtitle,
  ];

  for (const candidate of candidates) {
    const value = String(candidate ?? "").trim();
    if (!value) continue;
    if (value === "+998900000000" || value === "+998 90 000 00 00") continue;
    if (value.startsWith("@")) continue;
    if (isOpaqueProfileIdentifier(value)) continue;
    if (!isVisiblePhoneValue(value)) continue;
    return value;
  }

  return "";
}

function InfoRow({
  label,
  value,
  border,
}: {
  label: string;
  value: string;
  border?: boolean;
}) {
  return (
    <View style={[styles.infoRow, border && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SegmentChip({
  active,
  label,
  onPress,
  accent,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  accent: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.segmentWrap}>
      {({ pressed }) => (
        <View style={[styles.segmentChip, active && styles.segmentChipActive, pressed && styles.pressed]}>
          <LinearGradient
            colors={
              active
                ? [accent, "rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]
                : ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.03)", "rgba(255,255,255,0.01)"]
            }
            style={styles.segmentGlass}
          />
          <View style={styles.segmentGloss} />
          <Text style={[styles.segmentText, active && styles.segmentTextActive]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function GlassActionButton({
  icon: Icon,
  onPress,
  colors,
  iconColor,
  animated = false,
  style,
  iconSize = 20,
}: GlassActionButtonProps) {
  const pulse = useRef(new Animated.Value(0.92)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) return;

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.12,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.92,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2100,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
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
    Animated.spring(pressScale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 32,
      bounciness: 5,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(pressScale, {
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
    <Animated.View style={[styles.glassButtonOuter, style, { transform: [{ scale: pressScale }] }]}>
      {animated ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glassButtonPulse,
            {
              opacity: pulseOpacity,
              transform: [{ scale: pulse }],
            },
          ]}
        />
      ) : null}

      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.glassButtonPressable}>
        <LinearGradient colors={colors} style={styles.roundButton}>
          <View style={styles.roundButtonEdge} />
          <View style={styles.buttonGloss} />
          {animated ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.buttonShimmer,
                { transform: [{ translateX: shimmerTranslate }, { rotate: "18deg" }] },
              ]}
            />
          ) : null}
          <Icon size={iconSize} strokeWidth={2.3} color={iconColor} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function BackgroundFrame({
  theme,
  children,
}: {
  theme: PartnerTheme;
  children: React.ReactNode;
}) {
  if (theme.wallpaperUri) {
    return (
      <ImageBackground source={{ uri: theme.wallpaperUri }} style={styles.gradient} resizeMode="cover">
        <LinearGradient
          colors={["rgba(6,8,14,0.18)", "rgba(6,8,14,0.28)", "rgba(6,8,14,0.38)"]}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </ImageBackground>
    );
  }

  return <LinearGradient colors={theme.background} style={styles.gradient}>{children}</LinearGradient>;
}

type ChannelOwnerSettings = {
  postingAdminsOnly: boolean;
  approveSubscribers: boolean;
  reactionsEnabled: boolean;
  commentsEnabled: boolean;
  visibleInDiscovery: boolean;
};

type BotOwnerSettings = {
  publicVisible: boolean;
  inlineEnabled: boolean;
  autoReplyEnabled: boolean;
  marketplaceLinked: boolean;
  deliveryLinked: boolean;
  businessRoutingEnabled: boolean;
};

const CHANNEL_OWNER_SETTINGS_STORE = new Map<string, ChannelOwnerSettings>();
const BOT_OWNER_SETTINGS_STORE = new Map<string, BotOwnerSettings>();

const CHANNEL_OWNER_SETTINGS_STORAGE_KEY = "messenger_chat_partner_channel_owner_settings_v1";
const BOT_OWNER_SETTINGS_STORAGE_KEY = "messenger_chat_partner_bot_owner_settings_v1";
let ownerSettingsHydrationPromise: Promise<void> | null = null;

function normalizeBooleanField(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeChannelOwnerSettings(value: unknown): ChannelOwnerSettings {
  const raw = value && typeof value === "object" ? (value as Partial<ChannelOwnerSettings>) : {};

  return {
    postingAdminsOnly: normalizeBooleanField(raw.postingAdminsOnly, true),
    approveSubscribers: normalizeBooleanField(raw.approveSubscribers, false),
    reactionsEnabled: normalizeBooleanField(raw.reactionsEnabled, true),
    commentsEnabled: normalizeBooleanField(raw.commentsEnabled, false),
    visibleInDiscovery: normalizeBooleanField(raw.visibleInDiscovery, true),
  };
}

function normalizeBotOwnerSettings(
  value: unknown,
  businessDefault: boolean,
): BotOwnerSettings {
  const raw = value && typeof value === "object" ? (value as Partial<BotOwnerSettings>) : {};

  return {
    publicVisible: normalizeBooleanField(raw.publicVisible, true),
    inlineEnabled: normalizeBooleanField(raw.inlineEnabled, true),
    autoReplyEnabled: normalizeBooleanField(raw.autoReplyEnabled, true),
    marketplaceLinked: normalizeBooleanField(raw.marketplaceLinked, false),
    deliveryLinked: normalizeBooleanField(raw.deliveryLinked, false),
    businessRoutingEnabled: normalizeBooleanField(raw.businessRoutingEnabled, businessDefault),
  };
}

function parseSettingsRecord<T>(
  value: unknown,
  normalize: (snapshot: unknown) => T,
): Record<string, T> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const output: Record<string, T> = {};
  Object.entries(value as Record<string, unknown>).forEach(([key, snapshot]) => {
    const safeKey = String(key || "").trim();
    if (!safeKey) return;
    output[safeKey] = normalize(snapshot);
  });

  return output;
}

async function hydrateOwnerSettingsStores() {
  if (ownerSettingsHydrationPromise) return ownerSettingsHydrationPromise;

  ownerSettingsHydrationPromise = (async () => {
    try {
      const [channelRaw, botRaw] = await Promise.all([
        appStorage.getString(CHANNEL_OWNER_SETTINGS_STORAGE_KEY),
        appStorage.getString(BOT_OWNER_SETTINGS_STORAGE_KEY),
      ]);

      if (channelRaw) {
        const parsed = parseSettingsRecord(
          JSON.parse(channelRaw),
          normalizeChannelOwnerSettings,
        );
        Object.entries(parsed).forEach(([chatId, snapshot]) => {
          CHANNEL_OWNER_SETTINGS_STORE.set(chatId, snapshot);
        });
      }

      if (botRaw) {
        const parsed = parseSettingsRecord(JSON.parse(botRaw), (snapshot) =>
          normalizeBotOwnerSettings(snapshot, false),
        );
        Object.entries(parsed).forEach(([chatId, snapshot]) => {
          BOT_OWNER_SETTINGS_STORE.set(chatId, snapshot);
        });
      }
    } catch {
      // Corrupted owner settings cache must not block Messenger startup.
    }
  })();

  return ownerSettingsHydrationPromise;
}

function persistChannelOwnerSettingsStore() {
  const snapshot = Object.fromEntries(CHANNEL_OWNER_SETTINGS_STORE.entries());
  void appStorage.setString(CHANNEL_OWNER_SETTINGS_STORAGE_KEY, JSON.stringify(snapshot));
}

function persistBotOwnerSettingsStore() {
  const snapshot = Object.fromEntries(BOT_OWNER_SETTINGS_STORE.entries());
  void appStorage.setString(BOT_OWNER_SETTINGS_STORAGE_KEY, JSON.stringify(snapshot));
}



function readChannelOwnerSettings(chatId: string): ChannelOwnerSettings {
  return normalizeChannelOwnerSettings(CHANNEL_OWNER_SETTINGS_STORE.get(chatId));
}

function writeChannelOwnerSettings(chatId: string, patch: Partial<ChannelOwnerSettings>) {
  const current = readChannelOwnerSettings(chatId);
  CHANNEL_OWNER_SETTINGS_STORE.set(chatId, normalizeChannelOwnerSettings({ ...current, ...patch }));
  persistChannelOwnerSettingsStore();
}

function readBotOwnerSettings(chatId: string, businessDefault: boolean): BotOwnerSettings {
  return normalizeBotOwnerSettings(BOT_OWNER_SETTINGS_STORE.get(chatId), businessDefault);
}

function writeBotOwnerSettings(chatId: string, patch: Partial<BotOwnerSettings>, businessDefault: boolean) {
  const current = readBotOwnerSettings(chatId, businessDefault);
  BOT_OWNER_SETTINGS_STORE.set(
    chatId,
    normalizeBotOwnerSettings({ ...current, ...patch }, businessDefault),
  );
  persistBotOwnerSettingsStore();
}

function normalizeBotKind(value?: string | null) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "business" || raw === "service") return raw;
  return "assistant";
}

function ActionRow({
  title,
  subtitle,
  icon,
  onPress,
  danger = false,
  trailing,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.settingsActionWrap, pressed ? styles.pressed : undefined]}>
      <LinearGradient
        colors={danger ? ["rgba(109,24,38,0.88)", "rgba(62,15,24,0.86)"] : ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.03)"]}
        style={[
          styles.settingsAction,
          { borderColor: danger ? "rgba(255,184,196,0.16)" : "rgba(255,255,255,0.08)" },
        ]}
      >
        <View style={styles.settingsIconWrap}>{icon}</View>
        <View style={styles.settingsTextWrap}>
          <Text style={[styles.settingsTitle, danger ? styles.settingsTitleDanger : undefined]}>{title}</Text>
          {subtitle ? <Text style={styles.settingsSubtitle}>{subtitle}</Text> : null}
        </View>
        {trailing ?? <ChevronRight size={16} color="rgba(245,251,255,0.66)" strokeWidth={2.4} />}
      </LinearGradient>
    </Pressable>
  );
}

function ToggleRow({
  title,
  subtitle,
  value,
  onValueChange,
  icon,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  icon: React.ReactNode;
}) {
  return (
    <ActionRow
      title={title}
      subtitle={subtitle}
      icon={icon}
      trailing={<Switch value={value} onValueChange={onValueChange} />}
    />
  );
}

type PrivateChatProfileSnapshot = Awaited<ReturnType<typeof getPrivateChatProfile>>;

export default function ChatPartnerInfoScreen() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<RouteParams>();
  const { language, t } = useI18n();
  const [themeState, setThemeState] = useState<MessengerThemeState>(getMessengerThemeState());
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [runtimeRevision, setRuntimeRevision] = useState(0);
  const [publicProfileRevision, setPublicProfileRevision] = useState(0);

  useFocusEffect(
    useCallback(() => {
      void hydrateMessengerThemeState().then((next) => setThemeState(next));
    }, []),
  );

  useEffect(() => {
    let mounted = true;

    void hydratePublicProfileStorage().then(() => {
      if (mounted) {
        setPublicProfileRevision((value) => value + 1);
      }
    });

    const unsubscribe = subscribePublicProfiles(() => {
      setPublicProfileRevision((value) => value + 1);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const roomTypeForFetch = normalizeRoomType(params.roomType);
    if (roomTypeForFetch !== "direct") return;

    const identifiers = [
      typeof params.peerId === "string" ? params.peerId : "",
      typeof params.partnerId === "string" ? params.partnerId : "",
      typeof params.targetUserId === "string" ? params.targetUserId : "",
      typeof params.userId === "string" ? params.userId : "",
      typeof params.chatId === "string" ? params.chatId : "",
      typeof params.id === "string" ? params.id : "",
      typeof params.phone === "string" ? params.phone : "",
      typeof params.handle === "string" ? params.handle : "",
    ]
      .map((value) => String(value || "").trim())
      .filter(Boolean);

    const uniqueIdentifiers = Array.from(new Set(identifiers));
    if (!uniqueIdentifiers.length) return;

    let active = true;

    void (async () => {
      const auth = getAuthSessionState();

      for (const identifier of uniqueIdentifiers) {
        try {
          const surface = await fetchUserPublicProfileSurface(identifier, {
            apiBaseUrl: auth.apiBaseUrl,
            accessToken: auth.accessToken,
            currentUserId: auth.currentUserId,
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

          savePublicProfile(surface.chatId || identifier, surface as any, aliases);
          aliases.forEach((alias) => {
            if (alias && alias !== (surface.chatId || identifier)) {
              savePublicProfile(alias, surface as any, aliases);
            }
          });

          setPublicProfileRevision((value) => value + 1);
          return;
        } catch {
          // Try next identifier. Public profile fetch must not block the info screen.
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [params.chatId, params.handle, params.id, params.partnerId, params.peerId, params.phone, params.roomType, params.targetUserId, params.userId]);

  const roomType = normalizeRoomType(params.roomType);
  const isBot = String(params.isBot || "0") === "1";
  const routeGroupRole = String(params.groupRole || "").trim().toLowerCase() as GroupRole | "";
  const routeOwnerFlag = String(params.isGroupOwner || "0") === "1";
  const routeChannelRole = String(params.channelRole || "").trim().toLowerCase() as GroupRole | "";
  const routeChannelOwnerFlag = String(params.isChannelOwner || "0") === "1";
  const isBotOwnedByMe = String(params.isBotOwnedByMe || "0") === "1";
  const premiumActive = String(params.premiumActive || "0") === "1";
  const premiumTier = String(params.premiumTier || "").trim();
  const premiumStyleId = String(params.premiumStyleId || "").trim();
  const premiumAccent = String(params.premiumAccent || "").trim();

  const palette = useMemo(() => getMessengerThemePalette(themeState.themeId), [themeState.themeId]);
  const theme = useMemo(
    () => buildPartnerTheme(themeState, palette, premiumActive ? premiumAccent : undefined),
    [themeState, palette, premiumAccent, premiumActive],
  );

  const txAny = useCallback(
    (keys: string[], fallback = "") => {
      for (const key of keys) {
        const value = t(key);
        if (typeof value === "string" && value.trim() && value !== key) return value;
      }
      return fallback;
    },
    [t],
  );

  const rawTexts = useMemo(
    () => ({
      you: txAny(["common.you", "messenger.you", "profile.you"], "You"),
      online: txAny(["common.online", "messenger.online"], "Online"),
      offline: txAny(["common.offline", "messenger.offline"], "Offline"),
      lastSeenToday: txAny(["messenger.chat.lastSeenToday"], "last seen today at {{time}}"),
      lastSeenYesterday: txAny(["messenger.chat.lastSeenYesterday"], "last seen yesterday at {{time}}"),
      lastSeenDate: txAny(["messenger.chat.lastSeenDate"], "last seen on {{date}} at {{time}}"),
      mobile: txAny(["profile.phone", "common.phone"], "Телефон"),
      username: txAny(["profile.username"], "Имя пользователя"),
      birthday: txAny(["profile.birthday"], "Birthday"),
      publications: txAny(["profile.public", "common.public"], "Publications"),
      gifts: txAny(["profile.gifts"], "Gifts"),
      archive: txAny(["profile.archive", "profile.archivePublications"], "Archive"),
      allStories: txAny(["profile.allStories", "profile.storiesAll"], "Public stories"),
      likes: txAny(["profile.likes"], "Likes"),
      giftsPublic: txAny(["profile.gifts"], "Gifts"),
      emptyPublications: txAny(["profile.emptyPublications", "profile.publicationsEmpty"], "No public posts yet"),
      emptyGifts: txAny(["profile.emptyGifts", "profile.giftsEmpty"], "No public gifts yet"),
      emptyArchive: txAny(["profile.emptyArchive", "profile.archiveEmpty"], "Archive is empty"),
      fullscreenHint: txAny(["profile.fullscreenHint", "profile.photoFullscreenHint"], "Tap video to open. Tap photo three times for fullscreen."),
      defaultBirthday: "—",
      unknownUser: txAny(["profile.unknownUser", "common.user"], "User"),
      chat: txAny(["messenger.chats", "common.chat"], "Chat"),
      group: txAny(["messenger.groups", "common.groups"], "Group"),
      channel: txAny(["messenger.channels"], "Channel"),
      business: txAny(["common.business"], "Business"),
      bot: txAny(["messenger.botProfile", "common.bot"], "Bot"),
      info: txAny(["common.info"], "Info"),
      settings: txAny(["settings.title", "common.settings"], "Settings"),
      premium: txAny(["profile.premium", "common.premium"], "Premium"),
      premiumStyle: txAny(["profile.premiumStyle"], "Premium style"),
      members: txAny(["common.members", "messenger.members"], "members"),
      groupMembers: txAny(["messenger.groupMembers"], "Group members"),
      noGroupMembers: txAny(["messenger.noGroupMembers"], "No members added yet"),
      memberInvited: txAny(["messenger.memberInvited"], "Invitation saved"),
      memberRemoved: txAny(["messenger.memberRemoved"], "Member removed"),
      promoteAdmin: txAny(["messenger.promoteAdmin"], "Make admin"),
      demoteMember: txAny(["messenger.demoteMember"], "Make member"),
      ownerRole: txAny(["messenger.ownerRole"], "Owner"),
      adminRole: txAny(["messenger.adminRole"], "Admin"),
      memberRole: txAny(["messenger.memberRole"], "Member"),
      pendingJoinRequests: txAny(["messenger.pendingJoinRequests"], "Join requests"),
      noPendingJoinRequests: txAny(["messenger.noPendingJoinRequests"], "No pending requests"),
      approve: txAny(["common.approve", "messenger.approve"], "Approve"),
      reject: txAny(["common.reject", "messenger.reject"], "Reject"),
      joinRequestApproved: txAny(["messenger.joinRequestApproved"], "Request approved"),
      joinRequestRejected: txAny(["messenger.joinRequestRejected"], "Request rejected"),
      inviteRegenerated: txAny(["messenger.inviteRegenerated"], "Invite link updated"),
      subscribers: txAny(["messenger.subscribers"], "subscribers"),
      roomType: txAny(["messenger.roomType"], "Room type"),
      openChat: txAny(["common.open", "messenger.chats"], "Open chat"),
      openChatSubtitle: txAny(["messenger.openChatSubtitle"], "Return to the room and continue messaging."),
      notifications: txAny(["common.notifications"], "Notifications"),
      notificationsSubtitle: txAny(["messenger.notificationsSubtitle"], "Enable or mute push and in-app alerts for this room."),
      pin: txAny(["messenger.pinChat"], "Pin"),
      unpin: txAny(["messenger.unpinChat"], "Unpin"),
      privateList: txAny(["messenger.privateChats", "common.private"], "Move to private"),
      mainList: txAny(["messenger.chats"], "Return to main list"),
      markRead: txAny(["status.read"], "Mark as read"),
      markUnread: txAny(["status.unread"], "Mark as unread"),
      media: txAny(["messenger.media"], "Media"),
      mediaSubtitle: txAny(["messenger.mediaSubtitle"], "Public photos, videos and files."),
      addMembers: txAny(["messenger.addMembers"], "Add members"),
      addMembersSubtitle: txAny(["messenger.addMembersSubtitle"], "Invite new members to the group."),
      admins: txAny(["messenger.admins"], "Admins"),
      adminsSubtitle: txAny(["messenger.adminsSubtitle"], "Roles and moderation access."),
      subscribersSubtitle: txAny(["messenger.subscribersSubtitle"], "Audience and channel reach."),
      delete: txAny(["common.delete"], "Delete"),
      deleteSubtitle: txAny(["messenger.deleteRoomSubtitle"], "Remove this room from the current messenger list."),
      close: txAny(["common.close"], "Close"),
      saved: txAny(["common.saved"], "Saved"),
      on: txAny(["common.on"], "On"),
      off: txAny(["common.off"], "Off"),
      adminOnlyMessaging: txAny(["messenger.adminOnlyMessaging"], "Only admins can write"),
      adminOnlyMedia: txAny(["messenger.adminOnlyMedia"], "Only admins can send media"),
      adminOnlyInvites: txAny(["messenger.adminOnlyInvites"], "Only admins can invite"),
      approveJoinRequests: txAny(["messenger.approveJoinRequests"], "Approve join requests"),
      autoDeleteAds: txAny(["messenger.autoDeleteAds"], "Auto delete ads"),
      autoDeletePromoLeaflets: txAny(["messenger.autoDeletePromoLeaflets"], "Auto delete promo leaflets"),
      autoDeleteLinks: txAny(["messenger.autoDeleteLinks"], "Auto delete suspicious links"),
      autoBanRepeatedSpam: txAny(["messenger.autoBanRepeatedSpam"], "Auto ban repeated spam"),
      blacklist: txAny(["messenger.blacklist"], "Blacklist"),
      blacklistSubtitle: txAny(["messenger.blacklistSubtitle"], "Blocked users cannot write or return until removed."),
      inviteLink: txAny(["messenger.inviteLink"], "Invite link"),
      regenerateLink: txAny(["messenger.regenerateLink"], "Regenerate invite link"),
      sendInvite: txAny(["messenger.sendInvite"], "Send invitation"),
      ownerTools: txAny(["messenger.ownerTools"], "Owner tools"),
      ownerToolsSubtitle: txAny(["messenger.ownerToolsSubtitle"], "Only the group owner can change moderation and posting rules."),
      enterUserId: txAny(["messenger.enterUserId"], "Enter username or user ID"),
      add: txAny(["common.add"], "Add"),
      remove: txAny(["common.remove"], "Remove"),
      botAssistant: txAny(["common.ai"], "Assistant bot"),
      botService: txAny(["common.service"], "Service bot"),
      botBusiness: txAny(["common.business"], "Business bot"),
      botSubtitle: txAny(["messenger.botSubtitle"], "Automation, assistant and business functions."),
      publicBanner: txAny(["profile.public", "common.public"], "Public profile"),
      settingsOnlyOwner: txAny(["messenger.settingsOnlyOwner"], "These functions are shown only in settings for the owner."),
      groupSettings: txAny(["messenger.groupSettings"], "Group settings"),
      channelSettings: txAny(["messenger.channelSettings"], "Channel settings"),
      botSettings: txAny(["messenger.botSettings"], "Bot settings"),
      publishingAdminsOnly: txAny(["messenger.publishingAdminsOnly"], "Only owners and admins can publish"),
      approveSubscribers: txAny(["messenger.approveSubscribers"], "Approve subscriber requests"),
      channelReactions: txAny(["messenger.channelReactions"], "Allow reactions on channel posts"),
      channelComments: txAny(["messenger.channelComments"], "Allow comments under posts"),
      visibleInDiscovery: txAny(["messenger.visibleInDiscovery"], "Show in public discovery"),
      openOwnerPanel: txAny(["messenger.openOwnerPanel"], "Open owner panel"),
      ownerPanelSubtitle: txAny(["messenger.ownerPanelSubtitle"], "Separate management space for the owner."),
      botPublicVisible: txAny(["messenger.botPublicVisible"], "Show bot in public search"),
      botInlineEnabled: txAny(["messenger.botInlineEnabled"], "Enable inline mode"),
      botAutoReplyEnabled: txAny(["messenger.botAutoReplyEnabled"], "Enable auto replies"),
      botMarketplaceLinked: txAny(["messenger.botMarketplaceLinked"], "Connect bot to marketplace"),
      botDeliveryLinked: txAny(["messenger.botDeliveryLinked"], "Connect bot to delivery"),
      botBusinessRoutingEnabled: txAny(["messenger.botBusinessRoutingEnabled"], "Use business routing for payments"),
      businessRoutingNote: txAny(["messenger.businessRoutingNote"], "Business bot income should follow the business routing path."),
      deleteGroup: txAny(["messenger.deleteGroup", "common.delete"], "Delete group"),
      deleteChannel: txAny(["messenger.deleteChannel", "common.delete"], "Delete channel"),
      deleteBot: txAny(["messenger.deleteBot", "common.delete"], "Delete bot"),
    }),
    [txAny],
  );

  const texts = useMemo(() => localizeChatPartnerInfoTexts(rawTexts, language), [language, rawTexts]);

  const chatId =
    typeof params.chatId === "string" && params.chatId.trim()
      ? params.chatId.trim()
      : typeof params.id === "string" && params.id.trim()
        ? params.id.trim()
        : "partner";

  const partnerName = typeof params.name === "string" && params.name.trim() ? params.name : texts.unknownUser;
  const partnerHandle =
    typeof params.handle === "string" && params.handle.trim()
      ? params.handle.trim()
      : buildHandle(partnerName);
  const partnerLetter = resolveAvatarLetter(params.avatarLetter, partnerName);
  const partnerVerified = params.verified === "1" || String(params.verified).toLowerCase() === "true";
  const rawGroupSharedProfile = useMemo(
    () => (roomType === "group" && chatId ? hydrateGroupPublicProfile(chatId) : null),
    [chatId, roomType],
  );
  const sharedGroupProfile = useMemo(
    () => pickMeaningfulProfile(rawGroupSharedProfile),
    [rawGroupSharedProfile],
  );
  const rawSharedPublicProfile = useMemo(
    () => (chatId ? hydratePublicProfile(chatId) : null),
    [chatId, publicProfileRevision],
  );
  const sharedPublicProfile = useMemo(
    () => pickMeaningfulProfile(rawSharedPublicProfile),
    [rawSharedPublicProfile],
  );
  const routePeerId =
    typeof params.peerId === "string" && params.peerId.trim()
      ? params.peerId.trim()
      : typeof params.partnerId === "string" && params.partnerId.trim()
        ? params.partnerId.trim()
        : typeof params.targetUserId === "string" && params.targetUserId.trim()
          ? params.targetUserId.trim()
          : "";
  const rawPeerPublicProfile = useMemo(
    () =>
      roomType === "direct" && routePeerId
        ? hydratePublicProfile(routePeerId)
        : null,
    [publicProfileRevision, roomType, routePeerId],
  );
  const peerPublicProfile = useMemo(
    () => pickMeaningfulProfile(rawPeerPublicProfile),
    [rawPeerPublicProfile],
  );
  const resolvedDirectPublicProfile = useMemo(
    () => pickMeaningfulProfile(peerPublicProfile, sharedPublicProfile),
    [peerPublicProfile, sharedPublicProfile],
  );
  const avatarUri =
    roomType === "group" && typeof sharedGroupProfile?.avatarUri === "string" && sharedGroupProfile.avatarUri.trim()
      ? sharedGroupProfile.avatarUri.trim()
      : typeof resolvedDirectPublicProfile?.avatarUri === "string" && resolvedDirectPublicProfile.avatarUri.trim()
        ? resolvedDirectPublicProfile.avatarUri.trim()
        : typeof params.avatarUrl === "string" && params.avatarUrl.trim()
          ? params.avatarUrl.trim()
          : typeof params.photoUrl === "string" && params.photoUrl.trim()
            ? params.photoUrl.trim()
            : "";
  const partnerBirthday =
    typeof params.birthday === "string" && params.birthday.trim() ? params.birthday.trim() : texts.defaultBirthday;
  const routeUserId =
    typeof params.userId === "string" && params.userId.trim()
      ? params.userId.trim()
      : typeof params.selfId === "string" && params.selfId.trim()
        ? params.selfId.trim()
        : "";
  const presenceUserId = useMemo(() => resolvePresenceUserId(routeUserId), [routeUserId]);
  const routeStatusText =
    typeof params.status === "string" && params.status.trim()
      ? params.status.trim()
      : typeof params.subtitle === "string" && params.subtitle.trim()
        ? params.subtitle.trim()
        : "";
  const routePresenceOnline =
    parsePresenceParam(typeof params.presenceOnline === "string" ? params.presenceOnline : null) ??
    parseOnlineStatusText(routeStatusText);
  const routeLastSeenAt =
    typeof params.lastSeenAt === "string" && params.lastSeenAt.trim()
      ? params.lastSeenAt.trim()
      : null;

  const [profile, setProfile] = useState<PrivateChatProfileSnapshot | null>(null);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        const next = await getPrivateChatProfile(chatId);
        if (mounted) {
          setProfile(next ?? null);
        }
      } catch {
        if (mounted) {
          setProfile(null);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [chatId]);
  useEffect(() => {
    if (roomType !== "direct") return;

    const routePhone = String(params.phone ?? "").trim();
    const routeUsername = String(params.handle ?? "").trim();
    const routeName = String(params.name ?? "").trim();
    const routeAvatarLetter = String(params.avatarLetter ?? "").trim();

    if (!routePhone && !routeUsername && !routeName && !routeAvatarLetter) return;

    void upsertPrivateChatProfile({
      chatId,
      roomType,
      name: routeName || undefined,
      avatarLetter: routeAvatarLetter || undefined,
      phone: routePhone || undefined,
      username: routeUsername || undefined,
      verified: partnerVerified,
      updatedAt: new Date().toISOString(),
    });
  }, [
    chatId,
    params.avatarLetter,
    params.handle,
    params.name,
    params.phone,
    partnerVerified,
    roomType,
  ]);

  useEffect(() => {
    if (roomType !== "direct") return;

    if (routePresenceOnline !== null) {
      setHasPresenceSignal(true);
      setIsOnline(routePresenceOnline);
      if (routePresenceOnline) {
        setLastSeenAt(null);
      }
    }

    if (!routePresenceOnline && routeLastSeenAt) {
      setHasPresenceSignal(true);
      setLastSeenAt(routeLastSeenAt);
    }
  }, [roomType, routeLastSeenAt, routePresenceOnline]);

  useEffect(() => {
    let mounted = true;

    if (roomType !== "direct" || !chatId) {
      return () => {
        mounted = false;
      };
    }

    void hydratePersistedChatPresence(chatId).then((presence) => {
      if (!mounted || !presence) return;

      const peerIds = [
        routePeerId,
        ...Object.keys(presence).filter(
          (userId) =>
            userId &&
            userId !== presenceUserId &&
            userId !== routePeerId,
        ),
      ].filter(Boolean);

      const peerId = peerIds.find((userId) => Boolean(presence[userId])) || "";
      if (!peerId) return;

      const peerState = presence[peerId];
      if (!peerState) return;

      setHasPresenceSignal(true);
      setIsOnline(Boolean(peerState.online));
      setLastSeenAt(peerState.lastSeenAt || peerState.updatedAt || null);
    });

    return () => {
      mounted = false;
    };
  }, [chatId, presenceUserId, roomType, routePeerId]);

  const partnerPhone = useMemo(() => {
    const runtimePhone = readProfilePhone(profile);
    if (runtimePhone) return runtimePhone;

    const publicPhone = readPublicProfileText(resolvedDirectPublicProfile, [
    "phone",
    "partnerPhone",
    "peerPhone",
    "contactPhone",
    "mobile",
    "msisdn",
    "publicPhone",
    "profilePhone",
  ]);
    if (publicPhone) return publicPhone;

    const routePhone = String(params.phone ?? "").trim();
    if (routePhone && routePhone !== "+998900000000" && routePhone !== "+998 90 000 00 00") {
      return routePhone;
    }

    return "—";
  }, [params.phone, profile, resolvedDirectPublicProfile]);

  const publicProfileInfoText = useMemo(
    () =>
      readPublicProfileText(resolvedDirectPublicProfile, [
        "publicBio",
        "bio",
        "publicSubtitle",
        "subtitle",
      ]),
    [resolvedDirectPublicProfile],
  );

  const runtimeState = useMemo(() => getGroupModerationState(chatId || "group:temp"), [chatId, runtimeRevision]);
  const groupRole: GroupRole =
    routeOwnerFlag || routeGroupRole === "owner"
      ? "owner"
      : (routeGroupRole as GroupRole) || (resolveGroupRole(chatId || "group:temp", routeUserId) as GroupRole) || "member";
  const isGroupOwner =
    routeOwnerFlag || routeGroupRole === "owner" || runtimeIsGroupOwner(chatId || "group:temp", routeUserId);
  const channelRole: GroupRole =
    routeChannelOwnerFlag || routeChannelRole === "owner"
      ? "owner"
      : (routeChannelRole as GroupRole) || "member";
  const isChannelOwner = routeChannelOwnerFlag || routeChannelRole === "owner";
  const showOwnerSettings =
    roomType === "group"
      ? isGroupOwner
      : roomType === "channel"
        ? isChannelOwner
        : isBot
          ? isBotOwnedByMe
          : false;

  const groupMemberRecords = useMemo(
    () => (roomType === "group" ? listGroupMembers(chatId || "group:temp") : []),
    [chatId, roomType, runtimeRevision],
  );
  const invitedGroupMembers = useMemo(
    () => (roomType === "group" ? listGroupMembers(chatId || "group:temp", ["invited"]) : []),
    [chatId, roomType, runtimeRevision],
  );
  const pendingGroupJoinRequests = useMemo(
    () => (roomType === "group" ? listGroupMembers(chatId || "group:temp", ["pending"]) : []),
    [chatId, roomType, runtimeRevision],
  );
  const visibleGroupMembers = useMemo(() => {
    const seen = new Set<string>();
    return [...groupMemberRecords, ...invitedGroupMembers].filter((member) => {
      if (!member.userId || seen.has(member.userId)) return false;
      seen.add(member.userId);
      return true;
    });
  }, [groupMemberRecords, invitedGroupMembers]);

  const groupRoleLabel = useCallback(
    (role?: GroupRole) => {
      if (role === "owner") return texts.ownerRole;
      if (role === "admin") return texts.adminRole;
      return texts.memberRole;
    },
    [texts.adminRole, texts.memberRole, texts.ownerRole],
  );

  const initialRules = useMemo(
    () =>
      runtimeState?.rules || {
        adminOnlyMessaging: false,
        adminOnlyMedia: false,
        adminOnlyInvites: false,
        approveJoinRequests: false,
        autoDeleteAds: true,
        autoDeletePromoLeaflets: true,
        autoDeleteLinks: false,
        autoBanRepeatedSpam: true,
        blacklist: [],
      },
    [runtimeState],
  );

  const initialPublicPhotos = useMemo(() => {
    const source = roomType === "group" && Array.isArray(sharedGroupProfile?.publicationPhotos) && sharedGroupProfile.publicationPhotos.length
      ? sharedGroupProfile.publicationPhotos
      : Array.isArray(resolvedDirectPublicProfile?.publicationPhotos) && resolvedDirectPublicProfile.publicationPhotos.length
        ? resolvedDirectPublicProfile.publicationPhotos
        : parseJsonArray<PublicMediaItem>(params.publicPhotos);

    return normalizePublicMediaList(source)
      .filter((item) => item.kind === "photo")
      .map((item, index) => ({
        ...item,
        id: item.id || `photo-${index}`,
        kind: "photo" as const,
        liked: Boolean(item.liked),
      }));
  }, [params.publicPhotos, resolvedDirectPublicProfile, roomType, sharedGroupProfile]);

  const initialPublicVideos = useMemo(() => {
    const source = roomType === "group" && Array.isArray(sharedGroupProfile?.publicationVideos) && sharedGroupProfile.publicationVideos.length
      ? sharedGroupProfile.publicationVideos
      : Array.isArray(resolvedDirectPublicProfile?.publicationVideos) && resolvedDirectPublicProfile.publicationVideos.length
        ? resolvedDirectPublicProfile.publicationVideos
        : parseJsonArray<PublicMediaItem>(params.publicVideos);

    return normalizePublicMediaList(source)
      .filter((item) => item.kind === "video")
      .map((item, index) => ({
        ...item,
        id: item.id || `video-${index}`,
        kind: "video" as const,
        liked: Boolean(item.liked),
      }));
  }, [params.publicVideos, resolvedDirectPublicProfile, roomType, sharedGroupProfile]);

  const initialArchive = useMemo<PublicMediaItem[]>(
    () =>
      parseJsonArray<PublicMediaItem>(params.archivePublications)
        .filter((item) => item && typeof item.uri === "string" && item.uri.trim())
        .map((item, index) => ({
          id: item.id || `archive-${index}`,
          uri: item.uri,
          kind: item.kind === "video" ? "video" : "photo",
          views: typeof item.views === "number" ? item.views : 0,
          duration: item.duration,
          liked: Boolean(item.liked),
        })),
    [params.archivePublications],
  );

  const groupPublicGiftsSource = useMemo<PublicGiftItem[]>(() => {
    if (roomType !== "group" || !sharedGroupProfile || typeof sharedGroupProfile !== "object") {
      return [];
    }

    const profile = sharedGroupProfile as {
      publicGifts?: PublicGiftItem[];
      publicationGifts?: PublicGiftItem[];
      gifts?: PublicGiftItem[];
    };

    if (Array.isArray(profile.publicGifts)) return profile.publicGifts;
    if (Array.isArray(profile.publicationGifts)) return profile.publicationGifts;
    if (Array.isArray(profile.gifts)) return profile.gifts;

    return [];
  }, [roomType, sharedGroupProfile]);

  const publicGifts = useMemo(
    () =>
      roomType === "group" && groupPublicGiftsSource.length
        ? groupPublicGiftsSource
            .filter(
              (item) =>
                item &&
                ((typeof item.emoji === "string" && item.emoji) ||
                  (typeof item.imageUri === "string" && item.imageUri.trim())),
            )
            .map((item, index) => ({
              id: item.id || `gift-${index}`,
              title: item.title || "",
              emoji: item.emoji,
              imageUri: item.imageUri,
            }))
        : Array.isArray(resolvedDirectPublicProfile?.publicGifts) && resolvedDirectPublicProfile.publicGifts.length
          ? resolvedDirectPublicProfile.publicGifts
              .filter(
                (item) =>
                  item &&
                  ((typeof item.emoji === "string" && item.emoji) ||
                    (typeof item.imageUri === "string" && item.imageUri.trim())),
              )
              .map((item, index) => ({
                id: item.id || `gift-${index}`,
                title: item.title || "",
                emoji: item.emoji,
                imageUri: item.imageUri,
              }))
          : parseJsonArray<PublicGiftItem>(params.publicGifts)
              .filter(
                (item) =>
                  item &&
                  ((typeof item.emoji === "string" && item.emoji) ||
                    (typeof item.imageUri === "string" && item.imageUri.trim())),
              )
              .map((item, index) => ({
                id: item.id || `gift-${index}`,
                title: item.title || "",
                emoji: item.emoji,
                imageUri: item.imageUri,
              })),
    [groupPublicGiftsSource, params.publicGifts, resolvedDirectPublicProfile, roomType],
  );

  const likesParam = Array.isArray(params.likesCount) ? params.likesCount[0] : params.likesCount;
  const initialLikesCount = typeof likesParam === "string" && likesParam.trim() ? Number(likesParam) : undefined;

  const [activeTab, setActiveTab] = useState<TabKey>("publications");
  const [isOnline, setIsOnline] = useState(() => {
    if (roomType !== "direct") return false;
    return routePresenceOnline === true;
  });
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(() =>
    roomType === "direct" ? routeLastSeenAt : null,
  );
  const [hasPresenceSignal, setHasPresenceSignal] = useState(() =>
    roomType !== "direct" ? true : routePresenceOnline !== null || Boolean(routeLastSeenAt),
  );
  const [photoModalUri, setPhotoModalUri] = useState<string | null>(null);
  const [videoModalUri, setVideoModalUri] = useState<string | null>(null);
  const [videosLiked, setVideosLiked] = useState<Record<string, boolean>>(
    Object.fromEntries(initialPublicVideos.map((item) => [item.id, Boolean(item.liked)])),
  );
  const [photosLiked, setPhotosLiked] = useState<Record<string, boolean>>(
    Object.fromEntries(initialPublicPhotos.map((item) => [item.id, Boolean(item.liked)])),
  );

  useEffect(() => {
    setPhotosLiked((current) => {
      let changed = false;
      const next = { ...current };
      initialPublicPhotos.forEach((item) => {
        if (!item?.id || item.id in next) return;
        next[item.id] = Boolean(item.liked);
        changed = true;
      });
      return changed ? next : current;
    });
  }, [initialPublicPhotos]);

  useEffect(() => {
    setVideosLiked((current) => {
      let changed = false;
      const next = { ...current };
      initialPublicVideos.forEach((item) => {
        if (!item?.id || item.id in next) return;
        next[item.id] = Boolean(item.liked);
        changed = true;
      });
      return changed ? next : current;
    });
  }, [initialPublicVideos]);

  const [muted, setMuted] = useState(Boolean(profile?.muted));
  const [pinned, setPinned] = useState(Boolean(profile?.pinned));
  const [hidden, setHidden] = useState(Boolean(profile?.hiddenFromMain));
  const [notificationsEnabled, setNotificationsEnabled] = useState(!Boolean(profile?.muted));
  const [unread, setUnread] = useState(Number(profile?.unreadCount || 0));

  useEffect(() => {
    setMuted(Boolean(profile?.muted));
    setPinned(Boolean(profile?.pinned));
    setHidden(Boolean(profile?.hiddenFromMain));
    setNotificationsEnabled(!Boolean(profile?.muted));
    setUnread(Number(profile?.unreadCount || 0));
  }, [
    profile?.muted,
    profile?.pinned,
    profile?.hiddenFromMain,
    profile?.unreadCount,
  ]);

  const [adminOnlyMessaging, setAdminOnlyMessaging] = useState(initialRules.adminOnlyMessaging);
  const [adminOnlyMedia, setAdminOnlyMedia] = useState(initialRules.adminOnlyMedia);
  const [adminOnlyInvites, setAdminOnlyInvites] = useState(initialRules.adminOnlyInvites);
  const [approveJoinRequests, setApproveJoinRequests] = useState(initialRules.approveJoinRequests);
  const [autoDeleteAds, setAutoDeleteAds] = useState(initialRules.autoDeleteAds);
  const [autoDeletePromoLeaflets, setAutoDeletePromoLeaflets] = useState(initialRules.autoDeletePromoLeaflets);
  const [autoDeleteLinks, setAutoDeleteLinks] = useState(initialRules.autoDeleteLinks);
  const [autoBanRepeatedSpam, setAutoBanRepeatedSpam] = useState(initialRules.autoBanRepeatedSpam);
  const [blacklist, setBlacklist] = useState<string[]>(initialRules.blacklist);
  const [blacklistInput, setBlacklistInput] = useState("");
  const [memberInput, setMemberInput] = useState("");

  useEffect(() => {
    setAdminOnlyMessaging(initialRules.adminOnlyMessaging);
    setAdminOnlyMedia(initialRules.adminOnlyMedia);
    setAdminOnlyInvites(initialRules.adminOnlyInvites);
    setApproveJoinRequests(initialRules.approveJoinRequests);
    setAutoDeleteAds(initialRules.autoDeleteAds);
    setAutoDeletePromoLeaflets(initialRules.autoDeletePromoLeaflets);
    setAutoDeleteLinks(initialRules.autoDeleteLinks);
    setAutoBanRepeatedSpam(initialRules.autoBanRepeatedSpam);
    setBlacklist(initialRules.blacklist);
  }, [initialRules]);

  const initialChannelSettings = useMemo(() => readChannelOwnerSettings(chatId || "channel:temp"), [chatId, runtimeRevision]);
  const [channelPostingAdminsOnly, setChannelPostingAdminsOnly] = useState(initialChannelSettings.postingAdminsOnly);
  const [channelApproveSubscribers, setChannelApproveSubscribers] = useState(initialChannelSettings.approveSubscribers);
  const [channelReactionsEnabled, setChannelReactionsEnabled] = useState(initialChannelSettings.reactionsEnabled);
  const [channelCommentsEnabled, setChannelCommentsEnabled] = useState(initialChannelSettings.commentsEnabled);
  const [channelVisibleInDiscovery, setChannelVisibleInDiscovery] = useState(initialChannelSettings.visibleInDiscovery);

  useEffect(() => {
    setChannelPostingAdminsOnly(initialChannelSettings.postingAdminsOnly);
    setChannelApproveSubscribers(initialChannelSettings.approveSubscribers);
    setChannelReactionsEnabled(initialChannelSettings.reactionsEnabled);
    setChannelCommentsEnabled(initialChannelSettings.commentsEnabled);
    setChannelVisibleInDiscovery(initialChannelSettings.visibleInDiscovery);
  }, [initialChannelSettings]);

  const initialBotSettings = useMemo(
    () => readBotOwnerSettings(chatId || "bot:temp", String(params.botKind || "").trim().toLowerCase() === "business"),
    [chatId, params.botKind, runtimeRevision],
  );
  const [botPublicVisible, setBotPublicVisible] = useState(initialBotSettings.publicVisible);
  const [botInlineEnabled, setBotInlineEnabled] = useState(initialBotSettings.inlineEnabled);
  const [botAutoReplyEnabled, setBotAutoReplyEnabled] = useState(initialBotSettings.autoReplyEnabled);
  const [botMarketplaceLinked, setBotMarketplaceLinked] = useState(initialBotSettings.marketplaceLinked);
  const [botDeliveryLinked, setBotDeliveryLinked] = useState(initialBotSettings.deliveryLinked);
  const [botBusinessRoutingEnabled, setBotBusinessRoutingEnabled] = useState(initialBotSettings.businessRoutingEnabled);

  useEffect(() => {
    setBotPublicVisible(initialBotSettings.publicVisible);
    setBotInlineEnabled(initialBotSettings.inlineEnabled);
    setBotAutoReplyEnabled(initialBotSettings.autoReplyEnabled);
    setBotMarketplaceLinked(initialBotSettings.marketplaceLinked);
    setBotDeliveryLinked(initialBotSettings.deliveryLinked);
    setBotBusinessRoutingEnabled(initialBotSettings.businessRoutingEnabled);
  }, [initialBotSettings]);

  const persistChannelSettings = useCallback(
    (patch: Partial<ChannelOwnerSettings>) => {
      writeChannelOwnerSettings(chatId || "channel:temp", patch);
    },
    [chatId],
  );

  const currentBotKind = normalizeBotKind(
    typeof params.botKind === "string" ? params.botKind : undefined,
  );

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      void Promise.all([
        hydrateGroupModerationRuntime(),
        hydrateOwnerSettingsStores(),
      ]).then(() => {
        if (!mounted) return;
        setRuntimeRevision((value) => value + 1);
      });

      return () => {
        mounted = false;
      };
    }, [chatId, currentBotKind, isBot, roomType]),
  );

  const persistBotSettings = useCallback(
    (patch: Partial<BotOwnerSettings>) => {
      writeBotOwnerSettings(
        chatId || "bot:temp",
        patch,
        currentBotKind === "business",
      );
    },
    [chatId, currentBotKind],
  );

  const openBotOwnerPanel = useCallback(() => {
    router.push({
      pathname: "/tabs/bot-owner/[id]",
      params: {
        id: String(params.botId || chatId || "bot"),
        chatId: String(chatId || ""),
        name: partnerName,
        botId: String(params.botId || chatId || ""),
        botHandle:
          typeof params.botHandle === "string" && params.botHandle.trim()
            ? params.botHandle.trim()
            : partnerHandle,
        botKind: currentBotKind,
        isBotOwnedByMe: isBotOwnedByMe ? "1" : "0",
      },
    } as never);
  }, [
    chatId,
    currentBotKind,
    isBotOwnedByMe,
    params.botHandle,
    params.botId,
    partnerHandle,
    partnerName,
  ]);

  useEffect(() => {
    if (roomType !== "group" || !chatId || !routeUserId) return;
    if (isGroupOwner) {
      setGroupRole(chatId, routeUserId, "owner", texts.you);
      return;
    }
    if (groupRole === "admin" || groupRole === "member") {
      setGroupRole(chatId, routeUserId, groupRole, texts.you);
    }
  }, [chatId, groupRole, isGroupOwner, roomType, routeUserId, texts.you]);

  useRealtimeChannel({
    userId: presenceUserId || undefined,
    channel: presenceUserId ? `messenger:channels:${presenceUserId}` : undefined,
    enabled: Boolean(presenceUserId && roomType === "direct"),
    events: [
      "presence:online",
      "presence:offline",
      "presence.snapshot",
      "presence:state",
      "presence_state",
      "chat:presence:snapshot",
    ],
    onEvent: (eventName, payload) => {
      const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : undefined;

      if (
        eventName === "presence.snapshot" ||
        eventName === "presence:state" ||
        eventName === "presence_state" ||
        eventName === "chat:presence:snapshot"
      ) {
        const source =
          record && typeof record.presence === "object" && record.presence
            ? (record.presence as Record<string, unknown>)
            : record && typeof record.users === "object" && record.users
              ? (record.users as Record<string, unknown>)
              : record && typeof record.state === "object" && record.state
                ? (record.state as Record<string, unknown>)
                : record;

        if (!source || typeof source !== "object") return;

        const peerId =
          routePeerId ||
          Object.keys(source).find((userId) => userId && userId !== presenceUserId) ||
          "";

        if (!peerId) return;

        const peerState = source[peerId] as Record<string, unknown> | undefined;
        if (!peerState || typeof peerState !== "object") return;

        const nextOnline = Boolean(peerState.online);
        const nextLastSeenAt =
          typeof peerState.lastSeenAt === "string" && peerState.lastSeenAt
            ? peerState.lastSeenAt
            : typeof peerState.updatedAt === "string" && peerState.updatedAt
              ? peerState.updatedAt
              : typeof peerState.at === "string" && peerState.at
                ? peerState.at
                : null;

        setHasPresenceSignal(true);
        setIsOnline(nextOnline);
        setLastSeenAt(nextOnline ? null : nextLastSeenAt);
        return;
      }

      const incomingUserId = String(record?.userId ?? record?.peerId ?? "").trim();
      if (!incomingUserId) return;
      if (routePeerId && incomingUserId !== routePeerId) return;
      if (!routePeerId && incomingUserId === presenceUserId) return;

      if (eventName === "presence:online") {
        setHasPresenceSignal(true);
        setIsOnline(true);
        setLastSeenAt(null);
        return;
      }

      if (eventName === "presence:offline") {
        const nextLastSeenAt =
          typeof record?.lastSeenAt === "string" && record.lastSeenAt
            ? record.lastSeenAt
            : typeof record?.at === "string" && record.at
              ? record.at
              : new Date().toISOString();
        setHasPresenceSignal(true);
        setIsOnline(false);
        setLastSeenAt(nextLastSeenAt);
      }
    },
  });

  const displayStatus = useMemo(() => {
    if (roomType !== "direct") return "";
    if (isOnline) return texts.online;
    if (lastSeenAt) {
      return formatLastSeen(lastSeenAt, normalizeLocaleCode(language), {
        offline: texts.offline,
        lastSeenToday: texts.lastSeenToday,
        lastSeenYesterday: texts.lastSeenYesterday,
        lastSeenDate: texts.lastSeenDate,
      });
    }
    if (!hasPresenceSignal && routeStatusText) {
      return routeStatusText;
    }
    return texts.offline;
  }, [hasPresenceSignal, isOnline, language, lastSeenAt, roomType, routeStatusText, texts]);

  const publications = useMemo(() => [...initialPublicPhotos, ...initialPublicVideos], [initialPublicPhotos, initialPublicVideos]);

  const likesCount = useMemo(() => {
    const likedMediaCount =
      Object.values(photosLiked).filter(Boolean).length +
      Object.values(videosLiked).filter(Boolean).length;
    const storedCount =
      roomType === "group" && typeof sharedGroupProfile?.likesCount === "number"
        ? sharedGroupProfile.likesCount
        : typeof resolvedDirectPublicProfile?.likesCount === "number" && Number.isFinite(resolvedDirectPublicProfile.likesCount)
          ? resolvedDirectPublicProfile.likesCount
          : typeof initialLikesCount === "number" && Number.isFinite(initialLikesCount)
            ? initialLikesCount
            : 0;
    return Math.max(0, storedCount, likedMediaCount);
  }, [initialLikesCount, photosLiked, resolvedDirectPublicProfile, roomType, sharedGroupProfile, videosLiked]);

  const tileGap = 12;
  const tileWidth = (width - 32 - tileGap * 2) / 3;
  const roleTitle = roomTypeLabel(roomType, texts as Record<string, string>, isBot);
  const IconComponent = roomTypeIcon(roomType, isBot);

  const routeMembersCount = parseIntParam(params.membersCount, parseIntParam(params.subtitle, 0));
  const membersCount = roomType === "group" && groupMemberRecords.length ? groupMemberRecords.length : routeMembersCount;
  const subscribersCount = parseIntParam(params.subscribersCount, parseIntParam(params.subtitle, roomType === "channel" ? 0 : 0));
  const botKindLabel =
    String(params.botKind || "").trim().toLowerCase() === "business"
      ? texts.botBusiness
      : String(params.botKind || "").trim().toLowerCase() === "service"
        ? texts.botService
        : texts.botAssistant;
  const scopeLabel =
    roomType === "group"
      ? `${membersCount || 0} ${texts.members}`
      : roomType === "channel"
        ? `${subscribersCount || 0} ${texts.subscribers}`
        : isBot
          ? botKindLabel
          : displayStatus || texts.chat;

  const profileBadgeText = premiumActive
    ? `${texts.premium}${premiumTier ? ` · ${premiumTier}` : ""}`
    : `${texts.publicBanner}${premiumStyleId ? ` · ${premiumStyleId}` : ""}`;

  const inviteLink = useMemo(
    () => getGroupInviteLink(chatId || partnerName),
    [chatId, partnerName, runtimeRevision],
  );

  const persistPublicMediaLike = useCallback(
    async (
      item: PublicMediaItem,
      nextLiked: boolean,
      nextPhotosLiked: Record<string, boolean>,
      nextVideosLiked: Record<string, boolean>,
    ) => {
      if (roomType !== "direct") return;

      const source = resolvedDirectPublicProfile;
      const key = String(source?.chatId || source?.userId || routePeerId || chatId || "").trim();
      if (!key) return;

      const applyLikes = (
        items: PublicMediaItem[],
        likedMap: Record<string, boolean>,
        kind: MediaKind,
      ) =>
        items
          .filter((media) => media && typeof media.uri === "string" && media.uri.trim())
          .map((media) => ({
            ...media,
            kind,
            liked:
              media.id === item.id
                ? nextLiked
                : typeof likedMap[media.id] === "boolean"
                  ? likedMap[media.id]
                  : Boolean(media.liked),
          }));

      const sourcePhotos = Array.isArray(source?.publicationPhotos)
        ? (source.publicationPhotos as PublicMediaItem[])
        : initialPublicPhotos;
      const sourceVideos = Array.isArray(source?.publicationVideos)
        ? (source.publicationVideos as PublicMediaItem[])
        : initialPublicVideos;

      const nextPhotos = applyLikes(sourcePhotos, nextPhotosLiked, "photo");
      const nextVideos = applyLikes(sourceVideos, nextVideosLiked, "video");
      const nextLikesCount = countLikedPublicMedia(nextPhotos, nextVideos);

      const aliases = Array.from(
        new Set(
          [
            key,
            chatId,
            routePeerId,
            typeof params.userId === "string" ? params.userId : "",
            typeof params.peerId === "string" ? params.peerId : "",
            typeof params.partnerId === "string" ? params.partnerId : "",
            typeof params.targetUserId === "string" ? params.targetUserId : "",
            typeof params.phone === "string" ? params.phone : "",
            typeof params.handle === "string" ? params.handle : "",
            source?.userId,
            source?.username,
            source?.publicUsername,
            source?.phone,
            ...(Array.isArray(source?.aliases) ? source.aliases : []),
          ]
            .map((value) => String(value || "").trim())
            .filter(Boolean),
        ),
      );

      const nextSurface = {
        ...(source || ({} as any)),
        chatId: key,
        userId: source?.userId || routePeerId || key,
        publicationPhotos: nextPhotos,
        publicationVideos: nextVideos,
        likesCount: nextLikesCount,
        aliases,
        updatedAt: Date.now(),
      } as any;

      savePublicProfile(key, nextSurface, aliases);

      try {
        const { getAuthSessionState } = await import("../../../core/kernel/auth/session.store");
        const { likeUserPublicProfileSurface, saveUserPublicProfileSurface } = await import("../../../shared/api/user-profile-api");
        const auth = getAuthSessionState();
        const targetUserId = String(nextSurface.userId || nextSurface.chatId || key);
        const requestSession = {
          apiBaseUrl: auth.apiBaseUrl,
          accessToken: auth.accessToken,
          currentUserId: auth.currentUserId,
          timeoutMs: 18000,
        };
        let saved = await likeUserPublicProfileSurface(
          targetUserId,
          auth.currentUserId,
          requestSession,
          {
            liked: nextLiked,
            mediaId: item.id,
            mediaKind: item.kind,
          },
        );

        if (isSamePublicProfileIdentity(saved.aliases || aliases, [auth.currentUserId])) {
          saved = await saveUserPublicProfileSurface(targetUserId, nextSurface, requestSession);
        }

        savePublicProfile(saved.chatId, saved as any, saved.aliases || aliases);
        if (saved.userId) savePublicProfile(saved.userId, saved as any, saved.aliases || aliases);
        saved.aliases?.forEach((alias) => savePublicProfile(alias, saved as any, saved.aliases || aliases));

        if (isSamePublicProfileIdentity(saved.aliases || aliases, [auth.currentUserId])) {
          const { profileKernelFacade } = await import("../../../core/kernel/profile");
          await profileKernelFacade.setLikesCount(Number(saved.likesCount || nextLikesCount));
        }
      } catch {
        // Like state is already saved locally; backend sync will retry on the next profile sync.
      }
    },
    [
      chatId,
      initialPublicPhotos,
      initialPublicVideos,
      params.handle,
      params.partnerId,
      params.peerId,
      params.phone,
      params.targetUserId,
      params.userId,
      resolvedDirectPublicProfile,
      roomType,
      routePeerId,
    ],
  );

  const toggleLike = useCallback(
    (item: PublicMediaItem) => {
      if (item.kind === "video") {
        const nextLiked = !Boolean(videosLiked[item.id]);
        const nextVideosLiked = { ...videosLiked, [item.id]: nextLiked };
        setVideosLiked(nextVideosLiked);
        setTimeout(() => void persistPublicMediaLike(item, nextLiked, photosLiked, nextVideosLiked), 0);
        return;
      }

      const nextLiked = !Boolean(photosLiked[item.id]);
      const nextPhotosLiked = { ...photosLiked, [item.id]: nextLiked };
      setPhotosLiked(nextPhotosLiked);
      setTimeout(() => void persistPublicMediaLike(item, nextLiked, nextPhotosLiked, videosLiked), 0);
    },
    [persistPublicMediaLike, photosLiked, videosLiked],
  );

  const openChat = useCallback(async () => {
    await registerPersistedChatRoom({
      chatId,
      name: partnerName,
      subtitle: params.subtitle || scopeLabel,
      roomType,
      verified: partnerVerified,
      avatarLetter: partnerLetter,
      phone: partnerPhone !== "—" ? partnerPhone : undefined,
      username: partnerHandle,
      hiddenFromMain: false,
      deleted: false,
      forceVisibleInMain: true,
    });

    router.push({
      pathname: "/tabs/chat/[id]",
      params: {
        id: chatId,
        chatId,
        name: partnerName,
        roomType,
        avatarLetter: partnerLetter,
        avatarUrl: avatarUri || undefined,
        photoUrl: avatarUri || undefined,
        handle: partnerHandle,
        phone: partnerPhone !== "—" ? partnerPhone : undefined,
        verified: partnerVerified ? "1" : "0",
        subtitle: params.subtitle || scopeLabel,
        isBotOwnedByMe: isBotOwnedByMe ? "1" : "0",
        isChannelOwner: isChannelOwner ? "1" : "0",
        channelRole,
        publicPhotos: JSON.stringify(initialPublicPhotos),
        publicVideos: JSON.stringify(initialPublicVideos),
        likesCount: String(
          roomType === "group" && typeof sharedGroupProfile?.likesCount === "number"
            ? sharedGroupProfile.likesCount
            : typeof resolvedDirectPublicProfile?.likesCount === "number"
              ? resolvedDirectPublicProfile.likesCount
              : initialLikesCount || 0,
        ),
        publicGiftsCount: Array.isArray(params.publicGiftsCount)
          ? params.publicGiftsCount[0]
          : typeof params.publicGiftsCount === "string"
            ? params.publicGiftsCount
            : roomType === "group"
              ? String(
                  typeof (sharedGroupProfile as { publicGiftsCount?: number } | null)?.publicGiftsCount === "number"
                    ? (sharedGroupProfile as { publicGiftsCount?: number }).publicGiftsCount
                    : publicGifts.length || 0,
                )
              : typeof resolvedDirectPublicProfile?.publicGiftsCount === "number"
                ? String(resolvedDirectPublicProfile.publicGiftsCount)
                : String(publicGifts.length || 0),
        publicGifts: JSON.stringify(publicGifts),
        isBot: isBot ? "1" : "0",
        botId: params.botId ? String(params.botId) : undefined,
        botHandle: params.botHandle ? String(params.botHandle) : undefined,
        botKind: params.botKind ? String(params.botKind) : undefined,
        isGroupOwner: isGroupOwner ? "1" : "0",
        groupRole,
      },
    } as never);
  }, [
    avatarUri,
    channelRole,
    chatId,
    groupRole,
    initialLikesCount,
    initialPublicPhotos,
    initialPublicVideos,
    isBot,
    isBotOwnedByMe,
    isChannelOwner,
    isGroupOwner,
    params.botHandle,
    params.botId,
    params.botKind,
    params.publicGiftsCount,
    params.subtitle,
    partnerHandle,
    partnerLetter,
    partnerPhone,
    partnerName,
    partnerPhone,
    partnerVerified,
    publicGifts,
    roomType,
    scopeLabel,
    resolvedDirectPublicProfile,
    sharedGroupProfile,
  ]);

  const groupCallParticipantInputs = useMemo(
    () =>
      roomType === "group"
        ? groupMemberRecords.map((member) => ({
            id: member.userId,
            userId: member.userId,
            displayName: member.displayName || member.userId,
            role: member.role === "owner" ? "OWNER" : member.role.toUpperCase(),
          }))
        : [],
    [groupMemberRecords, roomType],
  );

  const initialCallParticipants = useMemo(
    () =>
      buildMessengerCallParticipants({
        participants: groupCallParticipantInputs,
        currentUserId: presenceUserId || undefined,
        currentUserName: texts.you,
        fallbackPeer:
          roomType === "direct" && routePeerId
            ? {
                userId: routePeerId,
                name: partnerName,
                avatarLetter: partnerLetter,
                avatarUrl: avatarUri || undefined,
                role: "CALLEE",
              }
            : null,
      }),
    [
      avatarUri,
      groupCallParticipantInputs,
      partnerLetter,
      partnerName,
      presenceUserId,
      roomType,
      routePeerId,
      texts.you,
    ],
  );

  const callParticipantsParam = useMemo(
    () => encodeMessengerCallParticipants(initialCallParticipants),
    [initialCallParticipants],
  );

  const callMembersCount = countMessengerCallParticipants(initialCallParticipants);

  const directCallRouteParams = useMemo(
    () => ({
      id: chatId,
      chatId,
      userId: presenceUserId || undefined,
      selfId: presenceUserId || undefined,
      peerId: routePeerId || undefined,
      partnerId: routePeerId || undefined,
      targetUserId: routePeerId || undefined,
      roomType,
      name: partnerName,
      avatarLetter: partnerLetter,
      avatarUrl: avatarUri || undefined,
      photoUrl: avatarUri || undefined,
      roomTitle: partnerName,
      participants: callParticipantsParam,
      membersCount: callMembersCount ? String(Math.max(callMembersCount, membersCount || 0)) : membersCount ? String(membersCount) : undefined,
      verified: partnerVerified ? "1" : "0",
      status: displayStatus || scopeLabel,
      subtitle: scopeLabel,
      handle: partnerHandle,
      phone: partnerPhone !== "—" ? partnerPhone : undefined,
      isBot: isBot ? "1" : "0",
      botId: typeof params.botId === "string" && params.botId.trim() ? params.botId.trim() : undefined,
      botHandle:
        typeof params.botHandle === "string" && params.botHandle.trim()
          ? params.botHandle.trim()
          : partnerHandle,
      botKind:
        typeof params.botKind === "string" && params.botKind.trim()
          ? params.botKind.trim()
          : undefined,
      isBotOwnedByMe: isBotOwnedByMe ? "1" : "0",
    }),
    [
      avatarUri,
      callMembersCount,
      callParticipantsParam,
      chatId,
      displayStatus,
      isBot,
      isBotOwnedByMe,
      params.botHandle,
      params.botId,
      params.botKind,
      partnerHandle,
      partnerLetter,
      partnerName,
      partnerPhone,
      partnerVerified,
      membersCount,
      presenceUserId,
      roomType,
      routePeerId,
      routeUserId,
      scopeLabel,
      ],
  );

  const openAudioCall = useCallback(() => {
    if (roomType !== "direct") return;
    router.push({
      pathname: "/calls/audio",
      params: directCallRouteParams,
    } as never);
  }, [directCallRouteParams, roomType]);

  const openVideoCall = useCallback(() => {
    if (roomType !== "direct") return;
    router.push({
      pathname: "/calls/video",
      params: directCallRouteParams,
    } as never);
  }, [directCallRouteParams, roomType]);

  const toggleMute = useCallback(async () => {
    const next = !muted;
    await setPrivateChatMuted(chatId, next);
    setMuted(next);
    setNotificationsEnabled(!next);
  }, [chatId, muted]);

  const togglePin = useCallback(async () => {
    const next = !pinned;
    await setPrivateChatPinned(chatId, next);
    setPinned(next);
  }, [chatId, pinned]);

  const toggleHidden = useCallback(async () => {
    const next = !hidden;
    await setPrivateChatHiddenFromMain(chatId, next);
    setHidden(next);
  }, [chatId, hidden]);

  const toggleUnread = useCallback(async () => {
    if (unread > 0) {
      await markPrivateChatRead(chatId);
      setUnread(0);
      return;
    }
    await markPrivateChatUnread(chatId, 1);
    setUnread(1);
  }, [chatId, unread]);

  const deleteRoom = useCallback(() => {
    Alert.alert(texts.delete, partnerName, [
      { text: texts.close, style: "cancel" },
      {
        text: texts.delete,
        style: "destructive",
        onPress: () => {
          void (async () => {
            await setPrivateChatDeleted(chatId, true);
            goBackOrMessenger();
          })();
        },
      },
    ]);
  }, [chatId, partnerName, texts.close, texts.delete]);

  const persistRules = useCallback(
    (patch: Record<string, unknown>) => {
      if (roomType !== "group") return;
      updateGroupModerationRules(chatId || "group:temp", patch as any);
    },
    [chatId, roomType],
  );

  const saveToggle = useCallback(
    <T extends boolean>(setter: React.Dispatch<React.SetStateAction<T>>, key: string) =>
      (next: boolean) => {
        setter(next as T);
        persistRules({ [key]: next });
      },
    [persistRules],
  );

  const refreshGroupRuntime = useCallback(() => {
    setRuntimeRevision((value) => value + 1);
  }, []);

  const addGroupMemberFromInput = useCallback(() => {
    const value = memberInput.trim();
    if (!value || roomType !== "group") return;

    if (!canInviteToGroup(chatId || "group:temp", routeUserId)) {
      Alert.alert(texts.addMembers, texts.adminOnlyInvites);
      return;
    }

    inviteGroupMember({
      groupId: chatId || "group:temp",
      userId: value,
      displayName: value,
      invitedByUserId: routeUserId || undefined,
    });
    setMemberInput("");
    refreshGroupRuntime();
    Alert.alert(texts.addMembers, texts.memberInvited);
  }, [
    chatId,
    memberInput,
    refreshGroupRuntime,
    roomType,
    routeUserId,
    texts.addMembers,
    texts.adminOnlyInvites,
    texts.memberInvited,
  ]);

  const toggleGroupMemberRole = useCallback(
    (member: GroupMemberRecord) => {
      if (member.role === "owner") return;
      const nextRole: GroupRole = member.role === "admin" ? "member" : "admin";
      setGroupRole(chatId || "group:temp", member.userId, nextRole, member.displayName || member.userId);
      refreshGroupRuntime();
      Alert.alert(texts.admins, groupRoleLabel(nextRole));
    },
    [chatId, groupRoleLabel, refreshGroupRuntime, texts.admins],
  );

  const removeGroupMemberById = useCallback(
    (member: GroupMemberRecord) => {
      if (member.role === "owner") return;
      removeGroupMember(chatId || "group:temp", member.userId);
      refreshGroupRuntime();
      Alert.alert(texts.groupMembers, texts.memberRemoved);
    },
    [chatId, refreshGroupRuntime, texts.groupMembers, texts.memberRemoved],
  );

  const approvePendingGroupMember = useCallback(
    (member: GroupMemberRecord) => {
      approveGroupJoinRequest(chatId || "group:temp", member.userId);
      refreshGroupRuntime();
      Alert.alert(texts.pendingJoinRequests, texts.joinRequestApproved);
    },
    [chatId, refreshGroupRuntime, texts.joinRequestApproved, texts.pendingJoinRequests],
  );

  const rejectPendingGroupMember = useCallback(
    (member: GroupMemberRecord) => {
      rejectGroupJoinRequest(chatId || "group:temp", member.userId);
      refreshGroupRuntime();
      Alert.alert(texts.pendingJoinRequests, texts.joinRequestRejected);
    },
    [chatId, refreshGroupRuntime, texts.joinRequestRejected, texts.pendingJoinRequests],
  );

  const regenerateInvite = useCallback(() => {
    const nextLink = regenerateGroupInviteLink(chatId || "group:temp");
    refreshGroupRuntime();
    Alert.alert(texts.inviteRegenerated, nextLink);
  }, [chatId, refreshGroupRuntime, texts.inviteRegenerated]);

  const addBlacklistEntry = useCallback(() => {
    const value = blacklistInput.trim();
    if (!value) return;
    if (blacklist.includes(value)) {
      setBlacklistInput("");
      return;
    }
    const next = [...blacklist, value];
    setBlacklist(next);
    setBlacklistInput("");
    addGroupBlacklistEntry(chatId || "group:temp", value);
    Alert.alert(texts.blacklist, texts.add);
  }, [blacklist, blacklistInput, chatId, texts.add, texts.blacklist]);

  const removeBlacklistEntry = useCallback(
    (value: string) => {
      const next = blacklist.filter((item) => item !== value);
      setBlacklist(next);
      removeGroupBlacklistEntry(chatId || "group:temp", value);
      Alert.alert(texts.blacklist, texts.remove);
    },
    [blacklist, chatId, texts.blacklist, texts.remove],
  );

  const shareInvite = useCallback(async () => {
    try {
      await Share.share({
        message: `${partnerName}\n${inviteLink}`,
      });
    } catch {
      Alert.alert(texts.inviteLink, inviteLink);
    }
  }, [inviteLink, partnerName, texts.inviteLink]);

  const renderStoryTile = (item: PublicMediaItem) => {
    const liked = item.kind === "video" ? Boolean(videosLiked[item.id]) : Boolean(photosLiked[item.id]);

    return (
      <Pressable
        key={item.id}
        onPress={() => {
          const openUri = resolveMediaOpenUri(item);
          if (!openUri) return;
          if (item.kind === "video") {
            setVideoModalUri(openUri);
            return;
          }
          setPhotoModalUri(openUri);
        }}
      >
        {({ pressed }) => (
          <View style={[styles.storyTileWrap, pressed && styles.pressed, { width: tileWidth, height: tileWidth * 1.42 }]}>
            <LinearGradient colors={["rgba(59,210,255,0.20)", "rgba(137,88,255,0.14)", "rgba(0,0,0,0.36)"]} style={StyleSheet.absoluteFill} />
            <PublicMediaPreview item={item} />
            <LinearGradient colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.02)", "rgba(0,0,0,0)"]} style={styles.storyTopGlass} />
            <LinearGradient colors={["rgba(0,0,0,0.02)", "rgba(0,0,0,0.34)", "rgba(0,0,0,0.68)"]} style={styles.storyShade} />
            <View style={styles.storyInnerBorder} />

            <Pressable onPress={() => toggleLike(item)} style={styles.storyLikeButton} hitSlop={8}>
              <LinearGradient colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)"]} style={styles.storyLikeButtonGlass} />
              <Heart size={14} strokeWidth={2.4} color={liked ? DANGER : "#FFFFFF"} fill={liked ? DANGER : "transparent"} />
            </Pressable>

            <View style={styles.storyBottomRow}>
              <View style={styles.storyMetricPill}>
                <Eye size={11} color="#FFFFFF" strokeWidth={2.3} />
                <Text style={styles.storyMetricText}>{item.views ?? 0}</Text>
              </View>

              {item.kind === "video" ? (
                <View style={styles.storyMetricPill}>
                  <Play size={11} color="#FFFFFF" strokeWidth={2.3} />
                  <Text style={styles.storyMetricText}>{item.duration ?? ""}</Text>
                </View>
              ) : item.duration ? (
                <View style={styles.storyMetricPill}>
                  <Text style={styles.storyMetricText}>{item.duration}</Text>
                </View>
              ) : null}
            </View>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <BackgroundFrame theme={theme}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        {!theme.wallpaperUri ? (
          <>
            <View style={[styles.topGlow, { backgroundColor: `${theme.accent}20` }]} />
            <View style={[styles.sideGlow, { backgroundColor: `${theme.accentAlt}18` }]} />
            <View style={[styles.bottomGlow, { backgroundColor: `${theme.accentSoft}14` }]} />
          </>
        ) : null}

        <View style={styles.globalGlassLayerA} />
        <View style={styles.globalGlassLayerB} />

        <View style={styles.container}>
          <View style={styles.headerRow}>
            <GlassActionButton icon={ArrowLeft} onPress={goBackOrMessenger} colors={theme.raised} iconColor={theme.textMain} />

            <View style={styles.headerActions}>
              {roomType === "direct" ? (
                <GlassActionButton
                  icon={PhoneCall}
                  animated
                  onPress={openAudioCall}
                  colors={[theme.accent, theme.accentAlt, theme.accentSoft]}
                  iconColor="#06110D"
                  style={styles.headerActionButton}
                  iconSize={18}
                />
              ) : null}

              {roomType === "direct" ? (
                <GlassActionButton
                  icon={VideoIcon}
                  animated
                  onPress={openVideoCall}
                  colors={["rgba(255,146,210,0.98)", theme.accent]}
                  iconColor="#F8FFF9"
                  style={styles.headerActionButton}
                  iconSize={18}
                />
              ) : null}

              {showOwnerSettings ? (
                <GlassActionButton
                  icon={Settings2}
                  onPress={() => setSettingsVisible(true)}
                  colors={theme.raised}
                  iconColor={theme.textMain}
                  iconSize={18}
                />
              ) : null}
            </View>
          </View>

          <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.profileTop}>
              <View style={styles.avatarOuterGlow} />
              <View style={styles.avatarHalo} />
              <View style={[styles.avatarRing, { borderColor: GLASS_BORDER }]}> 
                <LinearGradient colors={["rgba(255,255,255,0.28)", "rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]} style={styles.avatarRingGlass} />
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <LinearGradient colors={[theme.accent, theme.accentAlt, theme.accentSoft]} style={styles.avatarFallback}>
                    <Text style={styles.avatarLetter}>{partnerLetter}</Text>
                  </LinearGradient>
                )}
              </View>

              <View style={styles.rolePillWrap}>
                <LinearGradient colors={[theme.accent, theme.accentAlt, theme.accentSoft]} style={styles.rolePill}>
                  <IconComponent size={14} strokeWidth={2.4} color="#06110D" />
                  <Text style={styles.rolePillText}>{profileBadgeText}</Text>
                </LinearGradient>
              </View>

              <Text style={styles.partnerName}>{partnerName}</Text>

              <View style={styles.statusRow}>
                {partnerVerified ? <BadgeCheck size={15} strokeWidth={2.2} color={theme.accent} style={styles.verifiedIcon} /> : null}
                <Text style={styles.statusText}>{scopeLabel}</Text>
              </View>

              <View style={styles.infoCardWrap}>
                <View style={styles.cardShadowLayerOne} />
                <View style={styles.cardShadowLayerTwo} />
                <LinearGradient colors={theme.card} style={styles.infoCard}>
                  <LinearGradient colors={["rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)", "rgba(255,255,255,0.01)"]} style={styles.cardGlass} />
                  <View style={styles.cardGlossTop} />
                  <View style={styles.cardInnerBorder} />
                  <InfoRow label={texts.roomType} value={roleTitle} border />
                  <InfoRow label={texts.mobile} value={partnerPhone} border />
                  <InfoRow label={texts.username} value={partnerHandle} border />
                  {publicProfileInfoText ? <InfoRow label={texts.info} value={publicProfileInfoText} border /> : null}
                  <InfoRow label={texts.birthday} value={partnerBirthday} />
                </LinearGradient>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statChipWrap}>
                  <View style={styles.statChipShadow} />
                  <LinearGradient colors={theme.card} style={styles.statChip}>
                    <LinearGradient colors={["rgba(255,255,255,0.14)", "rgba(255,255,255,0.04)", "rgba(255,255,255,0.01)"]} style={styles.statGlass} />
                    <Heart size={14} color={GOLD} strokeWidth={2.4} />
                    <Text style={styles.statChipValue}>{formatCount(likesCount)}</Text>
                    <Text style={styles.statChipLabel}>{texts.likes}</Text>
                  </LinearGradient>
                </View>

                <View style={styles.statChipWrap}>
                  <View style={styles.statChipShadow} />
                  <LinearGradient colors={theme.card} style={styles.statChip}>
                    <LinearGradient colors={["rgba(255,255,255,0.14)", "rgba(255,255,255,0.04)", "rgba(255,255,255,0.01)"]} style={styles.statGlass} />
                    {roomType === "group" ? <Users size={14} color={theme.accentSoft} strokeWidth={2.4} /> : roomType === "channel" ? <Hash size={14} color={theme.accentSoft} strokeWidth={2.4} /> : <Gift size={14} color={PURPLE} strokeWidth={2.4} />}
                    <Text style={styles.statChipValue}>
                      {roomType === "group"
                        ? formatCount(membersCount || 3)
                        : roomType === "channel"
                          ? formatCount(subscribersCount || 0)
                          : formatCount(publicGifts.length)}
                    </Text>
                    <Text style={styles.statChipLabel}>
                      {roomType === "group" ? texts.members : roomType === "channel" ? texts.subscribers : texts.giftsPublic}
                    </Text>
                  </LinearGradient>
                </View>
              </View>
            </View>

            <View style={styles.segmentRow}>
              <SegmentChip active={activeTab === "publications"} label={texts.publications} onPress={() => setActiveTab("publications")} accent={theme.accent} />
              <SegmentChip active={activeTab === "gifts"} label={texts.gifts} onPress={() => setActiveTab("gifts")} accent={theme.accent} />
              <SegmentChip active={activeTab === "archive"} label={texts.archive} onPress={() => setActiveTab("archive")} accent={theme.accent} />
            </View>

            {activeTab === "publications" ? (
              <View>
                <View style={styles.subActionRow}>
                  <LinearGradient colors={theme.raised} style={styles.subActionChip}>
                    <LinearGradient colors={["rgba(255,255,255,0.14)", "rgba(255,255,255,0.04)", "rgba(255,255,255,0.01)"]} style={styles.subActionGlass} />
                    <Text style={styles.subActionText}>{texts.allStories}</Text>
                  </LinearGradient>
                </View>

                {publications.length === 0 ? (
                  <View style={styles.emptyCardWrap}>
                    <View style={styles.emptyCardShadow} />
                    <LinearGradient colors={theme.card} style={styles.emptyCard}>
                      <LinearGradient colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.03)", "rgba(255,255,255,0.01)"]} style={styles.emptyGlass} />
                      <Text style={styles.emptyText}>{texts.emptyPublications}</Text>
                    </LinearGradient>
                  </View>
                ) : (
                  <View style={styles.grid}>{publications.map(renderStoryTile)}</View>
                )}
              </View>
            ) : null}

            {activeTab === "gifts" ? (
              publicGifts.length === 0 ? (
                <View style={styles.emptyCardWrap}>
                  <View style={styles.emptyCardShadow} />
                  <LinearGradient colors={theme.card} style={styles.emptyCard}>
                    <LinearGradient colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.03)", "rgba(255,255,255,0.01)"]} style={styles.emptyGlass} />
                    <Text style={styles.emptyText}>{texts.emptyGifts}</Text>
                  </LinearGradient>
                </View>
              ) : (
                <View style={styles.giftGrid}>
                  {publicGifts.map((item) => (
                    <View key={item.id} style={styles.giftCardWrap}>
                      <View style={styles.giftCardShadow} />
                      <LinearGradient colors={theme.card} style={styles.giftCard}>
                        <LinearGradient colors={["rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)", "rgba(255,255,255,0.01)"]} style={styles.giftGlass} />
                        {item.imageUri ? (
                          <Image source={{ uri: item.imageUri }} style={styles.giftImage} resizeMode="contain" />
                        ) : (
                          <Text style={styles.giftEmoji}>{item.emoji || "🎁"}</Text>
                        )}
                        {item.title ? <Text style={styles.giftTitle}>{item.title}</Text> : null}
                      </LinearGradient>
                    </View>
                  ))}
                </View>
              )
            ) : null}

            {activeTab === "archive" ? (
              initialArchive.length === 0 ? (
                <View style={styles.emptyCardWrap}>
                  <View style={styles.emptyCardShadow} />
                  <LinearGradient colors={theme.card} style={styles.emptyCard}>
                    <LinearGradient colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.03)", "rgba(255,255,255,0.01)"]} style={styles.emptyGlass} />
                    <Text style={styles.emptyText}>{texts.emptyArchive}</Text>
                  </LinearGradient>
                </View>
              ) : (
                <View style={styles.grid}>{initialArchive.map(renderStoryTile)}</View>
              )
            ) : null}
          </ScrollView>
        </View>

        <Modal visible={settingsVisible} transparent animationType="fade" onRequestClose={() => setSettingsVisible(false)}>
          <View style={styles.settingsOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setSettingsVisible(false)} />
            <View style={styles.settingsCardWrap}>
              <LinearGradient colors={theme.card} style={styles.settingsCard}>
                <View style={styles.settingsHeaderRow}>
                  <View>
                    <Text style={styles.settingsHeaderTitle}>
                      {roomType === "group"
                        ? texts.groupSettings
                        : roomType === "channel"
                          ? texts.channelSettings
                          : texts.botSettings}
                    </Text>
                    <Text style={styles.settingsHeaderSubtitle}>
                      {texts.settingsOnlyOwner}
                    </Text>
                  </View>
                  <Pressable onPress={() => setSettingsVisible(false)} style={styles.settingsClose}>
                    <X size={18} color={theme.textMain} strokeWidth={2.4} />
                  </Pressable>
                </View>

                <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.settingsScrollContent}>
                  {roomType === "group" && showOwnerSettings ? (
                    <>
                      <View style={styles.settingsSectionHeader}>
                        <Text style={styles.settingsSectionTitle}>{texts.groupSettings}</Text>
                        <Text style={styles.settingsSectionSubtitle}>{texts.ownerToolsSubtitle}</Text>
                      </View>

                      <ActionRow
                        title={texts.addMembers}
                        subtitle={texts.addMembersSubtitle}
                        icon={<UserRoundPlus size={18} color="#D6FFF0" strokeWidth={2.4} />}
                        onPress={() =>
                          router.push({
                            pathname: "/tabs/contacts",
                            params: {
                              ...(routeUserId ? { userId: routeUserId } : {}),
                              groupId: chatId,
                              mode: "invite_to_group",
                            },
                          } as never)
                        }
                      />

                      <ActionRow
                        title={texts.admins}
                        subtitle={texts.adminsSubtitle}
                        icon={<ShieldCheck size={18} color="#D6FFF0" strokeWidth={2.4} />}
                        onPress={() => Alert.alert(texts.admins, texts.adminsSubtitle)}
                      />

                      <View style={styles.memberManagementCard}>
                        <View style={styles.memberManagementHeader}>
                          <Text style={styles.memberManagementTitle}>{texts.groupMembers}</Text>
                          <Text style={styles.memberManagementCount}>{String(visibleGroupMembers.length)}</Text>
                        </View>

                        <View style={styles.blacklistInputCard}>
                          <TextInput
                            value={memberInput}
                            onChangeText={setMemberInput}
                            placeholder={texts.enterUserId}
                            placeholderTextColor="rgba(245,251,255,0.42)"
                            style={styles.blacklistInput}
                          />
                          <Pressable onPress={addGroupMemberFromInput} style={styles.blacklistAddButtonWrap}>
                            <LinearGradient
                              colors={[theme.accent, theme.accentAlt, theme.accentSoft]}
                              style={styles.blacklistAddButton}
                            >
                              <Text style={styles.blacklistAddText}>{texts.add}</Text>
                            </LinearGradient>
                          </Pressable>
                        </View>

                        {visibleGroupMembers.length === 0 ? (
                          <View style={styles.blacklistEmptyCard}>
                            <Text style={styles.blacklistEmptyText}>{texts.noGroupMembers}</Text>
                          </View>
                        ) : (
                          visibleGroupMembers.map((member) => (
                            <View key={member.userId} style={styles.memberRowCard}>
                              <View style={styles.memberInfoBlock}>
                                <Text style={styles.memberNameText} numberOfLines={1}>
                                  {member.displayName || member.userId}
                                </Text>
                                <Text style={styles.memberRoleText}>
                                  {member.status === "invited"
                                    ? texts.memberInvited
                                    : groupRoleLabel(member.role)}
                                </Text>
                              </View>

                              {member.role === "owner" ? (
                                <Text style={styles.memberOwnerText}>{texts.ownerRole}</Text>
                              ) : (
                                <View style={styles.memberActionButtons}>
                                  <Pressable
                                    onPress={() => toggleGroupMemberRole(member)}
                                    style={styles.memberSmallButton}
                                  >
                                    <Text style={styles.memberSmallButtonText}>
                                      {member.role === "admin" ? texts.demoteMember : texts.promoteAdmin}
                                    </Text>
                                  </Pressable>
                                  <Pressable
                                    onPress={() => removeGroupMemberById(member)}
                                    style={[styles.memberSmallButton, styles.memberDangerButton]}
                                  >
                                    <Text style={styles.memberDangerButtonText}>{texts.remove}</Text>
                                  </Pressable>
                                </View>
                              )}
                            </View>
                          ))
                        )}

                        <View style={styles.memberManagementHeader}>
                          <Text style={styles.memberManagementTitle}>{texts.pendingJoinRequests}</Text>
                          <Text style={styles.memberManagementCount}>{String(pendingGroupJoinRequests.length)}</Text>
                        </View>

                        {pendingGroupJoinRequests.length === 0 ? (
                          <View style={styles.blacklistEmptyCard}>
                            <Text style={styles.blacklistEmptyText}>{texts.noPendingJoinRequests}</Text>
                          </View>
                        ) : (
                          pendingGroupJoinRequests.map((member) => (
                            <View key={member.userId} style={styles.memberRowCard}>
                              <View style={styles.memberInfoBlock}>
                                <Text style={styles.memberNameText} numberOfLines={1}>
                                  {member.displayName || member.userId}
                                </Text>
                                <Text style={styles.memberRoleText}>{texts.pendingJoinRequests}</Text>
                              </View>
                              <View style={styles.memberActionButtons}>
                                <Pressable
                                  onPress={() => approvePendingGroupMember(member)}
                                  style={styles.memberSmallButton}
                                >
                                  <Text style={styles.memberSmallButtonText}>{texts.approve}</Text>
                                </Pressable>
                                <Pressable
                                  onPress={() => rejectPendingGroupMember(member)}
                                  style={[styles.memberSmallButton, styles.memberDangerButton]}
                                >
                                  <Text style={styles.memberDangerButtonText}>{texts.reject}</Text>
                                </Pressable>
                              </View>
                            </View>
                          ))
                        )}
                      </View>

                      <ToggleRow
                        title={texts.adminOnlyMessaging}
                        subtitle={texts.ownerToolsSubtitle}
                        value={adminOnlyMessaging}
                        onValueChange={saveToggle(setAdminOnlyMessaging, "adminOnlyMessaging")}
                        icon={<Lock size={18} color="#E8DEFF" strokeWidth={2.4} />}
                      />

                      <ToggleRow
                        title={texts.adminOnlyMedia}
                        subtitle={texts.mediaSubtitle}
                        value={adminOnlyMedia}
                        onValueChange={saveToggle(setAdminOnlyMedia, "adminOnlyMedia")}
                        icon={<ImageIcon size={18} color="#D6FFF0" strokeWidth={2.4} />}
                      />

                      <ToggleRow
                        title={texts.adminOnlyInvites}
                        subtitle={texts.addMembersSubtitle}
                        value={adminOnlyInvites}
                        onValueChange={saveToggle(setAdminOnlyInvites, "adminOnlyInvites")}
                        icon={<UserRoundPlus size={18} color="#D6FFF0" strokeWidth={2.4} />}
                      />

                      <ToggleRow
                        title={texts.approveJoinRequests}
                        subtitle={texts.ownerToolsSubtitle}
                        value={approveJoinRequests}
                        onValueChange={saveToggle(setApproveJoinRequests, "approveJoinRequests")}
                        icon={<ShieldCheck size={18} color="#D6FFF0" strokeWidth={2.4} />}
                      />

                      <ToggleRow
                        title={texts.autoDeleteAds}
                        subtitle={texts.ownerToolsSubtitle}
                        value={autoDeleteAds}
                        onValueChange={saveToggle(setAutoDeleteAds, "autoDeleteAds")}
                        icon={<Trash2 size={18} color="#FFB8C4" strokeWidth={2.4} />}
                      />

                      <ToggleRow
                        title={texts.autoDeletePromoLeaflets}
                        subtitle={texts.ownerToolsSubtitle}
                        value={autoDeletePromoLeaflets}
                        onValueChange={saveToggle(setAutoDeletePromoLeaflets, "autoDeletePromoLeaflets")}
                        icon={<Trash2 size={18} color="#FFB8C4" strokeWidth={2.4} />}
                      />

                      <ToggleRow
                        title={texts.autoDeleteLinks}
                        subtitle={texts.ownerToolsSubtitle}
                        value={autoDeleteLinks}
                        onValueChange={saveToggle(setAutoDeleteLinks, "autoDeleteLinks")}
                        icon={<Link2 size={18} color="#D6FFF0" strokeWidth={2.4} />}
                      />

                      <ToggleRow
                        title={texts.autoBanRepeatedSpam}
                        subtitle={texts.ownerToolsSubtitle}
                        value={autoBanRepeatedSpam}
                        onValueChange={saveToggle(setAutoBanRepeatedSpam, "autoBanRepeatedSpam")}
                        icon={<ShieldCheck size={18} color="#D6FFF0" strokeWidth={2.4} />}
                      />

                      <ActionRow
                        title={texts.inviteLink}
                        subtitle={inviteLink}
                        icon={<Link2 size={18} color="#D6FFF0" strokeWidth={2.4} />}
                        onPress={() => Alert.alert(texts.inviteLink, inviteLink)}
                      />

                      <ActionRow
                        title={texts.regenerateLink}
                        subtitle={texts.inviteRegenerated}
                        icon={<Link2 size={18} color="#D6FFF0" strokeWidth={2.4} />}
                        onPress={regenerateInvite}
                      />

                      <ActionRow
                        title={texts.sendInvite}
                        subtitle={texts.inviteLink}
                        icon={<UserRoundPlus size={18} color="#D6FFF0" strokeWidth={2.4} />}
                        onPress={() => void shareInvite()}
                      />

                      <View style={styles.blacklistCard}>
                        <Text style={styles.blacklistTitle}>{texts.blacklist}</Text>
                        <Text style={styles.blacklistSubtitle}>{texts.blacklistSubtitle}</Text>

                        <View style={styles.blacklistInputCard}>
                          <TextInput
                            value={blacklistInput}
                            onChangeText={setBlacklistInput}
                            placeholder={texts.enterUserId}
                            placeholderTextColor="rgba(245,251,255,0.42)"
                            style={styles.blacklistInput}
                          />
                          <Pressable onPress={addBlacklistEntry} style={styles.blacklistAddButtonWrap}>
                            <LinearGradient
                              colors={[theme.accent, theme.accentAlt, theme.accentSoft]}
                              style={styles.blacklistAddButton}
                            >
                              <Text style={styles.blacklistAddText}>{texts.add}</Text>
                            </LinearGradient>
                          </Pressable>
                        </View>

                        {blacklist.length === 0 ? (
                          <View style={styles.blacklistEmptyCard}>
                            <Text style={styles.blacklistEmptyText}>{texts.blacklistSubtitle}</Text>
                          </View>
                        ) : (
                          blacklist.map((entry) => (
                            <ActionRow
                              key={entry}
                              title={entry}
                              subtitle={texts.blacklist}
                              icon={<Trash2 size={18} color="#FFB8C4" strokeWidth={2.4} />}
                              onPress={() => removeBlacklistEntry(entry)}
                              trailing={<Text style={styles.removeText}>{texts.remove}</Text>}
                            />
                          ))
                        )}
                      </View>

                      <ActionRow
                        title={texts.deleteGroup}
                        subtitle={partnerName}
                        icon={<Trash2 size={18} color="#FFB8C4" strokeWidth={2.4} />}
                        danger
                        onPress={deleteRoom}
                      />
                    </>
                  ) : null}

                  {roomType === "channel" && showOwnerSettings ? (
                    <>
                      <View style={styles.settingsSectionHeader}>
                        <Text style={styles.settingsSectionTitle}>{texts.channelSettings}</Text>
                        <Text style={styles.settingsSectionSubtitle}>{texts.ownerToolsSubtitle}</Text>
                      </View>

                      <ActionRow
                        title={texts.admins}
                        subtitle={texts.adminsSubtitle}
                        icon={<ShieldCheck size={18} color="#D6FFF0" strokeWidth={2.4} />}
                        onPress={() => Alert.alert(texts.admins, texts.adminsSubtitle)}
                      />

                      <ToggleRow
                        title={texts.publishingAdminsOnly}
                        subtitle={texts.channelSettings}
                        value={channelPostingAdminsOnly}
                        onValueChange={(next) => {
                          setChannelPostingAdminsOnly(next);
                          persistChannelSettings({ postingAdminsOnly: next });
                        }}
                        icon={<Lock size={18} color="#E8DEFF" strokeWidth={2.4} />}
                      />

                      <ToggleRow
                        title={texts.approveSubscribers}
                        subtitle={texts.subscribersSubtitle}
                        value={channelApproveSubscribers}
                        onValueChange={(next) => {
                          setChannelApproveSubscribers(next);
                          persistChannelSettings({ approveSubscribers: next });
                        }}
                        icon={<Users size={18} color="#D6FFF0" strokeWidth={2.4} />}
                      />

                      <ToggleRow
                        title={texts.channelReactions}
                        subtitle={texts.channelSettings}
                        value={channelReactionsEnabled}
                        onValueChange={(next) => {
                          setChannelReactionsEnabled(next);
                          persistChannelSettings({ reactionsEnabled: next });
                        }}
                        icon={<Gift size={18} color="#D6FFF0" strokeWidth={2.4} />}
                      />

                      <ToggleRow
                        title={texts.channelComments}
                        subtitle={texts.channelSettings}
                        value={channelCommentsEnabled}
                        onValueChange={(next) => {
                          setChannelCommentsEnabled(next);
                          persistChannelSettings({ commentsEnabled: next });
                        }}
                        icon={<MessageCircleMore size={18} color="#D6FFF0" strokeWidth={2.4} />}
                      />

                      <ToggleRow
                        title={texts.visibleInDiscovery}
                        subtitle={texts.channelSettings}
                        value={channelVisibleInDiscovery}
                        onValueChange={(next) => {
                          setChannelVisibleInDiscovery(next);
                          persistChannelSettings({ visibleInDiscovery: next });
                        }}
                        icon={<Hash size={18} color="#D6FFF0" strokeWidth={2.4} />}
                      />

                      <ActionRow
                        title={texts.inviteLink}
                        subtitle={inviteLink}
                        icon={<Link2 size={18} color="#D6FFF0" strokeWidth={2.4} />}
                        onPress={() => Alert.alert(texts.inviteLink, inviteLink)}
                      />

                      <ActionRow
                        title={texts.sendInvite}
                        subtitle={texts.subscribersSubtitle}
                        icon={<UserRoundPlus size={18} color="#D6FFF0" strokeWidth={2.4} />}
                        onPress={() => void shareInvite()}
                      />

                      <ActionRow
                        title={texts.deleteChannel}
                        subtitle={partnerName}
                        icon={<Trash2 size={18} color="#FFB8C4" strokeWidth={2.4} />}
                        danger
                        onPress={deleteRoom}
                      />
                    </>
                  ) : null}

                  {isBot && showOwnerSettings ? (
                    <>
                      <View style={styles.settingsSectionHeader}>
                        <Text style={styles.settingsSectionTitle}>{texts.botSettings}</Text>
                        <Text style={styles.settingsSectionSubtitle}>{texts.botSubtitle}</Text>
                      </View>

                      <ActionRow
                        title={texts.openOwnerPanel}
                        subtitle={texts.ownerPanelSubtitle}
                        icon={<Bot size={18} color="#D6FFF0" strokeWidth={2.4} />}
                        onPress={openBotOwnerPanel}
                      />

                      <ToggleRow
                        title={texts.botPublicVisible}
                        subtitle={texts.botSubtitle}
                        value={botPublicVisible}
                        onValueChange={(next) => {
                          setBotPublicVisible(next);
                          persistBotSettings({ publicVisible: next });
                        }}
                        icon={<Bot size={18} color="#D6FFF0" strokeWidth={2.4} />}
                      />

                      <ToggleRow
                        title={texts.botInlineEnabled}
                        subtitle={texts.botSubtitle}
                        value={botInlineEnabled}
                        onValueChange={(next) => {
                          setBotInlineEnabled(next);
                          persistBotSettings({ inlineEnabled: next });
                        }}
                        icon={<MessageCircleMore size={18} color="#D6FFF0" strokeWidth={2.4} />}
                      />

                      <ToggleRow
                        title={texts.botAutoReplyEnabled}
                        subtitle={texts.botSubtitle}
                        value={botAutoReplyEnabled}
                        onValueChange={(next) => {
                          setBotAutoReplyEnabled(next);
                          persistBotSettings({ autoReplyEnabled: next });
                        }}
                        icon={<Bot size={18} color="#D6FFF0" strokeWidth={2.4} />}
                      />

                      <ToggleRow
                        title={texts.botMarketplaceLinked}
                        subtitle={texts.botSubtitle}
                        value={botMarketplaceLinked}
                        onValueChange={(next) => {
                          setBotMarketplaceLinked(next);
                          persistBotSettings({ marketplaceLinked: next });
                        }}
                        icon={<Store size={18} color="#D6FFF0" strokeWidth={2.4} />}
                      />

                      <ToggleRow
                        title={texts.botDeliveryLinked}
                        subtitle={texts.botSubtitle}
                        value={botDeliveryLinked}
                        onValueChange={(next) => {
                          setBotDeliveryLinked(next);
                          persistBotSettings({ deliveryLinked: next });
                        }}
                        icon={<Truck size={18} color="#D6FFF0" strokeWidth={2.4} />}
                      />

                      {String(params.botKind || "").trim().toLowerCase() === "business" ? (
                        <ToggleRow
                          title={texts.botBusinessRoutingEnabled}
                          subtitle={texts.businessRoutingNote}
                          value={botBusinessRoutingEnabled}
                          onValueChange={(next) => {
                            setBotBusinessRoutingEnabled(next);
                            persistBotSettings({ businessRoutingEnabled: next });
                          }}
                          icon={<BriefcaseBusiness size={18} color="#D6FFF0" strokeWidth={2.4} />}
                        />
                      ) : null}

                      <ActionRow
                        title={texts.deleteBot}
                        subtitle={partnerName}
                        icon={<Trash2 size={18} color="#FFB8C4" strokeWidth={2.4} />}
                        danger
                        onPress={deleteRoom}
                      />
                    </>
                  ) : null}
                </ScrollView>
              </LinearGradient>
            </View>
          </View>
        </Modal>

        <Modal visible={Boolean(photoModalUri)} transparent animationType="fade" onRequestClose={() => setPhotoModalUri(null)}>
          <View style={styles.modalOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setPhotoModalUri(null)} />
            <View style={styles.modalContent}>
              <Pressable onPress={() => setPhotoModalUri(null)} style={styles.modalClose}>
                <LinearGradient colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)"]} style={styles.modalCloseGlass} />
                <X size={20} strokeWidth={2.4} color="#FFFFFF" />
              </Pressable>
              {photoModalUri ? <Image source={{ uri: photoModalUri }} style={styles.fullscreenMedia} resizeMode="contain" /> : null}
            </View>
          </View>
        </Modal>

        <Modal visible={Boolean(videoModalUri)} transparent animationType="fade" onRequestClose={() => setVideoModalUri(null)}>
          <View style={styles.modalOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setVideoModalUri(null)} />
            <View style={styles.modalContent}>
              <Pressable onPress={() => setVideoModalUri(null)} style={styles.modalClose}>
                <LinearGradient colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)"]} style={styles.modalCloseGlass} />
                <X size={20} strokeWidth={2.4} color="#FFFFFF" />
              </Pressable>
              {videoModalUri ? (
                <Video source={{ uri: videoModalUri }} style={styles.fullscreenMedia} useNativeControls resizeMode={ResizeMode.CONTAIN} shouldPlay isLooping={false} />
              ) : null}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </BackgroundFrame>
  );
}

const styles = StyleSheet.create<any>({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  globalGlassLayerA: {
    position: "absolute",
    top: 92,
    right: 22,
    width: 210,
    height: 210,
    borderRadius: 210,
    backgroundColor: "rgba(255,255,255,0.035)",
  },
  globalGlassLayerB: {
    position: "absolute",
    top: 148,
    right: 54,
    width: 148,
    height: 148,
    borderRadius: 148,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  topGlow: { position: "absolute", top: -36, right: -14, width: 240, height: 240, borderRadius: 240, opacity: 0.82 },
  sideGlow: { position: "absolute", top: 198, left: -78, width: 210, height: 210, borderRadius: 210, opacity: 0.54 },
  bottomGlow: { position: "absolute", bottom: -70, right: -44, width: 200, height: 200, borderRadius: 200, opacity: 0.64 },
  container: { flex: 1, paddingHorizontal: 16 },
  headerRow: { paddingTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerActions: { flexDirection: "row", alignItems: "center" },
  headerActionButton: { marginRight: 10 },
  glassButtonOuter: { width: 48, height: 48, borderRadius: 24, position: "relative" },
  glassButtonPulse: { position: "absolute", top: -7, left: -7, right: -7, bottom: -7, borderRadius: 32, backgroundColor: "rgba(222,255,248,0.9)" },
  glassButtonPressable: { flex: 1 },
  roundButton: {
    flex: 1,
    borderRadius: 24,
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
  roundButtonEdge: { position: "absolute", inset: 1, borderRadius: 23, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  buttonGloss: { position: "absolute", top: 3, left: 5, right: 5, height: 16, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.22)" },
  buttonShimmer: { position: "absolute", top: -8, bottom: -8, width: 18, backgroundColor: "rgba(255,255,255,0.28)", opacity: 0.22, borderRadius: 20 },
  scrollContent: { paddingTop: 16, paddingBottom: 36 },
  profileTop: { alignItems: "center" },
  avatarOuterGlow: { position: "absolute", top: 14, width: 164, height: 164, borderRadius: 82, backgroundColor: "rgba(255,255,255,0.04)" },
  avatarHalo: { position: "absolute", top: 24, width: 144, height: 144, borderRadius: 72, backgroundColor: "rgba(255,255,255,0.06)" },
  avatarRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  avatarRingGlass: { ...StyleSheet.absoluteFillObject },
  avatarImage: { width: 124, height: 124, borderRadius: 62 },
  avatarFallback: { width: 124, height: 124, borderRadius: 62, alignItems: "center", justifyContent: "center" },
  avatarLetter: { color: "#F7FFFC", fontSize: 44, fontWeight: "900" },
  rolePillWrap: { marginBottom: 8 },
  rolePill: { minHeight: 30, borderRadius: 999, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  rolePillText: { marginLeft: 6, color: "#06110D", fontSize: 12, fontWeight: "900" },
  partnerName: { color: TEXT, fontSize: 27, fontWeight: "900", textShadowColor: "rgba(0,0,0,0.18)", textShadowRadius: 10, textShadowOffset: { width: 0, height: 3 } },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 6, marginBottom: 18 },
  verifiedIcon: { marginRight: 6 },
  statusText: { color: TEXT_SOFT, fontSize: 14, fontWeight: "700" },
  infoCardWrap: { width: "100%", marginBottom: 2 },
  cardShadowLayerOne: { position: "absolute", top: 10, left: 10, right: 10, bottom: -6, borderRadius: 30, backgroundColor: "rgba(0,0,0,0.12)" },
  cardShadowLayerTwo: { position: "absolute", top: 4, left: 4, right: 4, bottom: -2, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.03)" },
  infoCard: { width: "100%", borderRadius: 28, borderWidth: 1, borderColor: GLASS_BORDER, overflow: "hidden", shadowColor: "#000000", shadowOpacity: 0.24, shadowRadius: 18, shadowOffset: { width: 0, height: 12 }, elevation: 12 },
  cardGlass: { ...StyleSheet.absoluteFillObject },
  cardGlossTop: { position: "absolute", top: 8, left: 12, right: 12, height: 18, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.12)" },
  cardInnerBorder: { position: "absolute", top: 1, bottom: 1, left: 1, right: 1, borderRadius: 27, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  infoRow: { paddingHorizontal: 16, paddingVertical: 15 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" },
  infoLabel: { color: MUTED, fontSize: 12, fontWeight: "700" },
  infoValue: { marginTop: 5, color: TEXT, fontSize: 17, fontWeight: "800" },
  statsRow: { width: "100%", flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  statChipWrap: { width: "48.4%", position: "relative" },
  statChipShadow: { position: "absolute", top: 8, left: 8, right: 8, bottom: -4, borderRadius: 24, backgroundColor: "rgba(0,0,0,0.14)" },
  statChip: { minHeight: 92, borderRadius: 22, borderWidth: 1, borderColor: GLASS_BORDER, paddingHorizontal: 14, paddingVertical: 12, overflow: "hidden", shadowColor: "#000000", shadowOpacity: 0.20, shadowRadius: 14, shadowOffset: { width: 0, height: 10 }, elevation: 10 },
  statGlass: { ...StyleSheet.absoluteFillObject },
  statChipValue: { marginTop: 10, color: TEXT, fontSize: 20, fontWeight: "900" },
  statChipLabel: { marginTop: 2, color: MUTED, fontSize: 12, fontWeight: "700" },
  segmentRow: { flexDirection: "row", marginTop: 20, marginBottom: 14, paddingRight: 6 },
  segmentWrap: { marginRight: 10 },
  segmentChip: { minHeight: 44, paddingHorizontal: 18, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden", shadowColor: "#000000", shadowOpacity: 0.14, shadowRadius: 10, shadowOffset: { width: 0, height: 8 }, elevation: 7, backgroundColor: "rgba(8,18,31,0.88)" },
  segmentChipActive: { borderColor: "rgba(255,255,255,0.18)" },
  segmentGlass: { ...StyleSheet.absoluteFillObject },
  segmentGloss: { position: "absolute", top: 4, left: 8, right: 8, height: 12, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.12)" },
  segmentText: { color: TEXT, fontSize: 14, fontWeight: "800" },
  segmentTextActive: { color: "#FFFFFF" },
  subActionRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  subActionChip: { minHeight: 40, paddingHorizontal: 18, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden", shadowColor: "#000000", shadowOpacity: 0.14, shadowRadius: 10, shadowOffset: { width: 0, height: 8 }, elevation: 7 },
  subActionGlass: { ...StyleSheet.absoluteFillObject },
  subActionText: { color: TEXT, fontSize: 14, fontWeight: "800" },
  helperText: { color: TEXT_SOFT, fontSize: 12, lineHeight: 18, marginBottom: 12, paddingHorizontal: 2 },
  emptyCardWrap: { position: "relative" },
  emptyCardShadow: { position: "absolute", top: 8, left: 8, right: 8, bottom: -4, borderRadius: 24, backgroundColor: "rgba(0,0,0,0.14)" },
  emptyCard: { minHeight: 102, borderRadius: 22, borderWidth: 1, borderColor: GLASS_BORDER, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, overflow: "hidden" },
  emptyGlass: { ...StyleSheet.absoluteFillObject },
  emptyText: { color: TEXT_SOFT, fontSize: 13, textAlign: "center", lineHeight: 18, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  storyTileWrap: { borderRadius: 20, overflow: "hidden", marginBottom: 12, backgroundColor: "#101010", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)", shadowColor: "#000000", shadowOpacity: 0.22, shadowRadius: 14, shadowOffset: { width: 0, height: 10 }, elevation: 9 },
  storyImage: { width: "100%", height: "100%" },
  mediaFallbackPreview: { alignItems: "center", justifyContent: "center" },
  storyTopGlass: { position: "absolute", top: 0, left: 0, right: 0, height: "28%" },
  storyShade: { ...StyleSheet.absoluteFillObject },
  storyInnerBorder: { position: "absolute", top: 1, bottom: 1, left: 1, right: 1, borderRadius: 19, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  storyLikeButton: { position: "absolute", top: 8, left: 8, width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.20)", overflow: "hidden" },
  storyLikeButtonGlass: { ...StyleSheet.absoluteFillObject },
  storyBottomRow: { position: "absolute", left: 8, right: 8, bottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  storyMetricPill: { minHeight: 22, maxWidth: "48%", paddingHorizontal: 8, borderRadius: 999, backgroundColor: "rgba(9,16,29,0.50)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", flexDirection: "row", alignItems: "center" },
  storyMetricText: { marginLeft: 4, color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  giftGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  giftCardWrap: { width: "48.2%", position: "relative", marginBottom: 12 },
  giftCardShadow: { position: "absolute", top: 8, left: 8, right: 8, bottom: -4, borderRadius: 24, backgroundColor: "rgba(0,0,0,0.14)" },
  giftCard: { minHeight: 150, borderRadius: 22, borderWidth: 1, borderColor: GLASS_BORDER, padding: 16, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  giftGlass: { ...StyleSheet.absoluteFillObject },
  giftImage: { width: 92, height: 92, marginBottom: 12 },
  giftEmoji: { fontSize: 60, lineHeight: 66, marginBottom: 10 },
  giftTitle: { color: TEXT, fontSize: 16, fontWeight: "900", textAlign: "center" },
  settingsOverlay: { flex: 1, backgroundColor: "rgba(1,5,7,0.68)", justifyContent: "center", paddingHorizontal: 18 },
  settingsCardWrap: { maxHeight: "86%" },
  settingsCard: { borderRadius: 28, borderWidth: 1, borderColor: GLASS_BORDER, overflow: "hidden", padding: 14 },
  settingsHeaderRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 },
  settingsHeaderTitle: { color: TEXT, fontSize: 20, fontWeight: "900" },
  settingsHeaderSubtitle: { marginTop: 4, color: TEXT_SOFT, fontSize: 12, lineHeight: 17, fontWeight: "700", maxWidth: 260 },
  settingsClose: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  settingsScrollContent: { paddingBottom: 8 },
  settingsSectionHeader: { marginTop: 14, marginBottom: 8, paddingHorizontal: 2 },
  settingsSectionTitle: { color: TEXT, fontSize: 16, fontWeight: "900" },
  settingsSectionSubtitle: { marginTop: 4, color: TEXT_SOFT, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  settingsActionWrap: { borderRadius: 18, marginTop: 8 },
  settingsAction: { minHeight: 62, borderRadius: 18, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", overflow: "hidden" },
  settingsIconWrap: { width: 40, height: 40, borderRadius: 15, marginRight: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.07)" },
  settingsTextWrap: { flex: 1, paddingRight: 10 },
  settingsTitle: { color: TEXT, fontSize: 14, fontWeight: "900" },
  settingsTitleDanger: { color: "#FFE9ED" },
  settingsSubtitle: { marginTop: 4, color: TEXT_SOFT, fontSize: 11, fontWeight: "700", lineHeight: 15 },
  memberManagementCard: { marginTop: 10, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 12, backgroundColor: "rgba(255,255,255,0.035)" },
  memberManagementHeader: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  memberManagementTitle: { color: TEXT, fontSize: 14, fontWeight: "900" },
  memberManagementCount: { color: TEXT_SOFT, fontSize: 12, fontWeight: "900" },
  memberRowCard: { marginTop: 10, minHeight: 56, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.035)" },
  memberInfoBlock: { flex: 1, paddingRight: 10 },
  memberNameText: { color: TEXT, fontSize: 13, fontWeight: "900" },
  memberRoleText: { marginTop: 4, color: TEXT_SOFT, fontSize: 11, fontWeight: "700" },
  memberOwnerText: { color: GOLD, fontSize: 12, fontWeight: "900" },
  memberActionButtons: { flexDirection: "row", alignItems: "center", gap: 6 },
  memberSmallButton: { minHeight: 32, borderRadius: 11, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", paddingHorizontal: 9, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)" },
  memberDangerButton: { borderColor: "rgba(255,136,202,0.22)", backgroundColor: "rgba(255,136,202,0.08)" },
  memberSmallButtonText: { color: TEXT, fontSize: 10, fontWeight: "900" },
  memberDangerButtonText: { color: "#FFB8C4", fontSize: 10, fontWeight: "900" },
  blacklistCard: { marginTop: 10, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 12, backgroundColor: "rgba(255,255,255,0.03)" },
  blacklistTitle: { color: TEXT, fontSize: 14, fontWeight: "900" },
  blacklistSubtitle: { marginTop: 4, color: TEXT_SOFT, fontSize: 11, lineHeight: 16, fontWeight: "700" },
  blacklistInputCard: { minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 10, flexDirection: "row", alignItems: "center", marginTop: 10, backgroundColor: "rgba(255,255,255,0.04)" },
  blacklistInput: { flex: 1, color: TEXT, fontSize: 14, fontWeight: "600", paddingVertical: 10, paddingRight: 8 },
  blacklistAddButtonWrap: { marginLeft: 8 },
  blacklistAddButton: { minWidth: 66, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  blacklistAddText: { color: "#062019", fontSize: 12, fontWeight: "900" },
  blacklistEmptyCard: { marginTop: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: "rgba(255,255,255,0.03)" },
  blacklistEmptyText: { color: TEXT_SOFT, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  removeText: { color: "#FFB8C4", fontSize: 12, fontWeight: "900" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },
  modalClose: { position: "absolute", top: 56, right: 22, zIndex: 3, width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
  modalCloseGlass: { ...StyleSheet.absoluteFillObject },
  fullscreenMedia: { width: "100%", height: "100%" },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.96 },
});