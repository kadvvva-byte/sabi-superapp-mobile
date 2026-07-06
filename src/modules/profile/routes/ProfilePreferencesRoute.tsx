import React, { useCallback, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Bell,
  ChevronRight,
  Globe2,
  Palette,
  Smartphone,
  Sparkles,
  Volume2,
  Waves,
} from "lucide-react-native";

import { useProfileKernel } from "../../../core/kernel/profile/bindings";
import { LANGUAGES } from "../../../shared/data/languages";
import { useI18n } from "../../../shared/i18n";

const BG_TOP = "#05140D";
const BG_MID = "#062018";
const BG_BOTTOM = "#08261E";

const CARD = "rgba(16, 31, 48, 0.82)";
const CARD_SOFT = "rgba(26, 44, 64, 0.82)";
const CARD_BORDER = "rgba(120, 220, 160, 0.12)";
const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";
const GREEN = "#77E28C";
const BLUE = "#63A8FF";
const PURPLE = "#B588FF";
const TEAL = "#58D5C9";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
      language?: string;
    };

function normalizeCode(input?: string | null): string {
  return String(input || "").trim().replace(/_/g, "-").toLowerCase();
}

export default function PreferencesScreen() {
  const i18n = useI18n() as I18nHookValue;
  const { facade, preferences, languageCode } = useProfileKernel();
  const language =
    typeof i18n === "object" && i18n && "language" in i18n
      ? i18n.language || "en"
      : "en";

  const hapticsEnabled = preferences.hapticsEnabled;
  const soundEnabled = preferences.soundEnabled;
  const previewEnabled = preferences.previewEnabled;
  const compactMode = preferences.compactMode;
  const smartInsightsEnabled = preferences.smartInsightsEnabled;

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

  const currentLanguageLabel = useMemo(() => {
    const normalized = normalizeCode(languageCode || language);

    const exact =
      LANGUAGES.find((item) => normalizeCode(item.code) === normalized) ??
      LANGUAGES.find(
        (item) => normalizeCode(item.code) === normalized.split("-")[0],
      );

    if (!exact) return String(language).toUpperCase();

    return `${exact.nativeName} · ${(
      exact.englishName ??
      exact.name ??
      exact.code
    ).trim()}`;
  }, [language, languageCode]);

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
          <View style={styles.fixedButtonsRow}>
            <Pressable
              onPress={() => router.replace("/profile")}
              style={styles.topIconButton}
            >
              <ChevronRight
                size={18}
                color={TEXT}
                strokeWidth={2.4}
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.introBlock}>
              <Text style={styles.eyebrow}>
                {t("profile.preferencesScreen.intro.eyebrow")}
              </Text>
              <Text style={styles.title}>
                {t("profile.preferencesScreen.intro.title")}
              </Text>
              <Text style={styles.subtitle}>
                {t("profile.preferencesScreen.intro.subtitle")}
              </Text>
            </View>

            <View style={styles.metricsRow}>
              <MetricCard
                title={t("profile.preferencesScreen.metrics.haptics")}
                value={hapticsEnabled ? t("common.on") : t("common.off")}
                accent={GREEN}
              />
              <MetricCard
                title={t("profile.preferencesScreen.metrics.sound")}
                value={soundEnabled ? t("common.on") : t("common.off")}
                accent={BLUE}
              />
              <MetricCard
                title={t("profile.preferencesScreen.metrics.compact")}
                value={compactMode ? t("common.on") : t("common.off")}
                accent={PURPLE}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.preferencesScreen.sections.localization")}
              </Text>

              <Pressable
                style={styles.linkCard}
                onPress={() => router.push("/language")}
              >
                <View style={styles.linkLeft}>
                  <View style={styles.linkIconWrap}>
                    <Globe2 size={18} color={TEAL} strokeWidth={2.4} />
                  </View>

                  <View style={styles.linkTextWrap}>
                    <Text style={styles.linkTitle}>
                      {t("profile.preferencesScreen.language.title")}
                    </Text>
                    <Text style={styles.linkDescription}>
                      {currentLanguageLabel}
                    </Text>
                    <Text style={styles.linkHint}>
                      {t("profile.preferencesScreen.language.description")}
                    </Text>
                  </View>
                </View>

                <ChevronRight size={18} color={MUTED} strokeWidth={2.4} />
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.preferencesScreen.sections.interaction")}
              </Text>

              <View style={styles.groupCard}>
                <ToggleRow
                  icon={<Waves size={18} color={GREEN} strokeWidth={2.4} />}
                  title={t("profile.preferencesScreen.toggles.haptics.title")}
                  description={t(
                    "profile.preferencesScreen.toggles.haptics.description",
                  )}
                  value={hapticsEnabled}
                  onChange={(value) => { void facade.updatePreferences({ hapticsEnabled: value }); }}
                />

                <ToggleRow
                  icon={<Volume2 size={18} color={BLUE} strokeWidth={2.4} />}
                  title={t("profile.preferencesScreen.toggles.sound.title")}
                  description={t(
                    "profile.preferencesScreen.toggles.sound.description",
                  )}
                  value={soundEnabled}
                  onChange={(value) => { void facade.updatePreferences({ soundEnabled: value }); }}
                  last
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.preferencesScreen.sections.presentation")}
              </Text>

              <View style={styles.groupCard}>
                <ToggleRow
                  icon={<Bell size={18} color={TEAL} strokeWidth={2.4} />}
                  title={t("profile.preferencesScreen.toggles.preview.title")}
                  description={t(
                    "profile.preferencesScreen.toggles.preview.description",
                  )}
                  value={previewEnabled}
                  onChange={(value) => { void facade.updatePreferences({ previewEnabled: value }); }}
                />

                <ToggleRow
                  icon={
                    <Smartphone size={18} color={PURPLE} strokeWidth={2.4} />
                  }
                  title={t("profile.preferencesScreen.toggles.compact.title")}
                  description={t(
                    "profile.preferencesScreen.toggles.compact.description",
                  )}
                  value={compactMode}
                  onChange={(value) => { void facade.updatePreferences({ compactMode: value }); }}
                />

                <ToggleRow
                  icon={<Sparkles size={18} color={GREEN} strokeWidth={2.4} />}
                  title={t(
                    "profile.preferencesScreen.toggles.smartInsights.title",
                  )}
                  description={t(
                    "profile.preferencesScreen.toggles.smartInsights.description",
                  )}
                  value={smartInsightsEnabled}
                  onChange={(value) => { void facade.updatePreferences({ smartInsightsEnabled: value }); }}
                  last
                />
              </View>
            </View>

            <View style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <Palette size={16} color={TEAL} strokeWidth={2.4} />
                <Text style={styles.noteTitle}>
                  {t("profile.preferencesScreen.note.title")}
                </Text>
              </View>

              <Text style={styles.noteText}>
                {t("profile.preferencesScreen.note.description")}
              </Text>
            </View>

            <Pressable
              style={styles.linkCard}
              onPress={() => router.push("/language")}
            >
              <View style={styles.linkLeft}>
                <View style={styles.linkIconWrap}>
                  <Globe2 size={18} color={TEAL} strokeWidth={2.4} />
                </View>
                <View style={styles.linkTextWrap}>
                  <Text style={styles.linkTitle}>
                    {t("profile.preferencesScreen.links.language.title")}
                  </Text>
                  <Text style={styles.linkDescription}>
                    {t("profile.preferencesScreen.links.language.description")}
                  </Text>
                </View>
              </View>

              <ChevronRight size={18} color={MUTED} strokeWidth={2.4} />
            </Pressable>

            <Pressable
              style={styles.linkCard}
              onPress={() => router.push("/notification-preferences")}
            >
              <View style={styles.linkLeft}>
                <View style={styles.linkIconWrap}>
                  <Bell size={18} color={BLUE} strokeWidth={2.4} />
                </View>
                <View style={styles.linkTextWrap}>
                  <Text style={styles.linkTitle}>
                    {t("profile.preferencesScreen.links.notifications.title")}
                  </Text>
                  <Text style={styles.linkDescription}>
                    {t(
                      "profile.preferencesScreen.links.notifications.description",
                    )}
                  </Text>
                </View>
              </View>

              <ChevronRight size={18} color={MUTED} strokeWidth={2.4} />
            </Pressable>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MetricCard({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  value,
  onChange,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.rowWrap, !last && styles.rowBorder]}>
      <View style={styles.rowTop}>
        <View style={styles.rowLeft}>
          <View style={styles.rowIconWrap}>{icon}</View>
          <Text style={styles.rowTitle}>{title}</Text>
        </View>

        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: "rgba(255,255,255,0.18)", true: GREEN }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="rgba(255,255,255,0.18)"
        />
      </View>

      <Text style={styles.rowDescription}>{description}</Text>
    </View>
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
    backgroundColor: "rgba(108,255,180,0.10)",
  },

  backgroundOrbBottom: {
    position: "absolute",
    bottom: -60,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: "rgba(99,168,255,0.08)",
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

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

  topIconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(12,28,25,0.86)",
    borderWidth: 1,
    borderColor: "rgba(121,228,162,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    paddingTop: 62,
    paddingBottom: 36,
    gap: 16,
  },

  introBlock: {
    paddingTop: 6,
    paddingBottom: 2,
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
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    fontWeight: "600",
  },

  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },

  metricCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  metricTitle: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  metricValue: {
    fontSize: 18,
    fontWeight: "900",
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
  },

  groupCard: {
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    overflow: "hidden",
  },

  rowWrap: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: CARD_SOFT,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },

  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  rowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  rowTitle: {
    flex: 1,
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  rowDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 8,
    paddingLeft: 52,
  },

  noteCard: {
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
  },

  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  noteTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  noteText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },

  linkCard: {
    minHeight: 78,
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  linkLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  linkIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  linkTextWrap: {
    flex: 1,
  },

  linkTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  linkDescription: {
    color: TEXT,
    opacity: 0.9,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 4,
  },

  linkHint: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 4,
  },
});