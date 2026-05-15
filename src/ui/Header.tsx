import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSabiTheme } from "../theme/ThemeProvider";
import SabiBrandBadge from "../components/branding/SabiBrandBadge";

type SabiHeaderProps = {
  title?: string;
  subtitle?: string;
  rightLabel?: string;
  onRightPress?: () => void;
  showBrand?: boolean;
  showBack?: boolean;
};

export default function Header({
  title,
  subtitle,
  rightLabel,
  onRightPress,
  showBrand = false,
  showBack = false,
}: SabiHeaderProps) {
  const theme = useSabiTheme();

  return (
    <View style={styles.wrapper}>
      <View style={styles.leftArea}>
        {showBack ? (
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
              ‹
            </Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.left}>
          {showBrand ? (
            <SabiBrandBadge subtitle={subtitle || "Super App"} />
          ) : (
            <>
              {title ? (
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  {title}
                </Text>
              ) : null}

              {subtitle ? (
                <Text
                  style={[
                    styles.subtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {subtitle}
                </Text>
              ) : null}
            </>
          )}
        </View>
      </View>

      {rightLabel && onRightPress ? (
        <TouchableOpacity
          style={[
            styles.action,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={onRightPress}
        >
          <Text style={[styles.actionText, { color: theme.colors.text }]}>
            {rightLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  leftArea: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  left: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 24,
  },
  action: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "700",
  },
});