import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SabiQrConfirmCard from "../../src/modules/qr/components/SabiQrConfirmCard";
import { executeSabiQr, resolveSabiQr, validateSabiQr } from "../../src/modules/qr/api/qrApiClient";
import {
  assertSabiQrRawValue,
  assertSabiQrStrictPayload,
  buildSabiQrStrictExecuteParams,
} from "../../src/modules/qr/runtime/qrScanPipeline";
import { recordSabiQrModuleStatusFromResult } from "../../src/modules/qr/runtime/qrModuleIntegration";
import { useQrMobileTranslations } from "../../src/shared/i18n/qr-mobile-hooks";
import { buildWalletQrExecuteMetadata, buildWalletQrResultParams } from "../../src/shared/wallet/wallet-qr-integration";
import { tryOpenResolvedSabiQrAction } from "../../src/modules/qr/runtime/qrActionRouter";
import {
  cleanSabiQrReceiptValue,
  cleanSabiQrUserDisplayValue,
} from "../../src/modules/qr/runtime/qrDisplaySanitizer";
import type { SabiQrExecuteResponse, SabiQrFunctionDefinition, SabiQrTokenRecord } from "../../src/modules/qr/contracts/universalQr.contracts";

function firstString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function replaceQr(href: { pathname: string; params?: Record<string, string> }) {
  (router.replace as unknown as (nextHref: typeof href) => void)(href);
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : String(value ?? "").trim();
}

function metadataString(token: SabiQrTokenRecord, keys: string[]): string {
  const metadata = token.metadata;
  if (!metadata || typeof metadata !== "object") return "";
  const record = metadata as Record<string, unknown>;
  for (const key of keys) {
    const value = cleanString(record[key]);
    if (value) return value;
  }
  return "";
}

function resultTitleKey(token: SabiQrTokenRecord): string {
  switch (token.functionCode) {
    case "wallet_receive":
    case "wallet_user_payment":
    case "messenger_payment":
    case "merchant_static_entry":
    case "merchant_dynamic_order":
    case "business_invoice":
    case "marketplace_order":
    case "stream_donation":
    case "taxi_trip_payment":
    case "delivery_order":
    case "virtual_card_payment":
      return "qr.mobile.result.action.paymentSuccess.title";
    case "coin_wallet_receive":
    case "coin_wallet_transfer":
      return "qr.mobile.result.action.coinSuccess.title";
    case "school_check_in":
    case "school_check_out":
    case "work_check_in":
    case "work_check_out":
      return "qr.mobile.result.action.attendanceSuccess.title";
    case "crypto_wallet_receive":
      return "qr.mobile.result.action.cryptoOpened.title";
    case "virtual_card_issuance":
      return "qr.mobile.result.action.cardSuccess.title";
    default:
      return "qr.mobile.result.success.title";
  }
}

function resultDescriptionKey(token: SabiQrTokenRecord): string {
  switch (token.functionCode) {
    case "wallet_receive":
    case "wallet_user_payment":
    case "messenger_payment":
    case "merchant_static_entry":
    case "merchant_dynamic_order":
    case "business_invoice":
    case "marketplace_order":
    case "stream_donation":
    case "taxi_trip_payment":
    case "delivery_order":
    case "virtual_card_payment":
      return "qr.mobile.result.action.paymentSuccess.description";
    case "coin_wallet_receive":
    case "coin_wallet_transfer":
      return "qr.mobile.result.action.coinSuccess.description";
    case "school_check_in":
    case "school_check_out":
    case "work_check_in":
    case "work_check_out":
      return "qr.mobile.result.action.attendanceSuccess.description";
    case "crypto_wallet_receive":
      return "qr.mobile.result.action.cryptoOpened.description";
    case "virtual_card_issuance":
      return "qr.mobile.result.action.cardSuccess.description";
    default:
      return "qr.mobile.result.success.description";
  }
}

