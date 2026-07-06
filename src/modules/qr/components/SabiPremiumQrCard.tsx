import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import Svg, { Defs, Image as SvgImage, LinearGradient as SvgLinearGradient, Rect, Stop, Text as SvgText } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useQrMobileTranslations } from "../../../shared/i18n/qr-mobile-hooks";
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
  onShareQrImage?: (base64Png: string) => Promise<void> | void;
  refreshDisabled?: boolean;
};

type SvgExporterRef = {
  toDataURL?: (callback: (base64Png: string) => void) => void;
};

function shortId(value?: string | null): string {
  if (!value) return "";
  const clean = String(value).trim();
  if (clean.length <= 18) return clean;
  return `${clean.slice(0, 8)}…${clean.slice(-6)}`;
}

function resolveOwnerName(token: SabiQrTokenRecord | null, fallback: string): string {
  const identity = token?.verifiedIdentity;
  return identity?.displayName
    || [identity?.firstName, identity?.lastName].filter(Boolean).join(" ").trim()
    || identity?.username
    || identity?.sabiDisplayId
    || shortId(identity?.userId)
    || fallback;
}

function resolveOwnerSecondary(token: SabiQrTokenRecord | null): string {
  const identity = token?.verifiedIdentity;
  if (identity?.username) return `@${String(identity.username).replace(/^@+/, "")}`;
  if (identity?.sabiDisplayId) return `Sabi ID • ${identity.sabiDisplayId}`;
  if (identity?.userId) return `ID • ${shortId(identity.userId)}`;
  if (token?.actorUserId) return `ID • ${shortId(token.actorUserId)}`;
  return "";
}

