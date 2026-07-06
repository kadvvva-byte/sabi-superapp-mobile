import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bot,
  BriefcaseBusiness,
  ChevronLeft,
  Crown,
  Hash,
  History,
  Link2,
  Lock,
  Megaphone,
  MessageCircleMore,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  Store,
  Wallet,
} from "lucide-react-native";

import { profileKernelFacade } from "../../../core/kernel/profile";
import { useI18n } from "../../../shared/i18n";
import { openMessengerRoom } from "../../../modules/messenger/navigation/messengerRoomNavigation";
import { syncSabiProfileBotToPublicDirectory, syncSabiProfileBotsCollectionToPublicDirectory } from "../../../modules/messenger/public-directory/profileDirectoryBridge";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

type RouteParams = {
  userId?: string | string[];
  selfId?: string | string[];
  premium?: string | string[];
};

type BotHistoryEntry = {
  id: string;
  title: string;
  subtitle: string;
  kind: "identity" | "publication" | "control" | "routing";
  createdAt: number;
};

type BotProfileState = {
  created: boolean;
  botId: string;
  botName: string;
  username: string;
  description: string;
  inviteLink: string;

  avatarUri: string;
  coverUri: string;

  ownerName: string;
  ownerUserId: string;
  ownerRole: string;
  ownerPhone: string;
  ownerEmail: string;

  botKind: string;
  premiumOnly: boolean;
  aiPostLaunchNote: boolean;

  isPublic: boolean;
  isPublished: boolean;
  showInProfile: boolean;
  searchableInDirectory: boolean;
  previewEnabled: boolean;
  visibleInDiscovery: boolean;

  isActive: boolean;
  acceptsCommands: boolean;
  inlineModeEnabled: boolean;
  autoReplyEnabled: boolean;
  allowPayments: boolean;

  linkedChatId: string;
  linkedPublicationId: string;
  linkedGroupId: string;
  linkedChannelId: string;
  linkedMarketId: string;
  linkedBusinessPayRoute: string;
  linkedWalletRoute: string;

  commandsSummary: string;
  modulesSummary: string;

  publicationTitle: string;
  publicationSubtitle: string;
  publicationSlug: string;
  publicationTags: string;
  publicationSummary: string;

  interactionsCount: number;
  ordersCount: number;
  lastUpdatedAt: number;

  history: BotHistoryEntry[];
};

type BotCollectionState = {
  bots: BotProfileState[];
  selectedBotId: string | null;
};

type TabKey = "overview" | "public" | "control" | "history";

const PREMIUM_KEYS = [
  "sabi.profile.premium.active.v1",
  "sabi.profile.premium.active",
  "sabi.premium.active",
];

const BG_TOP = "#08111F";
const BG_MID = "#0D1830";
const BG_BOTTOM = "#111F3F";
const TEXT = "#F3F7FF";
const MUTED = "#B8C6E3";
const MUTED_2 = "#8FA4CB";
const CARD = "rgba(14, 23, 43, 0.78)";
const CARD_STRONG = "rgba(17, 28, 52, 0.92)";
const CARD_BORDER = "rgba(132, 168, 255, 0.18)";
const CHIP = "rgba(255,255,255,0.08)";
const BLUE = "#6F9CFF";
const BLUE_2 = "#8D82FF";
const MINT = "#54E1C1";
const GOLD = "#FFC96B";
const PINK = "#FF7FBC";

const DEFAULT_BOT_STATE: BotProfileState = {
  created: false,
  botId: "",
  botName: "",
  username: "",
  description: "",
  inviteLink: "",

  avatarUri: "",
  coverUri: "",

  ownerName: "",
  ownerUserId: "",
  ownerRole: "",
  ownerPhone: "",
  ownerEmail: "",

  botKind: "assistant",
  premiumOnly: true,
  aiPostLaunchNote: true,

  isPublic: false,
  isPublished: false,
  showInProfile: false,
  searchableInDirectory: false,
  previewEnabled: true,
  visibleInDiscovery: false,

  isActive: true,
  acceptsCommands: true,
  inlineModeEnabled: false,
  autoReplyEnabled: true,
  allowPayments: false,

  linkedChatId: "",
  linkedPublicationId: "",
  linkedGroupId: "",
  linkedChannelId: "",
  linkedMarketId: "",
  linkedBusinessPayRoute: "business-routing-layer",
  linkedWalletRoute: "sabi-wallet",

  commandsSummary: "",
  modulesSummary: "",

  publicationTitle: "",
  publicationSubtitle: "",
  publicationSlug: "",
  publicationTags: "",
  publicationSummary: "",

  interactionsCount: 0,
  ordersCount: 0,
  lastUpdatedAt: 0,

  history: [],
};

const DEFAULT_BOT_COLLECTION: BotCollectionState = {
  bots: [],
  selectedBotId: null,
};

function buildId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 32);
}

function sanitizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 48);
}

function buildInviteLink(username: string, botId: string) {
  const clean = sanitizeUsername(username);
  if (clean) return `sabi://bot/${clean}`;
  return `sabi://bot/${botId}`;
}

function buildPublicationId(botId: string) {
  return `pub_bot_${botId}`;
}

function buildDefaultPublicationSlug(botName: string, username: string, botId: string) {
  const fromName = sanitizeSlug(botName);
  if (fromName) return fromName;

  const fromUsername = sanitizeSlug(username);
  if (fromUsername) return fromUsername;

  return sanitizeSlug(botId);
}

function readParamValue(value?: string | string[]) {
  if (Array.isArray(value)) return String(value[0] ?? "").trim();
  return String(value ?? "").trim();
}

function resolveCurrentUserId(params: RouteParams) {
  const fromRoute = readParamValue(params.userId) || readParamValue(params.selfId);
  if (fromRoute) return fromRoute;

  const fromGlobal =
    typeof globalThis !== "undefined" &&
    typeof (globalThis as { __SABI_USER_ID__?: string }).__SABI_USER_ID__ === "string"
      ? String((globalThis as { __SABI_USER_ID__?: string }).__SABI_USER_ID__ || "").trim()
      : "";

  return fromGlobal;
}

function normalizeHistory(value: unknown): BotHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const raw = item as Partial<BotHistoryEntry>;
      const kind = String(raw?.kind ?? "control") as BotHistoryEntry["kind"];
      return {
        id: String(raw?.id ?? "").trim() || buildId("hist"),
        title: String(raw?.title ?? "").trim(),
        subtitle: String(raw?.subtitle ?? "").trim(),
        kind,
        createdAt: Number(raw?.createdAt ?? Date.now()),
      };
    })
    .filter((item) => item.title)
    .sort((a, b) => b.createdAt - a.createdAt);
}

function normalizeBotState(raw?: Partial<BotProfileState> | null): BotProfileState {
  const merged: BotProfileState = {
    ...DEFAULT_BOT_STATE,
    ...(raw ?? {}),
    history: normalizeHistory(raw?.history),
    interactionsCount: Number(raw?.interactionsCount ?? 0),
    ordersCount: Number(raw?.ordersCount ?? 0),
    lastUpdatedAt: Number(raw?.lastUpdatedAt ?? 0),
  };

  if (merged.username) {
    merged.username = sanitizeUsername(merged.username);
  }

  if (merged.botId && !merged.inviteLink) {
    merged.inviteLink = buildInviteLink(merged.username, merged.botId);
  }

  if (merged.botId && !merged.linkedPublicationId) {
    merged.linkedPublicationId = buildPublicationId(merged.botId);
  }

  if (!merged.isPublic) {
    merged.isPublished = false;
    merged.showInProfile = false;
    merged.searchableInDirectory = false;
    merged.visibleInDiscovery = false;
  }

  return merged;
}

function normalizeBotCollection(raw?: unknown): BotCollectionState {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;

  if (source && Array.isArray(source.bots)) {
    const bots = source.bots
      .map((item) => normalizeBotState(item as Partial<BotProfileState>))
      .filter((item) => item.botId || item.botName.trim());

    const requestedSelectedId =
      typeof source.selectedBotId === "string" && source.selectedBotId.trim()
        ? source.selectedBotId.trim()
        : null;

    const selectedBotId =
      requestedSelectedId && bots.some((item) => item.botId === requestedSelectedId)
        ? requestedSelectedId
        : bots[0]?.botId || null;

    return { bots, selectedBotId };
  }

  return DEFAULT_BOT_COLLECTION;
}

function pushHistory(
  state: BotProfileState,
  entry: Omit<BotHistoryEntry, "id" | "createdAt">,
): BotProfileState {
  const nextEntry: BotHistoryEntry = {
    id: buildId("hist"),
    createdAt: Date.now(),
    ...entry,
  };

  return {
    ...state,
    history: [nextEntry, ...state.history].slice(0, 40),
  };
}

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) {
    const value = Math.max(1, Math.round(diff / minute));
    return `${value} min ago`;
  }

  if (diff < day) {
    const value = Math.max(1, Math.round(diff / hour));
    return `${value} h ago`;
  }

  const value = Math.max(1, Math.round(diff / day));
  return `${value} d ago`;
}


