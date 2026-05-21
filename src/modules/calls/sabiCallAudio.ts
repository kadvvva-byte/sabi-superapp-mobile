import {
  createAudioPlayer,
  setAudioModeAsync,
  setIsAudioActiveAsync,
  type AudioPlayer,
  type AudioSource,
} from "expo-audio";

export type SabiCallAudioModeOptions = {
  allowsRecording: boolean;
  speakerEnabled?: boolean;
  shouldPlayInBackground?: boolean;
  duckOthers?: boolean;
};

export type SabiCallTonePlayer = AudioPlayer;

export async function setSabiCallAudioMode(options: SabiCallAudioModeOptions) {
  const speakerEnabled = options.speakerEnabled ?? true;
  try { await setIsAudioActiveAsync(true); } catch {}
  await setAudioModeAsync({
    allowsRecording: options.allowsRecording,
    playsInSilentMode: true,
    shouldPlayInBackground: options.shouldPlayInBackground ?? true,
    allowsBackgroundRecording: options.allowsRecording,
    shouldRouteThroughEarpiece: !speakerEnabled,
    interruptionMode: options.duckOthers ? "duckOthers" : "doNotMix",
  });
}

export async function resetSabiCallAudioMode() {
  try {
    await setSabiCallAudioMode({
      allowsRecording: false,
      speakerEnabled: true,
      shouldPlayInBackground: false,
      duckOthers: true,
    });
  } catch {}
}

export async function createSabiLoopingCallTonePlayer(source: AudioSource | number, volume: number) {
  const player = createAudioPlayer(source, {
    updateInterval: 500,
    downloadFirst: false,
  });

  try { player.loop = true; } catch {}
  try { player.volume = volume; } catch {}
  try { player.play(); } catch {}

  return player;
}

export async function stopAndRemoveSabiCallTonePlayer(player: SabiCallTonePlayer | null) {
  if (!player) return;
  try { player.pause(); } catch {}
  try { await player.seekTo?.(0); } catch {}
  try { player.remove(); } catch {}
}
