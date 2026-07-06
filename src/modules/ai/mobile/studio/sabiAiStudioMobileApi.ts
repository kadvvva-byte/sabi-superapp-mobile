/**
 * M1 Sabi AI Studio mobile API client.
 *
 * Purpose:
 * - Mobile reads Sabi AI Studio status/capabilities from one backend foundation.
 * - No Gemini/OpenAI keys in mobile.
 * - No provider calls from mobile.
 * - No payment/wallet/payout/SMS/deploy execution.
 * - Does not touch or replace Sabi AI personality/controller.
 */

export type SabiAiStudioMobileLocks = {
  paymentExecution: boolean;
  walletExecution: boolean;
  payoutExecution: boolean;
  smsExecution: boolean;
  dbWrite: boolean;
  secretPrint: boolean;
  publishDeploy: boolean;
  fakeSuccess: boolean;
};

export type SabiAiStudioMobileHealth = {
  ok: boolean;
  service: string;
  version: string;
  publicIdentity: "sabi-ai" | string;
  providerHidden: boolean;
  mountedBasePath?: string;
  controllerBoundary?: {
    sabiAiControllerSeparated: boolean;
    studioDoesNotReplaceSabiAiPersonality: boolean;
    sabiAiControllerRole: string;
    sabiAiStudioRole: string;
    integrationRule: string;
  };
  runtime?: {
    studioRuntimeMounted: boolean;
    learningReadinessRoute: string;
    durableLearningBucketPresent: boolean;
    backendProviderProxyRequired: boolean;
    frontendSecretsAllowed: boolean;
    providerLiveMutation: boolean;
  };
  locks?: SabiAiStudioMobileLocks;
};

export type SabiAiStudioMobileCapabilities = {
  ok: boolean;
  service: string;
  version: string;
  publicIdentity: "sabi-ai" | string;
  providerHidden: boolean;
  capabilities: Record<string, unknown>;
  locks?: SabiAiStudioMobileLocks;
};

export type SabiAiStudioMobileSeparationStatus = {
  ok: boolean;
  service: string;
  version: string;
  sabiAiControllerSeparated: boolean;
  studioRuntimeMounted: boolean;
  providerHidden: boolean;
  frontendSecretsAllowed: boolean;
  backendProviderProxyRequired: boolean;
  doesNotTouchSabiAiPersonalityController: boolean;
  locks?: SabiAiStudioMobileLocks;
};

export type SabiAiStudioMobileLearningReadiness = {
  ok: boolean;
  version: string;
  publicIdentity: "sabi-ai" | string;
  providerHidden: boolean;
  durableLearningBucketPresent: boolean;
  prefix: string;
  routes: {
    write: boolean;
    read: boolean;
    list: boolean;
  };
  controlledWriteRequired: boolean;
  paymentExecution: boolean;
  walletExecution: boolean;
  payoutExecution: boolean;
  smsExecution: boolean;
  publishDeploy: boolean;
};

export type SabiAiStudioMobileSnapshot = {
  ok: boolean;
  source: "backend" | "fallback";
  baseUrl: string;
  health: SabiAiStudioMobileHealth | null;
  capabilities: SabiAiStudioMobileCapabilities | null;
  separation: SabiAiStudioMobileSeparationStatus | null;
  learning: SabiAiStudioMobileLearningReadiness | null;
  errors: string[];
};

export const SABI_AI_STUDIO_MOBILE_RULES = {
  frontendSecretsAllowed: false,
  providerCallsFromMobileAllowed: false,
  backendProviderProxyRequired: true,
  sabiAiControllerMustStaySeparated: true,
  noPaymentWalletPayoutSmsDeploy: true,
} as const;

function normalizeBaseUrl(value?: string | null): string {
  const raw = String(value || "").trim();
  if (!raw) return "https://sabi-superapp-api-7srquvexva-ew.a.run.app";
  return raw.replace(/\/+$/, "");
}

function getConfiguredBaseUrl(): string {
  const maybeGlobal = (globalThis as unknown as { SABI_API_BASE_URL?: string }).SABI_API_BASE_URL;
  return normalizeBaseUrl(maybeGlobal);
}

async function readJson<T>(baseUrl: string, path: string): Promise<T> {
  const response = await fetch(`${normalizeBaseUrl(baseUrl)}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-Sabi-Client": "mobile",
      "X-Sabi-Studio-Client": "status-readonly",
    },
  });

  if (!response.ok) {
    throw new Error(`Sabi AI Studio mobile API ${path} failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getSabiAiStudioMobileSnapshot(
  baseUrl = getConfiguredBaseUrl(),
): Promise<SabiAiStudioMobileSnapshot> {
  const normalizedBase = normalizeBaseUrl(baseUrl);
  const errors: string[] = [];

  let health: SabiAiStudioMobileHealth | null = null;
  let capabilities: SabiAiStudioMobileCapabilities | null = null;
  let separation: SabiAiStudioMobileSeparationStatus | null = null;
  let learning: SabiAiStudioMobileLearningReadiness | null = null;

  try {
    health = await readJson<SabiAiStudioMobileHealth>(normalizedBase, "/api/sabi-ai-studio/health");
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  try {
    capabilities = await readJson<SabiAiStudioMobileCapabilities>(normalizedBase, "/api/sabi-ai-studio/capabilities");
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  try {
    separation = await readJson<SabiAiStudioMobileSeparationStatus>(normalizedBase, "/api/sabi-ai-studio/separation/status");
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  try {
    learning = await readJson<SabiAiStudioMobileLearningReadiness>(normalizedBase, "/api/sabi-ai-studio/engines/268e/learning/readiness");
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  const ok = Boolean(
    health?.ok &&
      capabilities?.ok &&
      separation?.ok &&
      learning?.ok &&
      health.providerHidden === true &&
      separation.sabiAiControllerSeparated === true &&
      separation.doesNotTouchSabiAiPersonalityController === true &&
      separation.frontendSecretsAllowed === false,
  );

  return {
    ok,
    source: ok ? "backend" : "fallback",
    baseUrl: normalizedBase,
    health,
    capabilities,
    separation,
    learning,
    errors,
  };
}

