import AsyncStorage from "@react-native-async-storage/async-storage";
import { HomeBackgroundState } from "./background.types";

const HOME_BACKGROUND_KEY = "sabi_home_background";

const DEFAULT_BACKGROUND: HomeBackgroundState = {
  type: "default",
  uri: null,
};

export async function saveHomeBackground(
  background: HomeBackgroundState
): Promise<void> {
  await AsyncStorage.setItem(HOME_BACKGROUND_KEY, JSON.stringify(background));
}

export async function getHomeBackground(): Promise<HomeBackgroundState> {
  const raw = await AsyncStorage.getItem(HOME_BACKGROUND_KEY);

  if (!raw) {
    return DEFAULT_BACKGROUND;
  }

  try {
    const parsed = JSON.parse(raw) as HomeBackgroundState;

    return {
      type: parsed.type ?? "default",
      uri: parsed.uri ?? null,
    };
  } catch {
    return DEFAULT_BACKGROUND;
  }
}

export async function clearHomeBackground(): Promise<void> {
  await AsyncStorage.removeItem(HOME_BACKGROUND_KEY);
}
