import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

import { aiMobileApi } from "../aiMobileApi";
import type { AiMobileApiError, AiMobileApiResult } from "../aiMobileTypes";
import type {
  AiVoicePlaybackCommand,
  AiVoiceRecordingAsset,
  AiVoiceRequestTtsInput,
  AiVoiceSubmitTranscriptInput,
} from "./aiVoiceBridgeTypes";

let activeRecording: any | null = null;
let activeSound: any | null = null;

const SABI_FEMALE_VOICE_PROFILE = {
  preferredVoiceGender: "female",
  voiceStyle: "sabi_ai_female_warm",
  voiceName: "Sabi AI",
  speakingRate: 0.96,
  pitch: 1.05,
  volume: 1,
  purpose: "live_voice_translation",
  noFakePlayback: true,
} as const;

function nowIso() {
  return new Date().toISOString();
}

function createError(code: string, message: string): AiMobileApiError {
  return { code, message };
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toStringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function toNumberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizePlaybackCommand(rawValue: unknown): AiVoicePlaybackCommand {
  const root = toRecord(rawValue) ?? {};
  const data = toRecord(root.data) ?? root;
  const command = toRecord(data.command) ?? toRecord(data.playback) ?? data;

  return {
    commandId:
      toStringValue(command.commandId) ||
      toStringValue(command.id) ||
      toStringValue(command.playbackId) ||
      null,
    sessionId: toStringValue(command.sessionId) || null,
    text:
      toStringValue(command.text) ||
      toStringValue(command.outputText) ||
      toStringValue(command.message) ||
      null,
    audioUrl:
      toStringValue(command.audioUrl) ||
      toStringValue(command.url) ||
      toStringValue(command.audio) ||
      toStringValue(command.fileUrl) ||
      null,
    language:
      toStringValue(command.language) ||
      toStringValue(command.locale) ||
      null,
    status: "ready",
    raw: command,
  };
}

async function configureAudioModeForRecording() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

async function configureAudioModeForPlayback() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

async function getFileSize(uri: string): Promise<number | null> {
  try {
    const info = await FileSystem.getInfoAsync(uri);

    if (info.exists && typeof info.size === "number") {
      return info.size;
    }
  } catch {
    return null;
  }

  return null;
}

async function readBase64(uri: string): Promise<string | null> {
  try {
    const base64ReadOptions = {
      encoding: "base64",
    } as unknown as Parameters<typeof FileSystem.readAsStringAsync>[1];

    return await FileSystem.readAsStringAsync(uri, base64ReadOptions);
  } catch {
    return null;
  }
}

function makeRecordingFileName(uri: string) {
  const fromUri = uri.split("/").filter(Boolean).pop();

  if (fromUri && fromUri.includes(".")) {
    return fromUri;
  }

  return `sabi-ai-voice-${Date.now()}.m4a`;
}

export const aiVoiceMobileBridge = {
  bindNativeBridge: async () => {
    return aiMobileApi.bindNativeVoiceBridge({
      bridge: "expo-av-mobile-voice-bridge",
      capabilities: {
        audioRecording: true,
        audioUrlPlayback: true,
        liveVoiceTranslation: true,
        localSpeechRecognition: false,
        localTextToSpeech: false,
        pleasantFemaleVoice: true,
        preferredVoiceGender: SABI_FEMALE_VOICE_PROFILE.preferredVoiceGender,
        voiceStyle: SABI_FEMALE_VOICE_PROFILE.voiceStyle,
        voiceName: SABI_FEMALE_VOICE_PROFILE.voiceName,
        noFakePlayback: true,
      },
    });
  },

  requestRecordingPermission: async (): Promise<AiMobileApiResult<{ granted: boolean }>> => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      const granted = Boolean(permission.granted);

      if (!granted) {
        return {
          ok: false,
          error: createError(
            "ai_voice_microphone_permission_denied",
            "Microphone permission was denied.",
          ),
        };
      }

      return { ok: true, data: { granted } };
    } catch (error) {
      return {
        ok: false,
        error: createError(
          "ai_voice_microphone_permission_failed",
          error instanceof Error ? error.message : String(error ?? "permission failed"),
        ),
      };
    }
  },

  startRecording: async (
    sessionId?: string | null,
  ): Promise<AiMobileApiResult<{ startedAt: string }>> => {
    if (activeRecording) {
      return {
        ok: false,
        error: createError(
          "ai_voice_recording_already_active",
          "Voice recording is already active.",
        ),
      };
    }

    const permission = await aiVoiceMobileBridge.requestRecordingPermission();
    if (!permission.ok) return { ok: false, error: permission.error };

    try {
      await configureAudioModeForRecording();

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      activeRecording = recording;

      const startedAt = nowIso();

      await aiMobileApi.sendNativeVoiceEvent({
        type: "recording_started",
        sessionId,
        payload: {
          startedAt,
          bridge: "expo-av",
          purpose: SABI_FEMALE_VOICE_PROFILE.purpose,
          preferredVoiceGender: SABI_FEMALE_VOICE_PROFILE.preferredVoiceGender,
          voiceStyle: SABI_FEMALE_VOICE_PROFILE.voiceStyle,
          voiceName: SABI_FEMALE_VOICE_PROFILE.voiceName,
        },
      });

      return { ok: true, data: { startedAt } };
    } catch (error) {
      activeRecording = null;

      return {
        ok: false,
        error: createError(
          "ai_voice_recording_start_failed",
          error instanceof Error ? error.message : String(error ?? "recording start failed"),
        ),
      };
    }
  },

  stopRecording: async (
    sessionId?: string | null,
    options?: { includeBase64?: boolean },
  ): Promise<AiMobileApiResult<AiVoiceRecordingAsset>> => {
    const recording = activeRecording;

    if (!recording) {
      return {
        ok: false,
        error: createError(
          "ai_voice_recording_not_active",
          "Voice recording is not active.",
        ),
      };
    }

    try {
      const statusBeforeStop = await recording.getStatusAsync();

      await recording.stopAndUnloadAsync();
      activeRecording = null;
      await configureAudioModeForPlayback();

      const uri = recording.getURI();

      if (!uri) {
        return {
          ok: false,
          error: createError(
            "ai_voice_recording_uri_missing",
            "Recorded audio URI is missing.",
          ),
        };
      }

      const asset: AiVoiceRecordingAsset = {
        uri,
        fileName: makeRecordingFileName(uri),
        mimeType: "audio/m4a",
        durationMillis: toNumberValue(statusBeforeStop.durationMillis),
        sizeBytes: await getFileSize(uri),
        base64: options?.includeBase64 ? await readBase64(uri) : null,
        createdAt: nowIso(),
      };

      await aiMobileApi.sendNativeVoiceEvent({
        type: "audio_captured",
        sessionId,
        payload: {
          uri: asset.uri,
          fileName: asset.fileName,
          mimeType: asset.mimeType,
          durationMillis: asset.durationMillis,
          sizeBytes: asset.sizeBytes,
          hasBase64: Boolean(asset.base64),
          bridge: "expo-av",
          purpose: SABI_FEMALE_VOICE_PROFILE.purpose,
          preferredVoiceGender: SABI_FEMALE_VOICE_PROFILE.preferredVoiceGender,
          voiceStyle: SABI_FEMALE_VOICE_PROFILE.voiceStyle,
          voiceName: SABI_FEMALE_VOICE_PROFILE.voiceName,
        },
      });

      return { ok: true, data: asset };
    } catch (error) {
      activeRecording = null;

      return {
        ok: false,
        error: createError(
          "ai_voice_recording_stop_failed",
          error instanceof Error ? error.message : String(error ?? "recording stop failed"),
        ),
      };
    }
  },

  submitTranscript: async (
    input: AiVoiceSubmitTranscriptInput,
  ): Promise<AiMobileApiResult<Record<string, unknown>>> => {
    const transcript = input.transcript.trim();

    if (!transcript) {
      return {
        ok: false,
        error: createError("ai_voice_empty_transcript", "Transcript is empty."),
      };
    }

    await aiMobileApi.sendNativeVoiceEvent({
      type: "transcript_ready",
      sessionId: input.sessionId,
      payload: {
        transcript,
        language: input.language ?? null,
        source: input.source ?? "mobile_live_voice_translation",
        purpose: SABI_FEMALE_VOICE_PROFILE.purpose,
        preferredVoiceGender: SABI_FEMALE_VOICE_PROFILE.preferredVoiceGender,
        voiceStyle: SABI_FEMALE_VOICE_PROFILE.voiceStyle,
        voiceName: SABI_FEMALE_VOICE_PROFILE.voiceName,
      },
    });

    return aiMobileApi.submitVoiceTranscript({
      transcript,
      sessionId: input.sessionId,
      language: input.language,
      source: input.source ?? "mobile_live_voice_translation",
    });
  },

  requestTts: async (
    input: AiVoiceRequestTtsInput,
  ): Promise<AiMobileApiResult<AiVoicePlaybackCommand>> => {
    const text = input.text.trim();

    if (!text) {
      return {
        ok: false,
        error: createError("ai_voice_empty_tts_text", "TTS text is empty."),
      };
    }

    await aiMobileApi.sendNativeVoiceEvent({
      type: "tts_requested",
      sessionId: input.sessionId,
      payload: {
        text,
        language: input.language ?? null,
        preferredVoiceGender: SABI_FEMALE_VOICE_PROFILE.preferredVoiceGender,
        voiceStyle: SABI_FEMALE_VOICE_PROFILE.voiceStyle,
        voiceName: SABI_FEMALE_VOICE_PROFILE.voiceName,
        speakingRate: SABI_FEMALE_VOICE_PROFILE.speakingRate,
        pitch: SABI_FEMALE_VOICE_PROFILE.pitch,
        purpose: SABI_FEMALE_VOICE_PROFILE.purpose,
        noFakePlayback: true,
      },
    });

    const result = await aiMobileApi.requestVoiceTts({
      text,
      sessionId: input.sessionId,
      language: input.language,
    });

    if (!result.ok) {
      return { ok: false, error: result.error };
    }

    return { ok: true, data: normalizePlaybackCommand(result.data) };
  },

  playAudioUrl: async (
    command: AiVoicePlaybackCommand,
  ): Promise<AiMobileApiResult<{ finished: boolean }>> => {
    if (!command.audioUrl) {
      return {
        ok: false,
        error: createError(
          "ai_voice_audio_url_missing",
          "TTS returned text only. Audio playback is not faked without a backend audioUrl.",
        ),
      };
    }

    try {
      await aiVoiceMobileBridge.stopPlayback(command.sessionId);
      await configureAudioModeForPlayback();

      const { sound } = await Audio.Sound.createAsync(
        { uri: command.audioUrl },
        { shouldPlay: true, volume: SABI_FEMALE_VOICE_PROFILE.volume },
      );

      activeSound = sound;

      await aiMobileApi.sendNativeVoiceEvent({
        type: "playback_started",
        sessionId: command.sessionId,
        payload: {
          commandId: command.commandId,
          audioUrl: command.audioUrl,
          preferredVoiceGender: SABI_FEMALE_VOICE_PROFILE.preferredVoiceGender,
          voiceStyle: SABI_FEMALE_VOICE_PROFILE.voiceStyle,
          voiceName: SABI_FEMALE_VOICE_PROFILE.voiceName,
          bridge: "expo-av",
        },
      });

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          aiVoiceMobileBridge.stopPlayback(command.sessionId).catch(() => undefined);
        }
      });

      return { ok: true, data: { finished: false } };
    } catch (error) {
      return {
        ok: false,
        error: createError(
          "ai_voice_playback_failed",
          error instanceof Error ? error.message : String(error ?? "playback failed"),
        ),
      };
    }
  },

  stopPlayback: async (
    sessionId?: string | null,
  ): Promise<AiMobileApiResult<{ stopped: boolean }>> => {
    const sound = activeSound;
    activeSound = null;

    if (sound) {
      try {
        await sound.stopAsync();
      } catch {
        // Native playback may already be stopped.
      }

      try {
        await sound.unloadAsync();
      } catch {
        // Ignore unload errors.
      }
    }

    await aiMobileApi.sendNativeVoiceEvent({
      type: "playback_finished",
      sessionId,
      payload: {
        bridge: "expo-av",
        preferredVoiceGender: SABI_FEMALE_VOICE_PROFILE.preferredVoiceGender,
        voiceStyle: SABI_FEMALE_VOICE_PROFILE.voiceStyle,
        voiceName: SABI_FEMALE_VOICE_PROFILE.voiceName,
      },
    });

    return { ok: true, data: { stopped: true } };
  },

  interrupt: async (sessionId?: string | null) => {
    await aiVoiceMobileBridge.stopPlayback(sessionId);

    const result = await aiMobileApi.interruptVoicePlayback({ sessionId });

    await aiMobileApi.sendNativeVoiceEvent({
      type: "interrupted",
      sessionId,
      payload: {
        bridge: "expo-av",
        preferredVoiceGender: SABI_FEMALE_VOICE_PROFILE.preferredVoiceGender,
        voiceStyle: SABI_FEMALE_VOICE_PROFILE.voiceStyle,
        voiceName: SABI_FEMALE_VOICE_PROFILE.voiceName,
      },
    });

    return result;
  },
};