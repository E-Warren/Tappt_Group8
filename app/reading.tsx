import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import QuestionWithTimerScreen from "./questiontimer";


interface ReadingScreenProps {
  playerCount?: number;
}

const sampleQuestions =[
  "What is the capital of France?",
];


async function playSound(e: any) {
  const { sound } = await Audio.Sound.createAsync(e);
  console.log("Playing Sound");
  await sound.playAsync(); 
  setTimeout(() => {
    console.log("Unloading Sound");
    sound.unloadAsync(); 
  }, 1500);
}

const ReadingScreen: React.FC<ReadingScreenProps> = ({ playerCount = 17 }) => {
  const [isReadingComplete, setIsReadingComplete ] = useState(false);

  useEffect(() => {
    const soundTimer = setTimeout(() => {
      playSound(require("../assets/sound/question.mp3"));
    }, 500);


    const speechTimer = setTimeout(() => {
      Speech.speak(sampleQuestions[0], {
        onDone: () => {
          console.log("Speech finished");
          setTimeout(() => {
            setIsReadingComplete (true);
          }, 1000);
        },
      });
    }, 2800);

    return () => {
      clearTimeout(soundTimer);
      clearTimeout(speechTimer);
    };
  }, []);

if (isReadingComplete) {
  return <QuestionWithTimerScreen />;
}

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
