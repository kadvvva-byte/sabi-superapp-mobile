import React, { useMemo } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { describeSabiQrExecuteResult, type SabiQrConfirmSeverity } from "../../src/modules/qr/runtime/qrExecutionGuards";
import { buildSabiQrResultIntegrationSummary } from "../../src/modules/qr/runtime/qrModuleIntegration";
import { hasWalletQrResultParams } from "../../src/shared/wallet/wallet-qr-integration";
import { useQrMobileTranslations } from "../../src/shared/i18n/qr-mobile-translations";
import type { SabiQrExecuteResponse } from "../../src/modules/qr/contracts/universalQr.contracts";

function firstString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeStatus(value: string | undefined): SabiQrExecuteResponse["status"] {
  if (value === "success") return "success";
  if (value === "pending_review") return "pending_review";
  if (value === "provider_not_configured") return "provider_not_configured";
  if (value === "executor_not_configured") return "executor_not_configured";
  if (value === "restricted") return "restricted";
  return "failed";
}

function severityStyle(severity: SabiQrConfirmSeverity) {
  switch (severity) {
    case "safe":
      return { color: "#7AF0A0", icon: "shield-checkmark" as const };
    case "notice":
      return { color: "#77A7FF", icon: "information-circle" as const };
    case "warning":
      return { color: "#FFD166", icon: "warning" as const };
    case "critical":
    default:
      return { color: "#FF8C8C", icon: "lock-closed" as const };
  }
}

