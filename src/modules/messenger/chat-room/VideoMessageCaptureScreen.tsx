import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Slider from "@react-native-community/slider";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as FileSystemLegacy from "expo-file-system/legacy";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  buildSabiCameraMountKey,
  getSabiCameraRemountDelayMs,
  getSabiCameraRetryDelayMs,
  normalizeSabiCameraMountError,
  toggleSabiCameraFacing,
  type SabiCameraFacing,
} from "../../../shared/camera/sabiCameraRuntime";

import {
  CustomVideoEffectConfig,
  createSavedPresetFromCustom,
  DEFAULT_CUSTOM_VIDEO_EFFECT_CONFIG,
  getVideoEffectPreset,
  GIRLS_FOCUSED_EFFECTS,
  INITIAL_SAVED_VIDEO_PRESETS,
  SavedVideoPreset,
  VIDEO_EFFECT_PRESETS,
  VideoEffectId,
} from "./videoEffects";
import { VideoEffectCreatorSheet } from "./VideoEffectCreatorSheet";
import { VideoPresetLibrarySheet } from "./VideoPresetLibrarySheet";
import {
  ANIME_TRANSFORM_PRESETS,
  AnimeTransformId,
  getAnimeTransformPreset,
  isAnimatedTransform,
} from "./animeTransforms";
import { VideoTransformOverlay } from "./VideoTransformOverlay";

export type VideoCaptureResult = {
  uri: string;
  mediaKind?: "photo" | "video";
  effectId: VideoEffectId;
  effectIntensity: number;
  transformId?: AnimeTransformId;
  durationMs?: number | null;
  mimeType?: string | null;
  fileName?: string | null;
  mirrorActive?: boolean;
  effectsVisible?: boolean;
  customEffectConfig?: CustomVideoEffectConfig | null;
};

type Props = {
  visible: boolean;
  accent: string;
  usageMode?: "video_message" | "photo" | "stream";
  onClose: () => void;
  onCapture: (result: VideoCaptureResult) => void;
};

type ActiveDock = "looks" | "anime" | "presets" | "strength" | null;

const MIN_VIDEO_RECORDING_MS = 1100;
const MAX_VIDEO_RECORDING_SECONDS = 60;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getVideoCaptureExtension(uri?: string | null) {
  const clean = String(uri ?? "").split("?")[0].split("#")[0].trim().toLowerCase();
  const match = clean.match(/\.([a-z0-9]{1,12})$/i);
  return match?.[1]?.toLowerCase() ?? "";
}

function getVideoCaptureMimeType(uri?: string | null) {
  const extension = getVideoCaptureExtension(uri);

  switch (extension) {
    case "mov":
      return "video/quicktime";
    case "m4v":
      return "video/x-m4v";
    case "webm":
      return "video/webm";
    case "3gp":
    case "3gpp":
      return "video/3gpp";
    case "3g2":
      return "video/3gpp2";
    case "mpg":
    case "mpeg":
      return "video/mpeg";
    case "mp4":
    default:
      return "video/mp4";
  }
}

function getVideoCaptureFileName(uri?: string | null) {
  const extension = getVideoCaptureExtension(uri) || "mp4";
  return "video-message-" + Date.now() + "." + extension;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getFileSize(info: Awaited<ReturnType<typeof FileSystemLegacy.getInfoAsync>>) {
  const maybeSize = (info as { size?: unknown }).size;
  return typeof maybeSize === "number" && Number.isFinite(maybeSize) ? maybeSize : 0;
}

async function waitForRecordedVideoFile(uri: string) {
  let lastInfo: Awaited<ReturnType<typeof FileSystemLegacy.getInfoAsync>> | null = null;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    try {
      const info = await FileSystemLegacy.getInfoAsync(uri);
      lastInfo = info;

      if (info.exists && getFileSize(info) > 2048) {
        return info;
      }
    } catch {
      // Some Android devices expose the file a moment after recordAsync resolves.
    }

    await wait(120);
  }

  return lastInfo;
}

async function normalizeRecordedVideoFile(uri: string) {
  const sourceInfo = await waitForRecordedVideoFile(uri);

  if (!sourceInfo?.exists) {
    throw new Error("recorded_video_file_missing");
  }

  if (getFileSize(sourceInfo) <= 2048) {
    throw new Error("recorded_video_file_empty");
  }

  const cacheRoot = FileSystemLegacy.cacheDirectory || FileSystemLegacy.documentDirectory;
  if (!cacheRoot || !/^file:/i.test(uri)) {
    return uri;
  }

  const extension = getVideoCaptureExtension(uri) || "mp4";
  const target = `${cacheRoot}sabi-video-message-${Date.now()}.${extension}`;

  try {
    await FileSystemLegacy.copyAsync({ from: uri, to: target });
    const targetInfo = await waitForRecordedVideoFile(target);

    if (targetInfo?.exists && getFileSize(targetInfo) > 2048) {
      return target;
    }
  } catch {
    // If copy fails, keep the original verified file.
  }

  return uri;
}

