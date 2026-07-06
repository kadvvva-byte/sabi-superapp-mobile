import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useI18n } from "../../../shared/i18n";
import { useWalletFoundation } from "../../../shared/wallet/wallet-foundation";
import PlayReadyProviderNotConfiguredEvidencePanel from "../../play-ready/mobile/PlayReadyProviderNotConfiguredEvidencePanel";
import PlayReadyBillingWalletSeparationEvidencePanel from "../../play-ready/mobile/PlayReadyBillingWalletSeparationEvidencePanel";
import PlayReadyFinancialFeatureDisclosurePanel from "../../play-ready/mobile/PlayReadyFinancialFeatureDisclosurePanel";
import {
  getWalletProviderPanelHint,
  getWalletProviderPanelTitle,
  getWalletProviderStatusRows,
  getWalletProviderTokenOnlyPolicyText,
  type WalletProviderStatusPanelScope,
  type WalletProviderStatusRow,
  type WalletProviderStatusTone,
} from "../../../shared/wallet/wallet-provider-status-ui";

export type WalletProviderStatusPanelProps = {
  scope: WalletProviderStatusPanelScope;
  compact?: boolean;
};

const TONE_DOT: Record<WalletProviderStatusTone, string> = {
  ready: "#37D67A",
  pending: "#FFD166",
  blocked: "#FF6B6B",
  neutral: "rgba(255,255,255,0.48)",
};

export default function WalletProviderStatusPanel({
  scope,
  compact = false,
}: WalletProviderStatusPanelProps) {
  const { t } = useI18n();
  const { snapshot } = useWalletFoundation();

  const title = useMemo(() => getWalletProviderPanelTitle(t, scope), [scope, t]);
  const hint = useMemo(() => getWalletProviderPanelHint(t, scope), [scope, t]);
  const rows = useMemo<WalletProviderStatusRow[]>(
    () => getWalletProviderStatusRows(t, snapshot, scope),
    [scope, snapshot, t],
  );
  const tokenOnlyPolicy = useMemo(() => getWalletProviderTokenOnlyPolicyText(t), [t]);

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.hint}>{hint}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {rows.map((row) => (
          <View key={row.id} style={styles.statusCell}>
            <View style={styles.statusTopRow}>
              <View style={[styles.statusDot, { backgroundColor: TONE_DOT[row.tone] }]} />
              <Text style={styles.statusLabel} numberOfLines={1}>
                {row.label}
              </Text>
            </View>
            <Text style={styles.statusValue} numberOfLines={2}>
              {row.value}
            </Text>
            {row.detail ? (
              <Text style={styles.statusDetail} numberOfLines={2}>
                {row.detail}
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      <Text style={styles.policyText}>{tokenOnlyPolicy}</Text>

      <PlayReadyProviderNotConfiguredEvidencePanel
        compact={compact}
        contextLabel="Wallet/Airwallex/Alipay provider_not_configured reviewer evidence"
      />

      <PlayReadyBillingWalletSeparationEvidencePanel
        compact={compact}
        contextLabel="Wallet billing separation evidence"
      />

      <PlayReadyFinancialFeatureDisclosurePanel
        compact={compact}
        contextLabel="Financial features and virtual asset disclosure evidence"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 16,
  },
  cardCompact: {
    padding: 14,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
    gap: 5,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  hint: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  statusCell: {
    width: "48%",
    minHeight: 76,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  statusTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
  },
  statusLabel: {
    flex: 1,
    color: "rgba(255,255,255,0.58)",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
  },
  statusValue: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  statusDetail: {
    marginTop: 5,
    color: "rgba(255,255,255,0.52)",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },
  policyText: {
    marginTop: 12,
    color: "rgba(255,255,255,0.56)",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
});
