export type SabiMapLanguage = string | null | undefined;

type SabiMapDictionary = {
  mapReady: string;
  mapLayer: string;
  sabiStoresOnly: string;
  nearest: string;
  openNow: string;
  fastDelivery: string;
  hasNeededProducts: string;
  statusOpen: string;
  statusClosingSoon: string;
  statusClosed: string;
  statusPending: string;
};

const ru: SabiMapDictionary = {
  mapReady: "Карта Sabi",
  mapLayer: "Картографический слой готов к подключению",
  sabiStoresOnly: "Показаны только подключённые магазины Sabi",
  nearest: "Ближайшие",
  openNow: "Открыты",
  fastDelivery: "Быстрая доставка",
  hasNeededProducts: "Есть нужные товары",
  statusOpen: "Открыто",
  statusClosingSoon: "Скоро закроется",
  statusClosed: "Закрыто",
  statusPending: "Ожидает подключения",
};

const en: SabiMapDictionary = {
  mapReady: "Sabi Map",
  mapLayer: "Map layer is ready for provider connection",
  sabiStoresOnly: "Only Sabi-connected stores are shown",
  nearest: "Nearest",
  openNow: "Open now",
  fastDelivery: "Fast delivery",
  hasNeededProducts: "Has needed products",
  statusOpen: "Open",
  statusClosingSoon: "Closing soon",
  statusClosed: "Closed",
  statusPending: "Pending connection",
};

const uz: SabiMapDictionary = {
  mapReady: "Sabi xaritasi",
  mapLayer: "Xarita qatlami ulanishga tayyor",
  sabiStoresOnly: "Faqat Sabi’ga ulangan do‘konlar ko‘rsatiladi",
  nearest: "Eng yaqin",
  openNow: "Ochiq",
  fastDelivery: "Tez yetkazish",
  hasNeededProducts: "Kerakli mahsulotlar bor",
  statusOpen: "Ochiq",
  statusClosingSoon: "Tez orada yopiladi",
  statusClosed: "Yopiq",
  statusPending: "Ulanish kutilmoqda",
};

export function getSabiMapText(language: SabiMapLanguage): SabiMapDictionary {
  const code = String(language || "").toLowerCase();
  if (code.startsWith("ru")) return ru;
  if (code.startsWith("uz")) return uz;
  return en;
}