function cleanResultParams(token: SabiQrTokenRecord, result: SabiQrExecuteResponse): Record<string, string> {
  const params: Record<string, string> = {
    functionCode: token.functionCode,
    status: result.status,
    ok: result.ok ? "1" : "0",
    surface: token.surface,
    rail: token.rail,
    actionTitleKey: result.ok ? resultTitleKey(token) : "",
    actionDescriptionKey: result.ok ? resultDescriptionKey(token) : "",
  };

  const targetName =
    cleanString(token.verifiedIdentity?.displayName) ||
    [token.verifiedIdentity?.firstName, token.verifiedIdentity?.lastName].map(cleanString).filter(Boolean).join(" ") ||
    metadataString(token, ["displayName", "name", "merchantName", "businessName", "title"]);
  const username = cleanString(token.verifiedIdentity?.username) || metadataString(token, ["username", "handle", "publicUsername"]);

  const safeReference = cleanSabiQrUserDisplayValue(token.reference, {
    kind: "reference",
    maxLength: 56,
  });
  const safeCounterparty = cleanSabiQrUserDisplayValue(token.counterpartyId, {
    kind: "human",
    maxLength: 56,
  });
  const safeOrganization = cleanSabiQrUserDisplayValue(token.organizationId, {
    kind: "human",
    maxLength: 56,
  });
  const safeTargetName = cleanSabiQrUserDisplayValue(targetName, {
    kind: "human",
    maxLength: 56,
  });
  const safeUsername = cleanSabiQrUserDisplayValue(username.replace(/^@+/, ""), {
    kind: "human",
    maxLength: 32,
  });
  const safeTransactionReference = cleanSabiQrReceiptValue(result.transactionId);
  const safeAttendanceReference = cleanSabiQrReceiptValue(result.attendanceRecordId);
  const safeReviewReference = cleanSabiQrReceiptValue(result.reviewId);

  if (token.amount) params.amount = token.amount;
  if (token.currency) params.currency = token.currency;
  if (safeReference) params.reference = safeReference;
  if (safeCounterparty) params.counterpartyId = safeCounterparty;
  if (safeOrganization) params.organizationId = safeOrganization;
  if (safeTargetName) params.targetName = safeTargetName;
  if (safeUsername) params.username = safeUsername;
  if (safeTransactionReference) params.transactionId = safeTransactionReference;
  if (safeAttendanceReference) params.attendanceRecordId = safeAttendanceReference;
  if (safeReviewReference) params.reviewId = safeReviewReference;
  if (result.reason) params.reason = result.reason;

  return {
    ...buildWalletQrResultParams(token, result),
    ...params,
  };
}

