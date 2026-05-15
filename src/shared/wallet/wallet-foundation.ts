import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";

import { appStorage } from "../storage/app-storage";

export const WALLET_FOUNDATION_STORAGE_KEY = "sabi_wallet_foundation_v1";

export type WalletBalanceKind = "main" | "local" | "coin" | "crypto";
export type WalletCardRouteCategory = "local" | "international" | "local_global" | "virtual";
export type WalletProviderStatus =
  | "provider_not_configured"
  | "kyc_required"
  | "review_required"
  | "restricted"
  | "ready";

export type WalletComplianceStatus =
  | "clear"
  | "kyc_required"
  | "aml_review"
  | "admin_review"
  | "safe_hold"
  | "restricted"
  | "blocked";

export type WalletKycStatus =
  | "not_required"
  | "required"
  | "pending"
  | "verified"
  | "rejected";

export type WalletAmlStatus =
  | "clear"
  | "monitoring"
  | "review_required"
  | "safe_hold"
  | "blocked";

export type WalletAdminReviewStatus =
  | "not_required"
  | "pending"
  | "approved"
  | "rejected"
  | "escalated";

export type WalletFundingRole = "personal" | "business" | "merchant";
export type WalletCardProviderTokenStatus =
  | "missing"
  | "pending"
  | "verified"
  | "rejected"
  | "restricted";

export type WalletCardBindingProviderPayload = {
  providerId: string;
  providerTokenId: string;
  maskedCard: string;
  cardCategory: WalletCardRouteCategory;
  providerStatus: WalletCardProviderTokenStatus;
  ownerRole: WalletFundingRole;
  routeCurrencyCode: string;
  cardBrand?: string | null;
  network?: string | null;
  providerReference?: string | null;
  tokenCreatedAt?: string | null;
};

export type WalletCardBindingSanitizationResult = {
  payload: WalletCardBindingProviderPayload;
  isValid: boolean;
  blockedFields: string[];
  reason: "ok" | "missing_provider_token" | "raw_card_data_blocked" | "provider_not_verified";
};

export type WalletVirtualCardUseCase = "online" | "subscription" | "travel";

export type WalletVirtualCardIssueRequestDraft = {
  providerStatus: WalletProviderStatus;
  currencyCode: string;
  monthlyLimit: number;
  useCase: WalletVirtualCardUseCase;
  controls: {
    frozen: boolean;
    allowOnline: boolean;
    allowInternational: boolean;
  };
  requestedAt: string;
};

export type WalletVirtualCardIssuingReadinessReason =
  | "ready"
  | "provider_not_configured"
  | "kyc_required"
  | "review_required"
  | "restricted"
  | "provider_launch_not_configured"
  | "currency_not_configured"
  | "limit_invalid";

export type WalletVirtualCardIssuingReadiness = {
  status: WalletProviderStatus;
  canRequest: boolean;
  reason: WalletVirtualCardIssuingReadinessReason;
};

export const WALLET_DEFAULT_PRIMARY_CURRENCY_CODE = "USD";
export const WALLET_DEFAULT_INTERNATIONAL_CURRENCY_CODE = "USD";

export type WalletCurrencyOption = {
  code: string;
  nameKey: string;
  symbol: string;
};

export type WalletFoundationSnapshot = {
  mainBalanceUsd: number;
  localBalance: number;
  localCurrencyCode: string;
  primaryCurrencyCode: string;
  internationalCurrencyCode: string;
  bankProviderStatus: WalletProviderStatus;
  cardProviderStatus: WalletProviderStatus;
  virtualCardProviderStatus: WalletProviderStatus;
  merchantProviderStatus: WalletProviderStatus;
  businessProviderStatus: WalletProviderStatus;
  coinProviderStatus: WalletProviderStatus;
  cryptoProviderStatus: WalletProviderStatus;
  complianceStatus: WalletComplianceStatus;
  kycStatus: WalletKycStatus;
  amlStatus: WalletAmlStatus;
  adminReviewStatus: WalletAdminReviewStatus;
  safeHoldReason: string;
  restrictedReason: string;
  coinBalance: number;
  cryptoBalanceUsd: number;
  updatedAt: string;
};

type WalletFoundationUpdate = Partial<WalletFoundationSnapshot>;

