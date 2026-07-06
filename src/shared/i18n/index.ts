import { useMemo, useSyncExternalStore } from "react";
import { I18nManager } from "react-native";

import { appStorage, STORAGE_KEYS } from "../storage/app-storage";
import {
  LANGUAGES,
  type SupportedLanguageCode,
} from "../data/languages";
import BASE_TRANSLATIONS from "./base-translations";
import { loadLocaleTree } from "./locales/loader";
import { getProfileMainTranslationOverride } from "./profile-main-overrides";

export type TranslationLanguage = SupportedLanguageCode;
export type TranslationParams = Record<
  string,
  string | number | boolean | null | undefined
>;

type TranslationTree = Record<string, unknown>;

const FALLBACK_LANGUAGE: TranslationLanguage = "en";
const listeners = new Set<() => void>();
const loadedLocales: Partial<Record<TranslationLanguage, TranslationTree>> = {};
const pendingLocaleLoads: Partial<Record<TranslationLanguage, Promise<TranslationTree>>> = {};

let currentLanguage: TranslationLanguage = FALLBACK_LANGUAGE;
let didHydrateLanguage = false;
let hydrationPromise: Promise<TranslationLanguage> | null = null;
let i18nRevision = 0;

function normalizeCode(input?: string | null): string {
  return String(input || "")
    .trim()
    .replace(/_/g, "-")
    .toLowerCase();
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getByPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!isObject(acc)) return undefined;
    return acc[key];
  }, source);
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;

  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const value = params[key.trim()];
    return value === null || value === undefined ? "" : String(value);
  });
}

function resolveSupportedLanguage(input?: string | null): TranslationLanguage {
  const normalized = normalizeCode(input);
  if (!normalized) return FALLBACK_LANGUAGE;

  const exact = LANGUAGES.find(
    (item) => normalizeCode(item.code) === normalized,
  );
  if (exact) return exact.code as TranslationLanguage;

  const base = normalized.split("-")[0];
  const baseMatch = LANGUAGES.find(
    (item) => normalizeCode(item.code) === base,
  );
  if (baseMatch) return baseMatch.code as TranslationLanguage;

  return FALLBACK_LANGUAGE;
}

function isRTL(code: string): boolean {
  const normalized = normalizeCode(code);
  return (
    normalized === "ar" ||
    normalized === "ur" ||
    normalized === "ps" ||
    normalized === "fa-af"
  );
}

async function loadLanguageLocale(language: TranslationLanguage): Promise<TranslationTree> {
  const loaded = loadedLocales[language];
  if (loaded) return loaded;

  const pending = pendingLocaleLoads[language];
  if (pending) return pending;

  const nextLoad = loadLocaleTree(language)
    .then((locale) => {
      loadedLocales[language] = locale;
      return locale;
    })
    .finally(() => {
      delete pendingLocaleLoads[language];
    });

  pendingLocaleLoads[language] = nextLoad;
  return nextLoad;
}

function ensureLocaleLoaded(language: TranslationLanguage) {
  if (loadedLocales[language] || pendingLocaleLoads[language]) return;

  void loadLanguageLocale(language)
    .then(() => {
      emitChange();
    })
    .catch(() => {
      // Keep the synchronous base translations if a lazy chunk cannot be loaded.
    });
}

function getLocale(language: TranslationLanguage): TranslationTree {
  const loaded = loadedLocales[language];
  if (loaded) return loaded;

  ensureLocaleLoaded(language);
  return BASE_TRANSLATIONS as TranslationTree;
}

