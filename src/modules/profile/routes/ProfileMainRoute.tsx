import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { openSabiHome } from "@/modules/home/navigation/homeRoutes";
import {
  BadgeCheck,
  Bell,
  Bot,
  BriefcaseBusiness,
  ChevronRight,
  Crown,
  CreditCard,
  Database,
  Gamepad2,
  Gift,
  Hash,
  Heart,
  Images,
  Languages,
  Link2,
  Lock,
  LogOut,
  Mic,
  Music2,
  Palette,
  QrCode,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  User,
  Users,
  Video,
  Wallet,
} from "lucide-react-native";

import { useI18n } from "@/shared/i18n";
import { useAuthSession } from "@/core/kernel/auth/use-auth-session";
import { resetAuthenticatedSession } from "@/core/kernel/auth/session.actions";
import {
  deleteAuthenticatedAccount,
  logoutAuthenticatedSession,
} from "@/shared/api/auth-api";
import { shutdownMessengerKernel } from "@/core/kernel/messenger";
import {
  PROFILE_DEVICE_SESSIONS,
  PROFILE_KYC_STATE,
  PROFILE_LAUNCH_OFFER,
  PROFILE_TRUSTED_LIST,
  PROFILE_USER,
} from "@/modules/profile/data/profile";
import { useProfileRuntime } from "@/modules/profile/data/profileRuntime";
import { useProfileKernel } from "@/core/kernel/profile/bindings";
import { profileKernelFacade } from "@/core/kernel/profile";
import { hydratePublicProfile, hydratePublicProfileStorage, subscribePublicProfiles } from "@/modules/messenger/public/publicProfileRuntime";
import { syncCurrentProfilePublicSurface, syncCurrentProfilePublicSurfaceToBackend } from "@/modules/messenger/public/publicProfileSync";



function isTemporaryDevAccessToken(value?: string | null) {
  return typeof value === "string" && value.trim().startsWith("temp-token-");
}

function getBackendSessionFromAuth(auth: {
  apiBaseUrl?: string | null;
  accessToken?: string | null;
}) {
  const apiBaseUrl =
    typeof auth.apiBaseUrl === "string" && auth.apiBaseUrl.trim()
      ? auth.apiBaseUrl.trim()
      : null;
  const accessToken =
    typeof auth.accessToken === "string" && auth.accessToken.trim()
      ? auth.accessToken.trim()
      : null;

  if (!accessToken) {
    return null;
  }

  return {
    apiBaseUrl,
    accessToken,
  };
}

const BG_TOP = "#04120D";
const BG_MID = "#062018";
const BG_BOTTOM = "#08261E";
const CARD = "rgba(14, 28, 46, 0.86)";
const CARD_ALT = "rgba(20, 39, 58, 0.84)";
const CARD_BORDER = "rgba(120, 220, 160, 0.14)";
const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";
const SOFT = "#DCEAF5";
const GREEN = "#77E28C";
const TEAL = "#58D5C9";
const BLUE = "#63A8FF";
const PURPLE = "#B588FF";
const GOLD = "#FFCC66";
const PINK = "#FF8FB9";
const RED = "#FF6B7A";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

type HubRow = {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route?: string;
  badge?: string;
};

type SurfaceCard = {
  key: string;
  title: string;
  subtitle: string;
  stat: string;
  icon: React.ReactNode;
  route: string;
};

type GroupProfilePreview = {
  created: boolean;
  groupId: string;
  groupName: string;
  username: string;
  isPublic: boolean;
  isPublished: boolean;
  ownerUserId: string;
  linkedPublicationId: string;
};

type ChannelProfilePreview = {
  created: boolean;
  channelId: string;
  channelName: string;
  username: string;
  isPublic: boolean;
  isPublished: boolean;
  ownerUserId: string;
  linkedPublicationId: string;
};

type BotProfilePreview = {
  created: boolean;
  botId: string;
  botName: string;
  username: string;
  botKind: string;
  isPublic: boolean;
  isPublished: boolean;
  ownerUserId: string;
};

const EMPTY_GROUP_PREVIEW: GroupProfilePreview = {
  created: false,
  groupId: "",
  groupName: "",
  username: "",
  isPublic: false,
  isPublished: false,
  ownerUserId: "",
  linkedPublicationId: "",
};

const EMPTY_CHANNEL_PREVIEW: ChannelProfilePreview = {
  created: false,
  channelId: "",
  channelName: "",
  username: "",
  isPublic: false,
  isPublished: false,
  ownerUserId: "",
  linkedPublicationId: "",
};

const EMPTY_BOT_PREVIEW: BotProfilePreview = {
  created: false,
  botId: "",
  botName: "",
  username: "",
  botKind: "",
  isPublic: false,
  isPublished: false,
  ownerUserId: "",
};

function normalizeEnumKey(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function formatBotKindLabel(value?: string | null) {
  const kind = normalizeEnumKey(value);
  if (kind === "business") return "Business";
  if (kind === "service") return "Service";
  if (kind === "assistant") return "Assistant";
  return "Bot";
}

function extractFirstLetter(value?: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const match = raw.match(/\p{L}/u);
  return match ? match[0].toUpperCase() : "";
}

function buildDisplayFullName(params: {
  firstName?: string | null;
  lastName?: string | null;
  fallback: string;
}) {
  const fullName = [params.firstName?.trim(), params.lastName?.trim()]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || params.fallback;
}

function buildDisplayUsername(username?: string | null, fallback?: string | null) {
  const normalized = String(username ?? "")
    .trim()
    .replace(/^@+/, "");

  if (normalized) {
    return `@${normalized}`;
  }

  return fallback || "@";
}

function buildStableTenDigits(source: string) {
  const normalized = source.trim();

  if (!normalized) {
    return "0000000000";
  }

  let hash = 0n;

  for (const symbol of normalized) {
    const codePoint = symbol.codePointAt(0) ?? 0;
    hash = (hash * 131n + BigInt(codePoint)) % 10000000000n;
  }

  return hash.toString().padStart(10, "0");
}

function buildDisplaySabiId(params: {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  userId?: string | null;
  fallback: string;
}) {
  const firstInitial =
    extractFirstLetter(params.firstName) ||
    extractFirstLetter(params.username) ||
    "S";

  const secondInitial =
    extractFirstLetter(params.lastName) ||
    extractFirstLetter(
      String(params.username ?? "")
        .trim()
        .replace(/^@+/, "")
        .slice(1),
    ) ||
    "B";

  const digits = buildStableTenDigits(
    [
      String(params.userId ?? "").trim(),
      String(params.firstName ?? "").trim(),
      String(params.lastName ?? "").trim(),
      String(params.username ?? "").trim(),
    ]
      .filter(Boolean)
      .join("|"),
  );

  const result = `${firstInitial}${secondInitial}${digits}`.trim();
  return result || params.fallback;
}

function PremiumGlyph({
  icon,
  colors,
  borderColor,
}: {
  icon: React.ReactNode;
  colors: [string, string];
  borderColor?: string;
}) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.premiumGlyph, borderColor ? { borderColor } : null]}
    >
      <View style={styles.premiumGlyphInner}>{icon}</View>
    </LinearGradient>
  );
}

