import React from "react";
import {
  AppWindow,
  AtSign,
  BadgeCheck,
  Ban,
  Bell,
  BellDot,
  BellOff,
  Blocks,
  BriefcaseBusiness,
  BrushCleaning,
  Cake,
  CalendarDays,
  Camera,
  CircleHelp,
  Clipboard,
  Copy,
  CreditCard,
  Database,
  Edit3,
  Eraser,
  FileText,
  Film,
  Forward,
  Gift,
  Globe,
  Heart,
  Home,
  ImageIcon,
  Images,
  Languages,
  Link2,
  Lock,
  LogOut,
  LucideIcon,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Palette,
  Phone,
  PhoneCall,
  QrCode,
  ReceiptText,
  Reply,
  ScanLine,
  Search,
  Send,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  StickyNote,
  Trash2,
  User,
  UserCheck,
  UserRoundX,
  Users,
  Video,
  Wallet,
  Wallpaper,
  Wrench,
} from "lucide-react-native";
import {
  getIconToneColor,
  ICON_SIZES,
  ICON_STROKES,
  type IconTone,
} from "./iconTokens";

export type AppIconKey =
  | "home_main"
  | "home_search"
  | "home_notifications"
  | "home_profile"
  | "home_ai"
  | "home_events"
  | "home_favorites"
  | "home_recent"
  | "home_categories"
  | "home_mini_apps"
  | "home_services"
  | "profile_user"
  | "profile_verified"
  | "profile_edit"
  | "profile_public"
  | "profile_photos"
  | "profile_reactions"
  | "profile_short_videos"
  | "profile_likes"
  | "profile_gifts"
  | "profile_media"
  | "profile_files"
  | "profile_links"
  | "profile_voice"
  | "profile_privacy"
  | "profile_security"
  | "profile_devices"
  | "profile_trusted"
  | "profile_blocked"
  | "profile_qr"
  | "profile_ai"
  | "profile_colors"
  | "profile_language"
  | "profile_premium"
  | "profile_business"
  | "profile_credits"
  | "profile_support"
  | "profile_birthday"
  | "profile_phone"
  | "profile_email"
  | "profile_username"
  | "profile_channel"
  | "profile_data_management"
  | "profile_auto_delete"
  | "wallet_home"
  | "wallet_local_card"
  | "wallet_international_card"
  | "wallet_local_global_card"
  | "wallet_virtual_card"
  | "wallet_add_card"
  | "wallet_card_details"
  | "wallet_transfer"
  | "wallet_receive"
  | "wallet_top_up"
  | "wallet_withdraw"
  | "wallet_exchange"
  | "wallet_history"
  | "wallet_qr_pay"
  | "wallet_sabi_pay"
  | "wallet_send_by_id"
  | "wallet_send_by_qr"
  | "wallet_merchant"
  | "wallet_scan"
  | "wallet_settings"
  | "wallet_notifications"
  | "wallet_security"
  | "wallet_coin_home"
  | "wallet_coin_send"
  | "wallet_coin_receive"
  | "wallet_coin_history"
  | "wallet_coin_earn"
  | "wallet_coin_deposit"
  | "wallet_coin_convert"
  | "messenger_chats"
  | "messenger_audio_call"
  | "messenger_video_call"
  | "messenger_search"
  | "messenger_mute"
  | "messenger_block"
  | "messenger_clear_history"
  | "messenger_theme"
  | "messenger_wallpaper"
  | "messenger_attachment"
  | "messenger_camera"
  | "messenger_gallery"
  | "messenger_document"
  | "messenger_contact"
  | "messenger_location"
  | "messenger_catalog"
  | "messenger_money_send"
  | "messenger_poll"
  | "messenger_event"
  | "messenger_voice_message"
  | "messenger_video_message"
  | "messenger_stickers"
  | "messenger_premium_stickers"
  | "messenger_reactions"
  | "messenger_gifts"
  | "messenger_ai_translate"
  | "messenger_ai_assist"
  | "messenger_reply"
  | "messenger_forward"
  | "messenger_edit_message"
  | "messenger_delete_message"
  | "messenger_copy"
  | "messenger_save_media"
  | "messenger_link_open"
  | "messenger_partner_profile"
  | "notifications_all"
  | "notifications_unread"
  | "notifications_wallet_alert"
  | "notifications_message_alert"
  | "notifications_security_alert"
  | "notifications_promotion"
  | "notifications_update"
  | "notifications_gifts_received"
  | "notifications_likes"
  | "notifications_reactions"
  | "notifications_mentions"
  | "notifications_system_info"
  | "settings_appearance"
  | "settings_theme"
  | "settings_language"
  | "settings_privacy"
  | "settings_security"
  | "settings_devices"
  | "settings_support"
  | "settings_legal"
  | "settings_help"
  | "settings_logout"
  | "settings_delete_account"
  | "settings_version"
  | "settings_feedback";

type IconSizeKey = keyof typeof ICON_SIZES;
type IconStrokeKey = keyof typeof ICON_STROKES;

export type AppIconProps = {
  size?: number | IconSizeKey;
  strokeWidth?: number | IconStrokeKey;
  tone?: IconTone;
  color?: string;
};

function resolveSize(size: AppIconProps["size"] = "md") {
  return typeof size === "number" ? size : ICON_SIZES[size];
}

function resolveStroke(strokeWidth: AppIconProps["strokeWidth"] = "strong") {
  return typeof strokeWidth === "number"
    ? strokeWidth
    : ICON_STROKES[strokeWidth];
}

