import { router } from "expo-router";
import { Crown, Languages, Mic, ShieldCheck } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useI18n } from "../../../../shared/i18n";
import { aiMobileText } from "../aiMobileI18n";
import { AI_MOBILE_COLORS } from "../aiMobileTheme";
import {
  AiGlassCard,
  AiMobileScaffold,
  AiStatusPill,
} from "../components/AiMobileScaffold";
import { useAiMobileSnapshot } from "../useAiMobileSnapshot";
import PlayReadyBillingWalletSeparationEvidencePanel from "../../../play-ready/mobile/PlayReadyBillingWalletSeparationEvidencePanel";

type PremiumFeature = {
  key: string;
  title: string;
  icon: React.ReactNode;
  badge: string;
};

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readStatus(value: unknown): "ready" | "limited" | "not_connected" | "error" {
  return value === "ready" ||
    value === "limited" ||
    value === "not_connected" ||
    value === "error"
    ? value
    : "limited";
}

function isPremiumEnabled(snapshot: unknown): boolean {
  const root = toRecord(snapshot);
  const premium = toRecord(root?.premium);
  return premium?.enabled === true;
}

function PremiumFeatureRow({ feature }: { feature: PremiumFeature }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>{feature.icon}</View>

      <Text style={styles.featureTitle} numberOfLines={1}>
        {feature.title}
      </Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{feature.badge}</Text>
      </View>
    </View>
  );
}

export default function AiMobilePremiumScreen() {
  const { language } = useI18n();
  const { snapshot, isLoading, refresh } = useAiMobileSnapshot();

  const status = isPremiumEnabled(snapshot)
    ? "ready"
    : readStatus(toRecord(snapshot)?.status);

  const features: PremiumFeature[] = [
    {
      key: "call_translation",
      title: aiMobileText(language, "premium.realtimeCallTranslationTitle"),
      badge: aiMobileText(language, "premium.badge"),
      icon: <Languages size={18} color={AI_MOBILE_COLORS.text} strokeWidth={2.4} />,
    },
    {
      key: "media_translation",
      title: aiMobileText(language, "premium.mediaTranslationTitle"),
      badge: aiMobileText(language, "premium.badge"),
      icon: <Mic size={18} color={AI_MOBILE_COLORS.text} strokeWidth={2.4} />,
    },
    {
      key: "safe_actions",
      title: aiMobileText(language, "premium.advancedAssistantActionsTitle"),
      badge: aiMobileText(language, "premium.safeBadge"),
      icon: <ShieldCheck size={18} color={AI_MOBILE_COLORS.text} strokeWidth={2.4} />,
    },
  ];

  return (
    <AiMobileScaffold
      title={aiMobileText(language, "premium.title")}
      subtitle={aiMobileText(language, `status.${status}`)}
      onRefresh={refresh}
      isRefreshing={isLoading}
    >
      <View style={styles.statusRow}>
        <AiStatusPill status={status} label={aiMobileText(language, `status.${status}`)} />
        <AiStatusPill status="ready" label="COIN" />
      </View>

      <AiGlassCard>
        {features.map((feature) => (
          <PremiumFeatureRow key={feature.key} feature={feature} />
        ))}
      </AiGlassCard>

      <PlayReadyBillingWalletSeparationEvidencePanel
        compact
        contextLabel="AI Premium billing separation evidence"
      />

      <Pressable
        onPress={() => router.push("/profile/premium" as never)}
        style={styles.openPremiumButton}
      >
        <Crown size={18} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />
        <Text style={styles.openPremiumText}>
          {aiMobileText(language, "premium.openProfilePremium")}
        </Text>
      </Pressable>
    </AiMobileScaffold>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureRow: {
    minHeight: 58,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 10,
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  featureTitle: {
    flex: 1,
    color: AI_MOBILE_COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  badge: {
    minHeight: 28,
    borderRadius: 12,
    paddingHorizontal: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,211,107,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,211,107,0.24)",
  },
  badgeText: {
    color: AI_MOBILE_COLORS.gold,
    fontSize: 10,
    fontWeight: "900",
  },
  openPremiumButton: {
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: "rgba(255,211,107,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,211,107,0.28)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  openPremiumText: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
});