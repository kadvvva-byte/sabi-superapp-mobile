import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  QrCode,
  Search,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  CircleAlert,
  Wallet,
  ChevronRight,
  ReceiptText,
} from "lucide-react-native";

import AppContainer from "../../components/AppContainer";
import { useSabiTheme } from "../../src/theme/ThemeProvider";
import { useI18n } from "../../src/shared/i18n";
import { walletText } from "../../src/shared/wallet/wallet-i18n";
import {
  buildWalletLedgerView,
  type WalletLedgerProviderStatus,
  type WalletLedgerRiskStatus,
  type WalletLedgerRoute,
} from "../../src/shared/wallet/wallet-ledger";
import {
  getFinancialHistory,
  type FinancialHistoryItem,
} from "../../src/shared/api/financial-api";
import { useWalletRealtime } from "../../src/shared/realtime/use-wallet-realtime";

type HistoryFilter = "all" | "money" | "cards" | "qr";
type TxStatus = "completed" | "pending" | "failed";
type TxCategory = "send" | "receive" | "topup" | "withdraw" | "card" | "qr";

type WalletTransaction = {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  direction: "in" | "out";
  status: TxStatus;
  category: TxCategory;
  section: HistoryFilter;
  dateLabel: string;
  timeLabel: string;
  reference: string;
  rawKind: string;
  ledgerRoute: WalletLedgerRoute;
  providerStatus: WalletLedgerProviderStatus;
  riskStatus: WalletLedgerRiskStatus;
  ledgerReference: string;
  providerReference: string;
  hasRawCardData: boolean;
};

type HistoryTexts = {
  eyebrow: string;
  title: string;
  subtitle: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  total: string;
  pending: string;
  failed: string;
  completed: string;
  searchPlaceholder: string;
  all: string;
  money: string;
  cards: string;
  qr: string;
  liveNote: string;
  loadingTitle: string;
  loadingText: string;
  errorTitle: string;
  retry: string;
  emptyTitle: string;
  emptyText: string;
  back: string;
  walletHome: string;
  today: string;
  yesterday: string;
  user: string;
  walletTransfer: string;
  sendP2p: string;
  receiveP2p: string;
  topupWallet: string;
  providerPaymentCredited: string;
  refundWallet: string;
  providerRefundReturned: string;
  withdrawWallet: string;
  moneyWithdrawal: string;
  depositWallet: string;
  moneyCredited: string;
  qrPayment: string;
  qrRouteExecution: string;
  walletOperation: string;
  walletTransferTitle: string;
  provider: string;
  risk: string;
  ledger: string;
  route: string;
  providerConfirmed: string;
  providerPending: string;
  providerNotConfigured: string;
  providerFailed: string;
  providerRestricted: string;
  providerNotRequired: string;
  riskClear: string;
  riskPendingReview: string;
  riskSafeHold: string;
  riskRestricted: string;
  riskBlocked: string;
  riskUnknown: string;
};

const FILTER_KEYS: HistoryFilter[] = ["all", "money", "cards", "qr"];

function tr(
  t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string,
  key: string,
  fallback: string,
) {
  return walletText(t, key, fallback);
}

