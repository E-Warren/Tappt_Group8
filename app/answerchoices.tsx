import React, { useRef } from "react";
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
import { router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import Config from './config';



interface AnswerChoiceScreenProps {
  questionID?: number;
  question?: string;
  choices?: { label: string; value: string; correct: boolean }[];
  timer?: number;
  questionNumber?: number;
  totalQuestions?: number;
  onAnswerPress?: (value: string, correct: boolean, questionID: number, currentQuestion: string) => void;
}

//obtain deckID from backend teacher socket
const requestDeckID = async () => {
  //get deckID for student-end so that students can load up questions on their end
  console.log("requested to obtain deckID");
  WebSocketService.sendMessage(JSON.stringify({ type: "sendDeckID" }));
}

const AnswerChoiceScreen: React.FC<AnswerChoiceScreenProps> = () => {
  const isFocused = useIsFocused();
  const arrowIcons = ["↑", "←", "→", "↓"];

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

  //question length
  const totalQuestions = questions.length;
  //set total number of questions
  const setTotalQuestions = useStudentStore(state => state.setTotalQuestions);

  //get current question through zustand state management
  const currQuestionNum = useStudentStore(state => state.currQuestionNum);

  const timeIsUp = useStudentStore(state => state.isTimeUp);
  const studentAnwered = useStudentStore(state => state.hasAnswered);

  //click count!!!!!!!!
  let clickCount = useStudentStore(state => state.clickCount);

  //bonus yus
  const bonus = useStudentStore(state => state.bonus);

 
  //this is where i calculate your bonus for you
  //only happens next round so hopefully you get the second to last question correct so you can use it
  useEffect(() => {
    if (bonus !== "") {
      if (bonus === "10% Bonus") {
        clickCount *= 1.10;
      }
      else if (bonus === "15% Bonus") {
        clickCount *= 1.15;
      }
      else if (bonus === "20% Bonus") {
        clickCount *= 1.20;
      }
      else {
        console.log("invalid bonus:", bonus)
      }
      //round up bonus because we don't want fractional clickCount (I think it's funny)
      clickCount = Math.round(clickCount);
      console.log("here new clickcount after bonus -> ", clickCount);
      useStudentStore.setState({ clickCount: clickCount })
      useStudentStore.setState({ bonus: ""});
    }
  }, [clickCount, bonus])

  useEffect(() => {
    console.log("UPDATING STUDENT SCORE");
    console.log("student with name ", playername, " has click count of ", clickCount);
  
    WebSocketService.sendMessage(JSON.stringify({
      type: "scoreUpdate", 
      data: {
        playername: playername,
        clickCount: clickCount,
      }
    }));
  }, []); 


  //room code
  const roomCode = useStudentStore(state => state.roomCode);

  //for avoiding error about this file affecting the rendering ability of /teacherwaiting
  const [letsgo, setletsgo] = useState(false);

  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const readStepRef = useRef(0);

  //TTS function to make repeat question and answer
  const readAloud = () => {
    if (!synth || !questions || questions.length === 0) return;
  
    const currentQ = questions[currQuestionNum];
    const totalSteps = 1 + (currentQ?.choices?.length ?? 0); 
    const step = readStepRef.current % totalSteps; 
    let textToRead = "";
  
    if (step === 0) {
      textToRead = currentQ?.question ?? "";
    } else {
      const choice = currentQ.choices[step - 1];
      textToRead = `${choice.label}: ${choice.value}`;
    }
  
    const utterance = new SpeechSynthesisUtterance(textToRead);
    synth.cancel();
    synth.speak(utterance);
  
    readStepRef.current++;
  };

  useEffect(() => {
    readStepRef.current = 0;
  
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        console.log("cleanup on currQuestionNum change or unmount");
      }
    };
  }, [currQuestionNum]);

  //if for some reason, nextQuestion is set to true prematurely, set it to false
  //should solve multiple games problem
  const nextQuestion = useStudentStore(state => state.nextQuestion);
    //testing
    //console.log("next question =", nextQuestion);

  useEffect(() => {
    if (nextQuestion) {
      useStudentStore.setState({nextQuestion: false});
    }
  }, [nextQuestion])

  //set total questions -> so that /teacherwaiting doesn't have to rerender
  useEffect(() => {
    setTotalQuestions(totalQuestions);
  }, [setTotalQuestions, totalQuestions]);

  //if its time to go to waiting room, we go to waiting room
  useEffect(() => {
    if (letsgo === true) {
      console.log("Routing to the waiting screen");
      router.replace("/waiting");
      setletsgo(false);
      useStudentStore.setState({ hasAnswered: true});
    }
  }, [letsgo])

  //save student answers by sending them to backend!
  const onAnswerPress = (answer: string, correct: boolean, questionID: number, currentQuestion: string, correctAnswer: string, location: number) => {
    console.log("saving answers to backend... ");
    if (isFocused){
      WebSocketService.sendMessage(JSON.stringify({ 
        type: "studentAnswer", 
        name: playername, 
        answer: answer,  
        questionID: questionID,
        currentQuestion: currentQuestion,
        correctness: correct,
        questionNum: currQuestionNum,
        clickCount: clickCount, //click count now added yayayyay
        location: location, //will be used to find which diamond the user pressed
        correctAnswer: correctAnswer,
        code: roomCode,
      }));
      console.log("click count -> ", clickCount)
      console.log("correctness ->", correct);

      setletsgo(true);
    }
  }

  //for obtaining questions & answers for answer diamond display
  useEffect(() => {
    //gets game deck for student display (questions/answers)
    const GetDeck = async () => {

      //deckID is preset to -1 in zustand. we need teacher's deck ID
      //edited this so we're not constantly querying database for each question
      if (deckID != -1)  {
        console.log("got valid deck");
      }

      //because I cant have request body for GET requests -> send deckID through parameters (yayy)
      try {
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

        const qArr: Array<any> = [];
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
    
      } 
      catch (error) {
        Alert.alert("Error:", (error as Error).message);
        return;
      }
    };

    //helps ensure that we don't load the screen until we get the teacher's deckID from backend
    if (deckID == -1) {
      requestDeckID();
    }
    //if we got the deckID, we will send a GET request for obtaining questions
    else {
      GetDeck();
    }

  }, [deckID]);

  let answerSent = false;

  useEffect(() => {
    //isFocused is used because past screens were not unmounting - meaning it would log a student's answer twice
    if (!isFocused) { //checks if this is the screen the view is looking at
      return;
    }
    //if time is up, the student has not answered, and the answer has not been sent, then route to incorrect screen
    if (timeIsUp && !studentAnwered && !answerSent){
      if (!answerSent){ //makes sure answer was not sent
        answerSent = true; //change answerSent to reflect that the answer has been sent
        useStudentStore.setState({ ansCorrectness: 'incorrect' }) //set answer as incorrect
        useStudentStore.setState({ hasAnswered: true}); //student has answered
        WebSocketService.sendMessage(JSON.stringify({ //send the students "no answer"
          type: "studentAnswer",
          name: playername,
          answer: "No answer",
          questionID: questions[currQuestionNum]?.questionID?? -1,
          currentQuestion: questions[currQuestionNum]?.question?? "",
          correctness: false, //changed this -> make sure this works
          questionNum: currQuestionNum,
          clickCount: clickCount, //updated: click counts stored
          location: -1,
          correctAnswer: questions[currQuestionNum]?.choices?.find(c => c.correct)?.value?? "",
          code: roomCode,
        }))
        console.log("Routing to the incorrect screen");
        router.replace('/incorrect'); //route student to "incorrect" screen
      }
    }
  }, [timeIsUp]) //re-render every time timeIsUp changes to true

  const timer = useStudentStore(state => state.currentTime);
  useEffect(() => {
    //the following keyHanglers are for the arrow keys
    const keydownHandler = (event: KeyboardEvent) => {
      console.log(event);
      if (event.key === "ArrowUp"){ //if the student chose the up arrow key
        console.log("Student pressed the up arrow key");
        //get the choice value that corresponds to top (up arrow)
        const choice = questions[currQuestionNum]?.choices?.find(c => c.label === "top");
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
        if (choice){ //if that is a valid choice, send the choice to the backend
          WebSocketService.sendMessage(JSON.stringify({
            type: "studentAnswer",
            name: playername,
            answer: choice.value,
            questionID: questions[currQuestionNum]?.questionID?? -1,
            currentQuestion: questions[currQuestionNum]?.question?? "",
            correctness: choice.correct,
            questionNum: currQuestionNum,
            clickCount: clickCount, //updated: click counts stored
            location: 0,
            correctAnswer: questions[currQuestionNum]?.choices?.find(c => c.correct)?.value?? "",
            code: roomCode,
          }))
          setletsgo(true); //let students continue to waiting page
        }
      }
      if (event.key === "ArrowDown") { //if student hits down arrow
        console.log("Student pressed the down arrow key");
        //get the choice value associated with the bottom (down arrow)
        const choice = questions[currQuestionNum]?.choices?.find(c => c.label === "bottom");
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
        if (choice) {
          //send the student's choice to backend
          WebSocketService.sendMessage(JSON.stringify({
            type: "studentAnswer",
            name: playername,
            answer: choice.value,
            questionID: questions[currQuestionNum]?.questionID?? -1,
            currentQuestion: questions[currQuestionNum]?.question?? "",
            correctness: choice.correct,
            questionNum: currQuestionNum,
            clickCount: clickCount, //updated: click counts stored
            location: 3,
            correctAnswer: questions[currQuestionNum]?.choices?.find(c => c.correct)?.value?? "",
            code: roomCode,
          }))
          setletsgo(true);
        }
      }
      if (event.key === "ArrowLeft") { //student chose the left arrow option
        //find the value associated with left (left arrow)
        const choice = questions[currQuestionNum]?.choices?.find(c => c.label === "left");
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
        if (choice) {
          console.log("The student chose the left arrow with value: ", choice.value);
          WebSocketService.sendMessage(JSON.stringify({
            type: "studentAnswer",
            name: playername,
            answer: choice.value,
            questionID: questions[currQuestionNum]?.questionID?? -1,
            currentQuestion: questions[currQuestionNum]?.question?? "",
            correctness: choice.correct,
            questionNum: currQuestionNum,
            clickCount: clickCount, //updated: click counts stored
            location: 1,
            correctAnswer: questions[currQuestionNum]?.choices?.find(c => c.correct)?.value?? "",
            code: roomCode,
          }))
          setletsgo(true);
        }
      }
      if (event.key === "ArrowRight") { //student pressed the right arrow key
        //find the value associated with the label right (right arrow key)
        const choice = questions[currQuestionNum]?.choices?.find(c => c.label === "right");
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
        if (choice) {
          console.log("The student chose the right arrow with value: ", choice.value);
          WebSocketService.sendMessage(JSON.stringify({
            type: "studentAnswer",
            name: playername,
            answer: choice.value,
            questionID: questions[currQuestionNum]?.questionID?? -1,
            currentQuestion: questions[currQuestionNum]?.question?? "",
            correctness: choice.correct,
            questionNum: currQuestionNum,
            clickCount: clickCount, //updated: click counts stored
            location: 2,
            correctAnswer: questions[currQuestionNum]?.choices?.find(c => c.correct)?.value?? "",
            code: roomCode,
          }))
          setletsgo(true);
        }
      }
      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        readAloud();
        return;
        }
      
    }
    window.addEventListener("keydown", keydownHandler);
    //remove the event listener upon dismount
    return () => window.removeEventListener("keydown", keydownHandler);
  }, [questions])



  return (
    <View style={styles.container}>
      <Text style={styles.username}>{playername}</Text>

      <View style={styles.content}>
        <View style={styles.leftPanel}>
        <Text style={styles.header}> Tappt</Text>
        <Text style={styles.timer}>{timer}</Text>
          <Text style={styles.question}>
            {questions[currQuestionNum]?.question || "questions are done. will need appropriate routing for this."}
          </Text>
        </View>
        <View style={styles.rightPanel}>
          <View style={styles.diamondLayout}>
            {questions[currQuestionNum]?.choices?.map((choice, index) => {
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
                  onPress={() =>
                    onAnswerPress(
                      choice.value,
                      choice.correct,
                      questions[currQuestionNum]?.questionID ?? -1,
                      questions[currQuestionNum]?.question ?? "",
                      questions[currQuestionNum]?.choices?.find(c => c.correct)?.value ?? "",
                      index
                    )
                  }
                >
                  <View style={styles.choiceContent}>
                    <Text style={styles.arrow}>{arrowIcons[index]}</Text>
                    <Text style={styles.choiceText}>{choice.value}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <Text style={styles.questionCounter}>
        Question {currQuestionNum + 1} / {totalQuestions}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#19d3a2",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
  },
  leftPanel: {
    flex: 1,
    backgroundColor: "#14665c", // darker green
    justifyContent: "center",
    alignItems: "center",
  },
  rightPanel: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    position: "absolute",
    top: 10,
    left: 9,
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
  question: {
    fontSize: 60,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    flexShrink: 1,
  },
  diamondLayout: {
    width: '75%',
    aspectRatio: 1,
    position: "relative",
    marginBottom: 0,
  },
  choiceButton: {
    width: "37%",
    height: "37%",
    borderRadius: 10,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "45deg" }],
  },
  top: {
    top: 0,
    left: "28%",
    fontSize:30,
  },
  left: {
    top: "28%",
    left: 0,
    fontSize:30,
  },
  right: {
    bottom: "35%",
    right: "7%",
    fontSize:30,
  },
  bottom: {
    bottom: "7%",
    right: "35%",
    fontSize:30,
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
  choice0: { backgroundColor: "#7340F2" },
  choice1: { backgroundColor: "#C62F2F" },
  choice2: { backgroundColor: "#105EDA" },
  choice3: { backgroundColor: "#CD3280" },
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


