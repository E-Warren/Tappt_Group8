import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useStudentStore } from "./useWebSocketStore";
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native"; // or "expo-router" if using Expo Router
import { WebSocketService } from "./webSocketService";

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
      const response = await fetch(`http://localhost:5000/answerchoices/${deckID}`, {
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



  return (
    <View style={styles.container}>
      <Text style={styles.header}>◇ Tappt</Text>
      <Text style={styles.players}>{playerCount} players</Text>

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
