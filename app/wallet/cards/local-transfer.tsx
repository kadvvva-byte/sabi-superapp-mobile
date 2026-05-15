import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  CreditCard,
  Landmark,
  ShieldCheck,
  WalletCards,
} from "lucide-react-native";

import WalletBottomActionBar from "../../../src/modules/wallet/components/WalletBottomActionBar";
import WalletScreenShell from "../../../src/modules/wallet/components/WalletScreenShell";
import WalletScrollScreen from "../../../src/modules/wallet/components/WalletScrollScreen";
import { useI18n } from "../../../src/shared/i18n";
import { useWalletFoundation } from "../../../src/shared/wallet/wallet-foundation";
import { useSabiTheme } from "../../../src/theme/ThemeProvider";

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

function normalizeReference(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeCardDigits(value: string) {
  return value.replace(/\D/g, "");
}

function maskCardReference(value: string) {
  const digits = normalizeCardDigits(value);
  if (digits.length >= 8) return `•••• ${digits.slice(-4)}`;

  const token = normalizeReference(value);
  if (token.length <= 8) return token;
  return `${token.slice(0, 4)}•••${token.slice(-4)}`;
}

function isValidCardReference(value: string) {
  const reference = normalizeReference(value);
  const digits = normalizeCardDigits(reference);
  if (digits.length >= 12 && digits.length <= 19) return true;
  return reference.length >= 8;
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

function HeroBadge({
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
        styles.heroBadge,
        {
          backgroundColor: colors.cardSoft,
          borderColor: colors.border,
          borderRadius: radius,
        },
      ]}
    >
      <Text style={[styles.heroBadgeText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}

export default function WalletLocalTransferScreen() {
  const { colors, radius } = useSabiTheme();
  const { t } = useI18n();
  const { snapshot } = useWalletFoundation();
  const params = useLocalSearchParams<{ recipientCard?: string }>();

  const providerConnected = false;
  const localCurrencyCode = snapshot.localCurrencyCode;

  const [sourceCardReference, setSourceCardReference] = useState("");
  const [recipientCard, setRecipientCard] = useState(
    typeof params.recipientCard === "string" ? normalizeReference(params.recipientCard) : "",
  );
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const texts = useMemo(
    () => ({
      eyebrow: walletText(t, "wallet.localTransfer.eyebrow", "LOCAL TRANSFER"),
      title: walletText(t, "wallet.localTransfer.title", "Card to Card"),
      subtitle: walletText(
        t,
        "wallet.localTransfer.subtitle",
        "Domestic card-to-card route through a connected bank or payment provider.",
      ),
      heroTitle: walletText(t, "wallet.localTransfer.heroTitle", "Provider-backed local transfer"),
      heroText: walletText(
        t,
        "wallet.localTransfer.heroText",
        "Local card flow uses provider tokenization, provider OTP and wallet risk checks. Raw card data stays inside the bank/provider flow.",
      ),
      localCard: walletText(t, "wallet.cards.localCard", "Local Card"),
      cardToCard: walletText(t, "wallet.localCards.cardToCard", "Card to Card"),
      otpProtected: walletText(t, "wallet.localCards.otpProtected", "OTP protected"),
      transferFrom: walletText(t, "wallet.localTransfer.transferFrom", "Transfer from"),
      sourceHint: walletText(t, "wallet.localTransfer.sourceHint", "Tokenized source card"),
      sourceLabel: walletText(t, "wallet.localTransfer.sourceLabel", "Source card token"),
      sourcePlaceholder: walletText(
        t,
        "wallet.localTransfer.sourcePlaceholder",
        "Select linked card or provider token",
      ),
      recipientTitle: walletText(t, "wallet.localTransfer.recipientTitle", "Recipient"),
      recipientHint: walletText(t, "wallet.localTransfer.recipientHint", "Destination card route"),
      recipientLabel: walletText(t, "wallet.localTransfer.recipientLabel", "Recipient card or token"),
      recipientPlaceholder: walletText(
        t,
        "wallet.localTransfer.recipientPlaceholder",
        "Card number or provider token",
      ),
      amountTitle: walletText(t, "wallet.localTransfer.amountTitle", "Amount"),
      amountHint: walletText(t, "wallet.localTransfer.amountHint", "Local currency"),
      amountPlaceholder: walletText(t, "wallet.localTransfer.amountPlaceholder", "0.00"),
      noteLabel: walletText(t, "wallet.localTransfer.noteLabel", "Note"),
      notePlaceholder: walletText(t, "wallet.localTransfer.notePlaceholder", "Optional transfer note"),
      selectedSource: walletText(t, "wallet.localTransfer.selectedSource", "Selected source"),
      selectedRecipient: walletText(t, "wallet.localTransfer.selectedRecipient", "Selected recipient"),
      notConfigured: walletText(t, "wallet.currency.notConfigured", "Not configured"),
      providerTitle: walletText(t, "wallet.localTransfer.providerTitle", "Provider not configured"),
      providerText: walletText(
        t,
        "wallet.localTransfer.providerText",
        "Connect a local bank/provider route before requesting OTP or executing local card transfers.",
      ),
      currencyTitle: walletText(t, "wallet.localTransfer.currencyTitle", "Local currency required"),
      currencyText: walletText(
        t,
        "wallet.localTransfer.currencyText",
        "Choose local currency in Wallet Settings before preparing domestic local card routes.",
      ),
      notesTitle: walletText(t, "wallet.localTransfer.notesTitle", "Local transfer notes"),
      notesHint: walletText(t, "wallet.localTransfer.notesHint", "Important"),
      otpTitle: walletText(t, "wallet.localTransfer.otpTitle", "OTP by provider"),
      otpText: walletText(
        t,
        "wallet.localTransfer.otpText",
        "OTP must be issued and verified by the connected bank/payment provider. This screen accepts only provider-verified OTP results.",
      ),
      localOnlyTitle: walletText(t, "wallet.localTransfer.localOnlyTitle", "Local flow only"),
      localOnlyText: walletText(
        t,
        "wallet.localTransfer.localOnlyText",
        "This route is separated from international card routing and uses the configured local currency.",
      ),
      cardsHub: walletText(t, "wallet.localTransfer.cardsHub", "Cards Hub"),
      continue: walletText(t, "wallet.send.continue", "Continue"),
    }),
    [t],
  );

  const sourceValid = useMemo(() => isValidCardReference(sourceCardReference), [sourceCardReference]);
  const recipientValid = useMemo(() => isValidCardReference(recipientCard), [recipientCard]);
  const amountValid = useMemo(() => {
    const value = Number(amount);
    return Number.isFinite(value) && value > 0;
  }, [amount]);

  const canContinue = providerConnected && Boolean(localCurrencyCode) && sourceValid && recipientValid && amountValid;

  const handleContinue = () => {
    if (!canContinue) return;

    router.push({
      pathname: "/wallet/confirm" as never,
      params: {
        flow: "local-card-to-card",
        title: texts.title,
        subtitle: texts.subtitle,
        recipientName: maskCardReference(recipientCard),
        amount,
        currency: localCurrencyCode,
        source: maskCardReference(sourceCardReference),
        note: note.trim(),
        reference: "LOCAL-CARD-PROVIDER",
        next: "/wallet/pin-confirm",
        returnTo: "/wallet/cards/local-transfer",
      },
    });
  };

  return (
    <WalletScreenShell>
      <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.iconButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.lg,
            },
          ]}
        >
          <ArrowLeft size={18} color={colors.text} />
        </Pressable>

        <View style={styles.fixedHeaderTextWrap}>
          <Text style={[styles.fixedEyebrow, { color: colors.accent }]}>{texts.eyebrow}</Text>
          <Text style={[styles.fixedTitle, { color: colors.text }]}>{texts.title}</Text>
        </View>
      </View>

      <WalletScrollScreen bottomInsetExtra={92} contentContainerStyle={styles.content}>
        <Text style={[styles.subtitleTop, { color: colors.textSecondary }]}>{texts.subtitle}</Text>

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
          <View style={styles.heroGlowA} />
          <View style={styles.heroGlowB} />
          <View style={styles.heroShine} />

          <View style={styles.heroTopRow}>
            <View
              style={[
                styles.heroIconWrap,
                {
                  backgroundColor: colors.cardSoft,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                },
              ]}
            >
              <Landmark size={22} color={colors.text} />
            </View>

            <View style={styles.heroTextWrap}>
              <Text style={[styles.heroTitle, { color: colors.text }]}>{texts.heroTitle}</Text>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>{texts.heroText}</Text>
            </View>
          </View>

          <View style={styles.heroBadges}>
            <HeroBadge label={texts.localCard} colors={colors} radius={radius.lg} />
            <HeroBadge label={texts.cardToCard} colors={colors} radius={radius.lg} />
            <HeroBadge label={texts.otpProtected} colors={colors} radius={radius.lg} />
          </View>
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <SectionHeader title={texts.transferFrom} hint={texts.sourceHint} colors={colors} />

          <Text style={[styles.fieldLabel, { color: colors.text }]}>{texts.sourceLabel}</Text>
          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: colors.cardSoft,
                borderColor: sourceValid ? colors.accent : colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <TextInput
              value={sourceCardReference}
              onChangeText={setSourceCardReference}
              placeholder={texts.sourcePlaceholder}
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text }]}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {sourceValid ? (
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              {texts.selectedSource}: {maskCardReference(sourceCardReference)}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <SectionHeader title={texts.recipientTitle} hint={texts.recipientHint} colors={colors} />

          <Text style={[styles.fieldLabel, { color: colors.text }]}>{texts.recipientLabel}</Text>
          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: colors.cardSoft,
                borderColor: recipientValid ? colors.accent : colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <TextInput
              value={recipientCard}
              onChangeText={setRecipientCard}
              placeholder={texts.recipientPlaceholder}
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text }]}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {recipientValid ? (
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              {texts.selectedRecipient}: {maskCardReference(recipientCard)}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <SectionHeader title={texts.amountTitle} hint={localCurrencyCode || texts.notConfigured} colors={colors} />

          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: colors.cardSoft,
                borderColor: amountValid ? colors.accent : colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <TextInput
              value={amount}
              onChangeText={(value) => setAmount(normalizeAmountInput(value))}
              keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
              placeholder={texts.amountPlaceholder}
              placeholderTextColor={colors.textSecondary}
              style={[styles.amountInput, { color: colors.text }]}
            />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.text }]}>{texts.noteLabel}</Text>
          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: colors.cardSoft,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={texts.notePlaceholder}
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text }]}
            />
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
          <SectionHeader title={texts.notesTitle} hint={texts.notesHint} colors={colors} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <ShieldCheck size={18} color={colors.text} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>{texts.providerTitle}</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>{texts.providerText}</Text>
            </View>
          </View>

          <Divider color={colors.border} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <CreditCard size={18} color={colors.text} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>{texts.currencyTitle}</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>{texts.currencyText}</Text>
            </View>
          </View>

          <Divider color={colors.border} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <WalletCards size={18} color={colors.text} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>{texts.otpTitle}</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>{texts.otpText}</Text>
            </View>
          </View>
        </View>
      </WalletScrollScreen>

      <WalletBottomActionBar
        secondaryLabel={texts.cardsHub}
        onSecondaryPress={() => router.replace("/wallet/cards" as never)}
        primaryLabel={texts.continue}
        onPrimaryPress={handleContinue}
        primaryDisabled={!canContinue}
      />
    </WalletScreenShell>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    minHeight: 82,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fixedHeaderTextWrap: { flex: 1 },
  fixedEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.3,
    marginBottom: 3,
  },
  fixedTitle: {
    fontSize: 22,
    fontWeight: "900",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 96,
  },
  subtitleTop: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
    overflow: "hidden",
    position: "relative",
  },
  heroGlowA: {
    position: "absolute",
    top: -18,
    left: -18,
    width: 180,
    height: 135,
    borderRadius: 44,
    backgroundColor: "rgba(61,121,255,0.18)",
  },
  heroGlowB: {
    position: "absolute",
    right: -26,
    bottom: -28,
    width: 210,
    height: 150,
    borderRadius: 60,
    backgroundColor: "rgba(124,68,242,0.12)",
  },
  heroShine: {
    position: "absolute",
    top: -50,
    right: 38,
    width: 92,
    height: 280,
    backgroundColor: "rgba(255,255,255,0.06)",
    transform: [{ rotate: "22deg" }],
  },
  heroTopRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    marginBottom: 16,
    zIndex: 2,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTextWrap: { flex: 1 },
  heroTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  heroBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    zIndex: 2,
  },
  heroBadge: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  sectionCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: "700",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
  },
  inputBox: {
    minHeight: 54,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: "center",
    marginBottom: 10,
  },
  input: {
    fontSize: 14,
    fontWeight: "600",
  },
  amountInput: {
    fontSize: 28,
    fontWeight: "900",
    paddingVertical: 0,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 4,
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
  infoTextWrap: { flex: 1 },
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
