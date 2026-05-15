import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useI18n } from "../../src/shared/i18n";
import { walletText } from "../../src/shared/wallet/wallet-i18n";

type Texts = {
  title: string;
  subtitle: string;
  amount: string;
  transferValue: string;
  ready: string;
  source: string;
  funds: string;
  rail: string;
  details: string;
  tokenizedSource: string;
  destination: string;
  recipient: string;
  routeType: string;
  handle: string;
  note: string;
  reference: string;
  security: string;
  bankGrade: string;
  pinTitle: string;
  pinText: string;
  routeTitle: string;
  routeText: string;
  notificationTitle: string;
  notificationText: string;
  continue: string;
  pinConfirmTitle: string;
  pinConfirmSubtitle: string;
  providerStatus: string;
  riskStatus: string;
  walletRoute: string;
  providerRequired: string;
  blockedReason: string;
};

function tr(
  t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string,
  key: string,
  fallback: string,
) {
  return walletText(t, key, fallback);
}

function buildTexts(t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string): Texts {
  return {
    title: tr(t, "wallet.confirm.title", "Confirm transfer"),
    subtitle: tr(t, "wallet.confirm.subtitle", "Review transfer details before secure confirmation."),
    amount: tr(t, "wallet.confirm.amount", "Amount"),
    transferValue: tr(t, "wallet.confirm.transferValue", "Transfer value"),
    ready: tr(t, "wallet.confirm.ready", "Ready for confirmation"),
    source: tr(t, "wallet.confirm.source", "Source"),
    funds: tr(t, "wallet.confirm.funds", "Funds"),
    rail: tr(t, "wallet.confirm.rail", "Rail"),
    details: tr(t, "wallet.confirm.details", "Details"),
    tokenizedSource: tr(t, "wallet.confirm.tokenizedSource", "Tokenized / internal source"),
    destination: tr(t, "wallet.confirm.destination", "Destination"),
    recipient: tr(t, "wallet.confirm.recipient", "Recipient"),
    routeType: tr(t, "wallet.confirm.routeType", "Route type"),
    handle: tr(t, "wallet.confirm.handle", "Handle"),
    note: tr(t, "wallet.confirm.note", "Note"),
    reference: tr(t, "wallet.confirm.reference", "Reference"),
    security: tr(t, "wallet.confirm.security", "Security"),
    bankGrade: tr(t, "wallet.confirm.bankGrade", "Bank-grade"),
    pinTitle: tr(t, "wallet.confirm.pinTitle", "Secure confirmation"),
    pinText: tr(t, "wallet.confirm.pinText", "The next step requires wallet security provider confirmation."),
    routeTitle: tr(t, "wallet.confirm.routeTitle", "Protected route"),
    routeText: tr(t, "wallet.confirm.routeText", "Money movement is prepared for secure provider-backed execution."),
    notificationTitle: tr(t, "wallet.confirm.notificationTitle", "Final status"),
    notificationText: tr(t, "wallet.confirm.notificationText", "Success, pending or failure must come from wallet backend/provider status."),
    continue: tr(t, "wallet.confirm.continue", "Continue"),
    pinConfirmTitle: tr(t, "wallet.confirm.pinConfirmTitle", "Confirm with Wallet Security"),
    pinConfirmSubtitle: tr(t, "wallet.confirm.pinConfirmSubtitle", "Authorize this operation with secure wallet confirmation."),
    providerStatus: tr(t, "wallet.confirm.providerStatus", "Provider status"),
    riskStatus: tr(t, "wallet.confirm.riskStatus", "Risk status"),
    walletRoute: tr(t, "wallet.confirm.walletRoute", "Wallet route"),
    providerRequired: tr(t, "wallet.confirm.providerRequired", "Provider required"),
    blockedReason: tr(t, "wallet.confirm.blockedReason", "Guard reason"),
  };
}

function cleanValue(value: unknown, fallback: string) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : fallback;
}

function redactSensitiveDetails(value: string, fallback: string) {
  const text = value.trim();
  if (!text) return fallback;
  const digits = text.replace(/\D/g, "");
  if (digits.length >= 12) return fallback;
  if (/cvv|cvc|pan|card number/i.test(text)) return fallback;
  return text;
}

