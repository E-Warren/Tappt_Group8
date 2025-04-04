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
        console.log("Is clickable!");
        const handleClick = () => {
          clickIncrement(1);
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
          clickIncrement(1);
        }
      };

      document.addEventListener('keyup', handleSpace);
      
      return () => {
        document.removeEventListener('keyup', handleSpace);
      };
  }
  }, [isClickable, clickIncrement, clickCount]);


  const onNextPress = () => {
    console.log("Next pressed");
    setIsClickable(false);
    router.push("/");
  };

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
        {/* TODO: Hardcoded a click count here - add updated count to variables up top */}
            {clickCount}
        </Text>
      </View>

      {/* temporary: Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={onNextPress}>
        <Text style={styles.nextButtonText}>Next →</Text>
      </TouchableOpacity>

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
    fontSize: 25,
    fontWeight: "300",
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 50,
    paddingTop: 30,
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
