import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Copy,
  CreditCard,
  QrCode,
  Receipt,
  ShieldCheck,
} from "lucide-react-native";

import AppContainer from "../../components/AppContainer";
import { useSabiTheme } from "../../src/theme/ThemeProvider";
import { useI18n } from "../../src/shared/i18n";
import { walletText } from "../../src/shared/wallet/wallet-i18n";
import {
  buildWalletLedgerView,
  type WalletLedgerProviderStatus,
  type WalletLedgerRiskStatus,
} from "../../src/shared/wallet/wallet-ledger";
import {
  getFinancialItemDetails,
  type FinancialItemDetailsResponse,
} from "../../src/shared/api/financial-api";
import { useWalletRealtime } from "../../src/shared/realtime/use-wallet-realtime";

type TxStatus = "completed" | "pending" | "failed";
type TxCategory = "send" | "receive" | "topup" | "withdraw" | "card" | "qr";
type TxDirection = "in" | "out";
type LiveKind = "transaction" | "payment" | "p2p" | "qr-payment" | "wallet-operation";

type DetailTexts = {
  eyebrow: string; title: string; subtitle: string; loadingTitle: string; loadingText: string; errorTitle: string; retry: string;
  completed: string; completedText: string; pending: string; pendingText: string; failed: string; failedText: string;
  incoming: string; outgoing: string; summaryEyebrow: string; operationSummary: string; overview: string; type: string; category: string; status: string; direction: string; date: string; time: string;
  referenceData: string; tracking: string; transactionId: string; reference: string; route: string; walletId: string; statusNote: string; processing: string; securityNote: string; securityText: string;
  backendPayload: string; liveData: string; quickActions: string; nextStep: string; backHistory: string; walletHome: string; newSend: string; newRequest: string; copyReference: string; referenceTitle: string;
  transaction: string; walletOperation: string; refundWallet: string; paymentWallet: string; p2pTransfer: string; qrExecution: string; coreOperation: string;
  providerPaymentLinked: string; transferBetweenUsers: string; qrRouteExecution: string; businessMerchantRoute: string;
  routeTransaction: string; routePayment: string; routeP2p: string; routeQr: string; routeCore: string; routeSend: string; routeReceive: string; routeTopup: string; routeWithdraw: string; routeCard: string; routeFallback: string;
  providerStatus: string; riskStatus: string; ledgerReference: string; providerReference: string; walletRoute: string; sourceModule: string; rawCardDataBlocked: string;
  providerConfirmed: string; providerPending: string; providerNotConfigured: string; providerFailed: string; providerRestricted: string; providerNotRequired: string;
  riskClear: string; riskPendingReview: string; riskSafeHold: string; riskRestricted: string; riskBlocked: string; riskUnknown: string;
};

function tr(t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string, key: string, fallback: string) {
  return walletText(t, key, fallback);
}

