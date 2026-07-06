export type PrivacyOption = {
  key: string;
  label: string;
  locked?: boolean;
};

export type PrivacyChoiceGroup = {
  title: string;
  selectedKey: string;
  options: PrivacyOption[];
  description: string;
};

export type PrivacyExceptionRow = {
  title: string;
  value: string;
  description: string;
};

export type PrivacyToggleRow = {
  title: string;
  description: string;
  value: boolean;
  locked?: boolean;
};

export type PrivacyPreviewCard = {
  label: string;
  sender: string;
  message: string;
  footer?: string;
};

export type PrivacyDetailConfig = {
  slug: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  preview?: PrivacyPreviewCard;
  topToggles?: PrivacyToggleRow[];
  groups: PrivacyChoiceGroup[];
  exceptions?: PrivacyExceptionRow[];
  toggleSectionTitle?: string;
  toggles?: PrivacyToggleRow[];
  note?: string;
  premiumNote?: string;
  premiumCtaText?: string;
};

export type PrivacyHubRow = {
  key: string;
  title: string;
  description: string;
  route?: string;
  badge?: string;
};

export const SABI_PRIVACY_POLICY_URL =
  "https://sabi.example.com/privacy";

export const SABI_ACCOUNT_DELETION_URL =
  "https://sabi.example.com/account-deletion";

export const SABI_PRIVACY_POLICY_URL_STATUS =
  "placeholder_until_final_public_domain_connected";

export const SABI_ACCOUNT_DELETION_PATH =
  "Profile > Privacy > Account deletion";

export const SABI_ACCOUNT_DELETION_RETENTION_EXCEPTIONS = [
  "fraud and abuse prevention",
  "security logs",
  "payment disputes and chargebacks",
  "legal, tax, and accounting obligations",
  "KYC, KYB, and AML records",
  "provider, issuer, or payment network obligations",
  "records required to protect users and comply with law",
] as const;

export const SABI_ACCOUNT_DELETION_REVIEWER_EVIDENCE = [
  "in-app account deletion path",
  "public web deletion request URL",
  "retention exception copy",
  "Privacy Policy URL",
  "support/contact path",
  "Data Safety consistency note",
] as const;

export const SABI_ACCOUNT_DELETION_PRIVACY_ROW: PrivacyHubRow = {
  key: "account_deletion",
  title: "Account deletion",
  description:
    "Review how to request Sabi account deletion, what can be deleted, and which records may be retained for legal, financial, security, KYC/KYB/AML, provider, or dispute obligations.",
  route: "/profile/privacy/auto-delete",
  badge: "Play-ready",
};

const EVERYONE: PrivacyOption = {
  key: "everyone",
  label: "profile.privacyDetailScreen.options.everyone",
};

const CONTACTS: PrivacyOption = {
  key: "contacts",
  label: "profile.privacyDetailScreen.options.contacts",
};

const NOBODY: PrivacyOption = {
  key: "nobody",
  label: "profile.privacyDetailScreen.options.nobody",
};

export const PRIVACY_SECURITY_ROWS: PrivacyHubRow[] = [
  {
    key: "security",
    title: "profile.privacyScreen.rows.security.title",
    description: "profile.privacyScreen.rows.security.description",
    route: "/profile/security",
  },
  {
    key: "data",
    title: "profile.privacyScreen.rows.data.title",
    description: "profile.privacyScreen.rows.data.description",
    route: "/profile/data-management",
  },
  {
    key: "blocked",
    title: "profile.privacyScreen.rows.blocked.title",
    description: "profile.privacyScreen.rows.blocked.description",
    route: "/profile/blocked",
  },
  SABI_ACCOUNT_DELETION_PRIVACY_ROW,
  {
    key: "autodelete",
    title: "profile.privacyScreen.rows.autodelete.title",
    description: "profile.privacyScreen.rows.autodelete.description",
    route: "/profile/privacy/auto-delete",
  },
  {
    key: "login_email",
    title: "profile.privacyScreen.rows.login_email.title",
    description: "profile.privacyScreen.rows.login_email.description",
    route: "/profile/login-email",
  },
];

