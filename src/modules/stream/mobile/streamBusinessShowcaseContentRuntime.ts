import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import { enqueueLocalStreamRoomEvent, type StreamRoomEventQueueRuntimeState } from "./streamRoomEventQueueRuntime";
import type { StreamBusinessStreamReadinessRuntimeState } from "./streamBusinessStreamReadinessRuntime";
import type { StreamBusinessRoomControlsRuntimeState } from "./streamBusinessRoomControlsRuntime";

export type StreamBusinessShowcaseContentStatus =
  | "not_started_local"
  | "drafting_local"
  | "blocked_local"
  | "showcase_content_ready_local"
  | "provider_content_blocked";

export type StreamBusinessShowcaseContentItemKind =
  | "hero_product_card"
  | "service_card"
  | "demo_segment"
  | "brand_story"
  | "contact_card"
  | "policy_notice";

export type StreamBusinessShowcaseContentItemStatus =
  | "draft_local"
  | "prepared_local"
  | "compliance_review_local"
  | "provider_required";

export type StreamBusinessShowcaseContentBlockerCode =
  | "business_room_required"
  | "business_readiness_required"
  | "business_controls_required"
  | "business_showcase_rail_required"
  | "showcase_content_item_required"
  | "hero_content_required"
  | "contact_content_required"
  | "policy_notice_required"
  | "content_compliance_review_required"
  | "content_event_queue_required"
  | "backend_business_content_contract_required"
  | "media_business_content_provider_required"
  | "catalog_content_provider_required"
  | "admin_business_content_review_required"
  | "fake_content_publish_forbidden"
  | "fake_business_launch_forbidden"
  | "fake_payment_forbidden"
  | "fake_gift_forbidden"
  | "fake_monetization_forbidden";

export type StreamBusinessShowcaseContentItem = {
  readonly id: string;
  readonly kind: StreamBusinessShowcaseContentItemKind;
  readonly title: string;
  readonly note: string;
  readonly status: StreamBusinessShowcaseContentItemStatus;
  readonly localOnly: true;
  readonly deliveredToBackend: false;
  readonly published: false;
  readonly paymentEnabled: false;
  readonly giftEnabled: false;
};

export type StreamBusinessShowcaseContentIntegration = {
  readonly backendBusinessContentContract: "not_connected" | "connected";
  readonly mediaBusinessContentProvider: "not_configured" | "configured";
  readonly catalogContentProvider: "not_configured" | "configured";
  readonly adminBusinessContentReview: "not_connected" | "connected";
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
  readonly fakeContentPublishAllowed: false;
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeMonetizationAllowed: false;
};

export type StreamBusinessShowcaseContentRuntimeState = {
  readonly version: "STREAM-109O";
  readonly roomId: string;
  readonly status: StreamBusinessShowcaseContentStatus;
  readonly selectedItemId: string;
  readonly contentItems: readonly StreamBusinessShowcaseContentItem[];
  readonly contentDraftPreparedLocal: boolean;
  readonly complianceReviewPreparedLocal: boolean;
  readonly queuedBusinessContentEvents: number;
  readonly providerContentHandoffRequestedLocal: boolean;
  readonly localBlockers: readonly StreamBusinessShowcaseContentBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessShowcaseContentBlockerCode[];
  readonly integration: StreamBusinessShowcaseContentIntegration;
  readonly updatedAt: string;
};

export type StreamBusinessShowcaseContentEvidenceSnapshot = {
  readonly version: "STREAM-109O";
  readonly roomId: string;
  readonly status: StreamBusinessShowcaseContentStatus;
  readonly selectedItemId: string;
  readonly selectedItemKind: StreamBusinessShowcaseContentItemKind;
  readonly selectedItemStatus: StreamBusinessShowcaseContentItemStatus;
  readonly totalContentItems: number;
  readonly preparedContentItems: number;
  readonly complianceReviewItems: number;
  readonly providerRequiredItems: number;
  readonly heroContentReady: boolean;
  readonly contactContentReady: boolean;
  readonly policyNoticeReady: boolean;
  readonly contentDraftPreparedLocal: boolean;
  readonly complianceReviewPreparedLocal: boolean;
  readonly queuedBusinessContentEvents: number;
  readonly providerContentHandoffRequestedLocal: boolean;
  readonly localBlockers: readonly StreamBusinessShowcaseContentBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessShowcaseContentBlockerCode[];
  readonly backendBusinessContentContract: StreamBusinessShowcaseContentIntegration["backendBusinessContentContract"];
  readonly mediaBusinessContentProvider: StreamBusinessShowcaseContentIntegration["mediaBusinessContentProvider"];
  readonly catalogContentProvider: StreamBusinessShowcaseContentIntegration["catalogContentProvider"];
  readonly adminBusinessContentReview: StreamBusinessShowcaseContentIntegration["adminBusinessContentReview"];
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
  readonly fakeContentPublishAllowed: false;
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly readyForBackendUnion: boolean;
};

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function createContentId(kind: StreamBusinessShowcaseContentItemKind, now?: Date | string | number): string {
  const stamp = nowIso(now).replace(/[^0-9]/g, "").slice(0, 17);
  return `business-content-${kind}-${stamp}`;
}

