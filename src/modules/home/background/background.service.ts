import * as ImagePicker from "expo-image-picker";
import {
  clearHomeBackground,
  getHomeBackground,
  saveHomeBackground,
} from "./background.store";
import { HomeBackgroundState } from "./background.types";

export async function requestPhotoPermission(): Promise<boolean> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return permission.granted;
}

export async function pickHomeBackgroundImage(): Promise<HomeBackgroundState | null> {
  const hasPermission = await requestPhotoPermission();

  if (!hasPermission) {
    throw new Error("Media library permission was denied");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsEditing: true,
    aspect: [9, 19],
  });

  if (result.canceled) {
    return null;
  }

  const uri = result.assets?.[0]?.uri ?? null;

  if (!uri) {
    return null;
  }

  const nextBackground: HomeBackgroundState = {
    type: "image",
    uri,
  };

  await saveHomeBackground(nextBackground);

  return nextBackground;
}

export async function loadHomeBackground(): Promise<HomeBackgroundState> {
  return getHomeBackground();
}

export async function resetHomeBackground(): Promise<HomeBackgroundState> {
  await clearHomeBackground();

  return {
    type: "default",
    uri: null,
  };
}
