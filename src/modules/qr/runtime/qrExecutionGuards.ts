import { translateQrMobileText } from "../../../shared/i18n/qr-mobile-translations";
import type { TranslationLanguage } from "../../../shared/i18n";
import type {
  SabiQrExecuteResponse,
  SabiQrFunctionDefinition,
  SabiQrTokenRecord,
} from "../contracts/universalQr.contracts";

export type SabiQrConfirmSeverity = "safe" | "notice" | "warning" | "critical";

export type SabiQrConfirmAction = {
  title: string;
  description: string;
  severity: SabiQrConfirmSeverity;
  primaryLabel: string;
  canExecute: boolean;
  requiresExplicitConfirmation: boolean;
};

function tq(language: TranslationLanguage | string | undefined, key: string): string {
  return translateQrMobileText(language, key);
}

export function createSabiQrIdempotencyKey(prefix = "qr_execute"): string {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${randomPart}`;
}

export function getSabiQrConfirmAction(
  definition: SabiQrFunctionDefinition,
  token: SabiQrTokenRecord,
  language?: TranslationLanguage | string,
): SabiQrConfirmAction {
  if (token.trustState === "provider_not_configured") {
    return {
      title: tq(language, "qr.mobile.result.providerNotConfigured.title"),
      description: tq(language, "qr.mobile.result.providerNotConfigured.description"),
      severity: "critical",
      primaryLabel: tq(language, "qr.mobile.action.internalSetup.primary"),
      canExecute: false,
      requiresExplicitConfirmation: true,
    };
  }

  if (token.trustState === "pending_admin_setup") {
    return {
      title: tq(language, "qr.mobile.action.internalSetup.title"),
      description: tq(language, "qr.mobile.action.internalSetup.description"),
      severity: "critical",
      primaryLabel: tq(language, "qr.mobile.action.internalSetup.primary"),
      canExecute: false,
      requiresExplicitConfirmation: true,
    };
  }

  if (token.trustState !== "server_signed" && token.trustState !== "server_validated") {
    return {
      title: tq(language, "qr.mobile.action.notTrusted.title"),
      description: tq(language, "qr.mobile.action.notTrusted.description"),
      severity: "critical",
      primaryLabel: tq(language, "qr.mobile.action.notTrusted.primary"),
      canExecute: false,
      requiresExplicitConfirmation: true,
    };
  }

  const expiresAt = Date.parse(token.expiresAt);
  if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
    return {
      title: tq(language, "qr.mobile.action.expired.title"),
      description: tq(language, "qr.mobile.action.expired.description"),
      severity: "critical",
      primaryLabel: tq(language, "qr.mobile.action.expired.primary"),
      canExecute: false,
      requiresExplicitConfirmation: true,
    };
  }

  if (definition.executionPolicy === "identity_open_only") {
    return {
      title: tq(language, "qr.mobile.action.identity.title"),
      description: tq(language, "qr.mobile.action.identity.description"),
      severity: "safe",
      primaryLabel: tq(language, "qr.mobile.action.identity.primary"),
      canExecute: true,
      requiresExplicitConfirmation: false,
    };
  }

  if (definition.executionPolicy === "crypto_receive_only") {
    return {
      title: tq(language, "qr.mobile.action.crypto.title"),
      description: tq(language, "qr.mobile.action.crypto.description"),
      severity: "warning",
      primaryLabel: tq(language, "qr.mobile.action.crypto.primary"),
      canExecute: true,
      requiresExplicitConfirmation: false,
    };
  }

  if (definition.executionPolicy === "attendance_record_required") {
    return {
      title: tq(language, "qr.mobile.action.attendance.title"),
      description: tq(language, "qr.mobile.action.attendance.description"),
      severity: "notice",
      primaryLabel: tq(language, "qr.mobile.action.attendance.primary"),
      canExecute: true,
      requiresExplicitConfirmation: true,
    };
  }

  if (definition.executionPolicy === "card_issuing_provider_required") {
    return {
      title: tq(language, "qr.mobile.action.card.title"),
      description: tq(language, "qr.mobile.action.card.description"),
      severity: "critical",
      primaryLabel: tq(language, "qr.mobile.action.card.primary"),
      canExecute: true,
      requiresExplicitConfirmation: true,
    };
  }

  if (
    definition.executionPolicy === "wallet_payment_intent_required" ||
    definition.executionPolicy === "coin_wallet_intent_required" ||
    definition.executionPolicy === "server_execute_required"
  ) {
    return {
      title: tq(language, "qr.mobile.action.payment.title"),
      description: tq(language, "qr.mobile.action.payment.description"),
      severity: "critical",
      primaryLabel: tq(language, "qr.mobile.action.payment.primary"),
      canExecute: true,
      requiresExplicitConfirmation: true,
    };
  }

  if (definition.executionPolicy === "provider_admin_required") {
    return {
      title: tq(language, "qr.mobile.action.internalSetup.title"),
      description: tq(language, "qr.mobile.action.internalSetup.description"),
      severity: "critical",
      primaryLabel: tq(language, "qr.mobile.action.internalSetup.primary"),
      canExecute: true,
      requiresExplicitConfirmation: true,
    };
  }

  return {
    title: tq(language, "qr.mobile.action.validation.title"),
    description: tq(language, "qr.mobile.action.validation.description"),
    severity: "warning",
    primaryLabel: tq(language, "qr.mobile.action.validation.primary"),
    canExecute: true,
    requiresExplicitConfirmation: true,
  };
}

export function describeSabiQrExecuteResult(
  result: SabiQrExecuteResponse,
  language?: TranslationLanguage | string,
): {
  title: string;
  description: string;
  severity: SabiQrConfirmSeverity;
} {
  if (result.ok && result.status === "success") {
    return {
      title: tq(language, "qr.mobile.result.success.title"),
      description: tq(language, "qr.mobile.result.success.description"),
      severity: "safe",
    };
  }

  if (result.status === "pending_review") {
    return {
      title: tq(language, "qr.mobile.result.pendingReview.title"),
      description: tq(language, "qr.mobile.result.pendingReview.description"),
      severity: "warning",
    };
  }

  if (result.status === "provider_not_configured") {
    return {
      title: tq(language, "qr.mobile.result.providerNotConfigured.title"),
      description: tq(language, "qr.mobile.result.providerNotConfigured.description"),
      severity: "critical",
    };
  }

  if (result.status === "executor_not_configured") {
    return {
      title: tq(language, "qr.mobile.result.executorNotConfigured.title"),
      description: tq(language, "qr.mobile.result.executorNotConfigured.description"),
      severity: "critical",
    };
  }

  if (result.status === "restricted") {
    return {
      title: tq(language, "qr.mobile.result.restricted.title"),
      description: tq(language, "qr.mobile.result.restricted.description"),
      severity: "critical",
    };
  }

  return {
    title: tq(language, "qr.mobile.result.failed.title"),
    description: tq(language, "qr.mobile.result.failed.description"),
    severity: "critical",
  };
}
