import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowDownLeft,
  ArrowLeft,
  AtSign,
  BriefcaseBusiness,
  CircleAlert,
  QrCode,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import WalletScreenShell from "../../src/modules/wallet/components/WalletScreenShell";
import { useI18n } from "../../src/shared/i18n";
import {
  formatPrimaryWalletAmount,
  useWalletFoundation,
} from "../../src/shared/wallet/wallet-foundation";
import {
  buildWalletMoneyMovementGuard,
  walletMoneyMovementGuardParams,
} from "../../src/shared/wallet/wallet-money-movement";
import { walletText } from "../../src/shared/wallet/wallet-i18n";

type SourceType = "personal" | "business" | "merchant";
type QrVariant = "user" | "business" | "merchant";

type SourceOption = {
  id: SourceType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
};

type TextMap = {
  title: string;
  subtitle: string;
  heroTitle: string;
  heroText: string;
  balanceLabel: string;
  collectInto: string;
  collectIntoHint: string;
  personal: string;
  personalText: string;
  business: string;
  businessText: string;
  merchant: string;
  merchantText: string;
  recipientTitle: string;
  recipientHint: string;
  recipientId: string;
  recipientPlaceholder: string;
  recipientHelp: string;
  recipientError: string;
  detailsTitle: string;
  detailsHint: string;
  amount: string;
  reason: string;
  reasonPlaceholder: string;
  reference: string;
  referencePlaceholder: string;
  previewTitle: string;
  previewHint: string;
  from: string;
  destination: string;
  notSelected: string;
  noReason: string;
  noReference: string;
  createQr: string;
  actions: string;
  routes: string;
  securityTitle: string;
  securityHint: string;
  security1Title: string;
  security1Text: string;
  security2Title: string;
  security2Text: string;
  paymentsHub: string;
  continue: string;
  confirmTitle: string;
};

function tr(
  t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string,
  key: string,
  fallback: string,
) {
  return walletText(t, key, fallback);
}

function normalizeHandle(value: string) {
  return value.trim().replace(/\s+/g, "").replace(/^@+/, "").toLowerCase();
}

function isValidInternalHandle(value: string) {
  return /^[a-z0-9](?:[a-z0-9._-]{2,31})$/.test(value);
}

function toQrVariant(source: SourceType): QrVariant {
  if (source === "business") return "business";
  if (source === "merchant") return "merchant";
  return "user";
}

function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionHint}>{hint}</Text>
    </View>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.previewRow}>
      <Text style={styles.previewLabel}>{label}</Text>
      <Text style={styles.previewValue}>{value}</Text>
    </View>
  );
}

function InfoRow({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoBody}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoText}>{text}</Text>
      </View>
    </View>
  );
}

