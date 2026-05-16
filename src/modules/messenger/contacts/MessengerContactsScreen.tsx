import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Linking,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as Contacts from "expo-contacts";
import {
  ArrowLeft,
  BadgeCheck,
  CirclePlus,
  MessageCircleMore,
  MoreHorizontal,
  PencilLine,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Trash2,
  Users,
  X,
} from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import {
  getMessengerThemePalette,
  getMessengerThemeState,
  hydrateMessengerThemeState,
  type MessengerThemePalette,
  type MessengerThemeState,
} from "../theme/messengerThemeRuntime";
import {
  listPersistedChatRooms,
  registerPersistedChatRoom,
} from "../chat-room/services/chatRoomRealtime";
import { saveChatPartnerToSystemContacts } from "../chat-room/roomSettingsDeviceApi";
import {
  hydratePublicProfileStorage,
  resolvePublicProfileAvatarUri,
  subscribePublicProfiles,
} from "../public/publicProfileRuntime";
import { hydrateGroupPublicProfile } from "../groups/groupPublicProfileRuntime";
import { resolveMessengerKernelSession } from "../../../core/kernel/messenger/session/service";
import { ensureMessengerDirectRoom, fetchMessengerUsers } from "./messengerContactsApi";
import {
  buildChatId,
  buildDirectMessengerChatId,
  getAvatarLetter,
  listCustomMessengerContacts,
  listDeletedCustomMessengerContactKeys,
  removeCustomMessengerContact,
  upsertCustomMessengerContact,
  type MessengerCustomContact,
} from "./messengerContactsRuntime";
import { openMessengerRoom } from "../navigation/messengerRoomNavigation";
import {
  buildMessengerCanonicalIdentityKey,
  mergeMessengerCanonicalRecords,
} from "./messengerIdentityResolver";

type RoomType = "direct" | "business";

type ContactRow = {
  id: string;
  chatId?: string;
  name: string;
  phone?: string;
  username?: string;
  verified?: boolean;
  official?: boolean;
  avatarLetter: string;
  avatarUrl?: string;
  roomType: RoomType;
  source: "sabi" | "phone" | "custom";
  subtitle: string;
  deviceContactId?: string;
  currentUserId?: string;
  peerUserId?: string;
};

type ComposerMode = null | "new_contact" | "new_chat";

type ContactRouteParams = {
  userId?: string;
  mode?: string;
  source?: string;
  chatId?: string;
  roomType?: string;
  prefillName?: string;
  prefillPhone?: string;
  prefillHandle?: string;
  avatarLetter?: string;
  verified?: string;
  returnTo?: string;
  returnChatId?: string;
  returnUserId?: string;
  returnPeerId?: string;
  returnRoomType?: string;
  returnName?: string;
  returnAvatarLetter?: string;
  returnAvatarUrl?: string;
  returnPhotoUrl?: string;
  returnVerified?: string;
  returnStatus?: string;
  returnRoomTitle?: string;
  returnParticipants?: string;
};

const SERVICE_CONTACTS: ContactRow[] = [
  {
    id: "sabi-support",
    chatId: "sabi-support",
    name: "Sabi Support",
    username: "@sabi_support",
    verified: true,
    official: true,
    avatarLetter: "S",
    roomType: "business",
    source: "sabi",
    subtitle: "",
  },
  {
    id: "sabi-business",
    chatId: "sabi-business",
    name: "Business Desk",
    username: "@sabi_business",
    verified: true,
    official: true,
    avatarLetter: "B",
    roomType: "business",
    source: "sabi",
    subtitle: "",
  },
];

const TOP_BAR_BODY_HEIGHT = 52;

function normalizePhone(value?: string | null) {
  const digits = String(value ?? "").replace(/[^\d+]/g, "").trim();
  return digits || "";
}

function normalizeHandle(value?: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return raw.startsWith("@") ? raw : `@${raw}`;
}

function normalizeSearchValue(value?: string | null) {
  return String(value ?? "").trim().toLowerCase();
}

function toInviteSmsUrl(phone: string, message: string) {
  const cleaned = normalizePhone(phone);
  if (!cleaned) return "";
  return `sms:${cleaned}${message ? `?body=${encodeURIComponent(message)}` : ""}`;
}

function getSafeRoomType(value?: string | null): RoomType {
  return String(value ?? "").toLowerCase() === "business" ? "business" : "direct";
}

function normalizeIdentity(value?: string | null) {
  return String(value ?? "").trim();
}

function resolveContactPeerUserId(item: ContactRow) {
  return (
    normalizeIdentity(item.peerUserId) ||
    (item.source === "sabi" && item.roomType === "direct" && !item.official
      ? normalizeIdentity(item.id)
      : "")
  );
}

function getAvatarUriFromUnknownProfile(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  const candidates = [record.avatarUri, record.avatarUrl, record.photoUrl, record.imageUri];

  for (const item of candidates) {
    if (typeof item === "string" && item.trim()) return item.trim();
  }

  return "";
}

function buildStableIdentity(item: Pick<ContactRow, "id" | "chatId" | "phone" | "username" | "name" | "source" | "currentUserId" | "peerUserId" | "roomType">) {
  return buildMessengerCanonicalIdentityKey({
    id: item.id,
    chatId: item.chatId,
    phone: item.phone,
    username: item.username,
    name: item.name,
    source: item.source,
    roomType: item.roomType,
    currentUserId: item.currentUserId,
    peerUserId: item.peerUserId,
  });
}

function mergeContactRows(prev: ContactRow, item: ContactRow): ContactRow {
  const preferredId = prev.peerUserId || item.peerUserId ? prev.id || item.id : prev.id || item.id;

  return {
    ...prev,
    ...item,
    id: preferredId,
    chatId: item.chatId || prev.chatId,
    name: item.name || prev.name,
    phone: item.phone || prev.phone,
    username: item.username || prev.username,
    verified: Boolean(item.verified || prev.verified),
    official: Boolean(item.official || prev.official),
    subtitle: item.subtitle || prev.subtitle,
    avatarLetter: item.avatarLetter || prev.avatarLetter,
    deviceContactId: item.deviceContactId || prev.deviceContactId,
    avatarUrl: item.avatarUrl || prev.avatarUrl,
    currentUserId: item.currentUserId || prev.currentUserId,
    peerUserId: item.peerUserId || prev.peerUserId,
    source: item.source === "sabi" ? item.source : prev.source || item.source,
  };
}

function dedupeContactRows(items: ContactRow[]) {
  return mergeMessengerCanonicalRecords(items, mergeContactRows);
}

function makeRowKey(section: string, item: ContactRow, index: number) {
  return `${section}-${buildStableIdentity(item) || `row-${index}`}`;
}

function mapDeviceContact(contact: Contacts.Contact): ContactRow | null {
  const name = String(contact.name ?? "").trim();
  const phone = normalizePhone(contact.phoneNumbers?.[0]?.number);
  if (!name || !phone) return null;

  const contactId = (contact as { id?: string | number }).id;
  const stableId = String(contactId ?? phone ?? name).trim();
  if (!stableId) return null;

  return {
    id: `phone-${stableId}`,
    chatId: `phone-${stableId}`,
    name,
    phone,
    username: undefined,
    verified: false,
    official: false,
    avatarLetter: getAvatarLetter(name, phone),
    roomType: "direct",
    source: "phone",
    subtitle: "",
    deviceContactId: stableId,
  };
}

function buildChatIdFromContact(item: ContactRow, currentUserId?: string | null) {
  const peerUserId = resolveContactPeerUserId(item);

  if (item.roomType === "direct" && peerUserId && currentUserId) {
    return buildDirectMessengerChatId({
      currentUserId,
      peerUserId,
      fallback: item.chatId || item.id,
    });
  }

  if (
    item.id.startsWith("sabi-") ||
    item.id.startsWith("contact-") ||
    item.id.startsWith("phone-") ||
    item.id.startsWith("custom-")
  ) {
    return item.chatId || item.id;
  }

  return buildChatId({
    id: item.chatId || item.id,
    phone: item.phone,
    username: item.username,
    name: item.name,
  });
}

function mapPersistedRoomToSubscriber(room: any): ContactRow | null {
  const roomType = String(room?.roomType ?? "direct").toLowerCase();
  if (roomType !== "direct" && roomType !== "business") return null;

  const name = String(room?.name ?? "").trim();
  if (!name) return null;

  const subtitle = String(room?.subtitle ?? "").trim();
  const phone = normalizePhone(room?.phone ?? subtitle);
  const username = normalizeHandle(room?.username ?? (subtitle.startsWith("@") ? subtitle : "")) || undefined;
  const chatId = String(room?.chatId ?? name).trim();

  return {
    id: chatId,
    chatId,
    name,
    phone: phone || undefined,
    username,
    verified: Boolean(room?.verified),
    official: roomType === "business",
    avatarLetter: getAvatarLetter(room?.avatarLetter || name, phone),
    avatarUrl:
      getAvatarUriFromUnknownProfile(room) ||
      (typeof room?.avatarUrl === "string" ? room.avatarUrl : undefined),
    roomType: roomType === "business" ? "business" : "direct",
    source: "sabi",
    subtitle: "",
    currentUserId: typeof room?.currentUserId === "string" ? room.currentUserId : undefined,
    peerUserId:
      typeof room?.peerUserId === "string"
        ? room.peerUserId
        : typeof room?.peerId === "string"
          ? room.peerId
          : undefined,
  };
}

