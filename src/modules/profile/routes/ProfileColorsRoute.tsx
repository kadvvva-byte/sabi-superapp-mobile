import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
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
  Check,
  Crown,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import ProfileAvatarFrame from "../components/ProfileAvatarFrame";
import {
  PROFILE_FRAME_THEMES,
  type ProfileFrameThemeKey,
} from "../config/profileFrameThemes";
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
const GOLD = "#FFCC66";
const PINK = "#FF8FB9";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

type ThemePresetKey =
  | "emeraldGlass"
  | "royalAurora"
  | "midnightViolet"
  | "sunsetRose"
  | "aiNeon";

type ThemePreset = {
  key: ThemePresetKey;
  title: string;
  subtitle: string;
  heroColors: [string, string, string];
  accentColors: [string, string];
  badge: string;
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={styles.miniStatValue}>{value}</Text>
    </View>
  );
}

function QuickPill({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.quickPill}>
      {icon}
      <Text style={styles.quickPillText}>{title}</Text>
    </View>
  );
}

function OptionChip({
  title,
  subtitle,
  selected,
  onPress,
  leading,
  badge,
}: {
  title: string;
  subtitle: string;
  selected?: boolean;
  onPress: () => void;
  leading: React.ReactNode;
  badge?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.optionCard, selected && styles.optionCardSelected]}
    >
      <View style={styles.optionTopRow}>
        <View style={styles.optionLeading}>{leading}</View>

        {selected ? (
          <View style={styles.selectedBadge}>
            <Check size={14} color={TEXT} strokeWidth={2.8} />
          </View>
        ) : badge ? (
          <View style={styles.optionBadge}>
            <Text style={styles.optionBadgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

export default function ProfileColorsScreen() {
  const i18n = useI18n() as I18nHookValue;
  const { account } = useProfileKernel();
  const displayAvatarUri = account.avatarUri ?? null;
  const displayAvatarLetter = account.avatarLetter || account.firstName?.charAt(0)?.toUpperCase() || account.username?.charAt(0)?.toUpperCase() || "S";
  const displayVerified = account.verificationStatus === "verified";
  const displayName = account.fullName || [account.firstName, account.lastName].filter(Boolean).join(" ") || "Sabi User";
  const displayHandle = account.username ? `@${String(account.username).replace(/^@+/, "")}` : "@sabi";
  const [themeKey, setThemeKey] = useState<ThemePresetKey>("emeraldGlass");
  const [frameKey, setFrameKey] =
    useState<ProfileFrameThemeKey>("defaultGlow");

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

  const themePresets = useMemo<ThemePreset[]>(
    () => [
      {
        key: "emeraldGlass",
        title: t("profile.colorsScreen.themes.emeraldGlass.title"),
        subtitle: t("profile.colorsScreen.themes.emeraldGlass.subtitle"),
        heroColors: [
          "rgba(28,62,61,0.98)",
          "rgba(12,36,45,0.96)",
          "rgba(8,25,31,0.94)",
        ],
        accentColors: ["rgba(126,240,208,0.98)", "rgba(88,213,201,0.94)"],
        badge: t("profile.colorsScreen.themes.emeraldGlass.badge"),
      },
      {
        key: "royalAurora",
        title: t("profile.colorsScreen.themes.royalAurora.title"),
        subtitle: t("profile.colorsScreen.themes.royalAurora.subtitle"),
        heroColors: [
          "rgba(60,38,78,0.98)",
          "rgba(24,27,62,0.96)",
          "rgba(13,26,40,0.94)",
        ],
        accentColors: ["rgba(255,204,102,0.98)", "rgba(181,136,255,0.94)"],
        badge: t("profile.colorsScreen.themes.royalAurora.badge"),
      },
      {
        key: "midnightViolet",
        title: t("profile.colorsScreen.themes.midnightViolet.title"),
        subtitle: t("profile.colorsScreen.themes.midnightViolet.subtitle"),
        heroColors: [
          "rgba(41,29,64,0.98)",
          "rgba(18,24,52,0.96)",
          "rgba(11,19,34,0.94)",
        ],
        accentColors: ["rgba(181,136,255,0.98)", "rgba(99,168,255,0.92)"],
        badge: t("profile.colorsScreen.themes.midnightViolet.badge"),
      },
      {
        key: "sunsetRose",
        title: t("profile.colorsScreen.themes.sunsetRose.title"),
        subtitle: t("profile.colorsScreen.themes.sunsetRose.subtitle"),
        heroColors: [
          "rgba(76,33,48,0.98)",
          "rgba(35,24,50,0.96)",
          "rgba(18,19,34,0.94)",
        ],
        accentColors: ["rgba(255,143,185,0.98)", "rgba(255,204,102,0.94)"],
        badge: t("profile.colorsScreen.themes.sunsetRose.badge"),
      },
      {
        key: "aiNeon",
        title: t("profile.colorsScreen.themes.aiNeon.title"),
        subtitle: t("profile.colorsScreen.themes.aiNeon.subtitle"),
        heroColors: [
          "rgba(22,46,74,0.98)",
          "rgba(16,23,58,0.96)",
          "rgba(9,24,33,0.94)",
        ],
        accentColors: ["rgba(88,213,201,0.98)", "rgba(181,136,255,0.96)"],
        badge: t("profile.colorsScreen.themes.aiNeon.badge"),
      },
    ],
    [t],
  );

  const activeTheme = useMemo(
    () => themePresets.find((item) => item.key === themeKey) ?? themePresets[0],
    [themeKey, themePresets],
  );

  const applyTheme = useCallback(() => {
    Alert.alert(
      t("profile.colorsScreen.alerts.savedTitle"),
      t("profile.colorsScreen.alerts.savedDescription"),
    );
  }, [t]);

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
              {t("profile.colorsScreen.header.title")}
            </Text>

            <Pressable onPress={applyTheme} style={styles.headerSaveButton}>
              <Text style={styles.headerSaveText}>
                {t("common.save")}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.introBlock}>
              <Text style={styles.eyebrow}>
                {t("profile.colorsScreen.intro.eyebrow")}
              </Text>
              <Text style={styles.title}>
                {t("profile.colorsScreen.intro.title")}
              </Text>
              <Text style={styles.subtitle}>
                {t("profile.colorsScreen.intro.subtitle")}
              </Text>
            </View>

            <LinearGradient
              colors={activeTheme.heroColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.previewCard}
            >
              <View style={styles.previewAccentOne} />
              <View style={styles.previewAccentTwo} />

              <View style={styles.previewTop}>
                <ProfileAvatarFrame
                  size={96}
                  imageUri={displayAvatarUri}
                  letter={displayAvatarLetter}
                  themeKey={frameKey}
                  verified={displayVerified}
                  showThemeBadge
                  badgeLabel={activeTheme.title}
                />

                <View style={styles.previewPills}>
                  <View style={styles.statusPill}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>
                      {t("profile.colorsScreen.preview.ownerThemeBadge")}
                    </Text>
                  </View>

                  <View style={styles.verifyPill}>
                    <BadgeCheck size={13} color={GREEN} strokeWidth={2.4} />
                    <Text style={styles.verifyText}>{activeTheme.badge}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.previewName}>{displayName}</Text>
              <Text style={styles.previewHandle}>{displayHandle}</Text>
              <Text style={styles.previewBio}>
                {t("profile.colorsScreen.preview.bio")}
              </Text>

              <View style={styles.previewStatsRow}>
                <MiniStat
                  label={t("profile.colorsScreen.preview.stats.theme")}
                  value={activeTheme.title}
                />
                <MiniStat
                  label={t("profile.colorsScreen.preview.stats.frame")}
                  value={t(`profile.colorsScreen.frames.${frameKey}.title`)}
                />
              </View>

              <View style={styles.previewActionsRow}>
                <QuickPill
                  icon={<Palette size={13} color={SOFT} strokeWidth={2.4} />}
                  title={t("profile.colorsScreen.preview.quickPills.profileSurface")}
                />
                <QuickPill
                  icon={<AIGlyph size={13} />}
                  title={t("profile.colorsScreen.preview.quickPills.aiIdentity")}
                />
                <QuickPill
                  icon={<Crown size={13} color={SOFT} strokeWidth={2.4} />}
                  title={t("profile.colorsScreen.preview.quickPills.premium")}
                />
              </View>
            </LinearGradient>

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
                  colors={["rgba(255,204,102,0.34)", "rgba(181,136,255,0.22)"]}
                  borderColor="rgba(255,204,102,0.18)"
                  icon={<ShieldCheck size={16} color={TEXT} strokeWidth={2.4} />}
                />
                <Text style={styles.noticeTitle}>
                  {t("profile.colorsScreen.notice.title")}
                </Text>
              </View>

              <Text style={styles.noticeText}>
                {t("profile.colorsScreen.notice.description")}
              </Text>
            </LinearGradient>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.colorsScreen.sections.themePresets")}
              </Text>

              <View style={styles.optionGrid}>
                {themePresets.map((item) => (
                  <OptionChip
                    key={item.key}
                    title={item.title}
                    subtitle={item.subtitle}
                    selected={item.key === themeKey}
                    onPress={() => setThemeKey(item.key)}
                    badge={item.badge}
                    leading={
                      <LinearGradient
                        colors={item.accentColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.themeLeading}
                      >
                        <Palette size={16} color={TEXT} strokeWidth={2.4} />
                      </LinearGradient>
                    }
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.colorsScreen.sections.avatarFrames")}
              </Text>

              <View style={styles.optionGrid}>
                {Object.values(PROFILE_FRAME_THEMES).map((item) => (
                  <OptionChip
                    key={item.key}
                    title={t(`profile.colorsScreen.frames.${item.key}.title`)}
                    subtitle={t(
                      `profile.colorsScreen.frames.${item.key}.description`,
                    )}
                    selected={item.key === frameKey}
                    onPress={() => setFrameKey(item.key)}
                    leading={
                      <View style={styles.frameLeading}>
                        <ProfileAvatarFrame
                          size={58}
                          imageUri={displayAvatarUri}
                          letter={displayAvatarLetter}
                          themeKey={item.key}
                          verified={false}
                          showThemeBadge={false}
                        />
                      </View>
                    }
                  />
                ))}
              </View>
            </View>

            <LinearGradient
              colors={["rgba(16,31,48,0.90)", "rgba(11,25,40,0.94)"]}
              style={styles.footerCard}
            >
              <View style={styles.footerTop}>
                <PremiumGlyph
                  colors={["rgba(181,136,255,0.34)", "rgba(88,213,201,0.24)"]}
                  borderColor="rgba(181,136,255,0.18)"
                  icon={<AIGlyph size={16} />}
                />
                <View style={styles.footerTextWrap}>
                  <Text style={styles.footerTitle}>
                    {t("profile.colorsScreen.footer.title")}
                  </Text>
                  <Text style={styles.footerSubtitle}>
                    {t("profile.colorsScreen.footer.description")}
                  </Text>
                </View>
              </View>

              <Pressable onPress={applyTheme} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>
                  {t("profile.colorsScreen.footer.action")}
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

  headerSaveButton: {
    minWidth: 64,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(12,28,25,0.86)",
    borderWidth: 1,
    borderColor: "rgba(121, 228, 162, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  headerSaveText: {
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

  previewCard: {
    borderRadius: 30,
    padding: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },

  previewAccentOne: {
    position: "absolute",
    right: -30,
    top: -20,
    width: 170,
    height: 170,
    borderRadius: 170,
    backgroundColor: "rgba(99,168,255,0.15)",
  },

  previewAccentTwo: {
    position: "absolute",
    left: -22,
    bottom: -36,
    width: 154,
    height: 154,
    borderRadius: 154,
    backgroundColor: "rgba(88,213,201,0.10)",
  },

  previewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },

  previewPills: {
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
    backgroundColor: GREEN,
  },

  statusText: {
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

  verifyText: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "800",
  },

  previewName: {
    color: TEXT,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 12,
  },

  previewHandle: {
    color: SOFT,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },

  previewBio: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    marginTop: 10,
  },

  previewStatsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },

  previewActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },

  quickPill: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  quickPillText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "800",
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
    marginTop: 6,
    color: TEXT,
    fontSize: 14,
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

  optionGrid: {
    gap: 10,
  },

  optionCard: {
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 14,
  },

  optionCardSelected: {
    borderColor: "rgba(126,240,208,0.32)",
    shadowColor: "rgba(126,240,208,0.92)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },

  optionTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  optionLeading: {
    minHeight: 40,
    justifyContent: "center",
  },

  optionBadge: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  optionBadgeText: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "900",
  },

  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(126,240,208,0.24)",
    borderWidth: 1,
    borderColor: "rgba(126,240,208,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },

  optionTitle: {
    marginTop: 10,
    color: TEXT,
    fontSize: 16,
    fontWeight: "900",
  },

  optionSubtitle: {
    marginTop: 6,
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  themeLeading: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  frameLeading: {
    minHeight: 58,
    justifyContent: "center",
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