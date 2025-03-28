import { Text, View, StyleSheet } from "react-native";
import { Link } from 'expo-router';
import 'react-native-reanimated';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the home screen</Text>
      <Link href={"/login"} style={styles.button}>
        Go to login screen
      </Link>
      <Link href={"/slogin"} style={styles.button}>
        Go to student login screen
      </Link>
      <Link href={"/createdecks"} style={styles.button}>
        Go to create decks screen
      </Link>
      <Link href={"/view-decks"} style={styles.button}>
        Go to view decks screen 
      </Link>
      <Link href={"/correct"} style={styles.button}>
        Go to Correct screen 
      </Link>
      <Link href={"/incorrect"} style={styles.button}>
        Go to Incorrect screen 
      </Link>
      <Link href={"/answerchoices"} style={styles.button}>
        Go to answer choices screen
      </Link>
      <Link href={"/studentClicks"} style={styles.button}>
        Go to student click count screen 
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FC6A03",
  },
  text: {
    color: '#fff'
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});

