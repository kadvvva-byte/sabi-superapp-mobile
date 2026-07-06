import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import {
  getStreamMobileUiFullReadinessSnapshot197R,
  streamMobileUiFullReadinessGuardrails197R,
} from "./streamMobileUiFullReadiness197R";

type IconName = keyof typeof Ionicons.glyphMap;

type StreamMobileUiFullReadinessPanel197RProps = {
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const areaIconMap: Record<string, IconName> = {
  shell_navigation: "compass-outline",
  prelive_setup: "videocam-outline",
  ordinary_live_room: "radio-outline",
  business_live_room: "briefcase-outline",
  shorts_viewer_editor: "play-circle-outline",
  creator_profile: "person-circle-outline",
  gift_catalog: "gift-outline",
  gift_ceremony_fx: "sparkles-outline",
  gift_receiver_earnings: "wallet-outline",
  stream_games_demo: "game-controller-outline",
  moderation_safety: "shield-checkmark-outline",
  privacy_age_region: "lock-closed-outline",
  accessibility_motion: "body-outline",
  localization_copy: "language-outline",
  performance_compact_phone: "phone-portrait-outline",
  provider_backend_handoff: "server-outline",
  wallet_payment_boundary: "card-outline",
  no_fake_runtime: "checkmark-done-circle-outline",
};

export function StreamMobileUiFullReadinessPanel197R({ compact = false, style }: StreamMobileUiFullReadinessPanel197RProps) {
  const [open, setOpen] = useState(false);
  const snapshot = useMemo(() => getStreamMobileUiFullReadinessSnapshot197R(), []);
  const heroMeta = `${snapshot.checkedAreaCount}/${snapshot.checkedAreaCount} areas · ${snapshot.backendHandoffReadyCount} backend handoff · ${snapshot.userFacingBlockerCount} blockers · ${snapshot.fakeRuntimeCount} fake`;

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <Pressable style={styles.card} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel="197R Stream mobile UI full readiness">
        <LinearGradient colors={["rgba(242,199,91,0.18)", "rgba(88,62,156,0.16)", "rgba(255,255,255,0.07)"]} style={[styles.cardGradient, compact ? styles.cardGradientCompact : null]}>
          <View style={styles.iconBadge}>
            <Ionicons name="shield-checkmark-outline" size={compact ? 17 : 20} color="#09070D" />
          </View>
          <View style={styles.copyWrap}>
            <Text style={styles.title} numberOfLines={1}>197R · Stream Mobile UI 100%</Text>
            <Text style={styles.meta} numberOfLines={2}>{snapshot.readinessLabelRu} · {heroMeta}</Text>
          </View>
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>{snapshot.mobileUiReadinessPercent}%</Text>
            <Ionicons name="chevron-forward" size={14} color="#09070D" />
          </View>
        </LinearGradient>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.sheetTop}>
              <View style={styles.sheetIcon}>
                <Ionicons name="phone-portrait-outline" size={24} color="#F2C75B" />
              </View>
              <View style={styles.sheetTitleWrap}>
                <Text style={styles.sheetTitle}>197R · Полная готовность Stream mobile UI</Text>
                <Text style={styles.sheetMeta}>{snapshot.scopeRu}</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Закрыть 197R readiness">
                <Ionicons name="close" size={21} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.heroBox}>
              <View style={styles.heroScoreCircle}>
                <Text style={styles.heroScoreText}>{snapshot.mobileUiReadinessPercent}%</Text>
                <Text style={styles.heroScoreMeta}>MOBILE UI</Text>
              </View>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>Без user-facing blockers и без fake-success</Text>
                <Text style={styles.heroBody}>{snapshot.honestBoundaryRu}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statPill}><Text style={styles.statValue}>{snapshot.checkedAreaCount}</Text><Text style={styles.statLabel}>areas</Text></View>
              <View style={styles.statPill}><Text style={styles.statValue}>{snapshot.userFacingBlockerCount}</Text><Text style={styles.statLabel}>blockers</Text></View>
              <View style={styles.statPill}><Text style={styles.statValue}>{snapshot.fakeRuntimeCount}</Text><Text style={styles.statLabel}>fake</Text></View>
              <View style={styles.statPill}><Text style={styles.statValue}>{snapshot.backendHandoffReadyCount}</Text><Text style={styles.statLabel}>handoff</Text></View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <View style={styles.areaGrid}>
                {snapshot.areas.map((area) => (
                  <View key={area.key} style={styles.areaCard}>
                    <View style={styles.areaIcon}>
                      <Ionicons name={areaIconMap[area.key] ?? "checkmark-circle-outline"} size={18} color="#F2C75B" />
                    </View>
                    <View style={styles.areaCopy}>
                      <Text style={styles.areaTitle}>{area.titleRu}</Text>
                      <Text style={styles.areaBody}>{area.bodyRu}</Text>
                      <Text style={styles.areaGate}>{area.qualityGateRu}</Text>
                    </View>
                    <View style={area.state === "mobile_ready" ? styles.readyBadge : styles.handoffBadge}>
                      <Text style={styles.badgeText}>{area.state === "mobile_ready" ? "READY" : "HANDOFF"}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.guardrailBox}>
                <Text style={styles.guardrailTitle}>197R · no-fake guardrails</Text>
                {streamMobileUiFullReadinessGuardrails197R.map((guardrail) => (
                  <View key={guardrail} style={styles.guardrailRow}>
                    <Ionicons name="checkmark-circle-outline" size={15} color="#F2C75B" />
                    <Text style={styles.guardrailText}>{guardrail}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 10,
  },
  wrapperCompact: {
    paddingHorizontal: 12,
    marginTop: 8,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.26)",
    backgroundColor: "rgba(255,255,255,0.055)",
  },
  cardGradient: {
    minHeight: 74,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardGradientCompact: {
    minHeight: 66,
    padding: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2C75B",
    shadowColor: "#F2C75B",
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  copyWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  meta: {
    marginTop: 4,
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    lineHeight: 15,
  },
  scorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "#F2C75B",
  },
  scoreText: {
    color: "#09070D",
    fontSize: 12,
    fontWeight: "900",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "88%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 18,
    backgroundColor: "#0B0910",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.22)",
  },
  sheetTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  sheetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(242,199,91,0.13)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.24)",
  },
  sheetTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  sheetTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  sheetMeta: {
    marginTop: 4,
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    lineHeight: 17,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heroBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(242,199,91,0.10)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.20)",
    marginBottom: 12,
  },
  heroScoreCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2C75B",
  },
  heroScoreText: {
    color: "#09070D",
    fontSize: 20,
    fontWeight: "900",
  },
  heroScoreMeta: {
    color: "rgba(9,7,13,0.72)",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  heroBody: {
    marginTop: 5,
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 17,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  statPill: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statValue: {
    color: "#F2C75B",
    fontSize: 16,
    fontWeight: "900",
  },
  statLabel: {
    marginTop: 2,
    color: "rgba(255,255,255,0.58)",
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  content: {
    paddingBottom: 22,
  },
  areaGrid: {
    gap: 10,
  },
  areaCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  areaIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(242,199,91,0.10)",
  },
  areaCopy: {
    flex: 1,
    minWidth: 0,
  },
  areaTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  areaBody: {
    marginTop: 4,
    color: "rgba(255,255,255,0.70)",
    fontSize: 11,
    lineHeight: 16,
  },
  areaGate: {
    marginTop: 5,
    color: "rgba(242,199,91,0.84)",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
  },
  readyBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "rgba(112,255,178,0.15)",
    borderWidth: 1,
    borderColor: "rgba(112,255,178,0.24)",
  },
  handoffBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "rgba(178,141,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(178,141,255,0.24)",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  guardrailBox: {
    marginTop: 12,
    borderRadius: 20,
    padding: 14,
    backgroundColor: "rgba(242,199,91,0.08)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.18)",
  },
  guardrailTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
  },
  guardrailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 7,
  },
  guardrailText: {
    flex: 1,
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    lineHeight: 16,
  },
});
