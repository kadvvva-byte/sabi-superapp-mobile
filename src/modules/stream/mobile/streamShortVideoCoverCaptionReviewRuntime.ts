export type StreamShortVideoReviewItemId = "cover_frame" | "caption_track" | "language_caption_review" | "content_policy_review" | "media_review" | "publish_handoff_review";

export type StreamShortVideoReviewStatus =
  | "pending_local"
  | "prepared_local"
  | "reviewed_local"
  | "provider_review_required"
  | "provider_handoff_blocked";

export type StreamShortVideoReviewBlockerCode =
  | "cover_frame_required"
  | "caption_track_required"
  | "caption_language_review_required"
  | "content_policy_review_required"
  | "media_review_required"
  | "publish_handoff_review_required"
  | "media_storage_provider_required"
  | "cdn_provider_required"
  | "backend_shorts_review_contract_required"
  | "admin_shorts_review_required";

export type StreamShortVideoReviewEventKind =
  | "short_cover_review_local"
  | "short_caption_review_local"
  | "short_policy_review_local"
  | "short_media_review_local"
  | "short_publish_handoff_blocked";

export type StreamShortVideoReviewItem = {
  readonly id: StreamShortVideoReviewItemId;
  readonly title: string;
  readonly purpose: string;
  readonly status: StreamShortVideoReviewStatus;
  readonly preparedLocal: boolean;
  readonly reviewedLocal: boolean;
  readonly providerRequired: boolean;
  readonly deliveredToBackend: false;
  readonly updatedAt: string;
};

export type StreamShortVideoReviewEvent = {
  readonly eventId: string;
  readonly kind: StreamShortVideoReviewEventKind;
  readonly itemId: StreamShortVideoReviewItemId;
  readonly createdAt: string;
  readonly deliveredToProvider: false;
  readonly payload: {
    readonly itemStatus: StreamShortVideoReviewStatus;
    readonly preparedLocal: boolean;
    readonly reviewedLocal: boolean;
    readonly localBlockers: readonly StreamShortVideoReviewBlockerCode[];
    readonly providerBlockers: readonly StreamShortVideoReviewBlockerCode[];
  };
};

export type StreamShortVideoReviewEvidence = {
  readonly selectedItemId: StreamShortVideoReviewItemId | null;
  readonly selectedStatus: StreamShortVideoReviewStatus;
  readonly preparedLocal: number;
  readonly reviewedLocal: number;
  readonly providerRequired: number;
  readonly coverFrameReadyLocal: boolean;
  readonly captionsReadyLocal: boolean;
  readonly languageReviewReadyLocal: boolean;
  readonly contentPolicyReadyLocal: boolean;
  readonly mediaReviewReadyLocal: boolean;
  readonly publishHandoffReviewedLocal: boolean;
  readonly reviewReadyLocal: boolean;
  readonly queuedReviewEvents: number;
  readonly localBlockers: readonly StreamShortVideoReviewBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoReviewBlockerCode[];
  readonly backendShortsReviewContract: "local_only_not_connected";
  readonly mediaStorageProvider: "not_configured";
  readonly cdnProvider: "not_configured";
  readonly adminShortsReview: "not_connected";
  readonly fakeCoverGeneratedAllowed: false;
  readonly fakeCaptionGeneratedAllowed: false;
  readonly fakeReviewPassAllowed: false;
  readonly fakePublishAllowed: false;
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
};

export type StreamShortVideoReviewRuntimeState = {
  readonly status: StreamShortVideoReviewStatus;
  readonly selectedItemId: StreamShortVideoReviewItemId | null;
  readonly items: readonly StreamShortVideoReviewItem[];
  readonly events: readonly StreamShortVideoReviewEvent[];
  readonly evidence: StreamShortVideoReviewEvidence;
  readonly updatedAt: string;
};

const nowIso = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;

const itemSeed: readonly Omit<StreamShortVideoReviewItem, "status" | "preparedLocal" | "reviewedLocal" | "providerRequired" | "deliveredToBackend" | "updatedAt">[] = [
  { id: "cover_frame", title: "Кадр обложки", purpose: "Подготовить реальный intent кадра обложки перед передачей публикации." },
  { id: "caption_track", title: "Дорожка текста", purpose: "Подготовить intent текста/субтитров перед проверкой." },
  { id: "language_caption_review", title: "Проверка языка текста", purpose: "Локально подтвердить язык и читаемость текста." },
  { id: "content_policy_review", title: "Правила контента", purpose: "Локально подтвердить правила шорта перед Admin-проверкой." },
  { id: "media_review", title: "Проверка медиа", purpose: "Проверить длительность, источник, монтаж, обложку и текст." },
  { id: "publish_handoff_review", title: "Передача публикации", purpose: "Подготовить локальные доказательства для backend/storage/CDN/Admin." },
];

