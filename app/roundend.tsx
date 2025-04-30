import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { useStudentStore } from './useWebSocketStore';
import { WebSocketService } from './webSocketService';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ResultsScreen = () => {
  const cIndex = useStudentStore((state) => state.correctIndex);
  const deckID = useStudentStore((state) => state.deckID);
  const roomCode = useStudentStore((state) => state.roomCode);
  const isFocused = useIsFocused();
  const data = useStudentStore((state) => state.answerDist);
  const players = useStudentStore((state) => state.students);
  const totalPlayers = players.length;
  const currentNumber = useStudentStore((state) => state.currQuestionNum);
  const totalNumQuestions = useStudentStore((state) => state.totalQuestions);
  const diamondData = useStudentStore((state) => state.answerChoices);
  const displayCurrQuestion = useStudentStore((state) => state.displayQuestion)
  //const currentQuestion = useStudentStore((state) => state.currentQuestion);

  const [blackedOut, setBlackedOut] = useState<boolean[]>([]);
  const [animatedValues, setAnimatedValues] = useState<Animated.Value[]>([]);
  const numberCorrect = useRef(0);

  const diamondColors = [
    { original: styles.diamondPurple, grey: styles.diamondPurpleGrey },
    { original: styles.diamondOrange, grey: styles.diamondOrangeGrey },
    { original: styles.diamondBlue, grey: styles.diamondBlueGrey },
    { original: styles.diamondPink, grey: styles.diamondPinkGrey },
  ];

  // compute top 4 leaderboard
  const topStudents = useMemo(() => {
    return [...players]
      .sort((a, b) => (b.clickCount - a.clickCount) || a.name.localeCompare(b.name))
      .slice(0, 4);
  }, [players]);

  // save top 4 on every change
  useEffect(() => {
    const saveLeaderboard = async () => {
      try {
        await AsyncStorage.setItem(`topStudents-${roomCode}`, JSON.stringify(topStudents));
      } catch (e) {
        console.error('Failed to save leaderboard', e);
      }
    };
    saveLeaderboard();
  }, [topStudents, roomCode]);

  // request updated answer distribution when screen focuses
  useEffect(() => {
    console.log("The question that will be displayed is: ", displayCurrQuestion)
    if (isFocused){
      WebSocketService.sendMessage(JSON.stringify({
            type: "sendAnswerDist",
      }))
    }
  }, [isFocused]);

  // initialize blackedOut flags when data or correct index changes
  useEffect(() => {
    if (data.length > 0) {
      const flags = Array(4).fill(true);
      cIndex.forEach((i) => { flags[i] = false; });
      setBlackedOut(flags);
    }
  }, [data, cIndex]);

  // initialize animated values whenever data arrives
  useEffect(() => {
    if (data.length > 0) {
      setAnimatedValues(data.map(() => new Animated.Value(0)));
    }
  }, [data]);

  // run the bar animations
  useEffect(() => {
    if (animatedValues.length === data.length) {
      const animations = data.map((val, i) =>
        Animated.timing(animatedValues[i], {
          toValue: val,
          duration: 800,
          useNativeDriver: false,
        })
      );
      Animated.parallel(animations).start();
    }
  }, [animatedValues, data]);

  // compute numberCorrect total
  useEffect(() => {
    numberCorrect.current = 0;
    cIndex.forEach((i) => {
      numberCorrect.current += data[i] || 0;
    });
  }, [data, cIndex]);

  const maxVal = Math.max(...data, 1);
  const barHeights = animatedValues.map((av) =>
    av.interpolate({ inputRange: [0, maxVal], outputRange: [0, 240], extrapolate: 'clamp' })
  );

  const handlePress = () => {
    setAnimatedValues([]);
    if (currentNumber + 1 !== totalNumQuestions) {
      router.replace('/roundScorers');
    } else {
      WebSocketService.sendMessage(JSON.stringify({ type: 'sendToNextQuestion' }));
      WebSocketService.sendMessage(JSON.stringify({ type: 'gameEnded' }));
      router.replace('/finalscorers');
      useStudentStore.setState({ gameEnded: false });
    }
    numberCorrect.current = 0;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Tappt</Text>
        <Text style={styles.headerText}>{totalPlayers} players</Text>
      </View>

      {/* Question Banner */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {displayCurrQuestion}
        </Text>
      </View>

      {/* Chart & Diamonds */}
      <View style={styles.contentRow}>
        <View style={[styles.cardWrapper, { marginRight: '5%' }]}>
          <View style={styles.card}>
            <View style={styles.barChartContainer}>
              {data.map((value, index) => (
                <View key={`bar-${index}`} style={styles.barItem}>
                  <Text style={styles.barLabel}>{value}</Text>
                  <Animated.View
                    style={[
                      styles.bar,
                      {
                        backgroundColor:
                          index === 0
                            ? '#7340F2'
                            : index === 1
                            ? '#C62F2F'
                            : index === 2
                            ? '#105EDA'
                            : '#CD3280',
                        height: barHeights[index],
                      },
                    ]}
                  />
                </View>
              ))}
            </View>
          </View>
          <Text style={styles.resultText}>
            {numberCorrect.current} people chose the correct answer. Woohoo!
          </Text>
        </View>
        <View style={styles.diamondContainer}>
          {diamondData.map((d, i) => (
            <View key={`diamond-${i}`} style={[styles.diamondPosition, styles[`diamond${['Top','Left','Right','Bottom'][i]}`]]}>
              <View style={[styles.diamondBase, blackedOut[i] ? diamondColors[i].grey : diamondColors[i].original]}>
                <Text style={styles.diamondText}>{d}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Continue Button */}
      <Pressable onPress={handlePress} style={styles.continueButton}>
        <Text style={styles.continueText}>Continue →</Text>
      </Pressable>
    </View>
  );
};

export default ResultsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2EC4B6',
  },
  header: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    color: '#fff',
    fontSize: 40,
  },
  questionContainer: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 80,
    marginBottom: 20,
    paddingHorizontal: '5%',
  },
  questionText: {
    color: '#2D6F62',
    fontSize: 38,
    textAlign: 'center',
    fontWeight: '600',
  },
  contentRow: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    width: '40%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    height: 350,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '5%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    flex: 1,
  },
  barItem: {
    alignItems: 'center',
    width: '15%',
  },
  barLabel: {
    color: '#000',
    marginBottom: '2%',
    fontWeight: '600',
    fontSize: 34,
    textAlign: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  resultText: {
    color: '#2D6F62',
    fontSize: 40,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 20,
    width: '100%',
  },
  diamondContainer: {
    width: '40%',
    aspectRatio: 1,
    position: 'relative',
  },
  diamondPosition: {
    position: 'absolute',
    width: '30%',
    aspectRatio: 1,
  },
  diamondTop: { top: '10%', left: '35%' },
  diamondLeft: { top: '35%', left: '10%' },
  diamondRight: { top: '35%', right: '10%' },
  diamondBottom: { bottom: '10%', left: '35%' },
  diamondBase: {
    flex: 1,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  diamondText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 25,
    transform: [{ rotate: '-45deg' }],
  },
  diamondPurple: { backgroundColor: '#7340F2' },
  diamondOrange: { backgroundColor: '#C62F2F' },
  diamondBlue: { backgroundColor: '#105EDA' },
  diamondPink: { backgroundColor: '#CD3280' },
  diamondPurpleGrey: { backgroundColor: '#717171' },
  diamondOrangeGrey: { backgroundColor: '#9F9F9F' },
  diamondBlueGrey: { backgroundColor: '#9E9E9E' },
  diamondPinkGrey: { backgroundColor: '#A1A1A1' },
  continueButton: {
    position: 'absolute',
    right: '4%',
    bottom: '3%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: '2%',
    paddingVertical: '1.5%',
    elevation: 2,
  },
  continueText: {
    color: '#333',
    fontSize: 28,
    fontWeight: '700',
  },
});
