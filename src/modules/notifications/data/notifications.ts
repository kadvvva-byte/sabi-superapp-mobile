import {
  AppNotification,
  NotificationPreferences,
  NotificationQuickFilter,
  NotificationTab,
} from "../types";

export const NOTIFICATION_TABS: NotificationTab[] = [
  { key: "all", label: "All" },
  { key: "balance", label: "Balance" },
  { key: "wallet", label: "Wallet" },
  { key: "business", label: "Business" },
  { key: "merchant", label: "Merchant" },
  { key: "messenger", label: "Messenger" },
  { key: "marketplace", label: "Marketplace" },
  { key: "stream", label: "Stream" },
  { key: "security", label: "Security" },
  { key: "system", label: "System" },
  { key: "ai", label: "AI" },
];

export const QUICK_FILTERS: { key: NotificationQuickFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "critical", label: "Critical" },
  { key: "incoming", label: "Incoming" },
  { key: "outgoing", label: "Outgoing" },
  { key: "failed", label: "Failed" },
  { key: "balance_changed", label: "Balance" },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  quietMode: false,
  quietModeStart: "23:00",
  quietModeEnd: "07:00",
  showOnLockScreen: false,
  criticalAlertsBypassQuietMode: true,
  groupByModule: true,
  autoMarkReadOnOpen: false,
  defaultFilters: ["unread", "balance_changed"],
  modules: [
    {
      key: "balance",
      title: "Balance",
      description: "",
      enabled: true,
      channels: { inApp: true, push: true, email: false, sms: false, sound: true, vibration: true, preview: true },
      criticalOnly: false,
    },
    {
      key: "wallet",
      title: "Wallet",
      description: "",
      enabled: true,
      channels: { inApp: true, push: true, email: false, sms: false, sound: true, vibration: true, preview: true },
    },
    {
      key: "business",
      title: "Business",
      description: "",
      enabled: true,
      channels: { inApp: true, push: true, email: true, sms: false, sound: true, vibration: true, preview: true },
    },
    {
      key: "merchant",
      title: "Merchant",
      description: "",
      enabled: true,
      channels: { inApp: true, push: true, email: true, sms: false, sound: true, vibration: true, preview: true },
    },
    {
      key: "messenger",
      title: "Messenger",
      description: "",
      enabled: true,
      channels: { inApp: true, push: true, email: false, sms: false, sound: true, vibration: true, preview: true },
    },
    {
      key: "marketplace",
      title: "Marketplace",
      description: "",
      enabled: true,
      channels: { inApp: true, push: true, email: true, sms: false, sound: true, vibration: true, preview: true },
    },
    {
      key: "stream",
      title: "Stream",
      description: "",
      enabled: true,
      channels: { inApp: true, push: false, email: false, sms: false, sound: true, vibration: true, preview: true },
    },
    {
      key: "security",
      title: "Security",
      description: "",
      enabled: true,
      channels: { inApp: true, push: true, email: true, sms: true, sound: true, vibration: true, preview: false },
      criticalOnly: false,
    },
    {
      key: "system",
      title: "System",
      description: "",
      enabled: true,
      channels: { inApp: true, push: false, email: false, sms: false, sound: false, vibration: false, preview: false },
    },
    {
      key: "ai",
      title: "AI",
      description: "",
      enabled: true,
      channels: { inApp: true, push: false, email: false, sms: false, sound: false, vibration: false, preview: false },
    },
  ],
};