const SABI_MESSENGER_GROUP_MENU_TRANSLATIONS: Partial<Record<TranslationLanguage, TranslationTree>> = {
  "en": {
    "sabiMessengerGroupMenu": {"groupAddMember": "Add member", "groupAddMemberSubtitle": "Invite a user to this group", "groupInvite": "Invite link", "groupInviteSubtitle": "Open group invite link", "groupShare": "Share group", "groupShareSubtitle": "Share this group", "groupInviteReady": "Invite link", "groupInviteMissing": "Invite link is not ready", "groupShareReady": "Group shared"},
  },
  "ru": {
    "sabiMessengerGroupMenu": {"groupAddMember": "Добавить участника", "groupAddMemberSubtitle": "Пригласить пользователя в эту группу", "groupInvite": "Ссылка приглашения", "groupInviteSubtitle": "Открыть ссылку приглашения", "groupShare": "Поделиться группой", "groupShareSubtitle": "Поделиться этой группой", "groupInviteReady": "Ссылка приглашения", "groupInviteMissing": "Ссылка приглашения не готова", "groupShareReady": "Группа отправлена"},
  },
  "zh": {
    "sabiMessengerGroupMenu": {"groupAddMember": "添加成员", "groupAddMemberSubtitle": "邀请用户加入此群组", "groupInvite": "邀请链接", "groupInviteSubtitle": "打开群组邀请链接", "groupShare": "分享群组", "groupShareSubtitle": "分享此群组", "groupInviteReady": "邀请链接", "groupInviteMissing": "邀请链接尚未就绪", "groupShareReady": "群组已分享"},
  },
  "ko": {
    "sabiMessengerGroupMenu": {"groupAddMember": "멤버 추가", "groupAddMemberSubtitle": "이 그룹에 사용자 초대", "groupInvite": "초대 링크", "groupInviteSubtitle": "그룹 초대 링크 열기", "groupShare": "그룹 공유", "groupShareSubtitle": "이 그룹 공유", "groupInviteReady": "초대 링크", "groupInviteMissing": "초대 링크가 준비되지 않았습니다", "groupShareReady": "그룹이 공유되었습니다"},
  },
  "ja": {
    "sabiMessengerGroupMenu": {"groupAddMember": "メンバーを追加", "groupAddMemberSubtitle": "このグループにユーザーを招待", "groupInvite": "招待リンク", "groupInviteSubtitle": "グループ招待リンクを開く", "groupShare": "グループを共有", "groupShareSubtitle": "このグループを共有", "groupInviteReady": "招待リンク", "groupInviteMissing": "招待リンクはまだ準備できていません", "groupShareReady": "グループを共有しました"},
  },
  "uz": {
    "sabiMessengerGroupMenu": {"groupAddMember": "Ishtirokchi qo‘shish", "groupAddMemberSubtitle": "Foydalanuvchini guruhga taklif qilish", "groupInvite": "Taklif havolasi", "groupInviteSubtitle": "Guruh taklif havolasini ochish", "groupShare": "Guruhni ulashish", "groupShareSubtitle": "Bu guruhni ulashish", "groupInviteReady": "Taklif havolasi", "groupInviteMissing": "Taklif havolasi tayyor emas", "groupShareReady": "Guruh ulashildi"},
  },
  "tg": {
    "sabiMessengerGroupMenu": {"groupAddMember": "Иштирокчӣ илова кардан", "groupAddMemberSubtitle": "Корбарро ба гурӯҳ даъват кардан", "groupInvite": "Пайванди даъват", "groupInviteSubtitle": "Пайванди даъвати гурӯҳро кушодан", "groupShare": "Гурӯҳро мубодила кардан", "groupShareSubtitle": "Ин гурӯҳро мубодила кардан", "groupInviteReady": "Пайванди даъват", "groupInviteMissing": "Пайванди даъват омода нест", "groupShareReady": "Гурӯҳ мубодила шуд"},
  },
  "ky": {
    "sabiMessengerGroupMenu": {"groupAddMember": "Катышуучу кошуу", "groupAddMemberSubtitle": "Колдонуучуну топко чакыруу", "groupInvite": "Чакыруу шилтемеси", "groupInviteSubtitle": "Топ чакыруу шилтемесин ачуу", "groupShare": "Топту бөлүшүү", "groupShareSubtitle": "Бул топту бөлүшүү", "groupInviteReady": "Чакыруу шилтемеси", "groupInviteMissing": "Чакыруу шилтемеси даяр эмес", "groupShareReady": "Топ бөлүшүлдү"},
  },
  "kk": {
    "sabiMessengerGroupMenu": {"groupAddMember": "Қатысушы қосу", "groupAddMemberSubtitle": "Пайдаланушыны топқа шақыру", "groupInvite": "Шақыру сілтемесі", "groupInviteSubtitle": "Топ шақыру сілтемесін ашу", "groupShare": "Топпен бөлісу", "groupShareSubtitle": "Осы топпен бөлісу", "groupInviteReady": "Шақыру сілтемесі", "groupInviteMissing": "Шақыру сілтемесі дайын емес", "groupShareReady": "Топ бөлісілді"},
  },
  "fa-AF": {
    "sabiMessengerGroupMenu": {"groupAddMember": "افزودن عضو", "groupAddMemberSubtitle": "دعوت کاربر به این گروه", "groupInvite": "پیوند دعوت", "groupInviteSubtitle": "باز کردن پیوند دعوت گروه", "groupShare": "اشتراک‌گذاری گروه", "groupShareSubtitle": "اشتراک‌گذاری این گروه", "groupInviteReady": "پیوند دعوت", "groupInviteMissing": "پیوند دعوت آماده نیست", "groupShareReady": "گروه اشتراک شد"},
  },
  "ps": {
    "sabiMessengerGroupMenu": {"groupAddMember": "غړی زیاتول", "groupAddMemberSubtitle": "کاروونکی دې ډلې ته راوبلئ", "groupInvite": "د بلنې لینک", "groupInviteSubtitle": "د ډلې بلنې لینک پرانیزئ", "groupShare": "ډله شریکه کړئ", "groupShareSubtitle": "دا ډله شریکه کړئ", "groupInviteReady": "د بلنې لینک", "groupInviteMissing": "د بلنې لینک چمتو نه دی", "groupShareReady": "ډله شریکه شوه"},
  },
  "tk": {
    "sabiMessengerGroupMenu": {"groupAddMember": "Agza goş", "groupAddMemberSubtitle": "Ulanyjyny bu topara çagyr", "groupInvite": "Çakylyk salgysy", "groupInviteSubtitle": "Topar çakylyk salgysyny aç", "groupShare": "Topary paýlaş", "groupShareSubtitle": "Bu topary paýlaş", "groupInviteReady": "Çakylyk salgysy", "groupInviteMissing": "Çakylyk salgysy taýýar däl", "groupShareReady": "Topar paýlaşyldy"},
  },
  "az": {
    "sabiMessengerGroupMenu": {"groupAddMember": "Üzv əlavə et", "groupAddMemberSubtitle": "İstifadəçini bu qrupa dəvət et", "groupInvite": "Dəvət linki", "groupInviteSubtitle": "Qrup dəvət linkini aç", "groupShare": "Qrupu paylaş", "groupShareSubtitle": "Bu qrupu paylaş", "groupInviteReady": "Dəvət linki", "groupInviteMissing": "Dəvət linki hazır deyil", "groupShareReady": "Qrup paylaşıldı"},
  },
  "tr": {
    "sabiMessengerGroupMenu": {"groupAddMember": "Üye ekle", "groupAddMemberSubtitle": "Bu gruba kullanıcı davet et", "groupInvite": "Davet bağlantısı", "groupInviteSubtitle": "Grup davet bağlantısını aç", "groupShare": "Grubu paylaş", "groupShareSubtitle": "Bu grubu paylaş", "groupInviteReady": "Davet bağlantısı", "groupInviteMissing": "Davet bağlantısı hazır değil", "groupShareReady": "Grup paylaşıldı"},
  },
  "hi": {
    "sabiMessengerGroupMenu": {"groupAddMember": "सदस्य जोड़ें", "groupAddMemberSubtitle": "इस समूह में उपयोगकर्ता को आमंत्रित करें", "groupInvite": "आमंत्रण लिंक", "groupInviteSubtitle": "समूह आमंत्रण लिंक खोलें", "groupShare": "समूह साझा करें", "groupShareSubtitle": "इस समूह को साझा करें", "groupInviteReady": "आमंत्रण लिंक", "groupInviteMissing": "आमंत्रण लिंक तैयार नहीं है", "groupShareReady": "समूह साझा किया गया"},
  },
  "ur": {
    "sabiMessengerGroupMenu": {"groupAddMember": "رکن شامل کریں", "groupAddMemberSubtitle": "اس گروپ میں صارف کو دعوت دیں", "groupInvite": "دعوتی لنک", "groupInviteSubtitle": "گروپ دعوتی لنک کھولیں", "groupShare": "گروپ شیئر کریں", "groupShareSubtitle": "یہ گروپ شیئر کریں", "groupInviteReady": "دعوتی لنک", "groupInviteMissing": "دعوتی لنک تیار نہیں", "groupShareReady": "گروپ شیئر ہوگیا"},
  },
  "ar": {
    "sabiMessengerGroupMenu": {"groupAddMember": "إضافة عضو", "groupAddMemberSubtitle": "دعوة مستخدم إلى هذه المجموعة", "groupInvite": "رابط الدعوة", "groupInviteSubtitle": "فتح رابط دعوة المجموعة", "groupShare": "مشاركة المجموعة", "groupShareSubtitle": "مشاركة هذه المجموعة", "groupInviteReady": "رابط الدعوة", "groupInviteMissing": "رابط الدعوة غير جاهز", "groupShareReady": "تمت مشاركة المجموعة"},
  },
  "be": {
    "sabiMessengerGroupMenu": {"groupAddMember": "Дадаць удзельніка", "groupAddMemberSubtitle": "Запрасіць карыстальніка ў гэтую групу", "groupInvite": "Спасылка запрашэння", "groupInviteSubtitle": "Адкрыць спасылку запрашэння групы", "groupShare": "Падзяліцца групай", "groupShareSubtitle": "Падзяліцца гэтай групай", "groupInviteReady": "Спасылка запрашэння", "groupInviteMissing": "Спасылка запрашэння не гатовая", "groupShareReady": "Група абагулена"},
  },
  "uk": {
    "sabiMessengerGroupMenu": {"groupAddMember": "Додати учасника", "groupAddMemberSubtitle": "Запросити користувача до цієї групи", "groupInvite": "Посилання запрошення", "groupInviteSubtitle": "Відкрити посилання запрошення групи", "groupShare": "Поділитися групою", "groupShareSubtitle": "Поділитися цією групою", "groupInviteReady": "Посилання запрошення", "groupInviteMissing": "Посилання запрошення не готове", "groupShareReady": "Групою поділилися"},
  },
  "de": {
    "sabiMessengerGroupMenu": {"groupAddMember": "Mitglied hinzufügen", "groupAddMemberSubtitle": "Benutzer in diese Gruppe einladen", "groupInvite": "Einladungslink", "groupInviteSubtitle": "Gruppeneinladungslink öffnen", "groupShare": "Gruppe teilen", "groupShareSubtitle": "Diese Gruppe teilen", "groupInviteReady": "Einladungslink", "groupInviteMissing": "Einladungslink ist nicht bereit", "groupShareReady": "Gruppe geteilt"},
  },
  "th": {
    "sabiMessengerGroupMenu": {"groupAddMember": "เพิ่มสมาชิก", "groupAddMemberSubtitle": "เชิญผู้ใช้เข้ากลุ่มนี้", "groupInvite": "ลิงก์เชิญ", "groupInviteSubtitle": "เปิดลิงก์เชิญกลุ่ม", "groupShare": "แชร์กลุ่ม", "groupShareSubtitle": "แชร์กลุ่มนี้", "groupInviteReady": "ลิงก์เชิญ", "groupInviteMissing": "ลิงก์เชิญยังไม่พร้อม", "groupShareReady": "แชร์กลุ่มแล้ว"},
  },
  "sw": {
    "sabiMessengerGroupMenu": {"groupAddMember": "Ongeza mshiriki", "groupAddMemberSubtitle": "Mwalike mtumiaji kwenye kikundi hiki", "groupInvite": "Kiungo cha mwaliko", "groupInviteSubtitle": "Fungua kiungo cha mwaliko wa kikundi", "groupShare": "Shiriki kikundi", "groupShareSubtitle": "Shiriki kikundi hiki", "groupInviteReady": "Kiungo cha mwaliko", "groupInviteMissing": "Kiungo cha mwaliko hakiko tayari", "groupShareReady": "Kikundi kimeshirikiwa"},
  },
  "am": {
    "sabiMessengerGroupMenu": {"groupAddMember": "አባል ጨምር", "groupAddMemberSubtitle": "ተጠቃሚን ወደዚህ ቡድን ጋብዝ", "groupInvite": "የግብዣ አገናኝ", "groupInviteSubtitle": "የቡድን ግብዣ አገናኝ ክፈት", "groupShare": "ቡድኑን አጋራ", "groupShareSubtitle": "ይህን ቡድን አጋራ", "groupInviteReady": "የግብዣ አገናኝ", "groupInviteMissing": "የግብዣ አገናኝ ዝግጁ አይደለም", "groupShareReady": "ቡድኑ ተጋርቷል"},
  },
  "af": {
    "sabiMessengerGroupMenu": {"groupAddMember": "Voeg lid by", "groupAddMemberSubtitle": "Nooi 'n gebruiker na hierdie groep", "groupInvite": "Uitnodigingskakel", "groupInviteSubtitle": "Maak groepuitnodigingskakel oop", "groupShare": "Deel groep", "groupShareSubtitle": "Deel hierdie groep", "groupInviteReady": "Uitnodigingskakel", "groupInviteMissing": "Uitnodigingskakel is nie gereed nie", "groupShareReady": "Groep gedeel"},
  },
  "hy": {
    "sabiMessengerGroupMenu": {"groupAddMember": "Ավելացնել անդամ", "groupAddMemberSubtitle": "Հրավիրել օգտատիրոջը այս խումբ", "groupInvite": "Հրավերի հղում", "groupInviteSubtitle": "Բացել խմբի հրավերի հղումը", "groupShare": "Կիսվել խմբով", "groupShareSubtitle": "Կիսվել այս խմբով", "groupInviteReady": "Հրավերի հղում", "groupInviteMissing": "Հրավերի հղումը պատրաստ չէ", "groupShareReady": "Խումբը կիսվել է"},
  },
};

