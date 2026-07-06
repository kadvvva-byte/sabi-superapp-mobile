/* eslint-disable react-hooks/rules-of-hooks */
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useI18n } from "../../src/shared/i18n";
import {
  formatWalletCurrencyAmount,
  getWalletPrimaryCurrencyCode,
  useWalletFoundation,
} from "../../src/shared/wallet/wallet-foundation";
import { walletText, type WalletTranslator } from "../../src/shared/wallet/wallet-i18n";

const PIN_LENGTH = 4;

type PinConfirmTexts = {
  eyebrow: string;
  title: string;
  subtitle: string;
  protectedAction: string;
  authorizationTitle: string;
  authorizationText: string;
  amountLabel: string;
  flow: string;
  digits: string;
  security: string;
  active: string;
  summaryTitle: string;
  summaryHint: string;
  recipientTarget: string;
  source: string;
  amount: string;
  reference: string;
  note: string;
  emptyAmount: string;
  emptyNote: string;
  emptyReference: string;
  protectedTarget: string;
  walletSource: string;
  enterPin: string;
  providerRequired: string;
  providerRequiredError: string;
  helperText: string;
  protectionTitle: string;
  protectionText: string;
  providerTitle: string;
  providerText: string;
  providerStatus: string;
  riskStatus: string;
  walletRoute: string;
  guardReason: string;
};

