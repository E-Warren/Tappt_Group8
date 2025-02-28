import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";

// example decks 
const decks = [
  { id: "1", title: "Math Challenge", questions: 10 },
  { id: "2", title: "History Trivia", questions: 15 },
  { id: "3", title: "Science Quiz", questions: 12 },
  { id: "4", title: "Geography Facts", questions: 8 },
  { id: "5", title: "General Knowledge", questions: 20 },
];

export default function DecksScreen() {
  // function created to render each deck card
  const renderDeck = ({ item }) => (
    <View style={styles.deckCard}>
      <Text style={styles.deckTitle}>{item.title}</Text>
      <Text style={styles.deckDetails}>{item.questions} Questions</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.deckButton, styles.editButton]}>
        <Text style={{ color: "#fff" }}>Edit Deck</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.deckButton, styles.hostButton]}>
        <Text style={{ color: "#fff" }}>Host Deck</Text>
        </TouchableOpacity>
    </View>
    </View>
  );

  return ( // can change this to sign in or home screen later
    <View style={styles.container}>
      {/* navigation buttons at the top */}
      <View style={styles.headerContainer}>
        <Link href="/" style={styles.backButton}>
          ← Back
        </Link>
        <Text style={styles.header}>Available Decks</Text>
        <Link href="/createdecks" style={styles.newDeckButton}>
          + New Deck
        </Link>
      </View>

      {/* list of decks */}
      <FlatList
        data={decks}
        renderItem={renderDeck}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7F55E0FF",
    paddingTop: 50,
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
  newDeckButton: {
    fontSize: 18,
    color: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  list: {
    paddingHorizontal: 40, // increased padding for better spacing
  },
  deckCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    width: "70%", // adjust width of the card
    alignSelf: "center",
  },
  
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // space between buttons
    marginTop: 10,
  },
  
  deckButton: {
    flex: 1, // makes buttons take equal space
    backgroundColor: "#4B0082",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 3, // adds space between buttons
  },
  
  deckTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  deckDetails: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  hostButton: {
    backgroundColor: "#4E85EBFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

