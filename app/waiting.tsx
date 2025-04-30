import React, { useEffect} from "react";
import { View, Text, StyleSheet } from "react-native";
import { useStudentStore } from "./useWebSocketStore";
import { WebSocketService } from "./webSocketService";
import { router } from "expo-router";

interface TransitionScreenProps {
  username?: string;
}

const TransitionScreen: React.FC<TransitionScreenProps> = ({ /* got username as playername */}) => {
  //to determine if everyone answered question
  const everyoneAnswered = useStudentStore(state => state.allStudentsAnswered);
  const setAllStudentsAnswered = useStudentStore(state => state.setAllStudentsAnswered);

  //for keeping track and updating current question numbers
  const currQuestionNum = useStudentStore(state => state.currQuestionNum);
  const setCurrQuestionNum = useStudentStore(state => state.setCurrQuestionNum);

  const playername = useStudentStore(state => state.name);
  const correctness = useStudentStore(state => state.ansCorrectness);
  
  /*const obtainCorrectness = async () => {
    //get correctness for student answer for current question
    console.log("requested to get answer correctness");
    WebSocketService.sendMessage(JSON.stringify({ type: "correctnessPls", data: {name: playername, currQNum: currQuestionNum} }));
  }

  useEffect(() => {
    const determineCorrectness = async () => {
      if (everyoneAnswered == true) {
        //resetting all students have answered and updating question number to next question
        console.log("everyone answered... routing back to questions");
        setAllStudentsAnswered(false);
        setCurrQuestionNum(currQuestionNum + 1);

        //the correctness of student answer will determine where the student will go...
        if (correctness == "correct") {
          router.push("/correct");
        }
        else if (correctness == "incorrect") {
          router.push("/incorrect");
        }
        else {
          router.push("/");
          console.log("something went wrong :(");
        }
      }
   }
    //just in case there is a backend error
    if ((correctness != "correct") && (correctness != "incorrect")) {
      obtainCorrectness();
    }
    //if no backend error & everything sent the way it should be -> routing to correct/incorrect.tsx
    else {
      determineCorrectness();
    }
  }, [everyoneAnswered, correctness])*/

  useEffect(() => {
    //get correctness for student answer for current question
    const obtainCorrectness = () => {
      console.log("Requested to get answer correctness...");
      WebSocketService.sendMessage(
        JSON.stringify({
          type: "correctnessPls",
          data: { name: playername, currQNum: currQuestionNum },
        })
      );
      console.log("The student answer was: ", correctness)
    };

    //seperate handler for determining student correctness
    //need this so student routing is dependent on what the websocket responds with, not what frontend thinks they should go to
    const determineCorrectness = () => {
      console.log("Everyone answered... Routing back to questions");
      console.log("The student answer used to route is: ", correctness);

      //the correctness of student answer will determine where the student will go...
      if (correctness === "correct") {
        router.replace("/correct");
      } 
      else if (correctness === "incorrect") {
        router.replace("/incorrect");
      } 
      else {
        console.log("Something went wrong :(");
        router.replace("/");
      }
    };

    //if everyone has answered
    //TODO: add timer parameter here
    if (everyoneAnswered) {
      //if the websocket sent an invalid form of correctness... >:(
      if (!["correct", "incorrect"].includes(correctness)) {
        obtainCorrectness();
      } 
      //else, we look at the correctness and route the student to the appropriate page :)
      else {
        determineCorrectness();
      }
    }
  }, [everyoneAnswered, correctness]);


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tappt</Text>
      <Text style={styles.username}>{playername}</Text>

      <Text style={styles.message}>Got it! Now we wait...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4a623", // Match the yellow/orange color
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
  message: {
    fontSize: 35,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
});

export default TransitionScreen;