function readPremiumUnlockedFromKernel(params: RouteParams) {
  const routePremium = readParamValue(params.premium);
  if (routePremium === "1" || routePremium.toLowerCase() === "true") return true;
  const account = profileKernelFacade.selectors.account();
  const raw = account && typeof account.raw === "object" && account.raw ? (account.raw as Record<string, unknown>) : null;
  return Boolean(raw?.premiumActive || raw?.premiumEnabled || raw?.isPremium || raw?.premium);
}


export default function BotProfileScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const i18n = useI18n() as I18nHookValue;
  const { width } = useWindowDimensions();
  const currentUserId = useMemo(() => resolveCurrentUserId(params), [params]);

  const [form, setForm] = useState<BotProfileState>(DEFAULT_BOT_STATE);
  const [bots, setBots] = useState<BotProfileState[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);

  const t = useCallback(
    (key: string, params?: Record<string, unknown>) => {
      if (typeof i18n === "function") {
        const value = i18n(key, params);
        return typeof value === "string" && value.length ? value : key;
      }

      if (i18n && typeof i18n.t === "function") {
        const value = i18n.t(key, params);
        return typeof value === "string" && value.length ? value : key;
      }

      return key;
    },
    [i18n],
  );

  const tt = useCallback(
    (key: string, fallback: string, params?: Record<string, unknown>) => {
      const value = t(key, params);
      return value === key ? fallback : value;
    },
    [t],
  );

  
