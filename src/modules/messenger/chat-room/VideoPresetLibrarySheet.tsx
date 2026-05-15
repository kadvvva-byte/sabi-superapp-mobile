import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { SavedVideoPreset } from "./videoEffects";

type Props = {
  visible: boolean;
  accent: string;
  presets: SavedVideoPreset[];
  activePresetId: string | null;
  onClose: () => void;
  onSelect: (preset: SavedVideoPreset) => void;
  onToggleFavorite: (presetId: string) => void;
};

export function VideoPresetLibrarySheet({
  visible,
  accent,
  presets,
  activePresetId,
  onClose,
  onSelect,
  onToggleFavorite,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <LinearGradient
          colors={["rgba(15,25,22,0.98)", "rgba(8,14,13,0.96)"]}
          style={styles.sheet}
        >
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>Sozlamalar kutubxonasi</Text>
              <Text style={styles.headerSubtitle}>Kamera, video va strim uchun sevimli ko‘rinishlar</Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeWrap}>
              {({ pressed }) => (
                <View style={[styles.closeButton, pressed ? styles.pressed : undefined]}>
                  <Ionicons name="close" size={18} color="#F6FFF9" />
                </View>
              )}
            </Pressable>
          </View>

          <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {presets.map((preset) => {
              const active = preset.id === activePresetId;

              return (
                <View key={preset.id} style={styles.rowWrap}>
                  <Pressable onPress={() => onSelect(preset)} style={styles.rowSelectWrap}>
                    {({ pressed }) => (
                      <LinearGradient
                        colors={
                          active
                            ? ["rgba(126,192,173,0.96)", "rgba(44,82,71,0.88)"]
                            : ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.03)"]
                        }
                        style={[styles.rowCard, pressed ? styles.pressed : undefined]}
                      >
                        <View style={styles.rowTextWrap}>
                          <Text style={[styles.rowTitle, active ? styles.rowTitleActive : undefined]}>
                            {preset.title}
                          </Text>
                          <Text style={[styles.rowSubtitle, active ? styles.rowSubtitleActive : undefined]}>
                            {preset.subtitle}
                          </Text>
                        </View>

                        <View style={styles.rowMetaWrap}>
                          <View style={styles.sourceBadge}>
                            <Text style={styles.sourceBadgeText}>{preset.source}</Text>
                          </View>

                          {active ? <Ionicons name="checkmark-circle" size={18} color="#071711" /> : null}
                        </View>
                      </LinearGradient>
                    )}
                  </Pressable>

                  <Pressable onPress={() => onToggleFavorite(preset.id)} style={styles.favoriteWrap}>
                    {({ pressed }) => (
                      <View style={[styles.favoriteButton, pressed ? styles.pressed : undefined]}>
                        <Ionicons
                          name={preset.isFavorite ? "star" : "star-outline"}
                          size={18}
                          color={preset.isFavorite ? "#FFD978" : accent}
                        />
                      </View>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(2,8,7,0.52)" },
  sheet: {
    minHeight: "58%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderColor: "rgba(170,255,224,0.14)",
  },
  header: { flexDirection: "row", alignItems: "center" },
  headerTitleWrap: { flex: 1, minWidth: 0 },
  headerTitle: { color: "#F6FFF9", fontSize: 17, fontWeight: "900" },
  headerSubtitle: { marginTop: 2, color: "rgba(232,255,246,0.70)", fontSize: 11, fontWeight: "700" },
  closeWrap: { width: 40, height: 40, borderRadius: 18, overflow: "hidden" },
  closeButton: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.05)" },
  scrollContent: { paddingTop: 12 },
  rowWrap: { flexDirection: "row", alignItems: "stretch", marginBottom: 10 },
  rowSelectWrap: { flex: 1, borderRadius: 20, overflow: "hidden" },
  rowCard: {
    minHeight: 74,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(170,255,224,0.10)",
  },
  rowTextWrap: { flex: 1, minWidth: 0 },
  rowTitle: { color: "#F6FFF9", fontSize: 13, fontWeight: "900" },
  rowTitleActive: { color: "#071711" },
  rowSubtitle: { marginTop: 2, color: "rgba(232,255,246,0.70)", fontSize: 10, fontWeight: "700" },
  rowSubtitleActive: { color: "rgba(7,23,17,0.72)" },
  rowMetaWrap: { alignItems: "flex-end", marginLeft: 10 },
  sourceBadge: {
    minHeight: 18,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    marginBottom: 6,
  },
  sourceBadgeText: { color: "#F6FFF9", fontSize: 8, fontWeight: "900", textTransform: "uppercase" },
  favoriteWrap: { width: 48, marginLeft: 8, borderRadius: 18, overflow: "hidden" },
  favoriteButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(170,255,224,0.10)",
    borderRadius: 18,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
});