function renderLiveEffectOverlay(
  effectId: VideoEffectId,
  intensity: number,
  customConfig: CustomVideoEffectConfig,
) {
  const power = clamp01(intensity / 100);

  if (effectId === "custom") {
    const warm = clamp01(customConfig.warmth / 100);
    const cool = clamp01(customConfig.coolness / 100);
    const glow = clamp01(customConfig.glow / 100);
    const softness = clamp01(customConfig.softness / 100);
    const blur = clamp01(customConfig.blur / 100);
    const anime = clamp01(customConfig.anime / 100);
    const contrast = clamp01(customConfig.contrast / 100);
    const saturation = clamp01(customConfig.saturation / 100);

    return (
      <>
        <LinearGradient
          colors={[
            `rgba(255,194,132,${0.30 * warm})`,
            `rgba(122,184,255,${0.18 * cool})`,
          ]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[
            `rgba(255,255,255,${0.24 * glow})`,
            `rgba(255,236,245,${0.08 * glow})`,
          ]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, styles.customContrastOverlay, { opacity: 0.20 * contrast }]} />
        <View style={[StyleSheet.absoluteFill, styles.customSaturationOverlay, { opacity: 0.18 * saturation }]} />
        <View style={[styles.faceSoftRing, { opacity: 0.24 * softness }]} />
        <View style={[styles.blurFocusFrame, { opacity: 0.54 * blur }]} />
        <View style={[StyleSheet.absoluteFill, styles.animeFrame, { opacity: 0.24 * anime }]} />
      </>
    );
  }

  switch (effectId) {
    case "warm":
      return (
        <>
          <LinearGradient
            colors={["rgba(255,196,126,0.32)", "rgba(255,116,61,0.10)"]}
            style={[StyleSheet.absoluteFill, { opacity: 0.62 * power }]}
          />
          <View
            style={[
              styles.liveGlowOrb,
              styles.liveGlowTopRight,
              { opacity: 0.24 * power, backgroundColor: "rgba(255,206,154,1)" },
            ]}
          />
        </>
      );
    case "cold":
      return (
        <>
          <LinearGradient
            colors={["rgba(116,188,255,0.30)", "rgba(126,255,255,0.10)"]}
            style={[StyleSheet.absoluteFill, { opacity: 0.62 * power }]}
          />
          <View
            style={[
              styles.liveGlowOrb,
              styles.liveGlowLeft,
              { opacity: 0.22 * power, backgroundColor: "rgba(168,221,255,1)" },
            ]}
          />
        </>
      );
    case "cinema":
      return (
        <>
          <LinearGradient
            colors={["rgba(8,10,18,0.40)", "rgba(172,101,62,0.10)"]}
            style={[StyleSheet.absoluteFill, { opacity: 0.64 * power }]}
          />
          <View style={[styles.cinemaBar, styles.cinemaBarTop]} />
          <View style={[styles.cinemaBar, styles.cinemaBarBottom]} />
          <View style={[StyleSheet.absoluteFill, styles.darkVignette, { opacity: 0.36 * power }]} />
        </>
      );
    case "vivid":
      return (
        <>
          <LinearGradient
            colors={["rgba(255,86,164,0.20)", "rgba(72,226,255,0.18)"]}
            style={[StyleSheet.absoluteFill, { opacity: 0.66 * power }]}
          />
          <View style={[StyleSheet.absoluteFill, styles.vividFrame, { opacity: 0.26 * power }]} />
        </>
      );
    case "mono":
      return (
        <>
          <View style={[StyleSheet.absoluteFill, styles.monochromeOverlay, { opacity: 0.46 * power }]} />
          <LinearGradient
            colors={["rgba(255,255,255,0.10)", "rgba(0,0,0,0.14)"]}
            style={[StyleSheet.absoluteFill, { opacity: 0.62 * power }]}
          />
        </>
      );
    case "light_glow":
      return (
        <>
          <LinearGradient
            colors={["rgba(255,255,255,0.28)", "rgba(255,222,180,0.08)"]}
            style={[StyleSheet.absoluteFill, { opacity: 0.62 * power }]}
          />
          <View
            style={[
              styles.liveGlowOrb,
              styles.liveGlowTopCenter,
              { opacity: 0.30 * power, backgroundColor: "rgba(255,255,255,1)" },
            ]}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              styles.edgeGlowFrame,
              { borderColor: `rgba(255,255,255,${0.12 + 0.18 * power})` },
            ]}
          />
        </>
      );
    case "beauty":
      return (
        <>
          <LinearGradient
            colors={["rgba(255,230,238,0.30)", "rgba(255,248,251,0.10)"]}
            style={[StyleSheet.absoluteFill, { opacity: 0.68 * power }]}
          />
          <View
            style={[
              styles.liveGlowOrb,
              styles.liveGlowTopCenter,
              { opacity: 0.20 * power, backgroundColor: "rgba(255,245,248,1)" },
            ]}
          />
          <View style={[styles.faceSoftRing, { opacity: 0.28 * power }]} />
        </>
      );
    case "soft_skin":
      return (
        <>
          <LinearGradient
            colors={["rgba(255,228,234,0.34)", "rgba(255,247,250,0.10)"]}
            style={[StyleSheet.absoluteFill, { opacity: 0.72 * power }]}
          />
          <View style={[styles.faceSoftRing, { opacity: 0.34 * power }]} />
          <View
            style={[
              styles.liveGlowOrb,
              styles.liveGlowBottom,
              { opacity: 0.18 * power, backgroundColor: "rgba(255,232,240,1)" },
            ]}
          />
        </>
      );
    case "bright_eyes":
      return (
        <>
          <LinearGradient
            colors={["rgba(188,225,255,0.20)", "rgba(255,238,245,0.12)"]}
            style={[StyleSheet.absoluteFill, { opacity: 0.60 * power }]}
          />
          <View style={[styles.eyeHighlight, styles.eyeHighlightLeft, { opacity: 0.34 * power }]} />
          <View style={[styles.eyeHighlight, styles.eyeHighlightRight, { opacity: 0.34 * power }]} />
        </>
      );
    case "portrait_glow":
      return (
        <>
          <LinearGradient
            colors={["rgba(255,244,215,0.24)", "rgba(255,220,188,0.10)"]}
            style={[StyleSheet.absoluteFill, { opacity: 0.66 * power }]}
          />
          <View
            style={[
              styles.liveGlowOrb,
              styles.liveGlowTopCenter,
              { opacity: 0.26 * power, backgroundColor: "rgba(255,244,218,1)" },
            ]}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              styles.edgeGlowFrame,
              { borderColor: `rgba(255,233,190,${0.12 + 0.18 * power})` },
            ]}
          />
        </>
      );
    case "blur_background":
      return (
        <>
          <View style={[StyleSheet.absoluteFill, styles.blurOuterMask, { opacity: 0.42 * power }]} />
          <View style={[styles.blurFocusFrame, { opacity: 0.68 * power }]} />
        </>
      );
    case "anime":
      return (
        <>
          <LinearGradient
            colors={["rgba(122,175,255,0.22)", "rgba(255,145,220,0.18)"]}
            style={[StyleSheet.absoluteFill, { opacity: 0.74 * power }]}
          />
          <View style={[StyleSheet.absoluteFill, styles.animeFrame, { opacity: 0.28 * power }]} />
          <View style={[StyleSheet.absoluteFill, styles.animeContrast, { opacity: 0.22 * power }]} />
        </>
      );
    default:
      return null;
  }
}

