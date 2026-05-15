import type { TranslationParams } from "../i18n";

export type WalletLocale = "en" | "ru" | "uz";
export type WalletTranslator = (
  key: string,
  params?: TranslationParams,
) => string;

export function normalizeWalletLocale(value?: string | null): WalletLocale {
  const normalized = String(value || "")
    .trim()
    .replace(/_/g, "-")
    .toLowerCase();
  const base = normalized.split("-")[0];

  if (base === "ru") return "ru";
  if (base === "uz") return "uz";
  return "en";
}

export function walletText(
  t: WalletTranslator,
  key: string,
  fallback: string,
  params?: TranslationParams,
) {
  const value = t(key, params);
  return value && value !== key ? value : fallback;
}

export function getWalletEntryTexts(t: WalletTranslator) {
  return {
    headerTitle: walletText(t, "wallet.entry.headerTitle", "Wallet"),
    headerSubtitle: walletText(
      t,
      "wallet.entry.headerSubtitle",
      "Personal Wallet, Sabi Balance, cards, QR, top up and crypto in one place",
    ),
    quickActionsTitle: walletText(t, "wallet.entry.quickActionsTitle", "Quick actions"),
    quickActionsHint: walletText(t, "wallet.entry.quickActionsHint", "Core wallet actions"),
    topUp: walletText(t, "wallet.entry.topUp", "Top up"),
    send: walletText(t, "wallet.entry.send", "Send"),
    receive: walletText(t, "wallet.entry.receive", "Receive"),
    qrPay: walletText(t, "wallet.entry.qrPay", "QR Pay"),
    cards: walletText(t, "wallet.entry.cards", "Cards"),
    crypto: walletText(t, "wallet.entry.crypto", "Crypto"),
    cardsAccessTitle: walletText(t, "wallet.entry.cardsAccessTitle", "Cards access"),
    cardsAccessHint: walletText(
      t,
      "wallet.entry.cardsAccessHint",
      "Manage card flows from one secure place",
    ),
    allCardsTitle: walletText(t, "wallet.entry.allCardsTitle", "All cards"),
    allCardsSubtitle: walletText(
      t,
      "wallet.entry.allCardsSubtitle",
      "Linked cards, default cards and card management",
    ),
    localCardsTitle: walletText(t, "wallet.entry.localCardsTitle", "Local cards"),
    localCardsSubtitle: walletText(
      t,
      "wallet.entry.localCardsSubtitle",
      "Local card flows, OTP checks and domestic transfers",
    ),
  } as const;
}

