import { router } from "expo-router";

export type DockKind = "call" | "chat" | "wallet" | "more";

export default function openDock(kind: DockKind): void {
  switch (kind) {
    case "call":
      router.push("/tabs/calls" as never);
      break;
    case "chat":
      router.push("/tabs/chats" as never);
      break;
    case "wallet":
      router.push("/tabs/wallet" as never);
      break;
    case "more":
      router.push("/more" as never);
      break;
  }
}