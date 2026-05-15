import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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

type WithdrawDestination = {
  id: string;
  title: string;
  subtitle: string;
  schemeLabel: string;
  maskedPan: string;
  badge?: string;
  kind: "international" | "local" | "local_international" | "virtual";
  providerTokenId: string;
  canWithdraw: boolean;
};

const LINKED_WITHDRAW_DESTINATIONS: WithdrawDestination[] = [];

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

function useWithdrawTexts() {
  const { t } = useI18n();

  return useMemo(
    () => ({
      title: walletText(t, "wallet.withdraw.title", "Withdraw"),
      subtitle: walletText(
        t,
        "wallet.withdraw.subtitle",
        "Move funds from Sabi Balance to a verified tokenized card route.",
      ),
      source: walletText(t, "wallet.withdraw.source", "Source"),
      sourceHint: walletText(t, "wallet.withdraw.sourceHint", "Internal money"),
      sabiBalance: walletText(t, "wallet.shared.sabiBalance", "Sabi Balance"),
      sourceText: walletText(
        t,
        "wallet.withdraw.sourceText",
        "Internal electronic money available for transfer, payment and withdraw flows.",
      ),
      storedValue: walletText(t, "wallet.withdraw.storedValue", "Stored value"),
      available: walletText(t, "wallet.withdraw.available", "Available"),
      withdrawRoute: walletText(t, "wallet.withdraw.withdrawRoute", "Withdraw route"),
      linkedCard: walletText(t, "wallet.withdraw.linkedCard", "Linked card"),
      speed: walletText(t, "wallet.withdraw.speed", "Speed"),
      byProviderPolicy: walletText(t, "wallet.withdraw.byProviderPolicy", "By provider policy"),
      amount: walletText(t, "wallet.withdraw.amount", "Amount"),
      amountHint: walletText(t, "wallet.withdraw.amountHint", "Cash-out value"),
      helperText: walletText(
        t,
        "wallet.withdraw.helperText",
        "Withdraw moves funds out of Sabi Balance to an external linked card. It is separate from internal transfer and top up.",
      ),
      destination: walletText(t, "wallet.withdraw.destination", "Withdraw destination"),
      destinationHint: walletText(t, "wallet.withdraw.destinationHint", "Tokenized card"),
      noLinkedCardsTitle: walletText(t, "wallet.withdraw.noLinkedCardsTitle", "No linked tokenized cards"),
      noLinkedCardsText: walletText(
        t,
        "wallet.withdraw.noLinkedCardsText",
        "Add a card through the bank or provider SDK before withdrawing. Raw card data stays inside the bank/provider flow.",
      ),
      addCard: walletText(t, "wallet.withdraw.addCard", "Add card"),
      destinationDetails: walletText(t, "wallet.withdraw.destinationDetails", "Destination details"),
      destinationDetailsHint: walletText(t, "wallet.withdraw.destinationDetailsHint", "Resolved target"),
      destinationLabel: walletText(t, "wallet.withdraw.destinationLabel", "Destination"),
      scheme: walletText(t, "wallet.withdraw.scheme", "Scheme"),
      maskedCard: walletText(t, "wallet.withdraw.maskedCard", "Masked card"),
      type: walletText(t, "wallet.withdraw.type", "Type"),
      reference: walletText(t, "wallet.withdraw.reference", "Reference"),
      referenceHint: walletText(t, "wallet.withdraw.referenceHint", "Optional note"),
      notePlaceholder: walletText(t, "wallet.withdraw.notePlaceholder", "Cash-out, personal use, bank withdrawal..."),
      securityTitle: walletText(t, "wallet.withdraw.securityTitle", "Token-only cash-out"),
      securityText: walletText(
        t,
        "wallet.withdraw.securityText",
        "Withdraw must use provider token, wallet risk checks and explicit user confirmation before money leaves Sabi Balance.",
      ),
      continue: walletText(t, "wallet.withdraw.continue", "Continue"),
      confirmTitle: walletText(t, "wallet.withdraw.confirmTitle", "Confirm withdraw to card"),
      kindLocal: walletText(t, "wallet.cards.localCard", "Local Card"),
      kindInternational: walletText(t, "wallet.cards.internationalCard", "International Card"),
      kindLocalGlobal: walletText(t, "wallet.cards.localGlobalCard", "Local + Global"),
      kindVirtual: walletText(t, "wallet.cards.virtualCard", "Virtual Card"),
      usd: walletText(t, "wallet.send.usd", "USD"),
      emptyValue: "—",
    }),
    [t],
  );
}

function getKindLabel(kind: WithdrawDestination["kind"], texts: ReturnType<typeof useWithdrawTexts>) {
  if (kind === "local_international") return texts.kindLocalGlobal;
  if (kind === "international") return texts.kindInternational;
  if (kind === "virtual") return texts.kindVirtual;
  return texts.kindLocal;
}

