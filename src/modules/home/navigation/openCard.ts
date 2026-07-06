import { Alert } from "react-native";
import { router } from "expo-router";

export type HomeCardLike = {
  kind: string;
};

type OpenCardDeps = {
  setSettingsVisible: (visible: boolean) => void;
  openFullMessenger?: () => void;
};

export default function openCard(
  card: HomeCardLike,
  { setSettingsVisible, openFullMessenger }: OpenCardDeps
): void {
  switch (card.kind) {
    case "messenger":
      if (openFullMessenger) {
        openFullMessenger();
      } else {
        router.push("/tabs" as never);
      }
      break;

    case "sabipay":
      router.push("/wallet/send-internal" as never);
      break;

    case "qr":
      router.push("/wallet/qr" as never);
      break;

    case "cards":
      router.push("/wallet/cards" as never);
      break;

    case "marketplace":
      router.push("/more" as never);
      break;

    case "ai":
      router.push("/ai" as never);
      break;

    case "gallery":
      router.push("/gallery" as never);
      break;

    case "settings":
    case "manage":
      setSettingsVisible(true);
      break;

    case "cast":
      router.push("/wifi-cast" as never);
      break;

    case "games":
      Alert.alert(
        "Games",
        "Games module will open from a separate screen."
      );
      break;

    default:
      router.push("/more" as never);
      break;
  }
}