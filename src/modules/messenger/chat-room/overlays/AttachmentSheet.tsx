import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Camera,
  CreditCard,
  FileText,
  FolderOpen,
  MapPin,
  Smartphone,
  UserRound,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react-native";

export type AttachmentActionId =
  | "camera"
  | "gallery"
  | "document"
  | "location"
  | "contact"
  | "fiat"
  | "coin";

type AttachmentSheetProps = {
  visible: boolean;
  accent: string;
  accentSoft?: string;
  onClose: () => void;
  onSelect: (id: AttachmentActionId) => void;
};

type AttachmentActionCard = {
  id: AttachmentActionId;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: [string, string, string];
  iconColor?: string;
};

const PRIMARY_ACTIONS: AttachmentActionCard[] = [
  {
    id: "camera",
    title: "Camera",
    subtitle: "Photo or video",
    icon: Camera,
    gradient: ["#2D9CDB", "#56CCF2", "#BCEBFF"],
    iconColor: "#06243A",
  },
  {
    id: "gallery",
    title: "Gallery",
    subtitle: "Image or clip",
    icon: FolderOpen,
    gradient: ["#7C3AED", "#A855F7", "#E9D5FF"],
    iconColor: "#21083B",
  },
  {
    id: "document",
    title: "Document",
    subtitle: "PDF, DOC, ZIP",
    icon: FileText,
    gradient: ["#0F766E", "#14B8A6", "#B6FFF0"],
    iconColor: "#062A25",
  },
  {
    id: "location",
    title: "Location",
    subtitle: "Map point",
    icon: MapPin,
    gradient: ["#F59E0B", "#FBBF24", "#FFE7B0"],
    iconColor: "#3B2505",
  },
  {
    id: "contact",
    title: "Contact",
    subtitle: "Phone contact",
    icon: UserRound,
    gradient: ["#2563EB", "#60A5FA", "#D7E8FF"],
    iconColor: "#081C43",
  },
];

const PAYMENT_ACTIONS: AttachmentActionCard[] = [
  {
    id: "fiat",
    title: "Send fiat",
    subtitle: "Sabi Wallet",
    icon: CreditCard,
    gradient: ["#0B5D53", "#12A594", "#BFFFF1"],
    iconColor: "#06231F",
  },
  {
    id: "coin",
    title: "Send COIN",
    subtitle: "Coin Wallet",
    icon: Wallet,
    gradient: ["#8B5CF6", "#C084FC", "#F3E8FF"],
    iconColor: "#23103D",
  },
];

function ActionCard({
  item,
  onPress,
}: {
  item: AttachmentActionCard;
  onPress: (id: AttachmentActionId) => void;
}) {
  const Icon = item.icon;

  return (
    <Pressable onPress={() => onPress(item.id)} style={styles.actionCardPressable}>
      {({ pressed }) => (
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.actionCard, pressed ? styles.actionCardPressed : undefined]}
        >
          <View style={styles.actionGloss} />
          <View style={styles.actionHeader}>
            <View style={styles.actionIconWrap}>
              <Icon size={20} strokeWidth={2.3} color={item.iconColor ?? "#071711"} />
            </View>
          </View>

          <View>
            <Text style={styles.actionTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.actionSubtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>
          </View>
        </LinearGradient>
      )}
    </Pressable>
  );
}

export function AttachmentSheet({
  visible,
  accent,
  accentSoft,
  onClose,
  onSelect,
}: AttachmentSheetProps) {
  const handleSelect = (id: AttachmentActionId) => {
    onClose();
    onSelect(id);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={onClose} />

          <View style={styles.sheetWrap}>
            <LinearGradient
              colors={["rgba(7,20,17,0.98)", "rgba(5,15,13,0.96)"]}
              style={[
                styles.sheet,
                { borderColor: `${accent}24` },
              ]}
            >
              <View
                style={[
                  styles.sheetGlow,
                  { backgroundColor: `${accentSoft ?? accent}18` },
                ]}
              />

              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetTitle}>Attach</Text>
                  <Text style={styles.sheetSubtitle}>
                    Real actions only
                  </Text>
                </View>

                <Pressable onPress={onClose} style={styles.closeButtonWrap}>
                  {({ pressed }) => (
                    <View
                      style={[
                        styles.closeButton,
                        pressed ? styles.closeButtonPressed : undefined,
                        { borderColor: `${accent}20` },
                      ]}
                    >
                      <X size={18} strokeWidth={2.3} color="#F6FFF9" />
                    </View>
                  )}
                </Pressable>
              </View>

              <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.sectionHeader}>
                  <Smartphone size={15} strokeWidth={2.3} color={accent} />
                  <Text style={styles.sectionTitle}>Media & sharing</Text>
                </View>

                <View style={styles.grid}>
                  {PRIMARY_ACTIONS.map((item) => (
                    <ActionCard key={item.id} item={item} onPress={handleSelect} />
                  ))}
                </View>

                <View style={[styles.sectionHeader, styles.sectionHeaderSpacing]}>
                  <Wallet size={15} strokeWidth={2.3} color={accent} />
                  <Text style={styles.sectionTitle}>Wallet</Text>
                </View>

                <View style={styles.grid}>
                  {PAYMENT_ACTIONS.map((item) => (
                    <ActionCard key={item.id} item={item} onPress={handleSelect} />
                  ))}
                </View>
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default AttachmentSheet;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(1,6,5,0.44)",
  },
  sheetWrap: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  sheet: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: "rgba(7,20,17,0.98)",
  },
  sheetGlow: {
    position: "absolute",
    top: -28,
    right: -10,
    width: 160,
    height: 160,
    borderRadius: 160,
    opacity: 0.9,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sheetTitle: {
    color: "#F6FFF9",
    fontSize: 18,
    fontWeight: "900",
  },
  sheetSubtitle: {
    marginTop: 3,
    color: "rgba(232,255,246,0.62)",
    fontSize: 12,
    fontWeight: "600",
  },
  closeButtonWrap: {
    marginLeft: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
  },
  closeButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionHeaderSpacing: {
    marginTop: 16,
  },
  sectionTitle: {
    marginLeft: 8,
    color: "#F6FFF9",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCardPressable: {
    width: "48.5%",
    marginBottom: 10,
  },
  actionCard: {
    minHeight: 108,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "space-between",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  actionCardPressed: {
    transform: [{ scale: 0.985 }],
  },
  actionGloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "48%",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  actionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.24)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    color: "#071711",
    fontSize: 14,
    fontWeight: "900",
  },
  actionSubtitle: {
    marginTop: 3,
    color: "rgba(7,23,17,0.72)",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
});