export default function WalletWithdrawPage() {
  const insets = useSafeAreaInsets();
  const texts = useWithdrawTexts();
  const { snapshot } = useWalletFoundation();
  const primaryCurrencyCode = snapshot.primaryCurrencyCode || "USD";
  const [amount, setAmount] = useState("");
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>("");
  const [note, setNote] = useState("");

  const destinations = LINKED_WITHDRAW_DESTINATIONS;
  const selectedDestination = useMemo(
    () => destinations.find((item) => item.id === selectedDestinationId),
    [selectedDestinationId, destinations],
  );

  const parsedAmount = Number(amount || 0);
  const hasEnoughBalance = parsedAmount > 0 && parsedAmount <= snapshot.mainBalanceUsd;
  const movementGuard = buildWalletMoneyMovementGuard({
    snapshot,
    flow: "withdraw",
    amount: parsedAmount,
    currencyCode: primaryCurrencyCode,
    providerTokenId: selectedDestination?.providerTokenId,
    payload: { providerTokenId: selectedDestination?.providerTokenId },
  });
  const canContinue =
    hasEnoughBalance &&
    Boolean(selectedDestination?.providerTokenId) &&
    selectedDestination?.canWithdraw === true &&
    movementGuard.canPrepare;

  const handleContinue = () => {
    if (!canContinue || !selectedDestination) return;

    router.push({
      pathname: "/wallet/confirm",
      params: {
        flow: "withdraw",
        title: texts.confirmTitle,
        amount: parsedAmount.toFixed(2),
        currency: primaryCurrencyCode,
        sourceTitle: texts.sabiBalance,
        sourceScheme: "SABI",
        sourcePan: "internal_stored_balance",
        destinationTitle: selectedDestination.title,
        destinationType: "external_tokenized_card",
        recipientName: selectedDestination.title,
        recipientHandle: selectedDestination.maskedPan,
        recipientType: selectedDestination.kind,
        note: note.trim(),
        providerTokenId: selectedDestination.providerTokenId,
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
        <WalletSectionTitle title={texts.source} hint={texts.sourceHint} />
        <WalletFormCard>
          <View style={styles.sourceHero}>
            <View style={styles.sourceIconWrap}>
              <Ionicons name="wallet-outline" size={22} color="#FFFFFF" />
            </View>

            <View style={styles.sourceTextWrap}>
              <Text style={styles.sourceTitle}>{texts.sabiBalance}</Text>
              <Text style={styles.sourceSubtitle}>{texts.sourceText}</Text>
            </View>

            <View style={styles.sourceBadge}>
              <Text style={styles.sourceBadgeText}>{texts.storedValue}</Text>
            </View>
          </View>

          <View style={styles.sourceMetaGrid}>
            <MetaItem label={texts.available} value={formatPrimaryWalletAmount(snapshot.mainBalanceUsd, primaryCurrencyCode)} />
            <MetaItem label={texts.withdrawRoute} value={texts.linkedCard} />
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
            {["25", "50", "100", "250"].map((preset) => (
              <Pressable key={preset} style={styles.presetChip} onPress={() => setAmount(preset)}>
                <Text style={styles.presetChipText}>{formatPrimaryWalletAmount(Number(preset), primaryCurrencyCode)}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.helperText}>{texts.helperText}</Text>
        </WalletFormCard>

        <WalletSectionTitle title={texts.destination} hint={texts.destinationHint} />
        <View style={styles.destinationStack}>
          {destinations.length > 0 ? (
            destinations.map((destination) => (
              <WalletSourceAccountCard
                key={destination.id}
                title={destination.title}
                subtitle={destination.subtitle}
                schemeLabel={destination.schemeLabel}
                maskedPan={destination.maskedPan}
                badge={destination.badge}
                selected={selectedDestinationId === destination.id}
                disabled={!destination.canWithdraw}
                onPress={() => setSelectedDestinationId(destination.id)}
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

        <WalletSectionTitle title={texts.destinationDetails} hint={texts.destinationDetailsHint} />
        <WalletFormCard>
          <InfoRow label={texts.destinationLabel} value={selectedDestination?.title ?? texts.emptyValue} />
          <InfoRow label={texts.scheme} value={selectedDestination?.schemeLabel ?? texts.emptyValue} />
          <InfoRow label={texts.maskedCard} value={selectedDestination?.maskedPan ?? texts.emptyValue} />
          <InfoRow
            label={texts.type}
            value={selectedDestination ? getKindLabel(selectedDestination.kind, texts) : texts.emptyValue}
          />
        </WalletFormCard>

        <WalletSectionTitle title={texts.reference} hint={texts.referenceHint} />
        <WalletFormCard>
          <View style={styles.noteInputWrap}>
            <Text style={styles.noteLabel}>{texts.reference}</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={texts.notePlaceholder}
              placeholderTextColor="rgba(255,255,255,0.34)"
              style={styles.textInput}
              multiline
            />
          </View>
        </WalletFormCard>

        <WalletSectionTitle title={texts.securityTitle} hint={texts.destinationDetailsHint} />
        <WalletFormCard>
          <SecurityRow title={texts.securityTitle} text={texts.securityText} />
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
  sourceHero: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 18,
  },
  sourceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  sourceTextWrap: {
    flex: 1,
  },
  sourceTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 5,
  },
  sourceSubtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 18,
  },
  sourceBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sourceBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  sourceMetaGrid: {
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
  destinationStack: {
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
  infoRow: {
    paddingBottom: 12,
    marginBottom: 12,
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
  noteInputWrap: {
    gap: 10,
  },
  noteLabel: {
    color: "#A8B8CF",
    fontSize: 13,
    fontWeight: "700",
  },
  textInput: {
    minHeight: 92,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    textAlignVertical: "top",
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
