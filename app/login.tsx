import { Link } from "expo-router";
import { useState } from "react";
import { Text, View, StyleSheet, Button, TouchableOpacity, TextInput, ImageBackgroundComponent, ImageBackground, Image, Pressable } from "react-native";
import Checkbox from 'expo-checkbox';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function LoginScreen() {
  const onPressGoogleSignIn = () => {
    console.log("Google sign in pressed");
  };
  const onPressFacebookSignIn = () => {
    console.log("Facebook sign in pressed");
  };
  const onPressAppleSignIn = () => {
    console.log("Apple sign in pressed");
  };
  const onPressSignIn = async () => {
    console.log("Sign in pressed");
    const x = await fetch('https://api.restful-api.dev/objects', {
      method: 'GET',
    });

    console.log('x', x);
  };
  const [text, onChangeText] = useState('');
  const [password, onChangePassword] = useState('');
  const [isChecked, setChecked] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.text}>Tappt</Text>
        <Link href="/rules" style={styles.text}>
          Learn the rules
        </Link>
      </View>
      {/*<Image
        source={require('../assets/images/Oval2.png')}
      />
  */}
  

      <View style={styles.middle}>
        {/* The following is the welcome message on left */}
        <View style={styles.left}>
          <Text style={styles.welcome}>Welcome!</Text>
          <Text style={styles.prepare}>Prepare for learning that EVERYONE will enjoy.</Text>
        </View>
        <View style={styles.outer}>
          <View style={styles.sign}>
            <Text style={styles.signHeader}>Sign in</Text>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={onPressGoogleSignIn}
            >
              <Text style={styles.signInText}>Sign in with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.faceBookButton}
              onPress={onPressFacebookSignIn}
            >
              <Text style={styles.signInText}>Sign in with Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.appleButton}
              onPress={onPressAppleSignIn}
            >
              <Text style={styles.signInText}>Sign in with Apple</Text>
            </TouchableOpacity>
            <Text style={styles.or}>
                --------------------- OR ---------------------
            </Text>
            <Text style={styles.emailText}>
              Email
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={onChangeText}
              value={text}
              placeholder="Enter your email"
              placeholderTextColor={"#BEBEBE"}
            />
            <Text style={styles.emailText}>
              Password
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={onChangePassword}
              value={password}
              placeholder="Enter your password"
              secureTextEntry={passwordVisible}
              placeholderTextColor={"#BEBEBE"}
            />
            <Pressable style={{ position: 'absolute', top: 320, right: 20}} onPress={() => setPasswordVisible(!passwordVisible)}>
              <Ionicons name="checkmark-circle" size={32} color="green" />
            </Pressable>
            <View style={styles.past}>
              <View style={styles.remember}>
                <Checkbox
                  value={isChecked}
                  onValueChange={setChecked}
                  color={isChecked ? '#4630EB' : undefined}
                >
                </Checkbox>
                <Text style={styles.emailText}>
                   Remember me
                </Text>
              </View>
              <Text style={styles.signLinkText}>
                Forgot password?
              </Text>
            </View>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={onPressSignIn}
            >
              <Text style={styles.signInButton}>Sign In</Text>
            </TouchableOpacity>
            <Text style={styles.signUpText}>
              Don't have an account?
            </Text>
          </View>
        </View>
      </View>
      <Link href="/slogin" style={styles.studentLink}>
              Are you a student? Join a game here!
            </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7F55E0FF",
    overflow: 'scroll',
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
  middle: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingBottom: 80,
    paddingRight: 30,
    alignItems: "center",
  },
  sign: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 6,
    paddingVertical: 20,
    paddingHorizontal: 15,
    flexDirection: 'column',
    marginBottom: 30,

  },
  outer: {
    flexGrow: 1,
    minWidth: 300,
    padding: 40,
    flexDirection: 'column',
    marginBottom: 30,
    marginTop: 50,
  },
  left: {
    flexGrow: 1,
    minWidth: 300,
    maxWidth: 800,
    paddingHorizontal: 40,
  },
  googleButton: {
    backgroundColor: "#4E85EBFF",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 6,
    padding: 5,
    borderWidth: 5,
    borderColor: "#4E85EBFF",
  },
  faceBookButton: {
    backgroundColor: "#455EA9FF",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 6,
    padding: 5,
    borderWidth: 5,
    borderColor: "#455EA9FF",
  },
  appleButton: {
    backgroundColor: "#171A1FFF",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 6,
    padding: 5,
    borderWidth: 5,
    borderColor: "#171A1FFF",
  },
  or: {
    alignSelf: 'center',
    color: '#9095A1FF',
    fontSize: 14,
    margin: 8,
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#F3F4F6FF',
    marginBottom: 10,
    borderRadius: 6,
    borderWidth: 5,
    borderColor: '#F3F4F6FF',
  },
  signInButton: {
    backgroundColor: '#636AE8FF',
    alignItems: 'center',
    borderRadius: 6,
    padding: 5,
    color: 'white',
    
  },
  welcome: {
    alignSelf: 'center',
    color: '#EFB034FF',
    fontSize: 100,
    fontWeight: "600",
  },
  prepare: {
    alignSelf: 'center',
    color: 'white',
    fontSize: 30,
    fontWeight: "600",
    paddingLeft: 70,
    paddingRight: 30,
    marginTop: 10,
  },
  signInText: {
    color: 'white',
  },
  signHeader: {
    color: 'black',
    fontSize: 25,
    fontWeight: "600",
    marginBottom: 10,
  },
  emailText: {
    color: 'Black',
    fontSize: 12,
    fontWeight: "700",
  },
  inputText: {
    color: "red",
  },
  past: {
    flexDirection: 'row',
    justifyContent: "space-between",
    marginBottom: 90,
  },
  signLinkText: {
    color: '#636AE8FF',
    fontSize: 12,
  },
  signUpText: {
    alignSelf: 'center',
    marginTop: 25,
    fontSize: 10,
  },
  remember: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentLink: { //For navigationg to Student Login
    alignSelf: "center",
    bottom: 30, 
    color: "#fff",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