function buildTexts(t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string): DetailTexts {
  return {
    eyebrow: tr(t, "wallet.transactionDetails.eyebrow", "Wallet details"),
    title: tr(t, "wallet.transactionDetails.title", "Transaction Details"),
    subtitle: tr(t, "wallet.transactionDetails.subtitle", "Full summary, status and reference data for this wallet operation."),
    loadingTitle: tr(t, "wallet.transactionDetails.loadingTitle", "Loading details"),
    loadingText: tr(t, "wallet.transactionDetails.loadingText", "Fetching live transaction data from the backend."),
    errorTitle: tr(t, "wallet.transactionDetails.errorTitle", "Unable to load details"),
    retry: tr(t, "wallet.transactionDetails.retry", "Retry"),
    completed: tr(t, "wallet.transactionDetails.completed", "Completed"),
    completedText: tr(t, "wallet.transactionDetails.completedText", "This transaction has been processed successfully."),
    pending: tr(t, "wallet.transactionDetails.pending", "Pending"),
    pendingText: tr(t, "wallet.transactionDetails.pendingText", "The transaction is still being processed or awaiting final confirmation."),
    failed: tr(t, "wallet.transactionDetails.failed", "Failed"),
    failedText: tr(t, "wallet.transactionDetails.failedText", "This transaction did not complete successfully."),
    incoming: tr(t, "wallet.transactionDetails.incoming", "Incoming"),
    outgoing: tr(t, "wallet.transactionDetails.outgoing", "Outgoing"),
    summaryEyebrow: tr(t, "wallet.transactionDetails.summaryEyebrow", "Transaction summary"),
    operationSummary: tr(t, "wallet.transactionDetails.operationSummary", "Operation summary"),
    overview: tr(t, "wallet.transactionDetails.overview", "Overview"),
    type: tr(t, "wallet.transactionDetails.type", "Type"),
    category: tr(t, "wallet.transactionDetails.category", "Category"),
    status: tr(t, "wallet.transactionDetails.status", "Status"),
    direction: tr(t, "wallet.transactionDetails.direction", "Direction"),
    date: tr(t, "wallet.transactionDetails.date", "Date"),
    time: tr(t, "wallet.transactionDetails.time", "Time"),
    referenceData: tr(t, "wallet.transactionDetails.referenceData", "Reference data"),
    tracking: tr(t, "wallet.transactionDetails.tracking", "Tracking"),
    transactionId: tr(t, "wallet.transactionDetails.transactionId", "Transaction ID"),
    reference: tr(t, "wallet.transactionDetails.reference", "Reference"),
    route: tr(t, "wallet.transactionDetails.route", "Route"),
    walletId: tr(t, "wallet.transactionDetails.walletId", "Wallet ID"),
    statusNote: tr(t, "wallet.transactionDetails.statusNote", "Status note"),
    processing: tr(t, "wallet.transactionDetails.processing", "Processing"),
    securityNote: tr(t, "wallet.transactionDetails.securityNote", "Security note"),
    securityText: tr(t, "wallet.transactionDetails.securityText", "Review amount, destination and reference before taking any follow-up action."),
    backendPayload: tr(t, "wallet.transactionDetails.backendPayload", "Backend payload"),
    liveData: tr(t, "wallet.transactionDetails.liveData", "Live data"),
    quickActions: tr(t, "wallet.transactionDetails.quickActions", "Quick actions"),
    nextStep: tr(t, "wallet.transactionDetails.nextStep", "Next step"),
    backHistory: tr(t, "wallet.transactionDetails.backHistory", "Back to History"),
    walletHome: tr(t, "wallet.transactionDetails.walletHome", "Wallet Home"),
    newSend: tr(t, "wallet.transactionDetails.newSend", "New Send"),
    newRequest: tr(t, "wallet.transactionDetails.newRequest", "New Request"),
    copyReference: tr(t, "wallet.transactionDetails.copyReference", "Copy reference"),
    referenceTitle: tr(t, "wallet.transactionDetails.referenceTitle", "Reference"),
    transaction: tr(t, "wallet.transactionDetails.transaction", "Transaction"),
    walletOperation: tr(t, "wallet.transactionDetails.walletOperation", "Wallet operation"),
    refundWallet: tr(t, "wallet.transactionDetails.refundWallet", "Refund to Wallet"),
    paymentWallet: tr(t, "wallet.transactionDetails.paymentWallet", "Payment to Wallet"),
    p2pTransfer: tr(t, "wallet.transactionDetails.p2pTransfer", "P2P Wallet Transfer"),
    qrExecution: tr(t, "wallet.transactionDetails.qrExecution", "QR Payment Execution"),
    coreOperation: tr(t, "wallet.transactionDetails.coreOperation", "Wallet Core Operation"),
    providerPaymentLinked: tr(t, "wallet.transactionDetails.providerPaymentLinked", "Provider payment linked to wallet transaction"),
    transferBetweenUsers: tr(t, "wallet.transactionDetails.transferBetweenUsers", "Wallet transfer between users"),
    qrRouteExecution: tr(t, "wallet.transactionDetails.qrRouteExecution", "Universal QR route execution"),
    businessMerchantRoute: tr(t, "wallet.transactionDetails.businessMerchantRoute", "Business / merchant / core wallet route"),
    routeTransaction: tr(t, "wallet.transactionDetails.routeTransaction", "Unified wallet transaction flow"),
    routePayment: tr(t, "wallet.transactionDetails.routePayment", "Provider payment → wallet transaction → ledger"),
    routeP2p: tr(t, "wallet.transactionDetails.routeP2p", "P2P → wallet transfer flow"),
    routeQr: tr(t, "wallet.transactionDetails.routeQr", "Universal QR → wallet/payment route"),
    routeCore: tr(t, "wallet.transactionDetails.routeCore", "Wallet core operation"),
    routeSend: tr(t, "wallet.transactionDetails.routeSend", "Wallet send flow"),
    routeReceive: tr(t, "wallet.transactionDetails.routeReceive", "Wallet receive flow"),
    routeTopup: tr(t, "wallet.transactionDetails.routeTopup", "Wallet top up flow"),
    routeWithdraw: tr(t, "wallet.transactionDetails.routeWithdraw", "Wallet withdraw flow"),
    routeCard: tr(t, "wallet.transactionDetails.routeCard", "Wallet card operation"),
    routeFallback: tr(t, "wallet.transactionDetails.routeFallback", "Wallet transaction route"),
    providerStatus: tr(t, "wallet.transactionDetails.providerStatus", "Provider status"),
    riskStatus: tr(t, "wallet.transactionDetails.riskStatus", "Risk status"),
    ledgerReference: tr(t, "wallet.transactionDetails.ledgerReference", "Ledger reference"),
    providerReference: tr(t, "wallet.transactionDetails.providerReference", "Provider reference"),
    walletRoute: tr(t, "wallet.transactionDetails.walletRoute", "Wallet route"),
    sourceModule: tr(t, "wallet.transactionDetails.sourceModule", "Source module"),
    rawCardDataBlocked: tr(t, "wallet.transactionDetails.rawCardDataBlocked", "Raw card data blocked"),
    providerConfirmed: tr(t, "wallet.transactionDetails.providerConfirmed", "Provider confirmed"),
    providerPending: tr(t, "wallet.transactionDetails.providerPending", "Provider pending"),
    providerNotConfigured: tr(t, "wallet.transactionDetails.providerNotConfigured", "Provider not configured"),
    providerFailed: tr(t, "wallet.transactionDetails.providerFailed", "Provider failed"),
    providerRestricted: tr(t, "wallet.transactionDetails.providerRestricted", "Provider restricted"),
    providerNotRequired: tr(t, "wallet.transactionDetails.providerNotRequired", "Provider not required"),
    riskClear: tr(t, "wallet.transactionDetails.riskClear", "Risk clear"),
    riskPendingReview: tr(t, "wallet.transactionDetails.riskPendingReview", "Pending review"),
    riskSafeHold: tr(t, "wallet.transactionDetails.riskSafeHold", "Safe hold"),
    riskRestricted: tr(t, "wallet.transactionDetails.riskRestricted", "Restricted"),
    riskBlocked: tr(t, "wallet.transactionDetails.riskBlocked", "Blocked"),
    riskUnknown: tr(t, "wallet.transactionDetails.riskUnknown", "Risk unknown"),
  };
}

