import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Link, router } from "expo-router";
import { WebSocketService } from "./webSocketService";
import { useStudentStore } from "./useWebSocketStore";
import Config from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Deck {
  id: string;
  title: string;
  questions: number;
}


const deleteDeckFromBackend = async (
  deckId: string,
  token: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${Config.BE_HOST}/view-decks`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({ deckID: deckId.trim() }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete deck.");
    }
    return true;
  } catch (error) {
    alert(error);
    return false;
  }
};

export default function DecksScreen() {
  const resetStudents = useStudentStore((state) => state.resetStudents);
  const [decks, setDecks] = useState<Deck[]>([]);

  useEffect(() => {
    const getDeck = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Missing token. Please log in.");
        setTimeout(() => {
          router.push("/login");
        }, 0);
        return;
      }

      try {
        const response = await fetch(`${Config.BE_HOST}/view-decks`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          alert("Access denied: please log in and try again.");
          router.replace("/login")
          return;
        }

        const data = await response.json();
        const insertDecks: Deck[] = data.map((deck: any) => ({
          id: deck.fld_deck_id_pk,
          title: deck.fld_deck_name,
          questions: deck.questioncount,
        }));
        setDecks(insertDecks);
      } catch (error) {
        console.log("Error during deck fetch:", (error as Error).message);
        alert("Server error, please try again later.");
      }
    };

    getDeck();
  }, [router]);

  const handleRemoveDeck = async (deckId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Missing token. Please log in.");
      return;
    }
    if (!confirm("Are you sure you want to delete this deck?")) return;

    const success = await deleteDeckFromBackend(deckId, token);
    if (success) {
      setDecks((prev) => prev.filter((d) => d.id !== deckId));
      alert("Deck removed successfully.");
    } else {
      alert("Failed to remove deck. Please try again.");
    }
  };

  const [userInfo, setUserInfo] = useState(null);
  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    setUserInfo(null);
    localStorage.removeItem("token");
    
    setTimeout(() => {
      router.push("/login");
    }, 0);

    console.log("Logged out!");
    
  };

  const renderDeck = ({ item }: { item: Deck }) => (
    <View style={styles.deckCard}>
      <Text style={styles.deckTitle}>{item.title}</Text>
      <Text style={styles.deckDetails}>{item.questions} Questions</Text>

      <View style={styles.buttonContainer}>
        {/* Edit Deck */}
        <TouchableOpacity
          style={[styles.deckButton, styles.editButton]}
          onPress={() => router.push(`/createdecks/${item.id}`)}
        >
          <Text style={styles.buttonText}>Edit Deck</Text>
        </TouchableOpacity>

        {/* Host Deck */}
        <TouchableOpacity
          style={[styles.deckButton, styles.hostButton]}
          onPress={() => {
            useStudentStore.getState().setDeckID(parseInt(item.id, 10));
            WebSocketService.sendMessage(
              JSON.stringify({ type: "host", deck: item.id })
            );
            resetStudents();
            router.push("/teacherwaiting");
          }}
        >
          <Text style={styles.buttonText}>Host Deck</Text>
        </TouchableOpacity>

        {/* Remove Deck */}
        <TouchableOpacity
          style={[styles.deckButton, styles.removeButton]}
          onPress={() => handleRemoveDeck(item.id)}
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

      {/* Floating Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7F55E0FF",
    paddingTop: 20,
    position: "relative",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    marginBottom: 50,
  },
  backButton: {
    fontSize: 25,
    color: "#fff",
  },
  newDeckButton: {
    fontSize: 25,
    color: "#fff",
  },
  header: {
    fontSize: 35,
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
    backgroundColor: "#f06292",
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
    textAlign: "center",
    width: "100%",
  },
  logoutButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#FF4B4B',
    padding: 10,
    borderRadius: 6,
  },
});