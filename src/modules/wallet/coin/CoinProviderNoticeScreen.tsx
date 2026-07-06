import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Coins, Diamond, History, Lock, PiggyBank, ShieldCheck, Wallet } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import WalletScreenShell from "../components/WalletScreenShell";
import WalletScrollScreen from "../components/WalletScrollScreen";
import { formatAmountCoin, formatAmountDiamonds, selectTotalCoin } from "./coinWalletSelectors";
import { useCoinWalletStore } from "./coinWalletStore";
import { useI18n } from "../../../shared/i18n";
import { walletText } from "../../../shared/wallet/wallet-i18n";
import { useWalletFoundation } from "../../../shared/wallet/wallet-foundation";
import {
  buildCoinWalletBridgeGuard,
  type CoinWalletBridgeRouteKind,
} from "../../../shared/wallet/wallet-coin-bridge";
import { useSabiTheme } from "../../../theme/ThemeProvider";
import PlayReadyBillingWalletSeparationEvidencePanel from "../../play-ready/mobile/PlayReadyBillingWalletSeparationEvidencePanel";

type CoinProviderTone = "coin" | "diamond" | "earn" | "history";

type CoinProviderNoticeScreenProps = {
  screenKey: string;
  fallbackTitle: string;
  fallbackSubtitle: string;
  tone?: CoinProviderTone;
  bridgeRouteKind?: CoinWalletBridgeRouteKind;
};

function getToneColor(tone: CoinProviderTone) {
  if (tone === "diamond") return "#4A239B";
  if (tone === "earn") return "#125F47";
  if (tone === "history") return "#243B6B";
  return "#0B6B52";
}

function getToneIcon(tone: CoinProviderTone) {
  if (tone === "diamond") return Diamond;
  if (tone === "earn") return PiggyBank;
  if (tone === "history") return History;
  return Coins;
}

