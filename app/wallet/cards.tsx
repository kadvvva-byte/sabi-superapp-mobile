import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import WalletScreenShell from "../../src/modules/wallet/components/WalletScreenShell";
import WalletProviderStatusPanel from "../../src/modules/wallet/components/WalletProviderStatusPanel";
import { useI18n } from "../../src/shared/i18n";

type CardCategory = "local" | "international" | "local_global" | "virtual";

type CardCategoryItem = {
  id: CardCategory;
  icon: React.ReactNode;
  titleKey: string;
  subtitleKey: string;
  route: string;
};

function walletText(
  t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string,
  key: string,
  fallback: string,
) {
  const value = t(key);
  return value && value !== key ? value : fallback;
}

function useCardsTexts() {
  const { t } = useI18n();

  return useMemo(
    () => ({
      title: walletText(t, "wallet.cards.title", "Cards"),
      subtitle: walletText(
        t,
        "wallet.cards.subtitle",
        "Token-only card center for local, international, local + global and virtual cards.",
      ),
      localCard: walletText(t, "wallet.cards.localCard", "Local Card"),
      localCardText: walletText(
        t,
        "wallet.cards.localCardText",
        "Domestic card route. Card type must be detected after secure provider binding.",
      ),
      internationalCard: walletText(t, "wallet.cards.internationalCard", "International Card"),
      internationalCardText: walletText(
        t,
        "wallet.cards.internationalCardText",
        "Global route for cross-border and online payments through provider tokens.",
      ),
      localGlobalCard: walletText(t, "wallet.cards.localGlobalCard", "Local + Global"),
      localGlobalCardText: walletText(
        t,
        "wallet.cards.localGlobalCardText",
        "Hybrid card route detected by bank or payment provider after binding.",
      ),
      virtualCard: walletText(t, "wallet.cards.virtualCard", "Virtual Card"),
      virtualCardText: walletText(
        t,
        "wallet.cards.virtualCardText",
        "Online secure card issued by a bank or issuer provider.",
      ),
      categoriesTitle: walletText(t, "wallet.cards.categoriesTitle", "Card categories"),
      categoriesHint: walletText(t, "wallet.cards.categoriesHint", "Normalized card types"),
      selectedRoute: walletText(t, "wallet.cards.selectedRoute", "Selected route"),
      noCardsTitle: walletText(t, "wallet.cards.noCardsTitle", "No tokenized cards yet"),
      noCardsText: walletText(
        t,
        "wallet.cards.noCardsText",
        "Cards will appear only after a bank or provider SDK returns a verified card token. Raw card data stays inside the bank/provider flow.",
      ),
      addCard: walletText(t, "wallet.cards.addCard", "Add card"),
      issueVirtual: walletText(t, "wallet.cards.issueVirtual", "Issue virtual card"),
      providerStatus: walletText(t, "wallet.cards.providerStatus", "Provider status"),
      providerNotConfigured: walletText(t, "wallet.cards.providerNotConfigured", "Provider not configured"),
      providerNotConfiguredText: walletText(
        t,
        "wallet.cards.providerNotConfiguredText",
        "Connect a bank or card issuer provider before live card binding and virtual card issuing.",
      ),
      securityTitle: walletText(t, "wallet.cards.securityTitle", "Bank-grade card rules"),
      securityHint: walletText(t, "wallet.cards.securityHint", "Required foundation"),
      ruleTokenTitle: walletText(t, "wallet.cards.ruleTokenTitle", "Token-only storage"),
      ruleTokenText: walletText(
        t,
        "wallet.cards.ruleTokenText",
        "Sabi receives provider token ID, masked metadata and status only. Raw card data stays inside the bank/provider flow.",
      ),
      ruleDetectionTitle: walletText(t, "wallet.cards.ruleDetectionTitle", "Auto detection"),
      ruleDetectionText: walletText(
        t,
        "wallet.cards.ruleDetectionText",
        "UI must show only normalized categories after binding: Local Card, International Card, Local + Global or Virtual Card.",
      ),
      ruleConfirmationTitle: walletText(t, "wallet.cards.ruleConfirmationTitle", "Secure confirmation"),
      ruleConfirmationText: walletText(
        t,
        "wallet.cards.ruleConfirmationText",
        "Money movement must continue through provider confirmation, PIN or device biometric plus wallet risk checks.",
      ),
      settingsTitle: walletText(t, "wallet.cards.settingsTitle", "Next setup"),
      settingsHint: walletText(t, "wallet.cards.settingsHint", "Provider and currency"),
      settingsText: walletText(
        t,
        "wallet.cards.settingsText",
        "Next wallet steps must add primary currency, local currency, provider selection, limits and admin provider controls.",
      ),
      open: walletText(t, "wallet.cards.open", "Open"),
    }),
    [t],
  );
}

