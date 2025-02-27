import { Link} from "expo-router";
import { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, TouchableOpacity, TextInput, ImageBackgroundComponent, ImageBackground, Image, Pressable } from "react-native";
import Checkbox from 'expo-checkbox';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useRouter} from 'expo-router'
import * as Google from 'expo-auth-session/providers/google';

export default function LoginScreen() {
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: "871617226030-iuse6u2osodim6ru0b7mg6eufrdmp125.apps.googleusercontent.com", // client ID
  });

  const onPressGoogleSignIn = () => {
    console.log("Google sign in pressed");
    promptAsync();
  };
  
  useEffect(()=> {
    if (response?.type === "success"){
      console.log ("Google Login Success:", response);
      router.push("/"); // Go back to index page for now It was not connected db yet
    }

  })
  const onPressSignIn = async () => {
    console.log("Sign in pressed");
    const x = await fetch('https://api.restful-api.dev/objects', { //CHANGE THIS ONCE WE HAVE THE DATABASE!!
      method: 'GET',
    });

    console.log('x', x);
  };
  const [email, onChangeText] = useState('');
  const [password, onChangePassword] = useState('');
  const [isChecked, setChecked] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(true);
  return (
    
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/images/Oval2.png')}
        style={styles.blueOval}
      />

      <ImageBackground
        source={require('../assets/images/Oval1.png')}
        style={styles.yellowOval}
      />

      <ImageBackground
        source={require('../assets/images/Rectangle1.png')}
        style={styles.pinkRectangle}
      />


      {/* The following is top bar with the Tappt logo and rules */}
      <View style={styles.top}>
        <Text style={styles.text}>Tappt</Text>
        <Link href="/rules" style={styles.text}>
          Learn the rules
        </Link>
      </View>
      {/* The following is the entire middle section*/}
      <View style={styles.middle}>
        {/* The following is the welcome message on left */}
        <View style={styles.left}>
          <Text style={styles.welcome}>Welcome!</Text>
          <Text style={styles.prepare}>Prepare for learning that EVERYONE will enjoy.</Text>
        </View>
        {/* The following is the right side of the middle section */}
        <View style={styles.outer}>
          {/* The following is the white sign in box */}
          <View style={styles.sign}>
            <Text style={styles.signHeader}>Sign in</Text>
            {/* The following is google, apple, and facebook buttons */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={onPressGoogleSignIn}
            >
              <Text style={styles.signInText}>Sign in with Google</Text>
            </TouchableOpacity>
            <Text style={styles.or}>
                --------------------- OR ---------------------
            </Text>
            {/* The following is the user input sections for email and password */}
            <Text style={styles.emailText}>
              Email
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={onChangeText}
              value={email}
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
            <Pressable style={{ position: 'absolute', top: 240, right: 20}} onPress={() => setPasswordVisible(!passwordVisible)}>
              <Ionicons name="eye" size={25} color="black" /> {/* The eye emoji in the password section */}
            </Pressable>
          
            {/* The following is the sign in button */}
            <View style={styles.whitespace}/>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={onPressSignIn}
            >
              <Text style={styles.signInButton}>Sign In</Text>
            </TouchableOpacity>
            {/* The following a link to the sign up page */}
            <View style={styles.signUp}>
              <Text style={styles.signUpText}>
                Don't have an account? 
              </Text>
              <Link href='/signUp' style={styles.signUpButton}>
                Sign Up
              </Link>
            </View>
          </View>
        </View>
      </View>
      {/* The following is a link to the student page (where students enter a PIN) */}
      <Link href="/slogin" style={styles.studentLink}>
              Are you a student? Join a game here!
            </Link>
    </View>
  );
}

{/* The following is the styles used for this page */}
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
    marginBottom: 20,
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
    marginBottom: 20,
  },
  emailText: {
    color: 'Black',
    fontSize: 12,
    fontWeight: "700",
    paddingLeft: 2,
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
    paddingRight: 3,
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
  signUp: {
    flexDirection: 'row',
  },
  signUpButton: {
    alignSelf: 'center',
    marginTop: 25,
    fontSize: 10,
    paddingRight: 3,
    color: '#636AE8FF',
  },
  blueOval: {
    position: "fixed",
    top: -250,
    left: '20%',
    //resizeMode: "contain",
  },
  yellowOval: {
    position: "fixed",
    bottom: 150,
    left: -50,
    //resizeMode: "contain",
  },
  pinkRectangle: {
    position: "fixed",
    right: 200,
    bottom: 450,
    //resizeMode: "contain",
  },
  whitespace: {
    height: 200,
  }
});