export default function SabiQrResultScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    status?: string;
    ok?: string;
    functionCode?: string;
    transactionId?: string;
    attendanceRecordId?: string;
    reviewId?: string;
    reason?: string;
    tokenId?: string;
    surface?: string;
    rail?: string;
    walletQrIntegrationVersion?: string;
    walletRoute?: string;
    walletRail?: string;
    walletSurface?: string;
    providerFamily?: string;
    providerRequired?: string;
    providerStatus?: string;
    ledgerProviderStatus?: string;
    riskStatus?: string;
    ledgerRiskStatus?: string;
    guardReason?: string;
    ledgerReference?: string;
    providerReference?: string;
    tokenOnlyStorage?: string;
    providerTokenStorageOnly?: string;
    panStorageAllowed?: string;
    cvvStorageAllowed?: string;
  }>();
  const { tq, language, functionTitle, errorLabel, valueLabel } = useQrMobileTranslations();

  const result = useMemo<SabiQrExecuteResponse>(() => {
    const status = normalizeStatus(firstString(params.status));
    return {
      ok: firstString(params.ok) === "1" && status === "success",
      status,
      transactionId: firstString(params.transactionId),
      attendanceRecordId: firstString(params.attendanceRecordId),
      reviewId: firstString(params.reviewId),
      reason: firstString(params.reason),
    };
  }, [params.attendanceRecordId, params.ok, params.reason, params.reviewId, params.status, params.transactionId]);

  const info = describeSabiQrExecuteResult(result, language);
  const tone = severityStyle(info.severity);
  const functionCode = firstString(params.functionCode);
  const tokenId = firstString(params.tokenId);
  const integration = useMemo(() => buildSabiQrResultIntegrationSummary({
    functionCode,
    result,
    tokenId,
  }), [functionCode, result, tokenId]);
  const translatedReason = result.reason ? errorLabel(result.reason) : "";
  const walletQr = useMemo(() => ({
    walletQrIntegrationVersion: firstString(params.walletQrIntegrationVersion),
    walletRoute: firstString(params.walletRoute),
    walletRail: firstString(params.walletRail) || firstString(params.rail),
    walletSurface: firstString(params.walletSurface) || firstString(params.surface),
    providerFamily: firstString(params.providerFamily),
    providerRequired: firstString(params.providerRequired),
    providerStatus: firstString(params.providerStatus),
    ledgerProviderStatus: firstString(params.ledgerProviderStatus),
    riskStatus: firstString(params.riskStatus),
    ledgerRiskStatus: firstString(params.ledgerRiskStatus),
    guardReason: firstString(params.guardReason),
    ledgerReference: firstString(params.ledgerReference),
    providerReference: firstString(params.providerReference),
    tokenOnlyStorage: firstString(params.tokenOnlyStorage),
    providerTokenStorageOnly: firstString(params.providerTokenStorageOnly),
    panStorageAllowed: firstString(params.panStorageAllowed),
    cvvStorageAllowed: firstString(params.cvvStorageAllowed),
  }), [
    params.cvvStorageAllowed,
    params.guardReason,
    params.ledgerProviderStatus,
    params.ledgerReference,
    params.ledgerRiskStatus,
    params.panStorageAllowed,
    params.providerFamily,
    params.providerReference,
    params.providerRequired,
    params.providerStatus,
    params.providerTokenStorageOnly,
    params.rail,
    params.riskStatus,
    params.surface,
    params.tokenOnlyStorage,
    params.walletQrIntegrationVersion,
    params.walletRail,
    params.walletRoute,
    params.walletSurface,
  ]);
  const hasWalletQrIntegration = hasWalletQrResultParams(walletQr);

  return (
    <LinearGradient colors={["#06122B", "#101A35", "#040914"]} style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingTop: Math.max(insets.top + 10, 20), paddingBottom: Math.max(insets.bottom + 120, 140), paddingHorizontal: 18 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.roundButton} accessibilityLabel={tq("qr.mobile.common.back")}>
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>{tq("qr.mobile.result.eyebrow")}</Text>
            <Text style={styles.title}>{tq("qr.mobile.result.title")}</Text>
          </View>
        </View>

        <View style={[styles.resultCard, { borderColor: tone.color }]}>
          <View style={[styles.resultIcon, { backgroundColor: `${tone.color}22`, borderColor: tone.color }]}>
            <Ionicons name={tone.icon} size={34} color={tone.color} />
          </View>
          <Text style={[styles.resultTitle, { color: tone.color }]}>{info.title}</Text>
          <Text style={styles.resultText}>{info.description}</Text>
          {translatedReason ? <Text style={styles.reasonText}>{translatedReason}</Text> : null}
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>{tq("qr.mobile.result.detailsTitle")}</Text>
          <ResultRow label={tq("qr.mobile.result.status")} value={valueLabel(result.status)} />
          {functionCode ? <ResultRow label={tq("qr.mobile.common.function")} value={functionTitle(functionCode)} /> : null}
          {tokenId ? <ResultRow label={tq("qr.mobile.result.tokenId")} value={tokenId} /> : null}
          {result.transactionId ? <ResultRow label={tq("qr.mobile.result.transactionId")} value={result.transactionId} /> : null}
          {result.attendanceRecordId ? <ResultRow label={tq("qr.mobile.result.attendanceRecordId")} value={result.attendanceRecordId} /> : null}
          {result.reviewId ? <ResultRow label={tq("qr.mobile.result.reviewId")} value={result.reviewId} /> : null}
          {!result.transactionId && !result.attendanceRecordId && !result.reviewId ? (
            <Text style={styles.emptyDetails}>{tq("qr.mobile.result.noReference")}</Text>
          ) : null}
        </View>

        {integration ? (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>{tq("qr.mobile.result.integrationTitle")}</Text>
            <ResultRow label={tq("qr.mobile.result.integrationModule")} value={tq(integration.record.moduleTitleKey)} />
            <ResultRow label={tq("qr.mobile.result.integrationStatusTarget")} value={tq(integration.statusLabelKey)} />
            <ResultRow label={tq("qr.mobile.result.integrationHistory")} value={tq(integration.historyLabelKey)} />
            <ResultRow
              label={tq("qr.mobile.result.integrationAdmin")}
              value={tq(integration.adminLabelKey)}
            />
          </View>
        ) : null}


        {hasWalletQrIntegration ? (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>{tq("qr.mobile.result.walletIntegrationTitle")}</Text>
            {walletQr.walletRoute ? <ResultRow label={tq("qr.mobile.result.walletRoute")} value={walletQr.walletRoute} /> : null}
            {walletQr.providerFamily ? <ResultRow label={tq("qr.mobile.result.providerFamily")} value={walletQr.providerFamily} /> : null}
            {walletQr.providerStatus ? <ResultRow label={tq("qr.mobile.result.providerStatus")} value={walletQr.providerStatus} /> : null}
            {walletQr.ledgerProviderStatus ? <ResultRow label={tq("qr.mobile.result.ledgerProviderStatus")} value={walletQr.ledgerProviderStatus} /> : null}
            {walletQr.ledgerRiskStatus ? <ResultRow label={tq("qr.mobile.result.ledgerRiskStatus")} value={walletQr.ledgerRiskStatus} /> : null}
            {walletQr.guardReason ? <ResultRow label={tq("qr.mobile.result.guardReason")} value={walletQr.guardReason} /> : null}
            {walletQr.ledgerReference ? <ResultRow label={tq("qr.mobile.result.ledgerReference")} value={walletQr.ledgerReference} /> : null}
            {walletQr.providerReference ? <ResultRow label={tq("qr.mobile.result.providerReference")} value={walletQr.providerReference} /> : null}
            <ResultRow label={tq("qr.mobile.result.cardDataPolicy")} value={tq("qr.mobile.result.cardDataPolicyValue")} />
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <Pressable onPress={() => (router.replace as unknown as (href: string) => void)("/qr/scanner")} style={styles.secondaryButton}>
            <Ionicons name="scan" size={17} color="#FFFFFF" />
            <Text style={styles.secondaryButtonText}>{tq("qr.mobile.common.scanAgain")}</Text>
          </Pressable>
          <Pressable onPress={() => (router.replace as unknown as (href: string) => void)("/qr")} style={styles.primaryButton}>
            <Ionicons name="qr-code" size={17} color="#07111E" />
            <Text style={styles.primaryButtonText}>{tq("qr.mobile.result.openCenter")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text selectable numberOfLines={2} style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 18 },
  roundButton: { width: 40, height: 40, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  headerText: { flex: 1 },
  eyebrow: { color: "#77A7FF", fontSize: 11, fontWeight: "900", letterSpacing: 1.6 },
  title: { color: "#FFFFFF", fontSize: 30, lineHeight: 35, fontWeight: "900", marginTop: 3 },
  resultCard: { borderRadius: 34, padding: 20, alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1 },
  resultIcon: { width: 82, height: 82, borderRadius: 30, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  resultTitle: { fontSize: 24, fontWeight: "900", marginTop: 16, textAlign: "center" },
  resultText: { color: "rgba(255,255,255,0.70)", fontSize: 14, lineHeight: 20, fontWeight: "700", textAlign: "center", marginTop: 8 },
  reasonText: { color: "rgba(255,255,255,0.58)", fontSize: 12, lineHeight: 18, fontWeight: "700", textAlign: "center", marginTop: 12 },
  detailsCard: { marginTop: 16, borderRadius: 28, padding: 16, backgroundColor: "rgba(255,255,255,0.075)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  detailsTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", marginBottom: 10 },
  row: { borderRadius: 18, padding: 12, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginTop: 10 },
  rowLabel: { color: "rgba(255,255,255,0.54)", fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  rowValue: { color: "#FFFFFF", fontSize: 13, lineHeight: 18, fontWeight: "800", marginTop: 5 },
  emptyDetails: { color: "rgba(255,255,255,0.62)", fontSize: 13, lineHeight: 19, fontWeight: "700", marginTop: 6 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  secondaryButton: { flex: 1, minHeight: 52, borderRadius: 18, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  secondaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  primaryButton: { flex: 1, minHeight: 52, borderRadius: 18, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, backgroundColor: "#77A7FF" },
  primaryButtonText: { color: "#07111E", fontSize: 13, fontWeight: "900" },
});
