import {
  STREAM_108N_LAUNCH_BLOCKERS,
  STREAM_108N_VERSION,
  getStream108NLaunchReadinessSnapshot,
  assertStream108NLaunchControlIsSafe,
  type Stream108NControlCategory,
  type Stream108NControlStatus,
} from "./stream108nLaunchControlCenter";

export const STREAM_108O_VERSION = "STREAM-108O-ADMIN-SNAPSHOT-CONTRACT-LOCKED-PREVIEW" as const;

export type Stream108OAdminSnapshotArea =
  | "mobile_ui_preview"
  | "live_engine_provider"
  | "media_storage_cdn"
  | "realtime_counters"
  | "official_creator_verification"
  | "moderation_safety"
  | "monetization_wallet_bridge"
  | "analytics_observability"
  | "website_distribution"
  | "owner_final_review";

export type Stream108OAdminSnapshotStatus =
  | "locked_preview"
  | "provider_not_configured"
  | "admin_review_required"
  | "owner_approval_required"
  | "blocked_until_real_integration";

export type Stream108OAdminEvidenceSource =
  | "mobile_preview_source"
  | "admin_readonly_source"
  | "future_backend_provider_source"
  | "owner_review_source";

export type Stream108OAdminEvidenceItem = {
  id: string;
  area: Stream108OAdminSnapshotArea;
  title: string;
  status: Stream108OAdminSnapshotStatus;
  evidenceSource: Stream108OAdminEvidenceSource;
  sourceOnly: true;
  previewVisible: true;
  adminReadonly: true;
  launchBlocking: true;
  fakeEvidenceAllowed: false;
  fakeLiveAllowed: false;
  fakeProviderAllowed: false;
  fakePaymentAllowed: false;
  fakeLaunchCompleteAllowed: false;
  requiresRealEvidenceBeforePublicLaunch: true;
  walletRuntimeTouched: false;
  messengerRuntimeTouched: false;
  callsRuntimeTouched: false;
  serverFoundationTouched: false;
  backendFinanceTouched: false;
};

export type Stream108OInheritedBlockerSummary = {
  blockerId: string;
  inheritedFrom: typeof STREAM_108N_VERSION;
  category: Stream108NControlCategory;
  status: Stream108NControlStatus;
  launchBlocking: true;
  fakeCompletionAllowed: false;
};

export type Stream108OAdminSnapshotContract = {
  version: typeof STREAM_108O_VERSION;
  stage: "108O";
  basedOn: typeof STREAM_108N_VERSION;
  streamOnly: true;
  sourceOnly: true;
  adminSnapshotContractLockedPreview: true;
  mobileRuntimeChanged: false;
  launchComplete: false;
  publicLaunchAllowed: false;
  fakeEvidenceAllowed: false;
  fakeLiveAllowed: false;
  fakeProviderAllowed: false;
  fakePaymentAllowed: false;
  fakeLaunchCompleteAllowed: false;
  walletRuntimeTouched: false;
  messengerRuntimeTouched: false;
  callsRuntimeTouched: false;
  serverFoundationTouched: false;
  backendFinanceTouched: false;
  requiredEvidenceCount: number;
  unresolvedEvidenceCount: number;
  inheritedBlockerCount: number;
  inheritedBlockers: Stream108OInheritedBlockerSummary[];
  evidenceItems: Stream108OAdminEvidenceItem[];
  nextAllowedStep: "108P_source_only_stream_admin_visual_panel_or_i18n_polish";
};

const lockedEvidenceBase = {
  sourceOnly: true,
  previewVisible: true,
  adminReadonly: true,
  launchBlocking: true,
  fakeEvidenceAllowed: false,
  fakeLiveAllowed: false,
  fakeProviderAllowed: false,
  fakePaymentAllowed: false,
  fakeLaunchCompleteAllowed: false,
  requiresRealEvidenceBeforePublicLaunch: true,
  walletRuntimeTouched: false,
  messengerRuntimeTouched: false,
  callsRuntimeTouched: false,
  serverFoundationTouched: false,
  backendFinanceTouched: false,
} as const;

