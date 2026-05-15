import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { CustomVideoEffectConfig, DEFAULT_CUSTOM_VIDEO_EFFECT_CONFIG } from "./videoEffects";

type Props = {
  visible: boolean;
  accent: string;
  value: CustomVideoEffectConfig;
  presetName: string;
  onPresetNameChange: (next: string) => void;
  onChange: (next: CustomVideoEffectConfig) => void;
  onClose: () => void;
  onApply: () => void;
  onSavePreset: () => void;
};

type RowKey = keyof CustomVideoEffectConfig;

const ROWS: Array<{ key: RowKey; title: string; subtitle: string }> = [
  { key: "warmth", title: "Iliqlik", subtitle: "oltin / teri iliqligi" },
  { key: "coolness", title: "Sovuqlik", subtitle: "muz / yangi ohang" },
  { key: "glow", title: "Nur", subtitle: "yumshoq yoritish" },
  { key: "softness", title: "Yumshoqlik", subtitle: "go‘zallik / yuz silliqligi" },
  { key: "contrast", title: "Kontrast", subtitle: "kino / chuqurlik" },
  { key: "blur", title: "Xiralik", subtitle: "portret ajratish" },
  { key: "anime", title: "Anime", subtitle: "uslub kuchi" },
  { key: "saturation", title: "Rang to‘qligi", subtitle: "yorqin rang kuchi" },
];

export function VideoEffectCreatorSheet({
  visible,
  accent,
  value,
  presetName,
  onPresetNameChange,
  onChange,
  onClose,
  onApply,
  onSavePreset,
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
              <Text style={styles.headerTitle}>O‘z filteringizni yarating</Text>
              <Text style={styles.headerSubtitle}>Yuqori darajali strim ko‘rinishi, soxta yuz qatlamlarisiz.</Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeWrap}>
              {({ pressed }) => (
                <View style={[styles.closeButton, pressed ? styles.pressed : undefined]}>
                  <Ionicons name="close" size={18} color="#F6FFF9" />
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.nameCard}>
            <Text style={styles.nameLabel}>Sozlama nomi</Text>
            <TextInput
              value={presetName}
              onChangeText={onPresetNameChange}
              placeholder="Mening strim nurim"
              placeholderTextColor="rgba(232,255,246,0.40)"
              style={styles.nameInput}
            />
          </View>

          <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {ROWS.map((row) => (
              <View key={row.key} style={styles.rowCard}>
                <View style={styles.rowHeader}>
                  <View style={styles.rowTitleWrap}>
                    <Text style={styles.rowTitle}>{row.title}</Text>
                    <Text style={styles.rowSubtitle}>{row.subtitle}</Text>
                  </View>
                  <Text style={styles.rowValue}>{value[row.key]}%</Text>
                </View>

                <Slider
                  value={value[row.key]}
                  minimumValue={0}
                  maximumValue={100}
                  onValueChange={(next) =>
                    onChange({
                      ...value,
                      [row.key]: Math.round(next),
                    })
                  }
                  minimumTrackTintColor={accent}
                  maximumTrackTintColor="rgba(255,255,255,0.12)"
                />
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              onPress={() => {
                onChange(DEFAULT_CUSTOM_VIDEO_EFFECT_CONFIG);
                onPresetNameChange("Mening sozlamam");
              }}
              style={styles.footerButtonWrap}
            >
              {({ pressed }) => (
                <LinearGradient
                  colors={["rgba(42,70,63,0.86)", "rgba(15,26,23,0.82)"]}
                  style={[styles.footerButton, pressed ? styles.pressed : undefined]}
                >
                  <Text style={styles.footerButtonText}>Tiklash</Text>
                </LinearGradient>
              )}
            </Pressable>

            <Pressable onPress={onSavePreset} style={styles.footerButtonWrap}>
              {({ pressed }) => (
                <LinearGradient
                  colors={["rgba(53,92,79,0.90)", "rgba(20,35,31,0.84)"]}
                  style={[styles.footerButton, pressed ? styles.pressed : undefined]}
                >
                  <Text style={styles.footerButtonText}>Saqlash</Text>
                </LinearGradient>
              )}
            </Pressable>

            <Pressable onPress={onApply} style={styles.footerButtonWrap}>
              {({ pressed }) => (
                <LinearGradient
                  colors={["rgba(126,192,173,0.96)", "rgba(44,82,71,0.88)"]}
                  style={[styles.footerButton, pressed ? styles.pressed : undefined]}
                >
                  <Text style={styles.footerButtonTextDark}>Qo‘llash</Text>
                </LinearGradient>
              )}
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2,8,7,0.52)",
  },
  sheet: {
    minHeight: "74%",
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
  nameCard: {
    marginTop: 12,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(170,255,224,0.10)",
  },
  nameLabel: { color: "#F6FFF9", fontSize: 12, fontWeight: "800", marginBottom: 8 },
  nameInput: {
    minHeight: 42,
    borderRadius: 14,
    paddingHorizontal: 12,
    color: "#F6FFF9",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(170,255,224,0.10)",
    fontSize: 13,
    fontWeight: "700",
  },
  scrollContent: { paddingTop: 12, paddingBottom: 8 },
  rowCard: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(170,255,224,0.10)",
    marginBottom: 10,
  },
  rowHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  rowTitleWrap: { flex: 1, minWidth: 0 },
  rowTitle: { color: "#F6FFF9", fontSize: 13, fontWeight: "900" },
  rowSubtitle: { marginTop: 2, color: "rgba(232,255,246,0.68)", fontSize: 10, fontWeight: "700" },
  rowValue: { color: "#F6FFF9", fontSize: 12, fontWeight: "900" },
  footer: { marginTop: 6, flexDirection: "row" },
  footerButtonWrap: { flex: 1, marginHorizontal: 4, borderRadius: 18, overflow: "hidden" },
  footerButton: { minHeight: 46, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  footerButtonText: { color: "#F6FFF9", fontSize: 13, fontWeight: "900" },
  footerButtonTextDark: { color: "#071711", fontSize: 13, fontWeight: "900" },
  pressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
});

