import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createSabiGroupCallRuntime,
  type SabiGroupCallKind,
  type SabiGroupCallRuntime,
  type SabiGroupCallSignalPayload,
  type SabiGroupCallSocket,
} from "./groupCallRuntime";

type UseSabiGroupCallBridgeInput = {
  enabled: boolean;
  callId: string;
  chatId?: string | null;
  selfUserId: string;
  kind: SabiGroupCallKind;
  socket: SabiGroupCallSocket | null | undefined;
  localStream?: any | null;
  onLocalStream?: (stream: any | null) => void;
  onRemoteStream?: (peerUserId: string, stream: any) => void;
  onError?: (message: string) => void;
};

const SABI_GROUP_INVITE_LOCKS = new Map<string, number>();
const GROUP_SIGNAL_EVENTS = ["sabi-call:group:signal"];

function normalizeText(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function hasLiveTracks(stream: any | null | undefined): boolean {
  try {
    const tracks = stream?.getTracks?.() || [];
    return tracks.some((track: any) => track && track.readyState !== "ended");
  } catch {
    return false;
  }
}

function enableTracks(stream: any | null | undefined) {
  try {
    const tracks = stream?.getTracks?.() || [];
    tracks.forEach((track: any) => {
      if (track && "enabled" in track) track.enabled = true;
    });
  } catch {}
}

function isSameCall(payload: unknown, callId: string): payload is SabiGroupCallSignalPayload {
  if (!payload || typeof payload !== "object") return false;

  const record = payload as Record<string, unknown>;
  const incomingCallId =
    normalizeText(record.callId) ||
    normalizeText(record.id) ||
    normalizeText(record.roomId);

  return Boolean(incomingCallId && incomingCallId === callId);
}

function samePeerIds(left: string[], right: string[]) {
  if (left.length !== right.length) return false;

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }

  return true;
}