function buildHistoryTexts(t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string): HistoryTexts {
  return {
    eyebrow: tr(t, "wallet.history.eyebrow", "Wallet activity"),
    title: tr(t, "wallet.history.title", "Transaction History"),
    subtitle: tr(t, "wallet.history.subtitle", "Review wallet movements, provider payments and QR operations in one place."),
    heroEyebrow: tr(t, "wallet.history.heroEyebrow", "Activity center"),
    heroTitle: tr(t, "wallet.history.heroTitle", "Unified wallet history"),
    heroSubtitle: tr(t, "wallet.history.heroSubtitle", "Structured transaction timeline for money movement, provider payments and QR routes."),
    total: tr(t, "wallet.history.total", "Total"),
    pending: tr(t, "wallet.history.pending", "Pending"),
    failed: tr(t, "wallet.history.failed", "Failed"),
    completed: tr(t, "wallet.history.completed", "Completed"),
    searchPlaceholder: tr(t, "wallet.history.searchPlaceholder", "Search by name, reference or amount"),
    all: tr(t, "wallet.history.all", "All"),
    money: tr(t, "wallet.history.money", "Money"),
    cards: tr(t, "wallet.history.cards", "Cards"),
    qr: tr(t, "wallet.history.qr", "QR"),
    liveNote: tr(t, "wallet.history.liveNote", "This screen reads live unified history from the backend wallet API. Crypto history remains inside the crypto module."),
    loadingTitle: tr(t, "wallet.history.loadingTitle", "Loading history"),
    loadingText: tr(t, "wallet.history.loadingText", "Pull down to refresh after the first load."),
    errorTitle: tr(t, "wallet.history.errorTitle", "Unable to load history"),
    retry: tr(t, "wallet.history.retry", "Retry"),
    emptyTitle: tr(t, "wallet.history.emptyTitle", "No transactions found"),
    emptyText: tr(t, "wallet.history.emptyText", "Try another search or filter."),
    back: tr(t, "wallet.history.back", "Back"),
    walletHome: tr(t, "wallet.history.walletHome", "Wallet Home"),
    today: tr(t, "wallet.history.today", "Today"),
    yesterday: tr(t, "wallet.history.yesterday", "Yesterday"),
    user: tr(t, "wallet.history.user", "User"),
    walletTransfer: tr(t, "wallet.history.walletTransfer", "Wallet transfer"),
    sendP2p: tr(t, "wallet.history.sendP2p", "Send via P2P"),
    receiveP2p: tr(t, "wallet.history.receiveP2p", "Receive via P2P"),
    topupWallet: tr(t, "wallet.history.topupWallet", "Top up to Wallet"),
    providerPaymentCredited: tr(t, "wallet.history.providerPaymentCredited", "Provider payment credited"),
    refundWallet: tr(t, "wallet.history.refundWallet", "Refund to Wallet"),
    providerRefundReturned: tr(t, "wallet.history.providerRefundReturned", "Provider refund returned"),
    withdrawWallet: tr(t, "wallet.history.withdrawWallet", "Withdraw from Wallet"),
    moneyWithdrawal: tr(t, "wallet.history.moneyWithdrawal", "Money withdrawal"),
    depositWallet: tr(t, "wallet.history.depositWallet", "Deposit to Wallet"),
    moneyCredited: tr(t, "wallet.history.moneyCredited", "Money credited"),
    qrPayment: tr(t, "wallet.history.qrPayment", "QR Payment"),
    qrRouteExecution: tr(t, "wallet.history.qrRouteExecution", "QR route execution"),
    walletOperation: tr(t, "wallet.history.walletOperation", "Wallet Core Operation"),
    walletTransferTitle: tr(t, "wallet.history.walletTransferTitle", "Wallet Transfer"),
    provider: tr(t, "wallet.history.provider", "Provider"),
    risk: tr(t, "wallet.history.risk", "Risk"),
    ledger: tr(t, "wallet.history.ledger", "Ledger"),
    route: tr(t, "wallet.history.route", "Route"),
    providerConfirmed: tr(t, "wallet.history.providerConfirmed", "Provider confirmed"),
    providerPending: tr(t, "wallet.history.providerPending", "Provider pending"),
    providerNotConfigured: tr(t, "wallet.history.providerNotConfigured", "Provider not configured"),
    providerFailed: tr(t, "wallet.history.providerFailed", "Provider failed"),
    providerRestricted: tr(t, "wallet.history.providerRestricted", "Provider restricted"),
    providerNotRequired: tr(t, "wallet.history.providerNotRequired", "Provider not required"),
    riskClear: tr(t, "wallet.history.riskClear", "Risk clear"),
    riskPendingReview: tr(t, "wallet.history.riskPendingReview", "Pending review"),
    riskSafeHold: tr(t, "wallet.history.riskSafeHold", "Safe hold"),
    riskRestricted: tr(t, "wallet.history.riskRestricted", "Restricted"),
    riskBlocked: tr(t, "wallet.history.riskBlocked", "Blocked"),
    riskUnknown: tr(t, "wallet.history.riskUnknown", "Risk unknown"),
  };
}

