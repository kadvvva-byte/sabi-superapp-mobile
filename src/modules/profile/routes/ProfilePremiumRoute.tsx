import React, { useCallback, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  ChevronRight,
  CreditCard,
  Crown,
  Gift,
  Palette,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  WandSparkles,
} from "lucide-react-native";

import { useI18n } from "@/shared/i18n";
import ProfileAvatarFrame from "@/modules/profile/components/ProfileAvatarFrame";
import { PROFILE_FRAME_THEMES } from "@/modules/profile/config/profileFrameThemes";
import { useProfileKernel } from "@/core/kernel/profile/bindings";

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

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

type PremiumRow = {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route?: string;
  badge?: string;
};

type FeatureCard = {
  key: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: [string, string];
  route?: string;
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

function FeatureStrip({
  title,
  items,
}: {
  title: string;
  items: FeatureCard[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stripRow}
      >
        {items.map((item) => {
          const card = (
            <LinearGradient
              key={item.key}
              colors={["rgba(22,40,62,0.94)", "rgba(10,27,34,0.94)"]}
              style={styles.featureCard}
            >
              <PremiumGlyph
                colors={item.accent}
                borderColor="rgba(255,255,255,0.10)"
                icon={item.icon}
              />
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
            </LinearGradient>
          );

          if (item.route) {
            return (
              <Pressable
                key={item.key}
                onPress={() => router.push(item.route as never)}
              >
                {card}
              </Pressable>
            );
          }

          return card;
        })}
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  rows,
}: {
  title: string;
  rows: PremiumRow[];
}) {
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
                <Text style={styles.rowDescription}>{row.description}</Text>
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

export default function ProfilePremiumScreen() {
  const i18n = useI18n() as I18nHookValue;
  const { account } = useProfileKernel();
  const displayAvatarUri = account.avatarUri ?? null;
  const displayAvatarLetter = account.avatarLetter || account.firstName?.charAt(0)?.toUpperCase() || account.username?.charAt(0)?.toUpperCase() || "S";

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

  const previewFrames = useMemo(
    () => [
      PROFILE_FRAME_THEMES.defaultGlow,
      PROFILE_FRAME_THEMES.royalGold,
      PROFILE_FRAME_THEMES.aiHalo,
      PROFILE_FRAME_THEMES.heartPulse,
    ],
    [],
  );

  const featureCards = useMemo<FeatureCard[]>(
    () => [
      {
        key: "themes",
        title: t("profile.premiumScreen.features.themes.title"),
        subtitle: t("profile.premiumScreen.features.themes.subtitle"),
        icon: <Palette size={18} color={PURPLE} strokeWidth={2.4} />,
        accent: ["rgba(181,136,255,0.36)", "rgba(255,204,102,0.22)"],
        route: "/profile/colors",
      },
      {
        key: "frames",
        title: t("profile.premiumScreen.features.frames.title"),
        subtitle: t("profile.premiumScreen.features.frames.subtitle"),
        icon: <Crown size={18} color={GOLD} strokeWidth={2.4} />,
        accent: ["rgba(255,204,102,0.36)", "rgba(181,136,255,0.24)"],
        route: "/profile/colors",
      },
      {
        key: "ai",
        title: t("profile.premiumScreen.features.ai.title"),
        subtitle: t("profile.premiumScreen.features.ai.subtitle"),
        icon: <AIGlyph size={16} />,
        accent: ["rgba(181,136,255,0.36)", "rgba(88,213,201,0.24)"],
        route: "/profile/ai",
      },
      {
        key: "gifts",
        title: t("profile.premiumScreen.features.gifts.title"),
        subtitle: t("profile.premiumScreen.features.gifts.subtitle"),
        icon: <Gift size={18} color={TEAL} strokeWidth={2.4} />,
        accent: ["rgba(88,213,201,0.34)", "rgba(255,204,102,0.20)"],
        route: "/profile/gifts",
      },
    ],
    [t],
  );

  const premiumRows = useMemo<PremiumRow[]>(
    () => [
      {
        key: "colors",
        title: t("profile.premiumScreen.rows.colors.title"),
        description: t("profile.premiumScreen.rows.colors.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(181,136,255,0.36)", "rgba(255,204,102,0.22)"]}
            borderColor="rgba(181,136,255,0.20)"
            icon={<Palette size={18} color={PURPLE} strokeWidth={2.4} />}
          />
        ),
        route: "/profile/colors",
        badge: t("profile.premiumScreen.rows.colors.badge"),
      },
      {
        key: "ai",
        title: t("profile.premiumScreen.rows.ai.title"),
        description: t("profile.premiumScreen.rows.ai.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(181,136,255,0.34)", "rgba(88,213,201,0.24)"]}
            borderColor="rgba(181,136,255,0.20)"
            icon={<AIGlyph size={16} />}
          />
        ),
        route: "/profile/ai",
        badge: t("profile.premiumScreen.rows.ai.badge"),
      },
      {
        key: "gifts",
        title: t("profile.premiumScreen.rows.gifts.title"),
        description: t("profile.premiumScreen.rows.gifts.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(88,213,201,0.34)", "rgba(255,204,102,0.20)"]}
            borderColor="rgba(88,213,201,0.20)"
            icon={<Gift size={18} color={TEAL} strokeWidth={2.4} />}
          />
        ),
        route: "/profile/gifts",
      },
      {
        key: "credits",
        title: t("profile.premiumScreen.rows.credits.title"),
        description: t("profile.premiumScreen.rows.credits.description"),
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
        key: "business",
        title: t("profile.premiumScreen.rows.business.title"),
        description: t("profile.premiumScreen.rows.business.description"),
        icon: (
          <PremiumGlyph
            colors={["rgba(181,136,255,0.32)", "rgba(99,168,255,0.24)"]}
            borderColor="rgba(181,136,255,0.20)"
            icon={
              <BriefcaseBusiness size={18} color={PURPLE} strokeWidth={2.4} />
            }
          />
        ),
        route: "/profile/business-upgrade",
      },
      {
        key: "public",
        title: t("profile.premiumScreen.rows.public.title"),
        description: t("profile.premiumScreen.rows.public.description"),
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
        key: "qr",
        title: t("profile.premiumScreen.rows.qr.title"),
        description: t("profile.premiumScreen.rows.qr.description"),
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
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={18} color={TEXT} strokeWidth={2.4} />
            </Pressable>

            <Text style={styles.headerTitle}>
              {t("profile.premiumScreen.header.title")}
            </Text>

            <Pressable
              onPress={() => router.push("/profile/colors")}
              style={styles.headerAction}
            >
              <Text style={styles.headerActionText}>
                {t("profile.premiumScreen.header.openAction")}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.introBlock}>
              <Text style={styles.eyebrow}>
                {t("profile.premiumScreen.intro.eyebrow")}
              </Text>
              <Text style={styles.title}>
                {t("profile.premiumScreen.intro.title")}
              </Text>
              <Text style={styles.subtitle}>
                {t("profile.premiumScreen.intro.subtitle")}
              </Text>
            </View>

            <LinearGradient
              colors={[
                "rgba(64,42,82,0.98)",
                "rgba(24,30,66,0.96)",
                "rgba(12,25,35,0.94)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroAccentOne} />
              <View style={styles.heroAccentTwo} />

              <View style={styles.heroTop}>
                <View style={styles.premiumCrownWrap}>
                  <PremiumGlyph
                    colors={["rgba(255,204,102,0.36)", "rgba(181,136,255,0.24)"]}
                    borderColor="rgba(255,204,102,0.20)"
                    icon={<Crown size={18} color={GOLD} strokeWidth={2.4} />}
                  />
                </View>

                <View style={styles.heroPills}>
                  <View style={styles.heroBadge}>
                    <Star size={13} color={GOLD} strokeWidth={2.4} />
                    <Text style={styles.heroBadgeText}>
                      {t("profile.premiumScreen.hero.badges.identity")}
                    </Text>
                  </View>

                  <View style={styles.heroBadgeSecondary}>
                    <BadgeCheck size={13} color={GREEN} strokeWidth={2.4} />
                    <Text style={styles.heroBadgeText}>
                      {t("profile.premiumScreen.hero.badges.ownerSurface")}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.heroTitle}>
                {t("profile.premiumScreen.hero.title")}
              </Text>
              <Text style={styles.heroSubtitle}>
                {t("profile.premiumScreen.hero.subtitle")}
              </Text>

              <View style={styles.previewFramesRow}>
                {previewFrames.map((frame) => (
                  <View key={frame.key} style={styles.previewFrameWrap}>
                    <ProfileAvatarFrame
                      size={64}
                      imageUri={displayAvatarUri}
                      letter={displayAvatarLetter}
                      themeKey={frame.key}
                      verified={false}
                      showThemeBadge={false}
                    />
                    <Text style={styles.previewFrameLabel}>{frame.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.heroActionsRow}>
                <QuickAction
                  title={t("profile.premiumScreen.hero.actions.themes")}
                  icon={<Palette size={13} color={SOFT} strokeWidth={2.4} />}
                  onPress={() => router.push("/profile/colors")}
                />
                <QuickAction
                  title={t("profile.premiumScreen.hero.actions.ai")}
                  icon={<AIGlyph size={13} />}
                  onPress={() => router.push("/profile/ai")}
                />
                <QuickAction
                  title={t("profile.premiumScreen.hero.actions.gifts")}
                  icon={<Gift size={13} color={SOFT} strokeWidth={2.4} />}
                  onPress={() => router.push("/profile/gifts")}
                />
                <QuickAction
                  title={t("profile.premiumScreen.hero.actions.public")}
                  icon={<User size={13} color={SOFT} strokeWidth={2.4} />}
                  onPress={() => router.push("/profile/public")}
                />
              </View>
            </LinearGradient>

            <FeatureStrip
              title={t("profile.premiumScreen.sections.unlocks")}
              items={featureCards}
            />

            <LinearGradient
              colors={[
                "rgba(85,208,193,0.22)",
                "rgba(101,168,255,0.20)",
                "rgba(181,136,255,0.16)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.noticeCard}
            >
              <View style={styles.noticeTop}>
                <PremiumGlyph
                  colors={["rgba(119,226,140,0.30)", "rgba(88,213,201,0.22)"]}
                  borderColor="rgba(119,226,140,0.18)"
                  icon={<ShieldCheck size={16} color={TEXT} strokeWidth={2.4} />}
                />
                <Text style={styles.noticeTitle}>
                  {t("profile.premiumScreen.notice.title")}
                </Text>
              </View>

              <Text style={styles.noticeText}>
                {t("profile.premiumScreen.notice.description")}
              </Text>
            </LinearGradient>

            <LinearGradient
              colors={["rgba(16,31,48,0.90)", "rgba(11,25,40,0.94)"]}
              style={styles.idCard}
            >
              <View style={styles.idCardTop}>
                <PremiumGlyph
                  colors={["rgba(99,168,255,0.34)", "rgba(255,204,102,0.20)"]}
                  borderColor="rgba(99,168,255,0.18)"
                  icon={<ShieldCheck size={16} color={TEXT} strokeWidth={2.4} />}
                />
                <View style={styles.idCardTextWrap}>
                  <Text style={styles.idCardTitle}>
                    {t("profile.premiumScreen.identityCard.title")}
                  </Text>
                  <Text style={styles.idCardSubtitle}>
                    {t("profile.premiumScreen.identityCard.description")}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            <Section
              title={t("profile.premiumScreen.sections.controls")}
              rows={premiumRows}
            />

            <LinearGradient
              colors={["rgba(16,31,48,0.90)", "rgba(11,25,40,0.94)"]}
              style={styles.footerCard}
            >
              <View style={styles.footerTop}>
                <PremiumGlyph
                  colors={["rgba(181,136,255,0.34)", "rgba(88,213,201,0.24)"]}
                  borderColor="rgba(181,136,255,0.18)"
                  icon={<WandSparkles size={16} color={TEXT} strokeWidth={2.4} />}
                />
                <View style={styles.footerTextWrap}>
                  <Text style={styles.footerTitle}>
                    {t("profile.premiumScreen.footer.title")}
                  </Text>
                  <Text style={styles.footerSubtitle}>
                    {t("profile.premiumScreen.footer.description")}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => router.push("/profile/colors")}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  {t("profile.premiumScreen.footer.action")}
                </Text>
              </Pressable>
            </LinearGradient>
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

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

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
    borderColor: "rgba(121, 228, 162, 0.18)",
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
    borderColor: "rgba(121, 228, 162, 0.18)",
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

  heroAccentOne: {
    position: "absolute",
    right: -30,
    top: -20,
    width: 170,
    height: 170,
    borderRadius: 170,
    backgroundColor: "rgba(255,204,102,0.12)",
  },

  heroAccentTwo: {
    position: "absolute",
    left: -20,
    bottom: -28,
    width: 150,
    height: 150,
    borderRadius: 150,
    backgroundColor: "rgba(181,136,255,0.10)",
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },

  premiumCrownWrap: {
    width: 42,
    justifyContent: "center",
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
    backgroundColor: "rgba(119,226,140,0.12)",
    borderWidth: 1,
    borderColor: "rgba(119,226,140,0.16)",
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

  heroSubtitle: {
    color: SOFT,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 8,
  },

  previewFramesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 16,
  },

  previewFrameWrap: {
    alignItems: "center",
    flex: 1,
    gap: 8,
  },

  previewFrameLabel: {
    color: MUTED,
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
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

  stripRow: {
    gap: 10,
    paddingRight: 8,
  },

  featureCard: {
    width: 190,
    minHeight: 162,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 14,
  },

  featureTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 12,
  },

  featureSubtitle: {
    marginTop: 6,
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  noticeCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  noticeTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  noticeTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "900",
  },

  noticeText: {
    marginTop: 10,
    color: SOFT,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },

  idCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },

  idCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  idCardTextWrap: {
    flex: 1,
  },

  idCardTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "900",
  },

  idCardSubtitle: {
    marginTop: 6,
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
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

  footerCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },

  footerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  footerTextWrap: {
    flex: 1,
  },

  footerTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "900",
  },

  footerSubtitle: {
    marginTop: 6,
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  primaryButton: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  primaryButtonText: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "900",
  },
});