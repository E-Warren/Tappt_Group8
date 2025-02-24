import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Platform, View, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { Redirect } from 'expo-router';

export default function HomeScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(false);
  }, []);

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/partial-react-logo.png')}
        style={styles.reactLogo}
      />
      <Button title="logout" onPress={() => setIsLoggedIn(false)} />
    </View>
  );
}

    

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
