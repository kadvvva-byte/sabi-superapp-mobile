import React from "react";
import { StyleSheet, Text, View } from "react-native";

const PROVIDER_EVIDENCE_AREAS = [
  "AI",
  "Stream",
  "Wallet",
  "Airwallex",
  "Alipay",
  "NFT / tokenized assets",
  "Virtual card issuing",
  "Google Play Billing",
] as const;

export type PlayReadyProviderNotConfiguredEvidencePanelProps = {
  compact?: boolean;
  contextLabel?: string;
};

export default function PlayReadyProviderNotConfiguredEvidencePanel({
  compact = false,
  contextLabel = "Play-ready provider evidence",
}: PlayReadyProviderNotConfiguredEvidencePanelProps) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <Text style={styles.eyebrow}>provider_not_configured / safe-disabled</Text>
      <Text style={styles.title}>{contextLabel}</Text>
      <Text style={styles.body}>
        Provider-dependent features stay safe-disabled until server-side providers,
        billing, issuer, KYB/KYC/AML, and compliance gates are ready. This mobile UI
        evidence does not call providers, expose secrets, move money, issue cards,
        mint NFTs, or show fake provider success.
      </Text>

      <View style={styles.grid}>
        {PROVIDER_EVIDENCE_AREAS.map((area) => (
          <View key={area} style={styles.pill}>
            <View style={styles.dot} />
            <Text style={styles.pillText}>{area}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.reviewerNote}>
        Reviewer-safe copy: secret values are redacted; only safe-disabled state is shown.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(112,255,216,0.18)",
    backgroundColor: "rgba(112,255,216,0.07)",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 8,
    marginBottom: 14,
  },
  cardCompact: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 18,
  },
  eyebrow: {
    color: "#70FFD8",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  body: {
    color: "rgba(239,247,255,0.74)",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  pill: {
    minHeight: 24,
    borderRadius: 12,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFD166",
  },
  pillText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  reviewerNote: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
  },
});
