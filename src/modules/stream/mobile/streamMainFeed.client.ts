export type StreamMainFeedType =
  | "all"
  | "solo"
  | "group"
  | "battle"
  | "audio"
  | "game"
  | "business";

export type StreamMainCategory =
  | "all"
  | "fashion"
  | "tech"
  | "market"
  | "games"
  | "music"
  | "food"
  | "silkroad";

export interface StreamMainFeedFilters {
  countryCode: string | null;
  nearby: boolean;
  type: StreamMainFeedType;
  category: StreamMainCategory;
}

export interface StreamMainFeedItem {
  id: string;
  title: string;
  hostName: string;
  countryCode: string;
  type: Exclude<StreamMainFeedType, "all">;
  category: Exclude<StreamMainCategory, "all">;
  thumbnailUrl?: string;
  viewerCount?: number;
  isLive: true;
  source: "real_backend";
}

export const STREAM_MAIN_DEFAULT_FILTERS: StreamMainFeedFilters = {
  countryCode: null,
  nearby: false,
  type: "all",
  category: "all",
};

export const STREAM_MAIN_REALTIME_FEED: StreamMainFeedItem[] = [];

export function filterStreamMainFeed(
  items: StreamMainFeedItem[],
  filters: StreamMainFeedFilters,
): StreamMainFeedItem[] {
  return items.filter((item) => {
    if (filters.countryCode && item.countryCode !== filters.countryCode) return false;
    if (filters.type !== "all" && item.type !== filters.type) return false;
    if (filters.category !== "all" && item.category !== filters.category) return false;
    return true;
  });
}

export const STREAM_MOBILE_MAIN_FEED_CLIENT = {
  version: "STREAM-MOBILE-100Q-B",
  layout: "mobile_two_column_real_stream_grid",
  dataSource: "real_backend_only",
  fakeStreamsAllowed: false,
  fakeCountersAllowed: false,
  yandexServerRequiredNow: false,
  safeTopBottomInsetsRequired: true,
  walletTouched: false,
  messengerTouched: false,
  callsTouched: false,
  backendFinanceRecoveryTouched: false,
} as const;
