import React, { useCallback, useMemo, useState } from "react";
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
  Gift,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import {
  PROFILE_CREDIT_BALANCE,
  PROFILE_CREDIT_OPERATIONS,
} from "../data/profile";

const BG = "#050A12";
const BG_2 = "#0D1222";
const BG_3 = "#151A2D";
const SURFACE = "rgba(255,255,255,0.06)";
const SURFACE_2 = "rgba(255,255,255,0.04)";
const STROKE = "rgba(255,255,255,0.09)";
const TEXT = "#F8FAFC";
const MUTED = "#B5C8DD";
const ACCENT = "#F6B21A";
const POSITIVE = "#22C55E";
const NEGATIVE = "#F87171";

type CreditTab = "all" | "incoming" | "outgoing";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

type CreditOperation = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  direction: "in" | "out";
  amount: string;
};

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function CreditsScreen() {
  const i18n = useI18n() as I18nHookValue;
  const [activeTab, setActiveTab] = useState<CreditTab>("all");

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

  const operations = PROFILE_CREDIT_OPERATIONS as CreditOperation[];

  const filteredOperations = useMemo(() => {
    if (activeTab === "incoming") {
      return operations.filter((item) => item.direction === "in");
    }
    if (activeTab === "outgoing") {
      return operations.filter((item) => item.direction === "out");
    }
    return operations;
  }, [activeTab, operations]);

  const getOperationText = useCallback(
    (id: string, field: "title" | "subtitle") => {
      const key = `profile.creditsScreen.operations.${id}.${field}`;
      const translated = t(key);
      return translated === key ? "" : translated;
    },
    [t],
  );

  return (
    <LinearGradient colors={[BG, BG_2, BG_3]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "left", "right", "bottom"]}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable
              style={styles.headerButton}
              onPress={() => router.replace("/profile")}
            >
              <Text style={styles.headerButtonText}>
                {t("profile.creditsScreen.header.backAction")}
              </Text>
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.eyebrow}>
                {t("profile.creditsScreen.header.eyebrow")}
              </Text>
              <Text style={styles.title}>
                {t("profile.creditsScreen.header.title")}
              </Text>
              <Text style={styles.subtitle}>
                {t("profile.creditsScreen.header.subtitle")}
              </Text>
            </View>

            <View style={styles.headerGhost} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <LinearGradient
              colors={[
                "rgba(246,178,26,0.18)",
                "rgba(255,255,255,0.06)",
                "rgba(255,255,255,0.03)",
              ]}
              style={styles.balanceCard}
            >
              <View style={styles.balanceIconWrap}>
                <Sparkles size={28} color={ACCENT} strokeWidth={2.2} />
              </View>

              <Text style={styles.balanceLabel}>
                {t("profile.creditsScreen.balance.label")}
              </Text>
              <Text style={styles.balanceValue}>{PROFILE_CREDIT_BALANCE}</Text>

              <View style={styles.balanceActions}>
                <Pressable style={styles.balanceButton}>
                  <Text style={styles.balanceButtonText}>
                    {t("profile.creditsScreen.balance.actions.topUp")}
                  </Text>
                </Pressable>

                <Pressable style={styles.balanceButton}>
                  <Text style={styles.balanceButtonText}>
                    {t("profile.creditsScreen.balance.actions.statistics")}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.balanceTextButton}
                  onPress={() => router.push("/profile/gifts")}
                >
                  <Gift size={14} color={ACCENT} strokeWidth={2.4} />
                  <Text style={styles.balanceTextButtonText}>
                    {t("profile.creditsScreen.balance.actions.giftCenter")}
                  </Text>
                </Pressable>
              </View>
            </LinearGradient>

            <View style={styles.tabsRow}>
              <TabButton
                label={t("profile.creditsScreen.tabs.all")}
                active={activeTab === "all"}
                onPress={() => setActiveTab("all")}
              />
              <TabButton
                label={t("profile.creditsScreen.tabs.incoming")}
                active={activeTab === "incoming"}
                onPress={() => setActiveTab("incoming")}
              />
              <TabButton
                label={t("profile.creditsScreen.tabs.outgoing")}
                active={activeTab === "outgoing"}
                onPress={() => setActiveTab("outgoing")}
              />
            </View>

            <View style={styles.groupCard}>
              {filteredOperations.map((item, index) => {
                const positive = item.direction === "in";
                const translatedTitle = getOperationText(item.id, "title");
                const translatedSubtitle = getOperationText(item.id, "subtitle");

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.opRow,
                      index !== filteredOperations.length - 1 && styles.opBorder,
                    ]}
                  >
                    <View style={styles.opIconWrap}>
                      {positive ? (
                        <TrendingUp size={16} color={POSITIVE} strokeWidth={2.4} />
                      ) : (
                        <TrendingDown size={16} color={NEGATIVE} strokeWidth={2.4} />
                      )}
                    </View>

                    <View style={styles.opTextWrap}>
                      <Text style={styles.opTitle}>
                        {translatedTitle || item.title}
                      </Text>
                      <Text style={styles.opSubtitle}>
                        {translatedSubtitle || item.subtitle}
                      </Text>
                      <Text style={styles.opDate}>{item.date}</Text>
                    </View>

                    <Text
                      style={[
                        styles.opAmount,
                        { color: positive ? POSITIVE : NEGATIVE },
                      ]}
                    >
                      {item.amount}
                    </Text>
                  </View>
                );
              })}
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
  container: { flex: 1, paddingHorizontal: 16 },

  header: {
    paddingTop: 6,
    paddingBottom: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },

  headerCenter: { flex: 1 },

  headerButton: {
    minWidth: 64,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: STROKE,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  headerButtonText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "800",
  },

  headerGhost: { width: 64 },

  eyebrow: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 6,
  },

  title: {
    color: TEXT,
    fontSize: 28,
    fontWeight: "900",
  },

  subtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    fontWeight: "600",
  },

  scrollContent: {
    paddingBottom: 34,
    gap: 14,
  },

  balanceCard: {
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  balanceIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
  },

  balanceLabel: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "800",
  },

  balanceValue: {
    color: TEXT,
    fontSize: 44,
    fontWeight: "900",
    marginTop: 4,
  },

  balanceActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },

  balanceButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "#69A9FF",
    alignItems: "center",
    justifyContent: "center",
  },

  balanceButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  balanceTextButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: SURFACE_2,
    borderWidth: 1,
    borderColor: STROKE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  balanceTextButtonText: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: "900",
  },

  tabsRow: {
    flexDirection: "row",
    gap: 8,
  },

  tabButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    backgroundColor: SURFACE_2,
    borderWidth: 1,
    borderColor: STROKE,
    alignItems: "center",
    justifyContent: "center",
  },

  tabButtonActive: {
    backgroundColor: "rgba(246,178,26,0.14)",
    borderColor: "rgba(246,178,26,0.28)",
  },

  tabButtonText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "800",
  },

  tabButtonTextActive: {
    color: TEXT,
  },

  groupCard: {
    borderRadius: 24,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: STROKE,
    overflow: "hidden",
  },

  opRow: {
    minHeight: 84,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: SURFACE_2,
  },

  opBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },

  opIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  opTextWrap: { flex: 1 },

  opTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  opSubtitle: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
    fontWeight: "700",
  },

  opDate: {
    color: MUTED,
    fontSize: 11,
    marginTop: 5,
    fontWeight: "600",
  },

  opAmount: {
    fontSize: 18,
    fontWeight: "900",
  },
});