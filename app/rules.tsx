import { View, Text, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>◇ Tappt</Text>
      </View>

      {/* Main Card */}
      <View style={styles.card}>
        <Text style={styles.title}>How to play</Text>
        <View style={styles.blocksContainer}>
          {/* Green Block */}
          <View style={[styles.block, { backgroundColor: "#20c997" }]}>
            <View style={styles.headingContainer}>
              <Text style={styles.blockHeading}>LISTEN!</Text>
            </View>
            <Text style={styles.blockText}>
              1. Enter game pin to join classroom{"\n"}
              2. Wait for host to start the game{"\n"}
              3. Listen to the question as it is read aloud before answering
            </Text>
          </View>

          {/* Yellow Block */}
          <View style={[styles.block, { backgroundColor: "#f0ad4e" }]}>
            <View style={styles.headingContainer}>
              <Text style={styles.blockHeading}>CLICK!</Text>
            </View>
            <Text style={styles.blockText}>
              1. Earn points for clicks during the read aloud period{"\n"}
              2. Earn powerups for correct answers
            </Text>
          </View>

          {/* Blue Block */}
          <View style={[styles.block, { backgroundColor: "#3498db" }]}>
            <View style={styles.headingContainer}>
              <Text style={styles.blockHeading}>LEARN!</Text>
            </View>
            <Text style={styles.blockText}>
              1. Review incorrect answers after the game ends{"\n"}
              2. Retain information long term with repeated games
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e35b8b",
    alignItems: "center",
    paddingTop: 20, // less padding to maximize space
    paddingHorizontal: 10,
  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  topBarText: {
    fontSize: 24,
    color: "#fff",
  },
  card: {
    width: "98%", // << almost full width
    height: "90%", // << almost full height
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10, // a little padding
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 65, // slightly smaller title for balance
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
    textAlign: "center",
  },
  blocksContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly", // distribute space evenly
    alignItems: "stretch", // make blocks stretch vertically
    width: "100%",
    paddingHorizontal: 10,
  },
  block: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 10,
    overflow: "hidden",
    padding: 10,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headingContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  blockHeading: {
    fontSize: 60,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(255, 255, 255, 0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  blockText: {
    fontSize: 40, // cleaner readable size
    color: "#fff",
    textAlign: "center",
    lineHeight: 61,
  },
});
