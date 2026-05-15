import { View, Text, StyleSheet } from "react-native";

export default function MessageBubble({ message }: any) {
  return (
    <View
      style={[
        styles.container,
        message.isMine ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text style={styles.text}>{message.text}</Text>
      <Text style={styles.time}>{message.time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "75%",
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
  },

  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },

  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#eee",
  },

  text: {
    color: "#000",
  },

  time: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
  },
});