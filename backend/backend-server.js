//set up express server
const express=require("express")
const app=express()

//get sensitive data
require("dotenv").config()

//set up bcrypt hashing
const bcrypt = require('bcrypt');
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);

//random port number -> can change if we want something different
const port = 5000

//connect express server to our database connection
const {pool}=require("./backend_connection")

//middleware to handle post and put requests
app.use(express.json())
app.use(express.urlencoded({extended: false}))

//to permit incoming data from frontend
const cors = require("cors")

app.use(cors({
    origin: 'http://localhost:8081',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,

}));


//interacts with the sign in button at /login
//sends 200 status and success JSON file when sign in button is pressed
app.get("/login", (req, res) => {
    try {
        console.log("login-attempt");
        
        res.status(200).json({'message': 'success'})
    }
    catch(error) {
        res.status(500).json(error)
    }
})

//------------------------LOGIN WORK-------------------------------

//root route to avoid "Cannot GET /" in backend terminal
app.get("/", (req, res) => {
    res.send("Server is running!");
});


//sign IN --> checking U&P
app.post("/login", async (req, res) => {
    console.log("Login route hit!"); // Add this
    const {email, password} = req.body; 
    console.log("Login attempt with:", email);

    try {    
        //check if user email in db
        const checkEmailExists = 
        `SELECT fld_login_email, fld_login_pwd 
        FROM login_first.tbl_login
        WHERE fld_login_email = $1;`;
        
        //actually do the query
        const result1 = await pool.query(checkEmailExists, [email]);
        
        if(result1.rowCount == 0){
            return res.status(401).json({ message: "No accounts with this email saved in system." });
        }


        //hash user's entered pwd and compare
        const fromDB = result1.rows[0].fld_login_pwd;
        const samePwd = await bcrypt.compare(password, fromDB);

        if(samePwd){
            res.status(200).json({ message: "Login success!" });
        }
        else{
            res.status(401).json({ message: "Incorrect password." });
        }
    }
    //throw 500 error if any error occurred during or after querying
    catch(error) {
        res.status(500).json(error)
    }
})


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
        res.status(201).json({ message: "Sign-up success" });

    } catch (error) {
        console.error("Error during sign-up:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
});



