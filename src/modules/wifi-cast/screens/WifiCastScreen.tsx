import React, { useEffect, useMemo, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Cast,
  CheckCircle2,
  MonitorSmartphone,
  PlayCircle,
  Router,
  Settings,
  ShieldCheck,
  Tv,
  Wifi,
} from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import {
  enterNativePresentationMode,
  exitNativePresentationMode,
  connectNativeWifiDirectDevice,
  getNativePresentationStatus,
  getNativeWifiDirectStatus,
  isSabiPresentationNativeAvailable,
  openNativeCastPicker,
  openNativeDisplaySettings,
  openNativeSystemSettings,
  openNativeWifiSettings,
  requestNativeWifiDirectPermissions,
  scanNativeWifiDirectDevices,
  type SabiPresentationStatus,
  type SabiWifiDirectDevice,
  type SabiWifiDirectStatus,
} from "../native/SabiPresentationNative";

type LocaleKey = "ru" | "uz" | "en" | "zh";
type CastAction = "cast" | "wifi" | "display" | "system";
type ModeKey = "presentation" | "presenter";

type PresentationCard = {
  title: string;
  subtitle: string;
  status: string;
};

type WifiCastText = {
  title: string;
  subtitle: string;
  ready: string;
  monitor: string;
  phone: string;
  tv: string;
  openCast: string;
  searchConnect: string;
  confirmConnected: string;
  connectedManual: string;
  scanTitle: string;
  scanSteps: string[];
  noDeviceTitle: string;
  noDeviceSteps: string[];
  openWifi: string;
  openDisplay: string;
  openSystem: string;
  presentationMode: string;
  presenterMode: string;
  checklistTitle: string;
  checklist: string[];
  fallbackTitle: string;
  fallbackText: string;
  emergencyTitle: string;
  emergencySteps: string[];
  statusLocal: string;
  statusSystem: string;
  statusNoFake: string;
  nativeLayerReady: string;
  nativeLayerMissing: string;
  externalConnected: string;
  externalWaiting: string;
  detectedDisplay: string;
  presentationLock: string;
  back: string;
  opening: string;
  opened: string;
  unsupported: string;
  tapCastFirst: string;
  cards: PresentationCard[];
};

