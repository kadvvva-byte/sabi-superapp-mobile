import { useEffect, useRef } from "react";
import { resolveSabiSoundForKind, type SabiResolvedSound } from "../notifications/sounds/sabiSoundPreferences";
import { getSabiBundledSoundSource } from "../notifications/sounds/sabiNotificationSounds";
import { createSabiLoopingCallTonePlayer, setSabiCallAudioMode, stopAndRemoveSabiCallTonePlayer, type SabiCallTonePlayer } from "./sabiCallAudio";

const SABI_RINGBACK_SOUND = require("../../../assets/sounds/sabi-ringback.wav");
const SABI_FAST_INCOMING_FALLBACK_SOUND = getSabiBundledSoundSource("call_neon");

export type SabiCallToneMode = "none" | "incoming" | "outgoing";

type SabiGlobalToneState = {
  sound: SabiCallTonePlayer | null;
  ownerKey: string;
  callId: string;
  mode: SabiCallToneMode;
  generation: number;
  stopTimer: ReturnType<typeof setTimeout> | null;
  closedCallIds: Record<string, number>;
};

function getSabiGlobalToneState(): SabiGlobalToneState {
  const root = globalThis as any;
  if (!root.__sabiCallToneState) {
    root.__sabiCallToneState = {
      sound: null,
      ownerKey: "",
      callId: "",
      mode: "none",
      generation: 0,
      stopTimer: null,
      closedCallIds: {},
    } as SabiGlobalToneState;
  }

  const state = root.__sabiCallToneState as SabiGlobalToneState;
  if (!state.closedCallIds) state.closedCallIds = {};
  if (typeof state.generation !== "number") state.generation = 0;
  return state;
}

function isClosedCallId(callId: string) {
  if (!callId) return false;
  const state = getSabiGlobalToneState();
  const closedAt = state.closedCallIds[callId] || 0;
  if (!closedAt) return false;
  if (Date.now() - closedAt > 120000) {
    delete state.closedCallIds[callId];
    return false;
  }
  return true;
}

async function configureSabiCallToneAudio() {
  try {
    await setSabiCallAudioMode({
      allowsRecording: false,
      speakerEnabled: true,
      shouldPlayInBackground: true,
      duckOthers: false,
    });
  } catch {}
}

async function unloadSound(sound: SabiCallTonePlayer | null) {
  await stopAndRemoveSabiCallTonePlayer(sound);
}

async function stopSabiGlobalTone(ownerKey?: string) {
  const state = getSabiGlobalToneState();

  if (ownerKey && state.ownerKey && state.ownerKey !== ownerKey) {
    return;
  }

  state.generation += 1;
  const sound = state.sound;
  state.sound = null;
  state.ownerKey = "";
  state.callId = "";
  state.mode = "none";

  if (state.stopTimer) {
    clearTimeout(state.stopTimer);
    state.stopTimer = null;
  }

  await unloadSound(sound);
}

function isSameSabiIncomingTone(selected: SabiResolvedSound | null) {
  return !selected || (!selected.isCustom && selected.id === "call_neon");
}

async function resolveIncomingToneSafely() {
  try {
    return await resolveSabiSoundForKind("call");
  } catch {
    return null;
  }
}

async function upgradeSabiIncomingToneIfNeeded(params: {
  ownerKey: string;
  callId: string;
  generation: number;
  volume: number;
}) {
  const selectedIncomingTone = await resolveIncomingToneSafely();
  if (isSameSabiIncomingTone(selectedIncomingTone)) return;

  const state = getSabiGlobalToneState();
  if (
    state.generation !== params.generation ||
    state.ownerKey !== params.ownerKey ||
    state.callId !== params.callId ||
    state.mode !== "incoming" ||
    isClosedCallId(params.callId)
  ) {
    return;
  }

  const clip = selectedIncomingTone?.isCustom
    ? {
        clipStartMs: selectedIncomingTone.clipStartMs ?? 0,
        clipDurationMs: selectedIncomingTone.clipDurationMs ?? 30000,
      }
    : undefined;

  try {
    const nextSound = await createSabiLoopingCallTonePlayer(
      selectedIncomingTone?.source ?? SABI_FAST_INCOMING_FALLBACK_SOUND,
      params.volume,
      clip,
    );
    const current = getSabiGlobalToneState();
    if (
      current.generation !== params.generation ||
      current.ownerKey !== params.ownerKey ||
      current.callId !== params.callId ||
      current.mode !== "incoming" ||
      isClosedCallId(params.callId)
    ) {
      await unloadSound(nextSound);
      return;
    }

    const previousSound = current.sound;
    current.sound = nextSound;
    await unloadSound(previousSound);
  } catch {}
}

