import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113VLiveProductCleanupTechModeUiuxEvidence } from "./stream113vLiveProductCleanupTechModeUiuxRuntime";

export type Stream113WLiveLanguageCode =
  | "ru"
  | "en"
  | "uz"
  | "zh"
  | "kk"
  | "ky"
  | "tg"
  | "tk"
  | "tr"
  | "az"
  | "ar"
  | "fa"
  | "ur"
  | "hi"
  | "ko"
  | "ja"
  | "de"
  | "fr"
  | "es"
  | "pt"
  | "it"
  | "id"
  | "ms"
  | "vi"
  | "th";

export type Stream113WLiveLanguageI18nSectionId =
  | "language_registry_25"
  | "selected_language_copy"
  | "shared_live_terms"
  | "kernel_language_plain"
  | "profile_business_hooks_named"
  | "gifts_deferred_language"
  | "normal_ux_words_clean";

export type Stream113WLiveLanguageI18nSectionStatus = "copy_ready" | "needs_copy_polish";

export type Stream113WLiveLanguageCopy = {
  readonly language: Stream113WLiveLanguageCode;
  readonly nativeName: string;
  readonly title: string;
  readonly primary: string;
  readonly secondary: string;
  readonly safety: string;
};

export type Stream113WLiveLanguageI18nSection = {
  readonly id: Stream113WLiveLanguageI18nSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113WLiveLanguageI18nSectionStatus;
};

export type Stream113WLiveLanguageI18nKernelUiuxState = {
  readonly version: "STREAM-113W-FIX1";
  readonly selectedSectionId: Stream113WLiveLanguageI18nSectionId;
  readonly selectedLanguageCode: Stream113WLiveLanguageCode;
  readonly readySectionIds: readonly Stream113WLiveLanguageI18nSectionId[];
  readonly readyLanguageCodes: readonly Stream113WLiveLanguageCode[];
  readonly lastAction: string;
  readonly registry25ReadyLocal: boolean;
  readonly selectedLanguageCopyReadyLocal: boolean;
  readonly sharedLiveTermsReadyLocal: boolean;
  readonly normalUxWordsCleanLocal: boolean;
  readonly kernelLanguagePlainLocal: boolean;
  readonly profileBusinessHooksNamedLocal: boolean;
  readonly giftsDeferredLanguageLocal: boolean;
  readonly liveFirstOrderLocked: true;
  readonly allConnectionsThroughKernel: true;
  readonly directProviderConnectionAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly scatteredServiceConnectionAllowed: false;
  readonly separateProfileScreenCreatedNow: false;
  readonly separateBusinessScreenCreatedNow: false;
  readonly giftSendingImplementedNow: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
};

export type Stream113WLiveLanguageI18nKernelUiuxEvidence = {
  readonly version: "STREAM-113W-FIX1";
  readonly selectedSectionId: Stream113WLiveLanguageI18nSectionId;
  readonly selectedLanguageCode: Stream113WLiveLanguageCode;
  readonly languageScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly supportedLanguageCount: number;
  readonly readyLanguageCount: number;
  readonly minimumRequiredLanguageCount: 25;
  readonly registry25Ready: boolean;
  readonly sectionItems: readonly Stream113WLiveLanguageI18nSection[];
  readonly copyItems: readonly Stream113WLiveLanguageCopy[];
  readonly selectedCopy: Stream113WLiveLanguageCopy;
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly productSummary: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly languageCleanReady: boolean;
  readonly normalUxWordsClean: boolean;
  readonly previousProductCleanupReady: boolean;
  readonly kernelLanguageReady: boolean;
  readonly liveFirstOrderLocked: true;
  readonly allConnectionsThroughKernel: true;
  readonly directProviderConnectionAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly scatteredServiceConnectionAllowed: false;
  readonly separateProfileScreenCreatedNow: false;
  readonly separateBusinessScreenCreatedNow: false;
  readonly giftSendingImplementedNow: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
};

