import React, { useCallback, useEffect, useState, type ComponentType } from "react";
import { ActivityIndicator, BackHandler, InteractionManager, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

type GestureScreenComponent = ComponentType<Record<string, never>>;

let cachedGestureScreen: GestureScreenComponent | null = null;

export default function HomeScreen() {
  const [GestureScreen, setGestureScreen] = useState<GestureScreenComponent | null>(
    () => cachedGestureScreen,
  );

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true,
      );

      return () => subscription.remove();
    }, []),
  );

  useEffect(() => {
    if (cachedGestureScreen) {
      setGestureScreen(() => cachedGestureScreen);
      return undefined;
    }

    let mounted = true;
    const task = InteractionManager.runAfterInteractions(() => {
      void import("../src/modules/home/gesture/GestureScreen")
        .then((module) => {
          const nextComponent = module.default as GestureScreenComponent;
          cachedGestureScreen = nextComponent;

          if (mounted) {
            setGestureScreen(() => nextComponent);
          }
        })
        .catch((error) => {
          console.warn(
            "[home] failed to load gesture screen",
            error instanceof Error ? error.message : error,
          );
        });
    });

    return () => {
      mounted = false;
      task.cancel?.();
    };
  }, []);

  if (!GestureScreen) {
    return (
      <View style={styles.loadingHost}>
        <ActivityIndicator size="large" color="#77E28C" />
      </View>
    );
  }

  return <GestureScreen />;
}

const styles = StyleSheet.create({
  loadingHost: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});

