import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export const navigationOptions = {
  headerShown: false,
};

const PlayScreen = () => {
  return (
    <View style={styles.container}>
      {/* Top-left branding */}
      <Text style={styles.header}> ◇ Tappt</Text>

      {/* Main title */}
      <Text style={styles.title}> How would you like to play? </Text>

      {/* Button row */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.buttonText}>Student</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.hostButton}>
          <Text style={styles.buttonText}>Teacher</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5a60ea", // purple-blue background
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    color: "white",
    fontWeight: "500",
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 50,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  createButton: {
    flex: 1,
    backgroundColor: "#f06292",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 120,
    marginRight: 15,
  },
  hostButton: {
    flex: 1,
    backgroundColor: "#f4a623", 
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 120,
    marginLeft: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
  },
});

export default PlayScreen;
