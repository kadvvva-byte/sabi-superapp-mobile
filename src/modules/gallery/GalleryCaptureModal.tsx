import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Film, X } from "lucide-react-native";

import { useI18n } from "../../shared/i18n";
import {
  VideoCaptureResult,
  VideoMessageCaptureScreen,
} from "../messenger/chat-room/VideoMessageCaptureScreen";

const NAVY = "#071321";
const NAVY_DEEP = "#030814";
const ACCENT = "#B8D3FF";

type CaptureMode = "photo" | "video_message";

type Props = {
  visible: boolean;
  accent: string;
  onClose: () => void;
  onCapture: (result: VideoCaptureResult) => void;
};

export default function GalleryCaptureModal({
  visible,
  accent,
  onClose,
  onCapture,
}: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [activeMode, setActiveMode] = useState<CaptureMode | null>(null);
  const [selectedMode, setSelectedMode] = useState<CaptureMode>("photo");

  const closeAll = () => {
    setActiveMode(null);
    onClose();
  };

  const closeChooserOnly = () => {
    setActiveMode(null);
  };

  return (
    <>
      <Modal visible={visible && !activeMode} transparent animationType="fade" onRequestClose={closeAll}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeAll} />
          <SafeAreaView style={styles.safe}>
            <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetTopRow}>
                <Text style={styles.sheetTitle}>{t("gallery.camera.title")}</Text>
                <Pressable onPress={closeAll} style={styles.closeButton} accessibilityLabel={t("common.close")}>
                  <X size={18} color="#F8FAFC" />
                </Pressable>
              </View>

              <View style={styles.modeRow}>
                <Pressable onPress={() => setSelectedMode("photo")} style={[styles.modeCardWrap, selectedMode === "photo" && styles.modeCardWrapActive]}>
                  <LinearGradient
                    colors={selectedMode === "photo" ? [ACCENT, "#D8E8FF"] : ["rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)"]}
                    style={styles.modeCard}
                  >
                    <Camera size={24} color={selectedMode === "photo" ? NAVY_DEEP : "#F8FAFC"} />
                    <Text style={[styles.modeTitle, selectedMode === "photo" && styles.modeTitleActive]}>{t("gallery.camera.photo")}</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable onPress={() => setSelectedMode("video_message")} style={[styles.modeCardWrap, selectedMode === "video_message" && styles.modeCardWrapActive]}>
                  <LinearGradient
                    colors={selectedMode === "video_message" ? [ACCENT, "#D8E8FF"] : ["rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)"]}
                    style={styles.modeCard}
                  >
                    <Film size={24} color={selectedMode === "video_message" ? NAVY_DEEP : "#F8FAFC"} />
                    <Text style={[styles.modeTitle, selectedMode === "video_message" && styles.modeTitleActive]}>{t("gallery.camera.video")}</Text>
                  </LinearGradient>
                </Pressable>
              </View>

              <Pressable onPress={() => setActiveMode(selectedMode)} style={styles.launchButton}>
                <Text style={styles.launchButtonText}>{t("gallery.camera.open")}</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <VideoMessageCaptureScreen
        visible={visible && !!activeMode}
        accent={accent}
        usageMode={activeMode ?? "photo"}
        onClose={() => {
          closeChooserOnly();
          onClose();
        }}
        onCapture={(result) => {
          setActiveMode(null);
          onCapture(result);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.50)", justifyContent: "flex-end" },
  safe: { flex: 1, justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: NAVY, paddingHorizontal: 14, paddingTop: 10, borderWidth: 1, borderBottomWidth: 0, borderColor: "rgba(190,214,255,0.10)" },
  sheetHandle: { alignSelf: "center", width: 46, height: 5, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.18)", marginBottom: 12 },
  sheetTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 },
  sheetTitle: { color: "#F8FAFC", fontSize: 20, fontWeight: "900" },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(190,214,255,0.10)", alignItems: "center", justifyContent: "center" },
  modeRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  modeCardWrap: { flex: 1, borderRadius: 24, overflow: "hidden" },
  modeCardWrapActive: { shadowColor: "#B8D3FF", shadowOpacity: 0.16, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  modeCard: { minHeight: 138, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 16, borderWidth: 1, borderColor: "rgba(190,214,255,0.10)", justifyContent: "space-between" },
  modeTitle: { color: "#F8FAFC", fontSize: 20, fontWeight: "900" },
  modeTitleActive: { color: NAVY_DEEP },
  launchButton: { minHeight: 54, borderRadius: 22, backgroundColor: ACCENT, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  launchButtonText: { color: NAVY_DEEP, fontSize: 14, fontWeight: "900" },
});
