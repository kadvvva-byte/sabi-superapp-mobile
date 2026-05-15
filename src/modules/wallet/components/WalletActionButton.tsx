import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  title: string;
  icon: React.ReactNode;
  primary?: boolean;
  onPress?: () => void;
};

export default function WalletActionButton({
  title,
  icon,
  primary = false,
  onPress,
}: Props) {
  const press = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(press.value, [0, 1], [1, 0.975]) }],
    opacity: interpolate(press.value, [0, 1], [1, 0.94]),
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        press.value = withTiming(1, { duration: 110 });
      }}
      onPressOut={() => {
        press.value = withTiming(0, { duration: 140 });
      }}
      style={[styles.wrapper, animatedStyle]}
    >
      <LinearGradient
        colors={
          primary
            ? ["#2450B8", "#3B82F6", "#8EC5FF"]
            : ["rgba(34,52,86,0.96)", "rgba(18,30,52,0.98)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, primary ? styles.primary : styles.secondary]}
      >
        <View style={styles.topLight} />

        <View style={[styles.iconWrap, primary ? styles.iconPrimary : styles.iconSecondary]}>
          {icon}
        </View>

        <Text
          style={[styles.text, primary ? styles.textPrimary : styles.textSecondary]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "31.5%",
  },

  button: {
    minHeight: 88,
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  primary: {
    borderWidth: 1,
    borderColor: "rgba(142,197,255,0.34)",
    shadowColor: "#3B82F6",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  secondary: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(10,20,40,0.68)",
  },

  topLight: {
    position: "absolute",
    top: 4,
    left: 12,
    right: 12,
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  iconPrimary: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  iconSecondary: {
    backgroundColor: "rgba(255,255,255,0.09)",
  },

  text: {
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },

  textPrimary: {
    color: "#FFFFFF",
  },

  textSecondary: {
    color: "#FFFFFF",
  },
});