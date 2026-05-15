import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import WalletScreenShell from "../../../src/modules/wallet/components/WalletScreenShell";
import { useI18n } from "../../../src/shared/i18n";
import {
  sanitizeWalletCardBindingProviderPayload,
  type WalletCardProviderTokenStatus,
} from "../../../src/shared/wallet/wallet-foundation";

function walletText(
  t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string,
  key: string,
  fallback: string,
) {
  const value = t(key);
  return value && value !== key ? value : fallback;
}

function useConfirmAddTexts() {
  const { t } = useI18n();

  return useMemo(
    () => ({
      title: walletText(t, "wallet.confirmAddCard.title", "Confirm card binding"),
      subtitle: walletText(
        t,
        "wallet.confirmAddCard.subtitle",
        "Only provider-tokenized card binding can be activated.",
      ),
      blockedTitle: walletText(t, "wallet.confirmAddCard.blockedTitle", "Provider token required"),
      blockedText: walletText(
        t,
        "wallet.confirmAddCard.blockedText",
        "This confirmation screen cannot activate a card without a verified token returned by the bank or payment provider.",
      ),
      providerToken: walletText(t, "wallet.confirmAddCard.providerToken", "Provider token"),
      maskedCard: walletText(t, "wallet.confirmAddCard.maskedCard", "Masked card"),
      cardCategory: walletText(t, "wallet.confirmAddCard.cardCategory", "Card category"),
      status: walletText(t, "wallet.confirmAddCard.status", "Status"),
      missing: walletText(t, "wallet.confirmAddCard.missing", "Missing"),
      pending: walletText(t, "wallet.confirmAddCard.pending", "Pending"),
      verified: walletText(t, "wallet.confirmAddCard.verified", "Verified"),
      rejected: walletText(t, "wallet.confirmAddCard.rejected", "Rejected"),
      restricted: walletText(t, "wallet.confirmAddCard.restricted", "Restricted"),
      invalidPayload: walletText(t, "wallet.confirmAddCard.invalidPayload", "Raw card data blocked"),
      blockedFields: walletText(t, "wallet.confirmAddCard.blockedFields", "Blocked fields"),
      source: walletText(t, "wallet.confirmAddCard.source", "Provider token"),
      pinTitle: walletText(t, "wallet.confirmAddCard.pinTitle", "Confirm card token"),
      pinSubtitle: walletText(
        t,
        "wallet.confirmAddCard.pinSubtitle",
        "Final activation must pass Wallet Security before backend/provider save.",
      ),
      tokenOnlyTitle: walletText(t, "wallet.confirmAddCard.tokenOnlyTitle", "Token-only activation"),
      tokenOnlyText: walletText(
        t,
        "wallet.confirmAddCard.tokenOnlyText",
        "Sabi receives only provider token ID, masked metadata and provider status. Raw card data never enters Sabi.",
      ),
      backToCards: walletText(t, "wallet.confirmAddCard.backToCards", "Back to cards"),
      continue: walletText(t, "wallet.confirmAddCard.continue", "Continue"),
    }),
    [t],
  );
}

