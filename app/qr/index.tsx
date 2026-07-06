import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SabiQrFunctionGrid from "../../src/modules/qr/components/SabiQrFunctionGrid";
import { SABI_QR_FUNCTION_CATALOG } from "../../src/modules/qr/data/qrFunctionCatalog";
import { useSabiQrActorIdentity } from "../../src/modules/qr/runtime/qrIdentityBinding";
import { useQrMobileTranslations } from "../../src/shared/i18n/qr-mobile-hooks";
import type { SabiQrFunctionCode, SabiQrFunctionDefinition } from "../../src/modules/qr/contracts/universalQr.contracts";

type QrGroupId = "profile" | "wallets" | "business" | "mobility" | "attendance";

type QrGroupDefinition = {
  id: QrGroupId;
  titleKey: string;
  subtitleKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  codes: SabiQrFunctionCode[];
};

const QR_GROUPS: QrGroupDefinition[] = [
  {
    id: "profile",
    titleKey: "qr.mobile.group.profile.title",
    subtitleKey: "qr.mobile.group.profile.subtitle",
    icon: "chatbubble-ellipses",
    codes: ["profile_identity", "messenger_profile", "messenger_payment"],
  },
  {
    id: "wallets",
    titleKey: "qr.mobile.group.wallets.title",
    subtitleKey: "qr.mobile.group.wallets.subtitle",
    icon: "wallet",
    codes: [
      "wallet_receive",
      "wallet_user_payment",
      "coin_wallet_receive",
      "coin_wallet_transfer",
      "crypto_wallet_receive",
      "virtual_card_issuance",
      "virtual_card_payment",
    ],
  },
  {
    id: "business",
    titleKey: "qr.mobile.group.business.title",
    subtitleKey: "qr.mobile.group.business.subtitle",
    icon: "storefront",
    codes: ["merchant_static_entry", "merchant_dynamic_order", "business_invoice", "marketplace_order", "delivery_order"],
  },
  {
    id: "mobility",
    titleKey: "qr.mobile.group.mobility.title",
    subtitleKey: "qr.mobile.group.mobility.subtitle",
    icon: "car",
    codes: ["taxi_trip_payment", "stream_donation"],
  },
  {
    id: "attendance",
    titleKey: "qr.mobile.group.attendance.title",
    subtitleKey: "qr.mobile.group.attendance.subtitle",
    icon: "school",
    codes: ["school_check_in", "school_check_out", "work_check_in", "work_check_out"],
  },
];

function pushQr(href: { pathname: string; params?: Record<string, string> }) {
  (router.push as unknown as (nextHref: typeof href) => void)(href);
}

function resolveActorName(actor: ReturnType<typeof useSabiQrActorIdentity>, fallback: string): string {
  return actor.displayName || [actor.firstName, actor.lastName].filter(Boolean).join(" ").trim() || actor.username || fallback;
}