function SectionHeader({ title, hint, colors }: { title: string; hint: string; colors: { text: string; textSecondary: string } }) {
  return <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text><Text style={[styles.sectionHint, { color: colors.textSecondary }]}>{hint}</Text></View>;
}

function DetailRow({ label, value, colors, multiline = false }: { label: string; value: string; colors: { text: string; textSecondary: string }; multiline?: boolean }) {
  return <View style={[styles.detailRow, multiline && styles.detailRowTop]}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text><Text style={[styles.detailValue, { color: colors.text }, multiline && styles.detailValueMultiline]}>{value}</Text></View>;
}

function Divider({ color }: { color: string }) { return <View style={[styles.divider, { backgroundColor: color }]} />; }

function StatusBadge({ label, icon, colors, radius }: { label: string; icon: React.ReactNode; colors: { cardSoft: string; border: string; text: string }; radius: number }) {
  return <View style={[styles.statusBadge, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius }]}>{icon}<Text style={[styles.statusBadgeText, { color: colors.text }]}>{label}</Text></View>;
}

function ActionButton({ label, onPress, colors, radius }: { label: string; onPress: () => void; colors: { cardSoft: string; border: string; text: string }; radius: number }) {
  return <Pressable onPress={onPress} style={[styles.actionButton, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius }]}><Text style={[styles.actionButtonText, { color: colors.text }]}>{label}</Text></Pressable>;
}

