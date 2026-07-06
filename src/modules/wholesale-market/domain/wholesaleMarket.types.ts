export type WholesaleMarketLocale = "ru" | "en" | "uz" | "zh";

export type WholesaleMarketTab = "home" | "countries" | "category" | "cart" | "profile";

export type WholesaleMarketCountryCode =
  | "uz"
  | "kz"
  | "kg"
  | "tj"
  | "tr"
  | "ae";

export type WholesaleMarketRiskLevel = "standard" | "business";

export type WholesaleMarketVerificationStatus =
  | "verified"
  | "pending"
  | "not_started";

export type WholesaleMarketPaymentStatus =
  | "merchant_pending"
  | "wallet_pending"
  | "coin_ready_later";

export interface WholesaleMarketCountry {
  code: WholesaleMarketCountryCode;
  titleKey: string;
  subtitleKey: string;
  regionKey: string;
  imageUrl: string;
  cityCount: number;
  wholesalerCount: number;
}

export interface WholesaleMarketCategory {
  id: string;
  titleKey: string;
  subtitleKey: string;
  imageUrl: string;
  sections: string[];
  riskLevel: WholesaleMarketRiskLevel;
  retailAllowed: boolean;
}

export interface WholesaleMarketWholesaler {
  id: string;
  countryCode: WholesaleMarketCountryCode;
  titleKey: string;
  cityKey: string;
  typeKey: string;
  imageUrl: string;
  rating: number;
  likes: number;
  minOrderKey: string;
  retailAllowed: boolean;
  verificationStatus: WholesaleMarketVerificationStatus;
  merchantStatus: WholesaleMarketPaymentStatus;
  categories: string[];
  badges: string[];
}

export interface WholesaleMarketProduct {
  id: string;
  countryCode: WholesaleMarketCountryCode;
  categoryId: string;
  wholesalerId: string;
  titleKey: string;
  subtitleKey: string;
  imageUrl: string;
  quantityStep: number;
  minQuantity: number;
  unitKey: string;
  termsKey: string;
  stockKey: string;
  retailAllowed: boolean;
}

export interface WholesaleMarketCartItem {
  productId: string;
  quantity: number;
}

export interface WholesaleMarketAccessGate {
  buyerVerificationRequired: boolean;
  sellerVerificationRequired: boolean;
  purchaseAllowed: boolean;
  paymentAllowed: boolean;
  checkoutBlockedReasonKey: string;
}