function firstString(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function safeParam(value: string | string[] | undefined, fallback: string) {
  const next = firstString(value);
  return typeof next === "string" && next.trim().length > 0 ? next.trim() : fallback;
}

function parseAmount(value: string) {
  const normalized = String(value || "").replace(/[^0-9.,-]/g, "").replace(/,/g, ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function usePinConfirmTexts(t: WalletTranslator): PinConfirmTexts {
  return {
    eyebrow: walletText(t, "wallet.pinConfirm.eyebrow", "Secure confirm"),
    title: walletText(t, "wallet.pinConfirm.title", "Confirm operation"),
    subtitle: walletText(
      t,
      "wallet.pinConfirm.subtitle",
      "Authorize this protected wallet action through the final security provider.",
    ),
    protectedAction: walletText(t, "wallet.pinConfirm.protectedAction", "Protected action"),
    authorizationTitle: walletText(t, "wallet.pinConfirm.authorizationTitle", "PIN authorization"),
    authorizationText: walletText(
      t,
      "wallet.pinConfirm.authorizationText",
      "This action requires secure confirmation before execution.",
    ),
    amountLabel: walletText(t, "wallet.pinConfirm.amountLabel", "Confirmation amount"),
    flow: walletText(t, "wallet.pinConfirm.flow", "Flow"),
    digits: walletText(t, "wallet.pinConfirm.digits", "Digits"),
    security: walletText(t, "wallet.pinConfirm.security", "Security"),
    active: walletText(t, "wallet.pinConfirm.active", "Active"),
    summaryTitle: walletText(t, "wallet.pinConfirm.summaryTitle", "Confirmation summary"),
    summaryHint: walletText(t, "wallet.pinConfirm.summaryHint", "Review"),
    recipientTarget: walletText(t, "wallet.pinConfirm.recipientTarget", "Recipient / Target"),
    source: walletText(t, "wallet.pinConfirm.source", "Source"),
    amount: walletText(t, "wallet.pinConfirm.amount", "Amount"),
    reference: walletText(t, "wallet.pinConfirm.reference", "Reference"),
    note: walletText(t, "wallet.pinConfirm.note", "Note"),
    emptyAmount: walletText(t, "wallet.pinConfirm.emptyAmount", "—"),
    emptyNote: walletText(t, "wallet.pinConfirm.emptyNote", "No note"),
    emptyReference: walletText(t, "wallet.pinConfirm.emptyReference", "No reference"),
    protectedTarget: walletText(t, "wallet.pinConfirm.protectedTarget", "Protected target"),
    walletSource: walletText(t, "wallet.pinConfirm.walletSource", "Wallet"),
    enterPin: walletText(t, "wallet.pinConfirm.enterPin", "Enter PIN"),
    providerRequired: walletText(t, "wallet.pinConfirm.providerRequired", "Secure confirmation provider required"),
    providerRequiredError: walletText(
      t,
      "wallet.pinConfirm.providerRequiredError",
      "Secure confirmation provider is not configured yet.",
    ),
    helperText: walletText(
      t,
      "wallet.pinConfirm.helperText",
      "This screen continues only after the real wallet security provider confirms the action.",
    ),
    protectionTitle: walletText(t, "wallet.pinConfirm.protectionTitle", "Confirmation protection"),
    protectionText: walletText(
      t,
      "wallet.pinConfirm.protectionText",
      "Critical wallet actions require a protected step before processing.",
    ),
    providerTitle: walletText(t, "wallet.pinConfirm.providerTitle", "Provider required"),
    providerText: walletText(
      t,
      "wallet.pinConfirm.providerText",
      "PIN, biometric and wallet risk checks must be connected through the final auth layer before money movement.",
    ),
    providerStatus: walletText(t, "wallet.pinConfirm.providerStatus", "Provider status"),
    riskStatus: walletText(t, "wallet.pinConfirm.riskStatus", "Risk status"),
    walletRoute: walletText(t, "wallet.pinConfirm.walletRoute", "Wallet route"),
    guardReason: walletText(t, "wallet.pinConfirm.guardReason", "Guard reason"),
  };
}

export default function WalletPinConfirmScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { snapshot } = useWalletFoundation();
  const texts = useMemo(() => usePinConfirmTexts(t), [t]);

  const params = useLocalSearchParams<{
    title?: string;
    subtitle?: string;
    flow?: string;
    amount?: string;
    currency?: string;
    next?: string;
    note?: string;
    reference?: string;
    recipientName?: string;
    source?: string;
    walletRoute?: string;
    providerRequired?: string;
    providerStatus?: string;
    ledgerProviderStatus?: string;
    riskStatus?: string;
    ledgerRiskStatus?: string;
    guardReason?: string;
    providerTokenId?: string;
  }>();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const title = safeParam(params.title, texts.title);
  const subtitle = safeParam(params.subtitle, texts.subtitle);
  const amount = safeParam(params.amount, texts.emptyAmount);
  const currency = safeParam(params.currency, getWalletPrimaryCurrencyCode(snapshot));
  const flow = safeParam(params.flow, "wallet");
  const note = safeParam(params.note, texts.emptyNote);
  const reference = safeParam(params.reference, texts.emptyReference);
  const recipientName = safeParam(params.recipientName, texts.protectedTarget);
  const source = safeParam(params.source, texts.walletSource);
  const walletRoute = safeParam(params.walletRoute, "wallet");
  const providerStatus = safeParam(params.providerStatus, "provider_not_configured");
  const riskStatus = safeParam(params.riskStatus, "clear");
  const guardReason = safeParam(params.guardReason, "ok");

  const amountDisplay = useMemo(() => {
    const parsed = parseAmount(amount);
    if (parsed === undefined) return amount;
    return formatWalletCurrencyAmount(parsed, currency);
  }, [amount, currency]);

  const masked = useMemo(
    () => Array.from({ length: PIN_LENGTH }, (_, index) => index < pin.length),
    [pin],
  );

  const handleDigitPress = (digit: string) => {
    if (pin.length >= PIN_LENGTH) return;

    const nextPin = `${pin}${digit}`;
    setPin(nextPin);
    setError("");

    if (nextPin.length === PIN_LENGTH) {
      setTimeout(() => {
        setPin("");
        setError(guardReason === "ok" ? texts.providerRequiredError : `${texts.providerRequiredError} (${guardReason})`);
      }, 120);
    }
  };

  const routeGuardRows = [
    { label: texts.walletRoute, value: walletRoute },
    { label: texts.providerStatus, value: providerStatus },
    { label: texts.riskStatus, value: riskStatus },
    { label: texts.guardReason, value: guardReason },
  ];

  const handleDelete = () => {
    if (!pin.length) return;
    setPin((prev) => prev.slice(0, -1));
    setError("");
  };

  const keypadRows = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["bio", "0", "del"],
  ];

  return (
    <View style={styles.root}>
      <View style={[styles.fixedHeader, { paddingTop: Math.max(insets.top, 8) }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          </Pressable>

          <View style={styles.headerTextWrap}>
            <Text style={styles.eyebrow}>{texts.eyebrow}</Text>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: 0,
            paddingBottom: Math.max(insets.bottom + 24, 36),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="lock-closed-outline" size={20} color="#FFFFFF" />
            </View>

            <View style={styles.heroTextWrap}>
              <Text style={styles.heroLabel}>{texts.protectedAction}</Text>
              <Text style={styles.heroTitle}>{texts.authorizationTitle}</Text>
              <Text style={styles.heroSubtitle}>{texts.authorizationText}</Text>
            </View>

            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>PIN</Text>
            </View>
          </View>

          <View style={styles.amountWrap}>
            <Text style={styles.amountLabel}>{texts.amountLabel}</Text>
            <Text style={styles.amountValue}>{amountDisplay}</Text>
          </View>

          <View style={styles.metricRow}>
            <MetricCard label={texts.flow} value={flow} />
            <MetricCard label={texts.digits} value={`${PIN_LENGTH}`} />
            <MetricCard label={texts.security} value={texts.active} />
          </View>
        </View>

        <SectionTitle title={texts.summaryTitle} hint={texts.summaryHint} />
        <View style={styles.card}>
          <SummaryRow label={texts.recipientTarget} value={recipientName} />
          <Divider />
          <SummaryRow label={texts.source} value={source} />
          <Divider />
          <SummaryRow label={texts.amount} value={amountDisplay} />
          <Divider />
          <SummaryRow label={texts.reference} value={reference} />
          <Divider />
          <SummaryRow label={texts.note} value={note} />
          {routeGuardRows.map((row) => (
            <React.Fragment key={row.label}>
              <Divider />
              <SummaryRow label={row.label} value={row.value} />
            </React.Fragment>
          ))}
        </View>

        <View style={styles.cardCenter}>
          <Text style={styles.pinTitle}>{texts.enterPin}</Text>
          <Text style={styles.pinHint}>{texts.providerRequired}</Text>

          <View style={styles.dotsRow}>
            {masked.map((filled, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  filled ? styles.dotFilled : styles.dotEmpty,
                ]}
              />
            ))}
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.helperText}>{texts.helperText}</Text>
          )}
        </View>

        <View style={styles.card}>
          {keypadRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map((key) => {
                const isBio = key === "bio";
                const isDelete = key === "del";

                return (
                  <Pressable
                    key={key}
                    style={styles.keyButton}
                    onPress={() => {
                      if (isDelete) return handleDelete();
                      if (isBio) return;
                      handleDigitPress(key);
                    }}
                  >
                    {isBio ? (
                      <Ionicons name="finger-print-outline" size={22} color="#FFFFFF" />
                    ) : isDelete ? (
                      <Ionicons name="backspace-outline" size={22} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.keyText}>{key}</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <NoteRow
            icon="shield-checkmark-outline"
            title={texts.protectionTitle}
            text={texts.protectionText}
          />
          <Divider />
          <NoteRow
            icon={error ? "warning-outline" : "checkmark-circle-outline"}
            title={texts.providerTitle}
            text={texts.providerText}
            warning={!!error}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function SectionTitle({ title, hint }: { title: string; hint: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionHint}>{hint}</Text>
    </View>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function NoteRow({
  icon,
  title,
  text,
  warning = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
  warning?: boolean;
}) {
  return (
    <View style={styles.noteRow}>
      <View style={styles.noteIconWrap}>
        <Ionicons
          name={icon}
          size={18}
          color={warning ? "#FF8B8B" : "#FFFFFF"}
        />
      </View>

      <View style={styles.noteTextWrap}>
        <Text style={styles.noteTitle}>{title}</Text>
        <Text style={styles.noteText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#060F19",
  },

  fixedHeader: {
    paddingHorizontal: 20,
    backgroundColor: "#060F19",
  },

  scroll: {
    flex: 1,
    backgroundColor: "#060F19",
  },

  content: {
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 22,
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

  eyebrow: {
    color: "#5C8DFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 8,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 8,
  },

  headerSubtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 14,
    lineHeight: 21,
  },

  heroCard: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(20,32,58,0.94)",
    borderRadius: 28,
    padding: 18,
    marginBottom: 18,
  },

  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
  },

  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroTextWrap: {
    flex: 1,
  },

  heroLabel: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },

  heroSubtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 18,
  },

  heroBadge: {
    minHeight: 30,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  amountWrap: {
    marginBottom: 16,
  },

  amountLabel: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },

  amountValue: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
  },

  metricRow: {
    flexDirection: "row",
    gap: 10,
  },

  metricCard: {
    flex: 1,
    minHeight: 76,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: "center",
  },

  metricLabel: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },

  metricValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 14,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  sectionHint: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    fontWeight: "700",
  },

  card: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(20,32,58,0.94)",
    borderRadius: 28,
    padding: 18,
    marginBottom: 18,
  },

  cardCenter: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(20,32,58,0.94)",
    borderRadius: 28,
    padding: 18,
    marginBottom: 18,
    alignItems: "center",
  },

  summaryRow: {
    minHeight: 38,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  summaryLabel: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },

  summaryValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    flex: 1,
    textAlign: "right",
  },

  pinTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },

  pinHint: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 18,
    textAlign: "center",
  },

  dotsRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16,
  },

  dot: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1,
  },

  dotFilled: {
    backgroundColor: "#5C8DFF",
    borderColor: "#5C8DFF",
  },

  dotEmpty: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.08)",
  },

  helperText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 280,
  },

  errorText: {
    color: "#FF8B8B",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },

  keypadRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  keyButton: {
    flex: 1,
    minHeight: 64,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  keyText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },

  noteRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },

  noteIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  noteTextWrap: {
    flex: 1,
  },

  noteTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },

  noteText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 18,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 12,
  },
});