export const STREAM_108O_ADMIN_EVIDENCE_ITEMS: Stream108OAdminEvidenceItem[] = [
  {
    ...lockedEvidenceBase,
    id: "stream_108o_mobile_preview_inventory",
    area: "mobile_ui_preview",
    title: "Mobile Stream preview inventory must stay visible as preview-only evidence, not launch evidence.",
    status: "locked_preview",
    evidenceSource: "mobile_preview_source",
  },
  {
    ...lockedEvidenceBase,
    id: "stream_108o_live_engine_provider_status",
    area: "live_engine_provider",
    title: "Live engine status must remain provider_not_configured until a real provider/backend source exists.",
    status: "provider_not_configured",
    evidenceSource: "future_backend_provider_source",
  },
  {
    ...lockedEvidenceBase,
    id: "stream_108o_media_storage_cdn_status",
    area: "media_storage_cdn",
    title: "Media storage and CDN status must be supplied by a real storage pipeline before public video publishing.",
    status: "provider_not_configured",
    evidenceSource: "future_backend_provider_source",
  },
  {
    ...lockedEvidenceBase,
    id: "stream_108o_realtime_counter_source_status",
    area: "realtime_counters",
    title: "Viewer, online, and live counters must come from a real source and cannot be locally faked.",
    status: "provider_not_configured",
    evidenceSource: "future_backend_provider_source",
  },
  {
    ...lockedEvidenceBase,
    id: "stream_108o_official_creator_verification_snapshot",
    area: "official_creator_verification",
    title: "Official streamer registration requires Admin review, creator rules, and owner-approved verification policy.",
    status: "admin_review_required",
    evidenceSource: "admin_readonly_source",
  },
  {
    ...lockedEvidenceBase,
    id: "stream_108o_moderation_safety_snapshot",
    area: "moderation_safety",
    title: "Reports, moderation, content quality, and safety triage must exist as real Admin evidence before launch.",
    status: "admin_review_required",
    evidenceSource: "admin_readonly_source",
  },
  {
    ...lockedEvidenceBase,
    id: "stream_108o_monetization_wallet_bridge_snapshot",
    area: "monetization_wallet_bridge",
    title: "Gifts, paid features, and creator earnings stay blocked until a separately approved Wallet bridge exists.",
    status: "blocked_until_real_integration",
    evidenceSource: "future_backend_provider_source",
  },
  {
    ...lockedEvidenceBase,
    id: "stream_108o_analytics_observability_snapshot",
    area: "analytics_observability",
    title: "Analytics, abuse signals, provider diagnostics, and launch logs must be real readonly evidence.",
    status: "admin_review_required",
    evidenceSource: "admin_readonly_source",
  },
  {
    ...lockedEvidenceBase,
    id: "stream_108o_website_distribution_snapshot",
    area: "website_distribution",
    title: "Website/download distribution must remain review-only until the test package and owner gate are approved.",
    status: "owner_approval_required",
    evidenceSource: "owner_review_source",
  },
  {
    ...lockedEvidenceBase,
    id: "stream_108o_owner_final_review_snapshot",
    area: "owner_final_review",
    title: "Owner final review is mandatory and cannot be replaced by local preview state.",
    status: "owner_approval_required",
    evidenceSource: "owner_review_source",
  },
] as const satisfies Stream108OAdminEvidenceItem[];

export const STREAM_108O_FORBIDDEN_MARKERS = [
  "fake_live_success",
  "fake_provider_ready",
  "fake_payment_success",
  "fake_launch_complete",
  "fake_owner_approval",
  "wallet_runtime_change",
  "messenger_runtime_change",
  "calls_runtime_change",
  "server_foundation_change",
  "backend_finance_change",
] as const;

export const STREAM_108O_ALLOWED_NEXT_ACTIONS = [
  "source_only_stream_admin_visual_panel",
  "source_only_stream_i18n_label_completion",
  "read_only_stream_snapshot_display_contract",
  "mobile_stream_preview_polish_without_fake_success",
] as const;