function makeRenderer(IconComponent: LucideIcon) {
  return function AppIconRenderer({
    size = "md",
    strokeWidth = "strong",
    tone = "default",
    color,
  }: AppIconProps = {}) {
    return (
      <IconComponent
        size={resolveSize(size)}
        strokeWidth={resolveStroke(strokeWidth)}
        color={color ?? getIconToneColor(tone)}
      />
    );
  };
}

const ICON_COMPONENTS: Record<AppIconKey, LucideIcon> = {
  home_main: Home,
  home_search: Search,
  home_notifications: Bell,
  home_profile: User,
  home_ai: Sparkles,
  home_events: CalendarDays,
  home_favorites: Star,
  home_recent: MoreHorizontal,
  home_categories: Blocks,
  home_mini_apps: AppWindow,
  home_services: Wrench,

  profile_user: User,
  profile_verified: BadgeCheck,
  profile_edit: Edit3,
  profile_public: Globe,
  profile_photos: Images,
  profile_reactions: Heart,
  profile_short_videos: Film,
  profile_likes: Heart,
  profile_gifts: Gift,
  profile_media: ImageIcon,
  profile_files: FileText,
  profile_links: Link2,
  profile_voice: Mic,
  profile_privacy: Lock,
  profile_security: ShieldCheck,
  profile_devices: Smartphone,
  profile_trusted: UserCheck,
  profile_blocked: UserRoundX,
  profile_qr: QrCode,
  profile_ai: Sparkles,
  profile_colors: Palette,
  profile_language: Languages,
  profile_premium: Sparkles,
  profile_business: BriefcaseBusiness,
  profile_credits: CreditCard,
  profile_support: CircleHelp,
  profile_birthday: Cake,
  profile_phone: Phone,
  profile_email: Mail,
  profile_username: AtSign,
  profile_channel: Users,
  profile_data_management: Database,
  profile_auto_delete: Eraser,

  wallet_home: Wallet,
  wallet_local_card: CreditCard,
  wallet_international_card: CreditCard,
  wallet_local_global_card: CreditCard,
  wallet_virtual_card: CreditCard,
  wallet_add_card: CreditCard,
  wallet_card_details: ReceiptText,
  wallet_transfer: Send,
  wallet_receive: Send,
  wallet_top_up: CreditCard,
  wallet_withdraw: CreditCard,
  wallet_exchange: Sparkles,
  wallet_history: ReceiptText,
  wallet_qr_pay: QrCode,
  wallet_sabi_pay: Wallet,
  wallet_send_by_id: AtSign,
  wallet_send_by_qr: QrCode,
  wallet_merchant: BriefcaseBusiness,
  wallet_scan: ScanLine,
  wallet_settings: Settings2,
  wallet_notifications: Bell,
  wallet_security: ShieldCheck,
  wallet_coin_home: Sparkles,
  wallet_coin_send: Send,
  wallet_coin_receive: Send,
  wallet_coin_history: ReceiptText,
  wallet_coin_earn: Sparkles,
  wallet_coin_deposit: CreditCard,
  wallet_coin_convert: Sparkles,

  messenger_chats: MessageCircle,
  messenger_audio_call: PhoneCall,
  messenger_video_call: Video,
  messenger_search: Search,
  messenger_mute: BellOff,
  messenger_block: Ban,
  messenger_clear_history: Trash2,
  messenger_theme: Palette,
  messenger_wallpaper: Wallpaper,
  messenger_attachment: FileText,
  messenger_camera: Camera,
  messenger_gallery: Images,
  messenger_document: FileText,
  messenger_contact: User,
  messenger_location: MapPin,
  messenger_catalog: Blocks,
  messenger_money_send: Send,
  messenger_poll: Clipboard,
  messenger_event: CalendarDays,
  messenger_voice_message: Mic,
  messenger_video_message: Video,
  messenger_stickers: StickyNote,
  messenger_premium_stickers: Sparkles,
  messenger_reactions: Heart,
  messenger_gifts: Gift,
  messenger_ai_translate: Sparkles,
  messenger_ai_assist: Sparkles,
  messenger_reply: Reply,
  messenger_forward: Forward,
  messenger_edit_message: Edit3,
  messenger_delete_message: Trash2,
  messenger_copy: Copy,
  messenger_save_media: ImageIcon,
  messenger_link_open: Link2,
  messenger_partner_profile: User,

  notifications_all: Bell,
  notifications_unread: BellDot,
  notifications_wallet_alert: Wallet,
  notifications_message_alert: MessageCircle,
  notifications_security_alert: ShieldAlert,
  notifications_promotion: Sparkles,
  notifications_update: Sparkles,
  notifications_gifts_received: Gift,
  notifications_likes: Heart,
  notifications_reactions: Heart,
  notifications_mentions: AtSign,
  notifications_system_info: CircleHelp,

  settings_appearance: BrushCleaning,
  settings_theme: Palette,
  settings_language: Languages,
  settings_privacy: Lock,
  settings_security: ShieldCheck,
  settings_devices: Smartphone,
  settings_support: CircleHelp,
  settings_legal: FileText,
  settings_help: CircleHelp,
  settings_logout: LogOut,
  settings_delete_account: Trash2,
  settings_version: BadgeCheck,
  settings_feedback: MessageCircle,
};

export const APP_ICON_REGISTRY: Record<
  AppIconKey,
  ReturnType<typeof makeRenderer>
> = Object.fromEntries(
  Object.entries(ICON_COMPONENTS).map(([key, IconComponent]) => [
    key,
    makeRenderer(IconComponent),
  ]),
) as Record<AppIconKey, ReturnType<typeof makeRenderer>>;

export function renderAppIcon(key: AppIconKey, props?: AppIconProps) {
  return APP_ICON_REGISTRY[key](props);
}