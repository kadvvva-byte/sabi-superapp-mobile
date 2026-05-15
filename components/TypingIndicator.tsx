import { View, Text, StyleSheet } from "react-native";

export default function TypingIndicator() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>typing...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 10,
    paddingBottom: 5,
  },

  text: {
    fontSize: 12,
    color: "#888",
  },
});