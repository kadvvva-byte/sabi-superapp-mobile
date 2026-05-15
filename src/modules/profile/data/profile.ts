import {
  ProfileAppPreferencesState,
  ProfileCountryOption,
  ProfileCreditOperation,
  ProfileDeviceSession,
  ProfileEmailChangeState,
  ProfileGiftItem,
  ProfileHubCategory,
  ProfileKycState,
  ProfileLanguageOption,
  ProfileLanguageState,
  ProfileLaunchOffer,
  ProfileLinkedSpace,
  ProfilePersonRule,
  ProfilePhoneChangeState,
  ProfilePlan,
  ProfilePrivacyState,
  ProfileQrState,
  ProfileSecurityState,
  ProfileSupportLink,
  ProfileUser,
  ProfileVerificationDocument,
} from "../types";

export const PROFILE_USER: ProfileUser = {
  avatarLetter: "S",
  avatarUri: "",
  fullName: "Sabi User",
  username: "@sabi.user",
  phone: "+998 90 123 45 67",
  email: "user@sabi.app",
  birthDate: "1998-06-12",
  gender: "Male",
  country: "Uzbekistan",
  countryCode: "UZ",
  region: "Tashkent Region",
  city: "Tashkent",
  street: "Amir Temur Street",
  building: "18A",
  apartment: "12",
  language: "Русский",
  bio: "Sabi identity center for wallet, privacy, compliance, premium services, and future ecosystem features.",
  sabiId: "SABI-001-USER",
  verificationStatus: "verified",
  joinedDate: "2026-03-24",
  statusMode: "online",
};

export const PROFILE_HUB_CATEGORIES: ProfileHubCategory[] = [
  {
    key: "edit",
    title: "Personal Information",
    description: "Avatar, photo, name, username, phone, email, country, address, and language.",
    route: "/profile/edit",
  },
  {
    key: "security",
    title: "Security",
    description: "PIN, Face ID / biometric, 2FA, phone/email protection, and trusted device rules.",
    route: "/profile/security",
  },
  {
    key: "privacy",
    title: "Privacy",
    description: "Visibility, discoverability, QR visibility, and personal profile exposure rules.",
    route: "/profile/privacy",
  },
  {
    key: "language",
    title: "Language & Region",
    description: "App language, region, number format, currency display, and timezone preferences.",
    route: "/profile/language",
  },
  {
    key: "devices",
    title: "Devices & Sessions",
    description: "Current device, web sessions, trusted sessions, and session management entry.",
    route: "/profile/devices",
  },
  {
    key: "verification",
    title: "KYC / AML",
    description: "Identity verification, KYC level, AML review status, and compliance restrictions.",
    route: "/profile/verification",
  },
  {
    key: "preferences",
    title: "App Preferences",
    description: "Theme entry, previews, haptics, sound, and general application preferences.",
    route: "/profile/preferences",
  },
  {
    key: "support",
    title: "Support & Legal",
    description: "Help center, terms, privacy policy, and product information.",
    route: "/profile/support",
  },
];

export const PROFILE_LINKED_SPACES: ProfileLinkedSpace[] = [
  {
    key: "wallet",
    title: "Wallet",
    description: "Open wallet home and personal wallet flows.",
    route: "/tabs/wallet",
  },
  {
    key: "wallet_settings",
    title: "Wallet Settings",
    description: "Open wallet settings and payment control rules.",
    route: "/wallet/settings",
  },
  {
    key: "notifications",
    title: "Notifications",
    description: "Open global notifications for the whole app.",
    route: "/notifications",
  },
  {
    key: "notification_preferences",
    title: "Notification Preferences",
    description: "Open alert channels and module rules.",
    route: "/notification-preferences",
  },
  {
    key: "business",
    title: "Business",
    description: "Business profile and business wallet entry point.",
    comingSoon: true,
  },
  {
    key: "merchant",
    title: "Merchant",
    description: "Merchant settlement, cashier, and merchant profile entry point.",
    comingSoon: true,
  },
];

export const PROFILE_COUNTRIES: ProfileCountryOption[] = [
  { code: "UZ", name: "Uzbekistan", dialCode: "+998" },
  { code: "KZ", name: "Kazakhstan", dialCode: "+7" },
  { code: "TJ", name: "Tajikistan", dialCode: "+992" },
  { code: "KG", name: "Kyrgyzstan", dialCode: "+996" },
  { code: "TM", name: "Turkmenistan", dialCode: "+993" },
  { code: "RU", name: "Russia", dialCode: "+7" },
  { code: "TR", name: "Turkey", dialCode: "+90" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966" },
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "DE", name: "Germany", dialCode: "+49" },
  { code: "FR", name: "France", dialCode: "+33" },
  { code: "IT", name: "Italy", dialCode: "+39" },
  { code: "ES", name: "Spain", dialCode: "+34" },
  { code: "CN", name: "China", dialCode: "+86" },
  { code: "IN", name: "India", dialCode: "+91" },
  { code: "KR", name: "South Korea", dialCode: "+82" },
  { code: "JP", name: "Japan", dialCode: "+81" },
  { code: "SG", name: "Singapore", dialCode: "+65" },
];

