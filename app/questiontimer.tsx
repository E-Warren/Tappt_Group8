import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface QuestionWithTimerScreenProps {
  timer?: number;
  question?: string;
  playerCount?: number;
}

const QuestionWithTimerScreen: React.FC<QuestionWithTimerScreenProps> = ({
  timer = 30,
  question = "In what year did the Boston Tea Party take place?",
  playerCount = 17,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>◇ Tappt</Text>
      <Text style={styles.players}>{playerCount} players</Text>

      <Text style={styles.timer}>{timer}</Text>
      <Text style={styles.question}>{question}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#125e4b", // Deep teal/green background
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
    fontSize: 18,
    color: "white",
  },
  timer: {
    fontSize: 60,
    color: "#f4a623", // Orange timer color
    fontWeight: "bold",
    marginBottom: 20,
  },
  question: {
    fontSize: 26,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default QuestionWithTimerScreen;
