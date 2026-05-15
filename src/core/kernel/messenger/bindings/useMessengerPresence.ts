import { useMemo, useSyncExternalStore } from "react";
import { selectMessengerPresenceByUserId } from "../core/selectors";
import { getMessengerKernelState, subscribeMessengerKernelStore } from "../core/store";

function normalizeUserId(userId?: string | null) {
  return typeof userId === "string" ? userId.trim() : "";
}

function getPresenceSnapshot(userId: string) {
  if (!userId) {
    return null;
  }

  return selectMessengerPresenceByUserId(
    getMessengerKernelState(),
    userId,
  );
}

export function useMessengerPresence(userId?: string | null) {
  const normalizedUserId = useMemo(() => normalizeUserId(userId), [userId]);

  return useSyncExternalStore(
    subscribeMessengerKernelStore,
    () => getPresenceSnapshot(normalizedUserId),
    () => getPresenceSnapshot(normalizedUserId),
  );
}