export function VideoMessageCaptureScreen({
  visible,
  accent,
  usageMode = "video_message",
  onClose,
  onCapture,
}: Props) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView | null>(null);
  const recordingStartRef = useRef(0);
  const cameraReadyAtRef = useRef(0);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingPromiseRef = useRef<Promise<{ uri?: string | null } | undefined> | null>(null);
  const cameraRetryCountRef = useRef(0);
  const cameraRemountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cameraMountVersion, setCameraMountVersion] = useState(0);
  const [cameraSurfaceVisible, setCameraSurfaceVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();

  const [cameraFacing, setCameraFacing] = useState<SabiCameraFacing>("front");
  const [isMirrored, setIsMirrored] = useState(true);

  const [effectId, setEffectId] = useState<VideoEffectId>("beauty");
  const [effectIntensity, setEffectIntensity] = useState(62);
  const [transformId, setTransformId] = useState<AnimeTransformId>("none");

  const [recording, setRecording] = useState(false);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [recordingElapsedMs, setRecordingElapsedMs] = useState(0);
  const [saving, setSaving] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [controlsVisible, setControlsVisible] = useState(true);
  const [effectsVisible, setEffectsVisible] = useState(true);
  const [activeDock, setActiveDock] = useState<ActiveDock>(null);

  const [customCreatorVisible, setCustomCreatorVisible] = useState(false);
  const [customEffectConfig, setCustomEffectConfig] = useState<CustomVideoEffectConfig>(
    DEFAULT_CUSTOM_VIDEO_EFFECT_CONFIG,
  );
  const [customPresetName, setCustomPresetName] = useState("My preset");

  const [savedPresets, setSavedPresets] = useState<SavedVideoPreset[]>(INITIAL_SAVED_VIDEO_PRESETS);
  const [activePresetId, setActivePresetId] = useState<string | null>(
    INITIAL_SAVED_VIDEO_PRESETS[0]?.id ?? null,
  );
  const [presetLibraryVisible, setPresetLibraryVisible] = useState(false);

  const effect = useMemo(() => getVideoEffectPreset(effectId), [effectId]);
  const favoritePresets = useMemo(() => savedPresets.filter((item) => item.isFavorite), [savedPresets]);
  const transformPreset = useMemo(() => getAnimeTransformPreset(transformId), [transformId]);

  const isPhotoMode = usageMode === "photo";
  const effectiveIntensity = effectId === "normal" ? 0 : effectIntensity;
  const mirrorActive = cameraFacing === "front" && isMirrored;
  const recordMuted = false;
  const safeVideoQuality = "480p";
  const cameraMode = isPhotoMode ? "picture" : "video";
  const cameraMountKey = buildSabiCameraMountKey({
    scope: "messenger-capture",
    facing: cameraFacing,
    mode: cameraMode,
    version: cameraMountVersion,
  });

  const remountCameraSurface = useCallback((delayMs = getSabiCameraRemountDelayMs()) => {
    if (cameraRemountTimerRef.current) {
      clearTimeout(cameraRemountTimerRef.current);
      cameraRemountTimerRef.current = null;
    }

    setCameraSurfaceVisible(false);
    setCameraReady(false);
    cameraReadyAtRef.current = 0;

    cameraRemountTimerRef.current = setTimeout(() => {
      cameraRemountTimerRef.current = null;
      setCameraMountVersion((current) => current + 1);
      setCameraSurfaceVisible(true);
    }, delayMs);
  }, []);

  useEffect(() => {
    if (!recording || !recordingStartedAt) {
      setRecordingElapsedMs(0);
      return;
    }

    setRecordingElapsedMs(Date.now() - recordingStartedAt);

    const interval = setInterval(() => {
      setRecordingElapsedMs(Date.now() - recordingStartedAt);
    }, 250);

    return () => clearInterval(interval);
  }, [recording, recordingStartedAt]);

  useEffect(() => {
    if (!visible) return;
    cameraRetryCountRef.current = 0;
    setCameraError(null);
    remountCameraSurface(getSabiCameraRemountDelayMs());
  }, [cameraFacing, isPhotoMode, recordMuted, visible, remountCameraSurface]);

  useEffect(() => {
    if (!visible) {
      setRecording(false);
      setRecordingStartedAt(null);
      setRecordingElapsedMs(0);
      setSaving(false);
      setCameraReady(false);
      setCameraSurfaceVisible(false);
      setCameraError(null);
      cameraReadyAtRef.current = 0;
      recordingStartRef.current = 0;
      recordingPromiseRef.current = null;
      cameraRetryCountRef.current = 0;
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
      }
      if (cameraRemountTimerRef.current) {
        clearTimeout(cameraRemountTimerRef.current);
        cameraRemountTimerRef.current = null;
      }
      return;
    }

    setCameraReady(false);
    setCameraError(null);
    void ensurePermissions();
    remountCameraSurface(getSabiCameraRemountDelayMs());
  }, [visible, remountCameraSurface]);

  const ensurePermissions = async () => {
    let hasCamera = !!cameraPermission?.granted;
    let hasMic = !!microphonePermission?.granted;

    if (!hasCamera) {
      const next = await requestCameraPermission();
      hasCamera = !!next.granted;
    }

    if (!isPhotoMode && !recordMuted && !hasMic) {
      const next = await requestMicrophonePermission();
      hasMic = !!next.granted;
    }

    return isPhotoMode || recordMuted ? hasCamera : hasCamera && hasMic;
  };

  const closeTransientPanels = () => {
    setPresetLibraryVisible(false);
    setCustomCreatorVisible(false);
  };

  const handleCameraMountError = (event: unknown) => {
    const message = normalizeSabiCameraMountError(event);
    setCameraReady(false);
    setCameraError(message);

    if (cameraRetryCountRef.current < 2) {
      cameraRetryCountRef.current += 1;
      remountCameraSurface(getSabiCameraRetryDelayMs());
    }
  };

  const switchCameraFacing = () => {
    if (recording || saving) return;
    setCameraError(null);
    cameraRetryCountRef.current = 0;
    setCameraFacing((current) => toggleSabiCameraFacing(current));
  };

  const applyPreset = (preset: SavedVideoPreset) => {
    setActivePresetId(preset.id);
    setEffectId(preset.effectId);
    setEffectIntensity(preset.effectIntensity);

    if (preset.customConfig) {
      setCustomEffectConfig(preset.customConfig);
    }
  };

  const saveCustomPreset = () => {
    const next = createSavedPresetFromCustom({
      title: customPresetName,
      effectIntensity,
      customConfig: customEffectConfig,
    });

    setSavedPresets((current) => [next, ...current]);
    setActivePresetId(next.id);
  };

  const openDock = (dock: Exclude<ActiveDock, null>) => {
    setActiveDock((current) => (current === dock ? null : dock));
  };

  const handleEffectSelect = (nextEffectId: VideoEffectId) => {
    if (nextEffectId === "custom") {
      setCustomCreatorVisible(true);
      return;
    }

    const nextEffect = getVideoEffectPreset(nextEffectId);
    setEffectId(nextEffectId);
    setEffectIntensity(nextEffect.intensityDefault);
    setActivePresetId(null);
  };

  const handleTakePhoto = async () => {
    if (recording || saving) return;

    const ready = await ensurePermissions();
    if (!ready) {
      Alert.alert("Kamera", "Kameraga ruxsat kerak.");
      return;
    }

    if (!cameraRef.current) {
      Alert.alert("Kamera", "Kamera hali tayyor emas.");
      return;
    }

    try {
      closeTransientPanels();
      setActiveDock(null);
      setSaving(true);

      const result = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: false,
      });

      if (!result?.uri) {
        setSaving(false);
        return;
      }

      onCapture({
        uri: result.uri,
        mediaKind: "photo",
        effectId,
        effectIntensity: effectiveIntensity,
        transformId,
        durationMs: null,
        mirrorActive,
        effectsVisible,
        customEffectConfig: effectId === "custom" ? customEffectConfig : null,
      });

      setSaving(false);
      onClose();
    } catch (error) {
      setSaving(false);
      Alert.alert("Foto kamera", error instanceof Error ? error.message : "Rasmni olish imkoni bo‘lmadi.");
    }
  };

  const finishVideoRecording = async (
    result: { uri?: string | null } | undefined,
    startedAt: number,
  ) => {
    if (!result?.uri) {
      Alert.alert("Video xabar", "Video yozib bo‘lmadi: video fayl yaratilmadi.");
      return;
    }

    try {
      setSaving(true);

      const normalizedUri = await normalizeRecordedVideoFile(result.uri);
      const durationMs = Math.max(MIN_VIDEO_RECORDING_MS, Date.now() - startedAt);
      const mimeType = getVideoCaptureMimeType(normalizedUri);

      onCapture({
        uri: normalizedUri,
        mediaKind: "video",
        effectId,
        effectIntensity: effectiveIntensity,
        transformId,
        durationMs,
        mimeType,
        fileName: getVideoCaptureFileName(normalizedUri),
        mirrorActive,
        effectsVisible,
        customEffectConfig: effectId === "custom" ? customEffectConfig : null,
      });

      onClose();
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error || "");
      Alert.alert(
        "Video xabar",
        reason === "recorded_video_file_empty"
          ? "Video yozib bo‘lmadi: yozilgan fayl bo‘sh."
          : reason === "recorded_video_file_missing"
            ? "Video yozib bo‘lmadi: yozilgan fayl yaratilmadi."
            : "Video yozib bo‘lmadi. Qayta yozib ko‘ring.",
      );
    } finally {
      setSaving(false);
    }
  };

  const resetRecordingState = () => {
    setRecording(false);
    setRecordingStartedAt(null);
    setRecordingElapsedMs(0);
    recordingStartRef.current = 0;
    recordingPromiseRef.current = null;

    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  };

  const handleStartRecording = async () => {
    if (recording || saving || recordingPromiseRef.current) return;

    const ready = await ensurePermissions();
    if (!ready) {
      Alert.alert("Kamera", recordMuted ? "Kameraga ruxsat kerak." : "Kamera va mikrofonga ruxsat kerak.");
      return;
    }

    if (!cameraRef.current) {
      Alert.alert("Kamera", "Kamera hali tayyor emas.");
      return;
    }

    if (!cameraReady) {
      Alert.alert("Video xabar", cameraError || "Kamera ishga tushmoqda. Birozdan keyin qayta urinib ko‘ring.");
      return;
    }

    if (cameraReadyAtRef.current && Date.now() - cameraReadyAtRef.current < 650) {
      Alert.alert("Video xabar", "Kamera tayyorlanmoqda. Birozdan keyin qayta urinib ko‘ring.");
      return;
    }

    const camera = cameraRef.current as CameraView & {
      recordAsync?: (options?: Record<string, unknown>) => Promise<{ uri?: string | null } | undefined>;
      stopRecording?: () => void | Promise<void>;
    };

    if (typeof camera.recordAsync !== "function" || typeof camera.stopRecording !== "function") {
      Alert.alert("Video xabar", "Ilova ichidagi video yozish bu buildda mavjud emas.");
      return;
    }

    const startedAt = Date.now();

    try {
      closeTransientPanels();
      setActiveDock(null);
      setRecordingElapsedMs(0);
      setRecording(true);
      setRecordingStartedAt(startedAt);
      recordingStartRef.current = startedAt;

      const recordPromise = camera.recordAsync({
        maxDuration: MAX_VIDEO_RECORDING_SECONDS,
      });

      recordingPromiseRef.current = recordPromise;

      const result = await recordPromise;
      await finishVideoRecording(result, startedAt);
    } catch (error) {
      const details = error instanceof Error && error.message.trim()
        ? error.message.trim()
        : String(error || "").trim();

      const normalizedDetails = details.replace(/^video recording failed:?\s*/i, "").trim();
      Alert.alert(
        "Video xabar",
        normalizedDetails
          ? `Video yozib bo‘lmadi: ${normalizedDetails}`
          : "Video yozib bo‘lmadi. Kamerani bir marta almashtirib, qayta urinib ko‘ring.",
      );
    } finally {
      resetRecordingState();
      setSaving(false);
    }
  };

  const handleStopRecording = async () => {
    if (!recording || !cameraRef.current) return;

    const elapsed = recordingStartRef.current ? Date.now() - recordingStartRef.current : MIN_VIDEO_RECORDING_MS;
    const delayMs = Math.max(0, MIN_VIDEO_RECORDING_MS - elapsed);

    const stop = async () => {
      stopTimerRef.current = null;
      try {
        await (cameraRef.current as any).stopRecording?.();
      } catch (error) {
        resetRecordingState();
        const details = error instanceof Error && error.message.trim() ? error.message.trim() : "";
        Alert.alert("Video xabar", details ? `Videoni to‘xtatib bo‘lmadi: ${details}` : "Videoni to‘xtatib bo‘lmadi.");
      }
    };

    if (delayMs > 0) {
      if (!stopTimerRef.current) {
        stopTimerRef.current = setTimeout(() => {
          void stop();
        }, delayMs);
      }
      return;
    }

    await stop();
  };

  const handlePrimaryCapture = () => {
    if (isPhotoMode) {
      void handleTakePhoto();
      return;
    }

    if (recording) {
      void handleStopRecording();
    } else {
      void handleStartRecording();
    }
  };

  const recordingSeconds = Math.max(0, Math.floor(recordingElapsedMs / 1000));

  const titleMap = {
    video_message: "Video xabar kamerasi",
    photo: "Foto kamera",
    stream: "Strim kamera",
  } as const;

  const subtitleText = isPhotoMode
    ? cameraFacing === "front"
      ? mirrorActive
        ? "Oynali ko‘rinish"
        : "Oddiy ko‘rinish"
      : "Orqa kamera"
    : recording
      ? "To‘xtatish uchun yozish tugmasini yana bosing"
      : cameraFacing === "front"
        ? mirrorActive
          ? "Oynali ko‘rinish"
          : "Oddiy ko‘rinish"
        : "Orqa kamera";

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.root}>
        {cameraSurfaceVisible ? (
          <CameraView
            key={cameraMountKey}
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={cameraFacing}
            mirror={isPhotoMode ? mirrorActive : false}
            mode={cameraMode as any}
            mute={!isPhotoMode && recordMuted}
            {...(!isPhotoMode && cameraFacing === "front" ? { videoQuality: safeVideoQuality as any } : {})}
            onCameraReady={() => {
              cameraRetryCountRef.current = 0;
              cameraReadyAtRef.current = Date.now();
              setCameraReady(true);
              setCameraError(null);
            }}
            onMountError={handleCameraMountError}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.cameraBootSurface]} />
        )}

        {effectsVisible ? renderLiveEffectOverlay(effectId, effectiveIntensity, customEffectConfig) : null}
        {effectsVisible ? (
          <VideoTransformOverlay effectId={transformId} visible={isAnimatedTransform(transformId)} />
        ) : null}

        {cameraError ? (
          <View pointerEvents="box-none" style={styles.cameraRecoverOverlay}>
            <View style={styles.cameraRecoverCard}>
              <Ionicons name="camera-reverse-outline" size={24} color="#F6FFF9" />
              <Text style={styles.cameraRecoverTitle}>Camera is not ready</Text>
              <Text style={styles.cameraRecoverText} numberOfLines={3}>{cameraError}</Text>
              <View style={styles.cameraRecoverActions}>
                <Pressable onPress={() => { cameraRetryCountRef.current = 0; setCameraError(null); remountCameraSurface(getSabiCameraRetryDelayMs()); }} style={styles.cameraRecoverButton}>
                  <Text style={styles.cameraRecoverButtonText}>Retry</Text>
                </Pressable>
                <Pressable onPress={switchCameraFacing} style={styles.cameraRecoverButtonSecondary}>
                  <Text style={styles.cameraRecoverButtonText}>Switch</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}

        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            if (!recording && !saving) {
              setControlsVisible((current) => !current);
            }
          }}
        />

        {controlsVisible ? (
          <>
            <Pressable
              onPress={() => {
                if (recording || saving) return;
                onClose();
              }}
              style={[
                styles.topCornerButton,
                styles.topLeft,
                { top: insets.top + 6 },
                recording || saving ? styles.topCornerButtonDisabled : undefined,
              ]}
            >
              <Ionicons name="close" size={22} color="#F6FFF9" />
            </Pressable>

            <Pressable
              onPress={switchCameraFacing}
              disabled={recording || saving}
              style={[
                styles.topCornerButton,
                styles.topRight,
                { top: insets.top + 6 },
                recording || saving ? styles.topCornerButtonDisabled : undefined,
              ]}
            >
              <Ionicons name="camera-reverse-outline" size={20} color="#F6FFF9" />
            </Pressable>

            <View style={[styles.topCenterLabel, { top: insets.top + 10 }] }>
              <Text style={styles.topTitle}>{titleMap[usageMode]}</Text>
              <Text style={styles.topSubtitle}>{subtitleText}</Text>
            </View>

            {!recording ? (
              <View style={[styles.bottomOverlay, { paddingBottom: Math.max(insets.bottom, 18) }] }>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryPill}>
                    <Ionicons name="color-filter-outline" size={12} color={accent} />
                    <Text style={styles.summaryText}>{effect.title}</Text>
                  </View>

                  <View style={styles.summaryPill}>
                    <Ionicons
                      name="sparkles-outline"
                      size={12}
                      color={transformId === "none" ? "rgba(232,255,246,0.62)" : accent}
                    />
                    <Text style={styles.summaryText}>
                      {transformPreset ? transformPreset.title : "Anime transformatsiya yo‘q"}
                    </Text>
                  </View>
                </View>

                <View style={styles.utilityRow}>
                  <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.utilityScroll}>
                    {cameraFacing === "front" ? (
                      <Pressable onPress={() => setIsMirrored((current) => !current)} style={styles.utilityWrap}>
                        <LinearGradient
                          colors={
                            mirrorActive
                              ? ["rgba(126,192,173,0.96)", "rgba(44,82,71,0.88)"]
                              : ["rgba(17,30,27,0.92)", "rgba(7,18,16,0.86)"]
                          }
                          style={styles.utilityPill}
                        >
                          <Ionicons
                            name="swap-horizontal-outline"
                            size={12}
                            color={mirrorActive ? "#071711" : "#F6FFF9"}
                          />
                          <Text style={[styles.utilityText, mirrorActive ? styles.utilityTextActive : undefined]}>
                            {mirrorActive ? "Oyna" : "Oddiy"}
                          </Text>
                        </LinearGradient>
                      </Pressable>
                    ) : null}

                    <Pressable onPress={() => setEffectsVisible((current) => !current)} style={styles.utilityWrap}>
                      <LinearGradient
                        colors={
                          effectsVisible
                            ? ["rgba(126,192,173,0.96)", "rgba(44,82,71,0.88)"]
                            : ["rgba(17,30,27,0.92)", "rgba(7,18,16,0.86)"]
                        }
                        style={styles.utilityPill}
                      >
                        <Ionicons
                          name={effectsVisible ? "eye-outline" : "eye-off-outline"}
                          size={12}
                          color={effectsVisible ? "#071711" : "#F6FFF9"}
                        />
                        <Text style={[styles.utilityText, effectsVisible ? styles.utilityTextActive : undefined]}>
                          {effectsVisible ? "FX yoqilgan" : "FX o‘chirilgan"}
                        </Text>
                      </LinearGradient>
                    </Pressable>

                    <Pressable onPress={() => openDock("looks")} style={styles.utilityWrap}>
                      <LinearGradient
                        colors={
                          activeDock === "looks"
                            ? ["rgba(126,192,173,0.96)", "rgba(44,82,71,0.88)"]
                            : ["rgba(17,30,27,0.92)", "rgba(7,18,16,0.86)"]
                        }
                        style={styles.utilityPill}
                      >
                        <Ionicons
                          name="images-outline"
                          size={12}
                          color={activeDock === "looks" ? "#071711" : "#F6FFF9"}
                        />
                        <Text style={[styles.utilityText, activeDock === "looks" ? styles.utilityTextActive : undefined]}>
                          Looks
                        </Text>
                      </LinearGradient>
                    </Pressable>

                    <Pressable onPress={() => openDock("strength")} style={styles.utilityWrap}>
                      <LinearGradient
                        colors={
                          activeDock === "strength"
                            ? ["rgba(126,192,173,0.96)", "rgba(44,82,71,0.88)"]
                            : ["rgba(17,30,27,0.92)", "rgba(7,18,16,0.86)"]
                        }
                        style={styles.utilityPill}
                      >
                        <Ionicons
                          name="options-outline"
                          size={12}
                          color={activeDock === "strength" ? "#071711" : "#F6FFF9"}
                        />
                        <Text style={[styles.utilityText, activeDock === "strength" ? styles.utilityTextActive : undefined]}>
                          Strength
                        </Text>
                      </LinearGradient>
                    </Pressable>

                    <Pressable onPress={() => openDock("anime")} style={styles.utilityWrap}>
                      <LinearGradient
                        colors={
                          activeDock === "anime"
                            ? ["rgba(126,192,173,0.96)", "rgba(44,82,71,0.88)"]
                            : ["rgba(17,30,27,0.92)", "rgba(7,18,16,0.86)"]
                        }
                        style={styles.utilityPill}
                      >
                        <Ionicons
                          name="sparkles-outline"
                          size={12}
                          color={activeDock === "anime" ? "#071711" : "#F6FFF9"}
                        />
                        <Text style={[styles.utilityText, activeDock === "anime" ? styles.utilityTextActive : undefined]}>
                          Anime
                        </Text>
                      </LinearGradient>
                    </Pressable>

                    <Pressable onPress={() => openDock("presets")} style={styles.utilityWrap}>
                      <LinearGradient
                        colors={
                          activeDock === "presets"
                            ? ["rgba(126,192,173,0.96)", "rgba(44,82,71,0.88)"]
                            : ["rgba(17,30,27,0.92)", "rgba(7,18,16,0.86)"]
                        }
                        style={styles.utilityPill}
                      >
                        <Ionicons
                          name="star-outline"
                          size={12}
                          color={activeDock === "presets" ? "#071711" : "#F6FFF9"}
                        />
                        <Text style={[styles.utilityText, activeDock === "presets" ? styles.utilityTextActive : undefined]}>
                          Presets
                        </Text>
                      </LinearGradient>
                    </Pressable>

                    <Pressable onPress={() => setCustomCreatorVisible(true)} style={styles.utilityWrap}>
                      <LinearGradient
                        colors={
                          effectId === "custom"
                            ? ["rgba(126,192,173,0.96)", "rgba(44,82,71,0.88)"]
                            : ["rgba(17,30,27,0.92)", "rgba(7,18,16,0.86)"]
                        }
                        style={styles.utilityPill}
                      >
                        <Ionicons
                          name="brush-outline"
                          size={12}
                          color={effectId === "custom" ? "#071711" : "#F6FFF9"}
                        />
                        <Text style={[styles.utilityText, effectId === "custom" ? styles.utilityTextActive : undefined]}>
                          Build
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </ScrollView>
                </View>

                {activeDock === "looks" ? (
                  <View style={styles.contextCard}>
                    <View style={styles.contextHeader}>
                      <Text style={styles.contextTitle}>Top filters</Text>
                      <Text style={styles.contextSubtitle}>Clean camera filters only, no fake face overlays</Text>
                    </View>

                    <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.looksScroll}>
                      {VIDEO_EFFECT_PRESETS.map((item) => {
                        const active = item.id === effectId;

                        return (
                          <Pressable key={item.id} onPress={() => handleEffectSelect(item.id)} style={styles.lookCardWrap}>
                            <LinearGradient
                              colors={
                                active
                                  ? ["rgba(126,192,173,0.96)", "rgba(44,82,71,0.88)"]
                                  : ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.03)"]
                              }
                              style={styles.lookCard}
                            >
                              <Text style={[styles.lookTitle, active ? styles.lookTitleActive : undefined]}>
                                {item.title}
                              </Text>
                              <Text style={[styles.lookSubtitle, active ? styles.lookSubtitleActive : undefined]}>
                                {item.subtitle}
                              </Text>
                              {item.badge ? (
                                <View style={styles.lookBadge}>
                                  <Text style={styles.lookBadgeText}>{item.badge}</Text>
                                </View>
                              ) : null}
                            </LinearGradient>
                          </Pressable>
                        );
                      })}
                    </ScrollView>

                    <View style={styles.featuredRow}>
                      {GIRLS_FOCUSED_EFFECTS.map((itemId) => {
                        const item = getVideoEffectPreset(itemId);
                        const active = itemId === effectId;

                        return (
                          <Pressable key={itemId} onPress={() => handleEffectSelect(itemId)} style={styles.featuredWrap}>
                            <LinearGradient
                              colors={
                                active
                                  ? ["rgba(126,192,173,0.96)", "rgba(44,82,71,0.88)"]
                                  : ["rgba(17,30,27,0.92)", "rgba(7,18,16,0.86)"]
                              }
                              style={styles.featuredPill}
                            >
                              <Text style={[styles.featuredText, active ? styles.featuredTextActive : undefined]}>
                                {item.title}
                              </Text>
                            </LinearGradient>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : null}

                {activeDock === "anime" ? (
                  <View style={styles.contextCard}>
                    <View style={styles.contextHeader}>
                      <Text style={styles.contextTitle}>Anime transformatsiya</Text>
                      <Text style={styles.contextSubtitle}>Soxta yuz maskalarisiz yuqori qatlam effektlari</Text>
                    </View>

                    <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.looksScroll}>
                      <Pressable onPress={() => setTransformId("none")} style={styles.lookCardWrap}>
                        <LinearGradient
                          colors={
                            transformId === "none"
                              ? ["rgba(126,192,173,0.96)", "rgba(44,82,71,0.88)"]
                              : ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.03)"]
                          }
                          style={styles.lookCard}
                        >
                          <Text style={[styles.lookTitle, transformId === "none" ? styles.lookTitleActive : undefined]}>
                            None
                          </Text>
                          <Text
                            style={[
                              styles.lookSubtitle,
                              transformId === "none" ? styles.lookSubtitleActive : undefined,
                            ]}
                          >
                            clean frame only
                          </Text>
                        </LinearGradient>
                      </Pressable>

                      {ANIME_TRANSFORM_PRESETS.map((item) => {
                        const active = item.id === transformId;

                        return (
                          <Pressable key={item.id} onPress={() => setTransformId(item.id)} style={styles.lookCardWrap}>
                            <LinearGradient
                              colors={
                                active
                                  ? ["rgba(126,192,173,0.96)", "rgba(44,82,71,0.88)"]
                                  : ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.03)"]
                              }
                              style={styles.lookCard}
                            >
                              <Text style={[styles.lookTitle, active ? styles.lookTitleActive : undefined]}>
                                {item.title}
                              </Text>
                              <Text style={[styles.lookSubtitle, active ? styles.lookSubtitleActive : undefined]}>
                                {item.subtitle}
                              </Text>
                              {item.badge ? (
                                <View style={styles.lookBadge}>
                                  <Text style={styles.lookBadgeText}>{item.badge}</Text>
                                </View>
                              ) : null}
                            </LinearGradient>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                ) : null}

                {activeDock === "presets" ? (
                  <View style={styles.contextCard}>
                    <View style={styles.contextHeaderRow}>
                      <View style={styles.contextHeaderTextWrap}>
                        <Text style={styles.contextTitle}>Sozlamalar kutubxonasi</Text>
                        <Text style={styles.contextSubtitle}>Sevimlilar ekranda, to‘liq ro‘yxat kutubxonada</Text>
                      </View>

                      <Pressable onPress={() => setPresetLibraryVisible(true)} style={styles.contextActionWrap}>
                        <View style={styles.contextActionButton}>
                          <Text style={styles.contextActionText}>Kutubxona</Text>
                        </View>
                      </Pressable>
                    </View>

                    <View style={styles.featuredRow}>
                      {favoritePresets.slice(0, 4).map((preset) => {
                        const active = preset.id === activePresetId;

                        return (
                          <Pressable key={preset.id} onPress={() => applyPreset(preset)} style={styles.featuredWrap}>
                            <LinearGradient
                              colors={
                                active
                                  ? ["rgba(126,192,173,0.96)", "rgba(44,82,71,0.88)"]
                                  : ["rgba(17,30,27,0.92)", "rgba(7,18,16,0.86)"]
                              }
                              style={styles.featuredPill}
                            >
                              <Text style={[styles.featuredText, active ? styles.featuredTextActive : undefined]}>
                                {preset.title}
                              </Text>
                            </LinearGradient>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : null}

                {activeDock === "strength" ? (
                  <View style={styles.contextCard}>
                    <View style={styles.contextHeader}>
                      <Text style={styles.contextTitle}>{effect.title}</Text>
                      <Text style={styles.contextSubtitle}>
                        {effectId === "normal" ? "Oddiy rejimda kuch yo‘q" : `${effectiveIntensity}% kuch`}
                      </Text>
                    </View>

                    <Slider
                      value={effectiveIntensity}
                      minimumValue={effect.minIntensity ?? 0}
                      maximumValue={effect.maxIntensity ?? 100}
                      disabled={effectId === "normal"}
                      onValueChange={(value) => setEffectIntensity(Math.round(value))}
                      minimumTrackTintColor={effectId === "normal" ? "rgba(255,255,255,0.18)" : accent}
                      maximumTrackTintColor="rgba(255,255,255,0.14)"
                    />
                  </View>
                ) : null}

                <View style={styles.bottomControlsRow}>
                  <View style={styles.bottomHintPill}>
                    <Ionicons
                      name={isPhotoMode ? "camera-outline" : "videocam-outline"}
                      size={14}
                      color={accent}
                    />
                    <Text style={styles.bottomHintText}>{isPhotoMode ? "Rasm olish uchun bosing" : "Yozish uchun bosing"}</Text>
                  </View>

                  <Pressable onPress={handlePrimaryCapture} style={styles.recordWrap} disabled={saving}>
                    <LinearGradient
                      colors={isPhotoMode ? ["rgba(255,255,255,0.98)", "rgba(230,240,236,0.94)"] : ["rgba(255,255,255,0.95)", "rgba(214,228,221,0.90)"]}
                      style={styles.recordButton}
                    >
                      {saving ? (
                        <ActivityIndicator color="#071711" />
                      ) : isPhotoMode ? (
                        <View style={styles.photoCenter} />
                      ) : (
                        <View style={styles.recordCenter} />
                      )}
                    </LinearGradient>
                  </Pressable>

                  <View style={styles.bottomMetaPill}>
                    <Text style={styles.bottomMetaText}>{transformPreset ? transformPreset.title : "Ready"}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={[styles.recordingOverlay, { top: insets.top + 10, paddingBottom: Math.max(insets.bottom, 18) }]}>
                <View style={styles.recordingTopPill}>
                  <Ionicons name="radio-button-on" size={14} color="#FFDADA" />
                  <Text style={styles.recordingTopText}>{recordingSeconds}s</Text>
                </View>

                <View style={styles.recordingBottomRow}>
                  <View style={[styles.bottomHintPill, styles.bottomHintPillRecording]}>
                    <Ionicons name="radio-button-on" size={14} color="#FFDADA" />
                    <Text style={styles.bottomHintText}>Tap to stop</Text>
                  </View>

                  <Pressable onPress={handlePrimaryCapture} style={styles.recordWrap} disabled={saving}>
                    <LinearGradient
                      colors={["rgba(255,114,114,0.98)", "rgba(144,42,42,0.92)"]}
                      style={styles.recordButton}
                    >
                      <View style={styles.recordingDot} />
                    </LinearGradient>
                  </Pressable>

                  <View style={[styles.bottomMetaPill, styles.bottomMetaPillRecording]}>
                    <Text style={styles.bottomMetaText}>{recordingSeconds}s</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        ) : recording ? (
          <View style={[styles.minimalHud, { top: insets.top + 10 }]}>
            <View style={styles.minimalHudPill}>
              <Ionicons name="radio-button-on" size={14} color="#FFDADA" />
              <Text style={styles.minimalHudText}>{recordingSeconds}s</Text>
            </View>
          </View>
        ) : null}

        <VideoEffectCreatorSheet
          visible={customCreatorVisible}
          accent={accent}
          value={customEffectConfig}
          presetName={customPresetName}
          onPresetNameChange={setCustomPresetName}
          onChange={setCustomEffectConfig}
          onClose={() => setCustomCreatorVisible(false)}
          onApply={() => {
            setEffectId("custom");
            setActivePresetId(null);
            setActiveDock("strength");
            setCustomCreatorVisible(false);
          }}
          onSavePreset={() => {
            saveCustomPreset();
            setEffectId("custom");
            setActiveDock("presets");
            setCustomCreatorVisible(false);
          }}
        />

        <VideoPresetLibrarySheet
          visible={presetLibraryVisible}
          accent={accent}
          presets={savedPresets}
          activePresetId={activePresetId}
          onClose={() => setPresetLibraryVisible(false)}
          onSelect={(preset) => {
            applyPreset(preset);
            setPresetLibraryVisible(false);
          }}
          onToggleFavorite={(presetId) =>
            setSavedPresets((current) =>
              current.map((item) =>
                item.id === presetId ? { ...item, isFavorite: !item.isFavorite } : item,
              ),
            )
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cameraBootSurface: {
    backgroundColor: "#040B0A",
  },
  cameraRecoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
    backgroundColor: "rgba(2,8,8,0.20)",
  },
  cameraRecoverCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    padding: 18,
    alignItems: "center",
    gap: 9,
    backgroundColor: "rgba(5,18,16,0.84)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  cameraRecoverTitle: {
    color: "#F6FFF9",
    fontSize: 16,
    fontWeight: "900",
  },
  cameraRecoverText: {
    color: "rgba(246,255,249,0.72)",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  cameraRecoverActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  cameraRecoverButton: {
    minWidth: 96,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    backgroundColor: "rgba(30,215,165,0.24)",
    borderWidth: 1,
    borderColor: "rgba(30,215,165,0.34)",
  },
  cameraRecoverButtonSecondary: {
    minWidth: 96,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  cameraRecoverButtonText: {
    color: "#F6FFF9",
    fontSize: 12,
    fontWeight: "900",
  },
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  topCornerButton: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(7,18,16,0.72)",
    borderWidth: 1,
    borderColor: "rgba(170,255,224,0.14)",
    zIndex: 5,
  },
  topCornerButtonDisabled: {
    opacity: 0.42,
  },
  topLeft: { left: 14 },
  topRight: { right: 14 },
  topCenterLabel: {
    position: "absolute",
    left: 72,
    right: 72,
    alignItems: "center",
  },
  topTitle: {
    color: "#F6FFF9",
    fontSize: 15,
    fontWeight: "900",
  },
  topSubtitle: {
    marginTop: 2,
    color: "rgba(232,255,246,0.72)",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  bottomOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  summaryRow: {
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "48%",
    marginRight: 8,
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(7,18,16,0.74)",
    borderWidth: 1,
    borderColor: "rgba(170,255,224,0.12)",
  },
  summaryText: {
    marginLeft: 6,
    color: "#F6FFF9",
    fontSize: 10,
    fontWeight: "900",
  },
  utilityRow: {
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  utilityScroll: {
    paddingRight: 8,
  },
  utilityWrap: {
    marginRight: 8,
  },
  utilityPill: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  utilityText: {
    marginLeft: 6,
    color: "#F6FFF9",
    fontSize: 10,
    fontWeight: "900",
  },
  utilityTextActive: {
    color: "#071711",
  },
  contextCard: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "rgba(7,18,16,0.80)",
    borderWidth: 1,
    borderColor: "rgba(170,255,224,0.12)",
  },
  contextHeader: {
    marginBottom: 10,
  },
  contextHeaderRow: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  contextHeaderTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  contextTitle: {
    color: "#F6FFF9",
    fontSize: 12,
    fontWeight: "900",
  },
  contextSubtitle: {
    marginTop: 2,
    color: "rgba(232,255,246,0.68)",
    fontSize: 10,
    fontWeight: "700",
  },
  contextActionWrap: {
    borderRadius: 999,
    overflow: "hidden",
  },
  contextActionButton: {
    minHeight: 28,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  contextActionText: {
    color: "rgba(232,255,246,0.82)",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  looksScroll: {
    paddingRight: 8,
  },
  lookCardWrap: {
    width: 150,
    marginRight: 8,
    borderRadius: 18,
    overflow: "hidden",
  },
  lookCard: {
    minHeight: 92,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(170,255,224,0.10)",
  },
  lookTitle: {
    color: "#F6FFF9",
    fontSize: 12,
    fontWeight: "900",
  },
  lookTitleActive: {
    color: "#071711",
  },
  lookSubtitle: {
    marginTop: 2,
    color: "rgba(232,255,246,0.70)",
    fontSize: 10,
    fontWeight: "700",
  },
  lookSubtitleActive: {
    color: "rgba(7,23,17,0.72)",
  },
  lookBadge: {
    alignSelf: "flex-start",
    marginTop: 7,
    minHeight: 18,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  lookBadgeText: {
    color: "#F6FFF9",
    fontSize: 8,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  featuredRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 10,
  },
  featuredWrap: {
    marginRight: 8,
    marginBottom: 8,
  },
  featuredPill: {
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  featuredText: {
    color: "#F6FFF9",
    fontSize: 10,
    fontWeight: "900",
  },
  featuredTextActive: {
    color: "#071711",
  },
  bottomControlsRow: {
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomHintPill: {
    minWidth: 108,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(7,18,16,0.74)",
    borderWidth: 1,
    borderColor: "rgba(170,255,224,0.12)",
  },
  bottomHintPillRecording: {
    borderColor: "rgba(255,180,180,0.22)",
  },
  bottomHintText: {
    marginLeft: 7,
    color: "#F6FFF9",
    fontSize: 11,
    fontWeight: "800",
  },
  recordWrap: {
    marginHorizontal: 10,
  },
  recordButton: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
  },
  recordCenter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF5A5A",
  },
  photoCenter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: "#071711",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  recordingDot: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  bottomMetaPill: {
    minWidth: 92,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(7,18,16,0.74)",
    borderWidth: 1,
    borderColor: "rgba(170,255,224,0.12)",
  },
  bottomMetaPillRecording: {
    borderColor: "rgba(255,180,180,0.22)",
  },
  bottomMetaText: {
    color: "rgba(232,255,246,0.82)",
    fontSize: 11,
    fontWeight: "800",
  },
  recordingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    pointerEvents: "box-none",
  },
  recordingTopPill: {
    alignSelf: "center",
    minWidth: 86,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(7,18,16,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,180,180,0.22)",
  },
  recordingTopText: {
    marginLeft: 6,
    color: "#F6FFF9",
    fontSize: 11,
    fontWeight: "900",
  },
  recordingBottomRow: {
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  minimalHud: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  minimalHudPill: {
    minWidth: 84,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(7,18,16,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,180,180,0.22)",
  },
  minimalHudText: {
    marginLeft: 6,
    color: "#F6FFF9",
    fontSize: 11,
    fontWeight: "900",
  },
  liveGlowOrb: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 240,
  },
  liveGlowTopRight: { top: -40, right: -36 },
  liveGlowLeft: { top: 180, left: -72 },
  liveGlowTopCenter: { top: -36, left: 40, right: 40, height: 220, borderRadius: 180 },
  liveGlowBottom: { bottom: -60, left: 16, right: 16, height: 220, borderRadius: 160 },
  cinemaBar: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: "#070707",
  },
  cinemaBarTop: { top: 0 },
  cinemaBarBottom: { bottom: 0 },
  darkVignette: { backgroundColor: "rgba(0,0,0,0.16)" },
  vividFrame: { borderWidth: 12, borderColor: "rgba(255,255,255,0.10)" },
  edgeGlowFrame: { borderWidth: 18 },
  faceSoftRing: {
    position: "absolute",
    left: "19%",
    top: "16%",
    width: "62%",
    height: "64%",
    borderRadius: 36,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.30)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  eyeHighlight: {
    position: "absolute",
    top: "33%",
    width: 54,
    height: 22,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.56)",
  },
  eyeHighlightLeft: { left: "31%" },
  eyeHighlightRight: { right: "31%" },
  blurOuterMask: { backgroundColor: "rgba(0,0,0,0.14)" },
  blurFocusFrame: {
    position: "absolute",
    left: "18%",
    top: "14%",
    width: "64%",
    height: "68%",
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  animeFrame: { borderWidth: 10, borderColor: "rgba(255,255,255,0.16)" },
  animeContrast: { backgroundColor: "rgba(0,0,0,0.10)" },
  customContrastOverlay: { backgroundColor: "rgba(0,0,0,0.12)" },
  customSaturationOverlay: { borderWidth: 8, borderColor: "rgba(255,255,255,0.10)" },
  monochromeOverlay: { backgroundColor: "rgba(128,128,128,0.24)" },
});