export const WALLET_PRIMARY_CURRENCY_OPTIONS: WalletCurrencyOption[] = [
  { code: "USD", nameKey: "wallet.currency.usd", symbol: "$" },
  { code: "EUR", nameKey: "wallet.currency.eur", symbol: "€" },
  { code: "CNY", nameKey: "wallet.currency.cny", symbol: "¥" },
  { code: "AED", nameKey: "wallet.currency.aed", symbol: "د.إ" },
  { code: "GBP", nameKey: "wallet.currency.gbp", symbol: "£" },
  { code: "JPY", nameKey: "wallet.currency.jpy", symbol: "¥" },
  { code: "KRW", nameKey: "wallet.currency.krw", symbol: "₩" },
];

export const WALLET_LOCAL_CURRENCY_OPTIONS: WalletCurrencyOption[] = [
  { code: "", nameKey: "wallet.currency.notConfigured", symbol: "" },
  { code: "UZS", nameKey: "wallet.currency.uzs", symbol: "soʻm" },
  { code: "KZT", nameKey: "wallet.currency.kzt", symbol: "₸" },
  { code: "KGS", nameKey: "wallet.currency.kgs", symbol: "сом" },
  { code: "TJS", nameKey: "wallet.currency.tjs", symbol: "SM" },
  { code: "TMT", nameKey: "wallet.currency.tmt", symbol: "m" },
  { code: "AZN", nameKey: "wallet.currency.azn", symbol: "₼" },
  { code: "TRY", nameKey: "wallet.currency.try", symbol: "₺" },
  { code: "INR", nameKey: "wallet.currency.inr", symbol: "₹" },
  { code: "AED", nameKey: "wallet.currency.aed", symbol: "د.إ" },
];

export const WALLET_INTERNATIONAL_CURRENCY_OPTIONS: WalletCurrencyOption[] = [
  { code: "USD", nameKey: "wallet.currency.usd", symbol: "$" },
  { code: "EUR", nameKey: "wallet.currency.eur", symbol: "€" },
  { code: "CNY", nameKey: "wallet.currency.cny", symbol: "¥" },
  { code: "AED", nameKey: "wallet.currency.aed", symbol: "د.إ" },
  { code: "GBP", nameKey: "wallet.currency.gbp", symbol: "£" },
  { code: "JPY", nameKey: "wallet.currency.jpy", symbol: "¥" },
  { code: "KRW", nameKey: "wallet.currency.krw", symbol: "₩" },
];

const listeners = new Set<() => void>();

function emitWalletFoundationChange() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore listener errors
    }
  });
}

