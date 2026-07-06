import type {
  SilkRoadCategory,
  SilkRoadCategoryId,
  SilkRoadManufacturer,
  SilkRoadProduct,
  SilkRoadRiskLevel,
  SilkRoadVerificationState,
} from "../domain/marketplace.types";
import {
  SILKROAD_CATEGORIES,
  SILKROAD_DEFAULT_VERIFICATION_STATE,
  SILKROAD_MANUFACTURERS,
  SILKROAD_PRODUCTS,
  SILKROAD_ROUTE_LINKS,
} from "../data/marketplace.local";

export type SilkRoadFilterMode = "all" | "verified" | "restricted" | "stream";

export function getSilkRoadCategories(): SilkRoadCategory[] {
  return SILKROAD_CATEGORIES;
}

export function getSilkRoadManufacturers(): SilkRoadManufacturer[] {
  return SILKROAD_MANUFACTURERS;
}

export function getSilkRoadRouteLinks() {
  return SILKROAD_ROUTE_LINKS;
}

export function getSilkRoadDefaultVerificationState(): SilkRoadVerificationState {
  return SILKROAD_DEFAULT_VERIFICATION_STATE;
}

export function findSilkRoadManufacturer(id: string): SilkRoadManufacturer | undefined {
  return SILKROAD_MANUFACTURERS.find((manufacturer) => manufacturer.id === id);
}

export function findSilkRoadCategory(id: SilkRoadCategoryId): SilkRoadCategory | undefined {
  return SILKROAD_CATEGORIES.find((category) => category.id === id);
}

export function getSilkRoadCategoryRisk(id: SilkRoadCategoryId): SilkRoadRiskLevel {
  return findSilkRoadCategory(id)?.riskLevel ?? "standard";
}

export function getSilkRoadProducts(options?: {
  categoryId?: SilkRoadCategoryId | "all";
  query?: string;
  mode?: SilkRoadFilterMode;
}): SilkRoadProduct[] {
  const query = String(options?.query || "").trim().toLowerCase();
  const categoryId = options?.categoryId || "all";
  const mode = options?.mode || "all";

  return SILKROAD_PRODUCTS.filter((product) => {
    if (categoryId !== "all" && product.categoryId !== categoryId) return false;

    if (mode === "verified") {
      const manufacturer = findSilkRoadManufacturer(product.manufacturerId);
      if (!manufacturer?.verified) return false;
    }

    if (mode === "restricted" && product.riskLevel !== "restricted") return false;
    if (mode === "stream" && !findSilkRoadManufacturer(product.manufacturerId)?.businessStreamRoute) return false;

    if (!query) return true;

    const manufacturer = findSilkRoadManufacturer(product.manufacturerId);
    const haystack = [
      product.id,
      product.titleKey,
      product.categoryId,
      product.subcategoryId,
      manufacturer?.name,
      manufacturer?.countryKey,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function buildSilkRoadVerificationStateForProduct(product: SilkRoadProduct): SilkRoadVerificationState {
  const categoryRiskLevel = product.riskLevel || getSilkRoadCategoryRisk(product.categoryId);
  const restricted = categoryRiskLevel === "restricted";
  const business = categoryRiskLevel === "business";

  return {
    ...SILKROAD_DEFAULT_VERIFICATION_STATE,
    categoryRiskLevel,
    checkoutBlockedReason: restricted || business ? "gate.title" : "gate.body",
    buyerEntityType: restricted ? "licensed_company" : business ? "verified_business" : "personal",
    purchaseAllowed: false,
    sellingAllowed: false,
    paymentAllowed: false,
    payoutAllowed: false,
  };
}

export function isSilkRoadRestrictedCategory(category: SilkRoadCategory): boolean {
  return category.riskLevel === "restricted";
}
