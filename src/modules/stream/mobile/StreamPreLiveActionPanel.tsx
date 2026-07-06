import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { StreamLabelKey } from "../presentation/stream.i18n";
import {
  closeStreamLocalPreview,
  createInitialStreamActionRuntimeState,
  getStreamActionBlockers,
  getStreamLocalPreviewBlockers,
  openStreamLocalPreview,
  requestStreamProviderHandoff,
  setStreamPermissionStatus,
  updateStreamLocalDraft,
  type StreamActionBlockerCode,
  type StreamActionRuntimeState,
  type StreamLaunchMode,
  type StreamPermissionStatus,
  type StreamVisibility,
} from "./streamActionRuntime";

type UiVisibility = "public" | "followers" | "private";
type IconName = keyof typeof Ionicons.glyphMap;

type StreamPreLiveActionPanelProps = {
  readonly mode: StreamLaunchMode;
  readonly title: string;
  readonly topic: string;
  readonly description: string;
  readonly visibility: UiVisibility;
  readonly cameraPermissionReady: boolean;
  readonly cameraGranted: boolean;
  readonly microphonePermissionReady: boolean;
  readonly microphoneGranted: boolean;
  readonly onChangeMode: (mode: StreamLaunchMode) => void;
  readonly onChangeTitle: (value: string) => void;
  readonly onChangeTopic: (value: string) => void;
  readonly onChangeDescription: (value: string) => void;
  readonly onChangeVisibility: (value: UiVisibility) => void;
  readonly onRequestDevicePermissions: () => void;
  readonly onOpenLaunchReadiness: () => void;
  readonly t: (key: StreamLabelKey) => string;
};

const modes: readonly { id: StreamLaunchMode; label: StreamLabelKey; icon: IconName }[] = [
  { id: "soloLive", label: "soloLive", icon: "person-outline" },
  { id: "groupLive", label: "groupLive", icon: "people-outline" },
  { id: "audioLive", label: "audioLive", icon: "mic-outline" },
  { id: "gameLive", label: "gameLive", icon: "game-controller-outline" },
  { id: "cinemaLive", label: "cinemaLive", icon: "film-outline" },
  { id: "businessLive", label: "businessLiveModeUi", icon: "briefcase-outline" },
];

const visibilities: readonly { id: UiVisibility; label: StreamLabelKey; icon: IconName }[] = [
  { id: "public", label: "publicVisibility", icon: "earth-outline" },
  { id: "followers", label: "followersVisibility", icon: "people-outline" },
  { id: "private", label: "privateVisibility", icon: "lock-closed-outline" },
];

const blockerLabels: Record<StreamActionBlockerCode, { icon: IconName; title: StreamLabelKey; status: StreamLabelKey }> = {
  title_required: { icon: "create-outline", title: "streamTitle", status: "streamTitleRequired" },
  topic_required: { icon: "pricetag-outline", title: "streamTopic", status: "neededShort" },
  description_required_for_business: { icon: "document-text-outline", title: "streamDescription", status: "neededShort" },
  camera_permission_required: { icon: "camera-outline", title: "cameraPermission", status: "cameraPermissionNeeded" },
  microphone_permission_required: { icon: "mic-outline", title: "microphonePermission", status: "micPermissionNeeded" },
  stream_provider_not_configured: { icon: "cloud-offline-outline", title: "liveProviderBinding", status: "providerNotConfigured" },
  streamer_admin_approval_required: { icon: "shield-checkmark-outline", title: "adminLaunchApprovalMissing", status: "ownerApprovalRequired" },
  business_stream_requires_business_visibility: { icon: "briefcase-outline", title: "businessLiveModeUi", status: "businessModeLockedShopping" },
};

function permissionStatus(ready: boolean, granted: boolean): StreamPermissionStatus {
  if (granted) {
    return "granted";
  }
  if (ready) {
    return "denied";
  }
  return "unknown";
}

function runtimeVisibility(mode: StreamLaunchMode, visibility: UiVisibility): StreamVisibility {
  return mode === "businessLive" ? "business_only" : visibility;
}

