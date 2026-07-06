import { aiMobileApi } from "../mobile/aiMobileApi";

export type AiMessengerInlineTranslationRequest = {
  text: string;
  sourceLanguage?: string | null;
  targetLanguage: string;
  chatId?: string | null;
  messageId?: string | null;
  userId?: string | null;
};

export type AiMessengerInlineTranslationResult = {
  translatedText: string;
  sourceLanguage?: string | null;
  targetLanguage?: string | null;
  provider?: string | null;
};

function normalizeLanguage(value?: string | null): string {
  const normalized = String(value || "").trim().replace(/_/g, "-");
  return normalized || "ru";
}

function normalizeProviderError(code?: string | null, message?: string | null): string {
  const raw = [code, message].filter(Boolean).join(" ").trim().toLowerCase();

  if (
    raw.includes("provider_gateway_unavailable") ||
    raw.includes("ai_provider_gateway_unavailable") ||
    raw.includes("provider_not_configured") ||
    raw.includes("translation_provider_not_configured") ||
    raw.includes("gateway") ||
    raw.includes("502") ||
    raw.includes("503")
  ) {
    return "AI translation provider is unavailable on the server.";
  }

  if (raw.includes("premium") || raw.includes("402")) {
    return "AI Premium is required for this translation.";
  }

  if (raw.includes("auth") || raw.includes("401")) {
    return "Sign in again to use AI translation.";
  }

  if (raw.includes("consent") || raw.includes("403")) {
    return "AI translation permission is required.";
  }

  const cleanMessage = String(message || "").trim();
  if (cleanMessage && !/^[a-z][a-z0-9_:-]+$/i.test(cleanMessage)) {
    return cleanMessage;
  }

  return "AI translation is unavailable right now.";
}

export async function translateMessengerInlineMessage(
  request: AiMessengerInlineTranslationRequest,
): Promise<AiMessengerInlineTranslationResult> {
  const text = String(request.text || "").trim();
  const targetLanguage = normalizeLanguage(request.targetLanguage);
  const sourceLanguage = request.sourceLanguage && request.sourceLanguage !== "auto"
    ? normalizeLanguage(request.sourceLanguage)
    : null;

  if (!text) {
    throw new Error("This message cannot be translated.");
  }

  const response = await aiMobileApi.translateText(text, targetLanguage, sourceLanguage);

  if (!response.ok) {
    throw new Error(normalizeProviderError(response.error.code, response.error.message));
  }

  const translatedText = String(response.data.translatedText || "").trim();

  if (!translatedText) {
    throw new Error("AI translation did not return text.");
  }

  return {
    translatedText,
    sourceLanguage: response.data.sourceLanguage || sourceLanguage || "auto",
    targetLanguage: response.data.targetLanguage || targetLanguage,
    provider: response.data.provider || "yandex",
  };
}
