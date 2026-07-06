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
  CheckCircle2,
  Circle,
  Flag,
  Send,
  ShieldAlert,
} from "lucide-react-native";

import { useI18n } from "../src/shared/i18n";
import {
  CHAT_REPORT_REASONS,
  submitChatReport,
  type ChatReportReasonId,
} from "../src/modules/messenger/chat-room/reportRuntime";

type RouteParams = {
  chatId?: string;
  chatName?: string;
  roomType?: string;
  reporterUserId?: string;
  targetUserId?: string;
};

function txOr(
  t: (key: string) => string,
  key: string,
  fallback: string,
): string {
  const value = t(key);
  return value === key ? fallback : value;
}

export default function ChatReportScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const { t } = useI18n();

  const texts = useMemo(
    () => ({
      title: txOr(t, "messenger.report.title", "Пожаловаться"),
      subtitle: txOr(
        t,
        "messenger.report.subtitle",
        "Выберите причину жалобы и отправьте обращение"
      ),
      selectedChat: txOr(t, "messenger.report.selectedChat", "Чат"),
      reasonTitle: txOr(t, "messenger.report.reasonTitle", "Причина жалобы"),
      detailsTitle: txOr(t, "messenger.report.detailsTitle", "Подробности"),
      detailsPlaceholder: txOr(
        t,
        "messenger.report.detailsPlaceholder",
        "Опишите проблему подробнее"
      ),
      requiredHint: txOr(
        t,
        "messenger.report.requiredHint",
        "Если причины нет в списке, опишите её вручную"
      ),
      submit: txOr(t, "messenger.report.submit", "Отправить жалобу"),
      successTitle: txOr(t, "messenger.report.successTitle", "Жалоба отправлена"),
      successMessage: txOr(
        t,
        "messenger.report.successMessage",
        "Спасибо. Мы получили вашу жалобу и проверим обращение."
      ),
      validationTitle: txOr(t, "messenger.report.validationTitle", "Нужно заполнить"),
      validationMessage: txOr(
        t,
        "messenger.report.validationMessage",
        "Выберите причину жалобы или добавьте описание."
      ),
      other: txOr(t, "messenger.report.other", "Другая причина"),
      sending: txOr(t, "messenger.report.sending", "Отправка..."),
      back: txOr(t, "common.back", "Назад"),
      playReadyEvidenceTitle: txOr(t, "messenger.report.playReadyEvidenceTitle", "Play-ready UGC safety"),
      reportContentAction: txOr(t, "messenger.report.reportContentAction", "Report content"),
      reportUserAction: txOr(t, "messenger.report.reportUserAction", "Report user"),
      blockUserAction: txOr(t, "messenger.report.blockUserAction", "Block user"),
      commentModerationAction: txOr(t, "messenger.report.commentModerationAction", "Comment report / hide"),
      noFakeModeration: txOr(
        t,
        "messenger.report.noFakeModeration",
        "Mobile UI evidence only: no fake moderation success, no backend/provider call, no money movement."
      ),
      adultGateEvidence: txOr(t, "messenger.report.adultGateEvidence", "18+ / minor-safety reason is available through the report reasons."),
      providerNotConfigured: txOr(t, "messenger.report.providerNotConfigured", "provider_not_configured: moderation queue/provider is not connected in this mobile-only patch."),
    }),
    [t],
  );

  const chatId = String(params.chatId ?? "").trim();
  const chatName = String(params.chatName ?? "").trim() || "Chat";
  const roomType = String(params.roomType ?? "").trim() || "direct";
  const reporterUserId = String(params.reporterUserId ?? "").trim() || undefined;
  const targetUserId = String(params.targetUserId ?? "").trim() || undefined;

  const [selectedReason, setSelectedReason] =
    useState<ChatReportReasonId | null>(null);
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);

  const canSubmit =
    Boolean(selectedReason) &&
    (selectedReason !== "other" || Boolean(details.trim()));

  const handleBlockPreview = () => {
    Alert.alert(
      texts.blockUserAction,
      `${texts.noFakeModeration}\n\nTarget user: ${targetUserId || "not provided"}`
    );
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert(texts.validationTitle, texts.validationMessage);
      return;
    }

    if (selectedReason === "other" && !details.trim()) {
      Alert.alert(texts.validationTitle, texts.validationMessage);
      return;
    }

    if (!chatId) {
      Alert.alert("Error", "chatId is missing.");
      return;
    }

    try {
      setSending(true);

      await submitChatReport({
        chatId,
        chatName,
        roomType,
        reporterUserId,
        targetUserId,
        reasonId: selectedReason,
        details: details.trim() || undefined,
      });

      Alert.alert(texts.successTitle, texts.successMessage, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to submit report."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <LinearGradient
      colors={["#07131C", "#0A1D28", "#102B36", "#0C1A24"]}
      style={styles.gradient}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.container}>
            <View style={styles.headerRow}>
              <Pressable onPress={() => router.back()} style={styles.headerButton}>
                {({ pressed }) => (
                  <LinearGradient
                    colors={["rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)"]}
                    style={[styles.headerButtonInner, pressed && styles.pressed]}
                  >
                    <ArrowLeft size={18} color="#F6FFF9" strokeWidth={2.4} />
                  </LinearGradient>
                )}
              </Pressable>

              <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>{texts.title}</Text>
                <Text style={styles.headerSubtitle}>{texts.subtitle}</Text>
              </View>

              <View style={styles.headerButtonGhost} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.heroCardWrap}>
                <View style={styles.heroShadow} />
                <LinearGradient
                  colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.04)"]}
                  style={styles.heroCard}
                >
                  <View style={styles.heroIconWrap}>
                    <Flag size={18} color="#6BFFD6" strokeWidth={2.4} />
                  </View>

                  <View style={styles.heroTextWrap}>
                    <Text style={styles.heroLabel}>{texts.selectedChat}</Text>
                    <Text style={styles.heroValue}>{chatName}</Text>
                  </View>
                </LinearGradient>
              </View>

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
                <ShieldAlert size={15} color="#07131C" strokeWidth={2.5} />
                <Text style={styles.blockPreviewButtonText}>{texts.blockUserAction}</Text>
              </Pressable>
              <Text style={styles.noFakeModerationText}>{texts.noFakeModeration}</Text>
            </View>

              <View style={styles.sectionWrap}>
                <Text style={styles.sectionTitle}>{texts.reasonTitle}</Text>

                {CHAT_REPORT_REASONS.map((item) => {
                  const selected = selectedReason === item.id;

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setSelectedReason(item.id)}
                      style={styles.reasonPressable}
                    >
                      {({ pressed }) => (
                        <LinearGradient
                          colors={
                            selected
                              ? ["rgba(77,255,210,0.18)", "rgba(255,255,255,0.05)"]
                              : ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.03)"]
                          }
                          style={[
                            styles.reasonCard,
                            selected && styles.reasonCardSelected,
                            pressed && styles.pressed,
                          ]}
                        >
                          <View style={styles.reasonIconCell}>
                            {selected ? (
                              <CheckCircle2
                                size={18}
                                color="#70FFD8"
                                strokeWidth={2.5}
                              />
                            ) : (
                              <Circle
                                size={18}
                                color="rgba(246,255,249,0.56)"
                                strokeWidth={2.2}
                              />
                            )}
                          </View>

                          <View style={styles.reasonTextCell}>
                            <Text style={styles.reasonTitle}>{item.title}</Text>
                            <Text style={styles.reasonSubtitle}>{item.subtitle}</Text>
                          </View>
                        </LinearGradient>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.sectionWrap}>
                <View style={styles.detailsHeader}>
                  <ShieldAlert size={16} color="#7FE9FF" strokeWidth={2.3} />
                  <Text style={styles.sectionTitle}>{texts.detailsTitle}</Text>
                </View>

                <Text style={styles.detailsHint}>{texts.requiredHint}</Text>

                <View style={styles.inputCard}>
                  <TextInput
                    value={details}
                    onChangeText={setDetails}
                    placeholder={texts.detailsPlaceholder}
                    placeholderTextColor="rgba(232,255,246,0.34)"
                    style={styles.input}
                    multiline
                    textAlignVertical="top"
                    selectionColor="#6BFFD6"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.bottomBar}>
              <Pressable
                onPress={handleSubmit}
                disabled={!canSubmit || sending}
                style={styles.submitWrap}
              >
                {({ pressed }) => (
                  <LinearGradient
                    colors={
                      !canSubmit || sending
                        ? ["#28454E", "#1C3138"]
                        : ["#1CC7A1", "#11947A", "#0F7561"]
                    }
                    style={[
                      styles.submitButton,
                      pressed && canSubmit && !sending ? styles.pressed : undefined,
                    ]}
                  >
                    <Send size={16} color="#F6FFF9" strokeWidth={2.4} />
                    <Text style={styles.submitText}>
                      {sending ? texts.sending : texts.submit}
                    </Text>
                    <BadgeCheck size={16} color="#F6FFF9" strokeWidth={2.4} />
                  </LinearGradient>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 6,
    marginBottom: 14,
  },
  headerButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: "hidden",
  },
  headerButtonInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  headerButtonGhost: {
    width: 46,
    height: 46,
  },
  headerTitle: {
    color: "#F6FFF9",
    fontSize: 20,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "rgba(232,255,246,0.64)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroCardWrap: {
    marginBottom: 16,
    position: "relative",
  },
  heroShadow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    bottom: -4,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  heroCard: {
    minHeight: 88,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  heroIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: "rgba(107,255,214,0.12)",
    borderWidth: 1,
    borderColor: "rgba(107,255,214,0.20)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroLabel: {
    color: "rgba(232,255,246,0.54)",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  heroValue: {
    color: "#F6FFF9",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 4,
  },
  playReadyEvidenceCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(107,255,214,0.15)",
    backgroundColor: "rgba(107,255,214,0.07)",
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 18,
  },
  playReadyEvidenceTitle: {
    color: "#F6FFF9",
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
    backgroundColor: "rgba(107,255,214,0.12)",
    borderWidth: 1,
    borderColor: "rgba(107,255,214,0.16)",
  },
  playReadyPillText: {
    color: "#70FFD8",
    fontSize: 10,
    fontWeight: "900",
  },
  playReadyEvidenceText: {
    color: "rgba(232,255,246,0.72)",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
    marginTop: 3,
  },
  blockPreviewButton: {
    minHeight: 36,
    borderRadius: 18,
    backgroundColor: "#70FFD8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  blockPreviewButtonText: {
    color: "#07131C",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  noFakeModerationText: {
    color: "rgba(232,255,246,0.54)",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    marginTop: 8,
  },
  sectionWrap: {
    marginBottom: 18,
  },
  sectionTitle: {
    color: "#F6FFF9",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10,
  },
  reasonPressable: {
    borderRadius: 20,
    marginBottom: 10,
  },
  reasonCard: {
    minHeight: 78,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  reasonCardSelected: {
    borderColor: "rgba(112,255,216,0.22)",
  },
  reasonIconCell: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  reasonTextCell: {
    flex: 1,
  },
  reasonTitle: {
    color: "#F6FFF9",
    fontSize: 15,
    fontWeight: "900",
  },
  reasonSubtitle: {
    color: "rgba(232,255,246,0.62)",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  detailsHint: {
    color: "rgba(232,255,246,0.56)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    marginBottom: 10,
  },
  inputCard: {
    minHeight: 144,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    minHeight: 118,
    color: "#F6FFF9",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  bottomBar: {
    paddingBottom: 10,
    paddingTop: 6,
  },
  submitWrap: {
    borderRadius: 22,
    overflow: "hidden",
  },
  submitButton: {
    minHeight: 56,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  submitText: {
    color: "#F6FFF9",
    fontSize: 15,
    fontWeight: "900",
  },
  pressed: {
    transform: [{ scale: 0.988 }],
    opacity: 0.96,
  },
});