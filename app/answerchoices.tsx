import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useStudentStore } from "./useWebSocketStore";
import { WebSocketService } from "./webSocketService";

interface AnswerChoiceScreenProps {
  question?: string;
  choices?: { label: string; value: string }[];
  questionNumber?: number;
  totalQuestions?: number;
  onAnswerPress?: (value: string) => void;
  onNextPress?: () => void; // NEW PROP
}

const AnswerChoiceScreen: React.FC<AnswerChoiceScreenProps> = ({
  question = "In what year did the Boston Tea Party take place?",
  choices = [
    { label: "top", value: "2001" },
    { label: "left", value: "1773" },
    { label: "right", value: "1492" },
    { label: "bottom", value: "1912" },
  ],
  questionNumber = 5,
  totalQuestions = 13,
  onAnswerPress = (studentAnswer: string) => {
    console.log("The student chose: ", studentAnswer);
    WebSocketService.sendMessage(JSON.stringify({
      type: "studentAnswer",
      data: {
        name,
        answer: studentAnswer,
        questionNumber,
        clickCount: 100, //TODO: update this once the clicks are stored
      }
    }))
  },
  onNextPress = () => {
    console.log("Next pressed");
  }, // default fallback
}) => {
  const arrowIcons = ["↑", "←", "→", "↓"];
  const timer = useStudentStore(state => state.currentTime);
  const name = useStudentStore(state => state.name);
  useEffect(() => {
    const keydownHandler = (event: KeyboardEvent) => {
      console.log(event);
      if (event.key === "ArrowUp"){
        console.log("Student pressed the up arrow key");
        const choice = choices.find(c => c.label === "top");
        if (choice){
          console.log("The student chose the up arrow with value: ", choice.value);
          WebSocketService.sendMessage(JSON.stringify({
            type: "studentAnswer",
            data: {
              name,
              answer: choice.value,
              questionNumber,
              clickCount: 100, //TODO: update this once the clicks are stored
            }
          }))
        }
      }
      if (event.key === "ArrowDown") {
        console.log("Student pressed the down arrow key");
        const choice = choices.find(c => c.label === "bottom");
        if (choice) {
          console.log("The student chose the down arrow with value: ", choice.value);
          WebSocketService.sendMessage(JSON.stringify({
            type: "studentAnswer",
            data: {
              name,
              answer: choice.value,
              questionNumber,
              clickCount: 100, //TODO: update this once the clicks are stored
            }
          }))
        }
      }
      if (event.key === "ArrowLeft") {
        console.log("Student pressed the left arrow key");
        const choice = choices.find(c => c.label === "left");
        if (choice) {
          console.log("The student chose the left arrow with value: ", choice.value);
          WebSocketService.sendMessage(JSON.stringify({
            type: "studentAnswer",
            data: {
              name,
              answer: choice.value,
              questionNumber,
              clickCount: 100, //TODO: update this once the clicks are stored
            }
          }))
        }
      }
      if (event.key === "ArrowRight") {
        console.log("Student pressed the right arrow key");
        const choice = choices.find(c => c.label === "right");
        if (choice) {
          console.log("The student chose the right arrow with value: ", choice.value);
          WebSocketService.sendMessage(JSON.stringify({
            type: "studentAnswer",
            data: {
              name,
              answer: choice.value,
              questionNumber,
              clickCount: 100, //TODO: update this once the clicks are stored
            }
          }))
        }
      }
    }
    window.addEventListener("keydown", keydownHandler);
    return () => window.removeEventListener("keydown", keydownHandler);
  }, [])

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

          const backgroundStyle =
            styles[`choice${index}` as keyof typeof styles] as ViewStyle;

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

      {/* NEW: Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={onNextPress}>
        <Text style={styles.nextButtonText}>Next →</Text>
      </TouchableOpacity>
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
  choice0: { backgroundColor: "#8e44ad" },
  choice1: { backgroundColor: "#f39c12" },
  choice2: { backgroundColor: "#3498db" },
  choice3: { backgroundColor: "#e74c3c" },
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
  nextButton: {
    position: "absolute",
    bottom: 80,
    right: 15,
    backgroundColor: "#ffffff55",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  nextButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AnswerChoiceScreen;