const loadData = useCallback(async () => {
  try {
    await profileKernelFacade.boot();
    const collection = profileKernelFacade.selectors.botProfiles();
    const account = profileKernelFacade.selectors.account();
    const routePremium = readParamValue(params.premium);
    const raw = account && typeof account.raw === "object" && account.raw ? (account.raw as Record<string, unknown>) : null;
    const premium = routePremium === "1" || routePremium.toLowerCase() === "true" || Boolean(raw?.premiumActive || raw?.premiumEnabled || raw?.isPremium || raw?.premium);

    const bots: BotProfileState[] = Array.isArray(collection?.items)
      ? collection.items.map((item: Record<string, unknown>) => normalizeBotState(item as Partial<BotProfileState>))
      : [];
    const selected = typeof collection?.selectedId === "string" && collection.selectedId.trim() ? collection.selectedId.trim() : null;

    setPremiumUnlocked(premium);
    setBots(bots);
    setSelectedBotId(selected);
    setForm(bots.find((item) => item.botId === selected) || bots[0] || DEFAULT_BOT_STATE);
  } catch {
    setBots([]);
    setSelectedBotId(null);
    setForm(DEFAULT_BOT_STATE);
    setPremiumUnlocked(false);
  } finally {
    setIsReady(true);
  }
}, [params]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const listCardWidth = useMemo(() => {
    const outer = 16 * 2;
    const sectionPadding = 16 * 2;
    const gap = 10;
    const value = (width - outer - sectionPadding - gap) / 2;
    return Math.max(140, Math.floor(value));
  }, [width]);

  const heroCardWidth = useMemo(() => {
    const outer = 16 * 2;
    const sectionPadding = 16 * 2;
    const gap = 10;
    const value = (width - outer - sectionPadding - gap) / 2;
    return Math.max(140, Math.floor(value));
  }, [width]);

  const shelfCardWidth = useMemo(() => {
    const outer = 16 * 2;
    const cardPadding = 16 * 2;
    const gap = 10;
    const value = (width - outer - cardPadding - gap) / 2;
    return Math.max(148, Math.floor(value));
  }, [width]);

  const infoChipWidth = useMemo(() => Math.max(148, listCardWidth), [listCardWidth]);

  const botInitial = useMemo(() => {
    return (form.botName.trim().charAt(0) || "B").toUpperCase();
  }, [form.botName]);

  const activeStoredBot = useMemo(
    () => bots.find((item) => item.botId === selectedBotId) || null,
    [bots, selectedBotId],
  );

  const beginNewBot = useCallback(() => {
    setSelectedBotId(null);
    setForm(DEFAULT_BOT_STATE);
    setActiveTab("overview");
  }, []);

  const openStoredBot = useCallback(
    (botId: string) => {
      const target = bots.find((item) => item.botId === botId);
      if (!target) return;
      setSelectedBotId(botId);
      setForm(target);
      setActiveTab("overview");
    },
    [bots],
  );

  const persistCollection = useCallback(
    async (
      nextBots: BotProfileState[],
      nextSelectedBotId: string | null,
      nextForm: BotProfileState,
      successTitle?: string,
      successMessage?: string,
    ) => {
      try {
        setIsSaving(true);
        const payload: BotCollectionState = {
          bots: nextBots.map((item) => ({
            ...item,
            lastUpdatedAt: item.lastUpdatedAt || Date.now(),
          })),
          selectedBotId: nextSelectedBotId,
        };
        await profileKernelFacade.saveBotProfiles({
          items: payload.bots as unknown as Record<string, unknown>[],
          selectedId: payload.selectedBotId,
        });

        setBots(payload.bots);
        setSelectedBotId(nextSelectedBotId);
        const persistedActive =
          payload.bots.find((item) => item.botId === nextSelectedBotId) ||
          payload.bots.find((item) => item.botId === nextForm.botId) ||
          nextForm;
        await profileKernelFacade.saveBotPreview(persistedActive ? {
          created: Boolean(persistedActive.created),
          botId: persistedActive.botId,
          botName: persistedActive.botName,
          botKind: persistedActive.botKind,
          username: persistedActive.username,
          isPublic: Boolean(persistedActive.isPublic),
          isPublished: Boolean(persistedActive.isPublished),
          ownerUserId: persistedActive.ownerUserId,
          linkedChatId: persistedActive.linkedChatId,
        } as any : null);
        
        // SABI_PROFILE_BOT_PUBLIC_DIRECTORY_SYNC
        await syncSabiProfileBotsCollectionToPublicDirectory(payload.bots as any[]);
        await syncSabiProfileBotToPublicDirectory(persistedActive as any);
setForm(persistedActive);

        if (successTitle && successMessage) {
          Alert.alert(successTitle, successMessage);
        }
      } catch {
        Alert.alert(
          tt("profile.botScreen.alerts.error.title", "Xato"),
          tt("profile.botScreen.alerts.error.saveFailed", "Bot sozlamalarini saqlab bo‘lmadi."),
        );
      } finally {
        setIsSaving(false);
      }
    },
    [tt],
  );

  const ensurePremium = useCallback(() => {
    if (premiumUnlocked) return true;

    Alert.alert(
      tt("profile.botScreen.alerts.premium.title", "Premium kerak"),
      tt(
        "profile.botScreen.alerts.premium.message",
        "Botlar faqat Premium orqali boshqariladi. Bot yaratish yoki boshqarish uchun Premiumni yoqing.",
      ),
      [
        {
          text: tt("common.cancel", "Bekor qilish"),
          style: "cancel",
        },
        {
          text: tt("profile.botScreen.actions.openPremium", "Premiumni ochish"),
          onPress: () => router.push("/profile/premium" as never),
        },
      ],
    );

    return false;
  }, [premiumUnlocked, tt]);

  const setField = useCallback((key: keyof BotProfileState, value: BotProfileState[keyof BotProfileState]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value } as BotProfileState;

      if (key === "username") {
        const clean = sanitizeUsername(String(value));
        next.username = clean;
        if (next.botId) {
          next.inviteLink = buildInviteLink(clean, next.botId);
        }
        if (!next.publicationSlug.trim()) {
          next.publicationSlug = buildDefaultPublicationSlug(next.botName, clean, next.botId);
        }
      }

      if (key === "botName") {
        const botName = String(value);
        if (!next.publicationTitle.trim()) {
          next.publicationTitle = botName;
        }
        if (!next.publicationSlug.trim()) {
          next.publicationSlug = buildDefaultPublicationSlug(botName, next.username, next.botId);
        }
      }

      if (key === "publicationSlug") {
        next.publicationSlug = sanitizeSlug(String(value));
      }

      if (key === "botKind") {
        const kind = String(value).trim().toLowerCase();
        if (kind === "trade") {
          next.allowPayments = true;
          next.linkedWalletRoute = "sabi-wallet";
          next.linkedBusinessPayRoute = "";
        }
        if (kind === "business") {
          next.allowPayments = true;
          next.linkedBusinessPayRoute = "business-routing-layer";
        }
      }

      if (key === "isPublic" && value === false) {
        next.isPublished = false;
        next.showInProfile = false;
        next.searchableInDirectory = false;
        next.visibleInDiscovery = false;
      }

      return next;
    });
  }, []);

  const buildCreatedState = useCallback(
    (source: BotProfileState) => {
      const botName = source.botName.trim();
      if (!botName) return null;

      const botId = source.botId.trim() || buildId("bot");
      const username = sanitizeUsername(source.username || botName);
      const ownerUserId = source.ownerUserId.trim() || currentUserId || buildId("owner");
      const ownerName = source.ownerName.trim() || "Egasi";
      const ownerRole = source.ownerRole.trim() || "Egasi";
      const inviteLink = buildInviteLink(username, botId);
      const publicationSlug =
        source.publicationSlug.trim() || buildDefaultPublicationSlug(botName, username, botId);

      const botKind = source.botKind.trim() || "assistant";
      const walletRoute = botKind === "trade" ? "sabi-wallet" : source.linkedWalletRoute;
      const businessRoute = botKind === "business" ? "business-routing-layer" : source.linkedBusinessPayRoute;

      return {
        ...source,
        created: true,
        botId,
        botName,
        username,
        ownerUserId,
        ownerName,
        ownerRole,
        inviteLink,
        linkedChatId: source.linkedChatId.trim() || `bot:${botId}`,
        linkedPublicationId: source.linkedPublicationId.trim() || buildPublicationId(botId),
        publicationTitle: source.publicationTitle.trim() || botName,
        publicationSlug,
        botKind,
        premiumOnly: true,
        aiPostLaunchNote: true,
        linkedWalletRoute: walletRoute || "sabi-wallet",
        linkedBusinessPayRoute: businessRoute,
        isPublished: source.isPublic ? source.isPublished : false,
        showInProfile: source.isPublic ? source.showInProfile : false,
        searchableInDirectory: source.isPublic ? source.searchableInDirectory : false,
        visibleInDiscovery: source.isPublic ? source.visibleInDiscovery : false,
      } satisfies BotProfileState;
    },
    [currentUserId],
  );

  const handleCreateBot = useCallback(async () => {
    if (!ensurePremium()) return;

    if (!form.botName.trim()) {
      Alert.alert(
        tt("profile.botScreen.alerts.validation.nameTitle", "Bot nomi kerak"),
        tt("profile.botScreen.alerts.validation.nameMessage", "Yaratishdan oldin bot nomini kiriting."),
      );
      return;
    }

    const createdState = buildCreatedState(form);
    if (!createdState) return;

    const nextState = {
      ...pushHistory(createdState, {
        kind: "identity",
        title: tt("profile.botScreen.actions.create", "Bot yaratish"),
        subtitle: tt("profile.botScreen.alerts.success.created", "Bot yaratildi"),
      }),
      lastUpdatedAt: Date.now(),
    };

    const nextBots = [nextState, ...bots.filter((item) => item.botId !== nextState.botId)];

    await persistCollection(
      nextBots,
      nextState.botId,
      nextState,
      tt("profile.botScreen.alerts.success.title", "Tayyor"),
      tt("profile.botScreen.alerts.success.created", "Bot yaratildi"),
    );
  }, [bots, buildCreatedState, ensurePremium, form, persistCollection, tt]);

  const handleSaveChanges = useCallback(async () => {
    if (!ensurePremium()) return;

    if (!form.botName.trim()) {
      Alert.alert(
        tt("profile.botScreen.alerts.validation.nameTitle", "Bot nomi kerak"),
        tt("profile.botScreen.alerts.validation.nameMessage", "Saqlashdan oldin bot nomini kiriting."),
      );
      return;
    }

    const baseState = buildCreatedState(form);
    if (!baseState) return;

    const nextState = {
      ...pushHistory(baseState, {
        kind: "control",
        title: tt("profile.botScreen.actions.save", "Saqlash"),
        subtitle: tt("profile.botScreen.alerts.success.saved", "Bot sozlamalari saqlandi"),
      }),
      lastUpdatedAt: Date.now(),
    };

    const nextBots = (() => {
      const targetId = nextState.botId;
      if (!targetId) return [nextState, ...bots];
      const exists = bots.some((item) => item.botId === targetId);
      if (!exists) return [nextState, ...bots];
      return bots.map((item) => (item.botId === targetId ? nextState : item));
    })();

    await persistCollection(
      nextBots,
      nextState.botId,
      nextState,
      tt("profile.botScreen.alerts.success.title", "Tayyor"),
      tt("profile.botScreen.alerts.success.saved", "Bot sozlamalari saqlandi"),
    );
  }, [bots, buildCreatedState, ensurePremium, form, persistCollection, tt]);

  const handleResetBot = useCallback(() => {
    Alert.alert(
      tt("profile.botScreen.alerts.resetConfirm.title", "Botni tiklash"),
      tt(
        "profile.botScreen.alerts.resetConfirm.message",
        "Bu bot shu ekrandan olib tashlanadi va yaratish rejimiga qaytasiz.",
      ),
      [
        {
          text: tt("profile.botScreen.alerts.resetConfirm.cancel", "Bekor qilish"),
          style: "cancel",
        },
        {
          text: tt("profile.botScreen.alerts.resetConfirm.confirm", "Tiklash"),
          style: "destructive",
          onPress: async () => {
            const currentId = selectedBotId || form.botId || null;
            if (!currentId) {
              beginNewBot();
              return;
            }

            const remainingBots = bots.filter((item) => item.botId !== currentId);
            const nextSelected = remainingBots[0]?.botId || null;
            const nextForm = remainingBots[0] || DEFAULT_BOT_STATE;

            await persistCollection(
              remainingBots,
              nextSelected,
              nextForm,
              tt("profile.botScreen.alerts.success.title", "Tayyor"),
              tt("profile.botScreen.alerts.success.reset", "Bot olib tashlandi"),
            );

            setActiveTab("overview");
          },
        },
      ],
    );
  }, [beginNewBot, bots, form.botId, persistCollection, selectedBotId, tt]);

  const openCurrentBotChat = useCallback(async () => {
    if (!form.created || !form.linkedChatId.trim()) {
      Alert.alert(
        tt("profile.botScreen.alerts.validation.nameTitle", "Bot nomi kerak"),
        tt("profile.botScreen.readonly.notice", "Avval botni yarating"),
      );
      return;
    }

    await openMessengerRoom({
      chatId: form.linkedChatId,
      name: form.botName.trim() || "Yangi bot",
      roomType: "bot",
      handle: form.username ? `@${form.username}` : undefined,
      username: form.username ? `@${form.username}` : undefined,
      avatarUrl: form.avatarUri || undefined,
      photoUrl: form.avatarUri || undefined,
      currentUserId: currentUserId || undefined,
      peerUserId: form.linkedChatId,
      isBot: "1",
      botId: form.linkedChatId,
      botHandle: form.username ? `@${form.username}` : undefined,
      botKind: form.botKind || undefined,
      isBotOwnedByMe: "1",
      markRead: false,
    });
  }, [currentUserId, form, tt]);

  const overviewCards = useMemo(
    () => [
      {
        key: "kind",
        label: tt("profile.botScreen.stats.kind", "Bot turi"),
        value: form.botKind ? form.botKind.toUpperCase() : "BOT",
        accent: ["#6AE1C7", "#5D9CFF"] as [string, string],
      },
      {
        key: "buyruqlar",
        label: tt("profile.botScreen.stats.commands", "Buyruqlar"),
        value: String(
          form.commandsSummary
            .split(/[\n,]+/)
            .map((item) => item.trim())
            .filter(Boolean).length,
        ),
        accent: ["#88A8FF", "#B688FF"] as [string, string],
      },
      {
        key: "orders",
        label: tt("profile.botScreen.stats.orders", "Buyurtmalar"),
        value: String(form.ordersCount),
        accent: ["#FFD76B", "#FF9E5D"] as [string, string],
      },
      {
        key: "history",
        label: tt("profile.botScreen.stats.history", "Tarix"),
        value: String(form.history.length),
        accent: ["#FF9F87", "#FF6FA1"] as [string, string],
      },
    ],
    [form.botKind, form.commandsSummary, form.history.length, form.ordersCount, tt],
  );

  const tabs = useMemo(
    () => [
      { key: "overview" as TabKey, label: tt("profile.botScreen.tabs.overview", "Profil") },
      { key: "public" as TabKey, label: tt("profile.botScreen.tabs.public", "Ommaviy") },
      { key: "control" as TabKey, label: tt("profile.botScreen.tabs.control", "Sozlamalar") },
      { key: "history" as TabKey, label: tt("profile.botScreen.tabs.history", "Tarix") },
    ],
    [tt],
  );

  if (!isReady) {
    return (
      <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.root}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" />
          <View style={styles.loadingWrap}>
            <Text style={styles.loadingText}>{tt("profile.botScreen.loading", "Bot yuklanmoqda...")}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <View style={styles.backgroundOrbOne} />
        <View style={styles.backgroundOrbTwo} />

        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={20} color={TEXT} />
          </Pressable>

          <View style={styles.headerTextWrap}>
            <Text style={styles.headerEyebrow}>BOT EGASI</Text>
            <Text style={styles.headerTitle}>{tt("profile.botScreen.header.title", "Bot boshqaruvi")}</Text>
          </View>

          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              {premiumUnlocked
                ? tt("profile.botScreen.header.premium", "Premium")
                : tt("profile.botScreen.header.locked", "Faqat Premium")}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.groupShelfCard}>
            <View style={styles.groupShelfHeader}>
              <View style={styles.groupShelfTitleWrap}>
                <Text style={styles.groupShelfTitle}>{tt("profile.botScreen.shelf.title", "Mening botlarim")}</Text>
                <Text style={styles.groupShelfSubtitle}>
                  {activeStoredBot
                    ? `${bots.length} ${tt("profile.botScreen.shelf.countLabel", "botlar")} · ${activeStoredBot.botName}`
                    : `${bots.length} ${tt("profile.botScreen.shelf.countLabel", "botlar")} · ${tt(
                        "profile.botScreen.shelf.multiHint",
                        "bir nechta bot saqlanishi mumkin",
                      )}`}
                </Text>
              </View>

              <Pressable style={styles.groupShelfCreateButton} onPress={beginNewBot}>
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.groupShelfCreateButtonText}>{tt("common.new", "Yangi")}</Text>
              </Pressable>
            </View>

            {bots.length ? (
              <View style={styles.groupShelfGrid}>
                {bots.map((item) => {
                  const active = item.botId === selectedBotId;
                  return (
                    <Pressable
                      key={item.botId}
                      style={[
                        styles.groupShelfItem,
                        { width: shelfCardWidth },
                        active && styles.groupShelfItemActive,
                      ]}
                      onPress={() => openStoredBot(item.botId)}
                    >
                      <View style={styles.groupShelfAvatar}>
                        {item.avatarUri ? (
                          <Image source={{ uri: item.avatarUri }} style={styles.groupShelfAvatarImage} />
                        ) : (
                          <Text style={styles.groupShelfAvatarText}>{(item.botName.trim().charAt(0) || "B").toUpperCase()}</Text>
                        )}
                      </View>
                      <View style={styles.groupShelfTextWrap}>
                        <Text style={styles.groupShelfItemTitle} numberOfLines={1}>{item.botName || tt("profile.botScreen.defaults.botName", "Yangi bot")}</Text>
                        <Text style={styles.groupShelfItemSubtitle} numberOfLines={1}>{item.username ? `@${item.username}` : item.botKind || item.botId}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.groupShelfEmpty}>
                <Text style={styles.groupShelfEmptyText}>{tt("profile.botScreen.shelf.empty", "Hozircha botlar yo‘q. Premium foydalanuvchilar birinchi botni shu yerda yaratadi.")}</Text>
              </View>
            )}
          </View>

          <View style={styles.premiumBanner}>
            <LinearGradient colors={["rgba(255,204,107,0.22)", "rgba(141,130,255,0.16)"]} style={styles.premiumBannerFill}>
              <View style={styles.inlineActionLeft}>
                <View style={styles.inlineActionIcon}>
                  <Crown size={18} color={GOLD} />
                </View>
                <View style={styles.inlineTextWrap}>
                  <Text style={styles.inlineActionTitle}>{tt("profile.botScreen.premium.title", "Botlar faqat Premium uchun")}</Text>
                  <Text style={styles.inlineActionValue}>{tt("profile.botScreen.premium.subtitle", "Ishga tushirilgandan keyin botlar AI bilan chuqur bog‘lanadi.")}</Text>
                </View>
              </View>
              {!premiumUnlocked ? (
                <Pressable style={styles.upgradeButton} onPress={() => router.push("/profile/premium" as never)}>
                  <Text style={styles.upgradeButtonText}>{tt("profile.botScreen.actions.openPremium", "Premiumni ochish")}</Text>
                </Pressable>
              ) : null}
            </LinearGradient>
          </View>

          {!form.created ? (
            <View style={styles.createEntryCard}>
              <View style={styles.createEntryHeader}>
                <View style={styles.createEntryIconWrap}>
                  <Bot size={18} color={BLUE} />
                </View>
                <View style={styles.createEntryTextWrap}>
                  <Text style={styles.createEntryTitle}>{tt("profile.botScreen.actions.create", "Bot yaratish")}</Text>
                  <Text style={styles.createEntrySubtitle}>{tt("profile.botScreen.createFlow.subtitle", "Avval bot nomini kiriting. Yaratish uchun Premium kerak.")}</Text>
                </View>
              </View>

              <CompactInput
                label={tt("profile.botScreen.main.botName.label", "Bot nomi")}
                value={form.botName}
                onChangeText={(value) => setField("botName", value)}
                placeholder={tt("profile.botScreen.main.botName.placeholder", "Bot nomini kiriting")}
              />

              <CompactInput
                label={tt("profile.botScreen.main.username.label", "Foydalanuvchi nomi")}
                value={form.username}
                onChangeText={(value) => setField("username", sanitizeUsername(value))}
                placeholder={tt("profile.botScreen.main.username.placeholder", "bot_nomi")}
                prefix="@"
              />

              <CompactInput
                label={tt("profile.botScreen.main.description.label", "Tavsif")}
                value={form.description}
                onChangeText={(value) => setField("description", value)}
                placeholder={tt("profile.botScreen.main.description.placeholder", "Bot tavsifini yozing")}
                multiline
              />

              <View style={styles.formGrid}>
                <CompactInput
                  label={tt("profile.botScreen.main.kind.label", "Bot turi")}
                  value={form.botKind}
                  onChangeText={(value) => setField("botKind", value.toLowerCase())}
                  placeholder={tt("profile.botScreen.main.kind.placeholder", "yordamchi / savdo / biznes / xizmat")}
                />
                <CompactInput
                  label={tt("profile.botScreen.main.avatar.label", "Avatar havolasi")}
                  value={form.avatarUri}
                  onChangeText={(value) => setField("avatarUri", value)}
                  placeholder="https://..."
                />
              </View>

              <View style={styles.createEntryInfoRow}>
                <InfoChip width={infoChipWidth} icon={<Crown size={14} color={GOLD} />} label={tt("profile.botScreen.createFlow.premiumOnly", "Faqat Premium kirish")}/>
                <InfoChip width={infoChipWidth} icon={<Sparkles size={14} color={BLUE_2} />} label={tt("profile.botScreen.createFlow.aiLater", "AI bilan chuqur integratsiya ishga tushgandan keyin qo‘shiladi")}/>
              </View>

              <Pressable style={[styles.createEntryButton, isSaving && styles.buttonDisabled]} disabled={isSaving} onPress={handleCreateBot}>
                <LinearGradient colors={[BLUE, BLUE_2]} style={styles.createEntryButtonGradient}>
                  <Plus size={18} color="#FFFFFF" />
                  <Text style={styles.createEntryButtonText}>{isSaving ? tt("profile.botScreen.actions.creating", "Yaratilmoqda...") : tt("profile.botScreen.actions.create", "Bot yaratish")}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.heroCard}>
            <View style={styles.heroCoverWrap}>
              {form.coverUri ? (
                <Image source={{ uri: form.coverUri }} style={styles.heroCoverImage} />
              ) : (
                <LinearGradient
                  colors={["rgba(84, 225, 193, 0.72)", "rgba(111, 156, 255, 0.78)", "rgba(141, 130, 255, 0.70)"]}
                  style={styles.heroCoverFallback}
                />
              )}

              <LinearGradient
                colors={["rgba(3,8,18,0.00)", "rgba(3,8,18,0.28)", "rgba(3,8,18,0.62)"]}
                style={styles.heroCoverShade}
              />
            </View>

            <View style={styles.heroMainRow}>
              <View style={styles.avatarWrap}>
                <LinearGradient colors={["#72E4CB", "#689AFF"]} style={styles.avatarRing}>
                  {form.avatarUri ? (
                    <Image source={{ uri: form.avatarUri }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarText}>{botInitial}</Text>
                    </View>
                  )}
                </LinearGradient>
              </View>

              <View style={styles.heroBody}>
                <Text style={styles.heroTitle}>{form.botName.trim() || tt("profile.botScreen.defaults.botName", "Yangi bot")}</Text>
                <Text style={styles.heroSubtitle}>{form.username ? `@${form.username}` : tt("profile.botScreen.defaults.username", "Username hali kiritilmagan")}</Text>
                <Text style={styles.heroDescription} numberOfLines={2}>
                  {form.description.trim() || tt("profile.botScreen.defaults.description", "Bot profili, yo‘nalish va Premium kirish shu yerda boshqariladi.")}
                </Text>
              </View>
            </View>

            <View style={styles.heroStatsRow}>
              <HeroChip width={listCardWidth} label={tt("profile.botScreen.stats.kind", "Bot turi")} value={form.botKind ? form.botKind.toUpperCase() : "BOT"} tone="blue" />
              <HeroChip width={listCardWidth} label={tt("profile.botScreen.stats.commands", "Buyruqlar")} value={String(form.commandsSummary.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean).length)} tone="mint" />
              <HeroChip width={listCardWidth} label={tt("profile.botScreen.stats.orders", "Buyurtmalar")} value={String(form.ordersCount)} tone="gold" />
              <HeroChip width={listCardWidth} label={tt("profile.botScreen.stats.history", "Tarix")} value={String(form.history.length)} tone="pink" />
            </View>

            <View style={styles.gridWrap}>
              <QuickActionCard
                width={heroCardWidth}
                icon={<Bot size={18} color={BLUE} />}
                title={tt("profile.botScreen.quick.kind", "Bot turi")}
                subtitle={tt("profile.botScreen.quick.kindSubtitle", "Yordamchi, savdo, biznes yoki xizmat")}
                onPress={() => setActiveTab("control")}
              />
              <QuickActionCard
                width={heroCardWidth}
                icon={<Store size={18} color={MINT} />}
                title={tt("profile.botScreen.quick.routing", "Yo‘nalish")}
                subtitle={tt("profile.botScreen.quick.routingSubtitle", "Hamyon va biznes yo‘nalish qatlami")}
                onPress={() => setActiveTab("control")}
              />
              <QuickActionCard
                width={heroCardWidth}
                icon={<Megaphone size={18} color={BLUE_2} />}
                title={tt("profile.botScreen.quick.public", "Ommaviy qatlam")}
                subtitle={tt("profile.botScreen.quick.publicSubtitle", "Nashr ma’lumotlari va ko‘rinish")}
                onPress={() => setActiveTab("public")}
              />
              <QuickActionCard
                width={heroCardWidth}
                icon={<Settings2 size={18} color={PINK} />}
                title={tt("profile.botScreen.quick.settings", "Sozlamalar")}
                subtitle={tt("profile.botScreen.quick.settingsSubtitle", "Buyruqlar, modullar va boshqaruv")}
                onPress={() => setActiveTab("control")}
              />
            </View>

            {form.created ? (
              <Pressable style={styles.focusCard} onPress={openCurrentBotChat}>
                <View style={styles.inlineActionLeft}>
                  <View style={styles.inlineActionIcon}>
                    <MessageCircleMore size={18} color={BLUE} />
                  </View>
                  <View style={styles.inlineTextWrap}>
                    <Text style={styles.focusCardTitle}>{tt("profile.botScreen.openChat.title", "Bot chatini ochish")}</Text>
                    <Text style={styles.focusCardSubtitle}>{tt("profile.botScreen.openChat.subtitle", "Bog‘langan bot xonasini ochish")}</Text>
                  </View>
                </View>
                <Text style={styles.focusCardArrow}>→</Text>
              </Pressable>
            ) : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
            {tabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)} style={[styles.tabButton, active && styles.tabButtonActive]}>
                  <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {activeTab === "overview" ? (
            <>
              <GlassSection title={tt("profile.botScreen.sections.identity.title", "Identitet qatlamlari")} subtitle={tt("profile.botScreen.sections.identity.subtitle", "Botning asosiy identitet bloki.")}>
                <View style={styles.gridWrap}>
                  {overviewCards.map((item) => (
                    <StatCard key={item.key} width={listCardWidth} label={item.label} value={item.value} accent={item.accent} />
                  ))}
                </View>
              </GlassSection>

              <GlassSection title={tt("profile.botScreen.sections.access.title", "Premium va AI rejasi")} subtitle={tt("profile.botScreen.sections.access.subtitle", "Hozir botga kirish faqat Premium. AI bilan chuqur bog‘lanish ishga tushgandan keyin qo‘shiladi.")}>
                <View style={styles.chipsWrap}>
                  <InfoChip icon={<Crown size={14} color={GOLD} />} label={tt("profile.botScreen.flags.premiumOnly", "Faqat Premium")} />
                  <InfoChip icon={<Sparkles size={14} color={BLUE_2} />} label={tt("profile.botScreen.flags.aiLater", "AI ishga tushgandan keyin")} />
                  <InfoChip icon={<ShieldCheck size={14} color={MINT} />} label={form.isActive ? tt("profile.botScreen.flags.active", "Faol") : tt("profile.botScreen.flags.paused", "To‘xtatilgan")} />
                </View>
              </GlassSection>

              <GlassSection title={tt("profile.botScreen.sections.routing.title", "Yo‘nalish xulosasi")} subtitle={tt("profile.botScreen.sections.routing.subtitle", "Savdo botlari SABI hamyonga yo‘naltiriladi. Biznes hamyon ishga tushguncha biznes botlari biznes yo‘nalish qatlamidan o‘tadi.")}>
                <View style={styles.gridWrap}>
                  <ReadOnlyCounterCard width={listCardWidth} icon={<Wallet size={16} color={GOLD} />} title={tt("profile.botScreen.routing.wallet", "Hamyon yo‘nalishi")} value={form.linkedWalletRoute || "—"} subtitle={tt("profile.botScreen.routing.walletSubtitle", "Savdo tushumlari SABI hamyonga boradi")}/>
                  <ReadOnlyCounterCard width={listCardWidth} icon={<BriefcaseBusiness size={16} color={PINK} />} title={tt("profile.botScreen.routing.business", "Biznes yo‘nalishi")} value={form.linkedBusinessPayRoute || "—"} subtitle={tt("profile.botScreen.routing.businessSubtitle", "Hozir biznes oqimlari biznes yo‘nalish qatlamidan foydalanadi")}/>
                </View>
              </GlassSection>
            </>
          ) : null}

          {activeTab === "public" ? (
            <>
              <GlassSection title={tt("profile.botScreen.sections.public.title", "Ommaviy")} subtitle={tt("profile.botScreen.sections.public.subtitle", "Nashr ma’lumotlari va ommaviy ko‘rinish.")}>
                <View style={styles.gridWrap}>
                  <StatCard width={listCardWidth} label={tt("profile.botScreen.stats.interactions", "Aloqalar")} value={String(form.interactionsCount)} accent={["#72E4CB", "#689AFF"]} />
                  <StatCard width={listCardWidth} label={tt("profile.botScreen.stats.orders", "Buyurtmalar")} value={String(form.ordersCount)} accent={["#9A8DFF", "#689AFF"]} />
                  <StatCard width={listCardWidth} label={tt("profile.botScreen.stats.history", "Tarix")} value={String(form.history.length)} accent={["#FFD66A", "#F3A93B"]} />
                  <StatCard width={listCardWidth} label={tt("profile.botScreen.stats.commands", "Buyruqlar")} value={String(form.commandsSummary.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean).length)} accent={["#FF9C88", "#FF6FA1"]} />
                </View>
              </GlassSection>

              <GlassSection title={tt("profile.botScreen.sections.publication.title", "Nashr va ommaviy qatlam")} subtitle={tt("profile.botScreen.sections.publication.subtitle", "Ommaviy/yopiq rejim va nashr qoidalari.")}>
                <ToggleRow icon={<Megaphone size={18} color={BLUE} />} title={tt("profile.botScreen.toggles.public", "Ommaviy bot")} subtitle={tt("profile.botScreen.toggles.publicSubtitle", "Bu botni ommaviy rejimda ishlatish.")} value={form.isPublic} onValueChange={(value) => setField("isPublic", value)} />
                <ToggleRow icon={<Megaphone size={18} color={MINT} />} title={tt("profile.botScreen.toggles.published", "Nashr yoqilgan")} subtitle={tt("profile.botScreen.toggles.publishedSubtitle", "Ommaviy nashr qatlamini yoqish.")} value={form.isPublished} onValueChange={(value) => setField("isPublished", value)} disabled={!form.isPublic} />
                <ToggleRow icon={<Link2 size={18} color={BLUE_2} />} title={tt("profile.botScreen.toggles.showInProfile", "Profilda ko‘rsatish")} subtitle={tt("profile.botScreen.toggles.showInProfileSubtitle", "Bot bo‘limini profil ichida ko‘rsatish.")} value={form.showInProfile} onValueChange={(value) => setField("showInProfile", value)} disabled={!form.isPublic} />
                <ToggleRow icon={<Hash size={18} color={BLUE} />} title={tt("profile.botScreen.toggles.searchable", "Katalogda qidiriladi")} subtitle={tt("profile.botScreen.toggles.searchableSubtitle", "Ommaviy topishga ruxsat berish.")} value={form.searchableInDirectory} onValueChange={(value) => setField("searchableInDirectory", value)} disabled={!form.isPublic} />
                <ToggleRow icon={<Link2 size={18} color={BLUE_2} />} title={tt("profile.botScreen.toggles.preview", "Ko‘rib chiqish yoqilgan")} subtitle={tt("profile.botScreen.toggles.previewSubtitle", "Profil va havolalarda ko‘rib chiqish kartalarini ko‘rsatish.")} value={form.previewEnabled} onValueChange={(value) => setField("previewEnabled", value)} />
                <ToggleRow icon={<Hash size={18} color={MINT} />} title={tt("profile.botScreen.toggles.discovery", "Tavsiya yuzalarida ko‘rinadi")} subtitle={tt("profile.botScreen.toggles.discoverySubtitle", "Topish yuzalarida ko‘rinishga ruxsat berish.")} value={form.visibleInDiscovery} onValueChange={(value) => setField("visibleInDiscovery", value)} disabled={!form.isPublic} />

                <CompactInput label={tt("profile.botScreen.publication.title", "Nashr sarlavhasi")} value={form.publicationTitle} onChangeText={(value) => setField("publicationTitle", value)} placeholder={tt("profile.botScreen.publication.titlePlaceholder", "Ommaviy sarlavha")} />
                <CompactInput label={tt("profile.botScreen.publication.subtitle", "Nashr subtitri")} value={form.publicationSubtitle} onChangeText={(value) => setField("publicationSubtitle", value)} placeholder={tt("profile.botScreen.publication.subtitlePlaceholder", "Qisqa ommaviy tavsif")} />
                <View style={styles.formGrid}>
                  <CompactInput label={tt("profile.botScreen.publication.slug", "Nashr manzili")} value={form.publicationSlug} onChangeText={(value) => setField("publicationSlug", sanitizeSlug(value))} placeholder="bot-nashr" />
                  <CompactInput label={tt("profile.botScreen.publication.tags", "Kalit so‘zlar")} value={form.publicationTags} onChangeText={(value) => setField("publicationTags", value)} placeholder="yordamchi, yordam" />
                </View>
                <CompactInput label={tt("profile.botScreen.publication.summary", "Nashr xulosasi")} value={form.publicationSummary} onChangeText={(value) => setField("publicationSummary", value)} placeholder={tt("profile.botScreen.publication.summaryPlaceholder", "Ommaviy karta uchun qisqa xulosa")} multiline />
                <View style={styles.formGrid}>
                  <CompactInput label={tt("profile.botScreen.publication.avatar", "Avatar havolasi")} value={form.avatarUri} onChangeText={(value) => setField("avatarUri", value)} placeholder="https://..." />
                  <CompactInput label={tt("profile.botScreen.publication.cover", "Muqova havolasi")} value={form.coverUri} onChangeText={(value) => setField("coverUri", value)} placeholder="https://..." />
                </View>
              </GlassSection>
            </>
          ) : null}

          {activeTab === "control" ? (
            <>
              <GlassSection title={tt("profile.botScreen.sections.owner.title", "Egasi ma’lumotlari")} subtitle={tt("profile.botScreen.sections.owner.subtitle", "Egasi ID bo‘sh bo‘lsa avtomatik yaratiladi.")}>
                <CompactInput label={tt("profile.botScreen.owner.name", "Egasi ismi")} value={form.ownerName} onChangeText={(value) => setField("ownerName", value)} placeholder={tt("profile.botScreen.owner.namePlaceholder", "Egasi")} />
                <CompactInput label={tt("profile.botScreen.owner.userId", "Egasi ID")} value={form.ownerUserId} onChangeText={(value) => setField("ownerUserId", value)} placeholder={tt("profile.botScreen.owner.userIdPlaceholder", "Avtomatik yaratiladi")} />
                <View style={styles.formGrid}>
                  <CompactInput label={tt("profile.botScreen.owner.role", "Egasi roli")} value={form.ownerRole} onChangeText={(value) => setField("ownerRole", value)} placeholder={tt("profile.botScreen.owner.rolePlaceholder", "Egasi")} />
                  <CompactInput label={tt("profile.botScreen.owner.phone", "Egasi telefoni")} value={form.ownerPhone} onChangeText={(value) => setField("ownerPhone", value)} placeholder="+998..." />
                </View>
                <CompactInput label={tt("profile.botScreen.owner.email", "Egasi emaili")} value={form.ownerEmail} onChangeText={(value) => setField("ownerEmail", value)} placeholder="owner@sabi.app" />
              </GlassSection>

              <GlassSection title={tt("profile.botScreen.sections.main.title", "Asosiy ma’lumotlar")} subtitle={tt("profile.botScreen.sections.main.subtitle", "Bot asosi, turi va buyruqlari.")}>
                <CompactInput label={tt("profile.botScreen.main.botName.label", "Bot nomi")} value={form.botName} onChangeText={(value) => setField("botName", value)} placeholder={tt("profile.botScreen.main.botName.placeholder", "Bot nomini kiriting")} />
                <CompactInput label={tt("profile.botScreen.main.username.label", "Foydalanuvchi nomi")} value={form.username} onChangeText={(value) => setField("username", sanitizeUsername(value))} placeholder={tt("profile.botScreen.main.username.placeholder", "bot_nomi")} prefix="@" />
                <CompactInput label={tt("profile.botScreen.main.description.label", "Tavsif")} value={form.description} onChangeText={(value) => setField("description", value)} placeholder={tt("profile.botScreen.main.description.placeholder", "Bot tavsifini yozing")} multiline />
                <View style={styles.formGrid}>
                  <CompactInput label={tt("profile.botScreen.main.kind.label", "Bot turi")} value={form.botKind} onChangeText={(value) => setField("botKind", value.toLowerCase())} placeholder={tt("profile.botScreen.main.kind.placeholder", "yordamchi / savdo / biznes / xizmat")} />
                  <CompactInput label={tt("profile.botScreen.main.botId", "Bot ID")} value={form.botId} onChangeText={(value) => setField("botId", value)} placeholder={tt("profile.botScreen.main.botIdPlaceholder", "Avtomatik yaratiladi")} />
                </View>
                <CompactInput label={tt("profile.botScreen.main.commands", "Buyruqlar")} value={form.commandsSummary} onChangeText={(value) => setField("commandsSummary", value)} placeholder="/boshlash, /yordam, /menyu" multiline />
                <CompactInput label={tt("profile.botScreen.main.modules", "Modullar")} value={form.modulesSummary} onChangeText={(value) => setField("modulesSummary", value)} placeholder="buyurtmalar, yordam, katalog" multiline />
              </GlassSection>

              <GlassSection title={tt("profile.botScreen.sections.control.title", "Bot boshqaruvi")} subtitle={tt("profile.botScreen.sections.control.subtitle", "Holat, buyruqlar va inline ishlash.")}>
                <ToggleRow icon={<ShieldCheck size={18} color={BLUE} />} title={tt("profile.botScreen.toggles.active", "Faol")} subtitle={tt("profile.botScreen.toggles.activeSubtitle", "Botni to‘xtatish yoki davom ettirish.")} value={form.isActive} onValueChange={(value) => setField("isActive", value)} />
                <ToggleRow icon={<Hash size={18} color={MINT} />} title={tt("profile.botScreen.toggles.acceptCommands", "Buyruqlarni qabul qilish")} subtitle={tt("profile.botScreen.toggles.acceptCommandsSubtitle", "Slash buyruqlarga ruxsat berish.")} value={form.acceptsCommands} onValueChange={(value) => setField("acceptsCommands", value)} />
                <ToggleRow icon={<Sparkles size={18} color={BLUE_2} />} title={tt("profile.botScreen.toggles.inline", "Inline rejim")} subtitle={tt("profile.botScreen.toggles.inlineSubtitle", "Chatlardan inline ishlatishga ruxsat berish.")} value={form.inlineModeEnabled} onValueChange={(value) => setField("inlineModeEnabled", value)} />
                <ToggleRow icon={<Bot size={18} color={PINK} />} title={tt("profile.botScreen.toggles.autoReply", "Avtojavob")} subtitle={tt("profile.botScreen.toggles.autoReplySubtitle", "Avtomatik javoblarga ruxsat berish.")} value={form.autoReplyEnabled} onValueChange={(value) => setField("autoReplyEnabled", value)} />
                <ToggleRow icon={<Wallet size={18} color={GOLD} />} title={tt("profile.botScreen.toggles.payments", "To‘lovlarga ruxsat")} subtitle={tt("profile.botScreen.toggles.paymentsSubtitle", "Savdo va biznes oqimlari uchun kerak.")} value={form.allowPayments} onValueChange={(value) => setField("allowPayments", value)} />
              </GlassSection>

              <GlassSection title={tt("profile.botScreen.sections.routing.title", "Yo‘nalishlar va bog‘lanishlar")} subtitle={tt("profile.botScreen.sections.routing.subtitle", "Savdo bot tushumlari SABI hamyonga boradi. Biznes bot tushumlari hozircha biznes yo‘nalish qatlamidan o‘tadi.")}>
                <CompactInput label={tt("profile.botScreen.routing.wallet", "Hamyon yo‘nalishi")} value={form.linkedWalletRoute} onChangeText={(value) => setField("linkedWalletRoute", value)} placeholder="sabi-wallet" />
                <CompactInput label={tt("profile.botScreen.routing.business", "Biznes yo‘nalishi")} value={form.linkedBusinessPayRoute} onChangeText={(value) => setField("linkedBusinessPayRoute", value)} placeholder="business-routing-layer" />
                <View style={styles.formGrid}>
                  <CompactInput label={tt("profile.botScreen.links.chatId", "Bog‘langan chat ID")} value={form.linkedChatId} onChangeText={(value) => setField("linkedChatId", value)} placeholder="bot:..." />
                  <CompactInput label={tt("profile.botScreen.links.publicationId", "Nashr ID")} value={form.linkedPublicationId} onChangeText={(value) => setField("linkedPublicationId", value)} placeholder="nashr_bot_..." />
                </View>
                <View style={styles.formGrid}>
                  <CompactInput label={tt("profile.botScreen.links.groupId", "Bog‘langan guruh ID")} value={form.linkedGroupId} onChangeText={(value) => setField("linkedGroupId", value)} placeholder="guruh_..." />
                  <CompactInput label={tt("profile.botScreen.links.channelId", "Bog‘langan kanal ID")} value={form.linkedChannelId} onChangeText={(value) => setField("linkedChannelId", value)} placeholder="kanal_..." />
                </View>
                <CompactInput label={tt("profile.botScreen.links.marketId", "Bog‘langan bozor ID")} value={form.linkedMarketId} onChangeText={(value) => setField("linkedMarketId", value)} placeholder="bozor_..." />
              </GlassSection>
            </>
          ) : null}

          {activeTab === "history" ? (
            <>
              <GlassSection title={tt("profile.botScreen.sections.historyStats.title", "Tarix statistikasi")} subtitle={tt("profile.botScreen.sections.historyStats.subtitle", "Egasi va yo‘nalishdagi so‘nggi o‘zgarishlar.")}>
                <View style={styles.gridWrap}>
                  <StatCard width={listCardWidth} label={tt("profile.botScreen.tabs.history", "Tarix")} value={String(form.history.length)} accent={["#72E4CB", "#689AFF"]} />
                  <StatCard width={listCardWidth} label={tt("profile.botScreen.stats.interactions", "Aloqalar")} value={String(form.interactionsCount)} accent={["#9A8DFF", "#689AFF"]} />
                  <StatCard width={listCardWidth} label={tt("profile.botScreen.stats.orders", "Buyurtmalar")} value={String(form.ordersCount)} accent={["#FFD66A", "#F3A93B"]} />
                  <StatCard width={listCardWidth} label={tt("profile.botScreen.stats.commands", "Buyruqlar")} value={String(form.commandsSummary.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean).length)} accent={["#FF9C88", "#FF6FA1"]} />
                </View>
              </GlassSection>

              <GlassSection title={tt("profile.botScreen.tabs.history", "Tarix")} subtitle={tt("profile.botScreen.history.subtitle", "Egasi va yo‘nalish bo‘yicha so‘nggi hodisalar.")}>
                {form.history.length ? (
                  <View style={styles.timelineWrap}>
                    {form.history.map((item, index) => (
                      <View key={item.id} style={[styles.timelineItem, index !== form.history.length - 1 && styles.timelineDivider]}>
                        <View style={styles.timelineDotWrap}>
                          <View style={[styles.timelineDot, timelineColor(item.kind)]} />
                        </View>
                        <View style={styles.timelineTextWrap}>
                          <Text style={styles.timelineTitle}>{item.title}</Text>
                          <Text style={styles.timelineSubtitle}>{item.subtitle}</Text>
                        </View>
                        <Text style={styles.timelineTime}>{formatRelativeTime(item.createdAt)}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <EmptyState title={tt("profile.botScreen.history.emptyTitle", "Hozircha bu yerda hech narsa yo‘q")} description={tt("profile.botScreen.history.emptySubtitle", "Amallar bajarilganda tarix shu yerda ko‘rinadi.")} />
                )}
              </GlassSection>
            </>
          ) : null}

          <View style={styles.bottomSpace} />
        </ScrollView>

        {form.created ? (
          <View style={styles.bottomBar}>
            <View style={styles.bottomActionsRow}>
              <Pressable style={[styles.secondaryButton, isSaving && styles.buttonDisabled]} disabled={isSaving} onPress={handleResetBot}>
                <Text style={styles.secondaryButtonText}>{tt("profile.botScreen.actions.reset", "Tiklash")}</Text>
              </Pressable>

              <Pressable style={[styles.primaryButton, styles.flexButton, isSaving && styles.buttonDisabled]} disabled={isSaving} onPress={handleSaveChanges}>
                <LinearGradient colors={[BLUE, BLUE_2]} style={styles.primaryButtonGradient}>
                  <Save size={18} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>{isSaving ? tt("profile.botScreen.actions.saving", "Saqlanmoqda...") : tt("profile.botScreen.actions.save", "Saqlash")}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </LinearGradient>
  );
}

function HeroChip(props: { width?: number; label: string; value: string; tone: "blue" | "mint" | "gold" | "pink" }) {
  const toneStyles = {
    blue: { backgroundColor: "rgba(58,113,255,0.10)", borderColor: "rgba(58,113,255,0.16)" },
    mint: { backgroundColor: "rgba(56,199,177,0.10)", borderColor: "rgba(56,199,177,0.16)" },
    gold: { backgroundColor: "rgba(243,169,59,0.10)", borderColor: "rgba(243,169,59,0.16)" },
    pink: { backgroundColor: "rgba(255,111,161,0.10)", borderColor: "rgba(255,111,161,0.16)" },
  }[props.tone];

  return (
    <View style={[styles.heroChip, props.width ? { width: props.width } : null, toneStyles]}>
      <Text style={styles.heroChipValue}>{props.value}</Text>
      <Text style={styles.heroChipLabel}>{props.label}</Text>
    </View>
  );
}

function QuickActionCard(props: {
  width: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.quickActionCard, { width: props.width }]} onPress={props.onPress}>
      <View style={styles.quickActionIcon}>{props.icon}</View>
      <Text style={styles.quickActionTitle}>{props.title}</Text>
      <Text style={styles.quickActionSubtitle}>{props.subtitle}</Text>
    </Pressable>
  );
}

function GlassSection(props: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{props.title}</Text>
        {!!props.subtitle ? <Text style={styles.sectionSubtitle}>{props.subtitle}</Text> : null}
      </View>
      {props.children}
    </View>
  );
}

function StatCard(props: { width: number; label: string; value: string; accent: [string, string] }) {
  return (
    <LinearGradient colors={props.accent} style={[styles.statCardWrap, { width: props.width }]}> 
      <View style={styles.statCardInner}>
        <Text style={styles.statCardValue}>{props.value}</Text>
        <Text style={styles.statCardLabel}>{props.label}</Text>
      </View>
    </LinearGradient>
  );
}

function ReadOnlyCounterCard(props: {
  width: number;
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <View style={[styles.readOnlyCard, { width: props.width }]}> 
      <View style={styles.inlineActionLeft}>
        <View style={styles.inlineActionIcon}>{props.icon}</View>
        <View style={styles.inlineTextWrap}>
          <Text style={styles.inlineActionTitle}>{props.title}</Text>
          <Text style={styles.readOnlyValue}>{props.value}</Text>
          <Text style={styles.inlineActionValue}>{props.subtitle}</Text>
        </View>
      </View>
    </View>
  );
}

function InfoChip(props: { width?: number; icon: React.ReactNode; label: string }) {
  return (
    <View style={[styles.infoChip, props.width ? { width: props.width } : null]}>
      {props.icon}
      <Text style={styles.infoChipText}>{props.label}</Text>
    </View>
  );
}

function CompactInput(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  prefix?: string;
}) {
  return (
    <View style={styles.inputBlock}>
      <Text style={styles.inputLabel}>{props.label}</Text>
      <View style={[styles.inputWrap, props.multiline && styles.inputWrapMultiline]}>
        {props.prefix ? <Text style={styles.inputPrefix}>{props.prefix}</Text> : null}
        <TextInput
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          placeholderTextColor="rgba(143,164,203,0.58)"
          style={[styles.input, props.multiline && styles.inputMultiline]}
          multiline={props.multiline}
          textAlignVertical={props.multiline ? "top" : "center"}
        />
      </View>
    </View>
  );
}

