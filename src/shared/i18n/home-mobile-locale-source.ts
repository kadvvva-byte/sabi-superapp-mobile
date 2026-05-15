// SABI_HOME_I18N_SOURCE
// Pure translation source for Home mobile texts. This file has no React/i18n runtime imports,
// so src/shared/i18n/locales/index.ts can safely merge Home texts into the global locale tree.

export type HomeMobileLocale = "en" | "ru" | "uz";

export type HomeMobileText = {
  homeTitle: string;
  widgetsTitle: string;
  loadingTitle: string;
  loadingSubtitle: string;
  forexTitle: string;
  cryptoTitle: string;
  forexSignal: string;
  cryptoSignal: string;
  providerRequiredValue: string;
  webVersionTitle: string;
  webVersionBody: string;
  permissionRequiredTitle: string;
  permissionRequiredBody: string;
  imageErrorTitle: string;
  imageUriMissing: string;
  imagePickFailed: string;
  voiceButton: string;
  settingsTitle: string;
  unifiedAccount: string;
  theme: string;
  background: string;
  resetBackground: string;
  defaultBackground: string;
  customBackground: string;
  brandBackground: string;
  themeSabi: string;
  themeWallet: string;
  themeAi: string;
  themeMessenger: string;
  themeMode: string;
  wallpaper: string;
  resetLayout: string;
  done: string;
  restorePrefix: string;
  hiddenWidgetsTitle: string;
  hidden: string;
  noHiddenWidgets: string;
  noHiddenCards: string;
  miniAppsBadge: string;
  miniAppsTitle: string;
  miniAppsAllWidgets: string;
  miniAppsHiddenTitle: string;
  miniAppsAllVisible: string;
  miniAppsResetLayout: string;
  miniAppsAddToHome: string;
  miniAppsRemoveFromHome: string;
  foundationTitle: string;
  foundationReady: string;
  backendUnavailable: string;
  alertsTitle: string;
  alertDrawerTitle: string;
  alertDrawerHint: string;
  alertPolicyShort: string;
  alertNoPersistentBanner: string;
  alertNoExternalOverlay: string;
  calls: string;
  messages: string;
  events: string;
  ai: string;
  security: string;
  noFakeData: string;
  noFakeCounters: string;
  voiceReadyTitle: string;
  voiceReadyBody: string;
  searchTitle: string;
  searchPlaceholder: string;
  searchInside: string;
  searchInternet: string;
  searchInternetHint: string;
  searchEmpty: string;
  searchNoResults: string;
  searchOpenInternet: string;
  searchSafe: string;
};


