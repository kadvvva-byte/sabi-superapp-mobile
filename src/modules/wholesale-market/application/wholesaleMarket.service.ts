import {
  WHOLESALE_MARKET_CATEGORIES,
  WHOLESALE_MARKET_COUNTRIES,
  WHOLESALE_MARKET_EXCLUDED_CATEGORIES,
  WHOLESALE_MARKET_PRODUCTS,
  WHOLESALE_MARKET_WHOLESALERS,
} from "../data/wholesaleMarket.local";
import type {
  WholesaleMarketAccessGate,
  WholesaleMarketCartItem,
  WholesaleMarketCountryCode,
} from "../domain/wholesaleMarket.types";

export function getWholesaleMarketCountries() {
  return WHOLESALE_MARKET_COUNTRIES;
}

export function getWholesaleMarketCategories() {
  return WHOLESALE_MARKET_CATEGORIES;
}

export function getExcludedWholesaleMarketCategories() {
  return WHOLESALE_MARKET_EXCLUDED_CATEGORIES;
}

export function getWholesaleMarketWholesalers(countryCode?: WholesaleMarketCountryCode) {
  if (!countryCode) return WHOLESALE_MARKET_WHOLESALERS;
  return WHOLESALE_MARKET_WHOLESALERS.filter((seller) => seller.countryCode === countryCode);
}

export function getWholesaleMarketProducts(countryCode?: WholesaleMarketCountryCode, categoryId?: string) {
  return WHOLESALE_MARKET_PRODUCTS.filter((product) => {
    if (countryCode && product.countryCode !== countryCode) return false;
    if (categoryId && product.categoryId !== categoryId) return false;
    return true;
  });
}

export function getWholesaleMarketProduct(productId: string) {
  return WHOLESALE_MARKET_PRODUCTS.find((product) => product.id === productId) ?? null;
}

export function getWholesaleMarketWholesaler(wholesalerId: string) {
  return WHOLESALE_MARKET_WHOLESALERS.find((seller) => seller.id === wholesalerId) ?? null;
}

export function searchWholesaleMarket(query: string, countryCode?: WholesaleMarketCountryCode) {
  const needle = query.trim().toLowerCase();
  const products = getWholesaleMarketProducts(countryCode);
  if (!needle) return products;

  return products.filter((product) => {
    return [product.titleKey, product.subtitleKey, product.categoryId, product.wholesalerId]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
}

export function countWholesaleCartItems(items: WholesaleMarketCartItem[]) {
  return items.reduce((sum, item) => sum + Math.max(0, item.quantity), 0);
}

export function buildWholesaleAccessGate(options: {
  buyerKycPassed: boolean;
  buyerAmlPassed: boolean;
  sellerApproved: boolean;
  merchantReady: boolean;
}): WholesaleMarketAccessGate {
  if (!options.buyerKycPassed || !options.buyerAmlPassed) {
    return {
      buyerVerificationRequired: true,
      sellerVerificationRequired: false,
      purchaseAllowed: false,
      paymentAllowed: false,
      checkoutBlockedReasonKey: "gate.buyerVerification",
    };
  }

  if (!options.sellerApproved) {
    return {
      buyerVerificationRequired: false,
      sellerVerificationRequired: true,
      purchaseAllowed: false,
      paymentAllowed: false,
      checkoutBlockedReasonKey: "gate.sellerApproval",
    };
  }

  if (!options.merchantReady) {
    return {
      buyerVerificationRequired: false,
      sellerVerificationRequired: false,
      purchaseAllowed: true,
      paymentAllowed: false,
      checkoutBlockedReasonKey: "gate.merchantPending",
    };
  }

  return {
    buyerVerificationRequired: false,
    sellerVerificationRequired: false,
    purchaseAllowed: true,
    paymentAllowed: true,
    checkoutBlockedReasonKey: "gate.ready",
  };
}
