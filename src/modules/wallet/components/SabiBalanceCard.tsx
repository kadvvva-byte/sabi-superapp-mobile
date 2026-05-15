import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useI18n } from "../../../shared/i18n";
import {
  formatPrimaryWalletAmount,
  useWalletFoundation,
} from "../../../shared/wallet/wallet-foundation";
import { getWalletSharedTexts } from "../../../shared/wallet/wallet-i18n";

export default function SabiBalanceCard() {
  const { t } = useI18n();
  const { snapshot } = useWalletFoundation();

  const texts = useMemo(() => getWalletSharedTexts(t), [t]);
  const mainBalanceText = useMemo(
    () => formatPrimaryWalletAmount(snapshot.mainBalanceUsd, snapshot.primaryCurrencyCode),
    [snapshot.mainBalanceUsd, snapshot.primaryCurrencyCode],
  );

  return (
    <LinearGradient
      colors={["rgba(20,40,70,0.94)", "rgba(10,22,42,0.98)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrapper}
    >
      <LinearGradient
        colors={[
          "rgba(124,255,91,0.04)",
          "rgba(92,140,255,0.06)",
          "transparent",
        ]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tint}
      />

      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.label}>{texts.sabiBalance}</Text>
          <Text style={styles.amount}>{mainBalanceText}</Text>
          <Text style={styles.desc}>{texts.sabiBalanceDescription}</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{texts.internal}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    borderRadius: 28,
    padding: 20,
    borderWidth: 0,
    overflow: "hidden",
  },

  tint: {
    ...StyleSheet.absoluteFillObject,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },

  left: {
    flex: 1,
  },

  label: {
    fontSize: 14,
    color: "#A8B8CF",
    marginBottom: 8,
  },

  amount: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 10,
  },

  desc: {
    fontSize: 14,
    lineHeight: 20,
    color: "#A8B8CF",
    maxWidth: 280,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 16,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
