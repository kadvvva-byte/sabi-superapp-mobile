import React, { useCallback, useState } from "react";
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
  BookOpenText,
  ChevronRight,
  Cloud,
  Database,
  Download,
  History,
  Search,
  Shield,
  Sparkles,
  Trash2,
  Users,
  Wallet,
} from "lucide-react-native";

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
const GOLD = "#FFCC66";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

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

function ActionCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Pressable style={styles.actionCard}>
      <View style={styles.actionIconWrap}>{icon}</View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionDescription}>{description}</Text>
    </Pressable>
  );
}

export default function DataManagementScreen() {
  const i18n = useI18n() as I18nHookValue;

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

  const [contactsSyncEnabled, setContactsSyncEnabled] = useState(true);
  const [searchHintsEnabled, setSearchHintsEnabled] = useState(true);
  const [draftBackupEnabled, setDraftBackupEnabled] = useState(true);
  const [paymentHintsEnabled, setPaymentHintsEnabled] = useState(false);
  const [memoryControlsEnabled, setMemoryControlsEnabled] = useState(true);
  const [privateExportMode, setPrivateExportMode] = useState(true);
  const [autoCleanupEnabled, setAutoCleanupEnabled] = useState(false);

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
                {t("profile.dataManagementScreen.intro.eyebrow")}
              </Text>
              <Text style={styles.title}>
                {t("profile.dataManagementScreen.intro.title")}
              </Text>
              <Text style={styles.subtitle}>
                {t("profile.dataManagementScreen.intro.subtitle")}
              </Text>
            </View>

            <View style={styles.metricsRow}>
              <MetricCard
                title={t("profile.dataManagementScreen.metrics.contactsSync")}
                value={
                  contactsSyncEnabled
                    ? t("profile.dataManagementScreen.metricStates.on")
                    : t("profile.dataManagementScreen.metricStates.off")
                }
                accent={GREEN}
              />
              <MetricCard
                title={t("profile.dataManagementScreen.metrics.draftBackup")}
                value={
                  draftBackupEnabled
                    ? t("profile.dataManagementScreen.metricStates.on")
                    : t("profile.dataManagementScreen.metricStates.off")
                }
                accent={BLUE}
              />
              <MetricCard
                title={t("profile.dataManagementScreen.metrics.privateExport")}
                value={
                  privateExportMode
                    ? t("profile.dataManagementScreen.metricStates.on")
                    : t("profile.dataManagementScreen.metricStates.off")
                }
                accent={PURPLE}
              />
            </View>

            <View style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <View style={styles.heroIconWrap}>
                  <Database size={20} color={TEAL} strokeWidth={2.4} />
                </View>

                <View style={styles.heroTextWrap}>
                  <Text style={styles.heroTitle}>
                    {t("profile.dataManagementScreen.hero.title")}
                  </Text>
                  <Text style={styles.heroDescription}>
                    {t("profile.dataManagementScreen.hero.description")}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.dataManagementScreen.sections.discovery")}
              </Text>

              <View style={styles.groupCard}>
                <ToggleRow
                  icon={<Users size={18} color={GREEN} strokeWidth={2.4} />}
                  title={t("profile.dataManagementScreen.discovery.syncContacts.title")}
                  description={t(
                    "profile.dataManagementScreen.discovery.syncContacts.description",
                  )}
                  value={contactsSyncEnabled}
                  onChange={setContactsSyncEnabled}
                />
                <ToggleRow
                  icon={<Search size={18} color={BLUE} strokeWidth={2.4} />}
                  title={t(
                    "profile.dataManagementScreen.discovery.searchSuggestions.title",
                  )}
                  description={t(
                    "profile.dataManagementScreen.discovery.searchSuggestions.description",
                  )}
                  value={searchHintsEnabled}
                  onChange={setSearchHintsEnabled}
                />
                <ToggleRow
                  icon={<Sparkles size={18} color={PURPLE} strokeWidth={2.4} />}
                  title={t(
                    "profile.dataManagementScreen.discovery.memoryControls.title",
                  )}
                  description={t(
                    "profile.dataManagementScreen.discovery.memoryControls.description",
                  )}
                  value={memoryControlsEnabled}
                  onChange={setMemoryControlsEnabled}
                  last
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.dataManagementScreen.sections.storage")}
              </Text>

              <View style={styles.groupCard}>
                <ToggleRow
                  icon={<BookOpenText size={18} color={BLUE} strokeWidth={2.4} />}
                  title={t("profile.dataManagementScreen.storage.draftBackup.title")}
                  description={t(
                    "profile.dataManagementScreen.storage.draftBackup.description",
                  )}
                  value={draftBackupEnabled}
                  onChange={setDraftBackupEnabled}
                />
                <ToggleRow
                  icon={<Wallet size={18} color={GOLD} strokeWidth={2.4} />}
                  title={t(
                    "profile.dataManagementScreen.storage.paymentHints.title",
                  )}
                  description={t(
                    "profile.dataManagementScreen.storage.paymentHints.description",
                  )}
                  value={paymentHintsEnabled}
                  onChange={setPaymentHintsEnabled}
                />
                <ToggleRow
                  icon={<Shield size={18} color={TEAL} strokeWidth={2.4} />}
                  title={t(
                    "profile.dataManagementScreen.storage.privateExportMode.title",
                  )}
                  description={t(
                    "profile.dataManagementScreen.storage.privateExportMode.description",
                  )}
                  value={privateExportMode}
                  onChange={setPrivateExportMode}
                  last
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.dataManagementScreen.sections.retention")}
              </Text>

              <View style={styles.groupCard}>
                <ToggleRow
                  icon={<History size={18} color={PURPLE} strokeWidth={2.4} />}
                  title={t(
                    "profile.dataManagementScreen.retention.autoCleanup.title",
                  )}
                  description={t(
                    "profile.dataManagementScreen.retention.autoCleanup.description",
                  )}
                  value={autoCleanupEnabled}
                  onChange={setAutoCleanupEnabled}
                  last
                />
              </View>
            </View>

            <View style={styles.actionsGrid}>
              <ActionCard
                title={t("profile.dataManagementScreen.actions.requestExport.title")}
                description={t(
                  "profile.dataManagementScreen.actions.requestExport.description",
                )}
                icon={<Download size={18} color={BLUE} strokeWidth={2.4} />}
              />
              <ActionCard
                title={t("profile.dataManagementScreen.actions.reviewDrafts.title")}
                description={t(
                  "profile.dataManagementScreen.actions.reviewDrafts.description",
                )}
                icon={<Cloud size={18} color={GREEN} strokeWidth={2.4} />}
              />
              <ActionCard
                title={t("profile.dataManagementScreen.actions.clearCache.title")}
                description={t(
                  "profile.dataManagementScreen.actions.clearCache.description",
                )}
                icon={<Trash2 size={18} color={PURPLE} strokeWidth={2.4} />}
              />
            </View>

            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>
                {t("profile.dataManagementScreen.note.title")}
              </Text>
              <Text style={styles.noteText}>
                {t("profile.dataManagementScreen.note.description")}
              </Text>
            </View>

            <Pressable
              style={styles.linkCard}
              onPress={() => router.push("/profile/privacy")}
            >
              <View style={styles.linkLeft}>
                <View style={styles.linkIconWrap}>
                  <Shield size={18} color={GREEN} strokeWidth={2.4} />
                </View>
                <View style={styles.linkTextWrap}>
                  <Text style={styles.linkTitle}>
                    {t("profile.dataManagementScreen.links.privacy.title")}
                  </Text>
                  <Text style={styles.linkDescription}>
                    {t("profile.dataManagementScreen.links.privacy.description")}
                  </Text>
                </View>
              </View>

              <ChevronRight size={18} color={MUTED} strokeWidth={2.4} />
            </Pressable>

            <Pressable
              style={styles.linkCard}
              onPress={() => router.push("/profile/support")}
            >
              <View style={styles.linkLeft}>
                <View style={styles.linkIconWrap}>
                  <Database size={18} color={TEAL} strokeWidth={2.4} />
                </View>
                <View style={styles.linkTextWrap}>
                  <Text style={styles.linkTitle}>
                    {t("profile.dataManagementScreen.links.support.title")}
                  </Text>
                  <Text style={styles.linkDescription}>
                    {t("profile.dataManagementScreen.links.support.description")}
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
    fontSize: 17,
    fontWeight: "900",
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
    alignItems: "flex-start",
    gap: 12,
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

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  actionCard: {
    flexGrow: 1,
    flexBasis: "31%",
    minWidth: 160,
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 14,
  },

  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  actionTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "800",
  },

  actionDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 6,
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
    color: MUTED,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 4,
  },
});