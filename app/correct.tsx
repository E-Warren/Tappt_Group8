import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useStudentStore } from "./useWebSocketStore";
import { WebSocketService } from "./webSocketService";
import { router } from "expo-router";
import { Audio } from "expo-av";
import { useIsFocused } from "@react-navigation/native";
import * as Speech from "expo-speech";

interface CorrectScreenProps {
  timer?: number;
  questionNumber?: number;
  totalQuestions?: number;
  onBonusSelect: (bonus: string) => void;
}

const CorrectScreen: React.FC<CorrectScreenProps> = ({ timer = "", onBonusSelect }) => {
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

  //bonus variable
  //will indicate (in text) what kind of bonus it is
  const bonus = useStudentStore(state => state.bonus);

  //for handling the bonuses
  useEffect(() => {
    if (bonus === "") {
      WebSocketService.sendMessage(JSON.stringify({
        type: "sendBonus",
        name: playername,
        qNum: questionNumber,
      }));
    }
  }, [bonus])

  //for multipliers
  const setPointsPer = useStudentStore(state => state.setPointsPerClick);
  const pointsPer = useStudentStore(state => state.pointsPerClick);
  useEffect(() => {
    if(bonus === "+1 points per click"){
      setPointsPer(pointsPer+1);
    }
    else if(bonus === "+2 points per click"){
      setPointsPer(pointsPer+2);
    }
  }, [bonus])

  
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

  async function playCorrectSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sound/correct.mp3"),
        { shouldPlay: true, isLooping: true }
      );
      soundRef.current = sound;
      console.log("Playing Correct Sound");
  
      await sound.setRateAsync(0.9, true);
      await sound.playAsync();
  
      setTimeout(async () => {
        await stopSound();
      }, 1100);
  
    } catch (error) {
      console.error("Error Playing correct sound:", error);
    }
  }
  
  async function playBonusSound(selectedBonus: string) {
    try {
      if (!selectedBonus) return;
  
      let bonusSoundAsset: any = null;
  
      if (selectedBonus === "10% Bonus") {
        bonusSoundAsset = require("../assets/sound/ten.mp3");
      } else if (selectedBonus === "15% Bonus") {
        bonusSoundAsset = require("../assets/sound/fifteen.mp3");
      } else if (selectedBonus === "20% Bonus") {
        bonusSoundAsset = require("../assets/sound/twenty.mp3");
      } else if (selectedBonus === "+1 points per click") {
        bonusSoundAsset = require("../assets/sound/cute-level-up-2-189851.mp3");
      } else if (selectedBonus === "+2 points per click") {
        bonusSoundAsset = require("../assets/sound/cute-level-up-3-189853.mp3");
      }
  
      if (bonusSoundAsset) {
        const { sound: bonusSound } = await Audio.Sound.createAsync(
          bonusSoundAsset,
          { shouldPlay: true, isLooping: false }
        );
        console.log("Playing Bonus Sound");
  
        await bonusSound.playAsync(); 
  
        bonusSound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.didJustFinish) {
            console.log("Bonus Sound Finished");
            await bonusSound.unloadAsync();
            Speech.speak(selectedBonus); 
          }
        });
      } else {
        Speech.speak(selectedBonus); 
      }
    } catch (error) {
      console.error("Error Playing bonus sound:", error);
    }
  }
  
  async function stopSound() {
    if (soundRef.current) {
      console.log("Stopping Sound");
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } else {
        console.log("Sound not loaded, skipping stop/unload");
      }
      soundRef.current = null;
    }
  }
  
  useEffect(() => {
    const correctTimer = setTimeout(() => {
      playCorrectSound();
    }, 500);
  
    return () => {
      clearTimeout(correctTimer);
      stopSound();
    };
  }, []);
  
 
  useEffect(() => {
    if (!bonus) return;
  
    const bonusTimer = setTimeout(() => {
      playBonusSound(bonus);
    }, 2000); 
  
    return () => {
      clearTimeout(bonusTimer);
    };
  }, [bonus]); 

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

    //***temporary*** => substitute until we have teacher frontend routed to this point
    //setting timeout for 5 seconds so that student can see incorrect page
    useEffect(() => {

      //this function checks if the teacher has hit the continue (goToNextQuestion holds the next question number)
        if (goToNextQuestion){ //checks if the next question is ready to be asked
          if ((questionNumber + 1) !== totalQuestions){ //checks if teacher has reached the end of the deck
            useStudentStore.setState({ currQuestionNum: questionNumber + 1}) //update the current question number (student side)
            useStudentStore.setState({ nextQuestion: false });
            useStudentStore.setState({ currQuestionNum: questionNumber + 1})

            console.log("go to next question is set to: ", useStudentStore.getState().nextQuestion);
            console.log("Everyone answered is now set to: ", useStudentStore.getState().allStudentsAnswered);
            console.log("resetting correctness... rerouting to /answerchoices");
            //go to student clicks now
            router.replace("/studentClicks");
          } else {
            //if reached the end of the deck, send to endgame screen
            console.log("Routing to end of the game through incorrect");
            router.replace("/endgame");
          }
        }
    }, [goToNextQuestion])

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tappt</Text>
      <Text style={styles.username}>{playername}</Text>

      <View style={styles.checkmarkContainer}>
        <MaterialIcons name="check-circle" size={180} color="lightgreen" />
      </View>

      <Text style={styles.correctText}>That's right!</Text>

      
        <Text style={styles.bonusMessage}>
          You get {bonus}!!
        </Text>
     

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
