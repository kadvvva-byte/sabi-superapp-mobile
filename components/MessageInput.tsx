import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useState } from "react";

export default function MessageInput() {
  const [message, setMessage] = useState("");

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Message..."
        value={message}
        onChangeText={setMessage}
      />

      <TouchableOpacity style={styles.sendButton}>
        <Text style={styles.sendText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  input: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingHorizontal: 15,
  },

  sendButton: {
    marginLeft: 10,
    justifyContent: "center",
  },

  sendText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
});