import { selectMessengerTypingByChatId } from "../core/selectors";
import { getMessengerKernelState } from "../core/store";

export function getMessengerTyping(chatId?: string | null) {
  const normalizedChatId =
    typeof chatId === "string" ? chatId.trim() : "";

  if (!normalizedChatId) {
    return null;
  }

  return selectMessengerTypingByChatId(
    getMessengerKernelState(),
    normalizedChatId,
  );
}