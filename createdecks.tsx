import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet } from "react-native";
import { Button, Checkbox } from "react-native-paper";
import { Link } from "expo-router";

interface Question {
  questionText: string;
  answers: string[];
  correctAnswers: boolean[];
}

export default function CreateDeckScreen() {
  const [deckTitle, setDeckTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { questionText: "", answers: ["", "", "", ""], correctAnswers: [false, false, false, false] },
  ]);

  const addQuestion = () => {
    setQuestions([...questions, {
      questionText: "",
      answers: ["", "", "", ""],
      correctAnswers: [false, false, false, false],
    }]);
  };

  const removeQuestion = (qIndex: number) => {
    if (questions.length === 1) {
      alert("At least one question is required.");
      return;
    }

    const updated = questions.filter((_, index) => index !== qIndex);
    setQuestions(updated);
  };

  const updateQuestionText = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].questionText = text;
    setQuestions(updated);
  };

  const updateAnswer = (qIndex: number, aIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].answers[aIndex] = text;
    setQuestions(updated);
  };

  const toggleCorrectAnswer = (qIndex: number, aIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correctAnswers = updated[qIndex].correctAnswers.map(() => false);
    updated[qIndex].correctAnswers[aIndex] = true;
    setQuestions(updated);
  };

  const handleSaveDeck = async () => {
    if (!deckTitle.trim()) {
      alert("Deck title is required.");
      return;
    }

    if (deckTitle.length > 128) {
      alert("Deck title needs to be below 128 characters.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (questions[i].questionText.length < 1) {
        alert(`Failed to save: Question ${i + 1} is empty.`);
        return;
      }
      if (questions[i].questionText.length > 768) {
        alert(`Failed to save: Question ${i + 1} exceeds the 768 character limit.`);
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

      const correctCount = questions[i].correctAnswers.filter((val) => val).length;
      if (correctCount !== 1) {
        alert(`Question ${i + 1} must have exactly one correct answer selected.`);
        return;
      }
    }

    try {
      const response = await fetch('http://localhost:5000/createdecks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          deckTitle: deckTitle.trim(),
          QnA: questions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Deck saved successfully!");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log("Error during deck creation:", error);
      alert("Server error, please try again later.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Link href="/view-decks" style={styles.backButton}>← Back</Link>
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
              <Checkbox
                status={q.correctAnswers[aIndex] ? "checked" : "unchecked"}
                onPress={() => toggleCorrectAnswer(qIndex, aIndex)}
              />
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
  addButton: {
    backgroundColor: "#6C5CE7",
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#00B894",
  },
});


