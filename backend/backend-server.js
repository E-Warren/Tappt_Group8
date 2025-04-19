//set up express server
const express = require("express");
const app = express();
var expressWs = require("express-ws")(app);

//get sensitive data
require("dotenv").config();

//set up jwt requirement and load env key
const jwt = require("jsonwebtoken");
const key = String(process.env.JWT_KEY);

//set up bcrypt hashing
const bcrypt = require("bcrypt");
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);

//random port number -> can change if we want something different
const port = 5000;

//connect express server to our database connection
const { pool } = require("./backend_connection");

//middleware to handle post and put requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//to permit incoming data from frontend
const cors = require("cors");

//bring email from temp for google login
const bodyParser = require("body-parser");


//determine source of incoming request depending on localhost vs deployed env
//use this to avoid mixed-content warning
if(process.env.IS_LOCALHOST != 1){
  console.log("NOT local host");
  const allowedOrigins = process.env.REACT_APP_ORIGINS?.split(",") || [];

  console.log(`Allowed origins are: ${allowedOrigins}`);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          console.log(`listening at ${allowedOrigins[0]}`);
          console.log(`listening at ${allowedOrigins[1]}`);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );
}
else{  //developing on localhost, indicated by env var
  
  console.log("LOCAL HOST");
  app.use(
    cors({
      origin: "http://localhost:8081",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );  
}

//interacts with the sign in button at /login
//sends 200 status and success JSON file when sign in button is pressed
app.get("/login", (req, res) => {
  try {
    console.log("login-attempt");

    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(500).json(error);
  }
});

//------------------------LOGIN WORK-------------------------------

//check token before allowing access to personal contents
const authenticateToken = (req, res, next) => {
  console.log("authenticating token...");
  
  //access denied if no token / broken token (ha ha... it rhymes)
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
      return res.status(403).json({ error: "Access denied, please log in and try again." });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
      return res.status(403).json({ error: "Access denied, please try again." });
  }

  //verify good token
  jwt.verify(token, key, (err, decoded) => {
      if (err) {
          console.error("Token verification failed (probably a logout issue):", err.message);          
          return res.status(403).json({ error: "Invalid token" });
      }

      //keep userID for future use
      req.userID = String(decoded.userID);
      console.log("Authenticated!");
      next();
  });
};


//root route to avoid "Cannot GET /" in backend terminal
app.get("/", (req, res) => {
  res.send("Server is running!");
});

//sign IN --> checking U&P
app.post("/login", async (req, res) => {
  console.log("Login route hit!"); // Add this
  const { email, password } = req.body;
  console.log("Login attempt with:", email);

  try {
    //check if user email in db
    const checkEmailExists = `SELECT fld_login_email, fld_login_pwd 
        FROM login_first.tbl_login
        WHERE fld_login_email = $1;`;

    //actually do the query
    const result1 = await pool.query(checkEmailExists, [email]);

    if (result1.rowCount == 0) {
      return res
        .status(401)
        .json({ message: "No accounts with this email saved in system." });
    }

    //hash user's entered pwd and compare
    const fromDB = result1.rows[0].fld_login_pwd;
    const samePwd = await bcrypt.compare(password, fromDB);

    if (samePwd) {
        //success! --> get user ID to navigate to deck page
        const getID = `
        SELECT fld_login_id_pk
        FROM login_first.tbl_login
        WHERE fld_login_email = $1`

        const result2 = await pool.query(getID, [email]);
        const currentUserID = result2.rows[0].fld_login_id_pk;
      
        //success! --> generate jwt
        console.log("Generating jwt...");
        const token = jwt.sign({userID: currentUserID}, key, {expiresIn: '24h'});
        console.log("jwt made");
        res.json({token}); 

        //below is previous success response --> now just use token
        //res.status(200).json({ message: "Login success!" });
    } else {
      res.status(401).json({ message: "Incorrect password." });
    }
  } catch (error) {
    //throw 500 error if any error occurred during or after querying
    res.status(500).json(error);
  }
});

//sign UP --> check if U exists, then add U&P to db
app.post("/signup", async (req, res) => {
  console.log("Sign-up route hit!");
  const { email, password } = req.body;
  console.log("Sign-up attempt with:", email);

  try {
      //check if entered email already exists
      const isEmailAvailable = `
        SELECT fld_login_email 
        FROM login_first.tbl_login
        WHERE fld_login_email = $1;`;

      const result1 = await pool.query(isEmailAvailable, [email]);

      if (result1.rowCount > 0) {
        return res.status(400).json({ message: "Email already in use." });
      }

      //hash user's chosen password
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const hashedValue = await bcrypt.hash(password, salt);

    //insert new user into the database
      const addUser = `
        INSERT INTO login_first.tbl_login (fld_login_email, fld_login_pwd) 
        VALUES ($1, $2);`;

      await pool.query(addUser, [email, hashedValue]);

      console.log("New user created:", email);

      //should be inserted! now get user ID to navigate to deck page
      const getID = `
      SELECT fld_login_id_pk
      FROM login_first.tbl_login
      WHERE fld_login_email = $1`

      const result2 = await pool.query(getID, [email]);
      const currentUserID = result2.rows[0].fld_login_id_pk;
  
      //generate jwt
      console.log("Generating jwt...");
      const token = jwt.sign({userID: currentUserID}, key, {expiresIn: '24h'});
      console.log("jwt made");
      res.json({token}); 

     // res.status(201).json({ message: "Sign-up success" });

    } catch (error) {
        console.error("Error during sign-up:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
});

//-------------------GOOGLE LOGIN -----------------------------------
app.use(bodyParser.json());

app.post("/google-login", async (req, res) => {
    console.log("google-login route hit!");
    const { email } = req.body;
    console.log("google-login with:", email);

    try {

        const isEmailAvailable = `
        SELECT fld_login_email 
        FROM google_login.tbl_google_users
        WHERE fld_login_email = $1;`;
        
        const result1 = await pool.query(isEmailAvailable, [email]);
        
        if (result1.rowCount > 0) {

            console.log("Email already exists, logging in...");

            //now get user ID to navigate to deck page
            const getID = `
            SELECT fld_login_id_pk
            FROM google_login.tbl_google_users
            WHERE fld_login_email = $1`
    
            const result2 = await pool.query(getID, [email]);
            const currentUserID = result2.rows[0].fld_login_id_pk;

            console.log(`current User ID: ${currentUserID} `);
            console.log(`type of user ID is ${typeof currentUserID}`)

            //success! --> generate jwt
            console.log("Generating jwt...");
            const token = jwt.sign({userID: currentUserID}, key, {expiresIn: '24h'});
            console.log(`jwt: ${token}`);
            res.json({token}); 

            //return res.status(200).json({ message: "Login success", email });
        } else {

            const addUser = 
            `INSERT INTO google_login.tbl_google_users (fld_login_email) 
            VALUES ($1);`;

            await pool.query(addUser, [email]);

            console.log("New user created:", email);

            //should be inserted! now get user ID to navigate to deck page
            const getID = `
            SELECT fld_login_id_pk
            FROM google_login.tbl_google_users
            WHERE fld_login_email = $1`

            const result2 = await pool.query(getID, [email]);
            const currentUserID = result2.rows[0].fld_login_id_pk;
        
            console.log(`current User ID: ${currentUserID} `);

            //generate jwt
            console.log("Generating jwt...");
            const token = jwt.sign({userID: currentUserID}, key, {expiresIn: '24h'});
            console.log("jwt made");
            res.json({token}); 

            //return res.status(201).json({ message: "Google sign-up success", email });
        }

    } catch (error) {
        console.error("Error during Google login/sign-up:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
});



//------------------------DECK WORK-------------------------------

//creating decks
app.post("/createdecks", authenticateToken, async (req, res) => {
    try {
        const {deckTitle, QnA} = req.body
 
        //check if the deck name already exists in the database FOR THIS USER
        query =
        `SELECT *
         FROM card_decks.tbl_card_decks
         WHERE fld_deck_name = $1 AND fld_login_id_fk = $2;
        `
        const checkDeckExists = await pool.query(query, [deckTitle, req.userID])

        //if deck exists, return with message saying so
        if (checkDeckExists.rowCount > 0) {
            res.status(400).json({message: "Deck name already exists. Please enter new deck name."})
        }
        //if deck doesn't exist, start saving deck into database
        else {
            query =
            `INSERT INTO card_decks.tbl_card_decks(fld_deck_name, fld_login_id_fk)
            VALUES ($1, $2)
            RETURNING fld_deck_id_pk;
            `
            //inserting query into database
            const deckID = await pool.query(query, [deckTitle, req.userID])

            console.log("Successful deck name insert: ", deckTitle, "deckID: ", deckID.rows[0].fld_deck_id_pk)

            //for every question in deck, and for every answer in question, insert
            for (q of QnA) {
                query = 
                `INSERT INTO card_decks.tbl_card_question(fld_deck_id_fk, fld_card_q)
                VALUES($1, $2)
                RETURNING fld_card_q_pk;
                `
                //insert questionText into database and return the questionID generated by the database
                questionID  = await pool.query(query, [deckID.rows[0].fld_deck_id_pk, q.questionText])

                console.log("successful insert question: ", q.questionText)

                //edited this -> to allow both answer text and correctness to be added into database by iterating through QnA array
                for (let i = 0; i < q.answers.length; i++) {
                    query =
                    `INSERT INTO card_decks.tbl_q_ans(fld_card_q_fk, fld_card_ans, fld_ans_correct)
                    VALUES($1, $2, $3)
                    RETURNING *;
                    `
                    //query for inserting answer text and correctness into database
                    insert_all  = await pool.query(query, [questionID.rows[0].fld_card_q_pk, q.answers[i], q.correctAnswers[i]])
                    console.log("Inserted answer:", q.answers[i], "correctness:", q.correctAnswers[i], "questionID:", questionID.rows[0].fld_card_q_pk)
                }
            }

            res.status(201).json({message: "Deck creation success!"})
        }
    }
    //if failed to insert or really any error pops up
    catch(error) {
        console.log("Error during deck creation:", error)
        res.status(500).json({message: "Server error, please try again later"})
    }
})

//-----------------------------------------------------------
//getting decks for /view-decks
app.get("/view-decks", authenticateToken, async (req, res) => {
  try {
      //query for obtaining all decks and their descriptions
        console.log("loading decks for this user...");

        const query = 
        `SELECT fld_deck_id_pk, fld_deck_name, COUNT(*) AS questionCount
         FROM card_decks.tbl_card_decks AS d INNER JOIN card_decks.tbl_card_question AS q
			    ON d.fld_deck_id_pk = q.fld_deck_id_fk
          WHERE fld_login_id_fk = $1
         GROUP BY fld_deck_id_pk, fld_deck_name;`

        //wait for query to finalize
        const decks = await pool.query(query, [req.userID.trim()])

        //send an 201 (OK) status as for success
        //return query in JSON format
        res.status(201).json(decks.rows)
    }
    //throw 500 error if any error occurred during or after querying
    catch(error) {
      console.log("noting an error on get view-decks");
        res.status(500).json(error)
    }
})


//getting a deck using an id for /createdecks/:id
app.get("/createdecks/:id", authenticateToken, async (req, res) => {
    try {
        //obtaining the deck ID
        const {id} = req.params

        //query for obtaining all decks and their descriptions
        const query = 
        `SELECT fld_deck_name, fld_card_q_pk, fld_card_q, fld_q_ans_pk, fld_card_ans, fld_ans_correct
         FROM card_decks.tbl_q_ans AS a INNER JOIN card_decks.tbl_card_question AS q
	        ON a.fld_card_q_fk = q.fld_card_q_pk
	        INNER JOIN card_decks.tbl_card_decks AS c
		        ON c.fld_deck_id_pk = q.fld_deck_id_fk
         WHERE fld_deck_id_pk = $1;`

        //wait for query to finalize
        const decks = await pool.query(query, [id])

        //if deck key doesn't exist -> only happens if you messed with the URL
        //return 404 error
        if (decks.rowCount == 0) {
            res.status(404).json({Error: "Deck does not exist: Invalid deck key."})
            return
        }
        else {
            //send an 201 (OK) status as for success
            //return query in JSON format
            res.status(201).json(decks.rows)
        }
    }
    //throw 500 error if any error occurred during or after querying
    catch(error) {
        res.status(500).json(error)
    }
})


//saving pre-established decks
app.put("/createdecks/:id", authenticateToken, async (req, res) => {
    try {
        const {id} = req.params
        const {deckTitle, QnA} = req.body
 
        //check if the deck name already exists in the database FOR THIS USER
        query =
        `SELECT *
         FROM card_decks.tbl_card_decks
         WHERE fld_deck_name = $1 AND fld_deck_id_pk != $2 AND fld_login_id_fk = $3;
        `
        const checkDeckExists = await pool.query(query, [deckTitle, id, req.userID])

        //if deck exists, return with message saying so
        if (checkDeckExists.rowCount > 0) {
            res.status(400).json({message: "Another deck has the same name. Please enter new deck name."})
        }

        //if deck doesn't exist, start saving deck into database
        else {
            query =
            `UPDATE card_decks.tbl_card_decks
             SET fld_deck_name = $1
             WHERE fld_deck_id_pk = $2
             RETURNING *;
            `
            //inserting query into database
            const deckID = await pool.query(query, [deckTitle, id])

            console.log("Successful deck name update: ", deckTitle, "deckID: ", id)

            //deleting all questions and answers so new ones can be inputted
            query = 
            `DELETE FROM card_decks.tbl_card_question
             WHERE fld_deck_id_fk = $1;
             `
            await pool.query(query, [id])
            console.log("successful deletion.");

            //for every question in deck, and for every answer in question, insert
            for (q of QnA) {
              query = 
              `INSERT INTO card_decks.tbl_card_question(fld_deck_id_fk, fld_card_q)
              VALUES($1, $2)
              RETURNING fld_card_q_pk;
              `
              questionID  = await pool.query(query, [id, q.questionText])

              console.log("successful insert question: ", q.questionText)

              //edited this -> to allow both answer text and correctness to be added into database by iterating through QnA array
              for (let i = 0; i < q.answers.length; i++) {
                query =
                `INSERT INTO card_decks.tbl_q_ans(fld_card_q_fk, fld_card_ans, fld_ans_correct)
                VALUES($1, $2, $3)
                RETURNING *;
                `
                //query for inserting answer text and correctness into database
                insert_all  = await pool.query(query, [questionID.rows[0].fld_card_q_pk, q.answers[i], q.correctAnswers[i]])
                console.log("Inserted answer:", q.answers[i], "correctness:", q.correctAnswers[i], "questionID:", questionID.rows[0].fld_card_q_pk)
             }
            }

            res.status(201).json({message: "Deck update was a success!"})
        }
    }
    //if failed to insert or really any error pops up
    catch(error) {
        console.log("Error during deck creation:", error)
        res.status(500).json({message: "Server error, please try again later"})
    }
})

//for deleting an entire deck
app.delete("/view-decks", authenticateToken, async (req, res) => {
  try {
    //just need deck ID -> children on delete on cascade
    const {deckID} = req.body;

    //query deleting an entire deck
    const query = 
    `DELETE FROM card_decks.tbl_card_decks
     WHERE fld_deck_id_pk = $1
     RETURNING *;
    `

    //delete entire deck now
    const delete_deck = await pool.query(query, [deckID])

    //if query resulted in nothing -> we probably don't need this but just in case i guess
    if (delete_deck.rows.length < 1) {
      res.status(404).json({ message: "Deck not found - cannot be deleted" })
    } 
    else {
      //return 204 (successful delete now) if successful
      console.log("deleted deck at deckID =", deckID)
      res.status(204).json({message: "Deck deletion was a success!"});
    }

  } catch (error) {
    //catch errors if they occur
    console.log("Error during deck deletion", error)
    res.status(500).json(error)
  }
});

// -------------------- FRONTEND STUDENT ANSWER CHOICES WORK --------------------------- 
app.get("/answerchoices/:deckID", async (req, res) => {
  try {
      //obtain deckID from student frontend
      const {deckID} = req.params

      //query for obtaining all questions and answers
        const query = 
        `SELECT fld_card_q, fld_card_q_pk, fld_card_ans, fld_ans_correct, fld_q_ans_pk
         FROM card_decks.tbl_q_ans AS a INNER JOIN card_decks.tbl_card_question AS q
	          ON a.fld_card_q_fk = q.fld_card_q_pk
	          INNER JOIN card_decks.tbl_card_decks AS c
		          ON c.fld_deck_id_pk = q.fld_deck_id_fk
         WHERE fld_deck_id_pk = $1;`

        //wait for query to finalize
        const deck = await pool.query(query, [deckID])

        //send an 201 (OK) status as for success
        //return query in JSON format
        res.status(201).json(deck.rows)
    }
    //throw 500 error if any error occurred during or after querying
    catch(error) {
      console.log("we gots an error during get /answerchoices:");
      console.log(error);
      res.status(500).json(error)
    }
    pool.on("error", (err, client) => {
      console.error("Unexpected error on idle PostgreSQL client", err);
    });
})




// -------------------- SOCKET WORK --------------------------- 

const hostRoom = async () => { //function to generate a host room code
  try {
    console.log("Creating a room!");
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; //character options for the room
    let roomCode = "";

    for (let i = 0; i < 6; i++) { //will randomly get 6 characters
      roomCode += chars[Math.floor(Math.random() * chars.length)];
    }
    console.log("Room code", roomCode);
    const name = "teacher";

    //will add the teacher to the database
    const createRoomQuery = `INSERT INTO room_students.tbl_room (name, fld_room_code, type)
        VALUES 
        ($1, $2, 'host');`;

    await pool.query(createRoomQuery, [name, roomCode]);
    console.log("Cool beans it works!");

    return roomCode; //returns the generated room code
  } catch (err) {
    console.log("It failed :(");
    return "failed";
  }
};

const joinRoom = async (data) => { //function to create the student name
  console.log("Inside my endpoint!!!!!!");
  const generateName = () => {
    //colors and animals used to generate the name
    const colors = [
      "red",
      "orange",
      "yellow",
      "green",
      "blue",
      "purple",
      "pink",
      "cyan",
      "magenta",
      "happy",    //adding non-color adjectives too for now :o)
      "silly",
      "funny",
      "fancy",
      "lucky",
      "eager",
      "brave",
      "calm",
      "jolly",
      "proud",
      "witty", 
      "dizzy",
      "friendly",
      "cool",
      "sly",
      "fast",
    ];
    const animals = [
      "dog",
      "goose",
      "lion",
      "cat",
      "elephant",
      "butterfly",
      "crow",
      "frog",
      "giraffe",
      "horse",
      "cheetah",
      "penguin",
      "parrot",
      "bear",
      "eagle",
      "frog",
      "turtle",
      "seal",
      "wolf",
      "zebra", 
      "koala",
      "fox", 
      "panda",
      "tiger",
      "rhino",
    ];
    //gets the color and the animal and combines them to form the name
    const firstNumber = Math.floor(Math.random() * colors.length);
    const firstName = colors[firstNumber];
    const secondNumber = Math.floor(Math.random() * animals.length);
    const secondName = animals[secondNumber];
    return firstName + " " + secondName;
  };

  try {
    const roomCode = data.code; //stores the room code

    //finds the current names in the room (used to make sure there are not students with the same name)
    const nameQuery = `SELECT name
        FROM room_students.tbl_room
        WHERE fld_room_code = $1;`;

    const existingNames = await pool.query(nameQuery, [roomCode]); //get a list of the existing names in the room
    console.log("The existing names: ", existingNames);

    let name = generateName();
    while (existingNames.rows.some((row) => row.name === name)) { //if the name matches one already in the room it will generate a new one
      name = generateName();
    }

    console.log("The name is: ", name);

    //add the student to the database
    const studentJoinRoomQuery = `INSERT INTO room_students.tbl_room (name, fld_room_code, type)
        VALUES 
        ($1, $2, 'student');`;

    await pool.query(studentJoinRoomQuery, [name, roomCode]);
    console.log("Student joined the class!!!");

    return name; //returns the student's name
  } catch (err) {
    console.log("Error: ", err);
    return 'failed';
  }
};
 
const games = []; //stores all of the games
const websockets = []; //stores the websocket connections

// const gameState = {
//   studentsInRoom: ["yellow goose", "pink giraffe"],
//   deckID: 12345,
//   currentQuestion: 2,
//   answers: [{
//     studentName: "yellow goose",
//     studentAnswer: "A",
//     questionID: 1,
//     clickCount: 100,
//   }, {
//     studentName: "pink giraffe",
//     studentAnswer: "B",
//     questionID: 2,
//     clickCount: 150,
//   }]
// }
const gameState = {
  studentsInRoom: [],
  deckID: undefined,
  currentQuestion: undefined,
  answers: [],
  hasStarted: false,
}

const resetGameState = async () => {
  gameState.answers = [];
  gameState.deckID = undefined;
  gameState.currentQuestion = undefined;
  gameState.studentsInRoom = [];
  gameState.hasStarted = false;
}

//for generating bonus probability
const getProbabilityInt = async () => {
  //generate a number between 1 and 100 inclusively
  return Math.floor(Math.random() * 100) + 1;
}

const bonusDecider = async (name, qNum) => {
  //finding the first place person -> first find max clicks
  const topClicks = Math.max(...gameState.answers.map(max => max.studentClicks));

  //comparing max clicks person to websocket person name
  const firstPlace = gameState.answers.filter(person => person.studentClicks === topClicks && person.questionNum === qNum);

  //ya bonus probability
  const bonusProb = await getProbabilityInt();
  let yourBonus = "";
  console.log("bonus probability: ", bonusProb);

  //doing bonus selection based on if person is first place or not
  //if failed to find the first place
  if (firstPlace.length === 0) {
    yourBonus = "failed";
  }
  else if (name === firstPlace[0].studentName) { //if first place
    //colors
    console.log(name, "is first place with", topClicks, "clicks")
    if (bonusProb <= 25) {
      yourBonus = "10% Bonus";
    }
    else if (bonusProb > 25 && bonusProb <= 45) {
      yourBonus = "15% Bonus";
    }
    else if (bonusProb > 45 && bonusProb <= 60) {
      yourBonus = "20% Bonus";
    }
    else if (bonusProb > 60 && bonusProb <= 85) {
      yourBonus = "1.5x Multiplier";
    }
    else if (bonusProb > 85) {
      yourBonus = "2x Multiplier";
    }
    else {
      yourBonus = "failed";
    }
  }
  else {  //if not first place
    if (bonusProb <= 20) {
      yourBonus = "10% Bonus";
    }
    else if (bonusProb > 20 && bonusProb <= 35) {
      yourBonus = "15% Bonus";
    }
    else if (bonusProb > 35 && bonusProb <= 45) {
      yourBonus = "20% Bonus";
    }
    else if (bonusProb > 45 && bonusProb <= 65) {
      yourBonus = "1.5x Multiplier";
    }
    else if (bonusProb > 65 && bonusProb <= 75) {
      yourBonus = "2x Multiplier";
    }
    else if (bonusProb > 75 && bonusProb <= 90) {
      yourBonus = "5% Steal";
    }
    else if (bonusProb > 90) {
      yourBonus = "10% Steal";
    }
    else {
      yourBonus = "failed";
    }
  }

  return yourBonus;
}

const handleRemoveAll = async (studentName, type, leavingRoomCode)=> {
  console.log("Removing websocket connection");

  if (type === "student"){
    gameState.studentsInRoom = gameState.studentsInRoom.filter(name => name != studentName);
    websockets.forEach((websocket) => {
      websocket.socket.send(JSON.stringify({
        type: "studentLeft",
        studentName, //return the time left
      }))
    })

    gameState.studentsInRoom = gameState.studentsInRoom.filter(name => name !== studentName);
    console.log("Students when one person leaves", gameState.studentsInRoom);

    try {
      const studentLeftQuery = `DELETE FROM room_students.tbl_room
      WHERE fld_room_code = $1 and type = 'student';`;
      const removeStudent = await pool.query(studentLeftQuery, [leavingRoomCode]);
      console.log("Student successfully deleted from database");
    } catch (error) {
      console.log("There was an error when removing the student from database", error);
    }


  } else {
    //deleted EVERYTHING if host leaves
    resetGameState();
    //handle when teacher leaves
    websockets.forEach((websocket) => {
      websocket.socket.send(JSON.stringify({
        type: "hostLeft",
      }))
    })

    try{
      const hostLeftQuery = `DELETE FROM room_students.tbl_room
      WHERE fld_room_code = $1`;
      const removeRoom = await pool.query(hostLeftQuery, [leavingRoomCode]);
      console.log("successfully deleted the room from the game");
    } catch (error) {
      console.log("Error when deleting the room", error);
    }
  }

}

let intervals;

app.ws('/join', function(ws, req) {
  const socketConnection = {socket: ws};
  websockets.push(socketConnection); //adds connection to array
  let studentName; 
  let type;
  let leavingRoomCode;
    ws.on('message', async function(msg) { //get the message
      console.log(msg);
      const userMessage = JSON.parse(msg);
      

      if (userMessage.type === 'join'){ //called when a student joins the room
        console.log("Going to join the room"); 
        const returnedName = await joinRoom(userMessage.data); //gets the randomly generated student name
        studentName = returnedName; //store student's name
        socketConnection.userName = returnedName;
        type = "student";
        leavingRoomCode = userMessage.data.code;
        gameState.studentsInRoom.push(returnedName);
        ws.send(JSON.stringify({type: "newStudentName", data: returnedName, code: userMessage.data.code})); //will store the message in zustand
        const listOfStudents = gameState.studentsInRoom; //stores the list of students in the game

          websockets.forEach((websocket) => { //will update the students in the game (sends to each websocket)
            websocket.socket.send(JSON.stringify({
              type: "studentsInGame",
              data: listOfStudents
            }));
          })
      }

      if (userMessage.type === "host"){ //called when the teacher hits host deck
        type = "teacher";
        const returnedRoom = await hostRoom(); //will randomly generate a room code
        leavingRoomCode = returnedRoom;
        console.log("Teacher connected");

        gameState.deckID = userMessage.deck; // edit: now saves deckID from frontend! yay!
        console.log("hosted deckID:", gameState.deckID)
        
        console.log("Returning the room code: ", returnedRoom);

        ws.send(JSON.stringify({ //sends the room code to zustand
          type: "generatedRoomCode",
          data: returnedRoom,
        }))

      }

      //if teacher has begun the game
      if (userMessage.type === "gameStarted") {
        console.log("Teacher has started the game!")

        gameState.hasStarted = true

        //send that the game has started to all sockets
        websockets.forEach((websocket) => {
          websocket.socket.send(JSON.stringify({
            type: "gameHasBegun",
            data: true,
          }))
        });
        
      }

      //sends deckID to every socket so that students can load questions/answers on their end
      if (userMessage.type === "sendDeckID") {
        //send that the game has started to all sockets
        websockets.forEach((websocket) => {
          websocket.socket.send(JSON.stringify({
            type: "sentDeckID",
            data: gameState.deckID,
          }))
        });
      }

      if (userMessage.type === "studentAnswer"){

        const studentName = userMessage.name;
        const studentAnswer = userMessage.answer;
        const questionID = Number(userMessage.questionID); //convert to int because frontend made it string (probably b/c of json stringify)
        const studentClicks = userMessage.clickCount;
        const currentQuestion = userMessage.currentQuestion;
        const correctness = userMessage.correctness;
        const questionNum = userMessage.questionNum;

        gameState.currentQuestion = currentQuestion;
        console.log("current question: ", gameState.currentQuestion);

        gameState.answers.push({
          studentName,
          studentAnswer,
          questionID,
          studentClicks,
          correctness,
          questionNum,
          currentQuestion,  //adding this here so backend can send allStudentsAnsweredQuestion when all students answered -> should we change this? its redundant
        });

        console.log("student sent in the following game data: ", gameState.answers[gameState.answers.length - 1]);

        //UPDATE: it actually works! but is a little finicky (it keeps previous games' students sometimes)
        //To find if all students have answered:
        let numStudentsWhoAnswered = gameState.answers.filter(function (element) {
          //return the students who have answered the current question
          return element.currentQuestion === gameState.currentQuestion;
        })

        console.log("students who have answered: ", numStudentsWhoAnswered.length)
        console.log("number of students in the room: ", gameState.studentsInRoom.length)
        console.log("students in the room: ", gameState.studentsInRoom)

        if (gameState.studentsInRoom.length == numStudentsWhoAnswered.length){
          console.log("Going to stop the timer now!")
          clearInterval(intervals); //stop the interval cause all students answered
          websockets.forEach((websocket) => {
            websocket.socket.send(JSON.stringify({
              type: "allStudentsAnsweredQuestion",
            }))
          });
          //numStudentsWhoAnswered = 0; need to reset the number of students who answered sometime
        }
      }

      //send students their correctness for their answers
      if (userMessage.type === "correctnessPls") {
        const name = userMessage.data.name;
        const currQNum = userMessage.data.currQNum;

        //finding student's answer correctness (if correct or not)
        //i know this code is yucky looking
        let found = gameState.answers.filter(function (element) {
          if (element.studentName === name && element.questionNum === currQNum) {
            console.log("for question:", currQNum, "student", name, " answer correctness is", element.correctness);
            console.log("found student!");
            return true;
          }
          return false
        })


        //finding if current student answer is correct or incorrect
        //send string to frontend based on what THE determinator finds
        let determinator = "";
        if (found.length === 0) {
          determinator = "failed found";
        }
        else {
          if (found[0].correctness === true){
            determinator = "correct";
          }
          else if (found[0].correctness === false) {
            determinator = "incorrect";
          }
          else {
            determinator = "invalid :(";
          }
        }

        console.log("determinator ->", determinator);

        //send answer correctness to the student socket
        ws.send(JSON.stringify({
          type: "sentAnswerCorrectness",
          data: determinator,
        }))
      }

      if (userMessage.type === "countdownStarted"){ //sent when the timer starts on frontend
        let timeLeft = 30;
        intervals = setInterval(decrementSecond, 1000);
        function decrementSecond () {
          timeLeft -= 1; //decrement the time
          if (timeLeft <= 0){ //means time is up!
            clearInterval(intervals); //stop the interval
            websockets.forEach((websocket) => {
              websocket.socket.send(JSON.stringify({
                type: "timeUp", //send a message to everyone that time is up
                data: true
              }))
            })
          } else { //else means there is still time left on the countdown
            websockets.forEach((websocket) => {
              websocket.socket.send(JSON.stringify({
                type: "newCountdown",
                timeLeft, //return the time left
              }))
            })
          }
        }
      }

      //send to next question
      if (userMessage.type === "sendToNextQuestion"){
        websockets.forEach((websocket) => {
          websocket.socket.send(JSON.stringify({
            type: "sendToNextAnswer"
          }))
        })
      }

      //bonus probability handler
      //sends bonus after bonus is calculated
      if (userMessage.type === "sendBonus") {
        const yourBonus = await bonusDecider(userMessage.name, userMessage.qNum);

        //colored yellow console.log
        console.log(userMessage.name, "got bonus:", yourBonus);

        //send bonus
        ws.send(JSON.stringify({
          type: "sentBonus",
          bonus: yourBonus,
        }))

      }

      //when reading is done -> help route to answerchoices because clicking done
      if (userMessage.type === "completedReading") {
        console.log("recieved message that reading was completed...");
        websockets.forEach((websocket) => {
          websocket.socket.send(JSON.stringify({
            type: "clickingOver"
          }))
        })
      }

      if (userMessage.type === "gameEnded"){
        handleRemoveAll(studentName, type, leavingRoomCode);
        const endSocketGame = websockets.find(user => user.userName === userMessage.name);
        if (endSocketGame){
          endSocketGame.socket.send(JSON.stringify({
            type: "gameHasEnded"
          }))
        }
        // websockets.forEach((websocket) => {
        //   websocket.socket.send(JSON.stringify({
        //     type: "gameHasEnded",
        //     name: userMessage.name
        //   }))
        // })
      }

    });

    ws.on('close', async (code, reason) => {
      handleRemoveAll(studentName, type, leavingRoomCode);
      ws.close();
    });
  });

  app.post("/validRoomCode", async (req, res) => { //used to check if the room code is valid (the students side on front-end)
    const roomCode = req.body.code; //gets the entered room code
    try{
        console.log("Checking if room code is valid");
        //will check if the room code is stored in the database
        const checkRoomCode = `SELECT fld_room_code 
        FROM room_students.tbl_room
        WHERE fld_room_code = $1;`;

        const checkRoomExists = await pool.query(checkRoomCode, [roomCode]);
        console.log("The check room exists return is: ");
        console.log(checkRoomExists);
        if (checkRoomExists.rowCount > 0){ //if there is at least 1 row, that means the room exists
          console.log("Yay the room exists");  
          return res.status(200).json("Room exists!");
        } else {
            return res.status(404).json("Room not found");
        }

    } catch (err){
        res.status(500).json(err)
    }
  });


// -------------------- RUNNING SERVER --------------------------- 
app.listen(port, (error) => {
  //error handling for server connection
  if (!error) {
    //running our server at http://127.0.0.1:5000
    console.log(`Listening at http://localhost:${port}`);
  } else {
    console.log("Server connection error: ", error);
  }
});