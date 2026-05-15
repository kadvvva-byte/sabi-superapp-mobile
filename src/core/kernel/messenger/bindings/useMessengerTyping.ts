import { useMemo, useSyncExternalStore } from "react";
import { selectMessengerTypingByChatId } from "../core/selectors";
import { getMessengerKernelState, subscribeMessengerKernelStore } from "../core/store";

function normalizeChatId(chatId?: string | null) {
  return typeof chatId === "string" ? chatId.trim() : "";
}

function getTypingSnapshot(chatId: string) {
  if (!chatId) {
    return null;
  }

  return selectMessengerTypingByChatId(
    getMessengerKernelState(),
    chatId,
  );
}

export function useMessengerTyping(chatId?: string | null) {
  const normalizedChatId = useMemo(() => normalizeChatId(chatId), [chatId]);

  return useSyncExternalStore(
    subscribeMessengerKernelStore,
    () => getTypingSnapshot(normalizedChatId),
    () => getTypingSnapshot(normalizedChatId),
  );
}