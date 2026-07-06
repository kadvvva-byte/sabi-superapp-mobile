export type SabiQrVisibleValueKind =
  | "human"
  | "reference"
  | "receipt"
  | "phone"
  | "url";

const TECHNICAL_PREFIX_PATTERN = /^(QR-|PI-|SABI[_:-]|TOKEN[_:-]|UUID[_:-])/i;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LONG_HEX_PATTERN = /^[0-9a-f]{24,}$/i;
const LONG_TOKEN_PATTERN = /^[A-Za-z0-9_-]{22,}$/;
const PATH_TOKEN_PATTERN = /\/(q|qr|token|scan)\/[A-Za-z0-9_-]{6,}/i;

function normalizeVisibleText(value: unknown): string {
  if (typeof value === "string") return value.replace(/\u0000/g, "").trim();
  if (value === null || value === undefined) return "";
  return String(value).replace(/\u0000/g, "").trim();
}

function compactVisibleText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function isSabiQrTechnicalDisplayValue(value: unknown): boolean {
  const text = compactVisibleText(normalizeVisibleText(value));
  if (!text || text === "—") return false;

  if (TECHNICAL_PREFIX_PATTERN.test(text)) return true;
  if (UUID_PATTERN.test(text)) return true;
  if (LONG_HEX_PATTERN.test(text)) return true;
  if (PATH_TOKEN_PATTERN.test(text)) return true;

  const withoutSeparators = text.replace(/[\s._:-]/g, "");
  if (withoutSeparators.length >= 26 && LONG_TOKEN_PATTERN.test(withoutSeparators)) {
    return true;
  }

  return false;
}

export function cleanSabiQrUserDisplayValue(
  value: unknown,
  options: {
    readonly kind?: SabiQrVisibleValueKind;
    readonly maxLength?: number;
    readonly allowTechnicalReceiptShortCode?: boolean;
  } = {},
): string {
  const kind = options.kind ?? "human";
  const maxLength = options.maxLength ?? (kind === "receipt" ? 18 : 72);
  const text = compactVisibleText(normalizeVisibleText(value));
  if (!text || text === "—") return "";

  if (kind !== "phone" && kind !== "url" && isSabiQrTechnicalDisplayValue(text)) {
    if (kind === "receipt" && options.allowTechnicalReceiptShortCode) {
      const tail = text.replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase();
      return tail ? `…${tail}` : "";
    }
    return "";
  }

  if (kind === "phone") {
    const phone = text.replace(/[()\s.-]/g, "");
    return /^\+?\d{7,15}$/.test(phone) ? phone : "";
  }

  if (kind === "url") {
    try {
      const url = new URL(text);
      const host = url.hostname.replace(/^www\./i, "");
      const path = url.pathname
        .split("/")
        .map((part) => part.trim())
        .filter(Boolean)[0];
      return compactVisibleText(path ? `${host}/${path}` : host).slice(0, maxLength);
    } catch {
      return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
    }
  }

  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

export function cleanSabiQrReceiptValue(value: unknown): string {
  return cleanSabiQrUserDisplayValue(value, {
    kind: "receipt",
    maxLength: 18,
    allowTechnicalReceiptShortCode: true,
  });
}

export function hasSabiQrUserVisibleValue(value: unknown): boolean {
  return Boolean(cleanSabiQrUserDisplayValue(value));
}
