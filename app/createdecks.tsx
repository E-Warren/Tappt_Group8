import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, Alert } from "react-native";
import { Button } from "react-native-paper";
import { Link } from "expo-router";

interface Question { //question interface 
  questionText: string;
  answers: string[];
}

export default function CreateDeckScreen() {
  const [deckTitle, setDeckTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { questionText: "", answers: ["", "", "", ""] },
  ]);

  const addQuestion = () => { //add question feature 
    setQuestions([...questions, { questionText: "", answers: ["", "", "", ""] }]);
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

  const handleSaveDeck = async () => { //save deck feature 
    if (!deckTitle.trim()) {
      alert("Deck title is required.");
      return;
    }

    //setting up character limits for deck titles
    if (deckTitle.length > 128) {
        alert("Deck title needs to be below 128 characters.");
        return;
    }

    //setting the character limits for deck questions and answers
    for (let i = 0; i < questions.length; i++) {
        if (questions[i].questionText.length < 1) {
            alert(`Failed to save: Question ${i + 1} is empty.`);
            return;
        }
        if (questions[i].questionText.length > 768) {
            alert(`Failed to save: Question ${i + 1} exceeds the 1024 character limit.`);
            return;
        }
        for (let j = 0; j < 4; j++) {
            if (questions[i].answers[j].length < 1) {
                alert(`Failed to save: Answer ${j + 1} of Question ${i + 1} is empty.`);
                return;
            }
            if (questions[i].answers[j].length > 256) {
                alert(`Failed to save: Answer ${j + 1} of Question ${i + 1} exceeds the 256 character limit.`);
                return;
            }
        }
    }

    //send deck to backend
    try {
        const response = await fetch('http://localhost:5000/createdecks', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          credentials: 'include', // Ensure cookies/sessions are sent
          body: JSON.stringify({
            deckTitle: deckTitle.trim(),
            QnA: questions,
          }),
        });
  
        console.log("Response status:", response.status);
  
        const data = await response.json();
        
        if (response.ok) {
          console.log("Successfully created deck:", data);
          alert("Deck saved successfully!");
        } else {
          console.log("Cannot create deck:", data.message);
          alert(data.message);
        }
        
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
          <TextInput
            style={styles.questionInput}
            placeholder="Type your question"
            value={q.questionText}
            onChangeText={(text) => updateQuestionText(qIndex, text)}
          />
          {q.answers.map((a, aIndex) => (
            <TextInput
              key={aIndex}
              style={styles.answerInput}
              placeholder={`Answer ${aIndex + 1}`}
              value={a}
              onChangeText={(text) => updateAnswer(qIndex, aIndex, text)}
            />
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

const styles = StyleSheet.create({ //style and formatting for create decks screen 
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
  questionInput: {
    fontSize: 16,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  answerInput: {
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 8,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#6C5CE7",
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#00B894",
  },
});

