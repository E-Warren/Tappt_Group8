import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

interface AnswerChoiceScreenProps {
  question?: string;
  choices?: { label: string; value: string }[];
  timer?: number;
  questionNumber?: number;
  totalQuestions?: number;
  onAnswerPress?: (value: string) => void;
}

const AnswerChoiceScreen: React.FC<AnswerChoiceScreenProps> = ({
  question = "In what year did the Boston Tea Party take place?",
  choices = [
    { label: "top", value: "2001" },
    { label: "left", value: "1773" },
    { label: "right", value: "1492" },
    { label: "bottom", value: "1912" },
  ],
  timer = 30,
  questionNumber = 5,
  totalQuestions = 13,
  onAnswerPress = () => {},
}) => {
  const arrowIcons = ["↑", "←", "→", "↓"];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tappt</Text>
      <Text style={styles.username}>pink goose</Text>

      <Text style={styles.question}>{question}</Text>

      <View style={styles.diamondLayout}>
        {choices.map((choice, index) => {
          const positionStyle =
            index === 0
              ? styles.top
              : index === 1
              ? styles.left
              : index === 2
              ? styles.right
              : styles.bottom;

          const backgroundStyle = styles[`choice${index}` as keyof typeof styles] as ViewStyle;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.choiceButton, backgroundStyle, positionStyle]}
              onPress={() => onAnswerPress(choice.value)}
            >
              <View style={styles.choiceContent}>
                <Text style={styles.arrow}>{arrowIcons[index]}</Text>
                <Text style={styles.choiceText}>{choice.value}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.timer}>{timer}</Text>
      <Text style={styles.questionCounter}>
        Question {questionNumber} / {totalQuestions}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#19d3a2",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    position: "absolute",
    top: 10,
    left: 15,
    fontSize: 30,
    color: "white",
  },
  username: {
    position: "absolute",
    top: 10,
    right: 15,
    fontSize: 30,
    color: "white",
  },
  question: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 40,
  },
  diamondLayout: {
    width: 300,
    height: 300,
    position: "relative",
    marginBottom: 40,
  },
  choiceButton: {
    width: 100,
    height: 100,
    borderRadius: 10,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "45deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  choiceContent: {
    transform: [{ rotate: "-45deg" }],
    alignItems: "center",
  },
  arrow: {
    fontSize: 22,
    color: "white",
    marginBottom: 4,
  },
  choiceText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  top: {
    top: 0,
    left: 100,
  },
  left: {
    top: 100,
    left: 0,
  },
  right: {
    top: 100,
    left: 200,
  },
  bottom: {
    top: 200,
    left: 100,
  },
  choice0: { backgroundColor: "#8e44ad" }, // Top
  choice1: { backgroundColor: "#f39c12" }, // Left
  choice2: { backgroundColor: "#3498db" }, // Right
  choice3: { backgroundColor: "#e74c3c" }, // Bottom
  timer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    fontSize: 36,
    color: "white",
  },
  questionCounter: {
    position: "absolute",
    bottom: 20,
    right: 15,
    fontSize: 28,
    color: "white",
  },
});

export default AnswerChoiceScreen;

