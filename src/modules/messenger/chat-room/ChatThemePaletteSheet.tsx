import React from "react";
import {
  Modal,
  Pressable,
  PressableStateCallbackType,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChatBackgroundPreset } from "./types";

type Props = {
  visible: boolean;
  presets: ChatBackgroundPreset[];
  selectedId: string;
  onClose: () => void;
  onSelect: (presetId: string) => void;
};

const pressCardStyle = ({
  pressed,
}: PressableStateCallbackType): StyleProp<ViewStyle> =>
  pressed ? styles.cardPressed : undefined;

function getPreviewGradient(
  item: ChatBackgroundPreset,
): [string, string, string] {
  const theme = item as any;

  if (Array.isArray(theme.previewGradient) && theme.previewGradient.length >= 3) {
    return [
      String(theme.previewGradient[0]),
      String(theme.previewGradient[1]),
      String(theme.previewGradient[2]),
    ];
  }

  if (Array.isArray(theme.screenGradient) && theme.screenGradient.length >= 3) {
    return [
      String(theme.screenGradient[0]),
      String(theme.screenGradient[1]),
      String(theme.screenGradient[2]),
    ];
  }

  return ["#0A1815", "#0E2420", "#10302A"];
}

function getMineBubbleGradient(
  item: ChatBackgroundPreset,
): [string, string] {
  const theme = item as any;

  if (Array.isArray(theme.mineBubbleGradient) && theme.mineBubbleGradient.length >= 2) {
    return [
      String(theme.mineBubbleGradient[0]),
      String(theme.mineBubbleGradient[1]),
    ];
  }

  return ["#66F7CC", "#24D2A6"];
}

function getOtherBubbleColor(item: ChatBackgroundPreset): string {
  const theme = item as any;

  if (Array.isArray(theme.otherBubbleGradient) && theme.otherBubbleGradient.length >= 1) {
    return String(theme.otherBubbleGradient[0]);
  }

  return "rgba(16,28,25,0.94)";
}

function getAccent(item: ChatBackgroundPreset): string {
  return (item as any).accent ?? "#56F3C1";
}

function getActionIconColor(item: ChatBackgroundPreset): string {
  return (item as any).actionIconColor ?? "#071711";
}

