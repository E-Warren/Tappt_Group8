import React, { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, Animated, StyleSheet, Dimensions } from "react-native";
import { Link } from "expo-router";

const { height, width } = Dimensions.get("window");
const NUM_COLUMNS = 4; // Fixed number of columns
const PLAYER_BOX_WIDTH = width / NUM_COLUMNS - 10; // Ensure fixed-size columns
const PLAYER_CAP = 100; // Maximum number of players allowed


export default function WaitingRoom() {
  const [players, setPlayers] = useState([
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
  ]);
  const [lastAddedId, setLastAddedId] = useState(null);

  useEffect(() => { //This currently adds a name player ever 2 seconds, but will be changed to add a player when a user joins the room
    if (players.length >= PLAYER_CAP) return; // Stop adding when cap is reached, this space can be used to continuously check for new users until the cap is reached

    const interval = setInterval(() => {
      setPlayers((prevPlayers) => {
        if (prevPlayers.length >= PLAYER_CAP) {
          clearInterval(interval);
          return prevPlayers;
        }

        const lastPlayerId = prevPlayers.length > 0 ? prevPlayers[prevPlayers.length - 1].id : 0;
        const newPlayer = {
          id: lastPlayerId + 1,
          name: `Player ${prevPlayers.length + 1}`,
        };

        setLastAddedId(newPlayer.id); 
        return [...prevPlayers, newPlayer];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [players.length]);

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <Link href="/view-decks" style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Link>

      {/* Room Code Box */}
      <View style={styles.roomCodeBox}>
        <Text style={styles.roomCode}>123456</Text>
        <Text style={styles.joinText}>Join with Game PIN!</Text>
      </View>

      {/* Players List */}
      <FlatList
        data={players}
        keyExtractor={(item) => item.id.toString()}
        numColumns={NUM_COLUMNS}
        renderItem={({ item }) => (
          <AnimatedPlayer key={item.id} name={item.name} isNew={item.id === lastAddedId} />
        )}
        contentContainerStyle={styles.playersContainer}
        style={styles.playersList}
      />

      {/* "Let's Go!" Button */}
      <Link href="/" style={styles.startButton}>
        <Text style={styles.startButtonText}>Let's Go!</Text>
      </Link>
    </View>
  );
}

// ✅ **Only Animate the Last Added Player**
const AnimatedPlayer = ({ name, isNew }) => {
  const scaleAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;

  useEffect(() => {
    if (isNew) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.3, duration: 300, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [isNew]);

  return (
    <Animated.View style={[styles.playerBox, { transform: [{ scale: scaleAnim }] }]}>
      <Text style={styles.playerName}>{name}</Text>
    </Animated.View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#42A5F5",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 20,
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: {
    fontSize: 20,
    color: "#FFF",

  },
  roomCodeBox: {
    backgroundColor: "#1111CC",
    width: "100%",
    height: height / 3,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    zIndex: 10,
  },
  roomCode: {
    fontSize: 140,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  joinText: {
    fontSize: 30,
    color: "#FFFFFF",
    marginTop: 10,
    textAlign: "center",
  },
  playersList: {
    marginTop: height / 3,
    width: "100%",
  },
  playersContainer: {
    paddingBottom: 100,
  },
  playerBox: {
    width: PLAYER_BOX_WIDTH,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    margin: 3,
    backgroundColor: "#42A5F5",
    borderWidth: 1,
    borderColor: "#42A5F5",
  },
  playerName: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  startButton: {
    backgroundColor: "#28A745",
    paddingVertical: 15,
    paddingHorizontal: 50,
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  startButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
});
