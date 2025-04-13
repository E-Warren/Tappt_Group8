import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useStudentStore } from "./useWebSocketStore";
import { WebSocketService } from "./webSocketService";
import { router } from "expo-router";
import { Audio } from "expo-av";
import { useIsFocused } from "@react-navigation/native";

interface CorrectScreenProps {
  timer?: number;
  questionNumber?: number;
  totalQuestions?: number;
  onBonusSelect: (bonus: string) => void;
}

const CorrectScreen: React.FC<CorrectScreenProps> = ({ timer = 13, onBonusSelect }) => {
  const [selectedBonus, setSelectedBonus] = useState<string | null>(null);
  const questionNumber = useStudentStore(state => state.currQuestionNum);
  const totalQuestions = useStudentStore(state => state.totalQuestions);
  const playername = useStudentStore(state => state.name); 
  const setAnsCorrectness = useStudentStore(state => state.setAnsCorrectness);
  const goToNextQuestion = useStudentStore(state => state.nextQuestion);
  const isFocused = useIsFocused();

  //testing
  const hasAns = useStudentStore(state => state.hasAnswered);
  const nextQ = useStudentStore(state => state.nextQuestion);
  const setNextQuestion = useStudentStore(state => state.setNextQuestion);


  const handleBonusSelect = (bonus: string) => {
    setSelectedBonus(bonus);
    // Was throwing an error when onBonusSelect was not a function, added check against until it is implemented
    if (typeof onBonusSelect === "function") {
      onBonusSelect(bonus);
    } else {
      console.error("onBonusSelect is not a function");
    }
  };

  //sound!!!!
  const soundRef = useRef<Audio.Sound | null>(null);

  async function playSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sound/correct.mp3"),
        { shouldPlay: true, isLooping: true }
      );
      soundRef.current = sound;
      console.log("Playing Sound");
      await sound.setRateAsync(0.9,true);
      await sound.playAsync();

      setTimeout(() => {
        stopSound();
      }, 1100); 
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
  
    //***temporary*** => substitute until we have teacher frontend routed to this point
    //setting timeout for 5 seconds so that student can see incorrect page
    useEffect(() => {
        console.log("student info: ");
        console.log("goToNextQuestion: ", goToNextQuestion);
        console.log("hasAnswered: ", hasAns);

        if (goToNextQuestion){
          if ((questionNumber + 1) !== totalQuestions){
            /*useStudentStore.setState({ 
              hasAnswered: false, 
              nextQuestion: false,
              allStudentsAnswered: false,
              currQuestionNum: questionNumber + 1
            });*/

            useStudentStore.setState({ hasAnswered: false});
            useStudentStore.setState({ nextQuestion: false });

            useStudentStore.setState({ currQuestionNum: questionNumber + 1})
            useStudentStore.setState({ allStudentsAnswered: false });
            
            console.log("go to next question is set to: ", useStudentStore.getState().nextQuestion);
            console.log("Everyone answered is now set to: ", useStudentStore.getState().allStudentsAnswered);
            //useStudentStore.setState({ isTimeUp: false });
            console.log("resetting correctness... rerouting to /answerchoices");
            setAnsCorrectness("");

            //go to student clicks now
            router.replace("/studentClicks");

          } else {
            router.replace("/endgame");
          }
        }
    }, [goToNextQuestion])

    useEffect(() => {
      useStudentStore.setState({ isTimeUp: false });
      useStudentStore.setState({ currentTime: 30 });
      console.log("The time is up boolean in zustand is now: ", useStudentStore.getState().isTimeUp);
      useStudentStore.setState({ allStudentsAnswered: false });
    }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tappt</Text>
      <Text style={styles.username}>{playername}</Text>

      <View style={styles.checkmarkContainer}>
        <MaterialIcons name="check-circle" size={180} color="lightgreen" />
      </View>

      <Text style={styles.correctText}>That's right!</Text>

      {selectedBonus ? (
        <Text style={styles.bonusMessage}>
          {selectedBonus === "doublePoints"
            ? "You chose x2 points per click!"
            : "You froze all players next round!"}
        </Text>
      ) : (
        <>
          <Text style={styles.chooseBonus}>Choose your bonus:</Text>
          <TouchableOpacity style={styles.bonusButtonGreen} onPress={() => handleBonusSelect("doublePoints")}>
            <Text style={styles.bonusText}>x2 points per click</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bonusButtonPurple} onPress={() => handleBonusSelect("freezePlayers")}>
            <Text style={styles.bonusText}>Freeze all the players next round</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.timer}>{timer}</Text>
      <Text style={styles.questionCounter}>Question {questionNumber + 1} / {totalQuestions}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4A63D",
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
  checkmarkContainer: {
    backgroundColor: "white",
    borderRadius: 100,
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  correctText: {
    fontSize: 45,
    fontWeight: "bold",
    color: "white",
    marginTop: 10,
  },
  chooseBonus: {
    fontSize: 25,
    color: "white",
    marginVertical: 10,
  },
  bonusButtonGreen: {
    backgroundColor: "#2DD4BF",
    padding: 15,
    width: "80%",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 5,
  },
  bonusButtonPurple: {
    backgroundColor: "#7B5ED6",
    padding: 15,
    width: "80%",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 5,
  },
  bonusText: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
  },
  bonusMessage: {
    fontSize: 25,
    color: "white",
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
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

export default CorrectScreen;