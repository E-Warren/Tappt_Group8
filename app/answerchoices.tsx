import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Alert,
} from "react-native";
import { useStudentStore } from "./useWebSocketStore";
import { WebSocketService } from "./webSocketService";
import { useEffect, useState } from "react";

interface AnswerChoiceScreenProps {
  questionID?: number;
  question?: string;
  choices?: { label: string; value: string; correct: boolean }[];
  timer?: number;
  questionNumber?: number;
  totalQuestions?: number;
  onAnswerPress?: (value: string, correct: boolean, questionID: number, currentQuestion: string) => void;
  onNextPress?: () => void; // NEW PROP
}

//obtain deckID from backend teacher socket
const requestDeckID = async () => {
  //get deckID for student-end so that students can load up questions on their end
  console.log("requested to obtain deckID");
  WebSocketService.sendMessage(JSON.stringify({ type: "sendDeckID" }));
}

const AnswerChoiceScreen: React.FC<AnswerChoiceScreenProps> = () => {
  const arrowIcons = ["↑", "←", "→", "↓"];

  //for keeping track of question count
  const [currIndex, setIndex] = useState(0);
  //for setting questions up
  const [questions, setQuestions] = useState<AnswerChoiceScreenProps[]>([
      { question: "", questionID: -1, choices: [
        { label: "top", value: "", correct: false },
        { label: "left", value: "", correct: false },
        { label: "right", value: "", correct: false },
        { label: "bottom", value: "", correct: false },] },
  ]);

  //get deckID stored in zustand
  const deckID = useStudentStore(state => state.deckID);
  //obtain player's name
  const playername = useStudentStore(state => state.name);

  //to determine if everyone answered question
  const everyoneAnswered = useStudentStore(state => state.allStudentsAnswered);
  const setAllStudentsAnswered = useStudentStore(state => state.setAllStudentsAnswered);

  //question length
  const totalQuestions = questions.length;

  //updates the current question index if next is pressed
  //**FOR DEVELOPMENT PURPOSES**
  const onNextPress = () => {
    console.log("Next pressed");
    if (currIndex < questions.length) {
      setIndex(currIndex + 1);
      setAllStudentsAnswered(false);
    }
    else {
      Alert.alert("All questions are done");
    }
  }

  //save student answers by sending them to backend!
  const onAnswerPress = (answer: string, correct: boolean, questionID: number, currentQuestion: string) => {
    console.log("saving answers to backend... ");
      WebSocketService.sendMessage(JSON.stringify({ 
        type: "studentAnswer", 
        name: playername, 
        answer: answer,  
        questionNum: questionID,
        currentQuestion: currentQuestion,
        correctness: correct,
        clickCount: 1, //CHANGE THIS -> HARDCODED
      }));
  }

  //for checking if everyone has answered -> configure this later to have correct routing
  useEffect(() => {
    console.log("checking if everyone answered current question...");
    if (everyoneAnswered == true) {
      console.log("everyone answered!");
    }
  }, [everyoneAnswered]);

  //for obtaining questions & answers for answer diamond display
  useEffect(() => {
    //gets game deck for student display (questions/answers)
    const GetDeck = async () => {

      //deckID is preset to -1 in zustand. we need teacher's deck ID
      if (deckID == -1)  {
        console.log("waiting for valid deck...");
        return;
      }

      //because I cant have request body for GET requests -> send deckID through parameters (yayy)
      try {
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
              choices: [],
            });
          }
            //setting up answers and their correctness
            qMap.get(row.fld_card_q_pk).choices.push({
              value: row.fld_card_ans,
              correct: row.fld_ans_correct,
            });
        });

        //transform our map into an array (so it can be used by frontend yay)
        qMap.forEach((questionData) => {
          const filledChoices = [...questionData.choices];

          while (filledChoices.length < 4) {
            filledChoices.push({ value: "", correct: false });
          }

          //assign labels to each answer so that the top label is the first answer, left in the second, and so on
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

        //set our states up yippee
        setQuestions(qArr);
        setIndex(0);
    
      } 
      catch (error) {
        Alert.alert("Error:", (error as Error).message);
        return;
      }
    };

    //helps ensure that we don't load the screen until we get the teacher's deckID from backend
    if (deckID === -1) {
      requestDeckID();
    }
    //if we got the deckID, we will send a GET request for obtaining questions
    else {
      GetDeck();
    }

  }, [deckID]);

  const timer = useStudentStore(state => state.currentTime);
  const name = useStudentStore(state => state.name);
  useEffect(() => {
    const keydownHandler = (event: KeyboardEvent) => {
      console.log(event);
      if (event.key === "ArrowUp"){
        console.log("Student pressed the up arrow key");
        const choice = questions[currIndex]?.choices?.find(c => c.label === "top");
        if (choice){
          console.log("The student chose the up arrow with value: ", choice.value);
          WebSocketService.sendMessage(JSON.stringify({
            type: "studentAnswer",
            data: {
              name,
              answer: choice.value,
              questionNumber: questions[currIndex]?.questionID,
              clickCount: 100, //TODO: update this once the clicks are stored
            }
          }))
        }
      }
      if (event.key === "ArrowDown") {
        console.log("Student pressed the down arrow key");
        const choice = questions[currIndex]?.choices?.find(c => c.label === "bottom");
        if (choice) {
          console.log("The student chose the down arrow with value: ", choice.value);
          WebSocketService.sendMessage(JSON.stringify({
            type: "studentAnswer",
            data: {
              name,
              answer: choice.value,
              questionNumber: questions[currIndex]?.questionID,
              clickCount: 100, //TODO: update this once the clicks are stored
            }
          }))
        }
      }
      if (event.key === "ArrowLeft") {
        console.log("Student pressed the left arrow key");
        const choice = questions[currIndex]?.choices?.find(c => c.label === "left");
        if (choice) {
          console.log("The student chose the left arrow with value: ", choice.value);
          WebSocketService.sendMessage(JSON.stringify({
            type: "studentAnswer",
            data: {
              name,
              answer: choice.value,
              questionNumber: questions[currIndex]?.questionID,
              clickCount: 100, //TODO: update this once the clicks are stored
            }
          }))
        }
      }
      if (event.key === "ArrowRight") {
        console.log("Student pressed the right arrow key");
        const choice = questions[currIndex]?.choices?.find(c => c.label === "right");
        if (choice) {
          console.log("The student chose the right arrow with value: ", choice.value);
          WebSocketService.sendMessage(JSON.stringify({
            type: "studentAnswer",
            data: {
              name,
              answer: choice.value,
              questionNumber: questions[currIndex]?.questionID,
              clickCount: 100, //TODO: update this once the clicks are stored
            }
          }))
        }
      }
    }
    window.addEventListener("keydown", keydownHandler);
    return () => window.removeEventListener("keydown", keydownHandler);
  }, [questions])



  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tappt</Text>
      <Text style={styles.username}>{playername}</Text>

      <Text style={styles.question}>{questions[currIndex]?.question || "questions are done. will need appriopriate routing for this."}</Text>

      <View style={styles.diamondLayout}>
        {questions[currIndex]?.choices?.map((choice, index) => {
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
              //questions[currIndex]?.questionID?? -1 is the fallback number if, somehow, questionID is undefined :')
              onPress={() => onAnswerPress(choice.value, choice.correct, questions[currIndex]?.questionID?? -1, questions[currIndex]?.question?? "")}
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
        Question {currIndex + 1} / {totalQuestions}
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
    width: 110,
    height: 110,
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
    fontSize: 25,
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