function createItem(seed: (typeof itemSeed)[number], updatedAt: string): StreamShortVideoReviewItem {
  return {
    ...seed,
    status: "pending_local",
    preparedLocal: false,
    reviewedLocal: false,
    providerRequired: true,
    deliveredToBackend: false,
    updatedAt,
  };
}

function selectedItem(state: Pick<StreamShortVideoReviewRuntimeState, "items" | "selectedItemId">): StreamShortVideoReviewItem | null {
  return state.selectedItemId ? state.items.find((item) => item.id === state.selectedItemId) ?? null : null;
}

function providerBlockers(): readonly StreamShortVideoReviewBlockerCode[] {
  return [
    "media_storage_provider_required",
    "cdn_provider_required",
    "backend_shorts_review_contract_required",
    "admin_shorts_review_required",
  ];
}

function localBlockers(items: readonly StreamShortVideoReviewItem[]): readonly StreamShortVideoReviewBlockerCode[] {
  const blockers: StreamShortVideoReviewBlockerCode[] = [];
  const ready = (id: StreamShortVideoReviewItemId) => items.find((item) => item.id === id)?.reviewedLocal === true;
  if (!ready("cover_frame")) blockers.push("cover_frame_required");
  if (!ready("caption_track")) blockers.push("caption_track_required");
  if (!ready("language_caption_review")) blockers.push("caption_language_review_required");
  if (!ready("content_policy_review")) blockers.push("content_policy_review_required");
  if (!ready("media_review")) blockers.push("media_review_required");
  if (!ready("publish_handoff_review")) blockers.push("publish_handoff_review_required");
  return blockers;
}

function computeItemStatus(item: StreamShortVideoReviewItem): StreamShortVideoReviewStatus {
  if (item.status === "provider_handoff_blocked") return "provider_handoff_blocked";
  if (item.reviewedLocal) return "provider_review_required";
  if (item.preparedLocal) return "prepared_local";
  return "pending_local";
}

function buildEvidence(state: Pick<StreamShortVideoReviewRuntimeState, "items" | "selectedItemId" | "events">): StreamShortVideoReviewEvidence {
  const selected = selectedItem(state);
  const blockers = localBlockers(state.items);
  const itemReady = (id: StreamShortVideoReviewItemId) => state.items.find((item) => item.id === id)?.reviewedLocal === true;
  return {
    selectedItemId: selected?.id ?? null,
    selectedStatus: selected ? computeItemStatus(selected) : "pending_local",
    preparedLocal: state.items.filter((item) => item.preparedLocal).length,
    reviewedLocal: state.items.filter((item) => item.reviewedLocal).length,
    providerRequired: state.items.filter((item) => item.providerRequired).length,
    coverFrameReadyLocal: itemReady("cover_frame"),
    captionsReadyLocal: itemReady("caption_track"),
    languageReviewReadyLocal: itemReady("language_caption_review"),
    contentPolicyReadyLocal: itemReady("content_policy_review"),
    mediaReviewReadyLocal: itemReady("media_review"),
    publishHandoffReviewedLocal: itemReady("publish_handoff_review"),
    reviewReadyLocal: blockers.length === 0,
    queuedReviewEvents: state.events.length,
    localBlockers: blockers,
    providerBlockers: providerBlockers(),
    backendShortsReviewContract: "local_only_not_connected",
    mediaStorageProvider: "not_configured",
    cdnProvider: "not_configured",
    adminShortsReview: "not_connected",
    fakeCoverGeneratedAllowed: false,
    fakeCaptionGeneratedAllowed: false,
    fakeReviewPassAllowed: false,
    fakePublishAllowed: false,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
  };
}

function computeStatus(items: readonly StreamShortVideoReviewItem[]): StreamShortVideoReviewStatus {
  if (items.some((item) => item.status === "provider_handoff_blocked")) return "provider_handoff_blocked";
  if (localBlockers(items).length === 0) return "provider_review_required";
  if (items.some((item) => item.reviewedLocal)) return "reviewed_local";
  if (items.some((item) => item.preparedLocal)) return "prepared_local";
  return "pending_local";
}

function rebuild(
  state: StreamShortVideoReviewRuntimeState,
  patch: Partial<Omit<StreamShortVideoReviewRuntimeState, "status" | "evidence" | "updatedAt">>,
): StreamShortVideoReviewRuntimeState {
  const updatedAt = nowIso();
  const nextBase = { ...state, ...patch, updatedAt };
  return {
    ...nextBase,
    status: computeStatus(nextBase.items),
    evidence: buildEvidence(nextBase),
  };
}

function mapSelected(
  state: StreamShortVideoReviewRuntimeState,
  mapper: (item: StreamShortVideoReviewItem) => StreamShortVideoReviewItem,
): StreamShortVideoReviewRuntimeState {
  if (!state.selectedItemId) return state;
  const items: readonly StreamShortVideoReviewItem[] = state.items.map((item) => (item.id === state.selectedItemId ? mapper(item) : item));
  return rebuild(state, { items });
}

