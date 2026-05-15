import type { SabiQrFunctionDefinition } from "../contracts/universalQr.contracts";

export function normalizeQrText(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeQrAmount(value: string | null | undefined): string | null {
  const normalized = normalizeQrText(value);
  if (!normalized) return null;
  return normalized.replace(/,/g, ".");
}

export function normalizeQrCurrency(value: string | null | undefined): string | null {
  const normalized = normalizeQrText(value);
  if (!normalized) return null;
  return normalized.toUpperCase();
}

export function validateQrInput(
  definition: SabiQrFunctionDefinition,
  input: {
    amount?: string | null;
    currency?: string | null;
  },
): string | null {
  if (definition.requiresAmount && !normalizeQrAmount(input.amount)) {
    return "qr.mobile.error.amountRequired";
  }

  if (definition.requiresAmount && !normalizeQrCurrency(input.currency)) {
    return "qr.mobile.error.currencyRequired";
  }

  return null;
}
