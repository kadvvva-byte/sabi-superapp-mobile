import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { ResizeMode, Video } from "expo-av";
import * as FileSystemLegacy from "expo-file-system/legacy";

import { getAuthSessionState } from "../../../core/kernel/auth/session.store";
import { resolveSabiApiBaseUrl } from "../../../shared/network/sabiApiBaseUrl";

type UniversalVideoPlayerProps = {
  uri: string;
  mimeType?: string | null;
  style: StyleProp<ViewStyle>;
  resizeMode?: ResizeMode;
  shouldPlay: boolean;
  isMuted?: boolean;
  useNativeControls?: boolean;
  progressUpdateIntervalMillis?: number;
  onReady?: () => void;
  onLoadError?: (errorKey: string) => void;
  onFinished?: () => void;
};

type VideoSource = {
  uri: string;
  headers?: Record<string, string>;
  overrideFileExtensionAndroid?: string;
};

const VIDEO_EXTENSION_BY_MIME: Record<string, string> = {
  "application/vnd.apple.mpegurl": "m3u8",
  "application/x-mpegurl": "m3u8",
  "video/mp4": "mp4",
  "video/x-m4v": "m4v",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-matroska": "mkv",
  "video/x-msvideo": "avi",
  "video/avi": "avi",
  "video/3gpp": "3gp",
  "video/3gpp2": "3g2",
  "video/mpeg": "mpeg",
  "video/x-ms-wmv": "wmv",
  "video/x-flv": "flv",
  "video/ogg": "ogv",
};

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16);
}

function extensionFromUri(uri?: string | null) {
  const clean = String(uri ?? "").split("?")[0].split("#")[0].trim().toLowerCase();
  const match = clean.match(/\.([a-z0-9]{1,12})$/i);
  return match?.[1]?.toLowerCase() ?? "";
}

function extensionFromMime(mimeType?: string | null) {
  const mime = String(mimeType ?? "").trim().toLowerCase();
  if (!mime) return "";
  return VIDEO_EXTENSION_BY_MIME[mime] ?? "";
}

function resolveVideoExtension(uri?: string | null, mimeType?: string | null) {
  const fromUri = extensionFromUri(uri);
  if (fromUri) return fromUri;
  return extensionFromMime(mimeType) || "mp4";
}

function hasReadableScheme(uri: string) {
  return /^(file|content|asset|assets-library|ph|http|https|data):/i.test(uri);
}

function isHttpVideoUri(uri: string) {
  return /^https?:\/\//i.test(uri);
}

function isLocalVideoUri(uri: string) {
  return /^(file|content|asset|assets-library|ph|data):/i.test(uri);
}

function getPlaybackApiBaseUrl() {
  const auth = getAuthSessionState();
  return (
    resolveSabiApiBaseUrl(auth.apiBaseUrl) ??
    resolveSabiApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL)
  );
}