export default function CoinProviderNoticeScreen({
  screenKey,
  fallbackTitle,
  fallbackSubtitle,
  tone = "coin",
  bridgeRouteKind = "view",
}: CoinProviderNoticeScreenProps) {
  const { t } = useI18n();
  const { colors, radius } = useSabiTheme();
  const insets = useSafeAreaInsets();
  const wallet = useCoinWalletStore();
  const { snapshot } = useWalletFoundation();

  const guard = useMemo(
    () =>
      buildCoinWalletBridgeGuard({
        snapshot,
        routeKind: bridgeRouteKind,
        amountCoin: 0,
        riskStatus: "clear",
      }),
    [bridgeRouteKind, snapshot],
  );

  const texts = useMemo(
    () => ({
      eyebrow: walletText(t, "wallet.coinProvider.eyebrow", "SABI COIN"),
      title: walletText(t, `wallet.coinProvider.screens.${screenKey}.title`, fallbackTitle),
      subtitle: walletText(t, `wallet.coinProvider.screens.${screenKey}.subtitle`, fallbackSubtitle),
      providerTitle: walletText(t, "wallet.coinProvider.providerTitle", "Provider not configured"),
      providerText: walletText(
        t,
        "wallet.coinProvider.providerText",
        "COIN financial operations require the real wallet backend, provider route, admin controls and security confirmation.",
      ),
      noFakeTitle: walletText(t, "wallet.coinProvider.noFakeTitle", "Provider-backed COIN execution"),
      noFakeText: walletText(
        t,
        "wallet.coinProvider.noFakeText",
        "Top up, send, withdrawal, diamonds, deposits and income records require backend/provider execution.",
      ),
      securityTitle: walletText(t, "wallet.coinProvider.securityTitle", "Wallet security route"),
      securityText: walletText(
        t,
        "wallet.coinProvider.securityText",
        "Real COIN movement must pass unified user ID, wallet risk checks, explicit confirmation and provider status.",
      ),
      availableCoin: walletText(t, "wallet.coinProvider.availableCoin", "Available COIN"),
      totalCoin: walletText(t, "wallet.coinProvider.totalCoin", "Total COIN"),
      diamonds: walletText(t, "wallet.coinProvider.diamonds", "Diamonds"),
      deposits: walletText(t, "wallet.coinProvider.deposits", "Deposits"),
      records: walletText(t, "wallet.coinProvider.records", "Records"),
      disabled: walletText(t, "wallet.coinProvider.disabled", "Disabled until provider is connected"),
      bridgeRoute: walletText(t, "wallet.coinProvider.bridgeRoute", "Coin bridge route"),
      providerStatus: walletText(t, "wallet.coinProvider.providerStatus", "Provider status"),
      guardReason: walletText(t, "wallet.coinProvider.guardReason", "Guard reason"),
      directCardBlocked: walletText(t, "wallet.coinProvider.directCardBlocked", "Direct card cash-out blocked"),
      backToCoin: walletText(t, "wallet.coinProvider.backToCoin", "Back to Coin Wallet"),
    }),
    [fallbackSubtitle, fallbackTitle, screenKey, t],
  );

  const toneColor = getToneColor(tone);
  const ToneIcon = getToneIcon(tone);
  const totalCoin = selectTotalCoin(wallet);

  return (
    <WalletScreenShell>
      <View style={[styles.fixedTopBar, { paddingTop: Math.max(insets.top, 10) }]}> 
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.fixedBackButton,
            { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius.lg },
          ]}
        >
          <ArrowLeft size={18} color={colors.text} />
        </Pressable>
      </View>

      <WalletScrollScreen
        topInsetExtra={76}
        bottomInsetExtra={18}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerBlock}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>{texts.eyebrow}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{texts.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{texts.subtitle}</Text>
        </View>

        <View
          style={[
            styles.heroCard,
            {
              borderRadius: radius.xl,
              borderColor: "rgba(255,255,255,0.10)",
              backgroundColor: toneColor,
            },
          ]}
        >
          <View style={styles.heroTopRow}>
            <View style={[styles.heroIconWrap, { borderRadius: radius.lg }]}> 
              <ToneIcon size={22} color="#FFFFFF" />
            </View>
            <View style={styles.statusPill}>
              <Lock size={14} color="#FFFFFF" />
              <Text style={styles.statusPillText}>{texts.disabled}</Text>
            </View>
          </View>

          <Text style={styles.heroEyebrow}>{texts.providerTitle}</Text>
          <Text style={styles.heroTitle}>0 COIN</Text>
          <Text style={styles.heroSubtitle}>{texts.providerText}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius.lg }]}> 
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{texts.availableCoin}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatAmountCoin(wallet.availableCoin)}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius.lg }]}> 
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{texts.totalCoin}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatAmountCoin(totalCoin)}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius.lg }]}> 
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{texts.diamonds}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatAmountDiamonds(wallet.spendableDiamonds)}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius.lg }]}> 
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{texts.records}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{wallet.coinHistory.length + wallet.diamondHistory.length}</Text>
          </View>
        </View>

        <PlayReadyBillingWalletSeparationEvidencePanel
          compact
          contextLabel="Coin/Diamonds billing separation evidence"
        />

        <View style={[styles.bridgeCard, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius.xl }]}>
          <View style={styles.bridgeRow}>
            <Text style={[styles.bridgeLabel, { color: colors.textSecondary }]}>{texts.bridgeRoute}</Text>
            <Text style={[styles.bridgeValue, { color: colors.text }]}>{guard.routeKind}</Text>
          </View>
          <View style={styles.bridgeRow}>
            <Text style={[styles.bridgeLabel, { color: colors.textSecondary }]}>{texts.providerStatus}</Text>
            <Text style={[styles.bridgeValue, { color: colors.text }]}>{guard.providerStatus}</Text>
          </View>
          <View style={styles.bridgeRow}>
            <Text style={[styles.bridgeLabel, { color: colors.textSecondary }]}>{texts.guardReason}</Text>
            <Text style={[styles.bridgeValue, { color: guard.canProcess ? colors.accent : colors.text }]}>{guard.blockedReason}</Text>
          </View>
          {guard.directCardCashoutBlocked ? (
            <View style={styles.bridgeRow}>
              <Text style={[styles.bridgeLabel, { color: colors.textSecondary }]}>{texts.directCardBlocked}</Text>
              <Text style={[styles.bridgeValue, { color: colors.text }]}>true</Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.noticeCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}> 
          <View style={styles.noticeRow}>
            <View style={[styles.noticeIconWrap, { borderRadius: radius.lg, backgroundColor: "rgba(18,184,134,0.12)" }]}> 
              <ShieldCheck size={20} color={colors.accent} />
            </View>
            <View style={styles.noticeTextWrap}>
              <Text style={[styles.noticeTitle, { color: colors.text }]}>{texts.noFakeTitle}</Text>
              <Text style={[styles.noticeText, { color: colors.textSecondary }]}>{texts.noFakeText}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.noticeRow}>
            <View style={[styles.noticeIconWrap, { borderRadius: radius.lg, backgroundColor: "rgba(47,107,255,0.14)" }]}> 
              <Wallet size={20} color="#7EA2FF" />
            </View>
            <View style={styles.noticeTextWrap}>
              <Text style={[styles.noticeTitle, { color: colors.text }]}>{texts.securityTitle}</Text>
              <Text style={[styles.noticeText, { color: colors.textSecondary }]}>{texts.securityText}</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/wallet/coin" as never)}
          style={[styles.backToCoinButton, { borderRadius: radius.lg }]}
        >
          <Text style={styles.backToCoinButtonText}>{texts.backToCoin}</Text>
        </Pressable>
      </WalletScrollScreen>
    </WalletScreenShell>
  );
}

