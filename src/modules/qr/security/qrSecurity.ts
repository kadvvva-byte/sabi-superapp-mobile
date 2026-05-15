import type { SabiQrFunctionDefinition, SabiQrTokenRecord } from "../contracts/universalQr.contracts";

const FORBIDDEN_FAKE_MARKERS = [
  "pending-signature",
  "fake",
  "mock",
  "dev_signature",
  "sample_signature",
  "placeholder_signature",
];

export function assertNoFakeQrSignature(value: string | null | undefined) {
  const normalized = String(value ?? "").toLowerCase();
  if (!normalized) return;

  const hasForbiddenMarker = FORBIDDEN_FAKE_MARKERS.some((marker) =>
    normalized.includes(marker),
  );

  if (hasForbiddenMarker) {
    throw new Error("sabi_qr_fake_signature_forbidden");
  }
}

export function assertQrFunctionSeparation(definition: SabiQrFunctionDefinition) {
  if (definition.surface === "wallet" && definition.rail !== "sabi_wallet") {
    throw new Error("sabi_qr_wallet_surface_must_use_sabi_wallet_rail");
  }

  if (definition.surface === "coin_wallet" && definition.rail !== "coin_wallet") {
    throw new Error("sabi_qr_coin_wallet_surface_must_use_coin_wallet_rail");
  }

  if (definition.surface === "crypto_wallet" && definition.rail !== "crypto_wallet") {
    throw new Error("sabi_qr_crypto_surface_must_use_crypto_rail");
  }

  if (definition.surface === "merchant" && definition.rail !== "merchant_wallet") {
    throw new Error("sabi_qr_merchant_surface_must_use_merchant_rail");
  }

  if (definition.surface === "business" && definition.rail !== "business_wallet") {
    throw new Error("sabi_qr_business_surface_must_use_business_rail");
  }

  if (
    (definition.surface === "school_attendance" || definition.surface === "work_attendance") &&
    definition.domain !== "attendance"
  ) {
    throw new Error("sabi_qr_attendance_must_not_mix_payment_domain");
  }
}

export function assertCompactQrValue(value: string) {
  if (!value || value.trim().length < 8) {
    throw new Error("sabi_qr_value_empty");
  }

  if (value.length > 120) {
    throw new Error("sabi_qr_value_too_large_use_server_token");
  }

  if (value.trim().startsWith("{")) {
    throw new Error("sabi_qr_raw_json_forbidden_use_short_token");
  }
}

export function validateServerSignedToken(token: SabiQrTokenRecord) {
  assertNoFakeQrSignature(token.signaturePreview);
  assertCompactQrValue(token.qrValue);

  if (token.trustState !== "server_signed" && token.trustState !== "server_validated") {
    throw new Error("sabi_qr_requires_server_signed_token");
  }
}

export function createUnsignedSabiQrPreview(input: {
  mode: string;
  surface: string;
  ownerUserId: string;
  targetUserId?: string | null;
  chatId?: string | null;
  merchantId?: string | null;
  businessId?: string | null;
  organizationId?: string | null;
}) {
  return {
    version: "QR-100_CLIENT_PREVIEW" as const,
    qrId: `preview_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    mode: input.mode,
    surface: input.surface,
    ownerUserId: input.ownerUserId,
    targetUserId: input.targetUserId ?? null,
    chatId: input.chatId ?? null,
    merchantId: input.merchantId ?? null,
    businessId: input.businessId ?? null,
    organizationId: input.organizationId ?? null,
    trustState: "client_preview_unsigned" as const,
    createdAt: new Date().toISOString(),
  };
}
