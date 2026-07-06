import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ResizeMode, Video } from "expo-av";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Mic, MicOff, Volume2 } from "lucide-react-native";

import { useI18n } from "../../../../shared/i18n";
import { aiMobileApi } from "../aiMobileApi";
import { aiMobileErrorText, aiMobileText } from "../aiMobileI18n";
import { useAiVoiceBridge } from "../voice/useAiVoiceBridge";

const SABI_ASSISTANT_IDLE_LOOP = require("../assets/sabi-ai-voice-assistant-idle.mp4");
const SABI_ASSISTANT_LISTENING_LOOP = require("../assets/sabi-ai-voice-assistant-listening.mp4");
const SABI_ASSISTANT_THINKING_LOOP = require("../assets/sabi-ai-voice-assistant-thinking.mp4");
const SABI_ASSISTANT_SPEAKING_LOOP = require("../assets/sabi-ai-voice-assistant-speaking.mp4");

type SabiVoiceMood = "idle" | "listening" | "thinking" | "speaking" | "error";

type AssistantTurn = {
  transcript: string;
  answer: string;
};

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toStringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    const stringValue = toStringValue(value);
    if (stringValue) return stringValue;
  }

  return null;
}

function extractTranscriptFromVoicePayload(payload: unknown): string | null {
  const root = toRecord(payload) ?? {};
  const data = toRecord(root.data) ?? root;
  const result = toRecord(data.result) ?? toRecord(root.result);
  const payloadRecord = toRecord(data.payload) ?? toRecord(root.payload);
  const transcription = toRecord(data.transcription) ?? toRecord(result?.transcription) ?? toRecord(payloadRecord?.transcription);
  const stt = toRecord(data.stt) ?? toRecord(result?.stt) ?? toRecord(payloadRecord?.stt);
  const raw = toRecord(data.raw) ?? toRecord(result?.raw) ?? toRecord(payloadRecord?.raw);

  return firstString(
    data.transcript,
    data.text,
    data.recognizedText,
    data.recognisedText,
    data.speech,
    result?.transcript,
    result?.text,
    result?.recognizedText,
    result?.result,
    payloadRecord?.transcript,
    payloadRecord?.text,
    transcription?.transcript,
    transcription?.text,
    stt?.transcript,
    stt?.text,
    stt?.result,
    raw?.result,
  );
}

function extractAssistantText(payload: unknown): string | null {
  const root = toRecord(payload) ?? {};
  const data = toRecord(root.data) ?? root;
  const answer = toRecord(data.answer) ?? toRecord(root.answer);
  const message = toRecord(data.message) ?? toRecord(root.message);
  const result = toRecord(data.result) ?? toRecord(root.result);
  const payloadRecord = toRecord(data.payload) ?? toRecord(root.payload);

  return firstString(
    answer?.text,
    answer?.content,
    answer?.message,
    data.answer,
    data.reply,
    data.text,
    data.content,
    data.message,
    data.outputText,
    data.result,
    message?.text,
    message?.content,
    result?.answer,
    result?.text,
    result?.content,
    result?.message,
    payloadRecord?.answer,
    payloadRecord?.text,
    payloadRecord?.content,
    root.answer,
    root.reply,
    root.text,
  );
}

function estimatePlaybackDuration(text: string): number {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.min(16000, Math.max(4200, wordCount * 430));
}

function voiceAssistantEmptySpeechText(language: string): string {
  const lang = language.trim().toLowerCase();
  if (lang.startsWith("ru")) return "Голос не распознан. Скажите ещё раз.";
  if (lang.startsWith("en")) return "Voice was not recognized. Please speak again.";
  if (lang.startsWith("uz")) return "Ovoz aniq tanilmadi. Yana bir marta gapiring.";
  if (lang.startsWith("kk")) return "Дауыс анық танылмады. Тағы бір рет айтыңыз.";
  if (lang.startsWith("tr")) return "Ses tanınmadı. Lütfen tekrar konuşun.";
  if (lang.startsWith("de")) return "Die Stimme wurde nicht erkannt. Bitte sprechen Sie noch einmal.";
  if (lang.startsWith("zh")) return "未识别到语音。请再说一次。";
  if (lang.startsWith("ko")) return "음성이 인식되지 않았습니다. 다시 말해 주세요.";
  if (lang.startsWith("ja")) return "音声を認識できませんでした。もう一度話してください。";
  if (lang.startsWith("tg")) return "Овоз шинохта нашуд. Бори дигар гап занед.";
  if (lang.startsWith("ky")) return "Үн таанылган жок. Дагы бир жолу сүйлөңүз.";
  if (lang.startsWith("fa")) return "صدا تشخیص نشد. دوباره صحبت کنید.";
  if (lang.startsWith("ps")) return "غږ ونه پېژندل شو. بیا خبرې وکړئ.";
  if (lang.startsWith("tk")) return "Ses tanalmady. Ýene bir gezek aýdyň.";
  if (lang.startsWith("az")) return "Səs tanınmadı. Bir daha danışın.";
  if (lang.startsWith("ar")) return "لم يتم التعرف على الصوت. تحدث مرة أخرى.";
  if (lang.startsWith("th")) return "ไม่รู้จำเสียง กรุณาพูดอีกครั้ง";
  if (lang.startsWith("am")) return "ድምፁ አልታወቀም። እንደገና ይናገሩ።";
  if (lang.startsWith("hy")) return "Ձայնը չի ճանաչվել։ Խոսեք ևս մեկ անգամ։";
  return aiMobileText(language, "voice.error");
}