export default function SabiQrConfirmScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ rawValue?: string }>();
  const { tq, errorLabel } = useQrMobileTranslations();
  const rawValue = useMemo(() => firstString(params.rawValue), [params.rawValue]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<SabiQrTokenRecord | null>(null);
  const [definition, setDefinition] = useState<SabiQrFunctionDefinition | null>(null);
  const [executing, setExecuting] = useState(false);
  const [executeResult, setExecuteResult] = useState<SabiQrExecuteResponse | null>(null);
  const [executeError, setExecuteError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      setExecuteResult(null);
      setExecuteError(null);

      try {
        const strictRawValue = assertSabiQrRawValue(rawValue);
        const resolved = await resolveSabiQr(strictRawValue);
        if (!resolved.ok || !resolved.token || !resolved.function) {
          throw new Error(resolved.reason?.startsWith("qr.mobile.") ? resolved.reason : "qr.mobile.confirm.resolveFailed");
        }

        const validated = await validateSabiQr(strictRawValue);
        if (!validated.valid) {
          throw new Error(validated.reason?.startsWith("qr.mobile.") ? validated.reason : "qr.mobile.confirm.validateFailed");
        }

        const strictPayload = assertSabiQrStrictPayload({
          rawValue: strictRawValue,
          token: validated.token ?? resolved.token,
          definition: validated.function ?? resolved.function,
        });

        const actionOpened = await tryOpenResolvedSabiQrAction(strictPayload);
        if (actionOpened) return;

        if (!mounted) return;
        setToken(strictPayload.token);
        setDefinition(strictPayload.definition);
      } catch (err) {
        if (mounted) setError(errorLabel(err instanceof Error ? err.message : "qr.mobile.confirm.validateFailed"));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [errorLabel, rawValue]);

  const onExecute = useCallback(async () => {
    if (!token || !definition) return;

    setExecuting(true);
    setExecuteError(null);
    setExecuteResult(null);

    try {
      const strictPayload = assertSabiQrStrictPayload({ rawValue, token, definition });
      const strictExecuteParams = buildSabiQrStrictExecuteParams(strictPayload);
      const walletQrMetadata = await buildWalletQrExecuteMetadata({ definition, token });
      const result = await executeSabiQr({
        ...strictExecuteParams,
        metadata: {
          ...strictExecuteParams.metadata,
          ...walletQrMetadata,
        },
      });
      recordSabiQrModuleStatusFromResult({
        functionCode: token.functionCode,
        result,
        tokenId: token.tokenId,
      });
      setExecuteResult(result);
      replaceQr({ pathname: "/qr/result", params: cleanResultParams(token, result) });
    } catch (err) {
      setExecuteError(err instanceof Error && err.message.startsWith("qr.mobile.") ? err.message : "qr.mobile.confirm.executeFailed");
    } finally {
      setExecuting(false);
    }
  }, [rawValue, token, definition]);

  return (
    <LinearGradient colors={["#06122B", "#101A35", "#040914"]} style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingTop: Math.max(insets.top + 10, 20), paddingBottom: Math.max(insets.bottom + 120, 140), paddingHorizontal: 18 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.roundButton} accessibilityLabel={tq("qr.mobile.common.back")}>
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>{tq("qr.mobile.confirm.eyebrow")}</Text>
            <Text style={styles.title}>{tq("qr.mobile.confirm.title")}</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.loadingText}>{tq("qr.mobile.confirm.loading")}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={34} color="#FF8C8C" />
            <Text style={styles.errorTitle}>{tq("qr.mobile.confirm.blockedTitle")}</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => replaceQr({ pathname: "/qr/scanner" })} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>{tq("qr.mobile.common.scanAgain")}</Text>
            </Pressable>
          </View>
        ) : token && definition ? (
          <SabiQrConfirmCard
            definition={definition}
            token={token}
            executing={executing}
            executeResult={executeResult}
            executeError={executeError}
            onExecute={onExecute}
            onCancel={() => router.back()}
          />
        ) : (
          <View style={styles.errorCard}>
            <Ionicons name="lock-closed" size={34} color="#FF8C8C" />
            <Text style={styles.errorTitle}>{tq("qr.mobile.confirm.unavailableTitle")}</Text>
            <Text style={styles.errorText}>{tq("qr.mobile.confirm.unavailableText")}</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 18 },
  roundButton: { width: 40, height: 40, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  headerText: { flex: 1 },
  eyebrow: { color: "#77A7FF", fontSize: 11, fontWeight: "900", letterSpacing: 1.6 },
  title: { color: "#FFFFFF", fontSize: 30, lineHeight: 35, fontWeight: "900", marginTop: 3 },
  loadingCard: { minHeight: 260, borderRadius: 30, alignItems: "center", justifyContent: "center", gap: 13, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  loadingText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  errorCard: { borderRadius: 30, padding: 20, alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  errorTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", marginTop: 12 },
  errorText: { color: "rgba(255,255,255,0.68)", fontSize: 13, lineHeight: 19, fontWeight: "600", textAlign: "center", marginTop: 8 },
  secondaryButton: { minHeight: 46, paddingHorizontal: 18, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", marginTop: 16 },
  secondaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
});
