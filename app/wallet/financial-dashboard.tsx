import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import {
  type FinancialDashboardResponse,
  getFinancialDashboard,
} from "../../src/shared/api/financial-api";
import { useWalletRealtime } from "../../src/shared/realtime/use-wallet-realtime";
import { useI18n } from "../../src/shared/i18n";
import { formatWalletCurrencyAmount } from "../../src/shared/wallet/wallet-foundation";

function walletText(
  t: (key: string, params?: Record<string, string | number>) => string,
  key: string,
  fallback: string,
) {
  const value = t(key);
  return typeof value === "string" && value.trim() && value !== key ? value : fallback;
}

function formatBackendAmount(amount: number, currency?: string) {
  return formatWalletCurrencyAmount(Number.isFinite(amount) ? amount : 0, currency || "USD");
}

export default function FinancialDashboardScreen() {
  const params = useLocalSearchParams<{ userId?: string; walletId?: string }>();
  const { t } = useI18n();
  const userId = typeof params.userId === "string" ? params.userId : undefined;
  const walletId = typeof params.walletId === "string" ? params.walletId : undefined;

  const [data, setData] = useState<FinancialDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const texts = useMemo(
    () => ({
      eyebrow: walletText(t, "wallet.financialDashboard.eyebrow", "Sabi Wallet"),
      walletTitle: walletText(t, "wallet.financialDashboard.walletTitle", "Wallet dashboard"),
      title: walletText(t, "wallet.financialDashboard.title", "Financial dashboard"),
      subtitle: walletText(t, "wallet.financialDashboard.subtitle", "Backend-backed wallet overview"),
      loading: walletText(t, "wallet.financialDashboard.loading", "Loading dashboard..."),
      errorTitle: walletText(t, "wallet.financialDashboard.errorTitle", "Dashboard error"),
      retry: walletText(t, "wallet.financialDashboard.retry", "Retry"),
      totalBalance: walletText(t, "wallet.financialDashboard.totalBalance", "Total balance"),
      wallets: walletText(t, "wallet.financialDashboard.wallets", "Wallets"),
      locked: walletText(t, "wallet.financialDashboard.locked", "Locked"),
      active: walletText(t, "wallet.financialDashboard.active", "Active"),
      quickActions: walletText(t, "wallet.financialDashboard.quickActions", "Quick actions"),
      history: walletText(t, "wallet.financialDashboard.history", "History"),
      p2pSend: walletText(t, "wallet.financialDashboard.p2pSend", "P2P send"),
      qrExecute: walletText(t, "wallet.financialDashboard.qrExecute", "QR execute"),
      paymentRoute: walletText(t, "wallet.financialDashboard.paymentRoute", "Payment route"),
      totals: walletText(t, "wallet.financialDashboard.totals", "Totals"),
      payments: walletText(t, "wallet.financialDashboard.payments", "Payments"),
      p2p: walletText(t, "wallet.financialDashboard.p2p", "P2P"),
      qr: walletText(t, "wallet.financialDashboard.qr", "QR"),
      walletOps: walletText(t, "wallet.financialDashboard.walletOps", "Wallet ops"),
      business: walletText(t, "wallet.financialDashboard.business", "Business"),
      merchant: walletText(t, "wallet.financialDashboard.merchant", "Merchant"),
      noWallets: walletText(t, "wallet.financialDashboard.noWallets", "No wallets found for current scope."),
      recentHistory: walletText(t, "wallet.financialDashboard.recentHistory", "Recent history"),
      seeAll: walletText(t, "wallet.financialDashboard.seeAll", "See all"),
      noEvents: walletText(t, "wallet.financialDashboard.noEvents", "No financial events yet."),
      unknown: walletText(t, "wallet.financialDashboard.unknown", "unknown"),
      back: walletText(t, "wallet.shared.back", "Back"),
    }),
    [t],
  );

  const load = useCallback(
    async (mode: "load" | "refresh" = "load") => {
      try {
        setError(null);
        if (mode === "load") setLoading(true);
        if (mode === "refresh") setRefreshing(true);
        const result = await getFinancialDashboard({ userId, walletId, historyLimit: 8 });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "dashboard_load_failed");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId, walletId],
  );

  useEffect(() => {
    void load("load");
  }, [load]);

  useWalletRealtime({
    userId,
    walletId,
    enabled: !loading,
    onRefresh: () => {
      void load("refresh");
    },
  });

  const title = walletId ? texts.walletTitle : texts.title;

  const quickActions = [
    { key: "history", label: texts.history, path: "/wallet/history" },
    { key: "p2p", label: texts.p2pSend, path: "/wallet/send" },
    { key: "qr", label: texts.qrExecute, path: "/wallet/qr-scan" },
    { key: "payment", label: texts.paymentRoute, path: "/wallet/payment-execute" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.fixedHeader}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel={texts.back}>
          <ArrowLeft size={19} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.eyebrow}>{texts.eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{texts.subtitle}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void load("refresh")} />
        }
      >
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator />
            <Text style={styles.stateText}>{texts.loading}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>{texts.errorTitle}</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.primaryButton} onPress={() => void load("load")}>
              <Text style={styles.primaryButtonText}>{texts.retry}</Text>
            </Pressable>
          </View>
        ) : data ? (
          <>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>{texts.totalBalance}</Text>
              <Text style={styles.balanceValue}>
                {formatBackendAmount(data.overview.totals.totalBalance)}
              </Text>
              <Text style={styles.balanceHint}>
                {texts.wallets}: {data.overview.totals.walletCount} · {texts.locked}: {data.overview.totals.lockedWalletCount}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{texts.quickActions}</Text>
              <View style={styles.actionGrid}>
                {quickActions.map((action) => (
                  <Pressable
                    key={action.key}
                    style={styles.actionCard}
                    onPress={() =>
                      router.push({ pathname: action.path as never, params: { userId, walletId } } as never)
                    }
                  >
                    <Text style={styles.actionText}>{action.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{texts.totals}</Text>
              <View style={styles.statsGrid}>
                <StatCard label={texts.payments} value={data.overview.totals.paymentCount} />
                <StatCard label={texts.p2p} value={data.overview.totals.p2pCount} />
                <StatCard label={texts.qr} value={data.overview.totals.qrCount} />
                <StatCard label={texts.walletOps} value={data.overview.totals.walletOperationCount} />
                <StatCard label={texts.business} value={data.overview.totals.businessWalletCount} />
                <StatCard label={texts.merchant} value={data.overview.totals.merchantWalletCount} />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{texts.wallets}</Text>
              {data.overview.wallets.length === 0 ? (
                <Text style={styles.emptyText}>{texts.noWallets}</Text>
              ) : (
                data.overview.wallets.map((wallet) => (
                  <Pressable
                    key={wallet.id}
                    style={styles.walletCard}
                    onPress={() => router.push({ pathname: "/wallet/history", params: { walletId: wallet.id } } as never)}
                  >
                    <View style={styles.walletRow}>
                      <Text style={styles.walletType}>{wallet.type}</Text>
                      <Text style={styles.walletBalance}>{formatBackendAmount(wallet.balance, wallet.currency)}</Text>
                    </View>
                    <Text style={styles.walletMeta}>{wallet.id} · {wallet.locked ? texts.locked : texts.active}</Text>
                  </Pressable>
                ))
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>{texts.recentHistory}</Text>
                <Pressable onPress={() => router.push({ pathname: "/wallet/history", params: { userId, walletId } } as never)}>
                  <Text style={styles.linkText}>{texts.seeAll}</Text>
                </Pressable>
              </View>
              {data.recentHistory.length === 0 ? (
                <Text style={styles.emptyText}>{texts.noEvents}</Text>
              ) : (
                data.recentHistory.map((item) => (
                  <Pressable
                    key={`${item.kind}-${item.id}`}
                    style={styles.historyCard}
                    onPress={() =>
                      router.push({
                        pathname: "/wallet/financial-item",
                        params: { kind: normalizeKind(item.kind), id: item.id },
                      } as never)
                    }
                  >
                    <View style={styles.walletRow}>
                      <Text style={styles.historyKind}>{item.kind}</Text>
                      <Text style={styles.historyAmount}>{formatBackendAmount(item.amount, item.currency)}</Text>
                    </View>
                    <Text style={styles.historyMeta}>{item.status || texts.unknown} · {item.sourceModule}</Text>
                  </Pressable>
                ))
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function normalizeKind(kind: string) {
  if (kind === "topup" || kind === "refund") return "payment";
  if (kind === "p2p_sent" || kind === "p2p_received") return "p2p";
  if (kind === "qr_payment") return "qr-payment";
  if (kind === "wallet_operation") return "wallet-operation";
  return "transaction";
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0b1020" },
  fixedHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#0b1020",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    zIndex: 20,
    elevation: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#1a2445",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  headerTextWrap: { flex: 1, paddingRight: 8 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  eyebrow: { color: "#8ea3ff", fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  title: { color: "#ffffff", fontSize: 26, fontWeight: "800" },
  subtitle: { color: "#9fb0d1", fontSize: 13, marginTop: 4 },
  centerState: { alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 10 },
  stateText: { color: "#c7d2f0", fontSize: 14 },
  errorCard: { backgroundColor: "#29161d", borderRadius: 20, padding: 16, gap: 10 },
  errorTitle: { color: "#ffced8", fontSize: 18, fontWeight: "800" },
  errorText: { color: "#ff9cb0", fontSize: 14 },
  primaryButton: { backgroundColor: "#4f7cff", borderRadius: 16, paddingVertical: 12, alignItems: "center" },
  primaryButtonText: { color: "#ffffff", fontWeight: "800" },
  balanceCard: { backgroundColor: "#16244a", borderRadius: 28, padding: 22, gap: 8 },
  balanceLabel: { color: "#a9b9df", fontSize: 13, fontWeight: "700" },
  balanceValue: { color: "#ffffff", fontSize: 34, fontWeight: "900" },
  balanceHint: { color: "#b9c6e4", fontSize: 13 },
  section: { gap: 12 },
  sectionTitle: { color: "#ffffff", fontSize: 20, fontWeight: "800" },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  linkText: { color: "#8ea3ff", fontWeight: "800" },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionCard: { width: "48%", backgroundColor: "#131a32", borderRadius: 18, padding: 16, minHeight: 70, justifyContent: "center" },
  actionText: { color: "#ffffff", fontWeight: "800", fontSize: 15 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { width: "48%", backgroundColor: "#111830", borderRadius: 18, padding: 16, gap: 4 },
  statValue: { color: "#ffffff", fontSize: 24, fontWeight: "900" },
  statLabel: { color: "#9fb0d1", fontSize: 13, fontWeight: "700" },
  emptyText: { color: "#9fb0d1", fontSize: 14, lineHeight: 20 },
  walletCard: { backgroundColor: "#111830", borderRadius: 18, padding: 16, gap: 8 },
  walletRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  walletType: { color: "#ffffff", fontSize: 15, fontWeight: "800", flex: 1 },
  walletBalance: { color: "#ffffff", fontWeight: "800" },
  walletMeta: { color: "#8998bb", fontSize: 12 },
  historyCard: { backgroundColor: "#111830", borderRadius: 18, padding: 16, gap: 8 },
  historyKind: { color: "#ffffff", fontSize: 15, fontWeight: "800", flex: 1 },
  historyAmount: { color: "#d8e1ff", fontWeight: "900" },
  historyMeta: { color: "#8998bb", fontSize: 12 },
});
