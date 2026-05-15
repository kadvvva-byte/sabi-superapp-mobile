import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSabiTheme } from "../../theme/ThemeProvider";
import { FeedbackTone } from "../../modules/shared/types/feedback";

type Props = {
  tone?: FeedbackTone;
  title: string;
  description: string;
};

export default function WarningCard({
  tone = "warning",
  title,
  description,
}: Props) {
  const theme = useSabiTheme();

  const colors = {
    border: theme.colors.border ?? "rgba(255,255,255,0.08)",
    text: theme.colors.text ?? "#FFFFFF",
    textSecondary: theme.colors.textSecondary ?? "rgba(255,255,255,0.72)",
    surfaceSecondary: theme.colors.cardSoft ?? "#1F2A3D",
  };

  const toneMap = {
    neutral: colors.surfaceSecondary,
    info: colors.surfaceSecondary,
    success: colors.surfaceSecondary,
    warning: "rgba(255, 184, 0, 0.12)",
    danger: "rgba(255, 82, 82, 0.12)",
    compliance: "rgba(94, 92, 230, 0.14)",
  };

  const borderMap = {
    neutral: colors.border,
    info: colors.border,
    success: colors.border,
    warning: "rgba(255, 184, 0, 0.35)",
    danger: "rgba(255, 82, 82, 0.35)",
    compliance: "rgba(94, 92, 230, 0.35)",
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: toneMap[tone],
          borderColor: borderMap[tone],
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
});