import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import WalletScreenShell from "../../../src/modules/wallet/components/WalletScreenShell";
import { WalletHeader } from "../../../src/modules/wallet/components/WalletHeader";
import { WalletFormCard } from "../../../src/modules/wallet/components/WalletFormCard";
import { useI18n } from "../../../src/shared/i18n";
import {
  formatLocalWalletAmount,
  useWalletFoundation,
} from "../../../src/shared/wallet/wallet-foundation";

function walletText(
  t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string,
  key: string,
  fallback: string,
) {
  const value = t(key);
  return value && value !== key ? value : fallback;
}

function ScopeRow({ label, value, warning }: { label: string; value: string; warning?: boolean }) {
  return (
    <View style={styles.scopeRow}>
      <Text style={styles.scopeLabel}>{label}</Text>
      <Text style={[styles.scopeValue, warning && styles.warningValue]}>{value}</Text>
    </View>
  );
}

export default function LocalCardsScreen() {
  const { t } = useI18n();
  const { snapshot } = useWalletFoundation();

  const localCurrencyConfigured = Boolean(snapshot.localCurrencyCode);
  const providerConnected = false;

  const texts = useMemo(
    () => ({
      title: walletText(t, "wallet.localCards.title", "Local cards"),
      subtitle: walletText(
        t,
        "wallet.localCards.subtitle",
        "Domestic card layer with provider-tokenized local card routes.",
      ),
      balanceTitle: walletText(t, "wallet.localCards.balanceTitle", "Local wallet balance"),
      balanceCaption: walletText(t, "wallet.localCards.balanceCaption", "Available local balance"),
      providerPending: walletText(t, "wallet.localCards.providerPending", "Provider not configured"),
      providerText: walletText(
        t,
        "wallet.localCards.providerText",
        "Connect a local bank or payment provider before live local card binding, card-to-card transfer and balance sync.",
      ),
      noCardTitle: walletText(t, "wallet.localCards.noCardTitle", "No local cards yet"),
      noCardText: walletText(
        t,
        "wallet.localCards.noCardText",
        "Local cards appear only after secure provider binding returns a verified token. Raw card data stays inside the bank/provider flow.",
      ),
      localCard: walletText(t, "wallet.cards.localCard", "Local Card"),
      domesticPayments: walletText(t, "wallet.localCards.domesticPayments", "Domestic payments"),
      otpProtected: walletText(t, "wallet.localCards.otpProtected", "OTP protected"),
      actions: walletText(t, "wallet.localCards.actions", "Actions"),
      addCard: walletText(t, "wallet.cards.addCard", "Add card"),
      cardToCard: walletText(t, "wallet.localCards.cardToCard", "Card to Card"),
      recipients: walletText(t, "wallet.localCards.recipients", "Recipients"),
      scope: walletText(t, "wallet.localCards.scope", "Current scope"),
      currency: walletText(t, "wallet.localCards.currency", "Currency"),
      localCurrency: walletText(t, "wallet.settings.localCurrency", "Local currency"),
      notConfigured: walletText(t, "wallet.currency.notConfigured", "Not configured"),
      payments: walletText(t, "wallet.localCards.payments", "Payments"),
      domesticOnly: walletText(t, "wallet.localCards.domesticOnly", "Domestic only"),
      verification: walletText(t, "wallet.localCards.verification", "Verification"),
      otpProvider: walletText(t, "wallet.localCards.otpProvider", "Provider OTP"),
      sabiBalanceTopup: walletText(t, "wallet.localCards.sabiBalanceTopup", "Sabi Balance top up"),
      providerControlled: walletText(t, "wallet.localCards.providerControlled", "Provider controlled"),
      cardSettings: walletText(t, "wallet.localCards.cardSettings", "Card settings"),
      tokenOnly: walletText(t, "wallet.localCards.tokenOnly", "Token-only after binding"),
      settings: walletText(t, "wallet.settings.title", "Wallet Settings"),
    }),
    [t],
  );

  const localBalance = useMemo(
    () => formatLocalWalletAmount(snapshot.localBalance, snapshot.localCurrencyCode),
    [snapshot.localBalance, snapshot.localCurrencyCode],
  );

  return (
    <WalletScreenShell>
      <View style={styles.fixedHeader}>
        <WalletHeader title={texts.title} subtitle={texts.subtitle} bottomOffset={0} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <WalletFormCard>
          <Text style={styles.sectionLabel}>{texts.balanceTitle}</Text>

          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTextWrap}>
                <Text style={styles.cardTitle}>{texts.localCard}</Text>
                <Text style={styles.cardSubtitle}>{texts.providerPending}</Text>
              </View>

              <View style={styles.iconWrap}>
                <MaterialCommunityIcons
                  name="credit-card-chip-outline"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{texts.localCurrency}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{texts.domesticPayments}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{texts.otpProtected}</Text>
              </View>
            </View>

            <View style={styles.balanceWrap}>
              <Text style={styles.balanceCaption}>{texts.balanceCaption}</Text>
              <Text style={styles.balanceValue}>{localBalance}</Text>
            </View>

            <View style={styles.noteBox}>
              <Text style={styles.noteTitle}>{texts.noCardTitle}</Text>
              <Text style={styles.noteText}>{texts.noCardText}</Text>
            </View>

            <View style={styles.noteBoxAlt}>
              <Text style={styles.noteTitle}>{texts.providerPending}</Text>
              <Text style={styles.noteText}>{texts.providerText}</Text>
            </View>
          </View>
        </WalletFormCard>

        <WalletFormCard>
          <Text style={styles.sectionLabel}>{texts.actions}</Text>

          <View style={styles.actionsColumn}>
            <Pressable style={styles.secondaryButton} onPress={() => router.push("/wallet/cards/add" as never)}>
              <View style={styles.secondaryButtonIcon}>
                <Ionicons name="add" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.secondaryButtonText}>{texts.addCard}</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={() => router.push("/wallet/cards/local-transfer" as never)}>
              <View style={styles.secondaryButtonIcon}>
                <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.secondaryButtonText}>{texts.cardToCard}</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={() => router.push("/wallet/cards/local-recipients" as never)}>
              <View style={styles.secondaryButtonIcon}>
                <Ionicons name="people-outline" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.secondaryButtonText}>{texts.recipients}</Text>
            </Pressable>
          </View>
        </WalletFormCard>

        <WalletFormCard>
          <Text style={styles.sectionLabel}>{texts.scope}</Text>

          <ScopeRow
            label={texts.currency}
            value={localCurrencyConfigured ? snapshot.localCurrencyCode : texts.notConfigured}
            warning={!localCurrencyConfigured}
          />
          <ScopeRow label={texts.payments} value={texts.domesticOnly} />
          <ScopeRow label={texts.verification} value={texts.otpProvider} />
          <ScopeRow label={texts.sabiBalanceTopup} value={texts.providerControlled} warning={!providerConnected} />
          <ScopeRow label={texts.cardSettings} value={texts.tokenOnly} />
        </WalletFormCard>

        <Pressable style={styles.settingsButton} onPress={() => router.push("/wallet/settings" as never)}>
          <Text style={styles.settingsButtonText}>{texts.settings}</Text>
        </Pressable>
      </ScrollView>
    </WalletScreenShell>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#060F19",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    zIndex: 20,
  },
  content: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    opacity: 0.7,
    marginBottom: 12,
  },
  heroCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  heroTextWrap: { flex: 1 },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "rgba(255,255,255,0.66)",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  badge: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  balanceWrap: { marginTop: 18 },
  balanceCaption: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.58)",
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  noteBox: {
    marginTop: 16,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(47,107,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(95,142,255,0.22)",
  },
  noteBoxAlt: {
    marginTop: 10,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.68)",
  },
  actionsColumn: { gap: 10 },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  secondaryButtonIcon: {
    width: 34,
    height: 34,
    borderRadius: 14,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  scopeRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  scopeLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.64)",
    fontWeight: "700",
  },
  scopeValue: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "800",
    maxWidth: "54%",
    textAlign: "right",
  },
  warningValue: { color: "#FFD479" },
  settingsButton: {
    minHeight: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F6BFF",
    borderWidth: 1,
    borderColor: "#4F88FF",
  },
  settingsButtonText: {
    color: "#EAF1FF",
    fontSize: 15,
    fontWeight: "900",
  },
});
