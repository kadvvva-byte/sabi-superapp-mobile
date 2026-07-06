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
  Check,
  ChevronRight,
  Clock3,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react-native";

import { useI18n } from "../../../src/shared/i18n";
import { useProfileKernel } from "../../../src/core/kernel/profile/bindings";
import {
  SABI_ACCOUNT_DELETION_PATH,
  SABI_ACCOUNT_DELETION_RETENTION_EXCEPTIONS,
  SABI_ACCOUNT_DELETION_URL,
  SABI_PRIVACY_POLICY_URL,
  SABI_PRIVACY_POLICY_URL_STATUS,
} from "../../../src/modules/profile/data/privacy";

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
const GOLD = "#FFCC66";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

type DeletePresetKey = "off" | "24_hours" | "7_days" | "30_days" | "90_days";

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

export default function AutoDeleteScreen() {
  const i18n = useI18n() as I18nHookValue;
  const { facade, autoDelete } = useProfileKernel();

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

  const deletePresets = useMemo<DeletePresetKey[]>(
    () => ["off", "24_hours", "7_days", "30_days", "90_days"],
    [],
  );

  const selectedPreset = (autoDelete.selectedPreset || "30_days") as DeletePresetKey;
  const applyToNewChats = autoDelete.applyToNewChats;
  const applyToGroups = autoDelete.applyToGroups;
  const applyToChannels = autoDelete.applyToChannels;

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
              onPress={() => router.replace("/profile/privacy")}
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
                {t("profile.autoDeleteScreen.intro.eyebrow")}
              </Text>
              <Text style={styles.title}>
                {t("profile.autoDeleteScreen.intro.title")}
              </Text>
              <Text style={styles.subtitle}>
                {t("profile.autoDeleteScreen.intro.subtitle")}
              </Text>
            </View>

            <View style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <View style={styles.heroIconWrap}>
                  <Clock3 size={20} color={GOLD} strokeWidth={2.4} />
                </View>

                <View style={styles.heroTextWrap}>
                  <Text style={styles.heroTitle}>
                    {t("profile.autoDeleteScreen.hero.title")}
                  </Text>
                  <Text style={styles.heroDescription}>
                    {t("profile.autoDeleteScreen.hero.description")}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.groupCard}>
              {deletePresets.map((item, index) => {
                const active = item === selectedPreset;

                return (
                  <Pressable
                    key={item}
                    onPress={() => { void facade.updateAutoDelete({ selectedPreset: item }); }}
                    style={[
                      styles.optionRow,
                      index !== deletePresets.length - 1 && styles.rowBorder,
                    ]}
                  >
                    <Text style={styles.optionTitle}>
                      {t(`profile.autoDeleteScreen.presets.${item}`)}
                    </Text>

                    {active ? (
                      <View style={styles.activeBadge}>
                        <Check size={14} color={GREEN} strokeWidth={2.6} />
                        <Text style={styles.activeBadgeText}>
                          {t("profile.autoDeleteScreen.selectedBadge")}
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.groupCard}>
              <ToggleRow
                icon={<MessageSquare size={18} color={BLUE} strokeWidth={2.4} />}
                title={t("profile.autoDeleteScreen.toggles.newChats.title")}
                description={t(
                  "profile.autoDeleteScreen.toggles.newChats.description",
                )}
                value={applyToNewChats}
                onChange={(value) => { void facade.updateAutoDelete({ applyToNewChats: value }); }}
              />

              <ToggleRow
                icon={<Users size={18} color={PURPLE} strokeWidth={2.4} />}
                title={t("profile.autoDeleteScreen.toggles.groups.title")}
                description={t("profile.autoDeleteScreen.toggles.groups.description")}
                value={applyToGroups}
                onChange={(value) => { void facade.updateAutoDelete({ applyToGroups: value }); }}
              />

              <ToggleRow
                icon={<ShieldCheck size={18} color={GREEN} strokeWidth={2.4} />}
                title={t("profile.autoDeleteScreen.toggles.channels.title")}
                description={t(
                  "profile.autoDeleteScreen.toggles.channels.description",
                )}
                value={applyToChannels}
                onChange={(value) => { void facade.updateAutoDelete({ applyToChannels: value }); }}
                last
              />
            </View>

            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>
                {t("profile.autoDeleteScreen.note.title")}
              </Text>
              <Text style={styles.noteText}>
                {t("profile.autoDeleteScreen.note.description")}
              </Text>
            </View>

            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>Account deletion</Text>
              <Text style={styles.noteText}>
                In-app request path: {SABI_ACCOUNT_DELETION_PATH}. This Play-ready
                screen explains how users can request Sabi account deletion. This
                patch does not delete accounts or mutate user data.
              </Text>
            </View>

            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>Public deletion and privacy links</Text>
              <Text style={styles.noteText}>
                Privacy Policy URL: {SABI_PRIVACY_POLICY_URL}
                {"\n"}Account deletion web request URL: {SABI_ACCOUNT_DELETION_URL}
                {"\n"}Status: {SABI_PRIVACY_POLICY_URL_STATUS}. Replace placeholder
                URLs with the final public company domain before Google Play
                production submission.
              </Text>
            </View>

            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>Retention exceptions</Text>
              <Text style={styles.noteText}>
                Some records may be retained when required for:
                {"\n"}{SABI_ACCOUNT_DELETION_RETENTION_EXCEPTIONS.map(
                  (item: string) => `• ${item}`,
                ).join("\n")}
              </Text>
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

  heroCard: {
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
  },

  heroHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },

  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroTextWrap: {
    flex: 1,
  },

  heroTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "900",
  },

  heroDescription: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 6,
  },

  groupCard: {
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    overflow: "hidden",
  },

  optionRow: {
    minHeight: 62,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: CARD_SOFT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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

  optionTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  activeBadge: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(119,226,140,0.14)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  activeBadgeText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "900",
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

  noteTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
  },

  noteText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
});