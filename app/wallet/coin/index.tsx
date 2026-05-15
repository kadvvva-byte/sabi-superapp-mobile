import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Coins,
  Crown,
  Diamond,
  History,
  PiggyBank,
  QrCode,
  ScanLine,
  Wallet,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import WalletScreenShell from "../../../src/modules/wallet/components/WalletScreenShell";
import WalletScrollScreen from "../../../src/modules/wallet/components/WalletScrollScreen";
import WalletProviderStatusPanel from "../../../src/modules/wallet/components/WalletProviderStatusPanel";
import { useSabiTheme } from "../../../src/theme/ThemeProvider";
import { useI18n } from "../../../src/shared/i18n";
import { walletText } from "../../../src/shared/wallet/wallet-i18n";
import { useWalletFoundation } from "../../../src/shared/wallet/wallet-foundation";
import {
  buildCoinWalletBridgeGuard,
  coinWalletBridgeParams,
} from "../../../src/shared/wallet/wallet-coin-bridge";
import { useCoinWalletStore } from "../../../src/modules/wallet/coin/coinWalletStore";
import {
  formatAmountCoin,
  formatShortDate,
  selectActiveDeposits,
  selectCoinQuickStats,
  selectDiamondQuickStats,
  selectDiamondWithdrawRuleLabel,
  selectNextDiamondWithdrawAt,
  selectTotalCoin,
} from "../../../src/modules/wallet/coin/coinWalletSelectors";

const ROUTES = {
  TOPUP: "/wallet/coin/topup",
  SEND: "/wallet/coin/send",
  RECEIVE: "/wallet/coin/qr",
  HISTORY: "/wallet/coin/history",
  DIAMONDS: "/wallet/coin/diamonds",
  EARN: "/wallet/coin/earn",
  WITHDRAW: "/wallet/coin/withdraw",
  QR_SCAN: "/wallet/qr-camera",
} as const;

function openMyCoinQr(extraParams: Record<string, string>) {
  router.push({
    pathname: "/wallet/qr-create",
    params: {
      variant: "coin",
      label: "Coin Wallet",
      reference: "coin-wallet",
      ...extraParams,
    },
  });
}

function QuickAction({
  title,
  subtitle,
  onPress,
  icon,
  colors,
  radius,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  icon: React.ReactNode;
  colors: { cardSoft: string; border: string; text: string; textSecondary: string };
  radius: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.actionCard,
        { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius },
      ]}
    >
      <View style={styles.actionIconWrap}>{icon}</View>
      <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </Pressable>
  );
}

function QrAccessCard({
  title,
  subtitle,
  onPress,
  icon,
  colors,
  radius,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  icon: React.ReactNode;
  colors: { cardSoft: string; border: string; text: string; textSecondary: string };
  radius: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.qrCard,
        { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius },
      ]}
    >
      <View style={styles.qrCardTopRow}>
        <View style={styles.qrIconWrap}>{icon}</View>
      </View>
      <Text style={[styles.qrTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.qrSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </Pressable>
  );
}