export default function WalletConfirmPage() {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const texts = useMemo(() => buildTexts(t), [t]);

  const params = useLocalSearchParams<{
    flow?: string;
    title?: string;
    amount?: string;
    currency?: string;
    sourceTitle?: string;
    sourceScheme?: string;
    sourcePan?: string;
    sourceDetails?: string;
    destinationTitle?: string;
    destinationType?: string;
    recipientName?: string;
    recipientHandle?: string;
    recipientType?: string;
    note?: string;
    walletRoute?: string;
    providerRequired?: string;
    providerStatus?: string;
    ledgerProviderStatus?: string;
    riskStatus?: string;
    ledgerRiskStatus?: string;
    guardReason?: string;
    providerTokenId?: string;
  }>();

  const title = cleanValue(params.title, texts.title);
  const amount = cleanValue(params.amount, "0");
  const currency = cleanValue(params.currency, "USD");
  const sourceTitle = cleanValue(params.sourceTitle, "Sabi Balance");
  const sourceScheme = cleanValue(params.sourceScheme, "SABI");
  const sourceDetails = redactSensitiveDetails(
    cleanValue(params.sourceDetails || params.sourcePan, ""),
    texts.tokenizedSource,
  );
  const destinationTitle = cleanValue(params.destinationTitle, texts.destination);
  const destinationType = cleanValue(params.destinationType, "Wallet route");
  const recipientName = cleanValue(params.recipientName, destinationTitle);
  const recipientHandle = cleanValue(params.recipientHandle, "");
  const note = cleanValue(params.note, "");
  const walletRoute = cleanValue(params.walletRoute, "wallet");
  const providerRequired = cleanValue(params.providerRequired, "true");
  const providerStatus = cleanValue(params.providerStatus, "provider_not_configured");
  const riskStatus = cleanValue(params.riskStatus, "clear");
  const guardReason = cleanValue(params.guardReason, "ok");

  const canContinue = useMemo(
    () => Number(amount) > 0 && guardReason === "ok" && riskStatus === "clear",
    [amount, guardReason, riskStatus],
  );

  const handleContinue = () => {
    if (!canContinue) return;
    router.push({
      pathname: "/wallet/pin-confirm",
      params: {
        title: texts.pinConfirmTitle,
        subtitle: texts.pinConfirmSubtitle,
        next: "/wallet/home",
        flow: params.flow || "wallet",
        amount,
        currency,
        recipientName,
        source: sourceTitle,
        note,
        reference: recipientHandle,
        walletRoute,
        providerRequired,
        providerStatus,
        ledgerProviderStatus: params.ledgerProviderStatus || "",
        riskStatus,
        ledgerRiskStatus: params.ledgerRiskStatus || "",
        guardReason,
        providerTokenId: params.providerTokenId || "",
      },
    });
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) + 8 }]}> 
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{texts.subtitle}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 96, 120) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{texts.amount}</Text>
          <Text style={styles.sectionHint}>{texts.transferValue}</Text>
        </View>
        <View style={styles.amountCard}>
          <Text style={styles.amountValue}>{amount} {currency}</Text>
          <Text style={styles.amountHint}>{texts.ready}</Text>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{texts.source}</Text>
          <Text style={styles.sectionHint}>{texts.funds}</Text>
        </View>
        <View style={styles.card}>
          <InfoRow label={texts.source} value={sourceTitle} />
          <InfoRow label={texts.rail} value={sourceScheme} />
          <InfoRow label={texts.details} value={sourceDetails} />
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{texts.destination}</Text>
          <Text style={styles.sectionHint}>{texts.recipient}</Text>
        </View>
        <View style={styles.card}>
          <InfoRow label={texts.destination} value={destinationTitle} />
          <InfoRow label={texts.routeType} value={destinationType} />
          <InfoRow label={texts.recipient} value={recipientName} />
          {recipientHandle ? <InfoRow label={texts.handle} value={recipientHandle} /> : null}
        </View>

        {note ? (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>{texts.note}</Text>
              <Text style={styles.sectionHint}>{texts.reference}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.noteText}>{note}</Text>
            </View>
          </>
        ) : null}

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{texts.security}</Text>
          <Text style={styles.sectionHint}>{texts.bankGrade}</Text>
        </View>
        <View style={styles.card}>
          <SecurityRow title={texts.pinTitle} text={texts.pinText} />
          <SecurityRow title={texts.routeTitle} text={texts.routeText} />
          <SecurityRow title={texts.notificationTitle} text={texts.notificationText} />
          <InfoRow label={texts.walletRoute} value={walletRoute} />
          <InfoRow label={texts.providerRequired} value={providerRequired} />
          <InfoRow label={texts.providerStatus} value={providerStatus} />
          <InfoRow label={texts.riskStatus} value={riskStatus} />
          <InfoRow label={texts.blockedReason} value={guardReason} />
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}> 
        <Pressable
          onPress={handleContinue}
          disabled={!canContinue}
          style={[styles.bottomButton, !canContinue && styles.bottomButtonDisabled]}
        >
          <Text style={styles.bottomButtonText}>{texts.continue}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SecurityRow({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.securityRow}>
      <Text style={styles.securityTitle}>{title}</Text>
      <Text style={styles.securityText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#060F19" },
  scroll: { flex: 1, backgroundColor: "#060F19" },
  content: { paddingHorizontal: 20, paddingTop: 12 },
  header: { gap: 14, marginBottom: 10, paddingHorizontal: 20, backgroundColor: "#060F19" },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  headerTextWrap: { gap: 6 },
  headerTitle: { color: "#FFFFFF", fontSize: 24, lineHeight: 30, fontWeight: "800" },
  headerSubtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    maxWidth: "92%",
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  sectionHint: { color: "#A8B8CF", fontSize: 12, fontWeight: "700" },
  amountCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: "rgba(20,32,58,0.94)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 18,
  },
  amountValue: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", marginBottom: 8 },
  amountHint: { color: "rgba(255,255,255,0.66)", fontSize: 13, lineHeight: 18 },
  card: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(20,32,58,0.94)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 18,
  },
  infoRow: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  infoLabel: { color: "#90A4C0", fontSize: 12, marginBottom: 6 },
  infoValue: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  noteText: { color: "#FFFFFF", fontSize: 14, lineHeight: 20 },
  securityRow: { marginBottom: 14 },
  securityTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginBottom: 5 },
  securityText: { color: "rgba(255,255,255,0.66)", fontSize: 13, lineHeight: 18 },
  bottomBar: {
    backgroundColor: "#060F19",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  bottomButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F6BFF",
    borderWidth: 1,
    borderColor: "#4F88FF",
  },
  bottomButtonDisabled: { opacity: 0.55 },
  bottomButtonText: { color: "#EAF1FF", fontSize: 14, fontWeight: "900" },
});
