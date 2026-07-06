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
  ChevronRight,
  Lock,
  ShieldCheck,
  Star,
  UserMinus,
  UserPlus,
} from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import { useProfileKernel } from "../../../core/kernel/profile/bindings";
type ProfilePersonRule = {
  id: string;
  name: string;
  username: string;
  note?: string;
};

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
    };

function normalizeKeyPart(value: string) {
  return value
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export default function TrustedScreen() {
  const i18n = useI18n() as I18nHookValue;
  const { facade, trustedList, blockedList } = useProfileKernel();


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

  const totalPeople = useMemo(
    () => trustedList.length + blockedList.length,
    [trustedList.length, blockedList.length],
  );

  const resolvePersonNote = useCallback(
    (person: ProfilePersonRule, type: "trusted" | "blocked") => {
      if (person.id.startsWith("blocked-from-trusted-")) {
        return t("profile.trustedScreen.notes.movedFromTrusted");
      }

      if (person.id.startsWith("trusted-from-blocked-")) {
        return t("profile.trustedScreen.notes.restoredFromBlocked");
      }

      const byIdKey = `profile.trustedScreen.people.${normalizeKeyPart(person.id)}.note`;
      const byId = t(byIdKey);
      if (byId !== byIdKey) return byId;

      const byUsernameKey = `profile.trustedScreen.people.${normalizeKeyPart(person.username)}.note`;
      const byUsername = t(byUsernameKey);
      if (byUsername !== byUsernameKey) return byUsername;

      return type === "trusted"
        ? t("profile.trustedScreen.notes.genericTrusted")
        : t("profile.trustedScreen.notes.genericBlocked");
    },
    [t],
  );

  const moveTrustedToBlocked = useCallback((person: ProfilePersonRule) => { void facade.moveTrustedToBlocked(person.id); }, [facade]);

  const restoreBlockedToTrusted = useCallback((person: ProfilePersonRule) => { void facade.restoreBlockedToTrusted(person.id); }, [facade]);

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
                {t("profile.trustedScreen.intro.eyebrow")}
              </Text>
              <Text style={styles.title}>
                {t("profile.trustedScreen.intro.title")}
              </Text>
              <Text style={styles.subtitle}>
                {t("profile.trustedScreen.intro.subtitle")}
              </Text>
            </View>

            <View style={styles.metricsRow}>
              <MetricCard
                title={t("profile.trustedScreen.metrics.trusted")}
                value={`${trustedList.length}`}
                accent={GREEN}
              />
              <MetricCard
                title={t("profile.trustedScreen.metrics.blocked")}
                value={`${blockedList.length}`}
                accent={PURPLE}
              />
              <MetricCard
                title={t("profile.trustedScreen.metrics.totalRules")}
                value={`${totalPeople}`}
                accent={BLUE}
              />
            </View>

            <View style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <View style={styles.heroIconWrap}>
                  <ShieldCheck size={20} color={TEAL} strokeWidth={2.4} />
                </View>

                <View style={styles.heroTextWrap}>
                  <Text style={styles.heroTitle}>
                    {t("profile.trustedScreen.hero.title")}
                  </Text>
                  <Text style={styles.heroDescription}>
                    {t("profile.trustedScreen.hero.description")}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.trustedScreen.sections.trusted")}
              </Text>

              <View style={styles.groupCard}>
                {trustedList.length ? (
                  trustedList.map((item: ProfilePersonRule, index: number) => (
                    <PersonRow
                      key={item.id}
                      item={item}
                      note={resolvePersonNote(item, "trusted")}
                      icon={<Star size={16} color={GREEN} strokeWidth={2.4} />}
                      badgeText={t("profile.trustedScreen.badges.trusted")}
                      badgeColor={GREEN}
                      actionLabel={t("profile.trustedScreen.actions.block")}
                      onAction={() => moveTrustedToBlocked(item)}
                      bordered={index !== trustedList.length - 1}
                    />
                  ))
                ) : (
                  <EmptyState
                    title={t("profile.trustedScreen.empty.trusted.title")}
                    description={t("profile.trustedScreen.empty.trusted.description")}
                    icon={<ShieldCheck size={18} color={GREEN} strokeWidth={2.4} />}
                  />
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.trustedScreen.sections.blocked")}
              </Text>

              <View style={styles.groupCard}>
                {blockedList.length ? (
                  blockedList.map((item: ProfilePersonRule, index: number) => (
                    <PersonRow
                      key={item.id}
                      item={item}
                      note={resolvePersonNote(item, "blocked")}
                      icon={<Lock size={16} color={PURPLE} strokeWidth={2.4} />}
                      badgeText={t("profile.trustedScreen.badges.blocked")}
                      badgeColor={PURPLE}
                      actionLabel={t("profile.trustedScreen.actions.restore")}
                      onAction={() => restoreBlockedToTrusted(item)}
                      bordered={index !== blockedList.length - 1}
                    />
                  ))
                ) : (
                  <EmptyState
                    title={t("profile.trustedScreen.empty.blocked.title")}
                    description={t("profile.trustedScreen.empty.blocked.description")}
                    icon={<Lock size={18} color={PURPLE} strokeWidth={2.4} />}
                  />
                )}
              </View>
            </View>

            <Pressable
              style={styles.linkCard}
              onPress={() => router.push("/profile/privacy/blocked" as never)}
            >
              <View style={styles.linkLeft}>
                <View style={styles.linkIconWrap}>
                  <UserMinus size={18} color={PURPLE} strokeWidth={2.4} />
                </View>
                <View style={styles.linkTextWrap}>
                  <Text style={styles.linkTitle}>
                    {t("profile.trustedScreen.links.blockedOnly.title")}
                  </Text>
                  <Text style={styles.linkDescription}>
                    {t("profile.trustedScreen.links.blockedOnly.description")}
                  </Text>
                </View>
              </View>

              <ChevronRight size={18} color={MUTED} strokeWidth={2.4} />
            </Pressable>

            <Pressable
              style={styles.linkCard}
              onPress={() => router.push("/profile/privacy" as never)}
            >
              <View style={styles.linkLeft}>
                <View style={styles.linkIconWrap}>
                  <UserPlus size={18} color={BLUE} strokeWidth={2.4} />
                </View>
                <View style={styles.linkTextWrap}>
                  <Text style={styles.linkTitle}>
                    {t("profile.trustedScreen.links.privacyCenter.title")}
                  </Text>
                  <Text style={styles.linkDescription}>
                    {t("profile.trustedScreen.links.privacyCenter.description")}
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

function PersonRow({
  item,
  note,
  icon,
  badgeText,
  badgeColor,
  actionLabel,
  onAction,
  bordered,
}: {
  item: ProfilePersonRule;
  note: string;
  icon: React.ReactNode;
  badgeText: string;
  badgeColor: string;
  actionLabel: string;
  onAction: () => void;
  bordered?: boolean;
}) {
  return (
    <View style={[styles.personRow, bordered && styles.rowBorder]}>
      <View style={styles.personLeft}>
        <View style={styles.personIconWrap}>{icon}</View>

        <View style={styles.personTextWrap}>
          <View style={styles.personTopLine}>
            <Text style={styles.personName}>{item.name}</Text>
            <View
              style={[styles.personBadge, { backgroundColor: `${badgeColor}22` }]}
            >
              <Text style={[styles.personBadgeText, { color: badgeColor }]}>
                {badgeText}
              </Text>
            </View>
          </View>

          <Text style={styles.personUsername}>{item.username}</Text>
          <Text style={styles.personNote}>{note}</Text>
        </View>
      </View>

      <Pressable onPress={onAction} style={styles.personAction}>
        <Text style={styles.personActionText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconWrap}>{icon}</View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
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

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },

  personRow: {
    minHeight: 92,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: CARD_SOFT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  personLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  personIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  personTextWrap: {
    flex: 1,
  },

  personTopLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  personName: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  personBadge: {
    minHeight: 24,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  personBadgeText: {
    fontSize: 11,
    fontWeight: "900",
  },

  personUsername: {
    color: BLUE,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },

  personNote: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 4,
  },

  personAction: {
    minWidth: 74,
    minHeight: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  personActionText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "900",
  },

  emptyWrap: {
    padding: 18,
    alignItems: "center",
  },

  emptyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 12,
  },

  emptyDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
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