export type SabiVirtualCardStatus = "pending" | "active" | "frozen" | "closed" | "expired" | "provider_review";

export type SabiVirtualCardTokenRecord = {
  id: string;
  ownerUserId: string;
  providerId: string;
  providerCardId: string;
  providerTokenId: string;
  providerCardToken: string;
  maskedPan?: string;
  cardBrand?: string;
  cardCountry?: string;
  status: SabiVirtualCardStatus;
  riskStatus: "normal" | "watch" | "restricted" | "admin_review";
  createdAt: Date;
  updatedAt: Date;
};

export const SABI_VIRTUAL_CARD_SECURITY_POLICY = {
  panStorageAllowed: false,
  cvvStorageAllowed: false,
  rawBankAccountStorageAllowed: false,
  mobileProviderApiKeysAllowed: false,
  providerTokenStorageRequired: true,
  pciDssProviderModelRequired: true,
  kycRequiredForPersonalCards: true,
  kybRequiredForBusinessCards: true,
  adminProviderControlRequired: true,
  ledgerHistoryRequired: true,
  webhookStatusRequired: true,
  allowedStoredFields: [
    "providerTokenId",
    "providerCardToken",
    "providerCardId",
    "maskedPan",
    "cardBrand",
    "cardCountry",
    "status",
    "riskStatus",
    "providerReference",
  ],
} as const;
