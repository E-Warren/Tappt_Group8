import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface CorrectScreenProps {
  timer?: number;
  questionNumber?: number;
  totalQuestions?: number;
  onBonusSelect: (bonus: string) => void;
}

const CorrectScreen: React.FC<CorrectScreenProps> = ({ timer = 13, questionNumber = 1, totalQuestions = 3, onBonusSelect }) => {
  const [selectedBonus, setSelectedBonus] = useState<string | null>(null);

  const handleBonusSelect = (bonus: string) => {
    setSelectedBonus(bonus);
    // Was throwing an error when onBonusSelect was not a function, added check against until it is implemented
    if (typeof onBonusSelect === "function") {
      onBonusSelect(bonus);
    } else {
      console.error("onBonusSelect is not a function");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tappt</Text>
      <Text style={styles.username}>pink goose</Text>

      <View style={styles.checkmarkContainer}>
        <MaterialIcons name="check-circle" size={180} color="lightgreen" />
      </View>

      <Text style={styles.correctText}>That's right!</Text>

      {selectedBonus ? (
        <Text style={styles.bonusMessage}>
          {selectedBonus === "doublePoints"
            ? "You chose x2 points per click!"
            : "You froze all players next round!"}
        </Text>
      ) : (
        <>
          <Text style={styles.chooseBonus}>Choose your bonus:</Text>
          <TouchableOpacity style={styles.bonusButtonGreen} onPress={() => handleBonusSelect("doublePoints")}>
            <Text style={styles.bonusText}>x2 points per click</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bonusButtonPurple} onPress={() => handleBonusSelect("freezePlayers")}>
            <Text style={styles.bonusText}>Freeze all the players next round</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.timer}>{timer}</Text>
      <Text style={styles.questionCounter}>Question {questionNumber} / {totalQuestions}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4A63D",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    position: "absolute",
    top: 10,
    left: 15,
    fontSize: 40,
    color: "white",
  },
  username: {
    position: "absolute",
    top: 10,
    right: 15,
    fontSize: 40,
    color: "white",
  },
  checkmarkContainer: {
    backgroundColor: "white",
    borderRadius: 100,
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  correctText: {
    fontSize: 45,
    fontWeight: "bold",
    color: "white",
    marginTop: 10,
  },
  chooseBonus: {
    fontSize: 25,
    color: "white",
    marginVertical: 10,
  },
  bonusButtonGreen: {
    backgroundColor: "#2DD4BF",
    padding: 15,
    width: "80%",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 5,
  },
  bonusButtonPurple: {
    backgroundColor: "#7B5ED6",
    padding: 15,
    width: "80%",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 5,
  },
  bonusText: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
  },
  bonusMessage: {
    fontSize: 25,
    color: "white",
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  timer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    fontSize: 40,
    color: "white",
  },
  questionCounter: {
    position: "absolute",
    bottom: 20,
    right: 15,
    fontSize: 30,
    color: "white",
  },
});

export default CorrectScreen;
