import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { getStreamMobileUiProductionHardeningSnapshot197S } from "./streamMobileUiProductionHardening197S";

type IconName = keyof typeof Ionicons.glyphMap;

type StreamMobileUiProductionHardeningPanel197SProps = {
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const laneIconMap: Record<string, IconName> = {
  entry_navigation: "compass-outline",
  prelive_launch_path: "videocam-outline",
  ordinary_live_room: "radio-outline",
  business_live_room: "briefcase-outline",
  shorts_surface: "play-circle-outline",
  gift_catalog_ceremony: "gift-outline",
  gift_monetization_ux: "diamond-outline",
  stream_games_demo: "game-controller-outline",
  safety_moderation: "shield-checkmark-outline",
  accessibility_performance: "phone-portrait-outline",
  provider_backend_handoff: "server-outline",
  wallet_payment_boundary: "wallet-outline",
};

export function StreamMobileUiProductionHardeningPanel197S({ compact = false, style }: StreamMobileUiProductionHardeningPanel197SProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const snapshot = useMemo(() => getStreamMobileUiProductionHardeningSnapshot197S(), []);
  const firstLanes = compact ? snapshot.lanes.slice(0, 4) : snapshot.lanes.slice(0, 6);

  return (
    <View style={[styles.card, compact && styles.cardCompact, style]}>
      <LinearGradient colors={["rgba(17, 24, 39, 0.96)", "rgba(3, 7, 18, 0.98)"]} style={styles.gradient}>
        <View style={styles.headerRow}>
          <View style={styles.iconShell}>
            <Ionicons name="rocket-outline" size={20} color="#FDE68A" />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>197S · Production mobile UI</Text>
            <Text style={styles.title} numberOfLines={2}>{snapshot.readinessTitleRu}</Text>
            <Text style={styles.subtitle} numberOfLines={compact ? 2 : 3}>{snapshot.readinessSummaryRu}</Text>
          </View>
          <View style={styles.percentPill}>
            <Text style={styles.percentText}>{snapshot.mobileUiReadinessPercent}%</Text>
            <Text style={styles.percentCaption}>UI</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricPill}>
            <Text style={styles.metricValue}>{snapshot.userFacingBlockerCount}</Text>
            <Text style={styles.metricLabel}>user blockers</Text>
          </View>
          <View style={styles.metricPill}>
            <Text style={styles.metricValue}>{snapshot.fakeSuccessCount}</Text>
            <Text style={styles.metricLabel}>fake success</Text>
          </View>
          <View style={styles.metricPill}>
            <Text style={styles.metricValue}>{snapshot.backendHandoffLaneCount}</Text>
            <Text style={styles.metricLabel}>handoff lanes</Text>
          </View>
        </View>

        <View style={styles.laneGrid}>
          {firstLanes.map((lane) => (
            <View key={lane.key} style={styles.laneCard}>
              <View style={styles.laneIconRow}>
                <Ionicons name={laneIconMap[lane.key] ?? "checkmark-circle-outline"} size={16} color={lane.status === "ready" ? "#86EFAC" : "#93C5FD"} />
                <Text style={styles.laneStatus}>{lane.status === "ready" ? "ready" : "handoff"}</Text>
              </View>
              <Text style={styles.laneTitle} numberOfLines={2}>{lane.titleRu}</Text>
              <Text style={styles.laneText} numberOfLines={2}>{lane.acceptanceRu}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.detailsButton} onPress={() => setDetailsOpen(true)} accessibilityRole="button">
          <Ionicons name="list-outline" size={17} color="#FDE68A" />
          <Text style={styles.detailsButtonText}>Открыть полный production QA статус</Text>
        </Pressable>
      </LinearGradient>

      <Modal visible={detailsOpen} transparent animationType="fade" onRequestClose={() => setDetailsOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>197S · Stream Mobile UI</Text>
                <Text style={styles.modalTitle}>Production readiness без фейка</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setDetailsOpen(false)} accessibilityRole="button">
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalSummary}>{snapshot.scopeRu}</Text>

              {snapshot.lanes.map((lane) => (
                <View key={lane.key} style={styles.modalLaneCard}>
                  <View style={styles.modalLaneHeader}>
                    <Ionicons name={laneIconMap[lane.key] ?? "checkmark-circle-outline"} size={18} color={lane.status === "ready" ? "#86EFAC" : "#93C5FD"} />
                    <Text style={styles.modalLaneTitle}>{lane.titleRu}</Text>
                    <Text style={styles.modalLaneStatus}>{lane.status === "ready" ? "READY" : "HANDOFF"}</Text>
                  </View>
                  <Text style={styles.modalLaneText}>{lane.productionRuleRu}</Text>
                  <Text style={styles.modalLaneAcceptance}>{lane.acceptanceRu}</Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>Guardrails</Text>
              {snapshot.guardrails.map((guardrail) => (
                <View key={guardrail.key} style={styles.guardrailRow}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#86EFAC" />
                  <View style={styles.guardrailCopy}>
                    <Text style={styles.guardrailTitle}>{guardrail.titleRu}</Text>
                    <Text style={styles.guardrailText}>{guardrail.detailRu}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(253, 230, 138, 0.28)",
    backgroundColor: "rgba(3, 7, 18, 0.92)",
  },
  cardCompact: {
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 20,
  },
  gradient: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconShell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(253, 230, 138, 0.13)",
    borderWidth: 1,
    borderColor: "rgba(253, 230, 138, 0.3)",
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: "#FDE68A",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 3,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 17,
  },
  percentPill: {
    minWidth: 54,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: "rgba(22, 163, 74, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(134, 239, 172, 0.38)",
  },
  percentText: {
    color: "#BBF7D0",
    fontSize: 17,
    fontWeight: "900",
  },
  percentCaption: {
    color: "rgba(220,252,231,0.72)",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metricsRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 8,
  },
  metricPill: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  metricValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  metricLabel: {
    marginTop: 2,
    color: "rgba(255,255,255,0.62)",
    fontSize: 10,
    fontWeight: "700",
  },
  laneGrid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  laneCard: {
    width: "48%",
    minHeight: 104,
    borderRadius: 16,
    padding: 10,
    backgroundColor: "rgba(15, 23, 42, 0.74)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  laneIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  laneStatus: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  laneTitle: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  laneText: {
    marginTop: 5,
    color: "rgba(255,255,255,0.62)",
    fontSize: 10,
    lineHeight: 14,
  },
  detailsButton: {
    marginTop: 14,
    minHeight: 42,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(253, 230, 138, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(253, 230, 138, 0.3)",
  },
  detailsButtonText: {
    color: "#FDE68A",
    fontSize: 12,
    fontWeight: "900",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 18,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  modalCard: {
    maxHeight: "88%",
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#050509",
    borderWidth: 1,
    borderColor: "rgba(253, 230, 138, 0.25)",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  modalEyebrow: {
    color: "#FDE68A",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  modalTitle: {
    marginTop: 3,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  modalContent: {
    padding: 18,
    paddingBottom: 24,
  },
  modalSummary: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 19,
  },
  modalLaneCard: {
    marginTop: 12,
    borderRadius: 18,
    padding: 13,
    backgroundColor: "rgba(15,23,42,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
  },
  modalLaneHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalLaneTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  modalLaneStatus: {
    color: "#FDE68A",
    fontSize: 10,
    fontWeight: "900",
  },
  modalLaneText: {
    marginTop: 8,
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    lineHeight: 17,
  },
  modalLaneAcceptance: {
    marginTop: 7,
    color: "#BBF7D0",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 4,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  guardrailRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(22, 163, 74, 0.11)",
    borderWidth: 1,
    borderColor: "rgba(134, 239, 172, 0.16)",
  },
  guardrailCopy: {
    flex: 1,
  },
  guardrailTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  guardrailText: {
    marginTop: 4,
    color: "rgba(255,255,255,0.68)",
    fontSize: 11,
    lineHeight: 16,
  },
});
