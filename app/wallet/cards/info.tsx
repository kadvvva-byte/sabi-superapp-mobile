import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import WalletScreenShell from "../../../src/modules/wallet/components/WalletScreenShell";
import { WalletHeader } from "../../../src/modules/wallet/components/WalletHeader";
import { WalletFormCard } from "../../../src/modules/wallet/components/WalletFormCard";
import WalletSectionTitle from "../../../src/modules/wallet/components/WalletSectionTitle";
import WalletVisualCard, {
  type WalletCardVisualStyle,
} from "../../../src/modules/wallet/components/WalletVisualCard";
import WalletBottomActionBar from "../../../src/modules/wallet/components/WalletBottomActionBar";
import { useI18n } from "../../../src/shared/i18n";

const STYLE_OPTIONS: Array<{ id: WalletCardVisualStyle; labelKey: string; fallback: string }> = [
  { id: "midnight", labelKey: "wallet.cardInfo.styleMidnight", fallback: "Midnight" },
  { id: "ocean", labelKey: "wallet.cardInfo.styleOcean", fallback: "Ocean" },
  { id: "emerald", labelKey: "wallet.cardInfo.styleEmerald", fallback: "Emerald" },
  { id: "violet", labelKey: "wallet.cardInfo.styleViolet", fallback: "Violet" },
  { id: "sunset", labelKey: "wallet.cardInfo.styleSunset", fallback: "Sunset" },
  { id: "youth-neon", labelKey: "wallet.cardInfo.styleYouth", fallback: "Youth" },
];

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

function maskCard(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 4) return `••••  ••••  ••••  ${digits.slice(-4)}`;
  return value || "••••  ••••  ••••  ••••";
}

function humanType(
  type: string | undefined,
  texts: { localGlobal: string; international: string; virtual: string; local: string },
) {
  if (type === "local_international" || type === "local_global") return texts.localGlobal;
  if (type === "international") return texts.international;
  if (type === "virtual") return texts.virtual;
  return texts.local;
}

