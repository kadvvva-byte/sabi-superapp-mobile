/* eslint-disable react/display-name */
import React from "react";
import {
  BadgeCheck,
  Ban,
  BellOff,
  BriefcaseBusiness,
  CreditCard,
  FileText,
  Gift,
  Heart,
  HelpCircle,
  Images,
  Link2,
  Lock,
  Mic,
  Palette,
  PhoneCall,
  QrCode,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  User,
  Video,
} from "lucide-react-native";

export type ProfileIconKey =
  | "user"
  | "verification"
  | "devices"
  | "trusted"
  | "privacy"
  | "security"
  | "theme"
  | "qr"
  | "ai"
  | "premium"
  | "business"
  | "credits"
  | "gifts"
  | "support"
  | "photos"
  | "reactions"
  | "shortVideos"
  | "likes"
  | "media"
  | "files"
  | "links"
  | "voice"
  | "audioCall"
  | "videoCall"
  | "search"
  | "mute"
  | "clearHistory"
  | "block";

type IconRenderArgs = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

type IconRenderer = (args?: IconRenderArgs) => React.ReactNode;

const makeIcon =
  (IconComponent: any): IconRenderer =>
  ({ size = 18, color = "#58D5C9", strokeWidth = 2.4 } = {}) =>
    <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;

export const PROFILE_ICON_MAP: Record<ProfileIconKey, IconRenderer> = {
  user: makeIcon(User),
  verification: makeIcon(BadgeCheck),
  devices: makeIcon(Smartphone),
  trusted: makeIcon(ShieldCheck),

  privacy: makeIcon(Lock),
  security: makeIcon(ShieldCheck),
  theme: makeIcon(Palette),
  qr: makeIcon(QrCode),

  ai: makeIcon(Sparkles),
  premium: makeIcon(Sparkles),
  business: makeIcon(BriefcaseBusiness),
  credits: makeIcon(CreditCard),
  gifts: makeIcon(Gift),
  support: makeIcon(HelpCircle),

  photos: makeIcon(Images),
  reactions: makeIcon(Heart),
  shortVideos: makeIcon(Video),
  likes: makeIcon(Heart),

  media: makeIcon(Images),
  files: makeIcon(FileText),
  links: makeIcon(Link2),
  voice: makeIcon(Mic),

  audioCall: makeIcon(PhoneCall),
  videoCall: makeIcon(Video),
  search: makeIcon(Search),
  mute: makeIcon(BellOff),
  clearHistory: makeIcon(Trash2),
  block: makeIcon(Ban),
};

export function renderProfileIcon(
  key: ProfileIconKey,
  args?: IconRenderArgs,
) {
  return PROFILE_ICON_MAP[key](args);
}