export function subscribeWalletFoundation(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeMoney(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

function getLocaleRegion(locale?: string) {
  const value = locale?.trim() || Intl.DateTimeFormat().resolvedOptions().locale || "";
  const normalized = value.replace(/_/g, "-");
  const parts = normalized.split("-").filter(Boolean);

  for (let i = parts.length - 1; i >= 0; i -= 1) {
    const part = parts[i];
    if (/^[A-Z]{2}$/.test(part)) return part;
    if (/^[a-z]{2}$/i.test(part) && part.length === 2) return part.toUpperCase();
  }

  return "";
}

function optionCodes(options: WalletCurrencyOption[]) {
  return options.map((option) => option.code).filter(Boolean);
}

function normalizeCurrencyCode(value: unknown, allowedCodes: string[], fallback: string) {
  const code = asString(value).trim().toUpperCase();
  if (!code) return fallback;
  return allowedCodes.includes(code) ? code : fallback;
}

const WALLET_PROVIDER_STATUSES: WalletProviderStatus[] = [
  "provider_not_configured",
  "kyc_required",
  "review_required",
  "restricted",
  "ready",
];

function normalizeWalletProviderStatus(
  value: unknown,
  fallback: WalletProviderStatus = "provider_not_configured",
): WalletProviderStatus {
  const status = asString(value).trim() as WalletProviderStatus;
  return WALLET_PROVIDER_STATUSES.includes(status) ? status : fallback;
}

export function isWalletProviderReady(status?: WalletProviderStatus | null) {
  return status === "ready";
}

const WALLET_COMPLIANCE_STATUSES: WalletComplianceStatus[] = [
  "clear",
  "kyc_required",
  "aml_review",
  "admin_review",
  "safe_hold",
  "restricted",
  "blocked",
];

const WALLET_KYC_STATUSES: WalletKycStatus[] = [
  "not_required",
  "required",
  "pending",
  "verified",
  "rejected",
];

const WALLET_AML_STATUSES: WalletAmlStatus[] = [
  "clear",
  "monitoring",
  "review_required",
  "safe_hold",
  "blocked",
];

const WALLET_ADMIN_REVIEW_STATUSES: WalletAdminReviewStatus[] = [
  "not_required",
  "pending",
  "approved",
  "rejected",
  "escalated",
];

export function normalizeWalletComplianceStatus(
  value: unknown,
  fallback: WalletComplianceStatus = "clear",
): WalletComplianceStatus {
  const status = asString(value).trim().toLowerCase() as WalletComplianceStatus;
  return WALLET_COMPLIANCE_STATUSES.includes(status) ? status : fallback;
}

export function normalizeWalletKycStatus(
  value: unknown,
  fallback: WalletKycStatus = "not_required",
): WalletKycStatus {
  const status = asString(value).trim().toLowerCase() as WalletKycStatus;
  return WALLET_KYC_STATUSES.includes(status) ? status : fallback;
}

export function normalizeWalletAmlStatus(
  value: unknown,
  fallback: WalletAmlStatus = "clear",
): WalletAmlStatus {
  const status = asString(value).trim().toLowerCase() as WalletAmlStatus;
  return WALLET_AML_STATUSES.includes(status) ? status : fallback;
}

export function normalizeWalletAdminReviewStatus(
  value: unknown,
  fallback: WalletAdminReviewStatus = "not_required",
): WalletAdminReviewStatus {
  const status = asString(value).trim().toLowerCase() as WalletAdminReviewStatus;
  return WALLET_ADMIN_REVIEW_STATUSES.includes(status) ? status : fallback;
}

export function isWalletComplianceClear(snapshot?: Partial<WalletFoundationSnapshot> | null) {
  return (
    normalizeWalletComplianceStatus(snapshot?.complianceStatus) === "clear" &&
    normalizeWalletKycStatus(snapshot?.kycStatus) !== "required" &&
    normalizeWalletKycStatus(snapshot?.kycStatus) !== "pending" &&
    normalizeWalletKycStatus(snapshot?.kycStatus) !== "rejected" &&
    normalizeWalletAmlStatus(snapshot?.amlStatus) !== "review_required" &&
    normalizeWalletAmlStatus(snapshot?.amlStatus) !== "safe_hold" &&
    normalizeWalletAmlStatus(snapshot?.amlStatus) !== "blocked" &&
    normalizeWalletAdminReviewStatus(snapshot?.adminReviewStatus) !== "pending" &&
    normalizeWalletAdminReviewStatus(snapshot?.adminReviewStatus) !== "escalated"
  );
}

export function isWalletVirtualCardProviderLaunchConfigured() {
  // The live issuer-provider SDK/iFrame/API launch route must be connected by backend/admin.
  // Keep false until the real bank/issuer provider route exists; never simulate card issuing.
  return false;
}

export function createWalletVirtualCardIssueRequestDraft(params: {
  status: WalletProviderStatus;
  currencyCode: string;
  monthlyLimit: number;
  useCase: WalletVirtualCardUseCase;
  frozen: boolean;
  allowOnline: boolean;
  allowInternational: boolean;
}): WalletVirtualCardIssueRequestDraft {
  return {
    providerStatus: normalizeWalletProviderStatus(params.status),
    currencyCode: sanitizeProviderText(params.currencyCode, 12).toUpperCase(),
    monthlyLimit: normalizeMoney(params.monthlyLimit),
    useCase: params.useCase,
    controls: {
      frozen: Boolean(params.frozen),
      allowOnline: Boolean(params.allowOnline),
      allowInternational: Boolean(params.allowInternational),
    },
    requestedAt: new Date().toISOString(),
  };
}

export function getWalletVirtualCardIssuingReadiness(
  snapshot?: Partial<WalletFoundationSnapshot> | null,
  request?: Partial<{
    currencyCode: string;
    monthlyLimit: number;
    useCase: WalletVirtualCardUseCase;
    frozen: boolean;
    allowOnline: boolean;
    allowInternational: boolean;
  }> | null,
): WalletVirtualCardIssuingReadiness {
  const status = normalizeWalletProviderStatus(snapshot?.virtualCardProviderStatus);

  if (status !== "ready") {
    return {
      status,
      canRequest: false,
      reason: status,
    };
  }

  const currencyCode = sanitizeProviderText(
    request?.currencyCode || getWalletInternationalCurrencyCode(snapshot),
    12,
  ).toUpperCase();

  if (!currencyCode) {
    return {
      status,
      canRequest: false,
      reason: "currency_not_configured",
    };
  }

  const monthlyLimit = normalizeMoney(Number(request?.monthlyLimit || 0));
  if (!Number.isFinite(monthlyLimit)) {
    return {
      status,
      canRequest: false,
      reason: "limit_invalid",
    };
  }

  if (!isWalletVirtualCardProviderLaunchConfigured()) {
    return {
      status,
      canRequest: false,
      reason: "provider_launch_not_configured",
    };
  }

  return {
    status,
    canRequest: true,
    reason: "ready",
  };
}

const WALLET_CARD_PROVIDER_TOKEN_STATUSES: WalletCardProviderTokenStatus[] = [
  "missing",
  "pending",
  "verified",
  "rejected",
  "restricted",
];

const WALLET_FORBIDDEN_CARD_DATA_KEYS = [
  "pan",
  "primaryaccountnumber",
  "cardnumber",
  "number",
  "cvv",
  "cvc",
  "securitycode",
  "expiry",
  "expiration",
] as const;

function normalizeWalletFundingRole(value: unknown): WalletFundingRole {
  const role = asString(value).trim().toLowerCase();
  if (role === "business" || role === "merchant") return role;
  return "personal";
}

export function normalizeWalletCardRouteCategory(value: unknown): WalletCardRouteCategory {
  const category = asString(value).trim().toLowerCase();
  if (category === "international" || category === "international_card") return "international";
  if (
    category === "local_global" ||
    category === "local-global" ||
    category === "localglobal" ||
    category === "local_global_card"
  ) {
    return "local_global";
  }
  if (category === "virtual" || category === "virtual_card") return "virtual";
  return "local";
}

export function normalizeWalletCardProviderTokenStatus(
  value: unknown,
  fallback: WalletCardProviderTokenStatus = "missing",
): WalletCardProviderTokenStatus {
  const status = asString(value).trim().toLowerCase() as WalletCardProviderTokenStatus;
  return WALLET_CARD_PROVIDER_TOKEN_STATUSES.includes(status) ? status : fallback;
}

function sanitizeMaskedCard(value: unknown) {
  const text = asString(value).trim();
  if (!text) return "";
  const digits = text.replace(/\D/g, "");
  if (digits.length >= 12 && !/[•*xX]/.test(text)) return "";
  return text.slice(0, 32);
}

function sanitizeProviderText(value: unknown, maxLength = 96) {
  return asString(value).trim().slice(0, maxLength);
}

function collectForbiddenCardFields(value: unknown, path: string[] = []): string[] {
  if (!isObject(value) && !Array.isArray(value)) return [];

  const blocked: string[] = [];

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      blocked.push(...collectForbiddenCardFields(item, [...path, String(index)]));
    });
    return blocked;
  }

  Object.entries(value).forEach(([key, nestedValue]) => {
    const normalizedKey = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
    const nextPath = [...path, key];

    if (
      WALLET_FORBIDDEN_CARD_DATA_KEYS.some((forbidden) =>
        normalizedKey.includes(forbidden),
      )
    ) {
      blocked.push(nextPath.join("."));
    }

    blocked.push(...collectForbiddenCardFields(nestedValue, nextPath));
  });

  return blocked;
}

