import { useCallback, useMemo, useRef, useState } from "react";

import { createAiMobileId } from "../aiMobileApi";
import type { AiMobileApiError, AiMobileApiResult } from "../aiMobileTypes";
import type {
  AiVoiceBridgeLogEntry,
  AiVoiceBridgeState,
  AiVoiceNativeEventType,
  AiVoicePlaybackCommand,
  AiVoiceRequestTtsInput,
} from "./aiVoiceBridgeTypes";
import { aiVoiceMobileBridge } from "./aiVoiceMobileBridge";

type VoiceTtsRequest = string | AiVoiceRequestTtsInput;

function nowIso() {
  return new Date().toISOString();
}

function toErrorMessage(error: AiMobileApiError | null | undefined) {
  return error?.message || "Voice bridge request failed.";
}

function makeLog(
  type: AiVoiceNativeEventType | "info",
  message: string,
  error?: AiMobileApiError | null,
): AiVoiceBridgeLogEntry {
  return {
    id: createAiMobileId("voice_log"),
    type,
    message,
    createdAt: nowIso(),
    error: error ?? null,
  };
}

function normalizeTtsRequest(
  input: VoiceTtsRequest,
  sessionId: string | null,
): AiVoiceRequestTtsInput {
  if (typeof input === "string") {
    return {
      text: input,
      sessionId,
    };
  }

  return {
    ...input,
    sessionId: input.sessionId ?? sessionId,
  };
}

const initialState: AiVoiceBridgeState = {
  status: "limited",
  recordingState: "idle",
  isRecording: false,
  isPlaying: false,
  activeSessionId: null,
  currentRecording: null,
  currentPlayback: null,
  lastTranscript: null,
  lastError: null,
  log: [],
};