function patchRuntimeFromProps(
  state: StreamActionRuntimeState,
  props: Pick<
    StreamPreLiveActionPanelProps,
    | "mode"
    | "title"
    | "topic"
    | "description"
    | "visibility"
    | "cameraPermissionReady"
    | "cameraGranted"
    | "microphonePermissionReady"
    | "microphoneGranted"
  >,
): StreamActionRuntimeState {
  const nextVisibility = runtimeVisibility(props.mode, props.visibility);
  const camera = permissionStatus(props.cameraPermissionReady, props.cameraGranted);
  const microphone = permissionStatus(props.microphonePermissionReady, props.microphoneGranted);

  const sameDraft =
    state.draft.mode === props.mode &&
    state.draft.title === props.title.trim().replace(/\s+/g, " ") &&
    state.draft.topic === props.topic.trim().replace(/\s+/g, " ") &&
    state.draft.description === props.description.trim().replace(/\s+/g, " ") &&
    state.draft.visibility === nextVisibility;
  const samePermissions = state.permissions.camera === camera && state.permissions.microphone === microphone;

  if (sameDraft && samePermissions) {
    return state;
  }

  let nextState = state;
  if (!sameDraft) {
    nextState = updateStreamLocalDraft(nextState, {
      mode: props.mode,
      title: props.title,
      topic: props.topic,
      description: props.description,
      visibility: nextVisibility,
    }).state;
  }
  if (nextState.permissions.camera !== camera) {
    nextState = setStreamPermissionStatus(nextState, "camera", camera).state;
  }
  if (nextState.permissions.microphone !== microphone) {
    nextState = setStreamPermissionStatus(nextState, "microphone", microphone).state;
  }
  return nextState;
}