export default function WalletConfirmAddCardPage() {
  const insets = useSafeAreaInsets();
  const texts = useConfirmAddTexts();
  const params = useLocalSearchParams<{
    providerId?: string;
    providerTokenId?: string;
    maskedCard?: string;
    cardCategory?: string;
    providerStatus?: string;
    ownerRole?: string;
    routeCurrencyCode?: string;
    cardBrand?: string;
    network?: string;
    providerReference?: string;
    tokenCreatedAt?: string;
  }>();

  const sanitized = useMemo(
    () =>
      sanitizeWalletCardBindingProviderPayload({
        providerId: params.providerId,
        providerTokenId: params.providerTokenId,
        maskedCard: params.maskedCard,
        cardCategory: params.cardCategory,
        providerStatus: params.providerStatus,
        ownerRole: params.ownerRole,
        routeCurrencyCode: params.routeCurrencyCode,
        cardBrand: params.cardBrand,
        network: params.network,
        providerReference: params.providerReference,
        tokenCreatedAt: params.tokenCreatedAt,
      }),
    [
      params.cardBrand,
      params.cardCategory,
      params.maskedCard,
      params.network,
      params.ownerRole,
      params.providerId,
      params.providerReference,
      params.providerStatus,
      params.providerTokenId,
      params.routeCurrencyCode,
      params.tokenCreatedAt,
    ],
  );
  const token = sanitized.payload.providerTokenId;
  const maskedCard = sanitized.payload.maskedCard;
  const cardCategory = sanitized.payload.cardCategory;
  const status = sanitized.payload.providerStatus;
  const canContinue = sanitized.isValid;
  const headerTop = Math.max(insets.top, 10);
  const statusLabelByStatus: Record<WalletCardProviderTokenStatus, string> = {
    missing: texts.missing,
    pending: texts.pending,
    verified: texts.verified,
    rejected: texts.rejected,
    restricted: texts.restricted,
  };

  const handleContinue = () => {
    if (!canContinue) return;

    router.push({
      pathname: "/wallet/pin-confirm" as never,
      params: {
        title: texts.pinTitle,
        subtitle: texts.pinSubtitle,
        flow: "card_tokenize",
        amount: "0",
        currency: sanitized.payload.routeCurrencyCode || "USD",
        reference: token,
        recipientName: maskedCard || cardCategory,
        source: texts.source,
      },
    });
  };

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
        <View style={styles.blockedCard}>
          <View style={styles.blockedIcon}>
            <MaterialCommunityIcons name="shield-lock-outline" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.blockedTextWrap}>
            <Text style={styles.blockedTitle}>{texts.blockedTitle}</Text>
            <Text style={styles.blockedText}>{texts.blockedText}</Text>
          </View>
        </View>

        {!sanitized.isValid && sanitized.reason === "raw_card_data_blocked" ? (
          <View style={styles.blockedCard}>
            <View style={styles.blockedIcon}>
              <MaterialCommunityIcons name="credit-card-lock-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.blockedTextWrap}>
              <Text style={styles.blockedTitle}>{texts.invalidPayload}</Text>
              <Text style={styles.blockedText}>
                {texts.blockedFields}: {sanitized.blockedFields.join(", ")}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <InfoItem label={texts.providerToken} value={token || texts.missing} />
          <Divider />
          <InfoItem label={texts.maskedCard} value={maskedCard || texts.missing} />
          <Divider />
          <InfoItem label={texts.cardCategory} value={cardCategory || texts.missing} />
          <Divider />
          <InfoItem label={texts.status} value={statusLabelByStatus[status] ?? texts.pending} />
        </View>

        <View style={styles.card}>
          <Text style={styles.policyTitle}>{texts.tokenOnlyTitle}</Text>
          <Text style={styles.policyText}>{texts.tokenOnlyText}</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}> 
        <Pressable onPress={() => router.push("/wallet/cards" as never)} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{texts.backToCards}</Text>
        </Pressable>

        <Pressable
          disabled={!canContinue}
          onPress={handleContinue}
          style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
        >
          <Text style={styles.primaryButtonText}>{texts.continue}</Text>
        </Pressable>
      </View>
    </WalletScreenShell>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
  blockedCard: {
    flexDirection: "row",
    gap: 14,
    borderRadius: 24,
    padding: 16,
    backgroundColor: "rgba(255,194,102,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,216,138,0.20)",
    marginBottom: 14,
  },
  blockedIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  blockedTextWrap: {
    flex: 1,
  },
  blockedTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  blockedText: {
    marginTop: 7,
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    lineHeight: 18,
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
  infoItem: {
    paddingVertical: 11,
  },
  infoLabel: {
    color: "rgba(255,255,255,0.56)",
    fontSize: 11,
    fontWeight: "800",
  },
  infoValue: {
    marginTop: 5,
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  policyTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  policyText: {
    marginTop: 8,
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
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
    minWidth: 128,
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
