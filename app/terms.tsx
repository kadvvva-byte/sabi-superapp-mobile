import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";

import { useI18n } from "../src/shared/i18n";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

export default function TermsScreen() {
  const i18n = useI18n() as I18nHookValue;

  const t = (key: string, params?: Record<string, unknown>) => {
    if (typeof i18n === "function") {
      const value = i18n(key, params);
      return typeof value === "string" && value.length ? value : key;
    }

    if (i18n && typeof i18n.t === "function") {
      const value = i18n.t(key, params);
      return typeof value === "string" && value.length ? value : key;
    }

    return key;
  };

  const tx = (key: string) => {
    const value = t(key);
    return value === key ? "" : value;
  };

  return (
    <LinearGradient
      colors={["#020814", "#07172D", "#0A2242", "#0C2B52"]}
      style={styles.gradient}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={18} color="#E7F1FF" />
            </Pressable>

            <Text style={styles.title}>{tx("legal.termsOfService")}</Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {tx("termsScreen.paragraph1") ? (
              <Text style={styles.text}>{tx("termsScreen.paragraph1")}</Text>
            ) : null}
            {tx("termsScreen.paragraph2") ? (
              <Text style={styles.text}>{tx("termsScreen.paragraph2")}</Text>
            ) : null}
            {tx("termsScreen.paragraph3") ? (
              <Text style={styles.text}>{tx("termsScreen.paragraph3")}</Text>
            ) : null}
            {tx("termsScreen.paragraph4") ? (
              <Text style={styles.text}>{tx("termsScreen.paragraph4")}</Text>
            ) : null}
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    flex: 1,
  },
  content: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "rgba(16,35,62,0.88)",
    borderWidth: 1,
    borderColor: "rgba(180,215,255,0.10)",
  },
  text: {
    color: "rgba(220,235,255,0.78)",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 14,
  },
});
