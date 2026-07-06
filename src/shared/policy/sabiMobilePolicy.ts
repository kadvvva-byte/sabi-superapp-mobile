declare const process: { env?: Record<string, string | undefined> } | undefined;

export type SabiWalletZone =
  | "LOCAL_UZ_CIS_ASIA"
  | "GLOBAL_STRIPE_UK_EEA_US"
  | "RU_RUSSIA_LOCKED_PROVIDER"
  | "BRICS_BUSINESS_PENDING"
  | "RESTRICTED_UNKNOWN";

export type SabiWalletMode =
  | "local_fiat"
  | "global_crypto"
  | "ru_local_pending"
  | "brics_business_pending"
  | "restricted";

export type SabiCardIssuerRoute =
  | "local_uzbek_bank_partner"
  | "stripe_or_bridge"
  | "russian_bank_partner_locked"
  | "brics_business_locked"
  | "none";

export type SabiMobilePolicy = {
  zone: SabiWalletZone;
  walletMode: SabiWalletMode;
  legalEntity: "UZ_ENTITY" | "SABI_AI_TECHNOLOGIES_LIMITED" | "RU_PARTNER_PENDING" | "BRICS_BUSINESS_PENDING" | "NONE";
  fiatCurrency: string;
  localWalletVisible: boolean;
  cryptoWalletVisible: boolean;
  cryptoCardVisible: boolean;
  stripeCryptoOnrampVisible: boolean;
  stripeStablecoinPaymentsVisible: boolean;
  stripeStablecoinBackedCardVisible: boolean;
  cryptoCardServiceEnabled: boolean;
  stripeIssuingVisible: boolean;
  cardIssuerRoute: SabiCardIssuerRoute;
  moneyActionsLockedUntilKyc: boolean;
  kycRequired: boolean;
  reason: string;
  enabledModules: string[];
  hiddenModules: string[];
  providerLocks: Record<string, string>;
};

export type SabiCountrySignals = {
  geoIpCountry?: string | null;
  phoneCountry?: string | null;
  kycCountry?: string | null;
  residenceCountry?: string | null;
  addressCountry?: string | null;
  accountType?: "personal" | "business";
};

const env = typeof process !== "undefined" && process?.env ? process.env : {};

const LOCAL_UZ_CIS_ASIA = new Set([
  "UZ", "KZ", "KG", "TJ", "TM", "AZ", "AM", "GE", "TR", "AE", "CN", "HK", "SG", "MY", "ID", "IN"
]);

const GLOBAL_STRIPE_POLICY_REGION = new Set([
  "GB", "US", "IE", "DE", "FR", "ES", "IT", "NL", "BE", "AT", "PT", "FI", "SE", "DK", "NO", "PL", "CZ", "EE", "LV", "LT", "LU", "MT", "CY", "SI", "SK"
]);

const RU_REGION = new Set(["RU"]);

const BRICS_COUNTRIES = new Set([
  "BR", "RU", "IN", "CN", "ZA", "EG", "ET", "IR", "AE"
]);

function normalizeCountry(value?: string | null) {
  return String(value || "").trim().toUpperCase();
}

export function resolvePhoneCountryFromCode(value?: string | null) {
  const digits = String(value || "").replace(/[^0-9+]/g, "");
  if (digits.startsWith("+998") || digits.startsWith("998")) return "UZ";
  if (digits.startsWith("+44") || digits.startsWith("44")) return "GB";
  if (digits.startsWith("+1") || digits.startsWith("1")) return "US";
  if (digits.startsWith("+7") || digits.startsWith("7")) return "RU";
  if (digits.startsWith("+86") || digits.startsWith("86")) return "CN";
  if (digits.startsWith("+971") || digits.startsWith("971")) return "AE";
  if (digits.startsWith("+90") || digits.startsWith("90")) return "TR";
  if (digits.startsWith("+91") || digits.startsWith("91")) return "IN";
  if (digits.startsWith("+77") || digits.startsWith("77")) return "KZ";
  return "";
}

