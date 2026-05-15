import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  CreditCard,
  Landmark,
  Lock,
  ShieldCheck,
  WalletCards,
} from "lucide-react-native";

import AppContainer from "../../../components/AppContainer";
import { useI18n } from "../../../src/shared/i18n";
import { useSabiTheme } from "../../../src/theme/ThemeProvider";

function walletText(
  t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string,
  key: string,
  fallback: string,
) {
  const value = t(key);
  return value && value !== key ? value : fallback;
}

function safeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function maskSensitiveCardReference(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 4) return `•••• ${digits.slice(-4)}`;
  if (!value) return "—";
  if (value.length <= 8) return value;
  return `${value.slice(0, 4)}•••${value.slice(-4)}`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRowCompact}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function LocalCardDetailsScreen() {
  const { colors, radius } = useSabiTheme();
  const { t } = useI18n();
  const params = useLocalSearchParams<{
    cardId?: string;
    title?: string;
    scheme?: string;
    issuer?: string;
    pan?: string;
    currency?: string;
    balance?: string;
    verification?: string;
    topup?: string;
    type?: string;
  }>();

  const hasCard = Boolean(safeText(params.cardId));
  const maskedPan = maskSensitiveCardReference(safeText(params.pan));

  const texts = useMemo(
    () => ({
      eyebrow: walletText(t, "wallet.localCardDetails.eyebrow", "LOCAL CARD"),
      title: walletText(t, "wallet.localCardDetails.title", "Local card details"),
      subtitle: walletText(
        t,
        "wallet.localCardDetails.subtitle",
        "Tokenized card profile, provider status and domestic permissions.",
      ),
      providerPending: walletText(t, "wallet.cards.providerNotConfigured", "Provider not configured"),
      noCardTitle: walletText(t, "wallet.localCardDetails.noCardTitle", "No local card selected"),
      noCardText: walletText(
        t,
        "wallet.localCardDetails.noCardText",
        "Open this screen only from a verified tokenized local card. Sabi does not create local test card details.",
      ),
      profile: walletText(t, "wallet.localCardDetails.profile", "Card profile"),
      tokenStatus: walletText(t, "wallet.localCardDetails.tokenStatus", "Token status"),
      tokenPending: walletText(t, "wallet.localCardDetails.tokenPending", "Pending provider token"),
      cardName: walletText(t, "wallet.localCardDetails.cardName", "Card name"),
      scheme: walletText(t, "wallet.localCardDetails.scheme", "Scheme"),
      issuer: walletText(t, "wallet.localCardDetails.issuer", "Issuer"),
      maskedCard: walletText(t, "wallet.localCardDetails.maskedCard", "Masked card"),
      currency: walletText(t, "wallet.localCardDetails.currency", "Currency"),
      verification: walletText(t, "wallet.localCardDetails.verification", "Verification"),
      topup: walletText(t, "wallet.localCardDetails.topup", "Sabi Balance top up"),
      providerControlled: walletText(t, "wallet.localCards.providerControlled", "Provider controlled"),
      securityTitle: walletText(t, "wallet.localCardDetails.securityTitle", "Security"),
      securityText: walletText(
        t,
        "wallet.localCardDetails.securityText",
        "PAN/CVV stay inside the provider flow. Sabi may show only masked metadata, token ID, provider status and user controls.",
      ),
      controlsTitle: walletText(t, "wallet.localCardDetails.controlsTitle", "Controls"),
      controlsText: walletText(
        t,
        "wallet.localCardDetails.controlsText",
        "Live card controls must be executed through provider/admin policy, not local UI simulation.",
      ),
      transfer: walletText(t, "wallet.localCards.cardToCard", "Card to Card"),
      cardsHub: walletText(t, "wallet.localTransfer.cardsHub", "Cards Hub"),
      notConfigured: walletText(t, "wallet.currency.notConfigured", "Not configured"),
      unknown: walletText(t, "wallet.shared.unknown", "Unknown"),
      enabled: walletText(t, "common.enabled", "Enabled"),
      unavailable: walletText(t, "common.unavailable", "Unavailable"),
    }),
    [t],
  );

  const cardTitle = safeText(params.title) || texts.providerPending;
  const scheme = safeText(params.scheme) || texts.unknown;
  const issuer = safeText(params.issuer) || texts.unknown;
  const currency = safeText(params.currency) || texts.notConfigured;
  const verification = safeText(params.verification) || texts.providerControlled;
  const topup = params.topup === "true" ? texts.enabled : texts.providerControlled;

  return (
    <AppContainer>
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

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
              <CreditCard size={22} color={colors.text} />
            </View>

            <View style={styles.heroTextWrap}>
              <Text style={[styles.heroTitle, { color: colors.text }]}>{cardTitle}</Text>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                {hasCard ? texts.tokenStatus : texts.noCardText}
              </Text>
            </View>
          </View>

          <View style={styles.heroBadges}>
            <Badge label={texts.tokenPending} colors={colors} radius={radius.lg} />
            <Badge label={currency} colors={colors} radius={radius.lg} />
          </View>
        </View>

        {!hasCard ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: radius.xl,
              },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{texts.noCardTitle}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{texts.noCardText}</Text>
          </View>
        ) : null}

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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{texts.profile}</Text>
          <View style={styles.infoGrid}>
            <InfoRow label={texts.cardName} value={cardTitle} />
            <InfoRow label={texts.scheme} value={scheme} />
            <InfoRow label={texts.issuer} value={issuer} />
            <InfoRow label={texts.maskedCard} value={maskedPan} />
            <InfoRow label={texts.currency} value={currency} />
            <InfoRow label={texts.verification} value={verification} />
            <InfoRow label={texts.topup} value={topup} />
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
          <InfoBlock
            icon={<ShieldCheck size={18} color={colors.text} />}
            title={texts.securityTitle}
            text={texts.securityText}
            colors={colors}
          />
          <Divider color={colors.border} />
          <InfoBlock
            icon={<Lock size={18} color={colors.text} />}
            title={texts.controlsTitle}
            text={texts.controlsText}
            colors={colors}
          />
        </View>

        <View style={styles.bottomActions}>
          <Pressable
            onPress={() => router.replace("/wallet/cards" as never)}
            style={[
              styles.secondaryButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{texts.cardsHub}</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/wallet/cards/local-transfer" as never)}
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.accent,
                borderRadius: radius.lg,
              },
            ]}
          >
            <Text style={styles.primaryButtonText}>{texts.transfer}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppContainer>
  );
}