export const STREAM_113W_SUPPORTED_LANGUAGE_CODES: readonly Stream113WLiveLanguageCode[] = [
  "ru",
  "en",
  "uz",
  "zh",
  "kk",
  "ky",
  "tg",
  "tk",
  "tr",
  "az",
  "ar",
  "fa",
  "ur",
  "hi",
  "ko",
  "ja",
  "de",
  "fr",
  "es",
  "pt",
  "it",
  "id",
  "ms",
  "vi",
  "th",
];

const SECTION_ORDER: readonly Stream113WLiveLanguageI18nSectionId[] = [
  "language_registry_25",
  "selected_language_copy",
  "shared_live_terms",
  "normal_ux_words_clean",
  "kernel_language_plain",
  "profile_business_hooks_named",
  "gifts_deferred_language",
];

const SECTION_TITLES: Record<Stream113WLiveLanguageI18nSectionId, string> = {
  language_registry_25: "25-language registry",
  selected_language_copy: "Selected language copy",
  shared_live_terms: "Shared Live terms",
  normal_ux_words_clean: "Clean user wording",
  kernel_language_plain: "Kernel connection wording",
  profile_business_hooks_named: "Profile / Business hooks",
  gifts_deferred_language: "Gifts later wording",
};

const SECTION_DESCRIPTIONS: Record<Stream113WLiveLanguageI18nSectionId, string> = {
  language_registry_25: "Live language layer uses one shared registry with 25 supported languages instead of separate RU/EN/UZ/ZH-only blocks.",
  selected_language_copy: "Each language uses the same Live meaning: prepare room, check chat and people, keep launch behind kernel/provider.",
  shared_live_terms: "Core Live terms stay consistent across all languages: Live, chat, people, safety, co-host, battle, share, review.",
  normal_ux_words_clean: "Normal user screen uses product words only; internal check wording stays outside the main Live experience.",
  kernel_language_plain: "All connection text says the screen goes through core/kernel contracts/facades/events, never direct provider/realtime.",
  profile_business_hooks_named: "Future streamer profile and Business Stream hooks are named inside Live at the right time without creating those screens now.",
  gifts_deferred_language: "Gift sending is required later at the end of Stream, but current Live wording does not show fake send or payment.",
};

