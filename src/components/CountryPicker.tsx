import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, X, Check } from "lucide-react-native";

import { COUNTRIES } from "../data/countries";
import { useI18n } from "../shared/i18n";

type CountryRow = (typeof COUNTRIES)[number];

type Props = {
  visible: boolean;
  selectedCode: string;
  onClose: () => void;
  onSelect: (country: CountryRow) => void;
};

function normalize(input?: string | null): string {
  return String(input || "").trim().toLowerCase();
}

export default function CountryPicker({
  visible,
  selectedCode,
  onClose,
  onSelect,
}: Props) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!visible) {
      setQuery("");
    }
  }, [visible]);

  const title = t("auth.countryPlaceholder");
  const searchPlaceholder = `${t("common.search")} ${t("common.country").toLowerCase()}`;
  const noCodeLabel = t("common.unavailable");

  const filteredCountries = useMemo(() => {
    const value = normalize(query);

    if (!value) return COUNTRIES;

    return COUNTRIES.filter((item) => {
      const searchText = [
        item.name,
        item.code,
        item.dialCode,
        item.flag,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchText.includes(value);
    });
  }, [query]);

  const handleSelect = (item: CountryRow) => {
    onSelect(item);
    setQuery("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <SafeAreaView style={styles.sheet} edges={["top", "bottom"]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={18} color="#E7F1FF" />
            </Pressable>
          </View>

          <View style={styles.searchWrap}>
            <Search size={18} color="rgba(255,255,255,0.72)" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor="rgba(255,255,255,0.42)"
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = item.code === selectedCode;

              return (
                <Pressable
                  onPress={() => handleSelect(item)}
                  style={[styles.item, isSelected && styles.itemSelected]}
                >
                  <View style={styles.itemLeft}>
                    <Text style={styles.flag}>{item.flag ?? "🌐"}</Text>

                    <View style={styles.meta}>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.code}>
                        {item.code}
                        {item.dialCode ? ` • ${item.dialCode}` : ` • ${noCodeLabel}`}
                      </Text>
                    </View>
                  </View>

                  {isSelected ? (
                    <View style={styles.badge}>
                      <Check size={14} color="#08110A" />
                    </View>
                  ) : null}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.34)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: "88%",
    backgroundColor: "#07111F",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  header: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    flex: 1,
    paddingRight: 12,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
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
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    paddingVertical: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  item: {
    minHeight: 66,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  itemSelected: {
    backgroundColor: "rgba(87, 191, 120, 0.18)",
    borderColor: "rgba(87, 191, 120, 0.38)",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  meta: {
    flex: 1,
    paddingRight: 12,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 2,
  },
  code: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    fontWeight: "600",
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "#7AF59A",
    alignItems: "center",
    justifyContent: "center",
  },
});