export default function WalletRequestMoneyScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ requestFrom?: string }>();
  const { snapshot } = useWalletFoundation();

  const [selectedSource, setSelectedSource] = useState<SourceType>("personal");
  const [requestFrom, setRequestFrom] = useState(
    typeof params.requestFrom === "string" ? params.requestFrom : "",
  );
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");

  const texts = useMemo<TextMap>(
    () => ({
      title: tr(t, "wallet.requestMoney.title", "Request money"),
      subtitle: tr(t, "wallet.requestMoney.subtitle", "Create verified requests by MySabi ID or QR."),
      heroTitle: tr(t, "wallet.requestMoney.heroTitle", "Internal collection route"),
      heroText: tr(
        t,
        "wallet.requestMoney.heroText",
        "Requests must be confirmed by the payer before any incoming balance is created.",
      ),
      balanceLabel: tr(t, "wallet.requestMoney.balanceLabel", "Request target balance"),
      collectInto: tr(t, "wallet.requestMoney.collectInto", "Collect into"),
      collectIntoHint: tr(t, "wallet.requestMoney.collectIntoHint", "Destination"),
      personal: tr(t, "wallet.requestMoney.personal", "Personal"),
      personalText: tr(t, "wallet.requestMoney.personalText", "Request into personal Sabi Balance."),
      business: tr(t, "wallet.requestMoney.business", "Business"),
      businessText: tr(t, "wallet.requestMoney.businessText", "Prepared business route with KYB/admin control."),
      merchant: tr(t, "wallet.requestMoney.merchant", "Merchant"),
      merchantText: tr(t, "wallet.requestMoney.merchantText", "Prepared merchant collection route."),
      recipientTitle: tr(t, "wallet.requestMoney.recipientTitle", "Request from"),
      recipientHint: tr(t, "wallet.requestMoney.recipientHint", "Verified identity"),
      recipientId: tr(t, "wallet.requestMoney.recipientId", "Recipient MySabi ID"),
      recipientPlaceholder: tr(t, "wallet.requestMoney.recipientPlaceholder", "username or business ID"),
      recipientHelp: tr(t, "wallet.requestMoney.recipientHelp", "Use verified user, business or merchant identity."),
      recipientError: tr(t, "wallet.requestMoney.recipientError", "Enter a valid MySabi ID."),
      detailsTitle: tr(t, "wallet.requestMoney.detailsTitle", "Request details"),
      detailsHint: tr(t, "wallet.requestMoney.detailsHint", "Amount and note"),
      amount: tr(t, "wallet.requestMoney.amount", "Amount"),
      reason: tr(t, "wallet.requestMoney.reason", "Reason"),
      reasonPlaceholder: tr(t, "wallet.requestMoney.reasonPlaceholder", "What is this request for?"),
      reference: tr(t, "wallet.requestMoney.reference", "Reference"),
      referencePlaceholder: tr(t, "wallet.requestMoney.referencePlaceholder", "Optional reference"),
      previewTitle: tr(t, "wallet.requestMoney.previewTitle", "Request preview"),
      previewHint: tr(t, "wallet.requestMoney.previewHint", "Summary"),
      from: tr(t, "wallet.requestMoney.from", "From"),
      destination: tr(t, "wallet.requestMoney.destination", "Destination"),
      notSelected: tr(t, "wallet.requestMoney.notSelected", "Not selected"),
      noReason: tr(t, "wallet.requestMoney.noReason", "No reason added"),
      noReference: tr(t, "wallet.requestMoney.noReference", "No reference"),
      createQr: tr(t, "wallet.requestMoney.createQr", "Create QR"),
      actions: tr(t, "wallet.requestMoney.actions", "Actions"),
      routes: tr(t, "wallet.requestMoney.routes", "Helpful routes"),
      securityTitle: tr(t, "wallet.requestMoney.securityTitle", "Security note"),
      securityHint: tr(t, "wallet.requestMoney.securityHint", "Important"),
      security1Title: tr(t, "wallet.requestMoney.security1Title", "Verify recipient identity"),
      security1Text: tr(
        t,
        "wallet.requestMoney.security1Text",
        "Money requests should target the correct unified user ID, business route or merchant account.",
      ),
      security2Title: tr(t, "wallet.requestMoney.security2Title", "No automatic income"),
      security2Text: tr(
        t,
        "wallet.requestMoney.security2Text",
        "A request is not income until payer confirmation, provider route and wallet checks are completed.",
      ),
      paymentsHub: tr(t, "wallet.requestMoney.paymentsHub", "Payments Hub"),
      continue: tr(t, "wallet.requestMoney.continue", "Continue request"),
      confirmTitle: tr(t, "wallet.requestMoney.confirmTitle", "Confirm request"),
    }),
    [t],
  );

  const sources = useMemo<SourceOption[]>(
    () => [
      {
        id: "personal",
        title: texts.personal,
        subtitle: texts.personalText,
        icon: <UserRound size={18} color="#FFFFFF" />,
      },
      {
        id: "business",
        title: texts.business,
        subtitle: texts.businessText,
        icon: <BriefcaseBusiness size={18} color="#FFFFFF" />,
      },
      {
        id: "merchant",
        title: texts.merchant,
        subtitle: texts.merchantText,
        icon: <Store size={18} color="#FFFFFF" />,
      },
    ],
    [texts.business, texts.businessText, texts.merchant, texts.merchantText, texts.personal, texts.personalText],
  );

  const selectedSourceConfig = sources.find((item) => item.id === selectedSource) ?? sources[0];
  const normalizedHandle = normalizeHandle(requestFrom);
  const handleValid = isValidInternalHandle(normalizedHandle);
  const parsedAmount = Number(amount.replace(/,/g, ".") || 0);
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const movementGuard = buildWalletMoneyMovementGuard({
    snapshot,
    flow: selectedSource === "business" ? "business-request-money" : selectedSource === "merchant" ? "merchant-request-money" : "request-money",
    amount: parsedAmount,
    currencyCode: snapshot.primaryCurrencyCode,
    payload: { selectedSource, requestFrom: normalizedHandle },
  });
  const canContinue = handleValid && movementGuard.canPrepare;
  const headerTop = Math.max(insets.top, 10);
  const formattedAmount = amountValid
    ? formatPrimaryWalletAmount(parsedAmount, snapshot.primaryCurrencyCode)
    : formatPrimaryWalletAmount(0, snapshot.primaryCurrencyCode);
  const mainBalance = formatPrimaryWalletAmount(snapshot.mainBalanceUsd, snapshot.primaryCurrencyCode);

  const handleContinue = () => {
    if (!canContinue) return;

    router.push({
      pathname: "/wallet/confirm",
      params: {
        flow: "request-money",
        title: texts.confirmTitle,
        recipientName: `@${normalizedHandle}`,
        amount: parsedAmount.toFixed(2),
        currency: snapshot.primaryCurrencyCode,
        source: selectedSource,
        note: reason.trim(),
        reference: reference.trim(),
        next: "/wallet/pin-confirm",
        success: "/wallet/success",
        returnTo: "/wallet/request-money",
        ...walletMoneyMovementGuardParams(movementGuard),
      },
    });
  };

  const handleCreateQr = () => {
    if (!amountValid) return;

    router.push({
      pathname: "/wallet/qr-create" as never,
      params: {
        variant: toQrVariant(selectedSource),
        amount: parsedAmount.toFixed(2),
        currency: snapshot.primaryCurrencyCode,
        label: normalizedHandle ? `@${normalizedHandle}` : selectedSourceConfig.title,
        reference: reference.trim() || `request-${selectedSource}`,
      },
    });
  };

  return (
    <WalletScreenShell>
      <View style={[styles.fixedHeader, { paddingTop: headerTop }]}> 
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{texts.title}</Text>
          <Text style={styles.headerSubtitle}>{texts.subtitle}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroGlowA} />
          <View style={styles.heroGlowB} />
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <ArrowDownLeft size={22} color="#EAF1FF" />
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{snapshot.primaryCurrencyCode}</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{texts.heroTitle}</Text>
          <Text style={styles.heroSubtitle}>{texts.heroText}</Text>
          <Text style={styles.balanceLabel}>{texts.balanceLabel}</Text>
          <Text style={styles.balanceValue}>{mainBalance}</Text>
        </View>

        <View style={styles.card}>
          <SectionHeader title={texts.collectInto} hint={texts.collectIntoHint} />
          <View style={styles.sourceList}>
            {sources.map((source) => {
              const active = source.id === selectedSource;
              return (
                <Pressable
                  key={source.id}
                  onPress={() => setSelectedSource(source.id)}
                  style={[styles.sourceCard, active && styles.sourceCardActive]}
                >
                  <View style={styles.sourceIconWrap}>{source.icon}</View>
                  <View style={styles.sourceBody}>
                    <Text style={styles.sourceTitle}>{source.title}</Text>
                    <Text style={styles.sourceText}>{source.subtitle}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader title={texts.recipientTitle} hint={texts.recipientHint} />
          <Text style={styles.fieldLabel}>{texts.recipientId}</Text>
          <View style={[styles.inputRow, requestFrom.length > 0 && !handleValid && styles.inputError]}>
            <AtSign size={18} color="rgba(234,241,255,0.70)" />
            <TextInput
              value={requestFrom}
              onChangeText={setRequestFrom}
              placeholder={texts.recipientPlaceholder}
              placeholderTextColor="rgba(234,241,255,0.52)"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>
          <Text style={[styles.helperText, requestFrom.length > 0 && !handleValid && styles.helperError]}>
            {requestFrom.length > 0 && !handleValid ? texts.recipientError : texts.recipientHelp}
          </Text>
        </View>

        <View style={styles.card}>
          <SectionHeader title={texts.detailsTitle} hint={texts.detailsHint} />
          <Text style={styles.fieldLabel}>{texts.amount}</Text>
          <View style={styles.inputBox}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="rgba(234,241,255,0.52)"
              style={styles.amountInput}
            />
          </View>

          <Text style={styles.fieldLabel}>{texts.reason}</Text>
          <View style={styles.textAreaBox}>
            <TextInput
              value={reason}
              onChangeText={setReason}
              multiline
              textAlignVertical="top"
              placeholder={texts.reasonPlaceholder}
              placeholderTextColor="rgba(234,241,255,0.52)"
              style={styles.textArea}
            />
          </View>

          <Text style={styles.fieldLabel}>{texts.reference}</Text>
          <View style={styles.inputBox}>
            <TextInput
              value={reference}
              onChangeText={setReference}
              placeholder={texts.referencePlaceholder}
              placeholderTextColor="rgba(234,241,255,0.52)"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader title={texts.previewTitle} hint={texts.previewHint} />
          <PreviewRow label={texts.from} value={normalizedHandle ? `@${normalizedHandle}` : texts.notSelected} />
          <View style={styles.divider} />
          <PreviewRow label={texts.destination} value={selectedSourceConfig.title} />
          <View style={styles.divider} />
          <PreviewRow label={texts.amount} value={formattedAmount} />
          <View style={styles.divider} />
          <PreviewRow label={texts.reason} value={reason.trim() || texts.noReason} />
          <View style={styles.divider} />
          <PreviewRow label={texts.reference} value={reference.trim() || texts.noReference} />
        </View>

        <View style={styles.card}>
          <SectionHeader title={texts.routes} hint={texts.actions} />
          <View style={styles.routesRow}>
            <Pressable
              onPress={handleCreateQr}
              disabled={!amountValid}
              style={[styles.routeButton, !amountValid && styles.disabled]}
            >
              <QrCode size={18} color="#FFFFFF" />
              <Text style={styles.routeText}>{texts.createQr}</Text>
            </Pressable>
            <Pressable onPress={() => router.replace("/wallet/payments" as never)} style={styles.routeButton}>
              <ShieldCheck size={18} color="#FFFFFF" />
              <Text style={styles.routeText}>{texts.paymentsHub}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader title={texts.securityTitle} hint={texts.securityHint} />
          <InfoRow
            icon={<ShieldCheck size={18} color="#EAF1FF" />}
            title={texts.security1Title}
            text={texts.security1Text}
          />
          <View style={styles.divider} />
          <InfoRow
            icon={<CircleAlert size={18} color="#EAF1FF" />}
            title={texts.security2Title}
            text={texts.security2Text}
          />
        </View>

        <View style={styles.bottomActions}>
          <Pressable onPress={() => router.replace("/wallet/payments" as never)} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>{texts.paymentsHub}</Text>
          </Pressable>
          <Pressable
            onPress={handleContinue}
            disabled={!canContinue}
            style={[styles.primaryButton, !canContinue && styles.disabled]}
          >
            <Text style={styles.primaryButtonText}>{texts.continue}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </WalletScreenShell>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 30,
    minHeight: 86,
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#060F19",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,32,58,0.94)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  headerTextWrap: { flex: 1 },
  headerTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  headerSubtitle: {
    color: "rgba(234,241,255,0.70)",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 3,
  },
  content: { paddingHorizontal: 20, paddingTop: 116, paddingBottom: 40 },
  heroCard: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    overflow: "hidden",
    backgroundColor: "#101C31",
  },
  heroGlowA: {
    position: "absolute",
    top: -40,
    left: -40,
    width: 180,
    height: 150,
    borderRadius: 60,
    backgroundColor: "rgba(47,107,255,0.20)",
  },
  heroGlowB: {
    position: "absolute",
    right: -50,
    bottom: -60,
    width: 220,
    height: 160,
    borderRadius: 70,
    backgroundColor: "rgba(124,68,242,0.16)",
  },
  heroTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 2 },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBadge: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  heroBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  heroTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "900", lineHeight: 30, marginTop: 18, zIndex: 2 },
  heroSubtitle: { color: "rgba(234,241,255,0.78)", fontSize: 13, fontWeight: "700", lineHeight: 19, marginTop: 8, zIndex: 2 },
  balanceLabel: { color: "rgba(234,241,255,0.65)", fontSize: 11, fontWeight: "900", marginTop: 16, textTransform: "uppercase", letterSpacing: 0.5, zIndex: 2 },
  balanceValue: { color: "#FFFFFF", fontSize: 28, fontWeight: "900", marginTop: 6, zIndex: 2 },
  card: {
    backgroundColor: "#101C31",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
  },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 },
  sectionTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  sectionHint: { color: "rgba(234,241,255,0.58)", fontSize: 12, fontWeight: "800" },
  sourceList: { gap: 10 },
  sourceCard: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sourceCardActive: { borderColor: "#4F88FF", backgroundColor: "rgba(47,107,255,0.18)" },
  sourceIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  sourceBody: { flex: 1 },
  sourceTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", marginBottom: 4 },
  sourceText: { color: "rgba(234,241,255,0.68)", fontSize: 12, fontWeight: "700", lineHeight: 17 },
  fieldLabel: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginBottom: 8, marginTop: 8 },
  inputRow: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputError: { borderColor: "#FF8B8B" },
  inputBox: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  input: { flex: 1, color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  amountInput: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  helperText: { color: "rgba(234,241,255,0.60)", fontSize: 12, fontWeight: "700", lineHeight: 18, marginTop: 8 },
  helperError: { color: "#FF8B8B" },
  textAreaBox: {
    minHeight: 92,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: { flex: 1, color: "#FFFFFF", fontSize: 14, fontWeight: "700", minHeight: 68 },
  previewRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, alignItems: "center" },
  previewLabel: { color: "rgba(234,241,255,0.58)", fontSize: 12, fontWeight: "800" },
  previewValue: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", flex: 1, textAlign: "right" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginVertical: 12 },
  routesRow: { flexDirection: "row", gap: 10 },
  routeButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: 8,
  },
  routeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900", textAlign: "center" },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  infoIcon: { width: 24, alignItems: "center", paddingTop: 2 },
  infoBody: { flex: 1 },
  infoTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", marginBottom: 4 },
  infoText: { color: "rgba(234,241,255,0.70)", fontSize: 13, fontWeight: "700", lineHeight: 18 },
  bottomActions: { flexDirection: "row", gap: 10, marginBottom: 6 },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(95,142,255,0.24)",
    backgroundColor: "#0E1D33",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  primaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#4F88FF",
    backgroundColor: "#2F6BFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  secondaryButtonText: { color: "#EAF1FF", fontSize: 13, fontWeight: "900", textAlign: "center" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", textAlign: "center" },
  disabled: { opacity: 0.48 },
});