const COPY_ITEMS: readonly Stream113WLiveLanguageCopy[] = [
  { language: "ru", nativeName: "Русский", title: "Live готовится", primary: "Проверь эфир, чат, людей и безопасность перед запуском.", secondary: "Настоящий запуск проходит только через kernel и provider.", safety: "Sabi AI помогает контролировать 18+, ругательства, оскорбления и жалобы." },
  { language: "en", nativeName: "English", title: "Live is preparing", primary: "Check the room, chat, people, and safety before launch.", secondary: "Real launch goes only through the kernel and provider.", safety: "Sabi AI helps review 18+, profanity, insults, and reports." },
  { language: "uz", nativeName: "O‘zbek", title: "Live tayyorlanmoqda", primary: "Efir, chat, odamlar va xavfsizlikni tekshiring.", secondary: "Haqiqiy ishga tushirish faqat kernel va provider orqali bo‘ladi.", safety: "Sabi AI 18+, so‘kinish, haqorat va shikoyatlarni nazorat qilishga yordam beradi." },
  { language: "zh", nativeName: "中文", title: "直播准备中", primary: "开播前检查直播间、聊天、观众和安全状态。", secondary: "真正开播必须通过 kernel 和 provider。", safety: "Sabi AI 协助审核 18+、脏话、侮辱和举报。" },
  { language: "kk", nativeName: "Қазақша", title: "Live дайындалуда", primary: "Эфирді, чатты, адамдарды және қауіпсіздікті тексеріңіз.", secondary: "Нақты іске қосу тек kernel және provider арқылы өтеді.", safety: "Sabi AI 18+, балағат, қорлау және шағымдарды қарауға көмектеседі." },
  { language: "ky", nativeName: "Кыргызча", title: "Live даярдалууда", primary: "Эфирди, чатты, адамдарды жана коопсуздукту текшериңиз.", secondary: "Чыныгы ишке киргизүү kernel жана provider аркылуу гана болот.", safety: "Sabi AI 18+, сөгүнүү, кемсинтүү жана даттанууларды көзөмөлдөөгө жардам берет." },
  { language: "tg", nativeName: "Тоҷикӣ", title: "Live омода мешавад", primary: "Эфир, чат, одамон ва амниятро пеш аз оғоз санҷед.", secondary: "Оғози воқеӣ танҳо тавассути kernel ва provider мегузарад.", safety: "Sabi AI барои назорати 18+, дашном, таҳқир ва шикоятҳо кӯмак мекунад." },
  { language: "tk", nativeName: "Türkmençe", title: "Live taýýarlanýar", primary: "Efir, söhbet, adamlar we howpsuzlygy barlaň.", secondary: "Hakyky başlangyç diňe kernel we provider arkaly bolýar.", safety: "Sabi AI 18+, sögünç, kemsitme we arzalary gözden geçirmäge kömek edýär." },
  { language: "tr", nativeName: "Türkçe", title: "Live hazırlanıyor", primary: "Yayını, sohbeti, kişileri ve güvenliği kontrol edin.", secondary: "Gerçek başlatma yalnızca kernel ve provider üzerinden olur.", safety: "Sabi AI 18+, küfür, hakaret ve şikâyetleri incelemeye yardım eder." },
  { language: "az", nativeName: "Azərbaycanca", title: "Live hazırlanır", primary: "Efiri, çatı, insanları və təhlükəsizliyi yoxlayın.", secondary: "Həqiqi işə salma yalnız kernel və provider üzərindən olur.", safety: "Sabi AI 18+, söyüş, təhqir və şikayətləri yoxlamağa kömək edir." },
  { language: "ar", nativeName: "العربية", title: "البث قيد التحضير", primary: "تحقق من البث والدردشة والأشخاص والسلامة قبل البدء.", secondary: "التشغيل الحقيقي يتم فقط عبر kernel و provider.", safety: "يساعد Sabi AI في مراجعة 18+ والألفاظ المسيئة والإهانات والبلاغات." },
  { language: "fa", nativeName: "فارسی", title: "لایو در حال آماده‌سازی است", primary: "پیش از شروع، اتاق، چت، افراد و ایمنی را بررسی کنید.", secondary: "شروع واقعی فقط از مسیر kernel و provider انجام می‌شود.", safety: "Sabi AI در بررسی 18+، ناسزا، توهین و گزارش‌ها کمک می‌کند." },
  { language: "ur", nativeName: "اردو", title: "Live تیار ہو رہا ہے", primary: "شروع سے پہلے روم، چیٹ، لوگوں اور حفاظت کو چیک کریں۔", secondary: "اصل آغاز صرف kernel اور provider کے ذریعے ہوگا۔", safety: "Sabi AI 18+، گالی، توہین اور رپورٹس کا جائزہ لینے میں مدد کرتا ہے۔" },
  { language: "hi", nativeName: "हिन्दी", title: "Live तैयार हो रहा है", primary: "शुरू करने से पहले रूम, चैट, लोगों और सुरक्षा की जाँच करें।", secondary: "असली लॉन्च केवल kernel और provider से होगा।", safety: "Sabi AI 18+, गाली, अपमान और रिपोर्ट की समीक्षा में मदद करता है।" },
  { language: "ko", nativeName: "한국어", title: "Live 준비 중", primary: "시작 전에 방, 채팅, 사람, 안전 상태를 확인하세요.", secondary: "실제 시작은 kernel과 provider를 통해서만 진행됩니다.", safety: "Sabi AI는 18+, 욕설, 모욕, 신고 검토를 돕습니다." },
  { language: "ja", nativeName: "日本語", title: "Live 準備中", primary: "開始前にルーム、チャット、参加者、安全状態を確認してください。", secondary: "実際の開始は kernel と provider を通して行います。", safety: "Sabi AI は 18+、暴言、侮辱、通報の確認を支援します。" },
  { language: "de", nativeName: "Deutsch", title: "Live wird vorbereitet", primary: "Prüfe Raum, Chat, Personen und Sicherheit vor dem Start.", secondary: "Der echte Start läuft nur über Kernel und Provider.", safety: "Sabi AI hilft bei 18+, Schimpfwörtern, Beleidigungen und Meldungen." },
  { language: "fr", nativeName: "Français", title: "Live en préparation", primary: "Vérifiez la salle, le chat, les personnes et la sécurité avant le lancement.", secondary: "Le vrai lancement passe seulement par le kernel et le provider.", safety: "Sabi AI aide à examiner 18+, insultes, propos injurieux et signalements." },
  { language: "es", nativeName: "Español", title: "Live en preparación", primary: "Revisa la sala, el chat, las personas y la seguridad antes de iniciar.", secondary: "El inicio real pasa solo por kernel y provider.", safety: "Sabi AI ayuda a revisar 18+, groserías, insultos y reportes." },
  { language: "pt", nativeName: "Português", title: "Live em preparação", primary: "Verifique sala, chat, pessoas e segurança antes de iniciar.", secondary: "O início real passa apenas pelo kernel e provider.", safety: "Sabi AI ajuda a revisar 18+, palavrões, insultos e denúncias." },
  { language: "it", nativeName: "Italiano", title: "Live in preparazione", primary: "Controlla stanza, chat, persone e sicurezza prima di avviare.", secondary: "L’avvio reale passa solo da kernel e provider.", safety: "Sabi AI aiuta a rivedere 18+, parolacce, insulti e segnalazioni." },
  { language: "id", nativeName: "Indonesia", title: "Live sedang disiapkan", primary: "Periksa ruang, chat, orang, dan keamanan sebelum mulai.", secondary: "Peluncuran asli hanya lewat kernel dan provider.", safety: "Sabi AI membantu meninjau 18+, kata kasar, hinaan, dan laporan." },
  { language: "ms", nativeName: "Melayu", title: "Live sedang disediakan", primary: "Semak bilik, chat, orang dan keselamatan sebelum mula.", secondary: "Pelancaran sebenar hanya melalui kernel dan provider.", safety: "Sabi AI membantu menyemak 18+, kata kasar, penghinaan dan laporan." },
  { language: "vi", nativeName: "Tiếng Việt", title: "Live đang chuẩn bị", primary: "Kiểm tra phòng, chat, người xem và an toàn trước khi bắt đầu.", secondary: "Khởi chạy thật chỉ đi qua kernel và provider.", safety: "Sabi AI hỗ trợ kiểm tra 18+, chửi tục, xúc phạm và báo cáo." },
  { language: "th", nativeName: "ไทย", title: "กำลังเตรียม Live", primary: "ตรวจห้อง แชต ผู้คน และความปลอดภัยก่อนเริ่ม", secondary: "การเริ่มจริงต้องผ่าน kernel และ provider เท่านั้น", safety: "Sabi AI ช่วยตรวจ 18+, คำหยาบ การดูหมิ่น และรายงาน" },
];