export function walletPayloadContainsForbiddenCardData(value: unknown) {
  return collectForbiddenCardFields(value).length > 0;
}

export function sanitizeWalletCardBindingProviderPayload(
  value: unknown,
): WalletCardBindingSanitizationResult {
  const input = isObject(value) ? value : {};
  const blockedFields = collectForbiddenCardFields(input);
  const providerStatus = normalizeWalletCardProviderTokenStatus(input.providerStatus);
  const providerTokenId = sanitizeProviderText(input.providerTokenId, 160);
  const providerId = sanitizeProviderText(input.providerId, 80);
  const cardCategory = normalizeWalletCardRouteCategory(input.cardCategory);
  const maskedCard = sanitizeMaskedCard(input.maskedCard);

  const payload: WalletCardBindingProviderPayload = {
    providerId,
    providerTokenId,
    maskedCard,
    cardCategory,
    providerStatus,
    ownerRole: normalizeWalletFundingRole(input.ownerRole),
    routeCurrencyCode: sanitizeProviderText(input.routeCurrencyCode, 12).toUpperCase(),
    cardBrand: sanitizeProviderText(input.cardBrand, 40) || null,
    network: sanitizeProviderText(input.network, 40) || null,
    providerReference: sanitizeProviderText(input.providerReference, 120) || null,
    tokenCreatedAt: sanitizeProviderText(input.tokenCreatedAt, 40) || null,
  };

  if (blockedFields.length > 0) {
    return {
      payload,
      isValid: false,
      blockedFields,
      reason: "raw_card_data_blocked",
    };
  }

  if (!providerId || !providerTokenId) {
    return {
      payload,
      isValid: false,
      blockedFields,
      reason: "missing_provider_token",
    };
  }

  if (providerStatus !== "verified") {
    return {
      payload,
      isValid: false,
      blockedFields,
      reason: "provider_not_verified",
    };
  }

  return {
    payload,
    isValid: true,
    blockedFields,
    reason: "ok",
  };
}

