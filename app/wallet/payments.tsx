import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  AtSign,
  BadgePlus,
  BriefcaseBusiness,
  ChevronRight,
  CreditCard,
  MessageCircleMore,
  QrCode,
  ScanLine,
  ShieldCheck,
  Store,
  Users,
  Wallet,
} from "lucide-react-native";

import AppContainer from "../../components/AppContainer";
import { useSabiTheme } from "../../src/theme/ThemeProvider";
import { useI18n } from "../../src/shared/i18n";
import {
  formatPrimaryWalletAmount,
  useWalletFoundation,
} from "../../src/shared/wallet/wallet-foundation";

type HubAction = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  route: string;
};

type ThemeColors = {
  cardSoft: string;
  border: string;
  text: string;
  textSecondary: string;
};

function walletText(
  t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string,
  key: string,
  fallback: string,
) {
  const value = t(key);
  return typeof value === "string" && value.trim().length > 0 && value !== key
    ? value
    : fallback;
}

function SectionHeader({
  title,
  hint,
  colors,
}: {
  title: string;
  hint: string;
  colors: { text: string; textSecondary: string };
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>{hint}</Text>
    </View>
  );
}

function Badge({
  label,
  colors,
  radius,
}: {
  label: string;
  colors: ThemeColors;
  radius: number;
}) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.cardSoft,
          borderColor: colors.border,
          borderRadius: radius,
        },
      ]}
    >
      <Text style={[styles.badgeText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

function ActionCard({
  title,
  subtitle,
  icon,
  colors,
  radius,
  onPress,
}: {
  key?: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  colors: ThemeColors;
  radius: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        {
          backgroundColor: colors.cardSoft,
          borderColor: colors.border,
          borderRadius: radius,
          opacity: pressed ? 0.86 : 1,
        },
      ]}
    >
      <View style={styles.actionTopRow}>
        <View style={styles.actionIconWrap}>{icon}</View>
        <ChevronRight size={16} color={colors.textSecondary} />
      </View>

      <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}> {subtitle}</Text>
    </Pressable>
  );
}

function FeatureBanner({
  eyebrow,
  title,
  subtitle,
  valueLabel,
  value,
  icon,
  colorsSet,
  pills,
  onPress,
  radius,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  valueLabel: string;
  value: string;
  icon: React.ReactNode;
  colorsSet: [string, string, string];
  pills: string[];
  onPress: () => void;
  radius: { xl: number; lg: number };
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.featureBannerWrap, pressed && styles.pressed]}>
      <View
        style={[
          styles.featureBanner,
          {
            backgroundColor: colorsSet[1],
            borderColor: "rgba(101,146,255,0.16)",
            borderRadius: radius.xl,
          },
        ]}
      >
        <View style={[styles.featureGlowA, { backgroundColor: colorsSet[0] }]} />
        <View style={[styles.featureGlowB, { backgroundColor: colorsSet[2] }]} />
        <View style={styles.featureTopRow}>
          <View style={[styles.featureIconWrap, { borderRadius: radius.lg }]}>{icon}</View>
          <View style={styles.featureArrowWrap}>
            <ChevronRight size={18} color="#EAF1FF" />
          </View>
        </View>

        <Text style={styles.featureEyebrow}>{eyebrow}</Text>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>

        <View style={styles.featureBalanceBlock}>
          <Text style={styles.featureBalanceLabel}>{valueLabel}</Text>
          <Text style={styles.featureBalance}>{value}</Text>
        </View>

        <View style={styles.featurePillsRow}>
          {pills.map((pill) => (
            <View key={pill} style={styles.featurePill}>
              <Text style={styles.featurePillText}>{pill}</Text>
            </View>
          ))}
        </View>
      </View>
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

function openMySabiQr() {
  router.push({
    pathname: "/wallet/qr-create",
    params: {
      variant: "user",
      label: "My Sabi Wallet",
      reference: "sabi-wallet",
    },
  });
}

