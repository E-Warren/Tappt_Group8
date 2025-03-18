import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Link, router, } from "expo-router";
import { WebSocketService } from "./webSocketService";


export default function DecksScreen() {
  //set empty state
  const [decks, setDecks] = useState([]);

  //useEffects limits the constant querying of the database
  useEffect(() => {
    const getDeck = async () => {
        //get decks from backend
        try {
            const response = await fetch('http://localhost:5000/view-decks', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Ensure cookies/sessions are sent

            });
    
            console.log("Response status:", response.status);
    
            const data = await response.json();
            console.log(data);
            
            if (response.ok) {
              console.log("Successfully got decks:", data);

              //set up deck data from backend to be inserted into decks array
              const insertDecks = data.map(deck => ({
                  id: deck.fld_deck_id_pk,
                  title: deck.fld_deck_name,
                  questions: deck.questioncount
              }));

              //insert into deck array
              setDecks(insertDecks);

            } else {
              console.log("Cannot fetch decks:", data.message);
              alert(data.message);
            }
            
        } catch (error) {
            console.log("Error during deck fetch:", error);
            alert("Server error, please try again later.");
        }
    };

    //run function now
    getDeck();
 }, []);

  // function created to render each deck card
  const renderDeck = ({ item }) => (
    <View style={styles.deckCard}>
      <Text style={styles.deckTitle}>{item.title}</Text>
      <Text style={styles.deckDetails}>{item.questions} Questions</Text>

      <View style={styles.buttonContainer}>
      <Link href={`/createdecks/${item.id}`} style={[styles.deckButton, styles.editButton]}>
        <Text style={{ color: "#fff" }}>Edit Deck</Text>
        </Link>
        <Link href="/teacherwaiting" onPress={async (e)=> {
          e.preventDefault();
          await WebSocketService.createWebSocket(); //creates the teacher's websocket
          console.log("Created :)");
          WebSocketService.sendMessage(JSON.stringify({ //calls backend message event to create room code
            type: "host",
          }))
          // set item
          router.push("/teacherwaiting");
        }} style={[styles.deckButton, styles.hostButton]}>
          <Text style={styles.buttonText}>Host Deck</Text>
        </Link>
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
    flex: 1,
    backgroundColor: "#4B0082",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center", // Ensures text is centered vertically
    textAlign: "center", // Helps center text within the button
    marginHorizontal: 3,
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
  },
});