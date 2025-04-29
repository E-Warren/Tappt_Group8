import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useStudentStore } from "./useWebSocketStore";
import { WebSocketService } from "./webSocketService";
import { Audio } from 'expo-av';
//import tadaSound from '../assets/sound/tada-fanfare-a-6313.mp3';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TopScorersScreen = () => {

  const tadaSound = require('../assets/sound/tada-fanfare-a-6313.mp3');
  const firstPlaceAnim = useRef(new Animated.Value(0)).current;
  const secondPlaceAnim = useRef(new Animated.Value(0)).current;
  const thirdPlaceAnim = useRef(new Animated.Value(0)).current;
  const roomCode = useStudentStore(state => state.roomCode);

  //load leaderboard
  const [topStudents, setTopStudents] = useState<{name:string, clickCount:number}[]>([]);
  useEffect(() => {
    const getLeaderboard = async () => {
      try {
        const value = await AsyncStorage.getItem(`topStudents-${roomCode}`);
        if (value !== null) {
          setTopStudents(JSON.parse(value));
          await AsyncStorage.removeItem(`topStudents-${roomCode}`); // cleanup here
          console.log("DELETED LEADERBOARD AFTER USE --> LEADERBOARD: ", getLeaderboard());
        }
      } catch (e) {
        console.error("Failed to load leaderboard", e);
      }
    };
  
    getLeaderboard();
  }, []);

  // sound for the 1st place animation
  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(tadaSound);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  }

  useEffect(() => {
    Animated.sequence([
      Animated.timing(thirdPlaceAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.delay(1000),
      Animated.timing(secondPlaceAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.delay(1500),
      Animated.timing(firstPlaceAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.spring(firstPlaceAnim, {
        toValue: 2,
        friction: 2,
        tension: 150,
        useNativeDriver: true
      }),
      Animated.spring(firstPlaceAnim, {
        toValue: 1,
        friction: 20,
        tension: 150,
        useNativeDriver: true
      })
    ]).start();


    setTimeout(() => {
      if (topStudents.length > 0) {
        playSound();
      }
    }, 3300);


  }, [topStudents]);

  const getAnimatedStyle = (animValue: Animated.Value) => ({
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0] 
        })
      },
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1] 
        })
      }
    ]
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.logo}>Tappt</Text>
          </View>
          {/* {<View style={styles.headerRight}>
            <Text style={styles.playerCountText}>{totalPlayers} players</Text>
          </View>} */}
        </View>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerText}>Top Scorers</Text>
        </View>
      </View>

      {topStudents[0] && (<Animated.View
        style={[
          styles.scoreRow,
          styles.firstPlaceRow,
          getAnimatedStyle(firstPlaceAnim)
        ]}
      >
        <Text style={styles.scoreText}>1  {topStudents[0].name}</Text>
        <Text style={styles.scoreText}>{topStudents[0].clickCount} clicks</Text>
      </Animated.View>)}

      {topStudents[1] && (<Animated.View
        style={[
          styles.scoreRow,
          styles.secondPlaceRow,
          getAnimatedStyle(secondPlaceAnim)
        ]}
      >
        <Text style={styles.scoreText}>2  {topStudents[1].name}</Text>
        <Text style={styles.scoreText}>{topStudents[1].clickCount} clicks</Text>
      </Animated.View>)}

      {topStudents[2] && (<Animated.View
        style={[
          styles.scoreRow,
          styles.thirdPlaceRow,
          getAnimatedStyle(thirdPlaceAnim)
        ]}
      >
        <Text style={styles.scoreText}>3  {topStudents[2].name}</Text>
        <Text style={styles.scoreText}>{topStudents[2].clickCount} clicks</Text>
      </Animated.View>)}

      <View style={styles.buttonsContainer}>
        <Link href="/view-decks" style={styles.link}>
          <TouchableOpacity style={[styles.button, styles.missedButton]}>
            <Text style={[styles.buttonText, styles.missedButtonText]}>
              Back to my decks
            </Text>
          </TouchableOpacity>
        </Link>
        </View>
        {/*<Link href="/" style={styles.link}>
          <TouchableOpacity style={[styles.button, styles.allScoresButton]}>
            <Text style={[styles.buttonText, styles.allScoresButtonText]}>
              See all scores
            </Text>
          </TouchableOpacity>
        </Link>
      </View> {/*commented out until further notice - Alec*/}
    </View>
  );
};

export default TopScorersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F989A2', 
    padding: 20,
    paddingTop: 10,
    alignItems: 'center'
  },
  headerContainer: {
    width: '100%',
    marginBottom: 40
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start'
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end'
  },
  logo: {
    fontSize: 40,
    color: '#FFFFFF'
  },
  playerCountText: {
    fontSize: 40,
    color: '#FFFFFF'
  },
  headerTitleContainer: {
    marginTop: 50,
    alignItems: 'center'
  },
  headerText: {
    fontSize: 70,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  scoreRow: {
    width: '70%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 25,
    paddingHorizontal: 100,
    borderRadius: 10,
    marginVertical: 8
  },

  firstPlaceRow: {
    backgroundColor: '#4C9AFF' 
  },
  secondPlaceRow: {
    backgroundColor: '#FF5B61' 
  },
  thirdPlaceRow: {
    backgroundColor: '#CF9FFF' 
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: 'bold',


  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 30
  },
  link: {
    textDecorationLine: 'none'
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 10
  },
  
  missedButton: {
    backgroundColor: '#7267DB' 
  },
  allScoresButton: {
    backgroundColor: '#17C3B2' 
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  missedButtonText: {
    color: '#FFFFFF'
  },
  allScoresButtonText: {
    color: '#FFFFFF'
  }
});