export type SabiHandsFreeVoiceStatus =
  | "initializing"
  | "listening"
  | "processing"
  | "wake_detected"
  | "answering"
  | "sleeping"
  | "unavailable";

const WAKE_WORD_PATTERNS = [
  /^sabi[\s,.:;!؟-]*/i,
  /^саби[\s,.:;!-]*/i,
  /^сабӣ[\s,.:;!-]*/i,
  /^сави[\s,.:;!-]*/i,
  /^saby[\s,.:;!-]*/i,
];

export function extractSabiVoiceTranscript(payload: unknown): string | null {
  const record = toRecord(payload);
  const data = toRecord(record?.data) ?? record;
  const nested = toRecord(data?.result) ?? toRecord(data?.transcription) ?? toRecord(data?.payload) ?? data;

  const direct = readString(nested?.transcript)
    || readString(nested?.text)
    || readString(nested?.recognizedText)
    || readString(nested?.speechText)
    || readString(nested?.normalizedText)
    || readString(data?.transcript)
    || readString(data?.text)
    || readString(record?.transcript)
    || readString(record?.text);

  return direct ? direct.trim() : null;
}

export function hasSabiWakeWord(transcript: string): boolean {
  const clean = transcript.trim();
  if (!clean) return false;
  return WAKE_WORD_PATTERNS.some((pattern) => pattern.test(clean));
}

export function stripSabiWakeWord(transcript: string): string {
  let clean = transcript.trim();
  for (const pattern of WAKE_WORD_PATTERNS) {
    clean = clean.replace(pattern, "").trim();
  }
  return clean || "Sabi";
}

export function handsFreeVoiceStatusText(language: string, status: SabiHandsFreeVoiceStatus): string {
  const lang = String(language || "ru").toLowerCase();

  if (lang.startsWith("uz")) {
    if (status === "listening") return "Sabi ovozni tinglayapti";
    if (status === "processing") return "Ovoz tekshirilmoqda";
    if (status === "wake_detected") return "Sabi eshitdi";
    if (status === "answering") return "Sabi javob tayyorlayapti";
    if (status === "unavailable") return "Ovoz provayderi ulanmagan";
    return "Sabi ovozli yordamchi tayyorlanmoqda";
  }

  if (lang.startsWith("en")) {
    if (status === "listening") return "Sabi is listening";
    if (status === "processing") return "Checking voice";
    if (status === "wake_detected") return "Sabi heard you";
    if (status === "answering") return "Sabi is answering";
    if (status === "unavailable") return "Voice provider is not connected";
    return "Sabi voice assistant is preparing";
  }

  if (status === "listening") return "Sabi слушает голос";
  if (status === "processing") return "Проверяю голос";
  if (status === "wake_detected") return "Sabi услышала команду";
  if (status === "answering") return "Sabi готовит ответ";
  if (status === "unavailable") return "Голосовой провайдер не подключён";
  return "Sabi готовит голосовой режим";
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
