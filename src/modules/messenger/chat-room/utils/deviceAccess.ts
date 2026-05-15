
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Contacts from "expo-contacts";
import * as Location from "expo-location";
import { Audio } from "expo-av";

export type CameraOrGalleryResult = {
  kind: "image" | "video";
  uri: string;
  fileName: string;
  mimeType?: string | null;
  fileSize?: number | null;
  durationMs?: number | null;
  durationLabel?: string;
  title: string;
  subtitle: string;
  messageText: string;
  notice: string;
};

export type PickedDocument = {
  name: string;
  uri: string;
  mimeType?: string | null;
  size?: number | null;
  extension: string;
  kindLabel: string;
  meta: string;
};

export type PickedContact = {
  id?: string;
  name: string;
  phone: string;
  role: string;
  username?: string;
  userId?: string;
  chatId?: string;
  avatarUrl?: string;
  source?: "phone" | "sabi";
};

export type PickedLocation = {
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  mapLabel: string;
};

export type ActiveVoiceRecording = Audio.Recording;

export type VoiceMessageResult = {
  kind: "audio";
  title: string;
  subtitle: string;
  messageText: string;
  notice: string;
  uri: string;
  durationMs: number;
  durationLabel: string;
};

export type VideoMessageResult = {
  kind: "video";
  title: string;
  subtitle: string;
  messageText: string;
  notice: string;
  uri: string;
  durationMs: number;
  durationLabel: string;
  fileLabel: string;
};

let activeVoiceRecording: Audio.Recording | null = null;

function readableBytes(size?: number | null) {
  if (!size || size <= 0) return "unknown size";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function fileNameFromUri(uri?: string | null) {
  if (!uri) return "File";
  const clean = uri.split("?")[0];
  const parts = clean.split("/");
  return parts[parts.length - 1] || "File";
}

function extensionFromName(name?: string | null) {
  if (!name) return "";
  const clean = name.trim().toLowerCase().split("?")[0].split("#")[0];
  const idx = clean.lastIndexOf(".");
  return idx >= 0 ? clean.slice(idx + 1) : "";
}

function mimeTypeFromMediaExtension(extension: string, kind: "image" | "video") {
  const ext = extension.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
    gif: "image/gif",
    bmp: "image/bmp",
    mp4: "video/mp4",
    m4v: "video/x-m4v",
    mov: "video/quicktime",
    webm: "video/webm",
    mkv: "video/x-matroska",
    avi: "video/x-msvideo",
    "3gp": "video/3gpp",
    "3g2": "video/3gpp2",
    mpeg: "video/mpeg",
    mpg: "video/mpeg",
    wmv: "video/x-ms-wmv",
    flv: "video/x-flv",
    ogv: "video/ogg",
  };
  return map[ext] || (kind === "video" ? "video/mp4" : "image/jpeg");
}


function extensionFromMimeType(mimeType?: string | null, fallbackKind?: "image" | "video" | "document") {
  const mime = String(mimeType ?? "").trim().toLowerCase();
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
    "image/gif": "gif",
    "image/bmp": "bmp",
    "video/mp4": "mp4",
    "video/x-m4v": "m4v",
    "video/quicktime": "mov",
    "video/webm": "webm",
    "video/x-matroska": "mkv",
    "video/x-msvideo": "avi",
    "video/avi": "avi",
    "video/3gpp": "3gp",
    "video/3gpp2": "3g2",
    "video/mpeg": "mpeg",
    "video/x-ms-wmv": "wmv",
    "video/x-flv": "flv",
    "video/ogg": "ogv",
    "application/pdf": "pdf",
    "text/plain": "txt",
    "text/csv": "csv",
    "application/json": "json",
    "application/xml": "xml",
    "text/html": "html",
    "text/markdown": "md",
    "application/rtf": "rtf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "application/vnd.oasis.opendocument.text": "odt",
    "application/vnd.oasis.opendocument.spreadsheet": "ods",
    "application/vnd.oasis.opendocument.presentation": "odp",
    "application/epub+zip": "epub",
    "application/zip": "zip",
    "application/vnd.rar": "rar",
    "application/x-7z-compressed": "7z",
  };

  if (map[mime]) return map[mime];
  if (mime.startsWith("image/")) return mime.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  if (mime.startsWith("video/")) return mime.split("/")[1]?.replace(/^x-/, "") || "mp4";
  if (fallbackKind === "image") return "jpg";
  if (fallbackKind === "video") return "mp4";
  return "bin";
}