function voiceAssistantEmptyAnswerText(language: string): string {
  const lang = language.trim().toLowerCase();
  if (lang.startsWith("ru")) return "Sabi не вернула текст ответа. Повторите попытку.";
  if (lang.startsWith("en")) return "Sabi did not return an answer text. Please try again.";
  if (lang.startsWith("uz")) return "Sabi javob matnini qaytarmadi. Yana urinib ko‘ring.";
  if (lang.startsWith("kk")) return "Sabi жауап мәтінін қайтармады. Қайталап көріңіз.";
  if (lang.startsWith("tr")) return "Sabi cevap metni döndürmedi. Tekrar deneyin.";
  if (lang.startsWith("de")) return "Sabi hat keinen Antworttext zurückgegeben. Bitte erneut versuchen.";
  if (lang.startsWith("zh")) return "Sabi 没有返回回答文本。请重试。";
  if (lang.startsWith("ko")) return "Sabi가 답변 텍스트를 반환하지 않았습니다. 다시 시도하세요.";
  if (lang.startsWith("ja")) return "Sabi が回答テキストを返しませんでした。もう一度お試しください。";
  if (lang.startsWith("tg")) return "Sabi матни ҷавобро барнагардонд. Бори дигар кӯшиш кунед.";
  if (lang.startsWith("ky")) return "Sabi жооп текстин кайтарган жок. Кайра аракет кылыңыз.";
  if (lang.startsWith("fa")) return "Sabi متن پاسخ را برنگرداند. دوباره کوشش کنید.";
  if (lang.startsWith("ps")) return "Sabi د ځواب متن راستون نه کړ. بیا هڅه وکړئ.";
  if (lang.startsWith("tk")) return "Sabi jogap tekstini gaýtarmady. Täzeden synanyşyň.";
  if (lang.startsWith("az")) return "Sabi cavab mətnini qaytarmadı. Yenidən yoxlayın.";
  if (lang.startsWith("ar")) return "لم تُرجع Sabi نص الإجابة. حاول مرة أخرى.";
  if (lang.startsWith("th")) return "Sabi ไม่ได้ส่งข้อความตอบกลับ กรุณาลองอีกครั้ง";
  if (lang.startsWith("am")) return "Sabi የመልስ ጽሑፍ አልመለሰችም። እንደገና ይሞክሩ።";
  if (lang.startsWith("hy")) return "Sabi-ն պատասխան տեքստ չի վերադարձրել։ Փորձեք կրկին։";
  return aiMobileText(language, "voice.error");
}

function voiceAssistantUnavailableText(language: string): string {
  const lang = language.trim().toLowerCase();
  if (lang.startsWith("ru")) return "Голос для выбранного языка пока не подключён. Текстовый ответ показан на выбранном языке.";
  if (lang.startsWith("en")) return "Voice for the selected language is not connected yet. The text answer is shown in the selected language.";
  if (lang.startsWith("uz")) return "Tanlangan til uchun ovoz hali ulanmagan. Matnli javob tanlangan tilda ko‘rsatildi.";
  if (lang.startsWith("kk")) return "Таңдалған тіл үшін дауыс әлі қосылмаған. Мәтіндік жауап таңдалған тілде көрсетілді.";
  if (lang.startsWith("tr")) return "Seçilen dil için ses henüz bağlı değil. Metin yanıtı seçilen dilde gösterildi.";
  if (lang.startsWith("de")) return "Die Stimme für die ausgewählte Sprache ist noch nicht verbunden. Die Textantwort wird in der ausgewählten Sprache angezeigt.";
  if (lang.startsWith("zh")) return "所选语言的语音尚未连接。文本回答已按所选语言显示。";
  if (lang.startsWith("ko")) return "선택한 언어의 음성이 아직 연결되지 않았습니다. 텍스트 답변은 선택한 언어로 표시됩니다.";
  if (lang.startsWith("ja")) return "選択した言語の音声はまだ接続されていません。テキスト回答は選択した言語で表示されます。";
  if (lang.startsWith("tg")) return "Овоз барои забони интихобшуда ҳоло пайваст нест. Ҷавоби матнӣ бо забони интихобшуда нишон дода шуд.";
  if (lang.startsWith("ky")) return "Тандалган тил үчүн үн азырынча кошулган жок. Тексттик жооп тандалган тилде көрсөтүлдү.";
  if (lang.startsWith("fa")) return "صدا برای زبان انتخاب‌شده هنوز وصل نیست. پاسخ متنی به همان زبان نمایش داده شد.";
  if (lang.startsWith("ps")) return "د ټاکل شوې ژبې غږ لا ندی نښلول شوی. متني ځواب په ټاکل شوې ژبه ښکاره شو.";
  if (lang.startsWith("tk")) return "Saýlanan dil üçin ses entek birikdirilmedi. Tekst jogaby saýlanan dilde görkezildi.";
  if (lang.startsWith("az")) return "Seçilmiş dil üçün səs hələ qoşulmayıb. Mətn cavabı seçilmiş dildə göstərildi.";
  if (lang.startsWith("ar")) return "الصوت للغة المحددة غير متصل بعد. تم عرض الرد النصي باللغة المحددة.";
  if (lang.startsWith("th")) return "เสียงสำหรับภาษาที่เลือกยังไม่ได้เชื่อมต่อ คำตอบแบบข้อความแสดงเป็นภาษาที่เลือกแล้ว";
  if (lang.startsWith("am")) return "ለተመረጠው ቋንቋ ድምፅ ገና አልተገናኘም። የጽሑፍ መልስ በተመረጠው ቋንቋ ታይቷል።";
  if (lang.startsWith("hy")) return "Ընտրված լեզվի ձայնը դեռ միացված չէ։ Տեքստային պատասխանը ցուցադրվեց ընտրված լեզվով։";
  return aiMobileText(language, "voice.voiceUnavailable");
}

