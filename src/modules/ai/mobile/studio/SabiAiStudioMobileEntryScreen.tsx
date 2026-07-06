import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import {
  getSabiAiStudioMobileSnapshot,
  SABI_AI_STUDIO_MOBILE_RULES,
  type SabiAiStudioMobileSnapshot,
} from "./sabiAiStudioMobileApi";

type LoadState = {
  loading: boolean;
  snapshot: SabiAiStudioMobileSnapshot | null;
  error: string | null;
};

function yesNo(value: boolean | null | undefined): string {
  return value ? "OK" : "LOCKED";
}

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

export default function SabiAiStudioMobileEntryScreen() {
  const [state, setState] = useState<LoadState>({
    loading: true,
    snapshot: null,
    error: null,
  });

  const load = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }));

    try {
      const snapshot = await getSabiAiStudioMobileSnapshot();
      setState({ loading: false, snapshot, error: snapshot.errors[0] ?? null });
    } catch (error) {
      setState({
        loading: false,
        snapshot: null,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const capabilityNames = useMemo(() => {
    const capabilities = state.snapshot?.capabilities?.capabilities;
    if (!capabilities || typeof capabilities !== "object") return [];
    return Object.keys(capabilities);
  }, [state.snapshot]);

  const separation = state.snapshot?.separation;
  const health = state.snapshot?.health;
  const learning = state.snapshot?.learning;
  const locks = separation?.locks ?? health?.locks;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={state.loading} onRefresh={load} />}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>

        <View style={styles.headerTextBlock}>
          <Text style={styles.kicker}>Separate SuperApp program</Text>
          <Text style={styles.title}>Sabi AI Studio</Text>
          <Text style={styles.subtitle}>
            Studio is a separate creative workspace. Sabi AI stays the main foundation, controller and personality of the SuperApp.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Boundary</Text>
        <StatusRow label="Sabi AI main foundation" value="OK" />
        <StatusRow label="Studio separate program" value="OK" />
        <StatusRow
          label="Controller separated"
          value={yesNo(separation?.sabiAiControllerSeparated)}
        />
        <StatusRow
          label="Does not replace Sabi AI"
          value={yesNo(separation?.doesNotTouchSabiAiPersonalityController)}
        />
        <StatusRow
          label="Frontend provider keys"
          value={SABI_AI_STUDIO_MOBILE_RULES.frontendSecretsAllowed ? "BAD" : "FORBIDDEN"}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Backend status</Text>
        {state.loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Reading backend Studio status…</Text>
          </View>
        ) : null}

        <StatusRow label="Snapshot" value={state.snapshot?.ok ? "BACKEND OK" : "FALLBACK"} />
        <StatusRow label="Health" value={health?.ok ? "OK" : "CHECK"} />
        <StatusRow label="Capabilities" value={state.snapshot?.capabilities?.ok ? "OK" : "CHECK"} />
        <StatusRow label="Learning readiness" value={learning?.ok ? "OK" : "CHECK"} />
        <StatusRow
          label="Durable bucket local"
          value={learning?.durableLearningBucketPresent ? "PRESENT" : "NOT LOCAL"}
        />

        {state.error ? <Text style={styles.warningText}>{state.error}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Locks</Text>
        <StatusRow label="Payment" value={locks?.paymentExecution ? "BAD" : "LOCKED"} />
        <StatusRow label="Wallet" value={locks?.walletExecution ? "BAD" : "LOCKED"} />
        <StatusRow label="Payout" value={locks?.payoutExecution ? "BAD" : "LOCKED"} />
        <StatusRow label="SMS" value={locks?.smsExecution ? "BAD" : "LOCKED"} />
        <StatusRow label="Deploy" value={locks?.publishDeploy ? "BAD" : "LOCKED"} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Capabilities from backend</Text>
        {capabilityNames.length ? (
          capabilityNames.map((name) => (
            <View key={name} style={styles.capabilityPill}>
              <Text style={styles.capabilityText}>{name}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.mutedText}>Backend capabilities are not loaded yet.</Text>
        )}
      </View>

      <Pressable onPress={load} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Refresh Studio status</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#06101f",
  },
  content: {
    padding: 20,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingTop: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  backButtonText: {
    color: "#f8fbff",
    fontSize: 24,
    fontWeight: "700",
  },
  headerTextBlock: {
    flex: 1,
  },
  kicker: {
    color: "#8db6ff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 6,
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 8,
    color: "#b7c7dd",
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.075)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 12,
  },
  statusRow: {
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statusLabel: {
    flex: 1,
    color: "#b7c7dd",
    fontSize: 13,
  },
  statusValue: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingBottom: 10,
  },
  loadingText: {
    color: "#b7c7dd",
    fontSize: 13,
  },
  warningText: {
    marginTop: 10,
    color: "#ffd18a",
    fontSize: 12,
    lineHeight: 18,
  },
  mutedText: {
    color: "#91a4bb",
    fontSize: 13,
  },
  capabilityPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(141,182,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(141,182,255,0.25)",
    marginBottom: 8,
  },
  capabilityText: {
    color: "#dce9ff",
    fontSize: 13,
    fontWeight: "800",
  },
  primaryButton: {
    marginTop: 4,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  primaryButtonText: {
    color: "#07101f",
    fontSize: 15,
    fontWeight: "900",
  },
});
