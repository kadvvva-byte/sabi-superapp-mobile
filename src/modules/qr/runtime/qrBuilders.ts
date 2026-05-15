import type {
  SabiQrFunctionCode,
  SabiQrMode,
  SabiQrRail,
  SabiQrSurface,
  SabiQrTokenRequest,
} from "../contracts/universalQr.contracts";

export type SabiQrClientPreviewPayload = {
  version: "QR-100_CLIENT_PREVIEW";
  qrId: string;
  mode: SabiQrMode;
  surface: SabiQrSurface;
  rail: SabiQrRail;
  functionCode: SabiQrFunctionCode;
  ownerUserId: string;
  trustState: "client_preview_unsigned";
  createdAt: string;
  expiresAt: string;
  publicProfileId?: string | null;
  username?: string | null;
  phoneMasked?: string | null;
  targetUserId?: string | null;
  chatId?: string | null;
  amount?: string | null;
  currency?: string | null;
  coinAmount?: string | null;
  orderId?: string | null;
  paymentPurpose?: string | null;
  merchantId?: string | null;
  businessId?: string | null;
  receiverWalletId?: string | null;
  payerWalletId?: string | null;
  organizationId?: string | null;
  attendanceSessionId?: string | null;
  locationId?: string | null;
};

function nowIso() {
  return new Date().toISOString();
}