export default function SabiQrCenterScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ scope?: string }>();
  const actor = useSabiQrActorIdentity();
  const { tq, functionTitle, functionSubtitle } = useQrMobileTranslations();
  const [query, setQuery] = useState("");

  const groupedItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const forcedScope = typeof params.scope === "string" ? params.scope : "";

    return QR_GROUPS.map((group) => {
      const groupItems = SABI_QR_FUNCTION_CATALOG.filter((item) => group.codes.includes(item.code)).filter((item) => {
        if (forcedScope === "wallet" && group.id !== "wallets") return false;
        if (forcedScope === "business" && group.id !== "business") return false;
        if (forcedScope === "attendance" && group.id !== "attendance") return false;
        if (!q) return true;

        return `${functionTitle(item.code)} ${functionSubtitle(item.code)} ${item.code} ${item.surface} ${item.rail}`
          .toLowerCase()
          .includes(q);
      });

      return { ...group, items: groupItems };
    }).filter((group) => group.items.length > 0);
  }, [functionSubtitle, functionTitle, params.scope, query]);

  const openFunction = (item: SabiQrFunctionDefinition) => {
    pushQr({ pathname: "/qr/create", params: { functionCode: item.code } });
  };

  return (
    <LinearGradient colors={["#06122B", "#101A35", "#040914"]} style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingTop: Math.max(insets.top + 10, 20), paddingBottom: Math.max(insets.bottom + 120, 140), paddingHorizontal: 18 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.roundButton} accessibilityLabel={tq("qr.mobile.common.back")}>
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>{tq("qr.mobile.center.eyebrow")}</Text>
            <Text style={styles.title}>{tq("qr.mobile.center.title")}</Text>
            <Text style={styles.subtitle}>{tq("qr.mobile.center.subtitle")}</Text>
          </View>
          <Pressable onPress={() => pushQr({ pathname: "/qr/scanner" })} style={styles.scanButton} accessibilityLabel={tq("qr.mobile.scanner.title")}>
            <Ionicons name="scan" size={20} color="#07111E" />
          </Pressable>
        </View>

        <View style={styles.identityCard}>
          <View style={styles.identityIcon}>
            <Ionicons name="shield-checkmark" size={22} color="#77A7FF" />
          </View>
          <View style={styles.identityText}>
            <Text style={styles.identityTitle}>{tq("qr.mobile.identity.autoTitle")}</Text>
            <Text numberOfLines={1} style={styles.identityName}>{resolveActorName(actor, tq("qr.mobile.identity.namePending"))}</Text>
            <Text numberOfLines={1} style={styles.identityValue}>
              {actor.userId ? tq("qr.mobile.identity.userIdValue") : tq("qr.mobile.center.loginRequired")}
            </Text>
          </View>
        </View>

        <View style={styles.quickRow}>
          <Pressable onPress={() => pushQr({ pathname: "/qr/scanner" })} style={styles.quickButton}>
            <Ionicons name="scan" size={17} color="#77A7FF" />
            <Text style={styles.quickButtonText}>{tq("qr.mobile.common.openScanner")}</Text>
          </Pressable>
          <Pressable onPress={() => pushQr({ pathname: "/qr/history" })} style={styles.quickButton}>
            <Ionicons name="time" size={17} color="#77A7FF" />
            <Text style={styles.quickButtonText}>{tq("qr.mobile.common.history")}</Text>
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.52)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={tq("qr.mobile.center.searchPlaceholder")}
            placeholderTextColor="rgba(255,255,255,0.45)"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.groupList}>
          {groupedItems.length > 0 ? (
            groupedItems.map((group) => (
              <View key={group.id} style={styles.groupCard}>
                <View style={styles.groupHeader}>
                  <View style={styles.groupTitleRow}>
                    <View style={styles.groupIcon}>
                      <Ionicons name={group.icon} size={19} color="#77A7FF" />
                    </View>
                    <View style={styles.groupTextWrap}>
                      <Text style={styles.groupTitle}>{tq(group.titleKey)}</Text>
                      <Text style={styles.groupSubtitle}>{tq(group.subtitleKey)}</Text>
                    </View>
                  </View>
                  <Text style={styles.groupCount}>{group.items.length}</Text>
                </View>
                <SabiQrFunctionGrid items={group.items} onPress={openFunction} />
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="search" size={30} color="#77A7FF" />
              <Text style={styles.emptyTitle}>{tq("qr.mobile.center.emptyTitle")}</Text>
              <Text style={styles.emptyText}>{tq("qr.mobile.center.emptyText")}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  roundButton: { width: 40, height: 40, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  scanButton: { width: 44, height: 44, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#77A7FF" },
  headerText: { flex: 1 },
  eyebrow: { color: "#77A7FF", fontSize: 11, fontWeight: "900", letterSpacing: 1.6 },
  title: { color: "#FFFFFF", fontSize: 31, lineHeight: 36, fontWeight: "900", marginTop: 3 },
  subtitle: { color: "rgba(255,255,255,0.68)", fontSize: 13, lineHeight: 19, fontWeight: "600", marginTop: 6 },
  identityCard: { marginTop: 18, minHeight: 62, borderRadius: 22, padding: 13, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.085)", borderWidth: 1, borderColor: "rgba(119,167,255,0.22)" },
  identityIcon: { width: 40, height: 40, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(119,167,255,0.14)" },
  identityText: { flex: 1 },
  identityTitle: { color: "rgba(255,255,255,0.58)", fontSize: 11, fontWeight: "900" },
  identityName: { color: "#FFFFFF", fontSize: 15, fontWeight: "900", marginTop: 4 },
  identityValue: { color: "rgba(255,255,255,0.78)", fontSize: 12, fontWeight: "900", marginTop: 3 },
  quickRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  quickButton: { flex: 1, minHeight: 46, borderRadius: 17, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  quickButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  searchBox: { marginTop: 16, height: 50, borderRadius: 18, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.09)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  searchInput: { flex: 1, color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  groupList: { gap: 16, marginTop: 18 },
  groupCard: { borderRadius: 30, padding: 14, backgroundColor: "rgba(255,255,255,0.075)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  groupHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  groupTitleRow: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  groupIcon: { width: 42, height: 42, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(119,167,255,0.14)", borderWidth: 1, borderColor: "rgba(119,167,255,0.22)" },
  groupTextWrap: { flex: 1 },
  groupTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  groupSubtitle: { color: "rgba(255,255,255,0.62)", fontSize: 12, lineHeight: 17, fontWeight: "700", marginTop: 4 },
  groupCount: { minWidth: 30, textAlign: "center", color: "#07111E", fontSize: 12, fontWeight: "900", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: "#77A7FF" },
  emptyCard: { minHeight: 220, borderRadius: 30, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  emptyTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", marginTop: 12 },
  emptyText: { color: "rgba(255,255,255,0.64)", fontSize: 13, lineHeight: 19, fontWeight: "700", textAlign: "center", marginTop: 6 },
});
