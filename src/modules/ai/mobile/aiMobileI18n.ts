const SABI_AI_123_EXTRA_TEXT: Record<string, Record<string, string>> = {
  en: {
    "chat.voiceFallbackPrompt": "Process this voice message as an AI command.",
    "chat.voiceCommandMeta": "Voice command · female TTS requested",
    "chat.providerUnavailable": "AI provider is not connected on the server. Fake answers are not used.",
    "premium.statusActive": "Premium active",
    "premium.statusFreeBasic": "Free basic mode",
    "premium.badge": "Premium",
    "premium.requiredTitle": "Premium required",
    "premium.requiredMessage": "This feature is Premium-only: {feature}. Free mode supports basic text Sabi AI chat.",
    "premium.feature.mode": "special AI mode",
    "premium.feature.web_search": "web search",
    "premium.feature.voice": "voice AI",
    "premium.feature.camera": "camera",
    "premium.feature.photo": "photo upload",
    "premium.feature.video": "video upload",
    "premium.feature.document": "document upload",
    "premium.feature.attachment": "attachments"
  },
  ru: {
    "chat.voiceFallbackPrompt": "Обработай это голосовое сообщение как команду для AI.",
    "chat.voiceCommandMeta": "Голосовая команда · запрошен женский голос TTS",
    "chat.providerUnavailable": "AI-провайдер ответов не подключён на сервере. Фейковые ответы не используются.",
    "premium.statusActive": "Premium активен",
    "premium.statusFreeBasic": "Бесплатный базовый режим",
    "premium.badge": "Premium",
    "premium.requiredTitle": "Нужен Premium",
    "premium.requiredMessage": "Эта функция доступна только в Premium: {feature}. В бесплатном режиме работает базовый текстовый чат Sabi AI.",
    "premium.feature.mode": "специальный AI-режим",
    "premium.feature.web_search": "поиск в интернете",
    "premium.feature.voice": "голосовой AI",
    "premium.feature.camera": "камера",
    "premium.feature.photo": "загрузка фото",
    "premium.feature.video": "загрузка видео",
    "premium.feature.document": "загрузка документов",
    "premium.feature.attachment": "работа с файлами"
  },
  uz: {
    "chat.voiceFallbackPrompt": "Ushbu ovozli xabarni AI buyrug‘i sifatida qayta ishlang.",
    "chat.voiceCommandMeta": "Ovozli buyruq · ayol TTS ovozi so‘raldi",
    "chat.providerUnavailable": "AI javob provayderi serverda ulanmagan. Soxta javoblar ishlatilmaydi.",
    "premium.statusActive": "Premium faol",
    "premium.statusFreeBasic": "Bepul asosiy rejim",
    "premium.badge": "Premium",
    "premium.requiredTitle": "Premium kerak",
    "premium.requiredMessage": "Bu funksiya faqat Premium uchun: {feature}. Bepul rejimda asosiy matnli Sabi AI chat ishlaydi.",
    "premium.feature.mode": "maxsus AI rejimi",
    "premium.feature.web_search": "internet qidiruv",
    "premium.feature.voice": "ovozli AI",
    "premium.feature.camera": "kamera",
    "premium.feature.photo": "foto yuklash",
    "premium.feature.video": "video yuklash",
    "premium.feature.document": "hujjat yuklash",
    "premium.feature.attachment": "fayllar bilan ishlash"
  },
  zh: {
    "chat.voiceFallbackPrompt": "请将此语音消息作为 AI 指令处理。",
    "chat.voiceCommandMeta": "语音指令 · 已请求女性 TTS 语音",
    "chat.providerUnavailable": "AI 服务商尚未在服务器连接。不会使用虚假回答。",
    "premium.statusActive": "Premium 已启用",
    "premium.statusFreeBasic": "免费基础模式",
    "premium.badge": "Premium",
    "premium.requiredTitle": "需要 Premium",
    "premium.requiredMessage": "此功能仅限 Premium：{feature}。免费模式支持基础文字 Sabi AI 聊天。",
    "premium.feature.mode": "特殊 AI 模式",
    "premium.feature.web_search": "网页搜索",
    "premium.feature.voice": "语音 AI",
    "premium.feature.camera": "相机",
    "premium.feature.photo": "上传照片",
    "premium.feature.video": "上传视频",
    "premium.feature.document": "上传文档",
    "premium.feature.attachment": "附件"
  },
  ar: {
    "chat.voiceFallbackPrompt": "عالج هذه الرسالة الصوتية كأمر للذكاء الاصطناعي.",
    "chat.voiceCommandMeta": "أمر صوتي · تم طلب صوت TTS نسائي",
    "chat.providerUnavailable": "مزود إجابات AI غير متصل على الخادم. لا يتم استخدام إجابات وهمية.",
    "premium.statusActive": "Premium مفعل",
    "premium.statusFreeBasic": "الوضع الأساسي المجاني",
    "premium.badge": "Premium",
    "premium.requiredTitle": "Premium مطلوب",
    "premium.requiredMessage": "هذه الميزة متاحة فقط في Premium: {feature}. الوضع المجاني يدعم محادثة Sabi AI النصية الأساسية.",
    "premium.feature.mode": "وضع AI خاص",
    "premium.feature.web_search": "بحث الويب",
    "premium.feature.voice": "AI صوتي",
    "premium.feature.camera": "الكاميرا",
    "premium.feature.photo": "رفع الصور",
    "premium.feature.video": "رفع الفيديو",
    "premium.feature.document": "رفع المستندات",
    "premium.feature.attachment": "المرفقات"
  }
};

