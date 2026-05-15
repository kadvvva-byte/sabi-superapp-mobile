import { View, Text, StyleSheet } from "react-native";

export default function ChatHeader({ chatId }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>Chat {chatId}</Text>
      <Text style={styles.status}>online</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
  },

  status: {
    fontSize: 12,
    color: "green",
  },
});