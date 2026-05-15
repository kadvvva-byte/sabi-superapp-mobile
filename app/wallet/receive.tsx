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
import { useI18n } from "../../src/shared/i18n";
import {
  formatPrimaryWalletAmount,
  useWalletFoundation,
} from "../../src/shared/wallet/wallet-foundation";
import {
  buildWalletMoneyMovementGuard,
  walletMoneyMovementGuardParams,
} from "../../src/shared/wallet/wallet-money-movement";

type ReceiveMode = "user" | "business" | "merchant";

type ReceiveModeItem = {
  id: ReceiveMode;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
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

function useReceiveTexts() {
  const { t } = useI18n();

  return useMemo(
    () => ({
      title: walletText(t, "wallet.receive.title", "Receive"),
      subtitle: walletText(
        t,
        "wallet.receive.subtitle",
        "Prepare a request into Sabi Balance through verified account routing.",
      ),
      destination: walletText(t, "wallet.receive.destination", "Destination"),
      destinationHint: walletText(t, "wallet.receive.destinationHint", "Internal balance"),
      sabiBalance: walletText(t, "wallet.shared.sabiBalance", "Sabi Balance"),
      destinationText: walletText(
        t,
        "wallet.receive.destinationText",
        "Internal electronic money destination for incoming transfers and future QR receive flows.",
      ),
      receiveBadge: walletText(t, "wallet.receive.receiveBadge", "Receive"),
      walletRail: walletText(t, "wallet.receive.walletRail", "Wallet rail"),
      sabiInternal: walletText(t, "wallet.receive.sabiInternal", "Sabi Internal"),
      speed: walletText(t, "wallet.receive.speed", "Speed"),
      instant: walletText(t, "wallet.receive.instant", "Instant"),
      status: walletText(t, "wallet.receive.status", "Status"),
      active: walletText(t, "wallet.receive.active", "Active"),
      expectedAmount: walletText(t, "wallet.receive.expectedAmount", "Expected amount"),
      expectedAmountHint: walletText(t, "wallet.receive.expectedAmountHint", "Request value"),
      helperText: walletText(
        t,
        "wallet.receive.helperText",
        "Receive creates an inbound request into Sabi Balance and requires payer confirmation.",
      ),
      incomingSource: walletText(t, "wallet.receive.incomingSource", "Incoming source"),
      incomingSourceHint: walletText(t, "wallet.receive.incomingSourceHint", "Inside system"),
      fromUser: walletText(t, "wallet.receive.fromUser", "From user"),
      fromUserText: walletText(t, "wallet.receive.fromUserText", "Receive internal transfer from another Sabi user."),
      fromBusiness: walletText(t, "wallet.receive.fromBusiness", "From business"),
      fromBusinessText: walletText(
        t,
        "wallet.receive.fromBusinessText",
        "Receive payout or transfer from a business wallet route.",
      ),
      fromMerchant: walletText(t, "wallet.receive.fromMerchant", "From merchant"),
      fromMerchantText: walletText(
        t,
        "wallet.receive.fromMerchantText",
        "Receive settlement or merchant-origin transfer through merchant routing.",
      ),
      receiveRoute: walletText(t, "wallet.receive.receiveRoute", "Receive route"),
      receiveRouteHint: walletText(t, "wallet.receive.receiveRouteHint", "Verified account"),
      internalRoute: walletText(t, "wallet.receive.internalRoute", "Verified Sabi account route"),
      mode: walletText(t, "wallet.receive.mode", "Mode"),
      userInbound: walletText(t, "wallet.receive.userInbound", "User inbound"),
      businessInbound: walletText(t, "wallet.receive.businessInbound", "Business inbound"),
      merchantInbound: walletText(t, "wallet.receive.merchantInbound", "Merchant inbound"),
      reference: walletText(t, "wallet.receive.reference", "Reference"),
      referenceHint: walletText(t, "wallet.receive.referenceHint", "Optional note"),
      referencePlaceholder: walletText(
        t,
        "wallet.receive.referencePlaceholder",
        "Invoice, order, reimbursement, daily transfer...",
      ),
      securityTitle: walletText(t, "wallet.receive.securityTitle", "Confirmed income only"),
      securityHint: walletText(t, "wallet.receive.securityHint", "Request only"),
      securityText: walletText(
        t,
        "wallet.receive.securityText",
        "This screen creates only a request route. Balance is credited only after real payment confirmation.",
      ),
      continue: walletText(t, "wallet.receive.continue", "Continue"),
      confirmTitle: walletText(t, "wallet.receive.confirmTitle", "Confirm receive request"),
      usd: walletText(t, "wallet.send.usd", "USD"),
    }),
    [t],
  );
}

export default function WalletReceivePage() {
  const insets = useSafeAreaInsets();
  const texts = useReceiveTexts();
  const { snapshot } = useWalletFoundation();
  const primaryCurrencyCode = snapshot.primaryCurrencyCode || "USD";
  const [amount, setAmount] = useState("");
  const [selectedMode, setSelectedMode] = useState<ReceiveMode>("user");
  const [reference, setReference] = useState("");

  const receiveModes = useMemo<ReceiveModeItem[]>(
    () => [
      {
        id: "user",
        iconName: "account-outline",
        title: texts.fromUser,
        subtitle: texts.fromUserText,
      },
      {
        id: "business",
        iconName: "briefcase-outline",
        title: texts.fromBusiness,
        subtitle: texts.fromBusinessText,
      },
      {
        id: "merchant",
        iconName: "storefront-outline",
        title: texts.fromMerchant,
        subtitle: texts.fromMerchantText,
      },
    ],
    [texts],
  );

  const parsedAmount = Number(amount || 0);
  const movementGuard = buildWalletMoneyMovementGuard({
    snapshot,
    flow: selectedMode === "business" ? "business-receive" : selectedMode === "merchant" ? "merchant-receive" : "receive",
    amount: parsedAmount,
    currencyCode: primaryCurrencyCode,
    payload: { selectedMode },
  });
  const canContinue = movementGuard.canPrepare;

  const selectedModeLabel =
    selectedMode === "business"
      ? texts.businessInbound
      : selectedMode === "merchant"
        ? texts.merchantInbound
        : texts.userInbound;

  const handleContinue = () => {
    if (!canContinue) return;

    router.push({
      pathname: "/wallet/confirm",
      params: {
        flow: "receive",
        title: texts.confirmTitle,
        amount: parsedAmount.toFixed(2),
        currency: primaryCurrencyCode,
        destinationTitle: texts.sabiBalance,
        destinationType: "internal_stored_value",
        recipientName: texts.sabiBalance,
        recipientHandle: "verified_account_route",
        recipientType: selectedMode,
        note: reference.trim(),
        sourceTitle: selectedModeLabel,
        sourceScheme: "SABI",
        sourcePan: "verified_account_route",
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
              <Text style={styles.destinationBadgeText}>{texts.receiveBadge}</Text>
            </View>
          </View>

          <View style={styles.destinationMetaGrid}>
            <MetaItem label={texts.walletRail} value={texts.sabiInternal} />
            <MetaItem label={texts.speed} value={texts.instant} />
            <MetaItem label={texts.status} value={texts.active} />
          </View>
        </WalletFormCard>

        <WalletSectionTitle title={texts.expectedAmount} hint={texts.expectedAmountHint} />
        <WalletFormCard>
          <WalletAmountInput
            value={amount}
            onChangeText={(next) => setAmount(normalizeAmountInput(next))}
            currency={primaryCurrencyCode}
            placeholder="0"
          />

          <View style={styles.quickAmountsRow}>
            {["10", "25", "50", "100"].map((preset) => (
              <Pressable key={preset} style={styles.presetChip} onPress={() => setAmount(preset)}>
                <Text style={styles.presetChipText}>{formatPrimaryWalletAmount(Number(preset), primaryCurrencyCode)}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.helperText}>{texts.helperText}</Text>
        </WalletFormCard>

        <WalletSectionTitle title={texts.incomingSource} hint={texts.incomingSourceHint} />
        <View style={styles.stack}>
          {receiveModes.map((item) => {
            const active = selectedMode === item.id;

            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedMode(item.id)}
                style={[styles.optionCard, active && styles.optionCardActive]}
              >
                <View style={styles.optionIconWrap}>
                  <MaterialCommunityIcons name={item.iconName} size={20} color="#FFFFFF" />
                </View>

                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                  <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                </View>

                <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                  {active ? <View style={styles.radioInner} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <WalletSectionTitle title={texts.receiveRoute} hint={texts.receiveRouteHint} />
        <WalletFormCard>
          <InfoRow label={texts.receiveRoute} value={texts.internalRoute} />
          <InfoRow label={texts.mode} value={selectedModeLabel} />
          <InfoRow label={texts.destination} value={texts.sabiBalance} />
        </WalletFormCard>

        <WalletSectionTitle title={texts.reference} hint={texts.referenceHint} />
        <WalletFormCard>
          <View style={styles.noteInputWrap}>
            <Text style={styles.noteLabel}>{texts.reference}</Text>
            <TextInput
              value={reference}
              onChangeText={setReference}
              placeholder={texts.referencePlaceholder}
              placeholderTextColor="rgba(255,255,255,0.34)"
              style={styles.textInput}
              multiline
            />
          </View>
        </WalletFormCard>

        <WalletSectionTitle title={texts.securityTitle} hint={texts.securityHint} />
        <WalletFormCard>
          <SecurityRow title={texts.securityTitle} text={texts.securityText} />
        </WalletFormCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <WalletBottomActionBar
        primaryLabel={texts.continue}
        onPrimaryPress={handleContinue}
        primaryDisabled={!canContinue}
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
  stack: {
    gap: 12,
  },
  optionCard: {
    minHeight: 82,
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(20,32,58,0.94)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  optionCardActive: {
    borderColor: "rgba(110,155,255,0.55)",
    backgroundColor: "rgba(37,69,128,0.70)",
  },
  optionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 5,
  },
  optionSubtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    lineHeight: 18,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.28)",
  },
  radioOuterActive: {
    borderColor: "#74F0C7",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#74F0C7",
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