//------------------------DECK WORK-------------------------------
//creating decks
app.post("/createdecks", async (req, res) => {
    try {
        const {deckTitle, QnA} = req.body
 
        //check if the deck name already exists in the database
        query =
        `SELECT *
         FROM card_decks.tbl_card_decks
         WHERE fld_deck_name = $1;
        `
        const checkDeckExists = await pool.query(query, [deckTitle])

        //if deck exists, return with message saying so
        if (checkDeckExists.rowCount > 0) {
            res.status(400).json({message: "Deck name already exists. Please enter new deck name."})
        }
        //if deck doesn't exist, start saving deck into database
        else {
            query =
            `INSERT INTO card_decks.tbl_card_decks(fld_deck_name)
            VALUES ($1)
            RETURNING fld_deck_id_pk;
            `
            //inserting query into database
            const deckID = await pool.query(query, [deckTitle])

            console.log("Successful deck name insert: ", deckTitle, "deckID: ", deckID.rows[0].fld_deck_id_pk)

            //for every question in deck, and for every answer in question, insert
            for (q of QnA) {
                query = 
                `INSERT INTO card_decks.tbl_card_question(fld_deck_id_fk, fld_card_q)
                VALUES($1, $2)
                RETURNING fld_card_q_pk;
                `
                questionID  = await pool.query(query, [deckID.rows[0].fld_deck_id_pk, q.questionText])

                console.log("successful insert question: ", q.questionText)

                for (ans of q.answers) {
                    query =
                    `INSERT INTO card_decks.tbl_q_ans(fld_card_q_fk, fld_card_ans, fld_ans_correct)
                    VALUES($1, $2, $3)
                    RETURNING *;
                    `
                    //cannot add anything other than 'False' to question correctness for npw
                    insert_all  = await pool.query(query, [questionID.rows[0].fld_card_q_pk, ans, 'FALSE'])
                    console.log("Inserted answer:", ans, "questionID:", questionID.rows[0].fld_card_q_pk)
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


//getting decks for /view-decks
app.get("/view-decks", async (req, res) => {
    try {
        //query for obtaining all decks and their descriptions
        const query = 
        `SELECT fld_deck_id_pk, fld_deck_name, COUNT(*) AS questionCount
         FROM card_decks.tbl_card_decks AS d INNER JOIN card_decks.tbl_card_question AS q
			ON d.fld_deck_id_pk = q.fld_deck_id_fk
         GROUP BY fld_deck_id_pk, fld_deck_name;`

        //wait for query to finalize
        const decks = await pool.query(query)

        console.log(decks.rows)

        //send an 201 (OK) status as for success
        //return query in JSON format
        res.status(201).json(decks.rows)
    }
    //throw 500 error if any error occurred during or after querying
    catch(error) {
        res.status(500).json(error)
    }
})


//getting a deck using an id for /createdecks/:id
app.get("/createdecks/:id", async (req, res) => {
    try {
        //obtaining the deck ID
        const {id} = req.params

        //query for obtaining all decks and their descriptions
        const query = 
        `SELECT fld_deck_name, fld_card_q_pk, fld_card_q, fld_q_ans_pk, fld_card_ans
         FROM card_decks.tbl_q_ans AS a INNER JOIN card_decks.tbl_card_question AS q
	        ON a.fld_card_q_fk = q.fld_card_q_pk
	        INNER JOIN card_decks.tbl_card_decks AS c
		        ON c.fld_deck_id_pk = q.fld_deck_id_fk
         WHERE fld_deck_id_pk = $1;`

        //wait for query to finalize
        const decks = await pool.query(query, [id])

        console.log(decks.rows)

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
app.put("/createdecks/:id", async (req, res) => {
    try {
        const {id} = req.params
        const {deckTitle, QnA} = req.body
 
        //check if the deck name already exists in the database
        query =
        `SELECT *
         FROM card_decks.tbl_card_decks
         WHERE fld_deck_name = $1 AND fld_deck_id_pk != $2;
        `
        const checkDeckExists = await pool.query(query, [deckTitle, id])

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

                for (ans of q.answers) {
                    query =
                    `INSERT INTO card_decks.tbl_q_ans(fld_card_q_fk, fld_card_ans, fld_ans_correct)
                    VALUES($1, $2, $3)
                    RETURNING *;
                    `
                    //cannot add anything other than 'False' to question correctness for npw
                    insert_all  = await pool.query(query, [questionID.rows[0].fld_card_q_pk, ans, 'FALSE'])
                    console.log("Inserted answer:", ans, "questionID:", questionID.rows[0].fld_card_q_pk)
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


// -------------------- FOR FUTURE USE (we will need these) --------------------------- 
//for updating the deck name
app.put("/update_deck/:deckID", async (req, res) => {
    try {
        const {deckID} = req.params
        const {deck_name} = req.body

        //query for updating name of deck
        const query = 
        `UPDATE card_decks.tbl_card_decks
         SET fld_deck_name = $1
         WHERE fld_deck_id_pk = $2
         RETURNING *;
        `
        //execut
        //deck name update
        const update_d_name = await pool.query(query, [deck_name, deckID])
        if (update_d_name.rows.length < 1) {
            res.status(404).json({Error: "Data Not Found"})
        }
        else {
            //return 201 (success insert) if successful
            res.status(201).json(update_d_name)
        }

    }
    //catch errors if they occur
    catch(error) {
        res.status(500).json(error)
    }
})

//for updating the question name
app.put("/update_deck/:deckID/:questionID", async (req, res) => {
    try {
        const {deckID, questionID} = req.params
        const {question_name} = req.body

        //query for updating question name
        const query = 
        `UPDATE card_decks.tbl_card_question
         SET fld_card_q = $1
         WHERE fld_card_q_pk = $2 AND fld_deck_id_fk = $3
         RETURNING *;
        `

        //update question name
        const update_q_name = await pool.query(query, [question_name, questionID, deckID])

        //if query resulted in nothing
        if (update_q_name.rows.length < 1) {
            res.status(404).json({Error: "Data Not Found"})
        }
        else {
            //return 200 (success insert) if successful
            res.status(200).json(update_q_name)
        }

    }
    //catch errors if they occur
    catch(error) {
        res.status(500).json(error)
    }
})

//for updating the answers to a question info
app.put("/update_deck/:deckID/:questionID/:answerID", async (req, res) => {
    try {
        const {deckID, questionID, answerID} = req.params
        const {answer, ifcorrect} = req.body

        //checking to see if the deckID is valid (we don't want orphans in the database)
        const valid_deckID_query =
        `SELECT *
        FROM card_decks.tbl_q_ans AS a INNER JOIN card_decks.tbl_card_question AS q
            ON a.fld_card_q_fk = q.fld_card_q_pk
            INNER JOIN card_decks.tbl_card_decks AS c
                ON c.fld_deck_id_pk = q.fld_deck_id_fk
        WHERE fld_deck_id_pk = $1;`

        //insert our query in here
        const q_a_orphan = await pool.query(valid_deckID_query, [deckID])

        //throw 404 error (Data not found) if deckID is invalid
        if (q_a_orphan.rows.length < 1) {
                    res.status(404).json({Error: "Data Not Found"})
        }
        else {
            //if updating answer correctness (TRUE or FALSE)
            if (!answer) {
                //query for updating answer correctness
                const valid_query = 
                `UPDATE card_decks.tbl_q_ans
                SET fld_ans_correct = $1
                WHERE fld_q_ans_pk = $2 AND fld_card_q_fk = $3
                RETURNING *;
                `
    
                //update answer
                const update_ans = await pool.query(valid_query, [ifcorrect, questionID, answerID])

                //if query empty
                if (update_ans.rows.length < 1) {
                    res.status(404).json({Error: "Data Not Found"})
                }
                else {
                    //return 200 (success insert) if successful
                    res.status(200).json(update_ans)
                }
            }

            //if updating answer text
            if (!ifcorrect) {
                //query for updating answer text
                const valid_query = 
                `UPDATE card_decks.tbl_q_ans
                SET fld_card_ans = $1
                WHERE fld_q_ans_pk = $2 AND fld_card_q_fk = $3 
                RETURNING *;
                `

                //updating answer text
                const update_ans = await pool.query(valid_query, [answer, questionID, answerID])

                //if query resulted in nothing
                if (update_ans.rows.length < 1) {
                    res.status(404).json({Error: "Data Not Found"})
                }
                else {
                    //return 200 (success insert) if successful
                    res.status(200).json(update_ans)
                }
            }
        }

    }
    //catch errors if they occur
    catch(error) {
        res.status(500).json(error)
    }
})


//for deleting an entire deck
app.delete("/decks/:deckID", async (req, res) => {
    try {
        const {deckID} = req.params

        //query deleting an entire deck
        const query = 
        `DELETE FROM card_decks.tbl_card_decks
        WHERE fld_deck_id_pk = $1
        RETURNING *;
        `

        //delete entire deck now
        const delete_deck = await pool.query(query, [deckID])

        //if query resulted in nothing
        if (delete_deck.rows.length < 1) {
            res.status(404).json({Error: "Data Not Found"})
        }
        else {
            //return 204 (successful delete now) if successful
            res.status(204)
        }
    }
    //catch errors if they occur
    catch(error) {
        res.status(500).json(error)
    }
})


//for deleting a question within a deck
app.delete("/decks/:deckID/:questionID", async (req, res) => {
    try {
        const {deckID, questionID} = req.params

        //query deleting an entire question along with its answers
        const query = 
        `DELETE FROM card_decks.tbl_card_question
         WHERE fld_deck_id_fk = $1 AND fld_card_q_pk = $2
         RETURNING *;
        `
  
        //deleteing question
        const delete_q = await pool.query(query, [deckID,  questionID])

        //if query resulted in nothing
        if (delete_q.rows.length < 1) {
            res.status(404).json({Error: "Data Not Found"})
        }
        else {
            //return 204 (successful delete now) if successful
            res.status(204)
        }

    }
    //catch errors if they occur
    catch(error) {
        res.status(500).json(error)
    }
})


//for deleting an answer within a deck
app.delete("/decks/:deckID/:questionID/:answerID", async (req, res) => {
    try {
        const {deckID, questionID, answerID} = req.params

        //checking to see if the deckID is valid (integrity reasons)
        const valid_deckID_query =
        `SELECT *
        FROM card_decks.tbl_q_ans AS a INNER JOIN card_decks.tbl_card_question AS q
            ON a.fld_card_q_fk = q.fld_card_q_pk
            INNER JOIN card_decks.tbl_card_decks AS c
                ON c.fld_deck_id_pk = q.fld_deck_id_fk
        WHERE fld_deck_id_pk = $1;`

        //insert our query in here
        const q_a_orphan = await pool.query(valid_deckID_query, [deckID])

        //throw 404 error (Data not found) if deckID is invalid
        if (q_a_orphan.rows.length < 1) {
                    res.status(404).json({Error: "Data Not Found"})
        }

        else {
            //query deleting an answer within a question of a deck
            const query = 
            `DELETE FROM card_decks.tbl_q_ans
            WHERE fld_q_ans_pk = $1 AND fld_card_q_fk = $2
            RETURNING *;
            `
    
            //query to delete question is oncoming
            const delete_a = await pool.query(query, [answerID, questionID])

            //if query resulted in nothing
            if (delete_a.rows.length < 1) {
                res.status(404).json({Error: "Data Not Found"})
            }
            else {
                //return 204 (successful delete now) if successful
                res.status(204)
            }
        }
    }
    //catch errors if they occur
    catch(error) {
        res.status(500).json(error)
    }
})




//running server
app.listen(port, (error)=> {
    //error handling for server connection
    if (!error) {
        //running our server at http://127.0.0.1:5000
        console.log(`Listening at http://localhost:${port}`)
    }
    else {
        console.log("Server connection error: ", error)
    }
})