export const PRIVACY_VISIBILITY_ROWS: PrivacyHubRow[] = [
  {
    key: "phone",
    title: "profile.privacyScreen.rows.phone.title",
    description: "profile.privacyScreen.rows.phone.description",
    route: "/profile/phone",
  },
  {
    key: "last-seen",
    title: "profile.privacyScreen.rows.last-seen.title",
    description: "profile.privacyScreen.rows.last-seen.description",
    route: "/profile/last-seen",
  },
  {
    key: "photo",
    title: "profile.privacyScreen.rows.photo.title",
    description: "profile.privacyScreen.rows.photo.description",
    route: "/profile/photo",
  },
  {
    key: "bio",
    title: "profile.privacyScreen.rows.bio.title",
    description: "profile.privacyScreen.rows.bio.description",
    route: "/profile/bio",
  },
  {
    key: "birthday",
    title: "profile.privacyScreen.rows.birthday.title",
    description: "profile.privacyScreen.rows.birthday.description",
    route: "/profile/birthday",
  },
  {
    key: "gifts",
    title: "profile.privacyScreen.rows.gifts.title",
    description: "profile.privacyScreen.rows.gifts.description",
    route: "/profile/gifts",
  },
  {
    key: "forwards",
    title: "profile.privacyScreen.rows.forwards.title",
    description: "profile.privacyScreen.rows.forwards.description",
    route: "/profile/forwards",
  },
  {
    key: "calls",
    title: "profile.privacyScreen.rows.calls.title",
    description: "profile.privacyScreen.rows.calls.description",
    route: "/profile/calls",
  },
  {
    key: "voice-messages",
    title: "profile.privacyScreen.rows.voice-messages.title",
    description: "profile.privacyScreen.rows.voice-messages.description",
    route: "/profile/voice-messages",
  },
  {
    key: "messages",
    title: "profile.privacyScreen.rows.messages.title",
    description: "profile.privacyScreen.rows.messages.description",
    route: "/profile/messages",
  },
  {
    key: "groups",
    title: "profile.privacyScreen.rows.groups.title",
    description: "profile.privacyScreen.rows.groups.description",
    route: "/profile/groups",
  },
];

