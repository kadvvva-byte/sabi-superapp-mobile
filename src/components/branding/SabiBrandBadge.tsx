import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSabiTheme } from "../../theme/ThemeProvider";

type Props = {
  subtitle?: string;
};

export default function SabiBrandBadge({ subtitle = "Super App" }: Props) {
  const theme = useSabiTheme();

  const accent = theme.colors.accent || "#5B8CFF";
  const card = theme.colors.card || "#182033";
  const border = theme.colors.border || "#26324D";
  const text = theme.colors.text || "#FFFFFF";
  const textSecondary = theme.colors.textSecondary || "#94A3B8";

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: card,
            borderColor: border,
          },
        ]}
      >
        <View style={[styles.dot, { backgroundColor: accent }]} />
        <Text style={[styles.brandText, { color: text }]}>Sabi</Text>
      </View>

      <Text style={[styles.subtitle, { color: textSecondary }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "flex-start",
  },
  badge: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginRight: 10,
  },
  brandText: {
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
  },
});