function ensureFileNameExtension(name: string, mimeType?: string | null, fallbackKind?: "image" | "video" | "document") {
  const fallbackExtension = extensionFromMimeType(mimeType, fallbackKind);
  const safeName = String(name || `file-${Date.now()}`)
    .split("?")[0]
    .split("#")[0]
    .split("/")
    .pop()
    ?.replace(/[\/:*?"<>|\u0000-\u001F]/g, "-")
    .trim() || `file-${Date.now()}`;

  return extensionFromName(safeName) ? safeName : `${safeName}.${fallbackExtension}`;
}

function mimeTypeFromDocumentExtension(extension: string) {
  const ext = extension.toLowerCase();
  const map: Record<string, string> = {
    pdf: "application/pdf",
    txt: "text/plain",
    text: "text/plain",
    csv: "text/csv",
    json: "application/json",
    xml: "application/xml",
    html: "text/html",
    htm: "text/html",
    md: "text/markdown",
    rtf: "application/rtf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    odt: "application/vnd.oasis.opendocument.text",
    ods: "application/vnd.oasis.opendocument.spreadsheet",
    odp: "application/vnd.oasis.opendocument.presentation",
    epub: "application/epub+zip",
    zip: "application/zip",
    rar: "application/vnd.rar",
    "7z": "application/x-7z-compressed",
  };
  return map[ext] || null;
}

function normalizeDocumentKind(extension: string, mimeType?: string | null) {
  const ext = extension.toLowerCase();
  const mime = (mimeType || "").toLowerCase();

  if (ext === "pdf" || mime === "application/pdf") return "PDF";
  if (ext === "doc" || ext === "docx" || ext === "odt" || ext === "rtf") return ext.toUpperCase();
  if (ext === "xls" || ext === "xlsx" || ext === "ods") return ext.toUpperCase();
  if (ext === "ppt" || ext === "pptx" || ext === "odp") return ext.toUpperCase();
  if (ext === "zip" || ext === "rar" || ext === "7z" || ext === "epub") return ext.toUpperCase();
  if (ext === "txt" || ext === "csv" || ext === "json" || ext === "xml" || ext === "html" || ext === "htm" || ext === "md" || mime.startsWith("text/")) return ext ? ext.toUpperCase() : "TXT";
  if (
    ext === "jpg" ||
    ext === "jpeg" ||
    ext === "png" ||
    ext === "webp" ||
    ext === "heic" ||
    mime.startsWith("image/")
  ) {
    return "IMAGE";
  }
  if (
    ext === "mp4" ||
    ext === "mov" ||
    ext === "m4v" ||
    ext === "webm" ||
    mime.startsWith("video/")
  ) {
    return "VIDEO";
  }
  if (mime && mime !== "application/octet-stream") return mime;
  return ext ? ext.toUpperCase() : "FILE";
}

function formatDuration(durationMs?: number | null) {
  const totalSeconds = Math.max(1, Math.round((durationMs ?? 0) / 1000));
  const mm = `${Math.floor(totalSeconds / 60)}`.padStart(2, "0");
  const ss = `${totalSeconds % 60}`.padStart(2, "0");
  return `${mm}:${ss}`;
}

async function resetAudioMode() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

function ensureAssetUri(uri?: string | null) {
  if (!uri) {
    throw new Error("File URI was not found.");
  }
  return uri;
}

export async function pickCameraAsset(): Promise<CameraOrGalleryResult | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Camera permission was denied.");
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images", "videos"],
    allowsEditing: false,
    quality: 0.9,
    videoMaxDuration: 60,
  });

  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  const uri = ensureAssetUri(asset.uri);
  const isVideo = asset.type === "video";
  const rawFileName = asset.fileName ?? fileNameFromUri(uri);
  const durationLabel = isVideo ? formatDuration(asset.duration ?? 0) : undefined;
  const mediaKind = isVideo ? "video" : "image";
  const mimeType = asset.mimeType || mimeTypeFromMediaExtension(extensionFromName(rawFileName) || extensionFromName(uri), mediaKind);
  const fileName = ensureFileNameExtension(rawFileName, mimeType, mediaKind);

  return {
    kind: mediaKind,
    uri,
    fileName,
    mimeType,
    fileSize: asset.fileSize ?? null,
    durationMs: asset.duration ?? null,
    durationLabel,
    title: isVideo ? "Camera video" : "Camera photo",
    subtitle: `${isVideo ? "VIDEO" : "PHOTO"} · ${readableBytes(asset.fileSize ?? null)}`,
    messageText: "",
    notice: isVideo ? "Video captured" : "Photo captured",
  };
}