const TEXT: Record<LocaleKey, WifiCastText> = {
  ru: {
    title: "Sabi Presentation",
    subtitle: "Показ на монитор или телевизор через Wi‑Fi",
    ready: "Готово к сегодняшнему показу",
    monitor: "Монитор / TV",
    phone: "Телефон",
    tv: "TV",
    openCast: "Открыть Cast / Smart View",
    searchConnect: "Найти TV и подключить",
    confirmConnected: "Экран подключён",
    connectedManual: "Подключение подтверждено. Можно показывать презентацию.",
    scanTitle: "Поиск и подключение",
    scanSteps: [
      "На TV/мониторе включи Screen Mirroring / Miracast / Smart View",
      "Нажми «Найти TV и подключить»",
      "В системном списке Android выбери нужный TV или монитор",
      "После подключения вернись в Sabi",
    ],
    noDeviceTitle: "Если устройство не найдено",
    noDeviceSteps: [
      "Проверь, что TV и телефон рядом и в одной Wi‑Fi сети",
      "Открой Wi‑Fi и переподключись к той же сети",
      "Открой настройки экрана и повтори поиск",
    ],
    openWifi: "Открыть Wi‑Fi",
    openDisplay: "Настройки экрана",
    openSystem: "Системные настройки",
    presentationMode: "Презентационный экран",
    presenterMode: "Режим докладчика",
    checklistTitle: "Порядок подключения",
    checklist: [
      "Телефон и TV должны быть в одной Wi‑Fi сети",
      "Нажми Cast / Smart View и выбери монитор или TV",
      "После подключения вернись в Sabi",
      "Показывай Messenger, Wallet, Sabi AI и нужные экраны",
    ],
    fallbackTitle: "Если TV не появился",
    fallbackText: "Открой верхнюю шторку Android и нажми Smart View / Screen Cast / Беспроводной дисплей.",
    emergencyTitle: "План Б для презентации",
    emergencySteps: [
      "Включи Hotspot на телефоне и подключи TV к этой сети",
      "Или подключи телефон к монитору через USB‑C → HDMI",
      "Яркость телефона — максимум, автоповорот — выключить",
    ],
    statusLocal: "Sabi показывает чистый презентационный экран",
    statusSystem: "Подключение выполняет Android Cast / Smart View",
    statusNoFake: "Sabi не рисует фейковое подключение",
    nativeLayerReady: "Native Android Cast слой активен",
    nativeLayerMissing: "Native слой не найден: нужен новый dev/APK build",
    externalConnected: "Внешний экран обнаружен. Можно показывать презентацию.",
    externalWaiting: "Жду внешний экран после выбора TV/монитора",
    detectedDisplay: "Обнаружен экран",
    presentationLock: "Экран не гаснет, полноэкранный режим включён",
    back: "Назад",
    opening: "Открываю настройки…",
    opened: "Настройки открыты. Выбери TV/монитор и вернись в Sabi.",
    unsupported: "Если страница не открылась, используй верхнюю шторку Android.",
    tapCastFirst: "Сначала нажми Cast / Smart View",
    cards: [
      { title: "Messenger", subtitle: "Чаты, звонки, подарки", status: "Показывать" },
      { title: "Wallet", subtitle: "QR, платежи, безопасность", status: "Показывать" },
      { title: "Sabi AI", subtitle: "Голос, перевод, помощник", status: "Показывать" },
      { title: "Stream", subtitle: "Пауза разработки", status: "Не запускать" },
    ],
  },
  uz: {
    title: "Sabi Presentation",
    subtitle: "Monitor yoki TV ga Wi‑Fi orqali ko‘rsatish",
    ready: "Bugungi ko‘rsatishga tayyor",
    monitor: "Monitor / TV",
    phone: "Telefon",
    tv: "TV",
    openCast: "Cast / Smart View ni ochish",
    searchConnect: "TV ni topish va ulash",
    confirmConnected: "Ekran ulandi",
    connectedManual: "Ulanish tasdiqlandi. Prezentatsiyani ko‘rsatish mumkin.",
    scanTitle: "Qidirish va ulash",
    scanSteps: [
      "TV/monitorda Screen Mirroring / Miracast / Smart View ni yoqing",
      "«TV ni topish va ulash» tugmasini bosing",
      "Android tizim ro‘yxatidan kerakli TV yoki monitorni tanlang",
      "Ulangandan keyin Sabi ga qayting",
    ],
    noDeviceTitle: "Qurilma topilmasa",
    noDeviceSteps: [
      "TV va telefon yaqin hamda bitta Wi‑Fi tarmog‘ida ekanini tekshiring",
      "Wi‑Fi ni ochib, shu tarmoqqa qayta ulang",
      "Ekran sozlamalarini ochib, qidirishni takrorlang",
    ],
    openWifi: "Wi‑Fi sozlamalari",
    openDisplay: "Ekran sozlamalari",
    openSystem: "Tizim sozlamalari",
    presentationMode: "Prezentatsiya ekrani",
    presenterMode: "Taqdimotchi rejimi",
    checklistTitle: "Ulanish tartibi",
    checklist: [
      "Telefon va TV bitta Wi‑Fi tarmog‘ida bo‘lsin",
      "Cast / Smart View ni bosing va monitor yoki TV ni tanlang",
      "Ulangandan keyin Sabi ga qayting",
      "Messenger, Wallet, Sabi AI va kerakli ekranlarni ko‘rsating",
    ],
    fallbackTitle: "TV ko‘rinmasa",
    fallbackText: "Android yuqori panelini oching va Smart View / Screen Cast / Wireless display ni bosing.",
    emergencyTitle: "Prezentatsiya uchun B reja",
    emergencySteps: [
      "Telefonda Hotspot yoqing va TV ni shu tarmoqqa ulang",
      "Yoki telefonni USB‑C → HDMI orqali monitorga ulang",
      "Telefon yorqinligi maksimum, avto-aylantirish o‘chirilgan bo‘lsin",
    ],
    statusLocal: "Sabi toza prezentatsiya ekranini ko‘rsatadi",
    statusSystem: "Ulanishni Android Cast / Smart View bajaradi",
    statusNoFake: "Sabi ichida soxta ulanish yo‘q",
    nativeLayerReady: "Native Android Cast qatlami faol",
    nativeLayerMissing: "Native qatlam topilmadi: yangi dev/APK build kerak",
    externalConnected: "Tashqi ekran aniqlandi. Prezentatsiyani ko‘rsatish mumkin.",
    externalWaiting: "TV/monitor tanlangandan keyin tashqi ekran kutilmoqda",
    detectedDisplay: "Aniqlangan ekran",
    presentationLock: "Ekran o‘chmaydi, fullscreen rejim yoqilgan",
    back: "Orqaga",
    opening: "Sozlamalar ochilmoqda…",
    opened: "Sozlamalar ochildi. TV/monitorni tanlang va Sabi ga qayting.",
    unsupported: "Sahifa ochilmasa, Android yuqori panelidan foydalaning.",
    tapCastFirst: "Avval Cast / Smart View ni bosing",
    cards: [
      { title: "Messenger", subtitle: "Chatlar, qo‘ng‘iroqlar, sovg‘alar", status: "Ko‘rsatish" },
      { title: "Wallet", subtitle: "QR, to‘lovlar, xavfsizlik", status: "Ko‘rsatish" },
      { title: "Sabi AI", subtitle: "Ovoz, tarjima, yordamchi", status: "Ko‘rsatish" },
      { title: "Stream", subtitle: "Ishlab chiqish pauzada", status: "Ochmaslik" },
    ],
  },
  en: {
    title: "Sabi Presentation",
    subtitle: "Wi‑Fi display casting to monitor or TV",
    ready: "Ready for today’s presentation",
    monitor: "Monitor / TV",
    phone: "Phone",
    tv: "TV",
    openCast: "Open Cast / Smart View",
    searchConnect: "Find TV and connect",
    confirmConnected: "Screen connected",
    connectedManual: "Connection confirmed. Presentation can be shown.",
    scanTitle: "Search and connect",
    scanSteps: [
      "Enable Screen Mirroring / Miracast / Smart View on the TV or monitor",
      "Tap “Find TV and connect”",
      "Select the TV or monitor in Android’s system list",
      "After connection, return to Sabi",
    ],
    noDeviceTitle: "If the device is not found",
    noDeviceSteps: [
      "Check that phone and TV are close and on the same Wi‑Fi network",
      "Open Wi‑Fi and reconnect to the same network",
      "Open display settings and run search again",
    ],
    openWifi: "Open Wi‑Fi",
    openDisplay: "Display settings",
    openSystem: "System settings",
    presentationMode: "Presentation screen",
    presenterMode: "Presenter mode",
    checklistTitle: "Connection order",
    checklist: [
      "Keep phone and TV on the same Wi‑Fi network",
      "Tap Cast / Smart View and select the monitor or TV",
      "After connection, return to Sabi",
      "Present Messenger, Wallet, Sabi AI and required screens",
    ],
    fallbackTitle: "If the TV does not appear",
    fallbackText: "Open Android quick settings and tap Smart View / Screen Cast / Wireless display.",
    emergencyTitle: "Presentation backup plan",
    emergencySteps: [
      "Enable phone hotspot and connect the TV to that network",
      "Or connect phone to monitor with USB‑C → HDMI",
      "Set phone brightness to maximum and disable auto-rotate",
    ],
    statusLocal: "Sabi shows a clean presentation screen",
    statusSystem: "Android Cast / Smart View performs the connection",
    statusNoFake: "Sabi does not show fake connection status",
    nativeLayerReady: "Native Android Cast layer is active",
    nativeLayerMissing: "Native layer is missing: new dev/APK build is required",
    externalConnected: "External screen detected. Presentation can be shown.",
    externalWaiting: "Waiting for external screen after TV/monitor selection",
    detectedDisplay: "Detected display",
    presentationLock: "Screen stays awake, fullscreen mode is active",
    back: "Back",
    opening: "Opening settings…",
    opened: "Settings opened. Select TV/monitor and return to Sabi.",
    unsupported: "If the page did not open, use Android quick settings.",
    tapCastFirst: "Tap Cast / Smart View first",
    cards: [
      { title: "Messenger", subtitle: "Chats, calls, gifts", status: "Present" },
      { title: "Wallet", subtitle: "QR, payments, security", status: "Present" },
      { title: "Sabi AI", subtitle: "Voice, translation, assistant", status: "Present" },
      { title: "Stream", subtitle: "Development paused", status: "Do not launch" },
    ],
  },
  zh: {
    title: "Sabi Presentation",
    subtitle: "通过 Wi‑Fi 投屏到显示器或电视",
    ready: "已准备好今天演示",
    monitor: "显示器 / 电视",
    phone: "手机",
    tv: "电视",
    openCast: "打开投屏 / Smart View",
    searchConnect: "查找电视并连接",
    confirmConnected: "屏幕已连接",
    connectedManual: "连接已确认，可以开始演示。",
    scanTitle: "搜索并连接",
    scanSteps: [
      "在电视/显示器上打开 Screen Mirroring / Miracast / Smart View",
      "点击“查找电视并连接”",
      "在 Android 系统列表中选择电视或显示器",
      "连接后返回 Sabi",
    ],
    noDeviceTitle: "如果没有找到设备",
    noDeviceSteps: [
      "确认手机和电视距离较近并连接同一个 Wi‑Fi",
      "打开 Wi‑Fi 并重新连接同一网络",
      "打开显示设置并重新搜索",
    ],
    openWifi: "打开 Wi‑Fi",
    openDisplay: "显示设置",
    openSystem: "系统设置",
    presentationMode: "演示屏幕",
    presenterMode: "演示者模式",
    checklistTitle: "连接步骤",
    checklist: [
      "手机和电视连接同一个 Wi‑Fi",
      "点击 Cast / Smart View 并选择显示器或电视",
      "连接后返回 Sabi",
      "展示 Messenger、Wallet、Sabi AI 和所需页面",
    ],
    fallbackTitle: "如果电视没有出现",
    fallbackText: "打开 Android 快捷设置，点击 Smart View / Screen Cast / 无线显示。",
    emergencyTitle: "演示备用方案",
    emergencySteps: [
      "打开手机热点，并让电视连接该网络",
      "或使用 USB‑C → HDMI 连接手机和显示器",
      "手机亮度调到最高，关闭自动旋转",
    ],
    statusLocal: "Sabi 显示干净的演示屏幕",
    statusSystem: "连接由 Android Cast / Smart View 完成",
    statusNoFake: "Sabi 不显示虚假连接状态",
    nativeLayerReady: "Android 原生投屏层已启用",
    nativeLayerMissing: "未找到原生层：需要新的 dev/APK 构建",
    externalConnected: "已检测到外接屏幕，可以开始演示。",
    externalWaiting: "选择电视/显示器后等待外接屏幕",
    detectedDisplay: "检测到的屏幕",
    presentationLock: "屏幕保持常亮，已启用全屏模式",
    back: "返回",
    opening: "正在打开设置…",
    opened: "设置已打开。请选择电视/显示器后返回 Sabi。",
    unsupported: "如果页面未打开，请使用 Android 快捷设置。",
    tapCastFirst: "先点击 Cast / Smart View",
    cards: [
      { title: "Messenger", subtitle: "聊天、通话、礼物", status: "展示" },
      { title: "Wallet", subtitle: "二维码、支付、安全", status: "展示" },
      { title: "Sabi AI", subtitle: "语音、翻译、助手", status: "展示" },
      { title: "Stream", subtitle: "开发暂停", status: "不启动" },
    ],
  },
};


