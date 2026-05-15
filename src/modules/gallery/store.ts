import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

export type GalleryAssetSource = "device" | "camera" | "imported";
export type GalleryVisibility = "private" | "public";
export type GalleryAlbumKind = "all" | "public" | "private" | "camera" | "device" | "imported" | "videos";
export type GallerySortMode = "newest" | "oldest" | "type";

export type GalleryAlbumSummary = {
  id: GalleryAlbumKind;
  count: number;
  latestUpdatedAt: number | null;
};

export type GalleryPublicProfileMedia = {
  id: string;
  uri: string;
  mediaKind: "photo" | "video";
  width: number;
  height: number;
  createdAt: number;
  updatedAt: number;
  publicSelectedAt: number;
  source: GalleryAssetSource;
  filename?: string | null;
  mimeType?: string | null;
};


export type GalleryPublicProfileCounts = {
  all: number;
  photos: number;
  videos: number;
};

export type GalleryPublicProfileSnapshot = {
  version: "GALLERY-100.5";
  media: GalleryPublicProfileMedia[];
  photos: GalleryPublicProfileMedia[];
  videos: GalleryPublicProfileMedia[];
  counts: GalleryPublicProfileCounts;
  latestPublicItem: GalleryPublicProfileMedia | null;
  latestPublicSelectedAt: number | null;
  updatedAt: number;
  explicitSelectionOnly: true;
  privateMediaExcluded: true;
};

export type GalleryItem = {
  id: string;
  uri: string;
  width: number;
  height: number;
  createdAt: number;
  updatedAt: number;
  isPublic: boolean;
  publicSelectedAt?: number | null;
  source: GalleryAssetSource;
  filename?: string | null;
  mimeType?: string | null;
  albumId?: string | null;
};

type GalleryState = {
  items: GalleryItem[];
  lastUpdatedAt: number;
  hydrated: boolean;
  storageError: string | null;
};

type CreateGalleryItemInput = {
  id?: string;
  uri: string;
  width?: number;
  height?: number;
  createdAt?: number;
  updatedAt?: number;
  isPublic?: boolean;
  publicSelectedAt?: number | null;
  source?: GalleryAssetSource;
  filename?: string | null;
  mimeType?: string | null;
  albumId?: string | null;
};

type PersistedGalleryState = {
  version: 2 | 3;
  items: GalleryItem[];
  savedAt: number;
  repairedAt?: number | null;
};

const GALLERY_STORAGE_KEY = "sabi.gallery.v1";
const listeners = new Set<() => void>();

let state: GalleryState = {
  items: [],
  lastUpdatedAt: Date.now(),
  hydrated: false,
  storageError: null,
};

let hydratePromise: Promise<GalleryState> | null = null;
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let persistInFlight = false;
let pendingPersist = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  void hydrateGalleryStoreFromStorage();
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function areGalleryItemsEqual(a: GalleryItem[], b: GalleryItem[]) {
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) {
    const left = a[index];
    const right = b[index];
    if (
      left.id !== right.id ||
      left.uri !== right.uri ||
      left.width !== right.width ||
      left.height !== right.height ||
      left.createdAt !== right.createdAt ||
      left.updatedAt !== right.updatedAt ||
      left.isPublic !== right.isPublic ||
      left.publicSelectedAt !== right.publicSelectedAt ||
      left.source !== right.source ||
      left.filename !== right.filename ||
      left.mimeType !== right.mimeType ||
      left.albumId !== right.albumId
    ) {
      return false;
    }
  }
  return true;
}

