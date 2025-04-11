import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { useStudentStore } from './useWebSocketStore';
import { WebSocketService } from './webSocketService';

const ResultsScreen = ({
  data = [5, 2, 7, 4], // In order of up, left, down, right
  blackedOut = [true, true, true, false],
  correctAnswerCount = 7,
  totalPlayers = 17,
}) => {
  const currentNumber = useStudentStore((state) => state.currQuestionNum);
  const totalNumQuestions = useStudentStore((state) => state.totalQuestions);
  const diamondData = ['2001', '1773', '1492', '1912'];
  const diamondColors = [
    { original: styles.diamondPurple, grey: styles.diamondPurpleGrey },
    { original: styles.diamondOrange, grey: styles.diamondOrangeGrey },
    { original: styles.diamondBlue, grey: styles.diamondBlueGrey },
    { original: styles.diamondPink, grey: styles.diamondPinkGrey },
  ];
  const animatedValues = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = data.map((val, i) =>
      Animated.timing(animatedValues[i], {
        toValue: val,
        duration: 800,
        useNativeDriver: false,
      })
    );
    Animated.parallel(animations).start();
  }, [data, animatedValues]);

  const maxVal = Math.max(...data, 1);
  const barHeights = animatedValues.map(animVal =>
    animVal.interpolate({
      inputRange: [0, maxVal],
      outputRange: [0, 240],
      extrapolate: 'clamp',
    })
  );

  useEffect(() => {
    //useStudentStore.setState({ currentTime: 30 });
  }, [])

  const handlePress = () => {
    console.log("Current question is: ", currentNumber, " total questions is: ", totalNumQuestions);
     if ((currentNumber + 1) !== totalNumQuestions){
       router.replace('/roundScorers');
     } else {

      WebSocketService.sendMessage(
        JSON.stringify({
          type: "sendToNextQuestion",
        })
      )
      WebSocketService.sendMessage(
        JSON.stringify({
          type: "gameEnded",
        })
      )

       router.replace('/finalscorers');
       useStudentStore.setState({ gameEnded: false });
     }
   }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Tappt</Text>
        <Text style={styles.headerText}>{totalPlayers} players</Text>
      </View>
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
                            ? '#7E51F3'
                            : index === 1
                            ? '#F28C28'
                            : index === 2
                            ? '#FB6FB6'
                            : '#30C6F0',
                        height: barHeights[index],
                      },
                    ]}
                  />
                </View>
              ))}
            </View>
          </View>
          <Text style={styles.resultText}>
            {correctAnswerCount} people chose the correct answer. Woohoo!
          </Text>
        </View>
        <View style={styles.diamondContainer}>
          <Diamond
            data={diamondData[0]}
            blackedOut={blackedOut[0]}
            containerStyle={[styles.diamondPosition, styles.topDiamond]}
            diamondColorStyle={diamondColors[0]}
          />
          <Diamond
            data={diamondData[1]}
            blackedOut={blackedOut[1]}
            containerStyle={[styles.diamondPosition, styles.leftDiamond]}
            diamondColorStyle={diamondColors[1]}
          />
          <Diamond
            data={diamondData[2]}
            blackedOut={blackedOut[2]}
            containerStyle={[styles.diamondPosition, styles.rightDiamond]}
            diamondColorStyle={diamondColors[2]}
          />
          <Diamond
            data={diamondData[3]}
            blackedOut={blackedOut[3]}
            containerStyle={[styles.diamondPosition, styles.bottomDiamond]}
            diamondColorStyle={diamondColors[3]}
          />
        </View>
      </View>
      <Pressable onPress={handlePress} style={styles.continueButton}>
          <Text style={styles.continueText}>Continue →</Text>
      </Pressable>
    </View>
  );
};

const Diamond = ({
  data,
  blackedOut,
  containerStyle,
  diamondColorStyle,
}: {
  data: string;
  blackedOut: boolean;
  containerStyle: any;
  diamondColorStyle: { original: any; grey: any };
}) => {
  const effectiveStyle = blackedOut ? diamondColorStyle.grey : diamondColorStyle.original;
  return (
    <View style={containerStyle}>
      <View style={[styles.diamondBase, effectiveStyle]}>
        <Text style={styles.diamondText}>{data}</Text>
      </View>
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
    top: '2%',
    left: '4%',
    right: '4%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    color: '#fff',
    fontSize: 40,
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
  topDiamond: {
    top: '10%',
    left: '35%',
  },
  leftDiamond: {
    top: '35%',
    left: '10%',
  },
  rightDiamond: {
    top: '35%',
    right: '10%',
  },
  bottomDiamond: {
    bottom: '10%',
    left: '35%',
  },
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
  diamondPurple: {
    backgroundColor: '#7E51F3',
  },
  diamondOrange: {
    backgroundColor: '#F28C28',
  },
  diamondBlue: {
    backgroundColor: '#30C6F0',
  },
  diamondPink: {
    backgroundColor: '#FB6FB6',
  },
  diamondPurpleGrey: {
    backgroundColor: '#717171',
  },
  diamondOrangeGrey: {
    backgroundColor: '#9F9F9F',
  },
  diamondBlueGrey: {
    backgroundColor: '#9E9E9E',
  },
  diamondPinkGrey: {
    backgroundColor: '#A1A1A1',
  },
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
