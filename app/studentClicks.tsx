import { Text, View, StyleSheet } from 'react-native';
import { useStudentStore } from './useWebSocketStore';

const studentName = useStudentStore(state => state.name);

export default function studentClicksScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.text}>Tappt</Text>
        <Text style={styles.text}>{studentName}</Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.countText}>
            Click Count:
        </Text>
        <Text style={styles.clickText}> 
        {/* TODO: Hardcoded a click count here - add updated count to variables up top */}
            352
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#379AE6FF',
    //justifyContent: 'center',
    //alignItems: 'center',
  },
  text: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "300",
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 50,
    paddingTop: 30,
  },
  center: {
    flexDirection: "column",
    gap: 10,
    alignItems: "center",
    marginTop: 300,

  },
  clickText: {
    color: "#fff",
    fontSize: 60,
    fontWeight: "400",
  },
  countText: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "300",
  }
});
