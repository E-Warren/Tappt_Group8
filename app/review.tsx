import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useStudentStore } from "./useWebSocketStore";
import { WebSocketService } from "./webSocketService";

// Dummy Data: 2 correct cards, 1 incorrect card, can be removed later
const dummyCorrectAnswers = [
  {
    questionNumber: 1,
    question: "What is the capital of France?",
    userAnswer: "Paris",
    correctAnswer: "Paris",
    isCorrect: true
  },
  {
    questionNumber: 3,
    question: "What does CPU stand for?",
    userAnswer: "Central Processing Unit",
    correctAnswer: "Central Processing Unit",
    isCorrect: true
  }
];

const dummyIncorrectAnswers = [
  {
    questionNumber: 5,
    question: "What type of figurative language compares things using 'like' or 'as'?",
    userAnswer: "Personification",
    correctAnswer: "Simile",
    isCorrect: false
  }
];

const ReviewScreen = ({
    // Dummy props for testing
  correctAnswers = dummyCorrectAnswers,
  incorrectAnswers = dummyIncorrectAnswers
}) => {
  const totalQuestions = correctAnswers.length + incorrectAnswers.length;
  const correctCount = correctAnswers.length;
  const gameEnded = useStudentStore((state) => state.gameEnded);
  const playerName = useStudentStore((state) => state.name);

  //to handle routing back to student login
  useEffect(() => {
    if (gameEnded) {
      router.replace("/slogin");
    }
  }, [gameEnded]);

  //will only say game ended if student chooses to join a new game
  const handlePress = () => {
    WebSocketService.sendMessage(JSON.stringify({
      type: "gameEnded",
      name: playerName,
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Text style={styles.logoText}>Tappt</Text>
        <Pressable onPress={handlePress} style={styles.newGameButton}>
          <Text style={styles.newGameButtonText}>Join a new game</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Let's review!</Text>
        <Text style={styles.subtitle}>
          You answered {correctCount} out of {totalQuestions} questions correctly
        </Text>


        <Text style={styles.sectionTitle}>Correct</Text>
        {correctAnswers.length > 0 ? (
          correctAnswers.map((item, idx) => (
            <AnswerCard
              key={`correct-${idx}`}
              questionNumber={item.questionNumber}
              question={item.question}
              userAnswer={item.userAnswer}
              correctAnswer={item.correctAnswer}
              isCorrect={item.isCorrect}
            />
          ))
        ) : (
          <Text style={styles.emptyMessage}>No correct answers...</Text>
        )}

        <Text style={styles.sectionTitle}>Incorrect</Text>
        {incorrectAnswers.length > 0 ? (
          incorrectAnswers.map((item, idx) => (
            <AnswerCard
              key={`incorrect-${idx}`}
              questionNumber={item.questionNumber}
              question={item.question}
              userAnswer={item.userAnswer}
              correctAnswer={item.correctAnswer}
              isCorrect={item.isCorrect}
            />
          ))
        ) : (
          <Text style={styles.emptyMessage}>No incorrect answers!</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

interface AnswerCardProps {
  questionNumber: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

const AnswerCard: React.FC<AnswerCardProps> = ({ questionNumber, question, userAnswer, correctAnswer, isCorrect }) => {
  return (
    <View style={[styles.card, isCorrect ? styles.correctCard : styles.incorrectCard]}>
      <Text style={styles.questionNumber}>Question {questionNumber}</Text>
      <Text style={styles.questionText}>{question}</Text>
      <View style={styles.answersContainer}>
        <View style={styles.answerBlock}>
          <Text style={styles.answerLabel}>You answered:</Text>
          <Text style={styles.answerValue}>{userAnswer}</Text>
        </View>
        <View style={styles.answerBlock}>
          <Text style={styles.answerLabel}>Correct answer:</Text>
          <Text style={styles.answerValue}>{correctAnswer}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  
  safeArea: {
    flex: 1,
    backgroundColor: '#2364AA' 
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2364AA',
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  logoText: {
    fontSize: 40,
    color: '#fff'
  },
  newGameButton: {
    backgroundColor: '#FFD54F',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6
  },
  newGameButtonText: {
    fontSize: 30,  
    color: '#333',
    fontWeight: '600'
  },

  title: {
    fontSize: 80,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
    color: '#FFF',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 40,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20
  },

  sectionTitle: {
    fontSize: 45,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    color: '#FFF'
  },
  emptyMessage: {
    fontSize: 25,
    color: '#FFF',
    fontStyle: 'italic',
    marginBottom: 8
  },

  card: {
    borderRadius: 8,
    paddingHorizontal: 36,
    paddingVertical: 26,
    marginBottom: 16
  },
  correctCard: {
    backgroundColor: '#8CE8DA'
  },
  incorrectCard: {
    backgroundColor: '#F9AD9A'
  },
  questionNumber: {
    fontSize: 30,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333'
  },
  questionText: {
    fontSize: 25,
    marginBottom: 12,
    color: '#333'
  },
  answersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  answerBlock: {
    flex: 0.48  
  },
  answerLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333'
  },
  answerValue: {
    fontSize: 24,
    color: '#333'
  }
});

export default ReviewScreen;
