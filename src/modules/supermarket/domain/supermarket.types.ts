export type SupermarketLocaleCode = "ru" | "en" | "uz";

export type LocalizedText = Partial<Record<SupermarketLocaleCode, string>> & {
  ru: string;
  en?: string;
  uz?: string;
};

export type SupermarketStoreType =
  | "supermarket"
  | "grocery"
  | "household"
  | "household_chemicals"
  | "home_goods"
  | "mixed"
  | "alcohol_licensed"
  | "tobacco_licensed";

export type SupermarketStoreStatus = "open" | "closing_soon" | "closed" | "verification_pending";

export type SupermarketDepartmentId =
  | "products"
  | "household_goods"
  | "household_chemicals"
  | "home_goods"
  | "alcohol"
  | "tobacco";

export type SupermarketComplianceGate = {
  restricted: boolean;
  reasonKey?: "age_kyc_required" | "license_required" | "region_law_required";
};

export type SupermarketDepartment = {
  id: SupermarketDepartmentId;
  title: LocalizedText;
  shortTitle: LocalizedText;
  compliance: SupermarketComplianceGate;
};

export type SupermarketProduct = {
  id: string;
  storeId: string;
  departmentId: SupermarketDepartmentId;
  title: LocalizedText;
  subtitle: LocalizedText;
  unitLabel: LocalizedText;
  price: number;
  oldPrice?: number;
  stock: number;
  imageTone: "green" | "cream" | "blue" | "amber" | "rose";
  compliance: SupermarketComplianceGate;
};

export type SupermarketStore = {
  id: string;
  title: string;
  type: SupermarketStoreType;
  status: SupermarketStoreStatus;
  address: string;
  distanceKm: number;
  deliveryMinutes: [number, number];
  rating: number;
  likes: number;
  minOrder: number;
  deliveryFee: number;
  serviceFeePercent: number;
  approvedBySabi: boolean;
  activeInSabi: boolean;
  x: number;
  y: number;
  departments: SupermarketDepartmentId[];
  coverageScore: number;
};

export type SupermarketCartItem = {
  productId: string;
  quantity: number;
};

export type SupermarketCartLine = {
  product: SupermarketProduct;
  quantity: number;
};

export type SupermarketCartSummary = {
  itemsCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export type SupermarketDeliverySlot = {
  id?: string;
  label?: string;
  fee: number;
};

export type SupermarketPaymentMethod = "sabi_wallet" | "business_card" | "cash_after_provider";

export type SupermarketDeliveryMethod = "delivery" | "pickup";

export type SupermarketCheckoutPreview = {
  subtotal: number;
  deliveryFee: number;
  sabiServiceFee: number;
  total: number;
};
