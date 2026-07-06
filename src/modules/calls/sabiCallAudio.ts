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

export type SabiCallToneClipOptions = {
  clipStartMs?: number;
  clipDurationMs?: number;
};

export type SabiCallTonePlayer = AudioPlayer & {
  __sabiClipTimer?: ReturnType<typeof setInterval> | null;
};

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

function readPlayerTimeMs(player: SabiCallTonePlayer) {
  const rawPlayer = player as unknown as {
    currentTime?: number;
    position?: number;
    currentStatus?: { currentTime?: number; position?: number };
  };

  const seconds =
    typeof rawPlayer.currentTime === "number"
      ? rawPlayer.currentTime
      : typeof rawPlayer.currentStatus?.currentTime === "number"
        ? rawPlayer.currentStatus.currentTime
        : undefined;

  if (typeof seconds === "number" && Number.isFinite(seconds)) return seconds * 1000;

  const millis =
    typeof rawPlayer.position === "number"
      ? rawPlayer.position
      : typeof rawPlayer.currentStatus?.position === "number"
        ? rawPlayer.currentStatus.position
        : undefined;

  return typeof millis === "number" && Number.isFinite(millis) ? millis : 0;
}

async function seekPlayerToMs(player: SabiCallTonePlayer, positionMs: number) {
  const seconds = Math.max(0, positionMs) / 1000;
  const rawPlayer = player as unknown as {
    seekTo?: (seconds: number) => void | Promise<void>;
    setPositionAsync?: (millis: number) => Promise<void>;
  };

  if (typeof rawPlayer.seekTo === "function") {
    await rawPlayer.seekTo(seconds);
    return;
  }

  if (typeof rawPlayer.setPositionAsync === "function") {
    await rawPlayer.setPositionAsync(Math.max(0, positionMs));
  }
}

export async function createSabiLoopingCallTonePlayer(
  source: AudioSource | number,
  volume: number,
  clip?: SabiCallToneClipOptions,
) {
  const player = createAudioPlayer(source, {
    updateInterval: 500,
    downloadFirst: false,
  }) as SabiCallTonePlayer;

  const clipStartMs = Math.max(0, clip?.clipStartMs ?? 0);
  const clipDurationMs = Math.max(0, clip?.clipDurationMs ?? 0);
  const hasClip = clipDurationMs > 0;
  const clipEndMs = clipStartMs + clipDurationMs;

  try { player.loop = !hasClip; } catch {}
  try { player.volume = volume; } catch {}
  if (hasClip) {
    try { await seekPlayerToMs(player, clipStartMs); } catch {}
  }
  try { player.play(); } catch {}

  if (hasClip) {
    player.__sabiClipTimer = setInterval(() => {
      const nowMs = readPlayerTimeMs(player);
      if (nowMs >= clipEndMs || nowMs + 200 < clipStartMs) {
        void seekPlayerToMs(player, clipStartMs).then(() => {
          try { player.play(); } catch {}
        });
      }
    }, 350);
  }

  return player;
}

export async function stopAndRemoveSabiCallTonePlayer(player: SabiCallTonePlayer | null) {
  if (!player) return;
  if (player.__sabiClipTimer) {
    clearInterval(player.__sabiClipTimer);
    player.__sabiClipTimer = null;
  }
  try { player.pause(); } catch {}
  try { await player.seekTo?.(0); } catch {}
  try { player.remove(); } catch {}
}
