import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Link, router } from "expo-router";
import { WebSocketService } from "./webSocketService";
import { useStudentStore } from "./useWebSocketStore";


interface Deck {
  id: string;
  title: string;
  questions: number;
}


const deleteDeckFromBackend = async (deckId: string, token: string): Promise<boolean> => {
  try {
        const response = await fetch('http://localhost:5000/view-decks', {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          credentials: 'include', // Ensure cookies/sessions are sent

          //just need deckID -> table for card decks deletes children (questions & answers)
          //when deletion of table for card_decks is called
          body: JSON.stringify({
            deckID: deckId.trim()
          }),
        });

    //if response is not 204 (successful deletion)
    if (!response.ok) {
      throw new Error("Failed to delete deck.");
    }

    return true;
  } 
  catch (error) {
    alert(error);
    return false;
  }
};

export default function DecksScreen() {
  const resetStudents = useStudentStore(state => state.resetStudents);
  //set empty state
  const [decks, setDecks] = useState<Deck[]>([]);

  //useEffects limits the constant querying of the database
  useEffect(() => {
    const getDeck = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Missing token. Please log in.");
        setTimeout(() => {
            router.push("/login");
        }, 0);
        return;
      }

      //get decks from backend
      try {
        const response = await fetch('http://localhost:5000/view-decks', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          alert("Access denied: please log in and try again.");
          return;
        }

        //set up deck data from backend to be inserted into decks array
        const insertDecks: Deck[] = data.map((deck: any) => ({
          id: deck.fld_deck_id_pk,
          title: deck.fld_deck_name,
          questions: deck.questioncount
        }));

        //set our decks into our Deck array
        setDecks(insertDecks);

      } catch (error) {
        console.log("Error during deck fetch:", (error as Error).message);
        alert("Server error, please try again later.");
      }
    };

    //run function now
    getDeck();
  }, []);

  const handleRemoveDeck = async (deckId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Missing token. Please log in.");
      return;
    }

    const confirmed = confirm("Are you sure you want to delete this deck?");
    if (!confirmed) return;

    const success = await deleteDeckFromBackend(deckId, token);
    if (success) {
      setDecks(prevDecks => prevDecks.filter(deck => deck.id !== deckId));
      alert("Deck removed successfully.");
    } 
    else {
      alert("Failed to remove deck. Please try again.");
    }
  };

  const renderDeck = ({ item }: { item: Deck }) => (
    

    <View style={styles.deckCard}>
      <Text style={styles.deckTitle}>{item.title}</Text>
      <Text style={styles.deckDetails}>{item.questions} Questions</Text>

      <View style={styles.buttonContainer}>
        <Link href={`/createdecks/${item.id}`} style={[styles.deckButton, styles.editButton]}>
          <Text style={{ color: "#fff" }}>Edit Deck</Text>
        </Link>

        <Link
          href="/teacherwaiting"
          onPress={async (e) => {
            //make deckID into base 10 int and store it into zustand
            useStudentStore.getState().setDeckID(parseInt(item.id, 10));

            e.preventDefault();
            //send type and deckID into backend

            WebSocketService.sendMessage(JSON.stringify({ type: "host", deck: item.id }));
            resetStudents();
            router.push("/teacherwaiting");
          }}
          style={[styles.deckButton, styles.hostButton]}
        >
          <Text style={styles.buttonText}>Host Deck</Text>
        </Link>

        <TouchableOpacity
          onPress={() => handleRemoveDeck(item.id)}
          style={[styles.deckButton, styles.removeButton]}
        >
          <Text style={styles.buttonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Link href="/" style={styles.backButton}>
          ← Back
        </Link>
        <Text style={styles.header}>Available Decks</Text>
        <Link href="/createdecks" style={styles.newDeckButton}>
          + New Deck
        </Link>
      </View>

      <FlatList
        data={decks}
        renderItem={renderDeck}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

// STYLES (unchanged from your code)
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
    paddingHorizontal: 40,
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
    width: "70%",
    alignSelf: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    flexWrap: "wrap",
  },
  deckButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
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
  removeButton: {
    backgroundColor: "#D11A2A",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