function patchState(patch: Partial<GalleryState>, options?: { persist?: boolean }) {
  const nextItems = patch.items ? sanitizeGalleryItems(patch.items) : state.items;
  const nextState: GalleryState = {
    ...state,
    ...patch,
    items: nextItems,
    lastUpdatedAt: Date.now(),
  };

  const changed =
    !areGalleryItemsEqual(state.items, nextState.items) ||
    state.hydrated !== nextState.hydrated ||
    state.storageError !== nextState.storageError;

  if (!changed) return;

  state = nextState;

  notify();

  if (options?.persist !== false) {
    schedulePersistGalleryStore();
  }
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeGalleryAssetSource(value: unknown): GalleryAssetSource {
  if (value === "camera" || value === "imported" || value === "device") return value;
  return "device";
}

function normalizeTimestamp(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizeDimension(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 1;
}

function normalizeNullableString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function normalizeUri(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function getGalleryMediaKind(item: Pick<GalleryItem, "uri" | "mimeType">): "photo" | "video" {
  if (item.mimeType?.startsWith("video/")) return "video";
  const uri = item.uri.toLowerCase();
  if (uri.endsWith(".mp4") || uri.endsWith(".mov") || uri.endsWith(".m4v") || uri.endsWith(".webm")) return "video";
  return "photo";
}

export function sortGalleryItems(items: GalleryItem[], mode: GallerySortMode = "newest") {
  return [...items].sort((a, b) => {
    if (mode === "oldest") {
      if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
      return a.updatedAt - b.updatedAt;
    }

    if (mode === "type") {
      const mediaA = getGalleryMediaKind(a);
      const mediaB = getGalleryMediaKind(b);
      if (mediaA !== mediaB) return mediaA === "photo" ? -1 : 1;
    }

    if (b.createdAt !== a.createdAt) return b.createdAt - a.createdAt;
    return b.updatedAt - a.updatedAt;
  });
}

export function filterGalleryItemsByAlbum(items: GalleryItem[], album: GalleryAlbumKind) {
  if (album === "public") return items.filter((item) => item.isPublic);
  if (album === "private") return items.filter((item) => !item.isPublic);
  if (album === "camera") return items.filter((item) => item.source === "camera");
  if (album === "device") return items.filter((item) => item.source === "device");
  if (album === "imported") return items.filter((item) => item.source === "imported" || item.source === "device");
  if (album === "videos") return items.filter((item) => getGalleryMediaKind(item) === "video");
  return items;
}

function normalizeGalleryItem(input: CreateGalleryItemInput): GalleryItem {
  const now = Date.now();
  const createdAt = normalizeTimestamp(input.createdAt, now);
  const updatedAt = Math.max(normalizeTimestamp(input.updatedAt, createdAt), createdAt);
  const isPublic = input.isPublic === true;
  const publicSelectedAt = isPublic
    ? normalizeTimestamp(input.publicSelectedAt, updatedAt)
    : null;

  return {
    id: normalizeNullableString(input.id) ?? makeId(),
    uri: normalizeUri(input.uri),
    width: normalizeDimension(input.width),
    height: normalizeDimension(input.height),
    createdAt,
    updatedAt,
    isPublic,
    publicSelectedAt,
    source: normalizeGalleryAssetSource(input.source),
    filename: normalizeNullableString(input.filename),
    mimeType: normalizeNullableString(input.mimeType),
    albumId: normalizeNullableString(input.albumId),
  };
}

function isGalleryItem(value: unknown): value is GalleryItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<GalleryItem>;
  return typeof item.id === "string" && typeof item.uri === "string";
}

function normalizePersistedItem(value: unknown): GalleryItem | null {
  if (!isGalleryItem(value)) return null;
  const normalized = normalizeGalleryItem({
    ...value,
    id: value.id,
    uri: value.uri,
    width: value.width,
    height: value.height,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    isPublic: value.isPublic === true,
    publicSelectedAt: value.publicSelectedAt,
    source: value.source,
    filename: value.filename,
    mimeType: value.mimeType,
    albumId: value.albumId,
  });

  if (!normalized.uri) return null;
  return normalized;
}

function dedupeGalleryItems(items: GalleryItem[]) {
  const seenIds = new Set<string>();
  const seenUris = new Set<string>();
  const result: GalleryItem[] = [];

  for (const item of items) {
    const normalized = normalizePersistedItem(item);
    if (!normalized) continue;

    const uriKey = normalized.uri.toLowerCase();
    if (seenIds.has(normalized.id)) continue;
    if (seenUris.has(uriKey)) continue;

    seenIds.add(normalized.id);
    seenUris.add(uriKey);
    result.push(normalized);
  }

  return result;
}

function sanitizeGalleryItems(items: GalleryItem[]) {
  return sortGalleryItems(dedupeGalleryItems(items));
}

function mergeGalleryItems(primary: GalleryItem[], secondary: GalleryItem[]) {
  return sortGalleryItems(dedupeGalleryItems([...primary, ...secondary]));
}

function readPersistedGalleryState(raw: string | null): GalleryItem[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedGalleryState> | GalleryItem[];
    const sourceItems = Array.isArray(parsed) ? parsed : parsed.items;
    if (!Array.isArray(sourceItems)) return [];
    return sourceItems
      .map(normalizePersistedItem)
      .filter((item): item is GalleryItem => Boolean(item));
  } catch {
    return [];
  }
}

async function persistGalleryStoreNow() {
  if (persistInFlight) {
    pendingPersist = true;
    return;
  }

  persistInFlight = true;
  pendingPersist = false;

  try {
    const payload: PersistedGalleryState = {
      version: 3,
      items: sanitizeGalleryItems(state.items),
      savedAt: Date.now(),
    };

    await AsyncStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(payload));

    if (state.storageError) {
      patchState({ storageError: null }, { persist: false });
    }
  } catch (error) {
    patchState(
      {
        storageError:
          error instanceof Error ? error.message : "gallery_storage_save_failed",
      },
      { persist: false },
    );
  } finally {
    persistInFlight = false;

    if (pendingPersist) {
      pendingPersist = false;
      schedulePersistGalleryStore(0);
    }
  }
}