function providerStatusLabel(status: WalletLedgerProviderStatus, texts: DetailTexts) {
  switch (status) {
    case "provider_confirmed": return texts.providerConfirmed;
    case "provider_pending": return texts.providerPending;
    case "provider_failed": return texts.providerFailed;
    case "provider_restricted": return texts.providerRestricted;
    case "provider_not_required": return texts.providerNotRequired;
    default: return texts.providerNotConfigured;
  }
}

function riskStatusLabel(status: WalletLedgerRiskStatus, texts: DetailTexts) {
  switch (status) {
    case "clear": return texts.riskClear;
    case "pending_review": return texts.riskPendingReview;
    case "safe_hold": return texts.riskSafeHold;
    case "restricted": return texts.riskRestricted;
    case "blocked": return texts.riskBlocked;
    default: return texts.riskUnknown;
  }
}

function renderTxIcon(category: TxCategory, color: string) {
  switch (category) {
    case "send": return <ArrowUpRight size={18} color={color} />;
    case "receive":
    case "topup": return <ArrowDownLeft size={18} color={color} />;
    case "withdraw": return <ArrowUpRight size={18} color={color} />;
    case "card": return <CreditCard size={18} color={color} />;
    case "qr": return <QrCode size={18} color={color} />;
    default: return <Receipt size={18} color={color} />;
  }
}

function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
function formatDateLabel(value?: string) { const date = new Date(value || ""); return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); }
function formatTimeLabel(value?: string) { const date = new Date(value || ""); return Number.isNaN(date.getTime()) ? "—" : date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }); }
function toTxStatus(status?: string): TxStatus { const normalized = String(status || "").toLowerCase(); if (normalized.includes("failed") || normalized.includes("error") || normalized.includes("declined")) return "failed"; if (normalized.includes("pending") || normalized.includes("created") || normalized.includes("authorized")) return "pending"; return "completed"; }
function inferCategory(kind?: string): TxCategory { if (kind === "payment") return "card"; if (kind === "qr-payment") return "qr"; if (kind === "wallet-operation") return "card"; return "send"; }
function inferDirection(kind?: string, amount?: number): TxDirection { if (kind === "payment" && amount !== undefined && amount >= 0) return "in"; if (kind === "transaction") return amount !== undefined && amount >= 0 ? "in" : "out"; return "out"; }

function buildLiveTitle(data: FinancialItemDetailsResponse, texts: DetailTexts) {
  switch (data.kind) {
    case "payment": return data.status === "REFUNDED" ? texts.refundWallet : texts.paymentWallet;
    case "p2p": return texts.p2pTransfer;
    case "qr-payment": return texts.qrExecution;
    case "wallet-operation": return texts.coreOperation;
    default: return texts.transaction;
  }
}

function buildLiveSubtitle(data: FinancialItemDetailsResponse, texts: DetailTexts) {
  switch (data.kind) {
    case "payment": return texts.providerPaymentLinked;
    case "p2p": return texts.transferBetweenUsers;
    case "qr-payment": return texts.qrRouteExecution;
    case "wallet-operation": return texts.businessMerchantRoute;
    default: return texts.walletOperation;
  }
}

