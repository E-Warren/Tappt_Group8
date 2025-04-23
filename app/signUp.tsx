import { Link } from "expo-router";
import { useState } from "react";
import { Text, View, StyleSheet, Button, TouchableOpacity, TextInput, ImageBackgroundComponent, ImageBackground, Image, Pressable } from "react-native";
import Checkbox from 'expo-checkbox';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useRouter} from 'expo-router'
import Config from './config';

export default function LoginScreen() {
  const router = useRouter();

  //declaring/defining helper fxns used in main native login fxn
  const isValidEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email.trim());
  };

  const isAlphanumeric = (password) => {
    const alphanumericPattern = /^[a-zA-Z0-9]+$/;
    return alphanumericPattern.test(password.trim());
  };

  //MAIN NATIVE SIGN UP FUNCTION
  const onPressSignUp = async () => {
    console.log("Sign up pressed");
    console.log("Entered email:", text.trim(), "Entered password:", password.trim());
  

    //check if both fields entered
    if (!text.trim() || !password.trim()) {
        alert("Please enter both email and password.");
        return;
    }  
  
    //check if user has a valid email
    if(!isValidEmail(text)){
      alert("Invalid email format.");
      return;
    }

    //check if password is alphanumeric
    if(!isAlphanumeric(password)){
      alert("Password contains at least one invalid character. Passwords must be 8-30 characters long and alphanumeric.");
      return;
    }

    //check is password is between 8 and 30 characters long
    if(password.length < 8){
      alert("Password contains fewer than 8 characters. Passwords must be 8-30 characters long and alphanumeric.");
      return;
    } 
    else if (password.length > 30){
      alert("Password contains more than 30 characters. Passwords must be 8-30 characters long and alphanumeric.")
      return;
    }

    if(text.length > 321){
      alert("Email too long. Please ensure that email is at most 321 characters.")
      return;
    }

    try {
        const response = await fetch(`${Config.BE_HOST}/signUp`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          credentials: 'include', //cookie stuff in case needed
          body: JSON.stringify({
            email: text.trim(),
            password: password.trim(),
          }),
        });
  
        console.log("Response status:", response.status);
  
        const data = await response.json();
    
        if (data.token) {
          localStorage.setItem('token', data.token); //store jwt info

          //OLD CONTENT:
          //console.log("Sign-up success:", data);
          router.push("/view-decks"); // Redirect on success
        } else {
          console.log("Sign-up failed:", data.message);
          alert(data.message);
        }
    
    } catch (error) {
        console.log("Error during sign-up:", error);
        alert("Server error, please try again later.");
    }
  };


  const [isChecked, setChecked] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(true);

  //for login
  const [text, onChangeText] = useState('');
  const [password, onChangePassword] = useState('');
 
  //---------------------------------------------------------------------------------

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

      <View style={styles.top}>
        <Text style={styles.text}>Tappt</Text>
        <Link href="/rules" style={styles.text}>
          Learn the rules
        </Link>
      </View>
  
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
            <Text style={styles.signHeader}>Sign Up</Text>
            
            {/* The following is the user input section for email and password */}
            <Text style={styles.emailText}>
              Email
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={onChangeText}
              value={ text }
              placeholder="Enter your email"
              placeholderTextColor={"#BEBEBE"}
              onSubmitEditing={onPressSignUp}
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
              onSubmitEditing={onPressSignUp}
            />
            <Pressable style={{ position: 'absolute', top: 135, right: 20, paddingTop:2,}} onPress={() => setPasswordVisible(!passwordVisible)}>
              <Text><Ionicons name="eye" size={25} color="black" /> {/* This is the eye emoji to see the password */}</Text>
            </Pressable>
            
            <View style={styles.whitespace}/>
            {/* The following is the sign up button */}
            
            <TouchableOpacity
              style={styles.signInButton}
              onPress={onPressSignUp}
            >
              <Text style={styles.signInButton}>Sign Up</Text>
            </TouchableOpacity>
            <View style={styles.signUp}>
              <Text style={styles.signUpText}>
                Already have an account? 
              </Text>
              {/* The following is the link to the log in page */}
              <Link href='/login' style={styles.signUpButton}>
                Sign In
              </Link>
            </View>
          </View>
        </View>
      </View>
      {/* The following is the link to the student page (where they enter a PIN) */}
      <Link href="/slogin" style={styles.studentLink}>
              Are you a student? Join a game here!
            </Link>
    </View>
  );
}

{/* The following is the styles used in this page */}
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
    paddingRight: 150,
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
    height: 196, //formerly 306
  }
});