// STEP73A_SELECTED_LANGUAGE_LOCK:
// AI voice must use the language selected in Profile/App settings only.
// Do not infer Uzbek/Kazakh/English from Latin words like "Sabi" and never
// fall back to Russian for unknown locales. Unsupported voice is handled by the
// server as voice_unavailable, not by switching to another language.
function normalizeSabiVoiceLanguage(value?: string | null): string {
  const clean = String(value || "").trim().replace(/_/g, "-").toLowerCase();
  if (clean === "ru" || clean.startsWith("ru-")) return "ru-RU";
  if (clean === "en" || clean.startsWith("en-")) return "en-US";
  if (clean === "de" || clean.startsWith("de-")) return "de-DE";
  if (clean === "uz" || clean.startsWith("uz-")) return "uz-UZ";
  if (clean === "tr" || clean.startsWith("tr-")) return "tr-TR";
  if (clean === "kk" || clean.startsWith("kk-") || clean.startsWith("kz-")) return "kk-KZ";
  if (clean === "zh" || clean === "cn" || clean.startsWith("zh-") || clean.startsWith("cmn-")) return "zh-CN";
  if (clean === "fr" || clean.startsWith("fr-")) return "fr-FR";
  if (clean === "es" || clean.startsWith("es-")) return "es-ES";
  if (clean === "ar" || clean.startsWith("ar-")) return "ar";
  if (clean === "he" || clean.startsWith("he-")) return "he-IL";
  if (clean === "ja" || clean.startsWith("ja-")) return "ja-JP";
  if (clean === "ko" || clean.startsWith("ko-")) return "ko-KR";
  if (clean === "az" || clean.startsWith("az-")) return "az";
  if (clean === "tg" || clean.startsWith("tg-")) return "tg";
  if (clean === "tk" || clean.startsWith("tk-")) return "tk";
  if (clean === "ky" || clean.startsWith("ky-")) return "ky";
  if (clean === "uk" || clean.startsWith("uk-")) return "uk";
  if (clean === "be" || clean.startsWith("be-")) return "be";
  if (clean === "fa-af" || clean === "fa" || clean.startsWith("fa-")) return "fa-AF";
  if (clean === "ps" || clean.startsWith("ps-")) return "ps";
  if (clean === "ur" || clean.startsWith("ur-")) return "ur";
  if (clean === "hi" || clean.startsWith("hi-")) return "hi";
  if (clean === "am" || clean.startsWith("am-")) return "am";
  if (clean === "af" || clean.startsWith("af-")) return "af";
  if (clean === "sw" || clean.startsWith("sw-")) return "sw";
  return clean || "en-US";
}

function shortVoiceLanguageLabel(value: string): string {
  const language = normalizeSabiVoiceLanguage(value).toLowerCase();
  if (language.startsWith("uz")) return "UZ";
  if (language.startsWith("en")) return "EN";
  if (language.startsWith("tr")) return "TR";
  if (language.startsWith("kk")) return "KK";
  if (language.startsWith("ru")) return "RU";
  return language.slice(0, 2).toUpperCase();
}

