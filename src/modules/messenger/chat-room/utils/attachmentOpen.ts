import { Linking, Platform } from "react-native";
import * as FileSystemLegacy from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { galleryStore } from "../../../gallery/store";

type OpenDocumentArgs = {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
};

type OpenLocationArgs = {
  url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  title?: string | null;
};

type DownloadAttachmentArgs = {
  uri: string;
  name?: string | null;
  kind?: "image" | "video" | "document" | "audio" | string;
  mimeType?: string | null;
};

type LocalAttachmentFile = {
  localUri: string;
  fileName: string;
  mimeType: string;
};

const DOCUMENT_MIME_BY_EXTENSION: Record<string, string> = {
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

const MEDIA_MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  bmp: "image/bmp",
  tiff: "image/tiff",
  mp4: "video/mp4",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
  webm: "video/webm",
  mkv: "video/x-matroska",
  avi: "video/x-msvideo",
  "3gp": "video/3gpp",
  "3g2": "video/3gpp2",
};

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/x-m4v": "m4v",
  "video/webm": "webm",
  "video/x-matroska": "mkv",
  "video/x-msvideo": "avi",
  "video/3gpp": "3gp",
  "video/3gpp2": "3g2",
};

const UTI_BY_EXTENSION: Record<string, string> = {
  pdf: "com.adobe.pdf",
  txt: "public.plain-text",
  text: "public.plain-text",
  csv: "public.comma-separated-values-text",
  json: "public.json",
  xml: "public.xml",
  html: "public.html",
  htm: "public.html",
  rtf: "public.rtf",
  doc: "com.microsoft.word.doc",
  docx: "org.openxmlformats.wordprocessingml.document",
  xls: "com.microsoft.excel.xls",
  xlsx: "org.openxmlformats.spreadsheetml.sheet",
  ppt: "com.microsoft.powerpoint.ppt",
  pptx: "org.openxmlformats.presentationml.presentation",
  zip: "public.zip-archive",
  jpg: "public.jpeg",
  jpeg: "public.jpeg",
  png: "public.png",
  webp: "public.image",
  gif: "com.compuserve.gif",
  heic: "public.heic",
  heif: "public.heif",
  mp4: "public.mpeg-4",
  mov: "com.apple.quicktime-movie",
  m4v: "com.apple.m4v-video",
};

function normalizeString(value?: string | null) {
  const raw = String(value ?? "").trim();
  return raw.length > 0 ? raw : null;
}

function isHttpLikeUrl(value: string) {
  return /^(https?:|blob:|data:)/i.test(value);
}

function getExtensionFromName(value?: string | null) {
  const clean = String(value ?? "").split("?")[0].split("#")[0].trim();
  const basename = clean.split("/").pop() || clean;
  const match = basename.match(/\.([a-z0-9]{1,12})$/i);
  return match ? match[1].toLowerCase() : "";
}

function sanitizeFileName(value?: string | null, fallback = "document") {
  const raw = normalizeString(value) || fallback;
  const decoded = (() => {
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  })();
  const base = decoded.split("?")[0].split("#")[0].split("/").pop() || fallback;
  return base.replace(/[\\/:*?"<>|\u0000-\u001F]/g, "_").trim() || fallback;
}

function normalizeKind(value?: string | null) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "photo") return "image";
  if (raw === "image" || raw === "video" || raw === "document" || raw === "audio") return raw;
  return raw || "media";
}

function normalizeMimeType(value?: string | null) {
  const direct = normalizeString(value)?.toLowerCase();
  if (!direct || direct === "application/octet-stream" || direct.includes("*")) return null;
  return direct;
}

function getMimeTypeForFile(name?: string | null, mimeType?: string | null) {
  const direct = normalizeMimeType(mimeType);
  if (direct) return direct;
  const ext = getExtensionFromName(name);
  return DOCUMENT_MIME_BY_EXTENSION[ext] || MEDIA_MIME_BY_EXTENSION[ext] || direct || "application/octet-stream";
}

function getDocumentUti(name?: string | null) {
  const ext = getExtensionFromName(name);
  return UTI_BY_EXTENSION[ext] || "public.data";
}

function getDefaultExtension(kind?: string | null, mimeType?: string | null, name?: string | null, uri?: string | null) {
  const nameExt = getExtensionFromName(name);
  if (nameExt) return nameExt;
  const uriExt = getExtensionFromName(uri);
  if (uriExt) return uriExt;
  const normalizedMime = normalizeMimeType(mimeType);
  if (normalizedMime && EXTENSION_BY_MIME[normalizedMime]) return EXTENSION_BY_MIME[normalizedMime];
  const normalizedKind = normalizeKind(kind);
  if (normalizedKind === "image") return "jpg";
  if (normalizedKind === "video") return "mp4";
  if (normalizedKind === "audio") return "m4a";
  return "bin";
}

function buildFileName(args: DownloadAttachmentArgs, fallbackPrefix = "attachment") {
  const extension = getDefaultExtension(args.kind, args.mimeType, args.name, args.uri);
  const requestedName = sanitizeFileName(args.name || args.uri, `${fallbackPrefix}.${extension}`);
  return requestedName.includes(".") ? requestedName : `${requestedName}.${extension}`;
}

