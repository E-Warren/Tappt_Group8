import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";

interface IncorrectScreenProps {
  timer?: number;
  questionNumber?: number;
  totalQuestions?: number;
}
//Same as the correct screen, the parameters are set to show example data, will be changed later
const IncorrectScreen: React.FC<IncorrectScreenProps> = ({ timer = 13, questionNumber = 1, totalQuestions = 3 }) => {
  const soundRef = useRef<Audio.Sound | null>(null);

  async function playSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sound/incorrect.mp3"),
        { shouldPlay: true, isLooping: true }
      );
      soundRef.current = sound;
      console.log("Playing Sound");
      await sound.playAsync();

      setTimeout(() => {
        stopSound();
      }, 1920); 
    } catch (error) {
      console.error("Error Playing sound:", error);
    }
  }
  async function stopSound() {
    if (soundRef.current) {
      console.log("Stopping Sound");
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  }
  useEffect(() => {
    const soundTimer = setTimeout(() => {
      playSound();
    }, 500);

    return () => {
      clearTimeout(soundTimer);
      stopSound();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tappt</Text>
      <Text style={styles.username}>pink goose</Text>

      <View style={styles.iconContainer}>
        <MaterialIcons name="cancel" size={200} color="#ff5252" />
      </View>

      <Text style={styles.incorrectText}>That is incorrect</Text>
      <Text style={styles.tryAgainText}>Better luck next time...</Text>

      <Text style={styles.timer}>{timer}</Text>
      <Text style={styles.questionCounter}>Question {questionNumber} / {totalQuestions}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6184E3",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    position: "absolute",
    top: 10,
    left: 15,
    fontSize: 40,
    color: "white",
  },
  username: {
    position: "absolute",
    top: 10,
    right: 15,
    fontSize: 40,
    color: "white",
  },
  iconContainer: {
    backgroundColor: "white",
    borderRadius: 80, 
    width: 120, 
    height: 120, 
    alignItems: "center",
    justifyContent: "center",
  },
  incorrectText: {
    fontSize: 45,
    fontWeight: "bold",
    color: "white",
    marginTop: 30,
  },
  tryAgainText: {
    fontSize: 25,
    color: "white",
    marginVertical: 10,
    fontWeight: "bold",
  },
  timer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    fontSize: 40,
    color: "white",
  },
  questionCounter: {
    position: "absolute",
    bottom: 20,
    right: 15,
    fontSize: 30,
    color: "white",
  },
});

export default IncorrectScreen;
