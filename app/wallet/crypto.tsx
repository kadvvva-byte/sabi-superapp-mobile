import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppContainer from "../../components/AppContainer";
import { useSabiTheme } from "../../src/theme/ThemeProvider";
import { useI18n } from "../../src/shared/i18n";
import { walletText } from "../../src/shared/wallet/wallet-i18n";
import WalletProviderStatusPanel from "../../src/modules/wallet/components/WalletProviderStatusPanel";
import PlayReadyFinancialFeatureDisclosurePanel from "../../src/modules/play-ready/mobile/PlayReadyFinancialFeatureDisclosurePanel";
import {
  formatPrimaryWalletAmount,
  useWalletFoundation,
} from "../../src/shared/wallet/wallet-foundation";
import {
  formatCryptoWalletProviderStatusLabel,
  getCryptoWalletProviderReadiness,
} from "../../src/shared/wallet/wallet-crypto-provider";

type ThemeColors = {
  card: string;
  cardSoft: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  success: string;
  danger: string;
};

type ThemeRadius = {
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

type ActionCardProps = {
  title: string;
  subtitle: string;
  onPress: () => void;
  colors: ThemeColors;
  radius: ThemeRadius;
  accent?: boolean;
};

function ActionCard({
  title,
  subtitle,
  onPress,
  colors,
  radius,
  accent = false,
}: ActionCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.actionCard,
        {
          backgroundColor: accent ? colors.accent : colors.card,
          borderColor: accent ? colors.accent : colors.border,
          borderRadius: radius.xl,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <Text
        style={[
          styles.actionTitle,
          { color: accent ? "#08111F" : colors.text },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.actionSubtitle,
          { color: accent ? "#08111F" : colors.textSecondary },
        ]}
      >
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

export default function CryptoWalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useSabiTheme();
  const { t } = useI18n();
  const { snapshot } = useWalletFoundation();
  const { colors, radius } = theme;

  const cryptoReadiness = useMemo(
    () => getCryptoWalletProviderReadiness(snapshot, "portfolio"),
    [snapshot],
  );
  const cryptoStatusLabel = formatCryptoWalletProviderStatusLabel(cryptoReadiness.reason);

  const texts = useMemo(
    () => ({
      eyebrow: walletText(t, "wallet.cryptoIndex.eyebrow", "SABI CRYPTO"),
      title: walletText(t, "wallet.cryptoIndex.title", "Crypto Wallet"),
      subtitle: walletText(
        t,
        "wallet.cryptoIndex.subtitle",
        "Separate crypto access with provider-based assets, network routing and wallet risk checks.",
      ),
      totalBalance: walletText(t, "wallet.cryptoIndex.totalBalance", "Total crypto value"),
      providerRequired: walletText(t, "wallet.cryptoIndex.providerRequired", "Provider required"),
      providerNotConfigured: walletText(
        t,
        "wallet.cryptoIndex.providerNotConfigured",
        "Provider not configured",
      ),
      assetsCount: walletText(t, "wallet.cryptoIndex.assetsCount", "0 assets"),
      networks: walletText(t, "wallet.cryptoIndex.networks", "Networks"),
      change24h: walletText(t, "wallet.cryptoIndex.change24h", "24h"),
      status: walletText(t, "wallet.cryptoIndex.status", "Status"),
      quickActions: walletText(t, "wallet.cryptoIndex.quickActions", "Quick actions"),
      buy: walletText(t, "wallet.cryptoIndex.buy", "Buy"),
      buyText: walletText(t, "wallet.cryptoIndex.buyText", "Provider funding"),
      send: walletText(t, "wallet.cryptoIndex.send", "Send"),
      sendText: walletText(t, "wallet.cryptoIndex.sendText", "Transfer out"),
      receive: walletText(t, "wallet.cryptoIndex.receive", "Receive"),
      receiveText: walletText(t, "wallet.cryptoIndex.receiveText", "Wallet address"),
      swap: walletText(t, "wallet.cryptoIndex.swap", "Swap"),
      swapText: walletText(t, "wallet.cryptoIndex.swapText", "Exchange assets"),
      sell: walletText(t, "wallet.cryptoIndex.sell", "Sell"),
      sellText: walletText(t, "wallet.cryptoIndex.sellText", "Convert out"),
      history: walletText(t, "wallet.cryptoIndex.history", "History"),
      historyText: walletText(t, "wallet.cryptoIndex.historyText", "Confirmed activity"),
      portfolio: walletText(t, "wallet.cryptoIndex.portfolio", "Portfolio"),
      custody: walletText(t, "wallet.cryptoIndex.custody", "Custody route"),
      custodyText: walletText(
        t,
        "wallet.cryptoIndex.custodyText",
        "Crypto balances must come from a connected provider or wallet backend.",
      ),
      pricing: walletText(t, "wallet.cryptoIndex.pricing", "Market pricing"),
      pricingText: walletText(
        t,
        "wallet.cryptoIndex.pricingText",
        "USD value is shown only after provider price feed is connected.",
      ),
      risk: walletText(t, "wallet.cryptoIndex.risk", "Risk checks"),
      riskText: walletText(
        t,
        "wallet.cryptoIndex.riskText",
        "Send, sell and swap require wallet risk checks and explicit confirmation.",
      ),
      assets: walletText(t, "wallet.cryptoIndex.assets", "Assets"),
      noAssetsTitle: walletText(t, "wallet.cryptoIndex.noAssetsTitle", "No crypto assets yet"),
      noAssetsText: walletText(
        t,
        "wallet.cryptoIndex.noAssetsText",
        "Assets will appear only after a real crypto provider or wallet backend returns verified balances.",
      ),
      networksTokens: walletText(t, "wallet.cryptoIndex.networksTokens", "Networks and tokens"),
      networksText: walletText(
        t,
        "wallet.cryptoIndex.networksText",
        "Network list must come from provider configuration.",
      ),
      tokensText: walletText(
        t,
        "wallet.cryptoIndex.tokensText",
        "Visible token list must be provider-backed.",
      ),
      cryptoFoundation: walletText(t, "wallet.cryptoIndex.cryptoFoundation", "Crypto foundation"),
      cryptoFoundationText: walletText(
        t,
        "wallet.cryptoIndex.cryptoFoundationText",
        "Crypto stays separate from Sabi Wallet, Coin Wallet and card rails, with values supplied by a connected provider.",
      ),
      backToWalletHome: walletText(t, "wallet.cryptoIndex.backToWalletHome", "Back to Wallet Home"),
      openAssets: walletText(t, "wallet.cryptoIndex.openAssets", "Open assets"),
    }),
    [t],
  );

  return (
    <AppContainer>
      <View style={[styles.fixedTopBar, { paddingTop: Math.max(insets.top, 10) }]}> 
        <TouchableOpacity
          style={[
            styles.fixedBackButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.lg,
            },
          ]}
          onPress={() => router.back()}
          activeOpacity={0.88}
        >
          <ArrowLeft size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>{texts.eyebrow}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{texts.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{texts.subtitle}</Text>
        </View>

        <WalletProviderStatusPanel scope="crypto" compact />

        <PlayReadyFinancialFeatureDisclosurePanel
          compact
          contextLabel="Tokenized Digital Asset disclosure evidence"
        />

        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>{texts.totalBalance}</Text>
              <Text style={[styles.heroValue, { color: colors.text }]}>
                {cryptoReadiness.canReadProviderBalances
                  ? formatPrimaryWalletAmount(snapshot.cryptoBalanceUsd, snapshot.primaryCurrencyCode)
                  : texts.providerNotConfigured}
              </Text>
            </View>

            <View
              style={[
                styles.heroBadge,
                {
                  backgroundColor: colors.cardSoft,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                },
              ]}
            >
              <Text style={[styles.heroBadgeText, { color: colors.text }]}>{texts.assetsCount}</Text>
            </View>
          </View>

          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaItem}>
              <Text style={[styles.heroMetaTitle, { color: colors.textSecondary }]}>{texts.networks}</Text>
              <Text style={[styles.heroMetaValue, { color: colors.text }]}>{texts.providerRequired}</Text>
            </View>

            <View style={[styles.heroDivider, { backgroundColor: colors.border }]} />

            <View style={styles.heroMetaItem}>
              <Text style={[styles.heroMetaTitle, { color: colors.textSecondary }]}>{texts.change24h}</Text>
              <Text style={[styles.heroMetaValue, { color: colors.textSecondary }]}>—</Text>
            </View>

            <View style={[styles.heroDivider, { backgroundColor: colors.border }]} />

            <View style={styles.heroMetaItem}>
              <Text style={[styles.heroMetaTitle, { color: colors.textSecondary }]}>{texts.status}</Text>
              <Text style={[styles.heroMetaValue, { color: colors.danger }]}>{cryptoStatusLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{texts.quickActions}</Text>

          <View style={styles.actionsGrid}>
            <ActionCard
              title={texts.buy}
              subtitle={texts.buyText}
              onPress={() => router.push("/wallet/crypto/buy")}
              colors={colors}
              radius={radius}
              accent
            />
            <ActionCard title={texts.send} subtitle={texts.sendText} onPress={() => router.push("/wallet/crypto/send")} colors={colors} radius={radius} />
            <ActionCard title={texts.receive} subtitle={texts.receiveText} onPress={() => router.push("/wallet/crypto/receive")} colors={colors} radius={radius} />
            <ActionCard title={texts.swap} subtitle={texts.swapText} onPress={() => router.push("/wallet/crypto/swap")} colors={colors} radius={radius} />
            <ActionCard title={texts.sell} subtitle={texts.sellText} onPress={() => router.push("/wallet/crypto/sell")} colors={colors} radius={radius} />
            <ActionCard title={texts.history} subtitle={texts.historyText} onPress={() => router.push("/wallet/crypto/history")} colors={colors} radius={radius} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{texts.portfolio}</Text>

          <View
            style={[
              styles.portfolioCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: radius.xl,
              },
            ]}
          >
            <View style={styles.portfolioRow}>
              <Text style={[styles.portfolioLabel, { color: colors.textSecondary }]}>{texts.custody}</Text>
              <Text style={[styles.portfolioValue, { color: colors.text }]}>{cryptoStatusLabel}</Text>
            </View>
            <Text style={[styles.infoText, { color: colors.textSecondary, marginTop: 10 }]}>{texts.custodyText}</Text>

            <View style={[styles.portfolioDivider, { backgroundColor: colors.border }]} />

            <View style={styles.portfolioRow}>
              <Text style={[styles.portfolioLabel, { color: colors.textSecondary }]}>{texts.pricing}</Text>
              <Text style={[styles.portfolioValue, { color: colors.textSecondary }]}>
                {cryptoReadiness.canReadMarketData ? "—" : texts.providerNotConfigured}
              </Text>
            </View>
            <Text style={[styles.infoText, { color: colors.textSecondary, marginTop: 10 }]}>{texts.pricingText}</Text>

            <View style={[styles.portfolioDivider, { backgroundColor: colors.border }]} />

            <View style={styles.portfolioRow}>
              <Text style={[styles.portfolioLabel, { color: colors.textSecondary }]}>{texts.risk}</Text>
              <Text style={[styles.portfolioValue, { color: colors.text }]}>{cryptoStatusLabel}</Text>
            </View>
            <Text style={[styles.infoText, { color: colors.textSecondary, marginTop: 10 }]}>{texts.riskText}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitleNoMargin, { color: colors.text }]}>{texts.assets}</Text>
            <TouchableOpacity onPress={() => router.push("/wallet/crypto/assets")} activeOpacity={0.88}>
              <Text style={[styles.sectionLink, { color: colors.accent }]}>{texts.openAssets}</Text>
            </TouchableOpacity>
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
            <Text style={[styles.infoTitle, { color: colors.text }]}>{texts.noAssetsTitle}</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{texts.noAssetsText}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{texts.networksTokens}</Text>
          <View style={styles.networkRow}>
            <TouchableOpacity
              style={[
                styles.networkCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                },
              ]}
              onPress={() => router.push("/wallet/crypto/networks")}
              activeOpacity={0.88}
            >
              <Text style={[styles.networkTitle, { color: colors.text }]}>{texts.networks}</Text>
              <Text style={[styles.networkSubtitle, { color: colors.textSecondary }]}>{texts.networksText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.networkCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                },
              ]}
              onPress={() => router.push("/wallet/crypto/manage-tokens")}
              activeOpacity={0.88}
            >
              <Text style={[styles.networkTitle, { color: colors.text }]}>{texts.assets}</Text>
              <Text style={[styles.networkSubtitle, { color: colors.textSecondary }]}>{texts.tokensText}</Text>
            </TouchableOpacity>
          </View>
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
          <Text style={[styles.infoTitle, { color: colors.text }]}>{texts.cryptoFoundation}</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>{texts.cryptoFoundationText}</Text>
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
            onPress={() => router.replace("/wallet/home")}
            activeOpacity={0.88}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{texts.backToWalletHome}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.accent,
                borderRadius: radius.lg,
              },
            ]}
            onPress={() => router.push("/wallet/crypto/assets")}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryButtonText}>{texts.openAssets}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },

  fixedTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    elevation: 40,
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: "rgba(6,15,25,0.88)",
  },

  fixedBackButton: {
    width: 46,
    height: 46,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 96,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 20,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 8,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 340,
  },

  heroCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  heroLabel: {
    fontSize: 13,
    marginBottom: 6,
  },

  heroValue: {
    fontSize: 30,
    fontWeight: "800",
  },

  heroBadge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  heroBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  heroMetaItem: {
    flex: 1,
  },

  heroMetaTitle: {
    fontSize: 12,
    marginBottom: 4,
  },

  heroMetaValue: {
    fontSize: 14,
    fontWeight: "700",
  },

  heroDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 12,
  },

  section: {
    marginBottom: 24,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
  },

  sectionTitleNoMargin: {
    fontSize: 20,
    fontWeight: "800",
  },

  sectionLink: {
    fontSize: 14,
    fontWeight: "700",
  },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },

  actionCard: {
    width: "31%",
    minWidth: 96,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    justifyContent: "center",
    marginHorizontal: "1.16%",
    marginBottom: 10,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 5,
  },

  actionSubtitle: {
    fontSize: 11,
    lineHeight: 16,
  },

  portfolioCard: {
    borderWidth: 1,
    padding: 18,
  },

  portfolioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  portfolioLabel: {
    fontSize: 13,
    fontWeight: "600",
  },

  portfolioValue: {
    fontSize: 14,
    fontWeight: "700",
  },

  portfolioDivider: {
    height: 1,
    marginVertical: 12,
  },

  assetsList: {
    gap: 10,
  },

  assetRow: {
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  assetIcon: {
    width: 46,
    height: 46,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  assetIconText: {
    fontSize: 16,
    fontWeight: "800",
  },

  assetInfo: {
    flex: 1,
  },

  assetSymbol: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },

  assetName: {
    fontSize: 13,
  },

  assetValues: {
    alignItems: "flex-end",
  },

  assetAmount: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },

  assetFiat: {
    fontSize: 13,
  },

  networkRow: {
    flexDirection: "row",
    gap: 12,
  },

  networkCard: {
    flex: 1,
    borderWidth: 1,
    padding: 18,
  },

  networkTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },

  networkSubtitle: {
    fontSize: 13,
    lineHeight: 19,
  },

  infoCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 24,
  },

  infoTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
  },

  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },

  bottomActions: {
    flexDirection: "row",
    gap: 12,
  },

  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    alignItems: "center",
    paddingVertical: 16,
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },

  primaryButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
  },

  primaryButtonText: {
    color: "#08111F",
    fontSize: 14,
    fontWeight: "800",
  },
});
