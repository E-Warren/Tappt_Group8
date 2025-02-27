import { Text, View, StyleSheet } from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>About screen</Text>
      <View style={styles.boxContainer}>
        <View style={styles.box0}>
          <Text>box 0</Text>
        </View>
        <View style={styles.box1}>
          <Text>box 1</Text>
        </View>
        <View style={styles.box2}>
          <Text>box 2</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
  box0: {
    backgroundColor: 'green',
    padding: 10,
  },
  box1: {
    padding:10,
    backgroundColor: 'red',
    position: 'relative',
    top: -10,
  },
  box2: {
    position:'absolute',
    top: 0,
    left: 0,
    padding:10,
    backgroundColor: 'blue'
  },
  boxContainer: {
    padding: 40,
    backgroundColor: 'yellow'
  }
});
