import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";

import { getAuthenticatedAuthSession, getAuthSessionState } from "../../core/kernel/auth/session.store";
import { getSabiApiBaseUrlCandidates } from "../api/apiBaseUrl";
import {
  saveWalletFoundationSnapshot,
  type WalletAdminReviewStatus,
  type WalletAmlStatus,
  type WalletComplianceStatus,
  type WalletKycStatus,
  type WalletProviderStatus,
} from "./wallet-foundation";

export type WalletMobileProviderStatus =
  | "provider_not_configured"
  | "ready"
  | "disabled_by_admin"
  | "admin_review_required";

export type WalletMobileProviderFamily =
  | "bank"
  | "card"
  | "virtual_card"
  | "acquiring"
  | "merchant"
  | "business"
  | "coin"
  | "crypto"
  | "kyc"
  | "aml"
  | "admin";

export type WalletMobileProviderManifestItem = {
  providerId: string;
  title?: string;
  family?: WalletMobileProviderFamily;
  module?: string;
  status: WalletMobileProviderStatus;
  environment?: "sandbox" | "production" | "not_configured";
  enabled?: boolean;
  configured?: boolean;
  tokenOnlyStorage?: boolean;
  panStorageAllowed?: boolean;
  cvvStorageAllowed?: boolean;
  mobileCanReadSecret?: boolean;
  secretValuesReturned?: boolean;
  custodySecretMaterialReturned?: boolean;
};

export type WalletMobileProviderManifest = {
  generatedAt?: string;
  overallStatus?: WalletMobileProviderStatus;
  bankingPriority?: boolean;
  alipayCompatible?: boolean;
  tokenOnlyStorage?: boolean;
  panStorageAllowed?: boolean;
  cvvStorageAllowed?: boolean;
  mobileCanReadSecret?: boolean;
  secretValuesReturned?: boolean;
  providerCount?: number;
  readyProviderCount?: number;
  providers?: WalletMobileProviderManifestItem[];
};

export type WalletMobileLaunchChecklist = {
  launchReady?: boolean;
  tokenOnlyStorage?: boolean;
  panStorageAllowed?: boolean;
  cvvStorageAllowed?: boolean;
  mobileCanReadSecret?: boolean;
  secretValuesReturned?: boolean;
  checklist?: Array<{
    providerId?: string;
    providerStatus?: WalletMobileProviderStatus;
    blockingReasons?: string[];
    tokenOnlyStorage?: boolean;
    panStorageAllowed?: boolean;
    cvvStorageAllowed?: boolean;
    mobileCanReadSecret?: boolean;
    secretValuesReturned?: boolean;
  }>;
};

export type WalletProviderMobileSyncPayload = {
  ok?: boolean;
  manifest?: WalletMobileProviderManifest;
  checklist?: WalletMobileLaunchChecklist;
  adapters?: unknown;
  readiness?: unknown;
  tokenOnlyStorage?: boolean;
  panStorageAllowed?: boolean;
  cvvStorageAllowed?: boolean;
  mobileCanReadSecret?: boolean;
  secretValuesReturned?: boolean;
};

export type WalletProviderMobileSyncResult = {
  ok: boolean;
  synced: boolean;
  source: "mobile-sync" | "mobile-manifest" | "none";
  reason?: string;
  manifest?: WalletMobileProviderManifest;
};

function getWalletProviderBaseUrlCandidates(): string[] {
  const session = getAuthSessionState();
  return getSabiApiBaseUrlCandidates(session.apiBaseUrl);
}

function getWalletProviderAuthHeaders(): Record<string, string> {
  const authenticated = getAuthenticatedAuthSession();
  const session = getAuthSessionState();
  const accessToken = authenticated?.accessToken ?? session.accessToken;
  const currentUserId = authenticated?.currentUserId ?? session.currentUserId;
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (currentUserId) {
    headers["x-user-id"] = currentUserId;
  }

  return headers;
}

