import React, { useMemo } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowLeft,
  Coins,
  LockKeyhole,
  ShieldCheck,
  TriangleAlert,
  Wallet,
} from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import {
  formatPrimaryWalletAmount,
  useWalletFoundation,
} from "../../../shared/wallet/wallet-foundation";
import {
  formatCryptoWalletProviderStatusLabel,
  getCryptoWalletProviderReadiness,
  getCryptoWalletProviderReadinessText,
} from "../../../shared/wallet/wallet-crypto-provider";
import { useSabiTheme } from "../../../theme/ThemeProvider";

type WalletTranslator = (key: string) => string;

export type CryptoProviderScreenKey =
  | "assets"
  | "portfolio"
  | "assetDetails"
  | "buy"
  | "sell"
  | "swap"
  | "send"
  | "receive"
  | "history"
  | "transactionDetails"
  | "confirm"
  | "market"
  | "watchlist"
  | "networks"
  | "manageTokens"
  | "importToken"
  | "addressBook"
  | "addAddress"
  | "seedCreate"
  | "seedBackup"
  | "seedVerify";

function walletText(t: WalletTranslator, key: string, fallback: string) {
  const value = t(key);
  return value && value !== key ? value : fallback;
}

function getScreenFallback(screen: CryptoProviderScreenKey) {
  switch (screen) {
    case "assets":
      return { title: "Crypto assets", subtitle: "Provider-backed assets will appear after crypto provider connection." };
    case "portfolio":
      return { title: "Crypto portfolio", subtitle: "Portfolio value must come from the connected crypto provider." };
    case "assetDetails":
      return { title: "Asset details", subtitle: "Asset details require provider-backed wallet data." };
    case "buy":
      return { title: "Buy crypto", subtitle: "Crypto on-ramp must be executed through a configured provider route." };
    case "sell":
      return { title: "Sell crypto", subtitle: "Crypto off-ramp must be executed through a configured provider route." };
    case "swap":
      return { title: "Swap crypto", subtitle: "Swap quotes and execution require a configured provider route." };
    case "send":
      return { title: "Send crypto", subtitle: "Crypto sending requires wallet provider, risk checks and explicit confirmation." };
    case "receive":
      return { title: "Receive crypto", subtitle: "Receive addresses must be issued by the connected provider." };
    case "history":
      return { title: "Crypto history", subtitle: "Transactions will appear after provider synchronization." };
    case "transactionDetails":
      return { title: "Transaction details", subtitle: "Transaction data must come from provider or blockchain synchronization." };
    case "confirm":
      return { title: "Crypto confirmation", subtitle: "Crypto operations require provider confirmation and risk checks." };
    case "market":
      return { title: "Crypto market", subtitle: "Market data requires a configured market data provider." };
    case "watchlist":
      return { title: "Watchlist", subtitle: "Watchlist prices must come from a real market data provider." };
    case "networks":
      return { title: "Networks", subtitle: "Supported networks must come from the connected crypto provider." };
    case "manageTokens":
      return { title: "Manage tokens", subtitle: "Token list management requires provider-backed asset metadata." };
    case "importToken":
      return { title: "Import token", subtitle: "Custom tokens require provider validation before appearing in Wallet." };
    case "addressBook":
      return { title: "Address book", subtitle: "Saved crypto addresses require verified provider storage." };
    case "addAddress":
      return { title: "Add address", subtitle: "New addresses require provider validation and risk checks." };
    case "seedCreate":
      return { title: "Create seed", subtitle: "Seed/private-key flows are disabled until a real secure provider is connected." };
    case "seedBackup":
      return { title: "Seed backup", subtitle: "Seed backup requires a secure provider flow." };
    case "seedVerify":
      return { title: "Seed verification", subtitle: "Seed verification requires a secure provider flow." };
  }
}