function buildRouteDescription(kind: LiveKind | TxCategory, texts: DetailTexts, sourceModule?: string) {
  switch (kind) {
    case "transaction": return texts.routeTransaction;
    case "payment": return texts.routePayment;
    case "p2p": return texts.routeP2p;
    case "qr-payment": return texts.routeQr;
    case "wallet-operation": return `${texts.routeCore}${sourceModule ? ` • ${sourceModule}` : ""}`;
    case "send": return texts.routeSend;
    case "receive": return texts.routeReceive;
    case "topup": return texts.routeTopup;
    case "withdraw": return texts.routeWithdraw;
    case "card": return texts.routeCard;
    default: return texts.routeFallback;
  }
}

function mapLiveData(data: FinancialItemDetailsResponse, texts: DetailTexts) {
  const amountValue = typeof data.amount === "number" ? data.amount : undefined;
  const category = inferCategory(data.kind);
  const direction = inferDirection(data.kind, amountValue);
  const currency = String(data.currency || "").trim();
  const ledgerView = buildWalletLedgerView(data);
  return {
    id: data.id,
    title: buildLiveTitle(data, texts),
    subtitle: buildLiveSubtitle(data, texts),
    amount: amountValue !== undefined ? `${direction === "in" ? "+" : "-"} ${amountValue.toFixed(2)}${currency ? ` ${currency}` : ""}` : "—",
    status: toTxStatus(data.status),
    dateLabel: formatDateLabel(data.createdAt),
    timeLabel: formatTimeLabel(data.createdAt),
    reference: data.reference || data.transactionId || data.id,
    category,
    direction,
    routeDescription: buildRouteDescription(data.kind, texts, data.sourceModule),
    payloadText: JSON.stringify(data.payload, null, 2),
    transactionId: data.transactionId || data.id,
    walletId: data.walletId,
    kind: data.kind,
    sourceModule: data.sourceModule,
    createdAt: data.createdAt,
    ledgerView,
  };
}

function normalizeLegacyKind(category: TxCategory): LiveKind {
  switch (category) {
    case "card": return "payment";
    case "qr": return "qr-payment";
    case "send":
    case "receive": return "p2p";
    default: return "transaction";
  }
}