function filterLabel(key: HistoryFilter, texts: HistoryTexts) {
  if (key === "money") return texts.money;
  if (key === "cards") return texts.cards;
  if (key === "qr") return texts.qr;
  return texts.all;
}

function providerStatusLabel(status: WalletLedgerProviderStatus, texts: HistoryTexts) {
  switch (status) {
    case "provider_confirmed": return texts.providerConfirmed;
    case "provider_pending": return texts.providerPending;
    case "provider_failed": return texts.providerFailed;
    case "provider_restricted": return texts.providerRestricted;
    case "provider_not_required": return texts.providerNotRequired;
    default: return texts.providerNotConfigured;
  }
}

function riskStatusLabel(status: WalletLedgerRiskStatus, texts: HistoryTexts) {
  switch (status) {
    case "clear": return texts.riskClear;
    case "pending_review": return texts.riskPendingReview;
    case "safe_hold": return texts.riskSafeHold;
    case "restricted": return texts.riskRestricted;
    case "blocked": return texts.riskBlocked;
    default: return texts.riskUnknown;
  }
}

function buildLedgerLine(tx: Pick<WalletTransaction, "providerStatus" | "riskStatus" | "ledgerReference" | "ledgerRoute">, texts: HistoryTexts) {
  const parts = [
    `${texts.provider}: ${providerStatusLabel(tx.providerStatus, texts)}`,
    `${texts.risk}: ${riskStatusLabel(tx.riskStatus, texts)}`,
  ];

  if (tx.ledgerReference) parts.push(`${texts.ledger}: ${tx.ledgerReference}`);
  if (tx.ledgerRoute && tx.ledgerRoute !== "unknown") parts.push(`${texts.route}: ${tx.ledgerRoute}`);

  return parts.join(" • ");
}


function SummaryPill({
  label,
  value,
  colors,
  radius,
}: {
  label: string;
  value: string;
  colors: {
    cardSoft: string;
    border: string;
    text: string;
    textSecondary: string;
  };
  radius: number;
}) {
  return (
    <View
      style={[
        styles.summaryPill,
        {
          backgroundColor: colors.cardSoft,
          borderColor: colors.border,
          borderRadius: radius,
        },
      ]}
    >
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function renderTxIcon(category: TxCategory, color: string) {
  switch (category) {
    case "send":
      return <ArrowUpRight size={18} color={color} />;
    case "receive":
    case "topup":
      return <ArrowDownLeft size={18} color={color} />;
    case "withdraw":
      return <ArrowUpRight size={18} color={color} />;
    case "card":
      return <CreditCard size={18} color={color} />;
    case "qr":
      return <QrCode size={18} color={color} />;
    default:
      return <Wallet size={18} color={color} />;
  }
}

function renderStatusBadge(
  status: TxStatus,
  texts: HistoryTexts,
  colors: {
    cardSoft: string;
    border: string;
    text: string;
    textSecondary: string;
  },
  radius: number,
) {
  const config =
    status === "completed"
      ? { label: texts.completed, icon: <CheckCircle2 size={14} color="#7CFFA2" /> }
      : status === "pending"
        ? { label: texts.pending, icon: <Clock3 size={14} color="#FFD66B" /> }
        : { label: texts.failed, icon: <CircleAlert size={14} color="#FF8B8B" /> };

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: colors.cardSoft,
          borderColor: colors.border,
          borderRadius: radius,
        },
      ]}
    >
      {config.icon}
      <Text style={[styles.statusText, { color: colors.text }]}>
        {config.label}
      </Text>
    </View>
  );
}

