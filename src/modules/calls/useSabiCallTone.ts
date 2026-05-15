import { Audio } from "expo-av";
import { useEffect, useRef } from "react";

const SABI_RINGBACK_SOUND = require("../../../assets/sounds/sabi-ringback.wav");
const SABI_RINGTONE_SOUND = require("../../../assets/sounds/sabi-ringtone.wav");

export type SabiCallToneMode = "none" | "incoming" | "outgoing";

type SabiGlobalToneState = {
  sound: Audio.Sound | null;
  ownerKey: string;
  mode: SabiCallToneMode;
  stopTimer: ReturnType<typeof setTimeout> | null;
};

function getSabiGlobalToneState(): SabiGlobalToneState {
  const root = globalThis as any;
  if (!root.__sabiCallToneState) {
    root.__sabiCallToneState = {
      sound: null,
      ownerKey: "",
      mode: "none",
      stopTimer: null,
    } as SabiGlobalToneState;
  }

  return root.__sabiCallToneState as SabiGlobalToneState;
}

async function configureSabiCallToneAudio() {
  try {
    await Audio.setAudioModeAsync({
      // Ringback/ringtone is playback only. Do not open recorder here;
      // the WebRTC peer enables recording only when the call starts.
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    });
  } catch {}
}

async function stopSabiGlobalTone(ownerKey?: string) {
  const state = getSabiGlobalToneState();

  if (ownerKey && state.ownerKey && state.ownerKey !== ownerKey) {
    return;
  }

  const sound = state.sound;
  state.sound = null;
  state.ownerKey = "";
  state.mode = "none";

  if (state.stopTimer) {
    clearTimeout(state.stopTimer);
    state.stopTimer = null;
  }

  if (!sound) return;

  try {
    await sound.stopAsync();
  } catch {}

  try {
    await sound.unloadAsync();
  } catch {}
}

export function useSabiCallTone(params: {
  enabled: boolean;
  mode: SabiCallToneMode;
  callId?: string;
}) {
  const ownerRef = useRef("");

  useEffect(() => {
    let cancelled = false;
    const ownerKey = [String(params.callId || "call"), params.mode].join(":");
    ownerRef.current = ownerKey;

    async function startTone() {
      if (!params.enabled || params.mode === "none") {
        await stopSabiGlobalTone(ownerKey);
        return;
      }

      const state = getSabiGlobalToneState();
      if (state.sound && state.ownerKey === ownerKey && state.mode === params.mode) {
        return;
      }

      await stopSabiGlobalTone();
      if (cancelled) return;

      await configureSabiCallToneAudio();
      if (cancelled) return;

      const source = params.mode === "incoming" ? SABI_RINGTONE_SOUND : SABI_RINGBACK_SOUND;
      const volume = params.mode === "incoming" ? 0.85 : 0.45;

      try {
        const { sound } = await Audio.Sound.createAsync(source, {
          shouldPlay: true,
          isLooping: true,
          volume,
          progressUpdateIntervalMillis: 500,
        });

        if (cancelled || ownerRef.current !== ownerKey) {
          try {
            await sound.stopAsync();
          } catch {}
          try {
            await sound.unloadAsync();
          } catch {}
          return;
        }

        const nextState = getSabiGlobalToneState();
        nextState.sound = sound;
        nextState.ownerKey = ownerKey;
        nextState.mode = params.mode;

        // Safety guard: never let a stale ringback/ringtone loop forever if a
        // route is abandoned without a normal phase update. The screen still
        // stops it immediately when phase changes to connecting/active/ended.
        nextState.stopTimer = setTimeout(() => {
          void stopSabiGlobalTone(ownerKey);
        }, params.mode === "incoming" ? 90000 : 75000);
      } catch {
        const failedState = getSabiGlobalToneState();
        if (failedState.ownerKey === ownerKey) {
          failedState.ownerKey = "";
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
