import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View, type GestureResponderEvent } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { ResizeMode, Video } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import { toggleSabiCameraFacing, type SabiCameraFacing } from "../../../shared/camera/sabiCameraRuntime";

import {
  acknowledgeStreamShortVideoContentPolicy,
  createInitialStreamShortVideoDraftState,
  markStreamShortVideoCaptionReview,
  markStreamShortVideoCoverIntent,
  markStreamShortVideoEditorTimeline,
  queueStreamShortVideoDraftLocalEvent,
  requestStreamShortVideoStorageHandoffBlocked,
  runStreamShortVideoDraftReadinessCheck,
  setStreamShortVideoSourceIntent,
  setStreamShortVideoVisibility,
  type StreamShortVideoSourceIntent,
  type StreamShortVideoVisibility,
  updateStreamShortVideoDraftText,
} from "./streamShortVideoDraftRuntime";
import {
  acknowledgeStreamShortVideoTimelinePolicyReview,
  addStreamShortVideoTimelineClip,
  createInitialStreamShortVideoTimelineState,
  markSelectedStreamShortVideoTimelineClipAsCover,
  markStreamShortVideoTimelineCaptionsReady,
  moveSelectedStreamShortVideoTimelineClip,
  queueStreamShortVideoTimelineLocalEvent,
  requestStreamShortVideoTimelineProviderHandoffBlocked,
  runStreamShortVideoTimelineReadinessCheck,
  selectStreamShortVideoTimelineClip,
  splitSelectedStreamShortVideoTimelineClip,
  STREAM_SHORT_VIDEO_TIMELINE_DRAFT_EVENT_KIND,
  trimSelectedStreamShortVideoTimelineClip,
  type StreamShortVideoTimelineClipKind,
} from "./streamShortVideoEditorTimelineRuntime";
import {
  acknowledgeSelectedStreamShortVideoSourcePolicy,
  createInitialStreamShortVideoSourceIntentState,
  getStreamShortVideoSourceDraftIntent,
  markSelectedStreamShortVideoSourceAssetIntent,
  markSelectedStreamShortVideoSourceCaptionIntent,
  markSelectedStreamShortVideoSourceCoverIntent,
  queueStreamShortVideoSourceLocalEvent,
  requestSelectedStreamShortVideoSourcePermission,
  requestStreamShortVideoSourceProviderHandoffBlocked,
  runStreamShortVideoSourceReadinessCheck,
  selectStreamShortVideoSource,
  selectStreamShortVideoSourceByDraftIntent,
  type StreamShortVideoSourceId,
} from "./streamShortVideoSourceIntentRuntime";
import {
  createInitialStreamShortVideoCoverCaptionReviewState,
  prepareSelectedStreamShortVideoReviewItem,
  queueStreamShortVideoCoverCaptionReviewEvent,
  requestStreamShortVideoCoverCaptionProviderBlocked,
  reviewSelectedStreamShortVideoReviewItem,
  reviewStreamShortVideoCaptionLanguage,
  reviewStreamShortVideoCaptionTrack,
  reviewStreamShortVideoContentPolicy,
  reviewStreamShortVideoCoverFrame,
  reviewStreamShortVideoMedia,
  reviewStreamShortVideoPublishHandoff,
  runStreamShortVideoCoverCaptionReviewCheck,
  selectStreamShortVideoReviewItem,
  type StreamShortVideoReviewItemId,
} from "./streamShortVideoCoverCaptionReviewRuntime";

import {
  createInitialStreamShortVideoFeedDraftListState,
  pauseShortVideoLocalPlaybackShell,
  queueShortVideoFeedDraftLocalEvent,
  requestShortVideoFeedProviderBlocked,
  requestShortVideoLocalPlaybackShell,
  runShortVideoFeedDraftListReadinessCheck,
  selectNextShortVideoFeedDraft,
  selectPreviousShortVideoFeedDraft,
  stopShortVideoLocalPlaybackShell,
  syncCurrentShortVideoDraftToFeedList,
} from "./streamShortVideoFeedDraftListRuntime";

import {
  createInitialStreamShortVideoPlaybackControlsState,
  cycleStreamShortVideoPlaybackQualityLocal,
  cycleStreamShortVideoPlaybackSpeedLocal,
  pauseStreamShortVideoPlaybackLocal,
  playStreamShortVideoPlaybackLocal,
  queueStreamShortVideoPlaybackControlsEvent,
  requestStreamShortVideoPlaybackProviderBlocked,
  seekStreamShortVideoPlaybackLocal,
  stopStreamShortVideoPlaybackLocal,
  syncStreamShortVideoPlaybackControlsWithFeed,
  toggleStreamShortVideoPlaybackLoopLocal,
  toggleStreamShortVideoPlaybackMuteLocal,
} from "./streamShortVideoPlaybackControlsRuntime";
import {
  createInitialStreamShortVideoEngagementState,
  markStreamShortVideoViewProgressLocal,
  prepareStreamShortVideoReportDraftLocal,
  prepareStreamShortVideoShareDraftLocal,
  queueStreamShortVideoEngagementLocalEvent,
  requestStreamShortVideoEngagementProviderBlocked,
  syncStreamShortVideoEngagementWithFeedAndPlayback,
  toggleStreamShortVideoLikeLocal,
  toggleStreamShortVideoSaveLocal,
} from "./streamShortVideoEngagementRuntime";
import {
  applySelectedStreamShortVideoEffectLocal,
  createInitialStreamShortVideoCreationToolsState,
  cycleStreamShortVideoAudioVolumeLocal,
  markStreamShortVideoBeatSyncLocal,
  markStreamShortVideoVoiceoverIntentLocal,
  queueStreamShortVideoCreationToolsEvent,
  removeSelectedStreamShortVideoEffectLocal,
  requestStreamShortVideoCreationToolsProviderBlocked,
  requestStreamShortVideoMp3ImportIntentLocal,
  runStreamShortVideoCreationToolsReadinessCheck,
  selectStreamShortVideoAudioTool,
  selectStreamShortVideoEffectTool,
  toggleStreamShortVideoOriginalAudioMuteLocal,
  trimStreamShortVideoAudioLocal,
  type StreamShortVideoAudioToolId,
  type StreamShortVideoEffectToolId,
} from "./streamShortVideoCreationToolsRuntime";


import {
  addStreamShortVideoEffectToEditorStackLocal,
  adjustSelectedStreamShortVideoEffectIntensityLocal,
  createInitialStreamShortVideoEffectsEditorState,
  cycleSelectedStreamShortVideoEffectPresetLocal,
  cycleStreamShortVideoEffectPreviewModeLocal,
  moveSelectedStreamShortVideoEditorEffectLocal,
  prepareSelectedStreamShortVideoEffectReviewLocal,
  queueStreamShortVideoEffectsEditorLocalEvent,
  removeSelectedStreamShortVideoEditorEffectLocal,
  requestStreamShortVideoEffectsEditorProviderBlocked,
  selectStreamShortVideoEditorEffectLocal,
  syncStreamShortVideoEffectsEditorWithCreationTools,
  toggleSelectedStreamShortVideoEffectPreviewLocal,
} from "./streamShortVideoEffectsEditorRuntime";

import {
  addSelectedStreamShortVideoBeatMarkerLocal,
  createInitialStreamShortVideoMusicEditorState,
  cycleSelectedStreamShortVideoMusicVolumeLocal,
  importStreamShortVideoMusicTrackLocal,
  markSelectedStreamShortVideoVoiceoverIntentLocal,
  queueStreamShortVideoMusicEditorLocalEvent,
  removeSelectedStreamShortVideoMusicTrackLocal,
  requestStreamShortVideoMusicEditorProviderBlocked,
  reviewSelectedStreamShortVideoMusicMixLocal,
  selectStreamShortVideoMusicTrackLocal,
  shiftSelectedStreamShortVideoMusicPlacementLocal,
  shiftSelectedStreamShortVideoMusicTrimLocal,
  toggleSelectedStreamShortVideoOriginalAudioMuteLocal,
} from "./streamShortVideoMusicEditorRuntime";

import {
  addStreamShortVideoCommentLocal,
  canSendStreamShortVideoCommentDraftLocal,
  clearStreamShortVideoCommentReplyDraftLocal,
  closeStreamShortVideoCommentsLocal,
  createInitialStreamShortVideoSocialCommentsState,
  hideStreamShortVideoCommentLocal,
  markStreamShortVideoCommentReplyDraftLocal,
  openStreamShortVideoCommentsLocal,
  pinStreamShortVideoCommentLocal,
  prepareStreamShortVideoSocialShareDraftLocal,
  queueStreamShortVideoCommentsLocalEvent,
  reportStreamShortVideoCommentLocal,
  requestStreamShortVideoCommentsProviderBlocked,
  selectStreamShortVideoCommentLocal,
  toggleStreamShortVideoCommentLikeLocal,
  type StreamShortVideoLocalComment,
  type StreamShortVideoSocialCommentsState,
  toggleStreamShortVideoSocialLikeLocal,
  toggleStreamShortVideoSocialSaveLocal,
} from "./streamShortVideoSocialCommentsRuntime";
import { runStreamShortVideoProductionUiSmokeCheck } from "./streamShortVideoProductionUiSmokeRuntime";
import {
  buildStreamShortVideoRealMobileInteractionQaEvidence,
  createInitialStreamShortVideoRealMobileInteractionQaState,
  markStreamShortVideoMobileInteractionActionLocal,
  queueStreamShortVideoMobileInteractionQaCheck,
  requestStreamShortVideoMobileInteractionProviderBlocked,
  type StreamShortVideoRealMobileInteractionQaActionId,
} from "./streamShortVideoRealMobileInteractionQaRuntime";
import {
  buildStreamShortVideoSocialFinalBehaviorEvidence,
  type StreamShortVideoSocialFinalBehaviorActionId,
} from "./streamShortVideoSocialFinalBehaviorRuntime";
import {
  closeStreamShortVideoShareSaveSheetLocal,
  createInitialStreamShortVideoShareSaveBehaviorState,
  markStreamShortVideoNativeShareRequestedLocal,
  markStreamShortVideoRemovedFromLocalSaved,
  markStreamShortVideoSavedToLocalCollection,
  markStreamShortVideoShareTextCopiedLocal,
  openStreamShortVideoShareOptionsLocal,
  requestStreamShortVideoShareSaveProviderBlocked,
  type StreamShortVideoShareSaveBehaviorEvidence,
  type StreamShortVideoShareSaveCollection,
  type StreamShortVideoShareSaveSheetMode,
} from "./streamShortVideoShareSaveBehaviorRuntime";

import {
  commitStreamShortVideoPickedLocalAsset,
  createInitialStreamShortVideoRecordUploadSourceFlowState,
  markStreamShortVideoPickedAssetTimelineBound,
  markStreamShortVideoRecordUploadCancelled,
  markStreamShortVideoRecordUploadPermissionBlocked,
  markStreamShortVideoRecordUploadPermissionRequested,
  markStreamShortVideoRecordUploadPickerOpened,
  queueStreamShortVideoRecordUploadSourceFlowEvent,
  requestStreamShortVideoRecordUploadSourceProviderBlocked,
  runStreamShortVideoRecordUploadSourceFlowCheck,
  selectStreamShortVideoRecordUploadSourceFlow,
  type StreamShortVideoPickedLocalAssetInput,
  type StreamShortVideoRecordUploadSourceKind,
} from "./streamShortVideoRecordUploadSourceFlowRuntime";

import {
  bindStreamShortVideoSourcePreviewPlaybackAssetLocal,
  createInitialStreamShortVideoSourcePreviewPlaybackState,
  cycleStreamShortVideoSourcePreviewSpeedLocal,
  markStreamShortVideoSourcePreviewReadyLocal,
  pauseStreamShortVideoSourcePreviewLocal,
  playStreamShortVideoSourcePreviewLocal,
  queueStreamShortVideoSourcePreviewPlaybackEvent,
  requestStreamShortVideoSourcePreviewProviderBlocked,
  restartStreamShortVideoSourcePreviewLocal,
  runStreamShortVideoSourcePreviewPlaybackCheck,
  syncStreamShortVideoSourcePreviewPlaybackStatusLocal,
  toggleStreamShortVideoSourcePreviewLoopLocal,
  toggleStreamShortVideoSourcePreviewMuteLocal,
} from "./streamShortVideoSourcePreviewPlaybackRuntime";
import { buildStreamShortVideoSelectedPreviewQaEvidence } from "./streamShortVideoSelectedPreviewQaRuntime";

import {
  bindStreamShortVideoTrimCropCoverFrameAssetLocal,
  createInitialStreamShortVideoTrimCropCoverFrameState,
  cycleStreamShortVideoCropPresetLocal,
  cycleStreamShortVideoCropZoomLocal,
  markStreamShortVideoTrimCropReviewCoverBoundLocal,
  markStreamShortVideoTrimCropTimelineBoundLocal,
  nudgeStreamShortVideoCoverFrameLocal,
  nudgeStreamShortVideoCropXLocal,
  nudgeStreamShortVideoCropYLocal,
  nudgeStreamShortVideoTrimEndLocal,
  nudgeStreamShortVideoTrimStartLocal,
  queueStreamShortVideoTrimCropCoverFrameEvent,
  requestStreamShortVideoTrimCropCoverFrameProviderBlocked,
  resetStreamShortVideoTrimLocal,
  runStreamShortVideoTrimCropCoverFrameCheck,
} from "./streamShortVideoTrimCropCoverFrameRuntime";

import {
  addStreamShortVideoCaptionTextOverlayLocal,
  bindStreamShortVideoCaptionTextOverlayAssetLocal,
  createInitialStreamShortVideoCaptionTextOverlayState,
  cycleSelectedStreamShortVideoCaptionAlignLocal,
  cycleSelectedStreamShortVideoCaptionBackdropLocal,
  cycleSelectedStreamShortVideoCaptionColorLocal,
  cycleSelectedStreamShortVideoCaptionFontSizeLocal,
  cycleSelectedStreamShortVideoCaptionPlacementLocal,
  markStreamShortVideoCaptionTextOverlayReviewBoundLocal,
  markStreamShortVideoCaptionTextOverlayTimelineBoundLocal,
  nudgeSelectedStreamShortVideoCaptionXLocal,
  nudgeSelectedStreamShortVideoCaptionYLocal,
  queueStreamShortVideoCaptionTextOverlayEvent,
  removeSelectedStreamShortVideoCaptionTextOverlayLocal,
  requestStreamShortVideoCaptionTextOverlayProviderBlocked,
  runStreamShortVideoCaptionTextOverlayCheck,
  selectStreamShortVideoCaptionTextOverlayLocal,
  shiftSelectedStreamShortVideoCaptionEndLocal,
  shiftSelectedStreamShortVideoCaptionStartLocal,
  updateSelectedStreamShortVideoCaptionTextOverlayLocal,
} from "./streamShortVideoCaptionTextOverlayRuntime";


import {
  addStreamShortVideoUsefulOverlayLocal,
  bindStreamShortVideoUsefulOverlayAssetLocal,
  createInitialStreamShortVideoUsefulOverlayEditorState,
  cycleSelectedStreamShortVideoUsefulOverlayKindLocal,
  cycleSelectedStreamShortVideoUsefulOverlayLayerLocal,
  cycleSelectedStreamShortVideoUsefulOverlayOpacityLocal,
  cycleSelectedStreamShortVideoUsefulOverlayShapeLocal,
  cycleSelectedStreamShortVideoUsefulOverlayToneLocal,
  markStreamShortVideoUsefulOverlayReviewBoundLocal,
  markStreamShortVideoUsefulOverlayTimelineBoundLocal,
  nudgeSelectedStreamShortVideoUsefulOverlayRotationLocal,
  nudgeSelectedStreamShortVideoUsefulOverlayScaleLocal,
  nudgeSelectedStreamShortVideoUsefulOverlayXLocal,
  nudgeSelectedStreamShortVideoUsefulOverlayYLocal,
  queueStreamShortVideoUsefulOverlayEditorEvent,
  removeSelectedStreamShortVideoUsefulOverlayLocal,
  requestStreamShortVideoUsefulOverlayProviderBlocked,
  runStreamShortVideoUsefulOverlayEditorCheck,
  selectStreamShortVideoUsefulOverlayLocal,
  shiftSelectedStreamShortVideoUsefulOverlayEndLocal,
  shiftSelectedStreamShortVideoUsefulOverlayStartLocal,
  updateSelectedStreamShortVideoUsefulOverlayLabelLocal,
} from "./streamShortVideoUsefulOverlayEditorRuntime";

import {
  createInitialStreamShortVideoFeedAcceptanceState,
  queueStreamShortVideoFeedAcceptanceEvent,
  requestStreamShortVideoFeedAcceptanceProviderBlocked,
  reviewSelectedStreamShortVideoFeedAcceptanceCheck,
  runStreamShortVideoFeedAcceptanceGate,
  selectStreamShortVideoFeedAcceptanceCheck,
  type StreamShortVideoFeedAcceptanceCheckId,
} from "./streamShortVideoFeedAcceptanceRuntime";

import {
  createInitialStreamShortVideoFinalSmokeState,
  queueStreamShortVideoFinalSmokeEvent,
  requestStreamShortVideoFinalSmokeProviderBlocked,
  reviewSelectedStreamShortVideoFinalSmokeCheck,
  reviewStreamShortVideoProfileSetupHandoff,
  runStreamShortVideoFinalSmokeChecklist,
  selectStreamShortVideoFinalSmokeCheck,
  type StreamShortVideoFinalSmokeCheckId,
} from "./streamShortVideoFinalSmokeChecklistRuntime";

import {
  createInitialStreamShortVideoPublishReadinessState,
  queueStreamShortVideoPublishReadinessEvent,
  requestStreamShortVideoPublishProviderBlocked,
  reviewSelectedStreamShortVideoPublishReadinessCheck,
  runStreamShortVideoPublishReadinessGate,
  selectStreamShortVideoPublishReadinessCheck,
  type StreamShortVideoPublishReadinessCheckId,
} from "./streamShortVideoPublishReadinessRuntime";

type IconName = keyof typeof Ionicons.glyphMap;

const sourceIntents: readonly { readonly id: StreamShortVideoSourceIntent; readonly label: string; readonly icon: IconName }[] = [
  { id: "camera", label: "Камера", icon: "camera-outline" },
  { id: "upload", label: "Загрузка", icon: "cloud-upload-outline" },
  { id: "editor", label: "Редактор", icon: "cut-outline" },
  { id: "cover", label: "Обложка", icon: "image-outline" },
  { id: "captions", label: "Текст", icon: "text-outline" },
];

const visibilities: readonly { readonly id: StreamShortVideoVisibility; readonly label: string }[] = [
  { id: "public", label: "Публично" },
  { id: "followers", label: "Подписчики" },
  { id: "private", label: "Приватно" },
  { id: "business_only", label: "Бизнес" },
];

const timelineClipKinds: readonly { readonly id: StreamShortVideoTimelineClipKind; readonly label: string; readonly icon: IconName }[] = [
  { id: "camera_segment", label: "Клип камеры", icon: "videocam-outline" },
  { id: "uploaded_segment", label: "Загруженный клип", icon: "cloud-upload-outline" },
  { id: "text_overlay", label: "Текст", icon: "text-outline" },
  { id: "audio_note", label: "Аудио", icon: "musical-notes-outline" },
];

const sourceControls: readonly { readonly id: StreamShortVideoSourceId; readonly label: string; readonly icon: IconName }[] = [
  { id: "camera_capture", label: "Камера", icon: "camera-outline" },
  { id: "library_upload", label: "Загрузка", icon: "cloud-upload-outline" },
  { id: "editor_workspace", label: "Редактор", icon: "cut-outline" },
  { id: "cover_picker", label: "Обложка", icon: "image-outline" },
  { id: "caption_track", label: "Текст", icon: "text-outline" },
];

const reviewControls: readonly { readonly id: StreamShortVideoReviewItemId; readonly label: string; readonly icon: IconName }[] = [
  { id: "cover_frame", label: "Обложка", icon: "image-outline" },
  { id: "caption_track", label: "Текст", icon: "text-outline" },
  { id: "language_caption_review", label: "Язык", icon: "language-outline" },
  { id: "content_policy_review", label: "Правила", icon: "shield-checkmark-outline" },
  { id: "media_review", label: "Медиа", icon: "film-outline" },
  { id: "publish_handoff_review", label: "Передача", icon: "lock-closed-outline" },
];

const publishReadinessControls: readonly { readonly id: StreamShortVideoPublishReadinessCheckId; readonly label: string; readonly icon: IconName }[] = [
  { id: "draft_metadata", label: "Черновик", icon: "document-text-outline" },
  { id: "source_intent", label: "Источник", icon: "videocam-outline" },
  { id: "timeline_editor", label: "Монтаж", icon: "cut-outline" },
  { id: "cover_captions_review", label: "Обложка/текст", icon: "image-outline" },
  { id: "content_policy_review", label: "Правила", icon: "shield-checkmark-outline" },
  { id: "local_event_evidence", label: "Проверка", icon: "git-branch-outline" },
  { id: "publish_handoff_review", label: "Передача", icon: "lock-closed-outline" },
  { id: "provider_admin_handoff", label: "Провайдер/админ", icon: "cloud-offline-outline" },
];

const effectToolControls: readonly { readonly id: StreamShortVideoEffectToolId; readonly label: string; readonly icon: IconName }[] = [
  { id: "filter_cinematic", label: "Кино", icon: "color-filter-outline" },
  { id: "filter_warm", label: "Тёплый", icon: "color-palette-outline" },
  { id: "filter_clean", label: "Чистый", icon: "aperture-outline" },
  { id: "beauty_soft", label: "Красота", icon: "happy-outline" },
  { id: "stabilization", label: "Стабилизация", icon: "pulse-outline" },
  { id: "crop_9_16", label: "9:16", icon: "resize-outline" },
  { id: "speed_curve", label: "Скорость", icon: "speedometer-outline" },
  { id: "text_overlay", label: "Текст", icon: "text-outline" },
  { id: "transition_soft", label: "Обрезка", icon: "git-compare-outline" },
];

const audioToolControls: readonly { readonly id: StreamShortVideoAudioToolId; readonly label: string; readonly icon: IconName }[] = [
  { id: "mp3_import", label: "MP3", icon: "musical-notes-outline" },
  { id: "music_trim", label: "Обрезка", icon: "cut-outline" },
  { id: "original_audio_mute", label: "Без оригинала", icon: "volume-mute-outline" },
  { id: "audio_volume_balance", label: "Громкость", icon: "volume-high-outline" },
  { id: "voiceover_intent", label: "Голос", icon: "mic-outline" },
  { id: "beat_sync", label: "Бит", icon: "pulse-outline" },
];

const audioPremiumWaveBars = [34, 58, 42, 76, 52, 68, 38, 62, 48, 72, 44, 56] as const;

type ShortVideoActionFeedbackKind = "idle" | "local" | "locked";
type ShortVideoActionFeedbackListener = (sequence: number) => void;

let shortVideoActionFeedbackSequence = 0;
const shortVideoActionFeedbackListeners = new Set<ShortVideoActionFeedbackListener>();

function emitShortVideoActionFeedbackSequence(sequence: number): void {
  shortVideoActionFeedbackListeners.forEach((listener) => listener(sequence));
}

function resetShortVideoActionFeedbackLocal(): void {
  const sequence = shortVideoActionFeedbackSequence + 1;
  shortVideoActionFeedbackSequence = sequence;
  emitShortVideoActionFeedbackSequence(sequence);
}

function getShortVideoActionFeedbackLabel(kind: ShortVideoActionFeedbackKind): string {
  if (kind === "locked") return "закрыто";
  if (kind === "local") return "готово";
  return "";
}

function useShortVideoActionFeedback(locked: boolean): readonly [ShortVideoActionFeedbackKind, () => void] {
  const [feedback, setFeedback] = useState<ShortVideoActionFeedbackKind>("idle");
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackSequenceRef = useRef(0);

  const clearFeedbackTimer = () => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  };

  useEffect(() => {
    const listener: ShortVideoActionFeedbackListener = (sequence) => {
      if (feedbackSequenceRef.current === sequence) return;
      clearFeedbackTimer();
      setFeedback("idle");
    };
    shortVideoActionFeedbackListeners.add(listener);

    return () => {
      shortVideoActionFeedbackListeners.delete(listener);
      clearFeedbackTimer();
    };
  }, []);

  const showFeedback = () => {
    const sequence = shortVideoActionFeedbackSequence + 1;
    shortVideoActionFeedbackSequence = sequence;
    feedbackSequenceRef.current = sequence;
    emitShortVideoActionFeedbackSequence(sequence);
    clearFeedbackTimer();
    setFeedback(locked ? "locked" : "local");
    feedbackTimerRef.current = setTimeout(() => {
      feedbackTimerRef.current = null;
      if (feedbackSequenceRef.current === sequence) setFeedback("idle");
    }, 950);
  };

  return [feedback, showFeedback] as const;
}

function MiniAction({ icon, label, onPress, locked = false, disabled = false, disabledFeedbackLabel = "закрыто", disabledHint = "Сначала выбери слой эффекта в стеке." }: { readonly icon: IconName; readonly label: string; readonly onPress: () => void; readonly locked?: boolean; readonly disabled?: boolean; readonly disabledFeedbackLabel?: string; readonly disabledHint?: string }) {
  const feedbackLocked = locked || disabled;
  const [feedback, showFeedback] = useShortVideoActionFeedback(feedbackLocked);
  const feedbackLabel = feedback === "locked" && disabled ? disabledFeedbackLabel : getShortVideoActionFeedbackLabel(feedback);

  const handlePress = () => {
    if (!disabled) onPress();
    showFeedback();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={feedback === "idle" ? label : `${label}: ${feedbackLabel}`}
      accessibilityHint={disabled ? disabledHint : locked ? "Функция закрыта до подключения провайдера, нажатие покажет безопасное состояние." : "Локальное действие Shorts."}
      accessibilityState={locked || disabled ? { disabled: true } : undefined}
      hitSlop={6}
      style={({ pressed }) => [styles.action, locked || disabled ? styles.actionLocked : null, pressed ? styles.actionPressed : null]}
      onPress={handlePress}
    >
      <Ionicons name={icon} size={14} color={locked || disabled ? "#8D8796" : "#F2C75B"} />
      <Text style={[styles.actionText, locked || disabled ? styles.actionTextLocked : null]} numberOfLines={2}>{label}</Text>
      <Text pointerEvents="none" style={[styles.actionFeedbackText, feedback === "idle" ? styles.actionFeedbackTextHidden : null, locked || disabled ? styles.actionFeedbackTextLocked : null]} numberOfLines={1}>{feedbackLabel || " "}</Text>
    </Pressable>
  );
}

function PremiumSocialButton({ icon, label, active, count, onPress }: { readonly icon: IconName; readonly label: string; readonly active?: boolean; readonly count?: number; readonly onPress: () => void }) {
  return (
    <Pressable style={[styles.premiumSocialButton, active ? styles.premiumSocialButtonActive : null]} onPress={onPress}>
      <Ionicons name={icon} size={18} color={active ? "#0B0910" : "#FFFFFF"} />
      {typeof count === "number" && count > 0 ? <Text style={styles.premiumSocialCounter}>{count}</Text> : null}
      <Text style={[styles.premiumSocialText, active ? styles.premiumSocialTextActive : null]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

function ViewerSocialButton({ icon, label, active, count, onPress, accessibilityLabel, disabled, disabledHint, compact = false, veryCompact = false }: { readonly icon: IconName; readonly label: string; readonly active?: boolean; readonly count?: number; readonly onPress: () => void; readonly accessibilityLabel?: string; readonly disabled?: boolean; readonly disabledHint?: string; readonly compact?: boolean; readonly veryCompact?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={disabled ? `${accessibilityLabel ?? label}: выбери черновик` : accessibilityLabel ?? label}
      accessibilityHint={disabledHint}
      accessibilityState={disabled ? { disabled: true } : active ? { selected: true } : undefined}
      hitSlop={veryCompact ? 6 : 10}
      style={[
        styles.viewerSocialButton,
        compact ? styles.viewerSocialButtonCompact : null,
        veryCompact ? styles.viewerSocialButtonVeryCompact : null,
        active && !disabled ? styles.viewerSocialButtonActive : null,
        disabled ? { opacity: 0.46 } : null,
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <Ionicons name={icon} size={veryCompact ? 19 : compact ? 21 : 24} color={active && !disabled ? "#0B0910" : disabled ? "#8D8796" : "#FFFFFF"} />
      {typeof count === "number" && count > 0 ? <Text style={[styles.viewerSocialCounter, veryCompact ? styles.viewerSocialCounterVeryCompact : null]}>{count}</Text> : null}
    </Pressable>
  );
}

function SettingsHubButton({ icon, label, meta, active, onPress }: { readonly icon: IconName; readonly label: string; readonly meta: string; readonly active?: boolean; readonly onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={`${label}: ${meta}`}
      accessibilityState={active ? { selected: true } : undefined}
      hitSlop={6}
      style={({ pressed }) => [
        styles.settingsHubButton,
        active ? styles.settingsHubButtonActive : null,
        pressed ? styles.settingsHubButtonPressed : null,
      ]}
      onPress={onPress}
    >
      <View style={[styles.settingsHubIcon, active ? styles.settingsHubIconActive : null]}>
        <Ionicons name={icon} size={16} color={active ? "#0B0910" : "#F2C75B"} />
      </View>
      <View style={styles.settingsHubText}>
        <Text style={[styles.settingsHubLabel, active ? styles.settingsHubLabelActive : null]} numberOfLines={1}>{label}</Text>
        <Text style={[styles.settingsHubMeta, active ? styles.settingsHubMetaActive : null]} numberOfLines={2}>{meta}</Text>
      </View>
    </Pressable>
  );
}

function SettingsPremiumAction({ icon, label, onPress, primary = false, locked = false, disabled = false, disabledFeedbackLabel = "закрыто", disabledHint = "Сначала выбери слой эффекта в стеке." }: { readonly icon: IconName; readonly label: string; readonly onPress: () => void; readonly primary?: boolean; readonly locked?: boolean; readonly disabled?: boolean; readonly disabledFeedbackLabel?: string; readonly disabledHint?: string }) {
  const feedbackLocked = locked || disabled;
  const [feedback, showFeedback] = useShortVideoActionFeedback(feedbackLocked);
  const feedbackLabel = feedback === "locked" && disabled ? disabledFeedbackLabel : getShortVideoActionFeedbackLabel(feedback);

  const handlePress = () => {
    if (!disabled) onPress();
    showFeedback();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={feedback === "idle" ? label : `${label}: ${feedbackLabel}`}
      accessibilityState={locked || disabled ? { disabled: true } : undefined}
      accessibilityHint={disabled ? disabledHint : locked ? "Функция закрыта до подключения провайдера." : "Локальное действие Shorts."}
      style={({ pressed }) => [
        styles.settingsPremiumAction,
        primary ? styles.settingsPremiumActionPrimary : null,
        locked || disabled ? styles.settingsPremiumActionLocked : null,
        pressed ? styles.settingsPremiumActionPressed : null,
      ]}
      onPress={handlePress}
    >
      <Ionicons name={icon} size={13} color={primary && !disabled && !locked ? "#0B0910" : locked || disabled ? "#8D8796" : "#F2C75B"} />
      <Text style={[styles.settingsPremiumActionText, primary && !disabled && !locked ? styles.settingsPremiumActionTextPrimary : null, locked || disabled ? styles.settingsPremiumActionTextLocked : null]} numberOfLines={2}>{label}</Text>
      <Text pointerEvents="none" style={[styles.settingsPremiumActionFeedbackText, feedback === "idle" ? styles.settingsPremiumActionFeedbackTextHidden : null, primary && !locked && !disabled ? styles.settingsPremiumActionFeedbackTextPrimary : null, locked || disabled ? styles.settingsPremiumActionFeedbackTextLocked : null]} numberOfLines={1}>{feedbackLabel || " "}</Text>
    </Pressable>
  );
}

function SettingsPremiumFocusCard({ icon, eyebrow, title, description, status, children }: { readonly icon: IconName; readonly eyebrow: string; readonly title: string; readonly description: string; readonly status: string; readonly children: React.ReactNode }) {
  return (
    <View style={styles.settingsPremiumFocusCard}>
      <View style={styles.settingsPremiumFocusHeader}>
        <View style={styles.settingsPremiumFocusIcon}>
          <Ionicons name={icon} size={18} color="#0B0910" />
        </View>
        <View style={styles.settingsPremiumFocusText}>
          <Text style={styles.settingsPremiumFocusEyebrow} numberOfLines={1}>{eyebrow}</Text>
          <Text style={styles.settingsPremiumFocusTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.settingsPremiumFocusDescription} numberOfLines={2}>{description}</Text>
        </View>
        <View style={styles.settingsPremiumFocusStatus}>
          <Text style={styles.settingsPremiumFocusStatusText} numberOfLines={1}>{status}</Text>
        </View>
      </View>
      <View style={styles.settingsPremiumActionRow}>
        {children}
      </View>
    </View>
  );
}

function ReviewPremiumStepCard({ icon, title, meta, ready, actionLabel, onPress, locked = false }: { readonly icon: IconName; readonly title: string; readonly meta: string; readonly ready: boolean; readonly actionLabel: string; readonly onPress: () => void; readonly locked?: boolean }) {
  const [feedback, showFeedback] = useShortVideoActionFeedback(locked);
  const feedbackLabel = getShortVideoActionFeedbackLabel(feedback);
  const visibleActionLabel = feedback !== "idle" ? feedbackLabel : ready ? "Готово" : actionLabel;

  const handlePress = () => {
    onPress();
    showFeedback();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${feedback !== "idle" ? feedbackLabel : ready ? "готово" : actionLabel}`}
      accessibilityState={ready ? { selected: true } : locked ? { disabled: true } : undefined}
      style={({ pressed }) => [
        styles.reviewPremiumStepCard,
        ready ? styles.reviewPremiumStepCardReady : null,
        locked ? styles.reviewPremiumStepCardLocked : null,
        pressed ? styles.reviewPremiumStepCardPressed : null,
      ]}
      onPress={handlePress}
    >
      <View style={[styles.reviewPremiumStepIcon, ready ? styles.reviewPremiumStepIconReady : null, locked ? styles.reviewPremiumStepIconLocked : null]}>
        <Ionicons name={ready ? "checkmark-circle" : icon} size={17} color={ready ? "#0B0910" : locked ? "#8D8796" : "#F2C75B"} />
      </View>
      <View style={styles.reviewPremiumStepText}>
        <Text style={[styles.reviewPremiumStepTitle, ready ? styles.reviewPremiumStepTitleReady : null, locked ? styles.reviewPremiumStepTitleLocked : null]} numberOfLines={1}>{title}</Text>
        <Text style={[styles.reviewPremiumStepMeta, ready ? styles.reviewPremiumStepMetaReady : null]} numberOfLines={2}>{meta}</Text>
      </View>
      <View style={[styles.reviewPremiumStepAction, ready ? styles.reviewPremiumStepActionReady : null, feedback === "locked" ? styles.reviewPremiumStepActionLockedFeedback : null]}>
        <Text style={[styles.reviewPremiumStepActionText, ready ? styles.reviewPremiumStepActionTextReady : null, feedback === "locked" ? styles.reviewPremiumStepActionTextLockedFeedback : null]} numberOfLines={1}>{visibleActionLabel}</Text>
      </View>
    </Pressable>
  );
}



function formatShortsEffectPurposeLabel(id: StreamShortVideoEffectToolId | undefined): string {
  switch (id) {
    case "filter_cinematic":
      return "Мягкий кинематографичный вид без лишних элементов.";
    case "filter_warm":
      return "Тёплый цвет для живого и приятного видео.";
    case "filter_clean":
      return "Чистый естественный вид без перегруза.";
    case "beauty_soft":
      return "Лёгкое улучшение лица без сильной обработки.";
    case "stabilization":
      return "Стабилизация движения для более ровного шорта.";
    case "crop_9_16":
      return "Вертикальная подгонка кадра под формат шорта.";
    case "speed_curve":
      return "Настройка скорости для динамичного момента.";
    case "text_overlay":
      return "Связать текст с видео и проверкой.";
    case "transition_soft":
      return "Мягкий переход и аккуратная обрезка.";
    default:
      return "Выбери стиль для этого шорта.";
  }
}


function formatShortsCropPresetLabel(value: unknown): string {
  const text = String(value ?? "").toLowerCase();
  const dictionary: Record<string, string> = {
    original: "оригинал",
    vertical: "вертикально",
    square: "квадрат",
    portrait: "портрет",
    landscape: "горизонтально",
    fit: "по размеру",
    fill: "заполнить",
  };
  return dictionary[text] ?? (text.replace(/_/g, " ") || "кадр");
}

function formatShortsOverlayKindLabel(value: unknown): string {
  const text = String(value ?? "").toLowerCase();
  const dictionary: Record<string, string> = {
    emoji: "эмодзи",
    label: "надпись",
    badge: "значок",
    arrow: "стрелка",
    highlight: "выделение",
    shape: "форма",
  };
  return dictionary[text] ?? (text.replace(/_/g, " ") || "метка");
}

function formatShortsOverlayLayerLabel(value: unknown): string {
  const text = String(value ?? "").toLowerCase();
  const dictionary: Record<string, string> = {
    front: "передний",
    middle: "средний",
    back: "задний",
    top: "верхний",
    bottom: "нижний",
  };
  return dictionary[text] ?? (text.replace(/_/g, " ") || "слой");
}

function formatShortsUiStatusLabel(value: unknown): string {
  const text = String(value ?? "").trim();
  if (!text) return "не выбрано";
  const normalized = text.toLowerCase();
  const dictionary: Record<string, string> = {
    active: "активно",
    active_local: "активно",
    ready: "готово",
    ready_local: "готово",
    pending: "ожидает",
    pending_local: "ожидает",
    blocked: "закрыто",
    blocked_local: "закрыто",
    paused: "пауза",
    paused_local: "пауза",
    stopped: "остановлено",
    stopped_local: "остановлено",
    draft: "черновик",
    draft_local: "черновик",
    review: "проверка",
    review_local: "проверка",
    review_required: "нужна проверка",
    local: "локально",
    provider: "провайдер",
    provider_blocked: "провайдер закрыт",
    provider_not_configured: "провайдер не подключён",
    final_profile_setup: "подготовка профиля",
    profile_setup: "профиль",
    complete: "готово",
    completed: "готово",
    default: "обычно",
    soft: "мягко",
    clean: "чисто",
    cinematic: "кино",
    warm: "тёплый",
    draft_ready: "черновик готов",
    top: "сверху",
    bottom: "снизу",
    center: "центр",
    left: "слева",
    right: "справа",
    middle: "середина",
    white: "белый",
    black: "чёрный",
    yellow: "жёлтый",
    gold: "золотой",
    transparent: "прозрачный",
    none: "нет",
    strong: "сильно",
    high: "высоко",
    low: "низко",
  };
  if (dictionary[normalized]) return dictionary[normalized];
  return normalized
    .replace(/provider/g, "провайдер")
    .replace(/local/g, "локально")
    .replace(/ready/g, "готово")
    .replace(/active/g, "активно")
    .replace(/pending/g, "ожидает")
    .replace(/blocked/g, "закрыто")
    .replace(/review/g, "проверка")
    .replace(/draft/g, "черновик")
    .replace(/_/g, " ");
}

function getMobileInteractionActionLabel(actionId: StreamShortVideoRealMobileInteractionQaActionId): string {
  switch (actionId) {
    case "settings":
      return "Настройки";
    case "like":
      return "Лайк";
    case "comments":
      return "Комментарии";
    case "share":
      return "Поделиться";
    case "save":
      return "Сохранить";
    case "record_video":
      return "Снять видео";
    case "upload_video":
      return "Загрузить видео";
    case "mp3_audio":
      return "MP3 / Аудио";
    case "effect_apply":
      return "Эффекты";
  }
}


type SabiShortsCameraRecordedAssetInput = {
  readonly uri: string;
  readonly fileName?: string;
  readonly mimeType?: string;
  readonly durationMs?: number | null;
  readonly width?: number | null;
  readonly height?: number | null;
};

function SabiShortsInAppCameraModal({
  visible,
  onClose,
  onRecorded,
}: {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onRecorded: (asset: SabiShortsCameraRecordedAssetInput) => void;
}) {
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [facing, setFacing] = useState<SabiCameraFacing>("back");
  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [clipLimitSeconds, setClipLimitSeconds] = useState<15 | 30 | 60>(60);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [cameraZoom, setCameraZoom] = useState(0);
  const cameraPhoneLayout = getShortVideoPhoneLayoutLocal();
  const cameraSideRailMaxHeight = Math.max(170, Math.min(cameraPhoneLayout.veryCompact ? 246 : 318, Math.floor((cameraPhoneLayout.height || 720) * 0.42)));
  const cameraBottomOffset = cameraPhoneLayout.veryCompact ? 14 : cameraPhoneLayout.compact ? 20 : 30;

  useEffect(() => {
    if (!recording || recordingStartedAt === null) return undefined;
    const updateRecordingTimer = () => {
      setRecordingSeconds(Math.min(clipLimitSeconds, Math.max(0, Math.floor((Date.now() - recordingStartedAt) / 1000))));
    };
    updateRecordingTimer();
    const timer = setInterval(updateRecordingTimer, 350);
    return () => clearInterval(timer);
  }, [clipLimitSeconds, recording, recordingStartedAt]);

  const recordingProgress = clipLimitSeconds > 0 ? Math.min(100, Math.round((recordingSeconds / clipLimitSeconds) * 100)) : 0;
  const recordingTimeLabel = `${String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:${String(recordingSeconds % 60).padStart(2, "0")}`;
  const clipLimitLabel = `${String(Math.floor(clipLimitSeconds / 60)).padStart(2, "0")}:${String(clipLimitSeconds % 60).padStart(2, "0")}`;

  const ensureInAppCameraPermissions = async () => {
    let cameraAllowed = !!cameraPermission?.granted;
    let microphoneAllowed = !!microphonePermission?.granted;

    if (!cameraAllowed) {
      const nextCameraPermission = await requestCameraPermission();
      cameraAllowed = !!nextCameraPermission.granted;
    }

    if (!microphoneAllowed) {
      const nextMicrophonePermission = await requestMicrophonePermission();
      microphoneAllowed = !!nextMicrophonePermission.granted;
    }

    return cameraAllowed && microphoneAllowed;
  };

  const startSabiShortsRecording = async () => {
    if (recording) return;
    setErrorText(null);

    const permissionsReady = await ensureInAppCameraPermissions();
    if (!permissionsReady) {
      setErrorText("Нужно разрешение камеры и микрофона.");
      return;
    }

    const camera = cameraRef.current as CameraView & {
      recordAsync?: (options?: Record<string, unknown>) => Promise<{ uri?: string | null } | undefined>;
      stopRecording?: () => void | Promise<void>;
    };

    if (!camera || typeof camera.recordAsync !== "function" || typeof camera.stopRecording !== "function") {
      setErrorText("Камера Sabi пока не готова в этой сборке.");
      return;
    }

    if (!ready) {
      setErrorText("Камера Sabi запускается. Попробуй ещё раз.");
      return;
    }

    try {
      setRecording(true);
      const startedAt = Date.now();
      setRecordingStartedAt(startedAt);
      setRecordingSeconds(0);
      const result = await camera.recordAsync({ maxDuration: clipLimitSeconds });
      const uri = typeof result?.uri === "string" ? result.uri : "";
      if (!uri) {
        setErrorText("Запись не сохранена.");
        return;
      }
      onRecorded({
        uri,
        fileName: `sabi-short-${startedAt}.mp4`,
        mimeType: "video/mp4",
      });
    } catch (error) {
      const message = error instanceof Error && error.message.trim() ? error.message.trim() : "Не удалось записать видео.";
      setErrorText(message);
    } finally {
      setRecording(false);
      setRecordingStartedAt(null);
    }
  };

  const stopSabiShortsRecording = async () => {
    if (!recording) return;
    try {
      await (cameraRef.current as any)?.stopRecording?.();
    } catch (error) {
      const message = error instanceof Error && error.message.trim() ? error.message.trim() : "Не удалось остановить запись.";
      setErrorText(message);
      setRecording(false);
    }
  };

  const closeSabiShortsCamera = () => {
    if (recording) {
      void stopSabiShortsRecording();
      return;
    }
    setErrorText(null);
    setReady(false);
    setRecordingSeconds(0);
    setRecordingStartedAt(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={closeSabiShortsCamera}>
      <View style={styles.sabiShortsCameraRoot}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          mode="video"
          mute={false}
          enableTorch={facing === "back" && torchEnabled}
          zoom={cameraZoom}
          onCameraReady={() => {
            setReady(true);
            setErrorText(null);
          }}
          onMountError={(event) => {
            const message = String((event as any)?.nativeEvent?.message ?? (event as any)?.message ?? "Не удалось открыть камеру Sabi.");
            setReady(false);
            setErrorText(message);
          }}
        />

        <View pointerEvents="none" style={styles.sabiShortsCameraShadeTop} />
        <View pointerEvents="none" style={styles.sabiShortsCameraShadeBottom} />

        <View pointerEvents="box-none" style={[styles.sabiShortsCameraTopBar, cameraPhoneLayout.compact ? styles.sabiShortsCameraTopBarCompact : null]}>
          <Pressable style={styles.sabiShortsCameraCircleButton} onPress={closeSabiShortsCamera} hitSlop={8} accessibilityRole="button" accessibilityLabel={recording ? "Остановить и закрыть камеру Sabi" : "Закрыть камеру Sabi"}>
            <Ionicons name={recording ? "stop-outline" : "close-outline"} size={24} color="#FFFFFF" />
          </Pressable>
          <View style={styles.sabiShortsCameraTitleBox}>
            <View style={styles.sabiShortsCameraTitleLine}>
              <Text style={styles.sabiShortsCameraEyebrow}>Камера Sabi</Text>
              <View style={[styles.sabiShortsCameraLiveDot, recording ? styles.sabiShortsCameraLiveDotActive : null]} />
            </View>
            <Text style={styles.sabiShortsCameraTitle}>{recording ? "Идёт запись" : ready ? "Готово к записи" : "Запуск камеры"}</Text>
            <Text style={styles.sabiShortsCameraSubTitle} numberOfLines={1}>{recording ? `${recordingTimeLabel} / ${clipLimitLabel}` : `${clipLimitSeconds}с клип · камера Sabi`}</Text>
          </View>
          <Pressable
            style={styles.sabiShortsCameraCircleButton}
            onPress={() => {
              if (recording) return;
              setReady(false);
              setFacing((current) => toggleSabiCameraFacing(current));
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Переключить камеру"
          >
            <Ionicons name="camera-reverse-outline" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {gridEnabled ? (
          <View pointerEvents="none" style={styles.sabiShortsCameraGrid}>
            <View style={[styles.sabiShortsCameraGridLine, styles.sabiShortsCameraGridLineVerticalOne]} />
            <View style={[styles.sabiShortsCameraGridLine, styles.sabiShortsCameraGridLineVerticalTwo]} />
            <View style={[styles.sabiShortsCameraGridLine, styles.sabiShortsCameraGridLineHorizontalOne]} />
            <View style={[styles.sabiShortsCameraGridLine, styles.sabiShortsCameraGridLineHorizontalTwo]} />
          </View>
        ) : null}

        <View pointerEvents="none" style={styles.sabiShortsCameraFocusFrame}>
          <View style={[styles.sabiShortsCameraFocusCorner, styles.sabiShortsCameraFocusCornerTopLeft]} />
          <View style={[styles.sabiShortsCameraFocusCorner, styles.sabiShortsCameraFocusCornerTopRight]} />
          <View style={[styles.sabiShortsCameraFocusCorner, styles.sabiShortsCameraFocusCornerBottomLeft]} />
          <View style={[styles.sabiShortsCameraFocusCorner, styles.sabiShortsCameraFocusCornerBottomRight]} />
        </View>

        <View pointerEvents="box-none" style={[styles.sabiShortsCameraSideTools, { maxHeight: cameraSideRailMaxHeight }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            overScrollMode="never"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.sabiShortsCameraSideToolsContent, cameraPhoneLayout.compact ? styles.sabiShortsCameraSideToolsContentCompact : null]}
          >
            <Pressable style={[styles.sabiShortsCameraToolButton, cameraPhoneLayout.compact ? styles.sabiShortsCameraToolButtonCompact : null, gridEnabled ? styles.sabiShortsCameraToolButtonActive : null]} onPress={() => setGridEnabled((value) => !value)} hitSlop={8} accessibilityRole="button" accessibilityLabel={gridEnabled ? "Скрыть сетку камеры" : "Показать сетку камеры"}>
              <Ionicons name="grid-outline" size={18} color={gridEnabled ? "#0B0910" : "#FFFFFF"} />
              <Text style={[styles.sabiShortsCameraToolText, gridEnabled ? styles.sabiShortsCameraToolTextActive : null]}>Сетка</Text>
            </Pressable>
            <Pressable style={[styles.sabiShortsCameraToolButton, cameraPhoneLayout.compact ? styles.sabiShortsCameraToolButtonCompact : null, torchEnabled ? styles.sabiShortsCameraToolButtonActive : null]} onPress={() => setTorchEnabled((value) => !value)} hitSlop={8} accessibilityRole="button" accessibilityLabel={torchEnabled ? "Выключить свет камеры" : "Включить свет камеры"}>
              <Ionicons name="flashlight-outline" size={18} color={torchEnabled ? "#0B0910" : "#FFFFFF"} />
              <Text style={[styles.sabiShortsCameraToolText, torchEnabled ? styles.sabiShortsCameraToolTextActive : null]}>Свет</Text>
            </Pressable>
            <Pressable style={[styles.sabiShortsCameraToolButton, cameraPhoneLayout.compact ? styles.sabiShortsCameraToolButtonCompact : null]} onPress={() => setCameraZoom((value) => Math.min(0.7, Number((value + 0.1).toFixed(2))))} hitSlop={8} accessibilityRole="button" accessibilityLabel="Увеличить зум камеры">
              <Ionicons name="add-outline" size={18} color="#FFFFFF" />
              <Text style={styles.sabiShortsCameraToolText}>Зум</Text>
            </Pressable>
            <Pressable style={[styles.sabiShortsCameraToolButton, cameraPhoneLayout.compact ? styles.sabiShortsCameraToolButtonCompact : null]} onPress={() => setCameraZoom((value) => Math.max(0, Number((value - 0.1).toFixed(2))))} hitSlop={8} accessibilityRole="button" accessibilityLabel="Уменьшить зум камеры">
              <Ionicons name="remove-outline" size={18} color="#FFFFFF" />
              <Text style={styles.sabiShortsCameraToolText}>{Math.round(cameraZoom * 100)}%</Text>
            </Pressable>
          </ScrollView>
        </View>

        {recording ? (
          <View pointerEvents="none" style={styles.sabiShortsCameraRecordingMeter}>
            <View style={styles.sabiShortsCameraRecordingTrack}>
              <View style={[styles.sabiShortsCameraRecordingProgress, { width: `${recordingProgress}%` }]} />
            </View>
          </View>
        ) : null}

        {errorText ? (
          <View style={styles.sabiShortsCameraErrorCard}>
            <Ionicons name="alert-circle-outline" size={18} color="#F2C75B" />
            <Text style={styles.sabiShortsCameraErrorText} numberOfLines={3}>{errorText}</Text>
          </View>
        ) : null}

        <View pointerEvents="box-none" style={[styles.sabiShortsCameraBottomBar, { bottom: cameraBottomOffset }, cameraPhoneLayout.compact ? styles.sabiShortsCameraBottomBarCompact : null]}>
          <View style={styles.sabiShortsCameraLimitRow}>
            {([15, 30, 60] as const).map((limit) => (
              <Pressable
                key={limit}
                disabled={recording}
                style={[styles.sabiShortsCameraLimitChip, cameraPhoneLayout.compact ? styles.sabiShortsCameraLimitChipCompact : null, clipLimitSeconds === limit ? styles.sabiShortsCameraLimitChipActive : null]}
                onPress={() => setClipLimitSeconds(limit)}
              >
                <Text style={[styles.sabiShortsCameraLimitChipText, clipLimitSeconds === limit ? styles.sabiShortsCameraLimitChipTextActive : null]}>{limit}с</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.sabiShortsCameraStatusPill}>
            <Ionicons name={ready ? "checkmark-circle-outline" : "time-outline"} size={15} color="#F2C75B" />
            <Text style={styles.sabiShortsCameraStatusText}>{recording ? `${recordingTimeLabel} запись` : ready ? "Камера Sabi активна" : "Подготовка"}</Text>
          </View>
          <Pressable
            style={[styles.sabiShortsCameraRecordButton, cameraPhoneLayout.compact ? styles.sabiShortsCameraRecordButtonCompact : null, recording ? styles.sabiShortsCameraRecordButtonActive : null]}
            onPress={() => void (recording ? stopSabiShortsRecording() : startSabiShortsRecording())}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={recording ? "Остановить запись шорта" : "Начать запись шорта"}
          >
            <View style={[styles.sabiShortsCameraRecordInner, recording ? styles.sabiShortsCameraRecordInnerActive : null]} />
          </Pressable>
          <Text style={styles.sabiShortsCameraHint}>{recording ? "Нажми, чтобы остановить и сохранить в шорт" : "Нажми, чтобы снять внутри Sabi"}</Text>
        </View>
      </View>
    </Modal>
  );
}

const SHORT_VIDEO_VIEWER_SWIPE_MIN_DISTANCE_LOCAL = 46;
const SHORT_VIDEO_VIEWER_SWIPE_AXIS_RATIO_LOCAL = 1.12;
const SHORT_VIDEO_VIEWER_SWIPE_TAP_SUPPRESS_MS_LOCAL = 420;
const SHORT_VIDEO_VIEWER_INTERACTIVE_RAIL_WIDTH_LOCAL = 96;
const SHORT_VIDEO_VIEWER_INTERACTIVE_BOTTOM_ZONE_LOCAL = 132;
const SHORT_VIDEO_VIEWER_INTERACTIVE_TOP_ZONE_LOCAL = 84;

function isShortVideoViewerSwipeStartInInteractiveChromeLocal(event: GestureResponderEvent): boolean {
  const touch = event.nativeEvent;
  const window = Dimensions.get("window");
  const rightRailStart = Math.max(0, window.width - SHORT_VIDEO_VIEWER_INTERACTIVE_RAIL_WIDTH_LOCAL);
  const bottomChromeStart = Math.max(0, window.height - SHORT_VIDEO_VIEWER_INTERACTIVE_BOTTOM_ZONE_LOCAL);

  if (touch.pageY <= SHORT_VIDEO_VIEWER_INTERACTIVE_TOP_ZONE_LOCAL) return true;
  if (touch.pageX >= rightRailStart) return true;
  if (touch.pageY >= bottomChromeStart) return true;

  return false;
}

type ShortVideoViewerSwipePointLocal = {
  readonly x: number;
  readonly y: number;
  readonly timestamp: number;
};

function getShortVideoKeyboardInsetLimitLocal(): number {
  const windowHeight = Dimensions.get("window").height;
  if (!Number.isFinite(windowHeight) || windowHeight <= 0) return 360;
  return Math.max(220, Math.min(420, Math.floor(windowHeight * 0.46)));
}

function getShortVideoKeyboardPanelLiftLimitLocal(): number {
  const windowHeight = Dimensions.get("window").height;
  if (!Number.isFinite(windowHeight) || windowHeight <= 0) return 382;
  return Math.max(220, Math.min(420, Math.floor(windowHeight * 0.48)));
}

function readShortVideoKeyboardHeightFromMetricsLocal(): number {
  const metricsGetter = (Keyboard as unknown as { metrics?: () => { height?: number | null } | undefined }).metrics;
  if (typeof metricsGetter !== "function") return 0;

  const metrics = metricsGetter();
  const height = Number(metrics?.height ?? 0);
  return Number.isFinite(height) && height > 0 ? height : 0;
}

type ShortVideoKeyboardEventLocal = {
  readonly endCoordinates?: {
    readonly height?: number | null;
    readonly screenY?: number | null;
  } | null;
};

function readShortVideoKeyboardHeightFromEventLocal(event: ShortVideoKeyboardEventLocal | null | undefined): number {
  const eventHeight = Number(event?.endCoordinates?.height ?? 0);
  const screenY = Number(event?.endCoordinates?.screenY ?? 0);
  const windowHeight = Dimensions.get("window").height;
  const eventHeightLocal = Number.isFinite(eventHeight) && eventHeight > 0 ? eventHeight : 0;
  const screenDerivedHeightLocal = Number.isFinite(screenY) && screenY > 0 && Number.isFinite(windowHeight) && windowHeight > screenY
    ? windowHeight - screenY
    : 0;
  const metricsHeightLocal = readShortVideoKeyboardHeightFromMetricsLocal();

  return Math.max(eventHeightLocal, screenDerivedHeightLocal, metricsHeightLocal);
}


type ShortVideoPhoneLayoutLocal = {
  readonly height: number;
  readonly width: number;
  readonly compact: boolean;
  readonly veryCompact: boolean;
  readonly narrow: boolean;
};

function getShortVideoPhoneLayoutLocal(): ShortVideoPhoneLayoutLocal {
  const window = Dimensions.get("window");
  const height = Number(window.height ?? 0);
  const width = Number(window.width ?? 0);
  return {
    height,
    width,
    compact: Number.isFinite(height) && height > 0 && height < 720,
    veryCompact: Number.isFinite(height) && height > 0 && height < 640,
    narrow: Number.isFinite(width) && width > 0 && width < 380,
  };
}

function getShortVideoSheetMaxHeightLocal(multiplier: number, fallback: number, minHeight: number): number {
  const height = Dimensions.get("window").height;
  if (!Number.isFinite(height) || height <= 0) return fallback;
  return Math.max(minHeight, Math.floor(height * multiplier));
}

function formatShortsPremiumCommentStatus(status: string, deliveredToProvider: boolean): string {
  if (deliveredToProvider) return "Отправлено";
  if (status === "pinned_local") return "Закреплено";
  if (status === "hidden_local") return "Скрыто";
  if (status === "reported_local") return "Жалоба";
  return "Сохранено";
}

function ShortsCommentQuickAction({
  icon,
  label,
  active,
  disabled,
  onPress,
}: {
  readonly icon: IconName;
  readonly label: string;
  readonly active?: boolean;
  readonly disabled?: boolean;
  readonly onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.commentQuickAction,
        active ? styles.commentQuickActionActive : null,
        disabled ? styles.commentQuickActionDisabled : null,
      ]}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      disabled={disabled}
      accessibilityState={{ disabled: Boolean(disabled), selected: Boolean(active) }}
    >
      <Ionicons name={icon} size={13} color={disabled ? "#756D80" : active ? "#0B0910" : "#F2C75B"} />
      <Text
        style={[
          styles.commentQuickActionText,
          active ? styles.commentQuickActionTextActive : null,
          disabled ? styles.commentQuickActionTextDisabled : null,
        ]}
        numberOfLines={1}
      >{label}</Text>
    </Pressable>
  );
}

function ShortsCommentsModal({
  visible,
  comments,
  selectedCommentId,
  draft,
  onDraftChange,
  onSend,
  onClose,
  onLikeComment,
  onPinComment,
  onReplyComment,
  onClearReplyDraft,
  onReportComment,
  onHideComment,
  onSelectComment,
}: {
  readonly visible: boolean;
  readonly comments: readonly StreamShortVideoLocalComment[];
  readonly selectedCommentId: string | null;
  readonly draft: string;
  readonly onDraftChange: (value: string) => void;
  readonly onSend: () => void;
  readonly onClose: () => void;
  readonly onLikeComment: (id: string) => void;
  readonly onPinComment: (id: string) => void;
  readonly onReplyComment: (id: string) => void;
  readonly onClearReplyDraft: (id: string) => void;
  readonly onReportComment: (id: string) => void;
  readonly onHideComment: (id: string) => void;
  readonly onSelectComment: (id: string) => void;
}) {
  const visibleComments = comments.filter((comment) => comment.status !== "hidden_local");
  const visibleCommentsCount = visibleComments.length;
  const hiddenEvidenceCount = comments.filter((comment) => comment.status === "hidden_local").length;
  const reportedEvidenceCount = comments.filter((comment) => comment.status === "reported_local").length;
  const hasHiddenOnlyEvidence = visibleComments.length === 0 && hiddenEvidenceCount > 0;
  const canSendCommentDraft = canSendStreamShortVideoCommentDraftLocal({ comments, commentsOpenLocal: visible }, draft);
  const commentSendIconColor = canSendCommentDraft ? "#0B0910" : "#756D80";
  const pinnedCount = comments.filter((comment) => comment.status === "pinned_local").length;
  const likedCount = comments.filter((comment) => comment.status !== "hidden_local" && comment.likedLocal).length;
  const activeReplyDraftComment = visibleComments.find(
    (comment) => comment.replyDraftLocal && (comment.status === "local_only" || comment.status === "pinned_local"),
  ) ?? null;
  const activeReplyDraftCommentSelected = activeReplyDraftComment ? activeReplyDraftComment.id === selectedCommentId : false;
  const activeReplyDraftClearDisabled = activeReplyDraftComment ? !activeReplyDraftCommentSelected : true;
  const composerPlaceholder = activeReplyDraftComment ? "Написать ответ..." : "Написать комментарий...";
  const [keyboardBottomInset, setKeyboardBottomInset] = useState(0);
  const [commentInputHeight, setCommentInputHeight] = useState(42);
  const commentsListRef = useRef<ScrollView | null>(null);
  const commentInputRef = useRef<TextInput | null>(null);
  const commentSubmitFocusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commentsVisibleRef = useRef(visible);

  const clearCommentSubmitFocusTimerLocal = () => {
    if (commentSubmitFocusTimerRef.current) {
      clearTimeout(commentSubmitFocusTimerRef.current);
      commentSubmitFocusTimerRef.current = null;
    }
  };

  const applyCommentKeyboardInsetLocal = (height: number) => {
    const nextInset = Math.max(0, height);
    setKeyboardBottomInset(Math.min(nextInset, getShortVideoKeyboardInsetLimitLocal()));
  };

  const syncCommentKeyboardInsetFromMetricsLocal = () => {
    const keyboardHeight = readShortVideoKeyboardHeightFromMetricsLocal();
    if (keyboardHeight > 0) applyCommentKeyboardInsetLocal(keyboardHeight);
  };

  const resetCommentKeyboardInsetIfClosedLocal = () => {
    setTimeout(() => {
      if (!commentsVisibleRef.current) return;
      if (readShortVideoKeyboardHeightFromMetricsLocal() <= 0) {
        setKeyboardBottomInset(0);
      }
    }, 90);
  };

  useEffect(() => {
    commentsVisibleRef.current = visible;
    if (!visible) {
      clearCommentSubmitFocusTimerLocal();
    }

    return () => {
      clearCommentSubmitFocusTimerLocal();
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || draft.trim().length === 0) {
      setCommentInputHeight(42);
    }
  }, [draft, visible]);

  useEffect(() => {
    if (!visible) {
      setKeyboardBottomInset(0);
      setCommentInputHeight(42);
      return;
    }

    const resetKeyboardInset = () => setKeyboardBottomInset(0);
    const willShowSubscription = Keyboard.addListener("keyboardWillShow", (event) => {
      applyCommentKeyboardInsetLocal(readShortVideoKeyboardHeightFromEventLocal(event));
    });
    const showSubscription = Keyboard.addListener("keyboardDidShow", (event) => {
      applyCommentKeyboardInsetLocal(readShortVideoKeyboardHeightFromEventLocal(event));
    });
    const willHideSubscription = Keyboard.addListener("keyboardWillHide", resetKeyboardInset);
    const hideSubscription = Keyboard.addListener("keyboardDidHide", resetKeyboardInset);

    return () => {
      willShowSubscription.remove();
      showSubscription.remove();
      willHideSubscription.remove();
      hideSubscription.remove();
    };
  }, [visible]);

  const keyboardOpen = keyboardBottomInset > 0;
  const commentsPhoneLayout = getShortVideoPhoneLayoutLocal();
  const commentsSheetMaxHeight = getShortVideoSheetMaxHeightLocal(keyboardOpen ? 0.62 : commentsPhoneLayout.veryCompact ? 0.72 : 0.80, keyboardOpen ? 430 : 560, 290);
  const lastVisibleCommentId = visibleComments.length > 0 ? visibleComments[visibleComments.length - 1]?.id ?? "" : "";

  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      commentsListRef.current?.scrollToEnd({ animated: true });
    }, keyboardOpen ? 80 : 140);

    return () => clearTimeout(timer);
  }, [activeReplyDraftComment?.id, keyboardOpen, lastVisibleCommentId, visible, visibleCommentsCount]);

  const updateCommentInputHeightLocal = (height: number) => {
    const nextHeight = Math.min(96, Math.max(42, Math.ceil(height + 4)));
    setCommentInputHeight(nextHeight);
  };

  const submitCommentDraft = () => {
    if (!canSendCommentDraft) return;
    onSend();
    setCommentInputHeight(42);
    clearCommentSubmitFocusTimerLocal();
    commentSubmitFocusTimerRef.current = setTimeout(() => {
      commentSubmitFocusTimerRef.current = null;
      if (!commentsVisibleRef.current) return;
      commentInputRef.current?.focus();
      commentsListRef.current?.scrollToEnd({ animated: true });
    }, 60);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.commentsKeyboardAvoider}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
      <Pressable style={styles.commentsBackdrop} onPress={onClose}>
        <Pressable
          onPressIn={(event) => event.stopPropagation()}
          onPress={(event) => event.stopPropagation()}
          onStartShouldSetResponder={() => true}
          style={[
            styles.commentsSheet,
            commentsPhoneLayout.compact ? styles.commentsSheetCompact : null,
            keyboardOpen ? styles.commentsSheetKeyboardOpen : null,
            { maxHeight: commentsSheetMaxHeight },
            keyboardOpen && Platform.OS !== "ios" ? { marginBottom: Math.min(keyboardBottomInset + 8, 86) } : null,
          ]}
        >
          <View style={styles.commentsHandle} />
          <View style={styles.commentsTop}>
            <View style={styles.commentsTitleWrap}>
              <Text style={styles.commentsEyebrow}>Обсуждение шорта</Text>
              <Text style={styles.commentsTitle}>Комментарии</Text>
            </View>
            <View style={styles.commentsHeaderBadge}>
              <Ionicons name="chatbubble-ellipses-outline" size={13} color="#0B0910" />
              <Text style={styles.commentsHeaderBadgeText}>{visibleCommentsCount}</Text>
            </View>
            <Pressable style={styles.commentsClose} onPress={onClose}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={[styles.commentsSummaryRow, keyboardOpen ? styles.commentsSummaryRowKeyboardOpen : null]}>
            <View style={styles.commentsSummaryPill}>
              <Ionicons name="heart-outline" size={13} color="#F2C75B" />
              <Text style={styles.commentsSummaryText}>{likedCount} лайков</Text>
            </View>
            <View style={styles.commentsSummaryPill}>
              <Ionicons name="pin-outline" size={13} color="#F2C75B" />
              <Text style={styles.commentsSummaryText}>{pinnedCount} закреплено</Text>
            </View>
            {hiddenEvidenceCount > 0 ? (
              <View style={styles.commentsSummaryPill}>
                <Ionicons name="eye-off-outline" size={13} color="#F2C75B" />
                <Text style={styles.commentsSummaryText}>{hiddenEvidenceCount} скрыто</Text>
              </View>
            ) : null}
            {reportedEvidenceCount > 0 ? (
              <View style={styles.commentsSummaryPill}>
                <Ionicons name="flag-outline" size={13} color="#F2C75B" />
                <Text style={styles.commentsSummaryText}>{reportedEvidenceCount} жалоб</Text>
              </View>
            ) : null}
            <View style={styles.commentsSummaryPillWide}>
              <Ionicons name="phone-portrait-outline" size={13} color="#F2C75B" />
              <Text style={styles.commentsSummaryText}>Сохранено на телефоне</Text>
            </View>
          </View>

          <ScrollView
            ref={commentsListRef}
            style={[styles.commentsList, keyboardOpen ? styles.commentsListKeyboardOpen : null]}
            contentContainerStyle={[
              styles.commentsListContent,
              keyboardOpen ? styles.commentsListContentKeyboardOpen : null,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            nestedScrollEnabled
            overScrollMode="never"
            onContentSizeChange={() => {
              if (keyboardOpen) commentsListRef.current?.scrollToEnd({ animated: true });
            }}
          >
            {visibleComments.length === 0 ? (
              <View style={styles.commentsEmpty}>
                <View style={styles.commentsEmptyIcon}>
                  <Ionicons name="chatbubbles-outline" size={34} color="#0B0910" />
                </View>
                <Text style={styles.commentsEmptyTitle}>{hasHiddenOnlyEvidence ? "Видимые комментарии скрыты" : "Начни обсуждение"}</Text>
                <Text style={styles.commentsEmptyMeta}>
                  {hasHiddenOnlyEvidence
                    ? "Скрытые комментарии сохранены как moderation evidence. Новый обычный комментарий можно добавить отдельно."
                    : "Напиши первый комментарий. Он сразу появится здесь и будет готов к будущей синхронизации."}
                </Text>
              </View>
            ) : visibleComments.map((comment) => {
              const statusLabel = formatShortsPremiumCommentStatus(comment.status, comment.deliveredToProvider);
              const commentActionEnabled = comment.status === "local_only" || comment.status === "pinned_local";
              const commentActionSelected = commentActionEnabled && comment.id === selectedCommentId;
              const commentActionReady = commentActionEnabled && commentActionSelected;
              const isSelectedComment = commentActionSelected;
              const reportActionEnabled = commentActionReady;
              return (
                <Pressable
                  key={comment.id}
                  style={[
                    styles.commentRow,
                    comment.status === "pinned_local" ? styles.commentRowPinned : null,
                    isSelectedComment ? styles.commentRowSelected : null,
                    !commentActionEnabled ? styles.commentRowEvidence : null,
                  ]}
                  onPress={() => onSelectComment(comment.id)}
                  disabled={!commentActionEnabled}
                  accessibilityState={{ disabled: !commentActionEnabled, selected: isSelectedComment }}
                >
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>{comment.author.slice(0, 1).toUpperCase()}</Text>
                  </View>
                  <View style={styles.commentBubble}>
                    <View style={styles.commentTopLine}>
                      <View style={styles.commentAuthorWrap}>
                        <Text style={styles.commentAuthor}>{comment.author}</Text>
                        <Text style={styles.commentTime}>Сейчас</Text>
                      </View>
                      <View style={styles.commentStatusStack}>
                        <View style={styles.commentStatusPill}>
                          <Text style={styles.commentStatus}>{statusLabel}</Text>
                        </View>
                        {commentActionEnabled ? (
                          <View style={isSelectedComment ? styles.commentSelectedPill : styles.commentSelectHintPill}>
                            <Text style={isSelectedComment ? styles.commentSelectedText : styles.commentSelectHintText}>{isSelectedComment ? "выбран" : "выбери"}</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                    {comment.replyToTextLocal ? (
                      <View style={styles.commentReplyReference}>
                        <Ionicons name="return-down-forward-outline" size={12} color="#F2C75B" />
                        <Text style={styles.commentReplyReferenceText} numberOfLines={1}>ответ на: {comment.replyToTextLocal}</Text>
                      </View>
                    ) : null}
                    <Text style={styles.commentText}>{comment.text}</Text>
                    <View style={styles.commentActions}>
                      <ShortsCommentQuickAction icon={comment.likedLocal ? "heart" : "heart-outline"} label={comment.likedLocal ? "Лайкнут" : "Лайк"} active={comment.likedLocal} disabled={!commentActionReady} onPress={() => onLikeComment(comment.id)} />
                      <ShortsCommentQuickAction icon="return-down-forward-outline" label={comment.replyDraftLocal ? "Ответ готов" : "Ответить"} active={comment.replyDraftLocal} disabled={!commentActionReady} onPress={() => onReplyComment(comment.id)} />
                      <ShortsCommentQuickAction icon="pin-outline" label="Закрепить" active={comment.status === "pinned_local"} disabled={!commentActionReady} onPress={() => onPinComment(comment.id)} />
                      <ShortsCommentQuickAction icon="flag-outline" label="Жалоба" active={comment.status === "reported_local"} disabled={!reportActionEnabled} onPress={() => onReportComment(comment.id)} />
                      <ShortsCommentQuickAction icon="eye-off-outline" label="Скрыть" disabled={!commentActionReady} onPress={() => onHideComment(comment.id)} />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.commentComposerWrap}>
            {activeReplyDraftComment ? (
              <View style={styles.commentReplyDraftBanner} accessibilityLabel={`Ответ к комментарию ${activeReplyDraftComment.author}`}>
                <View style={styles.commentReplyDraftIcon}>
                  <Ionicons name="return-down-forward-outline" size={14} color="#0B0910" />
                </View>
                <View style={styles.commentReplyDraftTextWrap}>
                  <Text style={styles.commentReplyDraftTitle}>{activeReplyDraftCommentSelected ? "Ответ" : "Ответ · выбери комментарий"}</Text>
                  <Text style={styles.commentReplyDraftText} numberOfLines={1}>{activeReplyDraftComment.text}</Text>
                </View>
                <Pressable
                  style={[styles.commentReplyDraftClear, activeReplyDraftClearDisabled ? styles.commentReplyDraftClearDisabled : null]}
                  disabled={activeReplyDraftClearDisabled}
                  onPress={(event) => {
                    event.stopPropagation();
                    if (activeReplyDraftClearDisabled) return;
                    onClearReplyDraft(activeReplyDraftComment.id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={activeReplyDraftClearDisabled ? "Сначала выберите комментарий ответа" : "Отменить ответ"}
                  accessibilityState={{ disabled: activeReplyDraftClearDisabled }}
                >
                  <Ionicons name="close" size={14} color="#40D6B1" />
                </Pressable>
              </View>
            ) : null}
            <View style={[styles.commentComposer, keyboardOpen ? styles.commentComposerKeyboardOpen : null, commentInputHeight > 52 ? styles.commentComposerTall : null]}>
              <TextInput
                ref={commentInputRef}
                value={draft}
                onChangeText={onDraftChange}
                placeholder={composerPlaceholder}
                placeholderTextColor="#8D8796"
                style={[styles.commentInput, { height: commentInputHeight }]}
                maxLength={240}
                multiline
                scrollEnabled={commentInputHeight >= 96}
                returnKeyType="send"
                blurOnSubmit={false}
                submitBehavior="submit"
                onContentSizeChange={(event) => {
                  updateCommentInputHeightLocal(event.nativeEvent.contentSize.height);
                  setTimeout(() => commentsListRef.current?.scrollToEnd({ animated: true }), 40);
                }}
                onFocus={() => {
                  syncCommentKeyboardInsetFromMetricsLocal();
                  setTimeout(() => {
                    syncCommentKeyboardInsetFromMetricsLocal();
                    commentsListRef.current?.scrollToEnd({ animated: true });
                  }, 80);
                }}
                onBlur={resetCommentKeyboardInsetIfClosedLocal}
                onSubmitEditing={submitCommentDraft}
              />
              <Pressable
                style={[
                  styles.commentSend,
                  canSendCommentDraft ? styles.commentSendReady : styles.commentSendDisabled,
                ]}
                onPress={submitCommentDraft}
                disabled={!canSendCommentDraft}
                accessibilityLabel={canSendCommentDraft ? "Отправить комментарий" : "Комментарий нельзя отправить"}
                accessibilityState={{ disabled: !canSendCommentDraft }}
              >
                <Ionicons name="send" size={18} color={commentSendIconColor} />
              </Pressable>
            </View>
            <Text style={[styles.commentComposerHint, keyboardOpen ? styles.commentComposerHintKeyboardOpen : null]}>
              {activeReplyDraftComment ? (activeReplyDraftCommentSelected ? "Ответ сохранится локально" : "Выбери комментарий ответа, чтобы очистить reply-draft.") : "Комментарии работают локально. Онлайн-доставка будет подключена позже."}
            </Text>
          </View>
        </Pressable>
      </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function formatShareSaveCollectionLabel(collection: StreamShortVideoShareSaveCollection | null): string {
  if (collection === "favorites") return "Избранное";
  if (collection === "watch_later") return "Смотреть позже";
  return "Сохранено";
}

function formatShortsVideoSourceDurationLabel(durationMs: number | null): string {
  if (typeof durationMs !== "number" || !Number.isFinite(durationMs) || durationMs <= 0) return "Длительность появится после выбора";
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatShortsVideoSourceSizeLabel(sizeBytes: number | null): string {
  if (typeof sizeBytes !== "number" || !Number.isFinite(sizeBytes) || sizeBytes <= 0) return "Размер файла неизвестен";
  const mb = sizeBytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(mb >= 10 ? 0 : 1)} МБ`;
  const kb = sizeBytes / 1024;
  return `${kb.toFixed(kb >= 10 ? 0 : 1)} КБ`;
}

function formatShortsVideoSourceKindLabel(kind: StreamShortVideoRecordUploadSourceKind): string {
  if (kind === "camera_record") return "Камера Sabi";
  if (kind === "library_video") return "Галерея";
  return "Видео файл";
}

function ShortsVideoSourceSheet({
  visible,
  selectedTitle,
  selectedKind,
  durationMs,
  sizeBytes,
  sourceReady,
  sourceSelectionRequired,
  onClose,
  onRecord,
  onGallery,
  onFile,
  onProviderLocked,
  providerLockedDisabled,
  providerLockedDisabledLabel,
  providerLockedDisabledHint,
}: {
  readonly visible: boolean;
  readonly selectedTitle: string | null;
  readonly selectedKind: StreamShortVideoRecordUploadSourceKind;
  readonly durationMs: number | null;
  readonly sizeBytes: number | null;
  readonly sourceReady: boolean;
  readonly sourceSelectionRequired: boolean;
  readonly onClose: () => void;
  readonly onRecord: () => void;
  readonly onGallery: () => void;
  readonly onFile: () => void;
  readonly onProviderLocked: () => void;
  readonly providerLockedDisabled: boolean;
  readonly providerLockedDisabledLabel: string;
  readonly providerLockedDisabledHint: string;
}) {
  const hasSource = Boolean(selectedTitle);
  const selectedTitleText = hasSource
    ? sourceSelectionRequired
      ? "Выбери источник видео"
      : "Видео выбрано"
    : "Добавить видео в шорт";
  const selectedMetaText = hasSource
    ? sourceSelectionRequired
      ? "Выбери chip источника, чтобы источник считался готовым для предпросмотра и проверки."
      : `${formatShortsVideoSourceKindLabel(selectedKind)} · ${formatShortsVideoSourceDurationLabel(durationMs)} · ${formatShortsVideoSourceSizeLabel(sizeBytes)}`
    : "Сними через камеру Sabi или выбери готовое видео.";
  const sourcePhoneLayout = getShortVideoPhoneLayoutLocal();
  const sourceSheetMaxHeight = getShortVideoSheetMaxHeightLocal(sourcePhoneLayout.veryCompact ? 0.76 : 0.82, 560, 320);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.videoSourceBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.videoSourceSheet, sourcePhoneLayout.compact ? styles.videoSourceSheetCompact : null, { maxHeight: sourceSheetMaxHeight }]}
          onPressIn={(event) => event.stopPropagation()}
          onPress={(event) => event.stopPropagation()}
          onStartShouldSetResponder={() => true}
        >
          <ScrollView
            style={styles.videoSourceScroll}
            contentContainerStyle={[styles.videoSourceScrollContent, sourcePhoneLayout.compact ? styles.videoSourceScrollContentCompact : null]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            overScrollMode="never"
          >
          <View style={styles.videoSourceHeader}>
            <View style={styles.videoSourceIconWrap}>
              <Ionicons name="film-outline" size={20} color="#0B0910" />
            </View>
            <View style={styles.videoSourceTitleWrap}>
              <Text style={styles.videoSourceEyebrow}>Источник видео</Text>
              <Text style={styles.videoSourceTitle} numberOfLines={1}>{selectedTitleText}</Text>
            </View>
            <Pressable style={styles.videoSourceClose} onPress={onClose}>
              <Ionicons name="close" size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.videoSourceSelectedCard}>
            <View style={[styles.videoSourceSelectedDot, sourceReady ? styles.videoSourceSelectedDotReady : null]}>
              <Ionicons name={sourceReady ? "checkmark" : "videocam-outline"} size={16} color={sourceReady ? "#0B0910" : "#F2C75B"} />
            </View>
            <View style={styles.videoSourceSelectedTextWrap}>
              <Text style={styles.videoSourceSelectedTitle} numberOfLines={1}>{selectedTitle || "Видео ещё не выбрано"}</Text>
              <Text style={styles.videoSourceSelectedMeta} numberOfLines={1}>
                {selectedMetaText}
              </Text>
            </View>
          </View>

          <View style={[styles.videoSourceOptionGrid, sourcePhoneLayout.compact ? styles.videoSourceOptionGridCompact : null]}>
            <Pressable style={[styles.videoSourceOptionPrimary, sourcePhoneLayout.compact ? styles.videoSourceOptionCompact : null]} onPress={onRecord} hitSlop={8} accessibilityRole="button" accessibilityLabel="Снять видео камерой Sabi">
              <View style={styles.videoSourceOptionIconPrimary}>
                <Ionicons name="videocam-outline" size={20} color="#0B0910" />
              </View>
              <Text style={styles.videoSourceOptionTitlePrimary}>Камера Sabi</Text>
              <Text style={styles.videoSourceOptionMetaPrimary}>Съёмка внутри приложения</Text>
            </Pressable>
            <Pressable style={[styles.videoSourceOption, sourcePhoneLayout.compact ? styles.videoSourceOptionCompact : null]} onPress={onGallery} hitSlop={8} accessibilityRole="button" accessibilityLabel="Выбрать видео из галереи">
              <View style={styles.videoSourceOptionIcon}>
                <Ionicons name="images-outline" size={18} color="#F2C75B" />
              </View>
              <Text style={styles.videoSourceOptionTitle}>Галерея</Text>
              <Text style={styles.videoSourceOptionMeta}>Выбрать видео с телефона</Text>
            </Pressable>
            <Pressable style={[styles.videoSourceOption, sourcePhoneLayout.compact ? styles.videoSourceOptionCompact : null]} onPress={onFile} hitSlop={8} accessibilityRole="button" accessibilityLabel="Выбрать видео файл">
              <View style={styles.videoSourceOptionIcon}>
                <Ionicons name="document-attach-outline" size={18} color="#F2C75B" />
              </View>
              <Text style={styles.videoSourceOptionTitle}>Видео файл</Text>
              <Text style={styles.videoSourceOptionMeta}>MP4 / MOV / видео</Text>
            </Pressable>
            <Pressable style={[styles.videoSourceOptionLocked, sourcePhoneLayout.compact ? styles.videoSourceOptionCompact : null]} onPress={onProviderLocked} disabled={providerLockedDisabled} hitSlop={8} accessibilityRole="button" accessibilityLabel={providerLockedDisabled ? providerLockedDisabledLabel : "Загрузка закрыта"} accessibilityState={{ disabled: providerLockedDisabled }}>
              <View style={styles.videoSourceOptionIconLocked}>
                <Ionicons name="cloud-offline-outline" size={18} color="#8D8796" />
              </View>
              <Text style={styles.videoSourceOptionTitleLocked}>{providerLockedDisabled ? providerLockedDisabledLabel : "Загрузка закрыта"}</Text>
              <Text style={styles.videoSourceOptionMetaLocked}>{providerLockedDisabled ? providerLockedDisabledHint : "Хранилище/медиа-хранилище позже"}</Text>
            </Pressable>
          </View>

          <View style={styles.videoSourceFooterNotice}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#F2C75B" />
            <Text style={styles.videoSourceFooterText}>Галерея и файл выбирают только локальное видео. Ничего не загружается и не публикуется.</Text>
          </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ShortsShareSaveSheet({
  visible,
  mode,
  title,
  evidence,
  savedLocal,
  onClose,
  onNativeShare,
  onCopyShareText,
  onSaveToCollection,
  onRemoveSave,
  onProviderLocked,
}: {
  readonly visible: boolean;
  readonly mode: StreamShortVideoShareSaveSheetMode;
  readonly title: string;
  readonly evidence: StreamShortVideoShareSaveBehaviorEvidence;
  readonly savedLocal: boolean;
  readonly onClose: () => void;
  readonly onNativeShare: () => void;
  readonly onCopyShareText: () => void;
  readonly onSaveToCollection: (collection: StreamShortVideoShareSaveCollection) => void;
  readonly onRemoveSave: () => void;
  readonly onProviderLocked: () => void;
}) {
  const collectionLabel = formatShareSaveCollectionLabel(evidence.savedToLocalCollection);
  const isShareMode = mode === "share";
  const sharePhoneLayout = getShortVideoPhoneLayoutLocal();
  const shareSheetMaxHeight = getShortVideoSheetMaxHeightLocal(sharePhoneLayout.veryCompact ? 0.70 : 0.78, 520, 280);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.shareSaveBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.shareSaveSheet, sharePhoneLayout.compact ? styles.shareSaveSheetCompact : null, { maxHeight: shareSheetMaxHeight }]}
          onPressIn={(event) => event.stopPropagation()}
          onPress={(event) => event.stopPropagation()}
          onStartShouldSetResponder={() => true}
        >
          <ScrollView
            style={styles.shareSaveScroll}
            contentContainerStyle={[styles.shareSaveScrollContent, sharePhoneLayout.compact ? styles.shareSaveScrollContentCompact : null]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            overScrollMode="never"
          >
          <View style={styles.shareSaveTop}>
            <View style={styles.shareSaveIcon}>
              <Ionicons name={isShareMode ? "arrow-redo-outline" : "bookmark-outline"} size={18} color="#0B0910" />
            </View>
            <View style={styles.shareSaveTitleWrap}>
              <Text style={styles.shareSaveEyebrow}>{isShareMode ? "Поделиться" : "Сохранить"}</Text>
              <Text style={styles.shareSaveTitle} numberOfLines={1}>{title || "Шорт"}</Text>
            </View>
            <Pressable style={styles.shareSaveClose} onPress={onClose}>
              <Ionicons name="close" size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          {isShareMode ? (
            <React.Fragment>
              <Text style={styles.shareSaveDescription}>Выбери способ поделиться. Системная отправка откроется на телефоне, онлайн-доставка будет подключена позже.</Text>
              <View style={styles.shareSaveStatusRow}>
                <View style={[styles.shareSaveStatusPill, evidence.nativeShareRequestedLocal ? styles.shareSaveStatusPillReady : null]}>
                  <Ionicons name={evidence.nativeShareRequestedLocal ? "checkmark-circle" : "phone-portrait-outline"} size={13} color={evidence.nativeShareRequestedLocal ? "#0B0910" : "#F2C75B"} />
                  <Text style={[styles.shareSaveStatusText, evidence.nativeShareRequestedLocal ? styles.shareSaveStatusTextReady : null]} numberOfLines={1}>{evidence.nativeShareRequestedLocal ? "Открыто" : "Поделиться"}</Text>
                </View>
                <View style={[styles.shareSaveStatusPill, evidence.shareTextCopiedLocal ? styles.shareSaveStatusPillReady : null]}>
                  <Ionicons name={evidence.shareTextCopiedLocal ? "checkmark-circle" : "copy-outline"} size={13} color={evidence.shareTextCopiedLocal ? "#0B0910" : "#F2C75B"} />
                  <Text style={[styles.shareSaveStatusText, evidence.shareTextCopiedLocal ? styles.shareSaveStatusTextReady : null]} numberOfLines={1}>{evidence.shareTextCopiedLocal ? "Текст скопирован" : "Скопировать текст"}</Text>
                </View>
              </View>
              <View style={styles.shareSaveActionGrid}>
                <Pressable style={styles.shareSaveActionPrimary} onPress={onNativeShare}>
                  <Ionicons name="share-social-outline" size={17} color="#0B0910" />
                  <Text style={styles.shareSaveActionPrimaryText}>Поделиться через телефон</Text>
                </Pressable>
                <Pressable style={styles.shareSaveAction} onPress={onCopyShareText}>
                  <Ionicons name="copy-outline" size={16} color="#F2C75B" />
                  <Text style={styles.shareSaveActionText}>Скопировать текст</Text>
                </Pressable>
                <Pressable style={styles.shareSaveActionLocked} onPress={onProviderLocked}>
                  <Ionicons name="cloud-offline-outline" size={16} color="#8D8796" />
                  <Text style={styles.shareSaveActionLockedText}>Онлайн-отправка закрыта</Text>
                </Pressable>
              </View>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Text style={styles.shareSaveDescription}>Сохранение работает локально и видно сразу. Облако и синхронизация будут подключены позже.</Text>
              <View style={styles.shareSaveStatusRow}>
                <View style={[styles.shareSaveStatusPill, savedLocal ? styles.shareSaveStatusPillReady : null]}>
                  <Ionicons name={savedLocal ? "bookmark" : "bookmark-outline"} size={13} color={savedLocal ? "#0B0910" : "#F2C75B"} />
                  <Text style={[styles.shareSaveStatusText, savedLocal ? styles.shareSaveStatusTextReady : null]} numberOfLines={1}>{savedLocal ? `Сохранено · ${collectionLabel}` : "Не сохранено"}</Text>
                </View>
                <View style={styles.shareSaveStatusPill}>
                  <Ionicons name="phone-portrait-outline" size={13} color="#F2C75B" />
                  <Text style={styles.shareSaveStatusText} numberOfLines={1}>Этот телефон</Text>
                </View>
              </View>
              <View style={styles.shareSaveActionGrid}>
                <Pressable style={styles.shareSaveActionPrimary} onPress={() => onSaveToCollection("saved")}>
                  <Ionicons name="bookmark-outline" size={17} color="#0B0910" />
                  <Text style={styles.shareSaveActionPrimaryText}>Сохранить видео</Text>
                </Pressable>
                <Pressable style={styles.shareSaveAction} onPress={() => onSaveToCollection("favorites")}>
                  <Ionicons name="heart-outline" size={16} color="#F2C75B" />
                  <Text style={styles.shareSaveActionText}>Избранное</Text>
                </Pressable>
                <Pressable style={styles.shareSaveAction} onPress={() => onSaveToCollection("watch_later")}>
                  <Ionicons name="time-outline" size={16} color="#F2C75B" />
                  <Text style={styles.shareSaveActionText}>Смотреть позже</Text>
                </Pressable>
                <Pressable style={styles.shareSaveActionLocked} onPress={savedLocal ? onRemoveSave : onProviderLocked}>
                  <Ionicons name={savedLocal ? "trash-outline" : "cloud-offline-outline"} size={16} color="#8D8796" />
                  <Text style={styles.shareSaveActionLockedText}>{savedLocal ? "Убрать локально" : "Облако закрыто"}</Text>
                </Pressable>
              </View>
            </React.Fragment>
          )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function StreamShortVideoDraftPanel() {
  const [state, setState] = useState(createInitialStreamShortVideoDraftState);
  const [timelineState, setTimelineState] = useState(() => createInitialStreamShortVideoTimelineState());
  const [sourceState, setSourceState] = useState(() => createInitialStreamShortVideoSourceIntentState());
  const [explicitSourceControlSelectionId, setExplicitSourceControlSelectionId] = useState<StreamShortVideoSourceId | null>(null);
  const [sourceFlowState, setSourceFlowState] = useState(() => createInitialStreamShortVideoRecordUploadSourceFlowState());
  const [sourcePreviewPlaybackState, setSourcePreviewPlaybackState] = useState(() => createInitialStreamShortVideoSourcePreviewPlaybackState());
  const [trimCropCoverFrameState, setTrimCropCoverFrameState] = useState(() => createInitialStreamShortVideoTrimCropCoverFrameState());
  const [captionTextOverlayState, setCaptionTextOverlayState] = useState(() => createInitialStreamShortVideoCaptionTextOverlayState());
  const [usefulOverlayEditorState, setUsefulOverlayEditorState] = useState(() => createInitialStreamShortVideoUsefulOverlayEditorState());
  const sourcePreviewVideoRef = useRef<any>(null);
  const viewerPreviewVideoRef = useRef<any>(null);
  const [reviewState, setReviewState] = useState(() => createInitialStreamShortVideoCoverCaptionReviewState());
  const [explicitReviewItemSelectionId, setExplicitReviewItemSelectionId] = useState<StreamShortVideoReviewItemId | null>(null);
  const [explicitPublishReadinessCheckSelectionId, setExplicitPublishReadinessCheckSelectionId] = useState<StreamShortVideoPublishReadinessCheckId | null>(null);
  const [publishReadinessState, setPublishReadinessState] = useState(() => createInitialStreamShortVideoPublishReadinessState(state, timelineState, sourceState, reviewState));
  const [feedDraftListState, setFeedDraftListState] = useState(() => createInitialStreamShortVideoFeedDraftListState(state, timelineState, sourceState, reviewState, publishReadinessState));
  const [explicitFeedDraftSelectionId, setExplicitFeedDraftSelectionId] = useState<string | null>(null);
  const [playbackControlsState, setPlaybackControlsState] = useState(() => createInitialStreamShortVideoPlaybackControlsState(feedDraftListState));
  const [engagementState, setEngagementState] = useState(() => createInitialStreamShortVideoEngagementState(feedDraftListState, playbackControlsState));
  const [creationToolsState, setCreationToolsState] = useState(() => createInitialStreamShortVideoCreationToolsState(timelineState, sourceState));
  const [effectsEditorState, setEffectsEditorState] = useState(() => createInitialStreamShortVideoEffectsEditorState(creationToolsState));
  const [musicEditorState, setMusicEditorState] = useState(() => createInitialStreamShortVideoMusicEditorState());
  const [socialCommentsState, setSocialCommentsState] = useState(() => createInitialStreamShortVideoSocialCommentsState());
  const [shareSaveBehaviorState, setShareSaveBehaviorState] = useState(() => createInitialStreamShortVideoShareSaveBehaviorState());
  const [mobileInteractionQaState, setMobileInteractionQaState] = useState(() => createInitialStreamShortVideoRealMobileInteractionQaState());
  const [commentDraft, setCommentDraft] = useState("");
  const [settingsKeyboardBottomInset, setSettingsKeyboardBottomInset] = useState(0);
  const settingsScrollRef = useRef<ScrollView | null>(null);
  const [explicitFeedAcceptanceCheckSelectionId, setExplicitFeedAcceptanceCheckSelectionId] = useState<StreamShortVideoFeedAcceptanceCheckId | null>(null);
  const [feedAcceptanceState, setFeedAcceptanceState] = useState(() => createInitialStreamShortVideoFeedAcceptanceState(state, timelineState, sourceState, reviewState, publishReadinessState, feedDraftListState, playbackControlsState, engagementState));
  const [explicitFinalSmokeCheckSelectionId, setExplicitFinalSmokeCheckSelectionId] = useState<StreamShortVideoFinalSmokeCheckId | null>(null);
  const [finalSmokeState, setFinalSmokeState] = useState(() => createInitialStreamShortVideoFinalSmokeState(state, timelineState, sourceState, reviewState, publishReadinessState, feedDraftListState, playbackControlsState, engagementState, feedAcceptanceState));
  const [tagsText, setTagsText] = useState("");
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceSettingsSection, setSourceSettingsSection] = useState<"video" | "edit" | "text" | "overlays" | "effects" | "audio" | "review">("video");
  const [settingsAdvancedOpen, setSettingsAdvancedOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [publishGateOpen, setPublishGateOpen] = useState(false);
  const [feedDraftsOpen, setFeedDraftsOpen] = useState(false);
  const [playbackControlsOpen, setPlaybackControlsOpen] = useState(false);
  const [engagementOpen, setEngagementOpen] = useState(false);
  const [effectsOpen, setEffectsOpen] = useState(false);
  const [effectSelectorFeedbackId, setEffectSelectorFeedbackId] = useState<StreamShortVideoEffectToolId | null>(null);
  const [explicitEffectToolSelectionId, setExplicitEffectToolSelectionId] = useState<StreamShortVideoEffectToolId | null>(null);
  const effectSelectorFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [effectStackFeedbackId, setEffectStackFeedbackId] = useState<string | null>(null);
  const effectStackFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [musicTrackFeedbackId, setMusicTrackFeedbackId] = useState<string | null>(null);
  const musicTrackFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [explicitMusicTrackSelectionId, setExplicitMusicTrackSelectionId] = useState<string | null>(null);
  const [audioMixerFeedbackId, setAudioMixerFeedbackId] = useState<"volume" | "original" | "trim" | "start" | null>(null);
  const audioMixerFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [audioToolFeedbackId, setAudioToolFeedbackId] = useState<StreamShortVideoAudioToolId | null>(null);
  const [explicitAudioToolSelectionId, setExplicitAudioToolSelectionId] = useState<StreamShortVideoAudioToolId | null>(null);
  const audioToolFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [captionOverlayFeedbackId, setCaptionOverlayFeedbackId] = useState<string | null>(null);
  const captionOverlayFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [explicitCaptionOverlaySelectionId, setExplicitCaptionOverlaySelectionId] = useState<string | null>(null);
  const [usefulOverlayFeedbackId, setUsefulOverlayFeedbackId] = useState<string | null>(null);
  const usefulOverlayFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [explicitUsefulOverlaySelectionId, setExplicitUsefulOverlaySelectionId] = useState<string | null>(null);
  const [audioToolsOpen, setAudioToolsOpen] = useState(false);
  const [feedAcceptanceOpen, setFeedAcceptanceOpen] = useState(false);
  const [finalSmokeOpen, setFinalSmokeOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [shortsCameraOpen, setShortsCameraOpen] = useState(false);
  const [videoSourceSheetOpen, setVideoSourceSheetOpen] = useState(false);

  const applySettingsKeyboardInsetLocal = (height: number) => {
    const nextInset = Math.max(0, height);
    setSettingsKeyboardBottomInset(Math.min(nextInset, getShortVideoKeyboardInsetLimitLocal()));
  };

  const syncSettingsKeyboardInsetFromMetricsLocal = () => {
    const keyboardHeight = readShortVideoKeyboardHeightFromMetricsLocal();
    if (keyboardHeight > 0) applySettingsKeyboardInsetLocal(keyboardHeight);
  };

  const resetSettingsKeyboardInsetIfClosedLocal = () => {
    setTimeout(() => {
      if (!studioOpen) return;
      if (readShortVideoKeyboardHeightFromMetricsLocal() <= 0) {
        setSettingsKeyboardBottomInset(0);
      }
    }, 90);
  };

  useEffect(() => () => {
    if (effectSelectorFeedbackTimerRef.current) {
      clearTimeout(effectSelectorFeedbackTimerRef.current);
      effectSelectorFeedbackTimerRef.current = null;
    }
    if (effectStackFeedbackTimerRef.current) {
      clearTimeout(effectStackFeedbackTimerRef.current);
      effectStackFeedbackTimerRef.current = null;
    }
    if (musicTrackFeedbackTimerRef.current) {
      clearTimeout(musicTrackFeedbackTimerRef.current);
      musicTrackFeedbackTimerRef.current = null;
    }
    if (audioMixerFeedbackTimerRef.current) {
      clearTimeout(audioMixerFeedbackTimerRef.current);
      audioMixerFeedbackTimerRef.current = null;
    }
    if (audioToolFeedbackTimerRef.current) {
      clearTimeout(audioToolFeedbackTimerRef.current);
      audioToolFeedbackTimerRef.current = null;
    }
    if (captionOverlayFeedbackTimerRef.current) {
      clearTimeout(captionOverlayFeedbackTimerRef.current);
      captionOverlayFeedbackTimerRef.current = null;
    }
    if (usefulOverlayFeedbackTimerRef.current) {
      clearTimeout(usefulOverlayFeedbackTimerRef.current);
      usefulOverlayFeedbackTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!studioOpen) {
      setSettingsKeyboardBottomInset(0);
      return;
    }

    const resetSettingsKeyboardInset = () => setSettingsKeyboardBottomInset(0);
    const willShowSubscription = Keyboard.addListener("keyboardWillShow", (event) => {
      applySettingsKeyboardInsetLocal(readShortVideoKeyboardHeightFromEventLocal(event));
    });
    const showSubscription = Keyboard.addListener("keyboardDidShow", (event) => {
      applySettingsKeyboardInsetLocal(readShortVideoKeyboardHeightFromEventLocal(event));
    });
    const willHideSubscription = Keyboard.addListener("keyboardWillHide", resetSettingsKeyboardInset);
    const hideSubscription = Keyboard.addListener("keyboardDidHide", resetSettingsKeyboardInset);

    return () => {
      willShowSubscription.remove();
      showSubscription.remove();
      willHideSubscription.remove();
      hideSubscription.remove();
    };
  }, [studioOpen]);

  const settingsKeyboardOpen = settingsKeyboardBottomInset > 0;
  const settingsAdvancedBottomPaddingLocal = settingsAdvancedOpen ? 280 : 34;
  const settingsScrollContentStyle = useMemo(() => ([
    styles.settingsScrollContent,
    settingsAdvancedOpen ? styles.settingsScrollContentAdvancedOpen : null,
    settingsKeyboardOpen ? styles.settingsScrollContentKeyboardOpen : null,
    {
      paddingBottom: settingsKeyboardOpen
        ? settingsKeyboardBottomInset + (settingsAdvancedOpen ? 260 : 112)
        : settingsAdvancedBottomPaddingLocal,
    },
  ]), [settingsAdvancedBottomPaddingLocal, settingsAdvancedOpen, settingsKeyboardBottomInset, settingsKeyboardOpen]);

  const scrollSettingsInputIntoKeyboardViewLocal = (targetY: number) => {
    if (!studioOpen) return;

    syncSettingsKeyboardInsetFromMetricsLocal();
    const safeTargetY = Math.max(0, Math.floor(targetY));
    setTimeout(() => {
      const keyboardHeight = readShortVideoKeyboardHeightFromMetricsLocal();
      if (keyboardHeight > 0) {
        applySettingsKeyboardInsetLocal(keyboardHeight);
      }
      if (!settingsKeyboardOpen && keyboardHeight <= 0) {
        return;
      }
      settingsScrollRef.current?.scrollTo({ y: safeTargetY, animated: true });
    }, settingsKeyboardOpen ? 80 : 180);
  };

  const ensureSettingsAdvancedCurrentSectionOpenLocal = (section: typeof sourceSettingsSection = sourceSettingsSection) => {
    if (section === "video" || section === "text" || section === "overlays" || section === "edit") {
      setSourceOpen(true);
      return;
    }

    if (section === "effects") {
      setEffectsOpen(true);
      return;
    }

    if (section === "audio") {
      setAudioToolsOpen(true);
      return;
    }

    if (section === "review") {
      setReviewOpen(true);
    }
  };

  const toggleSettingsAdvancedOpenLocal = () => {
    resetSettingsKeyboardForNavigationLocal();
    setSettingsAdvancedOpen((value) => {
      const nextValue = !value;
      if (nextValue) {
        ensureSettingsAdvancedCurrentSectionOpenLocal();
      }
      return nextValue;
    });
  };

  const toggleSettingsAdvancedBlockOpenLocal = (setOpen: React.Dispatch<React.SetStateAction<boolean>>, _targetY: number) => {
    resetSettingsKeyboardForNavigationLocal();
    setOpen((value) => !value);
  };

  useEffect(() => {
    if (!studioOpen) return;
    const timer = setTimeout(() => settingsScrollRef.current?.scrollTo({ y: 0, animated: false }), 0);
    return () => clearTimeout(timer);
  }, [sourceSettingsSection, studioOpen]);

  const blockerText = useMemo(() => {
    const local = state.evidence.localBlockers.length + timelineState.evidence.localBlockers.length + sourceState.evidence.localBlockers.length + sourcePreviewPlaybackState.evidence.localBlockers.length + trimCropCoverFrameState.evidence.localBlockers.length + captionTextOverlayState.evidence.localBlockers.length + usefulOverlayEditorState.evidence.localBlockers.length + reviewState.evidence.localBlockers.length + publishReadinessState.evidence.localBlockers.length + feedDraftListState.evidence.localBlockers.length + playbackControlsState.evidence.localBlockers.length + engagementState.evidence.localBlockers.length + creationToolsState.evidence.localBlockers.length + effectsEditorState.evidence.localBlockers.length + musicEditorState.evidence.localBlockers.length + socialCommentsState.evidence.reportedCommentsLocal + feedAcceptanceState.evidence.localBlockers.length + finalSmokeState.evidence.localBlockers.length;
    const provider = state.evidence.providerBlockers.length + timelineState.evidence.providerBlockers.length + sourceState.evidence.providerBlockers.length + sourcePreviewPlaybackState.evidence.providerBlockers.length + trimCropCoverFrameState.evidence.providerBlockers.length + captionTextOverlayState.evidence.providerBlockers.length + usefulOverlayEditorState.evidence.providerBlockers.length + reviewState.evidence.providerBlockers.length + publishReadinessState.evidence.providerBlockers.length + feedDraftListState.evidence.providerBlockers.length + playbackControlsState.evidence.providerBlockers.length + engagementState.evidence.providerBlockers.length + creationToolsState.evidence.providerBlockers.length + effectsEditorState.evidence.providerBlockers.length + musicEditorState.evidence.providerBlockers.length + socialCommentsState.evidence.providerBlockers.length + feedAcceptanceState.evidence.providerBlockers.length + finalSmokeState.evidence.providerBlockers.length;
    return `${local} локально · ${provider} провайдер`;
  }, [
    state.evidence.localBlockers.length,
    state.evidence.providerBlockers.length,
    timelineState.evidence.localBlockers.length,
    timelineState.evidence.providerBlockers.length,
    sourceState.evidence.localBlockers.length,
    sourceState.evidence.providerBlockers.length,
    sourcePreviewPlaybackState.evidence.localBlockers.length,
    sourcePreviewPlaybackState.evidence.providerBlockers.length,
    trimCropCoverFrameState.evidence.localBlockers.length,
    trimCropCoverFrameState.evidence.providerBlockers.length,
    captionTextOverlayState.evidence.localBlockers.length,
    captionTextOverlayState.evidence.providerBlockers.length,
    usefulOverlayEditorState.evidence.localBlockers.length,
    usefulOverlayEditorState.evidence.providerBlockers.length,
    reviewState.evidence.localBlockers.length,
    reviewState.evidence.providerBlockers.length,
    publishReadinessState.evidence.localBlockers.length,
    publishReadinessState.evidence.providerBlockers.length,
    feedDraftListState.evidence.localBlockers.length,
    feedDraftListState.evidence.providerBlockers.length,
    playbackControlsState.evidence.localBlockers.length,
    playbackControlsState.evidence.providerBlockers.length,
    engagementState.evidence.localBlockers.length,
    engagementState.evidence.providerBlockers.length,
    creationToolsState.evidence.localBlockers.length,
    creationToolsState.evidence.providerBlockers.length,
    effectsEditorState.evidence.localBlockers.length,
    effectsEditorState.evidence.providerBlockers.length,
    musicEditorState.evidence.localBlockers.length,
    musicEditorState.evidence.providerBlockers.length,
    socialCommentsState.evidence.reportedCommentsLocal,
    socialCommentsState.evidence.providerBlockers.length,
  ]);

  const selectedClip = useMemo(
    () => timelineState.clips.find((clip) => clip.clipId === timelineState.selectedClipId) ?? null,
    [timelineState.clips, timelineState.selectedClipId],
  );
  const timelineClipsHaveLocalItems = timelineState.clips.length > 0;
  const timelineClipActionDisabled = !selectedClip;
  const timelineClipActionDisabledLabel = timelineClipsHaveLocalItems ? "выбери клип" : "нет клипа";
  const timelineClipActionDisabledHint = timelineClipsHaveLocalItems
    ? "Сначала выбери клип в монтаже."
    : "Сначала добавь клип в монтаж.";

  const sourceControlsHaveLocalItems = sourceState.sources.length > 0;
  const sourceControlSelectionRequired = sourceControlsHaveLocalItems && explicitSourceControlSelectionId !== sourceState.selectedSourceId;
  const selectedSource = useMemo(
    () => sourceControlSelectionRequired ? null : sourceState.sources.find((source) => source.sourceId === sourceState.selectedSourceId) ?? null,
    [sourceControlSelectionRequired, sourceState.selectedSourceId, sourceState.sources],
  );
  const sourceControlActionDisabled = sourceControlSelectionRequired || !selectedSource;
  const sourceControlActionDisabledLabel = sourceControlsHaveLocalItems ? "выбери источник" : "нет источника";
  const sourceControlActionDisabledHint = sourceControlsHaveLocalItems
    ? "Сначала выбери источник видео в списке."
    : "Сначала добавь доступный источник видео.";
  const sourceControlStatusText = sourceControlsHaveLocalItems
    ? sourceControlSelectionRequired
      ? "выбери источник"
      : selectedSource
        ? "источник выбран"
        : "выбери источник"
    : "нет источника";

  const selectedSourceFlowAsset = useMemo(
    () => sourceFlowState.assets.find((asset) => asset.assetId === sourceFlowState.selectedAssetId) ?? null,
    [sourceFlowState.assets, sourceFlowState.selectedAssetId],
  );

  const selectedCaptionOverlay = useMemo(
    () => captionTextOverlayState.overlays.find((overlay) => overlay.overlayId === explicitCaptionOverlaySelectionId) ?? null,
    [captionTextOverlayState.overlays, explicitCaptionOverlaySelectionId],
  );

  const selectedUsefulOverlay = useMemo(
    () => usefulOverlayEditorState.overlays.find((overlay) => overlay.overlayId === explicitUsefulOverlaySelectionId) ?? null,
    [usefulOverlayEditorState.overlays, explicitUsefulOverlaySelectionId],
  );

  useEffect(() => {
    if (explicitCaptionOverlaySelectionId && !captionTextOverlayState.overlays.some((overlay) => overlay.overlayId === explicitCaptionOverlaySelectionId)) {
      setExplicitCaptionOverlaySelectionId(null);
      setCaptionOverlayFeedbackId(null);
    }
  }, [captionTextOverlayState.overlays, explicitCaptionOverlaySelectionId]);

  useEffect(() => {
    if (explicitUsefulOverlaySelectionId && !usefulOverlayEditorState.overlays.some((overlay) => overlay.overlayId === explicitUsefulOverlaySelectionId)) {
      setExplicitUsefulOverlaySelectionId(null);
      setUsefulOverlayFeedbackId(null);
    }
  }, [explicitUsefulOverlaySelectionId, usefulOverlayEditorState.overlays]);

  useEffect(() => {
    if (explicitReviewItemSelectionId && !reviewState.items.some((item) => item.id === explicitReviewItemSelectionId)) {
      setExplicitReviewItemSelectionId(null);
    }
  }, [explicitReviewItemSelectionId, reviewState.items]);

  useEffect(() => {
    if (explicitPublishReadinessCheckSelectionId && !publishReadinessState.checks.some((check) => check.id === explicitPublishReadinessCheckSelectionId)) {
      setExplicitPublishReadinessCheckSelectionId(null);
    }
  }, [explicitPublishReadinessCheckSelectionId, publishReadinessState.checks]);

  useEffect(() => {
    if (explicitFeedAcceptanceCheckSelectionId && !feedAcceptanceState.checks.some((check) => check.id === explicitFeedAcceptanceCheckSelectionId)) {
      setExplicitFeedAcceptanceCheckSelectionId(null);
    }
  }, [explicitFeedAcceptanceCheckSelectionId, feedAcceptanceState.checks]);

  useEffect(() => {
    if (explicitFinalSmokeCheckSelectionId && !finalSmokeState.checks.some((check) => check.id === explicitFinalSmokeCheckSelectionId)) {
      setExplicitFinalSmokeCheckSelectionId(null);
    }
  }, [explicitFinalSmokeCheckSelectionId, finalSmokeState.checks]);

  useEffect(() => {
    if (explicitFeedDraftSelectionId && !feedDraftListState.drafts.some((draft) => draft.draftId === explicitFeedDraftSelectionId)) {
      setExplicitFeedDraftSelectionId(null);
    }
  }, [explicitFeedDraftSelectionId, feedDraftListState.drafts]);

  const captionOverlaysHaveLocalItems = captionTextOverlayState.overlays.length > 0;
  const captionOverlayActionDisabled = !selectedCaptionOverlay;
  const captionOverlayActionDisabledLabel = captionOverlaysHaveLocalItems ? "выбери текст" : "нет текста";
  const captionOverlayPendingSelectionLabel = captionOverlaysHaveLocalItems ? "выбери текст" : "ожидает";
  const captionOverlayEmptyPreviewText = captionOverlaysHaveLocalItems
    ? "Выбери текстовый слой в списке. Уже добавленный текст не меняется молча."
    : "Добавь локальный текст и свяжи его с монтажом и проверкой.";
  const captionOverlayActionDisabledHint = captionOverlaysHaveLocalItems
    ? "Сначала выбери текстовый слой в списке."
    : "Сначала добавь локальный текстовый слой.";
  const captionOverlaySelectionRequired = captionOverlaysHaveLocalItems && !selectedCaptionOverlay;
  const captionOverlayHubMeta = selectedCaptionOverlay
    ? "текст выбран"
    : captionOverlaySelectionRequired
      ? "выбери текст"
      : "текст/заголовок";
  const captionOverlayFocusStatus = selectedCaptionOverlay
    ? `${captionTextOverlayState.evidence.overlayCountLocal} текст · выбран`
    : captionOverlaySelectionRequired
      ? `${captionTextOverlayState.evidence.overlayCountLocal} текст · выбери`
      : "пусто";
  const captionOverlayFocusDescription = captionOverlaySelectionRequired
    ? "Выбери текстовый слой в списке. Уже добавленный текст не редактируется и не сохраняется молча."
    : "Добавь читаемый текст или заголовки и сохрани в черновик.";
  const usefulOverlaysHaveLocalItems = usefulOverlayEditorState.overlays.length > 0;
  const usefulOverlayActionDisabled = !selectedUsefulOverlay;
  const usefulOverlayActionDisabledLabel = usefulOverlaysHaveLocalItems ? "выбери метку" : "нет метки";
  const usefulOverlayPendingSelectionLabel = usefulOverlaysHaveLocalItems ? "выбери метку" : "ожидает";
  const usefulOverlayEmptyPreviewText = usefulOverlaysHaveLocalItems
    ? "Выбери метку в списке. Уже добавленная метка не меняется молча."
    : "Добавь полезную локальную метку и свяжи её с монтажом и проверкой.";
  const usefulOverlayActionDisabledHint = usefulOverlaysHaveLocalItems
    ? "Сначала выбери полезную метку в списке."
    : "Сначала добавь локальную метку.";
  const usefulOverlaySelectionRequired = usefulOverlaysHaveLocalItems && !selectedUsefulOverlay;
  const usefulOverlayHubMeta = selectedUsefulOverlay
    ? "метка выбрана"
    : usefulOverlaySelectionRequired
      ? "выбери метку"
      : "полезные метки";
  const usefulOverlayFocusStatus = selectedUsefulOverlay
    ? `${usefulOverlayEditorState.evidence.overlayCountLocal} метка · выбрана`
    : usefulOverlaySelectionRequired
      ? `${usefulOverlayEditorState.evidence.overlayCountLocal} метка · выбери`
      : "пусто";
  const usefulOverlayFocusDescription = usefulOverlaySelectionRequired
    ? "Выбери метку в списке. Уже добавленная метка не редактируется и не сохраняется молча."
    : "Добавляй только полезные метки: подписи, стрелки, значки или выделения.";

  const selectedReview = useMemo(
    () => reviewState.items.find((item) => item.id === explicitReviewItemSelectionId) ?? null,
    [explicitReviewItemSelectionId, reviewState.items],
  );
  const reviewItemsHaveLocalItems = reviewState.items.length > 0;
  const reviewItemSelectionRequired = reviewItemsHaveLocalItems && !selectedReview;
  const reviewItemActionDisabledLabel = reviewItemsHaveLocalItems ? "выбери проверку" : "нет проверки";
  const reviewItemActionDisabledHint = reviewItemsHaveLocalItems
    ? "Сначала выбери пункт проверки в списке."
    : "Сначала добавь локальные пункты проверки.";
  const selectedReviewNeedsCaptionOverlaySelection = selectedReview?.id === "caption_track" || selectedReview?.id === "language_caption_review";
  const selectedReviewNeedsUsefulOverlaySelection = selectedReview?.id === "media_review";
  const selectedReviewExplicitSelectionDisabled = reviewItemSelectionRequired || (selectedReviewNeedsCaptionOverlaySelection && captionOverlaySelectionRequired) || (selectedReviewNeedsUsefulOverlaySelection && usefulOverlaySelectionRequired);
  const selectedReviewExplicitSelectionDisabledLabel = reviewItemSelectionRequired ? reviewItemActionDisabledLabel : selectedReviewNeedsUsefulOverlaySelection ? usefulOverlayActionDisabledLabel : captionOverlayActionDisabledLabel;
  const selectedReviewExplicitSelectionDisabledHint = reviewItemSelectionRequired ? reviewItemActionDisabledHint : selectedReviewNeedsUsefulOverlaySelection ? usefulOverlayActionDisabledHint : captionOverlayActionDisabledHint;
  const reviewCoverFrameActionDisabled = reviewItemSelectionRequired || selectedReview?.id !== "cover_frame" || sourceControlActionDisabled;
  const reviewCaptionTrackActionDisabled = reviewItemSelectionRequired || selectedReview?.id !== "caption_track" || captionOverlaySelectionRequired;
  const reviewCaptionLanguageActionDisabled = reviewItemSelectionRequired || selectedReview?.id !== "language_caption_review" || captionOverlaySelectionRequired;
  const reviewMediaActionDisabled = reviewItemSelectionRequired || selectedReview?.id !== "media_review" || usefulOverlaySelectionRequired;
  const reviewPolicyActionDisabled = reviewItemSelectionRequired || selectedReview?.id !== "content_policy_review" || sourceControlActionDisabled;
  const reviewPublishHandoffActionDisabled = reviewItemSelectionRequired || selectedReview?.id !== "publish_handoff_review" || captionOverlaySelectionRequired || usefulOverlaySelectionRequired;
  const reviewSelectedItemActionDisabledLabel = reviewItemSelectionRequired ? reviewItemActionDisabledLabel : "выбери пункт";
  const reviewSelectedItemActionDisabledHint = reviewItemSelectionRequired ? reviewItemActionDisabledHint : "Эта кнопка работает только для выбранного пункта проверки.";
  const finalReviewExplicitSelectionDisabled = reviewItemSelectionRequired || captionOverlaySelectionRequired || usefulOverlaySelectionRequired;
  const finalReviewExplicitSelectionDisabledLabel = reviewItemSelectionRequired ? reviewItemActionDisabledLabel : captionOverlaySelectionRequired ? captionOverlayActionDisabledLabel : usefulOverlayActionDisabledLabel;
  const finalReviewExplicitSelectionDisabledHint = reviewItemSelectionRequired ? reviewItemActionDisabledHint : captionOverlaySelectionRequired ? captionOverlayActionDisabledHint : usefulOverlayActionDisabledHint;


  const selectedPublishReadiness = useMemo(
    () => publishReadinessState.checks.find((check) => check.id === explicitPublishReadinessCheckSelectionId) ?? null,
    [explicitPublishReadinessCheckSelectionId, publishReadinessState.checks],
  );
  const publishReadinessChecksHaveLocalItems = publishReadinessState.checks.length > 0;
  const publishReadinessCheckSelectionRequired = publishReadinessChecksHaveLocalItems && !selectedPublishReadiness;
  const publishReadinessCheckActionDisabledLabel = publishReadinessChecksHaveLocalItems ? "выбери publish" : "нет publish";
  const publishReadinessCheckActionDisabledHint = publishReadinessChecksHaveLocalItems
    ? "Сначала выбери publish-проверку в списке."
    : "Сначала подготовь локальные publish-проверки.";
  const selectedPublishReadinessNeedsCaptionOverlaySelection = selectedPublishReadiness?.id === "cover_captions_review";
  const selectedPublishReadinessNeedsUsefulOverlaySelection = selectedPublishReadiness?.id === "timeline_editor";
  const selectedPublishReadinessExplicitSelectionDisabled = publishReadinessCheckSelectionRequired || (selectedPublishReadinessNeedsCaptionOverlaySelection && captionOverlaySelectionRequired) || (selectedPublishReadinessNeedsUsefulOverlaySelection && usefulOverlaySelectionRequired);
  const selectedPublishReadinessExplicitSelectionDisabledLabel = publishReadinessCheckSelectionRequired ? publishReadinessCheckActionDisabledLabel : selectedPublishReadinessNeedsUsefulOverlaySelection ? usefulOverlayActionDisabledLabel : captionOverlayActionDisabledLabel;
  const selectedPublishReadinessExplicitSelectionDisabledHint = publishReadinessCheckSelectionRequired ? publishReadinessCheckActionDisabledHint : selectedPublishReadinessNeedsUsefulOverlaySelection ? usefulOverlayActionDisabledHint : captionOverlayActionDisabledHint;
  const publishReadinessExplicitSelectionDisabled = publishReadinessCheckSelectionRequired || finalReviewExplicitSelectionDisabled;
  const publishReadinessExplicitSelectionDisabledLabel = publishReadinessCheckSelectionRequired ? publishReadinessCheckActionDisabledLabel : finalReviewExplicitSelectionDisabledLabel;
  const publishReadinessExplicitSelectionDisabledHint = publishReadinessCheckSelectionRequired ? publishReadinessCheckActionDisabledHint : finalReviewExplicitSelectionDisabledHint;
  const publishProviderBlockedActionDisabled = publishReadinessExplicitSelectionDisabled || selectedPublishReadiness?.id !== "provider_admin_handoff";
  const publishProviderBlockedActionDisabledLabel = publishProviderBlockedActionDisabled && !publishReadinessExplicitSelectionDisabled ? "выбери провайдер" : publishReadinessExplicitSelectionDisabledLabel;
  const publishProviderBlockedActionDisabledHint = publishProviderBlockedActionDisabled && !publishReadinessExplicitSelectionDisabled ? "Сначала выбери chip передачи провайдер/админ в публикации." : publishReadinessExplicitSelectionDisabledHint;
  const feedDraftsHaveLocalItems = feedDraftListState.drafts.length > 0;
  const selectedFeedDraft = useMemo(
    () => feedDraftListState.drafts.find((draft) => draft.draftId === explicitFeedDraftSelectionId) ?? null,
    [explicitFeedDraftSelectionId, feedDraftListState.drafts],
  );
  const feedDraftSelectionRequired = feedDraftsHaveLocalItems && !selectedFeedDraft;
  const feedDraftActionDisabledLabel = feedDraftsHaveLocalItems ? "выбери черновик" : "нет черновика";
  const feedDraftActionDisabledHint = feedDraftsHaveLocalItems
    ? "Сначала выбери черновик ленты кнопкой Назад/Дальше. Первый черновик больше не считается выбранным автоматически."
    : "Сначала синхронизируй черновик в ленту.";
  const viewerSocialDraftSelectionRequired = feedDraftsHaveLocalItems && !selectedFeedDraft;
  const viewerSocialDraftActionDisabledLabel = viewerSocialDraftSelectionRequired ? feedDraftActionDisabledLabel : undefined;
  const viewerSocialDraftActionDisabledHint = viewerSocialDraftSelectionRequired
    ? "Сначала выбери черновик в ленте кнопкой Назад/Дальше. Боковые кнопки зрителя больше не лайкают, не отправляют и не сохраняют первый черновик молча."
    : undefined;
  const feedDraftListExplicitSelectionDisabled = finalReviewExplicitSelectionDisabled || feedDraftSelectionRequired;
  const feedDraftListExplicitSelectionDisabledLabel = feedDraftSelectionRequired ? feedDraftActionDisabledLabel : finalReviewExplicitSelectionDisabledLabel;
  const feedDraftListExplicitSelectionDisabledHint = feedDraftSelectionRequired ? feedDraftActionDisabledHint : finalReviewExplicitSelectionDisabledHint;
  const feedDraftSyncExplicitSelectionDisabled = finalReviewExplicitSelectionDisabled;
  const feedDraftSyncExplicitSelectionDisabledLabel = finalReviewExplicitSelectionDisabledLabel;
  const feedDraftSyncExplicitSelectionDisabledHint = finalReviewExplicitSelectionDisabledHint;
  const playbackControlsExplicitSelectionDisabled = finalReviewExplicitSelectionDisabled || feedDraftSelectionRequired;
  const playbackControlsExplicitSelectionDisabledLabel = feedDraftSelectionRequired ? feedDraftActionDisabledLabel : finalReviewExplicitSelectionDisabledLabel;
  const playbackControlsExplicitSelectionDisabledHint = feedDraftSelectionRequired ? feedDraftActionDisabledHint : finalReviewExplicitSelectionDisabledHint;
  const engagementExplicitSelectionDisabled = finalReviewExplicitSelectionDisabled || feedDraftSelectionRequired;
  const engagementExplicitSelectionDisabledLabel = feedDraftSelectionRequired ? feedDraftActionDisabledLabel : finalReviewExplicitSelectionDisabledLabel;
  const engagementExplicitSelectionDisabledHint = feedDraftSelectionRequired ? feedDraftActionDisabledHint : finalReviewExplicitSelectionDisabledHint;
  const sourceFlowExplicitSelectionDisabled = sourceControlActionDisabled || finalReviewExplicitSelectionDisabled;
  const sourceFlowExplicitSelectionDisabledLabel = sourceControlActionDisabled ? sourceControlActionDisabledLabel : finalReviewExplicitSelectionDisabledLabel;
  const sourceFlowExplicitSelectionDisabledHint = sourceControlActionDisabled ? sourceControlActionDisabledHint : finalReviewExplicitSelectionDisabledHint;
  const sourceSettingsExplicitSelectionDisabled = sourceControlActionDisabled || finalReviewExplicitSelectionDisabled;
  const sourceSettingsExplicitSelectionDisabledLabel = sourceControlActionDisabled ? sourceControlActionDisabledLabel : finalReviewExplicitSelectionDisabledLabel;
  const sourceSettingsExplicitSelectionDisabledHint = sourceControlActionDisabled ? sourceControlActionDisabledHint : finalReviewExplicitSelectionDisabledHint;
  const sourcePreviewExplicitSelectionDisabled = sourceControlActionDisabled || finalReviewExplicitSelectionDisabled;
  const sourcePreviewExplicitSelectionDisabledLabel = sourceControlActionDisabled ? sourceControlActionDisabledLabel : finalReviewExplicitSelectionDisabledLabel;
  const sourcePreviewExplicitSelectionDisabledHint = sourceControlActionDisabled ? sourceControlActionDisabledHint : finalReviewExplicitSelectionDisabledHint;
  const timelineEditorExplicitSelectionDisabled = finalReviewExplicitSelectionDisabled;
  const timelineEditorExplicitSelectionDisabledLabel = finalReviewExplicitSelectionDisabledLabel;
  const timelineEditorExplicitSelectionDisabledHint = finalReviewExplicitSelectionDisabledHint;
  const creationToolsExplicitSelectionDisabled = finalReviewExplicitSelectionDisabled;
  const creationToolsExplicitSelectionDisabledLabel = finalReviewExplicitSelectionDisabledLabel;
  const creationToolsExplicitSelectionDisabledHint = finalReviewExplicitSelectionDisabledHint;
  const trimCropCoverExplicitSelectionDisabled = sourceControlActionDisabled || finalReviewExplicitSelectionDisabled;
  const trimCropCoverExplicitSelectionDisabledLabel = sourceControlActionDisabled ? sourceControlActionDisabledLabel : finalReviewExplicitSelectionDisabledLabel;
  const trimCropCoverExplicitSelectionDisabledHint = sourceControlActionDisabled ? sourceControlActionDisabledHint : finalReviewExplicitSelectionDisabledHint;
  const timelineCaptionClipExplicitSelectionDisabled = captionOverlaySelectionRequired;
  const timelineCaptionClipExplicitSelectionDisabledLabel = captionOverlayActionDisabledLabel;
  const timelineCaptionClipExplicitSelectionDisabledHint = captionOverlayActionDisabledHint;
  const sourceCaptionIntentExplicitSelectionDisabled = sourceControlActionDisabled || captionOverlaySelectionRequired;
  const sourceCaptionIntentExplicitSelectionDisabledLabel = sourceControlActionDisabled ? sourceControlActionDisabledLabel : captionOverlayActionDisabledLabel;
  const sourceCaptionIntentExplicitSelectionDisabledHint = sourceControlActionDisabled ? sourceControlActionDisabledHint : captionOverlayActionDisabledHint;
  const selectedFeedAcceptanceCheck = useMemo(
    () => feedAcceptanceState.checks.find((check) => check.id === explicitFeedAcceptanceCheckSelectionId) ?? null,
    [explicitFeedAcceptanceCheckSelectionId, feedAcceptanceState.checks],
  );
  const feedAcceptanceChecksHaveLocalItems = feedAcceptanceState.checks.length > 0;
  const feedAcceptanceCheckSelectionRequired = feedAcceptanceChecksHaveLocalItems && !selectedFeedAcceptanceCheck;
  const feedAcceptanceCheckActionDisabledLabel = feedAcceptanceChecksHaveLocalItems ? "выбери приёмку" : "нет приёмки";
  const feedAcceptanceCheckActionDisabledHint = feedAcceptanceChecksHaveLocalItems
    ? "Сначала выбери проверку приёмки кнопкой выбора."
    : "Сначала подготовь проверки приёмки.";
  const feedAcceptanceExplicitSelectionDisabled = feedAcceptanceCheckSelectionRequired || feedDraftSelectionRequired || finalReviewExplicitSelectionDisabled;
  const feedAcceptanceExplicitSelectionDisabledLabel = feedAcceptanceCheckSelectionRequired ? feedAcceptanceCheckActionDisabledLabel : feedDraftSelectionRequired ? feedDraftActionDisabledLabel : finalReviewExplicitSelectionDisabledLabel;
  const feedAcceptanceExplicitSelectionDisabledHint = feedAcceptanceCheckSelectionRequired ? feedAcceptanceCheckActionDisabledHint : feedDraftSelectionRequired ? feedDraftActionDisabledHint : finalReviewExplicitSelectionDisabledHint;
  const feedAcceptanceProviderBlockedActionDisabled = feedAcceptanceExplicitSelectionDisabled || selectedFeedAcceptanceCheck?.id !== "provider_admin_handoff";
  const feedAcceptanceProviderBlockedActionDisabledLabel = feedAcceptanceProviderBlockedActionDisabled && !feedAcceptanceExplicitSelectionDisabled ? "выбери провайдер" : feedAcceptanceExplicitSelectionDisabledLabel;
  const feedAcceptanceProviderBlockedActionDisabledHint = feedAcceptanceProviderBlockedActionDisabled && !feedAcceptanceExplicitSelectionDisabled ? "Сначала выбери передачу провайдер/админ в приёмке." : feedAcceptanceExplicitSelectionDisabledHint;

  const selectedFinalSmokeCheck = useMemo(
    () => finalSmokeState.checks.find((check) => check.id === explicitFinalSmokeCheckSelectionId) ?? null,
    [explicitFinalSmokeCheckSelectionId, finalSmokeState.checks],
  );
  const finalSmokeChecksHaveLocalItems = finalSmokeState.checks.length > 0;
  const finalSmokeCheckSelectionRequired = finalSmokeChecksHaveLocalItems && !selectedFinalSmokeCheck;
  const finalSmokeCheckActionDisabledLabel = finalSmokeChecksHaveLocalItems ? "выбери финал" : "нет финала";
  const finalSmokeCheckActionDisabledHint = finalSmokeChecksHaveLocalItems
    ? "Сначала выбери финальную проверку кнопкой выбора."
    : "Сначала подготовь финальные проверки.";
  const finalSmokeExplicitSelectionDisabled = finalSmokeCheckSelectionRequired || feedDraftSelectionRequired || finalReviewExplicitSelectionDisabled;
  const finalSmokeExplicitSelectionDisabledLabel = finalSmokeCheckSelectionRequired ? finalSmokeCheckActionDisabledLabel : feedDraftSelectionRequired ? feedDraftActionDisabledLabel : finalReviewExplicitSelectionDisabledLabel;
  const finalSmokeExplicitSelectionDisabledHint = finalSmokeCheckSelectionRequired ? finalSmokeCheckActionDisabledHint : feedDraftSelectionRequired ? feedDraftActionDisabledHint : finalReviewExplicitSelectionDisabledHint;
  const finalSmokeProfileHandoffActionDisabled = finalSmokeExplicitSelectionDisabled || selectedFinalSmokeCheck?.id !== "profile_setup_handoff";
  const finalSmokeProfileHandoffActionDisabledLabel = finalSmokeProfileHandoffActionDisabled && !finalSmokeExplicitSelectionDisabled ? "выбери профиль" : finalSmokeExplicitSelectionDisabledLabel;
  const finalSmokeProfileHandoffActionDisabledHint = finalSmokeProfileHandoffActionDisabled && !finalSmokeExplicitSelectionDisabled ? "Сначала выбери передачу профиля в финальной проверке." : finalSmokeExplicitSelectionDisabledHint;
  const finalSmokeProviderBlockedActionDisabled = finalSmokeExplicitSelectionDisabled || selectedFinalSmokeCheck?.id !== "provider_admin_handoff";
  const finalSmokeProviderBlockedActionDisabledLabel = finalSmokeProviderBlockedActionDisabled && !finalSmokeExplicitSelectionDisabled ? "выбери провайдер" : finalSmokeExplicitSelectionDisabledLabel;
  const finalSmokeProviderBlockedActionDisabledHint = finalSmokeProviderBlockedActionDisabled && !finalSmokeExplicitSelectionDisabled ? "Сначала выбери передачу провайдер/админ в финальной проверке." : finalSmokeExplicitSelectionDisabledHint;

  const selectedEffectTool = useMemo(
    () => creationToolsState.effectTools.find((tool) => tool.id === explicitEffectToolSelectionId) ?? null,
    [creationToolsState.effectTools, explicitEffectToolSelectionId],
  );
  const effectToolSelectionRequired = creationToolsState.effectTools.length > 0 && !selectedEffectTool;
  const effectToolActionDisabled = effectToolSelectionRequired || creationToolsExplicitSelectionDisabled;
  const effectToolActionDisabledLabel = effectToolSelectionRequired ? "выбери эффект" : creationToolsExplicitSelectionDisabledLabel;
  const effectToolActionDisabledHint = effectToolSelectionRequired
    ? "Сначала выбери chip эффекта вручную. Первый эффект больше не применяется молча."
    : creationToolsExplicitSelectionDisabledHint;

  const selectedAudioTool = useMemo(
    () => creationToolsState.audioTools.find((tool) => tool.id === explicitAudioToolSelectionId) ?? null,
    [creationToolsState.audioTools, explicitAudioToolSelectionId],
  );
  const audioToolSelectionRequired = creationToolsState.audioTools.length > 0 && !selectedAudioTool;
  const audioToolActionDisabled = audioToolSelectionRequired || creationToolsExplicitSelectionDisabled;
  const audioToolActionDisabledLabel = audioToolSelectionRequired ? "выбери аудио tool" : creationToolsExplicitSelectionDisabledLabel;
  const audioToolActionDisabledHint = audioToolSelectionRequired
    ? "Сначала выбери chip аудио вручную. MP3 больше не считается выбранным по умолчанию."
    : creationToolsExplicitSelectionDisabledHint;

  const selectedEffectsEditorItem = useMemo(
    () => effectsEditorState.effectStack.find((item) => item.stackItemId === effectsEditorState.selectedStackItemId) ?? null,
    [effectsEditorState.effectStack, effectsEditorState.selectedStackItemId],
  );

  const effectsStackHasLocalLayers = effectsEditorState.effectStack.length > 0;
  const effectLayerActionDisabled = !selectedEffectsEditorItem;
  const effectLayerActionDisabledLabel = effectsStackHasLocalLayers ? "выбери слой" : "нет слоя";
  const effectLayerActionDisabledHint = effectsStackHasLocalLayers
    ? "Сначала выбери слой эффекта в стеке."
    : "Сначала примени эффект, чтобы появился слой.";


  const selectedMusicTrack = useMemo(
    () => musicEditorState.tracks.find((track) => track.trackId === explicitMusicTrackSelectionId) ?? null,
    [explicitMusicTrackSelectionId, musicEditorState.tracks],
  );

  const explicitlySelectedMusicTrack = selectedMusicTrack;
  const audioTrackSelectedExplicitlyLocal = Boolean(explicitlySelectedMusicTrack);
  const musicTracksHaveLocalItems = musicEditorState.tracks.length > 0;
  const musicTrackActionDisabled = !explicitlySelectedMusicTrack;
  const musicTrackActionDisabledLabel = musicTracksHaveLocalItems ? "выбери трек" : "нет MP3";
  const musicTrackActionDisabledHint = musicTracksHaveLocalItems
    ? "Сначала выбери MP3/аудио трек в списке."
    : "Сначала выбери реальный MP3 или аудиофайл.";
  const selectedMusicTrackTrimDurationSecondsLocal = selectedMusicTrack
    ? (selectedMusicTrack.trimEndMsLocal - selectedMusicTrack.trimStartMsLocal) / 1000
    : 0;
  const selectedMusicTrackPlacementSecondsLocal = selectedMusicTrack
    ? selectedMusicTrack.placementStartMsLocal / 1000
    : 0;
  const selectedMusicTrackOriginalMutedLocal = selectedMusicTrack?.originalAudioMutedLocal ?? false;
  const showAudioMixerReadyFeedbackLocal = (actionId: "volume" | "original" | "trim" | "start") => audioMixerFeedbackId === actionId && !musicTrackActionDisabled;

  const runSelectedMusicTrackActionLocal = (action: () => void) => {
    if (musicTrackActionDisabled) return;
    action();
  };

  const timelineHasLocalClipsForProductionSmokeLocal = timelineState.evidence.clipCount > 0;
  const timelineReadyForProductionSmokeLocal = timelineHasLocalClipsForProductionSmokeLocal
    ? Boolean(selectedClip)
    : timelineOpen;
  const effectsHaveLocalLayersForProductionSmokeLocal = creationToolsState.evidence.activeEffectsCount > 0 || effectsEditorState.evidence.stackCount > 0;
  const effectsReadyForProductionSmokeLocal = effectsHaveLocalLayersForProductionSmokeLocal
    ? Boolean(selectedEffectsEditorItem)
    : effectsOpen;
  const sourceControlSelectedExplicitlyLocal = Boolean(selectedSource) && !sourceControlSelectionRequired;
  const effectsReadyForMobileQaLocal = effectsHaveLocalLayersForProductionSmokeLocal ? Boolean(selectedEffectsEditorItem) : false;
  const mp3HasLocalTrackForProductionSmokeLocal = musicEditorState.evidence.selectedTrackUriPresent;
  const mp3ReadyForProductionSmokeLocal = mp3HasLocalTrackForProductionSmokeLocal
    ? audioTrackSelectedExplicitlyLocal
    : audioToolsOpen;

  const videoSourceHubMeta = sourceControlSelectedExplicitlyLocal ? "источник выбран" : sourceControlSelectionRequired ? "выбери источник" : sourceFlowState.evidence.selectedAssetUriPresent ? "выбери источник" : "добавить";
  const videoSourceHubActive = sourceSettingsSection === "video" || sourceControlSelectedExplicitlyLocal;
  const timelineHubMeta = selectedClip ? "клип выбран" : timelineClipsHaveLocalItems ? "выбери клип" : "обрезка + обложка";
  const timelineHubActive = sourceSettingsSection === "edit" || Boolean(selectedClip);
  const timelineFocusDescription = selectedClip
    ? "Клип выбран явно. Можно связывать обрезку, кадр и обложку с монтажом."
    : timelineClipsHaveLocalItems
      ? "Выбери клип в списке монтажа. Добавленный клип не редактируется молча."
      : "Сохрани обрезку, кадр и обложку в монтаж черновика.";
  const timelineFocusStatus = selectedClip ? "клип выбран" : timelineClipsHaveLocalItems ? "выбери клип" : "черновик";
  const effectsHubMeta = selectedEffectsEditorItem ? "слой выбран" : effectsStackHasLocalLayers ? "выбери слой" : "вид + движение";
  const effectsHubActive = sourceSettingsSection === "effects" || Boolean(selectedEffectsEditorItem);
  const effectsFocusDescription = selectedEffectsEditorItem
    ? "Слой эффекта выбран явно. Можно менять силу, пресет и отправлять на проверку."
    : effectsStackHasLocalLayers
      ? "Выбери слой эффекта в стеке. Добавленный эффект не редактируется молча."
      : "Выбери стиль, примени к видео и проверь эффект.";
  const effectsFocusStatus = selectedEffectsEditorItem ? "слой выбран" : effectsStackHasLocalLayers ? "выбери слой" : "выбрать стиль";
  const audioHubMeta = selectedMusicTrack ? "трек выбран" : musicTracksHaveLocalItems ? "выбери трек" : "звук";
  const audioHubActive = sourceSettingsSection === "audio" || Boolean(selectedMusicTrack);
  const audioFocusDescription = selectedMusicTrack
    ? "Трек выбран явно. Можно настраивать микс, обрезку и проверку."
    : musicTracksHaveLocalItems
      ? "Выбери MP3/аудио трек в списке. Импортированный трек не редактируется молча."
      : "Выбери музыку, настрой микс и отправь на проверку.";
  const audioFocusStatus = selectedMusicTrack ? "трек выбран" : musicTracksHaveLocalItems ? "выбери трек" : "выбери аудио";

  const productionUiSmoke = useMemo(() => runStreamShortVideoProductionUiSmokeCheck({
    likeActionBound: true,
    likeStateTouchedLocal: socialCommentsState.evidence.likedLocal,
    commentsActionBound: true,
    commentsStateTouchedLocal: socialCommentsState.evidence.commentsOpenLocal || socialCommentsState.evidence.commentsCountLocal > 0,
    shareActionBound: true,
    shareStateTouchedLocal: socialCommentsState.evidence.shareDraftPreparedLocal,
    saveActionBound: true,
    saveStateTouchedLocal: socialCommentsState.evidence.savedLocal,
    effectsActionBound: true,
    effectsStateTouchedLocal: effectsReadyForProductionSmokeLocal,
    mp3ActionBound: true,
    mp3StateTouchedLocal: mp3ReadyForProductionSmokeLocal,
    timelineActionBound: true,
    timelineStateTouchedLocal: timelineReadyForProductionSmokeLocal,
    playbackActionBound: true,
    playbackStateTouchedLocal: playbackControlsOpen || playbackControlsState.evidence.queuedPlaybackEvents > 0 || playbackControlsState.evidence.progressPercentLocal > 0 || sourcePreviewPlaybackState.evidence.playbackBoundLocal || sourcePreviewPlaybackState.evidence.progressPercentLocal > 0,
  }), [
    creationToolsState.evidence.mp3ImportIntentReady,
    effectsReadyForProductionSmokeLocal,
    mp3ReadyForProductionSmokeLocal,
    playbackControlsOpen,
    playbackControlsState.evidence.progressPercentLocal,
    playbackControlsState.evidence.queuedPlaybackEvents,
    sourcePreviewPlaybackState.evidence.playbackBoundLocal,
    sourcePreviewPlaybackState.evidence.progressPercentLocal,
    captionTextOverlayState.evidence.captionsReadyLocal,
    captionTextOverlayState.evidence.overlayCountLocal,
    socialCommentsState.evidence.commentsCountLocal,
    socialCommentsState.evidence.commentsOpenLocal,
    socialCommentsState.evidence.likedLocal,
    socialCommentsState.evidence.savedLocal,
    socialCommentsState.evidence.shareDraftPreparedLocal,
    timelineReadyForProductionSmokeLocal,
  ]);

  const mobileInteractionQaInput = useMemo(() => ({
    settingsOpenedLocal: studioOpen || mobileInteractionQaState.touchedActionIds.includes("settings"),
    likedLocal: socialCommentsState.evidence.likedLocal,
    commentsOpenOrAddedLocal: socialCommentsState.evidence.commentsOpenLocal || socialCommentsState.evidence.commentsCountLocal > 0,
    shareDraftPreparedLocal: socialCommentsState.evidence.shareDraftPreparedLocal,
    savedLocal: socialCommentsState.evidence.savedLocal,
    recordVideoStateChangedLocal: sourceControlSelectedExplicitlyLocal && sourceFlowState.evidence.cameraAssetSelectedLocal,
    uploadVideoStateChangedLocal: sourceControlSelectedExplicitlyLocal && (sourceFlowState.evidence.libraryAssetSelectedLocal || sourceFlowState.evidence.documentAssetSelectedLocal),
    mp3TrackReadyLocal: audioTrackSelectedExplicitlyLocal,
    effectsAppliedLocal: effectsReadyForMobileQaLocal,
  }), [
    effectsReadyForMobileQaLocal,
    sourceControlSelectedExplicitlyLocal,
    audioTrackSelectedExplicitlyLocal,
    mobileInteractionQaState.touchedActionIds,
    socialCommentsState.evidence.commentsCountLocal,
    socialCommentsState.evidence.commentsOpenLocal,
    socialCommentsState.evidence.likedLocal,
    socialCommentsState.evidence.savedLocal,
    socialCommentsState.evidence.shareDraftPreparedLocal,
    sourceFlowState.evidence.cameraAssetSelectedLocal,
    sourceFlowState.evidence.documentAssetSelectedLocal,
    sourceFlowState.evidence.libraryAssetSelectedLocal,
    studioOpen,
  ]);

  const mobileInteractionQaEvidence = useMemo(
    () => buildStreamShortVideoRealMobileInteractionQaEvidence(mobileInteractionQaState, mobileInteractionQaInput),
    [mobileInteractionQaInput, mobileInteractionQaState],
  );

  const selectedReviewSocialCommentLocal = useMemo(
    () => socialCommentsState.comments.find((comment) => (comment.status === "local_only" || comment.status === "pinned_local") && comment.id === socialCommentsState.selectedCommentId) ?? null,
    [socialCommentsState.comments, socialCommentsState.selectedCommentId],
  );
  const socialCommentsHaveSelectableLocalItems = useMemo(
    () => socialCommentsState.comments.some((comment) => comment.status === "local_only" || comment.status === "pinned_local"),
    [socialCommentsState.comments],
  );
  const socialCommentSelectionRequired = socialCommentsHaveSelectableLocalItems && selectedReviewSocialCommentLocal === null;
  const socialCommentsReadyForFinalBehaviorLocal = !socialCommentSelectionRequired && (socialCommentsState.evidence.commentsOpenLocal || socialCommentsState.evidence.commentsCountLocal > 0);

  const socialFinalBehaviorEvidence = useMemo(() => buildStreamShortVideoSocialFinalBehaviorEvidence({
    likedLocal: socialCommentsState.evidence.likedLocal,
    commentsOpenedLocal: socialCommentsReadyForFinalBehaviorLocal,
    commentsCountLocal: socialCommentsReadyForFinalBehaviorLocal ? socialCommentsState.evidence.commentsCountLocal : 0,
    shareDraftPreparedLocal: socialCommentsState.evidence.shareDraftPreparedLocal,
    savedLocal: socialCommentsState.evidence.savedLocal,
    fakeLikeAllowed: socialCommentsState.evidence.fakeLikeAllowed,
    fakeCommentDeliveryAllowed: socialCommentsState.evidence.fakeCommentDeliveryAllowed,
    fakeShareDeliveryAllowed: socialCommentsState.evidence.fakeShareDeliveryAllowed,
    fakeSaveProviderAllowed: socialCommentsState.evidence.fakeSaveProviderAllowed,
  }), [
    socialCommentsReadyForFinalBehaviorLocal,
    socialCommentsState.evidence.commentsCountLocal,
    socialCommentsState.evidence.fakeCommentDeliveryAllowed,
    socialCommentsState.evidence.fakeLikeAllowed,
    socialCommentsState.evidence.fakeSaveProviderAllowed,
    socialCommentsState.evidence.fakeShareDeliveryAllowed,
    socialCommentsState.evidence.likedLocal,
    socialCommentsState.evidence.savedLocal,
    socialCommentsState.evidence.shareDraftPreparedLocal,
  ]);

  const viewerSwipeStartRef = useRef<ShortVideoViewerSwipePointLocal | null>(null);
  const viewerLastSwipeHandledAtRef = useRef(0);

  const resetShortVideoKeyboardSurfacesLocal = () => {
    Keyboard.dismiss();
    setSettingsKeyboardBottomInset(0);
  };

  const clearShortVideoTransientFeedbackLocal = () => {
    resetShortVideoActionFeedbackLocal();

    if (effectSelectorFeedbackTimerRef.current) {
      clearTimeout(effectSelectorFeedbackTimerRef.current);
      effectSelectorFeedbackTimerRef.current = null;
    }
    if (effectStackFeedbackTimerRef.current) {
      clearTimeout(effectStackFeedbackTimerRef.current);
      effectStackFeedbackTimerRef.current = null;
    }
    if (musicTrackFeedbackTimerRef.current) {
      clearTimeout(musicTrackFeedbackTimerRef.current);
      musicTrackFeedbackTimerRef.current = null;
    }
    if (audioMixerFeedbackTimerRef.current) {
      clearTimeout(audioMixerFeedbackTimerRef.current);
      audioMixerFeedbackTimerRef.current = null;
    }
    if (audioToolFeedbackTimerRef.current) {
      clearTimeout(audioToolFeedbackTimerRef.current);
      audioToolFeedbackTimerRef.current = null;
    }
    if (captionOverlayFeedbackTimerRef.current) {
      clearTimeout(captionOverlayFeedbackTimerRef.current);
      captionOverlayFeedbackTimerRef.current = null;
    }
    if (usefulOverlayFeedbackTimerRef.current) {
      clearTimeout(usefulOverlayFeedbackTimerRef.current);
      usefulOverlayFeedbackTimerRef.current = null;
    }

    setEffectSelectorFeedbackId(null);
    setEffectStackFeedbackId(null);
    setMusicTrackFeedbackId(null);
    setAudioMixerFeedbackId(null);
    setAudioToolFeedbackId(null);
    setCaptionOverlayFeedbackId(null);
    setUsefulOverlayFeedbackId(null);
  };

  const closeShortsStudioPanelLocal = () => {
    resetShortVideoKeyboardSurfacesLocal();
    clearShortVideoTransientFeedbackLocal();
    setStudioOpen(false);
  };

  const resetSettingsKeyboardForNavigationLocal = () => {
    resetShortVideoKeyboardSurfacesLocal();
    clearShortVideoTransientFeedbackLocal();
    setTimeout(() => settingsScrollRef.current?.scrollTo({ y: 0, animated: false }), 0);
  };

  const selectPreviousFeedDraftKeyboardSafeLocal = () => {
    resetShortVideoKeyboardSurfacesLocal();
    setFeedDraftListState((current) => {
      const next = selectPreviousShortVideoFeedDraft(current);
      setExplicitFeedDraftSelectionId(next.selectedDraftId ?? null);
      return next;
    });
  };

  const selectNextFeedDraftKeyboardSafeLocal = () => {
    resetShortVideoKeyboardSurfacesLocal();
    setFeedDraftListState((current) => {
      const next = selectNextShortVideoFeedDraft(current);
      setExplicitFeedDraftSelectionId(next.selectedDraftId ?? null);
      return next;
    });
  };

  const focusSocialActionFromReview = (actionId: StreamShortVideoSocialFinalBehaviorActionId) => {
    if (viewerSocialDraftSelectionRequired) return;
    if (actionId === "comments") {
      closeShortsStudioPanelLocal();
      setSocialCommentsState(openStreamShortVideoCommentsLocal);
      markMobileInteractionLocal("comments");
      return;
    }
    if (actionId === "share") {
      void shareShortVideoLocal();
      return;
    }
    if (actionId === "save") {
      tapShortsSaveLocal();
      return;
    }
    if (actionId === "like") {
      tapShortsLikeLocal();
    }
  };

  const markMobileInteractionLocal = (actionId: StreamShortVideoRealMobileInteractionQaActionId) => {
    setMobileInteractionQaState((current) => markStreamShortVideoMobileInteractionActionLocal(current, actionId));
  };

  const runMobileInteractionQaLocal = () => {
    if (viewerSocialDraftSelectionRequired || socialCommentSelectionRequired) return;
    setMobileInteractionQaState((current) => queueStreamShortVideoMobileInteractionQaCheck(current, mobileInteractionQaInput));
  };

  const requestMobileInteractionProviderBlocked = () => {
    setMobileInteractionQaState(requestStreamShortVideoMobileInteractionProviderBlocked);
  };

  const applySourceIntent = (sourceIntent: StreamShortVideoSourceIntent) => {
    setExplicitSourceControlSelectionId(null);
    setState((current) => setStreamShortVideoSourceIntent(current, sourceIntent));
    setSourceState((current) => selectStreamShortVideoSourceByDraftIntent(current, sourceIntent));
  };

  const selectSourceControlWithExplicitSelectionLocal = (sourceId: StreamShortVideoSourceId) => {
    setExplicitSourceControlSelectionId(sourceId);
    setSourceState((current) => selectStreamShortVideoSource(current, sourceId));
    const next = sourceState.sources.find((item) => item.sourceId === sourceId);
    if (next) setState((current) => setStreamShortVideoSourceIntent(current, next.draftIntent));
  };

  const runSelectedSourceControlMutationWithExplicitSelectionGuardLocal = (action: () => void) => {
    if (sourceControlActionDisabled) return;
    action();
  };

  const requestSelectedSourcePermissionWithExplicitSelectionGuardLocal = () => {
    runSelectedSourceControlMutationWithExplicitSelectionGuardLocal(() => setSourceState(requestSelectedStreamShortVideoSourcePermission));
  };

  const requestSelectedSourceProviderLockedWithExplicitSelectionGuardLocal = () => {
    runSelectedSourceControlMutationWithExplicitSelectionGuardLocal(() => setSourceState(requestStreamShortVideoSourceProviderHandoffBlocked));
  };

  const markSelectedSourceAssetIntentWithExplicitSelectionGuardLocal = () => {
    runSelectedSourceControlMutationWithExplicitSelectionGuardLocal(() => setSourceState(markSelectedStreamShortVideoSourceAssetIntent));
  };

  const markSelectedSourceCoverIntentWithExplicitSelectionGuardLocal = () => {
    runSelectedSourceControlMutationWithExplicitSelectionGuardLocal(() => {
      setSourceState(markSelectedStreamShortVideoSourceCoverIntent);
      setState(markStreamShortVideoCoverIntent);
    });
  };

  const acknowledgeSelectedSourcePolicyWithExplicitSelectionGuardLocal = () => {
    runSelectedSourceControlMutationWithExplicitSelectionGuardLocal(() => setSourceState(acknowledgeSelectedStreamShortVideoSourcePolicy));
  };

  const markDraftCoverIntentWithExplicitSourceSelectionGuardLocal = () => {
    runSelectedSourceControlMutationWithExplicitSelectionGuardLocal(() => setState(markStreamShortVideoCoverIntent));
  };

  const acknowledgeDraftPolicyWithExplicitSourceSelectionGuardLocal = () => {
    runSelectedSourceControlMutationWithExplicitSelectionGuardLocal(() => setState(acknowledgeStreamShortVideoContentPolicy));
  };

  const normalizePickedVideoAsset = (
    rawAsset: Record<string, unknown>,
    kind: StreamShortVideoRecordUploadSourceKind,
  ): StreamShortVideoPickedLocalAssetInput | null => {
    const uri = typeof rawAsset.uri === "string" ? rawAsset.uri : null;
    if (!uri) return null;
    const fileName = typeof rawAsset.fileName === "string"
      ? rawAsset.fileName
      : typeof rawAsset.name === "string"
        ? rawAsset.name
        : kind === "camera_record"
          ? "Записанное видео"
          : kind === "library_video"
            ? "Видео из галереи"
            : "Выбранный видеофайл";
    const mimeType = typeof rawAsset.mimeType === "string" ? rawAsset.mimeType : typeof rawAsset.type === "string" ? rawAsset.type : "video/*";
    const durationMs = typeof rawAsset.duration === "number" ? rawAsset.duration : null;
    const width = typeof rawAsset.width === "number" ? rawAsset.width : null;
    const height = typeof rawAsset.height === "number" ? rawAsset.height : null;
    const size = typeof rawAsset.fileSize === "number" ? rawAsset.fileSize : typeof rawAsset.size === "number" ? rawAsset.size : null;
    return { kind, uri, fileName, mimeType, durationMs, width, height, size };
  };

  const bindPickedVideoSourceLocal = (pickedAsset: StreamShortVideoPickedLocalAssetInput) => {
    const sourceIntent: StreamShortVideoSourceIntent = pickedAsset.kind === "camera_record" ? "camera" : "upload";
    setExplicitSourceControlSelectionId(null);
    setState((current) => setStreamShortVideoSourceIntent(current, sourceIntent));
    setSourceState((current) => {
      let next = selectStreamShortVideoSourceByDraftIntent(current, sourceIntent);
      next = requestSelectedStreamShortVideoSourcePermission(next);
      next = markSelectedStreamShortVideoSourceAssetIntent(next);
      next = acknowledgeSelectedStreamShortVideoSourcePolicy(next);
      return queueStreamShortVideoSourceLocalEvent(next, "short_source_asset_intent_ready_local");
    });
    setSourceFlowState((current) => {
      const committed = markStreamShortVideoPickedAssetTimelineBound(commitStreamShortVideoPickedLocalAsset(current, pickedAsset));
      const asset = committed.assets.find((item) => item.assetId === committed.selectedAssetId) ?? null;
      setSourcePreviewPlaybackState((preview) => bindStreamShortVideoSourcePreviewPlaybackAssetLocal(preview, asset));
      setTrimCropCoverFrameState((editor) => bindStreamShortVideoTrimCropCoverFrameAssetLocal(editor, asset));
      const editorAsset = asset ? {
        fileName: asset.title,
        durationMs: asset.durationMsLocal,
      } : null;
      setCaptionTextOverlayState((captionEditor) => bindStreamShortVideoCaptionTextOverlayAssetLocal(captionEditor, editorAsset));
      setUsefulOverlayEditorState((overlayEditor) => bindStreamShortVideoUsefulOverlayAssetLocal(overlayEditor, editorAsset));
      return committed;
    });
    setTimelineState((current) => addStreamShortVideoTimelineClip(current, pickedAsset.kind === "camera_record" ? "camera_segment" : "uploaded_segment"));
    setSourceOpen(true);
    setTimelineOpen(true);
  };

  const requestNativeVideoSourceLocal = async (kind: StreamShortVideoRecordUploadSourceKind) => {
    resetShortVideoKeyboardSurfacesLocal();
    markMobileInteractionLocal(kind === "camera_record" ? "record_video" : "upload_video");
    const sourceIntent: StreamShortVideoSourceIntent = kind === "camera_record" ? "camera" : "upload";
    applySourceIntent(sourceIntent);
    setSourceOpen(true);
    setSourceFlowState((current) => markStreamShortVideoRecordUploadPermissionRequested(selectStreamShortVideoRecordUploadSourceFlow(current, kind)));

    try {
      if (kind === "camera_record") {
        setSourceFlowState(markStreamShortVideoRecordUploadPickerOpened);
        setShortsCameraOpen(true);
        return;
      }

      if (kind === "library_video") {
        const permission = await (ImagePicker as any).requestMediaLibraryPermissionsAsync?.();
        if (permission && permission.granted === false && permission.status !== "granted") {
          setSourceFlowState(markStreamShortVideoRecordUploadPermissionBlocked);
          return;
        }
        setSourceFlowState(markStreamShortVideoRecordUploadPickerOpened);
        const result = await (ImagePicker as any).launchImageLibraryAsync?.({
          mediaTypes: "videos",
          allowsEditing: true,
          quality: 1,
          videoMaxDuration: 60,
        });
        if (!result || result.canceled) {
          setSourceFlowState(markStreamShortVideoRecordUploadCancelled);
          return;
        }
        const rawAsset = Array.isArray(result.assets) ? result.assets[0] : null;
        const pickedAsset = rawAsset ? normalizePickedVideoAsset(rawAsset, kind) : null;
        if (!pickedAsset) {
          setSourceFlowState(markStreamShortVideoRecordUploadCancelled);
          return;
        }
        bindPickedVideoSourceLocal(pickedAsset);
        return;
      }

      setSourceFlowState(markStreamShortVideoRecordUploadPickerOpened);
      const result = await DocumentPicker.getDocumentAsync({
        type: ["video/mp4", "video/quicktime", "video/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) {
        setSourceFlowState(markStreamShortVideoRecordUploadCancelled);
        return;
      }
      const rawAsset = result.assets[0] as unknown as Record<string, unknown> | undefined;
      const pickedAsset = rawAsset ? normalizePickedVideoAsset(rawAsset, kind) : null;
      if (!pickedAsset) {
        setSourceFlowState(markStreamShortVideoRecordUploadCancelled);
        return;
      }
      bindPickedVideoSourceLocal(pickedAsset);
    } catch {
      setSourceFlowState(markStreamShortVideoRecordUploadCancelled);
    }
  };

  const closeSabiShortsCameraLocal = () => {
    setShortsCameraOpen(false);
    setSourceFlowState(markStreamShortVideoRecordUploadCancelled);
  };

  const handleSabiShortsCameraRecordedLocal = (asset: SabiShortsCameraRecordedAssetInput) => {
    const pickedAsset = normalizePickedVideoAsset(asset as unknown as Record<string, unknown>, "camera_record");
    if (!pickedAsset) {
      setSourceFlowState(markStreamShortVideoRecordUploadCancelled);
      setShortsCameraOpen(false);
      return;
    }
    bindPickedVideoSourceLocal(pickedAsset);
    setShortsCameraOpen(false);
  };

  const recordShortVideoFromCameraLocal = () => requestNativeVideoSourceLocal("camera_record");
  const pickShortVideoFromLibraryLocal = () => requestNativeVideoSourceLocal("library_video");
  const pickShortVideoDocumentLocal = () => requestNativeVideoSourceLocal("document_video");

  const closeVideoSourceSheetLocal = () => {
    resetShortVideoKeyboardSurfacesLocal();
    setVideoSourceSheetOpen(false);
  };

  const openVideoSourceSheetLocal = () => {
    resetShortVideoKeyboardSurfacesLocal();
    setSourceSettingsSection("video");
    setStudioOpen(true);
    setSettingsAdvancedOpen(false);
    setSourceOpen(true);
    setVideoSourceSheetOpen(true);
  };

  const recordShortVideoFromSourceSheetLocal = () => {
    closeVideoSourceSheetLocal();
    void recordShortVideoFromCameraLocal();
  };

  const pickShortVideoFromGallerySheetLocal = async () => {
    closeVideoSourceSheetLocal();
    await pickShortVideoFromLibraryLocal();
  };

  const pickShortVideoFileFromSourceSheetLocal = async () => {
    closeVideoSourceSheetLocal();
    await pickShortVideoDocumentLocal();
  };

  const requestVideoSourceProviderLockedLocal = () => {
    if (sourceFlowExplicitSelectionDisabled) return;
    setSourceFlowState(requestStreamShortVideoRecordUploadSourceProviderBlocked);
  };

  const requestSourceFlowProviderLockedWithExplicitSelectionGuardLocal = () => {
    requestVideoSourceProviderLockedLocal();
  };

  const requestSourcePreviewProviderLockedWithExplicitSelectionGuardLocal = () => {
    if (sourcePreviewExplicitSelectionDisabled) return;
    setSourcePreviewPlaybackState(requestStreamShortVideoSourcePreviewProviderBlocked);
  };

  const requestTrimCropCoverProviderLockedWithExplicitSelectionGuardLocal = () => {
    if (trimCropCoverExplicitSelectionDisabled) return;
    setTrimCropCoverFrameState(requestStreamShortVideoTrimCropCoverFrameProviderBlocked);
  };

  const requestCaptionTextOverlayProviderLockedWithExplicitSelectionGuardLocal = () => {
    if (captionOverlaySelectionRequired) return;
    setCaptionTextOverlayState(requestStreamShortVideoCaptionTextOverlayProviderBlocked);
  };

  const requestUsefulOverlayProviderLockedWithExplicitSelectionGuardLocal = () => {
    if (usefulOverlaySelectionRequired) return;
    setUsefulOverlayEditorState(requestStreamShortVideoUsefulOverlayProviderBlocked);
  };

  const requestEffectsEditorProviderLockedWithLayerGuardLocal = () => {
    if (effectLayerActionDisabled) return;
    setEffectsEditorState(requestStreamShortVideoEffectsEditorProviderBlocked);
  };

  const requestTimelineProviderLockedWithClipGuardLocal = () => {
    if (timelineClipActionDisabled) return;
    setTimelineState(requestStreamShortVideoTimelineProviderHandoffBlocked);
  };

  const requestStorageHandoffBlockedWithExplicitSelectionGuardLocal = () => {
    if (finalReviewExplicitSelectionDisabled) return;
    setState(requestStreamShortVideoStorageHandoffBlocked);
  };

  const requestReviewProviderBlockedWithExplicitSelectionGuardLocal = () => {
    if (selectedReviewExplicitSelectionDisabled) return;
    setReviewState(requestStreamShortVideoCoverCaptionProviderBlocked);
  };

  const runSourcePreviewPlaybackActionWithExplicitSelectionGuardLocal = (action: () => void) => {
    if (sourcePreviewExplicitSelectionDisabled) return;
    action();
  };

  const playSourcePreviewLocal = async () => {
    if (sourcePreviewExplicitSelectionDisabled) return;
    setSourcePreviewPlaybackState(playStreamShortVideoSourcePreviewLocal);
    await sourcePreviewVideoRef.current?.playAsync?.();
  };

  const pauseSourcePreviewLocal = async () => {
    if (sourcePreviewExplicitSelectionDisabled) return;
    setSourcePreviewPlaybackState(pauseStreamShortVideoSourcePreviewLocal);
    await sourcePreviewVideoRef.current?.pauseAsync?.();
  };

  const restartSourcePreviewLocal = async () => {
    if (sourcePreviewExplicitSelectionDisabled) return;
    setSourcePreviewPlaybackState(restartStreamShortVideoSourcePreviewLocal);
    await sourcePreviewVideoRef.current?.setPositionAsync?.(0);
    await sourcePreviewVideoRef.current?.playAsync?.();
  };

  const markSourcePreviewReadyWithExplicitSelectionGuardLocal = () => {
    if (sourcePreviewExplicitSelectionDisabled) return;
    setSourcePreviewPlaybackState(markStreamShortVideoSourcePreviewReadyLocal);
  };

  const onSourcePreviewPlaybackStatusUpdate = (playbackStatus: { readonly isLoaded?: boolean; readonly isPlaying?: boolean; readonly positionMillis?: number; readonly durationMillis?: number }) => {
    if (sourcePreviewExplicitSelectionDisabled) return;
    setSourcePreviewPlaybackState((current) => syncStreamShortVideoSourcePreviewPlaybackStatusLocal(current, playbackStatus));
  };

  const bindTrimCropCoverToTimelineLocal = () => {
    setTrimCropCoverFrameState((current) => markStreamShortVideoTrimCropTimelineBoundLocal(current));
    setTimelineState((current) => {
      let next = trimSelectedStreamShortVideoTimelineClip(current);
      next = markSelectedStreamShortVideoTimelineClipAsCover(next);
      return queueStreamShortVideoTimelineLocalEvent(next, "short_timeline_reviewed_local");
    });
    setTimelineOpen(true);
  };

  const bindTrimCropCoverToReviewLocal = () => {
    setTrimCropCoverFrameState((current) => markStreamShortVideoTrimCropReviewCoverBoundLocal(current));
    setReviewState((current) => reviewStreamShortVideoCoverFrame(current));
    setReviewOpen(true);
  };


  const updateDraftCaptionTextLocal = (caption: string) => {
    setState((current) => updateStreamShortVideoDraftText(current, { caption }));
  };

  const updateCaptionOverlayTextLocal = (text: string) => {
    if (!selectedCaptionOverlay) return;
    setCaptionTextOverlayState((current) => updateSelectedStreamShortVideoCaptionTextOverlayLocal(current, text));
  };

  const runCaptionOverlayMutationWithExplicitSelectionGuardLocal = (action: () => void) => {
    if (!selectedCaptionOverlay) return;
    action();
  };

  const runUsefulOverlayMutationWithExplicitSelectionGuardLocal = (action: () => void) => {
    if (!selectedUsefulOverlay) return;
    action();
  };

  const bindCaptionOverlayToTimelineLocal = () => {
    if (!selectedCaptionOverlay) return;
    setCaptionTextOverlayState((current) => markStreamShortVideoCaptionTextOverlayTimelineBoundLocal(current));
    setTimelineState((current) => queueStreamShortVideoTimelineLocalEvent(addStreamShortVideoTimelineClip(current, "text_overlay"), "short_timeline_clip_added_local"));
    setState(markStreamShortVideoCaptionReview);
    setTimelineOpen(true);
  };

  const bindCaptionOverlayToReviewLocal = () => {
    if (!selectedCaptionOverlay) return;
    setCaptionTextOverlayState((current) => markStreamShortVideoCaptionTextOverlayReviewBoundLocal(current));
    setState(markStreamShortVideoCaptionReview);
    setReviewOpen(true);
  };

  const runCaptionOverlayCheckWithExplicitSelectionGuardLocal = () => {
    if (!selectedCaptionOverlay) return;
    setCaptionTextOverlayState(runStreamShortVideoCaptionTextOverlayCheck);
  };

  const queueCaptionOverlayEventWithExplicitSelectionGuardLocal = () => {
    if (!selectedCaptionOverlay) return;
    setCaptionTextOverlayState(queueStreamShortVideoCaptionTextOverlayEvent);
  };

  const updateUsefulOverlayLabelLocal = (text: string) => {
    if (!selectedUsefulOverlay) return;
    setUsefulOverlayEditorState((current) => updateSelectedStreamShortVideoUsefulOverlayLabelLocal(current, text));
  };

  const bindUsefulOverlayToTimelineLocal = () => {
    if (!selectedUsefulOverlay) return;
    setUsefulOverlayEditorState((current) => markStreamShortVideoUsefulOverlayTimelineBoundLocal(current));
    setTimelineState((current) => queueStreamShortVideoTimelineLocalEvent(addStreamShortVideoTimelineClip(current, "text_overlay"), "short_timeline_clip_added_local"));
    setTimelineOpen(true);
  };

  const bindUsefulOverlayToReviewLocal = () => {
    if (!selectedUsefulOverlay) return;
    setUsefulOverlayEditorState((current) => markStreamShortVideoUsefulOverlayReviewBoundLocal(current));
    setReviewOpen(true);
  };

  const runUsefulOverlayCheckWithExplicitSelectionGuardLocal = () => {
    if (!selectedUsefulOverlay) return;
    setUsefulOverlayEditorState(runStreamShortVideoUsefulOverlayEditorCheck);
  };

  const queueUsefulOverlayEventWithExplicitSelectionGuardLocal = () => {
    if (!selectedUsefulOverlay) return;
    setUsefulOverlayEditorState(queueStreamShortVideoUsefulOverlayEditorEvent);
  };

  const runTimelineCheck = () => {
    setTimelineState((current) => {
      const next = runStreamShortVideoTimelineReadinessCheck(current);
      if (next.evidence.timelineReadyLocal) {
        setState(markStreamShortVideoEditorTimeline);
      }
      return next;
    });
  };

  const queueTimelineEvent = () => {
    setTimelineState((current) => queueStreamShortVideoTimelineLocalEvent(current));
    setState((current) => queueStreamShortVideoDraftLocalEvent(current, STREAM_SHORT_VIDEO_TIMELINE_DRAFT_EVENT_KIND));
  };

  const addTimelineClipWithExplicitSelectionGuardLocal = (clipKind: StreamShortVideoTimelineClipKind) => {
    if ((clipKind === "text_overlay" || clipKind === "caption_track") && timelineCaptionClipExplicitSelectionDisabled) return;
    setTimelineState((current) => addStreamShortVideoTimelineClip(current, clipKind));
  };

  const markTimelineCaptionsReadyWithExplicitSelectionGuardLocal = () => {
    if (timelineCaptionClipExplicitSelectionDisabled) return;
    setTimelineState(markStreamShortVideoTimelineCaptionsReady);
    setState(markStreamShortVideoCaptionReview);
  };

  const runTimelineSelectedClipMutationWithExplicitSelectionGuardLocal = (action: () => void) => {
    if (timelineClipActionDisabled) return;
    action();
  };

  const trimSelectedTimelineClipWithExplicitSelectionGuardLocal = () => {
    runTimelineSelectedClipMutationWithExplicitSelectionGuardLocal(() => setTimelineState(trimSelectedStreamShortVideoTimelineClip));
  };

  const splitSelectedTimelineClipWithExplicitSelectionGuardLocal = () => {
    runTimelineSelectedClipMutationWithExplicitSelectionGuardLocal(() => setTimelineState(splitSelectedStreamShortVideoTimelineClip));
  };

  const moveSelectedTimelineClipWithExplicitSelectionGuardLocal = (direction: "up" | "down") => {
    runTimelineSelectedClipMutationWithExplicitSelectionGuardLocal(() => setTimelineState((current) => moveSelectedStreamShortVideoTimelineClip(current, direction)));
  };

  const markSelectedTimelineCoverWithExplicitSelectionGuardLocal = () => {
    runTimelineSelectedClipMutationWithExplicitSelectionGuardLocal(() => {
      setTimelineState(markSelectedStreamShortVideoTimelineClipAsCover);
      setState(markStreamShortVideoCoverIntent);
    });
  };

  const acknowledgeTimelinePolicyWithExplicitClipSelectionGuardLocal = () => {
    runTimelineSelectedClipMutationWithExplicitSelectionGuardLocal(() => {
      setTimelineState(acknowledgeStreamShortVideoTimelinePolicyReview);
      setState(acknowledgeStreamShortVideoContentPolicy);
    });
  };

  const runTimelineCheckWithExplicitSelectionGuardLocal = () => {
    if (timelineEditorExplicitSelectionDisabled) return;
    runTimelineCheck();
  };

  const queueTimelineEventWithExplicitSelectionGuardLocal = () => {
    if (timelineEditorExplicitSelectionDisabled) return;
    queueTimelineEvent();
  };

  const runDraftReadinessCheckWithExplicitSelectionGuardLocal = () => {
    if (finalReviewExplicitSelectionDisabled) return;
    setState(runStreamShortVideoDraftReadinessCheck);
  };

  const markCaptionReviewWithExplicitSelectionGuardLocal = () => {
    if (captionOverlaySelectionRequired) return;
    setState(markStreamShortVideoCaptionReview);
  };

  const runSourceFlowCheckWithExplicitSelectionGuardLocal = () => {
    if (sourceFlowExplicitSelectionDisabled) return;
    setSourceFlowState(runStreamShortVideoRecordUploadSourceFlowCheck);
  };

  const queueSourceFlowEventWithExplicitSelectionGuardLocal = () => {
    if (sourceFlowExplicitSelectionDisabled) return;
    setSourceFlowState(queueStreamShortVideoRecordUploadSourceFlowEvent);
  };

  const markSourceCaptionIntentWithExplicitSelectionGuardLocal = () => {
    if (sourceCaptionIntentExplicitSelectionDisabled) return;
    setSourceState(markSelectedStreamShortVideoSourceCaptionIntent);
    setState(markStreamShortVideoCaptionReview);
  };

  const runSourceReadinessCheckWithExplicitSelectionGuardLocal = () => {
    if (sourceSettingsExplicitSelectionDisabled) return;
    setSourceState((current) => {
      const next = runStreamShortVideoSourceReadinessCheck(current);
      const nextDraftIntent = getStreamShortVideoSourceDraftIntent(next);
      if (nextDraftIntent) {
        setState((draft) => setStreamShortVideoSourceIntent(draft, nextDraftIntent));
      }
      return next;
    });
  };

  const queueSourceEventWithExplicitSelectionGuardLocal = () => {
    if (sourceSettingsExplicitSelectionDisabled) return;
    setSourceState(queueStreamShortVideoSourceLocalEvent);
  };

  const runSourcePreviewCheckWithExplicitSelectionGuardLocal = () => {
    if (sourcePreviewExplicitSelectionDisabled) return;
    setSourcePreviewPlaybackState(runStreamShortVideoSourcePreviewPlaybackCheck);
  };

  const queueSourcePreviewEventWithExplicitSelectionGuardLocal = () => {
    if (sourcePreviewExplicitSelectionDisabled) return;
    setSourcePreviewPlaybackState(queueStreamShortVideoSourcePreviewPlaybackEvent);
  };

  const runTrimCropCoverMutationWithExplicitSelectionGuardLocal = (action: () => void) => {
    if (trimCropCoverExplicitSelectionDisabled) return;
    action();
  };

  const bindTrimCropCoverToTimelineWithExplicitSelectionGuardLocal = () => {
    if (trimCropCoverExplicitSelectionDisabled) return;
    bindTrimCropCoverToTimelineLocal();
  };

  const bindTrimCropCoverToReviewWithExplicitSelectionGuardLocal = () => {
    if (trimCropCoverExplicitSelectionDisabled) return;
    bindTrimCropCoverToReviewLocal();
  };

  const runTrimCropCoverCheckWithExplicitSelectionGuardLocal = () => {
    if (trimCropCoverExplicitSelectionDisabled) return;
    setTrimCropCoverFrameState(runStreamShortVideoTrimCropCoverFrameCheck);
  };

  const queueTrimCropCoverEventWithExplicitSelectionGuardLocal = () => {
    if (trimCropCoverExplicitSelectionDisabled) return;
    setTrimCropCoverFrameState(queueStreamShortVideoTrimCropCoverFrameEvent);
  };

  const selectReviewItemWithExplicitSelectionLocal = (itemId: StreamShortVideoReviewItemId) => {
    setExplicitReviewItemSelectionId(itemId);
    setReviewState((current) => selectStreamShortVideoReviewItem(current, itemId));
  };

  const selectPublishReadinessCheckWithExplicitSelectionLocal = (checkId: StreamShortVideoPublishReadinessCheckId) => {
    setExplicitPublishReadinessCheckSelectionId(checkId);
    setPublishReadinessState((current) => selectStreamShortVideoPublishReadinessCheck(current, checkId));
  };

  const selectFeedAcceptanceCheckWithExplicitSelectionLocal = () => {
    setFeedAcceptanceState((current) => {
      const next = selectStreamShortVideoFeedAcceptanceCheck(current);
      const selected = next.checks.find((check) => check.id === next.selectedCheckId) ?? null;
      setExplicitFeedAcceptanceCheckSelectionId(selected?.id ?? null);
      return next;
    });
  };

  const selectFinalSmokeCheckWithExplicitSelectionLocal = () => {
    setFinalSmokeState((current) => {
      const next = selectStreamShortVideoFinalSmokeCheck(current);
      const selected = next.checks.find((check) => check.id === next.selectedCheckId) ?? null;
      setExplicitFinalSmokeCheckSelectionId(selected?.id ?? null);
      return next;
    });
  };

  const prepareSelectedReviewItemLocal = () => {
    if (selectedReviewExplicitSelectionDisabled) return;
    setReviewState(prepareSelectedStreamShortVideoReviewItem);
  };

  const reviewSelectedReviewItemLocal = () => {
    if (selectedReviewExplicitSelectionDisabled) return;
    setReviewState(reviewSelectedStreamShortVideoReviewItem);
  };

  const runFinalReviewWithExplicitSelectionGuardLocal = () => {
    if (finalReviewExplicitSelectionDisabled) return;
    setState(runStreamShortVideoDraftReadinessCheck);
    runTimelineCheck();
    runMobileInteractionQaLocal();
  };

  const reviewCoverFrame = () => {
    if (reviewCoverFrameActionDisabled) return;
    runSelectedSourceControlMutationWithExplicitSelectionGuardLocal(() => {
      setReviewState(reviewStreamShortVideoCoverFrame);
      setState(markStreamShortVideoCoverIntent);
    });
  };

  const reviewCaptions = () => {
    if (reviewCaptionTrackActionDisabled) return;
    setReviewState(reviewStreamShortVideoCaptionTrack);
    setState(markStreamShortVideoCaptionReview);
  };

  const reviewCaptionLanguageLocal = () => {
    if (reviewCaptionLanguageActionDisabled) return;
    setReviewState(reviewStreamShortVideoCaptionLanguage);
  };

  const reviewUsefulOverlayMediaLocal = () => {
    if (reviewMediaActionDisabled) return;
    setReviewState(reviewStreamShortVideoMedia);
  };

  const reviewPolicy = () => {
    if (reviewPolicyActionDisabled) return;
    runSelectedSourceControlMutationWithExplicitSelectionGuardLocal(() => {
      setReviewState(reviewStreamShortVideoContentPolicy);
      setState(acknowledgeStreamShortVideoContentPolicy);
    });
  };

  const reviewPublishHandoffWithExplicitSelectionGuardLocal = () => {
    if (reviewPublishHandoffActionDisabled) return;
    setReviewState(reviewStreamShortVideoPublishHandoff);
  };

  const runCoverCaptionReviewCheckWithExplicitSelectionGuardLocal = () => {
    if (finalReviewExplicitSelectionDisabled) return;
    setReviewState(runStreamShortVideoCoverCaptionReviewCheck);
  };

  const queueCoverCaptionReviewEventWithExplicitSelectionGuardLocal = () => {
    if (finalReviewExplicitSelectionDisabled) return;
    setReviewState(queueStreamShortVideoCoverCaptionReviewEvent);
  };

  const runPublishReadinessGate = () => {
    if (publishReadinessExplicitSelectionDisabled) return;
    setPublishReadinessState((current) => runStreamShortVideoPublishReadinessGate(current, state, timelineState, sourceState, reviewState));
  };

  const reviewPublishReadinessCheck = () => {
    if (selectedPublishReadinessExplicitSelectionDisabled) return;
    setPublishReadinessState((current) => reviewSelectedStreamShortVideoPublishReadinessCheck(current, state, timelineState, sourceState, reviewState));
  };

  const queuePublishReadinessEvent = () => {
    if (publishReadinessExplicitSelectionDisabled) return;
    setPublishReadinessState((current) => queueStreamShortVideoPublishReadinessEvent(current, state, timelineState, sourceState, reviewState));
  };

  const requestPublishProviderBlocked = () => {
    if (publishProviderBlockedActionDisabled) return;
    setPublishReadinessState((current) => requestStreamShortVideoPublishProviderBlocked(current, state, timelineState, sourceState, reviewState));
  };

  const syncFeedDraftList = () => {
    if (feedDraftSyncExplicitSelectionDisabled) return;
    setExplicitFeedDraftSelectionId(null);
    setFeedDraftListState((current) => syncCurrentShortVideoDraftToFeedList(current, state, timelineState, sourceState, reviewState, publishReadinessState));
  };

  const runFeedDraftListCheck = () => {
    if (feedDraftListExplicitSelectionDisabled) return;
    setFeedDraftListState((current) => runShortVideoFeedDraftListReadinessCheck(current));
  };

  const queueFeedDraftListEvent = () => {
    if (feedDraftListExplicitSelectionDisabled) return;
    setFeedDraftListState((current) => queueShortVideoFeedDraftLocalEvent(current));
  };

  const requestFeedProviderBlocked = () => {
    if (feedDraftListExplicitSelectionDisabled) return;
    setFeedDraftListState((current) => requestShortVideoFeedProviderBlocked(current));
  };

  const requestFeedDraftPlaybackShellWithExplicitSelectionGuardLocal = () => {
    if (feedDraftListExplicitSelectionDisabled) return;
    setFeedDraftListState(requestShortVideoLocalPlaybackShell);
  };

  const pauseFeedDraftPlaybackShellWithExplicitSelectionGuardLocal = () => {
    if (feedDraftListExplicitSelectionDisabled) return;
    setFeedDraftListState(pauseShortVideoLocalPlaybackShell);
  };

  const stopFeedDraftPlaybackShellWithExplicitSelectionGuardLocal = () => {
    if (feedDraftListExplicitSelectionDisabled) return;
    setFeedDraftListState(stopShortVideoLocalPlaybackShell);
  };

  const syncPlaybackControls = () => {
    if (playbackControlsExplicitSelectionDisabled) return;
    setPlaybackControlsState((current) => syncStreamShortVideoPlaybackControlsWithFeed(current, feedDraftListState));
  };

  const queuePlaybackControlsEvent = () => {
    if (playbackControlsExplicitSelectionDisabled) return;
    setPlaybackControlsState((current) => queueStreamShortVideoPlaybackControlsEvent(current));
  };

  const requestPlaybackProviderBlocked = () => {
    if (playbackControlsExplicitSelectionDisabled) return;
    setPlaybackControlsState(requestStreamShortVideoPlaybackProviderBlocked);
  };

  const playShortVideoPlaybackWithExplicitFeedDraftGuardLocal = () => {
    if (playbackControlsExplicitSelectionDisabled) return;
    setPlaybackControlsState(playStreamShortVideoPlaybackLocal);
  };

  const pauseShortVideoPlaybackWithExplicitFeedDraftGuardLocal = () => {
    if (playbackControlsExplicitSelectionDisabled) return;
    setPlaybackControlsState(pauseStreamShortVideoPlaybackLocal);
  };

  const stopShortVideoPlaybackWithExplicitFeedDraftGuardLocal = () => {
    if (playbackControlsExplicitSelectionDisabled) return;
    setPlaybackControlsState(stopStreamShortVideoPlaybackLocal);
  };

  const seekShortVideoPlaybackWithExplicitFeedDraftGuardLocal = (direction: "back" | "forward") => {
    if (playbackControlsExplicitSelectionDisabled) return;
    setPlaybackControlsState((current) => seekStreamShortVideoPlaybackLocal(current, direction));
  };

  const toggleShortVideoPlaybackMuteWithExplicitFeedDraftGuardLocal = () => {
    if (playbackControlsExplicitSelectionDisabled) return;
    setPlaybackControlsState(toggleStreamShortVideoPlaybackMuteLocal);
  };

  const toggleShortVideoPlaybackLoopWithExplicitFeedDraftGuardLocal = () => {
    if (playbackControlsExplicitSelectionDisabled) return;
    setPlaybackControlsState(toggleStreamShortVideoPlaybackLoopLocal);
  };

  const cycleShortVideoPlaybackSpeedWithExplicitFeedDraftGuardLocal = () => {
    if (playbackControlsExplicitSelectionDisabled) return;
    setPlaybackControlsState(cycleStreamShortVideoPlaybackSpeedLocal);
  };

  const cycleShortVideoPlaybackQualityWithExplicitFeedDraftGuardLocal = () => {
    if (playbackControlsExplicitSelectionDisabled) return;
    setPlaybackControlsState(cycleStreamShortVideoPlaybackQualityLocal);
  };

  const syncEngagementState = () => {
    if (engagementExplicitSelectionDisabled) return;
    setEngagementState((current) => syncStreamShortVideoEngagementWithFeedAndPlayback(current, feedDraftListState, playbackControlsState));
  };

  const queueEngagementEvent = () => {
    if (engagementExplicitSelectionDisabled) return;
    setEngagementState((current) => queueStreamShortVideoEngagementLocalEvent(current));
  };

  const requestEngagementProviderBlocked = () => {
    if (engagementExplicitSelectionDisabled) return;
    setEngagementState(requestStreamShortVideoEngagementProviderBlocked);
  };

  const markEngagementViewProgressWithExplicitFeedDraftGuardLocal = () => {
    if (engagementExplicitSelectionDisabled) return;
    setEngagementState(markStreamShortVideoViewProgressLocal);
  };

  const toggleEngagementLikeWithExplicitFeedDraftGuardLocal = () => {
    if (engagementExplicitSelectionDisabled) return;
    setEngagementState(toggleStreamShortVideoLikeLocal);
  };

  const toggleEngagementSaveWithExplicitFeedDraftGuardLocal = () => {
    if (engagementExplicitSelectionDisabled) return;
    setEngagementState(toggleStreamShortVideoSaveLocal);
  };

  const prepareEngagementShareDraftWithExplicitFeedDraftGuardLocal = () => {
    if (engagementExplicitSelectionDisabled) return;
    setEngagementState(prepareStreamShortVideoShareDraftLocal);
  };

  const prepareEngagementReportDraftWithExplicitFeedDraftGuardLocal = () => {
    if (engagementExplicitSelectionDisabled) return;
    setEngagementState((current) => prepareStreamShortVideoReportDraftLocal(current, "local_report_review_required"));
  };

  const selectEffectToolWithFeedbackLocal = (effectId: StreamShortVideoEffectToolId) => {
    if (effectSelectorFeedbackTimerRef.current) {
      clearTimeout(effectSelectorFeedbackTimerRef.current);
      effectSelectorFeedbackTimerRef.current = null;
    }
    setEffectSelectorFeedbackId(effectId);
    setExplicitEffectToolSelectionId(effectId);
    setCreationToolsState((current) => selectStreamShortVideoEffectTool(current, effectId, timelineState, sourceState));
    effectSelectorFeedbackTimerRef.current = setTimeout(() => {
      effectSelectorFeedbackTimerRef.current = null;
      setEffectSelectorFeedbackId((current) => (current === effectId ? null : current));
    }, 900);
  };

  const selectEffectStackLayerWithFeedbackLocal = (stackItemId: string) => {
    if (effectStackFeedbackTimerRef.current) {
      clearTimeout(effectStackFeedbackTimerRef.current);
      effectStackFeedbackTimerRef.current = null;
    }
    setEffectStackFeedbackId(stackItemId);
    setEffectsEditorState((current) => selectStreamShortVideoEditorEffectLocal(current, stackItemId));
    effectStackFeedbackTimerRef.current = setTimeout(() => {
      effectStackFeedbackTimerRef.current = null;
      setEffectStackFeedbackId((current) => (current === stackItemId ? null : current));
    }, 900);
  };

  const clearAudioMixerFeedbackLocal = () => {
    if (audioMixerFeedbackTimerRef.current) {
      clearTimeout(audioMixerFeedbackTimerRef.current);
      audioMixerFeedbackTimerRef.current = null;
    }
    setAudioMixerFeedbackId(null);
  };

  const selectMusicTrackWithFeedbackLocal = (trackId: string) => {
    clearAudioMixerFeedbackLocal();
    if (musicTrackFeedbackTimerRef.current) {
      clearTimeout(musicTrackFeedbackTimerRef.current);
      musicTrackFeedbackTimerRef.current = null;
    }
    setMusicTrackFeedbackId(trackId);
    setExplicitMusicTrackSelectionId(trackId);
    setMusicEditorState((current) => selectStreamShortVideoMusicTrackLocal(current, trackId));
    musicTrackFeedbackTimerRef.current = setTimeout(() => {
      musicTrackFeedbackTimerRef.current = null;
      setMusicTrackFeedbackId((current) => (current === trackId ? null : current));
    }, 900);
  };

  const runAudioMixerActionWithFeedbackLocal = (actionId: "volume" | "original" | "trim" | "start", action: () => void) => {
    if (audioMixerFeedbackTimerRef.current) {
      clearTimeout(audioMixerFeedbackTimerRef.current);
      audioMixerFeedbackTimerRef.current = null;
    }
    setAudioMixerFeedbackId(actionId);
    if (!musicTrackActionDisabled) action();
    audioMixerFeedbackTimerRef.current = setTimeout(() => {
      audioMixerFeedbackTimerRef.current = null;
      setAudioMixerFeedbackId((current) => (current === actionId ? null : current));
    }, 900);
  };

  const removeSelectedMusicTrackWithExplicitResetLocal = () => {
    if (musicTrackActionDisabled) return;
    clearAudioMixerFeedbackLocal();
    setExplicitMusicTrackSelectionId(null);
    setMusicTrackFeedbackId(null);
    setMusicEditorState(removeSelectedStreamShortVideoMusicTrackLocal);
  };

  const selectAudioToolWithFeedbackLocal = (toolId: StreamShortVideoAudioToolId) => {
    if (audioToolFeedbackTimerRef.current) {
      clearTimeout(audioToolFeedbackTimerRef.current);
      audioToolFeedbackTimerRef.current = null;
    }
    setAudioToolFeedbackId(toolId);
    setExplicitAudioToolSelectionId(toolId);
    setCreationToolsState((current) => selectStreamShortVideoAudioTool(current, toolId, timelineState, sourceState));
    audioToolFeedbackTimerRef.current = setTimeout(() => {
      audioToolFeedbackTimerRef.current = null;
      setAudioToolFeedbackId((current) => (current === toolId ? null : current));
    }, 900);
  };

  const selectCaptionOverlayWithFeedbackLocal = (overlayId: string) => {
    resetShortVideoActionFeedbackLocal();
    if (captionOverlayFeedbackTimerRef.current) {
      clearTimeout(captionOverlayFeedbackTimerRef.current);
      captionOverlayFeedbackTimerRef.current = null;
    }
    setExplicitCaptionOverlaySelectionId(overlayId);
    setCaptionOverlayFeedbackId(overlayId);
    setCaptionTextOverlayState((current) => selectStreamShortVideoCaptionTextOverlayLocal(current, overlayId));
    captionOverlayFeedbackTimerRef.current = setTimeout(() => {
      captionOverlayFeedbackTimerRef.current = null;
      setCaptionOverlayFeedbackId((current) => (current === overlayId ? null : current));
    }, 900);
  };

  const selectUsefulOverlayWithFeedbackLocal = (overlayId: string) => {
    resetShortVideoActionFeedbackLocal();
    if (usefulOverlayFeedbackTimerRef.current) {
      clearTimeout(usefulOverlayFeedbackTimerRef.current);
      usefulOverlayFeedbackTimerRef.current = null;
    }
    setExplicitUsefulOverlaySelectionId(overlayId);
    setUsefulOverlayFeedbackId(overlayId);
    setUsefulOverlayEditorState((current) => selectStreamShortVideoUsefulOverlayLocal(current, overlayId));
    usefulOverlayFeedbackTimerRef.current = setTimeout(() => {
      usefulOverlayFeedbackTimerRef.current = null;
      setUsefulOverlayFeedbackId((current) => (current === overlayId ? null : current));
    }, 900);
  };

  const addCaptionOverlayForExplicitSelectionLocal = () => {
    clearShortVideoTransientFeedbackLocal();
    setExplicitCaptionOverlaySelectionId(null);
    setCaptionOverlayFeedbackId(null);
    setCaptionTextOverlayState(addStreamShortVideoCaptionTextOverlayLocal);
  };

  const removeExplicitCaptionOverlayLocal = () => {
    if (!selectedCaptionOverlay) return;
    clearShortVideoTransientFeedbackLocal();
    setExplicitCaptionOverlaySelectionId(null);
    setCaptionOverlayFeedbackId(null);
    setCaptionTextOverlayState(removeSelectedStreamShortVideoCaptionTextOverlayLocal);
  };

  const addUsefulOverlayForExplicitSelectionLocal = () => {
    clearShortVideoTransientFeedbackLocal();
    setExplicitUsefulOverlaySelectionId(null);
    setUsefulOverlayFeedbackId(null);
    setUsefulOverlayEditorState(addStreamShortVideoUsefulOverlayLocal);
  };

  const removeExplicitUsefulOverlayLocal = () => {
    if (!selectedUsefulOverlay) return;
    clearShortVideoTransientFeedbackLocal();
    setExplicitUsefulOverlaySelectionId(null);
    setUsefulOverlayFeedbackId(null);
    setUsefulOverlayEditorState(removeSelectedStreamShortVideoUsefulOverlayLocal);
  };

  const applyEffectTool = () => {
    if (effectToolActionDisabled || !selectedEffectTool) return;
    markMobileInteractionLocal("effect_apply");
    const effectId = selectedEffectTool.id;
    const effectLabel = selectedEffectTool.label;
    setCreationToolsState((current) => applySelectedStreamShortVideoEffectLocal(selectStreamShortVideoEffectTool(current, effectId, timelineState, sourceState), timelineState, sourceState));
    setEffectsEditorState((current) => addStreamShortVideoEffectToEditorStackLocal(current, effectId, effectLabel));
    setTimelineState((current) => addStreamShortVideoTimelineClip(current, "text_overlay"));
  };

  const removeEffectTool = () => {
    setCreationToolsState((current) => removeSelectedStreamShortVideoEffectLocal(current, timelineState, sourceState));
    setEffectsEditorState(removeSelectedStreamShortVideoEditorEffectLocal);
  };

  const syncEffectsEditor = () => {
    setEffectsEditorState((current) => syncStreamShortVideoEffectsEditorWithCreationTools(current, creationToolsState));
  };

  const prepareSelectedEffectReviewWithLayerGuardLocal = () => {
    if (effectLayerActionDisabled) return;
    setEffectsEditorState(prepareSelectedStreamShortVideoEffectReviewLocal);
  };

  const queueEffectsEditorEventWithLayerGuardLocal = () => {
    if (effectLayerActionDisabled) return;
    setEffectsEditorState(queueStreamShortVideoEffectsEditorLocalEvent);
  };

  const adjustSelectedEffectIntensityWithLayerGuardLocal = () => {
    if (effectLayerActionDisabled) return;
    setEffectsEditorState(adjustSelectedStreamShortVideoEffectIntensityLocal);
  };

  const cycleSelectedEffectPresetWithLayerGuardLocal = () => {
    if (effectLayerActionDisabled) return;
    setEffectsEditorState(cycleSelectedStreamShortVideoEffectPresetLocal);
  };

  const toggleSelectedEffectPreviewWithLayerGuardLocal = () => {
    if (effectLayerActionDisabled) return;
    setEffectsEditorState(toggleSelectedStreamShortVideoEffectPreviewLocal);
  };

  const moveSelectedEffectLayerWithLayerGuardLocal = (direction: "up" | "down") => {
    if (effectLayerActionDisabled) return;
    setEffectsEditorState((current) => moveSelectedStreamShortVideoEditorEffectLocal(current, direction));
  };

  const pickMp3TrackLocal = async () => {
    markMobileInteractionLocal("mp3_audio");
    const result = await DocumentPicker.getDocumentAsync({
      type: ["audio/mpeg", "audio/mp3", "audio/*"],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset?.uri) return;
    clearAudioMixerFeedbackLocal();
    setMusicTrackFeedbackId(null);
    setExplicitMusicTrackSelectionId(null);
    setMusicEditorState((current) => importStreamShortVideoMusicTrackLocal(current, {
      name: asset.name ?? "Выбранный MP3",
      uri: asset.uri,
      mimeType: asset.mimeType ?? null,
      size: typeof asset.size === "number" ? asset.size : null,
    }));
    setCreationToolsState((current) => requestStreamShortVideoMp3ImportIntentLocal(current, timelineState, sourceState));
    setTimelineState((current) => addStreamShortVideoTimelineClip(current, "audio_note"));
  };

  const requestMp3Intent = () => {
    void pickMp3TrackLocal();
  };

  const trimMp3Intent = () => {
    runSelectedMusicTrackActionLocal(() => setCreationToolsState((current) => trimStreamShortVideoAudioLocal(current, timelineState, sourceState)));
  };

  const toggleOriginalMute = () => {
    runSelectedMusicTrackActionLocal(() => setCreationToolsState((current) => toggleStreamShortVideoOriginalAudioMuteLocal(current, timelineState, sourceState)));
  };

  const cycleAudioVolume = () => {
    runSelectedMusicTrackActionLocal(() => setCreationToolsState((current) => cycleStreamShortVideoAudioVolumeLocal(current, timelineState, sourceState)));
  };

  const markBeatSync = () => {
    runSelectedMusicTrackActionLocal(() => setCreationToolsState((current) => markStreamShortVideoBeatSyncLocal(current, timelineState, sourceState)));
  };

  const markVoiceoverIntent = () => {
    runSelectedMusicTrackActionLocal(() => setCreationToolsState((current) => markStreamShortVideoVoiceoverIntentLocal(current, timelineState, sourceState)));
  };

  const runCreationToolsCheck = () => {
    if (sourceSettingsSection === "effects" && effectToolActionDisabled) return;
    if (sourceSettingsSection === "audio" && audioToolActionDisabled) return;
    if (creationToolsExplicitSelectionDisabled) return;
    setCreationToolsState((current) => runStreamShortVideoCreationToolsReadinessCheck(current, timelineState, sourceState));
  };

  const queueCreationToolsEvent = () => {
    if (sourceSettingsSection === "effects" && effectToolActionDisabled) return;
    if (sourceSettingsSection === "audio" && audioToolActionDisabled) return;
    if (creationToolsExplicitSelectionDisabled) return;
    setCreationToolsState((current) => queueStreamShortVideoCreationToolsEvent(current, timelineState, sourceState));
  };

  const queueAudioCreationToolsEventWithTrackGuardLocal = () => {
    if (musicTrackActionDisabled || audioToolActionDisabled) return;
    queueCreationToolsEvent();
  };

  const requestCreationToolsProviderBlocked = () => {
    if (sourceSettingsSection === "effects" && effectToolActionDisabled) return;
    if (sourceSettingsSection === "audio" && audioToolActionDisabled) return;
    if (creationToolsExplicitSelectionDisabled) return;
    setCreationToolsState((current) => requestStreamShortVideoCreationToolsProviderBlocked(current, timelineState, sourceState));
  };

  const reviewMusicMixLocal = () => {
    runSelectedMusicTrackActionLocal(() => setMusicEditorState(reviewSelectedStreamShortVideoMusicMixLocal));
  };

  const queueMusicEditorEvent = () => {
    runSelectedMusicTrackActionLocal(() => setMusicEditorState(queueStreamShortVideoMusicEditorLocalEvent));
  };

  const requestMusicEditorProviderBlocked = () => {
    if (musicTrackActionDisabled) return;
    setMusicEditorState(requestStreamShortVideoMusicEditorProviderBlocked);
  };

  const openCommentsSheet = () => {
    if (viewerSocialDraftSelectionRequired) return;
    markMobileInteractionLocal("comments");
    setSocialCommentsState(openStreamShortVideoCommentsLocal);
  };

  const closeCommentsSheet = () => {
    Keyboard.dismiss();
    setSocialCommentsState(closeStreamShortVideoCommentsLocal);
    setCommentDraft((current) => (current.length > 0 ? "" : current));
  };

  const sendCommentLocal = () => {
    if (viewerSocialDraftSelectionRequired) return;
    const text = commentDraft.trim();
    if (!canSendStreamShortVideoCommentDraftLocal(socialCommentsState, text)) {
      if (!socialCommentsState.commentsOpenLocal && commentDraft.length > 0) {
        setCommentDraft("");
      }
      return;
    }
    markMobileInteractionLocal("comments");
    setSocialCommentsState((current) => addStreamShortVideoCommentLocal(current, text));
    setCommentDraft("");
  };

  const startCommentReplyDraftLocal = (commentId: string) => {
    if (viewerSocialDraftSelectionRequired) return;
    const activeReplyDraftCommentId = socialCommentsState.comments.find(
      (comment) => comment.replyDraftLocal && (comment.status === "local_only" || comment.status === "pinned_local"),
    )?.id ?? null;

    if (activeReplyDraftCommentId !== commentId) {
      setCommentDraft((current) => (current.length > 0 ? "" : current));
    }

    setSocialCommentsState((current) => markStreamShortVideoCommentReplyDraftLocal(current, commentId));
  };

  const getShortsShareTextLocal = () => `Шорт: ${state.draft.title || "новый"}`;

  const shareShortVideoLocal = () => {
    if (viewerSocialDraftSelectionRequired) return;
    resetShortVideoKeyboardSurfacesLocal();
    markMobileInteractionLocal("share");
    setSocialCommentsState(prepareStreamShortVideoSocialShareDraftLocal);
    setShareSaveBehaviorState(openStreamShortVideoShareOptionsLocal);
  };

  const triggerNativeShortsShareLocal = () => {
    if (viewerSocialDraftSelectionRequired) return;
    resetShortVideoKeyboardSurfacesLocal();
    markMobileInteractionLocal("share");
    setSocialCommentsState(prepareStreamShortVideoSocialShareDraftLocal);
    setShareSaveBehaviorState(markStreamShortVideoNativeShareRequestedLocal);
    void Share.share({
      title: state.draft.title || "Шорт",
      message: getShortsShareTextLocal(),
    }).catch(() => undefined);
  };

  const copyShortsShareTextLocal = () => {
    if (viewerSocialDraftSelectionRequired) return;
    resetShortVideoKeyboardSurfacesLocal();
    markMobileInteractionLocal("share");
    setSocialCommentsState(prepareStreamShortVideoSocialShareDraftLocal);
    setShareSaveBehaviorState(markStreamShortVideoShareTextCopiedLocal);
    void Clipboard.setStringAsync(getShortsShareTextLocal()).catch(() => undefined);
  };

  const closeShareSaveSheetLocal = () => {
    resetShortVideoKeyboardSurfacesLocal();
    setShareSaveBehaviorState(closeStreamShortVideoShareSaveSheetLocal);
  };

  const requestShareSaveProviderBlockedLocal = () => {
    setShareSaveBehaviorState(requestStreamShortVideoShareSaveProviderBlocked);
  };

  const saveShortsToCollectionLocal = (collection: StreamShortVideoShareSaveCollection) => {
    if (viewerSocialDraftSelectionRequired) return;
    resetShortVideoKeyboardSurfacesLocal();
    markMobileInteractionLocal("save");
    setSocialCommentsState((current) => current.evidence.savedLocal ? current : toggleStreamShortVideoSocialSaveLocal(current));
    setShareSaveBehaviorState((current) => markStreamShortVideoSavedToLocalCollection(current, collection));
  };

  const removeShortsSavedLocal = () => {
    if (viewerSocialDraftSelectionRequired) return;
    resetShortVideoKeyboardSurfacesLocal();
    markMobileInteractionLocal("save");
    setSocialCommentsState((current) => current.evidence.savedLocal ? toggleStreamShortVideoSocialSaveLocal(current) : current);
    setShareSaveBehaviorState(markStreamShortVideoRemovedFromLocalSaved);
  };

  const queueCommentsEvent = () => {
    setSocialCommentsState(queueStreamShortVideoCommentsLocalEvent);
  };

  const requestCommentsProviderBlocked = () => {
    setSocialCommentsState(requestStreamShortVideoCommentsProviderBlocked);
  };

  const selectCommentWithExplicitDraftGuardLocal = (commentId: string) => {
    if (viewerSocialDraftSelectionRequired) return;
    setSocialCommentsState((current) => selectStreamShortVideoCommentLocal(current, commentId));
  };

  const runSelectedCommentMutationLocal = (
    commentId: string,
    mutate: (current: StreamShortVideoSocialCommentsState) => StreamShortVideoSocialCommentsState,
  ) => {
    if (viewerSocialDraftSelectionRequired) return;
    if (socialCommentsState.selectedCommentId !== commentId) return;
    setSocialCommentsState((current) => (current.selectedCommentId === commentId ? mutate(current) : current));
  };

  const clearSelectedCommentReplyDraftLocal = (commentId: string) => {
    runSelectedCommentMutationLocal(commentId, (current) => clearStreamShortVideoCommentReplyDraftLocal(current, commentId));
  };


  const runFeedAcceptanceGate = () => {
    if (feedAcceptanceExplicitSelectionDisabled) return;
    setFeedAcceptanceState((current) => runStreamShortVideoFeedAcceptanceGate(current, state, timelineState, sourceState, reviewState, publishReadinessState, feedDraftListState, playbackControlsState, engagementState));
  };

  const reviewFeedAcceptanceCheck = () => {
    if (feedAcceptanceExplicitSelectionDisabled) return;
    setFeedAcceptanceState((current) => reviewSelectedStreamShortVideoFeedAcceptanceCheck(current, state, timelineState, sourceState, reviewState, publishReadinessState, feedDraftListState, playbackControlsState, engagementState));
  };

  const queueFeedAcceptanceEvent = () => {
    if (feedAcceptanceExplicitSelectionDisabled) return;
    setFeedAcceptanceState((current) => queueStreamShortVideoFeedAcceptanceEvent(current, state, feedDraftListState, playbackControlsState));
  };

  const requestFeedAcceptanceProviderBlocked = () => {
    if (feedAcceptanceProviderBlockedActionDisabled) return;
    setFeedAcceptanceState(requestStreamShortVideoFeedAcceptanceProviderBlocked);
  };

  const runFinalSmokeChecklist = () => {
    if (finalSmokeExplicitSelectionDisabled) return;
    setFinalSmokeState((current) => runStreamShortVideoFinalSmokeChecklist(current, state, timelineState, sourceState, reviewState, publishReadinessState, feedDraftListState, playbackControlsState, engagementState, feedAcceptanceState));
  };

  const reviewFinalSmokeCheck = () => {
    if (finalSmokeExplicitSelectionDisabled) return;
    setFinalSmokeState((current) => reviewSelectedStreamShortVideoFinalSmokeCheck(current, state, timelineState, sourceState, reviewState, publishReadinessState, feedDraftListState, playbackControlsState, engagementState, feedAcceptanceState));
  };

  const reviewProfileSetupHandoff = () => {
    if (finalSmokeProfileHandoffActionDisabled) return;
    setFinalSmokeState((current) => reviewStreamShortVideoProfileSetupHandoff(current, state, timelineState, sourceState, reviewState, publishReadinessState, feedDraftListState, playbackControlsState, engagementState, feedAcceptanceState));
  };

  const queueFinalSmokeEvent = () => {
    if (finalSmokeExplicitSelectionDisabled) return;
    setFinalSmokeState(queueStreamShortVideoFinalSmokeEvent);
  };

  const requestFinalSmokeProviderBlocked = () => {
    if (finalSmokeProviderBlockedActionDisabled) return;
    setFinalSmokeState(requestStreamShortVideoFinalSmokeProviderBlocked);
  };

  const tapShortsLikeLocal = () => {
    if (viewerSocialDraftSelectionRequired) return;
    markMobileInteractionLocal("like");
    setSocialCommentsState(toggleStreamShortVideoSocialLikeLocal);
  };

  const tapShortsSaveLocal = () => {
    if (viewerSocialDraftSelectionRequired) return;
    resetShortVideoKeyboardSurfacesLocal();
    markMobileInteractionLocal("save");
    const shouldRemove = socialCommentsState.evidence.savedLocal;
    setSocialCommentsState(toggleStreamShortVideoSocialSaveLocal);
    setShareSaveBehaviorState((current) => shouldRemove
      ? markStreamShortVideoRemovedFromLocalSaved(current)
      : markStreamShortVideoSavedToLocalCollection(current, "saved"));
  };

  const openShortsSettingsLocal = () => {
    resetSettingsKeyboardForNavigationLocal();
    markMobileInteractionLocal("settings");
    setStudioOpen(true);
    setSettingsAdvancedOpen(false);
    setSourceSettingsSection("video");
    setSourceOpen(true);
    setTimelineOpen(false);
    setEffectsOpen(false);
    setAudioToolsOpen(false);
    setReviewOpen(false);
    setPublishGateOpen(false);
    setFeedDraftsOpen(false);
    setPlaybackControlsOpen(false);
    setEngagementOpen(false);
    setFeedAcceptanceOpen(false);
    setFinalSmokeOpen(false);
  };

  const openVideoSourceSettingsLocal = () => {
    resetSettingsKeyboardForNavigationLocal();
    setStudioOpen(true);
    setSourceSettingsSection("video");
    setSourceOpen(true);
    setTimelineOpen(false);
    setEffectsOpen(false);
    setAudioToolsOpen(false);
    setReviewOpen(false);
  };

  const openTextSettingsLocal = () => {
    resetSettingsKeyboardForNavigationLocal();
    setStudioOpen(true);
    setSourceSettingsSection("text");
    setSourceOpen(true);
    setTimelineOpen(false);
    setEffectsOpen(false);
    setAudioToolsOpen(false);
    setReviewOpen(false);
  };

  const openOverlaySettingsLocal = () => {
    resetSettingsKeyboardForNavigationLocal();
    setStudioOpen(true);
    setSourceSettingsSection("overlays");
    setSourceOpen(true);
    setTimelineOpen(false);
    setEffectsOpen(false);
    setAudioToolsOpen(false);
    setReviewOpen(false);
  };

  const openEditorSettingsLocal = () => {
    resetSettingsKeyboardForNavigationLocal();
    setStudioOpen(true);
    setSourceSettingsSection("edit");
    setTimelineOpen(false);
    setSourceOpen(true);
    setEffectsOpen(false);
    setAudioToolsOpen(false);
    setReviewOpen(false);
  };

  const openEffectsSettingsLocal = () => {
    resetSettingsKeyboardForNavigationLocal();
    setStudioOpen(true);
    setSourceSettingsSection("effects");
    setEffectsOpen(true);
    setSourceOpen(false);
    setTimelineOpen(false);
    setAudioToolsOpen(false);
    setReviewOpen(false);
  };

  const openAudioSettingsLocal = () => {
    resetSettingsKeyboardForNavigationLocal();
    setStudioOpen(true);
    setSourceSettingsSection("audio");
    setAudioToolsOpen(true);
    setSourceOpen(false);
    setTimelineOpen(false);
    setEffectsOpen(false);
    setReviewOpen(false);
  };

  const openReviewSettingsLocal = () => {
    resetSettingsKeyboardForNavigationLocal();
    setStudioOpen(true);
    setSourceSettingsSection("review");
    setReviewOpen(true);
    setSourceOpen(false);
    setTimelineOpen(false);
    setEffectsOpen(false);
    setAudioToolsOpen(false);
  };

  const openVideoSourceSelectionControlsLocal = () => {
    openVideoSourceSettingsLocal();
    setSettingsAdvancedOpen(true);
    setSourceOpen(true);
  };

  const openEditorSelectionControlsLocal = () => {
    openEditorSettingsLocal();
    setSettingsAdvancedOpen(true);
    setSourceOpen(true);
  };

  const openTextSelectionControlsLocal = () => {
    openTextSettingsLocal();
    setSettingsAdvancedOpen(true);
    setSourceOpen(true);
  };

  const openOverlaySelectionControlsLocal = () => {
    openOverlaySettingsLocal();
    setSettingsAdvancedOpen(true);
    setSourceOpen(true);
  };

  const openEffectsSelectionControlsLocal = () => {
    openEffectsSettingsLocal();
    setSettingsAdvancedOpen(true);
    setEffectsOpen(true);
  };

  const openAudioSelectionControlsLocal = () => {
    openAudioSettingsLocal();
    setSettingsAdvancedOpen(true);
    setAudioToolsOpen(true);
  };

  const viewerCreationStepsLocal = [
    {
      id: "video",
      icon: "videocam-outline" as IconName,
      title: "Видео",
      meta: sourceControlSelectedExplicitlyLocal && sourceFlowState.evidence.sourceClipReadyLocal ? "готово" : sourceControlSelectionRequired ? "выбери" : "добавь",
      ready: sourceControlSelectedExplicitlyLocal && sourceFlowState.evidence.sourceClipReadyLocal,
      onPress: openVideoSourceSelectionControlsLocal,
    },
    {
      id: "edit",
      icon: "cut-outline" as IconName,
      title: "Монтаж",
      meta: selectedClip ? "клип" : timelineClipsHaveLocalItems ? "выбери" : "черновик",
      ready: Boolean(selectedClip),
      onPress: timelineClipsHaveLocalItems && !selectedClip ? openEditorSelectionControlsLocal : openEditorSettingsLocal,
    },
    {
      id: "effects",
      icon: "color-filter-outline" as IconName,
      title: "Эффекты",
      meta: selectedEffectsEditorItem ? "слой" : effectsStackHasLocalLayers ? "выбери" : "стиль",
      ready: effectsReadyForMobileQaLocal,
      onPress: effectsStackHasLocalLayers && !selectedEffectsEditorItem ? openEffectsSelectionControlsLocal : openEffectsSettingsLocal,
    },
    {
      id: "audio",
      icon: "musical-notes-outline" as IconName,
      title: "MP3",
      meta: selectedMusicTrack ? "трек" : musicTracksHaveLocalItems ? "выбери" : "звук",
      ready: audioTrackSelectedExplicitlyLocal,
      onPress: musicTracksHaveLocalItems && !selectedMusicTrack ? openAudioSelectionControlsLocal : openAudioSettingsLocal,
    },
    {
      id: "review",
      icon: "shield-checkmark-outline" as IconName,
      title: "Проверка",
      meta: publishReadinessState.evidence.publishReadyLocal ? "готово" : "закрыто",
      ready: publishReadinessState.evidence.publishReadyLocal,
      onPress: openReviewSettingsLocal,
    },
  ];
  const viewerCreationReadyCountLocal = viewerCreationStepsLocal.filter((item) => item.ready).length;
  const viewerCreationProgressPercentLocal = Math.round((viewerCreationReadyCountLocal / viewerCreationStepsLocal.length) * 100);
  const viewerPhoneSizeLocal = Dimensions.get("window");
  const viewerPhoneHeightLocal = viewerPhoneSizeLocal.height;
  const viewerPhoneWidthLocal = viewerPhoneSizeLocal.width;
  const viewerCompactPhoneLocal = Number.isFinite(viewerPhoneHeightLocal) && viewerPhoneHeightLocal > 0 && viewerPhoneHeightLocal < 720;
  const viewerVeryCompactPhoneLocal = Number.isFinite(viewerPhoneHeightLocal) && viewerPhoneHeightLocal > 0 && viewerPhoneHeightLocal < 640;
  const viewerNarrowPhoneLocal = Number.isFinite(viewerPhoneWidthLocal) && viewerPhoneWidthLocal > 0 && viewerPhoneWidthLocal < 380;
  const settingsPanelMaxHeightLocal = Math.max(360, Math.floor((viewerPhoneHeightLocal || 720) * (viewerVeryCompactPhoneLocal ? 0.88 : 0.91)));

  const settingsSectionTitle = sourceSettingsSection === "video"
    ? "Источник видео"
    : sourceSettingsSection === "edit"
      ? "Редактировать монтаж"
      : sourceSettingsSection === "text"
        ? "Текст на видео"
        : sourceSettingsSection === "overlays"
          ? "Полезные метки"
          : sourceSettingsSection === "effects"
            ? "Эффекты"
            : sourceSettingsSection === "audio"
              ? "Аудио / MP3"
              : "Проверка";

  const settingsEditSelectionRequired = timelineClipsHaveLocalItems && !selectedClip;

  const settingsSectionHint = sourceSettingsSection === "video"
    ? sourceControlSelectionRequired
      ? "Выбери источник видео в списке перед проверкой или финальной готовностью."
      : selectedSource
        ? "Источник выбран. Проверь разрешение, тип файла и правила перед финальной проверкой."
        : "Сними или выбери видео, затем продолжи в настройках."
    : sourceSettingsSection === "edit"
      ? settingsEditSelectionRequired
        ? "Выбери клип монтажа в списке перед обрезкой, кадром или проверкой."
        : selectedClip
          ? "Настрой выбранный клип, обрезку, кадр и обложку перед проверкой."
          : "Обрежь, настрой кадр и выбери обложку перед проверкой."
      : sourceSettingsSection === "text"
        ? captionOverlaySelectionRequired
          ? "Выбери текстовый слой в списке перед редактированием или сохранением."
          : selectedCaptionOverlay
            ? "Настрой выбранный текстовый слой и сохрани его в монтаж."
            : "Добавь текст или заголовки и сохрани в монтаж."
        : sourceSettingsSection === "overlays"
          ? usefulOverlaySelectionRequired
            ? "Выбери метку в списке перед редактированием или сохранением."
            : selectedUsefulOverlay
              ? "Настрой выбранную метку и сохрани её в монтаж."
              : "Используй метки, стрелки и выделения только если они помогают видео."
          : sourceSettingsSection === "effects"
            ? effectsStackHasLocalLayers && !selectedEffectsEditorItem
              ? "Выбери слой эффекта в стеке перед редактированием или проверкой."
              : selectedEffectsEditorItem
                ? "Настрой выбранный слой эффекта и подготовь его к проверке."
                : "Примени эффект и подготовь к проверке."
            : sourceSettingsSection === "audio"
              ? musicTracksHaveLocalItems && !selectedMusicTrack
                ? "Выбери MP3/аудио трек в списке перед миксом или проверкой."
                : selectedMusicTrack
                  ? "Настрой выбранный MP3/аудио трек и подготовь звук."
                  : "Выбери MP3/аудио и подготовь звук."
              : "Проверь черновик перед будущей публикацией.";

  const reviewVideoSelectionRequired = sourceControlSelectionRequired;
  const reviewVideoReadyLocal = !reviewVideoSelectionRequired && sourceFlowState.evidence.selectedAssetUriPresent;
  const reviewVideoMeta = selectedSource
    ? reviewVideoSelectionRequired
      ? "Выбери источник видео перед финальной проверкой."
      : sourceFlowState.evidence.selectedAssetTitle ?? `${selectedSource.label} · источник выбран`
    : sourceFlowState.evidence.selectedAssetUriPresent
      ? sourceFlowState.evidence.selectedAssetTitle ?? "Источник выбран"
      : "Сними через камеру Sabi или выбери видео.";
  const reviewVideoActionLabel = reviewVideoSelectionRequired ? "Выбрать" : "Добавить";
  const reviewEditSelectionRequired = settingsEditSelectionRequired;
  const reviewEditReadyLocal = !reviewEditSelectionRequired && (trimCropCoverFrameState.evidence.timelineBoundLocal || timelineState.evidence.clipCount > 0);
  const reviewEditMeta = selectedClip
    ? `${selectedClip.order}. ${selectedClip.label} · клип выбран`
    : reviewEditSelectionRequired
      ? "Выбери клип монтажа перед финальной проверкой."
      : reviewEditReadyLocal
        ? "Монтаж и обложка подготовлены."
        : "Обрежь или сохрани источник в монтаж.";
  const reviewEditActionLabel = reviewEditSelectionRequired ? "Выбрать" : "Монтаж";
  const reviewTextReadyLocal = selectedCaptionOverlay !== null;
  const reviewTextMeta = selectedCaptionOverlay
    ? `${captionTextOverlayState.evidence.overlayCountLocal} текстовый элемент · выбран`
    : captionOverlaySelectionRequired
      ? "Выбери текстовый слой перед финальной проверкой."
      : "Добавь текст только если нужно.";
  const reviewOverlayReadyLocal = selectedUsefulOverlay !== null;
  const reviewOverlayMeta = selectedUsefulOverlay
    ? `${usefulOverlayEditorState.evidence.overlayCountLocal} полезная метка · выбрана`
    : usefulOverlaySelectionRequired
      ? "Выбери метку перед финальной проверкой."
      : "Добавь метку, стрелку, значок или выделение, если это полезно.";
  const reviewTextActionLabel = captionOverlaySelectionRequired ? "Выбрать" : "Текст";
  const reviewOverlayActionLabel = usefulOverlaySelectionRequired ? "Выбрать" : "Метки";
  const reviewEffectsReadyLocal = effectsStackHasLocalLayers
    ? selectedEffectsEditorItem !== null
    : creationToolsState.evidence.activeEffectsCount > 0;
  const reviewEffectsMeta = selectedEffectsEditorItem
    ? `${selectedEffectsEditorItem.label} · слой выбран`
    : effectsStackHasLocalLayers
      ? "Выбери слой эффекта перед финальной проверкой."
      : creationToolsState.evidence.activeEffectsCount > 0
        ? `${creationToolsState.evidence.activeEffectsCount} эффект`
        : "Выбери стиль или оставь видео чистым.";
  const reviewEffectsActionLabel = effectsStackHasLocalLayers && !selectedEffectsEditorItem ? "Выбрать" : "Эффект";
  const reviewAudioReadyLocal = selectedMusicTrack !== null;
  const reviewAudioMeta = selectedMusicTrack
    ? `${selectedMusicTrack.title} · трек выбран`
    : musicTracksHaveLocalItems
      ? "Выбери MP3/аудио трек перед финальной проверкой."
      : "Выбери музыку/аудио или оставь оригинальный звук.";
  const reviewAudioActionLabel = musicTracksHaveLocalItems && !selectedMusicTrack ? "Выбрать" : "Аудио";
  const reviewSocialReadyLocal = !socialCommentSelectionRequired && socialFinalBehaviorEvidence.readyActions === socialFinalBehaviorEvidence.totalActions;
  const reviewSocialMeta = socialCommentSelectionRequired
    ? "Выбери комментарий перед финальной проверкой соц. действий."
    : `${socialFinalBehaviorEvidence.readyActions}/${socialFinalBehaviorEvidence.totalActions} действий проверено`;
  const reviewSocialActionLabel = socialCommentSelectionRequired ? "Выбрать" : "Проверить";
  const reviewReadyStepsCount = [
    reviewVideoReadyLocal,
    reviewEditReadyLocal,
    reviewTextReadyLocal,
    reviewOverlayReadyLocal,
    reviewEffectsReadyLocal,
    reviewAudioReadyLocal,
    reviewSocialReadyLocal,
  ].filter(Boolean).length;
  const reviewPublishLockedLocal = publishReadinessState.evidence.providerBlockers.length > 0;
  const shortsFinalQaItemsLocal = [
    {
      id: "source",
      icon: "videocam-outline" as IconName,
      label: "Источник",
      meta: reviewVideoReadyLocal ? "готов" : reviewVideoSelectionRequired ? "выбери" : "добавь",
      ready: reviewVideoReadyLocal,
      locked: false,
      onPress: reviewVideoSelectionRequired ? openVideoSourceSelectionControlsLocal : openVideoSourceSettingsLocal,
    },
    {
      id: "edit",
      icon: "cut-outline" as IconName,
      label: "Монтаж",
      meta: reviewEditReadyLocal ? "готов" : reviewEditSelectionRequired ? "выбери" : "настрой",
      ready: reviewEditReadyLocal,
      locked: false,
      onPress: reviewEditSelectionRequired ? openEditorSelectionControlsLocal : openEditorSettingsLocal,
    },
    {
      id: "comments",
      icon: "chatbubble-ellipses-outline" as IconName,
      label: "Комментарии",
      meta: socialFinalBehaviorEvidence.readyActions === socialFinalBehaviorEvidence.totalActions ? "проверено" : "локально",
      ready: !socialCommentSelectionRequired,
      locked: false,
      onPress: socialCommentSelectionRequired ? openCommentsSheet : openReviewSettingsLocal,
    },
    {
      id: "publish",
      icon: "lock-closed-outline" as IconName,
      label: "Публикация",
      meta: reviewPublishLockedLocal ? "закрыто" : publishReadinessState.evidence.publishReadyLocal ? "готово" : "проверка",
      ready: publishReadinessState.evidence.publishReadyLocal && !reviewPublishLockedLocal,
      locked: reviewPublishLockedLocal,
      onPress: reviewPublishLockedLocal ? requestPublishProviderBlocked : openReviewSettingsLocal,
    },
  ];
  const shortsFinalQaReadyCountLocal = shortsFinalQaItemsLocal.filter((item) => item.ready).length;
  const shortsFinalQaLockedCountLocal = shortsFinalQaItemsLocal.filter((item) => item.locked).length;
  const shortsFinalCloseStatusLabel = shortsFinalQaLockedCountLocal > 0
    ? "UI готов · публикация ждёт провайдера"
    : shortsFinalQaReadyCountLocal === shortsFinalQaItemsLocal.length
      ? "UI готов к финальной проверке"
      : "Проверь оставшиеся шаги";
  const shortsFinalCloseMetaLabel = shortsFinalQaLockedCountLocal > 0
    ? "Источник, монтаж и комментарии остаются локальными. Загрузка и публикация не имитируются."
    : "Финальный экран шорта готов к ручной проверке на телефоне.";

  const settingsSectionStatus = sourceSettingsSection === "video"
    ? sourceControlSelectionRequired
      ? "выбери источник"
      : sourceFlowState.evidence.selectedAssetUriPresent
        ? "источник готов"
        : "выбрать видео"
    : sourceSettingsSection === "edit"
      ? selectedClip
        ? "клип выбран"
        : settingsEditSelectionRequired
          ? "выбери клип"
          : trimCropCoverFrameState.evidence.timelineBoundLocal
            ? "монтаж связан"
            : "редактировать"
      : sourceSettingsSection === "text"
        ? selectedCaptionOverlay
          ? `${captionTextOverlayState.evidence.overlayCountLocal} текст · выбран`
          : captionOverlaySelectionRequired
            ? "выбери текст"
            : "без текста"
        : sourceSettingsSection === "overlays"
          ? selectedUsefulOverlay
            ? `${usefulOverlayEditorState.evidence.overlayCountLocal} метка · выбрана`
            : usefulOverlaySelectionRequired
              ? "выбери метку"
              : "без меток"
          : sourceSettingsSection === "effects"
            ? selectedEffectsEditorItem
              ? "слой выбран"
              : effectsStackHasLocalLayers
                ? "выбери слой"
                : effectsEditorState.evidence.stackCount > 0
                  ? `${effectsEditorState.evidence.stackCount} эффект`
                  : "без эффектов"
            : sourceSettingsSection === "audio"
              ? selectedMusicTrack
                ? "трек выбран"
                : musicTracksHaveLocalItems
                  ? "выбери трек"
                  : "без аудио"
              : `${reviewReadyStepsCount}/7 готово`;

  const finalInteractionReadyCount = mobileInteractionQaEvidence.passedActions;
  const finalInteractionTotalCount = mobileInteractionQaEvidence.totalActions;
  const finalInteractionMissingLabel = mobileInteractionQaEvidence.notTouchedActionIds.length > 0
    ? mobileInteractionQaEvidence.notTouchedActionIds.slice(0, 3).map(getMobileInteractionActionLabel).join(" · ")
    : "Все основные действия проверены на телефоне";
  const finalInteractionStatusLabel = finalInteractionReadyCount === finalInteractionTotalCount
    ? "готово"
    : finalInteractionReadyCount > 0
      ? `${finalInteractionReadyCount}/${finalInteractionTotalCount}`
      : "проверить нажатия";

  const viewerPreviewAsset = sourcePreviewPlaybackState.asset;
  const viewerPreviewReadyLocal = sourceControlSelectedExplicitlyLocal && Boolean(viewerPreviewAsset?.uri);
  const viewerPreviewTitle = sourceControlSelectedExplicitlyLocal
    ? sourceFlowState.evidence.selectedAssetTitle ?? sourcePreviewPlaybackState.evidence.selectedAssetTitle ?? state.draft.title ?? "Шорт"
    : "Выбери источник видео";
  const viewerPreviewMeta = sourceControlSelectionRequired
    ? "Выбери chip источника перед предпросмотром. Видео не запускается молча."
    : viewerPreviewReadyLocal
      ? `${sourcePreviewPlaybackState.evidence.isPlayingLocal ? "Играет" : "Пауза"} · ${sourcePreviewPlaybackState.evidence.progressPercentLocal}% · ${sourcePreviewPlaybackState.evidence.mutedLocal ? "Выключено" : "Звук включён"}`
      : "Добавь видео в настройках";
  const viewerPreviewDurationLabel = sourceFlowState.evidence.selectedAssetDurationMsLocal !== null
    ? `${Math.max(1, Math.round(sourceFlowState.evidence.selectedAssetDurationMsLocal / 1000))}с`
    : (sourcePreviewPlaybackState.evidence.durationMsLocal ?? 0) > 0
      ? `${Math.max(1, Math.round((sourcePreviewPlaybackState.evidence.durationMsLocal ?? 0) / 1000))}с`
      : "черновик";

  const selectedPreviewQaEvidence = useMemo(() => buildStreamShortVideoSelectedPreviewQaEvidence({
    selectedAssetUriPresent: sourceControlSelectedExplicitlyLocal && sourceFlowState.evidence.selectedAssetUriPresent,
    selectedAssetTitle: sourceControlSelectedExplicitlyLocal ? sourceFlowState.evidence.selectedAssetTitle : null,
    selectedSourceKind: sourceControlSelectedExplicitlyLocal ? sourceFlowState.evidence.selectedSourceKind : null,
    previewAssetUriPresent: sourceControlSelectedExplicitlyLocal && sourcePreviewPlaybackState.evidence.selectedAssetUriPresent,
    previewReadyLocal: sourceControlSelectedExplicitlyLocal && sourcePreviewPlaybackState.evidence.previewReadyLocal,
    playbackBoundLocal: sourceControlSelectedExplicitlyLocal && sourcePreviewPlaybackState.evidence.playbackBoundLocal,
    viewerPreviewMountedLocal: viewerPreviewReadyLocal,
    settingsButtonVisibleLocal: true,
    socialRailVisibleLocal: true,
    settingsOverlayOpenLocal: studioOpen,
    recordUsesSabiInAppCameraLocal: true,
    systemCameraLaunchBlockedLocal: true,
    progressPercentLocal: sourcePreviewPlaybackState.evidence.progressPercentLocal,
    durationMsLocal: sourcePreviewPlaybackState.evidence.durationMsLocal,
  }), [
    sourceControlSelectedExplicitlyLocal,
    sourceFlowState.evidence.selectedAssetUriPresent,
    sourceFlowState.evidence.selectedAssetTitle,
    sourceFlowState.evidence.selectedSourceKind,
    sourcePreviewPlaybackState.evidence.selectedAssetUriPresent,
    sourcePreviewPlaybackState.evidence.previewReadyLocal,
    sourcePreviewPlaybackState.evidence.playbackBoundLocal,
    sourcePreviewPlaybackState.evidence.progressPercentLocal,
    sourcePreviewPlaybackState.evidence.durationMsLocal,
    studioOpen,
    viewerPreviewReadyLocal,
  ]);

  const toggleViewerPreviewPlaybackLocal = async () => {
    if (!viewerPreviewReadyLocal) {
      openVideoSourceSettingsLocal();
      return;
    }
    if (sourcePreviewPlaybackState.evidence.isPlayingLocal) {
      setSourcePreviewPlaybackState(pauseStreamShortVideoSourcePreviewLocal);
      await viewerPreviewVideoRef.current?.pauseAsync?.();
      return;
    }
    setSourcePreviewPlaybackState(playStreamShortVideoSourcePreviewLocal);
    await viewerPreviewVideoRef.current?.playAsync?.();
  };

  const restartViewerPreviewPlaybackLocal = async () => {
    if (!viewerPreviewReadyLocal) {
      openVideoSourceSettingsLocal();
      return;
    }
    setSourcePreviewPlaybackState(restartStreamShortVideoSourcePreviewLocal);
    await viewerPreviewVideoRef.current?.setPositionAsync?.(0);
    await viewerPreviewVideoRef.current?.playAsync?.();
  };

  const handleViewerPlaybackTapLocal = () => {
    if (Date.now() - viewerLastSwipeHandledAtRef.current < SHORT_VIDEO_VIEWER_SWIPE_TAP_SUPPRESS_MS_LOCAL) return;
    void toggleViewerPreviewPlaybackLocal();
  };

  const seekViewerPreviewBySwipeLocal = async (direction: "back" | "forward") => {
    if (!viewerPreviewReadyLocal) {
      openVideoSourceSettingsLocal();
      return;
    }

    const durationMs = sourcePreviewPlaybackState.evidence.durationMsLocal ?? sourcePreviewPlaybackState.durationMsLocal ?? 0;
    const positionMs = sourcePreviewPlaybackState.evidence.positionMsLocal ?? sourcePreviewPlaybackState.positionMsLocal ?? 0;
    const defaultStepMs = 5000;
    const adaptiveStepMs = durationMs > 0 ? Math.max(2500, Math.min(7000, Math.round(durationMs * 0.12))) : defaultStepMs;
    const rawTargetMs = direction === "forward" ? positionMs + adaptiveStepMs : positionMs - adaptiveStepMs;
    const targetMs = durationMs > 0 ? Math.max(0, Math.min(durationMs, rawTargetMs)) : Math.max(0, rawTargetMs);

    setSourcePreviewPlaybackState((current) => syncStreamShortVideoSourcePreviewPlaybackStatusLocal(current, {
      isLoaded: true,
      isPlaying: current.isPlayingLocal,
      positionMillis: targetMs,
      durationMillis: durationMs || current.durationMsLocal,
    }));
    await viewerPreviewVideoRef.current?.setPositionAsync?.(targetMs);
    if (sourcePreviewPlaybackState.evidence.isPlayingLocal) await viewerPreviewVideoRef.current?.playAsync?.();
  };

  const switchViewerFeedDraftBySwipeLocal = async (direction: "previous" | "next") => {
    resetShortVideoKeyboardSurfacesLocal();
    setFeedDraftListState((current) => {
      const next = direction === "next" ? selectNextShortVideoFeedDraft(current) : selectPreviousShortVideoFeedDraft(current);
      setExplicitFeedDraftSelectionId(next.selectedDraftId ?? null);
      return next;
    });

    if (!viewerPreviewReadyLocal) {
      openVideoSourceSettingsLocal();
      return;
    }

    setSourcePreviewPlaybackState(restartStreamShortVideoSourcePreviewLocal);
    await viewerPreviewVideoRef.current?.setPositionAsync?.(0);
    await viewerPreviewVideoRef.current?.playAsync?.();
  };

  const handleViewerSwipeTouchStartLocal = (event: GestureResponderEvent) => {
    viewerSwipeStartRef.current = null;
    if (studioOpen || socialCommentsState.evidence.commentsOpenLocal || shareSaveBehaviorState.evidence.shareOptionsOpenLocal || shareSaveBehaviorState.evidence.saveOptionsOpenLocal || videoSourceSheetOpen) return;
    if (isShortVideoViewerSwipeStartInInteractiveChromeLocal(event)) return;
    const touch = event.nativeEvent;
    viewerSwipeStartRef.current = { x: touch.pageX, y: touch.pageY, timestamp: Date.now() };
  };

  const handleViewerSwipeTouchEndLocal = (event: GestureResponderEvent) => {
    const start = viewerSwipeStartRef.current;
    viewerSwipeStartRef.current = null;
    if (!start) return;
    if (studioOpen || socialCommentsState.evidence.commentsOpenLocal || shareSaveBehaviorState.evidence.shareOptionsOpenLocal || shareSaveBehaviorState.evidence.saveOptionsOpenLocal || videoSourceSheetOpen) return;

    const touch = event.nativeEvent;
    const dx = touch.pageX - start.x;
    const dy = touch.pageY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const elapsedMs = Date.now() - start.timestamp;
    if (elapsedMs > 950) return;

    if (absY >= SHORT_VIDEO_VIEWER_SWIPE_MIN_DISTANCE_LOCAL && absY >= absX * SHORT_VIDEO_VIEWER_SWIPE_AXIS_RATIO_LOCAL) {
      viewerLastSwipeHandledAtRef.current = Date.now();
      void switchViewerFeedDraftBySwipeLocal(dy < 0 ? "next" : "previous");
      return;
    }

    if (absX >= SHORT_VIDEO_VIEWER_SWIPE_MIN_DISTANCE_LOCAL && absX >= absY * SHORT_VIDEO_VIEWER_SWIPE_AXIS_RATIO_LOCAL) {
      viewerLastSwipeHandledAtRef.current = Date.now();
      void seekViewerPreviewBySwipeLocal(dx < 0 ? "forward" : "back");
    }
  };

  if (!studioOpen) {
    return (
      <View
        style={styles.viewerSwipeSurface}
        pointerEvents="auto"
        onStartShouldSetResponder={(event) => !isShortVideoViewerSwipeStartInInteractiveChromeLocal(event)}
        onMoveShouldSetResponder={(event) => !isShortVideoViewerSwipeStartInInteractiveChromeLocal(event)}
        onResponderTerminationRequest={() => true}
        onTouchStart={handleViewerSwipeTouchStartLocal}
        onTouchEnd={handleViewerSwipeTouchEndLocal}
        onTouchCancel={() => { viewerSwipeStartRef.current = null; }}
      >
        {viewerPreviewReadyLocal ? (
          <View pointerEvents="box-none" style={styles.viewerPlaybackSurface}>
            <Pressable
              style={styles.viewerPlaybackTapLayer}
              onPress={handleViewerPlaybackTapLocal}
            >
              <Video
                ref={viewerPreviewVideoRef}
                source={{ uri: viewerPreviewAsset?.uri ?? "" }}
                style={styles.viewerPlaybackVideo}
                resizeMode={ResizeMode.COVER}
                shouldPlay={sourcePreviewPlaybackState.evidence.isPlayingLocal}
                isMuted={sourcePreviewPlaybackState.evidence.mutedLocal}
                isLooping={sourcePreviewPlaybackState.evidence.loopLocal}
                rate={sourcePreviewPlaybackState.evidence.playbackRateLocal}
                progressUpdateIntervalMillis={450}
                onLoad={markSourcePreviewReadyWithExplicitSelectionGuardLocal}
                onPlaybackStatusUpdate={onSourcePreviewPlaybackStatusUpdate}
              />
              {!sourcePreviewPlaybackState.evidence.isPlayingLocal ? (
                <View style={styles.viewerPlaybackCenterHint}>
                  <Ionicons name="play" size={20} color="#0B0910" />
                </View>
              ) : null}
            </Pressable>
            <View style={styles.viewerPlaybackEdgeProgressTrack} pointerEvents="none">
              <View style={[styles.viewerPlaybackEdgeProgressFill, { width: `${sourcePreviewPlaybackState.evidence.progressPercentLocal}%` }]} />
            </View>
            <View
              pointerEvents="box-none"
              style={[
                styles.viewerPlaybackBottomDock,
                viewerCompactPhoneLocal ? styles.viewerPlaybackBottomDockCompact : null,
                viewerVeryCompactPhoneLocal ? styles.viewerPlaybackBottomDockVeryCompact : null,
                viewerNarrowPhoneLocal ? styles.viewerPlaybackBottomDockNarrow : null,
              ]}
            >
              <View pointerEvents="none" style={styles.viewerPlaybackTextBlock}>
                <Text style={styles.viewerPlaybackEyebrow} numberOfLines={1}>Предпросмотр</Text>
                <Text style={styles.viewerPlaybackTitle} numberOfLines={1}>{viewerPreviewTitle}</Text>
                {viewerVeryCompactPhoneLocal ? null : (
                  <Text style={styles.viewerPlaybackMeta} numberOfLines={1}>{viewerPreviewMeta}</Text>
                )}
              </View>
              <View pointerEvents="none" style={styles.viewerPlaybackStatusPill}>
                <Text style={styles.viewerPlaybackStatusText} numberOfLines={1}>{viewerPreviewDurationLabel}</Text>
              </View>
              <View pointerEvents="none" style={styles.viewerPlaybackProgressTrack}>
                <View style={[styles.viewerPlaybackProgressFill, { width: `${sourcePreviewPlaybackState.evidence.progressPercentLocal}%` }]} />
              </View>
              <View style={styles.viewerPlaybackControlRow}>
                <Pressable
                  style={styles.viewerPlaybackControlButton}
                  onPress={toggleViewerPreviewPlaybackLocal}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={sourcePreviewPlaybackState.evidence.isPlayingLocal ? "Пауза предпросмотра" : "Играть предпросмотр"}
                >
                  <Ionicons name={sourcePreviewPlaybackState.evidence.isPlayingLocal ? "pause-outline" : "play-outline"} size={13} color="#0B0910" />
                  <Text style={styles.viewerPlaybackControlText} numberOfLines={1}>{sourcePreviewPlaybackState.evidence.isPlayingLocal ? "Пауза" : "Играть"}</Text>
                </Pressable>
                <Pressable
                  style={styles.viewerPlaybackControlButtonSecondary}
                  onPress={restartViewerPreviewPlaybackLocal}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Сначала предпросмотр"
                >
                  <Ionicons name="refresh-outline" size={13} color="#FFFFFF" />
                  <Text style={styles.viewerPlaybackControlTextSecondary} numberOfLines={1}>Сначала</Text>
                </Pressable>
                {viewerVeryCompactPhoneLocal ? null : (
                  <Pressable
                    style={styles.viewerPlaybackControlButtonSecondary}
                    onPress={openReviewSettingsLocal}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Открыть проверку шорта"
                  >
                    <Ionicons name="shield-checkmark-outline" size={13} color="#FFFFFF" />
                    <Text style={styles.viewerPlaybackControlTextSecondary} numberOfLines={1}>Проверка</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.viewerCleanEmptySurface} pointerEvents="none" />
            <Pressable
              style={[
                styles.viewerEmptySourceCard,
                viewerCompactPhoneLocal ? styles.viewerEmptySourceCardCompact : null,
                viewerVeryCompactPhoneLocal ? styles.viewerEmptySourceCardVeryCompact : null,
              ]}
              onPress={openVideoSourceSelectionControlsLocal}
              accessibilityRole="button"
              accessibilityLabel="Добавить видео в шорт"
              hitSlop={10}
            >
              <View style={styles.viewerEmptySourceIcon}>
                <Ionicons name="videocam-outline" size={22} color="#0B0910" />
              </View>
              <View style={styles.viewerEmptySourceText}>
                <Text style={styles.viewerEmptySourceTitle} numberOfLines={1}>Добавь видео</Text>
                <Text style={styles.viewerEmptySourceMeta} numberOfLines={2}>Нажми здесь, чтобы открыть источник видео внутри настроек шорта.</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color="#F2C75B" />
            </Pressable>
          </>
        )}

        <View
          pointerEvents="box-none"
          style={[
            styles.viewerCreationRail,
            viewerCompactPhoneLocal ? styles.viewerCreationRailCompact : null,
            viewerVeryCompactPhoneLocal ? styles.viewerCreationRailVeryCompact : null,
          ]}
        >
          <View pointerEvents="none" style={styles.viewerCreationRailHeader}>
            <View style={styles.viewerCreationRailTitleWrap}>
              <Text style={styles.viewerCreationRailEyebrow} numberOfLines={1}>Шорт · локальный черновик</Text>
              <Text style={styles.viewerCreationRailTitle} numberOfLines={1}>{viewerVeryCompactPhoneLocal ? "Создание" : "Путь создания"}</Text>
            </View>
            <Text style={styles.viewerCreationRailProgress} numberOfLines={1}>{viewerCreationReadyCountLocal}/{viewerCreationStepsLocal.length}</Text>
          </View>
          <View pointerEvents="none" style={styles.viewerCreationProgressTrack}>
            <View style={[styles.viewerCreationProgressFill, { width: `${viewerCreationProgressPercentLocal}%` }]} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.viewerCreationStepsScroll}
            contentContainerStyle={[styles.viewerCreationStepsContent, viewerCompactPhoneLocal ? styles.viewerCreationStepsContentCompact : null]}
            keyboardShouldPersistTaps="handled"
            overScrollMode="never"
            nestedScrollEnabled
          >
            {viewerCreationStepsLocal.map((item) => (
              <Pressable
                key={item.id}
                style={[
                  styles.viewerCreationStepPill,
                  viewerCompactPhoneLocal ? styles.viewerCreationStepPillCompact : null,
                  item.ready ? styles.viewerCreationStepPillReady : null,
                ]}
                onPress={item.onPress}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}: ${item.meta}`}
              >
                <Ionicons name={item.ready ? "checkmark-circle" : item.icon} size={13} color={item.ready ? "#0B0910" : "#F2C75B"} />
                <View style={styles.viewerCreationStepText}>
                  <Text style={[styles.viewerCreationStepTitle, item.ready ? styles.viewerCreationStepTitleReady : null]} numberOfLines={1}>{item.title}</Text>
                  {viewerVeryCompactPhoneLocal ? null : (
                    <Text style={[styles.viewerCreationStepMeta, item.ready ? styles.viewerCreationStepMetaReady : null]} numberOfLines={1}>{item.meta}</Text>
                  )}
                </View>
              </Pressable>
            ))}
          </ScrollView>
          {viewerVeryCompactPhoneLocal ? null : (
            <View style={styles.viewerCreationShortcutRow}>
              <Pressable
                style={styles.viewerCreationSettingsShortcut}
                onPress={openShortsSettingsLocal}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Открыть настройки создания шорта"
              >
                <Ionicons name="options-outline" size={13} color="#F2C75B" />
                <Text style={styles.viewerCreationSettingsShortcutText} numberOfLines={1}>Настройки</Text>
              </Pressable>
              <Pressable
                style={[styles.viewerCreationSettingsShortcut, styles.viewerCreationSettingsShortcutSecondary]}
                onPress={openReviewSettingsLocal}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Открыть проверку шорта"
              >
                <Ionicons name="shield-checkmark-outline" size={13} color="#F2C75B" />
                <Text style={styles.viewerCreationSettingsShortcutText} numberOfLines={1}>Проверка</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View
          pointerEvents="box-none"
          style={[
            styles.viewerSocialRail,
            viewerCompactPhoneLocal ? styles.viewerSocialRailCompact : null,
            viewerVeryCompactPhoneLocal ? styles.viewerSocialRailVeryCompact : null,
          ]}
        >
          <ViewerSocialButton icon="settings-outline" label="" accessibilityLabel="Настройки" active={studioOpen} onPress={openShortsSettingsLocal} compact={viewerCompactPhoneLocal} veryCompact={viewerVeryCompactPhoneLocal} />
          <ViewerSocialButton icon={socialCommentsState.evidence.likedLocal ? "heart" : "heart-outline"} label="" accessibilityLabel="Лайк" active={socialCommentsState.evidence.likedLocal} onPress={tapShortsLikeLocal} disabled={viewerSocialDraftSelectionRequired} disabledHint={viewerSocialDraftActionDisabledHint} compact={viewerCompactPhoneLocal} veryCompact={viewerVeryCompactPhoneLocal} />
          <ViewerSocialButton icon="chatbubble-ellipses-outline" label="" accessibilityLabel="Комментарии" active={socialCommentsState.evidence.commentsCountLocal > 0 || socialCommentsState.evidence.commentsOpenLocal} count={socialCommentsState.evidence.commentsCountLocal} onPress={openCommentsSheet} disabled={viewerSocialDraftSelectionRequired} disabledHint={viewerSocialDraftActionDisabledHint} compact={viewerCompactPhoneLocal} veryCompact={viewerVeryCompactPhoneLocal} />
          <ViewerSocialButton icon={socialCommentsState.evidence.shareDraftPreparedLocal ? "arrow-redo" : "arrow-redo-outline"} label="" accessibilityLabel="Поделиться" active={socialCommentsState.evidence.shareDraftPreparedLocal} onPress={shareShortVideoLocal} disabled={viewerSocialDraftSelectionRequired} disabledHint={viewerSocialDraftActionDisabledHint} compact={viewerCompactPhoneLocal} veryCompact={viewerVeryCompactPhoneLocal} />
          <ViewerSocialButton icon={socialCommentsState.evidence.savedLocal ? "bookmark" : "bookmark-outline"} label="" accessibilityLabel="Сохранить" active={socialCommentsState.evidence.savedLocal} onPress={tapShortsSaveLocal} disabled={viewerSocialDraftSelectionRequired} disabledHint={viewerSocialDraftActionDisabledHint} compact={viewerCompactPhoneLocal} veryCompact={viewerVeryCompactPhoneLocal} />
        </View>

        <SabiShortsInAppCameraModal
        visible={shortsCameraOpen}
        onClose={closeSabiShortsCameraLocal}
        onRecorded={handleSabiShortsCameraRecordedLocal}
      />

      <ShortsVideoSourceSheet
        visible={videoSourceSheetOpen}
        selectedTitle={sourceFlowState.evidence.selectedAssetTitle}
        selectedKind={sourceFlowState.evidence.selectedSourceKind}
        durationMs={sourceFlowState.evidence.selectedAssetDurationMsLocal}
        sizeBytes={sourceFlowState.evidence.selectedAssetSizeBytes}
        sourceReady={sourceControlSelectedExplicitlyLocal && sourceFlowState.evidence.sourceClipReadyLocal}
        sourceSelectionRequired={sourceControlSelectionRequired}
        onClose={closeVideoSourceSheetLocal}
        onRecord={recordShortVideoFromSourceSheetLocal}
        onGallery={() => void pickShortVideoFromGallerySheetLocal()}
        onFile={() => void pickShortVideoFileFromSourceSheetLocal()}
        onProviderLocked={requestSourceFlowProviderLockedWithExplicitSelectionGuardLocal}
        providerLockedDisabled={sourceFlowExplicitSelectionDisabled}
        providerLockedDisabledLabel={sourceFlowExplicitSelectionDisabledLabel}
        providerLockedDisabledHint={sourceFlowExplicitSelectionDisabledHint}
      />

      <ShortsCommentsModal
          visible={socialCommentsState.evidence.commentsOpenLocal}
          comments={socialCommentsState.comments}
          selectedCommentId={socialCommentsState.selectedCommentId}
          draft={commentDraft}
          onDraftChange={setCommentDraft}
          onSend={sendCommentLocal}
          onClose={closeCommentsSheet}
          onLikeComment={(id) => runSelectedCommentMutationLocal(id, (current) => toggleStreamShortVideoCommentLikeLocal(current, id))}
          onPinComment={(id) => runSelectedCommentMutationLocal(id, (current) => pinStreamShortVideoCommentLocal(current, id))}
          onReplyComment={(id) => runSelectedCommentMutationLocal(id, (current) => markStreamShortVideoCommentReplyDraftLocal(current, id))}
          onClearReplyDraft={clearSelectedCommentReplyDraftLocal}
          onReportComment={(id) => runSelectedCommentMutationLocal(id, (current) => reportStreamShortVideoCommentLocal(current, id))}
          onHideComment={(id) => runSelectedCommentMutationLocal(id, (current) => hideStreamShortVideoCommentLocal(current, id))}
          onSelectComment={selectCommentWithExplicitDraftGuardLocal}
        />

        <ShortsShareSaveSheet
          visible={shareSaveBehaviorState.evidence.shareOptionsOpenLocal || shareSaveBehaviorState.evidence.saveOptionsOpenLocal}
          mode={shareSaveBehaviorState.evidence.activeSheetMode || "share"}
          title={state.draft.title || "Шорт"}
          evidence={shareSaveBehaviorState.evidence}
          savedLocal={socialCommentsState.evidence.savedLocal}
          onClose={closeShareSaveSheetLocal}
          onNativeShare={triggerNativeShortsShareLocal}
          onCopyShareText={copyShortsShareTextLocal}
          onSaveToCollection={saveShortsToCollectionLocal}
          onRemoveSave={removeShortsSavedLocal}
          onProviderLocked={requestShareSaveProviderBlockedLocal}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.panel,
        viewerCompactPhoneLocal ? styles.panelCompactPhone : null,
        { maxHeight: settingsPanelMaxHeightLocal },
        settingsKeyboardOpen ? styles.panelKeyboardOpen : null,
        settingsKeyboardOpen ? { bottom: Math.min(settingsKeyboardBottomInset + 10, getShortVideoKeyboardPanelLiftLimitLocal()) } : null,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="film-outline" size={17} color="#F2C75B" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>Настройки шорта</Text>
          <Text style={styles.meta} numberOfLines={1}>Съёмка · монтаж · звук · проверка</Text>
        </View>
        <Pressable
          style={styles.badge}
          onPress={closeShortsStudioPanelLocal}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Закрыть настройки шорта"
        >
          <Ionicons name="chevron-down-outline" size={13} color="#F2C75B" />
          <Text style={styles.badgeText}>закрыть</Text>
        </Pressable>
      </View>

      <View style={[styles.settingsHeroCard, settingsKeyboardOpen ? styles.settingsHeroCardKeyboardOpen : null]}>
        <View style={styles.settingsHeroIcon}>
          <Ionicons name="options-outline" size={22} color="#0B0910" />
        </View>
        <View style={styles.settingsHeroText}>
          <Text style={styles.settingsHeroEyebrow} numberOfLines={1}>Инструменты</Text>
          <Text style={styles.settingsHeroTitle} numberOfLines={1}>{settingsSectionTitle}</Text>
          <Text style={styles.settingsHeroHint} numberOfLines={2}>{settingsSectionHint}</Text>
        </View>
        <View style={styles.settingsHeroStatus}>
          <Text style={styles.settingsHeroStatusText} numberOfLines={1}>{settingsSectionStatus}</Text>
        </View>
      </View>

      <ScrollView
        ref={settingsScrollRef}
        style={styles.settingsScroll}
        contentContainerStyle={settingsScrollContentStyle}
        showsVerticalScrollIndicator
        persistentScrollbar={settingsAdvancedOpen}
        nestedScrollEnabled
        scrollEnabled
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        overScrollMode="never"
      >
      <View
        style={[
          styles.settingsCommandCenter,
          viewerCompactPhoneLocal ? styles.settingsCommandCenterCompact : null,
          viewerVeryCompactPhoneLocal ? styles.settingsCommandCenterVeryCompact : null,
        ]}
      >
        <View style={styles.settingsCommandHeader}>
          <View style={styles.settingsCommandTitleWrap}>
            <Text style={styles.settingsCommandTitle} numberOfLines={1}>Создать шорт</Text>
            {viewerVeryCompactPhoneLocal ? null : (
              <Text style={styles.settingsCommandMeta} numberOfLines={1}>Видео → Монтаж → Текст → Эффекты → MP3 → Проверка</Text>
            )}
          </View>
          <View style={styles.settingsCommandBadge}>
            <Ionicons name="lock-closed-outline" size={12} color="#F2C75B" />
            <Text style={styles.settingsCommandBadgeText}>черновик</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.settingsFinalQaRail}
          contentContainerStyle={[
            styles.settingsFinalQaRailContent,
            viewerCompactPhoneLocal ? styles.settingsFinalQaRailContentCompact : null,
          ]}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          overScrollMode="never"
        >
          {shortsFinalQaItemsLocal.map((item) => (
            <Pressable
              key={item.id}
              style={[
                styles.settingsFinalQaPill,
                viewerCompactPhoneLocal ? styles.settingsFinalQaPillCompact : null,
                viewerVeryCompactPhoneLocal ? styles.settingsFinalQaPillVeryCompact : null,
                item.ready ? styles.settingsFinalQaPillReady : null,
                item.locked ? styles.settingsFinalQaPillLocked : null,
              ]}
              onPress={item.onPress}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityState={{ selected: item.ready, disabled: item.locked }}
              accessibilityLabel={`${item.label}: ${item.meta}`}
            >
              <Ionicons name={item.ready ? "checkmark-circle" : item.icon} size={13} color={item.ready ? "#0B0910" : item.locked ? "#8D8796" : "#F2C75B"} />
              <View style={styles.settingsFinalQaPillText}>
                <Text style={[styles.settingsFinalQaPillTitle, item.ready ? styles.settingsFinalQaPillTitleReady : null, item.locked ? styles.settingsFinalQaPillTitleLocked : null]} numberOfLines={1}>{item.label}</Text>
                {viewerVeryCompactPhoneLocal ? null : (
                  <Text style={[styles.settingsFinalQaPillMeta, item.ready ? styles.settingsFinalQaPillMetaReady : null, item.locked ? styles.settingsFinalQaPillMetaLocked : null]} numberOfLines={1}>{item.meta}</Text>
                )}
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View
          style={[
            styles.settingsFinalCloseCard,
            viewerCompactPhoneLocal ? styles.settingsFinalCloseCardCompact : null,
            viewerVeryCompactPhoneLocal ? styles.settingsFinalCloseCardVeryCompact : null,
          ]}
          pointerEvents="none"
        >
          <View style={styles.settingsFinalCloseIcon}>
            <Ionicons name={shortsFinalQaLockedCountLocal > 0 ? "lock-closed-outline" : "checkmark-done-outline"} size={15} color="#0B0910" />
          </View>
          <View style={styles.settingsFinalCloseText}>
            <Text style={styles.settingsFinalCloseTitle} numberOfLines={1}>{shortsFinalCloseStatusLabel}</Text>
            {viewerVeryCompactPhoneLocal ? null : (
              <Text style={styles.settingsFinalCloseMeta} numberOfLines={2}>{shortsFinalCloseMetaLabel}</Text>
            )}
          </View>
          <Text style={styles.settingsFinalCloseScore} numberOfLines={1}>{shortsFinalQaReadyCountLocal}/{shortsFinalQaItemsLocal.length}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.settingsTabsScroll}
          contentContainerStyle={styles.settingsTabsContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          nestedScrollEnabled
          overScrollMode="never"
        >
          <SettingsHubButton icon="videocam-outline" label="Видео" meta={videoSourceHubMeta} active={videoSourceHubActive} onPress={openVideoSourceSettingsLocal} />
          <SettingsHubButton icon="cut-outline" label="Монтаж" meta={timelineHubMeta} active={timelineHubActive} onPress={openEditorSettingsLocal} />
          <SettingsHubButton icon="text-outline" label="Текст" meta={captionOverlayHubMeta} active={sourceSettingsSection === "text" || captionTextOverlayState.evidence.overlayCountLocal > 0} onPress={openTextSettingsLocal} />
          <SettingsHubButton icon="shapes-outline" label="Метки" meta={usefulOverlayHubMeta} active={sourceSettingsSection === "overlays" || usefulOverlayEditorState.evidence.overlayCountLocal > 0} onPress={openOverlaySettingsLocal} />
          <SettingsHubButton icon="color-filter-outline" label="Эффекты" meta={effectsHubMeta} active={effectsHubActive} onPress={openEffectsSettingsLocal} />
          <SettingsHubButton icon="musical-notes-outline" label="MP3" meta={audioHubMeta} active={audioHubActive} onPress={openAudioSettingsLocal} />
          <SettingsHubButton icon="shield-checkmark-outline" label="Проверка" meta="финальная проверка" active={sourceSettingsSection === "review" || reviewState.evidence.reviewReadyLocal} onPress={openReviewSettingsLocal} />
        </ScrollView>

        {sourceSettingsSection === "video" ? (
          <SettingsPremiumFocusCard
            icon="videocam-outline"
            eyebrow="Шаг 1 · видео"
            title="Добавить видео"
            description={sourceControlSelectionRequired ? "Выбери chip источника перед проверкой источника и финальной готовностью." : "Выбери камеру, галерею или файл. Видео остаётся в черновике до подключения загрузки."}
            status={sourceControlSelectionRequired ? "выбери источник" : sourceFlowState.evidence.selectedAssetUriPresent ? "видео готово" : "ожидает"}
          >
            <SettingsPremiumAction icon="videocam-outline" label="Снять камерой Sabi" primary onPress={() => void recordShortVideoFromCameraLocal()} />
            <SettingsPremiumAction icon="images-outline" label="Выбрать из галереи/файла" onPress={openVideoSourceSheetLocal} />
            <SettingsPremiumAction icon="film-outline" label={sourceFlowState.evidence.selectedAssetUriPresent ? "Видео выбрано" : "Видео пока нет"} locked={!sourceFlowState.evidence.selectedAssetUriPresent} onPress={openVideoSourceSheetLocal} />
          </SettingsPremiumFocusCard>
        ) : null}

        {sourceSettingsSection === "edit" ? (
          <SettingsPremiumFocusCard
            icon="cut-outline"
            eyebrow="Шаг 2 · монтаж"
            title="Редактировать клип"
            description={timelineFocusDescription}
            status={timelineFocusStatus}
          >
            <SettingsPremiumAction icon="film-outline" label="Сохранить в монтаж" primary onPress={bindTrimCropCoverToTimelineWithExplicitSelectionGuardLocal} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
            <SettingsPremiumAction icon="shield-checkmark-outline" label="Проверить обложку" onPress={bindTrimCropCoverToReviewWithExplicitSelectionGuardLocal} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
            <SettingsPremiumAction icon="analytics-outline" label="Проверить монтаж" onPress={runTrimCropCoverCheckWithExplicitSelectionGuardLocal} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
          </SettingsPremiumFocusCard>
        ) : null}

        {sourceSettingsSection === "text" ? (
          <SettingsPremiumFocusCard
            icon="text-outline"
            eyebrow="Шаг 3 · текст"
            title="Текст"
            description={captionOverlayFocusDescription}
            status={captionOverlayFocusStatus}
          >
            <SettingsPremiumAction icon="add-outline" label="Добавить текст" primary onPress={addCaptionOverlayForExplicitSelectionLocal} />
            <SettingsPremiumAction icon="film-outline" label="Сохранить текст" onPress={bindCaptionOverlayToTimelineLocal} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
            <SettingsPremiumAction icon="shield-checkmark-outline" label="Проверить текст" onPress={bindCaptionOverlayToReviewLocal} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
          </SettingsPremiumFocusCard>
        ) : null}

        {sourceSettingsSection === "overlays" ? (
          <SettingsPremiumFocusCard
            icon="shapes-outline"
            eyebrow="Шаг 4 · метки"
            title="Метки"
            description={usefulOverlayFocusDescription}
            status={usefulOverlayFocusStatus}
          >
            <SettingsPremiumAction icon="add-outline" label="Добавить метку" primary onPress={addUsefulOverlayForExplicitSelectionLocal} />
            <SettingsPremiumAction icon="film-outline" label="Сохранить метку" onPress={bindUsefulOverlayToTimelineLocal} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
            <SettingsPremiumAction icon="shield-checkmark-outline" label="Проверить метку" onPress={bindUsefulOverlayToReviewLocal} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
          </SettingsPremiumFocusCard>
        ) : null}

        {sourceSettingsSection === "effects" ? (
          <SettingsPremiumFocusCard
            icon="color-filter-outline"
            eyebrow="Шаг 5 · эффекты"
            title="Эффекты"
            description={effectsFocusDescription}
            status={effectsFocusStatus}
          >
            <View style={styles.settingsPremiumFullWidth}>
              <View style={styles.effectsPremiumPreviewCard}>
                <View style={styles.effectsPremiumPreviewIcon}>
                  <Ionicons name={effectToolControls.find((tool) => tool.id === explicitEffectToolSelectionId)?.icon ?? "color-filter-outline"} size={22} color="#0B0910" />
                </View>
                <View style={styles.effectsPremiumPreviewText}>
                  <Text style={styles.effectsPremiumPreviewTitle} numberOfLines={1}>{selectedEffectTool?.label ?? "Выбрать эффект"}</Text>
                  <Text style={styles.effectsPremiumPreviewMeta} numberOfLines={2}>{formatShortsEffectPurposeLabel(selectedEffectTool?.id)}</Text>
                </View>
                <View style={styles.effectsPremiumPreviewPill}>
                  <Text style={styles.effectsPremiumPreviewPillText} numberOfLines={1}>{effectsEditorState.evidence.stackCount > 0 ? `${effectsEditorState.evidence.stackCount} эффект` : "Новый"}</Text>
                </View>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.effectsPremiumSelectorRow}>
                {effectToolControls.map((tool) => {
                  const active = explicitEffectToolSelectionId === tool.id;
                  const applied = creationToolsState.activeEffects.includes(tool.id);
                  const justSelected = effectSelectorFeedbackId === tool.id;
                  return (
                    <Pressable
                      key={tool.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${tool.label}: ${justSelected ? "выбрано" : applied ? "добавлено" : active ? "выбрано" : "выбрать эффект"}`}
                      accessibilityState={active ? { selected: true } : undefined}
                      hitSlop={6}
                      style={({ pressed }) => [
                        styles.effectsPremiumSelectorCard,
                        active ? styles.effectsPremiumSelectorCardActive : applied ? styles.effectsPremiumSelectorCardApplied : null,
                        pressed ? styles.effectsPremiumSelectorCardPressed : null,
                      ]}
                      onPress={() => selectEffectToolWithFeedbackLocal(tool.id)}
                    >
                      <View style={[styles.effectsPremiumSelectorIcon, active ? styles.effectsPremiumSelectorIconActive : null]}>
                        <Ionicons name={tool.icon} size={16} color={active ? "#0B0910" : "#F2C75B"} />
                      </View>
                      <Text style={[styles.effectsPremiumSelectorLabel, active ? styles.effectsPremiumSelectorLabelActive : null]} numberOfLines={2}>{tool.label}</Text>
                      <Text style={[styles.effectsPremiumSelectorMeta, active ? styles.effectsPremiumSelectorMetaActive : null, justSelected ? styles.effectsPremiumSelectorMetaFeedback : null]} numberOfLines={1}>{justSelected ? "готово" : applied ? "Добавлено" : active ? "Выбрано" : "Нажать"}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.settingsPremiumActionRow}>
                <SettingsPremiumAction icon="color-filter-outline" label="Применить" primary onPress={applyEffectTool} disabled={effectToolActionDisabled} disabledFeedbackLabel={effectToolActionDisabledLabel} disabledHint={effectToolActionDisabledHint} />
                <SettingsPremiumAction icon="close-circle-outline" label="Убрать" onPress={removeEffectTool} disabled={effectLayerActionDisabled} disabledFeedbackLabel={effectLayerActionDisabledLabel} disabledHint={effectLayerActionDisabledHint} />
                <SettingsPremiumAction icon="shield-checkmark-outline" label="На проверку" onPress={prepareSelectedEffectReviewWithLayerGuardLocal} disabled={effectLayerActionDisabled} disabledFeedbackLabel={effectLayerActionDisabledLabel} disabledHint={effectLayerActionDisabledHint} />
              </View>

              <View style={styles.effectsPremiumStackSummary}>
                <View style={styles.effectsPremiumStackIcon}>
                  <Ionicons name="layers-outline" size={15} color="#F2C75B" />
                </View>
                <View style={styles.effectsPremiumStackText}>
                  <Text style={styles.effectsPremiumStackTitle} numberOfLines={1}>{selectedEffectsEditorItem ? selectedEffectsEditorItem.label : effectsStackHasLocalLayers ? "Выбери слой эффекта" : "Эффект ещё не применён"}</Text>
                  <Text style={styles.effectsPremiumStackMeta} numberOfLines={1}>
                    {selectedEffectsEditorItem ? `${selectedEffectsEditorItem.intensityPercentLocal}% · ${formatShortsUiStatusLabel(selectedEffectsEditorItem.parameterPreset)} · ${selectedEffectsEditorItem.reviewPreparedLocal ? "проверка готова" : "черновик"}` : effectsStackHasLocalLayers ? "Нажми слой в стеке, чтобы редактировать его" : "Сначала выбери и примени эффект"}
                  </Text>
                </View>
                <Pressable style={styles.effectsPremiumStackButton} onPress={syncEffectsEditor}>
                  <Ionicons name="sync-outline" size={14} color="#0B0910" />
                </Pressable>
              </View>

              <View style={styles.effectsPremiumLockedNotice}>
                <Ionicons name="lock-closed-outline" size={13} color="#F2C75B" />
                <Text style={styles.effectsPremiumLockedText} numberOfLines={2}>Финальный рендер будет доступен после подключения реального провайдера.</Text>
              </View>
            </View>
          </SettingsPremiumFocusCard>
        ) : null}

        {sourceSettingsSection === "audio" ? (
          <SettingsPremiumFocusCard
            icon="musical-notes-outline"
            eyebrow="Шаг 6 · аудио"
            title="MP3 / Аудио"
            description={audioFocusDescription}
            status={audioFocusStatus}
          >
            <View style={styles.audioPremiumPanel}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={selectedMusicTrack ? `Выбран MP3: ${selectedMusicTrack.title}` : musicTracksHaveLocalItems ? "MP3 есть в списке, выбери трек" : "Выбрать MP3 или аудиофайл"}
                hitSlop={6}
                style={({ pressed }) => [styles.audioPremiumTrackCard, pressed ? styles.audioPremiumTrackCardPressed : null]}
                onPress={() => void pickMp3TrackLocal()}
              >
                <View style={styles.audioPremiumTrackIcon}>
                  <Ionicons name={selectedMusicTrack ? "musical-notes" : "add-outline"} size={20} color="#0B0910" />
                </View>
                <View style={styles.audioPremiumTrackText}>
                  <Text style={styles.audioPremiumTrackTitle} numberOfLines={1}>{selectedMusicTrack?.title ?? (musicTracksHaveLocalItems ? "Выбери трек" : "Выбрать MP3 или аудиофайл")}</Text>
                  <Text style={styles.audioPremiumTrackMeta} numberOfLines={2}>
                    {selectedMusicTrack
                      ? `${selectedMusicTrack.mimeType ?? "аудио"} · обрезка ${selectedMusicTrack.trimStartMsLocal / 1000}с-${selectedMusicTrack.trimEndMsLocal / 1000}с · старт ${selectedMusicTrack.placementStartMsLocal / 1000}с`
                      : musicTracksHaveLocalItems
                        ? "MP3 уже в списке · нажми трек, чтобы редактировать его явно."
                        : "Выбери реальный локальный аудиофайл. Ничего не загружается и не имитируется."}
                  </Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={16} color="#F2C75B" />
              </Pressable>

              <View style={styles.audioWaveformCard}>
                <View style={styles.audioWaveBars}>
                  {audioPremiumWaveBars.map((height, index) => (
                    <View key={`wave-${index}`} style={[styles.audioWaveBar, { height: `${height}%` }]} />
                  ))}
                </View>
                <View style={styles.audioWaveInfoRow}>
                  <Text style={styles.audioWaveInfoText} numberOfLines={1}>
                    {selectedMusicTrack
                      ? `${selectedMusicTrackTrimDurationSecondsLocal}с микс · ${selectedMusicTrack.volumePercentLocal}% громкость`
                      : musicTracksHaveLocalItems
                        ? "MP3 есть · выбери трек для микса"
                        : "Аудио ждёт монтажа"}
                  </Text>
                  <Text style={styles.audioWaveInfoText} numberOfLines={1}>{selectedMusicTrack ? (selectedMusicTrackOriginalMutedLocal ? "Оригинал выключен" : "Оригинал включён") : musicTracksHaveLocalItems ? "Выбери трек" : "Оригинал включён"}</Text>
                </View>
              </View>

              {musicTracksHaveLocalItems ? (
                <View style={styles.audioPremiumTrackList}>
                  {musicEditorState.tracks.map((track) => {
                    const active = track.trackId === explicitMusicTrackSelectionId;
                    const justSelected = musicTrackFeedbackId === track.trackId;
                    return (
                      <Pressable
                        key={track.trackId}
                        accessibilityRole="button"
                        accessibilityLabel={`${track.title}: ${justSelected ? "выбрано" : active ? "выбранный трек" : "выбрать трек"}`}
                        accessibilityState={active ? { selected: true } : undefined}
                        hitSlop={6}
                        style={({ pressed }) => [
                          styles.audioPremiumTrackChip,
                          active ? styles.audioPremiumTrackChipActive : null,
                          justSelected ? styles.audioPremiumTrackChipFeedback : null,
                          pressed ? styles.audioPremiumTrackChipPressed : null,
                        ]}
                        onPress={() => selectMusicTrackWithFeedbackLocal(track.trackId)}
                      >
                        <Text style={[styles.audioPremiumTrackChipText, active ? styles.audioPremiumTrackChipTextActive : null]} numberOfLines={1}>{track.title}</Text>
                        <Text style={[styles.audioTrackChipFeedbackText, active ? styles.audioTrackChipFeedbackTextActive : null, justSelected ? null : styles.audioTrackChipFeedbackTextHidden]} numberOfLines={1}>{justSelected ? "выбрано" : " "}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              <View style={styles.audioPremiumMixerGrid}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Громкость аудио: ${showAudioMixerReadyFeedbackLocal("volume") ? "готово" : audioMixerFeedbackId === "volume" && musicTrackActionDisabled ? musicTrackActionDisabledLabel : selectedMusicTrack ? `${selectedMusicTrack.volumePercentLocal} процентов` : musicTrackActionDisabledLabel}`}
                  accessibilityHint={musicTrackActionDisabled ? musicTrackActionDisabledHint : "Локальная настройка громкости выбранного MP3."}
                  accessibilityState={musicTrackActionDisabled ? { disabled: true } : undefined}
                  hitSlop={6}
                  style={({ pressed }) => [styles.audioPremiumMixerCard, musicTrackActionDisabled ? styles.audioPremiumMixerCardDisabled : null, audioMixerFeedbackId === "volume" ? styles.audioPremiumMixerCardFeedback : null, pressed ? styles.audioPremiumMixerCardPressed : null]}
                  onPress={() => runAudioMixerActionWithFeedbackLocal("volume", () => setMusicEditorState(cycleSelectedStreamShortVideoMusicVolumeLocal))}
                >
                  <Ionicons name="volume-high-outline" size={15} color="#F2C75B" />
                  <Text style={styles.audioPremiumMixerTitle} numberOfLines={1}>Громкость</Text>
                  <Text style={styles.audioPremiumMixerValue} numberOfLines={1}>{audioMixerFeedbackId === "volume" && musicTrackActionDisabled ? musicTrackActionDisabledLabel : selectedMusicTrack ? `${selectedMusicTrack.volumePercentLocal}%` : musicTrackActionDisabledLabel}</Text>
                  <Text style={[styles.audioPremiumMixerFeedbackText, showAudioMixerReadyFeedbackLocal("volume") ? null : styles.audioPremiumMixerFeedbackTextHidden]} numberOfLines={1}>{showAudioMixerReadyFeedbackLocal("volume") ? "готово" : " "}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showAudioMixerReadyFeedbackLocal("original") ? "Оригинал: готово" : audioMixerFeedbackId === "original" && musicTrackActionDisabled ? `Оригинал: ${musicTrackActionDisabledLabel}` : selectedMusicTrack ? (selectedMusicTrackOriginalMutedLocal ? "Включить оригинальный звук" : "Выключить оригинальный звук") : `Оригинал: ${musicTrackActionDisabledLabel}`}
                  accessibilityHint={musicTrackActionDisabled ? musicTrackActionDisabledHint : "Локальное включение или выключение оригинального звука."}
                  accessibilityState={musicTrackActionDisabled ? { disabled: true } : selectedMusicTrackOriginalMutedLocal ? { checked: true } : undefined}
                  hitSlop={6}
                  style={({ pressed }) => [styles.audioPremiumMixerCard, musicTrackActionDisabled ? styles.audioPremiumMixerCardDisabled : null, audioMixerFeedbackId === "original" ? styles.audioPremiumMixerCardFeedback : null, pressed ? styles.audioPremiumMixerCardPressed : null]}
                  onPress={() => runAudioMixerActionWithFeedbackLocal("original", () => setMusicEditorState(toggleSelectedStreamShortVideoOriginalAudioMuteLocal))}
                >
                  <Ionicons name={selectedMusicTrackOriginalMutedLocal ? "volume-mute-outline" : "volume-medium-outline"} size={15} color="#F2C75B" />
                  <Text style={styles.audioPremiumMixerTitle} numberOfLines={1}>Оригинал</Text>
                  <Text style={styles.audioPremiumMixerValue} numberOfLines={1}>{audioMixerFeedbackId === "original" && musicTrackActionDisabled ? musicTrackActionDisabledLabel : selectedMusicTrack ? (selectedMusicTrackOriginalMutedLocal ? "Выключено" : "Включено") : musicTrackActionDisabledLabel}</Text>
                  <Text style={[styles.audioPremiumMixerFeedbackText, showAudioMixerReadyFeedbackLocal("original") ? null : styles.audioPremiumMixerFeedbackTextHidden]} numberOfLines={1}>{showAudioMixerReadyFeedbackLocal("original") ? "готово" : " "}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Обрезка аудио: ${showAudioMixerReadyFeedbackLocal("trim") ? "готово" : audioMixerFeedbackId === "trim" && musicTrackActionDisabled ? musicTrackActionDisabledLabel : selectedMusicTrack ? `${selectedMusicTrackTrimDurationSecondsLocal} секунд` : musicTrackActionDisabledLabel}`}
                  accessibilityHint={musicTrackActionDisabled ? musicTrackActionDisabledHint : "Локальная обрезка выбранного MP3."}
                  accessibilityState={musicTrackActionDisabled ? { disabled: true } : undefined}
                  hitSlop={6}
                  style={({ pressed }) => [styles.audioPremiumMixerCard, musicTrackActionDisabled ? styles.audioPremiumMixerCardDisabled : null, audioMixerFeedbackId === "trim" ? styles.audioPremiumMixerCardFeedback : null, pressed ? styles.audioPremiumMixerCardPressed : null]}
                  onPress={() => runAudioMixerActionWithFeedbackLocal("trim", () => setMusicEditorState((current) => shiftSelectedStreamShortVideoMusicTrimLocal(current, "end_forward")))}
                >
                  <Ionicons name="cut-outline" size={15} color="#F2C75B" />
                  <Text style={styles.audioPremiumMixerTitle} numberOfLines={1}>Обрезка</Text>
                  <Text style={styles.audioPremiumMixerValue} numberOfLines={1}>{audioMixerFeedbackId === "trim" && musicTrackActionDisabled ? musicTrackActionDisabledLabel : selectedMusicTrack ? `${selectedMusicTrackTrimDurationSecondsLocal}с` : musicTrackActionDisabledLabel}</Text>
                  <Text style={[styles.audioPremiumMixerFeedbackText, showAudioMixerReadyFeedbackLocal("trim") ? null : styles.audioPremiumMixerFeedbackTextHidden]} numberOfLines={1}>{showAudioMixerReadyFeedbackLocal("trim") ? "готово" : " "}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Старт аудио: ${showAudioMixerReadyFeedbackLocal("start") ? "готово" : audioMixerFeedbackId === "start" && musicTrackActionDisabled ? musicTrackActionDisabledLabel : selectedMusicTrack ? `${selectedMusicTrackPlacementSecondsLocal} секунд` : musicTrackActionDisabledLabel}`}
                  accessibilityHint={musicTrackActionDisabled ? musicTrackActionDisabledHint : "Локальный сдвиг старта выбранного MP3."}
                  accessibilityState={musicTrackActionDisabled ? { disabled: true } : undefined}
                  hitSlop={6}
                  style={({ pressed }) => [styles.audioPremiumMixerCard, musicTrackActionDisabled ? styles.audioPremiumMixerCardDisabled : null, audioMixerFeedbackId === "start" ? styles.audioPremiumMixerCardFeedback : null, pressed ? styles.audioPremiumMixerCardPressed : null]}
                  onPress={() => runAudioMixerActionWithFeedbackLocal("start", () => setMusicEditorState((current) => shiftSelectedStreamShortVideoMusicPlacementLocal(current, "forward")))}
                >
                  <Ionicons name="time-outline" size={15} color="#F2C75B" />
                  <Text style={styles.audioPremiumMixerTitle} numberOfLines={1}>Старт</Text>
                  <Text style={styles.audioPremiumMixerValue} numberOfLines={1}>{audioMixerFeedbackId === "start" && musicTrackActionDisabled ? musicTrackActionDisabledLabel : selectedMusicTrack ? `${selectedMusicTrackPlacementSecondsLocal}с` : musicTrackActionDisabledLabel}</Text>
                  <Text style={[styles.audioPremiumMixerFeedbackText, showAudioMixerReadyFeedbackLocal("start") ? null : styles.audioPremiumMixerFeedbackTextHidden]} numberOfLines={1}>{showAudioMixerReadyFeedbackLocal("start") ? "готово" : " "}</Text>
                </Pressable>
              </View>

              <View style={styles.audioPremiumSelectorGrid}>
                {audioToolControls.map((tool) => {
                  const active = explicitAudioToolSelectionId === tool.id;
                  const ready = creationToolsState.audioTools.find((item) => item.id === tool.id)?.intentReadyLocal ?? false;
                  const justSelected = audioToolFeedbackId === tool.id;
                  return (
                    <Pressable
                      key={tool.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${tool.label}: ${justSelected ? "выбрано" : active ? "выбранный аудио инструмент" : ready ? "готово" : "выбрать аудио инструмент"}`}
                      accessibilityState={active ? { selected: true } : undefined}
                      hitSlop={6}
                      style={({ pressed }) => [
                        styles.audioPremiumSelectorCard,
                        active ? styles.audioPremiumSelectorCardActive : ready ? styles.audioPremiumSelectorCardReady : null,
                        justSelected ? styles.audioPremiumSelectorCardFeedback : null,
                        pressed ? styles.audioPremiumSelectorCardPressed : null,
                      ]}
                      onPress={() => selectAudioToolWithFeedbackLocal(tool.id)}
                    >
                      <Ionicons name={tool.icon} size={15} color={active ? "#0B0910" : "#F2C75B"} />
                      <Text style={[styles.audioPremiumSelectorText, active ? styles.audioPremiumSelectorTextActive : null]} numberOfLines={1}>{tool.label}</Text>
                      <Text style={[styles.audioPremiumSelectorFeedbackText, active ? styles.audioPremiumSelectorFeedbackTextActive : null]} numberOfLines={1}>{justSelected ? "выбрано" : ready ? "✓" : ""}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.audioPremiumActionRow}>
                <SettingsPremiumAction icon="document-attach-outline" label="Выбрать MP3" primary onPress={() => void pickMp3TrackLocal()} />
                <SettingsPremiumAction icon="shield-checkmark-outline" label="Проверить микс" onPress={reviewMusicMixLocal} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
                <SettingsPremiumAction icon="mic-outline" label="Голос" onPress={() => runSelectedMusicTrackActionLocal(() => setMusicEditorState(markSelectedStreamShortVideoVoiceoverIntentLocal))} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
                <SettingsPremiumAction icon="cloud-offline-outline" label="Рендер закрыт" locked onPress={requestMusicEditorProviderBlocked} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
              </View>
            </View>
          </SettingsPremiumFocusCard>
        ) : null}

        {sourceSettingsSection === "review" ? (
          <View style={styles.reviewPremiumBoard}>
            <View style={styles.reviewPremiumHeader}>
              <View style={styles.reviewPremiumHeaderIcon}>
                <Ionicons name="shield-checkmark-outline" size={21} color="#0B0910" />
              </View>
              <View style={styles.reviewPremiumHeaderText}>
                <Text style={styles.reviewPremiumEyebrow} numberOfLines={1}>Финальная проверка</Text>
                <Text style={styles.reviewPremiumTitle} numberOfLines={1}>{reviewReadyStepsCount}/7 проверок готово</Text>
                <Text style={styles.reviewPremiumMeta} numberOfLines={2}>Проверь шорт перед публикацией. Локальные правки сохранены, онлайн-публикация откроется после подключения провайдера.</Text>
              </View>
              <View style={[styles.reviewPremiumStatusPill, reviewReadyStepsCount >= 6 ? styles.reviewPremiumStatusPillReady : null]}>
                <Text style={[styles.reviewPremiumStatusText, reviewReadyStepsCount >= 6 ? styles.reviewPremiumStatusTextReady : null]} numberOfLines={1}>{reviewReadyStepsCount >= 6 ? "почти готово" : "проверка"}</Text>
              </View>
            </View>

            <View style={styles.reviewPremiumStepGrid}>
              <ReviewPremiumStepCard icon="videocam-outline" title="Видео" meta={reviewVideoMeta} ready={reviewVideoReadyLocal} actionLabel={reviewVideoActionLabel} onPress={reviewVideoSelectionRequired ? openVideoSourceSelectionControlsLocal : openVideoSourceSettingsLocal} />
              <ReviewPremiumStepCard icon="cut-outline" title="Монтаж" meta={reviewEditMeta} ready={reviewEditReadyLocal} actionLabel={reviewEditActionLabel} onPress={reviewEditSelectionRequired ? openEditorSelectionControlsLocal : openEditorSettingsLocal} />
              <ReviewPremiumStepCard icon="text-outline" title="Текст" meta={reviewTextMeta} ready={reviewTextReadyLocal} actionLabel={reviewTextActionLabel} onPress={captionOverlaySelectionRequired ? openTextSelectionControlsLocal : openTextSettingsLocal} />
              <ReviewPremiumStepCard icon="shapes-outline" title="Метки" meta={reviewOverlayMeta} ready={reviewOverlayReadyLocal} actionLabel={reviewOverlayActionLabel} onPress={usefulOverlaySelectionRequired ? openOverlaySelectionControlsLocal : openOverlaySettingsLocal} />
              <ReviewPremiumStepCard icon="color-filter-outline" title="Эффекты" meta={reviewEffectsMeta} ready={reviewEffectsReadyLocal} actionLabel={reviewEffectsActionLabel} onPress={effectsStackHasLocalLayers && !selectedEffectsEditorItem ? openEffectsSelectionControlsLocal : openEffectsSettingsLocal} />
              <ReviewPremiumStepCard icon="musical-notes-outline" title="MP3" meta={reviewAudioMeta} ready={reviewAudioReadyLocal} actionLabel={reviewAudioActionLabel} onPress={musicTracksHaveLocalItems && !selectedMusicTrack ? openAudioSelectionControlsLocal : openAudioSettingsLocal} />
              <ReviewPremiumStepCard icon="chatbubbles-outline" title="Соц. действия" meta={reviewSocialMeta} ready={reviewSocialReadyLocal} actionLabel={reviewSocialActionLabel} onPress={socialCommentSelectionRequired ? openCommentsSheet : runMobileInteractionQaLocal} />
              <ReviewPremiumStepCard icon="cloud-offline-outline" title="Публикация" meta={reviewPublishLockedLocal ? "Закрыто до подключения серверной загрузки." : "Только локальная проверка."} ready={false} locked actionLabel={publishReadinessExplicitSelectionDisabled ? "Выбрать" : "Закрыто"} onPress={requestPublishProviderBlocked} />
            </View>

            <View style={styles.selectedPreviewQaCard}>
              <View style={styles.selectedPreviewQaHeader}>
                <View style={styles.selectedPreviewQaIcon}>
                  <Ionicons name="play-circle-outline" size={20} color="#0B0910" />
                </View>
                <View style={styles.selectedPreviewQaText}>
                  <Text style={styles.selectedPreviewQaEyebrow} numberOfLines={1}>Предпросмотр видео</Text>
                  <Text style={styles.selectedPreviewQaTitle} numberOfLines={1}>{selectedPreviewQaEvidence.readyCount}/{selectedPreviewQaEvidence.totalCount} проверок готово</Text>
                  <Text style={styles.selectedPreviewQaMeta} numberOfLines={2}>{selectedPreviewQaEvidence.summaryLabel}</Text>
                </View>
                <View style={[styles.selectedPreviewQaPill, selectedPreviewQaEvidence.readyForViewerLocal ? styles.selectedPreviewQaPillReady : null]}>
                  <Text style={[styles.selectedPreviewQaPillText, selectedPreviewQaEvidence.readyForViewerLocal ? styles.selectedPreviewQaPillTextReady : null]} numberOfLines={1}>{selectedPreviewQaEvidence.readyForViewerLocal ? "готово" : "проверка"}</Text>
                </View>
              </View>

              <View style={styles.selectedPreviewQaGrid}>
                {selectedPreviewQaEvidence.checks.map((check) => (
                  <View key={check.id} style={[styles.selectedPreviewQaMiniCard, check.passedLocal ? styles.selectedPreviewQaMiniCardReady : null]}>
                    <Ionicons name={check.passedLocal ? "checkmark-circle" : "ellipse-outline"} size={14} color={check.passedLocal ? "#0B0910" : "#F2C75B"} />
                    <Text style={[styles.selectedPreviewQaMiniText, check.passedLocal ? styles.selectedPreviewQaMiniTextReady : null]} numberOfLines={1}>{check.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.selectedPreviewQaActionRow}>
                <SettingsPremiumAction icon="videocam-outline" label={sourceControlSelectionRequired ? "Выбрать источник" : viewerPreviewReadyLocal ? "Сменить видео" : "Добавить видео"} primary={sourceControlSelectionRequired || !viewerPreviewReadyLocal} onPress={sourceControlSelectionRequired ? openVideoSourceSelectionControlsLocal : openVideoSourceSettingsLocal} />
                <SettingsPremiumAction icon="phone-portrait-outline" label="Смотреть видео" onPress={closeShortsStudioPanelLocal} disabled={sourceControlSelectionRequired} disabledFeedbackLabel="выбери источник" disabledHint="Сначала выбери chip источника, чтобы предпросмотр не запускался молча." />
                <SettingsPremiumAction icon="refresh-outline" label="Сначала" onPress={() => void restartViewerPreviewPlaybackLocal()} disabled={sourceControlSelectionRequired} disabledFeedbackLabel="выбери источник" disabledHint="Сначала выбери chip источника перед перезапуском предпросмотра." />
              </View>
            </View>

            <View style={styles.finalInteractionCard}>
              <View style={styles.finalInteractionHeader}>
                <View style={styles.finalInteractionIcon}>
                  <Ionicons name="phone-portrait-outline" size={18} color="#0B0910" />
                </View>
                <View style={styles.finalInteractionText}>
                  <Text style={styles.finalInteractionEyebrow} numberOfLines={1}>Проверка нажатий</Text>
                  <Text style={styles.finalInteractionTitle} numberOfLines={1}>{finalInteractionReadyCount}/{finalInteractionTotalCount} действий проверено</Text>
                  <Text style={styles.finalInteractionMeta} numberOfLines={2}>{finalInteractionMissingLabel}</Text>
                </View>
                <View style={[styles.finalInteractionStatusPill, finalInteractionReadyCount === finalInteractionTotalCount ? styles.finalInteractionStatusPillReady : null]}>
                  <Text style={[styles.finalInteractionStatusText, finalInteractionReadyCount === finalInteractionTotalCount ? styles.finalInteractionStatusTextReady : null]} numberOfLines={1}>{finalInteractionStatusLabel}</Text>
                </View>
              </View>

              <View style={styles.finalInteractionGrid}>
                {mobileInteractionQaEvidence.actions.map((action) => (
                  <View key={action.id} style={[styles.finalInteractionMiniCard, action.passedLocal ? styles.finalInteractionMiniCardReady : null]}>
                    <Ionicons name={action.passedLocal ? "checkmark-circle" : action.area === "viewer" ? "phone-portrait-outline" : "options-outline"} size={14} color={action.passedLocal ? "#0B0910" : "#F2C75B"} />
                    <Text style={[styles.finalInteractionMiniText, action.passedLocal ? styles.finalInteractionMiniTextReady : null]} numberOfLines={1}>{action.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.reviewPremiumActionRow}>
              <SettingsPremiumAction icon="checkmark-done-outline" label="Финальная проверка" primary onPress={runFinalReviewWithExplicitSelectionGuardLocal} disabled={finalReviewExplicitSelectionDisabled} disabledFeedbackLabel={finalReviewExplicitSelectionDisabledLabel} disabledHint={finalReviewExplicitSelectionDisabledHint} />
              <SettingsPremiumAction icon="chatbubble-ellipses-outline" label="Открыть комментарии" onPress={openCommentsSheet} disabled={viewerSocialDraftSelectionRequired} disabledFeedbackLabel={viewerSocialDraftActionDisabledLabel} disabledHint={viewerSocialDraftActionDisabledHint} />
              <SettingsPremiumAction icon="arrow-redo-outline" label="Поделиться просмотром" onPress={() => void shareShortVideoLocal()} disabled={viewerSocialDraftSelectionRequired} disabledFeedbackLabel={viewerSocialDraftActionDisabledLabel} disabledHint={viewerSocialDraftActionDisabledHint} />
              <SettingsPremiumAction icon="cloud-offline-outline" label="Публикация закрыта" locked onPress={requestPublishProviderBlocked} disabled={publishReadinessExplicitSelectionDisabled} disabledFeedbackLabel={publishReadinessExplicitSelectionDisabledLabel} disabledHint={publishReadinessExplicitSelectionDisabledHint} />
            </View>
          </View>
        ) : null}

        <View style={styles.settingsProductionFooter}>
          <View style={styles.settingsProductionFooterText}>
            <Text style={styles.settingsProductionFooterTitle} numberOfLines={1}>Дополнительно</Text>
            <Text style={styles.settingsProductionFooterMeta} numberOfLines={2}>Открывай только для глубокой обрезки, проверки или диагностики.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={settingsAdvancedOpen ? "Скрыть дополнительные функции Shorts" : "Открыть дополнительные функции Shorts"}
            accessibilityHint="Открывает или скрывает дополнительные функции текущего раздела без автоматической прокрутки вниз."
            accessibilityState={{ expanded: settingsAdvancedOpen }}
            hitSlop={8}
            style={({ pressed }) => [
              styles.settingsAdvancedToggle,
              settingsAdvancedOpen ? styles.settingsAdvancedToggleActive : null,
              pressed ? styles.settingsAdvancedTogglePressed : null,
            ]}
            onPress={toggleSettingsAdvancedOpenLocal}
          >
            <Ionicons name={settingsAdvancedOpen ? "chevron-up-outline" : "options-outline"} size={13} color={settingsAdvancedOpen ? "#0B0910" : "#F2C75B"} />
            <Text style={[styles.settingsAdvancedToggleText, settingsAdvancedOpen ? styles.settingsAdvancedToggleTextActive : null]} numberOfLines={1}>{settingsAdvancedOpen ? "Скрыть" : "Ещё"}</Text>
          </Pressable>
        </View>

      </View>

      {settingsAdvancedOpen && reviewOpen ? (
        <React.Fragment>
      <View style={styles.row}>
        <TextInput
          value={state.draft.title}
          onChangeText={(title: string) => setState((current) => updateStreamShortVideoDraftText(current, { title }))}
          onFocus={() => scrollSettingsInputIntoKeyboardViewLocal(72)}
          onBlur={resetSettingsKeyboardInsetIfClosedLocal}
          placeholder="Название"
          placeholderTextColor="#8D8796"
          style={styles.input}
        />
        <TextInput
          value={state.draft.category}
          onChangeText={(category: string) => setState((current) => updateStreamShortVideoDraftText(current, { category }))}
          onFocus={() => scrollSettingsInputIntoKeyboardViewLocal(72)}
          onBlur={resetSettingsKeyboardInsetIfClosedLocal}
          placeholder="Категория"
          placeholderTextColor="#8D8796"
          style={styles.smallInput}
        />
      </View>

      <TextInput
        value={state.draft.caption}
        onChangeText={updateDraftCaptionTextLocal}
        onFocus={() => scrollSettingsInputIntoKeyboardViewLocal(138)}
        onBlur={resetSettingsKeyboardInsetIfClosedLocal}
        placeholder="Описание"
        placeholderTextColor="#8D8796"
        style={styles.captionInput}
        multiline
        scrollEnabled
        textAlignVertical="top"
        onContentSizeChange={() => scrollSettingsInputIntoKeyboardViewLocal(138)}
      />

      <View style={styles.row}>
        <TextInput
          value={tagsText}
          onChangeText={(value: string) => {
            setTagsText(value);
            setState((current) => updateStreamShortVideoDraftText(current, { tagsText: value }));
          }}
          onFocus={() => scrollSettingsInputIntoKeyboardViewLocal(210)}
          onBlur={resetSettingsKeyboardInsetIfClosedLocal}
          placeholder="Теги"
          placeholderTextColor="#8D8796"
          style={styles.input}
        />
        <Text style={styles.counterText}>{state.draft.tags.length}/6</Text>
      </View>

      <View style={styles.chipRow}>
        {sourceIntents.map((source) => {
          const active = state.draft.sourceIntent === source.id;
          return (
            <Pressable key={source.id} style={[styles.chip, active ? styles.chipActive : null]} onPress={() => applySourceIntent(source.id)}>
              <Ionicons name={source.icon} size={12} color={active ? "#0B0910" : "#F2C75B"} />
              <Text style={[styles.chipText, active ? styles.chipTextActive : null]} numberOfLines={1}>{source.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.chipRow}>
        {visibilities.map((visibility) => {
          const active = state.draft.visibility === visibility.id;
          return (
            <Pressable key={visibility.id} style={[styles.visibilityChip, active ? styles.chipActive : null]} onPress={() => setState((current) => setStreamShortVideoVisibility(current, visibility.id))}>
              <Text style={[styles.visibilityText, active ? styles.chipTextActive : null]} numberOfLines={1}>{visibility.label}</Text>
            </Pressable>
          );
        })}
      </View>
        </React.Fragment>
      ) : null}


      {settingsAdvancedOpen && (sourceSettingsSection === "video" || sourceSettingsSection === "edit" || sourceSettingsSection === "text" || sourceSettingsSection === "overlays") ? (
        <React.Fragment>
      <View style={styles.sourceHeader}>
        <View style={styles.timelineHeaderText}>
          <Text style={styles.timelineTitle} numberOfLines={1}>{sourceSettingsSection === "video" ? "Источник видео" : sourceSettingsSection === "edit" ? "Обрезка / кадр / обложка" : sourceSettingsSection === "text" ? "Текст на видео" : "Полезные метки"} · {selectedSource?.label ?? "Нет"} · {sourceControlStatusText}</Text>
          <Text style={styles.timelineMeta} numberOfLines={1}>{sourceControlSelectionRequired ? "выбери источник перед действиями" : sourceState.evidence.selectedReadyLocal ? "локально готово" : `${sourceState.evidence.localBlockers.length} локальных блокеров`} · нужны хранилище и медиа-провайдер</Text>
        </View>
        <Pressable style={styles.toggleButton} onPress={() => toggleSettingsAdvancedBlockOpenLocal(setSourceOpen, 860)}>
          <Ionicons name={sourceOpen ? "chevron-down-outline" : "chevron-up-outline"} size={14} color="#F2C75B" />
        </Pressable>
      </View>

        {!sourceOpen ? (
          <View style={styles.noticeRow}>
            <Ionicons name="chevron-up-outline" size={14} color="#F2C75B" />
            <Text style={styles.noticeText} numberOfLines={2}>Раздел свернут. Нажми стрелку, чтобы снова открыть функции текущего раздела.</Text>
          </View>
        ) : null}

        {sourceOpen ? (
        <View style={styles.sourceBox}>
          {sourceSettingsSection === "video" ? (
          <React.Fragment>
          <View style={styles.sourceFlowCard}>
            <View style={styles.sourceFlowPreview}>
              <View style={styles.sourceFlowIcon}>
                <Ionicons name={sourceFlowState.evidence.selectedAssetUriPresent ? "film" : "film-outline"} size={18} color="#0B0910" />
              </View>
              <View style={styles.sourceFlowText}>
                <Text style={styles.sourceFlowTitle} numberOfLines={1}>Источник видео · {formatShortsUiStatusLabel(sourceFlowState.status)}</Text>
                <Text style={styles.sourceFlowMeta} numberOfLines={2}>
                  {sourceControlSelectionRequired
                    ? "Выбери источник видео в списке перед проверкой потока."
                    : selectedSourceFlowAsset
                      ? `${selectedSourceFlowAsset.title} · ${selectedSourceFlowAsset.mimeType ?? "видео"} · ${selectedSourceFlowAsset.durationMsLocal !== null ? `${Math.round(selectedSourceFlowAsset.durationMsLocal / 1000)}с` : "длительность неизвестна"} · только на телефоне`
                      : "Выбор работает только локально: камера Sabi, галерея или файл. Ничего не загружается и не имитируется."}
                </Text>
              </View>
            </View>
            <View style={styles.sourceFlowMeters}>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{sourceControlSelectionRequired ? "Источник ждёт выбор" : sourceFlowState.evidence.cameraAssetSelectedLocal ? "Камера готова" : "Камера пусто"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{sourceControlSelectionRequired ? "Поток ждёт источник" : sourceFlowState.evidence.libraryAssetSelectedLocal ? "Галерея готова" : "Галерея пусто"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{sourceControlSelectionRequired ? "Файл ждёт источник" : sourceFlowState.evidence.documentAssetSelectedLocal ? "Файл готов" : "Файл пусто"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{sourceControlSelectionRequired ? "Монтаж ждёт источник" : sourceFlowState.evidence.timelineClipBoundLocal ? "Монтаж связан" : "Монтаж ожидает"}</Text></View>
            </View>
            <View style={styles.actionGrid}>
              <MiniAction icon="videocam-outline" label="Снять видео" onPress={() => void recordShortVideoFromCameraLocal()} />
              <MiniAction icon="images-outline" label="Видео из галереи" onPress={() => void pickShortVideoFromLibraryLocal()} />
              <MiniAction icon="document-attach-outline" label="Видео файл" onPress={() => void pickShortVideoDocumentLocal()} />
              <MiniAction icon="analytics-outline" label="Проверить поток" onPress={runSourceFlowCheckWithExplicitSelectionGuardLocal} disabled={sourceFlowExplicitSelectionDisabled} disabledFeedbackLabel={sourceFlowExplicitSelectionDisabledLabel} disabledHint={sourceFlowExplicitSelectionDisabledHint} />
              <MiniAction icon="git-branch-outline" label="Событие потока" onPress={queueSourceFlowEventWithExplicitSelectionGuardLocal} disabled={sourceFlowExplicitSelectionDisabled} disabledFeedbackLabel={sourceFlowExplicitSelectionDisabledLabel} disabledHint={sourceFlowExplicitSelectionDisabledHint} />
              <MiniAction icon="cloud-offline-outline" label="Хранилище закрыто" onPress={requestSourceFlowProviderLockedWithExplicitSelectionGuardLocal} locked disabled={sourceFlowExplicitSelectionDisabled} disabledFeedbackLabel={sourceFlowExplicitSelectionDisabledLabel} disabledHint={sourceFlowExplicitSelectionDisabledHint} />
            </View>
            <Text style={styles.noticeText} numberOfLines={2}>Используется только локальный источник видео. Хранилище, медиа-хранилище, серверный контракт и админ-проверка понадобятся перед публикацией.</Text>
          </View>

          <View style={styles.sourcePreviewCard}>
            <View style={styles.sourcePreviewTopLine}>
              <View style={styles.sourcePreviewTitleBox}>
                <Text style={styles.sourcePreviewTitle} numberOfLines={1}>Предпросмотр источника · {formatShortsUiStatusLabel(sourcePreviewPlaybackState.status)}</Text>
                <Text style={styles.sourcePreviewMeta} numberOfLines={1}>
                  {sourceControlSelectionRequired
                    ? "Выбери источник перед проверкой локального просмотра"
                    : `${sourcePreviewPlaybackState.evidence.selectedAssetTitle ?? "Видео не выбрано"} · ${sourcePreviewPlaybackState.evidence.previewReadyLocal ? "просмотр готов" : `${sourcePreviewPlaybackState.evidence.localBlockers.length} локальных блокеров`} · серверный просмотр закрыт`}
                </Text>
              </View>
              <View style={styles.sourcePreviewProgressPill}>
                <Text style={styles.sourcePreviewProgressText}>{sourcePreviewPlaybackState.evidence.progressPercentLocal}%</Text>
              </View>
            </View>

            <View style={styles.sourceVideoFrame}>
              {sourcePreviewPlaybackState.asset?.uri ? (
                <Video
                  ref={sourcePreviewVideoRef}
                  source={{ uri: sourcePreviewPlaybackState.asset.uri }}
                  style={styles.sourcePreviewVideo}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={sourcePreviewPlaybackState.isPlayingLocal}
                  isMuted={sourcePreviewPlaybackState.mutedLocal}
                  isLooping={sourcePreviewPlaybackState.loopLocal}
                  rate={sourcePreviewPlaybackState.playbackRateLocal}
                  progressUpdateIntervalMillis={700}
                  onLoad={markSourcePreviewReadyWithExplicitSelectionGuardLocal}
                  onPlaybackStatusUpdate={onSourcePreviewPlaybackStatusUpdate}
                />
              ) : (
                <View style={styles.sourcePreviewEmpty}>
                  <Ionicons name="film-outline" size={30} color="#F2C75B" />
                  <Text style={styles.sourcePreviewEmptyText}>Сними или выбери видео для локального просмотра.</Text>
                </View>
              )}
              <View style={styles.sourcePreviewOverlay}>
                <Text style={styles.sourcePreviewOverlayText}>{sourcePreviewPlaybackState.evidence.isPlayingLocal ? "идёт" : "пауза"} · {sourcePreviewPlaybackState.evidence.playbackRateLocal}x · {sourcePreviewPlaybackState.evidence.mutedLocal ? "без звука" : "звук"}</Text>
              </View>
            </View>

            <View style={styles.sourcePreviewTimelineTrack}>
              <View style={[styles.sourcePreviewTimelineFill, { width: `${sourcePreviewPlaybackState.evidence.progressPercentLocal}%` }]} />
            </View>

            <View style={styles.actionGrid}>
              <MiniAction icon="play-outline" label="Воспроизвести" onPress={() => void playSourcePreviewLocal()} disabled={sourcePreviewExplicitSelectionDisabled} disabledFeedbackLabel={sourcePreviewExplicitSelectionDisabledLabel} disabledHint={sourcePreviewExplicitSelectionDisabledHint} />
              <MiniAction icon="pause-outline" label="Пауза" onPress={() => void pauseSourcePreviewLocal()} disabled={sourcePreviewExplicitSelectionDisabled} disabledFeedbackLabel={sourcePreviewExplicitSelectionDisabledLabel} disabledHint={sourcePreviewExplicitSelectionDisabledHint} />
              <MiniAction icon="refresh-outline" label="Сначала" onPress={() => void restartSourcePreviewLocal()} disabled={sourcePreviewExplicitSelectionDisabled} disabledFeedbackLabel={sourcePreviewExplicitSelectionDisabledLabel} disabledHint={sourcePreviewExplicitSelectionDisabledHint} />
              <MiniAction icon={sourcePreviewPlaybackState.evidence.mutedLocal ? "volume-mute-outline" : "volume-high-outline"} label={sourcePreviewPlaybackState.evidence.mutedLocal ? "Включить звук" : "Выключить звук"} onPress={() => runSourcePreviewPlaybackActionWithExplicitSelectionGuardLocal(() => setSourcePreviewPlaybackState(toggleStreamShortVideoSourcePreviewMuteLocal))} disabled={sourcePreviewExplicitSelectionDisabled} disabledFeedbackLabel={sourcePreviewExplicitSelectionDisabledLabel} disabledHint={sourcePreviewExplicitSelectionDisabledHint} />
              <MiniAction icon="repeat-outline" label={sourcePreviewPlaybackState.evidence.loopLocal ? "Повтор вкл." : "Повтор выкл."} onPress={() => runSourcePreviewPlaybackActionWithExplicitSelectionGuardLocal(() => setSourcePreviewPlaybackState(toggleStreamShortVideoSourcePreviewLoopLocal))} disabled={sourcePreviewExplicitSelectionDisabled} disabledFeedbackLabel={sourcePreviewExplicitSelectionDisabledLabel} disabledHint={sourcePreviewExplicitSelectionDisabledHint} />
              <MiniAction icon="speedometer-outline" label={`${sourcePreviewPlaybackState.evidence.playbackRateLocal}x`} onPress={() => runSourcePreviewPlaybackActionWithExplicitSelectionGuardLocal(() => setSourcePreviewPlaybackState(cycleStreamShortVideoSourcePreviewSpeedLocal))} disabled={sourcePreviewExplicitSelectionDisabled} disabledFeedbackLabel={sourcePreviewExplicitSelectionDisabledLabel} disabledHint={sourcePreviewExplicitSelectionDisabledHint} />
              <MiniAction icon="analytics-outline" label="Проверка просмотра" onPress={runSourcePreviewCheckWithExplicitSelectionGuardLocal} disabled={sourcePreviewExplicitSelectionDisabled} disabledFeedbackLabel={sourcePreviewExplicitSelectionDisabledLabel} disabledHint={sourcePreviewExplicitSelectionDisabledHint} />
              <MiniAction icon="git-branch-outline" label="Событие просмотра" onPress={queueSourcePreviewEventWithExplicitSelectionGuardLocal} disabled={sourcePreviewExplicitSelectionDisabled} disabledFeedbackLabel={sourcePreviewExplicitSelectionDisabledLabel} disabledHint={sourcePreviewExplicitSelectionDisabledHint} />
              <MiniAction icon="cloud-offline-outline" label="Манифест закрыт" onPress={requestSourcePreviewProviderLockedWithExplicitSelectionGuardLocal} locked disabled={sourcePreviewExplicitSelectionDisabled} disabledFeedbackLabel={sourcePreviewExplicitSelectionDisabledLabel} disabledHint={sourcePreviewExplicitSelectionDisabledHint} />
            </View>
            <View style={styles.sourceFlowMeters}>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{sourceControlSelectionRequired ? "Источник ждёт выбор" : sourcePreviewPlaybackState.evidence.previewReadyLocal ? "Просмотр готов" : "Просмотр ожидает"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{sourceControlSelectionRequired ? "Просмотр ждёт источник" : sourcePreviewPlaybackState.evidence.playbackBoundLocal ? "Плеер связан" : "Плеер ожидает"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{sourceControlSelectionRequired ? "События ждут источник" : `${sourcePreviewPlaybackState.evidence.queuedPreviewEvents} событий просмотра`}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{sourceControlSelectionRequired ? "Плеер ждёт источник" : "Без фальшивого плеера"}</Text></View>
            </View>
          </View>
          </React.Fragment>
          ) : null}

          {settingsAdvancedOpen && sourceSettingsSection === "edit" ? (
          <View style={styles.trimCropCoverCard}>
            <View style={styles.trimCropCoverTopLine}>
              <View style={styles.trimCropCoverIcon}>
                <Ionicons name={trimCropCoverFrameState.evidence.editorReadyLocal ? "checkmark-circle" : "crop-outline"} size={18} color="#0B0910" />
              </View>
              <View style={styles.trimCropCoverTextBox}>
                <Text style={styles.trimCropCoverTitle} numberOfLines={1}>Обрезка / кадр / обложка · {formatShortsUiStatusLabel(trimCropCoverFrameState.status)}</Text>
                <Text style={styles.trimCropCoverMeta} numberOfLines={2}>
                  {sourceControlSelectionRequired
                    ? "Выбери источник перед обрезкой, кадром и обложкой"
                    : `${trimCropCoverFrameState.evidence.selectedAssetTitle ?? "Сначала выбери видео"} · обрезка ${Math.round(trimCropCoverFrameState.evidence.trimDurationMsLocal / 1000)}с · кадр ${formatShortsCropPresetLabel(trimCropCoverFrameState.evidence.cropPresetLocal)} · обложка ${trimCropCoverFrameState.evidence.coverFrameMsLocal ?? "ожидает"} мс`}
                </Text>
              </View>
            </View>

            <View style={styles.trimCropCoverTrack}>
              <View style={[styles.trimCropCoverTrimFill, { width: `${trimCropCoverFrameState.evidence.durationMsLocal ? Math.max(4, Math.min(100, Math.round((trimCropCoverFrameState.evidence.trimDurationMsLocal / trimCropCoverFrameState.evidence.durationMsLocal) * 100))) : 0}%` }]} />
              <View style={[styles.trimCropCoverCoverMark, { left: `${trimCropCoverFrameState.evidence.durationMsLocal && trimCropCoverFrameState.evidence.coverFrameMsLocal !== null ? Math.max(0, Math.min(96, Math.round((trimCropCoverFrameState.evidence.coverFrameMsLocal / trimCropCoverFrameState.evidence.durationMsLocal) * 100))) : 0}%` }]} />
            </View>

            <View style={styles.actionGrid}>
              <MiniAction icon="play-skip-back-outline" label="Старт -" onPress={() => runTrimCropCoverMutationWithExplicitSelectionGuardLocal(() => setTrimCropCoverFrameState((current) => nudgeStreamShortVideoTrimStartLocal(current, "back")))} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
              <MiniAction icon="play-skip-forward-outline" label="Старт +" onPress={() => runTrimCropCoverMutationWithExplicitSelectionGuardLocal(() => setTrimCropCoverFrameState((current) => nudgeStreamShortVideoTrimStartLocal(current, "forward")))} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
              <MiniAction icon="play-back-outline" label="Конец -" onPress={() => runTrimCropCoverMutationWithExplicitSelectionGuardLocal(() => setTrimCropCoverFrameState((current) => nudgeStreamShortVideoTrimEndLocal(current, "back")))} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
              <MiniAction icon="play-forward-outline" label="Конец +" onPress={() => runTrimCropCoverMutationWithExplicitSelectionGuardLocal(() => setTrimCropCoverFrameState((current) => nudgeStreamShortVideoTrimEndLocal(current, "forward")))} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
              <MiniAction icon="refresh-outline" label="Сбросить обрезку" onPress={() => runTrimCropCoverMutationWithExplicitSelectionGuardLocal(() => setTrimCropCoverFrameState(resetStreamShortVideoTrimLocal))} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
              <MiniAction icon="resize-outline" label={trimCropCoverFrameState.evidence.cropPresetLocal} onPress={() => runTrimCropCoverMutationWithExplicitSelectionGuardLocal(() => setTrimCropCoverFrameState(cycleStreamShortVideoCropPresetLocal))} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
              <MiniAction icon="arrow-back-outline" label="Кадр X-" onPress={() => runTrimCropCoverMutationWithExplicitSelectionGuardLocal(() => setTrimCropCoverFrameState((current) => nudgeStreamShortVideoCropXLocal(current, "left")))} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
              <MiniAction icon="arrow-forward-outline" label="Кадр X+" onPress={() => runTrimCropCoverMutationWithExplicitSelectionGuardLocal(() => setTrimCropCoverFrameState((current) => nudgeStreamShortVideoCropXLocal(current, "right")))} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
              <MiniAction icon="arrow-up-outline" label="Кадр Y-" onPress={() => runTrimCropCoverMutationWithExplicitSelectionGuardLocal(() => setTrimCropCoverFrameState((current) => nudgeStreamShortVideoCropYLocal(current, "up")))} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
              <MiniAction icon="arrow-down-outline" label="Кадр Y+" onPress={() => runTrimCropCoverMutationWithExplicitSelectionGuardLocal(() => setTrimCropCoverFrameState((current) => nudgeStreamShortVideoCropYLocal(current, "down")))} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
              <MiniAction icon="scan-outline" label={`${trimCropCoverFrameState.evidence.cropZoomPercentLocal}%`} onPress={() => runTrimCropCoverMutationWithExplicitSelectionGuardLocal(() => setTrimCropCoverFrameState(cycleStreamShortVideoCropZoomLocal))} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
              <MiniAction icon="image-outline" label="Обложка -" onPress={() => runTrimCropCoverMutationWithExplicitSelectionGuardLocal(() => setTrimCropCoverFrameState((current) => nudgeStreamShortVideoCoverFrameLocal(current, "back")))} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
              <MiniAction icon="images-outline" label="Обложка +" onPress={() => runTrimCropCoverMutationWithExplicitSelectionGuardLocal(() => setTrimCropCoverFrameState((current) => nudgeStreamShortVideoCoverFrameLocal(current, "forward")))} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
              <MiniAction icon="film-outline" label="Связать монтаж" onPress={bindTrimCropCoverToTimelineWithExplicitSelectionGuardLocal} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
              <MiniAction icon="shield-checkmark-outline" label="Проверить обложку" onPress={bindTrimCropCoverToReviewWithExplicitSelectionGuardLocal} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
              <MiniAction icon="analytics-outline" label="Проверить редактор" onPress={runTrimCropCoverCheckWithExplicitSelectionGuardLocal} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
              <MiniAction icon="git-branch-outline" label="Событие монтажа" onPress={queueTrimCropCoverEventWithExplicitSelectionGuardLocal} disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
              <MiniAction icon="cloud-offline-outline" label="Рендер закрыт" onPress={requestTrimCropCoverProviderLockedWithExplicitSelectionGuardLocal} locked disabled={trimCropCoverExplicitSelectionDisabled} disabledFeedbackLabel={trimCropCoverExplicitSelectionDisabledLabel} disabledHint={trimCropCoverExplicitSelectionDisabledHint} />
            </View>

            <View style={styles.sourceFlowMeters}>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{sourceControlSelectionRequired ? "Обрезка ждёт источник" : trimCropCoverFrameState.evidence.trimReadyLocal ? "Обрезка готова" : "Обрезка ожидает"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{sourceControlSelectionRequired ? "Кадр ждёт источник" : trimCropCoverFrameState.evidence.cropReadyLocal ? "Кадр готов" : "Кадр ожидает"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{sourceControlSelectionRequired ? "Обложка ждёт источник" : trimCropCoverFrameState.evidence.coverFrameReadyLocal ? "Обложка готова" : "Обложка ожидает"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{sourceControlSelectionRequired ? "Монтаж ждёт источник" : trimCropCoverFrameState.evidence.timelineBoundLocal ? "Монтаж связан" : "Монтаж ожидает"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{sourceControlSelectionRequired ? "Проверка ждёт источник" : trimCropCoverFrameState.evidence.reviewCoverBoundLocal ? "Проверка связана" : "Проверка ожидает"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>Без фальшивого рендера</Text></View>
            </View>
            <Text style={styles.noticeText} numberOfLines={2}>Монтаж сохраняется только локально. Рендер, экспорт, хранилище, медиа-хранилище, серверный контракт и админ-проверка пока закрыты.</Text>
          </View>
          ) : null}

          {sourceSettingsSection === "text" ? (
          <View style={styles.captionOverlayCard}>
            <View style={styles.captionOverlayTopLine}>
              <View style={styles.captionOverlayIcon}>
                <Ionicons name={selectedCaptionOverlay ? "checkmark-circle" : "text-outline"} size={18} color="#0B0910" />
              </View>
              <View style={styles.captionOverlayTextBox}>
                <Text style={styles.captionOverlayTitle} numberOfLines={1}>Текст на видео · {formatShortsUiStatusLabel(captionTextOverlayState.status)}</Text>
                <Text style={styles.captionOverlayMeta} numberOfLines={2}>
                  {captionTextOverlayState.evidence.selectedAssetTitle ?? "Выбери источник видео"} · {captionTextOverlayState.evidence.overlayCountLocal} текст · {selectedCaptionOverlay ? `${selectedCaptionOverlay.startMs}-${selectedCaptionOverlay.endMs} мс · ${selectedCaptionOverlay.placement} · ${selectedCaptionOverlay.fontSize}px` : captionOverlayPendingSelectionLabel}
                </Text>
              </View>
            </View>

            <TextInput
              value={selectedCaptionOverlay?.text ?? ""}
              onChangeText={updateCaptionOverlayTextLocal}
              onFocus={() => scrollSettingsInputIntoKeyboardViewLocal(520)}
              onBlur={resetSettingsKeyboardInsetIfClosedLocal}
              placeholder={captionOverlaysHaveLocalItems ? "Выбери текстовый слой" : "Текст на видео"}
              placeholderTextColor="#8D8796"
              editable={!captionOverlayActionDisabled}
              style={[styles.captionOverlayInput, captionOverlayActionDisabled ? styles.captionOverlayInputDisabled : null]}
              maxLength={96}
              multiline
              scrollEnabled
              textAlignVertical="top"
              onContentSizeChange={() => scrollSettingsInputIntoKeyboardViewLocal(520)}
            />

            <View style={styles.captionOverlayStage}>
              {selectedCaptionOverlay ? (
                <View style={[
                  styles.captionOverlayPreviewBubble,
                  selectedCaptionOverlay.backdropPreset === "solid" ? styles.captionOverlayPreviewSolid : null,
                  selectedCaptionOverlay.backdropPreset === "glass" ? styles.captionOverlayPreviewGlass : null,
                  selectedCaptionOverlay.backdropPreset === "none" ? styles.captionOverlayPreviewNone : null,
                  { left: `${Math.max(3, Math.min(72, selectedCaptionOverlay.xPercent - 25))}%`, top: `${Math.max(4, Math.min(82, selectedCaptionOverlay.yPercent - 7))}%` },
                ]}>
                  <Text style={[
                    styles.captionOverlayPreviewText,
                    selectedCaptionOverlay.colorPreset === "warm" ? styles.captionOverlayPreviewWarm : null,
                    selectedCaptionOverlay.colorPreset === "dark" ? styles.captionOverlayPreviewDark : null,
                    selectedCaptionOverlay.colorPreset === "sky" ? styles.captionOverlayPreviewSky : null,
                    { fontSize: Math.max(14, Math.round(selectedCaptionOverlay.fontSize * 0.54)), textAlign: selectedCaptionOverlay.align },
                  ]} numberOfLines={2}>{selectedCaptionOverlay.text || "Текст"}</Text>
                </View>
              ) : (
                <Text style={styles.captionOverlayEmptyText}>{captionOverlayEmptyPreviewText}</Text>
              )}
            </View>

            <View style={styles.captionOverlayList}>
              {captionTextOverlayState.overlays.map((overlay) => {
                const active = overlay.overlayId === explicitCaptionOverlaySelectionId;
                const justSelected = captionOverlayFeedbackId === overlay.overlayId;
                return (
                  <Pressable
                    key={overlay.overlayId}
                    accessibilityRole="button"
                    accessibilityLabel={`Текстовый слой: ${overlay.text || "Описание"}`}
                    accessibilityState={active ? { selected: true } : undefined}
                    hitSlop={6}
                    style={({ pressed }) => [
                      styles.captionOverlayChip,
                      active ? styles.captionOverlayChipActive : null,
                      justSelected ? styles.captionOverlayChipFeedback : null,
                      pressed ? styles.captionOverlayChipPressed : null,
                    ]}
                    onPress={() => selectCaptionOverlayWithFeedbackLocal(overlay.overlayId)}
                  >
                    <Text style={[styles.captionOverlayChipText, active ? styles.chipTextActive : null]} numberOfLines={2}>{overlay.text || "Описание"}</Text>
                    <Text style={[styles.audioTrackChipFeedbackText, active ? styles.audioTrackChipFeedbackTextActive : null, justSelected ? null : styles.audioTrackChipFeedbackTextHidden]} numberOfLines={1}>{justSelected ? "выбрано" : " "}</Text>
                  </Pressable>
                );
              })}
            </View>
            {captionOverlaysHaveLocalItems && !selectedCaptionOverlay ? (
              <Text style={styles.captionOverlayListHint} numberOfLines={2}>Выбери текстовый слой в списке, чтобы редактировать его. Первый слой не меняется молча.</Text>
            ) : null}
            {captionTextOverlayState.overlays.length > 4 ? (
              <Text style={styles.captionOverlayListHint} numberOfLines={2}>Все текстовые слои доступны здесь. Ничего не скрывается после четвёртого элемента.</Text>
            ) : null}

            <View style={styles.actionGrid}>
              <MiniAction icon="add-outline" label="Добавить текст" onPress={addCaptionOverlayForExplicitSelectionLocal} />
              <MiniAction icon="trash-outline" label="Убрать" onPress={removeExplicitCaptionOverlayLocal} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
              <MiniAction icon="locate-outline" label={selectedCaptionOverlay ? formatShortsUiStatusLabel(selectedCaptionOverlay.placement) : captionOverlayActionDisabledLabel} onPress={() => runCaptionOverlayMutationWithExplicitSelectionGuardLocal(() => setCaptionTextOverlayState(cycleSelectedStreamShortVideoCaptionPlacementLocal))} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
              <MiniAction icon="arrow-back-outline" label="X-" onPress={() => runCaptionOverlayMutationWithExplicitSelectionGuardLocal(() => setCaptionTextOverlayState((current) => nudgeSelectedStreamShortVideoCaptionXLocal(current, "left")))} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
              <MiniAction icon="arrow-forward-outline" label="X+" onPress={() => runCaptionOverlayMutationWithExplicitSelectionGuardLocal(() => setCaptionTextOverlayState((current) => nudgeSelectedStreamShortVideoCaptionXLocal(current, "right")))} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
              <MiniAction icon="arrow-up-outline" label="Y-" onPress={() => runCaptionOverlayMutationWithExplicitSelectionGuardLocal(() => setCaptionTextOverlayState((current) => nudgeSelectedStreamShortVideoCaptionYLocal(current, "up")))} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
              <MiniAction icon="arrow-down-outline" label="Y+" onPress={() => runCaptionOverlayMutationWithExplicitSelectionGuardLocal(() => setCaptionTextOverlayState((current) => nudgeSelectedStreamShortVideoCaptionYLocal(current, "down")))} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
              <MiniAction icon="text-outline" label={selectedCaptionOverlay ? `${selectedCaptionOverlay.fontSize}px` : captionOverlayActionDisabledLabel} onPress={() => runCaptionOverlayMutationWithExplicitSelectionGuardLocal(() => setCaptionTextOverlayState(cycleSelectedStreamShortVideoCaptionFontSizeLocal))} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
              <MiniAction icon="color-palette-outline" label={selectedCaptionOverlay ? formatShortsUiStatusLabel(selectedCaptionOverlay.colorPreset) : captionOverlayActionDisabledLabel} onPress={() => runCaptionOverlayMutationWithExplicitSelectionGuardLocal(() => setCaptionTextOverlayState(cycleSelectedStreamShortVideoCaptionColorLocal))} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
              <MiniAction icon="albums-outline" label={selectedCaptionOverlay ? formatShortsUiStatusLabel(selectedCaptionOverlay.backdropPreset) : captionOverlayActionDisabledLabel} onPress={() => runCaptionOverlayMutationWithExplicitSelectionGuardLocal(() => setCaptionTextOverlayState(cycleSelectedStreamShortVideoCaptionBackdropLocal))} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
              <MiniAction icon="reorder-three-outline" label={selectedCaptionOverlay ? formatShortsUiStatusLabel(selectedCaptionOverlay.align) : captionOverlayActionDisabledLabel} onPress={() => runCaptionOverlayMutationWithExplicitSelectionGuardLocal(() => setCaptionTextOverlayState(cycleSelectedStreamShortVideoCaptionAlignLocal))} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
              <MiniAction icon="play-skip-back-outline" label="Старт -" onPress={() => runCaptionOverlayMutationWithExplicitSelectionGuardLocal(() => setCaptionTextOverlayState((current) => shiftSelectedStreamShortVideoCaptionStartLocal(current, "back")))} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
              <MiniAction icon="play-skip-forward-outline" label="Старт +" onPress={() => runCaptionOverlayMutationWithExplicitSelectionGuardLocal(() => setCaptionTextOverlayState((current) => shiftSelectedStreamShortVideoCaptionStartLocal(current, "forward")))} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
              <MiniAction icon="play-back-outline" label="Конец -" onPress={() => runCaptionOverlayMutationWithExplicitSelectionGuardLocal(() => setCaptionTextOverlayState((current) => shiftSelectedStreamShortVideoCaptionEndLocal(current, "back")))} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
              <MiniAction icon="play-forward-outline" label="Конец +" onPress={() => runCaptionOverlayMutationWithExplicitSelectionGuardLocal(() => setCaptionTextOverlayState((current) => shiftSelectedStreamShortVideoCaptionEndLocal(current, "forward")))} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
              <MiniAction icon="film-outline" label="Связать монтаж" onPress={bindCaptionOverlayToTimelineLocal} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
              <MiniAction icon="shield-checkmark-outline" label="Связать проверку" onPress={bindCaptionOverlayToReviewLocal} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
              <MiniAction icon="analytics-outline" label="Проверить текст" onPress={runCaptionOverlayCheckWithExplicitSelectionGuardLocal} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
              <MiniAction icon="git-branch-outline" label="Событие текста" onPress={queueCaptionOverlayEventWithExplicitSelectionGuardLocal} disabled={captionOverlayActionDisabled} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
              <MiniAction icon="cloud-offline-outline" label="Рендер закрыт" onPress={requestCaptionTextOverlayProviderLockedWithExplicitSelectionGuardLocal} locked disabled={captionOverlaySelectionRequired} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
            </View>

            <View style={styles.sourceFlowMeters}>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{captionOverlaySelectionRequired ? "Выбери текст" : captionTextOverlayState.evidence.selectedTextPresentLocal ? "Текст готов" : "Текст ожидает"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{captionOverlaySelectionRequired ? "Позиция ждёт выбор" : captionTextOverlayState.evidence.positionBoundLocal ? "Позиция готова" : "Позиция ожидает"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{captionOverlaySelectionRequired ? "Стиль ждёт выбор" : captionTextOverlayState.evidence.styleBoundLocal ? "Стиль готов" : "Стиль ожидает"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{captionOverlaySelectionRequired ? "Монтаж ждёт выбор" : captionTextOverlayState.evidence.timelineBoundLocal ? "Монтаж связан" : "Монтаж ожидает"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{captionOverlaySelectionRequired ? "Проверка ждёт выбор" : captionTextOverlayState.evidence.reviewBoundLocal ? "Проверка связана" : "Проверка ожидает"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>Без фальшивого рендера</Text></View>
            </View>
            <Text style={styles.noticeText} numberOfLines={2}>Текст сохраняется только локально. Рендер, экспорт, хранилище/медиа-хранилище и публикация пока закрыты.</Text>
          </View>

          ) : null}

          {sourceSettingsSection === "overlays" ? (
          <View style={styles.captionOverlayCard}>
            <View style={styles.captionOverlayTopLine}>
              <View style={styles.captionOverlayIcon}>
                <Ionicons name={selectedUsefulOverlay ? "checkmark-circle" : "shapes-outline"} size={18} color="#0B0910" />
              </View>
              <View style={styles.captionOverlayTextBox}>
                <Text style={styles.captionOverlayTitle} numberOfLines={1}>Полезные метки · {formatShortsUiStatusLabel(usefulOverlayEditorState.status)}</Text>
                <Text style={styles.captionOverlayMeta} numberOfLines={2}>
                  {usefulOverlayEditorState.evidence.selectedAssetTitle ?? "Выбери источник видео"} · {usefulOverlayEditorState.evidence.overlayCountLocal} метка · {selectedUsefulOverlay ? `${formatShortsOverlayKindLabel(selectedUsefulOverlay.kind)} · слой ${formatShortsOverlayLayerLabel(selectedUsefulOverlay.layer)} · ${selectedUsefulOverlay.startMs}-${selectedUsefulOverlay.endMs} мс` : usefulOverlayPendingSelectionLabel}
                </Text>
              </View>
            </View>

            <TextInput
              value={selectedUsefulOverlay?.label ?? ""}
              onChangeText={updateUsefulOverlayLabelLocal}
              onFocus={() => scrollSettingsInputIntoKeyboardViewLocal(520)}
              onBlur={resetSettingsKeyboardInsetIfClosedLocal}
              placeholder={usefulOverlaysHaveLocalItems ? "Выбери метку" : "Полезная метка"}
              placeholderTextColor="#8D8796"
              editable={!usefulOverlayActionDisabled}
              style={[styles.captionOverlayInput, usefulOverlayActionDisabled ? styles.captionOverlayInputDisabled : null]}
              maxLength={28}
            />

            <View style={styles.usefulOverlayStage}>
              {selectedUsefulOverlay ? (
                <View style={[
                  styles.usefulOverlayPreviewItem,
                  selectedUsefulOverlay.shape === "circle" ? styles.usefulOverlayCircle : null,
                  selectedUsefulOverlay.shape === "box" ? styles.usefulOverlayBox : null,
                  selectedUsefulOverlay.shape === "underline" ? styles.usefulOverlayUnderline : null,
                  selectedUsefulOverlay.tone === "light" ? styles.usefulOverlayLight : null,
                  selectedUsefulOverlay.tone === "dark" ? styles.usefulOverlayDark : null,
                  selectedUsefulOverlay.tone === "blue" ? styles.usefulOverlayBlue : null,
                  selectedUsefulOverlay.tone === "green" ? styles.usefulOverlayGreen : null,
                  {
                    left: `${Math.max(2, Math.min(74, selectedUsefulOverlay.xPercent - 18))}%`,
                    top: `${Math.max(4, Math.min(78, selectedUsefulOverlay.yPercent - 8))}%`,
                    opacity: selectedUsefulOverlay.opacityPercent / 100,
                    transform: [{ scale: selectedUsefulOverlay.scalePercent / 100 }, { rotate: `${selectedUsefulOverlay.rotationDeg}deg` }],
                  },
                ]}>
                  <Text style={styles.usefulOverlayIconText} numberOfLines={1}>{selectedUsefulOverlay.iconText}</Text>
                  <Text style={styles.usefulOverlayPreviewText} numberOfLines={1}>{selectedUsefulOverlay.label}</Text>
                </View>
              ) : (
                <Text style={styles.captionOverlayEmptyText}>{usefulOverlayEmptyPreviewText}</Text>
              )}
            </View>

            <View style={styles.captionOverlayList}>
              {usefulOverlayEditorState.overlays.map((overlay) => {
                const active = overlay.overlayId === explicitUsefulOverlaySelectionId;
                const justSelected = usefulOverlayFeedbackId === overlay.overlayId;
                return (
                  <Pressable
                    key={overlay.overlayId}
                    accessibilityRole="button"
                    accessibilityLabel={`Полезная метка: ${overlay.label || formatShortsOverlayKindLabel(overlay.kind)}`}
                    accessibilityState={active ? { selected: true } : undefined}
                    hitSlop={6}
                    style={({ pressed }) => [
                      styles.captionOverlayChip,
                      active ? styles.captionOverlayChipActive : null,
                      justSelected ? styles.captionOverlayChipFeedback : null,
                      pressed ? styles.captionOverlayChipPressed : null,
                    ]}
                    onPress={() => selectUsefulOverlayWithFeedbackLocal(overlay.overlayId)}
                  >
                    <Text style={[styles.captionOverlayChipText, active ? styles.chipTextActive : null]} numberOfLines={2}>{overlay.label || formatShortsOverlayKindLabel(overlay.kind)}</Text>
                    <Text style={[styles.audioTrackChipFeedbackText, active ? styles.audioTrackChipFeedbackTextActive : null, justSelected ? null : styles.audioTrackChipFeedbackTextHidden]} numberOfLines={1}>{justSelected ? "выбрано" : " "}</Text>
                  </Pressable>
                );
              })}
            </View>
            {usefulOverlaysHaveLocalItems && !selectedUsefulOverlay ? (
              <Text style={styles.captionOverlayListHint} numberOfLines={2}>Выбери метку в списке, чтобы редактировать её. Первая метка не меняется молча.</Text>
            ) : null}
            {usefulOverlayEditorState.overlays.length > 5 ? (
              <Text style={styles.captionOverlayListHint} numberOfLines={2}>Все метки доступны здесь. Ничего не скрывается после пятого элемента.</Text>
            ) : null}

            <View style={styles.actionGrid}>
              <MiniAction icon="add-outline" label="Добавить метку" onPress={addUsefulOverlayForExplicitSelectionLocal} />
              <MiniAction icon="trash-outline" label="Убрать" onPress={removeExplicitUsefulOverlayLocal} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="pricetag-outline" label={selectedUsefulOverlay?.kind ?? usefulOverlayActionDisabledLabel} onPress={() => runUsefulOverlayMutationWithExplicitSelectionGuardLocal(() => setUsefulOverlayEditorState(cycleSelectedStreamShortVideoUsefulOverlayKindLocal))} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="color-palette-outline" label={selectedUsefulOverlay?.tone ?? usefulOverlayActionDisabledLabel} onPress={() => runUsefulOverlayMutationWithExplicitSelectionGuardLocal(() => setUsefulOverlayEditorState(cycleSelectedStreamShortVideoUsefulOverlayToneLocal))} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="shapes-outline" label={selectedUsefulOverlay?.shape ?? usefulOverlayActionDisabledLabel} onPress={() => runUsefulOverlayMutationWithExplicitSelectionGuardLocal(() => setUsefulOverlayEditorState(cycleSelectedStreamShortVideoUsefulOverlayShapeLocal))} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="arrow-back-outline" label="X-" onPress={() => runUsefulOverlayMutationWithExplicitSelectionGuardLocal(() => setUsefulOverlayEditorState((current) => nudgeSelectedStreamShortVideoUsefulOverlayXLocal(current, "left")))} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="arrow-forward-outline" label="X+" onPress={() => runUsefulOverlayMutationWithExplicitSelectionGuardLocal(() => setUsefulOverlayEditorState((current) => nudgeSelectedStreamShortVideoUsefulOverlayXLocal(current, "right")))} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="arrow-up-outline" label="Y-" onPress={() => runUsefulOverlayMutationWithExplicitSelectionGuardLocal(() => setUsefulOverlayEditorState((current) => nudgeSelectedStreamShortVideoUsefulOverlayYLocal(current, "up")))} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="arrow-down-outline" label="Y+" onPress={() => runUsefulOverlayMutationWithExplicitSelectionGuardLocal(() => setUsefulOverlayEditorState((current) => nudgeSelectedStreamShortVideoUsefulOverlayYLocal(current, "down")))} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="layers-outline" label={selectedUsefulOverlay ? `L${selectedUsefulOverlay.layer}` : usefulOverlayActionDisabledLabel} onPress={() => runUsefulOverlayMutationWithExplicitSelectionGuardLocal(() => setUsefulOverlayEditorState(cycleSelectedStreamShortVideoUsefulOverlayLayerLocal))} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="contract-outline" label="Масштаб -" onPress={() => runUsefulOverlayMutationWithExplicitSelectionGuardLocal(() => setUsefulOverlayEditorState((current) => nudgeSelectedStreamShortVideoUsefulOverlayScaleLocal(current, "smaller")))} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="expand-outline" label="Масштаб +" onPress={() => runUsefulOverlayMutationWithExplicitSelectionGuardLocal(() => setUsefulOverlayEditorState((current) => nudgeSelectedStreamShortVideoUsefulOverlayScaleLocal(current, "larger")))} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="refresh-outline" label="Поворот -" onPress={() => runUsefulOverlayMutationWithExplicitSelectionGuardLocal(() => setUsefulOverlayEditorState((current) => nudgeSelectedStreamShortVideoUsefulOverlayRotationLocal(current, "left")))} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="refresh-circle-outline" label="Поворот +" onPress={() => runUsefulOverlayMutationWithExplicitSelectionGuardLocal(() => setUsefulOverlayEditorState((current) => nudgeSelectedStreamShortVideoUsefulOverlayRotationLocal(current, "right")))} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="scan-outline" label={selectedUsefulOverlay ? `${selectedUsefulOverlay.opacityPercent}%` : usefulOverlayActionDisabledLabel} onPress={() => runUsefulOverlayMutationWithExplicitSelectionGuardLocal(() => setUsefulOverlayEditorState(cycleSelectedStreamShortVideoUsefulOverlayOpacityLocal))} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="play-skip-back-outline" label="Старт -" onPress={() => runUsefulOverlayMutationWithExplicitSelectionGuardLocal(() => setUsefulOverlayEditorState((current) => shiftSelectedStreamShortVideoUsefulOverlayStartLocal(current, "back")))} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="play-skip-forward-outline" label="Старт +" onPress={() => runUsefulOverlayMutationWithExplicitSelectionGuardLocal(() => setUsefulOverlayEditorState((current) => shiftSelectedStreamShortVideoUsefulOverlayStartLocal(current, "forward")))} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="play-back-outline" label="Конец -" onPress={() => runUsefulOverlayMutationWithExplicitSelectionGuardLocal(() => setUsefulOverlayEditorState((current) => shiftSelectedStreamShortVideoUsefulOverlayEndLocal(current, "back")))} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="play-forward-outline" label="Конец +" onPress={() => runUsefulOverlayMutationWithExplicitSelectionGuardLocal(() => setUsefulOverlayEditorState((current) => shiftSelectedStreamShortVideoUsefulOverlayEndLocal(current, "forward")))} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="film-outline" label="Связать монтаж" onPress={bindUsefulOverlayToTimelineLocal} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="shield-checkmark-outline" label="Связать проверку" onPress={bindUsefulOverlayToReviewLocal} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="analytics-outline" label="Проверить метку" onPress={runUsefulOverlayCheckWithExplicitSelectionGuardLocal} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="git-branch-outline" label="Событие метки" onPress={queueUsefulOverlayEventWithExplicitSelectionGuardLocal} disabled={usefulOverlayActionDisabled} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
              <MiniAction icon="cloud-offline-outline" label="Рендер закрыт" onPress={requestUsefulOverlayProviderLockedWithExplicitSelectionGuardLocal} locked disabled={usefulOverlaySelectionRequired} disabledFeedbackLabel={usefulOverlayActionDisabledLabel} disabledHint={usefulOverlayActionDisabledHint} />
            </View>

            <View style={styles.sourceFlowMeters}>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{usefulOverlaySelectionRequired ? "Выбери метку" : usefulOverlayEditorState.evidence.positionBoundLocal ? "Позиция готова" : "Позиция ожидает"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{usefulOverlaySelectionRequired ? "Стиль ждёт выбор" : usefulOverlayEditorState.evidence.styleBoundLocal ? "Стиль готов" : "Стиль ожидает"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{usefulOverlaySelectionRequired ? "Слой ждёт выбор" : usefulOverlayEditorState.evidence.layerBoundLocal ? "Слой готов" : "Слой ожидает"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{usefulOverlaySelectionRequired ? "Монтаж ждёт выбор" : usefulOverlayEditorState.evidence.timelineBoundLocal ? "Монтаж связан" : "Монтаж ожидает"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>{usefulOverlaySelectionRequired ? "Проверка ждёт выбор" : usefulOverlayEditorState.evidence.reviewBoundLocal ? "Проверка связана" : "Проверка ожидает"}</Text></View>
              <View style={styles.sourceFlowMeterPill}><Text style={styles.sourceFlowMeterText}>Только чистые метки</Text></View>
            </View>
            <Text style={styles.noticeText} numberOfLines={2}>Метки сохраняются только локально. Рендер, экспорт, хранилище/медиа-хранилище и публикация пока закрыты.</Text>
          </View>
          ) : null}

          {sourceSettingsSection === "video" ? (
          <React.Fragment>
          <View style={styles.chipRow}>
            {sourceControls.map((source) => {
              const selectedBySourceState = sourceState.selectedSourceId === source.id;
              const explicitlySelectedSourceChip = selectedBySourceState && explicitSourceControlSelectionId === source.id;
              const pendingExplicitSourceSelection = selectedBySourceState && !explicitlySelectedSourceChip && sourceControlSelectionRequired;
              return (
                <Pressable key={source.id} style={[styles.timelineChip, explicitlySelectedSourceChip ? styles.chipActive : null]} onPress={() => selectSourceControlWithExplicitSelectionLocal(source.id)}>
                  <Ionicons name={source.icon} size={12} color={explicitlySelectedSourceChip ? "#0B0910" : "#F2C75B"} />
                  <Text style={[styles.chipText, explicitlySelectedSourceChip ? styles.chipTextActive : null]} numberOfLines={1}>{pendingExplicitSourceSelection ? "Выбери" : source.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.noticeText} numberOfLines={2}>Проверь источник перед будущей передачей в хранилище.</Text>
          <View style={styles.actionGrid}>
            <MiniAction icon="key-outline" label="Разрешение" onPress={requestSelectedSourcePermissionWithExplicitSelectionGuardLocal} disabled={sourceControlActionDisabled} disabledFeedbackLabel={sourceControlActionDisabledLabel} disabledHint={sourceControlActionDisabledHint} />
            <MiniAction icon="videocam-outline" label="Тип файла" onPress={markSelectedSourceAssetIntentWithExplicitSelectionGuardLocal} disabled={sourceControlActionDisabled} disabledFeedbackLabel={sourceControlActionDisabledLabel} disabledHint={sourceControlActionDisabledHint} />
            <MiniAction icon="image-outline" label="Источник обложки" onPress={markSelectedSourceCoverIntentWithExplicitSelectionGuardLocal} disabled={sourceControlActionDisabled} disabledFeedbackLabel={sourceControlActionDisabledLabel} disabledHint={sourceControlActionDisabledHint} />
            <MiniAction icon="text-outline" label="Источник текста" onPress={markSourceCaptionIntentWithExplicitSelectionGuardLocal} disabled={sourceCaptionIntentExplicitSelectionDisabled} disabledFeedbackLabel={sourceCaptionIntentExplicitSelectionDisabledLabel} disabledHint={sourceCaptionIntentExplicitSelectionDisabledHint} />
            <MiniAction icon="shield-checkmark-outline" label="Правила источника" onPress={acknowledgeSelectedSourcePolicyWithExplicitSelectionGuardLocal} disabled={sourceControlActionDisabled} disabledFeedbackLabel={sourceControlActionDisabledLabel} disabledHint={sourceControlActionDisabledHint} />
            <MiniAction icon="analytics-outline" label="Проверка источника" onPress={runSourceReadinessCheckWithExplicitSelectionGuardLocal} disabled={sourceSettingsExplicitSelectionDisabled} disabledFeedbackLabel={sourceSettingsExplicitSelectionDisabledLabel} disabledHint={sourceSettingsExplicitSelectionDisabledHint} />
            <MiniAction icon="git-branch-outline" label="Событие источника" onPress={queueSourceEventWithExplicitSelectionGuardLocal} disabled={sourceSettingsExplicitSelectionDisabled} disabledFeedbackLabel={sourceSettingsExplicitSelectionDisabledLabel} disabledHint={sourceSettingsExplicitSelectionDisabledHint} />
            <MiniAction icon="lock-closed-outline" label="Провайдер источника закрыт" onPress={requestSelectedSourceProviderLockedWithExplicitSelectionGuardLocal} locked disabled={sourceControlActionDisabled} disabledFeedbackLabel={sourceControlActionDisabledLabel} disabledHint={sourceControlActionDisabledHint} />
          </View>
          </React.Fragment>
          ) : null}
        </View>
        ) : null}
        </React.Fragment>
      ) : null}

      {settingsAdvancedOpen && sourceSettingsSection === "edit" ? (
      <View style={styles.timelineHeader}>
        <View style={styles.timelineHeaderText}>
          <Text style={styles.timelineTitle} numberOfLines={1}>Монтаж · {timelineState.evidence.clipCount} клипов · {Math.round(timelineState.evidence.totalDurationMsLocal / 1000)}с</Text>
          <Text style={styles.timelineMeta} numberOfLines={1}>{selectedClip ? `${selectedClip.order}. ${selectedClip.label} · ${formatShortsUiStatusLabel(selectedClip.status)}` : timelineClipsHaveLocalItems ? "Выбери клип в списке" : "Клип не выбран"}</Text>
        </View>
        <Pressable style={styles.toggleButton} onPress={() => toggleSettingsAdvancedBlockOpenLocal(setTimelineOpen, 1120)}>
          <Ionicons name={timelineOpen ? "chevron-down-outline" : "chevron-up-outline"} size={14} color="#F2C75B" />
        </Pressable>
      </View>
      ) : null}

      {settingsAdvancedOpen && sourceSettingsSection === "edit" && !timelineOpen ? (
        <View style={styles.noticeRow}>
          <Ionicons name="chevron-up-outline" size={14} color="#F2C75B" />
          <Text style={styles.noticeText} numberOfLines={2}>Монтаж свернут. Нажми стрелку, чтобы снова открыть обрезку, обложку и проверку клипов.</Text>
        </View>
      ) : null}

      {settingsAdvancedOpen && sourceSettingsSection === "edit" && timelineOpen ? (
        <View style={styles.timelineBox}>
          <View style={styles.chipRow}>
            {timelineClipKinds.map((clip) => (
              <Pressable key={clip.id} style={styles.timelineChip} onPress={() => addTimelineClipWithExplicitSelectionGuardLocal(clip.id)}>
                <Ionicons name={clip.icon} size={12} color="#F2C75B" />
                <Text style={styles.chipText} numberOfLines={1}>{(clip.id === "text_overlay" || clip.id === "caption_track") && timelineCaptionClipExplicitSelectionDisabled ? "Выбери текст" : clip.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.clipList}>
            {timelineState.clips.slice(0, 3).map((clip) => {
              const active = clip.clipId === timelineState.selectedClipId;
              return (
                <Pressable key={clip.clipId} style={[styles.clipRow, active ? styles.clipRowActive : null]} onPress={() => setTimelineState((current) => selectStreamShortVideoTimelineClip(current, clip.clipId))}>
                  <Text style={[styles.clipText, active ? styles.chipTextActive : null]} numberOfLines={1}>{clip.order}. {clip.label}</Text>
                  <Text style={[styles.clipMeta, active ? styles.chipTextActive : null]} numberOfLines={1}>{clip.status}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.actionGrid}>
            <MiniAction icon="cut-outline" label="Обрезка" onPress={trimSelectedTimelineClipWithExplicitSelectionGuardLocal} disabled={timelineClipActionDisabled} disabledFeedbackLabel={timelineClipActionDisabledLabel} disabledHint={timelineClipActionDisabledHint} />
            <MiniAction icon="git-compare-outline" label="Разделить" onPress={splitSelectedTimelineClipWithExplicitSelectionGuardLocal} disabled={timelineClipActionDisabled} disabledFeedbackLabel={timelineClipActionDisabledLabel} disabledHint={timelineClipActionDisabledHint} />
            <MiniAction icon="arrow-up-outline" label="Выше" onPress={() => moveSelectedTimelineClipWithExplicitSelectionGuardLocal("up")} disabled={timelineClipActionDisabled} disabledFeedbackLabel={timelineClipActionDisabledLabel} disabledHint={timelineClipActionDisabledHint} />
            <MiniAction icon="arrow-down-outline" label="Ниже" onPress={() => moveSelectedTimelineClipWithExplicitSelectionGuardLocal("down")} disabled={timelineClipActionDisabled} disabledFeedbackLabel={timelineClipActionDisabledLabel} disabledHint={timelineClipActionDisabledHint} />
            <MiniAction icon="image-outline" label="Кадр обложки" onPress={markSelectedTimelineCoverWithExplicitSelectionGuardLocal} disabled={timelineClipActionDisabled} disabledFeedbackLabel={timelineClipActionDisabledLabel} disabledHint={timelineClipActionDisabledHint} />
            <MiniAction icon="text-outline" label="Текст" onPress={markTimelineCaptionsReadyWithExplicitSelectionGuardLocal} disabled={timelineCaptionClipExplicitSelectionDisabled} disabledFeedbackLabel={timelineCaptionClipExplicitSelectionDisabledLabel} disabledHint={timelineCaptionClipExplicitSelectionDisabledHint} />
            <MiniAction icon="shield-checkmark-outline" label="Правила" onPress={acknowledgeTimelinePolicyWithExplicitClipSelectionGuardLocal} disabled={timelineClipActionDisabled} disabledFeedbackLabel={timelineClipActionDisabledLabel} disabledHint={timelineClipActionDisabledHint} />
            <MiniAction icon="analytics-outline" label="Проверка монтажа" onPress={runTimelineCheckWithExplicitSelectionGuardLocal} disabled={timelineEditorExplicitSelectionDisabled} disabledFeedbackLabel={timelineEditorExplicitSelectionDisabledLabel} disabledHint={timelineEditorExplicitSelectionDisabledHint} />
          </View>
        </View>
      ) : null}

      {settingsAdvancedOpen && sourceSettingsSection === "effects" ? (
      <View style={styles.sourceHeader}>
        <View style={styles.timelineHeaderText}>
          <Text style={styles.timelineTitle} numberOfLines={1}>Effects · {selectedEffectTool?.label ?? "Нет"} · {creationToolsState.evidence.activeEffectsCount} active</Text>
          <Text style={styles.timelineMeta} numberOfLines={1}>{creationToolsState.evidence.activeEffectsCount > 0 ? "эффекты готовы локально" : `${creationToolsState.evidence.localBlockers.length} локальных блокеров`} · нужен провайдер рендера</Text>
        </View>
        <Pressable style={styles.toggleButton} onPress={() => toggleSettingsAdvancedBlockOpenLocal(setEffectsOpen, 1360)}>
          <Ionicons name={effectsOpen ? "chevron-down-outline" : "chevron-up-outline"} size={14} color="#F2C75B" />
        </Pressable>
      </View>
      ) : null}

      {settingsAdvancedOpen && sourceSettingsSection === "effects" && !effectsOpen ? (
        <View style={styles.noticeRow}>
          <Ionicons name="chevron-up-outline" size={14} color="#F2C75B" />
          <Text style={styles.noticeText} numberOfLines={2}>Эффекты свернуты. Нажми стрелку, чтобы снова открыть стек, силу, пресеты и проверку эффектов.</Text>
        </View>
      ) : null}

      {settingsAdvancedOpen && sourceSettingsSection === "effects" && effectsOpen ? (
        <View style={styles.effectsBox}>
          <View style={styles.chipRow}>
            {effectToolControls.map((tool) => {
              const active = explicitEffectToolSelectionId === tool.id;
              const applied = creationToolsState.activeEffects.includes(tool.id);
              const justSelected = effectSelectorFeedbackId === tool.id;
              return (
                <Pressable
                  key={tool.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${tool.label}: ${justSelected ? "выбрано" : applied ? "добавлено" : active ? "выбрано" : "выбрать эффект"}`}
                  accessibilityState={active ? { selected: true } : undefined}
                  hitSlop={6}
                  style={({ pressed }) => [styles.timelineChip, active ? styles.chipActive : applied ? styles.effectAppliedChip : null, justSelected ? styles.effectSelectorChipFeedback : null, pressed ? styles.timelineChipPressed : null]}
                  onPress={() => selectEffectToolWithFeedbackLocal(tool.id)}
                >
                  <Ionicons name={tool.icon} size={12} color={active ? "#0B0910" : "#F2C75B"} />
                  <Text style={[styles.chipText, active ? styles.chipTextActive : null]} numberOfLines={1}>{tool.label}</Text>
                  <Text style={[styles.effectSelectorChipFeedbackText, active ? styles.chipTextActive : null]} numberOfLines={1}>{justSelected ? "готово" : applied ? "✓" : ""}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.noticeText} numberOfLines={2}>{formatShortsEffectPurposeLabel(selectedEffectTool?.id)}</Text>
          <View style={styles.actionGrid}>
            <MiniAction icon="color-filter-outline" label="Применить эффект" onPress={applyEffectTool} disabled={effectToolActionDisabled} disabledFeedbackLabel={effectToolActionDisabledLabel} disabledHint={effectToolActionDisabledHint} />
            <MiniAction icon="close-circle-outline" label="Убрать эффект" onPress={removeEffectTool} disabled={effectLayerActionDisabled} disabledFeedbackLabel={effectLayerActionDisabledLabel} disabledHint={effectLayerActionDisabledHint} />
            <MiniAction icon="analytics-outline" label="Проверить инструменты" onPress={runCreationToolsCheck} disabled={effectToolActionDisabled} disabledFeedbackLabel={effectToolActionDisabledLabel} disabledHint={effectToolActionDisabledHint} />
            <MiniAction icon="git-branch-outline" label="Событие инструментов" onPress={queueCreationToolsEvent} disabled={effectToolActionDisabled} disabledFeedbackLabel={effectToolActionDisabledLabel} disabledHint={effectToolActionDisabledHint} />
            <MiniAction icon="cloud-offline-outline" label="Провайдер рендера закрыт" onPress={requestCreationToolsProviderBlocked} locked disabled={effectToolActionDisabled} disabledFeedbackLabel={effectToolActionDisabledLabel} disabledHint={effectToolActionDisabledHint} />
          </View>

          <View style={styles.effectEditorCard}>
            <View style={styles.effectEditorPreview}>
              <View style={styles.effectPreviewIcon}>
                <Ionicons name="aperture-outline" size={18} color="#0B0910" />
              </View>
              <View style={styles.effectPreviewText}>
                <Text style={styles.effectPreviewTitle} numberOfLines={1}>Стек эффектов · {effectsEditorState.evidence.stackCount} слоёв</Text>
                <Text style={styles.effectPreviewMeta} numberOfLines={1}>{selectedEffectsEditorItem ? `${selectedEffectsEditorItem.label} · ${selectedEffectsEditorItem.intensityPercentLocal}% · ${selectedEffectsEditorItem.parameterPreset}` : effectsStackHasLocalLayers ? "Выбери слой эффекта" : "Нет активного эффекта"} · {effectsEditorState.evidence.previewMode} просмотр</Text>
              </View>
            </View>

            <View style={styles.effectStackList}>
              {effectsEditorState.effectStack.length > 0 ? (
                <>
                  {effectsEditorState.effectStack.map((item) => {
                    const active = item.stackItemId === effectsEditorState.selectedStackItemId;
                    const justSelected = effectStackFeedbackId === item.stackItemId;
                    return (
                      <Pressable
                        key={item.stackItemId}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.order}. ${item.label}: ${justSelected ? "выбрано" : active ? "выбран" : "выбрать слой"}, ${item.intensityPercentLocal}%`}
                        accessibilityState={active ? { selected: true } : undefined}
                        hitSlop={6}
                        style={({ pressed }) => [
                          styles.effectStackRow,
                          active ? styles.effectStackRowActive : null,
                          justSelected ? styles.effectStackRowFeedback : null,
                          pressed ? styles.effectStackRowPressed : null,
                        ]}
                        onPress={() => selectEffectStackLayerWithFeedbackLocal(item.stackItemId)}
                      >
                        <Text style={[styles.effectStackName, active ? styles.effectStackNameActive : null]} numberOfLines={1}>{item.order}. {item.label}</Text>
                        <Text style={[styles.effectStackMeta, active ? styles.effectStackNameActive : null]} numberOfLines={1}>{item.intensityPercentLocal}% · {item.previewEnabledLocal ? "просмотр" : "скрыто"} · {item.reviewPreparedLocal ? "проверка" : "черновик"}</Text>
                        <Text style={[styles.effectStackFeedbackText, active ? styles.effectStackNameActive : null]} numberOfLines={1}>{justSelected ? "выбрано" : ""}</Text>
                      </Pressable>
                    );
                  })}
                  {effectsEditorState.effectStack.length > 5 ? (
                    <Text style={styles.effectStackListHint} numberOfLines={2}>Все {effectsEditorState.effectStack.length} слоёв доступны ручным свайпом внутри настроек.</Text>
                  ) : null}
                </>
              ) : (
                <View style={styles.effectStackEmpty}>
                  <Text style={styles.noticeText}>Примени эффект для локального стека. Рендер откроется после подключения провайдера.</Text>
                </View>
              )}
            </View>

            <View style={styles.actionGrid}>
              <MiniAction icon="sync-outline" label="Синхронизировать стек" onPress={syncEffectsEditor} />
              <MiniAction icon="options-outline" label="Сила" onPress={adjustSelectedEffectIntensityWithLayerGuardLocal} disabled={effectLayerActionDisabled} disabledFeedbackLabel={effectLayerActionDisabledLabel} disabledHint={effectLayerActionDisabledHint} />
              <MiniAction icon="layers-outline" label="Пресет" onPress={cycleSelectedEffectPresetWithLayerGuardLocal} disabled={effectLayerActionDisabled} disabledFeedbackLabel={effectLayerActionDisabledLabel} disabledHint={effectLayerActionDisabledHint} />
              <MiniAction icon="eye-outline" label="Просмотр" onPress={toggleSelectedEffectPreviewWithLayerGuardLocal} disabled={effectLayerActionDisabled} disabledFeedbackLabel={effectLayerActionDisabledLabel} disabledHint={effectLayerActionDisabledHint} />
              <MiniAction icon="scan-outline" label="Режим" onPress={() => setEffectsEditorState(cycleStreamShortVideoEffectPreviewModeLocal)} />
              <MiniAction icon="arrow-up-outline" label="Слой выше" onPress={() => moveSelectedEffectLayerWithLayerGuardLocal("up")} disabled={effectLayerActionDisabled} disabledFeedbackLabel={effectLayerActionDisabledLabel} disabledHint={effectLayerActionDisabledHint} />
              <MiniAction icon="arrow-down-outline" label="Слой ниже" onPress={() => moveSelectedEffectLayerWithLayerGuardLocal("down")} disabled={effectLayerActionDisabled} disabledFeedbackLabel={effectLayerActionDisabledLabel} disabledHint={effectLayerActionDisabledHint} />
              <MiniAction icon="shield-checkmark-outline" label="Проверка" onPress={prepareSelectedEffectReviewWithLayerGuardLocal} disabled={effectLayerActionDisabled} disabledFeedbackLabel={effectLayerActionDisabledLabel} disabledHint={effectLayerActionDisabledHint} />
              <MiniAction icon="git-branch-outline" label="Событие эффекта" onPress={queueEffectsEditorEventWithLayerGuardLocal} disabled={effectLayerActionDisabled} disabledFeedbackLabel={effectLayerActionDisabledLabel} disabledHint={effectLayerActionDisabledHint} />
              <MiniAction icon="cloud-offline-outline" label="Провайдер эффектов закрыт" onPress={requestEffectsEditorProviderLockedWithLayerGuardLocal} locked disabled={effectLayerActionDisabled} disabledFeedbackLabel={effectLayerActionDisabledLabel} disabledHint={effectLayerActionDisabledHint} />
            </View>
          </View>
        </View>
      ) : null}

      {settingsAdvancedOpen && sourceSettingsSection === "audio" ? (
      <View style={styles.sourceHeader}>
        <View style={styles.timelineHeaderText}>
          <Text style={styles.timelineTitle} numberOfLines={1}>Музыка / MP3 · {selectedMusicTrack?.title ?? (musicTracksHaveLocalItems ? "Выбери трек" : "Файл не выбран")} · {formatShortsUiStatusLabel(musicEditorState.status)}</Text>
          <Text style={styles.timelineMeta} numberOfLines={1}>{selectedMusicTrack ? `${selectedMusicTrackTrimDurationSecondsLocal}с обрезка · ${selectedMusicTrack.volumePercentLocal}% громкость · ${selectedMusicTrackOriginalMutedLocal ? "оригинал выключен" : "оригинал включён"}` : musicTracksHaveLocalItems ? "MP3 есть · выбери трек для таймлайна" : "Выбери реальный MP3/аудио файл"} · нужен провайдер рендера</Text>
        </View>
        <Pressable style={styles.toggleButton} onPress={() => toggleSettingsAdvancedBlockOpenLocal(setAudioToolsOpen, 1520)}>
          <Ionicons name={audioToolsOpen ? "chevron-down-outline" : "chevron-up-outline"} size={14} color="#F2C75B" />
        </Pressable>
      </View>
      ) : null}

      {settingsAdvancedOpen && sourceSettingsSection === "audio" && !audioToolsOpen ? (
        <View style={styles.noticeRow}>
          <Ionicons name="chevron-up-outline" size={14} color="#F2C75B" />
          <Text style={styles.noticeText} numberOfLines={2}>MP3/аудио свернуто. Нажми стрелку, чтобы снова открыть выбор файла, обрезку, громкость и микс.</Text>
        </View>
      ) : null}

      {settingsAdvancedOpen && sourceSettingsSection === "audio" && audioToolsOpen ? (
        <View style={styles.audioBox}>
          <View style={styles.musicEditorCard}>
            <View style={styles.musicTrackShell}>
              <View style={styles.musicTrackIcon}>
                <Ionicons name={selectedMusicTrack ? "musical-notes" : "musical-notes-outline"} size={19} color="#0B0910" />
              </View>
              <View style={styles.musicTrackText}>
                <Text style={styles.musicTrackTitle} numberOfLines={1}>{selectedMusicTrack?.title ?? (musicTracksHaveLocalItems ? "Выбери трек в списке" : "MP3/аудио не выбрано")}</Text>
                <Text style={styles.musicTrackMeta} numberOfLines={2}>
                  {selectedMusicTrack
                    ? `локальный URI · ${selectedMusicTrack.mimeType ?? "аудио"} · обрезка ${selectedMusicTrack.trimStartMsLocal / 1000}с-${selectedMusicTrack.trimEndMsLocal / 1000}с · старт ${selectedMusicTrack.placementStartMsLocal / 1000}с`
                    : musicTracksHaveLocalItems
                      ? "MP3 есть локально · выбери конкретный трек, чтобы редактировать его"
                      : "Нажми выбрать MP3, чтобы открыть выбор файла. Ничего не загружается и не имитируется."}
                </Text>
              </View>
            </View>

            {musicTracksHaveLocalItems ? (
              <View style={styles.musicTrackList}>
                {musicEditorState.tracks.map((track) => {
                  const active = track.trackId === explicitMusicTrackSelectionId;
                  const justSelected = musicTrackFeedbackId === track.trackId;
                  return (
                    <Pressable
                      key={track.trackId}
                      accessibilityRole="button"
                      accessibilityLabel={`${track.title}: ${justSelected ? "выбрано" : active ? "выбранный трек" : "выбрать трек"}`}
                      accessibilityState={active ? { selected: true } : undefined}
                      hitSlop={6}
                      style={({ pressed }) => [
                        styles.musicTrackChip,
                        active ? styles.musicTrackChipActive : null,
                        justSelected ? styles.musicTrackChipFeedback : null,
                        pressed ? styles.musicTrackChipPressed : null,
                      ]}
                      onPress={() => selectMusicTrackWithFeedbackLocal(track.trackId)}
                    >
                      <Text style={[styles.musicTrackChipText, active ? styles.musicTrackChipTextActive : null]} numberOfLines={1}>{track.title}</Text>
                      <Text style={[styles.audioTrackChipFeedbackText, active ? styles.audioTrackChipFeedbackTextActive : null, justSelected ? null : styles.audioTrackChipFeedbackTextHidden]} numberOfLines={1}>{justSelected ? "выбрано" : " "}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            <View style={styles.musicMeters}>
              <View style={styles.musicMeterPill}><Text style={styles.musicMeterText}>{selectedMusicTrack ? `Обрезка ${selectedMusicTrackTrimDurationSecondsLocal}с` : musicTracksHaveLocalItems ? "Выбери трек" : "Нет MP3"}</Text></View>
              <View style={styles.musicMeterPill}><Text style={styles.musicMeterText}>Громк. {selectedMusicTrack ? selectedMusicTrack.volumePercentLocal : 0}%</Text></View>
              <View style={styles.musicMeterPill}><Text style={styles.musicMeterText}>Биты {selectedMusicTrack ? selectedMusicTrack.beatMarkersMsLocal.length : 0}</Text></View>
              <View style={styles.musicMeterPill}><Text style={styles.musicMeterText}>{selectedMusicTrack ? (selectedMusicTrackOriginalMutedLocal ? "Оригинал выключен" : "Оригинал включён") : musicTracksHaveLocalItems ? "Выбери трек" : "Оригинал включён"}</Text></View>
            </View>

            <View style={styles.actionGrid}>
              <MiniAction icon="document-attach-outline" label="Выбрать MP3" onPress={() => void pickMp3TrackLocal()} />
              <MiniAction icon="play-back-outline" label="Старт -1с" onPress={() => runSelectedMusicTrackActionLocal(() => setMusicEditorState((current) => shiftSelectedStreamShortVideoMusicTrimLocal(current, "start_back")))} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
              <MiniAction icon="play-forward-outline" label="Старт +1с" onPress={() => runSelectedMusicTrackActionLocal(() => setMusicEditorState((current) => shiftSelectedStreamShortVideoMusicTrimLocal(current, "start_forward")))} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
              <MiniAction icon="remove-outline" label="Конец -1с" onPress={() => runSelectedMusicTrackActionLocal(() => setMusicEditorState((current) => shiftSelectedStreamShortVideoMusicTrimLocal(current, "end_back")))} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
              <MiniAction icon="add-outline" label="Конец +1с" onPress={() => runSelectedMusicTrackActionLocal(() => setMusicEditorState((current) => shiftSelectedStreamShortVideoMusicTrimLocal(current, "end_forward")))} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
              <MiniAction icon="arrow-back-outline" label="Сдвиг -1с" onPress={() => runSelectedMusicTrackActionLocal(() => setMusicEditorState((current) => shiftSelectedStreamShortVideoMusicPlacementLocal(current, "back")))} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
              <MiniAction icon="arrow-forward-outline" label="Сдвиг +1с" onPress={() => runSelectedMusicTrackActionLocal(() => setMusicEditorState((current) => shiftSelectedStreamShortVideoMusicPlacementLocal(current, "forward")))} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
              <MiniAction icon="volume-high-outline" label="Громкость" onPress={() => runSelectedMusicTrackActionLocal(() => setMusicEditorState(cycleSelectedStreamShortVideoMusicVolumeLocal))} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
              <MiniAction icon="volume-mute-outline" label="Без оригинала" onPress={() => runSelectedMusicTrackActionLocal(() => setMusicEditorState(toggleSelectedStreamShortVideoOriginalAudioMuteLocal))} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
              <MiniAction icon="mic-outline" label="Голос" onPress={() => runSelectedMusicTrackActionLocal(() => setMusicEditorState(markSelectedStreamShortVideoVoiceoverIntentLocal))} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
              <MiniAction icon="pulse-outline" label="Бит-маркер" onPress={() => runSelectedMusicTrackActionLocal(() => setMusicEditorState(addSelectedStreamShortVideoBeatMarkerLocal))} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
              <MiniAction icon="shield-checkmark-outline" label="Проверить микс" onPress={reviewMusicMixLocal} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
              <MiniAction icon="trash-outline" label="Убрать трек" onPress={removeSelectedMusicTrackWithExplicitResetLocal} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
              <MiniAction icon="git-branch-outline" label="Событие музыки" onPress={queueMusicEditorEvent} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
              <MiniAction icon="cloud-offline-outline" label="Аудио-провайдер закрыт" onPress={requestMusicEditorProviderBlocked} locked disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
            </View>
          </View>

          <View style={styles.chipRow}>
            {audioToolControls.map((tool) => {
              const active = explicitAudioToolSelectionId === tool.id;
              const ready = creationToolsState.audioTools.find((item) => item.id === tool.id)?.intentReadyLocal ?? false;
              const justSelected = audioToolFeedbackId === tool.id;
              return (
                <Pressable
                  key={tool.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${tool.label}: ${justSelected ? "выбрано" : active ? "выбранный аудио инструмент" : ready ? "готово" : "выбрать аудио инструмент"}`}
                  accessibilityState={active ? { selected: true } : undefined}
                  hitSlop={6}
                  style={({ pressed }) => [
                    styles.timelineChip,
                    active ? styles.chipActive : ready ? styles.effectAppliedChip : null,
                    justSelected ? styles.effectSelectorChipFeedback : null,
                    pressed ? styles.timelineChipPressed : null,
                  ]}
                  onPress={() => selectAudioToolWithFeedbackLocal(tool.id)}
                >
                  <Ionicons name={tool.icon} size={12} color={active ? "#0B0910" : "#F2C75B"} />
                  <Text style={[styles.chipText, active ? styles.chipTextActive : null]} numberOfLines={1}>{tool.label}</Text>
                  <Text style={[styles.effectSelectorChipFeedbackText, active ? styles.chipTextActive : null]} numberOfLines={1}>{justSelected ? "выбрано" : ready ? "✓" : ""}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.noticeText} numberOfLines={2}>{audioToolSelectionRequired ? "Выбери chip аудио вручную. MP3 больше не выбран автоматически." : musicTrackActionDisabled ? `${musicTrackActionDisabledLabel}: сначала выбери MP3/аудио трек, потом обрезай, меняй громкость, голос и бит.` : "MP3 выбран. Можно локально настроить обрезку, оригинал, громкость, голос и бит перед будущим рендером."}</Text>
          <View style={styles.actionGrid}>
            <MiniAction icon="musical-notes-outline" label="MP3" onPress={requestMp3Intent} />
            <MiniAction icon="cut-outline" label="Обрезать музыку" onPress={trimMp3Intent} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
            <MiniAction icon="volume-mute-outline" label="Без оригинала" onPress={toggleOriginalMute} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
            <MiniAction icon="volume-high-outline" label="Громкость" onPress={cycleAudioVolume} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
            <MiniAction icon="mic-outline" label="Голос" onPress={markVoiceoverIntent} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
            <MiniAction icon="pulse-outline" label="Бит" onPress={markBeatSync} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
            <MiniAction icon="git-branch-outline" label="Событие аудио" onPress={queueAudioCreationToolsEventWithTrackGuardLocal} disabled={musicTrackActionDisabled} disabledFeedbackLabel={musicTrackActionDisabledLabel} disabledHint={musicTrackActionDisabledHint} />
            <MiniAction icon="cloud-offline-outline" label="Музыкальный провайдер закрыт" onPress={requestCreationToolsProviderBlocked} locked disabled={audioToolActionDisabled} disabledFeedbackLabel={audioToolActionDisabledLabel} disabledHint={audioToolActionDisabledHint} />
          </View>
        </View>
      ) : null}

      {settingsAdvancedOpen && sourceSettingsSection === "review" ? (
        <React.Fragment>
      <View style={styles.actionGrid}>
        <MiniAction icon="albums-outline" label="Проверить монтаж" onPress={runTimelineCheckWithExplicitSelectionGuardLocal} disabled={timelineEditorExplicitSelectionDisabled} disabledFeedbackLabel={timelineEditorExplicitSelectionDisabledLabel} disabledHint={timelineEditorExplicitSelectionDisabledHint} />
        <MiniAction icon="image-outline" label="Обложка" onPress={markDraftCoverIntentWithExplicitSourceSelectionGuardLocal} disabled={sourceControlActionDisabled} disabledFeedbackLabel={sourceControlActionDisabledLabel} disabledHint={sourceControlActionDisabledHint} />
        <MiniAction icon="text-outline" label="Проверка текста" onPress={markCaptionReviewWithExplicitSelectionGuardLocal} disabled={captionOverlaySelectionRequired} disabledFeedbackLabel={captionOverlayActionDisabledLabel} disabledHint={captionOverlayActionDisabledHint} />
        <MiniAction icon="shield-checkmark-outline" label="Правила" onPress={acknowledgeDraftPolicyWithExplicitSourceSelectionGuardLocal} disabled={sourceControlActionDisabled} disabledFeedbackLabel={sourceControlActionDisabledLabel} disabledHint={sourceControlActionDisabledHint} />
        <MiniAction icon="analytics-outline" label="Проверить" onPress={runDraftReadinessCheckWithExplicitSelectionGuardLocal} disabled={finalReviewExplicitSelectionDisabled} disabledFeedbackLabel={finalReviewExplicitSelectionDisabledLabel} disabledHint={finalReviewExplicitSelectionDisabledHint} />
        <MiniAction icon="git-branch-outline" label="Очередь" onPress={queueTimelineEventWithExplicitSelectionGuardLocal} disabled={timelineEditorExplicitSelectionDisabled} disabledFeedbackLabel={timelineEditorExplicitSelectionDisabledLabel} disabledHint={timelineEditorExplicitSelectionDisabledHint} />
      </View>

      <View style={styles.sourceHeader}>
        <View style={styles.timelineHeaderText}>
          <Text style={styles.timelineTitle} numberOfLines={1}>Проверка · {selectedReview?.title ?? "Нет"} · {reviewState.evidence.selectedStatus}</Text>
          <Text style={styles.timelineMeta} numberOfLines={1}>{reviewState.evidence.reviewReadyLocal ? "проверка готова" : `${reviewState.evidence.localBlockers.length} блокеров проверки`} · нужен провайдер/админ</Text>
        </View>
        <Pressable style={styles.toggleButton} onPress={() => toggleSettingsAdvancedBlockOpenLocal(setReviewOpen, 1640)}>
          <Ionicons name={reviewOpen ? "chevron-down-outline" : "chevron-up-outline"} size={14} color="#F2C75B" />
        </Pressable>
      </View>

      {settingsAdvancedOpen && sourceSettingsSection === "review" && !reviewOpen ? (
        <View style={styles.noticeRow}>
          <Ionicons name="chevron-up-outline" size={14} color="#F2C75B" />
          <Text style={styles.noticeText} numberOfLines={2}>Проверка свернута. Нажми стрелку, чтобы снова открыть обложку, текст, язык, медиа и правила.</Text>
        </View>
      ) : null}

      {settingsAdvancedOpen && reviewOpen ? (
        <View style={styles.sourceBox}>
          <View style={styles.chipRow}>
            {reviewControls.map((item) => {
              const active = explicitReviewItemSelectionId === item.id;
              return (
                <Pressable key={item.id} style={[styles.timelineChip, active ? styles.chipActive : null]} onPress={() => selectReviewItemWithExplicitSelectionLocal(item.id)}>
                  <Ionicons name={item.icon} size={12} color={active ? "#0B0910" : "#F2C75B"} />
                  <Text style={[styles.chipText, active ? styles.chipTextActive : null]} numberOfLines={1}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.noticeText} numberOfLines={2}>Подготовь обложку, текст и проверку перед будущей публикацией.</Text>
          <View style={styles.actionGrid}>
            <MiniAction icon="create-outline" label="Подготовить" onPress={prepareSelectedReviewItemLocal} disabled={selectedReviewExplicitSelectionDisabled} disabledFeedbackLabel={selectedReviewExplicitSelectionDisabledLabel} disabledHint={selectedReviewExplicitSelectionDisabledHint} />
            <MiniAction icon="shield-checkmark-outline" label="Проверить" onPress={reviewSelectedReviewItemLocal} disabled={selectedReviewExplicitSelectionDisabled} disabledFeedbackLabel={selectedReviewExplicitSelectionDisabledLabel} disabledHint={selectedReviewExplicitSelectionDisabledHint} />
            <MiniAction icon="image-outline" label="Обложка проверена" onPress={reviewCoverFrame} disabled={reviewCoverFrameActionDisabled} disabledFeedbackLabel={reviewCoverFrameActionDisabled && !sourceControlActionDisabled ? reviewSelectedItemActionDisabledLabel : sourceControlActionDisabledLabel} disabledHint={reviewCoverFrameActionDisabled && !sourceControlActionDisabled ? reviewSelectedItemActionDisabledHint : sourceControlActionDisabledHint} />
            <MiniAction icon="text-outline" label="Текст проверен" onPress={reviewCaptions} disabled={reviewCaptionTrackActionDisabled} disabledFeedbackLabel={reviewCaptionTrackActionDisabled && !captionOverlaySelectionRequired ? reviewSelectedItemActionDisabledLabel : captionOverlayActionDisabledLabel} disabledHint={reviewCaptionTrackActionDisabled && !captionOverlaySelectionRequired ? reviewSelectedItemActionDisabledHint : captionOverlayActionDisabledHint} />
            <MiniAction icon="language-outline" label="Язык проверен" onPress={reviewCaptionLanguageLocal} disabled={reviewCaptionLanguageActionDisabled} disabledFeedbackLabel={reviewCaptionLanguageActionDisabled && !captionOverlaySelectionRequired ? reviewSelectedItemActionDisabledLabel : captionOverlayActionDisabledLabel} disabledHint={reviewCaptionLanguageActionDisabled && !captionOverlaySelectionRequired ? reviewSelectedItemActionDisabledHint : captionOverlayActionDisabledHint} />
            <MiniAction icon="film-outline" label="Медиа проверено" onPress={reviewUsefulOverlayMediaLocal} disabled={reviewMediaActionDisabled} disabledFeedbackLabel={reviewMediaActionDisabled && !usefulOverlaySelectionRequired ? reviewSelectedItemActionDisabledLabel : usefulOverlayActionDisabledLabel} disabledHint={reviewMediaActionDisabled && !usefulOverlaySelectionRequired ? reviewSelectedItemActionDisabledHint : usefulOverlayActionDisabledHint} />
            <MiniAction icon="document-text-outline" label="Правила проверены" onPress={reviewPolicy} disabled={reviewPolicyActionDisabled} disabledFeedbackLabel={reviewPolicyActionDisabled && !sourceControlActionDisabled ? reviewSelectedItemActionDisabledLabel : sourceControlActionDisabledLabel} disabledHint={reviewPolicyActionDisabled && !sourceControlActionDisabled ? reviewSelectedItemActionDisabledHint : sourceControlActionDisabledHint} />
            <MiniAction icon="lock-closed-outline" label="Передача проверена" onPress={reviewPublishHandoffWithExplicitSelectionGuardLocal} disabled={reviewPublishHandoffActionDisabled} disabledFeedbackLabel={reviewPublishHandoffActionDisabled && !captionOverlaySelectionRequired && !usefulOverlaySelectionRequired ? reviewSelectedItemActionDisabledLabel : finalReviewExplicitSelectionDisabledLabel} disabledHint={reviewPublishHandoffActionDisabled && !captionOverlaySelectionRequired && !usefulOverlaySelectionRequired ? reviewSelectedItemActionDisabledHint : finalReviewExplicitSelectionDisabledHint} />
            <MiniAction icon="analytics-outline" label="Проверка" onPress={runCoverCaptionReviewCheckWithExplicitSelectionGuardLocal} disabled={finalReviewExplicitSelectionDisabled} disabledFeedbackLabel={finalReviewExplicitSelectionDisabledLabel} disabledHint={finalReviewExplicitSelectionDisabledHint} />
            <MiniAction icon="git-branch-outline" label="Событие проверки" onPress={queueCoverCaptionReviewEventWithExplicitSelectionGuardLocal} disabled={finalReviewExplicitSelectionDisabled} disabledFeedbackLabel={finalReviewExplicitSelectionDisabledLabel} disabledHint={finalReviewExplicitSelectionDisabledHint} />
            <MiniAction icon="cloud-offline-outline" label="Провайдер проверки закрыт" onPress={requestReviewProviderBlockedWithExplicitSelectionGuardLocal} locked disabled={selectedReviewExplicitSelectionDisabled} disabledFeedbackLabel={selectedReviewExplicitSelectionDisabledLabel} disabledHint={selectedReviewExplicitSelectionDisabledHint} />
          </View>
        </View>
      ) : null}

      <View style={styles.sourceHeader}>
        <View style={styles.timelineHeaderText}>
          <Text style={styles.timelineTitle} numberOfLines={1}>Публикация · {selectedPublishReadiness?.title ?? "Нет"} · {formatShortsUiStatusLabel(publishReadinessState.status)}</Text>
          <Text style={styles.timelineMeta} numberOfLines={1}>{publishReadinessState.evidence.publishReadyLocal ? "локально готово · нужен провайдер/админ" : `${publishReadinessState.evidence.localBlockers.length} локальных блокеров`} · без фальшивой публикации</Text>
        </View>
        <Pressable style={styles.toggleButton} onPress={() => toggleSettingsAdvancedBlockOpenLocal(setPublishGateOpen, 1760)}>
          <Ionicons name={publishGateOpen ? "chevron-down-outline" : "chevron-up-outline"} size={14} color="#F2C75B" />
        </Pressable>
      </View>

      {settingsAdvancedOpen && sourceSettingsSection === "review" && !publishGateOpen ? (
        <View style={styles.noticeRow}>
          <Ionicons name="chevron-up-outline" size={14} color="#F2C75B" />
          <Text style={styles.noticeText} numberOfLines={2}>Публикация свернута. Нажми стрелку, чтобы снова открыть проверку публикации и handoff-блокеры.</Text>
        </View>
      ) : null}

      {settingsAdvancedOpen && sourceSettingsSection === "review" && publishGateOpen ? (
        <View style={styles.sourceBox}>
          <View style={styles.chipRow}>
            {publishReadinessControls.map((item) => {
              const active = explicitPublishReadinessCheckSelectionId === item.id;
              return (
                <Pressable key={item.id} style={[styles.timelineChip, active ? styles.chipActive : null]} onPress={() => selectPublishReadinessCheckWithExplicitSelectionLocal(item.id)}>
                  <Ionicons name={item.icon} size={12} color={active ? "#0B0910" : "#F2C75B"} />
                  <Text style={[styles.chipText, active ? styles.chipTextActive : null]} numberOfLines={1}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.noticeText} numberOfLines={2}>Проверь готовность перед будущей передачей в хранилище/медиа-хранилище/сервер/админ.</Text>
          <View style={styles.actionGrid}>
            <MiniAction icon="shield-checkmark-outline" label="Проверка" onPress={reviewPublishReadinessCheck} disabled={selectedPublishReadinessExplicitSelectionDisabled} disabledFeedbackLabel={selectedPublishReadinessExplicitSelectionDisabledLabel} disabledHint={selectedPublishReadinessExplicitSelectionDisabledHint} />
            <MiniAction icon="analytics-outline" label="Проверить публикацию" onPress={runPublishReadinessGate} disabled={publishReadinessExplicitSelectionDisabled} disabledFeedbackLabel={publishReadinessExplicitSelectionDisabledLabel} disabledHint={publishReadinessExplicitSelectionDisabledHint} />
            <MiniAction icon="git-branch-outline" label="Событие публикации" onPress={queuePublishReadinessEvent} disabled={publishReadinessExplicitSelectionDisabled} disabledFeedbackLabel={publishReadinessExplicitSelectionDisabledLabel} disabledHint={publishReadinessExplicitSelectionDisabledHint} />
            <MiniAction icon="cloud-offline-outline" label="Провайдер/админ закрыт" onPress={requestPublishProviderBlocked} locked disabled={publishProviderBlockedActionDisabled} disabledFeedbackLabel={publishProviderBlockedActionDisabledLabel} disabledHint={publishProviderBlockedActionDisabledHint} />
          </View>
        </View>
      ) : null}

      <View style={styles.sourceHeader}>
        <View style={styles.timelineHeaderText}>
          <Text style={styles.timelineTitle} numberOfLines={1}>Черновики ленты · {selectedFeedDraft?.title ?? (feedDraftsHaveLocalItems ? "Выбери черновик" : "Нет")} · {formatShortsUiStatusLabel(feedDraftListState.playbackShellStatus)}</Text>
          <Text style={styles.timelineMeta} numberOfLines={1}>{feedDraftListState.evidence.locallyPlayableDrafts} готово локально · {feedDraftListState.evidence.blockedLocalDrafts} закрыто · без фальшивого просмотра</Text>
        </View>
        <Pressable style={styles.toggleButton} onPress={() => toggleSettingsAdvancedBlockOpenLocal(setFeedDraftsOpen, 1860)}>
          <Ionicons name={feedDraftsOpen ? "chevron-down-outline" : "chevron-up-outline"} size={14} color="#F2C75B" />
        </Pressable>
      </View>

      {settingsAdvancedOpen && sourceSettingsSection === "review" && !feedDraftsOpen ? (
        <View style={styles.noticeRow}>
          <Ionicons name="chevron-up-outline" size={14} color="#F2C75B" />
          <Text style={styles.noticeText} numberOfLines={2}>Черновики ленты свернуты. Нажми стрелку, чтобы снова открыть выбор черновика, локальный preview и проверку ленты.</Text>
        </View>
      ) : null}

      {settingsAdvancedOpen && sourceSettingsSection === "review" && feedDraftsOpen ? (
        <View style={styles.feedBox}>
          <View style={styles.feedPreviewShell}>
            <View style={styles.feedPlayIcon}>
              <Ionicons name={feedDraftListState.playbackShellStatus === "active_local" ? "pause-outline" : "play-outline"} size={15} color="#F2C75B" />
            </View>
            <View style={styles.timelineHeaderText}>
              <Text style={styles.timelineTitle} numberOfLines={1}>{selectedFeedDraft?.title ?? "Выбери локальный черновик"}</Text>
              <Text style={styles.timelineMeta} numberOfLines={1}>{selectedFeedDraft ? `${selectedFeedDraft.clipCount} клипов · ${Math.round(selectedFeedDraft.durationMsLocal / 1000)}с · ${formatShortsUiStatusLabel(selectedFeedDraft.status)}` : "Нет локального черновика"}</Text>
            </View>
          </View>
          <View style={styles.actionGrid}>
            <MiniAction icon="sync-outline" label="Синхронизация" onPress={syncFeedDraftList} disabled={feedDraftSyncExplicitSelectionDisabled} disabledFeedbackLabel={feedDraftSyncExplicitSelectionDisabledLabel} disabledHint={feedDraftSyncExplicitSelectionDisabledHint} />
            <MiniAction icon="play-outline" label="Локальный просмотр" onPress={requestFeedDraftPlaybackShellWithExplicitSelectionGuardLocal} disabled={feedDraftListExplicitSelectionDisabled} disabledFeedbackLabel={feedDraftListExplicitSelectionDisabledLabel} disabledHint={feedDraftListExplicitSelectionDisabledHint} />
            <MiniAction icon="pause-outline" label="Пауза просмотра" onPress={pauseFeedDraftPlaybackShellWithExplicitSelectionGuardLocal} disabled={feedDraftListExplicitSelectionDisabled} disabledFeedbackLabel={feedDraftListExplicitSelectionDisabledLabel} disabledHint={feedDraftListExplicitSelectionDisabledHint} />
            <MiniAction icon="stop-outline" label="Стоп просмотра" onPress={stopFeedDraftPlaybackShellWithExplicitSelectionGuardLocal} disabled={feedDraftListExplicitSelectionDisabled} disabledFeedbackLabel={feedDraftListExplicitSelectionDisabledLabel} disabledHint={feedDraftListExplicitSelectionDisabledHint} />
            <MiniAction icon="chevron-back-outline" label="Назад" onPress={selectPreviousFeedDraftKeyboardSafeLocal} />
            <MiniAction icon="chevron-forward-outline" label="Дальше" onPress={selectNextFeedDraftKeyboardSafeLocal} />
            <MiniAction icon="analytics-outline" label="Проверить ленту" onPress={runFeedDraftListCheck} disabled={feedDraftListExplicitSelectionDisabled} disabledFeedbackLabel={feedDraftListExplicitSelectionDisabledLabel} disabledHint={feedDraftListExplicitSelectionDisabledHint} />
            <MiniAction icon="git-branch-outline" label="Событие ленты" onPress={queueFeedDraftListEvent} disabled={feedDraftListExplicitSelectionDisabled} disabledFeedbackLabel={feedDraftListExplicitSelectionDisabledLabel} disabledHint={feedDraftListExplicitSelectionDisabledHint} />
            <MiniAction icon="cloud-offline-outline" label="Провайдер ленты закрыт" onPress={requestFeedProviderBlocked} locked disabled={feedDraftListExplicitSelectionDisabled} disabledFeedbackLabel={feedDraftListExplicitSelectionDisabledLabel} disabledHint={feedDraftListExplicitSelectionDisabledHint} />
          </View>
          <Text style={styles.noticeText} numberOfLines={2}>Черновики и просмотр работают локально. Реальная лента, манифест плеера, медиа-хранилище и админ-проверка понадобятся позже.</Text>
        </View>
      ) : null}

      <View style={styles.sourceHeader}>
        <View style={styles.timelineHeaderText}>
          <Text style={styles.timelineTitle} numberOfLines={1}>Управление плеером · {formatShortsUiStatusLabel(playbackControlsState.status)} · {playbackControlsState.evidence.progressPercentLocal}%</Text>
          <Text style={styles.timelineMeta} numberOfLines={1}>{playbackControlsState.evidence.qualityPreset} · {playbackControlsState.evidence.speed}x · {playbackControlsState.evidence.localBlockers.length} локальных блокеров</Text>
        </View>
        <Pressable style={styles.toggleButton} onPress={() => toggleSettingsAdvancedBlockOpenLocal(setPlaybackControlsOpen, 1960)}>
          <Ionicons name={playbackControlsOpen ? "chevron-down-outline" : "chevron-up-outline"} size={14} color="#F2C75B" />
        </Pressable>
      </View>

      {settingsAdvancedOpen && sourceSettingsSection === "review" && !playbackControlsOpen ? (
        <View style={styles.noticeRow}>
          <Ionicons name="chevron-up-outline" size={14} color="#F2C75B" />
          <Text style={styles.noticeText} numberOfLines={2}>Управление плеером свернуто. Нажми стрелку, чтобы снова открыть play/pause, перемотку, звук, скорость и качество.</Text>
        </View>
      ) : null}

      {settingsAdvancedOpen && sourceSettingsSection === "review" && playbackControlsOpen ? (
        <View style={styles.playbackBox}>
          <View style={styles.feedPreviewShell}>
            <View style={styles.feedPlayIcon}>
              <Ionicons name={playbackControlsState.status === "playing_local" ? "pause-outline" : "play-outline"} size={15} color="#F2C75B" />
            </View>
            <View style={styles.timelineHeaderText}>
              <Text style={styles.timelineTitle} numberOfLines={1}>{playbackControlsState.evidence.selectedTitle}</Text>
              <Text style={styles.timelineMeta} numberOfLines={1}>{Math.round(playbackControlsState.evidence.positionMsLocal / 1000)}с / {Math.round(playbackControlsState.evidence.durationMsLocal / 1000)}с · {playbackControlsState.evidence.mutedLocal ? "без звука" : "аудио"} · {playbackControlsState.evidence.loopLocal ? "повтор" : "один раз"}</Text>
            </View>
          </View>
          <View style={styles.actionGrid}>
            <MiniAction icon="sync-outline" label="Синхронизация плеера" onPress={syncPlaybackControls} disabled={playbackControlsExplicitSelectionDisabled} disabledFeedbackLabel={playbackControlsExplicitSelectionDisabledLabel} disabledHint={playbackControlsExplicitSelectionDisabledHint} />
            <MiniAction icon="play-outline" label="Локально играть" onPress={playShortVideoPlaybackWithExplicitFeedDraftGuardLocal} disabled={playbackControlsExplicitSelectionDisabled} disabledFeedbackLabel={playbackControlsExplicitSelectionDisabledLabel} disabledHint={playbackControlsExplicitSelectionDisabledHint} />
            <MiniAction icon="pause-outline" label="Локальная пауза" onPress={pauseShortVideoPlaybackWithExplicitFeedDraftGuardLocal} disabled={playbackControlsExplicitSelectionDisabled} disabledFeedbackLabel={playbackControlsExplicitSelectionDisabledLabel} disabledHint={playbackControlsExplicitSelectionDisabledHint} />
            <MiniAction icon="stop-outline" label="Остановить локально" onPress={stopShortVideoPlaybackWithExplicitFeedDraftGuardLocal} disabled={playbackControlsExplicitSelectionDisabled} disabledFeedbackLabel={playbackControlsExplicitSelectionDisabledLabel} disabledHint={playbackControlsExplicitSelectionDisabledHint} />
            <MiniAction icon="play-back-outline" label="Назад" onPress={() => seekShortVideoPlaybackWithExplicitFeedDraftGuardLocal("back")} disabled={playbackControlsExplicitSelectionDisabled} disabledFeedbackLabel={playbackControlsExplicitSelectionDisabledLabel} disabledHint={playbackControlsExplicitSelectionDisabledHint} />
            <MiniAction icon="play-forward-outline" label="Вперёд" onPress={() => seekShortVideoPlaybackWithExplicitFeedDraftGuardLocal("forward")} disabled={playbackControlsExplicitSelectionDisabled} disabledFeedbackLabel={playbackControlsExplicitSelectionDisabledLabel} disabledHint={playbackControlsExplicitSelectionDisabledHint} />
            <MiniAction icon="volume-mute-outline" label="Выключить звук" onPress={toggleShortVideoPlaybackMuteWithExplicitFeedDraftGuardLocal} disabled={playbackControlsExplicitSelectionDisabled} disabledFeedbackLabel={playbackControlsExplicitSelectionDisabledLabel} disabledHint={playbackControlsExplicitSelectionDisabledHint} />
            <MiniAction icon="repeat-outline" label="Повтор" onPress={toggleShortVideoPlaybackLoopWithExplicitFeedDraftGuardLocal} disabled={playbackControlsExplicitSelectionDisabled} disabledFeedbackLabel={playbackControlsExplicitSelectionDisabledLabel} disabledHint={playbackControlsExplicitSelectionDisabledHint} />
            <MiniAction icon="speedometer-outline" label="Скорость" onPress={cycleShortVideoPlaybackSpeedWithExplicitFeedDraftGuardLocal} disabled={playbackControlsExplicitSelectionDisabled} disabledFeedbackLabel={playbackControlsExplicitSelectionDisabledLabel} disabledHint={playbackControlsExplicitSelectionDisabledHint} />
            <MiniAction icon="layers-outline" label="Качество" onPress={cycleShortVideoPlaybackQualityWithExplicitFeedDraftGuardLocal} disabled={playbackControlsExplicitSelectionDisabled} disabledFeedbackLabel={playbackControlsExplicitSelectionDisabledLabel} disabledHint={playbackControlsExplicitSelectionDisabledHint} />
            <MiniAction icon="git-branch-outline" label="Событие плеера" onPress={queuePlaybackControlsEvent} disabled={playbackControlsExplicitSelectionDisabled} disabledFeedbackLabel={playbackControlsExplicitSelectionDisabledLabel} disabledHint={playbackControlsExplicitSelectionDisabledHint} />
            <MiniAction icon="cloud-offline-outline" label="Провайдер плеера закрыт" onPress={requestPlaybackProviderBlocked} locked disabled={playbackControlsExplicitSelectionDisabled} disabledFeedbackLabel={playbackControlsExplicitSelectionDisabledLabel} disabledHint={playbackControlsExplicitSelectionDisabledHint} />
          </View>
          <Text style={styles.noticeText} numberOfLines={2}>Управление плеером пока локальное. Реальный манифест, медиа-хранилище, серверная сессия и админ-проверка понадобятся позже.</Text>
        </View>
      ) : null}

      <View style={styles.sourceHeader}>
        <View style={styles.timelineHeaderText}>
          <Text style={styles.timelineTitle} numberOfLines={1}>Действия · {formatShortsUiStatusLabel(engagementState.status)} · {engagementState.evidence.viewProgressPercentLocal}% просмотрено</Text>
          <Text style={styles.timelineMeta} numberOfLines={1}>{engagementState.evidence.likedLocal ? "лайк есть" : "без лайка"} · {engagementState.evidence.savedLocal ? "сохранено" : "не сохранено"} · {engagementState.evidence.localBlockers.length} локальных блокеров</Text>
        </View>
        <Pressable style={styles.toggleButton} onPress={() => toggleSettingsAdvancedBlockOpenLocal(setEngagementOpen, 2060)}>
          <Ionicons name={engagementOpen ? "chevron-down-outline" : "chevron-up-outline"} size={14} color="#F2C75B" />
        </Pressable>
      </View>

      {settingsAdvancedOpen && sourceSettingsSection === "review" && !engagementOpen ? (
        <View style={styles.noticeRow}>
          <Ionicons name="chevron-up-outline" size={14} color="#F2C75B" />
          <Text style={styles.noticeText} numberOfLines={2}>Действия свернуты. Нажми стрелку, чтобы снова открыть просмотр, лайк, сохранение, черновик отправки и черновик жалобы.</Text>
        </View>
      ) : null}

      {settingsAdvancedOpen && sourceSettingsSection === "review" && engagementOpen ? (
        <View style={styles.playbackBox}>
          <View style={styles.feedPreviewShell}>
            <View style={styles.feedPlayIcon}>
              <Ionicons name={engagementState.evidence.likedLocal ? "heart" : "heart-outline"} size={15} color="#F2C75B" />
            </View>
            <View style={styles.timelineHeaderText}>
              <Text style={styles.timelineTitle} numberOfLines={1}>{engagementState.evidence.selectedTitle}</Text>
              <Text style={styles.timelineMeta} numberOfLines={1}>черновик отправки: {engagementState.evidence.shareDraftPrepared ? "готово" : "не готово"} · черновик жалобы: {engagementState.evidence.reportDraftPrepared ? "подготовлено" : "нет"}</Text>
            </View>
          </View>
          <View style={styles.actionGrid}>
            <MiniAction icon="sync-outline" label="Синхронизация действий" onPress={syncEngagementState} disabled={engagementExplicitSelectionDisabled} disabledFeedbackLabel={engagementExplicitSelectionDisabledLabel} disabledHint={engagementExplicitSelectionDisabledHint} />
            <MiniAction icon="eye-outline" label="Прогресс просмотра" onPress={markEngagementViewProgressWithExplicitFeedDraftGuardLocal} disabled={engagementExplicitSelectionDisabled} disabledFeedbackLabel={engagementExplicitSelectionDisabledLabel} disabledHint={engagementExplicitSelectionDisabledHint} />
            <MiniAction icon="heart-outline" label="Локальный лайк" onPress={toggleEngagementLikeWithExplicitFeedDraftGuardLocal} disabled={engagementExplicitSelectionDisabled} disabledFeedbackLabel={engagementExplicitSelectionDisabledLabel} disabledHint={engagementExplicitSelectionDisabledHint} />
            <MiniAction icon="bookmark-outline" label="Локальное сохранение" onPress={toggleEngagementSaveWithExplicitFeedDraftGuardLocal} disabled={engagementExplicitSelectionDisabled} disabledFeedbackLabel={engagementExplicitSelectionDisabledLabel} disabledHint={engagementExplicitSelectionDisabledHint} />
            <MiniAction icon="share-social-outline" label="Поделиться черновиком" onPress={prepareEngagementShareDraftWithExplicitFeedDraftGuardLocal} disabled={engagementExplicitSelectionDisabled} disabledFeedbackLabel={engagementExplicitSelectionDisabledLabel} disabledHint={engagementExplicitSelectionDisabledHint} />
            <MiniAction icon="flag-outline" label="Жалоба на черновик" onPress={prepareEngagementReportDraftWithExplicitFeedDraftGuardLocal} disabled={engagementExplicitSelectionDisabled} disabledFeedbackLabel={engagementExplicitSelectionDisabledLabel} disabledHint={engagementExplicitSelectionDisabledHint} />
            <MiniAction icon="git-branch-outline" label="Событие действий" onPress={queueEngagementEvent} disabled={engagementExplicitSelectionDisabled} disabledFeedbackLabel={engagementExplicitSelectionDisabledLabel} disabledHint={engagementExplicitSelectionDisabledHint} />
            <MiniAction icon="cloud-offline-outline" label="Провайдер действий закрыт" onPress={requestEngagementProviderBlocked} locked disabled={engagementExplicitSelectionDisabled} disabledFeedbackLabel={engagementExplicitSelectionDisabledLabel} disabledHint={engagementExplicitSelectionDisabledHint} />
          </View>
          <Text style={styles.noticeText} numberOfLines={2}>Действия пока локальные. Реальные просмотры, лайки, сохранения, отправка, жалобы, аналитика и админ-проверка требуют сервер и режим реального времени.</Text>
        </View>
      ) : null}


      <View style={styles.sourceHeader}>
        <View style={styles.timelineHeaderText}>
          <Text style={styles.timelineTitle} numberOfLines={1}>Приёмка шорта · {formatShortsUiStatusLabel(feedAcceptanceState.status)} · {feedAcceptanceState.evidence.readyLocalChecks}/{feedAcceptanceState.checks.length}</Text>
          <Text style={styles.timelineMeta} numberOfLines={1}>{feedAcceptanceState.evidence.shortsFeedAcceptanceReadyLocal ? "локально готово" : "нужна локальная проверка"} · {feedAcceptanceState.evidence.localBlockers.length} локальных блокеров</Text>
        </View>
        <Pressable style={styles.toggleButton} onPress={() => toggleSettingsAdvancedBlockOpenLocal(setFeedAcceptanceOpen, 2160)}>
          <Ionicons name={feedAcceptanceOpen ? "chevron-down-outline" : "chevron-up-outline"} size={14} color="#F2C75B" />
        </Pressable>
      </View>

      {settingsAdvancedOpen && sourceSettingsSection === "review" && !feedAcceptanceOpen ? (
        <View style={styles.noticeRow}>
          <Ionicons name="chevron-up-outline" size={14} color="#F2C75B" />
          <Text style={styles.noticeText} numberOfLines={2}>Приёмка шорта свернута. Нажми стрелку, чтобы снова открыть локальные проверки приёмки.</Text>
        </View>
      ) : null}

      {settingsAdvancedOpen && sourceSettingsSection === "review" && feedAcceptanceOpen ? (
        <View style={styles.acceptanceBox}>
          <View style={styles.feedPreviewShell}>
            <View style={styles.feedPlayIcon}>
              <Ionicons name={feedAcceptanceState.evidence.shortsFeedAcceptanceReadyLocal ? "checkmark-circle-outline" : "shield-checkmark-outline"} size={15} color="#F2C75B" />
            </View>
            <View style={styles.timelineHeaderText}>
              <Text style={styles.timelineTitle} numberOfLines={1}>{selectedFeedAcceptanceCheck?.title ?? "Выбери проверку приёмки"}</Text>
              <Text style={styles.timelineMeta} numberOfLines={1}>проверено {feedAcceptanceState.evidence.reviewedLocalChecks} · провайдер закрыт {feedAcceptanceState.evidence.providerBlockedChecks} · события {feedAcceptanceState.evidence.queuedAcceptanceEvents}</Text>
            </View>
          </View>
          <View style={styles.actionGrid}>
            <MiniAction icon="swap-horizontal-outline" label="Выбрать проверку" onPress={selectFeedAcceptanceCheckWithExplicitSelectionLocal} />
            <MiniAction icon="shield-checkmark-outline" label="Проверка" onPress={reviewFeedAcceptanceCheck} disabled={feedAcceptanceExplicitSelectionDisabled} disabledFeedbackLabel={feedAcceptanceExplicitSelectionDisabledLabel} disabledHint={feedAcceptanceExplicitSelectionDisabledHint} />
            <MiniAction icon="analytics-outline" label="Проверить приёмку" onPress={runFeedAcceptanceGate} disabled={feedAcceptanceExplicitSelectionDisabled} disabledFeedbackLabel={feedAcceptanceExplicitSelectionDisabledLabel} disabledHint={feedAcceptanceExplicitSelectionDisabledHint} />
            <MiniAction icon="git-branch-outline" label="Событие приёмки" onPress={queueFeedAcceptanceEvent} disabled={feedAcceptanceExplicitSelectionDisabled} disabledFeedbackLabel={feedAcceptanceExplicitSelectionDisabledLabel} disabledHint={feedAcceptanceExplicitSelectionDisabledHint} />
            <MiniAction icon="cloud-offline-outline" label="Провайдер/админ закрыт" onPress={requestFeedAcceptanceProviderBlocked} locked disabled={feedAcceptanceProviderBlockedActionDisabled} disabledFeedbackLabel={feedAcceptanceProviderBlockedActionDisabledLabel} disabledHint={feedAcceptanceProviderBlockedActionDisabledHint} />
          </View>
          <Text style={styles.noticeText} numberOfLines={2}>Приёмка ленты пока локальная. Реальная лента, плеер, действия, хранилище/медиа-хранилище и админ-проверка понадобятся позже. Без фальшивой публикации.</Text>
        </View>
      ) : null}

      <View style={styles.sourceHeader}>
        <View style={styles.timelineHeaderText}>
          <Text style={styles.timelineTitle} numberOfLines={1}>Финальная проверка шорта · {formatShortsUiStatusLabel(finalSmokeState.status)} · {finalSmokeState.evidence.readyLocalChecks}/{finalSmokeState.checks.length}</Text>
          <Text style={styles.timelineMeta} numberOfLines={1}>{finalSmokeState.evidence.shortsFinalSmokeReadyLocal ? "профиль готов к передаче" : "нужны финальные локальные проверки"} · следующее: {formatShortsUiStatusLabel(finalSmokeState.evidence.nextPhase)}</Text>
        </View>
        <Pressable style={styles.toggleButton} onPress={() => toggleSettingsAdvancedBlockOpenLocal(setFinalSmokeOpen, 2260)}>
          <Ionicons name={finalSmokeOpen ? "chevron-down-outline" : "chevron-up-outline"} size={14} color="#F2C75B" />
        </Pressable>
      </View>

      {settingsAdvancedOpen && sourceSettingsSection === "review" && !finalSmokeOpen ? (
        <View style={styles.noticeRow}>
          <Ionicons name="chevron-up-outline" size={14} color="#F2C75B" />
          <Text style={styles.noticeText} numberOfLines={2}>Финальная проверка свернута. Нажми стрелку, чтобы снова открыть финальную проверку, передачу профиля и блокеры.</Text>
        </View>
      ) : null}

      {settingsAdvancedOpen && sourceSettingsSection === "review" && finalSmokeOpen ? (
        <View style={styles.acceptanceBox}>
          <View style={styles.feedPreviewShell}>
            <View style={styles.feedPlayIcon}>
              <Ionicons name={finalSmokeState.evidence.shortsFinalSmokeReadyLocal ? "checkmark-circle-outline" : "clipboard-outline"} size={15} color="#F2C75B" />
            </View>
            <View style={styles.timelineHeaderText}>
              <Text style={styles.timelineTitle} numberOfLines={1}>{selectedFinalSmokeCheck?.title ?? "Выбери финальную проверку"}</Text>
              <Text style={styles.timelineMeta} numberOfLines={1}>проверено {finalSmokeState.evidence.reviewedLocalChecks} · провайдер закрыт {finalSmokeState.evidence.providerBlockedChecks} · события {finalSmokeState.evidence.queuedSmokeEvents}</Text>
            </View>
          </View>
          <View style={styles.actionGrid}>
            <MiniAction icon="swap-horizontal-outline" label="Выбрать проверку" onPress={selectFinalSmokeCheckWithExplicitSelectionLocal} />
            <MiniAction icon="shield-checkmark-outline" label="Проверить" onPress={reviewFinalSmokeCheck} disabled={finalSmokeExplicitSelectionDisabled} disabledFeedbackLabel={finalSmokeExplicitSelectionDisabledLabel} disabledHint={finalSmokeExplicitSelectionDisabledHint} />
            <MiniAction icon="person-circle-outline" label="Передача профиля" onPress={reviewProfileSetupHandoff} disabled={finalSmokeProfileHandoffActionDisabled} disabledFeedbackLabel={finalSmokeProfileHandoffActionDisabledLabel} disabledHint={finalSmokeProfileHandoffActionDisabledHint} />
            <MiniAction icon="analytics-outline" label="Финальная проверка" onPress={runFinalSmokeChecklist} disabled={finalSmokeExplicitSelectionDisabled} disabledFeedbackLabel={finalSmokeExplicitSelectionDisabledLabel} disabledHint={finalSmokeExplicitSelectionDisabledHint} />
            <MiniAction icon="git-branch-outline" label="Событие проверки" onPress={queueFinalSmokeEvent} disabled={finalSmokeExplicitSelectionDisabled} disabledFeedbackLabel={finalSmokeExplicitSelectionDisabledLabel} disabledHint={finalSmokeExplicitSelectionDisabledHint} />
            <MiniAction icon="cloud-offline-outline" label="Провайдер/админ закрыт" onPress={requestFinalSmokeProviderBlocked} locked disabled={finalSmokeProviderBlockedActionDisabled} disabledFeedbackLabel={finalSmokeProviderBlockedActionDisabledLabel} disabledHint={finalSmokeProviderBlockedActionDisabledHint} />
          </View>
          <Text style={styles.noticeText} numberOfLines={2}>Финальная проверка пока локальная. Реальная публикация, лента, плеер, аналитика, хранилище/медиа-хранилище и админ-проверка понадобятся позже. Следующий этап — профиль стримера.</Text>
        </View>
      ) : null}

      {settingsAdvancedOpen && sourceSettingsSection === "review" ? (
      <React.Fragment>
      <View style={styles.noticeRow}>
        <Ionicons name="cloud-offline-outline" size={14} color="#8D8796" />
        <Text style={styles.noticeText} numberOfLines={2}>Монтаж, источник, обложка и текст пока локальные. Хранилище, медиа-хранилище, серверная публикация и админ-проверка понадобятся позже. Без фальшивой публикации.</Text>
      </View>

      <View style={styles.actionGrid}>
        <MiniAction icon="lock-closed-outline" label="Провайдер монтажа закрыт" onPress={requestTimelineProviderLockedWithClipGuardLocal} locked disabled={timelineClipActionDisabled} disabledFeedbackLabel={timelineClipActionDisabledLabel} disabledHint={timelineClipActionDisabledHint} />
        <MiniAction icon="lock-closed-outline" label="Передача в хранилище закрыта" onPress={requestStorageHandoffBlockedWithExplicitSelectionGuardLocal} locked disabled={finalReviewExplicitSelectionDisabled} disabledFeedbackLabel={finalReviewExplicitSelectionDisabledLabel} disabledHint={finalReviewExplicitSelectionDisabledHint} />
      </View>
      </React.Fragment>
      ) : null}

        </React.Fragment>
      ) : null}

      </ScrollView>

            <SabiShortsInAppCameraModal
        visible={shortsCameraOpen}
        onClose={closeSabiShortsCameraLocal}
        onRecorded={handleSabiShortsCameraRecordedLocal}
      />

      <ShortsVideoSourceSheet
        visible={videoSourceSheetOpen}
        selectedTitle={sourceFlowState.evidence.selectedAssetTitle}
        selectedKind={sourceFlowState.evidence.selectedSourceKind}
        durationMs={sourceFlowState.evidence.selectedAssetDurationMsLocal}
        sizeBytes={sourceFlowState.evidence.selectedAssetSizeBytes}
        sourceReady={sourceControlSelectedExplicitlyLocal && sourceFlowState.evidence.sourceClipReadyLocal}
        sourceSelectionRequired={sourceControlSelectionRequired}
        onClose={closeVideoSourceSheetLocal}
        onRecord={recordShortVideoFromSourceSheetLocal}
        onGallery={() => void pickShortVideoFromGallerySheetLocal()}
        onFile={() => void pickShortVideoFileFromSourceSheetLocal()}
        onProviderLocked={requestSourceFlowProviderLockedWithExplicitSelectionGuardLocal}
        providerLockedDisabled={sourceFlowExplicitSelectionDisabled}
        providerLockedDisabledLabel={sourceFlowExplicitSelectionDisabledLabel}
        providerLockedDisabledHint={sourceFlowExplicitSelectionDisabledHint}
      />

<ShortsCommentsModal
        visible={socialCommentsState.evidence.commentsOpenLocal}
        comments={socialCommentsState.comments}
        selectedCommentId={socialCommentsState.selectedCommentId}
        draft={commentDraft}
        onDraftChange={setCommentDraft}
        onSend={sendCommentLocal}
        onClose={closeCommentsSheet}
        onLikeComment={(id) => runSelectedCommentMutationLocal(id, (current) => toggleStreamShortVideoCommentLikeLocal(current, id))}
        onPinComment={(id) => runSelectedCommentMutationLocal(id, (current) => pinStreamShortVideoCommentLocal(current, id))}
        onReplyComment={(id) => runSelectedCommentMutationLocal(id, (current) => markStreamShortVideoCommentReplyDraftLocal(current, id))}
        onClearReplyDraft={clearSelectedCommentReplyDraftLocal}
        onReportComment={(id) => runSelectedCommentMutationLocal(id, (current) => reportStreamShortVideoCommentLocal(current, id))}
        onHideComment={(id) => runSelectedCommentMutationLocal(id, (current) => hideStreamShortVideoCommentLocal(current, id))}
        onSelectComment={selectCommentWithExplicitDraftGuardLocal}
      />

      <ShortsShareSaveSheet
        visible={shareSaveBehaviorState.evidence.shareOptionsOpenLocal || shareSaveBehaviorState.evidence.saveOptionsOpenLocal}
        mode={shareSaveBehaviorState.evidence.activeSheetMode || "share"}
        title={state.draft.title || "Шорт"}
        evidence={shareSaveBehaviorState.evidence}
        savedLocal={socialCommentsState.evidence.savedLocal}
        onClose={closeShareSaveSheetLocal}
        onNativeShare={triggerNativeShortsShareLocal}
        onCopyShareText={copyShortsShareTextLocal}
        onSaveToCollection={saveShortsToCollectionLocal}
        onRemoveSave={removeShortsSavedLocal}
        onProviderLocked={requestShareSaveProviderBlockedLocal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    left: 8,
    right: 8,
    top: 50,
    bottom: 22,
    zIndex: 34,
    borderRadius: 36,
    backgroundColor: "rgba(14, 12, 20, 0.995)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.26)",
    padding: 14,
    gap: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.42,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },
  panelKeyboardOpen: {
    borderColor: "rgba(64,214,177,0.42)",
  },
  panelCompactPhone: {
    top: 42,
    bottom: 14,
    borderRadius: 30,
    padding: 12,
    gap: 8,
  },
  settingsScroll: { flex: 1 },
  settingsScrollContent: { gap: 12, paddingBottom: 34 },
  settingsScrollContentAdvancedOpen: { paddingBottom: 280 },
  settingsScrollContentKeyboardOpen: { paddingBottom: 188 },
  settingsHeroCard: { minHeight: 104, borderRadius: 30, padding: 13, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(242,199,91,0.13)", borderWidth: 1, borderColor: "rgba(242,199,91,0.30)" },
  settingsHeroCardKeyboardOpen: { display: "none" },
  settingsHeroIcon: { width: 52, height: 52, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  settingsHeroText: { flex: 1, minWidth: 0 },
  settingsHeroEyebrow: { color: "#F2C75B", fontSize: 9, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.6 },
  settingsHeroTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", marginTop: 3 },
  settingsHeroHint: { color: "rgba(255,255,255,0.70)", fontSize: 10, fontWeight: "800", lineHeight: 14, marginTop: 4 },
  settingsHeroStatus: { minHeight: 30, borderRadius: 15, paddingHorizontal: 10, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(11,9,16,0.34)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  settingsHeroStatusText: { color: "#F2C75B", fontSize: 9, fontWeight: "900" },
  premiumDock: {
    position: "absolute",
    left: 18,
    right: 96,
    bottom: 154,
    zIndex: 9,
    borderRadius: 26,
    backgroundColor: "rgba(9, 8, 14, 0.82)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.22)",
    padding: 10,
    gap: 9,
    overflow: "hidden",
  },
  premiumDockTop: { flexDirection: "row", alignItems: "center", gap: 9 },
  premiumAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  premiumDockText: { flex: 1 },
  premiumTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  premiumMeta: { color: "rgba(255,255,255,0.58)", fontSize: 9, fontWeight: "800", marginTop: 2 },
  premiumOpenButton: { minHeight: 32, borderRadius: 16, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: "rgba(242,199,91,0.96)" },
  premiumOpenText: { color: "#0B0910", fontSize: 10, fontWeight: "900" },
  settingsInsideNotice: { minHeight: 42, borderRadius: 21, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(242,199,91,0.12)" },
  settingsInsideNoticeText: { flex: 1, color: "rgba(255,255,255,0.72)", fontSize: 9, fontWeight: "800", lineHeight: 12 },
  settingsCommandCenter: { borderRadius: 28, padding: 12, gap: 12, backgroundColor: "rgba(255,255,255,0.065)", borderWidth: 1, borderColor: "rgba(242,199,91,0.16)" },
  settingsCommandCenterCompact: { borderRadius: 24, padding: 10, gap: 10 },
  settingsCommandCenterVeryCompact: { padding: 8, gap: 8 },
  settingsCommandHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  settingsFinalQaRail: { marginHorizontal: -2 },
  settingsFinalQaRailContent: { paddingHorizontal: 2, gap: 7 },
  settingsFinalQaRailContentCompact: { gap: 6, paddingRight: 8 },
  settingsFinalQaPill: { minWidth: 114, minHeight: 42, borderRadius: 17, paddingHorizontal: 10, paddingVertical: 7, flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "rgba(255,255,255,0.065)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  settingsFinalQaPillCompact: { minWidth: 104, minHeight: 38, borderRadius: 16, paddingHorizontal: 8, paddingVertical: 6, gap: 6 },
  settingsFinalQaPillVeryCompact: { minWidth: 92, minHeight: 34, paddingHorizontal: 7, paddingVertical: 5 },
  settingsFinalQaPillReady: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  settingsFinalQaPillLocked: { backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(141,135,150,0.18)" },
  settingsFinalQaPillText: { flex: 1, minWidth: 0 },
  settingsFinalQaPillTitle: { color: "#FFFFFF", fontSize: 10, lineHeight: 12, fontWeight: "900" },
  settingsFinalQaPillTitleReady: { color: "#0B0910" },
  settingsFinalQaPillTitleLocked: { color: "#8D8796" },
  settingsFinalQaPillMeta: { color: "#F2C75B", fontSize: 8, lineHeight: 10, fontWeight: "900", marginTop: 1 },
  settingsFinalQaPillMetaReady: { color: "rgba(11,9,16,0.70)" },
  settingsFinalQaPillMetaLocked: { color: "#8D8796" },
  settingsCommandTitleWrap: { flex: 1 },
  settingsCommandTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  settingsCommandMeta: { color: "rgba(255,255,255,0.58)", fontSize: 9, fontWeight: "800", marginTop: 3 },
  settingsCommandBadge: { minHeight: 24, borderRadius: 12, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(242,199,91,0.10)", borderWidth: 1, borderColor: "rgba(242,199,91,0.22)" },
  settingsCommandBadgeText: { color: "#F2C75B", fontSize: 9, fontWeight: "900" },
  settingsFinalCloseCard: { minHeight: 54, borderRadius: 22, paddingHorizontal: 10, paddingVertical: 9, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "rgba(242,199,91,0.10)", borderWidth: 1, borderColor: "rgba(242,199,91,0.22)" },
  settingsFinalCloseCardCompact: { minHeight: 48, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 8, gap: 8 },
  settingsFinalCloseCardVeryCompact: { minHeight: 40, borderRadius: 18, paddingHorizontal: 8, paddingVertical: 6, gap: 7 },
  settingsFinalCloseIcon: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  settingsFinalCloseText: { flex: 1, minWidth: 0 },
  settingsFinalCloseTitle: { color: "#FFFFFF", fontSize: 10, lineHeight: 13, fontWeight: "900" },
  settingsFinalCloseMeta: { color: "rgba(255,255,255,0.64)", fontSize: 8, lineHeight: 11, fontWeight: "800", marginTop: 2 },
  settingsFinalCloseScore: { color: "#F2C75B", fontSize: 10, fontWeight: "900" },
  settingsHubGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  settingsTabsScroll: { marginHorizontal: -2 },
  settingsTabsContent: { gap: 8, paddingHorizontal: 2, paddingRight: 8 },
  settingsHubButton: { width: 112, minHeight: 64, borderRadius: 24, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  settingsHubButtonActive: { backgroundColor: "rgba(242,199,91,0.92)", borderColor: "rgba(242,199,91,0.96)" },
  settingsHubButtonPressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  settingsHubIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(242,199,91,0.10)" },
  settingsHubIconActive: { backgroundColor: "rgba(11,9,16,0.10)" },
  settingsHubText: { flex: 1, minWidth: 0 },
  settingsHubLabel: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  settingsHubLabelActive: { color: "#0B0910" },
  settingsHubMeta: { color: "rgba(255,255,255,0.56)", fontSize: 8, fontWeight: "800", marginTop: 2 },
  settingsHubMetaActive: { color: "rgba(11,9,16,0.62)" },
  settingsPremiumFocusCard: { borderRadius: 30, padding: 13, gap: 12, backgroundColor: "rgba(242,199,91,0.12)", borderWidth: 1, borderColor: "rgba(242,199,91,0.28)", shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 4 },
  settingsPremiumFocusHeader: { flexDirection: "row", alignItems: "center", gap: 9 },
  settingsPremiumFocusIcon: { width: 46, height: 46, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  settingsPremiumFocusText: { flex: 1, minWidth: 0 },
  settingsPremiumFocusEyebrow: { color: "#F2C75B", fontSize: 8, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
  settingsPremiumFocusTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "900", marginTop: 2 },
  settingsPremiumFocusDescription: { color: "rgba(255,255,255,0.70)", fontSize: 10, fontWeight: "800", lineHeight: 14, marginTop: 3 },
  settingsPremiumFocusStatus: { minHeight: 25, borderRadius: 13, paddingHorizontal: 8, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(11,9,16,0.36)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  settingsPremiumFocusStatusText: { color: "#F2C75B", fontSize: 8, fontWeight: "900" },
  settingsPremiumActionRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  settingsPremiumAction: { position: "relative", flexGrow: 1, minWidth: "30%", minHeight: 44, borderRadius: 20, paddingHorizontal: 10, paddingTop: 7, paddingBottom: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.075)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  settingsPremiumActionPrimary: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  settingsPremiumActionLocked: { backgroundColor: "rgba(255,255,255,0.035)", borderColor: "rgba(255,255,255,0.06)" },
  settingsPremiumActionPressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  settingsPremiumActionText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900", textAlign: "center", lineHeight: 12 },
  settingsPremiumActionTextPrimary: { color: "#0B0910" },
  settingsPremiumActionTextLocked: { color: "#8D8796" },
  settingsPremiumActionFeedbackText: { position: "absolute", left: 10, right: 10, bottom: 3, color: "#F2C75B", fontSize: 8, lineHeight: 9, fontWeight: "900", textAlign: "center", textTransform: "uppercase" },
  settingsPremiumActionFeedbackTextHidden: { opacity: 0 },
  settingsPremiumActionFeedbackTextPrimary: { color: "rgba(11,9,16,0.72)" },
  settingsPremiumActionFeedbackTextLocked: { color: "#8D8796" },
  reviewPremiumBoard: { borderRadius: 30, padding: 13, gap: 12, backgroundColor: "rgba(255,255,255,0.065)", borderWidth: 1, borderColor: "rgba(242,199,91,0.18)" },
  reviewPremiumHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  reviewPremiumHeaderIcon: { width: 46, height: 46, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  reviewPremiumHeaderText: { flex: 1, minWidth: 0 },
  reviewPremiumEyebrow: { color: "#F2C75B", fontSize: 9, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.7 },
  reviewPremiumTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "900", marginTop: 2 },
  reviewPremiumMeta: { color: "rgba(255,255,255,0.70)", fontSize: 10, fontWeight: "800", lineHeight: 14, marginTop: 3 },
  reviewPremiumStatusPill: { minHeight: 28, borderRadius: 14, paddingHorizontal: 10, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  reviewPremiumStatusPillReady: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  reviewPremiumStatusText: { color: "#F2C75B", fontSize: 9, fontWeight: "900" },
  reviewPremiumStatusTextReady: { color: "#0B0910" },
  reviewPremiumStepGrid: { gap: 8 },
  reviewPremiumStepCard: { minHeight: 62, borderRadius: 22, paddingHorizontal: 10, paddingVertical: 9, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  reviewPremiumStepCardReady: { backgroundColor: "rgba(242,199,91,0.92)", borderColor: "#F2C75B" },
  reviewPremiumStepCardLocked: { backgroundColor: "rgba(255,255,255,0.035)", borderColor: "rgba(255,255,255,0.06)" },
  reviewPremiumStepCardPressed: { opacity: 0.76, transform: [{ scale: 0.992 }] },
  reviewPremiumStepIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(242,199,91,0.12)" },
  reviewPremiumStepIconReady: { backgroundColor: "rgba(11,9,16,0.12)" },
  reviewPremiumStepIconLocked: { backgroundColor: "rgba(255,255,255,0.06)" },
  reviewPremiumStepText: { flex: 1, minWidth: 0 },
  reviewPremiumStepTitle: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  reviewPremiumStepTitleReady: { color: "#0B0910" },
  reviewPremiumStepTitleLocked: { color: "#B8B1C6" },
  reviewPremiumStepMeta: { color: "rgba(255,255,255,0.62)", fontSize: 9, fontWeight: "800", lineHeight: 12, marginTop: 2 },
  reviewPremiumStepMetaReady: { color: "rgba(11,9,16,0.68)" },
  reviewPremiumStepAction: { minHeight: 27, minWidth: 64, borderRadius: 14, paddingHorizontal: 8, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(242,199,91,0.10)", borderWidth: 1, borderColor: "rgba(242,199,91,0.20)" },
  reviewPremiumStepActionLockedFeedback: { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.10)" },
  reviewPremiumStepActionReady: { backgroundColor: "rgba(11,9,16,0.12)", borderColor: "rgba(11,9,16,0.18)" },
  reviewPremiumStepActionText: { color: "#F2C75B", fontSize: 9, fontWeight: "900" },
  reviewPremiumStepActionTextReady: { color: "#0B0910" },
  reviewPremiumStepActionTextLockedFeedback: { color: "#8D8796" },
  reviewPremiumActionRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  settingsPremiumFullWidth: { width: "100%", gap: 10 },
  effectsPremiumPreviewCard: { minHeight: 78, borderRadius: 26, paddingHorizontal: 12, paddingVertical: 11, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(11,9,16,0.42)", borderWidth: 1, borderColor: "rgba(242,199,91,0.20)" },
  effectsPremiumPreviewIcon: { width: 48, height: 48, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  effectsPremiumPreviewText: { flex: 1, minWidth: 0 },
  effectsPremiumPreviewTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  effectsPremiumPreviewMeta: { color: "rgba(255,255,255,0.68)", fontSize: 10, fontWeight: "800", lineHeight: 14, marginTop: 4 },
  effectsPremiumPreviewPill: { minHeight: 28, borderRadius: 14, paddingHorizontal: 9, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(242,199,91,0.12)", borderWidth: 1, borderColor: "rgba(242,199,91,0.24)" },
  effectsPremiumPreviewPillText: { color: "#F2C75B", fontSize: 9, fontWeight: "900" },
  effectsPremiumSelectorRow: { gap: 8, paddingRight: 4 },
  effectsPremiumSelectorCard: { width: 96, minHeight: 104, borderRadius: 24, paddingHorizontal: 9, paddingVertical: 10, alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)" },
  effectsPremiumSelectorCardActive: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  effectsPremiumSelectorCardApplied: { backgroundColor: "rgba(242,199,91,0.14)", borderColor: "rgba(242,199,91,0.32)" },
  effectsPremiumSelectorCardPressed: { transform: [{ scale: 0.97 }], opacity: 0.86 },
  effectsPremiumSelectorIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(242,199,91,0.12)" },
  effectsPremiumSelectorIconActive: { backgroundColor: "rgba(11,9,16,0.12)" },
  effectsPremiumSelectorLabel: { color: "#FFFFFF", fontSize: 10, fontWeight: "900", textAlign: "center" },
  effectsPremiumSelectorLabelActive: { color: "#0B0910" },
  effectsPremiumSelectorMeta: { color: "rgba(255,255,255,0.52)", fontSize: 8, fontWeight: "900", textAlign: "center" },
  effectsPremiumSelectorMetaActive: { color: "rgba(11,9,16,0.64)" },
  effectsPremiumSelectorMetaFeedback: { color: "#F2C75B" },
  effectsPremiumStackSummary: { minHeight: 54, borderRadius: 22, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "rgba(255,255,255,0.065)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  effectsPremiumStackIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(242,199,91,0.10)" },
  effectsPremiumStackText: { flex: 1, minWidth: 0 },
  effectsPremiumStackTitle: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  effectsPremiumStackMeta: { color: "rgba(255,255,255,0.58)", fontSize: 9, fontWeight: "800", marginTop: 2 },
  effectsPremiumStackButton: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  effectsPremiumLockedNotice: { minHeight: 40, borderRadius: 20, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(242,199,91,0.08)", borderWidth: 1, borderColor: "rgba(242,199,91,0.18)" },
  effectsPremiumLockedText: { flex: 1, color: "rgba(255,255,255,0.68)", fontSize: 9, fontWeight: "800", lineHeight: 12 },
  settingsProductionFooter: { borderRadius: 24, padding: 11, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  settingsProductionFooterText: { flex: 1, minWidth: 0 },
  settingsProductionFooterTitle: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  settingsProductionFooterMeta: { color: "rgba(255,255,255,0.58)", fontSize: 9, fontWeight: "800", lineHeight: 12, marginTop: 3 },
  settingsAdvancedToggle: { minHeight: 34, borderRadius: 17, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "rgba(242,199,91,0.08)", borderWidth: 1, borderColor: "rgba(242,199,91,0.18)" },
  settingsAdvancedToggleActive: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  settingsAdvancedTogglePressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  settingsAdvancedToggleText: { color: "#F2C75B", fontSize: 9, fontWeight: "900" },
  settingsAdvancedToggleTextActive: { color: "#0B0910" },
  settingsQuickRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  settingsClosedToolsNotice: { minHeight: 50, borderRadius: 20, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(242,199,91,0.075)", borderWidth: 1, borderColor: "rgba(242,199,91,0.18)" },
  settingsClosedToolsNoticeText: { flex: 1, color: "rgba(255,255,255,0.72)", fontSize: 9, fontWeight: "800", lineHeight: 12 },
  premiumProgress: { flexDirection: "row", alignItems: "center", gap: 6 },
  premiumStep: { flex: 1, minHeight: 28, borderRadius: 999, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.07)" },
  premiumStepReady: { backgroundColor: "#F2C75B" },
  premiumStepText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },
  premiumStepTextReady: { color: "#0B0910" },
  premiumActions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
  premiumActionButton: { flexGrow: 1, minWidth: "30%", minHeight: 34, borderRadius: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.08)" },
  premiumActionText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  premiumSocialRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 7 },
  premiumSocialButton: { flex: 1, minHeight: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", gap: 2, backgroundColor: "rgba(255,255,255,0.09)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  premiumSocialButtonActive: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  premiumSocialText: { color: "#FFFFFF", fontSize: 8, fontWeight: "900" },
  premiumSocialTextActive: { color: "#0B0910" },
  premiumSocialCounter: { position: "absolute", right: 7, top: 5, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: "#EF4444", color: "#FFFFFF", fontSize: 8, fontWeight: "900", textAlign: "center", lineHeight: 16, overflow: "hidden" },
  usefulOverlayStage: { height: 128, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.045)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden", marginTop: 10, marginBottom: 10 },
  usefulOverlayPreviewItem: { position: "absolute", minWidth: 86, maxWidth: 146, minHeight: 42, borderRadius: 22, backgroundColor: "rgba(242,199,91,0.92)", borderWidth: 1, borderColor: "rgba(255,255,255,0.32)", paddingHorizontal: 10, paddingVertical: 7, alignItems: "center", justifyContent: "center" },
  usefulOverlayCircle: { minWidth: 68, maxWidth: 88, minHeight: 68, borderRadius: 34 },
  usefulOverlayBox: { borderRadius: 14, backgroundColor: "rgba(255,255,255,0.14)", borderColor: "rgba(242,199,91,0.8)" },
  usefulOverlayUnderline: { borderRadius: 0, borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 3, backgroundColor: "rgba(242,199,91,0.18)" },
  usefulOverlayLight: { backgroundColor: "rgba(255,255,255,0.94)", borderColor: "rgba(242,199,91,0.55)" },
  usefulOverlayDark: { backgroundColor: "rgba(9,9,14,0.92)", borderColor: "rgba(255,255,255,0.2)" },
  usefulOverlayBlue: { backgroundColor: "rgba(59,130,246,0.88)", borderColor: "rgba(255,255,255,0.22)" },
  usefulOverlayGreen: { backgroundColor: "rgba(34,197,94,0.86)", borderColor: "rgba(255,255,255,0.22)" },
  usefulOverlayIconText: { color: "#0B0910", fontSize: 13, fontWeight: "900", letterSpacing: 0.3 },
  usefulOverlayPreviewText: { color: "#0B0910", fontSize: 11, fontWeight: "900", marginTop: 2 },

  shareSaveBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.62)", zIndex: 138, elevation: 138 },
  shareSaveSheet: { maxHeight: "78%", borderTopLeftRadius: 34, borderTopRightRadius: 34, backgroundColor: "#0B0910", borderWidth: 1, borderColor: "rgba(242,199,91,0.24)", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 20, gap: 12, zIndex: 140, elevation: 140, shadowColor: "#000", shadowOpacity: 0.40, shadowRadius: 24, shadowOffset: { width: 0, height: -10 } },
  shareSaveSheetCompact: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 13, paddingTop: 12, paddingBottom: 14, gap: 8 },
  shareSaveScroll: { flexGrow: 0 },
  shareSaveScrollContent: { gap: 12, paddingBottom: 4 },
  shareSaveScrollContentCompact: { gap: 9, paddingBottom: 2 },
  shareSaveTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  shareSaveIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  shareSaveTitleWrap: { flex: 1, minWidth: 0 },
  shareSaveEyebrow: { color: "#F2C75B", fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  shareSaveTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", marginTop: 2 },
  shareSaveClose: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  shareSaveDescription: { color: "#D9D2E5", fontSize: 12, lineHeight: 18, fontWeight: "700" },
  shareSaveStatusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  shareSaveStatusPill: { minHeight: 30, borderRadius: 15, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  shareSaveStatusPillReady: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  shareSaveStatusText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  shareSaveStatusTextReady: { color: "#0B0910" },
  shareSaveActionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  shareSaveActionPrimary: { minHeight: 40, borderRadius: 21, paddingHorizontal: 14, flexGrow: 1, flexBasis: "47%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: "#F2C75B" },
  shareSaveActionPrimaryText: { color: "#0B0910", fontSize: 12, fontWeight: "900" },
  shareSaveAction: { minHeight: 40, borderRadius: 21, paddingHorizontal: 12, flexGrow: 1, flexBasis: "47%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(242,199,91,0.18)" },
  shareSaveActionText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  shareSaveActionLocked: { minHeight: 40, borderRadius: 21, paddingHorizontal: 12, flexGrow: 1, flexBasis: "47%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: "rgba(255,255,255,0.045)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  shareSaveActionLockedText: { color: "#B8B1C6", fontSize: 11, fontWeight: "900" },
  viewerSwipeSurface: { ...StyleSheet.absoluteFillObject, zIndex: 8, elevation: 8, overflow: "hidden" },
  viewerCleanEmptySurface: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, zIndex: 8, elevation: 8, backgroundColor: "#030307" },
  viewerPlaybackSurface: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, zIndex: 8, elevation: 8, backgroundColor: "#030307" },
  viewerPlaybackTapLayer: { flex: 1, alignItems: "center", justifyContent: "center" },
  viewerPlaybackVideo: { width: "100%", height: "100%" },
  viewerPlaybackCenterHint: { position: "absolute", width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(242,199,91,0.90)", shadowColor: "#000", shadowOpacity: 0.24, shadowRadius: 16, shadowOffset: { width: 0, height: 7 }, elevation: 8 },
  viewerPlaybackEdgeProgressTrack: { position: "absolute", left: 0, right: 0, bottom: 0, height: 3, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.10)" },
  viewerPlaybackEdgeProgressFill: { height: 3, backgroundColor: "#F2C75B" },
  viewerPlaybackBottomDock: { position: "absolute", left: 14, right: 92, bottom: 22, zIndex: 30, borderRadius: 24, padding: 10, gap: 7, backgroundColor: "rgba(8,7,13,0.80)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", shadowColor: "#000", shadowOpacity: 0.20, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 30 },
  viewerPlaybackBottomDockCompact: { left: 12, right: 82, bottom: 14, borderRadius: 22, padding: 8, gap: 6 },
  viewerPlaybackBottomDockVeryCompact: { bottom: 10, paddingVertical: 7 },
  viewerPlaybackBottomDockNarrow: { right: 78 },
  viewerPlaybackTextBlock: { paddingRight: 58 },
  viewerPlaybackEyebrow: { color: "#F2C75B", fontSize: 8, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  viewerPlaybackTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  viewerPlaybackMeta: { color: "#D9D0E8", fontSize: 8, fontWeight: "800", marginTop: 2 },
  viewerPlaybackStatusPill: { position: "absolute", top: 12, right: 12, minWidth: 46, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(242,199,91,0.16)", borderWidth: 1, borderColor: "rgba(242,199,91,0.32)" },
  viewerPlaybackStatusText: { color: "#F2C75B", fontSize: 9, fontWeight: "900" },
  viewerPlaybackProgressTrack: { height: 5, borderRadius: 3, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.16)" },
  viewerPlaybackProgressFill: { height: 5, borderRadius: 3, backgroundColor: "#F2C75B" },
  viewerPlaybackControlRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  viewerPlaybackControlButton: { flex: 1, height: 30, borderRadius: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "#F2C75B" },
  viewerPlaybackControlButtonSecondary: { flex: 1, height: 30, borderRadius: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  viewerPlaybackControlText: { color: "#0B0910", fontSize: 9, fontWeight: "900" },
  viewerPlaybackControlTextSecondary: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },
  viewerPlaybackMiniPauseButton: { alignSelf: "flex-start", height: 28, borderRadius: 14, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#F2C75B" },
  viewerPlaybackMiniPauseText: { color: "#0B0910", fontSize: 9, fontWeight: "900" },
  viewerEmptySourceCard: { position: "absolute", left: 16, right: 98, bottom: 42, minHeight: 96, borderRadius: 26, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(8,7,13,0.82)", borderWidth: 1, borderColor: "rgba(242,199,91,0.22)", zIndex: 28, shadowColor: "#000", shadowOpacity: 0.24, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 28 },
  viewerEmptySourceCardCompact: { left: 12, right: 86, bottom: 30, minHeight: 82, borderRadius: 22, padding: 12, gap: 10 },
  viewerEmptySourceCardVeryCompact: { right: 80, bottom: 18, minHeight: 74, paddingVertical: 10 },
  viewerEmptySourceIcon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  viewerEmptySourceText: { flex: 1 },
  viewerEmptySourceTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  viewerEmptySourceMeta: { color: "#D9D0E8", fontSize: 10, fontWeight: "800", marginTop: 4, lineHeight: 14 },

  viewerCreationRail: { position: "absolute", left: 12, right: 88, bottom: 154, borderRadius: 24, padding: 10, gap: 7, backgroundColor: "rgba(8,7,13,0.78)", borderWidth: 1, borderColor: "rgba(242,199,91,0.18)", zIndex: 34, elevation: 34, shadowColor: "#000", shadowOpacity: 0.22, shadowRadius: 16, shadowOffset: { width: 0, height: 7 } },
  viewerCreationRailCompact: { left: 10, right: 82, bottom: 126, borderRadius: 22, padding: 8, gap: 6 },
  viewerCreationRailVeryCompact: { bottom: 104, paddingVertical: 7 },
  viewerCreationRailHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  viewerCreationRailTitleWrap: { flex: 1, minWidth: 0 },
  viewerCreationRailEyebrow: { color: "#F2C75B", fontSize: 8, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.7 },
  viewerCreationRailTitle: { color: "#FFFFFF", fontSize: 12, fontWeight: "900", marginTop: 1 },
  viewerCreationRailProgress: { color: "#0B0910", fontSize: 10, fontWeight: "900", minWidth: 34, textAlign: "center", borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: "#F2C75B", overflow: "hidden" },
  viewerCreationProgressTrack: { height: 4, borderRadius: 2, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.13)" },
  viewerCreationProgressFill: { height: 4, borderRadius: 2, backgroundColor: "#F2C75B" },
  viewerCreationStepsScroll: { marginHorizontal: -2 },
  viewerCreationStepsContent: { gap: 7, paddingHorizontal: 2, paddingVertical: 1 },
  viewerCreationStepsContentCompact: { gap: 5, paddingVertical: 0 },
  viewerCreationStepPill: { minWidth: 82, minHeight: 42, borderRadius: 17, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  viewerCreationStepPillCompact: { minWidth: 68, minHeight: 34, borderRadius: 15, paddingHorizontal: 7, gap: 5 },
  viewerCreationStepPillReady: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  viewerCreationStepText: { flex: 1, minWidth: 0 },
  viewerCreationStepTitle: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  viewerCreationStepTitleReady: { color: "#0B0910" },
  viewerCreationStepMeta: { color: "#B8B1C6", fontSize: 8, fontWeight: "900", marginTop: 1 },
  viewerCreationStepMetaReady: { color: "rgba(11,9,16,0.72)" },
  viewerCreationShortcutRow: { flexDirection: "row", gap: 7 },
  viewerCreationSettingsShortcut: { flex: 1, height: 30, borderRadius: 15, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(242,199,91,0.18)" },
  viewerCreationSettingsShortcutSecondary: { backgroundColor: "rgba(242,199,91,0.08)", borderColor: "rgba(242,199,91,0.24)" },
  viewerCreationSettingsShortcutText: { color: "#F2C75B", fontSize: 9, fontWeight: "900" },

  viewerSocialRail: { position: "absolute", right: 10, top: 96, width: 66, zIndex: 46, elevation: 46, gap: 9, alignItems: "center" },
  viewerSocialRailCompact: { top: 76, right: 8, width: 58, gap: 7 },
  viewerSocialRailVeryCompact: { top: 62, right: 6, width: 52, gap: 5 },
  viewerSocialButton: { width: 54, minHeight: 54, borderRadius: 22, backgroundColor: "rgba(10, 9, 15, 0.88)", borderWidth: 1, borderColor: "rgba(255,255,255,0.13)", alignItems: "center", justifyContent: "center", paddingVertical: 6, shadowColor: "#000", shadowOpacity: 0.20, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 18 },
  viewerSocialButtonCompact: { width: 48, minHeight: 48, borderRadius: 20, paddingVertical: 5 },
  viewerSocialButtonVeryCompact: { width: 44, minHeight: 44, borderRadius: 18, paddingVertical: 4 },
  viewerSocialButtonActive: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  viewerSocialText: { color: "#FFFFFF", fontSize: 8, fontWeight: "900", marginTop: 4 },
  viewerSocialTextActive: { color: "#0B0910" },
  viewerSocialCounter: { position: "absolute", top: 5, right: 6, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: "#EF4444", color: "#FFFFFF", fontSize: 8, fontWeight: "900", textAlign: "center", lineHeight: 17, overflow: "hidden" },
  viewerSocialCounterVeryCompact: { top: 3, right: 3, minWidth: 15, height: 15, borderRadius: 8, fontSize: 7, lineHeight: 15 },
  productionSmokeBar: { minHeight: 34, borderRadius: 17, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(242,199,91,0.12)" },
  productionSmokePill: { minHeight: 22, borderRadius: 11, paddingHorizontal: 7, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(242,199,91,0.10)" },
  productionSmokePillReady: { backgroundColor: "#F2C75B" },
  productionSmokeText: { color: "#F2C75B", fontSize: 9, fontWeight: "900" },
  productionSmokeTextReady: { color: "#0B0910" },
  productionSmokeMeta: { flex: 1, color: "#8D8796", fontSize: 9, fontWeight: "800" },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconWrap: { width: 30, height: 30, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(242,199,91,0.10)" },
  headerText: { flex: 1 },
  title: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  meta: { color: "#8D8796", fontSize: 9, fontWeight: "800", marginTop: 2 },
  badge: { borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 8, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 3 },
  badgeText: { color: "#F2C75B", fontSize: 9, fontWeight: "900" },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  input: { flex: 1, minHeight: 34, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.07)", color: "#FFFFFF", paddingHorizontal: 10, paddingVertical: 8, fontSize: 11, fontWeight: "800" },
  smallInput: { width: 88, minHeight: 34, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.07)", color: "#FFFFFF", paddingHorizontal: 10, paddingVertical: 8, fontSize: 11, fontWeight: "800" },
  captionInput: { minHeight: 68, maxHeight: 116, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.07)", color: "#FFFFFF", paddingHorizontal: 10, paddingVertical: 10, fontSize: 11, fontWeight: "800", lineHeight: 15, textAlignVertical: "top" },
  counterText: { color: "#8D8796", fontSize: 10, fontWeight: "900", width: 32, textAlign: "right" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  chip: { maxWidth: 78, minHeight: 26, borderRadius: 999, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.07)" },
  timelineChip: { maxWidth: 92, minHeight: 25, borderRadius: 999, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.07)" },
  timelineChipPressed: { transform: [{ scale: 0.98 }], opacity: 0.88 },
  effectSelectorChipFeedback: { borderWidth: 1, borderColor: "rgba(242,199,91,0.54)" },
  effectSelectorChipFeedbackText: { color: "#F2C75B", fontSize: 8, fontWeight: "900" },
  visibilityChip: { minHeight: 24, borderRadius: 999, paddingHorizontal: 8, justifyContent: "center", backgroundColor: "rgba(255,255,255,0.07)" },
  chipActive: { backgroundColor: "#F2C75B" },
  effectAppliedChip: { borderWidth: 1, borderColor: "rgba(242,199,91,0.42)", backgroundColor: "rgba(242,199,91,0.12)" },
  chipText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },
  chipTextActive: { color: "#0B0910" },
  visibilityText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },

  effectEditorCard: { borderRadius: 20, padding: 8, gap: 8, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(242,199,91,0.14)" },
  effectEditorPreview: { minHeight: 48, borderRadius: 18, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "rgba(242,199,91,0.10)" },
  effectPreviewIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  effectPreviewText: { flex: 1 },
  effectPreviewTitle: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  effectPreviewMeta: { color: "#CFC8DA", fontSize: 9, fontWeight: "800", marginTop: 2 },
  effectStackList: { gap: 5, paddingBottom: 4 },
  effectStackListHint: { color: "#8D8796", fontSize: 9, fontWeight: "900", lineHeight: 13, paddingHorizontal: 4, paddingTop: 2 },
  effectStackRow: { minHeight: 34, borderRadius: 17, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  effectStackRowActive: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  effectStackRowFeedback: { borderColor: "rgba(242,199,91,0.56)" },
  effectStackRowPressed: { transform: [{ scale: 0.99 }], opacity: 0.88 },
  effectStackName: { flex: 1, color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  effectStackNameActive: { color: "#0B0910" },
  effectStackMeta: { maxWidth: 126, color: "#8D8796", fontSize: 8, fontWeight: "900" },
  effectStackFeedbackText: { minWidth: 42, textAlign: "right", color: "#F2C75B", fontSize: 8, fontWeight: "900" },
  effectStackEmpty: { minHeight: 42, borderRadius: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 10, backgroundColor: "rgba(255,255,255,0.045)" },
  sourceHeader: { display: "none", minHeight: 34, borderRadius: 16, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(106,194,255,0.08)" },
  sourceBox: { borderRadius: 18, padding: 7, gap: 6, backgroundColor: "rgba(106,194,255,0.045)" },
  sourceFlowCard: { borderRadius: 20, padding: 8, gap: 8, backgroundColor: "rgba(106,194,255,0.075)", borderWidth: 1, borderColor: "rgba(106,194,255,0.18)" },
  sourceFlowPreview: { minHeight: 56, borderRadius: 18, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "rgba(255,255,255,0.06)" },
  sourceFlowIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  sourceFlowText: { flex: 1 },
  sourceFlowTitle: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  sourceFlowMeta: { color: "#CFC8DA", fontSize: 8, fontWeight: "800", lineHeight: 11, marginTop: 2 },
  sourceFlowMeters: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  sourceFlowMeterPill: { minHeight: 24, borderRadius: 12, paddingHorizontal: 8, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.075)" },
  sourceFlowMeterText: { color: "#F2C75B", fontSize: 9, fontWeight: "900" },
  sourcePreviewCard: { borderRadius: 20, padding: 8, gap: 8, backgroundColor: "rgba(242,199,91,0.07)", borderWidth: 1, borderColor: "rgba(242,199,91,0.2)" },
  sourcePreviewTopLine: { flexDirection: "row", alignItems: "center", gap: 8 },
  sourcePreviewTitleBox: { flex: 1 },
  sourcePreviewTitle: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  sourcePreviewMeta: { color: "#CFC8DA", fontSize: 8, fontWeight: "800", lineHeight: 11, marginTop: 2 },
  sourcePreviewProgressPill: { minWidth: 42, minHeight: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  sourcePreviewProgressText: { color: "#0B0910", fontSize: 10, fontWeight: "900" },
  sourceVideoFrame: { height: 210, borderRadius: 20, overflow: "hidden", backgroundColor: "#07050A", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  sourcePreviewVideo: { width: "100%", height: "100%" },
  sourcePreviewEmpty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, gap: 8 },
  sourcePreviewEmptyText: { color: "#D9D0E8", fontSize: 10, fontWeight: "800", textAlign: "center", lineHeight: 14 },
  sourcePreviewOverlay: { position: "absolute", left: 8, right: 8, bottom: 8, minHeight: 28, borderRadius: 14, paddingHorizontal: 10, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.46)" },
  sourcePreviewOverlayText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },
  sourcePreviewTimelineTrack: { height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.12)" },
  sourcePreviewTimelineFill: { height: 6, borderRadius: 3, backgroundColor: "#F2C75B" },
  trimCropCoverCard: { borderRadius: 20, padding: 8, gap: 8, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(242,199,91,0.18)" },
  trimCropCoverTopLine: { minHeight: 48, borderRadius: 18, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "rgba(242,199,91,0.08)" },
  trimCropCoverIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  trimCropCoverTextBox: { flex: 1 },
  trimCropCoverTitle: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  trimCropCoverMeta: { color: "#CFC8DA", fontSize: 8, fontWeight: "800", lineHeight: 11, marginTop: 2 },
  trimCropCoverTrack: { height: 10, borderRadius: 5, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.12)" },
  trimCropCoverTrimFill: { height: 10, borderRadius: 5, backgroundColor: "#F2C75B" },
  trimCropCoverCoverMark: { position: "absolute", top: 0, width: 4, height: 10, borderRadius: 2, backgroundColor: "#FFFFFF" },
  captionOverlayCard: { borderRadius: 20, padding: 8, gap: 8, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(106,194,255,0.18)" },
  captionOverlayTopLine: { minHeight: 48, borderRadius: 18, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "rgba(106,194,255,0.08)" },
  captionOverlayIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  captionOverlayTextBox: { flex: 1 },
  captionOverlayTitle: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  captionOverlayMeta: { color: "#CFC8DA", fontSize: 8, fontWeight: "800", lineHeight: 11, marginTop: 2 },
  captionOverlayInput: { minHeight: 46, maxHeight: 92, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 10, color: "#FFFFFF", fontSize: 11, fontWeight: "900", lineHeight: 15, textAlignVertical: "top", backgroundColor: "rgba(255,255,255,0.075)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  captionOverlayInputDisabled: { opacity: 0.64, borderColor: "rgba(242,199,91,0.16)", backgroundColor: "rgba(255,255,255,0.035)" },
  captionOverlayStage: { height: 118, borderRadius: 20, overflow: "hidden", backgroundColor: "#07050A", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  captionOverlayPreviewBubble: { position: "absolute", minWidth: 118, maxWidth: "64%", minHeight: 36, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: "rgba(0,0,0,0.48)" },
  captionOverlayPreviewSolid: { backgroundColor: "#F2C75B" },
  captionOverlayPreviewGlass: { backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1, borderColor: "rgba(255,255,255,0.22)" },
  captionOverlayPreviewNone: { backgroundColor: "transparent" },
  captionOverlayPreviewText: { color: "#FFFFFF", fontWeight: "900", lineHeight: 18 },
  captionOverlayPreviewWarm: { color: "#F2C75B" },
  captionOverlayPreviewDark: { color: "#0B0910" },
  captionOverlayPreviewSky: { color: "#6AC2FF" },
  captionOverlayEmptyText: { flex: 1, color: "#CFC8DA", fontSize: 10, fontWeight: "800", textAlign: "center", padding: 16, textAlignVertical: "center" },
  captionOverlayList: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  captionOverlayChip: { maxWidth: 134, minHeight: 38, borderRadius: 15, paddingHorizontal: 9, paddingVertical: 5, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.07)" },
  captionOverlayChipActive: { backgroundColor: "#F2C75B" },
  captionOverlayChipFeedback: { borderWidth: 1, borderColor: "rgba(242,199,91,0.54)" },
  captionOverlayChipPressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  captionOverlayChipText: { color: "#FFFFFF", fontSize: 9, lineHeight: 11, fontWeight: "900", textAlign: "center" },
  captionOverlayListHint: { color: "#BDB7C7", fontSize: 10, lineHeight: 13, fontWeight: "700" },
  effectsBox: { borderRadius: 18, padding: 7, gap: 6, backgroundColor: "rgba(242,199,91,0.06)" },
  audioBox: { borderRadius: 18, padding: 7, gap: 6, backgroundColor: "rgba(64,214,177,0.06)" },
  audioPremiumPanel: { gap: 10 },
  audioPremiumTrackCard: { minHeight: 72, borderRadius: 24, paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(64,214,177,0.10)", borderWidth: 1, borderColor: "rgba(64,214,177,0.24)" },
  audioPremiumTrackCardPressed: { transform: [{ scale: 0.985 }], borderColor: "rgba(242,199,91,0.50)", backgroundColor: "rgba(64,214,177,0.16)" },
  audioPremiumTrackIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  audioPremiumTrackText: { flex: 1 },
  audioPremiumTrackTitle: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  audioPremiumTrackMeta: { color: "#CFC8DA", fontSize: 9, fontWeight: "800", lineHeight: 13, marginTop: 3 },
  audioWaveformCard: { minHeight: 76, borderRadius: 24, padding: 12, gap: 10, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  audioWaveBars: { height: 36, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4 },
  audioWaveBar: { flex: 1, minWidth: 4, borderRadius: 4, backgroundColor: "#F2C75B" },
  audioWaveInfoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  audioWaveInfoText: { color: "#D9D0E8", fontSize: 9, fontWeight: "900" },
  audioPremiumTrackList: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  audioPremiumTrackChip: { maxWidth: 146, minHeight: 32, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.07)" },
  audioPremiumTrackChipActive: { backgroundColor: "#F2C75B" },
  audioPremiumTrackChipFeedback: { borderWidth: 1, borderColor: "rgba(242,199,91,0.56)" },
  audioPremiumTrackChipPressed: { transform: [{ scale: 0.985 }], borderWidth: 1, borderColor: "rgba(242,199,91,0.44)", backgroundColor: "rgba(255,255,255,0.12)" },
  audioPremiumTrackChipText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900", lineHeight: 12, textAlign: "center" },
  audioPremiumTrackChipTextActive: { color: "#0B0910" },
  audioPremiumMixerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  audioPremiumMixerCard: { width: "48%", minHeight: 66, borderRadius: 20, padding: 10, gap: 4, backgroundColor: "rgba(255,255,255,0.065)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  audioPremiumMixerCardDisabled: { opacity: 0.54, borderColor: "rgba(141,135,150,0.20)", backgroundColor: "rgba(255,255,255,0.035)" },
  audioPremiumMixerCardFeedback: { borderColor: "rgba(242,199,91,0.58)", backgroundColor: "rgba(242,199,91,0.10)" },
  audioPremiumMixerCardPressed: { transform: [{ scale: 0.985 }], borderColor: "rgba(242,199,91,0.48)", backgroundColor: "rgba(255,255,255,0.10)" },
  audioPremiumMixerTitle: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  audioPremiumMixerValue: { color: "#F2C75B", fontSize: 12, fontWeight: "900" },
  audioPremiumMixerFeedbackText: { color: "#40D6B1", fontSize: 8, fontWeight: "900", minHeight: 9 },
  audioPremiumMixerFeedbackTextHidden: { opacity: 0 },
  audioPremiumSelectorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  audioPremiumSelectorCard: { minHeight: 32, borderRadius: 16, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  audioPremiumSelectorCardPressed: { transform: [{ scale: 0.985 }], borderColor: "rgba(242,199,91,0.42)", backgroundColor: "rgba(255,255,255,0.12)" },
  audioPremiumSelectorCardActive: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  audioPremiumSelectorCardReady: { borderColor: "rgba(64,214,177,0.45)", backgroundColor: "rgba(64,214,177,0.10)" },
  audioPremiumSelectorCardFeedback: { borderColor: "rgba(242,199,91,0.62)", backgroundColor: "rgba(242,199,91,0.12)" },
  audioPremiumSelectorText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },
  audioPremiumSelectorTextActive: { color: "#0B0910" },
  audioPremiumSelectorFeedbackText: { color: "#F2C75B", fontSize: 8, fontWeight: "900" },
  audioPremiumSelectorFeedbackTextActive: { color: "#0B0910" },
  audioPremiumActionRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  musicEditorCard: { borderRadius: 20, padding: 8, gap: 8, backgroundColor: "rgba(64,214,177,0.075)", borderWidth: 1, borderColor: "rgba(64,214,177,0.18)" },
  musicTrackShell: { minHeight: 56, borderRadius: 18, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "rgba(255,255,255,0.06)" },
  musicTrackIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  musicTrackText: { flex: 1 },
  musicTrackTitle: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  musicTrackMeta: { color: "#CFC8DA", fontSize: 8, fontWeight: "800", lineHeight: 11, marginTop: 2 },
  musicTrackList: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  musicTrackChip: { maxWidth: 132, minHeight: 30, borderRadius: 15, paddingHorizontal: 9, paddingVertical: 5, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.07)" },
  musicTrackChipActive: { backgroundColor: "#F2C75B" },
  musicTrackChipFeedback: { borderWidth: 1, borderColor: "rgba(242,199,91,0.56)" },
  musicTrackChipPressed: { transform: [{ scale: 0.985 }], borderWidth: 1, borderColor: "rgba(242,199,91,0.42)", backgroundColor: "rgba(255,255,255,0.12)" },
  musicTrackChipText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900", lineHeight: 12, textAlign: "center" },
  musicTrackChipTextActive: { color: "#0B0910" },
  audioTrackChipFeedbackText: { marginTop: 1, minHeight: 9, color: "#F2C75B", fontSize: 7, lineHeight: 8, fontWeight: "900", textAlign: "center", textTransform: "uppercase" },
  audioTrackChipFeedbackTextActive: { color: "rgba(11,9,16,0.72)" },
  audioTrackChipFeedbackTextHidden: { opacity: 0 },
  musicMeters: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  musicMeterPill: { minHeight: 24, borderRadius: 12, paddingHorizontal: 8, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.075)" },
  musicMeterText: { color: "#F2C75B", fontSize: 9, fontWeight: "900" },
  feedBox: { borderRadius: 18, padding: 7, gap: 6, backgroundColor: "rgba(132,106,255,0.06)" },
  playbackBox: { borderRadius: 18, padding: 7, gap: 6, backgroundColor: "rgba(64,214,177,0.06)" },
  acceptanceBox: { borderRadius: 18, padding: 7, gap: 6, backgroundColor: "rgba(242,199,91,0.055)" },
  feedPreviewShell: { minHeight: 38, borderRadius: 16, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.055)" },
  feedPlayIcon: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(242,199,91,0.10)" },
  timelineHeader: { display: "none", minHeight: 34, borderRadius: 16, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(242,199,91,0.08)" },
  timelineHeaderText: { flex: 1 },
  timelineTitle: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  timelineMeta: { color: "#8D8796", fontSize: 9, fontWeight: "800", marginTop: 2 },
  toggleButton: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.07)" },
  timelineBox: { borderRadius: 18, padding: 7, gap: 6, backgroundColor: "rgba(255,255,255,0.045)" },
  clipList: { gap: 4 },
  clipRow: { minHeight: 25, borderRadius: 12, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.05)" },
  clipRowActive: { backgroundColor: "#F2C75B" },
  clipText: { flex: 1, color: "#FFFFFF", fontSize: 9, fontWeight: "900" },
  clipMeta: { color: "#8D8796", fontSize: 8, fontWeight: "900" },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  action: { position: "relative", minHeight: 42, maxWidth: "48%", flexBasis: "47%", flexGrow: 1, borderRadius: 16, paddingHorizontal: 8, paddingTop: 6, paddingBottom: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.08)" },
  actionLocked: { backgroundColor: "rgba(255,255,255,0.04)" },
  actionPressed: { opacity: 0.70, transform: [{ scale: 0.982 }] },
  actionText: { flexShrink: 1, color: "#FFFFFF", fontSize: 9, lineHeight: 11, fontWeight: "900", textAlign: "center" },
  actionTextLocked: { color: "#8D8796" },
  actionFeedbackText: { position: "absolute", left: 8, right: 8, bottom: 3, color: "#F2C75B", fontSize: 7, lineHeight: 9, fontWeight: "900", textAlign: "center", textTransform: "uppercase" },
  actionFeedbackTextHidden: { opacity: 0 },
  actionFeedbackTextLocked: { color: "#8D8796" },
  commentsKeyboardAvoider: { flex: 1, justifyContent: "flex-end", zIndex: 150, elevation: 150 },
  commentsBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "flex-end", zIndex: 152, elevation: 152 },
  commentsSheet: { maxHeight: "82%", borderTopLeftRadius: 34, borderTopRightRadius: 34, backgroundColor: "#0B0910", borderWidth: 1, borderColor: "rgba(242,199,91,0.24)", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 18, gap: 12, zIndex: 154, elevation: 154, shadowColor: "#000", shadowOpacity: 0.42, shadowRadius: 28, shadowOffset: { width: 0, height: -12 } },
  commentsSheetCompact: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 13, paddingTop: 8, paddingBottom: 13, gap: 8 },
  commentsSheetKeyboardOpen: { maxHeight: "68%" },
  commentsHandle: { alignSelf: "center", width: 48, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.22)", marginBottom: 3 },
  commentsTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  commentsTitleWrap: { flex: 1, minWidth: 0 },
  commentsEyebrow: { color: "#F2C75B", fontSize: 10, fontWeight: "900", letterSpacing: 0.7, textTransform: "uppercase" },
  commentsTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "900", marginTop: 1 },
  commentsMeta: { color: "#8D8796", fontSize: 10, fontWeight: "800", marginTop: 3 },
  commentsHeaderBadge: { minWidth: 44, height: 34, borderRadius: 17, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "#F2C75B" },
  commentsHeaderBadgeText: { color: "#0B0910", fontSize: 12, fontWeight: "900" },
  commentsClose: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.09)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  commentsSummaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  commentsSummaryRowKeyboardOpen: { display: "none" },
  commentsSummaryPill: { minHeight: 30, borderRadius: 15, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.065)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  commentsSummaryPillWide: { minHeight: 30, borderRadius: 15, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(242,199,91,0.10)", borderWidth: 1, borderColor: "rgba(242,199,91,0.18)", flexGrow: 1 },
  commentsSummaryText: { color: "#F1EDF8", fontSize: 10, fontWeight: "900" },
  commentsList: { maxHeight: 390 },
  commentsListKeyboardOpen: { maxHeight: 178 },
  commentsListContent: { gap: 10, paddingBottom: 4 },
  commentsListContentKeyboardOpen: { paddingBottom: 14 },
  commentsEmpty: { minHeight: 170, borderRadius: 28, alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.055)", paddingHorizontal: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  commentsEmptyIcon: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  commentsEmptyTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  commentsEmptyMeta: { color: "#BDB5CA", fontSize: 11, fontWeight: "800", textAlign: "center", lineHeight: 16, maxWidth: 260 },
  commentRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 24, padding: 8, backgroundColor: "rgba(255,255,255,0.035)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  commentRowPinned: { borderColor: "rgba(242,199,91,0.42)", backgroundColor: "rgba(242,199,91,0.08)" },
  commentRowSelected: { borderColor: "rgba(64,214,177,0.46)", backgroundColor: "rgba(64,214,177,0.10)" },
  commentRowHidden: { opacity: 0.58 },
  commentRowEvidence: { opacity: 0.82 },
  commentAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(242,199,91,0.20)", borderWidth: 1, borderColor: "rgba(242,199,91,0.36)" },
  commentAvatarText: { color: "#F2C75B", fontSize: 14, fontWeight: "900" },
  commentBubble: { flex: 1, borderRadius: 22, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "rgba(255,255,255,0.065)" },
  commentTopLine: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  commentStatusStack: { alignItems: "flex-end", gap: 4 },
  commentAuthorWrap: { flex: 1, minWidth: 0 },
  commentAuthor: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  commentTime: { color: "#8D8796", fontSize: 9, fontWeight: "800", marginTop: 2 },
  commentStatusPill: { minHeight: 22, borderRadius: 11, paddingHorizontal: 8, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(242,199,91,0.13)", borderWidth: 1, borderColor: "rgba(242,199,91,0.20)" },
  commentStatus: { color: "#F2C75B", fontSize: 9, fontWeight: "900" },
  commentSelectedPill: { minHeight: 20, borderRadius: 10, paddingHorizontal: 7, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(64,214,177,0.16)", borderWidth: 1, borderColor: "rgba(64,214,177,0.30)" },
  commentSelectedText: { color: "#40D6B1", fontSize: 8, fontWeight: "900" },
  commentSelectHintPill: { minHeight: 20, borderRadius: 10, paddingHorizontal: 7, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(242,199,91,0.12)", borderWidth: 1, borderColor: "rgba(242,199,91,0.24)" },
  commentSelectHintText: { color: "#F2C75B", fontSize: 8, fontWeight: "900" },
  commentText: { color: "#F7F2FF", fontSize: 13, fontWeight: "800", lineHeight: 18, marginTop: 7 },
  commentReplyReference: {
    marginTop: 7,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    maxWidth: "100%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(242, 199, 91, 0.25)",
    backgroundColor: "rgba(242, 199, 91, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  commentReplyReferenceText: { flexShrink: 1, color: "#F2C75B", fontSize: 11, fontWeight: "900" },
  commentProvider: { color: "#8D8796", fontSize: 9, fontWeight: "800", marginTop: 5 },
  commentActions: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  commentReplyDraftBanner: { minHeight: 40, borderRadius: 18, paddingHorizontal: 10, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(64,214,177,0.11)", borderWidth: 1, borderColor: "rgba(64,214,177,0.28)" },
  commentReplyDraftIcon: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#40D6B1" },
  commentReplyDraftClear: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(64,214,177,0.10)", borderWidth: 1, borderColor: "rgba(64,214,177,0.24)" },
  commentReplyDraftClearDisabled: { opacity: 0.46, backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)" },
  commentReplyDraftTextWrap: { flex: 1, minWidth: 0 },
  commentReplyDraftTitle: { color: "#40D6B1", fontSize: 9, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
  commentReplyDraftText: { color: "#F7F2FF", fontSize: 11, fontWeight: "900", marginTop: 2 },
  commentAction: { minHeight: 24, borderRadius: 12, paddingHorizontal: 8, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)" },
  commentActionActive: { backgroundColor: "#F2C75B" },
  commentActionText: { color: "#F2C75B", fontSize: 9, fontWeight: "900" },
  commentActionTextActive: { color: "#0B0910" },
  commentQuickAction: { minHeight: 27, borderRadius: 14, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  commentQuickActionActive: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  commentQuickActionDisabled: { backgroundColor: "rgba(255,255,255,0.045)", borderColor: "rgba(255,255,255,0.07)", opacity: 0.72 },
  commentQuickActionText: { color: "#F2C75B", fontSize: 9, fontWeight: "900" },
  commentQuickActionTextActive: { color: "#0B0910" },
  commentQuickActionTextDisabled: { color: "#756D80" },
  commentComposerWrap: { gap: 7 },
  commentComposer: { minHeight: 54, borderRadius: 27, paddingLeft: 15, paddingRight: 6, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.09)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  commentComposerKeyboardOpen: { minHeight: 48, paddingVertical: 3 },
  commentComposerTall: { alignItems: "flex-end", paddingTop: 7, paddingBottom: 7 },
  commentInput: { flex: 1, color: "#FFFFFF", fontSize: 14, fontWeight: "800", paddingVertical: 9, textAlignVertical: "top" },
  commentSend: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(242,199,91,0.46)", alignItems: "center", justifyContent: "center" },
  commentSendReady: { backgroundColor: "#F2C75B" },
  commentSendDisabled: { backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", opacity: 0.74 },
  commentComposerHint: { color: "#AFA6BD", fontSize: 10, fontWeight: "800", lineHeight: 14, paddingHorizontal: 4 },
  commentComposerHintKeyboardOpen: { display: "none" },
  commentStatusStrip: { minHeight: 40, borderRadius: 20, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(242,199,91,0.10)", borderWidth: 1, borderColor: "rgba(242,199,91,0.18)" },
  commentStatusStripText: { flex: 1, color: "#D9D2E5", fontSize: 10, fontWeight: "800", lineHeight: 14 },
  socialBehaviorCard: { borderRadius: 24, padding: 10, gap: 10, backgroundColor: "rgba(64,214,177,0.075)", borderWidth: 1, borderColor: "rgba(64,214,177,0.20)" },
  socialBehaviorHeader: { flexDirection: "row", alignItems: "center", gap: 9 },
  socialBehaviorIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  socialBehaviorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  socialBehaviorItem: { minHeight: 28, maxWidth: "48%", flexGrow: 1, borderRadius: 14, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  socialBehaviorItemReady: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  socialBehaviorItemText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },
  socialBehaviorItemTextReady: { color: "#0B0910" },
  socialBehaviorNotice: { color: "#D9D2E5", fontSize: 10, fontWeight: "800", lineHeight: 14 },
  mobileQaCard: { borderRadius: 24, padding: 10, gap: 10, backgroundColor: "rgba(242,199,91,0.085)", borderWidth: 1, borderColor: "rgba(242,199,91,0.22)" },
  mobileQaHeader: { flexDirection: "row", alignItems: "center", gap: 9 },
  mobileQaIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#F2C75B" },
  mobileQaTitleWrap: { flex: 1, minWidth: 0 },
  mobileQaTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  mobileQaMeta: { color: "rgba(255,255,255,0.64)", fontSize: 9, fontWeight: "800", marginTop: 2 },
  mobileQaBadge: { minHeight: 26, borderRadius: 13, paddingHorizontal: 9, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(11,9,16,0.34)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  mobileQaBadgeText: { color: "#F2C75B", fontSize: 9, fontWeight: "900" },
  mobileQaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  mobileQaItem: { minHeight: 28, maxWidth: "48%", flexGrow: 1, borderRadius: 14, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  mobileQaItemPassed: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  mobileQaItemText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },
  mobileQaItemTextPassed: { color: "#0B0910" },
  mobileQaActions: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  noticeRow: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 26 },
  noticeText: { flex: 1, color: "#8D8796", fontSize: 9, fontWeight: "800", lineHeight: 12 },
  videoSourceBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.62)",
    padding: 14,
    zIndex: 88,
    elevation: 88,
  },
  videoSourceSheet: {
    borderRadius: 32,
    padding: 14,
    gap: 13,
    backgroundColor: "#111018",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.20)",
    shadowColor: "#000",
    shadowOpacity: 0.34,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    zIndex: 90,
    elevation: 90,
  },
  videoSourceSheetCompact: { borderRadius: 28, padding: 12, gap: 10 },
  videoSourceScroll: { flexGrow: 0 },
  videoSourceScrollContent: { gap: 13, paddingBottom: 3 },
  videoSourceScrollContentCompact: { gap: 10, paddingBottom: 2 },
  videoSourceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  videoSourceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2C75B",
  },
  videoSourceTitleWrap: { flex: 1, minWidth: 0 },
  videoSourceEyebrow: {
    color: "#F2C75B",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  videoSourceTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 3,
  },
  videoSourceClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  videoSourceSelectedCard: {
    minHeight: 74,
    borderRadius: 24,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(242,199,91,0.10)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.20)",
  },
  videoSourceSelectedDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11,9,16,0.42)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.20)",
  },
  videoSourceSelectedDotReady: {
    backgroundColor: "#F2C75B",
    borderColor: "#F2C75B",
  },
  videoSourceSelectedTextWrap: { flex: 1, minWidth: 0 },
  videoSourceSelectedTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  videoSourceSelectedMeta: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4,
  },
  videoSourceOptionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  videoSourceOptionGridCompact: { gap: 7 },
  videoSourceOptionPrimary: {
    flexGrow: 1,
    minWidth: "47%",
    minHeight: 104,
    borderRadius: 28,
    padding: 12,
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#F2C75B",
    borderWidth: 1,
    borderColor: "#F2C75B",
  },
  videoSourceOption: {
    flexGrow: 1,
    minWidth: "47%",
    minHeight: 104,
    borderRadius: 28,
    padding: 12,
    justifyContent: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.065)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  videoSourceOptionLocked: {
    flexGrow: 1,
    minWidth: "47%",
    minHeight: 104,
    borderRadius: 28,
    padding: 12,
    justifyContent: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.035)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  videoSourceOptionCompact: { minHeight: 82, borderRadius: 22, padding: 10, gap: 5 },
  videoSourceOptionIconPrimary: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11,9,16,0.10)",
  },
  videoSourceOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(242,199,91,0.10)",
  },
  videoSourceOptionIconLocked: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  videoSourceOptionTitlePrimary: {
    color: "#0B0910",
    fontSize: 13,
    fontWeight: "900",
  },
  videoSourceOptionMetaPrimary: {
    color: "rgba(11,9,16,0.62)",
    fontSize: 10,
    fontWeight: "900",
  },
  videoSourceOptionTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  videoSourceOptionMeta: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 10,
    fontWeight: "800",
  },
  videoSourceOptionTitleLocked: {
    color: "#8D8796",
    fontSize: 13,
    fontWeight: "900",
  },
  videoSourceOptionMetaLocked: {
    color: "rgba(141,135,150,0.72)",
    fontSize: 10,
    fontWeight: "800",
  },
  videoSourceFooterNotice: {
    minHeight: 42,
    borderRadius: 21,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(242,199,91,0.075)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.16)",
  },
  videoSourceFooterText: {
    flex: 1,
    color: "rgba(255,255,255,0.70)",
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 14,
  },

  finalInteractionCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.075)",
    borderWidth: 1,
    borderColor: "rgba(242, 199, 91, 0.22)",
    gap: 12,
  },
  finalInteractionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  finalInteractionIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2C75B",
  },
  finalInteractionText: {
    flex: 1,
    minWidth: 0,
  },
  finalInteractionEyebrow: {
    color: "rgba(255, 255, 255, 0.58)",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  finalInteractionTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
  },
  finalInteractionMeta: {
    color: "rgba(255, 255, 255, 0.66)",
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 14,
    marginTop: 3,
  },
  finalInteractionStatusPill: {
    minWidth: 78,
    minHeight: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    backgroundColor: "rgba(242, 199, 91, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(242, 199, 91, 0.28)",
  },
  finalInteractionStatusPillReady: {
    backgroundColor: "#F2C75B",
    borderColor: "#F2C75B",
  },
  finalInteractionStatusText: {
    color: "#F2C75B",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  finalInteractionStatusTextReady: {
    color: "#0B0910",
  },
  finalInteractionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  finalInteractionMiniCard: {
    width: "30.5%",
    minHeight: 42,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.055)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.09)",
  },
  finalInteractionMiniCardReady: {
    backgroundColor: "#F2C75B",
    borderColor: "#F2C75B",
  },
  finalInteractionMiniText: {
    color: "rgba(255, 255, 255, 0.82)",
    fontSize: 8,
    fontWeight: "900",
    textAlign: "center",
  },
  finalInteractionMiniTextReady: {
    color: "#0B0910",
  },

  sabiShortsCameraRoot: {
    flex: 1,
    backgroundColor: "#050507",
  },
  sabiShortsCameraShadeTop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 190,
    backgroundColor: "rgba(0,0,0,0.34)",
  },
  sabiShortsCameraShadeBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 250,
    backgroundColor: "rgba(0,0,0,0.42)",
  },
  sabiShortsCameraTopBar: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    zIndex: 20,
    elevation: 20,
  },
  sabiShortsCameraTopBarCompact: { left: 12, right: 12, top: 16, gap: 8 },
  sabiShortsCameraCircleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(7, 7, 12, 0.66)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  sabiShortsCameraTitleBox: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: "rgba(7, 7, 12, 0.64)",
    borderWidth: 1,
    borderColor: "rgba(242, 199, 91, 0.20)",
  },
  sabiShortsCameraTitleLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sabiShortsCameraEyebrow: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  sabiShortsCameraLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.34)",
  },
  sabiShortsCameraLiveDotActive: {
    backgroundColor: "#E94545",
  },
  sabiShortsCameraTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  sabiShortsCameraSubTitle: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
  sabiShortsCameraGrid: {
    ...StyleSheet.absoluteFillObject,
  },
  sabiShortsCameraGridLine: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  selectedPreviewQaCard: {
    borderRadius: 28,
    padding: 13,
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.16)",
  },
  selectedPreviewQaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  selectedPreviewQaIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2C75B",
  },
  selectedPreviewQaText: { flex: 1, gap: 2 },
  selectedPreviewQaEyebrow: {
    color: "rgba(242,199,91,0.88)",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  selectedPreviewQaTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  selectedPreviewQaMeta: { color: "rgba(255,255,255,0.66)", fontSize: 11, fontWeight: "700", lineHeight: 15 },
  selectedPreviewQaPill: {
    minWidth: 62,
    minHeight: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    backgroundColor: "rgba(242,199,91,0.10)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.24)",
  },
  selectedPreviewQaPillReady: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  selectedPreviewQaPillText: { color: "#F2C75B", fontSize: 10, fontWeight: "900" },
  selectedPreviewQaPillTextReady: { color: "#0B0910" },
  selectedPreviewQaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  selectedPreviewQaMiniCard: {
    flexGrow: 1,
    flexBasis: "31%",
    minHeight: 34,
    borderRadius: 17,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  selectedPreviewQaMiniCardReady: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  selectedPreviewQaMiniText: { flex: 1, color: "rgba(255,255,255,0.82)", fontSize: 10, fontWeight: "900" },
  selectedPreviewQaMiniTextReady: { color: "#0B0910" },
  selectedPreviewQaActionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  sabiShortsCameraGridLineVerticalOne: {
    top: 124,
    bottom: 166,
    left: "33.33%",
    width: 1,
  },
  sabiShortsCameraGridLineVerticalTwo: {
    top: 124,
    bottom: 166,
    left: "66.66%",
    width: 1,
  },
  sabiShortsCameraGridLineHorizontalOne: {
    left: 18,
    right: 18,
    top: "37%",
    height: 1,
  },
  sabiShortsCameraGridLineHorizontalTwo: {
    left: 18,
    right: 18,
    top: "62%",
    height: 1,
  },
  sabiShortsCameraFocusFrame: {
    position: "absolute",
    left: 52,
    right: 52,
    top: "35%",
    height: 150,
  },
  sabiShortsCameraFocusCorner: {
    position: "absolute",
    width: 34,
    height: 34,
    borderColor: "rgba(242,199,91,0.74)",
  },
  sabiShortsCameraFocusCornerTopLeft: {
    left: 0,
    top: 0,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderTopLeftRadius: 12,
  },
  sabiShortsCameraFocusCornerTopRight: {
    right: 0,
    top: 0,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderTopRightRadius: 12,
  },
  sabiShortsCameraFocusCornerBottomLeft: {
    left: 0,
    bottom: 0,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderBottomLeftRadius: 12,
  },
  sabiShortsCameraFocusCornerBottomRight: {
    right: 0,
    bottom: 0,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderBottomRightRadius: 12,
  },
  sabiShortsCameraSideTools: {
    position: "absolute",
    right: 16,
    top: 148,
    zIndex: 18,
    elevation: 18,
  },
  sabiShortsCameraSideToolsContent: { gap: 10, paddingVertical: 2 },
  sabiShortsCameraSideToolsContentCompact: { gap: 7 },
  sabiShortsCameraToolButton: {
    width: 56,
    minHeight: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    backgroundColor: "rgba(7, 7, 12, 0.64)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  sabiShortsCameraToolButtonCompact: { width: 50, minHeight: 50, borderRadius: 16 },
  sabiShortsCameraToolButtonActive: {
    backgroundColor: "#F2C75B",
    borderColor: "#F2C75B",
  },
  sabiShortsCameraToolText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },
  sabiShortsCameraToolTextActive: {
    color: "#0B0910",
  },
  sabiShortsCameraRecordingMeter: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 104,
  },
  sabiShortsCameraRecordingTrack: {
    height: 5,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  sabiShortsCameraRecordingProgress: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#E94545",
  },
  sabiShortsCameraErrorCard: {
    position: "absolute",
    left: 22,
    right: 88,
    top: 122,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "rgba(20, 16, 10, 0.86)",
    borderWidth: 1,
    borderColor: "rgba(242, 199, 91, 0.32)",
  },
  sabiShortsCameraErrorText: {
    flex: 1,
    color: "#FFF3C9",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
  },
  sabiShortsCameraBottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 30,
    alignItems: "center",
    gap: 11,
    zIndex: 22,
    elevation: 22,
  },
  sabiShortsCameraBottomBarCompact: { gap: 8 },
  sabiShortsCameraLimitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sabiShortsCameraLimitChip: {
    minHeight: 32,
    minWidth: 58,
    borderRadius: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(7, 7, 12, 0.62)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  sabiShortsCameraLimitChipCompact: { minHeight: 28, minWidth: 50, paddingHorizontal: 10 },
  sabiShortsCameraLimitChipActive: {
    backgroundColor: "#F2C75B",
    borderColor: "#F2C75B",
  },
  sabiShortsCameraLimitChipText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  sabiShortsCameraLimitChipTextActive: {
    color: "#0B0910",
  },
  sabiShortsCameraStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(7, 7, 12, 0.68)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  sabiShortsCameraStatusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  sabiShortsCameraRecordButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.20)",
    borderWidth: 5,
    borderColor: "rgba(255, 255, 255, 0.94)",
  },
  sabiShortsCameraRecordButtonCompact: { width: 74, height: 74, borderRadius: 37, borderWidth: 4 },
  sabiShortsCameraRecordButtonActive: {
    borderColor: "#F2C75B",
    backgroundColor: "rgba(242, 199, 91, 0.24)",
  },
  sabiShortsCameraRecordInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E94545",
  },
  sabiShortsCameraRecordInnerActive: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#E94545",
  },
  sabiShortsCameraHint: {
    color: "rgba(255, 255, 255, 0.86)",
    fontSize: 12,
    fontWeight: "900",
  },

});