function emitChange() {
  i18nRevision += 1;
  listeners.forEach((listener) => listener());
}

async function readStoredLanguage(): Promise<TranslationLanguage> {
  try {
    const storedValue = await Promise.resolve(
      appStorage.getString(STORAGE_KEYS.language),
    );

    return resolveSupportedLanguage(
      typeof storedValue === "string" ? storedValue : undefined,
    );
  } catch {
    return FALLBACK_LANGUAGE;
  }
}

export async function prepareI18nLanguage(): Promise<TranslationLanguage> {
  if (hydrationPromise) return hydrationPromise;

  hydrationPromise = (async () => {
    const nextLanguage = await readStoredLanguage();
    await loadLanguageLocale(nextLanguage);

    currentLanguage = nextLanguage;
    didHydrateLanguage = true;
    emitChange();

    return nextLanguage;
  })().catch((error) => {
    hydrationPromise = null;
    didHydrateLanguage = true;
    throw error;
  });

  return hydrationPromise;
}

function hydrateStoredLanguage() {
  if (didHydrateLanguage || hydrationPromise) return;
  void prepareI18nLanguage().catch(() => {
    // Ignore storage/lazy-load errors and keep base translations until retry.
  });
}

export function isI18nLanguageReady(): boolean {
  return Boolean(loadedLocales[currentLanguage]);
}