function normalizePlaybackUri(uri: string) {
  const raw = String(uri ?? "").trim();
  if (!raw) return raw;

  if (isLocalVideoUri(raw)) return raw;

  const apiBase = getPlaybackApiBaseUrl();

  const localhostMatch = raw.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)$/i);
  if (localhostMatch && apiBase && !/^(https?:\/\/)?(localhost|127\.0\.0\.1)(:|\/|$)/i.test(apiBase)) {
    return apiBase + (localhostMatch[3] || "");
  }

  if (/^https?:\/\//i.test(raw)) return raw;

  if (!apiBase) return raw;

  if (/^\/?uploads\//i.test(raw)) {
    const filename = encodeURIComponent(raw.replace(/^\/?uploads\//i, "").split("/").pop() || "");
    return filename ? apiBase + "/api/v2/media/files/" + filename : apiBase + "/" + raw.replace(/^\/+/, "");
  }

  return apiBase + (raw.startsWith("/") ? raw : "/" + raw);
}

function buildVideoSource(uri: string, mimeType?: string | null): VideoSource {
  return {
    uri,
    headers: isLocalVideoUri(uri)
      ? undefined
      : {
          Accept: "video/mp4,video/quicktime,video/webm,video/3gpp,video/*;q=0.9,*/*;q=0.8",
        },
    overrideFileExtensionAndroid: resolveVideoExtension(uri, mimeType),
  };
}

function shouldCopyLocalToCache(uri: string, mimeType?: string | null) {
  if (/^content:/i.test(uri)) return true;
  if (/^file:/i.test(uri) && !extensionFromUri(uri) && Boolean(extensionFromMime(mimeType))) return true;
  return false;
}

async function copyLocalVideoToCache(uri: string, mimeType?: string | null) {
  if (!shouldCopyLocalToCache(uri, mimeType)) return uri;

  const cacheRoot = FileSystemLegacy.cacheDirectory || FileSystemLegacy.documentDirectory;
  if (!cacheRoot) return uri;

  const extension = resolveVideoExtension(uri, mimeType) || "mp4";
  const target = `${cacheRoot}sabi-video-local-${Date.now()}-${hashString(uri)}.${extension}`;
  await FileSystemLegacy.copyAsync({ from: uri, to: target });
  return target;
}

async function downloadHttpVideoToCache(uri: string, mimeType?: string | null) {
  const cacheRoot = FileSystemLegacy.cacheDirectory || FileSystemLegacy.documentDirectory;
  if (!cacheRoot) return null;

  const extension = resolveVideoExtension(uri, mimeType) || "mp4";
  const target = `${cacheRoot}sabi-video-http-${Date.now()}-${hashString(uri)}.${extension}`;
  const result = await FileSystemLegacy.downloadAsync(uri, target, {
    headers: {
      Accept: "video/mp4,video/quicktime,video/webm,video/3gpp,video/*;q=0.9,*/*;q=0.8",
    },
  });

  if (result.status >= 200 && result.status < 300 && result.uri) {
    return result.uri;
  }

  return null;
}

export function UniversalVideoPlayer({
  uri,
  mimeType,
  style,
  resizeMode = ResizeMode.CONTAIN,
  shouldPlay,
  isMuted = false,
  useNativeControls = false,
  progressUpdateIntervalMillis = 250,
  onReady,
  onLoadError,
  onFinished,
}: UniversalVideoPlayerProps) {
  const videoRef = useRef<Video | null>(null);
  const finishedRef = useRef(false);
  const lastShouldPlayRef = useRef(false);
  const fallbackAttemptedRef = useRef(false);
  const [playbackUri, setPlaybackUri] = useState(uri);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const prepare = async () => {
      finishedRef.current = false;
      lastShouldPlayRef.current = false;
      fallbackAttemptedRef.current = false;
      setLoadError(null);

      const nextUri = normalizePlaybackUri(String(uri ?? "").trim());
      if (!nextUri || !hasReadableScheme(nextUri)) {
        setPlaybackUri(nextUri);
        setLoadError("video_uri_unavailable");
        onLoadError?.("video_uri_unavailable");
        return;
      }

      setResolving(true);
      try {
        const readyUri = await copyLocalVideoToCache(nextUri, mimeType);
        if (!cancelled) {
          setPlaybackUri(readyUri);
          setReloadKey((current) => current + 1);
        }
      } catch {
        if (!cancelled) {
          setPlaybackUri(nextUri);
          setReloadKey((current) => current + 1);
        }
      } finally {
        if (!cancelled) setResolving(false);
      }
    };

    void prepare();

    return () => {
      cancelled = true;
    };
  }, [mimeType, onLoadError, uri]);

  const loadHttpFallback = useCallback(async () => {
    if (!isHttpVideoUri(playbackUri) || fallbackAttemptedRef.current) {
      setLoadError("video_format_not_supported");
      onLoadError?.("video_format_not_supported");
      return;
    }

    fallbackAttemptedRef.current = true;
    setResolving(true);

    try {
      const cachedUri = await downloadHttpVideoToCache(playbackUri, mimeType);
      if (cachedUri) {
        setLoadError(null);
        setPlaybackUri(cachedUri);
        setReloadKey((current) => current + 1);
        return;
      }

      setLoadError("video_load_failed");
      onLoadError?.("video_load_failed");
    } catch {
      setLoadError("video_load_failed");
      onLoadError?.("video_load_failed");
    } finally {
      setResolving(false);
    }
  }, [mimeType, onLoadError, playbackUri]);

  useEffect(() => {
    const updatePlayback = async () => {
      const video = videoRef.current;
      if (!video) {
        lastShouldPlayRef.current = shouldPlay;
        return;
      }

      if (!shouldPlay || loadError || resolving) {
        try {
          await video.pauseAsync();
        } catch {}
        lastShouldPlayRef.current = shouldPlay;
        return;
      }

      try {
        if (finishedRef.current || !lastShouldPlayRef.current) {
          finishedRef.current = false;
          await video.replayAsync();
          return;
        }

        await video.playAsync();
      } catch {
        // Native player can reject play/replay until the source is ready.
      } finally {
        lastShouldPlayRef.current = shouldPlay;
      }
    };

    void updatePlayback();
  }, [loadError, playbackUri, resolving, shouldPlay]);

  const source = useMemo(() => buildVideoSource(playbackUri, mimeType), [mimeType, playbackUri]);

  return (
    <Video
      ref={(ref) => {
        videoRef.current = ref;
      }}
      key={`${playbackUri}-${reloadKey}`}
      source={source as any}
      style={style}
      resizeMode={resizeMode}
      shouldPlay={shouldPlay && !loadError && !resolving}
      isLooping={false}
      isMuted={isMuted}
      useNativeControls={useNativeControls}
      progressUpdateIntervalMillis={progressUpdateIntervalMillis}
      onLoadStart={() => {
        if (!resolving) setLoadError(null);
      }}
      onLoad={() => {
        finishedRef.current = false;
        setLoadError(null);
        onReady?.();
      }}
      onReadyForDisplay={() => {
        finishedRef.current = false;
        setLoadError(null);
        onReady?.();
      }}
      onError={() => {
        void loadHttpFallback();
      }}
      onPlaybackStatusUpdate={(status) => {
        if (!status?.isLoaded) {
          if ((status as any)?.error) {
            void loadHttpFallback();
          }
          return;
        }

        if (status.didJustFinish) {
          finishedRef.current = true;
          lastShouldPlayRef.current = false;
          onFinished?.();
        }
      }}
    />
  );
}
