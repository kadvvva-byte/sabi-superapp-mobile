import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import { useQrMobileTranslations } from "../../../shared/i18n/qr-mobile-translations";
import type { SabiQrFunctionDefinition, SabiQrTokenRecord } from "../contracts/universalQr.contracts";
import { getSabiQrVisualTheme } from "../runtime/qrVisualTheme";

export type SabiPremiumQrCardProps = {
  definition: SabiQrFunctionDefinition;
  token: SabiQrTokenRecord | null;
  loading?: boolean;
  error?: string | null;
  emptyTitleKey?: string;
  emptyTextKey?: string;
  onRefresh?: () => void;
  onShare?: () => void;
};

export default function SabiPremiumQrCard({
  definition,
  token,
  loading,
  error,
  emptyTitleKey,
  emptyTextKey,
  onRefresh,
  onShare,
}: SabiPremiumQrCardProps) {
  const { tq, functionTitle, valueLabel, errorLabel } = useQrMobileTranslations();
  const theme = getSabiQrVisualTheme(definition);
  const value = token?.qrValue ?? "";
  const canRenderQr = Boolean(value && !loading && !error);

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.accentSoft }]}> 
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: theme.accentSoft, borderColor: theme.accent }]}> 
          <Ionicons name="qr-code" size={22} color={theme.accent} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.eyebrow}>{valueLabel(definition.surface)}</Text>
          <Text style={styles.title}>{functionTitle(definition.code)}</Text>
        </View>
      </View>

      <View style={styles.qrShell}>
        <View style={styles.qrQuietZone}>
          {canRenderQr ? (
            <View style={styles.qrBox}>
              <QRCode value={value} size={228} color="#07111E" backgroundColor="#FFFFFF" />
              <View style={[styles.centerBadge, { borderColor: theme.accent }]}> 
                <Text style={[styles.centerBadgeText, { color: theme.accent }]}>{tq("qr.mobile.brand.center")}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.placeholderBox}>
              <Ionicons name={loading ? "sync" : "lock-closed"} size={34} color="#7B8797" />
              <Text style={styles.placeholderTitle}>
                {loading ? tq("qr.mobile.card.loadingTitle") : tq(error ? "qr.mobile.common.qrUnavailable" : emptyTitleKey ?? "qr.mobile.common.qrUnavailable")}
              </Text>
              <Text style={styles.placeholderText}>
                {error ? errorLabel(error) : tq(emptyTextKey ?? "qr.mobile.card.unavailableText")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {token?.verifiedIdentity ? (
        <View style={styles.ownerBox}>
          <Text style={styles.ownerLabel}>{tq("qr.mobile.identity.autoTitle")}</Text>
          <Text numberOfLines={1} style={styles.ownerName}>
            {token.verifiedIdentity.displayName || [token.verifiedIdentity.firstName, token.verifiedIdentity.lastName].filter(Boolean).join(" ").trim() || token.verifiedIdentity.username || tq("qr.mobile.identity.namePending")}
          </Text>
          <Text numberOfLines={1} style={styles.ownerId}>{tq("qr.mobile.identity.userIdValue", { value: token.verifiedIdentity.userId || token.actorUserId })}</Text>
        </View>
      ) : token?.actorUserId ? (
        <View style={styles.ownerBox}>
          <Text style={styles.ownerLabel}>{tq("qr.mobile.identity.autoTitle")}</Text>
          <Text numberOfLines={1} style={styles.ownerId}>{tq("qr.mobile.identity.userIdValue", { value: token.actorUserId })}</Text>
        </View>
      ) : null}

      <View style={styles.metaGrid}>
        <Meta label={tq("qr.mobile.common.type")} value={functionTitle(definition.code)} />
        <Meta label={tq("qr.mobile.common.surface")} value={valueLabel(definition.surface)} />
        <Meta label={tq("qr.mobile.common.mode")} value={valueLabel(definition.mode)} />
        <Meta label={tq("qr.mobile.common.trust")} value={token?.trustState ? valueLabel(token.trustState) : tq("qr.mobile.card.notSigned")} />
      </View>

      {token ? (
        <View style={styles.tokenBox}>
          <Text style={styles.tokenLabel}>{tq("qr.mobile.common.shortPayload")}</Text>
          <Text numberOfLines={1} style={styles.tokenValue}>{token.shortValue}</Text>
          <Text style={styles.expiry}>{tq("qr.mobile.common.expires", { value: new Date(token.expiresAt).toLocaleString() })}</Text>
        </View>
      ) : null}

      <View style={styles.actionRow}>
        <Pressable onPress={onRefresh} style={[styles.primaryButton, { backgroundColor: theme.accent }]}> 
          <Ionicons name="refresh" size={16} color="#07111E" />
          <Text style={styles.primaryButtonText}>{token ? tq("qr.mobile.common.refresh") : tq("qr.mobile.common.generate")}</Text>
        </Pressable>
        <Pressable disabled={!token} onPress={onShare} style={[styles.secondaryButton, !token && styles.disabledButton]}>
          <Ionicons name="share-social" size={16} color="#FFFFFF" />
          <Text style={styles.secondaryButtonText}>{tq("qr.mobile.common.share")}</Text>
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
  card: { borderRadius: 34, padding: 18, borderWidth: 1, overflow: "hidden" },
  headerRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  iconWrap: { width: 48, height: 48, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  titleWrap: { flex: 1 },
  eyebrow: { color: "rgba(255,255,255,0.62)", fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  title: { color: "#FFFFFF", fontSize: 24, lineHeight: 29, fontWeight: "900", marginTop: 4 },
  qrShell: { alignItems: "center", marginTop: 20 },
  qrQuietZone: { width: 284, minHeight: 284, borderRadius: 34, padding: 18, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.28, shadowRadius: 28, shadowOffset: { width: 0, height: 18 }, elevation: 8 },
  qrBox: { width: 228, height: 228, alignItems: "center", justifyContent: "center" },
  centerBadge: { position: "absolute", width: 54, height: 54, borderRadius: 18, backgroundColor: "#07111E", alignItems: "center", justifyContent: "center", borderWidth: 2 },
  centerBadgeText: { fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  placeholderBox: { alignItems: "center", justifyContent: "center", paddingHorizontal: 18, gap: 8 },
  placeholderTitle: { color: "#07111E", fontSize: 16, fontWeight: "900", textAlign: "center" },
  placeholderText: { color: "#4A5568", fontSize: 12, lineHeight: 17, fontWeight: "600", textAlign: "center" },
  ownerBox: { borderRadius: 18, padding: 13, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", marginTop: 14 },
  ownerLabel: { color: "rgba(255,255,255,0.58)", fontSize: 10, fontWeight: "900" },
  ownerName: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", marginTop: 5 },
  ownerId: { color: "rgba(255,255,255,0.74)", fontSize: 11, fontWeight: "900", marginTop: 4 },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 18 },
  metaItem: { width: "47.8%", borderRadius: 18, padding: 12, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  metaLabel: { color: "rgba(255,255,255,0.54)", fontSize: 10, fontWeight: "900", letterSpacing: 0.9 },
  metaValue: { color: "#FFFFFF", fontSize: 12, lineHeight: 16, fontWeight: "800", marginTop: 4 },
  tokenBox: { marginTop: 14, borderRadius: 18, padding: 12, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  tokenLabel: { color: "rgba(255,255,255,0.54)", fontSize: 10, fontWeight: "900", letterSpacing: 0.9 },
  tokenValue: { color: "#FFFFFF", fontSize: 13, fontWeight: "800", marginTop: 4 },
  expiry: { color: "rgba(255,255,255,0.62)", fontSize: 11, fontWeight: "700", marginTop: 6 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  primaryButton: { flex: 1, minHeight: 52, borderRadius: 18, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primaryButtonText: { color: "#07111E", fontSize: 14, fontWeight: "900" },
  secondaryButton: { minHeight: 52, paddingHorizontal: 17, borderRadius: 18, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7, backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  secondaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  disabledButton: { opacity: 0.45 },
});