function ensureDirectoryPath(root: string | null | undefined, folder: string) {
  const base = root || FileSystemLegacy.documentDirectory || FileSystemLegacy.cacheDirectory;
  if (!base) {
    throw new Error("File storage is unavailable.");
  }
  return `${base}${folder.replace(/^\/+|\/+$/g, "")}/`;
}

async function ensureDirectory(uri: string) {
  await FileSystemLegacy.makeDirectoryAsync(uri, { intermediates: true }).catch(() => undefined);
}

async function getNativeOpenUri(uri: string) {
  if (Platform.OS === "android" && uri.startsWith("file://")) {
    try {
      return await FileSystemLegacy.getContentUriAsync(uri);
    } catch {
      return uri;
    }
  }
  return uri;
}

async function openDirect(uri: string) {
  await Linking.openURL(uri);
}

async function ensureLocalDocumentFile(args: OpenDocumentArgs) {
  const rawUri = normalizeString(args.uri);
  if (!rawUri) {
    throw new Error("File URI was not found.");
  }

  const requestedName = sanitizeFileName(args.name || rawUri, "document");
  const extension = getExtensionFromName(requestedName) || getExtensionFromName(rawUri) || "bin";
  const fileName = requestedName.includes(".") ? requestedName : `${requestedName}.${extension}`;
  const targetUri = `${FileSystemLegacy.cacheDirectory || ""}sabi-open-${Date.now()}-${fileName}`;

  if (rawUri.startsWith("file://")) {
    return { localUri: rawUri, fileName, mimeType: getMimeTypeForFile(fileName, args.mimeType) };
  }

  if (rawUri.startsWith("content://")) {
    return { localUri: rawUri, fileName, mimeType: getMimeTypeForFile(fileName, args.mimeType) };
  }

  if (isHttpLikeUrl(rawUri)) {
    const downloaded = await FileSystemLegacy.downloadAsync(rawUri, targetUri);
    if (!downloaded?.uri) {
      throw new Error("Unable to download this document before opening.");
    }
    return { localUri: downloaded.uri, fileName, mimeType: getMimeTypeForFile(fileName, args.mimeType) };
  }

  return { localUri: rawUri, fileName, mimeType: getMimeTypeForFile(fileName, args.mimeType) };
}

async function ensureLocalAttachmentFile(
  args: DownloadAttachmentArgs,
  options: { persistent: boolean; folder: string },
): Promise<LocalAttachmentFile> {
  const rawUri = normalizeString(args.uri);
  if (!rawUri) {
    throw new Error("File URI was not found.");
  }

  const fileName = buildFileName(args, normalizeKind(args.kind));
  const root = options.persistent ? FileSystemLegacy.documentDirectory : FileSystemLegacy.cacheDirectory;
  const dir = ensureDirectoryPath(root, options.folder);
  await ensureDirectory(dir);
  const targetUri = `${dir}${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${fileName}`;
  const mimeType = getMimeTypeForFile(fileName, args.mimeType);

  if (rawUri.startsWith("file://")) {
    if (!options.persistent) {
      return { localUri: rawUri, fileName, mimeType };
    }

    const currentName = sanitizeFileName(rawUri, fileName);
    if (rawUri.includes(`/${options.folder}/`) || currentName === fileName) {
      return { localUri: rawUri, fileName, mimeType };
    }

    await FileSystemLegacy.copyAsync({ from: rawUri, to: targetUri });
    return { localUri: targetUri, fileName, mimeType };
  }

  if (rawUri.startsWith("content://")) {
    try {
      await FileSystemLegacy.copyAsync({ from: rawUri, to: targetUri });
      return { localUri: targetUri, fileName, mimeType };
    } catch {
      if (!options.persistent) {
        return { localUri: rawUri, fileName, mimeType };
      }
      throw new Error("Unable to import this media into Sabi App storage.");
    }
  }

  if (isHttpLikeUrl(rawUri)) {
    const downloaded = await FileSystemLegacy.downloadAsync(rawUri, targetUri);
    if (!downloaded?.uri) {
      throw new Error("Unable to download this media.");
    }
    return { localUri: downloaded.uri, fileName, mimeType };
  }

  return { localUri: rawUri, fileName, mimeType };
}

