import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import WalletScreenShell from "../../src/modules/wallet/components/WalletScreenShell";
import WalletProviderStatusPanel from "../../src/modules/wallet/components/WalletProviderStatusPanel";
import PlayReadyFinancialFeatureDisclosurePanel from "../../src/modules/play-ready/mobile/PlayReadyFinancialFeatureDisclosurePanel";
import { useI18n } from "../../src/shared/i18n";
import {
  formatWalletCurrencyAmount,
  getWalletCurrencySymbol,
  getWalletInternationalCurrencyCode,
  getWalletVirtualCardIssuingReadiness,
  isWalletVirtualCardProviderLaunchConfigured,
  useWalletFoundation,
  type WalletProviderStatus,
} from "../../src/shared/wallet/wallet-foundation";

type VirtualCardUseCase = "online" | "subscription" | "travel";
type UseCaseItem = {
  id: VirtualCardUseCase;
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

function normalizeLimitInput(value: string) {
  const normalized = value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
  const parts = normalized.split(".");
  if (parts.length <= 1) return normalized;
  return `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}`;
}


function useVirtualCardTexts() {
  const { t } = useI18n();

  return useMemo(
    () => ({
      title: walletText(t, "wallet.virtualCard.title", "Virtual card"),
      subtitle: walletText(
        t,
        "wallet.virtualCard.subtitle",
        "Bank or issuer-provider virtual card issuing with token-only storage.",
      ),
      previewEyebrow: walletText(t, "wallet.virtualCard.previewEyebrow", "VIRTUAL CARD"),
      previewMasked: walletText(t, "wallet.virtualCard.previewMasked", "Provider token pending"),
      previewStatus: walletText(t, "wallet.virtualCard.previewStatus", "Not issued"),
      currency: walletText(t, "wallet.virtualCard.currency", "Currency"),
      currencyFromSettings: walletText(t, "wallet.virtualCard.currencyFromSettings", "From Wallet Settings"),
      monthlyLimit: walletText(t, "wallet.virtualCard.monthlyLimit", "Monthly limit"),
      limitPlaceholder: walletText(t, "wallet.virtualCard.limitPlaceholder", "0.00"),
      useCaseTitle: walletText(t, "wallet.virtualCard.useCaseTitle", "Use case"),
      useCaseHint: walletText(t, "wallet.virtualCard.useCaseHint", "Issuing profile"),
      onlineTitle: walletText(t, "wallet.virtualCard.onlineTitle", "Online payments"),
      onlineText: walletText(t, "wallet.virtualCard.onlineText", "Default virtual card route for online merchants."),
      subscriptionTitle: walletText(t, "wallet.virtualCard.subscriptionTitle", "Subscriptions"),
      subscriptionText: walletText(t, "wallet.virtualCard.subscriptionText", "Separate controlled card for recurring payments."),
      travelTitle: walletText(t, "wallet.virtualCard.travelTitle", "Travel"),
      travelText: walletText(t, "wallet.virtualCard.travelText", "Provider-issued card route for international travel usage."),
      providerTitle: walletText(t, "wallet.virtualCard.providerTitle", "Issuer provider"),
      providerHint: walletText(t, "wallet.virtualCard.providerHint", "Bank / card issuer"),
      providerNotConfigured: walletText(t, "wallet.virtualCard.providerNotConfigured", "Provider not configured"),
      providerReady: walletText(t, "wallet.virtualCard.providerReady", "Provider ready"),
      providerKycRequired: walletText(t, "wallet.virtualCard.providerKycRequired", "KYC required"),
      providerReviewRequired: walletText(t, "wallet.virtualCard.providerReviewRequired", "Review required"),
      providerRestricted: walletText(t, "wallet.virtualCard.providerRestricted", "Restricted"),
      providerOpenUnavailable: walletText(
        t,
        "wallet.virtualCard.providerOpenUnavailable",
        "Provider SDK launch route is not connected yet.",
      ),
      providerText: walletText(
        t,
        "wallet.virtualCard.providerText",
        "Virtual cards can go live only after a partner bank or issuer provider is connected in backend/admin configuration.",
      ),
      requirementsTitle: walletText(t, "wallet.virtualCard.requirementsTitle", "Issuing requirements"),
      requirementsHint: walletText(t, "wallet.virtualCard.requirementsHint", "Before live card"),
      reqKycTitle: walletText(t, "wallet.virtualCard.reqKycTitle", "KYC / eligibility"),
      reqKycText: walletText(t, "wallet.virtualCard.reqKycText", "The backend must verify user eligibility before requesting card issuing."),
      reqTokenTitle: walletText(t, "wallet.virtualCard.reqTokenTitle", "Token-only result"),
      reqTokenText: walletText(t, "wallet.virtualCard.reqTokenText", "The provider returns token ID, masked metadata and status. Raw card data stays inside the bank/provider flow."),
      reqRiskTitle: walletText(t, "wallet.virtualCard.reqRiskTitle", "Wallet risk checks"),
      reqRiskText: walletText(t, "wallet.virtualCard.reqRiskText", "Sensitive actions must pass device, behavior and explicit confirmation checks."),
      securityTitle: walletText(t, "wallet.virtualCard.securityTitle", "Security controls"),
      securityHint: walletText(t, "wallet.virtualCard.securityHint", "Card controls"),
      freeze: walletText(t, "wallet.virtualCard.freeze", "Freeze"),
      onlinePayments: walletText(t, "wallet.virtualCard.onlinePayments", "Online payments"),
      internationalUsage: walletText(t, "wallet.virtualCard.internationalUsage", "International usage"),
      statusTitle: walletText(t, "wallet.virtualCard.statusTitle", "Issuing status"),
      kycRequired: walletText(t, "wallet.virtualCard.kycRequired", "KYC required"),
      ready: walletText(t, "wallet.virtualCard.ready", "Ready"),
      issue: walletText(t, "wallet.virtualCard.issue", "Issue virtual card"),
      disabledReason: walletText(t, "wallet.virtualCard.disabledReason", "Connect provider before issuing."),
      manageCards: walletText(t, "wallet.virtualCard.manageCards", "Cards"),
    }),
    [t],
  );
}

export default function WalletVirtualCardScreen() {
  const insets = useSafeAreaInsets();
  const texts = useVirtualCardTexts();
  const { snapshot } = useWalletFoundation();
  const [useCase, setUseCase] = useState<VirtualCardUseCase>("online");
  const [limit, setLimit] = useState("");
  const [frozen, setFrozen] = useState(false);
  const [allowOnline, setAllowOnline] = useState(true);
  const [allowInternational, setAllowInternational] = useState(true);

  const headerTop = Math.max(insets.top, 10);
  const cardCurrencyCode = getWalletInternationalCurrencyCode(snapshot);
  const cardCurrencyLabel = `${cardCurrencyCode} (${getWalletCurrencySymbol(cardCurrencyCode)})`;
  const limitAmount = Number(limit);
  const monthlyLimit = limit && Number.isFinite(limitAmount) ? limitAmount : 0;
  const issuingReadiness = useMemo(
    () =>
      getWalletVirtualCardIssuingReadiness(snapshot, {
        monthlyLimit,
        currencyCode: cardCurrencyCode,
        useCase,
        frozen,
        allowOnline,
        allowInternational,
      }),
    [allowInternational, allowOnline, cardCurrencyCode, frozen, monthlyLimit, snapshot, useCase],
  );
  const status = issuingReadiness.status;
  const providerLaunchConfigured = isWalletVirtualCardProviderLaunchConfigured();
  const canIssue = issuingReadiness.canRequest && providerLaunchConfigured;
  const limitValue =
    limit && Number.isFinite(limitAmount)
      ? formatWalletCurrencyAmount(limitAmount, cardCurrencyCode)
      : texts.previewStatus;

  const useCases = useMemo<UseCaseItem[]>(
    () => [
      {
        id: "online",
        title: texts.onlineTitle,
        text: texts.onlineText,
        icon: <Ionicons name="globe-outline" size={20} color="#FFFFFF" />,
      },
      {
        id: "subscription",
        title: texts.subscriptionTitle,
        text: texts.subscriptionText,
        icon: <MaterialCommunityIcons name="calendar-sync-outline" size={20} color="#FFFFFF" />,
      },
      {
        id: "travel",
        title: texts.travelTitle,
        text: texts.travelText,
        icon: <Ionicons name="airplane-outline" size={20} color="#FFFFFF" />,
      },
    ],
    [texts],
  );

  const statusLabelByStatus: Record<WalletProviderStatus, string> = {
    provider_not_configured: texts.providerNotConfigured,
    kyc_required: texts.providerKycRequired,
    review_required: texts.providerReviewRequired,
    restricted: texts.providerRestricted,
    ready: texts.providerReady,
  };
  const disabledReasonByStatus: Record<WalletProviderStatus, string> = {
    provider_not_configured: texts.disabledReason,
    kyc_required: texts.providerKycRequired,
    review_required: texts.providerReviewRequired,
    restricted: texts.providerRestricted,
    ready: providerLaunchConfigured ? texts.disabledReason : texts.providerOpenUnavailable,
  };
  const statusLabel = statusLabelByStatus[status];
  const disabledReason = canIssue ? "" : disabledReasonByStatus[status];

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
        <View style={styles.previewCard}>
          <View style={styles.previewTopRow}>
            <Text style={styles.previewEyebrow}>{texts.previewEyebrow}</Text>
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>{statusLabel}</Text>
            </View>
          </View>

          <Text style={styles.previewTitle}>Sabi</Text>
          <Text style={styles.previewMasked}>{texts.previewMasked}</Text>

          <View style={styles.previewMetaRow}>
            <MetaItem label={texts.currency} value={cardCurrencyLabel} />
            <MetaItem label={texts.monthlyLimit} value={limitValue} />
          </View>
        </View>

        <WalletProviderStatusPanel scope="virtual-card" compact />

        <PlayReadyFinancialFeatureDisclosurePanel
          compact
          contextLabel="Virtual card issuer disclosure evidence"
        />

        <SectionRow title={texts.useCaseTitle} hint={texts.useCaseHint} />
        <View style={styles.useCaseList}>
          {useCases.map((item) => {
            const active = item.id === useCase;

            return (
              <Pressable
                key={item.id}
                onPress={() => setUseCase(item.id)}
                style={[styles.useCaseCard, active && styles.useCaseCardActive]}
              >
                <View style={styles.useCaseIcon}>{item.icon}</View>
                <View style={styles.useCaseTextWrap}>
                  <Text style={styles.useCaseTitle}>{item.title}</Text>
                  <Text style={styles.useCaseText}>{item.text}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <SectionRow title={texts.monthlyLimit} hint={texts.currencyFromSettings} compact />
          <TextInput
            value={limit}
            onChangeText={(next) => setLimit(normalizeLimitInput(next))}
            placeholder={texts.limitPlaceholder}
            placeholderTextColor="rgba(255,255,255,0.34)"
            keyboardType="decimal-pad"
            style={styles.input}
          />
          <Text style={styles.helperText}>{cardCurrencyLabel}</Text>
        </View>

        <View style={styles.card}>
          <SectionRow title={texts.providerTitle} hint={texts.providerHint} compact />
          <StatusRow label={texts.statusTitle} value={statusLabel} />
          <Text style={styles.cardText}>{texts.providerText}</Text>
        </View>

        <View style={styles.card}>
          <SectionRow title={texts.requirementsTitle} hint={texts.requirementsHint} compact />
          <InfoRow title={texts.reqKycTitle} text={texts.reqKycText} />
          <Divider />
          <InfoRow title={texts.reqTokenTitle} text={texts.reqTokenText} />
          <Divider />
          <InfoRow title={texts.reqRiskTitle} text={texts.reqRiskText} />
        </View>

        <View style={styles.card}>
          <SectionRow title={texts.securityTitle} hint={texts.securityHint} compact />
          <ToggleRow title={texts.freeze} value={frozen} onPress={() => setFrozen((prev) => !prev)} />
          <Divider />
          <ToggleRow title={texts.onlinePayments} value={allowOnline} onPress={() => setAllowOnline((prev) => !prev)} />
          <Divider />
          <ToggleRow title={texts.internationalUsage} value={allowInternational} onPress={() => setAllowInternational((prev) => !prev)} />
        </View>

        {disabledReason ? <Text style={styles.disabledReason}>{disabledReason}</Text> : null}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}> 
        <Pressable onPress={() => router.push("/wallet/cards" as never)} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{texts.manageCards}</Text>
        </Pressable>

        <Pressable disabled={!canIssue} style={[styles.primaryButton, !canIssue && styles.primaryButtonDisabled]}>
          <Text style={styles.primaryButtonText}>{texts.issue}</Text>
        </Pressable>
      </View>
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

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
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

function ToggleRow({ title, value, onPress }: { title: string; value: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.toggleRow}>
      <Text style={styles.toggleTitle}>{title}</Text>
      <View style={[styles.toggleTrack, value && styles.toggleTrackActive]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
      </View>
    </Pressable>
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
  previewCard: {
    minHeight: 214,
    borderRadius: 28,
    padding: 20,
    backgroundColor: "#173C9A",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    marginBottom: 18,
    overflow: "hidden",
  },
  previewTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewEyebrow: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  previewBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  previewBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
  previewTitle: {
    marginTop: 40,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },
  previewMasked: {
    marginTop: 16,
    color: "rgba(255,255,255,0.82)",
    fontSize: 16,
    letterSpacing: 0.6,
    fontWeight: "800",
  },
  previewMetaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
  },
  metaItem: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  metaLabel: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 10,
    fontWeight: "800",
  },
  metaValue: {
    marginTop: 5,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
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
  useCaseList: {
    gap: 10,
    marginBottom: 14,
  },
  useCaseCard: {
    flexDirection: "row",
    gap: 14,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "#0D1A2C",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  useCaseCardActive: {
    borderColor: "#5F8EFF",
    backgroundColor: "rgba(47,107,255,0.16)",
  },
  useCaseIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  useCaseTextWrap: {
    flex: 1,
  },
  useCaseTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  useCaseText: {
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
  input: {
    minHeight: 54,
    borderRadius: 18,
    paddingHorizontal: 14,
    backgroundColor: "#091426",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  helperText: {
    marginTop: 8,
    color: "rgba(255,255,255,0.56)",
    fontSize: 12,
    fontWeight: "700",
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
    fontSize: 14,
    fontWeight: "900",
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
  toggleRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  toggleTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 999,
    padding: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  toggleTrackActive: {
    backgroundColor: "#2F6BFF",
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
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