type TvBrandGroup = {
  title: string;
  names: string[];
};

type AdvancedWifiDirectText = {
  title: string;
  subtitle: string;
  scanButton: string;
  scanning: string;
  permissionButton: string;
  permissionMissing: string;
  found: string;
  noneFound: string;
  model: string;
  address: string;
  status: string;
  connect: string;
  connectStarted: string;
  openCastAfterConnect: string;
  supported: string;
  unsupportedP2p: string;
  permissionsOk: string;
  tvCandidate: string;
  nearbyDevice: string;
  scanHint: string;
  modelSearch: string;
  brandListTitle: string;
  brandListSubtitle: string;
  exactModelNote: string;
};

const ADVANCED_TEXT: Record<LocaleKey, AdvancedWifiDirectText> = {
  ru: {
    title: "Расширенный поиск TV",
    subtitle: "Показывает реальные Wi‑Fi Direct / Miracast устройства с названием модели",
    scanButton: "Сканировать модели TV",
    scanning: "Идёт поиск устройств…",
    permissionButton: "Разрешить поиск устройств",
    permissionMissing: "Нужны разрешения Android для Wi‑Fi Direct поиска",
    found: "Найдено устройств",
    noneFound: "Пока TV не найден. Открой Cast / Smart View и повтори поиск.",
    model: "Модель",
    address: "Адрес",
    status: "Статус",
    connect: "Подключить",
    connectStarted: "Запрос подключения отправлен. Подтверди на TV/Android, если появится окно.",
    openCastAfterConnect: "Открыть Cast для выбора экрана",
    supported: "Wi‑Fi Direct доступен",
    unsupportedP2p: "Этот телефон не даёт Wi‑Fi Direct API. Используй системный Cast или USB‑C → HDMI.",
    permissionsOk: "Разрешения поиска активны",
    tvCandidate: "Похоже на TV/монитор",
    nearbyDevice: "Nearby device",
    scanHint: "Учитываются Samsung, LG, Sony, Xiaomi/Mi TV, Hisense, TCL, Philips, Android/Google TV, Chromecast/Roku и Miracast/WFD имена.",
    modelSearch: "Поиск по модели",
    brandListTitle: "Какие марки учитываются",
    brandListSubtitle: "Sabi ищет не только слово TV, но и реальные имена брендов, Cast, Miracast, WFD и Wi‑Fi Display.",
    exactModelNote: "Точная модель появляется в списке после сканирования, если Android/TV отдаёт имя устройства.",
  },
  uz: {
    title: "TV kengaytirilgan qidiruv",
    subtitle: "Haqiqiy Wi‑Fi Direct / Miracast qurilmalarini model nomi bilan ko‘rsatadi",
    scanButton: "TV modellarini qidirish",
    scanning: "Qurilmalar qidirilmoqda…",
    permissionButton: "Qidiruv ruxsatini berish",
    permissionMissing: "Wi‑Fi Direct qidiruvi uchun Android ruxsatlari kerak",
    found: "Topilgan qurilmalar",
    noneFound: "TV hali topilmadi. Cast / Smart View ni ochib, qayta qidiring.",
    model: "Model",
    address: "Manzil",
    status: "Holat",
    connect: "Ulash",
    connectStarted: "Ulanish so‘rovi yuborildi. TV/Android oynasi chiqsa tasdiqlang.",
    openCastAfterConnect: "Ekranni tanlash uchun Cast ni ochish",
    supported: "Wi‑Fi Direct mavjud",
    unsupportedP2p: "Bu telefon Wi‑Fi Direct API bermaydi. Tizim Cast yoki USB‑C → HDMI ishlating.",
    permissionsOk: "Qidiruv ruxsatlari faol",
    tvCandidate: "TV/monitor bo‘lishi mumkin",
    nearbyDevice: "Yaqindagi qurilma",
    scanHint: "Samsung, LG, Sony, Xiaomi/Mi TV, Hisense, TCL, Philips, Android/Google TV, Chromecast/Roku va Miracast/WFD nomlari hisobga olinadi.",
    modelSearch: "Model bo‘yicha qidiruv",
    brandListTitle: "Qaysi markalar hisobga olinadi",
    brandListSubtitle: "Sabi faqat TV so‘zini emas, brend nomlari, Cast, Miracast, WFD va Wi‑Fi Display nomlarini ham tekshiradi.",
    exactModelNote: "Aniq model Android/TV qurilma nomini berganda skan natijasida ko‘rinadi.",
  },
  en: {
    title: "Advanced TV search",
    subtitle: "Shows real Wi‑Fi Direct / Miracast devices with model names",
    scanButton: "Scan TV models",
    scanning: "Searching devices…",
    permissionButton: "Allow device search",
    permissionMissing: "Android permissions are required for Wi‑Fi Direct search",
    found: "Devices found",
    noneFound: "No TV found yet. Open Cast / Smart View and scan again.",
    model: "Model",
    address: "Address",
    status: "Status",
    connect: "Connect",
    connectStarted: "Connection request sent. Confirm on TV/Android if a prompt appears.",
    openCastAfterConnect: "Open Cast to choose screen",
    supported: "Wi‑Fi Direct available",
    unsupportedP2p: "This phone does not expose Wi‑Fi Direct API. Use system Cast or USB‑C → HDMI.",
    permissionsOk: "Search permissions active",
    tvCandidate: "Looks like TV/monitor",
    nearbyDevice: "Nearby device",
    scanHint: "Samsung, LG, Sony, Xiaomi/Mi TV, Hisense, TCL, Philips, Android/Google TV, Chromecast/Roku and Miracast/WFD names are recognized.",
    modelSearch: "Model search",
    brandListTitle: "Supported TV brands",
    brandListSubtitle: "Sabi checks brand names, Cast, Miracast, WFD and Wi‑Fi Display names, not only the word TV.",
    exactModelNote: "The exact model appears after scanning when Android/TV exposes the device name.",
  },
  zh: {
    title: "高级电视搜索",
    subtitle: "显示真实 Wi‑Fi Direct / Miracast 设备和型号名称",
    scanButton: "扫描电视型号",
    scanning: "正在搜索设备…",
    permissionButton: "允许设备搜索",
    permissionMissing: "Wi‑Fi Direct 搜索需要 Android 权限",
    found: "已找到设备",
    noneFound: "暂未找到电视。打开 Cast / Smart View 后再搜索。",
    model: "型号",
    address: "地址",
    status: "状态",
    connect: "连接",
    connectStarted: "已发送连接请求。如电视/Android 弹出确认，请确认。",
    openCastAfterConnect: "打开 Cast 选择屏幕",
    supported: "Wi‑Fi Direct 可用",
    unsupportedP2p: "此手机不提供 Wi‑Fi Direct API。请使用系统 Cast 或 USB‑C → HDMI。",
    permissionsOk: "搜索权限已启用",
    tvCandidate: "可能是电视/显示器",
    nearbyDevice: "附近设备",
    scanHint: "识别 Samsung、LG、Sony、Xiaomi/Mi TV、Hisense、TCL、Philips、Android/Google TV、Chromecast/Roku 和 Miracast/WFD 名称。",
    modelSearch: "按型号搜索",
    brandListTitle: "支持的电视品牌",
    brandListSubtitle: "Sabi 不只检查 TV 字样，也识别品牌名、Cast、Miracast、WFD 和 Wi‑Fi Display 名称。",
    exactModelNote: "如果 Android/电视提供设备名称，扫描后会显示具体型号。",
  },
};

