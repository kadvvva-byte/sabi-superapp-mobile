import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import WalletScreenShell from "../../../src/modules/wallet/components/WalletScreenShell";
import { useI18n } from "../../../src/shared/i18n";
import {
  getWalletCardRouteCurrencyCode,
  getWalletCurrencySymbol,
  getWalletInternationalCurrencyCode,
  getWalletLocalCurrencyCode,
  isWalletLocalCurrencyConfigured,
  isWalletProviderReady,
  useWalletFoundation,
  type WalletProviderStatus,
} from "../../../src/shared/wallet/wallet-foundation";

type FundingRole = "personal" | "business" | "merchant";
type CardBindingCategory = "local" | "international" | "local_global" | "virtual";

type Option<T extends string> = {
  id: T;
  title: string;
  text: string;
  icon: React.ReactNode;
};

function walletText(
  t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string,
  key: string,
  fallback: string,
) {
  const value = t(key);
  return value && value !== key ? value : fallback;
}

function useAddCardTexts() {
  const { t } = useI18n();

  return useMemo(
    () => ({
      title: walletText(t, "wallet.addCard.title", "Add card"),
      subtitle: walletText(
        t,
        "wallet.addCard.subtitle",
        "Secure card binding must start from a bank or provider SDK. Sabi does not collect PAN or CVV.",
      ),
      roleTitle: walletText(t, "wallet.addCard.roleTitle", "Wallet role"),
      roleHint: walletText(t, "wallet.addCard.roleHint", "Routing purpose"),
      personal: walletText(t, "wallet.addCard.personal", "Personal"),
      personalText: walletText(t, "wallet.addCard.personalText", "Bind card for personal Sabi Wallet flows."),
      business: walletText(t, "wallet.addCard.business", "Business"),
      businessText: walletText(t, "wallet.addCard.businessText", "Prepare card route for business wallet operations when enabled."),
      merchant: walletText(t, "wallet.addCard.merchant", "Merchant"),
      merchantText: walletText(t, "wallet.addCard.merchantText", "Prepare card route for merchant settlement and commerce flows."),
      categoryTitle: walletText(t, "wallet.addCard.categoryTitle", "Expected category"),
      categoryHint: walletText(t, "wallet.addCard.categoryHint", "Provider will finalize"),
      localCard: walletText(t, "wallet.cards.localCard", "Local Card"),
      localCardText: walletText(t, "wallet.cards.localCardText", "Domestic card route. Card type must be detected after secure provider binding."),
      internationalCard: walletText(t, "wallet.cards.internationalCard", "International Card"),
      internationalCardText: walletText(t, "wallet.cards.internationalCardText", "Global route for cross-border and online payments through provider tokens."),
      localGlobalCard: walletText(t, "wallet.cards.localGlobalCard", "Local + Global"),
      localGlobalCardText: walletText(t, "wallet.cards.localGlobalCardText", "Hybrid card route detected by bank or payment provider after binding."),
      virtualCard: walletText(t, "wallet.cards.virtualCard", "Virtual Card"),
      virtualCardText: walletText(t, "wallet.cards.virtualCardText", "Online secure card issued by a bank or issuer provider."),
      providerTitle: walletText(t, "wallet.addCard.providerTitle", "Provider binding"),
      providerHint: walletText(t, "wallet.addCard.providerHint", "SDK / iFrame"),
      routeCurrency: walletText(t, "wallet.addCard.routeCurrency", "Route currency"),
      localCurrencyRequired: walletText(t, "wallet.addCard.localCurrencyRequired", "Select local currency in Wallet Settings"),
      internationalCurrency: walletText(t, "wallet.addCard.internationalCurrency", "International currency"),
      providerNotConfigured: walletText(t, "wallet.addCard.providerNotConfigured", "Provider not configured"),
      providerReady: walletText(t, "wallet.addCard.providerReady", "Provider ready"),
      providerKycRequired: walletText(t, "wallet.addCard.providerKycRequired", "KYC required"),
      providerReviewRequired: walletText(t, "wallet.addCard.providerReviewRequired", "Review required"),
      providerRestricted: walletText(t, "wallet.addCard.providerRestricted", "Restricted"),
      providerOpenUnavailable: walletText(
        t,
        "wallet.addCard.providerOpenUnavailable",
        "Provider SDK launch route is not connected yet.",
      ),
      providerText: walletText(
        t,
        "wallet.addCard.providerText",
        "The real card form must be opened inside the bank or payment provider SDK/iFrame. Sabi receives only provider token, masked metadata and status.",
      ),
      noManualTitle: walletText(t, "wallet.addCard.noManualTitle", "No manual card input"),
      noManualText: walletText(
        t,
        "wallet.addCard.noManualText",
        "Do not type card number, CVV or expiry inside Sabi UI. Those fields belong only to the certified provider flow.",
      ),
      policyTitle: walletText(t, "wallet.addCard.policyTitle", "Binding policy"),
      policyHint: walletText(t, "wallet.addCard.policyHint", "Before activation"),
      tokenTitle: walletText(t, "wallet.addCard.tokenTitle", "Provider token"),
      tokenText: walletText(t, "wallet.addCard.tokenText", "Store token ID, masked card metadata, category and status only."),
      confirmTitle: walletText(t, "wallet.addCard.confirmTitle", "User confirmation"),
      confirmText: walletText(t, "wallet.addCard.confirmText", "Use provider confirmation plus Sabi PIN/biometric confirmation for sensitive flows."),
      adminTitle: walletText(t, "wallet.addCard.adminTitle", "Admin/provider control"),
      adminText: walletText(t, "wallet.addCard.adminText", "Provider keys, limits, availability and risk rules must be controlled from backend/admin."),
      openProvider: walletText(t, "wallet.addCard.openProvider", "Open provider SDK"),
      providerDisabled: walletText(t, "wallet.addCard.providerDisabled", "Connect provider before live card binding."),
      cards: walletText(t, "wallet.cards.title", "Cards"),
    }),
    [t],
  );
}

