import React, { useCallback, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Globe,
  Mail,
  Palette,
  Phone,
  QrCode,
  ShieldCheck,
  Sparkles,
  User,
  Images,
  Video,
  Mic,
} from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import ProfileAvatarFrame from "../components/ProfileAvatarFrame";
import { addProfilePhoto, setProfileAvatar } from "../data/profileRuntime";
import { useProfileKernel } from "../../../core/kernel/profile/bindings";

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
const PINK = "#FF8FB9";
const GOLD = "#FFCC66";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

type EditRow = {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  badge?: string;
};

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

function QuickAction({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quickAction}>
      {icon}
      <Text style={styles.quickActionText}>{title}</Text>
    </Pressable>
  );
}

async function pickAvatarDirect() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
  });

  if (result.canceled) return;

  const asset = result.assets?.[0];
  if (!asset?.uri) return;

  await addProfilePhoto(asset.uri, asset.fileName || "Avatar photo");
  await setProfileAvatar(asset.uri);
}

function Section({ title, rows }: { title: string; rows: EditRow[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.groupCard}>
        {rows.map((row, index) => (
          <Pressable
            key={row.key}
            onPress={() => router.push(row.route as never)}
            style={[styles.row, index !== rows.length - 1 && styles.rowBorder]}
          >
            <View style={styles.rowIcon}>{row.icon}</View>

            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle}>{row.title}</Text>
              <Text style={styles.rowDescription}>{row.description}</Text>
            </View>

            {row.badge ? (
              <View style={styles.badgeWrap}>
                <Text style={styles.badgeText}>{row.badge}</Text>
              </View>
            ) : (
              <ChevronRight size={16} color={MUTED} strokeWidth={2.4} />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function ProfileEditScreen() {
  const i18n = useI18n() as I18nHookValue;
  const profileKernel = useProfileKernel();
  const account = profileKernel.account;
  const avatarUri = profileKernel.avatarUri ?? account.avatarUri ?? null;
  const displayFullName = account.fullName || [account.firstName, account.lastName].filter(Boolean).join(" ").trim() || "Sabi User";
  const displayUsername = account.username ? `@${String(account.username).replace(/^@+/, "")}` : "@sabi";
  const displayAvatarLetter = account.avatarLetter || (displayFullName.trim().charAt(0) || "S").toUpperCase();
  const isVerified = account.verificationStatus === "verified";

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

  const identityRows = useMemo<EditRow[]>(
    () => [
      {
        key: "photos",
        title: t("profile.editScreen.identity.photos.title"),
        description: t("profile.editScreen.identity.photos.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(88,213,201,0.34)", "rgba(99,168,255,0.22)"]}
            borderColor="rgba(88,213,201,0.18)"
            icon={<Images size={18} color={TEAL} strokeWidth={2.4} />}
          />
        ),
        route: "/profile/photos",
      },
      {
        key: "videos",
        title: t("profile.editScreen.identity.videos.title"),
        description: t("profile.editScreen.identity.videos.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(99,168,255,0.34)", "rgba(181,136,255,0.22)"]}
            borderColor="rgba(99,168,255,0.18)"
            icon={<Video size={18} color={BLUE} strokeWidth={2.4} />}
          />
        ),
        route: "/profile/short-videos",
      },
      {
        key: "voice",
        title: t("profile.editScreen.identity.voice.title"),
        description: t("profile.editScreen.identity.voice.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(119,226,140,0.30)", "rgba(88,213,201,0.22)"]}
            borderColor="rgba(119,226,140,0.18)"
            icon={<Mic size={18} color={GREEN} strokeWidth={2.4} />}
          />
        ),
        route: "/profile/voice",
      },
      {
        key: "username",
        title: t("profile.editScreen.identity.username.title"),
        description: t("profile.editScreen.identity.username.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(88,213,201,0.34)", "rgba(99,168,255,0.22)"]}
            borderColor="rgba(88,213,201,0.18)"
            icon={<User size={18} color={TEAL} strokeWidth={2.4} />}
          />
        ),
        route: "/profile/username",
      },
      {
        key: "phone",
        title: t("profile.editScreen.identity.phone.title"),
        description: t("profile.editScreen.identity.phone.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(99,168,255,0.34)", "rgba(181,136,255,0.22)"]}
            borderColor="rgba(99,168,255,0.18)"
            icon={<Phone size={18} color={BLUE} strokeWidth={2.4} />}
          />
        ),
        route: "/profile/phone",
      },
      {
        key: "email",
        title: t("profile.editScreen.identity.email.title"),
        description: t("profile.editScreen.identity.email.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(181,136,255,0.34)", "rgba(99,168,255,0.20)"]}
            borderColor="rgba(181,136,255,0.18)"
            icon={<Mail size={18} color={PURPLE} strokeWidth={2.4} />}
          />
        ),
        route: "/profile/login-email",
      },
      {
        key: "birthday",
        title: t("profile.editScreen.identity.birthday.title"),
        description: t("profile.editScreen.identity.birthday.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(255,204,102,0.34)", "rgba(255,143,185,0.20)"]}
            borderColor="rgba(255,204,102,0.18)"
            icon={<CalendarDays size={18} color={GOLD} strokeWidth={2.4} />}
          />
        ),
        route: "/profile/birthday",
      },
      {
        key: "language",
        title: t("profile.editScreen.identity.language.title"),
        description: t("profile.editScreen.identity.language.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(119,226,140,0.30)", "rgba(88,213,201,0.22)"]}
            borderColor="rgba(119,226,140,0.18)"
            icon={<Globe size={18} color={GREEN} strokeWidth={2.4} />}
          />
        ),
        route: "/profile/language",
        badge: t("profile.editScreen.identity.language.badge"),
      },
    ],
    [t],
  );

  const presentationRows = useMemo<EditRow[]>(
    () => [
      {
        key: "public",
        title: t("profile.editScreen.presentation.public.title"),
        description: t("profile.editScreen.presentation.public.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(119,226,140,0.30)", "rgba(88,213,201,0.22)"]}
            borderColor="rgba(119,226,140,0.18)"
            icon={<User size={18} color={GREEN} strokeWidth={2.4} />}
          />
        ),
        route: "/profile/public",
      },
      {
        key: "colors",
        title: t("profile.editScreen.presentation.colors.title"),
        description: t("profile.editScreen.presentation.colors.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(181,136,255,0.34)", "rgba(255,204,102,0.22)"]}
            borderColor="rgba(181,136,255,0.18)"
            icon={<Palette size={18} color={PURPLE} strokeWidth={2.4} />}
          />
        ),
        route: "/profile/colors",
        badge: t("profile.editScreen.presentation.colors.badge"),
      },
      {
        key: "ai",
        title: t("profile.editScreen.presentation.ai.title"),
        description: t("profile.editScreen.presentation.ai.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(181,136,255,0.34)", "rgba(88,213,201,0.24)"]}
            borderColor="rgba(181,136,255,0.18)"
            icon={<AIGlyph size={16} />}
          />
        ),
        route: "/profile/ai",
        badge: t("profile.editScreen.presentation.ai.badge"),
      },
      {
        key: "qr",
        title: t("profile.editScreen.presentation.qr.title"),
        description: t("profile.editScreen.presentation.qr.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(99,168,255,0.34)", "rgba(181,136,255,0.20)"]}
            borderColor="rgba(99,168,255,0.18)"
            icon={<QrCode size={18} color={BLUE} strokeWidth={2.4} />}
          />
        ),
        route: "/profile/qr",
      },
    ],
    [t],
  );

  const safetyRows = useMemo<EditRow[]>(
    () => [
      {
        key: "verification",
        title: t("profile.editScreen.safety.verification.title"),
        description: t("profile.editScreen.safety.verification.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(99,168,255,0.34)", "rgba(88,213,201,0.22)"]}
            borderColor="rgba(99,168,255,0.18)"
            icon={<BadgeCheck size={18} color={BLUE} strokeWidth={2.4} />}
          />
        ),
        route: "/profile/verification",
      },
      {
        key: "privacy",
        title: t("profile.editScreen.safety.privacy.title"),
        description: t("profile.editScreen.safety.privacy.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(181,136,255,0.34)", "rgba(99,168,255,0.20)"]}
            borderColor="rgba(181,136,255,0.18)"
            icon={<ShieldCheck size={18} color={PURPLE} strokeWidth={2.4} />}
          />
        ),
        route: "/profile/privacy",
      },
      {
        key: "security",
        title: t("profile.editScreen.safety.security.title"),
        description: t("profile.editScreen.safety.security.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(119,226,140,0.30)", "rgba(88,213,201,0.22)"]}
            borderColor="rgba(119,226,140,0.18)"
            icon={<ShieldCheck size={18} color={GREEN} strokeWidth={2.4} />}
          />
        ),
        route: "/profile/security",
      },
    ],
    [t],
  );

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "left", "right", "bottom"]}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={18} color={TEXT} strokeWidth={2.4} />
            </Pressable>

            <Text style={styles.headerTitle}>
              {t("profile.editScreen.header.title")}
            </Text>

            <Pressable
              onPress={() => router.push("/profile/public")}
              style={styles.headerAction}
            >
              <Text style={styles.headerActionText}>
                {t("profile.editScreen.header.viewAction")}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.introBlock}>
              <Text style={styles.eyebrow}>
                {t("profile.editScreen.intro.eyebrow")}
              </Text>
              <Text style={styles.title}>
                {t("profile.editScreen.intro.title")}
              </Text>
              <Text style={styles.subtitle}>
                {t("profile.editScreen.intro.subtitle")}
              </Text>
            </View>

            <LinearGradient
              colors={[
                "rgba(24,46,70,0.98)",
                "rgba(18,28,56,0.96)",
                "rgba(10,24,34,0.94)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroTop}>
                <ProfileAvatarFrame
                  size={98}
                  imageUri={avatarUri}
                  letter={displayAvatarLetter}
                  themeKey="defaultGlow"
                  verified={isVerified}
                  showThemeBadge
                  badgeLabel={t("profile.editScreen.hero.editModeBadge")}
                />

                <View style={styles.heroPills}>
                  <Pressable
                    onPress={() => void pickAvatarDirect()}
                    style={styles.heroBadge}
                  >
                    <Images size={13} color={TEXT} strokeWidth={2.4} />
                    <Text style={styles.heroBadgeText}>
                      {t("profile.editScreen.hero.changeAvatarAction")}
                    </Text>
                  </Pressable>

                  <View style={styles.heroBadgeSecondary}>
                    <AIGlyph size={13} />
                    <Text style={styles.heroBadgeText}>
                      {t("profile.editScreen.hero.aiLinkedBadge")}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.heroTitle}>{displayFullName}</Text>
              <Text style={styles.heroHandle}>{displayUsername}</Text>
              <Text style={styles.heroSubtitle}>
                {t("profile.editScreen.hero.subtitle")}
              </Text>

              <View style={styles.heroActionsRow}>
                <QuickAction
                  title={t("profile.editScreen.hero.quickActions.photos")}
                  icon={<Images size={13} color={SOFT} strokeWidth={2.4} />}
                  onPress={() => router.push("/profile/photos")}
                />
                <QuickAction
                  title={t("profile.editScreen.hero.quickActions.videos")}
                  icon={<Video size={13} color={SOFT} strokeWidth={2.4} />}
                  onPress={() => router.push("/profile/short-videos")}
                />
                <QuickAction
                  title={t("profile.editScreen.hero.quickActions.voice")}
                  icon={<Mic size={13} color={SOFT} strokeWidth={2.4} />}
                  onPress={() => router.push("/profile/voice")}
                />
                <QuickAction
                  title={t("profile.editScreen.hero.quickActions.public")}
                  icon={<User size={13} color={SOFT} strokeWidth={2.4} />}
                  onPress={() => router.push("/profile/public")}
                />
              </View>
            </LinearGradient>

            <Section
              title={t("profile.editScreen.sections.identity")}
              rows={identityRows}
            />
            <Section
              title={t("profile.editScreen.sections.presentation")}
              rows={presentationRows}
            />
            <Section
              title={t("profile.editScreen.sections.safety")}
              rows={safetyRows}
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16 },

  headerRow: {
    paddingTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(12,28,25,0.86)",
    borderWidth: 1,
    borderColor: "rgba(121,228,162,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "900",
  },

  headerAction: {
    minWidth: 62,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(12,28,25,0.86)",
    borderWidth: 1,
    borderColor: "rgba(121,228,162,0.18)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  headerActionText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "900",
  },

  scrollContent: {
    paddingTop: 14,
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

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },

  heroPills: {
    alignItems: "flex-end",
    gap: 8,
  },

  heroBadge: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  heroBadgeSecondary: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(181,136,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(181,136,255,0.18)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  heroBadgeText: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "800",
  },

  heroTitle: {
    color: TEXT,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 14,
  },

  heroHandle: {
    color: SOFT,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },

  heroSubtitle: {
    color: SOFT,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 8,
  },

  heroActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },

  quickAction: {
    minHeight: 40,
    paddingHorizontal: 12,
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
    maxWidth: 110,
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
});