function mapCustomContact(item: MessengerCustomContact): ContactRow {
  return {
    id: item.id,
    chatId: item.chatId,
    name: item.name,
    phone: item.phone,
    username: item.username,
    verified: item.verified,
    official: item.official,
    avatarLetter: item.avatarLetter,
    avatarUrl: item.avatarUrl,
    roomType: item.roomType,
    source: "custom",
    subtitle: "",
    currentUserId: item.currentUserId,
    peerUserId: item.peerUserId,
    deviceContactId: item.deviceContactId,
  };
}

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

  const rgbaMatch = value.match(/^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\s*\)$/i);
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${safeAlpha})`;
  }

  return value;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  borderColor,
  backgroundColor,
  textColor,
  labelColor,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad";
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  labelColor: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: labelColor }]}>{label}</Text>
      <View
        style={[
          styles.fieldCard,
          {
            borderColor,
            backgroundColor,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={withAlpha(textColor, 0.4)}
          style={[styles.fieldInput, { color: textColor }]}
          autoCorrect={false}
          autoCapitalize="none"
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );
}

function DecorativeBackground({
  children,
  themeState,
  palette,
}: {
  children: React.ReactNode;
  themeState: MessengerThemeState;
  palette: MessengerThemePalette;
}) {
  if (themeState.wallpaperUri) {
    return (
      <ImageBackground
        source={{ uri: themeState.wallpaperUri }}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            withAlpha(palette.background[0] || "#06080E", 0.18),
            withAlpha(palette.background[1] || "#06080E", 0.24),
            withAlpha(palette.background[0] || "#06080E", 0.3),
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </ImageBackground>
    );
  }

  return (
    <View style={styles.background}>
      <LinearGradient colors={palette.background} style={StyleSheet.absoluteFill} />
      <View style={styles.textureGrid} />
      {children}
    </View>
  );
}

export default function MessengerContactsScreen() {
  const params = useLocalSearchParams<ContactRouteParams>();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [themeState, setThemeState] = useState<MessengerThemeState>(getMessengerThemeState());
  const [sessionUserId, setSessionUserId] = useState<string>("");
  const routeUserId =
    typeof params.userId === "string" && params.userId.trim().length > 0
      ? params.userId.trim()
      : "";
  const effectiveCurrentUserId = routeUserId || sessionUserId;

  const palette = useMemo<MessengerThemePalette>(
    () => getMessengerThemePalette(themeState.themeId),
    [themeState.themeId],
  );

  const hasWallpaper = Boolean(themeState.wallpaperUri);
  const cardColors: [string, string] = hasWallpaper
    ? [withAlpha(palette.background[0] || "#0A0F18", 0.32), withAlpha(palette.background[1] || "#0A0F18", 0.2)]
    : palette.surface;
  const raisedColors: [string, string] = hasWallpaper
    ? [withAlpha(palette.textMain, 0.08), withAlpha(palette.textMain, 0.03)]
    : palette.surfaceRaised;
  const panelColors: [string, string] = hasWallpaper
    ? [withAlpha(palette.background[0] || "#0A0F18", 0.72), withAlpha(palette.background[1] || "#0A0F18", 0.62)]
    : palette.surfaceRaised;
  const flatGlassBorder = hasWallpaper
    ? withAlpha(palette.textMain, 0.1)
    : withAlpha(palette.textMain, 0.12);
  const softGlassColor = hasWallpaper
    ? withAlpha(palette.textMain, 0.04)
    : withAlpha(palette.textMain, 0.05);
  const accentSoftBg = withAlpha(palette.accent, hasWallpaper ? 0.14 : 0.18);
  const accentBorder = withAlpha(palette.accentAlt, hasWallpaper ? 0.18 : 0.26);
  const accentGlow = withAlpha(palette.accent, 0.18);
  const accentSoftGlow = withAlpha(palette.accentSoft, 0.14);

  const txAny = useCallback(
    (keys: string[], fallback = "") => {
      for (const key of keys) {
        const value = t(key);
        if (typeof value === "string" && value.trim() && value !== key) {
          return value;
        }
      }
      return fallback;
    },
    [t],
  );

  const openMode = typeof params.mode === "string" ? params.mode.trim() : "";
  const openSource = typeof params.source === "string" ? params.source.trim() : "";
  const openedFromChatRoom = openMode === "create" && openSource === "chat_room_settings";
  const openedForVideoCallSelect = openMode === "select" && openSource === "video_call";
  const prefillName = typeof params.prefillName === "string" ? params.prefillName.trim() : "";
  const prefillPhone = normalizePhone(
    typeof params.prefillPhone === "string" ? params.prefillPhone : "",
  );
  const prefillHandle = normalizeHandle(
    typeof params.prefillHandle === "string" ? params.prefillHandle : "",
  );
  const prefillAvatarLetter =
    typeof params.avatarLetter === "string" && params.avatarLetter.trim()
      ? params.avatarLetter.trim()
      : getAvatarLetter(prefillName, prefillPhone);
  const prefillVerified = String(params.verified ?? "") === "1";
  const prefillRoomType = getSafeRoomType(params.roomType);

  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearchValue(query);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sabiContacts, setSabiContacts] = useState<ContactRow[]>([]);
  const [phoneContacts, setPhoneContacts] = useState<ContactRow[]>([]);
  const [customContacts, setCustomContacts] = useState<ContactRow[]>([]);
  const [composerMode, setComposerMode] = useState<ComposerMode>(null);
  const [saving, setSaving] = useState(false);
  const [openingChatId, setOpeningChatId] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<ContactRow | null>(null);
  const [actionContact, setActionContact] = useState<ContactRow | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [saveToDevice, setSaveToDevice] = useState(true);
  const [contactComposerKeyboardHeight, setContactComposerKeyboardHeight] = useState(0);

  // CONTACT_COMPOSER_CLEAN_KEYBOARD_FIX
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setContactComposerKeyboardHeight(Math.max(0, Math.floor(event.endCoordinates?.height || 0)));
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setContactComposerKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const contactComposerBackdropLiftStyle = useMemo(
    () => ({
      justifyContent: "flex-end" as const,
      paddingBottom: Math.max(insets.bottom, 12),
    }),
    [insets.bottom],
  );

  const contactComposerScrollPadding = useMemo(
    () => ({
      paddingBottom: Math.max(insets.bottom + 32, 64),
    }),
    [insets.bottom],
  );

  const texts = useMemo(
    () => ({
      eyebrow: "Sabi Messenger",
      title: txAny(["contacts.title", "messenger.contacts.title"], "Contacts"),
      subtitle: txAny(
        ["messenger.contacts.subtitle"],
        "Manage Sabi contacts, device contacts and custom contacts.",
      ),
      topCompactTitle: txAny(
        ["contacts.title", "messenger.contacts.topCompactTitle"],
        "Contacts",
      ),
      useForCall: txAny(["common.select", "common.add"], "Select"),
      searchPlaceholder: txAny(["messenger.contacts.search", "search.placeholder"], "Search"),
      subscribersTitle: txAny(["messenger.contacts.sabiSubscribers"], "Sabi contacts"),
      phoneOnlyTitle: txAny(["messenger.contacts.phoneOnly"], "Phone contacts"),
      phoneOnlySubtitle: txAny(
        ["messenger.contacts.phoneOnlySubtitle"],
        "Contacts from your device who are not yet in Sabi.",
      ),
      customTitle: txAny(["messenger.contacts.customTitle"], "Custom contacts"),
      customSubtitle: txAny(
        ["messenger.contacts.customSubtitle"],
        "Contacts created manually inside Sabi Messenger.",
      ),
      openChat: txAny(["messenger.contacts.openChat", "messenger.chat.messageTitle"], "Open chat"),
      invite: txAny(["messenger.contacts.invite", "common.share"], "Invite"),
      inviteMessage: txAny(["messenger.contacts.inviteMessage"], "Join me on Sabi Messenger."),
      loading: txAny(["messenger.contacts.loading", "common.loading"], "Loading..."),
      loadError: txAny(["messenger.contacts.loadError", "errors.somethingWentWrong"], "Что-то пошло не так."),
      permissionError: txAny([
        "messenger.contacts.permissionError",
        "permissions.contactsSubtitle",
        "errors.permissionRequired",
      ], "Contacts permission is required."),
      emptySubscribers: txAny(["messenger.contacts.emptySubscribers", "common.empty"], "No Sabi contacts."),
      emptyPhone: txAny(["messenger.contacts.emptyPhone", "common.empty"], "No phone contacts."),
      emptyCustom: txAny(["messenger.contacts.emptyCustom", "common.empty"], "No custom contacts."),
      knownInSabi: txAny(["messenger.contacts.knownInSabi"], "Available in Sabi"),
      notRegistered: txAny(["messenger.contacts.notRegistered"], "Не зарегистрирован"),
      serviceBadge: txAny(["messenger.contacts.serviceBadge"], "Официальный"),
      totalSubscribers: txAny(["messenger.contacts.totalSubscribers"], "Sabi"),
      totalPhone: txAny(["messenger.contacts.totalPhone"], "Телефон"),
      totalCustom: txAny(["messenger.contacts.totalCustom"], "Личный"),
      newContact: txAny(["messenger.contacts.newContact", "messenger.createContact.title"], "Новый контакт"),
      newChat: txAny(["messenger.contacts.newChat", "messenger.newChat"], "Новый чат"),
      editContact: txAny(["messenger.contacts.editContact"], "Изменить контакт"),
      deleteContact: txAny(["messenger.contacts.deleteContact"], "Удалить контакт"),
      deleteContactTitle: txAny(["messenger.contacts.deleteContactTitle"], "Удалить контакт"),
      deleteContactDescription: txAny(
        ["messenger.contacts.deleteContactDescription"],
        "Контакт будет удалён из контактов Sabi Messenger на этом устройстве.",
      ),
      contactDeleted: txAny(["messenger.contacts.contactDeleted"], "Contact deleted."),
      actionsTitle: txAny(["messenger.contacts.actionsTitle"], "Contact actions"),
      modalNewContactTitle: txAny(["messenger.contacts.modalNewContactTitle", "messenger.createContact.title"], "Новый контакт"),
      modalEditContactTitle: txAny(["messenger.contacts.modalEditContactTitle"], "Изменить контакт"),
      modalNewChatTitle: txAny(["messenger.contacts.modalNewChatTitle", "messenger.newChat"], "Новый чат"),
      modalSubtitle: txAny(["messenger.contacts.modalSubtitle"], "Создайте контакт или начните новый чат."),
      modalEditSubtitle: txAny(["messenger.contacts.modalEditSubtitle"], "Обновите имя, телефон или имя пользователя."),
      formName: txAny(["messenger.contacts.formName", "messenger.createContact.firstName", "common.name"], "Имя"),
      formPhone: txAny(["messenger.contacts.formPhone", "messenger.createContact.phone", "common.phone"], "Телефон"),
      formUsername: txAny(["messenger.contacts.formUsername", "messenger.createContact.username", "profile.username"], "Имя пользователя"),
      formNamePlaceholder: txAny(["messenger.contacts.formNamePlaceholder"], "Введите имя"),
      formPhonePlaceholder: txAny(["messenger.contacts.formPhonePlaceholder"], "Введите телефон"),
      formUsernamePlaceholder: txAny(["messenger.contacts.formUsernamePlaceholder"], "Введите имя пользователя"),
      saveToDevice: txAny(["messenger.contacts.saveToDevice"], "Сохранить в контакты телефона"),
      cancel: txAny(["common.cancel"], "Отмена"),
      create: txAny(["common.create"], "Создать"),
      save: txAny(["common.save"], "Сохранить"),
      nameRequired: txAny(["messenger.contacts.nameRequired", "errors.requiredField"], "Имя обязательно."),
      phoneRequired: txAny(["messenger.contacts.phoneRequired"], "Номер телефона обязателен."),
      contactSaved: txAny(["messenger.contacts.contactSaved", "messenger.createContact.contactCreated"], "Контакт сохранён."),
      chatCreated: txAny(["messenger.contacts.chatCreated"], "Чат создан."),
      createError: txAny(["messenger.contacts.createError", "errors.somethingWentWrong"], "Что-то пошло не так."),
      deviceSaveWarningFallback: txAny(["messenger.contacts.deviceSaveWarningFallback"], "Контакт телефона не сохранён, но контакт Sabi будет создан."),
      customBadge: txAny(["messenger.contacts.customBadge"], "Личный"),
      phoneBadge: txAny(["messenger.contacts.phoneBadge"], "Телефон"),
      phoneContactSubtitle: txAny(["messenger.contacts.phoneContactSubtitle"], "Phone contact"),
      customContactSubtitle: txAny(["messenger.contacts.customContactSubtitle"], "Custom contact"),
    }),
    [txAny],
  );

  const topInset = Math.max(insets.top, 8);
  const floatingTopBarHeight = topInset + TOP_BAR_BODY_HEIGHT;

  const resetComposer = useCallback(() => {
    setComposerMode(null);
    setEditingContact(null);
    setFormName("");
    setFormPhone("");
    setFormUsername("");
    setSaveToDevice(true);
    setSaving(false);
  }, []);

  const openCreateComposerFromRoute = useCallback(() => {
    setEditingContact(null);
    setComposerMode("new_contact");
    setFormName(prefillName);
    setFormPhone(prefillPhone);
    setFormUsername(prefillHandle);
    setSaveToDevice(Boolean(prefillPhone));
  }, [prefillHandle, prefillName, prefillPhone]);

  const openEditComposer = useCallback((item: ContactRow) => {
    setActionContact(null);
    setEditingContact(item);
    setComposerMode("new_contact");
    setFormName(item.name);
    setFormPhone(normalizePhone(item.phone));
    setFormUsername(normalizeHandle(item.username));
    setSaveToDevice(false);
  }, []);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await hydratePublicProfileStorage();

      const [permission, persistedRooms, savedCustomContacts, deletedKeys, serverUsers] = await Promise.all([
        Contacts.requestPermissionsAsync(),
        listPersistedChatRooms(effectiveCurrentUserId),
        listCustomMessengerContacts(effectiveCurrentUserId),
        listDeletedCustomMessengerContactKeys(),
        effectiveCurrentUserId
          ? fetchMessengerUsers({
              query: normalizedQuery,
              currentUserId: effectiveCurrentUserId,
              limit: normalizedQuery ? 40 : 20,
            })
          : Promise.resolve([]),
      ]);

      const deletedChatIds = new Set(
        (deletedKeys.chatIds || []).map((item) => String(item || "").trim()).filter(Boolean),
      );
      const deletedIds = new Set(
        (deletedKeys.ids || []).map((item) => String(item || "").trim()).filter(Boolean),
      );
      const isDeletedSystemContact = (item: ContactRow) => {
        const id = String(item.id || "").trim();
        const chatId = String(item.chatId || "").trim();
        const phone = normalizePhone(item.phone);
        const username = normalizeHandle(item.username).toLowerCase();

        return Boolean(
          (id && deletedIds.has(id)) ||
            (chatId && deletedChatIds.has(chatId)) ||
            (item.source === "phone" && phone && deletedIds.has(phone)) ||
            (item.source === "sabi" && username && deletedIds.has(username))
        );
      };

      const customRows = dedupeContactRows(
        savedCustomContacts
          .map(mapCustomContact)
          .filter((item) => !deletedIds.has(item.id))
          .map((item) => ({
            ...item,
            subtitle: item.phone || item.username || texts.customContactSubtitle,
          })),
      );

      const hydratedCustomRows = await Promise.all(
        customRows.map(async (item) => {
          const groupProfile = hydrateGroupPublicProfile(String(item.id || "").trim());
          const publicAvatarUrl = resolvePublicProfileAvatarUri([
            item.peerUserId,
            item.id,
            item.chatId,
            item.phone,
            item.username,
            item.name,
          ]);
          const avatarUrl = item.avatarUrl || publicAvatarUrl || getAvatarUriFromUnknownProfile(groupProfile);

          return {
            ...item,
            avatarUrl: avatarUrl || item.avatarUrl,
          };
        }),
      );
      setCustomContacts(hydratedCustomRows);

      const serverRows = dedupeContactRows(
        serverUsers.map((item) => {
          const peerUserId = item.userId;
          return {
            id: peerUserId,
            chatId: buildDirectMessengerChatId({
              currentUserId: effectiveCurrentUserId,
              peerUserId,
              fallback: peerUserId,
            }),
            name: item.displayName,
            phone: item.phone || undefined,
            username: item.username || undefined,
            verified: item.verified,
            official: false,
            avatarLetter: getAvatarLetter(item.displayName, item.phone),
            avatarUrl: item.avatarUrl || undefined,
            roomType: "direct" as RoomType,
            source: "sabi" as const,
            subtitle: texts.knownInSabi,
            currentUserId: effectiveCurrentUserId || undefined,
            peerUserId,
          };
        }).filter((item) => !isDeletedSystemContact(item)),
      );

      if (permission.status !== "granted") {
        setSabiContacts(
          dedupeContactRows([
            ...SERVICE_CONTACTS.filter((item) => !isDeletedSystemContact(item)).map((item) => ({
              ...item,
              subtitle: texts.knownInSabi,
            })),
            ...serverRows,
          ]),
        );
        setPhoneContacts([]);
        setError(texts.permissionError || texts.loadError);
        setLoading(false);
        return;
      }

      const deviceResponse = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
        pageSize: 500,
      });

      const deviceContacts = dedupeContactRows(
        deviceResponse.data
          .map(mapDeviceContact)
          .filter((item): item is ContactRow => Boolean(item))
          .filter((item) => !isDeletedSystemContact(item))
          .map((item) => ({
            ...item,
            subtitle: texts.phoneContactSubtitle || texts.notRegistered,
          }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );

      const persistedRoomMap = new Map(
        (persistedRooms || []).map((room) => [String(room?.chatId ?? "").trim(), room]),
      );

      const persistedSubscribers = dedupeContactRows(
        (persistedRooms || [])
          .map(mapPersistedRoomToSubscriber)
          .filter((item): item is ContactRow => Boolean(item))
          .filter((item) => !isDeletedSystemContact(item))
          .map((item) => ({
            ...item,
            subtitle: texts.knownInSabi,
          })),
      );

      const subscriberMap = new Map<string, ContactRow>();

      SERVICE_CONTACTS.filter((item) => !isDeletedSystemContact(item)).forEach((item) => {
        subscriberMap.set(buildStableIdentity(item), {
          ...item,
          subtitle: texts.knownInSabi,
        });
      });

      serverRows.forEach((item) => {
        subscriberMap.set(buildStableIdentity(item), item);
      });

      hydratedCustomRows.forEach((item) => {
        subscriberMap.set(buildStableIdentity(item), {
          ...item,
          source: "sabi",
          subtitle: item.phone || item.username || texts.knownInSabi,
        });
      });

      persistedSubscribers.forEach((item) => {
        const phoneKey = normalizePhone(item.phone);
        const matchingDevice = phoneKey
          ? deviceContacts.find((contact) => normalizePhone(contact.phone) === phoneKey)
          : undefined;

        const merged: ContactRow = {
          ...item,
          name: matchingDevice?.name || item.name,
          avatarLetter: matchingDevice?.avatarLetter || item.avatarLetter,
          phone: matchingDevice?.phone || item.phone,
          subtitle: item.subtitle || texts.knownInSabi,
        };

        subscriberMap.set(buildStableIdentity(merged), merged);
      });

      const nextSubscribers = (
        await Promise.all(
          dedupeContactRows(Array.from(subscriberMap.values())).map(async (item) => {
            const room = persistedRoomMap.get(String(item.chatId || item.id || "").trim()) as
              | { roomType?: string | null }
              | undefined;
            const roomType = String(room?.roomType ?? item.roomType ?? "").toLowerCase();
            const groupProfile = roomType === "group" ? hydrateGroupPublicProfile(String(item.id || "").trim()) : undefined;
            const publicAvatarUrl = resolvePublicProfileAvatarUri([
              item.peerUserId,
              item.id,
              item.chatId,
              item.phone,
              item.username,
              item.name,
            ]);

            const avatarUrl =
              item.avatarUrl ||
              getAvatarUriFromUnknownProfile(groupProfile) ||
              publicAvatarUrl;

            return {
              ...item,
              avatarUrl: avatarUrl || item.avatarUrl,
            };
          }),
        )
      ).sort((a, b) => {
        if (a.official && !b.official) return -1;
        if (!a.official && b.official) return 1;
        return a.name.localeCompare(b.name);
      });

      const knownPhones = new Set(
        [...nextSubscribers, ...hydratedCustomRows].map((item) => normalizePhone(item.phone)).filter(Boolean),
      );

      const nextPhoneOnly = dedupeContactRows(
        deviceContacts
          .filter((item) => !knownPhones.has(normalizePhone(item.phone)))
          .map((item) => ({
            ...item,
            subtitle: texts.notRegistered || item.subtitle,
          }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );

      setSabiContacts(nextSubscribers);
      setPhoneContacts(nextPhoneOnly);
    } catch (loadError) {
      setError(
        loadError instanceof Error && loadError.message
          ? loadError.message
          : texts.loadError,
      );
      setSabiContacts(
        dedupeContactRows(
          SERVICE_CONTACTS.map((item) => ({
            ...item,
            subtitle: texts.knownInSabi,
          })),
        ),
      );
      setPhoneContacts([]);
    } finally {
      setLoading(false);
    }
  }, [effectiveCurrentUserId, normalizedQuery, texts.customContactSubtitle, texts.knownInSabi, texts.loadError, texts.notRegistered, texts.permissionError, texts.phoneContactSubtitle]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void hydrateMessengerThemeState().then((next) => {
        if (active) setThemeState(next);
      });
      void resolveMessengerKernelSession()
        .then((session) => {
          if (active) {
            setSessionUserId(session.currentUserId || "");
          }
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (!openedFromChatRoom) return;
      openCreateComposerFromRoute();
    }, [openedFromChatRoom, openCreateComposerFromRoute]),
  );

  useEffect(() => {
    const unsubscribe = subscribePublicProfiles(() => {
      void loadContacts();
    });

    return unsubscribe;
  }, [loadContacts]);

  useFocusEffect(
    useCallback(() => {
      const timeout = setTimeout(() => {
        void loadContacts();
      }, normalizedQuery ? 240 : 0);

      return () => clearTimeout(timeout);
    }, [loadContacts, normalizedQuery]),
  );

  const filteredSabiContacts = useMemo(() => dedupeContactRows(sabiContacts), [sabiContacts]);
  const filteredPhoneContacts = useMemo(() => {
    const source = dedupeContactRows(phoneContacts);
    if (!normalizedQuery) return source;
    return source.filter((item) => {
      return (
        normalizeSearchValue(item.name).includes(normalizedQuery) ||
        normalizeSearchValue(item.phone).includes(normalizedQuery)
      );
    });
  }, [normalizedQuery, phoneContacts]);
  const filteredCustomContacts = useMemo(() => {
    const source = dedupeContactRows(customContacts);
    if (!normalizedQuery) return source;
    return source.filter((item) => {
      return (
        normalizeSearchValue(item.name).includes(normalizedQuery) ||
        normalizeSearchValue(item.phone).includes(normalizedQuery) ||
        normalizeSearchValue(item.username).includes(normalizedQuery)
      );
    });
  }, [customContacts, normalizedQuery]);

  const returnSelectedToVideoCall = useCallback(
    async (item: ContactRow) => {
      const nextParams: Record<string, string> = {
        chatId:
          typeof params.returnChatId === "string" && params.returnChatId.trim()
            ? params.returnChatId.trim()
            : typeof params.chatId === "string" && params.chatId.trim()
              ? params.chatId.trim()
              : String(item.chatId || item.id || "").trim(),
        id:
          typeof params.returnChatId === "string" && params.returnChatId.trim()
            ? params.returnChatId.trim()
            : typeof params.chatId === "string" && params.chatId.trim()
              ? params.chatId.trim()
              : String(item.chatId || item.id || "").trim(),
        userId:
          typeof params.returnUserId === "string"
            ? params.returnUserId.trim()
            : effectiveCurrentUserId || "",
        selfId:
          typeof params.returnUserId === "string"
            ? params.returnUserId.trim()
            : effectiveCurrentUserId || "",
        peerId:
          typeof params.returnPeerId === "string" && params.returnPeerId.trim()
            ? params.returnPeerId.trim()
            : String(item.id || item.chatId || "").trim(),
        peerUserId:
          typeof params.returnPeerId === "string" && params.returnPeerId.trim()
            ? params.returnPeerId.trim()
            : String(item.id || item.chatId || "").trim(),
        roomType:
          typeof params.returnRoomType === "string" && params.returnRoomType.trim()
            ? params.returnRoomType.trim()
            : "direct",
        name:
          typeof params.returnName === "string" && params.returnName.trim()
            ? params.returnName.trim()
            : item.name,
        avatarLetter:
          typeof params.returnAvatarLetter === "string" && params.returnAvatarLetter.trim()
            ? params.returnAvatarLetter.trim()
            : item.avatarLetter,
        verified: typeof params.returnVerified === "string" ? params.returnVerified : "0",
        selectedContactId: String(item.id || "").trim() || normalizePhone(item.phone) || item.name,
        selectedContactName: item.name,
        selectedContactPhone: normalizePhone(item.phone),
        selectedContactAvatarLetter: item.avatarLetter,
      };

      if (typeof params.returnAvatarUrl === "string" && params.returnAvatarUrl.trim()) {
        nextParams.avatarUrl = params.returnAvatarUrl.trim();
      }
      if (typeof params.returnPhotoUrl === "string" && params.returnPhotoUrl.trim()) {
        nextParams.photoUrl = params.returnPhotoUrl.trim();
      }
      if (typeof params.returnStatus === "string" && params.returnStatus.trim()) {
        nextParams.status = params.returnStatus.trim();
      }
      if (typeof params.returnRoomTitle === "string" && params.returnRoomTitle.trim()) {
        nextParams.roomTitle = params.returnRoomTitle.trim();
      }
      if (typeof params.returnParticipants === "string" && params.returnParticipants.trim()) {
        nextParams.participants = params.returnParticipants.trim();
      }
      if (item.avatarUrl) {
        nextParams.selectedContactAvatarUrl = item.avatarUrl;
      }

      router.replace({
        pathname:
          typeof params.returnTo === "string" && params.returnTo.trim()
            ? (params.returnTo.trim() as any)
            : "/calls/video",
        params: nextParams,
      } as never);
    },
    [effectiveCurrentUserId, params],
  );

  const openChat = useCallback(
    async (item: ContactRow) => {
      const openingKey = buildStableIdentity(item) || item.chatId || item.id;
      if (openingChatId) return;

      setOpeningChatId(openingKey);

      try {
        const peerUserId = resolveContactPeerUserId(item);
        const remoteRoom =
          item.roomType === "direct" && peerUserId && effectiveCurrentUserId
            ? await ensureMessengerDirectRoom({
                currentUserId: effectiveCurrentUserId,
                peerUserId,
                displayName: item.name,
                username: item.username,
                phone: item.phone,
                avatarUrl: item.avatarUrl,
              }).catch(() => null)
            : null;

        const chatId =
          remoteRoom?.chatId ||
          buildChatIdFromContact(
            {
              ...item,
              chatId: item.chatId || remoteRoom?.chatId,
              peerUserId: peerUserId || item.peerUserId,
              currentUserId: effectiveCurrentUserId || item.currentUserId,
            },
            effectiveCurrentUserId,
          );
        const subtitle = item.phone || item.username || remoteRoom?.subtitle || texts.knownInSabi;
        const roomType = remoteRoom?.roomType || item.roomType;
        const avatarUrl = remoteRoom?.avatarUrl || remoteRoom?.photoUrl || item.avatarUrl || undefined;
        const displayName = remoteRoom?.name || item.name;
        const verified = Boolean(item.verified || remoteRoom?.verified);

        await openMessengerRoom({
          chatId,
          name: displayName,
          subtitle,
          roomType,
          verified,
          avatarLetter: item.avatarLetter,
          phone: item.phone || undefined,
          username: item.username || undefined,
          handle: item.username || undefined,
          currentUserId: effectiveCurrentUserId || item.currentUserId || undefined,
          peerUserId: peerUserId || item.peerUserId || undefined,
          avatarUrl,
          photoUrl: avatarUrl,
          markRead: false,
        });
      } catch (openError) {
        Alert.alert(
          texts.openChat,
          openError instanceof Error && openError.message ? openError.message : texts.createError,
        );
      } finally {
        setOpeningChatId((current) => (current === openingKey ? null : current));
      }
    },
    [effectiveCurrentUserId, openingChatId, texts.createError, texts.knownInSabi, texts.openChat],
  );

  const inviteContact = useCallback(
    async (item: ContactRow) => {
      const url = toInviteSmsUrl(item.phone || "", texts.inviteMessage);
      if (!url) {
        Alert.alert(texts.invite, texts.loadError);
        return;
      }

      try {
        await Linking.openURL(url);
      } catch {
        Alert.alert(texts.invite, texts.loadError);
      }
    },
    [texts.invite, texts.inviteMessage, texts.loadError],
  );

  const saveNewEntity = useCallback(async () => {
    const name = (formName.trim() || prefillName).trim();
    const phone = normalizePhone(formPhone || prefillPhone);
    const username = normalizeHandle(formUsername || prefillHandle);
    const targetRoomType =
      editingContact?.roomType || (openedFromChatRoom ? prefillRoomType : "direct");

    if (!name) {
      Alert.alert(texts.title, texts.nameRequired);
      return;
    }

    const hasEditableIdentity = Boolean(phone || username || editingContact?.chatId || editingContact?.id);

    if (!hasEditableIdentity) {
      Alert.alert(texts.title, texts.phoneRequired);
      return;
    }

    setSaving(true);

    try {
      let deviceContactId: string | undefined = editingContact?.deviceContactId;
      let deviceSaveWarning = "";

      if (!editingContact && composerMode === "new_contact" && saveToDevice && phone) {
        try {
          const savedToDevice = await saveChatPartnerToSystemContacts({
            name,
            phone,
            username,
            company: "Sabi Messenger",
          });

          deviceContactId = String(savedToDevice?.contactId ?? "").trim() || undefined;
        } catch (deviceError) {
          deviceSaveWarning =
            deviceError instanceof Error && deviceError.message
              ? deviceError.message
              : texts.deviceSaveWarningFallback;
        }
      }

      const originalPeerUserId = editingContact ? resolveContactPeerUserId(editingContact) : "";
      const saved = await upsertCustomMessengerContact({
        id: editingContact?.source === "custom" ? editingContact.id : undefined,
        chatId: editingContact?.chatId,
        name,
        phone,
        username,
        roomType: targetRoomType,
        verified: editingContact?.verified ?? prefillVerified,
        official: editingContact?.official,
        avatarLetter:
          editingContact?.avatarLetter || prefillAvatarLetter || getAvatarLetter(name, phone),
        avatarUrl: editingContact?.avatarUrl,
        currentUserId: editingContact?.currentUserId || effectiveCurrentUserId || undefined,
        peerUserId: originalPeerUserId || editingContact?.peerUserId || undefined,
        source: editingContact?.source || "custom",
        deviceContactId,
      });

      if (editingContact && editingContact.source !== "custom") {
        await removeCustomMessengerContact({
          id: editingContact.id,
          chatId: editingContact.chatId,
          phone: editingContact.phone,
          username: editingContact.username,
          source: editingContact.source,
        });
      }

      await registerPersistedChatRoom({
        chatId: saved.chatId,
        name: saved.name,
        subtitle: saved.phone || saved.username || texts.knownInSabi,
        roomType: saved.roomType,
        verified: Boolean(saved.verified),
        avatarLetter: saved.avatarLetter,
        phone: saved.phone || undefined,
        username: saved.username || undefined,
        currentUserId: effectiveCurrentUserId || undefined,
        peerUserId: saved.peerUserId || undefined,
        avatarUrl: saved.avatarUrl || undefined,
        photoUrl: saved.avatarUrl || undefined,
        hiddenFromMain: false,
        deleted: false,
        forceVisibleInMain: true,
      });

      const savedRow: ContactRow = {
        ...mapCustomContact(saved),
        subtitle:
          saved.phone || saved.username || texts.customContactSubtitle || texts.knownInSabi,
        currentUserId: saved.currentUserId || effectiveCurrentUserId || undefined,
        peerUserId: saved.peerUserId,
        avatarUrl: saved.avatarUrl,
      };

      const currentMode = composerMode;
      const wasEditing = Boolean(editingContact);

      resetComposer();
      await loadContacts();

      if (currentMode === "new_chat") {
        await openChat(savedRow);
        return;
      }

      if (openedFromChatRoom && !wasEditing) {
        if (deviceSaveWarning) {
          Alert.alert(texts.newContact, deviceSaveWarning);
        }
        router.back();
        return;
      }

      Alert.alert(
        wasEditing ? texts.editContact : texts.newContact,
        deviceSaveWarning
          ? `${texts.contactSaved}\n\n${deviceSaveWarning}`
          : texts.contactSaved,
      );
    } catch (saveError) {
      Alert.alert(
        texts.title,
        saveError instanceof Error && saveError.message
          ? saveError.message
          : texts.createError,
      );
    } finally {
      setSaving(false);
    }
  }, [
    composerMode,
    editingContact,
    effectiveCurrentUserId,
    formName,
    formPhone,
    formUsername,
    loadContacts,
    openChat,
    openedFromChatRoom,
    prefillAvatarLetter,
    prefillHandle,
    prefillName,
    prefillPhone,
    prefillRoomType,
    prefillVerified,
    resetComposer,
    saveToDevice,
    texts.chatCreated,
    texts.contactSaved,
    texts.createError,
    texts.customContactSubtitle,
    texts.deviceSaveWarningFallback,
    texts.editContact,
    texts.knownInSabi,
    texts.nameRequired,
    texts.newChat,
    texts.newContact,
    texts.openChat,
    texts.phoneRequired,
    texts.title,
  ]);

  const confirmDeleteContact = useCallback(async () => {
    if (!actionContact || actionBusy) return;

    const target = actionContact;
    Alert.alert(
      texts.deleteContactTitle,
      `${target.name}\n\n${texts.deleteContactDescription}`,
      [
        { text: texts.cancel, style: "cancel" },
        {
          text: texts.deleteContact,
          style: "destructive",
          onPress: async () => {
            try {
              setActionBusy(true);
              await removeCustomMessengerContact({
                id: target.id,
                chatId: target.chatId,
                phone: target.phone,
                username: target.username,
                source: target.source,
              });
              setActionContact(null);
              await loadContacts();
              Alert.alert(texts.deleteContactTitle, texts.contactDeleted);
            } catch (deleteError) {
              Alert.alert(
                texts.deleteContactTitle,
                deleteError instanceof Error && deleteError.message ? deleteError.message : texts.createError,
              );
            } finally {
              setActionBusy(false);
            }
          },
        },
      ],
    );
  }, [actionBusy, actionContact, loadContacts, texts.cancel, texts.contactDeleted, texts.createError, texts.deleteContact, texts.deleteContactDescription, texts.deleteContactTitle]);

  const renderStatCard = (label: string, value: number, icon: "users" | "phone" | "custom") => (
    <View style={styles.statCardWrap}>
      <View style={[styles.statShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) }]} />
      <LinearGradient colors={cardColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.statCard, { borderColor: flatGlassBorder }]}> 
        <View style={[styles.statGlassLayer, { backgroundColor: softGlassColor }]} />
        {!hasWallpaper ? <View style={[styles.statGlow, { backgroundColor: accentSoftGlow }]} /> : null}
        <View style={[styles.statIconWrap, { backgroundColor: softGlassColor, borderColor: flatGlassBorder }]}> 
          {icon === "users" ? <Users size={18} color={palette.accentSoft} strokeWidth={2.3} /> : icon === "phone" ? <Smartphone size={18} color={palette.accentSoft} strokeWidth={2.3} /> : <PencilLine size={18} color={palette.accentSoft} strokeWidth={2.3} />}
        </View>
        <Text style={[styles.statValue, { color: palette.textMain }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: palette.textSecondary }]}>{label}</Text>
      </LinearGradient>
    </View>
  );

  const renderContactRow = (item: ContactRow, mode: "chat" | "invite") => {
    const rowOpeningKey = buildStableIdentity(item) || item.chatId || item.id;
    const isOpening = mode === "chat" && openingChatId === rowOpeningKey;
    const isDisabled = mode === "chat" && Boolean(openingChatId);

    return (
    <Pressable
      disabled={isDisabled}
      onPress={() => (openedForVideoCallSelect ? void returnSelectedToVideoCall(item) : mode === "chat" ? void openChat(item) : void inviteContact(item))}
      onLongPress={() => setActionContact(item)}
      style={({ pressed }) => [styles.rowWrap, pressed || isOpening ? styles.rowPressed : undefined]}
    >
      <View style={[styles.rowShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.24) }]} />
      {!hasWallpaper ? <View style={[styles.rowGlow, { backgroundColor: accentGlow }]} /> : null}
      <LinearGradient colors={cardColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.rowCard, { borderColor: flatGlassBorder }]}> 
        <View style={[styles.rowGlassLayer, { backgroundColor: softGlassColor }]} />
        <View style={styles.rowAccentRailWrap}>
          <LinearGradient colors={[palette.accent, palette.accentSoft]} style={styles.rowAccentRail} />
        </View>

        <View style={styles.avatarOuter}>
          <View style={[styles.avatarGlow, { backgroundColor: accentGlow }]} />
          <View style={styles.avatar}>
            {item.avatarUrl ? (
              <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <LinearGradient colors={[palette.accent, palette.accentAlt, palette.accentSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{item.avatarLetter}</Text>
              </LinearGradient>
            )}
          </View>
        </View>

        <View style={styles.rowTextWrap}>
          <View style={styles.nameRow}>
            <Text style={[styles.rowName, { color: palette.textMain }]} numberOfLines={1}>{item.name}</Text>
            {item.verified ? <BadgeCheck size={15} color={palette.accentSoft} strokeWidth={2.3} style={styles.verifiedIcon} /> : null}
            {item.official ? <View style={[styles.badgePill, { backgroundColor: accentSoftBg, borderColor: accentBorder }]}><Text style={[styles.badgePillText, { color: palette.accentSoft }]}>{texts.serviceBadge}</Text></View> : null}
            {item.source === "custom" && texts.customBadge ? <View style={[styles.badgePill, { backgroundColor: softGlassColor, borderColor: flatGlassBorder }]}><Text style={[styles.badgePillText, { color: palette.textMain }]}>{texts.customBadge}</Text></View> : null}
            {item.source === "phone" && texts.phoneBadge ? <View style={[styles.badgePill, { backgroundColor: withAlpha(palette.accentAlt, 0.12), borderColor: withAlpha(palette.accentAlt, 0.22) }]}><Text style={[styles.badgePillText, { color: palette.accentSoft }]}>{texts.phoneBadge}</Text></View> : null}
          </View>
          <Text style={[styles.rowSubtitle, { color: palette.textSecondary }]} numberOfLines={1}>{item.phone || item.username || item.subtitle}</Text>
          <Text style={[styles.rowMeta, { color: withAlpha(palette.textSecondary, 0.78) }]} numberOfLines={1}>{item.subtitle}</Text>
        </View>

        <Pressable onPress={() => setActionContact(item)} hitSlop={10} style={styles.contextWrap}>
          <View style={[styles.contextShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.2) }]} />
          <LinearGradient colors={raisedColors} style={[styles.contextButton, { borderColor: flatGlassBorder }]}> 
            <View style={[styles.contextGlass, { backgroundColor: softGlassColor }]} />
            <MoreHorizontal size={16} color={palette.textMain} strokeWidth={2.2} />
          </LinearGradient>
        </Pressable>

        <View style={styles.trailingWrap}>
          <View style={[styles.trailingShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.2) }]} />
          <LinearGradient colors={mode === "chat" ? raisedColors : panelColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.trailingButton, { borderColor: mode === "chat" ? accentBorder : flatGlassBorder }]}> 
            <View style={[styles.trailingButtonGlass, { backgroundColor: mode === "chat" ? withAlpha(palette.accent, 0.08) : softGlassColor }]} />
            {isOpening ? <ActivityIndicator size="small" color={palette.accentSoft} /> : openedForVideoCallSelect ? <Users size={16} color={palette.accentSoft} strokeWidth={2.3} /> : mode === "chat" ? <MessageCircleMore size={16} color={palette.accentSoft} strokeWidth={2.3} /> : <Send size={16} color={palette.textMain} strokeWidth={2.3} />}
            <Text style={[styles.trailingText, { color: mode === "chat" ? palette.accentSoft : palette.textMain }]}>{openedForVideoCallSelect ? texts.useForCall : mode === "chat" ? texts.openChat : texts.invite}</Text>
          </LinearGradient>
        </View>
      </LinearGradient>
    </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background[0] || "#03110E" }]} edges={["left", "right", "bottom"]}>
      <DecorativeBackground themeState={themeState} palette={palette}>
        {!hasWallpaper ? (
          <>
            <View style={[styles.topGlow, { backgroundColor: withAlpha(palette.accent, 0.18) }]} />
            <View style={[styles.sideGlow, { backgroundColor: withAlpha(palette.accentAlt, 0.14) }]} />
            <View style={[styles.bottomGlow, { backgroundColor: withAlpha(palette.accentSoft, 0.12) }]} />
          </>
        ) : null}

        <View style={[styles.floatingTopBar, { paddingTop: topInset, height: floatingTopBarHeight }]}>
          <Pressable style={styles.headerButtonWrap} onPress={() => router.back()} hitSlop={12}>
            <View style={[styles.headerButtonShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.24) }]} />
            <LinearGradient colors={raisedColors} style={[styles.headerButton, { borderColor: flatGlassBorder }]}> 
              <View style={[styles.headerButtonGlass, { backgroundColor: softGlassColor }]} />
              <ArrowLeft size={20} color={palette.textMain} strokeWidth={2.3} />
            </LinearGradient>
          </Pressable>
          <View style={styles.floatingTitleWrap}><Text style={[styles.floatingTitle, { color: palette.textMain }]}>{texts.topCompactTitle}</Text></View>
          <View style={styles.headerButtonSpacer} />
        </View>

        <ScrollView keyboardDismissMode="on-drag" style={styles.scroll} contentContainerStyle={{ paddingTop: floatingTopBarHeight + 12, paddingBottom: Math.max(insets.bottom, 16) + 24, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.heroStack}>
            <View style={styles.heroHeaderWrap}>
              <View style={[styles.heroHeaderShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.24) }]} />
              <LinearGradient colors={panelColors} style={[styles.heroHeaderCard, { borderColor: flatGlassBorder }]}> 
                <View style={[styles.heroGlassLayer, { backgroundColor: softGlassColor }]} />
                {!hasWallpaper ? <View style={[styles.heroGlow, { backgroundColor: accentGlow }]} /> : null}
                <Text style={[styles.headerEyebrow, { color: palette.accentSoft }]}>{texts.eyebrow}</Text>
                <Text style={[styles.headerTitle, { color: palette.textMain }]}>{texts.title}</Text>
                <Text style={[styles.headerSubtitle, { color: palette.textSecondary }]}>{texts.subtitle}</Text>
              </LinearGradient>
            </View>

            <View style={styles.quickActionsRow}>
              <Pressable onPress={() => { setEditingContact(null); setComposerMode("new_contact"); if (openedFromChatRoom) openCreateComposerFromRoute(); }} style={styles.quickActionWrap}>
                {({ pressed }) => (
                  <View style={[styles.quickActionOuter, pressed ? styles.rowPressed : undefined]}>
                    <View style={[styles.quickActionShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) }]} />
                    <LinearGradient colors={raisedColors} style={[styles.quickActionCard, { borderColor: flatGlassBorder }]}> 
                      <View style={[styles.quickActionGlass, { backgroundColor: softGlassColor }]} />
                      <View style={[styles.quickActionIconWrap, { backgroundColor: accentSoftBg, borderColor: accentBorder }]}><CirclePlus size={18} color={palette.accentSoft} strokeWidth={2.3} /></View>
                      <Text style={[styles.quickActionText, { color: palette.textMain }]}>{texts.newContact}</Text>
                    </LinearGradient>
                  </View>
                )}
              </Pressable>

              <Pressable onPress={() => { setEditingContact(null); setComposerMode("new_chat"); }} style={styles.quickActionWrap}>
                {({ pressed }) => (
                  <View style={[styles.quickActionOuter, pressed ? styles.rowPressed : undefined]}>
                    <View style={[styles.quickActionShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) }]} />
                    <LinearGradient colors={raisedColors} style={[styles.quickActionCard, { borderColor: flatGlassBorder }]}> 
                      <View style={[styles.quickActionGlass, { backgroundColor: softGlassColor }]} />
                      <View style={[styles.quickActionIconWrap, { backgroundColor: accentSoftBg, borderColor: accentBorder }]}><MessageCircleMore size={18} color={palette.accentSoft} strokeWidth={2.3} /></View>
                      <Text style={[styles.quickActionText, { color: palette.textMain }]}>{texts.newChat}</Text>
                    </LinearGradient>
                  </View>
                )}
              </Pressable>
            </View>

            <View style={styles.searchCardWrap}>
              <View style={[styles.searchShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) }]} />
              <LinearGradient colors={cardColors} style={[styles.searchCard, { borderColor: flatGlassBorder }]}> 
                <View style={[styles.searchGlassLayer, { backgroundColor: softGlassColor }]} />
                {!hasWallpaper ? <View style={[styles.searchInnerGlow, { backgroundColor: accentSoftGlow }]} /> : null}
                <View style={styles.searchWrap}>
                  <View style={styles.searchIconWrap}><Search size={18} color={palette.textSecondary} strokeWidth={2.3} /></View>
                  <TextInput value={query} onChangeText={setQuery} placeholder={texts.searchPlaceholder} placeholderTextColor={withAlpha(palette.textSecondary, 0.56)} style={[styles.searchInput, { color: palette.textMain }]} autoCorrect={false} autoCapitalize="none" />
                </View>
              </LinearGradient>
            </View>

            <View style={styles.statsRow}>
              {renderStatCard(texts.totalSubscribers, filteredSabiContacts.length, "users")}
              {renderStatCard(texts.totalCustom, filteredCustomContacts.length, "custom")}
              {renderStatCard(texts.totalPhone, filteredPhoneContacts.length, "phone")}
            </View>

            <View style={styles.infoWrap}>
              <View style={[styles.infoShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) }]} />
              <LinearGradient colors={cardColors} style={[styles.infoCard, { borderColor: flatGlassBorder }]}> 
                <View style={[styles.infoGlassLayer, { backgroundColor: softGlassColor }]} />
                <View style={[styles.infoIconWrap, { backgroundColor: accentSoftBg, borderColor: accentBorder }]}><ShieldCheck size={18} color={palette.accentSoft} strokeWidth={2.3} /></View>
                <Text style={[styles.infoText, { color: palette.textSecondary }]}>{texts.subtitle}</Text>
              </LinearGradient>
            </View>
          </View>

          {loading ? (
            <View style={styles.stateWrap}><View style={[styles.stateShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) }]} /><LinearGradient colors={cardColors} style={[styles.stateCard, { borderColor: flatGlassBorder }]}><View style={[styles.stateGlassLayer, { backgroundColor: softGlassColor }]} /><ActivityIndicator color={palette.accent} /><Text style={[styles.stateText, { color: palette.textSecondary }]}>{texts.loading}</Text></LinearGradient></View>
          ) : error ? (
            <View style={styles.stateWrap}><View style={[styles.stateShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) }]} /><LinearGradient colors={cardColors} style={[styles.stateCard, { borderColor: flatGlassBorder }]}><View style={[styles.stateGlassLayer, { backgroundColor: softGlassColor }]} /><Text style={[styles.stateText, { color: palette.textSecondary }]}>{error}</Text></LinearGradient></View>
          ) : null}

          <View style={styles.sectionWrap}>
            <Text style={[styles.sectionTitle, { color: palette.textMain }]}>{texts.customTitle}</Text>
            <Text style={[styles.sectionSubtitle, { color: palette.textSecondary }]}>{texts.customSubtitle}</Text>
            {filteredCustomContacts.length === 0 && !loading ? (
              <View style={styles.emptyWrap}><View style={[styles.emptyShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) }]} /><LinearGradient colors={cardColors} style={[styles.emptyCard, { borderColor: flatGlassBorder }]}><View style={[styles.emptyGlassLayer, { backgroundColor: softGlassColor }]} /><Text style={[styles.emptyText, { color: palette.textSecondary }]}>{texts.emptyCustom}</Text></LinearGradient></View>
            ) : (
              filteredCustomContacts.map((item, index) => <React.Fragment key={makeRowKey("custom", item, index)}>{renderContactRow(item, "chat")}</React.Fragment>)
            )}
          </View>

          <View style={styles.sectionWrap}>
            <Text style={[styles.sectionTitle, { color: palette.textMain }]}>{texts.subscribersTitle}</Text>
            {filteredSabiContacts.length === 0 && !loading ? (
              <View style={styles.emptyWrap}><View style={[styles.emptyShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) }]} /><LinearGradient colors={cardColors} style={[styles.emptyCard, { borderColor: flatGlassBorder }]}><View style={[styles.emptyGlassLayer, { backgroundColor: softGlassColor }]} /><Text style={[styles.emptyText, { color: palette.textSecondary }]}>{texts.emptySubscribers}</Text></LinearGradient></View>
            ) : (
              filteredSabiContacts.map((item, index) => <React.Fragment key={makeRowKey("sabi", item, index)}>{renderContactRow(item, "chat")}</React.Fragment>)
            )}
          </View>

          <View style={styles.sectionWrap}>
            <Text style={[styles.sectionTitle, { color: palette.textMain }]}>{texts.phoneOnlyTitle}</Text>
            <Text style={[styles.sectionSubtitle, { color: palette.textSecondary }]}>{texts.phoneOnlySubtitle}</Text>
            {filteredPhoneContacts.length === 0 && !loading ? (
              <View style={styles.emptyWrap}><View style={[styles.emptyShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) }]} /><LinearGradient colors={cardColors} style={[styles.emptyCard, { borderColor: flatGlassBorder }]}><View style={[styles.emptyGlassLayer, { backgroundColor: softGlassColor }]} /><Text style={[styles.emptyText, { color: palette.textSecondary }]}>{texts.emptyPhone}</Text></LinearGradient></View>
            ) : (
              filteredPhoneContacts.map((item, index) => <React.Fragment key={makeRowKey("phone", item, index)}>{renderContactRow(item, "invite")}</React.Fragment>)
            )}
          </View>
        </ScrollView>

        <Modal visible={actionContact !== null} transparent animationType="fade" onRequestClose={() => setActionContact(null)}>
          <View style={styles.modalOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setActionContact(null)} />
            <View style={[styles.actionSheetWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
              <View style={[styles.actionSheetShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.26) }]} />
              <LinearGradient colors={panelColors} style={[styles.actionSheet, { borderColor: flatGlassBorder }]}> 
                <View style={[styles.modalGlassLayer, { backgroundColor: softGlassColor }]} />
                <Text style={[styles.actionTitle, { color: palette.textMain }]}>{texts.actionsTitle}</Text>
                <Text style={[styles.actionSubtitle, { color: palette.textSecondary }]} numberOfLines={2}>{actionContact?.name || ""}</Text>
                <Pressable onPress={() => actionContact && openEditComposer(actionContact)} style={styles.actionButtonWrap}><View style={[styles.actionButtonShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) }]} /><LinearGradient colors={raisedColors} style={[styles.actionButton, { borderColor: flatGlassBorder }]}><View style={[styles.actionButtonGlass, { backgroundColor: softGlassColor }]} /><PencilLine size={18} color={palette.accentSoft} strokeWidth={2.3} /><Text style={[styles.actionButtonText, { color: palette.textMain }]}>{texts.editContact}</Text></LinearGradient></Pressable>
                <Pressable onPress={() => void confirmDeleteContact()} disabled={actionBusy} style={styles.actionButtonWrap}><View style={[styles.actionButtonShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) }]} /><LinearGradient colors={[withAlpha("#F87171", 0.28), withAlpha("#EF4444", 0.16)]} style={[styles.actionButton, { borderColor: withAlpha("#F87171", 0.24) }]}><View style={[styles.actionButtonGlass, { backgroundColor: withAlpha("#FFFFFF", 0.04) }]} /><Trash2 size={18} color="#FFD7DD" strokeWidth={2.3} /><Text style={[styles.actionButtonText, { color: "#FFD7DD" }]}>{actionBusy ? "..." : texts.deleteContact}</Text></LinearGradient></Pressable>
                <Pressable onPress={() => setActionContact(null)} style={styles.actionButtonWrap}><View style={[styles.actionButtonShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) }]} /><LinearGradient colors={raisedColors} style={[styles.actionButton, { borderColor: flatGlassBorder }]}><View style={[styles.actionButtonGlass, { backgroundColor: softGlassColor }]} /><X size={18} color={palette.textMain} strokeWidth={2.3} /><Text style={[styles.actionButtonText, { color: palette.textMain }]}>{texts.cancel}</Text></LinearGradient></Pressable>
              </LinearGradient>
            </View>
          </View>
        </Modal>

        <Modal statusBarTranslucent visible={composerMode !== null} transparent animationType="fade" onRequestClose={resetComposer}>
          <KeyboardAvoidingView
            style={[styles.modalOverlay, contactComposerBackdropLiftStyle]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Math.max(insets.bottom, 8)}
          >
<View style={[styles.modalSheetWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
              <View style={[styles.modalSheetShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.26) }]} />
              <LinearGradient colors={panelColors} style={[styles.modalSheet, { borderColor: flatGlassBorder }]}> 
                <View style={[styles.modalGlassLayer, { backgroundColor: softGlassColor }]} />
                <ScrollView keyboardDismissMode="on-drag"
                  style={styles.modalScroll}
                  keyboardShouldPersistTaps="always"
                  showsVerticalScrollIndicator={false}
                  bounces={false}>
                  <View style={styles.modalHeaderRow}>
                    <View style={styles.modalHeaderTextWrap}>
                      <Text style={[styles.modalTitle, { color: palette.textMain }]}>{editingContact ? texts.modalEditContactTitle : composerMode === "new_contact" ? texts.modalNewContactTitle : texts.modalNewChatTitle}</Text>
                      <Text style={[styles.modalSubtitle, { color: palette.textSecondary }]}>{editingContact ? texts.modalEditSubtitle : texts.modalSubtitle}</Text>
                    </View>
                    <Pressable onPress={resetComposer} style={styles.modalCloseButton}><View style={[styles.modalCloseButtonShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) }]} /><LinearGradient colors={raisedColors} style={[styles.modalCloseButtonInner, { borderColor: flatGlassBorder }]}><View style={[styles.modalCloseButtonGlass, { backgroundColor: softGlassColor }]} /><X size={16} color={palette.textMain} strokeWidth={2.3} /></LinearGradient></Pressable>
                  </View>
                  <Field label={texts.formName} value={formName} onChangeText={setFormName} placeholder={texts.formNamePlaceholder} borderColor={flatGlassBorder} backgroundColor={softGlassColor} textColor={palette.textMain} labelColor={palette.textMain} />
                  <Field label={texts.formPhone} value={formPhone} onChangeText={setFormPhone} placeholder={texts.formPhonePlaceholder} keyboardType="phone-pad" borderColor={flatGlassBorder} backgroundColor={softGlassColor} textColor={palette.textMain} labelColor={palette.textMain} />
                  <Field label={texts.formUsername} value={formUsername} onChangeText={setFormUsername} placeholder={texts.formUsernamePlaceholder} borderColor={flatGlassBorder} backgroundColor={softGlassColor} textColor={palette.textMain} labelColor={palette.textMain} />
                  {composerMode === "new_contact" && !editingContact ? <LinearGradient colors={raisedColors} style={[styles.switchRow, { borderColor: flatGlassBorder }]}><View style={[styles.switchGlassLayer, { backgroundColor: softGlassColor }]} /><View style={styles.switchTextWrap}><Text style={[styles.switchTitle, { color: palette.textMain }]}>{texts.saveToDevice}</Text></View><Switch value={saveToDevice} onValueChange={setSaveToDevice} disabled={!normalizePhone(formPhone || prefillPhone)} trackColor={{ false: withAlpha(palette.textSecondary, 0.28), true: withAlpha(palette.accent, 0.42) }} thumbColor={saveToDevice ? palette.accentSoft : palette.textMain} /></LinearGradient> : null}
                  <View style={styles.modalActionsRow}>
                    <Pressable onPress={resetComposer} style={styles.modalActionWrap}><View style={[styles.modalActionShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) }]} /><LinearGradient colors={raisedColors} style={[styles.modalSecondaryAction, { borderColor: flatGlassBorder }]}><View style={[styles.modalSecondaryGlass, { backgroundColor: softGlassColor }]} /><Text style={[styles.modalSecondaryActionText, { color: palette.textMain }]}>{texts.cancel}</Text></LinearGradient></Pressable>
                    <Pressable onPress={() => void saveNewEntity()} disabled={saving} style={styles.modalActionWrap}><View style={[styles.modalActionShadow, { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) }]} /><LinearGradient colors={[palette.accent, palette.accentAlt]} style={styles.modalPrimaryAction}><View style={[styles.modalPrimaryGlass, { backgroundColor: withAlpha(palette.textMain, 0.16) }]} />{saving ? <ActivityIndicator color={withAlpha(palette.background[0] || "#061E19", 0.92)} /> : <Text style={[styles.modalPrimaryActionText, { color: palette.background[0] || "#062019" }]}>{composerMode === "new_contact" ? texts.save : texts.create}</Text>}</LinearGradient></Pressable>
                  </View>
                </ScrollView>
              </LinearGradient>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </DecorativeBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create<any>({
  safeArea: { flex: 1 },
  background: { flex: 1 },
  textureGrid: { ...StyleSheet.absoluteFillObject, opacity: 0.04, backgroundColor: "transparent" },
  topGlow: { position: "absolute", top: -90, right: -30, width: 220, height: 220, borderRadius: 220 },
  sideGlow: { position: "absolute", top: 180, left: -90, width: 240, height: 240, borderRadius: 240 },
  bottomGlow: { position: "absolute", bottom: 60, right: -100, width: 280, height: 280, borderRadius: 280 },
  floatingTopBar: { position: "absolute", left: 0, right: 0, zIndex: 20, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  floatingTitleWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  floatingTitle: { fontSize: 17, fontWeight: "900" },
  headerButtonWrap: { width: 44, height: 44 },
  headerButtonShadow: { ...StyleSheet.absoluteFillObject, borderRadius: 18, transform: [{ translateY: 7 }, { scaleX: 0.92 }] },
  headerButton: { flex: 1, borderRadius: 18, alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: 1 },
  headerButtonGlass: { ...StyleSheet.absoluteFillObject },
  headerButtonSpacer: { width: 44, height: 44 },
  scroll: { flex: 1 },
  heroStack: { marginBottom: 18 },
  heroHeaderWrap: { borderRadius: 28 },
  heroHeaderShadow: { ...StyleSheet.absoluteFillObject, borderRadius: 28, transform: [{ translateY: 9 }, { scaleX: 0.96 }] },
  heroHeaderCard: { borderRadius: 28, paddingHorizontal: 16, paddingVertical: 16, borderWidth: 1, overflow: "hidden" },
  heroGlassLayer: { ...StyleSheet.absoluteFillObject },
  heroGlow: { position: "absolute", top: -20, right: -8, width: 120, height: 84, borderRadius: 84 },
  headerEyebrow: { fontSize: 12, fontWeight: "900", letterSpacing: 0.6, textTransform: "uppercase" },
  headerTitle: { fontSize: 28, fontWeight: "900", marginTop: 6 },
  headerSubtitle: { fontSize: 13, lineHeight: 18, marginTop: 8, fontWeight: "700" },
  quickActionsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  quickActionWrap: { flex: 1 },
  quickActionOuter: { borderRadius: 22 },
  quickActionShadow: { ...StyleSheet.absoluteFillObject, borderRadius: 22, transform: [{ translateY: 8 }, { scaleX: 0.96 }] },
  quickActionCard: { minHeight: 68, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, flexDirection: "row", alignItems: "center", overflow: "hidden" },
  quickActionGlass: { ...StyleSheet.absoluteFillObject },
  quickActionIconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", marginRight: 10, borderWidth: 1 },
  quickActionText: { flex: 1, fontSize: 14, fontWeight: "900" },
  searchCardWrap: { marginTop: 12, borderRadius: 22 },
  searchShadow: { ...StyleSheet.absoluteFillObject, borderRadius: 22, transform: [{ translateY: 9 }, { scaleX: 0.97 }] },
  searchCard: { borderRadius: 22, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1, overflow: "hidden" },
  searchGlassLayer: { ...StyleSheet.absoluteFillObject },
  searchInnerGlow: { position: "absolute", top: -18, right: -10, width: 120, height: 80, borderRadius: 80 },
  searchWrap: { flexDirection: "row", alignItems: "center" },
  searchIconWrap: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  statCardWrap: { flex: 1, borderRadius: 22 },
  statShadow: { ...StyleSheet.absoluteFillObject, borderRadius: 22, transform: [{ translateY: 8 }, { scaleX: 0.96 }] },
  statCard: { minHeight: 96, borderRadius: 22, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, overflow: "hidden" },
  statGlassLayer: { ...StyleSheet.absoluteFillObject },
  statGlow: { position: "absolute", top: -18, right: -12, width: 96, height: 74, borderRadius: 74 },
  statIconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", marginBottom: 8, borderWidth: 1 },
  statValue: { fontSize: 20, fontWeight: "900" },
  statLabel: { fontSize: 11, lineHeight: 14, fontWeight: "800", marginTop: 4 },
  infoWrap: { marginTop: 12, borderRadius: 22 },
  infoShadow: { ...StyleSheet.absoluteFillObject, borderRadius: 22, transform: [{ translateY: 8 }, { scaleX: 0.96 }] },
  infoCard: { borderRadius: 22, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", overflow: "hidden" },
  infoGlassLayer: { ...StyleSheet.absoluteFillObject },
  infoIconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginRight: 10, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  stateWrap: { marginBottom: 16, borderRadius: 22 },
  stateShadow: { ...StyleSheet.absoluteFillObject, borderRadius: 22, transform: [{ translateY: 8 }, { scaleX: 0.96 }] },
  stateCard: { minHeight: 82, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, overflow: "hidden" },
  stateGlassLayer: { ...StyleSheet.absoluteFillObject },
  stateText: { fontSize: 13, fontWeight: "700", marginTop: 10, textAlign: "center" },
  sectionWrap: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "900", marginBottom: 6 },
  sectionSubtitle: { fontSize: 12, lineHeight: 17, fontWeight: "700", marginBottom: 10 },
  emptyWrap: { borderRadius: 20 },
  emptyShadow: { ...StyleSheet.absoluteFillObject, borderRadius: 20, transform: [{ translateY: 8 }, { scaleX: 0.96 }] },
  emptyCard: { minHeight: 76, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, overflow: "hidden" },
  emptyGlassLayer: { ...StyleSheet.absoluteFillObject },
  emptyText: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  rowWrap: { borderRadius: 22, marginBottom: 10 },
  rowPressed: { transform: [{ scale: 0.988 }], opacity: 0.97 },
  rowShadow: { ...StyleSheet.absoluteFillObject, borderRadius: 22, transform: [{ translateY: 9 }, { scaleX: 0.96 }] },
  rowGlow: { ...StyleSheet.absoluteFillObject, borderRadius: 22 },
  rowCard: { flexDirection: "row", alignItems: "center", borderRadius: 22, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, overflow: "hidden" },
  rowGlassLayer: { ...StyleSheet.absoluteFillObject },
  rowAccentRailWrap: { position: "absolute", left: 0, top: 14, bottom: 14, width: 4, justifyContent: "center" },
  rowAccentRail: { flex: 1, borderTopRightRadius: 999, borderBottomRightRadius: 999 },
  avatarOuter: { width: 48, height: 48, alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarGlow: { position: "absolute", width: 52, height: 52, borderRadius: 26 },
  avatar: { width: 44, height: 44, borderRadius: 22, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  avatarImage: { width: "100%", height: "100%" },
  avatarFallback: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#F7FFFC", fontSize: 17, fontWeight: "900" },
  rowTextWrap: { flex: 1, minWidth: 0, paddingRight: 8 },
  nameRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  rowName: { fontSize: 16, fontWeight: "900", maxWidth: "78%" },
  verifiedIcon: { marginLeft: 6 },
  badgePill: { marginLeft: 8, minHeight: 20, borderRadius: 999, paddingHorizontal: 8, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  badgePillText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.3, textTransform: "uppercase" },
  rowSubtitle: { fontSize: 13, marginTop: 4, fontWeight: "700" },
  rowMeta: { fontSize: 12, marginTop: 3, fontWeight: "600" },
  contextWrap: { marginLeft: 6, width: 36, height: 36 },
  contextShadow: { ...StyleSheet.absoluteFillObject, borderRadius: 12, transform: [{ translateY: 6 }, { scaleX: 0.94 }] },
  contextButton: { flex: 1, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, overflow: "hidden" },
  contextGlass: { ...StyleSheet.absoluteFillObject },
  trailingWrap: { marginLeft: 10, minWidth: 88 },
  trailingShadow: { ...StyleSheet.absoluteFillObject, borderRadius: 14, transform: [{ translateY: 7 }, { scaleX: 0.94 }] },
  trailingButton: { minHeight: 42, borderRadius: 14, paddingHorizontal: 10, alignItems: "center", justifyContent: "center", borderWidth: 1, overflow: "hidden" },
  trailingButtonGlass: { ...StyleSheet.absoluteFillObject },
  trailingText: { fontSize: 11, fontWeight: "900", marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(2,8,7,0.54)", justifyContent: "flex-end" },
  actionSheetWrap: { paddingHorizontal: 12 },
  actionSheetShadow: { ...StyleSheet.absoluteFillObject, borderRadius: 28, transform: [{ translateY: 10 }, { scaleX: 0.96 }] },
  actionSheet: { borderRadius: 28, borderWidth: 1, padding: 16, overflow: "hidden" },
  actionTitle: { fontSize: 20, fontWeight: "900" },
  actionSubtitle: { fontSize: 13, lineHeight: 18, marginTop: 6, marginBottom: 16, fontWeight: "700" },
  actionButtonWrap: { borderRadius: 18, marginBottom: 10 },
  actionButtonShadow: { ...StyleSheet.absoluteFillObject, borderRadius: 18, transform: [{ translateY: 8 }, { scaleX: 0.95 }] },
  actionButton: { minHeight: 54, borderRadius: 18, borderWidth: 1, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", overflow: "hidden" },
  actionButtonGlass: { ...StyleSheet.absoluteFillObject },
  actionButtonText: { fontSize: 14, fontWeight: "900", marginLeft: 10 },
  modalSheetWrap: { paddingHorizontal: 12 },
  modalSheetShadow: { ...StyleSheet.absoluteFillObject, borderRadius: 28, transform: [{ translateY: 10 }, { scaleX: 0.96 }] },
  modalSheet: { maxHeight: "82%", borderRadius: 28, borderWidth: 1, overflow: "hidden" },
  modalScroll: { flexGrow: 0 },
  modalScrollContent: { padding: 16 },
  modalGlassLayer: { ...StyleSheet.absoluteFillObject },
  modalHeaderRow: { flexDirection: "row", alignItems: "flex-start" },
  modalHeaderTextWrap: { flex: 1, paddingRight: 10 },
  modalTitle: { fontSize: 20, fontWeight: "900" },
  modalSubtitle: { fontSize: 12, lineHeight: 17, marginTop: 6 },
  modalCloseButton: { width: 36, height: 36 },
  modalCloseButtonShadow: { ...StyleSheet.absoluteFillObject, borderRadius: 14, transform: [{ translateY: 6 }, { scaleX: 0.92 }] },
  modalCloseButtonInner: { flex: 1, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, overflow: "hidden" },
  modalCloseButtonGlass: { ...StyleSheet.absoluteFillObject },
  fieldWrap: { marginTop: 14 },
  fieldLabel: { fontSize: 12, fontWeight: "800", marginBottom: 7 },
  fieldCard: { minHeight: 54, borderRadius: 18, borderWidth: 1, justifyContent: "center", paddingHorizontal: 12 },
  fieldInput: { fontSize: 15, fontWeight: "600" },
  switchRow: { marginTop: 16, minHeight: 58, borderRadius: 18, borderWidth: 1, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", overflow: "hidden" },
  switchGlassLayer: { ...StyleSheet.absoluteFillObject },
  switchTextWrap: { flex: 1, paddingRight: 12 },
  switchTitle: { fontSize: 14, fontWeight: "800" },
  modalActionsRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  modalActionWrap: { flex: 1 },
  modalActionShadow: { ...StyleSheet.absoluteFillObject, borderRadius: 18, transform: [{ translateY: 8 }, { scaleX: 0.95 }] },
  modalSecondaryAction: { minHeight: 50, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  modalSecondaryGlass: { ...StyleSheet.absoluteFillObject },
  modalSecondaryActionText: { fontSize: 14, fontWeight: "900" },
  modalPrimaryAction: { minHeight: 50, borderRadius: 18, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  modalPrimaryGlass: { position: "absolute", top: 2, left: 10, right: 10, height: 16, borderRadius: 16 },
  modalPrimaryActionText: { fontSize: 14, fontWeight: "900" },
});




