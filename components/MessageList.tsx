import { FlatList, StyleSheet } from "react-native";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages }: any) {
  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MessageBubble message={item} />}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
});