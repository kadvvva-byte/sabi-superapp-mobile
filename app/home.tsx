import React, {
  useCallback,
  useEffect,
  useState,
  type ComponentType,
} from "react";
import {
  ActivityIndicator,
  BackHandler,
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";

type GestureScreenComponent = ComponentType<Record<string, never>>;

let cachedGestureScreen: GestureScreenComponent | null = null;

export default function HomeScreen() {
  const [GestureScreen, setGestureScreen] = useState<GestureScreenComponent | null>(
    () => cachedGestureScreen,
  );
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadingTooLong, setLoadingTooLong] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

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
      setLoadFailed(false);
      setLoadingTooLong(false);
      return undefined;
    }

    let mounted = true;

    setLoadFailed(false);
    setLoadingTooLong(false);

    const slowTimer = setTimeout(() => {
      if (mounted) {
        setLoadingTooLong(true);
      }
    }, 6500);

    const task = InteractionManager.runAfterInteractions(() => {
      void import("../src/modules/home/gesture/GestureScreen")
        .then((module) => {
          const nextComponent = module.default as GestureScreenComponent;
          cachedGestureScreen = nextComponent;

          if (mounted) {
            setGestureScreen(() => nextComponent);
            setLoadFailed(false);
            setLoadingTooLong(false);
          }
        })
        .catch((error) => {
          console.warn(
            "[home] failed to load gesture screen",
            error instanceof Error ? error.message : error,
          );

          if (mounted) {
            setLoadFailed(true);
            setLoadingTooLong(false);
          }
        });
    });

    return () => {
      mounted = false;
      clearTimeout(slowTimer);
      task.cancel?.();
    };
  }, [retryKey]);

  const handleRetry = useCallback(() => {
    cachedGestureScreen = null;
    setGestureScreen(null);
    setLoadFailed(false);
    setLoadingTooLong(false);
    setRetryKey((value) => value + 1);
  }, []);

  const openRoute = useCallback((path: "/taxi" | "/stream" | "/tabs") => {
    router.push(path as never);
  }, []);

  if (GestureScreen) {
    return <GestureScreen />;
  }

  if (!loadFailed && !loadingTooLong) {
    return (
      <View style={styles.loadingHost}>
        <ActivityIndicator size="large" color="#77E28C" />
        <Text style={styles.loadingText}>Загрузка Sabi SuperApp…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.fallbackRoot}
      contentContainerStyle={styles.fallbackContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <Text style={styles.badge}>БЕЗОПАСНЫЙ ЗАПУСК</Text>
        <Text style={styles.title}>Главный экран временно не загрузился</Text>
        <Text style={styles.text}>
          Приложение не должно зависать на пустой загрузке. Можно повторить
          загрузку главного экрана или открыть нужный раздел напрямую.
        </Text>

        <Pressable style={styles.primaryButton} onPress={handleRetry}>
          <Text style={styles.primaryButtonText}>Повторить загрузку</Text>
        </Pressable>

        <View style={styles.grid}>
          <Pressable style={styles.secondaryButton} onPress={() => openRoute("/taxi")}>
            <Text style={styles.secondaryButtonText}>Такси</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => openRoute("/stream")}>
            <Text style={styles.secondaryButtonText}>Стрим</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => openRoute("/tabs")}>
            <Text style={styles.secondaryButtonText}>Мессенджер</Text>
          </Pressable>
        </View>

        <Text style={styles.note}>
          Этот экран не выполняет платежи, провайдерские операции или серверные изменения.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingHost: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020814",
    padding: 24,
  },
  loadingText: {
    marginTop: 14,
    color: "#DCEBFF",
    fontSize: 14,
    fontWeight: "700",
  },
  fallbackRoot: {
    flex: 1,
    backgroundColor: "#020814",
  },
  fallbackContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "rgba(119, 226, 140, 0.32)",
    backgroundColor: "rgba(8, 24, 46, 0.96)",
    borderRadius: 28,
    padding: 22,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(119, 226, 140, 0.14)",
    color: "#A8FFC0",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  title: {
    marginTop: 18,
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
  },
  text: {
    marginTop: 12,
    color: "#C8D8F2",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },
  primaryButton: {
    marginTop: 22,
    borderRadius: 18,
    backgroundColor: "#77E28C",
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#02130B",
    fontSize: 16,
    fontWeight: "900",
  },
  grid: {
    marginTop: 14,
    gap: 10,
  },
  secondaryButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(220, 235, 255, 0.18)",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#DCEBFF",
    fontSize: 15,
    fontWeight: "900",
  },
  note: {
    marginTop: 16,
    color: "#8FA6C6",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
});
