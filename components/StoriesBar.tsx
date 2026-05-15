import { ScrollView, View, Text, StyleSheet } from "react-native";

const stories = [
  { id: 1, name: "You" },
  { id: 2, name: "Alex" },
  { id: 3, name: "John" },
  { id: 4, name: "Sara" },
  { id: 5, name: "Kate" }
];

export default function StoriesBar() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      {stories.map((story) => (
        <View key={story.id} style={styles.story}>
          <View style={styles.avatar} />
          <Text style={styles.name}>{story.name}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingLeft: 10
  },

  story: {
    alignItems: "center",
    marginRight: 15
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ddd",
    marginBottom: 5
  },

  name: {
    fontSize: 12
  }
});