export function getWalletHomeTexts(t: WalletTranslator) {
  return {
    headerEyebrow: walletText(t, "wallet.home.headerEyebrow", "Sabi Wallet"),
    headerTitle: walletText(t, "wallet.home.headerTitle", "Wallet hub"),
    headerSubtitle: walletText(
      t,
      "wallet.home.headerSubtitle",
      "Premium wallet surface connected to wallet foundation and provider-backed balances.",
    ),
    mainHeroTitle: walletText(t, "wallet.home.mainHeroTitle", "Primary wallet foundation"),
    mainHeroSubtitle: walletText(
      t,
      "wallet.home.mainHeroSubtitle",
      "Primary balance, local balance, Sabi Coin and crypto value are taken from wallet foundation state.",
    ),
    mainBalanceLabel: walletText(t, "wallet.home.mainBalanceLabel", "Primary balance"),
    mainBalanceHint: walletText(t, "wallet.home.mainBalanceHint", "Selected primary currency"),
    localBalanceLabel: walletText(t, "wallet.home.localBalanceLabel", "Local balance"),
    localBalanceHint: walletText(t, "wallet.home.localBalanceHint", "Configured local currency"),
    send: walletText(t, "wallet.home.send", "Send"),
    cards: walletText(t, "wallet.home.cards", "Cards"),
    quickActionsTitle: walletText(t, "wallet.home.quickActionsTitle", "Quick actions"),
    quickActionsHint: walletText(t, "wallet.home.quickActionsHint", "Daily use"),
    topUp: walletText(t, "wallet.home.topUp", "Top up"),
    receive: walletText(t, "wallet.home.receive", "Receive"),
    withdraw: walletText(t, "wallet.home.withdraw", "Withdraw"),
    request: walletText(t, "wallet.home.request", "Request"),
    scanQr: walletText(t, "wallet.home.scanQr", "Scan QR"),
    settings: walletText(t, "wallet.home.settings", "Settings"),
    history: walletText(t, "wallet.home.history", "History"),
    mySabiId: walletText(t, "wallet.home.mySabiId", "My Sabi ID"),
    mainBlocksTitle: walletText(t, "wallet.home.mainBlocksTitle", "Primary wallet blocks"),
    mainBlocksHint: walletText(t, "wallet.home.mainBlocksHint", "Core surface"),
    sabiPayTitle: walletText(t, "wallet.home.sabiPayTitle", "Payment infrastructure"),
    sabiPaySubtitle: walletText(
      t,
      "wallet.home.sabiPaySubtitle",
      "Primary transfer layer for MySabi ID, internal wallet routing, requests and payment actions.",
    ),
    sabiPayBalanceLabel: walletText(t, "wallet.home.sabiPayBalanceLabel", "Primary balance"),
    qrTitle: walletText(t, "wallet.home.qrTitle", "Scan and merchant flow"),
    qrSubtitle: walletText(
      t,
      "wallet.home.qrSubtitle",
      "Single premium entry for merchant pay, scan-to-pay, My QR generation and camera scan.",
    ),
    coinTitle: walletText(t, "wallet.home.coinTitle", "Sabi Coin Wallet"),
    coinSubtitle: walletText(
      t,
      "wallet.home.coinSubtitle",
      "Internal coin wallet for Messenger gifts, premium functions and future stream donation flow.",
    ),
    coinBalanceLabel: walletText(t, "wallet.home.coinBalanceLabel", "COIN balance"),
    localCardsTitle: walletText(t, "wallet.home.localCardsTitle", "Local card layer"),
    localCardsSubtitle: walletText(
      t,
      "wallet.home.localCardsSubtitle",
      "Separate local card system for domestic transfers, recipients and linked card management.",
    ),
    localCardsBalanceLabel: walletText(t, "wallet.home.localCardsBalanceLabel", "Local balance"),
    businessTitle: walletText(t, "wallet.home.businessTitle", "Business routing"),
    businessSubtitle: walletText(
      t,
      "wallet.home.businessSubtitle",
      "Route operational, vendor and company payments through a dedicated business layer.",
    ),
    merchantTitle: walletText(t, "wallet.home.merchantTitle", "Merchant settlement"),
    merchantSubtitle: walletText(
      t,
      "wallet.home.merchantSubtitle",
      "Marketplace and seller-side wallet flow for merchant checkout and settlement routing.",
    ),
    cryptoTitle: walletText(t, "wallet.home.cryptoTitle", "Crypto Wallet access"),
    cryptoSubtitle: walletText(
      t,
      "wallet.home.cryptoSubtitle",
      "Separate crypto module with its own style, connected from Home as a premium ecosystem block.",
    ),
    cryptoBalanceLabel: walletText(t, "wallet.home.cryptoBalanceLabel", "Crypto value"),
    aiSectionTitle: walletText(t, "wallet.home.aiSectionTitle", "AI assistant"),
    aiSectionHint: walletText(t, "wallet.home.aiSectionHint", "Smart layer"),
    aiTitle: walletText(t, "wallet.home.aiTitle", "Smart wallet help"),
    aiSubtitle: walletText(
      t,
      "wallet.home.aiSubtitle",
      "Ask about payments, cards, COIN, business, merchant flows, crypto guidance and wallet history.",
    ),
    aiGuidanceTitle: walletText(t, "wallet.home.aiGuidanceTitle", "Guidance"),
    aiGuidanceText: walletText(t, "wallet.home.aiGuidanceText", "Find the right wallet action faster"),
    aiSupportTitle: walletText(t, "wallet.home.aiSupportTitle", "Support"),
    aiSupportText: walletText(t, "wallet.home.aiSupportText", "Explain transfers, cards, COIN and QR flows"),
    infraTitle: walletText(t, "wallet.home.infraTitle", "Wallet infrastructure"),
    infraHint: walletText(t, "wallet.home.infraHint", "Compact grid"),
    topUpSubtitle: walletText(t, "wallet.home.topUpSubtitle", "Add money through connected bank and provider routes"),
    receiveSubtitle: walletText(t, "wallet.home.receiveSubtitle", "Receive money through My Sabi ID, wallet QR and request flows"),
    withdrawSubtitle: walletText(t, "wallet.home.withdrawSubtitle", "Move money through controlled wallet withdrawal routes"),
    financialDashboardTitle: walletText(t, "wallet.home.financialDashboardTitle", "Financial dashboard"),
    financialDashboardSubtitle: walletText(t, "wallet.home.financialDashboardSubtitle", "Balances, routing status and wallet activity overview"),
    settingsSubtitle: walletText(t, "wallet.home.settingsSubtitle", "Currency, local card routing, limits and security controls"),
    cardsHubTitle: walletText(t, "wallet.home.cardsHubTitle", "Cards hub"),
    cardsHubSubtitle: walletText(t, "wallet.home.cardsHubSubtitle", "Local, global, virtual"),
    chatPaymentsTitle: walletText(t, "wallet.home.chatPaymentsTitle", "Chat payments"),
    chatPaymentsSubtitle: walletText(t, "wallet.home.chatPaymentsSubtitle", "Messenger payment flow"),
    virtualCardTitle: walletText(t, "wallet.home.virtualCardTitle", "Virtual card"),
    virtualCardSubtitle: walletText(t, "wallet.home.virtualCardSubtitle", "Online secure card"),
    controlsTitle: walletText(t, "wallet.home.controlsTitle", "What this home controls"),
    controlsHint: walletText(t, "wallet.home.controlsHint", "Scope"),
    info1Title: walletText(t, "wallet.home.info1Title", "Sabi Pay foundation"),
    info1Text: walletText(
      t,
      "wallet.home.info1Text",
      "Entry point for MySabi ID, internal transfer, request money and payment infrastructure.",
    ),
    info2Title: walletText(t, "wallet.home.info2Title", "QR and merchant entry"),
    info2Text: walletText(
      t,
      "wallet.home.info2Text",
      "One clean QR entry without repeated QR buttons across the home screen.",
    ),
    info3Title: walletText(t, "wallet.home.info3Title", "Card architecture"),
    info3Text: walletText(
      t,
      "wallet.home.info3Text",
      "Keeps local, international and virtual cards inside one structured wallet layer.",
    ),
    info4Title: walletText(t, "wallet.home.info4Title", "Sabi Coin layer"),
    info4Text: walletText(
      t,
      "wallet.home.info4Text",
      "Internal COIN balance for Messenger gifts, premium functions and future stream monetization.",
    ),
    info5Title: walletText(t, "wallet.home.info5Title", "Business and merchant routing"),
    info5Text: walletText(
      t,
      "wallet.home.info5Text",
      "Separates personal, business and merchant payment sources to avoid future accounting chaos.",
    ),
    info6Title: walletText(t, "wallet.home.info6Title", "AI assistant layer"),
    info6Text: walletText(
      t,
      "wallet.home.info6Text",
      "AI helps explain wallet functions, suggest routes and guide users without replacing critical payment confirmation.",
    ),
    info7Title: walletText(t, "wallet.home.info7Title", "Crypto access"),
    info7Text: walletText(
      t,
      "wallet.home.info7Text",
      "Crypto keeps a separate style and flow, but Home links to it as a premium ecosystem block.",
    ),
    pillInternal: walletText(t, "wallet.home.pillInternal", "Internal"),
    pillCore: walletText(t, "wallet.home.pillCore", "Core"),
    pillCamera: walletText(t, "wallet.home.pillCamera", "Camera"),
    pillMerchant: walletText(t, "wallet.home.pillMerchant", "Merchant"),
    pillGifts: walletText(t, "wallet.home.pillGifts", "Gifts"),
    pillStream: walletText(t, "wallet.home.pillStream", "Stream"),
    pillDomestic: walletText(t, "wallet.home.pillDomestic", "Local"),
    pillOperations: walletText(t, "wallet.home.pillOperations", "Operations"),
    pillReferences: walletText(t, "wallet.home.pillReferences", "References"),
    pillCheckout: walletText(t, "wallet.home.pillCheckout", "Checkout"),
    pillSettlements: walletText(t, "wallet.home.pillSettlements", "Settlements"),
    pillAssets: walletText(t, "wallet.home.pillAssets", "Assets"),
    pillProvider: walletText(t, "wallet.home.pillProvider", "Provider"),
    pillCustody: walletText(t, "wallet.home.pillCustody", "Custody"),
    pillSeparated: walletText(t, "wallet.home.pillSeparated", "Separated"),
    askAi: walletText(t, "wallet.home.askAi", "Ask AI"),
    smartTips: walletText(t, "wallet.home.smartTips", "Smart tips"),
    recentHelp: walletText(t, "wallet.home.recentHelp", "Recent help"),
    loading: walletText(t, "wallet.home.loading", "Updating wallet state..."),
    eyebrowSabiPay: walletText(t, "wallet.home.eyebrowSabiPay", "SABI PAY"),
    eyebrowQr: walletText(t, "wallet.home.eyebrowQr", "QR"),
    eyebrowSabiCoin: walletText(t, "wallet.home.eyebrowSabiCoin", "SABI COIN"),
    eyebrowLocalCards: walletText(t, "wallet.home.eyebrowLocalCards", "LOCAL CARDS"),
    eyebrowBusiness: walletText(t, "wallet.home.eyebrowBusiness", "BUSINESS"),
    eyebrowMerchant: walletText(t, "wallet.home.eyebrowMerchant", "MERCHANT"),
    eyebrowCrypto: walletText(t, "wallet.home.eyebrowCrypto", "CRYPTO"),
    pillSabiPay: walletText(t, "wallet.home.pillSabiPay", "Sabi Pay"),
    pillSabiBalance: walletText(t, "wallet.home.pillSabiBalance", "Sabi Balance"),
    pillMyQr: walletText(t, "wallet.home.pillMyQr", "My QR"),
    pillBusiness: walletText(t, "wallet.home.pillBusiness", "Business"),
  } as const;
}

