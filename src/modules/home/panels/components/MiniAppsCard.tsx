import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bot,
  Camera,
  Cast,
  CreditCard,
  FileText,
  Gamepad2,
  Image as ImageIcon,
  MessageCircle,
  QrCode,
  Settings,
  ShoppingBag,
  CarTaxiFront,
  UtensilsCrossed,
} from "lucide-react-native";
import { MiniAppItem } from "../types/miniApps.types";

function getMiniAppIcon(kind: string) {
  switch (kind) {
    case "messenger": return MessageCircle;
    case "wallet": return CreditCard;
    case "marketplace": return ShoppingBag;
    case "ai": return Bot;
    case "gallery": return ImageIcon;
    case "manage": return Settings;
    case "cast": return Cast;
    case "games": return Gamepad2;
    case "camera": return Camera;
    case "documents":
    case "files": return FileText;
    case "qr": return QrCode;
    case "food": return UtensilsCrossed;
    case "taxi": return CarTaxiFront;
    default: return Settings;
  }
}

function getGradient(kind: string): [string, string, string] {
  switch (kind) {
    case "messenger": return ["#0F766E", "#14B8A6", "#99F6E4"];
    case "wallet": return ["#2450B8", "#3B82F6", "#8EC5FF"];
    case "marketplace": return ["#D66A1E", "#F59E0B", "#FFE18A"];
    case "ai": return ["#5B44C8", "#7C6DFF", "#AAC2FF"];
    case "gallery": return ["#7C3AED", "#A855F7", "#F0ABFC"];
    case "manage": return ["#4B5563", "#6B7280", "#D1D5DB"];
    case "cast": return ["#0F766E", "#14B8A6", "#7DD3FC"];
    case "games": return ["#2563EB", "#38BDF8", "#BAE6FD"];
    case "camera": return ["#3B3F46", "#6B7280", "#D1D5DB"];
    case "documents":
    case "files": return ["#0F766E", "#14B8A6", "#99F6E4"];
    case "qr": return ["#2E9C88", "#47C98F", "#A7F0C8"];
    case "food": return ["#F04A2F", "#FB7A2F", "#FFBE75"];
    case "taxi": return ["#C38A00", "#EAB308", "#FFE480"];
    default: return ["#475569", "#64748B", "#CBD5E1"];
  }
}

export default function MiniAppsCard({
  item,
  onPress,
  rightLabel,
}: {
  item: MiniAppItem;
  onPress?: () => void;
  rightLabel?: string;
}) {
  const Icon = getMiniAppIcon(item.kind);
  const colors = getGradient(item.kind);

  return (
    <Pressable onPress={onPress} style={styles.shadow}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View style={styles.glow} />
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <Icon size={20} color="#FFFFFF" />
          </View>

          <View style={styles.textWrap}>
            <Text style={styles.title}>{item.title}</Text>
          </View>

          {rightLabel ? <Text style={styles.rightLabel}>{rightLabel}</Text> : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#020814",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  card: {
    borderRadius: 20,
    padding: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  glow: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
    height: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 3,
  },
  subtitle: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  rightLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 8,
  },
});