export const PRIVACY_DETAIL_CONFIGS: Record<string, PrivacyDetailConfig> = {
  phone: {
    slug: "phone",
    title: "profile.privacyDetails.phone.title",
    eyebrow: "profile.privacyDetailScreen.defaults.eyebrow",
    groups: [
      {
        title: "profile.privacyDetails.phone.groups.whoCanSee.title",
        selectedKey: "nobody",
        options: [EVERYONE, CONTACTS, NOBODY],
        description: "profile.privacyDetails.phone.groups.whoCanSee.description",
      },
      {
        title: "profile.privacyDetails.phone.groups.findByNumber.title",
        selectedKey: "contacts",
        options: [EVERYONE, CONTACTS],
        description: "profile.privacyDetails.phone.groups.findByNumber.description",
      },
    ],
    exceptions: [
      {
        title: "profile.privacyDetails.phone.exceptions.alwaysShow.title",
        value: "profile.privacyDetails.phone.exceptions.alwaysShow.value",
        description:
          "profile.privacyDetails.phone.exceptions.alwaysShow.description",
      },
    ],
  },

  "last-seen": {
    slug: "last-seen",
    title: "profile.privacyDetails.lastSeen.title",
    eyebrow: "profile.privacyDetailScreen.defaults.eyebrow",
    groups: [
      {
        title: "profile.privacyDetails.lastSeen.groups.onlineVisibility.title",
        selectedKey: "nobody",
        options: [EVERYONE, CONTACTS, NOBODY],
        description:
          "profile.privacyDetails.lastSeen.groups.onlineVisibility.description",
      },
    ],
    exceptions: [
      {
        title: "profile.privacyDetails.lastSeen.exceptions.alwaysShow.title",
        value: "profile.privacyDetails.common.add",
        description:
          "profile.privacyDetails.lastSeen.exceptions.alwaysShow.description",
      },
    ],
    toggles: [
      {
        title: "profile.privacyDetails.lastSeen.toggles.hideReadTime.title",
        value: true,
        description:
          "profile.privacyDetails.lastSeen.toggles.hideReadTime.description",
      },
    ],
    note: "profile.privacyDetails.lastSeen.note",
    premiumNote: "profile.privacyDetails.lastSeen.premiumNote",
    premiumCtaText: "profile.privacyDetails.lastSeen.premiumCtaText",
  },

  photo: {
    slug: "photo",
    title: "profile.privacyDetails.photo.title",
    eyebrow: "profile.privacyDetailScreen.defaults.eyebrow",
    groups: [
      {
        title: "profile.privacyDetails.photo.groups.whoCanSee.title",
        selectedKey: "everyone",
        options: [EVERYONE, CONTACTS, NOBODY],
        description: "profile.privacyDetails.photo.groups.whoCanSee.description",
      },
    ],
    exceptions: [
      {
        title: "profile.privacyDetails.photo.exceptions.neverShow.title",
        value: "profile.privacyDetails.common.add",
        description:
          "profile.privacyDetails.photo.exceptions.neverShow.description",
      },
    ],
  },

  bio: {
    slug: "bio",
    title: "profile.privacyDetails.bio.title",
    eyebrow: "profile.privacyDetailScreen.defaults.eyebrow",
    groups: [
      {
        title: "profile.privacyDetails.bio.groups.whoCanSee.title",
        selectedKey: "everyone",
        options: [EVERYONE, CONTACTS, NOBODY],
        description: "profile.privacyDetails.bio.groups.whoCanSee.description",
      },
    ],
    exceptions: [
      {
        title: "profile.privacyDetails.bio.exceptions.neverShow.title",
        value: "profile.privacyDetails.common.add",
        description:
          "profile.privacyDetails.bio.exceptions.neverShow.description",
      },
    ],
  },

  birthday: {
    slug: "birthday",
    title: "profile.privacyDetails.birthday.title",
    eyebrow: "profile.privacyDetailScreen.defaults.eyebrow",
    groups: [
      {
        title: "profile.privacyDetails.birthday.groups.whoCanSee.title",
        selectedKey: "nobody",
        options: [EVERYONE, CONTACTS, NOBODY],
        description:
          "profile.privacyDetails.birthday.groups.whoCanSee.description",
      },
    ],
    exceptions: [
      {
        title: "profile.privacyDetails.birthday.exceptions.alwaysShow.title",
        value: "profile.privacyDetails.common.add",
        description:
          "profile.privacyDetails.birthday.exceptions.alwaysShow.description",
      },
    ],
  },

  gifts: {
    slug: "gifts",
    title: "profile.privacyDetails.gifts.title",
    eyebrow: "profile.privacyDetailScreen.defaults.eyebrow",
    topToggles: [
      {
        title: "profile.privacyDetails.gifts.topToggles.chatBadge.title",
        value: false,
        description:
          "profile.privacyDetails.gifts.topToggles.chatBadge.description",
      },
    ],
    groups: [
      {
        title: "profile.privacyDetails.gifts.groups.defaultProfileVisibility.title",
        selectedKey: "everyone",
        options: [EVERYONE, CONTACTS, NOBODY],
        description:
          "profile.privacyDetails.gifts.groups.defaultProfileVisibility.description",
      },
    ],
    exceptions: [
      {
        title: "profile.privacyDetails.gifts.exceptions.neverAllow.title",
        value: "profile.privacyDetails.common.add",
        description:
          "profile.privacyDetails.gifts.exceptions.neverAllow.description",
      },
    ],
    toggleSectionTitle: "profile.privacyDetails.gifts.allowedGifts.title",
    toggles: [
      {
        title: "profile.privacyDetails.gifts.toggles.standard.title",
        value: true,
        description:
          "profile.privacyDetails.gifts.toggles.standard.description",
      },
      {
        title: "profile.privacyDetails.gifts.toggles.rare.title",
        value: true,
        description: "profile.privacyDetails.gifts.toggles.rare.description",
      },
    ],
  },

  forwards: {
    slug: "forwards",
    title: "profile.privacyDetails.forwards.title",
    eyebrow: "profile.privacyDetailScreen.defaults.eyebrow",
    preview: {
      label: "profile.privacyDetails.forwards.preview.label",
      sender: "profile.privacyDetails.forwards.preview.sender",
      message: "profile.privacyDetails.forwards.preview.message",
      footer: "00:20",
    },
    groups: [
      {
        title: "profile.privacyDetails.forwards.groups.accountLinking.title",
        selectedKey: "nobody",
        options: [EVERYONE, CONTACTS, NOBODY],
        description:
          "profile.privacyDetails.forwards.groups.accountLinking.description",
      },
    ],
    exceptions: [
      {
        title: "profile.privacyDetails.forwards.exceptions.alwaysAllow.title",
        value: "profile.privacyDetails.common.add",
        description:
          "profile.privacyDetails.forwards.exceptions.alwaysAllow.description",
      },
    ],
  },

  calls: {
    slug: "calls",
    title: "profile.privacyDetails.calls.title",
    eyebrow: "profile.privacyDetailScreen.defaults.eyebrow",
    groups: [
      {
        title: "profile.privacyDetails.calls.groups.whoCanCall.title",
        selectedKey: "contacts",
        options: [EVERYONE, CONTACTS, NOBODY],
        description:
          "profile.privacyDetails.calls.groups.whoCanCall.description",
      },
      {
        title: "profile.privacyDetails.calls.groups.peerToPeer.title",
        selectedKey: "contacts",
        options: [
          {
            key: "always",
            label: "profile.privacyDetails.calls.options.always",
          },
          CONTACTS,
          {
            key: "never",
            label: "profile.privacyDetails.calls.options.never",
          },
        ],
        description:
          "profile.privacyDetails.calls.groups.peerToPeer.description",
      },
    ],
    exceptions: [
      {
        title: "profile.privacyDetails.calls.exceptions.neverAllow.title",
        value: "profile.privacyDetails.common.add",
        description:
          "profile.privacyDetails.calls.exceptions.neverAllow.description",
      },
      {
        title: "profile.privacyDetails.calls.exceptions.alwaysAllow.title",
        value: "profile.privacyDetails.common.add",
        description:
          "profile.privacyDetails.calls.exceptions.alwaysAllow.description",
      },
    ],
    toggles: [
      {
        title: "profile.privacyDetails.calls.toggles.iphoneIntegration.title",
        value: true,
        description:
          "profile.privacyDetails.calls.toggles.iphoneIntegration.description",
      },
    ],
  },

  "voice-messages": {
    slug: "voice-messages",
    title: "profile.privacyDetails.voiceMessages.title",
    eyebrow: "profile.privacyDetailScreen.defaults.eyebrow",
    groups: [
      {
        title: "profile.privacyDetails.voiceMessages.groups.whoCanSend.title",
        selectedKey: "everyone",
        options: [
          EVERYONE,
          {
            key: "contacts_premium",
            label: "profile.privacyDetails.voiceMessages.options.contactsPremium",
            locked: true,
          },
          {
            key: "credits_messages",
            label: "profile.privacyDetails.voiceMessages.options.messagesForCredits",
            locked: true,
          },
        ],
        description:
          "profile.privacyDetails.voiceMessages.groups.whoCanSend.description",
      },
    ],
    premiumNote: "profile.privacyDetails.voiceMessages.premiumNote",
    premiumCtaText: "profile.privacyDetails.voiceMessages.premiumCtaText",
  },

  messages: {
    slug: "messages",
    title: "profile.privacyDetails.messages.title",
    eyebrow: "profile.privacyDetailScreen.defaults.eyebrow",
    groups: [
      {
        title: "profile.privacyDetails.messages.groups.whoCanMessage.title",
        selectedKey: "everyone",
        options: [
          EVERYONE,
          {
            key: "contacts_premium",
            label: "profile.privacyDetails.messages.options.contactsPremium",
            locked: true,
          },
          {
            key: "messages_for_credits",
            label: "profile.privacyDetails.messages.options.messagesForCredits",
            locked: true,
          },
        ],
        description:
          "profile.privacyDetails.messages.groups.whoCanMessage.description",
      },
    ],
    premiumNote: "profile.privacyDetails.messages.premiumNote",
    premiumCtaText: "profile.privacyDetails.messages.premiumCtaText",
  },

  groups: {
    slug: "groups",
    title: "profile.privacyDetails.groups.title",
    eyebrow: "profile.privacyDetailScreen.defaults.eyebrow",
    groups: [
      {
        title: "profile.privacyDetails.groups.groups.whoCanInvite.title",
        selectedKey: "nobody",
        options: [EVERYONE, CONTACTS, NOBODY],
        description:
          "profile.privacyDetails.groups.groups.whoCanInvite.description",
      },
    ],
    exceptions: [
      {
        title: "profile.privacyDetails.groups.exceptions.alwaysAllow.title",
        value: "profile.privacyDetails.common.add",
        description:
          "profile.privacyDetails.groups.exceptions.alwaysAllow.description",
      },
    ],
  },
};

export function getPrivacyDetailConfig(slug?: string | string[]) {
  const normalizedSlug = Array.isArray(slug) ? slug[0] : slug;
  if (!normalizedSlug) return undefined;
  return PRIVACY_DETAIL_CONFIGS[normalizedSlug];
}