const COPY_BY_LANGUAGE: Record<Stream113WLiveLanguageCode, Stream113WLiveLanguageCopy> = COPY_ITEMS.reduce((acc, item) => ({ ...acc, [item.language]: item }), {} as Record<Stream113WLiveLanguageCode, Stream113WLiveLanguageCopy>);

export function createInitialStream113WLiveLanguageI18nKernelUiuxState(): Stream113WLiveLanguageI18nKernelUiuxState {
  return {
    version: "STREAM-113W-FIX1",
    selectedSectionId: "language_registry_25",
    selectedLanguageCode: "ru",
    readySectionIds: ["normal_ux_words_clean", "kernel_language_plain", "gifts_deferred_language"],
    readyLanguageCodes: ["ru", "en", "uz", "zh"],
    lastAction: "113W-FIX1 начал общий языковой слой Live: один registry на 25 языков, без ручного RU/EN/UZ/ZH-only пути.",
    registry25ReadyLocal: false,
    selectedLanguageCopyReadyLocal: false,
    sharedLiveTermsReadyLocal: false,
    normalUxWordsCleanLocal: true,
    kernelLanguagePlainLocal: true,
    profileBusinessHooksNamedLocal: false,
    giftsDeferredLanguageLocal: true,
    liveFirstOrderLocked: true,
    allConnectionsThroughKernel: true,
    directProviderConnectionAllowed: false,
    directRealtimeConnectionAllowed: false,
    scatteredServiceConnectionAllowed: false,
    separateProfileScreenCreatedNow: false,
    separateBusinessScreenCreatedNow: false,
    giftSendingImplementedNow: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
  };
}

