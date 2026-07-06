import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useQrMobileTranslations } from "../../../src/shared/i18n/qr-mobile-hooks";

function replaceQr(href: { pathname: string; params?: Record<string, string> }) {
  (router.replace as unknown as (nextHref: typeof href) => void)(href);
}

export default function CryptoScanScreen() {
  const insets = useSafeAreaInsets();
  const { tq } = useQrMobileTranslations();

  useEffect(() => {
    const timer = setTimeout(() => {
      replaceQr({ pathname: "/qr/scanner", params: { scope: "crypto_wallet" } });
    }, 120);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={["#06122B", "#101A35", "#040914"]} style={styles.root}>
      <View style={[styles.content, { paddingTop: Math.max(insets.top + 32, 56) }]}>
        <View style={styles.iconWrap}>
          <Ionicons name="scan" size={34} color="#B48CFF" />
        </View>
        <Text style={styles.title}>{tq("qr.mobile.crypto.scanRedirectTitle")}</Text>
        <Text style={styles.text}>{tq("qr.mobile.crypto.scanRedirectText")}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, alignItems: "center", justifyContent: "center" },
  iconWrap: { width: 76, height: 76, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(180,140,255,0.16)", borderWidth: 1, borderColor: "rgba(180,140,255,0.28)", marginBottom: 18 },
  title: { color: "#FFFFFF", fontSize: 24, lineHeight: 30, fontWeight: "900", textAlign: "center" },
  text: { color: "rgba(255,255,255,0.68)", fontSize: 13, lineHeight: 19, fontWeight: "700", textAlign: "center", marginTop: 8 },
});