function schedulePersistGalleryStore(delay = 120) {
  if (!state.hydrated) return;

  if (persistTimer) {
    clearTimeout(persistTimer);
  }

  persistTimer = setTimeout(() => {
    persistTimer = null;
    void persistGalleryStoreNow();
  }, delay);
}

export async function hydrateGalleryStoreFromStorage() {
  if (state.hydrated) return state;
  if (hydratePromise) return hydratePromise;

  hydratePromise = AsyncStorage.getItem(GALLERY_STORAGE_KEY)
    .then((raw) => {
      const persistedItems = readPersistedGalleryState(raw);
      const mergedItems = sanitizeGalleryItems(mergeGalleryItems(state.items, persistedItems));

      patchState(
        {
          items: mergedItems,
          hydrated: true,
          storageError: null,
        },
        { persist: false },
      );

      return state;
    })
    .catch((error) => {
      patchState(
        {
          hydrated: true,
          storageError:
            error instanceof Error ? error.message : "gallery_storage_hydrate_failed",
        },
        { persist: false },
      );
      return state;
    })
    .finally(() => {
      hydratePromise = null;
    });

  return hydratePromise;
}

export async function flushGalleryStoreToStorage() {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }

  await hydrateGalleryStoreFromStorage();
  await persistGalleryStoreNow();
  return state;
}

void hydrateGalleryStoreFromStorage();

export function isGalleryItemPublic(item: Pick<GalleryItem, "isPublic" | "publicSelectedAt">) {
  return item.isPublic === true && typeof item.publicSelectedAt === "number";
}

export function toGalleryVisibility(item: Pick<GalleryItem, "isPublic">): GalleryVisibility {
  return item.isPublic ? "public" : "private";
}

function getLatestUpdatedAt(items: GalleryItem[]) {
  if (!items.length) return null;
  return items.reduce((latest, item) => Math.max(latest, item.updatedAt), 0);
}

function makeAlbumSummary(id: GalleryAlbumKind, items: GalleryItem[]): GalleryAlbumSummary {
  return { id, count: items.length, latestUpdatedAt: getLatestUpdatedAt(items) };
}

export function mapPublicProfileMedia(item: GalleryItem): GalleryPublicProfileMedia | null {
  if (!isGalleryItemPublic(item) || !item.publicSelectedAt) return null;
  return {
    id: item.id,
    uri: item.uri,
    mediaKind: getGalleryMediaKind(item),
    width: item.width,
    height: item.height,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    publicSelectedAt: item.publicSelectedAt,
    source: item.source,
    filename: item.filename ?? null,
    mimeType: item.mimeType ?? null,
  };
}


export function makeGalleryPublicProfileMedia(items: GalleryItem[]): GalleryPublicProfileMedia[] {
  return sortGalleryItems(items)
    .map(mapPublicProfileMedia)
    .filter((item): item is GalleryPublicProfileMedia => Boolean(item))
    .sort((a, b) => b.publicSelectedAt - a.publicSelectedAt);
}