export function selectStream113WLiveLanguageI18nSection(
  state: Stream113WLiveLanguageI18nKernelUiuxState,
  selectedSectionId: Stream113WLiveLanguageI18nSectionId,
): Stream113WLiveLanguageI18nKernelUiuxState {
  return { ...state, selectedSectionId, lastAction: `Открыт 113W-FIX1 language section: ${SECTION_TITLES[selectedSectionId]}.` };
}

export function selectStream113WLiveLanguageCode(
  state: Stream113WLiveLanguageI18nKernelUiuxState,
  selectedLanguageCode: Stream113WLiveLanguageCode,
): Stream113WLiveLanguageI18nKernelUiuxState {
  const copy = COPY_BY_LANGUAGE[selectedLanguageCode];
  return {
    ...state,
    selectedLanguageCode,
    selectedSectionId: "selected_language_copy",
    lastAction: `Выбран язык Live: ${copy.nativeName} (${selectedLanguageCode.toUpperCase()}).`,
  };
}

export function markStream113WLiveLanguageI18nSectionReady(
  state: Stream113WLiveLanguageI18nKernelUiuxState,
  sectionId: Stream113WLiveLanguageI18nSectionId,
  action: string,
): Stream113WLiveLanguageI18nKernelUiuxState {
  const readySectionIds = state.readySectionIds.includes(sectionId) ? state.readySectionIds : [...state.readySectionIds, sectionId];
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds,
    lastAction: action,
    registry25ReadyLocal: state.registry25ReadyLocal || sectionId === "language_registry_25",
    selectedLanguageCopyReadyLocal: state.selectedLanguageCopyReadyLocal || sectionId === "selected_language_copy",
    sharedLiveTermsReadyLocal: state.sharedLiveTermsReadyLocal || sectionId === "shared_live_terms",
    normalUxWordsCleanLocal: state.normalUxWordsCleanLocal || sectionId === "normal_ux_words_clean",
    kernelLanguagePlainLocal: state.kernelLanguagePlainLocal || sectionId === "kernel_language_plain",
    profileBusinessHooksNamedLocal: state.profileBusinessHooksNamedLocal || sectionId === "profile_business_hooks_named",
    giftsDeferredLanguageLocal: state.giftsDeferredLanguageLocal || sectionId === "gifts_deferred_language",
  };
}

export function markStream113WLiveLanguageI18nAllReady(
  state: Stream113WLiveLanguageI18nKernelUiuxState,
  action: string,
): Stream113WLiveLanguageI18nKernelUiuxState {
  return {
    ...state,
    selectedSectionId: "language_registry_25",
    readySectionIds: SECTION_ORDER,
    readyLanguageCodes: STREAM_113W_SUPPORTED_LANGUAGE_CODES,
    lastAction: action,
    registry25ReadyLocal: true,
    selectedLanguageCopyReadyLocal: true,
    sharedLiveTermsReadyLocal: true,
    normalUxWordsCleanLocal: true,
    kernelLanguagePlainLocal: true,
    profileBusinessHooksNamedLocal: true,
    giftsDeferredLanguageLocal: true,
  };
}