function ThemeCard({
  item,
  selected,
  onPress,
}: {
  item: ChatBackgroundPreset;
  selected: boolean;
  onPress: () => void;
}) {
  const previewGradient = getPreviewGradient(item);
  const mineBubbleGradient = getMineBubbleGradient(item);
  const otherBubbleColor = getOtherBubbleColor(item);
  const accent = getAccent(item);

  return (
    <Pressable
      style={({ pressed }) => [styles.cardWrap, pressCardStyle({ pressed } as PressableStateCallbackType)]}
      onPress={onPress}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.045)", "rgba(255,255,255,0.02)"]}
        style={[styles.card, selected ? styles.cardSelected : undefined]}
      >
        <LinearGradient colors={previewGradient} style={styles.preview}>
          <View
            style={[
              styles.previewGlow,
              {
                backgroundColor:
                  (item as any).topGlow ?? "rgba(86,243,193,0.12)",
              },
            ]}
          />
          <View
            style={[
              styles.previewOtherBubble,
              { backgroundColor: otherBubbleColor },
            ]}
          />
          <LinearGradient
            colors={mineBubbleGradient}
            style={styles.previewMineBubble}
          />
        </LinearGradient>

        <View style={styles.cardTextWrap}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>

            {selected ? (
              <View
                style={[styles.selectedBadge, { backgroundColor: accent }]}
              >
                <Ionicons
                  name="checkmark"
                  size={13}
                  color={getActionIconColor(item)}
                />
              </View>
            ) : null}
          </View>

          <Text style={styles.cardSubtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>

          <View style={styles.swatchRow}>
            <View style={[styles.swatch, { backgroundColor: accent }]} />
            <View
              style={[styles.swatch, { backgroundColor: previewGradient[1] }]}
            />
            <View
              style={[styles.swatch, { backgroundColor: previewGradient[2] }]}
            />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export function ChatThemePaletteSheet({
  visible,
  presets,
  selectedId,
  onClose,
  onSelect,
}: Props) {
  const insets = useSafeAreaInsets();

  if (!visible || presets.length === 0) return null;

  const selected =
    presets.find((item) => item.id === selectedId) ?? presets[0];

  const selectedPreviewGradient = getPreviewGradient(selected);
  const selectedMineBubbleGradient = getMineBubbleGradient(selected);
  const selectedOtherBubbleColor = getOtherBubbleColor(selected);
  const selectedAccent = getAccent(selected);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.wrap,
            { paddingBottom: Math.max(insets.bottom, 10) },
          ]}
        >
          <LinearGradient
            colors={["rgba(13,30,26,0.985)", "rgba(7,18,16,0.97)"]}
            style={styles.sheet}
          >
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <View style={styles.headerTextWrap}>
                <Text style={styles.title}>Room themes</Text>
                <Text style={styles.subtitle}>
                  Choose a full premium background preset
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.closeButton,
                  pressCardStyle({ pressed } as PressableStateCallbackType),
                ]}
                onPress={onClose}
              >
                <Ionicons name="close" size={16} color="#F5FFF9" />
              </Pressable>
            </View>

            <LinearGradient
              colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
              style={[
                styles.selectedPreview,
                { borderColor: `${selectedAccent}22` },
              ]}
            >
              <LinearGradient
                colors={selectedPreviewGradient}
                style={styles.selectedPreviewCanvas}
              >
                <View
                  style={[
                    styles.selectedGlow,
                    {
                      backgroundColor:
                        (selected as any).topGlow ??
                        "rgba(86,243,193,0.12)",
                    },
                  ]}
                />
                <View
                  style={[
                    styles.selectedOtherBubble,
                    { backgroundColor: selectedOtherBubbleColor },
                  ]}
                />
                <LinearGradient
                  colors={selectedMineBubbleGradient}
                  style={styles.selectedMineBubble}
                />
              </LinearGradient>

              <View style={styles.selectedTextWrap}>
                <View style={styles.selectedTitleRow}>
                  <Text style={styles.selectedTitle}>{selected.title}</Text>
                  <View
                    style={[
                      styles.selectedDot,
                      { backgroundColor: selectedAccent },
                    ]}
                  />
                </View>
                <Text style={styles.selectedSubtitle}>
                  {selected.subtitle}
                </Text>
              </View>
            </LinearGradient>

            <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.grid}
            >
              {presets.map((item) => (
                <ThemeCard
                  key={item.id}
                  item={item}
                  selected={item.id === selectedId}
                  onPress={() => onSelect(item.id)}
                />
              ))}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2,8,7,0.24)",
    justifyContent: "flex-end",
  },
  wrap: {
    paddingHorizontal: 10,
  },
  sheet: {
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000000",
    shadowOpacity: 0.32,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,
    maxHeight: 620,
  },
  handle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: "#F5FFF9",
    fontSize: 16,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 3,
    color: "rgba(233,255,244,0.58)",
    fontSize: 11,
    fontWeight: "700",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  selectedPreview: {
    marginTop: 12,
    borderRadius: 22,
    borderWidth: 1,
    padding: 10,
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.035)",
  },
  selectedPreviewCanvas: {
    width: 110,
    height: 76,
    borderRadius: 18,
    padding: 10,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  selectedGlow: {
    position: "absolute",
    top: -24,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 80,
  },
  selectedOtherBubble: {
    width: 44,
    height: 14,
    borderRadius: 8,
  },
  selectedMineBubble: {
    alignSelf: "flex-end",
    width: 56,
    height: 18,
    borderRadius: 10,
  },
  selectedTextWrap: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  selectedTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedTitle: {
    color: "#F5FFF9",
    fontSize: 14,
    fontWeight: "900",
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    marginLeft: 6,
  },
  selectedSubtitle: {
    marginTop: 4,
    color: "rgba(233,255,244,0.58)",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  grid: {
    paddingTop: 12,
    paddingBottom: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrap: {
    width: "48.4%",
    marginBottom: 10,
    borderRadius: 18,
  },
  card: {
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  cardSelected: {
    borderColor: "rgba(255,255,255,0.14)",
  },
  preview: {
    height: 92,
    borderRadius: 16,
    padding: 10,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  previewGlow: {
    position: "absolute",
    top: -20,
    right: -16,
    width: 72,
    height: 72,
    borderRadius: 72,
  },
  previewOtherBubble: {
    width: 44,
    height: 14,
    borderRadius: 8,
  },
  previewMineBubble: {
    alignSelf: "flex-end",
    width: 56,
    height: 18,
    borderRadius: 10,
  },
  cardTextWrap: {
    paddingTop: 9,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    color: "#F5FFF9",
    fontSize: 13,
    fontWeight: "900",
    flex: 1,
    paddingRight: 8,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardSubtitle: {
    marginTop: 2,
    color: "rgba(233,255,244,0.56)",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },
  swatchRow: {
    marginTop: 8,
    flexDirection: "row",
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 99,
    marginRight: 6,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
});