export function getWalletSharedTexts(t: WalletTranslator) {
  return {
    wallet: walletText(t, "wallet.shared.wallet", "Wallet"),
    totalBalance: walletText(t, "wallet.shared.totalBalance", "Total balance"),
    walletBalance: walletText(t, "wallet.shared.walletBalance", "Wallet balance"),
    personal: walletText(t, "wallet.shared.personal", "Personal"),
    mainBalance: walletText(t, "wallet.shared.mainBalance", "Primary balance"),
    localBalance: walletText(t, "wallet.shared.localBalance", "Local balance"),
    coinBalance: walletText(t, "wallet.shared.coinBalance", "COIN balance"),
    cryptoValue: walletText(t, "wallet.shared.cryptoValue", "Crypto value"),
    sabiBalance: walletText(t, "wallet.shared.sabiBalance", "Sabi Balance"),
    sabiBalanceDescription: walletText(
      t,
      "wallet.shared.sabiBalanceDescription",
      "Internal Sabi balance for top up, transfers, rewards and ecosystem payments",
    ),
    internal: walletText(t, "wallet.shared.internal", "Internal"),
    holder: walletText(t, "wallet.shared.holder", "Holder"),
    expiry: walletText(t, "wallet.shared.expiry", "Expiry"),
    balance: walletText(t, "wallet.shared.balance", "Balance"),
    notConfigured: walletText(t, "wallet.currency.notConfigured", "Not configured"),
    providerNotConfigured: walletText(
      t,
      "wallet.cards.providerNotConfigured",
      "Provider not configured",
    ),
    localCurrencyNotConfigured: walletText(
      t,
      "wallet.settings.noHardcodedCurrencyTitle",
      "No hardcoded local currency",
    ),
    localCard: walletText(t, "wallet.cards.localCard", "Local Card"),
    internationalCard: walletText(t, "wallet.cards.internationalCard", "International Card"),
    virtualCard: walletText(t, "wallet.cards.virtualCard", "Virtual Card"),
    previewEyebrow: walletText(t, "wallet.virtualCard.previewEyebrow", "VIRTUAL CARD"),
    category: walletText(t, "wallet.virtualCard.category", "Category"),
    theme: walletText(t, "wallet.virtualCard.theme", "Theme"),
  } as const;
}