function detectLikelySpeechLanguage(text: string, fallbackLanguage: string): string {
  const fallback = normalizeSabiVoiceLanguage(fallbackLanguage);
  const clean = text.trim();
  if (!clean) return fallback;

  const lower = clean.toLowerCase();
  const hasCyrillic = /[а-яё]/i.test(clean);
  const hasEnglish = /\b(the|what|why|how|please|thanks|hello|tell|show|open|calculate|multiply|answer)\b/.test(lower);
  const hasUzbekLatin =
    /\b(men|sen|siz|nima|qanday|rahmat|iltimos|kerak|bo['‘’`]?ladi|bo‘ldi|ko['‘’`]?rsat|o['‘’`]?zbek|salom|ha|yo['‘’`]?q)\b/.test(lower) ||
    /[ўқғҳ]/i.test(clean);

  // STEP72B: never classify Russian speech as Uzbek only because the assistant name
  // is written as Latin "Sabi". Cyrillic wins first; selected language is the lock.
  if (hasCyrillic) return "ru-RU";
  if (fallback.startsWith("ru") && !hasUzbekLatin && !hasEnglish) return fallback;
  if (hasUzbekLatin) return "uz-UZ";
  if (hasEnglish) return "en-US";
  return fallback;
}

function isPlainArithmeticRequest(text: string): boolean {
  const lower = text.toLowerCase();
  const hasMath =
    /\d+\s*([xх×*·]|умнож|multiply|times|ko['‘’`]?paytir|ko‘paytir|кўпайтир)\s*\d+/.test(lower) ||
    /сколько\s+будет\s+\d+/.test(lower) ||
    /what\s+is\s+\d+/.test(lower) ||
    /\d+\s*(\+|-|−|÷|\/|:)\s*\d+/.test(lower);
  const hasMoney = /(доллар|dollar|usd|сум|so['‘’`]?m|руб|ruble|eur|евро|coin|money|price|cost|цена|стоим|кошел|wallet|оплат|pay)/.test(lower);
  return hasMath && !hasMoney;
}

function cleanUnwantedCurrencyFromMathAnswer(question: string, answer: string): string {
  if (!isPlainArithmeticRequest(question)) return answer;

  return answer
    .replace(/\s*(долларов|доллара|доллары|доллар|баксов|usd|dollars|dollar|сумов|сум|so['‘’`]?m|рублей|рубля|рубль|ruble|rubles|евро|eur|coins?|коинов?)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,!?])/g, "$1")
    .trim();
}


function isGreetingOnly(value: string): boolean {
  const clean = value.trim().toLowerCase().replace(/[!?.…,:;\-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) return false;
  return /^(привет|здравствуй|здравствуйте|салам|salom|hello|hi|hey)(\s+(sabi|саби|сави|сабина|savi|sabby))?$/.test(clean);
}

function stripBotTail(answer: string): string {
  return answer
    .replace(/\s*(Чем\s+я\s+могу\s+(?:вам\s+)?помочь\??)\s*$/i, "")
    .replace(/\s*(Рад\s+помочь\s+чем\s+могу\.?)\s*$/i, "")
    .replace(/\s*(How\s+can\s+I\s+help\s+you\??)\s*$/i, "")
    .replace(/\s*(Qanday\s+yordam\s+bera\s+olaman\??)\s*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function polishAssistantVoiceAnswer(question: string, answer: string, language: string): string {
  const stripped = stripBotTail(answer);
  const clean = stripped || answer.trim();
  const lang = language.trim().toLowerCase();
  const genericBotOnly = /^(привет|здравствуйте|добрый\s+день)[!.\s]*(чем\s+я\s+могу\s+(?:вам\s+)?помочь\??)?$/i.test(answer.trim());

  if (isGreetingOnly(question) || genericBotOnly) {
    if (lang.startsWith("ru")) return "Привет, я здесь. Говорите спокойно — я слушаю и помогу по делу.";
    if (lang.startsWith("en")) return "Hi, I’m here. Speak naturally — I’ll listen and help you clearly.";
    if (lang.startsWith("uz")) return "Salom, men shu yerdaman. Bemalol gapiring — men sizni tinglayman va aniq yordam beraman.";
    if (lang.startsWith("kk")) return "Сәлем, мен осындамын. Еркін сөйлеңіз — мен тыңдап, нақты көмектесемін.";
    if (lang.startsWith("tr")) return "Merhaba, buradayım. Doğal konuşun — sizi dinleyip net şekilde yardımcı olurum.";
    if (lang.startsWith("de")) return "Hallo, ich bin da. Sprechen Sie ruhig — ich höre zu und helfe klar.";
    if (lang.startsWith("zh")) return "你好，我在这里。请自然地说，我会认真听并清楚地帮助你。";
    if (lang.startsWith("ko")) return "안녕하세요, 저는 여기 있습니다. 편하게 말씀하세요. 듣고 정확히 도와드리겠습니다.";
    if (lang.startsWith("ja")) return "こんにちは、ここにいます。自然に話してください。聞いて、分かりやすく手伝います。";
    if (lang.startsWith("tg")) return "Салом, ман ин ҷо ҳастам. Озодона гап занед — ман мешунавам ва дақиқ кӯмак мекунам.";
    if (lang.startsWith("ky")) return "Салам, мен бул жердемин. Эркин сүйлөңүз — мен угуп, так жардам берем.";
    if (lang.startsWith("fa")) return "سلام، من این‌جا هستم. راحت صحبت کنید — گوش می‌دهم و روشن کمک می‌کنم.";
    if (lang.startsWith("ps")) return "سلام، زه دلته یم. په ارام ډول خبرې وکړئ — زه اورم او روښانه مرسته کوم.";
    if (lang.startsWith("tk")) return "Salam, men şu ýerde. Arkaýyn gürläň — diňlärin we anyk kömek ederin.";
    if (lang.startsWith("az")) return "Salam, mən buradayam. Rahat danışın — sizi dinləyib dəqiq kömək edəcəyəm.";
    if (lang.startsWith("ar")) return "مرحباً، أنا هنا. تحدث بشكل طبيعي — سأستمع وأساعدك بوضوح.";
    if (lang.startsWith("th")) return "สวัสดี ฉันอยู่ตรงนี้ พูดได้ตามสบาย ฉันจะฟังและช่วยอย่างชัดเจน";
    if (lang.startsWith("am")) return "ሰላም፣ እዚህ ነኝ። በተፈጥሮ ይናገሩ — እሰማለሁ እና በግልጽ እረዳለሁ።";
    if (lang.startsWith("hy")) return "Բարև, ես այստեղ եմ։ Խոսեք հանգիստ՝ կլսեմ և հստակ կօգնեմ։";
    return aiMobileText(language, "voice.title");
  }

  return clean || answer.trim();
}

function formatRecordingClock(totalSeconds: number): string {
  const minutes = Math.floor(Math.max(0, totalSeconds) / 60);
  const seconds = Math.max(0, totalSeconds) % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function safeBackFromVoiceAssistant() {
  const typedRouter = router as typeof router & { canGoBack?: () => boolean };
  if (typeof typedRouter.canGoBack === "function" && typedRouter.canGoBack()) {
    router.back();
    return;
  }
  router.replace("/ai");
}

function voiceAssistantActionHint(language: string, mood: SabiVoiceMood, recordingSeconds: number): string {
  const lang = language.trim().toLowerCase();
  const timer = formatRecordingClock(recordingSeconds);

  const labels = (() => {
    if (lang.startsWith("ru")) return ["ЗАПИСЬ", "SABI ДУМАЕТ", "SABI ГОВОРИТ", "НАЖМИТЕ ЕЩЁ РАЗ", "НАЖМИТЕ МИКРОФОН"];
    if (lang.startsWith("en")) return ["RECORDING", "SABI IS THINKING", "SABI IS SPEAKING", "TAP TO RETRY", "TAP MICROPHONE"];
    if (lang.startsWith("uz")) return ["YOZILYAPTI", "SABI O‘YLAYAPTI", "SABI GAPIRYAPTI", "QAYTA BOSING", "MIKROFONNI BOSING"];
    if (lang.startsWith("kk")) return ["ЖАЗЫЛУДА", "SABI ОЙЛАНЫП ЖАТЫР", "SABI СӨЙЛЕП ЖАТЫР", "ҚАЙТА БАСЫҢЫЗ", "МИКРОФОНДЫ БАСЫҢЫЗ"];
    if (lang.startsWith("tr")) return ["KAYDEDİLİYOR", "SABI DÜŞÜNÜYOR", "SABI KONUŞUYOR", "TEKRAR DOKUNUN", "MİKROFONA DOKUNUN"];
    if (lang.startsWith("de")) return ["AUFNAHME", "SABI DENKT", "SABI SPRICHT", "ERNEUT TIPPEN", "MIKROFON TIPPEN"];
    if (lang.startsWith("zh")) return ["录音中", "SABI 正在思考", "SABI 正在说话", "点按重试", "点按麦克风"];
    if (lang.startsWith("ko")) return ["녹음 중", "SABI 생각 중", "SABI 말하는 중", "다시 누르기", "마이크 누르기"];
    if (lang.startsWith("ja")) return ["録音中", "SABI 思考中", "SABI 発話中", "もう一度タップ", "マイクをタップ"];
    if (lang.startsWith("ar")) return ["جارٍ التسجيل", "SABI تفكر", "SABI تتحدث", "اضغط للمحاولة", "اضغط الميكروفون"];
    if (lang.startsWith("th")) return ["กำลังบันทึก", "SABI กำลังคิด", "SABI กำลังพูด", "แตะอีกครั้ง", "แตะไมโครโฟน"];
    if (lang.startsWith("am")) return ["በመቅዳት ላይ", "SABI እያሰበች ነው", "SABI እየተናገረች ነው", "እንደገና ይጫኑ", "ማይክሮፎን ይጫኑ"];
    if (lang.startsWith("hy")) return ["ՁԱՅՆԱԳՐՎՈՒՄ Է", "SABI ՄՏԱԾՈՒՄ Է", "SABI ԽՈՍՈՒՄ Է", "ՍԵՂՄԵՔ ԿՐԿԻՆ", "ՍԵՂՄԵՔ ՄԻԿՐՈՖՈՆԸ"];
    return ["RECORDING", "SABI", "SABI", "RETRY", "MIC"];
  })();

  if (mood === "listening") return `${labels[0]} ${timer}`;
  if (mood === "thinking") return labels[1];
  if (mood === "speaking") return labels[2];
  if (mood === "error") return labels[3];
  return labels[4];
}

function voiceAssistantStatusText(language: string, mood: SabiVoiceMood): string {
  const lang = language.trim().toLowerCase();
  const labels = (() => {
    if (lang.startsWith("ru")) return ["СЛУШАЮ", "ДУМАЮ", "ГОВОРЮ", "ПОВТОРИТЬ", "МИКРОФОН"];
    if (lang.startsWith("en")) return ["LISTENING", "THINKING", "SPEAKING", "TRY AGAIN", "MICROPHONE"];
    if (lang.startsWith("uz")) return ["TINGLAYAPMAN", "O‘YLAYAPMAN", "JAVOB BERYAPMAN", "QAYTA URINING", "MIKROFON"];
    if (lang.startsWith("kk")) return ["ТЫҢДАП ТҰРМЫН", "ОЙЛАНУДА", "ЖАУАП БЕРУДЕ", "ҚАЙТА КӨРІҢІЗ", "МИКРОФОН"];
    if (lang.startsWith("tr")) return ["DİNLİYORUM", "DÜŞÜNÜYORUM", "KONUŞUYORUM", "TEKRAR DENE", "MİKROFON"];
    if (lang.startsWith("de")) return ["HÖRE ZU", "DENKE", "SPRECHE", "ERNEUT", "MIKROFON"];
    if (lang.startsWith("zh")) return ["正在听", "正在思考", "正在说话", "重试", "麦克风"];
    if (lang.startsWith("ko")) return ["듣는 중", "생각 중", "말하는 중", "다시 시도", "마이크"];
    if (lang.startsWith("ja")) return ["聞いています", "考えています", "話しています", "再試行", "マイク"];
    if (lang.startsWith("ar")) return ["أستمع", "أفكر", "أتحدث", "أعد المحاولة", "الميكروفون"];
    if (lang.startsWith("th")) return ["กำลังฟัง", "กำลังคิด", "กำลังพูด", "ลองอีกครั้ง", "ไมโครโฟน"];
    if (lang.startsWith("am")) return ["እየሰማሁ ነው", "እያሰብኩ ነው", "እየተናገርኩ ነው", "እንደገና", "ማይክሮፎን"];
    if (lang.startsWith("hy")) return ["ԼՍՈՒՄ ԵՄ", "ՄՏԱԾՈՒՄ ԵՄ", "ԽՈՍՈՒՄ ԵՄ", "ԿՐԿԻՆ", "ՄԻԿՐՈՖՈՆ"];
    return ["LISTENING", "THINKING", "SPEAKING", "RETRY", "MIC"];
  })();

  if (mood === "listening") return labels[0];
  if (mood === "thinking") return labels[1];
  if (mood === "speaking") return labels[2];
  if (mood === "error") return labels[3];
  return labels[4];
}

function assistantVideoSource(mood: SabiVoiceMood) {
  if (mood === "listening") return SABI_ASSISTANT_LISTENING_LOOP;
  if (mood === "thinking") return SABI_ASSISTANT_THINKING_LOOP;
  if (mood === "speaking") return SABI_ASSISTANT_SPEAKING_LOOP;
  return SABI_ASSISTANT_IDLE_LOOP;
}

function useLoopedAnimation(duration: number, delay = 0) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [delay, duration, value]);

  return value;
}

function KineticFallbackAvatar({ mood }: { mood: SabiVoiceMood }) {
  const breathe = useLoopedAnimation(mood === "speaking" ? 360 : mood === "listening" ? 420 : 860);
  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.96, mood === "idle" ? 1.02 : 1.07] });
  const opacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.62, 0.96] });
  const ringScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.82, mood === "speaking" ? 1.26 : 1.12] });

  return (
    <View pointerEvents="none" style={styles.fallbackStage}>
      <Animated.View style={[styles.fallbackOuterRing, { opacity, transform: [{ scale: ringScale }] }]} />
      <Animated.View style={[styles.fallbackBodyAura, { transform: [{ scale }] }]}> 
        <View style={styles.fallbackHead}>
          <View style={styles.fallbackEyeRow}>
            <View style={styles.fallbackEye} />
            <View style={styles.fallbackEye} />
          </View>
          <Animated.View style={[styles.fallbackMouth, mood === "speaking" && { transform: [{ scaleY: ringScale }] }]} />
        </View>
        <View style={styles.fallbackShoulders} />
      </Animated.View>
    </View>
  );
}

function LiveVideoBackdrop({ mood }: { mood: SabiVoiceMood }) {
  const glow = useLoopedAnimation(mood === "speaking" ? 380 : mood === "listening" ? 460 : mood === "thinking" ? 620 : 1180);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const source = assistantVideoSource(mood);
  const scale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, mood === "idle" ? 1.004 : 1.012] });
  const opacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.08, mood === "idle" ? 0.18 : 0.40] });

  useEffect(() => {
    setVideoReady(false);
    setVideoFailed(false);
  }, [mood]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {(!videoReady || videoFailed) ? <KineticFallbackAvatar mood={mood} /> : null}
      <Animated.View style={[styles.videoBreath, { opacity: videoFailed ? 0 : 1, transform: [{ scale }] }]}> 
        <Video
          key={`sabi-ai-${mood}`}
          source={source}
          style={styles.liveVideo}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
          useNativeControls={false}
          progressUpdateIntervalMillis={500}
          onReadyForDisplay={() => setVideoReady(true)}
          onPlaybackStatusUpdate={(status) => {
            if (status?.isLoaded) setVideoReady(true);
          }}
          onError={() => setVideoFailed(true)}
        />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.liveAura, { opacity }]} />
    </View>
  );
}

