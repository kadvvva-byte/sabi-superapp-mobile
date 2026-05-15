import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useI18n } from "../../../shared/i18n";
import {
  formatCoinWalletAmount,
  formatLocalWalletAmount,
  formatPrimaryWalletAmount,
  formatUsdWalletAmount,
  isWalletProviderReady,
  useWalletFoundation,
} from "../../../shared/wallet/wallet-foundation";
import { getWalletSharedTexts } from "../../../shared/wallet/wallet-i18n";

const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function WalletBalanceCard() {
  const glow = useSharedValue(0.72);
  const { t } = useI18n();
  const { snapshot } = useWalletFoundation();

  const texts = useMemo(() => getWalletSharedTexts(t), [t]);

  const mainBalanceText = useMemo(
    () => formatPrimaryWalletAmount(snapshot.mainBalanceUsd, snapshot.primaryCurrencyCode),
    [snapshot.mainBalanceUsd, snapshot.primaryCurrencyCode],
  );

  const localBalanceText = useMemo(
    () =>
      snapshot.localCurrencyCode
        ? formatLocalWalletAmount(snapshot.localBalance, snapshot.localCurrencyCode)
        : texts.notConfigured,
    [snapshot.localBalance, snapshot.localCurrencyCode, texts.notConfigured],
  );

  const coinBalanceText = useMemo(
    () => formatCoinWalletAmount(snapshot.coinBalance),
    [snapshot.coinBalance],
  );

  const cryptoBalanceText = useMemo(
    () =>
      isWalletProviderReady(snapshot.cryptoProviderStatus)
        ? formatUsdWalletAmount(snapshot.cryptoBalanceUsd)
        : texts.providerNotConfigured,
    [snapshot.cryptoBalanceUsd, snapshot.cryptoProviderStatus, texts.providerNotConfigured],
  );

  useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 2200 }), -1, true);
  }, [glow]);

  const amountGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0.72, 1], [0.92, 1]),
    transform: [{ scale: interpolate(glow.value, [0.72, 1], [1, 1.01]) }],
  }));

  const ambientStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0.72, 1], [0.12, 0.22]),
  }));

  return (
    <View style={styles.wrapper}>
      <AnimatedView style={[styles.ambientGlow, ambientStyle]} pointerEvents="none" />

      <LinearGradient
        colors={["rgba(18,38,72,0.98)", "rgba(11,24,48,0.98)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <LinearGradient
          colors={[
            "rgba(112,156,255,0.08)",
            "rgba(124,255,91,0.025)",
            "rgba(255,255,255,0.015)",
          ]}
          start={{ x: 0.05, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tint}
          pointerEvents="none"
        />

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.label}>{texts.totalBalance}</Text>
            <AnimatedText style={[styles.amount, amountGlowStyle]}>
              {mainBalanceText}
            </AnimatedText>
            <Text style={styles.delta}>{texts.walletBalance}</Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{texts.personal}</Text>
          </View>
        </View>

        <View style={styles.metrics}>
          <Metric label={texts.localBalance} value={localBalanceText} />
          <Metric label={texts.coinBalance} value={coinBalanceText} />
          <Metric label={texts.cryptoValue} value={cryptoBalanceText} />
        </View>
      </LinearGradient>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    position: "relative",
  },

  ambientGlow: {
    position: "absolute",
    top: -10,
    left: -6,
    right: -6,
    bottom: -10,
    borderRadius: 34,
    backgroundColor: "rgba(98,146,255,0.05)",
  },

  card: {
    borderRadius: 30,
    padding: 22,
    borderWidth: 0,
    overflow: "hidden",
  },

  tint: {
    ...StyleSheet.absoluteFillObject,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 22,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A8B8CF",
    marginBottom: 10,
  },

  amount: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -1,
    marginBottom: 6,
  },

  delta: {
    fontSize: 14,
    fontWeight: "700",
    color: "#82F0B4",
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  metrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },

  metric: {
    flex: 1,
  },

  metricLabel: {
    fontSize: 12,
    color: "#90A4C0",
    marginBottom: 6,
  },

  metricValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
