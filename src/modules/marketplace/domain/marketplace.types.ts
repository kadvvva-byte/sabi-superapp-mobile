export type SilkRoadLocale =
  | "en"
  | "ru"
  | "uz"
  | "zh"
  | "tr"
  | "kk"
  | "ky"
  | "tg";

export type SilkRoadCurrency = "COIN" | "SELLER_DEFINED";

export type SilkRoadRiskLevel = "standard" | "business" | "restricted";

export type SilkRoadVerificationStatus =
  | "not_started"
  | "pending"
  | "approved"
  | "rejected";

export type SilkRoadBuyerEntityType =
  | "personal"
  | "verified_business"
  | "manufacturer"
  | "licensed_company";

export type SilkRoadCategoryId =
  | "electronics"
  | "clothing"
  | "footwear"
  | "home_kitchen"
  | "beauty"
  | "children"
  | "auto"
  | "construction_machinery"
  | "tools"
  | "sports"
  | "accessories"
  | "food_products"
  | "business_goods"
  | "wholesale_goods"
  | "manufacturers"
  | "new_arrivals"
  | "premium_goods"
  | "chemicals"
  | "metals"
  | "equipment"
  | "petroleum_products"
  | "gold_jewelry"
  | "precious_stones";

export type SilkRoadSubcategory = {
  id: string;
  titleKey: string;
  riskLevel?: SilkRoadRiskLevel;
};

export type SilkRoadCategory = {
  id: SilkRoadCategoryId;
  titleKey: string;
  shortKey: string;
  riskLevel: SilkRoadRiskLevel;
  accent: string;
  subcategories: SilkRoadSubcategory[];
};

export type SilkRoadManufacturer = {
  id: string;
  name: string;
  countryKey: string;
  city: string;
  verified: boolean;
  rating: number;
  orders: number;
  primaryCategoryId: SilkRoadCategoryId;
  specializationKey: string;
  businessStreamRoute: string;
  messengerRoute: string;
  businessMerchantRequired: boolean;
  approvalStatus: SilkRoadVerificationStatus;
};

export type SilkRoadProductSpec = {
  labelKey: string;
  value: string;
};

export type SilkRoadProduct = {
  id: string;
  categoryId: SilkRoadCategoryId;
  subcategoryId: string;
  titleKey: string;
  manufacturerId: string;
  priceFrom: number;
  currency: SilkRoadCurrency;
  minQuantity: number;
  stockLabelKey: string;
  deliveryLabelKey: string;
  rating: number;
  reviewCount: number;
  variants: string[];
  specs: SilkRoadProductSpec[];
  riskLevel: SilkRoadRiskLevel;
  verifiedOnly: boolean;
  imageTone: "gold" | "sand" | "amber" | "pearl" | "bronze";
};

export type SilkRoadCartLine = {
  productId: string;
  quantity: number;
  variant?: string;
};

export type SilkRoadVerificationState = {
  verificationStatus: SilkRoadVerificationStatus;
  kycStatus: SilkRoadVerificationStatus;
  kybStatus: SilkRoadVerificationStatus;
  amlStatus: SilkRoadVerificationStatus;
  buyerEntityType: SilkRoadBuyerEntityType;
  buyerLicenseStatus: SilkRoadVerificationStatus;
  sellerApprovalStatus: SilkRoadVerificationStatus;
  sellerDocumentStatus: SilkRoadVerificationStatus;
  productDocumentStatus: SilkRoadVerificationStatus;
  categoryRiskLevel: SilkRoadRiskLevel;
  countryRuleStatus: SilkRoadVerificationStatus;
  purchaseAllowed: boolean;
  sellingAllowed: boolean;
  paymentAllowed: boolean;
  payoutAllowed: boolean;
  checkoutBlockedReason: string;
  adminComplianceStatus: SilkRoadVerificationStatus;
};

export type SilkRoadRouteLink = {
  id: "messenger" | "business_stream" | "business_account" | "business_merchant" | "wallet" | "admin" | "qr";
  titleKey: string;
  bodyKey: string;
  route: string;
};