export default function WalletCardsScreen() {
  const insets = useSafeAreaInsets();
  const texts = useCardsTexts();
  const [selectedCategory, setSelectedCategory] = useState<CardCategory>("local");

  const categories = useMemo<CardCategoryItem[]>(
    () => [
      {
        id: "local",
        icon: <MaterialCommunityIcons name="bank-outline" size={20} color="#FFFFFF" />,
        titleKey: texts.localCard,
        subtitleKey: texts.localCardText,
        route: "/wallet/cards/add",
      },
      {
        id: "international",
        icon: <Ionicons name="globe-outline" size={20} color="#FFFFFF" />,
        titleKey: texts.internationalCard,
        subtitleKey: texts.internationalCardText,
        route: "/wallet/cards/add",
      },
      {
        id: "local_global",
        icon: <MaterialCommunityIcons name="credit-card-sync-outline" size={20} color="#FFFFFF" />,
        titleKey: texts.localGlobalCard,
        subtitleKey: texts.localGlobalCardText,
        route: "/wallet/cards/add",
      },
      {
        id: "virtual",
        icon: <MaterialCommunityIcons name="credit-card-wireless-outline" size={20} color="#FFFFFF" />,
        titleKey: texts.virtualCard,
        subtitleKey: texts.virtualCardText,
        route: "/wallet/virtual-card",
      },
    ],
    [texts],
  );

  const selected = categories.find((item) => item.id === selectedCategory) ?? categories[0];
  const headerTop = Math.max(insets.top, 10);

  return (
    <WalletScreenShell>
      <View style={[styles.fixedHeader, { paddingTop: headerTop }]}> 
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{texts.title}</Text>
          <Text style={styles.headerSubtitle}>{texts.subtitle}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <WalletProviderStatusPanel scope="cards" compact />

        <SectionRow title={texts.categoriesTitle} hint={texts.categoriesHint} />

        <View style={styles.categoryGrid}>
          {categories.map((item) => {
            const active = item.id === selectedCategory;

            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedCategory(item.id)}
                style={[styles.categoryCard, active && styles.categoryCardActive]}
              >
                <View style={styles.categoryIcon}>{item.icon}</View>
                <Text style={styles.categoryTitle}>{item.titleKey}</Text>
                <Text style={styles.categoryText}>{item.subtitleKey}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIcon}>{selected.icon}</View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroLabel}>{texts.selectedRoute}</Text>
              <Text style={styles.heroTitle}>{selected.titleKey}</Text>
              <Text style={styles.heroText}>{selected.subtitleKey}</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <StatusPill label={texts.providerStatus} value={texts.providerNotConfigured} />
            <StatusPill label={texts.open} value={selected.titleKey} />
          </View>
        </View>

        <View style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="card-outline" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.emptyTextWrap}>
            <Text style={styles.emptyTitle}>{texts.noCardsTitle}</Text>
            <Text style={styles.emptyText}>{texts.noCardsText}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => router.push("/wallet/cards/add" as never)}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>{texts.addCard}</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/wallet/virtual-card" as never)}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>{texts.issueVirtual}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <SectionRow title={texts.providerStatus} hint={texts.providerNotConfigured} compact />
          <Text style={styles.cardText}>{texts.providerNotConfiguredText}</Text>
        </View>

        <View style={styles.card}>
          <SectionRow title={texts.securityTitle} hint={texts.securityHint} compact />
          <InfoRow title={texts.ruleTokenTitle} text={texts.ruleTokenText} />
          <Divider />
          <InfoRow title={texts.ruleDetectionTitle} text={texts.ruleDetectionText} />
          <Divider />
          <InfoRow title={texts.ruleConfirmationTitle} text={texts.ruleConfirmationText} />
        </View>

        <View style={styles.card}>
          <SectionRow title={texts.settingsTitle} hint={texts.settingsHint} compact />
          <Text style={styles.cardText}>{texts.settingsText}</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </WalletScreenShell>
  );
}

function SectionRow({
  title,
  hint,
  compact = false,
}: {
  title: string;
  hint: string;
  compact?: boolean;
}) {
  return (
    <View style={[styles.sectionRow, compact && styles.sectionRowCompact]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionHint}>{hint}</Text>
    </View>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statusPill}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

function InfoRow({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoDot} />
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoText}>{text}</Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  fixedHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#060F19",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    zIndex: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  headerTextWrap: {
    marginTop: 14,
    gap: 6,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    maxWidth: "94%",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 140,
  },
  sectionRow: {
    marginBottom: 12,
  },
  sectionRowCompact: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  sectionHint: {
    marginTop: 4,
    color: "rgba(255,255,255,0.56)",
    fontSize: 12,
    fontWeight: "700",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  categoryCard: {
    width: "48%",
    minHeight: 160,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "#0D1A2C",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  categoryCardActive: {
    borderColor: "#5F8EFF",
    backgroundColor: "rgba(47,107,255,0.16)",
  },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
  },
  categoryTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  categoryText: {
    marginTop: 7,
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  heroCard: {
    borderRadius: 26,
    padding: 18,
    backgroundColor: "#0C1830",
    borderWidth: 1,
    borderColor: "rgba(95,142,255,0.22)",
    marginBottom: 14,
  },
  heroTopRow: {
    flexDirection: "row",
    gap: 14,
  },
  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F6BFF",
  },
  heroTextWrap: {
    flex: 1,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroTitle: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  heroText: {
    marginTop: 7,
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  statusPill: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statusLabel: {
    color: "rgba(255,255,255,0.56)",
    fontSize: 11,
    fontWeight: "800",
  },
  statusValue: {
    marginTop: 5,
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  emptyCard: {
    flexDirection: "row",
    gap: 14,
    borderRadius: 24,
    padding: 16,
    backgroundColor: "#0B1728",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 14,
  },
  emptyIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  emptyTextWrap: {
    flex: 1,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: 7,
    color: "rgba(255,255,255,0.62)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  primaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F6BFF",
    borderWidth: 1,
    borderColor: "#4F88FF",
  },
  primaryButtonText: {
    color: "#EAF1FF",
    fontSize: 14,
    fontWeight: "900",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E1D33",
    borderWidth: 1,
    borderColor: "rgba(95,142,255,0.24)",
  },
  secondaryButtonText: {
    color: "#DCE7FF",
    fontSize: 14,
    fontWeight: "900",
  },
  card: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: "#0B1728",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 14,
  },
  cardText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
  },
  infoDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: "#5F8EFF",
    marginTop: 5,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  infoText: {
    marginTop: 4,
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  bottomSpacer: {
    height: 24,
  },
});
