import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type DockButtonProps = {
  label?: string;
  icon?: React.ReactNode;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  labelStyle?: TextStyle;
};

export default function DockButton({
  label,
  icon,
  active = false,
  onPress,
  style,
  labelStyle,
}: DockButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.outer,
        active && styles.outerActive,
        pressed && styles.pressed,
        style,
      ]}
    >
      <LinearGradient
        colors={
          active
            ? [
                "rgba(255,255,255,0.22)",
                "rgba(255,255,255,0.10)",
                "rgba(255,255,255,0.05)",
              ]
            : [
                "rgba(255,255,255,0.14)",
                "rgba(255,255,255,0.06)",
                "rgba(255,255,255,0.03)",
              ]
        }
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.surface}
      >
        <View style={styles.topGlow} />
        <View style={styles.innerBorder} />

        <View style={styles.content}>
          {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
          {label ? (
            <Text
              numberOfLines={1}
              style={[styles.label, active && styles.labelActive, labelStyle]}
            >
              {label}
            </Text>
          ) : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 10,
  },

  outerActive: {
    shadowOpacity: 0.32,
    shadowRadius: 22,
    elevation: 14,
  },

  pressed: {
    transform: [{ scale: 0.97 }],
  },

  surface: {
    minHeight: 58,
    minWidth: 58,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(17, 25, 40, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  topGlow: {
    position: "absolute",
    top: 1,
    left: 10,
    right: 10,
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  innerBorder: {
    position: "absolute",
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    color: "rgba(255,255,255,0.86)",
  },

  labelActive: {
    color: "#FFFFFF",
  },
});