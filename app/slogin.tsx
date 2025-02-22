import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard } from "react-native";
import { Link } from "expo-router"; 

export default function GamePinScreen() { // Function used to get pin from User
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleEnter = () => {
    if (pin.trim().length !== 6) {  // Require a 6-digit PIN
      setError(true);
      setPin(""); // Clear input on error
    } else {
      setError(false);
      console.log("Entered PIN:", pin);
      Keyboard.dismiss(); // ignored keyboard input after sending pin to console
      // Navigate or send the PIN to API
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Tappt</Text>

      {/* PIN Input & Enter Button Row */}
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder="Game PIN"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          maxLength={6} // Limit PIN length
          value={pin}
          onChangeText={setPin}
          onSubmitEditing={handleEnter} // Press "Enter" on keyboard
        />
        <TouchableOpacity 
          style={[styles.button, pin.trim().length !== 6 && styles.buttonDisabled]} 
          onPress={handleEnter}
          disabled={pin.trim().length !== 6} // Disable button if input isn't proper legnth
        >
          <Text style={styles.buttonText}>Enter</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>PIN must be 6 digits</Text>}

      {/* Teacher Login Link at Bottom */}
      <Link href="/login" style={styles.teacherText}>
        Are you a teacher? Log in here!
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3166c7",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: { // Will likely change to an image instead of text after our logo is solidified
    fontSize: 70,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 40,
  },
  inputRow: {
    flexDirection: "row", 
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: 200,
    padding: 18,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 25,
    textAlign: "center",
    marginRight: 10,
  },
  inputError: { // Used to show when a PIN is incorrect or not found, will bring back at a later time when that function is implemented
    borderColor: "red",
    borderWidth: 2,
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 20,
    paddingHorizontal: 27,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: "#444",
  },
  buttonText: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "bold",
  },
  teacherText: {
    position: "absolute",
    bottom: 30, 
    color: "#fff",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});