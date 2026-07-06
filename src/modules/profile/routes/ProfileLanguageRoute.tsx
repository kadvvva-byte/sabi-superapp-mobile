import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Check, Search } from "lucide-react-native";

import { LANGUAGES, type LanguageItem } from "../../../shared/data/languages";
import { setAppLanguage, useI18n } from "../../../shared/i18n";
import { useProfileKernel } from "../../../core/kernel/profile/bindings";

function normalizeCode(input?: string | null): string {
  return String(input || "")
    .trim()
    .replace(/_/g, "-")
    .toLowerCase();
}

function dedupeLanguages(items: LanguageItem[]): LanguageItem[] {
  const seen = new Set<string>();
  const result: LanguageItem[] = [];

  for (const item of items) {
    const code = normalizeCode(item.code);
    if (!code || seen.has(code)) continue;
    seen.add(code);
    result.push(item);
  }

  return result;
}

function getSelectedCode(language: string, languages: LanguageItem[]): string {
  const normalized = normalizeCode(language);

  if (!normalized) return "en";

  const exactExists = languages.some(
    (item) => normalizeCode(item.code) === normalized,
  );
  if (exactExists) return normalized;

  const base = normalized.split("-")[0];
  const baseExists = languages.some(
    (item) => normalizeCode(item.code) === base,
  );

  return baseExists ? base : "en";
}

function getSearchText(item: LanguageItem): string {
  if (typeof item.searchText === "string" && item.searchText.trim()) {
    return item.searchText.toLowerCase();
  }

  return `${item.nativeName} ${item.englishName} ${item.code}`.toLowerCase();
}

export default function LanguageScreen() {
  const { language, t } = useI18n();
  const { facade, languageCode } = useProfileKernel();
  const [query, setQuery] = useState("");

  const uniqueLanguages = useMemo(() => dedupeLanguages(LANGUAGES), []);
  const selectedCode = useMemo(
    () => getSelectedCode(languageCode || language, uniqueLanguages),
    [language, languageCode, uniqueLanguages],
  );

  const filteredLanguages = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) return uniqueLanguages;

    return uniqueLanguages.filter((item) => getSearchText(item).includes(value));
  }, [query, uniqueLanguages]);

  const handleSelectLanguage = async (item: LanguageItem) => {
    await setAppLanguage(item.code);
    await facade.updateLanguageCode(item.code);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("languageScreen.title")}</Text>
          <Text style={styles.subtitle}>{t("languageScreen.subtitle")}</Text>
        </View>

        <View style={styles.searchWrap}>
          <Search size={18} color="rgba(255,255,255,0.72)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("languageScreen.searchPlaceholder")}
            placeholderTextColor="rgba(255,255,255,0.42)"
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <FlatList
          data={filteredLanguages}
          keyExtractor={(item) => normalizeCode(item.code)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const selected = normalizeCode(item.code) === selectedCode;

            return (
              <Pressable
                onPress={() => handleSelectLanguage(item)}
                style={[styles.row, selected && styles.rowSelected]}
              >
                <View style={styles.languageMeta}>
                  <Text style={styles.languageNative}>{item.nativeName}</Text>
                  <Text style={styles.languageEnglish}>
                    {item.englishName ?? item.name ?? item.code.toUpperCase()}
                  </Text>
                </View>

                {selected ? (
                  <View style={styles.badge}>
                    <Check size={16} color="#08110A" />
                    <Text style={styles.badgeText}>
                      {t("common.selected")}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#07111F",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 6,
  },
  subtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  searchWrap: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    paddingVertical: 12,
    marginLeft: 10,
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    minHeight: 64,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  rowSelected: {
    backgroundColor: "rgba(87, 191, 120, 0.18)",
    borderColor: "rgba(87, 191, 120, 0.38)",
  },
  languageMeta: {
    flex: 1,
    paddingRight: 12,
  },
  languageNative: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  languageEnglish: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    fontWeight: "600",
  },
  badge: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "#7AF59A",
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: {
    color: "#08110A",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
  },
});
