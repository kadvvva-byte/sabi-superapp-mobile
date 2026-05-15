import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Landmark,
  QrCode,
  ReceiptText,
  ScanLine,
  Search,
  ShieldCheck,
  Store,
  Wallet,
} from "lucide-react-native";

import AppContainer from "../../components/AppContainer";
import { useI18n } from "../../src/shared/i18n";
import {
  formatPrimaryWalletAmount,
  useWalletFoundation,
} from "../../src/shared/wallet/wallet-foundation";
import {
  buildWalletBusinessMerchantRouteGuard,
  walletBusinessMerchantRouteParams,
} from "../../src/shared/wallet/wallet-business-merchant-routes";
import { useSabiTheme } from "../../src/theme/ThemeProvider";

type FundingSourceId = "business" | "wallet" | "merchant";

type FundingSource = {
  id: FundingSourceId;
  title: string;
  subtitle: string;
  value: string;
  available: boolean;
};

function walletText(t: (key: string, params?: Record<string, string | number>) => string, key: string, fallback: string) {
  const value = t(key);
  return typeof value === "string" && value.trim() && value !== key ? value : fallback;
}

function parseMoneyInput(value: string) {
  const normalized = String(value || "").replace(",", ".").replace(/[^0-9.]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function SectionHeader({
  title,
  hint,
  colors,
}: {
  title: string;
  hint: string;
  colors: { text: string; textSecondary: string };
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>{hint}</Text>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}

function PreviewRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: { text: string; textSecondary: string };
}) {
  return (
    <View style={styles.previewRow}>
      <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.previewValue, { color: colors.text }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function InfoRow({
  icon,
  title,
  text,
  colors,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  colors: { text: string; textSecondary: string };
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoTextWrap}>
        <Text style={[styles.infoTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>{text}</Text>
      </View>
    </View>
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
  colors: {
    cardSoft: string;
    border: string;
    text: string;
    textSecondary: string;
  };
  radius: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.qrCard,
        {
          backgroundColor: colors.cardSoft,
          borderColor: colors.border,
          borderRadius: radius,
        },
      ]}
    >
      <View style={styles.qrIconWrap}>{icon}</View>
      <Text style={[styles.qrTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.qrSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </Pressable>
  );
}

export default function WalletBusinessPayScreen() {
  const { colors, radius } = useSabiTheme();
  const { t } = useI18n();
  const { snapshot } = useWalletFoundation();
  const primaryCurrencyCode = snapshot.primaryCurrencyCode || "USD";

  const [search, setSearch] = useState("");
  const [selectedSourceId, setSelectedSourceId] = useState<FundingSourceId>("wallet");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");

  const texts = useMemo(
    () => ({
      eyebrow: walletText(t, "wallet.businessPay.eyebrow", "Business Pay"),
      title: walletText(t, "wallet.businessPay.title", "Business routing"),
      subtitle: walletText(t, "wallet.businessPay.subtitle", "Business wallet route is prepared for provider-backed payouts and merchant-linked settlements."),
      providerStatus: walletText(t, "wallet.businessPay.providerStatus", "Provider not configured"),
      routeTitle: walletText(t, "wallet.businessPay.routeTitle", "Business route"),
      routeHint: walletText(t, "wallet.businessPay.routeHint", "Provider-backed routes"),
      routeEmptyTitle: walletText(t, "wallet.businessPay.routeEmptyTitle", "No business routes yet"),
      routeEmptyText: walletText(t, "wallet.businessPay.routeEmptyText", "Routes must come from Business Wallet provider, KYB and admin configuration."),
      searchPlaceholder: walletText(t, "wallet.businessPay.searchPlaceholder", "Search business routes"),
      fundingTitle: walletText(t, "wallet.businessPay.fundingTitle", "Funding source"),
      fundingHint: walletText(t, "wallet.businessPay.fundingHint", "Token and wallet rails"),
      businessBalance: walletText(t, "wallet.businessPay.businessBalance", "Business Wallet"),
      businessBalanceText: walletText(t, "wallet.businessPay.businessBalanceText", "Available after Business Wallet launch"),
      sabiBalance: walletText(t, "wallet.shared.sabiBalance", "Sabi Balance"),
      sabiBalanceText: walletText(t, "wallet.businessPay.sabiBalanceText", "Personal Sabi Wallet bridge"),
      merchantBalance: walletText(t, "wallet.businessPay.merchantBalance", "Merchant route"),
      merchantBalanceText: walletText(t, "wallet.businessPay.merchantBalanceText", "Available after merchant settlement provider is connected"),
      notConfigured: walletText(t, "wallet.businessPay.notConfigured", "Not configured"),
      detailsTitle: walletText(t, "wallet.businessPay.detailsTitle", "Payout details"),
      detailsHint: walletText(t, "wallet.businessPay.detailsHint", "Amount and reference"),
      amount: walletText(t, "wallet.businessPay.amount", "Amount"),
      amountPlaceholder: walletText(t, "wallet.businessPay.amountPlaceholder", "0.00"),
      reference: walletText(t, "wallet.businessPay.reference", "Reference"),
      referencePlaceholder: walletText(t, "wallet.businessPay.referencePlaceholder", "Invoice, order or payout reference"),
      previewTitle: walletText(t, "wallet.businessPay.previewTitle", "Routing preview"),
      previewHint: walletText(t, "wallet.businessPay.previewHint", "Summary"),
      selectedRoute: walletText(t, "wallet.businessPay.selectedRoute", "Selected route"),
      fundingSource: walletText(t, "wallet.businessPay.fundingSource", "Funding source"),
      noReference: walletText(t, "wallet.businessPay.noReference", "No reference"),
      qrTitle: walletText(t, "wallet.businessPay.qrTitle", "Business QR"),
      qrSubtitle: walletText(t, "wallet.businessPay.qrSubtitle", "Generate business receive QR"),
      scanTitle: walletText(t, "wallet.businessPay.scanTitle", "Scan business QR"),
      scanSubtitle: walletText(t, "wallet.businessPay.scanSubtitle", "Open wallet scanner"),
      routesTitle: walletText(t, "wallet.businessPay.routesTitle", "Business links"),
      routesHint: walletText(t, "wallet.businessPay.routesHint", "Wallet navigation"),
      merchantLink: walletText(t, "wallet.businessPay.merchantLink", "Merchant link"),
      history: walletText(t, "wallet.businessPay.history", "History"),
      paymentsHub: walletText(t, "wallet.businessPay.paymentsHub", "Payments hub"),
      notesTitle: walletText(t, "wallet.businessPay.notesTitle", "Security"),
      notesHint: walletText(t, "wallet.businessPay.notesHint", "Policy"),
      note1Title: walletText(t, "wallet.businessPay.note1Title", "Business route separation"),
      note1Text: walletText(t, "wallet.businessPay.note1Text", "Business money routing stays separate from personal wallet flow."),
      note2Title: walletText(t, "wallet.businessPay.note2Title", "KYB and admin control"),
      note2Text: walletText(t, "wallet.businessPay.note2Text", "Business payouts require provider, KYB, wallet risk checks and admin/compliance hooks."),
      note3Title: walletText(t, "wallet.businessPay.note3Title", "Provider settlement only"),
      note3Text: walletText(t, "wallet.businessPay.note3Text", "Business balances and payouts require provider settlement confirmation."),
      back: walletText(t, "wallet.businessPay.back", "Back"),
      process: walletText(t, "wallet.businessPay.process", "Process payout"),
    }),
    [t],
  );

  const sources = useMemo<FundingSource[]>(
    () => [
      {
        id: "business",
        title: texts.businessBalance,
        subtitle: texts.businessBalanceText,
        value: texts.notConfigured,
        available: false,
      },
      {
        id: "wallet",
        title: texts.sabiBalance,
        subtitle: texts.sabiBalanceText,
        value: formatPrimaryWalletAmount(snapshot.mainBalanceUsd, primaryCurrencyCode),
        available: true,
      },
      {
        id: "merchant",
        title: texts.merchantBalance,
        subtitle: texts.merchantBalanceText,
        value: texts.notConfigured,
        available: false,
      },
    ],
    [snapshot.mainBalanceUsd, texts],
  );

  const selectedSource = sources.find((item) => item.id === selectedSourceId) ?? sources[1];
  const amountValue = parseMoneyInput(amount);
  const amountText = formatPrimaryWalletAmount(amountValue, primaryCurrencyCode);
  const routeGuard = useMemo(
    () =>
      buildWalletBusinessMerchantRouteGuard({
        snapshot,
        routeKind: "business",
        fundingSource: selectedSourceId,
        amount: amountValue,
        currencyCode: primaryCurrencyCode,
        payload: {
          fundingSource: selectedSourceId,
          reference: reference.trim(),
        },
      }),
    [amountValue, primaryCurrencyCode, reference, selectedSourceId, snapshot],
  );
  const routeStatusText = routeGuard.blockedReason === "ok" ? texts.process : texts.providerStatus;
  const canProcess = routeGuard.canProcess;

  const handleProcess = () => {
    if (!canProcess) return;

    router.push({
      pathname: "/wallet/confirm",
      params: {
        flow: "business-payout",
        title: texts.title,
        amount: amountValue.toFixed(2),
        currency: primaryCurrencyCode,
        destinationTitle: texts.routeTitle,
        destinationType: routeGuard.walletRoute,
        sourceTitle: selectedSource.title,
        sourceScheme: selectedSource.id,
        sourcePan: texts.notConfigured,
        note: reference.trim(),
        ...walletBusinessMerchantRouteParams(routeGuard),
      },
    });
  };

  return (
    <AppContainer>
      <View style={[styles.screen, { backgroundColor: "#060F19" }]}>
        <View
          style={[
            styles.fixedHeader,
            {
              backgroundColor: "rgba(6,15,25,0.96)",
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.iconButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <ArrowLeft size={18} color={colors.text} />
          </Pressable>

          <View style={styles.fixedHeaderText}>
            <Text style={[styles.eyebrow, { color: colors.accent }]}>{texts.eyebrow}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{texts.title}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: radius.xl,
              },
            ]}
          >
            <View style={styles.heroGlowA} />
            <View style={styles.heroGlowB} />

            <View style={styles.heroTopRow}>
              <View
                style={[
                  styles.heroIconWrap,
                  {
                    backgroundColor: "rgba(255,255,255,0.10)",
                    borderColor: "rgba(255,255,255,0.14)",
                    borderRadius: radius.lg,
                  },
                ]}
              >
                <BriefcaseBusiness size={22} color="#EAF1FF" />
              </View>

              <View style={[styles.statusPill, { borderColor: colors.border }]}> 
                <Text style={styles.statusPillText}>{routeStatusText}</Text>
              </View>
            </View>

            <Text style={styles.heroEyebrow}>{texts.eyebrow}</Text>
            <Text style={styles.heroTitle}>{texts.title}</Text>
            <Text style={styles.heroSubtitle}>{texts.subtitle}</Text>

            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatLabel}>{texts.businessBalance}</Text>
                <Text style={styles.heroStatValue}>{texts.notConfigured}</Text>
              </View>

              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatLabel}>{texts.amount}</Text>
                <Text style={styles.heroStatValue}>{amountText}</Text>
              </View>
            </View>
          </View>

          <View style={styles.qrGrid}>
            <QrAccessCard
              title={texts.qrTitle}
              subtitle={texts.qrSubtitle}
              onPress={() =>
                router.push({
                  pathname: "/wallet/qr-create",
                  params: {
                    variant: "business",
                    label: texts.qrTitle,
                    reference: "business-pay",
                  },
                })
              }
              icon={<QrCode size={18} color={colors.text} />}
              colors={colors}
              radius={radius.lg}
            />
            <QrAccessCard
              title={texts.scanTitle}
              subtitle={texts.scanSubtitle}
              onPress={() => router.push("/wallet/qr-camera")}
              icon={<ScanLine size={18} color={colors.text} />}
              colors={colors}
              radius={radius.lg}
            />
          </View>

          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}> 
            <SectionHeader title={texts.routeTitle} hint={texts.routeHint} colors={colors} />

            <View style={[styles.searchWrap, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius.lg }]}> 
              <Search size={18} color={colors.textSecondary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={texts.searchPlaceholder}
                placeholderTextColor={colors.textSecondary}
                style={[styles.searchInput, { color: colors.text }]}
              />
            </View>

            <View style={[styles.emptyRouteCard, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius.lg }]}> 
              <BriefcaseBusiness size={20} color={colors.text} />
              <View style={styles.emptyRouteText}>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>{texts.routeEmptyTitle}</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{texts.routeEmptyText}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}> 
            <SectionHeader title={texts.fundingTitle} hint={texts.fundingHint} colors={colors} />

            <View style={styles.sourceList}>
              {sources.map((source) => {
                const active = source.id === selectedSourceId;

                return (
                  <Pressable
                    key={source.id}
                    onPress={() => setSelectedSourceId(source.id)}
                    style={[
                      styles.sourceCard,
                      {
                        backgroundColor: active ? "rgba(72,120,255,0.12)" : colors.cardSoft,
                        borderColor: active ? colors.accent : colors.border,
                        borderRadius: radius.lg,
                      },
                    ]}
                  >
                    <View style={styles.sourceLeft}>
                      <View style={styles.sourceIconWrap}>
                        {source.id === "business" ? (
                          <Building2 size={18} color={colors.text} />
                        ) : source.id === "wallet" ? (
                          <Wallet size={18} color={colors.text} />
                        ) : (
                          <Store size={18} color={colors.text} />
                        )}
                      </View>

                      <View style={styles.sourceTextWrap}>
                        <Text style={[styles.sourceTitle, { color: colors.text }]}>{source.title}</Text>
                        <Text style={[styles.sourceSubtitle, { color: colors.textSecondary }]}>{source.subtitle}</Text>
                      </View>
                    </View>

                    <Text style={[styles.sourceBalance, { color: colors.text }]}>{source.value}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}> 
            <SectionHeader title={texts.detailsTitle} hint={texts.detailsHint} colors={colors} />

            <Text style={[styles.fieldLabel, { color: colors.text }]}>{texts.amount}</Text>
            <View style={[styles.inputBox, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius.lg }]}> 
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder={texts.amountPlaceholder}
                placeholderTextColor={colors.textSecondary}
                style={[styles.amountInput, { color: colors.text }]}
              />
            </View>

            <Text style={[styles.fieldLabel, { color: colors.text }]}>{texts.reference}</Text>
            <View style={[styles.inputBox, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius.lg }]}> 
              <TextInput
                value={reference}
                onChangeText={setReference}
                placeholder={texts.referencePlaceholder}
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text }]}
              />
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}> 
            <SectionHeader title={texts.previewTitle} hint={texts.previewHint} colors={colors} />
            <PreviewRow label={texts.selectedRoute} value={routeStatusText} colors={colors} />
            <Divider color={colors.border} />
            <PreviewRow label={texts.fundingSource} value={selectedSource.title} colors={colors} />
            <Divider color={colors.border} />
            <PreviewRow label={texts.amount} value={amountText} colors={colors} />
            <Divider color={colors.border} />
            <PreviewRow label={texts.reference} value={reference.trim() || texts.noReference} colors={colors} />
          </View>

          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}> 
            <SectionHeader title={texts.routesTitle} hint={texts.routesHint} colors={colors} />

            <View style={styles.routesRow}>
              <Pressable onPress={() => router.push("/wallet/merchant-pay")} style={[styles.routeAction, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius.lg }]}> 
                <Store size={18} color={colors.text} />
                <Text style={[styles.routeActionText, { color: colors.text }]}>{texts.merchantLink}</Text>
              </Pressable>

              <Pressable onPress={() => router.push("/wallet/history")} style={[styles.routeAction, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius.lg }]}> 
                <ReceiptText size={18} color={colors.text} />
                <Text style={[styles.routeActionText, { color: colors.text }]}>{texts.history}</Text>
              </Pressable>

              <Pressable onPress={() => router.push("/wallet/payments")} style={[styles.routeAction, { backgroundColor: colors.cardSoft, borderColor: colors.border, borderRadius: radius.lg }]}> 
                <Landmark size={18} color={colors.text} />
                <Text style={[styles.routeActionText, { color: colors.text }]}>{texts.paymentsHub}</Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}> 
            <SectionHeader title={texts.notesTitle} hint={texts.notesHint} colors={colors} />
            <InfoRow icon={<BriefcaseBusiness size={18} color={colors.text} />} title={texts.note1Title} text={texts.note1Text} colors={colors} />
            <Divider color={colors.border} />
            <InfoRow icon={<ShieldCheck size={18} color={colors.text} />} title={texts.note2Title} text={texts.note2Text} colors={colors} />
            <Divider color={colors.border} />
            <InfoRow icon={<ArrowUpRight size={18} color={colors.text} />} title={texts.note3Title} text={texts.note3Text} colors={colors} />
          </View>

          <View style={styles.bottomActions}>
            <Pressable onPress={() => router.back()} style={[styles.secondaryButton, { backgroundColor: "#0E1D33", borderColor: "rgba(95,142,255,0.24)", borderRadius: radius.lg }]}> 
              <Text style={styles.secondaryButtonText}>{texts.back}</Text>
            </Pressable>

            <Pressable disabled={!canProcess} onPress={handleProcess} style={[styles.primaryButton, { backgroundColor: canProcess ? "#2F6BFF" : "rgba(95,142,255,0.26)", borderColor: canProcess ? "#4F88FF" : "rgba(95,142,255,0.18)", borderRadius: radius.lg }]}> 
              <ArrowUpRight size={18} color="#EAF1FF" />
              <Text style={styles.primaryButtonText}>{canProcess ? texts.process : routeStatusText}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
    minHeight: 88,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  fixedHeaderText: { flex: 1, marginLeft: 12 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 108, paddingBottom: 40, flexGrow: 1 },
  iconButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  eyebrow: { fontSize: 12, fontWeight: "900", letterSpacing: 0.9, textTransform: "uppercase" },
  title: { fontSize: 24, fontWeight: "900", marginTop: 2 },
  heroCard: { padding: 18, borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  heroGlowA: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(47,107,255,0.34)", right: -70, top: -60 },
  heroGlowB: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(37,217,162,0.18)", left: -80, bottom: -80 },
  heroTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 22 },
  heroIconWrap: { width: 50, height: 50, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  statusPill: { minHeight: 32, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.10)", alignItems: "center", justifyContent: "center" },
  statusPillText: { color: "#EAF1FF", fontSize: 11, fontWeight: "900" },
  heroEyebrow: { color: "rgba(234,241,255,0.76)", fontSize: 11, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase" },
  heroTitle: { color: "#EAF1FF", fontSize: 26, fontWeight: "900", marginTop: 6 },
  heroSubtitle: { color: "rgba(234,241,255,0.78)", fontSize: 14, lineHeight: 20, marginTop: 8 },
  heroStatsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  heroStatCard: { flex: 1, minHeight: 74, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", padding: 12, justifyContent: "center" },
  heroStatLabel: { color: "rgba(234,241,255,0.72)", fontSize: 11, fontWeight: "800" },
  heroStatValue: { color: "#EAF1FF", fontSize: 16, fontWeight: "900", marginTop: 6 },
  qrGrid: { flexDirection: "row", gap: 12, marginBottom: 16 },
  qrCard: { flex: 1, minHeight: 114, padding: 14, borderWidth: 1 },
  qrIconWrap: { width: 36, height: 36, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  qrTitle: { fontSize: 14, fontWeight: "900" },
  qrSubtitle: { marginTop: 5, fontSize: 12, lineHeight: 17, fontWeight: "600" },
  sectionCard: { padding: 16, borderWidth: 1, marginBottom: 16 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "900" },
  sectionHint: { fontSize: 12, fontWeight: "700", marginTop: 3 },
  searchWrap: { minHeight: 48, borderWidth: 1, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", marginBottom: 12 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, fontWeight: "700" },
  emptyRouteCard: { minHeight: 92, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "center" },
  emptyRouteText: { flex: 1, marginLeft: 12 },
  emptyTitle: { fontSize: 14, fontWeight: "900" },
  emptyText: { marginTop: 4, fontSize: 12, lineHeight: 17, fontWeight: "600" },
  sourceList: { gap: 10 },
  sourceCard: { minHeight: 74, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sourceLeft: { flex: 1, flexDirection: "row", alignItems: "center", paddingRight: 10 },
  sourceIconWrap: { width: 38, height: 38, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.07)", marginRight: 12 },
  sourceTextWrap: { flex: 1 },
  sourceTitle: { fontSize: 14, fontWeight: "900" },
  sourceSubtitle: { fontSize: 12, lineHeight: 17, fontWeight: "600", marginTop: 4 },
  sourceBalance: { fontSize: 13, fontWeight: "900" },
  fieldLabel: { fontSize: 13, fontWeight: "900", marginBottom: 8, marginTop: 10 },
  inputBox: { minHeight: 50, borderWidth: 1, paddingHorizontal: 12, justifyContent: "center" },
  amountInput: { fontSize: 22, fontWeight: "900", paddingVertical: 0 },
  input: { fontSize: 14, fontWeight: "700", paddingVertical: 0 },
  previewRow: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  previewLabel: { fontSize: 12, fontWeight: "800", flex: 1 },
  previewValue: { fontSize: 13, fontWeight: "900", flex: 1, textAlign: "right" },
  divider: { height: StyleSheet.hairlineWidth, opacity: 0.9 },
  routesRow: { flexDirection: "row", gap: 10 },
  routeAction: { flex: 1, minHeight: 84, padding: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  routeActionText: { marginTop: 8, fontSize: 12, fontWeight: "900", textAlign: "center" },
  infoCard: { padding: 16, borderWidth: 1, marginBottom: 16 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 10 },
  infoIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  infoTextWrap: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: "900" },
  infoText: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: "600" },
  bottomActions: { flexDirection: "row", gap: 12, marginBottom: 8 },
  secondaryButton: { flex: 0.85, minHeight: 52, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: "#C9D9FF", fontSize: 14, fontWeight: "900" },
  primaryButton: { flex: 1.4, minHeight: 52, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryButtonText: { color: "#EAF1FF", fontSize: 14, fontWeight: "900" },
});
