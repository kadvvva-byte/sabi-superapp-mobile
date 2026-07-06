import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

import {
  getSabiBundledSoundSource,
  isSabiBundledSoundForKind,
  SABI_NOTIFICATION_SOUND_DEFAULTS,
  type SabiNotificationSoundKind,
} from "./sabiNotificationSounds";

export type SabiCustomSoundItem = {
  id: string;
  kind: SabiNotificationSoundKind;
  title: string;
  fileName: string;
  localUri: string;
  mimeType?: string | null;
  createdAt: string;
  clipStartMs?: number;
  clipDurationMs?: number;
};

export type SabiSoundPreferences = Record<SabiNotificationSoundKind, string>;

export type SabiResolvedSound = {
  id: string;
  kind: SabiNotificationSoundKind;
  source: number | { uri: string };
  isCustom: boolean;
  clipStartMs?: number;
  clipDurationMs?: number;
};

export const SABI_CALL_CUSTOM_MP3_CLIP_DURATION_MS = 30000;

const DOCUMENT_DIRECTORY =
  ((FileSystem as unknown as { documentDirectory?: string }).documentDirectory ||
    (FileSystem as unknown as { Paths?: { document?: { uri?: string } } }).Paths?.document?.uri ||
    "") as string;

const ROOT_DIR = `${DOCUMENT_DIRECTORY.replace(/\/?$/, "/")}sabi-notification-sounds/`;
const CUSTOM_STORE_KEY = "sabi.notificationSounds.custom.v1";
const PREFS_STORE_KEY = "sabi.notificationSounds.preferences.v1";
const LEGACY_CUSTOM_STORE_FILE = `${ROOT_DIR}custom-sounds.json`;
const LEGACY_PREFS_STORE_FILE = `${ROOT_DIR}sound-preferences.json`;

const DEFAULT_PREFS: SabiSoundPreferences = { ...SABI_NOTIFICATION_SOUND_DEFAULTS };

function safeTitle(value: string) {
  return value
    .replace(/[^\p{L}\p{N}\-_ .]/gu, "")
    .trim()
    .slice(0, 64);
}

function extensionFromName(name: string) {
  const match = name.match(/\.([a-z0-9]{2,6})$/i);
  return match ? match[1].toLowerCase() : "mp3";
}

function isMp3Extension(ext: string) {
  return ext.toLowerCase() === "mp3";
}

async function ensureRoot() {
  if (!DOCUMENT_DIRECTORY) throw new Error("file_system_document_directory_unavailable");
  await FileSystem.makeDirectoryAsync(ROOT_DIR, { intermediates: true }).catch(() => undefined);
}

async function readJson<T>(storageKey: string, legacyPath: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (raw) return JSON.parse(raw) as T;
  } catch {}

  // Older builds briefly stored these settings in FileSystem. Read them once through
  // the legacy API so Expo SDK 54 does not throw runtime errors from the default API.
  try {
    await ensureRoot();
    const info = await FileSystem.getInfoAsync(legacyPath);
    if (!info.exists) return fallback;
    const raw = await FileSystem.readAsStringAsync(legacyPath);
    const parsed = JSON.parse(raw) as T;
    await AsyncStorage.setItem(storageKey, JSON.stringify(parsed));
    return parsed;
  } catch {
    return fallback;
  }
}

async function writeJson(storageKey: string, value: unknown) {
  await AsyncStorage.setItem(storageKey, JSON.stringify(value));
}

function normalizeStoredPreferences(stored: Partial<SabiSoundPreferences>): SabiSoundPreferences {
  return {
    ...DEFAULT_PREFS,
    ...stored,
  };
}

export async function loadSabiSoundPreferences(): Promise<SabiSoundPreferences> {
  const stored = await readJson<Partial<SabiSoundPreferences>>(PREFS_STORE_KEY, LEGACY_PREFS_STORE_FILE, {});
  return normalizeStoredPreferences(stored);
}