export function getReviewCountrySignals(): SabiCountrySignals {
  return {
    geoIpCountry: env.EXPO_PUBLIC_REVIEW_GEO_COUNTRY || env.EXPO_PUBLIC_DEVICE_COUNTRY || "",
    phoneCountry:
      env.EXPO_PUBLIC_REVIEW_PHONE_COUNTRY ||
      resolvePhoneCountryFromCode(env.EXPO_PUBLIC_REVIEW_PHONE_NUMBER || env.EXPO_PUBLIC_REVIEW_PHONE_CODE || ""),
    kycCountry: env.EXPO_PUBLIC_REVIEW_KYC_COUNTRY || "",
    residenceCountry: env.EXPO_PUBLIC_REVIEW_RESIDENCE_COUNTRY || "",
    addressCountry: env.EXPO_PUBLIC_REVIEW_ADDRESS_COUNTRY || "",
    accountType: env.EXPO_PUBLIC_ACCOUNT_TYPE === "business" ? "business" : "personal",
  };
}

export function resolveSabiMobilePolicy(input: SabiCountrySignals = getReviewCountrySignals()): SabiMobilePolicy {
  const kyc = normalizeCountry(input.kycCountry);
  const residence = normalizeCountry(input.residenceCountry);
  const address = normalizeCountry(input.addressCountry);
  const phone = normalizeCountry(input.phoneCountry);
  const geo = normalizeCountry(input.geoIpCountry);

  const finalCountry = kyc || residence || address || phone || geo || "UZ";
  const accountType = input.accountType || "personal";

  if (accountType === "business" && BRICS_COUNTRIES.has(finalCountry)) {
    return {
      zone: "BRICS_BUSINESS_PENDING",
      walletMode: "brics_business_pending",
      legalEntity: "BRICS_BUSINESS_PENDING",
      fiatCurrency: "USD",
      localWalletVisible: false,
      cryptoWalletVisible: false,
      cryptoCardVisible: false,
      stripeCryptoOnrampVisible: false,
      stripeStablecoinPaymentsVisible: false,
      stripeStablecoinBackedCardVisible: false,
      cryptoCardServiceEnabled: false,
      stripeIssuingVisible: false,
      cardIssuerRoute: "brics_business_locked",
      moneyActionsLockedUntilKyc: true,
      kycRequired: true,
      reason: "business_kyb_required_before_brics_wallet",
      enabledModules: ["messenger", "aiAssistant", "stream", "walletPreview", "business"],
      hiddenModules: ["taxi", "marketplace", "supermarket", "courier", "stripeIssuing", "liveCryptoCard", "cryptoCard", "stripeCryptoOnramp", "stripeStablecoinBackedCard"],
      providerLocks: {
        stripe: "disabled_business_brics_pending",
        cryptoCard: "disabled_business_brics_pending",
        uzbekBank: "disabled_region",
        alipay: "disabled_until_provider_contract",
        gazprombank: "business_contract_required",
        bricsBusiness: "business_kyb_required",
      },
    };
  }

  if (RU_REGION.has(finalCountry)) {
    return {
      zone: "RU_RUSSIA_LOCKED_PROVIDER",
      walletMode: "ru_local_pending",
      legalEntity: "RU_PARTNER_PENDING",
      fiatCurrency: "RUB",
      localWalletVisible: true,
      cryptoWalletVisible: false,
      cryptoCardVisible: false,
      stripeCryptoOnrampVisible: false,
      stripeStablecoinPaymentsVisible: false,
      stripeStablecoinBackedCardVisible: false,
      cryptoCardServiceEnabled: false,
      stripeIssuingVisible: false,
      cardIssuerRoute: "russian_bank_partner_locked",
      moneyActionsLockedUntilKyc: true,
      kycRequired: true,
      reason: "russian_provider_contract_required",
      enabledModules: ["messenger", "aiAssistant", "stream", "walletPreview"],
      hiddenModules: ["stripeIssuing", "globalCryptoCard", "cryptoCard", "stripeCryptoOnramp", "stripeStablecoinBackedCard", "marketplace", "supermarket", "courier"],
      providerLocks: {
        stripe: "disabled_region",
        cryptoCard: "disabled_region",
        uzbekBank: "disabled_region",
        alipay: "disabled_region_or_contract_missing",
        gazprombank: "locked_until_contract_and_compliance",
        bricsBusiness: "business_kyb_required",
      },
    };
  }

  if (GLOBAL_STRIPE_POLICY_REGION.has(finalCountry)) {
    return {
      zone: "GLOBAL_STRIPE_UK_EEA_US",
      walletMode: "global_crypto",
      legalEntity: "SABI_AI_TECHNOLOGIES_LIMITED",
      fiatCurrency: finalCountry === "GB" ? "GBP" : finalCountry === "US" ? "USD" : "EUR",
      localWalletVisible: false,
      cryptoWalletVisible: true,
      cryptoCardVisible: true,
      stripeCryptoOnrampVisible: true,
      stripeStablecoinPaymentsVisible: true,
      stripeStablecoinBackedCardVisible: true,
      cryptoCardServiceEnabled: false,
      stripeIssuingVisible: true,
      cardIssuerRoute: "stripe_or_bridge",
      moneyActionsLockedUntilKyc: true,
      kycRequired: true,
      reason: kyc ? "kyc_verified_supported_global_region" : "pre_kyc_global_region",
      enabledModules: ["messenger", "aiAssistant", "aiStudio", "stream", "walletGlobalPreview", "cryptoWalletPreview"],
      hiddenModules: ["taxi", "localMarketplace", "supermarket", "courier", "uzbekLocalCard"],
      providerLocks: {
        stripe: "enabled_after_kyc_and_provider_approval",
        cryptoCard: "locked_until_kyc_stripe_crypto_approval_and_backend_provider_approval",
        uzbekBank: "disabled_region",
        alipay: "disabled_region",
        gazprombank: "disabled_region",
        bricsBusiness: "not_consumer_account",
      },
    };
  }

  if (LOCAL_UZ_CIS_ASIA.has(finalCountry)) {
    return {
      zone: "LOCAL_UZ_CIS_ASIA",
      walletMode: "local_fiat",
      legalEntity: "UZ_ENTITY",
      fiatCurrency: finalCountry === "UZ" ? "UZS" : "USD",
      localWalletVisible: true,
      cryptoWalletVisible: false,
      cryptoCardVisible: false,
      stripeCryptoOnrampVisible: false,
      stripeStablecoinPaymentsVisible: false,
      stripeStablecoinBackedCardVisible: false,
      cryptoCardServiceEnabled: false,
      stripeIssuingVisible: false,
      cardIssuerRoute: "local_uzbek_bank_partner",
      moneyActionsLockedUntilKyc: true,
      kycRequired: true,
      reason: kyc ? "kyc_verified_local_region" : "geo_phone_pre_kyc_local_region",
      enabledModules: ["messenger", "aiAssistant", "aiTranslate", "walletLocalPreview", "taxi", "marketplace", "supermarket", "courier", "stream"],
      hiddenModules: ["stripeIssuing", "globalCryptoCard", "cryptoCard", "stripeCryptoOnramp", "stripeStablecoinBackedCard"],
      providerLocks: {
        stripe: "disabled_region",
        cryptoCard: "disabled_region",
        uzbekBank: "enabled_after_kyc_and_partner_approval",
        alipay: "enabled_after_provider_contract",
        gazprombank: "disabled_region",
        bricsBusiness: "business_kyb_required",
      },
    };
  }

  return {
    zone: "RESTRICTED_UNKNOWN",
    walletMode: "restricted",
    legalEntity: "NONE",
    fiatCurrency: "USD",
    localWalletVisible: false,
    cryptoWalletVisible: false,
  cryptoCardVisible: false,
  stripeCryptoOnrampVisible: false,
  stripeStablecoinPaymentsVisible: false,
  stripeStablecoinBackedCardVisible: false,
  cryptoCardServiceEnabled: false,
  stripeIssuingVisible: false,
    cardIssuerRoute: "none",
    moneyActionsLockedUntilKyc: true,
    kycRequired: true,
    reason: "country_unknown_or_restricted",
    enabledModules: ["messenger", "aiAssistant", "stream", "walletPreview"],
    hiddenModules: ["taxi", "marketplace", "supermarket", "courier", "stripeIssuing", "cryptoWallet", "cryptoCard", "stripeCryptoOnramp", "stripeStablecoinBackedCard"],
    providerLocks: {
      stripe: "disabled_unknown_region",
        cryptoCard: "disabled_unknown_region",
      uzbekBank: "disabled_unknown_region",
      alipay: "disabled_unknown_region",
      gazprombank: "disabled_unknown_region",
      bricsBusiness: "business_kyb_required",
    },
  };
}