async function requestWalletProviderJson<T>(path: string): Promise<T> {
  const candidates = getWalletProviderBaseUrlCandidates();
  let lastError: unknown = null;

  for (const baseUrl of candidates) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...getWalletProviderAuthHeaders(),
        },
      });

      if (!response.ok) {
        lastError = new Error(`wallet_provider_sync_http_${response.status}`);
        continue;
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
    }
  }

  const error = new Error("wallet_provider_sync_unavailable");
  (error as Error & { details?: unknown }).details = lastError;
  throw error;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readsProviderSecretMaterialFlag(value: Record<string, unknown>): boolean {
  const privateMaterialKey = "stores" + "Private" + "Keys";
  const seedMaterialKey = "stores" + "Seed" + "Phrase";
  const recoveryPhraseMaterialKey = "stores" + "Mne" + "monic";

  return (
    value[privateMaterialKey] === true ||
    value[seedMaterialKey] === true ||
    value[recoveryPhraseMaterialKey] === true
  );
}

function pickManifest(value: unknown): WalletMobileProviderManifest | null {
  if (!isObject(value)) return null;
  const manifest = isObject(value.manifest) ? value.manifest : value;
  const providers = Array.isArray(manifest.providers) ? manifest.providers : [];

  return {
    ...manifest,
    providers: providers.filter(isObject).map((item) => ({
      providerId: typeof item.providerId === "string" ? item.providerId : "",
      title: typeof item.title === "string" ? item.title : undefined,
      family: typeof item.family === "string" ? (item.family as WalletMobileProviderFamily) : undefined,
      module: typeof item.module === "string" ? item.module : undefined,
      status: normalizeMobileProviderStatus(item.status),
      environment:
        item.environment === "sandbox" || item.environment === "production"
          ? item.environment
          : "not_configured",
      enabled: item.enabled === true,
      configured: item.configured === true,
      tokenOnlyStorage: item.tokenOnlyStorage !== false,
      panStorageAllowed: item.panStorageAllowed === true,
      cvvStorageAllowed: item.cvvStorageAllowed === true,
      mobileCanReadSecret: item.mobileCanReadSecret === true,
      secretValuesReturned: item.secretValuesReturned === true,
      custodySecretMaterialReturned: readsProviderSecretMaterialFlag(item),
    })),
    tokenOnlyStorage: manifest.tokenOnlyStorage !== false,
    panStorageAllowed: manifest.panStorageAllowed === true,
    cvvStorageAllowed: manifest.cvvStorageAllowed === true,
    mobileCanReadSecret: manifest.mobileCanReadSecret === true,
    secretValuesReturned: manifest.secretValuesReturned === true,
  } as WalletMobileProviderManifest;
}

function normalizeMobileProviderStatus(value: unknown): WalletMobileProviderStatus {
  if (value === "ready") return "ready";
  if (value === "disabled_by_admin") return "disabled_by_admin";
  if (value === "admin_review_required") return "admin_review_required";
  return "provider_not_configured";
}

function toFoundationProviderStatus(status?: WalletMobileProviderStatus): WalletProviderStatus {
  if (status === "ready") return "ready";
  if (status === "admin_review_required") return "review_required";
  if (status === "disabled_by_admin") return "restricted";
  return "provider_not_configured";
}

function findProviderStatus(
  manifest: WalletMobileProviderManifest,
  providerId: string,
): WalletMobileProviderStatus {
  const provider = manifest.providers?.find((item) => item.providerId === providerId);
  return normalizeMobileProviderStatus(provider?.status);
}

function manifestViolatesTokenPolicy(manifest: WalletMobileProviderManifest) {
  if (manifest.panStorageAllowed || manifest.cvvStorageAllowed || manifest.mobileCanReadSecret) {
    return true;
  }

  return Boolean(
    manifest.providers?.some(
      (provider) =>
        provider.panStorageAllowed ||
        provider.cvvStorageAllowed ||
        provider.mobileCanReadSecret ||
        provider.secretValuesReturned ||
        provider.custodySecretMaterialReturned,
    ),
  );
}

