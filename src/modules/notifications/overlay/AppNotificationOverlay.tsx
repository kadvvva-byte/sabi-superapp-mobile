import { router, usePathname } from "expo-router";
import { Bell, MessageCircle, PhoneMissed, WalletCards, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { DeviceEventEmitter, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Audio } from "expo-av";

import { getAuthSessionState, subscribeAuthSessionState } from "../../../core/kernel/auth/session.store";
import { useI18n } from "../../../shared/i18n";
import { pickRuntimeDictionary } from "../../../shared/i18n/runtime-language";
import { RealtimeChannels, RealtimeEvents } from "../../../shared/realtime/realtime.channels";
import {
  getSuperAppSocket,
  joinRealtimeChannel,
  joinWalletCoreChannel,
  leaveRealtimeChannel,
  leaveWalletCoreChannel,
} from "../../../shared/realtime/superapp-socket";
import {
  clearAppOverlayNotificationCounters,
  getAppOverlayNotificationState,
  pushAppOverlayNotification,
  subscribeAppOverlayNotificationState,
  type AppOverlayNotificationKind,
} from "./app-notification-overlay-store";
import { resolveSabiSoundForKind } from "../sounds/sabiSoundPreferences";
import type { SabiNotificationSoundKind } from "../sounds/sabiNotificationSounds";

type OverlayTexts = {
  messages: string;
  missed: string;
  money: string;
  newMessage: string;
  newMessageBody: string;
  missedCall: string;
  missedCallBody: string;
  moneyReceived: string;
  moneyReceivedBody: string;
  walletUpdate: string;
  open: string;
  close: string;
};

const OVERLAY_TEXTS: Record<string, OverlayTexts> = {
  en: {
    messages: "Messages",
    missed: "Missed",
    money: "Money",
    newMessage: "New message",
    newMessageBody: "You have an unread message",
    missedCall: "Missed call",
    missedCallBody: "You missed a call",
    moneyReceived: "Money received",
    moneyReceivedBody: "Incoming wallet transfer",
    walletUpdate: "Wallet update",
    open: "Open",
    close: "Close",
  },
  ru: {
    messages: "Сообщения",
    missed: "Пропущено",
    money: "Деньги",
    newMessage: "Новое сообщение",
    newMessageBody: "У вас есть непрочитанное сообщение",
    missedCall: "Пропущенный звонок",
    missedCallBody: "Вы пропустили звонок",
    moneyReceived: "Поступление денег",
    moneyReceivedBody: "Входящий перевод в Wallet",
    walletUpdate: "Обновление Wallet",
    open: "Открыть",
    close: "Закрыть",
  },
  uz: {
    messages: "Xabarlar",
    missed: "O‘tkazib yuborildi",
    money: "Pul",
    newMessage: "Yangi xabar",
    newMessageBody: "Sizda o‘qilmagan xabar bor",
    missedCall: "O‘tkazib yuborilgan qo‘ng‘iroq",
    missedCallBody: "Siz qo‘ng‘iroqni o‘tkazib yubordingiz",
    moneyReceived: "Pul kelib tushdi",
    moneyReceivedBody: "Walletga kiruvchi o‘tkazma",
    walletUpdate: "Wallet yangilandi",
    open: "Ochish",
    close: "Yopish",
  },
  tg: {
    messages: "Паёмҳо",
    missed: "Гузаронда",
    money: "Пул",
    newMessage: "Паёми нав",
    newMessageBody: "Шумо паёми нохонда доред",
    missedCall: "Занги беҷавоб",
    missedCallBody: "Шумо зангро аз даст додед",
    moneyReceived: "Пул ворид шуд",
    moneyReceivedBody: "Интиқоли воридотӣ ба Wallet",
    walletUpdate: "Wallet нав шуд",
    open: "Кушодан",
    close: "Пӯшидан",
  },
  ky: {
    messages: "Билдирүүлөр",
    missed: "Өткөрүлгөн",
    money: "Акча",
    newMessage: "Жаңы билдирүү",
    newMessageBody: "Сизде окула элек билдирүү бар",
    missedCall: "Өткөрүлгөн чалуу",
    missedCallBody: "Сиз чалууну өткөрүп жибердиңиз",
    moneyReceived: "Акча түштү",
    moneyReceivedBody: "Walletке кирген которуу",
    walletUpdate: "Wallet жаңырды",
    open: "Ачуу",
    close: "Жабуу",
  },
  kk: {
    messages: "Хабарлар",
    missed: "Өткізілген",
    money: "Ақша",
    newMessage: "Жаңа хабар",
    newMessageBody: "Сізде оқылмаған хабар бар",
    missedCall: "Өткізілген қоңырау",
    missedCallBody: "Сіз қоңырауды өткізіп алдыңыз",
    moneyReceived: "Ақша түсті",
    moneyReceivedBody: "Walletке кіріс аударым",
    walletUpdate: "Wallet жаңартылды",
    open: "Ашу",
    close: "Жабу",
  },
  tr: {
    messages: "Mesajlar",
    missed: "Cevapsız",
    money: "Para",
    newMessage: "Yeni mesaj",
    newMessageBody: "Okunmamış mesajınız var",
    missedCall: "Cevapsız arama",
    missedCallBody: "Bir aramayı kaçırdınız",
    moneyReceived: "Para alındı",
    moneyReceivedBody: "Wallet gelen transfer",
    walletUpdate: "Wallet güncellendi",
    open: "Aç",
    close: "Kapat",
  },
  az: {
    messages: "Mesajlar",
    missed: "Buraxılıb",
    money: "Pul",
    newMessage: "Yeni mesaj",
    newMessageBody: "Oxunmamış mesajınız var",
    missedCall: "Buraxılmış zəng",
    missedCallBody: "Zəngi buraxdınız",
    moneyReceived: "Pul daxil oldu",
    moneyReceivedBody: "Walletə daxil olan köçürmə",
    walletUpdate: "Wallet yeniləndi",
    open: "Aç",
    close: "Bağla",
  },
  uk: {
    messages: "Повідомлення",
    missed: "Пропущено",
    money: "Гроші",
    newMessage: "Нове повідомлення",
    newMessageBody: "У вас є непрочитане повідомлення",
    missedCall: "Пропущений дзвінок",
    missedCallBody: "Ви пропустили дзвінок",
    moneyReceived: "Надійшли гроші",
    moneyReceivedBody: "Вхідний переказ у Wallet",
    walletUpdate: "Wallet оновлено",
    open: "Відкрити",
    close: "Закрити",
  },
  be: {
    messages: "Паведамленні",
    missed: "Прапушчана",
    money: "Грошы",
    newMessage: "Новае паведамленне",
    newMessageBody: "У вас ёсць непрачытанае паведамленне",
    missedCall: "Прапушчаны званок",
    missedCallBody: "Вы прапусцілі званок",
    moneyReceived: "Грошы паступілі",
    moneyReceivedBody: "Уваходны перавод у Wallet",
    walletUpdate: "Wallet абноўлены",
    open: "Адкрыць",
    close: "Закрыць",
  },
  zh: {
    messages: "消息",
    missed: "未接",
    money: "资金",
    newMessage: "新消息",
    newMessageBody: "你有未读消息",
    missedCall: "未接来电",
    missedCallBody: "你错过了一个来电",
    moneyReceived: "资金到账",
    moneyReceivedBody: "Wallet 收到转账",
    walletUpdate: "Wallet 更新",
    open: "打开",
    close: "关闭",
  },
  ko: {
    messages: "메시지",
    missed: "부재중",
    money: "입금",
    newMessage: "새 메시지",
    newMessageBody: "읽지 않은 메시지가 있습니다",
    missedCall: "부재중 전화",
    missedCallBody: "전화를 받지 못했습니다",
    moneyReceived: "입금 완료",
    moneyReceivedBody: "Wallet 수신 이체",
    walletUpdate: "Wallet 업데이트",
    open: "열기",
    close: "닫기",
  },
  ja: {
    messages: "メッセージ",
    missed: "不在着信",
    money: "入金",
    newMessage: "新しいメッセージ",
    newMessageBody: "未読メッセージがあります",
    missedCall: "不在着信",
    missedCallBody: "着信に応答できませんでした",
    moneyReceived: "入金しました",
    moneyReceivedBody: "Walletへの入金送金",
    walletUpdate: "Wallet更新",
    open: "開く",
    close: "閉じる",
  },
  de: {
    messages: "Nachrichten",
    missed: "Verpasst",
    money: "Geld",
    newMessage: "Neue Nachricht",
    newMessageBody: "Sie haben eine ungelesene Nachricht",
    missedCall: "Verpasster Anruf",
    missedCallBody: "Sie haben einen Anruf verpasst",
    moneyReceived: "Geld eingegangen",
    moneyReceivedBody: "Eingehende Wallet-Überweisung",
    walletUpdate: "Wallet aktualisiert",
    open: "Öffnen",
    close: "Schließen",
  },
  ar: {
    messages: "الرسائل",
    missed: "فائتة",
    money: "الأموال",
    newMessage: "رسالة جديدة",
    newMessageBody: "لديك رسالة غير مقروءة",
    missedCall: "مكالمة فائتة",
    missedCallBody: "فاتتك مكالمة",
    moneyReceived: "تم استلام الأموال",
    moneyReceivedBody: "تحويل وارد إلى Wallet",
    walletUpdate: "تحديث Wallet",
    open: "فتح",
    close: "إغلاق",
  },
  ur: {
    messages: "پیغامات",
    missed: "مسڈ",
    money: "رقم",
    newMessage: "نیا پیغام",
    newMessageBody: "آپ کے پاس ایک غیر پڑھا پیغام ہے",
    missedCall: "مسڈ کال",
    missedCallBody: "آپ کی کال مس ہو گئی",
    moneyReceived: "رقم موصول ہوئی",
    moneyReceivedBody: "Wallet میں آنے والی منتقلی",
    walletUpdate: "Wallet اپ ڈیٹ",
    open: "کھولیں",
    close: "بند کریں",
  },
  "fa-AF": {
    messages: "پیام‌ها",
    missed: "از دست‌رفته",
    money: "پول",
    newMessage: "پیام نو",
    newMessageBody: "شما یک پیام خوانده‌نشده دارید",
    missedCall: "تماس از دست‌رفته",
    missedCallBody: "شما یک تماس را از دست دادید",
    moneyReceived: "پول دریافت شد",
    moneyReceivedBody: "انتقال ورودی به Wallet",
    walletUpdate: "Wallet به‌روزرسانی شد",
    open: "باز کردن",
    close: "بستن",
  },
  ps: {
    messages: "پیغامونه",
    missed: "له لاسه وتلي",
    money: "پیسې",
    newMessage: "نوی پیغام",
    newMessageBody: "تاسو نه لوستل شوی پیغام لرئ",
    missedCall: "له لاسه وتلی زنګ",
    missedCallBody: "تاسو یو زنګ له لاسه ورکړ",
    moneyReceived: "پیسې ترلاسه شوې",
    moneyReceivedBody: "Wallet ته راتلونکی انتقال",
    walletUpdate: "Wallet تازه شو",
    open: "پرانیستل",
    close: "بندول",
  },
  hi: {
    messages: "संदेश",
    missed: "मिस्ड",
    money: "पैसा",
    newMessage: "नया संदेश",
    newMessageBody: "आपके पास अपठित संदेश है",
    missedCall: "मिस्ड कॉल",
    missedCallBody: "आपने एक कॉल मिस की",
    moneyReceived: "पैसा प्राप्त हुआ",
    moneyReceivedBody: "Wallet में आने वाला ट्रांसफ़र",
    walletUpdate: "Wallet अपडेट",
    open: "खोलें",
    close: "बंद करें",
  },
  th: {
    messages: "ข้อความ",
    missed: "พลาด",
    money: "เงิน",
    newMessage: "ข้อความใหม่",
    newMessageBody: "คุณมีข้อความที่ยังไม่ได้อ่าน",
    missedCall: "สายที่ไม่ได้รับ",
    missedCallBody: "คุณพลาดสายเรียกเข้า",
    moneyReceived: "ได้รับเงินแล้ว",
    moneyReceivedBody: "รายการโอนเข้า Wallet",
    walletUpdate: "Wallet อัปเดต",
    open: "เปิด",
    close: "ปิด",
  },
  sw: {
    messages: "Ujumbe",
    missed: "Zilizokosa",
    money: "Pesa",
    newMessage: "Ujumbe mpya",
    newMessageBody: "Una ujumbe ambao haujasomwa",
    missedCall: "Simu iliyokosa",
    missedCallBody: "Umekosa simu",
    moneyReceived: "Pesa zimepokelewa",
    moneyReceivedBody: "Uhamisho unaoingia kwenye Wallet",
    walletUpdate: "Wallet imesasishwa",
    open: "Fungua",
    close: "Funga",
  },
  tk: {
    messages: "Habarlar",
    missed: "Geçirilen",
    money: "Pul",
    newMessage: "Täze habar",
    newMessageBody: "Okalmadyk habaryňyz bar",
    missedCall: "Geçirilen jaň",
    missedCallBody: "Siz jaňy geçirdiňiz",
    moneyReceived: "Pul geldi",
    moneyReceivedBody: "Wallet-e girýän geçirmek",
    walletUpdate: "Wallet täzelendi",
    open: "Aç",
    close: "Ýap",
  },
  am: {
    messages: "መልዕክቶች",
    missed: "ያመለጡ",
    money: "ገንዘብ",
    newMessage: "አዲስ መልዕክት",
    newMessageBody: "ያልተነበበ መልዕክት አለዎት",
    missedCall: "ያመለጠ ጥሪ",
    missedCallBody: "ጥሪ አመለጠዎት",
    moneyReceived: "ገንዘብ ደርሷል",
    moneyReceivedBody: "ወደ Wallet የገባ ማስተላለፊያ",
    walletUpdate: "Wallet ተዘምኗል",
    open: "ክፈት",
    close: "ዝጋ",
  },
  af: {
    messages: "Boodskappe",
    missed: "Gemis",
    money: "Geld",
    newMessage: "Nuwe boodskap",
    newMessageBody: "Jy het 'n ongeleesde boodskap",
    missedCall: "Gemiste oproep",
    missedCallBody: "Jy het 'n oproep gemis",
    moneyReceived: "Geld ontvang",
    moneyReceivedBody: "Inkomende Wallet-oordrag",
    walletUpdate: "Wallet opgedateer",
    open: "Maak oop",
    close: "Maak toe",
  },
  hy: {
    messages: "Հաղորդագրություններ",
    missed: "Բաց թողնված",
    money: "Գումար",
    newMessage: "Նոր հաղորդագրություն",
    newMessageBody: "Դուք ունեք չկարդացված հաղորդագրություն",
    missedCall: "Բաց թողնված զանգ",
    missedCallBody: "Դուք բաց եք թողել զանգը",
    moneyReceived: "Գումար է ստացվել",
    moneyReceivedBody: "Մուտքային փոխանցում Wallet-ում",
    walletUpdate: "Wallet-ը թարմացվել է",
    open: "Բացել",
    close: "Փակել",
  },
};

const MESSAGE_EVENTS = [
  RealtimeEvents.messageNew,
  "message:new",
  "message.created",
  "message_created",
  "chat:message:new",
  "messenger:message:new",
  "messenger.message.new",
] as const;

const CALL_MISSED_EVENTS = [
  "call:missed",
  "call_missed",
  "sabi-call:missed",
  "audio-call:missed",
  "video-call:missed",
  "messenger:call:missed",
] as const;

const WALLET_EVENTS = [
  RealtimeEvents.notificationNew,
  RealtimeEvents.walletBalanceUpdated,
  RealtimeEvents.walletHistoryChanged,
  RealtimeEvents.walletOperationUpdated,
  RealtimeEvents.walletCoreEvent,
  RealtimeEvents.realtimeEvent,
  "wallet.business.transfer.completed",
  "wallet.business.transfer.received",
  "wallet.merchant.payment.completed",
  "wallet.merchant.settlement.completed",
  "wallet.operation.completed",
  "wallet:transfer.received",
  "wallet.transfer.received",
  "wallet:money.received",
  "payment:received",
  "transfer:received",
  "coin:received",
  "crypto:received",
] as const;

const LOCAL_OVERLAY_EVENTS = [
  "sabi-notification:overlay",
  "sabi:notification:overlay",
  "sabi-wallet:money-received",
  "sabi-messenger:message-unread",
  "sabi-call:missed-local",
] as const;

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function readString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function readAmount(source: Record<string, unknown>) {
  const value = source.amount ?? source.value ?? source.total ?? source.balanceChange;
  const numberValue = typeof value === "number" ? value : Number(String(value || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function isIncomingWalletPayload(eventName: string, payload: Record<string, unknown>, currentUserId: string) {
  const joinedText = [
    eventName,
    payload.eventType,
    payload.type,
    payload.kind,
    payload.direction,
    payload.status,
    payload.operationType,
    payload.action,
  ]
    .map((value) => String(value || "").toLowerCase())
    .join("|");

  const receiverUserId = readString(payload, ["receiverUserId", "toUserId", "targetUserId", "recipientUserId", "userId"]);
  const senderUserId = readString(payload, ["senderUserId", "fromUserId", "payerUserId"]);

  if (senderUserId && currentUserId && senderUserId === currentUserId && !joinedText.includes("received")) {
    return false;
  }

  if (receiverUserId && currentUserId && receiverUserId !== currentUserId && !joinedText.includes("received")) {
    return false;
  }

  return (
    joinedText.includes("received") ||
    joinedText.includes("incoming") ||
    joinedText.includes("top_up") ||
    joinedText.includes("topup") ||
    joinedText.includes("deposit") ||
    joinedText.includes("credit") ||
    joinedText.includes("merchant.payment.completed") ||
    joinedText.includes("settlement.completed") ||
    (joinedText.includes("balance") && !joinedText.includes("failed"))
  );
}

function normalizeCounterparty(payload: Record<string, unknown>) {
  return readString(payload, [
    "counterparty",
    "senderName",
    "fromName",
    "payerName",
    "merchantName",
    "businessName",
    "name",
  ]);
}

function formatMoney(amount?: number, currency?: string) {
  if (typeof amount !== "number") return "";
  const cleanCurrency = String(currency || "").trim();
  const cleanAmount = Math.abs(amount).toLocaleString(undefined, { maximumFractionDigits: 2 });
  return cleanCurrency ? `${cleanAmount} ${cleanCurrency}` : cleanAmount;
}


function overlayKindToSoundKind(kind: AppOverlayNotificationKind): SabiNotificationSoundKind | null {
  if (kind === "message") return null;
  if (kind === "wallet") return "wallet";
  if (kind === "ai") return "ai";
  if (kind === "missed_call" || kind === "security" || kind === "system") return "system";
  return "system";
}

async function playSabiOverlayNotificationTone(kind: AppOverlayNotificationKind) {
  const soundKind = overlayKindToSoundKind(kind);
  if (!soundKind) return;

  const selected = await resolveSabiSoundForKind(soundKind);
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });

  const { sound } = await Audio.Sound.createAsync(selected.source, {
    shouldPlay: false,
    volume: 0.82,
  });

  let unloaded = false;
  const unload = () => {
    if (unloaded) return;
    unloaded = true;
    void sound.unloadAsync().catch(() => undefined);
  };

  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinish) unload();
  });

  await sound.setPositionAsync(0).catch(() => undefined);
  await sound.playAsync();
  setTimeout(unload, 3500);
}

