import { type ComponentType, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

type LazyRouteModule<TProps> = {
  default: ComponentType<TProps>;
};

type LazyRouteLoader<TProps> = () => Promise<LazyRouteModule<TProps>>;

export default function createLazyRouteScreen<TProps extends object = Record<string, never>>(
  loader: LazyRouteLoader<TProps>,
  displayName = "LazyRouteScreen",
) {
  function LazyRouteScreen(props: TProps) {
    const [Screen, setScreen] = useState<ComponentType<TProps> | null>(null);

    useEffect(() => {
      let mounted = true;

      loader()
        .then((module) => {
          if (!mounted) return;
          setScreen(() => module.default);
        })
        .catch((error) => {
          console.warn(
            "[lazy-route] screen load failed",
            error instanceof Error ? error.message : error,
          );
        });

      return () => {
        mounted = false;
      };
    }, []);

    if (!Screen) {
      return (
        <View style={styles.loadingHost}>
          <ActivityIndicator size="large" color="#77E28C" />
        </View>
      );
    }

    return <Screen {...props} />;
  }

  LazyRouteScreen.displayName = displayName;
  return LazyRouteScreen;
}

const styles = StyleSheet.create({
  loadingHost: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});
