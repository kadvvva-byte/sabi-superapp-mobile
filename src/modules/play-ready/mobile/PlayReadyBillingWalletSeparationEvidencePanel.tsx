import React from "react";
import { StyleSheet, Text, View } from "react-native";

const DIGITAL_GOODS = [
  "AI Premium",
  "Stream Premium",
  "Stream gifts / badges / effects",
  "Messenger paid translation",
  "Premium stickers",
  "Game digital goods",
  "Sabi Coin when bought in Android Play build for digital goods",
] as const;

const REAL_WORLD_RAILS = [
  "QR Pay",
  "Merchant payments",
  "Business Account",
  "Airwallex",
  "Alipay",
  "Bank / issuer provider rails",
] as const;

export type PlayReadyBillingWalletSeparationEvidencePanelProps = {
  compact?: boolean;
  contextLabel?: string;
};

export default function PlayReadyBillingWalletSeparationEvidencePanel({
  compact = false,
  contextLabel = "Billing vs Wallet evidence",
}: PlayReadyBillingWalletSeparationEvidencePanelProps) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <Text style={styles.eyebrow}>Google Play Billing separation</Text>
      <Text style={styles.title}>{contextLabel}</Text>
      <Text style={styles.body}>
        Android Play digital goods must use Google Play Billing. Wallet, Airwallex,
        Alipay, QR Pay, merchant rails, and bank/provider rails are blocked for
        Android Play digital goods and remain real-world payment rails only.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Digital goods → Google Play Billing</Text>
        <View style={styles.pillWrap}>
          {DIGITAL_GOODS.map((item) => (
            <View key={item} style={styles.digitalPill}>
              <Text style={styles.digitalPillText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Real-world rails → Wallet / providers</Text>
        <View style={styles.pillWrap}>
          {REAL_WORLD_RAILS.map((item) => (
            <View key={item} style={styles.walletPill}>
              <Text style={styles.walletPillText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.reviewerNote}>
        Entitlement verification is pending/provider_not_configured in this mobile
        UI evidence. Refund, revoke, and expire states must be handled server-side
        before live billing. No fake purchase or fake entitlement success is shown.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,209,102,0.18)",
    backgroundColor: "rgba(255,209,102,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
    marginBottom: 14,
  },
  cardCompact: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 18,
  },
  eyebrow: {
    color: "#FFD166",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.45,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  body: {
    color: "rgba(239,247,255,0.76)",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
  },
  section: {
    gap: 7,
  },
  sectionTitle: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  pillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  digitalPill: {
    minHeight: 24,
    borderRadius: 12,
    paddingHorizontal: 9,
    justifyContent: "center",
    backgroundColor: "rgba(255,209,102,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,209,102,0.18)",
  },
  digitalPillText: {
    color: "#FFD166",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  walletPill: {
    minHeight: 24,
    borderRadius: 12,
    paddingHorizontal: 9,
    justifyContent: "center",
    backgroundColor: "rgba(112,255,216,0.10)",
    borderWidth: 1,
    borderColor: "rgba(112,255,216,0.14)",
  },
  walletPillText: {
    color: "#70FFD8",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  reviewerNote: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
  },
});