export async function openDocumentUniversal(args: OpenDocumentArgs) {
  const uri = String(args.uri ?? "").trim();
  if (!uri) {
    throw new Error("File URI was not found.");
  }

  if (Platform.OS === "web") {
    if (!isHttpLikeUrl(uri)) {
      throw new Error("This file can only be opened on web after it has a web URL.");
    }
    const browserWindow = (globalThis as any)?.window;
    if (browserWindow?.open) {
      browserWindow.open(uri, "_blank", "noopener,noreferrer");
      return;
    }
    throw new Error("Browser window is unavailable.");
  }

  const localFile = await ensureLocalDocumentFile(args);
  const mimeType = getMimeTypeForFile(localFile.fileName, localFile.mimeType);
  const dialogTitle = "Open document with";

  try {
    const sharingAvailable = await Sharing.isAvailableAsync();
    if (sharingAvailable && localFile.localUri.startsWith("file://")) {
      await Sharing.shareAsync(localFile.localUri, {
        dialogTitle,
        mimeType,
        UTI: getDocumentUti(localFile.fileName),
      });
      return;
    }
  } catch {}

  const openUri = await getNativeOpenUri(localFile.localUri);

  try {
    await openDirect(openUri);
    return;
  } catch {}

  if (openUri !== localFile.localUri) {
    try {
      await openDirect(localFile.localUri);
      return;
    } catch {}
  }

  throw new Error("No app found to open this file.");
}

export async function openLocationUniversal(args: OpenLocationArgs) {
  const url = String(args.url ?? "").trim();
  const latitude = typeof args.latitude === "number" ? args.latitude : null;
  const longitude = typeof args.longitude === "number" ? args.longitude : null;
  const title = String(args.title ?? "").trim();

  if (Platform.OS === "web") {
    const webUrl =
      url ||
      (latitude !== null && longitude !== null
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            title ? `${latitude},${longitude} (${title})` : `${latitude},${longitude}`,
          )}`
        : "");
    if (!webUrl) {
      throw new Error("Location URL was not found.");
    }
    const browserWindow = (globalThis as any)?.window;
    if (browserWindow?.open) {
      browserWindow.open(webUrl, "_blank", "noopener,noreferrer");
      return;
    }
    throw new Error("Browser window is unavailable.");
  }

  if (Platform.OS === "ios") {
    const appleMapsUrl =
      latitude !== null && longitude !== null
        ? `http://maps.apple.com/?ll=${latitude},${longitude}${title ? `&q=${encodeURIComponent(title)}` : ""}`
        : url;
    if (!appleMapsUrl) {
      throw new Error("Location URL was not found.");
    }
    await openDirect(appleMapsUrl);
    return;
  }

  const nativeUrl =
    latitude !== null && longitude !== null
      ? `geo:${latitude},${longitude}${title ? `?q=${latitude},${longitude}(${encodeURIComponent(title)})` : ""}`
      : url;
  if (!nativeUrl) {
    throw new Error("Location URL was not found.");
  }

  try {
    await openDirect(nativeUrl);
    return;
  } catch {
    if (url) {
      await openDirect(url);
      return;
    }
  }

  throw new Error("Unable to open location.");
}

export async function saveAttachmentToSabiGallery(args: DownloadAttachmentArgs) {
  const normalizedKind = normalizeKind(args.kind);
  const localFile = await ensureLocalAttachmentFile(
    {
      ...args,
      kind: normalizedKind === "video" ? "video" : "image",
    },
    { persistent: true, folder: "sabi-chat-gallery" },
  );

  await galleryStore.hydrateFromStorage();
  const saved = galleryStore.addItem({
    uri: localFile.localUri,
    width: 1,
    height: 1,
    isPublic: false,
    source: "imported",
    filename: localFile.fileName,
    mimeType: localFile.mimeType,
  });
  await galleryStore.flushToStorage();
  return saved;
}

export async function saveAttachmentToPhone(args: DownloadAttachmentArgs) {
  const uri = String(args.uri ?? "").trim();
  if (!uri) {
    throw new Error("File URI was not found.");
  }

  if (Platform.OS === "web") {
    if (!isHttpLikeUrl(uri)) {
      throw new Error("This attachment can only be downloaded on web after it has a web URL.");
    }

    const browserDocument = (globalThis as any)?.document;
    if (!browserDocument?.createElement) {
      throw new Error("Browser document is unavailable.");
    }

    const anchor = browserDocument.createElement("a");
    anchor.href = uri;
    anchor.download = args.name?.trim() || "attachment";
    anchor.rel = "noopener";
    anchor.target = "_blank";
    browserDocument.body?.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return;
  }

  if ((args.kind || "").toLowerCase() === "document") {
    await openDocumentUniversal({ uri, name: args.name, mimeType: args.mimeType });
    return;
  }

  const localFile = await ensureLocalAttachmentFile(args, {
    persistent: false,
    folder: "sabi-chat-share",
  });

  try {
    const sharingAvailable = await Sharing.isAvailableAsync();
    if (sharingAvailable && localFile.localUri.startsWith("file://")) {
      await Sharing.shareAsync(localFile.localUri, {
        dialogTitle: "Save media",
        mimeType: localFile.mimeType,
        UTI: getDocumentUti(localFile.fileName),
      });
      return;
    }
  } catch {}

  const openUri = await getNativeOpenUri(localFile.localUri);
  try {
    await openDirect(openUri);
    return;
  } catch {}

  if (openUri !== localFile.localUri) {
    await openDirect(localFile.localUri);
    return;
  }

  throw new Error("Unable to save this attachment.");
}

export async function downloadAttachmentUniversal(args: DownloadAttachmentArgs) {
  await saveAttachmentToPhone(args);
}
