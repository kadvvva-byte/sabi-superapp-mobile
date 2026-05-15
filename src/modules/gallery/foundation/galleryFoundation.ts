import { resolveSabiApiBaseUrl } from "../../../shared/api/apiBaseUrl";
export type SabiGalleryProviderStatus =
  | "not_required"
  | "provider_required"
  | "api_key_required"
  | "disabled";

export type SabiGalleryFoundationStatus = {
  ok: true;
  version: "GALLERY-100.7";
  module: "gallery";
  mobileRoute: "/gallery";
  apiBasePath: "/api/v2/gallery";
  runtimeStatus: "foundation_ready" | "api_unavailable";
  localStorageStatus: "mobile_local_ready";
  cloudStorageStatus: "provider_required";
  publicProfileStatus: "explicit_selection_ready";
  aiMediaStatus: "provider_required";
  fakeDataAllowed: false;
  providers: {
    cloudStorage: SabiGalleryProviderStatus;
    aiAnalysis: SabiGalleryProviderStatus;
    moderation: SabiGalleryProviderStatus;
  };
  policy: {
    version: "GALLERY-100.7";
    privateByDefault: true;
    publicRequiresExplicitSelection: true;
    fakeMediaAllowed: false;
    autoPublicUploadAllowed: false;
    aiAnalysisRequiresProvider: true;
    cloudSyncRequiresProvider: true;
    moderationReviewSupported: true;
    publicProfileBridgeReady: true;
    shareToMessengerSupported: true;
    qrShareSupported: true;
    albumFilteringReady: true;
    sortingReady: true;
    persistenceReady: true;
    safeDeleteReady: true;
    systemShareExportReady: true;
    corruptedStorageRepairReady: true;
    publicProfileSelectorsReady: true;
    publicProfileSnapshotReady: true;
    privateLeakProtectionReady: true;
    editorRealEffectsReady: true;
    acceptedFullscreenViewerReady: true;
    acceptedSabiPlayerReady: true;
    notes: string[];
  };
};

function getApiBaseUrl() {
  return resolveSabiApiBaseUrl(undefined, { port: "4001" }).replace(/\/+$/, "");
}

export const SABI_GALLERY_MOBILE_FOUNDATION: SabiGalleryFoundationStatus = {
  ok: true,
  version: "GALLERY-100.7",
  module: "gallery",
  mobileRoute: "/gallery",
  apiBasePath: "/api/v2/gallery",
  runtimeStatus: "foundation_ready",
  localStorageStatus: "mobile_local_ready",
  cloudStorageStatus: "provider_required",
  publicProfileStatus: "explicit_selection_ready",
  aiMediaStatus: "provider_required",
  fakeDataAllowed: false,
  providers: {
    cloudStorage: "provider_required",
    aiAnalysis: "api_key_required",
    moderation: "provider_required",
  },
  policy: {
    version: "GALLERY-100.7",
    privateByDefault: true,
    publicRequiresExplicitSelection: true,
    fakeMediaAllowed: false,
    autoPublicUploadAllowed: false,
    aiAnalysisRequiresProvider: true,
    cloudSyncRequiresProvider: true,
    moderationReviewSupported: true,
    publicProfileBridgeReady: true,
    shareToMessengerSupported: true,
    qrShareSupported: true,
    albumFilteringReady: true,
    sortingReady: true,
    persistenceReady: true,
    safeDeleteReady: true,
    systemShareExportReady: true,
    corruptedStorageRepairReady: true,
    publicProfileSelectorsReady: true,
    publicProfileSnapshotReady: true,
    privateLeakProtectionReady: true,
    editorRealEffectsReady: true,
    acceptedFullscreenViewerReady: true,
    acceptedSabiPlayerReady: true,
    notes: [
      "Uploaded photos and videos stay private by default.",
      "Only explicitly selected media can become public.",
      "Public profile receives only items marked public by the user.",
      "Cloud sync, AI analysis and moderation require real providers.",
      "Gallery albums and sorting are local runtime features until cloud provider is connected.",
      "Local Gallery state is normalized before persistence and corrupted records are discarded safely.",
      "Public Profile selectors expose public photos, public videos, counts and latest public media only from explicit selections.",
      "Private/internal media is excluded from public selectors by contract.",
    ],
  },
};

export async function fetchSabiGalleryFoundationStatus(): Promise<SabiGalleryFoundationStatus> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v2/gallery/status`);
    if (!response.ok) {
      return { ...SABI_GALLERY_MOBILE_FOUNDATION, runtimeStatus: "api_unavailable" };
    }

    const data = (await response.json()) as Partial<SabiGalleryFoundationStatus>;
    return {
      ...SABI_GALLERY_MOBILE_FOUNDATION,
      ...data,
      ok: true,
      fakeDataAllowed: false,
      runtimeStatus: data.runtimeStatus === "foundation_ready" ? "foundation_ready" : SABI_GALLERY_MOBILE_FOUNDATION.runtimeStatus,
    };
  } catch {
    return { ...SABI_GALLERY_MOBILE_FOUNDATION, runtimeStatus: "api_unavailable" };
  }
}
