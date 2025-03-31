import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ReadingScreenProps {
  playerCount?: number;
}

const ReadingScreen: React.FC<ReadingScreenProps> = ({ playerCount = 17 }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>◇ Tappt</Text>
      <Text style={styles.players}>{playerCount} players</Text>

      <Text style={styles.readingText}>Reading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1ed5c1",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    position: "absolute",
    top: 15,
    left: 15,
    fontSize: 24,
    color: "white",
  },
  players: {
    position: "absolute",
    top: 15,
    right: 15,
    fontSize: 20,
    color: "white",
  },
  readingText: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ReadingScreen;