export function StreamPreLiveActionPanel(props: StreamPreLiveActionPanelProps) {
  const { t } = props;
  const [runtimeState, setRuntimeState] = useState<StreamActionRuntimeState>(() =>
    patchRuntimeFromProps(createInitialStreamActionRuntimeState({ mode: props.mode }), props),
  );
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setRuntimeState((current) => patchRuntimeFromProps(current, props));
  }, [
    props.mode,
    props.title,
    props.topic,
    props.description,
    props.visibility,
    props.cameraPermissionReady,
    props.cameraGranted,
    props.microphonePermissionReady,
    props.microphoneGranted,
  ]);

  const blockers = useMemo(() => getStreamActionBlockers(runtimeState), [runtimeState]);
  const localPreviewBlockers = useMemo(() => getStreamLocalPreviewBlockers(runtimeState), [runtimeState]);
  const activeMode = modes.find((item) => item.id === props.mode) ?? modes[0];
  const previewReady = runtimeState.preview.status === "ready";
  const draftReady = blockers.length < 3 || (props.title.trim().length > 2 && props.topic.trim().length > 1);

  const updateDraft = (patch: { title?: string; topic?: string; description?: string; visibility?: UiVisibility; mode?: StreamLaunchMode }) => {
    if (patch.title !== undefined) props.onChangeTitle(patch.title);
    if (patch.topic !== undefined) props.onChangeTopic(patch.topic);
    if (patch.description !== undefined) props.onChangeDescription(patch.description);
    if (patch.visibility !== undefined) props.onChangeVisibility(patch.visibility);
    if (patch.mode !== undefined) props.onChangeMode(patch.mode);

    setRuntimeState((current) =>
      updateStreamLocalDraft(current, {
        ...patch,
        visibility: patch.visibility ? runtimeVisibility(patch.mode ?? props.mode, patch.visibility) : undefined,
      }).state,
    );
  };

  const requestDevicePermissions = () => {
    props.onRequestDevicePermissions();
    setRuntimeState((current) =>
      patchRuntimeFromProps(current, {
        mode: props.mode,
        title: props.title,
        topic: props.topic,
        description: props.description,
        visibility: props.visibility,
        cameraPermissionReady: props.cameraPermissionReady,
        cameraGranted: props.cameraGranted,
        microphonePermissionReady: props.microphonePermissionReady,
        microphoneGranted: props.microphoneGranted,
      }),
    );
  };

  const openLocalPreview = () => {
    setRuntimeState((current) => openStreamLocalPreview(current).state);
  };

  const closeLocalPreview = () => {
    setRuntimeState((current) => closeStreamLocalPreview(current).state);
  };

  const requestProviderHandoff = () => {
    setRuntimeState((current) => requestStreamProviderHandoff(current).state);
    props.onOpenLaunchReadiness();
  };

  return (
    <>
      <Pressable style={styles.compactPanel} onPress={() => setExpanded(true)} accessibilityLabel={t("liveLaunchGate")}>
        <View style={styles.compactIcon}>
          <Ionicons name={previewReady ? "radio-outline" : "construct-outline"} size={18} color="#F2C75B" />
        </View>
        <View style={styles.compactTextBlock}>
          <Text style={styles.compactTitle} numberOfLines={1}>{t("liveLaunchGate")} · 108Q</Text>
          <Text style={styles.compactMeta} numberOfLines={1}>
            {t(activeMode.label)} · {previewReady ? t("readyShort") : draftReady ? t("draftReadyButLaunchBlocked") : t("neededShort")}
          </Text>
        </View>
        <View style={styles.compactBadge}>
          <Text style={styles.compactBadgeText}>{blockers.length}</Text>
        </View>
      </Pressable>

      <Modal visible={expanded} transparent animationType="slide" onRequestClose={() => setExpanded(false)}>
        <Pressable style={styles.backdrop} onPress={() => setExpanded(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.sheetTop}>
              <View style={styles.sheetIcon}>
                <Ionicons name="radio-outline" size={24} color="#F2C75B" />
              </View>
              <View style={styles.sheetTitleBlock}>
                <Text style={styles.sheetTitle} numberOfLines={1}>{t("liveLaunchGate")}</Text>
                <Text style={styles.sheetMeta} numberOfLines={1}>{t("localDraftOnly")} · {t("realDataOnly")}</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setExpanded(false)} accessibilityLabel={t("closeSideControls")}>
                <Ionicons name="close-outline" size={24} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.safeNotice}>
              <View style={styles.safeDot} />
              <Text style={styles.safeNoticeText} numberOfLines={2}>
                {t("noFakeGoLive")} · {t("noFakeDraftPublish")} · {t("providerNotConfigured")}
              </Text>
            </View>

            <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetScrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("activeLiveMode")}</Text>
                <View style={styles.modeGrid}>
                  {modes.map((item) => {
                    const active = item.id === props.mode;
                    return (
                      <Pressable key={item.id} style={[styles.modeChip, active ? styles.modeChipActive : null]} onPress={() => updateDraft({ mode: item.id })}>
                        <Ionicons name={item.icon} size={15} color={active ? "#09070D" : "#F2C75B"} />
                        <Text style={[styles.modeChipText, active ? styles.modeChipTextActive : null]} numberOfLines={1}>{t(item.label)}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("streamInfoSetup")}</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>{t("streamTitle")}</Text>
                  <TextInput value={props.title} onChangeText={(value: string) => updateDraft({ title: value })} placeholder={t("enterTitleLater")} placeholderTextColor="#8D8796" style={styles.input} />
                </View>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>{t("streamTopic")}</Text>
                  <TextInput value={props.topic} onChangeText={(value: string) => updateDraft({ topic: value })} placeholder={t("streamTopic")} placeholderTextColor="#8D8796" style={styles.input} />
                </View>
                <View style={styles.inputBoxLarge}>
                  <Text style={styles.inputLabel}>{t("streamDescription")}</Text>
                  <TextInput value={props.description} onChangeText={(value: string) => updateDraft({ description: value })} placeholder={t("streamDescription")} placeholderTextColor="#8D8796" multiline style={styles.inputLarge} />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("streamVisibility")}</Text>
                <View style={styles.visibilityRow}>
                  {visibilities.map((item) => {
                    const active = item.id === props.visibility && props.mode !== "businessLive";
                    const disabled = props.mode === "businessLive";
                    return (
                      <Pressable key={item.id} disabled={disabled} style={[styles.visibilityChip, active ? styles.visibilityChipActive : null, disabled ? styles.visibilityChipDisabled : null]} onPress={() => updateDraft({ visibility: item.id })}>
                        <Ionicons name={item.icon} size={15} color={active ? "#09070D" : "#F2C75B"} />
                        <Text style={[styles.visibilityText, active ? styles.visibilityTextActive : null]} numberOfLines={1}>{t(item.label)}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {props.mode === "businessLive" ? <Text style={styles.businessVisibilityHint}>{t("businessModeLockedShopping")}</Text> : null}
              </View>

              <View style={styles.statusGrid}>
                <StatusTile icon={props.cameraGranted ? "checkmark-circle-outline" : "camera-outline"} title={t("cameraPermission")} value={props.cameraGranted ? t("readyShort") : t("neededShort")} ready={props.cameraGranted} />
                <StatusTile icon={props.microphoneGranted ? "checkmark-circle-outline" : "mic-outline"} title={t("microphonePermission")} value={props.microphoneGranted ? t("readyShort") : t("neededShort")} ready={props.microphoneGranted} />
                <StatusTile icon={previewReady ? "radio-outline" : "cloud-offline-outline"} title={t("roomPreview")} value={previewReady ? t("readyShort") : t("previewLocked")} ready={previewReady} />
                <StatusTile icon="cloud-offline-outline" title={t("liveProviderBinding")} value={t("providerNotConfigured")} ready={false} />
              </View>

              <View style={styles.blockerSection}>
                <Text style={styles.sectionTitle}>{t("launchBlockedReason")}</Text>
                {(blockers.length > 0 ? blockers : (["stream_provider_not_configured"] as const)).slice(0, 8).map((blocker) => {
                  const meta = blockerLabels[blocker];
                  return (
                    <View key={blocker} style={styles.blockerRow}>
                      <View style={styles.blockerIcon}>
                        <Ionicons name={meta.icon} size={16} color="#F2C75B" />
                      </View>
                      <Text style={styles.blockerTitle} numberOfLines={1}>{t(meta.title)}</Text>
                      <Text style={styles.blockerStatus} numberOfLines={1}>{t(meta.status)}</Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.actionRow}>
              <Pressable style={styles.secondaryButton} onPress={requestDevicePermissions}>
                <Text style={styles.secondaryButtonText}>{t("requestPermissionsFirst")}</Text>
              </Pressable>
              <Pressable style={[styles.secondaryButton, localPreviewBlockers.length > 0 ? styles.disabledButton : null]} onPress={previewReady ? closeLocalPreview : openLocalPreview}>
                <Text style={styles.secondaryButtonText}>{previewReady ? t("closeSideControls") : t("roomPreview")}</Text>
              </Pressable>
              <Pressable style={styles.blockedButton} onPress={requestProviderHandoff}>
                <Text style={styles.blockedButtonText}>{t("startLiveLocked")}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function StatusTile({ icon, title, value, ready }: { readonly icon: IconName; readonly title: string; readonly value: string; readonly ready: boolean }) {
  return (
    <View style={[styles.statusTile, ready ? styles.statusTileReady : null]}>
      <Ionicons name={icon} size={17} color={ready ? "#09070D" : "#F2C75B"} />
      <Text style={[styles.statusTitle, ready ? styles.statusTitleReady : null]} numberOfLines={1}>{title}</Text>
      <Text style={[styles.statusValue, ready ? styles.statusValueReady : null]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  compactPanel: {
    position: "absolute",
    left: 14,
    right: 14,
    top: 88,
    minHeight: 54,
    borderRadius: 22,
    backgroundColor: "rgba(8,7,12,0.78)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.22)",
    zIndex: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  compactIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(242,199,91,0.10)", alignItems: "center", justifyContent: "center" },
  compactTextBlock: { flex: 1 },
  compactTitle: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  compactMeta: { marginTop: 3, color: "#BDB5C8", fontSize: 10, fontWeight: "800" },
  compactBadge: { minWidth: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(239,68,68,0.90)", alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  compactBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.74)", justifyContent: "flex-end", padding: 12 },
  sheet: { maxHeight: "88%", borderRadius: 30, backgroundColor: "#111018", borderWidth: 1, borderColor: "#2B2735", padding: 14, gap: 12 },
  sheetTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  sheetIcon: { width: 44, height: 44, borderRadius: 20, backgroundColor: "rgba(242,199,91,0.12)", alignItems: "center", justifyContent: "center" },
  sheetTitleBlock: { flex: 1 },
  sheetTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "900" },
  sheetMeta: { marginTop: 3, color: "#8D8796", fontSize: 11, fontWeight: "800" },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  safeNotice: { minHeight: 44, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  safeDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#F2C75B" },
  safeNoticeText: { flex: 1, color: "#E1DCE8", fontSize: 11, fontWeight: "900", lineHeight: 15 },
  sheetScroll: { maxHeight: 520 },
  sheetScrollContent: { gap: 12, paddingBottom: 8 },
  section: { borderRadius: 22, backgroundColor: "#17151E", borderWidth: 1, borderColor: "#2B2735", padding: 12, gap: 9 },
  sectionTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  modeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  modeChip: { maxWidth: "48%", minHeight: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 6 },
  modeChipActive: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  modeChipText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900", flexShrink: 1 },
  modeChipTextActive: { color: "#09070D" },
  inputBox: { borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 11, paddingTop: 8, paddingBottom: 6 },
  inputBoxLarge: { minHeight: 96, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 11, paddingTop: 8 },
  inputLabel: { color: "#F2C75B", fontSize: 10, fontWeight: "900" },
  input: { minHeight: 34, color: "#FFFFFF", fontSize: 13, fontWeight: "800", paddingVertical: 0 },
  inputLarge: { minHeight: 70, color: "#FFFFFF", fontSize: 13, fontWeight: "800", paddingVertical: 6, textAlignVertical: "top" },
  visibilityRow: { flexDirection: "row", gap: 8 },
  visibilityChip: { flex: 1, minHeight: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", paddingHorizontal: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  visibilityChipActive: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  visibilityChipDisabled: { opacity: 0.44 },
  visibilityText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900", flexShrink: 1 },
  visibilityTextActive: { color: "#09070D" },
  businessVisibilityHint: { color: "#8D8796", fontSize: 10, fontWeight: "800" },
  statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusTile: { width: "48%", minHeight: 58, borderRadius: 18, backgroundColor: "#17151E", borderWidth: 1, borderColor: "#2B2735", padding: 10, gap: 3 },
  statusTileReady: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  statusTitle: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  statusTitleReady: { color: "#09070D" },
  statusValue: { color: "#8D8796", fontSize: 10, fontWeight: "800" },
  statusValueReady: { color: "rgba(9,7,13,0.72)" },
  blockerSection: { borderRadius: 22, backgroundColor: "#17151E", borderWidth: 1, borderColor: "#2B2735", padding: 12, gap: 8 },
  blockerRow: { minHeight: 38, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 8 },
  blockerIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(242,199,91,0.10)", alignItems: "center", justifyContent: "center" },
  blockerTitle: { flex: 1, color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  blockerStatus: { maxWidth: 138, color: "#8D8796", fontSize: 9, fontWeight: "800" },
  actionRow: { flexDirection: "row", gap: 8 },
  secondaryButton: { flex: 1, minHeight: 46, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  disabledButton: { opacity: 0.58 },
  secondaryButtonText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900", textAlign: "center" },
  blockedButton: { flex: 1, minHeight: 46, borderRadius: 22, backgroundColor: "rgba(239,68,68,0.92)", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  blockedButtonText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900", textAlign: "center" },
});
