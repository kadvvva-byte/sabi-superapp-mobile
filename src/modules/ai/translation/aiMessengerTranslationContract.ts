export const AI_MESSENGER_TRANSLATION_BRIDGE = {
  version: "AI-31",
  owner: "messenger_chat_runtime",
  note:
    "AI Translation uses provider gateway language pairs. Messenger will later reuse the same sourceLanguage/targetLanguage model for text bubbles, audio transcripts, video transcripts and call subtitles.",
  routes: {
    textMessage: "/api/ai/translation/realtime/message",
    audioTranscript: "/api/ai/translation/realtime/media-transcript",
    videoTranscript: "/api/ai/translation/realtime/media-transcript",
    callSegment: "/api/ai/translation/realtime/call-segment",
    session: "/api/ai/translation/realtime/session",
    textTranslate: "/api/ai/translate",
    imageTranslate: "/api/ai/translate/image",
  },
  providers: {
    preferredTextProvider: "google",
    preferredImageProvider: "google",
    fallbackProvider: "yandex",
    internalDictionaryAllowed: false,
    providerGatewayRequired: true,
  },
  surfaces: {
    chatText: "text_chat",
    audioMessage: "audio_message",
    videoMessage: "video_message",
    voiceCall: "voice_call",
    videoCall: "video_call",
    aiVoiceMeeting: "ai_voice_meeting",
  },
  contentTypes: {
    text: "text",
    image: "image",
    document: "document",
    audioMessage: "audio_message",
    videoMessage: "video_message",
    call: "call",
  },
  languagePairFields: {
    sourceLanguage: "sourceLanguage",
    targetLanguage: "targetLanguage",
    autoDetectValue: "auto",
  },
  mobileRules: {
    allowAnyProviderLanguageCode: true,
    sourceLanguageMayBeAuto: true,
    targetLanguageMayNotBeAuto: true,
    preserveFormatting: true,
    allowFallback: false,
    noFakeTranslation: true,
  },
  messengerFutureRules: {
    doNotModifyMessengerNow: true,
    textBubbleTranslationLater: true,
    audioMessageTranscriptTranslationLater: true,
    videoMessageTranscriptTranslationLater: true,
    callSubtitleTranslationLater: true,
    premiumGateRequiredLater: true,
  },
} as const;

export type AiMessengerTranslationSurface =
  (typeof AI_MESSENGER_TRANSLATION_BRIDGE.surfaces)[keyof typeof AI_MESSENGER_TRANSLATION_BRIDGE.surfaces];

export type AiMessengerTranslationContentType =
  (typeof AI_MESSENGER_TRANSLATION_BRIDGE.contentTypes)[keyof typeof AI_MESSENGER_TRANSLATION_BRIDGE.contentTypes];