export function CryptoProviderScreen({ screen }: { screen: CryptoProviderScreenKey }) {
  const { t } = useI18n();
  const theme = useSabiTheme();
  const { colors, radius } = theme;
  const { snapshot } = useWalletFoundation();

  const fallback = useMemo(() => getScreenFallback(screen), [screen]);
  const readiness = useMemo(
    () => getCryptoWalletProviderReadiness(snapshot, screen),
    [screen, snapshot],
  );
  const statusLabel = formatCryptoWalletProviderStatusLabel(readiness.reason);
  const statusText = getCryptoWalletProviderReadinessText(readiness.reason);
  const title = walletText(t, `wallet.cryptoProvider.screens.${screen}.title`, fallback.title);
  const subtitle = walletText(
    t,
    `wallet.cryptoProvider.screens.${screen}.subtitle`,
    fallback.subtitle,
  );

  const cryptoValue = readiness.canReadProviderBalances
    ? formatPrimaryWalletAmount(snapshot.cryptoBalanceUsd, snapshot.primaryCurrencyCode)
    : walletText(t, "wallet.cryptoProvider.providerNotConfiguredShort", "Provider not configured");

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { backgroundColor: colors.background }]}> 
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }: { pressed: boolean }) => [
            styles.backButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
              opacity: pressed ? 0.72 : 1,
            },
          ]}
        >
          <ArrowLeft size={20} color={colors.text} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.headerTextWrap}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>
            {walletText(t, "wallet.cryptoProvider.eyebrow", "CRYPTO WALLET")}
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["rgba(18,26,46,0.98)", "rgba(8,14,28,0.98)"]}
          style={[styles.heroCard, { borderRadius: radius.xl }]}
        >
          <View style={styles.heroIconWrap}>
            <Wallet size={24} color="#FFFFFF" strokeWidth={2.4} />
          </View>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </LinearGradient>

        <View style={[styles.statusCard, { borderColor: colors.border, backgroundColor: colors.card }]}> 
          <View style={[styles.statusIcon, { backgroundColor: "rgba(255,190,104,0.14)" }]}> 
            <TriangleAlert size={20} color="#FFCF8A" strokeWidth={2.4} />
          </View>
          <View style={styles.statusTextWrap}>
            <Text style={[styles.statusTitle, { color: colors.text }]}> 
              {walletText(t, "wallet.cryptoProvider.providerStatusTitle", statusLabel)}
            </Text>
            <Text style={[styles.statusText, { color: colors.textSecondary }]}> 
              {walletText(
                t,
                "wallet.cryptoProvider.providerStatusText",
                statusText,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={[styles.metricCard, { borderColor: colors.border, backgroundColor: colors.card }]}> 
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}> 
              {walletText(t, "wallet.cryptoProvider.cryptoValue", "Crypto value")}
            </Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>{cryptoValue}</Text>
          </View>
          <View style={[styles.metricCard, { borderColor: colors.border, backgroundColor: colors.card }]}> 
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}> 
              {walletText(t, "wallet.cryptoProvider.status", "Status")}
            </Text>
            <Text style={[styles.metricValue, { color: "#FFCF8A" }]}> 
              {walletText(t, "wallet.cryptoProvider.disabled", statusLabel)}
            </Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <InfoCard
            icon={<ShieldCheck size={19} color="#9FE7C3" strokeWidth={2.4} />}
            title={walletText(t, "wallet.cryptoProvider.securityTitle", "Security provider")}
            text={walletText(
              t,
              "wallet.cryptoProvider.securityText",
              "Send, swap, buy and sell must pass KYC/AML, device checks and explicit confirmation.",
            )}
            colors={colors}
            radius={radius.lg}
          />
          <InfoCard
            icon={<LockKeyhole size={19} color="#BCA8FF" strokeWidth={2.4} />}
            title={walletText(t, "wallet.cryptoProvider.keysTitle", "Provider-secured keys")}
            text={walletText(
              t,
              "wallet.cryptoProvider.keysText",
              "Seed phrases, addresses and private keys must come only from a secure crypto provider flow.",
            )}
            colors={colors}
            radius={radius.lg}
          />
          <InfoCard
            icon={<Coins size={19} color="#9ED6FF" strokeWidth={2.4} />}
            title={walletText(t, "wallet.cryptoProvider.marketTitle", "Real market data")}
            text={walletText(
              t,
              "wallet.cryptoProvider.marketText",
              "Assets, prices, charts, balances and history must come from provider APIs. Fake prices, fake balances and fake transactions are blocked.",
            )}
            colors={colors}
            radius={radius.lg}
          />
        </View>

        <Pressable
          onPress={() => router.replace("/wallet/crypto" as never)}
          style={({ pressed }: { pressed: boolean }) => [styles.primaryAction, { opacity: pressed ? 0.78 : 1 }]}
        >
          <Text style={styles.primaryActionText}>
            {walletText(t, "wallet.cryptoProvider.backToCrypto", "Back to Crypto Wallet")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoCard({
  icon,
  title,
  text,
  colors,
  radius,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  colors: ReturnType<typeof useSabiTheme>["colors"];
  radius: number;
}) {
  return (
    <View style={[styles.infoCard, { borderColor: colors.border, backgroundColor: colors.card, borderRadius: radius }]}> 
      <View style={styles.infoIcon}>{icon}</View>
      <Text style={[styles.infoTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.infoText, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  );
}

export default CryptoProviderScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    minHeight: 72,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
    zIndex: 10,
    elevation: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTextWrap: { flex: 1, minWidth: 0 },
  eyebrow: { fontSize: 11, lineHeight: 14, fontWeight: "900", letterSpacing: 0.8 },
  headerTitle: { marginTop: 2, fontSize: 19, lineHeight: 24, fontWeight: "900" },
  screen: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 36 },
  heroCard: { padding: 20, overflow: "hidden", marginBottom: 14 },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    marginBottom: 14,
  },
  heroTitle: { color: "#FFFFFF", fontSize: 25, lineHeight: 31, fontWeight: "900" },
  heroSubtitle: { color: "rgba(255,255,255,0.74)", marginTop: 8, fontSize: 14, lineHeight: 20, fontWeight: "700" },
  statusCard: { borderWidth: 1, borderRadius: 22, padding: 16, flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  statusIcon: { width: 42, height: 42, borderRadius: 17, alignItems: "center", justifyContent: "center", marginRight: 12 },
  statusTextWrap: { flex: 1, minWidth: 0 },
  statusTitle: { fontSize: 16, lineHeight: 21, fontWeight: "900" },
  statusText: { marginTop: 5, fontSize: 13, lineHeight: 19, fontWeight: "700" },
  metricRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  metricCard: { flex: 1, borderWidth: 1, borderRadius: 20, padding: 14, minHeight: 86, justifyContent: "center" },
  metricLabel: { fontSize: 12, lineHeight: 16, fontWeight: "800" },
  metricValue: { marginTop: 7, fontSize: 18, lineHeight: 23, fontWeight: "900" },
  infoGrid: { gap: 12 },
  infoCard: { borderWidth: 1, padding: 15 },
  infoIcon: { marginBottom: 10 },
  infoTitle: { fontSize: 14, lineHeight: 18, fontWeight: "900" },
  infoText: { marginTop: 6, fontSize: 12, lineHeight: 18, fontWeight: "700" },
  primaryAction: {
    marginTop: 18,
    minHeight: 52,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9FE7C3",
  },
  primaryActionText: { color: "#07150F", fontSize: 14, lineHeight: 18, fontWeight: "900" },
});