function LipSyncPulse({ mood }: { mood: SabiVoiceMood }) {
  const pulse = useLoopedAnimation(220);
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.10, mood === "speaking" ? 0.86 : 0.16] });
  const scaleY = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.38, mood === "speaking" ? 1.22 : 0.42] });

  if (mood !== "speaking") return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.lipSyncPulse,
        {
          opacity,
          transform: [{ scaleY }],
        },
      ]}
    />
  );
}

function LiveVoiceControls({
  mood,
  disabled,
  language,
  recordingSeconds,
  onPress,
}: {
  mood: SabiVoiceMood;
  disabled: boolean;
  language: string;
  recordingSeconds: number;
  onPress: () => void;
}) {
  const pulse = useLoopedAnimation(mood === "listening" ? 360 : mood === "speaking" ? 300 : mood === "thinking" ? 520 : 920);
  const isActive = mood === "listening" || mood === "thinking" || mood === "speaking";
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, isActive ? 1.35 : 1.08] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.18, isActive ? 0.72 : 0.34] });
  const waveScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.72, isActive ? 1.15 : 0.9] });
  const statusText = voiceAssistantStatusText(language, mood);
  const actionHint = voiceAssistantActionHint(language, mood, recordingSeconds);
  const languageLabel = shortVoiceLanguageLabel(language);
  const recording = mood === "listening";
  const speaking = mood === "speaking";
  const thinking = mood === "thinking";

  const buttonStyle = [
    styles.micCore,
    recording && styles.micCoreListening,
    speaking && styles.micCoreSpeaking,
    thinking && styles.micCoreThinking,
    mood === "error" && styles.micCoreError,
  ];

  return (
    <View pointerEvents="box-none" style={styles.controlWrap}>
      <View pointerEvents="none" style={styles.stateSignalRow}>
        {[0, 1, 2, 3, 4, 5, 6].map((item) => (
          <Animated.View
            key={item}
            style={[
              styles.stateSignalBar,
              {
                opacity: isActive ? 0.95 : 0.30,
                transform: [
                  {
                    scaleY: pulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.34 + item * 0.04, 0.78 + ((item % 3) * 0.16)],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>

      <Pressable disabled={disabled} onPress={onPress} style={styles.micPressable} hitSlop={26}>
        <Animated.View pointerEvents="none" style={[styles.micOuterRing, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />
        <Animated.View pointerEvents="none" style={[styles.micWaveRing, { opacity: ringOpacity, transform: [{ scale: waveScale }] }]} />
        <View style={buttonStyle}>
          {thinking ? (
            <ActivityIndicator size="small" color="#E9FCFF" />
          ) : speaking ? (
            <Volume2 size={30} color="#FFFFFF" strokeWidth={2.6} />
          ) : recording ? (
            <MicOff size={30} color="#FFFFFF" strokeWidth={2.6} />
          ) : (
            <Mic size={32} color="#FFFFFF" strokeWidth={2.7} />
          )}
        </View>
        {recording ? <View pointerEvents="none" style={styles.recordingDot} /> : null}
      </Pressable>

      <View pointerEvents="none" style={styles.statusPill}>
        <View
          style={[
            styles.statusLamp,
            recording && styles.statusLampListening,
            speaking && styles.statusLampSpeaking,
            thinking && styles.statusLampThinking,
            mood === "error" && styles.statusLampError,
          ]}
        />
        <Text style={styles.statusText}>{statusText}</Text>
        <View style={styles.languageChip}>
          <Text style={styles.languageChipText}>{languageLabel}</Text>
        </View>
      </View>
      <View pointerEvents="none" style={styles.actionHintPill}>
        <Text style={styles.actionHintText}>{actionHint}</Text>
      </View>
    </View>
  );
}


function SoftStatusMessage({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <View pointerEvents="none" style={styles.softMessagePill}>
      <Text numberOfLines={2} style={styles.softMessageText}>{message}</Text>
    </View>
  );
}

// STEP72B_RUSSIAN_VOICE_LANGUAGE_LOCK_AND_PLAYBACK_STABILITY
export default function AiMobileVoiceControlScreen() {
  const insets = useSafeAreaInsets();
  const { language } = useI18n();
  const voice = useAiVoiceBridge();
  const [busy, setBusy] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastTurn, setLastTurn] = useState<AssistantTurn | null>(null);
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    voice.bindBridge().catch(() => undefined);
    return () => {
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      voice.interrupt().catch(() => undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!recordingStartedAt || !voice.state.isRecording) {
      setRecordingSeconds(0);
      return undefined;
    }

    const update = () => setRecordingSeconds(Math.max(0, Math.floor((Date.now() - recordingStartedAt) / 1000)));
    update();
    const timer = setInterval(update, 350);
    return () => clearInterval(timer);
  }, [recordingStartedAt, voice.state.isRecording]);

  const selectedVoiceLanguage = normalizeSabiVoiceLanguage(language);

  const mood: SabiVoiceMood = voice.state.isRecording
    ? "listening"
    : busy
      ? "thinking"
      : isSpeaking
        ? "speaking"
        : voice.state.lastError
          ? "error"
          : "idle";

  const showError = useCallback(
    (message: string) => {
      const clean = message.trim() || aiMobileText(language, "common.requestFailed");
      setInlineMessage(clean);
      setIsSpeaking(false);
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    },
    [language],
  );

  const ensureSession = useCallback(async () => {
    const started = await aiMobileApi.startVoiceSession({
      inputKind: "quick_invoke",
      mode: "assistant_voice",
      sourceLanguage: selectedVoiceLanguage,
      targetLanguage: selectedVoiceLanguage,
      source: "sabi_ai_voice_assistant_live_screen",
    });

    if (started.ok) {
      voice.setSessionId(started.data.sessionId);
      return started.data.sessionId;
    }

    return voice.state.activeSessionId;
  }, [selectedVoiceLanguage, voice]);

  const startListening = useCallback(async () => {
    setBusy(true);
    setInlineMessage(null);
    setIsSpeaking(false);
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      await voice.interrupt().catch(() => undefined);
      const bindResult = await voice.bindBridge();
      if (!bindResult.ok) {
        showError(aiMobileErrorText(language, bindResult.error));
        return;
      }

      await ensureSession();

      const started = await voice.startRecording();
      if (!started.ok) {
        showError(aiMobileErrorText(language, started.error));
      } else {
        setRecordingStartedAt(Date.now());
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      }
    } finally {
      setBusy(false);
    }
  }, [ensureSession, language, showError, voice]);

  const speakAnswer = useCallback(
    async (answerText: string, spokenLanguage: string) => {
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      setIsSpeaking(false);
      await voice.interrupt().catch(() => undefined);

      const tts = await voice.requestTts({
        text: answerText,
        sessionId: voice.state.activeSessionId,
        language: normalizeSabiVoiceLanguage(spokenLanguage),
      });

      if (!tts.ok) {
        showError(aiMobileErrorText(language, tts.error));
        return;
      }

      const playbackReady = Boolean(tts.data.audioUrl || tts.data.audioBase64);
      if (!playbackReady) {
        const status = String((tts.data as Record<string, unknown>).status || "");
        if (status === "voice_unavailable" || status === "stt_unavailable") {
          setIsSpeaking(false);
          setInlineMessage(answerText || voiceAssistantUnavailableText(spokenLanguage));
          return;
        }
      }

      setIsSpeaking(playbackReady);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => undefined);
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      speechTimerRef.current = setTimeout(() => setIsSpeaking(false), estimatePlaybackDuration(answerText));
    },
    [language, showError, voice],
  );

  const processCapturedVoice = useCallback(async () => {
    setBusy(true);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
      const stopped = await voice.stopRecording({ includeBase64: true });
      setRecordingStartedAt(null);
      if (!stopped.ok) {
        showError(aiMobileErrorText(language, stopped.error));
        return;
      }

      const recording = stopped.data;
      if (!recording.base64) {
        showError(voiceAssistantEmptySpeechText(language));
        return;
      }

      const stt = await aiMobileApi.transcribeVoiceAudio({
        audioBase64: recording.base64,
        audioUri: recording.uri,
        fileName: recording.fileName,
        mimeType: recording.mimeType || "audio/mp4",
        durationMillis: recording.durationMillis,
        sizeBytes: recording.sizeBytes,
        language: selectedVoiceLanguage,
        sourceLanguage: selectedVoiceLanguage,
        targetLanguage: selectedVoiceLanguage,
        source: "sabi_ai_voice_assistant_live_screen",
        listenForWakeWord: false,
      });

      if (!stt.ok) {
        showError(aiMobileErrorText(language, stt.error));
        return;
      }

      const sttStatus = String((stt.data as Record<string, unknown>).status || "");
      if (sttStatus === "stt_unavailable" || sttStatus === "voice_unavailable") {
        showError(voiceAssistantUnavailableText(selectedVoiceLanguage));
        return;
      }

      const transcript = extractTranscriptFromVoicePayload(stt.data);
      if (!transcript) {
        showError(voiceAssistantEmptySpeechText(language));
        return;
      }

      const assistant = await aiMobileApi.sendAssistantMessage({
        message: transcript,
        assistantMode: "chatgpt",
        source: "sabi_ai_voice_assistant_live_screen",
        webSearchEnabled: true,
        voiceOutput: {
          enabled: true,
          preferredVoiceGender: "female",
        },
        clientCapabilities: [
          `selected_voice_language:${selectedVoiceLanguage}`,
          `spoken_language_hint:${selectedVoiceLanguage}`,
          "voice_assistant_live_screen",
          "server_stt",
          "server_tts",
          "visible_microphone_state",
          "state_video_idle_listening_thinking_speaking",
          "mouth_animation_during_tts",
          "no_fake_voice_fallback",
        ],
        conversationHistory: lastTurn
          ? [
              { role: "user", text: lastTurn.transcript },
              { role: "assistant", text: lastTurn.answer },
            ]
          : [],
      });

      if (!assistant.ok) {
        showError(aiMobileErrorText(language, assistant.error));
        return;
      }

      const answerText = extractAssistantText(assistant.data);
      if (!answerText) {
        showError(voiceAssistantEmptyAnswerText(language));
        return;
      }

      const cleanAnswerText = polishAssistantVoiceAnswer(
        transcript,
        cleanUnwantedCurrencyFromMathAnswer(transcript, answerText),
        selectedVoiceLanguage,
      );
      // STEP72B: TTS must stay on the selected voice language. Do not infer TTS
      // language from the answer text because Russian requests containing the Latin
      // brand name "Sabi" were being routed to Uzbek/Kazakh-like voices.
      const spokenLanguage = selectedVoiceLanguage;

      setInlineMessage(null);
      setLastTurn({ transcript, answer: cleanAnswerText });
      await speakAnswer(cleanAnswerText, spokenLanguage);
    } finally {
      setBusy(false);
    }
  }, [language, lastTurn, selectedVoiceLanguage, showError, speakAnswer, voice]);

  const toggleVoice = useCallback(async () => {
    if (busy) return;

    if (voice.state.isRecording) {
      await processCapturedVoice();
      return;
    }

    if (isSpeaking) {
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      setIsSpeaking(false);
      setRecordingStartedAt(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      await voice.interrupt();
      return;
    }

    await startListening();
  }, [busy, isSpeaking, processCapturedVoice, startListening, voice]);

  return (
    <LinearGradient colors={["#02040D", "#07122C", "#02040D"]} style={styles.root}>
      <StatusBar hidden />
      <View style={styles.stage}>
        <LiveVideoBackdrop mood={mood} />
        <LipSyncPulse mood={mood} />

        <View pointerEvents="box-none" style={[styles.hitLayer, { paddingTop: Math.max(insets.top, 0) }]}> 
          <Pressable onPress={safeBackFromVoiceAssistant} style={styles.backHitZone} hitSlop={18} />
          <Pressable onPress={toggleVoice} style={styles.topVoiceHitZone} hitSlop={18} />
        </View>

        <SoftStatusMessage message={inlineMessage} />
        <LiveVoiceControls mood={mood} disabled={busy} language={selectedVoiceLanguage} recordingSeconds={recordingSeconds} onPress={toggleVoice} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#02040D",
  },
  stage: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#02040D",
  },
  fallbackStage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#02040D",
  },
  fallbackOuterRing: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    borderWidth: 1,
    borderColor: "rgba(83, 226, 255, 0.32)",
    backgroundColor: "rgba(34, 198, 255, 0.07)",
    shadowColor: "#51E6FF",
    shadowOpacity: 0.75,
    shadowRadius: 46,
    shadowOffset: { width: 0, height: 0 },
  },
  fallbackBodyAura: {
    width: 210,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 120,
    backgroundColor: "rgba(26, 39, 74, 0.46)",
    borderWidth: 1,
    borderColor: "rgba(118, 231, 255, 0.24)",
  },
  fallbackHead: {
    width: 118,
    height: 138,
    borderRadius: 64,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(216, 246, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(192, 246, 255, 0.34)",
  },
  fallbackEyeRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 18,
  },
  fallbackEye: {
    width: 12,
    height: 18,
    borderRadius: 8,
    backgroundColor: "rgba(198, 251, 255, 0.92)",
    shadowColor: "#84F6FF",
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  fallbackMouth: {
    width: 34,
    height: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 154, 194, 0.74)",
  },
  fallbackShoulders: {
    width: 162,
    height: 86,
    marginTop: -8,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    backgroundColor: "rgba(70, 121, 190, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(126, 227, 255, 0.18)",
  },
  videoBreath: {
    ...StyleSheet.absoluteFillObject,
  },
  liveVideo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#02040D",
  },
  liveAura: {
    position: "absolute",
    left: "18%",
    right: "18%",
    top: "23%",
    bottom: "23%",
    borderRadius: 260,
    backgroundColor: "rgba(65, 219, 255, 0.18)",
    shadowColor: "#58DFFF",
    shadowOpacity: 0.95,
    shadowRadius: 38,
    shadowOffset: { width: 0, height: 0 },
  },
  lipSyncPulse: {
    position: "absolute",
    left: "48.1%",
    top: "40.3%",
    width: 28,
    height: 10,
    marginLeft: -14,
    borderRadius: 9,
    backgroundColor: "rgba(75, 22, 56, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(255, 160, 194, 0.50)",
    shadowColor: "#FF7DB7",
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  hitLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  backHitZone: {
    position: "absolute",
    left: 18,
    top: 34,
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  topVoiceHitZone: {
    position: "absolute",
    right: 18,
    top: 34,
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  softMessagePill: {
    position: "absolute",
    left: 22,
    right: 22,
    bottom: 172,
    minHeight: 42,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5, 14, 32, 0.74)",
    borderWidth: 1,
    borderColor: "rgba(112, 226, 255, 0.28)",
  },
  softMessageText: {
    color: "rgba(235, 253, 255, 0.94)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  controlWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 30,
    alignItems: "center",
  },
  stateSignalRow: {
    position: "absolute",
    bottom: 93,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  stateSignalBar: {
    width: 5,
    height: 38,
    borderRadius: 5,
    backgroundColor: "rgba(97, 235, 255, 0.95)",
    shadowColor: "#62EAFF",
    shadowOpacity: 0.85,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  micPressable: {
    width: 116,
    height: 116,
    alignItems: "center",
    justifyContent: "center",
  },
  micOuterRing: {
    position: "absolute",
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 2,
    borderColor: "rgba(89, 229, 255, 0.70)",
    backgroundColor: "rgba(38, 215, 255, 0.10)",
  },
  micWaveRing: {
    position: "absolute",
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
    borderColor: "rgba(165, 113, 255, 0.76)",
    backgroundColor: "rgba(100, 66, 255, 0.14)",
  },
  micCore: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(25, 205, 255, 0.26)",
    borderWidth: 1,
    borderColor: "rgba(146, 242, 255, 0.72)",
    shadowColor: "#52E5FF",
    shadowOpacity: 0.92,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  micCoreListening: {
    backgroundColor: "rgba(255, 69, 96, 0.62)",
    borderColor: "rgba(255, 166, 180, 0.92)",
    shadowColor: "#FF4F73",
  },
  micCoreSpeaking: {
    backgroundColor: "rgba(98, 76, 255, 0.50)",
    borderColor: "rgba(175, 148, 255, 0.88)",
    shadowColor: "#906EFF",
  },
  micCoreThinking: {
    backgroundColor: "rgba(58, 210, 255, 0.35)",
    borderColor: "rgba(140, 237, 255, 0.78)",
    shadowColor: "#4FE9FF",
  },
  micCoreError: {
    backgroundColor: "rgba(255, 66, 90, 0.42)",
    borderColor: "rgba(255, 150, 165, 0.88)",
    shadowColor: "#FF4964",
  },
  recordingDot: {
    position: "absolute",
    right: 18,
    top: 18,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#FF3858",
    borderWidth: 1,
    borderColor: "rgba(255, 220, 226, 0.90)",
    shadowColor: "#FF3858",
    shadowOpacity: 0.95,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  statusPill: {
    marginTop: 8,
    minWidth: 128,
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(4, 12, 28, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(107, 219, 255, 0.26)",
  },
  statusLamp: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#61EAFF",
  },
  statusLampListening: {
    backgroundColor: "#FF486A",
  },
  statusLampSpeaking: {
    backgroundColor: "#A981FF",
  },
  statusLampThinking: {
    backgroundColor: "#56EAFF",
  },
  statusLampError: {
    backgroundColor: "#FF4D61",
  },
  languageChip: {
    minWidth: 30,
    height: 20,
    paddingHorizontal: 7,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(95, 227, 255, 0.13)",
    borderWidth: 1,
    borderColor: "rgba(107, 219, 255, 0.30)",
  },
  languageChipText: {
    color: "rgba(217, 250, 255, 0.92)",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  actionHintPill: {
    marginTop: 7,
    minWidth: 176,
    minHeight: 34,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(3, 10, 24, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(116, 232, 255, 0.22)",
    shadowColor: "#43DCFF",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  actionHintText: {
    color: "rgba(234, 253, 255, 0.96)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  statusText: {
    color: "rgba(229, 252, 255, 0.94)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
});
