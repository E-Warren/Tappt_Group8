import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import { useStudentStore } from "./useWebSocketStore";
import { WebSocketService } from "./webSocketService";
import AsyncStorage from '@react-native-async-storage/async-storage';


const roundScorersScreen = () => {
const students = useStudentStore(state => state.students)
//load leaderboard
const [topStudents, setTopStudents] = useState<{name:string, clickCount:number}[]>([]);

useEffect(() => {
  const getLeaderboard = async () => {
    try {
      const value = await AsyncStorage.getItem('topStudents');
      if (value !== null) {
        setTopStudents(JSON.parse(value));
      }
    } catch (e) {
      console.error("Failed to load leaderboard", e);
    }
  };

  getLeaderboard();
}, []);

  const handlePress = () => {
    const pastQuestionNum = useStudentStore.getState().currQuestionNum;
    const newQuestionNum = pastQuestionNum + 1;
    useStudentStore.setState({ currQuestionNum: newQuestionNum }); //update the current question num (teacher end)
    //send message to students to move to the next question
    WebSocketService.sendMessage(
      JSON.stringify({ type: "sendToNextQuestion" })
    );
    router.replace("/reading");
  };

  //player count for header
  const players = useStudentStore((state) => state.students);
  const totalPlayers = players.length;

  //function called for front end formatting for top 4 students
  const ScoreRow = ({ label, clicks, color }) => {
    return (
      <View style={[styles.scoreRow, {backgroundColor: color}]}>
        <Text style={styles.scoreText}>{label}</Text>
        <Text style={styles.scoreText}>{clicks}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.logo}>Tappt</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.playerCountText}>{totalPlayers} players</Text>
          </View>
        </View>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerText}>Game Leaders</Text>
        </View>
      </View>

      <View style={{width: '70%', gap: 10}}>
        {topStudents[0] && (<ScoreRow label={`1 ${topStudents[0].name}`} clicks={`${topStudents[0].clickCount} clicks`} color={"#E8618CFF"}/>)}
        {topStudents[1] && (<ScoreRow label={`2 ${topStudents[1].name}`} clicks={`${topStudents[1].clickCount} clicks`} color={"#EFB034FF"}/>)}
        {topStudents[2] && (<ScoreRow label={`3 ${topStudents[2].name}`} clicks={`${topStudents[2].clickCount} clicks`} color={"#7F55E0FF"}/>)}
        {topStudents[3] && (<ScoreRow label={`4 ${topStudents[3].name}`} clicks={`${topStudents[3].clickCount} clicks`} color={"#EA916EFF"}/>)}
        {topStudents.length === 0 && (<Text style={styles.noPlayersText}>No players on leaderboard.</Text>)}

        <TouchableOpacity style={[styles.button]} onPress={handlePress}>
          <Text style={[styles.buttonText]}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default roundScorersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#379AE6FF",
    padding: 20,
    paddingTop: 10,
    alignItems: "center",
    height: "100%",
    width: "100%",
    overflow: "scroll",
  },
  headerContainer: {
    width: "100%",
    //marginBottom: 40
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  logo: {
    fontSize: 40,
    color: "#FFFFFF",
  },
  playerCountText: {
    fontSize: 40,
    color: "#FFFFFF",
  },
  headerTitleContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  headerText: {
    fontSize: 70,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  noPlayersText: {
    marginTop: 50,
    marginBottom: 50,
    fontSize: 40,
    fontWeight: "normal",
    color: "#FFFFFF",
  },
  scoreRow: {
    justifyContent: "space-between",
    flexDirection: "row",
    paddingVertical: 25,
    paddingHorizontal: 100,
    borderRadius: 10,
  },

  firstPlaceRow: {
    backgroundColor: "#E8618CFF",
  },
  secondPlaceRow: {
    backgroundColor: "#EFB034FF",
  },
  thirdPlaceRow: {
    backgroundColor: "#7F55E0FF",
  },
  fourthPlaceRow: {
    backgroundColor: "#EA916EFF",
  },
  scoreText: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "bold",
  },
  buttonsContainer: {
    flex: 1,
    marginTop: 30,
  },
  button: {
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: "#147567FF",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
