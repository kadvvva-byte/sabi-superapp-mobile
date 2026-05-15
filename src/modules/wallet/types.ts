export type WalletCardType =
  | "local"
  | "international"
  | "local_international"
  | "virtual";

export type WalletCardDetection = {
  cardType: WalletCardType;
  scheme: string;
  issuer: string;
  issuerCountry?: string;
  domesticRoutingEnabled: boolean;
  internationalRoutingEnabled: boolean;
  coBadged: boolean;
  verificationMode: "cvv" | "otp" | "cvv_otp";
};

export type WalletCardRecord = {
  id: string;
  title: string;
  maskedNumber: string;
  balance?: string;
  detection: WalletCardDetection;
  isPrimary?: boolean;
  isActive?: boolean;
};