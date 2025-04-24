import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Link, router } from "expo-router";
import { useStudentStore } from "./useWebSocketStore";
import { WebSocketService } from "./webSocketService";
import { Audio } from "expo-av";

const { height, width } = Dimensions.get("window");
const NUM_COLUMNS = 4; // Fixed number of columns
const PLAYER_BOX_WIDTH = width / NUM_COLUMNS * 1.05 

export default function WaitingRoom() {
  const players = useStudentStore((state) => state.students);
  const setUserType = useStudentStore((state) => state.setUserType);
  const RoomCode = useStudentStore((state) => state.roomCode);
  const gameStarted = useStudentStore((state) => state.startedGame);

  // Track the new student's identifier.
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  // Use a ref to compare previous players.
  const previousPlayersRef = useRef(players);

  const soundRef = useRef<Audio.Sound | null>(null);
  async function playSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sound/Guestlist.mp3"),
        { shouldPlay: true, isLooping: true }
      );
      soundRef.current = sound;
      console.log("Playing Sound");
      await sound.playAsync();
    } catch (error) {
      console.error("Error Playing sound:", error);
    }
  }
  async function stopSound() {
    if (soundRef.current) {
      console.log("Stopping sound");
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  }

  // Start sound on mount and clean up on unmount.
  useEffect(() => {
    const timer = setTimeout(() => {
      playSound();
    }, 500);
    return () => {
      clearTimeout(timer);
      stopSound();
    };
  }, []);

  useEffect(() => {
    setUserType("teacher");
  }, []);

  // Watch for changes in the players array.
  useEffect(() => {
    if (players.length > previousPlayersRef.current.length) {
      const newStudent = players[players.length - 1];
      setLastAddedId(newStudent.name);
      setTimeout(() => {
        setLastAddedId(null);
      }, 600);
    }
    previousPlayersRef.current = players;
  }, [players]);

  useEffect(() => {
    if (gameStarted) {
      console.log("routing to reading page...");
      stopSound();
      router.replace("/reading");
    }
  }, [gameStarted]);

  const onPressStartGame = async () => {
    // Inform backend that the game has started.
    WebSocketService.sendMessage(JSON.stringify({ type: "gameStarted" }));
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <Link
        href="/view-decks"
        style={styles.backButton}
        onPress={() => {
          stopSound();
        }}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </Link>

      {/* Room Code Box */}
      <View style={styles.roomCodeBox}>
        <Text style={styles.roomCode}>{RoomCode}</Text>
        <Text style={styles.joinText}>Join with Game PIN!</Text>
      </View>

      {/* Players List */}
      <FlatList
        data={players}
        // Use a unique and stable key (assuming each name is unique).
        keyExtractor={(item) => item.name}
        numColumns={NUM_COLUMNS}
        renderItem={({ item }) => {
          // Only the student that matches lastAddedId is marked as new.
          const isNew = item.name === lastAddedId;
          return <AnimatedPlayer name={item.name} isNew={isNew} />;
        }}
        contentContainerStyle={styles.playersContainer}
        style={styles.playersList}
        columnWrapperStyle={styles.columnStyle}
      />

      {/* "Let's Go!" Button */}
      <View style={styles.startButton}>
        <TouchableOpacity onPress={onPressStartGame}>
          <Text style={styles.startButtonText}>Let's Go!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// AnimatedPlayer Component
const AnimatedPlayer = ({ name, isNew }: { name: string; isNew: boolean }) => {
  const scaleAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isNew && !hasAnimated.current) {
      hasAnimated.current = true;
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
  }, [isNew, scaleAnim]);

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
    top: 22,
    left: 25,
    zIndex: 20,
    padding: 5,
    borderRadius: 5,
  },
  backButtonText: {
    fontSize: 25,
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
    margin: 1,
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
  columnStyle: {
    justifyContent: "space-between",
    gap: 0,
  },
});