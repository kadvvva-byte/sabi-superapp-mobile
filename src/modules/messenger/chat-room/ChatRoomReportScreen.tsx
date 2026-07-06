import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  CircleAlert,
  Flag,
  MessageSquareWarning,
  ShieldAlert,
} from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import {
  CHAT_REPORT_REASONS,
  ChatReportReasonId,
  submitChatReport,
} from "./reportRuntime";

const TEXT_MAIN = "#F6FFF9";
const TEXT_SECONDARY = "rgba(232,255,246,0.74)";
const TEXT_MUTED = "rgba(232,255,246,0.54)";
const ACCENT = "#20D7A7";
const DANGER = "#FF8A98";

function iconForReason(reasonId: ChatReportReasonId) {
  if (reasonId === "fraud" || reasonId === "illegal") return ShieldAlert;
  if (reasonId === "harassment" || reasonId === "violence") return MessageSquareWarning;
  return Flag;
}

export default function ChatRoomReportScreen() {
  const params = useLocalSearchParams<{
    chatId?: string;
    chatName?: string;
    roomType?: string;
    reporterUserId?: string;
    targetUserId?: string;
  }>();
  const { t } = useI18n();

  const chatId =
    typeof params.chatId === "string" && params.chatId.trim()
      ? params.chatId.trim()
      : "1";
  const chatName =
    typeof params.chatName === "string" && params.chatName.trim()
      ? params.chatName.trim()
      : "Chat";
  const roomType = typeof params.roomType === "string" ? params.roomType : "direct";
  const reporterUserId =
    typeof params.reporterUserId === "string" ? params.reporterUserId : undefined;
  const targetUserId =
    typeof params.targetUserId === "string" ? params.targetUserId : undefined;

  const tx = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const texts = useMemo(
    () => ({
      eyebrow: tx("messenger.report", "Жалоба"),
      title: tx("messenger.reportTitle", "Отправить жалобу"),
      subtitle: tx(
        "messenger.reportSubtitle",
        "Выберите причину жалобы. Если подходящей причины нет, опишите её вручную."
      ),
      reasonListTitle: tx("messenger.reportReasonList", "Причина жалобы"),
      detailsTitle: tx("messenger.reportDetails", "Дополнительная причина"),
      detailsPlaceholder: tx(
        "messenger.reportDetailsPlaceholder",
        "Опишите причину жалобы подробнее"
      ),
      send: tx("messenger.sendReport", "Отправить жалобу"),
      sent: tx("messenger.reportSent", "Жалоба отправлена"),
      validation: tx(
        "messenger.reportValidation",
        "Выберите причину жалобы или опишите её вручную."
      ),
      minDetails: tx(
        "messenger.reportMinDetails",
        "Пожалуйста, укажите причину подробнее."
      ),
      targetLabel: tx("messenger.reportTarget", "Объект жалобы"),
      detailsHint: tx(
        "messenger.reportDetailsHint",
        "Это поможет модерации быстрее понять проблему."
      ),
      playReadyEvidenceTitle: tx("messenger.report.playReadyEvidenceTitle", "Play-ready UGC safety"),
      reportContentAction: tx("messenger.report.reportContentAction", "Report content"),
      reportUserAction: tx("messenger.report.reportUserAction", "Report user"),
      blockUserAction: tx("messenger.report.blockUserAction", "Block user"),
      commentModerationAction: tx("messenger.report.commentModerationAction", "Comment report / hide"),
      adultGateEvidence: tx("messenger.report.adultGateEvidence", "18+ / minor-safety reason is available through the report reasons."),
      providerNotConfigured: tx("messenger.report.providerNotConfigured", "provider_not_configured: moderation queue/provider is not connected in this mobile-only patch."),
      noFakeModeration: tx("messenger.report.noFakeModeration", "Mobile UI evidence only: no fake moderation success, no backend/provider call, no money movement."),
    }),
    [t]
  );

  const [selectedReason, setSelectedReason] =
    useState<ChatReportReasonId | null>(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const needsDetails =
    selectedReason === "other" || (!selectedReason && details.trim().length > 0);

  const handleBlockPreview = () => {
    Alert.alert(
      texts.blockUserAction,
      `${texts.noFakeModeration}\n\nTarget user: ${targetUserId || "not provided"}`
    );
  };

  const handleSubmit = () => {
    const normalizedDetails = details.trim();

    if (!selectedReason && !normalizedDetails) {
      Alert.alert(texts.title, texts.validation);
      return;
    }

    if ((selectedReason === "other" || !selectedReason) && normalizedDetails.length < 6) {
      Alert.alert(texts.title, texts.minDetails);
      return;
    }

    setSubmitting(true);
    try {
      submitChatReport({
        chatId,
        chatName,
        roomType,
        reporterUserId,
        targetUserId,
        reasonId: selectedReason ?? "other",
        details: normalizedDetails || undefined,
      });

      Alert.alert(texts.title, texts.sent, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={["#03110E", "#061714", "#0A211B", "#0D2821"]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.safe}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.topGlow} />
          <View style={styles.sideGlow} />
          <View style={styles.bottomGlow} />

          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={20} color={TEXT_MAIN} strokeWidth={2.3} />
            </Pressable>

            <View style={styles.headerTextWrap}>
              <Text style={styles.headerEyebrow}>{texts.eyebrow}</Text>
              <Text style={styles.headerTitle}>{texts.title}</Text>
              <Text style={styles.headerSubtitle}>{texts.subtitle}</Text>
            </View>
          </View>

          <ScrollView keyboardDismissMode="on-drag"
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <LinearGradient
              colors={["rgba(15,48,39,0.90)", "rgba(10,34,28,0.82)"]}
              style={styles.targetCard}
            >
              <View style={styles.targetIconWrap}>
                <BadgeCheck size={18} color={ACCENT} strokeWidth={2.3} />
              </View>
              <View style={styles.targetTextWrap}>
                <Text style={styles.targetLabel}>{texts.targetLabel}</Text>
                <Text style={styles.targetValue}>{chatName}</Text>
              </View>
            </LinearGradient>

            <View style={styles.playReadyEvidenceCard}>
              <Text style={styles.playReadyEvidenceTitle}>{texts.playReadyEvidenceTitle}</Text>
              <View style={styles.playReadyPillRow}>
                <View style={styles.playReadyPill}><Text style={styles.playReadyPillText}>{texts.reportContentAction}</Text></View>
                <View style={styles.playReadyPill}><Text style={styles.playReadyPillText}>{texts.reportUserAction}</Text></View>
                <View style={styles.playReadyPill}><Text style={styles.playReadyPillText}>{texts.commentModerationAction}</Text></View>
              </View>
              <Text style={styles.playReadyEvidenceText}>{texts.adultGateEvidence}</Text>
              <Text style={styles.playReadyEvidenceText}>{texts.providerNotConfigured}</Text>
              <Pressable
                onPress={handleBlockPreview}
                style={styles.blockPreviewButton}
                accessibilityRole="button"
                accessibilityLabel={texts.blockUserAction}
              >
                <ShieldAlert size={15} color="#03110E" strokeWidth={2.5} />
                <Text style={styles.blockPreviewButtonText}>{texts.blockUserAction}</Text>
              </Pressable>
              <Text style={styles.noFakeModerationText}>{texts.noFakeModeration}</Text>
            </View>

            <View style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>{texts.reasonListTitle}</Text>
              {CHAT_REPORT_REASONS.map((reason) => {
                const selected = selectedReason === reason.id;
                const Icon = iconForReason(reason.id);

                return (
                  <Pressable
                    key={reason.id}
                    onPress={() => setSelectedReason(reason.id)}
                    style={({ pressed }) => [
                      styles.reasonPressable,
                      pressed && styles.reasonPressed,
                    ]}
                  >
                    <LinearGradient
                      colors={
                        selected
                          ? ["rgba(32,215,167,0.24)", "rgba(32,215,167,0.10)"]
                          : ["rgba(12,39,32,0.90)", "rgba(9,29,24,0.82)"]
                      }
                      style={[styles.reasonCard, selected && styles.reasonCardSelected]}
                    >
                      <View
                        style={[
                          styles.reasonIconWrap,
                          { borderColor: `${selected ? ACCENT : DANGER}40` },
                        ]}
                      >
                        <Icon
                          size={18}
                          color={
                            selected
                              ? ACCENT
                              : reason.id === "other"
                                ? "#FFD88E"
                                : DANGER
                          }
                          strokeWidth={2.3}
                        />
                      </View>

                      <View style={styles.reasonTextWrap}>
                        <Text style={styles.reasonTitle}>{reason.title}</Text>
                        <Text style={styles.reasonSubtitle}>{reason.subtitle}</Text>
                      </View>

                      <ChevronRight
                        size={18}
                        color="rgba(240,249,255,0.72)"
                        strokeWidth={2.6}
                      />
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>

            {(selectedReason === "other" || needsDetails) ? (
              <View style={styles.sectionWrap}>
                <Text style={styles.sectionTitle}>{texts.detailsTitle}</Text>
                <LinearGradient
                  colors={["rgba(12,39,32,0.90)", "rgba(9,29,24,0.82)"]}
                  style={styles.detailsCard}
                >
                  <View style={styles.detailsHintRow}>
                    <CircleAlert size={16} color="#FFD88E" strokeWidth={2.3} />
                    <Text style={styles.detailsHint}>{texts.detailsHint}</Text>
                  </View>

                  <TextInput
                    value={details}
                    onChangeText={setDetails}
                    placeholder={texts.detailsPlaceholder}
                    placeholderTextColor="rgba(232,255,246,0.40)"
                    multiline
                    textAlignVertical="top"
                    style={styles.detailsInput}
                  />
                </LinearGradient>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable onPress={handleSubmit} disabled={submitting}>
              {({ pressed }) => (
                <LinearGradient
                  colors={["#1ED7A5", "#18B489", "#128F6C"]}
                  style={[
                    styles.submitButton,
                    pressed && styles.reasonPressed,
                    submitting && styles.submitDisabled,
                  ]}
                >
                  <ShieldAlert size={18} color="#052019" strokeWidth={2.4} />
                  <Text style={styles.submitButtonText}>{texts.send}</Text>
                </LinearGradient>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  playReadyEvidenceCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(32,215,167,0.18)",
    backgroundColor: "rgba(32,215,167,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginTop: 12,
    marginBottom: 14,
  },
  playReadyEvidenceTitle: {
    color: TEXT_MAIN,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
  },
  playReadyPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 9,
  },
  playReadyPill: {
    minHeight: 24,
    borderRadius: 12,
    paddingHorizontal: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(32,215,167,0.14)",
    borderWidth: 1,
    borderColor: "rgba(32,215,167,0.18)",
  },
  playReadyPillText: {
    color: ACCENT,
    fontSize: 10,
    fontWeight: "900",
  },
  playReadyEvidenceText: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
    marginTop: 3,
  },
  blockPreviewButton: {
    minHeight: 36,
    borderRadius: 18,
    backgroundColor: ACCENT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  blockPreviewButtonText: {
    color: "#03110E",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  noFakeModerationText: {
    color: TEXT_MUTED,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    marginTop: 8,
  },

  gradient: { flex: 1 },
  safe: { flex: 1 },

  topGlow: {
    position: "absolute",
    top: -90,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(35, 210, 160, 0.16)",
  },
  sideGlow: {
    position: "absolute",
    top: 180,
    left: -90,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: "rgba(105,255,198,0.08)",
  },
  bottomGlow: {
    position: "absolute",
    bottom: 60,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 280,
    backgroundColor: "rgba(25, 138, 108, 0.12)",
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  headerTextWrap: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 6,
  },
  headerEyebrow: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: TEXT_MAIN,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 2,
  },
  headerSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 22,
  },

  targetCard: {
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(183,255,230,0.09)",
    flexDirection: "row",
    alignItems: "center",
  },
  targetIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(32,215,167,0.10)",
    borderWidth: 1,
    borderColor: "rgba(183,255,230,0.12)",
  },
  targetTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  targetLabel: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  targetValue: {
    color: TEXT_MAIN,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 4,
  },

  sectionWrap: {
    marginTop: 18,
  },
  sectionTitle: {
    color: TEXT_MAIN,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },

  reasonPressable: {
    borderRadius: 22,
    marginBottom: 10,
  },
  reasonPressed: {
    transform: [{ scale: 0.988 }],
    opacity: 0.96,
  },
  reasonCard: {
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(183,255,230,0.09)",
    flexDirection: "row",
    alignItems: "center",
  },
  reasonCardSelected: {
    borderColor: "rgba(32,215,167,0.30)",
  },
  reasonIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
  },
  reasonTextWrap: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginRight: 10,
  },
  reasonTitle: {
    color: TEXT_MAIN,
    fontSize: 15,
    fontWeight: "900",
  },
  reasonSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    fontWeight: "700",
  },

  detailsCard: {
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(183,255,230,0.09)",
  },
  detailsHintRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailsHint: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 17,
    marginLeft: 8,
    flex: 1,
    fontWeight: "700",
  },
  detailsInput: {
    minHeight: 132,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    color: TEXT_MAIN,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  footer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 4,
  },
  submitButton: {
    minHeight: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: ACCENT,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#052019",
    fontSize: 15,
    fontWeight: "900",
  },
});
