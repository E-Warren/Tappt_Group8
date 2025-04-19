import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable } from "react-native";
import { Button } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Config from './config';

interface Question { //question interface 
  questionText: string;
  answers: string[];
  correctAnswers: boolean[];
}

export default function CreateDeckScreen() {
  const router = useRouter();

  const [deckTitle, setDeckTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { questionText: "", answers: ["", "", "", ""], correctAnswers: [false, false, false, false] },
  ]);

  const addQuestion = () => { //add question feature
    //to generate a lovely list of errors
    let badAns: string[] = [];

    //go through EACH and every question and answer to see if they're empty and/or they've reached
    //the max character limits
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].questionText.length < 1) {
          badAns.push(`Question ${i+1} is empty.`);
      }
      if (questions[i].questionText.length > 768) {
          badAns.push(`Question ${i+1} is exceeds 768 character limit.`);
      }
      for (let j = 0; j < 4; j++) {
          if (questions[i].answers[j].length < 1) {
              badAns.push(`Question ${i+1}: Answer ${j + 1} is empty.`);
          }
          if (questions[i].answers[j].length > 256) {
              badAns.push(`Question ${i+1}: Answer ${j + 1} exceeds the 256 character limit.`);
          }
      }
      const correctCount = questions[i].correctAnswers.filter(Boolean).length;
      if (correctCount < 1) {
        badAns.push(`Question ${i + 1} must have at least one correct answer.`);
      }
    }

    //check to see if there are any errors
    if (badAns.length != 0) {
      //add error message to beginning of errors
      badAns.unshift("Cannot add new question:")
      alert(badAns.join("\n"));
      return;
    }

    //else, add new question
    setQuestions([
      ...questions, 
      { 
      questionText: "", 
      answers: ["", "", "", ""],
      correctAnswers: [false, false, false, false]
      }
    ]);
  };

  const removeQuestion = (qIndex: number) => {
    if (questions.length === 1) {
      alert("At least one question is required.");
      return;
    }

    const updated = questions.filter((_, index) => index !== qIndex);
    setQuestions(updated);
  };

  const updateQuestionText = (index: number, text: string) => { //update question text boxes 
    const updated = [...questions];
    updated[index].questionText = text;
    setQuestions(updated);
  };

  const updateAnswer = (qIndex: number, aIndex: number, text: string) => { //update answer text boxes
    const updated = [...questions];
    updated[qIndex].answers[aIndex] = text;
    setQuestions(updated);
  };

  const toggleCorrectAnswer = (qIndex: number, aIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correctAnswers[aIndex] = !updated[qIndex].correctAnswers[aIndex];
    setQuestions(updated);
  };

  const handleSaveDeck = async () => { //save deck feature 
    //to generate a lovely list of errors
    let badAns: string[] = [];

    if (!deckTitle.trim()) {
      badAns.push("Deck title is required.");
    }

    //setting up character limits for deck titles
    if (deckTitle.length > 128) {
      badAns.push("Deck title needs to be below 128 characters.");
    }

    //go through EACH and every question and answer to see if they're empty and/or they've reached
    //the max character limits
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].questionText.length < 1) {
          badAns.push(`Question ${i+1} is empty.`);
      }
      if (questions[i].questionText.length > 768) {
          badAns.push(`Question ${i+1} is exceeds 768 character limit.`);
      }
      for (let j = 0; j < 4; j++) {
          if (questions[i].answers[j].length < 1) {
              badAns.push(`Question ${i+1}: Answer ${j + 1} is empty.`);
          }
          if (questions[i].answers[j].length > 256) {
              badAns.push(`Question ${i+1}: Answer ${j + 1} exceeds the 256 character limit.`);
        }
      }
      const correctCount = questions[i].correctAnswers.filter(Boolean).length;
      if (correctCount < 1) {
        badAns.push(`Question ${i + 1} must have at least one correct answer.`);
      }
    }

    //check to see if there are any errors
    if (badAns.length != 0) {
      badAns.unshift("Error(s):")
      alert(badAns.join("\n"));
      return;
    }


    //send deck to backend if no errors
    try {
      const token = localStorage.getItem('token');

        const response = await fetch(`${Config.BE_HOST}/createdecks`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          credentials: 'include', // Ensure cookies/sessions are sent
          body: JSON.stringify({
            deckTitle: deckTitle.trim(),
            QnA: questions,
          }),
        });
  
        console.log("Response status:", response.status);
  
        const data = await response.json();
        
        if(!response.ok){
          alert("Access denied: please log in and try again.");
          return;
        }

 //       if (response.ok) {
          console.log("Successfully created deck:", data);
          alert("Deck saved successfully!");
          router.push("/view-decks");
/*        } else {
          console.log("Cannot create deck:", data.message);
          alert(data.message);
        }
 */       
    } catch (error) {
        console.log("Error during deck creation:", error);
        alert("Server error, please try again later.");
    }
  };

  return ( //includes back button to view decks page 
    
    <ScrollView contentContainerStyle={styles.container}> 
        <View style={styles.headerContainer}>
            <Link href="/view-decks" style={styles.backButton}>
              ← Back
            </Link>
          </View>
      <Text style={styles.header}>Create a New Deck</Text>
      <TextInput
        style={styles.input}
        placeholder="Deck Title"
        value={deckTitle}
        onChangeText={setDeckTitle}
      />
      {questions.map((q, qIndex) => (
        <View key={qIndex} style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>Question {qIndex + 1}</Text>
            <Button
              onPress={() => removeQuestion(qIndex)}
              mode="outlined"
              style={styles.removeButton}
              textColor="#d63031"
            >
              Remove
            </Button>
          </View>
          <TextInput
            style={styles.questionInput}
            placeholder="Type your question"
            value={q.questionText}
            onChangeText={(text) => updateQuestionText(qIndex, text)}
          />
          {q.answers.map((a, aIndex) => (
              <View
              key={aIndex}
              style={[
                styles.answerRow,
                q.correctAnswers[aIndex] && styles.correctAnswerRow,
              ]}
            >
              <Pressable
                onPress={() => toggleCorrectAnswer(qIndex, aIndex)}
                style={styles.checkboxSquare}
              >
                <View style={styles.checkboxBox}>
                  {q.correctAnswers[aIndex] && (
                    <MaterialIcons name="check" size={18} color="green" />
                  )}
                </View>
              </Pressable>

              <TextInput
                style={styles.answerInput}
                placeholder={`Answer ${aIndex + 1}`}
                value={a}
                onChangeText={(text) => updateAnswer(qIndex, aIndex, text)}
              />
            </View>
          ))}
        </View>
      ))}
      <Button mode="contained" onPress={addQuestion} style={styles.addButton}>
        + Add Question
      </Button>
      <Button mode="contained" onPress={handleSaveDeck} style={styles.saveButton}>
         Save Deck
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#7F55E0FF",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    fontSize: 18,
    color: "#fff",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 18,
  },
  questionCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  removeButton: {
    borderColor: "#d63031",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  questionInput: {
    fontSize: 16,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  answerInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 8,
    fontSize: 16,
  },
  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    gap: 6,
  },
  correctAnswerRow: {
    borderWidth: 2,
    borderColor: "green",
    borderRadius: 6,
    padding: 4,
    backgroundColor: "#e6ffea",
  },
  checkboxSquare: {
    marginRight: 10,
    height: 24,
    width: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxBox: {
    height: 20,
    width: 20,
    borderWidth: 2,
    borderColor: "#555",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#6C5CE7",
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#00B894",
  },
});