export default function WalletPaymentsScreen() {
  const { colors, radius } = useSabiTheme();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { snapshot } = useWalletFoundation();

  const tr = (key: string, fallback: string) => walletText(t, key, fallback);
  const primaryBalance = formatPrimaryWalletAmount(
    snapshot.mainBalanceUsd,
    snapshot.primaryCurrencyCode,
  );

  const providerStatus = tr("wallet.paymentsHub.providerNotConfigured", "Provider not configured");

  const internalActions = useMemo<HubAction[]>(
    () => [
      {
        id: "my-sabi-id",
        title: tr("wallet.paymentsHub.mySabiId", "MySabi ID"),
        subtitle: tr("wallet.paymentsHub.mySabiIdSubtitle", "Manage internal wallet identity and payment sharing."),
        icon: <AtSign size={20} color={colors.text} />,
        route: "/wallet/my-sabi-id",
      },
      {
        id: "send",
        title: tr("wallet.paymentsHub.send", "Send money"),
        subtitle: tr("wallet.paymentsHub.sendSubtitle", "Send by Sabi Wallet, card route or internal wallet route."),
        icon: <ArrowUpRight size={20} color={colors.text} />,
        route: "/wallet/send",
      },
      {
        id: "request-money",
        title: tr("wallet.paymentsHub.request", "Request money"),
        subtitle: tr("wallet.paymentsHub.requestSubtitle", "Create a verified payment request."),
        icon: <ArrowDownLeft size={20} color={colors.text} />,
        route: "/wallet/request-money",
      },
      {
        id: "contacts",
        title: tr("wallet.paymentsHub.contacts", "Wallet contacts"),
        subtitle: tr("wallet.paymentsHub.contactsSubtitle", "Saved recipients must come from verified wallet contacts."),
        icon: <Users size={20} color={colors.text} />,
        route: "/wallet/contacts",
      },
    ],
    [colors.text, t, snapshot.primaryCurrencyCode],
  );

  const cardActions = useMemo<HubAction[]>(
    () => [
      {
        id: "topup",
        title: tr("wallet.paymentsHub.topup", "Top up from card"),
        subtitle: tr("wallet.paymentsHub.topupSubtitle", "Add money through a tokenized provider card route."),
        icon: <ArrowDownLeft size={20} color={colors.text} />,
        route: "/wallet/topup",
      },
      {
        id: "withdraw",
        title: tr("wallet.paymentsHub.withdraw", "Withdraw to card"),
        subtitle: tr("wallet.paymentsHub.withdrawSubtitle", "Move Sabi Balance back to a provider-tokenized card."),
        icon: <ArrowUpRight size={20} color={colors.text} />,
        route: "/wallet/withdraw",
      },
      {
        id: "cards",
        title: tr("wallet.paymentsHub.cards", "Cards"),
        subtitle: tr("wallet.paymentsHub.cardsSubtitle", "Manage local, international and virtual tokenized cards."),
        icon: <CreditCard size={20} color={colors.text} />,
        route: "/wallet/cards",
      },
      {
        id: "virtualCard",
        title: tr("wallet.paymentsHub.virtualCard", "Virtual card"),
        subtitle: tr("wallet.paymentsHub.virtualCardSubtitle", "Issue only through a real bank or issuer provider."),
        icon: <BadgePlus size={20} color={colors.text} />,
        route: "/wallet/virtual-card",
      },
    ],
    [colors.text, t, snapshot.primaryCurrencyCode],
  );

  const ecosystemActions = useMemo<HubAction[]>(
    () => [
      {
        id: "chat-payments",
        title: tr("wallet.paymentsHub.chatPayments", "Chat payments"),
        subtitle: tr("wallet.paymentsHub.chatPaymentsSubtitle", "Messenger payment routes with explicit confirmation."),
        icon: <MessageCircleMore size={20} color={colors.text} />,
        route: "/wallet/chat-payments",
      },
      {
        id: "merchant-pay",
        title: tr("wallet.paymentsHub.merchantPay", "Merchant Pay"),
        subtitle: tr("wallet.paymentsHub.merchantPaySubtitle", "Provider-backed merchant checkout and settlement routing."),
        icon: <Store size={20} color={colors.text} />,
        route: "/wallet/merchant-pay",
      },
      {
        id: "business-pay",
        title: tr("wallet.paymentsHub.businessPay", "Business routing"),
        subtitle: tr("wallet.paymentsHub.businessPaySubtitle", "Business Wallet route prepared for KYB/admin control."),
        icon: <BriefcaseBusiness size={20} color={colors.text} />,
        route: "/wallet/business-pay",
      },
    ],
    [colors.text, t, snapshot.primaryCurrencyCode],
  );

  return (
    <AppContainer>
      <View style={[styles.screen, { backgroundColor: "#060F19" }]}> 
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.fixedBackButton,
            {
              top: Math.max(insets.top + 10, 18),
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.lg,
            },
          ]}
        >
          <ArrowLeft size={18} color={colors.text} />
        </Pressable>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top + 76, 92) }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerTextWrap}>
            <Text style={[styles.eyebrow, { color: colors.accent }]}>{tr("wallet.paymentsHub.eyebrow", "SABI WALLET PAY")}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{tr("wallet.paymentsHub.title", "Payments Hub")}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{tr("wallet.paymentsHub.subtitle", "Unified payment center for Sabi Wallet, cards, QR, merchant routing and Messenger payments.")}</Text>
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
                <Text style={[styles.mainHeroTitle, { color: colors.text }]}>{tr("wallet.paymentsHub.heroTitle", "Payment infrastructure")}</Text>
                <Text style={[styles.mainHeroSubtitle, { color: colors.textSecondary }]}>{tr("wallet.paymentsHub.heroSubtitle", "Real payment routes must come from wallet foundation, bank providers, QR/Pay and compliance gates.")}</Text>
              </View>
            </View>

            <View style={styles.mainHeroStatsGrid}>
              <View style={styles.mainHeroStatCard}>
                <Text style={[styles.mainHeroStatLabel, { color: colors.textSecondary }]}>{tr("wallet.paymentsHub.mainBalance", "Main balance")}</Text>
                <Text style={[styles.mainHeroStatValue, { color: colors.text }]}>{primaryBalance}</Text>
                <Text style={styles.mainHeroStatHint}>{tr("wallet.paymentsHub.primaryCurrency", "Primary currency")}</Text>
              </View>

              <View style={styles.mainHeroStatCard}>
                <Text style={[styles.mainHeroStatLabel, { color: colors.textSecondary }]}>{tr("wallet.paymentsHub.providerRoutes", "Provider routes")}</Text>
                <Text style={[styles.mainHeroStatValue, { color: colors.text }]}>0</Text>
                <Text style={styles.mainHeroStatHint}>{providerStatus}</Text>
              </View>
            </View>

            <View style={styles.mainHeroPills}>
              <Badge label={tr("wallet.paymentsHub.pillSabi", "Sabi Wallet")} colors={colors} radius={radius.lg} />
              <Badge label={tr("wallet.paymentsHub.pillCards", "Cards")} colors={colors} radius={radius.lg} />
              <Badge label="QR" colors={colors} radius={radius.lg} />
              <Badge label={tr("wallet.paymentsHub.pillMerchant", "Merchant")} colors={colors} radius={radius.lg} />
            </View>

            <View style={styles.mainHeroActionRow}>
              <Pressable onPress={() => router.push("/wallet/send" as never)} style={styles.mainHeroPrimaryButton}>
                <ArrowUpRight size={18} color="#EAF1FF" />
                <Text style={styles.mainHeroPrimaryButtonText}>{tr("wallet.paymentsHub.send", "Send money")}</Text>
              </Pressable>

              <Pressable onPress={() => router.push("/wallet/request-money" as never)} style={styles.mainHeroSecondaryButton}>
                <ArrowDownLeft size={18} color="#DCE7FF" />
                <Text style={styles.mainHeroSecondaryButtonText}>{tr("wallet.paymentsHub.request", "Request money")}</Text>
              </Pressable>
            </View>
          </View>

          <SectionHeader title={tr("wallet.paymentsHub.featuredTitle", "Featured payment flows")} hint={tr("wallet.paymentsHub.featuredHint", "Core routes")} colors={colors} />
          <View style={styles.bannerStack}>
            <FeatureBanner
              eyebrow={tr("wallet.paymentsHub.internalEyebrow", "INTERNAL PAYMENTS")}
              title={tr("wallet.paymentsHub.internalTitle", "MySabi ID and transfers")}
              subtitle={tr("wallet.paymentsHub.internalSubtitle", "Internal send, request, contacts and identity-based wallet routing.")}
              valueLabel={tr("wallet.paymentsHub.availableBalance", "Available balance")}
              value={primaryBalance}
              icon={<AtSign size={22} color="#EAF1FF" />}
              colorsSet={["#2E6BFF", "#173C9A", "#0A1632"]}
              pills={[tr("wallet.paymentsHub.mySabiId", "MySabi ID"), tr("wallet.paymentsHub.pillInternal", "Internal"), tr("wallet.paymentsHub.pillIdentity", "Identity")]}
              radius={radius}
              onPress={() => router.push("/wallet/my-sabi-id" as never)}
            />

            <FeatureBanner
              eyebrow={tr("wallet.paymentsHub.cardEyebrow", "CARDS AND MOVEMENT")}
              title={tr("wallet.paymentsHub.cardTitle", "Cards, top up and withdraw")}
              subtitle={tr("wallet.paymentsHub.cardSubtitle", "Money movement between Sabi Wallet and cards must use provider tokens only.")}
              valueLabel={tr("wallet.paymentsHub.cardProvider", "Card provider")}
              value={providerStatus}
              icon={<CreditCard size={22} color="#EAF1FF" />}
              colorsSet={["#0F5D97", "#0D3663", "#07182E"]}
              pills={[tr("wallet.paymentsHub.cards", "Cards"), tr("wallet.paymentsHub.topup", "Top up"), tr("wallet.paymentsHub.withdraw", "Withdraw")]}
              radius={radius}
              onPress={() => router.push("/wallet/cards" as never)}
            />

            <FeatureBanner
              eyebrow={tr("wallet.paymentsHub.ecosystemEyebrow", "MERCHANT AND CHAT")}
              title={tr("wallet.paymentsHub.ecosystemTitle", "Business, merchant and Messenger")}
              subtitle={tr("wallet.paymentsHub.ecosystemSubtitle", "Merchant, business and chat payments stay separated from personal balance until provider routes are connected.")}
              valueLabel={tr("wallet.paymentsHub.ecosystemProvider", "Ecosystem provider")}
              value={providerStatus}
              icon={<MessageCircleMore size={22} color="#EAF1FF" />}
              colorsSet={["#7C44F2", "#4A239B", "#140A2D"]}
              pills={[tr("wallet.paymentsHub.merchantPay", "Merchant Pay"), tr("wallet.paymentsHub.businessPay", "Business"), tr("wallet.paymentsHub.chatPayments", "Chat payments")]}
              radius={radius}
              onPress={() => router.push("/wallet/chat-payments" as never)}
            />
          </View>

          <SectionHeader title={tr("wallet.paymentsHub.qrAccess", "QR access")} hint={tr("wallet.paymentsHub.singleEntry", "Single entry")} colors={colors} />
          <View style={styles.qrGrid}>
            <ActionCard
              title={tr("wallet.paymentsHub.myQr", "My Sabi QR")}
              subtitle={tr("wallet.paymentsHub.myQrSubtitle", "Generate receive QR for Sabi Wallet.")}
              icon={<QrCode size={20} color={colors.text} />}
              colors={colors}
              radius={radius.lg}
              onPress={openMySabiQr}
            />
            <ActionCard
              title={tr("wallet.paymentsHub.scanQr", "Scan QR")}
              subtitle={tr("wallet.paymentsHub.scanQrSubtitle", "Open scanner for user, merchant or dynamic QR flow.")}
              icon={<ScanLine size={20} color={colors.text} />}
              colors={colors}
              radius={radius.lg}
              onPress={() => router.push("/wallet/qr-camera" as never)}
            />
          </View>

          <SectionHeader title={tr("wallet.paymentsHub.internalPayments", "Internal payments")} hint={tr("wallet.paymentsHub.core", "Core")} colors={colors} />
          <View style={styles.grid}>
            {internalActions.map((item) => (
              <ActionCard key={item.id} title={item.title} subtitle={item.subtitle} icon={item.icon} colors={colors} radius={radius.lg} onPress={() => router.push(item.route as never)} />
            ))}
          </View>

          <SectionHeader title={tr("wallet.paymentsHub.cardsBalance", "Cards and balance")} hint={tr("wallet.paymentsHub.moneyMovement", "Money movement")} colors={colors} />
          <View style={styles.grid}>
            {cardActions.map((item) => (
              <ActionCard key={item.id} title={item.title} subtitle={item.subtitle} icon={item.icon} colors={colors} radius={radius.lg} onPress={() => router.push(item.route as never)} />
            ))}
          </View>

          <SectionHeader title={tr("wallet.paymentsHub.ecosystemPayments", "Ecosystem payments")} hint={tr("wallet.paymentsHub.extendedRoutes", "Extended routes")} colors={colors} />
          <View style={styles.grid}>
            {ecosystemActions.map((item) => (
              <ActionCard key={item.id} title={item.title} subtitle={item.subtitle} icon={item.icon} colors={colors} radius={radius.lg} onPress={() => router.push(item.route as never)} />
            ))}
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}> 
            <SectionHeader title={tr("wallet.paymentsHub.securityTitle", "Wallet-grade routing")}
              hint={tr("wallet.paymentsHub.securityHint", "Policy")} colors={colors} />

            <InfoRow icon={<AtSign size={18} color={colors.text} />} title={tr("wallet.paymentsHub.identityTitle", "Identity-based routing")} text={tr("wallet.paymentsHub.identityText", "MySabi ID connects personal, business and merchant payment discovery through verified identity.")} colors={colors} />
            <Divider color={colors.border} />
            <InfoRow icon={<CreditCard size={18} color={colors.text} />} title={tr("wallet.paymentsHub.tokenTitle", "Token-only card movement")} text={tr("wallet.paymentsHub.tokenText", "Card movement uses bank/provider tokens. Raw card data stays inside the bank/provider flow.")} colors={colors} />
            <Divider color={colors.border} />
            <InfoRow icon={<Store size={18} color={colors.text} />} title={tr("wallet.paymentsHub.separationTitle", "Merchant and business separation")} text={tr("wallet.paymentsHub.separationText", "Seller checkout and business payment routing stay separate from personal wallet balance.")} colors={colors} />
            <Divider color={colors.border} />
            <InfoRow icon={<ShieldCheck size={18} color={colors.text} />} title={tr("wallet.paymentsHub.noFakeTitle", "Secure provider execution")} text={tr("wallet.paymentsHub.noFakeText", "Balances and routes appear only after wallet foundation, provider or backend data is available.")} colors={colors} />
          </View>
        </ScrollView>
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 44,
    flexGrow: 1,
  },
  fixedBackButton: {
    position: "absolute",
    left: 20,
    width: 46,
    height: 46,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    elevation: 20,
  },
  headerTextWrap: {
    paddingLeft: 0,
    marginBottom: 22,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 8,
    textTransform: "uppercase",
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
  mainHeroTopRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
    marginBottom: 18,
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
    marginBottom: 6,
  },
  mainHeroSubtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  mainHeroStatsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  mainHeroStatCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  mainHeroStatLabel: {
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 8,
  },
  mainHeroStatValue: {
    fontSize: 20,
    fontWeight: "900",
  },
  mainHeroStatHint: {
    color: "rgba(234,241,255,0.66)",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },
  mainHeroPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    minHeight: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  mainHeroActionRow: {
    flexDirection: "row",
    gap: 10,
  },
  mainHeroPrimaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: "#2E6BFF",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  mainHeroPrimaryButtonText: {
    color: "#EAF1FF",
    fontSize: 13,
    fontWeight: "900",
  },
  mainHeroSecondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  mainHeroSecondaryButtonText: {
    color: "#DCE7FF",
    fontSize: 13,
    fontWeight: "900",
  },
  sectionHeader: {
    marginTop: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  bannerStack: {
    gap: 12,
    marginBottom: 18,
  },
  featureBannerWrap: {
    borderRadius: 24,
  },
  featureBanner: {
    minHeight: 210,
    padding: 18,
    overflow: "hidden",
    borderWidth: 1,
    position: "relative",
  },
  featureGlowA: {
    position: "absolute",
    top: -55,
    right: -34,
    width: 170,
    height: 170,
    borderRadius: 70,
    opacity: 0.42,
  },
  featureGlowB: {
    position: "absolute",
    bottom: -70,
    left: -56,
    width: 210,
    height: 180,
    borderRadius: 80,
    opacity: 0.68,
  },
  featureTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  featureIconWrap: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  featureArrowWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureEyebrow: {
    color: "rgba(234,241,255,0.72)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  featureTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900",
  },
  featureSubtitle: {
    color: "rgba(234,241,255,0.78)",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  featureBalanceBlock: {
    marginTop: 16,
  },
  featureBalanceLabel: {
    color: "rgba(234,241,255,0.62)",
    fontSize: 11,
    fontWeight: "800",
  },
  featureBalance: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 4,
  },
  featurePillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 14,
  },
  featurePill: {
    minHeight: 26,
    borderRadius: 13,
    paddingHorizontal: 9,
    backgroundColor: "rgba(255,255,255,0.11)",
    alignItems: "center",
    justifyContent: "center",
  },
  featurePillText: {
    color: "#EAF1FF",
    fontSize: 10,
    fontWeight: "800",
  },
  qrGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },
  actionCard: {
    width: "48%",
    minHeight: 140,
    borderWidth: 1,
    padding: 14,
  },
  actionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 6,
  },
  actionSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  infoCard: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  divider: {
    height: 1,
    opacity: 0.9,
  },
  pressed: {
    transform: [{ scale: 0.988 }],
  },
});