function safeSvgText(value: string, maxLength: number): string {
  const clean = String(value || "").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, Math.max(0, maxLength - 1))}…`;
}

export default function SabiPremiumQrCard({
  definition,
  token,
  loading,
  error,
  emptyTitleKey,
  emptyTextKey,
  onRefresh,
  onShare,
  onShareQrImage,
  refreshDisabled,
}: SabiPremiumQrCardProps) {
  const { tq, functionTitle, valueLabel, errorLabel } = useQrMobileTranslations();
  const theme = getSabiQrVisualTheme(definition);
  const value = token?.qrValue ?? "";
  const canRenderQr = Boolean(value && !loading && !error);
  const qrRef = useRef<SvgExporterRef | null>(null);
  const exportCardRef = useRef<SvgExporterRef | null>(null);
  const [exportQrBase64, setExportQrBase64] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);

  const qrTitle = functionTitle(definition.code);
  const qrSurface = valueLabel(definition.surface);
  const ownerName = useMemo(() => resolveOwnerName(token, qrTitle), [qrTitle, token]);
  const ownerSecondary = useMemo(() => resolveOwnerSecondary(token), [token]);
  const amountLine = useMemo(() => (token?.amount ? `${token.amount} ${token.currency ?? ""}`.trim() : ""), [token?.amount, token?.currency]);
  const primarySummary = amountLine || ownerName;
  const secondarySummary = amountLine ? ownerName : ownerSecondary || qrSurface;
  const exportSectionLabel = amountLine ? qrTitle : qrSurface;
  const exportDetailLine = amountLine ? ownerSecondary || qrSurface : secondarySummary;
  const expiresTemplate = tq("qr.mobile.common.expires", { value: "" });
  const expiresLabel = expiresTemplate.replace(":", "").trim();
  const expiresLine = token?.expiresAt ? tq("qr.mobile.common.expires", { value: new Date(token.expiresAt).toLocaleString() }) : "";
  const expiresValue = expiresLine.replace(expiresTemplate.trim(), "").trim() || expiresLine;

  useEffect(() => {
    if (!exportQrBase64 || !onShareQrImage) return;

    let completed = false;

    const finishShare = (base64Png: string) => {
      if (completed) return;
      completed = true;
      setExportQrBase64(null);
      void Promise.resolve(onShareQrImage(base64Png)).finally(() => {
        setShareBusy(false);
      });
    };

    const exportTimer = setTimeout(() => {
      try {
        const exportCard = exportCardRef.current;
        if (!exportCard?.toDataURL) {
          finishShare(exportQrBase64);
          return;
        }

        exportCard.toDataURL((premiumCardBase64) => {
          finishShare(premiumCardBase64 || exportQrBase64);
        });
      } catch {
        finishShare(exportQrBase64);
      }
    }, 160);

    const fallbackTimer = setTimeout(() => {
      finishShare(exportQrBase64);
    }, 1600);

    return () => {
      completed = true;
      clearTimeout(exportTimer);
      clearTimeout(fallbackTimer);
      setShareBusy(false);
    };
  }, [exportQrBase64, onShareQrImage]);

  const handleShareQr = useCallback(() => {
    if (!canRenderQr || shareBusy) return;

    const qrSvg = qrRef.current;
    if (onShareQrImage && qrSvg?.toDataURL) {
      setShareBusy(true);
      try {
        qrSvg.toDataURL((base64Png) => {
          setExportQrBase64(base64Png);
        });
      } catch {
        setShareBusy(false);
      }
      return;
    }

    try {
      setShareBusy(true);
      onShare?.();
    } finally {
      setShareBusy(false);
    }
  }, [canRenderQr, onShare, onShareQrImage, shareBusy]);

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.accentSoft }]}> 
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: theme.accentSoft, borderColor: theme.accent }]}> 
          <Ionicons name="qr-code" size={22} color={theme.accent} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.eyebrow}>{qrSurface}</Text>
          <Text style={styles.title}>{qrTitle}</Text>
        </View>
      </View>

      <View style={[styles.qrFrame, { borderColor: theme.accent }]}> 
        <View style={styles.qrShell}>
          <View style={styles.qrQuietZone}>
            {canRenderQr ? (
              <View style={styles.qrBox}>
                <QRCode
                  value={value}
                  size={228}
                  color="#07111E"
                  backgroundColor="#FFFFFF"
                  quietZone={12}
                  getRef={(component) => {
                    qrRef.current = component as SvgExporterRef | null;
                  }}
                />
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
      </View>

      {canRenderQr ? (
        <View style={[styles.summaryStrip, { borderColor: theme.accentSoft }]}> 
          <Text numberOfLines={1} style={styles.summaryPrimary}>{primarySummary}</Text>
          <Text numberOfLines={1} style={styles.summarySecondary}>{secondarySummary}</Text>
        </View>
      ) : null}

      {token?.verifiedIdentity ? (
        <View style={styles.ownerBox}>
          <Text style={styles.ownerLabel}>{tq("qr.mobile.identity.autoTitle")}</Text>
          <Text numberOfLines={1} style={styles.ownerName}>{ownerName}</Text>
          {ownerSecondary ? <Text numberOfLines={1} style={styles.ownerId}>{ownerSecondary}</Text> : null}
        </View>
      ) : null}

      <View style={styles.metaGrid}>
        <Meta label={tq("qr.mobile.common.type")} value={qrTitle} />
        <Meta label={tq("qr.mobile.common.surface")} value={qrSurface} />
        {amountLine ? (
          <Meta label={tq("qr.mobile.common.amount")} value={amountLine} />
        ) : (
          <Meta label={tq("qr.mobile.identity.autoTitle")} value={ownerName} />
        )}
        {expiresLine ? <Meta label={expiresLabel} value={expiresValue} /> : null}
      </View>

      <View style={styles.actionRow}>
        <Pressable
          onPress={onRefresh}
          disabled={refreshDisabled}
          style={[styles.primaryButton, { backgroundColor: theme.accent }, refreshDisabled && styles.disabledButton]}
        > 
          <Ionicons name="refresh" size={16} color="#07111E" />
          <Text style={styles.primaryButtonText}>{token ? tq("qr.mobile.common.refresh") : tq("qr.mobile.common.generate")}</Text>
        </Pressable>
        <Pressable
          disabled={!token || !canRenderQr || shareBusy}
          onPress={handleShareQr}
          style={[styles.secondaryButton, (!token || !canRenderQr || shareBusy) && styles.disabledButton]}
        >
          <Ionicons name={shareBusy ? "sync" : "share-social"} size={16} color="#FFFFFF" />
          <Text style={styles.secondaryButtonText}>{shareBusy ? tq("qr.mobile.common.processing") : tq("qr.mobile.common.share")}</Text>
        </Pressable>
      </View>

      {exportQrBase64 ? (
        <View pointerEvents="none" style={styles.exportLayer}>
          <Svg
            width={1080}
            height={1600}
            viewBox="0 0 1080 1600"
            ref={(component: unknown) => {
              exportCardRef.current = component as SvgExporterRef | null;
            }}
          >
            <Defs>
              <SvgLinearGradient id="sabiQrExportBg" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={theme.top} />
                <Stop offset="55%" stopColor={theme.mid} />
                <Stop offset="100%" stopColor={theme.bottom} />
              </SvgLinearGradient>
            </Defs>
            <Rect width="1080" height="1600" fill="url(#sabiQrExportBg)" />
            <Rect x="48" y="48" width="984" height="1504" rx="64" fill="rgba(255,255,255,0.03)" stroke={theme.accentSoft} strokeWidth="2" />
            <Rect x="92" y="96" width="220" height="58" rx="29" fill={theme.accentSoft} stroke={theme.accent} strokeWidth="2" />
            <SvgText x="202" y="133" fill={theme.accent} fontSize="24" fontWeight="800" textAnchor="middle">SABI QR</SvgText>
            <SvgText x="540" y="218" fill="#FFFFFF" fontSize="58" fontWeight="800" textAnchor="middle">{safeSvgText(qrTitle, 25)}</SvgText>
            <SvgText x="540" y="270" fill="rgba(255,255,255,0.72)" fontSize="26" fontWeight="700" textAnchor="middle">{safeSvgText(qrSurface, 34)}</SvgText>
            <Rect x="146" y="320" width="788" height="788" rx="64" fill={theme.accentSoft} stroke={theme.accent} strokeWidth="6" />
            <Rect x="178" y="352" width="724" height="724" rx="54" fill="#FFFFFF" />
            <SvgImage x="214" y="388" width="652" height="652" preserveAspectRatio="xMidYMid meet" href={{ uri: `data:image/png;base64,${exportQrBase64}` }} />
            <Rect x="449" y="640" width="182" height="182" rx="52" fill="#07111E" stroke={theme.accent} strokeWidth="6" />
            <SvgText x="540" y="748" fill={theme.accent} fontSize="44" fontWeight="800" textAnchor="middle">SABI</SvgText>
            <Rect x="166" y="1146" width="748" height="94" rx="32" fill="rgba(255,255,255,0.09)" stroke={theme.accentSoft} strokeWidth="2" />
            <SvgText x="540" y="1206" fill="#FFFFFF" fontSize="42" fontWeight="800" textAnchor="middle">{safeSvgText(primarySummary, 28)}</SvgText>
            <Rect x="166" y="1268" width="748" height="164" rx="36" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.11)" strokeWidth="2" />
            <SvgText x="208" y="1334" fill="rgba(255,255,255,0.64)" fontSize="24" fontWeight="700">{safeSvgText(exportSectionLabel, 30)}</SvgText>
            <SvgText x="208" y="1388" fill="#FFFFFF" fontSize="42" fontWeight="800">{safeSvgText(ownerName, 26)}</SvgText>
            <SvgText x="208" y="1428" fill="rgba(255,255,255,0.72)" fontSize="28" fontWeight="700">{safeSvgText(exportDetailLine, 38)}</SvgText>
            <SvgText x="540" y="1492" fill="rgba(255,255,255,0.56)" fontSize="22" fontWeight="700" textAnchor="middle">{safeSvgText(expiresLine, 55)}</SvgText>
          </Svg>
        </View>
      ) : null}
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
  qrFrame: { marginTop: 20, borderRadius: 38, borderWidth: 2, padding: 10, backgroundColor: "rgba(255,255,255,0.04)" },
  qrShell: { alignItems: "center" },
  qrQuietZone: { width: 284, minHeight: 284, borderRadius: 34, padding: 18, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.28, shadowRadius: 28, shadowOffset: { width: 0, height: 18 }, elevation: 8 },
  qrBox: { width: 228, height: 228, alignItems: "center", justifyContent: "center" },
  centerBadge: { position: "absolute", width: 54, height: 54, borderRadius: 18, backgroundColor: "#07111E", alignItems: "center", justifyContent: "center", borderWidth: 2 },
  centerBadgeText: { fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  placeholderBox: { alignItems: "center", justifyContent: "center", paddingHorizontal: 18, gap: 8 },
  placeholderTitle: { color: "#07111E", fontSize: 16, fontWeight: "900", textAlign: "center" },
  placeholderText: { color: "#4A5568", fontSize: 12, lineHeight: 17, fontWeight: "600", textAlign: "center" },
  summaryStrip: { borderRadius: 22, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, marginTop: 14 },
  summaryPrimary: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", textAlign: "center" },
  summarySecondary: { color: "rgba(255,255,255,0.72)", fontSize: 12, fontWeight: "800", textAlign: "center", marginTop: 5 },
  ownerBox: { borderRadius: 18, padding: 13, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", marginTop: 14 },
  ownerLabel: { color: "rgba(255,255,255,0.58)", fontSize: 10, fontWeight: "900" },
  ownerName: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", marginTop: 5 },
  ownerId: { color: "rgba(255,255,255,0.74)", fontSize: 11, fontWeight: "900", marginTop: 4 },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 18 },
  metaItem: { width: "47.8%", borderRadius: 18, padding: 12, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  metaLabel: { color: "rgba(255,255,255,0.54)", fontSize: 10, fontWeight: "900", letterSpacing: 0.9 },
  metaValue: { color: "#FFFFFF", fontSize: 12, lineHeight: 16, fontWeight: "800", marginTop: 4 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  primaryButton: { flex: 1, minHeight: 52, borderRadius: 18, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primaryButtonText: { color: "#07111E", fontSize: 14, fontWeight: "900" },
  secondaryButton: { minHeight: 52, paddingHorizontal: 17, borderRadius: 18, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7, backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  secondaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  disabledButton: { opacity: 0.45 },
  exportLayer: { position: "absolute", left: -1200, top: -1700, width: 1080, height: 1600, opacity: 1 },
});
