import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream114DBusinessHostControlsComplianceUiuxEvidence } from "./stream114dBusinessHostControlsComplianceKernelUiuxRuntime";

export type Stream114EBusinessProfileContextSectionId =
  | "business_identity_card"
  | "brand_context_surface"
  | "owner_role_boundary"
  | "business_category_context"
  | "streamer_profile_hook"
  | "contact_lead_context"
  | "compliance_status_copy"
  | "kernel_profile_contract"
  | "merchant_wallet_blocked"
  | "gifts_end_stage_boundary"
  | "next_business_preflight";

export type Stream114EBusinessProfileContextStatus = "ready" | "needs_owner_check";

export type Stream114EBusinessProfileContextSection = {
  readonly id: Stream114EBusinessProfileContextSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream114EBusinessProfileContextStatus;
};

export type Stream114EBusinessProfileFieldId = "brand_name" | "category" | "owner_role" | "contact_mode";

export type Stream114EBusinessProfileField = {
  readonly id: Stream114EBusinessProfileFieldId;
  readonly title: string;
  readonly value: string;
  readonly kernelFieldName: string;
  readonly safeState: "local_context_only";
};

export type Stream114EBusinessProfileContextUiuxState = {
  readonly version: "STREAM-114E";
  readonly selectedSectionId: Stream114EBusinessProfileContextSectionId;
  readonly readySectionIds: readonly Stream114EBusinessProfileContextSectionId[];
  readonly selectedFieldId: Stream114EBusinessProfileFieldId;
  readonly lastAction: string;
  readonly businessIdentityCardReadyLocal: boolean;
  readonly brandContextSurfaceReadyLocal: boolean;
  readonly ownerRoleBoundaryReadyLocal: boolean;
  readonly businessCategoryContextReadyLocal: boolean;
  readonly streamerProfileHookReadyLocal: boolean;
  readonly contactLeadContextReadyLocal: boolean;
  readonly complianceStatusCopyReadyLocal: boolean;
  readonly kernelProfileContractReadyLocal: boolean;
  readonly merchantWalletBlockedLocal: boolean;
  readonly giftsEndStageBoundaryLocal: boolean;
  readonly nextBusinessPreflightReadyLocal: boolean;
  readonly businessHostControlsMustStayReady: true;
  readonly allConnectionsThroughKernel: true;
  readonly directProfileProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directMerchantConnectionAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly scatteredProfileServiceAllowed: false;
  readonly profileScreenCreatedNow: false;
  readonly businessProfileBackendTouchedNow: false;
  readonly merchantBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly fakeOfficialVerificationAllowed: false;
  readonly fakeBusinessApprovalAllowed: false;
  readonly fakeMerchantActivationAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

export type Stream114EBusinessProfileContextUiuxEvidence = {
  readonly version: "STREAM-114E";
  readonly selectedSectionId: Stream114EBusinessProfileContextSectionId;
  readonly selectedFieldId: Stream114EBusinessProfileFieldId;
  readonly businessProfileScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream114EBusinessProfileContextSection[];
  readonly profileFields: readonly Stream114EBusinessProfileField[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly activeFieldTitle: string;
  readonly activeFieldMeta: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly businessHostControlsReadyBeforeProfile: boolean;
  readonly businessIdentityCardReady: boolean;
  readonly brandContextSurfaceReady: boolean;
  readonly ownerRoleBoundaryReady: boolean;
  readonly businessCategoryContextReady: boolean;
  readonly streamerProfileHookReady: boolean;
  readonly contactLeadContextReady: boolean;
  readonly complianceStatusCopyReady: boolean;
  readonly kernelProfileContractReady: boolean;
  readonly merchantWalletBlocked: boolean;
  readonly giftsDeferredCorrectly: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directProfileProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directMerchantConnectionAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly scatteredProfileServiceAllowed: false;
  readonly profileScreenCreatedNow: false;
  readonly businessProfileBackendTouchedNow: false;
  readonly merchantBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly fakeOfficialVerificationAllowed: false;
  readonly fakeBusinessApprovalAllowed: false;
  readonly fakeMerchantActivationAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

const SECTION_ORDER: readonly Stream114EBusinessProfileContextSectionId[] = [
  "business_identity_card",
  "brand_context_surface",
  "owner_role_boundary",
  "business_category_context",
  "streamer_profile_hook",
  "contact_lead_context",
  "compliance_status_copy",
  "kernel_profile_contract",
  "merchant_wallet_blocked",
  "gifts_end_stage_boundary",
  "next_business_preflight",
];

const SECTION_TITLES: Record<Stream114EBusinessProfileContextSectionId, string> = {
  business_identity_card: "Business identity card",
  brand_context_surface: "Контекст бренда",
  owner_role_boundary: "Граница роли владельца",
  business_category_context: "Business категория",
  streamer_profile_hook: "Profile hook on time",
  contact_lead_context: "Контакт / lead context",
  compliance_status_copy: "Compliance status copy",
  kernel_profile_contract: "Kernel profile contract",
  merchant_wallet_blocked: "Merchant / Wallet закрыты",
  gifts_end_stage_boundary: "Подарки в конце",
  next_business_preflight: "Next Business preflight",
};

const SECTION_DESCRIPTIONS: Record<Stream114EBusinessProfileContextSectionId, string> = {
  business_identity_card: "Business Stream gets a clean identity card inside live settings: brand name, category, owner role and safe status.",
  brand_context_surface: "Brand context explains what the business is without pretending to have a full external profile or official verification yet.",
  owner_role_boundary: "Owner/admin/moderator roles are named for UI/UX, but no fake role approval or backend permission change is created.",
  business_category_context: "Категория помогает понять тип эфира до появления catalog/order/payment stages.",
  streamer_profile_hook: "Future profile and official streamer/business profile entry points are prepared now, without creating full profile screens early.",
  contact_lead_context: "Запрос цены/контакт/lead из 114C остаётся привязан к business context и не делает fake Messenger/backend send.",
  compliance_status_copy: "Regulated or sensitive business content stays under moderation/compliance copy and future admin gates.",
  kernel_profile_contract: "All profile/business context, status, leads, moderation and future gift edges must go through Stream kernel contracts/facades/events.",
  merchant_wallet_blocked: "Merchant, Wallet, invoices, checkout, settlement and payout remain blocked until their real stages.",
  gifts_end_stage_boundary: "Gift sending is mandatory later and must be correct, but no fake gift send/payment/COIN movement is added now.",
  next_business_preflight: "After profile/context, continue with Business Stream preflight and launch-readiness UI/UX without jumping to money or gifts.",
};

const PROFILE_FIELDS: readonly Stream114EBusinessProfileField[] = [
  { id: "brand_name", title: "Название бренда", value: "Sabi Business preview", kernelFieldName: "stream.business.profile.brand_name", safeState: "local_context_only" },
  { id: "category", title: "Category", value: "Business live / витрина", kernelFieldName: "stream.business.profile.category", safeState: "local_context_only" },
  { id: "owner_role", title: "Роль владельца", value: "Только host controls", kernelFieldName: "stream.business.profile.owner_role", safeState: "local_context_only" },
  { id: "contact_mode", title: "Contact mode", value: "Request / lead intent", kernelFieldName: "stream.business.profile.contact_mode", safeState: "local_context_only" },
];

function uniqueReady(items: readonly Stream114EBusinessProfileContextSectionId[]): readonly Stream114EBusinessProfileContextSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream114EBusinessProfileContextUiuxState(): Stream114EBusinessProfileContextUiuxState {
  return {
    version: "STREAM-114E",
    selectedSectionId: "business_identity_card",
    readySectionIds: ["kernel_profile_contract", "merchant_wallet_blocked", "gifts_end_stage_boundary"],
    selectedFieldId: "brand_name",
    lastAction: "114E starts Business profile/context UI/UX: kernel-only, no fake profile approval, Merchant, Wallet, payment or gifts.",
    businessIdentityCardReadyLocal: false,
    brandContextSurfaceReadyLocal: false,
    ownerRoleBoundaryReadyLocal: false,
    businessCategoryContextReadyLocal: false,
    streamerProfileHookReadyLocal: false,
    contactLeadContextReadyLocal: false,
    complianceStatusCopyReadyLocal: false,
    kernelProfileContractReadyLocal: true,
    merchantWalletBlockedLocal: true,
    giftsEndStageBoundaryLocal: true,
    nextBusinessPreflightReadyLocal: false,
    businessHostControlsMustStayReady: true,
    allConnectionsThroughKernel: true,
    directProfileProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directMerchantConnectionAllowed: false,
    directWalletConnectionAllowed: false,
    scatteredProfileServiceAllowed: false,
    profileScreenCreatedNow: false,
    businessProfileBackendTouchedNow: false,
    merchantBackendTouchedNow: false,
    walletTouchedNow: false,
    fakeOfficialVerificationAllowed: false,
    fakeBusinessApprovalAllowed: false,
    fakeMerchantActivationAllowed: false,
    fakeOrderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
  };
}

function setReadyFlag(state: Stream114EBusinessProfileContextUiuxState, sectionId: Stream114EBusinessProfileContextSectionId): Stream114EBusinessProfileContextUiuxState {
  return {
    ...state,
    businessIdentityCardReadyLocal: state.businessIdentityCardReadyLocal || sectionId === "business_identity_card",
    brandContextSurfaceReadyLocal: state.brandContextSurfaceReadyLocal || sectionId === "brand_context_surface",
    ownerRoleBoundaryReadyLocal: state.ownerRoleBoundaryReadyLocal || sectionId === "owner_role_boundary",
    businessCategoryContextReadyLocal: state.businessCategoryContextReadyLocal || sectionId === "business_category_context",
    streamerProfileHookReadyLocal: state.streamerProfileHookReadyLocal || sectionId === "streamer_profile_hook",
    contactLeadContextReadyLocal: state.contactLeadContextReadyLocal || sectionId === "contact_lead_context",
    complianceStatusCopyReadyLocal: state.complianceStatusCopyReadyLocal || sectionId === "compliance_status_copy",
    kernelProfileContractReadyLocal: state.kernelProfileContractReadyLocal || sectionId === "kernel_profile_contract",
    merchantWalletBlockedLocal: state.merchantWalletBlockedLocal || sectionId === "merchant_wallet_blocked",
    giftsEndStageBoundaryLocal: state.giftsEndStageBoundaryLocal || sectionId === "gifts_end_stage_boundary",
    nextBusinessPreflightReadyLocal: state.nextBusinessPreflightReadyLocal || sectionId === "next_business_preflight",
  };
}

export function selectStream114EBusinessProfileContextSection(state: Stream114EBusinessProfileContextUiuxState, sectionId: Stream114EBusinessProfileContextSectionId): Stream114EBusinessProfileContextUiuxState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `114E выбран раздел ${SECTION_TITLES[sectionId]} for Business profile/context setup.`,
  };
}

export function selectStream114EBusinessProfileField(state: Stream114EBusinessProfileContextUiuxState, fieldId: Stream114EBusinessProfileFieldId): Stream114EBusinessProfileContextUiuxState {
  const field = PROFILE_FIELDS.find((item) => item.id === fieldId) ?? PROFILE_FIELDS[0];
  return {
    ...state,
    selectedFieldId: field.id,
    lastAction: `114E выбран раздел ${field.title}: ${field.kernelFieldName}.`,
  };
}

export function markStream114EBusinessProfileContextSectionReady(state: Stream114EBusinessProfileContextUiuxState, sectionId: Stream114EBusinessProfileContextSectionId, action: string): Stream114EBusinessProfileContextUiuxState {
  const next = setReadyFlag(state, sectionId);
  return {
    ...next,
    selectedSectionId: sectionId,
    readySectionIds: uniqueReady([...next.readySectionIds, sectionId]),
    lastAction: action,
  };
}

export function markStream114EBusinessProfileContextAllReady(state: Stream114EBusinessProfileContextUiuxState, action: string): Stream114EBusinessProfileContextUiuxState {
  return {
    ...state,
    selectedSectionId: "next_business_preflight",
    readySectionIds: SECTION_ORDER,
    businessIdentityCardReadyLocal: true,
    brandContextSurfaceReadyLocal: true,
    ownerRoleBoundaryReadyLocal: true,
    businessCategoryContextReadyLocal: true,
    streamerProfileHookReadyLocal: true,
    contactLeadContextReadyLocal: true,
    complianceStatusCopyReadyLocal: true,
    kernelProfileContractReadyLocal: true,
    merchantWalletBlockedLocal: true,
    giftsEndStageBoundaryLocal: true,
    nextBusinessPreflightReadyLocal: true,
    lastAction: action,
  };
}

export function buildStream114EBusinessProfileContextUiuxEvidence(
  state: Stream114EBusinessProfileContextUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  hostControlsEvidence: Stream114DBusinessHostControlsComplianceUiuxEvidence,
): Stream114EBusinessProfileContextUiuxEvidence {
  const readySections = uniqueReady(state.readySectionIds);
  const businessHostControlsReadyBeforeProfile = hostControlsEvidence.hostControlSurfaceReady && hostControlsEvidence.kernelEventContractReady;
  const activeField = PROFILE_FIELDS.find((item) => item.id === state.selectedFieldId) ?? PROFILE_FIELDS[0];
  const selectedSection = SECTION_TITLES[state.selectedSectionId];
  const totalSections = SECTION_ORDER.length;
  const safeFlagsPassed = [
    state.allConnectionsThroughKernel,
    state.directProfileProviderAllowed === false,
    state.directBusinessProviderAllowed === false,
    state.directMerchantConnectionAllowed === false,
    state.directWalletConnectionAllowed === false,
    state.scatteredProfileServiceAllowed === false,
    state.fakeOfficialVerificationAllowed === false,
    state.fakeBusinessApprovalAllowed === false,
    state.fakeMerchantActivationAllowed === false,
    state.fakeOrderAllowed === false,
    state.fakePaymentAllowed === false,
    state.fakeGiftSendingAllowed === false,
    state.giftSendingImplementedNow === false,
  ].filter(Boolean).length;
  const businessProfileScore = Math.min(99, Math.round(((readySections.length + safeFlagsPassed + (businessHostControlsReadyBeforeProfile ? 1 : 0)) / (totalSections + 14)) * 100));
  const sectionItems = SECTION_ORDER.map((id): Stream114EBusinessProfileContextSection => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: readySections.includes(id) ? "ready" : "needs_owner_check",
  }));

  return {
    version: "STREAM-114E",
    selectedSectionId: state.selectedSectionId,
    selectedFieldId: state.selectedFieldId,
    businessProfileScore,
    readySections: readySections.length,
    totalSections,
    sectionItems,
    profileFields: PROFILE_FIELDS,
    heroTitle: "Business profile context подготовлен внутри Stream",
    heroSubtitle: "Бренд, категория, owner role, contact context и compliance показаны как чистый UI/UX; полный профиль, Merchant и Wallet остаются будущими этапами.",
    phoneStatus: `${room.title || "Business live"} · ${stage.layout} · profile context local`,
    activeFieldTitle: activeField.title,
    activeFieldMeta: `${activeField.value} · ${activeField.kernelFieldName}`,
    primaryAction: `Complete ${selectedSection} without fake verification, Merchant, Wallet, order or gift sending.`,
    secondaryAction: state.lastAction,
    businessHostControlsReadyBeforeProfile,
    businessIdentityCardReady: state.businessIdentityCardReadyLocal,
    brandContextSurfaceReady: state.brandContextSurfaceReadyLocal,
    ownerRoleBoundaryReady: state.ownerRoleBoundaryReadyLocal,
    businessCategoryContextReady: state.businessCategoryContextReadyLocal,
    streamerProfileHookReady: state.streamerProfileHookReadyLocal,
    contactLeadContextReady: state.contactLeadContextReadyLocal,
    complianceStatusCopyReady: state.complianceStatusCopyReadyLocal,
    kernelProfileContractReady: state.kernelProfileContractReadyLocal,
    merchantWalletBlocked: state.merchantWalletBlockedLocal,
    giftsDeferredCorrectly: state.giftsEndStageBoundaryLocal && state.giftSendingImplementedNow === false,
    allConnectionsThroughKernel: true,
    directProfileProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directMerchantConnectionAllowed: false,
    directWalletConnectionAllowed: false,
    scatteredProfileServiceAllowed: false,
    profileScreenCreatedNow: false,
    businessProfileBackendTouchedNow: false,
    merchantBackendTouchedNow: false,
    walletTouchedNow: false,
    fakeOfficialVerificationAllowed: false,
    fakeBusinessApprovalAllowed: false,
    fakeMerchantActivationAllowed: false,
    fakeOrderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
  };
}
