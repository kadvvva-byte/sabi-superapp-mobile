import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSabiTheme } from "../../theme/ThemeProvider";

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export default function StateCard({
  title,
  description,
  actionLabel,
  onActionPress,
}: Props) {
  const theme = useSabiTheme();

  const colors = {
    surface: theme.colors.surface ?? "#081633",
    border: theme.colors.border ?? "rgba(255,255,255,0.08)",
    text: theme.colors.text ?? "#FFFFFF",
    textSecondary: theme.colors.textSecondary ?? "rgba(255,255,255,0.72)",
    primary: theme.colors.accent ?? "#7CFF00",
    background: theme.colors.background ?? "#06110A",
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
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      {description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      ) : null}

      {actionLabel && onActionPress ? (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onActionPress}
          activeOpacity={0.85}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    marginTop: 8,
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "800",
  },
});