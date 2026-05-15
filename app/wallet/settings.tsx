import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Bell,
  ChevronRight,
  CreditCard,
  Eye,
  Fingerprint,
  Globe2,
  Lock,
  ShieldCheck,
  SlidersHorizontal,
  Wallet,
} from "lucide-react-native";

import { useI18n } from "../../src/shared/i18n";
import WalletProviderStatusPanel from "../../src/modules/wallet/components/WalletProviderStatusPanel";
import {
  WALLET_INTERNATIONAL_CURRENCY_OPTIONS,
  WALLET_LOCAL_CURRENCY_OPTIONS,
  WALLET_PRIMARY_CURRENCY_OPTIONS,
  saveWalletCurrencyPreferences,
  useWalletFoundation,
  type WalletCurrencyOption,
} from "../../src/shared/wallet/wallet-foundation";
import { buildWalletComplianceView } from "../../src/shared/wallet/wallet-compliance";
import { useWalletProviderMobileSync } from "../../src/shared/wallet/wallet-provider-mobile-sync";

type DefaultCardMode = "smart" | "local" | "international" | "virtual";
type SensitiveMode = "tap_to_reveal" | "biometric" | "pin";
type PaymentPriority = "smart" | "sabi_balance" | "cards";

type WalletSettingsLabelTexts = {
  smartAuto: string;
  localFirst: string;
  internationalFirst: string;
  virtualFirst: string;
  tapToReveal: string;
  pinRequired: string;
  biometricRequired: string;
  sabiBalanceFirst: string;
  cardsFirst: string;
};

type WalletComplianceLabelTexts = {
  clear: string;
  kycRequired: string;
  amlReview: string;
  adminReview: string;
  safeHold: string;
  restricted: string;
  blocked: string;
  notRequired: string;
  required: string;
  pending: string;
  verified: string;
  rejected: string;
  monitoring: string;
  reviewRequired: string;
  approved: string;
  escalated: string;
};

const BG = "#07111D";
const BG_2 = "#0A1A2C";
const BG_3 = "#0F2743";
const SURFACE = "rgba(255,255,255,0.06)";
const SURFACE_2 = "rgba(255,255,255,0.04)";
const STROKE = "rgba(255,255,255,0.10)";
const TEXT = "#F8FAFC";
const MUTED = "#AFC4DA";
const ACCENT = "#5DA3FF";

function walletText(
  t: (key: string, params?: Record<string, string | number>) => string,
  key: string,
  fallback: string,
) {
  const value = t(key);
  return typeof value === "string" && value.trim() && value !== key ? value : fallback;
}

