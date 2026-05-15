import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Coins, CreditCard, Settings, Wallet } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "../../../shared/i18n";
import {
  formatCoinWalletAmount,
  formatLocalWalletAmount,
  formatPrimaryWalletAmount,
  formatUsdWalletAmount,
  useWalletFoundation,
} from "../../../shared/wallet/wallet-foundation";
import { getWalletSharedTexts, walletText } from "../../../shared/wallet/wallet-i18n";

export default function WalletPanel({
  onBack,
}: {
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { snapshot, loading } = useWalletFoundation();

  const shared = useMemo(() => getWalletSharedTexts(t), [t]);
  const texts = useMemo(
    () => ({
      subtitle: walletText(
        t,
        "home.walletPanel.subtitle",
        "Hamyon, kartalar, COIN, kripto va to‘lovlar",
      ),
      openWallet: walletText(t, "home.walletPanel.openWallet", "Hamyonni ochish"),
      settings: walletText(t, "home.walletPanel.settings", "Sozlamalar"),
      updating: walletText(t, "home.walletPanel.updating", "Hamyon holati yangilanmoqda..."),
      localRoute: walletText(t, "home.walletPanel.localRoute", "Mahalliy yo‘nalish"),
    }),
    [t],
  );

  const mainBalance = useMemo(
    () => formatPrimaryWalletAmount(snapshot.mainBalanceUsd, snapshot.primaryCurrencyCode),
    [snapshot.mainBalanceUsd, snapshot.primaryCurrencyCode],
  );

  const localBalance = useMemo(
    () => formatLocalWalletAmount(snapshot.localBalance, snapshot.localCurrencyCode),
    [snapshot.localBalance, snapshot.localCurrencyCode],
  );

  const coinBalance = useMemo(
    () => formatCoinWalletAmount(snapshot.coinBalance),
    [snapshot.coinBalance],
  );

  const cryptoBalance = useMemo(
    () => formatUsdWalletAmount(snapshot.cryptoBalanceUsd),
    [snapshot.cryptoBalanceUsd],
  );

  const handleOpenWallet = () => {
    router.push("/wallet/home" as never);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 14),
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (onBack) onBack();
            else router.back();
          }}
          style={styles.iconButton}
        >
          <ArrowLeft size={18} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>{shared.wallet}</Text>
          <Text style={styles.headerSubtitle}>{texts.subtitle}</Text>
        </View>

        <Pressable
          onPress={() => router.push("/wallet/settings" as never)}
          style={styles.iconButtonGhost}
        >
          <Settings size={18} color="rgba(255,255,255,0.88)" />
        </Pressable>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>{shared.mainBalance}</Text>
        <Text style={styles.balanceValue}>{loading ? "…" : mainBalance}</Text>
        <Text style={styles.balanceHint}>{snapshot.primaryCurrencyCode}</Text>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryCell icon={<CreditCard size={16} color="#EAF1FF" />} label={texts.localRoute} value={loading ? "…" : localBalance} />
        <SummaryCell icon={<Coins size={16} color="#EAF1FF" />} label={shared.coinBalance} value={loading ? "…" : coinBalance} />
        <SummaryCell icon={<Wallet size={16} color="#EAF1FF" />} label={shared.cryptoValue} value={loading ? "…" : cryptoBalance} />
      </View>

      {loading ? <Text style={styles.runtimeState}>{texts.updating}</Text> : null}

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionButton, styles.primaryAction]}
          onPress={handleOpenWallet}
        >
          <Text style={styles.primaryActionText}>{texts.openWallet}</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={() => router.push("/wallet/settings" as never)}
        >
          <Text style={styles.primaryActionText}>{texts.settings}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SummaryCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryCell}>
      <View style={styles.summaryIcon}>{icon}</View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 16,
  },
  topGlow: {
    position: "absolute",
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(93,163,255,0.12)",
  },
  bottomGlow: {
    position: "absolute",
    left: -70,
    bottom: 80,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: "rgba(0,194,132,0.08)",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#1B2430",
    borderWidth: 1,
    borderColor: "#2C394B",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonGhost: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#18212B",
    borderWidth: 1,
    borderColor: "#273241",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrap: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 20,
  },
  balanceCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: "#16202A",
    borderWidth: 1,
    borderColor: "#2A3746",
    marginBottom: 12,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    marginBottom: 6,
  },
  balanceValue: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
  },
  balanceHint: {
    marginTop: 8,
    color: "#BFD5FF",
    fontSize: 14,
    fontWeight: "800",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  summaryCell: {
    flex: 1,
    minHeight: 92,
    borderRadius: 18,
    padding: 10,
    backgroundColor: "#16202A",
    borderWidth: 1,
    borderColor: "#2A3746",
  },
  summaryIcon: {
    width: 28,
    height: 28,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  runtimeState: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A2430",
    borderWidth: 1,
    borderColor: "#2C394B",
    flexDirection: "row",
    gap: 8,
  },
  primaryAction: {
    backgroundColor: "#243244",
    borderColor: "#3A4B61",
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});
