import type { AiMobileApiError, AiMobileConnectionStatus } from "../aiMobileTypes";

export type AiVoiceBridgeRecordingState =
  | "idle"
  | "requesting_permission"
  | "recording"
  | "processing"
  | "playing"
  | "error";

export type AiVoiceNativeEventType =
  | "bridge_bound"
  | "recording_started"
  | "recording_stopped"
  | "audio_captured"
  | "transcript_ready"
  | "tts_requested"
  | "playback_requested"
  | "playback_started"
  | "playback_finished"
  | "interrupted"
  | "error";

export type AiVoiceRecordingAsset = {
  uri: string;
  fileName: string;
  mimeType: string;
  durationMillis: number | null;
  sizeBytes: number | null;
  base64?: string | null;
  createdAt: string;
};

export type AiVoicePlaybackCommand = {
  commandId: string | null;
  sessionId: string | null;
  text: string | null;
  audioUrl: string | null;
  audioBase64: string | null;
  audioMimeType: string | null;
  language: string | null;
  status: AiMobileConnectionStatus;
  raw?: Record<string, unknown> | null;
};

export type AiVoiceBridgeLogEntry = {
  id: string;
  type: AiVoiceNativeEventType | "info";
  message: string;
  createdAt: string;
  error?: AiMobileApiError | null;
};

export type AiVoiceBridgeState = {
  status: AiMobileConnectionStatus;
  recordingState: AiVoiceBridgeRecordingState;
  isRecording: boolean;
  isPlaying: boolean;
  activeSessionId: string | null;
  currentRecording: AiVoiceRecordingAsset | null;
  currentPlayback: AiVoicePlaybackCommand | null;
  lastTranscript: string | null;
  lastError: AiMobileApiError | null;
  log: AiVoiceBridgeLogEntry[];
};

export type AiVoiceSubmitTranscriptInput = {
  transcript: string;
  sessionId?: string | null;
  language?: string | null;
  source?: string;
};

export type AiVoiceRequestTtsInput = {
  text: string;
  sessionId?: string | null;
  language?: string | null;
};
