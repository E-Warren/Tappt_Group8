import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { Link } from "expo-router";

interface Question { //question interface 
  questionText: string;
  answers: string[];
  imageUri?: string;
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

  const pickImage = async (index: number) => { //upload images to the question cards 
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const updated = [...questions];
      updated[index].imageUri = result.assets[0].uri;
      setQuestions(updated);
    }
  };

  const handleSaveDeck = () => { //save deck feature 
    if (!deckTitle.trim()) {
      Alert.alert("Deck title is required.");
      return;
    }
    console.log("Deck Saved:", { deckTitle, questions });
    Alert.alert("Deck saved successfully!");
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
          <TouchableOpacity style={styles.imageUpload} onPress={() => pickImage(qIndex)}>
            {q.imageUri ? (
              <Image source={{ uri: q.imageUri }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.uploadText}>Upload Image</Text>
            )}
          </TouchableOpacity>
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

const styles = StyleSheet.create({ //style and formatting for create dekcs screen 
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
  imageUpload: {
    height: 120,
    backgroundColor: "#e9e9e9",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  uploadText: {
    color: "#666",
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
