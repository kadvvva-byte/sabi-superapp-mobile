import React, { memo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export type ProfileSectionCardProps = {
  title?: string;
  eyebrow?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const TEXT = "#F5FBFF";
const BORDER = "rgba(120, 220, 160, 0.12)";

function ProfileSectionCard({
  title,
  eyebrow,
  children,
  footer,
  style,
}: ProfileSectionCardProps) {
  return (
    <LinearGradient
      colors={["rgba(16, 31, 48, 0.90)", "rgba(12, 27, 43, 0.88)", "rgba(10, 30, 26, 0.88)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      {eyebrow || title ? (
        <View style={styles.header}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>
      ) : null}

      <View style={styles.body}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </LinearGradient>
  );
}

export default memo(ProfileSectionCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    padding: 16,
    gap: 14,
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    color: "#77E28C",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    color: TEXT,
    fontSize: 20,
    fontWeight: "900",
  },
  body: {
    gap: 12,
  },
  footer: {
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
});
