import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import QuestionWithTimerScreen from "./questiontimer";
import { WebSocketService } from "./webSocketService";
import { useNavigation } from "@react-navigation/native"; // <- Add this if using React Navigation
import { useStudentStore } from "./useWebSocketStore";

interface ReadingScreenProps {
  playerCount?: number;
  questionID?: number;
  question?: string;
}

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
  const [isReadingComplete, setIsReadingComplete] = useState(false);

  const navigation = useNavigation(); // <- Hook into navigation
  const [questions, setQuestions] = useState<ReadingScreenProps[]>([]);


  //testing
  const nextQ = useStudentStore(state => state.nextQuestion);
  const setNextQuestion = useStudentStore(state => state.setNextQuestion);

  //------------ Setting up the questions -----------------
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

  //so that the first question isn't read twice (because of rerendering):
  useEffect(() => {
    if (questions.length > 0) {
      useStudentStore.setState({ totalQuestions: questions.length });
    }
  }, [questions])


  useEffect(() => {
    //avoid first question being reread
    if (questions.length === 0 || isReadingComplete) {
      return;
    }

    console.log("questions.length ->", questions.length);

    console.log("Total questions being asked is now: ", questions.length);
    navigation.setOptions({ headerShown: false }); // <- Hides back arrow + screen title

    const soundTimer = setTimeout(() => {
      playSound(require("../assets/sound/question.mp3"));
    }, 500);

    //{questions[currQuestionNum]?.question || "questions are done. will need appriopriate routing for this."}

    const speechTimer = setTimeout(() => {
      console.log("The current question number being asked is: ", currQuestionNum, " and question length is: ", questions.length);
      console.log("The current question being asked is: ", questions[currQuestionNum]);
      const questionAsked = questions[currQuestionNum];
      if (questionAsked){
        Speech.speak(questionAsked.question || "No more questions!", {
          onDone: () => {
            console.log("Speech finished");
            setTimeout(() => {
              setIsReadingComplete(true);
            }, 1000);
          },
        });
      } else {
        console.log("No question being asked");
      }
    }, 2800);

    return () => {
      clearTimeout(soundTimer);
      clearTimeout(speechTimer);
    };
  }, [isReadingComplete, questions, currQuestionNum]);

//useeffect so that readscreen doesn't have trouble rendering
//sends to the backend to start the countdown and reading has been completed (so kick them kids out of studentClicks)
useEffect (() => {
  if (isReadingComplete) {
    useStudentStore.setState({ nextQuestion: false });
    //setNextQuestion(false);
    WebSocketService.sendMessage(
      JSON.stringify({
        type: "countdownStarted",
      })
    );

    //DELETE
    console.log("NEXTQUESTION STATUS: ", nextQ);

    WebSocketService.sendMessage(
      JSON.stringify({
        type: "completedReading",
      })
    );
  }
}, [isReadingComplete])

//now seperate because react doesn't like this inside useEffect
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
