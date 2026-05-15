import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  language: "app_language",
  countryCode: "app_country_code",
  authSession: "auth_session",
};

export const appStorage = {
  async setString(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },

  async getString(key: string) {
    return AsyncStorage.getItem(key);
  },

  async setJson<T>(key: string, value: T | null) {
    if (value === null) {
      await AsyncStorage.removeItem(key);
      return;
    }

    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async getJson<T>(key: string): Promise<T | null> {
    const rawValue = await AsyncStorage.getItem(key);

    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      await AsyncStorage.removeItem(key);
      return null;
    }
  },

  async remove(key: string) {
    await AsyncStorage.removeItem(key);
  },
};