function subscribe(listener: () => void) {
  hydrateStoredLanguage();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getAppLanguage(): TranslationLanguage {
  hydrateStoredLanguage();
  return currentLanguage;
}

export async function setAppLanguage(
  language: string,
): Promise<TranslationLanguage> {
  const nextLanguage = resolveSupportedLanguage(language);

  await loadLanguageLocale(nextLanguage);

  if (nextLanguage !== currentLanguage) {
    currentLanguage = nextLanguage;
    didHydrateLanguage = true;
    emitChange();
  }

  try {
    await Promise.resolve(
      appStorage.setString(STORAGE_KEYS.language, nextLanguage),
    );
  } catch {
    // Keep runtime language even if persisting fails.
  }

  return nextLanguage;
}

export function t(key: string, params?: TranslationParams): string {
  const profileMainOverride = getProfileMainTranslationOverride(currentLanguage, key);
  if (typeof profileMainOverride === "string") {
    return interpolate(profileMainOverride, params);
  }

  const activeLocale = getLocale(currentLanguage);
  const activeValue = getByPath(activeLocale, key);

  if (typeof activeValue === "string") {
    return interpolate(activeValue, params);
  }

  const fallbackValue = getByPath(BASE_TRANSLATIONS, key);
  if (typeof fallbackValue === "string") {
    return interpolate(fallbackValue, params);
  }

  return key;
}

function getI18nSnapshot(): string {
  hydrateStoredLanguage();
  return `${currentLanguage}:${i18nRevision}`;
}

export function useI18n() {
  const snapshot = useSyncExternalStore(subscribe, getI18nSnapshot, getI18nSnapshot);
  const language = snapshot.split(":")[0] as TranslationLanguage;

  return useMemo(() => {
    const direction = isRTL(language) ? "rtl" : "ltr";

    return {
      language,
      direction,
      isRTL: direction === "rtl" || I18nManager.isRTL,
      t: (key: string, params?: TranslationParams) => t(key, params),
      languages: LANGUAGES,
      setLanguage: setAppLanguage,
    };
  }, [language]);
}

export default useI18n;
