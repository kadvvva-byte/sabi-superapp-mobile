import React from "react";
import { SafeAreaView, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { useSabiTheme } from "../src/theme/ThemeProvider";

type AppContainerProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function AppContainer({ children, style }: AppContainerProps) {
  const { colors } = useSabiTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
