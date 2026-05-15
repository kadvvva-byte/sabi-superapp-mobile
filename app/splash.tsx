import { View, Text, StyleSheet } from "react-native";
import { useEffect } from "react";
import { router } from "expo-router";

export default function Splash() {

  useEffect(() => {
    setTimeout(() => {
      router.replace("/welcome");
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Sabi</Text>
      <Text style={styles.subtitle}>
        Smart App for Business & Interaction
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#081A33",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#00C6FF",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
  },
});