export async function saveSabiSoundPreference(kind: SabiNotificationSoundKind, soundId: string) {
  const safeSoundId = soundId.trim();
  const customItems = await listSabiCustomSounds(kind);
  const customItem = customItems.find((item) => item.id === safeSoundId) || null;

  // MP3/custom files are allowed only for incoming call ringtone. Signals/messages/services
  // must stay on bundled short sounds so notification sound behavior is deterministic.
  if (customItem && kind !== "call") {
    throw new Error("custom_sound_allowed_only_for_call");
  }

  const isBundledForKind = isSabiBundledSoundForKind(kind, safeSoundId);
  const nextSoundId = customItem || isBundledForKind ? safeSoundId : DEFAULT_PREFS[kind];
  const current = await loadSabiSoundPreferences();
  const next = {
    ...current,
    [kind]: nextSoundId,
  };
  await writeJson(PREFS_STORE_KEY, next);
  return next;
}

export async function listSabiCustomSounds(kind?: SabiNotificationSoundKind) {
  const items = await readJson<SabiCustomSoundItem[]>(CUSTOM_STORE_KEY, LEGACY_CUSTOM_STORE_FILE, []);
  const normalized = Array.isArray(items) ? items : [];
  const callOnly = normalized.filter((item) => item.kind === "call");
  return kind ? callOnly.filter((item) => item.kind === kind) : callOnly;
}

export async function pickAndSaveSabiCustomSound(kind: SabiNotificationSoundKind) {
  if (kind !== "call") {
    throw new Error("custom_mp3_allowed_only_for_call");
  }

  const result = await DocumentPicker.getDocumentAsync({
    type: ["audio/mpeg", "audio/mp3", "audio/*"],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  const originalName = safeTitle(asset.name || "");
  const ext = extensionFromName(originalName || "call-ringtone.mp3");
  if (!isMp3Extension(ext)) {
    throw new Error("only_mp3_supported_for_call_ringtone");
  }

  const id = `custom_call_${Date.now()}`;
  const fileName = `${id}.mp3`;
  const localUri = `${ROOT_DIR}${fileName}`;

  await ensureRoot();
  await FileSystem.copyAsync({
    from: asset.uri,
    to: localUri,
  });

  const item: SabiCustomSoundItem = {
    id,
    kind: "call",
    title: (originalName || id).replace(/\.[a-z0-9]{2,6}$/i, ""),
    fileName,
    localUri,
    mimeType: asset.mimeType ?? "audio/mpeg",
    clipStartMs: 0,
    clipDurationMs: SABI_CALL_CUSTOM_MP3_CLIP_DURATION_MS,
    createdAt: new Date().toISOString(),
  };

  const current = await listSabiCustomSounds();
  await writeJson(CUSTOM_STORE_KEY, [item, ...current].slice(0, 40));

  return item;
}

export async function deleteSabiCustomSound(id: string) {
  const items = await listSabiCustomSounds();
  const target = items.find((item) => item.id === id);

  if (target?.localUri) {
    await FileSystem.deleteAsync(target.localUri, { idempotent: true }).catch(() => undefined);
  }

  await writeJson(CUSTOM_STORE_KEY, items.filter((item) => item.id !== id));

  const preferences = await loadSabiSoundPreferences();
  if (Object.values(preferences).includes(id)) {
    const next: SabiSoundPreferences = { ...preferences };
    (Object.keys(next) as SabiNotificationSoundKind[]).forEach((kind) => {
      if (next[kind] === id) next[kind] = DEFAULT_PREFS[kind];
    });
    await writeJson(PREFS_STORE_KEY, next);
  }
}

export async function resolveSabiSoundForKind(kind: SabiNotificationSoundKind): Promise<SabiResolvedSound> {
  const preferences = await loadSabiSoundPreferences();
  const selectedId = preferences[kind] || DEFAULT_PREFS[kind];

  if (kind === "call") {
    const custom = (await listSabiCustomSounds("call")).find((item) => item.id === selectedId);
    if (custom?.localUri) {
      return {
        id: custom.id,
        kind: "call",
        source: { uri: custom.localUri },
        isCustom: true,
        clipStartMs: custom.clipStartMs ?? 0,
        clipDurationMs: custom.clipDurationMs ?? SABI_CALL_CUSTOM_MP3_CLIP_DURATION_MS,
      };
    }
  }

  const bundledId = isSabiBundledSoundForKind(kind, selectedId) ? selectedId : DEFAULT_PREFS[kind];
  return {
    id: bundledId,
    kind,
    source: getSabiBundledSoundSource(bundledId),
    isCustom: false,
  };
}