import {
  t as translateApp,
  type TranslationLanguage,
  type TranslationParams,
} from "../../../shared/i18n";
import type { AiMobileApiError } from "./aiMobileTypes";

export function normalizeAiMobileKey(key: string): string {
  return key.startsWith("ai.mobile.") ? key : `ai.mobile.${key}`;
}

export function denormalizeAiMobileKey(key: string): string {
  return key.startsWith("ai.mobile.") ? key.slice("ai.mobile.".length) : key;
}

export function isMissingAiMobileText(value: string, key: string): boolean {
  const normalizedKey = normalizeAiMobileKey(key);
  const localKey = denormalizeAiMobileKey(key);

  return value === normalizedKey || value === key || value === localKey;
}

function aiMobileTextBase(
  _language: TranslationLanguage | string | null | undefined,
  key: string,
  params?: TranslationParams,
): string {
  const normalizedKey = normalizeAiMobileKey(key);
  const value = translateApp(normalizedKey, params);

  if (!isMissingAiMobileText(value, key)) {
    return value;
  }

  return denormalizeAiMobileKey(key);
}

export function aiMobileTextOrFallback(
  language: TranslationLanguage | string | null | undefined,
  key: string,
  fallback: string,
  params?: TranslationParams,
): string {
  const value = aiMobileText(language, key, params);
  return isMissingAiMobileText(value, key) ? fallback : value;
}

export function aiMobileErrorText(
  language: TranslationLanguage | string | null | undefined,
  error: AiMobileApiError | string | null | undefined,
  fallbackKey = "common.requestFailed",
): string {
  if (typeof error === "object" && error?.code) {
    const codeText = aiMobileText(language, `error.${error.code}`);

    if (!isMissingAiMobileText(codeText, `error.${error.code}`)) {
      return codeText;
    }
  }

  if (typeof error === "string" && error.trim()) {
    const codeText = aiMobileText(language, `error.${error}`);

    if (!isMissingAiMobileText(codeText, `error.${error}`)) {
      return codeText;
    }
  }

  return aiMobileText(language, fallbackKey);
}

export function aiMobileText(...args: Parameters<typeof aiMobileTextBase>): ReturnType<typeof aiMobileTextBase> {
  const language = String(args[0] ?? "en").toLowerCase();
  const key = String(args[1] ?? "");
  const shortLanguage = language.split("-")[0] || "en";
  const extra =
    SABI_AI_123_EXTRA_TEXT[language]?.[key] ??
    SABI_AI_123_EXTRA_TEXT[shortLanguage]?.[key] ??
    SABI_AI_123_EXTRA_TEXT.en?.[key];

  if (extra) {
    return extra as ReturnType<typeof aiMobileTextBase>;
  }

  return aiMobileTextBase(...args);
}
