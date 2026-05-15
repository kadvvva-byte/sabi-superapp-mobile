import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import WalletScreenShell from "../../src/modules/wallet/components/WalletScreenShell";
import { useI18n } from "../../src/shared/i18n";
import {
  formatPrimaryWalletAmount,
  useWalletFoundation,
} from "../../src/shared/wallet/wallet-foundation";
import {
  buildWalletMoneyMovementGuard,
  isRawCardNumberLike,
  walletMoneyMovementGuardParams,
} from "../../src/shared/wallet/wallet-money-movement";

type WalletSendRouteId =
  | "sabi_to_sabi"
  | "card_to_card"
  | "sabi_to_card"
  | "card_to_sabi";

type WalletSendRoute = {
  id: WalletSendRouteId;
  icon: React.ReactNode;
  fromCard: boolean;
  toCard: boolean;
  flow: string;
  sourceScheme: string;
  destinationType: string;
  titleKey: string;
  subtitleKey: string;
};

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

function normalizeCardReference(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeCardDigits(value: string) {
  return value.replace(/\D/g, "");
}

function maskCardReference(value: string) {
  const cardDigits = normalizeCardDigits(value);
  if (cardDigits.length >= 8) {
    return `•••• ${cardDigits.slice(-4)}`;
  }

  const token = normalizeCardReference(value);
  if (token.length <= 6) return token;
  return `${token.slice(0, 3)}•••${token.slice(-3)}`;
}

function isValidWalletReference(value: string) {
  return normalizeCardReference(value).length >= 3;
}

function isValidCardReference(value: string) {
  const raw = normalizeCardReference(value);
  if (isRawCardNumberLike(raw)) return false;
  return raw.length >= 8;
}

export default function WalletSendPage() {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { snapshot } = useWalletFoundation();

  const primaryCurrencyCode = snapshot.primaryCurrencyCode || "USD";

  const [routeId, setRouteId] = useState<WalletSendRouteId>("sabi_to_sabi");
  const [amount, setAmount] = useState("");
  const [sourceCardReference, setSourceCardReference] = useState("");
  const [recipientReference, setRecipientReference] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [note, setNote] = useState("");

  const texts = useMemo(
    () => ({
      title: walletText(t, "wallet.send.title", "Send money"),
      subtitle: walletText(
        t,
        "wallet.send.subtitle",
        "Choose a secure route before confirmation.",
      ),
      routeTitle: walletText(t, "wallet.send.routeTitle", "Transfer route"),
      routeHint: walletText(t, "wallet.send.routeHint", "Source and destination"),
      sabiToSabi: walletText(t, "wallet.send.sabiToSabi", "Sabi Wallet to Sabi Wallet"),
      sabiToSabiText: walletText(
        t,
        "wallet.send.sabiToSabiText",
        "Internal Wallet transfer by ID, phone or username.",
      ),
      cardToCard: walletText(t, "wallet.send.cardToCard", "Card to card"),
      cardToCardText: walletText(
        t,
        "wallet.send.cardToCardText",
        "Provider-tokenized card transfer with bank confirmation.",
      ),
      sabiToCard: walletText(t, "wallet.send.sabiToCard", "Sabi Wallet to card"),
      sabiToCardText: walletText(
        t,
        "wallet.send.sabiToCardText",
        "Send from Sabi Balance to a linked or recipient card.",
      ),
      cardToSabi: walletText(t, "wallet.send.cardToSabi", "Card to Sabi Wallet"),
      cardToSabiText: walletText(
        t,
        "wallet.send.cardToSabiText",
        "Top up or transfer from a tokenized card to Sabi Wallet.",
      ),
      sourceTitle: walletText(t, "wallet.send.sourceTitle", "Source"),
      sourceHint: walletText(t, "wallet.send.sourceHint", "Funding account"),
      sabiBalance: walletText(t, "wallet.shared.sabiBalance", "Sabi Balance"),
      linkedCard: walletText(t, "wallet.send.linkedCard", "Linked card"),
      linkedCardPlaceholder: walletText(
        t,
        "wallet.send.linkedCardPlaceholder",
        "Select linked card or provider token",
      ),
      chooseCard: walletText(t, "wallet.send.chooseCard", "Choose card"),
      tokenOnlyDetails: walletText(
        t,
        "wallet.send.tokenOnlyDetails",
        "Provider token only. PAN and CVV are not stored by Sabi.",
      ),
      sabiBalanceDetails: walletText(
        t,
        "wallet.send.sabiBalanceDetails",
        "Internal Sabi Wallet balance",
      ),
      available: walletText(t, "wallet.send.available", "Available"),
      amount: walletText(t, "wallet.send.amount", "Amount"),
      amountPlaceholder: walletText(t, "wallet.send.amountPlaceholder", "0.00"),
      destinationTitle: walletText(t, "wallet.send.destinationTitle", "Destination"),
      destinationHint: walletText(t, "wallet.send.destinationHint", "Recipient details"),
      walletRecipient: walletText(t, "wallet.send.walletRecipient", "Wallet recipient"),
      walletRecipientPlaceholder: walletText(
        t,
        "wallet.send.walletRecipientPlaceholder",
        "User ID, phone or @username",
      ),
      cardRecipient: walletText(t, "wallet.send.cardRecipient", "Recipient card"),
      cardRecipientPlaceholder: walletText(
        t,
        "wallet.send.cardRecipientPlaceholder",
        "Card number or provider token",
      ),
      recipientName: walletText(t, "wallet.send.recipientName", "Recipient name"),
      recipientNamePlaceholder: walletText(
        t,
        "wallet.send.recipientNamePlaceholder",
        "Optional name for confirmation",
      ),
      note: walletText(t, "wallet.send.note", "Note"),
      notePlaceholder: walletText(
        t,
        "wallet.send.notePlaceholder",
        "Optional payment note",
      ),
      securityTitle: walletText(t, "wallet.send.securityTitle", "Bank-grade routing"),
      securityHint: walletText(t, "wallet.send.securityHint", "Before confirmation"),
      security1Title: walletText(t, "wallet.send.security1Title", "Token-only cards"),
      security1Text: walletText(
        t,
        "wallet.send.security1Text",
        "Card operations must use bank or provider tokenization.",
      ),
      security2Title: walletText(t, "wallet.send.security2Title", "Secure confirmation"),
      security2Text: walletText(
        t,
        "wallet.send.security2Text",
        "Money movement continues through PIN, biometric or provider confirmation.",
      ),
      security3Title: walletText(t, "wallet.send.security3Title", "Provider-backed balance"),
      security3Text: walletText(
        t,
        "wallet.send.security3Text",
        "This screen reads Sabi Balance from Wallet foundation only.",
      ),
      continue: walletText(t, "wallet.send.continue", "Continue"),
      cardRequired: walletText(t, "wallet.send.cardRequired", "Linked card is required"),
      recipientRequired: walletText(t, "wallet.send.recipientRequired", "Recipient is required"),
      confirmTitle: walletText(t, "wallet.send.confirmTitle", "Confirm transfer"),
      cardRail: walletText(t, "wallet.send.cardRail", "CARD"),
      sabiRail: walletText(t, "wallet.send.sabiRail", "SABI"),
      usd: walletText(t, "wallet.send.usd", "USD"),
    }),
    [t],
  );

  const routes = useMemo<WalletSendRoute[]>(
    () => [
      {
        id: "sabi_to_sabi",
        icon: <Ionicons name="wallet-outline" size={20} color="#FFFFFF" />,
        fromCard: false,
        toCard: false,
        flow: "sabi-wallet-transfer",
        sourceScheme: "SABI",
        destinationType: texts.walletRecipient,
        titleKey: texts.sabiToSabi,
        subtitleKey: texts.sabiToSabiText,
      },
      {
        id: "card_to_card",
        icon: <Ionicons name="card-outline" size={20} color="#FFFFFF" />,
        fromCard: true,
        toCard: true,
        flow: "card-to-card",
        sourceScheme: "CARD",
        destinationType: texts.cardRecipient,
        titleKey: texts.cardToCard,
        subtitleKey: texts.cardToCardText,
      },
      {
        id: "sabi_to_card",
        icon: <MaterialCommunityIcons name="bank-transfer-out" size={21} color="#FFFFFF" />,
        fromCard: false,
        toCard: true,
        flow: "sabi-wallet-to-card",
        sourceScheme: "SABI",
        destinationType: texts.cardRecipient,
        titleKey: texts.sabiToCard,
        subtitleKey: texts.sabiToCardText,
      },
      {
        id: "card_to_sabi",
        icon: <MaterialCommunityIcons name="bank-transfer-in" size={21} color="#FFFFFF" />,
        fromCard: true,
        toCard: false,
        flow: "card-to-sabi-wallet",
        sourceScheme: "CARD",
        destinationType: texts.walletRecipient,
        titleKey: texts.cardToSabi,
        subtitleKey: texts.cardToSabiText,
      },
    ],
    [texts],
  );

  const selectedRoute = routes.find((route) => route.id === routeId) ?? routes[0];
  const parsedAmount = Number(amount || 0);

  const recipientValid = selectedRoute.toCard
    ? isValidCardReference(recipientReference)
    : isValidWalletReference(recipientReference);

  const sourceCardValid = selectedRoute.fromCard
    ? isValidCardReference(sourceCardReference)
    : true;

  const providerTokenId = selectedRoute.fromCard ? normalizeCardReference(sourceCardReference) : undefined;
  const movementGuard = buildWalletMoneyMovementGuard({
    snapshot,
    flow: selectedRoute.flow,
    amount: parsedAmount,
    currencyCode: primaryCurrencyCode,
    providerTokenId,
    payload: {
      flow: selectedRoute.flow,
      sourceCardReference: selectedRoute.fromCard ? providerTokenId : undefined,
      recipientReference: selectedRoute.toCard ? normalizeCardReference(recipientReference) : undefined,
    },
  });

  const canContinue = recipientValid && sourceCardValid && movementGuard.canPrepare;
  const headerTop = Math.max(insets.top, 10);

  const sourceTitle = selectedRoute.fromCard ? texts.linkedCard : texts.sabiBalance;
  const sourceDetails = selectedRoute.fromCard
    ? texts.tokenOnlyDetails
    : texts.sabiBalanceDetails;
  const recipientDisplay = selectedRoute.toCard
    ? maskCardReference(recipientReference)
    : normalizeCardReference(recipientReference);
  const displayRecipientName = recipientName.trim() || recipientDisplay || texts.destinationTitle;

  const handleContinue = () => {
    if (!canContinue) return;

    router.push({
      pathname: "/wallet/confirm",
      params: {
        flow: selectedRoute.flow,
        title: texts.confirmTitle,
        amount: parsedAmount.toFixed(2),
        currency: primaryCurrencyCode,
        recipientName: displayRecipientName,
        recipientHandle: recipientDisplay,
        recipientType: selectedRoute.destinationType,
        destinationTitle: selectedRoute.toCard ? texts.cardRecipient : texts.walletRecipient,
        destinationType: selectedRoute.titleKey,
        note: note.trim(),
        sourceTitle,
        sourceScheme: selectedRoute.sourceScheme === "CARD" ? texts.cardRail : texts.sabiRail,
        sourcePan: sourceDetails,
        providerTokenId: providerTokenId || "",
        ...walletMoneyMovementGuardParams(movementGuard),
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
        <SectionRow title={texts.routeTitle} hint={texts.routeHint} />

        <View style={styles.routeGrid}>
          {routes.map((route) => {
            const active = route.id === routeId;

            return (
              <Pressable
                key={route.id}
                onPress={() => setRouteId(route.id)}
                style={[styles.routeCard, active && styles.routeCardActive]}
              >
                <View style={styles.routeIconWrap}>{route.icon}</View>
                <Text style={styles.routeTitle}>{route.titleKey}</Text>
                <Text style={styles.routeText}>{route.subtitleKey}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <View style={styles.sourceHero}>
            <View style={styles.sourceIconWrap}>
              {selectedRoute.fromCard ? (
                <Ionicons name="card-outline" size={22} color="#FFFFFF" />
              ) : (
                <Ionicons name="wallet-outline" size={22} color="#FFFFFF" />
              )}
            </View>

            <View style={styles.sourceTextWrap}>
              <Text style={styles.sourceTitle}>{sourceTitle}</Text>
              <Text style={styles.sourceSubtitle}>{sourceDetails}</Text>
            </View>
          </View>

          {selectedRoute.fromCard ? (
            <>
              <Text style={styles.fieldLabel}>{texts.linkedCard}</Text>
              <View style={styles.inlineFieldRow}>
                <TextInput
                  value={sourceCardReference}
                  onChangeText={setSourceCardReference}
                  placeholder={texts.linkedCardPlaceholder}
                  placeholderTextColor="rgba(255,255,255,0.34)"
                  style={styles.inlineInput}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => router.push("/wallet/cards" as never)}
                  style={styles.inlineButton}
                >
                  <Text style={styles.inlineButtonText}>{texts.chooseCard}</Text>
                </Pressable>
              </View>
              {!sourceCardValid ? <Text style={styles.validationText}>{texts.cardRequired}</Text> : null}
            </>
          ) : (
            <View style={styles.sourceMetaGrid}>
              <MetaItem label={texts.available} value={formatPrimaryWalletAmount(snapshot.mainBalanceUsd, primaryCurrencyCode)} />
              <MetaItem label={texts.sourceHint} value={texts.sabiRail} />
              <MetaItem label={texts.securityHint} value={texts.sabiBalance} />
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>{texts.amount}</Text>
          <TextInput
            value={amount}
            onChangeText={(next) => setAmount(normalizeAmountInput(next))}
            placeholder={texts.amountPlaceholder}
            placeholderTextColor="rgba(255,255,255,0.34)"
            style={styles.amountInput}
            keyboardType="decimal-pad"
          />

          <View style={styles.quickAmountsRow}>
            {["10", "25", "50", "100"].map((preset) => (
              <Pressable
                key={preset}
                style={styles.presetChip}
                onPress={() => setAmount(preset)}
              >
                <Text style={styles.presetChipText}>{formatPrimaryWalletAmount(Number(preset), primaryCurrencyCode)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <SectionRow title={texts.destinationTitle} hint={texts.destinationHint} compact />

          <Text style={styles.fieldLabel}>
            {selectedRoute.toCard ? texts.cardRecipient : texts.walletRecipient}
          </Text>
          <TextInput
            value={recipientReference}
            onChangeText={setRecipientReference}
            placeholder={
              selectedRoute.toCard
                ? texts.cardRecipientPlaceholder
                : texts.walletRecipientPlaceholder
            }
            placeholderTextColor="rgba(255,255,255,0.34)"
            style={styles.textInput}
            autoCapitalize="none"
            keyboardType={selectedRoute.toCard ? "number-pad" : "default"}
          />
          {!recipientValid ? <Text style={styles.validationText}>{texts.recipientRequired}</Text> : null}

          <Text style={[styles.fieldLabel, styles.fieldLabelWithTop]}>{texts.recipientName}</Text>
          <TextInput
            value={recipientName}
            onChangeText={setRecipientName}
            placeholder={texts.recipientNamePlaceholder}
            placeholderTextColor="rgba(255,255,255,0.34)"
            style={styles.textInput}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>{texts.note}</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={texts.notePlaceholder}
            placeholderTextColor="rgba(255,255,255,0.34)"
            style={styles.noteInput}
            multiline
          />
        </View>

        <View style={styles.card}>
          <SectionRow title={texts.securityTitle} hint={texts.securityHint} compact />
          <SecurityRow title={texts.security1Title} text={texts.security1Text} />
          <SecurityRow title={texts.security2Title} text={texts.security2Text} />
          <SecurityRow title={texts.security3Title} text={texts.security3Text} />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable
          onPress={handleContinue}
          disabled={!canContinue}
          style={[styles.bottomButton, !canContinue && styles.bottomButtonDisabled]}
        >
          <Text style={styles.bottomButtonText}>{texts.continue}</Text>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "#060F19",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    zIndex: 10,
    elevation: 10,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(20,32,58,0.94)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextWrap: {
    flex: 1,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 5,
  },

  headerSubtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 18,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 138,
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionRowCompact: {
    marginBottom: 14,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  sectionHint: {
    color: "rgba(255,255,255,0.56)",
    fontSize: 12,
    fontWeight: "700",
  },

  routeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },

  routeCard: {
    width: "47.5%",
    minHeight: 140,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(20,32,58,0.94)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  routeCardActive: {
    borderColor: "rgba(142,197,255,0.42)",
    backgroundColor: "rgba(35,82,184,0.18)",
  },

  routeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
  },

  routeTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    marginBottom: 7,
  },

  routeText: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },

  card: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: "rgba(20,32,58,0.94)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 16,
  },

  sourceHero: {
    flexDirection: "row",
    alignItems: "center",
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
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },

  fieldLabel: {
    color: "#A8B8CF",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 9,
  },

  fieldLabelWithTop: {
    marginTop: 14,
  },

  inlineFieldRow: {
    flexDirection: "row",
    gap: 10,
  },

  inlineInput: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  inlineButton: {
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(47,107,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(79,136,255,0.42)",
  },

  inlineButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  amountInput: {
    minHeight: 58,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    color: "#FFFFFF",
    fontSize: 24,
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

  textInput: {
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  noteInput: {
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

  validationText: {
    color: "#FFB8C4",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },

  securityRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
  },

  securityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#8EC5FF",
    marginTop: 5,
  },

  securityTextWrap: {
    flex: 1,
  },

  securityTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },

  securityText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },

  bottomSpacer: {
    height: 4,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "#060F19",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },

  bottomButton: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F6BFF",
    borderWidth: 1,
    borderColor: "#4F88FF",
  },

  bottomButtonDisabled: {
    opacity: 0.55,
  },

  bottomButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});