const TV_BRAND_GROUPS: TvBrandGroup[] = [
  { title: "Samsung", names: ["Samsung", "Smart View", "Tizen TV"] },
  { title: "LG", names: ["LG", "webOS", "Screen Share"] },
  { title: "Sony", names: ["Sony", "BRAVIA", "Google TV"] },
  { title: "Xiaomi", names: ["Xiaomi", "Mi TV", "Redmi TV"] },
  { title: "Hisense", names: ["Hisense", "VIDAA"] },
  { title: "TCL", names: ["TCL", "Android TV", "Google TV"] },
  { title: "Philips", names: ["Philips", "Ambilight"] },
  { title: "Panasonic", names: ["Panasonic", "VIERA"] },
  { title: "Sharp", names: ["Sharp", "AQUOS"] },
  { title: "Toshiba", names: ["Toshiba", "REGZA"] },
  { title: "Haier", names: ["Haier", "Aiwa"] },
  { title: "Skyworth", names: ["Skyworth", "Coocaa"] },
  { title: "Vizio", names: ["Vizio", "SmartCast"] },
  { title: "Vestel", names: ["Vestel", "JVC", "Grundig"] },
  { title: "Huawei / Honor", names: ["Huawei", "Honor", "Cast"] },
  { title: "Google / Roku", names: ["Chromecast", "Google Cast", "Roku"] },
  { title: "Miracast", names: ["Miracast", "WFD", "AnyCast", "MiraScreen", "EZCast"] },
  { title: "Monitors", names: ["AOC", "BenQ", "Dell", "HP", "Lenovo", "Wireless Display"] },
];

const ANDROID_INTENT_CHAINS: Record<CastAction, string[]> = {
  cast: [
    "android.settings.CAST_SETTINGS",
    "android.settings.WIFI_DISPLAY_SETTINGS",
    "android.settings.DISPLAY_SETTINGS",
    "android.settings.WIRELESS_SETTINGS",
    "android.settings.SETTINGS",
  ],
  wifi: [
    "android.settings.WIFI_SETTINGS",
    "android.settings.WIRELESS_SETTINGS",
    "android.settings.SETTINGS",
  ],
  display: [
    "android.settings.DISPLAY_SETTINGS",
    "android.settings.CAST_SETTINGS",
    "android.settings.SETTINGS",
  ],
  system: ["android.settings.SETTINGS"],
};

function resolveLocale(language?: string | null): LocaleKey {
  const value = String(language || "").trim().toLowerCase();
  if (value.startsWith("ru")) return "ru";
  if (value.startsWith("uz")) return "uz";
  if (value.startsWith("zh") || value.startsWith("cn")) return "zh";
  return "en";
}

async function sendAndroidIntent(action: string): Promise<void> {
  const maybeLinking = Linking as typeof Linking & {
    sendIntent?: (action: string, extras?: Array<{ key: string; value: string | number | boolean }>) => Promise<void>;
  };

  if (Platform.OS === "android" && typeof maybeLinking.sendIntent === "function") {
    await maybeLinking.sendIntent(action, []);
    return;
  }

  await Linking.openSettings();
}

async function openAndroidIntentChain(id: CastAction): Promise<boolean> {
  if (Platform.OS !== "android") {
    await Linking.openSettings();
    return true;
  }

  if (isSabiPresentationNativeAvailable) {
    const result =
      id === "cast"
        ? await openNativeCastPicker()
        : id === "wifi"
          ? await openNativeWifiSettings()
          : id === "display"
            ? await openNativeDisplaySettings()
            : await openNativeSystemSettings();

    if (result.opened) return true;
  }

  for (const action of ANDROID_INTENT_CHAINS[id]) {
    try {
      await sendAndroidIntent(action);
      return true;
    } catch {
      // Try the next Android settings page.
    }
  }

  try {
    await Linking.openSettings();
    return true;
  } catch {
    return false;
  }
}