export function getSabiMobilePolicy() {
  return resolveSabiMobilePolicy();
}

export function isMiniAppKindVisibleForSabiPolicy(kind: string, policy: SabiMobilePolicy = getSabiMobilePolicy()) {
  const value = String(kind || "").trim();

  if (!value) return false;

  const localOnly = new Set(["taxi", "marketplace", "supermarket", "food_delivery", "food", "delivery", "wholesale_market", "wholesale"]);
  const globalHidden = new Set(["taxi", "marketplace", "supermarket", "food_delivery", "food", "delivery", "wholesale_market", "wholesale"]);
  const reviewHidden = new Set(["games", "events", "cast", "business", "merchant", "web"]);

  if (reviewHidden.has(value)) return false;
  if (policy.zone === "GLOBAL_STRIPE_UK_EEA_US" && globalHidden.has(value)) return false;
  if (policy.zone === "RU_RUSSIA_LOCKED_PROVIDER" && localOnly.has(value)) return false;
  if (policy.zone === "BRICS_BUSINESS_PENDING" && localOnly.has(value)) return false;
  if (policy.zone === "RESTRICTED_UNKNOWN" && localOnly.has(value)) return false;

  return true;
}

export function isHomeCryptoPanelVisibleForSabiPolicy(policy: SabiMobilePolicy = getSabiMobilePolicy()) {
  return policy.cryptoWalletVisible;
}