export function detectLocalCurrencyCode(_locale?: string) {
  // Currency must not be guessed from app language or country labels.
  // Local currency is selected in Wallet Settings or provided by a real bank/provider card route.
  return "";
}

function getDefaultSnapshot(): WalletFoundationSnapshot {
  return {
    mainBalanceUsd: 0,
    localBalance: 0,
    localCurrencyCode: "",
    primaryCurrencyCode: WALLET_DEFAULT_PRIMARY_CURRENCY_CODE,
    internationalCurrencyCode: WALLET_DEFAULT_INTERNATIONAL_CURRENCY_CODE,
    bankProviderStatus: "provider_not_configured",
    cardProviderStatus: "provider_not_configured",
    virtualCardProviderStatus: "provider_not_configured",
    merchantProviderStatus: "provider_not_configured",
    businessProviderStatus: "provider_not_configured",
    coinProviderStatus: "provider_not_configured",
    cryptoProviderStatus: "provider_not_configured",
    complianceStatus: "clear",
    kycStatus: "not_required",
    amlStatus: "clear",
    adminReviewStatus: "not_required",
    safeHoldReason: "",
    restrictedReason: "",
    coinBalance: 0,
    cryptoBalanceUsd: 0,
    updatedAt: new Date().toISOString(),
  };
}

function parseWalletFoundationSnapshot(raw: string | null | undefined) {
  const fallback = getDefaultSnapshot();
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);

    if (!isObject(parsed)) return fallback;

    const primaryCurrencyCode = normalizeCurrencyCode(
      parsed.primaryCurrencyCode,
      optionCodes(WALLET_PRIMARY_CURRENCY_OPTIONS),
      fallback.primaryCurrencyCode,
    );
    const localCurrencyCode = normalizeCurrencyCode(
      parsed.localCurrencyCode,
      optionCodes(WALLET_LOCAL_CURRENCY_OPTIONS),
      fallback.localCurrencyCode,
    );
    const internationalCurrencyCode = normalizeCurrencyCode(
      parsed.internationalCurrencyCode,
      optionCodes(WALLET_INTERNATIONAL_CURRENCY_OPTIONS),
      fallback.internationalCurrencyCode,
    );

    return {
      mainBalanceUsd: normalizeMoney(asNumber(parsed.mainBalanceUsd)),
      localBalance: normalizeMoney(asNumber(parsed.localBalance)),
      localCurrencyCode,
      primaryCurrencyCode,
      internationalCurrencyCode,
      bankProviderStatus: normalizeWalletProviderStatus(parsed.bankProviderStatus, fallback.bankProviderStatus),
      cardProviderStatus: normalizeWalletProviderStatus(parsed.cardProviderStatus, fallback.cardProviderStatus),
      virtualCardProviderStatus: normalizeWalletProviderStatus(
        parsed.virtualCardProviderStatus,
        fallback.virtualCardProviderStatus,
      ),
      merchantProviderStatus: normalizeWalletProviderStatus(
        parsed.merchantProviderStatus,
        fallback.merchantProviderStatus,
      ),
      businessProviderStatus: normalizeWalletProviderStatus(
        parsed.businessProviderStatus,
        fallback.businessProviderStatus,
      ),
      coinProviderStatus: normalizeWalletProviderStatus(parsed.coinProviderStatus, fallback.coinProviderStatus),
      cryptoProviderStatus: normalizeWalletProviderStatus(
        parsed.cryptoProviderStatus,
        fallback.cryptoProviderStatus,
      ),
      complianceStatus: normalizeWalletComplianceStatus(
        parsed.complianceStatus,
        fallback.complianceStatus,
      ),
      kycStatus: normalizeWalletKycStatus(parsed.kycStatus, fallback.kycStatus),
      amlStatus: normalizeWalletAmlStatus(parsed.amlStatus, fallback.amlStatus),
      adminReviewStatus: normalizeWalletAdminReviewStatus(
        parsed.adminReviewStatus,
        fallback.adminReviewStatus,
      ),
      safeHoldReason: sanitizeProviderText(parsed.safeHoldReason, 180),
      restrictedReason: sanitizeProviderText(parsed.restrictedReason, 180),
      coinBalance: normalizeMoney(asNumber(parsed.coinBalance)),
      cryptoBalanceUsd: normalizeMoney(asNumber(parsed.cryptoBalanceUsd)),
      updatedAt: asString(parsed.updatedAt) || fallback.updatedAt,
    };
  } catch {
    return fallback;
  }
}

