import type { SupermarketPaymentMethod, SupermarketDeliveryMethod } from "../domain/supermarket.types";

type SupermarketText = {
  title: string;
  subtitle: string;
  addressTitle: string;
  addressPlaceholder: string;
  searchPlaceholder: string;
  mapTitle: string;
  storesNearby: string;
  nearest: string;
  coverage: string;
  fast: string;
  openStore: string;
  chooseStore: string;
  storeCatalog: string;
  backToMap: string;
  defaultDepartmentNote: string;
  lockedDepartment: string;
  lockedDepartmentText: string;
  add: string;
  stock: string;
  cart: string;
  cartEmpty: string;
  deliveryAddress: string;
  deliveryMethod: string;
  paymentMethod: string;
  subtotal: string;
  delivery: string;
  sabiService: string;
  total: string;
  deliveryPreview: string;
  pickupPreview: string;
  walletPay: string;
  cardPay: string;
  laterPay: string;
  prepareOrder: string;
  pendingOrder: string;
  merchantClosedAccess: string;
  merchantClosedAccessText: string;
  commission: string;
  minOrder: string;
  likes: string;
  neededProducts: string;
};

const ru: SupermarketText = {
  title: "Sabi Supermarket",
  subtitle: "Ближайшие подключённые магазины, продукты и доставка внутри Sabi.",
  addressTitle: "Адрес доставки",
  addressPlaceholder: "Введите адрес или выберите локацию",
  searchPlaceholder: "Найти магазин или товар",
  mapTitle: "Карта подключённых магазинов",
  storesNearby: "Магазины рядом",
  nearest: "Ближайший",
  coverage: "Есть нужные товары",
  fast: "Быстрая доставка",
  openStore: "Открыть магазин",
  chooseStore: "Выберите магазин на карте или в списке",
  storeCatalog: "Каталог магазина",
  backToMap: "К карте магазинов",
  defaultDepartmentNote: "Первый отдел открыт: Продукты",
  lockedDepartment: "Раздел ограничен",
  lockedDepartmentText: "Доступ зависит от возраста, KYC, лицензии магазина и правил страны.",
  add: "Добавить",
  stock: "В наличии",
  cart: "Корзина",
  cartEmpty: "Корзина пока пустая",
  deliveryAddress: "Адрес и локация",
  deliveryMethod: "Получение",
  paymentMethod: "Оплата",
  subtotal: "Товары",
  delivery: "Доставка",
  sabiService: "Сервис Sabi",
  total: "Итого",
  deliveryPreview: "Доставка",
  pickupPreview: "Самовывоз",
  walletPay: "Sabi Wallet",
  cardPay: "Бизнес-карта",
  laterPay: "После подключения",
  prepareOrder: "Подготовить заказ",
  pendingOrder: "Заказ не отправлен: ожидается подключение backend, Wallet и Merchant Account.",
  merchantClosedAccess: "Доступ владельца магазина",
  merchantClosedAccessText: "Раздел будет открываться только через Business Account, verification, Merchant Account и Admin approval.",
  commission: "Комиссия Sabi",
  minOrder: "Минимальный заказ",
  likes: "оценок",
  neededProducts: "Товары найдены",
};