export default function WalletAddCardPage() {
  const insets = useSafeAreaInsets();
  const texts = useAddCardTexts();
  const { snapshot } = useWalletFoundation();
  const [role, setRole] = useState<FundingRole>("personal");
  const [category, setCategory] = useState<CardBindingCategory>("local");

  const providerStatus = snapshot.cardProviderStatus;
  const providerConfigured = isWalletProviderReady(providerStatus);
  const providerLaunchAvailable: boolean = false;
  const canOpenProviderSdk = providerConfigured && providerLaunchAvailable;
  const providerStatusTextByStatus: Record<WalletProviderStatus, string> = {
    provider_not_configured: texts.providerNotConfigured,
    kyc_required: texts.providerKycRequired,
    review_required: texts.providerReviewRequired,
    restricted: texts.providerRestricted,
    ready: texts.providerReady,
  };
  const providerStatusText = providerStatusTextByStatus[providerStatus] ?? texts.providerNotConfigured;
  const providerDisabledReason = providerConfigured ? texts.providerOpenUnavailable : texts.providerDisabled;
  const headerTop = Math.max(insets.top, 10);
  const localCurrencyConfigured = isWalletLocalCurrencyConfigured(snapshot);
  const localCurrencyCode = getWalletLocalCurrencyCode(snapshot);
  const internationalCurrencyCode = getWalletInternationalCurrencyCode(snapshot);
  const routeCurrencyCode = getWalletCardRouteCurrencyCode(category, snapshot);
  const formatCurrencyLabel = (code: string) =>
    code ? `${code} (${getWalletCurrencySymbol(code)})` : texts.localCurrencyRequired;
  const routeCurrencyLabel =
    category === "local_global"
      ? `${localCurrencyCode ? formatCurrencyLabel(localCurrencyCode) : texts.localCurrencyRequired} / ${formatCurrencyLabel(internationalCurrencyCode)}`
      : formatCurrencyLabel(routeCurrencyCode);
  const routeCurrencyWarning =
    (category === "local" || category === "local_global") && !localCurrencyConfigured
      ? texts.localCurrencyRequired
      : "";

  const roles = useMemo<Option<FundingRole>[]>(
    () => [
      {
        id: "personal",
        title: texts.personal,
        text: texts.personalText,
        icon: <Ionicons name="person-outline" size={20} color="#FFFFFF" />,
      },
      {
        id: "business",
        title: texts.business,
        text: texts.businessText,
        icon: <MaterialCommunityIcons name="briefcase-outline" size={20} color="#FFFFFF" />,
      },
      {
        id: "merchant",
        title: texts.merchant,
        text: texts.merchantText,
        icon: <MaterialCommunityIcons name="storefront-outline" size={20} color="#FFFFFF" />,
      },
    ],
    [texts],
  );

  const categories = useMemo<Option<CardBindingCategory>[]>(
    () => [
      {
        id: "local",
        title: texts.localCard,
        text: texts.localCardText,
        icon: <MaterialCommunityIcons name="bank-outline" size={20} color="#FFFFFF" />,
      },
      {
        id: "international",
        title: texts.internationalCard,
        text: texts.internationalCardText,
        icon: <Ionicons name="globe-outline" size={20} color="#FFFFFF" />,
      },
      {
        id: "local_global",
        title: texts.localGlobalCard,
        text: texts.localGlobalCardText,
        icon: <MaterialCommunityIcons name="credit-card-sync-outline" size={20} color="#FFFFFF" />,
      },
      {
        id: "virtual",
        title: texts.virtualCard,
        text: texts.virtualCardText,
        icon: <MaterialCommunityIcons name="credit-card-wireless-outline" size={20} color="#FFFFFF" />,
      },
    ],
    [texts],
  );

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
        <SectionRow title={texts.roleTitle} hint={texts.roleHint} />
        <View style={styles.stack}>
          {roles.map((item) => (
            <OptionCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              text={item.text}
              active={role === item.id}
              onPress={() => setRole(item.id)}
            />
          ))}
        </View>

        <SectionRow title={texts.categoryTitle} hint={texts.categoryHint} />
        <View style={styles.stack}>
          {categories.map((item) => (
            <OptionCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              text={item.text}
              active={category === item.id}
              onPress={() => setCategory(item.id)}
            />
          ))}
        </View>

        <View style={styles.card}>
          <SectionRow title={texts.providerTitle} hint={texts.providerHint} compact />
          <StatusRow label={texts.providerNotConfigured} value={providerStatusText} />
          <StatusRow label={texts.routeCurrency} value={routeCurrencyLabel} />
          {routeCurrencyWarning ? <Text style={styles.warningInlineText}>{routeCurrencyWarning}</Text> : null}
          <Text style={styles.cardText}>{texts.providerText}</Text>
        </View>

        <View style={styles.warningCard}>
          <View style={styles.warningIcon}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.warningTextWrap}>
            <Text style={styles.warningTitle}>{texts.noManualTitle}</Text>
            <Text style={styles.warningText}>{texts.noManualText}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <SectionRow title={texts.policyTitle} hint={texts.policyHint} compact />
          <InfoRow title={texts.tokenTitle} text={texts.tokenText} />
          <Divider />
          <InfoRow title={texts.confirmTitle} text={texts.confirmText} />
          <Divider />
          <InfoRow title={texts.adminTitle} text={texts.adminText} />
        </View>

        <Text style={styles.disabledReason}>{providerDisabledReason}</Text>
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}> 
        <Pressable onPress={() => router.push("/wallet/cards" as never)} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{texts.cards}</Text>
        </Pressable>

        <Pressable disabled={!canOpenProviderSdk} style={[styles.primaryButton, !canOpenProviderSdk && styles.primaryButtonDisabled]}>
          <Text style={styles.primaryButtonText}>{texts.openProvider}</Text>
        </Pressable>
      </View>
    </WalletScreenShell>
  );
}

