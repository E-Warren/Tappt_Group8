import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect } from "react";
import { useStudentStore } from './useWebSocketStore'
import { router } from "expo-router"; 


export default function studentClicksScreen() {

  const studentName = useStudentStore(state => state.name);         //name
  const clickCount = useStudentStore(state => state.clickCount);    //int score
  const isClickable = useStudentStore(state => state.isClickable);  //bool to see if clickable
  const setIsClickable = useStudentStore(state => state.setIsClickable) //fxn to turn click listening on/off
  const clickIncrement = useStudentStore(state => state.incClickCount); //fxn for clickcount + inc value

  const pointsPer = useStudentStore(state => state.pointsPerClick);         //for multiplier bonus
  console.log("this student gets ", pointsPer, " points per click.");

  //for when reading is completed
  const completedReading = useStudentStore(state => state.completedReading);
  const setCompletedReading = useStudentStore(state => state.setCompletedReading);

  //testing
  const nextQuestion = useStudentStore(state => state.nextQuestion);
  //console.log("next question =", nextQuestion);

  useEffect(() => {
    //time out for a little bit to ignore routing "click"
    const timeout = setTimeout(() => {
      setIsClickable(true);
    }, 200);

    return () => clearTimeout(timeout);
  }, []);


    //listen for trackpad click
    useEffect(() => {

      if(isClickable){
        //console.log("Is clickable!");
        const handleClick = () => {
          clickIncrement(pointsPer);
        };

        document.addEventListener('click', handleClick);

        return () => {
          document.removeEventListener('click', handleClick);
        };
      }

    }, [isClickable, clickIncrement, clickCount]);


  //listen for spacebar
  useEffect(() => {

    if(isClickable){
      const handleSpace = (event: KeyboardEvent) => {
        if (event.code === "Space") {
          clickIncrement(pointsPer);
        }
      };

      document.addEventListener('keyup', handleSpace);
      
      return () => {
        document.removeEventListener('keyup', handleSpace);
      };
  }
  }, [isClickable, clickIncrement, clickCount]);


  useEffect(() => {
    if (completedReading) {
      console.log("clicking over... go to answerchoices");
      setCompletedReading(false);
      router.replace("/answerchoices");
    }

  }, [completedReading])


  return (

    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.text}>Tappt</Text>
        <Text style={styles.text}>{studentName}</Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.countText}>
            Click Count:
        </Text>
        <Text style={styles.clickText}> 
            {clickCount}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#379AE6FF',
    //justifyContent: 'center',
    //alignItems: 'center',
  },
  text: {
    color: "#fff",
    fontSize: 40,
    userSelect: 'none',
  },
  top: {
    position: "absolute",
    top: 10,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  center: {
    flexDirection: "column",
    gap: 10,
    alignItems: "center",
    marginTop: 300,

  },
  clickText: {
    color: "#fff",
    fontSize: 60,
    fontWeight: "400",
    userSelect: 'none',
  },
  countText: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "300",
    userSelect: 'none',
  },
  nextButton: {
    position: "absolute",
    bottom: 80,
    right: 15,
    backgroundColor: "#ffffff55",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  nextButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});