function Badge({
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
        styles.badge,
        {
          backgroundColor: colors.cardSoft,
          borderColor: colors.border,
          borderRadius: radius,
        },
      ]}
    >
      <Text style={[styles.badgeText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

function InfoBlock({
  icon,
  title,
  text,
  colors,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  colors: { text: string; textSecondary: string };
}) {
  return (
    <View style={styles.infoBlockRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoTextWrap}>
        <Text style={[styles.infoBlockTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.infoBlockText, { color: colors.textSecondary }]}>{text}</Text>
      </View>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
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
  fixedEyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.3, marginBottom: 3 },
  fixedTitle: { fontSize: 22, fontWeight: "900" },
  content: { paddingHorizontal: 20, paddingTop: 96, paddingBottom: 40 },
  subtitleTop: { fontSize: 14, lineHeight: 21, marginBottom: 18 },
  iconButton: { width: 46, height: 46, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  heroCard: { borderWidth: 1, padding: 18, marginBottom: 18, overflow: "hidden", position: "relative" },
  heroGlowA: { position: "absolute", top: -18, left: -18, width: 180, height: 135, borderRadius: 44, backgroundColor: "rgba(61,121,255,0.18)" },
  heroGlowB: { position: "absolute", right: -26, bottom: -28, width: 210, height: 150, borderRadius: 60, backgroundColor: "rgba(124,68,242,0.12)" },
  heroShine: { position: "absolute", top: -50, right: 38, width: 92, height: 280, backgroundColor: "rgba(255,255,255,0.06)", transform: [{ rotate: "22deg" }] },
  heroTopRow: { flexDirection: "row", gap: 14, alignItems: "center", marginBottom: 16, zIndex: 2 },
  heroIconWrap: { width: 48, height: 48, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  heroTextWrap: { flex: 1 },
  heroTitle: { fontSize: 20, fontWeight: "900", marginBottom: 4 },
  heroSubtitle: { fontSize: 13, lineHeight: 18 },
  heroBadges: { flexDirection: "row", flexWrap: "wrap", gap: 8, zIndex: 2 },
  badge: { minHeight: 30, paddingHorizontal: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 11, fontWeight: "800" },
  emptyCard: { borderWidth: 1, padding: 24, marginBottom: 18, alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "900", marginBottom: 6 },
  emptySubtitle: { fontSize: 13, lineHeight: 18, textAlign: "center" },
  sectionCard: { borderWidth: 1, padding: 18, marginBottom: 18 },
  sectionTitle: { fontSize: 20, fontWeight: "900", marginBottom: 12 },
  infoGrid: { gap: 10 },
  infoRowCompact: { minHeight: 36, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  infoLabel: { color: "rgba(255,255,255,0.62)", fontSize: 13, fontWeight: "700" },
  infoValue: { color: "#FFFFFF", fontSize: 13, fontWeight: "800", maxWidth: "54%", textAlign: "right" },
  infoBlockRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  infoIcon: { width: 22, alignItems: "center", paddingTop: 2 },
  infoTextWrap: { flex: 1 },
  infoBlockTitle: { fontSize: 14, fontWeight: "900", marginBottom: 4 },
  infoBlockText: { fontSize: 13, lineHeight: 18 },
  divider: { height: 1, marginVertical: 12 },
  bottomActions: { flexDirection: "row", gap: 12, marginTop: 4 },
  secondaryButton: { flex: 1, minHeight: 54, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { fontSize: 14, fontWeight: "800" },
  primaryButton: { flex: 1, minHeight: 54, alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: "#08111F", fontSize: 14, fontWeight: "900" },
});
