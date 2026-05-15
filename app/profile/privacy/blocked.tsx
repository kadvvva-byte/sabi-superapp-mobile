import React, { useCallback } from "react";
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
  Undo2,
} from "lucide-react-native";

import { useI18n } from "../../../src/shared/i18n";
import { useProfileKernel } from "../../../src/core/kernel/profile/bindings";
import type { ProfilePersonRule } from "../../../src/modules/profile/types";

const BG_TOP = "#05140D";
const BG_MID = "#062018";
const BG_BOTTOM = "#08261E";

const CARD = "rgba(16, 31, 48, 0.82)";
const CARD_SOFT = "rgba(26, 44, 64, 0.82)";
const CARD_BORDER = "rgba(120, 220, 160, 0.12)";
const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";
const GREEN = "#77E28C";
const PURPLE = "#B588FF";
const BLUE = "#63A8FF";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

export default function BlockedScreen() {
  const i18n = useI18n() as I18nHookValue;
  const { facade, blockedList } = useProfileKernel();

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

  const unblock = useCallback((id: string) => { void facade.removeBlockedPerson(id); }, [facade]);

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
                {t("profile.blockedScreen.intro.eyebrow")}
              </Text>
              <Text style={styles.title}>
                {t("profile.blockedScreen.intro.title")}
              </Text>
              <Text style={styles.subtitle}>
                {t("profile.blockedScreen.intro.subtitle")}
              </Text>
            </View>

            <View style={styles.heroCard}>
              <View style={styles.heroIconWrap}>
                <Lock size={20} color={PURPLE} strokeWidth={2.4} />
              </View>

              <View style={styles.heroTextWrap}>
                <Text style={styles.heroTitle}>
                  {t("profile.blockedScreen.hero.title")}
                </Text>
                <Text style={styles.heroDescription}>
                  {t("profile.blockedScreen.hero.description")}
                </Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>
                {t("profile.blockedScreen.metric.title")}
              </Text>
              <Text style={styles.metricValue}>{blockedList.length}</Text>
            </View>

            <View style={styles.groupCard}>
              {blockedList.length ? (
                blockedList.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.personRow,
                      index !== blockedList.length - 1 && styles.rowBorder,
                    ]}
                  >
                    <View style={styles.personLeft}>
                      <View style={styles.personIconWrap}>
                        <ShieldCheck size={16} color={PURPLE} strokeWidth={2.4} />
                      </View>

                      <View style={styles.personTextWrap}>
                        <Text style={styles.personName}>{item.name}</Text>
                        <Text style={styles.personUsername}>{item.username}</Text>
                        <Text style={styles.personNote}>
                          {item.note || t("profile.blockedScreen.person.defaultNote")}
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => unblock(item.id)}
                      style={styles.unblockButton}
                    >
                      <Undo2 size={14} color={TEXT} strokeWidth={2.4} />
                      <Text style={styles.unblockButtonText}>
                        {t("profile.blockedScreen.person.unblockAction")}
                      </Text>
                    </Pressable>
                  </View>
                ))
              ) : (
                <View style={styles.emptyWrap}>
                  <View style={styles.emptyIconWrap}>
                    <ShieldCheck size={18} color={GREEN} strokeWidth={2.4} />
                  </View>

                  <Text style={styles.emptyTitle}>
                    {t("profile.blockedScreen.empty.title")}
                  </Text>

                  <Text style={styles.emptyDescription}>
                    {t("profile.blockedScreen.empty.description")}
                  </Text>
                </View>
              )}
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

  metricCard: {
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
    color: BLUE,
    fontSize: 18,
    fontWeight: "900",
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

  personName: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
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

  unblockButton: {
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  unblockButtonText: {
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
});