function plusSeconds(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function createPreviewId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getSabiQrDefaultRail(surface: SabiQrSurface): SabiQrRail {
  switch (surface) {
    case "wallet":
      return "sabi_wallet";
    case "coin_wallet":
      return "coin_wallet";
    case "crypto_wallet":
      return "crypto_wallet";
    case "merchant":
      return "merchant_wallet";
    case "business":
      return "business_wallet";
    case "marketplace":
      return "marketplace";
    case "stream":
      return "stream";
    case "taxi":
      return "taxi";
    case "delivery":
      return "delivery";
    case "school_attendance":
      return "school";
    case "work_attendance":
      return "work";
    case "virtual_card":
      return "virtual_card_provider";
    case "messenger":
    case "profile":
    case "verification":
    default:
      return "messenger";
  }
}

function basePreview(input: {
  ownerUserId: string;
  surface: SabiQrSurface;
  mode: SabiQrMode;
  functionCode: SabiQrFunctionCode;
  ttlSeconds?: number;
}): SabiQrClientPreviewPayload {
  return {
    version: "QR-100_CLIENT_PREVIEW",
    qrId: createPreviewId(input.functionCode),
    mode: input.mode,
    surface: input.surface,
    rail: getSabiQrDefaultRail(input.surface),
    functionCode: input.functionCode,
    ownerUserId: input.ownerUserId,
    trustState: "client_preview_unsigned",
    createdAt: nowIso(),
    expiresAt: plusSeconds(input.ttlSeconds ?? 120),
  };
}

export function buildSabiProfileQrPreview(input: {
  ownerUserId: string;
  publicProfileId?: string | null;
  username?: string | null;
  phoneMasked?: string | null;
}) {
  return {
    ...basePreview({
      ownerUserId: input.ownerUserId,
      surface: "profile",
      mode: "identity_static",
      functionCode: "profile_identity",
      ttlSeconds: 30 * 24 * 60 * 60,
    }),
    publicProfileId: input.publicProfileId ?? input.ownerUserId,
    username: input.username ?? null,
    phoneMasked: input.phoneMasked ?? null,
  } satisfies SabiQrClientPreviewPayload;
}

export function buildSabiMessengerQrPreview(input: {
  ownerUserId: string;
  targetUserId?: string | null;
  chatId?: string | null;
  username?: string | null;
}) {
  return {
    ...basePreview({
      ownerUserId: input.ownerUserId,
      surface: "messenger",
      mode: "identity_static",
      functionCode: "messenger_profile",
      ttlSeconds: 30 * 24 * 60 * 60,
    }),
    publicProfileId: input.ownerUserId,
    targetUserId: input.targetUserId ?? null,
    chatId: input.chatId ?? null,
    username: input.username ?? null,
    phoneMasked: null,
  } satisfies SabiQrClientPreviewPayload;
}

type LegacyMoneyMode =
  | SabiQrMode
  | "merchant_presented"
  | "user_presented"
  | "dynamic_order"
  | "private_order"
  | "static_entry";

function normalizeMoneyMode(mode: LegacyMoneyMode, surface: SabiQrSurface): SabiQrMode {
  if (mode === "merchant_presented") return "merchant_presented_static";
  if (mode === "user_presented") return "user_presented_dynamic";
  if (mode === "dynamic_order") return "merchant_presented_dynamic";
  if (mode === "private_order") return "merchant_presented_private";
  if (mode === "static_entry") return surface === "profile" || surface === "messenger" ? "identity_static" : "merchant_presented_static";
  return mode;
}

function moneyFunctionCode(surface: SabiQrSurface, mode: SabiQrMode): SabiQrFunctionCode {
  if (surface === "coin_wallet") return mode === "user_presented_dynamic" ? "coin_wallet_receive" : "coin_wallet_transfer";
  if (surface === "merchant") return mode === "merchant_presented_static" ? "merchant_static_entry" : "merchant_dynamic_order";
  if (surface === "business") return "business_invoice";
  if (surface === "messenger") return "messenger_payment";
  if (surface === "marketplace") return "marketplace_order";
  if (surface === "stream") return "stream_donation";
  if (surface === "taxi") return "taxi_trip_payment";
  if (surface === "delivery") return "delivery_order";
  if (surface === "virtual_card") return "virtual_card_payment";
  return mode === "user_presented_dynamic" ? "wallet_user_payment" : "wallet_receive";
}

export function buildSabiMoneyQrPreview(input: {
  mode: LegacyMoneyMode;
  surface: Extract<SabiQrSurface, "wallet" | "coin_wallet" | "merchant" | "business" | "messenger" | "marketplace" | "stream" | "taxi" | "delivery" | "virtual_card">;
  ownerUserId: string;
  amount?: string | null;
  currency?: string | null;
  coinAmount?: string | null;
  orderId?: string | null;
  paymentPurpose?: string | null;
  merchantId?: string | null;
  businessId?: string | null;
  receiverWalletId?: string | null;
  payerWalletId?: string | null;
}) {
  const mode = normalizeMoneyMode(input.mode, input.surface);
  return {
    ...basePreview({
      ownerUserId: input.ownerUserId,
      surface: input.surface,
      mode,
      functionCode: moneyFunctionCode(input.surface, mode),
      ttlSeconds: mode === "merchant_presented_static" ? 365 * 24 * 60 * 60 : 180,
    }),
    amount: input.amount ?? null,
    currency: input.currency ?? null,
    coinAmount: input.coinAmount ?? null,
    orderId: input.orderId ?? null,
    paymentPurpose: input.paymentPurpose ?? null,
    merchantId: input.merchantId ?? null,
    businessId: input.businessId ?? null,
    receiverWalletId: input.receiverWalletId ?? null,
    payerWalletId: input.payerWalletId ?? null,
  } satisfies SabiQrClientPreviewPayload;
}

export function buildSabiAttendanceQrPreview(input: {
  surface: "school_attendance" | "work_attendance";
  ownerUserId: string;
  organizationId: string;
  attendanceSessionId: string;
  locationId?: string | null;
  action?: "check_in" | "check_out";
}) {
  const functionCode: SabiQrFunctionCode = input.surface === "school_attendance"
    ? input.action === "check_out" ? "school_check_out" : "school_check_in"
    : input.action === "check_out" ? "work_check_out" : "work_check_in";

  return {
    ...basePreview({
      ownerUserId: input.ownerUserId,
      surface: input.surface,
      mode: "attendance_dynamic",
      functionCode,
      ttlSeconds: 120,
    }),
    organizationId: input.organizationId,
    attendanceSessionId: input.attendanceSessionId,
    locationId: input.locationId ?? null,
  } satisfies SabiQrClientPreviewPayload;
}

export function buildSabiVerificationQrPreview(input: {
  ownerUserId: string;
  publicProfileId?: string | null;
}) {
  return {
    ...basePreview({
      ownerUserId: input.ownerUserId,
      surface: "verification",
      mode: "merchant_presented_private",
      functionCode: "profile_identity",
      ttlSeconds: 120,
    }),
    publicProfileId: input.publicProfileId ?? input.ownerUserId,
    username: null,
    phoneMasked: null,
  } satisfies SabiQrClientPreviewPayload;
}

export function toSabiQrTokenRequest(preview: SabiQrClientPreviewPayload): SabiQrTokenRequest {
  return {
    functionCode: preview.functionCode,
    actorUserId: preview.ownerUserId,
    amount: preview.amount ?? null,
    currency: preview.currency ?? null,
    reference: preview.orderId ?? preview.paymentPurpose ?? null,
    counterpartyId: preview.merchantId ?? preview.businessId ?? preview.targetUserId ?? null,
    organizationId: preview.organizationId ?? null,
    metadata: {
      source: "client_preview",
      surface: preview.surface,
      rail: preview.rail,
      previewQrId: preview.qrId,
    },
  };
}

export function isSabiQrPayload(value: unknown): value is SabiQrClientPreviewPayload {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SabiQrClientPreviewPayload>;
  return candidate.version === "QR-100_CLIENT_PREVIEW" && typeof candidate.qrId === "string";
}
