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
  bundled: true;
};

export type SabiBundledSoundSource = number;

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

export function findSabiNotificationSoundOption(soundId: string) {
  return SABI_NOTIFICATION_SOUND_OPTIONS.find((option) => option.id === soundId) || null;
}

export function isSabiBundledSoundForKind(kind: SabiNotificationSoundKind, soundId: string) {
  return findSabiNotificationSoundOption(soundId)?.kind === kind;
}

export function getSabiBundledSoundSource(soundId: string): SabiBundledSoundSource {
  switch (soundId) {
    case "call_neon": return require("../../../../assets/sounds/sabi_call_neon.wav");
    case "call_premium": return require("../../../../assets/sounds/sabi_call_premium.wav");
    case "call_soft": return require("../../../../assets/sounds/sabi_call_soft.wav");
    case "call_digital": return require("../../../../assets/sounds/sabi_call_digital.wav");
    case "call_skyline": return require("../../../../assets/sounds/sabi_call_skyline.wav");
    case "call_ocean": return require("../../../../assets/sounds/sabi_call_ocean.wav");
    case "call_crystal": return require("../../../../assets/sounds/sabi_call_crystal.wav");
    case "call_lux": return require("../../../../assets/sounds/sabi_call_lux.wav");
    case "call_night": return require("../../../../assets/sounds/sabi_call_night.wav");
    case "call_minimal": return require("../../../../assets/sounds/sabi_call_minimal.wav");
    case "msg_clean": return require("../../../../assets/sounds/sabi_msg_clean.wav");
    case "msg_soft": return require("../../../../assets/sounds/sabi_msg_soft.wav");
    case "msg_glass": return require("../../../../assets/sounds/sabi_msg_glass.wav");
    case "msg_pop": return require("../../../../assets/sounds/sabi_msg_pop.wav");
    case "msg_air": return require("../../../../assets/sounds/sabi_msg_air.wav");
    case "msg_pixel": return require("../../../../assets/sounds/sabi_msg_pixel.wav");
    case "msg_drop": return require("../../../../assets/sounds/sabi_msg_drop.wav");
    case "msg_bell": return require("../../../../assets/sounds/sabi_msg_bell.wav");
    case "msg_swipe": return require("../../../../assets/sounds/sabi_msg_swipe.wav");
    case "msg_tap": return require("../../../../assets/sounds/sabi_msg_tap.wav");
    case "wallet_confirm": return require("../../../../assets/sounds/sabi_wallet_confirm.wav");
    case "wallet_alert": return require("../../../../assets/sounds/sabi_wallet_alert.wav");
    case "market_alert": return require("../../../../assets/sounds/sabi_market_alert.wav");
    case "market_soft": return require("../../../../assets/sounds/sabi_market_soft.wav");
    case "ai_ping": return require("../../../../assets/sounds/sabi_ai_ping.wav");
    case "ai_soft": return require("../../../../assets/sounds/sabi_ai_soft.wav");
    case "system_notice": return require("../../../../assets/sounds/sabi_system_notice.wav");
    case "system_soft": return require("../../../../assets/sounds/sabi_system_soft.wav");
    default: return require("../../../../assets/sounds/sabi_msg_clean.wav");
  }
}
