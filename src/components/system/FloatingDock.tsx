import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type FloatingDockProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function FloatingDock({
  children,
  style,
}: FloatingDockProps) {
  return (
    <View style={[styles.shadowWrap, style]}>
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.16)",
          "rgba(255,255,255,0.08)",
          "rgba(255,255,255,0.04)",
        ]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={styles.dock}
      >
        <View style={styles.topGlow} />
        <View style={styles.innerBorder} />
        <View style={styles.content}>{children}</View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 26,
    elevation: 14,
  },

  dock: {
    minHeight: 74,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(14, 22, 34, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: "center",
  },

  topGlow: {
    position: "absolute",
    top: 1,
    left: 14,
    right: 14,
    height: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  innerBorder: {
    position: "absolute",
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
});