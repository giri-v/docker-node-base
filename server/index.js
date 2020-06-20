const express = require("express");
const morgan = require("morgan");
const logger = require("./logger");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//////////////////////////////////////////////////////
//
//  ALL USER requires HERE
//
//////////////////////////////////////////////////////

const MongoClient = require('mongodb').MongoClient;
// this example includes a connection to MongoDB

const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DATABASE_NAME
} = process.env;

// Connection URL
const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}`;

// Create a new MongoClient
const client = new MongoClient(url);

let db;
// Connect to database
//database.connect();

// Use connect method to connect to the Server
setTimeout(() => {
  client.connect(function (err) {
    if (err) {
      return console.error(err);
    }
    console.log("Connected successfully to database");
    db = client.db(MONGO_DATABASE_NAME);
  });
}, 2000);



//const database = require('./database');
const api = require("./api/v1");


// Initialize Express app
const app = express();

// Setup logging stream object
const stream = {
  write: (message) => {
    logger.info(message);
  },
};

var angularDir = __dirname.replace("server", "client") + "/app";

app.use(cors());
// Setup middleware with logging to stream object
app.use(morgan("combined", { stream }));

// parse application/x-www-form-urlencoded
// Need this to extract username/password from login form
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
// Need this to parse initial token (I think)
app.use(bodyParser.json());

app.use(cookieParser());


//////////////////////////////////////////////////////
//
//  ALL USER CODE HERE
//
//////////////////////////////////////////////////////

// Setup router and routes
app.route("/")
  .get(express.static(angularDir));
app.use("/", express.static(angularDir), api);
app.use("/api/v1", api); // To allow API version support








/////////////////////////////////////
// DOCKER HEALTHCHECK
/////////////////////////////////////
app.get('/healthz', function (req, res) {
  // do app logic here to determine if app is truly healthy
  // you should return 200 if healthy, and anything else will fail
  // if you want, you should be able to restrict this to localhost (include ipv4 and ipv6)
  res.send('I am happy and healthy\n');
});


/////////////////////////////////////
// ERROR HANDLING
////////////////////////////////////

// Handle middleware errors
app.use((req, res, next) => {
  const message = "Resource not found" + req.originalUrl;
  logger.warn(message);
  res.status(404);
  res.json({
    error: true,
    message
  });
});

app.use((err, req, res, next) => {
  let { statusCode = 500 } = err;
  const { message } = err;

  // Validation Errors
  if (err.message.startsWith("ValidationError")) {
    statusCode = 422;
  }

  logger.error(`Error: ${message}`);
  res.status(statusCode);
  res.json({
    error: true,
    statusCode,
    message
  });
});

module.exports = app;
