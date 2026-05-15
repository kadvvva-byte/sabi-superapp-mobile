import type { AppNotification, NotificationModule } from "../../../../modules/notifications/types";

export type SabiHomeNotificationSource =
  | "messenger"
  | "wallet"
  | "qr"
  | "events"
  | "ai"
  | "marketplace"
  | "taxi"
  | "delivery"
  | "security"
  | "system";

export type SabiHomeNotificationSeverity = "info" | "success" | "warning" | "critical";

export type SabiHomeNotificationHookKind =
  | "missed_call"
  | "message_received"
  | "event_reminder"
  | "ai_alert"
  | "wallet_alert"
  | "qr_security_review"
  | "delivery_status"
  | "marketplace_status"
  | "taxi_status"
  | "system_warning";

export type SabiHomeNotificationHookInput = {
  id: string;
  source: SabiHomeNotificationSource;
  kind: SabiHomeNotificationHookKind;
  title: string;
  message: string;
  createdAt: string;
  severity?: SabiHomeNotificationSeverity;
  referenceId?: string;
  counterparty?: string;
  isRead?: boolean;
};

const sourceToModule: Record<SabiHomeNotificationSource, Exclude<NotificationModule, "all" | "balance">> = {
  messenger: "messenger",
  wallet: "wallet",
  qr: "system",
  events: "system",
  ai: "ai",
  marketplace: "marketplace",
  taxi: "system",
  delivery: "system",
  security: "security",
  system: "system",
};

const kindToEventType: Record<SabiHomeNotificationHookKind, AppNotification["eventType"]> = {
  missed_call: "missed_call",
  message_received: "message_received",
  event_reminder: "event_reminder",
  ai_alert: "ai_alert",
  wallet_alert: "system_update",
  qr_security_review: "qr_security_review",
  delivery_status: "system_update",
  marketplace_status: "marketplace_payment",
  taxi_status: "system_update",
  system_warning: "system_update",
};

function toStatus(severity: SabiHomeNotificationSeverity | undefined): AppNotification["status"] {
  if (severity === "success") return "success";
  if (severity === "critical" || severity === "warning") return "failed";
  return "info";
}

function toPriority(severity: SabiHomeNotificationSeverity | undefined): AppNotification["priority"] {
  if (severity === "critical") return "critical";
  if (severity === "warning") return "high";
  if (severity === "success") return "medium";
  return "medium";
}

export function buildSabiHomeNotification(input: SabiHomeNotificationHookInput): AppNotification {
  return {
    id: input.id,
    module: sourceToModule[input.source],
    eventType: kindToEventType[input.kind],
    title: input.title,
    message: input.message,
    status: toStatus(input.severity),
    priority: toPriority(input.severity),
    createdAt: input.createdAt,
    isRead: input.isRead ?? false,
    isPinned: input.severity === "critical",
    isCritical: input.severity === "critical",
    hasBalanceImpact: input.source === "wallet",
    counterparty: input.counterparty,
    referenceId: input.referenceId,
    tags: ["home", input.source, input.kind],
  };
}

export const SABI_HOME_NOTIFICATION_HOOKS = {
  version: "HOME-100.17",
  mandatorySources: [
    "missed_call",
    "message_received",
    "event_reminder",
    "ai_alert",
    "wallet_alert",
    "qr_security_review",
  ] as const,
  policy: {
    defaultVisibleOnHome: false,
    persistentHomeBannerAllowed: false,
    overlayAboveOtherAppsAllowed: false,
    externalAppOverlayAllowed: false,
    accessMode: "home_top_swipe_drawer_only",
    allowedSurface: "home_only",
  },
  note:
    "Home must collect missed calls, messages, events, wallet/QR/security alerts and AI alerts through real module events. It must not create fake notifications, must not keep a persistent Home banner, and must not display over other apps.",
} as const;
