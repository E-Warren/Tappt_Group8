# Tappt #
### A Game-based Class Engagement Software for all K-12 Students. ###

**Group 8, CSCE 3444.001**

**Group Members:** Emily Warren, Carlie Reynoso, Sualeha Irshad, Alec Holland, Madison Westbrook, & Sul Ha Yang


## Vision Statement (Moore's Template) ##
**FOR** visually impaired students in grades K-12 **WHO** struggle to participate in online class game activities, **THE** product “Tappt” is a gamified quizzing website with customized accessibility features for visually impaired students **THAT** can provide an immersive educational experience and allow educational games to be played by all students in class without sidelining students due to lack of accessibility features. **UNLIKE** existing quiz platforms like Kahoot! and GIMKIT **OUR PRODUCT** provides accessibility features for visually impaired students, such as text-to-speech for the whole classroom and a simplified control setup, where students utilize a computer’s keyboard to answer questions. After the game is over, the website also offers an overview of missed questions for studying purposes.

## Prototype Samples ##
<img width="950" alt="Prototype sample screenshots depicting 4 screens from the student's perspective and 4 screens from the teacher's perspective. The student's perspective shows a join-game screen, a click-count screen, a question-and-answer screen, and an end-game screen. The teacher's perspective shows a welcome-and-login screen, a deck-creation screen, a student-results screen, and a leaderboard screen." src="https://github.com/user-attachments/assets/f59c8866-15a7-4fa0-b1f1-4752a08b2d5c" />

CODE DEPENDECIES for backend:
  Node.js:
  - installed via the internet
  Database connection dependecies: PostgresSQL, nodemon
  - Installation:
    + type "npm i nodemon pg" into the terminal
  Server dependencies: Express.js
  - Installation: 
    + type "npm i express" into the terminal
  
  Running server with database connection:
  - type "npm init -y"
  - add ""start": "nodemon backend_server.js"" under the JSON "scripts" header in the package.json file
  - type "npm start" 
      + should get successful terminal messages: "Listening at http://localhost:${port}" and "Connected to Postgres database!"
  - **you also need an .env file in order to connect to the database successfully**
      + without a successful connection, you cannot run any of the .js files.
  
  What each .js file does:
  - backend-connection.js
      + connects to our database using a pool connection (which allows multiple connection making multiple requests at one)
  - backend-server.js
      + uses a RESTful API (handles GET, POST, PUT, and DELETE requests... along with others not used here) to create a server using Express.js
      + based on the request, it will return database data (GET), add database data (POST),
        update current data (PUT), or delete data (DELETE) using PostgresSQL queries
        - will return response codes 404, 500 200, 201, and 204 if these request executions were successful or not
      + each request type may/may not have a different endpoint(URL), which API handles
      + *everything here is flexible: port number, types of requests, endpoints, number of endpoints, etc.*

