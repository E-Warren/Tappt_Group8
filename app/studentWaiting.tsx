import { Text, View, StyleSheet } from "react-native";
import { useStudentStore } from "./useWebSocketStore";
import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { WebSocketService } from "./webSocketService";

export default function Index() {
    const studentName = useStudentStore(state => state.name); //gets the student's name from zustand
    const setUserType = useStudentStore(state => state.setUserType); //will be used to set user type to student

    //to determine whether to be kicked out of the waiting room into the big, bad, tappt game >:)
    const gameStarted = useStudentStore(state => state.startedGame); 
    const isFocused = useIsFocused();
    const router = useRouter();

    //CHANGE LATER: add appriopriate routing to click page first instead of question diamond
    //if game started, go to question diamond
    useEffect(() => {
        console.log("entered routing; gamestarted =", gameStarted);
        if (gameStarted == true) {
            router.replace("/studentClicks");
            //router.replace("/answerchoices");
        }

    }, [gameStarted]);

    useEffect(() => {
        console.log("Back arrow in student waiting is mounted")
        const handleBackButton = (event: PopStateEvent) => {
            console.log("Going to remove the student from the game now")
            WebSocketService.sendMessage(JSON.stringify({
                type: "gameEnded",
                name: studentName
            }))
            router.dismissTo("/slogin")
        };
      
        window.addEventListener("popstate", handleBackButton);   
        return () => {
          setTimeout(() => {
            window.removeEventListener('popstate', handleBackButton);
          }, 0);
        };
      }, []); 

    return (
      <View style={styles.container}>

        {/* Displays the top section with tappt and the student name */}
        <View style={styles.top}>
            <Text style={styles.text}>Tappt</Text>
            <Text style={styles.text}>{studentName}</Text> 
        </View>

        {/* Displays the middle of the screen telling the user their name */}
        <View style={styles.middle}>
            <Text style={styles.middleInfoText}>
                your player name is
            </Text>

                <Text style={styles.middleNameText}>
                    {studentName}
                </Text>

            <Text style={styles.middleInfoText}>
                now we wait...
            </Text>
            
        </View>

      </View>
    );
  }

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#EA916EFF",
    },
    top: {
        position: "absolute",
        top: 10,
        left: 20,
        right: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    text: {
        color: "#fff",
        fontSize: 40,
    },
    middle: {
        flex: 1,
        flexDirection: "column",
        //paddingTop: 40,
        alignItems: "center",
        justifyContent: "space-evenly",
        marginTop: 150,
        marginBottom: 150,
    },
    middleInfoText: {
        color: '#fff',
        fontSize: 40,
        fontWeight: 300,
    },
    middleNameText: {
        color: "#fff",
        fontSize: 70,
        fontWeight: "500",
        justifyContent: "center",
        alignItems: "center",
    }
    
});