function useOverlayState() {
  return useSyncExternalStore(
    subscribeAppOverlayNotificationState,
    getAppOverlayNotificationState,
    getAppOverlayNotificationState,
  );
}

export default function AppNotificationOverlay() {
  const { language } = useI18n();
  const pathname = usePathname();
  const state = useOverlayState();
  const texts = useMemo(() => pickRuntimeDictionary(language, OVERLAY_TEXTS), [language]);
  const latest = state.items[0];
  const latestToneKeyRef = useRef("");
  const hasCounters = state.unreadMessages > 0 || state.missedCalls > 0 || state.moneyEvents > 0;

  const auth = useSyncExternalStore(
    subscribeAuthSessionState,
    getAuthSessionState,
    getAuthSessionState,
  );
  const currentUserId = typeof auth.currentUserId === "string" ? auth.currentUserId.trim() : "";

  const openNotifications = useCallback(() => {
    clearAppOverlayNotificationCounters("all");
    router.push("/notifications" as never);
  }, []);

  const closeLatest = useCallback(() => {
    if (!latest) return;
    clearAppOverlayNotificationCounters(latest.kind);
  }, [latest]);

  useEffect(() => {
    if (!latest) return;
    const toneKey = [latest.kind, latest.id, latest.createdAt].join(":");
    if (latestToneKeyRef.current === toneKey) return;
    latestToneKeyRef.current = toneKey;
    void playSabiOverlayNotificationTone(latest.kind).catch((error) => {
      console.warn(
        "[sabi-notification:overlay-tone] play failed",
        error instanceof Error ? error.message : error,
      );
    });
  }, [latest?.createdAt, latest?.id, latest?.kind]);

  useEffect(() => {
    if (!currentUserId) return undefined;

    const socket = getSuperAppSocket(currentUserId);
    const notificationChannel = RealtimeChannels.notificationUser(currentUserId);
    const walletChannel = RealtimeChannels.walletUser(currentUserId);

    joinRealtimeChannel(notificationChannel, currentUserId);
    joinWalletCoreChannel(walletChannel, currentUserId);

    const handleMessage = (payload: unknown) => {
      const record = toRecord(payload);
      const senderUserId = readString(record, ["senderUserId", "fromUserId", "authorUserId", "userId"]);
      if (senderUserId && senderUserId === currentUserId) return;

      const title = readString(record, ["title", "senderName", "fromName", "authorName", "name"]) || texts.newMessage;
      const message = readString(record, ["message", "text", "body", "preview", "snippet"]) || texts.newMessageBody;
      const id = readString(record, ["notificationId", "messageId", "id", "clientMessageId"]);
      const chatId = readString(record, ["chatId", "roomId", "conversationId"]);

      pushAppOverlayNotification({
        id: id || undefined,
        kind: "message",
        title,
        message,
        route: chatId ? `/tabs/chat/${encodeURIComponent(chatId)}` : "/notifications",
        referenceId: chatId || id || undefined,
        counterparty: title,
        priority: "medium",
        dedupeKey: `message:${id || chatId || message}`,
      });
    };

    const handleMissedCall = (payload: unknown) => {
      const record = toRecord(payload);
      const title = readString(record, ["title", "callerName", "fromName", "senderName", "name"]) || texts.missedCall;
      const message = readString(record, ["message", "body", "statusText"]) || texts.missedCallBody;
      const id = readString(record, ["notificationId", "callId", "id", "roomId"]);

      pushAppOverlayNotification({
        id: id || undefined,
        kind: "missed_call",
        title,
        message,
        route: "/tabs/calls",
        referenceId: id || undefined,
        counterparty: title,
        priority: "high",
        dedupeKey: `missed:${id || title}`,
      });
    };

    const handleWallet = (eventName: string, payload: unknown) => {
      const record = toRecord(payload);
      const eventType = readString(record, ["eventType", "type", "kind"]);

      if (eventName === RealtimeEvents.notificationNew) {
        const moduleName = readString(record, ["module", "source", "category"]).toLowerCase();
        const eventText = [eventType, readString(record, ["title"]), readString(record, ["message"])]
          .join("|")
          .toLowerCase();

        if (moduleName === "messenger" || eventText.includes("message_received")) {
          handleMessage(payload);
          return;
        }

        if (eventText.includes("missed_call")) {
          handleMissedCall(payload);
          return;
        }
      }

      if (!isIncomingWalletPayload(eventName, record, currentUserId)) return;

      const amount = readAmount(record);
      const currency = readString(record, ["currency", "asset", "coin", "symbol"]);
      const moneyText = formatMoney(amount, currency);
      const counterparty = normalizeCounterparty(record);
      const title = readString(record, ["title"]) || texts.moneyReceived;
      const message =
        readString(record, ["message", "body", "description"]) ||
        [moneyText, counterparty || texts.moneyReceivedBody].filter(Boolean).join(" · ") ||
        texts.walletUpdate;
      const id = readString(record, ["notificationId", "operationId", "transactionId", "transferId", "id"]);

      pushAppOverlayNotification({
        id: id || undefined,
        kind: "wallet",
        title,
        message,
        route: "/wallet",
        referenceId: id || undefined,
        counterparty: counterparty || undefined,
        amount,
        currency: currency || undefined,
        priority: "high",
        dedupeKey: `wallet:${id || eventName}:${moneyText}:${counterparty}`,
      });
    };

    const handleLocalOverlay = (payload: unknown) => {
      const record = toRecord(payload);
      const kind = readString(record, ["kind", "type", "eventType"]) as AppOverlayNotificationKind;

      if (kind === "message") {
        handleMessage(payload);
        return;
      }

      if (kind === "missed_call") {
        handleMissedCall(payload);
        return;
      }

      if (kind === "wallet") {
        handleWallet("local", payload);
        return;
      }

      pushAppOverlayNotification({
        id: readString(record, ["notificationId", "id"]) || undefined,
        kind: kind || "system",
        title: readString(record, ["title"]) || texts.walletUpdate,
        message: readString(record, ["message", "body"]) || "",
        route: readString(record, ["route"]) || "/notifications",
        priority: "medium",
      });
    };

    MESSAGE_EVENTS.forEach((eventName) => socket.on(eventName, handleMessage));
    CALL_MISSED_EVENTS.forEach((eventName) => socket.on(eventName, handleMissedCall));
    const walletHandlers = WALLET_EVENTS.map((eventName) => {
      const handler = (payload: unknown) => handleWallet(eventName, payload);
      socket.on(eventName, handler);
      return { eventName, handler };
    });
    const localSubscriptions = LOCAL_OVERLAY_EVENTS.map((eventName) =>
      DeviceEventEmitter.addListener(eventName, handleLocalOverlay),
    );

    if (!socket.connected) socket.connect();

    return () => {
      MESSAGE_EVENTS.forEach((eventName) => socket.off(eventName, handleMessage));
      CALL_MISSED_EVENTS.forEach((eventName) => socket.off(eventName, handleMissedCall));
      walletHandlers.forEach(({ eventName, handler }) => socket.off(eventName, handler));
      localSubscriptions.forEach((subscription) => subscription.remove());
      leaveRealtimeChannel(notificationChannel);
      leaveWalletCoreChannel(walletChannel);
    };
  }, [currentUserId, texts]);

  if (!currentUserId || (!latest && !hasCounters)) return null;

  const hiddenOnSplash = pathname === "/splash" || pathname === "/welcome";
  if (hiddenOnSplash) return null;

  return (
    <View pointerEvents="box-none" style={styles.host}>
      {hasCounters ? (
        <Pressable style={styles.counterBar} onPress={openNotifications}>
          {state.unreadMessages > 0 ? (
            <View style={styles.counterPill}>
              <MessageCircle size={15} color="#FFFFFF" />
              <Text style={styles.counterText}>{state.unreadMessages} {texts.messages}</Text>
            </View>
          ) : null}

          {state.missedCalls > 0 ? (
            <View style={styles.counterPill}>
              <PhoneMissed size={15} color="#FFFFFF" />
              <Text style={styles.counterText}>{state.missedCalls} {texts.missed}</Text>
            </View>
          ) : null}

          {state.moneyEvents > 0 ? (
            <View style={styles.counterPill}>
              <WalletCards size={15} color="#FFFFFF" />
              <Text style={styles.counterText}>{state.moneyEvents} {texts.money}</Text>
            </View>
          ) : null}
        </Pressable>
      ) : null}

      {latest ? (
        <Pressable style={styles.card} onPress={openNotifications}>
          <View style={styles.iconCircle}>
            {latest.kind === "message" ? <MessageCircle size={19} color="#FFFFFF" /> : null}
            {latest.kind === "missed_call" ? <PhoneMissed size={19} color="#FFFFFF" /> : null}
            {latest.kind === "wallet" ? <WalletCards size={19} color="#FFFFFF" /> : null}
            {latest.kind !== "message" && latest.kind !== "missed_call" && latest.kind !== "wallet" ? (
              <Bell size={19} color="#FFFFFF" />
            ) : null}
          </View>

          <View style={styles.cardTextHost}>
            <Text numberOfLines={1} style={styles.cardTitle}>{latest.title}</Text>
            <Text numberOfLines={2} style={styles.cardMessage}>{latest.message}</Text>
          </View>

          <Pressable accessibilityLabel={texts.close} hitSlop={10} onPress={closeLatest} style={styles.closeButton}>
            <X size={16} color="#FFFFFF" />
          </Pressable>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    top: Platform.OS === "android" ? 28 : 54,
    left: 12,
    right: 12,
    zIndex: 9999,
    elevation: 9999,
    alignItems: "center",
  },
  counterBar: {
    maxWidth: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 8,
  },
  counterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(10, 18, 20, 0.82)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  card: {
    width: "100%",
    maxWidth: 430,
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: "rgba(8, 14, 16, 0.92)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(119, 226, 140, 0.22)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(119, 226, 140, 0.42)",
  },
  cardTextHost: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  cardMessage: {
    marginTop: 2,
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});
