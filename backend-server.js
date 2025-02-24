//set up express server
const express=require("express")
const app=express()

//random port number -> can change if we want something different
const port = 5050

//connect express server to our database connection
const {pool}=require("./backend_connection")

//middleware to handle post and put requests
app.use(express.json())
app.use(express.urlencoded({extended: false}))

//some page on Tappt (possibly homepage, idk yet)
app.get("/", (req, res) => {
    res.send("some page of Tappt...")
})

//getting decks (without the cards)
app.get("/decks", async (req, res) => {
    try {
        //query for obtaining all decks and their descriptions
        const query = 
        `SELECT fld_deck_name, fld_deck_desc 
        FROM card_decks.tbl_card_decks;`

        //wait for query to finalize
        const decks = await pool.query(query)

        //send an 200 (OK) status as for success
        //return query in JSON format
        res.status(201).json(decks)
    }
    //throw 500 error if any error occurred during or after querying
    catch(error) {
        res.status(500).json(error)
    }
})

//getting card information on an individual deck
app.get("/decks/:deckID", async (req, res) => {
    try {
        const {deckID} = req.params

        //query to find all questions within a deck with their respective answers
        const query =
        `SELECT fld_card_q, fld_card_ans, fld_ans_correct
        FROM card_decks.tbl_q_ans AS a INNER JOIN card_decks.tbl_card_question AS q
	            ON a.fld_card_q_fk = q.fld_card_q_pk
	            INNER JOIN card_decks.tbl_card_decks AS c
		            ON c.fld_deck_id_pk = q.fld_deck_id_fk
        WHERE fld_deck_id_pk = $1;`

        //insert query into database
        const deck_info = await pool.query(query, [deckID])

        //throw 404 error (Data not found) if deck user is looking for is invalid
        if (deck_info.rows.length < 1) {
            res.status(404).json({Error: "Data Not Found"})
        }
        //else, return all cards within a deck
        else {
            res.status(201).json(deck_info)
        }       

    }
    //if any error occurred during or after querying, return 500
    catch(error) {
        res.status(500).json(error)
    }
})

//for creating deck names
app.post("/create_deck", async (req, res) => {
    try {
        const {deck_name} = req.body
 
        //query
        const query =
        `INSERT INTO card_decks.tbl_card_decks(fld_deck_name)
         VALUES ($1)
         RETURNING *;
        `
        //inserting query into database
        const deck_name_insert = await pool.query(query, [deck_name])

        //if success, will insert and return with 201 code (successful insert)
        res.status(201).json(deck_name_insert)
    }
    //if failed to insert or really any error pops up
    catch(error) {
        res.status(500).json(error)
    }
})

//for creating questions to an associated deck
app.post("/create_deck/:deckID", async (req, res) => {
    try {
        //obtaining url parameters and request body
        const {deckID} = req.params
        const {card_question} = req.body

        //insertion query
        const query =
        `INSERT INTO card_decks.tbl_card_question(fld_deck_id_fk, fld_card_q)
        VALUES ($1, $2)
        RETURNING *;
        `
        //inserting deckID and question into a card
        const deck_q_insert = await pool.query(query, [deckID, card_question])

        //return 201 (success insert) if successful
        res.status(201).json(deck_q_insert)

    }
    //catch errors if they occur
    catch(error) {
        res.status(500).json(error)
    }
})

//for creating answers to question
app.post("/create_deck/:deckID/:questionID", async (req, res) => {
    try {
        const {deckID, questionID} = req.params
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
        //if the URL has a valid deckID, we shall continue
        else {
            //inserting answer info and questionID into database (attempting to anyway)
            const insert_query =
            `INSERT INTO card_decks.tbl_q_ans(fld_card_q_fk, fld_card_ans, fld_ans_correct)
            VALUES ($1, $2, $3)
            RETURNING *;
            `
            //implent the query
            const q_a_insert = await pool.query(insert_query, [questionID, answer, ifcorrect])


            //throw 404 error (Data not found) question and ans is invalid
            if (q_a_insert.rows.length < 1) {
                res.status(404).json({Error: "Data Not Found"})
            }
            else {
                //return 201 (success insert) if successful
                res.status(201).json(q_a_insert)
            }
        }
    }
    //catch errors if they occur
    catch(error) {
        res.status(500).json(error)
    }
})

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
        //running our server at http://127.0.0.1:5050
        console.log("Listening at http://localhost:${port}")
    }
    else {
        console.log("Server connection error: ", error)
    }
})