function defaultItems(now?: Date | string | number): readonly StreamBusinessShowcaseContentItem[] {
  return [
    {
      id: createContentId("hero_product_card", now),
      kind: "hero_product_card",
      title: "Main showcase item",
      note: "Local product/service card draft. No checkout and no payment action in this stage.",
      status: "draft_local",
      localOnly: true,
      deliveredToBackend: false,
      published: false,
      paymentEnabled: false,
      giftEnabled: false,
    },
    {
      id: createContentId("brand_story", now),
      kind: "brand_story",
      title: "Business story",
      note: "Local host talking-points draft for the Business Stream room.",
      status: "draft_local",
      localOnly: true,
      deliveredToBackend: false,
      published: false,
      paymentEnabled: false,
      giftEnabled: false,
    },
    {
      id: createContentId("contact_card", now),
      kind: "contact_card",
      title: "Contact information card",
      note: "Local contact card draft for viewers. Backend delivery remains required.",
      status: "draft_local",
      localOnly: true,
      deliveredToBackend: false,
      published: false,
      paymentEnabled: false,
      giftEnabled: false,
    },
    {
      id: createContentId("policy_notice", now),
      kind: "policy_notice",
      title: "Business compliance notice",
      note: "Local policy notice draft. Admin compliance review is still required.",
      status: "compliance_review_local",
      localOnly: true,
      deliveredToBackend: false,
      published: false,
      paymentEnabled: false,
      giftEnabled: false,
    },
  ];
}

function defaultIntegration(): StreamBusinessShowcaseContentIntegration {
  return {
    backendBusinessContentContract: "not_connected",
    mediaBusinessContentProvider: "not_configured",
    catalogContentProvider: "not_configured",
    adminBusinessContentReview: "not_connected",
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
    fakeContentPublishAllowed: false,
    fakeBusinessLaunchAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeMonetizationAllowed: false,
  };
}

function providerBlockers(): readonly StreamBusinessShowcaseContentBlockerCode[] {
  return [
    "backend_business_content_contract_required",
    "media_business_content_provider_required",
    "catalog_content_provider_required",
    "admin_business_content_review_required",
    "fake_content_publish_forbidden",
    "fake_business_launch_forbidden",
    "fake_payment_forbidden",
    "fake_gift_forbidden",
    "fake_monetization_forbidden",
  ];
}

function businessReadinessReady(readiness: StreamBusinessStreamReadinessRuntimeState): boolean {
  return readiness.localBlockers.length === 0 && (readiness.status === "business_room_ready_local" || readiness.status === "provider_business_handoff_blocked");
}

function businessControlsReady(controls: StreamBusinessRoomControlsRuntimeState): boolean {
  return controls.localBlockers.length === 0 && (controls.status === "business_controls_ready_local" || controls.status === "provider_controls_blocked");
}

function itemReady(items: readonly StreamBusinessShowcaseContentItem[], kind: StreamBusinessShowcaseContentItemKind): boolean {
  return items.some((item) => item.kind === kind && (item.status === "prepared_local" || item.status === "compliance_review_local"));
}

function preparedCount(items: readonly StreamBusinessShowcaseContentItem[]): number {
  return items.filter((item) => item.status === "prepared_local" || item.status === "compliance_review_local").length;
}

function localBlockers(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  state: Pick<StreamBusinessShowcaseContentRuntimeState, "contentItems" | "contentDraftPreparedLocal" | "complianceReviewPreparedLocal" | "queuedBusinessContentEvents">,
): readonly StreamBusinessShowcaseContentBlockerCode[] {
  const blockers: StreamBusinessShowcaseContentBlockerCode[] = [];
  if (room.mode !== "businessLive") blockers.push("business_room_required");
  if (!businessReadinessReady(readiness)) blockers.push("business_readiness_required");
  if (!businessControlsReady(controls)) blockers.push("business_controls_required");
  if (stage.layout !== "business_showcase") blockers.push("business_showcase_rail_required");
  if (state.contentItems.length === 0) blockers.push("showcase_content_item_required");
  if (!itemReady(state.contentItems, "hero_product_card")) blockers.push("hero_content_required");
  if (!itemReady(state.contentItems, "contact_card")) blockers.push("contact_content_required");
  if (!itemReady(state.contentItems, "policy_notice")) blockers.push("policy_notice_required");
  if (!state.contentDraftPreparedLocal) blockers.push("showcase_content_item_required");
  if (!state.complianceReviewPreparedLocal) blockers.push("content_compliance_review_required");
  if (state.queuedBusinessContentEvents === 0) blockers.push("content_event_queue_required");
  return Array.from(new Set(blockers));
}

