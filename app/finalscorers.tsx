import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useStudentStore } from "./useWebSocketStore";
import { WebSocketService } from "./webSocketService";

const TopScorersScreen = () => {

  const firstPlaceAnim = useRef(new Animated.Value(0)).current;
  const secondPlaceAnim = useRef(new Animated.Value(0)).current;
  const thirdPlaceAnim = useRef(new Animated.Value(0)).current;

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
  }, []);

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
          <View style={styles.headerRight}>
            <Text style={styles.playerCountText}>17 players</Text>
          </View>
        </View>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerText}>Top Scorers</Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.scoreRow,
          styles.firstPlaceRow,
          getAnimatedStyle(firstPlaceAnim)
        ]}
      >
        <Text style={styles.scoreText}>1  Pink Goose</Text>
        <Text style={styles.scoreText}>4,983 clicks</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.scoreRow,
          styles.secondPlaceRow,
          getAnimatedStyle(secondPlaceAnim)
        ]}
      >
        <Text style={styles.scoreText}>2  Silly Elephant</Text>
        <Text style={styles.scoreText}>4,642 clicks</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.scoreRow,
          styles.thirdPlaceRow,
          getAnimatedStyle(thirdPlaceAnim)
        ]}
      >
        <Text style={styles.scoreText}>3  Loud Panda</Text>
        <Text style={styles.scoreText}>4,001 clicks</Text>
      </Animated.View>

      <View style={styles.buttonsContainer}>
        <Link href="/" style={styles.link}>
          <TouchableOpacity style={[styles.button, styles.missedButton]}>
            <Text style={[styles.buttonText, styles.missedButtonText]}>
              Most missed questions
            </Text>
          </TouchableOpacity>
        </Link>
        <Link href="/" style={styles.link}>
          <TouchableOpacity style={[styles.button, styles.allScoresButton]}>
            <Text style={[styles.buttonText, styles.allScoresButtonText]}>
              See all scores
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
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