export async function getWalletFoundationSnapshot(): Promise<WalletFoundationSnapshot> {
  const raw = await Promise.resolve(appStorage.getString(WALLET_FOUNDATION_STORAGE_KEY));
  return parseWalletFoundationSnapshot(raw);
}

export async function saveWalletFoundationSnapshot(
  update: WalletFoundationUpdate,
): Promise<WalletFoundationSnapshot> {
  const current = await getWalletFoundationSnapshot();

  const next: WalletFoundationSnapshot = {
    ...current,
    mainBalanceUsd:
      update.mainBalanceUsd === undefined
        ? current.mainBalanceUsd
        : normalizeMoney(update.mainBalanceUsd),
    localBalance:
      update.localBalance === undefined
        ? current.localBalance
        : normalizeMoney(update.localBalance),
    localCurrencyCode:
      update.localCurrencyCode === undefined
        ? current.localCurrencyCode
        : normalizeCurrencyCode(
            update.localCurrencyCode,
            optionCodes(WALLET_LOCAL_CURRENCY_OPTIONS),
            "",
          ),
    primaryCurrencyCode:
      update.primaryCurrencyCode === undefined
        ? current.primaryCurrencyCode
        : normalizeCurrencyCode(
            update.primaryCurrencyCode,
            optionCodes(WALLET_PRIMARY_CURRENCY_OPTIONS),
            WALLET_DEFAULT_PRIMARY_CURRENCY_CODE,
          ),
    internationalCurrencyCode:
      update.internationalCurrencyCode === undefined
        ? current.internationalCurrencyCode
        : normalizeCurrencyCode(
            update.internationalCurrencyCode,
            optionCodes(WALLET_INTERNATIONAL_CURRENCY_OPTIONS),
            WALLET_DEFAULT_INTERNATIONAL_CURRENCY_CODE,
          ),
    bankProviderStatus:
      update.bankProviderStatus === undefined
        ? current.bankProviderStatus
        : normalizeWalletProviderStatus(update.bankProviderStatus, current.bankProviderStatus),
    cardProviderStatus:
      update.cardProviderStatus === undefined
        ? current.cardProviderStatus
        : normalizeWalletProviderStatus(update.cardProviderStatus, current.cardProviderStatus),
    virtualCardProviderStatus:
      update.virtualCardProviderStatus === undefined
        ? current.virtualCardProviderStatus
        : normalizeWalletProviderStatus(
            update.virtualCardProviderStatus,
            current.virtualCardProviderStatus,
          ),
    merchantProviderStatus:
      update.merchantProviderStatus === undefined
        ? current.merchantProviderStatus
        : normalizeWalletProviderStatus(
            update.merchantProviderStatus,
            current.merchantProviderStatus,
          ),
    businessProviderStatus:
      update.businessProviderStatus === undefined
        ? current.businessProviderStatus
        : normalizeWalletProviderStatus(
            update.businessProviderStatus,
            current.businessProviderStatus,
          ),
    coinProviderStatus:
      update.coinProviderStatus === undefined
        ? current.coinProviderStatus
        : normalizeWalletProviderStatus(update.coinProviderStatus, current.coinProviderStatus),
    cryptoProviderStatus:
      update.cryptoProviderStatus === undefined
        ? current.cryptoProviderStatus
        : normalizeWalletProviderStatus(update.cryptoProviderStatus, current.cryptoProviderStatus),
    complianceStatus:
      update.complianceStatus === undefined
        ? current.complianceStatus
        : normalizeWalletComplianceStatus(update.complianceStatus, current.complianceStatus),
    kycStatus:
      update.kycStatus === undefined
        ? current.kycStatus
        : normalizeWalletKycStatus(update.kycStatus, current.kycStatus),
    amlStatus:
      update.amlStatus === undefined
        ? current.amlStatus
        : normalizeWalletAmlStatus(update.amlStatus, current.amlStatus),
    adminReviewStatus:
      update.adminReviewStatus === undefined
        ? current.adminReviewStatus
        : normalizeWalletAdminReviewStatus(update.adminReviewStatus, current.adminReviewStatus),
    safeHoldReason:
      update.safeHoldReason === undefined
        ? current.safeHoldReason
        : sanitizeProviderText(update.safeHoldReason, 180),
    restrictedReason:
      update.restrictedReason === undefined
        ? current.restrictedReason
        : sanitizeProviderText(update.restrictedReason, 180),
    coinBalance:
      update.coinBalance === undefined ? current.coinBalance : normalizeMoney(update.coinBalance),
    cryptoBalanceUsd:
      update.cryptoBalanceUsd === undefined
        ? current.cryptoBalanceUsd
        : normalizeMoney(update.cryptoBalanceUsd),
    updatedAt: new Date().toISOString(),
  };

  await Promise.resolve(appStorage.setString(WALLET_FOUNDATION_STORAGE_KEY, JSON.stringify(next)));

  emitWalletFoundationChange();
  return next;
}