export const HOME_MOBILE_TEXT: Record<HomeMobileLocale, HomeMobileText> = {
  en: {
    homeTitle: "Home",
    widgetsTitle: "Widgets",
    loadingTitle: "Loading Home",
    loadingSubtitle: "Checking profile and preparing Home.",
    forexTitle: "Forex",
    cryptoTitle: "Crypto",
    forexSignal: "Provider required",
    cryptoSignal: "Provider required",
    providerRequiredValue: "—",
    webVersionTitle: "Web version",
    webVersionBody: "Web uses the system background.",
    permissionRequiredTitle: "Permission required",
    permissionRequiredBody: "Allow gallery access.",
    imageErrorTitle: "Error",
    imageUriMissing: "Image URI was not found.",
    imagePickFailed: "Could not select image.",
    voiceButton: "SABI Voice",
    settingsTitle: "Settings",
    unifiedAccount: "Unified account",
    theme: "Theme",
    background: "Background",
    resetBackground: "Reset background",
    defaultBackground: "Default",
    customBackground: "Custom background",
    brandBackground: "Brand background",
    themeSabi: "Sabi",
    themeWallet: "Wallet",
    themeAi: "AI",
    themeMessenger: "Messenger",
    themeMode: "Theme mode",
    wallpaper: "Wallpaper",
    resetLayout: "Reset layout",
    done: "Done",
    restorePrefix: "Restore",
    hiddenWidgetsTitle: "Hidden widgets",
    hidden: "Hidden",
    noHiddenWidgets: "No hidden widgets.",
    noHiddenCards: "No hidden cards",
    miniAppsBadge: "Mini Apps",
    miniAppsTitle: "Mini Apps",
    miniAppsAllWidgets: "All widgets",
    miniAppsHiddenTitle: "Hidden",
    miniAppsAllVisible: "All apps are visible",
    miniAppsResetLayout: "Reset layout",
    miniAppsAddToHome: "Add",
    miniAppsRemoveFromHome: "Remove",
    foundationTitle: "Home foundation",
    foundationReady: "Foundation ready",
    backendUnavailable: "Backend unavailable",
    alertsTitle: "Home notifications",
    alertDrawerTitle: "Home notifications",
    alertDrawerHint: "Available only inside Home through the top swipe panel.",
    alertPolicyShort: "No persistent Home banner. No overlay above other apps.",
    alertNoPersistentBanner: "Persistent Home banner is disabled.",
    alertNoExternalOverlay: "External overlay above other apps is disabled.",
    calls: "Calls",
    messages: "Messages",
    events: "Events",
    ai: "AI",
    security: "Security",
    noFakeData: "No fake execution. Provider states are shown honestly.",
    noFakeCounters: "Counters stay empty until real providers send events.",
    voiceReadyTitle: "SABI voice control",
    voiceReadyBody: "Wake-word and command execution are provider-controlled. No fake listening or fake action success.",
    searchTitle: "Search",
    searchPlaceholder: "Search inside Sabi or on the internet",
    searchInside: "Inside Sabi",
    searchInternet: "Internet search",
    searchInternetHint: "Opens the query in the browser. Sabi does not fake external web results.",
    searchEmpty: "Type a query to search programs.",
    searchNoResults: "No program found.",
    searchOpenInternet: "Search on the internet",
    searchSafe: "Internal search uses Home/Mini Apps registry only.",
  },
  ru: {
    homeTitle: "Главная",
    widgetsTitle: "Виджеты",
    loadingTitle: "Загрузка Home",
    loadingSubtitle: "Проверяем профиль и готовим Home.",
    forexTitle: "Forex",
    cryptoTitle: "Crypto",
    forexSignal: "Нужен провайдер",
    cryptoSignal: "Нужен провайдер",
    providerRequiredValue: "—",
    webVersionTitle: "Web-версия",
    webVersionBody: "В web используется системный фон.",
    permissionRequiredTitle: "Нужно разрешение",
    permissionRequiredBody: "Разрешите доступ к галерее.",
    imageErrorTitle: "Ошибка",
    imageUriMissing: "URI изображения не найден.",
    imagePickFailed: "Не удалось выбрать изображение.",
    voiceButton: "SABI Voice",
    settingsTitle: "Настройки",
    unifiedAccount: "Единый аккаунт",
    theme: "Тема",
    background: "Фон",
    resetBackground: "Сбросить фон",
    defaultBackground: "По умолчанию",
    customBackground: "Пользовательский фон",
    brandBackground: "Брендовый фон",
    themeSabi: "Sabi",
    themeWallet: "Wallet",
    themeAi: "AI",
    themeMessenger: "Messenger",
    themeMode: "Режим темы",
    wallpaper: "Обои",
    resetLayout: "Сбросить расположение",
    done: "Готово",
    restorePrefix: "Вернуть",
    hiddenWidgetsTitle: "Скрытые виджеты",
    hidden: "Скрытые",
    noHiddenWidgets: "Скрытых виджетов нет.",
    noHiddenCards: "Скрытых карточек нет",
    miniAppsBadge: "Mini Apps",
    miniAppsTitle: "Mini Apps",
    miniAppsAllWidgets: "Все виджеты",
    miniAppsHiddenTitle: "Скрытые",
    miniAppsAllVisible: "Все приложения видимы",
    miniAppsResetLayout: "Сбросить расположение",
    miniAppsAddToHome: "Добавить",
    miniAppsRemoveFromHome: "Убрать",
    foundationTitle: "Основа Home",
    foundationReady: "Основа готова",
    backendUnavailable: "Backend недоступен",
    alertsTitle: "Оповещения Home",
    alertDrawerTitle: "Оповещения Home",
    alertDrawerHint: "Доступны только внутри Home через свайп сверху вниз.",
    alertPolicyShort: "Постоянного баннера на Home нет. Поверх других приложений не появляется.",
    alertNoPersistentBanner: "Постоянный баннер Home отключён.",
    alertNoExternalOverlay: "Оверлей поверх других приложений отключён.",
    calls: "Звонки",
    messages: "Сообщения",
    events: "События",
    ai: "AI",
    security: "Безопасность",
    noFakeData: "Без fake-выполнения. Статусы provider показываются честно.",
    noFakeCounters: "Счётчики остаются пустыми, пока реальные провайдеры не отправят события.",
    voiceReadyTitle: "Голосовое управление SABI",
    voiceReadyBody: "Wake-word и выполнение команд управляются реальным provider. Без fake listening и fake success.",
    searchTitle: "Поиск",
    searchPlaceholder: "Поиск внутри Sabi или в интернете",
    searchInside: "Внутри Sabi",
    searchInternet: "Поиск в интернете",
    searchInternetHint: "Открывает запрос в браузере. Sabi не подделывает внешние web-результаты.",
    searchEmpty: "Введите запрос для поиска программ.",
    searchNoResults: "Программа не найдена.",
    searchOpenInternet: "Искать в интернете",
    searchSafe: "Внутренний поиск использует только Home/Mini Apps registry.",
  },
  uz: {
    homeTitle: "Bosh sahifa",
    widgetsTitle: "Vidjetlar",
    loadingTitle: "Home yuklanmoqda",
    loadingSubtitle: "Profil tekshirilmoqda va Home tayyorlanmoqda.",
    forexTitle: "Forex",
    cryptoTitle: "Crypto",
    forexSignal: "Provider kerak",
    cryptoSignal: "Provider kerak",
    providerRequiredValue: "—",
    webVersionTitle: "Web versiya",
    webVersionBody: "Web tizim fonidan foydalanadi.",
    permissionRequiredTitle: "Ruxsat kerak",
    permissionRequiredBody: "Galereyaga kirishga ruxsat bering.",
    imageErrorTitle: "Xato",
    imageUriMissing: "Rasm URI topilmadi.",
    imagePickFailed: "Rasm tanlab bo‘lmadi.",
    voiceButton: "SABI Voice",
    settingsTitle: "Sozlamalar",
    unifiedAccount: "Yagona akkaunt",
    theme: "Mavzu",
    background: "Fon",
    resetBackground: "Fon sozlamasini tiklash",
    defaultBackground: "Standart",
    customBackground: "Tanlangan fon",
    brandBackground: "Brend foni",
    themeSabi: "Sabi",
    themeWallet: "Wallet",
    themeAi: "AI",
    themeMessenger: "Messenger",
    themeMode: "Mavzu rejimi",
    wallpaper: "Fon rasmi",
    resetLayout: "Joylashuvni tiklash",
    done: "Tayyor",
    restorePrefix: "Qaytarish",
    hiddenWidgetsTitle: "Yashirilgan vidjetlar",
    hidden: "Yashirilgan",
    noHiddenWidgets: "Yashirilgan vidjet yo‘q.",
    noHiddenCards: "Yashirilgan karta yo‘q",
    miniAppsBadge: "Mini Apps",
    miniAppsTitle: "Mini Apps",
    miniAppsAllWidgets: "Barcha vidjetlar",
    miniAppsHiddenTitle: "Yashirilgan",
    miniAppsAllVisible: "Barcha ilovalar ko‘rinadi",
    miniAppsResetLayout: "Joylashuvni tiklash",
    miniAppsAddToHome: "Qo‘shish",
    miniAppsRemoveFromHome: "Olib tashlash",
    foundationTitle: "Home asosi",
    foundationReady: "Asos tayyor",
    backendUnavailable: "Backend mavjud emas",
    alertsTitle: "Home bildirishnomalari",
    alertDrawerTitle: "Home bildirishnomalari",
    alertDrawerHint: "Faqat Home ichida yuqoridan pastga surish orqali ochiladi.",
    alertPolicyShort: "Home’da doimiy banner yo‘q. Boshqa ilovalar ustida chiqmaydi.",
    alertNoPersistentBanner: "Doimiy Home banner o‘chirilgan.",
    alertNoExternalOverlay: "Boshqa ilovalar ustidagi overlay o‘chirilgan.",
    calls: "Qo‘ng‘iroqlar",
    messages: "Xabarlar",
    events: "Voqealar",
    ai: "AI",
    security: "Xavfsizlik",
    noFakeData: "Fake bajarish yo‘q. Provider holatlari halol ko‘rsatiladi.",
    noFakeCounters: "Real providerlar voqea yubormaguncha hisoblagichlar bo‘sh qoladi.",
    voiceReadyTitle: "SABI ovozli boshqaruv",
    voiceReadyBody: "Wake-word va buyruqlar real provider orqali ishlaydi. Fake listening yoki fake success yo‘q.",
    searchTitle: "Qidiruv",
    searchPlaceholder: "Sabi ichida yoki internetda qidirish",
    searchInside: "Sabi ichida",
    searchInternet: "Internet qidiruvi",
    searchInternetHint: "So‘rov brauzerda ochiladi. Sabi tashqi web natijalarni soxtalashtirmaydi.",
    searchEmpty: "Dasturlarni qidirish uchun so‘rov kiriting.",
    searchNoResults: "Dastur topilmadi.",
    searchOpenInternet: "Internetda qidirish",
    searchSafe: "Ichki qidiruv faqat Home/Mini Apps registrydan foydalanadi.",
  },
};


function homeTextToFlatRecord(text: HomeMobileText): Record<string, string> {
  return Object.fromEntries(
    Object.entries(text).map(([key, value]) => [`home.mobile.${key}`, value]),
  );
}

export const HOME_MOBILE_TRANSLATIONS: Record<HomeMobileLocale, Record<string, string>> = {
  en: homeTextToFlatRecord(HOME_MOBILE_TEXT.en),
  ru: homeTextToFlatRecord(HOME_MOBILE_TEXT.ru),
  uz: homeTextToFlatRecord(HOME_MOBILE_TEXT.uz),
};

export default HOME_MOBILE_TRANSLATIONS;

export function normalizeHomeMobileLocale(language?: string | null): HomeMobileLocale {
  const normalized = String(language || "").toLowerCase();
  if (normalized.startsWith("ru")) return "ru";
  if (normalized.startsWith("uz")) return "uz";
  return "en";
}

export function pickHomeMobileText(language?: string | null): HomeMobileText {
  return HOME_MOBILE_TEXT[normalizeHomeMobileLocale(language)];
}