const en: SupermarketText = {
  title: "Sabi Supermarket",
  subtitle: "Nearby connected stores, groceries and delivery inside Sabi.",
  addressTitle: "Delivery address",
  addressPlaceholder: "Enter address or choose location",
  searchPlaceholder: "Find store or product",
  mapTitle: "Connected stores map",
  storesNearby: "Stores nearby",
  nearest: "Nearest",
  coverage: "Has needed products",
  fast: "Fast delivery",
  openStore: "Open store",
  chooseStore: "Choose a store on the map or list",
  storeCatalog: "Store catalog",
  backToMap: "Back to store map",
  defaultDepartmentNote: "Default department: Food",
  lockedDepartment: "Restricted section",
  lockedDepartmentText: "Access depends on age, KYC, store license and country rules.",
  add: "Add",
  stock: "In stock",
  cart: "Cart",
  cartEmpty: "Cart is empty",
  deliveryAddress: "Address and location",
  deliveryMethod: "Fulfillment",
  paymentMethod: "Payment",
  subtotal: "Products",
  delivery: "Delivery",
  sabiService: "Sabi service",
  total: "Total",
  deliveryPreview: "Delivery",
  pickupPreview: "Pickup",
  walletPay: "Sabi Wallet",
  cardPay: "Business card",
  laterPay: "After connection",
  prepareOrder: "Prepare order",
  pendingOrder: "Order is not sent: backend, Wallet and Merchant Account connection is pending.",
  merchantClosedAccess: "Store owner access",
  merchantClosedAccessText: "This section opens only through Business Account, verification, Merchant Account and Admin approval.",
  commission: "Sabi commission",
  minOrder: "Minimum order",
  likes: "ratings",
  neededProducts: "Products found",
};

const uz: SupermarketText = {
  title: "Sabi Supermarket",
  subtitle: "Sabi ichidagi yaqin ulangan do‘konlar, mahsulotlar va yetkazish.",
  addressTitle: "Yetkazish manzili",
  addressPlaceholder: "Manzil kiriting yoki lokatsiya tanlang",
  searchPlaceholder: "Do‘kon yoki mahsulot topish",
  mapTitle: "Ulangan do‘konlar xaritasi",
  storesNearby: "Yaqindagi do‘konlar",
  nearest: "Eng yaqin",
  coverage: "Kerakli mahsulotlar bor",
  fast: "Tez yetkazish",
  openStore: "Do‘konni ochish",
  chooseStore: "Xarita yoki ro‘yxatdan do‘kon tanlang",
  storeCatalog: "Do‘kon katalogi",
  backToMap: "Do‘konlar xaritasiga qaytish",
  defaultDepartmentNote: "Birinchi bo‘lim: Mahsulotlar",
  lockedDepartment: "Cheklangan bo‘lim",
  lockedDepartmentText: "Kirish yosh, KYC, do‘kon litsenziyasi va mamlakat qoidalariga bog‘liq.",
  add: "Qo‘shish",
  stock: "Mavjud",
  cart: "Savat",
  cartEmpty: "Savat bo‘sh",
  deliveryAddress: "Manzil va lokatsiya",
  deliveryMethod: "Qabul qilish",
  paymentMethod: "To‘lov",
  subtotal: "Mahsulotlar",
  delivery: "Yetkazish",
  sabiService: "Sabi xizmati",
  total: "Jami",
  deliveryPreview: "Yetkazish",
  pickupPreview: "Olib ketish",
  walletPay: "Sabi Wallet",
  cardPay: "Biznes karta",
  laterPay: "Ulangandan keyin",
  prepareOrder: "Buyurtmani tayyorlash",
  pendingOrder: "Buyurtma yuborilmadi: backend, Wallet va Merchant Account ulanishi kutilmoqda.",
  merchantClosedAccess: "Do‘kon egasi kirishi",
  merchantClosedAccessText: "Bu bo‘lim faqat Business Account, verification, Merchant Account va Admin approval orqali ochiladi.",
  commission: "Sabi komissiyasi",
  minOrder: "Minimal buyurtma",
  likes: "baholar",
  neededProducts: "Mahsulotlar topildi",
};

export function supermarketText(language?: string | null): SupermarketText {
  const code = String(language || "").toLowerCase();
  if (code.startsWith("ru")) return ru;
  if (code.startsWith("uz")) return uz;
  return en;
}

export function paymentMethodText(method: SupermarketPaymentMethod, text: SupermarketText): string {
  if (method === "sabi_wallet") return text.walletPay;
  if (method === "business_card") return text.cardPay;
  return text.laterPay;
}

export function deliveryMethodText(method: SupermarketDeliveryMethod, text: SupermarketText): string {
  return method === "delivery" ? text.deliveryPreview : text.pickupPreview;
}
