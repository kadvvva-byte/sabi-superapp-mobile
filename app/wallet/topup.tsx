import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import WalletScreenShell from "../../src/modules/wallet/components/WalletScreenShell";
import { WalletHeader } from "../../src/modules/wallet/components/WalletHeader";
import { WalletFormCard } from "../../src/modules/wallet/components/WalletFormCard";
import WalletSectionTitle from "../../src/modules/wallet/components/WalletSectionTitle";
import { WalletAmountInput } from "../../src/modules/wallet/components/WalletAmountInput";
import WalletBottomActionBar from "../../src/modules/wallet/components/WalletBottomActionBar";
import { WalletSourceAccountCard } from "../../src/modules/wallet/components/WalletSourceAccountCard";
import { useI18n } from "../../src/shared/i18n";
import {
  formatPrimaryWalletAmount,
  useWalletFoundation,
} from "../../src/shared/wallet/wallet-foundation";
import {
  buildWalletMoneyMovementGuard,
  walletMoneyMovementGuardParams,
} from "../../src/shared/wallet/wallet-money-movement";

type FundingSource = {
  id: string;
  title: string;
  subtitle: string;
  schemeLabel: string;
  maskedPan: string;
  badge?: string;
  kind: "international" | "local" | "local_international" | "virtual";
  providerTokenId: string;
  canTopUpSabiBalance: boolean;
};

const LINKED_FUNDING_SOURCES: FundingSource[] = [];

function walletText(
  t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string,
  key: string,
  fallback: string,
) {
  const value = t(key);
  return value && value !== key ? value : fallback;
}

function normalizeAmountInput(value: string) {
  const normalized = value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
  const parts = normalized.split(".");
  if (parts.length <= 1) return normalized;
  return `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}`;
}

function getKindLabel(kind: FundingSource["kind"], texts: ReturnType<typeof useTopUpTexts>) {
  if (kind === "local_international") return texts.kindLocalGlobal;
  if (kind === "international") return texts.kindInternational;
  if (kind === "virtual") return texts.kindVirtual;
  return texts.kindLocal;
}

function useTopUpTexts() {
  const { t } = useI18n();

  return useMemo(
    () => ({
      title: walletText(t, "wallet.topup.title", "Top up"),
      subtitle: walletText(
        t,
        "wallet.topup.subtitle",
        "Fund Sabi Balance only through verified tokenized provider routes.",
      ),
      destination: walletText(t, "wallet.topup.destination", "Destination"),
      destinationHint: walletText(t, "wallet.topup.destinationHint", "Internal money"),
      sabiBalance: walletText(t, "wallet.shared.sabiBalance", "Sabi Balance"),
      destinationText: walletText(
        t,
        "wallet.topup.destinationText",
        "Internal electronic money for transfers, ecosystem payments and daily usage.",
      ),
      storedValue: walletText(t, "wallet.topup.storedValue", "Stored value"),
      type: walletText(t, "wallet.topup.type", "Type"),
      internalMoney: walletText(t, "wallet.topup.internalMoney", "Internal electronic money"),
      usage: walletText(t, "wallet.topup.usage", "Usage"),
      transfersPayments: walletText(t, "wallet.topup.transfersPayments", "Transfers + Payments"),
      speed: walletText(t, "wallet.topup.speed", "Speed"),
      byProviderPolicy: walletText(t, "wallet.topup.byProviderPolicy", "By provider policy"),
      amount: walletText(t, "wallet.topup.amount", "Amount"),
      amountHint: walletText(t, "wallet.topup.amountHint", "Funding value"),
      helperText: walletText(
        t,
        "wallet.topup.helperText",
        "Top up brings external funds into Sabi Balance. It is separate from internal transfer and withdraw.",
      ),
      fundingSource: walletText(t, "wallet.topup.fundingSource", "Funding source"),
      fundingSourceHint: walletText(t, "wallet.topup.fundingSourceHint", "Tokenized card"),
      noLinkedCardsTitle: walletText(t, "wallet.topup.noLinkedCardsTitle", "No linked tokenized cards"),
      noLinkedCardsText: walletText(
        t,
        "wallet.topup.noLinkedCardsText",
        "Add a card through the bank or provider SDK before funding Sabi Balance. Raw card data stays inside the bank/provider flow.",
      ),
      addCard: walletText(t, "wallet.topup.addCard", "Add card"),
      eligibility: walletText(t, "wallet.topup.eligibility", "Eligibility"),
      eligibilityHint: walletText(t, "wallet.topup.eligibilityHint", "Resolved by rules"),
      eligible: walletText(t, "wallet.topup.eligible", "Eligible"),
      restricted: walletText(t, "wallet.topup.restricted", "Restricted"),
      eligibleText: walletText(
        t,
        "wallet.topup.eligibleText",
        "This provider token is allowed to fund Sabi Balance.",
      ),
      restrictedText: walletText(
        t,
        "wallet.topup.restrictedText",
        "A verified provider token is required before top up can continue.",
      ),
      selectedSource: walletText(t, "wallet.topup.selectedSource", "Selected source"),
      scheme: walletText(t, "wallet.topup.scheme", "Scheme"),
      maskedCard: walletText(t, "wallet.topup.maskedCard", "Masked card"),
      sourceType: walletText(t, "wallet.topup.sourceType", "Source type"),
      tokenOnlyTitle: walletText(t, "wallet.topup.tokenOnlyTitle", "Token-only route"),
      tokenOnlyText: walletText(
        t,
        "wallet.topup.tokenOnlyText",
        "Card funding must be confirmed through provider tokenization, biometric/PIN confirmation and wallet risk checks.",
      ),
      continue: walletText(t, "wallet.topup.continue", "Continue"),
      confirmTitle: walletText(t, "wallet.topup.confirmTitle", "Confirm Sabi Balance top up"),
      usd: walletText(t, "wallet.send.usd", "USD"),
      kindLocal: walletText(t, "wallet.cards.localCard", "Local Card"),
      kindInternational: walletText(t, "wallet.cards.internationalCard", "International Card"),
      kindLocalGlobal: walletText(t, "wallet.cards.localGlobalCard", "Local + Global"),
      kindVirtual: walletText(t, "wallet.cards.virtualCard", "Virtual Card"),
      emptyValue: "—",
    }),
    [t],
  );
}

