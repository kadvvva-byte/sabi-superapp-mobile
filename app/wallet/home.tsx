const SABI_WALLET_CLIENT_POLICY_FIX4: any = {
  walletMode: "restricted",
  localWalletVisible: false,
  cryptoWalletVisible: false,
  cryptoCardVisible: false,
  stripeIssuingVisible: false,
  stripeCryptoOnrampVisible: false,
  stripeStablecoinPaymentsVisible: false,
  stripeStablecoinBackedCardVisible: false,
  cryptoCardServiceEnabled: false,
};
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  ChevronRight,
  Coins,
  CreditCard,
  History,
  Landmark,
  Lightbulb,
  MessageCircleMore,
  Plus,
  QrCode,
  ScanLine,
  Settings,
  ShieldCheck,
  Store,
  Wallet,
} from "lucide-react-native";

import WalletScreenShell from "../../src/modules/wallet/components/WalletScreenShell";
import WalletScrollScreen from "../../src/modules/wallet/components/WalletScrollScreen";
import { useSabiTheme } from "../../src/theme/ThemeProvider";
import { useI18n } from "../../src/shared/i18n";
import {
  formatCoinWalletAmount,
  formatLocalWalletAmount,
  formatPrimaryWalletAmount,
  formatUsdWalletAmount,
  useWalletFoundation,
} from "../../src/shared/wallet/wallet-foundation";
import { getWalletHomeTexts } from "../../src/shared/wallet/wallet-i18n";
import { getSabiMobilePolicy, isWalletHeroBlockVisibleForSabiPolicy, isWalletHubActionVisibleForSabiPolicy, isWalletQuickActionVisibleForSabiPolicy } from "../../src/shared/policy/sabiMobilePolicy";

const ROUTES = {
  SEND: "/wallet/send-internal",
  TOP_UP: "/wallet/topup",
  RECEIVE: "/wallet/receive",
  WITHDRAW: "/wallet/withdraw",
  REQUEST: "/wallet/request-money",
  QR_SCAN: "/wallet/qr-scan",
  HISTORY: "/wallet/history",
  PAYMENTS: "/wallet/payments",
  LOCAL_CARD_DETAILS: "/wallet/cards/local-card-details",
  CARDS_HUB: "/wallet/cards",
  BUSINESS: "/wallet/business-pay",
  MERCHANT: "/wallet/merchant-pay",
  CRYPTO: "/wallet/crypto",
  COIN: "/wallet/coin",
  MY_SABI_ID: "/wallet/my-sabi-id",
  CHAT_PAYMENTS: "/wallet/chat-payments",
  VIRTUAL_CARD: "/wallet/virtual-card",
  SETTINGS: "/wallet/settings",
  FINANCIAL_DASHBOARD: "/wallet/financial-dashboard",
  ASSISTANT: "/ai",
} as const;

type HeroBlock = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  balanceLabel?: string;
  balance?: string;
  icon: React.ReactNode;
  route: string;
  colors: [string, string, string];
  pills: string[];
};

type QuickAction = {
  id: string;
  title: string;
  icon: React.ReactNode;
  route: string;
};

type HubAction = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  route: string;
};

function SectionHeader({
  title,
  hint,
  colors,
}: {
  title: string;
  hint: string;
  colors: { text: string; textSecondary: string };
}) {
  const visibleWalletHubActions = walletHubActions.filter((item: { id?: string; hidden?: boolean; disabled?: boolean; title?: string; subtitle?: string; label?: string }) => isWalletHubActionVisibleForSabiPolicy((item.id ?? ""), SABI_WALLET_CLIENT_POLICY_FIX4));

  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>{hint}</Text>
    </View>
  );
}

function Pill({
  label,
  colors,
  radius,
}: {
  label: string;
  colors: { cardSoft: string; border: string; text: string };
  radius: number;
}) {
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: colors.cardSoft,
          borderColor: colors.border,
          borderRadius: radius,
        },
      ]}
    >
      <Text style={[styles.pillText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

function QuickActionButton({
  title,
  icon,
  onPress,
  colors,
  radius,
}: {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  colors: { cardSoft: string; border: string; text: string };
  radius: { lg: number };
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.quickAction,
        {
          backgroundColor: colors.cardSoft,
          borderColor: colors.border,
          borderRadius: radius.lg,
        },
      ]}
    >
      <View style={styles.quickActionIcon}>{icon}</View>
      <Text style={[styles.quickActionText, { color: colors.text }]}>{title}</Text>
    </Pressable>
  );
}

