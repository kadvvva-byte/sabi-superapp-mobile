import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQrMobileTranslations } from "../../../shared/i18n/qr-mobile-translations";
import type {
  SabiQrExecuteResponse,
  SabiQrFunctionDefinition,
  SabiQrTokenRecord,
} from "../contracts/universalQr.contracts";
import {
  describeSabiQrExecuteResult,
  getSabiQrConfirmAction,
  type SabiQrConfirmSeverity,
} from "../runtime/qrExecutionGuards";
import { getSabiQrVisualTheme } from "../runtime/qrVisualTheme";

export type SabiQrConfirmCardProps = {
  definition: SabiQrFunctionDefinition;
  token: SabiQrTokenRecord;
  executing: boolean;
  executeResult: SabiQrExecuteResponse | null;
  executeError: string | null;
  onExecute: () => void;
  onCancel: () => void;
};

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

export default function SabiQrConfirmCard({
  definition,
  token,
  executing,
  executeResult,
  executeError,
  onExecute,
  onCancel,
}: SabiQrConfirmCardProps) {
  const { tq, language, functionTitle, valueLabel, errorLabel } = useQrMobileTranslations();
  const theme = getSabiQrVisualTheme(definition);
  const action = getSabiQrConfirmAction(definition, token, language);
  const actionTone = severityStyle(action.severity);
  const resultInfo = executeResult ? describeSabiQrExecuteResult(executeResult, language) : null;
  const resultTone = resultInfo ? severityStyle(resultInfo.severity) : null;

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.accentSoft }]}> 
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { borderColor: theme.accent, backgroundColor: theme.accentSoft }]}> 
          <Ionicons name="qr-code" size={22} color={theme.accent} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>{valueLabel(definition.surface)}</Text>
          <Text style={styles.title}>{functionTitle(definition.code)}</Text>
        </View>
      </View>

      <View style={[styles.warningBox, { borderColor: actionTone.color }]}> 
        <Ionicons name={actionTone.icon} size={22} color={actionTone.color} />
        <View style={styles.warningTextWrap}>
          <Text style={[styles.warningTitle, { color: actionTone.color }]}>{action.title}</Text>
          <Text style={styles.warningText}>{action.description}</Text>
        </View>
      </View>

      {token.verifiedIdentity ? (
        <View style={styles.ownerBox}>
          <Text style={styles.ownerLabel}>{tq("qr.mobile.identity.autoTitle")}</Text>
          <Text numberOfLines={1} style={styles.ownerName}>
            {token.verifiedIdentity.displayName || [token.verifiedIdentity.firstName, token.verifiedIdentity.lastName].filter(Boolean).join(" ").trim() || token.verifiedIdentity.username || tq("qr.mobile.identity.namePending")}
          </Text>
          <Text numberOfLines={1} style={styles.ownerId}>{tq("qr.mobile.identity.userIdValue", { value: token.verifiedIdentity.userId || token.actorUserId })}</Text>
        </View>
      ) : null}

      <View style={styles.metaGrid}>
        <Meta label={tq("qr.mobile.common.function")} value={functionTitle(definition.code)} />
        <Meta label={tq("qr.mobile.common.surface")} value={valueLabel(definition.surface)} />
        <Meta label={tq("qr.mobile.common.rail")} value={valueLabel(definition.rail === "coin_wallet" ? "coin_wallet_rail" : definition.rail)} />
        <Meta label={tq("qr.mobile.common.trust")} value={valueLabel(token.trustState)} />
        <Meta label={tq("qr.mobile.common.userId")} value={token.actorUserId} />
        <Meta label={tq("qr.mobile.common.risk")} value={valueLabel(definition.riskLevel)} />
      </View>

      <View style={styles.tokenBox}>
        <Text style={styles.tokenLabel}>{tq("qr.mobile.common.shortPayload")}</Text>
        <Text numberOfLines={1} style={styles.tokenValue}>{token.shortValue}</Text>
        <Text style={styles.expiry}>{tq("qr.mobile.common.expires", { value: new Date(token.expiresAt).toLocaleString() })}</Text>
      </View>      {token.amount ? (
        <View style={styles.detailsBox}>
          <Meta label={tq("qr.mobile.common.amount")} value={`${token.amount} ${token.currency ?? ""}`.trim()} />
        </View>
      ) : null}

      {resultInfo ? (
        <View style={[styles.resultBox, { borderColor: resultTone?.color ?? "rgba(255,255,255,0.12)" }]}> 
          <Ionicons name={resultTone?.icon ?? "information-circle"} size={21} color={resultTone?.color ?? "#FFFFFF"} />
          <View style={styles.warningTextWrap}>
            <Text style={[styles.warningTitle, { color: resultTone?.color ?? "#FFFFFF" }]}>{resultInfo.title}</Text>
            <Text style={styles.warningText}>{resultInfo.description}</Text>
          </View>
        </View>
      ) : executeError ? (
        <View style={[styles.resultBox, { borderColor: "#FF8C8C" }]}> 
          <Ionicons name="alert-circle" size={21} color="#FF8C8C" />
          <View style={styles.warningTextWrap}>
            <Text style={[styles.warningTitle, { color: "#FF8C8C" }]}>{tq("qr.mobile.confirmCard.executionUnavailable")}</Text>
            <Text style={styles.warningText}>{errorLabel(executeError)}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.actionRow}>
        <Pressable onPress={onCancel} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{tq("qr.mobile.common.cancel")}</Text>
        </Pressable>
        <Pressable
          onPress={onExecute}
          disabled={!action.canExecute || executing}
          style={[styles.primaryButton, { backgroundColor: action.canExecute ? theme.accent : "rgba(255,255,255,0.14)" }]}
        >
          <Ionicons name={executing ? "sync" : "checkmark-circle"} size={17} color="#07111E" />
          <Text style={styles.primaryButtonText}>{executing ? tq("qr.mobile.common.processing") : action.primaryLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 34, padding: 18, borderWidth: 1 },
  headerRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  iconWrap: { width: 50, height: 50, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  headerText: { flex: 1 },
  eyebrow: { color: "rgba(255,255,255,0.60)", fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  title: { color: "#FFFFFF", fontSize: 25, lineHeight: 30, fontWeight: "900", marginTop: 4 },
  warningBox: { marginTop: 18, borderRadius: 24, padding: 14, flexDirection: "row", gap: 11, backgroundColor: "rgba(0,0,0,0.16)", borderWidth: 1 },
  warningTextWrap: { flex: 1 },
  warningTitle: { fontSize: 15, fontWeight: "900" },
  warningText: { color: "rgba(255,255,255,0.70)", fontSize: 12, lineHeight: 18, fontWeight: "600", marginTop: 4 },
  ownerBox: { borderRadius: 18, padding: 13, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", marginTop: 14 },
  ownerLabel: { color: "rgba(255,255,255,0.58)", fontSize: 10, fontWeight: "900" },
  ownerName: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", marginTop: 5 },
  ownerId: { color: "rgba(255,255,255,0.74)", fontSize: 11, fontWeight: "900", marginTop: 4 },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  metaItem: { width: "47.8%", borderRadius: 18, padding: 11, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  metaLabel: { color: "rgba(255,255,255,0.54)", fontSize: 10, fontWeight: "900", letterSpacing: 0.9 },
  metaValue: { color: "#FFFFFF", fontSize: 12, lineHeight: 16, fontWeight: "800", marginTop: 4 },
  tokenBox: { marginTop: 14, borderRadius: 20, padding: 13, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  tokenLabel: { color: "rgba(255,255,255,0.54)", fontSize: 10, fontWeight: "900", letterSpacing: 0.9 },
  tokenValue: { color: "#FFFFFF", fontSize: 13, fontWeight: "800", marginTop: 4 },
  expiry: { color: "rgba(255,255,255,0.62)", fontSize: 11, fontWeight: "700", marginTop: 6 },
  detailsBox: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  resultBox: { marginTop: 14, borderRadius: 22, padding: 13, flexDirection: "row", gap: 10, backgroundColor: "rgba(0,0,0,0.16)", borderWidth: 1 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  secondaryButton: { minHeight: 52, paddingHorizontal: 18, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  secondaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  primaryButton: { flex: 1, minHeight: 52, borderRadius: 18, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primaryButtonText: { color: "#07111E", fontSize: 14, fontWeight: "900" },
});
