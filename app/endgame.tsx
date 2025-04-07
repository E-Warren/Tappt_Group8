import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Link, router } from "expo-router";
import { useStudentStore } from "./useWebSocketStore";
import { WebSocketService } from "./webSocketService";
import { CommonActions } from "@react-navigation/native";

const GameSummaryScreen = () => {
  const handlePress = () => {
    useStudentStore.getState().resetGame();
    WebSocketService.sendMessage(JSON.stringify({
      type: "gameEnded"
    }));
    window.location.href = "/slogin";
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Tappt</Text>
        <Text style={styles.username}>pink goose</Text>
      </View>
      <Text style={styles.title}>Great game!</Text>
      <Text style={styles.description}>
        You earned <Text style={styles.boldText}>12,345</Text> points and
      </Text>
      <Text style={styles.description}>
        answered <Text style={styles.boldText}>12</Text> out of <Text style={styles.boldText}>13</Text> questions correctly.
      </Text>
      <View style={styles.buttonContainer}>
        <Link href="/" style={styles.buttonYellow}>
          <Text style={styles.buttonText}>See what I missed</Text>
        </Link>
        <Pressable onPress={handlePress} style={styles.buttonOrange}>
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
    backgroundColor: "#6C63FF",
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
    color: "#12ffb0",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 30,
  },
  buttonYellow: {
    backgroundColor: "#f4a261",
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  buttonOrange: {
    backgroundColor: "#e76f51",
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