export default function WalletSettingsScreen() {
  const { t } = useI18n();
  const { snapshot } = useWalletFoundation();
  useWalletProviderMobileSync();

  const [walletNotifications, setWalletNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [faceIdForSensitive, setFaceIdForSensitive] = useState(true);
  const [hideBalancesOnOpen, setHideBalancesOnOpen] = useState(false);
  const [requireConfirmationForLargePayments, setRequireConfirmationForLargePayments] =
    useState(true);
  const [allowSmartRouting, setAllowSmartRouting] = useState(true);
  const [autoSelectBestCard, setAutoSelectBestCard] = useState(true);
  const [showCardLast4Only, setShowCardLast4Only] = useState(true);
  const [defaultCardMode, setDefaultCardMode] = useState<DefaultCardMode>("smart");
  const [sensitiveMode, setSensitiveMode] = useState<SensitiveMode>("biometric");
  const [paymentPriority, setPaymentPriority] = useState<PaymentPriority>("smart");

  const texts = useMemo(
    () => ({
      back: walletText(t, "wallet.settings.back", "Wallet"),
      eyebrow: walletText(t, "wallet.settings.eyebrow", "WALLET CONTROL CENTER"),
      title: walletText(t, "wallet.settings.title", "Wallet Settings"),
      subtitle: walletText(
        t,
        "wallet.settings.subtitle",
        "Wallet currency, cards, security, limits and payment routing.",
      ),
      profileActive: walletText(t, "wallet.settings.profileActive", "Wallet profile active"),
      heroTitle: walletText(t, "wallet.settings.heroTitle", "Your wallet rules"),
      heroText: walletText(
        t,
        "wallet.settings.heroText",
        "Configure currency, card behavior, privacy controls and safer payment flows without changing wallet routes.",
      ),
      smartRouting: walletText(t, "wallet.settings.smartRouting", "Smart routing"),
      sensitiveGuard: walletText(t, "wallet.settings.sensitiveGuard", "Sensitive guard"),
      largePaymentCheck: walletText(t, "wallet.settings.largePaymentCheck", "Large payment check"),
      on: walletText(t, "wallet.settings.on", "ON"),
      off: walletText(t, "wallet.settings.off", "OFF"),
      currencyTitle: walletText(t, "wallet.settings.currencyTitle", "Currency"),
      primaryCurrency: walletText(t, "wallet.settings.primaryCurrency", "Primary currency"),
      primaryCurrencyDescription: walletText(
        t,
        "wallet.settings.primaryCurrencyDescription",
        "Main Wallet screen and Sabi Balance display use this currency. Default is USD.",
      ),
      localCurrency: walletText(t, "wallet.settings.localCurrency", "Local currency"),
      localCurrencyDescription: walletText(
        t,
        "wallet.settings.localCurrencyDescription",
        "Local card and local wallet routes use this currency after detection or manual selection.",
      ),
      internationalCurrency: walletText(
        t,
        "wallet.settings.internationalCurrency",
        "International card currency",
      ),
      internationalCurrencyDescription: walletText(
        t,
        "wallet.settings.internationalCurrencyDescription",
        "International card routes default to USD unless another provider currency is selected.",
      ),
      noHardcodedCurrencyTitle: walletText(
        t,
        "wallet.settings.noHardcodedCurrencyTitle",
        "No hardcoded local currency",
      ),
      noHardcodedCurrencyText: walletText(
        t,
        "wallet.settings.noHardcodedCurrencyText",
        "Main Wallet does not force local currency labels. Local currency appears only after this setting or provider detection.",
      ),
      cardPreferences: walletText(t, "wallet.settings.cardPreferences", "Card preferences"),
      manageCards: walletText(t, "wallet.settings.manageCards", "Manage cards"),
      manageCardsDescription: walletText(
        t,
        "wallet.settings.manageCardsDescription",
        "Open token-only cards hub, local / international / virtual cards and provider binding.",
      ),
      defaultCardMode: walletText(t, "wallet.settings.defaultCardMode", "Default card mode"),
      defaultCardModeDescription: walletText(
        t,
        "wallet.settings.defaultCardModeDescription",
        "Choose how wallet decides the main payment card.",
      ),
      smart: walletText(t, "wallet.settings.smart", "Smart"),
      local: walletText(t, "wallet.settings.local", "Local"),
      international: walletText(t, "wallet.settings.international", "International"),
      virtual: walletText(t, "wallet.settings.virtual", "Virtual"),
      autoSelectBestCard: walletText(t, "wallet.settings.autoSelectBestCard", "Auto-select best card"),
      autoSelectBestCardDescription: walletText(
        t,
        "wallet.settings.autoSelectBestCardDescription",
        "Prefer the best available tokenized card for the current flow.",
      ),
      showLast4: walletText(t, "wallet.settings.showLast4", "Show only last 4 digits by default"),
      showLast4Description: walletText(
        t,
        "wallet.settings.showLast4Description",
        "Do not reveal sensitive card data in normal card views.",
      ),
      walletPreferences: walletText(t, "wallet.settings.walletPreferences", "Wallet preferences"),
      sabiPayQuickAccess: walletText(t, "wallet.settings.sabiPayQuickAccess", "SabiPay quick access"),
      sabiPayQuickAccessDescription: walletText(
        t,
        "wallet.settings.sabiPayQuickAccessDescription",
        "Open secure send routes from wallet actions.",
      ),
      qrQuickAccess: walletText(t, "wallet.settings.qrQuickAccess", "QR quick access"),
      qrQuickAccessDescription: walletText(
        t,
        "wallet.settings.qrQuickAccessDescription",
        "Open wallet QR screen and QR payment actions.",
      ),
      allowSmartRouting: walletText(t, "wallet.settings.allowSmartRouting", "Allow smart routing"),
      allowSmartRoutingDescription: walletText(
        t,
        "wallet.settings.allowSmartRoutingDescription",
        "Choose the best available route between Sabi Balance, cards and provider rails.",
      ),
      paymentPriority: walletText(t, "wallet.settings.paymentPriority", "Payment priority"),
      paymentPriorityDescription: walletText(
        t,
        "wallet.settings.paymentPriorityDescription",
        "Choose what wallet tries first for daily payment flows.",
      ),
      sabiBalance: walletText(t, "wallet.shared.sabiBalance", "Sabi Balance"),
      cards: walletText(t, "wallet.entry.cards", "Cards"),
      security: walletText(t, "wallet.settings.security", "Security"),
      adminComplianceTitle: walletText(t, "wallet.settings.adminComplianceTitle", "Admin & compliance"),
      adminComplianceDescription: walletText(
        t,
        "wallet.settings.adminComplianceDescription",
        "Wallet operations follow provider config, KYC, AML, safe hold and admin review states.",
      ),
      complianceStatus: walletText(t, "wallet.settings.complianceStatus", "Compliance status"),
      kycStatus: walletText(t, "wallet.settings.kycStatus", "KYC status"),
      amlStatus: walletText(t, "wallet.settings.amlStatus", "AML status"),
      adminReviewStatus: walletText(t, "wallet.settings.adminReviewStatus", "Admin review"),
      safeHoldState: walletText(t, "wallet.settings.safeHoldState", "Safe hold"),
      tokenOnlyPolicy: walletText(t, "wallet.settings.tokenOnlyPolicy", "Token-only card policy"),
      tokenOnlyPolicyText: walletText(
        t,
        "wallet.settings.tokenOnlyPolicyText",
        "Sabi receives provider/bank tokens and masked metadata only. Raw card data never enters Sabi infrastructure.",
      ),
      providerConfigurationRequired: walletText(
        t,
        "wallet.settings.providerConfigurationRequired",
        "Provider configuration required",
      ),
      clear: walletText(t, "wallet.settings.clear", "Clear"),
      kycRequired: walletText(t, "wallet.settings.kycRequired", "KYC required"),
      amlReview: walletText(t, "wallet.settings.amlReview", "AML review"),
      adminReview: walletText(t, "wallet.settings.adminReview", "Admin review"),
      safeHold: walletText(t, "wallet.settings.safeHold", "Safe hold"),
      restricted: walletText(t, "wallet.settings.restricted", "Restricted"),
      blocked: walletText(t, "wallet.settings.blocked", "Blocked"),
      notRequired: walletText(t, "wallet.settings.notRequired", "Not required"),
      required: walletText(t, "wallet.settings.required", "Required"),
      pending: walletText(t, "wallet.settings.pending", "Pending"),
      verified: walletText(t, "wallet.settings.verified", "Verified"),
      rejected: walletText(t, "wallet.settings.rejected", "Rejected"),
      monitoring: walletText(t, "wallet.settings.monitoring", "Monitoring"),
      reviewRequired: walletText(t, "wallet.settings.reviewRequired", "Review required"),
      approved: walletText(t, "wallet.settings.approved", "Approved"),
      escalated: walletText(t, "wallet.settings.escalated", "Escalated"),
      walletNotifications: walletText(t, "wallet.settings.walletNotifications", "Wallet notifications"),
      walletNotificationsDescription: walletText(
        t,
        "wallet.settings.walletNotificationsDescription",
        "Receive payment, card, QR and balance alerts.",
      ),
      securityAlerts: walletText(t, "wallet.settings.securityAlerts", "Security alerts"),
      securityAlertsDescription: walletText(
        t,
        "wallet.settings.securityAlertsDescription",
        "High-priority alerts for sensitive wallet and protection events.",
      ),
      requireLargeConfirmation: walletText(
        t,
        "wallet.settings.requireLargeConfirmation",
        "Require confirmation for large payments",
      ),
      requireLargeConfirmationDescription: walletText(
        t,
        "wallet.settings.requireLargeConfirmationDescription",
        "Ask for an extra confirmation step on higher-value wallet payments.",
      ),
      sensitiveBehavior: walletText(t, "wallet.settings.sensitiveBehavior", "Sensitive info behavior"),
      sensitiveBehaviorDescription: walletText(
        t,
        "wallet.settings.sensitiveBehaviorDescription",
        "Control how card-sensitive details and hidden values are revealed.",
      ),
      tap: walletText(t, "wallet.settings.tap", "Tap"),
      biometric: walletText(t, "wallet.settings.biometric", "Biometric"),
      pin: walletText(t, "wallet.settings.pin", "PIN"),
      useBiometric: walletText(t, "wallet.settings.useBiometric", "Use biometric for sensitive info"),
      useBiometricDescription: walletText(
        t,
        "wallet.settings.useBiometricDescription",
        "Face ID / fingerprint challenge before opening sensitive card details.",
      ),
      hideBalances: walletText(t, "wallet.settings.hideBalances", "Hide balances on screen open"),
      hideBalancesDescription: walletText(
        t,
        "wallet.settings.hideBalancesDescription",
        "Start wallet screens with masked balances until user chooses to reveal.",
      ),
      notificationPreferences: walletText(
        t,
        "wallet.settings.notificationPreferences",
        "Notification preferences",
      ),
      notificationPreferencesDescription: walletText(
        t,
        "wallet.settings.notificationPreferencesDescription",
        "Open global notification controls and module alert rules.",
      ),
      limits: walletText(t, "wallet.settings.limits", "Limits"),
      dailySendLimit: walletText(t, "wallet.settings.dailySendLimit", "Daily send limit"),
      dailySendLimitDescription: walletText(
        t,
        "wallet.settings.dailySendLimitDescription",
        "Controlled by provider, KYC level, wallet risk and admin policy.",
      ),
      qrPaymentLimit: walletText(t, "wallet.settings.qrPaymentLimit", "QR payment limit"),
      qrPaymentLimitDescription: walletText(
        t,
        "wallet.settings.qrPaymentLimitDescription",
        "Controlled by provider, merchant policy and wallet risk checks.",
      ),
      sensitiveWindow: walletText(t, "wallet.settings.sensitiveWindow", "Sensitive reveal window"),
      sensitiveWindowDescription: walletText(
        t,
        "wallet.settings.sensitiveWindowDescription",
        "Provider/admin policy decides how long sensitive values stay visible.",
      ),
      policyControlled: walletText(t, "wallet.settings.policyControlled", "Policy controlled"),
      defaultBehavior: walletText(t, "wallet.settings.defaultBehavior", "Default behavior"),
      defaultSensitiveUnlock: walletText(
        t,
        "wallet.settings.defaultSensitiveUnlock",
        "Default sensitive unlock",
      ),
      defaultCardSelection: walletText(
        t,
        "wallet.settings.defaultCardSelection",
        "Default card selection",
      ),
      defaultPaymentSource: walletText(
        t,
        "wallet.settings.defaultPaymentSource",
        "Default payment source",
      ),
      localNotConfigured: walletText(t, "wallet.currency.notConfigured", "Not configured"),
      smartAuto: walletText(t, "wallet.settings.smartAuto", "Smart auto"),
      localFirst: walletText(t, "wallet.settings.localFirst", "Local first"),
      internationalFirst: walletText(t, "wallet.settings.internationalFirst", "International first"),
      virtualFirst: walletText(t, "wallet.settings.virtualFirst", "Virtual first"),
      tapToReveal: walletText(t, "wallet.settings.tapToReveal", "Tap to reveal"),
      pinRequired: walletText(t, "wallet.settings.pinRequired", "PIN required"),
      biometricRequired: walletText(t, "wallet.settings.biometricRequired", "Biometric required"),
      sabiBalanceFirst: walletText(t, "wallet.settings.sabiBalanceFirst", "Sabi Balance first"),
      cardsFirst: walletText(t, "wallet.settings.cardsFirst", "Cards first"),
    }),
    [t],
  );

  const summaryText = useMemo(() => {
    return labelForDefaultCardMode(defaultCardMode, texts);
  }, [defaultCardMode, texts]);

  const primaryCurrencyValue = snapshot.primaryCurrencyCode || "USD";
  const localCurrencyValue = snapshot.localCurrencyCode || "";
  const internationalCurrencyValue = snapshot.internationalCurrencyCode || "USD";
  const complianceView = useMemo(() => buildWalletComplianceView(snapshot), [snapshot]);

  const savePrimaryCurrency = (code: string) => {
    void saveWalletCurrencyPreferences({ primaryCurrencyCode: code });
  };

  const saveLocalCurrency = (code: string) => {
    void saveWalletCurrencyPreferences({ localCurrencyCode: code });
  };

  const saveInternationalCurrency = (code: string) => {
    void saveWalletCurrencyPreferences({ internationalCurrencyCode: code });
  };

  return (
    <LinearGradient
      colors={[BG, BG_2, BG_3]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={() => router.replace("/tabs/wallet")} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>{texts.back}</Text>
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.eyebrow}>{texts.eyebrow}</Text>
              <Text style={styles.title}>{texts.title}</Text>
              <Text style={styles.subtitle}>{texts.subtitle}</Text>
            </View>

            <Pressable onPress={() => router.push("/notifications" as never)} style={styles.headerButton}>
              <Bell size={16} color={TEXT} strokeWidth={2.4} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.heroBadge}>
                  <Wallet size={14} color={ACCENT} strokeWidth={2.4} />
                  <Text style={styles.heroBadgeText}>{texts.profileActive}</Text>
                </View>

                <View style={styles.heroMiniPill}>
                  <Text style={styles.heroMiniPillText}>{summaryText}</Text>
                </View>
              </View>

              <Text style={styles.heroTitle}>{texts.heroTitle}</Text>
              <Text style={styles.heroText}>{texts.heroText}</Text>

              <View style={styles.heroStatsRow}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{allowSmartRouting ? texts.on : texts.off}</Text>
                  <Text style={styles.heroStatLabel}>{texts.smartRouting}</Text>
                </View>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{faceIdForSensitive ? texts.on : texts.off}</Text>
                  <Text style={styles.heroStatLabel}>{texts.sensitiveGuard}</Text>
                </View>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>
                    {requireConfirmationForLargePayments ? texts.on : texts.off}
                  </Text>
                  <Text style={styles.heroStatLabel}>{texts.largePaymentCheck}</Text>
                </View>
              </View>
            </View>

            <WalletProviderStatusPanel scope="settings" compact />

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Globe2 size={17} color={ACCENT} strokeWidth={2.4} />
                <Text style={styles.sectionTitle}>{texts.currencyTitle}</Text>
              </View>

              <SettingRow
                title={texts.primaryCurrency}
                description={texts.primaryCurrencyDescription}
                value={primaryCurrencyValue}
              />
              <CurrencySelectorRow
                options={WALLET_PRIMARY_CURRENCY_OPTIONS}
                activeKey={primaryCurrencyValue}
                t={t}
                onSelect={savePrimaryCurrency}
              />

              <SettingRow
                title={texts.localCurrency}
                description={texts.localCurrencyDescription}
                value={localCurrencyValue || texts.localNotConfigured}
              />
              <CurrencySelectorRow
                options={WALLET_LOCAL_CURRENCY_OPTIONS}
                activeKey={localCurrencyValue}
                t={t}
                onSelect={saveLocalCurrency}
              />

              <SettingRow
                title={texts.internationalCurrency}
                description={texts.internationalCurrencyDescription}
                value={internationalCurrencyValue}
              />
              <CurrencySelectorRow
                options={WALLET_INTERNATIONAL_CURRENCY_OPTIONS}
                activeKey={internationalCurrencyValue}
                t={t}
                onSelect={saveInternationalCurrency}
              />

              <InfoCard
                icon={<Globe2 size={16} color={ACCENT} strokeWidth={2.4} />}
                title={texts.noHardcodedCurrencyTitle}
                value={texts.noHardcodedCurrencyText}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <CreditCard size={17} color={ACCENT} strokeWidth={2.4} />
                <Text style={styles.sectionTitle}>{texts.cardPreferences}</Text>
              </View>

              <SettingRow
                title={texts.manageCards}
                description={texts.manageCardsDescription}
                onPress={() => router.push("/wallet/cards" as never)}
              />

              <SettingRow
                title={texts.defaultCardMode}
                description={texts.defaultCardModeDescription}
                value={labelForDefaultCardMode(defaultCardMode, texts)}
              />

              <SelectorRow
                options={[
                  { key: "smart", label: texts.smart },
                  { key: "local", label: texts.local },
                  { key: "international", label: texts.international },
                  { key: "virtual", label: texts.virtual },
                ]}
                activeKey={defaultCardMode}
                onSelect={(key) => setDefaultCardMode(key as DefaultCardMode)}
              />

              <ToggleRow
                title={texts.autoSelectBestCard}
                description={texts.autoSelectBestCardDescription}
                value={autoSelectBestCard}
                onValueChange={setAutoSelectBestCard}
              />

              <ToggleRow
                title={texts.showLast4}
                description={texts.showLast4Description}
                value={showCardLast4Only}
                onValueChange={setShowCardLast4Only}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Wallet size={17} color={ACCENT} strokeWidth={2.4} />
                <Text style={styles.sectionTitle}>{texts.walletPreferences}</Text>
              </View>

              <SettingRow
                title={texts.sabiPayQuickAccess}
                description={texts.sabiPayQuickAccessDescription}
                onPress={() => router.push("/wallet/send" as never)}
              />

              <SettingRow
                title={texts.qrQuickAccess}
                description={texts.qrQuickAccessDescription}
                onPress={() => router.push("/wallet/qr" as never)}
              />

              <ToggleRow
                title={texts.allowSmartRouting}
                description={texts.allowSmartRoutingDescription}
                value={allowSmartRouting}
                onValueChange={setAllowSmartRouting}
              />

              <SettingRow
                title={texts.paymentPriority}
                description={texts.paymentPriorityDescription}
                value={labelForPaymentPriority(paymentPriority, texts)}
              />

              <SelectorRow
                options={[
                  { key: "smart", label: texts.smart },
                  { key: "sabi_balance", label: texts.sabiBalance },
                  { key: "cards", label: texts.cards },
                ]}
                activeKey={paymentPriority}
                onSelect={(key) => setPaymentPriority(key as PaymentPriority)}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ShieldCheck size={17} color={ACCENT} strokeWidth={2.4} />
                <Text style={styles.sectionTitle}>{texts.adminComplianceTitle}</Text>
              </View>

              <SettingRow
                title={texts.complianceStatus}
                description={texts.adminComplianceDescription}
                value={labelForComplianceStatus(complianceView.complianceStatus, texts)}
              />

              <SettingRow
                title={texts.kycStatus}
                description={texts.providerConfigurationRequired}
                value={labelForKycStatus(complianceView.kycStatus, texts)}
              />

              <SettingRow
                title={texts.amlStatus}
                description={complianceView.safeHoldReason || texts.adminComplianceDescription}
                value={labelForAmlStatus(complianceView.amlStatus, texts)}
              />

              <SettingRow
                title={texts.adminReviewStatus}
                description={complianceView.restrictedReason || texts.adminComplianceDescription}
                value={labelForAdminReviewStatus(complianceView.adminReviewStatus, texts)}
              />

              <InfoCard
                icon={<ShieldCheck size={16} color={ACCENT} strokeWidth={2.4} />}
                title={texts.tokenOnlyPolicy}
                value={texts.tokenOnlyPolicyText}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ShieldCheck size={17} color={ACCENT} strokeWidth={2.4} />
                <Text style={styles.sectionTitle}>{texts.security}</Text>
              </View>

              <ToggleRow
                title={texts.walletNotifications}
                description={texts.walletNotificationsDescription}
                value={walletNotifications}
                onValueChange={setWalletNotifications}
              />

              <ToggleRow
                title={texts.securityAlerts}
                description={texts.securityAlertsDescription}
                value={securityAlerts}
                onValueChange={setSecurityAlerts}
              />

              <ToggleRow
                title={texts.requireLargeConfirmation}
                description={texts.requireLargeConfirmationDescription}
                value={requireConfirmationForLargePayments}
                onValueChange={setRequireConfirmationForLargePayments}
              />

              <SettingRow
                title={texts.sensitiveBehavior}
                description={texts.sensitiveBehaviorDescription}
                value={labelForSensitiveMode(sensitiveMode, texts)}
              />

              <SelectorRow
                options={[
                  { key: "tap_to_reveal", label: texts.tap },
                  { key: "biometric", label: texts.biometric },
                  { key: "pin", label: texts.pin },
                ]}
                activeKey={sensitiveMode}
                onSelect={(key) => setSensitiveMode(key as SensitiveMode)}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Eye size={17} color={ACCENT} strokeWidth={2.4} />
                <Text style={styles.sectionTitle}>{texts.sensitiveBehavior}</Text>
              </View>

              <ToggleRow
                title={texts.useBiometric}
                description={texts.useBiometricDescription}
                value={faceIdForSensitive}
                onValueChange={setFaceIdForSensitive}
              />

              <ToggleRow
                title={texts.hideBalances}
                description={texts.hideBalancesDescription}
                value={hideBalancesOnOpen}
                onValueChange={setHideBalancesOnOpen}
              />

              <SettingRow
                title={texts.notificationPreferences}
                description={texts.notificationPreferencesDescription}
                onPress={() => router.push("/notification-preferences" as never)}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <SlidersHorizontal size={17} color={ACCENT} strokeWidth={2.4} />
                <Text style={styles.sectionTitle}>{texts.limits}</Text>
              </View>

              <LimitCard
                title={texts.dailySendLimit}
                value={texts.policyControlled}
                description={texts.dailySendLimitDescription}
              />

              <LimitCard
                title={texts.qrPaymentLimit}
                value={texts.policyControlled}
                description={texts.qrPaymentLimitDescription}
              />

              <LimitCard
                title={texts.sensitiveWindow}
                value={texts.policyControlled}
                description={texts.sensitiveWindowDescription}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Lock size={17} color={ACCENT} strokeWidth={2.4} />
                <Text style={styles.sectionTitle}>{texts.defaultBehavior}</Text>
              </View>

              <InfoCard
                icon={<Fingerprint size={16} color={ACCENT} strokeWidth={2.4} />}
                title={texts.defaultSensitiveUnlock}
                value={labelForSensitiveMode(sensitiveMode, texts)}
              />

              <InfoCard
                icon={<CreditCard size={16} color={ACCENT} strokeWidth={2.4} />}
                title={texts.defaultCardSelection}
                value={labelForDefaultCardMode(defaultCardMode, texts)}
              />

              <InfoCard
                icon={<Wallet size={16} color={ACCENT} strokeWidth={2.4} />}
                title={texts.defaultPaymentSource}
                value={labelForPaymentPriority(paymentPriority, texts)}
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function ToggleRow({
  title,
  description,
  value,
  onValueChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

function SettingRow({
  title,
  description,
  value,
  onPress,
}: {
  title: string;
  description: string;
  value?: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>

      <View style={styles.rowRightWrap}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {onPress ? <ChevronRight size={16} color={MUTED} strokeWidth={2.4} /> : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable style={styles.row} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.row}>{content}</View>;
}

function SelectorRow({
  options,
  activeKey,
  onSelect,
}: {
  options: { key: string; label: string }[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <View style={styles.selectorWrap}>
      {options.map((option) => {
        const active = option.key === activeKey;
        return (
          <Pressable
            key={option.key}
            onPress={() => onSelect(option.key)}
            style={[styles.selectorChip, active && styles.selectorChipActive]}
          >
            <Text style={[styles.selectorChipText, active && styles.selectorChipTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function CurrencySelectorRow({
  options,
  activeKey,
  t,
  onSelect,
}: {
  options: WalletCurrencyOption[];
  activeKey: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  onSelect: (key: string) => void;
}) {
  return (
    <View style={styles.currencyGrid}>
      {options.map((option) => {
        const active = option.code === activeKey;
        const label = walletText(t, option.nameKey, option.code || "Not configured");
        return (
          <Pressable
            key={option.code || "not-configured"}
            onPress={() => onSelect(option.code)}
            style={[styles.currencyChip, active && styles.selectorChipActive]}
          >
            <Text style={[styles.currencyCode, active && styles.selectorChipTextActive]}>
              {option.code || "—"}
            </Text>
            <Text style={[styles.currencyName, active && styles.selectorChipTextActive]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function LimitCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <View style={styles.limitCard}>
      <Text style={styles.limitTitle}>{title}</Text>
      <Text style={styles.limitValue}>{value}</Text>
      <Text style={styles.limitDescription}>{description}</Text>
    </View>
  );
}

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function labelForDefaultCardMode(value: DefaultCardMode, texts: WalletSettingsLabelTexts) {
  switch (value) {
    case "local":
      return texts.localFirst;
    case "international":
      return texts.internationalFirst;
    case "virtual":
      return texts.virtualFirst;
    case "smart":
    default:
      return texts.smartAuto;
  }
}

function labelForSensitiveMode(value: SensitiveMode, texts: WalletSettingsLabelTexts) {
  switch (value) {
    case "tap_to_reveal":
      return texts.tapToReveal;
    case "pin":
      return texts.pinRequired;
    case "biometric":
    default:
      return texts.biometricRequired;
  }
}

function labelForPaymentPriority(value: PaymentPriority, texts: WalletSettingsLabelTexts) {
  switch (value) {
    case "sabi_balance":
      return texts.sabiBalanceFirst;
    case "cards":
      return texts.cardsFirst;
    case "smart":
    default:
      return texts.smartAuto;
  }
}

function labelForComplianceStatus(value: string, texts: WalletComplianceLabelTexts) {
  switch (value) {
    case "kyc_required":
      return texts.kycRequired;
    case "aml_review":
      return texts.amlReview;
    case "admin_review":
      return texts.adminReview;
    case "safe_hold":
      return texts.safeHold;
    case "restricted":
      return texts.restricted;
    case "blocked":
      return texts.blocked;
    case "clear":
    default:
      return texts.clear;
  }
}

function labelForKycStatus(value: string, texts: WalletComplianceLabelTexts) {
  switch (value) {
    case "required":
      return texts.required;
    case "pending":
      return texts.pending;
    case "verified":
      return texts.verified;
    case "rejected":
      return texts.rejected;
    case "not_required":
    default:
      return texts.notRequired;
  }
}

function labelForAmlStatus(value: string, texts: WalletComplianceLabelTexts) {
  switch (value) {
    case "monitoring":
      return texts.monitoring;
    case "review_required":
      return texts.reviewRequired;
    case "safe_hold":
      return texts.safeHold;
    case "blocked":
      return texts.blocked;
    case "clear":
    default:
      return texts.clear;
  }
}

function labelForAdminReviewStatus(value: string, texts: WalletComplianceLabelTexts) {
  switch (value) {
    case "pending":
      return texts.pending;
    case "approved":
      return texts.approved;
    case "rejected":
      return texts.rejected;
    case "escalated":
      return texts.escalated;
    case "not_required":
    default:
      return texts.notRequired;
  }
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 6,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  headerCenter: {
    flex: 1,
  },
  headerButton: {
    minWidth: 58,
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: STROKE,
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "800",
  },
  eyebrow: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  title: {
    color: TEXT,
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 34,
    gap: 12,
  },
  heroCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: STROKE,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(93,163,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(93,163,255,0.18)",
  },
  heroBadgeText: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "800",
  },
  heroMiniPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: SURFACE_2,
    borderWidth: 1,
    borderColor: STROKE,
  },
  heroMiniPillText: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "800",
  },
  heroTitle: {
    color: TEXT,
    fontSize: 23,
    fontWeight: "900",
  },
  heroText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    marginTop: 8,
  },
  heroStatsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  heroStat: {
    flex: 1,
    backgroundColor: SURFACE_2,
    borderWidth: 1,
    borderColor: STROKE,
    borderRadius: 16,
    padding: 10,
  },
  heroStatValue: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "900",
  },
  heroStatLabel: {
    color: MUTED,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 4,
    fontWeight: "700",
  },
  section: {
    borderRadius: 24,
    padding: 14,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: STROKE,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "900",
  },
  row: {
    minHeight: 68,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: SURFACE_2,
    borderWidth: 1,
    borderColor: STROKE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "900",
  },
  rowDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    fontWeight: "600",
  },
  rowRightWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: 140,
  },
  rowValue: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
  },
  selectorWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  selectorChip: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: SURFACE_2,
    borderWidth: 1,
    borderColor: STROKE,
    alignItems: "center",
    justifyContent: "center",
  },
  selectorChipActive: {
    backgroundColor: "rgba(93,163,255,0.18)",
    borderColor: "rgba(93,163,255,0.50)",
  },
  selectorChipText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "800",
  },
  selectorChipTextActive: {
    color: TEXT,
  },
  currencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  currencyChip: {
    width: "31.8%",
    minHeight: 58,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: SURFACE_2,
    borderWidth: 1,
    borderColor: STROKE,
    alignItems: "center",
    justifyContent: "center",
  },
  currencyCode: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "900",
  },
  currencyName: {
    color: MUTED,
    fontSize: 10,
    marginTop: 3,
    fontWeight: "700",
  },
  limitCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: SURFACE_2,
    borderWidth: 1,
    borderColor: STROKE,
    marginBottom: 10,
  },
  limitTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "900",
  },
  limitValue: {
    color: ACCENT,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 6,
  },
  limitDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
    fontWeight: "600",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    padding: 14,
    backgroundColor: SURFACE_2,
    borderWidth: 1,
    borderColor: STROKE,
    marginBottom: 10,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(93,163,255,0.12)",
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "900",
  },
  infoValue: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    fontWeight: "600",
  },
});
