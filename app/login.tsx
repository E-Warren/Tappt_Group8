import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableOpacity, Text} from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: "871617226030-iuse6u2osodim6ru0b7mg6eufrdmp125.apps.googleusercontent.com", // client ID
  });

  useEffect (()=> {
    if(response?.type === 'success'){
        router.push('/home');
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="ID"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.buttonContainer}>
         <TouchableOpacity style={styles.button} onPress={() => router.push('/home')}>
            <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => promptAsync()}>
         <Text style={styles.buttonText}>Continue with Google</Text>
         </TouchableOpacity>
         </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    width: '100%',  
    backgroundColor: '#FFFFFF',
    borderColor: '#3d3d3b',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#3d3d3b',  
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 400, 
  },
  inputContainer: {
    width: '80%',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 8,
    borderRadius: 5,
    marginBottom: 12,
  },

});


