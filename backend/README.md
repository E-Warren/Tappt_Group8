BACKEND GAME CARDS CODE DEPENDECIES:
Node.js:
- installed via the internet
Database connection dependecies: PostgresSQL, nodemon
- Installation:
  + type "npm i nodemon pg" into the terminal
Server dependencies: Express.js, cors
- Installation: 
  + type "npm i express" into the terminal for express
  + type "npm i cors" for cors
  + npm install body-parser (Only for google login)

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