export const PROFILE_LANGUAGES: ProfileLanguageOption[] = [
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "uz", name: "Uzbek", nativeName: "O‘zbekcha" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "kk", name: "Kazakh", nativeName: "Қазақша" },
  { code: "tg", name: "Tajik", nativeName: "Тоҷикӣ" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
];

export const PROFILE_DEVICE_SESSIONS: ProfileDeviceSession[] = [
  {
    id: "device-1",
    title: "Current iPhone",
    location: "Tashkent, Uzbekistan",
    platform: "iPhone • iOS",
    lastSeen: "Now",
    current: true,
    trusted: true,
    web: false,
  },
  {
    id: "device-2",
    title: "Chrome Web Session",
    location: "Tashkent, Uzbekistan",
    platform: "Windows • Chrome",
    lastSeen: "12 minutes ago",
    current: false,
    trusted: true,
    web: true,
  },
  {
    id: "device-3",
    title: "MacBook Safari",
    location: "Tashkent, Uzbekistan",
    platform: "macOS • Safari",
    lastSeen: "1 hour ago",
    current: false,
    trusted: false,
    web: true,
  },
];

export const PROFILE_VERIFICATION_DOCUMENTS: ProfileVerificationDocument[] = [
  {
    id: "doc-1",
    title: "Passport",
    status: "approved",
    updatedAt: "2026-03-24",
  },
  {
    id: "doc-2",
    title: "Liveness / Selfie Check",
    status: "approved",
    updatedAt: "2026-03-24",
  },
  {
    id: "doc-3",
    title: "Address Confirmation",
    status: "review",
    updatedAt: "2026-03-25",
  },
];

export const PROFILE_SUPPORT_LINKS: ProfileSupportLink[] = [
  {
    id: "support-1",
    title: "Help Center",
    description: "Browse product guidance, account help, and wallet support topics.",
  },
  {
    id: "support-2",
    title: "Contact Support",
    description: "Open support entry point for profile, wallet, or account issues.",
  },
  {
    id: "support-3",
    title: "Privacy Policy",
    description: "Read privacy policy and profile data usage details.",
  },
  {
    id: "support-4",
    title: "Terms of Service",
    description: "Read service rules and platform terms.",
  },
  {
    id: "support-5",
    title: "About Sabi",
    description: "Product info, version details, and company overview.",
  },
];

export const PROFILE_SECURITY_DEFAULTS: ProfileSecurityState = {
  biometricEnabled: true,
  appPinEnabled: true,
  twoFactorEnabled: true,
  trustedDeviceAlerts: true,
  suspiciousLoginAlerts: true,
  sensitiveActionConfirmation: true,
  faceIdForPhoneChange: true,
  faceIdForEmailChange: true,
  fallbackPinEnabled: true,
};

export const PROFILE_PRIVACY_DEFAULTS: ProfilePrivacyState = {
  profileVisible: true,
  phoneVisible: false,
  emailVisible: false,
  discoverableByPhone: false,
  discoverableByUsername: true,
  activityVisible: false,
  statusVisible: true,
  qrProfileVisible: true,
};

export const PROFILE_LANGUAGE_DEFAULTS: ProfileLanguageState = {
  appLanguage: "Русский",
  region: "Uzbekistan",
  numberFormat: "1 234 567,89",
  currencyDisplay: "Symbol + code",
  timezoneDisplay: "Asia/Tashkent",
};

export const PROFILE_APP_PREFERENCES_DEFAULTS: ProfileAppPreferencesState = {
  hapticsEnabled: true,
  soundEnabled: true,
  previewEnabled: true,
  compactMode: false,
  smartInsightsEnabled: true,
};

export const PROFILE_KYC_STATE: ProfileKycState = {
  status: "verified",
  kycLevel: "KYC Level 2",
  phoneVerified: true,
  emailVerified: true,
  livenessVerified: true,
  addressVerified: false,
  residencyCountry: "Uzbekistan",
  sourceOfFundsRequested: false,
  complianceStatus: "review",
  restrictedActions: ["High-value payout review", "Business/KYB not started yet"],
  reviewReason: "Address confirmation still under review.",
  reverificationRequired: false,
};

