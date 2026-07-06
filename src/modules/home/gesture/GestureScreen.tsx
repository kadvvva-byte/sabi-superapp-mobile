import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  PanResponder,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHomeEditMode } from "../HomeEditModeProvider";
import HomePanel from "../panels/HomePanel";

type PanelKey = "messenger" | "home" | "wallet" | "miniapps";
type LazyPanelKey = Exclude<PanelKey, "home">;
type LazyPanelComponent = ComponentType<{ onBack?: () => void }>;

const lazyPanelLoaders: Record<LazyPanelKey, () => Promise<{ default: LazyPanelComponent }>> = {
  messenger: () => import("../panels/MessengerPanel"),
  wallet: () => import("../panels/WalletPanel"),
  miniapps: () => import("../panels/MiniAppsPanel"),
};

const cachedLazyPanels: Partial<Record<LazyPanelKey, LazyPanelComponent>> = {};

const LEFT_EDGE_ZONE = 18;
const RIGHT_EDGE_ZONE = 18;
const TOP_EDGE_ZONE = 44;
const BOTTOM_EDGE_ZONE = 14;

const START_THRESHOLD_X = 10;
const START_THRESHOLD_Y = 10;

const COMPLETE_VELOCITY_X = 0.2;
const COMPLETE_VELOCITY_Y = 0.1;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function GestureScreen() {
  const insets = useSafeAreaInsets();
  const windowSize = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const { isHomeEditMode } = useHomeEditMode();

  const [layoutSize, setLayoutSize] = useState({
    width: Math.max(1, windowSize.width),
    height: Math.max(1, windowSize.height),
  });
  const [currentPanel, setCurrentPanel] = useState<PanelKey>("home");
  const currentPanelRef = useRef<PanelKey>("home");
  const [lazyPanels, setLazyPanels] = useState<Partial<Record<LazyPanelKey, LazyPanelComponent>>>(
    () => ({ ...cachedLazyPanels }),
  );
  const loadingLazyPanelsRef = useRef<Partial<Record<LazyPanelKey, boolean>>>({});

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const screenWidth = Math.max(1, layoutSize.width || windowSize.width);
  const screenHeight = Math.max(1, layoutSize.height || windowSize.height);

  const completeDistanceX = screenWidth * 0.18;
  const completeDistanceY = screenHeight * 0.08;

  const positions = useMemo(
    () => ({
      messenger: { x: screenWidth, y: 0 },
      home: { x: 0, y: 0 },
      wallet: { x: -screenWidth, y: 0 },
      miniapps: { x: 0, y: -screenHeight },
    }),
    [screenWidth, screenHeight],
  );

  const loadLazyPanel = useCallback((panel: LazyPanelKey) => {
    if (cachedLazyPanels[panel] || loadingLazyPanelsRef.current[panel]) {
      return;
    }

    loadingLazyPanelsRef.current[panel] = true;

    void lazyPanelLoaders[panel]()
      .then((module) => {
        cachedLazyPanels[panel] = module.default;
        setLazyPanels((current) => ({
          ...current,
          [panel]: module.default,
        }));
      })
      .catch((error) => {
        console.warn(
          `[home] failed to load ${panel} panel`,
          error instanceof Error ? error.message : error,
        );
      })
      .finally(() => {
        loadingLazyPanelsRef.current[panel] = false;
      });
  }, []);

  const syncCurrentPanelPosition = useCallback(() => {
    const panel = currentPanelRef.current;
    translateX.setValue(positions[panel].x);
    translateY.setValue(positions[panel].y);
  }, [positions, translateX, translateY]);

  useEffect(() => {
    syncCurrentPanelPosition();
  }, [syncCurrentPanelPosition]);

  const handleRootLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const nextWidth = Math.max(1, Math.round(event.nativeEvent.layout.width));
      const nextHeight = Math.max(1, Math.round(event.nativeEvent.layout.height));

      setLayoutSize((current) => {
        if (current.width === nextWidth && current.height === nextHeight) {
          return current;
        }

        return { width: nextWidth, height: nextHeight };
      });
    },
    [],
  );

  const animateTo = useCallback(
    (panel: PanelKey) => {
      if (panel !== "home") {
        loadLazyPanel(panel);
      }

      currentPanelRef.current = panel;

      Animated.parallel([
        Animated.timing(translateX, {
          toValue: positions[panel].x,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: positions[panel].y,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setCurrentPanel(panel);
        }
      });
    },
    [loadLazyPanel, positions, translateX, translateY],
  );

  const goHome = useCallback(() => {
    animateTo("home");
  }, [animateTo]);

  // Dedicated strip below the raised Home dock.
  // It restores Mini Apps access without covering the dock buttons.
  const bottomMiniAppsZoneHeight = isWeb ? 0 : 48;

  const homeToMessengerResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isHomeEditMode && currentPanelRef.current === "home",
        onMoveShouldSetPanResponder: (_, gesture) => {
          const shouldOpen =
            !isHomeEditMode &&
            currentPanelRef.current === "home" &&
            Math.abs(gesture.dx) > START_THRESHOLD_X &&
            Math.abs(gesture.dx) > Math.abs(gesture.dy) &&
            gesture.dx > 0;

          if (shouldOpen) {
            loadLazyPanel("messenger");
          }

          return shouldOpen;
        },
        onPanResponderMove: (_, gesture) => {
          translateX.setValue(clamp(gesture.dx, 0, screenWidth));
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldOpen =
            gesture.dx > completeDistanceX || gesture.vx > COMPLETE_VELOCITY_X;
          animateTo(shouldOpen ? "messenger" : "home");
        },
        onPanResponderTerminate: () => {
          animateTo("home");
        },
      }),
    [animateTo, completeDistanceX, isHomeEditMode, loadLazyPanel, screenWidth, translateX],
  );

  const homeToWalletResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isHomeEditMode && currentPanelRef.current === "home",
        onMoveShouldSetPanResponder: (_, gesture) => {
          const shouldOpen =
            !isHomeEditMode &&
            currentPanelRef.current === "home" &&
            Math.abs(gesture.dx) > START_THRESHOLD_X &&
            Math.abs(gesture.dx) > Math.abs(gesture.dy) &&
            gesture.dx < 0;

          if (shouldOpen) {
            loadLazyPanel("wallet");
          }

          return shouldOpen;
        },
        onPanResponderMove: (_, gesture) => {
          translateX.setValue(clamp(gesture.dx, -screenWidth, 0));
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldOpen =
            gesture.dx < -completeDistanceX || gesture.vx < -COMPLETE_VELOCITY_X;
          animateTo(shouldOpen ? "wallet" : "home");
        },
        onPanResponderTerminate: () => {
          animateTo("home");
        },
      }),
    [animateTo, completeDistanceX, isHomeEditMode, loadLazyPanel, screenWidth, translateX],
  );

  const homeToMiniAppsResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isHomeEditMode && currentPanelRef.current === "home",
        onMoveShouldSetPanResponder: (_, gesture) => {
          const shouldOpen =
            !isHomeEditMode &&
            currentPanelRef.current === "home" &&
            Math.abs(gesture.dy) > START_THRESHOLD_Y &&
            Math.abs(gesture.dy) > Math.abs(gesture.dx) &&
            gesture.dy < 0;

          if (shouldOpen) {
            loadLazyPanel("miniapps");
          }

          return shouldOpen;
        },
        onPanResponderMove: (_, gesture) => {
          translateY.setValue(clamp(gesture.dy, -screenHeight, 0));
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldOpen =
            gesture.dy < -completeDistanceY || gesture.vy < -COMPLETE_VELOCITY_Y;
          animateTo(shouldOpen ? "miniapps" : "home");
        },
        onPanResponderTerminate: () => {
          animateTo("home");
        },
      }),
    [animateTo, completeDistanceY, isHomeEditMode, loadLazyPanel, screenHeight, translateY],
  );

  const messengerBackResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => currentPanelRef.current === "messenger",
        onMoveShouldSetPanResponder: (_, gesture) =>
          currentPanelRef.current === "messenger" &&
          Math.abs(gesture.dx) > START_THRESHOLD_X &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) &&
          gesture.dx < 0,
        onPanResponderMove: (_, gesture) => {
          translateX.setValue(clamp(screenWidth + gesture.dx, 0, screenWidth));
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldBack =
            gesture.dx < -completeDistanceX || gesture.vx < -COMPLETE_VELOCITY_X;
          animateTo(shouldBack ? "home" : "messenger");
        },
        onPanResponderTerminate: () => {
          animateTo("messenger");
        },
      }),
    [animateTo, completeDistanceX, screenWidth, translateX],
  );

  const walletBackResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => currentPanelRef.current === "wallet",
        onMoveShouldSetPanResponder: (_, gesture) =>
          currentPanelRef.current === "wallet" &&
          Math.abs(gesture.dx) > START_THRESHOLD_X &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) &&
          gesture.dx > 0,
        onPanResponderMove: (_, gesture) => {
          translateX.setValue(clamp(-screenWidth + gesture.dx, -screenWidth, 0));
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldBack =
            gesture.dx > completeDistanceX || gesture.vx > COMPLETE_VELOCITY_X;
          animateTo(shouldBack ? "home" : "wallet");
        },
        onPanResponderTerminate: () => {
          animateTo("wallet");
        },
      }),
    [animateTo, completeDistanceX, screenWidth, translateX],
  );

  const miniAppsBackResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => currentPanelRef.current === "miniapps",
        onMoveShouldSetPanResponder: (_, gesture) =>
          currentPanelRef.current === "miniapps" &&
          Math.abs(gesture.dy) > START_THRESHOLD_Y &&
          Math.abs(gesture.dy) > Math.abs(gesture.dx) &&
          gesture.dy > 0,
        onPanResponderMove: (_, gesture) => {
          translateY.setValue(clamp(-screenHeight + gesture.dy, -screenHeight, 0));
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldBack =
            gesture.dy > completeDistanceY || gesture.vy > COMPLETE_VELOCITY_Y;
          animateTo(shouldBack ? "home" : "miniapps");
        },
        onPanResponderTerminate: () => {
          animateTo("miniapps");
        },
      }),
    [animateTo, completeDistanceY, screenHeight, translateY],
  );

  const MessengerPanel = lazyPanels.messenger;
  const WalletPanel = lazyPanels.wallet;
  const MiniAppsPanel = lazyPanels.miniapps;

  if (isWeb) {
    return (
      <View style={styles.root} onLayout={handleRootLayout}>
        <HomePanel />
      </View>
    );
  }

  return (
    <View style={styles.root} onLayout={handleRootLayout}>
      <Animated.View
        style={[
          styles.canvas,
          {
            width: screenWidth,
            height: screenHeight * 2,
            transform: [{ translateX }, { translateY }],
          },
        ]}
      >
        <View style={[styles.panel, { width: screenWidth, height: screenHeight, left: -screenWidth, top: 0 }]}>
          {MessengerPanel ? <MessengerPanel onBack={goHome} /> : <View style={styles.lazyPanelHost} />}
        </View>

        <View style={[styles.panel, { width: screenWidth, height: screenHeight, left: 0, top: 0 }]}>
          <HomePanel />
        </View>

        <View style={[styles.panel, { width: screenWidth, height: screenHeight, left: screenWidth, top: 0 }]}>
          {WalletPanel ? <WalletPanel onBack={goHome} /> : <View style={styles.lazyPanelHost} />}
        </View>

        <View style={[styles.panel, { width: screenWidth, height: screenHeight, left: 0, top: screenHeight }]}>
          {MiniAppsPanel ? <MiniAppsPanel onBack={goHome} /> : <View style={styles.lazyPanelHost} />}
        </View>
      </Animated.View>

      {currentPanel === "home" && !isHomeEditMode ? (
        <>
          <View
            style={[styles.leftZone, { width: LEFT_EDGE_ZONE }]}
            pointerEvents="box-only"
            {...homeToMessengerResponder.panHandlers}
          />
          <View
            style={[styles.rightZone, { width: RIGHT_EDGE_ZONE }]}
            pointerEvents="box-only"
            {...homeToWalletResponder.panHandlers}
          />
          <View
            style={[styles.bottomMiniAppsZone, { height: bottomMiniAppsZoneHeight }]}
            pointerEvents="box-only"
            {...homeToMiniAppsResponder.panHandlers}
          />
        </>
      ) : null}

      {currentPanel === "messenger" ? (
        <View
          style={[styles.rightZone, { width: RIGHT_EDGE_ZONE }]}
          pointerEvents="box-only"
          {...messengerBackResponder.panHandlers}
        />
      ) : null}

      {currentPanel === "wallet" ? (
        <View
          style={[styles.leftZone, { width: LEFT_EDGE_ZONE }]}
          pointerEvents="box-only"
          {...walletBackResponder.panHandlers}
        />
      ) : null}

      {currentPanel === "miniapps" ? (
        <View
          style={[styles.topZone, { height: TOP_EDGE_ZONE }]}
          pointerEvents="box-only"
          {...miniAppsBackResponder.panHandlers}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  canvas: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  panel: {
    position: "absolute",
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  lazyPanelHost: {
    flex: 1,
    backgroundColor: "transparent",
  },
  leftZone: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 30,
    elevation: 30,
    backgroundColor: "transparent",
  },
  rightZone: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 30,
    elevation: 30,
    backgroundColor: "transparent",
  },
  topZone: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 30,
    elevation: 30,
    backgroundColor: "transparent",
  },
  bottomMiniAppsZone: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    elevation: 30,
    backgroundColor: "transparent",
  },
});
