import {
  type GalleryItem,
  type GalleryPublicProfileMedia,
  type GalleryPublicProfileSnapshot,
  galleryStore,
  isGalleryItemPublic,
  makeGalleryPublicProfileSnapshot,
  useGalleryStore,
} from "./store";

function toPublicProfileMedia(item: GalleryItem): GalleryPublicProfileMedia | null {
  if (!isGalleryItemPublic(item) || !item.publicSelectedAt) return null;

  const uri = item.uri.toLowerCase();
  const mediaKind: GalleryPublicProfileMedia["mediaKind"] =
    item.mimeType?.startsWith("video/") ||
    uri.endsWith(".mp4") ||
    uri.endsWith(".mov") ||
    uri.endsWith(".m4v") ||
    uri.endsWith(".webm")
      ? "video"
      : "photo";

  return {
    id: item.id,
    uri: item.uri,
    mediaKind,
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

function sortPublicMedia(media: GalleryPublicProfileMedia[]) {
  return [...media].sort((a, b) => b.publicSelectedAt - a.publicSelectedAt);
}

export function getGalleryPublicProfileMedia(): GalleryPublicProfileMedia[] {
  return sortPublicMedia(
    galleryStore
      .getItems()
      .map(toPublicProfileMedia)
      .filter((item): item is GalleryPublicProfileMedia => Boolean(item)),
  );
}

export function getGalleryPublicProfilePhotos(): GalleryPublicProfileMedia[] {
  return getGalleryPublicProfileMedia().filter((item) => item.mediaKind === "photo");
}

export function getGalleryPublicProfileVideos(): GalleryPublicProfileMedia[] {
  return getGalleryPublicProfileMedia().filter((item) => item.mediaKind === "video");
}

export function getGalleryPublicProfileSnapshot(): GalleryPublicProfileSnapshot {
  return makeGalleryPublicProfileSnapshot(galleryStore.getItems());
}

export function useGalleryPublicProfileMedia(): GalleryPublicProfileMedia[] {
  return useGalleryStore((snapshot) =>
    sortPublicMedia(
      snapshot.items
        .map(toPublicProfileMedia)
        .filter((item): item is GalleryPublicProfileMedia => Boolean(item)),
    ),
  );
}

export function useGalleryPublicProfilePhotos(): GalleryPublicProfileMedia[] {
  return useGalleryPublicProfileMedia().filter((item) => item.mediaKind === "photo");
}

export function useGalleryPublicProfileVideos(): GalleryPublicProfileMedia[] {
  return useGalleryPublicProfileMedia().filter((item) => item.mediaKind === "video");
}

export function useGalleryPublicProfileSnapshot(): GalleryPublicProfileSnapshot {
  return useGalleryStore((snapshot) => makeGalleryPublicProfileSnapshot(snapshot.items));
}

export function setGalleryMediaPublicForProfile(id: string, isPublic: boolean) {
  return galleryStore.setItemPublic(id, isPublic);
}
