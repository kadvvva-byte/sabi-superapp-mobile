import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { RotateCcw } from "lucide-react-native";

import { useHomeMobileText } from "../../../../shared/i18n/home-mobile-translations";
import { MiniAppItem } from "../types/miniApps.types";

export default function MiniAppsDrawer({
  visible,
  onClose,
  hiddenItems,
  onRestoreItem,
  onResetLayout,
}: {
  visible: boolean;
  onClose: () => void;
  hiddenItems: MiniAppItem[];
  onRestoreItem: (id: string) => void;
  onResetLayout: () => void;
}) {
  const text = useHomeMobileText();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <LinearGradient
          colors={["#061120", "#0A2038", "#102A4A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.drawer}
        >
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={styles.title}>{text.miniAppsTitle}</Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{text.miniAppsHiddenTitle}</Text>

              {hiddenItems.length === 0 ? (
                <Text style={styles.cardSubtitle}>{text.miniAppsAllVisible}</Text>
              ) : (
                <View style={styles.restoreList}>
                  {hiddenItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.9}
                      onPress={() => onRestoreItem(item.id)}
                      style={styles.restoreButton}
                    >
                      <Text style={styles.restoreButtonText}>{text.restorePrefix} {item.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity activeOpacity={0.9} onPress={onResetLayout} style={styles.resetButton}>
              <RotateCcw size={16} color="#FFFFFF" />
              <Text style={styles.resetButtonText}>{text.miniAppsResetLayout}</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>{text.done}</Text>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  drawer: {
    width: "86%",
    maxWidth: 420,
    borderTopLeftRadius: 26,
    borderBottomLeftRadius: 26,
    paddingTop: 10,
    borderLeftWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  handle: {
    alignSelf: "center",
    width: 56,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 14,
  },
  card: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginBottom: 14,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },
  cardSubtitle: {
    color: "rgba(220,235,255,0.78)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  restoreList: {
    gap: 8,
  },
  restoreButton: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  restoreButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  resetButton: {
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  closeButton: {
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: "#2B78FF",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});