const styles = StyleSheet.create({
  fixedTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    elevation: 40,
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: "rgba(6,15,25,0.88)",
  },
  fixedBackButton: { width: 46, height: 46, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  headerBlock: { marginBottom: 22 },
  eyebrow: { fontSize: 12, fontWeight: "800", letterSpacing: 1.2, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: "900", marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  heroCard: { borderWidth: 1, padding: 18, marginBottom: 18 },
  heroTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  heroIconWrap: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  statusPill: {
    flex: 1,
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  statusPillText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900", textAlign: "center" },
  heroEyebrow: { color: "rgba(255,255,255,0.78)", fontSize: 11, fontWeight: "800", marginTop: 18 },
  heroTitle: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", marginTop: 8 },
  heroSubtitle: { color: "rgba(255,255,255,0.84)", fontSize: 13, lineHeight: 18, marginTop: 8 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 18 },
  statCard: { width: "48%", minHeight: 86, borderWidth: 1, padding: 14, justifyContent: "space-between" },
  statLabel: { fontSize: 12, fontWeight: "800" },
  statValue: { fontSize: 16, fontWeight: "900" },
  bridgeCard: { borderWidth: 1, padding: 14, marginBottom: 18, gap: 10 },
  bridgeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  bridgeLabel: { flex: 1, fontSize: 12, fontWeight: "800" },
  bridgeValue: { flex: 1, fontSize: 12, fontWeight: "900", textAlign: "right" },
  noticeCard: { borderWidth: 1, padding: 18, marginBottom: 18 },
  noticeRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  noticeIconWrap: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  noticeTextWrap: { flex: 1 },
  noticeTitle: { fontSize: 15, fontWeight: "900", marginBottom: 6 },
  noticeText: { fontSize: 13, lineHeight: 18 },
  divider: { height: 1, marginVertical: 16, opacity: 0.7 },
  backToCoinButton: { minHeight: 52, backgroundColor: "#0B6B52", alignItems: "center", justifyContent: "center", marginBottom: 6 },
  backToCoinButtonText: { color: "#EAFBF5", fontSize: 15, fontWeight: "900" },
});