export async function pickGalleryAsset(): Promise<CameraOrGalleryResult | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Media library permission was denied.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images", "videos"],
    allowsEditing: false,
    quality: 0.9,
    selectionLimit: 1,
  });

  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  const uri = ensureAssetUri(asset.uri);
  const isVideo = asset.type === "video";
  const rawFileName = asset.fileName ?? fileNameFromUri(uri);
  const durationLabel = isVideo ? formatDuration(asset.duration ?? 0) : undefined;
  const mediaKind = isVideo ? "video" : "image";
  const mimeType = asset.mimeType || mimeTypeFromMediaExtension(extensionFromName(rawFileName) || extensionFromName(uri), mediaKind);
  const fileName = ensureFileNameExtension(rawFileName, mimeType, mediaKind);

  return {
    kind: mediaKind,
    uri,
    fileName,
    mimeType,
    fileSize: asset.fileSize ?? null,
    durationMs: asset.duration ?? null,
    durationLabel,
    title: fileName,
    subtitle: `${isVideo ? "VIDEO" : "PHOTO"} · ${readableBytes(asset.fileSize ?? null)}`,
    messageText: "",
    notice: isVideo ? "Video attached" : "Photo attached",
  };
}

export async function pickPhoneDocument(): Promise<PickedDocument | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["*/*"],
    multiple: false,
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  const uri = ensureAssetUri(asset.uri);
  const rawName = asset.name ?? fileNameFromUri(uri);
  const rawExtension = extensionFromName(rawName) || extensionFromName(uri);
  const resolvedMimeType = asset.mimeType || mimeTypeFromDocumentExtension(rawExtension) || "application/octet-stream";
  const name = ensureFileNameExtension(rawName, resolvedMimeType, "document");
  const extension = extensionFromName(name) || rawExtension || extensionFromMimeType(resolvedMimeType, "document");
  const kindLabel = normalizeDocumentKind(extension, resolvedMimeType);
  const meta = `${kindLabel} · ${readableBytes(asset.size ?? null)}`;

  return {
    name,
    uri,
    mimeType: resolvedMimeType,
    size: asset.size ?? null,
    extension,
    kindLabel,
    meta,
  };
}

function normalizePickedContactPhone(value?: string | null) {
  const raw = String(value ?? "").trim();
  return raw.replace(/[^\d+]/g, "") || raw;
}

export async function listPhoneContacts(limit = 200): Promise<PickedContact[]> {
  const permission = await Contacts.requestPermissionsAsync();

  if (permission.status !== "granted") {
    throw new Error("Contacts permission was denied.");
  }

  const response = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.PhoneNumbers],
    pageSize: Math.max(20, Math.min(limit, 500)),
  });

  const seen = new Set<string>();
  const contacts: PickedContact[] = [];

  for (const contact of response.data ?? []) {
    const phone = normalizePickedContactPhone(contact.phoneNumbers?.[0]?.number);
    const name = String(contact.name || contact.firstName || contact.lastName || "Contact").trim();

    if (!phone && !name) continue;

    const fallbackId = `${name || "contact"}-${phone || contacts.length}`;
    const id = String(contact.id || fallbackId).trim() || fallbackId;
    const key = String(phone || id).toLowerCase();

    if (seen.has(key)) continue;
    seen.add(key);

    contacts.push({
      id,
      name: name || phone || "Contact",
      phone,
      role: "Phone contact",
      source: "phone",
    });
  }

  return contacts;
}

export async function pickPhoneContact(): Promise<PickedContact | null> {
  const contacts = await listPhoneContacts(200);
  return contacts[0] ?? null;
}

function isPlusCodeLike(value?: string | null) {
  if (!value) return false;
  return /^[A-Z0-9]{4,}\+[A-Z0-9]{2,}$/i.test(value.trim());
}

