import { router } from "expo-router";

import {
  getChatPartnerInfoRouteParams,
  getRoomSettingsState,
  setChatArchived,
  setChatBlocked,
  setChatMuted,
  setChatPinned,
} from "./data";
import type { RoomSettingsToolId } from "./types";

export type RoomSettingsActionId = Exclude<RoomSettingsToolId, "theme" | "more">;

type Args = {
  chatId: string;
  fallbackName?: string;
  toolId: RoomSettingsActionId;
  onOpenTheme: () => void;
  onCloseMenu?: () => void;
  onStateChanged?: () => void;
  profilePathname?: string;
};

function goToToolScreen(chatId: string, tool: string, fallbackName?: string) {
  router.push({
    pathname: "/chat-tool" as never,
    params: {
      chatId,
      tool,
      fallbackName: fallbackName ?? "",
    },
  });
}

export function handleRoomSettingsAction({
  chatId,
  fallbackName,
  toolId,
  onOpenTheme,
  onCloseMenu,
  onStateChanged,
  profilePathname = "/chat-partner-info",
}: Args) {
  const state = getRoomSettingsState(chatId, fallbackName);

  switch (toolId) {
    case "add_contact": {
      router.push({
        pathname: "/tabs/contacts" as never,
        params: {
          mode: "create",
          source: "chat_room_settings",
          chatId,
        },
      });
      onCloseMenu?.();
      return;
    }

    case "editor": {
      router.push({
        pathname: profilePathname as never,
        params: getChatPartnerInfoRouteParams(chatId, fallbackName),
      });
      onCloseMenu?.();
      return;
    }

    case "add_to_list": {
      const isPinned = Boolean(state.chatActions?.isPinned);
      setChatPinned(chatId, !isPinned);
      onStateChanged?.();
      onCloseMenu?.();
      return;
    }

    case "mute": {
      const isMuted = Boolean(state.notifications?.muted);
      setChatMuted(chatId, !isMuted);
      onStateChanged?.();
      onCloseMenu?.();
      return;
    }

    case "disappearing": {
      goToToolScreen(chatId, "disappearing", fallbackName);
      onCloseMenu?.();
      return;
    }

    case "report": {
      goToToolScreen(chatId, "report", fallbackName);
      onCloseMenu?.();
      return;
    }

    case "block": {
      const isBlocked = Boolean(state.block?.isBlocked);
      setChatBlocked(chatId, !isBlocked);
      onStateChanged?.();
      onCloseMenu?.();
      return;
    }

    case "clear_chat": {
      goToToolScreen(chatId, "clear_chat", fallbackName);
      onCloseMenu?.();
      return;
    }

    case "export_chat": {
      goToToolScreen(chatId, "export_chat", fallbackName);
      onCloseMenu?.();
      return;
    }

    case "add_to_home": {
      goToToolScreen(chatId, "add_to_home", fallbackName);
      onCloseMenu?.();
      return;
    }

    default: {
      onCloseMenu?.();
      return;
    }
  }
}

export function togglePinFromSettings(chatId: string, fallbackName?: string) {
  const state = getRoomSettingsState(chatId, fallbackName);
  setChatPinned(chatId, !Boolean(state.chatActions?.isPinned));
  return getRoomSettingsState(chatId, fallbackName);
}

export function toggleArchiveFromSettings(chatId: string, fallbackName?: string) {
  const state = getRoomSettingsState(chatId, fallbackName);
  setChatArchived(chatId, !Boolean(state.chatActions?.isArchived));
  return getRoomSettingsState(chatId, fallbackName);
}