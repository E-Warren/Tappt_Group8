import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useStudentStore } from "./useWebSocketStore";
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native"; // or "expo-router" if using Expo Router
import { WebSocketService } from "./webSocketService";
import Config from './config';
import timerSound from "../assets/sound/timer-with-chime-101253.mp3";
import { Audio } from "expo-av"; 

interface QuestionWithTimerScreenProps {
  question?: string;
  playerCount?: number;
}

const QuestionWithTimerScreen: React.FC<QuestionWithTimerScreenProps> = ({
  playerCount = 17,
}) => {
  const timer = useStudentStore((state) => state.currentTime);

  const timerIsUp = useStudentStore((state) => state.isTimeUp)
  const haveAllStudentsAnswered = useStudentStore(state => state.allStudentsAnswered);

  useEffect(() => {
    //if the timer is up or all the students have answered, route teacher to roundend screen
    if ((timerIsUp || haveAllStudentsAnswered)){
      router.replace('/roundend');

    }
  }, [timerIsUp, haveAllStudentsAnswered])


  //player count for header
  const players = useStudentStore((state) => state.students);
  const totalPlayers = players.length;

const [questions, setQuestions] = useState<QuestionWithTimerScreenProps[]>([]);
const deckID = useStudentStore(state => state.deckID);
const currQuestionNum = useStudentStore(state => state.currQuestionNum);
const requestDeckID = async () => {
  //get deckID for student-end so that students can load up questions on their end
  console.log("requested to obtain deckID");
  WebSocketService.sendMessage(JSON.stringify({ type: "sendDeckID" }));
}

useEffect(() => {
  const getQuestions = async () => {
    try{
      const response = await fetch(`${Config.BE_HOST}/answerchoices/${deckID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Ensure cookies/sessions are sent
      });
  
      const data = await response.json();
        
      //if not response 200
      if (!response.ok) {
        throw new Error("Failed to get deck.");
      }
  
      const qArr = [];
      const qMap = new Map();
  
      //mapping each question, questionID, and answer to a map
      data.forEach(row => { 
        if (!qMap.has(row.fld_card_q_pk)) {
          qMap.set(row.fld_card_q_pk, {
            questionID: row.fld_card_q_pk,
            question: row.fld_card_q,
          });
        }
      })
  
      qMap.forEach((questionData) => {
        qArr.push({
          questionID: questionData.questionID,
          question: questionData.question,
        });
      });

      console.log("Setting questions to: ", qArr);
      setQuestions(qArr);
      
    } catch (err) {
      console.log("Error when trying to get the deck :(");
    }
  }
  if (deckID == -1) {
    requestDeckID();
  }
  //if we got the deckID, we will send a GET request for obtaining questions
  else {
    getQuestions();
  }

}, [deckID]);






  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  //sound
  useEffect(() => {
    let sound: Audio.Sound | null = null;
    const timer = setTimeout(async () => {
      try {
        const { sound: loadedSound } = await Audio.Sound.createAsync(timerSound);
        sound = loadedSound;
        await sound.playAsync();
        console.log("Music started after 18 seconds");
      } catch (error) {
        console.log("Failed to play sound:", error);
      }
    }, 17800);
  
    return () => {
      clearTimeout(timer);
      if (sound) {
        sound.unloadAsync();
        console.log("Music stopped because screen unmounted");
      }
    };
  }, []);



  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tappt</Text>
      <Text style={styles.players}>{totalPlayers} players</Text>

      <Text style={styles.timer}>{timer}</Text>
      <Text style={styles.question}>{questions[currQuestionNum]?.question || "questions are done. will need appriopriate routing for this."}</Text>
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
    top: 10,
    left: 20,
    fontSize: 40,
    color: "white",
  },
  players: {
    position: "absolute",
    top: 10,
    right: 20,
    fontSize: 40,
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