export const PROFILE_QR_STATE: ProfileQrState = {
  profileCode: "SABI-PROFILE-001-USER",
  allowProfileQrScan: true,
  allowQrShare: true,
};

export const PROFILE_BLOCKED_LIST: ProfilePersonRule[] = [
  {
    id: "blocked-1",
    name: "Hidden User",
    username: "@hidden.user",
    note: "Blocked from profile discovery and direct contact.",
  },
];

export const PROFILE_TRUSTED_LIST: ProfilePersonRule[] = [
  {
    id: "trusted-1",
    name: "Trusted Contact",
    username: "@trusted.contact",
    note: "Trusted for profile interactions and future whitelist flows.",
  },
];

export const PROFILE_PHONE_CHANGE_STATE: ProfilePhoneChangeState = {
  currentPhone: PROFILE_USER.phone,
  changeAllowed: true,
  requiresOldPhoneVerification: true,
  requiresNewPhoneVerification: true,
};

export const PROFILE_EMAIL_CHANGE_STATE: ProfileEmailChangeState = {
  currentEmail: PROFILE_USER.email,
  changeAllowed: true,
  requiresCurrentEmailVerification: true,
  requiresNewEmailVerification: true,
};

export const PROFILE_LAUNCH_OFFER: ProfileLaunchOffer = {
  active: true,
  freeMonths: 3,
  badge: "Launch",
  title: "First 3 months free",
  description:
    "Premium, business account, and gift sending are free during the first 3 months of launch access.",
};

export const PROFILE_PREMIUM_PLANS: ProfilePlan[] = [
  {
    key: "annual",
    title: "Premium Annual",
    period: "12 months",
    price: "US$29.99/year",
    description: "Full premium access after launch period ends.",
    badge: "Best value",
  },
  {
    key: "monthly",
    title: "Premium Monthly",
    period: "1 month",
    price: "US$3.99/month",
    description: "Flexible monthly premium subscription.",
  },
];

export const PROFILE_BUSINESS_PLANS: ProfilePlan[] = [
  {
    key: "business_annual",
    title: "Business Annual",
    period: "12 months",
    price: "US$29.99/year",
    description: "Business tools, quick replies, work hours, links, and automation.",
    badge: "Launch free",
  },
  {
    key: "business_monthly",
    title: "Business Monthly",
    period: "1 month",
    price: "US$3.99/month",
    description: "Monthly business access after launch period.",
  },
];

export const PROFILE_GIFT_ITEMS: ProfileGiftItem[] = [
  { id: "gift-1", title: "Rose", price: "25", tag: "Standard" },
  { id: "gift-2", title: "Cake", price: "50", tag: "Standard" },
  { id: "gift-3", title: "Bouquet", price: "50", tag: "Popular" },
  { id: "gift-4", title: "Rocket", price: "50", tag: "Fun" },
  { id: "gift-5", title: "Trophy", price: "100", tag: "Reward" },
  { id: "gift-6", title: "Diamond Ring", price: "100", tag: "Premium" },
  { id: "gift-7", title: "Big Diamond", price: "100", tag: "Premium" },
  { id: "gift-8", title: "Champagne", price: "50", tag: "Party" },
  { id: "gift-9", title: "Luxury Box", price: "615+", tag: "Market", isMarket: true },
  { id: "gift-10", title: "Flower Basket", price: "673+", tag: "Market", isMarket: true },
];

export const PROFILE_CREDIT_BALANCE = "50.85";

export const PROFILE_CREDIT_OPERATIONS: ProfileCreditOperation[] = [
  {
    id: "op-1",
    title: "Gift received",
    subtitle: "Unknown user",
    amount: "+50",
    direction: "in",
    date: "02 Mar 15:32",
    category: "gift",
  },
  {
    id: "op-2",
    title: "Premium reaction",
    subtitle: "Live stream reaction",
    amount: "-4",
    direction: "out",
    date: "02 Mar 15:33",
    category: "reaction",
  },
  {
    id: "op-3",
    title: "Gift exchange",
    subtitle: "kadamboevvv",
    amount: "+13",
    direction: "in",
    date: "15 Feb 02:47",
    category: "gift",
  },
  {
    id: "op-4",
    title: "Credit purchase",
    subtitle: "App Store",
    amount: "+100",
    direction: "in",
    date: "15 Feb 02:44",
    category: "topup",
  },
  {
    id: "op-5",
    title: "Launch bonus",
    subtitle: "Early access reward",
    amount: "+25",
    direction: "in",
    date: "01 Mar 09:15",
    category: "bonus",
  },
];