import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

type ChatItemData = {
  id: string | number;
  name: string;
  time?: string;
  lastMessage?: string;
  unread?: number;
};

type Props = {
  chat: ChatItemData;
};

export default function ChatItem({ chat }: Props) {
  const router = useRouter();

  const openChat = () => {
    router.push({
      pathname: "/tabs/chat/[id]",
      params: { id: String(chat.id) },
    } as never);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={openChat} activeOpacity={0.85}>
      <View style={styles.avatar} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {chat.name}
          </Text>
          <Text style={styles.time}>{chat.time ?? ""}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.message} numberOfLines={1}>
            {chat.lastMessage ?? ""}
          </Text>

          {(chat.unread ?? 0) > 0 ? (
            <View style={styles.unread}>
              <Text style={styles.unreadText}>{chat.unread}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ddd",
    marginRight: 10,
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
    gap: 12,
  },

  name: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 16,
  },

  time: {
    fontSize: 12,
    color: "#999",
  },

  message: {
    flex: 1,
    color: "#666",
  },

  unread: {
    minWidth: 20,
    height: 20,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
});