export async function saveWalletCurrencyPreferences(params: {
  primaryCurrencyCode?: string;
  localCurrencyCode?: string;
  internationalCurrencyCode?: string;
}) {
  return saveWalletFoundationSnapshot({
    primaryCurrencyCode: params.primaryCurrencyCode,
    localCurrencyCode: params.localCurrencyCode,
    internationalCurrencyCode: params.internationalCurrencyCode,
  });
}

export async function saveWalletComplianceState(params: {
  complianceStatus?: WalletComplianceStatus;
  kycStatus?: WalletKycStatus;
  amlStatus?: WalletAmlStatus;
  adminReviewStatus?: WalletAdminReviewStatus;
  safeHoldReason?: string;
  restrictedReason?: string;
}) {
  return saveWalletFoundationSnapshot({
    complianceStatus: params.complianceStatus,
    kycStatus: params.kycStatus,
    amlStatus: params.amlStatus,
    adminReviewStatus: params.adminReviewStatus,
    safeHoldReason: params.safeHoldReason,
    restrictedReason: params.restrictedReason,
  });
}

export async function resetWalletFoundationSnapshot() {
  const next = getDefaultSnapshot();

  await Promise.resolve(appStorage.setString(WALLET_FOUNDATION_STORAGE_KEY, JSON.stringify(next)));

  emitWalletFoundationChange();
  return next;
}

export async function applyWalletCredit(params: {
  kind: WalletBalanceKind;
  amount: number;
  localCurrencyCode?: string;
}) {
  const current = await getWalletFoundationSnapshot();
  const amount = normalizeMoney(params.amount);

  switch (params.kind) {
    case "main":
      return saveWalletFoundationSnapshot({
        mainBalanceUsd: current.mainBalanceUsd + amount,
      });

    case "local":
      return saveWalletFoundationSnapshot({
        localBalance: current.localBalance + amount,
        localCurrencyCode: params.localCurrencyCode || current.localCurrencyCode,
      });

    case "coin":
      return saveWalletFoundationSnapshot({
        coinBalance: current.coinBalance + amount,
      });

    case "crypto":
      throw new Error("wallet_crypto_local_balance_mutation_blocked:provider_required");
  }
}

export async function applyWalletDebit(params: {
  kind: WalletBalanceKind;
  amount: number;
  localCurrencyCode?: string;
}) {
  const current = await getWalletFoundationSnapshot();
  const amount = normalizeMoney(params.amount);

  switch (params.kind) {
    case "main":
      return saveWalletFoundationSnapshot({
        mainBalanceUsd: Math.max(0, current.mainBalanceUsd - amount),
      });

    case "local":
      return saveWalletFoundationSnapshot({
        localBalance: Math.max(0, current.localBalance - amount),
        localCurrencyCode: params.localCurrencyCode || current.localCurrencyCode,
      });

    case "coin":
      return saveWalletFoundationSnapshot({
        coinBalance: Math.max(0, current.coinBalance - amount),
      });

    case "crypto":
      throw new Error("wallet_crypto_local_balance_mutation_blocked:provider_required");
  }
}

export function getWalletPrimaryCurrencyCode(snapshot?: Partial<WalletFoundationSnapshot> | null) {
  return normalizeCurrencyCode(
    snapshot?.primaryCurrencyCode,
    optionCodes(WALLET_PRIMARY_CURRENCY_OPTIONS),
    WALLET_DEFAULT_PRIMARY_CURRENCY_CODE,
  );
}

