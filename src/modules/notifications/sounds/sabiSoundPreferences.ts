import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

import type { SabiNotificationSoundKind } from "./sabiNotificationSounds";

export type SabiCustomSoundItem = {
  id: string;
  kind: SabiNotificationSoundKind;
  title: string;
  fileName: string;
  localUri: string;
  mimeType?: string | null;
  createdAt: string;
};

export type SabiSoundPreferences = Record<SabiNotificationSoundKind, string>;

const DOCUMENT_DIRECTORY =
  ((FileSystem as unknown as { documentDirectory?: string }).documentDirectory ||
    (FileSystem as unknown as { Paths?: { document?: { uri?: string } } }).Paths?.document?.uri ||
    "") as string;

const ROOT_DIR = `${DOCUMENT_DIRECTORY.replace(/\/?$/, "/")}sabi-notification-sounds/`;
const CUSTOM_STORE_FILE = `${ROOT_DIR}custom-sounds.json`;
const PREFS_STORE_FILE = `${ROOT_DIR}sound-preferences.json`;

const DEFAULT_PREFS: SabiSoundPreferences = {
  call: "call_neon",
  message: "msg_clean",
  wallet: "wallet_confirm",
  market: "market_alert",
  ai: "ai_ping",
  system: "system_notice",
};

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

async function ensureRoot() {
  await FileSystem.makeDirectoryAsync(ROOT_DIR, { intermediates: true }).catch(() => undefined);
}

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    await ensureRoot();
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return fallback;
    const raw = await FileSystem.readAsStringAsync(path);
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(path: string, value: unknown) {
  await ensureRoot();
  await FileSystem.writeAsStringAsync(path, JSON.stringify(value, null, 2));
}

export async function loadSabiSoundPreferences(): Promise<SabiSoundPreferences> {
  const stored = await readJson<Partial<SabiSoundPreferences>>(PREFS_STORE_FILE, {});
  return {
    ...DEFAULT_PREFS,
    ...stored,
  };
}

export async function saveSabiSoundPreference(kind: SabiNotificationSoundKind, soundId: string) {
  const current = await loadSabiSoundPreferences();
  const next = {
    ...current,
    [kind]: soundId,
  };
  await writeJson(PREFS_STORE_FILE, next);
  return next;
}

export async function listSabiCustomSounds(kind?: SabiNotificationSoundKind) {
  const items = await readJson<SabiCustomSoundItem[]>(CUSTOM_STORE_FILE, []);
  const normalized = Array.isArray(items) ? items : [];
  return kind ? normalized.filter((item) => item.kind === kind) : normalized;
}

export async function pickAndSaveSabiCustomSound(kind: SabiNotificationSoundKind) {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/aac", "audio/mp4"],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  const originalName = safeTitle(asset.name || "");
  const ext = extensionFromName(originalName || "sound.mp3");
  const id = `custom_${kind}_${Date.now()}`;
  const fileName = `${id}.${ext}`;
  const localUri = `${ROOT_DIR}${fileName}`;

  await ensureRoot();
  await FileSystem.copyAsync({
    from: asset.uri,
    to: localUri,
  });

  const item: SabiCustomSoundItem = {
    id,
    kind,
    title: (originalName || id).replace(/\.[a-z0-9]{2,6}$/i, ""),
    fileName,
    localUri,
    mimeType: asset.mimeType ?? null,
    createdAt: new Date().toISOString(),
  };

  const current = await listSabiCustomSounds();
  await writeJson(CUSTOM_STORE_FILE, [item, ...current].slice(0, 80));

  return item;
}

export async function deleteSabiCustomSound(id: string) {
  const items = await listSabiCustomSounds();
  const target = items.find((item) => item.id === id);

  if (target?.localUri) {
    await FileSystem.deleteAsync(target.localUri, { idempotent: true }).catch(() => undefined);
  }

  await writeJson(CUSTOM_STORE_FILE, items.filter((item) => item.id !== id));
}

