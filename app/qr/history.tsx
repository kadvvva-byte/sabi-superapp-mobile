import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchSabiQrHistory } from "../../src/modules/qr/api/qrApiClient";
import { getSabiQrRuntimeState, subscribeSabiQrRuntime } from "../../src/modules/qr/runtime/qrRuntimeStore";
import { useQrMobileTranslations } from "../../src/shared/i18n/qr-mobile-translations";
import type { SabiQrTokenRecord } from "../../src/modules/qr/contracts/universalQr.contracts";

function mergeTokens(remote: SabiQrTokenRecord[], local: SabiQrTokenRecord[]): SabiQrTokenRecord[] {
  const byId = new Map<string, SabiQrTokenRecord>();
  [...remote, ...local].forEach((token) => byId.set(token.tokenId, token));
  return Array.from(byId.values())
    .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
    .slice(0, 30);
}

export default function SabiQrHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { tq, functionTitle, valueLabel, errorLabel } = useQrMobileTranslations();
  const [localTokens, setLocalTokens] = useState<SabiQrTokenRecord[]>(getSabiQrRuntimeState().recentTokens);
  const [remoteTokens, setRemoteTokens] = useState<SabiQrTokenRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokens = useMemo(() => mergeTokens(remoteTokens, localTokens), [localTokens, remoteTokens]);

  const loadHistory = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const next = await fetchSabiQrHistory();
      setRemoteTokens(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "qr.mobile.error.generic");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    return subscribeSabiQrRuntime((state) => {
      setLocalTokens(state.recentTokens);
    });
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return (
    <LinearGradient colors={["#06122B", "#101A35", "#040914"]} style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingTop: Math.max(insets.top + 10, 20), paddingBottom: Math.max(insets.bottom + 120, 140), paddingHorizontal: 18 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.roundButton} accessibilityLabel={tq("qr.mobile.common.back")}><Ionicons name="arrow-back" size={18} color="#FFFFFF" /></Pressable>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>{tq("qr.mobile.history.eyebrow")}</Text>
            <Text style={styles.title}>{tq("qr.mobile.history.title")}</Text>
            <Text style={styles.subtitle}>{tq("qr.mobile.history.subtitle")}</Text>
          </View>
          <Pressable onPress={loadHistory} disabled={busy} style={styles.roundButton} accessibilityLabel={tq("qr.mobile.common.refresh")}>
            {busy ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="refresh" size={18} color="#FFFFFF" />}
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{errorLabel(error)}</Text> : null}

        {tokens.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="time" size={34} color="#77A7FF" />
            <Text style={styles.emptyTitle}>{busy ? tq("qr.mobile.history.syncing") : tq("qr.mobile.history.emptyTitle")}</Text>
            <Text style={styles.emptyText}>{busy ? tq("qr.mobile.history.syncingText") : tq("qr.mobile.history.emptyText")}</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {tokens.map((token) => (
              <View key={token.tokenId} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{functionTitle(token.functionCode)}</Text>
                  <Text style={styles.itemBadge}>{valueLabel(token.surface)}</Text>
                </View>
                <Text style={styles.itemMeta}>{valueLabel(token.trustState)} • {tq("qr.mobile.common.expires", { value: new Date(token.expiresAt).toLocaleString() })}</Text>
                <Text numberOfLines={1} style={styles.itemValue}>{token.shortValue}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  roundButton: { width: 40, height: 40, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  headerText: { flex: 1 },
  eyebrow: { color: "#77A7FF", fontSize: 11, fontWeight: "900", letterSpacing: 1.6 },
  title: { color: "#FFFFFF", fontSize: 30, lineHeight: 35, fontWeight: "900", marginTop: 3 },
  subtitle: { color: "rgba(255,255,255,0.68)", fontSize: 13, lineHeight: 19, fontWeight: "600", marginTop: 6 },
  errorText: { color: "#FFB4B4", fontSize: 12, lineHeight: 17, fontWeight: "800", marginTop: 14 },
  emptyCard: { marginTop: 22, minHeight: 240, borderRadius: 30, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  emptyTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "900", marginTop: 12 },
  emptyText: { color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 19, fontWeight: "600", textAlign: "center", marginTop: 7 },
  list: { gap: 12, marginTop: 20 },
  itemCard: { borderRadius: 22, padding: 14, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  itemHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  itemTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "900", flex: 1 },
  itemBadge: { color: "#77A7FF", fontSize: 10, fontWeight: "900", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(119,167,255,0.12)" },
  itemMeta: { color: "rgba(255,255,255,0.62)", fontSize: 11, fontWeight: "700", marginTop: 6 },
  itemValue: { color: "#77A7FF", fontSize: 12, fontWeight: "800", marginTop: 7 },
});
