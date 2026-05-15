
import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type DocumentOption = { id: string; name: string; meta: string };

type Props = {
  visible: boolean;
  accent: string;
  title?: string;
  subtitle?: string;
  pickDeviceLabel?: string;
  pickDeviceSubtitle?: string;
  sectionLabel?: string;
  emptyLabel?: string;
  onClose: () => void;
  onPickDevice: () => void;
  onSelect: (item: DocumentOption) => void;
  recentDocuments?: DocumentOption[];
};

export function DocumentQuickSheet({
  visible,
  accent,
  onClose,
  onPickDevice,
  onSelect,
  recentDocuments = [],
  title = "Document",
  subtitle = "Pick from device or recent files",
  pickDeviceLabel = "Pick from device",
  pickDeviceSubtitle = "document picker / storage",
  sectionLabel = "Recent files",
  emptyLabel = "No recent files",
}: Props) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <LinearGradient colors={["rgba(14,31,27,0.98)", "rgba(7,18,16,0.96)"]} style={[styles.card, { borderColor: `${accent}22` }]}>
            <View style={styles.headerRow}>
              <View style={styles.headerTextWrap}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>
              <Pressable onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed ? styles.pressed : undefined]}>
                <Ionicons name="close" size={15} color="#F6FFF9" />
              </Pressable>
            </View>

            <Pressable onPress={onPickDevice} style={({ pressed }) => [styles.primaryWrap, pressed ? styles.pressed : undefined]}>
              <LinearGradient colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]} style={[styles.primaryCard, { borderColor: `${accent}20` }]}>
                <View style={[styles.primaryIconWrap, { borderColor: `${accent}24`, backgroundColor: `${accent}12` }]}>
                  <Ionicons name="folder-open-outline" size={18} color={accent} />
                </View>
                <View style={styles.primaryTextWrap}>
                  <Text style={styles.primaryTitle}>{pickDeviceLabel}</Text>
                  <Text style={styles.primarySubtitle}>{pickDeviceSubtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="rgba(246,255,249,0.72)" />
              </LinearGradient>
            </Pressable>

            <Text style={styles.sectionLabel}>{sectionLabel}</Text>
            <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
              {recentDocuments.length ? recentDocuments.map((item) => (
                <Pressable key={item.id} onPress={() => onSelect(item)} style={({ pressed }) => [styles.itemWrap, pressed ? styles.pressed : undefined]}>
                  <LinearGradient colors={["rgba(255,255,255,0.045)", "rgba(255,255,255,0.02)"]} style={styles.item}>
                    <View style={[styles.itemIconWrap, { backgroundColor: `${accent}10`, borderColor: `${accent}18` }]}>
                      <Ionicons name="document-text-outline" size={16} color={accent} />
                    </View>
                    <View style={styles.itemTextWrap}>
                      <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.itemMeta} numberOfLines={1}>{item.meta}</Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              )) : (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>{emptyLabel}</Text>
                </View>
              )}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(2,8,7,0.22)", justifyContent: "flex-end" },
  wrap: { paddingHorizontal: 10 },
  card: { borderRadius: 24, borderWidth: 1, padding: 12, maxHeight: 460 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 },
  headerTextWrap: { flex: 1, paddingRight: 10 },
  title: { color: "#F6FFF9", fontSize: 14, fontWeight: "900" },
  subtitle: { marginTop: 2, color: "rgba(232,255,246,0.58)", fontSize: 11, fontWeight: "700" },
  closeButton: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.04)" },
  primaryWrap: { borderRadius: 18, overflow: "hidden", marginBottom: 12 },
  primaryCard: { minHeight: 58, borderRadius: 18, borderWidth: 1, paddingHorizontal: 12, flexDirection: "row", alignItems: "center" },
  primaryIconWrap: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  primaryTextWrap: { flex: 1, marginLeft: 10, marginRight: 10 },
  primaryTitle: { color: "#F6FFF9", fontSize: 12, fontWeight: "900" },
  primarySubtitle: { marginTop: 2, color: "rgba(232,255,246,0.56)", fontSize: 10, fontWeight: "700" },
  sectionLabel: { marginBottom: 8, color: "rgba(232,255,246,0.48)", fontSize: 10, fontWeight: "900", letterSpacing: 0.6, textTransform: "uppercase" },
  list: { paddingBottom: 4 },
  itemWrap: { marginBottom: 8, borderRadius: 16 },
  item: { minHeight: 60, borderRadius: 16, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  itemIconWrap: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  itemTextWrap: { flex: 1, marginLeft: 10 },
  itemTitle: { color: "#F6FFF9", fontSize: 12, fontWeight: "900" },
  itemMeta: { marginTop: 1, color: "rgba(232,255,246,0.64)", fontSize: 10, fontWeight: "700" },
  emptyWrap: { minHeight: 68, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.03)" },
  emptyText: { color: "rgba(232,255,246,0.58)", fontSize: 11, fontWeight: "700" },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
});

export default DocumentQuickSheet;