export function markSabiCallToneCallClosed(callId?: string) {
  const id = String(callId || "");
  if (!id) return;
  const state = getSabiGlobalToneState();
  state.closedCallIds[id] = Date.now();
  if (state.callId === id || state.ownerKey.startsWith(id + ":")) {
    void stopSabiGlobalTone();
  }
}

export function stopSabiCallToneNow() {
  return stopSabiGlobalTone();
}

export function stopSabiCallToneForCall(callId?: string) {
  const id = String(callId || "");
  if (!id) return stopSabiGlobalTone();
  markSabiCallToneCallClosed(id);
  return stopSabiGlobalTone();
}

try {
  const root = globalThis as any;
  root.__sabiStopCallToneNow = stopSabiCallToneNow;
  root.__sabiStopCallToneForCall = stopSabiCallToneForCall;
} catch {}

export function useSabiCallTone(params: {
  enabled: boolean;
  mode: SabiCallToneMode;
  callId?: string;
}) {
  const ownerRef = useRef("");

  useEffect(() => {
    let cancelled = false;
    const callId = String(params.callId || "call");
    const ownerKey = [callId, params.mode].join(":");
    ownerRef.current = ownerKey;

    async function startTone() {
      if (!params.enabled || params.mode === "none" || isClosedCallId(callId)) {
        await stopSabiGlobalTone();
        return;
      }

      const state = getSabiGlobalToneState();
      if (state.sound && state.ownerKey === ownerKey && state.mode === params.mode) {
        return;
      }

      await stopSabiGlobalTone();
      const startGeneration = getSabiGlobalToneState().generation;
      if (cancelled || isClosedCallId(callId)) return;

      // Configure in parallel with sound creation. Waiting for audio-mode first
      // caused delayed ringback on some Android devices.
      void configureSabiCallToneAudio();

      const source = params.mode === "incoming" ? SABI_FAST_INCOMING_FALLBACK_SOUND : SABI_RINGBACK_SOUND;
      const volume = params.mode === "incoming" ? 0.9 : 0.5;

      try {
        const sound = await createSabiLoopingCallTonePlayer(source, volume);

        const current = getSabiGlobalToneState();
        if (
          cancelled ||
          ownerRef.current !== ownerKey ||
          isClosedCallId(callId) ||
          current.generation !== startGeneration
        ) {
          await unloadSound(sound);
          return;
        }

        current.sound = sound;
        current.ownerKey = ownerKey;
        current.callId = callId;
        current.mode = params.mode;

        if (current.stopTimer) clearTimeout(current.stopTimer);
        current.stopTimer = setTimeout(() => {
          void stopSabiGlobalTone(ownerKey);
        }, params.mode === "incoming" ? 90000 : 75000);

        if (params.mode === "incoming") {
          void upgradeSabiIncomingToneIfNeeded({
            ownerKey,
            callId,
            generation: startGeneration,
            volume,
          });
        }
      } catch {
        const failedState = getSabiGlobalToneState();
        if (failedState.ownerKey === ownerKey) {
          failedState.ownerKey = "";
          failedState.callId = "";
          failedState.mode = "none";
          failedState.sound = null;
        }
      }
    }

    void startTone();

    return () => {
      cancelled = true;
      void stopSabiGlobalTone(ownerKey);
    };
  }, [params.callId, params.enabled, params.mode]);
}
