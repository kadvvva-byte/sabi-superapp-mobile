import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Bot,
  Camera,
  Cast,
  CreditCard,
  FileText,
  Gamepad2,
  Globe,
  Image as ImageIcon,
  MessageCircle,
  QrCode,
  Settings,
  ShoppingBag,
  ChevronRight,
  LayoutGrid,
  Car,
} from "lucide-react-native";

type MiniAppItem = {
  id: string;
  title: string;
  subtitle?: string;
  kind?: string;
  enabled?: boolean;
  route?: string;
};

type MiniAppsSectionData = {
  id: string;
  title: string;
  subtitle?: string;
  items: MiniAppItem[];
};

export default function MiniAppsSection({
  section,
  rightLabel = "Open",
  onItemPress,
}: {
  section: MiniAppsSectionData;
  rightLabel?: string;
  onItemPress?: (item: MiniAppItem) => void;
}) {
  const openItem = (item: MiniAppItem) => {
    if (onItemPress) {
      onItemPress(item);
      return;
    }

    const target = item.route || "/mini-apps";

    try {
      router.push(target as never);
    } catch {
      router.push("/mini-apps" as never);
    }
  };

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.itemsWrap}>
        {section.items.map((item) => {
          const Icon = getItemIcon(item.kind || item.id);

          return (
            <Pressable
              key={item.id}
              onPress={() => openItem(item)}
              style={({ pressed }) => [
                styles.itemCard,
                pressed && styles.itemCardPressed,
              ]}
            >
              <View style={styles.itemLeft}>
                <View style={styles.iconWrap}>
                  <Icon size={18} color="#E7F1FF" />
                </View>

                <View style={styles.itemTextWrap}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                </View>
              </View>

              <View style={styles.itemRight}>
                <Text style={styles.rightLabel}>{rightLabel}</Text>
                <ChevronRight size={16} color="rgba(231,241,255,0.72)" />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function getItemIcon(kind: string) {
  switch ((kind || "").toLowerCase()) {
    case "messenger":
      return MessageCircle;
    case "wallet":
      return CreditCard;
    case "marketplace":
      return ShoppingBag;
    case "ai":
      return Bot;
    case "gallery":
      return ImageIcon;
    case "manage":
      return LayoutGrid;
    case "cast":
      return Cast;
    case "games":
      return Gamepad2;
    case "camera":
      return Camera;
    case "documents":
    case "files":
      return FileText;
    case "qr":
      return QrCode;
    case "taxi":
      return Car;
    case "settings":
      return Settings;
    case "web":
      return Globe;
    default:
      return LayoutGrid;
  }
}

const styles = StyleSheet.create({
  sectionCard: {
    marginBottom: 14,
    borderRadius: 24,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: "rgba(220,235,255,0.76)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
    marginBottom: 12,
  },
  itemsWrap: {
    gap: 10,
  },
  itemCard: {
    minHeight: 68,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemCardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  itemLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemTextWrap: {
    flex: 1,
  },
  itemTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 3,
  },
  itemSubtitle: {
    color: "rgba(220,235,255,0.72)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rightLabel: {
    color: "rgba(231,241,255,0.74)",
    fontSize: 12,
    fontWeight: "700",
  },
});