function statusFor(local: readonly StreamBusinessShowcaseContentBlockerCode[], providerRequested: boolean, draftPrepared: boolean): StreamBusinessShowcaseContentStatus {
  if (providerRequested) return "provider_content_blocked";
  if (local.length > 0) return draftPrepared ? "blocked_local" : "drafting_local";
  return "showcase_content_ready_local";
}

function selectedItem(state: StreamBusinessShowcaseContentRuntimeState): StreamBusinessShowcaseContentItem {
  return state.contentItems.find((item) => item.id === state.selectedItemId) ?? state.contentItems[0] ?? defaultItems()[0];
}

function recompute(
  state: StreamBusinessShowcaseContentRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  now?: Date | string | number,
): StreamBusinessShowcaseContentRuntimeState {
  const blockers = localBlockers(room, stage, readiness, controls, state);
  return {
    ...state,
    roomId: room.roomId,
    localBlockers: blockers,
    providerBlockers: providerBlockers(),
    status: statusFor(blockers, state.providerContentHandoffRequestedLocal, state.contentDraftPreparedLocal),
    updatedAt: nowIso(now),
  };
}

export function createInitialStreamBusinessShowcaseContentState(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  now?: Date | string | number,
): StreamBusinessShowcaseContentRuntimeState {
  const createdAt = nowIso(now);
  const items = defaultItems(now);
  const initial: StreamBusinessShowcaseContentRuntimeState = {
    version: "STREAM-109O",
    roomId: room.roomId,
    status: "not_started_local",
    selectedItemId: items[0]?.id ?? "business-content-local",
    contentItems: items,
    contentDraftPreparedLocal: false,
    complianceReviewPreparedLocal: false,
    queuedBusinessContentEvents: 0,
    providerContentHandoffRequestedLocal: false,
    localBlockers: [],
    providerBlockers: providerBlockers(),
    integration: defaultIntegration(),
    updatedAt: createdAt,
  };
  return recompute(initial, room, stage, readiness, controls, now);
}

export function syncStreamBusinessShowcaseContentState(
  state: StreamBusinessShowcaseContentRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  now?: Date | string | number,
): StreamBusinessShowcaseContentRuntimeState {
  return recompute(state, room, stage, readiness, controls, now);
}

export function selectNextStreamBusinessShowcaseContentItemLocal(state: StreamBusinessShowcaseContentRuntimeState): StreamBusinessShowcaseContentRuntimeState {
  const index = state.contentItems.findIndex((item) => item.id === state.selectedItemId);
  const selectedItemId = state.contentItems[(index + 1) % Math.max(state.contentItems.length, 1)]?.id ?? state.selectedItemId;
  return { ...state, selectedItemId, updatedAt: nowIso() };
}

export function addStreamBusinessShowcaseContentItemLocal(
  state: StreamBusinessShowcaseContentRuntimeState,
  kind: StreamBusinessShowcaseContentItemKind = "demo_segment",
): StreamBusinessShowcaseContentRuntimeState {
  const updatedAt = nowIso();
  const item: StreamBusinessShowcaseContentItem = {
    id: createContentId(kind, updatedAt),
    kind,
    title: kind === "service_card" ? "Service card draft" : "Demo segment draft",
    note: "Local Business Stream showcase content draft. Publishing and backend delivery require real provider/Admin connection.",
    status: "draft_local",
    localOnly: true,
    deliveredToBackend: false,
    published: false,
    paymentEnabled: false,
    giftEnabled: false,
  };
  return { ...state, selectedItemId: item.id, contentItems: [...state.contentItems, item], contentDraftPreparedLocal: true, updatedAt };
}

export function prepareSelectedStreamBusinessShowcaseContentItemLocal(state: StreamBusinessShowcaseContentRuntimeState): StreamBusinessShowcaseContentRuntimeState {
  const target = selectedItem(state);
  const updatedAt = nowIso();
  const status: StreamBusinessShowcaseContentItemStatus = target.kind === "policy_notice" ? "compliance_review_local" : "prepared_local";
  return {
    ...state,
    contentDraftPreparedLocal: true,
    complianceReviewPreparedLocal: state.complianceReviewPreparedLocal || target.kind === "policy_notice",
    contentItems: state.contentItems.map((item) => item.id === target.id ? { ...item, status } : item),
    updatedAt,
  };
}

