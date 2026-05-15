import { selectMessengerPresenceByUserId } from "../core/selectors";
import { getMessengerKernelState } from "../core/store";

export function getMessengerPresence(userId?: string | null) {
  const normalizedUserId =
    typeof userId === "string" ? userId.trim() : "";

  if (!normalizedUserId) {
    return null;
  }

  return selectMessengerPresenceByUserId(
    getMessengerKernelState(),
    normalizedUserId,
  );
}