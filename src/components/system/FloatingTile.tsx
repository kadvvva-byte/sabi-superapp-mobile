import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type Props = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  compact?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function FloatingTile({
  title,
  subtitle,
  icon,
  compact = false,
  onPress,
  style,
}: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <Pressable
        style={[styles.card, compact ? styles.cardCompact : null]}
        onPress={onPress}
      >
        <View style={styles.iconWrap}>{icon}</View>

        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  card: {
    flex: 1,
    minHeight: 128,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(15,21,35,0.88)",
    padding: 16,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  cardCompact: {
    minHeight: 112,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    gap: 6,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 18,
  },
});