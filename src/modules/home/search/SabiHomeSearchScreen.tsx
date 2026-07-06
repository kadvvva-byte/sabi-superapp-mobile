import React, { useMemo, useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Globe2, Search, ShieldCheck } from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import { useHomeMobileText } from "../../../shared/i18n/home-mobile-translations";
import { localizeSilkRoadMiniAppItems } from "../../marketplace/presentation/marketplace.i18n";
import { MINI_APPS_ALL } from "../panels/data/miniApps.data";
import { normalizeSabiHomeRoute } from "../navigation/homeRoutes";

export default function SabiHomeSearchScreen() {
  const insets = useSafeAreaInsets();
  const homeText = useHomeMobileText();
  const { language } = useI18n();
  const miniAppsAll = useMemo(() => localizeSilkRoadMiniAppItems(MINI_APPS_ALL, language), [language]);
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalizedQuery) return [];
    return miniAppsAll.filter((item) => {
      const text = `${item.title} ${item.subtitle} ${item.kind} ${item.category}`.toLowerCase();
      return text.includes(normalizedQuery);
    }).slice(0, 24);
  }, [miniAppsAll, normalizedQuery]);

  const openInternal = (route?: string) => {
    router.push(normalizeSabiHomeRoute(route || "/mini-apps") as never);
  };

  const openInternetSearch = () => {
    const q = query.trim();
    if (!q) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    void Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#06111F", "#10233F", "#0F766E"]} style={styles.screen}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}> 
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>{homeText.searchTitle}</Text>
          <View style={styles.iconButton}>
            <Search size={20} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.searchBox}>
          <Search size={19} color="rgba(255,255,255,0.72)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={homeText.searchPlaceholder}
            placeholderTextColor="rgba(255,255,255,0.55)"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={openInternetSearch}
          />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.noticeCard}>
            <ShieldCheck size={18} color="#BBF7D0" />
            <Text style={styles.noticeText}>{homeText.searchSafe}</Text>
          </View>

          <Text style={styles.sectionTitle}>{homeText.searchInside}</Text>
          {!normalizedQuery ? (
            <Text style={styles.emptyText}>{homeText.searchEmpty}</Text>
          ) : results.length ? (
            <View style={styles.resultList}>
              {results.map((item) => (
                <Pressable key={item.id} onPress={() => openInternal(item.route)} style={styles.resultCard}>
                  <View style={styles.resultIcon}>
                    <Text style={styles.resultIconText}>{item.title.slice(0, 1).toUpperCase()}</Text>
                  </View>
                  <View style={styles.resultTextWrap}>
                    <Text style={styles.resultTitle}>{item.title}</Text>
                    <Text style={styles.resultSubtitle} numberOfLines={2}>{item.subtitle}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>{homeText.searchNoResults}</Text>
          )}

          <Text style={styles.sectionTitle}>{homeText.searchInternet}</Text>
          <Pressable onPress={openInternetSearch} style={styles.internetCard} disabled={!query.trim()}>
            <Globe2 size={21} color="#FFFFFF" />
            <View style={styles.resultTextWrap}>
              <Text style={styles.resultTitle}>{homeText.searchOpenInternet}</Text>
              <Text style={styles.resultSubtitle}>{homeText.searchInternetHint}</Text>
            </View>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#06111F" },
  screen: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 42, height: 42, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  searchBox: { marginHorizontal: 16, borderRadius: 22, minHeight: 54, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10 },
  input: { flex: 1, color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  content: { padding: 16, gap: 14, paddingBottom: 28 },
  noticeCard: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 18, padding: 12, backgroundColor: "rgba(15,118,110,0.24)", borderWidth: 1, borderColor: "rgba(187,247,208,0.22)" },
  noticeText: { flex: 1, color: "#DCFCE7", fontSize: 13, fontWeight: "700", lineHeight: 18 },
  sectionTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "900", marginTop: 4 },
  emptyText: { color: "rgba(255,255,255,0.68)", fontSize: 14, lineHeight: 20 },
  resultList: { gap: 10 },
  resultCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 20, padding: 12, backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  resultIcon: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.14)" },
  resultIconText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  resultTextWrap: { flex: 1 },
  resultTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  resultSubtitle: { color: "rgba(255,255,255,0.68)", fontSize: 12, lineHeight: 17, marginTop: 3 },
  internetCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 22, padding: 14, backgroundColor: "rgba(37,99,235,0.24)", borderWidth: 1, borderColor: "rgba(147,197,253,0.28)" },
});