export function markStreamBusinessShowcaseContentComplianceReviewedLocal(state: StreamBusinessShowcaseContentRuntimeState): StreamBusinessShowcaseContentRuntimeState {
  const updatedAt = nowIso();
  return {
    ...state,
    complianceReviewPreparedLocal: true,
    contentDraftPreparedLocal: true,
    contentItems: state.contentItems.map((item) => item.kind === "policy_notice" || item.kind === "hero_product_card" ? { ...item, status: item.kind === "policy_notice" ? "compliance_review_local" : "prepared_local" } : item),
    updatedAt,
  };
}

export function prepareAllStreamBusinessShowcaseContentItemsLocal(state: StreamBusinessShowcaseContentRuntimeState): StreamBusinessShowcaseContentRuntimeState {
  const updatedAt = nowIso();
  return {
    ...state,
    contentDraftPreparedLocal: true,
    complianceReviewPreparedLocal: true,
    contentItems: state.contentItems.map((item) => ({ ...item, status: item.kind === "policy_notice" ? "compliance_review_local" : "prepared_local" })),
    updatedAt,
  };
}

export function runStreamBusinessShowcaseContentCheck(
  state: StreamBusinessShowcaseContentRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
): StreamBusinessShowcaseContentRuntimeState {
  return recompute(state, room, stage, readiness, controls);
}

export function queueStreamBusinessShowcaseContentEvent(
  state: StreamBusinessShowcaseContentRuntimeState,
  eventQueue: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
): { readonly state: StreamBusinessShowcaseContentRuntimeState; readonly eventQueue: StreamRoomEventQueueRuntimeState } {
  const checked = runStreamBusinessShowcaseContentCheck(state, room, stage, readiness, controls);
  const selected = selectedItem(checked);
  const nextQueue = enqueueLocalStreamRoomEvent(eventQueue, room, {
    kind: "provider_handoff_request",
    label: "Business Stream showcase content local evidence",
    priority: checked.localBlockers.length > 0 ? "high" : "normal",
    payload: {
      roomId: room.roomId,
      mode: room.mode,
      selectedItemId: selected.id,
      selectedItemKind: selected.kind,
      selectedItemStatus: selected.status,
      preparedContentItems: preparedCount(checked.contentItems),
      contentReadyLocal: checked.localBlockers.length === 0,
      deliveredToProvider: false,
      fakeContentPublishAllowed: false,
      fakePaymentAllowed: false,
      fakeGiftAllowed: false,
    },
  });
  return {
    state: recompute({ ...checked, queuedBusinessContentEvents: checked.queuedBusinessContentEvents + 1 }, room, stage, readiness, controls),
    eventQueue: nextQueue,
  };
}

export function requestStreamBusinessShowcaseContentProviderBlocked(
  state: StreamBusinessShowcaseContentRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
): StreamBusinessShowcaseContentRuntimeState {
  return recompute({ ...state, providerContentHandoffRequestedLocal: true }, room, stage, readiness, controls);
}

export function buildStreamBusinessShowcaseContentEvidenceSnapshot(
  state: StreamBusinessShowcaseContentRuntimeState,
): StreamBusinessShowcaseContentEvidenceSnapshot {
  const selected = selectedItem(state);
  const totalContentItems = state.contentItems.length;
  const preparedContentItems = preparedCount(state.contentItems);
  const complianceReviewItems = state.contentItems.filter((item) => item.status === "compliance_review_local").length;
  const providerRequiredItems = state.contentItems.filter((item) => item.status === "provider_required").length;
  return {
    version: "STREAM-109O",
    roomId: state.roomId,
    status: state.status,
    selectedItemId: selected.id,
    selectedItemKind: selected.kind,
    selectedItemStatus: selected.status,
    totalContentItems,
    preparedContentItems,
    complianceReviewItems,
    providerRequiredItems,
    heroContentReady: itemReady(state.contentItems, "hero_product_card"),
    contactContentReady: itemReady(state.contentItems, "contact_card"),
    policyNoticeReady: itemReady(state.contentItems, "policy_notice"),
    contentDraftPreparedLocal: state.contentDraftPreparedLocal,
    complianceReviewPreparedLocal: state.complianceReviewPreparedLocal,
    queuedBusinessContentEvents: state.queuedBusinessContentEvents,
    providerContentHandoffRequestedLocal: state.providerContentHandoffRequestedLocal,
    localBlockers: state.localBlockers,
    providerBlockers: state.providerBlockers,
    backendBusinessContentContract: state.integration.backendBusinessContentContract,
    mediaBusinessContentProvider: state.integration.mediaBusinessContentProvider,
    catalogContentProvider: state.integration.catalogContentProvider,
    adminBusinessContentReview: state.integration.adminBusinessContentReview,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
    fakeContentPublishAllowed: false,
    fakeBusinessLaunchAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeMonetizationAllowed: false,
    readyForBackendUnion: true,
  };
}
