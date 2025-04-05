import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useStudentStore } from "./useWebSocketStore";
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native"; // or "expo-router" if using Expo Router

interface QuestionWithTimerScreenProps {
  question?: string;
  playerCount?: number;
}

const QuestionWithTimerScreen: React.FC<QuestionWithTimerScreenProps> = ({
  question = "In what year did the Boston Tea Party take place?",
  playerCount = 17,
}) => {
  const timer = useStudentStore((state) => state.currentTime);

  const timerIsUp = useStudentStore((state) => state.isTimeUp)
  const haveAllStudentsAnswered = useStudentStore(state => state.allStudentsAnswered);

  useEffect(() => {
    if (timerIsUp || haveAllStudentsAnswered){
      router.replace('/roundend');
    }
  }, [timerIsUp, haveAllStudentsAnswered])

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);


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
    backgroundColor: "#125e4b",
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
    color: "#f4a623",
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
