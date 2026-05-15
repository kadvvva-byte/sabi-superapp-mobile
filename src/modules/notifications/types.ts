export type NotificationModule =
  | "all"
  | "balance"
  | "wallet"
  | "business"
  | "merchant"
  | "messenger"
  | "marketplace"
  | "stream"
  | "security"
  | "system"
  | "ai";

export type NotificationStatus = "success" | "failed" | "pending" | "info";
export type NotificationPriority = "low" | "medium" | "high" | "critical";
export type NotificationDirection = "in" | "out" | "neutral";

export type NotificationEventType =
  | "transfer_success"
  | "transfer_failed"
  | "transfer_received"
  | "top_up"
  | "withdraw"
  | "card_added"
  | "card_frozen"
  | "card_unfrozen"
  | "qr_scanned"
  | "qr_paid"
  | "refund"
  | "hold"
  | "release"
  | "fee_charged"
  | "cashback_received"
  | "merchant_settlement"
  | "merchant_payment_received"
  | "business_payout"
  | "business_expense"
  | "stream_gift_sent"
  | "stream_gift_received"
  | "stream_purchase"
  | "stream_subscription_charged"
  | "stream_subscription_failed"
  | "stream_creator_settlement"
  | "message_received"
  | "missed_call"
  | "event_reminder"
  | "qr_security_review"
  | "marketplace_payment"
  | "marketplace_refund"
  | "crypto_in"
  | "crypto_out"
  | "security_login"
  | "security_sensitive_action"
  | "system_update"
  | "ai_alert";

export type BalanceChangeEvent = {
  amount: number;
  currency: string;
  direction: NotificationDirection;
  balanceBefore?: number;
  balanceAfter?: number;
};

export type AppNotification = {
  id: string;
  module: Exclude<NotificationModule, "all">;
  eventType: NotificationEventType;
  title: string;
  message: string;
  status: NotificationStatus;
  priority: NotificationPriority;
  createdAt: string;
  isRead: boolean;
  isPinned: boolean;
  isCritical: boolean;
  hasBalanceImpact: boolean;
  balanceChange?: BalanceChangeEvent;
  counterparty?: string;
  referenceId?: string;
  tags?: string[];
};

export type NotificationTab = {
  key: NotificationModule;
  label: string;
};

export type NotificationQuickFilter =
  | "all"
  | "unread"
  | "critical"
  | "incoming"
  | "outgoing"
  | "failed"
  | "balance_changed";

export type NotificationPreferenceCategory =
  | "wallet"
  | "business"
  | "merchant"
  | "messenger"
  | "marketplace"
  | "stream"
  | "security"
  | "system"
  | "ai"
  | "balance";

export type NotificationChannelPreferences = {
  inApp: boolean;
  push: boolean;
  email: boolean;
  sms: boolean;
  sound: boolean;
  vibration: boolean;
  preview: boolean;
};

export type NotificationModulePreference = {
  key: NotificationPreferenceCategory;
  title: string;
  description: string;
  enabled: boolean;
  channels: NotificationChannelPreferences;
  criticalOnly?: boolean;
};

export type NotificationPreferences = {
  quietMode: boolean;
  quietModeStart: string;
  quietModeEnd: string;
  showOnLockScreen: boolean;
  criticalAlertsBypassQuietMode: boolean;
  groupByModule: boolean;
  autoMarkReadOnOpen: boolean;
  defaultFilters: NotificationQuickFilter[];
  modules: NotificationModulePreference[];
};