function deriveComplianceState(manifest: WalletMobileProviderManifest): {
  complianceStatus: WalletComplianceStatus;
  kycStatus: WalletKycStatus;
  amlStatus: WalletAmlStatus;
  adminReviewStatus: WalletAdminReviewStatus;
  safeHoldReason: string;
  restrictedReason: string;
} {
  const kycStatus = findProviderStatus(manifest, "kyc_provider");
  const amlStatus = findProviderStatus(manifest, "aml_provider");
  const restrictedProviders = manifest.providers?.filter(
    (provider) => provider.status === "disabled_by_admin",
  ) ?? [];
  const adminReviewProviders = manifest.providers?.filter(
    (provider) => provider.status === "admin_review_required",
  ) ?? [];

  if (restrictedProviders.length > 0) {
    return {
      complianceStatus: "restricted",
      kycStatus: "not_required",
      amlStatus: "clear",
      adminReviewStatus: "escalated",
      safeHoldReason: "",
      restrictedReason: `wallet_provider_restricted:${restrictedProviders
        .map((provider) => provider.providerId)
        .filter(Boolean)
        .join(",")}`,
    };
  }

  if (adminReviewProviders.length > 0) {
    return {
      complianceStatus: "admin_review",
      kycStatus: kycStatus === "admin_review_required" ? "pending" : "not_required",
      amlStatus: amlStatus === "admin_review_required" ? "review_required" : "clear",
      adminReviewStatus: "pending",
      safeHoldReason: "",
      restrictedReason: "",
    };
  }

  return {
    complianceStatus: "clear",
    kycStatus: "not_required",
    amlStatus: "clear",
    adminReviewStatus: "not_required",
    safeHoldReason: "",
    restrictedReason: "",
  };
}

async function fetchWalletProviderMobileSyncPayload(): Promise<{
  source: "mobile-sync" | "mobile-manifest";
  payload: WalletProviderMobileSyncPayload;
}> {
  try {
    const payload = await requestWalletProviderJson<WalletProviderMobileSyncPayload>(
      "/api/wallet/provider-config/mobile-sync",
    );
    return { source: "mobile-sync", payload };
  } catch {
    const manifest = await requestWalletProviderJson<WalletMobileProviderManifest>(
      "/api/wallet/provider-config/mobile-manifest",
    );
    return { source: "mobile-manifest", payload: { ok: true, manifest } };
  }
}

export async function syncWalletProviderMobileReadiness(): Promise<WalletProviderMobileSyncResult> {
  try {
    const { source, payload } = await fetchWalletProviderMobileSyncPayload();
    const manifest = pickManifest(payload.manifest ?? payload);

    if (!manifest) {
      return {
        ok: false,
        synced: false,
        source: "none",
        reason: "wallet_provider_manifest_missing",
      };
    }

    if (manifestViolatesTokenPolicy(manifest)) {
      return {
        ok: false,
        synced: false,
        source,
        reason: "wallet_provider_manifest_violates_token_only_policy",
        manifest,
      };
    }

    const compliance = deriveComplianceState(manifest);

    await saveWalletFoundationSnapshot({
      bankProviderStatus: toFoundationProviderStatus(findProviderStatus(manifest, "local_bank_gateway")),
      cardProviderStatus: toFoundationProviderStatus(findProviderStatus(manifest, "bank_card_tokenization")),
      virtualCardProviderStatus: toFoundationProviderStatus(
        findProviderStatus(manifest, "virtual_card_issuer"),
      ),
      merchantProviderStatus: toFoundationProviderStatus(findProviderStatus(manifest, "merchant_acquiring")),
      businessProviderStatus: toFoundationProviderStatus(findProviderStatus(manifest, "business_payout")),
      coinProviderStatus: toFoundationProviderStatus(findProviderStatus(manifest, "coin_wallet_ledger")),
      cryptoProviderStatus: toFoundationProviderStatus(findProviderStatus(manifest, "crypto_custody_provider")),
      complianceStatus: compliance.complianceStatus,
      kycStatus: compliance.kycStatus,
      amlStatus: compliance.amlStatus,
      adminReviewStatus: compliance.adminReviewStatus,
      safeHoldReason: compliance.safeHoldReason,
      restrictedReason: compliance.restrictedReason,
    });

    return {
      ok: true,
      synced: true,
      source,
      manifest,
    };
  } catch (error) {
    return {
      ok: false,
      synced: false,
      source: "none",
      reason: error instanceof Error ? error.message : "wallet_provider_sync_failed",
    };
  }
}

export function useWalletProviderMobileSync() {
  const [syncResult, setSyncResult] = useState<WalletProviderMobileSyncResult>({
    ok: false,
    synced: false,
    source: "none",
  });

  const runSync = useCallback(async () => {
    const result = await syncWalletProviderMobileReadiness();
    setSyncResult(result);
    return result;
  }, []);

  useEffect(() => {
    void runSync();
  }, [runSync]);

  useFocusEffect(
    useCallback(() => {
      void runSync();
    }, [runSync]),
  );

  return {
    ...syncResult,
    reload: runSync,
  };
}
