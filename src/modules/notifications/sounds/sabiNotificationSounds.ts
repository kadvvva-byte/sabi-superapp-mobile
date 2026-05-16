export type SabiNotificationSoundKind =
  | "call"
  | "message"
  | "wallet"
  | "market"
  | "ai"
  | "system";

export type SabiNotificationSoundOption = {
  id: string;
  kind: SabiNotificationSoundKind;
  fileName: string;
  bundled: boolean;
};

export const SABI_CALL_SOUND_OPTIONS: SabiNotificationSoundOption[] = [
  { id: "call_neon", kind: "call", fileName: "sabi_call_neon.wav", bundled: true },
  { id: "call_premium", kind: "call", fileName: "sabi_call_premium.wav", bundled: true },
  { id: "call_soft", kind: "call", fileName: "sabi_call_soft.wav", bundled: true },
  { id: "call_digital", kind: "call", fileName: "sabi_call_digital.wav", bundled: true },
  { id: "call_skyline", kind: "call", fileName: "sabi_call_skyline.wav", bundled: true },
  { id: "call_ocean", kind: "call", fileName: "sabi_call_ocean.wav", bundled: true },
  { id: "call_crystal", kind: "call", fileName: "sabi_call_crystal.wav", bundled: true },
  { id: "call_lux", kind: "call", fileName: "sabi_call_lux.wav", bundled: true },
  { id: "call_night", kind: "call", fileName: "sabi_call_night.wav", bundled: true },
  { id: "call_minimal", kind: "call", fileName: "sabi_call_minimal.wav", bundled: true },
];

export const SABI_MESSAGE_SOUND_OPTIONS: SabiNotificationSoundOption[] = [
  { id: "msg_clean", kind: "message", fileName: "sabi_msg_clean.wav", bundled: true },
  { id: "msg_soft", kind: "message", fileName: "sabi_msg_soft.wav", bundled: true },
  { id: "msg_glass", kind: "message", fileName: "sabi_msg_glass.wav", bundled: true },
  { id: "msg_pop", kind: "message", fileName: "sabi_msg_pop.wav", bundled: true },
  { id: "msg_air", kind: "message", fileName: "sabi_msg_air.wav", bundled: true },
  { id: "msg_pixel", kind: "message", fileName: "sabi_msg_pixel.wav", bundled: true },
  { id: "msg_drop", kind: "message", fileName: "sabi_msg_drop.wav", bundled: true },
  { id: "msg_bell", kind: "message", fileName: "sabi_msg_bell.wav", bundled: true },
  { id: "msg_swipe", kind: "message", fileName: "sabi_msg_swipe.wav", bundled: true },
  { id: "msg_tap", kind: "message", fileName: "sabi_msg_tap.wav", bundled: true },
];

export const SABI_SERVICE_SOUND_OPTIONS: SabiNotificationSoundOption[] = [
  { id: "wallet_confirm", kind: "wallet", fileName: "sabi_wallet_confirm.wav", bundled: true },
  { id: "wallet_alert", kind: "wallet", fileName: "sabi_wallet_alert.wav", bundled: true },
  { id: "market_alert", kind: "market", fileName: "sabi_market_alert.wav", bundled: true },
  { id: "market_soft", kind: "market", fileName: "sabi_market_soft.wav", bundled: true },
  { id: "ai_ping", kind: "ai", fileName: "sabi_ai_ping.wav", bundled: true },
  { id: "ai_soft", kind: "ai", fileName: "sabi_ai_soft.wav", bundled: true },
  { id: "system_notice", kind: "system", fileName: "sabi_system_notice.wav", bundled: true },
  { id: "system_soft", kind: "system", fileName: "sabi_system_soft.wav", bundled: true },
];

export const SABI_NOTIFICATION_SOUND_DEFAULTS: Record<SabiNotificationSoundKind, string> = {
  call: "call_neon",
  message: "msg_clean",
  wallet: "wallet_confirm",
  market: "market_alert",
  ai: "ai_ping",
  system: "system_notice",
};

export const SABI_NOTIFICATION_SOUND_OPTIONS = [
  ...SABI_CALL_SOUND_OPTIONS,
  ...SABI_MESSAGE_SOUND_OPTIONS,
  ...SABI_SERVICE_SOUND_OPTIONS,
];