function toTxStatus(status?: string): TxStatus {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized.includes("failed") ||
    normalized.includes("error") ||
    normalized.includes("declined")
  ) {
    return "failed";
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("created") ||
    normalized.includes("authorized")
  ) {
    return "pending";
  }

  return "completed";
}

function formatDateLabel(date: Date, texts: HistoryTexts) {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startInput = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor(
    (startToday.getTime() - startInput.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return texts.today;
  if (diffDays === 1) return texts.yesterday;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatTimeLabel(date: Date) {
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function normalizeKindForDetails(kind: string) {
  if (kind === "topup" || kind === "refund") return "payment";
  if (kind === "p2p_sent" || kind === "p2p_received") return "p2p";
  if (kind === "qr_payment") return "qr-payment";
  if (kind === "wallet_operation") return "wallet-operation";
  return "transaction";
}

function formatHistoryAmount(item: FinancialHistoryItem, direction: "in" | "out" | "neutral") {
  const prefix = direction === "in" ? "+ " : direction === "out" ? "- " : "";
  const currency = String(item.currency || "").trim();
  return `${prefix}${item.amount.toFixed(2)}${currency ? ` ${currency}` : ""}`;
}

function sourceSubtitle(item: FinancialHistoryItem, texts: HistoryTexts) {
  if (item.counterparty?.userId) return `${texts.user} • ${item.counterparty.userId}`;
  return texts.walletTransfer;
}

function mapHistoryItemToWalletTransaction(
  item: FinancialHistoryItem,
  texts: HistoryTexts,
): WalletTransaction {
  const createdAt = new Date(item.createdAt);
  const safeDate = Number.isNaN(createdAt.getTime()) ? new Date() : createdAt;
  const status = toTxStatus(item.status);
  const ledger = buildWalletLedgerView(item);
  const common = {
    dateLabel: formatDateLabel(safeDate, texts),
    timeLabel: formatTimeLabel(safeDate),
    reference: item.reference || item.transactionId || item.id,
    rawKind: item.kind,
    ledgerRoute: ledger.route,
    providerStatus: ledger.hasRawCardData ? "provider_failed" as const : ledger.providerStatus,
    riskStatus: ledger.hasRawCardData ? "blocked" as const : ledger.riskStatus,
    ledgerReference: ledger.ledgerReference,
    providerReference: ledger.providerReference,
    hasRawCardData: ledger.hasRawCardData,
  };

  switch (item.kind) {
    case "p2p_sent":
      return { id: item.id, title: texts.sendP2p, subtitle: sourceSubtitle(item, texts), amount: formatHistoryAmount(item, "out"), direction: "out", status, category: "send", section: "money", ...common };
    case "p2p_received":
      return { id: item.id, title: texts.receiveP2p, subtitle: sourceSubtitle(item, texts), amount: formatHistoryAmount(item, "in"), direction: "in", status, category: "receive", section: "money", ...common };
    case "topup":
      return { id: item.id, title: texts.topupWallet, subtitle: texts.providerPaymentCredited, amount: formatHistoryAmount(item, "in"), direction: "in", status, category: "topup", section: "cards", ...common };
    case "refund":
      return { id: item.id, title: texts.refundWallet, subtitle: texts.providerRefundReturned, amount: formatHistoryAmount(item, "in"), direction: "in", status, category: "card", section: "cards", ...common };
    case "withdraw":
      return { id: item.id, title: texts.withdrawWallet, subtitle: texts.moneyWithdrawal, amount: formatHistoryAmount(item, "out"), direction: "out", status, category: "withdraw", section: "money", ...common };
    case "deposit":
      return { id: item.id, title: texts.depositWallet, subtitle: texts.moneyCredited, amount: formatHistoryAmount(item, "in"), direction: "in", status, category: "topup", section: "money", ...common };
    case "qr_payment":
      return { id: item.id, title: texts.qrPayment, subtitle: item.counterparty?.walletId ? `${texts.walletTransfer} • ${item.counterparty.walletId}` : texts.qrRouteExecution, amount: formatHistoryAmount(item, "out"), direction: "out", status, category: "qr", section: "qr", ...common };
    case "wallet_operation":
      return { id: item.id, title: texts.walletOperation, subtitle: item.sourceModule || texts.walletTransfer, amount: formatHistoryAmount(item, "neutral"), direction: "out", status, category: "card", section: "money", ...common };
    case "transfer":
    default:
      return { id: item.id, title: texts.walletTransferTitle, subtitle: item.sourceModule || texts.walletTransfer, amount: formatHistoryAmount(item, "out"), direction: "out", status, category: "send", section: "money", ...common };
  }
}

export default function WalletHistoryScreen() {
  const { colors, radius } = useSabiTheme();
  const { t } = useI18n();
  const texts = useMemo(() => buildHistoryTexts(t), [t]);
  const params = useLocalSearchParams<{ userId?: string; walletId?: string }>();

  const userId = typeof params.userId === "string" ? params.userId : undefined;
  const walletId = typeof params.walletId === "string" ? params.walletId : undefined;

  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("all");
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(
    async (mode: "load" | "refresh" = "load") => {
      try {
        setError(null);
        if (mode === "load") setLoading(true);
        if (mode === "refresh") setRefreshing(true);

        const result = await getFinancialHistory({ userId, walletId, limit: 100 });
        setTransactions(result.items.map((item) => mapHistoryItemToWalletTransaction(item, texts)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "history_load_failed");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [texts, userId, walletId],
  );

  useEffect(() => { void loadHistory("load"); }, [loadHistory]);

  useWalletRealtime({
    userId,
    walletId,
    enabled: !loading,
    onRefresh: () => { void loadHistory("refresh"); },
  });

  const groupedTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = transactions.filter((item) => {
      const matchesFilter = activeFilter === "all" ? true : item.section === activeFilter;
      const matchesSearch = query.length === 0 ? true : [item.title, item.subtitle, item.reference, item.amount, item.dateLabel].join(" ").toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
    const map = new Map<string, WalletTransaction[]>();
    filtered.forEach((tx) => { const existing = map.get(tx.dateLabel) || []; existing.push(tx); map.set(tx.dateLabel, existing); });
    return Array.from(map.entries()).map(([dateLabel, items]) => ({ dateLabel, items }));
  }, [activeFilter, search, transactions]);

  const summary = useMemo(() => {
    const total = transactions.length;
    const pending = transactions.filter((tx) => tx.status === "pending").length;
    const failed = transactions.filter((tx) => tx.status === "failed").length;
    return { total, pending, failed };
  }, [transactions]);

  return (
    <AppContainer>
      <View style={[styles.screen, { backgroundColor: "#060F19" }]}>
        <View style={[styles.headerRow, { paddingHorizontal: 20, paddingTop: 18, marginBottom: 10 }]}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.iconButton,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg },
            ]}
          >
            <ArrowLeft size={18} color={colors.text} />
          </Pressable>

          <View style={styles.headerTextWrap}>
            <Text style={[styles.eyebrow, { color: colors.accent }]}>{texts.eyebrow}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{texts.title}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{texts.subtitle}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.screen}
          contentContainerStyle={[styles.content, { paddingTop: 8 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void loadHistory("refresh")} tintColor="#EAF1FF" />
          }
        >
          <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}>
            <View style={styles.heroGlowA} />
            <View style={styles.heroGlowB} />
            <View style={styles.heroShine} />
            <View style={styles.heroTopRow}>
              <View style={[styles.heroIconWrap, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius.lg }]}>
                <ReceiptText size={22} color={colors.text} />
              </View>
              <View style={styles.heroArrowWrap}><ChevronRight size={18} color="#EAF1FF" /></View>
            </View>
            <Text style={styles.heroEyebrow}>{texts.heroEyebrow}</Text>
            <Text style={styles.heroTitle}>{texts.heroTitle}</Text>
            <Text style={styles.heroSubtitle}>{texts.heroSubtitle}</Text>
            <View style={styles.summaryRow}>
              <SummaryPill label={texts.total} value={String(summary.total)} colors={colors} radius={radius.lg} />
              <SummaryPill label={texts.pending} value={String(summary.pending)} colors={colors} radius={radius.lg} />
              <SummaryPill label={texts.failed} value={String(summary.failed)} colors={colors} radius={radius.lg} />
            </View>
          </View>

          <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}>
            <View style={[styles.searchInputWrap, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius.lg }]}>
              <Search size={18} color={colors.textSecondary} />
              <TextInput value={search} onChangeText={setSearch} placeholder={texts.searchPlaceholder} placeholderTextColor={colors.textSecondary} style={[styles.searchInput, { color: colors.text }]} />
            </View>
            <View style={styles.filtersRow}>
              {FILTER_KEYS.map((filter) => {
                const active = activeFilter === filter;
                return (
                  <Pressable key={filter} onPress={() => setActiveFilter(filter)} style={[styles.filterChip, { backgroundColor: active ? "rgba(35,82,184,0.16)" : colors.cardSoft, borderColor: active ? colors.accent : colors.border, borderRadius: radius.lg }]}>
                    <Text style={[styles.filterChipText, { color: active ? colors.text : colors.textSecondary }]}>{filterLabel(filter, texts)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.noteCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}>
            <View style={styles.noteRow}>
              <ShieldCheck size={18} color={colors.text} />
              <Text style={[styles.noteText, { color: colors.textSecondary }]}>{texts.liveNote}</Text>
            </View>
          </View>

          {loading ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}>
              <ActivityIndicator color={colors.text} />
              <Text style={[styles.emptyTitle, { color: colors.text, marginTop: 10 }]}>{texts.loadingTitle}</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{texts.loadingText}</Text>
            </View>
          ) : error ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{texts.errorTitle}</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{error}</Text>
              <Pressable onPress={() => void loadHistory("load")} style={[styles.primaryButton, { marginTop: 14, backgroundColor: "#2F6BFF", borderColor: "#4F88FF", borderRadius: radius.lg }]}>
                <Text style={styles.primaryButtonText}>{texts.retry}</Text>
              </Pressable>
            </View>
          ) : groupedTransactions.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{texts.emptyTitle}</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{texts.emptyText}</Text>
            </View>
          ) : (
            groupedTransactions.map((group) => (
              <View key={group.dateLabel} style={styles.groupWrap}>
                <Text style={[styles.groupTitle, { color: colors.text }]}>{group.dateLabel}</Text>
                <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}>
                  {group.items.map((tx, index) => (
                    <React.Fragment key={tx.id}>
                      <Pressable onPress={() => router.push({ pathname: "/wallet/transaction-details" as never, params: { kind: normalizeKindForDetails(tx.rawKind), id: tx.id } })} style={styles.txRow}>
                        <View style={[styles.txIconWrap, { backgroundColor: colors.cardSoft, borderColor: colors.border }]}>{renderTxIcon(tx.category, colors.text)}</View>
                        <View style={styles.txTextWrap}>
                          <Text style={[styles.txTitle, { color: colors.text }]}>{tx.title}</Text>
                          <Text style={[styles.txSubtitle, { color: colors.textSecondary }]}>{tx.subtitle}</Text>
                          <Text style={[styles.txLedgerLine, { color: colors.textSecondary }]}>{buildLedgerLine(tx, texts)}</Text>
                          <View style={styles.metaRow}>
                            {renderStatusBadge(tx.status, texts, colors, radius.lg)}
                            <Text style={[styles.metaTime, { color: colors.textSecondary }]}>{tx.timeLabel}</Text>
                          </View>
                        </View>
                        <View style={styles.amountWrap}>
                          <Text style={[styles.txAmount, { color: tx.direction === "in" ? "#7CFFA2" : colors.text }]}>{tx.amount}</Text>
                        </View>
                      </Pressable>
                      {index !== group.items.length - 1 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            ))
          )}

          <View style={styles.bottomActions}>
            <Pressable onPress={() => router.back()} style={[styles.secondaryButton, { backgroundColor: "#0E1D33", borderColor: "rgba(95,142,255,0.24)", borderRadius: radius.lg }]}>
              <Text style={styles.secondaryButtonText}>{texts.back}</Text>
            </Pressable>
            <Pressable onPress={() => router.replace("/wallet/home")} style={[styles.primaryButton, { backgroundColor: "#2F6BFF", borderColor: "#4F88FF", borderRadius: radius.lg }]}>
              <Text style={styles.primaryButtonText}>{texts.walletHome}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 40,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 22,
  },

  iconButton: {
    width: 46,
    height: 46,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextWrap: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 8,
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
  },

  heroCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
    overflow: "hidden",
    position: "relative",
  },
  heroGlowA: {
    position: "absolute",
    top: -18,
    left: -18,
    width: 180,
    height: 135,
    borderRadius: 44,
    backgroundColor: "rgba(61,121,255,0.18)",
  },
  heroGlowB: {
    position: "absolute",
    right: -26,
    bottom: -28,
    width: 210,
    height: 150,
    borderRadius: 60,
    backgroundColor: "rgba(124,68,242,0.12)",
  },
  heroShine: {
    position: "absolute",
    top: -50,
    right: 38,
    width: 92,
    height: 280,
    backgroundColor: "rgba(255,255,255,0.06)",
    transform: [{ rotate: "22deg" }],
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2,
    marginBottom: 16,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroArrowWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    zIndex: 2,
    marginBottom: 8,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 29,
    zIndex: 2,
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 13,
    lineHeight: 18,
    zIndex: 2,
    marginBottom: 16,
    maxWidth: 300,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 10,
    zIndex: 2,
  },

  summaryPill: {
    flex: 1,
    borderWidth: 1,
    minHeight: 78,
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
  },

  summaryLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },

  summaryValue: {
    fontSize: 22,
    fontWeight: "900",
  },

  searchWrap: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 18,
  },

  searchInputWrap: {
    minHeight: 52,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },

  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  filterChip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  filterChipText: {
    fontSize: 13,
    fontWeight: "800",
  },

  noteCard: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 18,
  },

  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },

  emptyCard: {
    borderWidth: 1,
    padding: 24,
    marginBottom: 18,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },

  groupWrap: {
    marginBottom: 18,
  },

  groupTitle: {
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 10,
  },

  groupCard: {
    borderWidth: 1,
    padding: 8,
  },

  txRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 10,
  },

  txIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  txTextWrap: {
    flex: 1,
  },

  txTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },

  txSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 6,
  },

  txLedgerLine: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  statusBadge: {
    borderWidth: 1,
    minHeight: 28,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  metaTime: {
    fontSize: 12,
    fontWeight: "600",
  },

  amountWrap: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },

  txAmount: {
    fontSize: 14,
    fontWeight: "900",
  },

  divider: {
    height: 1,
    marginHorizontal: 10,
  },

  bottomActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },

  secondaryButton: {
    flex: 1,
    minHeight: 54,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: "#DCE7FF",
    fontSize: 14,
    fontWeight: "800",
  },

  primaryButton: {
    flex: 1,
    minHeight: 54,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#EAF1FF",
    fontSize: 14,
    fontWeight: "900",
  },
});