function AIGlyph({ size = 18 }: { size?: number }) {
  return (
    <View style={styles.aiGlyphWrap}>
      <LinearGradient
        colors={["rgba(181,136,255,0.98)", "rgba(88,213,201,0.98)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.aiGlyphOrb}
      >
        <Sparkles size={size} color="#F7FDFF" strokeWidth={2.5} />
      </LinearGradient>
      <View style={styles.aiGlyphDot} />
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      {label ? <Text style={styles.miniStatLabel}>{label}</Text> : null}
      <Text style={styles.miniStatValue}>{value}</Text>
    </View>
  );
}

function QuickAction({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  if (!title) return null;

  return (
    <Pressable onPress={onPress} style={styles.quickAction}>
      {icon}
      <Text style={styles.quickActionText}>{title}</Text>
    </Pressable>
  );
}

function SurfaceStrip({
  title,
  items,
}: {
  title: string;
  items: SurfaceCard[];
}) {
  if (!title || !items.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.surfaceRow}
      >
        {items.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => router.push(item.route as never)}
          >
            <LinearGradient
              colors={["rgba(22,40,62,0.94)", "rgba(10,27,34,0.94)"]}
              style={styles.surfaceCard}
            >
              {item.icon}
              <Text style={styles.surfaceTitle}>{item.title}</Text>
              {item.subtitle ? (
                <Text style={styles.surfaceSubtitle}>{item.subtitle}</Text>
              ) : null}
              {item.stat ? (
                <Text style={styles.surfaceStat}>{item.stat}</Text>
              ) : null}
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function Section({ title, rows }: { title: string; rows: HubRow[] }) {
  if (!title || !rows.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.groupCard}>
        {rows.map((row, index) => {
          const content = (
            <>
              <View style={styles.rowIcon}>{row.icon}</View>

              <View style={styles.rowTextWrap}>
                <Text style={styles.rowTitle}>{row.title}</Text>
                {row.description ? (
                  <Text style={styles.rowDescription}>{row.description}</Text>
                ) : null}
              </View>

              {row.badge ? (
                <View style={styles.badgeWrap}>
                  <Text style={styles.badgeText}>{row.badge}</Text>
                </View>
              ) : (
                <ChevronRight size={16} color={MUTED} strokeWidth={2.4} />
              )}
            </>
          );

          if (row.route) {
            return (
              <Pressable
                key={row.key}
                onPress={() => router.push(row.route as never)}
                style={[styles.row, index !== rows.length - 1 && styles.rowBorder]}
              >
                {content}
              </Pressable>
            );
          }

          return (
            <View
              key={row.key}
              style={[styles.row, index !== rows.length - 1 && styles.rowBorder]}
            >
              {content}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const i18n = useI18n() as I18nHookValue;
  const auth = useAuthSession();
  const runtime = useProfileRuntime();
  const profileKernel = useProfileKernel();
  const groupPreview = profileKernel.groupPreview;
  const channelPreview = profileKernel.channelPreview;
  const botPreview = profileKernel.botPreview;
  const ownerProfile = profileKernel.account.userId
    ? {
        phone: profileKernel.account.phone,
        firstName: profileKernel.account.firstName,
        lastName: profileKernel.account.lastName,
        username: profileKernel.account.username,
        userId: profileKernel.account.userId,
        sabiDisplayId: profileKernel.account.sabiDisplayId,
        profileCompleted: profileKernel.account.profileCompleted,
        createdAt: profileKernel.account.createdAt || new Date().toISOString(),
        updatedAt: profileKernel.account.updatedAt || new Date().toISOString(),
      }
    : null;
  const [signingOut, setSigningOut] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

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
    (key: string, params?: Record<string, unknown>) => {
      const translated = t(key, params);
      return translated === key ? "" : translated;
    },
    [t],
  );

  const te = useCallback(
    (prefix: string, rawValue?: string | null) => {
      const suffix = normalizeEnumKey(rawValue);
      if (!suffix) return "";

      const key = `${prefix}.${suffix}`;
      const translated = t(key);
      return translated === key ? "" : translated;
    },
    [t],
  );

  const { photoCount, shortVideoCount, likesCount, mediaCount, linksCount, voiceCount, reactionCount } = profileKernel.counts;
  const [publicSurfaceRevision, setPublicSurfaceRevision] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void profileKernelFacade
        .refresh()
        .then(() => {
          if (!active) return;

          const state = profileKernelFacade.getState();
          const surface = syncCurrentProfilePublicSurface(state);
          if (surface) setPublicSurfaceRevision((value) => value + 1);

          return syncCurrentProfilePublicSurfaceToBackend(state);
        })
        .then((saved) => {
          if (active && saved) setPublicSurfaceRevision((value) => value + 1);
        })
        .catch(() => {});

      return () => {
        active = false;
      };
    }, []),
  );

  useEffect(() => {
    let mounted = true;

    void hydratePublicProfileStorage().then(() => {
      if (mounted) setPublicSurfaceRevision((value) => value + 1);
    });

    const unsubscribe = subscribePublicProfiles(() => {
      setPublicSurfaceRevision((value) => value + 1);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const ownPublicSurface = useMemo(() => {
    const account = profileKernel.account;
    const aliases = [
      account.userId,
      account.sabiDisplayId,
      account.username,
      account.username ? `@${String(account.username).replace(/^@+/, "")}` : "",
      account.phone,
    ]
      .map((value) => String(value || "").trim())
      .filter(Boolean);

    for (const alias of aliases) {
      const snapshot = hydratePublicProfile(alias);
      if (
        snapshot &&
        (snapshot.updatedAt > 0 ||
          snapshot.likesCount > 0 ||
          snapshot.publicationPhotos.length > 0 ||
          snapshot.publicationVideos.length > 0)
      ) {
        return snapshot;
      }
    }

    return null;
  }, [profileKernel.account, publicSurfaceRevision]);

  const ownLikedMediaCount = useMemo(() => {
    const photos = Array.isArray(ownPublicSurface?.publicationPhotos) ? ownPublicSurface.publicationPhotos : [];
    const videos = Array.isArray(ownPublicSurface?.publicationVideos) ? ownPublicSurface.publicationVideos : [];
    return [...photos, ...videos].filter((item) => Boolean(item?.liked)).length;
  }, [ownPublicSurface]);

  const effectiveLikesCount = Math.max(
    Number(likesCount || 0),
    Number(ownPublicSurface?.likesCount || 0),
    ownLikedMediaCount,
  );

  const ownerFirstName = ownerProfile?.firstName ?? "";
  const ownerLastName = ownerProfile?.lastName ?? "";
  const ownerUsername = ownerProfile?.username ?? "";
  const ownerUserId = ownerProfile?.userId ?? auth.currentUserId ?? "";

  const displayFullName = buildDisplayFullName({
    firstName: ownerFirstName,
    lastName: ownerLastName,
    fallback: profileKernel.account.fullName || "Sabi User",
  });

  const displayUsername = buildDisplayUsername(ownerUsername || profileKernel.account.username, "@sabi");

  const displaySabiId = buildDisplaySabiId({
    firstName: ownerFirstName,
    lastName: ownerLastName,
    username: ownerUsername,
    userId: ownerUserId,
    fallback: profileKernel.account.sabiDisplayId || "SB0000000000",
  });

  const displayAvatarLetter =
    extractFirstLetter(ownerFirstName) ||
    extractFirstLetter(ownerLastName) ||
    extractFirstLetter(ownerUsername) ||
    extractFirstLetter(profileKernel.account.avatarLetter) ||
    "S";

  const avatarUri = runtime.avatarUri ?? profileKernel.account.avatarUri ?? null;
  const displayBio = profileKernel.account.bio || "";

  const clearLocalAccountState = useCallback(async () => {
    await shutdownMessengerKernel().catch((error) => {
      console.warn(
        "[profile] messenger kernel shutdown failed during account clear",
        error instanceof Error ? error.message : error,
      );
    });

    await profileKernelFacade.signOut();
    await resetAuthenticatedSession();
  }, []);

  const completeLogoutFlow = useCallback(async () => {
    if (signingOut || deletingAccount) return;

    try {
      setSigningOut(true);

      const backendSession = getBackendSessionFromAuth(auth);

      if (
        backendSession &&
        !isTemporaryDevAccessToken(backendSession.accessToken)
      ) {
        await logoutAuthenticatedSession(backendSession);
      }

      await clearLocalAccountState();
      router.replace("/");
    } catch (error) {
      console.warn(
        "[profile] logout failed",
        error instanceof Error ? error.message : error,
      );

      await clearLocalAccountState();
      router.replace("/");
    } finally {
      setSigningOut(false);
    }
  }, [auth, clearLocalAccountState, deletingAccount, signingOut]);

  const completeDeleteFlow = useCallback(async () => {
    if (deletingAccount || signingOut) return;

    try {
      setDeletingAccount(true);

      const backendSession = getBackendSessionFromAuth(auth);

      if (
        backendSession &&
        !isTemporaryDevAccessToken(backendSession.accessToken)
      ) {
        await deleteAuthenticatedAccount(backendSession);
      }

      await clearLocalAccountState();
      router.replace("/");
    } catch (error) {
      Alert.alert(
        tt("profile.accountActions.delete.title") || "Delete account data",
        error instanceof Error
          ? error.message
          : tt("profile.accountActions.delete.error") ||
              "Could not delete the account on the server.",
      );
    } finally {
      setDeletingAccount(false);
    }
  }, [auth, clearLocalAccountState, deletingAccount, signingOut, tt]);

  const handleLogout = useCallback(() => {
    const title = tt("profile.accountActions.logout.title") || "Sign out";
    const message =
      tt("profile.accountActions.logout.description") ||
      "This will clear the current session and return you to the welcome screen.";
    const cancelText = tt("common.cancel") || "Cancel";
    const confirmText = tt("profile.accountActions.logout.confirm") || "Sign out";

    Alert.alert(title, message, [
      { text: cancelText, style: "cancel" },
      {
        text: confirmText,
        style: "destructive",
        onPress: () => {
          void completeLogoutFlow();
        },
      },
    ]);
  }, [completeLogoutFlow, tt]);

  const handleDeleteAccount = useCallback(() => {
    const title = tt("profile.accountActions.delete.title") || "Delete account data";
    const message =
      tt("profile.accountActions.delete.description") ||
      "This will clear account session and local account data on this device, then return to the welcome screen.";
    const cancelText = tt("common.cancel") || "Cancel";
    const confirmText = tt("profile.accountActions.delete.confirm") || "Delete";

    Alert.alert(title, message, [
      { text: cancelText, style: "cancel" },
      {
        text: confirmText,
        style: "destructive",
        onPress: () => {
          void completeDeleteFlow();
        },
      },
    ]);
  }, [completeDeleteFlow, tt]);

  const groupBadge = useMemo(() => {
    if (!groupPreview.created) return "";

    const published = tt("profile.group.badges.published") || "Published";
    const publicText = tt("profile.group.badges.public") || "Public";
    const privateText = tt("profile.group.badges.private") || "Private";

    if (groupPreview.isPublished) return published;
    return groupPreview.isPublic ? publicText : privateText;
  }, [groupPreview.created, groupPreview.isPublic, groupPreview.isPublished, tt]);

  const channelBadge = useMemo(() => {
    if (!channelPreview.created) return "";

    const published = tt("profile.channel.badges.published") || "Published";
    const publicText = tt("profile.channel.badges.public") || "Public";
    const privateText = tt("profile.channel.badges.private") || "Private";

    if (channelPreview.isPublished) return published;
    return channelPreview.isPublic ? publicText : privateText;
  }, [channelPreview.created, channelPreview.isPublic, channelPreview.isPublished, tt]);

  const botBadge = useMemo(() => {
    if (!botPreview.created) return "";

    const translatedKind = te("profile.bot.badges", botPreview.botKind);
    if (translatedKind) return translatedKind;

    const published = tt("profile.bot.badges.published") || "Published";
    const publicText = tt("profile.bot.badges.public") || "Public";
    const privateText = tt("profile.bot.badges.private") || "Private";

    if (botPreview.botKind) return formatBotKindLabel(botPreview.botKind);
    if (botPreview.isPublished) return published;
    return botPreview.isPublic ? publicText : privateText;
  }, [botPreview.botKind, botPreview.created, botPreview.isPublic, botPreview.isPublished, te, tt]);

  const identitySurface = useMemo<SurfaceCard[]>(
    () =>
      [
        {
          key: "photos",
          title: tt("profile.surface.photos.title"),
          subtitle: tt("profile.surface.photos.subtitle"),
          stat: photoCount
            ? `${photoCount} ${tt("profile.surface.photos.stat")}`.trim()
            : "",
          icon: (
            <PremiumGlyph
              colors={["rgba(88,213,201,0.32)", "rgba(99,168,255,0.26)"]}
              borderColor="rgba(88,213,201,0.20)"
              icon={<Images size={18} color={TEAL} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/photos",
        },
        {
          key: "shortVideos",
          title: tt("profile.surface.shortVideos.title"),
          subtitle: tt("profile.surface.shortVideos.subtitle"),
          stat: shortVideoCount
            ? `${shortVideoCount} ${tt("profile.surface.shortVideos.stat")}`.trim()
            : "",
          icon: (
            <PremiumGlyph
              colors={["rgba(99,168,255,0.32)", "rgba(181,136,255,0.26)"]}
              borderColor="rgba(99,168,255,0.20)"
              icon={<Video size={18} color={BLUE} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/short-videos",
        },
        {
          key: "likes",
          title: tt("profile.surface.likes.title"),
          subtitle: tt("profile.surface.likes.subtitle"),
          stat: `${effectiveLikesCount} ${tt("profile.surface.likes.stat")}`.trim(),
          icon: (
            <PremiumGlyph
              colors={["rgba(255,204,102,0.34)", "rgba(255,143,185,0.28)"]}
              borderColor="rgba(255,204,102,0.20)"
              icon={<Heart size={18} color={GOLD} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/likes",
        },
        {
          key: "reactions",
          title: tt("profile.surface.reactions.title"),
          subtitle: tt("profile.surface.reactions.subtitle"),
          stat: `${reactionCount} ${tt("profile.surface.reactions.stat")}`.trim(),
          icon: (
            <PremiumGlyph
              colors={["rgba(181,136,255,0.32)", "rgba(88,213,201,0.24)"]}
              borderColor="rgba(181,136,255,0.20)"
              icon={<AIGlyph size={16} />}
            />
          ),
          route: "/profile/reactions",
        },
      ].filter((item) => item.title),
    [effectiveLikesCount, photoCount, reactionCount, shortVideoCount, tt],
  );

  const sharedActivity = useMemo<SurfaceCard[]>(
    () =>
      [
        {
          key: "media",
          title: tt("profile.activity.media.title"),
          subtitle: tt("profile.activity.media.subtitle"),
          stat: `${mediaCount} ${tt("profile.activity.media.stat")}`.trim(),
          icon: (
            <PremiumGlyph
              colors={["rgba(88,213,201,0.32)", "rgba(99,168,255,0.26)"]}
              borderColor="rgba(88,213,201,0.20)"
              icon={<Images size={18} color={TEAL} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/media",
        },
        {
          key: "links",
          title: tt("profile.activity.links.title"),
          subtitle: tt("profile.activity.links.subtitle"),
          stat: `${linksCount} ${tt("profile.activity.links.stat")}`.trim(),
          icon: (
            <PremiumGlyph
              colors={["rgba(181,136,255,0.32)", "rgba(99,168,255,0.26)"]}
              borderColor="rgba(181,136,255,0.20)"
              icon={<Link2 size={18} color={PURPLE} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/links",
        },
        {
          key: "voice",
          title: tt("profile.activity.voice.title"),
          subtitle: tt("profile.activity.voice.subtitle"),
          stat: `${voiceCount} ${tt("profile.activity.voice.stat")}`.trim(),
          icon: (
            <PremiumGlyph
              colors={["rgba(119,226,140,0.30)", "rgba(88,213,201,0.24)"]}
              borderColor="rgba(119,226,140,0.18)"
              icon={<Mic size={18} color={GREEN} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/voice",
        },
      ].filter((item) => item.title),
    [linksCount, mediaCount, tt, voiceCount],
  );

  const ownerRows = useMemo<HubRow[]>(
    () =>
      [
        {
          key: "group",
          title: groupPreview.created
            ? tt("profile.group.manage.title") || "Manage group"
            : tt("profile.group.create.title") || "Create group",
          description: groupPreview.created
            ? tt("profile.group.manage.description") || "Publication and owner settings for your group."
            : tt("profile.group.create.description") || "Create and bind your group through profile.",
          icon: (
            <PremiumGlyph
              colors={["rgba(88,213,201,0.32)", "rgba(99,168,255,0.24)"]}
              borderColor="rgba(88,213,201,0.20)"
              icon={<Users size={18} color={TEAL} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/group",
          badge: groupBadge || undefined,
        },
        {
          key: "channel",
          title: channelPreview.created
            ? tt("profile.channel.manage.title") || "Manage channel"
            : tt("profile.channel.create.title") || "Create channel",
          description: channelPreview.created
            ? tt("profile.channel.manage.description") || "Publication, media and owner settings for your channel."
            : tt("profile.channel.create.description") || "Create and manage your channel through profile.",
          icon: (
            <PremiumGlyph
              colors={["rgba(99,168,255,0.32)", "rgba(181,136,255,0.24)"]}
              borderColor="rgba(99,168,255,0.20)"
              icon={<Hash size={18} color={BLUE} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/channels",
          badge: channelBadge || undefined,
        },
        {
          key: "bot",
          title: botPreview.created
            ? tt("profile.bot.manage.title") || "Manage bot"
            : tt("profile.bot.create.title") || "Create bot",
          description: botPreview.created
            ? tt("profile.bot.manage.description") || "Owner settings, routing and profile binding for your bot."
            : tt("profile.bot.create.description") || "Create and manage your bot through profile.",
          icon: (
            <PremiumGlyph
              colors={["rgba(181,136,255,0.32)", "rgba(88,213,201,0.24)"]}
              borderColor="rgba(181,136,255,0.20)"
              icon={<Bot size={18} color={PURPLE} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/bot",
          badge: botBadge || undefined,
        },
      ].filter((item) => item.title),
    [
      botBadge,
      botPreview.created,
      channelBadge,
      channelPreview.created,
      groupBadge,
      groupPreview.created,
      tt,
    ],
  );

  const accountRows = useMemo<HubRow[]>(
    () =>
      [
        {
          key: "edit",
          title: tt("profile.account.edit.title"),
          description: tt("profile.account.edit.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(88,213,201,0.32)", "rgba(99,168,255,0.26)"]}
              borderColor="rgba(88,213,201,0.20)"
              icon={<User size={18} color={TEAL} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/edit",
        },
        {
          key: "verification",
          title: tt("profile.account.verification.title"),
          description: tt("profile.account.verification.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(99,168,255,0.32)", "rgba(88,213,201,0.22)"]}
              borderColor="rgba(99,168,255,0.20)"
              icon={<BadgeCheck size={18} color={BLUE} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/verification",
          badge:
            te("profile.account.verification.badges", PROFILE_KYC_STATE.kycLevel) ||
            undefined,
        },
        {
          key: "devices",
          title: tt("profile.account.devices.title"),
          description: tt("profile.account.devices.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(119,226,140,0.30)", "rgba(88,213,201,0.24)"]}
              borderColor="rgba(119,226,140,0.18)"
              icon={<Smartphone size={18} color={GREEN} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/devices",
          badge: `${PROFILE_DEVICE_SESSIONS.length}`,
        },
        {
          key: "trusted",
          title: tt("profile.account.trusted.title"),
          description: tt("profile.account.trusted.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(181,136,255,0.32)", "rgba(99,168,255,0.26)"]}
              borderColor="rgba(181,136,255,0.20)"
              icon={<ShieldCheck size={18} color={PURPLE} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/trusted",
          badge: `${PROFILE_TRUSTED_LIST.length} ${tt(
            "profile.account.trusted.badgeSuffix",
          )}`.trim(),
        },
      ].filter((item) => item.title),
    [te, tt],
  );

  const privacyRows = useMemo<HubRow[]>(
    () =>
      [
        {
          key: "privacy",
          title: tt("profile.privacy.privacy.title"),
          description: tt("profile.privacy.privacy.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(99,168,255,0.32)", "rgba(181,136,255,0.22)"]}
              borderColor="rgba(99,168,255,0.20)"
              icon={<Lock size={18} color={BLUE} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/privacy",
        },
        {
          key: "security",
          title: tt("profile.privacy.security.title"),
          description: tt("profile.privacy.security.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(119,226,140,0.30)", "rgba(88,213,201,0.24)"]}
              borderColor="rgba(119,226,140,0.18)"
              icon={<ShieldCheck size={18} color={GREEN} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/security",
        },
        {
          key: "data",
          title: tt("profile.privacy.data.title"),
          description: tt("profile.privacy.data.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(88,213,201,0.32)", "rgba(99,168,255,0.22)"]}
              borderColor="rgba(88,213,201,0.20)"
              icon={<Database size={18} color={TEAL} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/data-management",
        },
        {
          key: "qr",
          title: tt("profile.privacy.qr.title"),
          description: tt("profile.privacy.qr.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(181,136,255,0.32)", "rgba(88,213,201,0.22)"]}
              borderColor="rgba(181,136,255,0.20)"
              icon={<QrCode size={18} color={PURPLE} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/qr",
        },
      ].filter((item) => item.title),
    [tt],
  );

  const appRows = useMemo<HubRow[]>(
    () =>
      [
        {
          key: "language",
          title: tt("profile.app.language.title"),
          description: tt("profile.app.language.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(88,213,201,0.32)", "rgba(99,168,255,0.22)"]}
              borderColor="rgba(88,213,201,0.20)"
              icon={<Languages size={18} color={TEAL} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/language",
        },
        {
          key: "preferences",
          title: tt("profile.app.preferences.title"),
          description: tt("profile.app.preferences.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(99,168,255,0.32)", "rgba(181,136,255,0.22)"]}
              borderColor="rgba(99,168,255,0.20)"
              icon={<Settings2 size={18} color={BLUE} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/preferences",
        },
        {
          key: "colors",
          title: tt("profile.app.colors.title"),
          description: tt("profile.app.colors.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(181,136,255,0.36)", "rgba(255,204,102,0.24)"]}
              borderColor="rgba(181,136,255,0.20)"
              icon={<Palette size={18} color={PURPLE} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/colors",
          badge: tt("profile.app.colors.badge") || undefined,
        },
        {
          key: "ai",
          title: tt("profile.app.ai.title"),
          description: tt("profile.app.ai.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(181,136,255,0.34)", "rgba(88,213,201,0.26)"]}
              borderColor="rgba(181,136,255,0.20)"
              icon={<AIGlyph size={16} />}
            />
          ),
          route: "/profile/ai",
          badge: tt("profile.app.ai.badge") || undefined,
        },
        {
          key: "notification_sounds",
          title: tt("profile.app.notificationSounds.title") || tt("profile.notificationSounds.title") || "Мелодии и сигналы",
          description: tt("profile.app.notificationSounds.description") || tt("profile.notificationSounds.subtitle") || "Выбор звуков для звонков, сообщений, AI, Wallet и системных уведомлений.",
          icon: (
            <PremiumGlyph
              colors={["rgba(181,136,255,0.32)", "rgba(88,213,201,0.24)"]}
              borderColor="rgba(181,136,255,0.20)"
              icon={<Music2 size={18} color={PURPLE} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/notification-sounds",
        },
        {
          
          key: "notifications",
          title: tt("profile.app.notifications.title"),
          description: tt("profile.app.notifications.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(119,226,140,0.30)", "rgba(88,213,201,0.24)"]}
              borderColor="rgba(119,226,140,0.18)"
              icon={<Bell size={18} color={GREEN} strokeWidth={2.4} />}
            />
          ),
          route: "/notification-preferences",
        },
        {
          key: "games",
          title: tt("profile.app.games.title"),
          description: tt("profile.app.games.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(181,136,255,0.32)", "rgba(99,168,255,0.24)"]}
              borderColor="rgba(181,136,255,0.20)"
              icon={<Gamepad2 size={18} color={PURPLE} strokeWidth={2.4} />}
            />
          ),
          route: "/games",
          badge: tt("profile.app.games.badge") || undefined,
        },
      ].filter((item) => item.title),
    [tt],
  );

  const premiumRows = useMemo<HubRow[]>(
    () =>
      [
        {
          key: "premium",
          title: tt("profile.premiumSection.premium.title"),
          description: tt("profile.premiumSection.premium.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(255,204,102,0.36)", "rgba(255,143,185,0.24)"]}
              borderColor="rgba(255,204,102,0.20)"
              icon={<Crown size={18} color={GOLD} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/premium",
        },
        {
          key: "business",
          title: tt("profile.premiumSection.business.title"),
          description: tt("profile.premiumSection.business.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(181,136,255,0.32)", "rgba(99,168,255,0.24)"]}
              borderColor="rgba(181,136,255,0.20)"
              icon={
                <BriefcaseBusiness
                  size={18}
                  color={PURPLE}
                  strokeWidth={2.4}
                />
              }
            />
          ),
          route: "/profile/business-upgrade",
        },
        {
          key: "credits",
          title: tt("profile.premiumSection.credits.title"),
          description: tt("profile.premiumSection.credits.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(255,204,102,0.34)", "rgba(99,168,255,0.24)"]}
              borderColor="rgba(255,204,102,0.20)"
              icon={<CreditCard size={18} color={GOLD} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/credits",
        },
        {
          key: "gifts",
          title: tt("profile.premiumSection.gifts.title"),
          description: tt("profile.premiumSection.gifts.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(88,213,201,0.32)", "rgba(255,204,102,0.22)"]}
              borderColor="rgba(88,213,201,0.20)"
              icon={<Gift size={18} color={TEAL} strokeWidth={2.4} />}
            />
          ),
          route: "/profile/gifts",
        },
      ].filter((item) => item.title),
    [tt],
  );

  const walletRows = useMemo<HubRow[]>(
    () =>
      [
        {
          key: "wallet",
          title: tt("profile.wallet.wallet.title"),
          description: tt("profile.wallet.wallet.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(119,226,140,0.30)", "rgba(88,213,201,0.24)"]}
              borderColor="rgba(119,226,140,0.18)"
              icon={<Wallet size={18} color={GREEN} strokeWidth={2.4} />}
            />
          ),
          route: "/wallet",
        },
        {
          key: "wallet_settings",
          title: tt("profile.wallet.settings.title"),
          description: tt("profile.wallet.settings.description"),
          icon: (
            <PremiumGlyph
              colors={["rgba(99,168,255,0.32)", "rgba(255,204,102,0.22)"]}
              borderColor="rgba(99,168,255,0.20)"
              icon={<CreditCard size={18} color={BLUE} strokeWidth={2.4} />}
            />
          ),
          route: "/wallet/settings",
        },
      ].filter((item) => item.title),
    [tt],
  );

  const profileEyebrow = tt("profile.eyebrow");
  const profileTitle = tt("profile.title");
  const profileSubtitle = tt("profile.subtitle");
  const homeText = tt("profile.home");

  const profileLive = tt("profile.hero.live");
  const profileVerified = tt("profile.hero.verified");

  const quickActions = [
    {
      key: "edit",
      title: tt("profile.hero.actions.edit"),
      route: "/profile/edit",
      icon: (
        <PremiumGlyph
          colors={["rgba(88,213,201,0.32)", "rgba(99,168,255,0.24)"]}
          borderColor="rgba(88,213,201,0.18)"
          icon={<User size={13} color={SOFT} strokeWidth={2.4} />}
        />
      ),
    },
    {
      key: "photos",
      title: tt("profile.hero.actions.photos"),
      route: "/profile/photos",
      icon: (
        <PremiumGlyph
          colors={["rgba(88,213,201,0.32)", "rgba(99,168,255,0.24)"]}
          borderColor="rgba(88,213,201,0.18)"
          icon={<Images size={13} color={SOFT} strokeWidth={2.4} />}
        />
      ),
    },
    {
      key: "videos",
      title: tt("profile.hero.actions.videos"),
      route: "/profile/short-videos",
      icon: (
        <PremiumGlyph
          colors={["rgba(99,168,255,0.32)", "rgba(181,136,255,0.24)"]}
          borderColor="rgba(99,168,255,0.18)"
          icon={<Video size={13} color={SOFT} strokeWidth={2.4} />}
        />
      ),
    },
    {
      key: "voice",
      title: tt("profile.hero.actions.voice"),
      route: "/profile/voice",
      icon: (
        <PremiumGlyph
          colors={["rgba(119,226,140,0.30)", "rgba(88,213,201,0.22)"]}
          borderColor="rgba(119,226,140,0.18)"
          icon={<Mic size={13} color={SOFT} strokeWidth={2.4} />}
        />
      ),
    },
    {
      key: "qr",
      title: tt("profile.hero.actions.qr"),
      route: "/profile/qr",
      icon: (
        <PremiumGlyph
          colors={["rgba(181,136,255,0.30)", "rgba(99,168,255,0.24)"]}
          borderColor="rgba(181,136,255,0.18)"
          icon={<QrCode size={13} color={SOFT} strokeWidth={2.4} />}
        />
      ),
    },
  ].filter((item) => item.title);

  const launchBadge = tt("profile.launch.badge");
  const launchFreeMonths = tt("profile.launch.freeMonths");
  const launchTitle = tt("profile.launch.title");
  const launchDescription = tt("profile.launch.description");

  const giftsBlockTitle = tt("profile.giftsBlock.title");
  const giftsBlockDescription = tt("profile.giftsBlock.description");
  const giftsAll = tt("profile.giftsBlock.stats.all");
  const giftsPremium = tt("profile.giftsBlock.stats.premium");
  const giftsSeasonal = tt("profile.giftsBlock.stats.seasonal");
  const giftsOpen = tt("profile.giftsBlock.open");

  const actionsSectionTitle =
    tt("profile.accountActions.sectionTitle") || "Account actions";
  const logoutTitle = tt("profile.accountActions.logout.title") || "Sign out";
  const logoutDescription =
    tt("profile.accountActions.logout.description") ||
    "Clear the current session and return to the welcome screen.";
  const logoutConfirm =
    tt("profile.accountActions.logout.confirm") || "Sign out";

  const deleteTitle =
    tt("profile.accountActions.delete.title") || "Delete account data";
  const deleteDescription =
    tt("profile.accountActions.delete.description") ||
    "Clear session and local account data on this device, then return to the welcome screen.";
  const deleteConfirm =
    tt("profile.accountActions.delete.confirm") || "Delete";

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "left", "right", "bottom"]}
      >
        <View style={styles.backgroundOrbTop} />
        <View style={styles.backgroundOrbBottom} />

        <View style={styles.container}>
          <View style={styles.fixedButtonsRow} pointerEvents="box-none">
            <Pressable
              onPress={() => openSabiHome()}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>{homeText}</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/notifications")}
              style={styles.headerIconButton}
            >
              <PremiumGlyph
                colors={["rgba(119,226,140,0.28)", "rgba(88,213,201,0.20)"]}
                borderColor="rgba(119,226,140,0.16)"
                icon={<Bell size={14} color={TEXT} strokeWidth={2.4} />}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.introBlock}>
              {profileEyebrow ? (
                <Text style={styles.eyebrow}>{profileEyebrow}</Text>
              ) : null}
              {profileTitle ? <Text style={styles.title}>{profileTitle}</Text> : null}
              {profileSubtitle ? (
                <Text style={styles.subtitle}>{profileSubtitle}</Text>
              ) : null}
            </View>

            <LinearGradient
              colors={[
                "rgba(30,55,90,0.96)",
                "rgba(17,33,58,0.96)",
                "rgba(11,42,38,0.96)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroAccentOne} />
              <View style={styles.heroAccentTwo} />
              <View style={styles.heroAccentThree} />

              <View style={styles.heroTopRow}>
                <View style={styles.avatarWrap}>
                  <LinearGradient
                    colors={[
                      "rgba(126,240,208,0.96)",
                      "rgba(99,168,255,0.92)",
                      "rgba(181,136,255,0.94)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatarRing}
                  >
                    <View style={styles.avatarInner}>
                      {avatarUri ? (
                        <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                      ) : (
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {displayAvatarLetter}
                          </Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </View>

                <View style={styles.heroPills}>
                  {profileLive ? (
                    <View style={styles.statusPill}>
                      <View
                        style={[styles.statusDot, { backgroundColor: GREEN }]}
                      />
                      <Text style={styles.statusPillText}>{profileLive}</Text>
                    </View>
                  ) : null}

                  {profileVerified ? (
                    <View style={styles.verifyPill}>
                      <BadgeCheck size={13} color={GREEN} strokeWidth={2.4} />
                      <Text style={styles.verifyPillText}>{profileVerified}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <Text style={styles.name}>{displayFullName}</Text>
              <Text style={styles.handle}>{displayUsername}</Text>
              {displayBio ? <Text style={styles.bio}>{displayBio}</Text> : null}

              <View style={styles.quickStatsRow}>
                <MiniStat
                  label={tt("profile.hero.stats.sabiId")}
                  value={displaySabiId}
                />
                <MiniStat
                  label={tt("profile.hero.stats.photos")}
                  value={`${photoCount}`}
                />
                <MiniStat
                  label={tt("profile.hero.stats.videos")}
                  value={`${shortVideoCount}`}
                />
              </View>

              <View style={styles.quickActionsRow}>
                {quickActions.map((item) => (
                  <QuickAction
                    key={item.key}
                    title={item.title}
                    icon={item.icon}
                    onPress={() => router.push(item.route as never)}
                  />
                ))}
              </View>
            </LinearGradient>

            {(launchBadge || launchFreeMonths || launchTitle || launchDescription) && (
              <LinearGradient
                colors={[
                  "rgba(85,208,193,0.22)",
                  "rgba(101,168,255,0.20)",
                  "rgba(181,136,255,0.16)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.launchCard}
              >
                <View style={styles.launchTop}>
                  {launchBadge ? (
                    <View style={styles.launchBadge}>
                      <AIGlyph size={12} />
                      <Text style={styles.launchBadgeText}>{launchBadge}</Text>
                    </View>
                  ) : (
                    <View />
                  )}

                  {launchFreeMonths ? (
                    <Text style={styles.launchFreeText}>
                      {PROFILE_LAUNCH_OFFER.freeMonths} {launchFreeMonths}
                    </Text>
                  ) : null}
                </View>

                {launchTitle ? (
                  <Text style={styles.launchTitle}>{launchTitle}</Text>
                ) : null}

                {launchDescription ? (
                  <Text style={styles.launchDescription}>{launchDescription}</Text>
                ) : null}
              </LinearGradient>
            )}

            <SurfaceStrip
              title={tt("profile.sections.identitySurface")}
              items={identitySurface}
            />

            <SurfaceStrip
              title={tt("profile.sections.sharedActivity")}
              items={sharedActivity}
            />

            <Section
              title={tt("profile.sections.ownerAccess")}
              rows={ownerRows}
            />

            {(giftsBlockTitle || giftsBlockDescription || giftsOpen) && (
              <LinearGradient
                colors={["rgba(16,31,48,0.90)", "rgba(11,25,40,0.94)"]}
                style={styles.giftsCard}
              >
                <View style={styles.giftsHeader}>
                  <View>
                    {giftsBlockTitle ? (
                      <Text style={styles.giftsTitle}>{giftsBlockTitle}</Text>
                    ) : null}
                    {giftsBlockDescription ? (
                      <Text style={styles.giftsSubtitle}>{giftsBlockDescription}</Text>
                    ) : null}
                  </View>

                  <PremiumGlyph
                    colors={["rgba(255,204,102,0.34)", "rgba(88,213,201,0.22)"]}
                    borderColor="rgba(255,204,102,0.18)"
                    icon={<Gift size={16} color={GOLD} strokeWidth={2.4} />}
                  />
                </View>

                <View style={styles.giftsStatsRow}>
                  <MiniStat label={giftsAll} value="128" />
                  <MiniStat label={giftsPremium} value="22" />
                  <MiniStat label={giftsSeasonal} value="9" />
                </View>

                {giftsOpen ? (
                  <Pressable
                    onPress={() => router.push("/profile/gifts")}
                    style={styles.giftsAction}
                  >
                    <Text style={styles.giftsActionText}>{giftsOpen}</Text>
                    <ChevronRight size={16} color={TEXT} strokeWidth={2.4} />
                  </Pressable>
                ) : null}
              </LinearGradient>
            )}

            <Section
              title={tt("profile.sections.account")}
              rows={accountRows}
            />

            <Section
              title={tt("profile.sections.privacySecurity")}
              rows={privacyRows}
            />

            <Section
              title={tt("profile.sections.appExperience")}
              rows={appRows}
            />

            <Section
              title={tt("profile.sections.premiumServices")}
              rows={premiumRows}
            />

            <Section
              title={tt("profile.sections.walletEconomy")}
              rows={walletRows}
            />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{actionsSectionTitle}</Text>

              <View style={styles.actionGroup}>
                <Pressable
                  onPress={handleLogout}
                  disabled={signingOut || deletingAccount}
                  style={[
                    styles.actionRow,
                    styles.actionRowNeutral,
                    (signingOut || deletingAccount) && styles.actionRowDisabled,
                  ]}
                >
                  <View style={styles.actionRowLeft}>
                    <PremiumGlyph
                      colors={["rgba(99,168,255,0.32)", "rgba(88,213,201,0.20)"]}
                      borderColor="rgba(99,168,255,0.18)"
                      icon={<LogOut size={18} color={BLUE} strokeWidth={2.4} />}
                    />
                    <View style={styles.actionRowText}>
                      <Text style={styles.actionTitle}>{logoutTitle}</Text>
                      <Text style={styles.actionDescription}>
                        {logoutDescription}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.actionButtonText}>
                    {signingOut ? "..." : logoutConfirm}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleDeleteAccount}
                  disabled={deletingAccount || signingOut}
                  style={[
                    styles.actionRow,
                    styles.actionRowDanger,
                    (deletingAccount || signingOut) && styles.actionRowDisabled,
                  ]}
                >
                  <View style={styles.actionRowLeft}>
                    <PremiumGlyph
                      colors={["rgba(255,107,122,0.30)", "rgba(255,143,185,0.20)"]}
                      borderColor="rgba(255,107,122,0.18)"
                      icon={<Trash2 size={18} color={RED} strokeWidth={2.4} />}
                    />
                    <View style={styles.actionRowText}>
                      <Text style={styles.actionTitle}>{deleteTitle}</Text>
                      <Text style={styles.actionDescription}>
                        {deleteDescription}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
                    {deletingAccount ? "..." : deleteConfirm}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },

  backgroundOrbTop: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(108, 255, 180, 0.10)",
  },
  backgroundOrbBottom: {
    position: "absolute",
    bottom: -60,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: "rgba(99, 168, 255, 0.08)",
  },

  container: { flex: 1, paddingHorizontal: 16 },

  fixedButtonsRow: {
    position: "absolute",
    top: 6,
    left: 16,
    right: 16,
    zIndex: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerButton: {
    minWidth: 58,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: "rgba(12,28,25,0.86)",
    borderWidth: 1,
    borderColor: "rgba(121, 228, 162, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  headerIconButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(12,28,25,0.82)",
    borderWidth: 1,
    borderColor: "rgba(121, 228, 162, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "800",
  },

  scrollContent: {
    paddingTop: 62,
    paddingBottom: 36,
    gap: 14,
  },

  introBlock: {
    paddingTop: 6,
    paddingBottom: 2,
    paddingHorizontal: 2,
  },
  eyebrow: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    color: TEXT,
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    fontWeight: "600",
    maxWidth: 420,
  },

  heroCard: {
    borderRadius: 30,
    padding: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  heroAccentOne: {
    position: "absolute",
    right: -30,
    top: -20,
    width: 170,
    height: 170,
    borderRadius: 170,
    backgroundColor: "rgba(99,168,255,0.15)",
  },
  heroAccentTwo: {
    position: "absolute",
    left: -20,
    bottom: -30,
    width: 150,
    height: 150,
    borderRadius: 150,
    backgroundColor: "rgba(88,213,201,0.10)",
  },
  heroAccentThree: {
    position: "absolute",
    right: 40,
    bottom: -34,
    width: 124,
    height: 124,
    borderRadius: 124,
    backgroundColor: "rgba(181,136,255,0.10)",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },

  avatarWrap: { width: 92, height: 92 },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(126,240,208,0.95)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.26,
    shadowRadius: 18,
    elevation: 12,
  },
  avatarInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "rgba(9,18,27,0.94)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: 86, height: 86, borderRadius: 43 },
  avatarText: {
    color: "#0F172A",
    fontSize: 34,
    fontWeight: "900",
  },

  heroPills: {
    alignItems: "flex-end",
    gap: 8,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
  },
  statusPillText: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "800",
  },
  verifyPill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(119,226,140,0.12)",
    borderWidth: 1,
    borderColor: "rgba(119,226,140,0.16)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  verifyPillText: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "800",
  },

  name: {
    color: TEXT,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 12,
  },
  handle: {
    color: SOFT,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  bio: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    marginTop: 10,
  },

  quickStatsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  miniStat: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 12,
  },
  miniStatLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  miniStatValue: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6,
  },

  quickActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  quickAction: {
    minHeight: 40,
    paddingLeft: 8,
    paddingRight: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quickActionText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "800",
  },

  premiumGlyph: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumGlyphInner: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "rgba(8,16,24,0.24)",
    alignItems: "center",
    justifyContent: "center",
  },

  aiGlyphWrap: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  aiGlyphOrb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  aiGlyphDot: {
    position: "absolute",
    right: -1,
    top: -1,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PINK,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
  },

  launchCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  launchTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  launchBadge: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  launchBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  launchFreeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  launchTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 10,
  },
  launchDescription: {
    color: "#E8F2F8",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 6,
  },

  section: {
    gap: 10,
  },
  sectionTitle: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 2,
  },

  surfaceRow: {
    gap: 10,
    paddingRight: 8,
  },
  surfaceCard: {
    width: 190,
    minHeight: 164,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 14,
  },
  surfaceTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 12,
  },
  surfaceSubtitle: {
    marginTop: 6,
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  surfaceStat: {
    marginTop: 12,
    color: SOFT,
    fontSize: 12,
    fontWeight: "800",
  },

  giftsCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
  },
  giftsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  giftsTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: "900",
  },
  giftsSubtitle: {
    marginTop: 6,
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    maxWidth: 260,
  },
  giftsStatsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  giftsAction: {
    marginTop: 14,
    minHeight: 44,
    borderRadius: 16,
    backgroundColor: CARD_ALT,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  giftsActionText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "800",
  },

  groupCard: {
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    overflow: "hidden",
  },
  row: {
    minHeight: 78,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: CARD_ALT,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  rowIcon: {
    width: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },
  rowDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 4,
  },
  badgeWrap: {
    minHeight: 28,
    maxWidth: 120,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "900",
  },

  actionGroup: {
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    overflow: "hidden",
  },
  actionRow: {
    minHeight: 94,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  actionRowNeutral: {
    backgroundColor: CARD_ALT,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  actionRowDanger: {
    backgroundColor: "rgba(56, 20, 30, 0.82)",
  },
  actionRowDisabled: {
    opacity: 0.7,
  },
  actionRowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionRowText: {
    flex: 1,
  },
  actionTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },
  actionDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 4,
  },
  actionButtonText: {
    color: SOFT,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  actionButtonTextDanger: {
    color: "#FFD7DD",
  },
});