function useShortTextGuard() {
  const [compactTitle, setCompactTitle] = useState(false);

  const onTitleLayout = (event: { nativeEvent?: { lines?: unknown[] } }) => {
    if ((event.nativeEvent?.lines || []).length > 1) {
      setCompactTitle(true);
    }
  };

  return { compactTitle, onTitleLayout };
}

export default function WifiCastScreen() {
  const insets = useSafeAreaInsets();
  const { language } = useI18n();
  const locale = resolveLocale(language);
  const text = TEXT[locale];
  const advancedText = ADVANCED_TEXT[locale];
  const [activeMode, setActiveMode] = useState<ModeKey>("presentation");
  const [lastAction, setLastAction] = useState<CastAction | null>(null);
  const [busyAction, setBusyAction] = useState<CastAction | null>(null);
  const [statusMessage, setStatusMessage] = useState(text.tapCastFirst);
  const [connectionConfirmed, setConnectionConfirmed] = useState(false);
  const [nativeStatus, setNativeStatus] = useState<SabiPresentationStatus | null>(null);
  const [wifiDirectStatus, setWifiDirectStatus] = useState<SabiWifiDirectStatus | null>(null);
  const [wifiDevices, setWifiDevices] = useState<SabiWifiDirectDevice[]>([]);
  const [scanBusy, setScanBusy] = useState(false);
  const [connectBusyAddress, setConnectBusyAddress] = useState<string | null>(null);
  const { compactTitle, onTitleLayout } = useShortTextGuard();

  const actionRows = useMemo(
    () => [
      { id: "cast" as CastAction, title: text.openCast, icon: Cast },
      { id: "wifi" as CastAction, title: text.openWifi, icon: Wifi },
      { id: "display" as CastAction, title: text.openDisplay, icon: Settings },
      { id: "system" as CastAction, title: text.openSystem, icon: Router },
    ],
    [text.openCast, text.openDisplay, text.openSystem, text.openWifi],
  );


  useEffect(() => {
    let mounted = true;

    const refreshStatus = async () => {
      const [status, wifiStatus] = await Promise.all([
        getNativePresentationStatus(),
        getNativeWifiDirectStatus(),
      ]);
      if (!mounted) return;
      setNativeStatus(status);
      setWifiDirectStatus(wifiStatus);
      if (status.externalDisplayConnected) {
        setConnectionConfirmed(true);
        setStatusMessage(text.externalConnected);
      }
    };

    void enterNativePresentationMode(false).catch(() => undefined);
    void refreshStatus();
    const timer = setInterval(() => void refreshStatus(), 2500);

    return () => {
      mounted = false;
      clearInterval(timer);
      void exitNativePresentationMode().catch(() => undefined);
    };
  }, [text.externalConnected]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.push("/home" as never);
  };

  const openSetting = async (id: CastAction) => {
    if (busyAction) return;

    setLastAction(id);
    setBusyAction(id);
    setConnectionConfirmed(false);
    setStatusMessage(id === "cast" ? text.opening : text.opening);

    const opened = await openAndroidIntentChain(id);

    setBusyAction(null);
    setStatusMessage(opened ? text.opened : text.unsupported);

    const status = await getNativePresentationStatus();
    setNativeStatus(status);
    if (status.externalDisplayConnected) {
      setConnectionConfirmed(true);
      setStatusMessage(text.externalConnected);
    }
  };

  const requestWifiPermissions = async () => {
    const status = await requestNativeWifiDirectPermissions();
    setWifiDirectStatus(status);
  };

  const scanWifiDirectModels = async () => {
    if (scanBusy) return;

    setScanBusy(true);
    setStatusMessage(advancedText.scanning);

    let status = await getNativeWifiDirectStatus();
    if (!status.permissionsGranted) {
      status = await requestNativeWifiDirectPermissions();
    }
    setWifiDirectStatus(status);

    if (!status.wifiDirectSupported) {
      setStatusMessage(advancedText.unsupportedP2p);
      setScanBusy(false);
      return;
    }

    if (!status.permissionsGranted) {
      setStatusMessage(advancedText.permissionMissing);
      setScanBusy(false);
      return;
    }

    const scan = await scanNativeWifiDirectDevices(4200);
    setWifiDirectStatus(scan.status);
    setWifiDevices(scan.devices);
    setScanBusy(false);

    if (scan.devices.length > 0) {
      setStatusMessage(`${advancedText.found}: ${scan.devices.length}`);
      return;
    }

    setStatusMessage(scan.error ? `${advancedText.noneFound} (${scan.error})` : advancedText.noneFound);
  };

  const connectWifiDirectModel = async (device: SabiWifiDirectDevice) => {
    if (!device.connectable || connectBusyAddress) return;

    setConnectBusyAddress(device.deviceAddress);
    const result = await connectNativeWifiDirectDevice(device.deviceAddress);
    setConnectBusyAddress(null);

    if (result.status) setWifiDirectStatus(result.status);
    setStatusMessage(result.connectStarted ? advancedText.connectStarted : result.error || advancedText.noneFound);

    const status = await getNativePresentationStatus();
    setNativeStatus(status);
    if (status.externalDisplayConnected) {
      setConnectionConfirmed(true);
      setStatusMessage(text.externalConnected);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#06111F" />
      <LinearGradient colors={["#06111F", "#0A2A3D", "#03121C"]} style={styles.background}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
          <Pressable onPress={goBack} style={styles.headerButton} accessibilityRole="button">
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{text.title}</Text>
            <Text style={styles.headerSubtitle}>{text.subtitle}</Text>
          </View>
          <View style={styles.headerButton}>
            <Tv size={20} color="#FFFFFF" />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 18) + 16 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stageCard}>
            <View style={styles.stageTopRow}>
              <View style={styles.stageIconWrap}>
                <MonitorSmartphone size={34} color="#FFFFFF" />
              </View>
              <View style={styles.stageCopy}>
                <Text style={styles.readyText}>{text.ready}</Text>
                <Text
                  onTextLayout={onTitleLayout}
                  style={[styles.stageTitle, compactTitle ? styles.stageTitleCompact : null]}
                >
                  {text.monitor}
                </Text>
              </View>
            </View>

            <View style={styles.castDiagram}>
              <View style={styles.deviceBox}>
                <Text style={styles.deviceEmoji}>📱</Text>
                <Text style={styles.deviceText}>{text.phone}</Text>
              </View>
              <View style={styles.signalWrap}>
                <View style={styles.signalLine} />
                <Wifi size={24} color="#BAE6FD" />
                <View style={styles.signalLine} />
              </View>
              <View style={styles.deviceBox}>
                <Text style={styles.deviceEmoji}>📺</Text>
                <Text style={styles.deviceText}>{text.tv}</Text>
              </View>
            </View>

            <Pressable
              onPress={() => openSetting("cast")}
              style={({ pressed }) => [
                styles.primaryCastButton,
                pressed ? styles.primaryCastButtonPressed : null,
                busyAction === "cast" ? styles.primaryCastButtonBusy : null,
              ]}
            >
              <Cast size={23} color="#05202E" />
              <Text style={styles.primaryCastText}>{busyAction === "cast" ? text.opening : text.searchConnect}</Text>
            </Pressable>

            <View style={styles.liveStatusPill}>
              <View style={[styles.statusDot, nativeStatus?.externalDisplayConnected ? styles.statusDotGood : null]} />
              <Text style={styles.liveStatusText}>{statusMessage}</Text>
            </View>

            <View style={styles.advancedSearchCard}>
              <View style={styles.advancedHeaderRow}>
                <View style={styles.advancedIconWrap}>
                  <Tv size={18} color="#BAE6FD" />
                </View>
                <View style={styles.advancedHeaderCopy}>
                  <Text style={styles.advancedTitle}>{advancedText.title}</Text>
                  <Text style={styles.advancedSubtitle}>{advancedText.subtitle}</Text>
                </View>
              </View>

              <View style={styles.advancedStatusRow}>
                <View style={styles.advancedStatusPill}>
                  <Text style={styles.advancedStatusText}>
                    {wifiDirectStatus?.wifiDirectSupported ? advancedText.supported : advancedText.unsupportedP2p}
                  </Text>
                </View>
                <View style={styles.advancedStatusPill}>
                  <Text style={styles.advancedStatusText}>
                    {wifiDirectStatus?.permissionsGranted ? advancedText.permissionsOk : advancedText.permissionMissing}
                  </Text>
                </View>
              </View>

              <Text style={styles.modelHintText}>{advancedText.scanHint}</Text>

              <View style={styles.brandListCard}>
                <Text style={styles.brandListTitle}>{advancedText.brandListTitle}</Text>
                <Text style={styles.brandListSubtitle}>{advancedText.brandListSubtitle}</Text>
                <View style={styles.brandGroupsWrap}>
                  {TV_BRAND_GROUPS.map((group) => (
                    <View key={group.title} style={styles.brandGroupBox}>
                      <Text style={styles.brandGroupTitle}>{group.title}</Text>
                      <View style={styles.brandChipWrap}>
                        {group.names.map((name) => (
                          <View key={`${group.title}-${name}`} style={styles.brandChip}>
                            <Text style={styles.brandChipText}>{name}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
                <Text style={styles.brandExactNote}>{advancedText.exactModelNote}</Text>
              </View>

              <View style={styles.advancedButtonsRow}>
                {!wifiDirectStatus?.permissionsGranted ? (
                  <Pressable onPress={requestWifiPermissions} style={styles.secondaryScanButton}>
                    <ShieldCheck size={17} color="#FFFFFF" />
                    <Text style={styles.secondaryScanText}>{advancedText.permissionButton}</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={scanWifiDirectModels}
                  style={[styles.scanModelsButton, scanBusy ? styles.scanModelsButtonBusy : null]}
                >
                  <Wifi size={18} color="#05202E" />
                  <Text style={styles.scanModelsText}>{scanBusy ? advancedText.scanning : advancedText.scanButton}</Text>
                </Pressable>
              </View>

              <View style={styles.deviceListHeader}>
                <Text style={styles.deviceListTitle}>{advancedText.modelSearch}</Text>
                <Text style={styles.deviceListCount}>{advancedText.found}: {wifiDevices.length}</Text>
              </View>

              {wifiDevices.length === 0 ? (
                <View style={styles.noModelFoundBox}>
                  <Text style={styles.noModelFoundText}>{advancedText.noneFound}</Text>
                </View>
              ) : (
                wifiDevices.map((device) => (
                  <View key={device.deviceAddress || device.deviceName} style={styles.deviceResultCard}>
                    <View style={styles.deviceResultTop}>
                      <View style={styles.deviceResultIcon}>
                        <MonitorSmartphone size={17} color="#E0F2FE" />
                      </View>
                      <View style={styles.deviceResultCopy}>
                        <Text style={styles.deviceResultName}>{device.deviceName || advancedText.nearbyDevice}</Text>
                        <Text style={styles.deviceResultMeta}>{advancedText.model}: {device.modelFamily}</Text>
                      </View>
                      {device.looksLikeTv ? (
                        <View style={styles.tvCandidatePill}>
                          <Text style={styles.tvCandidateText}>{advancedText.tvCandidate}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.deviceResultSmall}>{advancedText.status}: {device.statusText}</Text>
                    <Text style={styles.deviceResultSmall}>{advancedText.address}: {device.deviceAddress || "—"}</Text>
                    <View style={styles.deviceActionRow}>
                      <Pressable
                        onPress={() => connectWifiDirectModel(device)}
                        disabled={!device.connectable || connectBusyAddress === device.deviceAddress}
                        style={[styles.deviceConnectButton, !device.connectable ? styles.disabledButton : null]}
                      >
                        <Text style={styles.deviceConnectText}>
                          {connectBusyAddress === device.deviceAddress ? text.opening : advancedText.connect}
                        </Text>
                      </Pressable>
                      <Pressable onPress={() => openSetting("cast")} style={styles.deviceCastButton}>
                        <Text style={styles.deviceCastText}>{advancedText.openCastAfterConnect}</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={styles.nativeHealthRow}>
              <View style={styles.nativeHealthPill}>
                <Text style={styles.nativeHealthText}>
                  {isSabiPresentationNativeAvailable ? text.nativeLayerReady : text.nativeLayerMissing}
                </Text>
              </View>
              <View style={[styles.nativeHealthPill, nativeStatus?.externalDisplayConnected ? styles.nativeHealthPillGood : null]}>
                <Text style={styles.nativeHealthText}>
                  {nativeStatus?.externalDisplayConnected ? text.externalConnected : text.externalWaiting}
                </Text>
              </View>
            </View>

            {nativeStatus?.externalDisplayConnected ? (
              <View style={styles.detectedDisplayCard}>
                <MonitorSmartphone size={18} color="#BBF7D0" />
                <Text style={styles.detectedDisplayText}>
                  {text.detectedDisplay}: {nativeStatus.displays.find((display) => display.isExternal)?.name || text.monitor}
                </Text>
              </View>
            ) : null}

            <View style={styles.scanGuideCard}>
              <Text style={styles.scanGuideTitle}>{text.scanTitle}</Text>
              {text.scanSteps.map((item, index) => (
                <View key={item} style={styles.scanStepRow}>
                  <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text></View>
                  <Text style={styles.scanStepText}>{item}</Text>
                </View>
              ))}
              <Pressable
                onPress={() => {
                  setConnectionConfirmed(true);
                  setStatusMessage(text.connectedManual);
                }}
                style={[styles.confirmButton, connectionConfirmed ? styles.confirmButtonActive : null]}
              >
                <MonitorSmartphone size={18} color={connectionConfirmed ? "#05202E" : "#D9F4FF"} />
                <Text style={[styles.confirmButtonText, connectionConfirmed ? styles.confirmButtonTextActive : null]}>
                  {text.confirmConnected}
                </Text>
              </Pressable>
            </View>

            <View style={styles.modeSwitch}>
              <Pressable
                onPress={() => setActiveMode("presentation")}
                style={[styles.modeButton, activeMode === "presentation" ? styles.modeButtonActive : null]}
              >
                <PlayCircle size={17} color={activeMode === "presentation" ? "#05202E" : "#D9F4FF"} />
                <Text style={[styles.modeText, activeMode === "presentation" ? styles.modeTextActive : null]}>
                  {text.presentationMode}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setActiveMode("presenter")}
                style={[styles.modeButton, activeMode === "presenter" ? styles.modeButtonActive : null]}
              >
                <ShieldCheck size={17} color={activeMode === "presenter" ? "#05202E" : "#D9F4FF"} />
                <Text style={[styles.modeText, activeMode === "presenter" ? styles.modeTextActive : null]}>
                  {text.presenterMode}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.actionGrid}>
            {actionRows.map((item) => {
              const Icon = item.icon;
              const active = lastAction === item.id;
              const busy = busyAction === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => openSetting(item.id)}
                  style={[styles.actionButton, active ? styles.actionButtonActive : null, busy ? styles.actionButtonBusy : null]}
                >
                  <Icon size={21} color="#FFFFFF" />
                  <Text style={styles.actionText}>{busy ? text.opening : item.title}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.noDeviceCard}>
            <Text style={styles.noDeviceTitle}>{text.noDeviceTitle}</Text>
            {text.noDeviceSteps.map((item) => (
              <View key={item} style={styles.checkRow}>
                <CheckCircle2 size={18} color="#BAE6FD" />
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
            <View style={styles.quickActionRow}>
              <Pressable onPress={() => openSetting("wifi")} style={styles.quickActionButton}>
                <Wifi size={17} color="#FFFFFF" />
                <Text style={styles.quickActionText}>{text.openWifi}</Text>
              </Pressable>
              <Pressable onPress={() => openSetting("display")} style={styles.quickActionButton}>
                <Settings size={17} color="#FFFFFF" />
                <Text style={styles.quickActionText}>{text.openDisplay}</Text>
              </Pressable>
            </View>
          </View>

          {activeMode === "presentation" ? (
            <View style={styles.cardsGrid}>
              {text.cards.map((card) => (
                <View key={card.title} style={styles.presentationCard}>
                  <Text style={styles.presentationTitle}>{card.title}</Text>
                  <Text style={styles.presentationSubtitle}>{card.subtitle}</Text>
                  <View style={styles.presentationStatusPill}>
                    <CheckCircle2 size={14} color="#BBF7D0" />
                    <Text style={styles.presentationStatus}>{card.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.checkCard}>
              <Text style={styles.sectionTitle}>{text.checklistTitle}</Text>
              {text.checklist.map((item) => (
                <View key={item} style={styles.checkRow}>
                  <CheckCircle2 size={18} color="#BBF7D0" />
                  <Text style={styles.checkText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.statusCard}>
            {[
              text.statusLocal,
              text.statusSystem,
              text.statusNoFake,
              text.presentationLock,
            ].map((item) => (
              <View key={item} style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.fallbackCard}>
            <Router size={20} color="#BAE6FD" />
            <View style={styles.fallbackCopy}>
              <Text style={styles.fallbackTitle}>{text.fallbackTitle}</Text>
              <Text style={styles.fallbackText}>{text.fallbackText}</Text>
            </View>
          </View>

          <View style={styles.emergencyCard}>
            <Text style={styles.sectionTitle}>{text.emergencyTitle}</Text>
            {text.emergencySteps.map((item) => (
              <View key={item} style={styles.checkRow}>
                <CheckCircle2 size={18} color="#BFDBFE" />
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  advancedSearchCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(186,230,253,0.22)",
    backgroundColor: "rgba(5,32,46,0.58)",
  },
  advancedHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  advancedIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(14,165,233,0.20)",
  },
  advancedHeaderCopy: {
    flex: 1,
  },
  advancedTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "900",
  },
  advancedSubtitle: {
    marginTop: 3,
    color: "#B6D6E5",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  advancedStatusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  advancedStatusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  advancedStatusText: {
    color: "#E0F2FE",
    fontSize: 11,
    fontWeight: "800",
  },
  modelHintText: {
    marginTop: 10,
    color: "#A9C6D6",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  brandListCard: {
    marginTop: 12,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(15,23,42,0.42)",
    borderWidth: 1,
    borderColor: "rgba(186,230,253,0.16)",
  },
  brandListTitle: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "900",
  },
  brandListSubtitle: {
    marginTop: 4,
    color: "#B6D6E5",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  brandGroupsWrap: {
    marginTop: 10,
    gap: 8,
  },
  brandGroupBox: {
    borderRadius: 14,
    padding: 9,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  brandGroupTitle: {
    color: "#BAE6FD",
    fontSize: 11,
    fontWeight: "900",
  },
  brandChipWrap: {
    marginTop: 7,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  brandChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "rgba(186,230,253,0.11)",
    borderWidth: 1,
    borderColor: "rgba(186,230,253,0.16)",
  },
  brandChipText: {
    color: "#E0F2FE",
    fontSize: 10,
    fontWeight: "800",
  },
  brandExactNote: {
    marginTop: 10,
    color: "#A9C6D6",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "700",
  },
  advancedButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  secondaryScanButton: {
    flexGrow: 1,
    minHeight: 44,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(186,230,253,0.20)",
  },
  secondaryScanText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  scanModelsButton: {
    flexGrow: 1,
    minHeight: 44,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
    backgroundColor: "#BAE6FD",
  },
  scanModelsButtonBusy: {
    opacity: 0.72,
  },
  scanModelsText: {
    color: "#05202E",
    fontSize: 12,
    fontWeight: "900",
  },
  deviceListHeader: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  deviceListTitle: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "900",
  },
  deviceListCount: {
    color: "#BAE6FD",
    fontSize: 11,
    fontWeight: "900",
  },
  noModelFoundBox: {
    marginTop: 10,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(15,23,42,0.48)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  noModelFoundText: {
    color: "#C7DFEA",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  deviceResultCard: {
    marginTop: 10,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(2,132,199,0.15)",
    borderWidth: 1,
    borderColor: "rgba(186,230,253,0.18)",
  },
  deviceResultTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  deviceResultIcon: {
    width: 32,
    height: 32,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  deviceResultCopy: {
    flex: 1,
  },
  deviceResultName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  deviceResultMeta: {
    marginTop: 2,
    color: "#BEE7F8",
    fontSize: 11,
    fontWeight: "800",
  },
  tvCandidatePill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "rgba(187,247,208,0.16)",
    borderWidth: 1,
    borderColor: "rgba(187,247,208,0.22)",
  },
  tvCandidateText: {
    color: "#BBF7D0",
    fontSize: 10,
    fontWeight: "900",
  },
  deviceResultSmall: {
    marginTop: 6,
    color: "#A9C6D6",
    fontSize: 11,
    fontWeight: "700",
  },
  deviceActionRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  deviceConnectButton: {
    flex: 0.85,
    minHeight: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
  },
  deviceConnectText: {
    color: "#05202E",
    fontSize: 11,
    fontWeight: "900",
  },
  deviceCastButton: {
    flex: 1.15,
    minHeight: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  deviceCastText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.45,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#06111F",
  },
  background: {
    flex: 1,
  },
  glowTop: {
    position: "absolute",
    top: -90,
    right: -95,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: "rgba(125,211,252,0.18)",
  },
  glowBottom: {
    position: "absolute",
    left: -110,
    bottom: -110,
    width: 300,
    height: 300,
    borderRadius: 300,
    backgroundColor: "rgba(20,184,166,0.14)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    marginTop: 2,
    color: "rgba(226,244,255,0.74)",
    fontSize: 12,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 6,
    gap: 14,
  },
  stageCard: {
    borderRadius: 30,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  stageTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  stageIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  stageCopy: {
    flex: 1,
  },
  readyText: {
    color: "#BAE6FD",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  stageTitle: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
  },
  stageTitleCompact: {
    fontSize: 25,
    lineHeight: 29,
  },
  castDiagram: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  deviceBox: {
    flex: 1,
    minHeight: 96,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,18,30,0.42)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  deviceEmoji: {
    fontSize: 34,
  },
  deviceText: {
    marginTop: 7,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  signalWrap: {
    width: 78,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  signalLine: {
    width: 54,
    height: 2,
    borderRadius: 2,
    backgroundColor: "rgba(186,230,253,0.55)",
  },
  primaryCastButton: {
    marginTop: 18,
    minHeight: 58,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#BAE6FD",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.86)",
  },
  primaryCastButtonPressed: {
    transform: [{ scale: 0.985 }],
  },
  primaryCastButtonBusy: {
    opacity: 0.78,
  },
  primaryCastText: {
    color: "#05202E",
    fontSize: 16,
    fontWeight: "900",
  },
  liveStatusPill: {
    marginTop: 12,
    borderRadius: 18,
    paddingVertical: 9,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "rgba(5,18,30,0.36)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  liveStatusText: {
    flex: 1,
    color: "rgba(241,250,255,0.90)",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  nativeHealthRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  nativeHealthPill: {
    flexGrow: 1,
    flexBasis: "47%",
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: "rgba(5,18,30,0.34)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
  },
  nativeHealthPillGood: {
    backgroundColor: "rgba(34,197,94,0.18)",
    borderColor: "rgba(187,247,208,0.34)",
  },
  nativeHealthText: {
    color: "rgba(241,250,255,0.88)",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    textAlign: "center",
  },
  detectedDisplayCard: {
    marginTop: 10,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(34,197,94,0.16)",
    borderWidth: 1,
    borderColor: "rgba(187,247,208,0.30)",
  },
  detectedDisplayText: {
    flex: 1,
    color: "#DCFCE7",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  scanGuideCard: {
    marginTop: 14,
    borderRadius: 22,
    padding: 14,
    gap: 10,
    backgroundColor: "rgba(5,18,30,0.34)",
    borderWidth: 1,
    borderColor: "rgba(186,230,253,0.22)",
  },
  scanGuideTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  scanStepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(186,230,253,0.22)",
    borderWidth: 1,
    borderColor: "rgba(186,230,253,0.34)",
  },
  stepNumberText: {
    color: "#E0F2FE",
    fontSize: 11,
    fontWeight: "900",
  },
  scanStepText: {
    flex: 1,
    color: "rgba(241,250,255,0.86)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  confirmButton: {
    marginTop: 2,
    minHeight: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  confirmButtonActive: {
    backgroundColor: "#BAE6FD",
    borderColor: "rgba(255,255,255,0.80)",
  },
  confirmButtonText: {
    color: "#D9F4FF",
    fontSize: 12,
    fontWeight: "900",
  },
  confirmButtonTextActive: {
    color: "#05202E",
  },
  modeSwitch: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  modeButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  modeButtonActive: {
    backgroundColor: "#BAE6FD",
    borderColor: "rgba(255,255,255,0.80)",
  },
  modeText: {
    color: "#D9F4FF",
    fontSize: 12,
    fontWeight: "900",
  },
  modeTextActive: {
    color: "#05202E",
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionButton: {
    flexGrow: 1,
    flexBasis: "47%",
    minHeight: 62,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.17)",
  },
  actionButtonActive: {
    backgroundColor: "rgba(14,165,233,0.32)",
    borderColor: "rgba(186,230,253,0.62)",
  },
  actionButtonBusy: {
    opacity: 0.7,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  noDeviceCard: {
    borderRadius: 24,
    padding: 16,
    gap: 11,
    backgroundColor: "rgba(14,165,233,0.14)",
    borderWidth: 1,
    borderColor: "rgba(125,211,252,0.22)",
  },
  noDeviceTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  quickActionRow: {
    marginTop: 2,
    flexDirection: "row",
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.17)",
  },
  quickActionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  presentationCard: {
    width: "48.5%",
    minHeight: 128,
    borderRadius: 24,
    padding: 14,
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  presentationTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  presentationSubtitle: {
    marginTop: 5,
    color: "rgba(226,244,255,0.72)",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  presentationStatusPill: {
    alignSelf: "flex-start",
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 9,
    backgroundColor: "rgba(34,197,94,0.16)",
  },
  presentationStatus: {
    color: "#DCFCE7",
    fontSize: 11,
    fontWeight: "900",
  },
  checkCard: {
    borderRadius: 24,
    padding: 16,
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkText: {
    flex: 1,
    color: "rgba(241,250,255,0.86)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  statusCard: {
    borderRadius: 22,
    padding: 14,
    gap: 10,
    backgroundColor: "rgba(5,18,30,0.36)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#7DD3FC",
  },
  statusDotGood: {
    backgroundColor: "#22C55E",
  },
  statusText: {
    flex: 1,
    color: "rgba(241,250,255,0.84)",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  fallbackCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(14,165,233,0.16)",
    borderWidth: 1,
    borderColor: "rgba(125,211,252,0.24)",
  },
  fallbackCopy: {
    flex: 1,
  },
  fallbackTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  fallbackText: {
    marginTop: 4,
    color: "rgba(226,244,255,0.78)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  emergencyCard: {
    borderRadius: 24,
    padding: 16,
    gap: 12,
    backgroundColor: "rgba(37,99,235,0.18)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.24)",
  },
});
