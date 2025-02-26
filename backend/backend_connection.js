//setting up the connection to our database!
//is a PostgresSQL database
const {Pool}=require("pg")

//get sensitive data
require("dotenv").config()

//troubleshooting if sensitive data does not exist
if (!process.env.DB_USER) {
    throw new Error("Missing database username.")
}
if (!process.env.DB_HOST) {
    throw new Error("Missing database hostname.")
}
if (!process.env.DB_DB) {
    throw new Error("Missing database name.")
}
if (!process.env.DB_PASSWORD) {
    throw new Error("Missing database password.")
}
if (!process.env.PORT) {
    throw new Error("Missing database port.")
}

//set up database creds
const pool=new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DB,
    password: process.env.DB_PASSWORD,
    port: process.env.PORT,
    //no SSL, but need this to connect to db
    ssl: {
        rejectUnauthorized: false
    }
})

//connecting to database
pool.connect()
.then(()=>{console.log("Connected to Postgres database!")})
//if failed to connect, show error
.catch((error)=>{console.log("Error connecting to database", error)})

//exporting connection for use
module.exports={pool}