export function useSabiGroupCallBridge(input: UseSabiGroupCallBridgeInput) {
  const runtimeRef = useRef<SabiGroupCallRuntime | null>(null);
  const latestInputRef = useRef(input);
  latestInputRef.current = input;

  const startLocalMediaInFlightRef = useRef<Promise<any | null> | null>(null);
  const lastStartLocalMediaKeyRef = useRef("");
  const lastPeerIdsKeyRef = useRef("");
  const activeBridgeKeyRef = useRef("");
  const [peerIds, setPeerIdsState] = useState<string[]>([]);
  const [ready, setReadyState] = useState(false);

  const setPeerIds = useCallback((nextPeerIds: string[]) => {
    const normalizedPeerIds = Array.from(new Set(nextPeerIds.filter(Boolean))).sort();
    const nextKey = normalizedPeerIds.join("|");

    if (lastPeerIdsKeyRef.current === nextKey) return;

    lastPeerIdsKeyRef.current = nextKey;
    setPeerIdsState((currentPeerIds) =>
      samePeerIds(currentPeerIds, normalizedPeerIds) ? currentPeerIds : normalizedPeerIds,
    );
  }, []);

  const setReady = useCallback((nextReady: boolean) => {
    setReadyState((currentReady) => (currentReady === nextReady ? currentReady : nextReady));
  }, []);

  /*
    ВАЖНО:
    Не добавляем enabled/chatId в bridgeKey.
    При direct -> group_call handoff эти значения могут мигать,
    и старый код из-за этого закрывал активный pc.
  */
  const bridgeKey = useMemo(
    () => [input.callId, input.selfUserId, input.kind].join("|"),
    [input.callId, input.selfUserId, input.kind],
  );

  const ensureRuntime = useCallback(() => {
    const latest = latestInputRef.current;

    if (!latest.socket || !latest.callId || !latest.selfUserId) {
      latest.onError?.("group_runtime_missing_context");
      return null;
    }

    const current = runtimeRef.current;
    if (current && activeBridgeKeyRef.current === bridgeKey) {
      return current;
    }

    if (current && activeBridgeKeyRef.current && activeBridgeKeyRef.current !== bridgeKey) {
      try {
        current.closeAll(false);
      } catch {}
    }

    const runtime = createSabiGroupCallRuntime({
      callId: latest.callId,
      chatId: latest.chatId,
      selfUserId: latest.selfUserId,
      kind: latest.kind,
      socket: latest.socket,
      localStream: latest.localStream ?? null,
      onLocalStream: (stream) => {
        latestInputRef.current.onLocalStream?.(stream);
      },
      onRemoteStream: (peerUserId, stream) => {
        latestInputRef.current.onRemoteStream?.(peerUserId, stream);
      },
      onPeerState: () => {
        setPeerIds(runtimeRef.current?.getPeerIds() ?? []);
      },
      onError: (message) => {
        latestInputRef.current.onError?.(message);
      },
    });

    runtimeRef.current = runtime;
    activeBridgeKeyRef.current = bridgeKey;
    setPeerIds(runtime.getPeerIds());

    return runtime;
  }, [bridgeKey, setPeerIds]);

  useEffect(() => {
    const latest = latestInputRef.current;

    if (!latest.socket || !latest.callId || !latest.selfUserId) {
      startLocalMediaInFlightRef.current = null;
      lastStartLocalMediaKeyRef.current = "";
      lastPeerIdsKeyRef.current = "__reset__";
      activeBridgeKeyRef.current = "";
      setReady(false);
      setPeerIds([]);
      return undefined;
    }

    if (!latest.enabled) {
      /*
        Не закрываем runtime, пока участник ещё ringing / принимает.
        Иначе group handoff убивает активный peer connection.
      */
      setReady(false);
      setPeerIds(runtimeRef.current?.getPeerIds() ?? []);
      return undefined;
    }

    const runtime = ensureRuntime();
    if (!runtime) {
      setReady(false);
      return undefined;
    }

    setReady(true);
    setPeerIds(runtime.getPeerIds());

    const handleSignal = (payload: unknown) => {
      const currentCallId = latestInputRef.current.callId;

      if (!isSameCall(payload, currentCallId)) return;

      void runtimeRef.current?.handleSignal(payload as SabiGroupCallSignalPayload);
    };

    for (const eventName of GROUP_SIGNAL_EVENTS) {
      latest.socket.on?.(eventName, handleSignal);
    }

    return () => {
      for (const eventName of GROUP_SIGNAL_EVENTS) {
        latest.socket?.off?.(eventName, handleSignal);
      }
    };
  }, [bridgeKey, ensureRuntime, input.enabled, input.socket, setPeerIds, setReady]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    const stream = input.localStream ?? null;

    if (stream && hasLiveTracks(stream)) {
      enableTracks(stream);
      runtime.setLocalStream(stream);
    }
  }, [input.localStream]);

  const startLocalMedia = useCallback(async () => {
    const latest = latestInputRef.current;
    const runtime = ensureRuntime();

    if (!runtime) return null;

    const existingStream = runtime.getLocalStream?.() || latest.localStream || null;

    if (existingStream && hasLiveTracks(existingStream)) {
      enableTracks(existingStream);
      latest.onLocalStream?.(existingStream);
      setReady(true);
      return existingStream;
    }

    const startKey = [latest.callId, latest.selfUserId, latest.kind].join("|");

    if (lastStartLocalMediaKeyRef.current === startKey && startLocalMediaInFlightRef.current) {
      return startLocalMediaInFlightRef.current;
    }

    if (startLocalMediaInFlightRef.current) {
      return startLocalMediaInFlightRef.current;
    }

    lastStartLocalMediaKeyRef.current = startKey;

    const mediaPromise = runtime
      .startLocalMedia(latest.kind)
      .then((stream) => {
        if (stream && hasLiveTracks(stream)) {
          enableTracks(stream);
          latestInputRef.current.onLocalStream?.(stream);
          setReady(true);
        }

        return stream;
      })
      .catch((error) => {
        latestInputRef.current.onError?.(
          error instanceof Error ? error.message : "group_local_media_failed",
        );

        return null;
      })
      .finally(() => {
        if (startLocalMediaInFlightRef.current === mediaPromise) {
          startLocalMediaInFlightRef.current = null;
        }
      });

    startLocalMediaInFlightRef.current = mediaPromise;
    return mediaPromise;
  }, [ensureRuntime, setReady]);

  const inviteParticipant = useCallback(
    async (peerUserId: string, options?: { force?: boolean }) => {
      const latest = latestInputRef.current;
      const target = normalizeText(peerUserId);

      if (!target || target === latest.selfUserId) return;

      const runtime = ensureRuntime();
      if (!runtime) return;

      const stream = await startLocalMedia();

      if (!stream || !hasLiveTracks(stream)) {
        latestInputRef.current.onError?.("group_local_media_not_ready");
        return;
      }

      const inviteKey = [latest.callId, latest.selfUserId, target].join("|");
      const now = Date.now();
      const lastInviteAt = SABI_GROUP_INVITE_LOCKS.get(inviteKey) || 0;
      const forceInvite = Boolean(options?.force);

      /*
        ВАЖНО:
        Обычный invite блокируем 12 секунд.
        Но force invite после accepted разрешаем быстрее.
        Это нужно, чтобы 3-й участник сразу получил group mesh,
        но старая пара 1↔2 не получила повторный offer.
      */
      if (!forceInvite && now - lastInviteAt < 12000) return;

      if (forceInvite && now - lastInviteAt < 900) return;

      SABI_GROUP_INVITE_LOCKS.set(inviteKey, now);

      await runtime.invitePeer(target, { force: forceInvite });

      setReady(true);
      setPeerIds(runtime.getPeerIds());
    },
    [ensureRuntime, setPeerIds, setReady, startLocalMedia],
  );

  const closeParticipant = useCallback(
    (peerUserId: string) => {
      runtimeRef.current?.closePeer(peerUserId);
      setPeerIds(runtimeRef.current?.getPeerIds() ?? []);
    },
    [setPeerIds],
  );

  const closeAll = useCallback(
    (notify = true) => {
      const runtime = runtimeRef.current;

      runtimeRef.current = null;
      activeBridgeKeyRef.current = "";
      lastStartLocalMediaKeyRef.current = "";
      startLocalMediaInFlightRef.current = null;

      try {
        runtime?.closeAll(Boolean(notify));
      } catch {}

      setReady(false);
      setPeerIds([]);
    },
    [setPeerIds, setReady],
  );

  return {
    ready,
    peerIds,
    inviteParticipant,
    startLocalMedia,
    closeParticipant,
    closeAll,
  };
}