function reviewKindForItem(itemId: StreamShortVideoReviewItemId): StreamShortVideoReviewEventKind {
  switch (itemId) {
    case "cover_frame": return "short_cover_review_local";
    case "caption_track":
    case "language_caption_review": return "short_caption_review_local";
    case "content_policy_review": return "short_policy_review_local";
    case "media_review": return "short_media_review_local";
    case "publish_handoff_review": return "short_publish_handoff_blocked";
  }
}

export function createInitialStreamShortVideoCoverCaptionReviewState(): StreamShortVideoReviewRuntimeState {
  const updatedAt = nowIso();
  const items = itemSeed.map((seed) => createItem(seed, updatedAt));
  const base: Omit<StreamShortVideoReviewRuntimeState, "status" | "evidence"> = {
    selectedItemId: null,
    items,
    events: [],
    updatedAt,
  };
  return {
    ...base,
    status: "pending_local",
    evidence: buildEvidence(base),
  };
}

export function selectStreamShortVideoReviewItem(
  state: StreamShortVideoReviewRuntimeState,
  itemId: StreamShortVideoReviewItemId,
): StreamShortVideoReviewRuntimeState {
  return state.items.some((item) => item.id === itemId) ? rebuild(state, { selectedItemId: itemId }) : state;
}

export function prepareSelectedStreamShortVideoReviewItem(state: StreamShortVideoReviewRuntimeState): StreamShortVideoReviewRuntimeState {
  return mapSelected(state, (item) => ({ ...item, preparedLocal: true, status: "prepared_local", updatedAt: nowIso() }));
}

export function reviewSelectedStreamShortVideoReviewItem(state: StreamShortVideoReviewRuntimeState): StreamShortVideoReviewRuntimeState {
  return mapSelected(state, (item) => ({ ...item, preparedLocal: true, reviewedLocal: true, status: "provider_review_required", updatedAt: nowIso() }));
}

export function reviewStreamShortVideoCoverFrame(state: StreamShortVideoReviewRuntimeState): StreamShortVideoReviewRuntimeState {
  return selectThenReview(state, "cover_frame");
}

export function reviewStreamShortVideoCaptionTrack(state: StreamShortVideoReviewRuntimeState): StreamShortVideoReviewRuntimeState {
  return selectThenReview(state, "caption_track");
}

export function reviewStreamShortVideoCaptionLanguage(state: StreamShortVideoReviewRuntimeState): StreamShortVideoReviewRuntimeState {
  return selectThenReview(state, "language_caption_review");
}

export function reviewStreamShortVideoContentPolicy(state: StreamShortVideoReviewRuntimeState): StreamShortVideoReviewRuntimeState {
  return selectThenReview(state, "content_policy_review");
}

export function reviewStreamShortVideoMedia(state: StreamShortVideoReviewRuntimeState): StreamShortVideoReviewRuntimeState {
  return selectThenReview(state, "media_review");
}

export function reviewStreamShortVideoPublishHandoff(state: StreamShortVideoReviewRuntimeState): StreamShortVideoReviewRuntimeState {
  return selectThenReview(state, "publish_handoff_review");
}

function selectThenReview(state: StreamShortVideoReviewRuntimeState, itemId: StreamShortVideoReviewItemId): StreamShortVideoReviewRuntimeState {
  return reviewSelectedStreamShortVideoReviewItem(selectStreamShortVideoReviewItem(state, itemId));
}

export function runStreamShortVideoCoverCaptionReviewCheck(state: StreamShortVideoReviewRuntimeState): StreamShortVideoReviewRuntimeState {
  return rebuild(state, { items: state.items.map((item) => ({ ...item, status: computeItemStatus(item), updatedAt: nowIso() })) });
}

export function queueStreamShortVideoCoverCaptionReviewEvent(
  state: StreamShortVideoReviewRuntimeState,
  kind?: StreamShortVideoReviewEventKind,
): StreamShortVideoReviewRuntimeState {
  const selected = selectedItem(state);
  if (!selected) return state;
  const createdAt = nowIso();
  const event: StreamShortVideoReviewEvent = {
    eventId: makeId(kind ?? reviewKindForItem(selected.id)),
    kind: kind ?? reviewKindForItem(selected.id),
    itemId: selected.id,
    createdAt,
    deliveredToProvider: false,
    payload: {
      itemStatus: computeItemStatus(selected),
      preparedLocal: selected.preparedLocal,
      reviewedLocal: selected.reviewedLocal,
      localBlockers: localBlockers(state.items),
      providerBlockers: providerBlockers(),
    },
  };
  return rebuild(state, { events: [...state.events, event] });
}

export function requestStreamShortVideoCoverCaptionProviderBlocked(state: StreamShortVideoReviewRuntimeState): StreamShortVideoReviewRuntimeState {
  const items: readonly StreamShortVideoReviewItem[] = state.items.map((item) => ({ ...item, status: "provider_handoff_blocked", providerRequired: true, updatedAt: nowIso() }));
  return rebuild(state, { items });
}
