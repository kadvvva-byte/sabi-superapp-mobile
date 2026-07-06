export type Stream111WNoCinemaMixingScope = {
  readonly version: "111W";
  readonly module: "stream";
  readonly streamOwnsLiveRooms: true;
  readonly shortsRemainInsideStream: true;
  readonly longMoviesSeriesAnimeSeparated: true;
  readonly sabiWatchFutureModuleOnly: true;
  readonly mainBackendVideoUploadForbidden: true;
  readonly fakeProviderSuccessForbidden: true;
  readonly walletTouched: false;
  readonly messengerTouched: false;
  readonly callsTouched: false;
  readonly backendTouched: false;
};

export const stream111WNoCinemaMixingPlan: Stream111WNoCinemaMixingScope = {
  version: "111W",
  module: "stream",
  streamOwnsLiveRooms: true,
  shortsRemainInsideStream: true,
  longMoviesSeriesAnimeSeparated: true,
  sabiWatchFutureModuleOnly: true,
  mainBackendVideoUploadForbidden: true,
  fakeProviderSuccessForbidden: true,
  walletTouched: false,
  messengerTouched: false,
  callsTouched: false,
  backendTouched: false,
};

export function getStream111WNoCinemaMixingChecklist() {
  return [
    "Stream keeps live rooms, Shorts, audio, group, game and business live only.",
    "Movies, series and anime must not be inserted into the Shorts or live-room viewer.",
    "Future Sabi Watch must use a separate media backend, object storage and CDN gate.",
    "The main Sabi backend must not receive large video uploads through ordinary API bodies.",
    "No fake upload, fake CDN, fake HLS, fake provider, fake publish or fake playback success is allowed.",
  ] as const;
}