function SectionRow({ title, hint, compact = false }: { title: string; hint: string; compact?: boolean }) {
  return (
    <View style={[styles.sectionRow, compact && styles.sectionRowCompact]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionHint}>{hint}</Text>
    </View>
  );
}

function OptionCard({
  icon,
  title,
  text,
  active,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.optionCard, active && styles.optionCardActive]}>
      <View style={styles.optionIcon}>{icon}</View>
      <View style={styles.optionTextWrap}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionText}>{text}</Text>
      </View>
      {active ? <Ionicons name="checkmark-circle" size={20} color="#7DA2FF" /> : null}
    </Pressable>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statusRow}>
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
    paddingBottom: 160,
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
  stack: {
    gap: 10,
    marginBottom: 14,
  },
  optionCard: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    borderRadius: 22,
    padding: 14,
    backgroundColor: "#0D1A2C",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  optionCardActive: {
    borderColor: "#5F8EFF",
    backgroundColor: "rgba(47,107,255,0.16)",
  },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  optionText: {
    marginTop: 6,
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  card: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: "#0B1728",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 14,
  },
  statusRow: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
  },
  statusLabel: {
    color: "rgba(255,255,255,0.56)",
    fontSize: 11,
    fontWeight: "800",
  },
  statusValue: {
    marginTop: 5,
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  warningInlineText: {
    color: "#FFD166",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
    marginBottom: 12,
  },
  cardText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  warningCard: {
    flexDirection: "row",
    gap: 14,
    borderRadius: 24,
    padding: 16,
    backgroundColor: "rgba(255,194,102,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,216,138,0.20)",
    marginBottom: 14,
  },
  warningIcon: {
    width: 46,
    height: 46,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  warningTextWrap: {
    flex: 1,
  },
  warningTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  warningText: {
    marginTop: 7,
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    lineHeight: 18,
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
  disabledReason: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 14,
  },
  bottomBar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: "#060F19",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
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
  primaryButtonDisabled: {
    opacity: 0.52,
  },
  primaryButtonText: {
    color: "#EAF1FF",
    fontSize: 14,
    fontWeight: "900",
  },
  secondaryButton: {
    minHeight: 52,
    minWidth: 116,
    paddingHorizontal: 14,
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
  bottomSpacer: {
    height: 24,
  },
});