export default function WalletTopUpPage() {
  const insets = useSafeAreaInsets();
  const texts = useTopUpTexts();
  const { snapshot } = useWalletFoundation();
  const primaryCurrencyCode = snapshot.primaryCurrencyCode || "USD";
  const [amount, setAmount] = useState("");
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");

  const sources = LINKED_FUNDING_SOURCES;
  const selectedSource = useMemo(
    () => sources.find((item) => item.id === selectedSourceId),
    [selectedSourceId, sources],
  );

  const parsedAmount = Number(amount || 0);
  const movementGuard = buildWalletMoneyMovementGuard({
    snapshot,
    flow: "topup",
    amount: parsedAmount,
    currencyCode: primaryCurrencyCode,
    providerTokenId: selectedSource?.providerTokenId,
    payload: { providerTokenId: selectedSource?.providerTokenId },
  });
  const canContinue =
    selectedSource?.canTopUpSabiBalance === true &&
    Boolean(selectedSource.providerTokenId) &&
    movementGuard.canPrepare;

  const handleContinue = () => {
    if (!canContinue || !selectedSource) return;

    router.push({
      pathname: "/wallet/confirm",
      params: {
        flow: "topup",
        title: texts.confirmTitle,
        amount: parsedAmount.toFixed(2),
        currency: primaryCurrencyCode,
        destinationTitle: texts.sabiBalance,
        destinationType: "internal_stored_value",
        sourceId: selectedSource.providerTokenId,
        sourceTitle: selectedSource.title,
        sourceScheme: selectedSource.schemeLabel,
        sourcePan: selectedSource.maskedPan,
        eligibility: String(selectedSource.canTopUpSabiBalance),
        providerTokenId: selectedSource.providerTokenId,
        ...walletMoneyMovementGuardParams(movementGuard),
      },
    });
  };

  return (
    <WalletScreenShell>
      <View style={[styles.fixedHeader, { paddingTop: Math.max(insets.top, 10) }]}> 
        <WalletHeader title={texts.title} subtitle={texts.subtitle} topOffset={0} bottomOffset={0} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <WalletSectionTitle title={texts.destination} hint={texts.destinationHint} />
        <WalletFormCard>
          <View style={styles.destinationHero}>
            <View style={styles.destinationIconWrap}>
              <Ionicons name="wallet-outline" size={22} color="#FFFFFF" />
            </View>

            <View style={styles.destinationTextWrap}>
              <Text style={styles.destinationTitle}>{texts.sabiBalance}</Text>
              <Text style={styles.destinationSubtitle}>{texts.destinationText}</Text>
            </View>

            <View style={styles.destinationBadge}>
              <Text style={styles.destinationBadgeText}>{texts.storedValue}</Text>
            </View>
          </View>

          <View style={styles.destinationMetaGrid}>
            <MetaItem label={texts.type} value={texts.internalMoney} />
            <MetaItem label={texts.usage} value={texts.transfersPayments} />
            <MetaItem label={texts.speed} value={texts.byProviderPolicy} />
          </View>
        </WalletFormCard>

        <WalletSectionTitle title={texts.amount} hint={texts.amountHint} />
        <WalletFormCard>
          <WalletAmountInput
            value={amount}
            onChangeText={(next) => setAmount(normalizeAmountInput(next))}
            currency={primaryCurrencyCode}
            placeholder="0"
          />

          <View style={styles.quickAmountsRow}>
            {["50", "100", "250", "500"].map((preset) => (
              <Pressable
                key={preset}
                style={styles.presetChip}
                onPress={() => setAmount(preset)}
              >
                <Text style={styles.presetChipText}>{formatPrimaryWalletAmount(Number(preset), primaryCurrencyCode)}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.helperText}>{texts.helperText}</Text>
        </WalletFormCard>

        <WalletSectionTitle title={texts.fundingSource} hint={texts.fundingSourceHint} />
        <View style={styles.sourceStack}>
          {sources.length > 0 ? (
            sources.map((source) => (
              <WalletSourceAccountCard
                key={source.id}
                title={source.title}
                subtitle={source.subtitle}
                schemeLabel={source.schemeLabel}
                maskedPan={source.maskedPan}
                badge={source.badge}
                selected={selectedSourceId === source.id}
                disabled={!source.canTopUpSabiBalance}
                onPress={() => setSelectedSourceId(source.id)}
              />
            ))
          ) : (
            <EmptyProviderCard
              title={texts.noLinkedCardsTitle}
              text={texts.noLinkedCardsText}
              actionLabel={texts.addCard}
              onPress={() => router.push("/wallet/cards/add" as never)}
            />
          )}
        </View>

        <WalletSectionTitle title={texts.eligibility} hint={texts.eligibilityHint} />
        <WalletFormCard>
          <View style={styles.eligibilityHero}>
            <View style={styles.eligibilityIconWrap}>
              <MaterialCommunityIcons
                name={canContinue ? "check-decagram-outline" : "alert-circle-outline"}
                size={22}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.eligibilityTextWrap}>
              <Text style={styles.eligibilityTitle}>{canContinue ? texts.eligible : texts.restricted}</Text>
              <Text style={styles.eligibilitySubtitle}>{canContinue ? texts.eligibleText : texts.restrictedText}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <InfoRow label={texts.selectedSource} value={selectedSource?.title ?? texts.emptyValue} />
            <InfoRow label={texts.scheme} value={selectedSource?.schemeLabel ?? texts.emptyValue} />
            <InfoRow label={texts.maskedCard} value={selectedSource?.maskedPan ?? texts.emptyValue} />
            <InfoRow
              label={texts.sourceType}
              value={selectedSource ? getKindLabel(selectedSource.kind, texts) : texts.emptyValue}
            />
          </View>
        </WalletFormCard>

        <WalletSectionTitle title={texts.tokenOnlyTitle} hint={texts.eligibilityHint} />
        <WalletFormCard>
          <SecurityRow title={texts.tokenOnlyTitle} text={texts.tokenOnlyText} />
        </WalletFormCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <WalletBottomActionBar
        primaryLabel={texts.continue}
        onPrimaryPress={handleContinue}
        primaryDisabled={!canContinue}
        secondaryLabel={texts.addCard}
        onSecondaryPress={() => router.push("/wallet/cards/add" as never)}
      />
    </WalletScreenShell>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function EmptyProviderCard({
  title,
  text,
  actionLabel,
  onPress,
}: {
  title: string;
  text: string;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <WalletFormCard>
      <View style={styles.emptyProviderRow}>
        <View style={styles.emptyIconWrap}>
          <Ionicons name="card-outline" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.emptyTextWrap}>
          <Text style={styles.emptyTitle}>{title}</Text>
          <Text style={styles.emptyText}>{text}</Text>
        </View>
      </View>
      <Pressable onPress={onPress} style={styles.emptyActionButton}>
        <Text style={styles.emptyActionText}>{actionLabel}</Text>
      </Pressable>
    </WalletFormCard>
  );
}

function SecurityRow({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.securityRow}>
      <View style={styles.securityDot} />
      <View style={styles.securityTextWrap}>
        <Text style={styles.securityTitle}>{title}</Text>
        <Text style={styles.securityText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#060F19",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    zIndex: 10,
    elevation: 10,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 120,
  },
  destinationHero: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 18,
  },
  destinationIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  destinationTextWrap: {
    flex: 1,
  },
  destinationTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 5,
  },
  destinationSubtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 18,
  },
  destinationBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  destinationBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  destinationMetaGrid: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    color: "#90A4C0",
    fontSize: 12,
    marginBottom: 6,
  },
  metaValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  quickAmountsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  presetChip: {
    minHeight: 36,
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  presetChipText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  helperText: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
  },
  sourceStack: {
    gap: 12,
  },
  emptyProviderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  emptyIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  emptyTextWrap: {
    flex: 1,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 6,
  },
  emptyText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    lineHeight: 18,
  },
  emptyActionButton: {
    marginTop: 14,
    minHeight: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F6BFF",
    borderWidth: 1,
    borderColor: "#4F88FF",
  },
  emptyActionText: {
    color: "#EAF1FF",
    fontSize: 13,
    fontWeight: "900",
  },
  eligibilityHero: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 18,
  },
  eligibilityIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  eligibilityTextWrap: {
    flex: 1,
  },
  eligibilityTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },
  eligibilitySubtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 18,
  },
  infoGrid: {
    gap: 14,
  },
  infoRow: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  infoLabel: {
    color: "#90A4C0",
    fontSize: 12,
    marginBottom: 6,
  },
  infoValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  securityDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: "#74F0C7",
    marginTop: 5,
  },
  securityTextWrap: {
    flex: 1,
  },
  securityTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 5,
  },
  securityText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 4,
  },
});
