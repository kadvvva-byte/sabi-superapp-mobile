import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, ShieldCheck, Landmark, FileCheck2 } from "lucide-react-native";

import { useI18n } from "../../src/shared/i18n";
import { formatPrimaryWalletAmount, useWalletFoundation } from "../../src/shared/wallet/wallet-foundation";

function walletText(
  t: (key: string, params?: Record<string, string | number>) => string,
  key: string,
  fallback: string,
) {
  const value = t(key);
  return typeof value === "string" && value.trim() && value !== key ? value : fallback;
}

export default function PaymentExecuteScreen() {
  const params = useLocalSearchParams<{ userId?: string; walletId?: string }>();
  const { t } = useI18n();
  const { snapshot } = useWalletFoundation();

  const texts = useMemo(
    () => ({
      eyebrow: walletText(t, "wallet.paymentExecution.eyebrow", "Payment route"),
      title: walletText(t, "wallet.paymentExecution.title", "Secure payment execution"),
      subtitle: walletText(t, "wallet.paymentExecution.subtitle", "Payment execution must come from provider confirmation, not from manual local form input."),
      statusTitle: walletText(t, "wallet.paymentExecution.statusTitle", "Provider route required"),
      statusText: walletText(t, "wallet.paymentExecution.statusText", "Connect bank/payment provider, idempotency, wallet risk checks and admin audit before enabling execution."),
      mainBalance: walletText(t, "wallet.shared.mainBalance", "Main balance"),
      currentWallet: walletText(t, "wallet.paymentExecution.currentWallet", "Current wallet"),
      currentUser: walletText(t, "wallet.paymentExecution.currentUser", "Current user"),
      notProvided: walletText(t, "wallet.paymentExecution.notProvided", "Not provided"),
      providerTitle: walletText(t, "wallet.paymentExecution.providerTitle", "Bank/provider confirmation"),
      providerText: walletText(t, "wallet.paymentExecution.providerText", "Capture, refund and settlement must use provider transaction IDs returned by backend."),
      tokenTitle: walletText(t, "wallet.paymentExecution.tokenTitle", "Token-only wallet"),
      tokenText: walletText(t, "wallet.paymentExecution.tokenText", "No PAN, CVV or card secrets can be entered or stored inside this screen."),
      auditTitle: walletText(t, "wallet.paymentExecution.auditTitle", "Admin audit"),
      auditText: walletText(t, "wallet.paymentExecution.auditText", "Every payment execution must create secure ledger and audit records."),
      goToSend: walletText(t, "wallet.paymentExecution.goToSend", "Open Send Money"),
      goToQr: walletText(t, "wallet.paymentExecution.goToQr", "Open QR Pay"),
      back: walletText(t, "wallet.shared.back", "Back"),
    }),
    [t],
  );

  const userId = typeof params.userId === "string" && params.userId.trim() ? params.userId.trim() : texts.notProvided;
  const walletId = typeof params.walletId === "string" && params.walletId.trim() ? params.walletId.trim() : texts.notProvided;
  const mainBalance = formatPrimaryWalletAmount(snapshot.mainBalanceUsd, snapshot.primaryCurrencyCode);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.fixedHeader}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel={texts.back}>
          <ArrowLeft size={19} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.eyebrow}>{texts.eyebrow}</Text>
          <Text style={styles.title}>{texts.title}</Text>
          <Text style={styles.subtitle}>{texts.subtitle}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <ShieldCheck size={28} color="#BFD5FF" />
          </View>
          <Text style={styles.statusTitle}>{texts.statusTitle}</Text>
          <Text style={styles.statusText}>{texts.statusText}</Text>
        </View>

        <View style={styles.infoCard}>
          <Row label={texts.mainBalance} value={mainBalance} />
          <Row label={texts.currentWallet} value={walletId} />
          <Row label={texts.currentUser} value={userId} />
        </View>

        <View style={styles.policyCard}>
          <PolicyRow icon={<Landmark size={19} color="#BFD5FF" />} title={texts.providerTitle} text={texts.providerText} />
          <View style={styles.divider} />
          <PolicyRow icon={<ShieldCheck size={19} color="#BFD5FF" />} title={texts.tokenTitle} text={texts.tokenText} />
          <View style={styles.divider} />
          <PolicyRow icon={<FileCheck2 size={19} color="#BFD5FF" />} title={texts.auditTitle} text={texts.auditText} />
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={styles.actionButton} onPress={() => router.push("/wallet/send" as never)}>
            <Text style={styles.actionText}>{texts.goToSend}</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => router.push("/wallet/qr-scan" as never)}>
            <Text style={styles.actionText}>{texts.goToQr}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function PolicyRow({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <View style={styles.policyRow}>
      <View style={styles.policyIcon}>{icon}</View>
      <View style={styles.policyTextWrap}>
        <Text style={styles.policyTitle}>{title}</Text>
        <Text style={styles.policyText}>{text}</Text>
      </View>
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
  title: { color: "#ffffff", fontSize: 25, fontWeight: "900" },
  subtitle: { color: "#9fb0d1", fontSize: 13, lineHeight: 19, marginTop: 4 },
  statusCard: { backgroundColor: "#16244a", borderRadius: 28, padding: 22, alignItems: "center", gap: 10 },
  statusIcon: { width: 62, height: 62, borderRadius: 24, backgroundColor: "rgba(142,163,255,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(142,163,255,0.20)" },
  statusTitle: { color: "#ffffff", fontSize: 20, fontWeight: "900", textAlign: "center" },
  statusText: { color: "#b9c6e4", fontSize: 13, lineHeight: 19, textAlign: "center" },
  infoCard: { backgroundColor: "#111830", borderRadius: 22, padding: 16, gap: 12 },
  row: { gap: 4 },
  rowLabel: { color: "#8fa2cb", fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  rowValue: { color: "#ffffff", fontSize: 15, fontWeight: "800" },
  policyCard: { backgroundColor: "#111830", borderRadius: 22, padding: 16 },
  policyRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  policyIcon: { width: 24, alignItems: "center", paddingTop: 2 },
  policyTextWrap: { flex: 1 },
  policyTitle: { color: "#ffffff", fontSize: 15, fontWeight: "900" },
  policyText: { color: "#9fb0d1", fontSize: 13, lineHeight: 18, marginTop: 4 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginVertical: 12 },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionButton: { flex: 1, minHeight: 54, borderRadius: 18, backgroundColor: "#4f7cff", alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  actionText: { color: "#ffffff", fontWeight: "900", textAlign: "center" },
});