export function makeGalleryPublicProfileSnapshot(items: GalleryItem[]): GalleryPublicProfileSnapshot {
  const media = makeGalleryPublicProfileMedia(items);
  const photos = media.filter((item) => item.mediaKind === "photo");
  const videos = media.filter((item) => item.mediaKind === "video");
  const latestPublicItem = media[0] ?? null;
  const updatedAt = media.reduce((latest, item) => Math.max(latest, item.updatedAt), 0);

  return {
    version: "GALLERY-100.5",
    media,
    photos,
    videos,
    counts: {
      all: media.length,
      photos: photos.length,
      videos: videos.length,
    },
    latestPublicItem,
    latestPublicSelectedAt: latestPublicItem?.publicSelectedAt ?? null,
    updatedAt,
    explicitSelectionOnly: true,
    privateMediaExcluded: true,
  };
}

export const galleryStore = {
  getState(): GalleryState {
    return state;
  },

  getItems(): GalleryItem[] {
    return state.items;
  },

  getItemById(id: string): GalleryItem | null {
    return state.items.find((item) => item.id === id) ?? null;
  },

  getPublicItems(): GalleryItem[] {
    return state.items.filter((item) => item.isPublic);
  },

  getPrivateItems(): GalleryItem[] {
    return state.items.filter((item) => !item.isPublic);
  },

  getVisibleItems(visibility: GalleryVisibility | "all"): GalleryItem[] {
    if (visibility === "public") return this.getPublicItems();
    if (visibility === "private") return this.getPrivateItems();
    return state.items;
  },

  getItemsByAlbum(album: GalleryAlbumKind, sortMode: GallerySortMode = "newest"): GalleryItem[] {
    return sortGalleryItems(filterGalleryItemsByAlbum(state.items, album), sortMode);
  },

  getAlbumSummary(): GalleryAlbumSummary[] {
    return [
      makeAlbumSummary("all", state.items),
      makeAlbumSummary("public", this.getPublicItems()),
      makeAlbumSummary("private", this.getPrivateItems()),
      makeAlbumSummary("camera", filterGalleryItemsByAlbum(state.items, "camera")),
      makeAlbumSummary("device", filterGalleryItemsByAlbum(state.items, "device")),
      makeAlbumSummary("imported", filterGalleryItemsByAlbum(state.items, "imported")),
      makeAlbumSummary("videos", filterGalleryItemsByAlbum(state.items, "videos")),
    ];
  },

  getPublicProfileMedia(): GalleryPublicProfileMedia[] {
    return makeGalleryPublicProfileMedia(state.items);
  },

  getPublicProfilePhotos(): GalleryPublicProfileMedia[] {
    return makeGalleryPublicProfileSnapshot(state.items).photos;
  },

  getPublicProfileVideos(): GalleryPublicProfileMedia[] {
    return makeGalleryPublicProfileSnapshot(state.items).videos;
  },

  getPublicProfileSnapshot(): GalleryPublicProfileSnapshot {
    return makeGalleryPublicProfileSnapshot(state.items);
  },

  createItem(input: CreateGalleryItemInput): GalleryItem {
    return normalizeGalleryItem(input);
  },

  async hydrateFromStorage() {
    return hydrateGalleryStoreFromStorage();
  },

  async flushToStorage() {
    return flushGalleryStoreToStorage();
  },

  hydrate(items: CreateGalleryItemInput[]) {
    const normalized = items.map(normalizeGalleryItem).filter((item) => item.uri);
    patchState({ items: sanitizeGalleryItems(normalized) });
  },

  addItem(input: CreateGalleryItemInput) {
    const nextItem = normalizeGalleryItem(input);
    if (!nextItem.uri) return nextItem;
    patchState({
      items: sanitizeGalleryItems([nextItem, ...state.items]),
    });
    return nextItem;
  },

  addItems(inputs: CreateGalleryItemInput[]) {
    if (!inputs.length) return state.items;

    const nextItems = inputs.map(normalizeGalleryItem).filter((item) => item.uri);
    patchState({
      items: sanitizeGalleryItems([...nextItems, ...state.items]),
    });
    return state.items;
  },

  updateItem(id: string, patch: Partial<Omit<GalleryItem, "id">>) {
    let changed = false;
    const nextUpdatedAt = Date.now();

    const nextItems = sanitizeGalleryItems(
      state.items.map((item) => {
        if (item.id !== id) return item;
        changed = true;
        return {
          ...item,
          ...patch,
          updatedAt: nextUpdatedAt,
        };
      }),
    );

    if (changed) {
      patchState({ items: nextItems });
    }

    return changed;
  },

  replaceItem(id: string, next: GalleryItem) {
    let changed = false;
    const nextUpdatedAt = Date.now();

    const nextItems = sanitizeGalleryItems(
      state.items.map((item) => {
        if (item.id !== id) return item;
        changed = true;
        return {
          ...next,
          id,
          updatedAt: nextUpdatedAt,
        };
      }),
    );

    if (changed) {
      patchState({ items: nextItems });
    }

    return changed;
  },

  removeItem(id: string) {
    const before = state.items.length;
    const nextItems = state.items.filter((item) => item.id !== id);

    if (nextItems.length !== before) {
      patchState({ items: nextItems });
      return true;
    }

    return false;
  },

  removeItems(ids: string[]) {
    if (!ids.length) return 0;

    const idSet = new Set(ids);
    const before = state.items.length;
    const nextItems = state.items.filter((item) => !idSet.has(item.id));
    const removedCount = before - nextItems.length;

    if (removedCount > 0) {
      patchState({ items: nextItems });
    }

    return removedCount;
  },

  setItemsPublic(ids: string[], isPublic: boolean) {
    if (!ids.length) return 0;

    const idSet = new Set(ids);
    let changed = 0;

    const nextItems = state.items.map((item) => {
      if (!idSet.has(item.id)) return item;
      if (item.isPublic === isPublic) return item;

      changed += 1;
      const now = Date.now();
      return {
        ...item,
        isPublic,
        publicSelectedAt: isPublic ? item.publicSelectedAt ?? now : null,
        updatedAt: now,
      };
    });

    if (changed > 0) {
      patchState({ items: nextItems });
    }

    return changed;
  },

  setItemPublic(id: string, isPublic: boolean) {
    return this.setItemsPublic([id], isPublic) > 0;
  },

  toggleItemPublic(id: string) {
    const target = state.items.find((item) => item.id === id);
    if (!target) return false;

    return this.setItemPublic(id, !target.isPublic);
  },

  repairStorage() {
    const repairedItems = sanitizeGalleryItems(state.items);
    patchState({ items: repairedItems });
    void flushGalleryStoreToStorage();
    return repairedItems.length;
  },

  clear() {
    patchState({ items: [] });
  },
};

