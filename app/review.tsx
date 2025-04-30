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
import * as Speech from 'expo-speech';

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

        //sort correct & incorrect data in ascending order (if it exists)
        if (insertCorrectDecks.length > 0) {
          insertCorrectDecks.sort((a,b) => a.questionNumber - b.questionNumber);
        }
        if (insertIncorrectDecks.length > 0) {
          insertIncorrectDecks.sort((a,b) => a.questionNumber - b.questionNumber);
        }

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
  
  //TTS
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState<'correct' | 'incorrect' | 'review-complete' | 'done'>('correct');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  useEffect(() => {
    const speak = (text: string, callback?: () => void) => {
      Speech.stop();
      setIsSpeaking(true);
      Speech.speak(text, {
        onDone: () => {
          setIsSpeaking(false);
          if (callback) callback();
        },
      });
    };
  
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'f') return;
  
      Speech.stop();
      setIsSpeaking(false);
  
      const totalQuestions = correctDeck.length + incorrectDeck.length;
      let nextIndex = currentIndex;
  
      if (currentSection === 'done') {
        setCurrentSection('correct');
        setCurrentIndex(0);
        return;
      }
  
      if (currentSection === 'correct') {
        if (nextIndex === 0) {
          speak(`You got ${correctDeck.length} out of ${totalQuestions} correct.`);
          setCurrentIndex(1);
          return;
        }
  
        if (nextIndex === 1) {
          speak("Correct answers.");
          if (correctDeck.length === 0) {
            setCurrentIndex(2); 
          } else {
            setCurrentIndex(100); 
          }
          return;
        }
  
        if (nextIndex === 2 && correctDeck.length === 0) {
          speak("There is no correct answer.");
          setCurrentSection("incorrect");
          setCurrentIndex(0);
          return;
        }
  
        const deckIndex = nextIndex - 100;
        if (deckIndex < correctDeck.length) {
          const q = correctDeck[deckIndex];
          speak(`Question ${q.questionNumber}. ${q.question}. You answered ${q.userAnswer}. Correct answer is ${q.correctAnswer.join(', ')}.`);
          setCurrentIndex(prev => prev + 1);
          return;
        } else {
          setCurrentSection("incorrect");
          setCurrentIndex(0);
          return;
        }
      }
  
      if (currentSection === 'incorrect') {
        if (nextIndex === 0) {
          speak("Incorrect answers.");
          if (incorrectDeck.length === 0) {
            setCurrentIndex(1);
          } else {
            setCurrentIndex(100);
          }
          return;
        }
      
        if (nextIndex === 1 && incorrectDeck.length === 0) {
          speak("There is no incorrect answer.");
          setCurrentSection("review-complete");
          setCurrentIndex(0);
          return;
        }
      
        const deckIndex = nextIndex - 100;
        if (deckIndex < incorrectDeck.length) {
          const q = incorrectDeck[deckIndex];
          speak(`Question ${q.questionNumber}. ${q.question}. You answered ${q.userAnswer}. Correct answer is ${q.correctAnswer.join(', ')}.`);
          setCurrentIndex(prev => prev + 1);
          return;
        }
      
        if (deckIndex === incorrectDeck.length) {
          setCurrentSection("review-complete");
          setCurrentIndex(0);
          return;
        }
      }
  
      if (currentSection === 'review-complete') {
        if (nextIndex === 0) {
          speak("Review complete.", () => {
            setCurrentSection("done");
            setCurrentIndex(0);
          });
        }
        return;
      }
    };
  
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [correctDeck, incorrectDeck, currentIndex, currentSection, isSpeaking]);
  
  useEffect(() => {
    return () => {
      Speech.stop();
    };
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2364AA',
    paddingHorizontal: 20,
    paddingVertical: 6
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