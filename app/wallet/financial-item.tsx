import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { type FinancialItemDetailsResponse, getFinancialItemDetails } from "../../src/shared/api/financial-api";
import { useI18n } from "../../src/shared/i18n";
import { formatWalletCurrencyAmount } from "../../src/shared/wallet/wallet-foundation";

const supportedKinds = new Set(["transaction", "payment", "p2p", "qr-payment", "wallet-operation"]);

function walletText(
  t: (key: string, params?: Record<string, string | number>) => string,
  key: string,
  fallback: string,
) {
  const value = t(key);
  return typeof value === "string" && value.trim() && value !== key ? value : fallback;
}

function formatBackendAmount(amount?: number, currency?: string) {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "—";
  return formatWalletCurrencyAmount(amount, currency || "USD");
}

function readablePayload(value: unknown) {
  if (value === undefined || value === null) return "—";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function FinancialItemScreen() {
  const params = useLocalSearchParams<{ kind?: string; id?: string }>();
  const { t } = useI18n();
  const kind = typeof params.kind === "string" && supportedKinds.has(params.kind)
    ? params.kind as "transaction" | "payment" | "p2p" | "qr-payment" | "wallet-operation"
    : undefined;
  const id = typeof params.id === "string" ? params.id : undefined;
  const [data, setData] = useState<FinancialItemDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const texts = useMemo(
    () => ({
      eyebrow: walletText(t, "wallet.financialItem.eyebrow", "Wallet record"),
      title: walletText(t, "wallet.financialItem.title", "Financial details"),
      loading: walletText(t, "wallet.financialItem.loading", "Loading details..."),
      errorTitle: walletText(t, "wallet.financialItem.errorTitle", "Details error"),
      amountUnavailable: walletText(t, "wallet.financialItem.amountUnavailable", "Amount unavailable"),
      unknown: walletText(t, "wallet.financialItem.unknown", "unknown"),
      id: walletText(t, "wallet.financialItem.id", "ID"),
      transaction: walletText(t, "wallet.financialItem.transaction", "Transaction"),
      wallet: walletText(t, "wallet.financialItem.wallet", "Wallet"),
      reference: walletText(t, "wallet.financialItem.reference", "Reference"),
      createdAt: walletText(t, "wallet.financialItem.createdAt", "Created at"),
      payload: walletText(t, "wallet.financialItem.payload", "Payload"),
      back: walletText(t, "wallet.shared.back", "Back"),
    }),
    [t],
  );

  const load = useCallback(async () => {
    if (!kind || !id) {
      setError("financial_item_params_invalid");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setData(await getFinancialItemDetails({ kind, id }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "financial_item_load_failed");
    } finally {
      setLoading(false);
    }
  }, [kind, id]);

  useEffect(() => {
    void load();
  }, [load]);

  const jsonPayload = useMemo(() => (data ? readablePayload(data.payload) : ""), [data]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.fixedHeader}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel={texts.back}>
          <ArrowLeft size={19} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.eyebrow}>{texts.eyebrow}</Text>
          <Text style={styles.title}>{texts.title}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator />
            <Text style={styles.stateText}>{texts.loading}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>{texts.errorTitle}</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : data ? (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.kind}>{data.kind}</Text>
              <Text style={styles.amount}>{formatBackendAmount(data.amount, data.currency) || texts.amountUnavailable}</Text>
              <Text style={styles.meta}>{data.status || texts.unknown} · {data.sourceModule}</Text>
            </View>
            <View style={styles.infoCard}>
              <Row label={texts.id} value={data.id} />
              <Row label={texts.transaction} value={data.transactionId} />
              <Row label={texts.wallet} value={data.walletId} />
              <Row label={texts.reference} value={data.reference} />
              <Row label={texts.createdAt} value={data.createdAt} />
            </View>
            <View style={styles.payloadCard}>
              <Text style={styles.payloadTitle}>{texts.payload}</Text>
              <Text style={styles.payloadText}>{jsonPayload}</Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || "—"}</Text>
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
    alignItems: "center",
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
  headerTextWrap: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 28 },
  eyebrow: { color: "#8ea3ff", fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  title: { color: "#ffffff", fontSize: 24, fontWeight: "800" },
  centerState: { alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 10 },
  stateText: { color: "#c7d2f0" },
  errorCard: { backgroundColor: "#30151f", borderRadius: 20, padding: 16, gap: 8 },
  errorTitle: { color: "#ffd8df", fontWeight: "800", fontSize: 18 },
  errorText: { color: "#ff9cb0", fontSize: 14 },
  heroCard: { backgroundColor: "#111830", borderRadius: 24, padding: 18, gap: 6 },
  kind: { color: "#8ea3ff", fontSize: 13, fontWeight: "700", textTransform: "uppercase" },
  amount: { color: "#ffffff", fontSize: 30, fontWeight: "800" },
  meta: { color: "#9fb0d1", fontSize: 13 },
  infoCard: { backgroundColor: "#121a30", borderRadius: 20, padding: 16, gap: 12 },
  row: { gap: 4 },
  rowLabel: { color: "#8fa2cb", fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  rowValue: { color: "#ffffff", fontSize: 14 },
  payloadCard: { backgroundColor: "#121a30", borderRadius: 20, padding: 16, gap: 10 },
  payloadTitle: { color: "#ffffff", fontSize: 18, fontWeight: "800" },
  payloadText: { color: "#cbd5ee", fontFamily: "monospace", fontSize: 12, lineHeight: 18 },
});
