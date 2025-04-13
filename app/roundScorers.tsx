import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { useStudentStore } from './useWebSocketStore';
import { WebSocketService } from './webSocketService';

const roundScorersScreen = () => {
  const handlePress = () => {
    const pastQuestionNum = useStudentStore.getState().currQuestionNum;
    const newQuestionNum = pastQuestionNum + 1;
    useStudentStore.setState({ currQuestionNum: newQuestionNum });
    useStudentStore.setState({ currentTime: 30 });
    //useStudentStore.setState({ isTimeUp: false });
    useStudentStore.setState({ allStudentsAnswered: false });
    useStudentStore.setState({ nextQuestion: true });
    WebSocketService.sendMessage(JSON.stringify({ type: "sendToNextQuestion" }));
    router.replace('/reading');
  }

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
          <Text style={styles.headerText}>Game Leaders</Text>
        </View>
      </View>

      <View
        style={[
          styles.scoreRow,
          styles.firstPlaceRow,
          
        ]}
      >
        <Text style={styles.scoreText}>1  pink Goose</Text>
        <Text style={styles.scoreText}>412 clicks</Text>
      </View>

      <View
        style={[
          styles.scoreRow,
          styles.secondPlaceRow,
        ]}
      >
        <Text style={styles.scoreText}>2  old llama</Text>
        <Text style={styles.scoreText}>407 clicks</Text>
      </View>

      <View
        style={[
          styles.scoreRow,
          styles.thirdPlaceRow,
         
        ]}
      >
        <Text style={styles.scoreText}>3  silly elephant</Text>
        <Text style={styles.scoreText}>398 clicks</Text>
      </View>

      <View
        style={[
          styles.scoreRow,
          styles.fourthPlaceRow,
        ]}
      >
        <Text style={styles.scoreText}>4  loud panda</Text>
        <Text style={styles.scoreText}>366 clicks</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button]} onPress={handlePress}>
          <Text style={[styles.buttonText]}>
            Continue →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default roundScorersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#379AE6FF', 
    padding: 20,
    paddingTop: 10,
    alignItems: 'center',
    height: "100%",
    width: "100%",
    overflow: 'scroll',
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
    backgroundColor: '#E8618CFF' 
  },
  secondPlaceRow: {
    backgroundColor: '#EFB034FF' 
  },
  thirdPlaceRow: {
    backgroundColor: '#7F55E0FF' 
  },
  fourthPlaceRow: {
    backgroundColor: '#EA916EFF'
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: 'bold',


  },
  buttonsContainer: {
    marginTop: 30,
    right: -440
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    backgroundColor: '#147567FF' 
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
});