function buildSections(readySectionIds: readonly Stream113WLiveLanguageI18nSectionId[]): readonly Stream113WLiveLanguageI18nSection[] {
  return SECTION_ORDER.map((id) => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: readySectionIds.includes(id) ? "copy_ready" : "needs_copy_polish",
  }));
}

export function buildStream113WLiveLanguageI18nKernelUiuxEvidence(
  state: Stream113WLiveLanguageI18nKernelUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  productCleanup: Stream113VLiveProductCleanupTechModeUiuxEvidence,
): Stream113WLiveLanguageI18nKernelUiuxEvidence {
  const sectionItems = buildSections(state.readySectionIds);
  const readySections = sectionItems.filter((item) => item.status === "copy_ready").length;
  const totalSections = SECTION_ORDER.length;
  const supportedLanguageCount = STREAM_113W_SUPPORTED_LANGUAGE_CODES.length;
  const registry25Ready = supportedLanguageCount >= 25 && state.registry25ReadyLocal;
  const readyLanguageCount = state.readyLanguageCodes.filter((code) => STREAM_113W_SUPPORTED_LANGUAGE_CODES.includes(code)).length;
  const sectionScore = Math.round((readySections / totalSections) * 60);
  const languageScorePart = Math.round((readyLanguageCount / supportedLanguageCount) * 40);
  const languageScore = Math.min(100, sectionScore + languageScorePart);
  const selected = sectionItems.find((item) => item.id === state.selectedSectionId) || sectionItems[0];
  const selectedCopy = COPY_BY_LANGUAGE[state.selectedLanguageCode] || COPY_BY_LANGUAGE.ru;
  const previousProductCleanupReady = productCleanup.cleanProductModeReady && productCleanup.allConnectionsThroughKernel;
  const kernelLanguageReady = state.kernelLanguagePlainLocal && state.allConnectionsThroughKernel && !state.directProviderConnectionAllowed && !state.directRealtimeConnectionAllowed;
  const languageCleanReady = readySections === totalSections && registry25Ready && readyLanguageCount === supportedLanguageCount && previousProductCleanupReady && kernelLanguageReady;
  const roomTitle = room.title || "Sabi Live";
  const stageLabel = stage.status === "broadcast_handoff_blocked" ? "preview через kernel" : "language layer ready";

  return {
    version: "STREAM-113W-FIX1",
    selectedSectionId: state.selectedSectionId,
    selectedLanguageCode: state.selectedLanguageCode,
    languageScore,
    readySections,
    totalSections,
    supportedLanguageCount,
    readyLanguageCount,
    minimumRequiredLanguageCount: 25,
    registry25Ready,
    sectionItems,
    copyItems: COPY_ITEMS,
    selectedCopy,
    heroTitle: languageCleanReady ? "Live language layer готов: 25 языков" : "Исправляем Live language layer на 25 языков",
    heroSubtitle: "Один общий registry на 25 языков, общий Live wording, kernel-only connections, profile/business hooks вовремя, gifts только в конце Stream.",
    phoneStatus: `${roomTitle} · ${stageLabel} · ${selectedCopy.nativeName}`,
    activeTitle: `${selectedCopy.language.toUpperCase()} · ${selectedCopy.title}`,
    activeNarrative: selected.description,
    productSummary: `${selectedCopy.primary} ${selectedCopy.secondary}`,
    primaryAction: languageCleanReady ? "Дальше: Live presentation polish without changing language architecture." : `Закрой общий слой: ${selected.title}`,
    secondaryAction: state.lastAction,
    languageCleanReady,
    normalUxWordsClean: state.normalUxWordsCleanLocal,
    previousProductCleanupReady,
    kernelLanguageReady,
    liveFirstOrderLocked: true,
    allConnectionsThroughKernel: true,
    directProviderConnectionAllowed: false,
    directRealtimeConnectionAllowed: false,
    scatteredServiceConnectionAllowed: false,
    separateProfileScreenCreatedNow: false,
    separateBusinessScreenCreatedNow: false,
    giftSendingImplementedNow: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
  };
}
