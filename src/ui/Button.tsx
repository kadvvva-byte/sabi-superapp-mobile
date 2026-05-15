import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useSabiTheme } from "../theme/ThemeProvider";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type SabiButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  textStyle,
}: SabiButtonProps) {
  const theme = useSabiTheme();

  const getContainerStyle = (): StyleProp<ViewStyle> => {
    const stylesArray: StyleProp<ViewStyle>[] = [styles.base];

    if (variant === "primary") {
      stylesArray.push({
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
      });
    }

    if (variant === "secondary") {
      stylesArray.push({
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
      });
    }

    if (variant === "ghost") {
      stylesArray.push({
        backgroundColor: "transparent",
        borderColor: theme.colors.border,
      });
    }

    if (variant === "danger") {
      stylesArray.push({
        backgroundColor: theme.colors.danger,
        borderColor: theme.colors.danger,
      });
    }

    if (disabled || loading) {
      stylesArray.push(styles.disabled);
    }

    if (style) {
      stylesArray.push(style);
    }

    return stylesArray;
  };

  const getTextColor = () => {
    if (variant === "primary") return "#0F1115";
    if (variant === "danger") return "#FFFFFF";
    return theme.colors.text;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled || loading}
      style={getContainerStyle()}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: getTextColor() },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 15,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.6,
  },
});