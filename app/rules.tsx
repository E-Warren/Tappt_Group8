import { View, Text, ScrollView, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      {/* Left Side - Rules */}
      <View style={styles.section}>
        <Text style={styles.title}>rules ⭐ </Text>
        <ScrollView>
          <Text style={styles.creatorName}>1. Enter game pin to join the classroom </Text>
          <Text style={styles.creatorName}>2. Wait for the host to start the game</Text>
          <Text style={styles.creatorName}>3. Read each question carefully before answering</Text>
          <Text style={styles.creatorName}>4. Earn power-ups for correct answers </Text>
          <Text style={styles.creatorName}>5. Have loads of fun!</Text>
        </ScrollView>
      </View>

      {/* Right Side - About the Creators */}
      <View style={styles.section}>
        <Text style={styles.title}>about the creators 😁 </Text>
        <ScrollView>
          <View style={styles.creatorBox}>
            <Text style={styles.creatorName}>Emily</Text>
            <Text style={styles.creatorDesc}>Scrum Master & Team Lead</Text>
          </View>
          <View style={styles.creatorBox}>
            <Text style={styles.creatorName}>Carlie</Text>
            <Text style={styles.creatorDesc}>Back-end Dev</Text>
          </View>
          <View style={styles.creatorBox}>
            <Text style={styles.creatorName}>Madison</Text>
            <Text style={styles.creatorDesc}>Fullstack</Text>
          </View>
          <View style={styles.creatorBox}>
            <Text style={styles.creatorName}>Sualeha</Text>
            <Text style={styles.creatorDesc}>Front-end Dev</Text>
          </View>
          <View style={styles.creatorBox}>
            <Text style={styles.creatorName}>Sulha</Text>
            <Text style={styles.creatorDesc}>API Integration</Text>
          </View>
          <View style={styles.creatorBox}>
            <Text style={styles.creatorName}>Alec</Text>
            <Text style={styles.creatorDesc}>Front-end Dev</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "blue",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  section: {
    flex: 1,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  item: {
    // This style is now unused but kept just in case
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
    lineHeight: 22,
  },
  creatorBox: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
  },
  creatorName: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10, // added for spacing between rule lines
  },
  creatorDesc: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
  },
});
