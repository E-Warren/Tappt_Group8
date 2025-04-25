import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Link, router } from "expo-router";
import { useStudentStore } from "./useWebSocketStore";
import { WebSocketService } from "./webSocketService";
import { CommonActions } from "@react-navigation/native";
import Config from './config';

const GameSummaryScreen = () => {
  const playerName = useStudentStore((state) => state.name);
  const gameEnded = useStudentStore((state) => state.gameEnded);
  const clickCount = useStudentStore(state => state.clickCount);

  const reviewPress = () => {
    router.replace("/review");
  };


  //to handle routing back to student login
  useEffect(() => {
    if (gameEnded) {
      router.replace("/slogin");
    }
  }, [gameEnded]);

  //will only say game ended if student chooses to join a new game
  const handlePress = () => {
    WebSocketService.sendMessage(JSON.stringify({
      type: "gameEnded",
      name: playerName,
    }));
  };

  //get values for "you got __ out of __ correct" description
  const code = useStudentStore(state => state.roomCode);
  
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        const getReview = async () => {
          //get decks from backend
          try {
            const response = await fetch(`${Config.BE_HOST}/review/${code}/${playerName}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });
    
            const data = await response.json();
    
            if (!response.ok) {
              alert("Unable to get review. Please try again.");
              return;
            }

            let correct = 0;
            let incorrect = 0;
    
            data.forEach((deck: any) => {
              if (deck.fld_correctness === true) correct++;
              if (deck.fld_correctness === false) incorrect++;
            });
    
            // update state
            setCorrectCount(correct);
            setIncorrectCount(incorrect);
            setTotalCount(correct+incorrect);
          }
          catch(error) {
            console.log("Error during fetch:", error);
            alert("Server error, please try again later.");
          }
        }
    
        getReview();
    }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Tappt</Text>
        <Text style={styles.username}>{playerName}</Text>
      </View>
      <Text style={styles.title}>Great game!</Text>
      <Text style={styles.description}>
        You earned <Text style={styles.boldText}>{clickCount}</Text> points and
      </Text>
      <Text style={styles.description}>
        answered <Text style={styles.boldText}>{correctCount}</Text> out of <Text style={styles.boldText}>{totalCount}</Text> questions correctly.
      </Text>
      <View style={styles.buttonContainer}>
        <Pressable onPress={reviewPress} style={styles.buttonBlue}>
          <Text style={styles.buttonText}>See what I missed</Text>
        </Pressable>
        <Pressable onPress={handlePress} style={styles.buttonPink}>
          <Text style={styles.buttonText}>Join a new game</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#14665c",
    padding: 20,
  },
  header: {
    position: "absolute",
    top: 10,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logo: {
    color: "white",
    fontSize: 40,
  },
  username: {
    color: "white",
    fontSize: 40,
  },
  title: {
    fontSize: 60,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  description: {
    fontSize: 30,
    color: "#80ffaa",
    textAlign: "center",
  },
  boldText: {
    fontWeight: "bold",
    color: "#f8a43c",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 30,
  },
  buttonBlue: {
    backgroundColor: "#5084ec",
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  buttonPink: {
    backgroundColor: "#ff5c64",
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 35,
    fontWeight: "bold",
  },
});

export default GameSummaryScreen;
