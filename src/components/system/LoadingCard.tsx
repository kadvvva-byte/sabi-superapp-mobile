import React from "react";
import { StyleSheet, View } from "react-native";
import { useSabiTheme } from "../../theme/ThemeProvider";

export default function LoadingCard() {
  const theme = useSabiTheme();

  const colors = {
    surface: theme.colors.surface ?? "#081633",
    surfaceSecondary: theme.colors.cardSoft ?? "#1F2A3D",
    border: theme.colors.border ?? "rgba(255,255,255,0.08)",
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.lineLg, { backgroundColor: colors.surfaceSecondary }]} />
      <View style={[styles.lineMd, { backgroundColor: colors.surfaceSecondary }]} />
      <View style={[styles.lineSm, { backgroundColor: colors.surfaceSecondary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  lineLg: {
    height: 28,
    borderRadius: 10,
    width: "72%",
  },
  lineMd: {
    height: 18,
    borderRadius: 10,
    width: "100%",
  },
  lineSm: {
    height: 18,
    borderRadius: 10,
    width: "58%",
  },
});