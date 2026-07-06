import React from "react";
import { StyleSheet, Text, View } from "react-native";

const DISCLOSURE_ITEMS = [
  "Financial features declaration evidence required",
  "Tokenized Digital Asset disclosure required",
  "No NFT gambling / staking / chance-based unknown value",
  "Virtual card issuer/provider_not_configured until approved",
  "No raw PAN/CVV storage on Sabi infrastructure",
  "Use Sabi Virtual Visa Card naming only after issuer approval",
  "No Google Visa Card naming",
  "No fake NFT minting, card issuing, or balance",
] as const;

export type PlayReadyFinancialFeatureDisclosurePanelProps = {
  compact?: boolean;
  contextLabel?: string;
};

export default function PlayReadyFinancialFeatureDisclosurePanel({
  compact = false,
  contextLabel = "Financial features disclosure evidence",
}: PlayReadyFinancialFeatureDisclosurePanelProps) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <Text style={styles.eyebrow}>Financial features / TDA / virtual card</Text>
      <Text style={styles.title}>{contextLabel}</Text>
      <Text style={styles.body}>
        These features are policy-sensitive and stay provider_not_configured /
        safe-disabled until declaration, issuer/provider approval, compliance,
        KYB/KYC/AML, and server-side gates are complete. This mobile UI evidence
        does not call providers, expose secrets, store raw card data, mint NFTs,
        issue cards, fake balances, or move money.
      </Text>

      <View style={styles.list}>
        {DISCLOSURE_ITEMS.map((item) => (
          <View key={item} style={styles.row}>
            <View style={styles.dot} />
            <Text style={styles.rowText}>{item}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.reviewerNote}>
        Reviewer-safe copy: no investment promise, no gambling mechanics, no raw
        PAN/CVV, no fake card/NFT/balance success, and no provider readiness claim.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.18)",
    backgroundColor: "rgba(255,107,107,0.07)",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 9,
    marginBottom: 14,
  },
  cardCompact: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 18,
  },
  eyebrow: {
    color: "#FFB3B3",
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
  list: {
    gap: 7,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 4,
    backgroundColor: "#FFB3B3",
  },
  rowText: {
    flex: 1,
    color: "rgba(255,255,255,0.82)",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
  },
  reviewerNote: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
  },
});