export function useGalleryStore<T = GalleryState>(
  selector?: (snapshot: GalleryState) => T,
): T {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return selector ? selector(snapshot) : (snapshot as unknown as T);
}

export function useGalleryItems() {
  return useGalleryStore((snapshot) => snapshot.items);
}

export function useGalleryAlbumSummary() {
  return useGalleryStore((snapshot) => [
    makeAlbumSummary("all", snapshot.items),
    makeAlbumSummary("public", snapshot.items.filter((item) => item.isPublic)),
    makeAlbumSummary("private", snapshot.items.filter((item) => !item.isPublic)),
    makeAlbumSummary("camera", filterGalleryItemsByAlbum(snapshot.items, "camera")),
    makeAlbumSummary("device", filterGalleryItemsByAlbum(snapshot.items, "device")),
    makeAlbumSummary("imported", filterGalleryItemsByAlbum(snapshot.items, "imported")),
    makeAlbumSummary("videos", filterGalleryItemsByAlbum(snapshot.items, "videos")),
  ]);
}

export function usePublicGalleryProfileMedia() {
  return useGalleryStore((snapshot) => makeGalleryPublicProfileMedia(snapshot.items));
}

export function usePublicGalleryProfilePhotos() {
  return useGalleryStore((snapshot) => makeGalleryPublicProfileSnapshot(snapshot.items).photos);
}

export function usePublicGalleryProfileVideos() {
  return useGalleryStore((snapshot) => makeGalleryPublicProfileSnapshot(snapshot.items).videos);
}

export function usePublicGalleryProfileSnapshot() {
  return useGalleryStore((snapshot) => makeGalleryPublicProfileSnapshot(snapshot.items));
}

export function usePublicGalleryItems() {
  return useGalleryStore((snapshot) =>
    snapshot.items.filter((item) => item.isPublic),
  );
}

export function usePrivateGalleryItems() {
  return useGalleryStore((snapshot) =>
    snapshot.items.filter((item) => !item.isPublic),
  );
}