function HeroBanner({
  block,
  radius,
}: {
  block: HeroBlock;
  radius: { xl: number; lg: number };
}) {
  const showBalance = Boolean(block.balanceLabel && block.balance);

  return (
    <Pressable onPress={() => router.push(block.route as never)} style={styles.heroWrap}>
      <View
        style={[
          styles.heroCard,
          {
            borderRadius: radius.xl,
            borderColor: "rgba(101,146,255,0.16)",
            backgroundColor: block.colors[1],
          },
        ]}
      >
        <View style={[styles.heroGlowA, { backgroundColor: block.colors[0] }]} />
        <View style={[styles.heroGlowB, { backgroundColor: block.colors[2] }]} />
        <View style={styles.heroShine} />

        <View style={styles.heroTopRow}>
          <View
            style={[
              styles.heroIconWrap,
              {
                borderRadius: radius.lg,
                backgroundColor: "rgba(255,255,255,0.08)",
                borderColor: "rgba(255,255,255,0.12)",
              },
            ]}
          >
            {block.icon}
          </View>

          <View style={styles.heroArrowWrap}>
            <ChevronRight size={18} color="#EAF1FF" />
          </View>
        </View>

        <Text style={styles.heroEyebrow}>{block.eyebrow}</Text>
        <Text style={styles.heroTitle}>{block.title}</Text>
        <Text style={styles.heroSubtitle}>{block.subtitle}</Text>

        {showBalance ? (
          <View style={styles.heroBalanceBlock}>
            <Text style={styles.heroBalanceLabel}>{block.balanceLabel}</Text>
            <Text style={styles.heroBalance}>{block.balance}</Text>
          </View>
        ) : null}

        <View style={styles.heroPillsRow}>
          {block.pills.map((pill, index) => (
            <View key={`${block.id}-pill-${index}`} style={styles.heroInlinePill}>
              <Text style={styles.heroInlinePillText}>{pill}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

function ActionCard({
  title,
  subtitle,
  icon,
  onPress,
  colors,
  radius,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
  colors: {
    cardSoft: string;
    border: string;
    text: string;
    textSecondary: string;
  };
  radius: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.actionCard,
        {
          backgroundColor: colors.cardSoft,
          borderColor: colors.border,
          borderRadius: radius,
        },
      ]}
    >
      <View style={styles.actionTopRow}>
        <View style={styles.actionIconWrap}>{icon}</View>
        <ChevronRight size={16} color={colors.textSecondary} />
      </View>

      <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

function InfoRow({
  icon,
  title,
  text,
  colors,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  colors: { text: string; textSecondary: string };
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoTextWrap}>
        <Text style={[styles.infoTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>{text}</Text>
      </View>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}


const walletHubActions: Array<{ id?: string; title?: string; subtitle?: string; label?: string; disabled?: boolean; hidden?: boolean }> = [];
export default function WalletHomeScreen() {
  const { colors, radius } = useSabiTheme();
  const { t } = useI18n();
  const { snapshot, loading } = useWalletFoundation();
  const SABI_WALLET_CLIENT_POLICY_FIX4 = useMemo(() => getSabiMobilePolicy(), []);

  const texts = useMemo(() => getWalletHomeTexts(t), [t]);

  const mainBalanceText = useMemo(() => {
    return formatPrimaryWalletAmount(snapshot.mainBalanceUsd, snapshot.primaryCurrencyCode);
  }, [snapshot.mainBalanceUsd, snapshot.primaryCurrencyCode]);

  const localBalanceText = useMemo(() => {
    return formatLocalWalletAmount(snapshot.localBalance, snapshot.localCurrencyCode);
  }, [snapshot.localBalance, snapshot.localCurrencyCode]);

  const coinBalanceText = useMemo(() => {
    return formatCoinWalletAmount(snapshot.coinBalance);
  }, [snapshot.coinBalance]);

  const cryptoBalanceText = useMemo(() => {
    return formatUsdWalletAmount(snapshot.cryptoBalanceUsd);
  }, [snapshot.cryptoBalanceUsd]);

  const localBalanceLabel = useMemo(() => {
    return texts.localCardsBalanceLabel;
  }, [texts.localCardsBalanceLabel]);

  const quickActions: QuickAction[] = [
    {
      id: "top-up",
      title: texts.topUp,
      icon: <Plus size={18} color={colors.text} />,
      route: ROUTES.TOP_UP,
    },
    {
      id: "receive",
      title: texts.receive,
      icon: <ArrowDownLeft size={18} color={colors.text} />,
      route: ROUTES.RECEIVE,
    },
    {
      id: "withdraw",
      title: texts.withdraw,
      icon: <ArrowUpRight size={18} color={colors.text} />,
      route: ROUTES.WITHDRAW,
    },
    {
      id: "request",
      title: texts.request,
      icon: <ArrowDownLeft size={18} color={colors.text} />,
      route: ROUTES.REQUEST,
    },
    {
      id: "scan-qr",
      title: texts.scanQr,
      icon: <ScanLine size={18} color={colors.text} />,
      route: ROUTES.QR_SCAN,
    },
    {
      id: "history",
      title: texts.history,
      icon: <History size={18} color={colors.text} />,
      route: ROUTES.HISTORY,
    },
    {
      id: "settings",
      title: texts.settings,
      icon: <Settings size={18} color={colors.text} />,
      route: ROUTES.SETTINGS,
    },
    {
      id: "my-sabi-id",
      title: texts.mySabiId,
      icon: <ShieldCheck size={18} color={colors.text} />,
      route: ROUTES.MY_SABI_ID,
    },
  ];

  const visibleQuickActions = quickActions.filter((item) => isWalletQuickActionVisibleForSabiPolicy((item.id ?? ""), SABI_WALLET_CLIENT_POLICY_FIX4));

  const heroBlocks: HeroBlock[] = [
    {
      id: "sabi-pay",
      eyebrow: texts.eyebrowSabiPay,
      title: texts.sabiPayTitle,
      subtitle: texts.sabiPaySubtitle,
      balanceLabel: texts.sabiPayBalanceLabel,
      balance: mainBalanceText,
      icon: <Wallet size={22} color="#EAF1FF" />,
      route: ROUTES.PAYMENTS,
      colors: ["#2E6BFF", "#173C9A", "#0A1632"],
      pills: [texts.mySabiId, texts.pillInternal, texts.pillCore],
    },
    {
      id: "qr",
      eyebrow: texts.eyebrowQr,
      title: texts.qrTitle,
      subtitle: texts.qrSubtitle,
      icon: <QrCode size={22} color="#EAF1FF" />,
      route: ROUTES.QR_SCAN,
      colors: ["#0F5D97", "#0D3663", "#07182E"],
      pills: [texts.pillCamera, texts.pillMyQr, texts.pillMerchant],
    },
    {
      id: "coin-balance",
      eyebrow: texts.eyebrowSabiCoin,
      title: texts.coinTitle,
      subtitle: texts.coinSubtitle,
      balanceLabel: texts.coinBalanceLabel,
      balance: coinBalanceText,
      icon: <Coins size={22} color="#EAF1FF" />,
      route: ROUTES.COIN,
      colors: ["#12B886", "#0B6B52", "#071C15"],
      pills: ["COIN", texts.pillGifts, texts.pillStream],
    },
    {
      id: "local-cards",
      eyebrow: texts.eyebrowLocalCards,
      title: texts.localCardsTitle,
      subtitle: texts.localCardsSubtitle,
      balanceLabel: localBalanceLabel,
      balance: localBalanceText,
      icon: <Landmark size={22} color="#EAF1FF" />,
      route: ROUTES.LOCAL_CARD_DETAILS,
      colors: ["#4C67F5", "#2738A4", "#0D1437"],
      pills: [texts.pillDomestic, texts.pillCore, "OTP"],
    },
    {
      id: "business",
      eyebrow: texts.eyebrowBusiness,
      title: texts.businessTitle,
      subtitle: texts.businessSubtitle,
      icon: <BriefcaseBusiness size={22} color="#EAF1FF" />,
      route: ROUTES.BUSINESS,
      colors: ["#0E7A67", "#0B4B41", "#081917"],
      pills: [texts.pillBusiness, texts.pillOperations, texts.pillReferences],
    },
    {
      id: "merchant",
      eyebrow: texts.eyebrowMerchant,
      title: texts.merchantTitle,
      subtitle: texts.merchantSubtitle,
      icon: <Store size={22} color="#EAF1FF" />,
      route: ROUTES.MERCHANT,
      colors: ["#7C44F2", "#4A239B", "#140A2D"],
      pills: [texts.pillMerchant, texts.pillCheckout, texts.pillSettlements],
    },
    {
      id: "crypto",
      eyebrow: texts.eyebrowCrypto,
      title: texts.cryptoTitle,
      subtitle: texts.cryptoSubtitle,
      balanceLabel: texts.cryptoBalanceLabel,
      balance: cryptoBalanceText,
      icon: <Wallet size={22} color="#EAF1FF" />,
      route: ROUTES.CRYPTO,
      colors: ["#374A66", "#1F2B40", "#0A1320"],
      pills: [texts.pillProvider, texts.pillCustody, texts.pillAssets],
    },
  ];

  const visibleHeroBlocks = heroBlocks.filter((item) => isWalletHeroBlockVisibleForSabiPolicy((item.id ?? ""), SABI_WALLET_CLIENT_POLICY_FIX4));

  const walletHubActions: HubAction[] = [
    {
      id: "top-up",
      title: texts.topUp,
      subtitle: texts.topUpSubtitle,
      icon: <Plus size={19} color={colors.text} />,
      route: ROUTES.TOP_UP,
    },
    {
      id: "receive",
      title: texts.receive,
      subtitle: texts.receiveSubtitle,
      icon: <ArrowDownLeft size={19} color={colors.text} />,
      route: ROUTES.RECEIVE,
    },
    {
      id: "withdraw",
      title: texts.withdraw,
      subtitle: texts.withdrawSubtitle,
      icon: <ArrowUpRight size={19} color={colors.text} />,
      route: ROUTES.WITHDRAW,
    },
    {
      id: "financial-dashboard",
      title: texts.financialDashboardTitle,
      subtitle: texts.financialDashboardSubtitle,
      icon: <History size={19} color={colors.text} />,
      route: ROUTES.FINANCIAL_DASHBOARD,
    },
    {
      id: "cards",
      title: texts.cardsHubTitle,
      subtitle: texts.cardsHubSubtitle,
      icon: <CreditCard size={19} color={colors.text} />,
      route: ROUTES.CARDS_HUB,
    },
    {
      id: "chat-payments",
      title: texts.chatPaymentsTitle,
      subtitle: texts.chatPaymentsSubtitle,
      icon: <MessageCircleMore size={19} color={colors.text} />,
      route: ROUTES.CHAT_PAYMENTS,
    },
    {
      id: "virtual-card",
      title: texts.virtualCardTitle,
      subtitle: texts.virtualCardSubtitle,
      icon: <CreditCard size={19} color={colors.text} />,
      route: ROUTES.VIRTUAL_CARD,
    },
    {
      id: "settings",
      title: texts.settings,
      subtitle: texts.settingsSubtitle,
      icon: <Settings size={19} color={colors.text} />,
      route: ROUTES.SETTINGS,
    },
  ];

  return (
    <WalletScreenShell>
      <WalletScrollScreen
        topInsetExtra={18}
        bottomInsetExtra={18}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.eyebrow, { color: colors.accent }]}>
              {texts.headerEyebrow}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              {texts.headerTitle}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {texts.headerSubtitle}
            </Text>
          </View>

          <Pressable
            onPress={() => router.push(ROUTES.SETTINGS as never)}
            style={[
              styles.headerSettingsButton,
              {
                backgroundColor: colors.cardSoft,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <Settings size={18} color={colors.text} />
          </Pressable>
        </View>

        <View
          style={[
            styles.mainHeroShell,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <View style={styles.mainHeroGlowA} />
          <View style={styles.mainHeroGlowB} />
          <View style={styles.mainHeroShine} />

          <View style={styles.mainHeroTopRow}>
            <View
              style={[
                styles.mainHeroIconWrap,
                {
                  backgroundColor: "rgba(72,120,255,0.12)",
                  borderColor: "rgba(89,136,255,0.18)",
                  borderRadius: radius.lg,
                },
              ]}
            >
              <Wallet size={22} color={colors.text} />
            </View>

            <View style={styles.mainHeroTextWrap}>
              <Text style={[styles.mainHeroTitle, { color: colors.text }]}>
                {texts.mainHeroTitle}
              </Text>
              <Text style={[styles.mainHeroSubtitle, { color: colors.textSecondary }]}>
                {texts.mainHeroSubtitle}
              </Text>
            </View>
          </View>

          <View style={styles.mainHeroStatsGrid}>
            <View style={styles.mainHeroStatCard}>
              <Text style={[styles.mainHeroStatLabel, { color: colors.textSecondary }]}>
                {texts.mainBalanceLabel}
              </Text>
              <Text style={[styles.mainHeroStatValue, { color: colors.text }]}>
                {mainBalanceText}
              </Text>
              <Text style={styles.mainHeroStatHint}>{texts.mainBalanceHint}</Text>
            </View>

            <View style={styles.mainHeroStatCard}>
              <Text style={[styles.mainHeroStatLabel, { color: colors.textSecondary }]}>
                {texts.localBalanceLabel}
              </Text>
              <Text style={[styles.mainHeroStatValue, { color: colors.text }]}>
                {localBalanceText}
              </Text>
              <Text style={styles.mainHeroStatHint}>{texts.localBalanceHint}</Text>
            </View>
          </View>

          <View style={styles.mainHeroPills}>
            <Pill label={texts.pillSabiPay} colors={colors} radius={radius.lg} />
            <Pill label={texts.pillSabiBalance} colors={colors} radius={radius.lg} />
            <Pill label="COIN" colors={colors} radius={radius.lg} />
            <Pill label="QR" colors={colors} radius={radius.lg} />
          </View>

          <View style={styles.mainHeroActionRow}>
            <Pressable
              onPress={() => router.push(ROUTES.SEND as never)}
              style={styles.mainHeroPrimaryButton}
            >
              <ArrowUpRight size={18} color="#EAF1FF" />
              <Text style={styles.mainHeroPrimaryButtonText}>{texts.send}</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push(ROUTES.CARDS_HUB as never)}
              style={styles.mainHeroSecondaryButton}
            >
              <CreditCard size={18} color="#DCE7FF" />
              <Text style={styles.mainHeroSecondaryButtonText}>{texts.cards}</Text>
            </Pressable>
          </View>

          {loading ? (
            <Text style={styles.loadingStateText}>{texts.loading}</Text>
          ) : null}
        </View>

        <SectionHeader
          title={texts.quickActionsTitle}
          hint={texts.quickActionsHint}
          colors={colors}
        />
        <View style={styles.quickActionsRow}>
          {visibleQuickActions.map((item) => (
            <QuickActionButton
              key={(item.id ?? "")}
              title={item.title}
              icon={item.icon}
              onPress={() => router.push(item.route as never)}
              colors={colors}
              radius={radius}
            />
          ))}
        </View>

        <SectionHeader
          title={texts.mainBlocksTitle}
          hint={texts.mainBlocksHint}
          colors={colors}
        />
        <View style={styles.heroGrid}>
          {visibleHeroBlocks.map((block) => (
            <HeroBanner key={block.id} block={block} radius={radius} />
          ))}
        </View>

        <SectionHeader
          title={texts.aiSectionTitle}
          hint={texts.aiSectionHint}
          colors={colors}
        />
        <Pressable
          onPress={() => router.push(ROUTES.ASSISTANT as never)}
          style={[
            styles.aiCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <View style={styles.aiGlowA} />
          <View style={styles.aiGlowB} />
          <View style={styles.aiShine} />

          <View style={styles.aiTopRow}>
            <View
              style={[
                styles.aiIconWrap,
                {
                  borderRadius: radius.lg,
                },
              ]}
            >
              <Bot size={22} color="#EAF1FF" />
            </View>

            <View style={styles.aiArrowWrap}>
              <ChevronRight size={18} color="#EAF1FF" />
            </View>
          </View>

          <Text style={styles.aiEyebrow}>AI</Text>
          <Text style={styles.aiTitle}>{texts.aiTitle}</Text>
          <Text style={styles.aiSubtitle}>{texts.aiSubtitle}</Text>

          <View style={styles.aiPillsRow}>
            <View style={styles.aiInlinePill}>
              <Text style={styles.aiInlinePillText}>{texts.askAi}</Text>
            </View>
            <View style={styles.aiInlinePill}>
              <Text style={styles.aiInlinePillText}>{texts.smartTips}</Text>
            </View>
            <View style={styles.aiInlinePill}>
              <Text style={styles.aiInlinePillText}>{texts.recentHelp}</Text>
            </View>
          </View>

          <View style={styles.aiMiniGrid}>
            <View style={styles.aiMiniCard}>
              <Lightbulb size={16} color="#D2B9FF" />
              <Text style={styles.aiMiniCardTitle}>{texts.aiGuidanceTitle}</Text>
              <Text style={styles.aiMiniCardText}>{texts.aiGuidanceText}</Text>
            </View>

            <View style={styles.aiMiniCard}>
              <Bot size={16} color="#D2B9FF" />
              <Text style={styles.aiMiniCardTitle}>{texts.aiSupportTitle}</Text>
              <Text style={styles.aiMiniCardText}>{texts.aiSupportText}</Text>
            </View>
          </View>
        </Pressable>

        <SectionHeader
          title={texts.infraTitle}
          hint={texts.infraHint}
          colors={colors}
        />
        <View style={styles.actionGrid}>
          {walletHubActions.map((item) => (
            <ActionCard
              key={(item.id ?? "")}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              onPress={() => router.push(item.route as never)}
              colors={colors}
              radius={radius.lg}
            />
          ))}
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <SectionHeader
            title={texts.controlsTitle}
            hint={texts.controlsHint}
            colors={colors}
          />

          <InfoRow
            icon={<Wallet size={18} color={colors.text} />}
            title={texts.info1Title}
            text={texts.info1Text}
            colors={colors}
          />
          <Divider color={colors.border} />
          <InfoRow
            icon={<ScanLine size={18} color={colors.text} />}
            title={texts.info2Title}
            text={texts.info2Text}
            colors={colors}
          />
          <Divider color={colors.border} />
          <InfoRow
            icon={<CreditCard size={18} color={colors.text} />}
            title={texts.info3Title}
            text={texts.info3Text}
            colors={colors}
          />
          <Divider color={colors.border} />
          <InfoRow
            icon={<Coins size={18} color={colors.text} />}
            title={texts.info4Title}
            text={texts.info4Text}
            colors={colors}
          />
          <Divider color={colors.border} />
          <InfoRow
            icon={<BriefcaseBusiness size={18} color={colors.text} />}
            title={texts.info5Title}
            text={texts.info5Text}
            colors={colors}
          />
          <Divider color={colors.border} />
          <InfoRow
            icon={<Bot size={18} color={colors.text} />}
            title={texts.info6Title}
            text={texts.info6Text}
            colors={colors}
          />
          <Divider color={colors.border} />
          <InfoRow
            icon={<ShieldCheck size={18} color={colors.text} />}
            title={texts.info7Title}
            text={texts.info7Text}
            colors={colors}
          />
        </View>
      </WalletScrollScreen>
    </WalletScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {},

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 22,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerSettingsButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
  },

  mainHeroShell: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
    overflow: "hidden",
    position: "relative",
  },
  mainHeroGlowA: {
    position: "absolute",
    top: -30,
    left: -22,
    width: 170,
    height: 150,
    borderRadius: 50,
    backgroundColor: "rgba(61,121,255,0.16)",
  },
  mainHeroGlowB: {
    position: "absolute",
    right: -34,
    bottom: -36,
    width: 210,
    height: 170,
    borderRadius: 60,
    backgroundColor: "rgba(124,68,242,0.12)",
  },
  mainHeroShine: {
    position: "absolute",
    top: -55,
    right: 42,
    width: 96,
    height: 300,
    backgroundColor: "rgba(255,255,255,0.06)",
    transform: [{ rotate: "22deg" }],
  },
  mainHeroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  mainHeroIconWrap: {
    width: 52,
    height: 52,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mainHeroTextWrap: {
    flex: 1,
  },
  mainHeroTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
  },
  mainHeroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  mainHeroStatsGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  mainHeroStatCard: {
    flex: 1,
    minHeight: 96,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    justifyContent: "space-between",
  },
  mainHeroStatLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  mainHeroStatValue: {
    fontSize: 23,
    fontWeight: "900",
    lineHeight: 28,
  },
  mainHeroStatHint: {
    color: "#BFD5FF",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },
  mainHeroPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  mainHeroActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  mainHeroPrimaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: "#2F6BFF",
    borderWidth: 1,
    borderColor: "#4F88FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mainHeroPrimaryButtonText: {
    color: "#EAF1FF",
    fontSize: 15,
    fontWeight: "900",
  },
  mainHeroSecondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: "#0E1D33",
    borderWidth: 1,
    borderColor: "rgba(95,142,255,0.24)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mainHeroSecondaryButtonText: {
    color: "#DCE7FF",
    fontSize: 15,
    fontWeight: "800",
  },
  loadingStateText: {
    marginTop: 12,
    color: "#DCE7FF",
    fontSize: 12,
    fontWeight: "700",
  },

  pill: {
    minHeight: 34,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "800",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: "700",
  },

  quickActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  quickAction: {
    minWidth: 84,
    minHeight: 74,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  quickActionIcon: {
    minHeight: 22,
    justifyContent: "center",
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },

  heroGrid: {
    gap: 14,
    marginBottom: 18,
  },
  heroWrap: {
    width: "100%",
  },
  heroCard: {
    minHeight: 212,
    borderWidth: 1,
    padding: 18,
    overflow: "hidden",
    position: "relative",
  },
  heroGlowA: {
    position: "absolute",
    top: -14,
    left: -16,
    width: 190,
    height: 135,
    borderRadius: 44,
    opacity: 0.95,
  },
  heroGlowB: {
    position: "absolute",
    right: -24,
    bottom: -30,
    width: 220,
    height: 150,
    borderRadius: 60,
    opacity: 0.95,
  },
  heroShine: {
    position: "absolute",
    top: -50,
    right: 44,
    width: 92,
    height: 280,
    backgroundColor: "rgba(255,255,255,0.07)",
    transform: [{ rotate: "22deg" }],
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroArrowWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroEyebrow: {
    marginTop: 18,
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    zIndex: 2,
  },
  heroTitle: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 29,
    zIndex: 2,
    maxWidth: 260,
  },
  heroSubtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.84)",
    fontSize: 13,
    lineHeight: 18,
    zIndex: 2,
    maxWidth: 290,
  },
  heroBalanceBlock: {
    marginTop: 16,
    zIndex: 2,
  },
  heroBalanceLabel: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroBalance: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },
  heroPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
    zIndex: 2,
  },
  heroInlinePill: {
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroInlinePillText: {
    color: "#F2F6FF",
    fontSize: 11,
    fontWeight: "800",
  },

  aiCard: {
    borderWidth: 1,
    minHeight: 230,
    padding: 18,
    marginBottom: 18,
    overflow: "hidden",
    position: "relative",
  },
  aiGlowA: {
    position: "absolute",
    top: -24,
    left: -18,
    width: 180,
    height: 138,
    borderRadius: 46,
    backgroundColor: "rgba(124,68,242,0.18)",
  },
  aiGlowB: {
    position: "absolute",
    right: -28,
    bottom: -26,
    width: 210,
    height: 150,
    borderRadius: 60,
    backgroundColor: "rgba(72,120,255,0.14)",
  },
  aiShine: {
    position: "absolute",
    top: -48,
    right: 36,
    width: 92,
    height: 260,
    backgroundColor: "rgba(255,255,255,0.06)",
    transform: [{ rotate: "22deg" }],
  },
  aiTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2,
  },
  aiIconWrap: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  aiArrowWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  aiEyebrow: {
    marginTop: 18,
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    zIndex: 2,
  },
  aiTitle: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 29,
    zIndex: 2,
  },
  aiSubtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.84)",
    fontSize: 13,
    lineHeight: 18,
    zIndex: 2,
    maxWidth: 300,
  },
  aiPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
    zIndex: 2,
  },
  aiInlinePill: {
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  aiInlinePillText: {
    color: "#F2F6FF",
    fontSize: 11,
    fontWeight: "800",
  },
  aiMiniGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    zIndex: 2,
  },
  aiMiniCard: {
    flex: 1,
    minHeight: 84,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  aiMiniCardTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 10,
    marginBottom: 4,
  },
  aiMiniCardText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    lineHeight: 16,
  },

  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },
  actionCard: {
    width: "48%",
    minHeight: 132,
    borderWidth: 1,
    padding: 14,
  },
  actionTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  actionIconWrap: {
    width: 24,
    alignItems: "center",
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 6,
  },
  actionSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },

  infoCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  infoIcon: {
    width: 20,
    alignItems: "center",
    paddingTop: 2,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
});



