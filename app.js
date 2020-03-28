// library imports
const express = require("express");
// enabling easy use of environment variables through a .env file
require("dotenv").config(); // THIS MUST COME BEFORE TWILIO DECLARATION
const cors = require("cors"); // easily manage cors access
const helmet = require("helmet"); // hide server technology being used

// route imports
const smsRoutes = require("./routes/sms-routes.js");

// instantiating server
const app = express();

// middleware
app.use(express.urlencoded({ extended: true })); // learn more about this middleware here: https://expressjs.com/en/5x/api.html#express.urlencoded
app.use(helmet());
app.use(
  cors({
    origin: `${process.env.AUTHORIZED_ORIGIN}`
  })
);

// creating routes
app.use("/sms", smsRoutes); // sms bot routes


// test endpoint to determine status of API
app.get("/", (req, res) => {
    res.status(200).json({ message: "API working!" })
})

module.exports = app;
