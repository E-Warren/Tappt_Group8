import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Platform, View, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { Redirect } from 'expo-router';

export default function HomeScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 여기서 실제 로그인 상태를 확인하는 로직을 추가할 수 있음
    setIsLoggedIn(false); // 기본적으로 로그인 안 된 상태
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
      <Button title="로그아웃" onPress={() => setIsLoggedIn(false)} />
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
