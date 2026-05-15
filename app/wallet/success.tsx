import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { useI18n } from "../../src/shared/i18n";
import { walletText } from "../../src/shared/wallet/wallet-i18n";

const theme = {
  backgroundTop: "#163055",
  backgroundBottom: "#31588A",
  text: "#FFFFFF",
  muted: "#B8C5D8",
  accent: "#7CFF5B",
};

function tr(
  t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string,
  key: string,
  fallback: string,
) {
  return walletText(t, key, fallback);
}

export default function SuccessScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const params = useLocalSearchParams<{ title?: string; subtitle?: string; next?: string }>();

  const texts = useMemo(
    () => ({
      title: tr(t, "wallet.success.title", "Transfer request submitted"),
      subtitle: tr(
        t,
        "wallet.success.subtitle",
        "The operation was passed to secure wallet confirmation. Final status must come from the provider or wallet backend.",
      ),
      backToWallet: tr(t, "wallet.success.backToWallet", "Back to Wallet"),
    }),
    [t],
  );

  const title = typeof params.title === "string" && params.title.trim() ? params.title : texts.title;
  const subtitle =
    typeof params.subtitle === "string" && params.subtitle.trim() ? params.subtitle : texts.subtitle;
  const next = typeof params.next === "string" && params.next.trim() ? params.next : "/wallet/home";

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[theme.backgroundTop, theme.backgroundBottom]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.center}>
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark" size={38} color="#07110A" />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <Pressable style={styles.cta} onPress={() => router.replace(next as never)}>
          <Text style={styles.ctaText}>{texts.backToWallet}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.backgroundTop },
  container: { flex: 1, justifyContent: "space-between", paddingHorizontal: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.accent,
    marginBottom: 24,
  },
  title: { color: theme.text, fontSize: 30, fontWeight: "900", marginBottom: 10, textAlign: "center" },
  subtitle: { color: theme.muted, fontSize: 15, lineHeight: 22, textAlign: "center", maxWidth: 300 },
  cta: {
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: theme.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#07110A", fontWeight: "900", fontSize: 16 },
});
