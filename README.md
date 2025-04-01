# Tappt #
### A Game-based Class Engagement Software for all K-12 Students. ###

**Group 8, CSCE 3444.001**

**Group Members:** Emily Warren, Carlie Reynoso, Sualeha Irshad, Alec Holland, Madison Westbrook, & Sul Ha Yang


## Vision Statement (Moore's Template) ##
**FOR** visually impaired students in grades K-12 **WHO** struggle to participate in online class game activities, **THE** product “Tappt” is a gamified quizzing website with customized accessibility features for visually impaired students **THAT** can provide an immersive educational experience and allow educational games to be played by all students in class without sidelining students due to lack of accessibility features. **UNLIKE** existing quiz platforms like Kahoot! and GIMKIT **OUR PRODUCT** provides accessibility features for visually impaired students, such as text-to-speech for the whole classroom and a simplified control setup, where students utilize a computer’s keyboard to answer questions. After the game is over, the website also offers an overview of missed questions for studying purposes.

## Prototype Samples ##
<img width="950" alt="Prototype sample screenshots depicting 4 screens from the student's perspective and 4 screens from the teacher's perspective. The student's perspective shows a join-game screen, a click-count screen, a question-and-answer screen, and an end-game screen. The teacher's perspective shows a welcome-and-login screen, a deck-creation screen, a student-results screen, and a leaderboard screen." src="https://github.com/user-attachments/assets/f59c8866-15a7-4fa0-b1f1-4752a08b2d5c" />

## Dependencies & How To Run ##
Run the front end & back end in two separate terminal/console windows. Note that the backend is in a separate folder from the rest of the program; cd to that directory and run the server from there. Be sure that, for each session, you've installed the current necessary dependencies using "npm install". Also ensure that you've moved the .env file to the backend directory.
Run frontend via the command "npx expo start".
Run backend via the command "npm start".

**Front-end dependencies:** Node.js, Expo, expo-auth-session, zustand, expo-speech, expo-av.

**Back-end dependencies:** Node.js, nodemon, bcrypt, Express, cors, dotenv, PostgreSQL, jsonwebtoken. Directory also requires .env file to load some sensitive data.