export default function WalletCardInfoPage() {
  const { t } = useI18n();
  const params = useLocalSearchParams<{
    cardId?: string;
    title?: string;
    scheme?: string;
    issuer?: string;
    pan?: string;
    balance?: string;
    verification?: string;
    topup?: string;
    type?: string;
    style?: WalletCardVisualStyle;
  }>();

  const [selectedStyle, setSelectedStyle] = useState<WalletCardVisualStyle>(
    (params.style as WalletCardVisualStyle) || "midnight",
  );

  const texts = useMemo(
    () => ({
      title: walletText(t, "wallet.cardInfo.title", "Card details"),
      subtitle: walletText(
        t,
        "wallet.cardInfo.subtitle",
        "Provider-tokenized card profile, visual style and controlled card actions.",
      ),
      noCard: walletText(t, "wallet.cardInfo.noCard", "No tokenized card selected"),
      noCardText: walletText(
        t,
        "wallet.cardInfo.noCardText",
        "Card details are available only after a bank or provider returns a verified token.",
      ),
      providerPending: walletText(t, "wallet.cards.providerNotConfigured", "Provider not configured"),
      defaultBadge: walletText(t, "wallet.cardInfo.defaultBadge", "Token pending"),
      cardProfile: walletText(t, "wallet.cardInfo.cardProfile", "Card profile"),
      overview: walletText(t, "wallet.cardInfo.overview", "Overview"),
      cardType: walletText(t, "wallet.cardInfo.cardType", "Card type"),
      scheme: walletText(t, "wallet.cardInfo.scheme", "Scheme"),
      issuer: walletText(t, "wallet.cardInfo.issuer", "Issuer"),
      verification: walletText(t, "wallet.cardInfo.verification", "Verification"),
      topup: walletText(t, "wallet.cardInfo.topup", "Top up eligibility"),
      balance: walletText(t, "wallet.cardInfo.balance", "Balance"),
      enabled: walletText(t, "common.enabled", "Enabled"),
      restricted: walletText(t, "wallet.cardInfo.restricted", "Restricted"),
      providerControlled: walletText(t, "wallet.localCards.providerControlled", "Provider controlled"),
      cardStyle: walletText(t, "wallet.cardInfo.cardStyle", "Card style"),
      personalization: walletText(t, "wallet.cardInfo.personalization", "Personalization"),
      controls: walletText(t, "wallet.cardInfo.controls", "Controls"),
      permissions: walletText(t, "wallet.cardInfo.permissions", "Provider permissions"),
      security: walletText(t, "wallet.cardInfo.security", "Security"),
      protection: walletText(t, "wallet.cardInfo.protection", "Protection"),
      securitySettings: walletText(t, "wallet.cardInfo.securitySettings", "Security settings"),
      securitySettingsText: walletText(
        t,
        "wallet.cardInfo.securitySettingsText",
        "PIN, biometric and trusted-device rules must be handled by wallet security/provider policy.",
      ),
      cardAlerts: walletText(t, "wallet.cardInfo.cardAlerts", "Card alerts"),
      cardAlertsText: walletText(
        t,
        "wallet.cardInfo.cardAlertsText",
        "Transaction, risk and authorization notifications come from wallet/provider events.",
      ),
      cardLimits: walletText(t, "wallet.cardInfo.cardLimits", "Card limits"),
      cardLimitsText: walletText(
        t,
        "wallet.cardInfo.cardLimitsText",
        "Spending, cash and transaction controls are provider/admin policy controlled.",
      ),
      advanced: walletText(t, "wallet.cardInfo.advanced", "Advanced"),
      management: walletText(t, "wallet.cardInfo.management", "Management"),
      routeRole: walletText(t, "wallet.cardInfo.routeRole", "Wallet role routing"),
      routeRoleText: walletText(
        t,
        "wallet.cardInfo.routeRoleText",
        "Personal, business or merchant card roles must be assigned through provider-backed card state.",
      ),
      cardActivity: walletText(t, "wallet.cardInfo.cardActivity", "Card activity"),
      cardActivityText: walletText(
        t,
        "wallet.cardInfo.cardActivityText",
        "Open transactions, statuses and reconciliation hooks.",
      ),
      localGlobal: walletText(t, "wallet.cards.localGlobalCard", "Local + Global"),
      international: walletText(t, "wallet.cards.internationalCard", "International Card"),
      virtual: walletText(t, "wallet.cards.virtualCard", "Virtual Card"),
      local: walletText(t, "wallet.cards.localCard", "Local Card"),
      unknown: walletText(t, "wallet.shared.unknown", "Unknown"),
      cardsHub: walletText(t, "wallet.localTransfer.cardsHub", "Cards Hub"),
      history: walletText(t, "wallet.home.history", "History"),
    }),
    [t],
  );

  const hasCard = Boolean(safeText(params.cardId));
  const title = safeText(params.title) || texts.providerPending;
  const scheme = safeText(params.scheme) || texts.unknown;
  const issuer = safeText(params.issuer) || texts.unknown;
  const pan = maskCard(safeText(params.pan));
  const balance = safeText(params.balance) || "—";
  const verification = safeText(params.verification) || texts.providerControlled;
  const canTopUp = params.topup === "true";
  const type = safeText(params.type) || "local";
  const typeLabel = humanType(type, texts);

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
        {!hasCard ? (
          <WalletFormCard>
            <Text style={styles.emptyTitle}>{texts.noCard}</Text>
            <Text style={styles.emptyText}>{texts.noCardText}</Text>
          </WalletFormCard>
        ) : null}

        <WalletVisualCard
          title={title}
          scheme={scheme}
          maskedPan={pan}
          balance={balance}
          badge={hasCard ? typeLabel : texts.defaultBadge}
          visualStyle={selectedStyle}
          selected={hasCard}
        />

        <WalletSectionTitle title={texts.cardProfile} hint={texts.overview} />
        <WalletFormCard>
          <View style={styles.infoGrid}>
            <InfoItem label={texts.cardType} value={typeLabel} />
            <InfoItem label={texts.scheme} value={scheme} />
            <InfoItem label={texts.issuer} value={issuer} />
            <InfoItem label={texts.verification} value={verification} />
            <InfoItem label={texts.topup} value={canTopUp ? texts.enabled : texts.restricted} />
            <InfoItem label={texts.balance} value={balance} />
          </View>
        </WalletFormCard>

        <WalletSectionTitle title={texts.cardStyle} hint={texts.personalization} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stylesRow}>
          {STYLE_OPTIONS.map((item) => {
            const active = selectedStyle === item.id;
            const label = walletText(t, item.labelKey, item.fallback);

            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedStyle(item.id)}
                style={[styles.styleChip, active && styles.styleChipActive]}
              >
                <Text style={[styles.styleChipText, active && styles.styleChipTextActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <WalletSectionTitle title={texts.controls} hint={texts.permissions} />
        <View style={styles.stack}>
          <ActionRow
            icon={<Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />}
            title={texts.securitySettings}
            subtitle={texts.securitySettingsText}
            onPress={() => router.push("/wallet/settings" as never)}
          />

          <ActionRow
            icon={<MaterialCommunityIcons name="bell-ring-outline" size={18} color="#FFFFFF" />}
            title={texts.cardAlerts}
            subtitle={texts.cardAlertsText}
            onPress={() => router.push("/notifications" as never)}
          />

          <ActionRow
            icon={<MaterialCommunityIcons name="tune-variant" size={18} color="#FFFFFF" />}
            title={texts.cardLimits}
            subtitle={texts.cardLimitsText}
            onPress={() => router.push("/wallet/settings" as never)}
          />
        </View>

        <WalletSectionTitle title={texts.advanced} hint={texts.management} />
        <View style={styles.stack}>
          <ActionRow
            icon={<Ionicons name="swap-horizontal-outline" size={18} color="#FFFFFF" />}
            title={texts.routeRole}
            subtitle={texts.routeRoleText}
            onPress={() => router.push("/wallet/cards" as never)}
          />

          <ActionRow
            icon={<Ionicons name="document-text-outline" size={18} color="#FFFFFF" />}
            title={texts.cardActivity}
            subtitle={texts.cardActivityText}
            onPress={() => router.push("/wallet/history" as never)}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <WalletBottomActionBar
        secondaryLabel={texts.cardsHub}
        onSecondaryPress={() => router.replace("/wallet/cards" as never)}
        primaryLabel={texts.history}
        onPrimaryPress={() => router.push("/wallet/history" as never)}
      />
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

function ActionRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.actionRow}>
      <View style={styles.actionIcon}>{icon}</View>
      <View style={styles.actionTextWrap}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.52)" />
    </Pressable>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 124,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },
  emptyText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 18,
  },
  infoGrid: {
    gap: 10,
  },
  infoItem: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  infoLabel: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 13,
    fontWeight: "700",
  },
  infoValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    maxWidth: "56%",
    textAlign: "right",
  },
  stylesRow: {
    gap: 10,
    paddingRight: 20,
  },
  styleChip: {
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  styleChipActive: {
    backgroundColor: "#2F6BFF",
    borderColor: "#77A0FF",
  },
  styleChipText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    fontWeight: "800",
  },
  styleChipTextActive: {
    color: "#FFFFFF",
  },
  stack: {
    gap: 12,
  },
  actionRow: {
    minHeight: 78,
    borderRadius: 22,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(47,107,255,0.18)",
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },
  actionSubtitle: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    lineHeight: 17,
  },
  bottomSpacer: {
    height: 22,
  },
});
