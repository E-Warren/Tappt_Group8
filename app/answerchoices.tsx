import React, { useRef, useEffect, useState } from "react";
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
import { router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import Config from './config';

interface AnswerChoiceScreenProps {
  questionID?: number;
  question?: string;
  choices?: { label: string; value: string; correct: boolean }[];
}

const AnswerChoiceScreen: React.FC = () => {
  const isFocused = useIsFocused();
  const arrowIcons = ["\u2191", "\u2190", "\u2192", "\u2193"];
  const [questions, setQuestions] = useState<AnswerChoiceScreenProps[]>([{
    question: "",
    questionID: -1,
    choices: [
      { label: "top", value: "", correct: false },
      { label: "left", value: "", correct: false },
      { label: "right", value: "", correct: false },
      { label: "bottom", value: "", correct: false },
    ],
  }]);

  const deckID = useStudentStore(state => state.deckID);
  const playername = useStudentStore(state => state.name);
  const roomCode = useStudentStore(state => state.roomCode);
  const totalQuestions = questions.length;
  const setTotalQuestions = useStudentStore(state => state.setTotalQuestions);
  const currQuestionNum = useStudentStore(state => state.currQuestionNum);
  const timeIsUp = useStudentStore(state => state.isTimeUp);
  const studentAnwered = useStudentStore(state => state.hasAnswered);
  const clickCount = useStudentStore(state => state.clickCount);
  const [letsgo, setletsgo] = useState(false);
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const readStepRef = useRef(0);

  const timer = useStudentStore(state => state.currentTime);

  const readAloud = () => {
    if (!synth || questions.length === 0) return;
    const currentQ = questions[currQuestionNum];
    const totalSteps = 1 + (currentQ?.choices?.length ?? 0);
    const step = readStepRef.current % totalSteps;
    let textToRead = step === 0 ? currentQ?.question ?? "" : `${currentQ.choices[step - 1]?.label}: ${currentQ.choices[step - 1]?.value}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    synth.cancel();
    synth.speak(utterance);
    readStepRef.current++;
  };

  useEffect(() => {
    readStepRef.current = 0;
    return () => { if (synth) synth.cancel(); };
  }, [currQuestionNum]);

  const requestDeckID = async () => {
    WebSocketService.sendMessage(JSON.stringify({ type: "sendDeckID" }));
  };

  const onAnswerPress = (answer: string, correct: boolean, questionID: number, currentQuestion: string) => {
    WebSocketService.sendMessage(JSON.stringify({
      type: "studentAnswer",
      name: playername,
      answer,
      questionID,
      currentQuestion,
      correctness: correct,
      questionNum: currQuestionNum,
      clickCount,
      correctAnswer: questions[currQuestionNum]?.choices?.find(c => c.correct)?.value ?? "",
      code: roomCode,
    }));
    setletsgo(true);
  };

  useEffect(() => {
    if (letsgo) {
      router.replace("/waiting");
      setletsgo(false);
      useStudentStore.setState({ hasAnswered: true });
    }
  }, [letsgo]);

  useEffect(() => { setTotalQuestions(totalQuestions); }, [setTotalQuestions, totalQuestions]);

  useEffect(() => {
    const GetDeck = async () => {
      if (deckID !== -1) {
        try {
          const response = await fetch(`${Config.BE_HOST}/answerchoices/${deckID}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
          const data = await response.json();
          if (!response.ok) throw new Error("Failed to get deck.");

          const qArr: Array<any> = [];
          const qMap = new Map();

          data.forEach(row => {
            if (!qMap.has(row.fld_card_q_pk)) {
              qMap.set(row.fld_card_q_pk, {
                questionID: row.fld_card_q_pk,
                question: row.fld_card_q,
                choices: [],
              });
            }
            qMap.get(row.fld_card_q_pk).choices.push({ value: row.fld_card_ans, correct: row.fld_ans_correct });
          });

          qMap.forEach((questionData) => {
            const filledChoices = [...questionData.choices];
            while (filledChoices.length < 4) filledChoices.push({ value: "", correct: false });
            const labeledChoices = filledChoices.slice(0, 4).map((choice, index) => ({
              label: ["top", "left", "right", "bottom"][index],
              value: choice.value,
              correct: choice.correct,
            }));
            qArr.push({
              questionID: questionData.questionID,
              question: questionData.question,
              choices: labeledChoices,
            });
          });

          setQuestions(qArr);
        } catch (error) {
          Alert.alert("Error:", (error as Error).message);
        }
      }
    };

    if (deckID === -1) requestDeckID();
    else GetDeck();
  }, [deckID]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.header}>Tappt</Text>
        <Text style={styles.username}>{playername}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.leftSide}>
          <Text style={styles.question}>
            {questions[currQuestionNum]?.question || "No question."}
          </Text>
        </View>

        <View style={styles.diamondSide}>
          <View style={styles.diamondLayout}>
            {questions[currQuestionNum]?.choices?.map((choice, index) => {
              const positionStyle =
                index === 0 ? styles.top :
                index === 1 ? styles.left :
                index === 2 ? styles.right :
                styles.bottom;

              const backgroundStyle = styles[`choice${index}` as keyof typeof styles] as ViewStyle;

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.choiceButton, backgroundStyle, positionStyle]}
                  onPress={() => onAnswerPress(choice.value, choice.correct, questions[currQuestionNum]?.questionID ?? -1, questions[currQuestionNum]?.question ?? "")}
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

      <View style={styles.bottomBar}>
        <Text style={styles.timer}>{timer}</Text>
        <Text style={styles.questionCounter}>
          Question {currQuestionNum + 1} / {totalQuestions}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#19d3a2", padding: 10 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 10 },
  header: { fontSize: 30, color: "white" },
  username: { fontSize: 30, color: "white" },
  content: { flex: 1, flexDirection: "row", alignItems: "stretch" },
  leftSide: { width: "50%", backgroundColor: "#14665c", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  diamondSide: { width: "50%", justifyContent: "center", alignItems: "center" },
  question: { fontSize: 28, fontWeight: "bold", color: "white", textAlign: "center" },
  diamondLayout: { width: "73.5%", aspectRatio: 1, position: "relative" },
  choiceButton: { width: "42%", height: "42%", borderRadius: 10, position: "absolute", justifyContent: "center", alignItems: "center", transform: [{ rotate: "45deg" }], shadowColor: "#000", shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  choiceContent: { transform: [{ rotate: "-45deg" }], alignItems: "center" },
  arrow: { fontSize: 25, color: "white", marginBottom: 4 },
  choiceText: { fontSize: 18, color: "white", fontWeight: "bold", textAlign: "center" },
  top: { top: 0, left: "29%" },
  left: { top: "29%", left: 0 },
  right: { top: "29%", right: 0 },
  bottom: { bottom: 0, left: "29%" },
  choice0: { backgroundColor: "#8e44ad" },
  choice1: { backgroundColor: "#f39c12" },
  choice2: { backgroundColor: "#3498db" },
  choice3: { backgroundColor: "#e74c3c" },
  bottomBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginTop: 10 },
  timer: { fontSize: 36, color: "white" },
  questionCounter: { fontSize: 28, color: "white" },
});

export default AnswerChoiceScreen;