export function getWalletInternationalCurrencyCode(snapshot?: Partial<WalletFoundationSnapshot> | null) {
  return normalizeCurrencyCode(
    snapshot?.internationalCurrencyCode,
    optionCodes(WALLET_INTERNATIONAL_CURRENCY_OPTIONS),
    WALLET_DEFAULT_INTERNATIONAL_CURRENCY_CODE,
  );
}

export function getWalletLocalCurrencyCode(snapshot?: Partial<WalletFoundationSnapshot> | null) {
  return normalizeCurrencyCode(
    snapshot?.localCurrencyCode,
    optionCodes(WALLET_LOCAL_CURRENCY_OPTIONS),
    "",
  );
}

export function getWalletQrCurrencyCodeForSurface(
  surface?: string | null,
  snapshot?: Partial<WalletFoundationSnapshot> | null,
) {
  if (surface === "coin_wallet") return "COIN";
  if (surface === "crypto_wallet") return "";
  if (surface === "school_attendance" || surface === "work_attendance") return "";
  if (surface === "profile" || surface === "messenger") {
    return getWalletPrimaryCurrencyCode(snapshot);
  }
  if (surface === "wallet" || surface === "merchant" || surface === "business" || surface === "marketplace" || surface === "stream" || surface === "taxi" || surface === "delivery" || surface === "virtual_card") {
    return getWalletPrimaryCurrencyCode(snapshot);
  }
  return getWalletPrimaryCurrencyCode(snapshot);
}

export function getWalletCardRouteCurrencyCode(
  category: WalletCardRouteCategory,
  snapshot?: Partial<WalletFoundationSnapshot> | null,
) {
  if (category === "local") return getWalletLocalCurrencyCode(snapshot);
  if (category === "international") return getWalletInternationalCurrencyCode(snapshot);
  if (category === "virtual") return getWalletInternationalCurrencyCode(snapshot);

  const localCurrencyCode = getWalletLocalCurrencyCode(snapshot);
  return localCurrencyCode || getWalletInternationalCurrencyCode(snapshot);
}

export function isWalletLocalCurrencyConfigured(
  snapshot?: Partial<WalletFoundationSnapshot> | null,
) {
  return Boolean(getWalletLocalCurrencyCode(snapshot));
}

export function getWalletCurrencySymbol(currencyCode?: string) {
  const code = String(currencyCode || "").trim().toUpperCase();
  const option = [
    ...WALLET_PRIMARY_CURRENCY_OPTIONS,
    ...WALLET_LOCAL_CURRENCY_OPTIONS,
    ...WALLET_INTERNATIONAL_CURRENCY_OPTIONS,
  ].find((item) => item.code === code);

  return option?.symbol || code;
}

export function formatWalletCurrencyAmount(amount: number, currencyCode?: string) {
  const normalizedAmount = normalizeMoney(amount);
  const code = String(currencyCode || WALLET_DEFAULT_PRIMARY_CURRENCY_CODE).trim().toUpperCase() || WALLET_DEFAULT_PRIMARY_CURRENCY_CODE;

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(normalizedAmount);
  } catch {
    const symbol = getWalletCurrencySymbol(code);
    return `${symbol} ${normalizedAmount.toFixed(2)}`.trim();
  }
}

export function formatUsdWalletAmount(amount: number) {
  return formatWalletCurrencyAmount(amount, WALLET_DEFAULT_PRIMARY_CURRENCY_CODE);
}

export function formatPrimaryWalletAmount(amount: number, primaryCurrencyCode?: string) {
  return formatWalletCurrencyAmount(amount, primaryCurrencyCode || WALLET_DEFAULT_PRIMARY_CURRENCY_CODE);
}

export function formatLocalWalletAmount(amount: number, currencyCode?: string) {
  const normalizedAmount = normalizeMoney(amount);
  const code = String(currencyCode || "").trim().toUpperCase();

  if (!code) {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(normalizedAmount);
  }

  return formatWalletCurrencyAmount(normalizedAmount, code);
}

export function formatCoinWalletAmount(amount: number) {
  return `${normalizeMoney(amount).toFixed(2)} COIN`;
}

export function useWalletFoundation() {
  const [snapshot, setSnapshot] = useState<WalletFoundationSnapshot>(getDefaultSnapshot());
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const next = await getWalletFoundationSnapshot();
      setSnapshot(next);
      return next;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    return subscribeWalletFoundation(() => {
      void reload();
    });
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const detectedLocalCurrencyCode = useMemo(() => {
    return snapshot.localCurrencyCode;
  }, [snapshot.localCurrencyCode]);

  return {
    snapshot,
    loading,
    reload,
    detectedLocalCurrencyCode,
  };
}
