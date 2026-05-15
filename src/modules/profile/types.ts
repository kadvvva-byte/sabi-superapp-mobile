export type ProfileVerificationStatus =
  | "verified"
  | "pending"
  | "review"
  | "limited"
  | "rejected";

export type ProfileComplianceStatus = "clear" | "review" | "limited";

export type ProfileStatusMode = "online" | "offline" | "away" | "invisible";

export type ProfileUser = {
  avatarLetter: string;
  avatarUri?: string;
  fullName: string;
  username: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  street: string;
  building: string;
  apartment: string;
  language: string;
  bio: string;
  sabiId: string;
  verificationStatus: ProfileVerificationStatus;
  joinedDate: string;
  statusMode: ProfileStatusMode;
};

export type ProfileHubCategory = {
  key:
    | "edit"
    | "security"
    | "privacy"
    | "language"
    | "devices"
    | "verification"
    | "preferences"
    | "support";
  title: string;
  description: string;
  route: string;
};

export type ProfileLinkedSpace = {
  key:
    | "wallet"
    | "wallet_settings"
    | "notifications"
    | "notification_preferences"
    | "business"
    | "merchant";
  title: string;
  description: string;
  route?: string;
  comingSoon?: boolean;
};

export type ProfileCountryOption = {
  code: string;
  name: string;
  dialCode: string;
};

export type ProfileLanguageOption = {
  code: string;
  name: string;
  nativeName: string;
};

export type ProfileDeviceSession = {
  id: string;
  title: string;
  location: string;
  platform: string;
  lastSeen: string;
  current: boolean;
  trusted: boolean;
  web: boolean;
};

export type ProfileVerificationDocument = {
  id: string;
  title: string;
  status: "approved" | "pending" | "review";
  updatedAt: string;
};

export type ProfileSupportLink = {
  id: string;
  title: string;
  description: string;
  route?: string;
  external?: boolean;
};

export type ProfileSecurityState = {
  biometricEnabled: boolean;
  appPinEnabled: boolean;
  twoFactorEnabled: boolean;
  trustedDeviceAlerts: boolean;
  suspiciousLoginAlerts: boolean;
  sensitiveActionConfirmation: boolean;
  faceIdForPhoneChange: boolean;
  faceIdForEmailChange: boolean;
  fallbackPinEnabled: boolean;
};

export type ProfilePrivacyState = {
  profileVisible: boolean;
  phoneVisible: boolean;
  emailVisible: boolean;
  discoverableByPhone: boolean;
  discoverableByUsername: boolean;
  activityVisible: boolean;
  statusVisible: boolean;
  qrProfileVisible: boolean;
};

export type ProfileLanguageState = {
  appLanguage: string;
  region: string;
  numberFormat: string;
  currencyDisplay: string;
  timezoneDisplay: string;
};

export type ProfileAppPreferencesState = {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  previewEnabled: boolean;
  compactMode: boolean;
  smartInsightsEnabled: boolean;
};

export type ProfileKycState = {
  status: ProfileVerificationStatus;
  kycLevel: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  livenessVerified: boolean;
  addressVerified: boolean;
  residencyCountry: string;
  sourceOfFundsRequested: boolean;
  complianceStatus: ProfileComplianceStatus;
  restrictedActions: string[];
  reviewReason?: string;
  reverificationRequired: boolean;
};

export type ProfileQrState = {
  profileCode: string;
  allowProfileQrScan: boolean;
  allowQrShare: boolean;
};

export type ProfilePersonRule = {
  id: string;
  name: string;
  username: string;
  note: string;
};

export type ProfilePhoneChangeState = {
  currentPhone: string;
  changeAllowed: boolean;
  requiresOldPhoneVerification: boolean;
  requiresNewPhoneVerification: boolean;
};

export type ProfileEmailChangeState = {
  currentEmail: string;
  changeAllowed: boolean;
  requiresCurrentEmailVerification: boolean;
  requiresNewEmailVerification: boolean;
};

export type ProfileLaunchOffer = {
  active: boolean;
  freeMonths: number;
  badge: string;
  title: string;
  description: string;
};

export type ProfilePlan = {
  key: string;
  title: string;
  period: string;
  price: string;
  description: string;
  badge?: string;
};

export type ProfileGiftItem = {
  id: string;
  title: string;
  price: string;
  tag?: string;
  isMarket?: boolean;
};

export type ProfileCreditOperation = {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  direction: "in" | "out";
  date: string;
  category: "gift" | "premium" | "reaction" | "topup" | "bonus";
};