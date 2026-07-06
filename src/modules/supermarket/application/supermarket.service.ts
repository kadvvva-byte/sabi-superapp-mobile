import type { SabiMapMarker } from "../../sabi-map/domain/sabiMap.types";
import {
  SABI_SUPERMARKET_PRODUCTS,
  SABI_SUPERMARKET_STORES,
  SUPERMARKET_DEPARTMENTS,
} from "../data/supermarket.local";
import type {
  LocalizedText,
  SupermarketCheckoutPreview,
  SupermarketDepartment,
  SupermarketDepartmentId,
  SupermarketLocaleCode,
  SupermarketProduct,
  SupermarketStore,
  SupermarketStoreStatus,
  SupermarketStoreType,
} from "../domain/supermarket.types";

export function resolveSupermarketLocale(language?: string | null): SupermarketLocaleCode {
  const code = String(language || "").toLowerCase();
  if (code.startsWith("ru")) return "ru";
  if (code.startsWith("uz")) return "uz";
  return "en";
}

export function localizeText(value: LocalizedText, language?: string | null): string {
  const locale = resolveSupermarketLocale(language);
  return value[locale] || value.ru || value.en || "";
}

export function listSabiConnectedStores(): SupermarketStore[] {
  return SABI_SUPERMARKET_STORES.filter((store) => store.approvedBySabi);
}

export function listActiveCustomerStores(): SupermarketStore[] {
  return listSabiConnectedStores().filter((store) => store.activeInSabi);
}

export function getStoreById(storeId: string): SupermarketStore | undefined {
  return SABI_SUPERMARKET_STORES.find((store) => store.id === storeId);
}

export function listProductsByStore(storeId: string): SupermarketProduct[] {
  return SABI_SUPERMARKET_PRODUCTS.filter((product) => product.storeId === storeId);
}

export function getProductById(productId: string): SupermarketProduct | undefined {
  return SABI_SUPERMARKET_PRODUCTS.find((product) => product.id === productId);
}

export function listDepartmentsForStore(store: SupermarketStore): SupermarketDepartment[] {
  const storeDepartments = new Set(store.departments);
  return SUPERMARKET_DEPARTMENTS.filter((department) => storeDepartments.has(department.id));
}

export function searchStoresAndProducts(query: string, language?: string | null): SupermarketStore[] {
  const normalized = query.trim().toLowerCase();
  const stores = listActiveCustomerStores();
  if (!normalized) return stores;

  return stores.filter((store) => {
    const storeText = `${store.title} ${store.address} ${store.type}`.toLowerCase();
    if (storeText.includes(normalized)) return true;

    return listProductsByStore(store.id).some((product) => {
      const productText = `${localizeText(product.title, language)} ${localizeText(product.subtitle, language)}`.toLowerCase();
      return productText.includes(normalized);
    });
  });
}

export function filterProducts(input: {
  storeId: string;
  departmentId: SupermarketDepartmentId;
  query: string;
  language?: string | null;
}): SupermarketProduct[] {
  const query = input.query.trim().toLowerCase();

  return listProductsByStore(input.storeId)
    .filter((product) => product.departmentId === input.departmentId)
    .filter((product) => {
      if (!query) return true;
      return `${localizeText(product.title, input.language)} ${localizeText(product.subtitle, input.language)}`
        .toLowerCase()
        .includes(query);
    });
}

export function makeStoreMapMarker(store: SupermarketStore): SabiMapMarker {
  return {
    id: store.id,
    kind: store.type === "supermarket" ? "supermarket" : store.type === "grocery" ? "grocery" : store.type === "household_chemicals" ? "household_chemicals" : store.type === "home_goods" ? "home_goods" : store.type === "alcohol_licensed" ? "alcohol_restricted" : store.type === "tobacco_licensed" ? "tobacco_restricted" : "mixed",
    title: store.title,
    subtitle: store.address,
    status: store.status === "verification_pending" ? "pending" : store.status,
    rating: store.rating,
    likes: store.likes,
    distanceKm: store.distanceKm,
    deliveryMinutes: store.deliveryMinutes,
    x: store.x,
    y: store.y,
    verifiedBySabi: store.approvedBySabi,
    activeInSabi: store.activeInSabi,
    deliveryRadiusKm: 5,
  };
}

export function sortStoresForCustomer(stores: SupermarketStore[], mode: "nearest" | "coverage" | "fast"): SupermarketStore[] {
  return [...stores].sort((a, b) => {
    if (mode === "coverage") return b.coverageScore - a.coverageScore;
    if (mode === "fast") return a.deliveryMinutes[1] - b.deliveryMinutes[1];
    return a.distanceKm - b.distanceKm;
  });
}

export function calculateCheckoutPreview(input: {
  productTotals: number;
  deliveryFee: number;
  serviceFeePercent: number;
}): SupermarketCheckoutPreview {
  const sabiServiceFee = Math.round(input.productTotals * (input.serviceFeePercent / 100));
  return {
    subtotal: input.productTotals,
    deliveryFee: input.deliveryFee,
    sabiServiceFee,
    total: input.productTotals + input.deliveryFee + sabiServiceFee,
  };
}

export function storeTypeLabel(type: SupermarketStoreType, language?: string | null): string {
  const locale = resolveSupermarketLocale(language);
  const labels: Record<SupermarketStoreType, Record<SupermarketLocaleCode, string>> = {
    supermarket: { ru: "Супермаркет", en: "Supermarket", uz: "Supermarket" },
    grocery: { ru: "Продуктовый магазин", en: "Grocery shop", uz: "Oziq-ovqat do‘koni" },
    household: { ru: "Бытовые товары", en: "Household goods", uz: "Maishiy tovarlar" },
    household_chemicals: { ru: "Бытовая химия", en: "Household chemicals", uz: "Maishiy kimyo" },
    home_goods: { ru: "Хозтовары", en: "Home goods", uz: "Xo‘jalik tovarlari" },
    mixed: { ru: "Смешанный магазин", en: "Mixed store", uz: "Aralash do‘kon" },
    alcohol_licensed: { ru: "Лицензионный алкоголь", en: "Licensed alcohol", uz: "Litsenziyali alkogol" },
    tobacco_licensed: { ru: "Лицензионный табак", en: "Licensed tobacco", uz: "Litsenziyali tamaki" },
  };
  return labels[type][locale];
}

export function storeStatusLabel(status: SupermarketStoreStatus, language?: string | null): string {
  const locale = resolveSupermarketLocale(language);
  const labels: Record<SupermarketStoreStatus, Record<SupermarketLocaleCode, string>> = {
    open: { ru: "Открыто", en: "Open", uz: "Ochiq" },
    closing_soon: { ru: "Скоро закроется", en: "Closing soon", uz: "Tez orada yopiladi" },
    closed: { ru: "Закрыто", en: "Closed", uz: "Yopiq" },
    verification_pending: { ru: "Ожидает допуска", en: "Waiting approval", uz: "Tasdiq kutilmoqda" },
  };
  return labels[status][locale];
}

export function formatSupermarketAmount(value: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value);
}
