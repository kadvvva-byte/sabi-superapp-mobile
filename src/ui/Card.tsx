import React, { ReactNode } from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useSabiTheme } from "../theme/ThemeProvider";

type CardProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function Card({ children, style }: CardProps) {
  const theme = useSabiTheme();

  const backgroundColor =
    theme.colors?.card || theme.colors?.surface || "#182033";

  const borderColor = theme.colors?.border || "#26324D";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
});