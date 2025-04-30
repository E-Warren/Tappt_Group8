import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import QuestionWithTimerScreen from "./questiontimer";
import { WebSocketService } from "./webSocketService";
import { useIsFocused, useNavigation } from "@react-navigation/native"; // <- Add this if using React Navigation
import { useStudentStore } from "./useWebSocketStore";
import { router } from "expo-router";
import Config from './config';

interface ReadingScreenProps {
  playerCount?: number;
  questionID?: number;
  question?: string;
  choices?: { label: string; value: string; correct: boolean }[];
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

const ReadingScreen: React.FC<ReadingScreenProps> = () => {
  const [isReadingComplete, setIsReadingComplete] = useState(false);

  const navigation = useNavigation(); // <- Hook into navigation
  const [questions, setQuestions] = useState<ReadingScreenProps[]>([
    { question: "", questionID: -1, choices: [
      { label: "top", value: "", correct: false },
      { label: "left", value: "", correct: false },
      { label: "right", value: "", correct: false },
      { label: "bottom", value: "", correct: false },] },
    ]);


  //testing
  const nextQ = useStudentStore(state => state.nextQuestion);
  const setNextQuestion = useStudentStore(state => state.setNextQuestion);


  //player count for header
  const players = useStudentStore((state) => state.students);
  const totalPlayers = players.length;

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
  
      const qArr: React.SetStateAction<ReadingScreenProps[]> = [];
      const qMap = new Map();
  
      //mapping each question, questionID, and answer to a map
      data.forEach(row => { 
        if (!qMap.has(row.fld_card_q_pk)) {
          qMap.set(row.fld_card_q_pk, {
            questionID: row.fld_card_q_pk,
            question: row.fld_card_q,
            choices: [],
          });
        }
        qMap.get(row.fld_card_q_pk).choices.push({
          value: row.fld_card_ans,
          correct: row.fld_ans_correct,
        });
      });
      
  
      qMap.forEach((questionData) => {
        const filledChoices = [...questionData.choices];

        while (filledChoices.length < 4) {
          filledChoices.push({ value: "", correct: false });
        }

        const labeledChoices = filledChoices.slice(0, 4).map((choice, index) => ({
          label: ["top", "left", "right", "bottom"][index],
          value: choice.value,
          correct: choice.correct,
        }));
        
        qArr.push({
          questionID: questionData.questionID,
          question: questionData.question,
          choices: labeledChoices
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

  //separate useEffect for ding sound for the void double ding.
  useEffect(() => {
    if (questions.length === 0 || isReadingComplete) return;
    
    const soundTimer = setTimeout(() => {
      playSound(require("../assets/sound/ding-101492.mp3"));
    }, 500);
  
    return () => clearTimeout(soundTimer);
  }, [currQuestionNum]);  


  useEffect(() => {
    let aChoices: string[] = [];
    let currQuestion = questions[currQuestionNum];
    let correctOptions: number[] = [];
    let index = 0;
    if (currQuestion){
      currQuestion.choices?.forEach(choice => {
        console.log("the value of index is: ", index);
        aChoices.push(choice.value);
        if (choice.correct){
          console.log("Setting the correctindex to: ", index);
          correctOptions.push(index);
        }
        index++;
      });
      console.log("Going to set the correct array to: ", correctOptions );
      useStudentStore.setState({ correctIndex: correctOptions});
      useStudentStore.setState({ displayQuestion: currQuestion.question })
    }
    useStudentStore.setState({ answerChoices: aChoices });
    
  }, [questions])


  useEffect(() => {
    //avoid first question being reread
    useStudentStore.setState({ totalQuestions: questions.length });
    if (questions.length === 0 || isReadingComplete) {
      return;
    }

    console.log("questions.length ->", questions.length);

    console.log("Total questions being asked is now: ", questions.length);
    navigation.setOptions({ headerShown: false }); // <- Hides back arrow + screen title

    

    const speechTimer = setTimeout(() => {
      const questionAsked = questions[currQuestionNum];
      console.log("The current question number being asked is: ", currQuestionNum);
      console.log("The current question being asked is: ", questionAsked);
  
      if (questionAsked) {
        // Step 1: Read the main question first
        Speech.speak(questionAsked.question || "No more questions!", {
          onDone: () => {
            console.log("Question read complete. Now reading choices...");
  
            // Step 2: Sequentially read each choice using onDone chaining
            let i = 0;
  
            const readNextChoice = () => {
              if (i >= questionAsked.choices.length) {
                console.log("All choices read.");
                setIsReadingComplete(true); // <- Move to next screen only after all choices read
                return;
              }
  
              const choice = questionAsked.choices[i];
              const choiceValue = choice.value || "No value available";
              const toSpeak = `${choice.label}: ${choiceValue}`;
  
              console.log(`Reading choice ${i}: ${toSpeak}`);
              Speech.speak(toSpeak, {
                onDone: () => {
                  i++;
                  readNextChoice(); // recursively read next one
                },
              });
            };
  
            readNextChoice(); // Start reading first choice
          },
        });
      } else {
        console.log("No question being asked");
      }
    }, 2800);
  
    return () => {
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
      <Text style={styles.header}>Tappt</Text>
      <Text style={styles.players}>{totalPlayers} players</Text>
      <Text style={styles.readingText}>Reading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#125E4B",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingTop: 0,
    
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
  readingText: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ReadingScreen;