export default function WalletTransactionDetailsScreen() {
  const { colors, radius } = useSabiTheme();
  const { t } = useI18n();
  const texts = useMemo(() => buildTexts(t), [t]);
  const params = useLocalSearchParams<{ id?: string; kind?: string; title?: string; subtitle?: string; amount?: string; status?: string; dateLabel?: string; timeLabel?: string; reference?: string; category?: string; direction?: string }>();
  const liveKind = typeof params.kind === "string" && ["transaction", "payment", "p2p", "qr-payment", "wallet-operation"].includes(params.kind) ? (params.kind as LiveKind) : undefined;
  const id = typeof params.id === "string" ? params.id : "tx_unknown";
  const [liveData, setLiveData] = useState<FinancialItemDetailsResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(liveKind && id));
  const [error, setError] = useState<string | null>(null);

  const loadLive = useCallback(async () => {
    if (!liveKind || !id) return;
    try { setLoading(true); setError(null); setLiveData(await getFinancialItemDetails({ kind: liveKind, id })); }
    catch (err) { setError(err instanceof Error ? err.message : "transaction_details_load_failed"); }
    finally { setLoading(false); }
  }, [liveKind, id]);

  useEffect(() => { if (liveKind && id) void loadLive(); }, [liveKind, id, loadLive]);
  useWalletRealtime({ enabled: Boolean(liveKind && id), operationId: liveKind === "wallet-operation" ? id : undefined, walletId: liveData?.walletId, onRefresh: () => { if (liveKind && id) void loadLive(); } });

  const legacyCategory = (typeof params.category === "string" ? params.category : "send") as TxCategory;
  const legacyDirection = (typeof params.direction === "string" ? params.direction : "out") as TxDirection;
  const viewModel = useMemo(() => liveData ? mapLiveData(liveData, texts) : {
    id,
    title: typeof params.title === "string" ? params.title : texts.transaction,
    subtitle: typeof params.subtitle === "string" ? params.subtitle : texts.walletOperation,
    amount: typeof params.amount === "string" ? params.amount : "—",
    status: toTxStatus(typeof params.status === "string" ? params.status : "completed"),
    dateLabel: typeof params.dateLabel === "string" ? params.dateLabel : "—",
    timeLabel: typeof params.timeLabel === "string" ? params.timeLabel : "—",
    reference: typeof params.reference === "string" ? params.reference : "—",
    category: legacyCategory,
    direction: legacyDirection,
    routeDescription: buildRouteDescription(legacyCategory, texts),
    payloadText: "",
    transactionId: id,
    walletId: undefined as string | undefined,
    kind: normalizeLegacyKind(legacyCategory),
    sourceModule: "wallet",
    createdAt: undefined as string | undefined,
    ledgerView: buildWalletLedgerView({
      id,
      kind: normalizeLegacyKind(legacyCategory),
      sourceModule: "wallet",
      reference: typeof params.reference === "string" ? params.reference : undefined,
    }),
  }, [liveData, texts, id, params.title, params.subtitle, params.amount, params.status, params.dateLabel, params.timeLabel, params.reference, legacyCategory, legacyDirection]);

  const statusMeta = useMemo(() => {
    if (viewModel.status === "completed") return { label: texts.completed, text: texts.completedText, icon: <CheckCircle2 size={16} color="#7CFFA2" /> };
    if (viewModel.status === "pending") return { label: texts.pending, text: texts.pendingText, icon: <Clock3 size={16} color="#FFD66B" /> };
    return { label: texts.failed, text: texts.failedText, icon: <CircleAlert size={16} color="#FF8B8B" /> };
  }, [texts, viewModel.status]);
  const directionLabel = viewModel.direction === "in" ? texts.incoming : texts.outgoing;

  return (
    <AppContainer>
      <View style={[styles.screen, { backgroundColor: "#060F19" }]}>
        <View style={[styles.headerRow, { paddingHorizontal: 20, paddingTop: 18, marginBottom: 10 }]}>
          <Pressable onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg }]}><ArrowLeft size={18} color={colors.text} /></Pressable>
          <View style={styles.headerTextWrap}><Text style={[styles.eyebrow, { color: colors.accent }]}>{texts.eyebrow}</Text><Text style={[styles.title, { color: colors.text }]}>{texts.title}</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>{texts.subtitle}</Text></View>
        </View>
        <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: 8 }]} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}><ActivityIndicator color={colors.text} /><Text style={[styles.emptyTitle, { color: colors.text, marginTop: 10 }]}>{texts.loadingTitle}</Text><Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{texts.loadingText}</Text></View>
          ) : error ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}><Text style={[styles.emptyTitle, { color: colors.text }]}>{texts.errorTitle}</Text><Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{error}</Text><Pressable onPress={() => void loadLive()} style={[styles.primaryButton, { marginTop: 14, backgroundColor: "#2F6BFF", borderColor: "#4F88FF", borderRadius: radius.lg }]}><Text style={styles.primaryButtonText}>{texts.retry}</Text></Pressable></View>
          ) : (
            <>
              <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}>
                <View style={styles.heroGlowA} /><View style={styles.heroGlowB} /><View style={styles.heroShine} />
                <View style={styles.heroTopRow}><View style={[styles.heroIconWrap, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius.lg }]}>{renderTxIcon(viewModel.category, colors.text)}</View><View style={styles.heroArrowWrap}><ChevronRight size={18} color="#EAF1FF" /></View></View>
                <Text style={styles.heroEyebrow}>{texts.summaryEyebrow}</Text><Text style={styles.heroTitle}>{viewModel.title}</Text><Text style={styles.heroSubtitle}>{viewModel.subtitle}</Text>
                <Text style={[styles.amountText, { color: viewModel.direction === "in" ? "#7CFFA2" : "#FFFFFF" }]}>{viewModel.amount}</Text>
                <View style={styles.heroMetaRow}><StatusBadge label={statusMeta.label} icon={statusMeta.icon} colors={colors} radius={radius.lg} /><View style={[styles.directionBadge, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius.lg }]}><Text style={[styles.directionBadgeText, { color: colors.text }]}>{directionLabel}</Text></View></View>
              </View>
              <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}>
                <SectionHeader title={texts.operationSummary} hint={texts.overview} colors={colors} />
                <DetailRow label={texts.type} value={viewModel.title} colors={colors} /><Divider color={colors.border} />
                <DetailRow label={texts.category} value={capitalize(viewModel.category)} colors={colors} /><Divider color={colors.border} />
                <DetailRow label={texts.status} value={statusMeta.label} colors={colors} /><Divider color={colors.border} />
                <DetailRow label={texts.direction} value={directionLabel} colors={colors} /><Divider color={colors.border} />
                <DetailRow label={texts.date} value={viewModel.dateLabel} colors={colors} /><Divider color={colors.border} />
                <DetailRow label={texts.time} value={viewModel.timeLabel} colors={colors} />
              </View>
              <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}>
                <SectionHeader title={texts.referenceData} hint={texts.tracking} colors={colors} />
                <DetailRow label={texts.transactionId} value={viewModel.transactionId || viewModel.id} colors={colors} multiline /><Divider color={colors.border} />
                <DetailRow label={texts.reference} value={viewModel.reference} colors={colors} multiline /><Divider color={colors.border} />
                <DetailRow label={texts.route} value={viewModel.routeDescription} colors={colors} multiline />
                <Divider color={colors.border} />
                <DetailRow label={texts.walletRoute} value={viewModel.ledgerView.route} colors={colors} multiline />
                <Divider color={colors.border} />
                <DetailRow label={texts.providerStatus} value={viewModel.ledgerView.hasRawCardData ? texts.rawCardDataBlocked : providerStatusLabel(viewModel.ledgerView.providerStatus, texts)} colors={colors} multiline />
                <Divider color={colors.border} />
                <DetailRow label={texts.riskStatus} value={viewModel.ledgerView.hasRawCardData ? texts.riskBlocked : riskStatusLabel(viewModel.ledgerView.riskStatus, texts)} colors={colors} multiline />
                {viewModel.ledgerView.ledgerReference ? <><Divider color={colors.border} /><DetailRow label={texts.ledgerReference} value={viewModel.ledgerView.ledgerReference} colors={colors} multiline /></> : null}
                {viewModel.ledgerView.providerReference ? <><Divider color={colors.border} /><DetailRow label={texts.providerReference} value={viewModel.ledgerView.providerReference} colors={colors} multiline /></> : null}
                {viewModel.walletId || viewModel.ledgerView.walletId ? <><Divider color={colors.border} /><DetailRow label={texts.walletId} value={viewModel.walletId || viewModel.ledgerView.walletId} colors={colors} multiline /></> : null}
                {viewModel.sourceModule || viewModel.ledgerView.sourceModule ? <><Divider color={colors.border} /><DetailRow label={texts.sourceModule} value={viewModel.sourceModule || viewModel.ledgerView.sourceModule} colors={colors} multiline /></> : null}
              </View>
              <View style={[styles.noteCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}>
                <SectionHeader title={texts.statusNote} hint={texts.processing} colors={colors} />
                <View style={styles.noteRow}><View style={[styles.noteIconWrap, { backgroundColor: colors.cardSoft, borderColor: colors.border }]}>{statusMeta.icon}</View><View style={styles.noteTextWrap}><Text style={[styles.noteTitle, { color: colors.text }]}>{statusMeta.label}</Text><Text style={[styles.noteText, { color: colors.textSecondary }]}>{statusMeta.text}</Text></View></View>
                <Divider color={colors.border} />
                <View style={styles.noteRow}><View style={[styles.noteIconWrap, { backgroundColor: colors.cardSoft, borderColor: colors.border }]}><ShieldCheck size={16} color={colors.text} /></View><View style={styles.noteTextWrap}><Text style={[styles.noteTitle, { color: colors.text }]}>{texts.securityNote}</Text><Text style={[styles.noteText, { color: colors.textSecondary }]}>{texts.securityText}</Text></View></View>
              </View>
              {viewModel.payloadText ? <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}><SectionHeader title={texts.backendPayload} hint={texts.liveData} colors={colors} /><Text style={[styles.payloadText, { color: colors.textSecondary }]}>{viewModel.payloadText}</Text></View> : null}
              <View style={[styles.actionsCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}>
                <SectionHeader title={texts.quickActions} hint={texts.nextStep} colors={colors} />
                <View style={styles.actionsGrid}><ActionButton label={texts.backHistory} onPress={() => router.replace("/wallet/history")} colors={colors} radius={radius.lg} /><ActionButton label={texts.walletHome} onPress={() => router.replace("/wallet/home")} colors={colors} radius={radius.lg} /><ActionButton label={texts.newSend} onPress={() => router.push("/wallet/send")} colors={colors} radius={radius.lg} /><ActionButton label={texts.newRequest} onPress={() => router.push("/wallet/request-money")} colors={colors} radius={radius.lg} /></View>
                <Pressable onPress={() => Alert.alert(texts.referenceTitle, viewModel.reference)} style={[styles.copyAction, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius.lg }]}><Copy size={16} color={colors.text} /><Text style={[styles.copyActionText, { color: colors.text }]}>{texts.copyReference}</Text></Pressable>
              </View>
              <View style={styles.bottomRow}><Pressable onPress={() => router.replace("/wallet/history")} style={[styles.secondaryButton, { backgroundColor: "#0E1D33", borderColor: "rgba(95,142,255,0.24)", borderRadius: radius.lg }]}><Text style={styles.secondaryButtonText}>{texts.backHistory}</Text></Pressable><Pressable onPress={() => router.replace("/wallet/home")} style={[styles.primaryButton, { backgroundColor: "#2F6BFF", borderColor: "#4F88FF", borderRadius: radius.lg }]}><Text style={styles.primaryButtonText}>{texts.walletHome}</Text></Pressable></View>
            </>
          )}
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

  amountText: {
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 14,
    zIndex: 2,
  },

  heroMetaRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    zIndex: 2,
  },

  statusBadge: {
    minHeight: 34,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  statusBadgeText: {
    fontSize: 13,
    fontWeight: "800",
  },

  directionBadge: {
    minHeight: 34,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  directionBadgeText: {
    fontSize: 13,
    fontWeight: "800",
  },

  infoCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },

  sectionHint: {
    fontSize: 12,
    fontWeight: "700",
  },

  detailRow: {
    minHeight: 34,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
  },

  detailRowTop: {
    alignItems: "flex-start",
  },

  detailLabel: {
    fontSize: 13,
    fontWeight: "700",
  },

  detailValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "800",
    maxWidth: "62%",
  },

  detailValueMultiline: {
    textAlign: "left",
    maxWidth: "64%",
  },

  divider: {
    height: 1,
    marginVertical: 12,
  },

  noteCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
  },

  noteRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },

  noteIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  noteTextWrap: {
    flex: 1,
  },

  noteTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },

  noteText: {
    fontSize: 13,
    lineHeight: 18,
  },

  actionsCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
  },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },

  actionButton: {
    width: "48%",
    minHeight: 52,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  actionButtonText: {
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },

  copyAction: {
    minHeight: 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  copyActionText: {
    fontSize: 13,
    fontWeight: "800",
  },

  bottomRow: {
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

  payloadText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "monospace",
  },
});