function ToggleRow(props: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, props.disabled && styles.toggleRowDisabled]}>
      <View style={styles.toggleLeft}>
        <View style={styles.toggleIcon}>{props.icon}</View>
        <View style={styles.toggleTextWrap}>
          <Text style={styles.toggleTitle}>{props.title}</Text>
          <Text style={styles.toggleSubtitle}>{props.subtitle}</Text>
        </View>
      </View>
      <Switch
        value={props.value}
        onValueChange={props.onValueChange}
        disabled={props.disabled}
        trackColor={{ false: "rgba(97,112,137,0.22)", true: BLUE }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function EmptyState(props: { title: string; description: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{props.title}</Text>
      <Text style={styles.emptyDescription}>{props.description}</Text>
    </View>
  );
}

function timelineColor(kind: BotHistoryEntry["kind"]) {
  switch (kind) {
    case "identity":
      return { backgroundColor: BLUE };
    case "publication":
      return { backgroundColor: MINT };
    case "routing":
      return { backgroundColor: GOLD };
    default:
      return { backgroundColor: BLUE_2 };
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_MID },
  safeArea: { flex: 1 },
  backgroundOrbOne: {
    position: "absolute",
    top: -90,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(84, 225, 193, 0.16)",
  },
  backgroundOrbTwo: {
    position: "absolute",
    bottom: -80,
    left: -50,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(111, 156, 255, 0.14)",
  },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: TEXT, fontSize: 16, fontWeight: "800" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: CARD_STRONG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: { flex: 1, paddingHorizontal: 12 },
  headerEyebrow: {
    color: MUTED_2,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.9,
    marginBottom: 2,
  },
  headerTitle: { color: TEXT, fontSize: 21, fontWeight: "900" },
  headerBadge: {
    minWidth: 88,
    minHeight: 36,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(111,156,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(132,168,255,0.20)",
  },
  headerBadgeText: { color: BLUE, fontSize: 11, fontWeight: "900" },
  content: { paddingHorizontal: 16, paddingBottom: 28, paddingTop: 2 },
  premiumBanner: { marginTop: 4, marginBottom: 14 },
  premiumBannerFill: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 14,
  },
  upgradeButton: {
    marginTop: 12,
    minHeight: 42,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeButtonText: { color: TEXT, fontSize: 13, fontWeight: "900" },
  createEntryCard: {
    marginTop: 4,
    marginBottom: 14,
    borderRadius: 28,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  createEntryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  createEntryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(17, 28, 52, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  createEntryTextWrap: { flex: 1 },
  createEntryTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "900",
  },
  createEntrySubtitle: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  createEntryInfoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 2,
    marginBottom: 14,
  },
  createEntryButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  createEntryButtonGradient: {
    minHeight: 54,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  createEntryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  groupShelfCard: {
    marginTop: 4,
    marginBottom: 14,
    borderRadius: 28,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  groupShelfHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  groupShelfTitleWrap: { flex: 1 },
  groupShelfTitle: { color: TEXT, fontSize: 18, fontWeight: "900" },
  groupShelfSubtitle: { color: MUTED, fontSize: 12, lineHeight: 18, fontWeight: "700", marginTop: 4 },
  groupShelfCreateButton: {
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 16,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    paddingVertical: 8,
  },
  groupShelfCreateButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  groupShelfGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  groupShelfItem: {
    minHeight: 84,
    borderRadius: 20,
    backgroundColor: "rgba(17, 28, 52, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  groupShelfItemActive: {
    borderColor: BLUE,
    backgroundColor: "rgba(34, 58, 108, 0.76)",
  },
  groupShelfAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(111,156,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  groupShelfAvatarImage: { width: "100%", height: "100%" },
  groupShelfAvatarText: { color: TEXT, fontSize: 18, fontWeight: "900" },
  groupShelfTextWrap: { flex: 1 },
  groupShelfItemTitle: { color: TEXT, fontSize: 14, fontWeight: "800" },
  groupShelfItemSubtitle: { color: MUTED, fontSize: 12, lineHeight: 17, fontWeight: "700", marginTop: 3 },
  groupShelfEmpty: {
    borderRadius: 20,
    backgroundColor: "rgba(17, 28, 52, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  groupShelfEmptyText: { color: MUTED, fontSize: 12, lineHeight: 18, fontWeight: "700" },
  heroCard: {
    marginTop: 4,
    marginBottom: 14,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },
  heroCoverWrap: { height: 156, position: "relative" },
  heroCoverImage: { width: "100%", height: "100%" },
  heroCoverFallback: { ...StyleSheet.absoluteFillObject },
  heroCoverShade: { ...StyleSheet.absoluteFillObject },
  heroMainRow: {
    paddingHorizontal: 16,
    marginTop: -34,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  avatarWrap: { width: 90, height: 90, position: "relative" },
  avatarRing: {
    width: 90,
    height: 90,
    borderRadius: 28,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: 84, height: 84, borderRadius: 24 },
  avatarFallback: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: "rgba(10, 18, 36, 0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: TEXT, fontSize: 34, fontWeight: "900" },
  heroBody: { flex: 1, paddingBottom: 8 },
  heroTitle: { color: TEXT, fontSize: 24, fontWeight: "900" },
  heroSubtitle: { color: MUTED, fontSize: 14, fontWeight: "700", marginTop: 4 },
  heroDescription: { color: MUTED_2, fontSize: 13, lineHeight: 18, fontWeight: "600", marginTop: 6 },
  heroStatsRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  heroChip: {
    minHeight: 46,
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    justifyContent: "center",
  },
  heroChipValue: { color: TEXT, fontSize: 15, fontWeight: "900" },
  heroChipLabel: { color: MUTED, fontSize: 11, fontWeight: "700", marginTop: 1 },
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickActionCard: {
    borderRadius: 22,
    backgroundColor: "rgba(17, 28, 52, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(66, 112, 180, 0.10)",
    padding: 14,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: CHIP,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickActionTitle: { color: TEXT, fontSize: 14, fontWeight: "800" },
  quickActionSubtitle: { color: MUTED, fontSize: 12, lineHeight: 17, fontWeight: "600", marginTop: 4 },
  tabsRow: { gap: 8, paddingRight: 8, paddingBottom: 2, marginBottom: 14 },
  tabButton: {
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: CARD_STRONG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  tabButtonText: { color: MUTED, fontSize: 13, fontWeight: "800" },
  tabButtonTextActive: { color: "#FFFFFF" },
  sectionCard: {
    marginBottom: 14,
    borderRadius: 28,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  sectionHeaderRow: { marginBottom: 14 },
  sectionTitle: { color: TEXT, fontSize: 19, fontWeight: "900" },
  sectionSubtitle: { color: MUTED, fontSize: 13, lineHeight: 19, fontWeight: "600", marginTop: 5 },
  statCardWrap: {
    borderRadius: 22,
    padding: 1,
  },
  statCardInner: {
    minHeight: 88,
    borderRadius: 21,
    backgroundColor: "rgba(10, 18, 36, 0.84)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "space-between",
  },
  statCardValue: { color: TEXT, fontSize: 24, fontWeight: "900" },
  statCardLabel: { color: MUTED, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  readOnlyCard: {
    minHeight: 104,
    borderRadius: 20,
    backgroundColor: "rgba(17, 28, 52, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "center",
  },
  inlineActionLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  inlineActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: CHIP,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineTextWrap: { flex: 1 },
  inlineActionTitle: { color: TEXT, fontSize: 14, fontWeight: "800" },
  inlineActionValue: { color: MUTED, fontSize: 12, lineHeight: 17, fontWeight: "700", marginTop: 4 },
  readOnlyValue: { color: TEXT, fontSize: 22, fontWeight: "900", marginTop: 4 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  infoChip: {
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: "rgba(17, 28, 52, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoChipText: { color: TEXT, fontSize: 12, fontWeight: "800" },
  focusCard: {
    minHeight: 72,
    borderRadius: 22,
    paddingHorizontal: 14,
    backgroundColor: "rgba(17, 28, 52, 0.76)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  focusCardTitle: { color: MUTED, fontSize: 12, fontWeight: "800" },
  focusCardSubtitle: { color: TEXT, fontSize: 15, fontWeight: "900", marginTop: 4 },
  focusCardArrow: { color: BLUE, fontSize: 24, fontWeight: "900" },
  formGrid: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  inputBlock: { marginBottom: 12, flex: 1 },
  inputLabel: { color: TEXT, fontSize: 13, fontWeight: "800", marginBottom: 8 },
  inputWrap: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "rgba(17, 28, 52, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapMultiline: { minHeight: 102, paddingTop: 14, alignItems: "flex-start" },
  inputPrefix: { color: MUTED_2, fontSize: 16, fontWeight: "800", marginRight: 4 },
  input: { flex: 1, color: TEXT, fontSize: 15, fontWeight: "700" },
  inputMultiline: { minHeight: 72 },
  toggleRow: {
    minHeight: 72,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "rgba(17, 28, 52, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  toggleRowDisabled: { opacity: 0.48 },
  toggleLeft: { flex: 1, flexDirection: "row", alignItems: "center" },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: CHIP,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  toggleTextWrap: { flex: 1 },
  toggleTitle: { color: TEXT, fontSize: 14, fontWeight: "800", marginBottom: 4 },
  toggleSubtitle: { color: MUTED, fontSize: 12, lineHeight: 17, fontWeight: "600" },
  emptyState: {
    borderRadius: 22,
    backgroundColor: "rgba(14, 23, 43, 0.74)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  emptyTitle: { color: TEXT, fontSize: 14, fontWeight: "800", marginBottom: 6 },
  emptyDescription: { color: MUTED, fontSize: 12, lineHeight: 18, fontWeight: "600" },
  timelineWrap: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "rgba(14, 23, 43, 0.74)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
  },
  timelineItem: {
    minHeight: 74,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  timelineDivider: { borderBottomWidth: 1, borderBottomColor: "rgba(66,112,180,0.08)" },
  timelineDotWrap: { paddingTop: 4 },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  timelineTextWrap: { flex: 1 },
  timelineTitle: { color: TEXT, fontSize: 14, fontWeight: "800" },
  timelineSubtitle: { color: MUTED, fontSize: 12, lineHeight: 17, fontWeight: "600", marginTop: 4 },
  timelineTime: { color: MUTED_2, fontSize: 11, fontWeight: "700", paddingTop: 2 },
  bottomSpace: { height: 110 },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: "rgba(17, 28, 52, 0.76)",
    borderTopWidth: 1,
    borderTopColor: "rgba(66,112,180,0.10)",
  },
  bottomActionsRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  primaryButton: { borderRadius: 22, overflow: "hidden" },
  flexButton: { flex: 1 },
  primaryButtonGradient: {
    minHeight: 56,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  secondaryButton: {
    minWidth: 110,
    minHeight: 56,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    backgroundColor: "rgba(17, 28, 52, 0.86)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
  },
  secondaryButtonText: { color: TEXT, fontSize: 15, fontWeight: "800" },
  buttonDisabled: { opacity: 0.65 },
});
