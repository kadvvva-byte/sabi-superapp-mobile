import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AppContainerProps = {
  children: React.ReactNode;
};

export default function AppContainer({ children }: AppContainerProps) {
  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <View style={styles.container}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#060F19",
  },
  container: {
    flex: 1,
    backgroundColor: "#060F19",
  },
});