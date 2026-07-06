import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";

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


const SABI_AI_RECORDING_OPTIONS = {
  android: {
    extension: ".m4a",
    outputFormat: (Audio as any).AndroidOutputFormat?.MPEG_4 ?? 2,
    audioEncoder: (Audio as any).AndroidAudioEncoder?.AAC ?? 3,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
  },
  ios: {
    extension: ".m4a",
    outputFormat: (Audio as any).IOSOutputFormat?.MPEG4AAC ?? "aac ",
    audioQuality: (Audio as any).IOSAudioQuality?.HIGH ?? 127,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/webm",
    bitsPerSecond: 64000,
  },
};

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

function normalizeAudioMimeType(value: unknown): string | null {
  const clean = toStringValue(value);
  if (!clean) return null;
  return clean.includes("/") ? clean : null;
}

function extensionForAudioMimeType(mimeType?: string | null): string {
  const normalized = (mimeType || "").toLowerCase();
  if (normalized.includes("ogg")) return "ogg";
  if (normalized.includes("mpeg") || normalized.includes("mp3")) return "mp3";
  if (normalized.includes("wav")) return "wav";
  if (normalized.includes("3gpp") || normalized.includes("3gp")) return "3gp";
  if (normalized.includes("mp4") || normalized.includes("m4a") || normalized.includes("aac")) return "m4a";
  return "ogg";
}

function normalizeRecordedAudioMimeType(uri: string): string {
  const cleanUri = uri.split("?")[0]?.toLowerCase() ?? "";
  if (cleanUri.endsWith(".ogg") || cleanUri.endsWith(".opus")) return "audio/ogg";
  if (cleanUri.endsWith(".mp3")) return "audio/mpeg";
  if (cleanUri.endsWith(".wav")) return "audio/wav";
  if (cleanUri.endsWith(".3gp") || cleanUri.endsWith(".3gpp")) return "audio/3gpp";
  if (cleanUri.endsWith(".aac")) return "audio/aac";
  return "audio/mp4";
}

function normalizeBase64Audio(value: string): string {
  const clean = value.trim();
  const dataPrefixIndex = clean.indexOf("base64,");
  if (dataPrefixIndex >= 0) {
    return clean.slice(dataPrefixIndex + "base64,".length).replace(/\s+/g, "");
  }

  return clean.replace(/\s+/g, "");
}

function pickFirstRecordWithAudio(records: Array<Record<string, unknown> | null>): Record<string, unknown> {
  for (const record of records) {
    if (!record) continue;
    if (
      toStringValue(record.audioBase64) ||
      toStringValue(record.audio_base64) ||
      toStringValue(record.audio) ||
      toStringValue(record.audioUrl) ||
      toStringValue(record.url) ||
      toStringValue(record.fileUrl)
    ) {
      return record;
    }
  }

  return records.find((record): record is Record<string, unknown> => Boolean(record)) ?? {};
}

function normalizePlaybackCommand(rawValue: unknown): AiVoicePlaybackCommand {
  const root = toRecord(rawValue) ?? {};
  const data = toRecord(root.data) ?? root;
  const result = toRecord(data.result) ?? toRecord(root.result);
  const payload = toRecord(data.payload) ?? toRecord(root.payload);
  const tts = toRecord(data.tts) ?? toRecord(result?.tts) ?? toRecord(payload?.tts);
  const audio = toRecord(data.audio) ?? toRecord(result?.audio) ?? toRecord(payload?.audio);
  const command = pickFirstRecordWithAudio([
    toRecord(data.command),
    toRecord(data.playback),
    toRecord(result?.command),
    toRecord(result?.playback),
    toRecord(payload?.command),
    toRecord(payload?.playback),
    audio,
    tts,
    result,
    payload,
    data,
    root,
  ]);

  const audioBase64 =
    toStringValue(command.audioBase64) ||
    toStringValue(command.audio_base64) ||
    toStringValue(command.audio) ||
    null;

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
      toStringValue(command.fileUrl) ||
      null,
    audioBase64: audioBase64 ? normalizeBase64Audio(audioBase64) : null,
    audioMimeType:
      normalizeAudioMimeType(command.audioMimeType) ||
      normalizeAudioMimeType(command.mimeType) ||
      normalizeAudioMimeType(command.contentType) ||
      normalizeAudioMimeType(command.type) ||
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

async function readBase64(uri: string): Promise<{ base64: string | null; error: string | null }> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const clean = typeof base64 === "string" ? base64.trim() : "";
    return { base64: clean || null, error: clean ? null : "empty_base64" };
  } catch (error) {
    return {
      base64: null,
      error: error instanceof Error ? error.message : String(error ?? "base64_read_failed"),
    };
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
      await recording.prepareToRecordAsync(SABI_AI_RECORDING_OPTIONS as any);
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

      const base64Read = options?.includeBase64
        ? await readBase64(uri)
        : { base64: null, error: null };

      if (options?.includeBase64 && !base64Read.base64) {
        return {
          ok: false,
          error: createError(
            "ai_voice_audio_base64_read_failed",
            base64Read.error || "Recorded audio file could not be converted to base64.",
          ),
        };
      }

      const asset: AiVoiceRecordingAsset = {
        uri,
        fileName: makeRecordingFileName(uri),
        mimeType: normalizeRecordedAudioMimeType(uri),
        durationMillis: toNumberValue(statusBeforeStop.durationMillis),
        sizeBytes: await getFileSize(uri),
        base64: base64Read.base64,
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

    return {
      ok: true,
      data: {
        status: "transcript_ready",
        transcript,
        sessionId: input.sessionId ?? null,
        language: input.language ?? null,
        source: input.source ?? "mobile_live_voice_translation",
      },
    };
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
    let playbackUri = command.audioUrl;

    if (!playbackUri && command.audioBase64) {
      try {
        const cacheRoot = FileSystem.cacheDirectory || FileSystem.documentDirectory;
        if (!cacheRoot) {
          return {
            ok: false,
            error: createError(
              "ai_voice_audio_cache_unavailable",
              "Audio cache directory is unavailable for Sabi voice playback.",
            ),
          };
        }

        const extension = extensionForAudioMimeType(command.audioMimeType);
        playbackUri = `${cacheRoot}sabi-ai-voice-${command.commandId || Date.now()}.${extension}`;
        await FileSystem.writeAsStringAsync(playbackUri, normalizeBase64Audio(command.audioBase64), {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (error) {
        return {
          ok: false,
          error: createError(
            "ai_voice_audio_base64_write_failed",
            error instanceof Error ? error.message : String(error ?? "voice audio write failed"),
          ),
        };
      }
    }

    if (!playbackUri) {
      return {
        ok: false,
        error: createError(
          "ai_voice_audio_missing",
          "TTS did not return playable audio. Voice playback is not faked without server audio.",
        ),
      };
    }

    try {
      await aiVoiceMobileBridge.stopPlayback(command.sessionId);
      await configureAudioModeForPlayback();

      const { sound } = await Audio.Sound.createAsync(
        { uri: playbackUri },
        { shouldPlay: true, volume: SABI_FEMALE_VOICE_PROFILE.volume },
      );

      activeSound = sound;

      await aiMobileApi.sendNativeVoiceEvent({
        type: "playback_started",
        sessionId: command.sessionId,
        payload: {
          commandId: command.commandId,
          audioUrl: playbackUri,
          hasAudioBase64: Boolean(command.audioBase64),
          audioMimeType: command.audioMimeType,
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