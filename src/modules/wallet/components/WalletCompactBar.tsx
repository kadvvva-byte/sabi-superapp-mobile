import React, { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";

import { useI18n } from "../../../shared/i18n";
import {
  formatPrimaryWalletAmount,
  useWalletFoundation,
} from "../../../shared/wallet/wallet-foundation";
import { getWalletSharedTexts } from "../../../shared/wallet/wallet-i18n";

type WalletCompactBarProps = {
  top: number;
  animatedStyle: any;
  title?: string;
  amount?: string;
};

export default function WalletCompactBar({
  top,
  animatedStyle,
  title,
  amount,
}: WalletCompactBarProps) {
  const { t } = useI18n();
  const { snapshot } = useWalletFoundation();

  const texts = useMemo(() => getWalletSharedTexts(t), [t]);
  const fallbackAmount = useMemo(
    () => formatPrimaryWalletAmount(snapshot.mainBalanceUsd, snapshot.primaryCurrencyCode),
    [snapshot.mainBalanceUsd, snapshot.primaryCurrencyCode],
  );

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.bar,
        {
          top,
        },
        animatedStyle,
      ]}
    >
      <Text style={styles.title}>{title || texts.wallet}</Text>
      <Text style={styles.amount}>{amount || fallbackAmount}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 20,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(10,18,34,0.54)",
    borderColor: "rgba(255,255,255,0.06)",
  },

  title: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  amount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#B8C5D8",
  },
});
