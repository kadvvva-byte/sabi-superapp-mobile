import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  language: "app_language",
  countryCode: "app_country_code",
};

export const appStorage = {
  async setString(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },

  async getString(key: string) {
    return AsyncStorage.getItem(key);
  },

  async remove(key: string) {
    await AsyncStorage.removeItem(key);
  },
};