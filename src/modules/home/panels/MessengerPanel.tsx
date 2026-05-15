import React, { useMemo } from "react";
import { PanResponder, Pressable, StyleSheet, View } from "react-native";
import MessengerHubScreen from "../../../../app/tabs/index";

type MessengerPanelProps = {
  onBack?: () => void;
};

const SWIPE_START_THRESHOLD = 8;
const SWIPE_COMPLETE_DISTANCE = 64;
const SWIPE_COMPLETE_VELOCITY = -0.2;

export default function MessengerPanel({ onBack }: MessengerPanelProps) {
  const backResponder = useMemo(() => {
    if (!onBack) {
      return null;
    }

    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > SWIPE_START_THRESHOLD &&
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
        gestureState.dx < 0,
      onPanResponderRelease: (_, gestureState) => {
        const shouldBack =
          gestureState.dx < -SWIPE_COMPLETE_DISTANCE ||
          gestureState.vx < SWIPE_COMPLETE_VELOCITY;

        if (shouldBack) {
          onBack();
        }
      },
      onPanResponderTerminate: () => {},
    });
  }, [onBack]);

  if (!onBack) {
    return <MessengerHubScreen />;
  }

  return (
    <View style={styles.container}>
      <MessengerHubScreen />

      <Pressable
        style={styles.leftHeaderBackBlocker}
        onPress={() => {}}
        hitSlop={12}
      />

      <View
        style={styles.rightSwipeZone}
        pointerEvents="box-only"
        {...(backResponder ? backResponder.panHandlers : {})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  leftHeaderBackBlocker: {
    position: "absolute",
    top: 10,
    left: 12,
    width: 56,
    height: 56,
    zIndex: 9998,
    backgroundColor: "transparent",
  },
  rightSwipeZone: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 36,
    zIndex: 9999,
    backgroundColor: "transparent",
  },
});