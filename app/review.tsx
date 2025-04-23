import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useStudentStore } from "./useWebSocketStore";
import { WebSocketService } from "./webSocketService";
import Config from './config';

//interface setup for correct answers
interface correctAnswers {
  questionNumber: number,
  question: string,
  userAnswer: string,
  correctAnswer: string[],
  isCorrect: boolean,
}

//interface setup for incorrect answers
interface incorrectAnswers {
  questionNumber: number,
  question: string,
  userAnswer: string,
  correctAnswer: string[],
  isCorrect: boolean,
}

const ReviewScreen = () => {
  const [incorrectDeck, setIncorrectDecks] = useState<incorrectAnswers[]>([]);
  const [correctDeck, setCorrectDecks] = useState<correctAnswers[]>([]);
  const totalQuestions = correctDeck.length + incorrectDeck.length;
  const correctCount = correctDeck.length;
  const gameEnded = useStudentStore((state) => state.gameEnded);
  const playerName = useStudentStore((state) => state.name);
  const code = useStudentStore(state => state.roomCode);

  // getting the review materials (from database)
  useEffect(() => {
    const getReview = async () => {
      //get decks from backend
      try {
        const response = await fetch(`${Config.BE_HOST}/review/${code}/${playerName}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          alert("Unable to get review. Please try again.");
          return;
        }

        const correctData = data.filter((deck: any) => deck.fld_correctness === true);
        const incorrectData = data.filter((deck: any) => deck.fld_correctness === false);

        //set up correct/incorrect interfacess
        const insertCorrectDecks: correctAnswers[] = correctData.map((deck: any) => ({
          questionNumber: deck.fld_question_number + 1,
          question: deck.fld_question,
          userAnswer: deck.fld_student_ans,
          correctAnswer: deck.fld_correct_ans.split(',').map((ans: string) => ans.trim()),
          isCorrect: deck.fld_correctness,
        }));

        const insertIncorrectDecks: incorrectAnswers[] = incorrectData.map((deck: any) => ({
          questionNumber: deck.fld_question_number + 1,
          question: deck.fld_question,
          userAnswer: deck.fld_student_ans,
          correctAnswer: deck.fld_correct_ans.split(',').map((ans: string) => ans.trim()),
          isCorrect: deck.fld_correctness,
        }));

        setCorrectDecks(insertCorrectDecks);
        setIncorrectDecks(insertIncorrectDecks);
      }
      catch(error) {
        console.log("Error during fetch:", error);
        alert("Server error, please try again later.");
      }
    }

    getReview();
  }, []);

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
        {correctDeck.length > 0 ? (
          correctDeck.map((item, idx) => (
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
        {incorrectDeck.length > 0 ? (
          incorrectDeck.map((item, idx) => (
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
  correctAnswer: string[];
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
          <Text style={styles.answerValue}>{correctAnswer.join(', ')}</Text>
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
    position: "absolute",
    top: 10,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
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
    marginTop: 70,
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
