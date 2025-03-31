import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface TransitionScreenProps {
  username?: string;
}

const TransitionScreen: React.FC<TransitionScreenProps> = ({ username = "pink goose" }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>◇ Tappt</Text>
      <Text style={styles.username}>{username}</Text>

      <Text style={styles.message}>Pure genius or guesswork?</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4a623", // Match the yellow/orange color
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
  username: {
    position: "absolute",
    top: 15,
    right: 15,
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
  message: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
});

export default TransitionScreen;
