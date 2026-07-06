import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { getStreamMobileUiFullAcceptanceSweepSnapshot197T } from "./streamMobileUiFullAcceptanceSweep197T";

type IconName = keyof typeof Ionicons.glyphMap;

type StreamMobileUiFullAcceptanceSweepPanel197TProps = {
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const laneIconMap: Record<string, IconName> = {
  entry_and_navigation: "compass-outline",
  compact_phone_layout: "phone-portrait-outline",
  safe_area_and_overlays: "layers-outline",
  live_room_host_viewer: "radio-outline",
  business_live_surface: "briefcase-outline",
  shorts_viewer_editor: "play-circle-outline",
  gift_catalog_fx: "gift-outline",
  gift_earnings_balance: "diamond-outline",
  stream_games_demo: "game-controller-outline",
  safety_privacy_moderation: "shield-checkmark-outline",
  empty_error_degraded_states: "alert-circle-outline",
  backend_provider_handoff: "server-outline",
};

export function StreamMobileUiFullAcceptanceSweepPanel197T({ compact = false, style }: StreamMobileUiFullAcceptanceSweepPanel197TProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const snapshot = useMemo(() => getStreamMobileUiFullAcceptanceSweepSnapshot197T(), []);
  const visibleLanes = compact ? snapshot.lanes.slice(0, 4) : snapshot.lanes.slice(0, 6);

  return (
    <View style={[styles.card, compact && styles.cardCompact, style]}>
      <LinearGradient colors={["rgba(12, 74, 110, 0.95)", "rgba(15, 23, 42, 0.98)"]} style={styles.gradient}>
        <View style={styles.headerRow}>
          <View style={styles.iconShell}>
            <Ionicons name="checkmark-done-circle-outline" size={22} color="#BAE6FD" />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>197T · Full acceptance sweep</Text>
            <Text style={styles.title} numberOfLines={2}>{snapshot.acceptanceTitleRu}</Text>
            <Text style={styles.subtitle} numberOfLines={compact ? 2 : 3}>{snapshot.acceptanceSummaryRu}</Text>
          </View>
          <View style={styles.percentPill}>
            <Text style={styles.percentText}>{snapshot.mobileUiAcceptancePercent}%</Text>
            <Text style={styles.percentCaption}>ACCEPTED</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricPill}>
            <Text style={styles.metricValue}>{snapshot.userDeadEndCount}</Text>
            <Text style={styles.metricLabel}>dead ends</Text>
          </View>
          <View style={styles.metricPill}>
            <Text style={styles.metricValue}>{snapshot.debugCopyCount}</Text>
            <Text style={styles.metricLabel}>debug copy</Text>
          </View>
          <View style={styles.metricPill}>
            <Text style={styles.metricValue}>{snapshot.fakeSuccessCount}</Text>
            <Text style={styles.metricLabel}>fake success</Text>
          </View>
        </View>

        <View style={styles.laneGrid}>
          {visibleLanes.map((lane) => (
            <View key={lane.key} style={styles.laneCard}>
              <View style={styles.laneIconRow}>
                <Ionicons name={laneIconMap[lane.key] ?? "checkmark-circle-outline"} size={16} color={lane.status === "accepted" ? "#BAE6FD" : "#C4B5FD"} />
                <Text style={styles.laneStatus}>{lane.status === "accepted" ? "accepted" : "handoff"}</Text>
              </View>
              <Text style={styles.laneTitle} numberOfLines={2}>{lane.titleRu}</Text>
              <Text style={styles.laneText} numberOfLines={2}>{lane.finalPolishRu}</Text>
            </View>
          ))}
        </View>

        <View style={styles.boundaryBox}>
          <Ionicons name="lock-closed-outline" size={16} color="#BAE6FD" />
          <Text style={styles.boundaryText}>Реальный send, Wallet, provider, payout и available balance остаются backend-ledger only.</Text>
        </View>

        <Pressable style={styles.detailsButton} onPress={() => setDetailsOpen(true)} accessibilityRole="button">
          <Ionicons name="clipboard-outline" size={17} color="#BAE6FD" />
          <Text style={styles.detailsButtonText}>Открыть полный acceptance sweep</Text>
        </Pressable>
      </LinearGradient>

      <Modal visible={detailsOpen} transparent animationType="fade" onRequestClose={() => setDetailsOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderCopy}>
                <Text style={styles.modalEyebrow}>197T · Stream Mobile UI</Text>
                <Text style={styles.modalTitle}>Acceptance sweep без фейка</Text>
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
                    <Ionicons name={laneIconMap[lane.key] ?? "checkmark-circle-outline"} size={18} color={lane.status === "accepted" ? "#BAE6FD" : "#C4B5FD"} />
                    <Text style={styles.modalLaneTitle}>{lane.titleRu}</Text>
                    <Text style={styles.modalLaneStatus}>{lane.status === "accepted" ? "ACCEPTED" : "HANDOFF"}</Text>
                  </View>
                  <Text style={styles.modalLaneText}>{lane.productionAcceptanceRu}</Text>
                  <Text style={styles.modalLaneAcceptance}>{lane.finalPolishRu}</Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>Final checkpoints</Text>
              {snapshot.checkpoints.map((checkpoint) => (
                <View key={checkpoint.key} style={styles.checkpointRow}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#BAE6FD" />
                  <View style={styles.checkpointCopy}>
                    <Text style={styles.checkpointTitle}>{checkpoint.titleRu}</Text>
                    <Text style={styles.checkpointText}>{checkpoint.detailRu}</Text>
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
    borderColor: "rgba(186, 230, 253, 0.28)",
    backgroundColor: "rgba(8, 47, 73, 0.92)",
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(186, 230, 253, 0.13)",
    borderWidth: 1,
    borderColor: "rgba(186, 230, 253, 0.3)",
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: "#BAE6FD",
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
    color: "rgba(255,255,255,0.74)",
    fontSize: 12,
    lineHeight: 17,
  },
  percentPill: {
    minWidth: 70,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: "rgba(14, 165, 233, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(186, 230, 253, 0.38)",
  },
  percentText: {
    color: "#E0F2FE",
    fontSize: 17,
    fontWeight: "900",
  },
  percentCaption: {
    color: "rgba(224,242,254,0.72)",
    fontSize: 9,
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
    fontWeight: "800",
    textTransform: "uppercase",
  },
  laneGrid: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  laneCard: {
    width: "48%",
    minHeight: 104,
    borderRadius: 18,
    padding: 11,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
  },
  laneIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  laneStatus: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  laneTitle: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 16,
  },
  laneText: {
    marginTop: 6,
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    lineHeight: 15,
  },
  boundaryBox: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(14, 165, 233, 0.11)",
    borderWidth: 1,
    borderColor: "rgba(186, 230, 253, 0.2)",
  },
  boundaryText: {
    flex: 1,
    color: "rgba(224,242,254,0.86)",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  detailsButton: {
    marginTop: 12,
    minHeight: 44,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(186, 230, 253, 0.22)",
  },
  detailsButtonText: {
    color: "#E0F2FE",
    fontSize: 12,
    fontWeight: "900",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.68)",
  },
  modalCard: {
    maxHeight: "86%",
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#082F49",
    borderWidth: 1,
    borderColor: "rgba(186, 230, 253, 0.25)",
  },
  modalHeader: {
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(15,23,42,0.88)",
  },
  modalHeaderCopy: {
    flex: 1,
    paddingRight: 12,
  },
  modalEyebrow: {
    color: "#BAE6FD",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  modalTitle: {
    marginTop: 4,
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
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  modalContent: {
    padding: 16,
    paddingBottom: 24,
  },
  modalSummary: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  modalLaneCard: {
    marginBottom: 10,
    borderRadius: 18,
    padding: 13,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
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
    color: "#BAE6FD",
    fontSize: 10,
    fontWeight: "900",
  },
  modalLaneText: {
    marginTop: 8,
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 17,
  },
  modalLaneAcceptance: {
    marginTop: 6,
    color: "rgba(224,242,254,0.9)",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 10,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  checkpointRow: {
    marginBottom: 9,
    flexDirection: "row",
    gap: 10,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
  },
  checkpointCopy: {
    flex: 1,
  },
  checkpointTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  checkpointText: {
    marginTop: 4,
    color: "rgba(255,255,255,0.68)",
    fontSize: 11,
    lineHeight: 16,
  },
});