export default function CoinWalletIndexScreen() {
  const insets = useSafeAreaInsets();
  const { colors, radius } = useSabiTheme();
  const { t } = useI18n();
  const wallet = useCoinWalletStore();
  const { snapshot } = useWalletFoundation();

  const coinReceiveQrGuard = useMemo(
    () =>
      buildCoinWalletBridgeGuard({
        snapshot,
        routeKind: "qr_receive",
        amountCoin: 0,
        riskStatus: "clear",
      }),
    [snapshot],
  );

  const totalCoin = selectTotalCoin(wallet);
  const coinStats = selectCoinQuickStats(wallet);
  const diamondStats = selectDiamondQuickStats(wallet);
  const activeDeposits = selectActiveDeposits(wallet);
  const nextWithdrawDate = selectNextDiamondWithdrawAt(wallet);
  const withdrawRule = selectDiamondWithdrawRuleLabel(wallet);

  const texts = useMemo(
    () => ({
      eyebrow: walletText(t, "wallet.coinIndex.eyebrow", "SABI COIN ECOSYSTEM"),
      title: walletText(t, "wallet.coinIndex.title", "Coin Wallet"),
      subtitle: walletText(
        t,
        "wallet.coinIndex.subtitle",
        "Full payment wallet for COIN with transfers, history, diamond conversion, yield products and future credit foundation.",
      ),
      totalLabel: walletText(t, "wallet.coinIndex.totalLabel", "AVAILABLE + FROZEN + RESERVED + PENDING"),
      heroSubtitle: walletText(
        t,
        "wallet.coinIndex.heroSubtitle",
        "COIN works as the real financial wallet. Diamonds stay separate as an internal product balance without direct transfer functions.",
      ),
      myCoinQr: walletText(t, "wallet.coinIndex.myCoinQr", "My Coin QR"),
      myCoinQrText: walletText(t, "wallet.coinIndex.myCoinQrText", "Generate separate Coin receive QR"),
      scanCoinQr: walletText(t, "wallet.coinIndex.scanCoinQr", "Scan Coin QR"),
      scanCoinQrText: walletText(t, "wallet.coinIndex.scanCoinQrText", "Open camera scanner for Coin flow"),
      diamondLayer: walletText(t, "wallet.coinIndex.diamondLayer", "Diamond layer"),
      diamondLayerText: walletText(t, "wallet.coinIndex.diamondLayerText", "Internal spend balance"),
      open: walletText(t, "wallet.coinIndex.open", "Open"),
      diamondWithdrawRule: walletText(t, "wallet.coinIndex.diamondWithdrawRule", "Diamond withdraw rule"),
      nextAvailableDate: walletText(t, "wallet.coinIndex.nextAvailableDate", "Next available date"),
      coinActions: walletText(t, "wallet.coinIndex.coinActions", "Coin actions"),
      coreWallet: walletText(t, "wallet.coinIndex.coreWallet", "Core wallet"),
      topUp: walletText(t, "wallet.coinIndex.topUp", "Top up"),
      topUpText: walletText(t, "wallet.coinIndex.topUpText", "Add COIN to wallet"),
      send: walletText(t, "wallet.coinIndex.send", "Send"),
      sendText: walletText(t, "wallet.coinIndex.sendText", "Transfer COIN"),
      receive: walletText(t, "wallet.coinIndex.receive", "Receive"),
      receiveText: walletText(t, "wallet.coinIndex.receiveText", "Incoming COIN"),
      history: walletText(t, "wallet.coinIndex.history", "History"),
      historyText: walletText(t, "wallet.coinIndex.historyText", "Transaction log"),
      diamonds: walletText(t, "wallet.coinIndex.diamonds", "Diamonds"),
      diamondsText: walletText(t, "wallet.coinIndex.diamondsText", "Buy, convert and withdraw"),
      earn: walletText(t, "wallet.coinIndex.earn", "Earn"),
      earnText: walletText(t, "wallet.coinIndex.earnText", "6M / 12M deposit"),
      lockedDeposit: walletText(t, "wallet.coinIndex.lockedDeposit", "Locked Coin Deposit"),
      lockedDepositText: walletText(t, "wallet.coinIndex.lockedDepositText", "16% APR • 6M to 12M"),
      manage: walletText(t, "wallet.coinIndex.manage", "Manage"),
      maturity: walletText(t, "wallet.coinIndex.maturity", "Maturity"),
      months: walletText(t, "wallet.coinIndex.months", "months"),
      noActiveDeposits: walletText(t, "wallet.coinIndex.noActiveDeposits", "No active deposits yet."),
      moveCoinToWallet: walletText(t, "wallet.coinIndex.moveCoinToWallet", "Move COIN to main wallet"),
      available: walletText(t, "wallet.coinIndex.available", "Available"),
      frozen: walletText(t, "wallet.coinIndex.frozen", "Frozen"),
      interest: walletText(t, "wallet.coinIndex.interest", "Interest"),
      spendable: walletText(t, "wallet.coinIndex.spendable", "Spendable"),
      withdrawable: walletText(t, "wallet.coinIndex.withdrawable", "Withdrawable"),
      gameEligible: walletText(t, "wallet.coinIndex.gameEligible", "Game-eligible"),
      diamondsUnit: walletText(t, "wallet.coinIndex.diamondsUnit", "DIAMONDS"),
    }),
    [t],
  );

  const coinStatLabels = useMemo(
    () => ({
      available: texts.available,
      frozen: texts.frozen,
      interest: texts.interest,
    }),
    [texts.available, texts.frozen, texts.interest],
  );

  const diamondStatLabels = useMemo(
    () => ({
      spendable: texts.spendable,
      withdrawable: texts.withdrawable,
      game: texts.gameEligible,
    }),
    [texts.spendable, texts.withdrawable, texts.gameEligible],
  );

  const formatDiamondAmount = (value: number) => `${value.toLocaleString()} ${texts.diamondsUnit}`;

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
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>{texts.eyebrow}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{texts.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{texts.subtitle}</Text>
        </View>

        <WalletProviderStatusPanel scope="coin" compact />

        <View
          style={[
            styles.heroCard,
            {
              borderRadius: radius.xl,
              borderColor: "rgba(18,184,134,0.22)",
              backgroundColor: "#0B6B52",
            },
          ]}
        >
          <View style={styles.heroTopRow}>
            <View style={[styles.heroIconWrap, { borderRadius: radius.lg }]}>
              <Coins size={22} color="#EAFBF5" />
            </View>
            <View style={styles.heroStatusPill}>
              <Crown size={14} color="#F5E4A8" />
              <Text style={styles.heroStatusPillText}>{wallet.vipStatus.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.heroEyebrow}>{texts.totalLabel}</Text>
          <Text style={styles.heroTitle}>{formatAmountCoin(totalCoin)}</Text>
          <Text style={styles.heroSubtitle}>{texts.heroSubtitle}</Text>

          <View style={styles.statsRow}>
            {coinStats.map((item) => (
              <View key={item.id} style={styles.statCard}>
                <Text style={styles.statLabel}>{coinStatLabels[item.id as keyof typeof coinStatLabels] ?? item.id}</Text>
                <Text style={styles.statValue}>{formatAmountCoin(item.value)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.qrGrid}>
          <QrAccessCard
            title={texts.myCoinQr}
            subtitle={texts.myCoinQrText}
            onPress={() => openMyCoinQr(coinWalletBridgeParams(coinReceiveQrGuard))}
            icon={<QrCode size={18} color={colors.text} />}
            colors={colors}
            radius={radius.lg}
          />
          <QrAccessCard
            title={texts.scanCoinQr}
            subtitle={texts.scanCoinQrText}
            onPress={() => router.push(ROUTES.QR_SCAN as never)}
            icon={<ScanLine size={18} color={colors.text} />}
            colors={colors}
            radius={radius.lg}
          />
        </View>

        <View
          style={[
            styles.diamondCard,
            {
              borderRadius: radius.xl,
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.sectionRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{texts.diamondLayer}</Text>
              <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>{texts.diamondLayerText}</Text>
            </View>
            <Pressable onPress={() => router.push(ROUTES.DIAMONDS as never)}>
              <Text style={[styles.linkText, { color: colors.accent }]}>{texts.open}</Text>
            </Pressable>
          </View>

          <View style={styles.statsRowCompact}>
            {diamondStats.map((item) => (
              <View key={item.id} style={[styles.miniCard, { backgroundColor: colors.cardSoft, borderColor: colors.border }]}>
                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>{diamondStatLabels[item.id as keyof typeof diamondStatLabels] ?? item.id}</Text>
                <Text style={[styles.miniValue, { color: colors.text }]}>{formatDiamondAmount(item.value)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.ruleRow}>
            <Text style={[styles.ruleLabel, { color: colors.textSecondary }]}>{texts.diamondWithdrawRule}</Text>
            <Text style={[styles.ruleValue, { color: colors.text }]}>{withdrawRule}</Text>
          </View>
          <View style={styles.ruleRow}>
            <Text style={[styles.ruleLabel, { color: colors.textSecondary }]}>{texts.nextAvailableDate}</Text>
            <Text style={[styles.ruleValue, { color: colors.text }]}>{formatShortDate(nextWithdrawDate)}</Text>
          </View>
        </View>

        <View style={styles.sectionRowSpacing}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{texts.coinActions}</Text>
          <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>{texts.coreWallet}</Text>
        </View>
        <View style={styles.actionGrid}>
          <QuickAction title={texts.topUp} subtitle={texts.topUpText} onPress={() => router.push(ROUTES.TOPUP as never)} icon={<ArrowDownLeft size={18} color={colors.text} />} colors={colors} radius={radius.lg} />
          <QuickAction title={texts.send} subtitle={texts.sendText} onPress={() => router.push(ROUTES.SEND as never)} icon={<ArrowUpRight size={18} color={colors.text} />} colors={colors} radius={radius.lg} />
          <QuickAction title={texts.receive} subtitle={texts.receiveText} onPress={() => router.push(ROUTES.RECEIVE as never)} icon={<Wallet size={18} color={colors.text} />} colors={colors} radius={radius.lg} />
          <QuickAction title={texts.history} subtitle={texts.historyText} onPress={() => router.push(ROUTES.HISTORY as never)} icon={<History size={18} color={colors.text} />} colors={colors} radius={radius.lg} />
          <QuickAction title={texts.diamonds} subtitle={texts.diamondsText} onPress={() => router.push(ROUTES.DIAMONDS as never)} icon={<Diamond size={18} color={colors.text} />} colors={colors} radius={radius.lg} />
          <QuickAction title={texts.earn} subtitle={texts.earnText} onPress={() => router.push(ROUTES.EARN as never)} icon={<PiggyBank size={18} color={colors.text} />} colors={colors} radius={radius.lg} />
        </View>

        <View
          style={[
            styles.depositSummary,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl },
          ]}
        >
          <View style={styles.sectionRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{texts.lockedDeposit}</Text>
              <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>{texts.lockedDepositText}</Text>
            </View>
            <Pressable onPress={() => router.push(ROUTES.EARN as never)}>
              <Text style={[styles.linkText, { color: colors.accent }]}>{texts.manage}</Text>
            </Pressable>
          </View>

          {activeDeposits.length ? (
            activeDeposits.slice(0, 2).map((deposit) => (
              <Pressable
                key={deposit.id}
                onPress={() => router.push(`/wallet/coin/deposit/${deposit.id}` as never)}
                style={[styles.depositRow, { backgroundColor: colors.cardSoft, borderColor: colors.border }]}
              >
                <View style={styles.depositLeft}>
                  <ArrowLeftRight size={18} color={colors.accent} />
                  <View>
                    <Text style={[styles.depositTitle, { color: colors.text }]}>{formatAmountCoin(deposit.amountCoin)}</Text>
                    <Text style={[styles.depositSubtitle, { color: colors.textSecondary }]}> 
                      {deposit.termMonths} {texts.months} • {texts.maturity} {formatShortDate(deposit.maturityDate)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.depositInterest, { color: colors.text }]}>+{formatAmountCoin(deposit.interestPaidCoin)}</Text>
              </Pressable>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{texts.noActiveDeposits}</Text>
          )}
        </View>

        <Pressable
          onPress={() => router.push(ROUTES.WITHDRAW as never)}
          style={[styles.bottomButton, { borderRadius: radius.lg }]}
        >
          <Text style={styles.bottomButtonText}>{texts.moveCoinToWallet}</Text>
        </Pressable>
      </WalletScrollScreen>
    </WalletScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {},
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
  headerRow: { marginBottom: 22 },
  eyebrow: { fontSize: 12, fontWeight: "800", letterSpacing: 1.2, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: "900", marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 20 },

  heroCard: { borderWidth: 1, padding: 18, marginBottom: 18 },
  heroTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroIconWrap: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroStatusPill: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroStatusPillText: { color: "#F8F0C8", fontSize: 11, fontWeight: "800" },
  heroEyebrow: { marginTop: 18, color: "rgba(255,255,255,0.78)", fontSize: 11, fontWeight: "800" },
  heroTitle: { marginTop: 8, color: "#FFFFFF", fontSize: 30, fontWeight: "900" },
  heroSubtitle: { marginTop: 8, color: "rgba(255,255,255,0.84)", fontSize: 13, lineHeight: 18 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  statCard: {
    flex: 1,
    minHeight: 82,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    justifyContent: "space-between",
  },
  statLabel: { color: "rgba(255,255,255,0.76)", fontSize: 11, fontWeight: "700" },
  statValue: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },

  qrGrid: { flexDirection: "row", gap: 12, marginBottom: 18 },
  qrCard: {
    flex: 1,
    minHeight: 116,
    borderWidth: 1,
    padding: 14,
  },
  qrCardTopRow: { marginBottom: 16 },
  qrIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(72,120,255,0.10)",
  },
  qrTitle: { fontSize: 15, fontWeight: "900", marginBottom: 6 },
  qrSubtitle: { fontSize: 12, lineHeight: 17 },

  diamondCard: { borderWidth: 1, padding: 18, marginBottom: 18 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionRowSpacing: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "800" },
  sectionHint: { fontSize: 12, fontWeight: "700" },
  linkText: { fontSize: 13, fontWeight: "800" },
  statsRowCompact: { gap: 10 },
  miniCard: { borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 10 },
  miniLabel: { fontSize: 12, fontWeight: "700", marginBottom: 4 },
  miniValue: { fontSize: 16, fontWeight: "900" },
  ruleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  ruleLabel: { fontSize: 13, fontWeight: "700" },
  ruleValue: { fontSize: 13, fontWeight: "900" },

  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 18 },
  actionCard: { width: "48%", minHeight: 128, borderWidth: 1, padding: 14 },
  actionIconWrap: { marginBottom: 18 },
  actionTitle: { fontSize: 15, fontWeight: "900", marginBottom: 6 },
  actionSubtitle: { fontSize: 12, lineHeight: 17 },

  depositSummary: { borderWidth: 1, padding: 18, marginBottom: 18 },
  depositRow: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  depositLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  depositTitle: { fontSize: 15, fontWeight: "900", marginBottom: 4 },
  depositSubtitle: { fontSize: 12, lineHeight: 17 },
  depositInterest: { fontSize: 15, fontWeight: "900" },
  emptyText: { fontSize: 13, lineHeight: 18 },

  bottomButton: {
    minHeight: 52,
    backgroundColor: "#0B6B52",
    borderWidth: 1,
    borderColor: "rgba(18,184,134,0.30)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  bottomButtonText: { color: "#EAFBF5", fontSize: 15, fontWeight: "900" },
});
