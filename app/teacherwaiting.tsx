import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity
} from "react-native";
import { Link } from "expo-router";
import { useStudentStore } from "./useWebSocketStore";
import { WebSocketService } from "./webSocketService";

const { height, width } = Dimensions.get("window");
const NUM_COLUMNS = 4; // Fixed number of columns
const PLAYER_BOX_WIDTH = width / NUM_COLUMNS - 10; // Ensure fixed-size columns
const PLAYER_CAP = 100; // Maximum number of players allowed

export default function WaitingRoom() {

  const [lastAddedId, setLastAddedId] = useState<number | null>(null);
  const setUserType = useStudentStore((state) => state.setUserType);
  const RoomCode = useStudentStore((state) => state.roomCode);
  const players = useStudentStore((state) => state.students);

  console.log("The players are: ", players);

  useEffect(() => {
    setUserType("teacher");
  }, []);

  const onPressStartGame = async () => {
    //set a state that the start has started to backend
    //TODO: CHANGE TO appropriate click screen
    WebSocketService.sendMessage(JSON.stringify({ type: "gameStarted" }));
  };

  // useEffect(() => {
  //   This currently adds a name player ever 2 seconds, but will be changed to add a player when a user joins the room
  //   if (players.length >= PLAYER_CAP) return; // Stop adding when cap is reached, this space can be used to continuously check for new users until the cap is reached
  //   const interval = setInterval(() => {
  //     setPlayers((prevPlayers) => {
  //       if (prevPlayers.length >= PLAYER_CAP) {
  //         clearInterval(interval);
  //         return prevPlayers;
  //       }
  //       const lastPlayerId = prevPlayers.length > 0 ? prevPlayers[prevPlayers.length - 1].id : 0;
  //       const newPlayer = {
  //         id: lastPlayerId + 1,
  //         name: `Player ${prevPlayers.length + 1}`,
  //       };
  //       setLastAddedId(newPlayer.id);
  //       return [...prevPlayers, newPlayer];
  //     });
  //   }, 2000);
  //   return () => clearInterval(interval);
  // }, [players]); //[players.length]);

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <Link href="/view-decks" style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Link>

      {/* Room Code Box */}
      <View style={styles.roomCodeBox}>
        {/* <Text style={styles.roomCode}>123456</Text> */}
        <Text style={styles.roomCode}>{RoomCode}</Text>
        <Text style={styles.joinText}>Join with Game PIN!</Text>
      </View>

      {/* Players List */}
      <FlatList
        data={players}
        // keyExtractor={(item) => item.id.toString()}
        numColumns={NUM_COLUMNS}
        renderItem={({ item }) => (
          // <AnimatedPlayer
          //   key={item}
          //   name={item}
          //   isNew={item === lastAddedId}
          // />
          <Text style={styles.playerNameText}>
            {item}
          </Text>
        )}
        contentContainerStyle={styles.playersContainer}
        style={styles.playersList}
        columnWrapperStyle={styles.columnStyle}
      />

      {/* "Let's Go!" Button */}
      <Link href="/reading" style={styles.startButton}>
        <TouchableOpacity
          onPress={() => onPressStartGame()}
          >
          <Text style={styles.startButtonText}>Let's Go!</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

// ✅ **Only Animate the Last Added Player**
const AnimatedPlayer = ({ name, isNew }: { name: string; isNew: boolean }) => {
  const scaleAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;

  useEffect(() => {
    if (isNew) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isNew]);

  return (
    <Animated.View
      style={[styles.playerBox, { transform: [{ scale: scaleAnim }] }]}
    >
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
    alignItems: "center",
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

  playerNameText: {
    color: "#fff",
    fontSize: 50,
    fontWeight: 400,
  },

  columnStyle: {
    justifyContent: "space-between",
    gap: 100,
  }
});