function buildLocationTitle(place: Location.LocationGeocodedAddress | null | undefined) {
  if (!place) return "Current location";

  const name = !isPlusCodeLike(place.name) ? place.name : "";
  const street = place.street || "";
  const district = place.district || "";

  const primary = [name, street].filter(Boolean).join(", ").trim();
  if (primary) return primary;

  if (district) return district;
  return "Current location";
}

function buildLocationSubtitle(
  place: Location.LocationGeocodedAddress | null | undefined,
  latitude: number,
  longitude: number,
) {
  if (!place) return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

  const city = place.city || "";
  const region = place.region || "";
  const country = place.country || "";

  const line = [city, region, country].filter(Boolean).join(", ").trim();
  if (line) return line;

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

export async function pickUserLocation(): Promise<PickedLocation | null> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Location permission was denied.");
  }

  const coords = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const latitude = coords.coords.latitude;
  const longitude = coords.coords.longitude;

  let place: Location.LocationGeocodedAddress | null = null;

  try {
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    place = places[0] ?? null;
  } catch {
    place = null;
  }

  const title = buildLocationTitle(place);
  const subtitle = buildLocationSubtitle(place, latitude, longitude);

  return {
    title,
    subtitle,
    latitude,
    longitude,
    mapLabel: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
  };
}

export async function startVoiceRecording(): Promise<ActiveVoiceRecording> {
  const permission = await Audio.requestPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Microphone permission was denied.");
  }

  if (activeVoiceRecording) {
    return activeVoiceRecording;
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });

  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  await recording.startAsync();
  activeVoiceRecording = recording;
  return recording;
}

export async function stopVoiceRecording(recording: ActiveVoiceRecording): Promise<VoiceMessageResult | null> {
  try {
    const active = activeVoiceRecording ?? recording;
    activeVoiceRecording = null;

    await active.stopAndUnloadAsync();
    const status = await active.getStatusAsync();
    const uri = active.getURI();
    await resetAudioMode();

    if (!uri) return null;

    const durationMs = typeof status.durationMillis === "number" ? status.durationMillis : 0;

    if (durationMs < 800) {
      throw new Error("Voice message is too short.");
    }

    const durationLabel = formatDuration(durationMs);

    return {
      kind: "audio",
      title: "Voice message",
      subtitle: `${durationLabel} · microphone`,
      messageText: "🎙️ Voice message",
      notice: "Audio message sent",
      uri,
      durationMs,
      durationLabel,
    };
  } catch (error) {
    activeVoiceRecording = null;
    await resetAudioMode();
    throw error;
  }
}

export async function captureVoiceMessage(): Promise<VoiceMessageResult | null> {
  const recording = await startVoiceRecording();

  return await new Promise<VoiceMessageResult | null>((resolve, reject) => {
    let settled = false;

    const finish = async (send: boolean) => {
      if (settled) return;
      settled = true;

      try {
        const recorded = await stopVoiceRecording(recording);
        if (!send) {
          resolve(null);
          return;
        }
        resolve(recorded);
      } catch (error) {
        reject(error);
      }
    };

    Alert.alert(
      "Voice message",
      "Recording from microphone. Tap Send when finished.",
      [
        {
          text: "Отмена",
          style: "destructive",
          onPress: () => {
            void finish(false);
          },
        },
        {
          text: "Send",
          onPress: () => {
            void finish(true);
          },
        },
      ],
      { cancelable: false },
    );
  });
}

export async function captureVideoMessage(): Promise<VideoMessageResult | null> {
  const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
  if (!cameraPermission.granted) {
    throw new Error("Camera permission was denied.");
  }

  const micPermission = await Audio.requestPermissionsAsync();
  if (!micPermission.granted) {
    throw new Error("Microphone permission was denied.");
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["videos"],
    allowsEditing: false,
    quality: 0.9,
    videoMaxDuration: 60,
  });

  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  const uri = ensureAssetUri(asset.uri);
  const durationMs = asset.duration ?? 0;
  const durationLabel = formatDuration(durationMs);
  const fileLabel = `${durationLabel} · ${readableBytes(asset.fileSize ?? null)}`;
  const fileName = asset.fileName ?? fileNameFromUri(uri);

  return {
    kind: "video",
    title: "Video message",
    subtitle: `${durationLabel} · camera + mic`,
    messageText: "🎬 Video message",
    notice: "Video message sent",
    uri,
    durationMs,
    durationLabel,
    fileLabel: fileName,
  };
}