export function isWalletHeroBlockVisibleForSabiPolicy(id: string, policy: SabiMobilePolicy = getSabiMobilePolicy()) {
  if (id === "crypto") return policy.cryptoWalletVisible;
  if (id === "crypto-card" || id === "stablecoin-card" || id === "stripe-crypto-card") return isWalletCryptoCardVisibleForSabiPolicy(policy);
  if (id === "local-cards") return policy.localWalletVisible;
  if (id === "coin-balance") return policy.zone !== "RESTRICTED_UNKNOWN";
  if (id === "business" || id === "merchant") return policy.zone === "LOCAL_UZ_CIS_ASIA";
  return true;
}

export function isWalletQuickActionVisibleForSabiPolicy(id: string, policy: SabiMobilePolicy = getSabiMobilePolicy()) {
  if (policy.moneyActionsLockedUntilKyc && ["top-up", "withdraw"].includes(id)) return false;
  return true;
}

export function isWalletHubActionVisibleForSabiPolicy(id: string, policy: SabiMobilePolicy = getSabiMobilePolicy()) {
  if (id === "virtual-card") return policy.stripeIssuingVisible || policy.localWalletVisible || isWalletCryptoCardVisibleForSabiPolicy(policy);
  if (id === "crypto-card" || id === "stablecoin-card" || id === "stripe-crypto-card") return isWalletCryptoCardVisibleForSabiPolicy(policy);
  if (id === "cards") return policy.cardIssuerRoute !== "none";
  if (id === "business" || id === "merchant") return policy.zone === "LOCAL_UZ_CIS_ASIA";
  if (policy.moneyActionsLockedUntilKyc && ["top-up", "withdraw"].includes(id)) return false;
  return true;
}


export function isWalletCryptoCardVisibleForSabiPolicy(policy: SabiMobilePolicy = getSabiMobilePolicy()) {
  return Boolean(
    policy.zone === "GLOBAL_STRIPE_UK_EEA_US" &&
    policy.cryptoCardVisible &&
    policy.stripeCryptoOnrampVisible &&
    policy.stripeStablecoinBackedCardVisible
  );
}

export function isWalletCryptoCardServiceEnabledForSabiPolicy(policy: SabiMobilePolicy = getSabiMobilePolicy()) {
  // Never enable live execution from mobile-only policy.
  // Backend must confirm KYC/KYB, Stripe crypto approval, supported region, provider contract and Sabi AI/Owner guard.
  return Boolean(policy.cryptoCardServiceEnabled);
}

export function isStripeCryptoProviderVisibleForSabiPolicy(policy: SabiMobilePolicy = getSabiMobilePolicy()) {
  return Boolean(
    policy.zone === "GLOBAL_STRIPE_UK_EEA_US" &&
    (policy.stripeCryptoOnrampVisible || policy.stripeStablecoinPaymentsVisible || policy.stripeStablecoinBackedCardVisible)
  );
}