export function useAiVoiceBridge() {
  const [state, setState] = useState<AiVoiceBridgeState>(initialState);
  const sessionIdRef = useRef<string | null>(null);

  const pushLog = useCallback(
    (type: AiVoiceNativeEventType | "info", message: string, error?: AiMobileApiError | null) => {
      setState((prev) => ({
        ...prev,
        log: [makeLog(type, message, error), ...prev.log].slice(0, 12),
      }));
    },
    [],
  );

  const applyError = useCallback(
    (error: AiMobileApiError) => {
      setState((prev) => ({
        ...prev,
        status: "error",
        recordingState: "error",
        isRecording: false,
        isPlaying: false,
        lastError: error,
      }));

      pushLog("error", toErrorMessage(error), error);
    },
    [pushLog],
  );

  const bindBridge = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      recordingState: "processing",
      lastError: null,
    }));

    const result = await aiVoiceMobileBridge.bindNativeBridge();

    if (result.ok) {
      setState((prev) => ({
        ...prev,
        status: "ready",
        recordingState: "idle",
        lastError: null,
      }));

      pushLog("bridge_bound", "Sabi AI voice bridge is ready.");
    } else {
      applyError(result.error);
    }

    return result;
  }, [applyError, pushLog]);

  const setSessionId = useCallback((sessionId: string | null) => {
    sessionIdRef.current = sessionId;

    setState((prev) => ({
      ...prev,
      activeSessionId: sessionId,
    }));
  }, []);

  const startRecording = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      status: "ready",
      recordingState: "requesting_permission",
      isRecording: false,
      lastError: null,
    }));

    const result = await aiVoiceMobileBridge.startRecording(sessionIdRef.current);

    if (result.ok) {
      setState((prev) => ({
        ...prev,
        status: "ready",
        recordingState: "recording",
        isRecording: true,
        isPlaying: false,
        currentRecording: null,
        lastError: null,
      }));

      pushLog("recording_started", "Listening for live voice translation.");
    } else {
      applyError(result.error);
    }

    return result;
  }, [applyError, pushLog]);

  const stopRecording = useCallback(async (options?: { includeBase64?: boolean }) => {
    setState((prev) => ({
      ...prev,
      recordingState: "processing",
      isRecording: false,
      lastError: null,
    }));

    const result = await aiVoiceMobileBridge.stopRecording(sessionIdRef.current, options);

    if (result.ok) {
      setState((prev) => ({
        ...prev,
        status: "ready",
        recordingState: "idle",
        isRecording: false,
        currentRecording: result.data,
        lastError: null,
      }));

      pushLog("audio_captured", "Voice captured for translation.");
    } else {
      applyError(result.error);
    }

    return result;
  }, [applyError, pushLog]);

  const submitTranscript = useCallback(
    async (
      transcript: string,
      options?: {
        language?: string | null;
        source?: string;
      },
    ): Promise<AiMobileApiResult<Record<string, unknown>>> => {
      const cleanTranscript = transcript.trim();

      if (!cleanTranscript) {
        const error: AiMobileApiError = {
          code: "ai_voice_empty_transcript",
          message: "Transcript is empty.",
        };

        applyError(error);
        return { ok: false, error };
      }

      setState((prev) => ({
        ...prev,
        recordingState: "processing",
        lastError: null,
      }));

      const result = await aiVoiceMobileBridge.submitTranscript({
        transcript: cleanTranscript,
        sessionId: sessionIdRef.current,
        language: options?.language ?? null,
        source: options?.source ?? "mobile_live_voice_translation",
      });

      if (result.ok) {
        setState((prev) => ({
          ...prev,
          status: "ready",
          recordingState: "idle",
          lastTranscript: cleanTranscript,
          lastError: null,
        }));

        pushLog("transcript_ready", "Voice text is ready for translation.");
      } else {
        applyError(result.error);
      }

      return result;
    },
    [applyError, pushLog],
  );

  const requestTts = useCallback(
    async (input: VoiceTtsRequest): Promise<AiMobileApiResult<AiVoicePlaybackCommand>> => {
      const request = normalizeTtsRequest(input, sessionIdRef.current);
      const cleanText = request.text.trim();

      if (!cleanText) {
        const error: AiMobileApiError = {
          code: "ai_voice_empty_tts_text",
          message: "TTS text is empty.",
        };

        applyError(error);
        return { ok: false, error };
      }

      setState((prev) => ({
        ...prev,
        status: "ready",
        recordingState: "processing",
        lastError: null,
      }));

      const result = await aiVoiceMobileBridge.requestTts({
        ...request,
        text: cleanText,
      });

      if (result.ok) {
        setState((prev) => ({
          ...prev,
          status: "ready",
          recordingState: "idle",
          currentPlayback: result.data,
          lastError: null,
        }));

        pushLog(
          "tts_requested",
          result.data.audioUrl || result.data.audioBase64
            ? "Sabi AI voice response is ready."
            : "Sabi AI returned text only; audio playback is not faked.",
        );

        if (result.data.audioUrl || result.data.audioBase64) {
          const playbackResult = await aiVoiceMobileBridge.playAudioUrl(result.data);
          if (playbackResult.ok) {
            setState((prev) => ({
              ...prev,
              status: "ready",
              recordingState: "playing",
              isPlaying: true,
              lastError: null,
            }));
            pushLog("playback_started", "Sabi AI voice response is playing.");
          } else {
            applyError(playbackResult.error);
          }
        }
      } else {
        applyError(result.error);
      }

      return result;
    },
    [applyError, pushLog],
  );

  const playCurrent = useCallback(async () => {
    let playback: AiVoicePlaybackCommand | null = null;

    setState((prev) => {
      playback = prev.currentPlayback;

      return {
        ...prev,
        recordingState: "playing",
        isPlaying: Boolean(prev.currentPlayback),
        lastError: null,
      };
    });

    if (!playback) {
      const error: AiMobileApiError = {
        code: "ai_voice_playback_command_missing",
        message: "No Sabi AI voice response is available.",
      };

      applyError(error);
      return { ok: false, error } satisfies AiMobileApiResult<{ finished: boolean }>;
    }

    const result = await aiVoiceMobileBridge.playAudioUrl(playback);

    if (result.ok) {
      setState((prev) => ({
        ...prev,
        status: "ready",
        recordingState: "playing",
        isPlaying: true,
        lastError: null,
      }));

      pushLog("playback_started", "Sabi AI voice playback started.");
    } else {
      applyError(result.error);
    }

    return result;
  }, [applyError, pushLog]);

  const stopPlayback = useCallback(async () => {
    const result = await aiVoiceMobileBridge.stopPlayback(sessionIdRef.current);

    if (result.ok) {
      setState((prev) => ({
        ...prev,
        status: "ready",
        recordingState: "idle",
        isPlaying: false,
        lastError: null,
      }));

      pushLog("playback_finished", "Sabi AI voice playback stopped.");
    } else {
      applyError(result.error);
    }

    return result;
  }, [applyError, pushLog]);

  const interrupt = useCallback(async () => {
    const result = await aiVoiceMobileBridge.interrupt(sessionIdRef.current);

    if (result.ok) {
      setState((prev) => ({
        ...prev,
        status: "ready",
        recordingState: "idle",
        isPlaying: false,
        isRecording: false,
        lastError: null,
      }));

      pushLog("interrupted", "Sabi AI voice was stopped.");
    } else {
      applyError(result.error);
    }

    return result;
  }, [applyError, pushLog]);

  const clearTranscript = useCallback(() => {
    setState((prev) => ({
      ...prev,
      lastTranscript: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      lastError: null,
      recordingState: prev.recordingState === "error" ? "idle" : prev.recordingState,
      status: prev.status === "error" ? "limited" : prev.status,
    }));
  }, []);

  const resetBridgeState = useCallback(() => {
    sessionIdRef.current = null;
    setState(initialState);
  }, []);

  const canRecord = useMemo(
    () =>
      state.recordingState === "idle" ||
      state.recordingState === "error" ||
      state.recordingState === "playing",
    [state.recordingState],
  );

  const canPlay = useMemo(
    () => Boolean(state.currentPlayback?.audioUrl || state.currentPlayback?.audioBase64) && !state.isRecording,
    [state.currentPlayback?.audioBase64, state.currentPlayback?.audioUrl, state.isRecording],
  );

  return {
    state,
    canRecord,
    canPlay,
    bindBridge,
    setSessionId,
    startRecording,
    stopRecording,
    submitTranscript,
    requestTts,
    playCurrent,
    stopPlayback,
    interrupt,
    clearTranscript,
    clearError,
    resetBridgeState,
    pushLog,
  };
}