function getInherited108NBlockers(): Stream108OInheritedBlockerSummary[] {
  return STREAM_108N_LAUNCH_BLOCKERS.map((blocker) => ({
    blockerId: blocker.id,
    inheritedFrom: STREAM_108N_VERSION,
    category: blocker.category,
    status: blocker.status,
    launchBlocking: true,
    fakeCompletionAllowed: false,
  }));
}

export function getStream108OAdminSnapshotContract(): Stream108OAdminSnapshotContract {
  const inherited108NSnapshot = getStream108NLaunchReadinessSnapshot();
  assertStream108NLaunchControlIsSafe(inherited108NSnapshot);

  const inheritedBlockers = getInherited108NBlockers();

  return {
    version: STREAM_108O_VERSION,
    stage: "108O",
    basedOn: STREAM_108N_VERSION,
    streamOnly: true,
    sourceOnly: true,
    adminSnapshotContractLockedPreview: true,
    mobileRuntimeChanged: false,
    launchComplete: false,
    publicLaunchAllowed: false,
    fakeEvidenceAllowed: false,
    fakeLiveAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeLaunchCompleteAllowed: false,
    walletRuntimeTouched: false,
    messengerRuntimeTouched: false,
    callsRuntimeTouched: false,
    serverFoundationTouched: false,
    backendFinanceTouched: false,
    requiredEvidenceCount: STREAM_108O_ADMIN_EVIDENCE_ITEMS.length,
    unresolvedEvidenceCount: STREAM_108O_ADMIN_EVIDENCE_ITEMS.length,
    inheritedBlockerCount: inheritedBlockers.length,
    inheritedBlockers,
    evidenceItems: [...STREAM_108O_ADMIN_EVIDENCE_ITEMS],
    nextAllowedStep: "108P_source_only_stream_admin_visual_panel_or_i18n_polish",
  };
}

export function assertStream108OAdminSnapshotContractIsSafe(snapshot: Stream108OAdminSnapshotContract): true {
  const unsafe =
    !snapshot.streamOnly ||
    !snapshot.sourceOnly ||
    snapshot.mobileRuntimeChanged ||
    snapshot.launchComplete ||
    snapshot.publicLaunchAllowed ||
    snapshot.fakeEvidenceAllowed ||
    snapshot.fakeLiveAllowed ||
    snapshot.fakeProviderAllowed ||
    snapshot.fakePaymentAllowed ||
    snapshot.fakeLaunchCompleteAllowed ||
    snapshot.walletRuntimeTouched ||
    snapshot.messengerRuntimeTouched ||
    snapshot.callsRuntimeTouched ||
    snapshot.serverFoundationTouched ||
    snapshot.backendFinanceTouched ||
    snapshot.unresolvedEvidenceCount <= 0 ||
    snapshot.evidenceItems.length !== snapshot.requiredEvidenceCount ||
    snapshot.evidenceItems.some(
      (item) =>
        item.fakeEvidenceAllowed ||
        item.fakeLiveAllowed ||
        item.fakeProviderAllowed ||
        item.fakePaymentAllowed ||
        item.fakeLaunchCompleteAllowed ||
        !item.launchBlocking ||
        !item.adminReadonly ||
        !item.sourceOnly ||
        item.walletRuntimeTouched ||
        item.messengerRuntimeTouched ||
        item.callsRuntimeTouched ||
        item.serverFoundationTouched ||
        item.backendFinanceTouched,
    ) ||
    snapshot.inheritedBlockers.some((blocker) => blocker.fakeCompletionAllowed || !blocker.launchBlocking);

  if (unsafe) {
    throw new Error("STREAM_108O_UNSAFE_ADMIN_SNAPSHOT_CONTRACT_STATE");
  }

  return true;
}

export const STREAM_108O_ADMIN_SNAPSHOT_CONTRACT = getStream108OAdminSnapshotContract();

assertStream108OAdminSnapshotContractIsSafe(STREAM_108O_ADMIN_SNAPSHOT_CONTRACT);
