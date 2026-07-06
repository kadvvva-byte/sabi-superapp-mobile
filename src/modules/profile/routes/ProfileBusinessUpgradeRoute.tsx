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
import { BriefcaseBusiness, Sparkles } from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import {
  PROFILE_BUSINESS_PLANS,
  PROFILE_LAUNCH_OFFER,
} from "../data/profile";

const BG = "#050A12";
const BG_2 = "#0E1020";
const BG_3 = "#281135";
const SURFACE = "rgba(255,255,255,0.06)";
const STROKE = "rgba(255,255,255,0.10)";
const TEXT = "#F8FAFC";
const MUTED = "#E0CCFF";
const ACCENT = "#D182FF";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

type BusinessPlanLike = {
  key: string;
  title?: string;
  period?: string;
  badge?: string;
  price?: string;
  description?: string;
};

type FeatureKey =
  | "address"
  | "workHours"
  | "quickReplies"
  | "greetings"
  | "notAvailable"
  | "chatLinks";

function FeatureCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

export default function BusinessUpgradeScreen() {
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

  const featureKeys = useMemo<FeatureKey[]>(
    () => [
      "address",
      "workHours",
      "quickReplies",
      "greetings",
      "notAvailable",
      "chatLinks",
    ],
    [],
  );

  const plans = PROFILE_BUSINESS_PLANS as BusinessPlanLike[];

  const planText = useCallback(
    (planKey: string, field: "title" | "period" | "price" | "description" | "badge") =>
      t(`profile.businessUpgradeScreen.plans.${planKey}.${field}`),
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
                {t("profile.businessUpgradeScreen.header.backAction")}
              </Text>
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.eyebrow}>
                {t("profile.businessUpgradeScreen.header.eyebrow")}
              </Text>
              <Text style={styles.title}>
                {t("profile.businessUpgradeScreen.header.title")}
              </Text>
              <Text style={styles.subtitle}>
                {t("profile.businessUpgradeScreen.header.subtitle", {
                  freeMonths: PROFILE_LAUNCH_OFFER.freeMonths,
                })}
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
                "rgba(209,130,255,0.24)",
                "rgba(105,169,255,0.14)",
                "rgba(255,255,255,0.05)",
              ]}
              style={styles.heroCard}
            >
              <View style={styles.heroIcon}>
                <BriefcaseBusiness size={34} color="#FFFFFF" strokeWidth={2.2} />
              </View>

              <Text style={styles.heroTitle}>
                {t("profile.businessUpgradeScreen.hero.title")}
              </Text>
              <Text style={styles.heroText}>
                {t("profile.businessUpgradeScreen.hero.description")}
              </Text>

              <View style={styles.launchBadge}>
                <Sparkles size={14} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.launchBadgeText}>
                  {t("profile.businessUpgradeScreen.hero.launchBadge", {
                    freeMonths: PROFILE_LAUNCH_OFFER.freeMonths,
                  })}
                </Text>
              </View>
            </LinearGradient>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.businessUpgradeScreen.sections.plans")}
              </Text>

              {plans.map((plan) => (
                <View key={plan.key} style={styles.planCard}>
                  <View style={styles.planTop}>
                    <View>
                      <Text style={styles.planTitle}>
                        {planText(plan.key, "title")}
                      </Text>
                      <Text style={styles.planPeriod}>
                        {planText(plan.key, "period")}
                      </Text>
                    </View>

                    {plan.badge ? (
                      <Text style={styles.planBadge}>
                        {planText(plan.key, "badge")}
                      </Text>
                    ) : null}
                  </View>

                  <Text style={styles.planPrice}>
                    {planText(plan.key, "price")}
                  </Text>
                  <Text style={styles.planDescription}>
                    {planText(plan.key, "description")}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.businessUpgradeScreen.sections.features")}
              </Text>

              {featureKeys.map((featureKey) => (
                <FeatureCard
                  key={featureKey}
                  title={t(
                    `profile.businessUpgradeScreen.features.${featureKey}.title`,
                  )}
                  text={t(
                    `profile.businessUpgradeScreen.features.${featureKey}.description`,
                  )}
                />
              ))}
            </View>

            <Pressable style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>
                {t("profile.businessUpgradeScreen.cta")}
              </Text>
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

  heroCard: {
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    marginBottom: 14,
  },

  heroTitle: {
    color: TEXT,
    fontSize: 28,
    fontWeight: "900",
  },

  heroText: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    fontWeight: "600",
  },

  launchBadge: {
    marginTop: 14,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  launchBadgeText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "800",
  },

  section: { gap: 10 },

  sectionTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "900",
    paddingHorizontal: 2,
  },

  planCard: {
    borderRadius: 22,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: STROKE,
    padding: 16,
  },

  planTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },

  planTitle: {
    color: TEXT,
    fontSize: 17,
    fontWeight: "900",
  },

  planPeriod: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },

  planBadge: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  planPrice: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 12,
  },

  planDescription: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    fontWeight: "600",
  },

  featureCard: {
    borderRadius: 22,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: STROKE,
    padding: 16,
  },

  featureTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "900",
  },

  featureText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    fontWeight: "600",
  },

  ctaButton: {
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },

  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});